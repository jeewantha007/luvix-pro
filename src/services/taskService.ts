import { supabase } from '../../data/supabaseClient';
import { Task, DatabaseTask } from '../types';

// Convert database format to frontend format
const mapDatabaseTaskToTask = (dbTask: DatabaseTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description,
  priority: dbTask.priority,
  status: dbTask.status,
  dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
  completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined
});

// Convert frontend format to database format
const mapTaskToDatabaseTask = (task: Omit<Task, 'id' | 'dueDate' | 'completedAt'>, leadContactNumber: string, userId: string): Omit<DatabaseTask, 'id' | 'created_at' | 'updated_at'> => ({
  lead_contact_number: leadContactNumber,
  user_id: userId,
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status
});

export class TaskService {
  // Get all tasks for a specific lead
  static async getTasksByLeadContactNumber(leadContactNumber: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('lead_contact_number', leadContactNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return data?.map(mapDatabaseTaskToTask) || [];
  }

  // Create a new task
  static async createTask(taskData: Omit<Task, 'id' | 'status' | 'completedAt'>, leadContactNumber: string, userId: string): Promise<Task> {
    const dbTask = {
      ...mapTaskToDatabaseTask({
        ...taskData,
        status: 'pending'
      }, leadContactNumber, userId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add due_date if provided
    if (taskData.dueDate) {
      (dbTask as any).due_date = taskData.dueDate.toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTask])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return mapDatabaseTaskToTask(data);
  }

  // Update an existing task
  static async updateTask(id: string, taskData: Partial<Omit<Task, 'id' | 'status' | 'completedAt'>>): Promise<Task> {
    // Map frontend data to database format
    const dbUpdateData: any = {};
    
    if (taskData.title !== undefined) {
      dbUpdateData.title = taskData.title;
    }
    if (taskData.description !== undefined) {
      dbUpdateData.description = taskData.description;
    }
    if (taskData.priority !== undefined) {
      dbUpdateData.priority = taskData.priority;
    }
    if (taskData.dueDate !== undefined) {
      // Handle dueDate that could be a string or Date object
      let dueDateValue: string | null = null;
      if (taskData.dueDate) {
        if (typeof taskData.dueDate === 'string') {
          // If it's already a string, use it directly
          dueDateValue = taskData.dueDate;
        } else if (taskData.dueDate instanceof Date) {
          // If it's a Date object, convert to ISO string
          dueDateValue = taskData.dueDate.toISOString();
        }
      }
      dbUpdateData.due_date = dueDateValue;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return mapDatabaseTaskToTask(data);
  }

  // Mark task as completed
  static async completeTask(id: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error completing task:', error);
      throw error;
    }

    return mapDatabaseTaskToTask(data);
  }

  // Delete a task
  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get a single task by ID
  static async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      throw error;
    }

    return data ? mapDatabaseTaskToTask(data) : null;
  }

  // Get all tasks for the current user
  static async getUserTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }

    return data?.map(mapDatabaseTaskToTask) || [];
  }

  // Legacy method for backward compatibility
  static async getTasksByLeadId(leadId: string): Promise<Task[]> {
    // This method is deprecated, use getTasksByLeadContactNumber instead
    console.warn('getTasksByLeadId is deprecated, use getTasksByLeadContactNumber instead');
    return this.getTasksByLeadContactNumber(leadId);
  }
}

