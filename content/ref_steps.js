registerRef({
  id: 'steps',
  title: 'Seven-step checklist',
  html: `
<p>Before the seven modelling steps, fix the general frame: the research question, the intended application and clinical decision, the outcome and its definition, the candidate predictors, the study design, the type of statistical model and the sample size (events). Development then proceeds in seven steps. Validity is judged at the end on two levels: internal validity (is the model reproducible in the same population, that is, free of overfitting?) and external validity (does it generalise to other settings?).</p>

<p>Illustrative (synthetic): the running example is a model for preterm birth (&lt;37 weeks) in an antenatal cohort.</p>

<table class="data">
<thead><tr><th>Step</th><th>Key decisions</th><th>Where taught</th></tr></thead>
<tbody>
<tr><td><b>0. Frame the problem</b></td><td>Which decision will the prediction inform, and at what threshold? Is the outcome diagnostic or prognostic, binary or time-to-event? Are predictors available when the model will be used? Are there enough events (EPV) for the number of candidate parameters? Is outcome measurement as rigorous as in a trial?</td><td>Modules 1 and 2</td></tr>
<tr><td><b>1. Inspect the data</b></td><td>How much is missing in each predictor and why (MCAR, MAR, MNAR)? Complete case analysis or imputation? Which variables go into the imputation model (predictors, outcome, auxiliary variables)? Are there outliers or impossible values?</td><td>Module 5</td></tr>
<tr><td><b>2. Code the predictors</b></td><td>Keep continuous predictors continuous; avoid dichotomising. Linear, transformed, polynomial or spline? Which candidates to drop before looking at the outcome (little variation, many missing, redundant)? Which to combine into sum scores? Which variables are excluded or retained by subject knowledge?</td><td>Modules 6 and 7</td></tr>
<tr><td><b>3. Specify the model</b></td><td>Prespecified full model or selection? If selection, which stopping rule and how many candidates? Which interactions and non-linear terms are a priori plausible? How many degrees of freedom can the data afford?</td><td>Modules 3, 8 and 9</td></tr>
<tr><td><b>4. Estimate the coefficients</b></td><td>Ordinary maximum likelihood, or shrinkage (uniform factor, penalised/ridge, lasso)? Is external information available to combine with the data? Is the intercept re-estimated after shrinkage?</td><td>Module 10</td></tr>
<tr><td><b>5. Evaluate performance</b></td><td>Overall (R², Brier, scaled Brier), discrimination (c, ROC), calibration (plot, calibration-in-the-large, slope). Is the model clinically useful at the relevant threshold (net benefit, decision curve)?</td><td>Modules 11 and 12</td></tr>
<tr><td><b>6. Validate</b></td><td>Internal: bootstrap replaying every modelling step, cross-validation, split-sample (least preferred). External: temporal, geographic or independent. Which case-mix and coefficient differences explain poorer performance? Is the validation sample large enough?</td><td>Modules 4, 13 and 14</td></tr>
<tr><td><b>7. Present the model</b></td><td>Full regression formula with intercept and coding, nomogram, score chart, or table? Prediction model (risk) or decision rule (action above a threshold)? How much information is lost by rounding or categorising?</td><td>Module 15</td></tr>
</tbody></table>

<div class="callout warn"><b>Critical</b><p>Every data-driven choice in steps 1 to 4 (imputation model, transformations, selection, shrinkage) must be repeated inside each bootstrap sample in step 6. Validating only the final model, as if it had been prespecified, understates optimism.</p></div>

<div class="callout key"><b>Order of work</b><p>Steps 1 to 4 define the modelling strategy; steps 5 and 6 test that strategy, not just one fitted model; step 7 communicates it. The capstone walks through all seven steps with the Analysis Lab.</p></div>

<p class="src">Source: Ch. 1 and Ch. 6 (checklist).</p>
`
});
