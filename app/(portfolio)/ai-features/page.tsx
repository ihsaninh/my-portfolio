import { Metadata } from "next";
import Link from "next/link";
import {
  FiArrowRight,
  FiBarChart2,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

export const metadata: Metadata = {
  title: "AI Features | Ihsan Nurul Habib - Portfolio",
  description: "Explore the AI-powered features of my portfolio",
};

const aiFeatures = [
  {
    title: "AI Quiz",
    description:
      "Test your knowledge with AI-generated questions across various topics",
    icon: <FiBarChart2 className="h-6 w-6" />,
    href: "/quiz",
    color: "from-purple-500 to-indigo-500",
    badge: "Popular",
  },
  {
    title: "Hire Me Simulator",
    description:
      "Experience my hiring process with an AI-powered interview simulation",
    icon: <FiUsers className="h-6 w-6" />,
    href: "/hire-me",
    color: "from-blue-500 to-cyan-500",
    badge: "Interactive",
  },
  {
    title: "Battle Arena",
    description: "Compete in real-time quiz battles with other users",
    icon: <FiClock className="h-6 w-6" />,
    href: "https://battle.ihsaninh.com",
    color: "from-red-500 to-orange-500",
    badge: "Real-time",
  },
];

const techStack = [
  {
    icon: <FiZap className="h-5 w-5" />,
    title: "AI Integration",
    description: "Powered by Google Gemini",
    color: "purple",
  },
  {
    icon: <FiTarget className="h-5 w-5" />,
    title: "Real-time",
    description: "Interactive experiences",
    color: "blue",
  },
  {
    icon: <FiTrendingUp className="h-5 w-5" />,
    title: "Performance",
    description: "Optimized for speed",
    color: "green",
  },
];

export default function AiFeaturesPage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="container py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            <FiZap className="h-4 w-4" />
            <span>AI-Powered Tools</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Experience the Future of
            <span className="block mt-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Interactive Learning
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 max-w-2xl mx-auto leading-relaxed">
            Explore cutting-edge AI tools built to showcase modern web
            development skills and provide engaging interactive experiences
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {aiFeatures.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/5 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:border-accent/50 hover:-translate-y-2"
            >
              {/* Gradient Background Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              />

              {/* Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                {feature.badge}
              </div>

              <div className="relative p-8">
                {/* Icon */}
                <div
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                >
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-accent transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-slate-600 dark:text-white/60 leading-relaxed mb-6 min-h-[4rem]">
                  {feature.description}
                </p>

                {/* CTA */}
                <div className="flex items-center text-accent font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                  <span>Try it now</span>
                  <FiArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div
                className={`h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="container pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 dark:border-white/5 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-sm p-8 md:p-12 shadow-xl">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Built with Modern Technologies
              </h2>
              <p className="text-slate-600 dark:text-white/70 text-lg max-w-2xl mx-auto">
                These AI-powered features demonstrate expertise in building
                intelligent applications using cutting-edge tools and frameworks
              </p>
            </div>

            {/* Tech Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-white dark:bg-gray-800/80 border border-slate-200 dark:border-white/5 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-${tech.color}-500/10 text-${tech.color}-500 mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {tech.icon}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {tech.title}
                  </h3>

                  <p className="text-slate-600 dark:text-white/60 text-sm">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Stats */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    3+
                  </div>
                  <div className="text-slate-600 dark:text-white/60 text-sm">
                    AI Features
                  </div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    100%
                  </div>
                  <div className="text-slate-600 dark:text-white/60 text-sm">
                    AI-Powered
                  </div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Fast
                  </div>
                  <div className="text-slate-600 dark:text-white/60 text-sm">
                    Performance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
