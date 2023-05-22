import { ChangeDetectionStrategy, Component, Inject, WritableSignal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CardsService } from '../../../services/cards.service';
import { List } from '../../../models/list.model';
import { Card } from '../../../models/card.model';

@Component({
  selector: 'app-add-edit-card-modal',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './add-edit-card-modal.component.html',
  styleUrls: ['./add-edit-card-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditCardModalComponent {
  form!: FormGroup;

  mode: string = 'ADD';
  list: List;
  card: Card;
  position: number;

  isLoading: WritableSignal<boolean>;

  constructor(
    public dialogRef: MatDialogRef<AddEditCardModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private cardsService: CardsService
  ) {
    this.mode = this.data && this.data.mode || 'ADD';
    this.list = this.data && this.data.list || null;
    this.card = this.data && this.data.card || null;
    this.position = this.data && this.data.position || 1;
    this.isLoading = this.cardsService.isCRUDLoading;
    this.setupForm();
  }

  ngOnInit() {
    if (this.card) {
      this.form.patchValue(this.card);
    }
  }

  public setupForm(): void {
    this.form = this.fb.group({
      title: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      attachments: new FormControl('')
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.saveCard();
    }
  }

  private async saveCard() {
    const { title, description, attachments } = this.form.value;
    try {
      await this.cardsService.saveCard(this.mode, this.card && this.card.id,
        {
          list_id: this.list.id,
          board_id: this.list.board_id,
          title,
          description: description.trim(),
          attachments: attachments && attachments.trim(),
          position: this.position
        });
      this.onCancel();
    } catch (err) {
      console.log(err);
    }
  }

  public onCancel(): void {
    this.dialogRef.close();
  }
}
