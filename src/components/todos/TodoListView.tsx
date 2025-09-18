'use client';

import React, { useState, useCallback } from 'react';
import { TodoItem, TodoFilter, TodoSort } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TodoListViewProps {
  items: TodoItem[];
  filter: TodoFilter;
  sortBy: TodoSort;
  searchQuery: string;
  onFilterChange: (filter: TodoFilter) => void;
  onSortChange: (sort: TodoSort) => void;
  onSearchChange: (query: string) => void;
  onToggle: (todoId: string) => void;
  onUpdate: (todoId: string, updates: Partial<TodoItem>) => void;
  onDelete: (todoId: string) => void;
}

export default function TodoListView({
  items,
  filter,
  sortBy,
  searchQuery,
  onFilterChange,
  onSortChange,
  onSearchChange,
  onToggle,
  onUpdate,
  onDelete,
}: TodoListViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const handleEdit = useCallback((item: TodoItem) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
    setEditingDescription(item.description || '');
  }, []);

  const handleSaveEdit = useCallback((item: TodoItem) => {
    onUpdate(item.id, {
      title: editingTitle,
      description: editingDescription,
    });
    setEditingId(null);
  }, [onUpdate, editingTitle, editingDescription]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingTitle('');
    setEditingDescription('');
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-orange-500 bg-orange-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MM月dd日', { locale: zhCN });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 搜索和筛选栏 */}
      <div className="p-3 md:p-4 border-b border-border space-y-3 md:space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as TodoFilter)}
              className="text-sm border border-border rounded-md px-2 py-1 bg-background h-8"
            >
              <option value="all">全部任务</option>
              <option value="active">待完成</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as TodoSort)}
              className="text-sm border border-border rounded-md px-2 py-1 bg-background h-8"
            >
              <option value="created">创建时间</option>
              <option value="dueDate">截止日期</option>
              <option value="priority">优先级</option>
              <option value="title">标题</option>
            </select>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">{searchQuery ? '没有找到匹配的任务' : '暂无任务'}</h3>
            <p className="text-muted-foreground">
              {searchQuery ? '尝试修改搜索条件' : '开始添加您的第一个任务吧'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {items.map(item => (
              <Card key={item.id} className={`${item.completed ? 'opacity-60' : ''}`}>
                <CardContent className="p-3 md:p-4">
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="font-medium text-sm md:text-base"
                        placeholder="任务标题"
                      />
                      <Input
                        type="text"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        placeholder="任务描述（可选）"
                        className="text-sm md:text-base"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(item)}
                          className="flex-1 md:flex-none"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          保存
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="flex-1 md:flex-none"
                        >
                          <X className="w-4 h-4 mr-1" />
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => onToggle(item.id)}
                        className="mt-1 h-5 w-5 md:h-4 md:w-4"
                      />
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <h3 className={`font-medium text-sm md:text-base ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </h3>
                          
                          <Badge 
                            variant="outline" 
                            className={`${getPriorityColor(item.priority)} text-xs w-fit`}
                          >
                            {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                          </Badge>
                        </div>
                        
                        {item.description && (
                          <p className="text-xs md:text-sm text-muted-foreground">{item.description}</p>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {item.dueDate && (
                            <div className={`flex items-center gap-1 ${isOverdue(item.dueDate) && !item.completed ? 'text-red-500' : ''}`}>
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.dueDate)}
                              {isOverdue(item.dueDate) && !item.completed && (
                                <AlertTriangle className="w-3 h-3 ml-1" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}