import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { getLogins } from '../../../../lib/demo-data';

@Component({
  selector: 'app-time-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-log.component.html',
  styleUrl: './time-log.component.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeLogComponent {
  private authService = inject(AuthService);
  selectedMonth = signal('all');

  userName = this.authService.authState$;
  private userId = computed(() => this.authService.getUserId());

  entryCount = computed(
    () => this.filteredLogins().filter((l) => l.loggedIn).length,
  );
  exitCount = computed(
    () => this.filteredLogins().filter((l) => !l.loggedIn).length,
  );

  filteredLogins = computed(() => {
    const userId = this.userId();
    if (!userId) return [];

    const logins = getLogins(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const month = this.selectedMonth();

    if (month === 'all') {
      return logins;
    }

    if (month === 'current') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return logins.filter((l) => l.time >= monthStart);
    }

    if (month === 'last') {
      const lastMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      lastMonthEnd.setHours(23, 59, 59, 999);
      return logins.filter(
        (l) => l.time >= lastMonthStart && l.time <= lastMonthEnd,
      );
    }

    if (month === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      return logins.filter((l) => l.time >= weekStart);
    }

    return logins;
  });

  totalHours = computed(() => {
    const logins = this.filteredLogins();
    let totalMinutes = 0;
    let inTime: Date | null = null;

    for (const login of logins) {
      if (login.loggedIn) {
        inTime = login.time;
      } else if (inTime) {
        totalMinutes += (login.time.getTime() - inTime.getTime()) / (1000 * 60);
        inTime = null;
      }
    }

    return Math.round((totalMinutes / 60) * 10) / 10;
  });

  getDurationSinceEntry(index: number): string {
    const logins = this.filteredLogins();
    const currentLogin = logins[index];

    if (currentLogin.loggedIn) {
      return '-';
    }

    for (let i = index + 1; i < logins.length; i++) {
      if (logins[i].loggedIn) {
        const durationMs =
          currentLogin.time.getTime() - logins[i].time.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        return `${hours}h ${minutes}m`;
      }
    }

    return '-';
  }

  goBack(): void {
    window.history.back();
  }
}
