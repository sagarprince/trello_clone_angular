import { Injectable, WritableSignal, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, catchError, finalize, from, map, throwError } from 'rxjs';
import { UtilitiesService } from './utilities.service';

const USERS_TABLE = 'users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser: BehaviorSubject<boolean | User | any> = new BehaviorSubject(null)

  public isLoading: WritableSignal<boolean> = signal(false);

  constructor(
    private supabaseService: SupabaseService,
    private utilitiesService: UtilitiesService
  ) {
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      if (session) {
        this._currentUser.next(session!.user);
      } else {
        this._currentUser.next(false);
      }
    });
  }

  public signIn(email: string, password: string): Observable<any> {
    this.utilitiesService.showLoadingSnackBar();
    this.isLoading.set(true);
    return this.supabaseService.signIn({ email, password }).pipe(
      finalize(() => {
        this.isLoading.set(false);
      }),
      map((data) => {
        this.utilitiesService.hideLoadingSnackBar();
        return data;
      })
    );
  }

  public signUp(email: string, password: string, userInfo: {
    firstName: string;
    lastName: string;
    profilePicUrl: string;
  }): Observable<{
    user: User | null
    session: Session | null
  }> {
    this.utilitiesService.showLoadingSnackBar();
    this.isLoading.set(true);
    return this.supabaseService.signUp({
      email: email,
      password: password,
      options: {
        data: {
          ...userInfo
        }
      }
    }).pipe(
      map((data) => {
        return data;
      })
    );
  }

  public addUser(userId: string | undefined, email: string, userInfo: {
    firstName: string;
    lastName: string;
    profilePicUrl: string;
  }): Observable<any> {
    return this.supabaseService.insert({
      table: USERS_TABLE,
      values: {
        id: userId,
        email,
        ...userInfo
      }
    }).pipe(
      finalize(() => {
        this.isLoading.set(false);
        this.utilitiesService.hideLoadingSnackBar();
      }),
    );
  }

  public logout(): Observable<{ error: AuthError | null }> {
    return this.supabaseService.logout();
  }

  get currentUser(): Observable<User> {
    return this._currentUser.asObservable()
  }
}
