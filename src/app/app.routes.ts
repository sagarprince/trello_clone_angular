import { Routes } from '@angular/router';
import { SignInComponent } from './components/authentication/sign-in/sign-in.component';
import { SignUpComponent } from './components/authentication/sign-up/sign-up.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in', 
    pathMatch: 'full'
  },
  { 
    path: 'sign-in', 
    component: SignInComponent,
    data: {
      isAuthenticationPage: true
    },
    canActivate: [
      authGuard
    ]
  },
  { 
    path: 'sign-up', 
    component: SignUpComponent,
    data: {
      isAuthenticationPage: true
    },
    canActivate: [
      authGuard
    ]
  },
  { 
    path: 'dashboard', 
    loadChildren: () => import('./components/admin/admin.routes').then(mod => mod.ADMIN_ROUTES),
    canActivate: [
      authGuard
    ]
  }
];
