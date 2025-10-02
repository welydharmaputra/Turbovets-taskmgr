import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'tasks', canActivate: [AuthGuard], loadComponent: () => import('./features/tasks/tasks.page').then(m => m.TasksPage) },
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  { path: '**', redirectTo: 'tasks' },
];
