'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { PromptTemplateManager } from './PromptTemplateManager';
import { WavyBackground } from '@/components/ui/wavy-background';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Plus, Settings, Archive, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  className?: string;
}

export function ChatLayout({ className }: ChatLayoutProps) {
  const {
    sessions,
    activeSession,
    activeSessionId,
    createSession,
    setActiveSession,
    deleteSession,
    updateSession,
    searchSessions,
    getRecentSessions,
    // Add message operations to pass down
    addMessage,
    updateMessage,
    removeLastMessageIfStreaming,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleNewSession = () => {
    const newSession = createSession();
    setSidebarOpen(false);
    return newSession;
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSession(sessionId);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('确定要删除这个对话吗？')) {
      deleteSession(sessionId);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredSessions = searchQuery ? searchSessions(searchQuery) : getRecentSessions();

  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:border-r">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="text-lg font-semibold">AI 对话</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewSession}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索对话..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'group flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent cursor-pointer',
                  activeSessionId === session.id && 'bg-accent'
                )}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {session.title || '新对话'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.messages.length} 条消息
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowTemplates(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            提示词模板
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <h1 className="text-lg font-semibold">AI 对话</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索对话..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent cursor-pointer',
                      activeSessionId === session.id && 'bg-accent'
                    )}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {session.title || '新对话'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.messages.length} 条消息
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setShowTemplates(true);
                  setSidebarOpen(false);
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                提示词模板
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center space-x-4">
            {activeSession && (
              <>
                <h2 className="text-lg font-semibold truncate max-w-xs">
                  {activeSession.title}
                </h2>
                <ModelSelector
                  value={activeSession.model}
                  onChange={(model) =>
                    updateSession(activeSession.id, { model })
                  }
                />
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewSession}
            >
              <Plus className="h-4 w-4" />
              新对话
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {activeSession && activeSession.messages.length > 0 ? (
            <>
              <ScrollArea className="flex-1 relative z-10">
                <ChatMessageList session={activeSession} />
              </ScrollArea>
              <Separator className="relative z-10" />
              <div className="relative z-10">
                <ChatInput 
                  sessionId={activeSession.id}
                  activeSession={activeSession}
                  addMessage={addMessage}
                  updateMessage={updateMessage}
                  removeLastMessageIfStreaming={removeLastMessageIfStreaming}
                />
              </div>
            </>
          ) : (
            <WavyBackground
              className="flex-1 flex items-center justify-center"
              containerClassName="flex-1 h-full"
              colors={[
                "#38bdf8",
                "#818cf8", 
                "#c084fc",
                "#e879f9",
                "#22d3ee"
              ]}
              waveWidth={50}
              backgroundFill="rgba(15, 23, 42, 0.8)"
              speed="fast"
              waveOpacity={0.3}
              blur={8}
            >
              <div className="text-center bg-background/80 backdrop-blur-sm rounded-lg p-8 border">
                <h3 className="text-lg font-semibold mb-2">
                  {activeSession ? '开始对话' : '开始新的对话'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activeSession 
                    ? '在下方输入框中开始你的第一条消息' 
                    : '选择一个现有对话或创建新对话开始聊天'
                  }
                </p>
                {!activeSession && (
                  <Button onClick={handleNewSession}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建新对话
                  </Button>
                )}
              </div>
            </WavyBackground>
          )}
          
          {/* Input area for new sessions */}
          {activeSession && activeSession.messages.length === 0 && (
            <>
              <Separator className="relative z-10" />
              <div className="relative z-10">
                <ChatInput 
                  sessionId={activeSession.id}
                  activeSession={activeSession}
                  addMessage={addMessage}
                  updateMessage={updateMessage}
                  removeLastMessageIfStreaming={removeLastMessageIfStreaming}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Prompt Templates Dialog */}
      <PromptTemplateManager
        open={showTemplates}
        onOpenChange={setShowTemplates}
      />
    </div>
  );
}