import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Board } from '../../../models/board.model';

@Component({
  selector: 'app-board-card',
  standalone: true,
  imports: [NgIf, RouterLink, MatProgressSpinnerModule],
  templateUrl: './board-card.component.html',
  styleUrls: ['./board-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardCardComponent {
  @Input() board!: Board;
  @Input() isLoading: boolean = false;
  @Input() isDeleting: boolean = false;
  @Output('onToggleBoardStarred') toggleBoardStarred: EventEmitter<any> = new EventEmitter<any>();
  @Output('onDelete') onDelete: EventEmitter<any> = new EventEmitter<any>();

  public onToggleBoardStarred(): void {
    this.toggleBoardStarred.emit(this.board);
  }

  public onDeleteBoard(): void {
    this.onDelete.emit(this.board.id);
  }
}
