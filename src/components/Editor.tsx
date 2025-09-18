import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/moving-border';
import { Sparkles, Tag, RefreshCw } from 'lucide-react';
import { Note } from '@/types/note';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onGenerateTitle: () => void;
  onPolishContent: () => void;
  onGenerateTags: () => void;
  isSaving?: boolean;
  isGenerating?: boolean;
}

const Editor: React.FC<EditorProps> = ({
  note,
  onUpdateNote,
  onGenerateTitle,
  onPolishContent,
  onGenerateTags,
  isSaving = false,
  isGenerating = false,
}) => {
  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        请选择一个笔记开始编辑
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-2 mb-4">
          <h2 className="text-lg font-semibold md:block hidden">编辑笔记</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="text-xs text-muted-foreground text-center md:text-left">
              {isGenerating ? 'AI处理中...' : isSaving ? '保存中...' : '已保存'}
            </div>
            
            {/* Mobile AI buttons in a scrollable container */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onGenerateTitle}
                disabled={isGenerating}
                className="shrink-0 text-xs"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">生成标题</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onGenerateTags}
                disabled={isGenerating}
                className="shrink-0 text-xs"
              >
                <Tag className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">生成标签</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onPolishContent}
                disabled={isGenerating}
                className="shrink-0 text-xs"
              >
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">润色全文</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Title Input */}
        <Input
          type="text"
          placeholder="输入标题..."
          value={note.title || ''}
          onChange={(e) => onUpdateNote(note.id, { title: e.target.value })}
          className="mb-3 md:mb-4 text-sm md:text-base"
        />

        {/* Tags */}
        <div className="flex items-center gap-2">
          <Tag className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1 md:gap-2 flex-wrap overflow-x-auto">
            {note.tags?.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs shrink-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 p-3 md:p-4">
        <Textarea
          placeholder="开始写作... 支持Markdown语法"
          value={note.content || ''}
          onChange={(e) => onUpdateNote(note.id, { content: e.target.value })}
          className="w-full h-full resize-none border-0 focus:ring-0 p-0 text-sm md:text-base leading-relaxed"
        />
      </div>
    </div>
  );
};

export default Editor;