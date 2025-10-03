import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as A from './tasks.actions';
import { TasksApi } from '../../core/api/tasks.api';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class TasksEffects {
    private api = inject(TasksApi);
    private actions$ = inject(Actions);
    load$ = createEffect(() =>
        this.actions$.pipe(
        ofType(A.load),
        mergeMap(() => this.api.list().pipe(
            map(tasks => A.loadSuccess({ tasks })),
            catchError(error => of(A.loadFailure({ error })))
        ))
        )
    );

    create$ = createEffect(() =>
        this.actions$.pipe(
        ofType(A.createTask),
        mergeMap(({ dto }) => this.api.create(dto).pipe(
            map(task => A.createSuccess({ task })),
            catchError(error => of(A.createFailure({ error })))
        ))
        )
    );

    update$ = createEffect(() =>
        this.actions$.pipe(
        ofType(A.updateTask),
        mergeMap(({ id, patch }) => this.api.update(id, patch).pipe(
            map(task => A.updateSuccess({ task })),
            catchError(error => of(A.updateFailure({ error })))
        ))
        )
    );

    remove$ = createEffect(() =>
        this.actions$.pipe(
        ofType(A.removeTask),
        mergeMap(({ id }) => this.api.remove(id).pipe(
            map(() => A.removeSuccess({ id })),
            catchError(error => of(A.removeFailure({ error })))
        ))
        )
    );

}
