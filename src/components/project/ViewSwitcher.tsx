'use client';

import { List, LayoutGrid, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ViewType } from '@/types/project';
import { cn } from '@/lib/utils';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  taskCount?: number;
  className?: string;
}

const viewConfig = {
  list: {
    label: '列表视图',
    icon: List,
    description: '以表格形式查看所有任务'
  },
  kanban: {
    label: '看板视图',
    icon: LayoutGrid,
    description: '按状态分组的看板视图'
  },
  calendar: {
    label: '日历视图',
    icon: Calendar,
    description: '按截止日期显示任务'
  }
};

export function ViewSwitcher({
  currentView,
  onViewChange,
  taskCount = 0,
  className
}: ViewSwitcherProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-1">
        {(Object.keys(viewConfig) as ViewType[]).map((view) => {
          const config = viewConfig[view];
          const Icon = config.icon;
          const isActive = currentView === view;
          
          return (
            <Button
              key={view}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange(view)}
              className={cn(
                'flex items-center gap-2 h-9',
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{config.label}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {taskCount} 个任务
        </Badge>
      </div>
    </div>
  );
}