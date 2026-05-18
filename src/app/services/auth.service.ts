import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getMitarbeiterByUid } from '../../lib/demo-data';

interface AuthState {
  userId: number | null;
  userName: string | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = signal<AuthState>({
    userId: null,
    userName: null,
    isAuthenticated: false,
  });

  authState$ = this.authState.asReadonly();

  constructor(private router: Router) {
    this.restoreSession();
  }

  login(uid: number): boolean {
    const mitarbeiter = getMitarbeiterByUid(uid);
    if (mitarbeiter) {
      const state: AuthState = {
        userId: mitarbeiter.id,
        userName: `${mitarbeiter.firstName} ${mitarbeiter.lastName}`,
        isAuthenticated: true,
      };
      this.authState.set(state);
      localStorage.setItem('zeitstempel_auth', JSON.stringify(state));
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }

  logout(): void {
    this.authState.set({
      userId: null,
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

  getUserName(): string | null {
    return this.authState().userName;
  }

  private restoreSession(): void {
    const stored = localStorage.getItem('zeitstempel_auth');
    if (stored) {
      try {
        const state = JSON.parse(stored) as AuthState;
        this.authState.set(state);
      } catch {
        localStorage.removeItem('zeitstempel_auth');
      }
    }
  }
}
