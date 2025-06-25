'use client';

import React from 'react';
import Image from 'next/image';
import { FiDownload } from 'react-icons/fi';
import { useHeaderService } from '@/src/hooks/useHeader';
import { motion } from 'framer-motion';

export default function Home() {
  const { setActiveLink } = useHeaderService();

  const handleConnectClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveLink('#contact');
  };

  return (
    <motion.section
      id="home"
      className="container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="flex flex-col items-center">
        <Image
          src="/images/profile.jpeg"
          alt="profile"
          width={240}
          height={240}
          className="w-48 lg:w-60 rounded-full brightness-90 object-cover"
          priority
        />
        <div className="text-center">
          <h2 className="h1 mb-6 text-accent mt-8 leading-snug">
            <span className="text-white">Hello, I&apos;m </span>
            Ihsan Nurul Habib
            <br />
            <span className="text-white">Software Engineer.</span>
          </h2>
          <p className="mb-9 text-white/80 leading-8 lg:max-w-screen-xl lg:px-24 text-sm lg:text-lg">
            I am a Software Engineer specializing in frontend development, with over 5 years of experience working on
            multiple projects for companies such as PT. XL Axiata, Axiata Digital Labs, and Meteor Inovasi Digital.
          </p>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          <a
            href="#contact"
            className="bg-accent px-6 py-2 text-primary rounded-full shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/50"
            onClick={handleConnectClick}
          >
            Connect with me
          </a>

          <a
            href="/document/CV-Ihsan-Nurul-Habib.pdf"
            download
            className="flex items-center justify-center gap-2 border border-accent text-accent px-6 py-2 rounded-full transition-all duration-300 hover:bg-accent hover:text-primary hover:scale-105 hover:shadow-lg hover:shadow-accent/50 group"
          >
            <span>Download CV</span>
            <FiDownload className="text-lg transition-transform duration-300 group-hover:rotate-[-15deg]" />
          </a>
        </div>
      </div>
    </motion.section>
  );
}
