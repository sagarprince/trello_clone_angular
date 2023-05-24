import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, Injector, Input, OnDestroy, OnInit, QueryList, Renderer2, Signal, ViewChild, ViewChildren, WritableSignal, computed, effect, signal, untracked } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { List } from '../../../models/list.model';
import { Card } from '../../..//models/card.model';
import { ListsService } from '../../../services/lists.service';
import { CardsService } from '../../../services/cards.service';
import { DragDropCardsService } from '../../../services/drag-drop-cards.service';
import { CardComponent } from '../card/card.component';
import { AddEditCardModalComponent } from '../add-edit-card-modal/add-edit-card-modal.component';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';
import { SortByPipe } from '../../../pipes/sort-by.pipe';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule, MatProgressSpinnerModule,
    SortByPipe, CardComponent, AddEditCardModalComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
  private _onDestroy: Subject<void> = new Subject();

  @Input() list!: List;
  @Input() isLoading: boolean = false;
  @Input() isEditable: boolean = false;

  public allCards!: WritableSignal<Card[]>;

  public cards: Signal<Card[]> = signal([]);

  public selectedCard: Signal<Card | null>;
  public dragOnList: Signal<List | null>;

  public title: string = '';

  @ViewChildren('card') cardElements!: QueryList<ElementRef>;

  public layoutComplete: WritableSignal<boolean> = signal<boolean>(true);
  public isTransitionEnabled: WritableSignal<boolean> = signal<boolean>(true);

  constructor(private elementRef: ElementRef,
    private injector: Injector,
    private dialog: MatDialog,
    private listsService: ListsService,
    private cardsService: CardsService,
    private dragDropCardsService: DragDropCardsService) {
    this.allCards = this.cardsService.cards;
    this.selectedCard = this.dragDropCardsService.selectedCard;
    this.dragOnList = this.dragDropCardsService.dragOnList;

    this.cards = computed(() => {
      return this.allCards().filter((card) => {
        return card.list_id === this.list.id;
      }).sort(this.sortFn);
    });

    // effect(() => {
    //   if (this.cards()) {
    //     console.log('EFFECT');
    //   }
    // }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.title = this.list.title;
  }


  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.cardElements.notifyOnChanges();
    //   setTimeout(() => {
    //     this.layoutComplete.set(true);
    //   }, 500);
    // }, 1200);

    // this.cardElements.changes.pipe(
    //   takeUntil(this._onDestroy)
    // ).subscribe(() => {
    //   this.layoutList(this.cardElements.toArray());
    // });
  }

  layoutList(elements: Array<any>): void {
    requestAnimationFrame(() => {
      let lastElementHeight = 0;
      elements.forEach((element) => {
        const { nativeElement } = element;
        const elementHeight = nativeElement.clientHeight;
        console.log(nativeElement, elementHeight);
        nativeElement.style.transform = `translate3d(0, ${lastElementHeight}px, 0)`;
        lastElementHeight = lastElementHeight + elementHeight + 20;
      });
    });
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

  onDeleteList() {
    this.dialog.open(ConfirmationModalComponent, {
      width: "400px",
      data: {
        title: 'Delete List',
        message: 'Are you sure you want to do this?'
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.listsService.deleteList(this.list.id);
      }
    });
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
    const dialog = this.dialog.open(AddEditCardModalComponent, {
      width: '600px',
      data: {
        mode: 'EDIT',
        list: this.list,
        card
      },
    });
    dialog.beforeClosed().pipe(
      takeUntil(this._onDestroy)
    ).subscribe(() => {
      this.cardElements.notifyOnChanges();
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
    if (card) {
      if (card?.list_id == this.dragOnList()?.id) {
        this.cardsService.updateCard(card?.id, {
          list_id: this.list.id
        }, false, () => {
          this.cardsService.updateCardList(card?.id, card?.prevListId);
        });
        this.dragDropCardsService.setDragOnList(null);
      }

      this.cards().sort((a: any, b: any) => a.position - b.position).forEach((card, i) => {
        this.cardsService.updateCardPosition(card.id, i + 1);
      });

      this.cardsService.upsertCardsPositions(this.cards());

      this.dragDropCardsService.setCard(null);
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.querySelector('.list__header__left').contains(event.target);
    if (!clickedInside && this.list.isEditable) {
      this.listsService.toggleListEditable(this.list.id);
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.unsubscribe();
  }
}