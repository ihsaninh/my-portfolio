import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { NextRequest } from "next/server";

import { retrieveSimilar } from "@/src/shared/lib/ai/rag/retriever";
import { chatCache } from "@/src/shared/lib/services/chat-cache";
import {
  checkRateLimit,
  generalLimiter,
} from "@/src/shared/lib/services/rate-limit";

export const runtime = "edge";
export const maxDuration = 30;

type Mode = "HR" | "TECH";

function ragSystemPrompt(mode: Mode) {
  return `
Kamu adalah "Ihsan Nurul Habib" - jawab seperti orang Indonesia biasa dalam interview atau obrolan santai.

Karakter:
- Natural, friendly, tidak kaku atau terlalu formal
- Pakai "aku/saya" secara natural (aku untuk casual, saya untuk sedikit formal)
- JANGAN pakai kata "Anda" - gunakan nama, Pak/Bu, atau sebutan yang sesuai
- Jawab langsung, jangan bertele-tele
- Kalau ditanya hal spesifik, fokus ke itu aja dan pastikan akurat sesuai Context
- Gunakan bahasa sehari-hari, bukan bahasa marketing/corporate
- Jangan mengulangi informasi yang sudah disebutkan sebelumnya

⚠️ ATURAN WAJIB - JANGAN LANGGAR:
- HANYA gunakan informasi dari Context yang diberikan
- JANGAN PERNAH mengarang, menebak, atau spekulasi
- Pastikan detail teknis (tech stack, tahun, role, lokasi) PERSIS sesuai Context
- Kalau Context tidak ada atau tidak relevan: "Wah, kayaknya belum ada info tentang itu di data aku. Ada yang lain?"
- Kalau tidak yakin dengan informasi: "Hmm, kurang yakin nih, mungkin ada yang lebih spesifik?"
- JANGAN pakai referensi [#] atau sitasi apapun
- JANGAN pakai numbering (1., 2., 3.), bullet points (•, -), atau format list apapun
- Jawab dalam bentuk paragraf natural seperti obrolan biasa
- Kalau sudah dijelaskan sebelumnya, cukup bilang "Yep" atau variasi singkat

Gaya jawaban (${mode}):
- HR mode: Fokus pengalaman kerja, kolaborasi tim, dan hasil project. Hindari detail teknis coding.
- TECH mode: Fokus stack teknologi, arsitektur, dan keputusan teknis. Sebutkan tech stack yang tepat sesuai Context.

Contoh respons natural:
"Iya, aku pernah ngerjain XL SATU. Pakai React.js, Next.js, Flowbite, sama TailwindCSS"
"Buat mobile ada BoostPreneur sama BoostPenjual, keduanya React Native"
"Wah, kayaknya belum ada info tentang itu di data aku. Ada yang lain?"
`.trim();
}

function buildContextBlock(
  chunks: {
    content: string;
    title: string | null;
    url: string | null;
    similarity: number;
  }[],
) {
  const lines: string[] = [];
  chunks.forEach((c, i) => {
    lines.push(
      `[#${i + 1}] title: ${c.title ?? "(untitled)"} | url: ${
        c.url ?? "-"
      } | score: ${c.similarity.toFixed(3)}`,
    );
    lines.push(c.content.trim());
    lines.push("");
  });
  return lines.join("\n");
}

function isTextPart(p: unknown): p is { type: "text"; text: string } {
  if (typeof p !== "object" || p === null) return false;
  const o = p as Record<string, unknown>;
  return o.type === "text" && typeof o.text === "string";
}

function isGreeting(text: string): boolean {
  const t = text.toLowerCase();
  return /^(halo|hai|hai\s|halo\s|selamat\s(pagi|siang|sore|malam)|hi\b)/.test(
    t,
  );
}

function isIntroductionIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /perkenalkan|kenalan|introduce|perkenalan|siapa\s*kamu|profil\s*kamu|cerita\s*tentang\s*kamu/.test(
    t,
  );
}

function isExperienceIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /pengalaman|experience|proyek|project|pernah|riwayat|cv|portfolio/.test(
    t,
  );
}

function isLastProjectIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /pro(j|y)ek\s*(terakhir|terbaru)|last\s*project|recent\s*project|project\s*apa\s*y(g|ang)\s*kamu\s*kerjakan/.test(
    t,
  );
}

function isProjectStackIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /stack|teknologi|tech\s*stack|pakai\s*apa|tools?|framework|library/.test(
    t,
  );
}

function isLocationIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /domisili|tinggal\s*(dimana|di\s*mana)|lokasi|alamat|tempat\s*tinggal|rumah|daerah|wilayah/.test(
    t,
  );
}

