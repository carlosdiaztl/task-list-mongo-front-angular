import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator'; // <-- ¡Aquí está MatPaginatorModule!
import {  MatSortModule } from '@angular/material/sort'; // <-- ¡Aquí está MatSortModule!
import {  MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider'; // Para <mat-divider>
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  standalone: true,
  selector: 'app-task-history',
  templateUrl: './task-history.component.html',
   imports: [
    // <-- ¡Y ESTE ARRAY DE IMPORTS ES CLAVE!
    CommonModule, // Necesario para directivas estructurales (*ngIf, *ngFor) y pipes (como 'date')
    FormsModule, // Necesario para [(ngModel)] en los campos de filtro y búsqueda

    // Módulos de Angular Material que usa este componente:
    MatTableModule,
    MatPaginatorModule, // Para <mat-paginator> y sus propiedades como 'pageSizeOptions'
    MatSortModule, // Para mat-sort-header
    MatButtonModule, // Para mat-button, mat-raised-button, mat-icon-button
    MatIconModule, // Para <mat-icon>
    MatFormFieldModule, // Para <mat-form-field>
    MatInputModule, // Para matInput
    MatSelectModule, // Para <mat-select>
    MatChipsModule, // Para <mat-chip-listbox>, <mat-chip>
    MatDialogModule, // Para MatDialog (para abrir diálogos)
    MatDividerModule, // Para <mat-divider>

    // Los componentes que se abren como diálogos también deben estar en los imports
    // si son standalone y se usan en el template, o si se abren vía MatDialog.open()
    ConfirmationDialogComponent,
    TaskFormComponent,
    TaskHistoryComponent,
  ],
})
export class TaskHistoryComponent implements OnInit {
  history: any[] = [];
  loading = true;

  displayedColumns: string[] = ['timestamp', 'changeType', 'fieldChanged', 'oldValue', 'newValue', 'description'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task_id: string },
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    console.log('Task ID from dialog data:', this.data);
    this.taskService.getTask(this.data.task_id).subscribe({
      next: (res: any) => {
        const task: Task = res.data;
        this.history = task?.history || [];
        console.log('Task history:', this.history);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
   formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    // If it's not an array, just return its string representation
    return String(value);
  }
}
