import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  simpleTailwindcss,
  simpleAngular,
  simpleReact,
  simpleNodedotjs,
  simpleFlutter,
  simpleNextdotjs,
  simpleRedux,
  simpleAndroid,
} from '@ng-icons/simple-icons';

import { ResumeContentComponent } from './resume-content/resume-content.component';
import { ContentCardComponent } from './content-card/content-card.component';
import { ResumeService } from './resume.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [
    NgClass,
    ResumeContentComponent,
    ContentCardComponent,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      simpleTailwindcss,
      simpleAngular,
      simpleReact,
      simpleNodedotjs,
      simpleFlutter,
      simpleNextdotjs,
      simpleRedux,
      simpleAndroid,
    }),
  ],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss',
})
export class ResumeComponent {
  activeMenu = signal(0);
  private resumeService = inject(ResumeService);

  resumeMenus = this.resumeService.resumeMenus;
  skills = this.resumeService.skills;
  educationData = this.resumeService.educationData;
  experienceData = this.resumeService.experienceData;

  onMenuClicked(menuIndex: number): void {
    this.activeMenu.set(menuIndex);
  }
}
