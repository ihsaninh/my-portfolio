import { IconType } from 'react-icons';

export interface ResumeMenu {
  id: number;
  name: string;
}

export interface Skill {
  name: string;
  icon: IconType;
}

export interface ResumeData {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
}
