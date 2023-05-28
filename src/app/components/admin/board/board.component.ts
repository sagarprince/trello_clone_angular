import { ChangeDetectionStrategy, Component, Signal, WritableSignal, effect, signal, untracked } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Board } from '../../../models/board.model';
import { List } from '../../../models/list.model';

import { BoardsService } from '../../../services/boards.service';
import { ListsService } from '../../../services/lists.service';
import { CardsService } from '../../../services/cards.service';

import { ListComponent } from './list/list.component';
import { AddNewListFormComponent } from './add-new-list-form/add-new-list-form.component';
import { AddUserModalComponent } from './add-user-modal/add-user-modal.component';
import { BoardUsersComponent } from '../../shared/board-users/board-users.component';


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    NgIf, NgFor, 
    RouterModule, MatButtonModule, MatIconModule, 
    MatProgressSpinnerModule, MatDialogModule, 
    ListComponent, AddNewListFormComponent, BoardUsersComponent
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent {
  private _onDestroy: Subject<void> = new Subject();

  public board!: Signal<Board | null>;
  public isBoardLoading: Signal<boolean> = signal(false);
  public lists!: Signal<List[]>;
  public isLoading: Signal<boolean>;
  public isCreateNewList: Signal<boolean>;
  public isEditable: WritableSignal<boolean> = signal(false);
  public boardTitle: WritableSignal<string> = signal('');

  public boardId: any;

  public dummyLists: List[] = [
    {
      id: 1,
      board_id: 1,
      position: 0,
      title: ''
    },
    {
      id: 1,
      board_id: 2,
      position: 0,
      title: ''
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private boardsService: BoardsService,
    private listsService: ListsService,
    private cardsService: CardsService) {
    this.board = this.boardsService.selectedBoard;
    this.isBoardLoading = this.boardsService.isLoading;
    this.lists = this.listsService.lists;
    this.isLoading = this.listsService.isLoading;
    this.isCreateNewList = this.listsService.isCreateNewList;

    effect(() => {
      untracked(() => {
        this.boardTitle.set(this.board()?.title || '');
      });
    });
  }

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this._onDestroy)
    ).subscribe(
      (params: Params) => {
        this.boardId = +params['id'];
        this.boardsService.setSelectedBoardId(this.boardId);
        this.listsService.getBoardLists(this.boardId).pipe(
          takeUntil(this._onDestroy)
        ).subscribe();
        this.cardsService.getBoardCards(this.boardId).pipe(
          takeUntil(this._onDestroy)
        ).subscribe();
      }
    );
  }


  onUpdateBoard() {
    const title = this.boardTitle().trim();
    if (title && title !== this.board()?.title) {
      this.boardsService.updateBoard(this.boardId, { title }, false).pipe(
        takeUntil(this._onDestroy),
      ).subscribe(() => {
        this.isEditable.set(false);
      });
    } else {
      this.isEditable.set(false);
    }
  }

  onBoardTitleChanged(event: any) {
    this.boardTitle.set(event.target.value);
  }

  onToggleEditable() {
    this.isEditable.set(!this.isEditable());
  }

  onToggleCreateNewList() {
    this.listsService.toggleCreateNewList();
  }

  onAddUser(): void {
    this.dialog.open(AddUserModalComponent, {
      width: "400px",
      data: {
        boardId: this.boardId
      }
    });
  }

  trackByList(_: number, list: List) {
    return list.id;
  }

  ngOnDestroy() {
    this.listsService.lists.set([]);
    this.boardsService.setSelectedBoardId(null);
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
