// Regenerate sitemap-index.xml: keeps URL order + priority from the committed
// file, but refreshes <lastmod> from git history of each route's source file
// (a hardcoded 2026-08-20 for pages edited in September is a trust signal
// Google can see through). Writes both the repo copy (served in dev) and dist.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ROUTES } from "../routes.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const BASE = "https://www.gender-predictor.com";
const SRC = join(ROOT, "src", "pages");

function gitDate(rel) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cd", "--date=short", "--", rel], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : "";
  } catch {
    return "";
  }
}

export function buildSitemap() {
  const committed = join(ROOT, "sitemap-index.xml");
  const existing = existsSync(committed) ? readFileSync(committed, "utf8") : "";
  const entries = [...existing.matchAll(/<loc>([^<]+)<\/loc>\s*(?:<priority>([^<]+)<\/priority>)?\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)];

  const urlToFile = {};
  for (const [id, rel] of Object.entries(ROUTES)) {
    const path = id === "index" ? "" : "/" + id.replace(/^\/+|\/+$/g, "") + "/";
    urlToFile[BASE + path] = join("src", "pages", rel);
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const seen = new Set();
  for (const e of entries) {
    const loc = e[1].replace(/\/$/, "") === BASE ? BASE : e[1];
    const file = urlToFile[loc] || urlToFile[e[1]];
    if (!file) {
      console.warn("  sitemap: no route for", e[1]);
      continue;
    }
    const lastmod = gitDate(file.replace(/\\/g, "/")) || e[3] || "";
    seen.add(loc);
    xml +=
      "  <url><loc>" + loc + "</loc>" +
      (e[2] ? "<priority>" + e[2] + "</priority>" : "") +
      (lastmod ? "<lastmod>" + lastmod + "</lastmod>" : "") +
      "</url>\n";
  }
  for (const [loc, file] of Object.entries(urlToFile)) {
    if (seen.has(loc)) continue;
    const lastmod = gitDate(file.replace(/\\/g, "/"));
    xml += "  <url><loc>" + loc + "</loc>" + (lastmod ? "<lastmod>" + lastmod + "</lastmod>" : "") + "</url>\n";
    console.log("  sitemap: added missing URL", loc);
  }
  return xml + "</urlset>\n";
}

if (process.argv[1] && process.argv[1].endsWith("gen-sitemap.mjs")) {
  const xml = buildSitemap();
  writeFileSync(join(ROOT, "sitemap-index.xml"), xml);
  console.log("sitemap-index.xml regenerated,", (xml.match(/<loc>/g) || []).length, "urls");
}
