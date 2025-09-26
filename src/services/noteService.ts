import { supabase } from '../../data/supabaseClient';
import { Note, DatabaseNote } from '../types';

// Convert database format to frontend format
const mapDatabaseNoteToNote = (dbNote: DatabaseNote): Note => ({
  id: dbNote.id,
  content: dbNote.content,
  author: dbNote.author,
  timestamp: new Date(dbNote.created_at),
  isPrivate: dbNote.is_private,
  media_files: dbNote.media_files || []
});

// Convert frontend format to database format
const mapNoteToDatabaseNote = (note: Omit<Note, 'id' | 'timestamp'>, leadContactNumber: string, userId: string): Omit<DatabaseNote, 'id' | 'created_at' | 'updated_at'> => ({
  lead_contact_number: leadContactNumber,
  user_id: userId,
  content: note.content,
  author: note.author,
  is_private: note.isPrivate || false,
  media_files: note.media_files || []
});

export class NoteService {

  // Get all notes for a specific lead
  static async getNotesByLeadContactNumber(leadContactNumber: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('lead_contact_number', leadContactNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    return data?.map(mapDatabaseNoteToNote) || [];
  }

  // Create a new note
  static async createNote(noteData: Omit<Note, 'id' | 'timestamp'>, leadContactNumber: string, userId: string): Promise<Note> {
    const dbNote = {
      ...mapNoteToDatabaseNote(noteData, leadContactNumber, userId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notes')
      .insert([dbNote])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return mapDatabaseNoteToNote(data);
  }

  // Update an existing note
  static async updateNote(id: string, noteData: Partial<Omit<Note, 'id' | 'timestamp'>>): Promise<Note> {
    // Map frontend data to database format
    const dbUpdateData: any = {};
    
    if (noteData.content !== undefined) {
      dbUpdateData.content = noteData.content;
    }
    if (noteData.author !== undefined) {
      dbUpdateData.author = noteData.author;
    }
    if (noteData.isPrivate !== undefined) {
      dbUpdateData.is_private = noteData.isPrivate;
    }
    if (noteData.media_files !== undefined) {
      dbUpdateData.media_files = noteData.media_files;
    }

    const { data, error } = await supabase
      .from('notes')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }

    return mapDatabaseNoteToNote(data);
  }

  // Delete a note
  static async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  // Get a single note by ID
  static async getNoteById(id: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching note:', error);
      throw error;
    }

    return data ? mapDatabaseNoteToNote(data) : null;
  }

  // Get all notes for the current user
  static async getUserNotes(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user notes:', error);
      throw error;
    }

    return data?.map(mapDatabaseNoteToNote) || [];
  }

  // Legacy method for backward compatibility
  static async getNotesByLeadId(leadId: string): Promise<Note[]> {
    // This method is deprecated, use getNotesByLeadContactNumber instead
    console.warn('getNotesByLeadId is deprecated, use getNotesByLeadContactNumber instead');
    return this.getNotesByLeadContactNumber(leadId);
  }
}
