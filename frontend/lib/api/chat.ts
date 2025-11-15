/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './fetcher';

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
};
