import { readFileSync, writeFileSync } from "node:fs";
const p = "src/pages/index.html";
let h = readFileSync(p, "utf8");
const before = (h.match(/href="#sec-[a-z0-9-]+"/g) || []).length;
// Nav dropdown tools/methods/compare: #sec-<slug> -> real /<slug>/ (standalone pages).
h = h.replace(/href="#sec-([a-z0-9-]+)"/g, 'href="/$1/"');
const after = (h.match(/href="#sec-[a-z0-9-]+"/g) || []).length;
writeFileSync(p, h);
console.log("converted", before, "->", after, "remaining #sec- links");
