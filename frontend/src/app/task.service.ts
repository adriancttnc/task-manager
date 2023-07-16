import { Injectable } from '@angular/core';
import { Task } from '@interfaces/task';
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

  updateList (listId: string, title: string) {
    // We want to send a web request to update a list.
    return this.webReqService.patch(`lists/${listId}`, { title });
  }

  deleteList (listId: string) {
    // we want to send a web request to delete a list.
    return this.webReqService.delete(`lists/${listId}`)
  }

  getTasks (listId: string) {
    // We want to send a web request to get all the tasks for a specific list.
    return this.webReqService.get(`lists/${listId}/tasks`)
  }

  createTask (title: string, listId: string) {
    // We want to send a web request to create a task for a specific list.
    return this.webReqService.post(`lists/${listId}/tasks`, { title });
  }

  updateTask (title: string, listId: string, taskId: string) {
    // We want to send a web request to update a task for a specific list.
    return this.webReqService.patch(`lists/${listId}/tasks/${taskId}`, { title });
  }

  deleteTask (task: Task) {
    // We want to send a web request to delete a task for a specific list.
    return this.webReqService.delete(`lists/${task._listId}/tasks/${task._id}`);
  }

  changeTaskState (task: Task) {
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`, { completed: !task.completed });
  }
}
