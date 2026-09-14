import { cp, rm, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractMain, extractHead, enhancePage } from "./extract-fragments.mjs";
import { buildMergedIndex } from "./merge.mjs";
import { serverRenderHome } from "./scripts/ssr-home.mjs";
import { externalizeAppScript } from "./scripts/externalize-script.mjs";
import { buildSitemap } from "./scripts/gen-sitemap.mjs";
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
const home = externalizeAppScript(serverRenderHome(merged.html), "home");
await mkdir(join(DIST, "assets"), { recursive: true });
if (home.file) await writeFile(join(DIST, "assets", home.file.name), home.file.code);
await writeFile(join(DIST, "index.html"), home.html);

// Full pages stay in dist -> SEO deep links + no-JS still work.
// Directory format: dist/<route>/index.html so /about/ serves 200 directly
// (matches canonical + sitemap trailing slashes; /about -> /about/ via _redirects 301).
// Each complete page gets data-page + router.js so deep-link entry also SPAs.
for (const [id, rel] of Object.entries(ROUTES)) {
  if (id === "index") continue;
  // "about.html" -> "about"; "blog/index.html" -> "blog"; "blog/x.html" -> "blog/x"
  const dir = rel.replace(/\.html$/, "").replace(/\/index$/, "");
  const dest = join(DIST, dir, "index.html");
  await mkdir(join(DIST, dir), { recursive: true });
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
await cp(join(PUBLIC, "og-image.png"), join(DIST, "og-image.png"));
// Brand icons + webfont (self-hosted: no render-blocking Google Fonts request)
for (const f of ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "site.webmanifest"]) {
  await cp(join(PUBLIC, f), join(DIST, f));
}
await cp(join(PUBLIC, "fonts"), join(DIST, "fonts"), { recursive: true });
// Cloudflare Pages serves 404.html for unmatched paths with HTTP 404
// (prevents soft-404: unknown URLs previously returned index.html with 200).
await cp(join(PUBLIC, "404.html"), join(DIST, "404.html"));

// Images (real artwork + placeholders; generated assets live under public/images)
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

// sitemap — one canonical file (sitemap-index.xml). /sitemap.xml is a 301 in
// _redirects, so no duplicate urlset is emitted (two identical sitemaps made
// it ambiguous which one Google should trust).
const sitemap = buildSitemap();
await writeFile(join(DIST, "sitemap-index.xml"), sitemap);
await writeFile(join(ROOT, "sitemap-index.xml"), sitemap);

console.log("  Single-page index: " + merged.sectionCount + " merged sections");
console.log("  Full pages: " + (Object.keys(ROUTES).length - 1));
console.log("  Fragments:  " + (Object.keys(ROUTES).length - 1));
console.log("  Static assets + sitemap + router.js");
console.log("  Deploy dist/ to Cloudflare Pages or any static host.");