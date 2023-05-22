import { Injectable, WritableSignal, signal } from '@angular/core';
import { Card } from '../models/card.model';
import { List } from '../models/list.model';

@Injectable({
  providedIn: 'root'
})
export class DragDropCardsService {
  selectedCard: WritableSignal<Card | null> = signal<Card | null>(null);
  dragOnList: WritableSignal<List | null> = signal<List | null>(null); 

  constructor() { }

  setCard(card: Card | null = null): void {
    this.selectedCard.set(card);
  }

  setDragOnList(list: List | null = null): void {
    this.dragOnList.set(list);
  }
}
