import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  Image,
  User as UserIcon,
  FileText,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Message, User, FileData } from '../../types';
import MediaView from './MediaView';
import ContactInfo from './ContactInfo';
import { getTranslation } from '../../utils/translations';
import { supabase } from '../../../data/supabaseClient';

const ChatWindow: React.FC = () => {
  const { selectedChat, messages, sendMessage, currentUser, markAsRead, setSelectedChat, language } = useApp();
  const t = (key: string) => getTranslation(language, key);

  // Helper function to get the proper URL for file data
  const getFileUrl = (fileData: FileData): string | null => {
    // If there's already a URL, use it
    if (fileData.url) {
      return fileData.url;
    }
    
    // If there's a filename, try to construct the URL from Supabase storage
    if (fileData.filename || fileData.name) {
      const fileName = fileData.filename || fileData.name;
      // Try different bucket names as in MediaView
      const bucketNames = ['lumix_hoi_wp_db', 'lumix-hoi-wp_db', 'lumix_hoi_wpmsg_files'];
      
      for (const bucketName of bucketNames) {
        try {
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(`luvix_hoi_wpmsg_files/${fileName}`);
          return publicUrl;
        } catch (error) {
          console.warn(`Failed to get URL from bucket ${bucketName}:`, error);
          continue;
        }
      }
    }
    
    return null;
  };
  const [newMessage, setNewMessage] = useState('');
  const isInputDisabled = true;
  const [isTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(30);
  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);
  const prevScrollHeightRef = useRef<number>(0);
  const preventAutoScrollRef = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'media' | 'contact'>('chat');

  const getOtherParticipant = (): User | null => {
    if (!selectedChat || selectedChat.type === 'group') return null;
    return selectedChat.participants.find(p => p.id !== currentUser?.id) || null;
  };

  const chatMessages = messages.filter(msg => 
    (selectedChat?.type === 'individual' && 
     ((msg.senderId === currentUser?.id && msg.recipientId === getOtherParticipant()?.id) ||
      (msg.recipientId === currentUser?.id && msg.senderId === getOtherParticipant()?.id))) ||
    (selectedChat?.type === 'group' && msg.groupId === selectedChat.id)
  );

  // Debug: Log all messages and filtering
  if (import.meta.env.MODE === 'development') {
    console.log('[Message Filtering Debug]', {
      totalMessages: messages.length,
      selectedChat: selectedChat?.id,
      currentUser: currentUser?.id,
      otherParticipant: getOtherParticipant()?.id,
      filteredMessages: chatMessages.length,
      messagesWithFiles: messages.filter(msg => msg.fileData).length,
      filteredMessagesWithFiles: chatMessages.filter(msg => msg.fileData).length
    });
  }

  // Debug: Log messages with file data
  if (import.meta.env.MODE === 'development') {
    const messagesWithFiles = chatMessages.filter(msg => msg.fileData);
    if (messagesWithFiles.length > 0) {
      console.log('[Chat Messages with Files]', messagesWithFiles.map(msg => ({
        id: msg.id,
        type: msg.type,
        fileData: msg.fileData,
        senderId: msg.senderId,
        recipientId: msg.recipientId
      })));
    }
  }

  const sortedChatMessages = [...chatMessages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Add test message with file data for debugging
  if (import.meta.env.MODE === 'development' && sortedChatMessages.length === 0) {
    const testMessage: Message = {
      id: 'test-message',
      senderId: 'test-user',
      recipientId: currentUser?.id || 'current-user',
      content: 'Test image message',
      type: 'image',
      timestamp: new Date(),
      status: 'read',
      fileData: {
        url: 'https://jdlgrauoczgfbwkzelar.supabase.co/storage/v1/object/sign/lumix_hoi_wp_db/luvix_hoi_wpmsg_files/94778072233-1755754345-File.jpg'
      }
    };
    sortedChatMessages.push(testMessage);
  }
  
  const initialCount = 30;
  const pageSize = 20;
  const effectiveCount = Math.min(visibleCount, sortedChatMessages.length);
  const visibleMessages = sortedChatMessages.slice(Math.max(0, sortedChatMessages.length - effectiveCount));

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChat || isInputDisabled) return;
    
    sendMessage(newMessage.trim(), 'text');
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Colombo',
    });
  };

  const formatDateDivider = (date: Date) => {
    const tz = 'Asia/Colombo';
    const todayStr = new Date().toLocaleDateString('en-US', { timeZone: tz });
    const msgStr = new Date(date).toLocaleDateString('en-US', { timeZone: tz });

    if (msgStr === todayStr) return t('chat.today');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toLocaleDateString('en-US', { timeZone: tz });
    if (msgStr === yStr) return t('chat.yesterday');

    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: tz,
    });
  };

  const shouldShowDateDivider = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const tz = 'Asia/Colombo';
    const currentStr = new Date(currentMsg.timestamp).toLocaleDateString('en-US', { timeZone: tz });
    const prevStr = new Date(prevMsg.timestamp).toLocaleDateString('en-US', { timeZone: tz });
    return currentStr !== prevStr;
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!preventAutoScrollRef.current) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // reset the flag after render cycle
    if (preventAutoScrollRef.current) {
      preventAutoScrollRef.current = false;
    }
  }, [sortedChatMessages.length]);

  // When switching chats, reset visible window and scroll to bottom
  useEffect(() => {
    setVisibleCount(initialCount);
    // allow auto scroll on new chat
    preventAutoScrollRef.current = false;
    // slight delay to allow list render
    const id = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id]);

  // Preserve scroll position when loading older messages
  useEffect(() => {
    if (!isLoadingOlder) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const newScrollHeight = container.scrollHeight;
    const delta = newScrollHeight - (prevScrollHeightRef.current || 0);
    container.scrollTop = delta;
    setIsLoadingOlder(false);
  }, [visibleMessages.length, isLoadingOlder]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMediaClick = () => {
    setShowDropdown(false);
    setCurrentView('media');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    setCurrentView('contact');
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  const handleCopyPhone = async () => {
    const phoneNumber = '+' + (displayNumber || '');
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setShowCopiedMessage(true);
      setTimeout(() => {
        setShowCopiedMessage(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy phone number:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = phoneNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopiedMessage(true);
      setTimeout(() => {
        setShowCopiedMessage(false);
      }, 2000);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop <= 48) {
      if (visibleCount < sortedChatMessages.length && !isLoadingOlder) {
        // Prepare to prepend older items
        prevScrollHeightRef.current = target.scrollHeight;
        preventAutoScrollRef.current = true;
        setIsLoadingOlder(true);
        setVisibleCount((c) => Math.min(c + pageSize, sortedChatMessages.length));
      }
    }
  };

  useEffect(() => {
    if (selectedChat?.id) {
      markAsRead(selectedChat.id);
      setCurrentView('chat'); // Reset to chat view when switching chats
    }
    // Only react to chat changes; avoid depending on function identity to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('chat.welcomeToLuvix')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            {t('chat.selectConversation')}
          </p>
          <button className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            {t('chat.startNewChat')}
          </button>
        </div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();
  const displayName = selectedChat.type === 'group' ? selectedChat.name : otherUser?.name;
  const displayNumber = selectedChat.type === 'group' ? selectedChat.name : otherUser?.phone;
  const displayAvatar = selectedChat.type === 'group' ? selectedChat.avatar : otherUser?.avatar;

  // Handle different views
  if (currentView === 'media') {
    return <MediaView onBack={handleBackToChat} />;
  }

  if (currentView === 'contact') {
    return <ContactInfo onBack={handleBackToChat} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 font-medium text-base md:text-lg">
                  {displayName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{displayName?.substring(0, 20)} ...</h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                {selectedChat.type === 'individual' 
                  ? (otherUser?.isOnline ? t('common.online') : `${t('chat.lastSeen')} ${formatTime(otherUser?.lastSeen || new Date())}`)
                  : `${selectedChat.participants.length} ${t('chat.participants')}`
                }
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <div className="relative">
              <button 
                onClick={handleCopyPhone}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                title="Click to copy phone number"
              >
                +{displayNumber}
              </button>
              
              {/* Copied Message */}
              {showCopiedMessage && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 dark:bg-gray-600 text-white text-xs rounded-md shadow-lg z-50">
                  {t('chat.copied')}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-600 rotate-45"></div>
                </div>
              )}
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={handleDropdownToggle}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
                  <button
                    onClick={handleMediaClick}
                    className="w-full flex items-center px-4 py-2 text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Image className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                    {t('chat.media')}
                  </button>
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center px-4 py-2 text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                    {t('chat.contactInfo')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-gray-50 dark:bg-gray-800"
      >
        {isLoadingOlder && (
          <div className="flex justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('chat.loadingOlderMessages')}</span>
          </div>
        )}
        {visibleMessages.map((message, index) => {
          const isOwn = message.senderId === currentUser?.id;
          const prevMessage = index > 0 ? visibleMessages[index - 1] : undefined;
          const showDateDivider = shouldShowDateDivider(message, prevMessage);
          const sender = selectedChat.participants.find(p => p.id === message.senderId);
          
          // Debug: Log each message being rendered
          if (import.meta.env.MODE === 'development' && message.fileData) {
            console.log('[Rendering Message with File]', {
              messageId: message.id,
              messageType: message.type,
              fileData: message.fileData,
              isOwn
            });
          }

          return (
            <div key={message.id}>
              {showDateDivider && (
                <div className="flex justify-center my-6">
                  <span className="bg-white dark:bg-gray-700 px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-300 shadow-sm">
                    {formatDateDivider(message.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && selectedChat.type === 'group' && (
                  <img
                    src={sender?.avatar}
                    alt={sender?.name}
                    className="w-8 h-8 rounded-full object-cover mr-2 mt-auto"
                  />
                )}
                
                <div className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-2xl ${
                  isOwn 
                    ? 'bg-green-500 dark:bg-green-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm shadow-sm'
                }`}>
                  {!isOwn && selectedChat.type === 'group' && (
                    <p className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                      {sender?.name}
                    </p>
                  )}
                  
                  {/* Display media files if file data is available */}
                  {message.fileData && (message.type === 'image' || message.type === 'video' || message.type === 'document') && (() => {
                    // Debug: Log message data
                    if (import.meta.env.MODE === 'development') {
                      console.log('[Message Debug]', {
                        messageId: message.id,
                        messageType: message.type,
                        fileData: message.fileData,
                        content: message.content
                      });
                    }
                    
                    const fileUrl = getFileUrl(message.fileData);
                    const fileName = message.fileData.name || message.fileData.filename || 'File';
                    
                    if (!fileUrl) {
                      console.warn('[Media Display] No file URL found for message:', message.id);
                      return null;
                    }
                    
                    if (message.type === 'image') {
                      return (
                        <div className="mb-2">
                          <img
                            src={fileUrl}
                            alt={fileName}
                            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(fileUrl, '_blank')}
                            onError={(e) => {
                              console.error('[Image Load Error]', fileUrl, e);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('[Image Load Success]', fileUrl);
                            }}
                          />
                        </div>
                      );
                    } else if (message.type === 'video') {
                      return (
                        <div className="mb-2">
                          <video
                            src={fileUrl}
                            controls
                            className="max-w-full h-auto rounded-lg"
                            preload="metadata"
                          >
                            <source src={fileUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      );
                    } else if (message.type === 'document') {
                      return (
                        <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                              {fileName}
                            </span>
                            <button
                              onClick={() => window.open(fileUrl, '_blank')}
                              className="ml-auto p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                  
                  {/* Display text content if available */}
                  {message.content && (
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  )}
                  
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${
                    isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="text-[10px] md:text-xs">
                      {formatTime(message.timestamp)}
                    </span>
                    {isOwn && getMessageStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-600 rounded-2xl px-4 py-3 rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
           <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.typeMessage')}
               disabled={isInputDisabled}
               className={`w-full px-4 py-3 pr-12 border rounded-xl resize-none focus:outline-none ${
                 isInputDisabled
                   ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                   : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400'
               }`}
            />
             <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" disabled={isInputDisabled}>
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSend}
             disabled={!newMessage.trim() || isInputDisabled}
            className={`p-3 rounded-full transition-all ${
               newMessage.trim() && !isInputDisabled
                ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white transform hover:scale-105'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;