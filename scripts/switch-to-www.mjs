import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".wrangler"]);
const FILES = [
  "sitemap-index.xml",
  "extract-fragments.mjs",
  "public/robots.txt",
  "public/llms.txt",
];

function walk(dir, cb) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, cb);
    else if (/\.(html|xml|txt|mjs|js|json|md)$/.test(name)) cb(p);
  }
}

const targets = [];
walk(ROOT, (p) => { if (!targets.includes(p)) targets.push(p); });
for (const rel of FILES) { const p = join(ROOT, rel); if (!targets.includes(p)) targets.push(p); }

let total = 0, filesTouched = 0;
for (const p of targets) {
  const before = readFileSync(p, "utf8");
  // Only the URL form; leaves emails (hello@...), SVG brand text and prose mentions untouched.
  const after = before.split("https://www.gender-predictor.com").join("https://www.gender-predictor.com");
  const n = (before.match(/https:\/\/gender-predictor\.com/g) || []).length;
  if (n) { writeFileSync(p, after); total += n; filesTouched++; }
}
console.log("replaced", total, "URL occurrences across", filesTouched, "files");
// sanity: any bare https URL left?
let leftover = 0;
for (const p of targets) {
  const c = readFileSync(p, "utf8");
  const m = c.match(/https:\/\/gender-predictor\.com/g);
  if (m) { leftover += m.length; console.log("LEFTOVER", p.replace(ROOT, ""), m.length); }
}
console.log("bare https URLs remaining:", leftover);
