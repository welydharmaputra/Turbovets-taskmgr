import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const KEY = 'jwt';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private platformId = inject(PLATFORM_ID);

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  get(): string | null {
    return this.storage?.getItem(KEY) ?? null;
  }

  set(token: string) {
    console.log('Setting token', token);
    this.storage?.setItem(KEY, token);
  }

  clear() {
    this.storage?.removeItem(KEY);
  }

  get isAuthenticated(): boolean {
    return !!this.get();
  }
}
