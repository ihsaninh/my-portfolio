import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  viewChild,
} from '@angular/core';
import { HeaderService } from './header.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements AfterViewInit {
  private headerService = inject(HeaderService);
  private headerRef = viewChild.required<ElementRef<HTMLElement>>('header');
  private navMenuRef = viewChild.required<ElementRef<HTMLElement>>('navMenu');
  private hamburgerRef = viewChild.required<ElementRef<HTMLButtonElement>>('hamburger');

  links = this.headerService.navLinks;

  @HostListener('window:scroll')
  onScroll() {
    if (window.scrollY > this.headerRef().nativeElement.offsetTop) {
      this.headerRef().nativeElement.classList.add('navbar-fixed');
    } else {
      this.headerRef().nativeElement.classList.remove('navbar-fixed');
    }
  }

  ngAfterViewInit(): void {
    this.hamburgerRef().nativeElement.addEventListener('click', () => {
      this.hamburgerRef().nativeElement.classList.toggle('hamburger-active');
      this.navMenuRef().nativeElement.classList.toggle('hidden');
    });
  }

  onConnectClicked(href: string): void {
    this.headerService.setActiveLink(href);
  }
}
