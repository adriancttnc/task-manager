import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '@interfaces/task';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  @ViewChild('taskTitleInput', { static: true }) input: ElementRef = {} as ElementRef;

  constructor (
    @Inject(MAT_DIALOG_DATA) private data: { _listId: string },
    private dialogRef: MatDialogRef<NewTaskComponent>,
    private taskService: TaskService,
  ) {}

  ngOnInit (): void {
    // Look out for any keys pressed.
    this.dialogRef.keydownEvents().subscribe((event) => {
      // If the 'Enter' key is pressed, then create the task.
      if (event.key === 'Enter') {
        this.createTask(this.input.nativeElement.value);
      }
    });
  }

  createTask (title: string) {
    this.taskService.createTask(title, this.data._listId).subscribe((response: Task)  => {
      // If we've got a task id (response._id) it means we've created the task successfully. Close the dialog and return the task.
      if (response._id) {
        this.closeDialog(response);
      }
      return response;
    });
  }

  closeDialog (data?: Task) {
    this.dialogRef.close(data);
  }

}
