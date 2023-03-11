import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  public lists: List[] = [];
  public tasks: Task[] | undefined = [];

  selectedListId = '';

  constructor (
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['listId']) {
        this.selectedListId = params['listId'];
        this.taskService.getTasks(params['listId']).subscribe((tasks: Task[]) => {
          this.tasks = tasks;
        });
      } else {
        this.tasks = undefined;
      }
    });

    this.taskService.getLists().subscribe((lists: List[]) => {
      this.lists = lists;
    })
  }

  onTaskClick (task: Task) {
    // We want to set the task to completed
    this.taskService.changeTaskState(task).subscribe(() => {
      // Once the task has been set to completed successfully.
        task.completed = !task.completed;
    });
  }

  onDeleteList () {
    // We want to delete the selected list.
    this.taskService.deleteList(this.selectedListId).subscribe((res) => {
      // Remove the list from the local array.
      this.lists = this.lists.filter(list => list._id !== this.selectedListId);
      // Blank selectedListId.
      this.selectedListId = '';
      // Remove the listId from the URL.
      this.router.navigate([''], { queryParams: {} });
    });
  }

}
