import {
  SiAngular,
  SiFlutter,
  SiNextdotjs,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

import { ResumeData, ResumeMenu, Skill } from "../types/resume";

export const resumeMenus: ResumeMenu[] = [
  { id: 0, name: "Experience" },
  { id: 1, name: "Education" },
  { id: 2, name: "Skills" },
];

export const skills: Skill[] = [
  { name: "React", icon: SiReact },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "React Native", icon: SiReact },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Angular", icon: SiAngular },
  { name: "Redux", icon: SiRedux },
  { name: "TailwindCSS", icon: SiTailwindcss },
  { name: "Flutter", icon: SiFlutter },
];

export const educationData: ResumeData[] = [
  {
    title: "Fullstack Developer",
    company: "Arkademy (Pijar Camp)",
    startDate: "2019",
    endDate: "2019",
  },
  {
    title: "Teknik Komputer & Jaringan",
    company: "SMK Negeri 2 Bogor",
    startDate: "2016",
    endDate: "2019",
  },
];

export const experienceData: ResumeData[] = [
  {
    title: "Frontend Developer",
    company: "PT XL Axiata Tbk.",
    startDate: "Oct 2023",
    endDate: "Present",
    descriptions: [
      "Developed responsive, intuitive, and engaging user interfaces for internal web applications using Next.js and React.",
      "Collaborated with business units to design and implement features tailored to their needs, ensuring seamless functionality and user satisfaction.",
      "Partnered with middleware development teams to efficiently integrate front-end components with backend services.",
      "Proactively identified and resolved technical challenges, driving continuous improvement in application performance and reliability.",
    ],
  },
  {
    title: "Frontend & Mobile Developer",
    company: "Axiata Digital Labs",
    startDate: "Sep 2019",
    endDate: "Aug 2023",
    descriptions: [
      "Sliced UI designs into applications using Angular CLI and Tailwind CSS.",
      "Developed mobile applications using React Native technology.",
      "Seamlessly integrated APIs to fetch and display data from the backend.",
      "Participated in all scrum ceremonies, including backlog grooming, sprint retrospective, and daily stand-ups.",
    ],
  },
  {
    title: "Fullstack Developer",
    company: "Meteor Inovasi Digital",
    startDate: "Aug 2019",
    endDate: "Present",
    descriptions: [
      "Worked with various technologies, including React Native for mobile projects and Next.js for web projects.",
      "Developed new features and improved existing functionalities to enhance user experience and meet project requirements.",
      "Implemented responsive design principles to ensure seamless user experiences across different devices for both web and mobile projects.",
    ],
  },
];
