'use client';

import { PlanInputForm } from '@/components/plans/PlanInputForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewPlanPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
        {/* Header with User Info */}
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
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Header */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900">
              Turn Goals Into
              <span className="bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                {' '}
                Actionable Plans
              </span>
            </h1>

            <p className="text-xl text-slate-600">
              PlanGenie transforms your vague ideas into structured, trackable
              plans using AI. Just describe what you want to achieve.
            </p>
          </div>

          {/* Form */}
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl border bg-white p-8 shadow-sm">
              <PlanInputForm />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
