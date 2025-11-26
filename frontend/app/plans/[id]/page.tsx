'use client';

import { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { plansApi } from '@/lib/api/plans';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, MessageSquare } from 'lucide-react';
import { PlanDisplaySkeleton, ChatSidebarSkeleton } from '@/components/LoadingFallbacks';

// Lazy load heavy components to reduce initial bundle size
const PlanDisplay = lazy(() => import('@/components/plans/PlanDisplay').then(mod => ({ default: mod.PlanDisplay })));
const ChatSidebar = lazy(() => import('@/components/plans/ChatSidebar').then(mod => ({ default: mod.ChatSidebar })));

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: plan, isLoading, error } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => plansApi.getPlan(planId),
  });

  return (
    <ProtectedRoute>
      {isLoading ? (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Failed to load plan
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      ) : !plan ? (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Plan not found</h2>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>

              <Button
                onClick={() => setIsChatOpen(true)}
                className="gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                AI Assistant
              </Button>
            </div>

            <Suspense fallback={<PlanDisplaySkeleton />}>
              <PlanDisplay plan={plan} />
            </Suspense>
          </div>

          {/* Chat Sidebar */}
          <Suspense fallback={<ChatSidebarSkeleton />}>
            <ChatSidebar
              planId={planId}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </Suspense>

          {/* Floating Chat Button (Mobile) */}
          {!isChatOpen && (
            <Button
              size="icon-lg"
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors z-30"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}
