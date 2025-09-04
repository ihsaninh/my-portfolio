# 🚀 Ihsan Nurul Habib - Personal Portfolio

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://ihsaninh.com)

A modern, performant, and accessible personal portfolio website built with Next.js 15, TypeScript, and TailwindCSS. Features smooth animations, AI-powered interactions, and a beautiful dark mode.

## ✨ Features

### Core Features

- **⚡ Ultra-fast Performance** - TTI < 2s on mobile networks with Turbopack
- **🎨 Modern Design** - Clean, minimalist UI with smooth Framer Motion animations
- **🌓 Dark Mode** - System-aware theme switching with next-themes
- **📱 Fully Responsive** - Optimized for all devices and screen sizes
- **♿ Accessibility First** - WCAG compliant with proper ARIA labels and keyboard navigation
- **🔍 SEO Optimized** - Meta tags, Open Graph, and dynamic sitemap generation

### Interactive Sections

- **🏠 Home** - Dynamic hero section with availability status and quick actions
- **📝 Resume** - Interactive timeline showcasing experience, education, and certifications
- **🛠️ Skills** - Visual grid of technologies and tools with hover effects
- **💼 Work Portfolio** - Project showcase with Swiper carousel, live demos, and GitHub links
- **📰 Blog** - MDX-powered blog with syntax highlighting (rehype-prism-plus)
- **📬 Contact** - Direct contact form with React Hook Form and Zod validation
- **🤖 Hire Me Simulator** - AI-powered interview simulation using Google Gemini

### Technical Features

- **🚀 Turbopack** - Lightning-fast development builds
- **📊 Analytics** - Vercel Analytics and Speed Insights integration
- **🔒 Security Headers** - CSP, X-Frame-Options, and other security best practices
- **🎯 Type Safety** - Full TypeScript coverage with strict mode
- **🧪 Testing** - Unit tests with Bun test runner and Testing Library
- **📦 CI/CD** - Automated deployment with Vercel
- **🎨 MDX Support** - Write content in Markdown with React components
- **💾 RAG Pipeline** - Retrieval-Augmented Generation with Supabase pgvector

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 15.3.4 (App Router)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4 + PostCSS
- **Animations:** Framer Motion 12
- **Icons:** React Icons
- **Forms:** React Hook Form + Zod validation
- **Carousel:** Swiper 11

### Backend & AI

- **Database:** Supabase (PostgreSQL with pgvector extension)
- **AI Integration:** Google Gemini (via AI SDK)
- **Embeddings:** Google text-embedding-004 (768 dimensions)
- **Caching:** Upstash Redis
- **Analytics:** Vercel Analytics & Speed Insights

### Developer Experience

- **Package Manager:** Bun
- **Linting:** ESLint 9 with Next.js config
- **Code Quality:** Husky + Commitlint (conventional commits)
- **Testing:** Bun test + Testing Library + Happy DOM
- **Build Tool:** Turbopack for development

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ or Bun 1.0+
- Git
- Supabase account (for RAG features)
- Google AI API key (for AI features)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ihsaninh/my-portofolio-next.git
cd my-portofolio-next
```

2. **Install dependencies**

```bash
bun install
# or
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Upstash Redis (optional)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

4. **Run development server**

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📁 Project Structure

```
my-portofolio-next/
├── app/                    # Next.js app directory
│   ├── blog/              # Blog pages
│   ├── hire-me/           # AI interview simulator
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── sitemap.ts         # Dynamic sitemap
├── src/
│   ├── components/        # React components
│   │   ├── blog/         # Blog listing & cards
│   │   ├── contact/      # Contact form
│   │   ├── home/         # Hero section
│   │   ├── lazy/         # Lazy-loaded sections
│   │   ├── resume/       # Timeline & certifications
│   │   ├── skills/       # Skills grid
│   │   └── work/         # Portfolio carousel
│   ├── data/             # Static data
│   │   ├── navLinks.ts   # Navigation configuration
│   │   ├── projects.ts   # Portfolio projects
│   │   ├── resume.ts     # Experience, education, skills
│   │   └── socials.ts    # Social media links
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & configurations
│   │   ├── mdx.ts        # MDX utilities
│   │   ├── rag/          # RAG implementation
│   │   └── supabase.ts   # Database client
│   └── types/            # TypeScript definitions
├── public/               # Static assets
│   ├── document/        # CV and documents
│   └── images/          # Images and media
├── scripts/             # Build and utility scripts
│   └── rag/            # RAG ingestion scripts
├── tests/              # Test files
│   ├── components/     # Component tests
│   ├── hooks/          # Hook tests
│   └── lib/            # Utility tests
└── config files...     # Various configuration files
```

