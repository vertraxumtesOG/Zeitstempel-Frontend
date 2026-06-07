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
import { LoginWithEmployee } from '../../../services/api.service';

@Component({
  selector: 'app-all-logs-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ShModelComponent],
  templateUrl: './all-logs-modal.component.html',
  styleUrl: './all-logs-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllLogsModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() logins: LoginWithEmployee[] = [];
  @Input() initialFilter: string = 'all';
  @Output() close = new EventEmitter<void>();

  private loginsSignal = signal<LoginWithEmployee[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logins']) {
      this.loginsSignal.set(changes['logins'].currentValue ?? []);
    }
    if (changes['isOpen']?.currentValue === true) {
      this.selectedMonth.set(this.initialFilter);
      this.selectedEmployee.set('all');
    }
  }

  selectedMonth = signal('all');
  selectedEmployee = signal('all');

  employees = computed(() => {
    const seen = new Set<number>();
    const result: { id: number; name: string }[] = [];
    for (const l of this.loginsSignal()) {
      if (!seen.has(l.userId)) {
        seen.add(l.userId);
        result.push({ id: l.userId, name: `${l.firstName} ${l.lastName}` });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  });

  filteredLogins = computed(() => {
    let logins = this.loginsSignal();
    if (!logins.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const month = this.selectedMonth();
    const employee = this.selectedEmployee();

    if (employee !== 'all') {
      logins = logins.filter((l) => String(l.userId) === employee);
    }

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
      const dow = today.getDay();
      weekStart.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
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
          if (logins[j].loggedIn && logins[j].userId === entry.userId) {
            totalMs += entry.time.getTime() - logins[j].time.getTime();
            break;
          }
        }
      }
    }

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

    return { totalEntries: logins.length, totalHours: hours, totalMinutes: minutes };
  });

  onClose(): void {
    this.close.emit();
  }
}
