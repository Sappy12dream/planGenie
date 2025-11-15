import { Task } from '@/types/plan';
import { api } from './fetcher';

export interface TaskCreateRequest {
  title: string;
  description?: string;
  due_date?: string;
  order?: number;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  order?: number;
}

export interface TaskReorderRequest {
  task_id: string;
  new_order: number;
}

export const tasksApi = {
  /**
   * Create a new task
   */
  async createTask(planId: string, data: TaskCreateRequest): Promise<Task> {
    return api.post<Task>(`/api/tasks/?plan_id=${planId}`, data);
  },

  /**
   * Update a task
   */
  async updateTask(taskId: string, data: TaskUpdateRequest): Promise<Task> {
    return api.patch<Task>(`/api/tasks/${taskId}`, data);
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    return api.delete(`/api/tasks/${taskId}`);
  },

  /**
   * Reorder tasks
   */
  async reorderTasks(tasks: TaskReorderRequest[]): Promise<void> {
    return api.post('/api/tasks/reorder', { tasks });
  },
};
