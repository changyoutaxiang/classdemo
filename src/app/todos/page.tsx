'use client';

import React, { useState, useCallback } from 'react';
import { useTodos } from '@/hooks/useTodos';
import TodoLayout from '@/components/todos/TodoLayout';
import TodoListView from '@/components/todos/TodoListView';
import TodoForm from '@/components/todos/TodoForm';
import { Button } from '@/components/ui/moving-border';
import { Plus } from 'lucide-react';

export default function TodosPage() {
  const {
    todoLists,
    activeList,
    filteredItems,
    loading,
    filter,
    sortBy,
    searchQuery,
    setFilter,
    setSortBy,
    setSearchQuery,
    setActiveList,
    createList,
    updateList,
    deleteList,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    getStats,
  } = useTodos();

  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreateList = useCallback(() => {
    if (newListName.trim()) {
      createList(newListName.trim());
      setNewListName('');
    }
  }, [createList, newListName]);

  const handleAddTodo = useCallback((title: string, priority: 'low' | 'medium' | 'high', dueDate?: string, description?: string) => {
    addTodo(title, priority, dueDate, description);
    setShowAddTodo(false);
  }, [addTodo]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <TodoLayout
      todoLists={todoLists}
      activeList={activeList}
      onSelectList={setActiveList}
      onCreateList={handleCreateList}
      onDeleteList={deleteList}
      onUpdateList={updateList}
      stats={getStats()}
    >
      {activeList ? (
        <div className="flex-1 flex flex-col h-full">
          {/* 头部操作栏 */}
          <div className="border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{activeList.name}</h1>
              <div className="text-sm text-muted-foreground">
                {getStats().total} 个任务 · {getStats().completed} 个完成
              </div>
            </div>
            
            <Button onClick={() => setShowAddTodo(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              添加任务
            </Button>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1 overflow-hidden">
            <TodoListView
              items={filteredItems}
              filter={filter}
              sortBy={sortBy}
              searchQuery={searchQuery}
              onFilterChange={setFilter}
              onSortChange={setSortBy}
              onSearchChange={setSearchQuery}
              onToggle={toggleTodo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          </div>

          {/* 添加任务表单 */}
          {showAddTodo && (
            <div className="border-t border-border p-4">
              <TodoForm
                onSubmit={handleAddTodo}
                onCancel={() => setShowAddTodo(false)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">开始管理您的待办事项</h3>
            <p className="text-muted-foreground mb-4">
              创建一个新的待办清单，开始组织您的任务
            </p>
            <Button onClick={() => handleCreateList()}>
              <Plus className="w-4 h-4 mr-2" />
              创建清单
            </Button>
          </div>
        </div>
      )}
    </TodoLayout>
  );
}