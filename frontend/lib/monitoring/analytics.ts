import * as Sentry from '@sentry/nextjs';

export const Analytics = {
    trackPlanGeneration: (
        success: boolean,
        durationMs: number,
        planTitle: string,
        error?: string
    ) => {
        Sentry.captureMessage(
            `Frontend Plan Generation ${success ? 'Success' : 'Failed'}`,
            {
                level: success ? 'info' : 'error',
                extra: {
                    planTitle,
                    durationMs,
                    error,
                    timestamp: new Date().toISOString(),
                },
            }
        );
    },

    trackPlanCreated: (planId: string, planType?: string) => {
        Sentry.captureMessage('Plan Created (Frontend)', {
            level: 'info',
            extra: {
                planId,
                planType,
                timestamp: new Date().toISOString(),
            },
        });
    },

    trackTaskCompleted: (taskId: string, planId: string) => {
        Sentry.captureMessage('Task Completed (Frontend)', {
            level: 'info',
            extra: {
                taskId,
                planId,
                timestamp: new Date().toISOString(),
            },
        });
    },

    trackPageView: (pageName: string) => {
        Sentry.addBreadcrumb({
            category: 'navigation',
            message: `Navigated to ${pageName}`,
            level: 'info',
        });
    },
};
