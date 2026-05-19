import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'sh-navbar',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './sh-navbar.component.html',
  styleUrl: './sh-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShNavbarComponent {
  title = input.required<string>();
  variant = input<'glass' | 'solid'>('glass');
  align = input<'left' | 'center'>('left');
  maxWidth = input<number>(900);
  logoWidth = input<number>(40);
  logoHeight = input<number>(40);
  logoAlt = input<string>('Zeitstempel Logo');
}
