import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, Renderer2, Signal, WritableSignal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { List } from '../../../models/list.model';
import { Card } from '../../..//models/card.model';
import { ListsService } from '../../../services/lists.service';
import { CardsService } from '../../../services/cards.service';
import { DragDropCardsService } from 'src/app/services/drag-drop-cards.service';
import { CardComponent } from '../card/card.component';
import { AddEditCardModalComponent } from '../add-edit-card-modal/add-edit-card-modal.component';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';
import { SortByPipe } from '../../../pipes/sort-by.pipe';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, MatDialogModule, MatProgressSpinnerModule, SortByPipe, CardComponent, AddEditCardModalComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @Input() list!: List;
  @Input() isLoading: boolean = false;
  @Input() isEditable: boolean = false;

  public allCards!: WritableSignal<Card[]>;

  public cards = computed(() => {
    return this.allCards().filter((card) => {
      return card.list_id === this.list.id;
    });
  });

  public selectedCard: Signal<Card | null>;
  public dragOnList: Signal<List | null>;

  public title: string = '';

  constructor(private elementRef: ElementRef,
    private dialog: MatDialog,
    private listsService: ListsService,
    private cardsService: CardsService,
    private dragDropCardsService: DragDropCardsService) {
    this.allCards = this.cardsService.cards;
    this.selectedCard = this.dragDropCardsService.selectedCard;
    this.dragOnList = this.dragDropCardsService.dragOnList;
  }

  ngOnInit(): void {
    this.title = this.list.title;
  }

  onUpdateList() {
    this.updateList();
  }

  private async updateList() {
    try {
      const title = this.title.trim();
      if (title && title !== this.list.title) {
        await this.listsService.updateList(this.list.id, title);
        this.listsService.toggleListEditable(this.list.id);
      } else {
        this.title = this.list.title;
        this.listsService.toggleListEditable(this.list.id);
      }
    } catch (err) {
      this.listsService.toggleListEditable(this.list.id);
      console.log(err);
    }
  }

  onToggleListEditable() {
    this.listsService.toggleListEditable(this.list.id);
  }

  onCreateCard() {
    this.dialog.open(AddEditCardModalComponent, {
      width: '600px',
      data: {
        mode: 'ADD',
        list: this.list,
        position: this.cards().length + 1
      },
    });
  }

  onEditCard(card: Card) {
    this.dialog.open(AddEditCardModalComponent, {
      width: '600px',
      data: {
        mode: 'EDIT',
        list: this.list,
        card
      },
    });
  }

  onDeleteCard(card: Card) {
    this.dialog.open(ConfirmationModalComponent, {
      width: "400px",
      data: {
        title: 'Delete Card',
        message: 'Are you sure you want to do this?'
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.cardsService.deleteCard(card.id);
      }
    });
  }

  onMarkDoneCard(card: Card) {
    this.cardsService.updateCard(card.id, {
      done: !card.done
    });
  }

  trackByCard(_: number, card: Card): Card {
    return card.id;
  }

  sortFn(card1: Card, card2: Card) {
    return card1.position - card2.position;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    const card = this.selectedCard();
    if (card && card?.list_id !== this.list.id) {
      this.dragDropCardsService.setDragOnList(this.list);
      this.cardsService.updateCardList(card?.id, this.list.id);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    const card = this.selectedCard();
    if (card && card?.list_id == this.dragOnList()?.id) {
      this.cardsService.updateCard(card?.id, {
        list_id: this.list.id
      }, false, () => {
        this.cardsService.updateCardList(card?.id, card?.prevListId);
      });

      // Update Cards Positions

      console.log(this.cards());

      this.cards().sort((a: any, b: any) => a.position - b.position).forEach((card, i) => {
        this.cardsService.updateCardPosition(card.id, i + 1);
      });

      this.dragDropCardsService.setCard(null);
      this.dragDropCardsService.setDragOnList(null);
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.list.isEditable) {
      this.listsService.toggleListEditable(this.list.id);
    }
  }
}