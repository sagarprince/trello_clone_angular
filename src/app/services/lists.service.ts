import { Injectable, signal } from '@angular/core';
import { List } from '../models/list.model';
import { SupabaseService } from './supabase.service';

const LISTS_TABLE = 'lists';

@Injectable({
  providedIn: 'root'
})
export class ListsService {

  public lists = signal<List[]>([]);
  public isLoading = signal<boolean>(false);
  public isCRUDLoading = signal<boolean>(false);

  public isCreateNewList = signal<boolean>(false);

  constructor(private supabaseService: SupabaseService) { }

  async getBoardLists(boardId: any) {
    this.isLoading.set(true);
    try {
      const result = await this.supabaseService.client.from(LISTS_TABLE)
        .select('*').eq('board_id', boardId);
      console.log(result.data);
      this.lists.set(result.data as List[]);
    } catch (err) {
      console.log(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createList(boardId: any, title: string) {
    this.isCRUDLoading.set(true);
    try {
      const result = await this.supabaseService.client.from(LISTS_TABLE)
        .insert({ title, 'board_id': boardId })
        .select('*').single();
      this.lists.update((value) => {
        return [...value, result.data as List];
      });
    } catch (err) {
      console.log(err);
    } finally {
      this.isCRUDLoading.set(false);
    }
  }

  async updateList(listId: any, title: string) {
    this.isCRUDLoading.set(true);
    const i = this.lists().findIndex((list) => list.id === listId);
    this.lists.mutate(value => {
      value[i].isLoading = true;
    });
    try {
      await this.supabaseService.client.from(LISTS_TABLE)
        .update({ title })
        .eq('id', listId)
        .select('*').single();
      this.lists.mutate(value => {
        value[i].title = title;
      });
    } catch (err) {
      console.log(err);
    } finally {
      this.isCRUDLoading.set(false);
      this.lists.mutate(value => {
        value[i].isLoading = false;
      });
    }
  }

  async deleteList(listId: any) {
    this.isCRUDLoading.set(true);
    const i = this.lists().findIndex((list) => list.id === listId);
    try {
      this.lists.mutate(value => {
        value[i].isLoading = true;
      });
      const { error } = await this.supabaseService.client.from(LISTS_TABLE)
        .delete()
        .eq('id', listId);
      if (!error) {
        const lists = this.lists();
        this.lists.set(lists.filter((list) => list.id !== listId));
      } else {
        this.lists().length > 0 && this.lists.mutate(value => {
          value[i].isLoading = false;
        });
      }
    } catch (err) {
      console.log(err);
      this.lists().length > 0 && this.lists.mutate(value => {
        value[i].isLoading = false;
      });
    } finally {
      this.isCRUDLoading.set(false);
    }
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
