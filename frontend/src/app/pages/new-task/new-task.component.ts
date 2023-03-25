import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit, AfterViewInit {

  @ViewChild('taskTitleInput', { static: true }) input: ElementRef = {} as ElementRef;


  constructor (
    @Inject(MAT_DIALOG_DATA) private data: { _listId: string },
    private dialogRef: MatDialogRef<NewTaskComponent>,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit (): void {
    this.dialogRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Enter') {
        this.createTask(this.input.nativeElement.value);
      }
    });
  }

  ngAfterViewInit() {
    console.log(this.input.nativeElement.value);
  }

  createTask (title: string) {
    this.taskService.createTask(title, this.data._listId).subscribe((response: Task)  => {
      // We use relative routing to go back one step, onto the lists page
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
