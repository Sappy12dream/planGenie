'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Search,
    BookOpen,
    CheckCircle2,
    MessageCircle,
    Upload,
    BarChart3,
    Settings,
    Sparkles,
    ArrowLeft,
    Lightbulb,
    Keyboard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const helpSections = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: BookOpen,
            items: [
                {
                    question: 'How do I create my first plan?',
                    answer:
                        'Click the "New Plan" button on your dashboard. Fill in your goal title and description (be specific!), optionally add a timeline, then click "Generate Plan". The AI will create 7-12 actionable tasks for you in 5-10 seconds.',
                },
                {
                    question: 'What makes a good plan description?',
                    answer:
                        'Be specific! Include: (1) Your goal, (2) Your current skill level, (3) Time available, (4) Any constraints or preferences. Example: "Learn React.js to build a portfolio website. I have 3 months, can study 2 hours daily, and already know HTML/CSS."',
                },
                {
                    question: 'Can I use PlanGenie for any type of goal?',
                    answer:
                        'Yes! PlanGenie works for learning new skills, planning events, building projects, fitness goals, travel planning, and more. Just describe what you want to achieve.',
                },
            ],
        },
        {
            id: 'managing-tasks',
            title: 'Managing Tasks',
            icon: CheckCircle2,
            items: [
                {
                    question: 'How do I mark tasks as complete?',
                    answer:
                        'Simply click the checkbox next to any task. The task will show a strikethrough and your progress bar will update automatically. Click again to mark it incomplete.',
                },
                {
                    question: 'Can I edit tasks?',
                    answer:
                        'Yes! Click on any task title or description to edit it inline. Your changes save automatically when you click outside or press Enter.',
                },
                {
                    question: 'How do I reorder tasks?',
                    answer:
                        'Click and hold on a task, then drag it to your desired position. This works on both desktop and mobile (touch and hold). The new order saves automatically.',
                },
                {
                    question: 'Can I add my own tasks?',
                    answer:
                        'Yes! Look for the "Add Task" button in your plan. You can add as many custom tasks as you need alongside the AI-generated ones.',
                },
                {
                    question: 'What if I want to delete a task?',
                    answer:
                        'Hover over the task and click the trash icon (🗑️). Confirm the deletion. Note: This cannot be undone!',
                },
            ],
        },
        {
            id: 'ai-chat',
            title: 'AI Chat Assistant',
            icon: MessageCircle,
            items: [
                {
                    question: 'How do I chat with the AI?',
                    answer:
                        'Open any plan and click the chat icon or "Chat with AI" button. A sidebar will appear where you can ask questions about your plan.',
                },
                {
                    question: 'What can I ask the AI?',
                    answer:
                        'Ask the AI to: Add new tasks, break down complex tasks, suggest resources, clarify task details, adjust timelines, or provide guidance on how to approach tasks.',
                },
                {
                    question: 'Does the AI remember our conversation?',
                    answer:
                        'Yes! The AI remembers all messages in the current plan\'s chat history. It also knows your current tasks and plan details for contextual responses.',
                },
                {
                    question: 'Example questions to ask?',
                    answer:
                        'Try: "Can you add a task for testing?", "Break down task 3 into smaller steps", "What resources do you recommend for learning TypeScript?", or "How should I approach the deployment task?"',
                },
            ],
        },
        {
            id: 'file-uploads',
            title: 'File Uploads & Proof',
            icon: Upload,
            items: [
                {
                    question: 'How do I upload files to a task?',
                    answer:
                        'Click on a task to expand it, then click "Attach File" or the 📎 icon. Select your file and wait for it to upload. The file will appear under the task.',
                },
                {
                    question: 'What file types are supported?',
                    answer:
                        'Images (.png, .jpg, .jpeg, .gif), PDFs (.pdf), and documents (.doc, .docx). Maximum file size is 10MB per file.',
                },
                {
                    question: 'Why should I upload files?',
                    answer:
                        'Upload files to prove task completion (certificates, screenshots), document your progress (photos, videos), or attach relevant materials (notes, PDFs).',
                },
                {
                    question: 'Can I upload multiple files per task?',
                    answer:
                        'Yes! You can attach as many files as you need to each task. All files are stored securely.',
                },
                {
                    question: 'How do I delete uploaded files?',
                    answer:
                        'Hover over any uploaded file and click the delete icon (🗑️). Confirm deletion. The file will be permanently removed.',
                },
            ],
        },
        {
            id: 'progress-tracking',
            title: 'Progress & Dashboard',
            icon: BarChart3,
            items: [
                {
                    question: 'How is my progress calculated?',
                    answer:
                        'Progress is calculated as: (Completed Tasks / Total Tasks) × 100%. The progress bar updates in real-time as you check off tasks.',
                },
                {
                    question: 'What do the dashboard stats mean?',
                    answer:
                        'Active Plans: Plans you\'re currently working on. Completed Plans: Plans where all tasks are done. Archived Plans: Plans you\'ve archived for reference.',
                },
                {
                    question: 'How do I filter my plans?',
                    answer:
                        'Use the filter tabs on your dashboard: "All" shows everything, "Active" shows in-progress plans, "Completed" shows finished plans, and "Archived" shows archived plans.',
                },
                {
                    question: 'Can I archive or delete plans?',
                    answer:
                        'Yes! Click the archive icon to move a plan to archived status (you can still view it). Click the delete icon (🗑️) to permanently delete a plan and all its tasks.',
                },
            ],
        },
        {
            id: 'settings',
            title: 'Profile & Settings',
            icon: Settings,
            items: [
                {
                    question: 'Where can I see my stats?',
                    answer:
                        'Click your avatar in the top-right corner and select "Profile". You\'ll see total plans, completion rates, and task statistics.',
                },
                {
                    question: 'How do I change my settings?',
                    answer:
                        'Click your avatar → "Settings". Here you can manage notification preferences, appearance (dark mode), and account settings.',
                },
                {
                    question: 'How do I enable dark mode?',
                    answer:
                        'Go to Settings (avatar → Settings) and toggle the dark mode option under Appearance preferences.',
                },
                {
                    question: 'How do I log out?',
                    answer:
                        'Click your avatar in the top-right corner and select "Logout". Your session will end and you\'ll be redirected to the login page.',
                },
            ],
        },
        {
            id: 'tips',
            title: 'Tips & Best Practices',
            icon: Lightbulb,
            items: [
                {
                    question: 'How can I get better AI-generated plans?',
                    answer:
                        'Be specific in your description! Include your current skill level, time available, specific goals, and any constraints. The more context you provide, the better the AI can tailor the plan.',
                },
                {
                    question: 'What if a task seems too big?',
                    answer:
                        'Ask the AI to break it down! Open the chat and say "Can you break down task X into smaller steps?" The AI will suggest subtasks.',
                },
                {
                    question: 'How often should I update my plans?',
                    answer:
                        'Check off tasks as you complete them immediately. Review your active plans daily. Update task details if your approach changes. Keep your plans current for accurate progress tracking.',
                },
                {
                    question: 'Can I use PlanGenie for team projects?',
                    answer:
                        'Currently, PlanGenie is designed for individual use. Team collaboration features are on the roadmap for future releases!',
                },
            ],
        },
        {
            id: 'keyboard-shortcuts',
            title: 'Keyboard Shortcuts',
            icon: Keyboard,
            items: [
                {
                    question: 'Are there keyboard shortcuts?',
                    answer:
                        'Yes! Space/Enter: Toggle task complete. Esc: Cancel editing. ↑/↓: Navigate between tasks. Tab: Move between elements. These work when tasks are focused.',
                },
            ],
        },
    ];

    const filteredSections = helpSections
        .map((section) => ({
            ...section,
            items: section.items.filter(
                (item) =>
                    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                {/* Header */}
                <div className="border-b bg-white/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="container mx-auto flex items-center justify-between px-4 py-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/dashboard')}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Button>
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 dark:bg-slate-700">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm font-medium text-white">
                                    PlanGenie Help
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-slate-100">
                            How can we help you?
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Find answers to common questions and learn how to use PlanGenie
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mx-auto mb-8 max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 text-base"
                            />
                        </div>
                    </div>

                    {/* Help Sections */}
                    <div className="mx-auto max-w-4xl">
                        {filteredSections.length === 0 ? (
                            <div className="rounded-lg border bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                                <Search className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-700" />
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    No results found
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Try searching with different keywords
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredSections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <div
                                            key={section.id}
                                            className="rounded-lg border bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                                        >
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                                                    <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                                    {section.title}
                                                </h2>
                                            </div>

                                            <Accordion type="single" collapsible className="w-full">
                                                {section.items.map((item, index) => (
                                                    <AccordionItem
                                                        key={index}
                                                        value={`${section.id}-${index}`}
                                                    >
                                                        <AccordionTrigger className="text-left text-base font-medium">
                                                            {item.question}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-base text-slate-600 dark:text-slate-400">
                                                            {item.answer}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Still Need Help */}
                    <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
                        <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                            Still need help?
                        </h3>
                        <p className="mb-4 text-slate-600 dark:text-slate-400">
                            Can't find what you're looking for? Try the interactive tutorial or
                            contact support.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={() => {
                                    localStorage.removeItem('plangenie_tutorial_seen');
                                    router.push('/dashboard');
                                }}
                                variant="outline"
                            >
                                Restart Tutorial
                            </Button>
                            <Button
                                onClick={() =>
                                    window.open('mailto:support@plangenie.com', '_blank')
                                }
                            >
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
