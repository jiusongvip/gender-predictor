(function () {
  "use strict";

  var ORIGIN = location.origin;
  // All content lives on the single merged page. This router only handles
  // anchor-scroll navigation for internal links; it never loads new pages.
  var PAGE_ID = document.body.getAttribute("data-page") || "";
  var inShell = !!document.getElementById("spa-home");

  function scrollToId(hash) {
    if (!hash || hash === "#") { window.scrollTo(0, 0); return; }
    var el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href) return;
    if (a.hasAttribute("download")) return;
    if (a.target && a.target !== "_self" && a.target !== "") return;
    if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return;
    if (/\.(png|jpe?g|gif|webp|svg|pdf|zip|css|js|ico|woff2?)$/i.test(href)) return;

    var u;
    try { u = new URL(href, location.href); } catch (err) { return; }
    if (u.origin !== ORIGIN) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // In-page anchor link on the merged page
    if (href.indexOf("#") === 0) {
      e.preventDefault();
      scrollToId(href);
      return;
    }

    // Any internal link that looks like a former route path (e.g. /about/).
    // On the merged page these were rewritten to #sec-<id>, but if we end up
    // on a standalone full page (SEO deep link) or an un-rewritten link slips
    // through, fall back to a normal full-page visit.
    if (u.pathname && u.pathname !== "/") {
      // If this page is the merged shell, try to map to an anchor section.
      if (inShell) {
        var path = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.html$/, "");
        var sec = document.getElementById("sec-" + path.replace(/\//g, "-"));
        if (sec) {
          e.preventDefault();
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      // Standalone page: let the normal navigation happen (no preventDefault).
      return;
    }

    // Same-page plain link (e.g. href="/" on the shell) — nothing to do.
    if (u.pathname === "/" && !u.hash) { e.preventDefault(); }
  });

  // Initial load: honor a hash deep link on the merged page.
  if (location.hash) scrollToId(location.hash);
})();