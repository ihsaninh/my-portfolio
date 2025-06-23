import { ResumeData, ResumeMenu, Skill } from "../types/resume";
import { SiReact, SiNextdotjs, SiAngular, SiRedux, SiTailwindcss, SiFlutter, SiAndroid, SiNodedotjs } from 'react-icons/si';

export const resumeMenus: ResumeMenu[] = [
  { id: 0, name: 'Experience' },
  { id: 1, name: 'Education' },
  { id: 2, name: 'Skills' },
];

export const skills: Skill[] = [
  { name: 'React', icon: SiReact },
  { name: 'Next.js', icon: SiNextdotjs },
  { name: 'Angular', icon: SiAngular },
  { name: 'Redux', icon: SiRedux },
  { name: 'Javascript', icon: SiNodedotjs },
  { name: 'TailwindCSS', icon: SiTailwindcss },
  { name: 'Android', icon: SiAndroid },
  { name: 'Flutter', icon: SiFlutter },
];

export const educationData: ResumeData[] = [
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

export const experienceData: ResumeData[] = [
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