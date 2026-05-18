import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sh-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sh-button.component.html',
  styleUrls: ['./sh-button.component.scss'],
})
export class ShButtonComponent {
  @Input() variant: 'primary' | 'outline' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() shClick = new EventEmitter<Event>();

  onClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    this.shClick.emit(event);
  }
}
