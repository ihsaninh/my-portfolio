import { Component, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faBrandFacebook, faBrandLinkedin, faBrandInstagram, faBrandGithub } from '@ng-icons/font-awesome/brands';

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ faBrandFacebook, faBrandLinkedin, faBrandInstagram, faBrandGithub })],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss',
})
export class SocialComponent {
  containerClass = input.required<string>();
  iconStyle = input.required<string>();
  socials: Social[] = [
    {
      icon: 'faBrandFacebook',
      link: 'https://www.facebook.com/ihsan.n.habib/',
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
