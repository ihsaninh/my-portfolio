/*
  Ingest portfolio content into Supabase pgvector.
  Run with: bun scripts/rag/ingest.ts
*/

import fs from "fs";
import path from "path";

// Import data sources
import { projects } from "@/src/features/portfolio/data/projects";
import {
  certifications,
  educationData,
  experienceData,
  skills,
} from "@/src/features/portfolio/data/resume";
import { socials } from "@/src/features/portfolio/data/socials";
import { NavLinks } from "@/src/features/portfolio/data/navLinks";
import { chunkText } from "@/src/shared/lib/ai/rag/chunker";
import { embedBatch } from "@/src/shared/lib/ai/rag/embeddings";
import { getAllPostSlugs, getPostBySlug } from "@/src/shared/lib/mdx";
import { supabaseAdmin } from "@/src/shared/lib/services/supabase";

type SourceDoc = {
  doc_id: string;
  source: string; // 'blog' | 'readme' | 'profile' | 'experience' | 'project'
  url: string | null;
  title: string | null;
  content: string;
  metadata?: Record<string, unknown>;
};

async function collectFromBlogs(): Promise<SourceDoc[]> {
  const slugs = getAllPostSlugs();
  const docs: SourceDoc[] = [];
  for (const slug of slugs) {
    const p = getPostBySlug(slug);
    if (!p) continue;
    docs.push({
      doc_id: `blog:${slug}`,
      source: "blog",
      url: `/blog/${slug}`,
      title: p.meta.title ?? slug,
      content: p.content,
      metadata: { ...p.meta },
    });
  }
  return docs;
}

async function collectFromReadme(): Promise<SourceDoc[]> {
  const readmePath = path.join(process.cwd(), "README.md");
  if (!fs.existsSync(readmePath)) return [];
  const content = fs.readFileSync(readmePath, "utf8");
  return [
    {
      doc_id: "readme:root",
      source: "readme",
      url: "/",
      title: "Project README",
      content,
    },
  ];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function collectFromProfile(): Promise<SourceDoc[]> {
  const file = path.join(
    process.cwd(),
    "src",
    "features",
    "portfolio",
    "data",
    "profile.md"
  );
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, "utf8");
  return [
    {
      doc_id: "profile:main",
      source: "profile",
      url: "/about",
      title: "Profile",
      content,
      metadata: { type: "profile" },
    },
  ];
}

async function collectFromExperience(): Promise<SourceDoc[]> {
  const docs: SourceDoc[] = [];

  // Professional Experience
  const experienceParts: string[] = [];
  experienceParts.push("# Professional Experience");
  experienceParts.push("");

  for (const exp of experienceData) {
    experienceParts.push(`## ${exp.title} at ${exp.company}`);
    experienceParts.push(`**Duration:** ${exp.startDate} - ${exp.endDate}`);
    experienceParts.push("");
    experienceParts.push("**Key Responsibilities & Achievements:**");
    exp.descriptions?.forEach((desc) => {
      experienceParts.push(`- ${desc}`);
    });
    experienceParts.push("");
  }

  docs.push({
    doc_id: "experience:professional",
    source: "experience",
    url: "/resume",
    title: "Professional Experience",
    content: experienceParts.join("\n"),
    metadata: {
      type: "experience",
      category: "professional",
      count: experienceData.length,
    },
  });

  // Education
  const educationParts: string[] = [];
  educationParts.push("# Education Background");
  educationParts.push("");

  for (const edu of educationData) {
    educationParts.push(`## ${edu.title}`);
    educationParts.push(`**Institution:** ${edu.company}`);
    educationParts.push(
      `**Period:** ${edu.startDate} - ${edu.endDate || "Completed"}`
    );
    educationParts.push("");
    educationParts.push("**Details:**");
    edu.descriptions?.forEach((desc) => {
      educationParts.push(`- ${desc}`);
    });
    educationParts.push("");
  }

  docs.push({
    doc_id: "education:background",
    source: "education",
    url: "/resume",
    title: "Education Background",
    content: educationParts.join("\n"),
    metadata: { type: "education", count: educationData.length },
  });

  return docs;
}

