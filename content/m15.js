registerModule({
  id: 'm15',
  num: 15,
  part: 'Validation',
  title: 'Presentation formats: formula, nomogram, score chart',
  book: 'Ch. 18',
  minutes: 65,
  summary: 'How to present a validated model so that users can calculate correct absolute risks: the regression formula, confidence intervals for predictions, nomograms, score charts, tables and decision rules, and what each format costs in accuracy.',
  objectives: [
    'Distinguish a clinical prediction model from a clinical decision rule.',
    'Calculate a predicted probability from a published logistic regression formula, including the intercept, coding and units.',
    'Calculate a confidence interval for a predicted probability from the covariance matrix.',
    'Construct a score chart from regression coefficients, including continuous predictors, and convert a total score back to a probability.',
    'Explain why scores must be based on regression coefficients and why dividing by the smallest coefficient or using odds ratios is wrong.',
    'Evaluate the loss of discrimination when continuous predictors are categorised or predictions are tabulated.'
  ],
  sections: [
    {
      id: 's1',
      title: 'Prediction models and decision rules',
      html: `
<p>Epidemiological papers usually present tables of odds ratios with confidence intervals. Such a table is <b>not sufficient</b> to calculate an absolute risk: that requires the model intercept (for logistic and linear models) or the baseline hazard (for survival models). A prediction model that cannot be used to calculate risks for a new patient has not been presented.</p>
<h3>Two kinds of product</h3>
<ul>
<li>A <b>clinical prediction model</b> gives an estimate of absolute risk from a combination of patient characteristics. For a good model the predictions span a wide range. Interpretation and action are left to the clinician and the patient.</li>
<li>A <b>clinical decision rule</b> recommends a course of action for a combination of characteristics. It needs more subject-matter input, especially on the choice of a risk threshold (see the module on clinical usefulness). Some argue that presenting a model as a decision rule eases its wide application, citing rules such as the Ottawa rules for ankle, knee and head injuries.</li>
</ul>
<p>A decision rule is derived from a prediction model by adding a threshold; the two are not synonymous.</p>
<h3>Formats</h3>
<table class="data">
<thead><tr><th>Format</th><th>Accuracy of predictions</th><th>Advantages</th><th>Disadvantages</th></tr></thead>
<tbody>
<tr><td colspan="4"><b>Prediction models</b></td></tr>
<tr><td>Regression formula</td><td>Exact</td><td>Simple; follows directly from the analysis; can be computerised</td><td>Leaves the calculation to the user; confidence intervals hard to compute by hand</td></tr>
<tr><td>Spreadsheet or program</td><td>Exact, with exact 95% CI</td><td>Familiar software; easy to distribute</td><td>User must obtain and learn the file or program</td></tr>
<tr><td>Nomogram</td><td>Quite exact, approximate CI</td><td>Graphical, handles interactions</td><td>Difficult to understand at first sight</td></tr>
<tr><td>Score chart</td><td>Approximate</td><td>Easy to understand</td><td>Approximate predictions</td></tr>
<tr><td>Table of predictions</td><td>Averaged over categories</td><td>Very easy to use</td><td>Continuous predictors must be categorised</td></tr>
<tr><td colspan="4"><b>Decision rules</b></td></tr>
<tr><td>Regression tree</td><td>Large groups</td><td>Very easy to use</td><td>Unstable with limited data; categorises predictors</td></tr>
<tr><td>Score chart rule</td><td>Highly rounded</td><td>Can be memorised</td><td>Inaccurate predictions</td></tr>
<tr><td>Risk groups</td><td>Large groups</td><td>Stable</td><td>Cut-offs based on the distribution of risk, not decision considerations</td></tr>
<tr><td>Meta-model tree</td><td>Large groups</td><td>Very easy to use</td><td>Captures only the general pattern of the underlying model</td></tr>
</tbody>
</table>
<p>Formats differ in medium (paper or electronic), level of detail (rough indications or exact probabilities), whether they show uncertainty, and user-friendliness.</p>
<p class="src">Source: Ch. 18, §18.1 (Table 18.1)</p>
`
    },
    {
      id: 's2',
      title: 'The regression formula',
      html: `
<p>The simplest presentation is the regression formula itself. Calculating a prediction takes two steps.</p>
<ol>
<li><b>Linear predictor</b>: multiply each coefficient by the patient's predictor value and add the intercept: lp = β<sub>0</sub> + β<sub>1</sub>x<sub>1</sub> + … + β<sub>k</sub>x<sub>k</sub>.</li>
<li><b>Transform to the outcome scale</b>: for logistic regression, p = 1/(1 + exp(−lp)). For a Cox model, a baseline survival or hazard function is needed in addition to lp.</li>
</ol>
<div class="formula">p = 1 / (1 + exp(−lp))</div>
<h3>Coding must be explicit</h3>
<ul>
<li>Binary predictors: 0/1 coding, so that patients without the characteristic score zero. State which value is 1.</li>
<li>Categorical predictors: dummy variables with a stated reference category (the most common category, or a clinically natural one).</li>
<li>Continuous predictors: state the units (mg/dL versus mmol/L, g/dL versus g/L) and any transformation (log, square root, spline).</li>
<li>If continuous predictors were centred (mean subtracted), state the centring value, which the user must subtract before applying the coefficient.</li>
</ul>
<div class="callout eg"><b>Worked example (illustrative, synthetic): gestational diabetes</b><p>The coefficients below equal the true effects used to simulate the course's gestational diabetes data; the intercept and centring values are illustrative.</p>
<p>lp = −2.2 + 0.05 × (age − 27) + 0.09 × (BMI − 23) + 0.6 × family history of diabetes + 1.3 × previous GDM + 0.06 × (fasting glucose − 85)</p>
<p>with age in years, BMI in kg/m², fasting plasma glucose in mg/dL, and family history and previous GDM coded 1 = yes, 0 = no.</p>
<p>Woman aged 31, BMI 27, family history yes, no previous GDM, fasting glucose 92 mg/dL:</p>
<p>lp = −2.2 + 0.05 × 4 + 0.09 × 4 + 0.6 × 1 + 1.3 × 0 + 0.06 × 7 = −2.2 + 0.20 + 0.36 + 0.60 + 0 + 0.42 = −0.62.</p>
<p>p = 1/(1 + exp(0.62)) = 1/(1 + 1.859) = 0.350, a predicted risk of 35%.</p>
<p>If a user entered glucose in mmol/L (92 mg/dL ≈ 5.1 mmol/L) without converting, the glucose term would be 0.06 × (5.1 − 85) = −4.8 and the predicted risk would collapse to under 1%.</p></div>
<h3>Incorporating shrinkage</h3>
<p>If internal validation suggested a shrinkage factor, the formula should contain shrunk coefficients. One option is to centre the predictors so that the average linear predictor is zero and multiply the linear predictor by the shrinkage factor. The average prediction then remains roughly correct, but because the logistic transformation is non-linear, a systematic error arises when predictions span a wide range or the shrinkage is strong.</p>
<div class="callout warn"><b>Pitfall</b><p>Shrinking the coefficients without adjusting the intercept leaves calibration-in-the-large incorrect. The preferred approach is to shrink the coefficients and then <b>re-estimate the intercept</b>, so that the mean predicted risk equals the observed outcome frequency in the development data.</p></div>
<p>A regression formula is the basis for computerised implementation: spreadsheets, web calculators, hospital information systems and electronic records. A spreadsheet can show the individual prediction with an approximate 95% confidence interval.</p>
<p class="src">Source: Ch. 18, §18.2.1</p>
`
    },
    {
      id: 's3',
      title: 'Uncertainty around predictions',
      html: `
<h3>Confidence and prediction intervals</h3>
<p>For a continuous outcome, a <b>confidence interval</b> describes uncertainty about the <i>average</i> outcome for patients with given characteristics; it becomes very narrow with very large samples. A <b>prediction interval</b> describes where an <i>individual</i> outcome is likely to fall and stays wide however large the sample, because individuals vary. A growth chart of length by age based on thousands of children has a very tight confidence interval around the mean, but individual children still vary widely.</p>
<p>For a binary outcome, the prediction is already a probability, which expresses the inherent uncertainty for the individual. A predicted risk of 35% with a narrow confidence interval still means that the woman either will or will not develop the outcome. With regression, predictions approach but never reach 0 or 1.</p>
<h3>When the interval misleads</h3>
<p>Total uncertainty is the sum of random and systematic error. A confidence interval reflects only random error and is valid only if the predictions have <b>no systematic bias</b>. Miscalibration in a new setting, caused by different predictor coding, missed predictors with different distributions or truly different effects, is a systematic error that no confidence interval shows. Be cautious when a large development sample gives narrow intervals. Conversely, wide intervals from a small data set are a useful warning against over-interpreting predictions. For decisions, the point prediction remains of primary interest: if no better estimate is available, following the model's estimate is the best one can do.</p>
<h3>Calculation</h3>
<p>The standard error of a linear predictor comes from the covariance matrix V of the coefficients. For a patient with predictor vector x (with 1 for the intercept):</p>
<div class="formula">SE(lp) = √(xᵀ V x)</div>
<div class="callout eg"><b>Worked example</b><p>A model with an intercept and one binary predictor has a = −1.5, b = 0.5, var(a) = 0.04, var(b) = 0.01 and cov(a, b) = −0.005. For a patient with the predictor present, x = (1, 1):</p>
<p>lp = −1.5 + 0.5 = −1.0; p = 1/(1 + exp(1.0)) = 0.269.</p>
<p>Var(lp) = var(a) + var(b) + 2 cov(a, b) = 0.04 + 0.01 − 0.010 = 0.040; SE = 0.20.</p>
<p>95% CI for lp: −1.0 ± 1.96 × 0.20 = −1.392 to −0.608. Transforming each limit: p from 0.199 to 0.353. The interval is calculated on the logit scale and then transformed, so it is not symmetric around 0.269.</p></div>
<p>Each combination of predictor values has its own SE, even when two patients share the same linear predictor. This is easy in a formula or spreadsheet but awkward in a nomogram or score chart, where the mean or median SE for a given linear predictor value can be shown. If shrinkage was applied, the covariance matrix of the unshrunk model can still be used; a penalised model's own covariance matrix gives slightly smaller SEs.</p>
<p class="src">Source: Ch. 18, §18.2.2, §18.3.1</p>
`
    },
    {
      id: 's4',
      title: 'Nomograms',
      html: `
<p>A <b>nomogram</b> is a graphical version of the regression formula. It has one horizontal axis per predictor, a <b>points</b> axis at the top (for example 0–10 or 0–100), a <b>total points</b> axis, and a probability axis at the bottom.</p>
<h3>How it works</h3>
<ol>
<li>For each predictor, locate the patient's value and read the corresponding points vertically on the points axis. Points are proportional to the coefficient times the predictor value, rescaled so the predictor with the widest range of effect spans the full points axis.</li>
<li>Add the points. Total points correspond linearly to the linear predictor.</li>
<li>Read down from the total points to the probability axis, which applies the logistic transformation.</li>
</ol>
<p>A patient-friendly way to express the result is the frequency format: "of 100 women like you, we would expect about 35 to develop gestational diabetes".</p>
<h3>Advantages</h3>
<ul>
<li>The <b>length of each predictor's line</b> shows its relative importance, provided the values on the lines cover the distribution of the predictor in the data.</li>
<li><b>Interactions</b> can be shown with separate lines, so that only one axis is read per predictor value.</li>
<li>Non-linear terms and complex models (for example survival models with time-dependent covariates) can be shown, and the final scale can carry approximate confidence intervals or extra outcome scales.</li>
</ul>
<h3>Disadvantages</h3>
<ul>
<li>Relatively complex at first sight.</li>
<li>Reading inaccuracy accumulates when many predictors are included, and the translation from total points to probability is read by eye.</li>
<li>It is not clear whether clinicians prefer nomograms to score charts.</li>
</ul>
<div class="callout book"><b>Book example</b><p>A nomogram for benign histology after chemotherapy for testicular cancer used six predictors from a penalised logistic model, with a maximum of 10 points per predictor, accepting some loss of accuracy in summing points.</p></div>
<div class="callout warn"><b>Pitfall</b><p>A model published only as a nomogram with non-linear terms is hard for others to validate, because the formula must be reconstructed from the graph. Publish the full regression formula, with intercept, coding and units, alongside any nomogram.</p></div>
<p class="src">Source: Ch. 18, §18.2.3, §18.3.2; Ch. 17, §17.3.5</p>
`
    },
    {
      id: 's5',
      title: 'Score charts',
      html: `
<p>A <b>score chart</b> assigns rounded points to each predictor; the user adds the points and converts the total to a probability using a small table or graph.</p>
<h3>Construction in four steps</h3>
<ol>
<li><b>Round the coefficients</b> of binary and categorical predictors. A simple approach is to multiply by 10 and round. Smaller multipliers often still give sufficiently refined predictions. Search for a <b>common denominator</b> across all coefficients.</li>
<li><b>Score continuous predictors</b>, kept continuous or categorised: choose a sensible reference value that scores 0 (age 0 is rarely sensible), find the values that score +1, +2 and so on given the coefficient and distribution, and add intermediate values (for example +0.5); other values are scored by linear interpolation.</li>
<li><b>Estimate the multiplication factor</b>: fit a logistic model with the total score as the only predictor. Its coefficient (log-odds per point) undoes the scaling; multiply it by any shrinkage factor.</li>
<li><b>Estimate the intercept</b> with the shrunk score as an offset, and present the chart with the conversion from total score to probability.</li>
</ol>
<div class="callout warn"><b>Pitfall</b><p>Dividing all coefficients by the smallest coefficient of a binary predictor (so that it scores 1) capitalises on the estimate of one coefficient and adds unnecessary uncertainty. Using <b>odds ratios</b> as points is wrong: the linear predictor adds log-odds, so points must be proportional to regression coefficients. With odds ratios, a predictor with no effect (OR 1.0) would earn 1 point, and the relative weights are distorted: ORs of 10 and 1.5 differ 6.7-fold, while their coefficients (2.30 and 0.41) differ 5.7-fold.</p></div>
<div class="callout eg"><b>Worked example (illustrative, synthetic): a GDM score chart</b><p>Using the formula from the earlier section, 1 point is set to 0.6 log-odds (coefficients multiplied by 10/6). Family history 0.6 → 1 point; previous GDM 1.3 → 2.17, rounded to 2 points. Continuous predictors: age 6 years above 27 = 0.5 point; BMI 26 = 0.5, 30 = 1 (exact values 0.45 and 1.05); fasting glucose 90 = 0.5, 95 = 1, 100 = 1.5 (reference values 27 years, BMI 23 and 85 mg/dL score 0). A refit in the illustrative data gives lp = −2.2 + 0.6 × score.</p>
<p>The same woman (31 years, BMI 27, family history, glucose 92): age 4/6 × 0.5 = 0.33; BMI between 26 and 30: 0.5 + ¼ × 0.5 = 0.625; glucose between 90 and 95: 0.5 + 2/5 × 0.5 = 0.7; family history 1. Total = 2.66. lp = −2.2 + 0.6 × 2.66 = −0.605; p = 0.353, close to the formula's 0.350. Rounding each item to the nearest half point (total 2.5) gives 0.332.</p></div>
<div class="callout book"><b>Book example</b><p>For the testicular cancer model, penalised coefficients of the three binary predictors were about 0.8, so multiplying by 10/8 gave each 1 point. LDH (log of the value relative to the upper limit of normal, coefficient 0.88) scored 0 at 1 × normal, 1 point at 2.5 × normal and 2 points at about 6 × normal. Refitting the rescaled predictors gave coefficients around 0.8, confirming the rescaling. The multiplier was 0.86, times shrinkage 0.95 gives 0.81: lp = −1.94 + 0.81 × score. The c statistic was 0.839 with the formula and 0.838 with rounded scores; categorising the continuous predictors reduced it to 0.808.</p></div>
<div data-widget="scoreChartBuilder"></div>
<ul class="try">
<li>With continuous handling, change the points-per-log-odds multiplier from coarse to fine. Compare the c statistic of the points score with that of the full regression model.</li>
<li>Switch to categorised continuous predictors at the same multiplier. Note how much c falls compared with the continuous version.</li>
<li>Enter a patient in the form and compare the score-based risk with the risk from the full model.</li>
</ul>
<p class="src">Source: Ch. 18, §18.2.4, §18.3.3–18.3.4 (Tables 18.2, 18.4, 18.5)</p>
`
    },
    {
      id: 's6',
      title: 'Tables, risk groups and decision rules',
      html: `
<h3>Tables with predictions</h3>
<p>A table showing risk for combinations of predictor values is very easy to use, and treatment advice can be attached to its cells (for example, colour-coded statin recommendations by smoking, blood pressure, diabetes, cholesterol ratio and sex). The price is categorisation of continuous predictors and averaging within cells.</p>
<div class="callout book"><b>Book example</b><p>For the testicular cancer model, the c statistic was 0.839 for the formula, nomogram and graphical formats, 0.838 for the score chart with continuous predictors, 0.808 for categorised scores and 0.773 for a simple table (sum of five favourable characteristics against residual mass size).</p></div>
<h3>Decision rules</h3>
<ul>
<li><b>Regression tree</b>: classifies patients into a few groups by a sequence of splits, to which experts can attach treatment advice. Trees are easy to understand but data-hungry and unstable with limited data.</li>
<li><b>Score chart rule</b>: severely rounded coefficients, for example one point per risk factor or "major" and "minor" factors, with an action above a score. Such rules can be memorised, but predictions are less accurate and calibration in particular suffers.</li>
<li><b>Risk groups</b>: grouped predictions (for example good, intermediate and poor prognosis) linked to treatment intensity. Group-level predictions are stable, but the cut-offs often follow the distribution of risk rather than decision-analytic reasoning.</li>
<li><b>Meta-model</b>: a simple model (often a tree) that predicts the classification made by a more complex model, for example "treat" versus "do not treat" at a threshold. It inherits any shrinkage of the underlying model.</li>
</ul>
<div class="callout book"><b>Book example: a score chart rule</b><p>A rule for CT scanning after minor head injury recommended CT with at least one of ten major or two of eight minor risk factors, derived from rounded logistic coefficients and categorised predictors. Sensitivity for neurosurgical intervention was 100% in the development data, but bootstrap validation gave an average of 96%, with 100% in only 56% of bootstrap samples. Specificity was 25%.</p></div>
<div class="callout warn"><b>Pitfall</b><p>A decision rule reported with 100% sensitivity in its development data should not be expected to have 100% sensitivity in new patients. Internal validation of the rule itself is needed.</p></div>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A district programme wants a rule for referring women with suspected preeclampsia. Converting a well-calibrated model into "refer if score ≥ 3" requires choosing the threshold from the relative harms of unnecessary referral and missed disease. That is a clinical and programme decision; the rule's sensitivity and specificity should then be validated, not assumed.</p></div>
<p class="src">Source: Ch. 18, §18.2.5, §18.4 (Tables 18.3, 18.5)</p>
`
    },
    {
      id: 's7',
      title: 'Choosing and reporting a format',
      html: `
<p>Presentation deserves more attention than it usually receives. Some general points follow from the book.</p>
<ul>
<li><b>Match the audience.</b> Some clinical areas are more quantitative than others, and some formats have become standard in particular fields (for example nomograms in prostate cancer). Specific formats can serve specific users: for radiologists, iso-probability curves of risk against pre- and post-treatment mass size were drawn for the testicular cancer model.</li>
<li><b>Know the cost of simplification.</b> Each step from formula to rounded score chart to categorised chart to table can reduce discrimination. Rounding with continuous predictors costs little (c 0.839 to 0.838 in the book example); categorisation and tabulation cost more (0.808 and 0.773).</li>
<li><b>Evidence on preference is limited.</b> There is no convincing evidence that one format communicates individual predictions better than another.</li>
<li><b>Computerised presentation</b> through electronic records and calculators makes complex models easy to apply, and is likely to become more common.</li>
</ul>
<h3>Minimum reporting for any format</h3>
<p>Whatever simplified format is offered, publish the information that allows others to calculate predictions and validate the model:</p>
<ol>
<li>The intercept (or baseline survival at stated time points) and all coefficients, after any shrinkage, with the intercept re-estimated.</li>
<li>Coding of every predictor: 0/1 meaning, reference categories, units, transformations, centring values and spline knot positions.</li>
<li>The outcome definition and time horizon.</li>
<li>For score charts: points per predictor, interpolation rules, and the conversion from score to probability (multiplier and intercept).</li>
</ol>
<div class="callout key"><b>Key idea</b><p>A presentation format is a translation of the model. It must reproduce the model's absolute risks closely enough for its purpose, and the full formula should remain available, because external validation and updating depend on it.</p></div>
<p class="src">Source: Ch. 18, §18.2.6, §18.3.5, §18.5</p>
`
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
      q: 'A paper on low birth weight presents only a table of adjusted odds ratios with 95% CIs for six predictors. Can a reader calculate a predicted risk for a new mother?',
      options: [
        'Yes, by multiplying the odds ratios that apply to her',
        'Yes, by adding the odds ratios and dividing by six',
        'Yes, if the overall incidence is also reported',
        'No, the intercept (and exact coding) is needed to obtain an absolute risk'
      ],
      answer: 3,
      why: 'Odds ratios give relative effects only; the absolute risk requires the intercept, which places the linear predictor on the correct baseline, plus exact coding and units. Multiplying odds ratios gives the odds relative to the reference patient, not her risk. The overall incidence alone does not give the intercept unless all predictors are centred appropriately.'
    },
    {
      q: 'A preterm-birth model has lp = −3.0 + 1.5 × previous preterm birth + 0.9 × chronic hypertension. What is the predicted risk for a woman with both characteristics?',
      options: ['About 18%', 'About 35%', 'About 65%', 'About 85%'],
      answer: 1,
      why: 'lp = −3.0 + 1.5 + 0.9 = −0.6; p = 1/(1 + exp(0.6)) = 1/(1 + 1.822) = 0.354. Option A results from omitting chronic hypertension (lp = −1.5, p = 0.18); option C results from reversing the sign of lp (p = 0.65).'
    },
    {
      q: 'An author shrinks all coefficients of an anaemia-in-pregnancy model by 0.85 but keeps the original intercept. What is the expected consequence?',
      options: [
        'Calibration-in-the-large is likely to be wrong, because the intercept was not re-estimated',
        'Discrimination falls substantially',
        'No consequence, because shrinkage affects only the slope',
        'The calibration slope becomes greater than 1 in the development data'
      ],
      answer: 0,
      why: 'Shrinking coefficients changes the mean linear predictor, so the average predicted risk no longer matches the observed frequency unless the intercept is re-estimated. Uniform shrinkage hardly changes c, because the ranking of patients is unchanged (against option B).'
    },
    {
      q: 'To build a score chart, an investigator divides every coefficient by the smallest binary coefficient (0.35), giving that predictor 1 point. What is the main objection?',
      options: [
        'Scores must always be whole numbers between 0 and 10',
        'The scaling capitalises on the estimate of one coefficient, adding unnecessary uncertainty; a common denominator across coefficients is preferable',
        'Binary predictors should not receive points',
        'The resulting chart cannot be converted back to a probability'
      ],
      answer: 1,
      why: 'Dividing by the smallest coefficient lets the imprecision of that single estimate drive all scores. The book recommends searching for a common denominator (for example multiplying by 10, or a smaller factor). Any rescaled score can be converted back to a probability by refitting the multiplier and intercept, so option D is wrong.'
    },
    {
      q: 'In the book example, which presentation of the testicular cancer model lost the most discrimination?',
      options: [
        'The nomogram',
        'The score chart with rounded scores and continuous predictors',
        'The simple table of predictions',
        'The score chart with categorised continuous predictors'
      ],
      answer: 2,
      why: 'The c statistic was 0.839 for formula and nomogram, 0.838 for rounded continuous scores, 0.808 for categorised scores and 0.773 for the table. Rounding costs little; the misconception is that rounding scores is the main source of loss, when categorisation and tabulation cost far more.'
    },
    {
      q: 'A model developed in 20,000 women gives a predicted risk of PPH of 8% (95% CI 7.6% to 8.4%) for a woman at a new hospital where the model has not been validated. How should the narrow interval be interpreted?',
      options: [
        'Her true risk is almost certainly between 7.6% and 8.4%',
        'The model is certainly well calibrated in the new hospital',
        'She will have a PPH with probability between 7.6% and 8.4% regardless of setting',
        'It reflects random error only; systematic miscalibration in the new setting is not included'
      ],
      answer: 3,
      why: 'Confidence intervals for predictions are valid only if there is no systematic bias. A large development sample gives narrow intervals, but miscalibration from different case-mix or coefficients in a new setting is not shown. Options A and C mistake precision for accuracy.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'From formula to score chart by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A gestational diabetes model is published as:</p>
<div class="formula">lp = −2.2 + 0.05 × (age − 27) + 0.09 × (BMI − 23) + 0.6 × family history + 1.3 × previous GDM + 0.06 × (fasting glucose − 85)</div>
<p>Age in years, BMI in kg/m², fasting plasma glucose in mg/dL; family history and previous GDM coded 1 = yes. A score chart is to be built with 1 point = 0.6 log-odds; a refit of the total score in the development data gives lp = −2.2 + 0.6 × score.</p>
<p>Woman A: 35 years, BMI 30, family history no, previous GDM yes, fasting glucose 95 mg/dL.</p>
<p>For a second woman with lp = −1.0, the SE of the linear predictor (from xᵀVx) is 0.20.</p>`,
      questions: [
        '<b>(a)</b> Calculate woman A\'s linear predictor and predicted risk from the formula.',
        '<b>(b)</b> Derive the points per unit for each predictor and the points for previous GDM (rounded to a whole number). Score woman A without rounding the continuous items and convert to a probability.',
        '<b>(c)</b> Explain where the score-based risk differs from the formula and why.',
        '<b>(d)</b> Calculate the 95% confidence interval for the second woman\'s predicted risk. What does it not include?',
        '<b>(e)</b> A colleague proposes points equal to the odds ratios (family history 1.8, previous GDM 3.7). Explain why this is wrong.'
      ],
      answer: `<p><b>(a)</b> lp = −2.2 + 0.05 × 8 + 0.09 × 7 + 0.6 × 0 + 1.3 × 1 + 0.06 × 10 = −2.2 + 0.40 + 0.63 + 0 + 1.30 + 0.60 = 0.73. p = 1/(1 + exp(−0.73)) = 1/(1 + 0.482) = <b>0.675</b>.</p>
<p><b>(b)</b> Points = coefficient/0.6. Age 0.05/0.6 = 0.083 per year (1 point per 12 years); BMI 0.09/0.6 = 0.15 per unit (1 point per 6.7 units); glucose 0.06/0.6 = 0.1 per mg/dL (1 point per 10 mg/dL); family history 0.6/0.6 = 1; previous GDM 1.3/0.6 = 2.17, rounded to 2. Woman A: age 8 × 0.083 = 0.67; BMI 7 × 0.15 = 1.05; family history 0; previous GDM 2; glucose 10 × 0.1 = 1.0. Total = 4.72. lp = −2.2 + 0.6 × 4.72 = 0.63; p = 1/(1 + exp(−0.63)) = <b>0.653</b>.</p>
<p><b>(c)</b> The difference (65.3% versus 67.5%) comes from rounding previous GDM from 2.17 to 2 points: 2 × 0.6 = 1.2 log-odds instead of 1.3, a loss of 0.1 on the logit scale. The continuous items were not rounded, so they contribute no error. In a real chart, the multiplier and intercept are re-estimated from the rounded scores, which partly compensates on average.</p>
<p><b>(d)</b> 95% CI for lp: −1.0 ± 1.96 × 0.20 = −1.392 to −0.608. Probabilities: 1/(1 + exp(1.392)) = 0.199 and 1/(1 + exp(0.608)) = 0.353, around a point estimate of 0.269. The interval covers random estimation error only; it does not include systematic error such as miscalibration if the model is used in a different setting, and it does not express the fact that the individual woman either will or will not develop GDM.</p>
<p><b>(e)</b> The linear predictor adds log-odds, so points must be proportional to coefficients (0.6 and 1.3, ratio 2.17). Odds ratios (1.8 and 3.7, ratio about 2.0) distort the relative weights, and any predictor with no effect (OR 1.0) would receive 1 point instead of 0; a protective factor with OR 0.5 would add points instead of subtracting them. The sum of odds ratios has no defined relation to risk.</p>`
    },
    {
      id: 't2',
      title: 'Cost of simplification in the score chart builder',
      level: 'Analyze',
      scenario: `<p>Open the score chart builder, which uses a fixed 9-predictor preterm-birth model fitted to the synthetic district hospital cohort (ptb_dev).</p>`,
      questions: [
        '<b>(a)</b> With continuous predictors kept continuous, vary the points-per-log-odds multiplier from coarse to fine. How does the c statistic of the points score compare with the full regression model?',
        '<b>(b)</b> Switch to categorised continuous predictors. What happens to c, and why?',
        '<b>(c)</b> Score two women of your choice in the patient form and compare score-based and model-based risks. Where are the discrepancies largest?',
        '<b>(d)</b> Which format would you recommend for a printed antenatal card, and what would you publish alongside it?'
      ],
      answer: `<p><b>(a)</b> Expected pattern: with continuous handling, the points score has a c statistic very close to the full model, even with a fairly coarse multiplier; only very coarse rounding (a few points per predictor) lowers c noticeably. This mirrors the book example, where rounded scores lost only 0.001 in c (0.839 to 0.838).</p>
<p><b>(b)</b> c falls more, because categorisation throws away information within categories: women at the edges of a category receive the same points as those in the middle. In the book example categorisation cost 0.031 (0.839 to 0.808). Continuous predictors with graded effects (such as haemoglobin, BMI or age in preterm-birth risk) lose most when categorised coarsely.</p>
<p><b>(c)</b> Discrepancies are largest where rounding errors accumulate, typically for women with several risk factors or extreme values of continuous predictors. For most women the difference is small.</p>
<p><b>(d)</b> A score chart with continuous predictors scored by interpolation (or with fine categories) and a conversion table from total score to risk is a reasonable printed format. Alongside it, publish the full regression formula: intercept, coefficients after shrinkage with re-estimated intercept, coding, units, transformation details, and the score multiplier and intercept, so the model can be validated and updated elsewhere.</p>`
    },
    {
      id: 't3',
      title: 'Critique a published neonatal sepsis score',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A newborn unit publishes a "sepsis risk score" developed in 700 newborns. The paper contains a table of odds ratios. Points were assigned by rounding each odds ratio (for example lethargy OR 4.1 = 4 points, male sex OR 1.1 = 1 point). C-reactive protein and temperature were categorised at cut-points chosen to maximise the odds ratio. The total score is presented with a recommendation: "score ≥ 6: start antibiotics", which in the development data had 100% sensitivity. The paper also shows a nomogram from a separate model with a spline for respiratory rate, but no intercept or formula. A hospital in another state wants to adopt the score.</p>`,
      questions: [
        '<b>(a)</b> Identify the problems with how the model is presented.',
        '<b>(b)</b> What would the receiving hospital need to validate the model, and what should it expect about the 100% sensitivity?',
        '<b>(c)</b> Rewrite the presentation plan.'
      ],
      answer: `<p><b>(a)</b> Problems:</p>
<ol>
<li>Points based on odds ratios: the score is not proportional to log-odds. A predictor with essentially no effect (male sex, OR 1.1) gains 1 point, and relative weights are distorted. The sum has no defined relation to risk.</li>
<li>No conversion from score to probability (no multiplier or intercept), so absolute risks cannot be obtained.</li>
<li>Continuous predictors dichotomised at data-derived "optimal" cut-points: loss of information and optimistic, biased effects.</li>
<li>The decision rule (score ≥ 6) is reported without justification of the threshold in terms of harms of unnecessary antibiotics versus missed sepsis.</li>
<li>100% sensitivity is an apparent (development) result, which is optimistic.</li>
<li>The nomogram with a spline term and no published formula or intercept cannot be reconstructed reliably, making external validation error-prone.</li>
</ol>
<p><b>(b)</b> The receiving hospital needs the full regression formula: intercept, coefficients, coding, units (CRP in mg/L, temperature in °C), spline knot positions and the outcome definition. It should expect sensitivity below 100% in its own newborns; in the book's head injury example, a rule with 100% apparent sensitivity had an average of 96% in bootstrap validation and 100% in only 56% of samples. It should check calibration-in-the-large locally, because sepsis incidence and case-mix differ between units.</p>
<p><b>(c)</b> Plan: publish the full formula (with shrinkage and a re-estimated intercept); keep CRP and temperature continuous with appropriate transformations; build a score chart from the coefficients using a common denominator, with interpolation for continuous predictors and a table converting total score to probability; report the c statistic of the score against the full model; present any decision threshold as a separate decision rule with its rationale and internally validated sensitivity and specificity; and provide a nomogram only as a supplement to the formula.</p>`
    }
  ]
});
