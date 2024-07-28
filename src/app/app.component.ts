import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/shared/header/header.component';
import { HomeComponent } from "./components/home/home.component";
import { ResumeComponent } from "./components/resume/resume.component";
import { WorkComponent } from "./components/work/work.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, HomeComponent, ResumeComponent, WorkComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}