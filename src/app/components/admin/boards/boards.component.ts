import { ChangeDetectionStrategy, Component, OnDestroy, Signal, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BoardsService } from '../../../services/boards.service';
import { CreateBoardModalComponent } from './create-board-modal/create-board-modal.component';
import { Board } from 'src/app/models/board.model';
import { BoardCardComponent } from './board-card/board-card.component';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    NgIf,
    NgFor,
    BoardCardComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardsComponent implements OnDestroy {
  private _onDestroy: Subject<void> = new Subject();

  public boards: Signal<Board[]>;
  public isLoading: Signal<boolean>;
  public starredBoards: Signal<Board[]>;
  public hasStarredBoards: Signal<boolean>;

  public dummyBoards: Board[] = [
    {
      id: 1,
      title: '',
      starred: false,
      isUsersLoading: true
    },
    {
      id: 2,
      title: '',
      starred: false,
      isUsersLoading: true
    },
    {
      id: 3,
      title: '',
      starred: false,
      isUsersLoading: true
    }
  ].map((board: Board) => {
    board.users = [
      {
        id: 1,
        email: '',
        firstName: '',
        lastName: '',
        profilePicUrl: ''
      },
      {
        id: 1,
        email: '',
        firstName: '',
        lastName: '',
        profilePicUrl: ''
      }
    ];
    return board;
  })

  constructor(private dialog: MatDialog, private boardsService: BoardsService) {
    this.boards = this.boardsService.boards;
    this.isLoading = this.boardsService.isLoading;
    this.starredBoards = this.boardsService.starredBoards;
    this.hasStarredBoards = this.boardsService.hasStarredBoards;
  }

  public onCreateBoard(): void {
    this.dialog.open(CreateBoardModalComponent, {
      height: '230px',
      width: '400px',
      data: {},
    });
  }

  public onToggleBoardStarred(board: Board) {
    this.boardsService.updateBoard(board.id, { starred: !board.starred }, false).pipe(
      takeUntil(this._onDestroy),
    ).subscribe();
  }

  public onDeleteBoard(boardId: any): void {
    this.dialog.open(ConfirmationModalComponent, {
      width: "400px",
      data: {
        title: 'Delete Board',
        message: 'Are you sure you want to do this?'
      }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.boardsService.deleteBoard(boardId).pipe(
          takeUntil(this._onDestroy)
        ).subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
