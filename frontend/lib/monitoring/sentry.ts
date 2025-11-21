import * as Sentry from '@sentry/nextjs';

export const initSentry = () => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
            tracesSampleRate: 1.0,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration(),
            ],
        });
    }
};

export const captureError = (error: Error, context?: Record<string, any>) => {
    console.error(error);
    Sentry.captureException(error, {
        extra: context,
    });
};

export const setUserContext = (userId: string, email?: string) => {
    Sentry.setUser({
        id: userId,
        email: email,
    });
};

export const clearUserContext = () => {
    Sentry.setUser(null);
};
