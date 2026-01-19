import { Component } from '@angular/core';
import {TodoListComponent} from './components/todo-list.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent],
  template: `<app-todo-list></app-todo-list>`,
  styles: [`
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }
  `]
})
export class AppComponent {
  title = 'todo-app';
}
