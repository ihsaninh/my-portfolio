import { Metadata } from "next";
import Link from "next/link";
import { FiArrowRight, FiBarChart2, FiClock, FiUsers } from "react-icons/fi";

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
  },
  {
    title: "Hire Me Simulator",
    description:
      "Experience my hiring process with an AI-powered interview simulation",
    icon: <FiUsers className="h-6 w-6" />,
    href: "/hire-me",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Battle Arena",
    description: "Compete in real-time quiz battles with other users",
    icon: <FiClock className="h-6 w-6" />,
    href: "/battle",
    color: "from-red-500 to-orange-500",
  },
];

export default function AiFeaturesPage() {
  return (
    <div className="container py-12 lg:py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="h1">AI-Powered Features</h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-white/80">
          Explore the cutting-edge AI tools I&apos;ve built to showcase my
          skills and provide interactive experiences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {aiFeatures.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            className="group block rounded-2xl border border-slate-300 bg-white dark:border-white/10 dark:bg-gray-800/50 p-6 transition-all duration-300 hover:shadow-xl hover:border-accent/30 hover:-translate-y-1 flex flex-col h-full"
          >
            <div
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}
            >
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-accent transition-colors">
              {feature.title}
            </h3>
            <p className="mt-2 text-slate-700 dark:text-white/70 flex-grow">
              {feature.description}
            </p>
            <div className="mt-4 flex items-center text-accent font-medium group-hover:text-accent/80 transition-colors">
              <span>Explore feature</span>
              <FiArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-gray-800/30 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="mt-4 text-slate-700 dark:text-white/80">
            These AI-powered features demonstrate my expertise in building
            intelligent applications using modern technologies like Google
            Gemini, Supabase, and Next.js. Each tool is designed to provide
            valuable insights while showcasing my skills in AI integration,
            real-time systems, and user experience design.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-white dark:bg-gray-800/50">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <FiBarChart2 className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-medium text-slate-900 dark:text-white">
                AI Integration
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
                Powered by Google Gemini
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white dark:bg-gray-800/50">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <FiUsers className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-medium text-slate-900 dark:text-white">
                Real-time
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
                Interactive experiences
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white dark:bg-gray-800/50">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <FiClock className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-medium text-slate-900 dark:text-white">
                Performance
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
                Optimized for speed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
