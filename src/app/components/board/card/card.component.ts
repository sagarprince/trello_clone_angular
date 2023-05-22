import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, Signal, WritableSignal } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Card } from '../../../models/card.model';
import { DragDropCardsService } from 'src/app/services/drag-drop-cards.service';

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

  constructor(private dragDropCardsService: DragDropCardsService) {
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
}
