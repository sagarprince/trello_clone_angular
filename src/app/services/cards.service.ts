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

  async saveCard(mode: string = 'ADD', cardId: number, values: {
    list_id: number;
    board_id: number;
    title: string;
    description?: string;
    attachments?: string;
    done?: boolean;
    position?: number;
  }) {
    this.isCRUDLoading.set(true);
    const i = mode === 'EDIT' ? this.cards().findIndex((card) => card.id === cardId) : -1;
    try {
      if (mode === 'ADD') {
        const { data } = await this.supabaseService.client.from(CARDS_TABLE)
          .insert({ ...values })
          .select('*').single();
        data && this.cards.update((value) => {
          return [...value, data as Card];
        });
      } else {
        if (i > -1) {
          this.cards.mutate(value => {
            value[i].isLoading = true;
          });
          const result = await this.supabaseService.client.from(CARDS_TABLE)
            .update({ ...values })
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
      const { data } = await this.supabaseService.client.from(CARDS_TABLE)
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
      const { error } = await this.supabaseService.client.from(CARDS_TABLE)
        .delete()
        .eq('id', cardId);
      if (!error) {
        const cards = this.cards();
        this.cards.set(cards.filter((card) => card.id !== cardId));
      } else {
        this.cards().length > 0 && this.cards.mutate(value => {
          value[i].isDeleting = false;
        });
      }
    } catch (err) {
      console.log(err);
      this.cards().length > 0 && this.cards.mutate(value => {
        value[i].isDeleting = false;
      });
    } finally {
      this.isCRUDLoading.set(false);
    }
  }

  removeKey(key: string, {[key]: _, ...rest}) {
    return rest;
  }

  async upsertCardsPositions(cards: Card[]) {
    this.isCRUDLoading.set(true);
    try {
      const values = cards.map((card) => {
        let _card = this.removeKey('prevListId', card);
        _card = this.removeKey('isLoading', _card);
        _card = this.removeKey('isDeleting', _card);
        return {
          ..._card
        };
      })
      await this.supabaseService.client.from(CARDS_TABLE)
        .upsert(values).select();
    } catch (err) {
      console.log(err);
    } finally {
      this.isCRUDLoading.set(false);
    }
  }

  async updateCardList(cardId: any, listId: any) {
    const i = this.cards().findIndex((card) => card.id === cardId);
    this.cards.mutate(value => {
      value[i].list_id = listId;
    });
  }

  async updateCardPosition(cardId: any, position: any) {
    const i = this.cards().findIndex((card) => card.id === cardId);
    this.cards.mutate(value => {
      value[i].position = position;
    });
  }
}
