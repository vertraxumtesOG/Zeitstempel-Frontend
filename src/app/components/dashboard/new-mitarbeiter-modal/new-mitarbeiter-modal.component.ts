import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShModelComponent } from '../../shared/sh-model/sh-model.component';
import { ShButtonComponent } from '../../shared/sh-button/sh-button.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-new-mitarbeiter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ShModelComponent, ShButtonComponent],
  templateUrl: './new-mitarbeiter-modal.component.html',
  styleUrl: './new-mitarbeiter-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewMitarbeiterModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private apiService = inject(ApiService);

  firstName = '';
  lastName = '';
  uid = '';

  isLoading = signal(false);
  errorMsg = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.firstName = '';
      this.lastName = '';
      this.uid = '';
      this.errorMsg.set('');
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    const uidNum = Number(this.uid);
    if (!this.firstName.trim() || !this.lastName.trim() || !this.uid.trim() || isNaN(uidNum)) {
      this.errorMsg.set('Bitte alle Felder korrekt ausfüllen.');
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.apiService.postMitarbeiter(this.firstName.trim(), this.lastName.trim(), uidNum).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.saved.emit();
        this.close.emit();
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMsg.set('Fehler beim Speichern. Bitte erneut versuchen.');
      },
    });
  }
}
