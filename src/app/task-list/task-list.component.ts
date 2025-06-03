import { TaskService } from '../services/task.service';
// src/app/task-list/task-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- ¡IMPORTANTE! Para *ngIf, *ngFor, pipes como 'date'
import { FormsModule } from '@angular/forms'; // <-- ¡IMPORTANTE! Para [(ngModel)] en los filtros

import { Task } from '../models/task.model';

// Importaciones de Angular Material:
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; // <-- ¡Aquí está MatPaginatorModule!
import { MatSort, MatSortModule } from '@angular/material/sort'; // <-- ¡Aquí está MatSortModule!
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider'; // Para <mat-divider>

// Importa los componentes que se abrirán como diálogos:
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskHistoryComponent } from '../task-history/task-history.component';

@Component({
  selector: 'app-task-list',
  standalone: true, // <-- ¡ESTO ES CLAVE! Declara el componente como independiente
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
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'title',
    'status',
    'priority',
    'dueDate',
    'tags',
    'actions',
  ];
  dataSource = new MatTableDataSource<Task>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter options
  filterStatus: string = '';
  filterPriority: string = '';
  filterTags: string = ''; // Comma-separated tags
  searchTitle: string = '';

  allTasks: Task[] = []; // To hold the original unfiltered list

  constructor(private taskService: TaskService, private dialog: MatDialog) {}

ngOnInit(): void {
  this.loadAndApplyTasks();
}
loadAndApplyTasks(): void {
  this.taskService.getTasks().subscribe({
    next: (response: any) => {
      this.allTasks = response.data;
      this.applyFilters();
    },
    error: (err) => console.error('Failed to load tasks:', err),
  });
}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom sorting for date and tags if needed (e.g., date as string)
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'dueDate':
          return item.dueDate.getTime(); // Sort by timestamp
        default:
          return (item as any)[property];
      }
    };
  }

  applyFilters(): void {
    let filteredTasks = [...this.allTasks]; // Start with all tasks

    // Filter by Status
    if (this.filterStatus) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === this.filterStatus
      );
    }

    // Filter by Priority
    if (this.filterPriority) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === this.filterPriority
      );
    }

    // Filter by Tags
    if (this.filterTags) {
      const tagsToFilter = this.filterTags
        .toLowerCase()
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      filteredTasks = filteredTasks.filter((task) =>
        tagsToFilter.every((filterTag) =>
          task.tags.some((taskTag) => taskTag.toLowerCase().includes(filterTag))
        )
      );
    }

    // Search by Title
    if (this.searchTitle) {
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(this.searchTitle.toLowerCase())
      );
    }

    this.dataSource.data = filteredTasks;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); // Reset pagination
    }
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterTags = '';
    this.searchTitle = '';
    this.applyFilters();
  }

  editTask(task: Task): void {
    this.openTaskForm(task); // Llama al método para abrir el diálogo de edición
  }

  deleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { message: `Are you sure you want to delete "${task.title}"?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.deleteTask(task._id).subscribe({
          next: () => {
            console.log('Task deleted successfully');
        this.loadAndApplyTasks();
          },
          error: (err) => {
            console.error('Error deleting task:', err);
          },
        });
      }
    });
  }
 
  openTaskForm(task?: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px', // Ajusta el ancho según necesites
      data: { task: task }, // Pasa la tarea si es modo edición, undefined para nueva tarea
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // La tarea fue añadida/actualizada, el BehaviorSubject en TaskService
        // ya se encarga de que la tabla se actualice automáticamente.
        this.loadAndApplyTasks();
        console.log('Task form closed, changes saved.');
      }
    });
  }

  showHistory(task: Task['_id']): void {
    this.dialog.open(TaskHistoryComponent, {
      width: '500px',
      data: { task_id: task }, // Pasa el ID de la tarea para cargar su historial
    });
  }

  // Helper to display tags nicely
  formatTags(tags: string[]): string {
    return tags.join(', ');
  }
}
