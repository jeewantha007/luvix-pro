import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Users, Check, Search, Paperclip, Clock, Image as ImageIcon, File, Video, Calendar, UserPlus, MessageCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Chat, User } from '../../types';
import { supabase } from '../../../data/supabaseClient';
import { getTranslation } from '../../utils/translations';

interface BroadcastMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  size: number;
}

interface SupabaseGroup {
  id: number;
  created_at: string;
  members: Array<{
    member_phone: string;
    member_name: string;
  }>;
  group_name: string;
}

interface BroadcastMessageData {
  id?: number;
  created_at?: string;
  message: string;
  schedule_time?: string;
  group_id: number | null;
  media_file?: { url: string; type: string; name: string; size: number };
}

const BroadcastMessage: React.FC<BroadcastMessageProps> = ({ isOpen, onClose }) => {
  const { chats, currentUser, sendBroadcastMessage, createGroup, setSelectedChat, language } = useApp();
  const t = (key: string) => getTranslation(language, key);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showMediaPreview, setShowMediaPreview] = useState<MediaFile | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [currentMode, setCurrentMode] = useState<'broadcast' | 'create-group' | 'groups-list'>('broadcast');
  const [groupMessage, setGroupMessage] = useState<{ type: 'success' | 'error' | 'info' | ''; text: string }>({ type: '', text: '' });
  const [availableGroups, setAvailableGroups] = useState<SupabaseGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load groups and broadcast messages when modal opens
  useEffect(() => {
    if (isOpen) {
      loadGroupsFromDatabase();
      loadBroadcastMessages();
    }
  }, [isOpen]);

  const getOtherParticipant = (chat: Chat): User | null => {
    if (chat.type === 'group') return null;
    return chat.participants.find(p => p.id !== currentUser?.id) || null;
  };

  // Filter individual chats and apply search
  const individualChats = chats.filter(chat =>
    chat.type === 'individual' &&
    getOtherParticipant(chat)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter group chats
  const groupChats = chats.filter(chat => chat.type === 'group');

  // Load broadcast messages from Supabase
  const loadBroadcastMessages = async () => {
    try {
      const TABLE = 'broadcast_msg';
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to load broadcast messages:', error.message);
        }
        return;
      }

      if (data && data.length > 0) {
        setBroadcastMessages(data);
        if (import.meta.env.MODE === 'development') {
          console.log('[Supabase] Loaded broadcast messages:', data);
        }
      } else {
        setBroadcastMessages([]);
      }
    } catch (error) {
      console.error('Error loading broadcast messages:', error);
    }
  };

  // Load groups from Supabase
  const loadGroupsFromDatabase = async () => {
    setIsLoadingGroups(true);
    try {
      const TABLE = 'groups';
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to load groups:', error.message);
        }
        return;
      }

      if (data && data.length > 0) {
        setAvailableGroups(data);

        // Convert Supabase groups to Chat format for consistency
        const supabaseGroups: Chat[] = data.map((group: SupabaseGroup) => ({
          id: `group-${group.id}`,
          type: 'group',
          name: group.group_name,
          participants: group.members?.map((member) => ({
            id: `member-${member.member_phone}`,
            name: member.member_name,
            phone: member.member_phone,
            isOnline: false,
            lastSeen: new Date()
          })) || [],
          unreadCount: 0,
          isActive: true,
          lastMessage: undefined
        }));

        // You might want to update the chats state here or handle this differently
        // For now, we'll just log the loaded groups
        if (import.meta.env.MODE === 'development') {
          console.log('[Supabase] Loaded groups:', supabaseGroups);
        }
      } else {
        setAvailableGroups([]);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const toggleContact = (chatId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId);
    } else {
      newSelected.add(chatId);
    }
    setSelectedContacts(newSelected);

    // Debug logging to verify contact selection
    if (import.meta.env.MODE === 'development') {
      console.log('Toggled contact:', chatId);
      console.log('Updated selected contacts:', Array.from(newSelected));
    }
  };

  const selectAll = () => {
    const allChatIds = individualChats.map(chat => chat.id);
    setSelectedContacts(new Set(allChatIds));
  };

  const clearSelection = () => {
    setSelectedContacts(new Set());
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const fileType = file.type.split('/')[0];
      let mediaType: 'image' | 'video' | 'document';

      if (fileType === 'image') mediaType = 'image';
      else if (fileType === 'video') mediaType = 'video';
      else mediaType = 'document';

      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        type: mediaType,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      setMediaFiles(prev => [...prev, mediaFile]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Upload media file to storage
  const uploadMediaFile = async (file: File): Promise<string> => {
    // Validate file type
    const allowedTypes = ['image/', 'video/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type) || file.type === type);

    if (!isValidType) {
      throw new Error(t('broadcast.invalidFileType'));
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(t('broadcast.fileSizeLimit'));
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `broadcast-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('broadcast_media')
      .upload(fileName, file);

    if (uploadError) {
      if (import.meta.env.MODE === 'development') {
        console.error('[Supabase] Failed to upload media file:', uploadError.message);
      }
      throw new Error(t('broadcast.failedToUpload'));
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('broadcast_media')
      .getPublicUrl(fileName);

    // Log the uploaded file URL
    console.log('Media file uploaded successfully!');
    console.log('Public URL:', publicUrl);

    return publicUrl;
  };

  const sendBroadcast = async () => {
    if ((!message.trim() && mediaFiles.length === 0)) return;

    setIsSending(true);

    try {
      // Determine message type based on content and media
      let messageType: 'text' | 'image' | 'video' | 'document' = 'text';
      let mediaUrl: string | undefined;
      let mediaFileData: { url: string; type: string; name: string; size: number } | undefined;

      if (mediaFiles.length > 0) {
        const firstMedia = mediaFiles[0];
        messageType = firstMedia.type;

        try {
          // Upload media file to storage
          const uploadedUrl = await uploadMediaFile(firstMedia.file);
          mediaUrl = uploadedUrl;

          // Prepare media file data for database
          mediaFileData = {
            url: uploadedUrl,
            type: firstMedia.type,
            name: firstMedia.name,
            size: firstMedia.size
          };
        } catch (uploadError) {
          console.error('Media upload error:', uploadError);
          alert(uploadError instanceof Error ? uploadError.message : 'Failed to upload media file');
          return;
        }
      }

      // Save to broadcast_msg table
      const TABLE = 'broadcast_msg';
      const broadcastData: BroadcastMessageData = {
        message: message.trim(),
        group_id: selectedGroupId,
        schedule_time: isScheduled && scheduleTime ? scheduleTime : undefined,
        media_file: mediaFileData
      };

      const res = await supabase
        .from(TABLE)
        .insert(broadcastData)
        .select();

      const error = res.error;

      if (error) {
        if (import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to save broadcast message:', error.message);
        }
        throw new Error(t('broadcast.failedToSaveBroadcast'));
      }

      // Use the new sendBroadcastMessage function for immediate sending
      sendBroadcastMessage(message.trim(), Array.from(selectedContacts), messageType, mediaUrl);

      // Clear form and close modal
      setMessage('');
      setSelectedContacts(new Set());
      setMediaFiles([]);
      setScheduleTime('');
      setIsScheduled(false);
      setSelectedGroupId(null);
      onClose();
    } catch (error) {
      console.error('Error sending broadcast message:', error);
      alert(t('broadcast.failedToSendBroadcast'));
    } finally {
      setIsSending(false);
    }
  };

  const createNewGroup = async () => {
    if (!groupName.trim() || selectedContacts.size === 0) return;

    setIsCreatingGroup(true);
    setGroupMessage({ type: '', text: '' });

    try {
      // Get only the selected participants (not all participants)
      const selectedParticipants: User[] = [];
      for (const chatId of selectedContacts) {
        const chat = chats.find(c => c.id === chatId);
        if (chat && chat.type === 'individual') {
          const otherUser = getOtherParticipant(chat);
          if (otherUser) {
            selectedParticipants.push(otherUser);
          }
        }
      }

      // Prepare members data for Supabase groups table - only selected members
      const membersData = selectedParticipants.map(participant => ({
        member_phone: participant.phone,
        member_name: participant.name
      }));

      // Add current user to the group only if they have a valid phone number
      if (currentUser && currentUser.phone && currentUser.phone.trim() !== '') {
        membersData.push({
          member_phone: currentUser.phone,
          member_name: currentUser.name
        });
      }

      // Debug logging to verify only selected members are included
      if (import.meta.env.MODE === 'development') {
        console.log('Selected contacts count:', selectedContacts.size);
        console.log('Selected participants:', selectedParticipants);
        console.log('Final members data:', membersData);
      }

      // Save to Supabase groups table
      const TABLE = 'groups';
      const groupData = {
        group_name: groupName.trim(),
        members: membersData,
        created_at: new Date().toISOString()
      };

      const res = await supabase
        .from(TABLE)
        .insert(groupData)
        .select();

      const error = res.error;

      if (error) {
        if (import.meta.env.MODE === 'development') {
          console.error('[Supabase] Failed to create group:', error.message);
        }
        setGroupMessage({ type: 'error', text: t('broadcast.failedToCreateGroup') });
        return;
      }

      // Also create the group in the local context for immediate UI update
      // Only pass the selected participants, not all participants
      createGroup(groupName.trim(), selectedParticipants);

      setGroupMessage({ type: 'success', text: t('broadcast.groupCreatedSuccessfully') });

      // Clear form and close modal after a short delay to show success message
      setTimeout(() => {
        setGroupName('');
        setSelectedContacts(new Set());
        setCurrentMode('broadcast');
        setGroupMessage({ type: '', text: '' });
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error creating group:', error);
      setGroupMessage({ type: 'error', text: t('broadcast.unexpectedError') });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleScheduleToggle = () => {
    setIsScheduled(!isScheduled);
    if (!isScheduled) {
      // Set default time to 1 hour from now
      const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
      setScheduleTime(defaultTime.toISOString().slice(0, 16));
    } else {
      setScheduleTime('');
    }
  };

  const handleGroupClick = (group: Chat) => {
    setSelectedChat(group);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {currentMode === 'broadcast' ? t('broadcast.title') :
                    currentMode === 'create-group' ? t('broadcast.createGroup') : t('broadcast.groupsList')}
                </h2>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  {currentMode === 'broadcast'
                    ? t('broadcast.sendToMultiple')
                    : currentMode === 'create-group'
                      ? t('broadcast.createGroupWithMembers')
                      : t('broadcast.viewAndManage')
                  }
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="hidden lg:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mode Toggle */}


        {/* Responsive Layout */}
        <div className="flex-1 flex flex-col lg:flex-row h-full">
          {/* Left Column - Form */}
          <div className="flex-1 overflow-y-auto lg:border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentMode('broadcast')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${currentMode === 'broadcast'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    {t('broadcast.broadcast')}
                  </button>
                  <button
                    onClick={() => setCurrentMode('create-group')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${currentMode === 'create-group'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    <UserPlus className="w-4 h-4 inline mr-2" />
                    {t('broadcast.createGroup')}
                  </button>
                </div>
              </div>
              {/* Groups List */}
              {currentMode === 'groups-list' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('broadcast.noGroups')} ({groupChats.length})
                  </h3>

                  {groupChats.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">{t('broadcast.noGroupsYet')}</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">{t('broadcast.createFirstGroup')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {groupChats.map((group) => (
                        <div
                          key={group.id}
                          onClick={() => handleGroupClick(group)}
                          className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="relative">
                            {group.avatar ? (
                              <img
                                src={group.avatar}
                                alt={group.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {group.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {group.participants.length} {group.participants.length !== 1 ? t('broadcast.members') : t('broadcast.member')}
                            </p>
                            {group.lastMessage && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                                {group.lastMessage.content}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {group.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
                                {group.unreadCount}
                              </span>
                            )}
                            {group.lastMessage && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(group.lastMessage.timestamp).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Group Name Input (only for create group mode) */}
              {currentMode === 'create-group' && (
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('broadcast.groupName')}
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder={t('broadcast.enterGroupNamePlaceholder')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />

                  {/* Selection Summary */}
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t('broadcast.selectedMembers')} {selectedContacts.size} {selectedContacts.size !== 1 ? t('broadcast.contacts') : t('broadcast.contact')}
                  </div>

                  {/* Group Message Display */}
                  {groupMessage.text && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${groupMessage.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700'
                      : groupMessage.type === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                      }`}>
                      {groupMessage.text}
                    </div>
                  )}
                </div>
              )}

              {/* Available Groups Display */}
              {(currentMode === 'broadcast' || currentMode === 'create-group') && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('broadcast.noGroups')} ({availableGroups.length})
                  </h3>

                  {isLoadingGroups ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      {t('broadcast.loadingGroups')}
                    </div>
                  ) : availableGroups.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-4">
                      {availableGroups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {group.group_name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {group.id} • {group.members?.length || 0} {t('broadcast.members')}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(group.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 mb-4">
                      {t('broadcast.noGroupsAvailable')}
                    </div>
                  )}
                </div>
              )}



              {/* Message Input (only for broadcast mode) */}
              {currentMode === 'broadcast' && (
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('broadcast.message')}
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('broadcast.typeBroadcastMessage')}
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              )}

              {/* Group Selection (only for broadcast mode) */}
              {currentMode === 'broadcast' && (
                <div>
                  <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('broadcast.selectGroup')}
                  </label>
                  <select
                    id="groupSelect"
                    value={selectedGroupId || ''}
                    onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">{t('broadcast.sendToSelectedOnly')}</option>
                    {availableGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.group_name} (ID: {group.id})
                      </option>
                    ))}
                  </select>
                  {selectedGroupId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('broadcast.messageAssociatedWithGroup')} {selectedGroupId}
                    </p>
                  )}
                </div>
              )}

              {/* Recent Broadcast Messages (only for broadcast mode) */}
              {currentMode === 'broadcast' && broadcastMessages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('broadcast.recentBroadcastMessages')} ({broadcastMessages.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                    {broadcastMessages.slice(0, 3).map((msg) => (
                      <div
                        key={msg.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">
                            {msg.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            • {msg.schedule_time ? t('broadcast.scheduled') : t('broadcast.sendBroadcast')} {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}

                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Upload (only for broadcast mode) */}
              {currentMode === 'broadcast' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('broadcast.mediaFiles')}</h4>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border border-green-300 dark:border-green-600 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>{t('broadcast.addFiles')}</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {mediaFiles.length > 0 && (
                    <div className="space-y-2">
                      {mediaFiles.map((media) => (
                        <div key={media.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-2 flex-1">
                            {getFileIcon(media.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {media.name.substring(0, 20)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(media.size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowMediaPreview(media)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              {t('broadcast.preview')}
                            </button>
                            <button
                              onClick={() => removeMediaFile(media.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Schedule Options (only for broadcast mode) */}
              {currentMode === 'broadcast' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('broadcast.scheduleMessage')}</h4>
                    <button
                      onClick={handleScheduleToggle}
                      className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-lg transition-colors ${isScheduled
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600'
                        }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{isScheduled ? t('broadcast.scheduled') : t('broadcast.schedule')}</span>
                    </button>
                  </div>

                  {isScheduled && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <input
                          type="datetime-local"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      {scheduleTime && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('broadcast.messageWillBeSent')} {new Date(scheduleTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-center">
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    {currentMode === 'broadcast' ? (
                      <button
                        onClick={sendBroadcast}
                        disabled={(!message.trim() && mediaFiles.length === 0) || isSending}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSending ? t('broadcast.sending') : isScheduled ? t('broadcast.scheduleBroadcast') : t('broadcast.sendBroadcast')}</span>
                      </button>
                    ) : currentMode === 'create-group' ? (
                      <button
                        onClick={createNewGroup}
                        disabled={!groupName.trim() || selectedContacts.size === 0 || isCreatingGroup}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isCreatingGroup ? t('broadcast.creating') : t('broadcast.creatingGroup')}</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center m-4">
              <div className="flex space-x-3 m-4">
              </div>
            </div>
          </div>




          {/* Right Column - Live Preview */}
          <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            <div className="p-3 md:p-6">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-4">
                {t('broadcast.livePreview')}
              </h3>

              {/* Message Preview */}
              {(currentMode === 'broadcast' || currentMode === 'create-group') && (message.trim() || mediaFiles.length > 0) && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 md:p-4 mb-2 md:mb-4">
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 md:space-x-2 mb-1 md:mb-2">
                        <span className="text-sm md:text-base font-medium text-gray-900 dark:text-white">{t('broadcast.title')}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {isScheduled ? t('broadcast.scheduled') : t('broadcast.now')}
                        </span>
                      </div>

                      {/* Message Content */}
                      {message.trim() && (
                        <p className="text-xs md:text-sm text-gray-800 dark:text-gray-200 mb-2 md:mb-3 whitespace-pre-wrap">
                          {message}
                        </p>
                      )}

                      {/* Media Preview */}
                      {mediaFiles.length > 0 && (
                        <div className="space-y-1 md:space-y-2">
                          {mediaFiles.map((media) => (
                            <div key={media.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                              {media.type === 'image' ? (
                                <img
                                  src={media.url}
                                  alt={media.name}
                                  className="w-full h-24 md:h-48 object-cover"
                                />
                              ) : media.type === 'video' ? (
                                <video
                                  src={media.url}
                                  controls
                                  className="w-full h-24 md:h-48 object-cover"
                                >
                                  {t('broadcast.yourBrowserNotSupport')}
                                </video>
                              ) : (
                                <div className="p-2 md:p-4 bg-gray-50 dark:bg-gray-800 flex items-center space-x-2 md:space-x-3">
                                  <File className="w-6 h-6 md:w-8 md:h-8 text-gray-400 dark:text-gray-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {media.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatFileSize(media.size)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Schedule Info */}
                      {isScheduled && scheduleTime && (
                        <div className="mt-2 md:mt-3 p-1 md:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center space-x-1 md:space-x-2">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                              {t('broadcast.scheduled')} {t('broadcast.messageWillBeSent')} {new Date(scheduleTime).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Recipients Info */}
                      <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          {selectedGroupId && (
                            <span className="text-green-600 dark:text-green-400">
                              {t('broadcast.groupSelected')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Empty State */}
              {((currentMode === 'broadcast' && !message.trim() && mediaFiles.length === 0) ||
                (currentMode === 'create-group' && !groupName.trim())) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      {currentMode === 'broadcast' ? t('broadcast.startTypingMessage') : t('broadcast.enterGroupName')}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {currentMode === 'broadcast'
                        ? t('broadcast.broadcastPreviewHere')
                        : t('broadcast.groupPreviewHere')
                      }
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

      </div>

      {/* Media Preview Modal */}
      {showMediaPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showMediaPreview.name}
              </h3>
              <button
                onClick={() => setShowMediaPreview(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {showMediaPreview.type === 'image' ? (
                <img
                  src={showMediaPreview.url}
                  alt={showMediaPreview.name}
                  className="w-full h-auto max-h-full object-contain"
                />
              ) : showMediaPreview.type === 'video' ? (
                <video
                  src={showMediaPreview.url}
                  controls
                  className="w-full h-auto max-h-full"
                >
                  {t('broadcast.yourBrowserNotSupport')}
                </video>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <File className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                      <p className="text-gray-600 dark:text-gray-400">
                    {t('broadcast.previewNotAvailable')}
                  </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      {showMediaPreview.name} ({formatFileSize(showMediaPreview.size)})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BroadcastMessage;
