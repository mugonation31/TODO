import { Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { TodoListComponent } from './todos/components/todo-list/todo-list.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'todos', component: TodoListComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
