'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
      <div className="max-w-md space-y-6 text-center">
        <FileQuestion className="mx-auto h-24 w-24 text-slate-400 dark:text-slate-600" />
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
            Page Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
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
