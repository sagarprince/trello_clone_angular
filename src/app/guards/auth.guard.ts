import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
class AuthGuardService {
  canActivate(authService: AuthService, router: Router, isAuthenticationPage: boolean = false): Observable<boolean | UrlTree> {
    return authService.currentUser.pipe(
      filter((val) => val !== null),
      take(1),
      map((user: User) => {
        if (user) {
          if (isAuthenticationPage) {
            return router.createUrlTree(['/dashboard']);
          }
          return true;
        } else {
          if (isAuthenticationPage) {
            return true;
          }
          return router.createUrlTree(['/']);
        }
      })
    )
  }
}

export const authGuard: CanActivateFn = (route, _) => {
  const isAuthenticationPage = route.data['isAuthenticationPage'] || false;
  return inject(AuthGuardService).canActivate(inject(AuthService), inject(Router), isAuthenticationPage);
};
