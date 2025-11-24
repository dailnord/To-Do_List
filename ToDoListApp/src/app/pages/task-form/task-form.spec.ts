import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { TaskFormComponent } from './task-form';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let router: jasmine.SpyObj<Router>;
  let route: ActivatedRoute;

  const mockTask: Task = {
    id: 1,
    title: 'Existing Task',
    description: 'Existing Description',
    isCompleted: false,
    dueDate: new Date('2024-12-31')
  };

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getById', 'create', 'update']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        TaskFormComponent,
        ReactiveFormsModule
      ],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}) // Default: no params (create mode)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute);
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      fixture.detectChanges();
      expect(component.taskForm.value).toEqual({
        title: '',
        description: '',
        dueDate: '',
        isCompleted: false
      });
    });

    it('should set isEditMode to false by default', () => {
      fixture.detectChanges();
      expect(component.isEditMode).toBeFalse();
    });

    it('should load task when in edit mode', () => {
      // Arrange
      const params = { id: '1' };
      (route.params as any) = of(params);
      taskService.getById.and.returnValue(of(mockTask));
      
      // Recreate component to trigger ngOnInit
      fixture = TestBed.createComponent(TaskFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // Assert
      expect(component.isEditMode).toBeTrue();
      expect(component.taskId).toBe(1);
      expect(taskService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('UI Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display "New Task" title in create mode', () => {
      const titleElement = fixture.debugElement.query(By.css('.card-title'));
      expect(titleElement.nativeElement.textContent).toContain('New Task');
    });

    it('should display "Edit Task" title in edit mode', () => {
      component.isEditMode = true;
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.card-title'));
      expect(titleElement.nativeElement.textContent).toContain('Edit Task');
    });

    it('should render all form fields', () => {
      const titleInput = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      const descriptionTextarea = fixture.debugElement.query(By.css('textarea[formControlName="description"]'));
      const statusSelect = fixture.debugElement.query(By.css('select[formControlName="isCompleted"]'));
      const dueDateInput = fixture.debugElement.query(By.css('input[formControlName="dueDate"]'));

      expect(titleInput).toBeTruthy();
      expect(descriptionTextarea).toBeTruthy();
      expect(statusSelect).toBeTruthy();
      expect(dueDateInput).toBeTruthy();
    });

    it('should have correct placeholder texts', () => {
      const titleInput = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      const descriptionTextarea = fixture.debugElement.query(By.css('textarea[formControlName="description"]'));

      expect(titleInput.nativeElement.placeholder).toBe('Enter task title');
      expect(descriptionTextarea.nativeElement.placeholder).toBe('Describe the task');
    });

    it('should display completion status options', () => {
      const statusSelect = fixture.debugElement.query(By.css('select[formControlName="isCompleted"]'));
      const options = statusSelect.nativeElement.querySelectorAll('option');

      expect(options.length).toBe(2);
      expect(options[0].textContent).toContain('Pending');
      expect(options[1].textContent).toContain('Completed');
      expect(options[0].value).toBe('false');
      expect(options[1].value).toBe('true');
    });
  });

  describe('Form Validation UI', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show title required error when title is empty and touched', () => {
      const titleControl = component.taskForm.get('title');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(By.css('.error-message'));
      const requiredError = errorMessages.find(msg => 
        msg.nativeElement.textContent.includes('Title is required')
      );

      expect(requiredError).toBeTruthy();
    });

    it('should show title minlength error when title is too short and touched', () => {
      const titleControl = component.taskForm.get('title');
      titleControl?.setValue('ab');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(By.css('.error-message'));
      const minlengthError = errorMessages.find(msg => 
        msg.nativeElement.textContent.includes('Minimum 3 characters required')
      );

      expect(minlengthError).toBeTruthy();
    });

    it('should show description required error when description is empty and touched', () => {
      const descriptionControl = component.taskForm.get('description');
      descriptionControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(By.css('.error-message'));
      const requiredError = errorMessages.find(msg => 
        msg.nativeElement.textContent.includes('Description is required')
      );

      expect(requiredError).toBeTruthy();
    });

    it('should show description minlength error when description is too short and touched', () => {
      const descriptionControl = component.taskForm.get('description');
      descriptionControl?.setValue('short');
      descriptionControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(By.css('.error-message'));
      const minlengthError = errorMessages.find(msg => 
        msg.nativeElement.textContent.includes('Minimum 10 characters required')
      );

      expect(minlengthError).toBeTruthy();
    });

    it('should not show error messages when fields are pristine', () => {
      const errorMessages = fixture.debugElement.queryAll(By.css('.error-message'));
      expect(errorMessages.length).toBe(0);
    });
  });

  describe('Button States', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]')
      ).nativeElement;
      
      expect(submitButton.disabled).toBeTrue();
    });

    it('should enable submit button when form is valid', () => {
      component.taskForm.patchValue({
        title: 'Valid Task Title',
        description: 'This is a valid description that meets the minimum length requirement of 10 characters'
      });
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]')
      ).nativeElement;
      
      expect(submitButton.disabled).toBeFalse();
    });

    it('should show "Create Task" on submit button in create mode', () => {
      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]')
      ).nativeElement;
      
      expect(submitButton.textContent).toContain('Create Task');
    });

    it('should show "Update Task" on submit button in edit mode', () => {
      component.isEditMode = true;
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(
        By.css('button[type="submit"]')
      ).nativeElement;
      
      expect(submitButton.textContent).toContain('Update Task');
    });

    it('should have cancel button enabled', () => {
      const cancelButton = fixture.debugElement.query(
        By.css('button.btn-outline')
      ).nativeElement;
      
      expect(cancelButton.disabled).toBeFalse();
      expect(cancelButton.textContent).toContain('Cancel');
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should submit form when valid and create task', () => {
      // Arrange
      component.taskForm.patchValue({
        title: 'New Task Title',
        description: 'This is a valid description for the task',
        dueDate: '2024-12-31',
        isCompleted: false
      });
      taskService.create.and.returnValue(of({} as Task));

      // Act
      component.onSubmit();

      // Assert
      expect(taskService.create).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should submit form when valid and update task in edit mode', () => {
      // Arrange
      component.isEditMode = true;
      component.taskId = 1;
      component.taskForm.patchValue({
        title: 'Updated Task Title',
        description: 'Updated task description',
        dueDate: '2024-12-31',
        isCompleted: true
      });
      taskService.update.and.returnValue(of(undefined));

      // Act
      component.onSubmit();

      // Assert
      expect(taskService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should not submit when form is invalid', () => {
      // Form is invalid by default
      component.onSubmit();

      expect(taskService.create).not.toHaveBeenCalled();
      expect(taskService.update).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Operation', () => {
    it('should navigate to tasks list when cancel button is clicked', () => {
      // Simulate button click
      const cancelButton = fixture.debugElement.query(
        By.css('button.btn-outline')
      );
      cancelButton.triggerEventHandler('click', null);

      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('should navigate to tasks list when onCancel method is called', () => {
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });
  });

  describe('Form Population in Edit Mode', () => {
    it('should populate form with task data when loading existing task', () => {
      // Arrange
      const params = { id: '1' };
      (route.params as any) = of(params);
      taskService.getById.and.returnValue(of(mockTask));
      
      // Recreate component
      fixture = TestBed.createComponent(TaskFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      // Assert form is populated
      expect(component.taskForm.value.title).toBe('Existing Task');
      expect(component.taskForm.value.description).toBe('Existing Description');
      expect(component.taskForm.value.isCompleted).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle task loading error gracefully', () => {
      // Arrange
      const params = { id: '1' };
      (route.params as any) = of(params);
      const consoleSpy = spyOn(console, 'error');
      taskService.getById.and.returnValue(throwError(() => new Error('Load failed')));
      
      // Recreate component - should not crash
      fixture = TestBed.createComponent(TaskFormComponent);
      component = fixture.componentInstance;
      
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle form submission errors', () => {
      // Arrange
      component.taskForm.patchValue({
        title: 'Valid Title',
        description: 'Valid description length'
      });
      const consoleSpy = spyOn(console, 'error');
      taskService.create.and.returnValue(throwError(() => new Error('Create failed')));

      // Act
      component.onSubmit();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error creating task:', jasmine.any(Error));
    });
  });
});