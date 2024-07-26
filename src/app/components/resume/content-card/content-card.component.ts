import { Component, input } from '@angular/core';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [],
  templateUrl: './content-card.component.html',
  styleUrl: './content-card.component.scss'
})
export class ContentCardComponent {
  data = input.required<{ title: string, company: string, startDate: string, endDate: string }>();
}
