import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { TokenService } from './core/auth/token.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  host: { class: 'block min-h-screen bg-gray-50' },
  template: `
    <header class="sticky top-0 bg-white/80 backdrop-blur border-b">
      <nav class="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <a routerLink="/" class="font-semibold">TurboVets</a>

        <div class="flex items-center gap-3 text-sm">
          <a routerLink="/tasks" routerLinkActive="underline" class="hover:underline">Tasks</a>

          <ng-container *ngIf="tokens.isAuthenticated; else login">
            <button class="px-3 py-1 rounded-xl border" (click)="logout()">Logout</button>
          </ng-container>

          <ng-template #login>
            <a routerLink="/login" class="px-3 py-1 rounded-xl border">Login</a>
          </ng-template>
        </div>
      </nav>
    </header>

    <main class="max-w-5xl mx-auto p-4">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  public tokens = inject(TokenService);
  private router = inject(Router);

  logout(): void {
    this.tokens.clear();
    if (this.router.url !== '/login') this.router.navigateByUrl('/login');
  }
}
