'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  Flag,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, TaskStatus, TaskPriority } from '@/types/project';
import { cn } from '@/lib/utils';

interface TaskListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  className?: string;
}

const statusConfig = {
  todo: {
    label: '待办',
    icon: Circle,
    color: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-500'
  },
  in_progress: {
    label: '进行中',
    icon: AlertCircle,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-500'
  },
  done: {
    label: '已完成',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-500'
  }
};

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

export function TaskListView({
  tasks,
  onEditTask,
  onDeleteTask,
  className
}: TaskListViewProps) {
  const [sortBy, setSortBy] = useState<keyof Task>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedTasks = [...tasks].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: keyof Task) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return format(new Date(date), 'MM月dd日', { locale: zhCN });
  };

  const isOverdue = (deadline: Date | undefined) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  };

  if (tasks.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-64', className)}>
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
          <p className="text-gray-500">点击上方"新建任务"按钮创建第一个任务</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('title')}
              >
                任务标题
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('status')}
              >
                状态
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('priority')}
              >
                优先级
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('assignee')}
              >
                负责人
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('deadline')}
              >
                截止日期
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('createdAt')}
              >
                创建时间
              </TableHead>
              <TableHead className="w-[50px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => {
              const statusInfo = statusConfig[task.status];
              const priorityInfo = priorityConfig[task.priority];
              const StatusIcon = statusInfo.icon;
              const overdue = isOverdue(task.deadline);
              
              return (
                <TableRow key={task.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn('flex items-center gap-1 w-fit', statusInfo.color)}>
                      <StatusIcon className={cn('h-3 w-3', statusInfo.iconColor)} />
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn('flex items-center gap-1 w-fit', priorityInfo.color)}>
                      <Flag className="h-3 w-3" />
                      {priorityInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{task.assignee}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.deadline ? (
                      <div className={cn(
                        'flex items-center gap-2',
                        overdue ? 'text-red-600' : 'text-gray-700'
                      )}>
                        <Clock className={cn(
                          'h-4 w-4',
                          overdue ? 'text-red-500' : 'text-gray-400'
                        )} />
                        <span className="text-sm">{formatDate(task.deadline)}</span>
                        {overdue && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            逾期
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatDate(task.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditTask(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteTask(task.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}