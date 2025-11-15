'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { plansApi } from '@/lib/api/plans';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Sparkles, LogOut } from 'lucide-react';
import { PlanCard } from '@/components/dashboard/PlanCard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans', statusFilter],
    queryFn: () => plansApi.getAllPlans(statusFilter),
  });

  const activePlans = plans.filter((p) => p.status === 'active');
  const completedPlans = plans.filter((p) => p.status === 'completed');
  const archivedPlans = plans.filter((p) => p.status === 'archived');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
        {/* Header */}
        <div className="border-b bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">PlanGenie</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900">
                My Plans
              </h1>
              <p className="text-slate-600">
                {plans.length} {plans.length === 1 ? 'plan' : 'plans'} total
              </p>
            </div>
            <Button onClick={() => router.push('/new-plan')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Plan
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-white p-4">
              <p className="mb-1 text-sm text-slate-600">Active</p>
              <p className="text-2xl font-bold text-slate-900">
                {activePlans.length}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="mb-1 text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {completedPlans.length}
              </p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="mb-1 text-sm text-slate-600">Archived</p>
              <p className="text-2xl font-bold text-slate-600">
                {archivedPlans.length}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2">
            <Button
              variant={statusFilter === undefined ? 'default' : 'outline'}
              onClick={() => setStatusFilter(undefined)}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              size="sm"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              size="sm"
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'archived' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('archived')}
              size="sm"
            >
              Archived
            </Button>
          </div>

          {/* Plans Grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                No plans yet
              </h3>
              <p className="mb-6 text-slate-600">
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
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
