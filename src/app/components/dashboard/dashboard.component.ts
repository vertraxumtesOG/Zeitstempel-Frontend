import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, combineLatest, map } from 'rxjs';
import { ShButtonComponent } from '../shared/sh-button/sh-button.component';
import { ShNavbarComponent } from '../shared/sh-navbar/sh-navbar.component';
import { AuthService } from '../../services/auth.service';
import { ApiService, Login } from '../../services/api.service';
import { TimeLogModalComponent } from './time-log-modal/time-log-modal.component';

type StatsFilter = 'all' | 'current' | 'last' | 'week';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TimeLogModalComponent, ShButtonComponent, ShNavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  userName = this.authService.authState$;

  private userId = computed(() => this.authService.getUserId());
  private refreshTrigger = signal(0);

  isStempelnLoading = signal(false);

  // Resolves the uid from auth state; falls back to the API for old sessions without stored uid
  private effectiveUid = toSignal(
    combineLatest([
      toObservable(computed(() => this.authService.getUserId())),
      toObservable(computed(() => this.authService.getUserUid())),
    ]).pipe(
      switchMap(([userId, userUid]) => {
        if (userUid != null) return of(userUid);
        if (userId == null) return of(null as number | null);
        return this.apiService
          .getMitarbeiter()
          .pipe(map((employees) => employees.find((e) => e.id === userId)?.uid ?? null));
      }),
    ),
    { initialValue: null as number | null },
  );

  allLogins = toSignal(
    combineLatest([toObservable(this.userId), toObservable(this.refreshTrigger)]).pipe(
      switchMap(([id]) => (id ? this.apiService.getLoginsByUserId(id) : of([] as Login[]))),
    ),
    { initialValue: [] as Login[] },
  );

  currentStatus = computed(() => {
    const logins = this.allLogins();
    return logins.length > 0 ? { loggedIn: logins[0].loggedIn, time: logins[0].time } : null;
  });

  statistics = computed(() => this.calculateStatistics(this.allLogins()));

  recentLogins = computed(() => this.allLogins().slice(0, 5));

  statsFilter = signal<StatsFilter>('all');

  allTimeStats = computed(() => {
    const emptyStats = {
      totalHours: 0,
      totalWorkDays: 0,
      avgHoursPerDay: 0,
      firstEntry: null as Date | null,
      lastEntry: null as Date | null,
    };

    const logins = this.allLogins();
    if (!logins.length) return emptyStats;

    const filter = this.statsFilter();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = logins;

    if (filter === 'current') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = logins.filter((l) => l.time >= monthStart);
    } else if (filter === 'last') {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      lastMonthEnd.setHours(23, 59, 59, 999);
      filtered = logins.filter((l) => l.time >= lastMonthStart && l.time <= lastMonthEnd);
    } else if (filter === 'week') {
      const weekStart = new Date(today);
      const dow = today.getDay();
      weekStart.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
      filtered = logins.filter((l) => l.time >= weekStart);
    }

    if (!filtered.length) return emptyStats;

    const sorted = [...filtered].sort((a, b) => a.time.getTime() - b.time.getTime());

    let totalMinutes = 0;
    let inTime: Date | null = null;

    for (const login of sorted) {
      if (login.loggedIn) {
        inTime = login.time;
      } else if (inTime) {
        totalMinutes += (login.time.getTime() - inTime.getTime()) / (1000 * 60);
        inTime = null;
      }
    }

    const dayKeys = new Set(
      sorted.map((l) => `${l.time.getFullYear()}-${l.time.getMonth()}-${l.time.getDate()}`),
    );

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const totalWorkDays = dayKeys.size;

    return {
      totalHours,
      totalWorkDays,
      avgHoursPerDay: totalWorkDays > 0 ? Math.round((totalHours / totalWorkDays) * 10) / 10 : 0,
      firstEntry: sorted[0]?.time ?? null,
      lastEntry: sorted[sorted.length - 1]?.time ?? null,
    };
  });

  showLogModal = signal(false);

  openLogModal(): void {
    this.showLogModal.set(true);
  }

  closeLogModal(): void {
    this.showLogModal.set(false);
  }

  setStatsFilter(filter: StatsFilter): void {
    this.statsFilter.set(filter);
  }

  stempeln(): void {
    const uid = this.effectiveUid();
    if (uid == null || this.isStempelnLoading()) return;

    this.isStempelnLoading.set(true);
    this.apiService.postStempelzeit(uid).subscribe({
      next: () => {
        this.refreshTrigger.update((v) => v + 1);
        this.isStempelnLoading.set(false);
      },
      error: () => {
        this.isStempelnLoading.set(false);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private calculateStatistics(logins: Login[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    const dow = today.getDay();
    weekStart.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const calcHours = (from: Date, to: Date): number => {
      let totalMinutes = 0;
      let inTime: Date | null = null;

      const slice = logins
        .filter((l) => l.time >= from && l.time <= to)
        .sort((a, b) => a.time.getTime() - b.time.getTime());

      for (const l of slice) {
        if (l.loggedIn) {
          inTime = l.time;
        } else if (inTime) {
          totalMinutes += (l.time.getTime() - inTime.getTime()) / (1000 * 60);
          inTime = null;
        }
      }

      return Math.round((totalMinutes / 60) * 10) / 10;
    };

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const endOfWeek = new Date(weekStart);
    endOfWeek.setDate(weekStart.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const endOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return {
      hoursToday: calcHours(today, endOfToday),
      hoursThisWeek: calcHours(weekStart, endOfWeek),
      hoursThisMonth: calcHours(monthStart, endOfMonth),
    };
  }
}
