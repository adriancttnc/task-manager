import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { List } from 'src/app/models/list.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss']
})
export class EditListComponent implements OnInit {

  @ViewChild('listTitleInput', { static: true }) input: ElementRef = {} as ElementRef;

  constructor (
    @Inject(MAT_DIALOG_DATA) private data: { _listId: string },
    private dialogRef: MatDialogRef<EditListComponent>,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // Look out for any keys pressed.
    this.dialogRef.keydownEvents().subscribe((event) => {
      // If the 'Enter' key is pressed, then update the list.
      if (event.key === 'Enter') {
        this.updateList(this.input.nativeElement.value);
      }
    });
  }

  updateList (title: string) {
    this.taskService.updateList(this.data._listId, title).subscribe((response: List) => {
      // If we've got a list id (response._id) it means we've updated the list successfully. Close the dialog and return the list.
      if (response?._id) {
        this.closeDialog(response);
      }
      return response;
    });
  }

  closeDialog(data?: List) {
    this.dialogRef.close(data);
  }
}
