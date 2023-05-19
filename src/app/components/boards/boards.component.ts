import { ChangeDetectionStrategy, Component, WritableSignal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BoardsService } from '../../services/boards.service';
import { CreateBoardDialogComponent } from './create-board-dialog/create-board-dialog.component';
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
    BoardCardComponent
  ],
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardsComponent {
  public boards: WritableSignal<Board[]>;
  public loading: WritableSignal<boolean>;

  public starredBoards = computed(() => {
    return this.boards().filter((board) => board.starred);
  });

  public hasStarredBoards = computed(() => {
    return this.starredBoards().length > 0;
  });

  constructor(private dialog: MatDialog, private boardsService: BoardsService) {
    this.boards = this.boardsService.boards;
    this.loading = this.boardsService.loading;
  }

  ngOnInit() {
    this.boardsService.getBoards();
  }

  public onCreateBoard(): void {
    this.dialog.open(CreateBoardDialogComponent, {
      height: '230px',
      width: '400px',
      data: {},
    });
  }

  public onToggleBoardStarred(board: Board) {
    this.boardsService.toggleStarredBoard(board.id, board.starred);
  }
}
