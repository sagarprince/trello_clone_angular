import { Injectable, signal } from '@angular/core';
import { Card } from '../models/card.model';
import { SupabaseService } from './supabase.service';

const CARDS_TABLE = 'cards';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  public cards = signal<Card[]>([]);
  public isLoading = signal<boolean>(false);
  public isCRUDLoading = signal<boolean>(false);

  constructor(private supabaseService: SupabaseService) { }

  async getBoardCards(boardId: any) {
    this.isLoading.set(true);
    try {
      const result = await this.supabaseService.client.from(CARDS_TABLE)
        .select('*').eq('board_id', boardId);
      this.cards.set(result.data as Card[]);
    } catch (err) {
      console.log(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveCard({
    mode = 'ADD', listId, boardId, cardId, title, description = '', attachments = '', done = false
  }: {
    mode: string;
    listId: number;
    boardId: number;
    cardId?: number;
    title: string;
    description?: string;
    attachments?: string;
    done?: boolean
  }) {
    this.isCRUDLoading.set(true);
    const i = mode === 'EDIT' ? this.cards().findIndex((card) => card.id === cardId) : -1;
    try {
      if (mode === 'ADD') {
        const result = await this.supabaseService.client.from(CARDS_TABLE)
          .insert({ 'list_id': listId, 'board_id': boardId, title, description, attachments, done })
          .select('*').single();
        result.data && this.cards.update((value) => {
          return [...value, result.data as Card];
        });
      } else {
        if (i > -1) {
          this.cards.mutate(value => {
            value[i].isLoading = true;
          });
          const result = await this.supabaseService.client.from(CARDS_TABLE)
            .update({ title, description, attachments, done })
            .eq('id', cardId)
            .select('*').single();
          this.cards.mutate(value => {
            value[i] = {
              ...(result.data as Card)
            };
          });
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.isCRUDLoading.set(false);
      i > -1 && this.cards.mutate(value => {
        value[i].isLoading = false;
      });
    }
  }

  async updateCard(cardId: any, values = {}, allowMutate: boolean = true, errorCallback: VoidFunction = () => { }) {
    this.isCRUDLoading.set(true);
    const i = this.cards().findIndex((card) => card.id === cardId);

    try {
      this.cards.mutate(value => {
        value[i].isLoading = true;
      });
      const { data, error } = await this.supabaseService.client.from(CARDS_TABLE)
        .update(values)
        .eq('id', cardId)
        .select('*').single();
      if (data) {
        allowMutate && this.cards.mutate(value => {
          value[i] = {
            ...(data as Card)
          };
        });
      } else {
        errorCallback();
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.isCRUDLoading.set(false);
      this.cards.mutate(value => {
        value[i].isLoading = false;
      });
    }
  }

  async deleteCard(cardId: any) {
    this.isCRUDLoading.set(true);
    const i = this.cards().findIndex((card) => card.id === cardId);
    try {
      this.cards.mutate(value => {
        value[i].isDeleting = true;
      });
      await this.supabaseService.client.from(CARDS_TABLE)
        .delete()
        .eq('id', cardId);
      const cards = this.cards();
      this.cards.set(cards.filter((card) => card.id !== cardId));
    } catch (err) {
      console.log(err);
    } finally {
      this.isCRUDLoading.set(false);
      this.cards.mutate(value => {
        value[i].isDeleting = false;
      });
    }
  }

  async updateCardList(cardId: any, listId: any) {
    const i = this.cards().findIndex((card) => card.id === cardId);
    this.cards.mutate(value => {
      value[i].list_id = listId;
    });
  }
}
