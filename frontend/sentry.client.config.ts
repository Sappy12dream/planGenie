import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development";

if (sentryDsn) {
    Sentry.init({
        dsn: sentryDsn,
        environment: environment,

        // Adjust this value in production, or use tracesSampler for greater control
        // 1.0 = 100% in development, 0.1 = 10% in production
        tracesSampleRate: environment === "production" ? 0.1 : 1.0,

        // Setting this option to true will print useful information to the console while you're setting up Sentry.
        debug: environment === "development",

        replaysOnErrorSampleRate: 1.0,

        // This sets the sample rate to be 10%. You may want this to be 100% while
        // in development and sample at a lower rate in production
        replaysSessionSampleRate: environment === "production" ? 0.1 : 0.5,

        // Optimize bundle size: Only include essential integrations
        // Replay integration is included by default in @sentry/nextjs
        integrations: [
            Sentry.replayIntegration({
                // Additional Replay configuration goes here, for example:
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Enable lazy loading for better performance
        beforeSend(event) {
            // Filter out unnecessary events in production
            if (environment === "production" && event.level === "info") {
                return null;
            }
            return event;
        },
    });

    console.log(`✅ Sentry initialized for environment: ${environment}`);
} else {
    console.log("⚠️  Sentry DSN not found - error tracking disabled");
}
