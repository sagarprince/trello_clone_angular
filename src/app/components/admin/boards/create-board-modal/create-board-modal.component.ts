import { ChangeDetectionStrategy, Component, Inject, WritableSignal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BoardsService } from '../../../../services/boards.service';

@Component({
  selector: 'app-create-board-modal',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './create-board-modal.component.html',
  styleUrls: ['./create-board-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateBoardModalComponent {
  private _onDestroy: Subject<void> = new Subject();

  form!: FormGroup;
  isLoading: WritableSignal<boolean>;

  constructor(
    public dialogRef: MatDialogRef<CreateBoardModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private boardsService: BoardsService
  ) {
    this.isLoading = this.boardsService.isCRUDLoading;
    this.setupForm();
  }

  public setupForm(): void {
    this.form = this.fb.group({
      title: new FormControl('', [Validators.required]),
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.createBoard();
    }
  }

  private createBoard() {
    const { title } = this.form.value;
    this.boardsService.createBoard(title).pipe(
      takeUntil(this._onDestroy)
    ).subscribe(() => {
      this.onCancel();
    });
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
