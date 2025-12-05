'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Template } from '@/components/plans/TemplateList';
import { plansApi } from '@/lib/api/plans';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const PlanInputForm = lazy(() => import('@/components/plans/PlanInputForm').then(mod => ({ default: mod.PlanInputForm })));
const TemplateList = lazy(() => import('@/components/plans/TemplateList').then(mod => ({ default: mod.TemplateList })));

export default function NewPlanPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await plansApi.getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Header with User Info */}
        <div className="border-b bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 dark:bg-slate-700">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">PlanGenie</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {user?.email}
              </span>
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
          <div className="mx-auto mb-12 max-w-3xl text-center animate-fade-in">
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Turn Goals Into
              <span className="bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
                {' '}
                Actionable Plans
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400">
              PlanGenie transforms your vague ideas into structured, trackable
              plans using AI. Just describe what you want to achieve.
            </p>
          </div>



          {/* Form */}
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="rounded-xl border bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-scale-in">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <PlanInputForm selectedTemplate={selectedTemplate} />
              </Suspense>
            </div>
          </div>

          {/* Templates Section */}
          {templates.length > 0 && (
            <div className="mx-auto mt-12 max-w-6xl">
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Start with a Template
                </h2>
              </div>
              <TemplateList
                templates={templates}
                onSelect={setSelectedTemplate}
                selectedId={selectedTemplate?.id}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
