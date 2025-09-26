import React from 'react';
import logo from '../../assets/logo.png';
import { MessageCircle, Clock, Settings, Target, Package, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeTab: 'chats' | 'status' | 'leads' | 'cms' | 'settings';
  onTabChange: (tab: 'chats' | 'status' | 'leads' | 'cms' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { chats, messages, currentUser } = useApp();

  const totalChats = chats.length;

  const unreadThreadCount = chats.reduce((acc, chat) => {
    if (!currentUser) return acc;
    const hasUnread = messages.some(m => {
      if (chat.type === 'group') {
        return m.groupId === chat.id && m.senderId !== currentUser.id && m.status !== 'read';
      }
      const otherId = chat.participants.find(p => p.id !== currentUser.id)?.id;
      return (
        !!otherId &&
        m.senderId === otherId &&
        m.recipientId === currentUser.id &&
        m.status !== 'read'
      );
    });
    return acc + (hasUnread ? 1 : 0);
  }, 0);

  const tabs = [
    { id: 'chats' as const, icon: MessageCircle, label: 'Chats', badge: unreadThreadCount, total: totalChats },
    { id: 'status' as const, icon: Clock, label: 'Status', badge: 0 },
    { id: 'leads' as const, icon: Target, label: 'Leads', badge: 0 },
    { id: 'cms' as const, icon: Package, label: 'CMS', badge: 0 },
    { id: 'settings' as const, icon: Settings, label: 'Settings', badge: 0 }
  ];



  return (
    <div className="hidden xl:flex w-20 bg-gradient-to-b from-green-600 to-green-700 dark:from-gray-800 dark:to-gray-900 flex-col items-center py-6 shadow-lg">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md overflow-hidden">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="text-white dark:text-gray-200 text-xs font-medium mt-2 text-center">LUVIX</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'bg-white dark:bg-gray-700 shadow-lg transform scale-105' 
                  : 'bg-green-500/20 dark:bg-gray-700/20 hover:bg-green-500/30 dark:hover:bg-gray-600/30 hover:scale-102'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-green-600 dark:text-gray-300' : 'text-white dark:text-gray-300'}`} />
              
              {tab.id === 'chats' && (
                <>
                  {tab.total != null && tab.total > 0 && (
                    <div className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow">
                      <span className={`text-xs font-bold ${isActive ? 'text-green-600 dark:text-gray-300' : 'text-green-700 dark:text-gray-300'}`}>{tab.total}</span>
                    </div>
                  )}
                  {tab.badge > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{tab.badge}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -right-3 w-1 h-8 bg-white dark:bg-gray-300 rounded-l-full" />
              )}
            </button>
          );
        })}
        
        {/* Services Tab - Opens in New Tab */}
        <button
          onClick={() => window.open('/services', '_blank')}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 bg-green-500/20 dark:bg-gray-700/20 hover:bg-green-500/30 dark:hover:bg-gray-600/30 hover:scale-102"
        >
          <ShoppingBag className="w-6 h-6 text-white dark:text-gray-300" />
        </button>
      </nav>

      {/* Removed AI toggle button from sidebar as requested */}

      {/* User Profile */}
      <div className="mt-auto">
        <button className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-400 dark:border-gray-500 hover:border-white dark:hover:border-gray-300 transition-colors duration-200">
          <img
            src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=150"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;