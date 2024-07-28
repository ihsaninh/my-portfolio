import { Component, input, output } from '@angular/core';
import { faSolidChevronRight, faSolidChevronLeft } from '@ng-icons/font-awesome/solid';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-work-slider-buttons',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ faSolidChevronRight, faSolidChevronLeft })],
  templateUrl: './work-slider-buttons.component.html',
  styleUrl: './work-slider-buttons.component.scss',
})
export class WorkSliderButtonsComponent {
  btnStyles = input.required<string>();
  containerStyle = input.required<string>();
  iconStyles = input.required<string>();

  onNext = output<void>();
  onPrev = output<void>();

  next() {
    this.onNext.emit();
  }

  prev() {
    this.onPrev.emit();
  }
}
