'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProjectSidebar } from './ProjectSidebar';
import { ProjectView } from './ProjectView';
import { TaskModal } from './TaskModal';
import { Project, Task, CreateProjectRequest, UpdateProjectRequest, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '@/types/project';
import { projectApi, taskApi } from '@/lib/projectApi';

export function AppLayout() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const projectList = await projectApi.getProjects();
      setProjects(projectList);
      
      // 如果有项目且没有选中项目，选中第一个
      if (projectList.length > 0 && !selectedProject) {
        setSelectedProject(projectList[0]);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
      toast.error('加载项目失败');
    }
  };

  // 加载任务列表
  const loadTasks = async (projectId: string) => {
    try {
      const taskList = await taskApi.getProjectTasks(projectId);
      setTasks(taskList);
    } catch (error) {
      console.error('加载任务失败:', error);
      toast.error('加载任务失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await loadProjects();
      setIsLoading(false);
    };
    
    initialize();
  }, []);

  // 当选中项目变化时加载任务
  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  // 创建项目
  const handleCreateProject = async (data: CreateProjectRequest) => {
    try {
      const newProject = await projectApi.createProject(data);
      setProjects(prev => [...prev, newProject]);
      setSelectedProject(newProject);
      toast.success('项目创建成功');
    } catch (error) {
      console.error('创建项目失败:', error);
      toast.error('创建项目失败');
      throw error;
    }
  };

  // 更新项目
  const handleUpdateProject = async (id: string, data: UpdateProjectRequest) => {
    try {
      const updatedProject = await projectApi.updateProject(id, data);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      
      if (selectedProject?.id === id) {
        setSelectedProject(updatedProject);
      }
      
      toast.success('项目更新成功');
    } catch (error) {
      console.error('更新项目失败:', error);
      toast.error('更新项目失败');
      throw error;
    }
  };

  // 删除项目
  const handleDeleteProject = async (id: string) => {
    try {
      await projectApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      
      if (selectedProject?.id === id) {
        const remainingProjects = projects.filter(p => p.id !== id);
        setSelectedProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
      }
      
      toast.success('项目删除成功');
    } catch (error) {
      console.error('删除项目失败:', error);
      toast.error('删除项目失败');
      throw error;
    }
  };

  // 创建任务
  const handleCreateTask = async (data: CreateTaskRequest) => {
    try {
      const newTask = await taskApi.createTask(data);
      setTasks(prev => [...prev, newTask]);
      toast.success('任务创建成功');
    } catch (error) {
      console.error('创建任务失败:', error);
      toast.error('创建任务失败');
      throw error;
    }
  };

  // 更新任务
  const handleUpdateTask = async (id: string, data: UpdateTaskRequest) => {
    try {
      const updatedTask = await taskApi.updateTask(id, data);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      toast.success('任务更新成功');
    } catch (error) {
      console.error('更新任务失败:', error);
      toast.error('更新任务失败');
      throw error;
    }
  };

  // 更新任务状态
  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await taskApi.patchTask(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      toast.success('任务状态更新成功');
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败');
    }
  };

  // 删除任务
  const handleDeleteTask = async (id: string) => {
    try {
      await taskApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('任务删除成功');
    } catch (error) {
      console.error('删除任务失败:', error);
      toast.error('删除任务失败');
    }
  };

  // 打开创建任务模态框
  const handleCreateTaskClick = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  // 打开编辑任务模态框
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  // 处理任务模态框提交
  const handleTaskModalSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      if (editingTask) {
        await handleUpdateTask(editingTask.id, data as UpdateTaskRequest);
      } else {
        await handleCreateTask(data as CreateTaskRequest);
      }
      // 成功后关闭模态框
      setTaskModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      // 错误处理已在各自的函数中完成
      console.error('任务提交失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* 移动端头部 */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-lg font-semibold">
          {selectedProject ? selectedProject.name : '项目管理'}
        </h1>
        {selectedProject && (
          <Button
            onClick={() => setSelectedProject(null)}
            variant="outline"
            size="sm"
          >
            切换项目
          </Button>
        )}
      </div>

      {/* 项目侧边栏 - 桌面端固定显示，移动端根据条件显示 */}
      <div className={`${selectedProject ? 'hidden md:block' : 'block'} md:w-64 md:border-r`}>
        <ProjectSidebar
          selectedProjectId={selectedProject?.id}
          onProjectSelect={setSelectedProject}
        />
      </div>

      {/* 主内容区域 */}
      <div className={`${selectedProject ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
        {selectedProject ? (
          <ProjectView
            project={selectedProject}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                欢迎使用项目管理系统
              </h2>
              <p className="text-gray-500 text-sm md:text-base">
                请创建或选择一个项目开始管理任务
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 任务模态框 */}
      {selectedProject && (
        <TaskModal
          open={taskModalOpen}
          onOpenChange={setTaskModalOpen}
          task={editingTask}
          projectId={selectedProject.id}
          onSubmit={handleTaskModalSubmit}
        />
      )}
    </div>
  );
}