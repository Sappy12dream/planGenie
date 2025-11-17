import { api } from './fetcher';
import { supabase } from '../supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Upload {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export const uploadsApi = {
  /**
   * Upload a file for a task
   */
  async uploadFile(taskId: string, file: File): Promise<Upload> {
    // Get auth token
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/uploads/tasks/${taskId}`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload file');
    }

    return response.json();
  },

  /**
   * Get all uploads for a task
   */
  async getTaskUploads(taskId: string): Promise<Upload[]> {
    const response = await api.get<{ uploads: Upload[] }>(`/api/uploads/tasks/${taskId}`);
    return response.uploads;
  },

  /**
   * Delete an upload
   */
  async deleteUpload(uploadId: string): Promise<void> {
    return api.delete(`/api/uploads/${uploadId}`);
  },
};
