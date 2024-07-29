import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  links: Links[] = [
    { name: 'Home', isActive: true, href: "#home" },
    { name: 'Resume', isActive: false, href: "#resume" },
    { name: 'Work', isActive: false, href: "#work" },
    { name: 'Contact', isActive: false, href: "#contact" },
  ];

  setActiveLink(link: Links): void {
    this.links.forEach(l => l.isActive = false);
    link.isActive = true;
    this.scrollToSection(link.href);
  }

  scrollToSection(href: string): void {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView();
    }
  }
}
