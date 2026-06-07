import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sh-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sh-model.component.html',
  styleUrl: './sh-model.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShModelComponent implements OnDestroy {
  private _isOpen = false;
  visible = false;
  closing = false;

  @Input()
  set isOpen(value: boolean) {
    if (value) {
      this._isOpen = true;
      this.visible = true;
      this.closing = false;
      document.body.style.overflow = 'hidden';
    } else {
      this._isOpen = false;
      if (this.visible) {
        this.closing = true;
      }
    }
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

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

  onAnimationEnd(): void {
    if (this.closing) {
      this.visible = false;
      this.closing = false;
      document.body.style.overflow = '';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
