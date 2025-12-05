'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function Tutorial() {
    const { theme } = useTheme();

    useEffect(() => {
        const tutorialSeen = localStorage.getItem('plangenie_tutorial_seen');

        if (!tutorialSeen) {
            // Dynamically import driver.js only when needed to reduce bundle size
            import('driver.js').then(({ driver }) => {
                // Inject CSS dynamically
                if (!document.querySelector('link[href*="driver.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.4.0/dist/driver.css';
                    document.head.appendChild(link);
                }
                const driverObj = driver({
                    showProgress: true,
                    animate: true,
                    allowClose: true,
                    doneBtnText: 'Done',
                    nextBtnText: 'Next',
                    prevBtnText: 'Previous',
                    steps: [
                        {
                            element: 'body',
                            popover: {
                                title: 'Welcome to PlanGenie! 👋',
                                description:
                                    "Let's take a quick tour to help you get started with creating and managing your plans.",
                                side: 'left',
                                align: 'start',
                            },
                        },
                        {
                            element: '[data-tour="create-plan"]',
                            popover: {
                                title: 'Create New Plans',
                                description:
                                    'Click here to start a new plan. You can generate plans for travel, learning, fitness, and more!',
                                side: 'bottom',
                                align: 'start',
                            },
                        },
                        {
                            element: '[data-tour="stats-overview"]',
                            popover: {
                                title: 'Track Your Progress',
                                description:
                                    'See an overview of your active, completed, and archived plans right here.',
                                side: 'bottom',
                                align: 'start',
                            },
                        },
                        {
                            element: '[data-tour="filter-tabs"]',
                            popover: {
                                title: 'Filter Plans',
                                description:
                                    "Easily filter your plans by status to find exactly what you're looking for.",
                                side: 'bottom',
                                align: 'start',
                            },
                        },
                        {
                            element: '[data-tour="user-menu"]',
                            popover: {
                                title: 'Your Profile',
                                description:
                                    'Access your profile settings, preferences, and logout option here.',
                                side: 'left',
                                align: 'start',
                            },
                        },
                    ],
                    onDestroyed: () => {
                        localStorage.setItem('plangenie_tutorial_seen', 'true');
                    },
                });

                driverObj.drive();
            });
        }
    }, []);

    return null;
}

