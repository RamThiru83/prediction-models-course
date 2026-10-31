registerModule({
  id: 'm09',
  num: 9,
  part: 'Development',
  title: 'Additivity and linearity',
  book: 'Ch. 12',
  minutes: 70,
  summary: 'How to check the two main assumptions of a regression model, additivity (no interactions) and linearity (straight-line effects), without letting the search for a better fit cause overfitting.',
  objectives: [
    'Explain why additivity depends on the scale',
    'Read an interaction term as changing effects',
    'Count interactions and expected chance findings',
    'Use an overall test and smart coding',
    'Choose flexibility for continuous predictors in advance',
    'Prefer validated over apparent performance'
  ],
  format: 'cases',
  reading: [
    { cite: "Harrell FE Jr, Lee KL, Mark DB (1996). Multivariable prognostic models: issues in developing models, evaluating assumptions and adequacy, and measuring and reducing errors. Statistics in Medicine 15:361-387.", url: "https://doi.org/10.1002/(SICI)1097-0258(19960229)15:4<361::AID-SIM168>3.0.CO;2-4", note: "The classic account of how to check linearity and additivity, spend degrees of freedom sensibly and avoid overfitted models." },
    { cite: "Royston P, Altman DG, Sauerbrei W (2006). Dichotomizing continuous predictors in multiple regression: a bad idea. Statistics in Medicine 25:127-141.", url: "https://doi.org/10.1002/sim.2331", note: "Explains clearly why cutting a continuous predictor such as gestational age or cervical length into groups throws away information." },
    { cite: "Collins GS, Ogundimu EO, Cook JA, et al. (2016). Quantifying the impact of different approaches for handling continuous predictors on the performance of a prognostic model. Statistics in Medicine 35:4124-4135.", url: "https://doi.org/10.1002/sim.6986", note: "Shows with real data how dichotomising, categorising, splines and fractional polynomials change model performance." },
    { cite: "Efthimiou O, Seo M, Chalkou K, et al. (2024). Developing clinical prediction models: a step-by-step guide. BMJ 386:e078276.", url: "https://doi.org/10.1136/bmj-2023-078276", note: "A recent, practical walk-through of the whole development process that places non-linear terms and interactions within the modelling workflow." }
  ],
  essentials: `
<ul>
<li>A logistic model adds the effects of the predictors on the log-odds scale. This is the <b>additivity</b> assumption: the odds ratios of different predictors multiply. Whether two predictors "interact" depends on the scale: effects that are constant on the odds scale differ on the risk scale.</li>
<li>An <b>interaction term</b> (the product of two predictors) means the effect of one predictor depends on the value of the other. Correlation between two predictors is not interaction.</li>
<li>With k predictors there are k × (k − 1) ÷ 2 possible two-way interactions. Ten predictors give 45, and about 2 of them will be "significant" at 5% by chance alone.</li>
<li>Consider only interactions that are plausible in advance. Test all interactions of one predictor together first (an <b>overall test</b>), or use a strict p-value such as 0.01.</li>
<li>An interaction found in a small sample often fails in new data. Code it so that it cannot give implausible effects, and judge it by validated, not apparent, performance.</li>
<li>For continuous predictors, decide in advance how much flexibility each may use (for example a 3-knot spline, 2 df, for strong predictors in smaller data). Every extra term costs degrees of freedom.</li>
<li>A model with a higher apparent χ² is not automatically better. A "wrong but useful" additive model often predicts as well as a flexible one.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth (before 37 weeks). The hospital and its data are fictional and synthetic. The team now has a main-effects model fitted at the booking visit. In this module it asks whether some predictors work differently together, whether straight lines are good enough for age, BMI and haemoglobin, and how to check without fooling itself. You do not need the earlier modules for this story.',
  defs: {
    'additivity': 'The assumption that the effects of predictors simply add up on the scale of the model, the log odds in logistic regression.',
    'interaction term': 'A term made by multiplying two predictors, which lets the effect of one depend on the value of the other.',
    'quantitative interaction': 'An interaction in which an effect has the same direction in both groups but a different size.',
    'qualitative interaction': 'An interaction in which an effect reverses direction, harmful in one group and protective in the other.',
    'overall test': 'One test of all the interactions of a predictor together, done before looking at any single interaction.',
    'restricted cubic spline': 'A smooth curve made of joined pieces, forced to be straight beyond the outer knots; k knots use k − 1 degrees of freedom.',
    'fractional polynomial': 'A curve made from one or two power terms of a predictor, such as the log or the square root, chosen from a fixed set.',
    'generalised additive model': 'A model in which each continuous predictor gets a smooth curve, with a penalty that controls how wiggly it can be.',
    'effective degrees of freedom': 'The flexibility a penalised smooth curve actually uses, which can be a fraction such as 2.8.'
  },
  explainers: [
    (function () {
      function ring(k, cx, cy, r) { var p = []; for (var i = 0; i < k; i++) { var a = -Math.PI / 2 + 2 * Math.PI * i / k; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; }
      function net(k, red, d0) {
        var p = ring(k, 280, 160, 92), s = '', n = 0, step = k > 10 ? 0.01 : 0.03;
        for (var i = 0; i < k; i++) for (var j = i + 1; j < k; j++) { var isRed = red.indexOf(n) >= 0; s += EX.line([p[i], p[j]], { role: isRed ? 'err' : 'pred', w: isRed ? 3 : 1.2, d: isRed ? (d0 || 0) + 1.6 : (d0 || 0) + n * step, t: 0.5 }); n++; }
        p.forEach(function (q, i) { s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="6" class="ex-in fobs"' + EX.st(0.05 * i) + '/>'; });
        return s;
      }
      return {
        id: 'pairs',
        title: 'Why testing every interaction finds some by chance',
        scenes: [
          { svg: EX.svg(EX.text(30, 30, '5 predictors: 5 × 4 ÷ 2 = 10 possible pairs', { bold: true }) + net(5, []) + EX.text(30, 285, 'Each dot is a predictor; each violet line is one interaction term', { size: 's', d: 1 })),
            say: 'Each dot is a predictor in the preterm birth model. Each violet line is a possible interaction between two of them. With 5 predictors there are 5 times 4 divided by 2, which is 10 pairs.' },
          { svg: EX.svg(EX.text(30, 30, '10 predictors: 10 × 9 ÷ 2 = 45 pairs', { bold: true }) + net(10, [])),
            say: 'Double the predictors to 10 and the pairs jump to 45. The number of pairs grows with the square of the number of predictors.' },
          { svg: EX.svg(EX.text(30, 30, 'No true interactions, each tested at 5%', { bold: true }) + net(10, [7, 31], 0) + EX.text(30, 285, '45 × 0.05 = 2.25 "significant" interactions expected by chance', { d: 1.8 })),
            say: 'Suppose none of these interactions is real, and each is tested at the 5 per cent level. We still expect 45 times 0.05, about 2, to come out significant. The red lines are those false findings.' },
          { svg: EX.svg(EX.text(30, 30, 'The team\'s 14 candidate terms: 91 pairs', { bold: true }) + net(14, [5, 29, 52, 77], 0) + EX.text(30, 285, 'About 4.6 false positives, and 91 extra df for about 234 events', { d: 1.8 })),
            say: 'The team has 14 candidate terms. That gives 91 pairs, and about 4 or 5 false positives. Adding all of them would cost 91 degrees of freedom, with only about 234 preterm births.' },
          { svg: EX.svg(EX.text(280, 96, 'Before testing interactions', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 140, 'Choose a few pairs that are plausible in advance', { anchor: 'middle', d: 0.5 }) + EX.text(280, 168, 'Test all interactions of one predictor together first', { anchor: 'middle', d: 1.0 }) + EX.text(280, 196, 'Or use p below 0.01: 45 × 0.01 = 0.45 chance findings', { anchor: 'middle', d: 1.5 }) + EX.text(280, 224, 'Keep a term only if validated performance improves', { anchor: 'middle', d: 2.0 })),
            say: 'So choose a few pairs that make sense before seeing the data. Test all interactions of one predictor together first, or use a stricter p-value such as 0.01. Keep an interaction only if it improves validated performance.' }
        ]
      };
    })(),
    (function () {
      var B = EX.box({ l: 80, t: 44, w: 420, h: 176, xlim: [18, 40], ylim: [-4, 1], xticks: [20, 25, 30, 35, 40], yticks: [-4, -3, -2, -1, 0, 1], xlabel: 'Maternal age (years)', ylabel: 'Log odds of preterm birth' });
      function base(a) { return -3.6006 + 0.015 * (a - 27) * (a - 27); }
      function main(a) { return base(a) + 0.9; }
      function inter(a) { return base(a) + 0.9 + 0.1 * (a - 30); }
      var ages = [19, 23, 27, 31, 35, 39];
      var noH = EX.curve(B, base, 18, 40, { role: 'pred', d: 0.2 }) + EX.text(B.X(32), B.Y(base(32)) + 22, 'no hypertension', { size: 's', d: 0.4 });
      return {
        id: 'chance',
        title: 'An interaction that does not survive new data',
        scenes: [
          { svg: EX.svg(EX.text(30, 24, 'Main effects only: hypertension adds 0.9 at every age', { bold: true }) + B.s + noH + EX.curve(B, main, 18, 40, { role: 'pred', d: 0.8 }) + EX.text(B.X(19), B.Y(main(19)) - 10, 'chronic hypertension', { size: 's', d: 1.2 }) + EX.text(30, 290, 'Illustrative (synthetic)', { size: 's', d: 1.4 })),
            say: 'The main-effects model draws two curves for the log odds of preterm birth against age. Chronic hypertension adds the same 0.9 at every age, so the curves run parallel.' },
          { svg: EX.svg(EX.text(30, 24, 'A sample of 400 women: the gap seems to grow with age', { bold: true }) + B.s + noH + EX.curve(B, inter, 18, 40, { role: 'pred', d: 0.6 }) + EX.text(B.X(36.6), B.Y(-0.25), 'hypertension, with age × HTN term', { size: 's', anchor: 'end', d: 1.2 }) + EX.text(30, 290, 'The curves cross at age 21: below it, hypertension looks protective', { size: 's', d: 1.6 })),
            say: 'In a small sample of 400 women, an age by hypertension interaction reaches p of 0.04. The hypertension effect now grows by 0.1 per year of age. The curves cross at 21, so below that age hypertension seems to protect, which is not plausible.' },
          { svg: EX.svg(EX.text(30, 24, 'New women, large sample: the gap stays about 0.9', { bold: true }) + B.s + noH + EX.curve(B, inter, 18, 40, { role: 'pred', draw: false }) + EX.pts(B, ages.map(function (a) { return [a, main(a)]; }), { role: 'obs', r: 5, d: 0.4, stagger: 0.15 }) + EX.gaps(B, ages.map(function (a) { return [a, main(a), inter(a)]; }), { d: 1.6 }) + EX.text(30, 290, 'Dots: observed in new women. Red: error of the interaction model', { size: 's', d: 1.8 })),
            say: 'Now look at a large group of new women. The observed gap between the groups stays about 0.9 at every age. The red lines show the errors of the interaction model, largest for the youngest and oldest women.' },
          { svg: EX.svg(EX.text(280, 92, 'The interaction fitted noise', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 134, 'Apparent fit rises a little in the 400 women', { anchor: 'middle', d: 0.5 }) + EX.text(280, 160, 'Predictions for new women get worse', { anchor: 'middle', d: 1.0 }) + EX.text(280, 196, 'Was it plausible in advance? Did an overall test agree?', { anchor: 'middle', d: 1.5 }) + EX.text(280, 222, 'Does validated performance improve?', { anchor: 'middle', d: 2.0 })),
            say: 'The extra term raised the fit a little in the 400 women, but made predictions for new women worse. Before keeping an interaction, ask: was it plausible in advance, did an overall test support it, and does validated performance improve?' }
        ]
      };
    })()
  ],
  cases: [
    {
      id: 'c1',
      title: 'Do the predictors simply add up?',
      aim: 'see why additivity depends on the scale, and calculate risks from a model with an interaction term.',
      minutes: 15,
      need: `
<p>A logistic model has a <b>linear predictor</b>, lp = a + b<sub>1</sub>x<sub>1</sub> + b<sub>2</sub>x<sub>2</sub> + …. The b's are the <b>main effects</b>. Writing the model this way assumes <b>additivity</b>: effects add on the log-odds scale, so their odds ratios multiply.</p>
<p><b>The scale matters.</b> Suppose a treatment lowers the risk of preterm birth from 20 to 10 per 100 women in a high-risk group, and from 10 to 5 per 100 in a lower-risk group. The relative risk is 0.5 in both. The odds are 0.25, 0.111 and 0.053, so the odds ratios are 0.111 ÷ 0.25 = 0.44 and 0.053 ÷ 0.111 = 0.47: nearly the same. On the odds scale no interaction is needed. But the absolute benefit is 10 per 100 in one group and 5 per 100 in the other. A model that is additive on the log-odds scale is not additive on the risk scale.</p>
<p><b>Interaction terms.</b> An <b>interaction term</b> is the product x<sub>1</sub> × x<sub>2</sub>, added with its own coefficient. It means the effect of one predictor depends on the value of the other, so you cannot read that effect alone. Example: lp = −2.0 + 0.8 × bacteriuria + 0.6 × tobacco − 0.5 × (bacteriuria × tobacco). In women who do not use tobacco the odds ratio for bacteriuria is e<sup>0.8</sup> = 2.23; in tobacco users it is e<sup>0.8 − 0.5</sup> = e<sup>0.3</sup> = 1.35.</p>
<ul>
<li>A <b>quantitative interaction</b> changes the size of an effect but not its direction (as here, both odds ratios above 1). A <b>qualitative interaction</b> reverses it. Qualitative ones matter more for interpreting effects.</li>
<li>Correlation is not interaction. Two predictors can be correlated without interacting, and uncorrelated predictors can interact.</li>
</ul>`,
      scenario: `<p>Illustrative (synthetic). A colleague says that bacteriuria seems to matter less in women who use tobacco, and that because tobacco users are often from low-income households, "tobacco and low income interact". The obstetrician adds that vaginal progesterone "works better in high-risk women, because it prevents more births".</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'An interaction means one effect depends on another predictor, and whether you see one depends on the scale; correlation is a different thing.'
    },
    {
      id: 'c2',
      title: 'Which interactions, and how many tests?',
      aim: 'count the possible interactions, the chance findings among them, and limit the multiple testing.',
      minutes: 15,
      need: `
<p>Subject knowledge should guide which interactions to study, but it helps less than for main effects: it is hard to argue why two predictors would not add on the log-odds scale. Types that often deserve a look include severity × treatment, centre × predictors, calendar time × predictors, age × predictors, follow-up time × predictors (non-proportional effects in survival) and season × predictors.</p>
<p>A trial claim that a treatment "works in younger but not older women" needs an <b>interaction test</b> of the difference in effect, not one p-value in each subgroup. Even planned subgroup analyses are secondary findings.</p>
<p><b>Counting.</b> With k predictors there are k × (k − 1) ÷ 2 two-way interactions:</p>
<div class="formula">number of pairs = k × (k − 1) ÷ 2      expected chance findings = 0.05 × number of pairs</div>
<p>Example: 10 predictors give 10 × 9 ÷ 2 = 45 pairs. If none is real, 0.05 × 45 = 2.25 are expected to be significant at 5%.</p>
<p><b>Two ways to limit this.</b> (1) An <b>overall test</b>: test all interactions of one predictor (say all age interactions) together, with several df; look at single terms only if it is significant. (2) A strict p-value for single interactions, such as 0.01. In the book's GUSTO-I subsample (785 patients, 52 deaths) the overall age-interaction test gave p = 0.14, yet one single term, age × tachycardia, had p = 0.03. Looking only at single tests, you would have kept it.</p>
<div data-explainer="pairs"></div>`,
      scenario: `<p>Illustrative (synthetic). A junior doctor proposes to test every pair among the team's 14 candidate terms "to be thorough", and to keep any interaction with p &lt; 0.05. In a related trial report, progesterone is said to work in women under 25 (p = 0.03) but not in older women (p = 0.40).</p>`,
      widgets: `<div data-widget="interactionCount" data-try="Move the slider from 8 to 14 predictors and watch the expected number of false positives pass 4."></div>`,
      tasks: [2, 3],
      takeaway: 'The number of possible interactions grows with the square of the predictors, so test a few plausible ones, with an overall test or a strict p-value.'
    },
    {
      id: 'c3',
      title: 'A tempting interaction',
      aim: 'code an interaction so it cannot give implausible effects, and judge whether it improves prediction.',
      minutes: 20,
      need: `
<p>The usual coding is the product term together with both main effects. The fitted pattern can be strange. In the book's GUSTO-I example, the lines for log odds of death against age, with and without tachycardia, crossed at about 55 years, so tachycardia looked protective in younger patients. That is not plausible.</p>
<p><b>Smart coding</b> uses subject knowledge to avoid fitting noise. Options, from simple to flexible:</p>
<ul>
<li>(a) main effects only (parallel lines);</li>
<li>(b) the simple product term (lines that cross);</li>
<li>(c) separate age slopes below and above the crossing age, with no effect of the other predictor below it (three age slopes);</li>
<li>(d) one age slope plus an extra effect of the other predictor that starts only above the crossing age (two age slopes).</li>
</ul>
<p>(c) and (d) fit about equally well, but (d) uses fewer parameters. The cut-point is itself chosen from the data; the aim is only to rule out an implausible effect.</p>
<p><b>Does it help prediction?</b> In the book's example every interaction version raised the apparent c (0.828 to 0.831 or 0.832), but in 20,318 new patients the main-effects model was best (0.805 against 0.796 to 0.798). In the large data the interaction was significant in the opposite direction (p = 0.002). The small-sample finding was chance.</p>
<div data-explainer="chance"></div>`,
      scenario: `<p>Illustrative (synthetic). In a random 400 women from the booking data, the team adds an age × chronic hypertension term to the main-effects model. It has p = 0.04. The fitted hypertension effect is 0.9 on the log-odds scale at age 30 and grows by 0.1 per year of age. A manuscript from another group, reviewed the same week, has kept three interactions found by testing every pair.</p>`,
      widgets: '',
      tasks: [4, 5],
      takeaway: 'An interaction that looked significant in a small sample often reverses in new data; code it plausibly, and keep it only if validated performance improves.'
    },
    {
      id: 'c4',
      title: 'Straight lines or curves for several predictors?',
      aim: 'decide how much flexibility each continuous predictor gets, and compare models on fit penalised for complexity.',
      minutes: 20,
      need: `
<p>With several continuous predictors in one model, every curve uses degrees of freedom (df). Three tools are common:</p>
<ul>
<li><b>Restricted cubic splines</b> (RCS): 3, 4 or 5 knots use 2, 3 or 4 df. Five knots fit most shapes, but five for every predictor overfits. Decide in advance: in smaller data use linear terms or 3 knots, and give more flexibility to the strongest predictors (larger χ²).</li>
<li><b>Fractional polynomials</b> (FP): FP1 has one power term (2 df counting the search), FP2 has two (4 df). The multivariable procedure (mfp) works backward, predictor by predictor: a 4-df test for any effect, a 3-df test for non-linearity (FP2 against a line) and a 2-df test of FP2 against FP1.</li>
<li><b>Generalised additive models</b> (GAM): smooth curves with a penalty, which sets the <b>effective degrees of freedom</b>. Choosing the smoothness by generalised cross-validation (GCV) gives the best apparent fit but uses more df, and its p-values are only approximate.</li>
</ul>
<p><b>Comparing models.</b> A more flexible model always fits its own data better. A rough guide is χ² − 2 × df: higher is better. Worked example (illustrative): a linear model with χ² 120 on 8 df scores 120 − 16 = 104; a spline model with χ² 131 on 14 df scores 131 − 28 = 103. The splines add 11 for 6 df, which gives p = 0.088: no clear gain. The final judge is validated performance, for example by bootstrap with every modelling step repeated.</p>`,
      scenario: `<p>Illustrative (synthetic). The team's statistician wants to know whether maternal age needs a curve, and how much flexibility age, BMI and haemoglobin should each get. In ptb_dev the true effect of age is U-shaped, lowest near 27 years. A second manuscript claims a GAM is the best model because it had the highest likelihood-ratio statistic.</p>`,
      widgets: `<div data-widget="codingExplorer" data-try="Compare Linear, Quadratic and the 5-knot spline at subsample 2000, then set the subsample to 200 and see that the extra knots still add almost nothing to the χ²."></div>`,
      tasks: [6, 7],
      takeaway: 'Give each continuous predictor a flexibility chosen in advance, and accept extra terms only when they pay for their degrees of freedom in validated performance.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Additivity, scale and interaction terms',
      html: `
<p>The linear predictor lp = β<sub>1</sub>x<sub>1</sub> + … + β<sub>i</sub>x<sub>i</sub> assumes additivity of main effects on the log-odds (logistic) or log-hazard (Cox) scale, so effects are multiplicative on the odds or hazard. Book example: a risk reduction from 20% to 10% and from 10% to 5% has relative risk 0.5 in both strata and odds ratios 0.44 and 0.47, but absolute benefits of 10 and 5 percentage points. Whether an interaction exists depends on the scale.</p>
<p>An interaction term x<sub>1</sub> × x<sub>2</sub> is a two-way (first-order) interaction; x<sub>1</sub> × x<sub>2</sub> × x<sub>3</sub> is three-way (second-order), rarely considered. A predictor in an interaction has no single effect. Quantitative interactions change size; qualitative interactions change direction and matter more for interpretation than for predictive performance. Correlation between predictors says nothing about interaction.</p>
<p class="src">Source: Ch. 12, §12.1</p>`
    },
    {
      id: 'n2',
      title: 'Interactions that deserve consideration',
      html: `
<table class="data">
<tr><th>Interaction</th><th>Possible meaning</th></tr>
<tr><td>Severity × treatment</td><td>Less benefit with less severe disease</td></tr>
<tr><td>Place × treatment</td><td>Benefit varies by centre</td></tr>
<tr><td>Place × predictors</td><td>Predictor effects vary by centre or region</td></tr>
<tr><td>Calendar time × treatment</td><td>Learning curves</td></tr>
<tr><td>Calendar time × predictors</td><td>Effects change over the years</td></tr>
<tr><td>Age × predictors</td><td>Older subjects less affected by risk factors, or more by some disease types</td></tr>
<tr><td>Follow-up time × predictors</td><td>Non-proportional effects in survival, often decreasing</td></tr>
<tr><td>Season × predictors</td><td>Seasonal effects</td></tr>
</table>
<p>Table 12.1 (after Harrell). Even a constant relative treatment effect gives an absolute benefit that depends on baseline risk (book example: tPA in GUSTO-I). Treatment effects may vary by setting (surgical mortality in oesophageal cancer) and over calendar time. Subgroup claims need an interaction test, and even pre-specified subgroup analyses are secondary. Predictor effects were surprisingly consistent across traumatic brain injury studies, and predictor × place interactions were small in GUSTO-I. Proportional hazards means no interaction with follow-up time; it may fail (breast cancer stage had no effect beyond 10 years).</p>
<div class="callout book"><b>Book example: mechanical heart valves (1,449 valves, 25 years)</b><p>Early mortality 5%; survival 80%, 63% and 49% at 5, 10 and 15 years. Poisson regression separated calendar time, age and follow-up: mortality dropped around the introduction of cardioplegia, with no strong calendar-time interaction. Older age, urgent operation, ascending aorta surgery, earlier calendar year, male sex and previous cardiac surgery mattered more early in follow-up; concomitant bypass and mitral valve surgery had roughly constant effects.</p></div>
<p class="src">Source: Ch. 12, §12.1.1-12.1.4</p>`
    },
    {
      id: 'n3',
      title: 'Selecting and coding interactions',
      html: `
<table class="data">
<tr><th>Predictors k</th><th>Two-way interactions</th><th>Expected false positives at 5%</th></tr>
<tr><td>5</td><td>10</td><td>0.5</td></tr>
<tr><td>10</td><td>45</td><td>2.25</td></tr>
<tr><td>20</td><td>190</td><td>9.5</td></tr>
<tr><td>30</td><td>435</td><td>21.75</td></tr>
</table>
<p>Limit multiple testing with an overall test per predictor or a stringent p (0.01). Book example: GUSTO-I subsample (n = 785, 52 deaths), overall age-interaction Wald test p = 0.14, but age × tachycardia p = 0.03 (positive: age more harmful with tachycardia). Fitted lines crossed near 55 years; smart coding allowed no tachycardia effect below 55.</p>
<table class="data">
<tr><th>Book example: model</th><th>df</th><th>Apparent c (n = 785)</th><th>Validated c (n = 20,318)</th></tr>
<tr><td>Main effects only</td><td>8</td><td>0.828</td><td>0.805</td></tr>
<tr><td>+ age × tachycardia</td><td>9</td><td>0.831</td><td>0.796</td></tr>
<tr><td>One age effect below 55, two from 55</td><td>9</td><td>0.832</td><td>0.798</td></tr>
<tr><td>Tachycardia effect only above 55</td><td>8</td><td>0.832</td><td>0.798</td></tr>
</table>
<p>Table 12.2. In the validation data the interaction was significant (p = 0.002, 1,428 deaths) but negative. Unstructured interactions can damage prediction; pre-specifying a few may be better than exploratory selection. Smart coding also eases standard errors for predictors in interactions.</p>
<p class="src">Source: Ch. 12, §12.2</p>`
    },
    {
      id: 'n4',
      title: 'Non-linearity in multivariable models',
      html: `
<table class="data">
<tr><th>Approach</th><th>Characteristic</th><th>Multivariable strategy</th></tr>
<tr><td>RCS</td><td>Cubic splines, linear in the tails</td><td>Complexity set a priori, or from univariable or multivariable findings</td></tr>
<tr><td>FP</td><td>One or two power terms</td><td>Iterative search for the best transformation per predictor</td></tr>
<tr><td>GAM splines</td><td>Smoothness controlled by a penalty (effective df)</td><td>Effective df set by the analyst or by GCV</td></tr>
</table>
<p>Table 12.3. RCS with 3, 4, 5 knots use 2, 3, 4 df; choose complexity per predictor, possibly by its χ². The <b>mfp</b> algorithm starts from all-linear, takes predictors in order of decreasing significance, and for each: best of 44 FP1/FP2 forms against omission (4 df), FP2 against linear (3 df), FP2 against FP1 (2 df). It cycles until stable, preserving the overall type I error, and is slightly conservative when the truth is linear. GAM with GCV optimises several smooths at once but spends more effective df, and its p-values ignore the smoothing search. GAM curves are a useful reference for simpler FP or RCS forms.</p>
<p class="src">Source: Ch. 12, §12.3</p>`
    },
    {
      id: 'n5',
      title: 'Case study: testicular cancer',
      html: `
<p>Book example: 544 patients after chemotherapy; outcome benign tissue (necrosis). Predictors: teratoma elements, elevated AFP, elevated HCG (binary); standardised pre-chemotherapy LDH (LDHst), post-chemotherapy mass size, and reduction in size (continuous). Univariably, RCS plots suggested log LDHst, square-root post-size and linear reduction. FP agreed in the main: LDH any effect p = 0.02, non-linearity p = 0.48; post-size non-linear p = 0.0002, FP2 against FP1 p = 0.46 (FP1 logarithmic); reduction linear (p = 0.64).</p>
<table class="data">
<tr><th>Strategy</th><th>df</th><th>Model χ²</th><th>χ² − 2 × df</th></tr>
<tr><td>All linear</td><td>3 + 3 = 6</td><td>205</td><td>193</td></tr>
<tr><td>FP2 each, no selection</td><td>3 + 12 = 15</td><td>222</td><td>192</td></tr>
<tr><td>FP, selection p &lt; 0.20</td><td>3 + 3 forms</td><td>213</td><td>n/a</td></tr>
<tr><td>RCS 4 knots each</td><td>3 + 9 = 12</td><td>231</td><td>207</td></tr>
<tr><td>Visual approximation</td><td>3 + 3 forms</td><td>212</td><td>n/a</td></tr>
<tr><td>GAM, 3 df each</td><td>3 + 9 = 12</td><td>232</td><td>208</td></tr>
<tr><td>GAM, GCV</td><td>3 + (2.8 + 4.6 + 3.9) = 14.3</td><td>240</td><td>211.4</td></tr>
</table>
<p>Table 12.5 (last column computed here; search df not counted for selected forms). Linear: Nagelkerke R² 41.9% apparent, 40.3% validated. FP2 gained 17 for 9 df (p = 0.049); RCS gained 26 for 6 df (p &lt; 0.001); FP1 and visual forms reached 212 to 213 with far fewer df. GCV-GAM shapes were doubtful: log odds rising with very large masses, and a wiggly curve for reduction between 20% and 100%. All values are apparent; a validation that repeats every step is needed.</p>
<p class="src">Source: Ch. 12, §12.4</p>`
    },
    {
      id: 'n6',
      title: 'Concluding advice: a "wrong but useful" model',
      html: `
<p>Thorough checking of additivity and linearity suits effect estimation; for prediction it invites overfitting. In medical examples, gains from interactions and non-linear terms are often modest, since strong qualitative interactions and U-shapes are rare.</p>
<table class="data">
<tr><th>Approach</th><th>Description</th></tr>
<tr><td>Limit interaction and non-linear terms</td><td>Only a priori plausible interactions; non-linear terms only for strong, likely non-linear predictors</td></tr>
<tr><td>Overall testing</td><td>One overall test per interacting predictor before single terms</td></tr>
<tr><td>Compare flexible with simple</td><td>Validated (bootstrap) performance of flexible models (interactions, non-linearity, neural network, GAM) against a simple additive linear model</td></tr>
<tr><td>Extra shrinkage</td><td>Stronger shrinkage or penalty for interaction and non-linear terms, against testimation bias</td></tr>
</table>
<p>Table 12.6. In smaller data, rely on additivity and interpret effects as averages over subgroups. Interactions also complicate presentation. The search makes the effective df larger than the fitted df; FP counts this (FP1 2 df, FP2 4 df), GCV-GAM does not. Naive Bayes assumes additivity; trees assume high-order interactions and neural networks fit specific patterns, so a tree can explore interactions to be tested in regression.</p>
<p class="src">Source: Ch. 12, §12.5</p>`
    }
  ],
  keyPoints: [
    'Logistic models are additive on the log-odds scale; whether two predictors interact depends on the scale.',
    'An interaction means one predictor\'s effect depends on another; correlation is not interaction.',
    'k predictors give k(k − 1)/2 two-way interactions: 45 for 10 predictors, about 2 significant at 5% by chance.',
    'Use a priori plausibility, an overall test per predictor or p < 0.01; subgroup claims need an interaction test.',
    'In GUSTO-I an age × tachycardia interaction raised apparent c but lowered validated c (0.805 to 0.796) and reversed direction in new data.',
    'Code interactions to avoid implausible effects, such as a risk factor that looks protective at some ages.',
    'Allocate flexibility to continuous predictors in advance (RCS 3 to 5 knots = 2 to 4 df); mfp uses 4-, 3- and 2-df tests.',
    'Compare flexible and simple models on validated performance; the highest apparent χ² is not automatically best.'
  ],
  quiz: [
    {
      q: 'Progesterone lowers the risk of preterm birth from 20% to 10% in women with a previous preterm birth and from 10% to 5% in other women. Which statement is correct?',
      options: [
        'There is a strong interaction, because the absolute reduction differs.',
        'The odds ratios (0.44 and 0.47) are similar, so no interaction is needed on the odds scale, though the absolute benefit differs (10 against 5 per 100 women).',
        'The relative risk is 0.5 in one group and 0.25 in the other.',
        'Additivity can be judged without choosing a scale.'
      ],
      answer: 1,
      why: 'The odds ratios are 0.111 ÷ 0.25 = 0.44 and 0.053 ÷ 0.111 = 0.47, nearly constant, and the relative risk is 0.5 in both groups. The absolute benefit depends on baseline risk even when the relative effect is constant. Whether an interaction exists depends on the scale, so the first and fourth options are wrong.'
    },
    {
      q: 'A model has log odds = −2.2 + 1.0 × B + 0.5 × T − 0.6 × (B × T), where B is bacteriuria and T tobacco use (both 0 or 1). What is the odds ratio for bacteriuria in tobacco users?',
      options: [
        '2.72',
        '1.49',
        '0.55',
        '1.65'
      ],
      answer: 1,
      why: 'In users (T = 1) the log odds rise by 1.0 − 0.6 = 0.4 when B goes from 0 to 1, so the odds ratio is e^0.4 = 1.49. The value 2.72 (e^1.0) is the odds ratio in non-users, 0.55 (e^−0.6) is the ratio of the two odds ratios, and 1.65 (e^0.5) is the tobacco effect.'
    },
    {
      q: 'The team tests every two-way interaction among 12 binary predictors at p < 0.05. If none is real, how many significant interactions should it expect?',
      options: [
        'About 0.6',
        'About 3.3',
        'About 7.2',
        'None, because the main effects are in the model'
      ],
      answer: 1,
      why: 'There are 12 × 11 ÷ 2 = 66 pairs, and 0.05 × 66 = 3.3. Using 12 tests gives 0.6, and using 12 × 12 = 144 tests gives 7.2; both count wrongly. Main effects in the model do not protect against chance findings among the interaction tests.'
    },
    {
      q: 'An overall test of all age interactions in the preterm model gives p = 0.21, but age × tobacco alone has p = 0.04. What should the team do?',
      options: [
        'Add age × tobacco, because it is significant.',
        'Add all age interactions, because one is significant.',
        'Not add it: the overall test does not support age interactions, and a single p = 0.04 among several tests is likely chance.',
        'Replace tobacco by the interaction term.'
      ],
      answer: 2,
      why: 'The overall test is done first to protect against multiple testing; if it is not significant, single terms are not examined. In the book\'s GUSTO-I example the same pattern (overall p = 0.14, single p = 0.03) gave an interaction that reversed in new data. Dropping a main effect while keeping its interaction breaks the hierarchy of the model.'
    },
    {
      q: 'The preterm model has three continuous predictors: age (strong, U-shaped), haemoglobin (moderate) and height (weak). There are about 230 events. Which strategy fits the book\'s advice?',
      options: [
        'Give every continuous predictor a 5-knot spline so no curve is missed.',
        'Decide in advance: a 3-knot spline or quadratic for age, and simpler terms for the weaker predictors.',
        'Try many codings for each and keep the one with the highest apparent χ².',
        'Dichotomise all three to avoid any assumption about shape.'
      ],
      answer: 1,
      why: 'Flexibility should be allocated in advance, more for strong predictors with a known non-linear shape. Five knots everywhere spends many df and overfits. Choosing by the highest apparent χ² rewards overfitting, and dichotomising throws information away.'
    },
    {
      q: 'Three codings were compared in preterm data: all linear (6 df, χ² = 95), 3-knot splines (9 df, χ² = 101) and 5-knot splines (18 df, χ² = 116). Which conclusion is justified?',
      options: [
        'After subtracting 2 × df the scores are 83, 83 and 80, so the extra flexibility does not pay for itself and validated performance should decide.',
        'The 5-knot model is best, because its χ² is highest.',
        'The 3-knot model is best, because it is in the middle.',
        'The linear model must be rejected, because the 5-knot model has a higher χ².'
      ],
      answer: 0,
      why: 'χ² − 2 × df gives 95 − 12 = 83, 101 − 18 = 83 and 116 − 36 = 80. The highest raw χ² reflects the most df. Being in the middle is not a criterion, and a higher χ² alone does not reject the simpler model.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Scale, correlation and interaction',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). Use the colleague's and the obstetrician's statements in the case: (1) "tobacco and low income interact, because tobacco users are often from low-income households"; (2) "progesterone works better in high-risk women, because it prevents more births". In the trial, progesterone lowered preterm birth from 20% to 10% in women with a previous preterm birth and from 10% to 5% in others.</p>`,
      questions: [
        '<b>(a)</b> Calculate the relative risk, the odds ratio and the risk difference in each group.',
        '<b>(b)</b> Is statement 2 right? On which scale is there an interaction, and on which is there not?',
        '<b>(c)</b> What is wrong with statement 1?',
        '<b>(d)</b> Would an odds ratio for bacteriuria of 2.23 in non-users and 1.35 in users be a quantitative or a qualitative interaction?'
      ],
      answer: `<p><b>(a)</b> Previous preterm birth: RR = 10 ÷ 20 = 0.5; odds 0.20 ÷ 0.80 = 0.25 and 0.10 ÷ 0.90 = 0.111, OR = 0.111 ÷ 0.25 = 0.44; risk difference 10 per 100 women. Others: RR = 5 ÷ 10 = 0.5; odds 0.111 and 0.05 ÷ 0.95 = 0.053, OR = 0.053 ÷ 0.111 = 0.47; risk difference 5 per 100.</p>
<p><b>(b)</b> Partly. The relative effect is the same (RR 0.5, OR about 0.45), so there is no interaction on the relative scales. The absolute benefit is twice as large in the high-risk group, so on the risk-difference scale there is an interaction. "Prevents more births" is true in absolute terms, but it follows from the higher baseline risk, not from a stronger relative effect.</p>
<p><b>(c)</b> It describes correlation between two predictors, not interaction. Interaction is about whether the effect of one on preterm birth depends on the other. Correlated predictors may not interact, and uncorrelated ones may.</p>
<p><b>(d)</b> Quantitative: bacteriuria raises the odds in both groups, only by different amounts. A qualitative interaction would need it to raise the odds in one group and lower them in the other.</p>`
    },
    {
      id: 't1',
      title: 'Risks from a model with an interaction',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). lp = −2.0 + 0.8 × B + 0.6 × T − 0.5 × B × T, with B = bacteriuria and T = tobacco use (0 or 1). The additive model has the same intercept and main effects but no product term. Risk = 1 ÷ (1 + e<sup>−lp</sup>).</p>`,
      questions: [
        '<b>(a)</b> Calculate the risk for the four combinations of B and T in the interaction model.',
        '<b>(b)</b> Give the odds ratio for bacteriuria in non-users and in users, and for both exposures against neither.',
        '<b>(c)</b> Calculate the risk for B = 1, T = 1 in the additive model. Compare the risk differences for bacteriuria in the two models.'
      ],
      answer: `<p><b>(a)</b> B = 0, T = 0: lp = −2.0, risk = 1 ÷ (1 + e<sup>2.0</sup>) = 0.119. B = 1, T = 0: lp = −1.2, risk 0.232. B = 0, T = 1: lp = −1.4, risk 0.198. B = 1, T = 1: lp = −2.0 + 0.8 + 0.6 − 0.5 = −1.1, risk 0.250.</p>
<p><b>(b)</b> Non-users: e<sup>0.8</sup> = 2.23. Users: e<sup>0.8 − 0.5</sup> = e<sup>0.3</sup> = 1.35. Both against neither: e<sup>0.8 + 0.6 − 0.5</sup> = e<sup>0.9</sup> = 2.46. The ratio of the two bacteriuria odds ratios is e<sup>−0.5</sup> = 0.61: this is the interaction on the odds-ratio scale.</p>
<p><b>(c)</b> Additive model, B = 1 and T = 1: lp = −2.0 + 0.8 + 0.6 = −0.6, risk 0.354 (against 0.250 with the interaction). Risk differences for bacteriuria: interaction model 0.232 − 0.119 = 0.112 in non-users and 0.250 − 0.198 = 0.052 in users; additive model 0.112 and 0.354 − 0.198 = 0.157. Even the additive model gives different risk differences, because additivity on the log-odds scale is not additivity on the risk scale.</p>`
    },
    {
      id: 't2',
      title: 'How many interactions could the team test?',
      level: 'Apply',
      scenario: `<p>Use the interaction counter in this case. The team's development data (ptb_dev) have 2,000 women and <span data-live="ptb_dev_events"></span> preterm births (about 234), and 14 candidate terms.</p>`,
      questions: [
        '<b>(a)</b> Set k = 9 and then k = 14. Record the number of two-way interactions and the expected false positives at α = 0.05.',
        '<b>(b)</b> For k = 14, what is the total df with all interactions added, and the events per df?',
        '<b>(c)</b> How many false positives would you expect among the 91 pairs at p &lt; 0.01?',
        '<b>(d)</b> Suggest two interactions that might be worth pre-specifying for this model, and say why.'
      ],
      answer: `<p><b>(a)</b> k = 9: 9 × 8 ÷ 2 = 36 pairs, 0.05 × 36 = 1.8 expected false positives. k = 14: 14 × 13 ÷ 2 = 91 pairs, 0.05 × 91 = 4.55.</p>
<p><b>(b)</b> The widget gives 14 + 91 = 105 df (in fact a little more, since age uses 2 df). With about 234 events, that is 234 ÷ 105 = 2.2 events per df, far below 10. The model would be badly overfitted. In these synthetic data the true model has no interactions at all, so every interaction found would be noise.</p>
<p><b>(c)</b> 0.01 × 91 = 0.91, about one, instead of about 4 or 5.</p>
<p><b>(d)</b> Examples of the book's types: age × a predictor (risk factors may act differently in teenagers or older women), or calendar time or clinic × a predictor (recording or care may differ). Any choice should be made before looking at the outcome data, tested with an overall test, and kept only if validated performance improves.</p>`
    },
    {
      id: 't3',
      title: 'Overall tests and subgroup claims',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). (1) In the team's model, an overall Wald test of all interactions with age (6 df) gives p = 0.21. One of them, age × tobacco, has p = 0.04 on its own. (2) A trial report says: "Progesterone reduced preterm birth in women under 25 (p = 0.03) but not in women aged 25 or more (p = 0.40). Progesterone should be given only to younger women."</p>`,
      questions: [
        '<b>(a)</b> Why is the overall test done first, and what should the team conclude from (1)?',
        '<b>(b)</b> What is the flaw in the reasoning of (2)? What analysis is needed?',
        '<b>(c)</b> If the interaction test in (2) were p = 0.30, what would you conclude?'
      ],
      answer: `<p><b>(a)</b> Testing six age interactions one by one gives six chances of a false positive. One test of all six together keeps the overall error rate at 5%. With overall p = 0.21 the team stops there and does not add age × tobacco; a single p = 0.04 among six tests is easily chance. In the book's GUSTO-I example the same pattern (overall p = 0.14, single p = 0.03) gave an interaction that reversed in new data.</p>
<p><b>(b)</b> A significant result in one subgroup and a non-significant one in the other do not show that the effects differ; the older group may simply have less power. The claim needs an interaction test (treatment × age group) for the difference in effect, ideally pre-specified, and even then it is a secondary finding.</p>
<p><b>(c)</b> No evidence that the effect differs by age. The best estimate is the overall treatment effect for all women, with the absolute benefit depending on each woman's baseline risk.</p>`
    },
    {
      id: 't4',
      title: 'Recode an implausible interaction',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). In 400 women the age × chronic hypertension term has p = 0.04. The fitted log odds ratio for hypertension is 0.9 + 0.1 × (age − 30). In the main-effects model it is 0.9 at every age.</p>`,
      questions: [
        '<b>(a)</b> Calculate the log odds ratio and odds ratio for hypertension at ages 18, 25, 30 and 40 under the interaction model.',
        '<b>(b)</b> At what age is the hypertension effect zero? What does the model imply below that age, and is that plausible?',
        '<b>(c)</b> Write a smarter coding, in the spirit of the book\'s option (d), that cannot make hypertension protective. How many parameters does it use compared with the simple product model?',
        '<b>(d)</b> What evidence would you need before keeping any version of the interaction?'
      ],
      answer: `<p><b>(a)</b> Age 18: 0.9 + 0.1 × (−12) = −0.3, OR e<sup>−0.3</sup> = 0.74. Age 25: 0.9 − 0.5 = 0.4, OR 1.49. Age 30: 0.9, OR 2.46. Age 40: 0.9 + 1.0 = 1.9, OR 6.69.</p>
