"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type PostLike = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  cover?: string;
  externalUrl?: string;
};

function PostCard({ post }: { post: PostLike }) {
  const href = post.externalUrl ? post.externalUrl : `/blog/${post.slug}`;
  const isExternal = Boolean(post.externalUrl);
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group rounded-2xl border border-slate-300 bg-slate-50 shadow-xl backdrop-blur overflow-hidden dark:border-white/10 dark:bg-white/5"
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
          <p className="text-xs text-slate-500 dark:text-white/60">
            {new Date(post.date).toLocaleDateString()}
          </p>
          {post.tags?.length ? (
            <ul className="flex flex-wrap gap-2">
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
        <h3 className="text-lg lg:text-xl text-slate-900 dark:text-white group-hover:text-accent transition">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="text-sm text-slate-700 dark:text-white/75">
            {post.excerpt}
          </p>
        ) : null}
        <div className="text-sm text-accent">Read more →</div>
      </div>
    </Link>
  );
}

export default function PostsGrid({ posts }: { posts: PostLike[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
    >
      {posts.map((p) => (
        <PostCard key={p.slug} post={p} />
      ))}
    </motion.div>
  );
}
