// src/app/models/task.model.ts

export interface TaskHistoryEntry {
  timestamp: Date; // Usamos Date porque la convertimos en el servicio
  changeType: string;
  fieldChanged?: string; // Opcional
  oldValue?: string;    // Opcional
  newValue?: string;    // Opcional
  description: string;
}

export interface Task {
  _id?: string; // El ID de MongoDB, opcional porque no lo tiene al crear una tarea nueva
  id: string; // Un ID que puedes usar en el frontend antes de que MongoDB asigne _id
  title: string;
  description?: string; // Opcional, ya que no siempre lo especificaste en tus ejemplos anteriores
  status: 'Pending' | 'In Progress' | 'Completed'; // Usa uniones literales para estados específicos
  priority: 'Low' | 'Medium' | 'High';     // Usa uniones literales para prioridades específicas
  dueDate: Date; // Usamos Date porque la convertimos en el servicio
  tags: string[];
  history?: TaskHistoryEntry[]; // Opcional, para registrar cambios
  createdAt?: Date; // Opcional, creado por el backend
  updatedAt?: Date; // Opcional, actualizado por el backend
  __v?: number; // Opcional, versión de Mongoose/MongoDB
}