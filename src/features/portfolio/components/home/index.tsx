"use client";

import type { Variants } from "framer-motion";
import { domAnimation, easeOut, LazyMotion, m } from "framer-motion";
import Image from "next/image";
import React from "react";
import { FiDownload, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

import GlowText from "@/src/shared/components/GlowText";
import { MagneticButton } from "@/src/shared/components/MagneticButton";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "@/src/shared/components/ScrollReveal";

import AiFeaturesAlert from "./AiFeaturesAlert";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const socialLinks = [
  {
    href: "https://github.com/ihsaninh",
    icon: FiGithub,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/ihsaninh",
    icon: FiLinkedin,
    label: "LinkedIn",
  },
  {
    href: "mailto:ihsan.inh@gmail.com",
    icon: FiMail,
    label: "Email",
  },
];

const stats = [
  { value: "5+", label: "Years Experience" },
  { value: "10+", label: "Projects Shipped" },
  { value: "3", label: "Enterprise Clients" },
];

const techStack = [
  "Next.js",
  "React",
  "TypeScript",
  "Angular",
  "React Native",
  "Tailwind CSS",
  "Google AI",
  "Supabase",
  "AI Tools",
];

export default function Home() {
  return (
    <section
      id="home"
      aria-labelledby="home-title"
      className="container relative"
    >
      <LazyMotion features={domAnimation}>
        <div className="flex flex-col items-center pt-20 pb-8 lg:py-16">
          {/* Profile Photo with Holographic Ring */}
          <ScrollReveal animation="scale" className="relative">
            <div className="relative group">
              {/* Outer glow effect */}
              <div className="absolute -inset-3 bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-tertiary))] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
              {/* Animated gradient ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-tertiary))] rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-tertiary))] rounded-full opacity-40" />
              <Image
                src="/images/profile.webp"
                alt="Portrait of Ihsan Nurul Habib"
                width={200}
                height={200}
                sizes="(min-width: 1024px) 200px, 160px"
                priority
                fetchPriority="high"
                className="relative w-40 h-40 lg:w-[200px] lg:h-[200px] rounded-full object-cover bg-primary ring-4 ring-white dark:ring-slate-900"
              />
            </div>
          </ScrollReveal>

          {/* Availability Badge */}
          <m.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-slate-700 dark:text-white/80 font-medium">
              Available for select projects
            </span>
          </m.div>

          {/* Headline */}
          <div className="text-center mt-6">
            <h1 id="home-title" className="leading-tight">
              <ScrollReveal animation="fade-up" delay={0.1} width="100%">
                <span className="text-slate-800 dark:text-white/90 text-lg lg:text-xl font-medium block mb-2">
                  Hello, I&apos;m
                </span>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={0.15} width="100%">
                <GlowText
                  as="span"
                  className="font-bold text-4xl lg:text-6xl block"
                  gradient
                  glow
                >
                  Ihsan Nurul Habib
                </GlowText>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={0.2} width="100%">
                <span className="text-slate-700 dark:text-white/80 text-xl lg:text-2xl font-medium mt-3 block">
                  Software Engineer — Frontend & Mobile
                </span>
              </ScrollReveal>
            </h1>

            <ScrollReveal animation="fade-in" delay={0.3} width="100%">
              <p className="mt-5 text-slate-600 dark:text-white/60 leading-relaxed text-sm lg:text-base mx-auto max-w-2xl">
                I build fast, accessible apps with Next.js, React, Angular, and
                React Native. 5+ years crafting delightful UIs for enterprise
                clients. Now specializing in AI-powered applications with
                Supabase.
              </p>
            </ScrollReveal>
          </div>

          {/* CTA Buttons */}
          <ScrollReveal animation="fade-up" delay={0.4} className="mt-8">
            <div className="flex flex-row flex-wrap items-center justify-center gap-3">
              <MagneticButton href="#contact">Connect with me</MagneticButton>

              <MagneticButton
                href="/document/CV-Ihsan-Nurul-Habib.pdf"
                download
                ariaLabel="Download CV as PDF"
                className="group"
              >
                <span>Download CV</span>
                <FiDownload className="text-lg transition-transform duration-300 group-hover:-rotate-12" />
              </MagneticButton>
            </div>
          </ScrollReveal>

          {/* Social Links */}
          <ScrollReveal animation="fade-in" delay={0.5}>
            <div className="mt-6 flex items-center gap-3 text-slate-600 dark:text-white/60">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  aria-label={social.label}
                  className="group p-2.5 rounded-xl glass holo-border transition-all duration-300 hover:text-[rgb(var(--accent))]"
                >
                  <social.icon className="text-lg transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </ScrollReveal>

          {/* Stats Cards */}
          <StaggerContainer staggerDelay={0.1} className="mt-10">
            <div className="grid grid-cols-3 gap-2 lg:gap-4 max-w-md lg:max-w-lg mx-auto">
              {stats.map((stat) => (
                <StaggerItem key={stat.label} animation="scale">
                  <div className="glass holo-border rounded-2xl p-3 lg:p-5 text-center card-hover group h-full">
                    <p className="text-xl lg:text-3xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </p>
                    <p className="text-[9px] lg:text-xs text-slate-500 dark:text-white/50 mt-1.5 font-medium leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>

          {/* Tech Stack Tags */}
          <ScrollReveal
            animation="fade-in"
            delay={0.2}
            className="mt-10 w-full"
          >
            <div className="text-center">
              <p className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-widest font-medium mb-4">
                Tech Stack
              </p>
              <div
                className="flex flex-wrap justify-center gap-2"
                aria-label="Core technologies"
              >
                {techStack.map((tech, index) => (
                  <m.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="rounded-full glass px-4 py-2 text-xs lg:text-sm text-slate-600 dark:text-white/70 hover:text-[rgb(var(--accent))] hover:border-[rgb(var(--accent)/.3)] transition-colors duration-300 cursor-default font-medium"
                  >
                    {tech}
                  </m.span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* AI Features Alert */}
          <div className="w-full mt-10">
            <AiFeaturesAlert />
          </div>
        </div>
      </LazyMotion>
    </section>
  );
}
