import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavService } from './nav.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, NgClass, AsyncPipe],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  private navService = inject(NavService);
  links = this.navService.navLinks;

  onNavClicked(href: string): void {
    this.navService.setActiveLink(href);
  }
}
