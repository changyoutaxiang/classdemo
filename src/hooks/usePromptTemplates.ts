import { useState, useEffect, useCallback } from 'react';
import { PromptTemplate } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'prompt-templates';

interface UsePromptTemplatesReturn {
  templates: PromptTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Template operations
  createTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => PromptTemplate;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => PromptTemplate | null;
  
  // Variable handling
  renderTemplate: (templateId: string, variables: Record<string, string>) => string;
  extractVariables: (content: string) => string[];
  
  // Search and filtering
  searchTemplates: (query: string) => PromptTemplate[];
  getTemplatesByCategory: (category: string) => PromptTemplate[];
  getFavoriteTemplates: () => PromptTemplate[];
  
  // Built-in templates
  loadBuiltInTemplates: () => void;
}

// Built-in prompt templates
const BUILT_IN_TEMPLATES: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '代码解释器',
    description: '解释代码的功能和工作原理',
    content: '请详细解释以下代码的功能、实现原理和可能的优化建议：\n\n{{code}}',
    variables: ['code'],
    category: '编程',
    tags: ['代码', '解释', '开发'],
    isFavorite: true,
  },
  {
    name: '文章总结',
    description: '总结文章的主要观点和关键信息',
    content: '请对以下文章内容进行总结，提取主要观点和关键信息：\n\n{{article}}\n\n要求：\n1. 用简洁的语言概括核心内容\n2. 列出3-5个关键要点\n3. 保持客观中立',
    variables: ['article'],
    category: '写作',
    tags: ['总结', '文章', '写作'],
    isFavorite: true,
  },
  {
    name: '翻译助手',
    description: '将文本翻译成指定语言',
    content: '请将以下文本翻译成{{target_language}}：\n\n{{text}}\n\n要求：\n1. 保持原意准确\n2. 语言自然流畅\n3. 符合{{target_language}}的表达习惯',
    variables: ['text', 'target_language'],
    category: '翻译',
    tags: ['翻译', '语言', '转换'],
  },
  {
    name: '学习计划制定',
    description: '根据目标和现状制定个性化学习计划',
    content: '请帮我制定一个学习{{subject}}的详细计划。\n\n我的情况：\n- 当前水平：{{current_level}}\n- 目标水平：{{target_level}}\n- 可用时间：{{available_time}}\n- 学习偏好：{{learning_style}}\n\n请提供：\n1. 阶段性目标\n2. 每日/每周学习计划\n3. 推荐资源\n4. 进度检查方法',
    variables: ['subject', 'current_level', 'target_level', 'available_time', 'learning_style'],
    category: '教育',
    tags: ['学习', '计划', '教育'],
  },
  {
    name: '商业计划书',
    description: '帮助撰写商业计划书的关键部分',
    content: '请帮我撰写关于{{business_idea}}的商业计划书中的{{section}}部分。\n\n基本信息：\n- 目标市场：{{target_market}}\n- 竞争优势：{{competitive_advantage}}\n- 商业模式：{{business_model}}\n- 资金需求：{{funding_needs}}\n\n要求：\n1. 专业且简洁\n2. 数据驱动的分析\n3. 可执行的行动计划',
    variables: ['business_idea', 'section', 'target_market', 'competitive_advantage', 'business_model', 'funding_needs'],
    category: '商业',
    tags: ['商业', '计划书', '创业'],
  },
  {
    name: '技术文档',
    description: '生成技术文档或API文档',
    content: '请为以下{{technology}}技术/代码生成详细的技术文档：\n\n{{content}}\n\n文档要求：\n1. 清晰的概述\n2. 安装和配置说明\n3. 使用示例\n4. API接口文档（如适用）\n5. 常见问题解答',
    variables: ['technology', 'content'],
    category: '文档',
    tags: ['文档', '技术', 'API'],
  },
  {
    name: '创意写作',
    description: '帮助进行创意写作和头脑风暴',
    content: '请帮我创作一个关于{{theme}}的{{type}}。\n\n要求：\n- 风格：{{style}}\n- 长度：{{length}}\n- 目标受众：{{audience}}\n- 特殊要求：{{requirements}}\n\n请发挥创意，确保内容引人入胜且符合要求。',
    variables: ['theme', 'type', 'style', 'length', 'audience', 'requirements'],
    category: '创作',
    tags: ['创意', '写作', '故事'],
  },
  {
    name: '问题诊断',
    description: '帮助诊断和解决技术问题',
    content: '我遇到了以下问题，请帮我分析和解决：\n\n问题描述：{{problem_description}}\n\n环境信息：\n- 操作系统：{{os}}\n- 软件版本：{{software_version}}\n- 错误信息：{{error_message}}\n- 已尝试的解决方法：{{tried_solutions}}\n\n请提供：\n1. 可能的原因分析\n2. 具体的解决步骤\n3. 预防措施',
    variables: ['problem_description', 'os', 'software_version', 'error_message', 'tried_solutions'],
    category: '技术支持',
    tags: ['问题', '诊断', '解决'],
  },
];

