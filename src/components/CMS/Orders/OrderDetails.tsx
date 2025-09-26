import React, { useState, useEffect } from 'react';
import { 
  FileText, ArrowLeft, User, DollarSign, Flag,
  CreditCard, Calendar, Clock
} from 'lucide-react';
import { Order } from '../../../types';
import { formatDateForDisplay } from '../../../utils/displayHelpers';

interface OrderDetailsProps {
  orderItem: Order | null;
  onBack: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderItem, onBack }) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(orderItem);

  useEffect(() => {
    setCurrentOrder(orderItem);
  }, [orderItem]);

  if (!currentOrder) {
    return (
      <div className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800 flex">
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentOrder.clientName}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Order Details
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Order Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Flag className="w-5 h-5 mr-2 text-gray-500" />
            Order Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Flag className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentOrder.status)}`}>
                  {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Status</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(currentOrder.paymentStatus)}`}>
                  {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-500" />
            Order Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <User className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                <p className="text-sm text-gray-900 dark:text-white">{currentOrder.clientName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <FileText className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
                <p className="text-sm text-gray-900 dark:text-white">{currentOrder.orderNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Created Date</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatDateForDisplay(currentOrder.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products & Financials */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
            Products & Totals
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentOrder.products.map((p, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{p.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{p.sku || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white text-right">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white text-right">{p.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white text-right">{formatCurrency(p.price * p.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Total Amount</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(currentOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        {currentOrder.notes && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              Notes
            </h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{currentOrder.notes}</p>
            </div>
          </div>
        )}

        {/* Simple timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            Order Progress
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${['pending','processing','shipped','delivered','cancelled'].includes(currentOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Order Created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${['processing','shipped','delivered'].includes(currentOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${['shipped','delivered'].includes(currentOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Shipped</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${['delivered'].includes(currentOrder.status) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Delivered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 