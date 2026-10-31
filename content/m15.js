registerModule({
  id: 'm15',
  num: 15,
  part: 'Validation',
  title: 'Presentation formats: formula, nomogram, score chart',
  book: 'Ch. 18',
  minutes: 70,
  summary: 'How to present a validated model so that users can calculate correct absolute risks: the regression formula, confidence intervals for predictions, nomograms, score charts, tables and decision rules, and what each format costs in accuracy.',
  objectives: [
    'Tell a prediction model from a rule',
    'Calculate a risk from a published formula',
    'Put a confidence interval on a risk',
    'Build a score chart from coefficients',
    'Avoid odds ratios as score points',
    'Judge what simplification costs'
  ],
  format: 'cases',
  reading: [
    { cite: "Collins GS, Moons KGM, Dhiman P, et al. (2024). TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods. BMJ 385:e078378.", url: "https://doi.org/10.1136/bmj-2023-078378", note: "The current reporting guideline, which replaces TRIPOD 2015 and should be used when writing up a prediction model." },
    { cite: "Moons KGM, Altman DG, Reitsma JB, et al. (2015). Transparent Reporting of a multivariable prediction model for Individual Prognosis or Diagnosis (TRIPOD): explanation and elaboration. Annals of Internal Medicine 162:W1-W73.", url: "https://doi.org/10.7326/M14-0698", note: "Explains each reporting item with examples, which helps in understanding the intent behind the newer TRIPOD+AI checklist." },
    { cite: "Sullivan LM, Massaro JM, D'Agostino RB Sr (2004). Presentation of multivariate data for clinical use: the Framingham Study risk score functions. Statistics in Medicine 23:1631-1660.", url: "https://doi.org/10.1002/sim.1742", note: "Shows how regression coefficients are turned into integer point scores and risk tables." },
    { cite: "Iasonos A, Schrag D, Raj GV, Panageas KS (2008). How to build and interpret a nomogram for cancer prognosis. Journal of Clinical Oncology 26:1364-1370.", url: "https://doi.org/10.1200/JCO.2007.12.9791", note: "A clear tutorial on constructing and reading a nomogram, with the caveats on its use." },
    { cite: "Han X, Zhang Q, Ke Y, et al. (2025). Development and external validation of a nomogram for predicting spontaneous preterm birth in singleton pregnancies with a short cervix. American Journal of Obstetrics & Gynecology MFM 8:101859.", url: "https://doi.org/10.1016/j.ajogmf.2025.101859", note: "A recent preterm birth example that develops a nomogram and reports discrimination, calibration, Brier score and decision curves in a prospective external cohort." }
  ],
  essentials: `
<ul>
<li>A table of odds ratios is not a prediction model. To give an absolute risk you also need the <b>intercept</b>, and the exact coding and units of every predictor.</li>
<li>A <b>prediction model</b> gives a risk and leaves the action to the clinician and the woman. A <b>decision rule</b> adds a threshold and an action, which needs clinical judgement about harms and benefits.</li>
<li>A formula is used in two steps: add up the linear predictor, then turn it into a risk with 1 ÷ (1 + e<sup>−lp</sup>). After shrinking coefficients, re-estimate the intercept.</li>
<li>A confidence interval for a predicted risk shows random error only. It says nothing about miscalibration in a new setting.</li>
<li>A <b>nomogram</b> draws the formula as scales. A <b>score chart</b> gives rounded points. Points must be proportional to the regression coefficients, never to odds ratios.</li>
<li>Rounding points costs little. Cutting continuous predictors into groups, or reducing the model to a table, costs more discrimination.</li>
<li>Whatever format is offered, publish the full formula, so that others can validate and update the model.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has a validated booking-visit model. Now it must hand the model to the people who will use it: midwives with a printed antenatal card, doctors with the hospital computer system, and other researchers who want to test it. In this module it chooses how to present the model, and checks what each format costs. You do not need the earlier modules for this story.',
  defs: {
    'decision rule': 'A recommendation for action, made from a prediction model by adding a risk threshold.',
    'intercept': 'The starting value of the linear predictor, for a woman with every predictor at zero or at its reference value.',
    'centring': 'Subtracting a fixed value (such as the mean) from a predictor before multiplying by its coefficient.',
    'nomogram': 'A chart with one scale per predictor; points read from each scale are added and read off as a risk.',
    'score chart': 'A table of rounded points for each predictor, with a way to turn the total score into a risk.',
    'common denominator': 'One value of log-odds chosen to equal one point, so all coefficients are divided by the same number.',
    'confidence interval': 'A range for the true average risk of women like this one, reflecting random error in the coefficients.',
    'prediction interval': 'A range for an individual outcome; for a measured outcome it stays wide however large the sample.',
    'covariance matrix': 'A table of the variances of the coefficients and how their errors move together.'
  },
  explainers: [
    {
      id: 'points',
      title: 'From coefficients to points to a risk',
      scenes: [
        { svg: EX.svg((function () { var c = [['Previous preterm birth', 1.5], ['Chronic hypertension', 0.9], ['Bacteriuria', 0.7], ['Tobacco use', 0.6]], s = EX.text(40, 34, 'Coefficients (change in log-odds) from the formula', { size: 'm', bold: true }); c.forEach(function (r, i) { var y = 70 + i * 50; s += EX.text(40, y + 20, r[0], { d: 0.2 * i }) + EX.rect(230, y, r[1] * 150, 28, { role: 'pred', op: 0.55, grow: true, d: 0.3 + 0.2 * i }) + EX.text(240 + r[1] * 150, y + 20, r[1].toFixed(1), { d: 0.6 + 0.2 * i }); }); return s; })()),
          say: 'Start from the formula. Each yes or no predictor has a coefficient: the change in log-odds it adds. A previous preterm birth adds 1.5, chronic hypertension 0.9, bacteriuria 0.7 and tobacco use 0.6.' },
        { svg: EX.svg((function () { var c = [['Previous preterm birth', 1.5, '5'], ['Chronic hypertension', 0.9, '3'], ['Bacteriuria', 0.7, '2.33, so 2'], ['Tobacco use', 0.6, '2']], s = EX.text(40, 34, 'Divide by a common denominator: 1 point = 0.3', { size: 'm', bold: true }); c.forEach(function (r, i) { var y = 70 + i * 50; s += EX.text(40, y + 20, r[0]) + EX.rect(230, y, r[1] * 150, 28, { role: 'pred', op: 0.25 }) + EX.text(240 + r[1] * 150, y + 20, r[2] + ' points', { bold: true, d: 0.4 + 0.3 * i }); }); s += EX.text(40, 285, 'Hb: 1 point per g/dL below 11. BMI: 1 point per 5 below 22.', { size: 's', d: 1.8 }); return s; })()),
          say: 'Choose one value of log-odds to equal one point, here 0.3, and divide every coefficient by it. A previous preterm birth earns 5 points. Bacteriuria earns 2.33, rounded to 2. Haemoglobin and B M I earn points for each step below a reference value.' },
        { svg: EX.svg(EX.text(40, 34, 'A woman: tobacco use, Hb 9 g/dL, BMI 19', { size: 'm', bold: true }) + EX.rect(60, 90, 120, 40, { role: 'pred', op: 0.5, grow: true, d: 0.3 }) + EX.text(120, 115, 'Tobacco 2', { anchor: 'middle', d: 0.5 }) + EX.rect(185, 90, 120, 40, { role: 'pred', op: 0.5, grow: true, d: 0.9 }) + EX.text(245, 115, 'Hb 2', { anchor: 'middle', d: 1.1 }) + EX.rect(310, 90, 36, 40, { role: 'pred', op: 0.5, grow: true, d: 1.5 }) + EX.text(328, 150, 'BMI 0.6', { anchor: 'middle', d: 1.7 }) + EX.text(40, 210, 'Total score = 2 + 2 + 0.6 = 4.6 points', { size: 'l', bold: true, d: 2.2 })),
          say: 'Now score a woman. She uses tobacco, so 2 points. Her haemoglobin is 9, two grams below 11, so 2 more. Her B M I is 19, three units below 22, which gives 0.6. Her total is 4.6 points.' },
        { svg: EX.svg((function () { var B = EX.box({ l: 80, t: 50, w: 420, h: 170, xlim: [-2, 14], ylim: [0, 0.8], xticks: [0, 4, 8, 12], yticks: [0, 0.4, 0.8], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Total score', ylabel: 'Risk' }), f = function (sc) { return 1 / (1 + Math.exp(-(-2.3 + 0.3 * sc))); }, s = EX.text(40, 30, 'Risk = 1 ÷ (1 + e^−(−2.3 + 0.3 × score))', { size: 'm', bold: true }) + B.s; s += EX.curve(B, f, -2, 14, { role: 'pred', d: 0.4 }) + EX.pts(B, [[4.6, f(4.6)]], { r: 6, d: 1.4 }) + EX.text(B.X(4.6) + 12, B.Y(f(4.6)) - 8, '4.6 points: 28.5%', { bold: true, d: 1.6 }); return s; })()),
          say: 'The score is turned back into a risk. A logistic model fitted to the score gives the intercept, minus 2.3, and 0.3 log-odds per point. At 4.6 points her risk is 28.5 per cent: about 29 in 100 women like her deliver early.' },
        { svg: EX.svg((function () { var B = EX.box({ l: 80, t: 50, w: 420, h: 170, xlim: [-2, 14], ylim: [0, 0.8], xticks: [0, 4, 8, 12], yticks: [0, 0.4, 0.8], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Total score', ylabel: 'Risk' }), f = function (sc) { return 1 / (1 + Math.exp(-(-2.3 + 0.3 * sc))); }, s = EX.text(40, 30, 'Rounding bacteriuria from 2.33 to 2 points', { size: 'm', bold: true }) + B.s; s += EX.curve(B, f, -2, 14, { role: 'pred', draw: false }) + EX.pts(B, [[7.63, f(7.63)]], { r: 5, role: 'obs', d: 0.5 }) + EX.pts(B, [[7.3, f(7.3)]], { r: 5, role: 'pred', d: 1.0 }) + EX.gaps(B, [[7.46, f(7.3), f(7.63)]], { d: 1.5 }) + EX.text(B.X(7.6) + 14, B.Y(0.5) - 6, 'Formula 49.8%', { size: 's', d: 0.7 }) + EX.text(B.X(7.6) + 14, B.Y(0.5) + 26, 'Score 47.3%', { size: 's', d: 1.2 }); return s; })()),
          say: 'Rounding costs a little. For a woman with a previous preterm birth and bacteriuria, the formula gives 49.8 per cent. Her rounded score gives 47.3 per cent. The red gap is the error from dropping one third of a point.' },
        { svg: EX.svg(EX.text(40, 40, 'Why odds ratios cannot be points', { size: 'l', bold: true }) + EX.text(40, 90, 'Odds ratios: 4.5, 2.5, 2.0, 1.8', { d: 0.5 }) + EX.text(40, 120, 'A predictor with no effect (odds ratio 1.0) would earn 1 point', { d: 1.1 }) + EX.text(40, 150, 'A protective factor (odds ratio 0.5) would still add points', { d: 1.7 }) + EX.text(40, 200, 'The model adds log-odds, so points must follow coefficients', { bold: true, d: 2.4 }) + EX.text(40, 240, 'Always publish the full formula as well', { d: 3.0 })),
          say: 'Never use odds ratios as points. A predictor with no effect has an odds ratio of 1, and would still earn a point. A protective factor would add points. The model adds log-odds, so points must follow the coefficients.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'From odds ratios to an absolute risk',
      aim: 'tell a prediction model from a decision rule, and calculate a risk from a published formula.',
      minutes: 15,
      need: `
<p>Papers often give a table of odds ratios. That is <b>not enough</b> to calculate a woman's risk. You also need the <b>intercept</b> (for a survival model, the baseline hazard). A model that cannot give a risk for a new woman has not really been presented.</p>
<p>A <b>prediction model</b> gives an absolute risk, and leaves the action to the clinician and the woman. A <b>decision rule</b> recommends an action, such as "refer if the risk is above 20%". It is made from a model by adding a threshold, which needs clinical input about harms and benefits.</p>
<p><b>Using a formula takes two steps.</b> (1) Add up the linear predictor: lp = intercept + each coefficient × the woman's value. (2) Turn it into a risk: risk = 1 ÷ (1 + e<sup>−lp</sup>).</p>
<p>The coding must be exact. Yes/no predictors are coded 1 = yes, 0 = no. Categories need a stated reference group. Continuous predictors need units (g/dL or g/L) and any transformation. If a predictor was <b>centred</b>, the user must subtract the centring value first.</p>
<p><b>Worked example</b> (Illustrative, synthetic). lp = −2.3 + 1.5 × previous preterm birth + 0.9 × chronic hypertension + 0.6 × tobacco + 0.7 × bacteriuria − 0.3 × (Hb − 11) − 0.06 × (BMI − 22). A woman uses tobacco, has Hb 9 g/dL and BMI 19: lp = −2.3 + 0.6 − 0.3 × (−2) − 0.06 × (−3) = −2.3 + 0.6 + 0.6 + 0.18 = −0.92. Risk = 1 ÷ (1 + e<sup>0.92</sup>) = 1 ÷ 3.51 = 28.5%: about 28 or 29 in 100 such women.</p>
<p><b>Shrinkage.</b> If the coefficients are shrunk after internal validation, the intercept must be re-estimated, so that the average predicted risk equals the observed rate in the development data.</p>`,
      scenario: `<p>Two requests reach the team. A neighbouring district wants to use a preterm birth model it found in a journal, but the paper gives only a table of odds ratios. The district programme officer asks the team for "a simple rule for whom to refer".</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'An absolute risk needs the intercept, exact coding and units; a decision rule is a model plus a threshold chosen on clinical grounds.'
    },
    {
      id: 'c2',
      title: 'How sure is a predicted risk?',
      aim: 'calculate a confidence interval for a predicted risk, and see what it leaves out.',
      minutes: 15,
      need: `
<p>A <b>confidence interval</b> shows uncertainty about the <i>average</i> risk of women like this one. It shrinks as the sample grows. For a measured outcome, a <b>prediction interval</b> shows where an <i>individual's</i> value may fall, and it stays wide however large the sample. A chart of cervical length by week of pregnancy from thousands of women has a narrow band around the average, but single women still vary widely.</p>
<p>For a yes/no outcome the predicted risk already expresses the uncertainty for the individual. A risk of 35% means she will either deliver early or not.</p>
<p><b>Calculation.</b> The standard error of the linear predictor comes from the <b>covariance matrix</b> V of the coefficients. For a woman with predictor values x (with a 1 for the intercept), SE(lp) = √(x<sup>T</sup> V x). Build the interval on the lp scale, then turn each limit into a risk, so the interval is not symmetric.</p>
<p><b>Worked example</b> (Illustrative, synthetic). A model with an intercept a and one predictor, previous preterm birth (b), has a = −2.1 and b = 1.5. For a woman without a previous preterm birth, x = (1, 0), so lp = −2.1 and SE(lp) = √var(a) = √0.0057 = 0.075. Her risk is 10.9%, with 95% interval 1 ÷ (1 + e<sup>2.25</sup>) to 1 ÷ (1 + e<sup>1.95</sup>) = 9.6% to 12.4%.</p>
<p><b>What it leaves out.</b> Total error is random plus systematic error. The interval shows only random error, and is valid only if the predictions have no systematic bias. Miscalibration in a new setting is not shown. Be wary when a large sample gives narrow intervals; wide intervals from a small sample are a useful warning. For decisions the point estimate still matters most.</p>`,
      scenario: `<p>The hospital computer system will show each woman's risk on screen. The obstetricians ask for an interval next to it. The referral hospital, where the model underestimated risk, asks whether a narrow interval means the risk is right for its women too.</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'A confidence interval for a risk reflects random error only; it is no protection against miscalibration in a new setting.'
    },
    {
      id: 'c3',
      title: 'Nomograms and score charts',
      aim: 'build a score chart from regression coefficients and see what rounding and grouping cost.',
      minutes: 20,
      need: `
<p>A <b>nomogram</b> draws the formula. Each predictor has a scale. You read the points for each of the woman's values, add them, and read the total down to a risk scale. The length of each line shows how much the predictor matters across its usual range. Nomograms can show interactions and non-linear terms, but they look complex at first sight, and reading errors add up.</p>
<p>A <b>score chart</b> gives rounded points per predictor, and a small table to turn the total into a risk. It is built in four steps.</p>
<ol>
<li><b>Round the coefficients</b> of yes/no predictors, using a <b>common denominator</b>. Multiplying by 10 and rounding is simple; smaller multipliers often work as well.</li>
<li><b>Score continuous predictors</b>: choose a sensible reference value that scores 0 (age 0 rarely is), find the values that score 1, 2 and so on, and interpolate between them.</li>
<li><b>Estimate the multiplier</b>: fit a logistic model with the total score as the only predictor, and multiply its coefficient by any shrinkage factor.</li>
<li><b>Estimate the intercept</b> with the shrunk score as an offset, and show the conversion from score to risk.</li>
</ol>
<p>Do not divide every coefficient by the smallest one: that rests all the points on one uncertain estimate. Never use odds ratios as points.</p>
<p><b>Worked example</b>. With 1 point = 0.3 log-odds, previous preterm birth (1.5) earns 5 points and tobacco (0.6) earns 2. The woman in Case 1 scores 2 + 2 + 0.6 = 4.6. With lp = −2.3 + 0.3 × score, her risk is 28.5%, as from the formula.</p>
<div data-explainer="points"></div>`,
      scenario: `<p>The midwives want a printed antenatal card with a score they can add by hand. The team's statistician builds it from the formula in Case 1, and also tries the course's score chart builder on a model fitted to ptb_dev.</p>`,
      widgets: `<div data-widget="scoreChartBuilder" data-try="Leave the continuous predictors categorised and move the points per log-odds from 4 down to 1, watching the c statistic of the points score fall below the full model."></div>`,
      tasks: [4, 5],
      takeaway: 'Score points must follow the coefficients through a common denominator; rounding them costs little, but the conversion back to risk must be published.'
    },
    {
      id: 'c4',
      title: 'Tables, rules and what to publish',
      aim: 'weigh the cost of simplified formats and decision rules, and decide what must be published.',
      minutes: 15,
      need: `
<p>A <b>table of predictions</b> shows the risk for combinations of predictor values. It is very easy to use, and advice can be attached to each cell. The price is that continuous predictors are cut into groups and risks are averaged within each cell.</p>
<p><b>Book example</b> (testicular cancer model). The c statistic was 0.839 for the formula and the nomogram, 0.838 for the score chart with continuous predictors, 0.808 when the continuous predictors were grouped, and 0.773 for a simple table. Rounding cost almost nothing; grouping and tabulating cost much more.</p>
<p>Decision rules come in several forms: a <b>tree</b> of yes/no splits (easy, but unstable with limited data); a <b>score chart rule</b> with heavily rounded points, such as one point per risk factor (easy to remember, but less accurate, especially in calibration); <b>risk groups</b> (stable, but cut-offs often follow the spread of risk, not decision reasoning); and a <b>meta-model</b>, a simple tree that copies a complex model's decisions.</p>
<p><b>Book example</b> (minor head injury rule). It had 100% sensitivity in its development data. In bootstrap validation the average was 96%, and only 56% of bootstrap samples reached 100%. A rule needs its own validation.</p>
<p><b>Minimum reporting.</b> Whatever the format: the intercept and all coefficients (after shrinkage, intercept re-estimated); coding, units, transformations, centring values and spline knots; the outcome and its time horizon; and, for a score chart, the points, interpolation rules and the score-to-risk conversion.</p>`,
      scenario: `<p>A neighbouring hospital has published a "preterm risk score" and the district wants to adopt it. At the same time the team must decide how its own model will reach midwives, doctors and other researchers.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'Every simplification of a model has a price in accuracy; offer the format the user needs, and always publish the full formula beside it.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Prediction models, decision rules and formats',
      html: `
<p>A table of odds ratios with confidence intervals does not allow absolute risk to be calculated: that requires the intercept (logistic, linear) or the baseline hazard (survival). A <b>clinical prediction model</b> gives absolute risk; for a good model predictions span a wide range. A <b>clinical decision rule</b> recommends an action and needs subject-matter input, especially on the threshold. Some argue that decision rules ease wide application (for example the Ottawa ankle, knee and head rules). The two are not synonymous.</p>
<table class="data">
<tr><th>Format</th><th>Accuracy</th><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Regression formula</td><td>Exact</td><td>Simple; can be computerised</td><td>Calculation left to the user; CI hard by hand</td></tr>
<tr><td>Spreadsheet or software</td><td>Exact, with exact 95% CI</td><td>Familiar; easy to distribute</td><td>User must obtain and learn it</td></tr>
<tr><td>Nomogram</td><td>Quite exact, approximate CI</td><td>Graphical; handles interactions</td><td>Hard to understand at first sight</td></tr>
<tr><td>Score chart</td><td>Approximate</td><td>Easy to understand</td><td>Approximate predictions</td></tr>
<tr><td>Table of predictions</td><td>Averaged over categories</td><td>Very easy</td><td>Continuous predictors categorised</td></tr>
<tr><td>Regression tree (rule)</td><td>Large groups</td><td>Very easy</td><td>Unstable with limited data</td></tr>
<tr><td>Score chart rule</td><td>Highly rounded</td><td>Can be memorised</td><td>Inaccurate predictions</td></tr>
<tr><td>Risk groups (rule)</td><td>Large groups</td><td>Stable</td><td>Cut-offs follow the risk distribution, not decisions</td></tr>
<tr><td>Meta-model tree (rule)</td><td>Large groups</td><td>Very easy</td><td>Only the general pattern of the model</td></tr>
</table>
<p>Formats differ in medium, detail, display of uncertainty and user-friendliness.</p>
<p class="src">Source: Ch. 18, §18.1 (Table 18.1)</p>`
    },
    {
      id: 'n2',
      title: 'The regression formula',
      html: `
<p>Two steps: lp = β<sub>0</sub> + β<sub>1</sub>x<sub>1</sub> + … + β<sub>k</sub>x<sub>k</sub>; then p = 1 / (1 + exp(−lp)) for logistic regression. A Cox model additionally needs a baseline survival or hazard.</p>
<p>Coding: binary 0/1 with the meaning of 1 stated; categorical predictors as dummies with a stated reference (the most common or a natural category); continuous predictors with units and transformation (log, square root, spline); centring values if centred.</p>
<p>Illustrative (synthetic) unit error: in the Case 1 formula, entering Hb as 90 g/L instead of 9.0 g/dL gives −0.3 × (90 − 11) = −23.7 and a risk of practically 0%.</p>
<p><b>Shrinkage.</b> One option is to centre the predictors so the mean linear predictor is 0 and multiply lp by the shrinkage factor; the average prediction remains roughly correct, but the non-linear logistic transformation gives systematic error when predictions span a wide range or shrinkage is strong. Preferred: shrink the coefficients, then <b>re-estimate the intercept</b> so that the mean predicted risk equals the observed frequency.</p>
<p>The formula is the basis for spreadsheets, web calculators, hospital information systems and electronic records, which can show an approximate 95% CI.</p>
<p class="src">Source: Ch. 18, §18.2.1</p>`
    },
    {
      id: 'n3',
      title: 'Uncertainty around predictions',
      html: `
<p>Confidence intervals concern the average outcome for given characteristics and narrow with sample size; prediction intervals concern an individual and stay wide. For a binary outcome the probability already expresses individual uncertainty; regression predictions approach but never reach 0 or 1.</p>
<p>Total uncertainty = random + systematic error. A CI is valid only without systematic bias; miscalibration from different coding, missed predictors with different distributions or truly different effects is not shown. If no better estimate is available, following the model's estimate is the best one can do.</p>
<p>SE(lp) = √(x<sup>T</sup>Vx). For an intercept and one binary predictor with the predictor present, var(lp) = var(a) + var(b) + 2cov(a, b). Each combination of predictor values has its own SE, even at the same lp: easy in a formula or spreadsheet; in a nomogram or score chart the mean or median SE for a given lp can be shown. After shrinkage, the unshrunk covariance matrix can still be used; a penalised model's own matrix gives slightly smaller SEs.</p>
<p class="src">Source: Ch. 18, §18.2.2, §18.3.1</p>`
    },
    {
      id: 'n4',
      title: 'Nomograms',
      html: `
<p>One axis per predictor, a <b>points</b> axis (0-10 or 0-100), a <b>total points</b> axis and a probability axis. Points are proportional to coefficient × value, rescaled so that the predictor with the widest range of effect spans the points axis; total points are linear in lp; the probability axis applies the logistic transformation. A frequency format helps patients: "of 100 women like you, about 28 would deliver early".</p>
<p><b>Advantages:</b> line length shows relative importance (if the values cover the predictor's distribution); interactions as separate lines; non-linear terms and complex (for example time-dependent survival) models; approximate CIs or extra outcome scales. <b>Disadvantages:</b> complex at first sight; reading error accumulates with many predictors; no clear evidence that clinicians prefer nomograms to score charts.</p>
<div class="callout book"><b>Book example</b><p>A nomogram for benign histology after chemotherapy for testicular cancer used six predictors from a penalised logistic model, with a maximum of 10 points per predictor, accepting some loss of accuracy in summing points.</p></div>
<div class="callout warn"><b>Pitfall</b><p>A model published only as a nomogram with non-linear terms is hard to validate. Publish the full formula alongside.</p></div>
<p class="src">Source: Ch. 18, §18.2.3, §18.3.2; Ch. 17, §17.3.5</p>`
    },
    {
      id: 'n5',
      title: 'Score charts',
      html: `
<p>Steps: (1) round coefficients with a common denominator (for example × 10); (2) score continuous predictors from a sensible reference value, with values for +1, +2 (and +0.5) and linear interpolation; (3) multiplier = coefficient of the total score in a logistic model, times any shrinkage factor; (4) intercept with the shrunk score as offset.</p>
<div class="callout warn"><b>Pitfall</b><p>Dividing by the smallest binary coefficient capitalises on one estimate. Odds ratios as points are wrong: OR 1.0 would earn 1 point, and weights are distorted (ORs 10 and 1.5 differ 6.7-fold; their coefficients 2.30 and 0.41 differ 5.7-fold).</p></div>
<div class="callout book"><b>Book example</b><p>Testicular cancer: three binary penalised coefficients of about 0.8, × 10/8 = 1 point each. LDH (log of value relative to the upper limit of normal, coefficient 0.88): 0 at 1 × normal, 1 at 2.5 × normal, 2 at about 6 × normal. Refitting the rescaled predictors gave coefficients around 0.8. The multiplier (about 0.86) times the shrinkage factor (0.95) gave about 0.81: lp = −1.94 + 0.81 × score. c 0.839 with the formula, 0.838 with rounded scores, 0.808 with categorised predictors.</p></div>
<p>The course's score chart builder fits its own 9-predictor model to ptb_dev. There, grouping age improves on a straight-line age term, because the true effect of age is U-shaped: a badly specified continuous term can cost more than grouping.</p>
<p class="src">Source: Ch. 18, §18.2.4, §18.3.3-18.3.4 (Tables 18.2, 18.4, 18.5)</p>`
    },
    {
      id: 'n6',
      title: 'Tables, rules and reporting',
      html: `
<p>Tables can carry colour-coded advice (for example statin recommendations by smoking, blood pressure, diabetes, cholesterol ratio and sex). Book example: testicular cancer c 0.839 (formula, nomogram, graphical formats), 0.838 (score chart, continuous), 0.808 (categorised), 0.773 (table: sum of five favourable characteristics against residual mass size).</p>
<p>A meta-model inherits any shrinkage of the underlying model. Book example: a CT rule after minor head injury (one of ten major or two of eight minor factors, from rounded coefficients and categorised predictors) had 100% sensitivity for neurosurgical intervention at development, 96% on average in bootstrap validation (100% in 56% of samples), and 25% specificity. Illustrative: a referral rule such as "refer if score ≥ 3" needs a threshold chosen from the harms of unnecessary referral and missed preterm birth, and its own validation.</p>
<p><b>Choosing a format.</b> Match the audience (nomograms are standard in prostate cancer; iso-probability curves of pre- and post-treatment mass size were drawn for radiologists). There is no convincing evidence that one format communicates better. Computerised presentation is likely to grow.</p>
<p><b>Minimum reporting:</b> intercept (or baseline survival at stated times) and coefficients after shrinkage with re-estimated intercept; coding, reference categories, units, transformations, centring values, knots; outcome definition and horizon; for score charts, points, interpolation rules, multiplier and intercept.</p>
<p class="src">Source: Ch. 18, §18.2.5-18.2.6, §18.3.5, §18.4-18.5 (Tables 18.3, 18.5)</p>`
    }
  ],
  keyPoints: [
    'A table of odds ratios is not a prediction model; absolute risk needs the intercept or baseline hazard.',
    'Prediction models give absolute risks; decision rules add a threshold and an action, which needs clinical input.',
    'A regression formula is applied in two steps: linear predictor, then the logistic transformation; coding and units must be explicit.',
    'After shrinking coefficients, re-estimate the intercept to keep calibration-in-the-large correct.',
    'Confidence intervals for predictions reflect random error only and are valid only without systematic miscalibration.',
    'Score chart points must be proportional to regression coefficients; use a common denominator, not the smallest coefficient, and never odds ratios.',
    'Rounding scores costs little discrimination; categorising continuous predictors and tabulating predictions cost more.',
    'Always publish the full formula alongside any nomogram, score chart or table.'
  ],
  quiz: [
    {
      q: 'A paper on preterm birth gives only a table of adjusted odds ratios, with 95% intervals, for six predictors. Can the team calculate a predicted risk for a new woman?',
      options: [
        'Yes, by multiplying the odds ratios that apply to her.',
        'Yes, by adding the odds ratios and dividing by six.',
        'Yes, if the overall rate of preterm birth is also given.',
        'No: the intercept, and the exact coding and units, are needed.'
      ],
      answer: 3,
      why: 'Odds ratios are relative effects. Multiplying them gives her odds relative to a reference woman, not her risk. The overall rate does not give the intercept unless every predictor was centred in a stated way. Only the intercept, with exact coding and units, places her linear predictor on an absolute scale.'
    },
    {
      q: 'A preterm model has lp = −3.0 + 1.5 × previous preterm birth + 0.9 × chronic hypertension. What is the predicted risk for a woman with both?',
      options: ['About 18%', 'About 35%', 'About 65%', 'About 85%'],
      answer: 1,
      why: 'lp = −3.0 + 1.5 + 0.9 = −0.6, and risk = 1 ÷ (1 + e<sup>0.6</sup>) = 1 ÷ 2.82 = 0.354. About 18% comes from leaving out chronic hypertension (lp −1.5). About 65% comes from reversing the sign of lp.'
    },
    {
      q: 'The team shrinks every coefficient of its preterm model by 0.85 but keeps the original intercept. What is the expected consequence?',
      options: [
        'Calibration-in-the-large is likely to be wrong, because the intercept was not re-estimated.',
        'Discrimination falls substantially.',
        'Nothing, because shrinkage affects only the slope.',
        'The calibration slope in new women moves further from 1.'
      ],
      answer: 0,
      why: 'Shrinking the coefficients changes the average linear predictor, so the mean predicted risk no longer matches the observed rate unless the intercept is re-estimated. Uniform shrinkage hardly changes c, because the ranking of women stays the same. Shrinkage is meant to bring the calibration slope in new women closer to 1, not further from it.'
    },
    {
      q: 'To build a preterm score chart, an analyst divides every coefficient by the smallest one (0.35, first pregnancy), so that predictor scores 1 point. What is the main objection?',
      options: [
        'Scores must be whole numbers between 0 and 10.',
        'All points then rest on one uncertain estimate; a common denominator across the coefficients is better.',
        'Yes/no predictors should not receive points.',
        'The chart cannot then be converted back to a risk.'
      ],
      answer: 1,
      why: 'Dividing by the smallest coefficient lets the imprecision of that single estimate drive every score. The book recommends a common denominator, such as multiplying by 10 or a smaller factor. Any rescaled score can still be converted back to risk by refitting the multiplier and intercept.'
    },
    {
      q: 'Book example: which presentation of the testicular cancer model lost the most discrimination?',
      options: [
        'The nomogram.',
        'The score chart with rounded points and continuous predictors.',
        'The simple table of predictions.',
        'The score chart with categorised continuous predictors.'
      ],
      answer: 2,
      why: 'c was 0.839 for the formula and nomogram, 0.838 for rounded continuous scores, 0.808 for categorised scores and 0.773 for the table. The common belief that rounding is the main cost is wrong: grouping and tabulating cost far more.'
    },
    {
      q: 'A preterm model developed in 20,000 women gives a woman at a new hospital a risk of 8% (95% interval 7.6% to 8.4%). The model has not been validated there. How should the narrow interval be read?',
      options: [
        'Her true risk is almost certainly between 7.6% and 8.4%.',
        'The model must be well calibrated in the new hospital.',
        'She will deliver early with a probability between 7.6% and 8.4% in any setting.',
        'It reflects random error only; miscalibration in the new setting is not included.'
      ],
      answer: 3,
      why: 'A confidence interval for a prediction is valid only if there is no systematic bias. A large development sample gives narrow intervals, but miscalibration from a different case-mix or different coefficients is not shown. The other options mistake precision for accuracy.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'An odds ratio table and a request for a rule',
      level: 'Understand',
      scenario: `<p>The journal paper found by the neighbouring district reports adjusted odds ratios: previous preterm birth 4.5, chronic hypertension 2.5, bacteriuria 2.0, tobacco 1.8, and haemoglobin 0.74 per g/dL. There is no intercept and no statement of units. The programme officer asks for "a simple rule for whom to refer".</p>`,
      questions: [
        '<b>(a)</b> Why can the district not calculate a woman\'s risk from this paper?',
        '<b>(b)</b> List what the authors would need to supply.',
        '<b>(c)</b> How does a decision rule differ from a prediction model, and what extra decision does it need?'
      ],
      answer: `<p><b>(a)</b> Odds ratios are relative effects. Multiplying them gives a woman's odds relative to a reference woman, but the odds of that reference woman (the intercept) are unknown, so no absolute risk can be found. The haemoglobin odds ratio cannot be used safely either, because the unit (g/dL or g/L) and any centring are not stated.</p>
<p><b>(b)</b> The intercept and all coefficients (after any shrinkage, with the intercept re-estimated); coding of each predictor (what 1 means, reference categories); units, transformations and centring values; and the outcome definition (before 37 weeks, dating method) and time horizon.</p>
<p><b>(c)</b> A prediction model gives an absolute risk and leaves the action to the clinician and the woman. A decision rule recommends an action for each combination of characteristics. It is made by adding a threshold to a model, and the threshold must be chosen from the relative harms of an unnecessary referral and a missed preterm birth. That is a clinical and programme decision, not a statistical one.</p>`
    },
    {
      id: 't1',
      title: 'Calculate risks from the formula',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The team's formula is:</p>
<div class="formula">lp = −2.3 + 1.5 × previous preterm birth + 0.9 × chronic hypertension + 0.6 × tobacco + 0.7 × bacteriuria − 0.3 × (Hb − 11) − 0.06 × (BMI − 22)</div>
<p>Hb is in g/dL and BMI in kg/m². Yes/no predictors are coded 1 = yes. Woman A has had a previous preterm birth and has bacteriuria; she has no hypertension and no tobacco use, Hb 10.2 g/dL and BMI 24.5.</p>`,
      questions: [
        '<b>(a)</b> Calculate woman A\'s linear predictor and risk.',
        '<b>(b)</b> What is the risk of a woman with no risk factors, Hb 11 and BMI 22? Why is this the intercept?',
        '<b>(c)</b> A clerk enters woman A\'s Hb as 102 g/L. What risk results?',
        '<b>(d)</b> The coefficients were shrunk by 0.9 after bootstrapping. What must have been done to the intercept?'
      ],
      answer: `<p><b>(a)</b> lp = −2.3 + 1.5 + 0.7 − 0.3 × (10.2 − 11) − 0.06 × (24.5 − 22) = −2.3 + 1.5 + 0.7 + 0.24 − 0.15 = −0.01. Risk = 1 ÷ (1 + e<sup>0.01</sup>) = 0.498, about 50%.</p>
<p><b>(b)</b> All terms are 0, so lp = −2.3 and risk = 1 ÷ (1 + e<sup>2.3</sup>) = 9.1%. Because Hb and BMI are centred at 11 and 22, the intercept is the log-odds for a woman at these reference values with no risk factors.</p>
<p><b>(c)</b> −0.3 × (102 − 11) = −27.3, so lp = −2.3 + 1.5 + 0.7 − 27.3 − 0.15 = −27.55, a risk of practically 0%. A woman at about 50% risk would look risk-free. Units must be stated beside the formula and checked in any calculator.</p>
<p><b>(d)</b> After shrinking, the intercept must be re-estimated (with the shrunk linear predictor as an offset), so that the average predicted risk equals the observed rate of preterm birth in the development data. Keeping the old intercept leaves calibration-in-the-large wrong.</p>`
    },
    {
      id: 't2',
      title: 'A confidence interval for a risk',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A simple model has an intercept a = −2.1 and one predictor, previous preterm birth, with coefficient b = 1.5. Its covariance matrix gives var(a) = 0.0057, var(b) = 0.0300 and cov(a, b) = −0.0057.</p>`,
      questions: [
        '<b>(a)</b> Calculate the predicted risk for a woman with a previous preterm birth.',
        '<b>(b)</b> Calculate var(lp) and SE(lp) for her, using x = (1, 1).',
        '<b>(c)</b> Calculate the 95% interval for her risk. Why is it not symmetric?',
        '<b>(d)</b> Why is her interval wider than that of a woman without a previous preterm birth (9.6% to 12.4%)?'
      ],
      answer: `<p><b>(a)</b> lp = −2.1 + 1.5 = −0.6. Risk = 1 ÷ (1 + e<sup>0.6</sup>) = 1 ÷ 2.82 = 0.354.</p>
<p><b>(b)</b> var(lp) = var(a) + var(b) + 2 cov(a, b) = 0.0057 + 0.0300 − 0.0114 = 0.0243. SE = √0.0243 = 0.156.</p>
<p><b>(c)</b> lp limits: −0.6 ± 1.96 × 0.156 = −0.906 to −0.294. Risks: 1 ÷ (1 + e<sup>0.906</sup>) = 0.288 and 1 ÷ (1 + e<sup>0.294</sup>) = 0.427. So 35.4% (28.8% to 42.7%). The interval is symmetric on the log-odds scale and becomes asymmetric after the logistic transformation.</p>
<p><b>(d)</b> Fewer women have had a previous preterm birth, so b is less precise (var 0.0300) than a (0.0057). Her lp uses both, so her SE (0.156) is about twice that of a woman without (√0.0057 = 0.075).</p>`
    },
    {
      id: 't3',
      title: 'A narrow interval at the referral hospital',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). At the referral hospital, a woman with a previous preterm birth is shown "35.4% (28.8% to 42.7%)" by the simple model in the last task. External validation there found calibration-in-the-large of +0.29: the observed odds of preterm birth were exp(0.29) = 1.34 times the predicted odds.</p>`,
      questions: [
        '<b>(a)</b> If the miscalibration applies to her, what is her risk after adding 0.29 to her lp?',
        '<b>(b)</b> What does the displayed interval include, and what does it leave out?',
        '<b>(c)</b> A colleague says "her risk is uncertain, so we should not use a number at all". Respond.',
        '<b>(d)</b> How should the risk be shown to the woman herself?'
      ],
      answer: `<p><b>(a)</b> lp = −0.6 + 0.29 = −0.31. Risk = 1 ÷ (1 + e<sup>0.31</sup>) = 0.423, about 42%, near the upper end of the displayed interval.</p>
<p><b>(b)</b> It includes random error in the coefficients from the development sample. It leaves out systematic error, such as miscalibration from a different case-mix or different effects in a new setting. It is valid only if the predictions are unbiased there. It also does not express that she either will or will not deliver early.</p>
<p><b>(c)</b> For decisions the point estimate matters most; if no better estimate is available, following the model's estimate is the best one can do. The right response to the miscalibration is to update the intercept for the referral hospital, not to drop the number.</p>
<p><b>(d)</b> As a frequency: "of 100 women like you, about 35 deliver before 37 weeks" (about 42 at the referral hospital after updating). The risk itself already expresses the uncertainty for her as an individual.</p>`
    },
    {
      id: 't4',
      title: 'Build the antenatal score chart by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). Use the formula from the earlier task. One point equals 0.3 log-odds. Hb scores 0 at 11 g/dL and BMI scores 0 at 22 kg/m². A refit in the development data gives lp = −2.3 + 0.3 × score.</p>`,
      questions: [
        '<b>(a)</b> Give the points for each yes/no predictor (rounded to whole numbers) and the points per unit for Hb and BMI.',
        '<b>(b)</b> Score woman A (previous preterm birth, bacteriuria, Hb 10.2, BMI 24.5) without rounding the continuous items, and convert her score to a risk.',
        '<b>(c)</b> Her formula risk was 49.8%. Explain the difference.',
        '<b>(d)</b> A colleague suggests points equal to the odds ratios (previous preterm birth 4.5, chronic hypertension 2.5, bacteriuria 2.0, tobacco 1.8). Explain why this is wrong.'
      ],
      answer: `<p><b>(a)</b> Previous preterm birth 1.5 ÷ 0.3 = 5; chronic hypertension 0.9 ÷ 0.3 = 3; tobacco 0.6 ÷ 0.3 = 2; bacteriuria 0.7 ÷ 0.3 = 2.33, rounded to 2. Hb: 0.3 ÷ 0.3 = 1 point per g/dL below 11 (minus 1 per g/dL above). BMI: 0.06 ÷ 0.3 = 0.2 points per unit below 22, that is 1 point per 5 units.</p>
<p><b>(b)</b> 5 + 2 + (11 − 10.2) × 1 + (22 − 24.5) × 0.2 = 5 + 2 + 0.8 − 0.5 = 7.3. lp = −2.3 + 0.3 × 7.3 = −0.11. Risk = 1 ÷ (1 + e<sup>0.11</sup>) = 47.3%.</p>
<p><b>(c)</b> Bacteriuria was rounded from 2.33 to 2 points, so it contributes 2 × 0.3 = 0.6 log-odds instead of 0.7. Her lp is 0.1 lower (−0.11 against −0.01), and her risk 2.5 percentage points lower. The continuous items were not rounded, so they add no error. In a real chart the multiplier and intercept are re-estimated from the rounded scores, which partly makes up for this on average.</p>
<p><b>(d)</b> The model adds log-odds, so points must be proportional to the coefficients. Odds ratios distort the weights: previous preterm birth against chronic hypertension is 4.5 ÷ 2.5 = 1.8 with odds ratios, but 1.5 ÷ 0.9 = 1.67 with coefficients. The distortion grows with larger effects (book: odds ratios 10 and 1.5 differ 6.7-fold, their coefficients 2.30 and 0.41 only 5.7-fold). A predictor with no effect (OR 1.0) would earn 1 point, a protective factor would add points, and the sum has no defined relation to risk.</p>`
    },
    {
      id: 't5',
      title: 'What the score chart builder shows',
      level: 'Analyse',
      scenario: `<p>Use the score chart builder in this case. It fits a 9-predictor model to the complete cases of ptb_dev (1,548 women, 182 preterm births). Its defaults are 4 points per 1.0 of log-odds and "Categorise" for age, BMI and Hb.</p>`,
      questions: [
        '<b>(a)</b> At the defaults, record the c of the points score, the c of the full regression model, the score range, and the points for previous preterm birth.',
        '<b>(b)</b> Move the slider to 1. Record the two c statistics and the points. Why does c fall?',
        '<b>(c)</b> Return to 4 and choose "Keep continuous (linear)". Both c statistics fall. Why, when the book found that categorising lowers c?',
        '<b>(d)</b> In the patient form enter age 24, BMI 19, Hb 9.5, previous preterm birth and tobacco use, with the other boxes empty. Compare the two risks at 4 and at 1 point per log-odds (categorised).'
      ],
      answer: `<p><b>(a)</b> c of the points score 0.727 against 0.729 for the full model (difference −0.002); score range 0 to 22; previous preterm birth 6 points (coefficient 1.495 × 4 = 5.98).</p>
<p><b>(b)</b> c falls to 0.697 (full model still 0.729), and the score range shrinks to 0 to 4. At 1 point per log-odds most coefficients round to 0 or 1 (previous preterm birth 1 point, Hb 9 to 10.9 and tobacco 0 points), so women with quite different risks get the same score. Very coarse rounding loses discrimination; 4 points per log-odds already loses almost nothing.</p>
<p><b>(c)</b> The continuous model gives c 0.664 (score 0.663). In these synthetic data the true effect of age is U-shaped (higher risk for young and older women), and low Hb and low BMI act mainly below a threshold. A straight-line term for each misses this, while the groups (age under 20 and 35 or more; Hb below 9 and 9 to 10.9; BMI below 18.5 and 25 or more) capture it. The book's comparison assumed the continuous predictors were well modelled. The lesson is that a badly specified continuous term can cost more than grouping; the best option is a flexible continuous term (Module 6), not grouping.</p>
<p><b>(d)</b> At 4 points per log-odds: score 10 (Hb 9 to 10.9: 2, previous preterm birth: 6, tobacco: 2), risk from score 27.9%, from the model 27.9%. At 1: score 1, risk from score 13.5% against 27.9% from the model. Coarse rounding badly misplaces this woman, because two of her risk factors earn no points.</p>`
    },
    {
      id: 't6',
      title: 'Critique a published preterm risk score',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A neighbouring hospital publishes a "preterm risk score" developed in 600 women. The paper gives a table of odds ratios. Points were made by rounding each odds ratio (previous preterm birth OR 4.5 = 5 points; baby's sex OR 1.1 = 1 point). Hb and BMI were each cut at the value that gave the largest odds ratio. The score comes with a recommendation: "score of 6 or more: refer for cervical length scan", which had 100% sensitivity in the development data. The paper also shows a nomogram from a separate model with a spline for age, but no formula or intercept.</p>`,
      questions: [
        '<b>(a)</b> Identify the problems with how the model is presented.',
        '<b>(b)</b> What would the district need in order to validate the score, and what should it expect of the 100% sensitivity?',
        '<b>(c)</b> Rewrite the presentation plan.'
      ],
      answer: `<p><b>(a)</b></p>
<ol>
<li><b>Critical:</b> points from odds ratios. The score is not proportional to log-odds: a predictor with almost no effect (baby's sex, OR 1.1) earns 1 point, and the weights are distorted. The sum has no defined relation to risk.</li>
<li>No conversion from score to risk (no multiplier or intercept), so absolute risks cannot be found.</li>
<li>Hb and BMI cut at data-chosen "optimal" points: information is lost and the effects are biased upwards.</li>
<li>The referral threshold (6 or more) is given without reasons in terms of the harms of unnecessary scans against missed preterm births.</li>
<li>100% sensitivity is an apparent result in the development data, and is optimistic.</li>
<li>A nomogram with a spline and no formula cannot be reconstructed reliably, so external validation is error-prone.</li>
</ol>
<p><b>(b)</b> The full formula: intercept, coefficients, coding, units (Hb in g/dL, BMI in kg/m²), spline knot positions, and the outcome definition (before 37 weeks, how dated). It should expect sensitivity below 100% in its own women. In the book's head injury example, a rule with 100% apparent sensitivity averaged 96% in bootstrap validation, and reached 100% in only 56% of samples. It should also check calibration-in-the-large locally.</p>
<p><b>(c)</b> Publish the full formula, with shrinkage and a re-estimated intercept. Keep Hb, BMI and age continuous with suitable flexible terms. Build the score chart from the coefficients with a common denominator, interpolation for continuous predictors, and a table from score to risk. Report c for the score and for the full model. Present any referral threshold as a separate decision rule, with its reasons and internally validated sensitivity and specificity. Give the nomogram only as a supplement to the formula.</p>`
    },
    {
      id: 't7',
      title: 'Design the presentation package',
      level: 'Create',
      scenario: `<p>The team's validated model will reach three groups: midwives at sub-centres with a printed antenatal card and no computer; doctors at the district hospital, whose electronic record can run a calculator; and researchers who want to validate or update the model elsewhere.</p>`,
      questions: [
        '<b>(a)</b> Choose a format for each group, and give one advantage and one cost of each.',
        '<b>(b)</b> List the items that must be published whatever format is used.',
        '<b>(c)</b> The programme wants the card to say "refer if 4 points or more". What must happen before this is printed?'
      ],
      answer: `<p><b>(a)</b> <b>Midwives:</b> a score chart with whole points for yes/no predictors, interpolated points for Hb and BMI, and a small table from total score to risk (for example as "out of 100 women"). It is easy to use, but predictions are approximate. A table of predictions would be easier still, but grouping costs more discrimination (book: 0.773 against 0.839). <b>Doctors:</b> the regression formula built into the electronic record, showing the exact risk and an approximate 95% interval. It is exact, but depends on correct units and coding in the software. <b>Researchers:</b> the full formula with its covariance matrix (or a spreadsheet), so the model can be validated, recalibrated and updated. A nomogram may be added as a picture, but never alone.</p>
<p><b>(b)</b> The intercept and all coefficients after shrinkage, with the intercept re-estimated; coding of every predictor, reference categories, units, transformations and centring values (and knots if splines are used); the outcome definition and time horizon (before 37 weeks, dating method); and for the score chart the points, interpolation rules and the score-to-risk conversion (multiplier and intercept).</p>
<p><b>(c)</b> This turns the model into a decision rule. The threshold must be chosen from the harms of unnecessary referral against those of a missed preterm birth, with clinical and programme input, and the rule's sensitivity, specificity and net benefit must be validated, ideally in new women, rather than assumed from the development data.</p>`
    }
  ]
});
