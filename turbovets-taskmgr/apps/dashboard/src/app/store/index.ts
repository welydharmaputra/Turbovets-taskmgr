import { ActionReducerMap } from '@ngrx/store';
import * as fromAuth from './auth/auth.reducer';
import * as fromTasks from './tasks/tasks.reducer';

export interface AppState {
  auth: fromAuth.State;
  tasks: fromTasks.State;
}
export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.reducer,
  tasks: fromTasks.reducer
};
