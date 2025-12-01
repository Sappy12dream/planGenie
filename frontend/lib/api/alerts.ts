import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeader() {
    const supabase = createClientComponentClient();
    const { data: { session } } = await supabase.auth.getSession();
    return {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
    };
}

export async function getActiveAlerts(): Promise<DashboardAlert[]> {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/alerts/`, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        throw new Error('Failed to fetch alerts');
    }

    return response.json();
}

export async function generateAlerts(): Promise<{ message: string; count: number }> {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/alerts/generate`, {
        method: 'POST',
        headers,
    });

    if (!response.ok) {
        throw new Error('Failed to generate alerts');
    }

    return response.json();
}

export async function dismissAlert(alertId: string): Promise<void> {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/api/alerts/${alertId}/dismiss`, {
        method: 'PATCH',
        headers,
    });

    if (!response.ok) {
        throw new Error('Failed to dismiss alert');
    }
}
