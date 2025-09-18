'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Flag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task } from '@/types/project';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  className?: string;
}

const priorityConfig = {
  low: {
    label: '低',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  medium: {
    label: '中',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  high: {
    label: '高',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
};

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  compact?: boolean;
}

function TaskItem({ task, onEdit, compact = false }: TaskItemProps) {
  const priorityInfo = priorityConfig[task.priority];
  
  const isOverdue = (deadline: Date | undefined) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  };

  const overdue = isOverdue(task.deadline);

  if (compact) {
    return (
      <div 
        className={cn(
          'text-xs p-1 mb-1 rounded cursor-pointer hover:bg-gray-50 border-l-2',
          priorityInfo.color.split(' ')[0] + '-500'
        )}
        onClick={onEdit}
      >
        <div className="font-medium truncate">{task.title}</div>
        {task.assignee && (
          <div className="text-gray-500 truncate">{task.assignee}</div>
        )}
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        'mb-2 cursor-pointer hover:shadow-md transition-shadow',
        overdue && 'border-red-200 bg-red-50'
      )}
      onClick={onEdit}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm leading-tight pr-2">{task.title}</h4>
          <Badge variant="secondary" className={cn('text-xs flex items-center gap-1', priorityInfo.color)}>
            <Flag className="h-3 w-3" />
            {priorityInfo.label}
          </Badge>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.assignee}</span>
            </div>
          )}
          
          {task.deadline && (
            <div className={cn(
              'flex items-center gap-1',
              overdue && 'text-red-600 font-medium'
            )}>
              <Clock className="h-3 w-3" />
              <span>{format(new Date(task.deadline), 'HH:mm')}</span>
              {overdue && (
                <Badge variant="destructive" className="text-xs px-1 py-0 ml-1">
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

export function CalendarView({ tasks, onEditTask, className }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 获取指定日期的任务
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      return isSameDay(new Date(task.deadline), date);
    });
  };

  // 获取选中日期的任务
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* 日历主体 */}
      <div className="flex-1 p-6">
        {/* 日历头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
            </h2>
            <Button variant="outline" size="sm" onClick={goToToday}>
              今天
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-1 h-[calc(100vh-280px)]">
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors',
                  !isCurrentMonth && 'text-gray-400 bg-gray-50',
                  isDayToday && 'bg-blue-50 border-blue-200',
                  isSelected && 'bg-blue-100 border-blue-300'
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div className={cn(
                  'text-sm font-medium mb-1',
                  isDayToday && 'text-blue-600'
                )}>
                  {format(day, 'd')}
                </div>
                
                {/* 任务指示器 */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask(task)}
                      compact
                    />
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右侧任务详情 */}
      {selectedDate && (
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="font-semibold text-lg">
              {format(selectedDate, 'MM月dd日', { locale: zhCN })}
            </h3>
            <p className="text-sm text-gray-500">
              {format(selectedDate, 'EEEE', { locale: zhCN })}
            </p>
            {selectedDateTasks.length > 0 && (
              <Badge variant="secondary" className="mt-2">
                {selectedDateTasks.length} 个任务
              </Badge>
            )}
          </div>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">
                    这一天没有安排任务
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask(task)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}