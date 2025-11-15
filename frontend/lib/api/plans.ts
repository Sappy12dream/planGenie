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
  async getAllPlans(status?: string): Promise<Plan[]> {
    const params = status ? { status } : undefined;
    return api.get<Plan[]>('/api/plans', { params });
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
};
