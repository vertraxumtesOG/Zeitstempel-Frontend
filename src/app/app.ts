import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <router-outlet></router-outlet>
    <ng-container *ngComponentOutlet="FooterComponent"></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  FooterComponent = FooterComponent;
}
