/**
 * Reusable loading fallback components for Suspense boundaries
 * Provides consistent loading states across lazy-loaded components
 */

import { Skeleton } from '@/components/ui/skeleton';

export function PlanCardSkeleton() {
    return (
        <div className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-6 w-3/4" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-4 h-4 w-2/3" />
            <Skeleton className="h-8 w-24" />
        </div>
    );
}

export function PlanDisplaySkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
}

export function ChatSidebarSkeleton() {
    return (
        <div className="fixed right-0 top-0 h-full w-96 border-l bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-8 w-32" />
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    );
}

export function GenericSkeleton() {
    return <Skeleton className="h-8 w-full" />;
}
