import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { SupabaseService } from '../../core/services/supabase.service';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../models/todo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private http = inject(HttpClient);
  private supabaseService = inject(SupabaseService);

  // FastAPI backend URL (update in environment.ts)
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  /**
   * Get authorization headers with JWT token
   */
  private async getAuthHeaders(): Promise<HttpHeaders> {
    const token = await this.supabaseService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get all todos for the current user
   */
  getTodos(): Observable<Todo[]> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers =>
        this.http.get<Todo[]>(`${this.apiUrl}/todos`, { headers })
      )
    );
  }

  /**
   * Create a new todo
   */
  createTodo(todo: CreateTodoRequest): Observable<Todo> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers =>
        this.http.post<Todo>(`${this.apiUrl}/todos`, todo, { headers })
      )
    );
  }

  /**
   * Update an existing todo
   */
  updateTodo(id: string, updates: UpdateTodoRequest): Observable<Todo> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers =>
        this.http.patch<Todo>(`${this.apiUrl}/todos/${id}`, updates, { headers })
      )
    );
  }

  /**
   * Delete a todo (soft delete)
   */
  deleteTodo(id: string): Observable<void> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers =>
        this.http.delete<void>(`${this.apiUrl}/todos/${id}`, { headers })
      )
    );
  }

  /**
   * Toggle todo completed status
   */
  toggleComplete(id: string, completed: boolean): Observable<Todo> {
    return this.updateTodo(id, { completed });
  }

  /**
   * Toggle todo pinned status
   */
  togglePin(id: string, pinned: boolean): Observable<Todo> {
    return this.updateTodo(id, { pinned });
  }

  /**
   * Get deleted todos (trash)
   */
  getDeletedTodos(): Observable<Todo[]> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers =>
        this.http.get<Todo[]>(`${this.apiUrl}/todos/trash`, { headers })
      )
    );
  }

  /**
   * Restore a deleted todo
   */
  restoreTodo(id: string): Observable<Todo> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers =>
        this.http.post<Todo>(`${this.apiUrl}/todos/${id}/restore`, {}, { headers })
      )
    );
  }

  /**
   * Permanently delete a todo (hard delete)
   */
  permanentDelete(id: string): Observable<void> {
    return from(this.getAuthHeaders()).pipe(
      switchMap(headers =>
        this.http.delete<void>(`${this.apiUrl}/todos/${id}/permanent`, { headers })
      )
    );
  }
}
