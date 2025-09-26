import { supabase } from '../../data/supabaseClient';
import { Client, DatabaseClient } from '../types';

// Convert DatabaseClient to Client interface
const convertDatabaseClient = (dbClient: DatabaseClient): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  email: dbClient.email,
  phone: dbClient.phone,
  dateOfBirth: dbClient.date_of_birth ? new Date(dbClient.date_of_birth) : undefined,
  nationality: dbClient.nationality,
  currentCountry: dbClient.current_country,
  targetCountry: dbClient.target_country,
  passportNumber: dbClient.passport_number,
  maritalStatus: dbClient.marital_status,
  familyMembers: dbClient.family_members || [],
  employmentStatus: dbClient.employment_status,
  educationLevel: dbClient.education_level,
  incomeLevel: dbClient.income_level,
  criminalRecord: dbClient.criminal_record,
  healthConditions: dbClient.health_conditions,
  emergencyContact: dbClient.emergency_contact,
  address: dbClient.address,
  notes: dbClient.notes,
  totalCases: dbClient.total_cases,
  totalSpent: dbClient.total_spent,
  status: dbClient.status,
  photoUrl: dbClient.photo_url,
  createdAt: new Date(dbClient.created_at),
  updatedAt: new Date(dbClient.updated_at)
});

// Convert Client to DatabaseClient interface
const convertToDatabaseClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>> => {
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  return {
    user_id: user.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    date_of_birth: client.dateOfBirth?.toISOString(),
    nationality: client.nationality,
    current_country: client.currentCountry,
    target_country: client.targetCountry,
    passport_number: client.passportNumber,
    marital_status: client.maritalStatus,
    family_members: client.familyMembers,
    employment_status: client.employmentStatus,
    education_level: client.educationLevel,
    income_level: client.incomeLevel,
    criminal_record: client.criminalRecord,
    health_conditions: client.healthConditions,
    emergency_contact: client.emergencyContact,
    address: client.address,
    notes: client.notes,
    total_cases: client.totalCases,
    total_spent: client.totalSpent,
    status: client.status,
    photo_url: client.photoUrl
  };
};

// Get all clients
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching clients: ${error.message}`);
  }

  return data.map(convertDatabaseClient);
};

// Get client by ID
export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    throw new Error(`Error fetching client: ${error.message}`);
  }

  return convertDatabaseClient(data);
};

// Create new client
export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  const dbClient = await convertToDatabaseClient(client);

  const { data, error } = await supabase
    .from('clients')
    .insert([dbClient])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating client: ${error.message}`);
  }

  return convertDatabaseClient(data);
};

// Update client
export const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Client> => {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.dateOfBirth !== undefined) updateData.date_of_birth = updates.dateOfBirth?.toISOString();
  if (updates.nationality !== undefined) updateData.nationality = updates.nationality;
  if (updates.currentCountry !== undefined) updateData.current_country = updates.currentCountry;
  if (updates.targetCountry !== undefined) updateData.target_country = updates.targetCountry;
  if (updates.passportNumber !== undefined) updateData.passport_number = updates.passportNumber;
  if (updates.maritalStatus !== undefined) updateData.marital_status = updates.maritalStatus;
  if (updates.familyMembers !== undefined) updateData.family_members = updates.familyMembers;
  if (updates.employmentStatus !== undefined) updateData.employment_status = updates.employmentStatus;
  if (updates.educationLevel !== undefined) updateData.education_level = updates.educationLevel;
  if (updates.incomeLevel !== undefined) updateData.income_level = updates.incomeLevel;
  if (updates.criminalRecord !== undefined) updateData.criminal_record = updates.criminalRecord;
  if (updates.healthConditions !== undefined) updateData.health_conditions = updates.healthConditions;
  if (updates.emergencyContact !== undefined) updateData.emergency_contact = updates.emergencyContact;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.totalCases !== undefined) updateData.total_cases = updates.totalCases;
  if (updates.totalSpent !== undefined) updateData.total_spent = updates.totalSpent;
  if (updates.status !== undefined) updateData.status = updates.status;

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating client: ${error.message}`);
  }

  return convertDatabaseClient(data);
};

// Delete client
export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting client: ${error.message}`);
  }
};

