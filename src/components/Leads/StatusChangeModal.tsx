import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusChange: (newStatus: string) => Promise<void>;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ 
  isOpen, 
  onClose, 
  currentStatus, 
  onStatusChange 
}) => {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = [
    { value: 'new', label: 'New', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
    { value: 'contacted', label: 'Contacted', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' },
    { value: 'qualified', label: 'Qualified', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' },
    { value: 'proposal', label: 'Proposal', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
    { value: 'negotiation', label: 'Negotiation', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
    { value: 'won', label: 'Won', icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/20' },
    { value: 'lost', label: 'Lost', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus !== currentStatus) {
      setIsLoading(true);
      try {
        await onStatusChange(newStatus);
        onClose();
      } catch (error) {
        console.error('Error updating status:', error);
        // You could add error handling here (e.g., toast notification)
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setNewStatus(currentStatus);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Lead Status</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Status
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                {currentStatus}
              </span>
            </div>
          </div>

          {/* New Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Status *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => {
                const Icon = status.icon;
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setNewStatus(status.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      newStatus === status.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${status.color}`} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {status.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Flow Indicator */}
          {newStatus !== currentStatus && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Moving from <span className="font-medium capitalize">{currentStatus}</span> to{' '}
                  <span className="font-medium capitalize">{newStatus}</span>
                </span>
              </div>
            </div>
          )}

          

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={newStatus === currentStatus || isLoading}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusChangeModal;
