import { cp, rm, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractMain, extractHead, enhancePage } from "./extract-fragments.mjs";
import { buildMergedIndex } from "./merge.mjs";
import { ROUTES } from "./routes.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(ROOT, "dist");
const PUBLIC = join(ROOT, "public");
const SRC = join(ROOT, "src", "pages");

console.log("Building gender-predictor (single-page merge)...");

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

// index.html — ALL content merged into one page (tools, methods, comparisons,
// blog, about, privacy). Sections anchored as #sec-<id>; nav scrolls to them.
const merged = await buildMergedIndex();
await writeFile(join(DIST, "index.html"), merged.html);

// Full pages stay in dist -> SEO deep links + no-JS still work.
// Each complete page gets data-page + router.js so deep-link entry also SPAs.
for (const [id, rel] of Object.entries(ROUTES)) {
  if (id === "index") continue;
  const dest = join(DIST, rel);
  await mkdir(join(dest, ".."), { recursive: true });
  const raw = await readFile(join(SRC, rel), "utf8");
  const enhanced = enhancePage(raw, id);
  await writeFile(dest, enhanced);
}

// router.js
await cp(join(PUBLIC, "router.js"), join(DIST, "router.js"));

// Static assets
await cp(join(PUBLIC, "robots.txt"), join(DIST, "robots.txt"));
await cp(join(PUBLIC, "llms.txt"), join(DIST, "llms.txt"));
await cp(join(PUBLIC, "_headers"), join(DIST, "_headers"));
await cp(join(PUBLIC, "_redirects"), join(DIST, "_redirects"));
await cp(join(PUBLIC, "og-image.svg"), join(DIST, "og-image.svg"));

// Images (placeholders; generated assets live under public/images)
try {
  await cp(join(PUBLIC, "images"), join(DIST, "images"), { recursive: true });
} catch (e) { /* images dir optional */ }

// Asyncronously produce lazy-loaded fragments + meta
const FRAG = join(DIST, "_assets", "frag");
const ASSETS = join(DIST, "_assets");
await mkdir(FRAG, { recursive: true });

const meta = {};
for (const [id, rel] of Object.entries(ROUTES)) {
  const html = await readFile(join(SRC, rel), "utf8");
  meta[id] = extractHead(html);
  if (id === "index") continue;
  // fragment lives at a path mirroring the route: _assets/frag/<id>.html
  const fragPath = join(FRAG, id + ".html");
  await mkdir(join(fragPath, ".."), { recursive: true });
  await writeFile(fragPath, extractMain(html));
}

await writeFile(join(ASSETS, "meta.json"), JSON.stringify(meta));

// sitemap
await cp(join(ROOT, "sitemap.xml"), join(DIST, "sitemap.xml"));

console.log("  Single-page index: " + merged.sectionCount + " merged sections");
console.log("  Full pages: " + (Object.keys(ROUTES).length - 1));
console.log("  Fragments:  " + (Object.keys(ROUTES).length - 1));
console.log("  Static assets + sitemap + router.js");
console.log("  Deploy dist/ to Cloudflare Pages or any static host.");