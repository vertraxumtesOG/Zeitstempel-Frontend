import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { getStatistics, getLogins } from '../../../lib/demo-data';
import { TimeLogModalComponent } from '../time-log/time-log-modal/time-log-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TimeLogModalComponent],
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
    return logins.length > 0 ? { loggedIn: logins[0].loggedIn, time: logins[0].time } : null;
  });

  statistics = computed(() => {
    const userId = this.userId();
    return userId ? getStatistics(userId) : null;
  });

  recentLogins = computed(() => {
    const userId = this.userId();
    return userId ? getLogins(userId).slice(0, 5) : [];
  });

  showLogModal = signal(false);

  openLogModal(): void {
    this.showLogModal.set(true);
  }

  closeLogModal(): void {
    this.showLogModal.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}