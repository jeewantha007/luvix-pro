import { supabase } from '../../data/supabaseClient';
import { MediaFile } from '../types';

export class NoteMediaService {
  // Upload media file for a note
  static async uploadMediaFile(file: File, noteId: string): Promise<MediaFile> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${noteId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes_media') // Using dedicated notes bucket
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('notes_media')
        .getPublicUrl(fileName);

      // Determine file type
      let fileType: 'image' | 'video' | 'document' | 'audio' = 'document';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt || '')) {
        fileType = 'image';
      } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExt || '')) {
        fileType = 'video';
      } else if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(fileExt || '')) {
        fileType = 'audio';
      }

      // Create media file object
      const mediaFile: MediaFile = {
        id: `media-${Date.now()}`,
        file_name: file.name,
        file_type: fileType,
        file_url: publicUrl,
        file_size: file.size,
        uploaded_at: new Date().toISOString()
      };

      return mediaFile;
    } catch (error) {
      console.error('Error uploading media file:', error);
      throw error;
    }
  }

  // Delete media file
  static async deleteMediaFile(fileName: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('notes_media')
        .remove([fileName]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting media file:', error);
      throw error;
    }
  }

  // Validate file type and size
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not supported' };
    }

    return { isValid: true };
  }
}
