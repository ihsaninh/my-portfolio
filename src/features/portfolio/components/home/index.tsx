"use client";

import type { Variants } from "framer-motion";
import { domAnimation, easeOut, LazyMotion, m } from "framer-motion";
import Image from "next/image";
import React from "react";
import { FiDownload, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

import GlowText from "@/src/shared/components/GlowText";
import {
  PrimaryMagneticButton,
  SecondaryMagneticButton,
} from "@/src/shared/components/MagneticButton";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "@/src/shared/components/ScrollReveal";

import AiFeaturesAlert from "./AiFeaturesAlert";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

export default function Home() {
  return (
    <section
      id="home"
      aria-labelledby="home-title"
      className="container relative"
    >
      <LazyMotion features={domAnimation}>
        <div className="flex flex-col items-center lg:py-12">
          {/* Profile Photo with Holographic Ring */}
          <ScrollReveal animation="scale" className="relative">
            <div className="relative group">
              {/* Animated gradient ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-tertiary))] rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--accent-secondary))] to-[rgb(var(--accent-tertiary))] rounded-full opacity-40" />
              <Image
                src="/images/profile.webp"
                alt="Portrait of Ihsan Nurul Habib"
                width={240}
                height={240}
                sizes="(min-width: 1024px) 240px, 160px"
                priority
                fetchPriority="high"
                className="relative w-40 h-40 lg:w-60 lg:h-60 rounded-full object-cover bg-primary"
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
            <span className="text-slate-700 dark:text-white/80">
              Available for select projects
            </span>
          </m.div>

          {/* Headline with Gradient Text */}
          <div className="text-center mt-6">
            <h1 id="home-title" className="h1 leading-snug">
              <span className="text-slate-900 dark:text-white/90">
                Hello, I&apos;m{" "}
              </span>
              <GlowText as="span" className="font-bold" gradient glow>
                Ihsan Nurul Habib
              </GlowText>
              <br />
              <span className="text-slate-900 dark:text-white/90">
                Software Engineer — Frontend & Mobile
              </span>
            </h1>

            <ScrollReveal animation="fade" delay={0.2}>
              <p className="mt-4 text-slate-700 dark:text-white/70 leading-8 max-w-3xl mx-auto text-sm lg:text-lg">
                I build fast, accessible apps with Next.js, React, Angular, and
                React Native. 5+ years crafting delightful UIs for enterprise
                clients. Now specializing in AI-powered applications with
                Supabase.
              </p>
            </ScrollReveal>
          </div>

          {/* AI Features Alert */}
          <AiFeaturesAlert />

          {/* CTA Buttons with Magnetic Effect */}
          <ScrollReveal animation="slide-up" delay={0.3} className="mt-8">
            <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
              <PrimaryMagneticButton href="#contact">
                Connect with me
              </PrimaryMagneticButton>

              <SecondaryMagneticButton
                href="/document/CV-Ihsan-Nurul-Habib.pdf"
                download
                ariaLabel="Download CV as PDF"
                className="group"
              >
                <span>Download CV</span>
                <FiDownload className="text-lg transition-transform duration-300 group-hover:-rotate-12" />
              </SecondaryMagneticButton>
            </div>
          </ScrollReveal>

          {/* Social Links with Magnetic Effect */}
          <ScrollReveal animation="fade" delay={0.4}>
            <div className="mt-5 flex items-center gap-4 text-slate-700 dark:text-white/70">
              {[
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
              ].map((social) => (
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
                  className="group p-3 rounded-full glass holo-border transition-all duration-300 hover:text-[rgb(var(--accent))]"
                >
                  <social.icon className="text-xl transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </ScrollReveal>

          {/* Stats Cards - Bento Style */}
          <StaggerContainer
            staggerDelay={0.1}
            className="mt-8 grid grid-cols-3 gap-3 lg:gap-4 text-center"
          >
            {[
              { value: "5+", label: "Years Experience" },
              { value: "10+", label: "Projects shipped" },
              { value: "3", label: "Enterprise clients" },
            ].map((stat) => (
              <StaggerItem key={stat.label} animation="scale">
                <div className="glass holo-border rounded-2xl px-5 py-4 card-hover">
                  <p className="text-2xl lg:text-3xl font-bold gradient-text">
                    {stat.value}
                  </p>
                  <p className="text-xs lg:text-sm text-slate-600 dark:text-white/60 mt-1">
                    {stat.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Tech Stack Tags */}
          <StaggerContainer
            staggerDelay={0.05}
            className="mt-8 flex flex-wrap justify-center gap-2"
            aria-label="Core technologies"
          >
            {[
              "Next.js",
              "React",
              "TypeScript",
              "Angular",
              "React Native",
              "Tailwind CSS",
              "Google AI",
              "Supabase",
              "AI Tools",
            ].map((tech) => (
              <StaggerItem key={tech} animation="fade">
                <span className="rounded-full glass px-4 py-1.5 text-xs text-slate-700 dark:text-white/80 hover:text-[rgb(var(--accent))] transition-colors duration-300 cursor-default">
                  {tech}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </LazyMotion>
    </section>
  );
}
