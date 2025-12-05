'use client';

import { DashboardAlert, dismissAlert } from '@/lib/api/alerts';
import { Button } from '@/components/ui/button';
import { X, Clock, Zap, AlertTriangle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface AlertCardProps {
    alert: DashboardAlert;
    onDismiss: (id: string) => void;
}

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
    const router = useRouter();
    const [isDismissing, setIsDismissing] = useState(false);

    const handleDismiss = async () => {
        setIsDismissing(true);
        try {
            await dismissAlert(alert.id);
            onDismiss(alert.id);
        } catch (error) {
            console.error('Failed to dismiss alert:', error);
            toast.error('Failed to dismiss alert');
            setIsDismissing(false);
        }
    };

    const handleAction = () => {
        if (alert.action_url) {
            router.push(alert.action_url);
        }
    };

    const getIcon = () => {
        switch (alert.type) {
            case 'quick_win':
                return <Zap className="h-4 w-4 text-amber-500" />;
            case 'overdue_task':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'high_priority':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default:
                return <Clock className="h-4 w-4 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (alert.type) {
            case 'quick_win':
                return 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
            case 'overdue_task':
                return 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
            case 'high_priority':
                return 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
            default:
                return 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${getBgColor()} transition-all hover:shadow-sm`}>
            <div className="shrink-0">{getIcon()}</div>
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100 shrink-0">
                {alert.title}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 truncate flex-1">
                {alert.message}
            </span>
            {alert.action_label && (
                <Button
                    variant="link"
                    className="h-auto p-0 text-xs font-medium shrink-0"
                    onClick={handleAction}
                >
                    {alert.action_label} →
                </Button>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={handleDismiss}
                disabled={isDismissing}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
}
