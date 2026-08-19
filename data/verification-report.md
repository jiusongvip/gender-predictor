# SEO Verification Report: Gender Predictor

- Domain: genderpredictor.tools
- Local preview: http://localhost:3000
- Pages audited: 31 (19 main + 12 blog)
- Date: 2026-08-19
- Audited via seo-site-verifier (technical / schema / content / page phases)

## Summary

| Check | Status | Issues |
|-------|--------|--------|
| Technical SEO | ✅ | 0 critical, 2 warnings |
| Schema Markup | ✅ | 0 critical, 0 warnings (16 fixed) |
| Content Quality | ⚠️ | 0 critical, 3 warnings |
| Page-level | ✅ | 0 critical, 2 warnings |

## Score: 89/100

## Must Fix (Launch Blockers)

None. Site is launch-ready.

## Fixed During This Audit

| Issue | Detail |
|-------|--------|
| Article schema missing `publisher` | 15 Article JSON-LD blocks (11 blog + 4 comparison) now include publisher Organization + logo |
| WebApplication missing `url` | Added `https://genderpredictor.tools/` to homepage WebApplication schema |
| Schema `description` copy-paste mismatch | 3 articles (skull-theory-gender, gender-reveal-ideas, ring-test-gender-prediction) had baking-soda-test descriptions in JSON-LD; rewritten to match each article |
| Missing `twitter:card` | Added `summary_large_image` to /about/, /privacy/, /blog/ |
| Homepage meta description 171 chars | Trimmed to 160 chars |

## Should Fix (Before Next Sprint)

1. **No external citations / backlink-worthy sources** — 0 external links across all 31 pages. Adding 2-4 authoritative medical citations (NHS, PubMed, ACOG) on the accuracy pages strengthens E-E-A-T Authoritativeness. Pages affected: gender-predictor-accuracy, blog/how-accurate-is-chinese-gender-chart, blog/gender-predictor-accuracy-research, blog/gender-predictor-methods-compared. Use `content-writer` skill.
2. **Over-60-char titles on 8 pages** — boy-or-girl-quiz (65), chinese-calendar-vs-ramzi-theory (64), ramzi-vs-nub-theory (61), blog/baking-soda-gender-test (64), blog/gender-predictor-accuracy-research (65), blog/how-accurate-is-chinese-gender-chart (62), blog/ramzi-theory-ultrasound-guide (63), blog/ring-test-gender-prediction (64). Google truncates ~60; pages already ranking retain their titles to avoid churn. Trim only if those pages require refresh.
3. **Blog word counts 457-790** — below the 1500-word blog floor. Not a ranking factor, but topical depth for 4 thin posts (ring-test, skull-theory, baking-soda) could be expanded. Existing pages have structure + FAQ; deprioritize.

## Nice to Have

1. **IndexNow protocol** — submit public/indexnow.txt + key to Bing/Yandex for faster non-Google indexing. Low effort, marginal for this niche.
2. **AI crawler directives in robots.txt** — consider explicit GPTBot/ClaudeBot/Bytespider policies. Current `User-agent: * Allow: /` treats all crawlers equally, which is fine for an AI-citation-friendly site. No change recommended unless blocking training is desired.
3. **Schema images on Article pages** — Article lacks `image` property; adding og-image.svg reference gives richer card display.
4. **Pillars have no images** — tool/informational pages (chinese-gender-chart, quizzes) are text-only. Two method-comparison images already exist as .webp; reuse pattern where useful.

## Phase Details

### Technical (Score 92)
- robots.txt: exists, allows all, references sitemap ✅
- sitemap.xml: 31 URLs, no duplicates, all resolve 200 ✅
- Canonical: self-referencing on all 31 pages ✅
- Titles: unique across site; 8 exceed 60 chars (warning) ⚠️
- Meta descriptions: unique, 134-160 chars ✅
- H1: exactly one per page ✅
- Heading hierarchy: no skipped levels (H2→H3 used) ✅
- HTTPS / security headers: enforced via Cloudflare _headers in production (CSP, HSTS, XFO, nosniff) ✅
- Mobile: viewport meta present, inline CSS, no render-blocking external CSS ✅
- JS rendering: full HTML served for every URL (SEO deep-link safe); SPA fragments only add `<main>` content client-side; canonical/meta/schema in initial HTML ✅
- IndexNow: not implemented ⚠️
- Core Web Vitals: no lab data on localhost; site is lightweight (no external JS, inline CSS, WebP images) — low LCP/INP risk

### Schema (Score 96)
- Organization, WebSite, BreadcrumbList on all pages ✅
- WebApplication on home ✅
- FAQPage with 8 questions on home ✅ (kept as AI-citation signal; FAQ rich results retired May 2026)
- Article on 15 pages with headline/description/datePublished/author/publisher ✅
- 61 JSON-LD blocks, 0 parse errors, 0 missing required fields ✅

### Content (Score 82)
- E-E-A-T: author team attribution + about page link + publication dates ✅; no external citations ⚠️
- Homepage 1410 words ≥ 500 floor ✅
- Blog floors: 6 posts ≥ 644 words vs 1500 ideal ⚠️ (topical coverage adequate, word count not a factor)
- Internal linking: 29 distinct internal hrefs, all valid (0 broken); home 14 links ✅
- No orphan pages — every page reachable via nav/sitemap ✅
- No duplicate body content ✅ (schema desc mismatch fixed)

### Page-level (Score 90)
- Home: title 59, desc 160, H1, WebApp+FAQ+Org+Breadcrumb schema ✅
- Pillar /chinese-gender-chart/: title 50, desc 142, WebPage+Breadcrumb schema ✅
- Representative /blog/nub-theory-12-weeks/: title 52, desc 153, Article schema + date + author + publisher ✅
- All sampled pages: og:title/og:url/canonical present ✅

## CLI Check Notes
- SPA router re-verified after schema edits: home shell, fragment serving, meta.json (31 keys), deep-link pages, robots all 200 ✅
- Fragment/full-page `<main>` consistency: 7 sampled routes byte-identical, 0 regressions ✅