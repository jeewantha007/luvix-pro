import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Share, Search, Image, Video, FileText, Music, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../../data/supabaseClient';

interface MediaViewProps {
  onBack: () => void;
}

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  size: string;
  date: Date;
  sender: string;
  displayNumber?: string;
}

const MediaView: React.FC<MediaViewProps> = ({ onBack }) => {
  const { selectedChat, selectedChatNumber } = useApp();
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'links'>('media');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Fetch media files from Supabase Storage
  useEffect(() => {
    fetchMediaFiles();
  }, []);

  // Refetch files when selected chat changes
  useEffect(() => {
    if (selectedChatNumber) {
      console.log(`🔄 Selected chat number changed to: ${selectedChatNumber}`);
      // The filtering will happen automatically in getFilteredFiles()
    }
  }, [selectedChatNumber]);

  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Fetching media files from Supabase Storage...');
      
             // Try different bucket names and folder structures
       const bucketNames = ['lumix_hoi_wp_db', 'lumix-hoi-wp_db', 'lumix_hoi_wpmsg_files'];
       let files = null;
       let usedBucket = '';
       
       for (const bucketName of bucketNames) {
         console.log(`🔍 Trying bucket: ${bucketName}`);
         
         // Try luvix_hoi_wpmsg_files folder first (this is where the files are)
         const folderResult = await supabase.storage
           .from(bucketName)
           .list('luvix_hoi_wpmsg_files', {
             limit: 100,
             offset: 0
           });
         
         if (!folderResult.error && folderResult.data && folderResult.data.length > 0) {
           files = folderResult.data;
           usedBucket = bucketName;
           console.log(`✅ Found files in bucket: ${bucketName} (luvix_hoi_wpmsg_files folder)`);
           break;
         }
         
         // Try root folder as fallback
         const rootResult = await supabase.storage
           .from(bucketName)
           .list('', {
             limit: 100,
             offset: 0
           });
         
         if (!rootResult.error && rootResult.data && rootResult.data.length > 0) {
           files = rootResult.data;
           usedBucket = bucketName;
           console.log(`✅ Found files in bucket: ${bucketName} (root)`);
           break;
         }
         
         console.log(`❌ No files found in bucket: ${bucketName}`);
       }

      if (!files) {
        console.error('❌ No files found in any bucket');
        setMediaFiles([]);
        return;
      }

      console.log('📁 Files found:', files);

             if (files && files.length > 0) {
         const mediaFilesData: MediaFile[] = [];
         
         // Process each file in the luvix_hoi_wpmsg_files folder
         for (const file of files) {
           if (file.name && !file.name.endsWith('/')) {
             const fileExt = file.name.split('.').pop()?.toLowerCase();
             let type: 'image' | 'video' | 'document' | 'audio' = 'document';
             
             // Determine file type based on extension
             if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt || '')) {
               type = 'image';
             } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExt || '')) {
               type = 'video';
             } else if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(fileExt || '')) {
               type = 'audio';
             }

             // Get public URL for the file
             const { data: { publicUrl } } = supabase.storage
               .from(usedBucket)
               .getPublicUrl(`luvix_hoi_wpmsg_files/${file.name}`);

                           // Extract display number from filename (format: "94778072233-1755854103-File.jpg")
              const displayNumber = file.name.split('-')[0] || '';
              console.log(`📱 File: ${file.name}, Display Number: ${displayNumber}`);
             
             mediaFilesData.push({
               id: file.id || file.name,
               name: file.name,
               type,
               url: publicUrl,
               size: formatFileSize(file.metadata?.size || 0),
               date: new Date(file.created_at || Date.now()),
               sender: 'Unknown',
               displayNumber
             });
           }
         }

                 console.log('✅ Media files processed:', mediaFilesData.length);
         setMediaFiles(mediaFilesData);
      } else {
        console.log('ℹ️ No files found in bucket');
        setMediaFiles([]);
      }
    } catch (error) {
      console.error('❌ Error fetching media files:', error);
      console.error('🔍 Error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

    const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilteredFiles = () => {
    let filtered = mediaFiles;

    if (activeTab === 'media') {
      filtered = mediaFiles.filter(file => file.type === 'image' || file.type === 'video');
    } else if (activeTab === 'docs') {
      filtered = mediaFiles.filter(file => file.type === 'document' || file.type === 'audio');
    }

    // Filter by chat display number (phone number)
    if (selectedChatNumber) {
      console.log(`🔍 Filtering by selectedChatNumber: "${selectedChatNumber}" (type: ${typeof selectedChatNumber})`);
      console.log(`📁 Total files before filtering: ${filtered.length}`);
      console.log(`📱 Files with display numbers:`, filtered.map(f => ({ 
        name: f.name, 
        displayNumber: f.displayNumber, 
        displayNumberType: typeof f.displayNumber 
      })));
      
      filtered = filtered.filter(file => {
        // Convert both to strings for comparison to handle any type mismatches
        const fileDisplayNumber = String(file.displayNumber || '');
        const chatNumber = String(selectedChatNumber);
        const matches = fileDisplayNumber === chatNumber;
        
        console.log(`🔍 File: ${file.name}`);
        console.log(`   DisplayNumber: "${fileDisplayNumber}" (type: ${typeof fileDisplayNumber})`);
        console.log(`   Chat Number: "${chatNumber}" (type: ${typeof chatNumber})`);
        console.log(`   Matches: ${matches}`);
        
        return matches;
      });
      
      console.log(`📁 Files after filtering: ${filtered.length}`);
      console.log(`📱 Remaining files:`, filtered.map(f => f.name));
    }

    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-green-500" />;
      case 'video': return <Video className="w-5 h-5 text-blue-500" />;
      case 'document': return <FileText className="w-5 h-5 text-red-500" />;
      case 'audio': return <Music className="w-5 h-5 text-purple-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fileDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (fileDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (fileDate.getTime() === today.getTime() - 86400000) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const filteredFiles = getFilteredFiles();
  const otherParticipant = selectedChat?.participants.find(p => p.id !== 'current-user-id');
  
  // Debug selectedChat structure
  console.log('🔍 selectedChat:', selectedChat);
  console.log('📱 selectedChatNumber:', selectedChatNumber);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">Media, Links and Docs</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {otherParticipant?.name || 'Unknown Contact'}
            </p>
          </div>
          
          <button
            onClick={fetchMediaFiles}
            disabled={isLoading}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            title="Refresh media files"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

                 {/* Search */}
         <div className="mt-4 relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
           <input
             type="text"
             placeholder="Search media, links and docs"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
           />
         </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'media'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Media ({filteredFiles.filter(f => f.type === 'image' || f.type === 'video').length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'docs'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Docs ({filteredFiles.filter(f => f.type === 'document' || f.type === 'audio').length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'links'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Links (0)
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading media files...</p>
            </div>
          </div>
        ) : activeTab === 'links' ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No links shared</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Links shared in this chat will appear here</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'media' ? (
                <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              ) : (
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No {activeTab === 'media' ? 'media files' : 'documents'} found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchQuery ? 'Try a different search term' : `${activeTab === 'media' ? 'Photos and videos' : 'Documents and audio files'} shared in this chat will appear here`}
            </p>
          </div>
        ) : (
          <div className="p-4">
            {activeTab === 'media' ? (
              // Grid view for media
              <div className="grid grid-cols-3 gap-2">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="relative aspect-square">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(file.url, '_blank')}
                      />
                    ) : (
                      <div 
                        className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Video className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {file.size}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List view for documents
              <div className="space-y-1">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{formatDate(file.date)}</span>
                        <span>•</span>
                        <span>{file.sender}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaView;
