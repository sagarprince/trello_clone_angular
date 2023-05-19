import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Board } from '../../../models/board.model';

@Component({
  selector: 'app-board-card',
  standalone: true,
  imports: [NgIf, MatProgressSpinnerModule],
  templateUrl: './board-card.component.html',
  styleUrls: ['./board-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardCardComponent {
  @Input() board!: Board;
  @Input() isLoading: boolean = false;
  @Output('onToggleBoardStarred') toggleBoardStarred: EventEmitter<any> = new EventEmitter<any>();

  public onToggleBoardStarred(): void {
    this.toggleBoardStarred.emit(this.board);
  }
}
