import { useState, useEffect, useCallback, useMemo } from 'react';
import { TodoList, TodoItem, TodoFilter, TodoSort } from '@/types/todo';
import { v4 as uuidv4 } from 'uuid';

interface UseTodosReturn {
  todoLists: TodoList[];
  activeList: TodoList | null;
  filteredItems: TodoItem[];
  loading: boolean;
  filter: TodoFilter;
  sortBy: TodoSort;
  searchQuery: string;
  setFilter: (filter: TodoFilter) => void;
  setSortBy: (sort: TodoSort) => void;
  setSearchQuery: (query: string) => void;
  setActiveList: (id: string) => void;
  createList: (name: string, color?: string) => TodoList;
  updateList: (id: string, updates: Partial<TodoList>) => void;
  deleteList: (id: string) => void;
  addTodo: (title: string, priority?: 'low' | 'medium' | 'high', dueDate?: string, description?: string) => TodoItem;
  updateTodo: (todoId: string, updates: Partial<TodoItem>) => void;
  deleteTodo: (todoId: string) => void;
  toggleTodo: (todoId: string) => void;
  getStats: () => {
    total: number;
    completed: number;
    active: number;
    overdue: number;
  };
}

const STORAGE_KEY = 'ai-todos';

export const useTodos = (): UseTodosReturn => {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [sortBy, setSortBy] = useState<TodoSort>('created');
  const [searchQuery, setSearchQuery] = useState('');

  // 从localStorage加载
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lists = JSON.parse(stored);
        setTodoLists(lists);
        if (lists.length > 0 && !activeListId) {
          setActiveListId(lists[0].id);
        }
      } else {
        // 创建默认待办清单
        const defaultList: TodoList = {
          id: uuidv4(),
          name: '我的待办',
          items: [
            {
              id: uuidv4(),
              title: '欢迎使用智能待办清单',
              completed: false,
              priority: 'medium',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ],
          color: '#3b82f6',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTodoLists([defaultList]);
        setActiveListId(defaultList.id);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todoLists));
      } catch (error) {
        console.error('Failed to save todos:', error);
      }
    }
  }, [todoLists, loading]);

  const activeList = useMemo(() => {
    return todoLists.find(list => list.id === activeListId) || null;
  }, [todoLists, activeListId]);

  const filteredItems = useMemo(() => {
    if (!activeList) return [];

    let items = [...activeList.items];

    // 应用搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    // 应用完成状态过滤
    if (filter === 'active') {
      items = items.filter(item => !item.completed);
    } else if (filter === 'completed') {
      items = items.filter(item => item.completed);
    }

    // 应用排序
    items.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return items;
  }, [activeList, filter, sortBy, searchQuery]);

  const createList = useCallback((name: string, color?: string): TodoList => {
    const newList: TodoList = {
      id: uuidv4(),
      name,
      items: [],
      color: color || '#3b82f6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTodoLists(prev => [...prev, newList]);
    return newList;
  }, []);

  const updateList = useCallback((id: string, updates: Partial<TodoList>) => {
    setTodoLists(prev => 
      prev.map(list => 
        list.id === id 
          ? { ...list, ...updates, updatedAt: new Date().toISOString() }
          : list
      )
    );
  }, []);

  const deleteList = useCallback((id: string) => {
    setTodoLists(prev => {
      const filtered = prev.filter(list => list.id !== id);
      if (activeListId === id && filtered.length > 0) {
        setActiveListId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveListId(null);
      }
      return filtered;
    });
  }, [activeListId]);

  const addTodo = useCallback(
    (title: string, priority = 'medium' as 'low' | 'medium' | 'high', dueDate?: string, description?: string): TodoItem => {
      if (!activeListId) throw new Error('No active list');
      
      const newTodo: TodoItem = {
        id: uuidv4(),
        title,
        completed: false,
        priority,
        dueDate,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTodoLists(prev => 
        prev.map(list => 
          list.id === activeListId
            ? { ...list, items: [...list.items, newTodo], updatedAt: new Date().toISOString() }
            : list
        )
      );

      return newTodo;
    },
    [activeListId]
  );

  const updateTodo = useCallback((todoId: string, updates: Partial<TodoItem>) => {
    if (!activeListId) return;
    
    setTodoLists(prev => 
      prev.map(list => 
        list.id === activeListId
          ? {
              ...list,
              items: list.items.map(item => 
                item.id === todoId
                  ? { ...item, ...updates, updatedAt: new Date().toISOString() }
                  : item
              ),
              updatedAt: new Date().toISOString(),
            }
          : list
      )
    );
  }, [activeListId]);

  const deleteTodo = useCallback((todoId: string) => {
    if (!activeListId) return;
    
    setTodoLists(prev => 
      prev.map(list => 
        list.id === activeListId
          ? {
              ...list,
              items: list.items.filter(item => item.id !== todoId),
              updatedAt: new Date().toISOString(),
            }
          : list
      )
    );
  }, [activeListId]);

  const toggleTodo = useCallback((todoId: string) => {
    if (!activeListId) return;
    
    setTodoLists(prev => 
      prev.map(list => 
        list.id === activeListId
          ? {
              ...list,
              items: list.items.map(item => 
                item.id === todoId
                  ? { ...item, completed: !item.completed, updatedAt: new Date().toISOString() }
                  : item
              ),
              updatedAt: new Date().toISOString(),
            }
          : list
      )
    );
  }, [activeListId]);

  const getStats = useCallback(() => {
    if (!activeList) {
      return { total: 0, completed: 0, active: 0, overdue: 0 };
    }

    const now = new Date();
    const total = activeList.items.length;
    const completed = activeList.items.filter(item => item.completed).length;
    const active = total - completed;
    const overdue = activeList.items.filter(item => 
      !item.completed && item.dueDate && new Date(item.dueDate) < now
    ).length;

    return { total, completed, active, overdue };
  }, [activeList]);

  return {
    todoLists,
    activeList,
    filteredItems,
    loading,
    filter,
    sortBy,
    searchQuery,
    setFilter,
    setSortBy,
    setSearchQuery,
    setActiveList: setActiveListId,
    createList,
    updateList,
    deleteList,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    getStats,
  };
};