import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export const socials = [
  { label: "GitHub", link: "https://github.com/ihsaninh", icon: FiGithub },
  {
    label: "LinkedIn",
    link: "https://www.linkedin.com/in/ihsaninh",
    icon: FiLinkedin,
  },
  { label: "Email", link: "mailto:ihsan.inh@gmail.com", icon: FiMail },
] as const;
