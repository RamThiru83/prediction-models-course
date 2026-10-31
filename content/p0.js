registerModule({
  id: 'p0',
  num: 0,
  part: 'Primer',
  title: 'Primer: the ideas you need before starting',
  book: 'Ch. 1, 4, 5, 15 (background)',
  minutes: 55,
  summary: 'The few ideas the course assumes: risk and odds, how logistic regression turns patient facts into a risk, why results vary between samples, and the two questions asked of every model. Trust me, you will need them!',
  objectives: [
    'Convert between risk and odds',
    'Calculate a risk from a logistic model',
    'Work out PPV and NPV from counts',
    'Explain why small samples mislead',
    'Tell discrimination from calibration'
  ],
  format: 'cases',
  reading: [
    { cite: "Altman DG, Bland JM (1994). Diagnostic tests 1: sensitivity and specificity. BMJ 308:1552.", url: "https://doi.org/10.1136/bmj.308.6943.1552", note: "A one-page definition of sensitivity and specificity with a worked example, ideal before the accuracy ideas in the primer." },
    { cite: "Altman DG, Bland JM (1994). Diagnostic tests 2: predictive values. BMJ 309:102.", url: "https://doi.org/10.1136/bmj.309.6947.102", note: "Shows why the positive and negative predictive values change with how common the condition is, which matters for preterm birth." },
    { cite: "Bland JM, Altman DG (2000). Statistics notes: The odds ratio. BMJ 320:1468.", url: "https://doi.org/10.1136/bmj.320.7247.1468", note: "Explains odds and odds ratios and how they differ from risks, the basis for reading logistic regression coefficients." },
    { cite: "Bland JM, Altman DG (2015). Statistics Notes: Bootstrap resampling methods. BMJ 350:h2622.", url: "https://doi.org/10.1136/bmj.h2622", note: "A short, plain explanation of how resampling your own data shows how much an estimate would vary." },
    { cite: "Steyerberg EW, Harrell FE Jr, Borsboom GJJM, et al. (2001). Internal validation of predictive models: efficiency of some procedures for logistic regression analysis. J Clin Epidemiol 54:774-781.", url: "https://doi.org/10.1016/s0895-4356(01)00341-9", note: "Shows that apparent performance is over-optimistic and that the bootstrap corrects this better than splitting the sample." }
  ],
  essentials: `
<ul>
<li>A <b>clinical prediction model</b> takes some information about a patient/person (the <b>predictors</b>; some computer scientists call them features) and returns the chance of an <b>outcome</b>. In this course the outcome is, for simplicity, yes or no; a patient with it is an <b>event</b>.</li>
<li><b>Odds</b> = risk / (1 − risk). Regression works with the logarithm of the odds, the <b>log-odds</b>.</li>
<li><b>Logistic regression:</b> add up a score, lp = α + β<sub>1</sub>x<sub>1</sub> + β<sub>2</sub>x<sub>2</sub> + ..., then risk = 1 / (1 + e<sup>−lp</sup>). exp(β) is the <b>odds ratio</b>, which is not a risk ratio when the outcome is common.</li>
<li><b>Sensitivity and specificity</b> describe a test. <b>Predictive values</b> (PPV, NPV) also depend on how common the condition is.</li>
<li>Every estimate varies from sample to sample. For a yes/no outcome, the <b>number of events</b> limits what a study can show.</li>
<li>Judge a model on patients it was not built on, with two questions: does it <b>rank</b> patients correctly (discrimination, the c statistic), and are its risks the <b>right size</b> (calibration)?</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. In this primer the team starts to use predicted risks of preterm birth: at the booking visit, for women who arrive with threatened preterm labour, in the district\'s own figures, and in a second hospital.',
  defs: {
    'odds': 'The number of events for every non-event: the risk divided by one minus the risk.',
    'log-odds': 'The logarithm of the odds, the scale on which a logistic model adds up its effects.',
    'odds ratio': 'How many times a predictor multiplies the odds of the outcome.',
    'sensitivity': 'Of the women who have the outcome, the share whose test is positive.',
    'specificity': 'Of the women who do not have the outcome, the share whose test is negative.',
    'PPV': 'Of the women whose test is positive, the share who really have the outcome.',
    'bootstrap': 'Drawing many new samples of the same size from your own data, putting each woman back after each draw, to see how much a result varies.',
    'c statistic': 'Out of all pairs of one woman with the outcome and one without, how often the model gives the higher risk to the woman with it.',
    'calibration': 'Whether predicted risks are the right size: when the model says 20%, about 20 in every 100 such women should have the outcome.',
    'optimism': 'How much better a model looks on the data it was built from than on new women.'
  },
  explainers: [
    {
      id: 'scurve',
      title: 'How a score becomes a risk',
      scenes: (function () {
        var risk = function (x) { return 1 / (1 + Math.exp(-x)); };
        var pc = function (v) { return Math.round(v * 100) + '%'; };
        var mk = function () { return EX.box({ l: 80, t: 50, w: 430, h: 190, xlim: [-5, 2], ylim: [0, 1], xticks: [-4, -3, -2, -1, 0, 1, 2], yticks: [0, 0.25, 0.5, 0.75, 1], yfmt: pc, xlabel: 'score (lp, the log-odds)', ylabel: 'risk' }); };
        var curve = function (B, d) { return EX.curve(B, risk, -5, 2, { role: 'pred', draw: false, d: d || 0 }); };
        /* guide lines from a point on the curve down to the x axis and across to the y axis, drawn as thin muted bars */
        var guide = function (B, x, d) { var y = risk(x); return EX.rect(B.X(x) - 0.5, B.Y(y), 1, B.Y(0) - B.Y(y), { role: 'muted', rx: 0, d: d }) + EX.rect(B.X(-5), B.Y(y) - 0.5, B.X(x) - B.X(-5), 1, { role: 'muted', rx: 0, d: d }); };
        var pt = function (B, x, d) { return EX.pts(B, [[x, risk(x)]], { role: 'pred', r: 5, d: d }); };
        var step = function (B, x0, x1, d) { return EX.rect(B.X(x0), B.Y(0) - 6, B.X(x1) - B.X(x0), 4, { role: 'obs', rx: 2, d: d }); };
        var B = mk();
        return [
          { svg: EX.svg(EX.text(40, 30, 'The model turns a score into a risk', { size: 'm', bold: true }) + B.s + curve(B, 0.4) + pt(B, 0, 1.4) + EX.text(B.X(0) + 10, B.Y(0.5) + 5, 'score 0 = risk 50%', { d: 1.8 }) + EX.text(B.X(-4.8), B.Y(0.9), 'risk = 1 ÷ (1 + e^−score)', { size: 's', d: 2.2 })),
            say: 'A logistic model first adds up a score, the linear predictor. This S-shaped curve then turns any score into a risk between zero and one hundred per cent. A score of zero is a risk of fifty per cent.' },
          { svg: EX.svg(EX.text(40, 30, 'A woman with neither predictor', { size: 'm', bold: true }) + B.s + curve(B) + guide(B, -3, 0.6) + pt(B, -3, 1.0) + EX.text(B.X(-4.8), B.Y(0.78), 'score −3.0, risk 4.7%', { d: 1.4 }) + EX.text(B.X(-4.8), B.Y(0.9), 'lp = −3.0 + 0.8 × chronic_htn + 1.2 × prior_ptb', { size: 's', d: 2.0 })),
            say: 'A woman with neither predictor starts at the intercept, a score of minus three. Read up to the curve and across: her risk is 4.7 per cent. Down here the curve is almost flat, so risks are small.' },
          { svg: EX.svg(EX.text(40, 30, 'A previous preterm birth adds 1.2 to the score', { size: 'm', bold: true }) + B.s + curve(B) + guide(B, -3, 0) + pt(B, -3, 0) + step(B, -3, -1.8, 0.8) + guide(B, -1.8, 1.4) + pt(B, -1.8, 1.8) + EX.text(B.X(-1.8) - 10, B.Y(0.142) - 12, 'score −1.8, risk 14.2%', { anchor: 'end', d: 2.2 }) + EX.text(B.X(-4.8), B.Y(0.9), 'odds 0.05 × 3.3 = 0.165, which is 14.2%', { size: 's', d: 2.8 })),
            say: 'A previous preterm birth adds 1.2 to the score, moving her to minus 1.8. The curve gives 14.2 per cent. On the odds scale the same step multiplies the odds by 3.3: 0.05 becomes 0.165, which is 14.2 per cent.' },
          { svg: EX.svg(EX.text(40, 30, 'The same step from a higher start', { size: 'm', bold: true }) + B.s + curve(B) + guide(B, -3, 0) + pt(B, -3, 0) + pt(B, -1.8, 0) + EX.text(B.X(-4.8), B.Y(0.9), 'from 4.7%: +1.2 on the score gives 14.2% (+9.5 points)', { size: 's', d: 0.4 }) + guide(B, -2.2, 1.0) + pt(B, -2.2, 1.2) + step(B, -2.2, -1.0, 1.6) + guide(B, -1.0, 2.2) + pt(B, -1.0, 2.6) + EX.text(B.X(-4.8), B.Y(0.8), 'from 10.0%: the same +1.2 gives 26.9% (+16.9 points)', { size: 's', d: 3.0 })),
            say: 'Now a woman with chronic hypertension starts at minus 2.2 and ten per cent. The same step of 1.2 takes her to minus one and 26.9 per cent. The same odds ratio adds 17 points of risk instead of nine and a half, because the curve is steeper here.' },
          { svg: EX.svg(EX.text(280, 90, 'Effects add on the score.', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 126, 'Odds ratios multiply the odds.', { size: 'l', bold: true, anchor: 'middle', d: 0.6 }) + EX.text(280, 162, 'Risks do neither.', { size: 'l', bold: true, anchor: 'middle', d: 1.2 }) + EX.text(280, 206, 'OR 3.3: 4.7% to 14.2% is × 3.0, but 10.0% to 26.9% is × 2.7', { anchor: 'middle', d: 1.8 }) + EX.text(280, 234, 'The extra risk depends on where a woman starts on the curve', { anchor: 'middle', d: 2.4 })),
            say: 'So remember three things. Effects add on the score. Odds ratios multiply the odds. Risks do neither: an odds ratio of 3.3 is not a risk ratio of 3.3, and the extra risk from a predictor depends on where a woman starts on the curve.' }
        ];
      })()
    },
    {
      id: 'optimism',
      title: 'Why a model looks better on its own data',
      scenes: (function () {
        var pc = function (v) { return Math.round(v * 100) + '%'; };
        var dev = [0.02, 0.05, 0.03, 0.08, 0.06, 0.12, 0.10, 0.20, 0.25, 0.38];
        var nw = [0.05, 0.06, 0.07, 0.09, 0.10, 0.12, 0.14, 0.17, 0.20, 0.26];
        var B = EX.box({ l: 80, t: 50, w: 430, h: 190, xlim: [0.5, 10.5], ylim: [0, 0.45], xticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], yticks: [0, 0.1, 0.2, 0.3, 0.4], yfmt: pc, xlabel: 'tenths of women, ranked by model score (1 = lowest)', ylabel: 'share preterm' });
        var xy = function (a) { return a.map(function (v, i) { return [i + 1, v]; }); };
        var fit = EX.line(xy(dev).map(function (p) { return [B.X(p[0]), B.Y(p[1])]; }), { role: 'pred', draw: false, d: 0.6 });
        var gaps = EX.gaps(B, dev.map(function (v, i) { return [i + 1, v, nw[i]]; }), { d: 1.6 });
        return [
          { svg: EX.svg(EX.text(40, 30, 'Development data: what was observed', { size: 'm', bold: true }) + B.s + EX.pts(B, xy(dev), { role: 'obs', r: 5, d: 0.4, stagger: 0.15 })),
            say: 'Sort the women the model was built from into ten groups by their model score, and plot the share in each group who delivered early. These solid dots are what was observed.' },
          { svg: EX.svg(EX.text(40, 30, 'The model fitted to these women', { size: 'm', bold: true }) + B.s + EX.pts(B, xy(dev), { role: 'obs', r: 5 }) + fit + EX.text(B.X(1), B.Y(0.41), 'apparent c statistic 0.82', { size: 's', d: 1.6 })),
            say: 'The model\'s coefficients were chosen to fit these very women. Its dashed curve follows every bump in the dots, including bumps that are only chance. On its own data it looks excellent: a c statistic of 0.82.' },
          { svg: EX.svg(EX.text(40, 30, 'The same model in a second hospital', { size: 'm', bold: true }) + B.s + fit + EX.pts(B, xy(nw), { role: 'obs', r: 5, d: 0.4, stagger: 0.1 }) + gaps + EX.text(B.X(1), B.Y(0.41), 'too high at the top, too low at the bottom', { size: 's', d: 2.2 })),
            say: 'Now apply the same model to women in a second hospital. The observed shares are gentler. The dashed curve sits above the dots at the top and below them at the bottom: its risks are too extreme. The red gaps are the error.' },
          { svg: EX.svg(EX.text(280, 80, 'c statistic 0.82 on its own data', { size: 'l', anchor: 'middle' }) + EX.text(280, 116, 'c statistic 0.71 in the second hospital', { size: 'l', anchor: 'middle', d: 0.6 }) + EX.text(280, 162, 'The difference is optimism.', { size: 'l', bold: true, anchor: 'middle', d: 1.2 }) + EX.text(280, 196, 'A model with a lot of optimism is overfitted:', { anchor: 'middle', d: 1.8 }) + EX.text(280, 220, 'it has learned the quirks of its own sample.', { anchor: 'middle', d: 1.8 })),
            say: 'The c statistic was 0.82 on the model\'s own data and 0.71 in the second hospital. The difference is optimism. A model with a lot of optimism is overfitted: it has learned the quirks of its own sample.' },
          { svg: EX.svg(EX.text(280, 96, 'Judge a model on women it was not built on', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 150, 'Does it rank women correctly? (discrimination, c statistic)', { anchor: 'middle', d: 0.8 }) + EX.text(280, 184, 'Are its risks the right size? (calibration)', { anchor: 'middle', d: 1.6 })),
            say: 'So judge a model on women it was not built on, and ask two questions. Does it rank women correctly? That is discrimination. And are its risks the right size? That is calibration.' }
        ];
      })()
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'A risk at booking',
      aim: 'turn a risk into odds and back, and calculate a woman\'s risk from a logistic model.',
      minutes: 12,
      need: `
<p>Odds = risk / (1 − risk), and risk = odds / (1 + odds). A 20% risk is odds of 0.25: one event for every four non-events. For small risks the two are close; for large risks they are not (80% is odds 4).</p>
<p>A logistic model adds up a score, lp, then turns it into a risk with 1 / (1 + e<sup>−lp</sup>). A score of 0 is a risk of 50%. exp(coefficient) is the odds ratio: how much that predictor multiplies the odds.</p>
<div data-explainer="scurve"></div>`,
      scenario: `<p>The team's antenatal clinic wants each woman's risk of preterm birth at her booking visit. A colleague gives them a simple model: lp = −3.0 + 0.8 × chronic_htn + 1.2 × prior_ptb, with each predictor coded 1 if present and 0 if not.</p>`,
      widgets: `<div data-widget="oddsConverter" data-try="Slide the probability from 5% up to 50% and watch the odds pull away from the probability as the risk grows."></div><div data-widget="logisticCurve" data-try="Tick Binary predictor, set the intercept to −3.0 and the coefficient to 1.2, and read the two risks: 4.7% and 14.2%."></div>`,
      tasks: [0, 1, 2],
      takeaway: 'A model adds effects on the log-odds scale. Its odds ratios are not risk ratios, and the extra risk from a predictor depends on where a woman starts.'
    },
    {
      id: 'c2',
      title: 'A bedside test for threatened preterm labour',
      aim: 'work out what a positive or negative test result means, using counts.',
      minutes: 10,
      need: `
<p><b>Sensitivity:</b> of those with the outcome, the proportion who test positive. <b>Specificity:</b> of those without it, the proportion who test negative. <b>PPV:</b> of those who test positive, the proportion who have the outcome; <b>NPV</b> is the same for those who test negative.</p>
<p>Work in counts. Out of 1000 women in whom 14% will deliver within 7 days: 140 will, and 85% of them (119) test positive; 860 will not, and 30% of them (258) also test positive. PPV = 119 / 377 = 32%.</p>`,
      scenario: `<p>Some women come to the labour ward with contractions before 37 weeks. The team uses a quick bedside test to predict which of them will deliver within 7 days (illustrative values: sensitivity 85%, specificity 70%).</p>
<p>In the team's own unit, 14% of the women tested deliver within 7 days. In the regional referral unit, where the team sends women, 40% do. What does a test result mean in each place?</p>`,
      widgets: `<div data-widget="bayes2x2" data-try="Set sensitivity 85%, specificity 70% and prevalence 14%, then move prevalence to 40% and watch the risk after a positive test rise."></div>`,
      tasks: [3, 4],
      takeaway: 'Sensitivity and specificity belong to the test; what a result means for a woman also depends on how common the outcome is where the test is used.'
    },
    {
      id: 'c3',
      title: 'Is this clinic really different?',
      aim: 'judge whether a figure differs from chance, and see why the number of events matters.',
      minutes: 10,
      need: `
<p>Any number worked out from a sample is only an estimate. Another sample would give a slightly different number, and small samples swing much more than large ones. If the true risk is 12%, samples of 50 women can show anything from about 3% to 21%; samples of 1000 women stay between about 10% and 14%.</p>
<p>For a yes/no outcome, what counts is the <b>number of events</b> (here, preterm births), not the number of women.</p>
<p>The <b>bootstrap</b> is a way to see this uncertainty using only your own data. Pick women at random from your records, putting each one back after picking, until you have a new sample of the same size. Some women are picked twice and others not at all (about 63% of them appear). Repeat this many times and see how much the result changes.</p>`,
      scenario: `<p>The district manager compares the preterm birth rates of different clinics with the district rate of 12%. She is also offered two sets of records for building a better model.</p>`,
      widgets: `<div data-widget="samplingDemo" data-try="Set the true risk to 12% and press Draw 200 samples at n = 50, then again at n = 1000, and compare the spread."></div>`,
      tasks: [5, 6],
      takeaway: 'Small samples mislead; before reading meaning into a figure, ask how much it would vary by chance, and count the events.'
    },
    {
      id: 'c4',
      title: 'Does the model work?',
      aim: 'calculate a c statistic, check calibration, and explain why a model looks worse in new patients.',
      minutes: 10,
      need: `
<p>A model always looks better on the women it was built from. This is its <b>apparent</b> performance, and the difference from new women is called <b>optimism</b>. A model with a lot of optimism is <b>overfitted</b>: it has learned the quirks of its own sample. On new women its risks are too extreme, too high for high-risk women and too low for low-risk women.</p>
<p>Two questions tell you whether a model works:</p>
<ul>
<li><b>Does it rank women correctly?</b> Take one woman who delivered early and one who did not. The <b>c statistic</b> is how often the model gives the higher risk to the woman who delivered early. 0.5 is no better than tossing a coin; 1 is perfect.</li>
<li><b>Are the risks the right size?</b> This is <b>calibration</b>. If the model says 20% for a group of women, about 20 in every 100 of them should deliver early.</li>
</ul>
<div data-explainer="optimism"></div>`,
      scenario: `<p>The team's model worked well on the women it was built from. Before using it every day, the team tries it on women in a second hospital.</p>`,
      widgets: '',
      tasks: [7, 8],
      takeaway: 'Judge a model on patients it was not built on, and ask both questions: does it rank patients correctly, and are its risks the right size?'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'What a prediction model is',
      html: `
<p>A <b>clinical prediction model</b> takes some information about a patient/person and returns the probability that they have, or will develop, an outcome. Risk scores, prediction rules and nomograms are all prediction models.</p>
<table class="data">
<tr><th>Term</th><th>Meaning</th><th>In the course story</th></tr>
<tr><td>Outcome</td><td>What is predicted; in this course (for the sake of simplicity) yes or no</td><td>Preterm birth before 37 weeks</td></tr>
<tr><td>Event</td><td>A patient/person with the outcome</td><td>A woman who delivers preterm</td></tr>
<tr><td>Predictors</td><td>The information used to predict (some computer scientists call them features; I would prefer to use predictors!)</td><td>Age, haemoglobin, previous preterm birth</td></tr>
<tr><td>Absolute risk</td><td>The predicted probability itself</td><td>18% for one woman</td></tr>
</table>
<p><b>Incidence</b> is the share who develop the outcome over a stated period; <b>prevalence</b> is the share who have a condition now. In prediction work, both are simply the overall risk in the population.</p>
<p>A <b>prognostic</b> model predicts a future outcome from a cohort followed over time (preterm birth, predicted at booking). A <b>diagnostic</b> model estimates whether a condition is present now, from predictors and a reference diagnosis taken at the same time.</p>
<p>Prediction is not explanation. An aetiological study asks whether an exposure causes the outcome and worries about confounding. A prediction study asks how well predictors together estimate a new patient's risk; a predictor can help without being a cause. The book treats prediction primarily as an <b>estimation problem</b>: getting each patient's risk right.</p>
<p class="src">Source: Ch. 1, §1.1-1.2; Ch. 2, §2.1 Steyerberg's book</p>`
    },
    {
      id: 'n2',
      title: 'Risk, odds and log-odds',
      html: `
<div class="formula">odds = risk / (1 − risk)        risk = odds / (1 + odds)        log-odds = ln(odds)</div>
<table class="data">
<tr><th>Risk</th><th>1%</th><th>5%</th><th>10%</th><th>20%</th><th>50%</th><th>80%</th></tr>
<tr><td>Odds</td><td>0.010</td><td>0.053</td><td>0.111</td><td>0.25</td><td>1</td><td>4</td></tr>
<tr><td>Log-odds</td><td>−4.60</td><td>−2.94</td><td>−2.20</td><td>−1.39</td><td>0</td><td>1.39</td></tr>
</table>
<p>Odds and risk are close for small risks and far apart for large ones. Regression uses log-odds because they can take any value, so the model can never return an impossible risk.</p>
<p class="src">Source: Ch. 4, §4.2</p>`
    },
    {
      id: 'n3',
      title: 'Logistic regression',
      html: `
<div class="formula">lp = α + β<sub>1</sub>x<sub>1</sub> + β<sub>2</sub>x<sub>2</sub> + ...        risk = 1 / (1 + e<sup>−lp</sup>)</div>
<p>The <b>intercept</b> α sets the overall risk level. Each <b>coefficient</b> β is the change in log-odds for one unit of its predictor, and exp(β) is the <b>odds ratio</b>. A coefficient of 0 means no effect.</p>
<p><b>In the course story.</b> With lp = −3.0 + 0.8 × chronic_htn + 1.2 × prior_ptb, a woman with neither predictor has a risk of 4.7%, and a woman with both has lp = −1.0 and a risk of 26.9%. Effects add on the log-odds scale, not on the risk scale.</p>
<p>For a continuous predictor such as age, β is the change per year, and the model assumes the same change at every age (later modules ask when that is acceptable). The coefficients are those that fit the study data best (maximum likelihood), which is why a model looks better on its own data than on new patients.</p>
<p class="src">Source: Ch. 4, §4.2</p>`
    },
    {
      id: 'n4',
      title: 'Test results and predictive values',
      html: `
<p><b>Sensitivity</b> and <b>specificity</b> describe a test against the truth. <b>PPV</b> and <b>NPV</b> describe what a result means for the patient, and they depend on how common the outcome is.</p>
<table class="data">
<tr><th>1000 women with threatened preterm labour, 14% deliver within 7 days</th><th>Deliver within 7 days</th><th>Do not</th></tr>
<tr><td>Test positive</td><td>119</td><td>258</td></tr>
<tr><td>Test negative</td><td>21</td><td>602</td></tr>
</table>
<p>With sensitivity 85% and specificity 70% (illustrative values): PPV = 119 / 377 = 32%, NPV = 602 / 623 = 97%. Where 40% deliver within 7 days, the same test gives PPV 65% and NPV 87.5%.</p>
<p class="src">Source: Ch. 4, §4.4</p>`
    },
    {
      id: 'n5',
      title: 'Sampling variation and the bootstrap',
      html: `
<p>Every estimate varies from sample to sample. With a true preterm birth risk of 12%, 95% of samples show:</p>
<table class="data">
<tr><th>Women in the sample</th><th>50</th><th>100</th><th>1000</th></tr>
<tr><td>Range of observed risk</td><td>3% to 21%</td><td>6% to 18%</td><td>10% to 14%</td></tr>
</table>
<p>For a yes/no outcome the information sits in the <b>number of events</b>. Book example: an outcome with incidence 0.1% in 10,000 patients gives only 10 events.</p>
<p>The <b>bootstrap</b> draws a new sample of the same size from your own data, with replacement, repeats the analysis, and does this many times; the spread of the results shows the uncertainty. Each bootstrap sample contains about 63% of the original patients.</p>
<p class="src">Source: Ch. 1, §1.2.2; Ch. 5, §5.3</p>`
    },
    {
      id: 'n6',
      title: 'Judging a model, and the terms used later',
      html: `
<p>A model always looks better on the patients used to build it (<b>apparent</b> performance). The excess is <b>optimism</b>; a model with a lot of it is <b>overfitted</b>, and its risks are too extreme in new patients. Judge it on patients it was not built on.</p>
<table class="data">
<tr><th>Term</th><th>Meaning</th></tr>
<tr><td>c statistic</td><td>Share of event/non-event pairs in which the event has the higher predicted risk; 0.5 is chance, 1 is perfect</td></tr>
<tr><td>Calibration</td><td>Agreement between predicted and observed risks; calibration-in-the-large compares the averages</td></tr>
<tr><td>Internal validation</td><td>Estimating optimism in the development data, for example with the bootstrap</td></tr>
<tr><td>External validation</td><td>Testing the model in other patients, places or times</td></tr>
</table>
<p>Discrimination and calibration answer different questions; a model can rank women well and still give risks that are too low.</p>
<p class="src">Source: Ch. 5, §5.1; Ch. 15, §15.1-15.4</p>`
    }
  ],
  keyPoints: [
    'A prediction model turns facts about a patient into a predicted risk of a defined outcome.',
    'Odds = risk / (1 − risk); an odds ratio is not a risk ratio when the outcome is common.',
    'Logistic regression adds up a score (lp) and turns it into a risk: 1 / (1 + e^−lp).',
    'PPV and NPV depend on how common the condition is; sensitivity and specificity largely do not.',
    'Small samples give unstable estimates; the number of events matters most.',
    'A model looks better on its own data than on new patients; judge it on new data.',
    'Discrimination (ranking) and calibration (right-sized risks) are different questions; check both.'
  ],
  quiz: [
    {
      q: 'A woman has a predicted preterm-birth risk of 20%. What are her odds of preterm birth?',
      options: ['0.20', '0.25', '0.80', '4'],
      answer: 1,
      why: 'Odds = risk / (1 − risk) = 0.20 / 0.80 = 0.25. 0.20 is the risk itself. 0.80 is the chance of no event, and 4 is the odds of no event.'
    },
    {
      q: 'In a model for preterm birth, the odds ratio for a previous preterm birth is 4.5. What does this mean?',
      options: [
        'The risk of preterm birth is 4.5 times higher.',
        'The risk is 4.5 percentage points higher.',
        'The linear predictor equals 4.5 for these women.',
        'The odds of preterm birth are 4.5 times higher than in otherwise similar women without a previous preterm birth.'
      ],
      answer: 3,
      why: 'An odds ratio multiplies the odds. Reading it as a risk ratio is the commonest slip: in the worked example the risks are 10% and 33%, only 3.3 times higher. It is not a difference in percentage points, and the linear predictor changes by 1.5, not 4.5.'
    },
    {
      q: 'A model has linear predictor lp = −0.7 for a woman. What is her predicted risk?',
      options: ['33%', '50%', '67%', '0.5%'],
      answer: 0,
      why: 'Risk = 1 / (1 + e^0.7) = 1 / 3.01 = 0.33. A risk of 50% needs lp = 0. 67% comes from getting the sign wrong.'
    },
    {
      q: 'Of 1000 women, 50 have the condition. A test has sensitivity 90% and specificity 80%. What proportion of positive results are true positives?',
      options: ['90%', '80%', '19%', '5%'],
      answer: 2,
      why: 'True positives = 90% of 50 = 45. False positives = 20% of 950 = 190. PPV = 45 / (45 + 190) = 19%. 90% is the sensitivity, not the PPV. When a condition is uncommon, most positives are false alarms.'
    },
    {
      q: 'In a bootstrap sample drawn with replacement from 1000 patients, about what proportion of the original patients appear at least once?',
      options: ['37%', '63%', '50%', '100%'],
      answer: 1,
      why: 'About 63% appear and 37% are left out, because some patients are drawn more than once. 100% would only happen if patients were not put back after each draw.'
    },
    {
      q: 'A model has a c statistic of 0.75. Which statement is correct?',
      options: [
        '75% of patients are classified correctly.',
        'Predicted risks are on average 75% of the observed risks.',
        'The model explains 75% of the variation in the outcome.',
        'In 75% of pairs of one patient with and one without the outcome, the patient with the outcome has the higher predicted risk.'
      ],
      answer: 3,
      why: 'The c statistic is about ranking within pairs. It needs no cut-off, so it is not the share classified correctly, and it says nothing about whether the risks are the right size (calibration).'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Risk and odds',
      level: 'Apply',
      scenario: `<p>Use the odds converter above to check your answers.</p>`,
      questions: [
        '<b>(a)</b> Convert a preterm birth risk of 12% into odds.',
        '<b>(b)</b> A woman has odds of 0.25. What is her risk?',
        '<b>(c)</b> For a risk of 2% and a risk of 80%, compare the odds with the risk. When can odds and risk be used interchangeably?'
      ],
      answer: `<p><b>(a)</b> Odds = 0.12 / 0.88 = 0.136, about 3 events for every 22 non-events.</p>
<p><b>(b)</b> Risk = 0.25 / 1.25 = 0.20, that is 20%.</p>
<p><b>(c)</b> At 2% the odds are 0.020, almost the same as the risk. At 80% the odds are 4, very different from 0.8. Odds and risk are close only when the outcome is uncommon.</p>`
    },
    {
      id: 't1',
      title: 'From equation to risks',
      level: 'Apply',
      scenario: `<p>Use the model in the case: lp = −3.0 + 0.8 × chronic_htn + 1.2 × prior_ptb.</p>`,
      questions: [
        '<b>(a)</b> Calculate the predicted risk for a woman with neither predictor, with chronic hypertension only, with a previous preterm birth only, and with both.',
        '<b>(b)</b> Give the odds ratio for each predictor.',
        '<b>(c)</b> Is the risk for a woman with both predictors simply the sum of the two separate increases? Explain.'
      ],
      answer: `<p><b>(a)</b> Add up lp, then risk = 1 / (1 + e<sup>−lp</sup>):</p>
<table class="data">
<tr><th>Woman</th><th>lp</th><th>Risk</th></tr>
<tr><td>Neither</td><td>−3.0</td><td>4.7%</td></tr>
<tr><td>Hypertension only</td><td>−2.2</td><td>10.0%</td></tr>
<tr><td>Previous preterm only</td><td>−1.8</td><td>14.2%</td></tr>
<tr><td>Both</td><td>−1.0</td><td>26.9%</td></tr>
</table>
<p><b>(b)</b> Hypertension: exp(0.8) = 2.2. Previous preterm birth: exp(1.2) = 3.3.</p>
<p><b>(c)</b> No. The separate increases are 5.3 and 9.5 percentage points, which would add to 19.5%, but the risk with both is 26.9%. The coefficients add on the score (lp) scale, not on the risk scale, so the extra risk from one predictor depends on how high the risk already is.</p>`
    },
    {
      id: 't2',
      title: 'Odds ratio or risk ratio?',
      level: 'Analyse',
      scenario: `<p>A colleague reads the model and tells the midwives: "a previous preterm birth gives a woman 3.3 times the risk of preterm birth".</p>`,
      questions: [
        '<b>(a)</b> Using your risks from Task 2, calculate the ratio of risks for a previous preterm birth in women without hypertension and in women with hypertension.',
        '<b>(b)</b> Correct the colleague\'s sentence.'
      ],
      answer: `<p><b>(a)</b> Without hypertension: 14.2% / 4.7% = 3.0. With hypertension: 26.9% / 10.0% = 2.7.</p>
<p><b>(b)</b> "A previous preterm birth multiplies the <i>odds</i> of preterm birth by 3.3. In terms of risk, it is about 3 times for women without hypertension and less for women already at higher risk." The odds ratio is the same for every woman in this model; the risk ratio is not, and it moves further from the odds ratio as the risk rises.</p>`
    },
    {
      id: 't3',
      title: 'The same test in two settings',
      level: 'Apply',
      scenario: `<p>Use the bedside test in the case: sensitivity 85%, specificity 70%, for delivery within 7 days.</p>`,
      questions: [
        '<b>(a)</b> Before calculating, guess in which setting a positive result is more likely to be a true positive.',
        '<b>(b)</b> For 1000 women tested in each unit, calculate the PPV and NPV. Check your answers with the widget above.',
        '<b>(c)</b> In two sentences, explain why the same test means different things in the two settings.'
      ],
      answer: `<p><b>(a)</b> In the referral unit, where delivery within 7 days is more common.</p>
<p><b>(b)</b> The team's own unit (14%): 119 true and 258 false positives, PPV 32%; 602 true and 21 false negatives, NPV 97%. Referral unit (40%): 340 true positives (85% of 400) and 180 false positives (30% of 600), PPV 65%; 420 true negatives and 60 false negatives, NPV 87.5%.</p>
<p><b>(c)</b> Sensitivity and specificity are the same in both units, but how many women will deliver soon before testing differs. When the outcome is common, positives are more often real and negatives less reassuring.</p>`
    },
    {
      id: 't4',
      title: 'A negative test in the referral unit',
      level: 'Evaluate',
      scenario: `<p>In the referral unit, a woman at 31 weeks with contractions has a negative bedside test. A trainee proposes to send her home without antenatal corticosteroids.</p>`,
      questions: [
        '<b>(a)</b> Using Task 4, what is this woman\'s chance of delivering within 7 days after the negative result?',
        '<b>(b)</b> Missing a woman who will deliver within 7 days is judged far worse than giving corticosteroids that turn out not to be needed. Would you accept the trainee\'s proposal? Would your answer be the same in the team\'s own unit?'
      ],
      answer: `<p><b>(a)</b> 60 of the 480 women with a negative test deliver within 7 days: 12.5%, about one in eight.</p>
<p><b>(b)</b> No. When missing a case is much worse than unnecessary treatment, the risk at which treatment stops being worthwhile is low, and one in eight is far above it. In the team's own unit the risk after a negative test is 3.4%, so the decision is closer and depends on how much worse a missed case is judged to be. Module 1 turns this judgement into a treatment threshold.</p>`
    },
    {
      id: 't5',
      title: 'Is this clinic really different?',
      level: 'Analyse',
      scenario: `<p>(i) A new clinic reports 10 preterm births among its first 50 deliveries (20%), and the manager proposes a review. (ii) A larger hospital reports 16% among 400 deliveries. The district rate is 12%.</p>`,
      questions: [
        '<b>(a)</b> Use the sampling widget above (true risk 12%) to find the range that 95% of samples fall in for 50 and for 400 deliveries.',
        '<b>(b)</b> Is each observed figure compatible with chance alone? What would you advise?',
        '<b>(c)</b> How could a bootstrap show the manager the uncertainty around the 20% figure?'
      ],
      answer: `<p><b>(a)</b> With 50 deliveries, about 3% to 21%. With 400, about 9% to 15%.</p>
<p><b>(b)</b> The clinic's 20% is inside the chance range: a clinic with a true risk of 12% would see 10 or more preterm births among 50 deliveries about once in 14 times. A review on this basis is premature; wait for more deliveries. The hospital's 16% is outside its range, so it deserves a closer look (case-mix, referral pattern, how preterm birth was recorded) before drawing conclusions about quality.</p>
<p><b>(c)</b> Write the 50 outcomes on cards (10 marked preterm). Draw 50 cards one at a time, putting each back, and note the share of preterm. Repeat a few hundred times: the shares spread widely, and the range includes 12%.</p>`
    },
    {
      id: 't6',
      title: 'Events, not patients',
      level: 'Apply',
      scenario: `<p>Two cohorts are offered for building a model. Cohort A: 5,000 women, outcome in 1%. Cohort B: 800 women, outcome in 15%.</p>`,
      questions: [
        '<b>(a)</b> How many events does each cohort have?',
        '<b>(b)</b> Which cohort carries more information for building a prediction model, and why?'
      ],
      answer: `<p><b>(a)</b> A: 1% of 5,000 = 50 events. B: 15% of 800 = 120 events.</p>
<p><b>(b)</b> Cohort B, although it is six times smaller. For a yes/no outcome the information is carried mainly by the smaller of the two groups, here the events, so B's 120 events let it support more predictors and give steadier estimates than A's 50.</p>`
    },
    {
      id: 't7',
      title: 'Count the pairs',
      level: 'Apply',
      scenario: `<p>In the second hospital, five women are followed to delivery. Predicted risks for the two who delivered preterm: 0.30 and 0.15. For the three who did not: 0.10, 0.20 and 0.05.</p>`,
      questions: [
        '<b>(a)</b> Calculate the c statistic by counting pairs.',
        '<b>(b)</b> Compare the average predicted risk with the share who delivered preterm.',
        '<b>(c)</b> In one sentence, describe how this model performs on the two questions.'
      ],
      answer: `<p><b>(a)</b> There are 2 × 3 = 6 pairs. 0.30 is higher than all three non-events (3 pairs); 0.15 is higher than 0.10 and 0.05 but not 0.20 (2 pairs). c = 5 / 6 = 0.83.</p>
<p><b>(b)</b> Average predicted risk = (0.30 + 0.15 + 0.10 + 0.20 + 0.05) / 5 = 0.16; observed share = 2 / 5 = 0.40.</p>
<p><b>(c)</b> It ranks the women well but its risks are much too low, so it discriminates but is poorly calibrated. (Five women are far too few to judge a real model; the point is the reasoning.)</p>`
    },
    {
      id: 't8',
      title: 'From one hospital to another',
      level: 'Evaluate',
      scenario: `<p>The model had a c statistic of 0.82 in the hospital where it was built and 0.71 in the second hospital. In the second hospital, women given high risks had fewer preterm births than predicted, and women given low risks had more.</p>`,
      questions: [
        '<b>(a)</b> Name the pattern in the risks and the problem it usually points to.',
        '<b>(b)</b> Give a second, different reason why performance could fall in another hospital.',
        '<b>(c)</b> What should the team have done before trying the model elsewhere?'
      ],
      answer: `<p><b>(a)</b> The risks are too extreme: too high at the top, too low at the bottom. This is the usual sign of overfitting: the model learned features of its own sample that do not hold in new women, so its apparent performance (0.82) was optimistic.</p>
<p><b>(b)</b> The hospitals may simply differ: a different mix of women, a different referral pattern or a different way of recording gestational age can change performance even for a model that is not overfitted.</p>
<p><b>(c)</b> Estimate the optimism in the development data first (internal validation, for example with the bootstrap), and only then test the model in the new hospital (external validation). Modules 4, 13 and 14 cover this.</p>`
    }
  ]
});
