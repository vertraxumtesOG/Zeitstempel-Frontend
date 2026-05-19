import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sh-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sh-model.component.html',
  styleUrl: './sh-model.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShModelComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
