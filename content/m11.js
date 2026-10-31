registerModule({
  id: 'm11',
  num: 11,
  part: 'Validation',
  title: 'Performance: overall, discrimination and calibration',
  book: 'Ch. 15',
  minutes: 75,
  summary: 'How to quantify how good predicted risks are: overall measures (R², Brier and scaled Brier), discrimination (c statistic, ROC curve, discrimination slope, Lorenz curve) and calibration (calibration plot, calibration-in-the-large, calibration slope and tests).',
  objectives: [
    'Calculate Brier and scaled Brier scores',
    'Calculate a c statistic from pairs',
    'Read ROC curves and discrimination slopes',
    'Estimate calibration-in-the-large and calibration slope',
    'Judge the Hosmer-Lemeshow test critically',
    'Relate calibration, discrimination and overall measures'
  ],
  format: 'cases',
  reading: [
    { cite: "Steyerberg EW, Vickers AJ, Cook NR, et al. (2010). Assessing the performance of prediction models: a framework for traditional and novel measures. Epidemiology 21:128-138.", url: "https://doi.org/10.1097/EDE.0b013e3181c30fb2", note: "The standard overview of calibration, discrimination, Brier score, R-squared, reclassification and net benefit in one framework." },
    { cite: "Van Calster B, McLernon DJ, van Smeden M, et al. (2019). Calibration: the Achilles heel of predictive analytics. BMC Medicine 17:230.", url: "https://doi.org/10.1186/s12916-019-1466-7", note: "Explains why calibration matters, the levels of calibration, and how to draw and interpret flexible calibration curves." },
    { cite: "Van Calster B, Nieboer D, Vergouwe Y, et al. (2016). A calibration hierarchy for risk models was defined: from utopia to empirical data. Journal of Clinical Epidemiology 74:167-176.", url: "https://doi.org/10.1016/j.jclinepi.2015.12.005", note: "Sets out mean, weak, moderate and strong calibration, which gives learners precise language for calibration slope, intercept and curves." },
    { cite: "Alba AC, Agoritsas T, Walsh M, et al. (2017). Discrimination and calibration of clinical prediction models: users' guides to the medical literature. JAMA 318:1377-1384.", url: "https://doi.org/10.1001/jama.2017.12126", note: "A clinician-oriented guide to reading the c statistic and calibration plots in a published model." },
    { cite: "Collins GS, Dhiman P, Ma J, et al. (2024). Evaluation of clinical prediction models (part 1): from development to external validation. BMJ 384:e074819.", url: "https://doi.org/10.1136/bmj-2023-074819", note: "First of the 2024 BMJ series; sets out how performance is evaluated across development, internal validation and external validation." }
  ],
  essentials: `
<ul>
<li>A model gives each woman an absolute risk. Performance asks how good those risks are. It can be measured in the development data (<b>apparent</b>, too optimistic), after correction for optimism (<b>internal validation</b>), or in new women (<b>external validation</b>).</li>
<li><b>Overall performance</b> measures the distance between predictions and outcomes. The <b>Brier score</b> is the mean of (outcome − predicted risk)². Its worst sensible value depends on the incidence, so compare settings with the <b>scaled Brier score</b>. Nagelkerke R² does a similar job on the log scale.</li>
<li><b>Discrimination</b>: do women who deliver early get higher predictions? The <b>c statistic</b> is the share of pairs (one preterm, one term woman) in which the preterm woman has the higher prediction. It equals the area under the <b>ROC curve</b> and does not depend on the incidence.</li>
<li>The <b>discrimination slope</b> (mean prediction in women with the outcome minus mean in women without) and the Lorenz curve are easy to explain but depend on the incidence.</li>
<li><b>Calibration</b>: do predicted risks match observed frequencies? Show a calibration plot, and estimate <b>calibration-in-the-large</b> (is the average right?) and the <b>calibration slope</b> (is the spread right?). A slope below 1 means predictions are too extreme.</li>
<li>The Hosmer-Lemeshow test has low power, and a p-value is not a measure of calibration. Report the sizes of the miscalibration with the plot.</li>
<li>Calibration and discrimination are different. A shift in average risk leaves c unchanged; overfitting harms both. Report both at every validation.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has finished its booking-visit model. In this module it measures how good the model\'s risks are: how close they are to what happened, whether they rank women correctly, and whether they are right on average and in their spread, first in its own women and then at a tertiary referral hospital. You do not need the earlier modules for this story.',
  defs: {
    'brier score': 'The average of the squared differences between each woman\'s outcome (0 or 1) and her predicted risk; lower is better.',
    'scaled brier score': 'The Brier score compared with its worst sensible value at that incidence, from 0% (no information) to 100% (perfect).',
    'c statistic': 'The chance that, of one woman with the outcome and one without, the woman with the outcome has the higher prediction.',
    'roc curve': 'A plot of sensitivity against 1 minus specificity for every possible cut-off of the predicted risk.',
    'discrimination slope': 'The mean predicted risk in women with the outcome minus the mean in women without it.',
    'calibration': 'How well predicted risks agree with the observed share of women who have the outcome.',
    'calibration-in-the-large': 'Whether the average predicted risk equals the observed incidence, estimated on the log-odds scale.',
    'calibration slope': 'The slope of a regression of the outcome on the model\'s linear predictor in new data; 1 is ideal, below 1 means too extreme.',
    'offset': 'A term in a regression model whose coefficient is fixed at 1 instead of being estimated.',
    'hosmer-lemeshow test': 'A test comparing observed and expected numbers of events in groups of predicted risk, usually ten groups.'
  },
  explainers: [
    {
      id: 'pairs',
      title: 'The c statistic as a contest between pairs',
      scenes: [
        { svg: EX.svg((function () {
            var X = function (v) { return 90 + v / 0.65 * 430; }, ev = [0.12, 0.30, 0.60], ne = [0.05, 0.08, 0.10, 0.15, 0.20, 0.25, 0.45], s = '';
            s += EX.text(40, 34, 'Ten women and their predicted risks', { size: 'm', bold: true });
            s += EX.text(40, 114, 'Preterm', { size: 's' }) + EX.text(40, 204, 'Term', { size: 's' });
            s += '<line x1="90" x2="520" y1="250" y2="250" stroke="var(--muted)"/>';
            [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].forEach(function (v) { s += EX.text(X(v), 270, Math.round(v * 100) + '%', { size: 's', anchor: 'middle' }); });
            ev.forEach(function (v, i) { s += '<circle cx="' + X(v).toFixed(1) + '" cy="110" r="7" class="ex-in fobs"' + EX.st(0.4 + 0.2 * i) + '/>'; });
            ne.forEach(function (v, i) { s += '<circle cx="' + X(v).toFixed(1) + '" cy="200" r="7" class="ex-in fmuted"' + EX.st(1.2 + 0.15 * i) + '/>'; });
            return s;
          })()),
          say: 'Here are ten women with their predicted risks. Three delivered preterm, shown on the top row, at 12, 30 and 60 per cent. Seven delivered at term, on the bottom row.' },
        { svg: EX.svg((function () {
            var X = function (v) { return 90 + v / 0.65 * 430; }, ne = [0.05, 0.08, 0.10, 0.15, 0.20, 0.25, 0.45], s = '';
            s += EX.text(40, 34, 'The 12% woman against each term woman: 3 of 7 won', { size: 'm', bold: true });
            s += EX.text(40, 114, 'Preterm', { size: 's' }) + EX.text(40, 204, 'Term', { size: 's' });
            ne.forEach(function (v, i) { var win = v < 0.12; s += '<line x1="' + X(0.12).toFixed(1) + '" y1="110" x2="' + X(v).toFixed(1) + '" y2="200" stroke-width="2" class="' + (win ? 'obs' : 'err') + ' ex-in"' + EX.st(0.5 + 0.25 * i) + '/>'; });
            [0.12, 0.30, 0.60].forEach(function (v) { s += '<circle cx="' + X(v).toFixed(1) + '" cy="110" r="7" class="fobs"/>'; });
            ne.forEach(function (v) { s += '<circle cx="' + X(v).toFixed(1) + '" cy="200" r="7" class="fmuted"/>'; });
            s += EX.text(40, 260, 'Solid line: preterm woman higher (concordant). Red: lower.', { size: 's', d: 2.4 });
            return s;
          })()),
          say: 'Pair the woman at 12 per cent with each term woman. She has the higher risk in 3 of the 7 pairs. Those pairs are concordant. In the 4 red pairs the term woman was given the higher risk.' },
        { svg: EX.svg(EX.text(280, 70, 'All 3 × 7 = 21 pairs', { size: 'l', bold: true, anchor: 'middle' }) +
            EX.text(280, 115, '12% beats 3 of 7', { anchor: 'middle', d: 0.4 }) +
            EX.text(280, 140, '30% beats 6 of 7', { anchor: 'middle', d: 0.8 }) +
            EX.text(280, 165, '60% beats 7 of 7', { anchor: 'middle', d: 1.2 }) +
            EX.text(280, 210, 'c = (3 + 6 + 7) ÷ 21 = 16 ÷ 21 = 0.76', { size: 'l', bold: true, anchor: 'middle', d: 1.8 }) +
            EX.text(280, 245, 'Ties count one half. Chance gives 0.5; perfect ranking gives 1.', { size: 's', anchor: 'middle', d: 2.4 })),
          say: 'Do this for all 21 pairs. The 30 per cent woman wins 6, and the 60 per cent woman wins all 7. That is 16 wins out of 21, so the c statistic is 0.76. A coin toss would give 0.5.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 150, t: 30, w: 230, h: 210, xlim: [0, 1], ylim: [0, 1], xticks: [0, 0.5, 1], yticks: [0.5, 1], xlabel: '1 − specificity', ylabel: 'Sensitivity' });
            var st = [[0, 0], [0, 1 / 3], [1 / 7, 1 / 3], [1 / 7, 2 / 3], [4 / 7, 2 / 3], [4 / 7, 1], [1, 1]];
            return B.s + EX.line([[B.X(0), B.Y(0)], [B.X(1), B.Y(1)]], { role: 'pred', draw: false }) +
              EX.line(st.map(function (p) { return [B.X(p[0]), B.Y(p[1])]; }), { role: 'obs', d: 0.4, t: 3 }) +
              EX.text(400, 120, 'Lower the cut-off', { size: 's', d: 0.4 }) + EX.text(400, 140, 'one woman at a time', { size: 's', d: 0.4 }) +
              EX.text(400, 190, 'Area under curve', { size: 's', d: 3.2 }) + EX.text(400, 210, '= 16 ÷ 21 = 0.76', { size: 's', bold: true, d: 3.2 });
          })()),
          say: 'Now slide a cut-off down from the top risk to the bottom. Each preterm woman passed moves the curve up; each term woman moves it right. This is the R O C curve, and the area under it is the same 0.76.' },
        { svg: EX.svg((function () {
            var X = function (v) { return 90 + v / 0.8 * 430; }, ev = [0.12, 0.30, 0.60], ne = [0.05, 0.08, 0.10, 0.15, 0.20, 0.25, 0.45], s = '';
            var up = function (p) { var l = Math.log(p / (1 - p)) + 0.5; return 1 / (1 + Math.exp(-l)); };
            s += EX.text(40, 34, 'Add 0.5 to every log-odds: the order is the same', { size: 'm', bold: true });
            ev.forEach(function (v) { s += '<circle cx="' + X(v).toFixed(1) + '" cy="100" r="6" class="fline"/><circle cx="' + X(up(v)).toFixed(1) + '" cy="100" r="7" class="ex-in fobs"' + EX.st(0.8) + '/>'; });
            ne.forEach(function (v) { s += '<circle cx="' + X(v).toFixed(1) + '" cy="180" r="6" class="fline"/><circle cx="' + X(up(v)).toFixed(1) + '" cy="180" r="7" class="ex-in fmuted"' + EX.st(0.8) + '/>'; });
            s += EX.text(280, 240, 'c is still 0.76; the average risk is now too high.', { anchor: 'middle', bold: true, d: 1.6 });
            s += EX.text(280, 265, 'c says nothing about calibration.', { anchor: 'middle', d: 2.2 });
            return s;
          })()),
          say: 'If every risk is pushed up by the same amount on the log-odds scale, every woman moves right but the order does not change. The c statistic stays at 0.76, even though the risks are now too high. C says nothing about calibration.' }
      ]
    },
    {
      id: 'calib',
      title: 'Reading a calibration plot',
      scenes: [
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 420, h: 190, xlim: [0, 0.5], ylim: [0, 0.5], xticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yticks: [0.1, 0.2, 0.3, 0.4, 0.5], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk', ylabel: 'Observed risk' });
            return EX.text(80, 26, 'Perfect calibration: observed equals predicted', { size: 'm', bold: true }) + B.s +
              EX.curve(B, function (p) { return p; }, 0.02, 0.5, { role: 'pred', d: 0.3 }) +
              EX.curve(B, function (p) { return p; }, 0.02, 0.5, { role: 'obs', d: 1.2, w: 1.5 });
          })()),
          say: 'A calibration plot puts the predicted risk across and the observed risk up. The dashed line is what the model promises. If, of 100 women given 20 per cent, 20 deliver early, the observed line lies on it.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 420, h: 190, xlim: [0, 0.5], ylim: [0, 0.5], xticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yticks: [0.1, 0.2, 0.3, 0.4, 0.5], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk', ylabel: 'Observed risk' });
            var f = function (p) { var l = 0.4 + Math.log(p / (1 - p)); return 1 / (1 + Math.exp(-l)); };
            return EX.text(80, 26, 'Shift: observed above predicted everywhere', { size: 'm', bold: true }) + B.s +
              EX.curve(B, function (p) { return p; }, 0.02, 0.5, { role: 'pred', draw: false }) +
              EX.curve(B, f, 0.02, 0.38, { role: 'obs', d: 0.3 }) +
              EX.gaps(B, [[0.05, 0.05, f(0.05)], [0.12, 0.12, f(0.12)], [0.25, 0.25, f(0.25)], [0.35, 0.35, f(0.35)]], { d: 1.4 }) +
              EX.text(250, 214, 'calibration-in-the-large a > 0', { size: 's', d: 1.8 });
          })()),
          say: 'At the referral hospital the observed line lies above the dashed line everywhere. Women given 12 per cent have about 17 per cent. The model underestimates risk on average. Calibration-in-the-large is above zero.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 420, h: 190, xlim: [0, 0.5], ylim: [0, 0.5], xticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yticks: [0.1, 0.2, 0.3, 0.4, 0.5], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk', ylabel: 'Observed risk' });
            var f = function (p) { var l = -0.6 + 0.7 * Math.log(p / (1 - p)); return 1 / (1 + Math.exp(-l)); };
            return EX.text(80, 26, 'Slope below 1: predictions too extreme', { size: 'm', bold: true }) + B.s +
              EX.curve(B, function (p) { return p; }, 0.02, 0.5, { role: 'pred', draw: false }) +
              EX.curve(B, f, 0.02, 0.5, { role: 'obs', d: 0.3 }) +
              EX.gaps(B, [[0.03, 0.03, f(0.03)], [0.40, 0.40, f(0.40)], [0.48, 0.48, f(0.48)]], { d: 1.4 }) +
              EX.text(250, 214, 'calibration slope b about 0.7', { size: 's', d: 1.8 });
          })()),
          say: 'Here the observed line is flatter and crosses the dashed line near the average. High predictions are too high and low ones too low. The calibration slope is below 1, here about 0.7, the usual sign of overfitting.' },
        { svg: EX.svg(EX.text(280, 60, 'Both come from one regression in the new women', { size: 'm', bold: true, anchor: 'middle' }) +
            EX.text(280, 110, 'logit(observed) = a + b × lp', { size: 'l', anchor: 'middle', d: 0.6 }) +
            EX.text(280, 150, 'b is the calibration slope (1 is ideal)', { anchor: 'middle', d: 1.2 }) +
            EX.text(280, 180, 'a with b fixed at 1 (lp as offset): calibration-in-the-large', { anchor: 'middle', d: 1.8 }) +
            EX.text(280, 220, 'a above 0: risks too low on average; below 0: too high', { size: 's', anchor: 'middle', d: 2.4 })),
          say: 'Both numbers come from one regression in the new women: the observed log-odds on the model\'s linear predictor. The slope b is the calibration slope. With the slope fixed at 1, the intercept a is calibration-in-the-large.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 420, h: 190, xlim: [0, 0.5], ylim: [0, 0.5], xticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yticks: [0.1, 0.2, 0.3, 0.4, 0.5], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk', ylabel: 'Observed risk' });
            var g = [[0.04, 0.0], [0.06, 0.10], [0.08, 0.05], [0.10, 0.15], [0.12, 0.05], [0.14, 0.20], [0.17, 0.10], [0.21, 0.30], [0.27, 0.15], [0.38, 0.45]];
            return EX.text(80, 26, 'A small sample: 10 groups of 20 women', { size: 'm', bold: true }) + B.s +
              EX.curve(B, function (p) { return p; }, 0.02, 0.5, { role: 'pred', draw: false }) +
              EX.pts(B, g, { role: 'obs', d: 0.4, stagger: 0.12 }) +
              EX.text(250, 214, 'too noisy to judge; a p-value will not help', { size: 's', d: 1.8 });
          })()),
          say: 'With only 200 women, the ten group points jump around the line by chance. A test will rarely reject good calibration in a sample like this. So report the size of a and b with confidence intervals, not just a p-value.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'How close are the predictions to what happened?',
      aim: 'calculate the Brier and scaled Brier scores and see why the raw Brier score depends on the incidence.',
      minutes: 15,
      need: `
<p>The model gives each woman a risk p; her outcome y is 1 (preterm) or 0 (term). An <b>overall</b> measure asks how far p is from y, on average. Performance can be measured in the development women (<b>apparent</b>, which is optimistic), after correcting for optimism, for example by the bootstrap (<b>internal validation</b>), or in new women (<b>external validation</b>).</p>
<p><b>The Brier score</b> is the mean squared difference:</p>
<div class="formula">Brier = (1 ÷ n) × Σ (y − p)²</div>
<p>A prediction of 50% scores 0.25 whatever happens. A model that gives every woman the average risk p̄ scores p̄ × (1 − p̄), the worst sensible value, called Brier<sub>max</sub>. Because this depends on the incidence, use the <b>scaled Brier score</b> = 1 − Brier ÷ Brier<sub>max</sub>, from 0% to 100%.</p>
<p><b>Worked example.</b> Ten women are given risks of 5, 8, 10, 12, 15, 20, 25, 30, 45 and 60%. The women given 12, 30 and 60% deliver early (3 in 10). The squared errors are 0.0025, 0.0064, 0.0100, 0.7744, 0.0225, 0.0400, 0.0625, 0.4900, 0.2025 and 0.1600, a sum of 1.7708. Brier = 1.7708 ÷ 10 = 0.177. Brier<sub>max</sub> = 0.3 × 0.7 = 0.210. Scaled Brier = 1 − 0.177 ÷ 0.210 = 15.7%.</p>
<p><b>Nagelkerke R²</b> uses the log-likelihood instead, scoring each woman by log(p) or log(1 − p), and rescales it to run from 0% to 100%. It punishes confident mistakes hard: a risk of 1% for a woman who then delivers early costs log(0.01) = −4.6.</p>`,
      scenario: `<p>The team starts with the simplest question: how close are its predicted risks to the outcomes? It also has the Brier scores of a published model from two hospitals with very different rates of preterm birth.</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'The Brier score measures distance between predictions and outcomes, but its scale depends on the incidence; compare settings with the scaled Brier score.'
    },
    {
      id: 'c2',
      title: 'Does the model rank the women correctly?',
      aim: 'calculate the c statistic from pairs, read an ROC curve and calculate a discrimination slope.',
      minutes: 20,
      need: `
<p><b>Discrimination</b> asks whether women who deliver early get higher predictions than women who do not.</p>
<p><b>At one cut-off.</b> Call a woman "high risk" if her prediction is at or above a cut-off. Sensitivity is the share of preterm women called high risk; specificity is the share of term women called low risk. Raising the cut-off raises specificity and lowers sensitivity.</p>
<p><b>The ROC curve</b> plots sensitivity against 1 − specificity for every cut-off. A useless model follows the diagonal; a better one bends towards the top left.</p>
<p><b>The c statistic</b> is the area under the ROC curve. Take every pair of one preterm and one term woman: c is the share of pairs in which the preterm woman has the higher prediction, with ties counting one half.</p>
<div class="formula">c = (concordant pairs + ½ × tied pairs) ÷ (N<sub>preterm</sub> × N<sub>term</sub>)</div>
<p><b>Worked example.</b> In the ten women, there are 3 × 7 = 21 pairs. The 12% woman is higher than 3 term women, the 30% woman than 6, the 60% woman than all 7. c = 16 ÷ 21 = 0.76.</p>
<p>c uses only the order of the predictions, so it does not depend on the incidence, and a shift of all risks leaves it unchanged.</p>
<p><b>The discrimination slope</b> is the mean prediction in preterm women minus the mean in term women: (0.12 + 0.30 + 0.60) ÷ 3 − 1.28 ÷ 7 = 0.340 − 0.183 = 0.157. It is easy to explain, but it falls when the outcome is rarer. The appearance of a Lorenz curve (the share of outcomes missed against the share of women called low risk) also depends on the incidence: at the same c it looks more impressive for a rarer outcome.</p>
<div data-explainer="pairs"></div>`,
      scenario: `<p>The team wants one number for how well the model separates women who deliver early from those who do not. It also wants to see what it gains and loses at each possible cut-off for referral.</p>`,
      widgets: `<div data-widget="rocExplorer" data-try="Keep the incidence at 12% and move c from 0.60 to 0.90; watch the two risk curves separate and the ROC curve bend towards the top left."></div>`,
      tasks: [2, 3],
      takeaway: 'The c statistic is the chance that a preterm woman outranks a term woman; it ignores the incidence and the calibration, unlike the discrimination slope.'
    },
    {
      id: 'c3',
      title: 'Are the risks right on average and in their spread?',
      aim: 'estimate and interpret calibration-in-the-large and the calibration slope.',
      minutes: 20,
      need: `
<p><b>Calibration</b> is agreement between predicted and observed risks: of 100 women each given 20%, about 20 should deliver early.</p>
<p><b>The calibration plot</b> shows predicted risk across and observed risk up, with the 45° line as the ideal. Observed risks are estimated in groups (for example tenths of predicted risk) or by a smooth curve. Adding the distribution of predictions turns it into a validation plot.</p>
<p><b>Calibration-in-the-large</b> compares the mean predicted risk with the observed incidence. In the development data it is right by construction; it is informative only in new women. A quick version is an odds ratio.</p>
<p><b>Worked example.</b> At a referral hospital the model's mean predicted risk is 12% and the observed incidence is 17%. OR = (0.12 ÷ 0.88) ÷ (0.17 ÷ 0.83) = 0.136 ÷ 0.205 = 0.67: the model underestimates the odds by about a third. On the log-odds scale the gap is logit(0.17) − logit(0.12) = −1.586 − (−1.992) = 0.41.</p>
<p>Formally, regress the outcome on the model's linear predictor (lp):</p>
<div class="formula">logit(P(preterm)) = a + b × lp</div>
<ul>
<li>With lp as an <b>offset</b> (b fixed at 1), a is calibration-in-the-large: above 0, risks are too low; below 0, too high.</li>
<li>With b free, b is the <b>calibration slope</b>. It is 1 in the development data. At internal validation, b below 1 shows overfitting and equals the shrinkage needed. At external validation it also reflects real differences in predictor effects. Below 1, predictions are too extreme; above 1, too modest.</li>
</ul>
<div data-explainer="calib"></div>`,
      scenario: `<p>Illustrative (synthetic). The team applies its model, unchanged, to the women of the tertiary referral hospital. In the synthetic data, preterm birth is more common there and the predictor effects are 20% weaker.</p>`,
      widgets: `<div data-widget="calibrationLab" data-try="Set the true calibration slope to 1, then move the intercept shift from 0 to +1.0 and watch the whole curve rise above the dashed line while c stays about the same."></div>`,
      tasks: [4, 5],
      takeaway: 'Calibration-in-the-large asks whether the average is right and the calibration slope whether the spread is right; both come from regressing the outcome on the linear predictor.'
    },
    {
      id: 'c4',
      title: 'Testing calibration and reporting a validation',
      aim: 'judge calibration tests critically and relate calibration, discrimination and overall measures in a validation report.',
      minutes: 15,
      need: `
<p><b>Tests.</b> Each part of the recalibration model can be tested: a = 0 with b fixed at 1 (calibration-in-the-large, 1 df), b = 1 (slope, 1 df), or both together (the recalibration test, 2 df). The 2-df test targets the two commonest problems, a shift in average risk and overfitted effects, and its parts are easy to interpret.</p>
<p><b>The Hosmer-Lemeshow test</b> groups women into tenths of predicted risk and compares the expected number of events (the sum of the predictions) with the observed number in each group, by a χ² test with 8 df at development and 9 df at external validation. Its problems:</p>
<ul>
<li>the grouping is arbitrary;</li>
<li>it has low power against a shift or overfitting;</li>
<li>in the development data a non-significant result is expected, because the model was fitted to those women, so it has no scientific meaning there.</li>
</ul>
<p>A p-value is not a measure of calibration. In 300 women with 18 events, serious miscalibration is rarely "significant"; in 50,000 women, trivial miscalibration is. Report a and b with confidence intervals and the plot.</p>
<p><b>How the measures relate.</b> A shift in average risk changes calibration-in-the-large but not c. An overfitted model has a slope below 1 and also loses discrimination in new women. A model can be well calibrated but discriminate poorly, if all its predictions lie close to the average. So a fall in c at validation can mean overfitting, or simply a more uniform group of women. Overall measures (R², Brier) mix calibration and discrimination, so they hide which one is at fault.</p>`,
      scenario: `<p>The research committee sends the team a published validation of a preterm birth model to review. The team is also writing up its own validation at the referral hospital.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'Report the size of the miscalibration (a and b with the plot) together with c and the scaled Brier score; a non-significant Hosmer-Lemeshow test does not show good calibration.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Aspects of performance',
      html: `
<table class="data">
<tr><th>Aspect</th><th>Question</th><th>Measures</th></tr>
<tr><td>Overall</td><td>How close are predictions to outcomes?</td><td>Nagelkerke R², Brier, scaled Brier</td></tr>
<tr><td>Discrimination</td><td>Do patients with the outcome get higher predictions?</td><td>c statistic (ROC area), discrimination slope, Lorenz curve</td></tr>
<tr><td>Calibration</td><td>Do predictions agree with observed frequencies?</td><td>Calibration plot, calibration-in-the-large, calibration slope</td></tr>
</table>
<p>Each can be estimated as apparent, internally validated (for example bootstrap) or externally validated. Clinical usefulness is the next module.</p>
<div class="callout book"><b>Book example: testicular cancer</b><p>Model for benign tissue (necrosis) in residual masses after chemotherapy for metastatic testicular cancer; predictors: teratoma elements, pre-chemotherapy AFP and HCG, post-chemotherapy mass size, reduction in size. Development 544 patients, 245 with necrosis (45%); external validation 273 patients, 76 with necrosis (28%); internal validation by 200 bootstrap replications.</p></div>
<p class="src">Source: Ch. 15, introduction and §15.1</p>`
    },
    {
      id: 'n2',
      title: 'Overall performance',
      html: `
<p>Nagelkerke R² = [1 − exp(−LR / n)] / [1 − exp(−(−2LL<sub>0</sub>) / n)], with LR = −2(LL<sub>0</sub> − LL<sub>1</sub>). The log score penalises confident wrong predictions severely. At external validation the book computes R² after recalibration (intercept and slope), so it reflects the information in the model rather than its miscalibration.</p>
<p>Brier = (1/n) Σ (y − p)², from 0 to 0.25 for a non-informative model at 50% incidence. Brier<sub>max</sub> = p̄ × (1 − p̄)² + (1 − p̄) × p̄² = p̄(1 − p̄); at 10% incidence 0.090. Scaled Brier = 1 − Brier / Brier<sub>max</sub>.</p>
<div class="callout book"><b>Book example: Table 15.1 (development / internal / external)</b><p>R² 38.9%, 37.6%, 26.7%. Brier 0.174, 0.178, 0.161; Brier<sub>max</sub> 0.248, 0.248, 0.201; scaled Brier 29.8%, 28.2%, 20.0%. The raw Brier looked better externally only because necrosis was rarer there.</p></div>
<p>The Brier score can be decomposed into calibration and discrimination parts; examining these separately is more informative. Prognostic models for long-term outcomes typically have modest R² (about 0.20).</p>
<p class="src">Source: Ch. 15, §15.1, §15.4, Table 15.1, Fig. 15.1; Ch. 4</p>`
    },
    {
      id: 'n3',
      title: 'Discrimination: ROC curve and c statistic',
      html: `
<p>Sensitivity = TP / N<sub>event</sub>, specificity = TN / N<sub>no event</sub>. Testicular model: at a 50% cut-off for necrosis, sensitivity 68% and specificity 77%; at 70%, 42% and 92%. A 50% cut-off is rarely clinically sensible.</p>
<p>The ROC curve plots sensitivity against 1 − specificity from cut-off 0% (point 100%, 100%) to 100% (0%, 0%). Its area equals c, the probability that in a random pair with and without the outcome, the patient with the outcome has the higher prediction (ties ½). c is insensitive to incidence and to calibration errors, equals D/2 + 0.5 for Somers' D, relates to the Mann-Whitney U, and its pair interpretation is somewhat artificial clinically. Confidence intervals are best obtained by bootstrapping; standard tests comparing c are valid only for prespecified models. For survival, Harrell's c uses all pairs that can be ordered.</p>
<div class="callout book"><b>Book example</b><p>Testicular model: c 0.818 [0.783-0.852] at development, 0.812 after bootstrap correction, 0.785 [0.726-0.844] externally. Simulations at 50% incidence: c 0.98, 0.83, 0.71, 0.64, 0.60, 0.50 went with R² 87%, 43%, 17%, 8%, 4%, 0%; at lower incidence R² was lower for the same c.</p></div>
<p class="src">Source: Ch. 15, §15.2.1-15.2.4, §15.2.7-15.2.8, Table 15.4, Figs 15.2-15.4</p>`
    },
    {
      id: 'n4',
      title: 'Discrimination slope and Lorenz curve',
      html: `
<p>Discrimination slope = mean p (with outcome) − mean p (without), shown as box plots; it depends on incidence. Testicular model: 0.301 (development), 0.294 (internal), 0.237 (external), partly reflecting the lower prevalence of necrosis (28% against 45%).</p>
<p>Lorenz curve: patients ranked by risk; x-axis the cumulative share classified negative, y-axis the share of outcomes among them (missed). Gini index G = 2A, with A the area between curve and diagonal; specific points are often more useful. Book example: classifying the 25% with highest predicted necrosis as "no resection" missed 9% of tumours at development and 13% at validation; classifying 75% missed 58% and 65%. The policy "resect if mass &gt; 10 mm" performed worse. Its appearance depends strongly on incidence: impressive for a 1% outcome, poor for a common one at the same c.</p>
<table class="data">
<tr><th>Measure</th><th>Picture</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>c statistic</td><td>ROC curve</td><td>Independent of incidence</td><td>Pair interpretation artificial</td></tr>
<tr><td>Discrimination slope</td><td>Box plot</td><td>Intuitive</td><td>Depends on incidence</td></tr>
<tr><td>Lorenz curve</td><td>Concentration curve</td><td>Outcomes missed against patients spared</td><td>Depends on incidence</td></tr>
</table>
<p class="src">Source: Ch. 15, §15.2.5-15.2.6, §15.2.8, Tables 15.3-15.4, Figs 15.5-15.8</p>`
    },
    {
      id: 'n5',
      title: 'Calibration: plot, intercept, slope and tests',
      html: `
<p>Calibration-in-the-large: logit(P(y = 1)) = a + offset(lp), reported as a | b = 1; as an odds ratio, odds(mean predicted) / odds(observed). Calibration slope: logit(P(y = 1)) = a + b<sub>overall</sub> × lp; 1 at apparent validation, equal to the required shrinkage at internal validation, and at external validation reflecting overfitting plus true differences in effects.</p>
<table class="data">
<tr><th>Test</th><th>Null hypothesis</th><th>df</th></tr>
<tr><td>Calibration-in-the-large</td><td>a = 0 given b<sub>overall</sub> = 1</td><td>1</td></tr>
<tr><td>Calibration slope</td><td>b<sub>overall</sub> = 1</td><td>1</td></tr>
<tr><td>Recalibration</td><td>a = 0 and b<sub>overall</sub> = 1</td><td>2</td></tr>
</table>
<p>The slope test can use logit(P(y = 1)) = a + b<sub>miscalibration</sub> × lp + offset(lp), where b<sub>miscalibration</sub> estimates b<sub>overall</sub> − 1. For Cox models only the slope can be assessed this way, as the baseline hazard is re-estimated. Hosmer-Lemeshow: deciles of risk, 8 df at development, 9 externally; arbitrary grouping, low power, no meaning at development. Alternatives: the Goeman-le Cessie test (smoothed residuals), Harrell's E (mean absolute difference between smoothed curve and the identity line), and observed against expected in subgroups.</p>
<div class="callout book"><b>Book example: Tables 15.7-15.8</b><p>Testicular model: calibration-in-the-large 0, 0, −0.03 (development, internal, external); slope 1, 0.97 (equal to the shrinkage factor), 0.74; recalibration test externally p = 0.13. Hosmer-Lemeshow χ² 5.9 (8 df, p = 0.66) at development and 9.2 (9 df, p = 0.42) at validation, despite the slope of 0.74.</p></div>
<p class="src">Source: Ch. 15, §15.3.1-15.3.10, Tables 15.5-15.8, Figs 15.9-15.10</p>`
    },
    {
      id: 'n6',
      title: 'How the measures relate',
      html: `
<ul>
<li>Calibration-in-the-large is independent of discrimination: shifting all risks (as in a case-control sample) does not change c.</li>
<li>The calibration slope is linked to discrimination: an overfitted model loses both in new patients.</li>
<li>Perfect calibration with poor discrimination is possible (all predictions 9% to 11% at 10% incidence); at validation a narrow range can come from a homogeneous case-mix. A drop in c may reflect overfitting (calibration also poor) or a more homogeneous case-mix (calibration may be fine).</li>
<li>A well-discriminating but miscalibrated model can be updated for the new setting.</li>
<li>Overall measures combine both aspects; useful for comparing models on the same data, but they hide which aspect is deficient.</li>
</ul>
<div class="callout book"><b>Book example: Table 16.5</b><p>Testicular model, development (internally validated where available) against validation: R² 38% / 27%; scaled Brier 28% / 20%; c 0.81 / 0.79; discrimination slope 0.29 / 0.24; calibration slope 0.97 / 0.74.</p></div>
<p>At external validation, report calibration-in-the-large, the calibration slope and the recalibration test routinely, with c and a validation plot. Calibration deserves more attention than it usually gets, and c should not be the only criterion: it changes little when a new predictor such as a biomarker is added.</p>
<p class="src">Source: Ch. 15, §15.3.11, §15.4; Ch. 16, Table 16.5</p>`
    }
  ],
  keyPoints: [
    'Overall performance (R², Brier), discrimination (c) and calibration (intercept, slope) answer different questions; report all three.',
    'Brier = mean (y − p)²; its maximum p̄(1 − p̄) depends on incidence, so use scaled Brier = 1 − Brier / Brier_max.',
    'The c statistic is the probability that a patient with the outcome has a higher prediction than one without; it ignores incidence and calibration.',
    'The discrimination slope and Lorenz curve are intuitive but depend on incidence.',
    'Calibration-in-the-large: a in logit(y) = a + offset(lp); calibration slope: b in logit(y) = a + b × lp.',
    'At internal validation the slope equals the required shrinkage; at external validation it also reflects real differences between settings.',
    'Hosmer-Lemeshow tests have low power and no scientific meaning at apparent validation; report sizes, not only p-values.',
    'Good calibration with poor discrimination is possible, and an overfitted model loses both at validation.'
  ],
  quiz: [
    {
      q: 'A preterm birth model is used where the incidence is 10%. Its Brier score is 0.072. What is its scaled Brier score?',
      options: ['7.2%', '20%', '28%', '80%'],
      answer: 1,
      why: 'Brier_max = 0.1 × 0.9 = 0.090, so scaled Brier = 1 − 0.072 / 0.090 = 0.20. 80% is Brier / Brier_max without subtracting it from 1. 28% wrongly uses the incidence (0.10) as the maximum. 7.2% simply restates the raw score.'
    },
    {
      q: 'A preterm birth model is validated in two hospitals. The raw Brier score is lower (better) in hospital B, where preterm birth is rarer. What is the best conclusion?',
      options: ['The comparison is confounded by incidence; compare the scaled Brier scores.', 'The model performs better in hospital B.', 'Brier scores cannot be calculated at external validation.', 'The c statistic must also be higher in hospital B.'],
      answer: 0,
      why: 'Brier_max falls with incidence, so a rarer outcome lowers the Brier score without any better prediction. In the book, the external Brier (0.161) beat development (0.174), but the scaled Brier fell from 28% (internally validated) to 20%. c does not depend on incidence, so nothing follows about it.'
    },
    {
      q: 'At the referral hospital, every predicted log-odds from the team\'s preterm model is 0.5 too low (same women, same ranking). What happens?',
      options: ['c increases.', 'c decreases.', 'c is unchanged; calibration-in-the-large is off by about +0.5.', 'Both c and the calibration slope change.'],
      answer: 2,
      why: 'c depends only on the order of the predictions, which a constant shift does not change; the shift shows up as calibration-in-the-large (observed log-odds about 0.5 above predicted). The slope is unaffected by a constant shift. Believing that any change in predictions changes c confuses discrimination with calibration.'
    },
    {
      q: 'At external validation, a preterm birth model has a calibration slope of 0.65. Which reading is correct?',
      options: ['Predictions are too modest; high risks should be higher.', 'The average predicted risk is too low.', 'The model is well calibrated because the slope is significant.', 'Predictions are too extreme: high predicted risks are too high and low predicted risks too low.'],
      answer: 3,
      why: 'A slope below 1 means observed log-odds vary less than predicted, the sign of overfitting or weaker effects in the new setting. A slope above 1 would mean too modest predictions. The average level is judged by calibration-in-the-large, not by the slope.'
    },
    {
      q: 'Authors of a preterm model write: "Hosmer-Lemeshow p = 0.71 in the development data, showing excellent calibration." What is the main problem?',
      options: ['A non-significant test in the data used to fit the model is expected and says nothing about calibration in new women.', 'The test should have 9 df in development data.', 'p = 0.71 shows poor calibration.', 'The Hosmer-Lemeshow test measures discrimination, not calibration.'],
      answer: 0,
      why: 'The model was fitted to these women, so apparent calibration is near perfect by construction, and the test has low power anyway. The df option is reversed: 8 df applies at development and 9 at external validation. The test does address calibration, but a large p-value does not prove it is good.'
    },
    {
      q: 'Four women who delivered preterm had predicted risks of 0.40, 0.25, 0.15 and 0.08; two term women had 0.20 and 0.10. What is the c statistic?',
      options: ['0.50', '0.625', '0.75', '0.875'],
      answer: 1,
      why: 'There are 4 × 2 = 8 pairs. 0.40 beats both (2), 0.25 beats both (2), 0.15 beats 0.10 only (1), 0.08 beats neither (0): 5 / 8 = 0.625. 0.75 comes from counting women instead of pairs (3 of 4 preterm women are above the lowest term woman).'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Brier and scaled Brier by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The team's model is applied to 8 women at a small clinic. Predicted risks and outcomes (1 = preterm birth):</p>
<table class="data"><tr><th>Woman</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
<tr><td>Predicted risk</td><td>0.10</td><td>0.15</td><td>0.20</td><td>0.30</td><td>0.35</td><td>0.50</td><td>0.60</td><td>0.80</td></tr>
<tr><td>Outcome</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td></tr></table>`,
      questions: [
        '<b>(a)</b> Calculate the squared error for each woman and the Brier score.',
        '<b>(b)</b> Calculate Brier<sub>max</sub> and the scaled Brier score.',
        '<b>(c)</b> Compare the mean predicted risk with the observed incidence, and say what this does and does not tell you.'
      ],
      answer: `<p><b>(a)</b> Squared errors: 0.0100, 0.0225, 0.6400, 0.0900, 0.1225, 0.2500, 0.3600, 0.0400; sum 1.5350. Brier = 1.535 / 8 = 0.192.</p>
<p><b>(b)</b> Incidence = 3 / 8 = 0.375. Brier<sub>max</sub> = 0.375 × 0.625 = 0.234. Scaled Brier = 1 − 0.1919 / 0.2344 = 0.181, or 18.1% (unrounded values used).</p>
<p><b>(c)</b> Mean predicted = 3.00 / 8 = 0.375, equal to the observed 0.375, so calibration-in-the-large looks perfect (odds ratio 1.00). But with 8 women this says nothing reliable, and a correct average does not mean the spread of the predictions (the slope) is correct.</p>`
    },
    {
      id: 't1',
      title: 'Two hospitals, two Brier scores',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). A published preterm birth model is validated at hospital A (incidence 12%, Brier 0.095) and hospital B (incidence 6%, Brier 0.052). The authors conclude it "works better at hospital B". The same paper reports Nagelkerke R² at development, at internal validation and at external validation.</p>`,
      questions: [
        '<b>(a)</b> Calculate Brier<sub>max</sub> and the scaled Brier score in each hospital. Is the conclusion right?',
        '<b>(b)</b> A woman given a risk of 1% delivers early. Compare her contribution to the Brier score with her contribution to the log-likelihood.',
        '<b>(c)</b> In what order would you expect the three R² values to fall, and why?'
      ],
      answer: `<p><b>(a)</b> A: Brier<sub>max</sub> = 0.12 × 0.88 = 0.1056; scaled Brier = 1 − 0.095 / 0.1056 = 10.0%. B: Brier<sub>max</sub> = 0.06 × 0.94 = 0.0564; scaled = 1 − 0.052 / 0.0564 = 7.8%. The raw score is lower at B only because preterm birth is rarer there. Scaled, the model performs slightly worse at B, so the conclusion is wrong.</p>
<p><b>(b)</b> Brier: (1 − 0.01)² = 0.98, close to the maximum of 1 for one woman. Log score: log(0.01) = −4.6, compared with log(0.5) = −0.69 for a 50% prediction. The log score punishes confident wrong predictions far more severely.</p>
<p><b>(c)</b> Development (apparent) highest, internal validation a little lower (optimism removed), external validation lowest, as in the book (38.9%, 37.6%, 26.7%). Apparent performance is optimistic, and new settings differ in case-mix and effects.</p>`
    },
    {
      id: 't2',
      title: 'c statistic and discrimination slope by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). Use the same 8 women as before. The 3 women who delivered preterm had predicted risks of 0.20, 0.50 and 0.80. The 5 term women had 0.10, 0.15, 0.30, 0.35 and 0.60.</p>`,
      questions: [
        '<b>(a)</b> How many pairs of one preterm and one term woman are there? Calculate the c statistic.',
        '<b>(b)</b> At a cut-off of 0.40, calculate sensitivity and specificity. Which point of the ROC curve is this?',
        '<b>(c)</b> Calculate the discrimination slope.',
        '<b>(d)</b> If every risk were doubled on the odds scale, which of (a) to (c) would change?'
      ],
      answer: `<p><b>(a)</b> 3 × 5 = 15 pairs. 0.20 beats 0.10 and 0.15 (2); 0.50 beats 0.10, 0.15, 0.30 and 0.35 (4); 0.80 beats all 5 (5). c = 11 / 15 = 0.733.</p>
<p><b>(b)</b> High risk (≥ 0.40): 0.50, 0.60, 0.80. Sensitivity = 2 / 3 = 67%; specificity = 4 / 5 = 80% (only 0.60 is a false positive). ROC point: 1 − specificity = 0.20, sensitivity = 0.67.</p>
<p><b>(c)</b> Mean in preterm women = (0.20 + 0.50 + 0.80) / 3 = 0.500; in term women = (0.10 + 0.15 + 0.30 + 0.35 + 0.60) / 5 = 0.300. Discrimination slope = 0.200.</p>
<p><b>(d)</b> Doubling the odds adds log 2 to every log-odds, so the order is unchanged and c stays 0.733. The discrimination slope changes, because it uses the risks themselves. Results at a fixed cut-off of 0.40 can also change, since more women pass it: here the term women given 0.30 and 0.35 move to 0.46 and 0.52, so specificity falls from 80% to 40%, while sensitivity happens to stay at 67% (0.20 becomes 0.33). The ROC curve as a whole is unchanged.</p>`
    },
    {
      id: 't3',
      title: 'Discrimination explorer: what depends on the incidence?',
      level: 'Analyse',
      scenario: `<p>Use the Discrimination explorer in this case. It shows a perfectly calibrated model whose risks follow from the c statistic and the incidence you set. The sliders start at c = 0.75, incidence 12% and cut-off 20%.</p>`,
      questions: [
        '<b>(a)</b> Keep the incidence at 12% and the cut-off at 20%. Record Nagelkerke R², scaled Brier and the discrimination slope at c = 0.60 and c = 0.90.',
        '<b>(b)</b> Set c = 0.80 and the cut-off to 20%. Record R², the Brier score and scaled Brier at incidences of 5%, 12% and 50%. What stays fixed?',
        '<b>(c)</b> At c = 0.80 and incidence 12%, record sensitivity, specificity, PPV and NPV at cut-offs of 5%, 10%, 20% and 40%.',
        '<b>(d)</b> In (a) the scaled Brier score and the discrimination slope are equal. Suggest why, given that the model is perfectly calibrated.'
      ],
      answer: `<p><b>(a)</b> c = 0.60: R² 0.026, scaled Brier 0.014, discrimination slope 0.014. c = 0.90: R² 0.471, scaled Brier 0.368, discrimination slope 0.368. All rise steeply with c.</p>
<p><b>(b)</b> 5%: R² 0.190, Brier 0.0429, scaled Brier 0.097. 12%: R² 0.247, Brier 0.0880, scaled 0.167. 50%: R² 0.348, Brier 0.1825, scaled 0.270. c stays at 0.80 by definition, since it compares pairs with and without the outcome. The raw Brier score gets <i>worse</i> as incidence rises, while R² and scaled Brier get better: none of them can be compared across settings without the incidence.</p>
<p><b>(c)</b></p>
<table class="data"><tr><th>Cut-off</th><th>Sensitivity</th><th>Specificity</th><th>PPV</th><th>NPV</th></tr>
<tr><td>5%</td><td>92.0%</td><td>41.6%</td><td>17.7%</td><td>97.4%</td></tr>
<tr><td>10%</td><td>78.2%</td><td>66.0%</td><td>23.9%</td><td>95.7%</td></tr>
<tr><td>20%</td><td>53.1%</td><td>86.7%</td><td>35.3%</td><td>93.1%</td></tr>
<tr><td>40%</td><td>22.7%</td><td>97.4%</td><td>54.1%</td><td>90.2%</td></tr></table>
<p>Moving the cut-off slides along the same ROC curve: sensitivity is traded for specificity, and c does not change. Even with c = 0.80, PPV stays modest at 12% incidence.</p>
<p><b>(d)</b> For a perfectly calibrated model, both measures equal the variance of the predicted risks divided by p̄(1 − p̄), so they coincide. Once a model is miscalibrated, they differ.</p>`
    },
    {
      id: 't4',
      title: 'Calibration at the referral hospital',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The team's model is applied to the complete-case women of the referral hospital in the course data: 1,107 women, 185 preterm births. The mean predicted risk is 13.6%, against an observed incidence of 16.7%. Calibration-in-the-large (a with lp as offset) is +0.29. The recalibration model is logit(P(preterm)) = −0.13 + 0.76 × lp.</p>`,
      questions: [
        '<b>(a)</b> Express calibration-in-the-large as an odds ratio, and as a difference in log-odds of the two percentages. Interpret it.',
        '<b>(b)</b> Why is the log-odds difference in (a) not exactly the +0.29 from the offset model?',
        '<b>(c)</b> Use the recalibration model to find the observed risk for women given 40%, 13.6% and 5%.',
        '<b>(d)</b> What does the slope of 0.76 tell the team, and what could cause it here?'
      ],
      answer: `<p><b>(a)</b> OR = (0.136 / 0.864) / (0.167 / 0.833) = 0.157 / 0.200 = 0.79: the model's average odds are about 21% too low. logit(0.167) − logit(0.136) = −1.607 − (−1.849) = 0.24. Both say the model underestimates the average risk at this hospital.</p>
<p><b>(b)</b> The offset model averages the gap over each woman's own log-odds, not the log-odds of the average risk. Because the logit is not a straight line, the two differ when predictions vary between women; +0.29 is the formal estimate.</p>
<p><b>(c)</b> 40%: lp = logit(0.40) = −0.405; −0.13 + 0.76 × (−0.405) = −0.438; risk 39.2%. 13.6%: lp = −1.849; −0.13 + 0.76 × (−1.849) = −1.535; risk 17.7%. 5%: lp = −2.944; −0.13 + 0.76 × (−2.944) = −2.368; risk 8.6%. Low predictions are much too low, high ones about right.</p>
<p><b>(d)</b> A slope below 1: the predictions are too extreme for these women. At external validation this reflects overfitting plus real differences between settings; in the synthetic design the predictor effects are 20% weaker at the referral hospital and its women are older and at higher risk. The model needs updating before use there.</p>`
    },
    {
      id: 't5',
      title: 'Calibration lab: shift against slope',
      level: 'Analyse',
      scenario: `<p>Use the Calibration lab in this case. It simulates a validation sample in which the true observed log-odds = shift + slope × predicted log-odds. The sliders start at slope 0.80, shift 0, n = 1500 and spread 1.2. Do not press <b>Draw a new sample</b>, so that your numbers match the answer (they will differ a little if you do).</p>`,
      questions: [
        '<b>(a)</b> Set the slope to 1 and the shift to 0. Record calibration-in-the-large, the slope and c.',
        '<b>(b)</b> Now set the shift to +1.0. Describe the plot and record the three numbers.',
        '<b>(c)</b> Set the shift back to 0 and the slope to 0.60. Describe the plot and record the numbers. Why has calibration-in-the-large changed although the shift is 0?',
        '<b>(d)</b> Set the slope to 0.80 and compare n = 200 with n = 1500. What do you learn about small validation samples?'
      ],
      answer: `<p><b>(a)</b> Calibration-in-the-large +0.06, slope 1.01, c 0.784: close to perfect, apart from sampling error.</p>
<p><b>(b)</b> The smooth curve and decile points lie above the dashed line all along: the model underestimates risk. Calibration-in-the-large +1.05, slope 1.01, c 0.775. c is essentially unchanged (the small difference is chance, from new outcomes), because a shift does not change the order of the women.</p>
<p><b>(c)</b> The curve is flatter than the dashed line: high predictions too high, low ones too low. Slope 0.61, c 0.691 (lower than at slope 1), calibration-in-the-large +0.59. In this lab the mean predicted log-odds is about −1.6; a slope of 0.6 pulls the true log-odds towards 0, which raises the average risk. So a slope problem can also shift the average, and both numbers must be read together. A slope below 1 here also lowers c, because the true risks are less spread out than the predictions.</p>
<p><b>(d)</b> At n = 200 (51 events) the estimated slope is 0.65; at n = 1500 it is 0.80. With few events the decile points scatter widely and the estimates are imprecise, so small validations can mislead in either direction. Confidence intervals are essential.</p>`
    },
    {
      id: 't6',
      title: 'Critique a published validation',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A preterm birth model developed at a tertiary centre (incidence 16%, Brier 0.125) is validated in 300 women at a rural district hospital, with 18 preterm births (6%). The authors write: "The Brier score improved from 0.125 to 0.060, showing better performance. The AUC was 0.80. The Hosmer-Lemeshow test was not significant (p = 0.48), confirming good calibration. The mean predicted risk was 11.5%." No calibration plot or slope is shown.</p>`,
      questions: [
        '<b>(a)</b> Evaluate the Brier comparison, using the scaled Brier score.',
        '<b>(b)</b> What does the mean predicted risk say about calibration-in-the-large? Calculate the odds ratio, and the expected against observed number of preterm births.',
        '<b>(c)</b> Evaluate the calibration conclusion and list what should have been reported.',
        '<b>(d)</b> Comment on the AUC with 18 events.'
      ],
      answer: `<p><b>(a)</b> The raw scores are not comparable, since the incidence fell from 16% to 6%. Brier<sub>max</sub> = 0.16 × 0.84 = 0.1344 at development and 0.06 × 0.94 = 0.0564 at validation. Scaled Brier = 1 − 0.125 / 0.1344 = 7.0% at development and 1 − 0.060 / 0.0564 = −6.4% at validation. A negative value means the model did worse than simply giving every woman 6%. Performance collapsed, it did not improve.</p>
<p><b>(b)</b> OR = (0.115 / 0.885) / (0.06 / 0.94) = 0.130 / 0.064 = 2.04: the model roughly doubles the odds on average. Expected births = 0.115 × 300 = 34.5, against 18 observed. This is serious overestimation.</p>
<p><b>(c)</b> <b>Critical:</b> the conclusion is wrong. With 18 events the Hosmer-Lemeshow test has very little power, so a non-significant result cannot confirm calibration, and the mean predicted risk already shows major miscalibration. Required: a calibration plot with the distribution of predictions, calibration-in-the-large (a | b = 1), the calibration slope and the 2-df recalibration test, all with confidence intervals; then updating of the model (at least the intercept) before local use.</p>
<p><b>(d)</b> With 18 events the AUC is very imprecise, so a bootstrap confidence interval is needed. It also says nothing about the overestimation in (b), because c ignores calibration.</p>`
    },
    {
      id: 't7',
      title: 'Write up the team\'s own validation',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). The team's results from the course data (complete cases):</p>
<table class="data"><tr><th>Measure</th><th>Development (apparent)</th><th>Referral hospital</th></tr>
<tr><td>Women / preterm births</td><td>1,548 / 182</td><td>1,107 / 185</td></tr>
<tr><td>c statistic</td><td>0.727</td><td>0.710</td></tr>
<tr><td>Nagelkerke R²</td><td>0.165</td><td>0.136</td></tr>
<tr><td>Scaled Brier</td><td>12.5%</td><td>8.2%</td></tr>
<tr><td>Discrimination slope</td><td>0.120</td><td>0.109</td></tr>
<tr><td>Calibration-in-the-large</td><td>0</td><td>+0.29</td></tr>
<tr><td>Calibration slope</td><td>1</td><td>0.76</td></tr></table>`,
      questions: [
        '<b>(a)</b> Why are calibration-in-the-large 0 and the slope 1 in the development column? What would an internally validated slope show?',
        '<b>(b)</b> Summarise, in plain words, how the model performs at the referral hospital for discrimination and for calibration.',
        '<b>(c)</b> The c statistic fell only from 0.727 to 0.710. Why is it not enough to report c alone?'
      ],
      answer: `<p><b>(a)</b> In its own data a logistic model fitted by maximum likelihood has, by construction, an average predicted risk equal to the observed incidence and a calibration slope of 1. These numbers say nothing about new women. A bootstrap (internally validated) slope would be below 1 and would equal the shrinkage the model needs.</p>
<p><b>(b)</b> Discrimination is a little weaker (c 0.71 against 0.73); the model still ranks women similarly. Calibration is clearly worse: on average it underestimates risk (calibration-in-the-large +0.29, mean predicted 13.6% against 16.7% observed), and its predictions are too extreme (slope 0.76). R² and scaled Brier fall, reflecting both problems together.</p>
<p><b>(c)</b> c ignores calibration. Here the main problem is miscalibration, which c cannot show but which matters for decisions based on absolute risk. The book recommends reporting calibration-in-the-large, the calibration slope and a validation plot routinely, with c.</p>`
    }
  ]
});
