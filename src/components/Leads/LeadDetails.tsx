import React, { useState, useEffect } from 'react';
import { 
  Target, Phone, Mail, User, Clock, ArrowLeft, Edit, Plus, MessageCircle, 
  PhoneCall, Mail as MailIcon, Calendar as CalendarIcon, CheckCircle, 
  MoreVertical, Trash2, Copy, ExternalLink, Globe, Twitter, FileText, Image,
  Paperclip, Play, X
} from 'lucide-react';
import { Lead, Activity, Note, Task, MediaFile } from '../../types';
import { ActivityService } from '../../services/activityService';
import { NoteService } from '../../services/noteService';
import { TaskService } from '../../services/taskService';
import { NoteMediaService } from '../../services/noteMediaService';
import { useApp } from '../../context/AppContext';
import { 
  cleanPhoneForDisplay, 
  cleanDescriptionForDisplay, 
  getCleanInitial,
  formatDateForDisplay 
} from '../../utils/displayHelpers';
import AddActivityModal from './AddActivityModal';
import EditActivityModal from './EditActivityModal';
import EditNoteModal from './EditNoteModal';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import StatusChangeModal from './StatusChangeModal';

interface LeadDetailsProps {
  lead: Lead | null;
  onBack: () => void;
  onUpdateLead?: (id: string, updates: Partial<Lead>) => void;
}







