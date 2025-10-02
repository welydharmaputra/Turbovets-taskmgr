import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { jwtInterceptorFn } from './app/core/auth/jwt.interceptor';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { reducers } from './app/store';
import { AuthEffects } from './app/store/auth/auth.effects';
import { TasksEffects } from './app/store/tasks/tasks.effects';
import { environment } from './environments/environment';

// import { appConfig } from './app/app.config';
// import { App } from './app/app';

// bootstrapApplication(App, appConfig).catch((err) => console.error(err));

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([jwtInterceptorFn])),
    provideRouter(appRoutes),

    // NgRx (root)
    provideStore(reducers),
    provideEffects([AuthEffects, TasksEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
  ],
}).catch(console.error);
