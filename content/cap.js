registerModule({
  id: 'cap',
  num: 'Capstone',
  part: 'Validation',
  title: 'Develop and validate a preterm birth model',
  book: 'Ch. 1 to 19',
  minutes: 150,
  summary: 'A guided project in which you develop a preterm birth prediction model in one synthetic hospital cohort, estimate its optimism, validate it in a second hospital and judge its clinical usefulness.',
  objectives: [
    'Define the aim, outcome, predictors and decision threshold of a prediction model before analysing data.',
    'Calculate events per variable and judge how many degrees of freedom the data can support.',
    'Choose and justify a strategy for missing haemoglobin, predictor coding, selection and shrinkage.',
    'Estimate optimism by a bootstrap that replays every modelling step.',
    'Evaluate external validation results through calibration-in-the-large, calibration slope, c statistic and net benefit.',
    'Write a concise, honest account of what the model can and cannot do.'
  ],
  sections: [
    { id: 's1', title: 'Project brief and how to work', html: `
<p>You will build a model that predicts spontaneous or indicated preterm birth (delivery before 37 completed weeks) from information available at the first antenatal visit. All data are synthetic; no real participants are involved.</p>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A district hospital wants to identify, at booking, women whose risk of preterm birth is high enough to justify referral for enhanced antenatal surveillance at the tertiary centre. A tertiary referral hospital in a later period has collected the same variables and wants to know whether the district model can be used there.</p></div>
<h3>The data</h3>
<p>Development data (<code>ptb_dev</code>): <span data-live="ptb_dev_n"></span> women from a district hospital, with <span data-live="ptb_dev_events"></span> preterm births (<span data-live="ptb_dev_incidence"></span>). Validation data (<code>ptb_val</code>): <span data-live="ptb_val_n"></span> women from a tertiary hospital, with <span data-live="ptb_val_events"></span> preterm births (<span data-live="ptb_val_incidence"></span>). Haemoglobin is missing for <span data-live="ptb_hb_missing_pct"></span> of the development women and BMI for <span data-live="ptb_bmi_missing_pct"></span>.</p>
<div data-widget="datasetCard" data-set="ptb_dev"></div>
<ul class="try"><li>Read the codebook and note which variables are binary, which are continuous and which you would expect a clinician to know at the first visit.</li><li>Check the first rows and look at the blank cells in the haemoglobin column.</li></ul>
<div data-widget="datasetCard" data-set="ptb_val"></div>
<ul class="try"><li>Compare the incidence and the age distribution with the development data before any modelling.</li></ul>
<h3>How the project runs</h3>
<p>Work through the ten stages in the next sections in order, using the Analysis Lab (below) for the analysis. Write one or two lines of your decision at each stage; these become your write-up. The rubric and a model answer sketch are at the end. Attempt the project before reading the model answer.</p>
<div data-widget="analysisLab"></div>
<ul class="try"><li>Select <code>ptb_dev</code> and leave every option at its default. Confirm that you can see the coefficient table, the events per variable and the apparent performance.</li></ul>
`},
    { id: 's2', title: 'Stages 1 and 2: aim and sample size', html: `
<h3>Stage 1. Define the aim</h3>
<p>Write down, before opening the Lab, the five elements that frame any prediction model.</p>
<ol>
<li>Decision: whom will the prediction change management for? Here, referral of a woman at booking to enhanced surveillance.</li>
<li>Outcome: preterm birth, delivery before 37 completed weeks, a binary outcome. State when and how it is ascertained, as accurately as in a trial.</li>
<li>Predictors: only those known at the first visit. Variables that appear later in pregnancy would not be available when the decision is made.</li>
<li>Type of model: logistic regression for a binary outcome, producing an absolute risk for each woman.</li>
<li>Threshold: the risk above which referral is worthwhile. A threshold equals harm / (harm + benefit). If the team judges that one unnecessary referral is one quarter as bad as one missed preterm birth is good, the threshold is 1 / (1 + 4) = 20%, which gives threshold odds w = 0.20 / 0.80 = 0.25. Use 20% throughout the project, and state it before you see any result.</li>
</ol>
<div class="callout warn"><b>Critical</b><p>The threshold belongs to the clinical problem, not to the modeller. Do not choose it after seeing where the model performs best; that converts the decision analysis into another form of data dredging.</p></div>
<h3>Stage 2. Check events per variable</h3>
<p>Events per variable (EPV) is the number of events divided by the number of candidate predictor parameters. Count degrees of freedom for every term you will consider: a continuous predictor coded linearly uses 1 df, a restricted cubic spline with 3 knots uses 2 df, with 5 knots uses 4 df, and a categorical variable with k levels uses k − 1 df.</p>
<p>The full candidate set in the Lab has 14 terms; age is coded with a quadratic, so the candidate model has 15 df. With <span data-live="ptb_dev_events"></span> events in all women, the ideal EPV is the number of events divided by 15. When haemoglobin is missing, a complete case analysis leaves <span data-live="ptb_cc_n"></span> women and <span data-live="ptb_cc_events"></span> events.</p>
<div data-widget="epvCalculator"></div>
<ul class="try"><li>Enter the events in all women and 15 candidate df. Then enter the events in complete cases and 15 df. Note how the verdict band changes.</li><li>Reduce the candidate df to 10 and note the events that are required for each band.</li></ul>
<div class="callout key"><b>Key idea</b><p>EPV is judged against the candidate parameters, not the ones that survive selection. An EPV below 10 signals overfitting risk, 10 or more is a minimum, around 20 or more may make shrinkage unnecessary for a prespecified model, and around 50 is needed for reliable data-driven selection.</p></div>
<p>Decision at this stage: state the EPV for your intended model, and state which options in later stages it makes risky (for example, backward selection among 15 df with EPV well under 50).</p>
<p class="src">Source: Ch. 1, Ch. 3, Ch. 5, Ch. 11.</p>
`},
    { id: 's3', title: 'Stage 3: missing haemoglobin', html: `
<p>Haemoglobin is a strong and clinically accepted predictor, but it is missing for <span data-live="ptb_hb_missing_pct"></span> of women. In this cohort it is more often missing in women with fewer antenatal visits and in low socioeconomic status. That pattern is missing at random (MAR): missingness depends on other observed variables. It cannot be proved from the data, but it is the plausible mechanism, and it is the one that multiple imputation handles.</p>
<h3>Options in the Lab</h3>
<table class="data">
<thead><tr><th>Option</th><th>What it does</th><th>Main weakness</th></tr></thead>
<tbody>
<tr><td>Complete case</td><td>Drops women with any missing predictor</td><td>Loses events (lower EPV); biased if missingness is related to the outcome in ways not captured by the model</td></tr>
<tr><td>Single stochastic imputation</td><td>Fills each gap once using other predictors and the outcome, plus random error</td><td>Treats imputed values as real, so standard errors are too small</td></tr>
<tr><td>Multiple imputation (m = 5)</td><td>Five completed datasets, analysed separately and pooled</td><td>More complex; the imputation model must contain the predictors, the outcome and variables that explain missingness</td></tr>
</tbody></table>
<div class="callout warn"><b>Critical</b><p>If you impute, the imputation model must include the outcome (preterm birth) as well as all predictors. Imputing without the outcome weakens the estimated association of the imputed predictor with the outcome. Do not add a "missing" indicator category as a substitute; that approach is biased.</p></div>
<div data-widget="missingDemo"></div>
<ul class="try"><li>Choose MAR depending on Y for X2 with 40% missing. Compare complete case with multiple imputation. Observe the bias in the coefficients under complete case analysis.</li><li>Choose mean imputation and note the effect on the estimated coefficient and its standard error.</li></ul>
<p>Decision at this stage: choose a method and justify it in two sentences, naming the mechanism you assumed and the variables that must be in the imputation model. Then, in the Lab, set the missing-data handling to your choice and note the number of women and events that enter the analysis. Also check, from the imputed values, that they fall in a plausible haemoglobin range (the imputed values should not be physiologically impossible).</p>
<p class="src">Source: Ch. 7.</p>
`},
    { id: 's4', title: 'Stage 4: coding the predictors', html: `
<p>Each continuous predictor needs a functional form chosen without dichotomising. The decision uses subject knowledge first and data only for broad shape. Three predictors deserve attention.</p>
<ul>
<li>Maternal age: risk is expected to be high at both ends of the reproductive range (a U shape). A linear term cannot represent that.</li>
<li>Haemoglobin: risk rises as haemoglobin falls into the anaemic range, with little change at normal values. A straight line over the full range misrepresents this.</li>
<li>BMI: low BMI is associated with higher risk; the effect at higher values is small.</li>
</ul>
<div data-widget="codingExplorer"></div>
<ul class="try"><li>Compare dichotomised age at 35 years with linear, quadratic and a 4-knot spline. Read the model χ² and degrees of freedom of each.</li><li>Reduce the subsample size to 400 and see which flexible codings stay stable.</li></ul>
<p>Compare codings by the likelihood ratio χ² minus 2 × df (an AIC-type comparison), not by the p-value of one term. A spline with more knots always fits the sample better; the question is whether the gain exceeds its cost in degrees of freedom. With a limited number of events, give flexibility only to predictors whose effects are likely to be non-linear and strong, as spending df on every predictor lowers EPV.</p>
<div class="callout warn"><b>Critical</b><p>Dichotomising a continuous predictor, particularly at a cutpoint selected from the same data, discards information and biases the estimate. Do not report a model built on data-chosen cutpoints as if the cutpoints were known in advance.</p></div>
<p>Decision at this stage: record the coding for age, haemoglobin and BMI, with the df each uses and the total candidate df that results. Return to Stage 2 and recompute EPV if your total changed. Four variables in the data (antenatal visit count, fetal sex, season of conception and height) are of doubtful relevance as predictors of preterm birth; decide, on subject-matter grounds and before looking at their coefficients, whether they belong among the candidates.</p>
<p class="src">Source: Ch. 9, Ch. 10, Ch. 12.</p>
`},
    { id: 's5', title: 'Stages 5 and 6: strategy and shrinkage', html: `
<h3>Stage 5. Choose the modelling strategy</h3>
<p>The options are a prespecified full model (all candidates, no selection) or backward elimination with a stated stopping rule. The trade-off is as follows.</p>
<table class="data">
<thead><tr><th>Strategy</th><th>For</th><th>Against</th></tr></thead>
<tbody>
<tr><td>Full prespecified model</td><td>No selection bias; stable; standard errors are valid; asks one question (the coefficients)</td><td>Larger model; includes weak or irrelevant predictors</td></tr>
<tr><td>Backward, p &lt; 0.05</td><td>Smaller model; easy to replay in a bootstrap</td><td>Unstable selection; coefficients of retained predictors biased upwards (testimation); may drop true weak predictors</td></tr>
<tr><td>Backward, AIC-like (p ≈ 0.157)</td><td>Less underfitting than p &lt; 0.05</td><td>Same instability, in less extreme form</td></tr>
</tbody></table>
<div data-widget="stepwiseInstability"></div>
<ul class="try"><li>Run 100 bootstraps with backward p &lt; 0.05 at a sample size of 500. Note the selection frequency of predictors with weak effects and of the four noise candidates.</li><li>Repeat at 1600 and observe how much more stable selection becomes with more events.</li></ul>
<p>A smaller model does not reduce overfitting if the selection itself was driven by the data. Overfitting depends on the number of candidates examined, not the number retained. Default to the full prespecified model unless a practical reason (for example, a measurement is costly) argues for a smaller one; if you do select, plan to replay the selection in the bootstrap.</p>
<h3>Stage 6. Shrinkage</h3>
<p>Maximum likelihood coefficients are, on average, too extreme for new patients. Shrinkage pulls them towards zero. Two options exist in the Lab: uniform shrinkage by a bootstrap-estimated factor, and a ridge penalty with strength λ. Uniform shrinkage multiplies all coefficients by one factor s; the heuristic estimate is s = (model χ² − df) / model χ², with df equal to the candidate degrees of freedom. After shrinking, the intercept must be re-estimated so that the mean predicted risk matches the observed incidence.</p>
<div data-widget="shrinkageLab"></div>
<ul class="try"><li>At a development subsample of 400, run 30 replications and compare the mean calibration slope for standard maximum likelihood, uniform shrinkage and ridge.</li><li>At 1500, repeat and note how much shrinkage helps when events are plentiful.</li></ul>
<p>Shrinkage changes calibration far more than discrimination; the c statistic is almost unchanged, but the calibration slope moves towards 1.</p>
<p>Decision at these stages: state your strategy and shrinkage method in the Lab and the reason for each. Run the analysis and record the coefficient table, the model χ², the df, the EPV and the apparent c.</p>
<p class="src">Source: Ch. 11, Ch. 13.</p>
`},
    { id: 's6', title: 'Stage 7: bootstrap optimism', html: `
<p>The apparent c and calibration slope from Stage 6 are measured in the same women who built the model, so they are optimistic. The bootstrap estimates by how much.</p>
<ol>
<li>Develop the model in the original sample and record its apparent performance.</li>
<li>Draw a bootstrap sample of the same size, with replacement.</li>
<li>Repeat every modelling step in this sample: imputation, coding choices, selection and shrinkage. Record performance in the bootstrap sample (apparent) and then in the original sample (test).</li>
<li>Optimism = apparent in bootstrap sample − test in original sample.</li>
<li>Repeat at least 100 times and average the optimism.</li>
<li>Subtract the mean optimism from the apparent performance of the original model.</li>
</ol>
<div class="callout warn"><b>Critical</b><p>The bootstrap only measures the optimism of your strategy if the strategy is replayed in full in each sample. If you pick predictors or cutpoints by looking at the data first and then run a bootstrap on the final model alone, the optimism is understated.</p></div>
<div data-widget="optimismSim"></div>
<ul class="try"><li>Set n to 500, incidence 12%, 3 true predictors and 20 noise predictors, then run 40 simulations. Compare apparent and honest c.</li><li>Repeat with 2 noise predictors and watch EPV and the gap shrink.</li></ul>
<p>In the Analysis Lab set B between 100 and 200 and run the optimism-corrected performance. Record the apparent c, the optimism-corrected c, the optimism, and the corrected calibration slope. For the full 14-term model on the course data, the apparent c is <span data-live="ptb_full_apparent_c"></span>, the corrected c is <span data-live="ptb_full_corrected_c"></span>, the optimism is <span data-live="ptb_full_optimism_c"></span> and the shrinkage implied by the corrected slope is <span data-live="ptb_full_shrinkage"></span>. Your own result will differ if you chose a different strategy; compare the two.</p>
<p>Decision at this stage: report corrected performance, not apparent performance, as your internal estimate. State what the size of the optimism tells you about whether your model was too large for its data.</p>
<p class="src">Source: Ch. 5, Ch. 17.</p>
`},
    { id: 's7', title: 'Stages 8 and 9: external validation and decision curve', html: `
<h3>Stage 8. External validation</h3>
<p>Apply your final fixed model, with its shrunken coefficients and intercept, to <code>ptb_val</code> without refitting anything. In the Lab, use the external validation panel. Four numbers matter.</p>
<ul>
<li>Calibration-in-the-large: intercept a with the linear predictor as offset; ideal 0. A positive value means the model under-predicts.</li>
<li>Calibration slope b: ideal 1. Below 1 means predictions are too extreme, which can reflect overfitting or genuinely weaker predictor effects in the new setting.</li>
<li>c statistic with its confidence interval.</li>
<li>Net benefit at your pre-declared threshold.</li>
</ul>
<p>Haemoglobin is also missing in a small share of the validation women (about 5%), completely at random; handle it by imputation using the variables of the development model, without refitting the model.</p>
<p>The reported performance in this validation set is c = <span data-live="ptb_val_c"></span>, calibration slope <span data-live="ptb_val_slope"></span> and calibration-in-the-large <span data-live="ptb_val_citl"></span> for the 14-term model. These are provided so you can compare your own model with the course reference model.</p>
<div data-widget="calibrationLab"></div>
<ul class="try"><li>Set true slope 0.8 and intercept shift 0.5, n = 1200. Observe what such a calibration plot looks like and the verdict.</li></ul>
<div data-widget="caseMixLab"></div>
<ul class="try"><li>Compare the scenario "overfitted slope 0.8" with "more severe z". Note which scenario shifts calibration-in-the-large and which shifts the slope.</li></ul>
<p>Interpret changes against causes. A higher incidence in the tertiary hospital and an older, higher-risk population shift calibration-in-the-large. Weaker predictor effects lower the slope. Overfitting in development lowers the slope as well, and so it is useful to compare with your corrected slope from Stage 7. Discrimination is the least sensitive of the four to a shift in the intercept.</p>
<div class="callout warn"><b>Critical</b><p>Do not alter the model after seeing the validation result and then report the revised model's validation performance as external. Once you refit or recalibrate in <code>ptb_val</code>, those data have become development data. Updating methods lie outside this course.</p></div>
<h3>Stage 9. Decision curve</h3>
<p>Net benefit at threshold p<sub>t</sub> is NB = (TP − w × FP) / N with w = p<sub>t</sub> / (1 − p<sub>t</sub>). Compare the model with treating everyone and treating no one (NB = 0).</p>
<div data-widget="nbCalculator"></div>
<ul class="try"><li>Keep the prefilled preterm birth example. Change the threshold from 10% to 30% and note how the weight of false positives changes and which policy is best.</li></ul>
<div data-widget="decisionCurveLab"></div>
<ul class="try"><li>Set a calibration shift (CITL) of +1.0 and look at the model's curve relative to treat all. Then set the slope to 0.6.</li></ul>
<p>In the Lab, read the decision curve for the external validation, mark your 20% threshold, and state whether the model beats both default policies there and whether the useful range of thresholds is wide or narrow. If calibration is poor, net benefit can fall below the default policies even when the c statistic looks acceptable.</p>
<p class="src">Source: Ch. 15, Ch. 16, Ch. 17, Ch. 19.</p>
`},
    { id: 's8', title: 'Stage 10: write-up and self-assessment', html: `
<h3>Write-up</h3>
<p>Write a one-page report with these headings. Use plain words and give numbers with their uncertainty.</p>
<ol>
<li>Purpose and decision the model supports, with the declared threshold.</li>
<li>Data: sources, outcome definition, sample size, events, missing data and how it was handled.</li>
<li>Methods: candidate predictors and their coding, strategy, shrinkage, and how optimism was estimated.</li>
<li>Final model: the coefficients, the intercept and the coding, enough for someone to compute a risk.</li>
<li>Performance: apparent, optimism-corrected, and external (calibration-in-the-large, slope, c with interval, net benefit).</li>
<li>Limitations: events per variable, differences between the two hospitals, what was not validated.</li>
<li>Presentation: how a clinician would use it (formula, nomogram or score chart) and what is lost if a score chart is used.</li>
</ol>
<div class="callout key"><b>Key idea</b><p>A prediction model is judged on whether its predictions are valid in the setting where it will be used. A credible write-up reports the performance that was honestly estimated, not the best performance that was observed.</p></div>
<h3>Self-assessment rubric</h3>
<p>Score each row 0 (absent), 1 (partly) or 2 (fully). A total of 18 to 24 indicates a well-conducted project; below 12, return to the stages with the lowest scores.</p>
<table class="data">
<thead><tr><th>Criterion</th><th>2 points when</th></tr></thead>
<tbody>
<tr><td>1. Aim and threshold</td><td>Decision, outcome, predictors available at booking and a threshold with its harm:benefit reasoning are stated before analysis.</td></tr>
<tr><td>2. Sample size</td><td>EPV is calculated from candidate df, including spline and quadratic terms, and its consequence is stated.</td></tr>
<tr><td>3. Missing data</td><td>Mechanism is named, method justified, imputation model includes the outcome, and events retained are reported.</td></tr>
<tr><td>4. Coding</td><td>Continuous predictors are not dichotomised; non-linear forms are chosen with an AIC-type comparison and a df budget.</td></tr>
<tr><td>5. Strategy</td><td>Candidates are restricted using subject knowledge before outcome analysis; selection, if used, is justified and replayed.</td></tr>
<tr><td>6. Shrinkage</td><td>A shrinkage method is applied and the intercept is re-estimated; the heuristic factor uses candidate df.</td></tr>
<tr><td>7. Optimism</td><td>Bootstrap with at least 100 replications replays every step; corrected performance is reported, not only apparent.</td></tr>
<tr><td>8. External validation</td><td>Model is applied unchanged; calibration-in-the-large, slope, c with interval and net benefit are all reported and interpreted by cause.</td></tr>
<tr><td>9. Decision curve</td><td>Net benefit is compared with treat all and treat none at the declared threshold, and the effect of calibration is discussed.</td></tr>
<tr><td>10. Write-up</td><td>Contains the full formula with intercept and coding, honest limitations and no claim beyond the validation done.</td></tr>
<tr><td>11. Critical errors avoided</td><td>No refitting in the validation data presented as validation; no data-chosen cutpoints; no missing-indicator method; no apparent performance as the headline.</td></tr>
<tr><td>12. Clarity</td><td>The report is short, precise and understandable to a clinician who has not seen the analysis.</td></tr>
</tbody></table>
`}
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
      why: 'Candidate df = 13 single-df terms + 3 df for the spline = 16, so EPV = 90 / 16 = 5.6. Counting predictors (14) rather than parameters is the commonest error. Dividing by the spline df alone ignores the other terms.' },
    { q: 'Haemoglobin is missing in 15% of women, more often in women with few antenatal visits and low socioeconomic status. Which approach is most defensible?',
      options: ['Multiple imputation using all predictors, the outcome and antenatal visits and socioeconomic status', 'Complete case analysis, because 85% of values are available', 'Replace missing values with the mean haemoglobin', 'Add a "missing" category for haemoglobin'],
      answer: 0,
      why: 'Missingness depends on observed variables (MAR), so imputation using those variables and the outcome is appropriate. Complete case analysis loses events and ignores the pattern; mean imputation shrinks variability and the association; the missing indicator method is biased. The 85% figure refers to values, but the share of women with all values complete is smaller.' },
    { q: 'A team selects predictors by backward elimination in the whole sample, then bootstraps only the final model and reports a small optimism. What is wrong?',
      options: ['Bootstrap cannot be used with logistic regression', 'The number of bootstrap samples was too large', 'Optimism should be calculated in the bootstrap sample only', 'Selection was not replayed in each bootstrap sample, so optimism is understated'],
      answer: 3,
      why: 'Selection uses the outcome and contributes to optimism. Each bootstrap sample must repeat the selection. The bootstrap works with logistic models, and more replications do not bias it. Optimism is the difference between apparent performance in the bootstrap sample and test performance in the original sample.' },
    { q: 'In an external validation, c is 0.70 (corrected development value 0.72), the calibration slope is 0.75, and calibration-in-the-large is +0.5. Which conclusion is best?',
      options: ['The model is valid because c barely changed', 'Predictions are too extreme and, on average, too low in this hospital, so the model needs caution before use there', 'The model should be refitted in the validation data and reported as externally validated', 'Only the slope matters; calibration-in-the-large can be ignored'],
      answer: 1,
      why: 'A slope below 1 means too extreme predictions; a positive intercept means under-prediction on average, consistent with higher incidence. A stable c does not show good calibration. Refitting in the validation data makes them development data. Both calibration measures matter for decisions.' },
    { q: 'At a 20% threshold in a validation sample of 400 women, the model gives TP = 50 and FP = 90. What is the net benefit?',
      options: ['50 / 400 = 0.125', '(50 − 90) / 400 = −0.100', '(50 − 0.25 × 90) / 400 = 0.069', '(50 − 0.20 × 90) / 400 = 0.080'],
      answer: 2,
      why: 'The weight is the threshold odds, 0.20 / 0.80 = 0.25, so NB = (50 − 22.5) / 400 = 0.069. Ignoring false positives gives 0.125; using weight 1 treats a false positive as equal to a missed case; using the probability 0.20 as the weight is the common mistake.' },
    { q: 'A prespecified model has 15 candidate df and model χ² of 45. Backward selection later keeps terms using 6 df with χ² 38. Which shrinkage factor is correct for the selected model?',
      options: ['(38 − 6) / 38 = 0.84', '(45 − 15) / 45 = 0.67', '(45 − 6) / 45 = 0.87', '1.0, because selection removes noise'],
      answer: 1,
      why: 'The heuristic must use the candidate df and the χ² of the full candidate model, because selection also capitalised on chance. Using the retained model understates the overfitting. Selection does not remove the need for shrinkage.' }
  ],
  tasks: [
    { id: 't1', title: 'Hand calculation: sample size, shrinkage and net benefit', level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A district hospital develops a preterm birth model in 1000 women with 120 preterm births. The candidate set has 12 predictors, one of which (age) is coded with a quadratic, so there are 13 candidate df. The full model has likelihood ratio χ² = 60 with 13 df, and the maternal haemoglobin coefficient is 0.80 per g/dL below 11. The model is later applied in 400 women at a tertiary centre with 70 preterm births. At a 20% threshold it gives 50 true positives and 90 false positives.</p>`,
      questions: [
        '<b>(a)</b> Calculate the EPV and say which events would be needed to reach EPV 10 and EPV 20.',
        '<b>(b)</b> Calculate the heuristic uniform shrinkage factor and the shrunken haemoglobin coefficient. What must be done with the intercept?',
        '<b>(c)</b> Calculate the net benefit of the model and of treating all at the 20% threshold in the tertiary sample. Which policy is best?'
      ],
      answer: `<p><b>(a)</b> EPV = 120 / 13 = 9.2, just below the minimum of 10 and well below 20. EPV 10 needs 13 × 10 = 130 events; EPV 20 needs 13 × 20 = 260 events. The model is at risk of overfitting and shrinkage is advisable.</p>
<p><b>(b)</b> s = (60 − 13) / 60 = 47 / 60 = 0.783. Shrunken coefficient = 0.80 × 0.783 = 0.627. All coefficients are multiplied by the same factor, and the intercept must then be re-estimated (with the shrunken linear predictor as an offset) so that the mean predicted risk equals the observed incidence; multiplying the linear predictor alone leaves calibration-in-the-large wrong.</p>
<p><b>(c)</b> Threshold odds w = 0.20 / 0.80 = 0.25. Model: NB = (50 − 0.25 × 90) / 400 = 27.5 / 400 = 0.069. Treat all: incidence = 70 / 400 = 0.175, NB = 0.175 − 0.825 × 0.25 = 0.175 − 0.206 = −0.031. Treat none: NB = 0. The model is best: its net benefit is positive and about 0.10 above treating all. Interpretation: per 100 women, using the model yields about 6.9 net true positives (preterm births correctly referred, after weighting the unnecessary referrals), whereas referring everyone yields a net loss.</p>` },
    { id: 't2', title: 'Full project in the Analysis Lab', level: 'Evaluate',
      scenario: `<p>Open the Analysis Lab and carry out the ten stages on <code>ptb_dev</code>, with external validation on <code>ptb_val</code>. Use a 20% referral threshold. Record your decision and the key numbers at every stage, and finish with the one-page write-up. Then score yourself with the rubric.</p>`,
      questions: [
        '<b>(a)</b> Give your EPV and your chosen coding for age, haemoglobin and BMI, with the total candidate df.',
        '<b>(b)</b> State your missing-data method, strategy and shrinkage method, with one sentence of justification each.',
        '<b>(c)</b> Report apparent c, optimism-corrected c and corrected calibration slope.',
        '<b>(d)</b> Report external calibration-in-the-large, slope, c with interval and net benefit at 20%, and interpret each cause.',
        '<b>(e)</b> Write the final one-page report and score yourself with the rubric.'
      ],
      answer: `<p>Model answer sketch. Your numbers will depend on your choices; the pattern is what to check.</p>
<ol>
<li><b>Aim.</b> Decision: refer at booking to enhanced surveillance; outcome preterm birth before 37 weeks; predictors available at the first visit; threshold 20% (harm:benefit 1:4, w = 0.25), declared before analysis.</li>
<li><b>EPV.</b> Full candidate model has 15 df. With <span data-live="ptb_dev_events"></span> events in all women, EPV is the events divided by 15; in complete cases (<span data-live="ptb_cc_events"></span> events) it is lower. If you give haemoglobin or BMI a spline, add its df and recompute. The data-generating truth, revealed here for teaching, is that antenatal visits, fetal sex, season of conception and height have no effect. If you dropped them on subject-matter grounds before analysis, the candidate df falls and EPV improves.</li>
<li><b>Missing haemoglobin.</b> MAR on antenatal visits and socioeconomic status. Multiple imputation (m = 5) with predictors, outcome and those two variables; complete case analysis loses events and risks bias. Single stochastic imputation is acceptable for point estimates but understates standard errors.</li>
<li><b>Coding.</b> The data-generating process, which is revealed here for teaching, has a U-shaped age effect (a quadratic captures it), a risk that rises below haemoglobin 11 g/dL and a rise below BMI 20. A linear age term is clearly inferior and dichotomised age is poorest, as the model χ² in the coding explorer shows. A 3-knot spline for haemoglobin and BMI is a reasonable, df-economical choice; a linear term for each gives a poor but not disastrous fit. Compare by χ² − 2 df.</li>
<li><b>Strategy.</b> A prespecified model with subject-matter restriction is preferred. If you select (p &lt; 0.05), the selection frequencies from the stepwise lab show unstable inclusion of weak true predictors and sporadic inclusion of the noise candidates; that instability is the reason to avoid it with this EPV.</li>
<li><b>Shrinkage.</b> Uniform bootstrap shrinkage or ridge. The factor is below 1 and, for the full model, is about <span data-live="ptb_full_shrinkage"></span>. The c statistic hardly changes; calibration slope improves in the validation setting; the intercept is re-estimated.</li>
<li><b>Optimism.</b> Apparent c for the full 14-term model is <span data-live="ptb_full_apparent_c"></span>, corrected c <span data-live="ptb_full_corrected_c"></span>, optimism <span data-live="ptb_full_optimism_c"></span>. Optimism comes from selection as well as from estimation, so both must be replayed in each bootstrap sample. Report corrected values.</li>
<li><b>External validation.</b> The validation hospital has higher incidence, an older and higher-risk case-mix and predictor effects about 20% weaker. Expect a positive calibration-in-the-large (under-prediction on average), a calibration slope below 1 (weaker true effects plus any development overfitting) and a c statistic of the same order as the corrected development value, possibly somewhat lower (reference model: c <span data-live="ptb_val_c"></span>, slope <span data-live="ptb_val_slope"></span>, calibration-in-the-large <span data-live="ptb_val_citl"></span>). Interpret the intercept as a setting difference, and the slope as weaker effects plus overfitting. The model should not be refitted and re-labelled as validated.</li>
<li><b>Decision curve.</b> At 20%, the model should show higher net benefit than treat all and treat none over a range of thresholds; the under-prediction at the tertiary hospital narrows that range and may lower net benefit compared with the development setting, even though c is stable.</li>
<li><b>Write-up.</b> Includes the full coefficients, intercept and coding; corrected rather than apparent performance; EPV and the differences between hospitals as limitations; and no claim of use in other settings.</li>
</ol>
<p>Rubric check: lowest-scoring items for most learners are 2 (EPV counted by predictors rather than df), 3 (outcome omitted from imputation model) and 7 (selection not replayed). Items 1 and 11 relate to critical errors.</p>` },
    { id: 't3', title: 'Critique a published-style preterm birth model study', level: 'Analyze',
      scenario: `<p>Illustrative (synthetic). A group reports a preterm birth prediction model. Methods as described: 300 women at one district hospital, 36 preterm births. Forty candidate variables were screened by univariate p-value, and those with p &lt; 0.10 were entered into a backward stepwise logistic model, leaving 7 predictors. Haemoglobin (missing in 30%) was dichotomised at 11 g/dL and women with missing values were excluded. The reported c statistic was 0.86 in the same 300 women, and the model was called validated because a Hosmer-Lemeshow test was not significant (p = 0.51). The authors recommend a risk of 50% or more as the referral threshold and report accuracy of 91%. They then present the model for use in tertiary hospitals.</p>`,
      questions: [
        '<b>(a)</b> List every flaw, grouped as critical or serious, with the principle each violates.',
        '<b>(b)</b> State what analysis you would do instead, in order.'
      ],
      answer: `<p><b>(a) Flaws</b></p>
<ul>
<li><b>Critical: sample size.</b> With 36 events and 40 candidates, EPV is below 1. Even the 7 retained predictors give EPV about 5. The model is very likely overfitted.</li>
<li><b>Critical: apparent performance as validation.</b> c = 0.86 is measured in the development women. There is no internal validation (bootstrap with all steps replayed) and no external validation, so the figure is optimistic by an unknown, probably large amount.</li>
<li><b>Critical: univariate screening plus stepwise selection.</b> Both are data-driven and both capitalise on chance; coefficients of retained predictors are biased upwards (testimation) and the selected set would be unstable.</li>
<li><b>Serious: missing data.</b> Excluding the 30% with missing haemoglobin removes about 30% of women and events (or more if missingness relates to the outcome); imputation including the outcome should have been used.</li>
<li><b>Serious: dichotomising haemoglobin.</b> This discards information; the risk is expected to change smoothly with haemoglobin.</li>
<li><b>Serious: Hosmer-Lemeshow test.</b> A non-significant result in a small development sample reflects low power, and is not evidence of good calibration. Calibration-in-the-large and slope, with a calibration plot, are needed.</li>
<li><b>Serious: threshold and accuracy.</b> A 50% cutoff implies that a false positive is as bad as a missed case, which is rarely true for a referral decision. With 12% incidence, accuracy of 91% is reachable by classifying everyone as low risk (88%); accuracy is misleading. Net benefit at a threshold from the decision context is needed.</li>
<li><b>Serious: transportability.</b> A model built in one district hospital is proposed for tertiary hospitals, with a different case-mix and incidence, without any validation there.</li>
<li><b>Not reported:</b> shrinkage; the full model formula with intercept and coding; completeness of data per predictor.</li>
</ul>
<p><b>(b) Better analysis</b></p>
<ol>
<li>Fix the aim, outcome and threshold; restrict candidates by subject knowledge to a number the 36 events support (the data would allow about 3 df at EPV 10, and honestly the sample is too small for a multivariable model; collect more data).</li>
<li>Impute haemoglobin and BMI with the outcome in the imputation model; keep continuous predictors continuous.</li>
<li>Fit a prespecified model, apply shrinkage and re-estimate the intercept.</li>
<li>Estimate optimism with a bootstrap that replays all steps; report corrected c and slope.</li>
<li>Validate in a tertiary-hospital sample with at least 100 events, reporting calibration-in-the-large, slope, c with interval and net benefit at the declared threshold.</li>
</ol>` }
  ]
});
