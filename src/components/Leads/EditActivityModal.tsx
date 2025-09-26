import React, { useState, useEffect } from 'react';
import { X, PhoneCall, Mail, Calendar, FileText, Target, CheckCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'other';
  title: string;
  description: string;
  timestamp: Date;
}

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onUpdate: (id: string, activityData: Omit<Activity, 'id' | 'timestamp'>) => void;
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({ isOpen, onClose, activity, onUpdate }) => {
  const [formData, setFormData] = useState({
    type: 'call' as Activity['type'],
    title: '',
    description: ''
  });

  // Update form data when activity prop changes
  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        title: activity.title,
        description: activity.description
      });
    }
  }, [activity]);

  const activityTypes = [
    { value: 'call', label: 'Call', icon: PhoneCall, color: 'text-blue-600' },
    { value: 'email', label: 'Email', icon: Mail, color: 'text-green-600' },
    { value: 'meeting', label: 'Meeting', icon: Calendar, color: 'text-purple-600' },
    { value: 'note', label: 'Note', icon: FileText, color: 'text-gray-600' },
    { value: 'status_change', label: 'Status', icon: CheckCircle, color: 'text-orange-600' },
    { value: 'other', label: 'Other', icon: Target, color: 'text-gray-500' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activity && formData.title.trim() && formData.description.trim()) {
      onUpdate(activity.id, formData);
      onClose();
    }
  };

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] pb-12 px-1 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Modal Header - Fixed */}
        <div className="flex items-center justify-between pl-5 pt-1 pb-1 sm:pt-2 sm:pb-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Edit Activity</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Modal Form - Scrollable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activity Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activityTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as Activity['type'] }))}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-colors ${
                      formData.type === type.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${type.color}`} />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              placeholder="Enter activity title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full pl-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
              rows={3}
              placeholder="Enter activity description"
              required
            />
          </div>

        </form>

        {/* Fixed Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 sm:px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
          >
            Update Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditActivityModal;
