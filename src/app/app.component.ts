import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeatherModule } from 'angular-feather';

import { HeaderComponent } from './components/shared/header/header.component';
import { HomeComponent } from "./components/home/home.component";
import { ResumeComponent } from "./components/resume/resume.component";
import { WorkComponent } from "./components/work/work.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FeatherModule, HomeComponent, ResumeComponent, WorkComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}