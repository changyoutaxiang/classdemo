import React from 'react';
import { Button } from '@/components/ui/moving-border';
import { Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Note } from '@/types/note';
import EmptyState from './EmptyState';
import HighlightText from './HighlightText';

interface NoteListProps {
  notes: Note[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  searchQuery,
  onSearchChange,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
}) => {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-border space-y-3">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索笔记..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 text-sm h-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* 新建笔记按钮 */}
        <Button 
          onClick={onCreateNote}
          className="w-full h-10"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建笔记
        </Button>

        {/* 搜索结果计数 */}
        {searchQuery && (
          <p className="text-xs text-muted-foreground text-center">
            找到 {notes.length} 个结果
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <EmptyState onCreateNote={onCreateNote} />
        ) : (
          <div className="divide-y divide-border">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`p-3 md:p-4 cursor-pointer hover:bg-secondary/50 transition-colors active:bg-secondary/70 ${
                  selectedNoteId === note.id ? 'bg-secondary' : ''
                }`}
              >
                <h3 className="font-medium text-sm md:text-base truncate mb-1">
                  <HighlightText 
                    text={note.title || '无标题'} 
                    highlight={searchQuery} 
                  />
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {/* 在移动端显示笔记内容预览 */}
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 md:hidden">
                  {note.content?.substring(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteList;