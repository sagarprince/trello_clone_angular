import { Injectable } from '@angular/core';
import { AuthError, Session, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, SupabaseClient, User, createClient } from '@supabase/supabase-js';
import { Observable, catchError, from, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UtilitiesService } from './utilities.service';
import { Error } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public client: SupabaseClient;

  constructor(private utilitiesService: UtilitiesService) {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  public signIn(creds: SignInWithPasswordCredentials): Observable<any> {
    return from(this.client.auth.signInWithPassword(creds)).pipe(
      map((response) => {
        const { data, error } = response;
        if (error) {
          throw new Error(error.status || 0, error.message);
        }
        return data;
      }),
      catchError((error) => {
        this.utilitiesService.showSnackBar(error.message);
        return throwError(() => error);
      })
    );
  }

  public signUp(creds: SignUpWithPasswordCredentials): Observable<{
    user: User | null
    session: Session | null
  }> {
    return from(this.client.auth.signUp(creds)).pipe(
      map((response) => {
        const { data, error } = response;
        if (error) {
          throw new Error(error.status || 0, error.message);
        }
        return data;
      }),
      catchError((error) => {
        this.utilitiesService.showSnackBar(error.message);
        return throwError(() => error);
      })
    );
  }

  public logout(): Observable<{ error: AuthError | null }> {
    return from(this.client.auth.signOut()).pipe(
      catchError((error) => {
        this.utilitiesService.showSnackBar(error.message);
        return throwError(() => error);
      })
    );
  }

  public getUserById(userId: any): Observable<any> {
    return from(this.client.auth.admin.getUserById(userId));
  }

  public get({ table, query = '*', matchQuery = {}, singal = false, filters = [], handleError = true }: {
    table: string;
    query?: string;
    matchQuery?: any;
    singal?: boolean,
    filters?: Array<{ operator: any; key: string; value: any }>,
    handleError?: boolean;
  }): Observable<any> {
    let selectQuery = this.client.from(table).select(query);
    if (Object.keys(matchQuery).length > 0) {
      selectQuery = selectQuery.match(matchQuery);
    }
    if (filters.length > 0) {
      filters.forEach((filter) => {
        if (filter.operator === 'eq') {
          selectQuery = selectQuery.eq(filter.key, filter.value);
        }
        if (filter.operator === 'neq') {
          selectQuery = selectQuery.neq(filter.key, filter.value);
        }
        if (filter.operator === 'in') {
          selectQuery = selectQuery.in(filter.key, filter.value);
        }
      });
    }
    return from(singal ? selectQuery.single() : selectQuery).pipe(
      map((response) => {
        const { data, error } = response;
        if (error) {
          throw new Error(error.code || 0, error.message);
        }
        return data;
      }),
      catchError((error) => {
        handleError && this.utilitiesService.showSnackBar(error.message);
        return throwError(() => error);
      })
    );
  }

  public insert({ table, values = {} }: { table: string; values: any; }): Observable<any> {
    return from(this.client.from(table)
      .insert(values)
      .select('*')
      .single()
    ).pipe(
      map((response) => {
        const { data, error } = response;
        if (error) {
          throw new Error(error.code || 0, error.message);
        }
        return data;
      }),
      catchError((error) => {
        this.utilitiesService.showSnackBar(error.message);
        return throwError(() => error);
      })
    );
  }

  public update({ table, values = {}, equality = { key: '', value: '' } }: { table: string; values: any; equality: { key: string, value: any } }): Observable<any> {
    return from(
      this.client.from(table)
        .update(values)
        .eq(equality.key, equality.value)
        .select('*')
        .single()
    ).pipe(
      map((response) => {
        const { data, error } = response;
        if (error) {
          throw new Error(error.code || 0, error.message);
        }
        return data;
      }),
      catchError((error) => {
        this.utilitiesService.showSnackBar(error.message);
        return throwError(() => error);
      })
    );
  }

  public upsert({ table, values = {} }: { table: string; values: any }): Observable<any> {
    return from(
      this.client.from(table)
        .upsert(values)
        .select('*')
    ).pipe(
      map((response) => {
        const { data, error } = response;
        if (error) {
          throw new Error(error.code || 0, error.message);
        }
        return data;
      }),
      catchError((error) => {
        this.utilitiesService.showSnackBar(error.message);
        return throwError(() => error);
      })
    );
  }

  public delete({ table, equality = { key: '', value: '' } }: { table: string; equality: { key: string, value: any } }): Observable<any> {
    return from(
      this.client.from(table)
        .delete()
        .eq(equality.key, equality.value)
    ).pipe(
      map((response) => {
        const { data, error } = response;
        if (error) {
          throw new Error(error.code || 0, error.message);
        }
        return data;
      }),
      catchError((error) => {
        this.utilitiesService.showSnackBar(error.message);
        return throwError(() => error);
      })
    );
  }
}
