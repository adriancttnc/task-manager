import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private dialogConfig: MatDialogConfig = {
    disableClose: true,
    panelClass: 'title'
  }

  constructor (
    private dialog: MatDialog
  ) {}

  public openModal<T = unknown> (component: ComponentType<T>, config?: MatDialogConfig) {
    return this.dialog.open(component, {
      data: config?.data,
      ...this.dialogConfig
    });
  }

}
