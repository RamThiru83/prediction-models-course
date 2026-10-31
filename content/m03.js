registerModule({
  id: 'm03',
  num: 3,
  part: 'Development',
  title: 'Statistical models and choosing a model',
  book: 'Ch. 4 and 6',
  minutes: 70,
  summary: "The regression models used for continuous, binary, categorical, ordinal and survival outcomes, how they turn predictors into risks, how they relate to Bayes' rule, trees and neural networks, and why regression is the sensible default for clinical prediction.",
  objectives: [
    'Match the outcome to a model',
    'Turn a linear predictor into a risk',
    'Read a coefficient as an odds ratio',
    'Link a test result to logistic regression',
    'Compare models with the likelihood ratio',
    'Explain why regression is the default'
  ],
  format: 'cases',
  reading: [
    { cite: "Christodoulou E, Ma J, Collins GS, Steyerberg EW, Verbakel JY, Van Calster B (2019). A systematic review shows no performance benefit of machine learning over logistic regression for clinical prediction models. J Clin Epidemiol 110:12-22.", url: "https://doi.org/10.1016/j.jclinepi.2019.02.004", note: "Evidence for why regression remains the sensible default, and how biased validation made machine learning look better." },
    { cite: "Harrell FE Jr, Lee KL, Mark DB (1996). Multivariable prognostic models: issues in developing models, evaluating assumptions and adequacy, and measuring and reducing errors. Stat Med 15:361-387.", url: "https://doi.org/10.1002/(SICI)1097-0258(19960229)15:4<361::AID-SIM168>3.0.CO;2-4", note: "A foundational paper on regression modelling strategy for binary, ordinal and time-to-event outcomes, including overfitting and validation." },
    { cite: "Collins GS, Moons KGM, Dhiman P, et al. (2024). TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods. BMJ 385:e078378.", url: "https://doi.org/10.1136/bmj-2023-078378", note: "The current 27-item reporting checklist covering both regression and machine learning models, useful when writing up any model." }
  ],
  essentials: `
<ul>
<li>The type of outcome decides the model. A measured number (birth weight) uses <b>linear regression</b>; a yes/no outcome (preterm birth) uses <b>logistic regression</b>; unordered categories use <b>polytomous</b> logistic regression; ordered categories use a <b>proportional odds</b> model; time to an event, when some women leave before the end, uses <b>Cox regression</b>.</li>
<li>Logistic regression adds up the effects of the predictors on the log-odds scale. The total is the <b>linear predictor</b> (lp). It is turned into a risk by risk = 1 ÷ (1 + e<sup>−lp</sup>), which always lies between 0% and 100%.</li>
<li>Each <b>coefficient</b> is the change in log-odds for one unit of its predictor. e<sup>coefficient</sup> is the <b>odds ratio</b>. Odds ratios multiply the odds, not the risk.</li>
<li>A single test result can be written as a logistic model with one predictor. Multiplying the results of several linked tests (<b>naive Bayes</b>) counts the same information twice and gives risks that are too extreme.</li>
<li>The <b>likelihood</b> measures how well a model fits the data. The <b>likelihood ratio</b> test compares a model with a simpler one.</li>
<li>Trees and neural networks are more flexible, but need far more data. In medical data a well-built regression model usually predicts as well or better, so regression is the default.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has planned its study. In this module it chooses the statistical model: which model fits each outcome, how a model turns predictors into a risk, how a bedside test fits into the same framework, and whether a fashionable machine-learning method would do better. You do not need the earlier modules for this story.',
  defs: {
    'linear predictor': 'The score a model makes by adding the intercept to each coefficient times its predictor; it is the log-odds of the outcome.',
    'intercept': 'The log-odds for a woman whose predictors are all at zero or at their reference value.',
    'coefficient': 'How much the log-odds change for one unit of a predictor, with the other predictors held the same.',
    'odds ratio': 'e raised to a coefficient: the number that multiplies the odds for one unit of the predictor.',
    'polytomous': 'A logistic model for an outcome with three or more categories that have no natural order.',
    'proportional odds': 'A model for ordered categories that uses one set of coefficients and a separate intercept for each cut-point.',
    'Cox regression': 'A model for the time until an event that can use women who leave the study before the event happens.',
    'naive Bayes': 'Multiplying the likelihood ratios of several findings one after another, which is right only if the findings are unrelated once the condition is known.',
    'log-likelihood': 'The sum, over all women, of the log of the chance the model gave to what actually happened; closer to zero is a better fit.',
    'null model': 'A model with no predictors, which gives every woman the same average risk.'
  },
  explainers: [
    {
      id: 'logodds',
      title: 'Adding on the log-odds scale',
      scenes: (function () {
        var risk = function (x) { return 1 / (1 + Math.exp(-x)); };
        var pc = function (v) { return Math.round(v * 100) + '%'; };
        var B = EX.box({ l: 80, t: 50, w: 430, h: 190, xlim: [-5, 1], ylim: [0, 0.6], xticks: [-5, -4, -3, -2, -1, 0, 1], yticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6], yfmt: pc, xlabel: 'linear predictor (log-odds)', ylabel: 'risk' });
        var curve = function (d) { return EX.curve(B, risk, -5, 1, { role: 'pred', draw: false, d: d || 0 }); };
        var guide = function (x, d) { var y = risk(x); return EX.rect(B.X(x) - 0.5, B.Y(y), 1, B.Y(0) - B.Y(y), { role: 'muted', rx: 0, d: d }) + EX.rect(B.X(-5), B.Y(y) - 0.5, B.X(x) - B.X(-5), 1, { role: 'muted', rx: 0, d: d }); };
        var pt = function (x, d) { return EX.pts(B, [[x, risk(x)]], { role: 'pred', r: 5, d: d }); };
        var step = function (x0, x1, d) { return EX.rect(B.X(x0), B.Y(0) - 6, B.X(x1) - B.X(x0), 4, { role: 'obs', rx: 2, d: d }); };
        return [
          { svg: EX.svg(EX.text(40, 30, 'Start at the intercept: −3.60', { size: 'm', bold: true }) + B.s + curve(0.3) + guide(-3.6, 0.8) + pt(-3.6, 1.2) + EX.text(B.X(-4.9), B.Y(0.46), 'lp −3.60: odds 0.027, risk 2.7%', { d: 1.6 }) + EX.text(B.X(-4.9), B.Y(0.56), 'no previous preterm birth, no urine infection', { size: 's', d: 2.0 })),
            say: 'Start with the intercept, minus 3.60. That is the log-odds for a woman with no previous preterm birth and no urine infection. On the curve it is a risk of 2.7 per cent, or odds of about 0.027.' },
          { svg: EX.svg(EX.text(40, 30, 'Previous preterm birth: add 1.50', { size: 'm', bold: true }) + B.s + curve() + guide(-3.6, 0) + pt(-3.6, 0) + step(-3.6, -2.1, 0.8) + guide(-2.1, 1.4) + pt(-2.1, 1.8) + EX.text(B.X(-2.1) + 10, B.Y(0.109) - 12, 'lp −2.10: odds 0.12, risk 10.9%', { d: 2.2 }) + EX.text(B.X(-4.9), B.Y(0.56), '−3.60 + 1.50 = −2.10;  odds 0.027 × 4.48 = 0.12', { size: 's', d: 2.8 })),
            say: 'A previous preterm birth adds 1.50 on the log-odds scale: minus 3.60 plus 1.50 is minus 2.10. Adding on the log-odds scale is the same as multiplying the odds, here by 4.48. The odds become about 0.12, and the risk 10.9 per cent.' },
          { svg: EX.svg(EX.text(40, 30, 'Urine infection: add 0.90 more', { size: 'm', bold: true }) + B.s + curve() + guide(-3.6, 0) + pt(-3.6, 0) + pt(-2.1, 0) + step(-2.1, -1.2, 0.8) + guide(-1.2, 1.4) + pt(-1.2, 1.8) + EX.text(B.X(-1.2) - 10, B.Y(0.232) - 12, 'lp −1.20: odds 0.30, risk 23.2%', { anchor: 'end', d: 2.2 }) + EX.text(B.X(-4.9), B.Y(0.56), '−2.10 + 0.90 = −1.20;  odds 0.12 × 2.46 = 0.30', { size: 's', d: 2.8 })),
            say: 'A urine infection adds 0.90 more: minus 1.20. The odds are multiplied again, by 2.46, to about 0.30. The curve gives a risk of 23.2 per cent. Two additions on the log-odds scale are two multiplications of the odds.' },
          { svg: EX.svg(EX.text(40, 30, 'The trap: multiplying the risk instead of the odds', { size: 'm', bold: true }) + B.s + curve() + guide(-1.2, 0) + pt(-1.2, 0) + EX.text(B.X(-1.2) + 12, B.Y(0.232) + 14, 'right: 23.2%', { d: 0.4 }) + EX.pts(B, [[-1.2, 0.293]], { role: 'obs', r: 5, d: 1.0 }) + EX.gaps(B, [[-1.2, 0.232, 0.293]], { d: 1.4 }) + EX.text(B.X(-1.2) - 10, B.Y(0.293) - 10, 'wrong: 2.7% × 4.48 × 2.46 = 29.3%', { anchor: 'end', d: 1.0 }) + EX.text(B.X(-4.9), B.Y(0.56), 'odds ratios multiply odds, not risks', { size: 's', d: 2.2 })),
            say: 'Here is the trap. Multiplying the risk itself, 2.7 per cent times 4.48 times 2.46, gives 29.3 per cent. The red gap is the error. Odds ratios multiply odds, not risks, and the mistake grows with the risk: a risk can even pass 100 per cent.' },
          { svg: EX.svg(EX.text(40, 30, 'The same odds ratio, a different change in risk', { size: 'm', bold: true }) + B.s + curve() + pt(-3.6, 0) + pt(-2.1, 0) + step(-3.6, -2.1, 0.4) + EX.text(B.X(-2.1) - 10, B.Y(0.109) - 12, '2.7% to 10.9%: +8.2 points', { size: 's', anchor: 'end', d: 0.8 }) + guide(-2.7, 1.4) + pt(-2.7, 1.6) + step(-2.7, -1.2, 2.0) + guide(-1.2, 2.4) + pt(-1.2, 2.6) + EX.text(B.X(-1.2) - 10, B.Y(0.232) - 12, '6.3% to 23.2%: +16.9 points', { size: 's', anchor: 'end', d: 3.0 }) + EX.text(B.X(-4.9), B.Y(0.56), 'urine infection only: lp −2.70, risk 6.3%; then add 1.50', { size: 's', d: 1.4 })),
            say: 'One more thing. A woman with a urine infection only has a risk of 6.3 per cent. Add the same 1.50 for a previous preterm birth and she goes to 23.2 per cent: about 17 points, not 8. The odds ratio is the same for every woman; the change in risk is not.' }
        ];
      })()
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'Which kind of model?',
      aim: 'match each type of outcome to its usual regression model.',
      minutes: 15,
      need: `
<p>A prediction model is a formula that turns a woman's predictors into a prediction. It is a practical tool, not a statement about causes: a predictor may simply be a marker of something we did not measure. As the saying goes, all models are wrong, but some are useful.</p>
<table class="data">
<tr><th>The outcome is</th><th>Example in the story</th><th>Usual model</th><th>It predicts</th></tr>
<tr><td>A measured number</td><td>Birth weight in grams</td><td>Linear regression</td><td>The average value</td></tr>
<tr><td>Yes or no</td><td>Preterm birth before 37 weeks</td><td>Logistic regression</td><td>The chance of yes</td></tr>
<tr><td>Categories with no order</td><td>Type of preterm birth: spontaneous labour, waters breaking early, or a planned early delivery</td><td>Polytomous logistic regression</td><td>The chance of each category</td></tr>
<tr><td>Categories in order</td><td>Term, moderately preterm, very preterm</td><td>Proportional odds model</td><td>The chance of each level or worse</td></tr>
<tr><td>Time until an event, with some women leaving early</td><td>Days from admission with early contractions to delivery</td><td>Cox regression</td><td>The chance the event has not yet happened by a chosen time</td></tr>
</table>
<p>Turning a measured outcome into yes/no throws information away. Statistically, a measured outcome gives more power than ordered categories, and ordered categories more than yes/no.</p>
<p>A polytomous model picks one category as the reference and gives each other category its own linear predictor. For three categories, with reference R:</p>
<div class="formula">P(A) = e<sup>lp<sub>A</sub></sup> ÷ (1 + e<sup>lp<sub>A</sub></sup> + e<sup>lp<sub>B</sub></sup>), and the same for B; P(R) = 1 − P(A) − P(B)</div>`,
      scenario: `<p>The team's statistician lists the outcomes the hospital records at each birth, and asks which model would suit each one.</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'The outcome type sets the default model; keep measured outcomes measured when you can, because cutting them into groups wastes information.'
    },
    {
      id: 'c2',
      title: 'From predictors to a risk',
      aim: 'calculate a risk from a logistic model and read its coefficients as odds ratios.',
      minutes: 15,
      need: `
<p>A straight line cannot be used for a chance, because it would go below 0% or above 100%. Logistic regression works on the <b>log-odds</b> instead, which can take any value:</p>
<div class="formula">log-odds = a + b<sub>1</sub>x<sub>1</sub> + b<sub>2</sub>x<sub>2</sub> + … = lp        risk = 1 ÷ (1 + e<sup>−lp</sup>)</div>
<ul>
<li><b>a</b>, the <b>intercept</b>, is the log-odds for a woman with every predictor at 0 (or at its reference value).</li>
<li>Each <b>b</b> is a <b>coefficient</b>: how much the log-odds go up for one unit of that predictor, with the others held the same.</li>
<li>e<sup>b</sup> is the <b>odds ratio</b>.</li>
</ul>
<p><b>Working it out.</b> Suppose the intercept is −3.60, a previous preterm birth adds 1.50 and a urine infection adds 0.90.</p>
<ul>
<li>A woman with neither: lp = −3.60, risk = 1 ÷ (1 + e<sup>3.60</sup>) = 1 ÷ 37.6 = 2.7%.</li>
<li>A woman with both: lp = −3.60 + 1.50 + 0.90 = −1.20, risk = 1 ÷ (1 + e<sup>1.20</sup>) = 1 ÷ 4.32 = 23.2%.</li>
</ul>
<p>The odds ratios are e<sup>1.50</sup> = 4.48 and e<sup>0.90</sup> = 2.46. Multiplying the <i>risk</i> by them (2.7% × 4.48 × 2.46 = 29.3%) gives the wrong answer: odds ratios multiply the odds. A lp of 0 means a risk of 50%; −4 means under 2%; +4 means over 98%.</p>
<div data-explainer="logodds"></div>`,
      scenario: `<p>The team has a first model from its pilot data. A midwife asks how to get a woman's risk from the coefficients printed in the report.</p>`,
      widgets: `<div data-widget="logisticCurve" data-try="Keep the coefficient at 0.3 and move the intercept from −4 to −1: the odds ratio stays the same while the risks change a lot."></div>`,
      tasks: [2, 3],
      takeaway: 'Add the coefficients to get the linear predictor, then convert it to a risk; the same odds ratio means very different changes in risk at different baseline risks.'
    },
    {
      id: 'c3',
      title: 'A bedside test in the same framework',
      aim: "see that Bayes' rule for a test is a logistic model with one predictor, and why multiplying linked tests misleads.",
      minutes: 15,
      need: `
<p>A test changes the chance of a condition. The change is summarised by the <b>likelihood ratio</b> (LR) of the result:</p>
<div class="formula">LR+ = sensitivity ÷ (1 − specificity)        LR− = (1 − sensitivity) ÷ specificity</div>
<div class="formula">odds after the test = odds before the test × LR</div>
<p>This is <b>Bayes' rule</b>. Written on the log-odds scale it is exactly a logistic model with one yes/no predictor: the intercept is the log-odds after a negative test, and the coefficient is ln(LR+ ÷ LR−). The odds ratio LR+ ÷ LR− belongs to the test; the intercept belongs to the setting, and changes when the condition is more or less common.</p>
<p><b>Several tests.</b> It is tempting to multiply the LRs of several findings one after another. This is <b>naive Bayes</b>, and it is right only if the findings are unrelated once we know who has the condition. Usually they are linked: a short cervix and a positive swab test often occur together, so the second adds less once the first is known. Multiplying counts the shared information twice. Risks come out too high for high-risk women and too low for low-risk women. A multivariable logistic model estimates the joint effects properly.</p>`,
      scenario: `<p>Women who come in with early contractions get a quick bedside test. It predicts whether they will deliver within 7 days. Other findings are known at the bedside too. A doctor suggests simply multiplying their published likelihood ratios.</p>`,
      widgets: `<div data-widget="bayes2x2" data-try="Set sensitivity 70%, specificity 90% and prevalence 17%, then drop prevalence to 5% and see which numbers change and which stay fixed."></div>`,
      tasks: [4, 5],
      takeaway: 'A test is a one-predictor logistic model; its odds ratio describes the test and its intercept describes the setting. Do not multiply the likelihood ratios of linked findings.'
    },
    {
      id: 'c4',
      title: 'Regression, a tree or a neural network?',
      aim: 'compare models by how well they fit, and choose a model type on sound principles.',
      minutes: 15,
      need: `
<p><b>How well does a model fit?</b> The <b>log-likelihood</b> (LL) adds up, over all women, the log of the chance the model gave to what really happened. A perfect model has LL = 0; real models have a negative LL, and closer to 0 is better. The <b>null model</b> gives every woman the average risk; its LL is LL<sub>0</sub>.</p>
<div class="formula">likelihood ratio (LR) statistic = −2 × (LL<sub>0</sub> − LL<sub>1</sub>)</div>
<p>The same statistic compares two models when one contains all the predictors of the other plus some more. It is checked against a χ² distribution with as many degrees of freedom as extra coefficients. Because the LR grows with the number of women, it is rescaled to a 0 to 100% measure, <b>Nagelkerke's R²</b>:</p>
<div class="formula">R² = (1 − e<sup>−LR/n</sup>) ÷ (1 − e<sup>2 LL<sub>0</sub>/n</sup>)</div>
<p><b>Other methods.</b> A <b>classification tree</b> splits women again and again at the cut-off that best separates outcomes. It cuts every measured predictor into groups, searches for cut-offs (which flatters it), assumes every split interacts with the ones before, and quickly runs out of women. A <b>neural network</b> is a flexible extension of logistic regression; it needs much more data and is hard to inspect.</p>
<p><b>How to choose:</b> the model must give risks between 0% and 100%, use the data efficiently, be robust rather than over-flexible, be transparent to its users, and fit what we know about the subject. Choose by how well it predicts for <i>new</i> women, not by how well it fits the data it was built on.</p>`,
      scenario: `<p>The team's pilot model has been fitted. A second group plans a preterm birth model with a tree and a neural network, and the research committee asks the team to comment on both.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'Use the likelihood ratio to compare models, but judge them by their predictions in new women; with typical medical data, regression is the sensible default.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'The outcome decides the model',
      html: `
<table class="data">
<tr><th>Outcome</th><th>Default model</th><th>Predicts</th></tr>
<tr><td>Continuous</td><td>Linear regression</td><td>Expected value</td></tr>
<tr><td>Binary</td><td>Logistic regression</td><td>Probability of the event</td></tr>
<tr><td>Unordered categorical</td><td>Polytomous (multinomial) logistic regression</td><td>Probability of each category</td></tr>
<tr><td>Ordered categorical</td><td>Proportional odds logistic regression</td><td>Probability of each level or worse</td></tr>
<tr><td>Time to event, censored</td><td>Cox proportional hazards regression</td><td>Survival probability at a chosen time</td></tr>
</table>
<p><b>Linear regression:</b> y = a + Σ b<sub>i</sub>x<sub>i</sub> + error, fitted by least squares, assuming normally distributed residuals with constant spread. R² = explained / total sum of squares. A better model gives a wider spread of predictions. Book example: costs of RSV hospitalisation in 3,458 children had an adjusted R² of only 8%, yet the predicted mean costs for groups were accurate enough for decision analysis. A <b>generalised additive model</b> replaces linear terms with smooth functions.</p>
<p class="src">Source: Ch. 4, §4.1; Ch. 6, §6.1</p>`
    },
    {
      id: 'n2',
      title: 'Logistic regression',
      html: `
<div class="formula">logit(P) = log(P / (1 − P)) = a + Σ b<sub>i</sub>x<sub>i</sub> = lp        P = 1 / (1 + e<sup>−lp</sup>)</div>
<p>b<sub>i</sub> is the change in log-odds per unit of x<sub>i</sub>, holding the others constant; e<sup>b<sub>i</sub></sup> is the odds ratio. With one predictor the coefficient is unadjusted; with several, adjusted. Centring continuous predictors makes the intercept refer to a typical patient. Coefficients are estimated by maximum likelihood; penalised estimation (Module 10) shrinks them deliberately.</p>
<p><b>In the course story.</b> Intercept −3.60, previous preterm birth 1.50, bacteriuria 0.90: risks 2.7% with neither and 23.2% with both. If the model also contains 0.45 × max(0, 11 − Hb), a haemoglobin of 9 g/dL adds 0.90, giving lp = −0.30 and a risk of 42.6%.</p>
<p class="src">Source: Ch. 4, §4.2</p>`
    },
    {
      id: 'n3',
      title: 'Likelihood, the LR test and R²',
      html: `
<div class="formula">LL = Σ [y log(p) + (1 − y) log(1 − p)]        LR = −2 (LL<sub>0</sub> − LL<sub>1</sub>)        R² = (1 − e<sup>−LR/n</sup>) / (1 − e<sup>2 LL<sub>0</sub>/n</sup>)</div>
<p>LL<sub>0</sub> uses the average risk for everyone. The LR follows a χ² distribution with df equal to the number of estimated coefficients, and compares any two nested models. It grows with n, so Nagelkerke's R² rescales it.</p>
<p>The <b>c statistic</b> is the probability that a random patient with the outcome has a higher predicted risk than a random patient without it (0.5 chance, 1 perfect); Module 11 treats it in detail.</p>
<div class="callout book"><b>Book example: simulated models at 50% incidence</b><p>R² and c of 87% and 0.98, 42% and 0.83, 16% and 0.70, 9% and 0.64, 4% and 0.60, 0% and 0.50. A c of 0.70, often called acceptable, goes with an R² of only about 16%.</p></div>
<p class="src">Source: Ch. 4, §4.2.1-4.2.2</p>`
    },
    {
      id: 'n4',
      title: "Bayes' rule and naive Bayes",
      html: `
<div class="formula">Odds(D | x) = Odds(D) × LR(x)        OR = LR+ / LR−        coefficient = ln LR+ − ln LR−</div>
<p>The logit form of Bayes' rule is a logistic model with one binary predictor, with the intercept equal to the log-odds after a negative test.</p>
<p><b>Naive Bayes</b> applies Bayes' rule sequentially, which equals a linear predictor built from univariate coefficients. It is valid only under conditional independence. Positively correlated findings are counted repeatedly, so predictions are too extreme, seen as a <b>calibration slope</b> below 1. A simple repair re-estimates one coefficient for the naive linear predictor: logit(y) = a + b<sub>cal</sub> × lp<sub>u</sub>. Multivariable logistic regression estimates joint effects correctly.</p>
<p class="src">Source: Ch. 4, §4.2.4-4.2.9</p>`
    },
    {
      id: 'n5',
      title: 'Neural networks and trees',
      html: `
<p>A <b>neural network</b> without a hidden layer is logistic regression; hidden layers add flexibility, but make prior knowledge hard to impose and the model hard to inspect, and training must be stopped early to limit overtraining.</p>
<p>A <b>tree</b> (recursive partitioning) splits patients at the best cut-off of the best predictor, repeatedly. Book example: in 429 GUSTO-I patients (24 deaths), an unpruned tree on age and Killip class was complex and counter-intuitive; the pruned tree had four nodes: Killip 3-4 (60% mortality); Killip 1-2 and age &lt;67.5 (2%); age ≥67.5 with Killip 1 (7%) or Killip 2 (30%). As a logistic model, this tree ignores age in Killip 3-4 and dichotomises it elsewhere.</p>
<div class="callout warn"><b>Why trees usually predict poorly in medical data</b><p>They categorise continuous predictors, search cut-points, assume interactions and cannot model main effects, select chance-inflated effects (testimation bias), and run out of patients quickly.</p></div>
<table class="data">
<tr><th>Model</th><th>Interactions</th><th>Linearity</th><th>Estimation</th></tr>
<tr><td>Logistic regression</td><td>Possible</td><td>Flexible</td><td>ML or penalised</td></tr>
<tr><td>Naive Bayes</td><td>No</td><td>Often categories</td><td>Univariate (+ calibration slope)</td></tr>
<tr><td>GAM</td><td>Possible</td><td>Highly flexible</td><td>Close to penalised ML</td></tr>
<tr><td>Neural network</td><td>Assumed</td><td>Highly flexible</td><td>Back-propagation, early stopping</td></tr>
<tr><td>Tree</td><td>Assumed</td><td>Categorisation</td><td>Splitting rules</td></tr>
</table>
<p class="src">Source: Ch. 4, §4.2.10-4.2.16, Table 4.4</p>`
    },
    {
      id: 'n6',
      title: 'Categorical, ordinal and survival outcomes',
      html: `
<p><b>Polytomous regression</b> fits j − 1 logistic submodels against a reference category. Book example: residual masses after chemotherapy for testicular cancer (1,094 patients: 39% benign, 49% teratoma, 12% cancer); a polytomous model and a sequence of binary models (14 parameters each) performed very similarly.</p>
<p><b>Proportional odds</b> uses one set of coefficients with an intercept per cut-point. Book example: Glasgow Outcome Scale in 2,159 patients, OR for age per decade 1.36, 1.47 and 1.45 for the three dichotomies and 1.43 in the proportional odds model.</p>
<p><b>Cox regression:</b> λ(t | X) = λ<sub>0</sub>(t) e<sup>lp</sup>, and S(t | X) = S<sub>0</sub>(t)<sup>e<sup>lp</sup></sup>; e<sup>b</sup> is a hazard ratio, assumed constant over follow-up. <b>In the course story:</b> if 85% of average women admitted with early contractions have not delivered by day 7, a woman with lp = 0.7 (hazard ratio 2.01) has S(7) = 0.85<sup>2.01</sup> = 0.72, so a 28% chance of delivering within 7 days. Kaplan-Meier describes survival by group; parametric models (Weibull and others) smooth the baseline hazard. Book example: nerve-function impairment after leprosy treatment, 2-year risks of 1.3%, 16% and 65% for 0, 1 or 2 unfavourable characteristics.</p>
<p class="src">Source: Ch. 4, §4.3-4.6</p>`
    },
    {
      id: 'n7',
      title: 'Choosing between models',
      html: `
<p>No model is true; the question is which predicts best for new patients. A significant violation of an assumption matters only if fixing it improves predictions. Principles: a reasonable mathematical form, efficient use of data, robustness over flexibility, transparency, and subject-matter knowledge and practicality.</p>
<div class="callout book"><b>Book evidence</b><ul>
<li>GUSTO-I (40,830 patients): LR χ² 2,099 for linear age, 2,112 with age², 2,122 with a 5-knot spline: linear age was reasonable.</li>
<li>1.2 million Medicare patients, 14 procedures: one age effect (OR 1.75 per decade) fitted well; procedure-specific effects added χ² 95 (0.6%), R² 5.62% to 5.66%, c unchanged at 0.683.</li>
<li>StatLog diabetes data (768 patients): error rates 0.223 logistic, 0.262 naive Bayes, 0.255 tree, 0.248 neural network.</li>
<li>GUSTO-I test set (13,610 patients): logistic with age and Killip c = 0.787; full logistic model about 0.82, not beaten; tree worst at 0.75.</li>
</ul></div>
<p>Many comparisons favoured modern methods only because the logistic comparator was built poorly. Medical data have a low signal-to-noise ratio and modest numbers of events, so regression is the appropriate default.</p>
<p class="src">Source: Ch. 6, §6.1-6.4</p>`
    }
  ],
  keyPoints: [
    'The outcome type sets the default model: linear, logistic, polytomous, proportional odds or Cox regression.',
    'Logistic regression models the log-odds as a linear predictor; P = 1/(1 + e^(−lp)); exp(β) is an odds ratio that multiplies odds, not risks.',
    "The LR statistic = −2(LL0 − LL1) tests a model or a block of predictors; Nagelkerke's R² rescales it to 0–100%.",
    "Bayes' rule in logit form is a one-predictor logistic model: intercept = log-odds after a negative test, coefficient = log(LR+/LR−).",
    'Naive Bayes ignores correlation between findings and gives over-extreme predictions (calibration slope below 1).',
    'Trees categorise continuous predictors, search for cut-points and assume interactions; they are data hungry and usually predict worse than regression.',
    'Choose a model with a reasonable form, efficient use of data, robustness, transparency and subject knowledge in mind.',
    'Empirical comparisons support regression as the default for clinical prediction because medical data have low signal-to-noise ratios.'
  ],
  quiz: [
    {
      q: 'A logistic model for preterm birth gives a linear predictor lp = 0 for a particular woman. What is her predicted risk?',
      options: ['0%', '1%', '50%', 'It cannot be determined without the intercept'],
      answer: 2,
      why: 'P = 1/(1 + e^0) = 1/2 = 50%. The lp already includes the intercept, so no further information is needed. The commonest error is to read lp = 0 as zero risk, confusing the log-odds scale with the probability scale.'
    },
    {
      q: 'In a preterm-birth model the coefficient for tobacco use is 0.60 and the baseline risk (no risk factors) is 5%. What is the predicted risk for a tobacco user who is otherwise at baseline?',
      options: ['8.7%', '9.1%', '5.6%', '3.0%'],
      answer: 0,
      why: 'Baseline odds = 0.05/0.95 = 0.0526; × e^0.60 (1.822) = 0.0959 odds; risk = 0.0959/1.0959 = 8.7%. Multiplying the risk by the OR (5% × 1.82 = 9.1%) is the common mistake: ORs multiply odds, not risks. 5.6% adds 0.6 percentage points, which confuses the coefficient with a risk difference.'
    },
    {
      q: 'A rapid test has sensitivity 90% and specificity 80%. In a single-predictor logistic model with the test as predictor, what is the odds ratio for a positive test?',
      options: ['4.5', '0.125', '7.2', '36'],
      answer: 3,
      why: 'LR+ = 0.9/0.2 = 4.5 and LR− = 0.1/0.8 = 0.125, so OR = LR+/LR− = 36 and the coefficient is log(36) = 3.58. Choosing 4.5 confuses the positive likelihood ratio with the odds ratio. The OR does not depend on prevalence; the intercept does.'
    },
    {
      q: 'A team combines the likelihood ratios of five linked risk factors for preterm birth by multiplying them (naive Bayes). What is the expected problem?',
      options: ['Predictions too close to the average risk (calibration slope above 1)', 'Predictions too extreme, with a calibration slope below 1', 'Discrimination cannot exceed c = 0.5', 'Calibration-in-the-large is necessarily wrong, but the slope is correct'],
      answer: 1,
      why: 'Positively correlated findings carry overlapping information; naive Bayes counts it repeatedly, so high predictions are too high and low ones too low, giving a calibration slope below 1. A recalibration coefficient for the naive linear predictor can correct this. Naive Bayes can still discriminate well, so option 3 is wrong.'
    },
    {
      q: 'Which statement about classification trees as prediction models is correct?',
      options: ['They estimate main effects first and add interactions only when supported by the data', 'They use continuous predictors fully and so lose no information', 'They assume interactions between predictors and categorise continuous predictors at searched cut-points', 'They are less data hungry than logistic regression because each split uses only one predictor'],
      answer: 2,
      why: 'Every split after the first is an interaction, main effects cannot be modelled, and continuous variables are dichotomised at data-searched cut-points; these steps waste information and inflate selected effects. Option 4 is a frequent misconception: branches run out of patients quickly, so trees are more data hungry.'
    },
    {
      q: 'In 1.2 million surgical patients, allowing a separate age effect for each of 14 procedures increased the model χ² by 95 and R² from 5.62% to 5.66%, with c unchanged at 0.683. What is the most appropriate conclusion?',
      options: ['A single age effect (about OR 1.75 per decade) is adequate for prediction', 'Procedure-specific age effects must be used because the χ² increase is highly significant', 'Age should be dropped because the c statistic did not change', 'The logistic model is invalid and a tree should be used'],
      answer: 0,
      why: 'With 1.2 million patients even trivial deviations are significant. The improvement was 0.6% of the total χ² and changed neither R² meaningfully nor c, so the simpler model predicts as well. Option 2 confuses statistical significance with predictive relevance.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Match each outcome to a model',
      level: 'Understand',
      scenario: `<p>The hospital records these outcomes:</p>
<ol type="i">
<li>Preterm birth before 37 weeks, yes or no.</li>
<li>Birth weight in grams.</li>
<li>Gestational age group: term, moderately preterm (32 to 36 weeks) or very preterm (before 32 weeks).</li>
<li>Type of preterm birth: spontaneous labour, waters breaking early, or a planned early delivery.</li>
<li>Days from admission with early contractions to delivery. Some women are transferred before they deliver.</li>
</ol>`,
      questions: [
        '<b>(a)</b> Name the usual regression model for each outcome, and say what it predicts.',
        '<b>(b)</b> Why can logistic regression not be used for (v)?',
        '<b>(c)</b> The team plans to analyse gestational age only as preterm yes/no. What is lost?'
      ],
      answer: `<p><b>(a)</b> (i) Logistic regression: the probability of preterm birth. (ii) Linear regression: the expected birth weight. (iii) Proportional odds model: the probability of each group or worse, since the groups are ordered. (iv) Polytomous logistic regression: the probability of each type, since the types have no order. (v) Cox regression: the probability of not yet having delivered by a chosen day.</p>
<p><b>(b)</b> Women who are transferred leave before their delivery is seen (they are <b>censored</b>). Logistic regression would have to drop them or treat them as not delivered, both wrong; Cox regression uses their follow-up up to transfer.</p>
<p><b>(c)</b> Information and power. A birth at 36 weeks and one at 28 weeks become the same "yes", and 37 and 41 weeks the same "no". Measured outcomes give more power than ordered groups, and ordered groups more than yes/no. Yes/no may still be the outcome used for decisions, but the loss should be a deliberate choice.</p>`
    },
    {
      id: 't1',
      title: 'Risks from a polytomous model',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A polytomous model uses term birth as the reference category. For one woman, the linear predictor is −2.0 for spontaneous preterm birth and −2.8 for a planned early delivery.</p>`,
      questions: [
        '<b>(a)</b> Calculate her probability of each of the three outcomes, and check that they add up to 100%.',
        '<b>(b)</b> What is her total probability of preterm birth?',
        '<b>(c)</b> For the ordered groups term, moderately preterm and very preterm, a proportional odds model would use one set of coefficients and two intercepts. What does it assume, and how could the assumption be checked?'
      ],
      answer: `<p><b>(a)</b> e<sup>−2.0</sup> = 0.135 and e<sup>−2.8</sup> = 0.061; denominator = 1 + 0.135 + 0.061 = 1.196. P(spontaneous) = 0.135 / 1.196 = 11.3%; P(planned) = 0.061 / 1.196 = 5.1%; P(term) = 1 / 1.196 = 83.6%. Total 100%.</p>
<p><b>(b)</b> 11.3% + 5.1% = 16.4%.</p>
<p><b>(c)</b> It assumes that each predictor has the same odds ratio whichever cut-point is used (term against any preterm, and very preterm against the rest). Check by fitting the two separate logistic models and comparing their odds ratios, as in the book's Glasgow Outcome Scale example (1.36, 1.47, 1.45 against 1.43 in the combined model), or with a score test.</p>`
    },
    {
      id: 't2',
      title: 'Calculate risks by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The pilot model has an intercept of −3.20, a coefficient of 1.40 for a previous preterm birth, 0.60 for tobacco use and 0.80 for chronic hypertension.</p>`,
      questions: [
        '<b>(a)</b> What is the risk for a woman with none of these?',
        '<b>(b)</b> Give the odds ratio for each predictor.',
        '<b>(c)</b> What is the risk for a woman with a previous preterm birth who uses tobacco? And if she also has chronic hypertension?',
        '<b>(d)</b> A colleague calculates (c) by multiplying the baseline risk by the two odds ratios. What does he get, and why is it wrong?'
      ],
      answer: `<p><b>(a)</b> lp = −3.20; risk = 1 / (1 + e<sup>3.20</sup>) = 1 / (1 + 24.5) = 3.9%.</p>
<p><b>(b)</b> e<sup>1.40</sup> = 4.06; e<sup>0.60</sup> = 1.82; e<sup>0.80</sup> = 2.23.</p>
<p><b>(c)</b> lp = −3.20 + 1.40 + 0.60 = −1.20; risk = 1 / (1 + e<sup>1.20</sup>) = 23.2%. With hypertension as well, lp = −0.40; risk = 1 / (1 + e<sup>0.40</sup>) = 1 / 2.49 = 40.1%.</p>
<p><b>(d)</b> 3.9% × 4.06 × 1.82 = 29.0%. Odds ratios multiply the odds, not the risk: baseline odds 0.0408 × 4.06 × 1.82 = 0.301, which is a risk of 0.301 / 1.301 = 23.2%. The error grows as risks get larger, and multiplying risks can even give values above 100%.</p>`
    },
    {
      id: 't3',
      title: 'Explore intercepts and coefficients',
      level: 'Understand',
      scenario: `<p>Use the logistic curve widget in this case.</p>`,
      questions: [
        '<b>(a)</b> Fix β = 0.3 and compare α = −4 and α = −1. What happens to the odds ratio per unit, and to the risks at x = 0, 5 and 10? Why does the same odds ratio give very different changes in risk?',
        '<b>(b)</b> Set β = 0 and then β = 1.5 (with α = −4). Describe the curve in each case, and link it to the fact that an lp of +4 means a risk above 98%.'
      ],
      answer: `<p><b>(a)</b> The odds ratio per unit stays e<sup>0.3</sup> = 1.35 whatever α is. With α = −4 the risks at x = 0, 5 and 10 are about 1.8%, 7.6% and 26.9%; with α = −1 they are about 26.9%, 62.2% and 88.1%. Going from x = 0 to 5 adds about 6 percentage points in the first case and about 35 in the second, for the same odds ratio. Because effects add on the log-odds scale, an odds ratio means a large change in risk only where the baseline risk is in the middle range. Patients and clinicians use the risks, not the coefficients.</p>
<p><b>(b)</b> With β = 0 the curve is flat at the baseline risk. With β = 1.5 it is a steep S-shape: once lp passes +4 (at about x = 5.3) the risk is above 98% and the curve flattens near 100%. Risks are bounded by 0% and 100%, which is why the log-odds scale is a reasonable mathematical form for a yes/no outcome.</p>`
    },
    {
      id: 't4',
      title: 'From a 2 × 2 table to a logistic model',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). Of 1,000 women admitted with early contractions, 17% deliver within 7 days. The bedside test has a sensitivity of 70% and a specificity of 90%.</p>`,
      questions: [
        '<b>(a)</b> Complete the 2 × 2 table (test positive or negative, against delivery within 7 days or not).',
        '<b>(b)</b> Calculate LR+, LR− and the chance of delivery within 7 days after a positive and after a negative test, using odds × LR. Check against the table.',
        '<b>(c)</b> Write the equivalent logistic model: the intercept, the coefficient for a positive test and the odds ratio.',
        '<b>(d)</b> In a unit where only 5% deliver within 7 days, which numbers in (b) and (c) change? What is the chance after a positive test there?'
      ],
      answer: `<p><b>(a)</b> Deliver within 7 days: 170 (119 positive, 51 negative). Do not: 830 (83 positive, 747 negative). Test positive 202; test negative 798.</p>
<p><b>(b)</b> LR+ = 0.70 / 0.10 = 7.0. LR− = 0.30 / 0.90 = 0.333. Odds before the test = 0.17 / 0.83 = 0.205. Positive: 0.205 × 7.0 = 1.434, chance 1.434 / 2.434 = 58.9% (table: 119 / 202). Negative: 0.205 × 0.333 = 0.068, chance 6.4% (51 / 798).</p>
<p><b>(c)</b> Intercept = log-odds after a negative test = ln(51 / 747) = −2.684. Coefficient = ln(119 / 83) − ln(51 / 747) = 0.360 + 2.684 = 3.045. Odds ratio = e<sup>3.045</sup> = 21.0 = LR+ / LR− = 7.0 / 0.333. Check: lp for a positive test = 0.360, chance 58.9%.</p>
<p><b>(d)</b> Sensitivity, specificity, both LRs, the coefficient and the odds ratio stay the same. Odds before the test become 0.05 / 0.95 = 0.0526, so the intercept becomes ln(0.0526 × 0.333) = −4.04, and the chance after a positive test is 0.0526 × 7 = 0.368 odds = 26.9% (after a negative test 1.7%). A change of setting shifts the intercept, which foreshadows calibration problems when a model is moved to a new setting.</p>`
    },
    {
      id: 't5',
      title: 'Why multiplying linked findings misleads',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). Among women with early contractions in another unit, 10% deliver within 7 days. Three bedside findings have published LR+ values: a short cervix 4, a positive swab test 3, and six or more contractions an hour 2. One woman has all three.</p>`,
      questions: [
        '<b>(a)</b> Use naive Bayes (multiply the LRs) to work out her chance of delivery within 7 days.',
        '<b>(b)</b> A multivariable logistic model in a large cohort finds that the three findings together multiply the odds by 9, not 24. What is her chance by this model? Why is it lower?',
        '<b>(c)</b> If naive Bayes were used for every woman, what would a calibration plot show, and what would the calibration slope be?',
        '<b>(d)</b> Suggest a simple repair if naive Bayes must be used.'
      ],
      answer: `<p><b>(a)</b> Odds before = 0.10 / 0.90 = 0.111. × 4 × 3 × 2 = 24 gives odds 2.67, a chance of 2.67 / 3.67 = 72.7%.</p>
<p><b>(b)</b> 0.111 × 9 = 1.0 odds, a chance of 50%. The findings are linked: a short cervix and a positive swab often occur together, so once one is known the other adds less. Naive Bayes counts the shared information more than once.</p>
<p><b>(c)</b> Predictions are too extreme in both directions: too high for women at high risk and too low for women at low risk. The calibration slope is below 1.</p>
<p><b>(d)</b> Re-estimate one coefficient for the naive linear predictor in local data: logit(y) = a + b<sub>cal</sub> × lp<sub>naive</sub>, with b<sub>cal</sub> below 1. Better still, fit a multivariable logistic model with the findings together.</p>`
    },
    {
      id: 't6',
      title: 'Compare two models with the likelihood ratio',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The team fits its model to 2,000 women with 240 preterm births. The model's likelihood ratio statistic is 180 on 10 df. Adding cervical length (2 coefficients) raises it to 196 on 12 df.</p>`,
      questions: [
        '<b>(a)</b> Calculate LL<sub>0</sub> for the null model and Nagelkerke\'s R² for the first model.',
        '<b>(b)</b> Test whether cervical length adds to the model. (For 2 df, p = e<sup>−LR/2</sup>.)',
        '<b>(c)</b> Calculate R² for the larger model. Is a significant test enough reason to add cervical length to a booking-visit model?'
      ],
      answer: `<p><b>(a)</b> LL<sub>0</sub> = 240 ln(0.12) + 1,760 ln(0.88) = 240 × (−2.120) + 1,760 × (−0.128) = −733.85. R² = (1 − e<sup>−180/2000</sup>) / (1 − e<sup>−1467.7/2000</sup>) = 0.0861 / 0.5199 = 16.6%.</p>
<p><b>(b)</b> LR = 196 − 180 = 16 on 2 df; p = e<sup>−8</sup> = 0.0003. Cervical length adds significantly.</p>
<p><b>(c)</b> R² = (1 − e<sup>−196/2000</sup>) / 0.5199 = 0.0934 / 0.5199 = 18.0%, a modest gain. Significance alone is not enough. The question is whether predictions for new women improve, and whether the predictor is available at the moment of prediction: cervical length needs an ultrasound scan that may not be done in every woman at booking. The cost and availability of the measurement must be weighed against the gain.</p>`
    },
    {
      id: 't7',
      title: 'Critique a plan for a tree and a neural network',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). Another group plans a preterm birth model from 450 women, 55 of whom delivered early, with 25 candidate predictors. Their protocol says:</p>
