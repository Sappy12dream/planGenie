import { api } from './fetcher';

export interface DashboardAlert {
    id: string;
    user_id: string;
    type: 'quick_win' | 'overdue_task' | 'high_priority' | 'low_effort_task' | 'stale_plan';
    priority: number; // 1 = high, 2 = medium, 3 = low
    task_id?: string;
    plan_id?: string;
    title: string;
    message: string;
    action_label?: string;
    action_url?: string;
    created_at: string;
    dismissed_at?: string;
}

export async function getActiveAlerts(): Promise<DashboardAlert[]> {
    return api.get<DashboardAlert[]>('/api/alerts/');
}

export async function generateAlerts(): Promise<{ message: string; count: number }> {
    return api.post<{ message: string; count: number }>('/api/alerts/generate');
}

export async function dismissAlert(alertId: string): Promise<void> {
    return api.patch<void>(`/api/alerts/${alertId}/dismiss`);
}

