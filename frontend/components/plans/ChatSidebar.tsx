'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat';
import { ChatMessage } from './ChatMessage';
import { ChatSuggestionCard } from '@/components/chat/ChatSuggestionCard';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, X, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatSidebarProps {
  planId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ planId, isOpen, onClose }: ChatSidebarProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-messages', planId],
    queryFn: () => chatApi.getMessages(planId),
    enabled: isOpen,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (msg: string) => chatApi.sendMessage(planId, msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', planId] });
      setMessage('');
    },
    onError: (error: Error) => {
      toast.error('Failed to send message', {
        description: error.message,
      });
    },
  });

  // Fetch suggestions
  const { data: suggestions = [] } = useQuery({
    queryKey: ['chat-suggestions', planId],
    queryFn: () => chatApi.getSuggestions(planId),
    enabled: isOpen,
  });

  // Suggestion mutations
  const dismissMutation = useMutation({
    mutationFn: (id: string) => chatApi.dismissSuggestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-suggestions', planId] });
    },
  });

  const actMutation = useMutation({
    mutationFn: (id: string) => chatApi.actOnSuggestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-suggestions', planId] });
      toast.success('Suggestion accepted!');
      // Optionally refresh tasks/plan if the action modified them
      queryClient.invalidateQueries({ queryKey: ['plan', planId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', planId] });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden dark:bg-black/40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 lg:w-96 dark:bg-slate-900',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              AI Assistant
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 dark:text-slate-500" />
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
              <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                Failed to load messages
              </h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ['chat-messages', planId],
                  })
                }
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Suggestions Area */}
              {suggestions.length > 0 && (
                <div className="mb-6 space-y-4">
                  {suggestions.map((suggestion) => (
                    <ChatSuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onDismiss={(id) => dismissMutation.mutate(id)}
                      onAccept={(id) => actMutation.mutate(id)}
                    />
                  ))}
                  <div className="relative flex items-center py-2">
                    <div className="grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="mx-4 shrink-0 text-xs text-slate-400">Chat History</span>
                    <div className="grow border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                </div>
              )}

              {messages.length === 0 && suggestions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                  <MessageSquare className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-700" />
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Start a conversation
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Ask me anything about your plan, tasks, or how to accomplish
                    your goals.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask me anything about your plan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMutation.isPending}
              rows={3}
              className="resize-none dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMutation.isPending}
              size="icon"
              className="shrink-0"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
