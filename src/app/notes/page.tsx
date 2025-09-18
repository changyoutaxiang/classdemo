'use client';

import React, { useState, useCallback, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Sidebar from '@/components/Sidebar';
import NoteList from '@/components/NoteList';
import Editor from '@/components/Editor';
import Settings from '@/components/Settings';
import PolishModal from '@/components/PolishModal';
import { useNotes } from '@/hooks/useNotes';
import { aiService } from '@/lib/api';
import { Note } from '@/types/note';
import { debounce } from '@/utils/debounce';

export default function NotesPage() {
  const { notes, filteredNotes, loading, searchQuery, setSearchQuery, addNote, updateNote } = useNotes();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 自动选择第一个笔记（如果有）
  React.useEffect(() => {
    if (!selectedNoteId && filteredNotes.length > 0) {
      setSelectedNoteId(filteredNotes[0].id);
    } else if (selectedNoteId && !filteredNotes.find(note => note.id === selectedNoteId)) {
      // 如果当前选择的笔记不在过滤结果中，选择第一个
      if (filteredNotes.length > 0) {
        setSelectedNoteId(filteredNotes[0].id);
      } else {
        setSelectedNoteId(null);
      }
    }
  }, [filteredNotes, selectedNoteId]);

  const selectedNote = filteredNotes.find(note => note.id === selectedNoteId);

  const handleCreateNote = useCallback(() => {
    const newNote = addNote({
      title: '',
      content: '',
      tags: [],
    });
    setSelectedNoteId(newNote.id);
  }, [addNote]);

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
  }, []);

  // 自动标签生成的防抖函数
  const debouncedAutoGenerateTags = useCallback(
    debounce(async (noteId: string, content: string) => {
      if (!content.trim()) return;
      
      try {
        const tags = await aiService.generateTags(content);
        if (tags.length > 0) {
          updateNote(noteId, { tags });
        }
      } catch (error) {
        console.error('自动标签生成失败:', error);
      }
    }, 2000),
    [updateNote]
  );

  const handleUpdateNote = useCallback((id: string, updates: Partial<Note>) => {
    updateNote(id, updates);
    
    // 如果内容更新，自动触发标签生成
    if (updates.content && notes.find(n => n.id === id)) {
      debouncedAutoGenerateTags(id, updates.content);
    }
    
    setIsSaving(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  }, [updateNote, debouncedAutoGenerateTags, notes]);

  const handleGenerateTitle = useCallback(async () => {
    if (!selectedNote || !selectedNote.content.trim()) return;
    
    try {
      setIsGenerating(true);
      const title = await aiService.generateTitle(selectedNote.content);
      if (title) {
        updateNote(selectedNote.id, { title });
      }
    } catch (error) {
      console.error('生成标题失败:', error);
      alert('生成标题失败，请检查API密钥设置');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNote, updateNote]);

  const handleGenerateTags = useCallback(async () => {
    if (!selectedNote || !selectedNote.content.trim()) return;
    
    try {
      setIsGenerating(true);
      const tags = await aiService.generateTags(selectedNote.content);
      if (tags.length > 0) {
        updateNote(selectedNote.id, { tags });
      }
    } catch (error) {
      console.error('生成标签失败:', error);
      alert('生成标签失败，请检查API密钥设置');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNote, updateNote]);

  const [polishModalOpen, setPolishModalOpen] = useState(false);
  const [polishedContent, setPolishedContent] = useState('');

  const handlePolishContent = useCallback(async () => {
    if (!selectedNote || !selectedNote.content.trim()) return;
    
    try {
      setIsGenerating(true);
      const polished = await aiService.polishContent(selectedNote.content);
      setPolishedContent(polished);
      setPolishModalOpen(true);
    } catch (error) {
      console.error('润色内容失败:', error);
      alert('润色内容失败，请检查API密钥设置');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNote]);

  const handleAcceptPolishedContent = useCallback(() => {
    if (selectedNote && polishedContent) {
      updateNote(selectedNote.id, { content: polishedContent });
      setPolishModalOpen(false);
    }
  }, [selectedNote, polishedContent, updateNote]);

  const handleToggleSettings = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen);
  }, [isSettingsOpen]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <AppLayout>
        {{
          sidebar: <Sidebar onToggleSettings={handleToggleSettings} />,
          noteList: (
            <NoteList
              notes={filteredNotes}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedNoteId={selectedNoteId}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
            />
          ),
          editor: (
            <Editor
              note={selectedNote || null}
              onUpdateNote={handleUpdateNote}
              onGenerateTitle={handleGenerateTitle}
              onPolishContent={handlePolishContent}
              onGenerateTags={handleGenerateTags}
              isSaving={isSaving}
              isGenerating={isGenerating}
            />
          ),
        }}
      </AppLayout>
      
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <PolishModal
        isOpen={polishModalOpen}
        onClose={() => setPolishModalOpen(false)}
        originalContent={selectedNote?.content || ''}
        polishedContent={polishedContent}
        onAccept={handleAcceptPolishedContent}
      />
    </>
  );
}