async function collectFromProjects(): Promise<SourceDoc[]> {
  const docs: SourceDoc[] = [];

  // Individual projects
  for (const project of projects) {
    const projectLines: string[] = [];
    projectLines.push(`# ${project.title}`);
    projectLines.push("");
    projectLines.push(`**Description:** ${project.description}`);
    projectLines.push("");
    projectLines.push(`**Technology Stack:** ${project.stack.join(", ")}`);
    projectLines.push("");

    if (project.liveUrl) {
      projectLines.push(`**Live URL:** ${project.liveUrl}`);
    }
    if (project.githubUrl) {
      projectLines.push(`**GitHub:** ${project.githubUrl}`);
    }

    const projectId = `project:${slugify(project.title)}`;
    docs.push({
      doc_id: projectId,
      source: "project",
      url: project.liveUrl || project.githubUrl || null,
      title: project.title,
      content: projectLines.join("\n"),
      metadata: {
        type: "project",
        stack: project.stack,
        num: project.num,
        hasLiveUrl: !!project.liveUrl,
        hasGithubUrl: !!project.githubUrl,
      },
    });
  }

  // Portfolio overview
  const portfolioOverview: string[] = [];
  portfolioOverview.push("# Project Portfolio Overview");
  portfolioOverview.push("");
  portfolioOverview.push(`Total Projects: ${projects.length}`);
  portfolioOverview.push("");

  // Group by technology stack
  const techStacks = new Map<string, string[]>();
  projects.forEach((project) => {
    project.stack.forEach((tech) => {
      if (!techStacks.has(tech)) {
        techStacks.set(tech, []);
      }
      techStacks.get(tech)!.push(project.title);
    });
  });

  portfolioOverview.push("## Technology Expertise:");
  for (const [tech, projectTitles] of techStacks.entries()) {
    portfolioOverview.push(
      `**${tech}**: Used in ${
        projectTitles.length
      } projects - ${projectTitles.join(", ")}`
    );
  }
  portfolioOverview.push("");

  portfolioOverview.push("## Project Categories:");
  portfolioOverview.push(
    "- **Enterprise Applications**: XL SATU, NewXlife, eMR, XL Prioritas Apply, XL Prepaid Registrasi"
  );
  portfolioOverview.push(
    "- **E-commerce & Gaming**: Axiata Game Token, Spesial Untukmu, Axiapp"
  );
  portfolioOverview.push(
    "- **Mobile Applications**: BoostPreneur, BoostPenjual, Trex, Al-Quran App"
  );
  portfolioOverview.push(
    "- **Telecom Solutions**: XL SATU, XL Prioritas Apply, XL Prepaid Registrasi, Spesial Untukmu"
  );

  docs.push({
    doc_id: "portfolio:overview",
    source: "portfolio",
    url: "/#work",
    title: "Project Portfolio Overview",
    content: portfolioOverview.join("\n"),
    metadata: {
      type: "portfolio",
      projectCount: projects.length,
      technologies: Array.from(techStacks.keys()),
    },
  });

  return docs;
}

