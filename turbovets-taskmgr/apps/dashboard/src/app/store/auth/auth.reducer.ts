import { createReducer, on, createFeatureSelector, createSelector } from '@ngrx/store';
import * as A from './auth.actions';
import { HttpErrorResponse } from '@angular/common/http';

export interface State {
  token: string | null;
  loading: boolean;
  error: string | HttpErrorResponse | null;
}
const initialState: State = { token: null, loading: false, error: null };

export const reducer = createReducer(
  initialState,
  on(A.login,      (s) => ({ ...s, loading: true,  error: null })),
  on(A.loginSuccess, (s, { token }) => ({ ...s, loading: false, token })),
  on(A.loginFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(A.logout, () => initialState)
);

// selectors (feature key must match your reducer map, e.g. 'auth')
export const selectAuthState   = createFeatureSelector<State>('auth');
export const selectAuthError   = createSelector(selectAuthState, s => s.error);
export const selectAuthLoading = createSelector(selectAuthState, s => s.loading);
