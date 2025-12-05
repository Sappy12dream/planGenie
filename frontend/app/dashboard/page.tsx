'use client';

import { useState, lazy, Suspense } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { plansApi } from '@/lib/api/plans';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Sparkles, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { PlanCardSkeleton } from '@/components/dashboard/PlanCardSkeleton';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';

// Lazy load heavy components to reduce initial bundle size
const PlanCard = lazy(() => import('@/components/dashboard/PlanCard').then(mod => ({ default: mod.PlanCard })));
const Tutorial = lazy(() => import('@/components/tutorial/Tutorial').then(mod => ({ default: mod.Tutorial })));
const HelpButton = lazy(() => import('@/components/HelpButton').then(mod => ({ default: mod.HelpButton })));

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  // Fetch stats (always shows total counts regardless of filter)
  const { data: stats } = useQuery({
    queryKey: ['plan-stats'],
    queryFn: () => plansApi.getStats(),
    retry: 3,
  });

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['plans', statusFilter],
    queryFn: ({ pageParam = 1 }) =>
      plansApi.getAllPlans(statusFilter, pageParam, 9), // Fetch 9 items per page (3x3 grid)
    getNextPageParam: (lastPage: any[], allPages: any[]) => {
      return lastPage?.length === 9 ? allPages?.length + 1 : undefined;
    },
    initialPageParam: 1,
    retry: 3, // Retry failed requests 3 times
  });

  const plans = data?.pages.flatMap((page: any[]) => page) || [];

  const initials = user?.email
    ? user.email.split('@')[0].substring(0, 2).toUpperCase()
    : 'U';

  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <Tutorial />
      </Suspense>
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Header */}
        <div className="border-b bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 dark:bg-slate-700">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">PlanGenie</span>
            </div>

            <div className="flex items-center gap-4">
              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild data-tour="user-menu">
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-full p-0"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-900 text-white dark:bg-slate-700">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/profile/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/help')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Guide
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Smart Alerts */}
          <DashboardAlerts />

          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="animate-slide-up">
              <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                My Plans
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isLoading ? (
                  <span className="inline-block h-5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                ) : (
                  <>
                    {plans.length} {plans.length === 1 ? 'plan' : 'plans'} total
                  </>
                )}
              </p>
            </div>
            <Button onClick={() => router.push('/new-plan')} className="gap-2" data-tour="create-plan">
              <Plus className="h-4 w-4" />
              New Plan
            </Button>
          </div>

          {/* Stats - Linear/Asana inspired design */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4" data-tour="stats-overview">
            {/* Active */}
            <div className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 dark:border-blue-900/50 dark:from-blue-950/30 dark:to-slate-900 animate-slide-up transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 ring-4 ring-blue-50 dark:ring-blue-950/50">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {!stats ? (
                      <span className="inline-block h-7 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    ) : (
                      stats.active
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="group relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-4 dark:border-green-900/50 dark:from-green-950/30 dark:to-slate-900 animate-slide-up stagger-1 transition-all duration-300 hover:shadow-lg hover:border-green-300 dark:hover:border-green-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50 ring-4 ring-green-50 dark:ring-green-950/50">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {!stats ? (
                      <span className="inline-block h-7 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    ) : (
                      stats.completed
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Archived */}
            <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-900 animate-slide-up stagger-2 transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 ring-4 ring-slate-50 dark:ring-slate-900/50">
                  <svg className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Archived</p>
                  <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                    {!stats ? (
                      <span className="inline-block h-7 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    ) : (
                      stats.archived
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2" data-tour="filter-tabs">
            <Button
              variant={statusFilter === undefined ? 'default' : 'outline'}
              onClick={() => setStatusFilter(undefined)}
              size="sm"
              disabled={isLoading}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              size="sm"
              disabled={isLoading}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              size="sm"
              disabled={isLoading}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'archived' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('archived')}
              size="sm"
              disabled={isLoading}
            >
              Archived
            </Button>
          </div>

          {/* Plans Grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PlanCardSkeleton key={i} />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="py-16 text-center animate-fade-in">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                No plans yet
              </h3>
              <p className="mb-6 text-slate-600 dark:text-slate-400">
                Create your first plan to get started!
              </p>
              <Button onClick={() => router.push('/new-plan')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Suspense key={plan.id} fallback={<PlanCardSkeleton />}>
                  <PlanCard plan={plan} />
                </Suspense>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="min-w-[120px]"
              >
                {isFetchingNextPage ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Suspense fallback={null}>
        <HelpButton />
      </Suspense>
    </ProtectedRoute>
  );
}
