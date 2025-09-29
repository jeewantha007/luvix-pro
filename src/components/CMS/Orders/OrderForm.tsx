import React, { useEffect, useState } from 'react';
import { X, DollarSign, CreditCard, FileText, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Order, OrderItem } from '../../../types';
import { getProducts } from '../../../services/productService';
import { getCustomers } from '../../../services/customerService';

// Define the product type from productService
interface ServiceProduct {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  brand?: string;
  images?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingOrder: Order | null;
  isSubmitting?: boolean;
}

type OrderFormState = {
  orderNumber: string;
  contactNo: string;
  customerName: string;
  customerEmail: string;
  status: Order['status'];
  paymentStatus: Order['paymentStatus'];
  paymentMethod: string;
  shippingAddress: { street: string; city: string; postalCode: string; country: string };
  billingAddress: { street: string; city: string; postalCode: string; country: string };
  notes: string;
  items: OrderItem[];
  sameAsBilling: boolean;
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
    contactNo: '',
    customerName: '',
    customerEmail: '',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: '',
    shippingAddress: { street: '', city: '', postalCode: '', country: '' },
    billingAddress: { street: '', city: '', postalCode: '', country: '' },
    notes: '',
    items: [],
    sameAsBilling: false,
  });
  
  const [products, setProducts] = useState<ServiceProduct[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const requiredFields = ['contactNo', 'customerName', 'paymentMethod'];

  // Fetch products and customers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, customersData] = await Promise.all([
          getProducts(),
          getCustomers(),
        ]);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showError('Data Load Error', 'Failed to load products or customers');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, showError]);

  const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `ORD-${timestamp}${random}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingOrder) {
      const sameAsBilling = JSON.stringify(editingOrder.shippingAddress) === JSON.stringify(editingOrder.billingAddress);
      setFormData({
        orderNumber: editingOrder.orderNumber || '',
        contactNo: editingOrder.contactNo || '',
        customerName: editingOrder.customerName || '',
        customerEmail: '',
        status: editingOrder.status,
        paymentStatus: editingOrder.paymentStatus,
        paymentMethod: editingOrder.paymentMethod || '',
        shippingAddress: {
          street: editingOrder.shippingAddress?.street || '',
          city: editingOrder.shippingAddress?.city || '',
          postalCode: editingOrder.shippingAddress?.postalCode || '',
          country: editingOrder.shippingAddress?.country || '',
        },
        billingAddress: {
          street: editingOrder.billingAddress?.street || '',
          city: editingOrder.billingAddress?.city || '',
          postalCode: editingOrder.billingAddress?.postalCode || '',
          country: editingOrder.billingAddress?.country || '',
        },
        notes: editingOrder.notes || '',
        items: editingOrder.items || [],
        sameAsBilling,
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        orderNumber: generateOrderNumber(),
        contactNo: '',
        customerName: '',
        customerEmail: '',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: '',
        shippingAddress: { street: '', city: '', postalCode: '', country: '' },
        billingAddress: { street: '', city: '', postalCode: '', country: '' },
        notes: '',
        items: [],
        sameAsBilling: false,
      });
      setErrors({});
      setTouched({});
    }
  }, [editingOrder, isOpen]);

  const validateField = (fieldName: string, value: any): string => {
    if (requiredFields.includes(fieldName)) {
      if (!value) {
        if (fieldName === 'contactNo') return 'Please enter a customer phone number';
        if (fieldName === 'customerName') return 'Please enter a customer name';
        if (fieldName === 'paymentMethod') return 'Please select a payment method';
      }
      if (fieldName === 'contactNo' && value && !/^\+?\d{10,15}$/.test(value)) {
        return 'Please enter a valid phone number';
      }
    }
    if (fieldName === 'customerEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    requiredFields.forEach(field => {
      const error = validateField(field, (formData as any)[field]);
      if (error) newErrors[field] = error;
    });
    if (formData.contactNo) {
      const contactNoError = validateField('contactNo', formData.contactNo);
      if (contactNoError) newErrors.contactNo = contactNoError;
    }
    if (formData.items.length === 0) {
      newErrors.items = 'Please add at least one product to the order';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    if (!formData.contactNo) return false;
    if (!formData.customerName) return false;
    if (!formData.paymentMethod) return false;
    if (formData.items.length === 0) return false;
    return true;
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, (formData as any)[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleAddressChange = (type: 'shippingAddress' | 'billingAddress', field: string, value: string) => {
    setFormData(prev => {
      const updatedForm = {
        ...prev,
        [type]: { ...prev[type], [field]: value },
      };
      if (type === 'billingAddress' && prev.sameAsBilling) {
        updatedForm.shippingAddress = { ...updatedForm.billingAddress };
      }
      return updatedForm;
    });
  };

  const handleSameAsBillingToggle = () => {
    setFormData(prev => {
      const newSameAsBilling = !prev.sameAsBilling;
      return {
        ...prev,
        sameAsBilling: newSameAsBilling,
        shippingAddress: newSameAsBilling ? { ...prev.billingAddress } : prev.shippingAddress,
      };
    });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          productName: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...formData.items];
    
    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          productName: selectedProduct.name,
          unitPrice: selectedProduct.price,
          totalPrice: selectedProduct.price * (updatedItems[index].quantity || 1),
        };
      }
    } else if (field === 'quantity') {
      const quantity = Number(value) || 0;
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        totalPrice: (updatedItems[index].unitPrice || 0) * quantity,
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = { contactNo: true, customerName: true, paymentMethod: true, items: true };
    setTouched(allTouched);
    if (!validateForm()) {
      showError('Validation Failed', 'Please fix the errors before submitting.');
      return;
    }
    
    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      const orderPayload: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orderNumber: formData.orderNumber,
        customerId: '',
        contactNo: formData.contactNo,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod as 'cash' | 'card' | 'bank_transfer' | 'other' | undefined,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress,
        notes: formData.notes,
        items: formData.items,
        totalAmount,
      };
      
      await onSubmit(orderPayload);
      onClose();
    } catch (error: any) {
      showError('Order Creation Failed', error.message || 'Failed to create order. Please try again.');
    }
  };

  const getFieldClassName = (fieldName: string) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const isValid = touched[fieldName] && !errors[fieldName] && (formData as any)[fieldName];
    return `w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      hasError
        ? 'border-red-400 focus:ring-red-400'
        : isValid
        ? 'border-green-400 focus:ring-green-400'
        : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`;
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingOrder ? 'Edit Order' : 'Create New Order'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mb-4"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading products and customers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingOrder ? 'Edit Order' : 'Create New Order'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Order Number</label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Customer Phone (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactNo: e.target.value }))}
                      onBlur={() => handleFieldBlur('contactNo')}
                      placeholder="+1234567890"
                      className={getFieldClassName('contactNo')}
                    />
                    {touched.contactNo && errors.contactNo && (
                      <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.contactNo}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      onBlur={() => handleFieldBlur('customerName')}
                      className={getFieldClassName('customerName')}
                    />
                    {touched.customerName && errors.customerName && (
                      <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.customerName}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Customer Email</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      onBlur={() => handleFieldBlur('customerEmail')}
                      placeholder="customer@example.com"
                      className={getFieldClassName('customerEmail')}
                    />
                    {touched.customerEmail && errors.customerEmail && (
                      <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.customerEmail}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Order['status'] }))}
                      className={getFieldClassName('status')}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.sameAsBilling}
                      onChange={handleSameAsBillingToggle}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    Same as Billing Address
                  </label>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.street}
                      onChange={(e) => handleAddressChange('shippingAddress', 'street', e.target.value)}
                      disabled={formData.sameAsBilling}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        formData.sameAsBilling
                          ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                          : getFieldClassName('shippingAddress.street')
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleAddressChange('shippingAddress', 'city', e.target.value)}
                      disabled={formData.sameAsBilling}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        formData.sameAsBilling
                          ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                          : getFieldClassName('shippingAddress.city')
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Postal Code</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.postalCode}
                      onChange={(e) => handleAddressChange('shippingAddress', 'postalCode', e.target.value)}
                      disabled={formData.sameAsBilling}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        formData.sameAsBilling
                          ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                          : getFieldClassName('shippingAddress.postalCode')
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.country}
                      onChange={(e) => handleAddressChange('shippingAddress', 'country', e.target.value)}
                      disabled={formData.sameAsBilling}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        formData.sameAsBilling
                          ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                          : getFieldClassName('shippingAddress.country')
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Order Items
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Item
                </button>
              </div>
              
              {errors.items && touched.items && (
                <div className="mb-4 text-sm text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.items}
                </div>
              )}
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Product <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          className={getFieldClassName(`items[${index}].productId`)}
                        >
                          <option value="">Select a product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                        
                        {item.productId && (
                          <div className="mt-3">
                            {(() => {
                              const selectedProduct = products.find(p => p.id === item.productId);
                              const images = selectedProduct?.images || [];
                              return images.length > 0 ? (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                  <div className="flex-shrink-0 relative">
                                    <img 
                                      src={images[0]} 
                                      alt={selectedProduct?.name || 'Product'} 
                                      className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-600"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                    {images.length > 1 && (
                                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" title={`${images.length} images`}>
                                        +{images.length - 1}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {selectedProduct?.name || 'Product'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      ${selectedProduct?.price.toFixed(2) || '0.00'}
                                    </p>
                                    {images.length > 1 && (
                                      <div className="flex gap-1 mt-1">
                                        {images.slice(0, 3).map((img, idx) => (
                                          <div key={idx} className="w-4 h-4 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                                            <img 
                                              src={img} 
                                              alt={`Preview ${idx + 1}`} 
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                              }}
                                            />
                                          </div>
                                        ))}
                                        {images.length > 3 && (
                                          <div className="w-4 h-4 rounded border border-gray-200 dark:border-gray-600 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">+{images.length - 3}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                  <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center">No image</span>
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {selectedProduct?.name || 'Product'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      ${selectedProduct?.price.toFixed(2) || '0.00'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className={getFieldClassName(`items[${index}].quantity`)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit Price</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            readOnly
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.totalPrice?.toFixed(2) || '0.00'}
                            readOnly
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-1 flex items-start justify-center pt-8">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.items.length === 0 && (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-base">No items added yet. Click "Add Item" to include products in this order.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Billing Address
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street</label>
                  <input
                    type="text"
                    value={formData.billingAddress.street}
                    onChange={(e) => handleAddressChange('billingAddress', 'street', e.target.value)}
                    className={getFieldClassName('billingAddress.street')}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.billingAddress.city}
                    onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                    className={getFieldClassName('billingAddress.city')}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    value={formData.billingAddress.postalCode}
                    onChange={(e) => handleAddressChange('billingAddress', 'postalCode', e.target.value)}
                    className={getFieldClassName('billingAddress.postalCode')}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
                  <input
                    type="text"
                    value={formData.billingAddress.country}
                    onChange={(e) => handleAddressChange('billingAddress', 'country', e.target.value)}
                    className={getFieldClassName('billingAddress.country')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as Order['paymentStatus'] }))}
                    className={getFieldClassName('paymentStatus')}
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    onBlur={() => handleFieldBlur('paymentMethod')}
                    className={getFieldClassName('paymentMethod')}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_payment">Mobile Payment</option>
                  </select>
                  {touched.paymentMethod && errors.paymentMethod && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Additional Information
              </h3>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className={getFieldClassName('notes')}
                  placeholder="Add any additional notes about the order..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Total: ${formData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isSubmitting || !isFormValid() ? '#9ca3af' : '#16a34a' }}
              onMouseEnter={(e) => {
                if (!isSubmitting && isFormValid()) {
                  e.currentTarget.style.backgroundColor = '#15803d';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && isFormValid()) {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }
              }}
              disabled={isSubmitting || !isFormValid()}
              title={!isFormValid() ? 'Please complete all required fields' : ''}
            >
              {isSubmitting ? 'Saving...' : (editingOrder ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;