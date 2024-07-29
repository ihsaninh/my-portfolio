import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/shared/header/header.component';
import { HomeComponent } from "./components/home/home.component";
import { ResumeComponent } from "./components/resume/resume.component";
import { WorkComponent } from "./components/work/work.component";
import { FooterComponent } from "./components/shared/footer/footer.component";
import { ContactComponent } from "./components/contact/contact.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, HomeComponent, ResumeComponent, WorkComponent, FooterComponent, ContactComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}