import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WorkService {
  private readonly projects: Project[] = [
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
      title: 'XL SATU',
      description:
        'XL SATU is a comprehensive product from XL Axiata that consists of fixed internet broadband services, which provide internet access through fiber optic cables connected to customers homes with speeds of up to 1Gbps, and shared prepaid data bonuses of up to 300GB that can be shared with up to 5 family members for internet access on smartphones when customers are outside their homes.',
      stack: ['React.js', 'Next.js', 'GraphQL', 'Zustand'],
      image: 'images/projects/XLSatu.png',
      liveUrl: 'https://satu.xl.co.id/',
      githubUrl: '',
    },
    {
      num: '04',
      title: 'XL Prioritas Apply',
      description:
        'XL Prioritas Apply is a service that enables the buy the new XL Prioritas numbers both USIM or ESIM. Users can choose the number and quota package options.',
      stack: ['React.js', 'Next.js', 'Redux'],
      image: 'images/projects/XLPrioritas.png',
      liveUrl: 'https://prioritas.xl.co.id/',
      githubUrl: '',
    },
    {
      num: '05',
      title: 'Axiapp',
      description:
        'Axiapp is an Android app developed by PT XL Axiata Tbk for indirect channel partners like Device Chain Stores, Online, Traditional, Modern Retail, and Direct Channels. Users can claim and redeem points earned from sales and use these points at listed merchants.',
      stack: ['React.js', 'Next.js', 'Redux', 'MUI'],
      image: 'images/projects/Axiapp.png',
      liveUrl:
        'https://play.google.com/store/apps/details?id=id.co.xlaxiata.axiapp&hl=id',
      githubUrl: '',
    },
    {
      num: '06',
      title: 'XL Prepaid Registrasi',
      description:
        'XL Prepaid Registration is a service that enables the registration of new XL and Axis numbers using a biometric system with facial recognition.',
      stack: ['React.js', 'Next.js', 'Redux'],
      image: 'images/projects/XLPrepaidRegistrasi.png',
      liveUrl: 'https://registrasi.xlaxiata.co.id/',
      githubUrl: '',
    },
    {
      num: '07',
      title: 'Spesial Untukmu',
      description:
        'Spesial Untukmu is an application that offers surprises when you enter your XL or Axis number. Get exclusive deals and rewards tailored to you.',
      stack: ['React.js', 'Next.js', 'Redux'],
      image: 'images/projects/SpesialUntukmu.png',
      liveUrl: 'https://spesialuntukmu.xlaxiata.co.id/',
      githubUrl: '',
    },
    {
      num: '08',
      title: 'BoostPreneur',
      description:
        'BoostPreneur is an application that can be used by agents Boost in me-register merchant (BoostSpot). Boost agent can use this application to validate and register candidates for strategic partners that are intended as BoostSpot.',
      stack: ['React Native', 'Javascript', 'Redux'],
      image: 'images/projects/BoostPreneur.png',
      liveUrl: '',
      githubUrl: '',
    },
    {
      num: '09',
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
      num: '10',
      title: 'Trex',
      description:
        'Trex is a PPOB application that sells pulsa, data packages, game topups, and various kinds of bills such as PLN, BPJS, and pay TV.',
      stack: ['React Native', 'Typescript', 'Zustand', 'Tamagui'],
      image: 'images/projects/Trex.png',
      liveUrl: '',
      githubUrl: '',
    },
    {
      num: '11',
      title: 'Al-Quran App',
      description:
        'An Al-Quran app with several features, such as a Surah list, Ayah list, Surah settings, jump to Ayah, bookmarks, add to last read, share, and more.',
      stack: ['Flutter', 'Bloc', 'GetIt', 'Hive', 'Go Router'],
      image: 'images/projects/Al-Quran.png',
      liveUrl: '',
      githubUrl: 'https://github.com/ihsaninh/Alquran-flutter-bloc-cubit',
    },
  ];

  private currentProject = signal<Project>(this.projects[0]);

  get allProjects(): Project[] {
    return this.projects;
  }

  get currentProjectSignal() {
    return this.currentProject.asReadonly();
  }

  updateCurrentProject(activeIndex: number): void {
    if (activeIndex >= 0 && activeIndex < this.projects.length) {
      this.currentProject.set(this.projects[activeIndex]);
    }
  }
}
