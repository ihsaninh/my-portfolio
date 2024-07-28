import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-work-slider-buttons',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './work-slider-buttons.component.html',
  styleUrl: './work-slider-buttons.component.scss',
})
export class WorkSliderButtonsComponent {
  btnStyles = input.required<string>();
  iconStyles = input.required<string>();
  containerStyle = input.required<string>();

  onNext = output<void>();
  onPrev = output<void>();

  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;

  next() {
    this.onNext.emit();
  }

  prev() {
    this.onPrev.emit();
  }
}
