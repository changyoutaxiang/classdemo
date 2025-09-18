import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: {
    sidebar: React.ReactNode;
    noteList: React.ReactNode;
    editor: React.ReactNode;
  };
}

type MobileView = 'list' | 'editor';

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col bg-background relative">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm z-10">
          {mobileView === 'editor' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileView('list')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回列表
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-2"
            >
              <Menu className="w-4 h-4" />
              菜单
            </Button>
          )}
          
          <h1 className="font-semibold text-lg">
            {mobileView === 'editor' ? '编辑笔记' : '我的笔记'}
          </h1>
          
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>

        {/* Sidebar Overlay */}
        {showSidebar && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-20"
              onClick={() => setShowSidebar(false)}
            />
            <div className="fixed left-0 top-0 h-full w-16 border-r border-border bg-secondary/50 z-30 flex flex-col items-center py-4">
              {children.sidebar}
            </div>
          </>
        )}

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {mobileView === 'list' ? (
            <div className="h-full">
              {/* Clone children to add mobile props */}
              {React.cloneElement(children.noteList as React.ReactElement, {
                onSelectNote: (id: string) => {
                  (children.noteList as React.ReactElement).props.onSelectNote(id);
                  setMobileView('editor');
                }
              })}
            </div>
          ) : (
            <div className="h-full">
              {children.editor}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="h-screen w-full flex bg-background">
      {/* Sidebar - 左侧图标栏 */}
      <div className="w-16 border-r border-border flex flex-col items-center py-4 bg-secondary/50">
        {children.sidebar}
      </div>
      
      {/* Note List - 中间笔记列表 */}
      <div className="w-80 border-r border-border flex flex-col">
        {children.noteList}
      </div>
      
      {/* Editor - 右侧编辑区 */}
      <div className="flex-1 flex flex-col">
        {children.editor}
      </div>
    </div>
  );
};

export default AppLayout;