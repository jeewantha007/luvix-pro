import React, { useState } from 'react';
import { Clock, Settings as SettingsIcon, MessageCircle as MessageIcon, Target, Package, ShoppingBag } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Layout/Sidebar';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import BroadcastMessage from './components/Chat/BroadcastMessage';
import StatusList from './components/Status/StatusList';
import StatusViewer from './components/Status/StatusViewer';
import LeadList from './components/Leads/LeadList';
import LeadDetails from './components/Leads/LeadDetails';
import CMSView from './components/CMS/CMSView';
import SubscriptionPage from './pages/SubscriptionPage';
import Settings from './components/Settings/Settings';
import Profile from './components/Profile/Profile';
import StorageData from './components/Settings/StorageData';
import LanguagePanel from './components/Settings/LanguagePanel';
import Auth from './components/Auth/Auth';
import ResetPassword from './components/Auth/ResetPassword';
import { useIsMobile } from './hooks/useMediaQuery';

const RootContent: React.FC = () => {
  const { 
    isAuthenticated, 
    selectedChat, 
    showProfile,
    setShowProfile, language, changeLanguage ,
    addLead,
    updateLead,
    deleteLead,
    subscriptionStatus
  } = useApp();
  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'leads' | 'cms' | 'settings'>('chats');
  const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
  const [showStorageData, setShowStorageData] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const isMobile = useIsMobile();

  // Redirect to subscription page when backend indicates no active subscription
  React.useEffect(() => {
    if (subscriptionStatus && subscriptionStatus.redirectTo) {
      const target = subscriptionStatus.redirectTo || '/subscription';
      if (typeof window !== 'undefined' && window.location.pathname !== target) {
        window.location.href = target;
      }
    }
  }, [subscriptionStatus]);

  // Lead CRUD functions using context
  const handleAddLead = async (leadData: any) => {
    try {
      const newLead = await addLead(leadData);
      if (newLead) {
        setSelectedLead(newLead);
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      // You can add toast notification here
    }
  };

  const handleUpdateLead = async (id: string, updates: any) => {
    try {
      const updatedLead = await updateLead(id, updates);
      if (updatedLead && selectedLead && selectedLead.id === id) {
        setSelectedLead(updatedLead);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      // You can add toast notification here
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead(id);
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      // You can add toast notification here
    }
  };

  // Simple client-side route check for reset password page
  if (typeof window !== 'undefined' && window.location.pathname === '/reset-password') {
    return <ResetPassword />;
  }  
  
  if (!isAuthenticated) return <Auth />;

  // Check subscription status and redirect if needed
  if (subscriptionStatus && subscriptionStatus.redirectTo) {
    return <SubscriptionPage />;
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <div className="flex h-full">
            {/* Mobile: Show only ChatList or ChatWindow/BroadcastModal, Desktop: Show both */}
            <div className={`${isMobile ? (selectedChat || showBroadcastModal ? 'hidden' : 'flex') : 'flex'} w-full lg:w-auto`}> 
              <ChatList onShowBroadcast={() => setShowBroadcastModal(true)} />
            </div>
            <div className={`${isMobile ? (selectedChat || showBroadcastModal ? 'flex' : 'hidden') : 'flex'} flex-1`}> 
              {showBroadcastModal ? (
                <BroadcastMessage 
                  isOpen={showBroadcastModal} 
                  onClose={() => setShowBroadcastModal(false)} 
                />
              ) : (
                <ChatWindow />
              )}
            </div>
          </div>
        );
      case 'status':
        return (
          <div className="flex h-full">
            <StatusList />
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Status Updates</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                  Share photos, videos, and text updates that disappear after 24 hours. 
                  Click on a status update to view it.
                </p>
              </div>
            </div>
          </div>
        );
             case 'leads':
         return (
           <div className="flex h-full">
             {/* Left Section: Lead List */}
             <div className={`${isMobile ? (selectedLead ? 'hidden' : 'flex') : 'flex'} w-full lg:w-auto`}>
               <LeadList 
                 selectedLead={selectedLead} 
                 onLeadSelect={setSelectedLead}
                 onAddLead={handleAddLead}
                 onUpdateLead={handleUpdateLead}
                 onDeleteLead={handleDeleteLead}
               />
             </div>
             
             {/* Right Section: Lead Details or Welcome Message */}
             <div className={`${isMobile ? (selectedLead ? 'flex' : 'hidden') : 'flex'} flex-1`}>
               {selectedLead ? (
                 <LeadDetails 
                   lead={selectedLead} 
                   onBack={() => setSelectedLead(null)}
                   onUpdateLead={handleUpdateLead}
                 />
               ) : (
                 <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
                   <div className="text-center">
                     <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Target className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                     </div>
                     <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Lead Management</h2>
                     <p className="text-gray-600 dark:text-gray-300 max-w-md">
                       Manage your business leads, track potential customers, and convert them into sales.
                       Select a lead to view details and manage the sales process.
                     </p>
                   </div>
                 </div>
               )}
             </div>
           </div>
         );
      case 'cms':
        return <CMSView />;
      case 'settings':
        return (
          <div className="flex h-full">
            {!isMobile && (
              <Settings 
                onShowStorageData={() => setShowStorageData(true)}
                onShowLanguagePanel={() => setShowLanguagePanel(true)}
              />
            )}
            <div className={`${isMobile ? 'w-full' : 'hidden lg:flex flex-1'}`}>
              {showProfile ? (
                <Profile onBack={() => setShowProfile(false)} />
              ) : showStorageData ? (
                <StorageData onBack={() => setShowStorageData(false)} />
              ) : showLanguagePanel ? (
                <LanguagePanel
                  currentLanguage={language}
                  onLanguageChange={changeLanguage}
                  onBack={() => setShowLanguagePanel(false)}
                />
              ) : (
                <div className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800 flex">
                  {isMobile ? (
                    <Settings 
                      onShowStorageData={() => setShowStorageData(true)}
                      onShowLanguagePanel={() => setShowLanguagePanel(true)}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <SettingsIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Application Settings</h2>
                      <p className="text-gray-600 dark:text-gray-300 max-w-md">
                        Customize your LUVIX experience. Manage your account, privacy, 
                        notifications, and app preferences.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen bg-gray-100 dark:bg-gray-900 flex overflow-hidden ${isMobile ? 'pb-16' : ''}`}>
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
      
      <div className="flex-1 flex flex-col">
        {renderMainContent()}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="flex justify-around py-2">
            <button onClick={() => setActiveTab('chats')} className={`flex flex-col items-center text-xs ${activeTab === 'chats' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              <MessageIcon className="w-6 h-6" />
              <span>Chats</span>
            </button>
            <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center text-xs ${activeTab === 'status' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              <Clock className="w-6 h-6" />
              <span>Status</span>
            </button>
            <button onClick={() => setActiveTab('leads')} className={`flex flex-col items-center text-xs ${activeTab === 'leads' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              <Target className="w-6 h-6" />
              <span>Leads</span>
            </button>
            <button 
              onClick={() => window.open('/services', '_blank')} 
              className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              <span>Services</span>
            </button>
            <button onClick={() => setActiveTab('cms')} className={`flex flex-col items-center text-xs ${activeTab === 'cms' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              <Package className="w-6 h-6" />
              <span>CMS</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center text-xs ${activeTab === 'settings' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              <SettingsIcon className="w-6 h-6" />
              <span>Settings</span>
            </button>
          </div>
        </nav>
      )}

      <StatusViewer 
        isOpen={isStatusViewerOpen} 
        onClose={() => setIsStatusViewerOpen(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <RootContent />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
