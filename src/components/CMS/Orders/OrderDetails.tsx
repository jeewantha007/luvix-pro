import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, User, CreditCard, MapPin, Clock, DollarSign, Package, Phone, Mail } from 'lucide-react';
import { Order } from '../../../types';
import { getProductById } from '../../../services/productService';

interface OrderDetailsProps {
  order: Order | null;
  onBack: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Fetch product images when order changes
  useEffect(() => {
    const fetchProductImages = async () => {
      if (order && order.items.length > 0) {
        const images: Record<string, string> = {};
        for (const item of order.items) {
          try {
            const product = await getProductById(item.productId);
            if (product && product.images && product.images.length > 0) {
              images[item.productId] = product.images[0];
            }
          } catch (error) {
            console.error(`Error fetching image for product ${item.productId}:`, error);
          }
        }
        setProductImages(images);
      }
    };

    fetchProductImages();
  }, [order]);

  if (!currentOrder) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Order Management</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            Select an order from the list to view details and manage fulfillment.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatAddress = (address: { street: string; city: string; postalCode: string; country: string }) => {
    return [address.street, address.city, address.postalCode, address.country]
      .filter(part => part)
      .join(', ');
  };

  const formatDateForDisplay = (date?: Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order {currentOrder.orderNumber}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentOrder.customerName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Amount */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(currentOrder.totalAmount || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            
            {/* Total Items */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentOrder.items.reduce((total, item) => total + Math.max(item.quantity || 0, 0), 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ({currentOrder.items.length} {currentOrder.items.length === 1 ? 'product' : 'products'})
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {currentOrder.status}
                </p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(currentOrder.status)}`}>
                  {currentOrder.status}
                </span>
              </div>
              <div className={`w-8 h-8 rounded-full ${getStatusColor(currentOrder.status).split(' ')[0]}`}></div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer Name</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{currentOrder.customerName}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">WhatsApp Number</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{currentOrder.contactNo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-500" />
            Order Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(currentOrder.status)}`}>
                    {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Status</p>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full ${getPaymentStatusColor(currentOrder.paymentStatus)}`}>
                    {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {currentOrder.paymentMethod
                      ? currentOrder.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {currentOrder.items.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-500" />
                Order Items
              </h2>
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm font-bold">
                <Package className="w-4 h-4 mr-1" />
                {currentOrder.items.length} {currentOrder.items.length === 1 ? 'item' : 'items'}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                              {productImages[item.productId] ? (
                                <img 
                                  src={productImages[item.productId]} 
                                  alt={item.productName} 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    // Show fallback text
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<span class="text-xs text-gray-500 dark:text-gray-400">No image</span>';
                                      parent.className = 'w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center';
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-xs text-gray-500 dark:text-gray-400">No image</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-base">{item.productName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ID: {item.productId.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-right">
                        <div className="font-bold text-base">{formatCurrency(item.unitPrice)}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-right">
                        <div className="font-bold text-base">{item.quantity}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-right">
                        <div className="font-bold text-base">{formatCurrency(item.totalPrice || 0)}</div>
                        {item.quantity && item.unitPrice && item.quantity > 1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ({item.quantity} × {formatCurrency(item.unitPrice)})
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 dark:bg-gray-700 sticky bottom-0 z-10">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-base text-gray-900 dark:text-white font-bold">
                      Total Items
                    </td>
                    <td className="px-4 py-3 text-base text-gray-900 dark:text-white text-right font-bold">
                      {currentOrder.items.reduce((total, item) => total + Math.max(item.quantity || 0, 0), 0)}
                    </td>
                    <td className="px-4 py-3 text-base text-gray-900 dark:text-white text-right font-bold">
                      {formatCurrency(currentOrder.totalAmount || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Addresses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            Addresses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shipping Address</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{formatAddress(currentOrder.shippingAddress)}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Billing Address</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{formatAddress(currentOrder.billingAddress)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              Order Information
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Number</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{currentOrder.orderNumber}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{formatDateForDisplay(currentOrder.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{formatDateForDisplay(currentOrder.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
              Financials
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-base font-medium text-gray-700 dark:text-gray-300">Subtotal</span>
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white">
                  {formatCurrency((currentOrder.totalAmount || 0) - (currentOrder.taxAmount || 0) - (currentOrder.shippingAmount || 0) + (currentOrder.discountAmount || 0))}
                </span>
              </div>
              
              {currentOrder.discountAmount !== undefined && currentOrder.discountAmount > 0 && (
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">Discount</span>
                  </div>
                  <span className="text-base font-bold text-green-600 dark:text-green-400">
                    -{formatCurrency(currentOrder.discountAmount)}
                  </span>
                </div>
              )}
              
              {currentOrder.taxAmount !== undefined && currentOrder.taxAmount > 0 && (
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">Tax</span>
                  </div>
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    +{formatCurrency(currentOrder.taxAmount)}
                  </span>
                </div>
              )}
              
              {currentOrder.shippingAmount !== undefined && currentOrder.shippingAmount > 0 && (
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">Shipping</span>
                  </div>
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    +{formatCurrency(currentOrder.shippingAmount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-600 rounded-lg mt-2">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" />
                  <span className="text-base font-bold text-gray-900 dark:text-white">Total Amount</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(currentOrder.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {currentOrder.notes && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              Notes
            </h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{currentOrder.notes}</p>
            </div>
          </div>
        )}

        {/* Order Progress Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            Order Progress
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${['pending', 'processing', 'completed', 'canceled'].includes(currentOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Order Created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${['processing', 'completed'].includes(currentOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${['completed'].includes(currentOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            {currentOrder.status === 'canceled' && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Canceled</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
