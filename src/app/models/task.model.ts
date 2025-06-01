// src/app/models/task.model.ts
export interface Task {
  id: string; // Using string for UUIDs or simple string IDs
  title: string;
  status: TaskStatus; // Enforce specific values
  priority: TaskPriority; // Enforce specific values
  dueDate: Date; // Use Date object for easier manipulation
  tags: string[]; // Array of strings
  history?: TaskHistoryEntry[]; // Optional: for task history
}
export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
}
export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}
export interface TaskHistoryEntry {
  timestamp: Date;
  change: string; // e.g., "Status changed from 'To Do' to 'In Progress'"
}