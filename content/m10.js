registerModule({
  id: 'm10',
  num: 10,
  part: 'Development',
  title: 'Estimation: shrinkage, penalisation and external information',
  book: 'Ch. 13-14',
  minutes: 75,
  summary: 'Why slightly biased regression coefficients give better predictions for new patients, and how uniform shrinkage, penalised maximum likelihood, the Lasso and external (literature) information achieve this.',
  objectives: [
    'Explain why fitted predictions are too extreme',
    'Calculate and apply a uniform shrinkage factor',
    'Describe penalised estimation and the Lasso',
    'Compare shrinkage methods by their coefficients',
    'Combine literature and own data by adaptation',
    'Choose an estimation strategy for small data'
  ],
  format: 'cases',
  reading: [
    { cite: "van Houwelingen JC, Le Cessie S (1990). Predictive value of statistical models. Statistics in Medicine 9:1303-1325.", url: "https://doi.org/10.1002/sim.4780091109", note: "The source of the heuristic (uniform) shrinkage factor estimated from the model chi-square and number of parameters." },
    { cite: "Steyerberg EW, Eijkemans MJ, Habbema JD (1999). Stepwise selection in small data sets: a simulation study of bias in logistic regression analysis. Journal of Clinical Epidemiology 52:935-942.", url: "https://doi.org/10.1016/s0895-4356(99)00103-1", note: "Shows how automatic variable selection in small samples inflates coefficients, which is the problem that shrinkage is meant to repair." },
    { cite: "Pavlou M, Ambler G, Seaman SR, et al. (2015). How to develop a more accurate risk prediction model when there are few events. BMJ 351:h3868.", url: "https://doi.org/10.1136/bmj.h3868", note: "A short, readable introduction to ridge, lasso and related penalised regression for datasets with few events." },
    { cite: "Riley RD, Snell KIE, Martin GP, et al. (2021). Penalization and shrinkage methods produced unreliable clinical prediction models especially when sample size was small. Journal of Clinical Epidemiology 132:88-96.", url: "https://doi.org/10.1016/j.jclinepi.2020.12.005", note: "A cautionary simulation study showing that penalisation does not rescue a model built on too few participants, with wide variability in the amount of shrinkage chosen." },
    { cite: "Riley RD, Snell KIE, Ensor J, et al. (2019). Minimum sample size for developing a multivariable prediction model: Part II - binary and time-to-event outcomes. Statistics in Medicine 38:1276-1296.", url: "https://doi.org/10.1002/sim.7992", note: "Links sample size to the expected shrinkage factor, so learners see why target shrinkage of about 0.9 or more drives the number of events needed." }
  ],
  essentials: `
<ul>
<li>Standard logistic regression uses <b>maximum likelihood</b>: it picks the coefficients that fit the development data best. For new women these coefficients are not the best, because part of the fit is noise.</li>
<li>As a result, predictions for new women are <b>too extreme</b>: the highest risks are too high and the lowest risks too low. This is regression to the mean.</li>
<li>Making the coefficients a little smaller adds some bias but removes more variance, so predictions for new women improve. This is the <b>bias-variance trade-off</b>.</li>
<li><b>Uniform shrinkage</b> multiplies every coefficient by one factor s, from s = (model χ² − df) ÷ model χ² or from the bootstrap. Count the df of all candidate predictors, then re-estimate the intercept.</li>
<li><b>Penalised maximum likelihood</b> shrinks during fitting and can shrink some coefficients more than others. The <b>Lasso</b> can set some coefficients exactly to zero, so it also selects predictors.</li>
<li>Shrinkage hardly changes the c statistic. Its main effect is on calibration: the spread of predictions comes to match what new women will show.</li>
<li>Small data can borrow strength from outside: the <b>adaptation method</b> combines a precise literature estimate with the adjustment seen in the team's own data, and Bayesian priors can add documented subject knowledge.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has a 14-term booking-visit model with 15 degrees of freedom. In this module it asks how to estimate the coefficients so that the model predicts well for the next women, not only for the women it was built on: by shrinking, by penalising, and by borrowing information from published studies. You do not need the earlier modules for this story.',
  defs: {
    'maximum likelihood': 'The usual way of fitting a regression model: choose the coefficients that make the observed outcomes most probable in the data at hand.',
    'shrinkage': 'Making the coefficients of a model smaller, towards zero, so that its predictions are less extreme for new patients.',
    'shrinkage factor': 'The number, between 0 and 1, by which every coefficient is multiplied in uniform shrinkage.',
    'bias-variance trade-off': 'Accepting a small systematic error in the estimates in return for much less random error, so that predictions improve overall.',
    'penalised maximum likelihood': 'Fitting a model while paying a price for large coefficients, which shrinks them during estimation.',
    'effective degrees of freedom': 'How many coefficients a penalised model really uses; it falls as the penalty grows.',
    'lasso': 'A penalised method that limits the total size of the coefficients, so that some become exactly zero and drop out.',
    'adaptation method': 'A way to combine a literature estimate of a univariate effect with the change from univariate to multivariable seen in your own data.',
    'prior distribution': 'In Bayesian estimation, what is believed about a coefficient before the data are seen.',
    'calibration slope': 'The slope of a regression of the outcome on the model\'s linear predictor in new data; below 1 means predictions are too extreme.'
  },
  explainers: [
    {
      id: 'shrink',
      title: 'Why fitted predictions are too extreme',
      scenes: [
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 420, h: 190, xlim: [0, 0.5], ylim: [0, 0.5], xticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yticks: [0.1, 0.2, 0.3, 0.4, 0.5], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk', ylabel: 'Observed risk' });
            return EX.text(80, 26, 'Development data: the model fits its own women', { size: 'm', bold: true }) + B.s +
              EX.curve(B, function (p) { return p; }, 0.02, 0.5, { role: 'pred', d: 0.3 }) +
              EX.pts(B, [[0.03, 0.03], [0.06, 0.065], [0.10, 0.095], [0.15, 0.155], [0.22, 0.215], [0.30, 0.305], [0.40, 0.395]], { role: 'obs', d: 0.8, stagger: 0.15 });
          })()),
          say: 'The team fits its model to the women it already has. In these women the predictions look right: women given 30 per cent have about 30 per cent preterm births, and the points sit on the dashed line.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 420, h: 190, xlim: [0, 0.5], ylim: [0, 0.5], xticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], yticks: [0.1, 0.2, 0.3, 0.4, 0.5], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Predicted risk', ylabel: 'Observed risk' });
            var f = function (p) { return 1 / (1 + Math.exp(-(-0.6 + 0.7 * Math.log(p / (1 - p))))); };
            return EX.text(80, 26, 'New women: high risks too high, low risks too low', { size: 'm', bold: true }) + B.s +
              EX.curve(B, function (p) { return p; }, 0.02, 0.5, { role: 'pred', draw: false }) +
              EX.curve(B, f, 0.02, 0.5, { role: 'obs', d: 0.4 }) +
              EX.gaps(B, [[0.03, 0.03, f(0.03)], [0.40, 0.40, f(0.40)], [0.48, 0.48, f(0.48)]], { d: 1.6 }) +
              EX.text(405, 104, 'promised 40%, about 29%', { size: 's', anchor: 'end', d: 2.0 });
          })()),
          say: 'In new women from the same clinic, the observed line is flatter. Women promised 40 per cent have about 29 per cent. Women promised 3 per cent have about 5 per cent. The red gaps show that the predictions were too extreme.' },
        { svg: EX.svg((function () {
            var tru = [1.5, 0.9, 0.9, 0.7, 0.6, 0.35, 0, 0], est = [1.8, 0.55, 1.2, 0.95, 0.3, 0.6, 0.4, -0.3], s = '', z = 210, k = 70;
            s += EX.text(40, 30, 'Each estimate = true effect + noise', { size: 'm', bold: true });
            s += '<line x1="50" x2="520" y1="' + z + '" y2="' + z + '" stroke="var(--muted)"/>';
            for (var i = 0; i < 8; i++) {
              var x = 75 + i * 56, h = tru[i] * k;
              if (h > 0) s += EX.rect(x, z - h, 30, h, { role: 'muted', op: 0.5, grow: true, d: 0.1 * i });
              var ye = z - est[i] * k;
              s += '<circle cx="' + (x + 15) + '" cy="' + ye.toFixed(1) + '" r="5" class="ex-in fpred"' + EX.st(1.2 + 0.1 * i) + '/>';
              s += '<line x1="' + (x + 15) + '" x2="' + (x + 15) + '" y1="' + (z - h).toFixed(1) + '" y2="' + ye.toFixed(1) + '" stroke-width="2" class="err ex-in"' + EX.st(2.2) + '/>';
            }
            s += EX.text(40, 260, 'Grey bars: true effects. Dots: estimates from the sample.', { size: 's', d: 0.4 });
            s += EX.text(40, 280, 'The women with the highest predictions got the luckiest estimates.', { size: 's', d: 2.6 });
            return s;
          })()),
          say: 'Why does this happen? Each coefficient is the true effect plus some noise. Some estimates are too big and some too small. The women with the highest predicted risks are the ones whose risk factors happened to get the largest estimates.' },
        { svg: EX.svg((function () {
            var X = function (v) { return 60 + v / 0.45 * 440; }, s = '', bef = [0.03, 0.06, 0.12, 0.25, 0.40], aft = [0.046, 0.074, 0.120, 0.203, 0.292];
            s += EX.text(40, 30, 'Uniform shrinkage: every coefficient × 0.7, intercept reset', { size: 'm', bold: true });
            s += '<line x1="60" x2="500" y1="100" y2="100" stroke="var(--muted)"/><line x1="60" x2="500" y1="210" y2="210" stroke="var(--muted)"/>';
            s += EX.text(60, 80, 'Before: fitted predictions', { size: 's' }) + EX.text(60, 245, 'After shrinkage', { size: 's', d: 1.2 });
            for (var i = 0; i < 5; i++) {
              s += '<circle cx="' + X(bef[i]).toFixed(1) + '" cy="100" r="6" class="ex-in fpred"' + EX.st(0.3) + '/>';
              s += EX.text(X(bef[i]), 125, Math.round(bef[i] * 100) + '%', { size: 's', anchor: 'middle', d: 0.3 });
              s += EX.line([[X(bef[i]), 106], [X(aft[i]), 204]], { role: 'pred', d: 0.8 + 0.1 * i });
              s += '<circle cx="' + X(aft[i]).toFixed(1) + '" cy="210" r="6" class="ex-in fpred"' + EX.st(1.4) + '/>';
              s += EX.text(X(aft[i]), 270, (aft[i] * 100).toFixed(0) + '%', { size: 's', anchor: 'middle', d: 1.6 });
            }
            return s;
          })()),
          say: 'Uniform shrinkage multiplies every coefficient by one factor, here 0.7, and then resets the intercept. A predicted 40 per cent becomes 29, and 3 per cent becomes about 5. Risks move towards the average, and the order of the women stays the same.' },
        { svg: EX.svg(EX.text(280, 100, 'A little bias, much less variance', { size: 'l', bold: true, anchor: 'middle' }) +
            EX.text(280, 140, 'Shrunk coefficients are slightly too small on average,', { anchor: 'middle', d: 0.6 }) +
            EX.text(280, 164, 'but they vary far less from sample to sample.', { anchor: 'middle', d: 0.9 }) +
            EX.text(280, 200, 'The c statistic barely moves; calibration improves.', { anchor: 'middle', bold: true, d: 1.6 }) +
            EX.text(280, 230, 'Most needed with few events and many candidates.', { anchor: 'middle', d: 2.2 })),
          say: 'Shrunk coefficients are slightly too small on average, but they vary much less from sample to sample. For new women, that trade pays off. The c statistic barely changes, but calibration improves, most of all when events are few and candidates many.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'Why the fitted model promises too much',
      aim: 'explain why maximum likelihood predictions are too extreme for new women, and what the bias-variance trade-off means.',
      minutes: 15,
      need: `
<p>Logistic regression is usually fitted by <b>maximum likelihood</b> (ML). It chooses the intercept and coefficients that make the observed outcomes in the development data most probable. For those women the ML coefficients are the best possible. For the next women they are not.</p>
<p>Each coefficient is the true effect plus some sampling noise. The set of coefficients that fits the sample best has partly fitted its noise. Women who receive very high predicted risks were, on average, helped there by chance; in new women their observed risk is lower. Women with very low predicted risks will show a higher observed risk. The predictions are <b>too extreme</b>, the same pattern as regression to the mean.</p>
<p><b>Bias and variance.</b> The error of a prediction has two parts. <b>Bias</b> is a systematic error. <b>Variance</b> is how much the estimate would change in another sample of the same size. ML coefficients are nearly unbiased, but in small samples their variance is large. Making them a little smaller (<b>shrinkage</b>) adds a little bias and removes more variance, so the average error for new women falls.</p>
<p><b>Worked example.</b> In new women a model's predictions are checked with the <b>calibration slope</b>: regress the outcome on the model's linear predictor (lp). Suppose the result is logit(observed risk) = −0.60 + 0.70 × lp. A woman with lp = −0.80 was promised 1 ÷ (1 + e<sup>0.80</sup>) = 31.0%. Her recalibrated log-odds are −0.60 + 0.70 × (−0.80) = −1.16, a risk of 23.9%. Per 100 such women, about 24 deliver early, not 31.</p>
<div data-explainer="shrink"></div>`,
      scenario: `<p>Illustrative (synthetic). The team first fitted its booking-visit model to 800 women from the first year, with 96 preterm births and 15 degrees of freedom (EPV 6.4). A woman with a previous preterm birth and bacteriuria received a predicted risk of 31%. The team then checked the model in women booked the next year at the same clinic.</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'ML coefficients fit the development data best but give too extreme predictions for new women; a little bias in return for less variance gives better predictions.'
    },
    {
      id: 'c2',
      title: 'Shrinking every coefficient by one factor',
      aim: 'calculate the heuristic shrinkage factor, apply it, re-estimate the intercept and count the right degrees of freedom.',
      minutes: 20,
      need: `
<p>The simplest remedy is <b>uniform shrinkage</b>: multiply every coefficient b by the same <b>shrinkage factor</b> s, between 0 and 1. A quick estimate of s is the heuristic formula of van Houwelingen and le Cessie:</p>
<div class="formula">s = (model χ² − df) ÷ model χ²</div>
<ul>
<li><b>Model χ²</b> is the likelihood ratio statistic: the fall in −2 log-likelihood from the intercept-only model to the full model.</li>
<li><b>df</b> counts the degrees of freedom of all <i>candidate</i> predictors considered. A quadratic term or a 3-knot spline counts 2; a 4-level category counts 3.</li>
</ul>
<p>Why it works: if no predictor had any true effect, the model χ² would be about equal to its df. Only the part above df is signal, so s is the share of the χ² that is signal.</p>
<p><b>Worked example.</b> The team's model has 15 df and model χ² = 95. Then s = (95 − 15) ÷ 95 = 80 ÷ 95 = 0.842. Previous preterm birth, b = 1.62 (odds ratio 5.05), becomes 0.842 × 1.62 = 1.36 (odds ratio 3.91). If the χ² had been 30, s would be (30 − 15) ÷ 30 = 0.50: half of every effect would be noise.</p>
<p><b>The bootstrap</b> gives another estimate. Draw a bootstrap sample, repeat the whole modelling, including any selection, compute the linear predictor in the original data with the bootstrap coefficients, and regress the original outcomes on it. The slope is one estimate of s. Average over 200 or more samples.</p>
<p><b>Then re-estimate the intercept.</b> Shrinking changes the average predicted risk. Refit the intercept with the shrunk linear predictor as a fixed offset, so that the mean predicted risk again equals the observed incidence.</p>
<p><b>After selection</b>, use the candidate df, not the number of predictors kept. Selected coefficients are too large (testimation bias), so fewer predictors does not mean less shrinkage.</p>`,
      scenario: `<p>A colleague at a neighbouring hospital has built its own preterm model with stepwise selection, and asks the team to check how she shrank it. Meanwhile the team shrinks a small model for its satellite clinic.</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'Uniform shrinkage multiplies all coefficients by s = (χ² − df) ÷ χ², with df of all candidates, and is followed by re-estimating the intercept.'
    },
    {
      id: 'c3',
      title: 'Penalising during fitting: ridge and the Lasso',
      aim: 'describe penalised maximum likelihood and the Lasso, and see in simulation what shrinkage does to calibration and discrimination.',
      minutes: 20,
      need: `
<p><b>Penalised maximum likelihood</b> (PML) shrinks while it fits. It maximises the log-likelihood minus a price for large coefficients:</p>
<div class="formula">PML = log L − ½ λ Σ (s<sub>i</sub> b<sub>i</sub>)²</div>
<p>λ (lambda) is the penalty. s<sub>i</sub> is a scale, such as the predictor's standard deviation, so that predictors measured in different units are treated alike. The intercept is not penalised. With λ = 0 the ML estimates return. This is ridge regression for logistic models.</p>
<p>One penalty does not shrink all coefficients equally. A coefficient that the data estimate precisely resists the penalty; a weak or imprecise one is pulled further towards zero. A correlated coefficient can even grow a little.</p>
<p><b>Choosing λ.</b> Penalisation lowers the <b>effective degrees of freedom</b> of the model. Try a grid of λ values and keep the one that maximises AIC = model χ² − 2 × effective df. Cross-validation or the bootstrap can be used instead.</p>
<p><b>The Lasso</b> limits the sum of the absolute (standardised) coefficients, Σ |b<sub>i</sub>| ≤ t. With a tight limit only the strongest predictors get non-zero coefficients; the others become exactly zero and leave the model. So the Lasso shrinks and selects at once.</p>
<p><b>Worked example.</b> Uniform shrinkage with s = 0.842 turns coefficients of 1.62, 0.98 and 0.15 into 1.36, 0.83 and 0.13: the ratio is 0.842 for each. A penalised fit might give 1.52, 0.80 and 0.06, ratios of 0.94, 0.82 and 0.40, while a Lasso might set the 0.15 term to 0.</p>
<p>Uniform shrinkage cannot change the order of the women, so c does not change at all. PML and the Lasso change it only a little. The gain is in calibration.</p>`,
      scenario: `<p>The team's statistician fits the same 14-term model (15 df) in small and large subsamples of the synthetic cohort and tests each fit in a large fresh sample from the same clinic. Four terms (antenatal visits, fetal sex, monsoon conception and height) have no true effect in the data-generating model.</p>`,
      widgets: `<div data-widget="shrinkageLab" data-try="Set the subsample size to 250 and press Run 30 replications, then move the ridge penalty from 10 to 20 and run again; watch the ridge calibration slope move towards 1 while c hardly changes."></div>`,
      tasks: [4, 5],
      takeaway: 'Penalised ML shrinks during fitting, unequally across coefficients; the Lasso also sets some to zero; all three methods mainly repair calibration, not discrimination.'
    },
    {
      id: 'c4',
      title: 'Borrowing strength from published studies',
      aim: 'combine a literature coefficient with the team\'s own data by the adaptation method, and weigh Bayesian priors.',
      minutes: 15,
      need: `
<p>Many published studies report the <b>univariate</b> (unadjusted) effect of a predictor, and these can be pooled in a meta-analysis. <b>Multivariable</b> effects need individual data, which the team has only from its own cohort. The <b>adaptation method</b> combines the two:</p>
<div class="formula">adapted coefficient = literature univariate + (own multivariable − own univariate)</div>
<p>The bracket is the <b>adaptation factor</b>: how much adjusting for the other predictors changes the coefficient in the team's own data. That change is transferred to the precise literature estimate. An approximate variance, ignoring covariances, is var(literature) + var(own multivariable) − var(own univariate).</p>
<p><b>Worked example.</b> For smoking, a meta-analysis gives a univariate log odds ratio of 0.55. In the team's data the univariate coefficient is 0.80 and the multivariable one is 0.60. Adjustment lowers it by 0.20, so the adapted coefficient is 0.55 − 0.20 = 0.35.</p>
<p>A second version adds only part of the difference: own multivariable + c × (literature univariate − own univariate), with c between 0 (ignore the literature) and 1 (the first version). The method assumes that the literature and the team's data come from a common population, with similar correlations between predictors.</p>
<p><b>Bayesian estimation</b> combines a <b>prior distribution</b> for each coefficient with the data. A prior centred on zero pulls estimates towards zero, much like shrinkage. An informative prior, such as "the odds ratio is probably near 2", adds subject knowledge, but it must be justified and documented, and wide enough.</p>`,
      scenario: `<p>The satellite clinic has 30 preterm births and 11 candidate predictors. A recent meta-analysis of cohort studies reports pooled univariate effects of bacteriuria and of previous preterm birth.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'When the data are small, add knowledge from outside: adapt literature coefficients, or use documented priors, and still protect against overfitting.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Why shrink: the bias-variance trade-off',
      html: `
<p>ML coefficients are optimal for the development sample but give too extreme predictions for new patients: high predictions too high, low too low (regression to the mean). Accepting slight bias in exchange for lower variance lowers the prediction error for new patients. Shrinkage leaves the ranking of patients largely unchanged and mainly repairs calibration.</p>
<table class="data">
<tr><th>Method</th><th>Label</th><th>What it does</th></tr>
<tr><td>Uniform shrinkage</td><td>Shrinkage after estimation</td><td>Fit by ML, multiply all coefficients by s (heuristic or bootstrap)</td></tr>
<tr><td>Penalised ML</td><td>Shrinkage during estimation</td><td>Maximise log-likelihood minus a penalty on coefficient size; penalty chosen, for example, by AIC</td></tr>
<tr><td>Lasso</td><td>Shrinkage for selection</td><td>Penalise the sum of absolute coefficients; some become exactly zero</td></tr>
</table>
<p>Neural networks face the same problem more severely; they are trained with early stopping, at the number of iterations where performance in held-out data is best.</p>
<p class="src">Source: Ch. 13, §13.1-13.2, Table 13.1</p>`
    },
    {
      id: 'n2',
      title: 'Uniform shrinkage',
      html: `
<p>Heuristic factor (van Houwelingen and le Cessie): s = (model χ² − df) / model χ², with df of all candidate predictors. Bootstrap factor: in each bootstrap sample repeat the full procedure (including selection), compute the linear predictor in the original sample, and regress the original outcome on it; average the slopes (200 replications common, 500 fully stable). After shrinking, re-estimate the intercept with the shrunk linear predictor as offset.</p>
<div class="callout book"><b>Book example: GUSTO-I subsample</b><p>785 patients, 52 deaths at 30 days. 8-predictor model: χ² 62.6, s = (62.6 − 8) / 62.6 = 0.87. 17-predictor model: χ² 73.5, s = (73.5 − 17) / 73.5 = 0.77. A bootstrap with 200 replications gave similar values.</p></div>
<div class="callout warn"><b>Critical: df after selection</b><p>Selected coefficients are overestimated (testimation bias). Use the candidate df, or repeat the selection in each bootstrap sample; using only the retained df understates the shrinkage needed. Empirically, the shrinkage required is roughly similar for prespecified and selected models.</p></div>
<p class="src">Source: Ch. 13, §13.2.1-13.2.2; Ch. 14, §14.2.3</p>`
    },
    {
      id: 'n3',
      title: 'Penalised maximum likelihood',
      html: `
<p>PML = log L − ½ λ Σ (s<sub>i</sub> b<sub>i</sub>)², with s<sub>i</sub> a scaling factor (for example the predictor's SD); the intercept is not penalised, and λ = 0 gives ML. It generalises ridge regression. Effective df = trace[I(b) cov(b)], with I(b) the information matrix without penalty and cov(b) the penalised covariance matrix. The optimal λ maximises AIC = model χ²<sub>penalised</sub> − 2 × df<sub>effective</sub>, searched over a grid such as 0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48. Larger λ suits more complex models and larger data sets. One λ shrinks coefficients unequally: precisely estimated effects resist the penalty.</p>
<div class="callout book"><b>Book example: GUSTO-I subsample</b><p>Optimal penalty 8 for the 8-predictor model (effective df 6.9) and 24 for the 17-predictor model (effective df 10.8); penalised AIC was worse for the 17-predictor model at every penalty. A bootstrap search for a calibration slope of 1 suggested penalties of 7 and 12. Effective shrinkage differed between coefficients: age over 65 was reduced most (to about 0.81 times its ML value), while shock and sex increased slightly.</p></div>
<p>Refinement: penalise interaction terms more than main effects (for example twice), and nonlinear and nonlinear-interaction terms twice and four times. After stepwise selection, the penalty optimal for the full model can be applied to the selected model.</p>
<p class="src">Source: Ch. 13, §13.3, Table 13.2, Figs 13.1-13.2</p>`
    },
    {
      id: 'n4',
      title: 'The Lasso, and evidence that shrinkage works',
      html: `
<p>Lasso: maximise log L subject to Σ |b<sub>i</sub>| ≤ t for standardised predictors; the standardised factor t / Σ |b<sub>0</sub>| is varied between 0 and 1, and t is chosen by generalised cross-validation, AIC or the bootstrap. Its selection shares the instability of any data-driven selection and should be validated by bootstrapping the whole procedure.</p>
<div class="callout book"><b>Book example: GUSTO-I coefficients (8-predictor model)</b><p>The AIC-optimal Lasso kept 7 of 8 predictors (sex set to zero) and 14 of 17. ML / uniform / PML / Lasso: shock 1.12 / 0.97 / 1.17 / 1.09; age > 65 years 1.49 / 1.30 / 1.21 / 1.36; sex 0.07 / 0.06 / 0.11 / 0.00.</p></div>
<div class="callout book"><b>Book example: Table 13.3, test part of 20,318 patients</b>
<table class="data">
<tr><th>Training data</th><th>Method</th><th>c</th><th>Slope</th></tr>
<tr><td>Total training part (20,512; 1,423 deaths)</td><td>ML</td><td>0.789</td><td>0.944</td></tr>
<tr><td rowspan="4">61 small subsamples (n = 336, about 23 deaths)</td><td>ML</td><td>0.75</td><td>0.66</td></tr>
<tr><td>Uniform</td><td>0.75</td><td>1.01</td></tr><tr><td>PML</td><td>0.76</td><td>0.93</td></tr><tr><td>Lasso</td><td>0.75</td><td>0.83</td></tr>
<tr><td rowspan="4">23 large subsamples (n = 892, about 62 deaths)</td><td>ML</td><td>0.78</td><td>0.86</td></tr>
<tr><td>Uniform</td><td>0.78</td><td>0.97</td></tr><tr><td>PML</td><td>0.78</td><td>0.96</td></tr><tr><td>Lasso</td><td>0.78</td><td>1.01</td></tr>
</table>
<p>17-predictor model, large subsamples: ML slope 0.76; uniform 0.95, PML 0.98, Lasso 0.93.</p></div>
<p>Shrinkage moved c by at most 0.01 but brought the slope close to 1; the benefit is largest with small samples and many candidates.</p>
<p class="src">Source: Ch. 13, §13.4-13.5, Table 13.3, Fig. 13.5</p>`
    },
    {
      id: 'n5',
      title: 'External information: the adaptation method',
      html: `
<p>Method 1: b<sub>m|I+L</sub> = b<sub>u|L</sub> + (b<sub>m|I</sub> − b<sub>u|I</sub>), with var ≈ var(b<sub>u|L</sub>) + var(b<sub>m|I</sub>) − var(b<sub>u|I</sub>) (covariances ignored); the idea follows Greenland's proposal for meta-analysis. Method 2: b<sub>m|I+L</sub> = b<sub>m|I</sub> + c × (b<sub>u|L</sub> − b<sub>u|I</sub>), 0 ≤ c ≤ 1; the variance-minimising c depends on the bootstrap correlation of univariate and multivariable coefficients and the variances, and approaches 1 with a large literature and little collinearity.</p>
<div class="callout book"><b>Book example: elective aneurysm surgery</b><p>Own data 246 patients, 18 deaths; literature 15 series, 15,821 patients, 1,153 deaths. Age per decade: literature 0.79, own univariate 0.98, own multivariable 0.58, adapted 0.38 (the rounded figures give 0.79 + 0.58 − 0.98 = 0.39). Scores used some extra shrinkage and an intercept lowered by ln[odds(5%) / odds(7.6%)] = −0.45. Apparent c 0.83, optimism-corrected 0.80-0.81. In GUSTO-I simulations adapted coefficients were much less variable than ML; calibration improved, but some shrinkage still had to be added.</p></div>
<p>Assumptions: a common population with similar predictor correlations. Publication bias and differing predictor definitions threaten pooling. A cruder alternative recalibrates all literature univariate coefficients by one factor (a recalibrated naive Bayes); it ignores correlations and gave clearly larger weights to the correlated cardiac comorbidities in the aneurysm example.</p>
<p class="src">Source: Ch. 14, §14.1-14.3.1, Tables 14.1-14.4</p>`
    },
    {
      id: 'n6',
      title: 'Bayesian estimation and subject knowledge',
      html: `
<p>Priors centred on zero shrink estimates like uniform shrinkage or PML; shrinkage is greater with narrower priors and less informative data. Informative priors encode existing knowledge; their source should be documented and they should be wide enough. Priors can be expressed as informationally equivalent data and fitted by <b>data augmentation</b>, adding records that represent the prior.</p>
<div class="callout book"><b>Book example</b><p>Greenland predicted neonatal death in 2,992 births with 17 deaths, using 14 predictors and priors for small to large effects; the Bayesian model predicted better than ML. Priors must refer to multivariable effects, which are harder to elicit than univariate ones.</p></div>
<p>Small data sets cannot carry a model alone. Subject knowledge enters through prespecified predictors, literature-based adaptation or priors, and shrinkage handles the remaining overfitting. Bayesian methods are not yet mainstream in prediction modelling; the main criticism is the choice of prior.</p>
<p class="src">Source: Ch. 14, §14.3-14.4</p>`
    }
  ],
  keyPoints: [
    'Maximum likelihood coefficients are optimal for the development sample but give too extreme predictions for new patients.',
    'Accepting slight bias in coefficients reduces variance and the prediction error in new patients (bias-variance trade-off).',
    'Heuristic uniform shrinkage: s = (model χ² − df) / model χ², with df of all candidate predictors; re-estimate the intercept afterwards.',
    'Penalised ML shrinks during estimation; one penalty gives unequal shrinkage; λ is chosen by penalised AIC using effective df.',
    'The Lasso penalises the sum of absolute coefficients and sets some exactly to zero, combining shrinkage with selection.',
    'Shrinkage barely changes the c statistic but brings the calibration slope close to 1, especially with few events and many candidates.',
    'The adaptation method transfers the univariate-to-multivariable change in own data onto a precise literature coefficient.',
    'Bayesian priors centred on zero act like shrinkage; informative priors need careful, documented justification.'
  ],
  quiz: [
    {
      q: 'A preterm birth model with 20 candidate df has a model likelihood ratio χ² of 60. What is the heuristic uniform shrinkage factor?',
      options: ['0.33', '0.50', '0.67', '0.75'],
      answer: 2,
      why: 's = (60 − 20) / 60 = 40 / 60 = 0.67. The tempting 0.33 is 20 / 60, the share removed rather than the share kept. 0.75 comes from dividing 60 by 80, which has no basis. 0.50 would need a χ² of 40.'
    },
    {
      q: 'A preterm birth team keeps 6 of 18 candidate predictor df after backward selection. Which df should enter the heuristic shrinkage formula?',
      options: ['18, the candidate df', '6, because only the selected predictors are in the final model', 'None: selection already removed the weak predictors, so no shrinkage is needed', '12, the df that were removed'],
      answer: 0,
      why: 'Selection makes the retained coefficients too large (testimation bias), so the shrinkage must allow for every candidate that was considered. Using 6 is the common belief that fewer predictors means less overfitting; it ignores the search that produced them. Selection does not remove estimation error.'
    },
    {
      q: 'In the book\'s GUSTO-I experiments with small subsamples (about 23 deaths each), what did uniform shrinkage do in independent test data?',
      options: ['It raised the c statistic by about 0.05.', 'It moved the calibration slope from 0.66 to about 1, with c unchanged at 0.75.', 'It lowered both c and the calibration slope.', 'It pushed the calibration slope above 1.3, so predictions became too moderate.'],
      answer: 1,
      why: 'ML gave a slope of 0.66; uniform shrinkage gave 1.01, and c stayed at 0.75. Multiplying every coefficient by one factor cannot change the ranking of patients, so c cannot change. Expecting shrinkage to improve discrimination is the usual misconception.'
    },
    {
      q: 'The team fits its preterm model by penalised maximum likelihood with one λ. Why are some coefficients shrunk more than others?',
      options: ['Because λ is applied only to binary predictors.', 'Because each predictor gets its own λ, chosen by AIC.', 'Because the intercept absorbs most of the penalty.', 'Because coefficients that the data estimate precisely resist the penalty more than weak or imprecise ones.'],
      answer: 3,
      why: 'The penalty competes with the log-likelihood. Where the data hold much information about a coefficient, the likelihood dominates and the shrinkage is small. One λ is used for all scaled coefficients, and the intercept is not penalised, so the other options are wrong.'
    },
    {
      q: 'The literature univariate log odds ratio for chronic hypertension and preterm birth is 1.00. In the team\'s cohort the univariate log odds ratio is 1.30 and the multivariable one is 0.90. What is the adapted coefficient (method 1)?',
      options: ['0.60', '0.90', '1.00', '1.40'],
      answer: 0,
      why: 'Adapted = 1.00 + (0.90 − 1.30) = 0.60. 1.40 adds the difference with the wrong sign. 0.90 ignores the literature, and 1.00 ignores the adjustment for the other predictors; both defeat the purpose of the method.'
    },
    {
      q: 'The team fits a Lasso to its 15-df preterm model. Which statement is correct?',
      options: ['It multiplies all coefficients by the same factor after ML fitting.', 'It cannot be used for logistic regression.', 'It bounds the sum of the absolute standardised coefficients, so some, perhaps the noise terms, become exactly zero.', 'It always keeps the same predictors as backward selection at p &lt; 0.05.'],
      answer: 2,
      why: 'The absolute-value bound gives exact zeros, so the Lasso selects while it shrinks. Uniform shrinkage is the method that uses one factor. The Lasso works for logistic and Cox models, and its selection differs from, and is as data-driven as, stepwise selection.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Why does the 31% woman do better than promised?',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). In the 800 development women, the model gave a woman with a previous preterm birth and bacteriuria a risk of 31%. In the next year's women with the same two risk factors, only about 24% delivered early. Women with no risk factors were given 3.2%, but about 5% of such women delivered early. A junior colleague says: "ML estimates are unbiased, so the ML model must be the best one for new women."</p>`,
      questions: [
        '<b>(a)</b> Explain in two or three sentences why the high-risk women did better, and the low-risk women worse, than predicted.',
        '<b>(b)</b> Reply to the colleague, using the words bias and variance.',
        '<b>(c)</b> Neural networks are often trained with "early stopping". How is this the same idea?'
      ],
      answer: `<p><b>(a)</b> Each coefficient is the true effect plus noise. The women with the highest predicted risks are those whose risk factors happened to get estimates that were too large in this sample, and the women with the lowest risks those whose estimates happened to be too small. In new women the noise is different, so their observed risks are closer to the average. This is regression to the mean: the predictions were too extreme.</p>
<p><b>(b)</b> ML coefficients are nearly unbiased, but with 96 events and 15 df they vary a lot from sample to sample (high variance). The prediction error for new women depends on both bias and variance. Shrinking the coefficients adds a little bias but removes more variance, so the predictions for new women improve. Unbiased is not the same as best for prediction.</p>
<p><b>(c)</b> A neural network can fit its training data almost perfectly. Stopping the training early, at the point where predictions in held-out data are best, stops it from fitting noise. Like shrinkage, it gives up some fit to the development data in return for better predictions in new data.</p>`
    },
    {
      id: 't1',
      title: 'Recalibrate three women',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). When the team's 800-woman model is checked in the next year's women, the recalibration model is logit(observed risk) = −0.60 + 0.70 × lp, where lp is the model's linear predictor. Three women have lp = −0.80 (woman A), −3.40 (woman B) and −2.00 (woman C).</p>`,
      questions: [
        '<b>(a)</b> Calculate each woman\'s predicted risk from the original model.',
        '<b>(b)</b> Calculate each woman\'s recalibrated risk.',
        '<b>(c)</b> Describe the pattern. What is the calibration slope, and what does it say about the model?',
        '<b>(d)</b> Would the c statistic of the model change if it were recalibrated this way? Why?'
      ],
      answer: `<p><b>(a)</b> Risk = 1 / (1 + e<sup>−lp</sup>). A: 1 / (1 + e<sup>0.80</sup>) = 31.0%. B: 1 / (1 + e<sup>3.40</sup>) = 3.2%. C: 1 / (1 + e<sup>2.00</sup>) = 11.9%.</p>
<p><b>(b)</b> A: −0.60 + 0.70 × (−0.80) = −1.16, risk 1 / (1 + e<sup>1.16</sup>) = 23.9%. B: −0.60 + 0.70 × (−3.40) = −2.98, risk 4.8%. C: −0.60 + 0.70 × (−2.00) = −2.00, risk 11.9%, unchanged.</p>
<p><b>(c)</b> The high risk falls (31.0% to 23.9%), the low risk rises (3.2% to 4.8%), and a woman near the average is unchanged. The calibration slope is 0.70; below 1, it means the original predictions were too extreme, the sign of overfitting. A shrinkage factor of about 0.7 would have been needed.</p>
<p><b>(d)</b> No. Multiplying every lp by 0.70 and adding a constant keeps the order of the women, and c depends only on the order. Recalibration fixes calibration, not discrimination.</p>`
    },
    {
      id: 't2',
      title: 'Shrink the satellite clinic model by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The satellite clinic fits a preterm birth model in 400 women with 52 preterm births. The candidate predictors, all kept, are: age (linear), BMI (restricted cubic spline with 3 knots), previous preterm birth, bacteriuria, haemoglobin (linear) and parity group (3 levels). The model likelihood ratio χ² is 54.0. The ML coefficients include previous preterm birth 1.50 and bacteriuria 0.70, and the ML intercept is −2.60. After shrinkage, the intercept re-estimated with the shrunk linear predictor as offset is −2.48.</p>`,
      questions: [
        '<b>(a)</b> How many df enter the heuristic formula? Calculate s and the EPV.',
        '<b>(b)</b> Calculate the shrunk coefficients and odds ratios for previous preterm birth and bacteriuria.',
        '<b>(c)</b> For a woman whose only risk factors are these two (the other terms contribute zero, by centring), calculate the predicted risk before and after shrinkage. Do the same for a woman with neither.',
        '<b>(d)</b> A colleague says that since all six predictors were kept, no shrinkage is needed. Reply.'
      ],
      answer: `<p><b>(a)</b> df = 1 (age) + 2 (BMI spline) + 1 (previous preterm birth) + 1 (bacteriuria) + 1 (haemoglobin) + 2 (parity) = 8. s = (54.0 − 8) / 54.0 = 46 / 54 = 0.852. EPV = 52 / 8 = 6.5.</p>
<p><b>(b)</b> Previous preterm birth: 0.852 × 1.50 = 1.28; odds ratio from e<sup>1.50</sup> = 4.48 to e<sup>1.28</sup> = 3.59. Bacteriuria: 0.852 × 0.70 = 0.60; odds ratio from 2.01 to 1.82.</p>
<p><b>(c)</b> Both risk factors, before: lp = −2.60 + 1.50 + 0.70 = −0.40, risk 1 / (1 + e<sup>0.40</sup>) = 40.1%. After: lp = −2.48 + 0.852 × 2.20 = −2.48 + 1.874 = −0.606, risk 35.3%. Neither, before: 1 / (1 + e<sup>2.60</sup>) = 6.9%; after: 1 / (1 + e<sup>2.48</sup>) = 7.7%. Both predictions move towards the average.</p>
<p><b>(d)</b> Overfitting depends on how much information the data hold compared with the df spent, not on whether predictors were dropped. With 52 events and 8 df (EPV 6.5), the formula says about 15% of the apparent effects reflect noise. Keeping all predictors avoids selection bias but not estimation error, so shrinkage or penalisation is still needed.</p>`
    },
    {
      id: 't3',
      title: 'Critique a neighbouring hospital\'s shrinkage',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A neighbouring hospital developed a preterm birth model in 260 women with 32 preterm births. The team screened 22 candidate variables one at a time, kept 7 with p &lt; 0.10, and fitted standard ML logistic regression. It computed the heuristic shrinkage factor with df = 7 (model χ² 41), giving s = 0.83, and applied it without changing the intercept. It also replaced its own coefficient for bacteriuria with the pooled univariate odds ratio from a meta-analysis of cohorts in high-income countries, calling this "using external information".</p>`,
      questions: [
        '<b>(a)</b> Find the errors in the shrinkage step and give the corrected heuristic factor.',
        '<b>(b)</b> What is wrong with the use of external information, and how should the adaptation method be applied?',
        '<b>(c)</b> Name two concerns about the meta-analysis as a source.',
        '<b>(d)</b> Suggest a better estimation strategy for this sample size.'
      ],
      answer: `<p><b>(a)</b> <b>Critical:</b> (1) The df must be the 22 candidates screened, not the 7 kept, because selection inflates the retained coefficients. Corrected s = (41 − 22) / 41 = 19 / 41 = 0.46, a sign of severe overfitting. Their value (41 − 7) / 41 = 0.83 hides this. (2) The intercept was not re-estimated, so the mean predicted risk will no longer equal the observed incidence of 32 / 260 = 12.3%. (3) Univariate screening at p &lt; 0.10 with 32 events (EPV 32 / 22 = 1.5) is itself unstable.</p>
<p><b>(b)</b> A univariate literature effect was put into a multivariable model without adjustment, so bacteriuria carries its unadjusted effect and double-counts information it shares with correlated predictors. Method 1: adapted coefficient = literature univariate + (own multivariable − own univariate), with variance var(literature) + var(own multivariable) − var(own univariate).</p>
<p><b>(c)</b> Cohorts in high-income countries may not share a common population with this hospital, so the correlations between predictors may differ; definitions of bacteriuria (screening method, cut-off) may vary between studies; publication bias may inflate the pooled effect.</p>
<p><b>(d)</b> Prespecify a small set of predictors from subject knowledge instead of screening; fit by penalised ML with λ chosen by AIC, or apply uniform shrinkage with the candidate df; adapt well-studied coefficients with the literature; re-estimate the intercept; and validate the whole process by bootstrapping.</p>`
    },
    {
      id: 't4',
      title: 'Shrinkage lab: when does shrinkage matter?',
      level: 'Analyse',
      scenario: `<p>Use the Shrinkage lab in this case. It fits the 14-term model (15 df) to a complete-case subsample of the synthetic cohort and shows the coefficients from standard ML, uniform shrinkage and ridge (penalised ML). <b>Run 30 replications</b> draws 30 new samples of the chosen size and tests each fit in a large fresh sample from the same clinic. The sliders start at subsample 400 and ridge penalty λ = 10. The true effects in the data-generating model include previous preterm birth 1.50 and bacteriuria 0.90; antenatal visits, fetal sex, monsoon conception and height have no effect.</p>`,
      questions: [
        '<b>(a)</b> Set the subsample size to 250. Record the events, the EPV and the shrinkage factor s. Compare the ML coefficients for previous preterm birth, bacteriuria and fetal sex (female_fetus) with the truth.',
        '<b>(b)</b> Press <b>Run 30 replications</b> at 250 and again at 1500 (λ = 10). Record the mean calibration slope and mean c for the three methods.',
        '<b>(c)</b> At 250, run again with λ = 0, 20 and 40. What happens to the ridge slope? Which λ looks best?',
        '<b>(d)</b> Explain why c differs so little between the methods while the slopes differ so much.'
      ],
      answer: `<p><b>(a)</b> The fixed 250-woman sample has 30 events, EPV 30 / 15 = 2.0, model χ² 27.5 and s = (27.5 − 15) / 27.5 = 0.454. ML estimates: previous preterm birth 1.01 (truth 1.50), bacteriuria −0.38 (truth +0.90, wrong sign) and fetal sex 0.47 (truth 0). With 30 events the estimates are dominated by noise. Uniform shrinkage multiplies each by 0.454 (for example 0.47 becomes 0.21).</p>
<p><b>(b)</b> Results vary from run to run; typical values: at 250, ML slope about 0.35 to 0.45, uniform shrinkage usually about 0.65 to 0.95 but unstable (a replication whose χ² falls below 15 gets s = 0 and flat predictions, which can push the mean far above 1), ridge (λ 10) about 0.70 to 0.75; c about 0.64 to 0.65 for ML and uniform (nearly always identical) and about 0.65 to 0.66 for ridge. At 1500 (about 175 events, s about 0.88), ML slope about 0.82, uniform about 0.94, ridge about 0.88, and c about 0.70 for all three. Shrinkage matters most when EPV is low.</p>
<p><b>(c)</b> λ = 0 gives the ML results exactly. The ridge slope rises with λ: about 0.6 at 5, about 0.9 at 20, and above 1 (about 1.2 to 1.3) at 40, where the predictions have become too modest. A λ of about 20 to 25 gives a slope closest to 1 here. Too much penalty is also a mistake, which is why λ is tuned (by AIC, cross-validation or the bootstrap).</p>
<p><b>(d)</b> c depends only on the order of the women. Uniform shrinkage multiplies every coefficient by the same factor, so the order and c are exactly unchanged (except in a lab replication where s is set to 0 and every woman gets the same risk); ridge changes the order only slightly. The calibration slope measures the spread of the predictions, which shrinkage reduces directly. This mirrors the book's GUSTO-I results: ML slope 0.66 against 1.01 after uniform shrinkage, with c 0.75 for both.</p>`
    },
    {
      id: 't5',
      title: 'Which column is which method?',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). The team's statistician fits the 15-df model four ways and sends the coefficients of four terms, but the column labels for methods A, B and C have been lost. The heuristic shrinkage factor was 0.842.</p>
<table class="data"><tr><th>Term</th><th>ML</th><th>A</th><th>B</th><th>C</th></tr>
<tr><td>Previous preterm birth</td><td>1.62</td><td>1.48</td><td>1.364</td><td>1.52</td></tr>
<tr><td>Bacteriuria</td><td>0.98</td><td>0.74</td><td>0.825</td><td>0.80</td></tr>
<tr><td>Short interval</td><td>0.70</td><td>0.52</td><td>0.589</td><td>0.61</td></tr>
<tr><td>Fetal sex (female)</td><td>0.15</td><td>0.00</td><td>0.126</td><td>0.06</td></tr></table>`,
      questions: [
        '<b>(a)</b> Calculate the ratio of each coefficient to its ML value in columns A, B and C.',
        '<b>(b)</b> Match the columns to uniform shrinkage, penalised ML and the Lasso, and give the clue for each.',
        '<b>(c)</b> Which method changes the predicted order of the women not at all? Which is most likely to lower c?',
        '<b>(d)</b> Fetal sex has no true effect. Which method handles it best, and what is the risk of relying on that?'
      ],
      answer: `<p><b>(a)</b> A: 1.48 / 1.62 = 0.91, 0.74 / 0.98 = 0.76, 0.52 / 0.70 = 0.74, 0 / 0.15 = 0. B: 0.842 for every term (for example 1.364 / 1.62 = 0.842). C: 1.52 / 1.62 = 0.94, 0.80 / 0.98 = 0.82, 0.61 / 0.70 = 0.87, 0.06 / 0.15 = 0.40.</p>
<p><b>(b)</b> B is uniform shrinkage: the same ratio, equal to s = 0.842, for every term. A is the Lasso: one coefficient is exactly zero. C is penalised ML: unequal shrinkage with no zeros; the strong, precisely estimated effect (previous preterm birth) is shrunk least and the weak term most.</p>
<p><b>(c)</b> Uniform shrinkage (B) keeps the order exactly, so c is unchanged. The Lasso (A) changes the model most, since it drops a term, so it has the largest effect on order; in the book's simulations c still moved by at most 0.01.</p>
<p><b>(d)</b> The Lasso, which set it to zero, removing a spurious term. But this selection is data-driven: in another sample it might drop a true predictor or keep a noise term. Its choices should be checked by repeating the whole Lasso in bootstrap samples.</p>`
    },
    {
      id: 't6',
      title: 'Adapt the bacteriuria coefficient',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A meta-analysis of published cohorts gives a univariate log odds ratio for bacteriuria and preterm birth of 0.95 (SE 0.08). In the team's cohort the univariate coefficient is 1.20 (SE 0.30) and the multivariable coefficient is 0.98 (SE 0.33).</p>`,
      questions: [
        '<b>(a)</b> Calculate the adaptation factor and the adapted coefficient (method 1), with its odds ratio.',
        '<b>(b)</b> Calculate its approximate variance, SE and 95% confidence interval for the odds ratio. Compare the SE with the own-data SE.',
        '<b>(c)</b> Using method 2 with c = 0.5, what is the coefficient?',
        '<b>(d)</b> State the main assumption of the method, and one reason it might fail here.'
      ],
      answer: `<p><b>(a)</b> Adaptation factor = 0.98 − 1.20 = −0.22: adjusting for the other predictors lowers the coefficient by 0.22 in the team's data. Adapted = 0.95 − 0.22 = 0.73, odds ratio e<sup>0.73</sup> = 2.08, against e<sup>0.98</sup> = 2.66 from the team's data alone.</p>
<p><b>(b)</b> Variance = 0.08² + 0.33² − 0.30² = 0.0064 + 0.1089 − 0.0900 = 0.0253; SE = √0.0253 = 0.159, about half of 0.33. 95% CI for the log odds ratio: 0.73 ± 1.96 × 0.159 = 0.42 to 1.04; odds ratio 1.52 to 2.83.</p>
<p><b>(c)</b> 0.98 + 0.5 × (0.95 − 1.20) = 0.98 − 0.125 = 0.855 (odds ratio 2.35).</p>
<p><b>(d)</b> The literature and the team's data must come from a common population, with similar correlations between bacteriuria and the other predictors. It may fail if the published cohorts defined bacteriuria differently (screening method, cut-off), treated it differently, or if publication bias inflated the pooled effect.</p>`
    },
    {
      id: 't7',
      title: 'Choose a strategy for the satellite clinic',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). The satellite clinic has 30 preterm births and 11 candidate predictor df, chosen in advance. A trial fit gives a model χ² of 25. The meta-analysis from this case covers previous preterm birth and bacteriuria. A senior obstetrician offers to state her beliefs about each effect.</p>`,
      questions: [
        '<b>(a)</b> Calculate the EPV and the heuristic shrinkage factor. What do they say?',
        '<b>(b)</b> Compare three options: penalised ML or uniform shrinkage alone; adaptation of the two well-studied coefficients plus shrinkage; Bayesian estimation with priors. What does each rely on?',
        '<b>(c)</b> If priors are used, what must be documented, and how can they be fitted with standard software?',
        '<b>(d)</b> Which option would you choose, and how would you check it?'
      ],
      answer: `<p><b>(a)</b> EPV = 30 / 11 = 2.7, far below 10. s = (25 − 11) / 25 = 0.56: almost half of the apparent effects are noise. The data alone cannot support this model well.</p>
<p><b>(b)</b> Shrinkage or PML relies only on the clinic's data; it makes predictions less extreme but the coefficients remain imprecise. Adaptation adds precise literature evidence for two predictors, assuming a common population with similar predictor correlations, and shrinkage then handles the rest. Bayesian estimation relies on priors; centred on zero they act like shrinkage, and informative priors add subject knowledge, but they must refer to multivariable effects, which are hard to elicit.</p>
<p><b>(c)</b> The source of each prior (expert judgement, literature), its centre and width, and why it is wide enough. Priors can be written as informationally equivalent data and fitted by data augmentation: adding records to the data set that represent the prior effects.</p>
<p><b>(d)</b> A reasonable choice: adapt the two well-studied coefficients from the meta-analysis, then apply penalised ML (or uniform shrinkage with 11 df) and re-estimate the intercept. Check it by bootstrapping the whole procedure, and plan external validation before use, since 30 events also give an imprecise validation.</p>`
    }
  ]
});
