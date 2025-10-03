/// <reference types="node" />
import 'zone.js/node';

import express, { Request, Response, NextFunction } from 'express';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

import { renderApplication, provideServerRendering } from '@angular/platform-server';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// App bits
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { jwtInterceptorFn } from './app/core/auth/jwt.interceptor';

// NgRx
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { reducers } from './app/store';
import { AuthEffects } from './app/store/auth/auth.effects';
import { TasksEffects } from './app/store/tasks/tasks.effects';

export default function app() {
  const server = express();

  const distFolder = join(process.cwd(), 'dist/apps/dashboard/browser');
  const indexHtml  = join(distFolder, 'index.html');
  const document   = readFileSync(indexHtml, 'utf-8');   // <-- read HTML for renderApplication

  // Serve static assets
  server.use(express.static(distFolder, { maxAge: '1y', index: false }));

  // Catch-all SSR route
  server.get('*', async (req: Request, res: Response, next1: NextFunction) => {
    try {
      const html: string = await renderApplication(
        // Pass a bootstrap function (takes BootstrapContext)
        (context) =>
          bootstrapApplication(
            AppComponent,
            {
              providers: [
                provideServerRendering(),
                provideRouter(appRoutes),
                provideHttpClient(withInterceptors([jwtInterceptorFn])),
                provideStore(reducers),
                provideEffects([AuthEffects, TasksEffects]),
              ],
            },
            context
          ),
        {
          //  renderApplication expects 'document', not 'documentFilePath'
          document,
          url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
          // platformProviders?: [...]   // only if you need extra platform-level providers
        }
      );

      res.status(200).send(html);
    } catch (err) {
      next1(err);
    }
  });

  // Optional error handler
  server.use((err: unknown, _req: Request, res: Response) => {
  console.error(err);

  const isProd = process.env['NODE_ENV'] === 'production';
  const hasStack = typeof err === 'object' && err !== null && 'stack' in (err as Record<string, unknown>);
  const message = hasStack ? (isProd ? 'Server error' : String((err as { stack?: unknown }).stack)) : 'Server error';

  res.setHeader('Cache-Control', 'no-store');
  return res.status(500).type('text/plain').send(message);
});


  return server;
}