## 📝 Available Scripts

```bash
# Development
bun dev              # Start dev server with Turbopack
bun build           # Build for production
bun start           # Start production server

# Code Quality
bun lint            # Run ESLint
bun lint:fix        # Fix ESLint issues
bun test            # Run tests
bun test:watch      # Run tests in watch mode
bun test:coverage   # Generate test coverage

# Git Hooks (auto-configured)
bun prepare         # Setup Husky for commit hooks

# RAG Pipeline
bun scripts/rag/ingest.ts  # Ingest content into vector database
```

## 🤖 RAG (Retrieval-Augmented Generation) Setup

This portfolio includes an advanced RAG pipeline for AI-powered interactions:

### Database Setup

1. Create a Supabase project
2. Enable the `vector` extension in your database
3. Run the schema creation script in Supabase SQL editor:

```sql
-- Create the rag_chunks table
CREATE TABLE rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id TEXT NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(doc_id, chunk_index)
);

-- Create index for vector similarity search
CREATE INDEX ON rag_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Content Ingestion

1. Add/update your profile data in:

   - `src/data/profile.md` - About section
   - `src/data/resume.ts` - Experience, education, skills
   - `src/data/projects.ts` - Portfolio projects
   - Blog posts in MDX format

2. Run the ingestion script:

```bash
bun scripts/rag/ingest.ts
```

This will:

- Chunk your content into manageable pieces
- Generate embeddings using Google's text-embedding-004
- Store in Supabase with pgvector for similarity search

### API Usage

```typescript
// POST /api/ask
const response = await fetch("/api/ask", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "What experience does Ihsan have with React?",
  }),
});

// Stream the response
const reader = response.body.getReader();
// ... handle streaming response
```

## 🎯 Performance Metrics

- **Lighthouse Score:** 95+ across all metrics
- **First Contentful Paint:** < 0.8s
- **Time to Interactive:** < 2s
- **Cumulative Layout Shift:** < 0.1
- **Bundle Size:** Optimized with dynamic imports and tree shaking

## 🔒 Security

The application implements comprehensive security headers:

```typescript
// Security headers configuration
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "..."
}
```

## 🧪 Testing

Comprehensive test coverage with Bun test runner:

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/components/home/index.test.tsx

# Generate coverage report
bun test:coverage

# Watch mode for development
bun test:watch
```

Test structure:

- Component tests with Testing Library
- Hook tests for custom hooks
- Utility function tests
- Mocked external dependencies

## 📦 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ihsaninh/my-portofolio-next)

1. Click the button above
2. Configure environment variables in Vercel dashboard
3. Deploy!

### Manual Deployment

```bash
# Build the application
bun run build

# Start production server
bun run start
```

### Environment Variables Required for Production

````env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

## 🎨 Customization

### Theming
Modify `tailwind.config.js` to customize colors, fonts, and spacing:

```javascript
theme: {
  extend: {
    colors: {
      accent: 'rgb(var(--accent) / <alpha-value>)',
      primary: 'rgb(var(--primary) / <alpha-value>)'
    }
  }
}
````

### Content

- Update personal information in `src/data/` directory
- Add blog posts as MDX files
- Modify components in `src/components/`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit using conventional commits (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for the Web
- [Vercel](https://vercel.com/) - Platform for deployment
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Production-ready animations
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Google Gemini](https://ai.google.dev/) - Advanced AI capabilities

## 📞 Contact

**Ihsan Nurul Habib** - Full Stack Software Engineer

- 🌐 Website: [ihsaninh.com](https://ihsaninh.com)
- 📧 Email: [ihsan.inh@gmail.com](mailto:ihsan.inh@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/ihsaninh](https://linkedin.com/in/ihsaninh)
- 🐙 GitHub: [github.com/ihsaninh](https://github.com/ihsaninh)
- 📍 Location: Jakarta, Indonesia

---

<p align="center">
  Built with ❤️ by <a href="https://ihsaninh.com">Ihsan Nurul Habib</a> using Next.js, TypeScript, and TailwindCSS
</p>
