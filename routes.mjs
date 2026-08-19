// Shared route registry: route id (as used by router.js / fragments / meta)
// -> src/pages relative html file.
export const ROUTES = {
  "index": "index.html",
  "about": "about.html",
  "privacy": "privacy.html",
  "chinese-gender-chart": "chinese-gender-chart.html",
  "baby-gender-prediction-quiz": "baby-gender-prediction-quiz.html",
  "boy-or-girl-quiz": "boy-or-girl-quiz.html",
  "pregnancy-symptoms-boy-vs-girl": "pregnancy-symptoms-boy-vs-girl.html",
  "gender-predictor-accuracy": "gender-predictor-accuracy.html",
  "when-to-find-out-gender": "when-to-find-out-gender.html",
  "nub-theory-boy-vs-girl": "nub-theory-boy-vs-girl.html",
  "ramzi-theory-boy-vs-girl": "ramzi-theory-boy-vs-girl.html",
  "skull-theory-boy-vs-girl": "skull-theory-boy-vs-girl.html",
  "gender-reveal-party-ideas": "gender-reveal-party-ideas.html",
  "baking-soda-gender-test": "baking-soda-gender-test.html",
  "ring-gender-test": "ring-gender-test.html",
  "chinese-calendar-vs-ramzi-theory": "chinese-calendar-vs-ramzi-theory.html",
  "chinese-calendar-vs-nub-theory": "chinese-calendar-vs-nub-theory.html",
  "chinese-calendar-vs-old-wives-tales": "chinese-calendar-vs-old-wives-tales.html",
  "ramzi-vs-nub-theory": "ramzi-vs-nub-theory.html",
  "blog": "blog/index.html",
  "blog/baking-soda-gender-test": "blog/baking-soda-gender-test.html",
  "blog/gender-predictor-accuracy-research": "blog/gender-predictor-accuracy-research.html",
  "blog/gender-predictor-methods-compared": "blog/gender-predictor-methods-compared.html",
  "blog/gender-reveal-ideas": "blog/gender-reveal-ideas.html",
  "blog/how-accurate-is-chinese-gender-chart": "blog/how-accurate-is-chinese-gender-chart.html",
  "blog/nub-theory-12-weeks": "blog/nub-theory-12-weeks.html",
  "blog/old-wives-tales-baby-gender": "blog/old-wives-tales-baby-gender.html",
  "blog/ramzi-theory-ultrasound-guide": "blog/ramzi-theory-ultrasound-guide.html",
  "blog/ring-test-gender-prediction": "blog/ring-test-gender-prediction.html",
  "blog/skull-theory-gender": "blog/skull-theory-gender.html",
  "blog/when-can-you-tell-baby-gender": "blog/when-can-you-tell-baby-gender.html",
};

// Browser pathname ("/", "/about/", "/blog/x/") -> route id ("index", "about", "blog/x")
export function pathToId(pathname) {
  const p = pathname.replace(/^\/+/, "").replace(/\/+$/, "").replace(/\.html$/, "");
  return p || "index";
}

// Route id -> URL path ("index" -> "/", "about" -> "/about/", "blog/x" -> "/blog/x/")
export function idToPath(id) {
  if (id === "index") return "/";
  return "/" + id.replace(/^\/+/, "").replace(/\/+$/, "") + "/";
}