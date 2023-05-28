import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatMenuModule, MatIconModule, AvatarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  @Input() userName: string = '';
  @Input() profilePicUrl: string = '';
  @Output('onProfile') _onProfile: EventEmitter<any> = new EventEmitter<any>();
  @Output('onLogout') _onLogout: EventEmitter<any> = new EventEmitter<any>();

  public onProfile() {
    this._onProfile.emit();
  }

  public onLogout() {
    this._onLogout.emit();
  }
}
