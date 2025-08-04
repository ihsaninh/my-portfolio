import { IconType } from 'react-icons';
import { FaEnvelope, FaGithub,FaInstagram, FaLinkedin } from 'react-icons/fa';

export type Social = {
  icon: IconType;
  link: string;
  label: string;
};

export const socials = [
  {
    icon: FaEnvelope,
    link: 'mailto:ihsan.inh@gmail.com',
    label: 'Send email to ihsan.inh@gmail.com',
  },
  {
    icon: FaLinkedin,
    link: 'https://www.linkedin.com/in/ihsaninh/',
    label: 'Visit LinkedIn profile',
  },
  {
    icon: FaInstagram,
    link: 'https://www.instagram.com/ihsan_inh/',
    label: 'Visit Instagram profile',
  },
  {
    icon: FaGithub,
    link: 'https://github.com/ihsaninh',
    label: 'Visit GitHub profile',
  },
];