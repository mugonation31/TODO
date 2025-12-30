import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trash.component.html',
  styleUrl: './trash.component.scss'
})
export class TrashComponent implements OnInit {
  private todoService = inject(TodoService);
  private router = inject(Router);

  deletedTodos: Todo[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadDeletedTodos();
  }

  /**
   * Load deleted todos from the API
   */
  loadDeletedTodos() {
    this.loading = true;
    this.error = null;

    this.todoService.getDeletedTodos().subscribe({
      next: (todos) => {
        this.deletedTodos = todos;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load deleted todos. Please try again.';
        console.error('Error loading deleted todos:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Restore a deleted todo
   */
  restoreTodo(todo: Todo) {
    if (!todo.id) return;

    this.loading = true;
    this.error = null;

    this.todoService.restoreTodo(todo.id).subscribe({
      next: () => {
        // Remove from deleted list
        this.deletedTodos = this.deletedTodos.filter(t => t.id !== todo.id);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error restoring todo:', err);
        this.error = 'Failed to restore todo. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Permanently delete a todo
   */
  permanentlyDeleteTodo(todo: Todo) {
    if (!todo.id) return;

    if (confirm('Are you sure you want to permanently delete this todo? This action cannot be undone.')) {
      this.loading = true;
      this.error = null;

      this.todoService.permanentDelete(todo.id).subscribe({
        next: () => {
          // Remove from deleted list
          this.deletedTodos = this.deletedTodos.filter(t => t.id !== todo.id);
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error permanently deleting todo:', err);
          this.error = 'Failed to delete todo permanently. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Navigate back to todos list
   */
  goBackToTodos() {
    this.router.navigate(['/todos']);
  }

  /**
   * Track by function for ngFor performance
   */
  trackByTodoId(index: number, todo: Todo): string {
    return todo.id || index.toString();
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
