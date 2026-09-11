import { readFileSync, writeFileSync } from "node:fs";

// 1) index.html: promote the 6 static reveal card <h4> to <h3> (identical
//    rendering because they carry full inline styles; keeps h1 > h2 > h3 order).
{
  const p = "src/pages/index.html";
  let h = readFileSync(p, "utf8");
  h = h.replace(
    /<h4 (style="font-family:'Outfit',system-ui,sans-serif;font-size:\.9375rem;font-weight:600;margin-bottom:4px;">)([^<]+)<\/h4>/g,
    "<h3 $1$2</h3>"
  );
  writeFileSync(p, h);
  console.log("index.html reveal h4->h3 done");
}

// 2) comparison pages: scorecard card labels are h3 directly under the h1
//    (level jump). Promote to h2 and re-point the .scorecard .side h3 CSS rule.
const cmpFiles = [
  "src/pages/chinese-calendar-vs-ramzi-theory.html",
  "src/pages/chinese-calendar-vs-nub-theory.html",
  "src/pages/chinese-calendar-vs-old-wives-tales.html",
  "src/pages/ramzi-vs-nub-theory.html",
];
const labels = ["Chinese Calendar", "Ramzi Theory", "Nub Theory", "Old Wives' Tales"];
for (const p of cmpFiles) {
  let h = readFileSync(p, "utf8");
  h = h.replace(/\.scorecard \.side h3\b/g, ".scorecard .side h2");
  for (const l of labels) {
    h = h.replace("<h3>" + l + "</h3>", "<h2>" + l + "</h2>");
  }
  writeFileSync(p, h);
  console.log("comparison fixed:", p);
}

// 3) blog/index.html: h1 -> h3 jump on "Explore Our Guides". Promote to h2 with
//    a compact style class so it stays a small section label visually.
{
  const p = "src/pages/blog/index.html";
  let h = readFileSync(p, "utf8");
  h = h.replace(
    ".post-card h2 {",
    ".explore-heading { font-size:1.0625rem; font-weight:700; color:var(--text); margin:28px 0 16px; }\n  .post-card h2 {"
  );
  h = h.replace("<h3>Explore Our Guides</h3>", '<h2 class="explore-heading">Explore Our Guides</h2>');
  writeFileSync(p, h);
  console.log("blog/index explore h3->h2 done");
}
