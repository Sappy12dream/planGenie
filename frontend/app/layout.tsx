import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { QueryProvider } from '@/lib/QueryProvider';
import { lazy, Suspense } from 'react';

// Lazy load non-critical UI components to reduce initial bundle size
const ThemeProvider = lazy(() =>
  import('@/components/ThemeProvider').then((mod) => ({
    default: mod.ThemeProvider,
  }))
);
const ErrorBoundary = lazy(() =>
  import('@/components/ErrorBoundary').then((mod) => ({
    default: mod.ErrorBoundary,
  }))
);
const NetworkStatus = lazy(() => import('@/components/NetworkStatus').then((mod) => ({
  default: mod.NetworkStatus,
})));
const Toaster = lazy(() =>
  import('sonner').then((mod) => ({ default: mod.Toaster }))
);

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PlanGenie - AI-Powered Planning Assistant',
  description:
    'Transform your goals into actionable plans with AI. Track tasks, manage progress, and achieve your objectives with PlanGenie.',
  keywords: [
    'planning',
    'AI assistant',
    'goal setting',
    'task management',
    'productivity',
  ],
  authors: [{ name: 'PlanGenie Team' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'PlanGenie - AI-Powered Planning Assistant',
    description: 'Transform your goals into actionable plans with AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
              <ErrorBoundary>
                <AuthProvider>
                  <QueryProvider>
                    {children}
                    <Suspense fallback={null}>
                      <NetworkStatus />
                    </Suspense>
                    <Suspense fallback={null}>
                      <Toaster position="top-right" richColors />
                    </Suspense>
                  </QueryProvider>
                </AuthProvider>
              </ErrorBoundary>
            </Suspense>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
