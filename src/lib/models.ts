import { AIModel } from '@/types/chat';

export const SUPPORTED_MODELS: AIModel[] = [
  {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek Chat v3.1',
    description: 'DeepSeek最新的对话模型，平衡了性能和成本',
    provider: 'DeepSeek',
    maxTokens: 8192,
    inputPrice: 0.0000014,
    outputPrice: 0.0000028,
    contextWindow: 128000,
    capabilities: ['文本生成', '代码', '推理', '中文'],
    isRecommended: true
  },
  {
    id: 'openai/gpt-5-chat',
    name: 'GPT-5 Chat',
    description: 'OpenAI最新的GPT-5模型，具备强大的推理和理解能力',
    provider: 'OpenAI',
    maxTokens: 8192,
    inputPrice: 0.000005,
    outputPrice: 0.000015,
    contextWindow: 128000,
    capabilities: ['文本生成', '代码', '推理', '分析', '多模态'],
    isRecommended: true
  },
  {
    id: 'x-ai/grok-4',
    name: 'Grok-4',
    description: 'xAI开发的Grok-4模型，具有强大的推理和知识理解能力',
    provider: 'xAI',
    maxTokens: 8192,
    inputPrice: 0.000003,
    outputPrice: 0.000009,
    contextWindow: 131072,
    capabilities: ['文本生成', '代码', '推理', '实时知识'],
    isRecommended: true
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google最新的Gemini Pro 2.5模型，支持多模态和长文本处理',
    provider: 'Google',
    maxTokens: 8192,
    inputPrice: 0.00000125,
    outputPrice: 0.000005,
    contextWindow: 2000000,
    capabilities: ['文本生成', '代码', '推理', '多模态', '长文本'],
    isRecommended: true
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Anthropic最新的Claude 4 Sonnet模型，在推理和编码方面表现卓越',
    provider: 'Anthropic',
    maxTokens: 8192,
    inputPrice: 0.000003,
    outputPrice: 0.000015,
    contextWindow: 200000,
    capabilities: ['文本生成', '代码', '推理', '分析', '工具使用'],
    isRecommended: true
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic先进的中等规模模型，在推理和编码方面表现优异',
    provider: 'Anthropic',
    maxTokens: 8192,
    inputPrice: 0.000003,
    outputPrice: 0.000015,
    contextWindow: 200000,
    capabilities: ['文本生成', '代码', '推理', '分析', '图像理解'],
    isRecommended: false
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'OpenAI的经济型模型，适合日常对话和简单任务',
    provider: 'OpenAI',
    maxTokens: 4096,
    inputPrice: 0.00000015,
    outputPrice: 0.0000006,
    contextWindow: 128000,
    capabilities: ['文本生成', '代码', '推理'],
    isRecommended: false
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini 1.5 Flash',
    description: 'Google的快速模型，支持多模态输入',
    provider: 'Google',
    maxTokens: 8192,
    inputPrice: 0.000000075,
    outputPrice: 0.0000003,
    contextWindow: 1000000,
    capabilities: ['文本生成', '代码', '推理', '图像理解', '视频理解'],
    isBeta: false
  }
];

export const DEFAULT_MODEL = SUPPORTED_MODELS[0];

export const getModelById = (id: string): AIModel | undefined => {
  return SUPPORTED_MODELS.find(model => model.id === id);
};

export const getRecommendedModels = (): AIModel[] => {
  return SUPPORTED_MODELS.filter(model => model.isRecommended);
};

export const formatPrice = (price: number): string => {
  if (price < 0.000001) {
    return `$${(price * 1000000).toFixed(2)} per 1M tokens`;
  }
  return `$${price.toFixed(6)} per token`;
};

export const formatContextWindow = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M tokens`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K tokens`;
  }
  return `${tokens} tokens`;
};