import { Component, ChangeDetectionStrategy, signal, Signal, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent implements OnDestroy {
  private _onDestroy: Subject<void> = new Subject();
  
  form!: FormGroup;
  isLoading: Signal<boolean> = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.isLoading = this.authService.isLoading;
    this.setupForm();
  }


  public setupForm(): void {
    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.signIn();
    }
  }

  private signIn() {
    const { email, password } = this.form.value;
    this.authService.signIn(email, password).pipe(
      takeUntil(this._onDestroy)
    ).subscribe({
      next: () => {
        this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
