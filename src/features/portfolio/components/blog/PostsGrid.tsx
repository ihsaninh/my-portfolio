"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { formatDateUTC } from "@/src/shared/lib/utils/date";

interface PostLike {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  description?: string;
  tags?: string[];
  cover?: string;
  externalUrl?: string;
  readingTime?: string;
}

function PostCard({ post }: Readonly<{ post: PostLike }>) {
  const href = post.externalUrl ? post.externalUrl : `/blog/${post.slug}`;
  const isExternal = Boolean(post.externalUrl);
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="block h-full rounded-2xl border border-slate-300 bg-slate-50 shadow-lg md:shadow-xl md:backdrop-blur overflow-hidden dark:border-white/10 dark:bg-white/5"
    >
      {post.cover && (
        <div className="relative w-full h-48">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
        </div>
      )}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-white/60 flex items-center gap-2">
            <span>{formatDateUTC(post.date)}</span>
            {post.readingTime && (
              <>
                <span aria-hidden>•</span>
                <span>{post.readingTime}</span>
              </>
            )}
          </p>
        </div>
        <h3 className="text-lg lg:text-xl text-slate-900 dark:text-white group-hover:text-accent transition">
          {post.title}
        </h3>
        {post.description || post.excerpt ? (
          <p className="text-sm text-slate-700 dark:text-white/75">
            {post.description || post.excerpt}
          </p>
        ) : null}
        {post.tags?.length ? (
          <ul className="mt-1 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((t) => (
              <li
                key={t}
                className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white/85"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}

export default function PostsGrid({ posts }: Readonly<{ posts: PostLike[] }>) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  } as const;

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  } as const;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
    >
      {posts.map((p) => (
        <motion.div
          variants={item}
          key={p.slug}
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="group h-full transform-gpu"
        >
          <PostCard post={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}
