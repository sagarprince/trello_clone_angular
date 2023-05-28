import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, WritableSignal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ListsService } from '../../../../services/lists.service';

@Component({
  selector: 'app-add-new-list-form',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './add-new-list-form.component.html',
  styleUrls: ['./add-new-list-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddNewListFormComponent implements OnDestroy {
  private _onDestroy: Subject<void> = new Subject();
  @Input() boardId: any;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  form!: FormGroup;
  isLoading: WritableSignal<boolean>;

  constructor(private fb: FormBuilder, private listsService: ListsService) {
    this.isLoading = this.listsService.isCRUDLoading;
    this.setupForm();
  }

  public setupForm(): void {
    this.form = this.fb.group({
      title: new FormControl('', [Validators.required]),
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.createList();
    }
  }

  private createList() {
    const { title } = this.form.value;
    this.listsService.createList(this.boardId, title).pipe(
      takeUntil(this._onDestroy)
    ).subscribe(() => {
      this.onCancel();
    });
  }

  public onCancel(): void {
    this.onClose.emit(true);
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
