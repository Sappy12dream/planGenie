'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400 dark:text-slate-500" />
    </div>
  );
}
