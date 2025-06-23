import { IconType } from 'react-icons';
import { FaEnvelope, FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';

export type Social = {
  icon: IconType;
  link: string;
};

export const socials: Social[] = [
  { icon: FaEnvelope, link: 'mailto:ihsan.inh@gmail.com' },
  { icon: FaLinkedin, link: 'https://www.linkedin.com/in/ihsaninh/' },
  { icon: FaInstagram, link: 'https://www.instagram.com/ihsan_inh/' },
  { icon: FaGithub, link: 'https://github.com/ihsaninh' },
];