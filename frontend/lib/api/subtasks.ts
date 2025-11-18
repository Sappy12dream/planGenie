import { api } from './fetcher';

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  order: number;
  created_at: string;
  updated_at: string;
}

export interface SubtaskCreateRequest {
  title: string;
  description?: string;
}

export interface SubtaskUpdateRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  order?: number;
}

export const subtasksApi = {
  /**
   * Get all subtasks for a task
   */
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    return api.get<Subtask[]>(`/api/subtasks/tasks/${taskId}`);
  },

  /**
   * Create a new subtask
   */
  async createSubtask(taskId: string, data: SubtaskCreateRequest): Promise<Subtask> {
    return api.post<Subtask>(`/api/subtasks?task_id=${taskId}`, data);
  },

  /**
   * Update a subtask
   */
  async updateSubtask(subtaskId: string, data: SubtaskUpdateRequest): Promise<Subtask> {
    return api.patch<Subtask>(`/api/subtasks/${subtaskId}`, data);
  },

  /**
   * Delete a subtask
   */
  async deleteSubtask(subtaskId: string): Promise<void> {
    return api.delete(`/api/subtasks/${subtaskId}`);
  },

  /**
   * Generate subtasks with AI
   */
  async generateSubtasks(
    taskId: string,
    taskTitle: string,
    taskDescription?: string
  ): Promise<Subtask[]> {
    return api.post<Subtask[]>('/api/subtasks/generate', {
      task_id: taskId,
      task_title: taskTitle,
      task_description: taskDescription,
    });
  },
};
