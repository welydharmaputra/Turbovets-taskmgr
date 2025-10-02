import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <form class="bg-white p-8 rounded-2xl shadow w-full max-w-sm space-y-4"
            [formGroup]="form" (ngSubmit)="submit()">
        <h1 class="text-xl font-semibold text-center">Sign in</h1>

        <input class="w-full border rounded-xl px-3 py-2"
               type="email" placeholder="Email" formControlName="email" />
        <input class="w-full border rounded-xl px-3 py-2"
               type="password" placeholder="Password" formControlName="password" />

        <button class="w-full py-2 rounded-xl bg-black text-white"
                [disabled]="form.invalid">Login</button>
      </form>
    </div>
  `,
})
export class LoginComponent {
  // Use the nonNullable builder so controls are `string` not `string | null`
  private fb = inject(FormBuilder).nonNullable;
  private store = inject(Store);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue(); // strongly typed strings
    this.store.dispatch(AuthActions.login({ email, password }));
  }
}
