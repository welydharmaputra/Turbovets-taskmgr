// apps/dashboard/src/app/store/tasks/tasks.selectors.ts
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../index';
import { State, adapter } from './tasks.reducer';

// Either: feature selector by key (must match `reducers` key)
export const selectTasksState = createFeatureSelector<AppState, State>('tasks');

// Or: via AppState projector
// export const selectTasksState = (s: AppState) => s.tasks;

export const { selectAll: selectAllTasks } = adapter.getSelectors(selectTasksState);
