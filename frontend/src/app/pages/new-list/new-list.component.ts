import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { List } from 'src/app/models/list.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent {

  constructor (
    private taskService: TaskService,
    private router: Router
  ) {}

  public createList (title: string) {
    this.taskService.createList(title)
      .subscribe((list: List) => {
        // Now we navigate to /lists/list._id
        this.router.navigate(['/lists', list._id]);
      })
  }
}
