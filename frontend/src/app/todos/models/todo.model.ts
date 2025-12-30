export interface Todo {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  pinned: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  pinned?: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}
