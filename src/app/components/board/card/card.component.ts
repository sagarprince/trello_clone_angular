import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, Signal, WritableSignal } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Card } from '../../../models/card.model';
import { DragDropCardsService } from '../../../services/drag-drop-cards.service';
import { CardsService } from '../../../services/cards.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf, MatProgressSpinnerModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() card!: Card;
  @Input() isLoading: boolean = false;
  @Input() isDeleting: boolean = false;
  @Output('onEdit') _onEdit: EventEmitter<Card> = new EventEmitter<Card>();
  @Output('onDelete') _onDelete: EventEmitter<Card> = new EventEmitter<Card>();
  @Output('onMarkDone') _onMarkDone: EventEmitter<Card> = new EventEmitter<Card>();

  selectedCard!: Signal<Card | null>;
  positionA: number = -1;
  positionB: number = -1;

  constructor(private dragDropCardsService: DragDropCardsService, private cardsService: CardsService) {
    this.selectedCard = this.dragDropCardsService.selectedCard;
  }

  get attachment(): string {
    const attachments = this.card.attachments && this.card.attachments.split(',') || [];
    return attachments.length > 0 && attachments[0] || '';
  }

  get hasAttachment(): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const url = this.attachment.toLowerCase();
    return imageExtensions.some(extension => url.endsWith(extension));
  }

  onEdit() {
    this._onEdit.emit(this.card);
  }

  onDelete() {
    this._onDelete.emit(this.card);
  }

  onMarkDone() {
    this._onMarkDone.emit(this.card);
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    this.card.prevListId = this.card.list_id;
    this.dragDropCardsService.setCard(this.card);
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent) {
    this.dragDropCardsService.setCard(null);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(_: DragEvent) {
    const card = this.selectedCard();
    // console.log('Drag Enter ', card, this.card);
    if (card?.id !== this.card.id) {
      this.positionA = card?.position || -1;
      this.positionB = this.card.position || -1;
      console.log(this.positionB, this.positionA);
      this.cardsService.updateCardPosition(card?.id, this.positionB);
      this.cardsService.updateCardPosition(this.card.id, this.positionA);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    const card = this.selectedCard();
    console.log(this.positionB, this.positionA);
    if (this.positionA > -1 && this.positionB > -1) {
      this.cardsService.updateCard(card?.id, {
        position: this.positionB
      }, false);
      this.cardsService.updateCard(this.card.id, {
        position: this.positionA
      }, false);
      // this.positionA = this.positionB = -1;
    }
  }
}
