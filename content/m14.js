registerModule({
  id: 'm14',
  num: 14,
  part: 'Validation',
  title: 'Patterns of external validity',
  book: 'Ch. 19',
  minutes: 75,
  summary: 'Why a model performs differently in a new setting: the separate effects of case-mix (observed predictors, missed predictors, outcome sampling) and of regression coefficients on calibration, discrimination and net benefit, how to tell them apart, and how large a validation study must be.',
  objectives: [
    'Classify differences between two settings',
    'Predict how case-mix changes performance',
    'Explain when a calibrated model is useless',
    'Correct a nested case-control intercept',
    'Separate case-mix from coefficient effects',
    'Size an external validation study'
  ],
  format: 'cases',
  reading: [
    { cite: "Debray TPA, Vergouwe Y, Koffijberg H, et al. (2015). A new framework to enhance the interpretation of external validation studies of clinical prediction models. Journal of Clinical Epidemiology 68:279-289.", url: "https://doi.org/10.1016/j.jclinepi.2014.06.018", note: "Introduces the idea of judging external validation by how related the samples are, from reproducibility to transportability, using case-mix differences." },
    { cite: "Riley RD, Ensor J, Snell KIE, et al. (2016). External validation of clinical prediction models using big datasets from e-health records or IPD meta-analysis: opportunities and challenges. BMJ 353:i3140.", url: "https://doi.org/10.1136/bmj.i3140", note: "Explains how to examine heterogeneity in performance across clusters or studies, which is central to transportability." },
    { cite: "Riley RD, Archer L, Snell KIE, et al. (2024). Evaluation of clinical prediction models (part 2): how to undertake an external validation study. BMJ 384:e074820.", url: "https://doi.org/10.1136/bmj-2023-074820", note: "A step-by-step guide to planning and analysing an external validation, including calibration, discrimination and net benefit." },
    { cite: "Meertens LJE, van Montfort P, Scheepers HCJ, et al. (2018). Prediction models for the risk of spontaneous preterm birth based on maternal characteristics: a systematic review and independent external validation. Acta Obstetricia et Gynecologica Scandinavica 97:907-920.", url: "https://doi.org/10.1111/aogs.13358", note: "An applied preterm birth example in which published models are externally validated in an independent cohort." },
    { cite: "Davis SE, Lasko TA, Chen G, et al. (2017). Calibration drift in regression and machine learning models for acute kidney injury. Journal of the American Medical Informatics Association 24:1052-1061.", url: "https://doi.org/10.1093/jamia/ocx030", note: "Demonstrates how a model's calibration deteriorates over time as practice and populations change, even when discrimination holds." }
  ],
  essentials: `
<ul>
<li>When a model moves to a new setting, two things decide how well it works there: whether its <b>coefficients</b> still hold, and the <b>case-mix</b> (the mix of women seen there).</li>
<li>Case-mix has three parts: the predictors in the model (<b>x</b>), predictors that were missed (<b>z</b>), and the outcome itself (<b>y</b>), which a case-control design can over-sample.</li>
<li>A different mix of the predictors in the model leaves calibration intact. It changes the c statistic (a narrower mix gives a lower c) and net benefit (it depends on how many women fall on each side of the threshold).</li>
<li>A more severe mix of missed predictors shifts <b>calibration-in-the-large</b>: risks are underestimated. Net benefit can then fall below that of treating every woman. A good c statistic gives no protection.</li>
<li>Case-control sampling moves only the intercept, by the log of the sampling ratio. In a nested design the intercept can be corrected.</li>
<li>Overfitting and truly different predictor effects lower the <b>calibration slope</b>, the c statistic and net benefit.</li>
<li><b>Reference</b> and <b>refitted</b> performance help decide whether a drop in c comes from case-mix or from coefficients.</li>
<li>A validation sample needs at least 100 events and 100 non-events, and preferably 250 or more events. A small one can show only gross failure.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has built and internally validated a booking-visit model in ptb_dev. A referral hospital now wants to use it, and has its own cohort (ptb_val). In this module the team asks why the model may behave differently there, what each kind of difference does to calibration, discrimination and net benefit, and how many women a fair test needs. You do not need the earlier modules for this story.',
  defs: {
    'case-mix': 'The mix of patient characteristics in a setting, such as how many women are high or low risk.',
    'missed predictor': 'Something that affects the outcome but is not in the model, measured or not.',
    'calibration-in-the-large': 'Whether predicted risks are right on average: the intercept of a recalibration model with the slope fixed at 1, ideally 0.',
    'calibration slope': 'The coefficient of the linear predictor in the new data; 1 is ideal, below 1 means predictions are too extreme.',
    'reference performance': 'The performance expected in the new sample if the model were exactly right there, found by simulating outcomes from its own predictions.',
    'refitted performance': 'The performance of the same predictors re-estimated in the new data: an upper bound for what the model could reach.',
    'nested case-control': 'A design that keeps all cases from a defined cohort and a known fraction of the non-cases.',
    'm statistic': 'A summary of how much two settings overlap in predicted risk, from 0 (no overlap) to 1 (identical).',
    'stratification effect': 'In logistic models, adding a predictor of the outcome makes other coefficients larger, even when it is unrelated to them.'
  },
  explainers: [
    {
      id: 'casemix',
      title: 'How case-mix changes what a model can do',
      scenes: [
        { svg: EX.svg((function () { var B = EX.box({ l: 70, t: 50, w: 440, h: 160, xlim: [0, 1], ylim: [0, 0.25], xticks: [0, 0.3, 0.5, 1], xfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk of preterm birth' }), h = [0.071, 0.106, 0.108, 0.107, 0.107, 0.107, 0.107, 0.108, 0.106, 0.071], s = EX.text(40, 30, 'Development setting: predicted risks spread widely', { size: 'm', bold: true }) + B.s; h.forEach(function (v, i) { s += EX.rect(B.X(i / 10) + 3, B.Y(v), 38, B.Y(0) - B.Y(v), { role: 'pred', op: 0.55, grow: true, d: 0.3 + 0.08 * i }); }); s += EX.rect(B.X(0.3) - 1, 45, 2, B.Y(0) - 45, { role: 'muted', d: 1.4 }) + EX.text(B.X(0.3) + 6, 62, '30% threshold', { size: 's', d: 1.6 }); return s; })()),
          say: 'In the simulation the team studies, the model gives a wide spread of predicted risks. The grey line marks a treatment threshold of 30 per cent. Women below it are not treated.' },
        { svg: EX.svg((function () { var B = EX.box({ l: 70, t: 50, w: 440, h: 160, xlim: [0, 1], ylim: [0, 0.25], xticks: [0, 0.3, 0.5, 1], xfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk of preterm birth' }), h = [0.004, 0.017, 0.033, 0.05, 0.069, 0.093, 0.124, 0.167, 0.225, 0.217], s = EX.text(40, 30, 'A more severe mix of the predictors in the model', { size: 'm', bold: true }) + B.s; h.forEach(function (v, i) { s += EX.rect(B.X(i / 10) + 3, B.Y(v), 38, B.Y(0) - B.Y(v), { role: 'pred', op: 0.55, grow: true, d: 0.2 + 0.08 * i }); }); s += EX.rect(B.X(0.3) - 1, 45, 2, B.Y(0) - 45, { role: 'muted', d: 0.2 }) + EX.text(290, 284, 'Still calibrated, but few women fall below the line', { anchor: 'middle', d: 1.4 }); return s; })()),
          say: 'Now take a hospital that sees more high-risk women, on the predictors the model uses. The model is still well calibrated. But few women fall below the line, so it rarely changes the decision to treat everyone.' },
        { svg: EX.svg((function () { var B = EX.box({ l: 70, t: 50, w: 440, h: 160, xlim: [0, 1], ylim: [0, 0.25], xticks: [0, 0.3, 0.5, 1], xfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk of preterm birth' }), h = [0.004, 0.043, 0.106, 0.159, 0.188, 0.188, 0.159, 0.106, 0.043, 0.004], s = EX.text(40, 30, 'A narrower mix: risks bunch in the middle', { size: 'm', bold: true }) + B.s; h.forEach(function (v, i) { s += EX.rect(B.X(i / 10) + 3, B.Y(v), 38, B.Y(0) - B.Y(v), { role: 'pred', op: 0.55, grow: true, d: 0.2 + 0.08 * i }); }); s += EX.text(290, 284, 'c falls from 0.81 to 0.75, with perfect calibration', { anchor: 'middle', d: 1.4 }); return s; })()),
          say: 'In a hospital where women are more alike, the predicted risks bunch in the middle. There are fewer very low and very high risks to tell apart, so the c statistic falls from 0.81 to 0.75, although the model is still correct.' },
        { svg: EX.svg((function () { var B = EX.box({ l: 90, t: 40, w: 300, h: 200, xlim: [0, 1], ylim: [0, 1], xticks: [0, 0.5, 1], yticks: [0, 0.5, 1], xlabel: 'Predicted risk', ylabel: 'Observed risk' }), lg = function (p) { return Math.log(p / (1 - p)); }, ob = function (p) { return 1 / (1 + Math.exp(-(lg(p) + 0.7))); }, s = EX.text(40, 24, 'A more severe mix of missed predictors', { size: 'm', bold: true }) + B.s; s += EX.curve(B, function (x) { return x; }, 0.02, 0.98, { role: 'pred', d: 0.4 }) + EX.curve(B, ob, 0.02, 0.98, { role: 'obs', d: 1.0 }) + EX.gaps(B, [[0.2, 0.2, ob(0.2)], [0.4, 0.4, ob(0.4)], [0.6, 0.6, ob(0.6)], [0.8, 0.8, ob(0.8)]], { d: 1.8 }); s += EX.text(405, 110, 'Observed odds', { size: 's', d: 2.2 }) + EX.text(405, 128, 'about twice', { size: 's', d: 2.2 }) + EX.text(405, 146, 'the predicted', { size: 's', d: 2.2 }) + EX.text(405, 172, 'CITL about +0.7', { size: 's', bold: true, d: 2.4 }); return s; })()),
          say: 'Missed predictors act differently. Suppose the new hospital has more women with risk factors the model does not include. At every level of predicted risk, more women deliver early than predicted. The red gaps show the error: calibration in the large of about 0.7.' },
        { svg: EX.svg(EX.text(40, 40, 'What the underestimation does at the 30% threshold', { size: 'm', bold: true }) + EX.rect(60, 80, 200, 60, { role: 'pred', op: 0.35, d: 0.3 }) + EX.text(160, 106, 'Predicted 20 to 30%', { anchor: 'middle', d: 0.4 }) + EX.text(160, 126, 'so not treated', { anchor: 'middle', size: 's', d: 0.5 }) + EX.rect(300, 80, 200, 60, { role: 'err', op: 0.35, d: 1.0 }) + EX.text(400, 106, 'True risk above 30%', { anchor: 'middle', d: 1.1 }) + EX.text(400, 126, 'should have been treated', { anchor: 'middle', size: 's', d: 1.2 }) + EX.text(40, 190, 'Net benefit gain over treat all: from 0.055 to about 0', { d: 1.8 }) + EX.text(40, 216, 'and below 0 in some versions: worse than treating everyone', { d: 2.3 }) + EX.text(40, 252, 'The c statistic stays about 0.81 and does not warn you', { bold: true, d: 2.9 })),
          say: 'This matters for decisions. Many women predicted below 30 per cent truly have higher risks, and they are wrongly left untreated. Net benefit can fall below that of treating everyone, while the c statistic stays about 0.81.' },
        { svg: EX.svg(EX.text(280, 50, 'Which difference disturbs which measure?', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(60, 100, 'Mix of predictors in the model: c and net benefit', { d: 0.6 }) + EX.text(60, 135, 'Mix of missed predictors: calibration-in-the-large', { d: 1.2 }) + EX.text(60, 170, 'Case-control sampling: the intercept only', { d: 1.8 }) + EX.text(60, 205, 'Overfitting or different effects: slope, c and net benefit', { d: 2.4 }) + EX.text(60, 250, 'So check calibration at every external validation', { bold: true, d: 3.0 })),
          say: 'So each kind of difference leaves its own mark. The mix of predictors in the model moves c and net benefit. Missed predictors move calibration in the large. Case-control sampling moves only the intercept. Overfitting and different effects lower the slope.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'A different mix of the predictors in the model',
      aim: 'name the kinds of difference between two settings, and see what a different mix of the model\'s own predictors does.',
      minutes: 20,
      need: `
<p>Internal validation is the minimum: a model overfitted in its own data will not travel. But even a sound model can perform differently elsewhere, for two kinds of reason.</p>
<ul>
<li><b>Case-mix</b>: the women differ. They may differ in the predictors in the model (x), in <b>missed predictors</b> outside it (z), or in how often the outcome occurs in the sample (y), as in a case-control design.</li>
<li><b>Coefficients</b>: the predictor effects differ. They look smaller if the model was overfitted, or they truly differ because of other definitions, selection or care.</li>
</ul>
<p>To see each effect alone, the book uses a large simulation. One score x stands for the model's linear predictor and one score z for everything the model missed. The model is lp = 1.5 × x. In the development setting about 50% have the outcome, the c statistic is 0.81 and calibration is perfect. Decisions use a 30% risk threshold.</p>
<p><b>Worked example: the benchmark.</b> At a 30% threshold one true positive is worth 0.3 ÷ 0.7 = 3/7 false positives. If all 100 women are treated, 50 are true positives and 50 false positives, so net benefit = (50 − 3/7 × 50) ÷ 100 = 0.286, or 28.6 net true positives per 100 women. The model does better by 0.055: 5.5 more true positives per 100 women.</p>
<p>Selecting women on x does not bias the coefficients, so calibration stays perfect. What changes is the spread of predicted risks. A wider spread raises c; a narrower one lowers it. A more severe mix puts few women below the threshold, so the model rarely changes the decision to treat everyone.</p>
<div data-explainer="casemix"></div>`,
      scenario: `<p>A tertiary referral hospital wants the district model. Referral brings in more women with a previous preterm birth and chronic hypertension. It may also bring more women with a short cervix or a twin pregnancy, which the model does not include. High-risk women there are often treated early, which may change how strongly the predictors act.</p>`,
      widgets: `<div data-widget="caseMixLab" data-try="Keep the correlation at 0.33, choose More severe x and then Less severe x, and watch the calibration points stay on the diagonal while c and the net benefit gain change."></div>`,
      tasks: [0, 1],
      takeaway: 'A different mix of the model\'s own predictors keeps calibration but changes discrimination and usefulness, so a lower c elsewhere does not by itself mean the model is wrong.'
    },
    {
      id: 'c2',
      title: 'Missed predictors and case-control samples',
      aim: 'see why missed predictors shift calibration, and correct the intercept of a nested case-control sample.',
      minutes: 20,
      need: `
<p><b>Missed predictors.</b> If the new women are more severe on things <i>not</i> in the model, the model underestimates their risk. In the simulation calibration-in-the-large was +0.70 (at an x–z correlation of 0.33). The observed odds of the outcome were then exp(0.70) = 2.0 times the predicted odds. The slope stayed about 1 and c about 0.81. The net benefit gain fell from 0.055 to 0.001, and to −0.004 at a correlation of 0.5: worse than treating everyone. A less severe mix gives −0.70 and a higher gain.</p>
<p>Why does the slope move a little with the correlation? Adding a predictor of the outcome to a logistic model makes the other coefficients larger even when it is unrelated to them (a <b>stratification effect</b>). Confounding pulls the other way. At r = 0.33 the two balance. A more or less spread-out mix of z changes the slope, not calibration-in-the-large.</p>
<p><b>Case-control samples.</b> Sampling cases and controls in a new ratio changes only the intercept. Two cases per control, from a population with one case per control, give calibration-in-the-large of ln 2 = 0.69, with slope 1 and c 0.81.</p>
<p>In a <b>nested case-control</b> design the sampling fraction is known, so the intercept can be corrected. Worked example: of 1,000 women, 120 deliver early. All 120 cases and 220 of the 880 others are measured. The fraction f = 220 ÷ 880 = 0.25, so the sample odds are 1 ÷ 0.25 = 4 times the cohort odds: 120/220 = 0.545 against 120/880 = 0.136. Subtract ln 4 = 1.39 from the intercept and keep the coefficients.</p>`,
      scenario: `<p>Two more offers reach the team. A second referral hospital reports that its women have more cervical insufficiency and twin pregnancies, neither of which is in the model. A university group has measured an expensive marker in a nested case-control sample from a cohort, and would like to test the model there.</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'More severe missed predictors make the model underestimate risk and can make it harmful, so calibration-in-the-large must be checked; case-control sampling shifts only the intercept.'
    },
    {
      id: 'c3',
      title: 'Case-mix or coefficients?',
      aim: 'use reference and refitted performance to decide why a model performs worse in a new setting.',
      minutes: 20,
      need: `
<p><b>Coefficient differences.</b> An overfitted model has coefficients that are too large on average. A typical shrinkage factor is 0.8, and 0.6 for severe overfitting. Validated, such a model has a slope of 0.8 or 0.6, c falls from 0.81 to 0.77 or 0.72, and the net benefit gain from 0.055 to 0.037 or 0.014. Truly different effects do the same: with half of ten predictors at 0.25 times and half at 1.5 times their effect, the slope was 0.68 and c 0.74. Calibration-in-the-large stays near 0.</p>
<p>Comparing coefficients one by one between two finite samples tells you little. Even if the true effects are the same, chance makes some larger and some smaller.</p>
<p><b>Two extra numbers.</b> Suppose c is lower in the new hospital. Is the mix narrower, or are the coefficients wrong?</p>
<ul>
<li><b>Reference performance</b>: what the model would achieve if it were exactly right in the new women. Take each woman's predicted risk, simulate a new outcome with that chance, compute c, and repeat at least 100 times. For calibration the reference values are simply 0 and 1.</li>
<li><b>Refitted performance</b>: refit the same predictors in the new data. This is an upper bound for that case-mix.</li>
</ul>
<p>If the external c is well below the reference c, case-mix does not explain the drop; the coefficients do not hold. Worked example (book example): a testicular cancer model had c 0.818 at development, 0.812 after internal validation, 0.785 externally, but a reference c of 0.824. The new case-mix should have allowed 0.824, so the coefficients were the problem.</p>
<p>A rough summary of overlap is the <b>M statistic</b>: group predicted risks into bands, take the smaller of the two settings' fractions in each band, and add them. Below 0.88, interpret comparisons with care.</p>`,
      scenario: `<p>The team validates its full model (14 predictors, 15 coefficients) in the referral hospital cohort, ptb_val, using women with complete data. The c statistic is lower than at development, the model underestimates risk, and the slope is below 1. The referral hospital asks whether the model is simply meeting a harder case-mix, or whether it is wrong there.</p>`,
      widgets: '',
      tasks: [4, 5],
      takeaway: 'Compare the external c with the reference c for the new case-mix: a shortfall below the reference points to coefficients that do not hold.'
    },
    {
      id: 'c4',
      title: 'How many women does a validation need?',
      aim: 'calculate the smallest miscalibration a validation sample can detect, and judge a validation report.',
      minutes: 15,
      need: `
<p>Every measure from a validation sample has a <b>standard error</b> (SE). In small samples it is large. The effective size is set mainly by the number of events, not the number of women.</p>
<p>A published model is treated as fixed, and its performance is compared with the ideal values (a one-sample test). Calibration-in-the-large can be wrong in either direction, so the test is two-sided. For the slope only a value below 1 matters, and for c only a fall, so those tests are one-sided. With 5% type I error and 80% power:</p>
<div class="formula">smallest detectable difference = (1.96 + 0.84) × SE = 2.80 × SE (two-sided); (1.645 + 0.84) × SE ≈ 2.49 × SE (one-sided)</div>
<p><b>Worked example.</b> With 50 events and 50 non-events, the SE of calibration-in-the-large is 0.24. So 2.80 × 0.24 = 0.67, and exp(0.67) = 1.96: only predictions about twice too high or too low can be detected. The slope SE is also 0.24, so 1 − 2.49 × 0.24 = 0.40: only a slope below 0.40 is detectable. For c (SE 0.043), only a fall of 2.49 × 0.043 = 0.107 is detectable.</p>
<p>Clinically relevant failure might be odds 1.5 times too high or low, a slope below 0.8, or a fall in c of more than 0.05. That needs at least 100 events and 100 non-events, and preferably 250 or more events (or 100 events with 900 non-events). For a split of one data set by time, a 2:1 development to validation ratio is a fair balance.</p>`,
      scenario: `<p>The referral hospital expects about 12% of women to deliver early. It asks how many women it must follow to test the model fairly. Meanwhile, a smaller hospital sends a report of its own validation of the model.</p>`,
      widgets: `<div data-widget="validationPower" data-try="Set 10% incidence and step from 50 to 200 events, watching the smallest detectable slope rise towards 1."></div>`,
      tasks: [6, 7],
      takeaway: 'A validation with fewer than 100 events can reveal only gross failure; plan for 100 to 250 or more events, and judge calibration as well as c.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Types of difference between settings',
      html: `
<p>External performance depends on the validity of the coefficients and on case-mix. Internal validity is a minimum prerequisite.</p>
<table class="data">
<tr><th>Difference</th><th>Characteristic</th><th>Typical situation</th></tr>
<tr><td>Case-mix in X</td><td>More or less severe or heterogeneous on included predictors</td><td>Referral centre; wider or narrower inclusion</td></tr>
<tr><td>Case-mix in Z</td><td>Different selection on characteristics outside the model</td><td>A different type of setting</td></tr>
<tr><td>Case-mix in Y</td><td>Retrospective sampling of cases and controls</td><td>Case-control design</td></tr>
<tr><td>Coefficients smaller</td><td>Overfitted model</td><td>Small development sample</td></tr>
<tr><td>Coefficients different</td><td>Truly different population, definitions or selection</td><td>A different setting</td></tr>
</table>
<p>Z may be independent of X or correlated with it, and differences in its distribution can never be ruled out in advance. Even with identical true coefficients, re-estimated coefficients differ by chance, so one-by-one comparison between small samples is uninformative.</p>
<p><b>Simulation set-up (book).</b> Populations of 500,000, incidence close to 50%, threshold 30%, after a testicular cancer case study. x and z standard normal; model lp = 1.5x with c 0.81. True models: r = 0, 2.05x + 1.5z; r = 0.33, 1.5x + 1.5z; r = 0.5, 1.18x + 1.5z. The adjusted coefficient exceeds 1.5 at r = 0 through the stratification effect of non-linear models; positive correlation (confounding) pulls it down; at r = 0.33 the two balance. Measures: a|b=1 (intercept with lp as offset, ideal 0, positive = underestimation), slope b (ideal 1), c, and NB gain over the best default (development 0.055; treat all 0.286).</p>
<p class="src">Source: Ch. 19, §19.1-19.2 (Tables 19.1-19.2)</p>`
    },
    {
      id: 'n2',
      title: 'Case-mix in the observed predictors',
      html: `
<p>Selection on x depends only on a predictor in the model (as with data missing at random given x), so coefficients stay unbiased, so a|b=1 = 0 and b = 1 throughout.</p>
<table class="data">
<tr><th>Selection on x</th><th>c</th><th>NB gain</th></tr>
<tr><td>Development</td><td>0.81</td><td>0.055</td></tr>
<tr><td>More severe</td><td>0.77</td><td>0.006</td></tr>
<tr><td>Less severe</td><td>0.77</td><td>0.104</td></tr>
<tr><td>More heterogeneous</td><td>0.90</td><td>0.104</td></tr>
<tr><td>Less heterogeneous</td><td>0.75</td><td>0.030</td></tr>
</table>
<p>Heterogeneity drives c; severity relative to the threshold drives usefulness (more severe: few predictions below 30%, gain near 0; it would reach 0 with more selective inclusion). The patterns did not depend on the x-z correlation.</p>
<div class="callout book"><b>Book example</b><p>A testicular cancer model lost clinical usefulness at validation in a tertiary referral centre, partly because only patients suspected of residual tumour (larger masses) were operated and verified.</p></div>
<div class="callout warn"><b>Pitfall</b><p>Selection on X can produce predictions outside the development range; missed non-linearities or interactions then break calibration too.</p></div>
<p class="src">Source: Ch. 19, §19.3.1-19.3.3 (Table 19.3, Figs. 19.3-19.4); §19.9</p>`
    },
    {
      id: 'n3',
      title: 'Case-mix in missed predictors and outcomes',
      html: `
<p><b>Severity in z.</b> At r = 0.33, a|b=1 = +0.70 (more severe; observed odds 2.0 times predicted) or −0.70 (less severe); slope about 1, c about 0.81. At r = 0 the slope was 1.12 (selection reduces the stratification effect: 1.12 × 1.5 = 1.68); at r = 0.5, 0.93. NB gain in the more severe population: 0.001 at r = 0.33 and −0.004 at r = 0.5; in the less severe population 0.109.</p>
<div class="callout warn"><b>Critical</b><p>Underestimated risk can make a model harmful (net benefit below a default policy). c is insensitive to calibration-in-the-large, so calibration must be checked at every external validation.</p></div>
<p><b>Heterogeneity in z</b> affects the slope, not a|b=1: for a more heterogeneous z, slopes 0.78, 1 and 1.18 at r = 0, 0.33 and 0.5. Higher slopes went with better discrimination and usefulness.</p>
<p><b>Outcome sampling.</b> 2 cases per control (from a 1:1 population): a|b=1 = 0.69 = ln 2; 1 case per 2 controls: −0.69; slope 1, c 0.81. Usefulness is meaningful only after correcting the intercept. In a traditional case-control study the number of underlying controls is unknown; in a nested design the fractions are known, and the intercept is corrected, for example by weighting controls by the inverse of their sampling fraction.</p>
<p class="src">Source: Ch. 19, §19.3.4-19.4 (Figs. 19.5-19.7)</p>`
    },
    {
      id: 'n4',
      title: 'Coefficients and the overall pattern',
      html: `
<table class="data">
<tr><th>Scenario</th><th>a|b=1</th><th>b</th><th>c</th><th>NB gain</th></tr>
<tr><td>More / less heterogeneous z (r = 0.33)</td><td>0</td><td>1</td><td>0.83 / 0.81</td><td>0.062 / 0.053</td></tr>
<tr><td>Overfitted, shrinkage 0.8 / 0.6</td><td>0</td><td>0.8 / 0.6</td><td>0.77 / 0.72</td><td>0.037 / 0.014</td></tr>
<tr><td>Effects × 0.5 or 1.5 (ten predictors)</td><td>0</td><td>0.84</td><td>0.78</td><td>0.040</td></tr>
<tr><td>Effects × 0.25 or 1.5</td><td>0</td><td>0.68</td><td>0.74</td><td>0.023</td></tr>
</table>
<ul>
<li><b>Calibration-in-the-large</b>: disturbed by severity in missed predictors (usually outside the researcher's control) and by case-control sampling (under it).</li>
<li><b>Slope</b>: disturbed by overfitting, truly different effects and heterogeneity in missed predictors.</li>
<li><b>Discrimination</b> moves with the slope and falls with a more homogeneous X.</li>
<li><b>Usefulness</b> needs discrimination, but calibration and discrimination are not sufficient: the distribution of predictions around the threshold matters (case-mix in X), and case-mix in Z acts through calibration-in-the-large.</li>
</ul>
<p>Combined (trial to survey: less heterogeneous X, more severe Z, effects × 0.5 or 1.5): a|b=1 0.69, slope 0.59, c 0.65, NB gain −0.036. The course's case-mix lab re-simulates these scenarios, so its values are close to, not identical with, the printed ones.</p>
<p class="src">Source: Ch. 19, §19.5 (Tables 19.3-19.4, Figs. 19.8-19.9)</p>`
    },
    {
      id: 'n5',
      title: 'Reference and refitted values',
      html: `
<p><b>Reference value</b>: performance expected if the model were correct in the validation case-mix. Compute predictions, generate outcomes at random with those probabilities, compute c (or R², Brier), repeat at least 100 (say 1,000) times and average. For calibration the reference values are 0 and 1. <b>Refitted value</b>: apparent performance of the same predictors re-estimated in the validation data; an upper bound that depends on case-mix and predictor strength.</p>
<table class="data">
<tr><th>Book example</th><th>Apparent</th><th>Internal</th><th>External</th><th>Reference</th><th>Refitted</th></tr>
<tr><td>Testicular cancer</td><td>0.818</td><td>0.812</td><td>0.785</td><td>0.824</td><td>0.819</td></tr>
<tr><td>Traumatic brain injury</td><td>0.767</td><td>0.765</td><td>0.816</td><td>0.804</td><td>0.819</td></tr>
</table>
<p>Testicular cancer: the drop was due to coefficients, not case-mix. Brain injury: the better external c was partly case-mix (reference above development) and partly stronger effects (slope 1.08).</p>
<p><b>M statistic</b>: bands of predicted probability (for example 0-25, 26-50, 51-75, 76-90, 91-95, 96-100%); sum over bands of the smaller of the two fractions; 0 = no overlap, 1 = identical; an arbitrary cut-off of 0.88 has been suggested. Illustrative (synthetic): fractions 0.40, 0.30, 0.15, 0.10, 0.05 against 0.25, 0.30, 0.20, 0.15, 0.10 give M = 0.85. Case-mix is otherwise compared informally in a "Table 1".</p>
<p class="src">Source: Ch. 19, §19.6 (Table 19.5); §19.9</p>`
    },
    {
      id: 'n6',
      title: 'Uncertainty and sample size',
      html: `
<p>Book simulation: ten normal predictors, c 0.81, incidence 50%.</p>
<table class="data">
<tr><th>Development / validation events of N</th><th>a|b=1</th><th>Slope</th><th>c</th></tr>
<tr><td>5000 of 10,000 / 5000 of 10,000</td><td>0 ± 0.03</td><td>1.00 ± 0.03</td><td>0.81 ± 0.004</td></tr>
<tr><td>50 of 100 / 5000 of 10,000</td><td>0 ± 0.28</td><td>0.64 ± 0.15</td><td>0.77 ± 0.017</td></tr>
<tr><td>5000 of 10,000 / 50 of 100</td><td>0 ± 0.24</td><td>1.06 ± 0.24</td><td>0.82 ± 0.043</td></tr>
<tr><td>5000 of 10,000 / 100 of 200</td><td>0 ± 0.16</td><td>1.03 ± 0.17</td><td>0.81 ± 0.030</td></tr>
<tr><td>5000 of 10,000 / 250 of 500</td><td>0 ± 0.11</td><td>1.01 ± 0.10</td><td>0.80 ± 0.018</td></tr>
</table>
<p>Small validation samples give imprecise and slightly upward-biased slope and c. Detectable differences (80% power, 5% error):</p>
<table class="data">
<tr><th>Incidence; events / N</th><th>a|b=1 (OR)</th><th>Slope</th><th>Fall in c</th></tr>
<tr><td>50%; 50 / 100</td><td>±0.67 (1.96)</td><td>&lt; 0.40</td><td>0.107</td></tr>
<tr><td>50%; 100 / 200</td><td>±0.45 (1.57)</td><td>&lt; 0.58</td><td>0.077</td></tr>
<tr><td>50%; 250 / 500</td><td>±0.31 (1.36)</td><td>&lt; 0.75</td><td>0.045</td></tr>
<tr><td>50%; 500 / 1000</td><td>±0.22 (1.25)</td><td>&lt; 0.83</td><td>0.035</td></tr>
<tr><td>50%; 1000 / 2000</td><td>±0.17 (1.18)</td><td>&lt; 0.88</td><td>0.022</td></tr>
<tr><td>10%; 50 / 500</td><td>±0.45</td><td>&lt; 0.63</td><td>0.075</td></tr>
<tr><td>10%; 100 / 1000</td><td>±0.34</td><td>&lt; 0.75</td><td>0.052</td></tr>
<tr><td>10%; 200 / 2000</td><td>±0.25</td><td>&lt; 0.83</td><td>0.037</td></tr>
</table>
<p>For a truly invalid model (slope 0.84, c falling from 0.821 to 0.778), power for the slope was 25%, 50% and 78% with 100, 250 and 500 events; for the fall in c, 24%, 57% and 87%. Validity can also be framed as non-inferiority: the null hypothesis is that the model is invalid.</p>
<p class="src">Source: Ch. 19, §19.7-19.9 (Tables 19.6-19.8)</p>`
    }
  ],
  keyPoints: [
    'External performance depends on the validity of the coefficients and on case-mix in observed predictors, missed predictors and outcomes.',
    'Case-mix in observed predictors leaves calibration intact but changes c (heterogeneity) and net benefit (distribution of risks around the threshold).',
    'A more severe case-mix in missed predictors shifts calibration-in-the-large and can make net benefit worse than treating everyone; c does not warn of this.',
    'Case-control sampling shifts only the intercept, by the log of the sampling ratio; nested designs allow correction.',
    'Overfitting and truly different effects lower the calibration slope, c and net benefit.',
    'Reference performance (model assumed correct in the validation case-mix) and refitted performance separate case-mix effects from coefficient effects.',
    'Small validation samples give imprecise estimates; aim for at least 100 events and 100 non-events, preferably 250 or more events.',
    'Discrimination is necessary for clinical usefulness, but good calibration and discrimination together still do not guarantee it.'
  ],
  quiz: [
    {
      q: 'The district preterm birth model is used in a clinic whose women are much more alike on the model\'s predictors. Calibration is perfect, but c falls from 0.81 to 0.75. What is the most likely explanation?',
      options: [
        'The coefficients are invalid in the new clinic.',
        'The model was overfitted at development.',
        'The narrower case-mix in the observed predictors reduces the spread of predicted risks.',
        'The new women are more severe on missed predictors.'
      ],
      answer: 2,
      why: 'A less heterogeneous case-mix in X lowers c while calibration stays perfect (book simulation: c 0.75, a|b=1 = 0, b = 1). Reading every drop in c as invalid coefficients is the common mistake. Overfitting would also lower the slope below 1, and severity in missed predictors would shift calibration-in-the-large.'
    },
    {
      q: 'The model is tested in a case-control sample with 2 preterm cases per control, drawn from a population in which the model was correct and half the women had the outcome. What calibration-in-the-large do you expect?',
      options: ['0', '+0.69', '−0.69', '+2.0'],
      answer: 1,
      why: 'Doubling the case to control ratio doubles the odds of the outcome, so the intercept shifts by ln 2 = 0.69; the slope and c are unchanged. +2.0 confuses the odds ratio with its logarithm, and −0.69 has the sign reversed (that would be 1 case per 2 controls).'
    },
    {
      q: 'At the referral hospital the preterm model has c 0.80 and slope 1.0, but calibration-in-the-large is +0.70. Treatment is offered above a 30% predicted risk. What can happen to net benefit compared with treating all women?',
      options: [
        'It must be positive, because c is good.',
        'It is unaffected, because net benefit depends only on discrimination.',
        'It cannot be calculated when calibration is off.',
        'It can fall to zero or below, because many women predicted below 30% truly exceed it.'
      ],
      answer: 3,
      why: 'In the book simulation a more severe mix of missed predictors (a|b=1 about 0.70) cut the net benefit gain to about zero, and below zero at a higher x-z correlation. Good discrimination does not protect decisions: c ignores calibration-in-the-large, but treatment decisions use absolute risks. Net benefit can always be calculated; it is simply low.'
    },
    {
      q: 'In a preterm validation sample the SE of calibration-in-the-large is 0.11. With 80% power and a two-sided 5% test, what is the smallest detectable miscalibration, as an odds ratio?',
      options: ['About 1.12', 'About 1.36', 'About 1.57', 'About 1.96'],
      answer: 1,
      why: '2.80 × 0.11 = 0.31 and exp(0.31) = 1.36, the book value for 250 events and 250 non-events. 1.12 uses 1 × SE, with no allowance for the test or for power. 1.57 and 1.96 are the values for SEs of 0.16 and 0.24 (100 and 50 events).'
    },
    {
      q: 'Book example: a testicular cancer model had development c 0.818, external c 0.785, reference c 0.824 and refitted c 0.819. What explains the poorer external discrimination?',
      options: [
        'Differences in regression coefficients between the settings.',
        'A more homogeneous case-mix in the validation centre.',
        'The validation sample was too small, so the difference must be chance.',
        'Overfitting that internal validation failed to detect.'
      ],
      answer: 0,
      why: 'The reference c, which assumes the model is correct for the new case-mix, is as high as at development, so the case-mix does not explain the drop; the coefficients do not hold as well. A more homogeneous case-mix would give a reference c below development. Internal validation showed little optimism (0.812), which argues against hidden overfitting.'
    },
    {
      q: 'Which change between the district and referral hospitals would mainly lower the calibration slope while leaving calibration-in-the-large near 0?',
      options: [
        'A case-control sample with more preterm cases.',
        'More women with a short cervix, which is not in the model.',
        'Weaker true effects of the predictors at the referral hospital.',
        'More women with a previous preterm birth, which is in the model.'
      ],
      answer: 2,
      why: 'Weaker or different coefficients (and overfitting) lower the slope with a|b=1 near 0. Case-control sampling and severity in a missed predictor (short cervix) shift calibration-in-the-large. Severity in an included predictor leaves both calibration measures intact and changes c and net benefit instead.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Name the differences',
      level: 'Understand',
      scenario: `<p>The referral hospital lists five ways in which it differs from the district hospital.</p>
<ol>
<li>More women have had a previous preterm birth.</li>
<li>More women have a short cervix on scan. This is not in the model.</li>
<li>Gestational age is always dated by an early scan. The district hospital used the last period when there was no early scan.</li>
<li>Women with chronic hypertension start treatment early. This may weaken the effect of that predictor.</li>
<li>The district model was built from many candidate predictors, with no shrinkage.</li>
</ol>`,
      questions: [
        '<b>(a)</b> Classify each difference as case-mix in X, case-mix in Z, case-mix in Y, coefficients smaller, or coefficients different.',
        '<b>(b)</b> For each, say which performance measure you expect to change first.',
        '<b>(c)</b> Why would comparing each coefficient between the two hospitals tell you little?'
      ],
      answer: `<p><b>(a)</b> (1) Case-mix in X: more severe on an included predictor. (2) Case-mix in Z: more severe on a missed predictor. (3) Coefficients different: a different outcome definition (it may also shift the outcome frequency). (4) Coefficients different: a truly different effect because of care. (5) Coefficients smaller than expected: an overfitted model.</p>
<p><b>(b)</b> (1) Calibration stays intact; c and net benefit change, and with a more severe mix the net benefit gain over treating all falls. (2) Calibration-in-the-large becomes positive (risks underestimated), and net benefit may fall below treating all. (3) and (4) Mainly the calibration slope and c; a changed definition can also move calibration-in-the-large. (5) The slope falls below 1, with lower c and net benefit.</p>
<p><b>(c)</b> Each coefficient is estimated with error in both finite samples. Even if all true effects were identical, chance would make some larger and some smaller; it would be a coincidence if they agreed well. Summary measures of the whole linear predictor (slope, calibration-in-the-large) are more informative.</p>`
    },
    {
      id: 't1',
      title: 'Explore selection on the observed predictor',
      level: 'Understand',
      scenario: `<p>Use the case-mix lab in this case. It re-simulates the book's design: x is the model's linear predictor, z a missed predictor, the model is lp = 1.5x, and net benefit is judged at a 30% threshold. Leave the correlation between x and z at 0.33.</p>`,
      questions: [
        '<b>(a)</b> Choose Development setting and record CITL, slope, c and the net benefit gain over treat all.',
        '<b>(b)</b> Run More severe x, Less severe x, More heterogeneous x and Less heterogeneous x. Record the same four numbers and the outcome incidence for each.',
        '<b>(c)</b> Which measures stay the same, and why?',
        '<b>(d)</b> More severe x and Less severe x have almost the same c. Why is the net benefit gain so different?'
      ],
      answer: `<p><b>(a)</b> Development: CITL 0.00, slope 1.00, c 0.813, gain 0.055.</p>
<p><b>(b)</b> Values shown by the lab (close to the book's):</p>
<table class="data">
<tr><th>Scenario</th><th>CITL</th><th>Slope</th><th>c</th><th>Gain</th><th>Incidence</th><th>Book c / gain</th></tr>
<tr><td>More severe x</td><td>0.00</td><td>0.99</td><td>0.772</td><td>0.011</td><td>64%</td><td>0.77 / 0.006</td></tr>
<tr><td>Less severe x</td><td>+0.01</td><td>1.01</td><td>0.776</td><td>0.096</td><td>35%</td><td>0.77 / 0.104</td></tr>
<tr><td>More heterogeneous x</td><td>−0.01</td><td>1.00</td><td>0.897</td><td>0.113</td><td>50%</td><td>0.90 / 0.104</td></tr>
<tr><td>Less heterogeneous x</td><td>0.00</td><td>0.98</td><td>0.748</td><td>0.029</td><td>50%</td><td>0.75 / 0.030</td></tr>
</table>
<p><b>(c)</b> CITL stays near 0 and the slope near 1. Selecting women on a predictor in the model does not bias the coefficients, so the model stays calibrated.</p>
<p><b>(d)</b> Net benefit depends on where predictions fall relative to the 30% threshold. In the more severe group most women are above 30%, so the model agrees with "treat all" for nearly everyone and adds little (0.011, that is about 1 net true positive per 100 women). In the less severe group many women fall below 30%, and the model spares them unnecessary treatment (0.096, about 10 per 100).</p>`
    },
    {
      id: 't2',
      title: 'When a missed predictor makes the model harmful',
      level: 'Analyse',
      scenario: `<p>Use the case-mix lab in Case 1. Choose More severe z, and run it at each correlation between x and z: 0, 0.33 and 0.5. Then run Case-control 2:1 at a correlation of 0.33.</p>`,
      questions: [
        '<b>(a)</b> Record CITL, slope, c and the net benefit gain for the three More severe z runs.',
        '<b>(b)</b> Convert the CITL at 0.33 into a ratio of observed to predicted odds.',
        '<b>(c)</b> Explain why the gain becomes negative at 0.5, although c is still about 0.78.',
        '<b>(d)</b> Explain why the slope is above 1 at a correlation of 0 and below 1 at 0.5.',
        '<b>(e)</b> What single measure changes in Case-control 2:1, and by how much?'
      ],
      answer: `<p><b>(a)</b> Lab values: r = 0: CITL +0.69, slope 1.17, c 0.843, gain +0.023. r = 0.33: CITL +0.69, slope 0.99, c 0.808, gain 0.000. r = 0.5: CITL +0.63, slope 0.89, c 0.779, gain −0.008. (Book: +0.70 at 0.33; slopes 1.12 and 0.93 at 0 and 0.5; gains 0.001 and −0.004.)</p>
<p><b>(b)</b> exp(0.69) = 1.99: the observed odds of the outcome are about twice the predicted odds. The model underestimates risk.</p>
<p><b>(c)</b> Decisions use absolute risk. Many women predicted below 30% truly have risks above 30%, and they are wrongly left untreated. The harm from these missed cases outweighs the false positives the model avoids, so using the model is worse than treating everyone. The c statistic only ranks women and ignores calibration-in-the-large, so it does not show this.</p>
<p><b>(d)</b> Selecting on z reduces its variation. At r = 0 this weakens the stratification effect that made the true x coefficient larger than 1.5 (2.05 adjusted versus 1.5 unadjusted), so the unadjusted effect of x looks stronger than 1.5 and the slope exceeds 1 (book: 1.12, an effect of 1.12 × 1.5 = 1.68). At r = 0.5 confounding dominates: part of the x effect came through z, and selection on z removes some of it, so the slope falls below 1.</p>
<p><b>(e)</b> Only CITL, by about +0.70 (ln 2 = 0.69). The slope stays 1.00 and c 0.813. Net benefit there is meaningful only after correcting the intercept.</p>`
    },
    {
      id: 't3',
      title: 'Correct a nested case-control intercept',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A university group has a cohort of 3,000 women, of whom 360 delivered early. A costly marker was measured in all 360 cases and in 720 of the 2,640 women who delivered at term. A model fitted in this sample (the district linear predictor plus the marker) has an intercept of −0.40.</p>`,
      questions: [
        '<b>(a)</b> Calculate the control sampling fraction and how many times higher the odds of preterm birth are in the sample than in the cohort.',
        '<b>(b)</b> Correct the intercept for use in the cohort.',
        '<b>(c)</b> Check (a) from the proportions of preterm birth in the sample and in the cohort.',
        '<b>(d)</b> Which numbers need no correction? Could you correct the intercept if the controls had come from an unknown number of term births?'
      ],
      answer: `<p><b>(a)</b> f = 720 ÷ 2,640 = 0.273. All cases were kept, so the sample odds are 1 ÷ 0.273 = 3.67 times the cohort odds.</p>
<p><b>(b)</b> ln 3.67 = 1.30. Corrected intercept = −0.40 − 1.30 = −1.70.</p>
<p><b>(c)</b> Sample: 360 ÷ 1,080 = 33.3%, odds 0.333 ÷ 0.667 = 0.500. Cohort: 360 ÷ 3,000 = 12.0%, odds 0.120 ÷ 0.880 = 0.136. Ratio 0.500 ÷ 0.136 = 3.67.</p>
<p><b>(d)</b> The coefficients, and therefore the calibration slope and c, are not affected by outcome-based sampling. In a traditional case-control study the number of underlying controls is unknown, so f and the correction cannot be found; only the nested design makes absolute risks possible.</p>`
    },
    {
      id: 't4',
      title: 'Is the referral case-mix different?',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The team groups the full model's predicted risks into five bands: below 5%, 5 to 9.9%, 10 to 19.9%, 20 to 29.9%, and 30% or more. Rounded fractions of women in each band are 0.22, 0.40, 0.24, 0.07, 0.07 in ptb_dev and 0.22, 0.35, 0.24, 0.09, 0.10 in ptb_val.</p>`,
      questions: [
        '<b>(a)</b> Calculate the M statistic and interpret it against the suggested cut-off of 0.88.',
        '<b>(b)</b> Describe, step by step, how the team would calculate the reference c in ptb_val.',
        '<b>(c)</b> Which way has the case-mix shifted, and what would you expect this to do to the reference c?'
      ],
      answer: `<p><b>(a)</b> Smaller fraction in each band: 0.22, 0.35, 0.24, 0.07, 0.07. M = 0.22 + 0.35 + 0.24 + 0.07 + 0.07 = 0.95. This is above 0.88, so the two settings overlap well in predicted risk; comparisons with development performance are reasonable.</p>
<p><b>(b)</b> (1) Use the development model to compute each ptb_val woman's predicted risk. (2) For each woman, draw a new outcome at random with that probability. (3) Compute c for the predictions against these simulated outcomes. (4) Repeat at least 100 times (say 1,000) and average. The result is the c that the model would reach if it were exactly correct for this case-mix.</p>
<p><b>(c)</b> More women sit in the higher bands (20% or more: 0.19 against 0.14), so the referral mix is somewhat more severe and more spread out. A wider spread of correct predictions should give a reference c a little higher than at development. M summarises overlap only roughly; the reference c is the direct check.</p>`
    },
    {
      id: 't5',
      title: 'Interpret the referral hospital validation',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). The full 14-predictor model (15 coefficients) from ptb_dev (1,548 complete cases, 182 preterm births) is validated in ptb_val using complete cases (1,107 women, 185 preterm births). One analysis gave:</p>
<table class="data">
<tr><th>Measure</th><th>Value</th></tr>
<tr><td>Apparent c (development)</td><td>0.727</td></tr>
<tr><td>Bootstrap-corrected c; shrinkage factor (development)</td><td>0.704; 0.90</td></tr>
<tr><td>External c</td><td>0.710</td></tr>
<tr><td>External calibration-in-the-large (SE)</td><td>+0.29 (0.088)</td></tr>
<tr><td>External calibration slope (SE)</td><td>0.76 (0.082)</td></tr>
<tr><td>Reference c in ptb_val</td><td>0.763</td></tr>
<tr><td>Refitted c in ptb_val</td><td>0.730</td></tr>
</table>
<p>The course's live values for this validation are c <span data-live="ptb_val_c"></span>, slope <span data-live="ptb_val_slope"></span> and calibration-in-the-large <span data-live="ptb_val_citl"></span>. Bootstrap values vary slightly between runs.</p>`,
      questions: [
        '<b>(a)</b> Interpret calibration-in-the-large and the slope. Is the slope explained by overfitting alone?',
        '<b>(b)</b> Use the reference and refitted c to decide whether the external c reflects case-mix or coefficients.',
        '<b>(c)</b> Map the findings onto the types of difference in this module.',
        '<b>(d)</b> Was the sample large enough to detect the miscalibration found? Calculate the smallest detectable calibration-in-the-large and slope from the SEs.'
      ],
      answer: `<p><b>(a)</b> +0.29: the observed odds of preterm birth are exp(0.29) = 1.34 times the predicted odds, so the model underestimates risk at the referral hospital. The slope 0.76 is below the shrinkage factor 0.90. Overfitting alone would explain a slope of about 0.9; the extra shortfall suggests weaker predictor effects in the new setting.</p>
<p><b>(b)</b> The reference c (0.763) is higher than the development c (0.727): the referral mix is more spread out, so a correct model should discriminate better there. The external c (0.710) is well below the reference, so case-mix in X does not explain it; the coefficients do not hold. The refitted c (0.730) is also below the reference, so even re-estimated, the predictors are less predictive there.</p>
<p><b>(c)</b> All three kinds are present in the synthetic data-generating process: case-mix in X (older women, more previous preterm birth and chronic hypertension: more spread-out risks); a higher baseline risk not explained by the predictors, which acts like a more severe mix of missed predictors and gives a positive CITL; and true predictor effects 20% weaker (coefficients different), on top of mild overfitting.</p>
<p><b>(d)</b> Calibration-in-the-large: 2.80 × 0.088 = 0.25 (odds ratio exp(0.25) = 1.28). Slope: 1 − 2.49 × 0.082 = 1 − 0.20 = 0.80. The observed +0.29 and 0.76 both lie beyond these, so the study had reasonable power for them. With 185 events it meets the book's minimum, but smaller failure (odds 1.2 times too high, say) could go undetected.</p>`
    },
    {
      id: 't6',
      title: 'Plan the size of the validation study',
      level: 'Apply',
      scenario: `<p>Use the validation sample size widget in this case. The referral hospital expects about 12% preterm births, and the widget's nearest setting is 10% incidence. It wants to detect a calibration slope below 0.8 and a fall in c of more than 0.05.</p>`,
      questions: [
        '<b>(a)</b> Set 10% incidence and step through 50, 100 and 200 events. Record the smallest detectable slope and fall in c.',
        '<b>(b)</b> Which row meets both targets?',
        '<b>(c)</b> At 12% incidence, how many women must be followed to obtain 100 and 200 events?',
        '<b>(d)</b> Switch to 50% incidence and choose 100 events. Compare the detectable slope with the 10% row at 100 events, and explain the difference.'
      ],
      answer: `<p><b>(a)</b> 50 events / 500: slope &lt; 0.63, fall in c 0.075. 100 / 1,000: &lt; 0.75, 0.052. 200 / 2,000: &lt; 0.83, 0.037.</p>
<p><b>(b)</b> Only 200 events: a slope below 0.83 includes 0.8, and 0.037 is smaller than 0.05. With 100 events a slope of 0.8 would be missed (only &lt; 0.75 detectable), and a fall of 0.05 is just short of the detectable 0.052.</p>
<p><b>(c)</b> 100 ÷ 0.12 = 834 women (833.3, rounded up); 200 ÷ 0.12 = 1,667 women. The hospital's synthetic cohort ptb_val has 1,200 women and about 200 preterm births, close to the second target.</p>
<p><b>(d)</b> At 50% incidence, 100 events with 100 non-events detect only a slope below 0.58, against below 0.75 with 100 events and 900 non-events at 10%. Events set most of the information, but extra non-events still add precision. This is why the book suggests 100 events with 900 non-events as an alternative to 250 events.</p>`
    },
    {
      id: 't7',
      title: 'Critique a small validation report',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A smaller hospital applied the district model to 300 women, of whom 30 delivered early. The report says: "The c statistic was 0.74 (district: 0.73), so the model is valid in our hospital." Calibration was not reported. The authors also refitted the model and noted that 5 of the 15 coefficients changed sign, "showing that the predictors differ here". Finally, they propose to add 150 extra preterm cases from their labour ward register to "increase power", without extra term births.</p>`,
      questions: [
        '<b>(a)</b> What can a validation with 30 events detect? Use the book\'s guidance.',
        '<b>(b)</b> Why is a similar c not enough to call the model valid here?',
        '<b>(c)</b> Comment on the comparison of coefficients.',
        '<b>(d)</b> What would the extra cases do to the analysis?',
        '<b>(e)</b> Rewrite the plan in three or four steps.'
      ],
      answer: `<p><b>(a)</b> With 30 events the SEs are even larger than at 50 events, where only odds about twice too high or low (±0.67), slopes below 0.40 and falls in c of 0.107 are detectable. <b>Critical:</b> such a study can reveal only gross failure. A c of 0.74 has a wide confidence interval.</p>
<p><b>(b)</b> c ignores calibration-in-the-large. If the women here are more severe on missed predictors, the model will underestimate risk, and its net benefit can fall below treating everyone, while c stays similar. Calibration-in-the-large and the slope must be reported.</p>
<p><b>(c)</b> With 30 events, refitted coefficients are very imprecise; even with identical true effects, chance would change some signs. Coefficient-by-coefficient comparison in small samples is uninformative. The calibration slope (one summary of all effects) is the better test.</p>
<p><b>(d)</b> Adding cases without controls is outcome-based sampling. It raises the proportion of events and shifts calibration-in-the-large upwards by about ln of the sampling ratio, so the model would look as if it underestimates risk. Unless the sampling is nested and the fractions known, absolute risk and net benefit can no longer be judged.</p>
<p><b>(e)</b> (1) Follow a consecutive cohort until at least 100 preterm births (about 830 women at 12%), ideally 200 or more. (2) Report calibration-in-the-large, slope and c with confidence intervals, and net benefit at the agreed threshold. (3) Compute the reference c for the local case-mix to separate case-mix from coefficients. (4) If miscalibrated, update the intercept before use, rather than re-estimating all coefficients.</p>`
    }
  ]
});
