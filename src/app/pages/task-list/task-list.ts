import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})

export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  isLoading = true;
  displayedColumns: string[] = ['title', 'actions', 'dueDate', 'status',];

  constructor(
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getAll().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewTask(id: number): void {
    this.router.navigate(['/tasks', id]);
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  editTask(id: number): void {
    this.router.navigate(['/tasks/edit', id]);
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.delete(id).subscribe({
        next: () => {
            this.loadTasks();
            this.isLoading = false;
            this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  addTask(): void {
    this.router.navigate(['/tasks/new']);
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  getStatusColor(isCompleted: boolean): string {
    return isCompleted ? 'accent' : 'warn';
  }

  getStatusText(isCompleted: boolean): string {
    return isCompleted ? 'Completed' : 'Pending';
  }
}
