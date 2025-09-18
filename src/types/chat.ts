export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  tokens?: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  isArchived?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  variables: string[];
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  maxTokens: number;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  capabilities: string[];
  isRecommended?: boolean;
  isBeta?: boolean;
}

export interface UserPreferences {
  defaultModel: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  enableAutoSave: boolean;
  enableSound: boolean;
  enableNotifications: boolean;
}

export interface ChatSettings {
  systemPrompt?: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}