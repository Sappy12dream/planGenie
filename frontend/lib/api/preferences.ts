import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UserPreferences {
  user_id: string;
  email_notifications: boolean;
  task_reminders: boolean;
  weekly_digest: boolean;
  reminder_time_hours: number;
  digest_day_of_week: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesUpdate {
  email_notifications?: boolean;
  task_reminders?: boolean;
  weekly_digest?: boolean;
  reminder_time_hours?: number;
  digest_day_of_week?: number;
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

export async function getUserPreferences(): Promise<UserPreferences> {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}/api/preferences/`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch preferences');
  }

  return response.json();
}

export async function updateUserPreferences(updates: UserPreferencesUpdate): Promise<UserPreferences> {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}/api/preferences/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update preferences');
  }

  return response.json();
}
