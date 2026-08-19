import { createServer } from "node:http";
import { createGzip } from "node:zlib";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { extractMain, extractHead, enhancePage } from "./extract-fragments.mjs";
import { ROUTES } from "./routes.mjs";

const CACHE_CONTROL_HTML = "no-store, no-cache, must-revalidate, max-age=0";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC = join(ROOT, "public");
const SRC = join(ROOT, "src", "pages");
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

// Route id (e.g. "about", "blog/baking-soda-gender-test") -> source html rel path
// Maps browser pathname ("/", "/about/", "/blog/x/") -> route id
async function readPage(id) {
  const rel = ROUTES[id];
  if (!rel) return null;
  return await readFile(join(SRC, rel), "utf8");
}

async function sendFile(req, res, filePath) {
  try {
    const content = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
    if (ext === ".html") headers["Cache-Control"] = CACHE_CONTROL_HTML;

    const acceptEncoding = req.headers["accept-encoding"] || "";
    const compressible = /\.(?:html|css|js|mjs|json|svg|txt|xml)$/.test(ext);
    if (acceptEncoding.includes("gzip") && compressible) {
      headers["Content-Encoding"] = "gzip";
      res.writeHead(200, headers);
      const gzip = createGzip();
      Readable.from(content).pipe(gzip).pipe(res);
    } else {
      res.writeHead(200, headers);
      res.end(content);
    }
    return true;
  } catch { return false; }
}

function sendRaw(res, content, type = "text/html; charset=utf-8", cache = false) {
  const headers = { "Content-Type": type };
  headers["Cache-Control"] = cache ? "public, max-age=300" : CACHE_CONTROL_HTML;
  res.writeHead(200, headers);
  res.end(content);
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<h1>404 Not Found</h1>");
}

async function buildMeta() {
  const meta = {};
  for (const id of Object.keys(ROUTES)) {
    const html = await readPage(id);
    if (html) meta[id] = extractHead(html);
  }
  return meta;
}

async function serveEnhancedPage(req, res, id) {
  const html = await readPage(id);
  if (!html) return false;
  if (id === "index") {
    sendRaw(res, html);
    return true;
  }
  sendRaw(res, enhancePage(html, id));
  return true;
}

const server = createServer(async (req, res) => {
  let urlPath = req.url.split("?")[0];

  // ── SPA fragments ──
  if (urlPath.startsWith("/_assets/frag/")) {
    const id = decodeURIComponent(urlPath.slice("/_assets/frag/".length)).replace(/\.html$/, "");
    if (!ROUTES[id]) return notFound(res);
    const html = await readPage(id);
    sendRaw(res, extractMain(html), "text/html; charset=utf-8", true);
    return;
  }

  // ── SPA meta.json ──
  if (urlPath === "/_assets/meta.json") {
    sendRaw(res, JSON.stringify(await buildMeta()), "application/json; charset=utf-8", true);
    return;
  }

  // ── router.js from public ──
  if (urlPath === "/router.js") {
    if (await sendFile(req, res, join(PUBLIC, "router.js"))) return;
    return notFound(res);
  }

  // Static files from public/
  if (urlPath === "/robots.txt" || urlPath === "/llms.txt" || urlPath === "/og-image.svg" ||
      urlPath === "/sitemap.xml" || urlPath === "/favicon.ico") {
    const fp = join(PUBLIC, urlPath.slice(1));
    const fp2 = urlPath === "/sitemap.xml" ? join(ROOT, "sitemap.xml") : null;
    if (await sendFile(req, res, fp)) return;
    if (fp2 && await sendFile(req, res, fp2)) return;
    return notFound(res);
  }
  if (urlPath.startsWith("/images/") || urlPath.startsWith("/fonts/")) {
    const fp = join(PUBLIC, urlPath);
    if (await sendFile(req, res, fp)) return;
    return notFound(res);
  }

  // Cloudflare Pages config files
  if (urlPath === "/_headers" || urlPath === "/_redirects") {
    const fp = join(PUBLIC, urlPath);
    if (await sendFile(req, res, fp)) return;
  }

  // ── Regular pages (SEO deep links): return enhanced full HTML ──
  if (urlPath === "/") urlPath = "/index.html";
  const pathId = (urlPath.split("?")[0].replace(/^\/+|\/+$/g, "").replace(/\.html$/, "")) || "index";
  // map enhanced page for any known route
  if (urlPath === "/index.html") { sendRaw(res, await readPage("index")); return; }
  if (ROUTES[pathId]) {
    if (await serveEnhancedPage(req, res, pathId)) return;
  }

  if (urlPath.endsWith("/")) {
    const dir = join(SRC, urlPath);
    if (await sendFile(req, res, join(dir, "index.html"))) return;
    const flat = join(SRC, urlPath.slice(0, -1) + ".html");
    if (await sendFile(req, res, flat)) return;
    return notFound(res);
  }

  const fp = join(SRC, urlPath);
  if (await sendFile(req, res, fp)) return;
  if (!extname(fp) && await sendFile(req, res, fp + ".html")) return;
  notFound(res);
});

server.listen(PORT, () => {
  console.log("  Gender Predictor (SPA) running at http://localhost:" + PORT);
});