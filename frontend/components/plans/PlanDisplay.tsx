'use client';

import { Plan } from '@/types/plan';
import { DraggableTaskList } from './DraggableTaskList';
import { ResourceItem } from './ResourceItem';
import { AddTaskDialog } from './AddTaskDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Target } from 'lucide-react';

interface PlanDisplayProps {
  plan: Plan;
}

export function PlanDisplay({ plan }: PlanDisplayProps) {
  const completedTasks = plan.tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = plan.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    archived: 'bg-slate-100 text-slate-500',
  };

  // Sort tasks by order
  const sortedTasks = [...plan.tasks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {plan.title}
            </h1>
            {plan.description && (
              <p className="text-lg text-slate-600">{plan.description}</p>
            )}
          </div>
          <Badge variant="secondary" className={statusColors[plan.status]}>
            {plan.status}
          </Badge>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {totalTasks}
                  </p>
                  <p className="text-sm text-slate-600">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {completedTasks}
                  </p>
                  <p className="text-sm text-slate-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {Math.round(progress)}%
                  </p>
                  <p className="text-sm text-slate-600">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Tasks ({totalTasks})
            </CardTitle>
            <AddTaskDialog planId={plan.id} />
          </div>
        </CardHeader>
        <CardContent>
          {plan.tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No tasks yet</p>
              <AddTaskDialog planId={plan.id} />
            </div>
          ) : (
            <DraggableTaskList tasks={sortedTasks} planId={plan.id} />
          )}
        </CardContent>
      </Card>

      {/* Resources Section */}
      {plan.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Helpful Resources ({plan.resources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.resources.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