async function collectFromSkills(): Promise<SourceDoc[]> {
  const skillsContent: string[] = [];
  skillsContent.push("# Technical Skills & Expertise");
  skillsContent.push("");
  skillsContent.push("## Core Technologies:");

  skills.forEach((skill) => {
    skillsContent.push(
      `- **${skill.name}**: Professional experience in building applications`
    );
  });

  skillsContent.push("");
  skillsContent.push("## Frontend Development:");
  skillsContent.push(
    "- **React & Next.js**: Extensive experience building scalable web applications"
  );
  skillsContent.push(
    "- **TypeScript**: Strong typing and modern JavaScript development"
  );
  skillsContent.push(
    "- **TailwindCSS**: Utility-first CSS framework for responsive design"
  );
  skillsContent.push(
    "- **Angular**: Enterprise application development experience"
  );
  skillsContent.push("- **Redux**: State management for complex applications");

  skillsContent.push("");
  skillsContent.push("## Mobile Development:");
  skillsContent.push(
    "- **React Native**: Cross-platform mobile application development"
  );
  skillsContent.push(
    "- **Flutter**: Dart-based mobile development with Bloc pattern"
  );

  skillsContent.push("");
  skillsContent.push("## Domain Expertise:");
  skillsContent.push(
    "- **Telecommunications**: XL Axiata, Boost, telecom solutions"
  );
  skillsContent.push(
    "- **Enterprise Applications**: Employee management, registration systems"
  );
  skillsContent.push(
    "- **E-commerce & Gaming**: Digital payments, game token platforms"
  );
  skillsContent.push(
    "- **Performance Optimization**: TTI < 2s on mobile networks"
  );
  skillsContent.push("- **Accessibility**: Building inclusive user interfaces");
  skillsContent.push(
    "- **Testing & CI/CD**: Quality assurance and automated deployment"
  );

  return [
    {
      doc_id: "skills:technical",
      source: "skills",
      url: "/#skills",
      title: "Technical Skills & Expertise",
      content: skillsContent.join("\n"),
      metadata: {
        type: "skills",
        skillCount: skills.length,
        categories: [
          "frontend",
          "mobile",
          "typescript",
          "react",
          "angular",
          "flutter",
        ],
      },
    },
  ];
}

async function collectFromCertifications(): Promise<SourceDoc[]> {
  const certificationContent: string[] = [];
  certificationContent.push("# Professional Certifications");
  certificationContent.push("");

  certifications.forEach((cert) => {
    certificationContent.push(`## ${cert.title}`);
    certificationContent.push(`**Issuer:** ${cert.company}`);
    certificationContent.push(`**Issued:** ${cert.issuedDate}`);
    if (cert.credentialId) {
      certificationContent.push(`**Credential ID:** ${cert.credentialId}`);
    }
    if (cert.credentialUrl) {
      certificationContent.push(`**Verification:** ${cert.credentialUrl}`);
    }
    certificationContent.push("");
  });

  // Add summary
  certificationContent.push("## Certification Summary:");
  certificationContent.push(`- Total Certifications: ${certifications.length}`);
  certificationContent.push(
    "- **HackerRank**: Frontend Developer (React) certification"
  );
  certificationContent.push(
    "- **Dicoding Indonesia**: Backend development, AWS Cloud, Android development, Kotlin programming"
  );
  certificationContent.push("- **Udemy**: Advanced Kotlin programming");
  certificationContent.push("- **Google Cloud**: Platform essentials");
  certificationContent.push(
    "- **Arkademy**: Full Stack Software Developer bootcamp completion"
  );

  return [
    {
      doc_id: "certifications:all",
      source: "certifications",
      url: "/resume",
      title: "Professional Certifications",
      content: certificationContent.join("\n"),
      metadata: {
        type: "certifications",
        count: certifications.length,
        providers: [...new Set(certifications.map((c) => c.company))],
      },
    },
  ];
}

async function collectFromContact(): Promise<SourceDoc[]> {
  const contactContent: string[] = [];
  contactContent.push("# Contact Information");
  contactContent.push("");
  contactContent.push("## Professional Links:");

  socials.forEach((social) => {
    contactContent.push(`- **${social.label}**: ${social.link}`);
  });

  contactContent.push("");
  contactContent.push("## Get In Touch:");
  contactContent.push(
    "Available for frontend and mobile development opportunities."
  );
  contactContent.push(
    "Interested in React, Next.js, TypeScript, React Native, and Angular projects."
  );
  contactContent.push(
    "Experience in telecommunications, enterprise applications, and e-commerce domains."
  );

  return [
    {
      doc_id: "contact:info",
      source: "contact",
      url: "/#contact",
      title: "Contact Information",
      content: contactContent.join("\n"),
      metadata: {
        type: "contact",
        socialCount: socials.length,
      },
    },
  ];
}

