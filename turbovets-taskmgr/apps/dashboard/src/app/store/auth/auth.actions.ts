import { createAction, props } from '@ngrx/store';
import { HttpErrorResponse } from '@angular/common/http';

export const login         = createAction('[Auth] Login',         props<{ email: string; password: string }>());
export const loginSuccess  = createAction('[Auth] Login Success', props<{ token: string }>());
export const loginFailure  = createAction('[Auth] Login Failure', props<{ error: HttpErrorResponse }>());
export const logout        = createAction('[Auth] Logout');