<ol>
<li>"We will fit a classification tree because it mimics how obstetricians think and finds the optimal cut-offs automatically."</li>
<li>"We will also train a neural network with two hidden layers, since neural networks work like the brain and are more accurate."</li>
<li>"We will multiply the published likelihood ratios of the 25 risk factors (naive Bayes)."</li>
<li>"Logistic regression is not suitable because the risk is higher in both young and older mothers, and logistic regression assumes a straight line."</li>
<li>"The best method will be the one with the highest c statistic in our 450 women."</li>
</ol>`,
      questions: [
        '<b>(a)</b> Comment on each statement in turn.',
        '<b>(b)</b> Propose a default approach, and say how you would compare it with any alternative.'
      ],
      answer: `<p><b>(a)</b></p>
<ol>
<li><b>Tree.</b> Looking like clinical reasoning does not make a tree a good predictor. Searching for "optimal" cut-offs is dangerous, cutting predictors into groups loses information, every split assumes an interaction, and with 55 events the branches will run out of women within two or three splits. Expect an unstable tree that predicts poorly in new women.</li>
<li><b>Neural network.</b> A network is a flexible extension of logistic regression, not a model of the brain. Two hidden layers with 25 inputs spend many parameters on 55 events, so overtraining is likely; prior knowledge is hard to build in and the model is hard to inspect. In large comparisons (GUSTO-I, StatLog) networks did no better than a well-built logistic model except in large data sets.</li>
<li><b>Naive Bayes.</b> The risk factors are linked (previous preterm birth, short cervix, positive swab), so multiplying their likelihood ratios counts shared information again and again. Predictions will be too extreme (calibration slope below 1). Published likelihood ratios from other settings may also not apply here.</li>
<li><b>Straight line.</b> Logistic regression is a straight line in its coefficients, not necessarily in the predictor. A U-shaped age effect can be coded, for example with a squared term or a spline. This is a coding question (Module 6), not a reason to abandon regression.</li>
<li><b>Choosing by apparent c.</b> The c in the development data is optimistic, most of all for the most flexible method, so this rule rewards overfitting. Methods must be compared on new women or with internal validation that repeats the whole modelling process (Module 13).</li>
</ol>
<p><b>(b)</b> Logistic regression with a small set of predictors chosen on clinical grounds (55 events cannot support 25 candidates), measured predictors kept measured with sensible coding, and attention to calibration as well as discrimination. Develop any alternative with equal care and compare them on validated, not apparent, calibration and discrimination, with transparency for users as a further criterion.</p>`
    }
  ]
});
