import { api } from './fetcher';

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

export async function getUserPreferences(): Promise<UserPreferences> {
  return api.get<UserPreferences>('/api/preferences/');
}

export async function updateUserPreferences(updates: UserPreferencesUpdate): Promise<UserPreferences> {
  return api.patch<UserPreferences>('/api/preferences/', updates);
}