const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onBack, onUpdateLead }) => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'notes' | 'tasks' | 'media'>('overview');
  const [newNote, setNewNote] = useState('');
  const [newNoteMediaFiles, setNewNoteMediaFiles] = useState<File[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Modal states
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  
  // Lead status state for local updates - sync with lead prop
  const [currentLeadStatus, setCurrentLeadStatus] = useState(lead?.status || 'new');
  
  // Update local status when lead prop changes
  useEffect(() => {
    if (lead?.status) {
      setCurrentLeadStatus(lead.status);
    }
  }, [lead?.status]);
  
  // Data states - using local state instead of Supabase
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Load activities from database when component mounts or lead changes
  useEffect(() => {
    if (lead?.phone) {
      loadActivities();
    }
  }, [lead?.phone]);

  const loadActivities = async () => {
    if (!lead?.phone) return;
    
    setLoading(true);
    try {
      const userActivities = await ActivityService.getActivitiesByLeadContactNumber(lead.phone);
      setActivities(userActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notes and tasks from database when component mounts or lead changes
  useEffect(() => {
    if (lead?.phone) {
      loadNotes();
      loadTasks();
    }
  }, [lead?.phone]);

  const loadNotes = async () => {
    if (!lead?.phone) return;
    
    setLoading(true);
    try {
      const userNotes = await NoteService.getNotesByLeadContactNumber(lead.phone);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!lead?.phone) return;
    
    setLoading(true);
    try {
      const userTasks = await TaskService.getTasksByLeadContactNumber(lead.phone);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };





  if (!lead) {
    return (
      <div className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800 flex">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Lead Management</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            Select a lead from the list to view detailed information and manage the sales process.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'proposal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'negotiation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'won': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getSourceColor = (source: Lead['source']) => {
    switch (source) {
      case 'website': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'whatsapp': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'phone': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'referral': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'social': return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20';
      case 'other': return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSourceIcon = (source: Lead['source']) => {
    switch (source) {
      case 'website': return <Globe className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'referral': return <User className="w-4 h-4" />;
      case 'social': return <Twitter className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-4 h-4" />;
      case 'email': return <MailIcon className="w-4 h-4" />;
      case 'meeting': return <CalendarIcon className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'status_change': return <CheckCircle className="w-4 h-4" />;
      case 'other': return <Target className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'call': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'email': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'meeting': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'note': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'status_change': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'other': return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting time:', error, 'Date:', date);
      return 'Invalid time';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // CRUD Functions for Activities, Notes, and Tasks
  const handleAddActivity = async (activityData: Omit<Activity, 'id' | 'timestamp'>) => {
    if (!lead?.phone) return;
    
    try {
      if (!currentUser?.id) {
        console.error('No current user found');
        return;
      }
      const newActivity = await ActivityService.createActivity(activityData, lead.phone, currentUser.id);
      setActivities(prev => [newActivity, ...prev]);
      setShowAddActivityModal(false);
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await ActivityService.deleteActivity(activityId);
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  // Note CRUD Functions
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditNoteModal(true);
  };

  const handleUpdateNote = async (id: string, noteData: Omit<Note, 'id' | 'timestamp'>) => {
    try {
      const updatedNote = await NoteService.updateNote(id, noteData);
      setNotes(prev => prev.map(note => 
        note.id === id 
          ? updatedNote
          : note
      ));
      setShowEditNoteModal(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await NoteService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowEditActivityModal(true);
  };

  const handleUpdateActivity = async (id: string, activityData: Omit<Activity, 'id' | 'timestamp'>) => {
    try {
      const updatedActivity = await ActivityService.updateActivity(id, activityData);
      setActivities(prev => prev.map(activity => 
        activity.id === id 
          ? updatedActivity
          : activity
      ));
      setShowEditActivityModal(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !lead?.phone) return;
    
    try {
      if (!currentUser?.id) {
        console.error('No current user found');
        return;
      }

      // Upload media files first
      const mediaFiles: MediaFile[] = [];
      for (const file of newNoteMediaFiles) {
        const mediaFile = await NoteMediaService.uploadMediaFile(file, `temp-${Date.now()}`);
        mediaFiles.push(mediaFile);
      }

      const noteData = {
        content: newNote.trim(),
        author: currentUser?.name || currentUser?.phone || 'Current User',
        isPrivate: false,
        media_files: mediaFiles
      };
      const newNoteItem = await NoteService.createNote(noteData, lead.phone, currentUser.id);
      setNotes(prev => [newNoteItem, ...prev]);
      setNewNote('');
      setNewNoteMediaFiles([]);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = NoteMediaService.validateFile(file);
      if (validation.isValid) {
        newFiles.push(file);
      } else {
        alert(validation.error);
      }
    }

    setNewNoteMediaFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setNewNoteMediaFiles(prev => prev.filter((_, i) => i !== index));
  };



  const handleAddTask = async (taskData: Omit<Task, 'id' | 'status'>) => {
    if (!lead?.phone || !currentUser?.id) return;
    
    try {
      const newTask = await TaskService.createTask(taskData, lead.phone, currentUser.id);
      setTasks(prev => [newTask, ...prev]);
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'status' | 'completedAt'>>) => {
    try {
      const updatedTask = await TaskService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      setShowEditTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowEditTaskModal(true);
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActions(false);
    // Will be implemented with backend
    console.log(`Quick action: ${action}`);
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const updatedTask = await TaskService.completeTask(taskId);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!lead || !onUpdateLead) return;
    
    try {
      // Update the lead in the database through the parent component
      await onUpdateLead(lead.id, { status: newStatus as Lead['status'] });
      
      // Update local lead status state
      setCurrentLeadStatus(newStatus as 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost');
      
      // Create status change activity
      const statusActivity: Activity = {
        id: Date.now().toString(),
        type: 'status_change',
        title: `Status changed from ${lead.status} to ${newStatus}`,
        description: `Lead status updated to ${newStatus}`,
        timestamp: new Date()
      };
      
      // Add to activities list
      setActivities(prev => [statusActivity, ...prev]);
      
      console.log(`Status changed from ${lead.status} to ${newStatus}`);
    } catch (error) {
      console.error('Error updating lead status:', error);
      // You could add a toast notification here for error handling
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
             <button
               onClick={onBack}
               className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
             >
               <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
             </button>
             <div className="min-w-0 flex-1">
               <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                 {lead.name || cleanPhoneForDisplay(lead.phone)}
               </h1>
               <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                 {lead.email ? `${lead.email} • ${lead.source}` : lead.source}
               </p>
             </div>
           </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              
              {showQuickActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
                  <button
                    onClick={() => handleQuickAction('call')}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 mr-3 text-blue-500" />
                    Call Lead
                  </button>
                  <button
                    onClick={() => handleQuickAction('email')}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MailIcon className="w-4 h-4 mr-3 text-green-500" />
                    Send Email
                  </button>
                  <button
                    onClick={() => handleQuickAction('meeting')}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4 mr-3 text-purple-500" />
                    Schedule Meeting
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <button
                    onClick={() => handleQuickAction('delete')}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Lead
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status and Source */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getStatusColor(currentLeadStatus)}`}>
              {currentLeadStatus.charAt(0).toUpperCase() + currentLeadStatus.slice(1)}
            </span>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getSourceColor(lead.source)}`}>
                {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => handleQuickAction('call')}
              className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
            >
              <PhoneCall className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => handleQuickAction('email')}
              className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
            >
              <MailIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => handleQuickAction('meeting')}
              className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
            >
              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-8 px-2 sm:px-4 overflow-x-auto scroll-smooth">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'activities', label: 'Activities', icon: Clock },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle },
            { id: 'media', label: 'Media', icon: Image }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2 py-3 px-1 sm:px-1 border-b-2 transition-colors flex-shrink-0 min-w-[50px] sm:min-w-0 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-500" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.name && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-sm text-gray-900 dark:text-white">{lead.name}</p>
                    </div>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm text-gray-900 dark:text-white">{lead.email}</p>
                    </div>
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-sm text-gray-900 dark:text-white">{cleanPhoneForDisplay(lead.phone)}</p>
                    </div>
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}
                {lead.description && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                      <p className="text-sm text-gray-900 dark:text-white">{cleanDescriptionForDisplay(lead.description)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {getSourceIcon(lead.source)}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">{lead.source}</p>
                  </div>
                </div>
              </div>
            </div>



            {/* Status Progression */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Sales Pipeline</h2>
                <button
                  onClick={() => setShowStatusChangeModal(true)}
                  className="px-3 py-1 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors self-start sm:self-auto"
                >
                  Change Status
                </button>
              </div>
              
              {/* Pipeline Visualization */}
              <div className="flex items-center justify-center overflow-x-auto scroll-smooth gap-0.5 sm:gap-24">
                {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map((status, index) => (
                  <div key={status} className="flex flex-col items-center flex-shrink-0 min-w-[20px] sm:min-w-[25px]">
                    <div className={`w-4 h-4 sm:w-7 sm:h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentLeadStatus === status 
                        ? 'bg-green-500 text-white' 
                        : index < ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].indexOf(currentLeadStatus)
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 text-center hidden sm:block">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 text-center sm:hidden">
                      {status.charAt(0).toUpperCase()}
                    </span>
                    {index < 6 && (
                      <div className={`w-1 sm:w-2 h-0.5 mt-0.5 ${
                        index < ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].indexOf(currentLeadStatus)
                        ? 'bg-green-300 dark:bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Media Preview Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Image className="w-5 h-5 mr-2 text-gray-500" />
                  Media Preview
                </h2>
                <button
                  onClick={() => setActiveTab('media')}
                  className="px-3 py-1 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View All
                </button>
              </div>
              
              {/* Media Preview Content */}
              <div className="space-y-4">
                {/* Images & Videos Preview */}
                {lead.media_files && lead.media_files.filter((media: MediaFile) => 
                  media.file_type === 'image' || media.file_type === 'video'
                ).length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <Image className="w-4 h-4 mr-2 text-blue-500" />
                      Recent Media ({lead.media_files.filter((media: MediaFile) => 
                        media.file_type === 'image' || media.file_type === 'video'
                      ).length} files)
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {lead.media_files
                        .filter((media: MediaFile) => media.file_type === 'image' || media.file_type === 'video')
                        .slice(0, 6) // Show only first 6 items as preview
                        .map((media: MediaFile) => (
                          <div key={media.id} className="relative group">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                              {media.file_type === 'image' ? (
                                <img 
                                  src={media.file_url} 
                                  alt={media.file_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <>
                                  <img 
                                    src={media.file_url} 
                                    alt={media.file_name}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                      <Play className="w-2 h-2 text-gray-700 ml-0.5" />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <button 
                                onClick={() => window.open(media.file_url, '_blank')}
                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-full shadow-lg transition-all duration-200"
                              >
                                <ExternalLink className="w-3 h-3 text-gray-700" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Image className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">No media files yet</p>
                  </div>
                )}

                {/* Documents Preview */}
                {lead.media_files && lead.media_files.filter((media: MediaFile) => 
                  media.file_type === 'document'
                ).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-green-500" />
                      Recent Documents ({lead.media_files.filter((media: MediaFile) => 
                        media.file_type === 'document'
                      ).length} files)
                    </h3>
                    <div className="space-y-2">
                      {lead.media_files
                        .filter((media: MediaFile) => media.file_type === 'document')
                        .slice(0, 3) // Show only first 3 documents as preview
                        .map((media: MediaFile) => (
                          <div key={media.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{media.file_name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {media.file_size ? `${(media.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                              </p>
                            </div>
                            <button 
                              onClick={() => window.open(media.file_url, '_blank')}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags section removed - not in new table structure */}
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="p-3 sm:p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Activity Timeline</h2>
                <button 
                  onClick={() => setShowAddActivityModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Activity</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No activities yet. Add your first activity to get started.</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{activity.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{activity.description}</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                              {formatDateForDisplay(activity.timestamp)} at {formatTime(activity.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => handleEditActivity(activity)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                              title="Edit Activity"
                            >
                              <Edit className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="p-3 sm:p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes & Comments</h2>
              
              {/* Add Note */}
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    U
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this lead..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <label className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Paperclip className="w-4 h-4 text-gray-400" />
                        </label>
                      </div>
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() && newNoteMediaFiles.length === 0}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Add Note
                      </button>
                    </div>
                    
                    {/* Show selected files */}
                    {newNoteMediaFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Selected files:</p>
                        {newNoteMediaFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No notes yet. Add your first note to get started.</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="w-8 h-8 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300 flex-shrink-0">
                        {note.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{note.author}</h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateForDisplay(note.timestamp)} at {formatTime(note.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {note.content}
                            </p>
                            
                            {/* Display media files */}
                            {note.media_files && note.media_files.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {note.media_files.map((media) => (
                                    <div key={media.id} className="relative group">
                                      {media.file_type === 'image' ? (
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                          <img
                                            src={media.file_url}
                                            alt={media.file_name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                          <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                      )}
                                      <button
                                        onClick={() => window.open(media.file_url, '_blank')}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                      >
                                        <ExternalLink className="w-4 h-4 text-white" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {note.isPrivate && (
                              <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full mt-2">
                                Private
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => handleEditNote(note)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                              title="Edit Note"
                            >
                              <Edit className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                              title="Delete Note"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-3 sm:p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Tasks & Follow-ups</h2>
                <button 
                  onClick={() => setShowAddTaskModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Task</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 sm:py-8">
                    <CheckCircle className="w-16 h-16 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No tasks yet. Add your first task to get started.</p>
                  </div>
                ) : (
                  tasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    const isOverdue = task.dueDate && new Date() > task.dueDate && !isCompleted;
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${
                          isCompleted ? 'opacity-50' : ''
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isCompleted}
                          onChange={() => handleToggleTask(task.id)}
                          disabled={isCompleted}
                          className="w-4 h-4 text-green-500 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-gray-900 dark:text-white ${
                            isCompleted ? 'line-through' : ''
                          }`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            {task.dueDate && (
                              <span className={`text-xs ${
                                isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Due: {formatDateForDisplay(task.dueDate)}
                              </span>
                            )}

                            {isCompleted && task.completedAt && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Completed: {formatDateForDisplay(task.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {/* Edit Button - Only show for non-completed tasks */}
                          {!isCompleted && (
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                              title="Edit task"
                            >
                              <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                          </button>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : task.priority === 'urgent'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : task.priority === 'high'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {isCompleted ? 'Done' : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Media & Documents</h2>
              
              {/* Media Categories */}
              <div className="space-y-6">
                {/* Media Section (Images & Videos) */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Image className="w-4 h-4 mr-2 text-blue-500" />
                    Media
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
                    {/* Real Media Files from lead.media_files */}
                    {lead?.media_files?.filter((media: MediaFile) => media.file_type === 'image' || media.file_type === 'video').map((media: MediaFile) => (
                      <div key={media.id} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden w-16 h-16 sm:w-20 sm:h-20">
                          {media.file_type === 'image' ? (
                            <img 
                              src={media.file_url} 
                              alt={media.file_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <img 
                                src={media.file_url} 
                                alt={media.file_name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                  <Play className="w-2 h-2 sm:w-3 sm:h-3 text-gray-700 ml-0.5" />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <button 
                            onClick={() => window.open(media.file_url, '_blank')}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow-lg transition-all duration-200"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Empty state when no media */}
                    {(!lead?.media_files || lead.media_files.filter((media: MediaFile) => media.file_type === 'image' || media.file_type === 'video').length === 0) && (
                      <div className="col-span-full text-center py-4">
                        <Image className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">No media files</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                    Documents
                  </h3>
                  <div className="space-y-2">
                    {/* Real Documents from lead.media_files */}
                    {lead?.media_files?.filter((media: MediaFile) => media.file_type === 'document').map((media: MediaFile) => (
                      <div key={media.id} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{media.file_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {media.file_size ? `${(media.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'} • {new Date(media.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => window.open(media.file_url, '_blank')}
                          className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Empty state when no documents */}
                    {(!lead?.media_files || lead.media_files.filter((media: MediaFile) => media.file_type === 'document').length === 0) && (
                      <div className="text-center py-4">
                        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">No documents</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-purple-500" />
                    Links
                  </h3>
                  <div className="space-y-2">
                    {/* Links - For now showing empty state, can be extended later */}
                    <div className="text-center py-4">
                      <Globe className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">No links available</p>
                    </div>
                  </div>
                </div>


              </div>

              {/* Empty State */}
              {false && ( // Change to true when no media exists
                <div className="text-center py-8">
                  <Image className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No media files yet. Add images, documents, or links to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddActivityModal
        isOpen={showAddActivityModal}
        onClose={() => setShowAddActivityModal(false)}
        onAdd={handleAddActivity}
      />
      
      <EditActivityModal
        isOpen={showEditActivityModal}
        onClose={() => {
          setShowEditActivityModal(false);
          setEditingActivity(null);
        }}
        activity={editingActivity}
        onUpdate={handleUpdateActivity}
      />

      <EditNoteModal
        isOpen={showEditNoteModal}
        onClose={() => {
          setShowEditNoteModal(false);
          setEditingNote(null);
        }}
        note={editingNote}
        onUpdate={handleUpdateNote}
      />
      
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAdd={handleAddTask}
      />

      <EditTaskModal
        isOpen={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onUpdate={handleUpdateTask}
      />

      <StatusChangeModal
        isOpen={showStatusChangeModal}
        onClose={() => setShowStatusChangeModal(false)}
        currentStatus={currentLeadStatus}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default LeadDetails;
