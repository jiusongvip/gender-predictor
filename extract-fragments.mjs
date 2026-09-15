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
const OG_IMAGE = "https://www.gender-predictor.com/og-image.png";

// Keep gtag.js (172 KB, 106-286 ms of main thread) out of the load window: it
// starts on the first real interaction, or once the page has been idle for a
// while after load, whichever comes first. The dataLayer + config still queue
// immediately, so engaged sessions all report; only drive-bys that never touch
// the page and leave inside the idle window are lost.
// The preconnect pays back the TLS round trip that the delayed start costs.
export function deferGtag(html) {
  const idm = html.match(/gtag\/js\?id=([A-Z0-9-]+)/i);
  if (!idm) return html;
  const id = idm[1];
  let out = html.replace(
    /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[A-Z0-9-]+"><\/script>\s*/i,
    ""
  );
  if (!/rel="preconnect" href="https:\/\/www\.googletagmanager\.com"/i.test(out)) {
    out = out.replace(/<\/head>/i, '  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>\n</head>');
  }
  const boot =
    "function __gpLoadGA(){if(window.__gpGA)return;window.__gpGA=1;" +
    "var s=document.createElement('script');s.async=true;" +
    "s.src='https://www.googletagmanager.com/gtag/js?id=" + id + "';document.head.appendChild(s);}" +
    "['pointerdown','keydown','wheel','touchstart','scroll'].forEach(function(e){" +
    "window.addEventListener(e,__gpLoadGA,{once:true,passive:true});});" +
    "window.addEventListener('load',function(){" +
    "if(window.requestIdleCallback)requestIdleCallback(__gpLoadGA,{timeout:8000});else setTimeout(__gpLoadGA,8000);});";
  out = out.replace(/(gtag\('config',\s*'[A-Z0-9-]+'\);)/i, "$1\n  " + boot);
  return out;
}

// Wrap a page's <main> into the SPA shell structure, add router script + data-page.
export function enhancePage(html, id) {
  let out = deferGtag(html);

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

  // Brand consistency: every page gets the same og:site_name.
  if (!/property="og:site_name"/i.test(out)) {
    out = out.replace(/<\/head>/i, '  <meta property="og:site_name" content="Gender Predictor">\n</head>');
  }

  out = out.replace(/<body([^>]*)>/i, (full, attrs) => {
    const attr = (attrs || "").includes("data-page") ? attrs : (attrs || "") + ' data-page="' + id + '"';
    return "<body" + attr + ">";
  });

  // Wrap main content for consistency; safe even if no main.
  out = out.replace(/<main([^>]*)>([\s\S]*?)<\/main>/i, (full) => full);

  // Unified trust links (About / Contact / Privacy / Terms) in every footer,
  // skipping any that page already links. Required for E-E-A-T / AI crawlers.
  const trust = [["/about/", "About"], ["/contact/", "Contact"], ["/privacy/", "Privacy"], ["/terms/", "Terms"]]
    .filter(([h]) => !out.includes('href="' + h + '"'));
  if (trust.length) {
    const row = '\n    <div style="width:100%;text-align:center;font-size:.8125rem;">' +
      trust.map(([h, t]) => '<a href="' + h + '" style="color:var(--accent,#6b5a8a);text-decoration:none;">' + t + '</a>').join('<span style="margin:0 10px;color:var(--border,#e8e5ec);">&middot;</span>') +
      "</div>";
    out = out.replace(/<\/footer>/i, row + "\n  </footer>");
  }

  // Inject router script right before </body> (deferred: never blocks parsing).
  out = out.replace(/<\/body>/i, '<script src="/router.js" defer></script>\n</body>');

  return out;
}

export async function readPage(relPath, SRC) {
  const full = join(SRC, relPath);
  const html = await readFile(full, "utf8");
  return { html, main: extractMain(html), styles: extractStyles(html), head: extractHead(html) };
}