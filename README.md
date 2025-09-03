This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## RAG (Supabase + pgvector)

This repo includes a minimal Retrieval-Augmented Generation pipeline to ground answers in your content (blogs in `src/blogs` and `README.md`).

Setup
- Supabase: create project, enable `vector` extension, run `scripts/rag/schema.sql` in SQL editor.
- Env: copy `.env.example` → `.env` and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `GOOGLE_AI_API_KEY`.

Ingest Content
- Add your profile data in:
  - `src/data/profile.md`
  - `src/data/experience.json`
  - `src/data/projects.json`
- Run: `bun scripts/rag/ingest.ts` to chunk, embed (Google `text-embedding-004`), and upsert into `rag_chunks`.

Ask API
- `POST /api/ask` streams grounded answers using `gemini-2.5-flash-lite` and cites sources as `[#]`.

Notes
- Schema uses 768-d vectors (Google embeddings). Adjust if switching models.
- The ingestion script uses the Supabase service role. Do not expose it to the client.
- Retrieval threshold is relaxed to 0.3 initially to avoid empty results with small datasets.
