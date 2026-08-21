// 一次性工具：在所有 src/pages/*.html 的 <head> 后插入 GA4 代码（幂等，已含 G-K9MMFBD8HR 则跳过）
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const GA_ID = "G-K9MMFBD8HR";
const GA = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_ID}');
</script>`;

const pagesDir = join(process.cwd(), "src", "pages");
const files = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) files.push(p);
  }
};
walk(pagesDir);

let added = 0, skipped = 0;
for (const f of files) {
  let c = readFileSync(f, "utf8");
  if (c.includes(GA_ID)) { skipped++; continue; }
  if (!c.includes("<head>")) { console.log("SKIP (no <head>): " + f); continue; }
  c = c.replace("<head>", "<head>\n" + GA);
  writeFileSync(f, c);
  added++;
  console.log("✓ " + f);
}
console.log(`added=${added} skipped=${skipped}`);
