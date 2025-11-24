import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:5205/api/tasks';
  private tasks: Task[] = [];
  private tasks$ = new BehaviorSubject<Task[]>(this.tasks);

  constructor(private http: HttpClient) {
    this.loadInitialTasks();
  }

  private loadInitialTasks(): void {
    this.getTasksFromApi().subscribe(tasks => {
      this.tasks = tasks;
      this.tasks$.next(this.tasks);
    });
  }

  private getTasksFromApi(): Observable<Task[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(tasks => tasks.map(task => this.parseTask(task)))
    );
  }

  private parseTask(task: any): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    };
  }

  getAll(): Observable<Task[]> {
    return this.tasks$.asObservable();
  }

  getById(id: number): Observable<Task> {
    return new Observable(observer => {
      this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
        map(rawTask => {
          const parsedTask = this.parseDate(rawTask);
          return parsedTask;
        })
      ).subscribe({
        next: (task) => {
          observer.next(task);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
}

private parseDate(task: any): Task {
  if (!task) {
    return task;
  }
  
  const parsedTask: Task = {
    id: task.id,
    title: task.title,
    description: task.description,
    isCompleted: task.isCompleted,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined
  };
  return parsedTask;
}

  create(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<any>(this.apiUrl, task).pipe(
      map(newTask => this.parseTask(newTask)),
      tap(newTask => {
        this.tasks.push(newTask);
        this.tasks$.next(this.tasks);
      })
    );
  }

  update(id: number, task: Task): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, task).pipe(
      tap(() => {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          this.tasks[idx] = task;
          this.tasks$.next(this.tasks);
        }
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.tasks$.next(this.tasks);
      })
    );
  }
}