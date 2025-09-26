import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, User, Filter,
  Mail, Phone, DollarSign, Users
} from 'lucide-react';
import { Client } from '../../../types';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { useToast } from '../../../context/ToastContext';
import { 
  getClients, 
  createClient, 
  updateClient, 
  deleteClient, 
  searchClients,
  uploadClientPhoto
} from '../../../services/clientService';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';

interface ClientListProps {
  selectedClient?: Client | null;
  onClientSelect: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ selectedClient, onClientSelect }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Client['status'] | 'all'>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'vip'>('all');
  const [minSpend, setMinSpend] = useState<string>('');
  const [maxSpend, setMaxSpend] = useState<string>('');
  const isMobile = useIsMobile();
  const { showSuccess, showError, showWarning } = useToast();

  // Load clients from Supabase
  useEffect(() => {
    loadClients();
  }, []);

  // Segment derivation based on totalSpent
  const getSegment = (totalSpent: number): 'bronze' | 'silver' | 'gold' | 'vip' => {
    if (totalSpent >= 5000) return 'vip';
    if (totalSpent >= 2000) return 'gold';
    if (totalSpent >= 500) return 'silver';
    return 'bronze';
  };

  // Filter clients based on search term and filters
  useEffect(() => {
    let filtered = clients;

    // Apply search filter (product customers)
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Apply segment and spend filters
    const min = minSpend ? parseFloat(minSpend) : Number.NEGATIVE_INFINITY;
    const max = maxSpend ? parseFloat(maxSpend) : Number.POSITIVE_INFINITY;
    filtered = filtered.filter(c => {
      const seg = getSegment(c.totalSpent || 0);
      const inSegment = segmentFilter === 'all' ? true : seg === segmentFilter;
      const inSpend = (c.totalSpent || 0) >= min && (c.totalSpent || 0) <= max;
      return inSegment && inSpend;
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, segmentFilter, minSpend, maxSpend]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      showError('Load Failed', 'Failed to load clients data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadClients();
      return;
    }

    try {
      setIsLoading(true);
      const data = await searchClients(searchTerm);
      setClients(data);
    } catch (error) {
      console.error('Error searching clients:', error);
      showError('Search Failed', 'Failed to search clients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>, photoFile?: File | null) => {
    try {
      setIsSubmitting(true);
      const newClient = await createClient(clientData);
      
      // Upload photo if provided
      if (photoFile && newClient) {
        try {
          await uploadClientPhoto(newClient.id, photoFile);
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          showWarning('Photo Upload Failed', 'Client created but photo upload failed. You can try uploading the photo again by editing the client.');
        }
      }
      
      setShowAddModal(false);
      loadClients();
      showSuccess('Client Created', 'Client has been successfully created!');
    } catch (error) {
      console.error('Error creating client:', error);
      showError('Creation Failed', 'Failed to create client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>, photoFile?: File | null) => {
    if (!editingClient) return;

    try {
      setIsSubmitting(true);
      await updateClient(editingClient.id, clientData);
      
      // Upload new photo if provided
      if (photoFile) {
        try {
          await uploadClientPhoto(editingClient.id, photoFile);
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          showWarning('Photo Upload Failed', 'Client updated but photo upload failed. Please try uploading the photo again.');
        }
      }
      
      setShowEditModal(false);
      setEditingClient(null);
      loadClients();
      showSuccess('Client Updated', 'Client has been successfully updated!');
    } catch (error) {
      console.error('Error updating client:', error);
      showError('Update Failed', 'Failed to update client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;

    try {
      setIsDeleting(true);
      await deleteClient(deletingClient.id);
      setShowDeleteModal(false);
      setDeletingClient(null);
      loadClients();
      showSuccess('Client Deleted', `Client "${deletingClient.name}" has been successfully deleted.`);
    } catch (error) {
      console.error('Error deleting client:', error);
      showError('Deletion Failed', 'Failed to delete client. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setShowEditModal(true);
  };

  const openDeleteModal = (client: Client) => {
    setDeletingClient(client);
    setShowDeleteModal(true);
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'prospect': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'active': return <User className="w-4 h-4" />;
      case 'prospect': return <User className="w-4 h-4" />;
      case 'inactive': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Removed immigration-specific helpers

  // If a client is selected, show the details view
  if (selectedClient) {
    return (
      <ClientDetails
        client={selectedClient}
        onBack={() => onClientSelect(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
             <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
         <div className="flex items-center justify-between">
           <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customers</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your customers</p>
           </div>
          <button
            type="button"
             onClick={() => setShowAddModal(true)}
             className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
           >
             <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
             <span className="hidden sm:inline">Add Client</span>
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
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Client['status'] | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segment</label>
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Spend ($)</label>
                  <input type="number" value={minSpend} onChange={(e) => setMinSpend(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Spend ($)</label>
                  <input type="number" value={maxSpend} onChange={(e) => setMaxSpend(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="∞" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <User className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium mb-2">No clients found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
             {filteredClients.map((client) => (
               <div
                 key={client.id}
                 className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-green-400 dark:hover:border-green-500 transition-all duration-200 cursor-pointer relative"
                 onClick={() => onClientSelect(client)}
               >
                {/* Client Header with Photo */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Client Photo */}
                    <div className="flex-shrink-0">
                      {client.photoUrl ? (
                        <img
                          src={client.photoUrl}
                          alt={`${client.name}'s photo`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {!client.photoUrl && (
                                                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-200 dark:border-gray-600">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                        {client.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {getStatusIcon(client.status)}
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(client);
                      }}
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Edit client"
                    >
                      <Edit className="w-4 h-4 text-green-500 dark:text-green-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(client);
                      }}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete client"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Simplified Client Details - Only Essential Information */}
                <div className="space-y-3">
                  {/* Email */}
                  {client.email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{client.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Phone */}
                  {client.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{client.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Segment Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-purple-100 dark:bg-purple-900/20 px-1.5 py-0.5 rounded capitalize">
                      {getSegment(client.totalSpent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Client Modal */}
      <ClientForm
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingClient(null);
        }}
        onSubmit={showAddModal ? handleAddClient : handleEditClient}
        editingClient={editingClient}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Client
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{deletingClient.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingClient(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default ClientList; 