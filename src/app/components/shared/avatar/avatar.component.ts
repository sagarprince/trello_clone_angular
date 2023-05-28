import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent {
  @Input() userName: string = '';

  private _imageUrl: string = '';

  @Input()
  set imageUrl(value: string) {
    if (!value) {
      const initial = this.userName && this.userName[0] || '';
      this._imageUrl = `https://ui-avatars.com/api/?background=random&name=${initial}`;
    } else {
      this._imageUrl = value;
    }
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  @Input() isLoading: boolean = false;
}
