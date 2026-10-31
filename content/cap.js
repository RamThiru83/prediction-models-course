registerModule({
  id: 'cap',
  num: 'Capstone',
  part: 'Validation',
  title: 'Develop and validate a preterm birth model',
  book: 'Ch. 1 to 19',
  minutes: 150,
  summary: 'A guided project in which you develop a preterm birth prediction model in one synthetic hospital cohort, estimate its optimism, validate it in a second hospital and judge its clinical usefulness.',
  objectives: [
    'Frame the decision, outcome and threshold first',
    'Count events per candidate degree of freedom',
    'Choose missing-data, coding and strategy options',
    'Estimate optimism with a full bootstrap',
    'Validate the fixed model in a second hospital',
    'Judge clinical usefulness and report honestly'
  ],
  format: 'cases',
  reading: [
    { cite: "Steyerberg EW, Vergouwe Y (2014). Towards better clinical prediction models: seven steps for development and an ABCD for validation. European Heart Journal 35:1925-1931.", url: "https://doi.org/10.1093/eurheartj/ehu207", note: "A compact overview of the whole development-to-validation pathway, written by the author of the course textbook." },
    { cite: "Collins GS, Dhiman P, Ma J, et al. (2024). Evaluation of clinical prediction models (part 1): from development to external validation. BMJ 384:e074819.", url: "https://doi.org/10.1136/bmj-2023-074819", note: "First of the 2024 BMJ series; sets out how performance is evaluated across development, internal validation and external validation." },
    { cite: "Wolff RF, Moons KGM, Riley RD, et al. (2019). PROBAST: a tool to assess the risk of bias and applicability of prediction model studies. Annals of Internal Medicine 170:51-58.", url: "https://doi.org/10.7326/M18-1376", note: "A checklist for appraising the risk of bias in a prediction model study, useful both for critiquing published preterm birth models and for planning your own." },
    { cite: "Meertens LJE, van Montfort P, Scheepers HCJ, et al. (2018). Prediction models for the risk of spontaneous preterm birth based on maternal characteristics: a systematic review and independent external validation. Acta Obstetricia et Gynecologica Scandinavica 97:907-920.", url: "https://doi.org/10.1111/aogs.13358", note: "An applied preterm birth example in which published models are externally validated in an independent cohort." },
    { cite: "Han X, Zhang Q, Ke Y, et al. (2025). Development and external validation of a nomogram for predicting spontaneous preterm birth in singleton pregnancies with a short cervix. American Journal of Obstetrics & Gynecology MFM 8:101859.", url: "https://doi.org/10.1016/j.ajogmf.2025.101859", note: "A recent preterm birth example that develops a nomogram and reports discrimination, calibration, Brier score and decision curves in a prospective external cohort." }
  ],
  essentials: `
<ul>
<li>The capstone joins the whole course into one project: plan the model, build it, check it inside its own data, then test it in a second hospital and decide.</li>
<li>Fix the decision, the outcome, the predictors known at booking and the risk <b>threshold</b> before any analysis. The threshold comes from weighing harm against benefit, not from the results.</li>
<li>Count the events, not the women, and divide them by every candidate <b>degree of freedom</b>, including the extra terms for quadratic and spline codings.</li>
<li>Missing haemoglobin that depends on other recorded variables is best handled by <b>multiple imputation</b> with the outcome in the imputation model. Keep continuous predictors continuous.</li>
<li>Prefer a prespecified model with candidates limited by subject knowledge. Data-driven selection is unstable and needs far more events.</li>
<li>A model looks better in the women who built it. Estimate this <b>optimism</b> with a bootstrap that replays every step, and use <b>shrinkage</b> to pull the coefficients back.</li>
<li>Test the fixed model in the second hospital without refitting it: calibration-in-the-large, calibration slope, c statistic and net benefit at the threshold.</li>
<li>Optimism and transportability are different gaps. Shrinkage deals with the first; only data from the new setting reveal the second.</li>
</ul>
<div data-explainer="roadmap"></div>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. In the capstone the team builds its own model from start to finish. It plans the model, builds it in 2,000 women from its own antenatal clinic (ptb_dev), checks how optimistic the model is, and then tests it in 1,200 women at a tertiary referral hospital (ptb_val) before deciding whether it is fit for use there. The capstone draws on all the earlier modules, but each case gives you what you need.',
  defs: {
    'threshold': 'The predicted risk above which the team will act, here by referring a woman; it reflects how a missed preterm birth weighs against an unnecessary referral.',
    'degree of freedom': 'One estimated coefficient; a quadratic term uses two, and a spline with k knots uses k minus 1.',
    'multiple imputation': 'Filling each missing value several times with plausible values drawn from a model, analysing each completed dataset and pooling the results.',
    'restricted cubic spline': 'A smooth curve made of joined pieces that lets the effect of a predictor bend.',
    'optimism': 'How much better a model looks in the data that built it than it will do in new women from the same setting.',
    'shrinkage': 'Pulling the coefficients towards zero so that predictions in new women are less extreme.',
    'calibration-in-the-large': 'Whether the average predicted risk matches the observed share of preterm births; 0 on the log-odds scale is ideal.',
    'calibration slope': 'How much the predictions need stretching or squeezing to match what is observed; 1 is ideal and below 1 means predictions are too extreme.',
    'net benefit': 'True positives minus false positives weighted by the threshold odds, divided by the number of women.',
    'transportability': 'Whether a model keeps its performance in a different setting, such as another hospital.'
  },
  explainers: [
    {
      id: 'roadmap',
      title: 'Seven steps as one pipeline',
      scenes: (function () {
        var box = function (x, y, w, h, l1, l2, d) { return EX.rect(x, y, w, h, { role: 'line', d: d }) + EX.text(x + w / 2, y + 27, l1, { anchor: 'middle', bold: true, d: d + 0.2 }) + (l2 ? EX.text(x + w / 2, y + 48, l2, { size: 's', anchor: 'middle', d: d + 0.3 }) : ''); };
        var link = function (x, y, w, d) { return EX.rect(x, y, w, 3, { role: 'muted', rx: 0, d: d }); };
        var strip = function (y, d, label) { var s = EX.text(222, y + 16, label, { size: 's', anchor: 'end', d: d }); for (var i = 0; i < 4; i++) s += EX.rect(232 + i * 70, y, 60, 22, { role: 'line', d: d + 0.1 * i }) + EX.text(262 + i * 70, y + 16, String(i + 1), { size: 's', anchor: 'middle', d: d + 0.1 * i }); return s; };
        return [
          { svg: EX.svg(EX.text(40, 40, 'Step 0: frame the problem before the data', { size: 'm', bold: true }) +
              EX.text(60, 90, 'Decision: refer at booking for enhanced surveillance', { d: 0.5 }) +
              EX.text(60, 125, 'Outcome: birth before 37 completed weeks', { d: 1.1 }) +
              EX.text(60, 160, 'Predictors: only what is known at booking', { d: 1.7 }) +
              EX.text(60, 195, 'Threshold: 20% (harm to benefit of 1 to 4)', { d: 2.3 }) +
              EX.text(60, 230, 'Events: 234 preterm births in 2,000 women', { d: 2.9 })),
            say: 'Every model starts before the data. The team writes down the decision, the outcome, the predictors known at booking, and a referral threshold of 20 per cent. It also counts its events: 234 preterm births in 2,000 women.' },
          { svg: EX.svg(EX.text(40, 40, 'Steps 1 to 4 build the model', { size: 'm', bold: true }) +
              box(24, 100, 116, 64, '1 Inspect', 'missing Hb', 0.3) + link(140, 131, 16, 0.8) +
              box(156, 100, 116, 64, '2 Code', 'age, Hb, BMI', 0.9) + link(272, 131, 16, 1.4) +
              box(288, 100, 116, 64, '3 Specify', 'which terms', 1.5) + link(404, 131, 16, 2.0) +
              box(420, 100, 116, 64, '4 Estimate', 'fit and shrink', 2.1) +
              link(24, 195, 512, 2.8) + EX.text(280, 230, 'Together these choices are the modelling strategy', { anchor: 'middle', bold: true, d: 3.0 })),
            say: 'Steps one to four build the model. Inspect the data and handle missing haemoglobin. Code age, haemoglobin and body mass index. Decide which terms to include. Then estimate the coefficients, with shrinkage. Together these choices are the modelling strategy.' },
          { svg: EX.svg(EX.text(40, 40, 'Steps 5 and 6, inside the data: replay the strategy', { size: 'm', bold: true }) +
              box(24, 105, 110, 70, 'ptb_dev', '2,000 women', 0.2) +
              strip(88, 0.8, 'sample 1') + strip(128, 1.3, 'sample 2') + EX.text(372, 172, '...', { anchor: 'middle', d: 1.7 }) + strip(180, 1.9, 'sample 100') +
              EX.text(40, 245, 'Optimism = apparent in each sample minus test in ptb_dev', { d: 2.6 }) +
              EX.text(40, 272, 'Average it over 100 samples, then subtract it', { d: 3.2 })),
            say: 'Steps five and six test the strategy, not just one fitted model. The bootstrap draws 100 new samples from the 2,000 women and replays all four steps in each. The average drop in performance is the optimism.' },
          { svg: EX.svg(EX.text(40, 40, 'Step 6, outside the data: the fixed model travels', { size: 'm', bold: true }) +
              box(40, 100, 180, 70, 'Fixed model', 'shrunk, then frozen', 0.3) + link(228, 134, 84, 1.0) +
              box(320, 100, 200, 70, 'ptb_val', '1,200 women, tertiary', 1.3) +
              EX.text(40, 220, 'Nothing is refitted. Report calibration-in-the-large,', { d: 2.0 }) +
              EX.text(40, 248, 'the slope, c with its interval and net benefit at 20%', { d: 2.4 })),
            say: 'Step six also has an external part. The fixed model, with its shrunken coefficients, goes unchanged to the second hospital. Nothing is refitted. The team reports calibration, discrimination and net benefit at the 20 per cent threshold.' },
          { svg: EX.svg(EX.text(40, 40, 'Step 7: present it so that a clinician can use it', { size: 'm', bold: true }) +
              EX.text(60, 100, 'lp = intercept + sum of (coefficient × predictor)', { d: 0.5 }) +
              EX.text(60, 135, 'risk = 1 / (1 + exp(−lp))', { d: 1.1 }) +
              EX.text(60, 185, 'Give the full formula with intercept and coding,', { d: 1.8 }) +
              EX.text(60, 212, 'or a nomogram or a score chart', { d: 2.2 }) +
              EX.text(60, 255, 'A score chart is simpler but loses some information', { size: 's', d: 2.8 })),
            say: 'Step seven presents the model so that a clinician can use it: the full formula with its intercept and coding, or a nomogram, or a score chart. A score chart is easier to use but loses some information.' },
          { svg: EX.svg(EX.text(280, 110, 'Steps 1 to 4: build a strategy', { size: 'l', bold: true, anchor: 'middle' }) +
              EX.text(280, 152, 'Steps 5 and 6: test the whole strategy honestly', { anchor: 'middle', d: 0.7 }) +
              EX.text(280, 184, 'Step 7: present the model and its limits', { anchor: 'middle', d: 1.4 }) +
              EX.text(280, 232, 'Cases 1 to 4 of the capstone walk along this pipeline', { size: 's', anchor: 'middle', d: 2.1 })),
            say: 'So the seven steps form one pipeline. Build a strategy, test the whole strategy honestly, and then present it with its limits. The four cases of this capstone walk along the pipeline in order.' }
        ];
      })()
    },
    {
      id: 'twogaps',
      title: 'Optimism and transportability are different gaps',
      scenes: (function () {
        var lg = function (p) { return Math.log(p / (1 - p)); }, il = function (x) { return 1 / (1 + Math.exp(-x)); };
        var pc = function (v) { return Math.round(v * 100) + '%'; };
        var P = [0.04, 0.06, 0.08, 0.10, 0.12, 0.15, 0.19, 0.25, 0.33], jit = [0.004, -0.003, 0.005, -0.004, 0.002, -0.005, 0.006, -0.006, 0.004];
        var B = EX.box({ l: 80, t: 46, w: 300, h: 190, xlim: [0, 0.4], ylim: [0, 0.4], xticks: [0, 0.1, 0.2, 0.3, 0.4], yticks: [0.1, 0.2, 0.3, 0.4], xfmt: pc, yfmt: pc, xlabel: 'predicted risk', ylabel: 'observed' });
        var diag = EX.line([[B.X(0), B.Y(0)], [B.X(0.4), B.Y(0.4)]], { role: 'pred', w: 2, d: 0.2 });
        // illustrative calibration patterns: own data; same hospital with slope 0.94; tertiary hospital with slope 0.84 and shift +0.32
        var oA = P.map(function (p, i) { return [p, p + jit[i]]; });
        var oB = P.map(function (p) { return [p, il(-0.121 + 0.94 * lg(p))]; });
        var oC = P.map(function (p) { return [p, il(-2.0 + 0.32 + 0.84 * (lg(p) + 2.0))]; });
        var gaps = function (o, d) { return EX.gaps(B, o.map(function (q) { return [q[0], q[0], q[1]]; }), { d: d }); };
        var side = function (lines, d) { return lines.map(function (t, i) { return EX.text(400, 92 + i * 28, t[0], { size: t[1], bold: !!t[2], d: d + 0.3 * i }); }).join(''); };
        var plot = function (title, o, lines) { return EX.svg(EX.text(40, 26, title, { size: 'm', bold: true }) + B.s + diag + EX.pts(B, o, { role: 'obs', d: 0.6, stagger: 0.1 }) + gaps(o, 1.8) + side(lines, 2.2)); };
        return [
          { svg: plot('In its own 2,000 women', oA, [['Development data', 's'], ['c about 0.74', 'm', 1], ['slope 1 by design', 's']]),
            say: 'Start with the women who built the model. Group them by predicted risk and plot the observed share of preterm births against the prediction. In its own data the points sit on the dashed line. The c statistic is about 0.74.' },
          { svg: plot('New women from the same hospital (bootstrap)', oB, [['Optimism', 'm', 1], ['c about 0.73', 'm'], ['slope 0.94', 'm'], ['shrink by 0.94', 's']]),
            say: 'Now imagine new women from the same district hospital. The bootstrap tells us what to expect. High predictions come out a little too high and low ones a little too low. The c statistic falls to about 0.73. This gap is optimism.' },
          { svg: plot('The shrunk model in the tertiary hospital', oC, [['Transport gap', 'm', 1], ['predicted 13%', 's'], ['observed 17%', 's'], ['slope 0.84', 'm'], ['c about 0.72', 'm']]),
            say: 'Now move the model, already shrunk, to the tertiary hospital. Almost every point sits above the line. On average the model predicts 13 per cent, but 17 per cent of women deliver early. The slope is 0.84 and the c statistic about 0.72.' },
          { svg: EX.svg(EX.text(40, 40, 'Optimism', { size: 'l', bold: true }) +
              EX.text(40, 80, 'Cause: fitting noise in', { d: 0.4 }) + EX.text(40, 104, 'the development data', { d: 0.4 }) +
              EX.text(40, 144, 'Measured by: the bootstrap', { d: 0.9 }) +
              EX.text(40, 184, 'Reduced by: more events,', { d: 1.4 }) + EX.text(40, 208, 'fewer df, shrinkage', { d: 1.4 }) +
              EX.text(300, 40, 'Transportability', { size: 'l', bold: true, d: 2.0 }) +
              EX.text(300, 80, 'Cause: different women,', { d: 2.4 }) + EX.text(300, 104, 'incidence and effects', { d: 2.4 }) +
              EX.text(300, 144, 'Measured by: new data only', { d: 2.9 }) +
              EX.text(300, 184, 'Not fixed by shrinkage;', { d: 3.4 }) + EX.text(300, 208, 'needs updating', { d: 3.4 })),
            say: 'The two gaps have different causes. Optimism comes from fitting noise in the development data. The bootstrap measures it, and shrinkage or fewer degrees of freedom reduce it. Transportability depends on the new women: their risk, their case-mix and the strength of each predictor there.' },
          { svg: EX.svg(EX.text(280, 90, 'A small optimism does not promise good transport', { anchor: 'middle', bold: true }) +
              EX.text(280, 135, 'Inside ptb_dev: c drops by only about 0.01', { anchor: 'middle', d: 0.7 }) +
              EX.text(280, 165, 'In ptb_val: average risk too low by about 3 points', { anchor: 'middle', d: 1.3 }) +
              EX.text(280, 195, 'Still better than referring everyone at 20%', { anchor: 'middle', d: 1.9 }) +
              EX.text(280, 240, 'Update and re-validate before use in the new hospital', { size: 's', anchor: 'middle', d: 2.5 })),
            say: 'So a small optimism does not promise a good fit elsewhere. Only data from the new setting can show that. Here the model still beats referring everyone at 20 per cent, but it under-predicts and would need updating before use.' }
        ];
      })()
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'Plan the model before the data',
      aim: 'fix the decision, outcome, predictors and threshold, and count how many degrees of freedom the events can support.',
      minutes: 30,
      need: `
<p>Every prediction model rests on five decisions made before any analysis: the <b>decision</b> it will inform, the <b>outcome</b>, the <b>predictors</b> available when the decision is made, the <b>type of model</b>, and the <b>threshold</b> of risk at which the team acts.</p>
<p><b>The threshold from harm and benefit.</b> Suppose the team judges that one unnecessary referral is a quarter as bad as one correctly referred preterm birth is good. Think of 100 women at the threshold risk p: referring all of them helps 100 × p women and needlessly refers 100 × (1 − p). Referral is worthwhile when the benefit is at least as large: p × 4 ≥ (1 − p) × 1. This gives p = harm ÷ (harm + benefit) = 1 ÷ (1 + 4) = 20%. The <b>threshold odds</b> are w = 0.20 ÷ 0.80 = 0.25: one woman correctly referred is worth 4 unnecessary referrals.</p>
<p><b>Events per degree of freedom.</b> For a yes/no outcome the information lies in the events. Count every coefficient you will consider, before any selection. A linear or binary term uses 1 degree of freedom (df), a quadratic 2, a spline with k knots k − 1. Example: ptb_dev has 234 preterm births. Its 14 candidate variables, with age coded as a quadratic, use 15 df, so EPV = 234 ÷ 15 = 15.6. If only the 1,548 women with complete haemoglobin and BMI are used, there are 182 events and EPV = 182 ÷ 15 = 12.1.</p>
<p>Below 10 expect overfitting. From 10 to 20 shrinkage is still advisable. Around 20 or more a prespecified model may need little shrinkage. Reliable data-driven selection needs about 50.</p>`,
      scenario: `<p>The district hospital wants to identify, at the first antenatal (booking) visit, women whose risk of preterm birth is high enough to justify referral for enhanced antenatal surveillance at the tertiary centre. It has <code>ptb_dev</code>: 2,000 women from its own clinic, 234 (11.7%) of whom delivered before 37 weeks. Haemoglobin is missing for 307 women (15.4%) and BMI for 165 (8.3%). The tertiary hospital has collected the same variables in a later period, in <code>ptb_val</code>: 1,200 women, 200 (16.7%) preterm. It wants to know whether the district model could be used there.</p>
<p>Before anyone opens the Analysis Lab, the team lead asks for a one-page plan.</p>`,
      widgets: `<div data-widget="datasetCard" data-set="ptb_dev"></div>
<div data-widget="datasetCard" data-set="ptb_val"></div>
<div data-widget="epvCalculator" data-try="Enter 234 events and 15 df, then 182 events (complete cases), then 234 events and 13 df, and watch the band and the events needed for EPV 50."></div>`,
      tasks: [0, 1],
      takeaway: 'Write down the decision, outcome, booking-visit predictors and threshold first, then judge every later option against the events per candidate degree of freedom.'
    },
    {
      id: 'c2',
      title: 'Build the model',
      aim: 'handle missing haemoglobin, code the continuous predictors and choose a modelling strategy in the Analysis Lab.',
      minutes: 45,
      need: `
<p><b>Missing haemoglobin.</b> In ptb_dev, haemoglobin is more often missing in women with few antenatal visits and low socio-economic status. When missingness depends on other recorded variables, the data are <b>missing at random</b> (MAR). This cannot be proved from the data, but it is the plausible mechanism here. A complete case analysis drops 452 of the 2,000 women (22.6%) and 52 of the 234 events (22%). Multiple imputation keeps them all. Its imputation model must contain the predictors, the variables that explain the missingness and the outcome. Leaving the outcome out weakens the association of haemoglobin with preterm birth. A "missing" indicator category is biased and is not a substitute.</p>
<p><b>Coding.</b> Keep continuous predictors continuous. Subject knowledge suggests a U-shaped risk with age, a rise in risk as haemoglobin falls into the anaemic range, and a rise at low BMI. Compare codings by the likelihood ratio χ² minus 2 × df, not by one p-value. Example from the coding explorer with all 2,000 women: age cut at 35 years gives χ² 27.8 on 1 df (27.8 − 2 = 25.8); a quadratic gives 88.0 on 2 df (88.0 − 4 = 84.0). The quadratic wins clearly.</p>
<p><b>Strategy.</b> A prespecified model keeps all chosen candidates. Backward selection drops terms by p-value. Selection is unstable, biases the kept coefficients upwards (testimation) and needs about 50 events per candidate df. Overfitting depends on the candidates examined, not the ones kept.</p>
<p><b>In the Lab.</b> Untick <i>Use</i> to drop a candidate and pick a <i>Coding</i> for each continuous one. The Lab imputes with all other variables in the dataset plus the outcome. Its decision threshold starts at 15%: set it to 20%.</p>`,
      scenario: `<p>Two members of the team disagree. The statistician wants a prespecified model: the ten candidates with a clinical rationale, flexible terms for haemoglobin and BMI, and no selection. The registrar wants to offer all 14 variables and let backward selection at p &lt; 0.05 decide. Both agree that haemoglobin must not simply be dropped.</p>`,
      widgets: `<div data-widget="missingDemo" data-try="Choose MAR, depends on Y with 40% missing, run complete case and then multiple imputation, and compare the mean estimate of the X2 coefficient with the true value of 1."></div>
<div data-widget="codingExplorer" data-try="Set the cut-point to 35 and choose Dichotomised, then Linear, then Quadratic, and watch the LR χ² and the red gaps change."></div>
<div data-widget="stepwiseInstability" data-try="Run 100 bootstraps with backward p &lt; 0.05 at 600 and then at 1600, and watch how rarely the original model is reproduced and how often the noise terms are kept."></div>
<div data-widget="analysisLab" data-try="Set the decision threshold to 20% and press Run analysis with the other defaults, then switch Missing data to multiple imputation and watch the records analysed and the EPV."></div>`,
      tasks: [2, 3],
      takeaway: 'Impute haemoglobin with the outcome in the imputation model, spend degrees of freedom only on plausible non-linearity, and prefer a prespecified model to selection at this EPV.'
    },
    {
      id: 'c3',
      title: 'Check it inside the data',
      aim: 'estimate the optimism of the whole strategy with the bootstrap, and shrink the coefficients to match.',
      minutes: 30,
      need: `
<p>The c statistic and calibration slope in the development panel are measured in the same women who built the model, so they are too good. The <b>bootstrap</b> estimates by how much:</p>
<ol>
<li>Fit the model in the original data and record its apparent performance.</li>
<li>Draw a bootstrap sample of the same size, with replacement.</li>
<li>Replay every modelling step in it (coding, selection, shrinkage) and record performance in the bootstrap sample.</li>
<li>Test that bootstrap model in the original data. Optimism = bootstrap performance minus test performance.</li>
<li>Repeat at least 100 times and average the optimism.</li>
<li>Subtract the average optimism from the apparent performance.</li>
</ol>
<p>If selection is done once and only the final model is bootstrapped, the optimism is understated.</p>
<p><b>Shrinkage.</b> The corrected calibration slope says how much the coefficients should be shrunk. A slope of 0.90 means predictions are about 10% too extreme on the log-odds scale. The heuristic factor is s = (model χ² − df) ÷ model χ², with df the candidate df. Example: the Lab's default run has χ² 137.4 on 15 df, so s = (137.4 − 15) ÷ 137.4 = 122.4 ÷ 137.4 = 0.89. After shrinking, the intercept is re-estimated so that the average predicted risk again equals the observed 11.7%. Uniform shrinkage changes calibration, not the order of women's risks, so the c statistic stays the same.</p>
<p><b>In the Lab.</b> Imputation is done once, before the bootstrap, and is not replayed (a simplification). With multiple imputation, choose <i>Uniform, bootstrap slope</i>: in this Lab the heuristic and ridge options are not carried into the pooled coefficients.</p>`,
      scenario: `<p>The registrar notes that the apparent c of the selected model is close to that of the prespecified one and asks whether selection has done any harm. The statistician replies that apparent numbers cannot answer this: only corrected performance compares strategies fairly.</p>`,
      widgets: `<div data-widget="optimismSim" data-try="Set n to 500, incidence 12%, 3 true and 20 noise predictors, run 40 simulations, then cut the noise predictors to 2 and watch the gap between apparent and honest c shrink."></div>
<div data-widget="shrinkageLab" data-try="Read the shrinkage factor at the default 400 women, then move the subsample to 1500 and watch the factor move towards 1."></div>`,
      tasks: [4, 5],
      takeaway: 'Report optimism-corrected performance of the whole strategy, and shrink the coefficients by the corrected slope with the intercept re-estimated.'
    },
    {
      id: 'c4',
      title: 'Test it in the second hospital and decide',
      aim: 'validate the fixed model in ptb_val, interpret its calibration by cause, and judge its net benefit at 20%.',
      minutes: 45,
      need: `
<p>External validation applies the final model, with its shrunken coefficients and re-estimated intercept, to new women without refitting anything. Four numbers matter:</p>
<ul>
<li><b>Calibration-in-the-large</b>: the intercept with the linear predictor as an offset. Ideal 0. A positive value means the model predicts too low on average.</li>
<li><b>Calibration slope</b>: ideal 1. Below 1 means predictions are too extreme. This can come from overfitting in development or from weaker predictor effects in the new setting.</li>
<li><b>c statistic</b> with its confidence interval.</li>
<li><b>Net benefit</b> at the declared threshold: NB = (TP − w × FP) ÷ N.</li>
</ul>
<p><b>Worked example</b> (Illustrative, synthetic). Per 1,000 women at a 20% threshold, w = 0.25. If the model refers 200 women, of whom 70 deliver early, then TP = 70, FP = 130 and NB = (70 − 0.25 × 130) ÷ 1,000 = 37.5 ÷ 1,000 = 0.0375: about 3.8 net true positives per 100 women. Compare it with referring nobody (NB = 0) and with referring everyone.</p>
<p><b>Read each result by its cause.</b> A higher incidence or an older, higher-risk case-mix shifts calibration-in-the-large. Weaker effects and overfitting both lower the slope, so compare it with the corrected slope from Case 3. The c statistic is the least sensitive of the four to a shift in average risk. Once you refit or recalibrate in ptb_val, those data have become development data and can no longer validate the model.</p>
<p><b>In the Lab.</b> Validation uses the 1,107 of 1,200 women with complete data on the chosen predictors. In ptb_val haemoglobin (about 5%) and BMI (about 3%) are missing completely at random, so this loses little.</p>
<div data-explainer="twogaps"></div>`,
      scenario: `<p>The tertiary hospital sees older women with more chronic hypertension and previous preterm births, and its preterm birth rate is higher. Its clinical lead asks two questions: are the risks right for our women, and would using the model at a 20% threshold do more good than harm?</p>`,
      widgets: `<div data-widget="caseMixLab" data-try="Compare the scenario Overfitted, calibration slope 0.8 with More severe z, and watch which one moves calibration-in-the-large and which one moves the slope."></div>
<div data-widget="decisionCurveLab" data-try="Set the calibration-in-the-large shift to +1.0 and watch the model curve against treat all, then set the slope to 0.6."></div>
<div data-widget="nbCalculator" data-try="Enter TP 50, FP 90, FN 20 and TN 240 at a 20% threshold, then move the threshold to 30% and watch the weight on each false positive change."></div>`,
      tasks: [6, 7],
      takeaway: 'Validate the frozen model, explain calibration-in-the-large and slope by their causes, and judge usefulness by net benefit at the threshold declared in Case 1.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'The project frame and the seven steps',
      html: `
<p>Five elements frame any prediction model and are written down before data analysis: the decision the prediction informs, the outcome (defined and measured as rigorously as in a trial), predictors available at the moment of decision, the type of model (logistic regression for a binary outcome, giving an absolute risk), and the threshold. The threshold equals harm ÷ (harm + benefit); its odds w = p<sub>t</sub> ÷ (1 − p<sub>t</sub>) give the number of false positives one true positive is worth (1:4 gives 20%, w = 0.25).</p>
<p>Development then follows seven steps: (1) inspect the data, including missing values; (2) code the predictors; (3) specify the model; (4) estimate the coefficients, with shrinkage if needed; (5) evaluate performance; (6) validate, internally and externally; (7) present the model. Steps 1 to 4 define a modelling strategy; steps 5 and 6 test that strategy, not just one fitted model.</p>
<div class="callout warn"><b>Critical</b><p>The threshold belongs to the clinical problem, not to the modeller. Choosing it after seeing where the model performs best turns the decision analysis into another form of data dredging.</p></div>
<p class="src">Source: Ch. 1; Ch. 6; Ch. 16</p>`
    },
    {
      id: 'n2',
      title: 'Events per variable and the df budget',
      html: `
<p>EPV = events ÷ candidate predictor parameters. Count degrees of freedom for every term considered: linear or binary 1 df, quadratic 2, restricted cubic spline with k knots k − 1, a categorical variable with k levels k − 1. Below 10 signals overfitting; 10 or more is a minimum; about 20 or more may make shrinkage unnecessary for a prespecified model; about 50 is needed for reliable data-driven selection.</p>
<table class="data">
<tr><th>ptb_dev option (synthetic)</th><th>Events</th><th>Candidate df</th><th>EPV</th></tr>
<tr><td>14 candidates, age quadratic, complete cases</td><td>182</td><td>15</td><td>12.1</td></tr>
<tr><td>14 candidates, age quadratic, imputed</td><td>234</td><td>15</td><td>15.6</td></tr>
<tr><td>10 candidates, Hb and BMI 3-knot splines, imputed</td><td>234</td><td>13</td><td>18.0</td></tr>
<tr><td>10 candidates, Hb and BMI linear, imputed</td><td>234</td><td>11</td><td>21.3</td></tr>
</table>
<p>EPV is judged against the candidates, not against the terms that survive selection.</p>
<p class="src">Source: Ch. 3; Ch. 5; Ch. 11</p>`
    },
    {
      id: 'n3',
      title: 'Missing haemoglobin and predictor coding',
      html: `
<p>Haemoglobin missingness that depends on antenatal visits and socio-economic status is missing at random (MAR): plausible, not provable.</p>
<table class="data">
<tr><th>Option</th><th>What it does</th><th>Main weakness</th></tr>
<tr><td>Complete case</td><td>Drops women with any missing predictor</td><td>Loses events (lower EPV); biased if missingness relates to the outcome in ways the model does not capture</td></tr>
<tr><td>Single stochastic imputation</td><td>Fills each gap once from other predictors and the outcome, plus random error</td><td>Treats imputed values as real, so standard errors are too small</td></tr>
<tr><td>Multiple imputation (m = 5)</td><td>Five completed datasets, analysed separately and pooled by Rubin's rules</td><td>More complex; the imputation model must contain the predictors, the outcome and variables that explain missingness</td></tr>
</table>
<div class="callout warn"><b>Critical</b><p>Include the outcome in the imputation model; imputing without it weakens the association of the imputed predictor with the outcome. Do not use a missing-indicator category. Check that imputed values are physiologically plausible.</p></div>
<p><b>Coding.</b> Use subject knowledge first and the data only for the broad shape. Compare codings by the likelihood ratio χ² − 2 × df (an AIC-type comparison). A spline with more knots always fits the sample better; the question is whether the gain exceeds its cost in df. Give flexibility only to predictors whose effects are likely to be non-linear and strong.</p>
<div class="callout warn"><b>Critical</b><p>Dichotomising a continuous predictor, especially at a cut-point chosen in the same data, discards information and biases the estimate.</p></div>
<p class="src">Source: Ch. 7; Ch. 9; Ch. 10; Ch. 12</p>`
    },
    {
      id: 'n4',
      title: 'Strategy, shrinkage and bootstrap optimism',
      html: `
<table class="data">
<tr><th>Strategy</th><th>For</th><th>Against</th></tr>
<tr><td>Full prespecified model</td><td>No selection bias; stable; valid standard errors</td><td>Larger model; may include weak predictors</td></tr>
<tr><td>Backward, p &lt; 0.05</td><td>Smaller model; easy to replay in a bootstrap</td><td>Unstable selection; kept coefficients biased upwards (testimation); may drop true weak predictors</td></tr>
<tr><td>Backward, AIC-like (p ≈ 0.157)</td><td>Less underfitting than p &lt; 0.05</td><td>The same instability, less extreme</td></tr>
</table>
<p>A smaller model does not reduce overfitting if the selection was driven by the data. Default to the prespecified model unless a practical reason, such as a costly measurement, argues for a smaller one.</p>
<p><b>Shrinkage.</b> Maximum likelihood coefficients are, on average, too extreme for new patients. Uniform shrinkage multiplies all coefficients by one factor s, estimated by the bootstrap calibration slope or by the heuristic s = (model χ² − df) ÷ model χ², with df the candidate df and χ² of the full candidate model. A ridge penalty is an alternative. The intercept is then re-estimated. Shrinkage changes calibration far more than discrimination.</p>
<p><b>Bootstrap optimism.</b> Optimism = apparent performance in the bootstrap sample − test performance in the original sample, averaged over at least 100 samples and subtracted from the apparent performance. It measures the optimism of a strategy only if every data-driven step is replayed in each sample.</p>
<p>In the course Lab, imputation is done once before the bootstrap, so its contribution to optimism is not captured; with multiple imputation, use the bootstrap-slope shrinkage option.</p>
<p class="src">Source: Ch. 5; Ch. 11; Ch. 13; Ch. 17</p>`
    },
    {
      id: 'n5',
      title: 'External validation and the decision curve',
      html: `
<p>Apply the fixed model, without refitting, to the validation data and report calibration-in-the-large (ideal 0), calibration slope (ideal 1), the c statistic with its confidence interval, and net benefit at the declared threshold. A higher incidence or a different case-mix shifts calibration-in-the-large; weaker predictor effects and development overfitting both lower the slope. Discrimination changes with the spread of case-mix as well as with the strength of the effects.</p>
<div class="callout warn"><b>Critical</b><p>Do not alter the model after seeing the validation result and then report the revised model's performance as external. Once you refit or recalibrate in the validation data, they have become development data. Updating methods lie outside this course.</p></div>
<p><b>Net benefit</b> at threshold p<sub>t</sub> is NB = (TP − w × FP) ÷ N with w = p<sub>t</sub> ÷ (1 − p<sub>t</sub>). Treat all gives NB = incidence − (1 − incidence) × w; treat none gives 0. A decision curve plots NB over a range of thresholds. If calibration is poor, net benefit can fall below the default policies even when the c statistic looks acceptable. Accuracy is not a measure of usefulness: at 12% incidence, calling every woman low risk is 88% accurate.</p>
<p class="src">Source: Ch. 15; Ch. 16; Ch. 17; Ch. 19</p>`
    },
    {
      id: 'n6',
      title: 'Write-up and self-assessment rubric',
      html: `
<p>A one-page report has these headings: (1) purpose, decision and declared threshold; (2) data: sources, outcome definition, women, events, missing data and its handling; (3) methods: candidates and coding, strategy, shrinkage, how optimism was estimated; (4) final model: coefficients, intercept and coding, enough to compute a risk; (5) performance: apparent, optimism-corrected and external, with uncertainty; (6) limitations: EPV, differences between the hospitals, what was not validated; (7) presentation: formula, nomogram or score chart, and what a score chart loses.</p>
<p>Score each row 0 (absent), 1 (partly) or 2 (fully). A total of 18 to 24 indicates a well-conducted project; below 12, return to the weakest stages.</p>
<table class="data">
<tr><th>Criterion</th><th>2 points when</th></tr>
<tr><td>1. Aim and threshold</td><td>Decision, outcome, booking predictors and a threshold with its harm:benefit reasoning are stated before analysis</td></tr>
<tr><td>2. Sample size</td><td>EPV uses candidate df, including spline and quadratic terms</td></tr>
<tr><td>3. Missing data</td><td>Mechanism named; imputation model includes the outcome; events retained reported</td></tr>
<tr><td>4. Coding</td><td>No dichotomising; non-linear forms chosen with an AIC-type comparison and a df budget</td></tr>
<tr><td>5. Strategy</td><td>Candidates restricted by subject knowledge before outcome analysis; any selection justified and replayed</td></tr>
<tr><td>6. Shrinkage</td><td>Applied, with the intercept re-estimated; the heuristic uses candidate df</td></tr>
<tr><td>7. Optimism</td><td>At least 100 bootstrap samples replay every step; corrected performance reported</td></tr>
<tr><td>8. External validation</td><td>Model applied unchanged; all four measures reported and interpreted by cause</td></tr>
<tr><td>9. Decision curve</td><td>Net benefit compared with treat all and treat none at the declared threshold</td></tr>
<tr><td>10. Write-up</td><td>Full formula, honest limitations, no claim beyond the validation done</td></tr>
<tr><td>11. Critical errors avoided</td><td>No refitting presented as validation; no data-chosen cut-points; no missing indicator; no apparent performance as the headline</td></tr>
<tr><td>12. Clarity</td><td>Short, precise and clear to a clinician who has not seen the analysis</td></tr>
</table>
<p class="src">Source: Ch. 18; course rubric</p>`
    }
  ],
  keyPoints: [
    'Fix the decision, outcome, predictors available at booking and the threshold before any analysis.',
    'Count EPV against all candidate degrees of freedom, including spline and quadratic terms.',
    'Missing haemoglobin that depends on other observed variables is handled by multiple imputation with the outcome in the imputation model.',
    'Keep continuous predictors continuous and budget degrees of freedom for non-linearity.',
    'Prefer a prespecified model with shrinkage over data-driven selection; shrinkage fixes calibration, not discrimination.',
    'Bootstrap optimism is valid only if every modelling step is replayed in each sample.',
    'External validation uses the fixed model; interpret calibration-in-the-large and slope by cause before judging.',
    'Net benefit at the declared threshold, with miscalibration in view, is the test of clinical usefulness.'
  ],
  quiz: [
    { q: 'A development sample has 90 preterm births. The team wants to consider 14 predictors, of which age is coded with a 4-knot spline (3 df) and the rest are single-df terms. What is the EPV?',
      options: ['90 / 14 = 6.4', '90 / 3 = 30', '90 / 16 = 5.6', '90 / 13 = 6.9'],
      answer: 2,
      why: 'Candidate df = 13 single-df terms + 3 df for the spline = 16, so EPV = 90 / 16 = 5.6. Counting predictors (14) rather than parameters is the commonest error. Dividing by the spline df alone ignores the other terms, and 13 forgets the spline altogether.' },
    { q: 'Haemoglobin is missing in 15% of women, more often in women with few antenatal visits and low socio-economic status. Which approach is most defensible?',
      options: ['Multiple imputation using all predictors, the outcome, antenatal visits and socio-economic status', 'Complete case analysis, because 85% of values are available', 'Replace missing values with the mean haemoglobin', 'Add a "missing" category for haemoglobin'],
      answer: 0,
      why: 'Missingness depends on observed variables (MAR), so imputation using those variables and the outcome is appropriate. Complete case analysis loses events and ignores the pattern; mean imputation shrinks variability and the association; the missing indicator method is biased. The 85% figure refers to one variable: the share of women complete on all predictors is smaller (in ptb_dev, 77.4%).' },
    { q: 'A team selects predictors by backward elimination in the whole sample, then bootstraps only the final model and reports a small optimism. What is wrong?',
      options: ['Bootstrap cannot be used with logistic regression', 'The number of bootstrap samples was too large', 'Optimism should be calculated in the bootstrap sample only', 'Selection was not replayed in each bootstrap sample, so optimism is understated'],
      answer: 3,
      why: 'Selection uses the outcome and contributes to optimism, so each bootstrap sample must repeat it. The bootstrap works with logistic models, and more replications do not bias it. Optimism is the difference between apparent performance in the bootstrap sample and test performance in the original sample, so it needs both.' },
    { q: 'In an external validation, c is 0.70 (corrected development value 0.72), the calibration slope is 0.75, and calibration-in-the-large is +0.5. Which conclusion is best?',
      options: ['The model is valid because c barely changed', 'Predictions are too extreme and, on average, too low in this hospital, so the model needs caution before use there', 'The model should be refitted in the validation data and reported as externally validated', 'Only the slope matters; calibration-in-the-large can be ignored'],
      answer: 1,
      why: 'A slope below 1 means predictions are too extreme; a positive calibration-in-the-large means under-prediction on average, consistent with a higher incidence. A stable c does not show good calibration. Refitting in the validation data turns them into development data. Both calibration measures matter for decisions at a threshold.' },
    { q: 'At a 20% threshold in a validation sample of 400 women, the model gives TP = 50 and FP = 90. What is the net benefit?',
      options: ['50 / 400 = 0.125', '(50 − 90) / 400 = −0.100', '(50 − 0.25 × 90) / 400 = 0.069', '(50 − 0.20 × 90) / 400 = 0.080'],
      answer: 2,
      why: 'The weight is the threshold odds, 0.20 / 0.80 = 0.25, so NB = (50 − 22.5) / 400 = 0.069. Ignoring false positives gives 0.125; a weight of 1 treats a false positive as equal to a missed preterm birth; using the probability 0.20 instead of the odds as the weight is the common mistake.' },
    { q: 'A prespecified model has 15 candidate df and model χ² of 45. Backward selection later keeps terms using 6 df with χ² 38. Which shrinkage factor is correct for the selected model?',
      options: ['(38 − 6) / 38 = 0.84', '(45 − 15) / 45 = 0.67', '(45 − 6) / 45 = 0.87', '1.0, because selection removes noise'],
      answer: 1,
      why: 'The heuristic must use the candidate df and the χ² of the full candidate model, because selection also capitalised on chance. Using the retained model understates the overfitting. Selection does not remove the need for shrinkage.' }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Frame the model and set the threshold',
      level: 'Understand',
      scenario: `<p>Before opening the Lab, the team writes its plan. The obstetric lead judges that one unnecessary referral to the tertiary centre (travel, cost and worry for the woman) is about a quarter as bad as one correctly referred preterm birth is good. Open the codebook of <code>ptb_dev</code> in the dataset card.</p>`,
      questions: [
        '<b>(a)</b> Write the five elements of the frame: decision, outcome, predictors, type of model and threshold.',
        '<b>(b)</b> Turn the harm:benefit judgement into a threshold and its odds. What would they be if a referral were judged one ninth as bad?',
        '<b>(c)</b> Which of the 14 candidate variables would you not offer the model, and why? Decide without looking at any coefficient.',
        '<b>(d)</b> A colleague suggests fixing the threshold later, "where the model does best". Reply in two sentences.'
      ],
      answer: `<p><b>(a)</b> Decision: whether to refer a woman at booking for enhanced antenatal surveillance at the tertiary centre. Outcome: preterm birth, delivery before 37 completed weeks, a binary outcome, with gestational age dated by one method fixed in advance. Predictors: only information available at the booking visit. Model: logistic regression, giving an absolute risk for each woman. Threshold: see (b).</p>
<p><b>(b)</b> Threshold = harm ÷ (harm + benefit) = 1 ÷ (1 + 4) = 0.20, that is 20%. Threshold odds w = 0.20 ÷ 0.80 = 0.25: one correctly referred preterm birth is worth 4 unnecessary referrals. For 1:9 the threshold is 1 ÷ (1 + 9) = 10%, with w = 0.10 ÷ 0.90 = 0.11. The Lab's threshold slider starts at 15%, so it must be moved to 20% in every run.</p>
<p><b>(c)</b> <code>anc_visits</code> counts visits before 28 weeks: it is not known at booking, so it cannot be a predictor for a booking-visit decision (it can still help the imputation model, Case 2). <code>female_fetus</code>: fetal sex is not known at booking, and in India finding out fetal sex before birth is prohibited by law, so a model that needed it could not be used. <code>conception_monsoon</code> has no clear mechanism. <code>height_cm</code> is a judgement call: short stature has some plausibility, and keeping it costs 1 df. Dropping all four leaves ten candidates. Revealed for teaching: in these synthetic data none of the four has a true effect. The decision must still rest on subject knowledge made before analysis.</p>
<p><b>(d)</b> The threshold expresses a clinical value judgement and must be declared before the results are seen. Choosing it where the model looks best is a form of data dredging and makes the net benefit optimistic; a range of thresholds can be shown as a sensitivity analysis if declared in advance.</p>`
    },
    {
      id: 't1',
      title: 'Count events per candidate degree of freedom',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A smaller district hospital has 1,000 women with 120 preterm births. It considers 12 predictors, with age coded as a quadratic.</p>
<p>In <code>ptb_dev</code> there are 2,000 women and 234 preterm births; 1,548 women (182 events) have both haemoglobin and BMI recorded.</p>`,
      questions: [
        '<b>(a)</b> For the smaller hospital, give the candidate df and the EPV. How many events would EPV 10 and EPV 20 need?',
        '<b>(b)</b> For ptb_dev with all 14 candidates (age quadratic, the others linear or binary), give the candidate df and the EPV with all women imputed and with complete cases only.',
        '<b>(c)</b> Drop the four variables from Task 1 (c) and give haemoglobin and BMI a 3-knot spline each. What are the candidate df and EPV now? And with both linear?',
        '<b>(d)</b> Check (b) and (c) in the EPV calculator. Which later options does each EPV make risky?'
      ],
      answer: `<p><b>(a)</b> 11 single-df terms + 2 df for age = 13 df. EPV = 120 ÷ 13 = 9.2, just below 10. EPV 10 needs 13 × 10 = 130 events; EPV 20 needs 13 × 20 = 260. Overfitting is likely and shrinkage is advisable.</p>
<p><b>(b)</b> Age 2 + BMI 1 + haemoglobin 1 + antenatal visits 1 + height 1 + 9 binary variables = 15 df. Imputed: 234 ÷ 15 = 15.6. Complete cases: 182 ÷ 15 = 12.1. The complete case analysis loses 2,000 − 1,548 = 452 women (22.6%) and 234 − 182 = 52 events (22%).</p>
<p><b>(c)</b> Age 2 + haemoglobin 2 + BMI 2 + 7 binary variables = 13 df; EPV = 234 ÷ 13 = 18.0. With linear haemoglobin and BMI: 11 df, EPV = 234 ÷ 11 = 21.3.</p>
<p><b>(d)</b> 234 and 15 gives 15.6, in the band "10 to 20: shrinkage is still advisable", and 750 events would be needed for EPV 50. 182 and 15 gives 12.1, the same band but closer to 10. 234 and 13 gives 18.0, still below 20; EPV 50 would need 650 events. So in every version data-driven selection is risky (it would need about three times the events), and shrinkage is advisable. Spending 4 df on every continuous predictor would push the EPV down again.</p>`
    },
    {
      id: 't2',
      title: 'Missing haemoglobin and the coding of age',
      level: 'Apply',
      scenario: `<p>Use the widgets in this case. In the Analysis Lab, keep the starting seed (do not press <i>New random subsample</i>) so that your numbers match the answer. Set <i>Decision threshold</i> to 20% in every run.</p>`,
      questions: [
        '<b>(a)</b> In the Lab, leave everything else at its default and press <i>Run analysis</i>. Record <i>Records analysed</i>, <i>Events</i>, <i>Candidate df</i>, <i>EPV</i> and <i>Model χ² / df</i>. Then set <i>Missing data</i> to <i>Multiple imputation, m = 5</i> and run again.',
        '<b>(b)</b> Which variables does the Lab use to impute haemoglobin? Why must the outcome be among them, and why may <code>anc_visits</code> help the imputation even if it is not a predictor?',
        '<b>(c)</b> In the missing data simulator, choose <i>MAR, depends on Y</i> with 40% missing. Run <i>Complete case</i>, then <i>Multiple imputation, m = 5, with Y</i>. Describe the bias in the X2 coefficient. (Results vary a little between runs.)',
        '<b>(d)</b> In the coding explorer (subsample 2000), record the LR χ² and df for age dichotomised at 35, linear, quadratic, and 3-knot and 4-knot splines. Calculate χ² − 2 × df for each and choose a coding.'
      ],
      answer: `<p>Illustrative (synthetic) results from the course data.</p>
<p><b>(a)</b> Complete case: 1,548 records, 182 events, 15 candidate df, EPV 12.1, model χ² 137.4 on 15 df. Multiple imputation: 2,000 records, 234 events, 15 df, EPV 15.6, χ² 174.3 on 15 df. Imputation keeps the 52 events that complete case analysis throws away.</p>
<p><b>(b)</b> The Lab imputes haemoglobin and BMI by regression on all the other variables in the dataset plus the outcome, adding random error; with m = 5 it does this five times. The outcome must be included because otherwise the imputed values carry no link with preterm birth, and the coefficient of haemoglobin is weakened. Missingness depends on antenatal visits and socio-economic status, so those variables belong in the imputation model to make MAR plausible. Imputation is done in the research data, where antenatal visits are already recorded; the prediction model, used at booking, must not need them.</p>
<p><b>(c)</b> Complete case analysis gives a mean X2 coefficient clearly below the true 1 (about 0.92 in a typical run): when missingness depends on the outcome, the women left are not representative. Multiple imputation that includes Y gives a mean close to 1 (about 1.00).</p>
<p><b>(d)</b></p>
<table class="data">
<tr><th>Age coding</th><th>LR χ²</th><th>df</th><th>χ² − 2 df</th></tr>
<tr><td>Dichotomised at 35</td><td>27.8</td><td>1</td><td>25.8</td></tr>
<tr><td>Linear</td><td>1.2</td><td>1</td><td>−0.8</td></tr>
<tr><td>Quadratic</td><td>88.0</td><td>2</td><td>84.0</td></tr>
<tr><td>Spline, 3 knots</td><td>84.2</td><td>2</td><td>80.2</td></tr>
<tr><td>Spline, 4 knots</td><td>86.3</td><td>3</td><td>80.3</td></tr>
</table>
<p>Choose the quadratic (the Lab's default for age): it captures the U shape for 2 df. A 3-knot spline is nearly as good. A straight line misses the U shape entirely, and a cut at 35 keeps only the rise at older ages; a cut chosen by looking at the data would also add optimism.</p>`
    },
    {
      id: 't3',
      title: 'Prespecified model or backward selection?',
      level: 'Analyse',
      scenario: `<p>In the Analysis Lab, with <i>Multiple imputation, m = 5</i> and the threshold at 20%, run the two proposals from the case.</p>
<p><b>Run A (prespecified):</b> untick <i>Use</i> for <code>anc_visits</code>, <code>female_fetus</code>, <code>conception_monsoon</code> and <code>height_cm</code>; set the coding of <code>hb</code> and <code>bmi</code> to <i>Spline, 3 knots</i>; keep age quadratic; <i>Predictor selection</i> None; <i>Shrinkage</i> None.</p>
<p><b>Run B (selection):</b> all 14 candidates with their default codings; <i>Predictor selection</i> <i>Backward, p &lt; 0.05</i>; <i>Shrinkage</i> None.</p>`,
      questions: [
        '<b>(a)</b> Record the candidate df, EPV, model χ² / df and apparent c of each run, and the predictors Run B kept.',
        '<b>(b)</b> Run B reports its model χ² on 8 df. By which EPV should it be judged, and why?',
        '<b>(c)</b> In the stepwise instability widget, run backward p &lt; 0.05 at a sample size of 600 and then 1600. What do you see?',
        '<b>(d)</b> Which strategy would you take forward? Give two reasons.'
      ],
      answer: `<p>Illustrative (synthetic) results at the Lab's starting seed.</p>
<p><b>(a)</b> Run A: 13 df, EPV 18.0, χ² 182.2 on 13 df, apparent c 0.738. Run B: 15 candidate df, EPV 15.6, χ² 168.7 on 8 df, apparent c 0.728. Run B kept age (with age²), hb, prior_ptb, short_interval, chronic_htn, tobacco and bacteriuria. It dropped bmi, primigravida and ses_low, which have true effects in the data-generating model (revealed for teaching). In this run it kept none of the noise variables.</p>
<p><b>(b)</b> By 234 ÷ 15 = 15.6, not 234 ÷ 8. The selection used the outcome to choose among all 15 candidate df, so all of them count towards overfitting.</p>
<p><b>(c)</b> The exact figures change each run, because the widget draws a new random sample. At 600 women (about 70 events) only a small share of the bootstraps reproduce the original model, usually well under a quarter. The weaker true predictors (bmi, primigravida, ses_low, tobacco) come and go, and each noise term is selected in some resamples, often 5% to 20%. At 1600 the widget uses all 1,548 complete cases (182 events); the strong predictors become stable, but fewer than 1 bootstrap in 10 typically reproduces the original model.</p>
<p><b>(d)</b> Run A. (1) Selection at EPV 15.6 is far below the 50 needed for reliable selection: it is unstable, it dropped three true predictors, and the kept coefficients are biased upwards. (2) Run A restricts candidates by subject knowledge and spends its df on plausible non-linearity in haemoglobin and BMI; it has the higher χ² and apparent c. Apparent values do not settle the question, so Case 3 compares the corrected values.</p>`
    },
    {
      id: 't4',
      title: 'Read the bootstrap optimism',
      level: 'Apply',
      scenario: `<p>After each <i>Run analysis</i>, the Lab shows a bootstrap table (B = 100) with the apparent value, the optimism and the corrected value. Compare four runs, all at the starting seed and a 20% threshold: the default run (complete case, 14 candidates), Run A and Run B from Task 4, and Run C, which is Run B with <i>Predictor selection</i> set back to None.</p>
<p>Illustrative (synthetic) hand calculation: a model has likelihood ratio χ² = 60 on 13 candidate df, and a haemoglobin coefficient of 0.80 per g/dL below 11.</p>`,
      questions: [
        '<b>(a)</b> For the four runs, record the apparent c, its optimism, the corrected c and the corrected calibration slope.',
        '<b>(b)</b> Rank the runs by optimism and by corrected c. What does this say about EPV, selection and subject-matter restriction?',
        '<b>(c)</b> For the hand calculation, give the heuristic shrinkage factor and the shrunken haemoglobin coefficient. What must then be done with the intercept?',
        '<b>(d)</b> For the default run, compare the heuristic factor (χ² 137.4 on 15 df) with its corrected calibration slope.'
      ],
      answer: `<p><b>(a)</b> Illustrative (synthetic), B = 100 at the starting seed; after <i>New random subsample</i> the third decimal changes.</p>
<table class="data">
<tr><th>Run</th><th>EPV</th><th>Apparent c</th><th>Optimism</th><th>Corrected c</th><th>Corrected slope</th></tr>
<tr><td>Default: complete case, 14 candidates</td><td>12.1</td><td>0.727</td><td>0.023</td><td>0.704</td><td>0.90</td></tr>
<tr><td>C: imputed, 14 candidates</td><td>15.6</td><td>0.730</td><td>0.016</td><td>0.714</td><td>0.92</td></tr>
<tr><td>B: imputed, backward p &lt; 0.05</td><td>15.6</td><td>0.729</td><td>0.013</td><td>0.715</td><td>0.94</td></tr>
<tr><td>A: imputed, 10 candidates, splines</td><td>18.0</td><td>0.740</td><td>0.012</td><td>0.728</td><td>0.94</td></tr>
</table>
<p>For Run A the development panel shows 0.738 (the model pooled over five imputations) while the bootstrap table shows 0.740 (the first imputed dataset only, a simplification in the Lab).</p>
<p><b>(b)</b> Optimism falls as EPV rises: 0.023 at EPV 12.1, 0.016 at 15.6, 0.012 at 18.0. Selection (B) cut the optimism a little compared with the same candidates without selection (C), but it bought nothing: the corrected c is the same (0.715 against 0.714), because it dropped true predictors. Run A, which limited the candidates by subject knowledge before analysis, has the smallest optimism and the best corrected c.</p>
<p><b>(c)</b> s = (60 − 13) ÷ 60 = 47 ÷ 60 = 0.783. Shrunken coefficient = 0.80 × 0.783 = 0.627. All coefficients are multiplied by the same factor; the intercept is then re-estimated, with the shrunken linear predictor as an offset, so that the average predicted risk equals the observed incidence.</p>
<p><b>(d)</b> Heuristic s = (137.4 − 15) ÷ 137.4 = 122.4 ÷ 137.4 = 0.89. The bootstrap corrected slope is 0.90. The two estimates agree closely: the coefficients are about 10% too extreme.</p>`
    },
    {
      id: 't5',
      title: 'Shrink the coefficients and see what changes',
      level: 'Understand',
      scenario: `<p>Repeat Run A from Task 4 but set <i>Shrinkage</i> to <i>Uniform, bootstrap slope</i>. The bootstrap note then reports the shrinkage factor, and the shrunken model is the one sent to validation. The coefficient table in the development panel still shows the unshrunk coefficients; in Run A, prior_ptb has β = 1.405. Also use the shrinkage lab in this case.</p>`,
      questions: [
        '<b>(a)</b> Record the shrinkage factor. Calculate the shrunken coefficient and odds ratio for prior_ptb.',
        '<b>(b)</b> Why does the corrected c statistic not change when you add uniform shrinkage?',
        '<b>(c)</b> In the shrinkage lab, read the shrinkage factor at the default subsample of 400 women and then at 1500. Show the calculation for each.',
        '<b>(d)</b> Why must the intercept be re-estimated after shrinking?'
      ],
      answer: `<p><b>(a)</b> Illustrative (synthetic): the factor is 0.942 (1 minus the slope optimism of 0.058). Shrunken β = 1.405 × 0.942 = 1.324. The odds ratio falls from e<sup>1.405</sup> = 4.08 to e<sup>1.324</sup> = 3.76.</p>
<p><b>(b)</b> Multiplying every coefficient by the same positive factor keeps the order of the women's risks unchanged. The c statistic depends only on that order, so it is unchanged. What changes is the spread of the predictions, and so the calibration slope.</p>
<p><b>(c)</b> At 400 women: 53 events, χ² 33.1 on 15 df, s = (33.1 − 15) ÷ 33.1 = 18.1 ÷ 33.1 = 0.55, so the coefficients are estimated to be about 45% too large (EPV 3.5). At 1500 women: 176 events, χ² 136.6, s = (136.6 − 15) ÷ 136.6 = 121.6 ÷ 136.6 = 0.89. With more events, less shrinkage is needed.</p>
<p><b>(d)</b> Shrinking the coefficients pulls every woman's linear predictor towards the average log-odds, which shifts the average predicted risk. Re-estimating the intercept, with the shrunken linear predictor as an offset, restores calibration-in-the-large, so that the average predicted risk again equals the observed 11.7%.</p>`
    },
    {
      id: 't6',
      title: 'Validate in the tertiary hospital and decide',
      level: 'Analyse',
      scenario: `<p>The team's final model is Run A with bootstrap shrinkage (Task 6). The Lab's lower panel validates it in <code>ptb_val</code>. Compare it with the Lab's default run (complete case, all 14 candidates, no shrinkage), which is the course reference model.</p>
<p>Illustrative (synthetic) hand calculation: another tertiary sample of 400 women has 70 preterm births. At a 20% threshold the model gives 50 true positives and 90 false positives.</p>`,
      questions: [
        '<b>(a)</b> For both models, record the validation records and events, calibration-in-the-large, calibration slope, c with its interval, and the net benefit of the model and of treat all at 20%.',
        '<b>(b)</b> Interpret calibration-in-the-large and the slope by cause. What did shrinkage change? (Run A without shrinkage gave a slope of 0.79.)',
        '<b>(c)</b> For the hand calculation, compute the net benefit of the model, of treat all and of treat none. Which policy is best? Check it with the net benefit calculator.',
        '<b>(d)</b> Should the tertiary hospital use the team model now? Answer in three or four sentences.'
      ],
      answer: `<p><b>(a)</b> Illustrative (synthetic), starting seed. Both models: 1,107 records with complete data, 185 events (16.7%).</p>
<table class="data">
<tr><th>Measure</th><th>Team model</th><th>Reference model</th></tr>
<tr><td>Calibration-in-the-large</td><td>+0.32 ± 0.17</td><td>+0.29 ± 0.17</td></tr>
<tr><td>Calibration slope</td><td>0.84 ± 0.17</td><td>0.76 ± 0.16</td></tr>
<tr><td>c (95% CI)</td><td>0.718 (0.674 to 0.762)</td><td>0.710 (0.665 to 0.754)</td></tr>
<tr><td>Net benefit at 20%: model / treat all</td><td>0.0355 / −0.0411</td><td>0.0355 / −0.0411</td></tr>
</table>
<p>Treat all: (185 − 0.25 × 922) ÷ 1,107 = (185 − 230.5) ÷ 1,107 = −0.041. The model's 0.0355 means about 3.6 net true positives per 100 women compared with referring nobody.</p>
<p><b>(b)</b> Calibration-in-the-large is positive: the model predicts too low on average (about 13.3% predicted against 16.7% observed). The cause is the setting: a higher incidence and an older, higher-risk case-mix. The slope below 1 means the predictions are too extreme. Part of this was overfitting, which shrinkage removed (0.79 without shrinkage, 0.84 with it). The rest reflects weaker predictor effects in the tertiary hospital. Revealed for teaching: the data-generating model has effects 20% weaker there, a slope of 0.8, inside the interval 0.84 ± 0.17. The c statistic is close to the corrected development value of 0.728. A difference of 0.008 between the two models, or an identical net benefit, is well within chance.</p>
<p><b>(c)</b> w = 0.20 ÷ 0.80 = 0.25. Model: NB = (50 − 0.25 × 90) ÷ 400 = 27.5 ÷ 400 = 0.069. Treat all: incidence = 70 ÷ 400 = 0.175, NB = 0.175 − 0.825 × 0.25 = 0.175 − 0.206 = −0.031. Treat none: 0. The model is best: about 6.9 net true positives per 100 women, while referring everyone gives a net loss.</p>
<p><b>(d)</b> The model beats both default policies at the 20% threshold and discriminates about as well as it did internally. But it under-predicts by about 3 percentage points on average and its predictions are too extreme, so at 20% it refers fewer women than a calibrated model would. Before use, the intercept (and perhaps the slope) should be updated with tertiary data, and the updated model validated again; updating lies outside this course. The model should be reported as validated in one external hospital only.</p>`
    },
    {
      id: 't7',
      title: 'Critique a published-style preterm birth model study',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A group reports a preterm birth prediction model from 300 women at one district hospital, with 36 preterm births. Forty candidate variables were screened by univariate p-value, and those with p &lt; 0.10 entered a backward stepwise logistic model, which kept 7 predictors.</p>
<p>Haemoglobin (missing in 30%) was dichotomised at 11 g/dL, and women with missing values were excluded. The reported c statistic was 0.86 in the same 300 women. The model was called validated because a Hosmer-Lemeshow test was not significant (p = 0.51).</p>
<p>The authors recommend a risk of 50% or more as the referral threshold and report an accuracy of 91%. They present the model for use in tertiary hospitals.</p>`,
      questions: [
        '<b>(a)</b> List every flaw, grouped as critical or serious, with the principle each violates.',
        '<b>(b)</b> State what analysis you would do instead, in order.'
      ],
      answer: `<p><b>(a) Flaws</b></p>
<ul>
<li><b>Critical: sample size.</b> With 36 events and 40 candidates, EPV = 36 ÷ 40 = 0.9, below 1. Even the 7 kept predictors give EPV 36 ÷ 7 = 5.1. The model is very likely overfitted.</li>
<li><b>Critical: apparent performance presented as validation.</b> c = 0.86 is measured in the development women. There is no internal validation (a bootstrap replaying all steps) and no external validation, so the figure is optimistic by an unknown, probably large, amount.</li>
<li><b>Critical: univariate screening plus stepwise selection.</b> Both are data-driven and capitalise on chance; the kept coefficients are biased upwards (testimation) and the selected set would be unstable.</li>
<li><b>Serious: missing data.</b> Excluding the 30% with missing haemoglobin removes about 30% of the women and events, or more if missingness relates to the outcome. Imputation with the outcome in the imputation model should have been used.</li>
<li><b>Serious: dichotomised haemoglobin.</b> This discards information; risk is expected to change smoothly with haemoglobin.</li>
<li><b>Serious: Hosmer-Lemeshow test.</b> A non-significant result in a small development sample reflects low power, not good calibration. Calibration-in-the-large, the slope and a calibration plot are needed.</li>
<li><b>Serious: threshold and accuracy.</b> A 50% threshold implies that an unnecessary referral is as bad as a missed preterm birth, which is rarely true for a referral. With 12% incidence (36 ÷ 300), calling every woman low risk is already 88% accurate, so 91% accuracy says little. Net benefit at a threshold from the decision context is needed.</li>
<li><b>Serious: transportability.</b> A model from one district hospital is proposed for tertiary hospitals, with a different case-mix and incidence, without any validation there.</li>
<li><b>Not reported:</b> shrinkage; the full formula with intercept and coding; completeness of each predictor.</li>
</ul>
<p><b>(b) Better analysis</b></p>
<ol>
<li>Fix the aim, outcome and threshold. Restrict the candidates by subject knowledge to what 36 events support (about 3 df at EPV 10). Honestly, the sample is too small for a multivariable model: collect more data.</li>
<li>Impute haemoglobin with the outcome in the imputation model; keep continuous predictors continuous.</li>
<li>Fit a prespecified model, apply shrinkage and re-estimate the intercept.</li>
<li>Estimate optimism with a bootstrap that replays all steps; report the corrected c and slope.</li>
<li>Validate in a tertiary-hospital sample with at least 100 events, reporting calibration-in-the-large, slope, c with its interval and net benefit at the declared threshold.</li>
</ol>`
    }
  ]
});
