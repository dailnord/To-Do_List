export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate?: Date;
  isCompleted: boolean;
}

export type CreateTask = Omit<Task, 'id'>;
export type UpdateTask = Partial<CreateTask>;