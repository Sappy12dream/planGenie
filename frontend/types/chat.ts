export type SuggestionType = 'next_task' | 'add_task' | 'optimize' | 'warning' | 'breakdown';
export type SuggestionPriority = 'low' | 'medium' | 'high';
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'dismissed';

export interface ChatSuggestion {
    id: string;
    plan_id: string;
    user_id: string;
    suggestion_type: SuggestionType;
    priority: SuggestionPriority;
    title: string;
    description: string;
    actionable: boolean;
    action_button_text?: string;
    related_task_ids: string[];
    confidence_score: number;
    reasoning?: string;
    status: SuggestionStatus;
    created_at: string;
}
