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
      className="block h-full rounded-2xl glass holo-border overflow-hidden group"
    >
      {/* Cover Image */}
      {post.cover && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div className="p-5 flex flex-col gap-3">
        {/* Date & Reading Time */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-gradient-to-r from-[rgb(var(--accent)/0.15)] to-[rgb(var(--accent-secondary)/0.15)] text-[rgb(var(--accent))] font-medium">
            {formatDateUTC(post.date)}
          </span>
          {post.readingTime && (
            <span className="text-slate-500 dark:text-white/60">
              • {post.readingTime}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-white group-hover:text-[rgb(var(--accent))] transition-colors duration-300">
          {post.title}
        </h3>

        {/* Description */}
        {(post.description || post.excerpt) && (
          <p className="text-sm text-slate-600 dark:text-white/70 line-clamp-2">
            {post.description || post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags?.length ? (
          <ul className="mt-1 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((t) => (
              <li
                key={t}
                className="rounded-full glass px-2.5 py-0.5 text-[10px] text-slate-700 dark:text-white/80"
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
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as const;

  const item = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  } as const;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
    >
      {posts.map((p) => (
        <motion.div
          variants={item}
          key={p.slug}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="group h-full transform-gpu"
        >
          <PostCard post={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}
