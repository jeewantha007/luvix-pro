import React from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  HelpCircle, 
  Info,
  ChevronRight,
  Moon,
  Globe,
  Download,
  Trash2,
  LogOut,
  CreditCard
} from 'lucide-react';
import { supabase } from '../../../data/supabaseClient';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Profile from '../Profile/Profile';
import { useIsMobile } from '../../hooks/useMediaQuery';

import { getTranslation } from '../../utils/translations';

interface SettingsItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  toggle?: boolean;
  danger?: boolean;
}

interface SettingsProps {
  onShowStorageData?: () => void;
  onShowLanguagePanel?: () => void;
}

interface SettingsGroup {
  title: string;
  items: SettingsItem[];
}

const Settings: React.FC<SettingsProps> = ({ onShowStorageData, onShowLanguagePanel }) => {
  const { currentUser, showProfile, setShowProfile, theme, toggleTheme, language } = useApp();
  const isMobile = useIsMobile();
  
  const t = (key: string) => getTranslation(language, key);
  const { showError } = useToast();
  
  const getThemeDescription = () => {
    return theme === 'light' ? 'Light mode' : 'Dark mode';
  };

  const getLanguageDescription = () => {
    const languageNames: { [key: string]: string } = {
      'en': 'English (US)',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'tr': 'Turkish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish',
      'pl': 'Polish',
      'cs': 'Czech',
      'sk': 'Slovak',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'hr': 'Croatian',
      'sr': 'Serbian',
      'sl': 'Slovenian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'mt': 'Maltese',
      'el': 'Greek',
      'he': 'Hebrew',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tl': 'Filipino',
      'ur': 'Urdu',
      'fa': 'Persian',
      'am': 'Amharic',
      'sw': 'Swahili',
      'zu': 'Zulu',
      'af': 'Afrikaans',
      'is': 'Icelandic',
      'ga': 'Irish',
      'cy': 'Welsh',
      'eu': 'Basque',
      'ca': 'Catalan',
      'gl': 'Galician'
    };
    return languageNames[language] || 'English (US)';
  };

  // No subscription cancellation logic needed when using Stripe Billing Portal

  const settingsGroups: SettingsGroup[] = [
    {
      title: t('settings.account'),
      items: [
        { icon: User, label: t('settings.profile'), description: 'Name, phone, about' },
        { icon: Shield, label: t('settings.privacy'), description: 'Last seen, read receipts, groups' },
        { icon: Bell, label: t('settings.notifications'), description: 'Message, group & call tones' },
        { icon: Download, label: t('settings.storageAndData'), description: 'Network usage, auto-download' },
        { icon: CreditCard, label: 'Manage Subscription', description: 'Open Stripe Billing Portal' }
      ]
    },
    {
      title: t('settings.appearance'),
      items: [
        { icon: Palette, label: t('settings.theme'), description: getThemeDescription(), toggle: true },
        { icon: Globe, label: t('settings.language'), description: getLanguageDescription() }
      ]
    },
    {
      title: t('settings.support'),
      items: [
        { icon: HelpCircle, label: t('settings.help'), description: t('settings.helpCenter') },
        { icon: Info, label: t('settings.about'), description: t('settings.version') }
      ]
    },
    {
      title: t('settings.data'),
      items: [
        { icon: Trash2, label: t('settings.clearChatHistory'), description: t('settings.deleteAllMessages'), danger: true },
        { icon: LogOut, label: t('settings.logOut'), description: t('settings.signOutOfLuvix'), danger: true }
      ]
    }
  ];

  async function openBillingPortal() {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${API_BASE}/api/payments/create-billing-portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to create billing portal session');
    return res.json();
  }

  const handleItemClick = async (label: string) => {
    if (label === t('settings.profile')) {
      setShowProfile(true);
    } else if (label === t('settings.storageAndData')) {
      if (onShowStorageData) {
        onShowStorageData();
      }
    } else if (label === t('settings.theme')) {
      toggleTheme();
    } else if (label === t('settings.language')) {
      onShowLanguagePanel?.();
    } else if (label === 'Manage Subscription') {
      try {
        const data = await openBillingPortal();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          showError('Unable to open portal', 'No portal URL returned');
        }
      } catch (e) {
        showError('Unable to open portal', 'Please try again later.');
      }
    } else if (label === t('settings.logOut')) {
      await supabase.auth.signOut();
    }
  };

  // In mobile mode, show Profile component when showProfile is true
  if (isMobile && showProfile) {
    return <Profile onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className={`w-full ${isMobile ? 'h-screen' : 'h-full'} lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col ${isMobile ? 'overflow-hidden' : ''}`}>
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('settings.title')}</h1>
        
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser?.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=150'}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{currentUser?.name || 'User'}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{currentUser?.phone || ''}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">{currentUser ? t('common.online') : t('common.offline')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings List - Scrollable */}
      <div className={`flex-1 ${isMobile ? 'overflow-y-auto overscroll-contain' : 'overflow-y-auto'} ${isMobile ? 'min-h-0' : ''}`}>
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                {group.title}
              </h3>
              
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => handleItemClick(item.label)}
                      className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left ${
                        item.danger ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.danger
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className={`text-sm truncate text-gray-500 dark:text-gray-400`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {item.toggle && item.label === 'Theme' ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
                            {theme === 'light' ? (
                              <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                            ) : (
                              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            )}
                          </div>
                        </div>
                      ) : item.toggle ? (
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            defaultChecked={false}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
                        </div>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Fixed height */}
      <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">LUVIX v1.0.0</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Made with ❤️ for secure communication</p>
      </div>
      
      {/* No cancel modal when using Stripe Billing Portal */}

    </div>
  );
};

export default Settings;