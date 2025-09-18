'use client';

import { useState } from 'react';
import { PromptTemplate } from '@/types/chat';
import { usePromptTemplates } from '@/hooks/usePromptTemplates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Star,
  Tags,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TemplateFormData {
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
}

export function PromptTemplateManager({ open, onOpenChange }: PromptTemplateManagerProps) {
  const {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    searchTemplates,
    getTemplatesByCategory,
    extractVariables,
  } = usePromptTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    content: '',
    category: '通用',
    tags: [],
    isFavorite: false,
  });

  const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
  const filteredTemplates = searchQuery ? searchTemplates(searchQuery) : templates;

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      content: '',
      category: '通用',
      tags: [],
      isFavorite: false,
    });
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      content: template.content,
      category: template.category || '通用',
      tags: Array.isArray(template.tags) ? template.tags : [],
      isFavorite: template.isFavorite || false,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) return;

    const templateData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      content: formData.content.trim(),
      variables: extractVariables(formData.content),
      category: formData.category,
      tags: formData.tags,
      isFavorite: formData.isFavorite,
    };

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, templateData);
    } else {
      createTemplate(templateData);
    }

    setEditingTemplate(null);
  };

  const handleDelete = (template: PromptTemplate) => {
    if (confirm(`确定要删除模板 "${template.name}" 吗？`)) {
      deleteTemplate(template.id);
    }
  };

  const handleDuplicate = (template: PromptTemplate) => {
    duplicateTemplate(template.id);
  };

  const handleUseTemplate = (template: PromptTemplate) => {
    // This would typically be handled by the parent component
    console.log('Using template:', template.name);
    onOpenChange(false);
  };

  const TemplateCard = ({ template }: { template: PromptTemplate }) => {
    const variables = extractVariables(template.content);
    
    return (
      <Card className="group relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                {template.name}
                {template.isFavorite && (
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                )}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {template.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(template)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDuplicate(template)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(template)}
                className="text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground line-clamp-3">
              {template.content}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {template.category && (
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              )}
              {template.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {variables.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Tags className="h-3 w-3" />
                变量: {variables.join(', ')}
              </div>
            )}
          </div>
        </CardContent>
        <div className="p-4 pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => handleUseTemplate(template)}
          >
            使用模板
          </Button>
        </div>
      </Card>
    );
  };

  const TemplateForm = () => {
    const variables = extractVariables(formData.content);
    const tagString = (formData.tags || []).join(', ');

    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label>名称 *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入模板名称"
            />
          </div>
          
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="简要描述模板用途"
            />
          </div>
          
          <div>
            <Label>内容 *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="使用 {{变量名}} 来定义变量"
              className="min-h-[200px] font-mono text-sm"
            />
            {variables.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                检测到变量: {variables.join(', ')}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>分类</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="通用">通用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>标签</Label>
              <Input
                value={tagString}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                })}
                placeholder="多个标签用逗号分隔"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isFavorite}
              onCheckedChange={(checked) => setFormData({ ...formData, isFavorite: checked })}
            />
            <Label>设为收藏</Label>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditingTemplate(null)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>提示词模板管理</DialogTitle>
          <DialogDescription>
            管理您的提示词模板，提高对话效率
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">浏览模板</TabsTrigger>
            <TabsTrigger value="create" onClick={handleCreate}>
              {editingTemplate ? '编辑模板' : '创建模板'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 overflow-hidden">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索模板..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  新建模板
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    没有找到匹配的模板
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="create" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="pr-4">
                <TemplateForm />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}