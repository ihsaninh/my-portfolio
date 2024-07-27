type Project = {
  num: string;
  title: string;
  description: string;
  stack: string[];
  image: string;
  liveUrl: string;
  githubUrl: string;
};

type Links = { name: string; isActive: boolean };

type ResumeMenu = { id: number; name: string };

type ResumeData = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
};

type Social = { icon: IconDefinition; link: string }
