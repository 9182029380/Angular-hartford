import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { signal } from '@angular/core';
import {TodoService} from '../services/todo.service';
import {Todo} from '../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-container">
      <h2>Todo List</h2>

      <!-- Add Todo Form -->
      <form (ngSubmit)="addTodo()" #todoForm="ngForm">
        <input
          type="text"
          [(ngModel)]="newTodoTitle"
          name="title"
          placeholder="Add new todo..."
          required
          class="todo-input"
        >
        <button type="submit" class="add-btn">Add</button>
      </form>

      <!-- Todo List -->
      <ul class="todo-list">
        @for (todo of todos(); track todo.id) {
          <li class="todo-item">
            <input
              type="checkbox"
              [checked]="todo.completed"
              (change)="toggleTodo(todo)"
            >

            @if (editingId() === todo.id) {
              <input
                #editInput
                type="text"
                [(ngModel)]="editTitle"
                (keydown.enter)="saveEdit(todo.id!)"
                (keydown.escape)="cancelEdit()"
                (blur)="saveEdit(todo.id!)"
                class="edit-input"
                autofocus
              />
            } @else {
              <span
                (dblclick)="startEdit(todo)"
                [class.completed]="todo.completed"
                class="todo-title"
              >
                {{ todo.title }}
              </span>
            }

            <button (click)="deleteTodo(todo.id!)" class="delete-btn">Delete</button>
            <button (click)="startEdit(todo)" class="edit-btn" aria-label="Edit todo">Edit</button>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    .todo-input {
      width: 70%;
      padding: 8px;
      margin-right: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .add-btn {
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .todo-list {
      list-style: none;
      padding: 0;
      margin-top: 20px;
    }
    .todo-item {
      display: flex;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .todo-title {
      margin: 0 10px;
      cursor: pointer;
      user-select: none;
    }
    .completed {
      text-decoration: line-through;
      color: #888;
    }
    .edit-input {
      margin: 0 10px;
      padding: 5px;
      border: 1px solid #4CAF50;
      border-radius: 4px;
      width: 200px;
    }
    .edit-btn {
      margin-left: 8px;
      background: #2196F3;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .delete-btn {
      margin-left: auto;
      background: #f44336;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class TodoListComponent {
  private todoService = inject(TodoService);
  todos = signal<Todo[]>([]);
  newTodoTitle = '';

  // Editing state
  editingId = signal<number | null>(null);
  editTitle = '';

  constructor() {
    this.loadTodos();
  }

  loadTodos() {
    this.todoService.getTodos().subscribe(todos => {
      this.todos.set(todos);
    });
  }

  addTodo() {
    if (this.newTodoTitle.trim()) {
      const newTodo = {
        title: this.newTodoTitle.trim(),
        completed: false
      };
      this.todoService.addTodo(newTodo).subscribe(() => {
        this.loadTodos();
        this.newTodoTitle = '';
      });
    }
  }

  toggleTodo(todo: Todo) {
    const updatedTodo = {
      ...todo,
      completed: !todo.completed
    };
    this.todoService.updateTodo(updatedTodo).subscribe(() => {
      this.loadTodos();
    });
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.loadTodos();
    });
  }

  // Editing methods
  startEdit(todo: Todo) {
    this.editingId.set(todo.id!);
    this.editTitle = todo.title;
  }

  saveEdit(id: number) {
    if (this.editTitle.trim()) {
      const updatedTodo = {
        id,
        title: this.editTitle.trim(),
        completed: this.todos().find(t => t.id === id)?.completed || false
      };
      this.todoService.updateTodo(updatedTodo).subscribe(() => {
        this.loadTodos();
        this.editingId.set(null);
      });
    } else {
      // If empty, cancel edit
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editTitle = '';
  }
}
