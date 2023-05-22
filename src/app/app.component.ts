import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { BoardsService } from './services/boards.service';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, RouterLink, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  constructor(private boardsService: BoardsService) {}

  public ngOnInit() {
    this.boardsService.getBoards();
  }
}
