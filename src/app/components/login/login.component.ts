import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShButtonComponent } from '../shared/sh-button/sh-button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ShButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  uid = signal('');
  error = signal('');

  private authService = inject(AuthService);

  handleLogin(): void {
    if (!this.uid()) return;

    const uidNumber = parseInt(this.uid(), 10);
    if (isNaN(uidNumber)) {
      this.error.set('Bitte eine gültige UID eingeben');
      return;
    }

    if (this.authService.login(uidNumber)) {
      this.error.set('');
    } else {
      this.error.set('Chip-UID nicht gefunden');
      this.uid.set('');
    }
  }
}
