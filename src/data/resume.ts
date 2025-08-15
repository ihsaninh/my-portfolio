import {
  SiAngular,
  SiFlutter,
  SiNextdotjs,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

import { Certification, ResumeData, ResumeMenu, Skill } from "../types/resume";

export const resumeMenus: ResumeMenu[] = [
  { id: 0, name: "Experiences" },
  { id: 1, name: "Educations" },
  { id: 3, name: "Certifications" },
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
    company: "PT XLSMART Telecom Sejahtera Tbk",
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

export const certifications: Certification[] = [
  {
    title: "Frontend Developer (React)",
    company: "HackerRank",
    issuedDate: "May 2024",
    credentialId: "261795A24119",
    credentialUrl: "https://www.hackerrank.com/certificates/261795a24119",
  },
  {
    title: "Belajar Membuat Aplikasi Back-End untuk Pemula",
    company: "Dicoding Indonesia",
    issuedDate: "March 2024",
    credentialId: "KEXL181G4XG2",
    credentialUrl: "https://www.dicoding.com/certificates/KEXL181G4XG2",
  },
  {
    title: "Cloud Practitioner Essentials (Belajar Dasar AWS Cloud)",
    company: "Dicoding Indonesia",
    issuedDate: "March 2024",
    credentialId: "6RPNVEYG5Z2M",
    credentialUrl: "https://www.dicoding.com/certificates/6RPNVEYG5Z2M",
  },
  {
    title: "Belajar Fundamental Aplikasi Android",
    company: "Dicoding Indonesia",
    issuedDate: "December 2022",
    credentialId: "MEPJKN874X3V",
    credentialUrl: "https://www.dicoding.com/certificates/MEPJKN874X3V",
  },
  {
    title: "Memulai Pemrograman Dengan Kotlin",
    company: "Dicoding Indonesia",
    issuedDate: "May 2022",
    credentialId: "NVP7KKWD4ZR0",
    credentialUrl: "https://www.dicoding.com/certificates/NVP7KKWD4ZR0",
  },
  {
    title: "Belajar Prinsip Pemrograman SOLID",
    company: "Dicoding Academy",
    issuedDate: "April 2022",
    credentialId: "N9ZO73J0RZG5",
    credentialUrl:
      "https://drive.google.com/file/d/1gakvqpovMl9idjjv9Fe5liLg6ipVpxba/view",
  },
  {
    title: "Pemrograman Kotlin : Pemula sampai Mahir",
    company: "Udemy",
    issuedDate: "April 2022",
    credentialId: "UC-b18956dc-bb3f-4eac-960d-8155a802ba9c",
    credentialUrl:
      "https://www.udemy.com/certificate/UC-b18956dc-bb3f-4eac-960d-8155a802ba9c/",
  },
  {
    title: "Google Cloud Platform Essentials",
    company: "Qwiklabs",
    issuedDate: "April 2019",
    credentialId: "",
    credentialUrl:
      "https://google.qwiklabs.com/public_profiles/89cbefae-ede2-430c-90ee-c7b8a6d3a2dd",
  },
  {
    title: "Certificate of Graduation - Full Stack Software Developer",
    company: "Arkademy",
    issuedDate: "August 2019",
    credentialId: "ARK075",
    credentialUrl: "",
  },
];
