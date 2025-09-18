import { ChatMessage } from '@/types/chat';
import { useState } from 'react';

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class ChatApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}

export class ChatApiService {
  private apiKey: string | null = null;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.loadApiKey();
  }

  private loadApiKey() {
    if (typeof window !== 'undefined') {
      this.apiKey = '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';
      if (this.apiKey) {
        localStorage.setItem('apiKey', this.apiKey);
      }
    }
  }

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiKey', key);
    }
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit) {
    if (!this.apiKey) {
      throw new ChatApiError('API key not configured');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'AI Notes App',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ChatApiError(
        errorData.error?.message || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return response;
  }

  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response.json();
  }

  async *createChatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown> {
    const streamRequest = { ...request, stream: true };
    
    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(streamRequest),
    });

    if (!response.body) {
      throw new ChatApiError('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split into SSE events, keep last partial in buffer
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          // Each event may contain multiple lines, extract data lines
          const lines = event.split('\n').map(l => l.trim()).filter(Boolean);
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();

            if (!data) continue;
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data) as StreamChunk;
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignore parse errors for partial frames; they will be completed in subsequent chunks
              console.debug('Stream JSON parse pending/failed, waiting for next chunk');
            }
          }
        }
      }

      // Process any remaining buffered data (in case stream ended without trailing \n\n)
      if (buffer.trim()) {
        const lines = buffer.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data) as StreamChunk;
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // swallow leftover parse error
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const testService = new ChatApiService();
      testService.setApiKey(key);
      
      await testService.createChatCompletion({
        model: 'deepseek/deepseek-chat-v3.1',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      });
      
      return true;
    } catch (error) {
      if (error instanceof ChatApiError && error.statusCode === 401) {
        return false;
      }
      throw error;
    }
  }

  async getAvailableModels() {
    try {
      const response = await this.makeRequest('/models', {
        method: 'GET',
      });
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  formatMessagesForApi(messages: ChatMessage[]): Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }> {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  estimateTokens(text: string): number {
    const isChinese = /[\u4e00-\u9fff]/.test(text);
    return isChinese ? Math.ceil(text.length * 0.6) : Math.ceil(text.length / 4);
  }

  calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const inputPrice = 0.0000014;
    const outputPrice = 0.0000028;
    
    return (inputTokens * inputPrice) + (outputTokens * outputPrice);
  }
}

export const chatApi = new ChatApiService();

export const useChatApi = () => {
  const [apiKey, setApiKeyState] = useState(chatApi.getApiKey());

  const updateApiKey = (key: string) => {
    chatApi.setApiKey(key);
    setApiKeyState(key);
  };

  return {
    api: chatApi,
    apiKey,
    setApiKey: updateApiKey,
    isConfigured: !!apiKey,
  };
};