registerModule({
  id: 'm05',
  num: 5,
  part: 'Development',
  title: 'Missing values',
  book: 'Ch. 7 and 8',
  minutes: 80,
  summary: 'How missing predictor values waste information and can bias a prediction model, the MCAR, MAR and MNAR mechanisms, and how to build and use single and multiple imputation correctly.',
  objectives: [
    'Calculate the loss of patients and events under complete case analysis and compare it with the share of values actually missing.',
    'Classify a missing-data situation as MCAR, MAR (on x or on y) or MNAR, and state which can be tested.',
    'Predict when complete case analysis gives biased regression coefficients.',
    'Distinguish mean, conditional mean, stochastic and multiple imputation, and pool multiply imputed estimates with Rubin’s rules.',
    'Specify an imputation model that includes all predictors, auxiliary variables and the outcome.',
    'Evaluate how missing data were handled and reported in a prediction study.'
  ],
  sections: [
    {
      id: 's1',
      title: 'Why missing values matter',
      html: `
<p>Most routinely collected maternal and child health data have gaps: a haemoglobin result not filed, a BMI not recorded at booking, a urine culture not sent. This module concerns missing values of <b>predictors</b> (X) in a model for a single outcome (Y), where a true value exists but is hidden.</p>
<p>Standard regression software silently performs a <b>complete case (CC) analysis</b>: any patient with a missing value on any predictor in the model is dropped. An <b>available case analysis</b> uses, for each analysis, the patients complete for the variables in that analysis, so numbers vary between analyses. Both discard information from patients who have some but not all values. Missing data cause three problems:</p>
<ol>
<li><b>Inefficiency</b>: fewer patients and events, wider confidence intervals, more overfitting.</li>
<li><b>Difficult interpretation</b>: if a univariate OR is based on 450 women and an adjusted OR on 250, a change between them may reflect confounding or merely the different selection of women.</li>
<li><b>Possible bias</b> in coefficients and predictions, especially when missingness is related to the outcome.</li>
</ol>
<div class="callout eg"><b>Worked example (book example, hypothetical data)</b>
<p>500 patients, 100 events, a model with 5 predictors: EPV = 100/5 = 20. Each predictor has 10% missing values and no patient misses more than one value.</p>
<ol>
<li>Patients with a missing value: 5 × 10% = 50%, so CC analysis keeps 250 patients and (if missingness is unrelated to outcome) about 50 events: EPV falls from 20 to 10.</li>
<li>Values available: 250 complete patients × 5 + 250 incomplete patients × 4 = 1,250 + 1,000 = 2,250 of 2,500 required, i.e. 90%.</li>
<li>So 10% of values are missing, yet 50% of patients are discarded.</li>
</ol>
<p>If missing values occur independently of each other, overlap within patients makes the loss smaller: the expected complete share is (1 − m)<sup>k</sup> for k predictors each with a fraction m missing; here 0.9<sup>5</sup> = 59%.</p></div>
<div data-widget="completeCaseLoss"></div>
<ul class="try">
<li>Set k = 5 and 10% missing. Compare the complete share when missingness is independent (59%) with the share when each patient misses at most one value (50%, as in the worked example). Note how EPV changes.</li>
<li>Keep 10% missing and increase k to 15. Observe how quickly the complete share falls.</li>
<li>Set k = 10 and lower missingness to 3% per predictor. Note that even small per-variable missingness costs many patients when there are many predictors.</li>
</ul>
<div class="callout mch"><b>Course data set (synthetic)</b><p>In the preterm-birth development cohort (<span data-live="ptb_dev_n"></span> women), Hb is missing for <span data-live="ptb_hb_missing_pct"></span> and BMI for <span data-live="ptb_bmi_missing_pct"></span>. A complete case analysis of the 14-term model keeps <span data-live="ptb_cc_n"></span> women with <span data-live="ptb_cc_events"></span> preterm births.</p></div>
<div data-widget="datasetCard" data-set="ptb_dev"></div>
<p class="src">Source: Ch. 7, §7.1, Table 7.1</p>`
    },
    {
      id: 's2',
      title: 'Missing data mechanisms: MCAR, MAR and MNAR',
      html: `
<p>Methods for handling missing values rely on assumptions about why values are missing. The terminology is standard, though confusing at first.</p>
<table class="data">
<thead><tr><th>Mechanism</th><th>Definition</th><th>MCH example (illustrative)</th><th>Testable?</th></tr></thead>
<tbody>
<tr><td><b>MCAR</b>: missing completely at random</td><td>Missingness unrelated to any patient characteristic or outcome; the incomplete records are a random subset.</td><td>Hb results lost for two weeks because the laboratory analyser broke down.</td><td>Yes; often rejected in medical data.</td></tr>
<tr><td><b>MAR</b>: missing at random</td><td>Missingness depends only on <b>observed</b> variables: other predictors, time or place ("MAR on x"), or the outcome ("MAR on y"), not on the missing value itself once these are accounted for.</td><td>Hb more often missing in women with few antenatal visits and low socio-economic status, both recorded in the data set. Also MAR by design: a test deliberately not done in a recorded low-risk group.</td><td>No; it cannot be tested.</td></tr>
<tr><td><b>MNAR</b>: missing not at random</td><td>Missingness depends on the unobserved value itself or on characteristics not available in the analysis.</td><td>Tobacco use left blank more often by women who do use tobacco; or a test not done when the clinician judged risk low on grounds that were not recorded.</td><td>No; it always remains possible.</td></tr>
</tbody></table>
<p>Under MCAR the patients with complete data are representative of all patients. Under MAR they are not, but the missingness can be modelled from observed information, which is what imputation does. Under MNAR no method using only the observed data can fully repair the problem.</p>
<div class="callout key"><b>Key idea: MAR on y in prospective studies</b><p>If all predictors are recorded before the outcome is known, as in a booking-to-delivery cohort, missingness cannot depend on the outcome directly. An observed association between missingness and outcome must then run through other characteristics. If those characteristics are recorded, the situation is MAR on x; if they are not, it is MNAR.</p></div>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>In a cohort, women with a missing booking Hb have a higher preterm-birth rate. Hb was measured at booking, before delivery, so the outcome itself cannot have caused the missingness. A plausible path is that fewer antenatal visits lead both to a missing Hb and (through other factors) to preterm birth. If antenatal visits are recorded, the imputation model should include them.</p></div>
<p class="src">Source: Ch. 7, §7.1.3, Table 7.2; §7.2; §7.7.1</p>`
    },
    {
      id: 's3',
      title: 'What complete case analysis does to the coefficients',
      html: `
<p>The book illustrates the consequences with a simple simulation. The outcome is continuous, <span class="m">Y = 1 × X1 + 1 × X2 + error</span>, with X1 and X2 independent standard normal variables and standard normal error. Values of X1 are then deleted by four mechanisms and the model is refitted in complete cases.</p>
<table class="data">
<thead><tr><th>Mechanism for missing X1</th><th>How it was simulated</th><th>CC estimates of b1, b2</th></tr></thead>
<tbody>
<tr><td>MCAR</td><td>At random</td><td>1, 1 (unbiased)</td></tr>
<tr><td>MAR on x</td><td>X1 more often missing at low X2</td><td>1, 1 (unbiased)</td></tr>
<tr><td>MAR on y</td><td>X1 more often missing at high Y</td><td><b>0.82, 0.82 (both biased)</b></td></tr>
<tr><td>MNAR</td><td>X1 more often missing at low X1</td><td>1, 1 (unbiased)</td></tr>
</tbody></table>
<p>Two lessons follow.</p>
<ul>
<li><b>Dependence of missingness on the outcome is the dangerous case.</b> It biased not only b1, for the incomplete predictor, but also b2, for the complete predictor. In the book's later simulation with five predictors, MAR on y for one predictor was enough to bias all five coefficients.</li>
<li><b>Selection on X does not bias coefficients that condition on X.</b> Regression estimates are conditional on the predictor values, so selecting patients by X1 (even MNAR on X1) left b1 and b2 unbiased here.</li>
</ul>
<div class="callout warn"><b>Pitfall: unbiased coefficients are not the whole story</b><p>Even when CC coefficients are unbiased, CC analysis is inefficient, and its estimate of predictive performance can be wrong: performance is assessed on a selected, narrower spectrum of patients, which in the simulations gave lower adjusted R² than in the full population. And in real data it is rarely possible to be sure that missingness is unrelated to the outcome.</p></div>
<div data-widget="missingDemo"></div>
<ul class="try">
<li>Choose MCAR with 30% missing and run 200 simulations with complete case analysis. Compare the mean β1 and β2 with the true value 1, and note the mean SE.</li>
<li>Switch to MAR depending on Y with the same percentage and method. Check whether β1 and β2 move away from 1.</li>
<li>Keep MAR depending on Y and switch the method to multiple imputation (m = 5, with Y). Compare bias and SE with complete case analysis.</li>
<li>Choose MNAR depending on X2 and compare complete case analysis with multiple imputation.</li>
</ul>
<p class="src">Source: Ch. 7, §7.2, Fig. 7.1; §7.5</p>`
    },
    {
      id: 's4',
      title: 'Imputation methods',
      html: `
<p><b>Imputation</b> fills in missing values with plausible values so that the completed data can be analysed with standard methods. Two sophisticated approaches are generally preferred over CC analysis: maximum likelihood methods and multiple imputation; the book concentrates on imputation as the practical approach.</p>
<table class="data">
<thead><tr><th>Label</th><th>Information used</th><th>Approach</th></tr></thead>
<tbody>
<tr><td>CC</td><td>None</td><td>Complete case analysis: patients with missing values are excluded.</td></tr>
<tr><td>Mean (simple)</td><td>None</td><td>Replace a missing value by the overall mean (or the most frequent category).</td></tr>
<tr><td>CM</td><td>X only</td><td>Single imputation with the <b>conditional mean</b>, the value predicted from a regression on other predictors ("regression imputation").</td></tr>
<tr><td>SI</td><td>X + Y</td><td>Single <b>stochastic regression imputation</b>: a random draw from the predictive distribution of the imputation model.</td></tr>
<tr><td>MI</td><td>X + Y</td><td><b>Multiple imputation</b>: the random draw is repeated, for example 5 times, giving m completed data sets.</td></tr>
</tbody></table>
<h3>Simple mean imputation</h3>
<p>Imputing the mean ignores the correlation of the incomplete predictor with other predictors and underestimates the variability of the predictor among patients. It is generally suboptimal.</p>
<h3>Conditional mean (regression) imputation</h3>
<p>An imputation model predicts the missing predictor from other variables. When the correlation is strong this works well: in 566 patients with head injury, Hb could be predicted from haematocrit and sex with R² = 0.97. In MCH data, a missing Hb could similarly be predicted from a recorded haematocrit.</p>
<h3>Stochastic regression imputation</h3>
<p>Instead of the predicted value, a random draw from the distribution of predicted values is imputed. The random element acknowledges that the imputed value is uncertain, which matters most when the imputation model predicts poorly.</p>
<h3>Multiple imputation and Rubin's rules</h3>
<p>MI creates m completed data sets with independent random draws. When several predictors are missing, imputation proceeds iteratively (data augmentation) until convergence. Each completed data set is analysed as if complete, and results are combined:</p>
<div class="formula">Point estimate: b̄ = mean of b<sub>m</sub> over the M data sets</div>
<div class="formula">Var(b̄) = W + (1 + 1/M) × B, with W = mean of var(b<sub>m</sub>) and B = Σ (b<sub>m</sub> − b̄)² / (M − 1)</div>
<p>W is the within-imputation variance (ordinary sampling uncertainty); B is the between-imputation variance, which reflects uncertainty about the imputed values. B is what single imputation ignores, so SI understates standard errors.</p>
<div class="callout eg"><b>Worked example (Illustrative, synthetic)</b>
<p>Three imputations give coefficients for low Hb of 0.60, 0.66 and 0.63, each with SE 0.10.</p>
<ol>
<li>b̄ = (0.60 + 0.66 + 0.63) / 3 = 0.63.</li>
<li>W = mean of SE² = 0.01.</li>
<li>B = [(−0.03)² + (0.03)² + 0²] / 2 = 0.0009.</li>
<li>Var = 0.01 + (1 + 1/3) × 0.0009 = 0.01 + 0.0012 = 0.0112; SE = √0.0112 = 0.106, about 6% larger than the within-imputation SE alone.</li>
</ol></div>
<p><b>How many imputations?</b> M is usually 5 or 10. With M = 10 the factor (1 + 1/M) is 1.1 and the within-imputation variance dominates. Rubin found that with 50% missing data, five imputations give an SD only 5% wider than an infinite number; other simulations suggest M can be as low as 3 with 20% missing. M = 1 is single stochastic imputation.</p>
<p class="src">Source: Ch. 7, §7.3, Table 7.3, Fig. 7.3</p>`
    },
    {
      id: 's5',
      title: 'Building the imputation model',
      html: `
<p>The imputation model is the most important step. It is an explicit attempt to model the MAR process, and it requires two choices: the form of each model and the variables that enter it.</p>
<h3>Form</h3>
<ul>
<li>Binary predictors (for example bacteriuria yes/no): logistic regression.</li>
<li>Categorical predictors with three or more levels: polytomous logistic regression.</li>
<li>Continuous predictors (Hb, BMI): linear regression, with transformations where needed.</li>
<li>Imputed values outside the plausible range can be <b>truncated</b> (for example Hb kept within a physiologically plausible range).</li>
</ul>
<p>Software differs in how it handles non-linear relationships: some functions assume linear associations by default (the user can add terms such as x + x²); others search for transformations, which helps with non-linear associations but is inefficient when associations are linear.</p>
<h3>Content: what goes into the imputation model</h3>
<ol>
<li><b>All predictors in the prediction model.</b> Omitting one may bias the analysis.</li>
<li><b>Auxiliary variables</b>: variables not in the prediction model but related to the missing values or to missingness, such as calendar time, site, or (in the course data) the number of antenatal visits. Including more variables makes MAR more plausible; noise variables do no harm, unless computational problems arise.</li>
<li><b>The outcome.</b> This seems circular, because the aim is to predict the outcome, but it is necessary.</li>
</ol>
<div class="callout warn"><b>Critical: leaving the outcome out of a multiple imputation model</b><p>Imputed values drawn without reference to Y carry no relationship with Y, so the predictor's association with the outcome is diluted towards zero, even under MCAR. With 50% of a predictor missing completely at random, omitting the outcome roughly halves its estimated coefficient. Stochastic SI and MI must include the outcome.</p></div>
<div class="callout warn"><b>Pitfall: the opposite rule for conditional mean imputation</b><p>For single imputation with the conditional mean (no random element), use only the X variables. Including Y then exaggerates the strength of the predictor–outcome relationships, because every imputed value sits exactly on the predicted line.</p></div>
<h3>What the simulations show</h3>
<div class="callout book"><b>Book example: five predictors, n = 500, 1,000 repetitions</b><ul>
<li>Pattern of the worked example in section 1 (10% MCAR per predictor, 50% of patients incomplete): CC coefficients were unbiased (about 1.00) but with SEs of 0.26–0.28 against 0.19–0.21 with MI; all methods estimated adjusted R² near 35%.</li>
<li>Correlated predictors, 20% missing each, with mixed mechanisms (one predictor MAR on y): CC coefficients were biased to 0.66–0.69 and adjusted R² was 19% instead of 35%; conditional mean imputation underestimated one coefficient (0.75) and gave R² 27%; stochastic SI and MI gave coefficients of 1.02–1.03 and R² 35%.</li>
</ul></div>
<p>Always check the imputed values, for example by comparing histograms of observed and imputed values: they should lie within a plausible range and show no strange peaks.</p>
<p class="src">Source: Ch. 7, §7.4–7.5, Table 7.4; §7.8.2</p>`
    },
    {
      id: 's6',
      title: 'Practical guidance',
      html: `
<h3>Explore missingness first</h3>
<ol>
<li>Count missing values for each potential predictor.</li>
<li>Examine whether missingness of one predictor goes with missingness or values of others, and with auxiliary variables such as site and calendar time. Cluster displays of missingness patterns help.</li>
<li>Model missingness of a predictor (as the outcome) with logistic regression or a tree on the other predictors. Any association rejects MCAR.</li>
<li>Check whether missingness is associated with the outcome (for example preterm rate in women with and without a recorded Hb), and whether observed predictors explain that association.</li>
<li>Use subject-matter knowledge to judge plausible mechanisms, including whether MNAR is likely.</li>
</ol>
<h3>Decisions</h3>
<div class="callout warn"><b>Pitfall: the missing indicator method</b><p>Adding a "missing" category (for example bacteriuria: absent, present, missing) is simple but ignores correlations between predictors and can severely bias coefficients. It should generally not be used. Where appropriate, an alternative is to redefine the predictor: if a characteristic is not recorded in the chart, treat it as absent.</p></div>
<ul>
<li><b>Very incomplete predictors.</b> In theory MI can handle any fraction missing under MAR, but effects of predictors with more than 50% missing values in a data set will generally be distrusted, and such predictors may be discarded. There is no fixed limit: evidence of MAR on y can make CC analysis of a predictor with 10% missing suspect, while 20% MCAR may be acceptable. Missingness by design (a variable not collected in one study) is less worrying.</li>
<li><b>Predictor of primary interest.</b> Do not impute it. Missing treatment allocation in a randomised trial, for instance, would never be imputed. For adjusted effects, analyse the patients with the predictor of interest observed and impute the confounders (SI or MI), so that univariate and adjusted analyses use the same patients.</li>
<li><b>Single or multiple imputation for prediction.</b> MI may be best. A stochastic SI data set (the first of an MI series) is often sufficient for point estimates, predictions, performance measures and a score chart, because underestimated uncertainty matters less when predictions are the goal. MI is preferable with small data sets (for example fewer than 100 events), where imputations vary considerably.</li>
<li><b>Future availability.</b> Impute all predictors for individual predictions, unless a predictor will not be available when the model is used; then develop the model in the setting where data will be available.</li>
<li><b>Missing outcomes.</b> In prediction research, patients with a missing outcome are generally excluded. Imputation of the outcome adds no information about predictor–outcome relationships, but can help other estimates, such as prevalence under verification bias. Last observation carried forward is biased and underestimates variability.</li>
<li><b>Validation with imputation.</b> When bootstrapping, the book proposes validating the modelling process within each imputed data set.</li>
</ul>
<h3>Reporting</h3>
<p>In a review of 100 prognostic cancer studies, 81 had missing values; more than 10% of patients were excluded from multivariable analyses in about half; only three used single and one used multiple imputation. Report:</p>
<table class="data"><thead><tr><th>Issue</th><th>What to report</th></tr></thead><tbody>
<tr><td>Completeness</td><td>Total n and n with complete data; frequency of missing values for every predictor; numbers excluded if completeness was an inclusion criterion.</td></tr>
<tr><td>Approach</td><td>Methods used, with details of any imputation; number of patients and events in every analysis.</td></tr>
<tr><td>Exploration</td><td>Reasons for missingness; comparison of patients with and without missing data; results of complete case and completed (imputed) analyses.</td></tr>
</tbody></table>
<p>The best solution remains prevention: retrieve values from charts, and where the clinical meaning allows, record "not present" rather than leaving a blank.</p>
<p class="src">Source: Ch. 7, §7.6–7.8, Tables 7.5–7.6</p>`
    },
    {
      id: 's7',
      title: 'Book case study: missing values in a pooled head-injury database',
      html: `
<div class="callout book"><b>Book example: IMPACT traumatic brain injury study</b>
<p>Individual patient data from 11 studies (8 randomised trials and 3 surveys) gave 9,205 patients; outcome (6-month Glasgow Outcome Scale) was available for 8,719 (95%), and after excluding children 8,530 were analysed.</p>
<ul>
<li><b>Patterns.</b> Missingness was mainly due to a predictor not being recorded at all in a study: pupillary reactivity was available for 85% overall, hypoxia 64%, CT classification 61%, Hb 45%, platelets 19%. Platelets and prothrombin time (&lt;20% available) were not considered. Within studies, missingness was close to MCAR; no clear associations with other predictors or with outcome were found.</li>
<li><b>Coding before imputation.</b> A motor score that could not be tested because of sedation was coded as its own category, since being untestable is itself related to severity, rather than imputed.</li>
<li><b>Outcome.</b> For one study only 3-month outcome existed and was carried forward; the 5% with outcome still missing were not imputed.</li>
<li><b>Imputation model.</b> All relevant predictors and the outcome, 10 imputations, with checks of the distributions of imputed values (for example, imputed glucose truncated at 2 and 20, as in the original predictor definition).</li>
<li><b>Efficiency.</b> For the 3-predictor core model, 1,387 missing pupil values (5.4% of the required values) excluded 16% of patients. For the 7-predictor model in 7,020 patients, only 13% of values were missing (6,426 of 49,140), but CC analysis kept 2,428 patients, a loss of 65%.</li>
<li><b>Results.</b> SI and MI gave very similar coefficients and SEs (differences in the third decimal); prognostic scores (coefficients × 10, rounded) differed by at most 2 points between SI and MI. CC estimates differed noticeably, for example smaller effects of motor score with imputation, and had much larger SEs.</li>
</ul></div>
<div class="callout key"><b>Key idea</b><p>The aim is not to estimate the missing values but to estimate model parameters that are valid for the population where the model will be used. Imputation keeps the information recorded for other predictors, increases power, gives better predictions and makes analyses comparable. Its price is the MAR assumption, which becomes more reasonable as the imputation model includes more relevant predictors, the outcome and auxiliary variables.</p></div>
<p class="src">Source: Ch. 8, §8.1–8.6; Ch. 7, §7.8</p>`
    }
  ],
  keyPoints: [
    'Complete case analysis can discard a large share of patients when only a small share of values is missing (book: 10% of values, 50% of patients).',
    'MCAR can be tested and is often rejected; MAR cannot be tested; MNAR always remains possible.',
    'In complete case analysis, missingness related to the outcome (MAR on y) biases all coefficients; selection on X alone need not.',
    'If predictors are measured before the outcome, any missingness–outcome link runs through other characteristics.',
    'Multiple imputation pools M analyses: Var = W + (1 + 1/M)B; single imputation ignores B and understates SEs.',
    'Stochastic SI and MI imputation models must include all predictors, auxiliary variables and the outcome; conditional mean imputation uses X only.',
    'Do not use the missing indicator method; distrust predictors with more than 50% missing; never impute the predictor of primary interest.',
    'Report completeness per predictor, numbers of patients and events in each analysis, methods used, and complete versus completed case results.'
  ],
  quiz: [
    {
      q: 'Six predictors each have 8% missing values, independently and completely at random. Roughly what share of women will be complete cases?',
      options: ['92%', '52%', '61%', '48%'],
      answer: 2,
      why: '(1 − 0.08)^6 = 0.92^6 = 0.61. The value 52% (1 − 6 × 0.08) applies only if no woman misses more than one value. 92% mistakes the per-predictor completeness for the patient-level completeness.'
    },
    {
      q: 'In a booking-to-delivery cohort, a urine culture is not sent when the midwife judges the woman to be at low risk, and the reasons for that judgement are not recorded. What is the missing data mechanism for bacteriuria?',
      options: ['MCAR', 'MAR on y', 'MAR on x', 'MNAR'],
      answer: 3,
      why: 'Missingness depends on characteristics that are not available in the data, so it is MNAR. If the midwife’s criteria were recorded as variables, it would be MAR on x. It cannot be MAR on y, because the culture decision is made before delivery.'
    },
    {
      q: 'In the book’s simulation with Y = X1 + X2 + error, which mechanism for missing X1 biased the complete case estimates of both b1 and b2?',
      options: ['MCAR', 'X1 more often missing at high values of Y', 'X1 more often missing at low values of X2', 'X1 more often missing at low values of X1'],
      answer: 1,
      why: 'MAR on y gave expected values of 0.82 for both coefficients. Selection on X (options 3 and 4) left the coefficients unbiased because regression conditions on X. A common misconception is that MNAR always biases complete case estimates; in this simple example it did not.'
    },
    {
      q: 'Five imputed analyses give a coefficient with mean within-imputation variance W = 0.0050 and between-imputation variance B = 0.0010. What is the pooled standard error?',
      options: ['0.0787', '0.0707', '0.0775', '0.0849'],
      answer: 0,
      why: 'Var = 0.0050 + (1 + 1/5) × 0.0010 = 0.0062; SE = √0.0062 = 0.0787. 0.0707 is √0.0050, ignoring the between-imputation variance (what single imputation would report). 0.0775 omits the (1 + 1/M) factor.'
    },
    {
      q: 'An analyst performs multiple imputation of Hb using all predictors but not the outcome (preterm birth), arguing that using the outcome would be circular. What is the expected consequence?',
      options: ['Hb’s coefficient will be exaggerated', 'No consequence if Hb is missing completely at random', 'Hb’s association with preterm birth will be diluted towards zero', 'The standard errors will be too small but the coefficient unbiased'],
      answer: 2,
      why: 'Imputed values drawn without reference to the outcome are unrelated to it, which weakens the observed association; with 50% MCAR the coefficient is roughly halved. The dilution occurs even under MCAR, so option 2 is wrong. Exaggeration (option 1) is the risk when Y is used in conditional mean imputation.'
    },
    {
      q: 'Which approach is recommended in the book for a binary predictor with some missing values?',
      options: ['Imputation with a logistic imputation model that includes the other predictors and the outcome', 'Adding a separate "missing" category to the predictor', 'Replacing missing values with the most frequent category', 'Excluding the predictor whenever any value is missing'],
      answer: 0,
      why: 'A logistic imputation model for a binary variable, with all predictors and the outcome, follows the book’s guidance. The missing indicator method (option 2) can severely bias coefficients; most-frequent-category imputation ignores correlations; dropping predictors for any missingness wastes information.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Complete case loss and Rubin’s rules',
      level: 'Apply',
      scenario: `<p><b>Illustrative (synthetic).</b> A preterm-birth model with 8 predictor degrees of freedom is developed in 1,600 women with 192 preterm births. Hb is missing for 15% and BMI for 8% of women, independently of each other and of the outcome; the other predictors are complete.</p>
<p>After multiple imputation (M = 5, outcome included), the coefficient for low Hb (per g/dL below 11) in the five completed data sets is 0.42, 0.47, 0.44, 0.50 and 0.45, with standard errors 0.080, 0.082, 0.079, 0.081 and 0.080.</p>`,
      questions: [
        '<b>(a)</b> What share of women, how many women and about how many events would a complete case analysis keep? What happens to EPV?',
        '<b>(b)</b> What share of the required predictor values is missing?',
        '<b>(c)</b> Pool the five estimates with Rubin’s rules: give the pooled coefficient, W, B, total variance, SE, the odds ratio and its 95% CI.',
        '<b>(d)</b> What SE would a single stochastic imputation report, and why is it too small?'
      ],
      answer: `<p><b>(a)</b> Share complete = (1 − 0.15) × (1 − 0.08) = 0.85 × 0.92 = 0.782. Women kept ≈ 0.782 × 1,600 = 1,251; events kept ≈ 0.782 × 192 = 150 (assuming missingness unrelated to outcome). EPV falls from 192/8 = 24 to 150/8 ≈ 18.8; about 22% of the data are thrown away.</p>
<p><b>(b)</b> Missing values: 0.15 × 1,600 + 0.08 × 1,600 = 240 + 128 = 368 of 8 × 1,600 = 12,800 required values (counting 8 predictor columns), i.e. 2.9%. Under 3% of values are missing, but 22% of women would be discarded.</p>
<p><b>(c)</b> Pooled coefficient b̄ = (0.42 + 0.47 + 0.44 + 0.50 + 0.45) / 5 = 0.456. W = mean of SE² = (0.006400 + 0.006724 + 0.006241 + 0.006561 + 0.006400) / 5 = 0.006465. Deviations from 0.456 squared: 0.001296, 0.000196, 0.000256, 0.001936, 0.000036; sum 0.00372; B = 0.00372 / 4 = 0.00093. Total variance = 0.006465 + (1 + 1/5) × 0.00093 = 0.006465 + 0.001116 = 0.007581. SE = √0.007581 = 0.0871. OR = e<sup>0.456</sup> = 1.58 per g/dL below 11; 95% CI e<sup>0.456 ± 1.96 × 0.0871</sup> = 1.33 to 1.87.</p>
<p><b>(d)</b> A single imputation would report roughly the within-imputation SE, about √0.0065 ≈ 0.080, 8% smaller than the pooled 0.087. It treats imputed Hb values as if they had been measured, ignoring the between-imputation variance B that reflects uncertainty about the missing values. For predictions this matters less; for inference on predictor effects MI gives more honest SEs.</p>`
    },
    {
      id: 't2',
      title: 'Mechanisms and methods in simulation',
      level: 'Analyze',
      scenario: `<p>Use the <b>missingDemo</b> widget (n = 500, Y = X1 + X2 + noise, true β1 = β2 = 1, X2 incomplete). Run 200 simulations for each combination.</p>`,
      questions: [
        '<b>(a)</b> With 40% missing, compare complete case analysis under MCAR, MAR depending on X1, MAR depending on Y and MNAR depending on X2. Record mean β1, β2 and SE. Which mechanism produces bias, and does it affect β1 as well as β2?',
        '<b>(b)</b> Under MAR depending on Y, compare complete case, mean imputation, regression imputation without Y, stochastic imputation with Y and multiple imputation with Y.',
        '<b>(c)</b> Under MCAR, compare the SE of complete case analysis with that of multiple imputation. What does this show?',
        '<b>(d)</b> Under MNAR depending on X2, does any method clearly beat complete case analysis for the coefficients? What does this imply for practice?'
      ],
      answer: `<p><b>(a)</b> Expected pattern, following the book's simulation: under MCAR, MAR on X1 and MNAR on X2, the complete case estimates of β1 and β2 stay close to 1, with larger SEs than with full data. Under MAR depending on Y both coefficients are biased (towards zero when values are deleted mainly at high Y), including β1 for the complete predictor X1. Selection related to the outcome distorts all associations among the retained patients.</p>
<p><b>(b)</b> Complete case analysis is biased. Imputation methods that use Y (stochastic SI and MI) should give estimates close to 1, MI with the most appropriate SEs. Mean imputation and regression imputation without Y cannot recover the information carried by Y about the missing values, so some bias is expected; mean imputation also ignores correlations and understates the variability of X2. This mirrors the book's finding that SI and MI with X + Y were best under MAR on y.</p>
<p><b>(c)</b> Both methods should be close to unbiased under MCAR, but MI should give smaller SEs, because it uses the observed X1 and Y of the 40% of patients whose X2 is missing. The cost of complete case analysis under MCAR is efficiency, not bias.</p>
<p><b>(d)</b> Under MNAR the MAR assumption behind imputation fails, so imputation offers no guaranteed improvement; in the book's simple simulation complete case analysis was unbiased for the coefficients under MNAR, unlike the imputation approaches. In practice MNAR can never be excluded; use subject knowledge to judge plausibility, include variables that make MAR more reasonable, and compare complete case and imputed results as a sensitivity check.</p>`
    },
    {
      id: 't3',
      title: 'Critique the missing-data handling in an anaemia study',
      level: 'Evaluate',
      scenario: `<p><b>Illustrative (synthetic).</b> A prospective cohort of 2,400 pregnant women aims to predict preterm birth from booking characteristics. The methods section states:</p>
<ol>
<li>"Women with missing delivery outcome (6%) were assigned 'term birth', since most births are at term."</li>
<li>"Booking Hb was missing in 18%; we used a missing-Hb indicator category so that no woman was excluded."</li>
<li>"BMI (9% missing) was replaced by the cohort mean."</li>
<li>"Cervical length was available for 35% of women, because scanning was only offered in one of the three hospitals; it was multiply imputed and retained in the final model."</li>
<li>"In a sensitivity analysis we multiply imputed Hb and BMI from all other predictors; the outcome was deliberately excluded from the imputation model to avoid circularity."</li>
<li>"Missing data were assumed to be missing completely at random." (Women with missing Hb had fewer antenatal visits and a higher preterm-birth rate.)</li>
</ol>`,
      questions: [
        '<b>(a)</b> Comment on each statement.',
        '<b>(b)</b> Write a short, improved plan for handling and reporting missing data in this study.'
      ],
      answer: `<p><b>(a)</b></p>
<ol>
<li><b>Outcome.</b> Assigning "term" invents outcomes and biases the event rate and the coefficients. In prediction research women with missing outcome are generally excluded (and the number reported); the 6% should be described and compared with the rest.</li>
<li><b>Missing indicator.</b> The missing-indicator method ignores correlations among predictors and can severely bias coefficients; it should not be used. Hb should be imputed.</li>
<li><b>Mean imputation.</b> Ignores the correlation of BMI with other predictors and understates its variability. A regression-based imputation (or MI with the outcome) is preferred.</li>
<li><b>Cervical length.</b> With 65% missing, its effect will generally be distrusted. The missingness is by design (one hospital), which is less worrying for interpretation, but imputation in the two hospitals without scanning would rely entirely on relationships observed elsewhere. Consider omitting it from the main model, or developing a separate model for settings where scanning will be available, since the model should use predictors available in future use.</li>
<li><b>Imputation without the outcome.</b> For MI this is an error: it dilutes the associations of Hb and BMI with preterm birth (roughly halving a coefficient with 50% MCAR). The outcome must be in the imputation model; only conditional mean single imputation should exclude it.</li>
<li><b>MCAR assumption.</b> The data reject MCAR: missing Hb is associated with antenatal visits and with the outcome. Because Hb was measured before delivery, the outcome link must run through other characteristics such as visits and socio-economic status. Including these (as predictors or auxiliary variables) makes MAR on x plausible; without them the mechanism may be MNAR.</li>
</ol>
<p><b>(b) Improved plan.</b> Exclude and report women with missing outcome. Tabulate missingness for every predictor; explore patterns (missingness by hospital, antenatal visits, socio-economic status and outcome, using logistic regression with missingness as outcome). Use multiple imputation (for example 5–10 imputations) with an imputation model containing all predictors, auxiliary variables (hospital, number of antenatal visits) and the outcome; logistic models for binary and linear models for continuous variables, with truncation to plausible ranges; check observed versus imputed distributions. Do not use missing indicators. Decide on cervical length using the intended setting of use. Pool with Rubin's rules; when bootstrapping, validate the modelling process within each imputed data set. Report total n and n complete, missingness per predictor, numbers of women and events in each analysis, the imputation method, and complete case versus imputed results.</p>`
    }
  ]
});
