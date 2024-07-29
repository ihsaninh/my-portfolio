import { Component, inject } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { NavService } from '../nav/nav.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NavComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private navService = inject(NavService);

  onConnectClicked(href: string): void {
    this.navService.setActiveLink(href);
  }
}
