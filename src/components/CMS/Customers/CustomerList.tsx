import React, { useMemo, useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, Users, ArrowLeft, X,
  Mail, Phone, MapPin, DollarSign, AlertTriangle
} from 'lucide-react';
import { Customer } from '../../../types';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  searchCustomers 
} from '../../../services/customerService';

interface CustomerListProps {
  selectedCustomer?: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onBack?: () => void;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
}

const CustomerList: React.FC<CustomerListProps> = ({
  selectedCustomer,
  onCustomerSelect,
  onBack
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: ''
  });
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'vip'>('all');
  const [minSpend, setMinSpend] = useState<string>('');
  const [maxSpend, setMaxSpend] = useState<string>('');
  const isMobile = useIsMobile();

  // Load customers from Supabase
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const customersData = await getCustomers();
        setCustomers(customersData);
      } catch (error) {
        console.error('Error loading customers:', error);
        // You might want to show a toast notification here
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  // Segment derivation based on totalSpent
  const getSegment = (totalSpent: number): 'bronze' | 'silver' | 'gold' | 'vip' => {
    if (totalSpent >= 5000) return 'vip';
    if (totalSpent >= 2000) return 'gold';
    if (totalSpent >= 500) return 'silver';
    return 'bronze';
  };

  const kpis = useMemo(() => {
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
    const totalOrders = customers.reduce((s, c) => s + (c.totalOrders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalCustomers, totalRevenue, totalOrders, avgOrderValue };
  }, [customers]);

  // Handle search with API, then apply client-side business filters
  useEffect(() => {
    const performSearch = async () => {
      let base: Customer[] = customers;
      if (searchTerm.trim()) {
        try {
          base = await searchCustomers(searchTerm);
        } catch (error) {
          console.error('Error searching customers:', error);
          base = [];
        }
      }

      // Apply segment and spend filters
      const min = minSpend ? parseFloat(minSpend) : Number.NEGATIVE_INFINITY;
      const max = maxSpend ? parseFloat(maxSpend) : Number.POSITIVE_INFINITY;
      const result = base.filter(c => {
        const seg = getSegment(c.totalSpent || 0);
        const inSegment = segmentFilter === 'all' ? true : seg === segmentFilter;
        const inSpend = (c.totalSpent || 0) >= min && (c.totalSpent || 0) <= max;
        return inSegment && inSpend;
      });
      setFilteredCustomers(result);
    };

    performSearch();
  }, [searchTerm, customers, segmentFilter, minSpend, maxSpend]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      notes: ''
    });
  };

  const handleAddCustomer = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    console.log('Edit customer clicked:', customer.name);
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      street: customer.address?.street || '',
      city: customer.address?.city || '',
      state: customer.address?.state || '',
      zipCode: customer.address?.zipCode || '',
      country: customer.address?.country || '',
      notes: customer.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeletingCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (deletingCustomer) {
      try {
        setIsDeleting(true);
        await deleteCustomer(deletingCustomer.id);
        setCustomers(prev => prev.filter(customer => customer.id !== deletingCustomer.id));
        setShowDeleteModal(false);
        setDeletingCustomer(null);
      } catch (error) {
        console.error('Error deleting customer:', error);
        // You might want to show a toast notification here
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSubmitAdd = async () => {
    try {
      setIsSubmitting(true);
      const newCustomer = await createCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // Keep address optional/minimal for product business
        address: formData.street || formData.city || formData.state || formData.zipCode || formData.country ? {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        } : undefined,
        notes: formData.notes,
        totalOrders: 0,
        totalSpent: 0
      });

      setCustomers(prev => [newCustomer, ...prev]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating customer:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingCustomer) return;

    try {
      setIsSubmitting(true);
      const updatedCustomer = await updateCustomer(editingCustomer.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.street || formData.city || formData.state || formData.zipCode || formData.country ? {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        } : undefined,
        notes: formData.notes
      });

      setCustomers(prev => prev.map(customer =>
        customer.id === editingCustomer.id ? updatedCustomer : customer
      ));
      setShowEditModal(false);
      setEditingCustomer(null);
      resetForm();
    } catch (error) {
      console.error('Error updating customer:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCustomerModal = (isEdit: boolean = false) => {
    const title = isEdit ? 'Edit Customer' : 'Add New Customer';
    const submitText = isEdit ? 'Update Customer' : 'Add Customer';
    const onSubmit = isEdit ? handleSubmitEdit : handleSubmitAdd;
    const onClose = () => {
      if (isEdit) {
        setShowEditModal(false);
        setEditingCustomer(null);
      } else {
        setShowAddModal(false);
      }
      resetForm();
    };

    return (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
         <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[95vh] flex flex-col">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter phone number"
                  />
                </div>


              </div>

              {/* Address Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter ZIP code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter customer notes"
                />
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!formData.name || isSubmitting}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                submitText
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!deletingCustomer) return null;

    return (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
         <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Delete Customer</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{deletingCustomer.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCustomer(null);
                }}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCustomer}
                disabled={isDeleting}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isMobile && selectedCustomer) {
    return (
      <div className="w-full bg-white dark:bg-gray-800">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            <span className="text-sm sm:text-base">Back to Customers</span>
          </button>
        </div>
        {/* Customer details will be implemented here */}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Customers</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{kpis.totalCustomers} customers • {kpis.totalOrders} orders • ${kpis.totalRevenue.toFixed(0)} revenue • AOV ${kpis.avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={handleAddCustomer}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Add Customer</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm text-sm sm:text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Segment</label>
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min Spend ($)</label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Spend ($)</label>
              <input
                type="number"
                value={maxSpend}
                onChange={(e) => setMaxSpend(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="∞"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto h-full">
        {isLoading ? (
          <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 sm:h-24 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="text-center max-w-sm sm:max-w-md">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                {searchTerm ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                {searchTerm
                  ? 'Try adjusting your search terms or browse all customers'
                  : 'Get started by adding your first customer to the database'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddCustomer}
                  className="inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Add First Customer</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
            {filteredCustomers.map((customer) => {
              const isSelected = selectedCustomer?.id === customer.id;

              return (
                <div
                  key={customer.id}
                  onClick={() => onCustomerSelect(customer)}
                  className={`group relative bg-white dark:bg-gray-800 rounded-lg border cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${isSelected
                      ? 'border-green-500 shadow-md shadow-green-500/20 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="p-2.5 sm:p-3 md:p-4">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      {/* Customer Avatar */}
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-700 dark:to-green-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                        {/* Customer Status Badge */}
                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-sm bg-green-500">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
                              {customer.name}
                            </h3>

                            {/* Contact and Stats Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 sm:px-1.5 sm:px-2 py-0.5 rounded">
                                  {customer.totalOrders} orders
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/20 px-1 sm:px-1.5 sm:px-2 py-0.5 rounded">
                                  ${customer.totalSpent.toFixed(0)}
                                </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-purple-100 dark:bg-purple-900/20 px-1 sm:px-1.5 sm:px-2 py-0.5 rounded capitalize">
                                {getSegment(customer.totalSpent)}
                              </span>
                              </div>

                              {/* Customer Status */}
                              <span className="text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 self-start sm:self-auto">
                                Active
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0 ml-2 sm:ml-3 z-10 relative">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Edit button clicked for:', customer.name);
                                handleEditCustomer(customer);
                              }}
                              className="p-1 sm:p-1 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md z-10 relative"
                              title="Edit Customer"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onCustomerSelect(customer);
                              }}
                              className="p-1 sm:p-1 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md z-10 relative"
                              title="View Orders"
                            >
                              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Delete button clicked for:', customer.name);
                                handleDeleteCustomer(customer);
                              }}
                              className="p-1 sm:p-1 bg-white dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md z-10 relative"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                          {customer.email && (
                            <div className="flex items-center space-x-1.5">
                              <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {customer.email}
                              </span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center space-x-1.5">
                              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {customer.phone}
                              </span>
                            </div>
                          )}
                          {customer.address?.city && customer.address?.state && (
                            <div className="flex items-center space-x-1.5">
                              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                {customer.address.city}, {customer.address.state}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1.5">
                            <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              Total: <span className="font-medium text-gray-900 dark:text-white">${customer.totalSpent.toFixed(2)}</span>
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {customer.notes && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {customer.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 rounded-lg border-2 border-transparent transition-all duration-300 pointer-events-none ${isSelected ? 'border-green-500' : 'group-hover:border-gray-300 dark:group-hover:border-gray-600'
                    }`}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && renderCustomerModal(false)}
      {showEditModal && renderCustomerModal(true)}
      {showDeleteModal && renderDeleteModal()}
    </div>
  );
};

export default CustomerList;
