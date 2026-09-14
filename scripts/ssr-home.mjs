// Build-time server-side rendering of the homepage's JS-only content blocks.
// The homepage renders its methods grid, lunar calendar table, FAQ list and
// quiz from JS arrays on load, so a no-JS/AI crawler sees empty divs. Here we
// extract those SAME arrays from the page's own inline script (single source of
// truth — no duplicated data) and inject equivalent static HTML into the
// containers. Real browsers still run the inline JS afterwards (identical or
// interactive), but the server HTML now contains the content.

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Grab a `var NAME = [ ... ];` (or the methods array) and evaluate it in a
// sandbox that provides a stubbed `results` object where needed.
function extractArray(html, decl) {
  const start = html.indexOf(decl);
  if (start === -1) return null;
  const open = html.indexOf("[", start);
  // naive bracket matcher (arrays here contain only strings/objects/numbers,
  // no stray unescaped brackets)
  let depth = 0, i = open;
  for (; i < html.length; i++) {
    if (html[i] === "[") depth++;
    else if (html[i] === "]") { depth--; if (depth === 0) break; }
  }
  const literal = html.slice(open, i + 1);
  try { return new Function("var results={};return (" + literal + ");")(); }
  catch (e) { console.error("SSR extract failed for", decl, e.message); return null; }
}

function buildMethodsHtml(methods) {
  // mirror the runtime .method-card markup (no result span when result falsy)
  return methods.map(function (m) {
    return '<div class="method-card"><div class="method-icon">' + esc(m.icon) + '</div>'
      + '<div class="method-name">' + esc(m.name) + '</div>'
      + '<div class="method-subtitle">' + esc(m.desc) + '</div>'
      + '<a href="' + m.link + '" class="method-link">Learn more</a></div>';
  }).join("");
}

function buildCalendarHtml(data) {
  var h = '<table class="calendar-table"><thead><tr><th>Age</th>';
  for (var m = 1; m <= 12; m++) h += "<th>" + m + "</th>";
  h += "</tr></thead><tbody>";
  for (var age = 18; age <= 45; age++) {
    h += '<tr><td style="font-weight:600;background:var(--accent-subtle);color:var(--accent);">' + age + "</td>";
    var row = data[age - 18] || "";
    for (var c = 0; c < 12; c++) {
      var ch = row[c] || "?";
      h += '<td class="' + ch.toLowerCase() + '" data-age="' + age + '" data-month="' + (c + 1) + '">' + (ch === "B" ? "Boy" : ch === "G" ? "Girl" : "?") + "</td>";
    }
    h += "</tr>";
  }
  h += "</tbody></table>";
  return h;
}

function buildFaqHtml(items) {
  return items.map(function (it) {
    return '<div class="faq-item"><h3 class="faq-q">' + esc(it.q) + '</h3><div class="faq-a">' + esc(it.a) + "</div></div>";
  }).join("\n");
}

function buildQuizHtml(qs) {
  // Crawlable static list of every question + options.
  var h = '<ol class="quiz-static" style="margin:0 0 0 20px;color:var(--text-muted);">';
  qs.forEach(function (q, i) {
    h += "<li style=\"margin-bottom:8px;\">" + esc(q.q) + ' <span style="color:var(--text-subtle);">(' + q.opts.map(esc).join(" / ") + ")</span></li>";
  });
  return h + "</ol>";
}

function injectOnce(html, id, content) {
  const marker = 'id="' + id + '"></div>';
  const idx = html.indexOf(marker);
  if (idx === -1) return { html, ok: false };
  const start = html.lastIndexOf("<div", idx);
  const endTagEnd = idx + marker.length; // just past the closing </div>
  // opening tag = from <div up to and including the id="..." attribute
  const openTag = html.slice(start, idx + ('id="' + id + '"').length);
  const out = html.slice(0, start) + openTag + ">" + content + "</div>" + html.slice(endTagEnd);
  return { html: out, ok: true };
}

export function serverRenderHome(html) {
  // methods array is nested inside renderMethods; extract specifically:
  const mStart = html.indexOf("function renderMethods");
  let methodsArr = null;
  if (mStart !== -1) {
    const arrOpen = html.indexOf("var methods = [", mStart);
    if (arrOpen !== -1) {
      const open = html.indexOf("[", arrOpen);
      let depth = 0, i = open;
      for (; i < html.length; i++) { if (html[i] === "[") depth++; else if (html[i] === "]") { depth--; if (!depth) break; } }
      const literal = html.slice(open, i + 1);
      try { methodsArr = new Function("var results={};return (" + literal + ");")(); } catch (e) { console.error("methods eval", e.message); }
    }
  }
  const cal = extractArray(html, "var CALENDAR_DATA");
  const faq = extractArray(html, "var FAQ_ITEMS");
  const quiz = extractArray(html, "var QUIZ_QUESTIONS");

  const jobs = [
    methodsArr ? ["methods-grid", buildMethodsHtml(methodsArr)] : null,
    cal ? ["calendar-wrap", buildCalendarHtml(cal)] : null,
    faq ? ["faq-list", buildFaqHtml(faq)] : null,
    quiz ? ["quiz-container", buildQuizHtml(quiz)] : null,
  ].filter(Boolean);

  let out = html;
  for (const [id, content] of jobs) {
    const r = injectOnce(out, id, content);
    out = r.html;
    if (!r.ok) console.warn("SSR: container not found:", id);
  }
  console.log("  SSR home: injected", jobs.map(j=>j[0]).join(", "));
  return out;
}
