import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Filter, DollarSign, CheckCircle, Clock, AlertCircle, Flag, CreditCard, Calendar, ArrowLeft } from 'lucide-react';
import { Order, Client, Product } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import OrderForm from './OrderForm';
// Mock data for UI only - no API calls

interface OrderListProps {
  selectedOrder: Order | null;
  onOrderSelect: (orderItem: Order) => void;
  onBack: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ selectedOrder, onOrderSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<Order['paymentStatus'] | 'all'>('all');
  const { showSuccess } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Load orders, clients, and products from backend
  useEffect(() => {
    loadData();
  }, []);

  // Filter orders based on search term and filters
  useEffect(() => {
    let filtered = orders;
    if (searchTerm) {
      filtered = filtered.filter(orderItem =>
        orderItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderItem.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderItem.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Mock data for UI only
  const loadData = () => {
    setIsLoading(true);
    
    // Mock orders data
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        clientId: '1',
        clientName: 'John Doe',
        products: [
          { productId: '1', name: 'Wireless Headphones', sku: 'WH-001', price: 99.99, quantity: 2 },
          { productId: '2', name: 'Phone Case', sku: 'PC-001', price: 19.99, quantity: 1 }
        ],
        totalAmount: 219.97,
        status: 'processing',
        paymentStatus: 'paid',
        notes: 'Customer requested express shipping',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        clientId: '2',
        clientName: 'Jane Smith',
        products: [
          { productId: '3', name: 'Laptop Stand', sku: 'LS-001', price: 49.99, quantity: 1 }
        ],
        totalAmount: 49.99,
        status: 'shipped',
        paymentStatus: 'paid',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-16')
      }
    ];


    // Mock clients
    const mockClients: Client[] = [
      { id: '1', name: 'John Doe', nationality: 'USA', currentCountry: 'USA', targetCountry: 'UK', criminalRecord: false, totalCases: 0, totalSpent: 0, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Jane Smith', nationality: 'Canada', currentCountry: 'Canada', targetCountry: 'USA', criminalRecord: false, totalCases: 0, totalSpent: 0, status: 'active', createdAt: new Date(), updatedAt: new Date() }
    ];
    // Mock products
    const mockProducts: Product[] = [
      { id: '1', name: 'Wireless Headphones', category: 'Electronics', price: 99.99, currency: 'USD', stockQuantity: 100, productType: 'main', createdAt: new Date(), updatedAt: new Date(), sku: 'WH-001' },
      { id: '2', name: 'Phone Case', category: 'Accessories', price: 19.99, currency: 'USD', stockQuantity: 200, productType: 'main', createdAt: new Date(), updatedAt: new Date(), sku: 'PC-001' },
      { id: '3', name: 'Laptop Stand', category: 'Accessories', price: 49.99, currency: 'USD', stockQuantity: 50, productType: 'main', createdAt: new Date(), updatedAt: new Date(), sku: 'LS-001' }
    ];

    setOrders(mockOrders);
    setClients(mockClients);
    setProducts(mockProducts);
    setIsLoading(false);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }
    // Mock search - just filter existing orders
    const filtered = orders.filter(order =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setOrders(filtered);
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
    
    // Mock delete order
    setOrders(prev => prev.filter(order => order.id !== deletingOrder.id));
    setShowDeleteModal(false);
    setDeletingOrder(null);
    setIsDeleting(false);
    showSuccess('Order Deleted', `Order for "${deletingOrder.clientName}" has been successfully deleted.`);
  };


  const openDeleteModal = (orderItem: Order) => {
    setDeletingOrder(orderItem);
    setShowDeleteModal(true);
  };

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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Calendar className="w-4 h-4" />;
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

  // If an order is selected, show the details view
  if (selectedOrder) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOrderSelect(null as any)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedOrder.clientName || 'Unknown Client'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Order Details
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                    <p className="text-gray-900 dark:text-white">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Number</label>
                    <p className="text-gray-900 dark:text-white">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created Date</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client & Financial Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder.clientName || 'Unknown Client'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Products</label>
                    <div className="text-gray-900 dark:text-white">
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{product.name} (x{product.quantity})</span>
                          <span>${(product.price * product.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount</label>
                    <p className="text-gray-900 dark:text-white">
                      ${selectedOrder.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedOrder.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your orders</p>
          </div>
          <button
              type="button"
              onClick={handleAddOrder}
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Order</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by order number, client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value as Order['paymentStatus'] | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Orders List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <FileText className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium mb-2">No orders found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredOrders.map((orderItem) => (
              <div
                key={orderItem.id}
                className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer"
                onClick={() => onOrderSelect(orderItem)}
              >
                {/* Order Header with Client Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {orderItem.clientName ? orderItem.clientName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                          {orderItem.clientName || 'Unknown Client'}
                        </h3>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditOrder(orderItem);
                      }}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit order"
                    >
                      <Edit className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(orderItem);
                      }}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(orderItem.status)}`}>
                    {getStatusIcon(orderItem.status)}
                    {orderItem.status.charAt(0).toUpperCase() + orderItem.status.slice(1)}
                  </span>
                </div>
                {/* Order Details Grid */}
                <div className="space-y-3">
                  {/* Products Information */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Flag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {orderItem.products.map(p => p.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {orderItem.orderNumber}
                      </p>
                    </div>
                  </div>
                  {/* Financial Information */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${orderItem.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Payment Status */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payment Status</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(orderItem.paymentStatus)}`}>
                        {orderItem.paymentStatus.charAt(0).toUpperCase() + orderItem.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Hover Effect Indicator */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors duration-200 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add Order Modal */}
      {showAddModal && (
        <OrderForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          editingOrder={null}
          clients={clients}
          products={products}
          onSubmit={(orderData) => {
            const newOrder: Order = {
              id: (orders.length + 1).toString(),
              ...orderData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setOrders(prev => [newOrder, ...prev]);
            setShowAddModal(false);
            showSuccess('Order Created', 'Order has been successfully created!');
          }}
        />
      )}

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <OrderForm
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editingOrder={editingOrder}
          clients={clients}
          products={products}
          onSubmit={(orderData) => {
            setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...o, ...orderData, updatedAt: new Date() } : o));
            setShowEditModal(false);
            setEditingOrder(null);
            showSuccess('Order Updated', 'Order has been successfully updated!');
          }}
        />
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Order
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the order for <strong>{deletingOrder.clientName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingOrder(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList; 