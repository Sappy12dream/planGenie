import { DashboardAlert, dismissAlert } from '@/lib/api/alerts';
import { Card, CardContent } from '@/components/ui/card';
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
                return <Zap className="h-5 w-5 text-amber-500" />;
            case 'overdue_task':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'high_priority':
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            default:
                return <Clock className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (alert.type) {
            case 'quick_win':
                return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50';
            case 'overdue_task':
                return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50';
            case 'high_priority':
                return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50';
            default:
                return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50';
        }
    };

    return (
        <Card className={`border ${getBgColor()} transition-all hover:shadow-sm`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{getIcon()}</div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                {alert.title}
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                onClick={handleDismiss}
                                disabled={isDismissing}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Dismiss</span>
                            </Button>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {alert.message}
                        </p>
                        {alert.action_label && (
                            <Button
                                variant="link"
                                className="mt-2 h-auto p-0 text-sm font-medium"
                                onClick={handleAction}
                            >
                                {alert.action_label} →
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
