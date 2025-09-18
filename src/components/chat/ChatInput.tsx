'use client';

import { useState, useRef, useEffect } from 'react';
import { usePromptTemplates } from '@/hooks/usePromptTemplates';
import { chatApi } from '@/lib/chatApi';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChatSession, ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatInputProps {
  sessionId: string;
  activeSession: ChatSession;
  addMessage: (sessionId: string, message: Omit<ChatMessageType, 'id' | 'timestamp'>) => string;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessageType>) => void;
  removeLastMessageIfStreaming: (sessionId: string) => void;
}

export function ChatInput({ sessionId, activeSession, addMessage, updateMessage, removeLastMessageIfStreaming }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { templates, renderTemplate } = usePromptTemplates();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || isLoading || !activeSession) {
      console.log('Submit blocked:', { input: !!input.trim(), isLoading, activeSession: !!activeSession });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      console.log('Starting message send process...');
      
      // Add user message
      const userMessageId = addMessage(sessionId, {
        role: 'user',
        content: userMessage,
      });
      console.log('User message added:', userMessageId);

      // Create streaming message
      const streamingMessage = {
        role: 'assistant' as const,
        content: '',
        isStreaming: true,
        model: activeSession.model,
      };

      // Add the streaming message and get the message ID
      const assistantMessageId = addMessage(sessionId, streamingMessage);
      console.log('Assistant streaming message added:', assistantMessageId);

      // 获取最新的消息列表，包括刚刚添加的用户消息
      const messages = [...activeSession.messages, 
        { id: userMessageId, role: 'user' as const, content: userMessage, timestamp: new Date().toISOString() }
      ];

      console.log('Sending request with messages:', messages.length);

      // Stream response
      const stream = chatApi.createChatCompletionStream({
        model: activeSession.model,
        messages: messages.map(m => ({ 
          role: m.role as 'user' | 'assistant' | 'system', 
          content: m.content 
        })),
        temperature: 0.7,
        max_tokens: 4000,
      });

      let fullContent = '';
      let chunkCount = 0;
      
      for await (const chunk of stream) {
        fullContent += chunk;
        chunkCount++;
        
        if (chunkCount % 5 === 0) { // 每5个chunk更新一次，避免过度渲染
          updateMessage(sessionId, assistantMessageId, {
            content: fullContent,
            isStreaming: true,
          });
        }
      }
      
      // Final update
      updateMessage(sessionId, assistantMessageId, {
        content: fullContent,
        isStreaming: false,
      });
      
      console.log('Message completed:', { chunks: chunkCount, length: fullContent.length });

    } catch (error) {
      console.error('Error sending message:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '发送消息失败，请重试';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // 清理失败的消息
      try {
        removeLastMessageIfStreaming(sessionId);
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
    } finally {
      setIsLoading(false);
      console.log('Loading state reset');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      // You could show a dialog to fill in variables
      toast.info(`已选择模板：${template.name}`);
    }
  };

  const applyTemplate = () => {
    if (selectedTemplate) {
      // Simple implementation - in real app you'd show a dialog for variables
      const rendered = renderTemplate(selectedTemplate, { 
        topic: '示例话题',
        question: '示例问题'
      });
      setInput(rendered);
      setSelectedTemplate(null);
    }
  };

  const popularTemplates = templates.filter(t => t.isFavorite).slice(0, 3);

  return (
    <div className="border-t bg-background p-4">
      {popularTemplates.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {popularTemplates.map((template) => (
            <Button
              key={template.id}
              variant="ghost"
              size="sm"
              onClick={() => setInput(template.content)}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {template.name}
            </Button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              disabled={isLoading}
              className={cn(
                'min-h-[40px] max-h-[120px] resize-none pr-12',
                'focus-visible:ring-2 focus-visible:ring-offset-0'
              )}
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={isLoading}
              >
                <Paperclip className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            Shift + Enter 换行
          </div>
          
          {isLoading && (
            <div className="text-xs text-muted-foreground animate-pulse">
              AI 正在思考...
            </div>
          )}
        </div>
      </form>
    </div>
  );
}