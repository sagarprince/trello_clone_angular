import { Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, map, throwError } from 'rxjs';
import { List } from '../models/list.model';
import { SupabaseService } from './supabase.service';
import { UtilitiesService } from './utilities.service';

const LISTS_TABLE = 'lists';

@Injectable({
  providedIn: 'root'
})
export class ListsService {

  public lists = signal<List[]>([]);
  public isLoading = signal<boolean>(false);
  public isCRUDLoading = signal<boolean>(false);

  public isCreateNewList = signal<boolean>(false);

  constructor(private supabaseService: SupabaseService, private utilitiesService: UtilitiesService) { }

  public getBoardLists(boardId: any): Observable<any> {
    this.isLoading.set(true);
    return this.supabaseService.get({
      table: LISTS_TABLE,
      filters: [
        {
          operator: 'eq',
          key: 'board_id',
          value: boardId
        }
      ]
    }
    ).pipe(
      finalize(() => {
        this.isLoading.set(false);
      }),
      map((data) => {
        this.lists.set(data as List[]);
      })
    );
  }

  public createList(boardId: any, title: string): Observable<any> {
    this.isCRUDLoading.set(true);
    this.utilitiesService.showLoadingSnackBar();
    return this.supabaseService.insert({
      table: LISTS_TABLE,
      values: { title, 'board_id': boardId }
    }).pipe(
      finalize(() => {
        this.isCRUDLoading.set(false);
        this.utilitiesService.hideLoadingSnackBar();
      }),
      map((data) => {
        this.lists.update((value) => {
          return [...value, data as List];
        });
      })
    );
  }

  public updateList(listId: any, values: any, showSnackBar: boolean = true): Observable<any> {
    this.isCRUDLoading.set(true);
    showSnackBar && this.utilitiesService.showLoadingSnackBar();
    const i = this.lists().findIndex((list) => list.id === listId);
    this.lists.mutate(value => {
      value[i].isLoading = true;
    });
    return this.supabaseService.update({
      table: LISTS_TABLE,
      values,
      equality: { key: 'id', value: listId }
    }).pipe(
      finalize(() => {
        this.isCRUDLoading.set(false);
        showSnackBar && this.utilitiesService.hideLoadingSnackBar();
        this.lists.mutate(value => {
          value[i].isLoading = false;
        });
      }),
      map(() => {
        Object.entries(values).forEach(([key, value]) => {
          this.lists.mutate((list: any) => {
            list[i][key] = value;
          });
        });
      })
    );
  }

  public deleteList(listId: any): Observable<any> {
    this.isCRUDLoading.set(true);
    const i = this.lists().findIndex((list) => list.id === listId);
    this.lists.mutate(value => {
      value[i].isLoading = true;
    });
    return this.supabaseService.delete({
      table: LISTS_TABLE,
      equality: { key: 'id', value: listId }
    }).pipe(
      finalize(() => {
        this.isCRUDLoading.set(false);
      }),
      map(() => {
        const lists = this.lists();
        this.lists.set(lists.filter((list) => list.id !== listId));
      }),
      catchError((error) => {
        this.lists.mutate(value => {
          value[i].isLoading = false;
        });
        return throwError(() => error);
      })
    );
  }

  toggleListEditable(listId: any): void {
    const i = this.lists().findIndex((list) => list.id === listId);
    this.lists.mutate(value => {
      value[i].isEditable = !value[i].isEditable;
    });
  }

  toggleCreateNewList(): void {
    this.isCreateNewList.update((value) => {
      return !value;
    });
  }
}
