import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Chat, Message, Status, Lead, AppContextType, NotificationType , FileData} from '../types';
import { supabase } from '../../data/supabaseClient';
import { LeadService } from '../services/leadService';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Authenticated user will be mapped from Supabase session

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedChatNumber, setSelectedChatNumber] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications] = useState<NotificationType[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<string>('en');
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasSubscription: boolean;
    isActive: boolean;
    status: string | null;
    redirectTo: string | null;
  } | null>(null);

  // Theme and language management
  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }

    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document and save to localStorage
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Check subscription status (single-subscription system; userId ignored)
  const checkUserSubscription = async (_userId: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE}/api/payments/subscription-status`);
      
      if (!response.ok) {
        console.error('Failed to check subscription status');
        return null;
      }
      
      const data = await response.json();
      setSubscriptionStatus(data);
      return data;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return null;
    }
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    const mapAndSetUser = async (sessionUser: any | null) => {
      if (sessionUser) {
        const nameFromMeta = (sessionUser.user_metadata?.full_name as string) || (sessionUser.user_metadata?.name as string) || sessionUser.email || 'User';
        const phoneFromMeta = (sessionUser.user_metadata?.phone as string) || '';
        const avatarFromMeta = (sessionUser.user_metadata?.avatar_url as string) || undefined;
        const mapped: User = {
          id: sessionUser.id,
          name: nameFromMeta,
          phone: phoneFromMeta,
          avatar: avatarFromMeta,
          isOnline: true,
          lastSeen: new Date()
        };
        setCurrentUser(mapped);
        setIsAuthenticated(true);
        
        // Check subscription status for authenticated user
        await checkUserSubscription(sessionUser.id);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setSubscriptionStatus(null);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      mapAndSetUser(data?.session?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      mapAndSetUser(session?.user ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Build chats and messages from API data
  useEffect(() => {
    // Clear any existing dummy state
    setChats([]);
    setMessages([]);
    setSelectedChat(null);

    if (!currentUser) {
      return;
    }

    const load = async () => {
      // Use the production table that stores WhatsApp chat data
      const TABLE_NAME = 'luvix_hoichat_app';

      // Load all columns ordered by the most recent timestamp to ensure newest messages are processed last
      const { data: records, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('wp_created_at', { ascending: false })
        .order('luvix_created_at', { ascending: false });

      if (error) {
        if (import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.error(`[Supabase] Load error from ${TABLE_NAME}:`, error);
        }
        return;
      }
      if (!Array.isArray(records)) {
        // eslint-disable-next-line no-console
        console.warn('[Supabase] Unexpected response from table load:', records);
        return;
      }
      if (import.meta.env.MODE === 'development') {
        // eslint-disable-next-line no-console
        console.log(`[Supabase] Loaded ${records.length} rows`, records[0] ? { sampleKeys: Object.keys(records[0]) } : {});
      }

      // Prepare contact maps
      const latestTimeById = new Map<string, Date>();
      const nameById = new Map<string, string>();
      const userById = new Map<string, User>();

      // Normalize records to the new schema
      type NormalizedRecord = {
        id: string; // phone/whatsapp id
        profile_name?: string; // derived from wp_user_profilename (json or text)
        wp_created_at?: Date; // user's message time
        wp_user_msg?: unknown; // user's message
        luvix_created_at?: Date; // bot's message time
        luvix_msg_type?: string; // text | image | video | document
        luvix_msg?: unknown; // bot's message
        wp_user_msg_file?: unknown; // attachment info
        luvix_read?: boolean; // whether the user's message has been read in app
      };

      const normalized: NormalizedRecord[] = records
        .map((raw: any): NormalizedRecord | null => {
          // Exact mapping to your table columns
          const idVal = raw.id;
          if (idVal == null) return null;
          const idStr = String(idVal);

          // wp_user_profilename is JSON in DB; can be a string or object
          let profileName: string | undefined;
          const rawProfile = raw.wp_user_profilename ?? raw.profile_name;
          if (typeof rawProfile === 'string') {
            profileName = rawProfile;
          } else if (rawProfile && typeof rawProfile === 'object') {
            profileName = (rawProfile.name as string) || (rawProfile.full_name as string) || String(rawProfile);
          }

          const userCreatedAt = raw.wp_created_at ? new Date(raw.wp_created_at) : undefined;
          const botCreatedAt = raw.luvix_created_at ? new Date(raw.luvix_created_at) : undefined;

          const userMsg = raw.wp_user_msg ?? raw.user_message; // JSON; may be string or object
          const botMsg = raw.luvix_msg ?? raw.bot_message;      // JSON; may be string or object/null
          const botType = ((): string | undefined => {
            const t = raw.luvix_msg_type;
            if (typeof t === 'string') return t;
            if (t && typeof t === 'object' && typeof t.type === 'string') return String(t.type);
            return undefined;
          })();

          return {
            id: idStr,
            profile_name: profileName,
            wp_created_at: userCreatedAt,
            wp_user_msg: userMsg,
            luvix_created_at: botCreatedAt,
            luvix_msg_type: botType,
            luvix_msg: botMsg,
            wp_user_msg_file: raw.wp_user_msg_file,
            luvix_read: Boolean(raw.luvix_read),
          };
        })
        .filter((r: NormalizedRecord | null): r is NormalizedRecord => r !== null)
        // Keep original order; per-message timestamps will be considered below
        ;

      // Build users and latest time
      for (const r of normalized) {
        const contactId = r.id;
        const createdAtCandidates = [r.wp_created_at, r.luvix_created_at].filter(Boolean) as Date[];
        const mostRecent = createdAtCandidates.length > 0 ? new Date(Math.max(...createdAtCandidates.map(d => d.getTime()))) : new Date();
        const name = r.profile_name || contactId;

        if (!latestTimeById.has(contactId) || mostRecent > (latestTimeById.get(contactId) as Date)) {
          latestTimeById.set(contactId, mostRecent);
          nameById.set(contactId, name);
        }
        if (!userById.has(contactId)) {
          userById.set(contactId, {
            id: contactId,
            name,
            phone: contactId,
            isOnline: false,
            lastSeen: mostRecent,
          });
        }
      }

      // Build chats
      let chatsFromApi: Chat[] = Array.from(latestTimeById.entries())
        .sort((a, b) => b[1].getTime() - a[1].getTime())
        .map(([contactId]) => ({
          id: `lead-${contactId}`,
          type: 'individual' as const,
          participants: [currentUser, userById.get(contactId)!],
          unreadCount: 0,
          isActive: true,
        }));

      // Build messages and lastMessage per chat
      const builtMessages: Message[] = [];
      const messagesByChat = new Map<string, Message[]>();
      const unreadCountByChat = new Map<string, number>();
      const seen = new Set<string>();

      for (let idx = 0; idx < normalized.length; idx++) {
        const r = normalized[idx];
        const chatId = `lead-${r.id}`;
        const syntheticUser = userById.get(r.id)!;

        const userContent = ((): string => {
          const u = r.wp_user_msg as unknown;
          if (u && typeof u === 'object' && (u as any).body) return String((u as any).body);
          if (typeof u === 'string') return u;
          return '';
        })();

        const botContent = ((): string => {
          const b = r.luvix_msg as unknown;
          if (b && typeof b === 'object' && (b as any).body) return String((b as any).body);
          if (b == null) return '';
          if (typeof b === 'string') return b;
          try { return String(b); } catch { return ''; }
        })();

        // Create a message for the user (external) if present
        // Include messages that have file data even if no text content
        if ((userContent || r.wp_user_msg_file) && r.wp_created_at) {
          const uid = `ext-${idx}-u-${r.wp_created_at.toISOString()}`;
          if (!seen.has(uid)) {
            seen.add(uid);
            
            // Determine message type and file data
            let messageType: Message['type'] = 'text';
            let fileData: FileData | undefined = undefined;
            
            // Check if there's file data
            if (r.wp_user_msg_file) {
              // Debug: Log the file data structure
              if (import.meta.env.MODE === 'development') {
                console.log('[File Data Debug]', {
                  id: r.id,
                  fileData: r.wp_user_msg_file,
                  type: typeof r.wp_user_msg_file
                });
              }
              
              // Handle different file data formats
              if (typeof r.wp_user_msg_file === 'string') {
                // Direct URL string
                fileData = { url: r.wp_user_msg_file };
                // Try to determine type from URL
                const url = r.wp_user_msg_file;
                if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp') || url.includes('.svg')) {
                  messageType = 'image';
                } else if (url.includes('.mp4') || url.includes('.avi') || url.includes('.mov') || url.includes('.wmv') || url.includes('.flv') || url.includes('.webm')) {
                  messageType = 'video';
                } else if (url.includes('.pdf') || url.includes('.doc') || url.includes('.docx') || url.includes('.txt') || url.includes('.xls') || url.includes('.xlsx')) {
                  messageType = 'document';
                }
              } else if (typeof r.wp_user_msg_file === 'object' && r.wp_user_msg_file !== null) {
                // Object format
                fileData = r.wp_user_msg_file as FileData;
                // Try to determine type from file data
                const fileName = fileData.filename || fileData.name || '';
                const fileExt = fileName.split('.').pop()?.toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt || '')) {
                  messageType = 'image';
                } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExt || '')) {
                  messageType = 'video';
                } else if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(fileExt || '')) {
                  messageType = 'document';
                }
              }
            }
            
            const m: Message = {
              id: uid,
              senderId: syntheticUser.id,
              recipientId: currentUser.id,
              content: userContent || (fileData ? `📎 ${messageType}` : ''),
              type: messageType,
              timestamp: r.wp_created_at,
              status: r.luvix_read ? 'read' : 'delivered',
              fileData: fileData,
            };
            builtMessages.push(m);
            // Collect all messages for this chat
            if (!messagesByChat.has(chatId)) {
              messagesByChat.set(chatId, []);
            }
            messagesByChat.get(chatId)!.push(m);

            // Track unread counts (only count external messages that are not read)
            if (m.status !== 'read') {
              unreadCountByChat.set(
                chatId,
                (unreadCountByChat.get(chatId) || 0) + 1
              );
            }
          }
        }

        // Create a message for the bot (our side) if present
        if (botContent && r.luvix_created_at) {
          const bid = `ext-${idx}-b-${r.luvix_created_at.toISOString()}`;
          if (!seen.has(bid)) {
            seen.add(bid);
            const inferredType = ((): Message['type'] => {
              const t = r.luvix_msg_type?.toLowerCase?.();
              if (t === 'image' || t === 'video' || t === 'document') return t as Message['type'];
              return 'text';
            })();
            const m: Message = {
              id: bid,
              senderId: currentUser.id,
              recipientId: syntheticUser.id,
              content: botContent,
              type: inferredType,
              timestamp: r.luvix_created_at,
              status: 'read',
            };
            builtMessages.push(m);
            // Collect all messages for this chat
            if (!messagesByChat.has(chatId)) {
              messagesByChat.set(chatId, []);
            }
            messagesByChat.get(chatId)!.push(m);
          }
        }
      }

      // Ensure chronological order in the UI
      builtMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Find the newest message for each chat
      const lastMessageByChat = new Map<string, Message>();
      for (const [chatId, messages] of messagesByChat.entries()) {
        if (messages.length > 0) {
          // Sort messages by timestamp and get the newest one
          const sortedMessages = messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          lastMessageByChat.set(chatId, sortedMessages[0]);
        }
      }

      chatsFromApi = chatsFromApi.map((c) => ({
        ...c,
        lastMessage: lastMessageByChat.get(c.id),
        unreadCount: unreadCountByChat.get(c.id) || 0,
      }));

      setChats(chatsFromApi);
      setMessages(builtMessages);
    };

    // initial load
    load();

    // refresh every 1 minute
    const intervalId = setInterval(load, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [currentUser]);

  const sendMessage = (content: string, type: Message['type'] = 'text', mediaUrl?: string) => {
    if (!selectedChat || !currentUser) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      recipientId: selectedChat.type === 'individual' ? selectedChat.participants.find(p => p.id !== currentUser.id)?.id : undefined,
      groupId: selectedChat.type === 'group' ? selectedChat.id : undefined,
      content,
      type,
      timestamp: new Date(),
      status: 'sent',
      mediaUrl
    };

    setMessages(prev => [...prev, newMessage]);

    // Update last message in chat
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: newMessage }
        : chat
    ));

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, status: 'delivered' }
          : msg
      ));
    }, 1000);
  };

  const sendBroadcastMessage = (content: string, chatIds: string[], type: Message['type'] = 'text', mediaUrl?: string) => {
    if (!currentUser || chatIds.length === 0) return;

    const newMessages: Message[] = [];
    const chatUpdates: { [key: string]: Message } = {};

    // Create messages for each selected chat
    chatIds.forEach((chatId, index) => {
      const chat = chats.find(c => c.id === chatId);
      if (chat && chat.type === 'individual') {
        const otherParticipant = chat.participants.find(p => p.id !== currentUser.id);
        if (otherParticipant) {
          const newMessage: Message = {
            id: `broadcast-${Date.now()}-${index}-${chatId}`,
            senderId: currentUser.id,
            recipientId: otherParticipant.id,
            content,
            type,
            timestamp: new Date(),
            status: 'sent',
            mediaUrl
          };

          newMessages.push(newMessage);
          chatUpdates[chatId] = newMessage;
        }
      }
    });

    // Add all messages to the messages state
    setMessages(prev => [...prev, ...newMessages]);

    // Update last message for each affected chat
    setChats(prev => prev.map(chat => 
      chatUpdates[chat.id] 
        ? { ...chat, lastMessage: chatUpdates[chat.id] }
        : chat
    ));

    // Simulate message delivery for all broadcast messages
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        newMessages.some(newMsg => newMsg.id === msg.id)
          ? { ...msg, status: 'delivered' }
          : msg
      ));
    }, 1000);

    // Log broadcast for debugging
    console.log(`Broadcast message sent to ${chatIds.length} contacts:`, content);
  };

  const markAsRead = (chatId: string) => {
    // Optimistically update local state
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0 }
        : chat
    ));

    // Identify the external participant for this chat
    const targetChat = chats.find(c => c.id === chatId);
    const otherId = targetChat?.participants.find(p => p.id !== currentUser?.id)?.id;

    setMessages(prev => prev.map(msg => {
      const isIncomingForThisChat =
        otherId != null &&
        msg.senderId === otherId &&
        msg.recipientId === currentUser?.id;
      return isIncomingForThisChat ? { ...msg, status: 'read' } : msg;
    }));

    // Persist to backend (service role) to update Supabase regardless of RLS
    (async () => {
      try {
        if (!otherId) return;
        // Primary: call backend endpoint which uses service role.
        // Support numeric IDs by sending both variants in backend (handled there).
        await fetch(`/api/chats/${encodeURIComponent(otherId)}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});

        // Fallback: attempt direct client update when backend is unavailable
        const TABLE_NAME = 'luvix_hoichat_app';
        const isNumeric = /^\d+$/.test(otherId);
        let query = supabase
          .from(TABLE_NAME)
          .update({ luvix_read: true })
          .eq('luvix_read', false);
        query = isNumeric ? query.eq('id', Number(otherId)) : query.eq('id', otherId);
        await query;
      } catch {
        // ignore errors in background write; UI already updated
      }
    })();
  };

  const createGroup = (name: string, participants: User[]) => {
    if (!currentUser) return;

    const newGroup: Chat = {
      id: `g${Date.now()}`,
      type: 'group',
      name,
      participants: [currentUser, ...participants],
      unreadCount: 0,
      isActive: true
    };

    setChats(prev => [newGroup, ...prev]);
  };

  const postStatus = (content: string, type: Status['type'] = 'text', mediaUrl?: string) => {
    if (!currentUser) return;

    const newStatus: Status = {
      id: `s${Date.now()}`,
      userId: currentUser.id,
      content,
      type,
      mediaUrl,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      viewers: [],
      privacy: 'all'
    };

    setStatuses(prev => [newStatus, ...prev]);
  };

  const deleteStatus = (statusId: string) => {
    setStatuses(prev => prev.filter(status => status.id !== statusId));
  };

  // Load leads from database when user is authenticated
  useEffect(() => {
    const loadLeads = async () => {
      try {
        const userLeads = await LeadService.getLeads();
        setLeads(userLeads);
      } catch (error) {
        console.error('Error loading leads:', error);
      }
    };

    loadLeads();
  }, []);

  // Lead management functions
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newLead = await LeadService.createLead(leadData);
      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  };

  const updateLead = async (id: string, leadData: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedLead = await LeadService.updateLead(id, leadData);
      setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
      return updatedLead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await LeadService.deleteLead(id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  };

  // Update selectedChatNumber when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      // Update selectedChatNumber when selectedChat changes
      const otherParticipant = selectedChat.participants.find(p => p.id !== currentUser?.id);
      if (otherParticipant) {
        setSelectedChatNumber(otherParticipant.phone);
      } else {
        setSelectedChatNumber(selectedChat.name || '');
      }
    } else {
      setSelectedChatNumber('');
    }
  }, [selectedChat, currentUser?.id]);

  const value: AppContextType = {
    currentUser,
    chats,
    selectedChat,
    selectedChatNumber,
    messages,
    statuses,
    leads,
    isAuthenticated,
    notifications,
    showProfile,
    theme,
    language,
    subscriptionStatus,
    setCurrentUser,
    setSelectedChat,
    setSelectedChatNumber,
    setShowProfile,
    toggleTheme,
    changeLanguage,
    sendMessage,
    sendBroadcastMessage,
    markAsRead,
    createGroup,
    postStatus,
    deleteStatus,
    addLead,
    updateLead,
    deleteLead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
