import { writeFileSync } from "node:fs";

// Shared method profiles (scores 1-5 on five axes + facts).
const M = {
  chinese: { name:"Chinese Gender Chart", url:"/chinese-gender-chart/", ico:"📅", acc:"~50%", timing:"Anytime, even before conception", evid:"Folklore — no scientific support", cost:"Free, no equipment", needs:"Your birth date + conception/due date",
    scores:{ Accuracy:1, "Earliest answer":5, "Scientific backing":1, "Ease & access":5, "Fun factor":5 } },
  ramzi: { name:"Ramzi Theory", url:"/ramzi-theory-boy-vs-girl/", ico:"🔍", acc:"~50%", timing:"6–8 weeks", evid:"Never peer-reviewed", cost:"Needs an early scan", needs:"A 6–8 week ultrasound image",
    scores:{ Accuracy:1, "Earliest answer":4, "Scientific backing":1, "Ease & access":2, "Fun factor":4 } },
  nub: { name:"Nub Theory", url:"/nub-theory-boy-vs-girl/", ico:"📏", acc:"~70–90%", timing:"11–14 weeks", evid:"Reads real anatomy; operator-dependent", cost:"Needs a 12-week scan", needs:"A clear midsagittal 12-week image",
    scores:{ Accuracy:4, "Earliest answer":3, "Scientific backing":3, "Ease & access":2, "Fun factor":4 } },
  owT: { name:"Old Wives' Tales", url:"/baby-gender-prediction-quiz/", ico:"🔮", acc:"~50%", timing:"Anytime", evid:"Folklore — confirmation bias", cost:"Free, no equipment", needs:"Your symptoms and cravings",
    scores:{ Accuracy:1, "Earliest answer":5, "Scientific backing":1, "Ease & access":5, "Fun factor":5 } },
};

const AXES = ["Accuracy","Earliest answer","Scientific backing","Ease & access","Fun factor"];

function total(m){ return AXES.reduce((s,a)=>s+m.scores[a],0); }

function scoreTable(a,b){
  let rows = AXES.map(ax=>`<tr><td>${ax}</td><td class="${a.scores[ax]>=b.scores[ax]?'win':''}">${a.scores[ax]} / 5</td><td class="${b.scores[ax]>a.scores[ax]?'win':''}">${b.scores[ax]} / 5</td></tr>`).join("\n      ");
  return `<table class="data">
      <thead><tr><th>Criterion</th><th>${a.name}</th><th>${b.name}</th></tr></thead>
      <tbody>
      ${rows}
      <tr><td><strong>Total</strong></td><td><strong>${total(a)} / 25</strong></td><td><strong>${total(b)} / 25</strong></td></tr>
      </tbody></table>`;
}

function factsTable(a,b){
  const row=(k,va,vb)=>`<tr><td>${k}</td><td>${va}</td><td>${vb}</td></tr>`;
  return `<table class="data">
      <thead><tr><th></th><th>${a.name}</th><th>${b.name}</th></tr></thead>
      <tbody>
      ${row("Real accuracy",a.acc,b.acc)}
      ${row("Earliest",a.timing,b.timing)}
      ${row("Evidence",a.evid,b.evid)}
      ${row("What you need",a.needs,b.needs)}
      ${row("Cost",a.cost,b.cost)}
      </tbody></table>`;
}

function faq(items){
  return items.map(([q,a])=>`<p class="faq-q">${q}</p><p class="faq-a">${a}</p>`).join("\n  ");
}
function faqSchema(items){
  return JSON.stringify({ "@context":"https://schema.org","@type":"FAQPage", mainEntity: items.map(([q,a])=>({ "@type":"Question", name:q, acceptedAnswer:{ "@type":"Answer", text:a }}))}, null, 2);
}

