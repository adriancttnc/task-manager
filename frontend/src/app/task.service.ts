import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor (
    private webReqService: WebRequestService
  ) { }
  
  getLists () {
    // We want to send a web request to get all the lists.
    return this.webReqService.get('lists');
  }

  createList (title: string) {
    // We want to send a web request to create a list.
    return this.webReqService.post('lists', { title });
  }

  getTasks (listId: string) {
    // We want to send a web request to get all the tasks for a specific list.
    return this.webReqService.get(`lists/${listId}/tasks`);
  }

  createTask (title: string, listId: string) {
    // We want to send a web request to create a task for a specific list.
    return this.webReqService.post(`lists/${listId}/tasks`, { title });
  }
}
