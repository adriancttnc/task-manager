import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor (
    private webReqService: WebRequestService
  ) { }

  createList (title: string) {
    // We want to send a web request to create a list.
    return this.webReqService.post('lists', { title });
  }

  getLists () {
    // We want to send a web request to get all the lists.
    return this.webReqService.get('lists');
  }

  getTasks (listId: string) {
    // We want to send a web request to get all the tasks for a specific list.
    return this.webReqService.get(`lists/${listId}/tasks`);
  }
}
