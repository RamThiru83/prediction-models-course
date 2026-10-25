registerModule({
  id: 'm11',
  num: 11,
  part: 'Validation',
  title: 'Performance: overall, discrimination and calibration',
  book: 'Ch. 15',
  minutes: 85,
  summary: 'How to quantify how good predicted risks are: overall measures (R², Brier and scaled Brier), discrimination (c statistic, ROC curve, discrimination slope, Lorenz curve) and calibration (calibration plot, calibration-in-the-large, calibration slope and tests).',
  objectives: [
    'Calculate the Brier score, its maximum and the scaled Brier score, and explain why the unscaled Brier score depends on incidence',
    'Calculate a c statistic from pairs of patients and interpret it as a probability',
    'Construct and interpret an ROC curve, a discrimination slope and a Lorenz curve',
    'Estimate and interpret calibration-in-the-large and the calibration slope from the recalibration model',
    'Evaluate the limitations of the Hosmer-Lemeshow test and of significance testing for calibration',
    'Explain how calibration and discrimination relate, and why both must be reported at validation'
  ],
  sections: [
    {
      id: 's1',
      title: 'What "performance" means for a prediction model',
      html: `
<p>A prediction model produces an <b>absolute risk</b> for each patient, for example "a 23% probability of preterm birth". Regression coefficients and odds ratios describe relative effects; performance measures ask how good the absolute risks are. Performance can be estimated at three levels:</p>
<ul>
<li><b>Apparent</b>: in the same data used to develop the model (optimistic).</li>
<li><b>Internally validated</b>: corrected for optimism, for example by bootstrapping in the development data.</li>
<li><b>Externally validated</b>: in new patients from another place or time.</li>
</ul>
<p>Three families of measures are used, each answering a different question.</p>
<table class="data">
<thead><tr><th>Aspect</th><th>Question</th><th>Main measures</th></tr></thead>
<tbody>
<tr><td>Overall performance</td><td>How close are predictions to the actual outcomes?</td><td>Nagelkerke R², Brier score, scaled Brier score</td></tr>
<tr><td>Discrimination</td><td>Do patients with the outcome receive higher predictions than those without?</td><td>c statistic (area under ROC curve), discrimination slope, Lorenz curve</td></tr>
<tr><td>Calibration</td><td>Do predicted risks agree with observed frequencies?</td><td>Calibration plot, calibration-in-the-large, calibration slope</td></tr>
</tbody></table>
<p>Clinical usefulness, which asks whether decisions based on the model are better than default policies, is the subject of the next module.</p>
<div class="callout book"><b>Book example: testicular cancer</b><p>Throughout the chapter the book uses a model predicting benign tissue (necrosis) in the residual mass of men treated with chemotherapy for metastatic testicular cancer. Five predictors (teratoma elements in the primary tumour, pre-chemotherapy AFP and HCG, post-chemotherapy mass size, reduction in size). Development: 544 patients, 245 with necrosis (45%). External validation: 273 patients from another centre, 76 with necrosis (28%). Internal validation: 200 bootstrap replications.</p></div>
<p class="src">Source: Ch. 15, introduction and §15.1</p>
`
    },
    {
      id: 's2',
      title: 'Overall performance: R², Brier and scaled Brier',
      html: `
<p>Overall measures quantify the distance between the predicted risk p and the actual outcome y (0 or 1) for each patient, averaged over patients. Two scoring rules are used.</p>
<h3>Nagelkerke R² (logarithmic score)</h3>
<p>The log-likelihood scores each patient by log(p) if y = 1 and log(1 − p) if y = 0. The model likelihood ratio statistic LR = −2(LL<sub>0</sub> − LL<sub>1</sub>) compares the model with an intercept-only model. Nagelkerke's R² rescales this to run from 0% to 100%:</p>
<div class="formula">R² = [1 − exp(−LR/n)] / [1 − exp(−(−2LL<sub>0</sub>)/n)]</div>
<p>The logarithmic score penalises confident wrong predictions very severely: a prediction of 1% for a woman who then delivers preterm costs log(0.01) = −4.6. At external validation, the book computes R² after recalibrating the predictions (intercept plus calibration slope), so R² then reflects the information in the model rather than its miscalibration.</p>
<h3>Brier score (quadratic score)</h3>
<div class="formula">Brier = (1/n) Σ (y<sub>i</sub> − p<sub>i</sub>)²</div>
<p>For one patient the score ranges from 0 (prediction equals outcome) to 1 (completely discordant); a prediction of 50% scores 0.25 whatever the outcome. It is less severe than the log score for predictions near 0% or 100%. A model's Brier score runs from 0 (perfect) to 0.25 for a non-informative model at 50% incidence. When the incidence is lower, the worst sensible score is lower:</p>
<div class="formula">Brier<sub>max</sub> = p̄ × (1 − p̄)² + (1 − p̄) × p̄²   (which simplifies to p̄(1 − p̄))</div>
<p>where p̄ is the average probability of the outcome (the incidence). At 10% incidence, Brier<sub>max</sub> = 0.1 × 0.9² + 0.9 × 0.1² = 0.090. Because of this dependence, the <b>scaled Brier score</b> is preferred for comparisons across settings:</p>
<div class="formula">Brier<sub>scaled</sub> = 1 − Brier / Brier<sub>max</sub>   (0% to 100%)</div>
<div class="callout eg"><b>Worked example (synthetic, 10 women)</b><p>Predicted preterm-birth risks 5, 8, 10, 12, 15, 20, 25, 30, 45, 60%; preterm births occurred in the women predicted 12%, 30% and 60% (incidence 3/10 = 30%).<br>Squared errors: 0.0025, 0.0064, 0.0100, 0.7744, 0.0225, 0.0400, 0.0625, 0.4900, 0.2025, 0.1600; sum 1.7708.<br>Brier = 1.7708/10 = 0.177.<br>Brier<sub>max</sub> = 0.3 × 0.7² + 0.7 × 0.3² = 0.147 + 0.063 = 0.210 (the Brier score of predicting 30% for everyone).<br>Scaled Brier = 1 − 0.177/0.210 = 0.157, i.e. 15.7%.</p></div>
<div class="callout book"><b>Book example (Table 15.1)</b><p>R² 38.9% (development), 37.6% (internal), 26.7% (external). Brier 0.174, 0.178, 0.161; Brier<sub>max</sub> 0.248, 0.248, 0.201; scaled Brier 29.8%, 28.2%, 20.0%. The unscaled Brier score looked <i>better</i> externally only because necrosis was less common there; the scaled score correctly shows poorer performance.</p></div>
<div class="callout warn"><b>Pitfall</b><p>Comparing raw Brier scores between populations with different incidence can reverse the conclusion. Report the scaled Brier score, or the incidence alongside the Brier score.</p></div>
<p>The Brier score can be decomposed formally into a calibration and a discrimination component; examining these separately is usually more informative, which is why the rest of this module treats them in turn. Prognostic models for long-term outcomes typically have modest R² (around 0.20 according to the book); substantial uncertainty remains for individuals.</p>
<p class="src">Source: Ch. 15, §15.1; Table 15.1; Fig. 15.1; §15.4; Ch. 4 (Nagelkerke R²)</p>
`
    },
    {
      id: 's3',
      title: 'Discrimination: sensitivity, specificity, ROC and the c statistic',
      html: `
<h3>Classification at a cutoff</h3>
<p>If we call a patient "positive" when the predicted risk is at or above a cutoff, we get a 2×2 table of true positives (TP), false positives (FP), false negatives (FN) and true negatives (TN).</p>
<div class="formula">Sensitivity = TP / N<sub>event</sub>     Specificity = TN / N<sub>no event</sub></div>
<p>A higher cutoff increases specificity and lowers sensitivity. In the book's testicular example, at a 50% cutoff for necrosis sensitivity was 68% and specificity 77%; at 70% they were 42% and 92%. A 50% cutoff is rarely defensible clinically (next module), so a summary over all cutoffs is useful.</p>
<h3>ROC curve</h3>
<p>The receiver operating characteristic (ROC) curve plots sensitivity (true positive rate) against 1 − specificity (false positive rate) as the cutoff moves from 0% (everyone positive: point 100%, 100%) to 100% (everyone negative: point 0%, 0%). A non-informative model follows the diagonal. The more separated the distributions of predictions for patients with and without the outcome, the closer the curve runs to the upper left corner.</p>
<h3>The c statistic</h3>
<p>The area under the ROC curve equals the <b>concordance (c) statistic</b>: the probability that, in a randomly chosen pair of one patient with and one without the outcome, the patient with the outcome has the higher prediction. Ties count one half. A coin flip gives 0.5 and perfect separation gives 1.</p>
<div class="formula">c = (concordant pairs + ½ × tied pairs) / (N<sub>event</sub> × N<sub>no event</sub>)</div>
<div class="callout eg"><b>Worked example (same 10 women)</b><p>Events have predictions 12%, 30%, 60%; non-events 5, 8, 10, 15, 20, 25, 45%. There are 3 × 7 = 21 pairs.<br>12% is higher than 5, 8, 10: 3 concordant pairs.<br>30% is higher than 5, 8, 10, 15, 20, 25: 6 pairs.<br>60% is higher than all 7: 7 pairs.<br>c = (3 + 6 + 7)/21 = 16/21 = 0.762.</p></div>
<p>Properties that follow from the definition:</p>
<ul>
<li>It conditions on pairs with different outcomes, so it is <b>insensitive to the incidence</b> of the outcome, unlike R² or Brier.</li>
<li>It is a rank statistic, so it is <b>insensitive to calibration errors</b>: adding a constant to every patient's log-odds leaves c unchanged.</li>
<li>It is linearly related to Somers' D (c = D/2 + 0.5) and to the Mann-Whitney U statistic.</li>
<li>The "pair" interpretation is somewhat artificial clinically, where patients are seen one at a time.</li>
</ul>
<p>Confidence intervals are best obtained by bootstrapping; standard formulas for comparing c between models are valid only for prespecified models.</p>
<div class="callout book"><b>Book example</b><p>Testicular model: c = 0.818 [0.783-0.852] at development, 0.812 after bootstrap correction, 0.785 [0.726-0.844] at external validation. In simulations at 50% incidence, c of 0.98, 0.83, 0.71, 0.64, 0.60 and 0.50 went with R² of 87%, 43%, 17%, 8%, 4% and 0%; at lower incidence R² was lower for the same c.</p></div>
<p>For survival outcomes, Harrell's c uses all pairs that can be ordered: both have an event, or one has an event before the other's censoring time.</p>
<p class="src">Source: Ch. 15, §15.2.1-15.2.4, §15.2.7-15.2.8; Table 15.4; Figs 15.2-15.4</p>
`
    },
    {
      id: 's4',
      title: 'Discrimination slope, box plots and Lorenz curves',
      html: `
<h3>Discrimination slope</h3>
<div class="formula">Discrimination slope = mean p (patients with outcome) − mean p (patients without)</div>
<p>It is shown naturally as box plots of predictions by outcome. In the 10-woman example: mean prediction among the 3 events = (0.12 + 0.30 + 0.60)/3 = 0.340; among the 7 non-events = 1.28/7 = 0.183; slope = 0.157. It is easy to explain, but it depends on incidence: for the same c, the slope is lower when the outcome is rare.</p>
<div class="callout book"><b>Book example</b><p>Testicular model discrimination slope: 0.301 (development), 0.294 (internal), 0.237 (external). Part of the external drop reflects the lower prevalence of necrosis (28% versus 45%).</p></div>
<h3>Lorenz (concentration) curve</h3>
<p>Rank patients by predicted risk. On the x-axis plot the cumulative proportion of patients classified as negative (lowest risks first); on the y-axis the proportion of all outcomes that fall among them, the "missed" outcomes. A non-informative model gives a straight diagonal line; a good model stays low for a long way (many patients classified negative while few outcomes are missed) and rises steeply at the end. The Gini index summarises it: G = 2A, where A is the area between the curve and the diagonal. Specific points are often more useful, such as the share of outcomes missed when the lowest 25% are classified negative.</p>
<div class="callout book"><b>Book example</b><p>Classifying the 25% with highest predicted necrosis as "no resection" missed 9% of tumours at development and 13% at validation; classifying 75% as no resection missed 58% and 65%. The policy "resect if mass &gt; 10 mm", which uses only one predictor, performed worse.</p></div>
<div class="callout warn"><b>Pitfall</b><p>The appearance of a Lorenz curve depends strongly on incidence. With a rare outcome (for example 1%, as in screening) the curve looks impressive; with a common outcome it looks poor for the same c.</p></div>
<table class="data">
<thead><tr><th>Measure</th><th>Visualisation</th><th>Strength</th><th>Weakness</th></tr></thead>
<tbody>
<tr><td>c statistic</td><td>ROC curve</td><td>Independent of incidence; pair interpretation</td><td>Interpretation artificial</td></tr>
<tr><td>Discrimination slope</td><td>Box plot</td><td>Intuitive</td><td>Depends on incidence</td></tr>
<tr><td>Lorenz curve</td><td>Concentration curve</td><td>Shows outcomes missed versus patients spared</td><td>Depends on incidence</td></tr>
</tbody></table>
<h3>Explore it</h3>
<div data-widget="rocExplorer"></div>
<ul class="try">
<li>Fix incidence at 12% and move c from 0.60 to 0.90. Watch the two risk distributions separate and the ROC curve move towards the upper left; note how Nagelkerke R², scaled Brier and the discrimination slope rise with c.</li>
<li>Keep c at 0.80 and change incidence from 5% to 50%. Observe that c stays fixed while R², Brier and the discrimination slope change.</li>
<li>With c = 0.80 and incidence 12%, move the cutoff from 5% to 40%. Follow the trade-off of sensitivity against specificity and the change in PPV and NPV.</li>
</ul>
<p class="src">Source: Ch. 15, §15.2.5-15.2.6, §15.2.8; Tables 15.3-15.4; Figs 15.5-15.8</p>
`
    },
    {
      id: 's5',
      title: 'Calibration: plot, calibration-in-the-large and slope',
      html: `
<p><b>Calibration</b> is agreement between predicted risks and observed outcome frequencies: among 100 women each predicted 20%, about 20 should deliver preterm.</p>
<h3>Calibration plot</h3>
<p>Predicted risk on the x-axis, observed outcome on the y-axis, and the 45° identity line as reference. Because binary outcomes are only 0 or 1, the observed frequency is estimated either by grouping (for example deciles of predicted risk, plotting mean predicted against observed proportion per group) or by a smoother such as loess. Small groups make the plot noisy. Adding the distribution of predictions (a histogram, separately for patients with and without the outcome) turns the calibration plot into a "validation plot" that also shows discrimination.</p>
<h3>Calibration-in-the-large</h3>
<p>Compares the mean predicted risk with the observed incidence. In the development data this agreement is guaranteed by the intercept, and it remains at bootstrap validation; it becomes informative only in new data. As an odds ratio:</p>
<div class="formula">OR = odds(mean predicted) / odds(mean observed)</div>
<p>For formal estimation, the model's linear predictor (lp, the log-odds) is entered as an <b>offset</b>, i.e. with its coefficient fixed at 1:</p>
<div class="formula">logit(P(y = 1)) = a + offset(lp)</div>
<p>The intercept a (reported as "a | b = 1") is the average difference in log-odds between observed and predicted. a > 0 means the model underestimates risk; a &lt; 0 means overestimation.</p>
<h3>Calibration slope</h3>
<p>Fit the <b>recalibration model</b>, with the linear predictor as the only covariate and its coefficient free:</p>
<div class="formula">logit(P(y = 1)) = a + b<sub>overall</sub> × lp</div>
<p>b<sub>overall</sub> is the calibration slope. Interpretation depends on where it is estimated:</p>
<ul>
<li><b>Apparent</b>: b = 1 by construction (ML fits best in its own data).</li>
<li><b>Internal validation</b>: b &lt; 1 reflects overfitting and equals the shrinkage the model needs (Module 10).</li>
<li><b>External validation</b>: b reflects both overfitting and true differences in predictor effects between settings. b &lt; 1: predictions too extreme (high risks too high, low risks too low). b &gt; 1: predictions too moderate.</li>
</ul>
<div class="callout eg"><b>Worked example (synthetic)</b><p>A preterm-birth model predicts a mean risk of 12% in a referral hospital where the observed incidence is 17%.<br>OR = (0.12/0.88) / (0.17/0.83) = 0.1364/0.2048 = 0.666: the model underestimates the odds by about one third on average.<br>Equivalent log-odds difference: logit(0.17) − logit(0.12) = −1.586 − (−1.992) = 0.41 (approximately a | b = 1, if predictions were similar for all women).<br>In the 10-woman example: mean predicted 23% versus observed 30%; OR = (0.23/0.77)/(0.30/0.70) = 0.70.</p></div>
<div class="callout book"><b>Book example (Table 15.8)</b><p>Testicular model: calibration-in-the-large 0 (development), 0 (internal), −0.03 (external); calibration slope 1, 0.97 (internal, equal to the shrinkage factor) and 0.74 (external). The overall test for miscalibration at external validation gave p = 0.13.</p></div>
<h3>Explore it</h3>
<div data-widget="calibrationLab"></div>
<ul class="try">
<li>Set the true calibration slope to 0.6 and intercept shift to 0. Observe the plotted curve crossing the identity line: high predictions are too high and low predictions too low, while calibration-in-the-large stays near 0.</li>
<li>Return the slope to 1 and set the intercept shift to +1.0. The whole curve lies above the identity line (systematic underestimation); note that c is unchanged.</li>
<li>With slope 0.8, compare n = 200 with n = 5000. Note how much wider the scatter of the decile points is at the small sample size.</li>
</ul>
<p class="src">Source: Ch. 15, §15.3.1-15.3.5; Table 15.8; Figs 15.9-15.10</p>
`
    },
    {
      id: 's6',
      title: 'Testing calibration and goodness-of-fit',
      html: `
<p>Each component of the recalibration model can be tested with a Wald or likelihood ratio test.</p>
<table class="data">
<thead><tr><th>Test</th><th>Null hypothesis</th><th>df</th></tr></thead>
<tbody>
<tr><td>Calibration-in-the-large</td><td>a = 0 given b<sub>overall</sub> = 1 (offset model)</td><td>1</td></tr>
<tr><td>Calibration slope</td><td>b<sub>overall</sub> = 1</td><td>1</td></tr>
<tr><td>Recalibration (overall miscalibration)</td><td>a = 0 and b<sub>overall</sub> = 1</td><td>2</td></tr>
</tbody></table>
<p>The slope test can be done by adding the linear predictor as both an offset and a covariate: logit(P(y = 1)) = a + b<sub>miscalibration</sub> × lp + offset(lp); b<sub>miscalibration</sub> estimates b<sub>overall</sub> − 1. The 2-df recalibration test is efficient against the two commonest problems, systematic differences in average risk and overfitted predictor effects, and its parameters are interpretable. For survival (Cox) models only the slope can be assessed this way, since the baseline hazard is re-estimated freely.</p>
<h3>Hosmer-Lemeshow test</h3>
<p>Patients are grouped by deciles of predicted risk; the expected number of events per group (sum of predictions) is compared with the observed number by a χ² statistic with 8 df at development and 9 df at external validation. Drawbacks:</p>
<ul>
<li>Arbitrary choices of grouping (deciles or other quantiles; risk intervals).</li>
<li>Poor power against the common patterns of miscalibration (systematic shift, overfitting).</li>
<li>A non-significant result in the development data is expected, because the model was fitted to those data: it may add face validity for some readers but has no scientific meaning.</li>
</ul>
<div class="callout book"><b>Book example (Table 15.7)</b><p>Testicular model Hosmer-Lemeshow: χ² = 5.9, df 8, p = 0.66 at development; χ² = 9.2, df 9, p = 0.42 at validation, even though the external calibration slope was 0.74.</p></div>
<p>Alternatives include the Goeman-le Cessie test (based on smoothed residuals, sensitive to missed nonlinearity or interaction), Harrell's E (average absolute difference between the smoothed calibration curve and the identity line) and observed-versus-expected comparisons in subgroups.</p>
<div class="callout warn"><b>Critical:</b><p>A p-value is not a measure of calibration. In a small validation sample the null hypothesis of good calibration will rarely be rejected even when miscalibration is serious; in a very large sample trivial miscalibration becomes "significant". Always report the size of calibration-in-the-large and the calibration slope, with the calibration plot.</p></div>
<p class="src">Source: Ch. 15, §15.3.7-15.3.10; Tables 15.5-15.8</p>
`
    },
    {
      id: 's7',
      title: 'How calibration, discrimination and overall performance relate',
      html: `
<ul>
<li><b>Calibration-in-the-large is independent of discrimination.</b> Changing the incidence, as in a case-control sample, shifts all risks without altering their ranking, so c is unchanged.</li>
<li><b>The calibration slope is linked to discrimination.</b> An overfitted model (slope &lt; 1 at validation) shows both poorer calibration and poorer discrimination in new patients.</li>
<li><b>Perfect calibration is possible with poor discrimination.</b> If all predictions lie between 9% and 11% at a 10% incidence, the model can be well calibrated but cannot separate patients. At external validation, such a narrow range can arise from a homogeneous case-mix.</li>
<li><b>A drop in c at external validation</b> may therefore reflect overfitting (then calibration is also poor) or a more homogeneous case-mix (calibration may be fine).</li>
<li><b>A well-discriminating model can be badly calibrated</b>; this can be corrected by updating the model for the new setting.</li>
<li><b>Overall measures (R², Brier)</b> combine calibration and discrimination; they are useful for comparing models on the same data but hide which aspect is deficient.</li>
</ul>
<div class="callout book"><b>Book example (summary, Table 16.5)</b><p>Testicular model, development (internally validated where available) versus validation: R² 38% versus 27%; scaled Brier 28% versus 20%; c 0.81 versus 0.79; discrimination slope 0.29 versus 0.24; calibration slope 0.97 versus 0.74.</p></div>
<div class="callout key"><b>Key idea</b><p>At external validation, report calibration-in-the-large, the calibration slope and the recalibration test as routine, together with c and a validation plot. The book argues that calibration deserves more attention than it usually receives, and that c should not be the sole criterion: it changes little when a new predictor such as a biomarker is added.</p></div>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>The district-hospital preterm-birth model is applied at the tertiary referral hospital, where incidence is <span data-live="ptb_val_incidence"></span>. The synthetic validation gives c = <span data-live="ptb_val_c"></span>, calibration-in-the-large <span data-live="ptb_val_citl"></span> and calibration slope <span data-live="ptb_val_slope"></span>. By design, predictor effects are 20% weaker and the case-mix older and higher risk there, so the model is expected to underestimate average risk and to give a slope below 1.</p></div>
<p class="src">Source: Ch. 15, §15.3.11, §15.4; Ch. 16, Table 16.5</p>
`
    }
  ],
  keyPoints: [
    'Overall performance (R², Brier), discrimination (c) and calibration (intercept, slope) answer different questions; report all three.',
    'Brier = mean (y − p)²; its maximum p̄(1 − p̄) depends on incidence, so use scaled Brier = 1 − Brier/Brier_max.',
    'The c statistic is the probability that a patient with the outcome has a higher prediction than one without; it ignores incidence and calibration.',
    'Discrimination slope and Lorenz curves are intuitive but depend on incidence.',
    'Calibration-in-the-large: a in logit(y) = a + offset(lp); calibration slope: b in logit(y) = a + b × lp.',
    'At internal validation the slope equals the required shrinkage; at external validation it also reflects real differences between settings.',
    'Hosmer-Lemeshow tests have low power and no scientific meaning at apparent validation; report effect sizes, not only p-values.',
    'Good calibration with poor discrimination is possible, and an overfitted model loses both at validation.'
  ],
  quiz: [
    {
      q: 'A model for neonatal sepsis (incidence 10%) has a Brier score of 0.072. What is its scaled Brier score?',
      options: ['7.2%', '20%', '28%', '80%'],
      answer: 1,
      why: 'Brier_max = 0.1 × 0.9 = 0.090; scaled = 1 − 0.072/0.090 = 0.20. 80% is the ratio Brier/Brier_max without subtracting it from 1; 28% wrongly uses the incidence (0.10) as the maximum; 7.2% simply restates the raw score.'
    },
    {
      q: 'A model is validated in two hospitals. The raw Brier score is lower (better) in hospital B, where the outcome is rarer. What is the most appropriate conclusion?',
      options: ['The raw comparison is confounded by incidence; compare scaled Brier scores', 'The model performs better in hospital B', 'Brier scores cannot be calculated at external validation', 'The c statistic must also be lower in hospital B'],
      answer: 0,
      why: 'Brier_max falls with incidence, so a rarer outcome lowers the Brier score even without better prediction, as in the book where the external Brier (0.161) beat development (0.174) but scaled Brier fell from 28% to 20%. The c statistic is independent of incidence, so no conclusion about it follows.'
    },
    {
      q: 'Every predicted log-odds from a preterm-birth model is increased by 0.5 in a new hospital (same patients, same ranking). What happens?',
      options: ['c increases', 'c decreases', 'c is unchanged, calibration-in-the-large changes', 'Both c and the calibration slope change'],
      answer: 2,
      why: 'c depends only on the ranking of predictions, which a constant shift does not alter; the shift appears as a change in calibration-in-the-large. The belief that any change in predictions changes c confuses discrimination with calibration.'
    },
    {
      q: 'At external validation, a gestational diabetes model has calibration slope 0.65. Which interpretation is correct?',
      options: ['Predictions are too moderate; high risks should be higher', 'The average predicted risk is too low', 'The model is perfectly calibrated because the slope is significant', 'Predictions are too extreme: high predicted risks are too high and low predicted risks too low'],
      answer: 3,
      why: 'A slope below 1 means the observed log-odds vary less than predicted, the classic sign of overfitting or weaker effects in the new setting. A slope above 1 would mean too moderate predictions; the average level is addressed by calibration-in-the-large, not the slope.'
    },
    {
      q: 'Authors report "Hosmer-Lemeshow p = 0.71 in the development data, indicating excellent calibration". What is the main problem?',
      options: ['A non-significant H-L test in the data used to fit the model is expected and has no scientific meaning about calibration in new patients', 'The H-L test should have 9 df in development data', 'p = 0.71 indicates poor calibration', 'The H-L test measures discrimination, not calibration'],
      answer: 0,
      why: 'The model was fitted to these data, so apparent calibration is near-perfect by construction, and the H-L test has low power. The df error is reversed: 8 df applies at development, 9 at external validation.'
    },
    {
      q: 'Predicted risks of 4 women with preterm birth are 0.40, 0.25, 0.15, 0.08; of 2 women without, 0.20 and 0.10. What is the c statistic?',
      options: ['0.50', '0.625', '0.75', '0.875'],
      answer: 1,
      why: '8 pairs. 0.40 beats both (2), 0.25 beats both (2), 0.15 beats 0.10 only (1), 0.08 beats neither (0): 5/8 = 0.625. The answer 0.75 comes from counting women rather than pairs (3 of 4 events above the lowest non-event).'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Brier, scaled Brier, c and calibration by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A model for low birth weight is applied to 8 newborns in a validation clinic. Predicted risks and outcomes (1 = low birth weight):</p>
<table class="data"><thead><tr><th>Baby</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr></thead>
<tbody><tr><td>Predicted risk</td><td>0.10</td><td>0.15</td><td>0.20</td><td>0.30</td><td>0.35</td><td>0.50</td><td>0.60</td><td>0.80</td></tr>
<tr><td>Outcome</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td></tr></tbody></table>`,
      questions: [
        '<b>(a)</b> Calculate the Brier score, Brier<sub>max</sub> and the scaled Brier score.',
        '<b>(b)</b> Calculate the c statistic.',
        '<b>(c)</b> Calculate the discrimination slope.',
        '<b>(d)</b> Compare mean predicted and observed risk; express calibration-in-the-large as an odds ratio and interpret it.'
      ],
      answer: `<p><b>(a)</b> Squared errors: 0.0100, 0.0225, 0.6400, 0.0900, 0.1225, 0.2500, 0.3600, 0.0400; sum = 1.5350. Brier = 1.535/8 = 0.192. Incidence = 3/8 = 0.375; Brier<sub>max</sub> = 0.375 × 0.625 = 0.234. Scaled Brier = 1 − 0.1919/0.2344 = 0.181 (18.1%; unrounded values used).</p>
<p><b>(b)</b> Events: 0.20, 0.50, 0.80. Non-events: 0.10, 0.15, 0.30, 0.35, 0.60. Pairs = 3 × 5 = 15. 0.20 beats 0.10 and 0.15 (2); 0.50 beats 0.10, 0.15, 0.30, 0.35 (4); 0.80 beats all 5 (5). c = 11/15 = 0.733.</p>
<p><b>(c)</b> Mean prediction among events = (0.20 + 0.50 + 0.80)/3 = 0.500; among non-events = (0.10 + 0.15 + 0.30 + 0.35 + 0.60)/5 = 0.300. Discrimination slope = 0.200.</p>
<p><b>(d)</b> Mean predicted = 3.00/8 = 0.375, equal to the observed 0.375. OR = 1.00: no evidence of systematic over- or underestimation. With 8 babies this says nothing reliable; calibration assessment needs far larger samples, and good calibration-in-the-large does not guarantee a correct slope.</p>`
    },
    {
      id: 't2',
      title: 'ROC Explorer and Calibration Lab: separating discrimination from calibration',
      level: 'Analyze',
      scenario: `<p>Use the ROC Explorer (section 4) and the Calibration Lab (section 5).</p>`,
      questions: [
        '<b>(a)</b> In the ROC Explorer, set c = 0.75 and compare incidence 5% with 40%. Which displayed measures change and which do not? Explain.',
        '<b>(b)</b> In the Calibration Lab, set n = 5000, wide spread, slope 1, and then intercept shift −1.0. Describe the calibration plot, calibration-in-the-large and c.',
        '<b>(c)</b> Now set intercept shift 0 and slope 0.5. Describe the plot and the change in c relative to slope 1.',
        '<b>(d)</b> Summarise what (b) and (c) teach about which kind of miscalibration also damages discrimination.'
      ],
      answer: `<p><b>(a)</b> c stays at 0.75 (it conditions on pairs with and without the outcome). Nagelkerke R², the Brier score, scaled Brier, the discrimination slope, PPV and NPV change with incidence. This is why c is preferred for comparing discrimination across settings, while Brier must be scaled.</p>
<p><b>(b)</b> The smoothed curve and decile points lie systematically below the identity line (observed lower than predicted: overestimation); calibration-in-the-large is about −1 on the log-odds scale; c is unaffected because the ranking is unchanged.</p>
<p><b>(c)</b> The curve is flatter than the identity line, crossing it near the average risk: high predictions are too high and low predictions too low. The calibration slope is about 0.5. In this lab, the slope setting changes how the true risk relates to the predicted risk; a slope below 1 means the true risks are less spread out than the predictions, so separation of outcomes is weaker and c is lower than at slope 1.</p>
<p><b>(d)</b> A shift in average risk (calibration-in-the-large) is independent of discrimination. A slope below 1, as from overfitting, goes with poorer discrimination in new patients as well as poorer calibration, as the book states.</p>`
    },
    {
      id: 't3',
      title: 'Critique a published validation of a preeclampsia model',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A preeclampsia risk model developed in a referral centre (incidence 8%) is validated in 300 women at a district hospital (incidence 4%, 12 cases). The authors report: "The Brier score improved from 0.065 at development to 0.038 at validation, indicating better performance. The AUC was 0.80. The Hosmer-Lemeshow test was non-significant (p = 0.48), confirming good calibration. The mean predicted risk was 7.6%." No calibration plot or slope is shown.</p>`,
      questions: [
        '<b>(a)</b> Evaluate the Brier score comparison.',
        '<b>(b)</b> What does the mean predicted risk reveal about calibration-in-the-large? Calculate the odds ratio.',
        '<b>(c)</b> Evaluate the calibration conclusion and list what should have been reported.',
        '<b>(d)</b> Comment on the precision of the AUC with 12 cases.'
      ],
      answer: `<p><b>(a)</b> Not comparable: incidence halved. Brier<sub>max</sub> = 0.08 × 0.92 = 0.0736 at development and 0.04 × 0.96 = 0.0384 at validation. Scaled Brier = 1 − 0.065/0.0736 = 11.7% at development and 1 − 0.038/0.0384 = 1.0% at validation. Performance actually collapsed.</p>
<p><b>(b)</b> Mean predicted 7.6% versus observed 4%: OR = (0.076/0.924)/(0.04/0.96) = 0.0823/0.0417 = 1.97. The model predicts roughly double the observed odds on average, which is serious systematic overestimation.</p>
<p><b>(c)</b> Critical: the conclusion is wrong. A non-significant Hosmer-Lemeshow test in 300 women with 12 events has very low power and cannot confirm calibration; the mean predicted risk already shows major miscalibration. Required: calibration plot with distribution of predictions, calibration-in-the-large (a | b = 1), calibration slope, and the 2-df recalibration test, with confidence intervals.</p>
<p><b>(d)</b> With 12 cases the AUC is very imprecise; a bootstrap confidence interval should be given. The AUC also says nothing about the overestimation in (b), since c is insensitive to calibration.</p>`
    }
  ]
});
