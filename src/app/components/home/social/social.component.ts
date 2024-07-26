import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLinkedin,
  faGithub,
  faInstagram,
  faFacebook,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss',
})
export class SocialComponent {
  containerClass = input.required<string>();
  iconStyle = input.required<string>();
  socials: { icon: IconDefinition; link: string }[] = [
    {
      icon: faFacebook,
      link: 'https://www.facebook.com/ihsan.n.habib/',
    },
    {
      icon: faLinkedin,
      link: 'https://www.linkedin.com/in/ihsaninh/',
    },
    {
      icon: faInstagram,
      link: 'https://www.instagram.com/ihsan_inh/',
    },
    {
      icon: faGithub,
      link: 'https://github.com/ihsaninh',
    },
  ];
}
