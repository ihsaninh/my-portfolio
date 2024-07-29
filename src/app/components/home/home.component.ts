import { Component, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherDownload } from '@ng-icons/feather-icons';
import { NavService } from '../shared/nav/nav.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ featherDownload })],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private navService = inject(NavService);

  onConnectClicked(href: string): void {
    this.navService.setActiveLink(href);
  }
}
