// apps/dashboard/src/app/store/auth/auth.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';

import * as AuthActions from './auth.actions';
import { AuthApi } from '../../core/api/auth.api';
import { TokenService } from '../../core/auth/token.service';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(AuthApi);
  private readonly tokens = inject(TokenService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.api.login({ email, password }).pipe(
          map(res => AuthActions.loginSuccess({ token: res.access_token })),
          catchError(err =>
            of(AuthActions.loginFailure({
              error: err?.error?.message ?? 'Invalid email or password'
            }))
          )
        )
      )
    )
  );

  persist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ token }) => {
          this.tokens.set(token);
          this.router.navigateByUrl('/tasks');
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.tokens.clear();
          this.router.navigateByUrl('/login');
        })
      ),
    { dispatch: false }
  );
}
