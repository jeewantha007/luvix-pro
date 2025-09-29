import { supabase } from '../../data/supabaseClient';
import { Client, Address } from '../types';

// Convert customer data to Client interface
const convertToClient = (customer: any): Client => {
  // Generate a simple address object from available data
  let address: Address | undefined;
  if (customer.address) {
    address = {
      street: customer.address.street || '',
      city: customer.address.city || '',
      state: customer.address.state || '',
      zipCode: customer.address.zipCode || customer.address.postalCode || '',
      country: customer.address.country || ''
    };
  }

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email || undefined,
    phone: customer.phone || undefined,
    dateOfBirth: undefined, // Not available in customers table
    nationality: '', // Not available in customers table
    currentCountry: address?.country || '', // Use country from address if available
    targetCountry: '', // Not available in customers table
    passportNumber: undefined, // Not available in customers table
    maritalStatus: undefined, // Not available in customers table
    familyMembers: undefined, // Not available in customers table
    employmentStatus: undefined, // Not available in customers table
    educationLevel: undefined, // Not available in customers table
    incomeLevel: undefined, // Not available in customers table
    criminalRecord: false, // Not available in customers table
    healthConditions: undefined, // Not available in customers table
    emergencyContact: undefined, // Not available in customers table
    address: address,
    notes: customer.notes || undefined,
    totalCases: customer.total_orders || 0, // Map total_orders to totalCases
    totalSpent: customer.total_spent || 0,
    status: customer.total_orders > 0 ? 'active' : 'prospect', // Derive status from total_orders
    photoUrl: undefined, // Not available in customers table
    createdAt: new Date(customer.created_at),
    updatedAt: new Date(customer.updated_at)
  };
};

// Get all clients (from customers table)
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching clients: ${error.message}`);
  }

  return data.map(convertToClient);
};

// Create new client (as customer in customers table)
export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Convert Client data to customer format
  const customerData = {
    user_id: user.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    notes: client.notes,
    total_orders: client.totalCases,
    total_spent: client.totalSpent
  };

  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating client: ${error.message}`);
  }

  return convertToClient(data);
};

// Update client (customer in customers table)
export const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Client> => {
  // Convert Client updates to customer format
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.totalCases !== undefined) updateData.total_orders = updates.totalCases;
  if (updates.totalSpent !== undefined) updateData.total_spent = updates.totalSpent;

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating client: ${error.message}`);
  }

  return convertToClient(data);
};

// Delete client (customer from customers table)
export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting client: ${error.message}`);
  }
};

// Search clients (in customers table)
export const searchClients = async (searchTerm: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error searching clients: ${error.message}`);
  }

  return data.map(convertToClient);
};

// Upload client photo (not supported with current customers table)
export const uploadClientPhoto = async (clientId: string, file: File): Promise<string> => {
  throw new Error('Photo upload not supported for customers table');
};

export default {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  uploadClientPhoto
};