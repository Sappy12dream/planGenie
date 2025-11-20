import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/QueryProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkStatus } from '@/components/NetworkStatus';
import { ThemeProvider } from '@/components/ThemeProvider';

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              <QueryProvider>
                {children}
                <NetworkStatus />
                <Toaster position="top-right" richColors />
              </QueryProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
