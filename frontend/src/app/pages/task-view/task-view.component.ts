import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';
import { ModalService } from 'src/app/shared/modal.service';
import { TaskService } from 'src/app/task.service';
import { EditListComponent } from '../edit-list/edit-list.component';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { NewListComponent } from '../new-list/new-list.component';
import { NewTaskComponent } from '../new-task/new-task.component';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  public lists: List[] = [];
  public tasks: Task[] = [];

  selectedListId = '';

  constructor (
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: ModalService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['listId']) {
        this.selectedListId = params['listId'];
        this.taskService.getTasks(params['listId']).subscribe((tasks: Task[]) => {
          this.tasks = tasks;
        });
      } else {
        this.tasks = [];
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

  onTaskDelete (task: Task, event: MouseEvent) {
    // Stop propagation of events. e.g. Stop the click-to-complete ability of the task row.
    event.stopPropagation();
    // We want to delete the selected task.
    this.taskService.deleteTask(task).subscribe(() => {
      // Remove the task from the local array.
      this.tasks = this.tasks?.filter(taskItem => taskItem._id !== task._id);
    });
  }

  onDeleteList () {
    // We want to delete the selected list.
    this.taskService.deleteList(this.selectedListId).subscribe(() => {
      // Remove the list from the local array.
      this.lists = this.lists.filter(list => list._id !== this.selectedListId);
      // Blank selectedListId.
      this.selectedListId = '';
      // Remove the listId from the URL.
      this.router.navigate([''], { queryParams: {} });
    });
  }

  addNewTask (listId: string) {
    // Open a modal to add a new task.
    this.modalService.openModal(NewTaskComponent, { data: { _listId: listId } })
      .afterClosed().subscribe((response: Task) => {
        // If we have a new task (response._id is present) then add it to our array.
        if (response?._id) {
          this.tasks?.push(response);
        }
      });
  }

  addNewList () {
    // Open a modal to add a new list.
    this.modalService.openModal(NewListComponent)
      .afterClosed().subscribe((response: List) => {
        // If we have a new list (response._id is present) then add it to our array.
        if (response?._id) {
          this.lists.push(response);
        }
      })
  }

  editList (listId: string) {
    this.modalService.openModal(EditListComponent, { data: { _listId: listId } })
      .afterClosed().subscribe((response: List) => {
        // Ensure we've got a response first.
        if (response) {
          // Get the index of our list.
          const indexToUpdate = this.lists.findIndex(list => list._id === response._id);
          // Check if title has been changed successfully.
          if (this.lists[indexToUpdate].title !== response.title) {
            this.lists[indexToUpdate] = response;
          }
        }
      });
  }

  editTask (task: Task, event: MouseEvent) {
    // Stop propagation of events. e.g. Stop the click-to-complete ability of the task row.
    event.stopPropagation();
    this.modalService.openModal(EditTaskComponent, { data: { task } })
      .afterClosed().subscribe((response: Task) => {
        // Ensure we've got a response first.
        if (response) {
          // Get the index of our task.
          const indexToUpdate = this.tasks?.findIndex(task => task._id === response._id);
          // Check if the title has been changed successfully.
          if (this.tasks[indexToUpdate].title !== response.title) {
            this.tasks[indexToUpdate] = response;
          }
        }
      });
  }

}
