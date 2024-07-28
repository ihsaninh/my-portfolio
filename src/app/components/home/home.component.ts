import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherDownload } from '@ng-icons/feather-icons';

import { SocialComponent } from './social/social.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SocialComponent, NgIconComponent],
  providers: [provideIcons({ featherDownload })],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
