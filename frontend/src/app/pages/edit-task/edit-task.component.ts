import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '@interfaces/task';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss']
})
export class EditTaskComponent implements OnInit {

  @ViewChild('taskTitleInput', { static: true }) input: ElementRef = {} as ElementRef;

  constructor (
    @Inject(MAT_DIALOG_DATA) private data: { task: Task },
    private dialogRef: MatDialogRef<EditTaskComponent>,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // Look out for any keys pressed.
    this.dialogRef.keydownEvents().subscribe((event) => {
      // If the 'Enter' key is pressed, then update the task.
      if (event.key === 'Enter') {
        this.updateTask(this.input.nativeElement.value);
      }
    });
  }

  updateTask (title: string) {
    this.taskService.updateTask(title, this.data.task._listId, this.data.task._id).subscribe((response: Task) => {
       // If we've got a task id (response._id) it means we've updated the task successfully. Close the dialog and return the task.
       if (response?._id) {
        this.closeDialog(response);
      }
      return response;
    });
  }

  closeDialog(data?: Task) {
    this.dialogRef.close(data);
  }

}
