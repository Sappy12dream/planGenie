/**
 * Date Utility Functions for Task Management
 * Handles date formatting, relative time calculation, and overdue detection
 */

import { TaskStatus } from '@/types/plan';

/**
 * Format a date as a relative time string
 * @param date - The date to format
 * @returns A human-readable relative time string (e.g., "Today", "Tomorrow", "In 3 days")
 */
export function formatRelativeDate(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Reset time to midnight for accurate day comparison
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  const diffTime = targetMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 7) return `In ${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
  if (diffDays < -7) return `${Math.ceil(Math.abs(diffDays) / 7)} week${Math.ceil(Math.abs(diffDays) / 7) > 1 ? 's' : ''} ago`;
  
  return formatDueDate(targetDate);
}

/**
 * Check if a task is overdue
 * @param dueDate - The due date of the task
 * @param status - The current status of the task
 * @returns True if the task is overdue (past due and not completed)
 */
export function isOverdue(dueDate: Date | string | null, status: TaskStatus): boolean {
  if (!dueDate || status === 'completed') return false;
  
  const targetDate = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  
  // Reset time to midnight for accurate day comparison
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  return targetMidnight < todayMidnight;
}

/**
 * Get the appropriate badge color based on due date urgency
 * @param dueDate - The due date of the task
 * @param status - The current status of the task
 * @returns Color class string for styling
 */
export function getDueDateBadgeColor(dueDate: Date | string | null, status: TaskStatus): string {
  if (!dueDate) return 'default';
  if (status === 'completed') return 'default';
  
  const targetDate = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  
  // Reset time to midnight for accurate day comparison
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  const diffTime = targetMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Overdue (past due date)
  if (diffDays < 0) return 'destructive';
  
  // Due today
  if (diffDays === 0) return 'warning';
  
  // Due within 3 days
  if (diffDays <= 3) return 'default';
  
  // Future task
  return 'secondary';
}

/**
 * Get the badge variant for styling
 * @param dueDate - The due date of the task
 * @param status - The current status of the task
 * @returns Badge variant string
 */
export function getDueDateBadgeVariant(dueDate: Date | string | null, status: TaskStatus): 'default' | 'destructive' | 'outline' | 'secondary' {
  if (!dueDate) return 'outline';
  if (status === 'completed') return 'outline';
  
  const targetDate = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  
  // Reset time to midnight
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  const diffTime = targetMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Overdue
  if (diffDays < 0) return 'destructive';
  
  // Due today or within 3 days
  if (diffDays <= 3) return 'default';
  
  // Future
  return 'secondary';
}

/**
 * Format a date for display
 * @param date - The date to format
 * @returns A formatted date string (e.g., "Mon, Dec 2, 2024")
 */
export function formatDueDate(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  
  return targetDate.toLocaleDateString('en-US', options);
}

/**
 * Get a short format for due date
 * @param date - The date to format
 * @returns A short formatted date string (e.g., "Dec 2")
 */
export function formatDueDateShort(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };
  
  return targetDate.toLocaleDateString('en-US', options);
}

/**
 * Get number of days until due date
 * @param dueDate - The due date
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilDue(dueDate: Date | string | null): number | null {
  if (!dueDate) return null;
  
  const targetDate = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  
  // Reset time to midnight
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  
  const diffTime = targetMidnight.getTime() - todayMidnight.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
