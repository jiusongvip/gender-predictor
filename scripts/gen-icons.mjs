// Deterministic brand icon generator: writes favicon.svg, favicon.ico,
// apple-touch-icon.png and icon-192/512.png + site.webmanifest into public/.
// No native image deps — PNG/ICO containers are encoded here with zlib only.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PUB = join(fileURLToPath(new URL("../", import.meta.url)), "public");

const ACCENT = [107, 90, 138];
const ACCENT_DARK = [74, 60, 100];
const BOY = [73, 116, 168];
const GIRL = [206, 130, 145];
const WHITE = [255, 255, 255];

// Rounded-square badge with a split circle (boy | girl) — legible at 16px.
function draw(size) {
  const px = Buffer.alloc(size * size * 4);
  const r = size * 0.3;
  const cx = size / 2;
  const cy = size / 2;
  const corner = size * 0.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let [R, G, B] = [0, 0, 0];
      const t = (x + y) / (2 * size);
      R = ACCENT[0] + (ACCENT_DARK[0] - ACCENT[0]) * t;
      G = ACCENT[1] + (ACCENT_DARK[1] - ACCENT[1]) * t;
      B = ACCENT[2] + (ACCENT_DARK[2] - ACCENT[2]) * t;

      const rr = corner + 0.5;
      const inX = x >= rr && x <= size - rr ? 1 : 0;
      const inY = y >= rr && y <= size - rr ? 1 : 0;
      const dx = Math.max(rr - x, x - (size - rr), 0);
      const dy = Math.max(rr - y, y - (size - rr), 0);
      const inCornerDisc = Math.hypot(dx, dy) <= rr;
      const inside = inX || inY ? 1 : inCornerDisc ? 1 : 0;

      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      const ringOuter = r + size * 0.035;
      let a = 0;
      if (inside) {
        if (d <= ringOuter) {
          const half = Math.abs(x + 0.5 - cx) < size * 0.012 && d <= r;
          const col = d > r ? WHITE : half ? WHITE : x + 0.5 < cx ? BOY : GIRL;
          [R, G, B] = col;
        }
        a = 255;
      }
      const i = (y * size + x) * 4;
      px[i] = Math.round(R); px[i + 1] = Math.round(G); px[i + 2] = Math.round(B); px[i + 3] = a;
    }
  }
  return px;
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
function encodeICO(sizes) {
  const pngs = sizes.map((s) => ({ s, png: encodePNG(s, draw(s)) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ s, png }) => {
    const e = Buffer.alloc(16);
    e[0] = s >= 256 ? 0 : s; e[1] = s >= 256 ? 0 : s;
    e.writeUInt16LE(1, 2); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.png)]);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Gender Predictor">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b5a8a"/><stop offset="1" stop-color="#4a3c64"/></linearGradient></defs>
<rect width="64" height="64" rx="13" fill="url(#g)"/>
<circle cx="32" cy="32" r="19" fill="none" stroke="#ffffff" stroke-width="3"/>
<path d="M32 13a19 19 0 0 0 0 38z" fill="#4974a8"/>
<path d="M32 13a19 19 0 0 1 0 38z" fill="#ce8291"/>
</svg>
`;

writeFileSync(join(PUB, "favicon.svg"), svg);
writeFileSync(join(PUB, "favicon.ico"), encodeICO([16, 24, 32, 48]));
writeFileSync(join(PUB, "apple-touch-icon.png"), encodePNG(180, draw(180)));
writeFileSync(join(PUB, "icon-192.png"), encodePNG(192, draw(192)));
writeFileSync(join(PUB, "icon-512.png"), encodePNG(512, draw(512)));
writeFileSync(
  join(PUB, "site.webmanifest"),
  JSON.stringify(
    {
      name: "Gender Predictor",
      short_name: "Gender Predictor",
      display: "standalone",
      background_color: "#faf9f7",
      theme_color: "#6b5a8a",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2
  ) + "\n"
);
console.log("icons written to", PUB);
