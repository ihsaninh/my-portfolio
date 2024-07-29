import {
  AfterViewInit,
  Component,
  ElementRef,
  signal,
  viewChild,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { Swiper } from 'swiper/types';
import { SwiperContainer } from 'swiper/element';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faBrandGithub } from '@ng-icons/font-awesome/brands';
import { featherArrowUpRight } from '@ng-icons/feather-icons';

import { WorkSliderButtonsComponent } from './work-slider-buttons/work-slider-buttons.component';

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
  allProject: Project[] = [
    {
      num: '01',
      title: 'NewXlife',
      description:
        'NewXlife is an employee management app for XL Axiata, featuring attendance tracking, daily health reporting, WFO assessments, shuttle car reservations, a Family Member menu, and more.',
      stack: ['Angular', 'Typescript', 'TailwindCSS', 'Material UI'],
      image: 'images/projects/NewXlife.png',
      liveUrl: 'https://www.newxlife.xl.co.id/en/',
      githubUrl: '',
    },
    {
      num: '02',
      title: 'eMR',
      description:
        'eMr is a platform Job Requisition platform for manpower request, monitoring recruitment progress, management employement contract, controlling MR, and more.',
      stack: ['Angular', 'Typescript', 'TailwindCSS', 'Material UI'],
      image: 'images/projects/Emr.png',
      liveUrl: 'https://www.newxlife.xl.co.id/en/',
      githubUrl: '',
    },
    {
      num: '03',
      title: 'XL Prioritas Apply',
      description:
        'XL Prioritas Apply is a service that enables the buy the new XL Prioritas numbers both USIM or ESIM. Users can choose the number and quota package options.',
      stack: ['React.js', 'Next.js', 'Redux'],
      image: 'images/projects/XLPrioritas.png',
      liveUrl: 'https://prioritas.xl.co.id/',
      githubUrl: '',
    },
    {
      num: '04',
      title: 'Axiapp',
      description:
        'Axiapp is an Android app developed by PT XL Axiata Tbk for indirect channel partners like Device Chain Stores, Online, Traditional, Modern Retail, and Direct Channels. Users can claim and redeem points earned from sales and use these points at listed merchants.',
      stack: ['React.js', 'Next.js', 'Redux', 'MUI'],
      image: 'images/projects/Axiapp.png',
      liveUrl: 'https://play.google.com/store/apps/details?id=id.co.xlaxiata.axiapp&hl=id',
      githubUrl: '',
    },
    {
      num: '05',
      title: 'XL Prepaid Registrasi',
      description:
        'XL Prepaid Registration is a service that enables the registration of new XL and Axis numbers using a biometric system with facial recognition.',
      stack: ['React.js', 'Next.js', 'Redux'],
      image: 'images/projects/XLPrepaidRegistrasi.png',
      liveUrl: 'https://registrasi.xlaxiata.co.id/',
      githubUrl: '',
    },
    {
      num: '06',
      title: 'Spesial Untukmu',
      description:
        'Spesial Untukmu is an application that offers surprises when you enter your XL or Axis number. Get exclusive deals and rewards tailored to you.',
      stack: ['React.js', 'Next.js', 'Redux'],
      image: 'images/projects/SpesialUntukmu.png',
      liveUrl: 'https://spesialuntukmu.xlaxiata.co.id/',
      githubUrl: '',
    },
    {
      num: '07',
      title: 'BoostPreneur',
      description:
        'BoostPreneur is an application that can be used by agents Boost in me-register merchant (BoostSpot). Boost agent can use this application to validate and register candidates for strategic partners that are intended as BoostSpot.',
      stack: ['React Native', 'Javascript', 'Redux'],
      image: 'images/projects/BoostPreneur.png',
      liveUrl: '',
      githubUrl: '',
    },
    {
      num: '08',
      title: 'BoostPenjual',
      description:
        'BoostPenjual is an application that can increase revenue by making you digitally connected to various existing suppliers. That way, you can sell a variety of products including digital products.',
      stack: ['React Native', 'Javascript', 'Redux'],
      image: 'images/projects/BoostPenjual.png',
      liveUrl:
        'https://play.google.com/store/apps/details?id=com.dialog.boost.merchant.android',
      githubUrl: '',
    },
    {
      num: '09',
      title: 'Trex',
      description:
        'Trex is a PPOB application that sells pulsa, data packages, game topups, and various kinds of bills such as PLN, BPJS, and pay TV.',
      stack: ['React Native', 'Typescript', 'Zustand', 'Tamagui'],
      image: 'images/projects/Trex.png',
      liveUrl: '',
      githubUrl: '',
    },
    {
      num: '10',
      title: 'Al-Quran App',
      description:
        'An Al-Quran app with several features, such as a Surah list, Ayah list, Surah settings, jump to Ayah, bookmarks, add to last read, share, and more.',
      stack: ['Flutter', 'Bloc', 'GetIt', 'Hive', 'Go Router'],
      image: 'images/projects/Al-Quran.png',
      liveUrl: '',
      githubUrl: 'https://github.com/ihsaninh/Alquran-flutter-bloc-cubit',
    },
  ];
  currentProject = signal<Project>(this.allProject[0]);

  ngAfterViewInit(): void {
    const swiperRef = this.swiperRef()?.nativeElement;
    if (swiperRef) {
      swiperRef.addEventListener('swiperslidechange', this.handleSlideChange);
    }
  }
  
  private handleSlideChange = (event: Event) => {
    const activeIndex = (event.target as HTMLElement & { swiper: Swiper }).swiper.realIndex;
    this.currentProject.set(this.allProject[activeIndex]);
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
