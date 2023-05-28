import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {
  constructor(private snackBar: MatSnackBar) { }

  public showSnackBar(message: string = '', duration: number = 2000) {
    this.snackBar._openedSnackBarRef?.dismiss();
    this.snackBar.open(message, '', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: duration
    });
  }

  public showLoadingSnackBar(message: string = 'Please wait...') {
    this.showSnackBar(message, -1);
  }

  public hideLoadingSnackBar() {
    this.snackBar._openedSnackBarRef?.dismiss();
  }

  public closeSnackBar() {
    this.snackBar.dismiss();
  }

  public removeKey(key: string, { [key]: _, ...rest }) {
    return rest;
  }
}
