'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-md space-y-6 text-center">
        <AlertCircle className="mx-auto h-24 w-24 text-red-500 dark:text-red-400" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Something Went Wrong
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            We encountered an unexpected error. Don&apos;t worry, your data is
            safe.
          </p>
        </div>
        {error.message && (
          <details className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200">
              Error details
            </summary>
            <pre className="mt-2 overflow-auto text-xs text-red-600 dark:text-red-400">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => router.push('/dashboard')} className="gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