function shell(o){
  const a=M[o.a], b=M[o.b];
  const winner = total(a)===total(b) ? null : (total(a)>total(b)?a:b);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K9MMFBD8HR"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-K9MMFBD8HR');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${o.title}</title>
<meta name="description" content="${o.desc}">
<link rel="canonical" href="https://www.gender-predictor.com/${o.slug}/">
<meta property="og:title" content="${o.og}">
<meta property="og:description" content="${o.desc}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://www.gender-predictor.com/${o.slug}/">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1f476;</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&optional" rel="stylesheet">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${o.og}",
  "description": "${o.desc}",
  "datePublished": "2026-08-07",
  "dateModified": "2026-09-11",
  "author": { "@type": "Organization", "name": "Gender Predictor Editorial Team", "url": "https://www.gender-predictor.com/about/" },
  "publisher": { "@type": "Organization", "name": "Gender Predictor", "url": "https://www.gender-predictor.com", "logo": { "@type": "ImageObject", "url": "https://www.gender-predictor.com/og-image.png" } },
  "image": "https://www.gender-predictor.com/og-image.png"
}
</script>
<script type="application/ld+json">
${faqSchema(o.faq)}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.gender-predictor.com/" },
    { "@type": "ListItem", "position": 2, "name": "${a.name} vs ${b.name}", "item": "https://www.gender-predictor.com/${o.slug}/" }
  ]
}
</script>
<style>
  :root { --base:#faf9f7; --accent:#7b6b9a; --accent-light:#9b8cb5; --accent-subtle:#f3f1f7; --sage:#8aaa9b; --sage-light:#e8f0eb; --text:#2d2933; --text-muted:#6b6672; --text-subtle:#9893a0; --border:#e8e5ec; --boy:#8ba6c8; --boy-light:#e8f0f7; --girl:#c8848f; --girl-light:#f9eeef; --radius:12px; --radius-lg:16px; --radius-full:999px; --white:#fff; --shadow:0 2px 8px rgba(45,41,51,.12),0 1px 2px rgba(45,41,51,.06); --shadow-lg:0 8px 32px rgba(45,41,51,.10); }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:var(--base);color:var(--text);line-height:1.7;-webkit-font-smoothing:antialiased}
  h1,h2,h3{font-family:'Outfit',system-ui,sans-serif;line-height:1.2}
  .nav{position:sticky;top:0;z-index:100;background:rgba(250,249,247,.88);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);height:56px;display:flex;align-items:center;padding:0 24px}
  .nav-inner{max-width:1100px;margin:0 auto;width:100%;display:flex;align-items:center;justify-content:space-between}
  .nav-brand{font-family:'Outfit',sans-serif;font-weight:700;font-size:1.125rem;color:var(--accent);text-decoration:none}
  .nav-links{display:flex;gap:20px;list-style:none}
  .nav-links a{color:var(--text-muted);text-decoration:none;font-size:.875rem;font-weight:500}
  .nav-links a:hover{color:var(--accent)}
  .page{max-width:760px;margin:0 auto;padding:44px 24px 80px}
  .page h1{font-size:clamp(1.7rem,4vw,2.25rem);font-weight:800;letter-spacing:-.025em;margin-bottom:14px}
  .page h2{font-size:1.375rem;font-weight:700;margin:40px 0 12px;color:var(--accent);scroll-margin-top:72px}
  .page h3{font-size:1.0625rem;font-weight:600;margin:22px 0 8px}
  .page p{margin-bottom:16px;color:var(--text-muted)} .page a{color:var(--accent)}
  .page ul,.page ol{margin:8px 0 20px 22px;color:var(--text-muted)} .page li{margin-bottom:8px}
  .lede{font-size:1.0625rem;color:var(--text)}
  .answer-box{background:var(--sage-light);border:1px solid #cfe0d5;border-radius:var(--radius-lg);padding:22px 24px;margin:24px 0 8px}
  .answer-box h2{margin:0 0 8px;font-size:1.0625rem;color:var(--sage);text-transform:uppercase;letter-spacing:.06em}
  .answer-box p{margin:0;color:var(--text)}
  .scorecard{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin:24px 0;background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);overflow:hidden}
  .scorecard .side{padding:22px 18px;text-align:center}
  .scorecard .side.win-side{background:var(--sage-light)}
  .scorecard .side h2{margin:0 0 4px;font-size:1.0625rem;color:var(--text);text-transform:none;letter-spacing:0}
  .scorecard .side .score{font-family:'Outfit',sans-serif;font-size:2rem;font-weight:800;color:var(--text-subtle)}
  .scorecard .side.win-side .score{color:var(--sage)}
  .scorecard .vs{font-family:'Outfit',sans-serif;font-weight:800;font-size:1.25rem;color:var(--accent);padding:20px}
  table.data{width:100%;border-collapse:collapse;margin:20px 0;font-size:.875rem}
  table.data th,table.data td{border:1px solid var(--border);padding:10px 12px;text-align:left}
  table.data th{background:var(--accent-subtle);color:var(--accent);font-family:'Outfit',sans-serif}
  table.data td.win{background:var(--sage-light);color:var(--sage);font-weight:700}
  .choose{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}
  .choose .box{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:18px}
  .choose .box h3{margin-top:0;color:var(--accent)}
  .faq-q{font-family:'Outfit',sans-serif;font-weight:600;font-size:1rem;color:var(--text);margin:16px 0 6px}
  .faq-a{color:var(--text-muted);font-size:.9375rem;margin:0}
  .sources{margin:28px 0 0;padding-top:18px;border-top:1px solid var(--border);font-size:.8125rem;color:var(--text-muted)}
  .sources a{color:var(--accent)}
  .cta{background:linear-gradient(135deg,var(--accent-subtle),var(--sage-light));border-radius:var(--radius-lg);padding:28px;margin:40px 0 0;text-align:center}
  .cta h2{margin-top:0}
  .btn{display:inline-flex;align-items:center;gap:8px;height:48px;padding:0 28px;border:none;border-radius:var(--radius-full);font-family:'Outfit',sans-serif;font-size:.9375rem;font-weight:600;cursor:pointer;background:var(--accent);color:#fff!important;text-decoration:none;transition:all .15s}
  .btn:hover{background:var(--accent-light);box-shadow:var(--shadow-lg)}
  .footer{padding:40px 24px;border-top:1px solid var(--border);background:var(--white)}
  .footer-inner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-text{font-size:.8125rem;color:var(--text-muted)}
  .footer-links{display:flex;gap:18px;list-style:none}
  .footer-links a{font-size:.8125rem;color:var(--text-subtle);text-decoration:none}
  @media (max-width:640px){.nav-links{display:none}.scorecard{grid-template-columns:1fr}.scorecard .vs{padding:10px}.choose{grid-template-columns:1fr}}
</style>
</head>
<body>
<nav class="nav"><div class="nav-inner"><a href="/" class="nav-brand">Gender Predictor</a>
  <ul class="nav-links"><li><a href="/#methods">All Methods</a></li><li><a href="/gender-predictor-accuracy/">Accuracy</a></li><li><a href="/blog/gender-predictor-methods-compared/">Compared</a></li><li><a href="/blog/">Blog</a></li></ul>
</div></nav>
<main><div class="page">
  <h1>${o.h1}</h1>
  <p class="lede">${o.lede}</p>

  <div class="answer-box"><h2>Quick Verdict</h2><p>${o.verdict}</p></div>

  <div class="scorecard">
    <div class="side ${winner===a?'win-side':''}"><h2>${a.ico} ${a.name}</h2><div class="score">${total(a)}/25</div></div>
    <div class="vs">VS</div>
    <div class="side ${winner===b?'win-side':''}"><h2>${b.ico} ${b.name}</h2><div class="score">${total(b)}/25</div></div>
  </div>

  <h2>${a.name} vs ${b.name} at a Glance</h2>
  ${factsTable(a,b)}

  <h2>Scored Comparison</h2>
  <p>Each method is rated 1&ndash;5 on the five things people actually care about. Higher wins that line (shaded).</p>
  ${scoreTable(a,b)}

  <h2>${o.deepA}</h2>
  <p>${o.deepAtxt}</p>

  <h2>${o.deepB}</h2>
  <p>${o.deepBtxt}</p>

  <h2>Which Should You Use?</h2>
  <div class="choose">
    <div class="box"><h3>${o.chooseA.title}</h3><p>${o.chooseA.txt}</p></div>
    <div class="box"><h3>${o.chooseB.title}</h3><p>${o.chooseB.txt}</p></div>
  </div>

  <h2>The Honest Bottom Line</h2>
  <p>${o.bottom}</p>

  <h2>Try Both, and 7 More Methods</h2>
  <p>Why choose? The <a href="/">main predictor</a> combines the ${a.name.toLowerCase()}, the ${b.name.toLowerCase()} and seven others into one weighted answer. Also explore <a href="/nub-theory-boy-vs-girl/">nub theory</a>, <a href="/ramzi-theory-boy-vs-girl/">Ramzi</a>, <a href="/skull-theory-boy-vs-girl/">skull theory</a> and <a href="/baby-gender-prediction-quiz/">the old wives&rsquo; tales quiz</a>, or see every number on the <a href="/gender-predictor-accuracy/">accuracy page</a>.</p>

  <h2>Frequently Asked Questions</h2>
  ${faq(o.faq)}

  <div class="sources"><strong>Sources &amp; Further Reading</strong>
    <p>Fetal sex is "determined at fertilisation by whether the sperm carries an X or a Y chromosome." <a href="https://en.wikipedia.org/wiki/Sex_determination" target="_blank" rel="noopener noreferrer">Sex determination, Wikipedia</a>. For the reliable tests, <a href="https://en.wikipedia.org/wiki/Noninvasive_prenatal_testing" target="_blank" rel="noopener noreferrer">Noninvasive prenatal testing, Wikipedia</a>.</p>
    <p style="margin-top:10px;color:var(--text-subtle);">Reviewed by the Gender Predictor team &middot; Updated September 11, 2026 &middot; For entertainment, not medical advice.</p>
  </div>

  <div class="cta"><h2>Combine Them Into One Answer</h2><p>${o.cta}</p><a href="/" class="btn">Open the predictor</a></div>
</div></main>
<footer class="footer"><div class="footer-inner"><p class="footer-text">For entertainment only. Consult your doctor for accurate sex determination.</p><ul class="footer-links"><li><a href="/blog/">Blog</a></li><li><a href="/about/">About</a></li><li><a href="/privacy/">Privacy</a></li></ul></div></footer>
</body>
</html>
`;
}

const PAGES = [
  {
    slug:"chinese-calendar-vs-ramzi-theory", a:"chinese", b:"ramzi",
    title:"Chinese Calendar vs Ramzi Theory: Which Gender Predictor Is More Accurate?",
    og:"Chinese Calendar vs Ramzi Theory: Which Gender Predictor Is More Accurate?",
    desc:"A head-to-head of two early baby-sex guesses: the Chinese lunar calendar and the Ramzi placenta theory. Compared on accuracy, timing, evidence and ease, with a clear verdict.",
    h1:"Chinese Gender Calendar vs Ramzi Theory",
    lede:"Both promise an early answer to the boy-or-girl question — one from a 700-year-old lunar chart, the other from a 6-week scan of placenta position. Here is how the Chinese calendar stacks up against the Ramzi theory.",
    verdict:"On accuracy they are effectively tied at about 50% — neither beats a coin flip. The <strong>Chinese calendar wins on ease and timing</strong> because it needs no scan and can be tried before you even conceive, while <strong>Ramzi can be read a little earlier in a pregnancy but requires an early ultrasound</strong> and a hard-to-judge image. If you want a scan-based guess, the <a href=\"/nub-theory-boy-vs-girl/\">nub theory</a> outperforms both.",
    deepA:"Why the Chinese Chart Is Easier", deepAtxt:"The calendar needs only two numbers — the mother's lunar age and the lunar month of conception — so it costs nothing, works for anyone, and can even be used to pick a 'conception month.' Its weakness is that it has no biological basis, so it is a delightful coin flip and nothing more.",
    deepB:"Why Ramzi Is Earlier but Trickier", deepBtxt:"Ramzi theory claims a 6–8 week answer from which side of the uterus the placenta sits, which sounds like a real medical read. In practice it was never peer-reviewed, and ultrasound images are often mirrored, so 'left' and 'right' are unreliable — making it both less proven and harder to use than the chart.",
    chooseA:{ title:"Pick the Chinese calendar if…", txt:"You want a free, instant, shareable guess you can play with right now — before a scan, without any equipment." },
    chooseB:{ title:"Pick Ramzi if…", txt:"You already have a 6–8 week scan image and want an early conversation-starter, fully aware it is speculative." },
    bottom:"Neither method is accurate, so this is a contest of convenience, not truth. The calendar wins on accessibility; Ramzi wins only on claiming an earlier 'medical' angle, which is undermined by the mirror-image problem. For a genuinely early read, the nub theory at 12 weeks is the better guess, and NIPT or the anatomy scan are the real answers.",
    cta:"Feed both your birth date and your scan answers into one predictor and see how much they agree.",
    faq:[
      ["Is the Chinese calendar or Ramzi theory more accurate?","Both sit at roughly 50%, so neither is meaningfully more accurate. The Chinese calendar is just far easier to try."],
      ["Which can give an answer sooner?","The Chinese calendar can be used before conception; Ramzi needs a 6–8 week scan. In pregnancy, both are 'early' but equally unreliable."],
      ["Does Ramzi need an ultrasound?","Yes — you need a 6–8 week scan image, and judging the placenta side is error-prone because images are often mirrored."],
      ["Is either one worth trusting?","As fun guesses, yes. For anything that matters, use NIPT from ~10 weeks or the 18–20 week anatomy scan."]
    ]
  },
  {
    slug:"chinese-calendar-vs-nub-theory", a:"chinese", b:"nub",
    title:"Chinese Gender Calendar vs Nub Theory: Which Predictor Is Actually More Accurate?",
    og:"Chinese Gender Calendar vs Nub Theory: Which Is More Accurate?",
    desc:"Chinese lunar calendar versus nub theory compared on accuracy, timing, evidence and ease. One is folklore, one reads real anatomy — see which wins and when.",
    h1:"Chinese Gender Calendar vs Nub Theory",
    lede:"The Chinese calendar guesses from your birth year and the month you conceived; nub theory reads the angle of your baby's actual anatomy at 12 weeks. One is pure tradition, the other has a biological basis — so the gap is bigger than most reveal-night arguments admit.",
    verdict:"<strong>Nub theory is the more accurate guess</strong> — roughly 70&ndash;90% on a clear 12-week image versus about 50% for the calendar — because it measures the genital tubercle, a structure that genuinely differs by sex. The <strong>Chinese chart wins only on timing and ease</strong>: free, no scan, usable before you even conceive. For an early-but-credible read, choose nub; for a fun pre-pregnancy game, choose the calendar.",
    deepA:"Why the Calendar Can Be Instant but Not Trusted", deepAtxt:"There is no scan, no cost and no timing window for the Chinese chart — just two numbers and a grid. That makes it the most accessible predictor here. The catch is that nothing about your birth year is linked to your baby's chromosomes, so it is a coin flip dressed up as tradition.",
    deepB:"Why Nub Theory Beats It on Accuracy", deepBtxt:"Nub theory looks at the genital tubercle angle at 12–14 weeks, and that structure really does start to differ between male and female fetuses at that point. That anatomical link is why its reported accuracy is far above chance — as long as you have a clean midsagittal image and a reasonable reader.",
    chooseA:{ title:"Pick the Chinese calendar if…", txt:"You are early, curious or pre-conception and want a zero-effort, zero-cost guess to spark conversation." },
    chooseB:{ title:"Pick nub theory if…", txt:"You have a 12–14 week scan and want the most credible early ultrasound guess available." },
    bottom:"This is the clearest split of the comparison pages: one method reads real anatomy and one does not. Nub theory is meaningfully more accurate; the calendar is only more convenient. If you have the scan, use the nub; if you do not, the calendar is a harmless placeholder until NIPT or the anatomy scan settles it.",
    cta:"Combine the calendar, the nub angle and seven other methods into one weighted answer.",
    faq:[
      ["Is nub theory more accurate than the Chinese calendar?","Yes. Nub theory reads real anatomy and reports roughly 70–90% on a clear image, while the calendar performs at about 50%."],
      ["Which works earlier?","The Chinese calendar can be used any time, even before conception. Nub theory needs a 11–14 week scan."],
      ["Can I trust a 12-week nub reading?","Treat it as a strong guess, not confirmation. Only NIPT or the 18–20 week scan are reliable."],
      ["Do they ever disagree?","Often — they share no signal — which is why combining methods into one weighted result is more fun."]
    ]
  },
  {
    slug:"chinese-calendar-vs-old-wives-tales", a:"chinese", b:"owT",
    title:"Chinese Calendar vs Old Wives' Tales: Which Gender Prediction Is More Fun?",
    og:"Chinese Calendar vs Old Wives' Tales: Two Ancient Methods Compared",
    desc:"Two centuries-old, no-equipment baby-sex predictors compared: the Chinese lunar calendar and the old wives' tales symptoms list. Accuracy, evidence and which is more fun.",
    h1:"Chinese Gender Calendar vs Old Wives' Tales",
    lede:"Two of the oldest, most shared gender games — the Chinese lunar chart and the classic symptom folklore — both free, both wrong about the same thing. Here is how the two traditions compare and when you might reach for each.",
    verdict:"Statistically they are <strong>tied at about 50%</strong> — both are folklore with no biological basis. The real difference is the input: the <strong>Chinese calendar uses fixed numbers</strong> (lunar age and month) so it gives one stable answer, while <strong>old wives' tales use your changing symptoms</strong> and are more interactive and social. Neither beats a coin flip, so pick whichever is more fun — or run both and enjoy when they disagree.",
    deepA:"The Chinese Calendar: Numbers, Not Feelings", deepAtxt:"Your lunar age and conception month never change once set, so the calendar hands you a single, repeatable answer in seconds. It is tidy, printable and great for settling bets — even though the answer is random.",
    deepB:"Old Wives' Tales: The Social Guess", deepBtxt:"Cravings, nausea, belly shape and mood make the tales more personal and party-friendly — everyone can guess along. But because the signs are numerous and contradictory, they reliably confirm whatever you half-hope for (confirmation bias), and still land near chance.",
    chooseA:{ title:"Pick the Chinese calendar if…", txt:"You want one clear, quotable answer from dates alone — perfect for a quick guess or a reveal-night poll." },
    chooseB:{ title:"Pick old wives' tales if…", txt:"You want a playful, symptom-based game that pulls friends and family into the guessing." },
    bottom:"Both are entertainment-tier, both around 50%, and neither should steer any decision. The calendar is cleaner and more decisive; the tales are more interactive and social. Many families enjoy the calendar as the 'official guess' and the tales as the running commentary — and save the truth for the scan.",
    cta:"Blend the calendar and the symptom quiz with seven more methods for one weighted guess.",
    faq:[
      ["Are the Chinese calendar and old wives' tales accurate?","No — both perform at roughly 50%, the same as a coin flip, because neither measures anything tied to sex."],
      ["Which is better?","The calendar gives one stable answer from your dates; the tales are more social and interactive. It's a fun choice, not an accuracy one."],
      ["Can they disagree?","Yes, often. With no real signal behind either, disagreement is expected and part of the entertainment."],
      ["What should I actually rely on?","NIPT from ~10 weeks or the 18–20 week anatomy scan."]
    ]
  },
  {
    slug:"ramzi-vs-nub-theory", a:"ramzi", b:"nub",
    title:"Ramzi Theory vs Nub Theory: Which Early Ultrasound Method Is Better?",
    og:"Ramzi Theory vs Nub Theory: Which Ultrasound Gender Prediction Is More Reliable?",
    desc:"Both use early ultrasound, but Ramzi reads placenta position at 6-8 weeks and nub theory reads the genital tubercle at 12-14. Compared on accuracy, timing and evidence.",
    h1:"Ramzi Theory vs Nub Theory",
    lede:"These are the two ultrasound-based guesses people argue about: Ramzi at 6–8 weeks from placenta side, and nub theory at 12–14 weeks from the genital tubercle angle. They look similar but differ enormously in how much sense they make.",
    verdict:"<strong>Nub theory is clearly the stronger of the two.</strong> It reads the <a href=\"/nub-theory-boy-vs-girl/\">genital tubercle</a>, a structure that genuinely differs by sex, reaching roughly 70&ndash;90% on a good 12-week image. <a href=\"/ramzi-theory-boy-vs-girl/\">Ramzi theory</a> reads placenta side, which has <strong>no validated link to sex</strong> and is confounded by mirrored scan images, so it performs at about 50%. Ramzi's only advantage is being readable a few weeks earlier — for accuracy, nub wins decisively.",
    deepA:"Ramzi: Earlier, but Unproven", deepAtxt:"Ramzi's appeal is the 6–8 week timing, before the nub has differentiated. But the placenta side theory was never validated by independent peer-reviewed studies, and because ultrasound screens are inconsistently oriented, the very left/right signal it depends on is unreliable. Result: a coin flip with a medical-looking backdrop.",
    deepB:"Nub: Why Anatomy Wins", deepBytxt:"", deepBtxt:"Nub theory measures the angle between the genital tubercle and the spine at 12–14 weeks. Since that tubercle actually begins to differ between sexes at this stage, the method has a real anatomical anchor — which is exactly what Ramzi lacks. It is not definitive, but it is the most credible early ultrasound guess there is.",
    chooseA:{ title:"Pick Ramzi if…", txt:"You have a 6–8 week scan and want an early talking point, accepting it is no better than chance." },
    chooseB:{ title:"Pick nub theory if…", txt:"You can wait to 11–14 weeks and want a scan-based guess with a genuine anatomical basis." },
    bottom:"Don't be fooled by the similar 'ultrasound' framing — these are not close. Nub theory reads anatomy that differs by sex; Ramzi reads placenta position that does not. If you want an early but honest guess, choose nub theory, and hold both loosely until the 18–20 week scan confirms.",
    cta:"Use the predictor to compare the nub angle and Ramzi side against seven other signals.",
    faq:[
      ["Is Ramzi or nub theory more accurate?","Nub theory, by a wide margin — roughly 70–90% on a clear 12-week image versus about 50% for Ramzi."],
      ["Which can I read earlier?","Ramzi claims 6–8 weeks; nub theory needs 11–14 weeks. Ramzi is earlier but unproven."],
      ["Why is Ramzi unreliable even on a scan?","Placenta side has no validated link to sex, and ultrasound images are often mirrored, so the left/right read is untrustworthy."],
      ["Should I trust either over the anatomy scan?","No. Both are early guesses; the 18–20 week anatomy scan and NIPT are the reliable answers."]
    ]
  },
];

for (const p of PAGES) {
  writeFileSync("src/pages/" + p.slug + ".html", shell(p));
  console.log("wrote", p.slug, "|", p.a, "vs", p.b, "| winner-score", total(M[p.a]), "vs", total(M[p.b]));
}
