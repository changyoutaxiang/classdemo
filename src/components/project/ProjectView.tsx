'use client';

import { useState, useEffect } from 'react';
import { Project, Task, ViewType, CreateTaskRequest, UpdateTaskRequest } from '@/types/project';
import { taskApi } from '@/lib/projectApi';
import { ViewSwitcher } from './ViewSwitcher';
import { TaskListView } from './TaskListView';
import { KanbanView } from './KanbanView';
import { CalendarView } from './CalendarView';
import { TaskModal } from './TaskModal';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectViewProps {
  project: Project;
  className?: string;
}

export function ProjectView({ project, className }: ProjectViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 加载项目任务
  const loadTasks = async () => {
    try {
      setLoading(true);
      const projectTasks = await taskApi.getProjectTasks(project.id);
      setTasks(projectTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建任务
  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    try {
      const newTask = await taskApi.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // 更新任务
  const handleUpdateTask = async (taskId: string, taskData: UpdateTaskRequest) => {
    try {
      const updatedTask = await taskApi.updateTask(taskId, taskData);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      setEditingTask(null);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // 更新任务状态（用于看板拖拽）
  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const updatedTask = await taskApi.patchTask(taskId, { status: status as any });
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // 编辑任务
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // 关闭任务模态框
  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      );
    }

    switch (currentView) {
      case 'list':
        return (
          <TaskListView
            tasks={tasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'kanban':
        return (
          <KanbanView
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={tasks}
            onEditTask={handleEditTask}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* 项目头部 */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-1">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              新建任务
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 视图切换器 */}
      <div className="border-b bg-gray-50 px-6 py-3">
        <ViewSwitcher
          currentView={currentView}
          onViewChange={setCurrentView}
          taskCount={tasks.length}
        />
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentView()}
      </div>

      {/* 任务模态框 */}
      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        onSubmit={editingTask ? 
          (data: UpdateTaskRequest) => handleUpdateTask(editingTask.id, data) : 
          handleCreateTask
        }
        task={editingTask}
        projectId={project.id}
      />
    </div>
  );
}