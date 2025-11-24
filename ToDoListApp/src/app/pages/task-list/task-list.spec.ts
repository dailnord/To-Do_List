import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { TaskListComponent } from './task-list';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

describe('TaskListComponent (Standalone)', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let router: jasmine.SpyObj<Router>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Complete project report',
      description: 'Finish the quarterly project report',
      isCompleted: false,
      dueDate: new Date('2024-12-31')
    },
    {
      id: 2,
      title: 'Team meeting',
      description: 'Weekly team sync',
      isCompleted: true,
      dueDate: new Date('2024-11-25')
    },
    {
      id: 3,
      title: 'Code review',
      description: 'Review PR #456',
      isCompleted: false
    }
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getAll', 'delete']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        TaskListComponent,
        MatTableModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    taskService.getAll.and.returnValue(of(mockTasks));
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set initial loading state to true', () => {
    expect(component.isLoading).toBeTrue();
  });

  it('should have correct displayed columns for table', () => {
    expect(component.displayedColumns).toEqual(['title', 'dueDate', 'status', 'actions']);
  });

  it('should call loadTasks on initialization', () => {
    spyOn(component, 'loadTasks');
    component.ngOnInit();
    expect(component.loadTasks).toHaveBeenCalled();
  });

  it('should load tasks successfully and update loading state', () => {
    component.loadTasks();
    
    expect(taskService.getAll).toHaveBeenCalled();
    expect(component.tasks).toEqual(mockTasks);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle empty task list', () => {
    taskService.getAll.and.returnValue(of([]));
    
    component.loadTasks();
    
    expect(component.tasks).toEqual([]);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle task service error', () => {
    const consoleSpy = spyOn(console, 'error');
    taskService.getAll.and.returnValue(throwError(() => new Error('Server error')));
    
    component.loadTasks();
    
    expect(consoleSpy).toHaveBeenCalledWith('Error loading tasks:', jasmine.any(Error));
    expect(component.isLoading).toBeFalse();
  });

  describe('Table View Rendering', () => {
    beforeEach(() => {
      component.tasks = mockTasks;
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('should display table with correct columns', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('th'));
      const headerTexts = headerCells.map(cell => cell.nativeElement.textContent.trim());
      
      expect(headerTexts).toContain('Title');
      expect(headerTexts).toContain('Due Date');
      expect(headerTexts).toContain('Status');
      expect(headerTexts).toContain('Actions');
    });

    it('should display task titles in table', () => {
      const titleCells = fixture.debugElement.queryAll(By.css('td[mat-cell]:first-child'));
      expect(titleCells.length).toBe(3);
      expect(titleCells[0].nativeElement.textContent).toContain('Complete project report');
      expect(titleCells[1].nativeElement.textContent).toContain('Team meeting');
    });

    it('should display status chips with correct text and colors', () => {
      const statusChips = fixture.debugElement.queryAll(By.css('mat-chip'));
      
      expect(statusChips[0].nativeElement.textContent).toContain('Pending');
      expect(statusChips[1].nativeElement.textContent).toContain('Completed');
      expect(statusChips[2].nativeElement.textContent).toContain('Pending');
    });

    it('should display action buttons for each task in table', () => {
      const actionButtons = fixture.debugElement.queryAll(By.css('td[mat-cell] button[mat-icon-button]'));
      expect(actionButtons.length).toBe(9); // 3 tasks × 3 buttons each
    });
  });

  describe('Card View Rendering', () => {
    beforeEach(() => {
      component.tasks = mockTasks;
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('should display task cards', () => {
      const taskCards = fixture.debugElement.queryAll(By.css('.task-card'));
      expect(taskCards.length).toBe(3);
    });

    it('should display task titles in cards', () => {
      const cardTitles = fixture.debugElement.queryAll(By.css('mat-card-title'));
      expect(cardTitles[0].nativeElement.textContent).toContain('Complete project report');
      expect(cardTitles[1].nativeElement.textContent).toContain('Team meeting');
    });

    it('should display task descriptions in cards', () => {
      const cardContents = fixture.debugElement.queryAll(By.css('mat-card-content p'));
      expect(cardContents[0].nativeElement.textContent).toContain('Finish the quarterly project report');
    });

    it('should display action buttons in cards', () => {
      const cardActions = fixture.debugElement.queryAll(By.css('mat-card-actions button'));
      expect(cardActions.length).toBe(9); // 3 tasks × 3 buttons each
    });
  });

  describe('User Interactions - Table', () => {
    beforeEach(() => {
      component.tasks = mockTasks;
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('should navigate to task detail when view button is clicked in table', () => {
      const viewButtons = fixture.debugElement.queryAll(By.css('td[mat-cell] button[color="primary"]'));
      viewButtons[0].triggerEventHandler('click', null);
      
      expect(router.navigate).toHaveBeenCalledWith(['/tasks', 1]);
    });

    it('should navigate to edit task when edit button is clicked in table', () => {
      const editButtons = fixture.debugElement.queryAll(By.css('td[mat-cell] button[color="accent"]'));
      editButtons[0].triggerEventHandler('click', null);
      
      expect(router.navigate).toHaveBeenCalledWith(['/tasks/edit', 1]);
    });

    it('should call deleteTask when delete button is clicked in table', () => {
      spyOn(component, 'deleteTask');
      const deleteButtons = fixture.debugElement.queryAll(By.css('td[mat-cell] button[color="warn"]'));
      deleteButtons[0].triggerEventHandler('click', null);
      
      expect(component.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  describe('User Interactions - Cards', () => {
    beforeEach(() => {
      component.tasks = mockTasks;
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('should navigate to task detail when view button is clicked in card', () => {
      const viewButtons = fixture.debugElement.queryAll(By.css('mat-card-actions button[color="primary"]'));
      viewButtons[0].triggerEventHandler('click', null);
      
      expect(router.navigate).toHaveBeenCalledWith(['/tasks', 1]);
    });

    it('should navigate to edit task when edit button is clicked in card', () => {
      const editButtons = fixture.debugElement.queryAll(By.css('mat-card-actions button[color="accent"]'));
      editButtons[0].triggerEventHandler('click', null);
      
      expect(router.navigate).toHaveBeenCalledWith(['/tasks/edit', 1]);
    });

    it('should call deleteTask when delete button is clicked in card', () => {
      spyOn(component, 'deleteTask');
      const deleteButtons = fixture.debugElement.queryAll(By.css('mat-card-actions button[color="warn"]'));
      deleteButtons[0].triggerEventHandler('click', null);
      
      expect(component.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  describe('Delete Task Functionality', () => {
    beforeEach(() => {
      component.tasks = mockTasks;
      component.isLoading = false;
    });

    it('should show confirmation dialog before deleting', () => {
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
      taskService.delete.and.returnValue(of(undefined));
      spyOn(component, 'loadTasks');
      
      component.deleteTask(1);
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    });

    it('should delete task when confirmation is accepted', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      taskService.delete.and.returnValue(of(undefined));
      const loadTasksSpy = spyOn(component, 'loadTasks');
      
      component.deleteTask(1);
      
      expect(taskService.delete).toHaveBeenCalledWith(1);
      expect(loadTasksSpy).toHaveBeenCalled();
    });

    it('should not delete task when confirmation is cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteTask(1);
      
      expect(taskService.delete).not.toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const consoleSpy = spyOn(console, 'error');
      taskService.delete.and.returnValue(throwError(() => new Error('Delete failed')));
      
      component.deleteTask(1);
      
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting task:', jasmine.any(Error));
    });
  });

  describe('Add Task Functionality', () => {
    it('should navigate to new task page when add button is clicked', () => {
      component.isLoading = false;
      fixture.detectChanges();

      const addButton = fixture.debugElement.query(By.css('button[color="primary"]'));
      addButton.triggerEventHandler('click', null);
      
      expect(router.navigate).toHaveBeenCalledWith(['/tasks/new']);
    });
  });

  describe('Status Helper Methods', () => {
    it('should return correct status color', () => {
      expect(component.getStatusColor(true)).toBe('accent');
      expect(component.getStatusColor(false)).toBe('warn');
    });
  });



    it('should show table and cards when not loading', () => {
      component.tasks = mockTasks;
      component.isLoading = false;
      fixture.detectChanges();
      
      const table = fixture.debugElement.query(By.css('table'));
      const cards = fixture.debugElement.query(By.css('.cards-container'));
      
      expect(table).toBeTruthy();
      expect(cards).toBeTruthy();
    });
  });

