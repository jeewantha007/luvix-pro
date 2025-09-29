import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Address, Customer } from '../../../types';
import { createCustomer as createClient, updateCustomer as updateClient } from '../../../services/customerService';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingCustomer: Customer | null;
  isSubmitting?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCustomer,
  isSubmitting = false,
}) => {
  const { showError } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    notes: ''
  });

  const requiredFields = ['name'];

  useEffect(() => {
    if (!isOpen) return;
    if (editingCustomer) {
      // Handle address data more robustly
      const addressData = editingCustomer.address || {};
      
      setFormData({
        name: editingCustomer.name || '',
        email: editingCustomer.email || '',
        phone: editingCustomer.phone || '',
        address: {
          street: (addressData as Address).street || '',
          city: (addressData as Address).city || '',
          state: (addressData as Address).state || '',
          zipCode: (addressData as Address).zipCode || (addressData as any).postalCode || '',
          country: (addressData as Address).country || ''
        },
        notes: editingCustomer.notes || ''
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        notes: ''
      });
      setErrors({});
      setTouched({});
    }
  }, [editingCustomer, isOpen]);

  const validateField = (fieldName: string, value: any): string => {
    if (requiredFields.includes(fieldName) && !value) {
      return 'This field is required';
    }
    
    if (fieldName === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    
    if (fieldName === 'phone' && value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
      return 'Please enter a valid phone number';
    }
    
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    requiredFields.forEach(field => {
      const error = validateField(field, (formData as any)[field]);
      if (error) newErrors[field] = error;
    });
    
    // Validate email if provided
    if (formData.email) {
      const emailError = validateField('email', formData.email);
      if (emailError) newErrors.email = emailError;
    }
    
    // Validate phone if provided
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return formData.name.trim() !== '';
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, (formData as any)[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = { name: true };
    setTouched(allTouched);
    
    if (!validateForm()) {
      showError('Validation Failed', 'Please fix the errors before submitting.');
      return;
    }
    
    try {
      const customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address.street || formData.address.city || formData.address.state || 
                 formData.address.zipCode || formData.address.country ? formData.address : undefined,
        notes: formData.notes || undefined,
        totalOrders: 0,
        totalSpent: 0
      };
      
      await onSubmit(customerData);
    } catch (error: any) {
      showError('Customer Save Failed', error.message || 'Failed to save customer. Please try again.');
    }
  };

  const getFieldClassName = (fieldName: string, baseClassName: string) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const isValid = touched[fieldName] && !errors[fieldName] && (formData as any)[fieldName];
    if (hasError) return `${baseClassName} border-red-500 focus:ring-red-500 focus:border-red-500`;
    if (isValid) return `${baseClassName} border-green-500 focus:ring-green-500 focus:border-green-500`;
    return baseClassName;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    onBlur={() => handleFieldBlur('name')}
                    placeholder="Enter customer's full name"
                    className={getFieldClassName('name', "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white")}
                  />
                  {touched.name && errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        onBlur={() => handleFieldBlur('email')}
                        placeholder="customer@example.com"
                        className={getFieldClassName('email', "w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white")}
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        onBlur={() => handleFieldBlur('phone')}
                        placeholder="+1 (555) 123-4567"
                        className={getFieldClassName('phone', "w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white")}
                      />
                    </div>
                    {touched.phone && errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="Street address"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State/Province</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="State or Province"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP/Postal Code</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    placeholder="ZIP or Postal Code"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Additional Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional notes about the customer..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isSubmitting || !isFormValid() ? '#9ca3af' : '#168740' }}
            onMouseEnter={(e) => {
              if (!isSubmitting && isFormValid()) {
                e.currentTarget.style.backgroundColor = '#0d5a2b';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && isFormValid()) {
                e.currentTarget.style.backgroundColor = '#168740';
              }
            }}
            disabled={isSubmitting || !isFormValid()}
            title={!isFormValid() ? 'Please complete required fields' : ''}
          >
            {isSubmitting ? 'Saving...' : (editingCustomer ? 'Update Customer' : 'Create Customer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;