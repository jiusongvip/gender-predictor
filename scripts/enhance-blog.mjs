import { readFileSync, writeFileSync } from "node:fs";

// Per-article FAQ (3 concise Q&A each) + a verified, live source link.
const DATA = {
  "nub-theory-12-weeks": { src:["Sex determination","https://en.wikipedia.org/wiki/Sex_determination"], faq:[
    ["How accurate is the nub theory at 12 weeks?","Roughly 70 to 90 percent on a clear midsagittal image, and it is easier to call girls correctly. It is a strong early guess, not a confirmation."],
    ["What angle means a boy in nub theory?","A genital tubercle angled 30 degrees or more off the spine suggests a boy; flatter than about 10 degrees suggests a girl."],
    ["When is nub theory confirmed for sure?","Only NIPT from about 10 weeks or the 18 to 20 week anatomy scan are reliable."]]},
  "ramzi-theory-ultrasound-guide": { src:["Noninvasive prenatal testing","https://en.wikipedia.org/wiki/Noninvasive_prenatal_testing"], faq:[
    ["Is the Ramzi theory peer-reviewed?","No. The placenta-side claim was never validated by independent peer-reviewed studies and is not accepted by mainstream obstetrics."],
    ["How early does Ramzi claim to work?","Six to eight weeks, from the side of the uterus the placenta attaches to — but this is about chance, and scan images are often mirrored."],
    ["What is the earliest reliable test instead?","A cell-free DNA NIPT blood test from around 10 weeks reports sex with better than 99 percent accuracy where disclosure is legal."]]},
  "skull-theory-gender": { src:["Sex determination","https://en.wikipedia.org/wiki/Sex_determination"], faq:[
    ["Does skull theory work?","There is no evidence it does. Real differences between male and female skulls appear around puberty, not in the womb."],
    ["What does skull theory claim?","That a rounder fetal head suggests a girl and a longer, squarer head with a stronger brow suggests a boy."],
    ["Is skull theory as good as nub theory?","No. Nub theory at least reads a structure that differs by sex; skull shape does not, so it performs at chance."]]},
  "baking-soda-gender-test": { src:["Urine","https://en.wikipedia.org/wiki/Urine"], faq:[
    ["Does baking soda actually tell the sex?","No. The fizz is baking soda reacting with the acid in your urine, which reflects diet and hydration, not the baby's chromosomes."],
    ["What does fizzing mean in the test?","Folklore reads fizz as a boy and no reaction as a girl, but it is accurate only about half the time."],
    ["Is the test safe?","Yes — it uses only urine and baking soda in a cup, with nothing touching your body."]]},
  "ring-test-gender-prediction": { src:["Ideomotor effect","https://en.wikipedia.org/wiki/Ideomotor_effect"], faq:[
    ["Why does the ring move?","Tiny unconscious movements of your hand (the ideomotor effect) swing the ring — not the baby."],
    ["What do the directions mean?","Tradition reads a circular swing as a girl and a back-and-forth swing as a boy, though the variants disagree."],
    ["Is the ring test accurate?","About 50 percent, the same as a coin flip, because the swing comes from the holder."]]},
  "how-accurate-is-chinese-gender-chart": { src:["Chinese calendar","https://en.wikipedia.org/wiki/Chinese_calendar"], faq:[
    ["Is the Chinese gender chart accurate?","About 50 percent. Its 70 to 90 percent claims are not supported by peer-reviewed evidence."],
    ["Why is it still so popular?","It is centuries old, free, and a fun ritual — but biologically it is a coin flip."],
    ["What actually determines a baby's sex?","Whether the sperm that fertilises the egg carries an X or a Y chromosome, set at conception."]]},
  "old-wives-tales-baby-gender": { src:["Old wives' tale","https://en.wikipedia.org/wiki/Old_wives%27_tale"], faq:[
    ["Are old wives' tales about gender true?","No. Wikipedia describes an old wives' tale as a 'spurious or superstitious claim,' and each symptom here tracks hormones and body, not sex."],
    ["Why do so many seem to fit?","Confirmation bias — there are enough contradictory rules that almost any pregnancy 'matches' one in hindsight."],
    ["Is there any sign with real support?","Not reliably. For a credible early guess use nub theory; for certainty use NIPT or the anatomy scan."]]},
  "when-can-you-tell-baby-gender": { src:["Noninvasive prenatal testing","https://en.wikipedia.org/wiki/Noninvasive_prenatal_testing"], faq:[
    ["How early can you find out the sex?","NIPT from about 10 weeks is the earliest reliable answer; the anatomy scan confirms at 18 to 20 weeks."],
    ["Can a 12-week scan tell?","Nub theory gives a decent early guess at 12 to 14 weeks (about 70 to 90 percent), but it is not confirmation."],
    ["What is the most accurate method?","Diagnostic CVS and amniocentesis are near-certain, and NIPT exceeds 99 percent for sex where disclosed."]]},
  "gender-predictor-accuracy-research": { src:["Sex determination","https://en.wikipedia.org/wiki/Sex_determination"], faq:[
    ["Which gender prediction method is most accurate?","Medically, NIPT and the anatomy scan. Among non-medical guesses, nub theory leads; every folklore method sits near 50 percent."],
    ["Why are the fun methods only 50 percent?","None of them measures anything tied to the baby's chromosomes, so their predictions are statistically independent of the outcome."],
    ["Do any symptoms actually predict sex?","No. Morning sickness, cravings and belly shape vary by mother, not by the baby's sex."]]},
  "gender-predictor-methods-compared": { src:["Noninvasive prenatal testing","https://en.wikipedia.org/wiki/Noninvasive_prenatal_testing"], faq:[
    ["Which gender prediction method wins?","For accuracy, NIPT and the anatomy scan. For an early guess, nub theory. For pure fun, the Chinese chart or symptom quiz."],
    ["Are any at-home methods reliable?","No — baking soda, ring tests, skull theory and old wives' tales all perform at about chance."],
    ["How early can a real answer come?","About 10 weeks with NIPT, earlier only via unvalidated methods like Ramzi."]]},
  "gender-reveal-ideas": { src:["Sex determination","https://en.wikipedia.org/wiki/Sex_determination"], faq:[
    ["When should you hold a gender reveal?","Most wait until after the 18 to 20 week anatomy scan confirms the sex, then reveal between 20 and 28 weeks."],
    ["What is a cheap reveal idea?","A home balloon box, a coloured-filling cupcake, or scratch-off cards cost just a few dollars."],
    ["Are smoke or cannons safe?","Use flameless, outdoor-only effects, away from dry grass, and follow local fire restrictions."]]},
};

