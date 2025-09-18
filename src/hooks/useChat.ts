import { useState, useEffect, useCallback } from 'react';
import { ChatSession, ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'chat-sessions';

interface UseChatReturn {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  
  // Session operations
  createSession: (title?: string, model?: string) => ChatSession;
  deleteSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  setActiveSession: (sessionId: string) => void;
  clearAllSessions: () => void;
  
  // Message operations
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  clearMessages: (sessionId: string) => void;
  removeLastMessageIfStreaming: (sessionId: string) => void;
  
  // Search and filtering
  searchSessions: (query: string) => ChatSession[];
  getRecentSessions: (limit?: number) => ChatSession[];
  getArchivedSessions: () => ChatSession[];
}

export const useChat = (): UseChatReturn => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const loadSessions = () => {
      try {
        setIsLoading(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSessions(parsed);
          
          // Set first session as active if exists and no active session
          if (parsed.length > 0 && !activeSessionId) {
            const lastActive = parsed.find((s: ChatSession) => !s.isArchived);
            if (lastActive) {
              setActiveSessionId(lastActive.id);
            }
          }
        }
      } catch (err) {
        setError('Failed to load chat sessions');
        console.error('Error loading sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (err) {
        setError('Failed to save chat sessions');
        console.error('Error saving sessions:', err);
      }
    }
  }, [sessions, isLoading]);

  // Session operations
  const createSession = useCallback((title?: string, model?: string): ChatSession => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: title || '新对话',
      messages: [],
      model: model || 'deepseek/deepseek-chat-v3.1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession;
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    // If deleting active session, switch to another one
    if (sessionId === activeSessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId && !s.isArchived);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeSessionId, sessions]);

  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return session;
    }));
  }, []);

  const setActiveSession = useCallback((sessionId: string) => {
    const sessionExists = sessions.some(s => s.id === sessionId);
    if (sessionExists) {
      setActiveSessionId(sessionId);
    }
  }, [sessions]);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
  }, []);

  // Message operations
  const addMessage = useCallback((sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): string => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const updatedMessages = [...session.messages, newMessage];
        return {
          ...session,
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
          lastMessageAt: newMessage.timestamp,
        };
      }
      return session;
    }));
    
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((sessionId: string, messageId: string, updates: Partial<ChatMessage>) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: session.messages.map(message => {
            if (message.id === messageId) {
              return { ...message, ...updates };
            }
            return message;
          }),
          updatedAt: new Date().toISOString(),
        };
      }
      return session;
    }));
  }, []);

  const deleteMessage = useCallback((sessionId: string, messageId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: session.messages.filter(message => message.id !== messageId),
          updatedAt: new Date().toISOString(),
        };
      }
      return session;
    }));
  }, []);

  const clearMessages = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          messages: [],
          updatedAt: new Date().toISOString(),
          lastMessageAt: undefined,
        };
      }
      return session;
    }));
  }, []);

  // 添加删除消息的功能
  const removeLastMessageIfStreaming = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const messages = session.messages;
        if (messages.length > 0 && messages[messages.length - 1].isStreaming) {
          return {
            ...session,
            messages: messages.slice(0, -1),
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return session;
    }));
  }, []);

  // Search and filtering
  const searchSessions = useCallback((query: string): ChatSession[] => {
    const lowercaseQuery = query.toLowerCase();
    return sessions.filter(session => {
      const matchesTitle = session.title.toLowerCase().includes(lowercaseQuery);
      const matchesContent = session.messages.some(message => 
        message.content.toLowerCase().includes(lowercaseQuery)
      );
      return matchesTitle || matchesContent;
    });
  }, [sessions]);

  const getRecentSessions = useCallback((limit = 10): ChatSession[] => {
    return sessions
      .filter(session => !session.isArchived)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }, [sessions]);

  const getArchivedSessions = useCallback((): ChatSession[] => {
    return sessions.filter(session => session.isArchived);
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSessionId,
    activeSession,
    isLoading,
    error,
    
    createSession,
    deleteSession,
    updateSession,
    setActiveSession,
    clearAllSessions,
    
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    removeLastMessageIfStreaming,
    
    searchSessions,
    getRecentSessions,
    getArchivedSessions,
  };
};