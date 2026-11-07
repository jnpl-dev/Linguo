import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'translate',
    loadComponent: () => import('./pages/translate/translate.page').then((m) => m.TranslatePage),
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then((m) => m.HistoryPage),
  },
  {
    path: '',
    redirectTo: 'translate',
    pathMatch: 'full',
  },
];
