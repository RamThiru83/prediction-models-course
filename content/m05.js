registerModule({
  id: 'm05',
  num: 5,
  part: 'Development',
  title: 'Missing values',
  book: 'Ch. 7 and 8',
  minutes: 75,
  summary: 'How missing predictor values waste information and can bias a prediction model, the MCAR, MAR and MNAR mechanisms, and how to build and use single and multiple imputation correctly.',
  objectives: [
    'Count the cost of complete case analysis',
    'Classify missingness as MCAR, MAR or MNAR',
    'Predict when complete cases bias coefficients',
    'Compare mean, regression and multiple imputation',
    'Pool imputed results with Rubin\'s rules',
    'Build an imputation model with the outcome'
  ],
  format: 'cases',
  reading: [
    { cite: "Sterne JAC, White IR, Carlin JB, et al. (2009). Multiple imputation for missing data in epidemiological and clinical research: potential and pitfalls. BMJ 338:b2393.", url: "https://doi.org/10.1136/bmj.b2393", note: "The standard tutorial on when multiple imputation helps, how to do it, and how to report it." },
    { cite: "White IR, Royston P, Wood AM (2011). Multiple imputation using chained equations: issues and guidance for practice. Stat Med 30:377-399.", url: "https://doi.org/10.1002/sim.4067", note: "Practical guidance on specifying the imputation model and the number of imputations, and on analysing imputed data." },
    { cite: "van der Heijden GJMG, Donders ART, Stijnen T, Moons KGM (2006). Imputation of missing values is superior to complete case analysis and the missing-indicator method in multivariable diagnostic research: a clinical example. J Clin Epidemiol 59:1102-1109.", url: "https://doi.org/10.1016/j.jclinepi.2006.01.015", note: "A worked prediction example showing how complete-case analysis and missing-indicator methods change the selected predictors." }
  ],
  essentials: `
<ul>
<li>Routine data have gaps: a haemoglobin result not filed, a BMI not recorded at booking. Most software then quietly drops every woman with any gap. This is <b>complete case analysis</b>.</li>
<li>A small share of missing values can remove a large share of women. In the book's example, 10% of values were missing but 50% of patients were dropped.</li>
<li>Why values are missing matters. <b>MCAR</b>: by pure chance. <b>MAR</b>: linked only to things we recorded. <b>MNAR</b>: linked to the missing value itself or to things we did not record. Only MCAR can be tested.</li>
<li>Complete case analysis is most dangerous when missingness is linked to the outcome. Then even the coefficients of complete predictors are biased.</li>
<li><b>Imputation</b> fills each gap with plausible values. <b>Multiple imputation</b> does this several times and combines the results with Rubin's rules, so the uncertainty about the filled-in values is counted.</li>
<li>The imputation model must include all predictors, helpful extra variables and the outcome. Leaving out the outcome weakens the predictors' effects.</li>
<li>Do not add a "missing" category. Report how many values were missing for each predictor and how many women and events each analysis used.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team is ready to fit its booking-visit model, but some booking haemoglobin and BMI values are missing. In this module it counts what dropping those women would cost, asks why the values are missing, sees what complete case analysis does to the coefficients, and fills the gaps with multiple imputation. You do not need the earlier modules for this story.',
  defs: {
    'complete case analysis': 'An analysis that drops every person with a missing value on any variable in the model.',
    'missing completely at random': 'Values are missing by pure chance, unrelated to anything about the person or the outcome (MCAR).',
    'missing at random': 'Whether a value is missing depends only on other information that was recorded, such as visits or the outcome (MAR).',
    'missing not at random': 'Whether a value is missing depends on the missing value itself or on things that were not recorded (MNAR).',
    'imputation': 'Filling in a missing value with a plausible value predicted from the other information.',
    'conditional mean imputation': 'Filling a gap with the single value predicted by a regression on other variables, with no random element.',
    'multiple imputation': 'Filling each gap several times with random plausible values, analysing each completed data set, and combining the results.',
    'auxiliary variable': 'A variable that is not in the prediction model but helps predict the missing values or whether they are missing.',
    'missing indicator method': 'Adding a separate "missing" category or indicator for a predictor; simple but often biased.',
    "rubin's rules": 'The rules that combine results from imputed data sets: average the estimates and add the spread between them to the uncertainty.'
  },
  explainers: (function () {
    var v = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 9];
    var hb = [11.0, 8.5, 10.4, 9.8, 9.9, 10.3, 9.3, 10.3, 10.2, 12.5, 10.8, 10.8, 10.8, 10.6, 10.4, 11.1, 11.5, 11.1, 12.1, 11.5, 11.9, 12.7, 12.4, 11.8];
    var box = function () { return EX.box({ l: 80, t: 50, w: 420, h: 190, xlim: [0, 10], ylim: [8, 13.5], xticks: [0, 2, 4, 6, 8, 10], yticks: [8, 10, 12], xlabel: 'Antenatal visits', ylabel: 'Haemoglobin (g/dL)' }); };
    var split = function (mis) { var o = [], m = []; v.forEach(function (x, i) { (mis.indexOf(i) >= 0 ? m : o).push([x, hb[i]]); }); return { o: o, m: m }; };
    var hline = function (B, y, role, d) { return EX.line([[B.X(0.2), B.Y(y)], [B.X(9.8), B.Y(y)]], { role: role, w: 2, d: d }); };
    var mcar = [2, 6, 10, 14, 17, 21], mar = [0, 1, 2, 3, 4, 6], mnar = [1, 3, 4, 5, 6, 8];
    return [
      {
        id: 'mechanisms',
        title: 'Three reasons a value can be missing',
        scenes: [
          { svg: EX.svg((function () { var B = box(); return B.s + EX.text(80, 32, '24 women: visits and booking haemoglobin', { size: 'm', bold: true }) + EX.pts(B, v.map(function (x, i) { return [x, hb[i]]; }), { role: 'obs', stagger: 0.05 }) + hline(B, 10.9, 'obs', 1.4) + EX.text(500, 66, 'true average 10.9', { size: 's', anchor: 'end', d: 1.6 }); })()),
            say: 'Each dot is a woman: her number of antenatal visits and her haemoglobin at booking. Women with fewer visits tend to have lower haemoglobin. The true average is 10.9 grams per decilitre.' },
          { svg: EX.svg((function () { var B = box(), s = split(mcar); return B.s + EX.text(80, 32, 'MCAR: six results lost when the analyser broke', { size: 'm', bold: true }) + EX.pts(B, s.o, { role: 'obs' }) + EX.pts(B, s.m, { role: 'line', r: 5, d: 0.4 }) + hline(B, 10.9, 'obs') + hline(B, 10.94, 'pred', 1) + EX.text(500, 66, 'average of women left: 10.9', { size: 's', anchor: 'end', d: 1.2 }); })()),
            say: 'Missing completely at random. Six results were lost when the analyser broke down. The grey dots are the lost values. The women left look like everyone else, so their average is still about right.' },
          { svg: EX.svg((function () { var B = box(), s = split(mar); return B.s + EX.text(80, 32, 'MAR: missing mostly in women with few visits', { size: 'm', bold: true }) + EX.pts(B, s.o, { role: 'obs' }) + EX.pts(B, s.m, { role: 'line', r: 5, d: 0.4 }) + hline(B, 10.9, 'obs') + hline(B, 11.27, 'pred', 1) + EX.gaps(B, [[9.5, 10.9, 11.27]], { d: 1.6 }) + EX.text(500, 66, 'average of women left: 11.3', { size: 's', anchor: 'end', d: 1.2 }); })()),
            say: 'Missing at random. Now the results are missing mostly in women with one or two visits. The women left are not typical, so their average, 11.3, is too high. The red gap is the error.' },
          { svg: EX.svg((function () { var B = box(), s = split(mar); return B.s + EX.text(80, 32, 'MAR can be repaired: we recorded the visits', { size: 'm', bold: true }) + EX.pts(B, s.o, { role: 'obs' }) + EX.curve(B, function (x) { return 9.464 + 0.312 * x; }, 0.5, 9.5, { role: 'pred', d: 0.3 }) + EX.pts(B, mar.map(function (i) { return [v[i], 9.464 + 0.312 * v[i]]; }), { role: 'pred', r: 5, d: 1.4, stagger: 0.12 }) + EX.text(500, 66, 'average after filling in: 11.0', { size: 's', anchor: 'end', d: 2.2 }); })()),
            say: 'But the visits were recorded. Among women with the same number of visits, those left still look like those missing. So a model that predicts haemoglobin from visits fills the gaps sensibly, and the average comes back to about 11.0.' },
          { svg: EX.svg((function () { var B = box(), s = split(mnar); return B.s + EX.text(80, 32, 'MNAR: missing because the haemoglobin was low', { size: 'm', bold: true }) + EX.pts(B, s.o, { role: 'obs' }) + EX.pts(B, s.m, { role: 'line', r: 5, d: 0.4 }) + hline(B, 10.9, 'obs') + hline(B, 11.32, 'pred', 1) + EX.gaps(B, [[9.5, 10.9, 11.32]], { d: 1.6 }) + EX.text(500, 66, 'average of women left: 11.3', { size: 's', anchor: 'end', d: 1.2 }); })()),
            say: 'Missing not at random. Here the six lowest results are missing, because those women were sent elsewhere for treatment and nobody recorded why. Nothing in the data shows this, so filling in from visits still leaves the average too high.' },
          { svg: EX.svg(EX.text(280, 100, 'Which mechanism? Only one can be tested', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 142, 'MCAR: can be tested, and is often rejected', { anchor: 'middle', d: 0.6 }) + EX.text(280, 168, 'MAR: cannot be tested; more recorded variables help', { anchor: 'middle', d: 1.2 }) + EX.text(280, 194, 'MNAR: can never be ruled out', { anchor: 'middle', d: 1.8 })),
            say: 'Missing completely at random can be tested, and is often rejected. Missing at random cannot be tested, but it becomes more believable as we record more of the reasons. Missing not at random can never be ruled out.' }
        ]
      },
      {
        id: 'mi',
        title: 'Multiple imputation in five steps',
        scenes: [
          { svg: EX.svg(EX.text(40, 50, 'One woman: booking haemoglobin not recorded', { size: 'm', bold: true }) + EX.text(60, 100, 'Visits before 28 weeks: 2', { d: 0.4 }) + EX.text(60, 128, 'Previous preterm birth: no', { d: 0.7 }) + EX.text(60, 156, 'Delivered before 37 weeks: yes', { d: 1 }) + EX.text(60, 196, 'Haemoglobin: ?', { size: 'l', bold: true, role: 'err', d: 1.4 })),
            say: 'One woman has no booking haemoglobin. We know her other predictors, and we know that she delivered early. All of this can help to fill the gap.' },
          { svg: EX.svg((function () { var B = EX.box({ l: 60, t: 90, w: 440, h: 100, xlim: [8, 13], ylim: [0, 1], xticks: [8, 9, 10, 11, 12, 13], xlabel: 'Haemoglobin (g/dL)' }); return B.s + EX.text(40, 50, 'Single best guess from a regression: 10.2', { size: 'm', bold: true }) + EX.pts(B, [[10.2, 0.5]], { role: 'pred', r: 7, d: 0.5 }) + EX.text(B.X(10.2), B.Y(0.5) - 16, '10.2', { anchor: 'middle', d: 0.7 }); })()),
            say: 'Regression imputation puts in one best guess, 10.2, predicted from the other variables. The analysis then treats it as if it had been measured. That is too certain.' },
          { svg: EX.svg((function () { var B = EX.box({ l: 60, t: 90, w: 440, h: 100, xlim: [8, 13], ylim: [0, 1], xticks: [8, 9, 10, 11, 12, 13], xlabel: 'Haemoglobin (g/dL)' }), d = [9.6, 10.5, 9.9, 10.8, 10.1]; return B.s + EX.text(40, 50, 'Five random draws: five completed data sets', { size: 'm', bold: true }) + EX.pts(B, d.map(function (x, i) { return [x, 0.2 + 0.15 * i]; }), { role: 'pred', r: 6, stagger: 0.3 }) + d.map(function (x, i) { return EX.text(B.X(x) + 10, B.Y(0.2 + 0.15 * i) + 4, x.toFixed(1), { size: 's', d: 0.3 * i + 0.2 }); }).join(''); })()),
            say: 'Multiple imputation draws five plausible values instead, scattered as widely as the imputation model is unsure: 9.6, 10.5, 9.9, 10.8 and 10.1. Each draw completes one copy of the data.' },
          { svg: EX.svg((function () { var B = EX.box({ l: 60, t: 80, w: 440, h: 130, xlim: [0.38, 0.54], ylim: [0, 1], xticks: [0.40, 0.45, 0.50], xfmt: function (x) { return x.toFixed(2); }, xlabel: 'Coefficient for low haemoglobin' }), c = [0.42, 0.47, 0.44, 0.50, 0.45]; return B.s + EX.text(40, 50, 'Analyse each copy; average the five answers', { size: 'm', bold: true }) + EX.pts(B, c.map(function (x, i) { return [x, 0.15 + 0.17 * i]; }), { role: 'obs', r: 6, stagger: 0.3 }) + EX.line([[B.X(0.456), B.Y(0.02)], [B.X(0.456), B.Y(0.98)]], { role: 'pred', d: 1.8 }) + EX.text(B.X(0.456) + 8, 74, 'pooled 0.456', { size: 's', d: 2 }); })()),
            say: 'Each completed data set is analysed in the usual way. The coefficient for low haemoglobin comes out at 0.42, 0.47, 0.44, 0.50 and 0.45. The pooled estimate is their average, 0.456.' },
          { svg: EX.svg(EX.text(40, 50, 'Rubin\'s rules: two sources of uncertainty', { size: 'm', bold: true }) + EX.text(40, 100, 'Within each data set (W)', { d: 0.2 }) + EX.rect(250, 86, 0.006465 * 30000, 20, { role: 'obs', d: 0.4 }) + EX.text(40, 140, 'Between the five answers, × 1.2', { d: 0.9 }) + EX.rect(250 + 0.006465 * 30000, 126, 0.001116 * 30000, 20, { role: 'pred', d: 1.1 }) + EX.text(40, 200, 'Standard error: 0.080 from W alone; 0.087 in total', { bold: true, d: 1.8 }) + EX.text(40, 230, 'Total variance = W + (1 + 1/M) × B', { size: 's', d: 2.2 })),
            say: 'Rubin\'s rules add two kinds of uncertainty: the usual one inside each data set, and the spread between the five answers. Together they raise the standard error from 0.080 to 0.087. A single imputation would ignore the second part.' },
          { svg: EX.svg(EX.text(280, 100, 'Put the outcome in the imputation model', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 142, 'Values drawn without it have no link with preterm birth', { anchor: 'middle', d: 0.6 }) + EX.text(280, 168, 'The coefficient is pulled towards zero', { anchor: 'middle', d: 1.2 }) + EX.text(280, 194, 'With half the values missing, it is roughly halved', { anchor: 'middle', d: 1.8 })),
            say: 'One rule matters most. The imputation model must include the outcome. Values drawn without it carry no link with preterm birth, so the coefficient is pulled towards zero. With half the values missing, it is roughly halved.' }
        ]
      }
    ];
  })(),
  cases: [
    {
      id: 'c1',
      title: 'What does dropping women cost?',
      aim: 'count how many women and events a complete case analysis loses, compared with the share of values that are missing.',
      minutes: 15,
      need: `
<p>This module is about missing values of <b>predictors</b>: a true value exists but was not recorded. Standard software quietly does a <b>complete case analysis</b>: any woman missing any predictor in the model is dropped. An <b>available case analysis</b> uses, for each analysis, the women complete for that analysis, so the numbers change from one analysis to the next. Both throw away what was recorded for women with some gaps. This causes three problems:</p>
<ol>
<li><b>Lost information</b>: fewer women and events, wider confidence intervals and more overfitting.</li>
<li><b>Hard interpretation</b>: if a crude odds ratio uses 450 women and an adjusted one uses 250, a change may come from confounding or just from the different women.</li>
<li><b>Possible bias</b> in coefficients and predictions, especially when missingness is linked to the outcome.</li>
</ol>
<div class="callout eg"><b>Worked example (book example, hypothetical data)</b>
<p>500 patients, 100 events, 5 predictors: events per variable (EPV) = 100 ÷ 5 = 20. Each predictor is missing for 10% of patients, and no patient misses more than one.</p>
<ol>
<li>Patients with a gap: 5 × 10% = 50%. A complete case analysis keeps 250 patients and about 50 events: EPV falls from 20 to 10.</li>
<li>Values present: 250 × 5 + 250 × 4 = 2,250 of the 2,500 needed, or 90%.</li>
<li>So 10% of values are missing, but 50% of patients are dropped.</li>
</ol>
<p>If gaps happen independently, some women have more than one gap and the loss is smaller. The share complete is (1 − m)<sup>k</sup> for k predictors each missing a share m: here 0.9<sup>5</sup> = 59%.</p></div>`,
      scenario: `<p>In the team's development cohort (<span data-live="ptb_dev_n"></span> women), booking haemoglobin is missing for <span data-live="ptb_hb_missing_pct"></span> and BMI for <span data-live="ptb_bmi_missing_pct"></span>. A complete case analysis of the full model would keep <span data-live="ptb_cc_n"></span> women with <span data-live="ptb_cc_events"></span> preterm births. A colleague says the gaps are small and the software can deal with them.</p>`,
      widgets: `<div data-widget="completeCaseLoss" data-try="Start at 5 predictors and 10% missing, then raise the predictors to 15 and watch the share of complete women and the EPV fall."></div><div data-widget="datasetCard" data-set="ptb_dev"></div>`,
      tasks: [0, 1],
      takeaway: 'A small share of missing values can remove a large share of women and events, so count both before accepting a complete case analysis.'
    },
    {
      id: 'c2',
      title: 'Why are the values missing?',
      aim: 'classify a missing-data situation as MCAR, MAR or MNAR, and explore the data to judge which is plausible.',
      minutes: 15,
      need: `
<p>Every method for missing values rests on an assumption about why they are missing. The names are standard but confusing at first.</p>
<table class="data">
<tr><th>Mechanism</th><th>Meaning</th><th>Example in the story</th><th>Testable?</th></tr>
<tr><td><b>MCAR</b>: missing completely at random</td><td>Unrelated to anything about the woman or her outcome. The incomplete records are a random subset.</td><td>Haemoglobin results lost for two weeks when the analyser broke down.</td><td>Yes; often rejected.</td></tr>
<tr><td><b>MAR</b>: missing at random</td><td>Depends only on <b>recorded</b> information: other predictors, time or place ("MAR on x"), or the outcome ("MAR on y").</td><td>Haemoglobin missing more often in women with few antenatal visits, and visits are recorded. Also MAR by design: a test deliberately not done in a recorded low-risk group.</td><td>No.</td></tr>
<tr><td><b>MNAR</b>: missing not at random</td><td>Depends on the missing value itself, or on things not recorded.</td><td>Tobacco use left blank more often by women who use tobacco; a urine culture not sent for reasons nobody wrote down.</td><td>No; always possible.</td></tr>
</table>
<p>Under MCAR, the complete women are representative. Under MAR they are not, but the missingness can be modelled from recorded data, which is what imputation does. Under MNAR, no method using only the recorded data can fully repair the problem.</p>
<p><b>A useful rule for cohorts.</b> If all predictors are recorded at booking, before the birth, the outcome itself cannot cause a value to be missing. Any link between missingness and preterm birth must run through other characteristics. If those are recorded, the situation is MAR on x; if not, it is MNAR.</p>
<p><b>How to explore.</b> Count the missing values of each predictor. Look at which gaps occur together, and by site and time. Fit a logistic model with "missing" as the outcome: any clear association rejects MCAR. Compare the preterm rate in women with and without the value, and see whether recorded variables explain the difference. Then use clinical knowledge to judge whether MNAR is likely.</p>
<div data-explainer="mechanisms"></div>`,
      scenario: `<p>The team notices that booking haemoglobin is missing more often in women with few antenatal visits and in women of low socio-economic status. Both are recorded. Some midwives also say that a urine culture is "not usually sent for low-risk women".</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'Only MCAR can be tested; MAR becomes more plausible the more reasons for missingness are recorded, and MNAR can never be ruled out.'
    },
    {
      id: 'c3',
      title: 'What complete case analysis does to the coefficients',
      aim: 'predict when dropping incomplete women biases the coefficients, and when it only wastes information.',
      minutes: 15,
      need: `
<p>The book shows the effects with a simple simulation. A measured outcome is Y = 1 × X1 + 1 × X2 + error, with X1 and X2 independent. Values of X1 are deleted in four ways, and the model is refitted in the complete cases.</p>
<table class="data">
<tr><th>Why X1 is missing</th><th>How it was simulated</th><th>Complete case estimates of b1, b2</th></tr>
<tr><td>MCAR</td><td>At random</td><td>1, 1 (unbiased)</td></tr>
<tr><td>MAR on x</td><td>More often missing at low X2</td><td>1, 1 (unbiased)</td></tr>
<tr><td>MAR on y</td><td>More often missing at high Y</td><td><b>0.82, 0.82 (both biased)</b></td></tr>
<tr><td>MNAR</td><td>More often missing at low X1</td><td>1, 1 (unbiased)</td></tr>
</table>
<p>Two lessons follow.</p>
<ul>
<li><b>Missingness linked to the outcome is the dangerous case.</b> It biased b2 as well, although X2 was complete. In a later simulation with five predictors, MAR on y for one predictor biased all five.</li>
<li><b>Selection on the predictors does not bias coefficients that condition on them.</b> A regression estimates effects given the predictor values, so selecting women by X1, even MNAR on X1, left b1 and b2 unbiased here.</li>
</ul>
<div class="callout warn"><b>Pitfall: unbiased is not enough</b><p>Even when the coefficients are unbiased, complete case analysis wastes information. Its performance is measured on a narrower group of women, which gave a lower adjusted R² than in the full population. And in real data we can rarely be sure that missingness is unrelated to the outcome.</p></div>`,
      scenario: `<p>Is the team's complete case model just less precise, or is it wrong? The team thinks of three cases. The analyser broke down for two weeks. Haemoglobin is missing in women with few visits. And in an old records study, some delivery files are lost.</p>`,
      widgets: `<div data-widget="missingDemo" data-try="Keep Complete case and 30% missing, choose MCAR and run, then switch the mechanism to MAR, depends on Y and watch both coefficients fall below 1."></div>`,
      tasks: [4, 5],
      takeaway: 'Complete case analysis wastes information under any mechanism, and it biases all coefficients when missingness is linked to the outcome.'
    },
    {
      id: 'c4',
      title: 'Filling the gaps with imputation',
      aim: 'choose an imputation method, build the imputation model, and pool multiply imputed results with Rubin\'s rules.',
      minutes: 15,
      need: `
<p><b>Imputation</b> fills each missing value with a plausible value, so standard methods can be used on the completed data.</p>
<table class="data">
<tr><th>Method</th><th>Uses</th><th>What it does</th></tr>
<tr><td>Mean</td><td>Nothing</td><td>Puts in the overall mean (or the commonest category). Ignores links with other predictors and shrinks the spread. Generally poor.</td></tr>
<tr><td>Conditional mean</td><td>Other predictors (X)</td><td>Puts in the value predicted by a regression on other variables.</td></tr>
<tr><td>Stochastic single</td><td>X and outcome</td><td>Puts in a random draw around the predicted value.</td></tr>
<tr><td>Multiple</td><td>X and outcome</td><td>Repeats the random draw M times (often 5 or 10) and pools the results.</td></tr>
</table>
<p><b>Rubin's rules.</b> Average the M estimates. For the variance, add the average within-imputation variance W to the spread between imputations B:</p>
<div class="formula">Var = W + (1 + 1/M) × B, where B = Σ (b<sub>m</sub> − b̄)² ÷ (M − 1)</div>
<p>Worked example (Illustrative, synthetic): three imputations give 0.60, 0.66 and 0.63, each with standard error 0.10. Average 0.63. W = 0.10² = 0.01. B = (0.03² + 0.03² + 0) ÷ 2 = 0.0009. Var = 0.01 + 1.33 × 0.0009 = 0.0112, so SE = 0.106, about 6% above 0.10. A single imputation ignores B, so its standard errors are too small.</p>
<p><b>The imputation model</b> needs (1) all predictors of the prediction model, (2) <b>auxiliary variables</b> linked to the missing values or to missingness, such as site, calendar time or antenatal visits, and (3) the <b>outcome</b>. Leaving out the outcome pulls the predictor's effect towards zero, even under MCAR. The opposite rule holds for conditional mean imputation, which has no random element: use X only, because including the outcome would exaggerate the effects.</p>
<div data-explainer="mi"></div>`,
      scenario: `<p>The team decides to impute booking haemoglobin and BMI. One analyst proposes to leave the outcome out of the imputation model "to avoid circularity". Another proposes a "haemoglobin missing" category instead.</p>`,
      widgets: `<div data-widget="missingDemo" data-try="Choose MAR, depends on Y and 40% missing, run with Complete case, then switch the method to Multiple imputation and watch both biases disappear."></div>`,
      tasks: [6, 7],
      takeaway: 'Use multiple imputation with all predictors, auxiliary variables and the outcome, pool with Rubin\'s rules, and avoid mean imputation and missing indicators.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Why missing values matter',
      html: `
<p>Chapter 7 concerns missing predictor values (X) in a model for one outcome (Y), where a true value exists but is hidden. Complete case (CC) analysis is the default in most software; available case analysis varies the patients between analyses. Problems: inefficiency, difficult interpretation, and possible bias. With k predictors each missing a fraction m independently, (1 − m)<sup>k</sup> of patients are complete; if no patient misses more than one value, 1 − k × m; if all gaps fall in the same patients, 1 − m.</p>
<p class="src">Source: Ch. 7, §7.1, Table 7.1</p>`
    },
    {
      id: 'n2',
      title: 'Mechanisms',
      html: `
<p>MCAR: incomplete records are a random subset; testable and often rejected. MAR: missingness depends on observed variables (MAR on x: predictors, time, place; MAR on y: the outcome), including MAR by design; not testable. MNAR: depends on the unobserved value or unavailable characteristics; always possible. When predictors precede the outcome, a missingness-outcome link must run through other characteristics: MAR on x if these are recorded, MNAR if not.</p>
<p class="src">Source: Ch. 7, §7.1.3, Table 7.2; §7.2; §7.7.1</p>`
    },
    {
      id: 'n3',
      title: 'Simulations: CC and imputation',
      html: `
<p>Y = X1 + X2 + error: CC estimates were unbiased under MCAR, MAR on x and MNAR on X1, but 0.82 for both coefficients under MAR on y.</p>
<div class="callout book"><b>Book example: five predictors, n = 500, 1,000 repetitions</b><ul>
<li>10% MCAR per predictor, 50% of patients incomplete: CC coefficients unbiased (about 1.00) but SEs 0.26-0.28 against 0.19-0.21 with MI; all methods gave adjusted R² near 35%.</li>
<li>Correlated predictors, 20% missing each, mixed mechanisms (one MAR on y): CC coefficients 0.66-0.69 and adjusted R² 19% instead of 35%; conditional mean imputation underestimated one coefficient (0.75), R² 27%; stochastic SI and MI gave 1.02-1.03 and R² 35%.</li>
</ul></div>
<p class="src">Source: Ch. 7, §7.2, Fig. 7.1; §7.5, Table 7.4</p>`
    },
    {
      id: 'n4',
      title: 'Imputation methods and Rubin\'s rules',
      html: `
<p>Maximum likelihood methods and multiple imputation are the sophisticated alternatives to CC; the book concentrates on imputation. Labels: CC (no information); mean; CM, conditional mean or regression imputation (X only); SI, stochastic regression imputation (X + Y); MI (X + Y, repeated).</p>
<div class="callout book"><b>Book example: head injury</b><p>In 566 patients, haemoglobin could be predicted from haematocrit and sex with R² = 0.97, so conditional mean imputation worked well.</p></div>
<p>With several incomplete predictors, imputation is iterative (data augmentation) until convergence. Pooled estimate b̄ = mean of b<sub>m</sub>; Var(b̄) = W + (1 + 1/M) B, with W the mean within-imputation variance and B the between-imputation variance. M is usually 5 or 10; with M = 10 the factor is 1.1. Rubin found that with 50% missing, five imputations give an SD only 5% wider than infinitely many; other simulations suggest M can be as low as 3 with 20% missing. M = 1 is single stochastic imputation.</p>
<p class="src">Source: Ch. 7, §7.3, Table 7.3, Fig. 7.3</p>`
    },
    {
      id: 'n5',
      title: 'The imputation model and practical guidance',
      html: `
<p><b>Form:</b> logistic for binary predictors, polytomous logistic for three or more categories, linear (transformed if needed) for continuous ones; truncate implausible values. Some software assumes linear associations (add terms such as x + x²); some searches transformations, which helps with non-linearity but is inefficient when associations are linear. <b>Content:</b> all model predictors, auxiliary variables (more make MAR more plausible; noise variables do no harm unless computation fails), and the outcome. Omitting Y in SI or MI dilutes associations (roughly halving a coefficient with 50% MCAR); CM imputation should use X only. Compare histograms of observed and imputed values.</p>
<div class="callout warn"><b>Pitfall: the missing indicator method</b><p>A "missing" category ignores correlations and can severely bias coefficients; generally avoid it. Where the meaning allows, a characteristic not recorded in the chart may be defined as absent.</p></div>
<ul>
<li>Predictors with more than 50% missing will generally be distrusted and may be dropped; there is no fixed limit (MAR on y can make 10% missing suspect; 20% MCAR may be acceptable). Missing by design is less worrying.</li>
<li>Never impute the predictor of primary interest (such as treatment in a trial); analyse patients with it observed and impute confounders, so crude and adjusted analyses use the same patients.</li>
<li>For prediction, one stochastic SI set is often enough for predictions, performance and a score chart; MI is preferable with small data (fewer than about 100 events).</li>
<li>Impute all predictors, unless one will not be available in practice; then develop the model for the setting of use.</li>
<li>Exclude patients with a missing outcome; imputing it adds nothing to predictor effects but can help other estimates (prevalence under verification bias). Last observation carried forward is biased and understates variability.</li>
<li>With bootstrapping, validate the modelling process within each imputed data set.</li>
</ul>
<p><b>Reporting.</b> In a review of 100 prognostic cancer studies, 81 had missing values, about half excluded more than 10% of patients, three used single and one multiple imputation. Report total n and complete n, missingness per predictor, exclusions, methods and imputation details, patients and events in every analysis, reasons for missingness, comparisons of patients with and without missing data, and CC versus imputed results. Prevention is best: retrieve values from charts, and record "not present" rather than leaving a blank.</p>
<p class="src">Source: Ch. 7, §7.4-7.8, Tables 7.5-7.6</p>`
    },
    {
      id: 'n6',
      title: 'Book case study: a pooled head-injury database',
      html: `
<div class="callout book"><b>Book example: IMPACT traumatic brain injury study</b>
<p>11 studies (8 trials, 3 surveys), 9,205 patients; 6-month outcome for 8,719 (95%); 8,530 adults analysed.</p>
<ul>
<li>Missingness was mainly a predictor not recorded in a study: pupils 85% available, hypoxia 64%, CT class 61%, haemoglobin 45%, platelets 19%. Platelets and prothrombin time (&lt;20%) were not considered. Within studies, missingness was close to MCAR.</li>
<li>A motor score untestable because of sedation was its own category, since being untestable relates to severity.</li>
<li>3-month outcome was carried forward for one study; the 5% still missing were not imputed.</li>
<li>Imputation model: all predictors and the outcome, 10 imputations, checks of imputed distributions (glucose truncated at 2 and 20).</li>
<li>Core 3-predictor model: 1,387 missing pupil values (5.4% of values) excluded 16% of patients. 7-predictor model in 7,020 patients: 13% of values missing (6,426 of 49,140), but CC kept 2,428, a 65% loss.</li>
<li>SI and MI gave largely similar estimates; MI standard errors were slightly larger, differing only in the third decimal. Scores (coefficients × 10) differed by at most 2 points. CC estimates were sometimes quite different (for example, the motor score effect was smaller with imputation) and had larger SEs.</li>
</ul></div>
<p>The aim is not to estimate the missing values but to estimate parameters valid for the population of use. Imputation keeps recorded information, increases power and makes analyses comparable, at the price of the MAR assumption.</p>
<p class="src">Source: Ch. 8, §8.1-8.6; Ch. 7, §7.8</p>`
    }
  ],
  keyPoints: [
    'Complete case analysis can discard a large share of patients when only a small share of values is missing (book: 10% of values, 50% of patients).',
    'MCAR can be tested and is often rejected; MAR cannot be tested; MNAR always remains possible.',
    'In complete case analysis, missingness related to the outcome (MAR on y) biases all coefficients; selection on X alone need not.',
    'If predictors are measured before the outcome, any link between missingness and outcome runs through other characteristics.',
    'Multiple imputation pools M analyses: Var = W + (1 + 1/M)B; single imputation ignores B and understates standard errors.',
    'Stochastic and multiple imputation models must include all predictors, auxiliary variables and the outcome; conditional mean imputation uses X only.',
    'Do not use the missing indicator method; distrust predictors with more than 50% missing; never impute the predictor of primary interest.',
    'Report completeness per predictor, numbers of patients and events in each analysis, methods used, and complete versus imputed results.'
  ],
  quiz: [
    {
      q: 'In the team\'s cohort, six predictors each have 8% missing values, independently and completely at random. Roughly what share of women are complete cases?',
      options: ['92%', '52%', '61%', '48%'],
      answer: 2,
      why: '(1 − 0.08)^6 = 0.92^6 = 0.61. The value 52% (1 − 6 × 0.08) applies only if no woman misses more than one value, the worst case. 92% confuses completeness of one predictor with completeness of the whole record.'
    },
    {
      q: 'A urine culture is not sent when the midwife judges a woman to be at low risk, and the reasons for that judgement are not recorded. What is the mechanism for missing bacteriuria?',
      options: ['MCAR', 'MAR on y', 'MAR on x', 'MNAR'],
      answer: 3,
      why: 'Missingness depends on things that are not in the data, so it is MNAR. If the midwife\'s criteria were recorded as variables, it would be MAR on x. It cannot be MAR on y, because the decision is made at booking, before the birth. It is not MCAR, because it depends on the woman\'s risk.'
    },
    {
      q: 'In the book\'s simulation with Y = X1 + X2 + error, which reason for missing X1 biased the complete case estimates of both b1 and b2?',
      options: ['Missing at random, unrelated to anything', 'X1 more often missing at high values of Y', 'X1 more often missing at low values of X2', 'X1 more often missing at low values of X1'],
      answer: 1,
      why: 'Missingness linked to the outcome (MAR on y) gave 0.82 for both coefficients. Selection on the predictors (the last two options) left the coefficients unbiased, because regression conditions on X. A common misconception is that MNAR always biases complete case estimates; in this simple example it did not.'
    },
    {
      q: 'Five imputed analyses of the haemoglobin coefficient give a mean within-imputation variance W = 0.0050 and a between-imputation variance B = 0.0010. What is the pooled standard error?',
      options: ['0.0787', '0.0707', '0.0775', '0.0849'],
      answer: 0,
      why: 'Var = 0.0050 + (1 + 1/5) × 0.0010 = 0.0062; SE = √0.0062 = 0.0787. 0.0707 is √0.0050, which ignores the spread between imputations (what a single imputation would report). 0.0775 is √0.0060, which drops the (1 + 1/M) factor.'
    },
    {
      q: 'An analyst multiply imputes booking haemoglobin from all other predictors but not from preterm birth, to avoid circularity. What is the expected result?',
      options: ['The haemoglobin coefficient is exaggerated', 'No effect if haemoglobin is missing completely at random', 'The link between haemoglobin and preterm birth is weakened towards zero', 'The standard errors are too small but the coefficient is unbiased'],
      answer: 2,
      why: 'Values drawn without the outcome have no link with it, which dilutes the association; with 50% MCAR the coefficient is roughly halved. The dilution happens even under MCAR, so the second option is wrong. Exaggeration is the risk when the outcome is used in conditional mean (non-random) imputation.'
    },
    {
      q: 'Which approach does the book recommend for bacteriuria (yes or no) with some missing values?',
      options: ['Imputation with a logistic imputation model that includes the other predictors and the outcome', 'Adding a separate "missing" category', 'Replacing missing values with the commonest category', 'Dropping the predictor whenever any value is missing'],
      answer: 0,
      why: 'A logistic imputation model for a binary variable, with all predictors and the outcome, follows the book. The missing indicator method can badly bias coefficients; the commonest category ignores links with other predictors; dropping a predictor for any missingness wastes information.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'What complete case analysis hides',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). A report on preterm birth gives a crude odds ratio for low haemoglobin based on 1,700 women, and an adjusted odds ratio (adjusted for BMI and four other predictors) based on 1,250 women. The odds ratio falls from 1.9 to 1.5. The authors say "the effect of haemoglobin is partly explained by BMI". No missing values are mentioned in the methods.</p>`,
      questions: [
        '<b>(a)</b> What has the software most likely done, and why do the numbers of women differ?',
        '<b>(b)</b> Give two explanations for the fall in the odds ratio.',
        '<b>(c)</b> Name the three problems that missing values cause, using this report as an example.'
      ],
      answer: `<p><b>(a)</b> Each analysis was most likely a complete case analysis: women missing any variable in that model were dropped. The crude analysis needed only haemoglobin; the adjusted one also needed BMI and four other predictors, so 450 more women were dropped. Using different women in each analysis is available case analysis.</p>
<p><b>(b)</b> (1) Confounding by BMI, as the authors say. (2) The 1,250 women are a different, selected group; the odds ratio could differ in them even without adjustment. The report cannot separate the two.</p>
<p><b>(c)</b> Lost information: 450 women and their events are thrown away, so estimates are less precise and the model more overfitted. Hard interpretation: crude and adjusted results come from different women, as in (b). Possible bias: if the missing BMI values are linked to preterm birth, the adjusted coefficients may be wrong. The book recommends imputing so that all analyses use the same women, and reporting the missing values per predictor.</p>`
    },
    {
      id: 't1',
      title: 'Count the cost',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The team's model has 8 predictor degrees of freedom and is developed in 1,600 women with 192 preterm births. Haemoglobin is missing for 15% and BMI for 8% of women, independently of each other and of the outcome. The other predictors are complete.</p>`,
      questions: [
        '<b>(a)</b> What share of women, how many women and about how many events would a complete case analysis keep? What happens to the EPV?',
        '<b>(b)</b> What share of the needed predictor values is missing? Count 8 values per woman.',
        '<b>(c)</b> In the complete-case loss widget, set 5 predictors, 10% missing and 100 events. Check the book\'s worked example: the share complete if gaps are independent, and if each woman misses at most one value.'
      ],
      answer: `<p><b>(a)</b> Share complete = (1 − 0.15) × (1 − 0.08) = 0.85 × 0.92 = 0.782. Women kept = 0.782 × 1,600 = 1,251. Events kept ≈ 0.782 × 192 = 150 (if missingness is unrelated to the outcome). EPV falls from 192 ÷ 8 = 24 to 150 ÷ 8 = 18.8. About 22% of the women are thrown away.</p>
<p><b>(b)</b> Missing values = 0.15 × 1,600 + 0.08 × 1,600 = 240 + 128 = 368, out of 8 × 1,600 = 12,800 needed. 368 ÷ 12,800 = 2.9%. Under 3% of the values are missing, but 22% of the women would be dropped.</p>
<p><b>(c)</b> Independent gaps: 0.9<sup>5</sup> = 59% complete, 59 events kept, EPV 11.8. At most one gap per woman: 1 − 5 × 0.1 = 50% complete, 50 events, EPV 10, as in the book. Either way, a full data set with EPV 20 shrinks to about half.</p>`
    },
    {
      id: 't2',
      title: 'Name the mechanism',
      level: 'Understand',
      scenario: `<p>For each situation in a booking-to-delivery cohort, decide whether the missing values are MCAR, MAR (on x or on y) or MNAR.</p>
<ol>
<li>Haemoglobin results for two weeks were lost when the analyser broke down.</li>
<li>Haemoglobin is missing more often in women with few antenatal visits; visits are recorded for everyone.</li>
<li>Tobacco use is left blank more often by women who do use tobacco.</li>
<li>A urine culture is not sent when the midwife judges a woman to be low risk, and her reasons are not recorded.</li>
<li>Cervical length is measured only in women with a previous preterm birth, which is recorded (missing by design).</li>
</ol>`,
      questions: [
        '<b>(a)</b> Classify each situation and give a one-line reason.',
        '<b>(b)</b> Which of these could you test from the data, and how?',
        '<b>(c)</b> Why can none of them be "MAR on y" in this cohort?'
      ],
      answer: `<p><b>(a)</b> 1: MCAR, the breakdown is unrelated to the women. 2: MAR on x, missingness depends on a recorded variable. 3: MNAR, it depends on the missing value itself. 4: MNAR, it depends on a judgement whose reasons are not recorded (if the criteria were recorded it would be MAR on x). 5: MAR by design, it depends fully on a recorded variable.</p>
<p><b>(b)</b> Only MCAR can be tested. Fit a logistic model with "haemoglobin missing" as the outcome and recorded variables (visits, socio-economic status, site, date) as predictors, or compare women with and without the value. Any clear association rejects MCAR. In situation 2 such a test would reject MCAR. MAR cannot be proved, and MNAR cannot be ruled out.</p>
<p><b>(c)</b> All these values are recorded at booking, before the birth, so preterm birth itself cannot cause them to be missing. A link between missingness and outcome would have to run through other characteristics.</p>`
    },
    {
      id: 't3',
      title: 'Explore missing haemoglobin',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). In 2,000 women, booking haemoglobin is missing for 300 (15%). The team tabulates missingness and preterm birth by number of antenatal visits before 28 weeks.</p>
<table class="data"><tr><th>Visits</th><th>Women</th><th>Haemoglobin missing</th><th>Preterm, haemoglobin missing</th><th>Preterm, haemoglobin recorded</th></tr>
<tr><td>0 to 2</td><td>400</td><td>120 (30%)</td><td>21 / 120</td><td>49 / 280</td></tr>
<tr><td>3 to 5</td><td>1,000</td><td>140 (14%)</td><td>17 / 140</td><td>104 / 860</td></tr>
<tr><td>6 or more</td><td>600</td><td>40 (6.7%)</td><td>3 / 40</td><td>42 / 560</td></tr></table>`,
      questions: [
        '<b>(a)</b> Calculate the overall preterm rate in women with and without a recorded haemoglobin. What does the difference suggest?',
        '<b>(b)</b> Calculate the preterm rates within each visit group. What do you conclude?',
        '<b>(c)</b> Is MCAR plausible? Which mechanism best fits, and what must go into the imputation model?',
        '<b>(d)</b> What could still make the mechanism MNAR?'
      ],
      answer: `<p><b>(a)</b> Missing: (21 + 17 + 3) ÷ 300 = 41 ÷ 300 = 13.7%. Recorded: (49 + 104 + 42) ÷ 1,700 = 195 ÷ 1,700 = 11.5%. Women with a missing value deliver early more often, so they are not a random subset. A complete case analysis would drop more than its share of preterm births.</p>
<p><b>(b)</b> 0 to 2 visits: 21 ÷ 120 = 17.5% and 49 ÷ 280 = 17.5%. 3 to 5: 17 ÷ 140 = 12.1% and 104 ÷ 860 = 12.1%. 6 or more: 3 ÷ 40 = 7.5% and 42 ÷ 560 = 7.5%. Within each visit group the rates are the same. The overall difference comes from visits: women with few visits more often lack a haemoglobin result and more often deliver early.</p>
<p><b>(c)</b> MCAR is rejected: missingness is clearly linked to visits (30% against 6.7%). The pattern fits MAR on x, with visits explaining the link with the outcome. The imputation model should include all predictors, visits (as an auxiliary variable if it is not a predictor), socio-economic status and preterm birth.</p>
<p><b>(d)</b> If haemoglobin was missing because of its own value, for example because women with very low results were sent straight to another hospital and their results were not filed, the mechanism would be MNAR. The table cannot show this; clinical knowledge of how results are filed must be used.</p>`
    },
    {
      id: 't4',
      title: 'Mechanisms in the simulator',
      level: 'Analyse',
      scenario: `<p>Use the missing data simulator in this case. It simulates 500 women with Y = X1 + X2 + error, where X1 and X2 are correlated (0.5) and both true coefficients are 1. Here X2 is the incomplete predictor. Controls: the mechanism for X2 missing, the percentage missing, and the method. Results vary a little between runs.</p>`,
      questions: [
        '<b>(a)</b> Set 40% missing and Complete case. Run 200 simulations for each mechanism: MCAR, MAR depends on X1, MAR depends on Y, and MNAR depends on X2 itself. Record the mean estimates and mean standard errors. Which mechanism gives bias, and does it affect β for X1 as well?',
        '<b>(b)</b> Under MCAR, compare the standard error of Complete case with Multiple imputation. What does this show?',
        '<b>(c)</b> Under MNAR depends on X2 itself, compare Complete case with Multiple imputation. What does this imply for practice?'
      ],
      answer: `<p><b>(a)</b> Expected results (from repeated runs of the same set-up): MCAR, MAR on X1 and MNAR on X2 all give means close to 1.00 for both coefficients, with standard errors about 0.067 to 0.076. MAR depends on Y gives about 0.92 for both, so both are biased towards zero, including β for X1, which has no missing values. This matches the book: missingness linked to the outcome distorts all associations in the women who are kept, while selection on the predictors does not.</p>
<p><b>(b)</b> Both are close to unbiased, but multiple imputation gives smaller standard errors (about 0.060 against 0.067), because it uses the recorded X1 and Y of the 40% of women whose X2 is missing. Under MCAR the cost of complete case analysis is lost precision, not bias.</p>
<p><b>(c)</b> Complete case stays close to 1, while multiple imputation drifts slightly above 1 (about 1.04 to 1.06), because its MAR assumption is wrong. Under MNAR imputation offers no guaranteed gain. In practice MNAR can never be ruled out: record more of the reasons for missingness, use clinical knowledge, and compare complete case and imputed results as a sensitivity analysis.</p>`
    },
    {
      id: 't5',
      title: 'Biased or only less precise?',
      level: 'Apply',
      scenario: `<p>For each situation, say whether a complete case analysis of the preterm model would give biased coefficients or only less precise ones. Haemoglobin, BMI and antenatal visits are all predictors in the model.</p>
<ol>
<li>Haemoglobin results were lost for two weeks when the analyser broke down.</li>
<li>Haemoglobin is missing more often in women with few antenatal visits.</li>
<li>An old records study takes booking haemoglobin from the delivery file. Files of women who delivered early were often sent with the woman to the referral hospital, so their haemoglobin is missing more often.</li>
</ol>`,
      questions: [
        '<b>(a)</b> Name the mechanism in each situation and predict the effect on the coefficients.',
        '<b>(b)</b> In situation 3, which coefficients are at risk?',
        '<b>(c)</b> Why is "the coefficients are unbiased" not enough to justify complete case analysis in situations 1 and 2?'
      ],
      answer: `<p><b>(a)</b> 1: MCAR; coefficients unbiased but less precise. 2: MAR on x, and the variable that drives missingness (visits) is in the model; as in the book's simulation, coefficients are unbiased but less precise. 3: missingness depends on the outcome (MAR on y, since preterm birth is recorded); coefficients are biased.</p>
<p><b>(b)</b> All of them. In the book's simulation, missingness linked to the outcome biased the coefficient of the complete predictor as well (0.82 for both), and with five predictors one predictor MAR on y biased all five. So the BMI and visits effects are also at risk, not only haemoglobin. <b>Critical:</b> a complete case analysis here can give a wrong model.</p>
<p><b>(c)</b> Complete case analysis still wastes the women's other recorded values, so estimates are less precise and the model more overfitted. Its performance is measured in a narrower group of women, which gave a lower adjusted R² in the book's simulations. And in real data it is rarely certain that missingness is unrelated to the outcome. Multiple imputation keeps all the women.</p>`
    },
    {
      id: 't6',
      title: 'Pool with Rubin\'s rules and compare methods',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). After multiple imputation (M = 5, outcome included), the coefficient for low haemoglobin (per g/dL below 11) in the five completed data sets is 0.42, 0.47, 0.44, 0.50 and 0.45, with standard errors 0.080, 0.082, 0.079, 0.081 and 0.080.</p>`,
      questions: [
        '<b>(a)</b> Give the pooled coefficient, W, B, the total variance and the standard error.',
        '<b>(b)</b> Give the odds ratio and its 95% confidence interval.',
        '<b>(c)</b> What standard error would a single stochastic imputation report, and why is it too small?',
        '<b>(d)</b> In the missing data simulator, choose MAR depends on Y and 40% missing. Run 200 simulations with each method. Which methods are biased, and which work?'
      ],
      answer: `<p><b>(a)</b> Pooled b̄ = (0.42 + 0.47 + 0.44 + 0.50 + 0.45) ÷ 5 = 2.28 ÷ 5 = 0.456. W = mean of SE² = (0.006400 + 0.006724 + 0.006241 + 0.006561 + 0.006400) ÷ 5 = 0.006465. Squared deviations from 0.456: 0.001296, 0.000196, 0.000256, 0.001936, 0.000036; sum 0.00372, so B = 0.00372 ÷ 4 = 0.00093. Total variance = 0.006465 + (1 + 1/5) × 0.00093 = 0.006465 + 0.001116 = 0.007581. SE = √0.007581 = 0.0871.</p>
<p><b>(b)</b> OR = e<sup>0.456</sup> = 1.58 per g/dL below 11. 95% CI = e<sup>0.456 ± 1.96 × 0.0871</sup> = e<sup>0.285</sup> to e<sup>0.627</sup> = 1.33 to 1.87.</p>
<p><b>(c)</b> About the within-imputation standard error, √0.006465 = 0.080, about 8% smaller than 0.087. It treats imputed values as if measured and ignores B, the uncertainty about the missing values. For predictions this matters less; for inference on effects, multiple imputation gives more honest standard errors.</p>
<p><b>(d)</b> Expected results (approximate): Complete case about 0.92 for both coefficients (biased). Mean imputation about 1.34 for X1 and 0.74 for X2 (badly biased: it ignores the link between X1 and X2). Regression imputation without Y about 1.12 and 0.92 (biased: it cannot use the information Y carries about X2). Stochastic imputation with Y and multiple imputation with Y both about 1.00. Only methods that use the outcome and add a random element handle MAR on y, as in the book.</p>`
    },
    {
      id: 't7',
      title: 'Critique a missing-data plan',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A prospective cohort of 2,400 pregnant women aims to predict preterm birth from booking characteristics. The methods section states:</p>
<ol>
<li>"Women with missing delivery outcome (6%) were assigned 'term birth', since most births are at term".</li>
<li>"Booking haemoglobin was missing in 18%; we used a missing-haemoglobin category so that no woman was excluded".</li>
<li>"BMI (9% missing) was replaced by the cohort mean".</li>
<li>"Cervical length was available for 35% of women, because scanning was offered in only one of the three hospitals; it was multiply imputed and kept in the final model".</li>
<li>"In a sensitivity analysis we multiply imputed haemoglobin and BMI from all other predictors; the outcome was deliberately left out of the imputation model to avoid circularity".</li>
<li>"Missing data were assumed to be missing completely at random".</li>
</ol>
<p>Note: women with missing haemoglobin had fewer antenatal visits and a higher preterm rate than other women.</p>`,
      questions: [
        '<b>(a)</b> Comment on each statement.',
        '<b>(b)</b> Write a short, improved plan for handling and reporting missing data in this study.'
      ],
      answer: `<p><b>(a)</b></p>
<ol>
<li><b>Outcome.</b> Assigning "term" invents outcomes and biases the event rate and the coefficients. <b>Critical:</b> in prediction research, women with a missing outcome are generally excluded and counted; the 6% should be described and compared with the rest.</li>
<li><b>Missing category.</b> The missing indicator method ignores correlations among predictors and can badly bias coefficients. Haemoglobin should be imputed.</li>
<li><b>Mean imputation.</b> Ignores the links between BMI and other predictors and shrinks its spread. Multiple imputation with the outcome is better.</li>
<li><b>Cervical length.</b> With 65% missing, its effect will generally be distrusted. The gap is by design (one hospital), which is less worrying, but imputation in the two hospitals without scanning rests wholly on relationships seen elsewhere. Leave it out of the main model, or build a separate model for settings where scanning will be available, because a model should use predictors that will be available when it is used.</li>
<li><b>Outcome left out.</b> For multiple imputation this is an error: it dilutes the links of haemoglobin and BMI with preterm birth (roughly halving a coefficient with 50% MCAR). The outcome must be in the imputation model; only conditional mean single imputation should leave it out.</li>
<li><b>MCAR.</b> The data reject MCAR: missing haemoglobin is linked to visits and to the outcome. Because haemoglobin was measured before the birth, the link must run through other characteristics such as visits and socio-economic status. Including these makes MAR on x plausible; without them the mechanism may be MNAR.</li>
</ol>
<p><b>(b)</b> Exclude and report women with a missing outcome. Tabulate missing values for every predictor and explore patterns (by hospital, visits, socio-economic status and outcome, with a logistic model for missingness). Use multiple imputation (5 to 10 imputations) with all predictors, auxiliary variables (hospital, visits) and the outcome; logistic models for binary and linear models for continuous variables, truncated to plausible ranges; compare observed and imputed distributions. No missing categories. Decide on cervical length by the intended setting of use. Pool with Rubin's rules; when bootstrapping, validate the modelling process within each imputed data set. Report total and complete numbers, missingness per predictor, women and events in each analysis, the imputation method, and complete case against imputed results.</p>`
    }
  ]
});
