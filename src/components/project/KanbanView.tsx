'use client';

import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  Flag,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, TaskStatus } from '@/types/project';
import { cn } from '@/lib/utils';

interface KanbanViewProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  className?: string;
}

const columns = [
  {
    id: 'todo' as TaskStatus,
    title: '待办',
    color: 'bg-gray-50 border-gray-200',
    headerColor: 'text-gray-700'
  },
  {
    id: 'in_progress' as TaskStatus,
    title: '进行中',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'text-blue-700'
  },
  {
    id: 'done' as TaskStatus,
    title: '已完成',
    color: 'bg-green-50 border-green-200',
    headerColor: 'text-green-700'
  }
];

const priorityConfig = {
  low: {
    label: '低',
    color: 'bg-gray-100 text-gray-800'
  },
  medium: {
    label: '中',
    color: 'bg-yellow-100 text-yellow-800'
  },
  high: {
    label: '高',
    color: 'bg-red-100 text-red-800'
  }
};

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  const priorityInfo = priorityConfig[task.priority];
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    return format(new Date(date), 'MM月dd日', { locale: zhCN });
  };

  const isOverdue = (deadline: Date | undefined) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  };

  const overdue = isOverdue(task.deadline);

  return (
    <Card 
      className={cn(
        'mb-3 cursor-move transition-all duration-200 hover:shadow-md',
        isDragging && 'opacity-50 rotate-2 scale-105'
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm leading-tight pr-2">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="space-y-2">
          {/* 优先级 */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn('text-xs flex items-center gap-1', priorityInfo.color)}>
              <Flag className="h-3 w-3" />
              {priorityInfo.label}
            </Badge>
          </div>
          
          {/* 负责人 */}
          {task.assignee && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span>{task.assignee}</span>
            </div>
          )}
          
          {/* 截止日期 */}
          {task.deadline && (
            <div className={cn(
              'flex items-center gap-2 text-xs',
              overdue ? 'text-red-600' : 'text-gray-600'
            )}>
              <Clock className="h-3 w-3" />
              <span>{formatDate(task.deadline)}</span>
              {overdue && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  逾期
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function KanbanView({
  tasks,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteTask,
  className
}: KanbanViewProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (taskId && taskId !== draggedTaskId) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== columnId) {
      onUpdateTaskStatus(taskId, columnId);
    }
    
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className={cn('flex gap-6 h-full p-6 overflow-x-auto', className)}>
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const isDragOver = dragOverColumn === column.id;
        
        return (
          <div
            key={column.id}
            className="flex-1 min-w-[300px] max-w-[400px]"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* 列头 */}
            <div className={cn(
              'rounded-lg border-2 border-dashed p-4 mb-4 transition-colors',
              column.color,
              isDragOver && 'border-blue-400 bg-blue-100'
            )}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={cn('font-semibold', column.headerColor)}>
                  {column.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
            </div>
            
            {/* 任务列表 */}
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3 pr-2">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-sm">
                      {isDragOver ? '拖拽任务到这里' : '暂无任务'}
                    </div>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div key={task.id} className="group">
                      <TaskCard
                        task={task}
                        onEdit={() => onEditTask(task)}
                        onDelete={() => onDeleteTask(task.id)}
                        isDragging={draggedTaskId === task.id}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}