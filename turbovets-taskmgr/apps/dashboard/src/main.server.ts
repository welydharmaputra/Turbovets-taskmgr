// apps/dashboard/src/main.server.ts
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
// import { BootstrapContext /*, REQUEST, RESPONSE */ } from '@angular/ssr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { jwtInterceptorFn } from './app/core/auth/jwt.interceptor';

// NgRx
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { reducers } from './app/store';
import { AuthEffects } from './app/store/auth/auth.effects';
import { TasksEffects } from './app/store/tasks/tasks.effects';

/**
 * SSR bootstrap — Angular will call this with a BootstrapContext.
 * Passing the `context` is required on the server.
 */
export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(
    AppComponent,
    {
      providers: [
        provideServerRendering(),                                // server platform
        provideHttpClient(withInterceptors([jwtInterceptorFn])),
        provideRouter(appRoutes),

        // NgRx on the server too
        provideStore(reducers),
        provideEffects([AuthEffects, TasksEffects]),

        // Optional: request-scoped providers
        // { provide: REQUEST,  useValue: context.request },
        // { provide: RESPONSE, useValue: context.response },
      ],
    },
    context
  );
}
