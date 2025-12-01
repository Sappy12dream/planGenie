'use client';

import { useEffect, useState } from 'react';
import { DashboardAlert, getActiveAlerts, generateAlerts } from '@/lib/api/alerts';
import { AlertCard } from './AlertCard';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DashboardAlerts() {
    const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchAlerts = async () => {
        try {
            const data = await getActiveAlerts();
            setAlerts(data);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAlerts = async () => {
        setIsGenerating(true);
        try {
            const result = await generateAlerts();
            if (result.count > 0) {
                toast.success(`Generated ${result.count} new suggestions`);
                await fetchAlerts();
            } else {
                toast.info('No new suggestions found right now');
            }
        } catch (error) {
            console.error('Failed to generate alerts:', error);
            toast.error('Failed to generate suggestions');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        fetchAlerts();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = (id: string) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    };

    if (isLoading) {
        return (
            <div className="mb-8 flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="mb-8 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Sparkles className="h-5 w-5 text-slate-400" />
                </div>
                <h3 className="mb-1 font-medium text-slate-900 dark:text-slate-100">
                    All caught up!
                </h3>
                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    You have no pending alerts or suggestions.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAlerts}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-3 w-3" />
                    )}
                    Check for suggestions
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Smart Suggestions
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateAlerts}
                    disabled={isGenerating}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-3 w-3" />
                    )}
                    Refresh
                </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} />
                ))}
            </div>
        </div>
    );
}
