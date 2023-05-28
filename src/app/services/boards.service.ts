import { Injectable, Signal, computed, effect, signal, untracked } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Board } from '../models/board.model';
import { Observable, catchError, finalize, forkJoin, map, merge, of, switchMap, throwError } from 'rxjs';
import { Error } from '../models/error.model';
import { UtilitiesService } from './utilities.service';

const BOARDS_TABLE = 'boards';
const USER_BOARDS_TABLE = 'user_boards';
const USERS_TABLE = 'users';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {
  public boards = signal<Board[]>([]);
  public isLoading = signal<boolean>(false);
  public isCRUDLoading = signal<boolean>(false);

  public starredBoards = computed(() => {
    return this.boards().filter((board) => board.starred);
  });

  public hasStarredBoards = computed(() => {
    return this.starredBoards().length > 0;
  });

  public selectedBoardId = signal<any>(null);

  public selectedBoard: Signal<Board | null> = computed(() => {
    const id = this.selectedBoardId();
    if (id) {
      return this.boards().find((board) => board.id === id) || null;
    }
    return null;
  });

  private defaultColors: string[] = ['#EEF7FB', '#F8F1FF', '#FEF7EF', '#EBFDF5', '#EEF7FB', '#F4F4FF', '#F4F4F4', '#F8E8E8'];
  private colors: string[] = [];

  constructor(private supabaseService: SupabaseService, private utilitiesService: UtilitiesService) {
    this.colors = [...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors, ...this.defaultColors];
  }

  public getBoards(userId: any): Observable<any> {
    this.isLoading.set(true);
    return this.supabaseService.get({
      table: USER_BOARDS_TABLE,
      query: 'board_id(title, id, creator, starred)',
      filters: [
        {
          operator: 'eq',
          key: 'user_id',
          value: userId
        }
      ]
    }).pipe(
      map((data) => {
        return data.map((item: any) => {
          return {
            ...item.board_id && item.board_id || {}
          };
        });
      }),
      map((data) => {
        this.isLoading.set(false);
        this.boards.set((data as Board[] ?? []).map((board, i) => {
          board.color = this.colors[i];
          return board;
        }));
      }),
      map(() => {
        const boards = this.boards();
        boards.forEach((board, i) => {
          this.boards.mutate(value => {
            value[i].isUsersLoading = true;
          });
          this.getBoardUsers(board.id).pipe(
            finalize(() => {
              this.boards.mutate(value => {
                value[i].isUsersLoading = false;
              });
            })
          ).subscribe((users) => {
            this.boards.mutate(value => {
              value[i].users = users;
            });
          });
        });
        console.log(this.boards());
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  public getBoardUsers(boardId: any): Observable<any> {
    return this.supabaseService.get({
      table: USER_BOARDS_TABLE,
      query: 'user_id',
      filters: [
        {
          operator: 'eq',
          key: 'board_id',
          value: boardId
        }
      ]
    }).pipe(
      switchMap((data) => {
        const userIds = data && (data as Array<any>).map((item) => item && item.user_id) || [];
        if (userIds.length > 0) {
          return this.supabaseService.get({
            table: USERS_TABLE,
            query: '*',
            filters: [
              {
                operator: 'in',
                key: 'id',
                value: userIds
              }
            ]
          })
        }
        return of([]);
      })
    );
  }

  public createBoard(title: string): Observable<any> {
    this.isCRUDLoading.set(true);
    this.utilitiesService.showLoadingSnackBar();
    return this.supabaseService.insert({
      table: BOARDS_TABLE,
      values: { title }
    }).pipe(
      switchMap((data) => {
        const boardId = data.id;
        return this.supabaseService.insert({
          table: USER_BOARDS_TABLE,
          values: { user_id: data.creator, board_id: boardId }
        }).pipe(
          switchMap(() => {
            return this.getBoardUsers(boardId).pipe(
              finalize(() => {
                this.isCRUDLoading.set(false);
                this.utilitiesService.hideLoadingSnackBar();
              }),
              map((users) => {
                this.boards.update((value) => {
                  const len = value.length;
                  const color = this.colors[len];
                  const board = data as Board;
                  board.color = color;
                  board.users = users;
                  return [...value, board];
                });
              })
            );
          })
        )
      })
    );
  }

  public updateBoard(boardId: any, values: any, showSnackBar: boolean = true): Observable<any> {
    this.isCRUDLoading.set(true);
    showSnackBar && this.utilitiesService.showLoadingSnackBar();
    const i = this.boards().findIndex((board) => board.id === boardId);
    this.boards.mutate(value => {
      value[i].isLoading = true;
    });
    return this.supabaseService.update({
      table: BOARDS_TABLE,
      values,
      equality: { key: 'id', value: boardId }
    }).pipe(
      finalize(() => {
        this.isCRUDLoading.set(false);
        showSnackBar && this.utilitiesService.hideLoadingSnackBar();
        this.boards.mutate(value => {
          value[i].isLoading = false;
        });
      }),
      map(() => {
        Object.entries(values).forEach(([key, value]) => {
          this.boards.mutate((board: any) => {
            board[i][key] = value;
          });
        });
      })
    );
  }

  public deleteBoard(boardId: any): Observable<any> {
    this.isCRUDLoading.set(true);
    const i = this.boards().findIndex((board) => board.id === boardId);
    this.boards.mutate(value => {
      value[i].isDeleting = true;
    });
    return this.supabaseService.delete({
      table: BOARDS_TABLE,
      equality: { key: 'id', value: boardId }
    }).pipe(
      finalize(() => {
        this.isCRUDLoading.set(false);
      }),
      map(() => {
        const boards = this.boards();
        this.boards.set(boards.filter((board) => board.id !== boardId));
      }),
      catchError((error) => {
        this.boards.mutate(value => {
          value[i].isDeleting = false;
        });
        return throwError(() => error);
      })
    );
  }

  public addUserToBoard(boardId: string, email: string): Observable<any> {
    this.isCRUDLoading.set(true);
    this.utilitiesService.showLoadingSnackBar();
    const i = this.boards().findIndex((board) => board.id === boardId);
    this.boards.mutate(value => {
      value[i].isLoading = true;
    });
    return this.supabaseService.get(
      {
        table: USERS_TABLE,
        query: '*',
        matchQuery: { email },
        singal: true,
        handleError: false
      }
    ).pipe(
      switchMap((user: any) => {
        return this.supabaseService.get(
          {
            table: USER_BOARDS_TABLE,
            query: 'id',
            filters: [
              {
                operator: 'eq',
                key: 'board_id',
                value: boardId
              },
              {
                operator: 'eq',
                key: 'user_id',
                value: user.id
              }
            ],
            singal: true,
            handleError: false
          }
        ).pipe(
          catchError((err) => {
            const error = new Error(err.status, err.message);
            if (err.status === 'PGRST116') {
              return of(null);
            }
            return throwError(() => error);
          }),
          switchMap((data) => {
            if (!data) {
              return this.supabaseService.insert({
                table: USER_BOARDS_TABLE,
                values: { board_id: boardId, user_id: user.id }
              }).pipe(
                finalize(() => {
                  this.isCRUDLoading.set(false);
                  this.boards.mutate(value => {
                    value[i].isLoading = false;
                  });
                  this.utilitiesService.hideLoadingSnackBar();
                }),
                map((data) => {
                  this.boards.mutate((value) => {
                    const users = [...value[i].users || []];
                    value[i].users = [
                      ...users,
                      user
                    ]
                  });
                  return data;
                })
              );
            } else {
              const error = new Error('USER_BOARD_ALREADY_EXIST', 'This user is already added to this board.');
              return throwError(() => error);
            }
          }),
        );
      }),
      catchError((err) => {
        this.isCRUDLoading.set(false);
        if (err.status === 'PGRST116') {
          err.message = 'There is no user associated with the provided email address. Please verify the email address and try again.'
        }
        this.utilitiesService.showSnackBar(err.message);
        return throwError(() => err);
      })
    )
  }

  public setSelectedBoardId(id: any) {
    this.selectedBoardId.set(id);
  }
}
