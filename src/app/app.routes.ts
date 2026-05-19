import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './services/auth.guard';
import { TimeLogComponent } from './components/dashboard/time-log/time-log.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  { path: 'time-log', component: TimeLogComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
