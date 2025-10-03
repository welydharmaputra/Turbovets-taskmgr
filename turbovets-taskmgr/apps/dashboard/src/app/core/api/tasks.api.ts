import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'todo' | 'in_progress' | 'done';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  category?: string;
}

@Injectable({ providedIn: 'root' })
export class TasksApi {
    private http = inject(HttpClient);
    private base = environment.apiBase;

    list(): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.base}/tasks`);
    }

    create(dto: CreateTaskDto): Observable<Task> {
        console.log('Creating task', dto);
        return this.http.post<Task>(`${this.base}/tasks`, dto);
    }

    update(id: string, patch: Partial<Task>): Observable<Task> {
        return this.http.put<Task>(`${this.base}/tasks/${id}`, patch);
    }

    remove(id: string): Observable<{ deleted: true }> {
        return this.http.delete<{ deleted: true }>(`${this.base}/tasks/${id}`);
    }
}
