/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './fetcher';
import { ChatSuggestion } from '../../types/chat';


export interface ChatMessage {
  id: string;
  plan_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  suggested_actions?: any[];
}

export const chatApi = {
  /**
   * Send a message to AI
   */
  async sendMessage(
    planId: string,
    message: string
  ): Promise<SendMessageResponse> {
    return api.post<SendMessageResponse>(`/api/chat/plans/${planId}/messages`, {
      message,
    });
  },

  /**
   * Get all messages for a plan
   */
  async getMessages(planId: string): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(`/api/chat/plans/${planId}/messages`);
  },

  /**
   * Get proactive suggestions
   */
  async getSuggestions(planId: string, refresh = false): Promise<ChatSuggestion[]> {
    return api.get<ChatSuggestion[]>(`/api/chat/plans/${planId}/suggestions?refresh=${refresh}`);
  },

  /**
   * Dismiss a suggestion
   */
  async dismissSuggestion(suggestionId: string): Promise<void> {
    return api.post(`/api/chat/suggestions/${suggestionId}/dismiss`, {});
  },

  /**
   * Act on a suggestion
   */
  async actOnSuggestion(suggestionId: string): Promise<void> {
    return api.post(`/api/chat/suggestions/${suggestionId}/act`, {});
  },
};
