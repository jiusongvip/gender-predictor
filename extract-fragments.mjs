import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Strip CR char only — keep everything else byte-exact
export function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1].trim() : "";
}

export function extractStyles(html) {
  const out = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out.join("\n");
}

export function extractHead(html) {
  const gt = (re) => (html.match(re) || [])[1] || "";
  const jsonld = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) jsonld.push(m[1].trim());
  return {
    title: gt(/<title>([\s\S]*?)<\/title>/i),
    desc: gt(/<meta name="description" content="([^"]*)">/i),
    canonical: gt(/<link rel="canonical" href="([^"]*)">/i),
    ogTitle: gt(/<meta property="og:title" content="([^"]*)">/i),
    ogDesc: gt(/<meta property="og:description" content="([^"]*)">/i),
    ogType: gt(/<meta property="og:type" content="([^"]*)">/i),
    ogUrl: gt(/<meta property="og:url" content="([^"]*)">/i),
    ogImage: gt(/<meta property="og:image" content="([^"]*)">/i),
    jsonld,
  };
}

// Site-wide default social image (1200x630 PNG; SVG is not supported as
// og:image by Facebook/X and most social platforms).
const OG_IMAGE = "https://gender-predictor.com/og-image.png";

// Wrap a page's <main> into the SPA shell structure, add router script + data-page.
export function enhancePage(html, id) {
  let out = html;

  // Inject og:image / twitter:image for pages that miss them.
  const missing = [];
  if (!/property="og:image"/i.test(out)) {
    missing.push(
      '<meta property="og:image" content="' + OG_IMAGE + '">',
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">'
    );
  }
  if (!/name="twitter:image"/i.test(out) && /name="twitter:card"/i.test(out)) {
    missing.push('<meta name="twitter:image" content="' + OG_IMAGE + '">');
  }
  if (missing.length) {
    out = out.replace(/<\/head>/i, "  " + missing.join("\n  ") + "\n</head>");
  }

  out = out.replace(/<body([^>]*)>/i, (full, attrs) => {
    const attr = (attrs || "").includes("data-page") ? attrs : (attrs || "") + ' data-page="' + id + '"';
    return "<body" + attr + ">";
  });

  // Wrap main content for consistency; safe even if no main.
  out = out.replace(/<main([^>]*)>([\s\S]*?)<\/main>/i, (full) => full);

  // Inject router script right before </body>.
  out = out.replace(/<\/body>/i, '<script src="/router.js"></script>\n</body>');

  return out;
}

export async function readPage(relPath, SRC) {
  const full = join(SRC, relPath);
  const html = await readFile(full, "utf8");
  return { html, main: extractMain(html), styles: extractStyles(html), head: extractHead(html) };
}