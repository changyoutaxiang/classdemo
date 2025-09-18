'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { TodoList } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X, Menu, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

interface TodoLayoutProps {
  children: React.ReactNode;
  todoLists: TodoList[];
  activeList: TodoList | null;
  onSelectList: (id: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (id: string) => void;
  onUpdateList: (id: string, updates: Partial<TodoList>) => void;
  stats: {
    total: number;
    completed: number;
    active: number;
    overdue: number;
  };
}

type MobileView = 'lists' | 'tasks';

export default function TodoLayout({ 
  children, 
  todoLists, 
  activeList, 
  onSelectList, 
  onCreateList, 
  onDeleteList, 
  onUpdateList,
  stats 
}: TodoLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('lists');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 当选择了一个清单时，在移动端自动切换到任务视图
  useEffect(() => {
    if (isMobile && activeList) {
      setMobileView('tasks');
    }
  }, [activeList, isMobile]);

  const handleCreateList = useCallback(() => {
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
      setShowAddList(false);
    }
  }, [onCreateList, newListName]);

  const handleEditList = useCallback((id: string, name: string) => {
    setEditingListId(id);
    setEditingListName(name);
  }, []);

  const handleSaveEdit = useCallback((id: string) => {
    if (editingListName.trim()) {
      onUpdateList(id, { name: editingListName.trim() });
      setEditingListId(null);
      setEditingListName('');
    }
  }, [onUpdateList, editingListName]);

  const handleCancelEdit = useCallback(() => {
    setEditingListId(null);
    setEditingListName('');
  }, []);

  // 侧边栏内容组件
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base md:text-lg">待办清单</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddList(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-xs md:text-sm text-muted-foreground space-y-1">
          <div>总共: {stats.total}</div>
          <div className="text-green-500">已完成: {stats.completed}</div>
          <div className="text-orange-500">待完成: {stats.active}</div>
          {stats.overdue > 0 && (
            <div className="text-red-500">已逾期: {stats.overdue}</div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {todoLists.map(list => (
            <div key={list.id} className="relative">
              {editingListId === list.id ? (
                <div className="flex items-center gap-1 p-2">
                  <Input
                    type="text"
                    value={editingListName}
                    onChange={(e) => setEditingListName(e.target.value)}
                    className="h-8 text-sm flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSaveEdit(list.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="group relative">
                  <Button
                    variant={activeList?.id === list.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-10 px-2"
                    onClick={() => {
                      onSelectList(list.id);
                      if (isMobile) {
                        setShowSidebar(false);
                      }
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className="flex-1 truncate text-sm">{list.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{list.items.length}</span>
                  </Button>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditList(list.id, list.name);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteList(list.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddList && (
            <div className="p-2">
              <div className="flex items-center gap-1">
                <Input
                  type="text"
                  placeholder="清单名称"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="h-8 text-sm flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleCreateList}
                  className="h-8 px-2"
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddList(false);
                    setNewListName('');
                  }}
                  className="h-8 px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 md:p-4 border-t border-border">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
          <Home className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col bg-background relative">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm z-10">
          {mobileView === 'tasks' && activeList ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileView('lists')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回清单
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
            {mobileView === 'tasks' && activeList ? activeList.name : '待办清单'}
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
            <div className="fixed left-0 top-0 h-full w-64 border-r border-border bg-background z-30">
              <SidebarContent />
            </div>
          </>
        )}

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {mobileView === 'lists' || !activeList ? (
            <div className="h-full p-4">
              <div className="grid gap-3">
                {todoLists.map(list => (
                  <div
                    key={list.id}
                    onClick={() => onSelectList(list.id)}
                    className="p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors active:bg-secondary/70"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: list.color }}
                        />
                        <h3 className="font-medium">{list.name}</h3>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {list.items.length} 个任务
                      </span>
                    </div>
                  </div>
                ))}
                
                {todoLists.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">开始管理您的待办事项</h3>
                    <p className="text-muted-foreground mb-4">
                      创建一个新的待办清单，开始组织您的任务
                    </p>
                    <Button onClick={() => setShowAddList(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      创建清单
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen w-full flex bg-background">
      <div className="w-64 border-r border-border">
        <SidebarContent />
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}