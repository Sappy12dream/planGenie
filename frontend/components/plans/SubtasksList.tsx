'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subtasksApi, Subtask } from '@/lib/api/subtasks';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SubtasksListProps {
  taskId: string;
  taskTitle: string;
  taskDescription?: string | null;
}

export function SubtasksList({ taskId, taskTitle, taskDescription }: SubtasksListProps) {
  const queryClient = useQueryClient();
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Fetch subtasks
  const { data: subtasks = [], isLoading } = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: () => subtasksApi.getSubtasks(taskId),
  });

  // Create subtask mutation
  const createMutation = useMutation({
    mutationFn: (title: string) => subtasksApi.createSubtask(taskId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
      toast.success('Subtask added');
    },
    onError: () => {
      toast.error('Failed to add subtask');
    },
  });

  // Update subtask mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Subtask['status'] }) =>
      subtasksApi.updateSubtask(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['subtasks', taskId] });
      const previous = queryClient.getQueryData<Subtask[]>(['subtasks', taskId]);

      queryClient.setQueryData<Subtask[]>(['subtasks', taskId], (old) =>
        old?.map((st) => (st.id === id ? { ...st, status } : st))
      );

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['subtasks', taskId], context.previous);
      }
      toast.error('Failed to update subtask');
    },
    onSuccess: (data, { status }) => {
      if (status === 'completed') {
        toast.success('Subtask completed!');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
    },
  });

  // Delete subtask mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subtasksApi.deleteSubtask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      toast.success('Subtask deleted');
    },
    onError: () => {
      toast.error('Failed to delete subtask');
    },
  });

  // Generate with AI mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      subtasksApi.generateSubtasks(taskId, taskTitle, taskDescription || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      toast.success('Subtasks generated with AI!');
    },
    onError: () => {
      toast.error('Failed to generate subtasks');
    },
  });

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      createMutation.mutate(newSubtaskTitle.trim());
    }
  };

  const handleToggle = (subtask: Subtask) => {
    const newStatus = subtask.status === 'completed' ? 'pending' : 'completed';
    updateMutation.mutate({ id: subtask.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="ml-8 mt-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="ml-8 mt-3 space-y-2">
      {/* Subtasks List */}
      {subtasks.length > 0 && (
        <div className="space-y-1">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="group flex items-start gap-2 rounded py-1 hover:bg-slate-50"
            >
              <Checkbox
                checked={subtask.status === 'completed'}
                onCheckedChange={() => handleToggle(subtask)}
                className="mt-0.5"
              />
              <span
                className={`flex-1 text-sm ${
                  subtask.status === 'completed'
                    ? 'text-slate-400 line-through'
                    : 'text-slate-700'
                }`}
              >
                {subtask.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => deleteMutation.mutate(subtask.id)}
              >
                <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Subtask Input */}
      {isAddingSubtask ? (
        <div className="flex gap-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubtask();
              if (e.key === 'Escape') {
                setIsAddingSubtask(false);
                setNewSubtaskTitle('');
              }
            }}
            placeholder="Add a subtask..."
            className="h-8 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleAddSubtask}
            disabled={!newSubtaskTitle.trim() || createMutation.isPending}
            className="h-8"
          >
            Add
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingSubtask(true)}
            className="h-7 text-xs text-slate-600 hover:text-slate-900"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add subtask
          </Button>

          {subtasks.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="h-7 text-xs text-blue-600 hover:text-blue-700"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1 h-3 w-3" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
