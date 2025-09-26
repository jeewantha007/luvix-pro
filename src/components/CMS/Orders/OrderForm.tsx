import React, { useEffect, useState } from 'react';
import { X, DollarSign, CreditCard, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Order } from '../../../types';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingOrder: Order | null;
  isSubmitting?: boolean;
}

type OrderFormState = {
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: Order['status'];
  paymentStatus: Order['paymentStatus'];
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  notes: string;
};

const OrderForm: React.FC<OrderFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingOrder,
  isSubmitting = false,
}) => {
  const { showError } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<OrderFormState>({
    orderNumber: '',
    customerId: '',
    customerName: '',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: '',
    shippingAddress: { street: '', city: '', postalCode: '', country: '' },
    billingAddress: { street: '', city: '', postalCode: '', country: '' },
    notes: '',
  });

  const requiredFields = ['customerId', 'customerName', 'paymentMethod'];

  const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `ORD-${timestamp}${random}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingOrder) {
      setFormData({
        orderNumber: editingOrder.orderNumber || '',
        customerId: editingOrder.customerId || editingOrder.customerId || '',
        customerName: editingOrder.customerName || editingOrder.customerName || '',
        status: editingOrder.status,
        paymentStatus: editingOrder.paymentStatus,
        paymentMethod: editingOrder.paymentMethod || '',
       shippingAddress: editingOrder?.shippingAddress || { street: '', city: '', postalCode: '', country: '' },
      billingAddress: editingOrder?.billingAddress || { street: '', city: '', postalCode: '', country: '' },
        notes: editingOrder.notes || '',
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        orderNumber: generateOrderNumber(),
        customerId: '',
        customerName: '',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: '',
        shippingAddress: { street: '', city: '', postalCode: '', country: '' },
        billingAddress: { street: '', city: '', postalCode: '', country: '' },
        notes: '',
      });
      setErrors({});
      setTouched({});
    }
  }, [editingOrder, isOpen]);

  const validateField = (fieldName: string, value: any): string => {
    if (requiredFields.includes(fieldName)) {
      if (!value) {
        if (fieldName === 'customerId') return 'Please enter a valid WhatsApp phone number';
        if (fieldName === 'customerName') return 'Please enter a customer name';
        if (fieldName === 'paymentMethod') return 'Please select a payment method';
      }
      if (fieldName === 'customerId' && !/^\+?\d{10,15}$/.test(value)) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    requiredFields.forEach(field => {
      const error = validateField(field, (formData as any)[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    if (!formData.customerId || !/^\+?\d{10,15}$/.test(formData.customerId)) return false;
    if (!formData.customerName) return false;
    if (!formData.paymentMethod) return false;
    return true;
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, (formData as any)[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleAddressChange = (type: 'shippingAddress' | 'billingAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = { customerId: true, customerName: true, paymentMethod: true };
    setTouched(allTouched);
    if (!validateForm()) {
      showError('Validation Failed', 'Please fix the errors before submitting.');
      return;
    }
    const orderPayload: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      orderNumber: formData.orderNumber,
      customerId: formData.customerId,
      customerName: formData.customerName,
      status: formData.status,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod,
      shippingAddress: formData.shippingAddress,
      billingAddress: formData.billingAddress,
      notes: formData.notes,
      products: [], // Assuming products might be handled elsewhere or not required
      totalAmount: 0, // Assuming totalAmount might be calculated elsewhere
    };
    onSubmit(orderPayload);
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
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {editingOrder ? 'Edit Order' : 'Add New Order'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Number</label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Phone (WhatsApp) *</label>
                    <input
                      type="text"
                      value={formData.customerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                      onBlur={() => handleFieldBlur('customerId')}
                      placeholder="+1234567890"
                      className={getFieldClassName('customerId', "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white")}
                    />
                    {touched.customerId && errors.customerId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.customerId}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      onBlur={() => handleFieldBlur('customerName')}
                      className={getFieldClassName('customerName', "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white")}
                    />
                    {touched.customerName && errors.customerName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.customerName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Order['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Shipping Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.street}
                      onChange={(e) => handleAddressChange('shippingAddress', 'street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleAddressChange('shippingAddress', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.postalCode}
                      onChange={(e) => handleAddressChange('shippingAddress', 'postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.country}
                      onChange={(e) => handleAddressChange('shippingAddress', 'country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Billing Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
                  <input
                    type="text"
                    value={formData.billingAddress.street}
                    onChange={(e) => handleAddressChange('billingAddress', 'street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.billingAddress.city}
                    onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.billingAddress.postalCode}
                    onChange={(e) => handleAddressChange('billingAddress', 'postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.billingAddress.country}
                    onChange={(e) => handleAddressChange('billingAddress', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as Order['paymentStatus'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    onBlur={() => handleFieldBlur('paymentMethod')}
                    className={getFieldClassName('paymentMethod', "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white")}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_payment">Mobile Payment</option>
                  </select>
                  {touched.paymentMethod && errors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.paymentMethod}
                    </p>
                  )}
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
                  placeholder="Additional notes about the order..."
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
            {isSubmitting ? 'Saving...' : (editingOrder ? 'Update Order' : 'Create Order')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;