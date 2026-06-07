import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShModelComponent } from '../../shared/sh-model/sh-model.component';
import { Login } from '../../../services/api.service';

@Component({
  selector: 'app-time-log-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ShModelComponent],
  templateUrl: './time-log-modal.component.html',
  styleUrl: './time-log-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeLogModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() logins: Login[] = [];
  @Output() close = new EventEmitter<void>();

  private loginsSignal = signal<Login[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logins']) {
      this.loginsSignal.set(changes['logins'].currentValue ?? []);
    }
  }

  selectedMonth = signal('all');

  filteredLogins = computed(() => {
    const logins = this.loginsSignal();
    if (!logins.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const month = this.selectedMonth();

    if (month === 'all') return logins;

    if (month === 'current') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return logins.filter((l) => l.time >= monthStart);
    }

    if (month === 'last') {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      lastMonthEnd.setHours(23, 59, 59, 999);
      return logins.filter((l) => l.time >= lastMonthStart && l.time <= lastMonthEnd);
    }

    if (month === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      return logins.filter((l) => l.time >= weekStart);
    }

    return logins;
  });

  summary = computed(() => {
    const logins = this.filteredLogins();
    let totalMs = 0;

    for (let i = 0; i < logins.length; i++) {
      const entry = logins[i];
      if (!entry.loggedIn) {
        for (let j = i + 1; j < logins.length; j++) {
          if (logins[j].loggedIn) {
            totalMs += entry.time.getTime() - logins[j].time.getTime();
            break;
          }
        }
      }
    }

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

    return { totalEntries: logins.length, totalMs, totalHours: hours, totalMinutes: minutes };
  });

  getDurationSinceEntry(index: number): string {
    const logins = this.filteredLogins();
    const currentLogin = logins[index];

    if (currentLogin.loggedIn) return '-';

    for (let i = index + 1; i < logins.length; i++) {
      if (logins[i].loggedIn) {
        const durationMs = currentLogin.time.getTime() - logins[i].time.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      }
    }

    return '-';
  }

  onClose(): void {
    this.selectedMonth.set('all');
    this.close.emit();
  }
}
