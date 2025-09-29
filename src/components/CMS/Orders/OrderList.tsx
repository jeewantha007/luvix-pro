import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Filter, DollarSign, CheckCircle, Clock, AlertCircle, CreditCard, Calendar, ArrowLeft, AlertTriangle, Package, TrendingUp, X, ChevronDown } from 'lucide-react';
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
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20';
      case 'shipped': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'processing': return <Package className="w-3.5 h-3.5" />;
      case 'shipped': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'delivered': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'cancelled': return <AlertCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getPaymentStatusColor = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
      case 'partial': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
      case 'pending': return 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20';
    }
  };

  const getPaymentIcon = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'partial': return <DollarSign className="w-3.5 h-3.5" />;
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'overdue': return <AlertCircle className="w-3.5 h-3.5" />;
      default: return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  const calculateStats = () => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(o => o.status === 'pending').length;
    const processing = filteredOrders.filter(o => o.status === 'processing').length;
    const completed = filteredOrders.filter(o => o.status === 'delivered').length;
    return { total, pending, processing, completed };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Enhanced Header with Stats */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title and Actions */}
          <div className="flex items-center justify-between py-5">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                Orders
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all your orders</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 transition-colors group-focus-within:text-blue-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2.5 w-80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm hover:shadow-md"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 border rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                  showFilters 
                    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleAddOrder}
                className="inline-flex items-center px-5 py-2.5 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                style={{ 
                  background: 'linear-gradient(135deg, #168740 0%, #0d5a2b 100%)',
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 pb-5">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 rounded-xl p-4 border border-blue-200/50 dark:border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 rounded-xl p-4 border border-amber-200/50 dark:border-amber-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Pending</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">{stats.pending}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-500/10 dark:to-purple-500/5 rounded-xl p-4 border border-purple-200/50 dark:border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Processing</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">{stats.processing}</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Completed</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">{stats.completed}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="pb-5 animate-in slide-in-from-top duration-200">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setPaymentStatusFilter('all');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Order Status</label>
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Status</label>
                    <div className="relative">
                      <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value as Order['paymentStatus'] | 'all')}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="all">All Payment Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 absolute top-0"></div>
            </div>
            <span className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={handleAddOrder}
              className="inline-flex items-center px-5 py-2.5 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #168740 0%, #0d5a2b 100%)',
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Order
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredOrders.map((orderItem) => (
              <div
                key={orderItem.id}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transform hover:-translate-y-1"
                onClick={() => onOrderSelect(orderItem)}
              >
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOrder(orderItem);
                    }}
                    className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-200 dark:border-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(orderItem);
                    }}
                    className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all border border-gray-200 dark:border-gray-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5">
                  {/* Customer Info */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {orderItem.customerName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                      {orderItem.customerId}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${getStatusColor(orderItem.status)}`}>
                      {getStatusIcon(orderItem.status)}
                      {orderItem.status.charAt(0).toUpperCase() + orderItem.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${getPaymentStatusColor(orderItem.paymentStatus)}`}>
                      {getPaymentIcon(orderItem.paymentStatus)}
                      {orderItem.paymentStatus.charAt(0).toUpperCase() + orderItem.paymentStatus.slice(1)}
                    </span>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      <span className="font-medium">{orderItem.orderNumber}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      <span>{orderItem.createdAt ? new Date(orderItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Delete Modal */}
        {showDeleteModal && deletingOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Delete Order</h3>
                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete order <span className="font-semibold text-gray-900 dark:text-white">"{deletingOrder.orderNumber}"</span> for <span className="font-semibold text-gray-900 dark:text-white">"{deletingOrder.customerName}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingOrder(null);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Deleting...
                      </span>
                    ) : (
                      'Delete Order'
                    )}
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