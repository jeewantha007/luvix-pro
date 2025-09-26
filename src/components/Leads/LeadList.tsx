import React, { useState } from 'react';
import { 
  Search, Target, Phone, Mail, Building, Clock, Plus,
  Edit, Trash2, X, AlertCircle,
} from 'lucide-react';
import { Lead } from '../../types';
import { useApp } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { 
  cleanPhoneForDisplay, 
  cleanDescriptionForDisplay, 
  formatDateForDisplay 
} from '../../utils/displayHelpers';

interface LeadListProps {
  selectedLead?: Lead | null;
  onLeadSelect: (lead: Lead | null) => void;
  onAddLead?: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateLead?: (id: string, updates: Partial<Lead>) => void;
  onDeleteLead?: (id: string) => void;
}

// Validation errors type - using the same pattern as AddActivityModal and AddTaskModal
interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
}

const LeadList: React.FC<LeadListProps> = ({ 
  selectedLead, 
  onLeadSelect, 
  onAddLead, 
  onUpdateLead, 
  onDeleteLead 
}) => {
  const { leads } = useApp();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state for adding/editing leads
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    source: 'website' as Lead['source'],
    status: 'new' as Lead['status']
  });

  // Validation state - using the same pattern as working modals
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions - using the same pattern as working modals
  const validateName = (name: string): string | undefined => {
    if (name.trim() && name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (name.trim() && name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
      }
      if (email.length > 100) {
        return 'Email must be less than 100 characters';
      }
    }
    return undefined;
  };

  // FIXED: Phone validation now accepts valid 10-digit numbers
  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (cleanPhone.length > 15) {
      return 'Phone number must be less than 15 digits';
    }
    
    // FIXED: More flexible phone validation - accept common formats
    // Allow numbers starting with 0, 1-9, or country codes
    // This will now accept valid 10-digit numbers like: 1234567890, 0987654321, etc.
    const phoneRegex = /^[\+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return 'Please enter a valid phone number';
    }
    
    return undefined;
  };

  const validateDescription = (description: string): string | undefined => {
    if (description.trim() && description.trim().length < 5) {
      return 'Description must be at least 5 characters long';
    }
    if (description.trim() && description.trim().length > 500) {
      return 'Description must be less than 500 characters';
    }
    return undefined;
  };

  // validateForm function - using the same pattern as working modals
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const descriptionError = validateDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'proposal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'negotiation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'won': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSourceIcon = (source: Lead['source']) => {
    switch (source) {
      case 'website': return <Building className="w-4 h-4" />;
      case 'whatsapp': return <Phone className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'referral': return <Target className="w-4 h-4" />;
      case 'social': return <Mail className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleAddLead = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newLead = {
        ...formData
      };
      
      await onAddLead?.(newLead);
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updates = {
        ...formData
      };
      
      await onUpdateLead?.(editingLead.id, updates);
      resetForm();
      setEditingLead(null);
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = (id: string) => {
    onDeleteLead?.(id);
    setShowDeleteConfirm(null);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone,
      description: lead.description || '',
      source: lead.source,
      status: lead.status
    });
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      description: '',
      source: 'website',
      status: 'new'
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const filteredLeads = leads.filter(lead => {
    return lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lead.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No leads found</p>
            <p className="text-sm">Start by adding your first lead</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => onLeadSelect(lead)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedLead?.id === lead.id
                    ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getSourceIcon(lead.source)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {lead.name || cleanPhoneForDisplay(lead.phone)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{cleanPhoneForDisplay(lead.phone)}</span>
                    </div>
                    {lead.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {cleanDescriptionForDisplay(lead.description)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLead(lead);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(lead.id);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>{formatDate(lead.createdAt)}</span>
                  <span>{formatTime(lead.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Lead Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLead(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Form */}
            <form className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter lead name"
                  />
                  {errors.name && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter phone number (e.g., 1234567890)"
                    required
                  />
                  {errors.phone && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
                      errors.description 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter lead description"
                  />
                  {errors.description && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as Lead['source'] }))}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="website">Website</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Lead['status'] }))}
                    className="w-full p-2.5 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>
            </form>

            {/* Fixed Footer */}
            <div className="flex items-center justify-end space-x-3 p-3 sm:p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLead(null);
                  resetForm();
                }}
                className="px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editingLead ? handleUpdateLead : handleAddLead}
                disabled={isSubmitting}
                className="px-3 sm:px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingLead ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingLead ? 'Update Lead' : 'Add Lead'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Delete Lead</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
              Are you sure you want to delete this lead? This will permanently remove it from your leads list.
            </p>
            
            <div className="flex flex-row items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 sm:px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLead(showDeleteConfirm)}
                className="px-3 sm:px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;
