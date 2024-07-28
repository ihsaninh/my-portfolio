import { Component } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { SocialComponent } from "./social/social.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SocialComponent, FeatherModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
}
