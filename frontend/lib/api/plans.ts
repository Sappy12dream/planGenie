import { Plan, PlanGenerateRequest } from '@/types/plan';
import { api } from './fetcher';

interface PlanGenerateResponse {
  plan: Plan;
  message: string;
}

export const plansApi = {
  /**
   * Generate a new plan using AI
   */
  async generatePlan(data: PlanGenerateRequest): Promise<Plan> {
    const response = await api.post<PlanGenerateResponse>(
      '/api/plans/generate',
      data
    );
    return response.plan;
  },

  /**
   * Get a plan by ID
   */
  async getPlan(planId: string): Promise<Plan> {
    return api.get<Plan>(`/api/plans/${planId}`);
  },

  /**
   * Get all plans for current user
   */
  async getAllPlans(
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<Plan[]> {
    const params: Record<string, any> = { page, limit };
    if (status) {
      params.status = status;
    }
    return api.get<Plan[]>('/api/plans', { params });
  },

  /**
   * Get plan statistics (counts by status)
   */
  async getStats(): Promise<{
    active: number;
    completed: number;
    archived: number;
    total: number;
  }> {
    return api.get('/api/plans/stats');
  },

  /**
   * Delete a plan
   */
  async deletePlan(planId: string): Promise<void> {
    return api.delete(`/api/plans/${planId}`);
  },

  /**
   * Update plan status
   */
  async updatePlanStatus(planId: string, status: string): Promise<Plan> {
    return api.patch<Plan>(`/api/plans/${planId}/status?status=${status}`);
  },

  /**
   * Get all available plan templates
   */
  async getTemplates(): Promise<any[]> {
    return api.get<any[]>('/api/templates');
  },
};
