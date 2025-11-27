/**
 * @jest-environment jsdom
 */

import {
    formatRelativeDate,
    isOverdue,
    getDueDateBadgeVariant,
    formatDueDate,
    formatDueDateShort,
    getDaysUntilDue,
} from '../date-utils';
import { TaskStatus } from '@/types/plan';

describe('Date Utilities', () => {
    describe('formatRelativeDate', () => {
        it('should return "Today" for today\'s date', () => {
            const today = new Date();
            expect(formatRelativeDate(today)).toBe('Today');
        });

        it('should return "Tomorrow" for tomorrow\'s date', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            expect(formatRelativeDate(tomorrow)).toBe('Tomorrow');
        });

        it('should return "Yesterday" for yesterday\'s date', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(formatRelativeDate(yesterday)).toBe('Yesterday');
        });

        it('should return "In X days" for future dates', () => {
            const future = new Date();
            future.setDate(future.getDate() + 3);
            expect(formatRelativeDate(future)).toBe('In 3 days');
        });

        it('should return "X days ago" for past dates', () => {
            const past = new Date();
            past.setDate(past.getDate() - 3);
            expect(formatRelativeDate(past)).toBe('3 days ago');
        });

        it('should handle string dates', () => {
            const today = new Date();
            expect(formatRelativeDate(today.toISOString())).toBe('Today');
        });
    });

    describe('isOverdue', () => {
        it('should return true for past dates with pending status', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            expect(isOverdue(pastDate, 'pending')).toBe(true);
        });

        it('should return false for past dates with completed status', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            expect(isOverdue(pastDate, 'completed')).toBe(false);
        });

        it('should return false for future dates', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            expect(isOverdue(futureDate, 'pending')).toBe(false);
        });

        it('should return false for null due date', () => {
            expect(isOverdue(null, 'pending')).toBe(false);
        });

        it('should return false for today\'s date', () => {
            const today = new Date();
            expect(isOverdue(today, 'pending')).toBe(false);
        });

        it('should handle string dates', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            expect(isOverdue(pastDate.toISOString(), 'pending')).toBe(true);
        });
    });

    describe('getDueDateBadgeVariant', () => {
        it('should return "destructive" for overdue tasks', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            expect(getDueDateBadgeVariant(pastDate, 'pending')).toBe('destructive');
        });

        it('should return "default" for tasks due today', () => {
            const today = new Date();
            expect(getDueDateBadgeVariant(today, 'pending')).toBe('default');
        });

        it('should return "default" for tasks due within 3 days', () => {
            const nearFuture = new Date();
            nearFuture.setDate(nearFuture.getDate() + 2);
            expect(getDueDateBadgeVariant(nearFuture, 'pending')).toBe('default');
        });

        it('should return "secondary" for future tasks', () => {
            const farFuture = new Date();
            farFuture.setDate(farFuture.getDate() + 5);
            expect(getDueDateBadgeVariant(farFuture, 'pending')).toBe('secondary');
        });

        it('should return "outline" for completed tasks', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            expect(getDueDateBadgeVariant(pastDate, 'completed')).toBe('outline');
        });

        it('should return "outline" for null due date', () => {
            expect(getDueDateBadgeVariant(null, 'pending')).toBe('outline');
        });
    });

    describe('formatDueDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2024-12-25');
            const formatted = formatDueDate(date);
            expect(formatted).toMatch(/Dec/);
            expect(formatted).toMatch(/25/);
            expect(formatted).toMatch(/2024/);
        });

        it('should handle string dates', () => {
            const formatted = formatDueDate('2024-12-25');
            expect(formatted).toMatch(/Dec/);
            expect(formatted).toMatch(/25/);
        });
    });

    describe('formatDueDateShort', () => {
        it('should format date in short format', () => {
            const date = new Date('2024-12-25');
            const formatted = formatDueDateShort(date);
            expect(formatted).toMatch(/Dec/);
            expect(formatted).toMatch(/25/);
            expect(formatted).not.toMatch(/2024/);
        });

        it('should handle string dates', () => {
            const formatted = formatDueDateShort('2024-12-25');
            expect(formatted).toMatch(/Dec/);
        });
    });

    describe('getDaysUntilDue', () => {
        it('should return 0 for today', () => {
            const today = new Date();
            expect(getDaysUntilDue(today)).toBe(0);
        });

        it('should return positive number for future dates', () => {
            const future = new Date();
            future.setDate(future.getDate() + 5);
            expect(getDaysUntilDue(future)).toBe(5);
        });

        it('should return negative number for past dates', () => {
            const past = new Date();
            past.setDate(past.getDate() - 3);
            expect(getDaysUntilDue(past)).toBe(-3);
        });

        it('should return null for null due date', () => {
            expect(getDaysUntilDue(null)).toBe(null);
        });

        it('should handle string dates', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            expect(getDaysUntilDue(tomorrow.toISOString())).toBe(1);
        });
    });
});
