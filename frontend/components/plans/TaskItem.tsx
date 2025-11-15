'use client';

import { useState } from 'react';
import { Task } from '@/types/plan';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
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

interface TaskItemProps {
  task: Task;
  planId: string;
  isDragging?: boolean;
}

export function TaskItem({ task, planId, isDragging = false }: TaskItemProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Update task status mutation with optimistic update
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: Task['status']) =>
      tasksApi.updateTask(task.id, { status: newStatus }),
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['plan', planId] });

      const previousPlan = queryClient.getQueryData<Plan>(['plan', planId]);

      queryClient.setQueryData<Plan>(['plan', planId], (old) => {
        if (!old) return old;

        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === task.id ? { ...t, status: newStatus } : t
          ),
        };
      });

      return { previousPlan };
    },
    onError: (err, newStatus, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(['plan', planId], context.previousPlan);
      }
      toast.error('Failed to update task', {
        description: 'Please try again',
      });
    },
    onSuccess: (data, newStatus) => {
      if (newStatus === 'completed') {
        toast.success('Task completed!');
      } else {
        toast.success('Task updated');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['plan', planId] });
    },
  });

  // Delete task mutation with optimistic update
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
    updateStatusMutation.mutate(newStatus);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
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

      {/* Checkbox - Prevent drag when clicking */}
      <div
        className="mt-1 shrink-0"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={handleCheckboxChange}
          disabled={updateStatusMutation.isPending}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3
            className={`font-medium text-slate-900 transition-all duration-200 ${
              task.status === 'completed' ? 'text-slate-500 line-through' : ''
            }`}
          >
            {task.title}
          </h3>
          <Badge variant="secondary" className={statusColors[task.status]}>
            {statusLabels[task.status]}
          </Badge>
        </div>

        {task.description && (
          <p
            className={`text-sm text-slate-600 transition-all duration-200 ${
              task.status === 'completed' ? 'text-slate-400' : ''
            }`}
          >
            {task.description}
          </p>
        )}

        {task.due_date && (
          <p className="mt-2 text-xs text-slate-500">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
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
