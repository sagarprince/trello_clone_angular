import { ChangeDetectionStrategy, Component, Signal, WritableSignal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BoardsService } from '../../services/boards.service';
import { CreateBoardModalComponent } from './create-board-modal/create-board-modal.component';
import { Board } from 'src/app/models/board.model';
import { BoardCardComponent } from './board-card/board-card.component';

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
  ],
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardsComponent {
  public boards: WritableSignal<Board[]>;
  public isLoading: WritableSignal<boolean>;
  public starredBoards: Signal<Board[]>;
  public hasStarredBoards: Signal<boolean>;

  constructor(private dialog: MatDialog, private boardsService: BoardsService) {
    this.boards = this.boardsService.boards;
    this.isLoading = this.boardsService.isLoading;
    this.starredBoards = this.boardsService.starredBoards;
    this.hasStarredBoards = this.boardsService.hasStarredBoards;
  }

  ngOnInit() {}

  public onCreateBoard(): void {
    this.dialog.open(CreateBoardModalComponent, {
      height: '230px',
      width: '400px',
      data: {},
    });
  }

  public onToggleBoardStarred(board: Board) {
    this.boardsService.toggleStarredBoard(board.id, board.starred);
  }
}
