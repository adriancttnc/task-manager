import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { iSnackbarConfig } from '../interfaces/snackbar-config';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  // Change this to change the duration for all snackbar instances.
  private _duration = 5000;

  constructor (
    private snackbar: MatSnackBar,
    private zone: NgZone
  ) { }

  /**
   * Shows the success snackbar.
   */
  public success (config: iSnackbarConfig) {
    const successConfig = config;
    successConfig.panelClass = 'snackbar-success';
    return this.open(successConfig);
  }

  /**
   * Shows the info snackbar.
   */
  public info (config: iSnackbarConfig) {
    const infoConfig = config;
    infoConfig.panelClass = 'snackbar-info';
    return this.open(infoConfig);
  }

  /**
   * Shows the error snackbar.
   */
  public error (config: iSnackbarConfig) {
    const errorConfig = config;
    errorConfig.panelClass = 'snackbar-error';
    return this.open(errorConfig);
  }

  /**
   * Shows the warning snackbar.
   */
  public warning (config: iSnackbarConfig) {
    const errorConfig = config;
    errorConfig.panelClass = 'snackbar-warning';
    return this.open(errorConfig);
  }

  /**
   * Shows the snackbar with all required config options.
   */
  private open (config: iSnackbarConfig) {
    this.zone.run(() => {
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: {
          title: config.title,
          message: config.message,
        },
        horizontalPosition: config.horizontalPosition || 'center',
        verticalPosition: config.verticalPosition || 'top',
        panelClass: config.panelClass,
        duration: config.duration || this._duration
      });
    });
  }


}
