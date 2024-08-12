import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  resumeMenus: ResumeMenu[] = [
    { id: 0, name: 'Experience' },
    { id: 1, name: 'Education' },
    { id: 2, name: 'Skills' },
  ];

  skills: Skill[] = [
    { name: 'React', icon: 'simpleReact' },
    { name: 'Next.js', icon: 'simpleNextdotjs' },
    { name: 'Angular', icon: 'simpleAngular' },
    { name: 'Redux', icon: 'simpleRedux' },
    { name: 'Javascript', icon: 'simpleNodedotjs' },
    { name: 'TailwindCSS', icon: 'simpleTailwindcss' },
    { name: 'Android', icon: 'simpleAndroid' },
    { name: 'Flutter', icon: 'simpleFlutter' },
  ];

  educationData: ResumeData[] = [
    {
      title: 'Fullstack Developer',
      company: 'Arkademy (Pijar Camp)',
      startDate: '2019',
      endDate: '2019',
    },
    {
      title: 'Teknik Komputer & Jaringan',
      company: 'SMK Negeri 2 Bogor',
      startDate: '2016',
      endDate: '2019',
    },
  ];

  experienceData: ResumeData[] = [
    {
      title: 'Frontend Developer',
      company: 'PT XL Axiata Tbk.',
      startDate: 'Oct 2023',
      endDate: 'Present',
    },
    {
      title: 'Frontend Developer (Angular)',
      company: 'Axiata Digital Labs',
      startDate: 'Aug 2021',
      endDate: 'Aug 2023',
    },
    {
      title: 'Mobile Developer',
      company: 'Axiata Digital Labs',
      startDate: 'Sep 2019',
      endDate: 'Aug 2021',
    },
    {
      title: 'Frontend Developer',
      company: 'Meteor Inovasi Digital',
      startDate: 'Aug 2019',
      endDate: 'Present',
    },
    {
      title: 'Computer Technician',
      company: 'AB Computer',
      startDate: 'Oct 2017',
      endDate: 'Jan 2018',
    },
  ];
}
