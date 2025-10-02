import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private tokens = inject(TokenService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  canActivate(): boolean | UrlTree {
    // On the server, allow rendering (no localStorage / no client nav)
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    return this.tokens.isAuthenticated ? true : this.router.parseUrl('/login');
  }
}
