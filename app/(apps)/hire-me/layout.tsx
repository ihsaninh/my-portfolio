import type { Metadata } from "next";
import Script from "next/script";

import { SITE_URL } from "@/src/shared/lib/constants";
import { breadcrumbJsonLd } from "@/src/shared/lib/seo";

export const metadata: Metadata = {
  title: "Hire Me Simulator – Frontend Developer",
  description:
    "Simulate interviewing Ihsan — run an HR screening or a technical deep‑dive with tailored responses and handy presets.",
  alternates: { canonical: "/hire-me" },
  openGraph: {
    title: "Hire Me Simulator – Frontend Developer",
    description:
      "Simulate interviewing Ihsan — HR screening or technical deep‑dive with tailored responses.",
    url: "/hire-me",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire Me Simulator – Frontend Developer",
    description:
      "Simulate interviewing Ihsan — HR screening or technical deep‑dive with tailored responses.",
  },
};

export default function HireMeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Script
        id="ld-breadcrumb-hire-me"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", item: `${SITE_URL}/` },
              {
                name: "Hire Me Simulator",
                item: `${SITE_URL}/hire-me`,
              },
            ]),
          ),
        }}
      />
      {/* Full-page experience without default layout */}
      <div className="isolate">{children}</div>
    </>
  );
}
