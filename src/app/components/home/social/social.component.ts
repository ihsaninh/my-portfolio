import { Component, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faBrandLinkedin, faBrandInstagram, faBrandGithub } from '@ng-icons/font-awesome/brands';
import { faEnvelope } from '@ng-icons/font-awesome/regular';

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ faEnvelope, faBrandLinkedin, faBrandInstagram, faBrandGithub })],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss',
})
export class SocialComponent {
  containerClass = input.required<string>();
  iconStyle = input.required<string>();
  socials: Social[] = [
    {
      icon: 'faEnvelope',
      link: 'mailto:ihsan.inh@gmail.com',
    },
    {
      icon: 'faBrandLinkedin',
      link: 'https://www.linkedin.com/in/ihsaninh/',
    },
    {
      icon: 'faBrandInstagram',
      link: 'https://www.instagram.com/ihsan_inh/',
    },
    {
      icon: 'faBrandGithub',
      link: 'https://github.com/ihsaninh',
    },
  ];
}
