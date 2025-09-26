import { supabase } from '../../data/supabaseClient';
import { Activity, DatabaseActivity } from '../types';

// Convert database format to frontend format
const mapDatabaseActivityToActivity = (dbActivity: DatabaseActivity): Activity => ({
  id: dbActivity.id,
  type: dbActivity.type,
  title: dbActivity.title,
  description: dbActivity.description,
  timestamp: new Date(dbActivity.created_at)
});

// Convert frontend format to database format
const mapActivityToDatabaseActivity = (activity: Omit<Activity, 'id' | 'timestamp'>, leadContactNumber: string, userId: string): Omit<DatabaseActivity, 'id' | 'created_at' | 'updated_at'> => ({
  lead_contact_number: leadContactNumber,
  user_id: userId,
  type: activity.type,
  title: activity.title,
  description: activity.description
});

export class ActivityService {
  // Get all activities for a specific lead
  static async getActivitiesByLeadContactNumber(leadContactNumber: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lead_contact_number', leadContactNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }

    return data?.map(mapDatabaseActivityToActivity) || [];
  }

  // Create a new activity
  static async createActivity(activityData: Omit<Activity, 'id' | 'timestamp'>, leadContactNumber: string, userId: string): Promise<Activity> {
    const dbActivity = {
      ...mapActivityToDatabaseActivity(activityData, leadContactNumber, userId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating activity with timestamp:', dbActivity.created_at);

    const { data, error } = await supabase
      .from('activities')
      .insert([dbActivity])
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      throw error;
    }

    return mapDatabaseActivityToActivity(data);
  }

  // Update an existing activity
  static async updateActivity(id: string, activityData: Partial<Omit<Activity, 'id' | 'timestamp'>>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .update(activityData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating activity:', error);
      throw error;
    }

    return mapDatabaseActivityToActivity(data);
  }

  // Delete an activity
  static async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  // Get a single activity by ID
  static async getActivityById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }

    return data ? mapDatabaseActivityToActivity(data) : null;
  }

  // Get all activities for the current user
  static async getUserActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }

    return data?.map(mapDatabaseActivityToActivity) || [];
  }

  // Legacy method for backward compatibility
  static async getActivitiesByLeadId(leadId: string): Promise<Activity[]> {
    // This method is deprecated, use getActivitiesByLeadContactNumber instead
    console.warn('getActivitiesByLeadId is deprecated, use getActivitiesByLeadContactNumber instead');
    return this.getActivitiesByLeadContactNumber(leadId);
  }
}

