import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { List } from 'src/app/models/list.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  @ViewChild('listTitleInput', { static: true}) input: ElementRef = {} as ElementRef;

  constructor (
    private dialogRef: MatDialogRef<NewListComponent>,
    private taskService: TaskService,
  ) {}

  ngOnInit (): void {
    this.dialogRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Enter') {
        this.createList(this.input.nativeElement.value);
      }
    });
  }

  public createList (title: string) {
    this.taskService.createList(title).subscribe((response: List) => {
      // If we've got a list id (response._id) it means we've created the list successfully. Close the dialog and return the list.
        if (response._id) {
        this.dialogRef.close(response);
      }
      return response;
    });
  }

  public closeDialog (data?: List) {
    this.dialogRef.close(data);
  }
}
