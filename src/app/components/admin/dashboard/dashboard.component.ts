import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { Subject, finalize, first, take, takeUntil } from 'rxjs';
import { HeaderComponent } from '../../shared/header/header.component';
import { BoardsService } from '../../../services/boards.service';
import { AuthService } from 'src/app/services/auth.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HeaderComponent],
  providers: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _onDestroy: Subject<void> = new Subject();
  public userName: WritableSignal<string> = signal('');
  public profilePicUrl: WritableSignal<string> = signal('');

  constructor(
    private boardsService: BoardsService,
    private authService: AuthService,
    private router: Router,
    private utilitiesService: UtilitiesService
  ) { }

  public ngOnInit() {
    this.authService.currentUser.pipe(
      takeUntil(this._onDestroy),
      take(1),
    ).subscribe((user) => {
      if (user) {
        this.userName.set(user?.user_metadata['firstName']);
        this.profilePicUrl.set(user?.user_metadata['profilePicUrl']);

        this.boardsService.getBoards(user.id).pipe(
          takeUntil(this._onDestroy)
        ).subscribe();
      }
    });
  }

  public onProfile() {
  }

  public onLogout() {
    this.utilitiesService.showLoadingSnackBar();
    this.authService.logout().pipe(
      takeUntil(this._onDestroy),
      finalize(() => {
        this.utilitiesService.hideLoadingSnackBar();
      })
    ).subscribe(() => {
      this.boardsService.boards.set([]);
      this.router.navigate(['/']);
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
