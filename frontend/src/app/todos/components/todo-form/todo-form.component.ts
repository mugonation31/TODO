import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss'
})
export class TodoFormComponent implements OnInit {
  @Input() todo?: Todo; // For editing existing todo
  @Output() formSubmit = new EventEmitter<Partial<Todo>>();
  @Output() formCancel = new EventEmitter<void>();

  todoForm!: FormGroup;
  isEditMode = false;

  priorities = [
    { value: 'low', label: 'Low', icon: '🟢' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'high', label: 'High', icon: '🔴' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.isEditMode = !!this.todo;
    this.initForm();
  }

  initForm() {
    this.todoForm = this.fb.group({
      title: [this.todo?.title || '', [Validators.required, Validators.maxLength(500)]],
      description: [this.todo?.description || '', Validators.maxLength(2000)],
      priority: [this.todo?.priority || 'medium'],
      due_date: [this.todo?.due_date ? this.formatDateForInput(this.todo.due_date) : '']
    });
  }

  formatDateForInput(dateString: string): string {
    // Convert ISO date to YYYY-MM-DD format for input[type="date"]
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.todoForm.valid) {
      const formValue = this.todoForm.value;

      // Convert due_date to ISO string if provided
      const todoData: Partial<Todo> = {
        title: formValue.title.trim(),
        description: formValue.description?.trim() || undefined,
        priority: formValue.priority,
        due_date: formValue.due_date ? new Date(formValue.due_date).toISOString() : undefined
      };

      this.formSubmit.emit(todoData);
      this.resetForm();
    }
  }

  onCancel() {
    this.resetForm();
    this.formCancel.emit();
  }

  resetForm() {
    if (!this.isEditMode) {
      this.todoForm.reset({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      });
    }
  }

  get title() {
    return this.todoForm.get('title');
  }

  get description() {
    return this.todoForm.get('description');
  }
}
