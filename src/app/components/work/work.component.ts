import {
  AfterViewInit,
  Component,
  ElementRef,
  viewChild,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { Swiper } from 'swiper/types';
import { SwiperContainer } from 'swiper/element';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faBrandGithub } from '@ng-icons/font-awesome/brands';
import { featherArrowUpRight } from '@ng-icons/feather-icons';

import { WorkSliderButtonsComponent } from './work-slider-buttons/work-slider-buttons.component';
import { WorkService } from './work.service';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [NgIconComponent, WorkSliderButtonsComponent],
  providers: [provideIcons({ featherArrowUpRight, faBrandGithub })],
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WorkComponent implements AfterViewInit {
  private swiperRef = viewChild<ElementRef<SwiperContainer>>('swiper');
  private workService = inject(WorkService);

  allProjects = this.workService.allProjects;
  currentProject = this.workService.currentProjectSignal;

  ngAfterViewInit(): void {
    const swiperRef = this.swiperRef()?.nativeElement;
    if (swiperRef) {
      swiperRef.addEventListener('swiperslidechange', this.handleSlideChange);
    }
  }

  private handleSlideChange = (event: Event) => {
    const activeIndex = (event.target as HTMLElement & { swiper: Swiper }).swiper.realIndex;
    this.workService.updateCurrentProject(activeIndex);
  };

  onPrevSlide() {
    this.swiperRef()?.nativeElement.swiper.slidePrev();
  }

  onNextSlide() {
    this.swiperRef()?.nativeElement.swiper.slideNext();
  }

  openLink(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
