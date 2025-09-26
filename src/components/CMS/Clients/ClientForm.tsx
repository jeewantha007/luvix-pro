import React, { useState, useEffect, useRef } from 'react';
import { X, User, FileText, Home, Upload, Trash2 } from 'lucide-react';
import { Client, Address } from '../../../types';
import { useToast } from '../../../context/ToastContext';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>, photoFile?: File | null) => void;
  editingClient: Client | null;
  isSubmitting: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingClient,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    currentCountry: '',
    targetCountry: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    } as Address,
    notes: '',
    totalCases: 0,
    totalSpent: 0,
    status: 'active' as Client['status']
  });

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation state
  type ValidationErrors = {
    name?: string;
    email?: string;
    phone?: string;
  };
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { showError } = useToast();

  // Populate form when editing
  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name,
        email: editingClient.email || '',
        phone: editingClient.phone || '',
        dateOfBirth: editingClient.dateOfBirth ? editingClient.dateOfBirth.toISOString().split('T')[0] : '',
        nationality: editingClient.nationality || '',
        currentCountry: editingClient.currentCountry || '',
        targetCountry: editingClient.targetCountry || '',
        address: editingClient.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        notes: editingClient.notes || '',
        totalCases: editingClient.totalCases,
        totalSpent: editingClient.totalSpent,
        status: editingClient.status
      });
      
      // Set photo preview if editing client has a photo
      setPhotoPreview(editingClient.photoUrl || null);
      setPhotoFile(null);
      
      // Clear errors when editing
      setErrors({});
    } else {
      // Reset form for new client
      setFormData({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: '',
        currentCountry: '',
        targetCountry: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        notes: '',
        totalCases: 0,
        totalSpent: 0,
        status: 'active'
      });
      
      // Reset photo state for new client
      setPhotoPreview(null);
      setPhotoFile(null);
      
      // Clear errors for new client
      setErrors({});
    }
  }, [editingClient, isOpen]);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters long';
    }
    if (name.trim().length > 100) {
      return 'Full name must be less than 100 characters';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (phone.trim()) {
      // Remove all non-digit characters except + at the beginning
      const cleanedPhone = phone.replace(/[^\d+]/g, '');
      
      // Check if it starts with + and has 7-15 digits, or just has 7-15 digits
      if (!/^(\+?[1-9]\d{6,14})$/.test(cleanedPhone)) {
        return 'Please enter a valid phone number (7-15 digits)';
      }
    }
    return undefined;
  };

  // Country, emergency, and address validations removed for product customers

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate required fields
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    // nationality/currentCountry/targetCountry/address are optional for product customers

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for submit button state
  const isFormValid = () => {
    return !!formData.name.trim();
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Emergency contact removed for product customers

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const clientData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      criminalRecord: false
    };

    onSubmit(clientData, photoFile);
  };



  // Photo handling functions
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        showError('Invalid File Type', 'Please select a valid image file (JPEG, PNG, WebP, or GIF)');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showError('File Too Large', 'File size too large. Maximum size is 5MB.');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Customer Information
               </h3>
              <div className="space-y-4">
                {/* Photo Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Photo
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Photo Preview */}
                    <div className="relative">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Client photo preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={handlePhotoRemove}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-xl border-2 border-gray-200 dark:border-gray-600">
                          {formData.name.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Controls */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPEG, PNG, WebP, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Optional: DOB */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>

            {/* Address (Optional) */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                Address (optional)
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Street Address" value={formData.address.street} onChange={(e) => handleAddressChange('street', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="text" placeholder="City" value={formData.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="text" placeholder="State/Province" value={formData.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="text" placeholder="ZIP/Postal Code" value={formData.address.zipCode} onChange={(e) => handleAddressChange('zipCode', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <input type="text" placeholder="Country" value={formData.address.country} onChange={(e) => handleAddressChange('country', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md:col-span-2" />
                </div>
              </div>
            </div>
          </div>
          {/* Additional Information */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
               Additional Information
             </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as Client['status'])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional notes about the client..."
                />
              </div>
            </div>
          </div>

        </form>
        </div>
        
        {/* Fixed Footer */}
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
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? 'Saving...' : (editingClient ? 'Update Client' : 'Create Client')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientForm; 