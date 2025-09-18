import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  Task,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProjectWithTasks
} from '@/types/project';

// 本地存储键名
const PROJECTS_STORAGE_KEY = 'ai-projects';
const TASKS_STORAGE_KEY = 'ai-tasks';

// 本地存储辅助函数
const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 如果是项目数据，确保日期字段正确转换
      if (key === PROJECTS_STORAGE_KEY) {
        return parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
      }
      // 如果是任务数据，确保日期字段正确转换
      if (key === TASKS_STORAGE_KEY) {
        return parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          deadline: t.deadline ? new Date(t.deadline) : undefined
        }));
      }
      return parsed;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Failed to get stored data for ${key}:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save data to ${key}:`, error);
  }
};

// 获取当前项目和任务数据
const getProjects = (): Project[] => {
  const stored = getStoredData<Project[]>(PROJECTS_STORAGE_KEY, []);
  if (stored.length === 0) {
    // 创建默认示例项目
    const sampleProject: Project = {
      id: uuidv4(),
      name: '示例项目',
      description: '这是一个示例项目，展示项目管理功能',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    saveToStorage(PROJECTS_STORAGE_KEY, [sampleProject]);
    return [sampleProject];
  }
  return stored;
};

const getTasks = (): Task[] => {
  const stored = getStoredData<Task[]>(TASKS_STORAGE_KEY, []);
  if (stored.length === 0) {
    const projects = getProjects();
    if (projects.length > 0) {
      // 创建默认示例任务
      const sampleTask: Task = {
        id: uuidv4(),
        projectId: projects[0].id,
        title: '示例任务',
        description: '这是一个示例任务，展示任务管理功能',
        status: 'todo',
        priority: 'medium',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
        assignee: '我',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      saveToStorage(TASKS_STORAGE_KEY, [sampleTask]);
      return [sampleTask];
    }
  }
  return stored;
};

// 项目 API
export const projectApi = {
  // 获取所有项目
  async getProjects(): Promise<Project[]> {
    return new Promise((resolve) => {
      const projects = getProjects();
      setTimeout(() => resolve([...projects]), 100);
    });
  },

  // 创建项目
  async createProject(data: CreateProjectRequest): Promise<Project> {
    return new Promise((resolve) => {
      const projects = getProjects();
      const newProject: Project = {
        id: uuidv4(),
        name: data.name,
        description: data.description,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updatedProjects = [...projects, newProject];
      saveToStorage(PROJECTS_STORAGE_KEY, updatedProjects);
      setTimeout(() => resolve(newProject), 100);
    });
  },

  // 更新项目
  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    return new Promise((resolve, reject) => {
      const projects = getProjects();
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
      
      const updatedProjects = projects.map(p => p.id === id ? updatedProject : p);
      saveToStorage(PROJECTS_STORAGE_KEY, updatedProjects);
      
      setTimeout(() => resolve(updatedProject), 100);
    });
  },

  // 删除项目
  async deleteProject(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const projects = getProjects();
      const tasks = getTasks();
      
      const projectExists = projects.some(p => p.id === id);
      if (!projectExists) {
        setTimeout(() => reject(new Error('Project not found')), 100);
        return;
      }
      
      // 删除项目相关的所有任务
      const updatedTasks = tasks.filter(t => t.projectId !== id);
      const updatedProjects = projects.filter(p => p.id !== id);
      
      saveToStorage(PROJECTS_STORAGE_KEY, updatedProjects);
      saveToStorage(TASKS_STORAGE_KEY, updatedTasks);
      
      setTimeout(() => resolve(), 100);
    });
  },

  // 获取项目详情（包含任务）
  async getProjectWithTasks(id: string): Promise<ProjectWithTasks> {
    return new Promise((resolve, reject) => {
      const projects = getProjects();
      const tasks = getTasks();
      
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
  }
};

// 任务 API
export const taskApi = {
  // 获取项目的所有任务
  async getProjectTasks(projectId: string): Promise<Task[]> {
    return new Promise((resolve) => {
      const tasks = getTasks();
      const projectTasks = tasks.filter(t => t.projectId === projectId);
      setTimeout(() => resolve([...projectTasks]), 100);
    });
  },

  // 创建任务
  async createTask(data: CreateTaskRequest): Promise<Task> {
    return new Promise((resolve) => {
      const tasks = getTasks();
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
      const updatedTasks = [...tasks, newTask];
      saveToStorage(TASKS_STORAGE_KEY, updatedTasks);
      setTimeout(() => resolve(newTask), 100);
    });
  },

  // 更新任务
  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    return new Promise((resolve, reject) => {
      const tasks = getTasks();
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
      
      const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t);
      saveToStorage(TASKS_STORAGE_KEY, updatedTasks);
      
      setTimeout(() => resolve(updatedTask), 100);
    });
  },

  // 部分更新任务（用于看板拖拽）
  async patchTask(id: string, data: Partial<UpdateTaskRequest>): Promise<Task> {
    return this.updateTask(id, data);
  },

  // 删除任务
  async deleteTask(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tasks = getTasks();
      const taskExists = tasks.some(t => t.id === id);
      if (!taskExists) {
        setTimeout(() => reject(new Error('Task not found')), 100);
        return;
      }
      
      const updatedTasks = tasks.filter(t => t.id !== id);
      saveToStorage(TASKS_STORAGE_KEY, updatedTasks);
      setTimeout(() => resolve(), 100);
    });
  },

  // 获取任务详情
  async getTask(id: string): Promise<Task> {
    return new Promise((resolve, reject) => {
      const tasks = getTasks();
      const task = tasks.find(t => t.id === id);
      if (!task) {
        setTimeout(() => reject(new Error('Task not found')), 100);
        return;
      }
      
      setTimeout(() => resolve({ ...task }), 100);
    });
  }
};

// 导出统一的 API 对象
export const api = {
  projects: projectApi,
  tasks: taskApi
};