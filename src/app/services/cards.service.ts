import { Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, map, throwError } from 'rxjs';
import { Card } from '../models/card.model';
import { SupabaseService } from './supabase.service';
import { UtilitiesService } from './utilities.service';

const CARDS_TABLE = 'cards';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  public cards = signal<Card[]>([]);
  public isLoading = signal<boolean>(false);
  public isCRUDLoading = signal<boolean>(false);

  constructor(private supabaseService: SupabaseService, private utilitiesService: UtilitiesService) { }

  public getBoardCards(boardId: any): Observable<any> {
    this.isLoading.set(true);
    return this.supabaseService.get({
      table: CARDS_TABLE,
      filters: [
        {
          operator: 'eq',
          key: 'board_id',
          value: boardId
        }
      ]
    }).pipe(
      finalize(() => {
        this.isLoading.set(false);
      }),
      map((data) => {
        this.cards.set(data as Card[]);
      })
    );
  }

  public saveCard(mode: string = 'ADD', cardId: number, values: {
    list_id: number;
    board_id: number;
    title: string;
    description?: string;
    attachments?: string;
    done?: boolean;
    position?: number;
  }): Observable<any> {
    this.isCRUDLoading.set(true);
    this.utilitiesService.showLoadingSnackBar();
    if (mode === 'ADD') {
      return this.supabaseService.insert({
        table: CARDS_TABLE,
        values
      }).pipe(
        finalize(() => {
          this.isCRUDLoading.set(false);
          this.utilitiesService.hideLoadingSnackBar();
        }),
        map((data) => {
          this.cards.update((value) => {
            return [...value, data as Card];
          });
        })
      );
    } else {
      const i = mode === 'EDIT' ? this.cards().findIndex((card) => card.id === cardId) : -1;
      this.cards.mutate(value => {
        value[i].isLoading = true;
      });
      return this.supabaseService.update({
        table: CARDS_TABLE,
        values,
        equality: {
          key: 'id',
          value: cardId
        }
      }).pipe(
        finalize(() => {
          this.isCRUDLoading.set(false);
          this.utilitiesService.hideLoadingSnackBar();
          this.cards.mutate(value => {
            value[i].isLoading = false;
          });
        }),
        map((data) => {
          this.cards.mutate(value => {
            value[i] = {
              ...(data as Card)
            };
          });
        })
      );
    }
  }

  public updateCard(cardId: any, values: any, allowMutate: boolean = true, showSnackBar: boolean = true): Observable<any> {
    this.isCRUDLoading.set(true);
    showSnackBar && this.utilitiesService.showLoadingSnackBar();
    const i = this.cards().findIndex((card) => card.id === cardId);
    this.cards.mutate(value => {
      value[i].isLoading = true;
    });
    return this.supabaseService.update({
      table: CARDS_TABLE,
      values,
      equality: { key: 'id', value: cardId }
    }).pipe(
      finalize(() => {
        this.isCRUDLoading.set(false);
        showSnackBar && this.utilitiesService.hideLoadingSnackBar();
        this.cards.mutate(value => {
          value[i].isLoading = false;
        });
      }),
      map(() => {
        allowMutate && Object.entries(values).forEach(([key, value]) => {
          this.cards.mutate((card: any) => {
            card[i][key] = value;
          });
        });
      })
    );
  }

  public deleteCard(cardId: any): Observable<any> {
    this.isCRUDLoading.set(true);
    const i = this.cards().findIndex((card) => card.id === cardId);
    this.cards.mutate(value => {
      value[i].isDeleting = true;
    });
    return this.supabaseService.delete({
      table: CARDS_TABLE,
      equality: { key: 'id', value: cardId }
    }).pipe(
      finalize(() => {
        this.isCRUDLoading.set(false);
      }),
      map(() => {
        const cards = this.cards();
        this.cards.set(cards.filter((card) => card.id !== cardId));
      }),
      catchError((error) => {
        this.cards.mutate(value => {
          value[i].isDeleting = false;
        });
        return throwError(() => error);
      })
    );
  }

  public upsertCardsPositions(cards: Card[]): Observable<any> {
    this.isCRUDLoading.set(true);
    const values = cards.map((card) => {
      let _card = this.utilitiesService.removeKey('prevListId', card);
      _card = this.utilitiesService.removeKey('isLoading', _card);
      _card = this.utilitiesService.removeKey('isDeleting', _card);
      return {
        ..._card
      };
    })
    return this.supabaseService.upsert({
      table: CARDS_TABLE,
      values,
    }).pipe(
      finalize(() => {
        this.isCRUDLoading.set(false);
      })
    );
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
