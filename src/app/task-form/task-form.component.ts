// src/app/task-form/task-form.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

// Nuevas importaciones para autocompletado:
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs'; // Importa Observable, startWith, map

import { Task } from '../models/task.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { TaskListComponent } from '../task-list/task-list.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,

    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule, // <-- ¡NUEVO! Para el autocompletado de tags
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode: boolean = false;
  currentTask: Task | null = null;

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  // Propiedades para el autocompletado de tags
  allTags: string[] = []; // Todos los tags únicos cargados desde el servicio
  filteredTags!: Observable<string[]>; // Tags filtrados para el autocompletado
  tagInputControl = new FormControl(); // FormControl para el campo de entrada de tags

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService, // <-- Inyecta TaskService
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task }
  ) {
    if (data.task) {
      this.isEditMode = true;
      this.currentTask = data.task;
    }
  }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: [
        this.currentTask?.title || '',
        [Validators.required, Validators.minLength(3)],
      ],
      dueDate: [
        this.currentTask?.dueDate ? new Date(this.currentTask.dueDate) : null,
        [this.dateNotInPastValidator],
      ],
      status: [this.currentTask?.status || 'Pending', Validators.required],
      priority: [this.currentTask?.priority || 'Medium', Validators.required],
      tags: this.fb.array(this.currentTask?.tags || []),
    });

    // Suscribirse a los tags únicos del servicio
    //     this.taskService. getUniqueTags().subscribe(tags => {
    //   this.allTags = tags;
    // });

    // Configurar el autocompletado
    this.filteredTags = this.tagInputControl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) =>
        tag ? this._filterTags(tag) : this.allTags.slice()
      )
    );
  }

  dateNotInPastValidator(
    control: FormControl
  ): { [key: string]: boolean } | null {
    const date = control.value;
    if (date && date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return { pastDate: true };
    }
    return null;
  }

  get tags(): FormArray {
    return this.taskForm.get('tags') as FormArray;
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    this.addTagIfUnique(value);
    event.chipInput!.clear();
    this.tagInputControl.setValue(null); // Limpiar también el control del autocompletado
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    this.addTagIfUnique(event.option.viewValue);
    this.tagInputControl.setValue(null); // Limpiar el input después de seleccionar
  }

  private addTagIfUnique(value: string): void {
    const lowerCaseValue = value.toLowerCase();
    // Agrega el tag solo si no existe ya en la lista de tags del formulario
    if (
      value &&
      !this.tags.value.some(
        (tag: string) => tag.toLowerCase() === lowerCaseValue
      )
    ) {
      this.tags.push(this.fb.control(value));
    }
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    // Filtra los tags únicos que no están ya seleccionados en el formulario
    return this.allTags.filter(
      (tag) =>
        tag.toLowerCase().includes(filterValue) &&
        !this.tags.value.some(
          (selectedTag: string) =>
            selectedTag.toLowerCase() === tag.toLowerCase()
        )
    );
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData: Task = {
        _id: this.currentTask?._id || '',
        title: formValue.title,
        dueDate: formValue.dueDate,
        status: formValue.status,
        priority: formValue.priority,
        tags: formValue.tags,
        history: this.currentTask?.history,
      };

      if (this.isEditMode && this.currentTask) {
        this.taskService
          .updateTask({ ...this.currentTask, ...taskData })
          .subscribe({
            next: () => this.dialogRef.close(true), // SOLO aquí
            error: (err) => {
              console.error('Error updating task:', err);
            },
          });
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: () => this.dialogRef.close(true), // SOLO aquí
          error: (err) => {
            console.error('Error creating task:', err);
          },
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