function isTenureIntent(text: string): boolean {
  const t = text.toLowerCase();
  return /berapa\s*tahun|sudah\s*\d+\s*tahun|berapa\s*lama|tahun\s*ini|yoe|lama\s*kerja/.test(
    t,
  );
}

function contentToPlainText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content))
    return content
      .filter(isTextPart)
      .map((p) => p.text)
      .join("\n");
  if (typeof content === "object" && content !== null) {
    const o = content as Record<string, unknown>;
    if (o.type === "text" && typeof o.text === "string") return o.text;
    if (typeof o.text === "string") return o.text;
  }
  return "";
}

export async function POST(req: NextRequest) {
  // Check rate limit first
  const rateLimit = checkRateLimit(req, generalLimiter);
  if (rateLimit.limited) {
    return rateLimit.response!;
  }

  // mode dari query agar gaya jawaban konsisten dengan Hire Me
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") as Mode) ?? "HR";
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }
  const { messages } = (body ?? {}) as { messages?: UIMessage[] };
  if (!Array.isArray(messages)) {
    return new Response("Missing or invalid 'messages' array", { status: 400 });
  }
  // Extract last non-empty user message from raw UI messages
  let userMsg = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const text = contentToPlainText((m as { content?: unknown }).content);
    if (text && text.trim()) {
      userMsg = text.trim();
      break;
    }
  }
  if (!userMsg) {
    // Fallback: try conversion first, then extract
    try {
      const converted = convertToModelMessages(messages) as Array<{
        role: "system" | "user" | "assistant";
        content: unknown;
      }>;
      for (let i = converted.length - 1; i >= 0; i--) {
        const m = converted[i];
        if (m.role !== "user") continue;
        const text = contentToPlainText(m.content);
        if (text && text.trim()) {
          userMsg = text.trim();
          break;
        }
      }
    } catch {}
  }
  if (!userMsg) {
    return new Response("Missing user message", { status: 400 });
  }

  // Check cache first (only for non-greeting messages)
  if (!isGreeting(userMsg)) {
    const cachedResponse = chatCache.get(userMsg, mode);
    if (cachedResponse) {
      return new Response(cachedResponse, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Cache-Hit": "true",
        },
      });
    }
  }

  // Greeting: jawab singkat tanpa RAG agar tidak melebar
  if (isGreeting(userMsg)) {
    // Check cache for greetings
    const cachedGreeting = chatCache.get(userMsg, mode);
    if (cachedGreeting) {
      return new Response(cachedGreeting, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Cache-Hit": "true",
        },
      });
    }

    const result = streamText({
      model: google("gemini-3.5-flash"),
      system: `Jawab salam dengan natural dan friendly seperti orang Indonesia biasa dalam konteks interview atau profesional.

      Aturan:
      - Pakai "Pak" untuk laki-laki, "Kak" atau "Mba" untuk perempuan
      - Jangan pakai kata "Anda" - gunakan nama atau sebutan yang sesuai
      - Maksimal 1-2 kalimat pendek, casual tapi sopan
      - Tunjukkan antusiasme untuk interview

      Contoh bagus:
      "Halo Pak Budi, selamat siang! Senang bisa ketemu hari ini."
      "Hai Pak! Terima kasih sudah meluangkan waktu."

      Hindari:
      - "Anda"
      - Terlalu formal seperti "bertemu dengan Anda"
      - Kalimat panjang`,
      messages: [{ role: "user", content: userMsg }],
      temperature: 0.3,
    });

    // For greetings, we'll cache the response after streaming
    // Note: This is a simplified approach. In production, you'd want to collect the stream
    const response = result.toUIMessageStreamResponse();

    // Cache greeting responses (simplified - in real implementation, collect stream content)
    // For now, we'll skip caching streaming responses to avoid complexity
    return response;
  }

  try {
    // Retrieve context dari Supabase dengan filter sumber berdasarkan intent
    const allowedSources = isTenureIntent(userMsg)
      ? ["experience", "profile"]
      : isLastProjectIntent(userMsg)
        ? ["project"]
        : isExperienceIntent(userMsg)
          ? ["profile", "experience", "project"]
          : isIntroductionIntent(userMsg)
            ? ["profile", "skills", "experience"]
            : isProjectStackIntent(userMsg)
              ? ["project", "skills"]
              : isLocationIntent(userMsg)
                ? ["profile"]
                : undefined;

    let retrieved = await retrieveSimilar(userMsg, {
      matchCount: isTenureIntent(userMsg)
        ? 4
        : isLastProjectIntent(userMsg)
          ? 5
          : isIntroductionIntent(userMsg)
            ? 6
            : isProjectStackIntent(userMsg)
              ? 8
              : isLocationIntent(userMsg)
                ? 3
                : 6,
      threshold: isTenureIntent(userMsg)
        ? 0.6
        : isLastProjectIntent(userMsg)
          ? 0.55
          : isIntroductionIntent(userMsg)
            ? 0.5
            : isProjectStackIntent(userMsg)
              ? 0.45
              : isLocationIntent(userMsg)
                ? 0.3
                : 0.5,
      allowedSources,
    });

    // Jika tanya proyek terakhir/terbaru, urutkan berdasarkan tahun pada metadata.period (desc), lalu similarity
    if (isLastProjectIntent(userMsg)) {
      const yearScore = (meta: unknown): number => {
        if (!meta || typeof meta !== "object") return 0;
        const m = meta as Record<string, unknown>;
        const p = String(m.period ?? "");
        const years = Array.from(p.matchAll(/\b(19|20)\d{2}\b/g)).map((x) =>
          Number(x[0]),
        );
        return years.length ? Math.max(...years) : 0;
      };
      retrieved = [...retrieved].sort(
        (a, b) =>
          yearScore(b.metadata) - yearScore(a.metadata) ||
          b.similarity - a.similarity,
      );
    }

    const contextBlock = buildContextBlock(
      retrieved.map((r) => ({
        content: r.content,
        title: r.title,
        url: r.url,
        similarity: r.similarity,
      })),
    );

    const system = ragSystemPrompt(mode);
    const extraRules = isTenureIntent(userMsg)
      ? `Kalau ditanya soal berapa tahun kerja/pengalaman: lihat tanggal di Context, hitung dari September 2019 sampai sekarang (2025), terus jawab natural kayak "Udah sekitar 5-6 tahun nih" atau "Kalau dihitung-hitung sekitar 5 tahun lebih". JANGAN pakai numbering atau format list. Jawab dalam bentuk kalimat biasa. Kalau tanggalnya kurang lengkap, bilang aja "Hmm, kurang jelas tanggalnya, bisa spesifik yang mana?"`
      : isLastProjectIntent(userMsg)
        ? `Kalau ditanya proyek terakhir/terbaru: pilih yang paling baru dari Context (liat tahun/periode). Jawab santai tapi spesifik: nama proyek + role + tech stack YANG BENER sesuai Context + hasil. Contoh: "Terakhir aku ngerjain [nama project], pakai [exact tech dari Context] buat [tujuan]". Pastikan tech stack akurat!`
        : isIntroductionIntent(userMsg)
          ? `Kalau diminta perkenalan diri: fokus ke pengalaman kerja, skills utama, dan domain expertise (telco/enterprise). Sebutkan 2-3 highlight terpenting. Jangan terlalu panjang, maksimal 2-3 kalimat.`
          : isProjectStackIntent(userMsg)
            ? `Kalau ditanya tentang tech stack/teknologi: sebutkan tech stack yang PERSIS sesuai Context. Jangan mengarang atau salah sebut teknologi. Kalau ada beberapa proyek, sebutkan yang paling relevan dengan pertanyaan.`
            : isLocationIntent(userMsg)
              ? `Kalau ditanya tentang domisili/lokasi tinggal: HANYA jawab kalau ada info lokasi di Context. Kalau tidak ada info lokasi sama sekali di Context, bilang "Wah, kayaknya belum ada info lokasi di data aku. Ada yang lain?" JANGAN mengarang lokasi dan JANGAN pakai referensi [#]!`
              : `Jawab sesuai pertanyaan aja, jangan nambah-nambah info yang gak ditanya. Keep it simple and direct.`;

    const preamble = `Context (pakai info ini aja, jawab maksimal 2 paragraf, fokus ke pertanyaan, JANGAN pakai referensi [#], JANGAN pakai numbering atau bullet points, jawab seperti obrolan natural):\n\n${extraRules}\n\n${contextBlock}`;

    // Convert to model messages, but be resilient if conversion fails (fallback to empty history)
    let modelMessages: Parameters<typeof streamText>[0]["messages"] = [];
    try {
      modelMessages = convertToModelMessages(messages);
    } catch {
      modelMessages = [];
    }

    const result = streamText({
      model: google("gemini-3.5-flash"),
      system,
      messages: [
        ...modelMessages.filter((m) => m.role !== "system"),
        { role: "user" as const, content: preamble },
      ],
      temperature: mode === "HR" ? 0.3 : 0.2,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Ask API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
