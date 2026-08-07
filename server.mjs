import { createServer } from "node:http";
import { createGzip } from "node:zlib";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";

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

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<h1>404 Not Found</h1>");
}

const server = createServer(async (req, res) => {
  let urlPath = req.url.split("?")[0];

  // Static files from public/
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

  // HTML pages from src/pages/
  if (urlPath === "/") urlPath = "/index.html";

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
  console.log("  Gender Predictor running at http://localhost:" + PORT);
});
