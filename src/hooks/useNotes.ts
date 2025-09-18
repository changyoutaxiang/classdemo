import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/note';
import { v4 as uuidv4 } from 'uuid';

interface UseNotesReturn {
  notes: Note[];
  filteredNotes: Note[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addNote: (note: Partial<Note>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
}

const STORAGE_KEY = 'ai-notes';

export const useNotes = (): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 从localStorage加载笔记
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem(STORAGE_KEY);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        // 如果没有存储的笔记，创建一个欢迎笔记
        const welcomeNote: Note = {
          id: uuidv4(),
          title: '欢迎使用AI笔记',
          content: '这是一个AI驱动的笔记应用，支持自动生成标题、标签和内容润色。\n\n## 功能特性\n- 📝 支持Markdown语法\n- 🤖 AI自动生成标题\n- 🏷️ AI自动标签\n- ✨ AI内容润色\n- 💾 本地存储',
          tags: ['欢迎', 'AI', 'Next.js'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setNotes([welcomeNote]);
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to save notes to localStorage:', error);
      }
    }
  }, [notes, loading]);

  const addNote = useCallback((note: Partial<Note>): Note => {
    const newNote: Note = {
      id: uuidv4(),
      title: note.title || '无标题笔记',
      content: note.content || '',
      tags: note.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...note,
    };

    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const getNote = useCallback((id: string): Note | undefined => {
    return notes.find(note => note.id === id);
  }, [notes]);

  // 搜索过滤逻辑
  const filteredNotes = notes.filter(note => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const title = note.title.toLowerCase();
    const content = note.content.toLowerCase();
    const tags = note.tags.map(tag => tag.toLowerCase());
    
    return (
      title.includes(query) ||
      content.includes(query) ||
      tags.some(tag => tag.includes(query))
    );
  });

  return {
    notes,
    filteredNotes,
    loading,
    searchQuery,
    setSearchQuery,
    addNote,
    updateNote,
    deleteNote,
    getNote,
  };
};