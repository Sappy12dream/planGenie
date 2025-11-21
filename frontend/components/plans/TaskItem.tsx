'use client';

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/types/plan';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, TaskUpdateRequest } from '@/lib/api/tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GripVertical, ChevronDown, ChevronRight, Clock, Target, DollarSign, Wrench, Tag, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plan } from '@/types/plan';
import { toast } from 'sonner';
import { TaskFileUpload } from './TaskFileUpload';
import { SubtasksList } from './SubtasksList';
import { TaskDescription } from './TaskDescription';
import { formatTimeEstimate, formatCost, getDifficultyLabel, getDifficultyColor } from '@/types/intelligence-helpers';

import { Analytics } from '@/lib/monitoring/analytics';

interface TaskItemProps {
  task: Task;
  planId: string;
  isDragging?: boolean;
}

export function TaskItem({ task, planId, isDragging = false }: TaskItemProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(
    task.description || ''
  );

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const statusColors = {
    pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  };

  const statusLabels = {
    pending: 'To Do',
    in_progress: 'In Progress',
    completed: 'Done',
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: (updates: TaskUpdateRequest) =>
      tasksApi.updateTask(task.id, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['plan', planId] });

      const previousPlan = queryClient.getQueryData<Plan>(['plan', planId]);

      queryClient.setQueryData<Plan>(['plan', planId], (old) => {
        if (!old) return old;

        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === task.id ? { ...t, ...updates } : t
          ),
        };
      });

      return { previousPlan };
    },
    onError: (err, updates, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(['plan', planId], context.previousPlan);
      }
      toast.error('Failed to update task', {
        description: 'Please try again',
      });
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
    },
    onSuccess: (data, updates) => {
      if (updates.status === 'completed') {
        toast.success('Task completed!');
        Analytics.trackTaskCompleted(task.id, planId);
      } else {
        toast.success('Task updated');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', planId] });
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.deleteTask(task.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['plan', planId] });

      const previousPlan = queryClient.getQueryData<Plan>(['plan', planId]);

      queryClient.setQueryData<Plan>(['plan', planId], (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t) => t.id !== task.id),
        };
      });

      return { previousPlan };
    },
    onError: (err, variables, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(['plan', planId], context.previousPlan);
      }
      toast.error('Failed to delete task');
    },
    onSuccess: () => {
      setIsDeleting(false);
      toast.success('Task deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', planId] });
    },
  });

  const handleCheckboxChange = (checked: boolean) => {
    const newStatus = checked ? 'completed' : 'pending';
    updateTaskMutation.mutate({ status: newStatus });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleTitleSave = () => {
    const trimmedTitle = editedTitle.trim();
    if (!trimmedTitle) {
      toast.error('Task title cannot be empty');
      setEditedTitle(task.title);
      setIsEditingTitle(false);
      return;
    }

    if (trimmedTitle !== task.title) {
      updateTaskMutation.mutate({ title: trimmedTitle });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    const trimmedDescription = editedDescription.trim();
    if (trimmedDescription !== (task.description || '')) {
      updateTaskMutation.mutate({
        description: trimmedDescription || undefined,
      });
    }
    setIsEditingDescription(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setEditedDescription(task.description || '');
      setIsEditingDescription(false);
    }
  };

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-800 p-4 transition-shadow ${isDragging ? 'shadow-lg dark:shadow-slate-900/50' : 'hover:shadow-sm dark:hover:shadow-slate-900/50'
        }`}
    >
      {/* Drag Handle */}
      <div className="mt-1 shrink-0 cursor-grab text-slate-300 dark:text-slate-700 transition-colors hover:text-slate-500 dark:hover:text-slate-500 active:cursor-grabbing">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Checkbox */}
      <div
        className="mt-1 shrink-0"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={handleCheckboxChange}
          disabled={updateTaskMutation.isPending}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-2">
            {/* Expand/Collapse Button */}
            {task.description && !isEditingTitle && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="cursor-pointer mt-0.5 shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Editable Title */}
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex-1 rounded border border-blue-400 dark:border-blue-600 px-2 py-1 font-medium text-slate-900 dark:text-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={updateTaskMutation.isPending}
              />
            ) : (
              <h3
                onClick={() => {
                  if (!isDragging) {
                    if (task.description) {
                      setIsExpanded(!isExpanded);
                    } else {
                      setIsEditingTitle(true);
                    }
                  }
                }}
                className={`flex-1 cursor-pointer font-medium text-slate-900 dark:text-slate-100 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 ${task.status === 'completed'
                  ? 'text-slate-500 dark:text-slate-500 line-through'
                  : ''
                  }`}
              >
                {task.title}
              </h3>
            )}
          </div>

          <Badge variant="secondary" className={statusColors[task.status]}>
            {statusLabels[task.status]}
          </Badge>
        </div>

        {/* Description - Collapsible */}
        {task.description && isExpanded && !isEditingDescription && (
          <div
            onClick={() => !isDragging && setIsEditingDescription(true)}
            className="mb-3 cursor-pointer rounded-lg bg-slate-50 dark:bg-slate-800 p-3 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <TaskDescription
              description={task.description}
              isCompleted={task.status === 'completed'}
            />
          </div>
        )}

        {/* Editable Description */}
        {isEditingDescription && (
          <textarea
            ref={descriptionInputRef}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            onKeyDown={handleDescriptionKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            className="mb-3 w-full rounded border border-blue-400 dark:border-blue-600 px-2 py-1 text-sm text-slate-600 dark:text-slate-300 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            disabled={updateTaskMutation.isPending}
            placeholder="Add a description... (Ctrl+Enter to save, Esc to cancel)"
          />
        )}

        {!task.description && !isEditingTitle && !isEditingDescription && (
          <button
            onClick={() => setIsEditingDescription(true)}
            className="cursor-pointer mb-2 text-sm text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            + Add description
          </button>
        )}

        {task.due_date && (
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}

        {/* AI Intelligence Metadata */}
        {(task.estimated_time_hours || task.difficulty || task.estimated_cost_usd !== undefined ||
          (task.tools_needed && task.tools_needed.length > 0) ||
          (task.prerequisites && task.prerequisites.length > 0) ||
          (task.tags && task.tags.length > 0)) && (
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              {/* Time Estimate */}
              {task.estimated_time_hours && (
                <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-blue-700 dark:text-blue-300">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeEstimate(task.estimated_time_hours)}</span>
                </div>
              )}

              {/* Difficulty */}
              {task.difficulty && (
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 bg-${getDifficultyColor(task.difficulty)}-50 dark:bg-${getDifficultyColor(task.difficulty)}-950/30 text-${getDifficultyColor(task.difficulty)}-700 dark:text-${getDifficultyColor(task.difficulty)}-300`}>
                  <Target className="h-3 w-3" />
                  <span>{getDifficultyLabel(task.difficulty)}</span>
                </div>
              )}

              {/* Cost */}
              {task.estimated_cost_usd !== undefined && task.estimated_cost_usd !== null && (
                <div className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/30 px-2 py-1 text-green-700 dark:text-green-300">
                  <DollarSign className="h-3 w-3" />
                  <span>{formatCost(task.estimated_cost_usd)}</span>
                </div>
              )}

              {/* Tools */}
              {task.tools_needed && task.tools_needed.length > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/30 px-2 py-1 text-purple-700 dark:text-purple-300">
                  <Wrench className="h-3 w-3" />
                  <span>{task.tools_needed.length} tool{task.tools_needed.length > 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Prerequisites */}
              {task.prerequisites && task.prerequisites.length > 0 && (
                <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-950/30 px-2 py-1 text-orange-700 dark:text-orange-300">
                  <AlertCircle className="h-3 w-3" />
                  <span>{task.prerequisites.length} prerequisite{task.prerequisites.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Detailed Intelligence - Show when expanded */}
        {isExpanded && (task.tools_needed?.length || task.prerequisites?.length) && (
          <div className="mb-3 space-y-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm">
            {/* Tools List */}
            {task.tools_needed && task.tools_needed.length > 0 && (
              <div>
                <h4 className="mb-1 flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Wrench className="h-4 w-4" />
                  Tools Needed:
                </h4>
                <ul className="ml-5 list-disc space-y-0.5 text-slate-600 dark:text-slate-400">
                  {task.tools_needed.map((tool, index) => (
                    <li key={index}>{tool}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites List */}
            {task.prerequisites && task.prerequisites.length > 0 && (
              <div>
                <h4 className="mb-1 flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <AlertCircle className="h-4 w-4" />
                  Complete These Tasks First:
                </h4>
                <p className="ml-5 text-slate-600 dark:text-slate-400">
                  Tasks {task.prerequisites.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Subtasks Section - Only show when expanded */}
        {isExpanded && (
          <SubtasksList
            taskId={task.id}
            taskTitle={task.title}
            taskDescription={task.description}
          />
        )}

        {/* File Upload Section - Only show when expanded */}
        {isExpanded && (
          <div className="mt-3 border-t dark:border-slate-800 pt-3">
            <TaskFileUpload taskId={task.id} />
          </div>
        )}
      </div>

      {/* Delete Button */}
      <div
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{task.title}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
