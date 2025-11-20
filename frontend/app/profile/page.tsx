'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { plansApi } from '@/lib/api/plans';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Settings,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.getAllPlans(),
  });

  // Calculate stats
  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.status === 'active').length;
  const completedPlans = plans.filter((p) => p.status === 'completed').length;

  const totalTasks = plans.reduce((sum, plan) => sum + plan.tasks.length, 0);
  const completedTasks = plans.reduce(
    (sum, plan) =>
      sum + plan.tasks.filter((t) => t.status === 'completed').length,
    0
  );

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get user initials for avatar
  const initials = user?.email
    ? user.email
      .split('@')[0]
      .substring(0, 2)
      .toUpperCase()
    : 'U';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        {/* Header */}
        <div className="border-b dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/profile/settings')}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-slate-900 dark:bg-slate-700 text-2xl text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {user?.email?.split('@')[0] || 'User'}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Member since{' '}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                      : 'Recently'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Your Statistics
            </h2>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <Target className="h-4 w-4" />
                      Total Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {totalPlans}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Clock className="h-4 w-4" />
                      Active Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {activePlans}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {completedPlans}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <TrendingUp className="h-4 w-4" />
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {completionRate}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Task Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Task Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      {completedTasks} of {totalTasks} tasks completed
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {totalTasks}
                      </p>
                    </div>
                    <div className="rounded-lg border dark:border-green-900 bg-green-50 dark:bg-green-950 p-4">
                      <p className="text-sm text-green-700 dark:text-green-300">Completed Tasks</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {completedTasks}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
