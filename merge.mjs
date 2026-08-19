import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractMain, extractStyles } from "./extract-fragments.mjs";
import { ROUTES } from "./routes.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const SRC = join(ROOT, "src", "pages");
const DIST = join(ROOT, "dist");

const ORDER = Object.keys(ROUTES).filter((id) => id !== "index");

// Build section id from route id: "blog/nub-theory-12-weeks" -> "sec-blog-nub-theory-12-weeks"
export function secId(id) {
  return "sec-" + id.replace(/\//g, "-");
}

// Rewrite absolute route links inside merged content to in-page anchors.
export function rewriteLinks(html) {
  return html.replace(/href="\/([a-z0-9][^"#]*?)\/?"/g, (full, p) => {
    const id = p.replace(/\/+$/, "").replace(/\.html$/, "") || "index";
    if (id === "index") return 'href="#top"';
    if (ROUTES[id]) return 'href="#' + secId(id) + '"';
    return full;
  });
}

const backToTop = '<a class="spa-back-top" href="#top">&#8593; Back to top</a>';

export async function buildMergedIndex() {
  const indexSrc = await readFile(join(SRC, "index.html"), "utf8");

  // 1. Collect all sub-page styles, dedupe by content hash.
  const styleBlocks = [];
  const seen = new Set();
  for (const id of ORDER) {
    const raw = await readFile(join(SRC, ROUTES[id]), "utf8");
    const st = extractStyles(raw);
    if (!st) continue;
    const key = st.trim();
    if (!seen.has(key)) { seen.add(key); styleBlocks.push(st); }
  }
  const mergedStyle =
    "<style>\n" +
    styleBlocks.join("\n") +
    "\n.spa-merged { border-top: 2px solid var(--border,#e8e5ec); margin-top: 48px; padding-top: 24px; }" +
    "\n.spa-back-top { display:inline-block; margin:8px 0 20px; padding:8px 16px; border:1.5px solid var(--border,#e8e5ec); border-radius:999px; color:var(--accent,#7b6b9a); text-decoration:none; font-size:.8125rem; font-weight:600; font-family:'Outfit',system-ui,sans-serif; }" +
    "\n</style>";

  // 2. Merge all sub-page <main> into sections.
  let sections = "";
  for (const id of ORDER) {
    const raw = await readFile(join(SRC, ROUTES[id]), "utf8");
    const main = extractMain(raw);
    if (!main) continue;
    const inner = rewriteLinks(main);
    sections +=
      '\n<section class="spa-merged" id="' + secId(id) + '">' +
      backToTop +
      inner +
      "\n</section>";
  }

  // 3. Rewrite home page's own internal links too (absolute route links).
  let homeMain = indexSrc;
  // The home content has absolute links like href="/blog/x/" and relative blog/...
  homeMain = rewriteLinks(homeMain);
  // Relative links inside home: href="blog/..." (no leading slash)
  homeMain = homeMain.replace(/href="(blog\/[a-z0-9][^"#]*?)\/?"/g, (full, p) => {
    const id = p.replace(/\/+$/, "").replace(/\.html$/, "");
    if (ROUTES["blog/" + id]) return 'href="#' + secId("blog/" + id) + '"';
    if (ROUTES[id]) return 'href="#' + secId(id) + '"';
    return full;
  });

  // 4. Insert the merged sections into <main> after #spa-home.
  const injectMarker = '<div id="spa-view"';
  const idx = homeMain.indexOf(injectMarker);
  if (idx === -1) throw new Error("spa-view marker not found in index.html");
  const mergedBlock = sections + "\n<div id=\"spa-view\"";
  const merged = homeMain.slice(0, idx) + mergedBlock + homeMain.slice(idx + injectMarker.length);

  // 5. Append merged styles into <head> (before </head>).
  const mergedHead = merged.replace("</head>", mergedStyle + "\n</head>");

  return { html: mergedHead, styleSize: mergedStyle.length, sectionCount: ORDER.length };
}

if (process.argv[1] && process.argv[1].endsWith("merge.mjs")) {
  const { html, styleSize, sectionCount } = await buildMergedIndex();
  await mkdir(DIST, { recursive: true });
  await writeFile(join(DIST, "index.html"), html);
  console.log("merged index.html written to dist");
  console.log("  sections:", sectionCount, " merged style bytes:", styleSize);
}