<p><b>(b)</b> 0.9 + 0.1 × (age − 30) = 0 gives age = 30 − 9 = 21. Below 21 the model says hypertension lowers the risk of preterm birth. That is not plausible: it is a by-product of forcing a straight-line change through the data.</p>
<p><b>(c)</b> Keep the age terms, and replace both the hypertension main effect and the product by one term, hypertension × max(0, age − 21). Hypertension then has no effect up to age 21 and an effect that grows above it (with a coefficient of 0.1 per year, 0.9 at age 30), so with a positive coefficient it can never look protective. This uses one parameter for hypertension: the same number as the main-effects model and one fewer than the product model, which needs both the main effect and the product. The book's option (c), separate age slopes below and above the cut-point, uses as many parameters as the product model (9 df each in the book's Table 12.2, against 8 for option (d)). The cut at 21 comes from the data, so it adds some optimism.</p>
<p><b>(d)</b> A plausible reason in advance, an overall test of age interactions that is significant, and better validated performance (bootstrap with the interaction search repeated, or external data such as ptb_val) than the main-effects model. If kept, it should be shrunk more than the main effects.</p>`
    },
    {
      id: 't5',
      title: 'Review a model with data-dredged interactions',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A manuscript develops a preterm birth model in 900 women (110 events) with 8 predictors. "We tested all 28 pairwise interactions and added the 3 with p &lt; 0.05. In the final model all interactions were highly significant (p &lt; 0.05). One of them shows that tobacco use is protective in women in their first pregnancy. The apparent c rose from 0.74 to 0.77, which confirms the value of the interactions. No internal validation was done."</p>`,
      questions: [
        '<b>(a)</b> How many significant interactions would you expect by chance among 28 tests at 5%?',
        '<b>(b)</b> Calculate the df of the final model and its events per df.',
        '<b>(c)</b> List the problems and the remedies, point by point.'
      ],
      answer: `<p><b>(a)</b> 0.05 × 28 = 1.4. Finding 3 is close to what chance alone gives.</p>
<p><b>(b)</b> 8 main effects + 3 interactions = 11 df; 110 ÷ 11 = 10 events per df, before counting the 28 tests that chose the three, which raise the effective df well above 11.</p>
<p><b>(c)</b></p>
<ol>
<li><b>Testing every pair.</b> No a priori plausibility, no overall test and no stricter p. Remedy: pre-specify a few plausible interactions; use an overall test per predictor or p &lt; 0.01.</li>
<li><b>"Highly significant in the final model".</b> Terms chosen because they were significant will look significant again: their p-values and coefficients are biased by the selection (testimation bias). Remedy: do not interpret these p-values; shrink interaction terms more than main effects.</li>
<li><b>A qualitative interaction that makes tobacco protective.</b> Implausible, and a typical sign of fitting noise. Remedy: smart coding that rules out a protective effect, or drop the term.</li>
<li><b>Apparent c as proof.</b> Apparent c always rises when terms are added. In the book's GUSTO-I example, apparent c rose with an interaction but validated c fell from 0.805 to 0.796. Remedy: compare validated performance with the main-effects model.</li>
<li><b>No internal validation.</b> Remedy: bootstrap with the whole interaction search repeated in each sample, report optimism-corrected c and calibration slope, and validate externally.</li>
</ol>
<div class="callout warn"><b>Critical:</b><p>The three interactions are consistent with chance, one is implausible, and none has been validated. The paper's claim that they improve the model is not supported.</p></div>`
    },
    {
      id: 't6',
      title: 'Compare flexible and simple codings',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The second manuscript develops a model in 900 women (110 events) with 3 continuous predictors (age, BMI, haemoglobin) and 5 binary ones. Apparent model χ²: all linear (8 df) 120; 4-knot splines for each continuous predictor (14 df) 131; GAM with GCV smoothing (19 effective df) 140. "Because the GAM had the highest likelihood-ratio statistic, it was selected." Use: χ² of 11 on 6 df has p = 0.088; χ² of 20 on 11 df has p = 0.045.</p>`,
      questions: [
        '<b>(a)</b> Calculate χ² − 2 × df for the three models.',
        '<b>(b)</b> Test the splines against linear, and the GAM against linear. Why is the GAM p-value only approximate?',
        '<b>(c)</b> How many df does 110 events support at 10 events per df? Comment on the GAM.',
        '<b>(d)</b> What should the authors have done?'
      ],
      answer: `<p><b>(a)</b> Linear: 120 − 16 = 104. Splines: 131 − 28 = 103. GAM: 140 − 38 = 102. Once df are counted, the simplest model scores highest.</p>
<p><b>(b)</b> Splines against linear: 131 − 120 = 11 on 14 − 8 = 6 df, p = 0.088, not significant. GAM against linear: 140 − 120 = 20 on 19 − 8 = 11 df, p = 0.045, borderline. The GAM p-value ignores the search for the smoothing parameter, so it is too small.</p>
<p><b>(c)</b> 110 ÷ 10 = 11 df. The GAM uses 19 effective df, an EPV of 110 ÷ 19 = 5.8. Its extra fit is likely to be noise, as with the book's GCV-GAM in testicular cancer, which had the highest χ² (240) but implausible shapes.</p>
<p><b>(d)</b> Decide flexibility in advance (for example a 3-knot spline only for age, which is known to be U-shaped, and linear terms for the others), and compare flexible and simple models on bootstrap-validated c and calibration slope, repeating every step. A "wrong but useful" additive model is likely to do as well.</p>`
    },
    {
      id: 't7',
      title: 'How much flexibility does maternal age need?',
      level: 'Analyse',
      scenario: `<p>Use the coding explorer in this case. It fits maternal age alone to <b>ptb_dev</b> and reports LR χ², model df and AIC (lower is better). The subsample of a given size is the same every time.</p>`,
      questions: [
        '<b>(a)</b> At subsample 2,000, record χ², df and AIC for Linear, Quadratic, and splines with 3, 4 and 5 knots. Calculate χ² − 2 × df for each.',
        '<b>(b)</b> Why does the linear model do so badly here?',
        '<b>(c)</b> Set the subsample to 200 and record AIC for the same codings. How do the extra knots fare now?',
        '<b>(d)</b> What does this suggest for coding age in the full model?'
      ],
      answer: `<p><b>(a)</b> Subsample 2,000 (234 events):</p>
<table class="data">
<tr><th>Coding</th><th>χ²</th><th>df</th><th>χ² − 2 × df</th><th>AIC</th></tr>
<tr><td>Linear</td><td>1.2</td><td>1</td><td>−0.8</td><td>1446.4</td></tr>
<tr><td>Quadratic</td><td>88.0</td><td>2</td><td>84.0</td><td>1361.6</td></tr>
<tr><td>RCS 3 knots</td><td>84.2</td><td>2</td><td>80.2</td><td>1365.5</td></tr>
<tr><td>RCS 4 knots</td><td>86.3</td><td>3</td><td>80.3</td><td>1365.3</td></tr>
<tr><td>RCS 5 knots</td><td>87.8</td><td>4</td><td>79.8</td><td>1365.8</td></tr>
</table>
<p>The quadratic is best: it matches the true shape with 2 df. Extra knots add a little χ² but not enough to pay for their df.</p>
<p><b>(b)</b> The true effect is U-shaped, lowest near 27. A straight line through a U is almost flat, so it misses nearly all the information (χ² 1.2 against 88.0). Here linearity is a poor assumption, and the age curve is a strong, plausible non-linear effect that deserves flexibility.</p>
<p><b>(c)</b> Subsample 200 (21 events): AIC 137.9 (linear), 122.3 (quadratic), 122.3 (3 knots), 124.1 (4 knots), 126.1 (5 knots). Each extra knot adds almost no χ² (18.1 to 18.3) but costs 2 AIC points per df, so the 4-knot and 5-knot splines are 1.8 and 3.8 points behind the quadratic. With only 21 events the curve is learned from about a tenth of the information, so any extra wiggle a flexible spline shows is likely to be noise.</p>
<p><b>(d)</b> Give age a curve chosen in advance, a quadratic or a 3-knot spline (2 df), because it is a strong predictor with a known U-shape. Do not spend 4 df on a 5-knot spline, and use linear terms for weaker predictors unless there is a reason otherwise. Confirm the choice with validated performance.</p>`
    }
  ]
});
