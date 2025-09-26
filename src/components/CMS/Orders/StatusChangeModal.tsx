import React, { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Case } from '../../../types';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: Case['status'];
  onStatusChange: (newStatus: Case['status']) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Case['status']>(currentStatus);

  const statusOptions: Array<{
    value: Case['status'];
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    {
      value: 'initial_consultation',
      label: 'Initial Consultation',
      description: 'First meeting with client to discuss case',
      icon: Clock,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      value: 'document_collection',
      label: 'Document Collection',
      description: 'Gathering required documents from client',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    },
    {
      value: 'application_submitted',
      label: 'Application Submitted',
      description: 'Application has been submitted to government',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      value: 'under_review',
      label: 'Under Review',
      description: 'Application is being reviewed by government',
      icon: Clock,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    },
    {
      value: 'additional_documents_requested',
      label: 'Additional Documents Requested',
      description: 'Government has requested more documents',
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    },
    {
      value: 'interview_scheduled',
      label: 'Interview Scheduled',
      description: 'Client interview has been scheduled',
      icon: Clock,
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    },
    {
      value: 'approved',
      label: 'Approved',
      description: 'Application has been approved',
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
    },
    {
      value: 'rejected',
      label: 'Rejected',
      description: 'Application has been rejected',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    },
    {
      value: 'appeal_filed',
      label: 'Appeal Filed',
      description: 'Appeal has been filed against rejection',
      icon: AlertCircle,
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
    },
    {
      value: 'completed',
      label: 'Completed',
      description: 'Case has been completed successfully',
      icon: CheckCircle,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  ];

  const handleSubmit = () => {
    onStatusChange(selectedStatus);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Case Status</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select the new status for this case. This will update the case timeline and may trigger notifications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;
              const isCurrent = currentStatus === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : isCurrent
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${option.color} flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm ${
                        isSelected ? 'text-green-700 dark:text-green-300' :
                        isCurrent ? 'text-blue-700 dark:text-blue-300' :
                        'text-gray-900 dark:text-white'
                      }`}>
                        {option.label}
                        {isCurrent && <span className="ml-2 text-xs">(Current)</span>}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedStatus === currentStatus}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal; 