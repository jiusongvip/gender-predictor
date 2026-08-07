import { cp, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(ROOT, "dist");
const PUBLIC = join(ROOT, "public");
const SRC = join(ROOT, "src", "pages");

console.log("Building gender-predictor...");

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

// HTML pages from src/pages/
await cp(join(SRC, "index.html"), join(DIST, "index.html"));
await cp(join(SRC, "about.html"), join(DIST, "about.html"));
await cp(join(SRC, "privacy.html"), join(DIST, "privacy.html"));
await cp(join(SRC, "chinese-gender-chart.html"), join(DIST, "chinese-gender-chart.html"));
await cp(join(SRC, "baby-gender-prediction-quiz.html"), join(DIST, "baby-gender-prediction-quiz.html"));
await cp(join(SRC, "boy-or-girl-quiz.html"), join(DIST, "boy-or-girl-quiz.html"));
await cp(join(SRC, "pregnancy-symptoms-boy-vs-girl.html"), join(DIST, "pregnancy-symptoms-boy-vs-girl.html"));
await cp(join(SRC, "gender-predictor-accuracy.html"), join(DIST, "gender-predictor-accuracy.html"));
await cp(join(SRC, "when-to-find-out-gender.html"), join(DIST, "when-to-find-out-gender.html"));
await cp(join(SRC, "nub-theory-boy-vs-girl.html"), join(DIST, "nub-theory-boy-vs-girl.html"));
await cp(join(SRC, "ramzi-theory-boy-vs-girl.html"), join(DIST, "ramzi-theory-boy-vs-girl.html"));
await cp(join(SRC, "skull-theory-boy-vs-girl.html"), join(DIST, "skull-theory-boy-vs-girl.html"));
await cp(join(SRC, "gender-reveal-party-ideas.html"), join(DIST, "gender-reveal-party-ideas.html"));
await cp(join(SRC, "baking-soda-gender-test.html"), join(DIST, "baking-soda-gender-test.html"));
await cp(join(SRC, "ring-gender-test.html"), join(DIST, "ring-gender-test.html"));
await cp(join(SRC, "chinese-calendar-vs-ramzi-theory.html"), join(DIST, "chinese-calendar-vs-ramzi-theory.html"));
await cp(join(SRC, "chinese-calendar-vs-nub-theory.html"), join(DIST, "chinese-calendar-vs-nub-theory.html"));
await cp(join(SRC, "chinese-calendar-vs-old-wives-tales.html"), join(DIST, "chinese-calendar-vs-old-wives-tales.html"));
await cp(join(SRC, "ramzi-vs-nub-theory.html"), join(DIST, "ramzi-vs-nub-theory.html"));

// Static assets from public/
await cp(join(PUBLIC, "robots.txt"), join(DIST, "robots.txt"));
await cp(join(PUBLIC, "llms.txt"), join(DIST, "llms.txt"));
await cp(join(PUBLIC, "_headers"), join(DIST, "_headers"));
await cp(join(PUBLIC, "_redirects"), join(DIST, "_redirects"));
await cp(join(PUBLIC, "og-image.svg"), join(DIST, "og-image.svg"));
await cp(join(PUBLIC, "images"), join(DIST, "images"), { recursive: true });
await cp(join(PUBLIC, "fonts"), join(DIST, "fonts"), { recursive: true });

// Blog from src/pages/blog/
await cp(join(SRC, "blog"), join(DIST, "blog"), { recursive: true });

// Sitemap from root
await cp(join(ROOT, "sitemap.xml"), join(DIST, "sitemap.xml"));

console.log("  Built to dist/");
console.log("  19 HTML pages from src/pages/");
console.log("  blog/ (12 articles) from src/pages/blog/");
console.log("  Static assets from public/");
console.log("  sitemap.xml from root");
console.log("  Deploy dist/ to Cloudflare Pages or any static host.");
