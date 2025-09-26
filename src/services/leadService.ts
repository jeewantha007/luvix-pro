import { supabase } from '../../data/supabaseClient';
import { Lead, DatabaseLead } from '../types';

// Convert database format to frontend format
const mapDatabaseLeadToLead = (dbLead: DatabaseLead): Lead => ({
  id: dbLead.id,
  name: dbLead.name,
  email: dbLead.email,
  phone: dbLead.phone,
  description: dbLead.description,
  source: dbLead.source,
  status: dbLead.status,
  media_files: dbLead.media_files || [],
  createdAt: new Date(dbLead.created_at),
  updatedAt: new Date(dbLead.updated_at)
});

// Convert frontend format to database format
const mapLeadToDatabaseLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Omit<DatabaseLead, 'id' | 'created_at' | 'updated_at'> => ({
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  description: lead.description,
  source: lead.source,
  status: lead.status,
  media_files: lead.media_files || []
});

export class LeadService {
  // Get all leads from wp_leads table
  static async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('wp_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    return data?.map(mapDatabaseLeadToLead) || [];
  }

  // Create a new lead
  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const databaseLead = {
      ...mapLeadToDatabaseLead(leadData),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating lead with timestamps:', {
      created_at: databaseLead.created_at,
      updated_at: databaseLead.updated_at
    });

    const { data, error } = await supabase
      .from('wp_leads')
      .insert(databaseLead)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    return mapDatabaseLeadToLead(data);
  }

  // Update an existing lead
  static async updateLead(id: string, leadData: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Lead> {
    // Convert frontend field names to database field names
    const updateData: any = {};
    if (leadData.name !== undefined) updateData.name = leadData.name;
    if (leadData.email !== undefined) updateData.email = leadData.email;
    if (leadData.phone !== undefined) updateData.phone = leadData.phone;
    if (leadData.description !== undefined) updateData.description = leadData.description;
    if (leadData.source !== undefined) updateData.source = leadData.source;
    if (leadData.status !== undefined) updateData.status = leadData.status;
    if (leadData.media_files !== undefined) updateData.media_files = leadData.media_files;

    const { data, error } = await supabase
      .from('wp_leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      throw error;
    }

    return mapDatabaseLeadToLead(data);
  }

  // Delete a lead
  static async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('wp_leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Get a single lead by ID
  static async getLeadById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('wp_leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }

    return data ? mapDatabaseLeadToLead(data) : null;
  }

  // Search leads
  static async searchLeads(searchTerm: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('wp_leads')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching leads:', error);
      throw error;
    }

    return data?.map(mapDatabaseLeadToLead) || [];
  }
}

