import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  CheckCircle, 
  Star,
  Globe,
  FileText,
  Shield,
  Award
} from 'lucide-react';
import { Service } from '../../types';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { getTranslation } from '../../utils/translations';
import { useApp } from '../../context/AppContext';

interface ServiceDetailsProps {
  service: Service;
  onBack: () => void;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  service,
  onBack
}) => {
  const isMobile = useIsMobile();
  const { language } = useApp();
  const t = (key: string) => getTranslation(language, key);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business_immigration': return '🏢';
      case 'family_sponsorship': return '👨‍👩‍👧‍👦';
      case 'student_visa': return '🎓';
      case 'work_permit': return '💼';
      case 'citizenship': return '🏛️';
      case 'refugee_asylum': return '🤝';
      case 'appeals': return '⚖️';
      default: return '📋';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business_immigration': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'family_sponsorship': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'student_visa': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'work_permit': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'citizenship': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'refugee_asylum': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'appeals': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {service.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getCategoryColor(service.category)}`}>
                  {getCategoryIcon(service.category)} <span className="hidden sm:inline">{service.category.replace(/_/g, ' ')}</span>
                  <span className="sm:hidden">{service.category.replace(/_/g, ' ').split(' ')[0]}</span>
                </span>
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                  <MapPin className="w-3 h-3" />
                  {service.country}
                </span>
              </div>
            </div>
          </div>

          {/* Service Hero */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 sm:p-4 text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                {getCategoryIcon(service.category)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold mb-1 truncate">{service.name}</h2>
                <p className="text-green-100 text-xs sm:text-sm line-clamp-2">
                  {service.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Overview Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Key Features */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                Key Features
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {service.features?.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  Service Information
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Country:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{service.country}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Service Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {service.serviceType}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                      service.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  Language Support
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.languageSupport?.map((language, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs sm:text-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sub Services Content */}
          {service.subServices && service.subServices.length > 0 && (
            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                Available Sub-Services
              </h3>
              
              {service.subServices.map((subService) => (
                <div key={subService.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base truncate">
                        {subService.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm line-clamp-2">
                        {subService.description}
                      </p>
                      
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          {subService.country}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