export const usePromptTemplates = (): UsePromptTemplatesReturn => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates from localStorage
  useEffect(() => {
    const loadTemplates = () => {
      try {
        setIsLoading(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setTemplates(parsed);
        } else {
          // Initialize with built-in templates if none exist
          loadBuiltInTemplates();
        }
      } catch (err) {
        setError('Failed to load prompt templates');
        console.error('Error loading templates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Save templates to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      } catch (err) {
        setError('Failed to save prompt templates');
        console.error('Error saving templates:', err);
      }
    }
  }, [templates, isLoading]);

  // Template operations
  const createTemplate = useCallback((template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): PromptTemplate => {
    const newTemplate: PromptTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<PromptTemplate>) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === id) {
        return {
          ...template,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return template;
    }));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  }, []);

  const duplicateTemplate = useCallback((id: string): PromptTemplate | null => {
    const template = templates.find(t => t.id === id);
    if (!template) return null;

    const duplicated: PromptTemplate = {
      ...template,
      id: uuidv4(),
      name: `${template.name} (复制)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates(prev => [duplicated, ...prev]);
    return duplicated;
  }, [templates]);

  // Variable handling
  const renderTemplate = useCallback((templateId: string, variables: Record<string, string>): string => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return '';

    let rendered = template.content;
    
    // Replace {{variable}} with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, value || '');
    });

    return rendered;
  }, [templates]);

  const extractVariables = useCallback((content: string): string[] => {
    const matches = content.match(/{{\s*([^{}\s]+)\s*}}/g);
    if (!matches) return [];

    return [...new Set(matches.map(match => 
      match.replace(/{{\s*/g, '').replace(/\s*}}/g, '').trim()
    ))];
  }, []);

  // Search and filtering
  const searchTemplates = useCallback((query: string): PromptTemplate[] => {
    const lowercaseQuery = query.toLowerCase();
    return templates.filter(template => {
      const matchesName = template.name.toLowerCase().includes(lowercaseQuery);
      const matchesDescription = template.description?.toLowerCase().includes(lowercaseQuery) || false;
      const matchesContent = template.content.toLowerCase().includes(lowercaseQuery);
      const matchesCategory = template.category?.toLowerCase().includes(lowercaseQuery) || false;
      const matchesTags = template.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) || false;
      
      return matchesName || matchesDescription || matchesContent || matchesCategory || matchesTags;
    });
  }, [templates]);

  const getTemplatesByCategory = useCallback((category: string): PromptTemplate[] => {
    return templates.filter(template => template.category === category);
  }, [templates]);

  const getFavoriteTemplates = useCallback((): PromptTemplate[] => {
    return templates.filter(template => template.isFavorite);
  }, [templates]);

  const loadBuiltInTemplates = useCallback(() => {
    const builtInTemplates = BUILT_IN_TEMPLATES.map(template => ({
      ...template,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setTemplates(builtInTemplates);
  }, []);

  return {
    templates,
    isLoading,
    error,
    
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    
    renderTemplate,
    extractVariables,
    
    searchTemplates,
    getTemplatesByCategory,
    getFavoriteTemplates,
    
    loadBuiltInTemplates,
  };
};