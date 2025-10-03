import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import * as A from '../../store/tasks/tasks.actions';
import { selectAllTasks, selectTasksLoading } from '../../store/tasks/tasks.reducer';
import { Task } from '../../core/api/tasks.api';

type Status = 'todo' | 'in_progress' | 'done';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto p-6 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 class="text-2xl font-semibold">Tasks</h1>

        <!-- Create new task -->
        <form class="flex gap-2" [formGroup]="form" (ngSubmit)="add()">
          <input class="border rounded-xl px-3 py-2 w-72"
                 placeholder="New task title"
                 formControlName="title" />
          <button class="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
                  [disabled]="form.invalid || loading()">
            {{ loading() ? 'Saving…' : 'Add' }}
          </button>
        </form>
      </div>

      <!-- Filters / Sort -->
      <form [formGroup]="filterForm"
            class="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div class="md:col-span-2">
          <label for="search-input" class="block text-xs text-gray-500 mb-1">Search</label>
          <input id="search-input" class="w-full border rounded-xl px-3 py-2"
                 placeholder="title, description, category…"
                 formControlName="q" />
        </div>

        <div>
          <label for="status-select" class="block text-xs text-gray-500 mb-1">Status</label>
          <select id="status-select" class="w-full border rounded-xl px-3 py-2" formControlName="status">
            <option value="all">All</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label for="category-select" class="block text-xs text-gray-500 mb-1">Category</label>
          <select id="category-select" class="w-full border rounded-xl px-3 py-2" formControlName="category">
            <option value="all">All</option>
            <option *ngFor="let c of categories()" [value]="c">{{ c || '— (uncategorized)' }}</option>
          </select>
        </div>

        <div class="flex gap-2">
          <div class="flex-1">
            <label for="sort-by-select" class="block text-xs text-gray-500 mb-1">Sort by</label>
            <select id="sort-by-select" class="w-full border rounded-xl px-3 py-2" formControlName="sortBy">
              <option value="createdAt">Created</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div>
            <label for="sort-dir-select" class="block text-xs text-gray-500 mb-1">Dir</label>
            <select id="sort-dir-select" class="w-full border rounded-xl px-3 py-2" formControlName="sortDir">
              <option value="desc">↓</option>
              <option value="asc">↑</option>
            </select>
          </div>
        </div>
      </form>

      <!-- Group toggle -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" class="rounded"
                 [checked]="groupByCategory()" (change)="toggleGroup($event)" />
          Group by category
        </label>
      </div>

      <!-- GROUPED: cards -->
      <ng-container *ngIf="groupByCategory(); else flatGrid">
        <div class="space-y-6" *ngIf="groupedTasks().length; else emptyState">
          <section *ngFor="let group of groupedTasks()">
            <h2 class="text-sm uppercase tracking-wide text-gray-500 mb-2">
              {{ group.category || 'Uncategorized' }} ({{ group.items.length }})
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <article *ngFor="let t of group.items; trackBy: trackById"
                       class="rounded-2xl border shadow-sm bg-white p-4 flex flex-col gap-3">
                <header class="flex items-start justify-between gap-3">
                  <h3 class="font-medium leading-snug break-words">{{ t.title }}</h3>
                  <span class="text-xs px-2 py-0.5 rounded-full"
                        [class]="statusClass(t.status)">
                    {{ labelForStatus(t.status) }}
                  </span>
                </header>

                <p class="text-sm text-gray-600 line-clamp-3" *ngIf="t.description">{{ t.description }}</p>

                <div class="flex items-center justify-between mt-auto">
                  <span class="text-xs px-2 py-0.5 rounded-full border"
                        [class]="categoryClass(t.category)">
                    {{ t.category || '—' }}
                  </span>

                  <div class="flex gap-2">
                    <button class="px-2 py-1 border rounded-xl" (click)="mark(t, 'in_progress')">Start</button>
                    <button class="px-2 py-1 border rounded-xl" (click)="mark(t, 'done')">Done</button>
                    <button class="px-2 py-1 border rounded-xl" (click)="setCategory(t)">Categorize</button>
                    <button class="px-2 py-1 border rounded-xl" (click)="remove(t.id)">Delete</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </ng-container>

      <!-- FLAT: cards -->
      <ng-template #flatGrid>
        <ng-container *ngIf="visible().length; else emptyState">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <article *ngFor="let t of visible(); trackBy: trackById"
                     class="rounded-2xl border shadow-sm bg-white p-4 flex flex-col gap-3">
              <header class="flex items-start justify-between gap-3">
                <h3 class="font-medium leading-snug break-words">{{ t.title }}</h3>
                <span class="text-xs px-2 py-0.5 rounded-full"
                      [class]="statusClass(t.status)">
                  {{ labelForStatus(t.status) }}
                </span>
              </header>

              <p class="text-sm text-gray-600 line-clamp-3" *ngIf="t.description">{{ t.description }}</p>

              <div class="flex items-center justify-between mt-auto">
                <span class="text-xs px-2 py-0.5 rounded-full border"
                      [class]="categoryClass(t.category)">
                  {{ t.category || '—' }}
                </span>

                <div class="flex gap-2">
                  <button class="px-2 py-1 border rounded-xl" (click)="mark(t, 'in_progress')">Start</button>
                  <button class="px-2 py-1 border rounded-xl" (click)="mark(t, 'done')">Done</button>
                  <button class="px-2 py-1 border rounded-xl" (click)="setCategory(t)">Categorize</button>
                  <button class="px-2 py-1 border rounded-xl" (click)="remove(t.id)">Delete</button>
                </div>
              </div>
            </article>
          </div>
        </ng-container>
      </ng-template>

      <!-- Empty state -->
      <ng-template #emptyState>
        <div class="rounded-2xl border border-dashed bg-white p-10 text-center text-gray-500">
          No tasks match your filters.
        </div>
      </ng-template>
    </div>
  `,
})
export class TasksPage {
  private store = inject(Store);
  private fb = inject(FormBuilder).nonNullable;

  // Create form
  form = this.fb.group({ title: ['', Validators.required] });

  // Filters & sorting
  filterForm = this.fb.group({
    q: this.fb.control<string>(''),
    status: this.fb.control<'all' | Status>('all'),
    category: this.fb.control<string>('all'),
    sortBy: this.fb.control<'createdAt' | 'title' | 'status'>('createdAt'),
    sortDir: this.fb.control<'asc' | 'desc'>('desc'),
  });

  // Data from store
  tasks = toSignal(this.store.select(selectAllTasks), { initialValue: [] as Task[] });
  loading = toSignal(this.store.select(selectTasksLoading), { initialValue: false });

  // UI helpers for badges
  statusClass = (s: Status) =>
    ({
      todo: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      done: 'bg-green-100 text-green-700',
    }[s]);

  labelForStatus = (s: Status) =>
    ({ todo: 'To do', in_progress: 'In progress', done: 'Done' }[s]);

  categoryClass = (c?: string) =>
    c && c.trim()
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : 'bg-slate-50 text-slate-600 border-slate-200';

  // Unique categories for filter dropdown
  categories = computed(() => {
    const set = new Set<string | undefined>();
    for (const t of this.tasks()) set.add(t.category ?? '');
    return Array.from(set.values());
  });

  // Group toggle
  groupByCategory = signal(false);
  toggleGroup(e: Event) { this.groupByCategory.set((e.target as HTMLInputElement).checked); }

  constructor() {
    this.store.dispatch(A.load());
  }

  // Filtered + sorted list
  visible = computed<Task[]>(() => {
    const list = this.tasks();
    const { q, status, category, sortBy, sortDir } = this.filterForm.getRawValue();

    const qlc = (q ?? '').trim().toLowerCase();

    let filtered = list.filter(t => {
      const okStatus = status === 'all' ? true : (t.status as any) === status;
      const okCategory = category === 'all' ? true : (t.category ?? '') === category;
      const hay = `${t.title ?? ''} ${t.description ?? ''} ${t.category ?? ''}`.toLowerCase();
      const okQ = !qlc || hay.includes(qlc);
      return okStatus && okCategory && okQ;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    filtered = filtered.slice().sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortBy === 'status') return (a.status ?? '').localeCompare(b.status ?? '') * dir;
      const da = a['createdAt'] ? new Date(a['createdAt'] as any).getTime() : 0;
      const db = b['createdAt'] ? new Date(b['createdAt'] as any).getTime() : 0;
      return (da - db) * dir;
    });

    return filtered;
  });

  // Grouped view
  groupedTasks = computed(() => {
    const groups = new Map<string, Task[]>();
    for (const t of this.visible()) {
      const key = t.category ?? '';
      if (!groups.has(key)) groups.set(key, []);
      const group = groups.get(key);
      if (group) {
        group.push(t);
      }
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, items]) => ({ category, items }));
  });

  // Actions
  add() {
    if (this.form.invalid) return;
    const { title } = this.form.getRawValue();
    this.store.dispatch(A.createTask({ dto: { title } }));
    this.form.reset();
  }

  mark(t: Task, status: Status) {
    this.store.dispatch(A.updateTask({ id: t.id, patch: { status } }));
  }

  setCategory(t: Task) {
    const next = prompt('Category for this task:', t.category ?? '');
    if (next === null) return;
    const patch: Partial<Task> = { category: next.trim() || undefined };
    this.store.dispatch(A.updateTask({ id: t.id, patch }));
  }

  remove(id: string) {
    this.store.dispatch(A.removeTask({ id }));
  }

  trackById = (_: number, t: Task) => t.id;
}
