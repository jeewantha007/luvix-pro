import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Filter, DollarSign, CheckCircle, Clock, AlertCircle, CreditCard, Calendar, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Order } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import OrderForm from './OrderForm';
import { getOrders, createOrder, updateOrder } from '../../../services/orderService';

interface OrderListProps {
  selectedOrder: Order | null;
  onOrderSelect: (orderItem: Order | null) => void;
}

const OrderList: React.FC<OrderListProps> = ({ selectedOrder, onOrderSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<Order['paymentStatus'] | 'all'>('all');
  const { showSuccess, showError } = useToast();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = orders;
    if (searchTerm) {
      filtered = filtered.filter(orderItem =>
        orderItem.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderItem.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderItem.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(orderItem => orderItem.status === statusFilter);
    }
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(orderItem => orderItem.paymentStatus === paymentStatusFilter);
    }
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentStatusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch real data from Supabase
      const fetchedOrders = await getOrders();
      
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      showError('Load Failed', error.message || 'Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }
    const filtered = orders.filter(order =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleAddOrder = () => {
    setEditingOrder(null);
    setShowAddModal(true);
  };

  const handleEditOrder = (orderItem: Order) => {
    setEditingOrder(orderItem);
    setShowEditModal(true);
  };

  const handleDeleteOrder = () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      setOrders(prev => prev.filter(order => order.id !== deletingOrder.id));
      setFilteredOrders(prev => prev.filter(order => order.id !== deletingOrder.id));
      setShowDeleteModal(false);
      setDeletingOrder(null);
      showSuccess('Order Deleted', `Order for "${deletingOrder.customerName}" has been successfully deleted.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      showError('Delete Failed', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (orderItem: Order) => {
    setDeletingOrder(orderItem);
    setShowDeleteModal(true);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'shipped': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const formatAddress = (address: { street: string; city: string; postalCode: string; country: string }) => {
    return [address.street, address.city, address.postalCode, address.country]
      .filter(part => part)
      .join(', ');
  };

  // ...existing code for selectedOrder detail view...

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search orders by number, customer name, or phone..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleAddOrder}
                className="inline-flex items-center px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-sm"
                style={{ backgroundColor: '#168740' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d5a2b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#168740';
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Order
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="flex items-center space-x-4 pb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as Order['paymentStatus'] | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <p className="text-lg text-gray-500 dark:text-gray-400">No orders found.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((orderItem) => (
              <div
                key={orderItem.id}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group cursor-pointer"
                onClick={() => onOrderSelect(orderItem)}
              >
                <div className="absolute top-3 right-3 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOrder(orderItem);
                    }}
                    className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(orderItem);
                    }}
                    className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{orderItem.customerName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">{orderItem.customerId}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(orderItem.status)}`}>
                      {getStatusIcon(orderItem.status)}
                      {orderItem.status.charAt(0).toUpperCase() + orderItem.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(orderItem.paymentStatus)}`}>
                      {orderItem.paymentStatus.charAt(0).toUpperCase() + orderItem.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{orderItem.orderNumber}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {orderItem.createdAt ? new Date(orderItem.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm sm:max-w-md w-full">
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Delete Order</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  Are you sure you want to delete order "{deletingOrder.orderNumber}" for "{deletingOrder.customerName}"? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingOrder(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <OrderForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (orderData) => {
            try {
              const newOrder = await createOrder(orderData);
              setOrders(prev => [newOrder, ...prev]);
              setFilteredOrders(prev => [newOrder, ...prev]);
              setShowAddModal(false);
              showSuccess('Order Created', 'Order has been successfully created!');
            } catch (error: any) {
              showError('Order Creation Failed', error.message || 'Failed to create order. Please try again.');
            }
          }}
          editingOrder={null}
        />
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <OrderForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingOrder(null);
          }}
          onSubmit={async (orderData) => {
            try {
              if (!editingOrder.id) {
                showError('Update Failed', 'Order ID is missing.');
                return;
              }
              
              const updatedOrder = await updateOrder(editingOrder.id, orderData);
              setOrders(prev => prev.map(o => o.id === editingOrder.id ? updatedOrder : o));
              setFilteredOrders(prev => prev.map(o => o.id === editingOrder.id ? updatedOrder : o));
              setShowEditModal(false);
              setEditingOrder(null);
              showSuccess('Order Updated', 'Order has been successfully updated!');
            } catch (error: any) {
              showError('Order Update Failed', error.message || 'Failed to update order. Please try again.');
            }
          }}
          editingOrder={editingOrder}
        />
      )}
    </div>
  );
};

export default OrderList;