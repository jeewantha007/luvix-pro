import React from 'react';
import { X, MoreVertical, Heart, Send } from 'lucide-react';

interface StatusViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatusViewer: React.FC<StatusViewerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md h-full bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=150"
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-white">Alice Johnson</p>
                <p className="text-sm text-white/70">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-white/20 rounded-full h-1">
            <div className="bg-white rounded-full h-1 w-1/3 transition-all duration-300" />
          </div>
        </div>

        {/* Status Content */}
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-2xl font-medium text-white mb-4">
              Beautiful sunset today! 🌅
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Reply to status..."
                className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-full px-4 py-2 focus:outline-none focus:border-white/50"
              />
            </div>
            <button className="text-white hover:text-green-400 transition-colors">
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusViewer;