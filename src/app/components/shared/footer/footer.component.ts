import { Component } from '@angular/core';
import { SocialComponent } from "../../home/social/social.component";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SocialComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
