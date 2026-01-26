"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiCalendar, FiClock } from "react-icons/fi";

import { BentoCard } from "@/src/shared/components/BentoCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/src/shared/components/ScrollReveal";
import { formatDateUTC } from "@/src/shared/lib/utils/date";

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  description?: string;
  readingTime?: string;
  tags?: string[];
  cover?: string;
}

export default function BlogListAnimated({
  posts,
}: Readonly<{ posts: Post[] }>) {
  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {posts.map((post) => (
        <StaggerItem key={post.slug} animation="scale-in" className="h-full">
          <BentoCard className="h-full !p-0 flex flex-col overflow-hidden group border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
            <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
              {post.cover && (
                <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-white/5">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full glass text-xs font-medium text-white flex items-center gap-1.5 backdrop-blur-md border border-white/20">
                      <FiCalendar className="text-[10px]" />
                      {formatDateUTC(post.date)}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 flex flex-col flex-grow relative">
                {/* Reading Time */}
                {post.readingTime && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <FiClock /> <span>{post.readingTime}</span>
                  </div>
                )}

                <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white group-hover:text-[rgb(var(--accent))] transition-colors duration-300 mb-3 leading-snug">
                  {post.title}
                  <FiArrowUpRight className="inline ml-1 text-sm opacity-50" />
                </h3>

                {post.description || post.excerpt ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-6 flex-grow">
                    {post.description || post.excerpt}
                  </p>
                ) : null}

                {post.tags?.length ? (
                  <div className="mt-auto flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Link>
          </BentoCard>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
