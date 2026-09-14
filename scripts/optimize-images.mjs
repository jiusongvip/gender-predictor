// Dev-only: derive responsive WebP copies for the article/tool diagrams.
// The 1536x1024 sources are ~50-115 KB but never render wider than 712 CSS px,
// so shipping them costs LCP bytes on mobile. Run manually after adding or
// replacing an artwork file:  npm i --no-save sharp && node scripts/optimize-images.mjs
// The generated -600w / -1200w files are committed (no build-time image dep).
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(fileURLToPath(new URL(".", import.meta.url)), "..", "public", "images");
const WIDTHS = [600, 1200];

for (const f of readdirSync(DIR).filter((n) => n.endsWith(".webp") && !/-\d+w\.webp$/.test(n))) {
  const src = join(DIR, f);
  const stem = basename(f, ".webp");
  const meta = await sharp(src).metadata();
  for (const w of WIDTHS) {
    if (w > meta.width) continue;
    const out = join(DIR, `${stem}-${w}w.webp`);
    await sharp(src).resize({ width: w }).webp({ quality: w === 600 ? 78 : 74, effort: 6 }).toFile(out);
    const { size } = await sharp(out).stats().then(() => import("node:fs/promises")).then((m) => m.stat(out));
    console.log(`${stem}-${w}w.webp  ${meta.width}x${meta.height} -> ${w}px  ${(size / 1024).toFixed(1)} KB`);
  }
}
