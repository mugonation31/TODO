import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';
import { TodoFormComponent } from '../todo-form/todo-form.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoFormComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent implements OnInit {
  private todoService = inject(TodoService);

  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  loading = false;
  error: string | null = null;

  // Filter options
  showCompleted = false;
  showPinnedOnly = false;

  // Form visibility
  showForm = false;

  ngOnInit() {
    this.loadTodos();
  }

  /**
   * Load todos from the API
   */
  loadTodos() {
    this.loading = true;
    this.error = null;

    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load todos. Please try again.';
        console.error('Error loading todos:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Apply filters to the todo list
   */
  applyFilters() {
    this.filteredTodos = this.todos.filter(todo => {
      // Filter out deleted todos
      if (todo.deleted_at) return false;

      // Filter by completed status (show only completed when checked)
      if (this.showCompleted && !todo.completed) return false;

      // Filter by pinned status (show only pinned when checked)
      if (this.showPinnedOnly && !todo.pinned) return false;

      return true;
    });

    // Sort: pinned first, then by created date (newest first)
    this.filteredTodos.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }

  /**
   * Toggle show completed filter
   */
  toggleShowCompleted() {
    this.showCompleted = !this.showCompleted;
    this.applyFilters();
  }

  /**
   * Toggle show pinned only filter
   */
  toggleShowPinnedOnly() {
    this.showPinnedOnly = !this.showPinnedOnly;
    this.applyFilters();
  }

  /**
   * Toggle todo completion status
   */
  toggleComplete(todo: Todo) {
    if (!todo.id) return;

    this.todoService.toggleComplete(todo.id, !todo.completed).subscribe({
      next: (updatedTodo) => {
        const index = this.todos.findIndex(t => t.id === updatedTodo.id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
          this.applyFilters();
        }
      },
      error: (err) => {
        console.error('Error toggling todo:', err);
        this.error = 'Failed to update todo. Please try again.';
      }
    });
  }

  /**
   * Toggle todo pinned status
   */
  togglePin(todo: Todo) {
    if (!todo.id) return;

    this.todoService.togglePin(todo.id, !todo.pinned).subscribe({
      next: (updatedTodo) => {
        const index = this.todos.findIndex(t => t.id === updatedTodo.id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
          this.applyFilters();
        }
      },
      error: (err) => {
        console.error('Error pinning todo:', err);
        this.error = 'Failed to pin todo. Please try again.';
      }
    });
  }

  /**
   * Delete a todo (soft delete)
   */
  deleteTodo(todo: Todo) {
    if (!todo.id) return;

    if (confirm('Are you sure you want to delete this todo?')) {
      this.todoService.deleteTodo(todo.id).subscribe({
        next: () => {
          this.loadTodos(); // Reload to get updated list
        },
        error: (err) => {
          console.error('Error deleting todo:', err);
          this.error = 'Failed to delete todo. Please try again.';
        }
      });
    }
  }

  /**
   * Track by function for ngFor performance
   */
  trackByTodoId(index: number, todo: Todo): string {
    return todo.id || index.toString();
  }

  /**
   * Toggle form visibility
   */
  toggleForm() {
    this.showForm = !this.showForm;
  }

  /**
   * Handle form submission (create new todo)
   */
  onFormSubmit(todoData: Partial<Todo>) {
    // Ensure title is present (form validation guarantees this)
    if (!todoData.title) {
      this.error = 'Title is required';
      return;
    }

    this.loading = true;
    this.error = null;

    // Create properly typed request
    const createRequest = {
      title: todoData.title,
      description: todoData.description,
      priority: todoData.priority,
      due_date: todoData.due_date
    };

    this.todoService.createTodo(createRequest).subscribe({
      next: (newTodo) => {
        this.todos.unshift(newTodo); // Add to beginning of array
        this.applyFilters();
        this.showForm = false; // Hide form after successful creation
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating todo:', err);
        this.error = 'Failed to create todo. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Handle form cancellation
   */
  onFormCancel() {
    this.showForm = false;
  }
}
