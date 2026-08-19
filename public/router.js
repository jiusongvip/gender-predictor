(function () {
  "use strict";

  var ORIGIN = location.origin;
  var META_URL = "/_assets/meta.json";
  var FRAG_BASE = "/_assets/frag/";
  var KNOWN = ["index","about","privacy","chinese-gender-chart","baby-gender-prediction-quiz","boy-or-girl-quiz","pregnancy-symptoms-boy-vs-girl","gender-predictor-accuracy","when-to-find-out-gender","nub-theory-boy-vs-girl","ramzi-theory-boy-vs-girl","skull-theory-boy-vs-girl","gender-reveal-party-ideas","baking-soda-gender-test","ring-gender-test","chinese-calendar-vs-ramzi-theory","chinese-calendar-vs-nub-theory","chinese-calendar-vs-old-wives-tales","ramzi-vs-nub-theory","blog","blog/baking-soda-gender-test","blog/gender-predictor-accuracy-research","blog/gender-predictor-methods-compared","blog/gender-reveal-ideas","blog/how-accurate-is-chinese-gender-chart","blog/nub-theory-12-weeks","blog/old-wives-tales-baby-gender","blog/ramzi-theory-ultrasound-guide","blog/ring-test-gender-prediction","blog/skull-theory-gender","blog/when-can-you-tell-baby-gender"];
  var PAGE_ID = document.body.getAttribute("data-page") || "";
  var metaCache = null;
  var routeCache = {};
  var inShell = !!document.getElementById("spa-home");

  function normalize(path) {
    var p = (path || "").split("?")[0].split("#")[0];
    p = p.replace(/\/+$/, "");
    p = p.replace(/^\/+/, "");
    if (p.endsWith(".html")) p = p.slice(0, -5);
    return p || "index";
  }

  function loadMeta() {
    if (metaCache) return Promise.resolve(metaCache);
    return fetch(META_URL)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (d) { metaCache = d; return d; })
      .catch(function () { metaCache = {}; return metaCache; });
  }

  function applyMeta(id) {
    loadMeta().then(function (meta) {
      var m = meta[id];
      if (!m) return;
      if (m.title) document.title = m.title;
      var dm = document.head.querySelector('meta[name="description"]');
      if (dm && m.desc) dm.setAttribute("content", m.desc);
      var cn = document.head.querySelector('link[rel="canonical"]');
      if (cn && m.canonical) cn.setAttribute("href", m.canonical);
      var og = [["og:title", "ogTitle"], ["og:description", "ogDesc"], ["og:url", "ogUrl"]];
      og.forEach(function (pair) {
        var el = document.head.querySelector('meta[property="' + pair[0] + '"]');
        var val = m[pair[1]];
        if (el && val) el.setAttribute("content", val);
      });
      document.head.querySelectorAll('script.router-jsonld').forEach(function (s) { s.remove(); });
      (m.jsonld || []).forEach(function (json) {
        try {
          var s = document.createElement("script");
          s.type = "application/ld+json";
          s.className = "router-jsonld";
          s.textContent = json;
          document.head.appendChild(s);
        } catch (e) {}
      });
    });
  }

  function scrollToId(hash) {
    if (!hash || hash === "#") { window.scrollTo(0, 0); return; }
    var el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo(0, 0);
  }

  function showHome(hash) {
    if (inShell) {
      var home = document.getElementById("spa-home");
      var view = document.getElementById("spa-view");
      home.removeAttribute("hidden");
      if (view) view.setAttribute("hidden", "");
      applyMeta("index");
      scrollToId(hash);
    } else {
      location.href = "/" + (hash || "");
    }
  }

  function injectPage(id, html, hash) {
    if (inShell) {
      var home = document.getElementById("spa-home");
      if (home) home.setAttribute("hidden", "");
      var view = document.getElementById("spa-view");
      var fresh = document.createElement("div");
      fresh.id = "spa-view";
      fresh.innerHTML = html;
      if (view) view.parentNode.replaceChild(fresh, view);
      else document.querySelector("main").appendChild(fresh);
    } else {
      // Standalone complete page: swap <main> contents
      var main = document.querySelector("main");
      if (main) main.innerHTML = html;
      else {
        var m2 = document.createElement("main");
        m2.innerHTML = html;
        document.body.insertBefore(m2, document.body.lastChild);
      }
      document.body.setAttribute("data-page", id);
    }
    scrollToId(hash);
  }

  function render(id, hash) {
    if (id === "index") { showHome(hash); return; }

    if (routeCache[id]) {
      injectPage(id, routeCache[id], hash);
      applyMeta(id);
      return;
    }
    fetch(FRAG_BASE + id + ".html")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        routeCache[id] = html;
        injectPage(id, html, hash);
        applyMeta(id);
      })
      .catch(function () {
        location.href = "/" + id + "/";
      });
  }

  // isPopstate: true when called from popstate — the URL has ALREADY changed,
  // so "same page" cannot be inferred from location.pathname.
  function navigate(item, hash, isPopstate) {
    var id = normalize(item.pathname);

    if (KNOWN.indexOf(id) === -1) {
      location.href = item.pathname + location.search + (hash || "");
      return;
    }

    if (!isPopstate) {
      var cur = normalize(location.pathname);
      if (id === cur) {
        scrollToId(hash);
        return;
      }
    }

    render(id, hash);
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

    var id = normalize(u.pathname);
    var cur = normalize(location.pathname);

    // same-page anchor
    if (id === cur && u.hash) {
      e.preventDefault();
      scrollToId(u.hash);
      return;
    }
    // same-page plain link
    if (id === cur) { e.preventDefault(); return; }

    e.preventDefault();
    navigate(u, u.hash);
    history.pushState({ id: id }, "", u.pathname + u.search + (u.hash || ""));
  });

  window.addEventListener("popstate", function () {
    navigate({ pathname: location.pathname }, location.hash, true);
  });

  // Initial load
  if (inShell && PAGE_ID === "index") {
    // Home shell served; if a deep route came in via JS navigation-reload, honor it
    if (normalize(location.pathname) !== "index") {
      navigate({ pathname: location.pathname }, location.hash, true);
    } else if (location.hash) {
      scrollToId(location.hash);
    }
  } else if (!inShell) {
    // Complete page served directly (SEO deep link) — nothing to re-render
    if (location.hash) scrollToId(location.hash);
  }
})();