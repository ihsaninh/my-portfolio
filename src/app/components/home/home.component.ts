import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherDownload } from '@ng-icons/feather-icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ featherDownload })],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
