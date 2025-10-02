// apps/dashboard/src/app/store/tasks/tasks.actions.ts
import { createAction, props } from '@ngrx/store';
import { Task, CreateTaskDto } from '../../core/api/tasks.api';

export interface ApiError { message: string; status?: number; }

export const load         = createAction('[Tasks] Load');
export const loadSuccess  = createAction('[Tasks] Load Success',  props<{ tasks: Task[] }>());
export const loadFailure  = createAction('[Tasks] Load Failure',  props<{ error: ApiError }>());

export const createTask   = createAction('[Tasks] Create',        props<{ dto: CreateTaskDto }>());
export const createSuccess= createAction('[Tasks] Create Success',props<{ task: Task }>());
export const createFailure= createAction('[Tasks] Create Failure',props<{ error: ApiError }>());

export const updateTask   = createAction('[Tasks] Update',        props<{ id: string; patch: Partial<Task> }>());
export const updateSuccess= createAction('[Tasks] Update Success',props<{ task: Task }>());
export const updateFailure= createAction('[Tasks] Update Failure',props<{ error: ApiError }>());

export const removeTask   = createAction('[Tasks] Remove',        props<{ id: string }>());
export const removeSuccess= createAction('[Tasks] Remove Success',props<{ id: string }>());
export const removeFailure= createAction('[Tasks] Remove Failure',props<{ error: ApiError }>());
