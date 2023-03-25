import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  public dialogRef: any;
  private dialogConfig: MatDialogConfig = {
    disableClose: true,
    panelClass: 'title'
  }

  constructor (
    private dialog: MatDialog
  ) {}

  public openModal<T = unknown> (component: ComponentType<T>, config?: MatDialogConfig) {
     this.dialogRef = this.dialog.open(component, {
      data: config?.data,
      ...this.dialogConfig
    });

    this.dialogRef.afterClosed().subscribe((response: unknown) => {
      return response;
    })

    return this.dialogRef;
  }

  public closeModal () {
    if (this.dialogRef?.close) {
      this.dialogRef.close();
    }
  }
}
