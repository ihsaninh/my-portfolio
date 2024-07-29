type Project = {
  num: string;
  title: string;
  description: string;
  stack: string[];
  image: string;
  liveUrl: string;
  githubUrl: string;
};

type Link = { name: string; isActive: boolean, href: string };

type ResumeMenu = { id: number; name: string };

type Skill = { name: string; icon: string };

type ResumeData = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
};

type Social = { icon: string; link: string }
