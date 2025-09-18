import { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, Task, CreateProjectRequest, UpdateProjectRequest, CreateTaskRequest, UpdateTaskRequest, ProjectWithTasks, TaskStatus } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';

interface UseProjectsReturn {
  projects: Project[];
  tasks: Task[];
  loading: boolean;
  // 项目管理
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  getProjectWithTasks: (id: string) => Promise<ProjectWithTasks>;
  // 任务管理
  createTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  patchTask: (id: string, data: Partial<UpdateTaskRequest>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;
  getProjectTasks: (projectId: string) => Task[];
}

const PROJECTS_STORAGE_KEY = 'ai-projects';
const TASKS_STORAGE_KEY = 'ai-tasks';

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 从localStorage加载项目和任务
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        // 确保日期对象正确转换
        const projectsWithDates = parsedProjects.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
        setProjects(projectsWithDates);
      } else {
        // 如果没有存储的项目，创建示例项目
        const sampleProject: Project = {
          id: uuidv4(),
          name: '示例项目',
          description: '这是一个示例项目，展示项目管理功能',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setProjects([sampleProject]);
      }

      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // 确保日期对象正确转换
        const tasksWithDates = parsedTasks.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          deadline: t.deadline ? new Date(t.deadline) : undefined
        }));
        setTasks(tasksWithDates);
      } else if (projects.length > 0) {
        // 如果有示例项目但没有任务，创建示例任务
        const sampleTask: Task = {
          id: uuidv4(),
          projectId: projects[0]?.id || '',
          title: '示例任务',
          description: '这是一个示例任务，展示任务管理功能',
          status: 'todo',
          priority: 'medium',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
          assignee: '我',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setTasks([sampleTask]);
      }
    } catch (error) {
      console.error('Failed to load projects and tasks from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存项目到localStorage
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
      } catch (error) {
        console.error('Failed to save projects to localStorage:', error);
      }
    }
  }, [projects, loading]);

  // 保存任务到localStorage
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error);
      }
    }
  }, [tasks, loading]);

  // 项目管理函数
  const createProject = useCallback(async (data: CreateProjectRequest): Promise<Project> => {
    const newProject: Project = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setProjects(prev => [...prev, newProject]);
    return new Promise((resolve) => {
      setTimeout(() => resolve(newProject), 100);
    });
  }, []);

  const updateProject = useCallback(async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    return new Promise((resolve, reject) => {
      const projectIndex = projects.findIndex(p => p.id === id);
      if (projectIndex === -1) {
        setTimeout(() => reject(new Error('Project not found')), 100);
        return;
      }

      const updatedProject = {
        ...projects[projectIndex],
        ...data,
        updatedAt: new Date()
      };

      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      setTimeout(() => resolve(updatedProject), 100);
    });
  }, [projects]);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const projectExists = projects.some(p => p.id === id);
      if (!projectExists) {
        setTimeout(() => reject(new Error('Project not found')), 100);
        return;
      }

      // 删除项目相关的所有任务
      setTasks(prev => prev.filter(t => t.projectId !== id));
      setProjects(prev => prev.filter(p => p.id !== id));
      
      setTimeout(() => resolve(), 100);
    });
  }, [projects]);

  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const getProjectWithTasks = useCallback(async (id: string): Promise<ProjectWithTasks> => {
    return new Promise((resolve, reject) => {
      const project = projects.find(p => p.id === id);
      if (!project) {
        setTimeout(() => reject(new Error('Project not found')), 100);
        return;
      }

      const projectTasks = tasks.filter(t => t.projectId === id);
      const projectWithTasks: ProjectWithTasks = {
        ...project,
        tasks: projectTasks
      };

      setTimeout(() => resolve(projectWithTasks), 100);
    });
  }, [projects, tasks]);

  // 任务管理函数
  const getProjectTasks = useCallback((projectId: string): Task[] => {
    return tasks.filter(t => t.projectId === projectId);
  }, [tasks]);

  const createTask = useCallback(async (data: CreateTaskRequest): Promise<Task> => {
    const newTask: Task = {
      id: uuidv4(),
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: 'todo',
      priority: data.priority || 'medium',
      deadline: data.deadline,
      assignee: data.assignee,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks(prev => [...prev, newTask]);
    return new Promise((resolve) => {
      setTimeout(() => resolve(newTask), 100);
    });
  }, []);

  const updateTask = useCallback(async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    return new Promise((resolve, reject) => {
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        setTimeout(() => reject(new Error('Task not found')), 100);
        return;
      }

      const updatedTask = {
        ...tasks[taskIndex],
        ...data,
        updatedAt: new Date()
      };

      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      setTimeout(() => resolve(updatedTask), 100);
    });
  }, [tasks]);

  const patchTask = useCallback(async (id: string, data: Partial<UpdateTaskRequest>): Promise<Task> => {
    return updateTask(id, data);
  }, [updateTask]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const taskExists = tasks.some(t => t.id === id);
      if (!taskExists) {
        setTimeout(() => reject(new Error('Task not found')), 100);
        return;
      }

      setTasks(prev => prev.filter(t => t.id !== id));
      setTimeout(() => resolve(), 100);
    });
  }, [tasks]);

  const getTask = useCallback((id: string): Task | undefined => {
    return tasks.find(t => t.id === id);
  }, [tasks]);

  return {
    projects,
    tasks,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    getProjectWithTasks,
    createTask,
    updateTask,
    patchTask,
    deleteTask,
    getTask,
    getProjectTasks,
  };
};