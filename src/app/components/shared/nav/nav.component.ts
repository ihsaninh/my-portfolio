import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  links: { name: string; isActive: boolean }[] = [
    { name: 'Home', isActive: true },
    { name: 'Resume', isActive: false },
    { name: 'Work', isActive: false },
    { name: 'Contact', isActive: false },
  ];
}
