import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SwiperContainer } from 'swiper/element';
import { Swiper } from 'swiper/types';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [FeatherModule, FontAwesomeModule],
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WorkComponent implements AfterViewInit {
  swiperRef = viewChild<ElementRef<SwiperContainer>>('swiper');
  faGithub = faGithub;
  allProject: Project[] = [
    {
      num: '01',
      title: 'NewXlife',
      description:
        'NewXlife is an employee management app for XL Axiata, featuring attendance tracking, daily health reporting, WFO assessments, shuttle car reservations, a Family Member menu, and more.',
      stack: ['Angular CLI', 'Typescript', 'TailwindCSS', 'Material UI'],
      image: 'images/projects/NewXlife.png',
      liveUrl: 'https://www.newxlife.xl.co.id/en/',
      githubUrl: '',
    },
    {
      num: '02',
      title: 'eMR',
      description:
        'eMr is a platform Job Requisition for manpower request, monitoring recruitment progress, management employement contract, controlling MR, and more.',
      stack: ['Angular CLI', 'Typescript', 'TailwindCSS', 'Material UI'],
      image: 'images/projects/Emr.png',
      liveUrl: 'https://www.newxlife.xl.co.id/en/',
      githubUrl: '',
    },
    {
      num: '03',
      title: 'XL Prepaid Registrasi',
      description:
        'XL Prepaid Registration is a service that enables the registration of new XL and Axis numbers using a biometric system with facial recognition.',
      stack: ['React.js', 'Next.js', 'Redux'],
      image: 'images/projects/XLPrepaidRegistrasi.png',
      liveUrl: '',
      githubUrl: '',
    },
    {
      num: '04',
      title: 'Spesial Untukmu',
      description:
        'Spesial Untukmu is an application that offers surprises when you enter your XL or Axis number. Get exclusive deals and rewards tailored to you.',
      stack: ['React.js', 'Next.js', 'Redux'],
      image: 'images/projects/SpesialUntukmu.png',
      liveUrl: 'https://spesialuntukmu.xlaxiata.co.id/',
      githubUrl: '',
    },
  ];
  currentProject = signal<Project>(this.allProject[0]);

  ngAfterViewInit(): void {
    this.swiperRef()?.nativeElement.addEventListener(
      'swiperslidechange',
      (event: Event) => {
        const swiperInstance = (
          event.target as HTMLElement & { swiper: Swiper }
        ).swiper;
        const activeIndex = swiperInstance.realIndex;
        this.currentProject.set(this.allProject[activeIndex]);
      }
    );
  }

  openLink(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
