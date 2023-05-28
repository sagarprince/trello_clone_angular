import { Component, Input, WritableSignal, computed, effect, signal } from '@angular/core';
import { NgIf, NgFor, SlicePipe } from '@angular/common';
import { User } from '../../../models/board.model';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-board-users',
  standalone: true,
  imports: [NgIf, NgFor, SlicePipe, AvatarComponent],
  templateUrl: './board-users.component.html',
  styleUrls: ['./board-users.component.scss']
})
export class BoardUsersComponent {
  @Input() isLoading: boolean = false;
  @Input() disableToggle: boolean = false;

  private _users: User[] = [];
  private _limit: number = 5;

  private usersList: WritableSignal<User[]> = signal([]);
  public usersLimit: WritableSignal<number> = signal(this.limit);

  @Input()
  set users(value: User[]) {
    this.usersList.set(value);
    this._users = value;
  };
  get users() {
    return this._users;
  }

  @Input()
  set limit(value: number) {
    this.usersLimit.set(value);
    this._limit = value;
  };
  get limit() {
    return this._limit;
  }

  public remainingUsersCount = computed(() => {
    return this.usersList().length - this.usersLimit();
  });

  public dummyUsers: User[] = [
    {
      id: 1,
      email: '',
      firstName: '',
      lastName: '',
      profilePicUrl: ''
    },
    {
      id: 2,
      email: '',
      firstName: '',
      lastName: '',
      profilePicUrl: ''
    },
    {
      id: 3,
      email: '',
      firstName: '',
      lastName: '',
      profilePicUrl: ''
    }
  ];

  constructor() {}

  toggleUsers() {
    let limit = this.users.length;
    if (this.remainingUsersCount() === 0) {
      limit = this.limit;
    }
    this.usersLimit.set(limit);
  }
}
