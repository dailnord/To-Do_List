import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    
    // Maneja cualquier petición HTTP que haga el servicio al inicializarse
    const requests = httpTestingController.match('http://localhost:5205/api/tasks');
    requests.forEach(req => req.flush([]));
  });

  it('should handle HTTP requests without errors', () => {
    // Esta prueba verifica que el servicio se inicializa correctamente
    // y que no hay peticiones HTTP pendientes después del test
    const req = httpTestingController.expectOne('http://localhost:5205/api/tasks');
    req.flush([]);
    
    expect(service).toBeTruthy();
  });
});