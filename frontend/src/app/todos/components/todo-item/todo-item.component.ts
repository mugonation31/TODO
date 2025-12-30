import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';

export type TodoItemMode = 'normal' | 'trash';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Input() mode: TodoItemMode = 'normal';

  // Event emitters for different actions
  @Output() toggleComplete = new EventEmitter<Todo>();
  @Output() togglePin = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<Todo>();
  @Output() restore = new EventEmitter<Todo>();
  @Output() permanentDelete = new EventEmitter<Todo>();

  /**
   * Handle toggle complete action
   */
  onToggleComplete() {
    this.toggleComplete.emit(this.todo);
  }

  /**
   * Handle toggle pin action
   */
  onTogglePin() {
    this.togglePin.emit(this.todo);
  }

  /**
   * Handle delete action
   */
  onDelete() {
    this.delete.emit(this.todo);
  }

  /**
   * Handle restore action (trash mode only)
   */
  onRestore() {
    this.restore.emit(this.todo);
  }

  /**
   * Handle permanent delete action (trash mode only)
   */
  onPermanentDelete() {
    this.permanentDelete.emit(this.todo);
  }

  /**
   * Format date helper
   */
  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
