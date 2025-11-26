'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, BookOpen, Briefcase, Code, Home, Rocket, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Template {
    id: string;
    title: string;
    description: string;
    timeline: string;
    category: string;
    icon: string;
}

interface TemplateListProps {
    templates: Template[];
    onSelect: (template: Template) => void;
    selectedId?: string;
}

const iconMap: Record<string, any> = {
    Activity,
    BookOpen,
    Briefcase,
    Code,
    Home,
    Rocket,
    Languages: BookOpen, // Fallback for Languages
};

export function TemplateList({ templates, onSelect, selectedId }: TemplateListProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
                const Icon = iconMap[template.icon] || Sparkles;
                const isSelected = selectedId === template.id;

                return (
                    <Card
                        key={template.id}
                        className={cn(
                            "cursor-pointer transition-all hover:border-slate-400 dark:hover:border-slate-600",
                            isSelected && "border-slate-900 ring-2 ring-slate-900 dark:border-slate-100 dark:ring-slate-100"
                        )}
                        onClick={() => onSelect(template)}
                    >
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold">
                                {template.title}
                            </CardTitle>
                            <div className={cn(
                                "rounded-full p-2",
                                isSelected ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4 line-clamp-2">
                                {template.description}
                            </CardDescription>
                            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                <Badge variant="secondary" className="font-normal">
                                    {template.category}
                                </Badge>
                                <span>{template.timeline}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
