import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface State { token: string | null; loading: boolean; error?: unknown; }
export const initialState: State = { token: null, loading: false };

export const reducer = createReducer(
  initialState,
  on(AuthActions.login, state => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (s, { token }) => ({ ...s, token, loading: false })),
  on(AuthActions.loginFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(AuthActions.logout, () => initialState)
);
