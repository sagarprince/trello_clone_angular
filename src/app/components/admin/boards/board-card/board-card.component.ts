import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BoardUsersComponent } from '../../../../components/shared/board-users/board-users.component';
import { Board, User } from '../../../../models/board.model';

@Component({
  selector: 'app-board-card',
  standalone: true,
  imports: [NgIf, RouterLink, MatProgressSpinnerModule, BoardUsersComponent],
  templateUrl: './board-card.component.html',
  styleUrls: ['./board-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardCardComponent {
  @Input() board!: Board;
  @Input() boardUsers: User[] = [];
  @Input() isUsersLoading: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() isDeleting: boolean = false;
  @Output('onToggleBoardStarred') toggleBoardStarred: EventEmitter<any> = new EventEmitter<any>();
  @Output('onDelete') onDelete: EventEmitter<any> = new EventEmitter<any>();

  constructor(private router: Router, private route: ActivatedRoute) { }

  public onToggleBoardStarred(): void {
    this.toggleBoardStarred.emit(this.board);
  }

  public onDeleteBoard(): void {
    this.onDelete.emit(this.board.id);
  }

  public navigateToBoard(): void {
    this.router.navigate([`../board/${this.board?.id}`], { relativeTo: this.route });
  }
}
