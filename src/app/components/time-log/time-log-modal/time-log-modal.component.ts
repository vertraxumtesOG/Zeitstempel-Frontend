import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getLogins } from '../../../../lib/demo-data';

@Component({
  selector: 'app-time-log-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-log-modal.component.html',
  styleUrl: './time-log-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeLogModalComponent {
  @Input() isOpen = false;
  @Input() userId: number | null = null;
  @Output() close = new EventEmitter<void>();

  isClosing = signal(false);

  selectedMonth = signal('all');

  filteredLogins = computed(() => {
    const userId = this.userId;
    if (!userId) return [];

    const logins = getLogins(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const month = this.selectedMonth();

    if (month === 'all') return logins;

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

  onClose(): void {
    this.selectedMonth.set('all');
    // start close animation, emit close after animation completes
    if (!this.isClosing()) {
      this.isClosing.set(true);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onAnimationEnd(event: AnimationEvent): void {
    // only act when closing animation finished
    const name = event.animationName || '';
    if (this.isClosing() && (name === 'fadeOut' || name === 'fadeOutUp')) {
      this.isClosing.set(false);
      this.close.emit();
    }
  }
}
