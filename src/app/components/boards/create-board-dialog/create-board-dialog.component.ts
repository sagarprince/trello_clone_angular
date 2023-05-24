import { ChangeDetectionStrategy, Component, Inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogModule } from '@angular/cdk/dialog';
import { BoardsService } from '../../../services/boards.service';

@Component({
  selector: 'app-create-board-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    DialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './create-board-dialog.component.html',
  styleUrls: ['./create-board-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateBoardDialogComponent {
  form!: FormGroup;
  isLoading: WritableSignal<boolean>;

  constructor(
    public dialogRef: MatDialogRef<CreateBoardDialogComponent>,
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

  private async createBoard() {
    const { title } = this.form.value;
    try {
      await this.boardsService.createBoard(title);
      this.onCancel();
    } catch (err) {
      console.log(err);
    }
  }

  public onCancel(): void {
    this.dialogRef.close();
  }
}
