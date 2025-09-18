'use client';

import { useEffect, useRef } from 'react';
import { ChatSession } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessageListProps {
  session: ChatSession;
}

export function ChatMessageList({ session }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  if (!session.messages || session.messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-2xl mb-2">🤖</div>
          <h3 className="text-lg font-semibold mb-2">开始新的对话</h3>
          <p className="text-muted-foreground max-w-sm">
            向AI助手提问，获取智能回答和见解。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 p-4 space-y-4">
      {session.messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          isLast={index === session.messages.length - 1}
        />
      ))}
      
      {/* Loading skeleton for streaming */}
      {session.messages.length > 0 && 
        session.messages[session.messages.length - 1]?.isStreaming && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}