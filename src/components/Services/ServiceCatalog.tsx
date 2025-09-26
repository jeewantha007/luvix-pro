import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Globe, MapPin, Users, CheckCircle, ArrowRight, Eye } from 'lucide-react';
import { Service } from '../../types';
import { getMainServicesWithSubServices } from '../../services/serviceService';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { getTranslation } from '../../utils/translations';
import { useApp } from '../../context/AppContext';
import ServiceDetails from './ServiceDetails';

const ServiceCatalog: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const isMobile = useIsMobile();
  const { language } = useApp();
  const t = (key: string) => getTranslation(language, key);

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await getMainServicesWithSubServices();
        setServices(data);
        setFilteredServices(data);
      } catch (err) {
        setError('Failed to load services');
        console.error('Error loading services:', err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter services based on search
  useEffect(() => {
    let filtered = services;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, searchTerm]);



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

  if (selectedService) {
    return (
      <ServiceDetails
        service={selectedService}
        onBack={() => setSelectedService(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading immigration services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Immigration Services Catalog
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Internal service management for Devisers Immigration staff
              </p>
            </div>
            
            {/* Search and View Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services, countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-64"
                />
              </div>
              
              {/* View Mode Toggle */}
              {!isMobile && (
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    <div className="w-4 h-4 flex flex-col gap-1">
                      <div className="h-0.5 bg-current rounded"></div>
                      <div className="h-0.5 bg-current rounded"></div>
                      <div className="h-0.5 bg-current rounded"></div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Services Grid/List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
              : `space-y-4`
            }>
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  viewMode={viewMode}
                  onView={() => setSelectedService(service)}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Service Card Component
interface ServiceCardProps {
  service: Service;
  viewMode: 'grid' | 'list';
  onView: () => void;
  getCategoryIcon: (category: string) => string;
  getCategoryColor: (category: string) => string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  viewMode,
  onView,
  getCategoryIcon,
  getCategoryColor
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
            {/* Service Image/Icon */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl flex-shrink-0">
              {getCategoryIcon(service.category)}
            </div>
            
            {/* Service Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {service.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getCategoryColor(service.category)}`}>
                  {service.category.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  {service.country}
                </div>
                {service.subServices && service.subServices.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{service.subServices.length} sub-services</span>
                    <span className="sm:hidden">{service.subServices.length} sub</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2">
                {service.description}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
      {/* Service Header */}
      <div className="relative">
        <div className="h-32 sm:h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl sm:text-4xl">
          {getCategoryIcon(service.category)}
        </div>
        
        {/* Category Badge */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800`}>
            <span className="hidden sm:inline">{service.category.replace(/_/g, ' ')}</span>
            <span className="sm:hidden">{service.category.replace(/_/g, ' ').split(' ')[0]}</span>
          </span>
        </div>
      </div>
      
      {/* Service Content */}
      <div className="p-3 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {service.name}
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{service.country}</span>
          </div>
          {service.subServices && service.subServices.length > 0 && (
            <>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{service.subServices.length} sub-services</span>
                <span className="sm:hidden">{service.subServices.length} sub</span>
              </div>
            </>
          )}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
          {service.description}
        </p>
        
        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
            {service.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
              >
                {feature}
              </span>
            ))}
            {service.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                +{service.features.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={onView}
            className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 group-hover:shadow-md text-sm"
          >
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">View</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalog;
