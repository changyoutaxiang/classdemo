'use client';

import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/moving-border';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Copy, RotateCcw, Trash2, MoreVertical, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ChatMessageProps {
  message: ChatMessageType;
  isLast: boolean;
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  const handleRegenerate = () => {
    // TODO: Implement regenerate functionality
    toast.info('重新生成功能即将推出');
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    toast.info('删除功能即将推出');
  };

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`flex gap-4 p-4 rounded-lg transition-all ${
        isUser ? 'bg-muted/30' : 'bg-background'
      } ${isHovered ? 'shadow-sm' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          {isUser ? (
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {isUser ? '我' : 'AI助手'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.timestamp), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
            {message.model && (
              <span className="text-xs text-muted-foreground">
                • {message.model.split('/').pop()}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-1 transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6"
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            {isAssistant && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                className="h-6 w-6"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  复制
                </DropdownMenuItem>
                {isAssistant && (
                  <DropdownMenuItem onClick={handleRegenerate}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    重新生成
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                return !isInline && match ? (
                  <div className="relative">
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg text-sm"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                    <Button
                      className="absolute top-2 right-2 h-6 px-2 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-white border-slate-600"
                      onClick={() => {
                        navigator.clipboard.writeText(String(children));
                        toast.success('代码已复制');
                      }}
                    >
                      复制
                    </Button>
                  </div>
                ) : (
                  <code
                    className={className || "bg-muted px-1.5 py-0.5 rounded text-sm"}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-2">{children}</ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-muted pl-4 italic mb-2">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <table className="border-collapse border border-border mb-2">{children}</table>
              ),
              th: ({ children }) => (
                <th className="border border-border px-3 py-1 bg-muted">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-3 py-1">{children}</td>
              ),
            }}
          >
            {message.content || (message.isStreaming && '...')}
          </ReactMarkdown>
        </div>

        {message.isStreaming && isLast && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            正在输入...
          </div>
        )}
      </div>
    </div>
  );
}