const files = Object.keys(DATA);
let done = 0;
for (const slug of files) {
  const p = `src/pages/blog/${slug}.html`;
  let h = readFileSync(p, "utf8");
  const d = DATA[slug];

  // Visible FAQ + sources (skip if a FAQ or sources section already exists).
  const hasFaq = /Frequently Asked Questions/i.test(h);
  const hasSources = /Sources &amp;|Sources &|<strong>Sources/i.test(h);
  let block = "";
  if (!hasFaq) {
    block += `\n  <h2>Frequently Asked Questions</h2>\n  ` + d.faq.map(([q,a]) => `<h3>${q}</h3>\n  <p>${a}</p>`).join("\n  ") + "\n";
  }
  if (!hasSources) {
    block += `\n  <p style="margin-top:28px;padding-top:16px;border-top:1px solid var(--border);font-size:.8125rem;color:var(--text-muted);"><strong>Sources &amp; further reading:</strong> <a href="${d.src[1]}" target="_blank" rel="noopener noreferrer">${d.src[0]}, Wikipedia</a>. Reviewed by the Gender Predictor team &middot; updated September 11, 2026 &middot; for entertainment, not medical advice.</p>\n`;
  }
  if (block) {
    // insert before the closing of the article page container
    if (h.includes("</div></main>")) h = h.replace("</div></main>", block + "</div></main>");
    else if (h.includes("</main>")) h = h.replace("</main>", block + "</main>");
  }

  // FAQPage schema (skip if already present).
  if (!/\"@type\":\"FAQPage\"|@type": "FAQPage"/.test(h)) {
    const schema = { "@context":"https://schema.org","@type":"FAQPage", mainEntity: d.faq.map(([q,a])=>({ "@type":"Question", name:q, acceptedAnswer:{ "@type":"Answer", text:a }})) };
    h = h.replace("</head>", `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
  }

  writeFileSync(p, h);
  done++;
  console.log("enhanced", slug);
}
console.log("total", done);
