import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

export interface iSnackbarConfig {
  title: string;
  message?: string;
  horizontalPosition?: MatSnackBarHorizontalPosition;
  verticalPosition?: MatSnackBarVerticalPosition;
  /** Duration to be specified in milliseconds. */
  duration?: number;
  panelClass?: string;
}
