interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AIConfig {
  apiKey: string;
  model?: string;
}

class AIService {
  private apiKey: string = '';
  private model: string = 'deepseek/deepseek-chat-v3.1';

  constructor(config?: AIConfig) {
    if (config) {
      this.apiKey = config.apiKey;
      this.model = config.model || this.model;
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callAI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API密钥未设置');
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      return data.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('AI调用失败:', error);
      throw error;
    }
  }

  async generateTitle(content: string): Promise<string> {
    const prompt = `根据以下文本，生成一个简洁的标题（10个词以内），只返回标题本身。文本：\n\n${content}`;
    return await this.callAI(prompt);
  }

  async generateTags(content: string): Promise<string[]> {
    const prompt = `根据以下文本，生成最多5个相关的标签。请以逗号分隔的格式返回，例如：技术,AI,编程。文本：\n\n${content}`;
    const response = await this.callAI(prompt);
    return response.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  async polishContent(content: string): Promise<string> {
    const prompt = `请扮演一个专业的编辑，润色以下文本，使其更清晰、流畅、专业，但保持原意。只返回润色后的文本。文本：\n\n${content}`;
    return await this.callAI(prompt);
  }
}

export const aiService = new AIService();

// 获取存储的API密钥
export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('apiKey') || '';
  }
  return '';
}

// 保存API密钥
export function setStoredApiKey(apiKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apiKey', apiKey);
    aiService.setApiKey(apiKey);
  }
}

// 初始化API密钥（如果有）
if (typeof window !== 'undefined') {
  const storedKey = getStoredApiKey();
  if (storedKey) {
    aiService.setApiKey(storedKey);
  }
}