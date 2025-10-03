import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectAuthError, selectAuthLoading } from '../../store/auth/auth.reducer'; // or from a selectors file

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <form class="bg-white p-8 rounded-2xl shadow w-full max-w-sm space-y-4"
            [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1 class="text-xl font-semibold text-center">Sign in</h1>

        <!-- Error banner -->
        <p *ngIf="error()" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2" aria-live="polite">
          {{ error() }}
        </p>

        <input class="w-full border rounded-xl px-3 py-2"
               type="email" placeholder="Email" formControlName="email" />
        <input class="w-full border rounded-xl px-3 py-2"
               type="password" placeholder="Password" formControlName="password" />

        <button class="w-full py-2 rounded-xl bg-black text-white disabled:opacity-60"
                [disabled]="form.invalid || loading()">
          {{ loading() ? 'Signing in…' : 'Login' }}
        </button>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder).nonNullable;
  private store = inject(Store);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Select error/loading from the store as signals
  error   = toSignal(this.store.select(selectAuthError),   { initialValue: null as string | null });
  loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });

  submit() {
    if (this.form.invalid || this.loading()) return;
    const { email, password } = this.form.getRawValue();
    this.store.dispatch(AuthActions.login({ email, password }));
  }
}
