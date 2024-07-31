import { Component, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherDownload } from '@ng-icons/feather-icons';
import { HeaderService } from '../shared/header/header.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ featherDownload })],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private headerService = inject(HeaderService);

  onConnectClicked(href: string): void {
    this.headerService.setActiveLink(href);
  }
}
