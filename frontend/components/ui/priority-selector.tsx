'use client';

import * as React from 'react';
import { Check, AlertCircle, AlertTriangle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskPriority } from '@/types/plan';
import { Badge } from '@/components/ui/badge';

interface PrioritySelectorProps {
    priority: TaskPriority;
    onPriorityChange: (priority: TaskPriority) => void;
    disabled?: boolean;
    className?: string;
}

const priorities: { value: TaskPriority; label: string; icon: React.ElementType; color: string; badgeColor: string }[] = [
    {
        value: 'high',
        label: 'High',
        icon: AlertCircle,
        color: 'text-red-500',
        badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    },
    {
        value: 'medium',
        label: 'Medium',
        icon: AlertTriangle,
        color: 'text-yellow-500',
        badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    },
    {
        value: 'low',
        label: 'Low',
        icon: ArrowDownCircle,
        color: 'text-green-500',
        badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    },
];

export function PrioritySelector({
    priority = 'medium',
    onPriorityChange,
    disabled = false,
    className,
}: PrioritySelectorProps) {
    const selectedPriority = priorities.find((p) => p.value === priority) || priorities[1];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn('h-8 w-[110px] justify-between text-xs', className)}
                >
                    <div className="flex items-center gap-2">
                        <selectedPriority.icon className={cn("h-3 w-3", selectedPriority.color)} />
                        <span>{selectedPriority.label}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[150px]">
                {priorities.map((p) => (
                    <DropdownMenuItem
                        key={p.value}
                        onClick={() => onPriorityChange(p.value)}
                        className="text-xs"
                    >
                        <div className="flex items-center gap-2 flex-1">
                            <p.icon className={cn("h-3 w-3", p.color)} />
                            <span>{p.label}</span>
                        </div>
                        {priority === p.value && (
                            <Check className="h-3 w-3 opacity-100" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
    const p = priorities.find((p) => p.value === priority) || priorities[1];

    return (
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 gap-1 font-medium border", p.badgeColor)}>
            <p.icon className="h-2.5 w-2.5" />
            {p.label}
        </Badge>
    );
}
