import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavService {
  private links = signal<Link[]>([
    { name: 'Home', isActive: true, href: '#home' },
    { name: 'Resume', isActive: false, href: '#resume' },
    { name: 'Work', isActive: false, href: '#work' },
    { name: 'Contact', isActive: false, href: '#contact' },
  ]);

  get navLinks() {
    return this.links.asReadonly();
  }

  setActiveLink(href: string): void {
    const updatedLinks = this.links().map((link) => ({
      ...link,
      isActive: link.href === href,
    }));
    this.links.set(updatedLinks);
    this.scrollToSection(href);
  }

  scrollToSection(href: string): void {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