// Search clients
export const searchClients = async (searchTerm: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,nationality.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error searching clients: ${error.message}`);
  }

  return data.map(convertDatabaseClient);
};

// Get clients by status
export const getClientsByStatus = async (status: Client['status']): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching clients by status: ${error.message}`);
  }

  return data.map(convertDatabaseClient);
};

// Get clients by target country
export const getClientsByTargetCountry = async (country: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('target_country', country)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching clients by target country: ${error.message}`);
  }

  return data.map(convertDatabaseClient);
};

// Get clients by nationality
export const getClientsByNationality = async (nationality: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('nationality', nationality)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching clients by nationality: ${error.message}`);
  }

  return data.map(convertDatabaseClient);
};

// Update client stats (total cases and total spent)
export const updateClientStats = async (clientId: string): Promise<void> => {
  // Get all orders for this client
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('client_id', clientId);

  if (ordersError) {
    throw new Error(`Error fetching orders for client stats: ${ordersError.message}`);
  }

  const totalCases = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);

  // Update client stats
  const { error: updateError } = await supabase
    .from('clients')
    .update({
      total_cases: totalCases,
      total_spent: totalSpent
    })
    .eq('id', clientId);

  if (updateError) {
    throw new Error(`Error updating client stats: ${updateError.message}`);
  }
};

// Get client statistics
export const getClientStatistics = async (): Promise<{
  totalClients: number;
  activeClients: number;
  prospectClients: number;
  inactiveClients: number;
  totalRevenue: number;
  averageRevenuePerClient: number;
  topTargetCountries: Array<{ country: string; count: number }>;
  topNationalities: Array<{ nationality: string; count: number }>;
}> => {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*');

  if (error) {
    throw new Error(`Error fetching client statistics: ${error.message}`);
  }

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const prospectClients = clients.filter(c => c.status === 'prospect').length;
  const inactiveClients = clients.filter(c => c.status === 'inactive').length;
  const totalRevenue = clients.reduce((sum, client) => sum + client.total_spent, 0);
  const averageRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0;

  // Count target countries
  const targetCountryCounts: { [key: string]: number } = {};
  clients.forEach(client => {
    const country = client.target_country;
    targetCountryCounts[country] = (targetCountryCounts[country] || 0) + 1;
  });

  const topTargetCountries = Object.entries(targetCountryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Count nationalities
  const nationalityCounts: { [key: string]: number } = {};
  clients.forEach(client => {
    const nationality = client.nationality;
    nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
  });

  const topNationalities = Object.entries(nationalityCounts)
    .map(([nationality, count]) => ({ nationality, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalClients,
    activeClients,
    prospectClients,
    inactiveClients,
    totalRevenue,
    averageRevenuePerClient,
    topTargetCountries,
    topNationalities
  };
};

// Upload client photo
export const uploadClientPhoto = async (clientId: string, file: File): Promise<string> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}-${Date.now()}.${fileExt}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('client-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Error uploading photo: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('client-photos')
      .getPublicUrl(fileName);

    const photoUrl = urlData.publicUrl;

    // Update client record with photo URL
    const { error: updateError } = await supabase
      .from('clients')
      .update({ photo_url: photoUrl })
      .eq('id', clientId);

    if (updateError) {
      throw new Error(`Error updating client photo URL: ${updateError.message}`);
    }

    return photoUrl;
  } catch (error) {
    throw error;
  }
};

// Delete client photo
export const deleteClientPhoto = async (clientId: string, photoUrl: string): Promise<void> => {
  try {
    // Extract filename from URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('client-photos')
      .remove([fileName]);

    if (deleteError) {
      throw new Error(`Error deleting photo from storage: ${deleteError.message}`);
    }

    // Update client record to remove photo URL
    const { error: updateError } = await supabase
      .from('clients')
      .update({ photo_url: null })
      .eq('id', clientId);

    if (updateError) {
      throw new Error(`Error updating client photo URL: ${updateError.message}`);
    }
  } catch (error) {
    throw error;
  }
};

// Update client photo URL (for when photo is uploaded elsewhere)
export const updateClientPhotoUrl = async (clientId: string, photoUrl: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .update({ photo_url: photoUrl })
    .eq('id', clientId);

  if (error) {
    throw new Error(`Error updating client photo URL: ${error.message}`);
  }
}; 