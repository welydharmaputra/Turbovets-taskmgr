// apps/dashboard/src/app/core/api/auth.api.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtClaims } from '@turbovets-taskmgr/data';

export interface LoginDto { email: string; password: string; }
export interface LoginResp { access_token: string; }

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  login(dto: LoginDto): Observable<LoginResp> {
    return this.http.post<LoginResp>(`${this.base}/auth/login`, dto);
  }

  me(): Observable<JwtClaims> {
    return this.http.get<JwtClaims>(`${this.base}/auth/me`);
  }
}
