import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Board } from '../models/board.model';

const BOARDS_TABLE = 'boards';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  boards = signal<Board[]>([]);
  loading = signal<boolean>(false);
  isCRUDLoading = signal<boolean>(false);
  private defaultColors: string[] = ['#4b16f9', '#4bbcc6', '#c43c67', '#69f4df', '#fc9a3f', '#8043b2', '#ea7082'];
  private colors: string[] = [];

  constructor(private supabaseService: SupabaseService) {
    this.colors = [...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors];
  }

  async getBoards() {
    this.loading.set(true);
    try {
      const result = await this.supabaseService.client.from(BOARDS_TABLE)
        .select('*');
      console.log(result.data);
      const _boards = (result.data as Board[] ?? []).map((board, i) => {
        board.color = this.colors[i];
        return board;
      });
      this.boards.set(_boards);
    } catch (err) {
      console.log(err);
    } finally {
      this.loading.set(false);
    }
  }

  async createBoard(title: string) {
    this.isCRUDLoading.set(true);
    try {
      const result = await this.supabaseService.client.from(BOARDS_TABLE)
        .insert({ title })
        .select('*').single();
      this.boards.update((value) => {
        const len = value.length;
        const color = this.colors[len];
        const board = result.data as Board;
        board.color = color;
        return [...value, board];
      });
    } catch (err) {
      console.log(err);
    } finally {
      this.isCRUDLoading.set(false);
    }
  }

  async toggleStarredBoard(boardId: any, starred: boolean) {
    this.isCRUDLoading.set(true);
    const i = this.boards().findIndex((board) => board.id === boardId);
    this.boards.mutate(value => {
      value[i].isLoading = true;
    });
    try {
      await this.supabaseService.client.from(BOARDS_TABLE)
        .update({ 'starred': !starred })
        .eq('id', boardId);
      this.boards.mutate(value => {
        value[i].starred = !starred
      });
    } catch (err) {
      console.log(err);
    } finally {
      this.isCRUDLoading.set(false);
      this.boards.mutate(value => {
        value[i].isLoading = false;
      });
    }
  }

}
