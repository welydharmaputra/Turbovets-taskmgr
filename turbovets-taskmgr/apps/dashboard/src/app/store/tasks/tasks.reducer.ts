// apps/dashboard/src/app/store/tasks/tasks.reducer.ts
import { createReducer, on, createFeatureSelector, createSelector } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import * as Actions from './tasks.actions';
import { Task } from '../../core/api/tasks.api';

export const TASKS_FEATURE_KEY = 'tasks';

export interface State extends EntityState<Task> {
  loading: boolean;
  error: unknown | null;
}

export const adapter = createEntityAdapter<Task>({ selectId: (t) => t.id });

export const initialState: State = adapter.getInitialState({
  loading: false,
  error: null,
});

export const reducer = createReducer(
  initialState,

  // load
  on(Actions.load, (s) => ({ ...s, loading: true, error: null })),
  on(Actions.loadSuccess, (s, { tasks }) =>
    adapter.setAll(tasks, { ...s, loading: false, error: null })
  ),
  on(Actions.loadFailure, (s, { error }) => ({ ...s, loading: false, error })),

  // create
  on(Actions.createSuccess, (s, { task }) => adapter.addOne(task, { ...s, error: null })),
  on(Actions.createFailure, (s, { error }) => ({ ...s, error })),

  // update
  on(Actions.updateSuccess, (s, { task }) => adapter.upsertOne(task, { ...s, error: null })),
  on(Actions.updateFailure, (s, { error }) => ({ ...s, error })),

  // remove
  on(Actions.removeSuccess, (s, { id }) => adapter.removeOne(id, { ...s, error: null })),
  on(Actions.removeFailure, (s, { error }) => ({ ...s, error }))
);

/* -------------------- SELECTORS -------------------- */

// Feature selector matches the key in your ActionReducerMap: { tasks: reducer }
export const selectTasksState = createFeatureSelector<State>(TASKS_FEATURE_KEY);

// Adapter selectors, scoped to the feature slice
const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors();

export const selectAllTasks        = createSelector(selectTasksState, selectAll);
export const selectTaskEntities    = createSelector(selectTasksState, selectEntities);
export const selectTaskIds         = createSelector(selectTasksState, selectIds);
export const selectTaskTotal       = createSelector(selectTasksState, selectTotal);
export const selectTasksLoading    = createSelector(selectTasksState, (s) => s.loading);
export const selectTasksError      = createSelector(selectTasksState, (s) => s.error);
