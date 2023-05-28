import { ChangeDetectionStrategy, Component, Inject, OnDestroy, Signal, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BoardsService } from '../../../../services/boards.service';

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUserModalComponent implements OnDestroy {
  private _onDestroy: Subject<void> = new Subject();
  form!: FormGroup;
  isLoading: Signal<boolean> = signal(false);
  boardId: any;

  constructor(
    public dialogRef: MatDialogRef<AddUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private boardsService: BoardsService
  ) {
    this.isLoading = this.boardsService.isCRUDLoading;
    this.boardId = this.data.boardId || -1;
    this.setupForm();
  }

  public setupForm(): void {
    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const { email } = this.form.value;
      this.boardsService.addUserToBoard(this.boardId, email).pipe(
        takeUntil(this._onDestroy)
      ).subscribe(() => {
        this.onCancel();
      });
    }
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
