// Simple text chunker for Markdown/MDX/README content.
// Targets ~1200 characters with 200 char overlap.

export type Chunk = {
  text: string;
  index: number;
};

export function chunkText(
  input: string,
  {
    targetSize = 1200,
    overlap = 200,
  }: { targetSize?: number; overlap?: number } = {}
): Chunk[] {
  const clean = input
    .replace(/```[\s\S]*?```/g, (m) => m) // keep code blocks intact
    .replace(/\n{3,}/g, "\n\n") // normalize blank lines
    .trim();

  if (clean.length <= targetSize) return [{ text: clean, index: 0 }];

  const chunks: Chunk[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + targetSize, clean.length);
    let slice = clean.slice(i, end);
    // try to end on a paragraph boundary
    const lastBreak = slice.lastIndexOf("\n\n");
    if (lastBreak > targetSize * 0.6 && end < clean.length) {
      slice = slice.slice(0, lastBreak);
    }
    chunks.push({ text: slice, index: chunks.length });
    if (end === clean.length) break;
    i = i + Math.max(1, targetSize - overlap);
  }
  return chunks;
}

