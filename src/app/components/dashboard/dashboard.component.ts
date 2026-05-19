import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShButtonComponent } from '../shared/sh-button/sh-button.component';
import { AuthService } from '../../services/auth.service';
import { getStatistics, getLogins } from '../../../lib/demo-data';
import { TimeLogModalComponent } from './time-log/time-log-modal/time-log-modal.component';

type StatsFilter = 'all' | 'current' | 'last' | 'week';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TimeLogModalComponent, ShButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private authService = inject(AuthService);
  userName = this.authService.authState$;
  userId = computed(() => this.authService.getUserId());

  currentStatus = computed(() => {
    const userId = this.userId();
    if (!userId) return null;

    const logins = getLogins(userId);
    return logins.length > 0
      ? { loggedIn: logins[0].loggedIn, time: logins[0].time }
      : null;
  });

  statistics = computed(() => {
    const userId = this.userId();
    return userId ? getStatistics(userId) : null;
  });

  recentLogins = computed(() => {
    const userId = this.userId();
    return userId ? getLogins(userId).slice(0, 5) : [];
  });

  statsFilter = signal<StatsFilter>('all');

  allTimeStats = computed(() => {
    const emptyStats = {
      totalHours: 0,
      totalWorkDays: 0,
      avgHoursPerDay: 0,
      firstEntry: null as Date | null,
      lastEntry: null as Date | null,
    };

    const userId = this.userId();
    if (!userId) {
      return emptyStats;
    }

    const allLogins = getLogins(userId);
    const month = this.statsFilter();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let logins = allLogins;

    if (month === 'current') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      logins = allLogins.filter((login) => login.time >= monthStart);
    }

    if (month === 'last') {
      const lastMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      lastMonthEnd.setHours(23, 59, 59, 999);
      logins = allLogins.filter(
        (login) => login.time >= lastMonthStart && login.time <= lastMonthEnd,
      );
    }

    if (month === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      logins = allLogins.filter((login) => login.time >= weekStart);
    }

    if (!logins.length) {
      return emptyStats;
    }

    const sortedLogins = [...logins].sort(
      (a, b) => a.time.getTime() - b.time.getTime(),
    );

    let totalMinutes = 0;
    let inTime: Date | null = null;

    for (const login of sortedLogins) {
      if (login.loggedIn) {
        inTime = login.time;
        continue;
      }

      if (inTime) {
        totalMinutes += (login.time.getTime() - inTime.getTime()) / (1000 * 60);
        inTime = null;
      }
    }

    const dayKeys = new Set(
      sortedLogins.map((login) =>
        `${login.time.getFullYear()}-${login.time.getMonth()}-${login.time.getDate()}`,
      ),
    );

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const totalWorkDays = dayKeys.size;

    return {
      totalHours,
      totalWorkDays,
      avgHoursPerDay:
        totalWorkDays > 0 ? Math.round((totalHours / totalWorkDays) * 10) / 10 : 0,
      firstEntry: sortedLogins[0]?.time ?? null,
      lastEntry: sortedLogins[sortedLogins.length - 1]?.time ?? null,
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

  logout(): void {
    this.authService.logout();
  }
}
