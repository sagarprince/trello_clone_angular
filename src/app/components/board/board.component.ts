import { ChangeDetectionStrategy, Component, Renderer2, Signal, WritableSignal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Board } from '../../models/board.model';
import { List } from '../../models/list.model';
import { BoardsService } from '../../services/boards.service';
import { ListsService } from '../../services/lists.service';
import { CardsService } from '../../services/cards.service';

import { ListComponent } from './list/list.component';
import { AddNewListFormComponent } from './add-new-list-form/add-new-list-form.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgIf, NgFor, RouterModule, MatButtonModule, MatProgressSpinnerModule, ListComponent, AddNewListFormComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent {
  private _onDestroy: Subject<void> = new Subject();

  public board!: Signal<Board | null>;
  public lists!: Signal<List[]>;
  public isLoading: Signal<boolean>;
  public isCreateNewList: Signal<boolean>;

  public boardId: any;

  constructor(
    private route: ActivatedRoute,
    private boardsService: BoardsService,
    private listsService: ListsService,
    private cardsService: CardsService) {
    this.board = this.boardsService.selectedBoard;
    this.lists = this.listsService.lists;
    this.isLoading = this.listsService.isLoading;
    this.isCreateNewList = this.listsService.isCreateNewList;
  }

  ngOnInit() {
    this.route.params.pipe(
      takeUntil(this._onDestroy)
    ).subscribe(
      (params: Params) => {
        this.boardId = +params['id'];
        this.boardsService.setSelectedBoardId(this.boardId);
        this.listsService.getBoardLists(this.boardId);
        this.cardsService.getBoardCards(this.boardId);
      }
    );
  }

  onToggleCreateNewList() {
    this.listsService.toggleCreateNewList();
  }

  trackByList(_: number, list: List) {
    return list.id;
  }

  ngOnDestroy() {
    this.listsService.lists.set([]);
    this.boardsService.setSelectedBoardId(null);
    this._onDestroy.next();
    this._onDestroy.unsubscribe();
  }
}
