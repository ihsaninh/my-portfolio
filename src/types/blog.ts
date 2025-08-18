export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO date string
  excerpt: string;
  tags: string[];
  cover?: string; // path to image in /public
  externalUrl?: string; // optional external link
  content?: string[]; // simple paragraphs for detail page mock
}

