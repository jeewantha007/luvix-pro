import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  isPrivate?: boolean;
}

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onUpdate: (id: string, note: Omit<Note, 'id' | 'timestamp'>) => void;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({ isOpen, onClose, note, onUpdate }) => {
  const [formData, setFormData] = useState({
    content: '',
    isPrivate: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when note changes
  useEffect(() => {
    if (note) {
      setFormData({
        content: note.content,
        isPrivate: note.isPrivate || false
      });
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !formData.content.trim()) return;

    setIsLoading(true);
    try {
      await onUpdate(note.id, {
        content: formData.content.trim(),
        author: note.author,
        isPrivate: formData.isPrivate
      });
      onClose();
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (note) {
      setFormData({
        content: note.content,
        isPrivate: note.isPrivate || false
      });
    }
    onClose();
  };

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] pb-12 px-1 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pl-5 pt-1 pb-1 sm:pt-2 sm:pb-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Edit Note</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Note Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-sm sm:text-base"
              rows={4}
              placeholder="Enter note content"
              required
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Privacy Setting
            </label>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                formData.isPrivate
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              }`}
            >
              {formData.isPrivate ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Private</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span className="text-sm">Public</span>
                </>
              )}
            </button>
          </div>

          {/* Author Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p><strong>Author:</strong> {note.author}</p>
            <p><strong>Created:</strong> {note.timestamp.toLocaleDateString()} at {note.timestamp.toLocaleTimeString()}</p>
          </div>

        </form>

        {/* Fixed Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 sm:px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !formData.content.trim()}
            className="px-3 sm:px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Updating...' : 'Update Note'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;

