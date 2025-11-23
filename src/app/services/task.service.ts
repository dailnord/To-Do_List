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

  // Método centralizado para obtener y parsear tareas
  private getTasksFromApi(): Observable<Task[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(tasks => tasks.map(task => this.parseTask(task)))
    );
  }

  // Parsear una tarea individual
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
  console.log('🔍 [Service] Getting task by ID:', id);
  
  return new Observable(observer => {
    this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(rawTask => {
        console.log('📦 [Service] Raw response from API:', rawTask);
        console.log('📦 [Service] Raw dueDate:', rawTask?.dueDate, 'Type:', typeof rawTask?.dueDate);
        
        const parsedTask = this.parseDate(rawTask);
        console.log('🔄 [Service] Parsed task:', parsedTask);
        console.log('🔄 [Service] Parsed dueDate:', parsedTask.dueDate, 'Type:', typeof parsedTask.dueDate);
        
        return parsedTask;
      })
    ).subscribe({
      next: (task) => {
        console.log('✅ [Service] Task ready to send to component:', task);
        observer.next(task);
        observer.complete();
      },
      error: (error) => {
        console.error('❌ [Service] Error getting task:', error);
        observer.error(error);
      }
    });
  });
}

private parseDate(task: any): Task {
  console.log('🛠️ [Service] Parsing task:', task);
  
  if (!task) {
    console.warn('🛠️ [Service] Task is null or undefined');
    return task;
  }
  
  const parsedTask: Task = {
    id: task.id,
    title: task.title,
    description: task.description,
    isCompleted: task.isCompleted,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined
  };
  
  console.log('🛠️ [Service] After parsing:', parsedTask);
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