import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  private _listId: string = '';

  constructor (
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this._listId = params['listId'];
      }
    )
  }

  createTask (title: string) {
    this.taskService.createTask(title, this._listId).subscribe((task: any)  => {
      // We use relative routing to go back one step, onto the lists page
      this.router.navigate(['../'],  { relativeTo: this.route });
    });
  };


}