async function collectFromNavigation(): Promise<SourceDoc[]> {
  const navContent: string[] = [];
  navContent.push("# Portfolio Navigation & Structure");
  navContent.push("");
  navContent.push("## Available Sections:");

  NavLinks.forEach((link) => {
    navContent.push(`- **${link.name}**: ${link.href}`);
  });

  navContent.push("");
  navContent.push("## Site Structure:");
  navContent.push("- **Home**: Introduction and overview");
  navContent.push(
    "- **Resume**: Professional experience, education, and certifications"
  );
  navContent.push("- **Skills**: Technical skills and expertise");
  navContent.push("- **Work**: Project portfolio and case studies");
  navContent.push("- **Blog**: Technical articles and insights");
  navContent.push("- **Contact**: Professional contact information");

  return [
    {
      doc_id: "navigation:structure",
      source: "navigation",
      url: "/",
      title: "Portfolio Navigation & Structure",
      content: navContent.join("\n"),
      metadata: {
        type: "navigation",
        sectionCount: NavLinks.length,
      },
    },
  ];
}

type RagRow = {
  doc_id: string;
  source: string;
  url: string | null;
  title: string | null;
  chunk_index: number;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown> | null;
};

async function upsertChunks(docs: SourceDoc[]) {
  const sb = supabaseAdmin();
  const rows: RagRow[] = [];

  for (const d of docs) {
    const chunks = chunkText(d.content);
    const embeddings = await embedBatch(chunks.map((c) => c.text));
    for (let i = 0; i < chunks.length; i++) {
      rows.push({
        doc_id: d.doc_id,
        source: d.source,
        url: d.url,
        title: d.title,
        chunk_index: chunks[i].index,
        content: chunks[i].text,
        embedding: embeddings[i],
        metadata: (d.metadata as Record<string, unknown> | undefined) ?? null,
      });
    }
  }

  // Remove old rows for these doc_ids, then insert fresh
  const docIds = Array.from(new Set(docs.map((d) => d.doc_id)));
  if (docIds.length) {
    await sb.from("rag_chunks").delete().in("doc_id", docIds);
  }

  // Insert in batches
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await sb.from("rag_chunks").insert(batch);
    if (error) throw error;
  }
}

async function main() {
  console.log("Collecting sources...");
  const [
    blogs,
    readme,
    profile,
    experience,
    projects,
    skills,
    certifications,
    contact,
    navigation,
  ] = await Promise.all([
    collectFromBlogs(),
    collectFromReadme(),
    collectFromProfile(),
    collectFromExperience(),
    collectFromProjects(),
    collectFromSkills(),
    collectFromCertifications(),
    collectFromContact(),
    collectFromNavigation(),
  ]);

  const docs = [
    ...blogs,
    ...readme,
    ...profile,
    ...experience,
    ...projects,
    ...skills,
    ...certifications,
    ...contact,
    ...navigation,
  ];

  console.log(`Collected ${docs.length} documents:`);
  console.log(`- Blog posts: ${blogs.length}`);
  console.log(`- README: ${readme.length}`);
  console.log(`- Profile: ${profile.length}`);
  console.log(`- Experience & Education: ${experience.length}`);
  console.log(`- Projects: ${projects.length}`);
  console.log(`- Skills: ${skills.length}`);
  console.log(`- Certifications: ${certifications.length}`);
  console.log(`- Contact: ${contact.length}`);
  console.log(`- Navigation: ${navigation.length}`);

  if (!docs.length) return;

  console.log("Embedding and upserting chunks...");
  await upsertChunks(docs);
  console.log("Done! Portfolio data successfully ingested into Supabase.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
