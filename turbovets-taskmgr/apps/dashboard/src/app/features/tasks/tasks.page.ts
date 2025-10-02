import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import * as A from '../../store/tasks/tasks.actions';
import {
  selectAllTasks,
  selectTasksLoading,
} from '../../store/tasks/tasks.reducer';
import { Task } from '../../core/api/tasks.api';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Tasks</h1>

        <form class="flex gap-2" [formGroup]="form" (ngSubmit)="add()">
          <input
            class="border rounded-xl px-3 py-2 w-72"
            placeholder="New task title"
            formControlName="title"
          />
          <button
            class="px-4 py-2 rounded-xl bg-black text-white"
            [disabled]="form.invalid || loading()"
          >
            Add
          </button>
        </form>
      </div>

      <ul class="mt-6 space-y-2">
        <li
          *ngFor="let t of tasks(); trackBy: trackById"
          class="border rounded-xl p-3 flex items-center justify-between"
        >
          <div>
            <div class="font-medium">{{ t.title }}</div>
            <div class="text-sm text-gray-500">
              {{ t.category || '—' }} • {{ t.status }}
            </div>
          </div>

          <div class="flex gap-2">
            <button class="px-2 py-1 border rounded-xl" (click)="mark(t, 'in_progress')">
              Start
            </button>
            <button class="px-2 py-1 border rounded-xl" (click)="mark(t, 'done')">
              Done
            </button>
            <button class="px-2 py-1 border rounded-xl" (click)="remove(t.id)">
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>
  `,
})
export class TasksPage {
  private store = inject(Store);
  private fb = inject(FormBuilder).nonNullable;

  form = this.fb.group({
    title: ['', Validators.required],
  });

  // <-- “Connection” to store via selectors
  tasks = toSignal(this.store.select(selectAllTasks), { initialValue: [] as Task[] });
  loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false });

  constructor() {
    // kick off initial load
    this.store.dispatch(A.load());
  }

  add() {
    if (this.form.invalid) return;
    const { title } = this.form.getRawValue();
    this.store.dispatch(A.createTask({ dto: { title } }));
    this.form.reset();
  }

  mark(t: Task, status: 'in_progress' | 'done') {
    this.store.dispatch(A.updateTask({ id: t.id, patch: { status } }));
  }

  remove(id: string) {
    this.store.dispatch(A.removeTask({ id }));
  }

  trackById = (_: number, t: Task) => t.id;
}
