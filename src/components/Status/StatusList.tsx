import React from 'react';
import { Plus, Eye, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const StatusList: React.FC = () => {
  const { statuses, currentUser, postStatus } = useApp();

  const myStatuses = statuses.filter(s => s.userId === currentUser?.id);
  const otherStatuses = statuses.filter(s => s.userId !== currentUser?.id);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return '1d ago';
    }
  };

  // const handleCreateStatus = () => {
  //   const content = prompt('Enter your status message:');
  //   if (content?.trim()) {
  //     postStatus(content.trim());
  //   }
  // };

  return (
    <div className="w-full lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Status</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* My Status */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            My Status
          </h2>
          
          <button
            // onClick={handleCreateStatus}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            {currentUser?.avatar ? (
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt="My status"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            )}
            
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">My Status</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {myStatuses.length > 0 
                  ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''}`
                  : 'Tap to add status update'
                }
              </p>
            </div>
          </button>
          
          {/* My Status Updates */}
          {myStatuses.map((status) => (
            <div key={status.id} className="ml-4 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{formatTimeAgo(status.timestamp)}</span>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{status.viewers.length}</span>
                </div>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">{status.content}</p>
              {status.mediaUrl && (
                <img
                  src={status.mediaUrl}
                  alt="Status media"
                  className="mt-2 w-full h-32 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>

        {/* Recent Updates */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            Recent Updates
          </h2>
          
          {otherStatuses.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-1">No recent updates</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Status updates from contacts will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {otherStatuses.map((status) => {
                const user = { name: `User ${status.userId}`, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150' }; // Mock user data
                
                return (
                  <button
                    key={status.id}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-left"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(status.timestamp)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusList;