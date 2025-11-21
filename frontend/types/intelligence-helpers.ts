// Helper utility types and functions for AI intelligence metadata

import { Task, TaskDifficulty, Plan } from './plan';

/**
 * Helper to get difficulty label
 */
export function getDifficultyLabel(difficulty: TaskDifficulty | null | undefined): string {
    if (!difficulty) return 'Unknown';

    const labels: Record<TaskDifficulty, string> = {
        1: 'Very Easy',
        2: 'Easy',
        3: 'Medium',
        4: 'Hard',
        5: 'Very Hard',
    };

    return labels[difficulty];
}

/**
 * Helper to get difficulty color for styling
 */
export function getDifficultyColor(difficulty: TaskDifficulty | null | undefined): string {
    if (!difficulty) return 'gray';

    const colors: Record<TaskDifficulty, string> = {
        1: 'green',
        2: 'blue',
        3: 'yellow',
        4: 'orange',
        5: 'red',
    };

    return colors[difficulty];
}

/**
 * Format time estimate for display
 */
export function formatTimeEstimate(hours: number | string | null | undefined): string {
    if (!hours) return 'Not estimated';

    // Parse string to number if needed (database returns DECIMAL as string)
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;

    if (numHours < 1) {
        return `${Math.round(numHours * 60)} min`;
    }

    if (numHours === 1) {
        return '1 hour';
    }

    // Show decimal for values like 1.5, 2.5
    if (numHours % 1 !== 0) {
        return `${numHours.toFixed(1)} hours`;
    }

    return `${numHours} hours`;
}

/**
 * Format cost for display
 */
export function formatCost(cost: number | string | null | undefined): string {
    if (cost === null || cost === undefined) return 'Cost unknown';

    // Parse string to number if needed
    const numCost = typeof cost === 'string' ? parseFloat(cost) : cost;

    if (numCost === 0) return 'Free';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numCost);
}

/**
 * Calculate total time for a list of tasks
 */
export function calculateTotalTime(tasks: Task[]): number {
    return tasks.reduce((total, task) => {
        return total + (task.estimated_time_hours || 0);
    }, 0);
}

/**
 * Calculate total cost for a list of tasks
 */
export function calculateTotalCost(tasks: Task[]): number {
    return tasks.reduce((total, task) => {
        return total + (task.estimated_cost_usd || 0);
    }, 0);
}

/**
 * Get health score color for styling
 */
export function getHealthScoreColor(score: number | null | undefined): string {
    if (!score) return 'gray';

    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
}

/**
 * Get health score label
 */
export function getHealthScoreLabel(score: number | null | undefined): string {
    if (!score) return 'Not analyzed';

    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
}

/**
 * Check if task has prerequisites
 */
export function hasPrerequisites(task: Task): boolean {
    return (task.prerequisites?.length || 0) > 0;
}

/**
 * Get prerequisite task titles
 */
export function getPrerequisiteTasks(task: Task, allTasks: Task[]): Task[] {
    if (!task.prerequisites || task.prerequisites.length === 0) {
        return [];
    }

    return allTasks.filter(t =>
        task.prerequisites!.includes(t.order)
    );
}

/**
 * Sort tasks by prerequisites (topological sort)
 * Ensures prerequisite tasks appear before dependent tasks
 */
export function sortTasksByPrerequisites(tasks: Task[]): Task[] {
    const sorted: Task[] = [];
    const visited = new Set<string>();

    function visit(task: Task) {
        if (visited.has(task.id)) return;

        // Visit prerequisites first
        if (task.prerequisites && task.prerequisites.length > 0) {
            const prereqTasks = tasks.filter(t =>
                task.prerequisites!.includes(t.order)
            );
            prereqTasks.forEach(visit);
        }

        visited.add(task.id);
        sorted.push(task);
    }

    tasks.forEach(visit);
    return sorted;
}

/**
 * Check if all prerequisites for a task are completed
 */
export function arePrerequisitesCompleted(task: Task, allTasks: Task[]): boolean {
    if (!task.prerequisites || task.prerequisites.length === 0) {
        return true;
    }

    const prereqTasks = getPrerequisiteTasks(task, allTasks);
    return prereqTasks.every(t => t.status === 'completed');
}

/**
 * Get task completion percentage
 */
export function getTaskCompletionPercentage(tasks: Task[]): number {
    if (tasks.length === 0) return 0;

    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
}

/**
 * Get estimated time remaining
 */
export function getEstimatedTimeRemaining(tasks: Task[]): number {
    return tasks
        .filter(t => t.status !== 'completed')
        .reduce((total, task) => total + (task.estimated_time_hours || 0), 0);
}

/**
 * Get estimated cost remaining
 */
export function getEstimatedCostRemaining(tasks: Task[]): number {
    return tasks
        .filter(t => t.status !== 'completed')
        .reduce((total, task) => total + (task.estimated_cost_usd || 0), 0);
}
