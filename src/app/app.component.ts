// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Keep if you have routing
import { MatToolbarModule } from '@angular/material/toolbar'; // Needed for mat-toolbar

// <--- IMPORT TaskListComponent HERE --->
import { TaskListComponent } from './task-list/task-list.component';

@Component({
  selector: 'app-root',
  standalone: true, // This component is standalone
  imports: [
    RouterOutlet,       // Keep if you have routing configured
    MatToolbarModule,   // Add MatToolbarModule for the toolbar
    TaskListComponent   // <--- ADD TaskListComponent HERE
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'task-manager';
}