import React from 'react';
import { ChatSuggestion } from '../../types/chat';

interface ChatSuggestionCardProps {
    suggestion: ChatSuggestion;
    onAccept: (id: string) => void;
    onDismiss: (id: string) => void;
}

export const ChatSuggestionCard: React.FC<ChatSuggestionCardProps> = ({
    suggestion,
    onAccept,
    onDismiss,
}) => {
    const getIcon = () => {
        switch (suggestion.suggestion_type) {
            case 'warning': return '⚠️';
            case 'optimize': return '⚡';
            case 'breakdown': return '🔨';
            default: return '💡';
        }
    };

    const getBorderColor = () => {
        switch (suggestion.priority) {
            case 'high': return 'border-red-400 bg-red-50';
            case 'medium': return 'border-yellow-400 bg-yellow-50';
            default: return 'border-blue-400 bg-blue-50';
        }
    };

    return (
        <div className={`p-4 mb-4 rounded-lg border-l-4 shadow-sm ${getBorderColor()}`}>
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                    <span className="text-2xl">{getIcon()}</span>
                    <div>
                        <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{suggestion.description}</p>
                        {suggestion.reasoning && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                                Why: {suggestion.reasoning}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => onDismiss(suggestion.id)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>

            {suggestion.actionable && (
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={() => onDismiss(suggestion.id)}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={() => onAccept(suggestion.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
                    >
                        {suggestion.action_button_text || 'Do it'}
                    </button>
                </div>
            )}
        </div>
    );
};
