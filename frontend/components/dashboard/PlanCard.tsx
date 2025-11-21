'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plan } from '@/types/plan';
import { plansApi } from '@/lib/api/plans';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreVertical,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  DollarSign,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatTimeEstimate, formatCost, getHealthScoreColor, getHealthScoreLabel } from '@/types/intelligence-helpers';

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const completedTasks = (plan.tasks || []).filter(
    (t) => t.status === 'completed'
  ).length;
  const totalTasks = plan.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    active: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  };

  const deleteMutation = useMutation({
    mutationFn: () => plansApi.deletePlan(plan.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowDeleteDialog(false);
      toast.success('Plan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete plan', {
        description: error.message,
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => plansApi.updatePlanStatus(plan.id, 'archived'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan archived');
    },
    onError: (error: Error) => {
      toast.error('Failed to archive plan', {
        description: error.message,
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => plansApi.updatePlanStatus(plan.id, 'completed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan marked as complete!');
    },
    onError: (error: Error) => {
      toast.error('Failed to complete plan', {
        description: error.message,
      });
    },
  });
  return (
    <>
      <Card className="cursor-pointer transition-shadow hover:shadow-lg dark:hover:shadow-slate-900/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle
              className="line-clamp-2 flex-1 cursor-pointer text-lg"
              onClick={() => router.push(`/plans/${plan.id}`)}
            >
              {plan.title}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/plans/${plan.id}`)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Open Plan
                </DropdownMenuItem>
                {plan.status !== 'completed' && (
                  <DropdownMenuItem
                    onClick={() => completeMutation.mutate()}
                    disabled={completeMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {completeMutation.isPending
                      ? 'Marking...'
                      : 'Mark Complete'}
                  </DropdownMenuItem>
                )}
                {plan.status !== 'archived' && (
                  <DropdownMenuItem
                    onClick={() => archiveMutation.mutate()}
                    disabled={archiveMutation.isPending}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    {archiveMutation.isPending ? 'Archiving...' : 'Archive'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Badge
            variant="secondary"
            className={`${statusColors[plan.status]} mt-2 w-fit`}
          >
            {plan.status}
          </Badge>
        </CardHeader>

        <CardContent
          className="cursor-pointer pb-3"
          onClick={() => router.push(`/plans/${plan.id}`)}
        >
          {plan.description && (
            <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
              {plan.description}
            </p>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Tasks</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {completedTasks}/{totalTasks}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Resources</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {plan.resources?.length || 0}
              </p>
            </div>
          </div>

          {/* AI Intelligence Metadata */}
          {(plan.total_estimated_hours != null || plan.total_estimated_cost_usd != null || plan.health_score != null) && (
            <div className="mt-4 space-y-2 border-t dark:border-slate-800 pt-4">
              {plan.total_estimated_hours && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-600 dark:text-slate-400">Total Time:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatTimeEstimate(plan.total_estimated_hours)}
                  </span>
                </div>
              )}

              {plan.total_estimated_cost_usd !== undefined && plan.total_estimated_cost_usd !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-slate-600 dark:text-slate-400">Total Cost:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCost(plan.total_estimated_cost_usd)}
                  </span>
                </div>
              )}

              {plan.health_score && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-500 dark:text-red-400" />
                  <span className="text-slate-600 dark:text-slate-400">Health:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {getHealthScoreLabel(plan.health_score)} ({plan.health_score}/100)
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t pt-3 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Created {new Date(plan.created_at).toLocaleDateString()}
          </p>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{plan.title}&quot;? This
              will permanently delete the plan and all its tasks, resources, and
              chat history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
