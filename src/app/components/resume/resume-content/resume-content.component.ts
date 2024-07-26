import { Component, input } from '@angular/core';

@Component({
  selector: 'app-resume-content',
  standalone: true,
  imports: [],
  templateUrl: './resume-content.component.html',
  styleUrl: './resume-content.component.scss'
})
export class ResumeContentComponent {
  title = input.required<string>();
  description = input.required<string>();
}
