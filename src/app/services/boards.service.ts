import { Injectable, Signal, computed, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Board } from '../models/board.model';

const BOARDS_TABLE = 'boards';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  public boards = signal<Board[]>([]);
  public isLoading = signal<boolean>(false);
  public isCRUDLoading = signal<boolean>(false);

  public starredBoards = computed(() => {
    return this.boards().filter((board) => board.starred);
  });

  public hasStarredBoards = computed(() => {
    return this.starredBoards().length > 0;
  });

  public selectedBoardId = signal<any>(null);

  public selectedBoard: Signal<Board | null> = computed(() => {
    const id = this.selectedBoardId();
    if (id) {
      return this.boards().find((board) => board.id === id) || null;
    }
    return null;
  });

  private defaultColors: string[] = ['#EEF7FB', '#F8F1FF', '#FEF7EF', '#EBFDF5', '#EEF7FB', '#F4F4FF', '#F4F4F4', '#F8E8E8'];
  private colors: string[] = [];

  constructor(private supabaseService: SupabaseService) {
    this.colors = [...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors];
  }

  async getBoards() {
    this.isLoading.set(true);
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
      this.isLoading.set(false);
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

  setSelectedBoardId(id: any) {
    this.selectedBoardId.set(id);
  }
}
