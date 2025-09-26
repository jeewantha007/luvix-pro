import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageCircle, 
  Star,
  Trash2,
  Share,

} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ContactInfoProps {
  onBack: () => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ onBack }) => {
  const { selectedChat } = useApp();
  const [isStarred, setIsStarred] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const otherParticipant = selectedChat?.participants.find(p => p.id !== 'current-user-id');

  // Mock additional contact data - in a real app, this would come from your contact database
  const contactInfo = {
    name: otherParticipant?.name || 'Unknown Contact',
    phone: '+94 77 876 7879',
    email: 'john.doe@example.com',
    about: 'Available',
    avatar: otherParticipant?.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=150',
    lastSeen: 'last seen today at 2:30 PM',
    joinedDate: 'Joined December 2023',
    commonGroups: ['Project Team', 'Office Friends'],
    isOnline: otherParticipant?.isOnline || false
  };

  const handleStarToggle = () => {
    setIsStarred(!isStarred);
  };


  const handleDeleteChat = () => {
    setShowDeleteConfirm(false);
    // Implement delete chat logic
    console.log('Delete chat');
  };



  const menuItems = [

    {
      icon: Star,
      label: isStarred ? 'Unstar contact' : 'Star contact',
      onClick: handleStarToggle,
      color: isStarred ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-300'
    },
    {
      icon: Share,
      label: 'Share contact',
      onClick: () => console.log('Share contact'),
      color: 'text-gray-600 dark:text-gray-300'
    },
 
    {
      icon: Trash2,
      label: 'Delete chat',
      onClick: () => setShowDeleteConfirm(true),
      color: 'text-red-600 dark:text-red-400',
      danger: true
    }
  ];

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
          
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Contact Info</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
          <div className="relative inline-block mb-4">
            <img
              src={contactInfo.avatar}
              alt={contactInfo.name}
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
            
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {contactInfo.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {contactInfo.phone}
          </p>

        </div>


        {/* Contact Details */}
        <div className="p-6 space-y-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Contact Details
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-gray-900 dark:text-white">{contactInfo.phone}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-gray-900 dark:text-white">{contactInfo.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="p-6 space-y-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            About
          </h4>
          
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-gray-900 dark:text-white">{contactInfo.about}</p>
            </div>
          </div>
        </div>

   

 

        {/* Actions Menu */}
        <div className="p-6 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  item.danger ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                <span className={`text-left ${item.color}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete chat?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This will delete the chat history with {contactInfo.name}. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
