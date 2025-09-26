export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface FileData {
  filename?: string;
  name?: string;
  url?: string;
  size?: number;
  type?: string;
  mimetype?: string;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  fileData?: FileData; // wp_user_msg_file data from Supabase
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  name?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
  isActive: boolean;
}

export interface Group extends Chat {
  admins: string[];
  description?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Status {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  timestamp: Date;
  expiresAt: Date;
  viewers: string[];
  privacy: 'all' | 'selected' | 'except';
  selectedContacts?: string[];
}

export interface AppContextType {
  currentUser: User | null;
  chats: Chat[];
  selectedChat: Chat | null;
  selectedChatNumber: string;
  messages: Message[];
  statuses: Status[];
  leads: Lead[];
  isAuthenticated: boolean;
  notifications: NotificationType[];
  showProfile: boolean;
  theme: 'light' | 'dark';
  language: string;
  subscriptionStatus: {
    hasSubscription: boolean;
    isActive: boolean;
    status: string | null;
    redirectTo: string | null;
    planId?: string | null;
    billingCycle?: string | null;
    currentPeriodEnd?: string | null;
    nextBillingDate?: string | null;
    cancelAtPeriodEnd?: boolean;
    cancelAt?: string | null;
  } | null;
  setCurrentUser: (user: User | null) => void;
  setSelectedChat: (chat: Chat | null) => void;
  setSelectedChatNumber: (number: string) => void;
  setShowProfile: (show: boolean) => void;
  toggleTheme: () => void;
  changeLanguage: (language: string) => void;
  sendMessage: (content: string, type: Message['type'], mediaUrl?: string) => void;
  sendBroadcastMessage: (content: string, chatIds: string[], type?: Message['type'], mediaUrl?: string) => void;
  markAsRead: (chatId: string) => void;
  createGroup: (name: string, participants: User[]) => void;
  postStatus: (content: string, type: Status['type'], mediaUrl?: string) => void;
  deleteStatus: (statusId: string) => void;
  addLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lead | undefined>;
  updateLead: (id: string, leadData: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Lead | undefined>;
  deleteLead: (id: string) => Promise<void>;
}

export interface Lead {
  id: string;
  name?: string;
  email?: string;
  phone: string;
  description?: string;
  source: 'website' | 'whatsapp' | 'phone' | 'referral' | 'social' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  media_files?: MediaFile[];
  createdAt: Date;
  updatedAt: Date;
}

// Database types for Supabase - Updated to match wp_leads table structure
export interface DatabaseLead {
  id: string;
  name?: string;
  email?: string;
  phone: string;
  description?: string;
  source: 'website' | 'whatsapp' | 'phone' | 'referral' | 'social' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  media_files?: MediaFile[];
  created_at: string;
  updated_at: string;
}

// Simple media file interface
export interface MediaFile {
  id: string;
  file_name: string;
  file_type: 'image' | 'video' | 'document' | 'audio';
  file_url: string;
  file_size?: number;
  uploaded_at: string;
}



export interface DatabaseNote {
  id: string;
  lead_contact_number: string; // Connect to specific lead by phone number
  user_id: string; // Connect to logged-in user
  content: string;
  author: string;
  is_private: boolean;
  media_files?: MediaFile[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  completedAt?: Date;
}

export interface DatabaseTask {
  id: string;
  lead_contact_number: string; // Connect to specific lead by phone number
  user_id: string; // Connect to logged-in user
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Activity types for frontend and database
export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'other';
  title: string;
  description: string;
  timestamp: Date;
}

export interface DatabaseActivity {
  id: string;
  lead_contact_number: string; // Connect to specific lead by phone number
  user_id: string; // Connect to logged-in user
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'other';
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Note types for frontend and database
export interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  isPrivate?: boolean;
  media_files?: MediaFile[];
}

export interface NotificationType {
  id: string;
  type: 'message' | 'status' | 'group' | 'lead';
  title: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  chatId?: string;
  userId?: string;
  leadId?: string;
}

// CMS Types

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  nationality: string;
  currentCountry: string;
  targetCountry: string;
  passportNumber?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  familyMembers?: FamilyMember[];
  employmentStatus?: 'employed' | 'unemployed' | 'student' | 'retired' | 'self_employed';
  educationLevel?: 'high_school' | 'bachelor' | 'master' | 'phd' | 'other';
  incomeLevel?: 'low' | 'medium' | 'high' | 'very_high';
  criminalRecord: boolean;
  healthConditions?: string;
  emergencyContact?: EmergencyContact;
  address?: Address;
  notes?: string;
  totalCases: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'prospect';
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  name: string;
  relationship: string;
  dateOfBirth?: Date;
  nationality?: string;
  passportNumber?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}


// Product Business Customer Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseCustomer {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  notes?: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}



// Database types for CMS

export interface DatabaseClient {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  nationality: string;
  current_country: string;
  target_country: string;
  passport_number?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  family_members?: FamilyMember[];
  employment_status?: 'employed' | 'unemployed' | 'student' | 'retired' | 'self_employed';
  education_level?: 'high_school' | 'bachelor' | 'master' | 'phd' | 'other';
  income_level?: 'low' | 'medium' | 'high' | 'very_high';
  criminal_record: boolean;
  health_conditions?: string;
  emergency_contact?: EmergencyContact;
  address?: Address;
  notes?: string;
  total_cases: number;
  total_spent: number;
  status: 'active' | 'inactive' | 'prospect';
  photo_url?: string;
  created_at: string;
  updated_at: string;
}



// Immigration Service Types
export interface Service {
  id: string;
  name: string;
  description?: string;
  serviceType: 'main' | 'sub'; // main service or sub-service
  parentServiceId?: string; // for sub-services, reference to parent service
  category: 'business_immigration' | 'family_sponsorship' | 'student_visa' | 'work_permit' | 'citizenship' | 'refugee_asylum' | 'appeals' | 'general';
  country: string; // UK, USA, Canada, Australia, etc.
  basePrice: number;
  currency: string;
  requirements: string[];
  documentsRequired: string[];
  processingStages: string[];
  isActive: boolean;
  languageSupport: string[];
  features: string[]; // Key features of the service
  imageUrl?: string; // URL to service image
  createdAt: Date;
  updatedAt: Date;
  subServices?: Service[]; // For main services, list of sub-services
}

export interface DatabaseService {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  service_type: 'main' | 'sub';
  parent_service_id?: string;
  category: 'business_immigration' | 'family_sponsorship' | 'student_visa' | 'work_permit' | 'citizenship' | 'refugee_asylum' | 'appeals' | 'general';
  country: string;
  base_price: number;
  currency: string;
  requirements: string[];
  documents_required: string[];
  processing_stages: string[];
  is_active: boolean;
  language_support: string[];
  features: string[];
  image_url?: string | { url: string } | null;
  created_at: string;
  updated_at: string;
}

// Immigration Client Types



// Immigration Case Types
export interface Case {
  id: string;
  caseNumber: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  serviceBasePrice: number; // Reference to service base price for comparison
  caseType: 'new_application' | 'renewal' | 'appeal' | 'extension' | 'change_of_status';
  status: 'initial_consultation' | 'document_collection' | 'application_submitted' | 'under_review' | 'additional_documents_requested' | 'interview_scheduled' | 'approved' | 'rejected' | 'appeal_filed' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submissionDate?: Date;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  governmentFees: number; // Government application fees
  serviceFees: number; // Your firm's service fees (can differ from base price)
  additionalFees?: number; // Extra fees for complexity, urgency, etc.
  discount?: number; // Discount applied (client relationship, bulk, etc.)
  totalAmount: number; // Final amount: serviceFees + governmentFees + additionalFees - discount
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  pricingNotes?: string; // Notes about why price differs from base price
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
}



export interface DatabaseCase {
  id: string;
  user_id: string;
  case_number: string;
  client_id: string;
  client_name: string;
  service_id: string;
  service_name: string;
  case_type: 'new_application' | 'renewal' | 'appeal' | 'extension' | 'change_of_status';
  status: 'initial_consultation' | 'document_collection' | 'application_submitted' | 'under_review' | 'additional_documents_requested' | 'interview_scheduled' | 'approved' | 'rejected' | 'appeal_filed' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submission_date?: string;
  expected_completion_date?: string;
  actual_completion_date?: string;
  government_fees: number;
  service_fees: number;
  total_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Product Types for Product-based CRM
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  sku?: string;
  price: number;
  currency: string;
  stockQuantity: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  features?: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  imageUrl?: string;
  productType: 'main' | 'variant';
  parentProductId?: string;
  variants?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

// Order Types for Product-based CRM
export interface OrderProduct {
  productId: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  products: OrderProduct[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}