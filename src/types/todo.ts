export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  items: TodoItem[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type TodoFilter = 'all' | 'active' | 'completed';
export type TodoSort = 'created' | 'dueDate' | 'priority' | 'title';