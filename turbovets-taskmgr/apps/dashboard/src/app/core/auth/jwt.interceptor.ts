import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const jwtInterceptorFn: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenService);
  const router = inject(Router);
  const token = tokens.get();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) { tokens.clear(); router.navigateByUrl('/login'); }
      return throwError(() => err);
    })
  );
};
