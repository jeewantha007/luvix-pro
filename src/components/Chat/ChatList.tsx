import React, { useEffect, useState } from 'react';
import { Search, MessageCircle, Bot, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Chat, User } from '../../types';
import { supabase } from '../../../data/supabaseClient';
import logo from '../../assets/logo.png';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { getTranslation } from '../../utils/translations';

interface ChatListProps {
  onShowBroadcast: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onShowBroadcast }) => {
  const { chats, selectedChat, setSelectedChat, currentUser, language } = useApp();
  const isMobile = useIsMobile();
  
  const t = (key: string) => getTranslation(language, key);

  const getOtherParticipant = (chat: Chat): User | null => {
    if (chat.type === 'group') return null;
    return chat.participants.find(p => p.id !== currentUser?.id) || null;
  };

  const formatTime = (date: Date) => {
    const tz = 'Asia/Colombo';
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { timeZone: tz });
    const msgStr = date.toLocaleDateString('en-US', { timeZone: tz });

    if (msgStr === todayStr) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: tz,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: tz,
      });
    }
  };

  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const TABLE = 'lumix_status';
        const COLUMN = 'lumix_active';

        const res = await supabase
          .from(TABLE)
          .select(COLUMN)
          .limit(1)
          .maybeSingle();

        if (res.error) {
          if (import.meta.env.MODE === 'development') {
            // eslint-disable-next-line no-console
            console.warn('[Supabase] Failed to load status:', res.error.message);
          }
          return;
        }
        setAiEnabled(Boolean((res.data as { [key: string]: unknown })?.[COLUMN]));
      } catch {
        // ignore
      }
    };
    fetchStatus();
  }, []);

  const toggleAi = async () => {
    
    const next = !aiEnabled;
    const prev = aiEnabled;
    setAiEnabled(next);
    setIsSaving(true);
    try {
      const TABLE = 'lumix_status';
      const COLUMN = 'lumix_active';
      // Primary attempt: precise WHERE on previous value
      const res = await supabase
        .from(TABLE)
        .update({ [COLUMN]: next })
        .eq(COLUMN, prev)
        .select();

      const error = res.error;

      if (!error && (!res.data || res.data.length === 0)) {
        // Fallback: update any non-null row
        const fb = await supabase
          .from(TABLE)
          .update({ [COLUMN]: next })
          .not(COLUMN, 'is', null)
          .select();
        if (fb.error && import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.error('[Supabase] Failed to save status (fallback):', fb.error.message);
        }
      }

      if (error && import.meta.env.MODE === 'development') {
        // eslint-disable-next-line no-console
        console.error('[Supabase] Failed to save status:', error.message);
      }

      // Verify and sync local state with DB
      try {
        const check = await supabase
          .from(TABLE)
          .select(COLUMN)
          .limit(1)
          .maybeSingle();
        if (!check.error) {
          setAiEnabled(Boolean((check.data as { [key: string]: unknown })?.[COLUMN]));
        }
      } catch {
        // ignore
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          {isMobile ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                  <img src={logo} alt="Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                </div>
                <div className="text-black dark:text-white text-sm md:text-base font-medium">{t('chatList.brandName')}</div>
              </div>
              <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center text-xs text-gray-700 dark:text-gray-300 select-none">
                    <Bot className={`w-3 h-3 mr-1 ${aiEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    {t('chatList.ai')}
                  </span>
                <button
                  role="switch"
                  aria-checked={aiEnabled}
                  onClick={toggleAi}
                  disabled={isSaving}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${aiEnabled ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'} ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                  title={`${aiEnabled ? t('chatList.aiMessagingOn') : t('chatList.aiMessagingOff')}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('chatList.title')}</h1>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300 select-none">
                  <Bot className={`w-4 h-4 mr-1 ${aiEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  {t('chatList.ai')}
                </span>
                <button
                  role="switch"
                  aria-checked={aiEnabled}
                  onClick={toggleAi}
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${aiEnabled ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'} ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                  title={`${aiEnabled ? t('chatList.aiMessagingOn') : t('chatList.aiMessagingOff')}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder={t('chatList.searchConversations')}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Broadcast Button */}
        <div className="mt-3">
          <button
            onClick={onShowBroadcast}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{t('chatList.broadcastMessage')}</span>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center">
            <div className=" bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">{t('chatList.noConversationsYet')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{t('chatList.startNewChatToConnect')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {chats
              .sort((a, b) => {
                // Sort by last message timestamp (newest first)
                const aTime = a.lastMessage?.timestamp?.getTime() || 0;
                const bTime = b.lastMessage?.timestamp?.getTime() || 0;
                return bTime - aTime;
              })
              .map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const displayName = chat.type === 'group' ? chat.name : otherUser?.name;
              const displayAvatar = chat.type === 'group' ? chat.avatar : otherUser?.avatar;
              const isActive = selectedChat?.id === chat.id;

              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${isActive ? 'bg-green-50 dark:bg-green-900/20 border-r-4 border-green-500 dark:border-green-400' : ''
                    }`}
                >
                  <div className="flex items-start space-x-2 md:space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {displayAvatar ? (
                        <img
                          src={displayAvatar}
                          alt={displayName}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-300 font-medium text-sm md:text-base">
                            {displayName?.charAt(0)?.toUpperCase()}
                          </span>
                       
                        </div>
                      )}

                      {chat.type === 'individual' && otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate text-sm md:text-base max-w-[60%] ${isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'
                          }`}>
                          {displayName}
                        </h3>
                   
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 md:ml-2 flex-shrink-0">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate max-w-[70%]">
                          {chat.lastMessage?.content ? (chat.lastMessage.content.length > 40 ? chat.lastMessage.content.substring(0, 40) + '...' : chat.lastMessage.content) : t('chatList.noMessagesYet')}
                        </p>

                        {chat.unreadCount > 0 && (
                          <div className="ml-1 md:ml-2 flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-4 h-4 md:w-5 md:h-5 text-xs font-bold text-white bg-green-500 dark:bg-green-600 rounded-full">
                              {chat.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;