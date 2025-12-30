import { Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { TodoListComponent } from './todos/components/todo-list/todo-list.component';
import { TrashComponent } from './todos/components/trash/trash.component';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'todos', component: TodoListComponent, canActivate: [authGuard] },
    { path: 'trash', component: TrashComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
