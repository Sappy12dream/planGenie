'use client';

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/types/plan';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, TaskUpdateRequest } from '@/lib/api/tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GripVertical } from 'lucide-react';
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
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  const statusColors = {
    pending: 'bg-slate-100 text-slate-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
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
      // Revert local state
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
    },
    onSuccess: (data, updates) => {
      if (updates.status === 'completed') {
        toast.success('Task completed!');
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
      toast.error('Failed to delete task', {
        description: 'Please try again',
      });
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
      // Convert empty string to undefined for API
      updateTaskMutation.mutate({ 
        description: trimmedDescription || undefined 
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
      className={`group flex items-start gap-3 rounded-lg border bg-white p-4 transition-shadow ${
        isDragging ? 'shadow-lg' : 'hover:shadow-sm'
      }`}
    >
      {/* Drag Handle */}
      <div className="mt-1 shrink-0 cursor-grab text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing">
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
              className="flex-1 rounded border border-blue-400 px-2 py-1 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={updateTaskMutation.isPending}
            />
          ) : (
            <h3
              onClick={() => !isDragging && setIsEditingTitle(true)}
              className={`flex-1 cursor-text font-medium text-slate-900 transition-all duration-200 hover:text-blue-600 ${
                task.status === 'completed' ? 'text-slate-500 line-through' : ''
              }`}
            >
              {task.title}
            </h3>
          )}
          
          <Badge variant="secondary" className={statusColors[task.status]}>
            {statusLabels[task.status]}
          </Badge>
        </div>

        {/* Editable Description */}
        {isEditingDescription ? (
          <textarea
            ref={descriptionInputRef}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            onKeyDown={handleDescriptionKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full rounded border border-blue-400 px-2 py-1 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={updateTaskMutation.isPending}
            placeholder="Add a description... (Ctrl+Enter to save, Esc to cancel)"
          />
        ) : (
          task.description || isEditingTitle ? (
            <p
              onClick={() => !isDragging && setIsEditingDescription(true)}
              className={`cursor-text text-sm text-slate-600 transition-all duration-200 hover:text-blue-600 ${
                task.status === 'completed' ? 'text-slate-400' : ''
              } ${!task.description ? 'italic text-slate-400' : ''}`}
            >
              {task.description || 'Click to add description...'}
            </p>
          ) : (
            <button
              onClick={() => setIsEditingDescription(true)}
              className="text-sm text-slate-400 hover:text-blue-600"
            >
              + Add description
            </button>
          )
        )}

        {task.due_date && (
          <p className="mt-2 text-xs text-slate-500">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}

        {/* File Upload Section */}
        <div className="mt-3 border-t pt-3">
          <TaskFileUpload taskId={task.id} />
        </div>
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
              className="text-slate-400 hover:text-red-600"
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
