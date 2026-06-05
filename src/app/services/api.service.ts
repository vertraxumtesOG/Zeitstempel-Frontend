import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface Mitarbeiter {
  id: number;
  firstName: string;
  lastName: string;
  uid: number;
}

export interface Login {
  id: number;
  userId: number;
  time: Date;
  loggedIn: boolean;
}

interface LoginResponse {
  status: string;
  user_id: number;
  logged_in: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api';

  getMitarbeiter(): Observable<Mitarbeiter[]> {
    return this.http.get<any[][]>(`${this.base}/mitarbeiter`).pipe(
      map((rows) =>
        rows.map(([id, firstName, lastName, uid]) => ({
          id,
          firstName,
          lastName,
          uid: Number(uid),
        })),
      ),
    );
  }

  getLoginsByUserId(userId: number): Observable<Login[]> {
    return this.http.get<any[][]>(`${this.base}/login`).pipe(
      map((rows) =>
        rows
          .map(([id, uId, time, loggedIn]) => ({
            id,
            userId: uId,
            time: new Date(time),
            loggedIn: Boolean(loggedIn),
          }))
          .filter((l) => l.userId === userId)
          .sort((a, b) => b.time.getTime() - a.time.getTime()),
      ),
      catchError(() => of([] as Login[])),
    );
  }

  postLogin(uid: number): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/valid_chip`, { uid });
  }
}
