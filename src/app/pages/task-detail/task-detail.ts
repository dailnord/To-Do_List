import { Component, OnInit, OnDestroy, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.css']
})

export class TaskDetailComponent implements OnInit, OnDestroy {
  task?: Task;
  taskId?: number;
  isLoading = true;
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.taskId = +params['id'];
      this.loadTask(this.taskId);
    });
  }

  loadTask(id: number): void {
    this.isLoading = true;
    const taskSub = this.taskService.getById(id).subscribe({
      next: (task) => {
        this.task = task;
        this.isLoading = false;
        this.cdr.detectChanges(); // ← Forzar detección de cambios
        console.log('✅ Component updated with task');
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.isLoading = false;
        this.cdr.detectChanges(); // ← Forzar detección de cambios incluso en error
        this.router.navigate(['/tasks']);
      }
    });
    this.subscription.add(taskSub);
  }

  editTask(): void {
    if (this.taskId) {
      this.router.navigate(['/tasks/edit', this.taskId]);
    }
  }

  deleteTask(): void {
    if (this.taskId && confirm('Are you sure you want to delete this task?')) {
      const deleteSub = this.taskService.delete(this.taskId).subscribe({
        next: () => {
            this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
      this.subscription.add(deleteSub);
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

toggleComplete(): void {
    if (this.task && this.taskId) {
      const updatedTask: Task = {
        ...this.task,
        isCompleted: !this.task.isCompleted
      };
      
      const updateSub = this.taskService.update(this.taskId, updatedTask).subscribe({
        next: () => {
            this.task = updatedTask;
        },
        error: (error) => {
          console.error('Error updating task:', error);
        }
      });
      this.subscription.add(updateSub);
    }
  }

  getStatusText(isCompleted: boolean): string {
    return isCompleted ? 'Completed' : 'Pending';
  }

  getStatusColor(isCompleted: boolean): string {
    return isCompleted ? 'primary' : 'warn';
  }

  getDaysRemaining(dueDate?: Date): string {
    if (!dueDate) {
      return 'No due date';
    }

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days remaining`;
    }
}

  getDaysRemainingClass(dueDate?: Date): string {
    if (!dueDate) {
      return 'days-none';
    }
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'days-urgent';
    if (diffDays <= 3) return 'days-warning';
    return 'days-ok';
}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}