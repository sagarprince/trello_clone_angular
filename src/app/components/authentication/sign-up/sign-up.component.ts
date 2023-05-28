import { Component, ChangeDetectionStrategy, signal, Signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent {
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
    // this.dummyUserGenerator();
  }


  public setupForm(): void {
    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      profilePicUrl: new FormControl('', [Validators.pattern(/\b((?:https?|http?):\/\/[^\s/$.?#].[^\s]*)\.(?:jpg|jpeg|gif|png|bmp|svg)\b/)]),
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.signUp();
    }
  }

  private signUp() {
    const { email, password, firstName, lastName, profilePicUrl = '' } = this.form.value;
    this.authService.signUp(email, password, {
      firstName,
      lastName,
      profilePicUrl
    }).pipe(
      takeUntil(this._onDestroy)
    ).subscribe({
      next: (data) => {
        this.authService.addUser(data.user?.id, email, {
          firstName,
          lastName,
          profilePicUrl
        }).pipe(
          takeUntil(this._onDestroy)
        ).subscribe(() => {
          this.router.navigateByUrl('/dashboard', { replaceUrl: true });
        });
      }
    });
  }

  private dummyUserGenerator() {
    let i = 0;
    while (i < 45) {
      fetch('https://randomuser.me/api/?nat=in&randomapi&gender=male')
        .then((response) => response.json())
        .then((response) => response.results && response.results.length > 0 && response.results[0] || null)
        .then((user) => {
          console.log(user);
          if (user) {
            const { name: { first: firstName, last: lastName }, email: userEmail, picture: { medium: profilePicUrl } } = user;
            const email = userEmail.replace('@example.com', '@mail.com');
            console.log(firstName, lastName, email, profilePicUrl);
            const password = '123456';
            this.authService.signUp(email, password, {
              firstName,
              lastName,
              profilePicUrl
            }).pipe(
              takeUntil(this._onDestroy)
            ).subscribe({
              next: (data) => {
                console.log(data);
                this.authService.addUser(data.user?.id, email, {
                  firstName,
                  lastName,
                  profilePicUrl
                }).pipe(
                  takeUntil(this._onDestroy)
                ).subscribe(() => {
                  // this.router.navigateByUrl('/dashboard', { replaceUrl: true });
                  this.authService.logout().subscribe();
                });
              }
            });
          }
        });
      i++;
    }
  }
}
