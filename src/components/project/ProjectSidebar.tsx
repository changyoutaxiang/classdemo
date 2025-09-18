'use client';

import { useState, useEffect } from 'react';
import { Plus, Folder, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/projectApi';
import { Project } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectSidebarProps {
  selectedProjectId?: string;
  onProjectSelect: (project: Project) => void;
  className?: string;
}

export function ProjectSidebar({
  selectedProjectId,
  onProjectSelect,
  className
}: ProjectSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // 加载项目列表
  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectList = await api.projects.getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建新项目
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setCreating(true);
      const newProject = await api.projects.createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined
      });
      
      setProjects(prev => [...prev, newProject]);
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreateDialogOpen(false);
      
      // 自动选择新创建的项目
      onProjectSelect(newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className={cn('flex flex-col h-full bg-gray-50 border-r', className)}>
      {/* 头部 */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">项目管理</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>创建新项目</DialogTitle>
                <DialogDescription>
                  创建一个新的项目来组织您的任务。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">项目名称</Label>
                  <Input
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="输入项目名称"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">项目描述</Label>
                  <Textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="输入项目描述（可选）"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || creating}
                >
                  {creating ? '创建中...' : '创建项目'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 项目列表 */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">加载中...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Folder className="h-12 w-12 text-gray-300 mb-3" />
              <div className="text-sm text-gray-500 mb-2">暂无项目</div>
              <div className="text-xs text-gray-400">点击上方 + 按钮创建第一个项目</div>
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-colors',
                    'hover:bg-white hover:shadow-sm',
                    selectedProjectId === project.id
                      ? 'bg-blue-50 border border-blue-200 text-blue-900'
                      : 'text-gray-700'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Folder className={cn(
                      'h-4 w-4 mt-0.5 flex-shrink-0',
                      selectedProjectId === project.id ? 'text-blue-600' : 'text-gray-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {project.name}
                      </div>
                      {project.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 底部 */}
      <div className="p-4 border-t bg-white">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          设置
        </Button>
      </div>
    </div>
  );
}