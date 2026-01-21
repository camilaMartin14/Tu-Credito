import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login').then(m => m.Login) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./auth/register/register').then(m => m.Register) 
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./profile/profile').then(m => m.Profile) 
      },
      { 
        path: 'loans', 
        loadComponent: () => import('./loans/loans-list/loans-list.component').then(m => m.LoansListComponent) 
      },
      { 
        path: 'clients', 
        loadComponent: () => import('./borrowers/borrowers-list/borrowers-list.component').then(m => m.BorrowersListComponent) 
      },
      { 
        path: 'clients/new', 
        loadComponent: () => import('./borrowers/borrower-form/borrower-form.component').then(m => m.BorrowerFormComponent) 
      },
      { 
        path: 'clients/edit/:id', 
        loadComponent: () => import('./borrowers/borrower-form/borrower-form.component').then(m => m.BorrowerFormComponent) 
      },
      { 
        path: 'payments', 
        loadComponent: () => import('./payments/payments-list/payments-list.component').then(m => m.PaymentsListComponent) 
      },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
