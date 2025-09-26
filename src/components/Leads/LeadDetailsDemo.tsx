import React, { useState } from 'react';
import LeadDetails from './LeadDetails';
import { Lead } from '../../types';

// Sample lead data for demonstration
const sampleLead: Lead = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '+1 (555) 123-4567',
  position: 'CEO',
  source: 'website',
  status: 'qualified',
  priority: 'high',
  estimatedValue: 50000,
  expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  assignedTo: 'Sarah Johnson',
  tags: ['enterprise', 'tech', 'high-value'],
  notes: 'Very interested in our enterprise solution. Budget approved.',
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  updatedAt: new Date()
};

const LeadDetailsDemo: React.FC = () => {
  const [currentLead, setCurrentLead] = useState<Lead | null>(sampleLead);
  const [showBackButton, setShowBackButton] = useState(false);

  const handleBack = () => {
    setCurrentLead(null);
    setShowBackButton(false);
  };

  const handleShowLead = () => {
    setCurrentLead(sampleLead);
    setShowBackButton(true);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {!currentLead ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Lead Management Demo</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
              This is a demonstration of the Lead Details component using local state management. 
              No database connection required - all data is managed in memory.
            </p>
            <button
              onClick={handleShowLead}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              View Sample Lead
            </button>
          </div>
        </div>
      ) : (
        <LeadDetails lead={currentLead} onBack={handleBack} />
      )}
    </div>
  );
};

export default LeadDetailsDemo;
