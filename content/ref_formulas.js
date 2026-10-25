registerRef({
  id: 'formulas',
  title: 'Formula sheet',
  html: `
<p>Each entry gives the formula, what it means in one line, and when to use it. Worked numbers are illustrative (synthetic) unless stated.</p>

<h3>1. Odds and logit</h3>
<div class="formula">odds = p / (1 − p)      p = odds / (1 + odds)      logit(p) = ln[p / (1 − p)]</div>
<p>Meaning: three ways of writing the same risk. Use: converting between risk, odds and the scale on which logistic models are linear. Example: p = 0.12 gives odds 0.136 (about 1 to 7.3) and logit −1.99.</p>

<h3>2. Logistic model</h3>
<div class="formula">lp = α + β<sub>1</sub>x<sub>1</sub> + β<sub>2</sub>x<sub>2</sub> + … + β<sub>k</sub>x<sub>k</sub>      p = 1 / (1 + e<sup>−lp</sup>)      OR per unit = e<sup>β</sup></div>
<p>Meaning: the linear predictor lp is a log-odds; the logistic transform returns a risk between 0 and 1. Use: any binary-outcome prediction model. Example: lp = −2 gives p = 0.119; lp = 0 gives 0.50.</p>

<h3>3. Events per variable</h3>
<div class="formula">EPV = number of events (or non-events, if fewer) / number of candidate predictor parameters (df)</div>
<p>Meaning: a rough measure of how much data supports each parameter. Use: before fitting, to judge overfitting risk. Count the degrees of freedom of every candidate, including all spline terms and dummy variables, not only the predictors retained. Example: 100 events and 15 candidate df give EPV 6.7.</p>

<h3>4. Likelihood ratio chi-square and R²</h3>
<div class="formula">model χ² = −2 (LL<sub>null</sub> − LL<sub>model</sub>)      R²<sub>N</sub> = [1 − exp(−χ² / n)] / [1 − exp(2 LL<sub>null</sub> / n)]</div>
<p>Meaning: χ² measures how much better the model fits than an intercept-only model; Nagelkerke R² rescales it to 0 to 100%. Use: overall model strength, and to compare nested models (the difference in χ² is referred to χ² with the difference in df).</p>

<h3>5. Heuristic uniform shrinkage factor</h3>
<div class="formula">s = (model χ² − df) / model χ²      shrunken coefficient = s × β      then re-estimate the intercept</div>
<p>Meaning: the proportion of the fitted effect expected to be real, judged from how far the model χ² exceeds its degrees of freedom. Use: a quick estimate of the calibration slope expected in new patients for a prespecified model. Use df of all candidate parameters, not only those retained. Example (Book example): model χ² 62.6 with 8 df gives s = (62.6 − 8) / 62.6 = 0.87.</p>

<h3>6. Brier score and scaled Brier score</h3>
<div class="formula">Brier = (1/N) Σ (y<sub>i</sub> − p<sub>i</sub>)²      Brier<sub>max</sub> = p̄ (1 − p̄)² + (1 − p̄) p̄² = p̄ (1 − p̄)      scaled Brier = 1 − Brier / Brier<sub>max</sub></div>
<p>Meaning: mean squared prediction error; the scaled form compares it with a model that gives everyone the mean incidence p̄. Use: overall performance, and for comparing settings with different incidence. Example: incidence 10% gives Brier<sub>max</sub> = 0.090; a Brier of 0.070 gives scaled Brier 1 − 0.070 / 0.090 = 22.2%.</p>

<h3>7. c statistic</h3>
<div class="formula">c = P(p̂<sub>i</sub> &gt; p̂<sub>j</sub> | y<sub>i</sub> = 1, y<sub>j</sub> = 0), with ties counted as one half</div>
<p>Meaning: the chance that, of two patients one with and one without the outcome, the one with the outcome has the higher predicted risk. Use: discrimination. It is the area under the ROC curve, does not depend on incidence, and is unaffected by calibration errors that preserve rank order.</p>

<h3>8. Sensitivity, specificity, predictive values, likelihood ratios</h3>
<div class="formula">sens = TP / (TP + FN)      spec = TN / (TN + FP)      LR+ = sens / (1 − spec)      LR− = (1 − sens) / spec      posterior odds = prior odds × LR</div>
<p>Meaning: test characteristics at one cutoff, and how a result updates risk. Use: Bayes' theorem in odds form; the OR of a binary test equals LR+ / LR−. Example (Book example): sensitivity 80%, specificity 90%, prevalence 10% give LR+ 8, LR− 0.22, posterior risk about 47% after a positive and 2.4% after a negative result.</p>

<h3>9. Calibration-in-the-large and calibration slope</h3>
<div class="formula">calibration slope: logit(P(y = 1)) = a + b × lp      calibration-in-the-large: logit(P(y = 1)) = a + 1 × lp (lp as offset)</div>
<p>Meaning: b below 1 means predictions are too extreme; the offset intercept a measures systematic over- or under-prediction. Use: all validation, internal and external. Ideal values: b = 1, a = 0.</p>

<h3>10. Net benefit and threshold odds</h3>
<div class="formula">w = p<sub>t</sub> / (1 − p<sub>t</sub>) = harm / benefit      NB = (TP − w × FP) / N      NB<sub>treat all</sub> = incidence − (1 − incidence) × w      NB<sub>treat none</sub> = 0</div>
<p>Meaning: true positives minus false positives weighted by how much worse a false positive is relative to a true positive gain, per patient. Use: judging clinical usefulness at a chosen threshold. Example: threshold 20% gives w = 0.25; with N = 500, TP = 45 and FP = 80, NB = (45 − 0.25 × 80) / 500 = 0.05. If incidence is 12%, treat-all NB = 0.12 − 0.88 × 0.25 = −0.10.</p>

<h3>11. Optimism-corrected performance</h3>
<div class="formula">optimism = mean over B bootstrap samples of [performance(model*, bootstrap sample) − performance(model*, original sample)]      corrected = apparent − optimism</div>
<p>Meaning: each bootstrap model repeats every modelling step, including selection and shrinkage; the gap between its apparent and test performance estimates the optimism. Use: internal validation of a modelling strategy, for c, calibration slope, R² or Brier. Example: apparent c 0.80 and mean optimism 0.04 give corrected c 0.76. The bootstrap estimate of uniform shrinkage is the slope of the original linear predictor when coefficients come from bootstrap samples.</p>

<h3>12. Rubin's rules for multiple imputation</h3>
<div class="formula">Q̄ = (1/m) Σ Q<sub>j</sub>      W = (1/m) Σ var<sub>j</sub>      B = Σ (Q<sub>j</sub> − Q̄)² / (m − 1)      T = W + (1 + 1/m) B</div>
<p>Meaning: pool the m estimates by averaging; total variance T adds the between-imputation variance B to the average within-imputation variance W. Use: any coefficient estimated in m imputed datasets. Example: m = 5, coefficients 0.50, 0.54, 0.46, 0.52, 0.48 with within-imputation variance 0.010 each: Q̄ = 0.50, B = 0.0010, T = 0.010 + 1.2 × 0.0010 = 0.0112, pooled SE = 0.106.</p>

<h3>13. Other quantities used in the course</h3>
<ul>
<li>Bootstrap inclusion: a subject appears at least once in a bootstrap sample with probability 1 − (1 − 1/n)<sup>n</sup>, about 63.2% for large n.</li>
<li>Complete cases if each of k predictors is missing independently in a proportion m: (1 − m)<sup>k</sup>. Best case if no patient misses more than one: 1 − k × m.</li>
<li>Two-way interactions among k predictors: k (k − 1) / 2. With 10 predictors that is 45, of which about 2.25 are expected to reach p &lt; 0.05 by chance.</li>
<li>Information criterion: AIC-type comparison uses χ² − 2 × df; adding a term is favoured when its χ² exceeds 2 per df, which corresponds to p &lt; 0.157 for 1 df.</li>
<li>Case-control sampling changes the intercept but not the slope or c. A sampling ratio of 2 to 1 shifts the intercept by ln 2 = 0.69 in absolute value (direction depends on which group is over-sampled).</li>
</ul>
`
});
