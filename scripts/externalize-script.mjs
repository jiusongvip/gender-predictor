// Build-time extraction of the homepage's 46 KB inline app script.
//
// The homepage markup + inlined CSS already paint the hero; the giant inline
// <script> sat at the end of <body> and forced the parser to stop, compile and
// execute ~46 KB before the document was "done", which is what Lighthouse
// blamed for the 1.4-2.4 s LCP element-render delay on simulated mobile.
// Moving it to /assets/home.js + defer lets the browser paint the parsed
// document while the script downloads in parallel and runs after parsing.
import { createHash } from "node:crypto";

const MIN_BYTES = 8000;

// Returns { html, file: { name, code } | null }
export function externalizeAppScript(html, id) {
  let best = null;
  const re = /<script>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const code = m[1];
    if (/<\/script/.test(code)) continue; // can't safely move out
    if (code.length < MIN_BYTES) continue;
    if (!best || code.length > best.code.length) best = { code, start: m.index, end: m.index + m[0].length };
  }
  if (!best) return { html, file: null };

  const hash = createHash("sha256").update(best.code).digest("hex").slice(0, 8);
  const name = `${id}.${hash}.js`;
  const tag = `<script src="/assets/${name}" defer></script>`;
  let out = html.slice(0, best.start) + tag + html.slice(best.end);
  // Discover the file while the head is still being parsed (defer alone would
  // only find it at the end of <body>).
  out = out.replace(/<\/head>/i, `  <link rel="preload" as="script" href="/assets/${name}">\n</head>`);
  return { html: out, file: { name, code: best.code } };
}
