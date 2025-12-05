'use client';

import { lazy, Suspense } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/api/chat';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load ReactMarkdown to reduce initial bundle size
const ReactMarkdown = lazy(() => import('react-markdown'));

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg p-4',
        isUser ? 'ml-8 bg-blue-50 dark:bg-blue-950' : 'mr-8 bg-slate-50 dark:bg-slate-800'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-blue-600 dark:bg-blue-700' : 'bg-slate-700 dark:bg-slate-600'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {isUser ? 'You' : 'PlanGenie AI'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Render markdown for AI messages, plain text for user */}
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-semibold max-w-none text-sm text-slate-700 dark:text-slate-300">
            <Suspense fallback={<div className="text-sm text-slate-500">Loading...</div>}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h3 className="mt-3 mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                      {children}
                    </h3>
                  ),
                  h2: ({ children }) => (
                    <h3 className="mt-3 mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                      {children}
                    </h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className="mt-3 mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {children}
                    </h4>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 list-inside list-disc space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 list-inside list-decimal space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-slate-700 dark:text-slate-300">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="my-2 text-slate-700 dark:text-slate-300">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900 dark:text-slate-100">
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code className="rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 font-mono text-xs dark:text-slate-300">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
