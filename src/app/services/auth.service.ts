import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap, map, catchError } from 'rxjs';
import { ApiService } from './api.service';

interface AuthState {
  userId: number | null;
  userUid: number | null;
  userName: string | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = signal<AuthState>({
    userId: null,
    userUid: null,
    userName: null,
    isAuthenticated: false,
  });

  authState$ = this.authState.asReadonly();

  private router = inject(Router);
  private apiService = inject(ApiService);

  constructor() {
    this.restoreSession();
  }

  login(uid: number): Observable<boolean> {
    return this.apiService.postLogin(uid).pipe(
      switchMap((response) =>
        this.apiService.getMitarbeiter().pipe(
          map((employees) => {
            const emp = employees.find((e) => e.uid === response.user_id);
            console.log(response.user_id, employees)
            if (emp) {
              const state: AuthState = {
                userId: emp.id,
                userUid: emp.uid,
                userName: `${emp.firstName} ${emp.lastName}`,
                isAuthenticated: true,
              };
              this.authState.set(state);
              localStorage.setItem('zeitstempel_auth', JSON.stringify(state));
              this.router.navigate(['/dashboard']);
              return true;
            }
            return false;
          }),
        ),
      ),
      catchError(() => of(false)),
    );
  }

  logout(): void {
    this.authState.set({
      userId: null,
      userUid: null,
      userName: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('zeitstempel_auth');
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  getUserId(): number | null {
    return this.authState().userId;
  }

  getUserUid(): number | null {
    return this.authState().userUid;
  }

  getUserName(): string | null {
    return this.authState().userName;
  }

  private restoreSession(): void {
    const stored = localStorage.getItem('zeitstempel_auth');
    if (stored) {
      try {
        const raw = JSON.parse(stored) as AuthState;
        const state: AuthState = { ...raw, userUid: raw.userUid ?? null };
        this.authState.set(state);
      } catch {
        localStorage.removeItem('zeitstempel_auth');
      }
    }
  }
}
