import React, { useEffect, useMemo, useState } from 'react';
import { X, DollarSign, CreditCard, FileText, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Client, Order, OrderProduct, Product } from '../../../types';
import { useToast } from '../../../context/ToastContext';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingOrder: Order | null;
  clients: Client[];
  products: Product[];
  isSubmitting?: boolean;
}

type OrderFormState = {
  orderNumber: string;
  clientId: string;
  clientName: string;
  items: OrderProduct[];
  totalAmount: number;
  status: Order['status'];
  paymentStatus: Order['paymentStatus'];
  notes: string;
};

const OrderForm: React.FC<OrderFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingOrder,
  clients,
  products,
  isSubmitting = false
}) => {
  const { showError } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<OrderFormState>({
    orderNumber: '',
    clientId: '',
    clientName: '',
    items: [],
    totalAmount: 0,
    status: 'pending',
    paymentStatus: 'pending',
    notes: ''
  });

  const productsById = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach(p => { map[p.id] = p; });
    return map;
  }, [products]);

  const requiredFields = ['clientId'];

  const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `ORD-${timestamp}${random}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingOrder) {
      setFormData({
        orderNumber: editingOrder.orderNumber,
        clientId: editingOrder.clientId,
        clientName: editingOrder.clientName,
        items: editingOrder.products,
        totalAmount: editingOrder.totalAmount,
        status: editingOrder.status,
        paymentStatus: editingOrder.paymentStatus,
        notes: editingOrder.notes || ''
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        orderNumber: generateOrderNumber(),
        clientId: '',
        clientName: '',
        items: [],
        totalAmount: 0,
        status: 'pending',
        paymentStatus: 'pending',
        notes: ''
      });
      setErrors({});
      setTouched({});
    }
  }, [editingOrder, isOpen]);

  useEffect(() => {
    const total = formData.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
    setFormData(prev => ({ ...prev, totalAmount: Number(total.toFixed(2)) }));
  }, [formData.items]);

  const validateField = (fieldName: string, value: any): string => {
    if (requiredFields.includes(fieldName)) {
      if (!value) {
        if (fieldName === 'clientId') return 'Please select a client';
        return 'This field is required';
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
    if (formData.items.length === 0 || !formData.items.some(it => it.productId && it.quantity > 0)) {
      newErrors['items'] = 'Add at least one product with quantity';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    if (!clients || clients.length === 0 || !products || products.length === 0) return false;
    if (!formData.clientId || !clients.some(c => c.id === formData.clientId)) return false;
    if (formData.items.length === 0) return false;
    if (!formData.items.every(it => it.productId && it.quantity > 0)) return false;
    return true;
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, (formData as any)[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setFormData(prev => ({ ...prev, clientId, clientName: selectedClient ? selectedClient.name : '' }));
    if (touched.clientId) {
      const error = validateField('clientId', clientId);
      setErrors(prev => ({ ...prev, clientId: error }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', name: '', sku: '', price: 0, quantity: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemProductChange = (index: number, productId: string) => {
    const product = productsById[productId];
    setFormData(prev => {
      const items = [...prev.items];
      items[index] = {
        productId,
        name: product ? product.name : '',
        sku: product ? product.sku : '',
        price: product ? product.price : 0,
        quantity: items[index]?.quantity || 1
      };
      return { ...prev, items };
    });
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    setFormData(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], quantity: Math.max(1, Math.floor(quantity || 0)) };
      return { ...prev, items };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = { clientId: true, items: true } as any;
    setTouched(allTouched);
    if (!validateForm()) {
      showError('Validation Failed', 'Please fix the errors before submitting.');
      return;
    }
    const orderPayload: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      orderNumber: formData.orderNumber,
      clientId: formData.clientId,
      clientName: formData.clientName,
      products: formData.items,
      totalAmount: formData.totalAmount,
      status: formData.status,
      paymentStatus: formData.paymentStatus,
      notes: formData.notes
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client *</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    onBlur={() => handleFieldBlur('clientId')}
                    className={getFieldClassName('clientId', "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white")}
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                  {touched.clientId && errors.clientId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.clientId}
                    </p>
                  )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Number</label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
                </div>

                <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Products
              </h3>
              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product *</label>
                  <select
                        value={item.productId}
                        onChange={(e) => handleItemProductChange(idx, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                  </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                      <input
                        type="number"
                        readOnly
                        value={item.price}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qty *</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(idx, parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1 text-sm font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</div>
                    <div className="col-span-1 flex justify-end">
                      <button type="button" onClick={() => removeItem(idx)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
                {touched.items && errors.items && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                    {errors.items}
                    </p>
                  )}
                <button type="button" onClick={addItem} className="inline-flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Add product
                </button>
              </div>
            </div>

          <div>
                         <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
               Financial Information
             </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold"
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
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" disabled={isSubmitting}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting || !isFormValid()} title={!isFormValid() ? 'Please complete required fields' : ''}>
            {isSubmitting ? 'Saving...' : (editingOrder ? 'Update Order' : 'Create Order')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;