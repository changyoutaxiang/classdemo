import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/moving-border';

interface EmptyStateProps {
  onCreateNote: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNote }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="rounded-full bg-secondary p-6 mb-4">
        <FileText className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">欢迎使用AI笔记</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        开始创建您的第一个笔记，体验AI驱动的智能写作助手
      </p>
      <Button onClick={onCreateNote} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        创建第一个笔记
      </Button>
    </div>
  );
};

export default EmptyState;