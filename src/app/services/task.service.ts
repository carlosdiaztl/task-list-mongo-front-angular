import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model'; // Asegúrate de que el modelo exista

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = environment.apiUrl+'/task'; // cambia a tu URL

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTask(id: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}


  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

 updateTask(task: Task): Observable<Task> {
  console.log('Updating task:', task._id);
  return this.http.put<Task>(`${this.apiUrl}/${task._id}`, task);
}


  deleteTask(id: string): Observable<void> {
    console.log('Deleting task with ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
