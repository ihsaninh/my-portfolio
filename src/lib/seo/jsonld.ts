export type BreadcrumbItem = {
  name: string;
  item: string;
};

export function personJsonLd(params: {
  name: string;
  url: string;
  jobTitle?: string;
  sameAs?: string[];
}) {
  const { name, url, jobTitle, sameAs } = params;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    ...(jobTitle ? { jobTitle } : {}),
    ...(sameAs?.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(params: {
  name: string;
  url: string;
  publisherName?: string;
}) {
  const { name, url, publisherName } = params;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url,
    name,
    ...(publisherName
      ? { publisher: { "@type": "Person", name: publisherName } }
      : {}),
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

export function blogPostingJsonLd(params: {
  title: string;
  description?: string;
  excerpt?: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  pageUrl: string;
}) {
  const {
    title,
    description,
    excerpt,
    image,
    datePublished,
    dateModified,
    authorName,
    pageUrl,
  } = params;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description || excerpt,
    ...(image ? { image: [image] } : {}),
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Person", name: authorName },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };
}
