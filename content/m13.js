registerModule({
  id: 'm13',
  num: 13,
  part: 'Validation',
  title: 'Internal and external validation',
  book: 'Ch. 17',
  minutes: 75,
  summary: 'How to obtain an honest estimate of how a prediction model will perform in new patients, first within the development setting (internal validation) and then in other settings (external validation).',
  objectives: [
    'Distinguish internal validity (reproducibility) from external validity (generalisability) and place each in the superpopulation framework.',
    'Compare apparent, split-sample, cross-validation and bootstrap validation on bias, stability and ability to reflect model uncertainty.',
    'Calculate an optimism-corrected c statistic and calibration slope from bootstrap results.',
    'Classify an external validation study as temporal, geographic or fully independent and name the transportability aspect it tests.',
    'Diagnose likely reasons for poor performance at external validation from a study description.',
    'Justify why the final model should be estimated on all available data after validation.'
  ],
  sections: [
    {
      id: 's1',
      title: 'What validation is for',
      html: `
<p>A prediction model is built to give valid predictions for <i>future</i> patients. The data set used to develop it has no interest in itself; it is only a means of learning about patients who will be seen later. Validation is therefore an essential part of the modelling process. The question it answers is simple: how good are the predictions when the model is used on patients who did not contribute to its estimation?</p>

<h3>Two kinds of validity</h3>
<p>Think of a <b>superpopulation</b>, for example all pregnant women booking for antenatal care. It consists of several <b>settings</b>: a district hospital in one period, a referral hospital in another, a primary care network elsewhere. We develop the model on a sample from one setting (setting 1).</p>
<ul>
<li><b>Internal validity</b> (reproducibility): does the model perform as claimed for patients from the same setting as the development sample? <b>Internal validation</b> is the process of estimating this, using only the development data.</li>
<li><b>External validity</b> (generalisability, transportability): does the model perform adequately in other settings that are <i>plausibly related</i>, that is, parts of the same superpopulation to which it would be reasonable to apply the model? <b>External validation</b> estimates this using fully independent samples from settings 2, 3 and onwards.</li>
</ul>
<p>Which populations are "plausibly related" is a matter of subject knowledge and study design judgement, not statistics. Settings may differ in how patients are selected (referral centre versus a general setting), in time, and in how predictors and outcome are defined. The more often, and the more diverse the settings in which a model has been validated, the more confidence we have in its generalisability, as with any scientific hypothesis.</p>

<figure>
<svg viewBox="0 0 520 170" width="100%" role="img" aria-label="Superpopulation with settings and samples">
<rect x="10" y="8" width="500" height="34" rx="6" fill="none" stroke="currentColor"/>
<text x="260" y="30" text-anchor="middle" font-size="13" fill="currentColor">Superpopulation: women booking for antenatal care</text>
<g font-size="12" fill="currentColor" text-anchor="middle">
<rect x="20" y="62" width="140" height="28" rx="5" fill="none" stroke="var(--accent)"/><text x="90" y="81">Setting 1 (development)</text>
<rect x="190" y="62" width="140" height="28" rx="5" fill="none" stroke="currentColor"/><text x="260" y="81">Setting 2</text>
<rect x="360" y="62" width="140" height="28" rx="5" fill="none" stroke="currentColor"/><text x="430" y="81">Setting i</text>
<rect x="20" y="110" width="140" height="28" rx="5" fill="none" stroke="var(--accent)"/><text x="90" y="129">Sample 1, model built</text>
<rect x="190" y="110" width="140" height="28" rx="5" fill="none" stroke="currentColor"/><text x="260" y="129">Sample 2</text>
<rect x="360" y="110" width="140" height="28" rx="5" fill="none" stroke="currentColor"/><text x="430" y="129">Sample i</text>
<text x="90" y="160" fill="var(--accent)">internal validation</text>
<text x="345" y="160" fill="var(--muted)">external validation</text>
</g>
</svg>
</figure>

<h3>What is measured</h3>
<p>Validation re-estimates the performance measures introduced earlier, now in data the model has not been fitted to:</p>
<ul>
<li><b>c statistic</b>: the probability that a randomly chosen patient with the outcome has a higher predicted risk than a randomly chosen patient without it (0.5 = no discrimination, 1 = perfect).</li>
<li><b>Calibration-in-the-large</b>: does the average predicted risk equal the observed outcome frequency? Estimated as the intercept <span class="m">a</span> in logit(P(y=1)) = a + offset(lp), where lp is the model's linear predictor; ideal value 0.</li>
<li><b>Calibration slope</b>: the coefficient <span class="m">b</span> in logit(P(y=1)) = a + b × lp; ideal value 1. A slope below 1 means predictions are too extreme (low risks too low, high risks too high), the signature of overfitting.</li>
<li>Overall measures (Nagelkerke R², Brier score) and clinical usefulness (net benefit) can be validated in the same way.</li>
</ul>
<div class="callout key"><b>Key idea</b><p>In the development sample, a model fitted by maximum likelihood always has a calibration slope of exactly 1 and calibration-in-the-large of 0. These values carry no information. Only validation tells us how far predictions will drift in new patients.</p></div>
<p class="src">Source: Ch. 17, §17.1 (Fig. 17.1)</p>
`
    },
    {
      id: 's2',
      title: 'Apparent and split-sample validation',
      html: `
<p>Internal validation methods differ in which part of the data is used to fit the model and which part to test it. The table summarises the four common approaches.</p>
<table class="data">
<thead><tr><th>Method</th><th>Model developed on</th><th>Performance tested on</th></tr></thead>
<tbody>
<tr><td>Apparent</td><td>Original sample, 100%</td><td>Same original sample, 100%</td></tr>
<tr><td>Split-sample</td><td>Random 50–67% of the sample</td><td>The remaining 50–33%</td></tr>
<tr><td>Cross-validation</td><td>From 2 × 50% up to 10 × 90% of the sample</td><td>The left-out parts (2 × 50% to 10 × 10%)</td></tr>
<tr><td>Jack-knife (leave-one-out)</td><td>N × (N − 1 patients)</td><td>Each patient once</td></tr>
<tr><td>Bootstrap</td><td>Bootstrap samples of size N</td><td>Original sample, 100%</td></tr>
</tbody>
</table>

<h3>Apparent validation</h3>
<p>Performance is calculated in the same data used to estimate the coefficients. Because the coefficients were chosen to fit these data as well as possible, the estimate is <b>optimistic</b> (biased upwards). It is, however, <b>stable</b>: 100% of the data is used both for fitting and for testing. With very large samples and few predictors, the optimism is small and apparent performance is close to the truth.</p>

<h3>Split-sample validation</h3>
<p>The sample is randomly divided into a development part and a test part, typically 50:50 or 2/3:1/3. It imitates an external validation study, but the split is at random, so both parts come from the same setting. It tests internal validity only.</p>
<p>Its problems are several:</p>
<ul>
<li><b>Imbalance by chance.</b> Random halves can differ noticeably in outcome frequency and predictor distributions, more so for rare or skewed predictors. A practical partial remedy is to stratify the split by outcome and key predictors.</li>
<li><b>Variance.</b> The model is fitted on part of the data, so its coefficients are less stable; and the test part is small, so its performance estimate is imprecise.</li>
<li><b>Temptation.</b> An unlucky split may show poor performance, and an investigator may be tempted to repeat the split until the results look better.</li>
<li><b>Bias.</b> It measures the performance of a model built on part of the data, whereas we want to know the performance of the model built on all of it.</li>
</ul>
<div class="callout book"><b>Book example</b><p>In a GUSTO-I subsample of 429 patients with acute myocardial infarction, 30-day mortality was 5.6% (24/429), but a random 50% part could easily show 4% and the other half 7%. Shock occurred in only 1.6% (7/429), so a random development half might contain no patient with shock at all.</p></div>
<p>Simulation studies show that split-sample validation becomes reasonable only with rather large samples, but with large samples the apparent performance is already a good guide. The book summarises this as a method "that works when we do not need it". It should be replaced by more efficient internal validation (bootstrapping) and by genuine external validation.</p>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A district hospital cohort has 2000 women and 234 preterm births. A 2/3:1/3 random split leaves about 78 preterm births in the test third, so the c statistic and calibration slope in that third are estimated with wide uncertainty, while the model itself is fitted on only about 156 events.</p></div>
<p class="src">Source: Ch. 17, §17.2.1–17.2.2 (Table 17.1)</p>
`
    },
    {
      id: 's3',
      title: 'Cross-validation',
      html: `
<p>Cross-validation extends the split-sample idea to gain stability. In <b>k-fold cross-validation</b> the data are divided at random into k parts of equal size. The model is developed on k − 1 parts and tested on the part left out; this is repeated k times so that every patient is used once for testing. The performance estimate is the average over the k test parts.</p>
<div class="callout eg"><b>Worked example: 10-fold cross-validation</b><p>A cohort of 1500 women is divided at random into 10 folds of 150. Round 1: fit the model on folds 2–10 (1350 women), calculate the c statistic in fold 1. Round 2: fit on folds 1 and 3–10, test on fold 2. After 10 rounds every woman has received exactly one "out-of-sample" prediction. The cross-validated c is the mean of the 10 fold-specific values (or the c calculated on all 1500 out-of-sample predictions). Each fit uses 90% of the data, compared with 50–67% in a split-sample design.</p></div>
<h3>Strengths and limitations</h3>
<ul>
<li>A larger share of the data (for example 90%) is used to fit each model, which is an advantage over split-sample validation.</li>
<li>The result still depends on the random division into folds. Truly stable results may require repeating the whole procedure many times, for example 50 repetitions of 10-fold cross-validation ("multi-fold cross-validation").</li>
<li>The extreme form leaves out one patient at a time (the <b>jack-knife</b>). With large numbers of patients this is not efficient.</li>
<li>Cross-validation may <b>not reflect all sources of model uncertainty</b>, in particular uncertainty created by automated variable selection. Each development set overlaps heavily with the full sample (with the jack-knife it differs by one patient), so largely the same predictors are selected each time and the instability of selection is hidden.</li>
</ul>
<div class="callout book"><b>Book example</b><p>In a GUSTO-I subsample of 785 patients (52 deaths), 10-fold cross-validation of a backward stepwise procedure suggested a stable selection of four "important" predictors (shock, age over 65, high-risk infarction, tachycardia). Bootstrapping the same procedure showed much wider variability in which predictors were selected.</p></div>
<div class="callout warn"><b>Pitfall</b><p>A stable cross-validation result does not prove that a stepwise-selected model is stable. Cross-validation tends to understate how much the selected set of predictors would change in another sample from the same population.</p></div>
<p class="src">Source: Ch. 17, §17.2.3</p>
`
    },
    {
      id: 's4',
      title: 'Bootstrap validation',
      html: `
<p>A <b>bootstrap sample</b> is drawn with replacement from the original sample and has the same size N. Some patients appear more than once and others not at all (on average about 63.2% of the original patients appear at least once). Drawing bootstrap samples from the original sample mimics drawing new samples from the underlying population.</p>
<h3>The optimism-correction procedure</h3>
<ol>
<li>Fit the model on the original sample and calculate its <b>apparent</b> performance (for example c<sub>app</sub>).</li>
<li>Draw a bootstrap sample of size N.</li>
<li>Develop a model in the bootstrap sample, <b>repeating every modelling step</b> (coding decisions, selection, shrinkage). Calculate its performance in the bootstrap sample (c<sub>boot</sub>).</li>
<li>Apply this bootstrap model to the original sample and calculate its performance there (c<sub>test</sub>).</li>
<li>Optimism for this replicate = c<sub>boot</sub> − c<sub>test</sub>.</li>
<li>Repeat steps 2–5 many times; 100–200 replicates are often sufficient, although one simulation study reached a plateau only after 500.</li>
<li>Optimism-corrected performance = c<sub>app</sub> − mean optimism.</li>
</ol>
<div class="formula">c<sub>corrected</sub> = c<sub>app</sub> − mean(c<sub>boot</sub> − c<sub>test</sub>)</div>
<p>The same procedure applies to R², the Brier score and the calibration slope. For the slope, the apparent value is 1 by construction, so the corrected slope equals the mean slope of the bootstrap models when applied to the original sample. This value estimates the shrinkage factor needed.</p>
<h3>Why the bootstrap is preferred</h3>
<ul>
<li><b>Stable</b>: models are developed and tested on samples of size N, as in apparent validation. Estimating the optimism adds a little uncertainty, which is negligible with enough replicates.</li>
<li><b>Honest about model uncertainty</b>: because selection is replayed in each bootstrap sample, simulations show the bootstrap can reflect the extra optimism created by variable selection.</li>
<li><b>Efficient</b>: all data are used to develop the final model.</li>
</ul>
<h3>The limitation: steps that cannot be replayed</h3>
<p>Only automated strategies can be replayed: fitting a prespecified full model, or an automated stepwise rule. Many analyses include informal steps such as collapsing categories, truncating outliers after inspection, judging linearity from a plot, or trying some interactions. When these cannot be repeated, a reasonable approximation is to bootstrap at least the full model with all candidate predictors. For example, if 30 candidates were screened univariately at p &lt; 0.50 and then reduced by backward selection at p &lt; 0.20, one can validate the full 30-predictor model, or replay the backward selection at p &lt; 0.20 while ignoring the univariate screen.</p>
<div class="callout warn"><b>Critical:</b><p>Validating only the finally selected model, as if it had been specified in advance, ignores all selection steps and understates optimism. In one study the bootstrap optimism in the c statistic was 0.07 when all modelling steps were replayed, against 0.01 when the final model was treated as predefined. A reported "internally validated" c that skipped the selection steps cannot be trusted.</p></div>
<div data-widget="validationLab"></div>
<ul class="try">
<li>Set the development sample size to 250 and run 20 replications. Compare where the apparent c sits relative to the true c, and how widely the split-sample estimates scatter compared with the bootstrap estimates.</li>
<li>Increase the development sample size to 1200 and run again. Observe how the gap between apparent and true c narrows and how the spread of every method shrinks.</li>
<li>At n = 250, compare 10-fold cross-validation with bootstrap correction: which has the smaller spread around the true value?</li>
</ul>
<p class="src">Source: Ch. 17, §17.2.4; Ch. 5, §5.3</p>
`
    },
    {
      id: 's5',
      title: 'Types of external validation',
      html: `
<p>Internal validation always splits or resamples the development data at random. External validation, by contrast, uses patients who <b>differ in some respect</b> from the development patients. Four aspects of transportability can be tested:</p>
<ul>
<li><b>Historic (temporal)</b>: performance in a different, usually more recent, period.</li>
<li><b>Geographic (spatial)</b>: performance in other hospitals or regions.</li>
<li><b>Methodological</b>: performance when data are collected differently, for example comorbidity taken from claims data instead of patient charts.</li>
<li><b>Spectrum</b>: performance in patients who are on average more (or less) advanced in their disease, or have a somewhat different disease; for example a model developed in secondary care applied in primary care, or a model from a randomised trial applied to a broader, less selected population.</li>
</ul>
<p>A second dimension is <b>who</b> does the validation. Adequate performance found by independent investigators in their own setting is more convincing than the same result from the developers.</p>
<table class="data">
<thead><tr><th>Type</th><th>Characteristics</th></tr></thead>
<tbody>
<tr><td>Temporal validation</td><td>More recent patients, often prospectively collected; may be the most recent part of the development data set aside</td></tr>
<tr><td>Geographic validation</td><td>Multi-site testing; "leave-one-centre-out" cross-validation in collaborative data</td></tr>
<tr><td>Fully independent validation</td><td>Other investigators at another site</td></tr>
</tbody>
</table>
<p>Mixed forms occur. A testicular cancer model was validated in 172 patients: 100 more recently treated patients from the development hospitals (temporal) and 72 from a hospital not involved in development (geographic).</p>
<div class="callout book"><b>Book example: temporal validation</b><p>A model for Lynch syndrome mutations was developed in 898 patients tested in 2000–2003 and validated in 1016 tested in 2003–2004. Mutation prevalence was 15% at validation against 14% at development, with a mean predicted probability of 13%. A slightly higher intercept (+0.25, about 25% higher odds) corrected this. The c statistic stayed about 0.80. The final model was estimated on the combined 1914 patients.</p></div>
<h3>Geographic validation</h3>
<p>Geographic validation can be seen as cross-validation in which the splits are made by centre instead of at random. It is often possible in collaborative studies and is more meaningful than random cross-validation. Its weakness is that each centre's validation sample may be small, so results are easily over-interpreted ("the model is not valid in hospital X"). Emphasis should be on <b>general consistency</b> across centres; a striking finding in one centre suggests the need for further validation there before use.</p>
<div class="callout book"><b>Book example: geographic validation</b><p>A testicular cancer model validated centre by centre in six groups showed c statistics around 0.8 in all, with no significant miscalibration by the Hosmer-Lemeshow test except in one centre.</p></div>
<h3>Fully independent validation</h3>
<p>Other investigators may use slightly different predictor and outcome definitions and select patients differently. Such validations often give less favourable results than temporal or geographic ones.</p>
<div class="callout book"><b>Book example: fully independent validation</b><p>Three nomograms for indolent prostate cancer, developed in clinical patients, were validated in 247 men from a screening programme. Mean predicted probabilities were 24%, 22% and 15%, while 49% actually had indolent cancer: a large calibration-in-the-large problem. Discrimination was a little lower than at development (areas under the ROC curve 0.61, 0.72, 0.76 against 0.64, 0.74, 0.79). A new intercept, with coefficients kept close to their original values, addressed the problem.</p></div>
<p class="src">Source: Ch. 17, §17.3 (Tables 17.2–17.6, Fig. 17.6)</p>
`
    },
    {
      id: 's6',
      title: 'Why models fail at external validation',
      html: `
<p>Poor external performance has two families of explanation: weaknesses in how the model was developed, and genuine differences between the development and validation settings.</p>
<h3>Inadequate development</h3>
<ul>
<li>A small development sample, or patients from a single centre. A review of more than 25 models in traumatic brain injury noted this pattern.</li>
<li>Suboptimal analysis: stepwise selection in a small sample with many candidate predictors, and no shrinkage to compensate for overfitting. Such models have coefficients that are too large on average, so predictions are too extreme in new patients (calibration slope below 1).</li>
</ul>
<h3>Differences between settings</h3>
<ul>
<li><b>Coding of predictors and outcome.</b> Definitions that differ slightly between centres change the meaning of a coefficient.</li>
<li><b>Units of measurement.</b> Laboratory values in mg/dL in one setting and mmol/L in another were already recognised as a transport problem for a jaundice rule in the 1980s.</li>
<li><b>Errors in applying a published model.</b> If a model is published as a nomogram with non-linear terms, deriving the formula is difficult and mistakes are likely. The units and the intercept require special attention; contacting the developers can prevent errors.</li>
<li><b>Predictors unavailable at validation.</b> A constant (mean or median) can be substituted, but this limits performance. A Dutch aneurysm surgery model performed poorly in a UK trial where two of its seven predictors were missing, and better in a Rotterdam series where all but one were available.</li>
<li><b>True differences</b> in case-mix and in predictor effects. Module 14 analyses these patterns systematically.</li>
</ul>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A preeclampsia model developed in a tertiary hospital uses "urine protein ≥ 2+ on dipstick" and mean arterial pressure from an automated device. A district hospital validates it using a laboratory protein/creatinine ratio and manual sphygmomanometry, and enters the haemoglobin coefficient (developed in g/dL) with values in g/L. The first two are methodological transportability issues that can weaken coefficients; the third is a unit error that produces nonsense predictions for every woman. Before blaming the model, check definitions, units and the intercept used.</p></div>
<div class="callout warn"><b>Critical:</b><p>A unit or coding mismatch between development and validation (g/L entered into a coefficient estimated per g/dL, or a 0/1 predictor coded 1/2) invalidates every prediction. Always reconstruct the linear predictor for a few typical patients and check that the predicted risks are plausible before computing any validation statistic.</p></div>
<p class="src">Source: Ch. 17, §17.3.5</p>
`
    },
    {
      id: 's7',
      title: 'Validating the process, and the final model',
      html: `
<h3>What is being validated</h3>
<p>Any internal validation technique validates the <b>modelling process</b>, not one specific set of coefficients. The bootstrap asks: if we applied this whole strategy (coding, selection, estimation) to a new sample from the same population, how well would the resulting model predict? It follows that:</p>
<ul>
<li>After a split-sample validation (sometimes done to reassure readers sceptical of resampling), the final model should still be <b>estimated on the full sample</b>. Using only a random part wastes information; coefficients from the full sample are more stable.</li>
<li>If stepwise selection was used in the random part, it should be repeated on the full sample, even if this changes the selected predictors.</li>
<li>Bootstrap validation of stepwise models often shows that the final selected model appears in only a few bootstrap samples. This model uncertainty belongs in the optimism estimate.</li>
<li>When the number of candidate predictors is very large relative to the sample size (as in genetic marker studies), even bootstrapping may underestimate optimism.</li>
</ul>
<h3>After external validation</h3>
<p>If external validation has been performed and performance is adequate, the development and validation data may be combined to estimate the final model, as in the Lynch syndrome example. This assumes both samples come from the same population. If relevant differences are found, a setting-specific intercept or setting-specific interaction terms can be included.</p>
<div class="callout mch"><b>Illustrative (synthetic): the course validation exercise</b><p>The course has two synthetic preterm-birth cohorts. <b>ptb_dev</b> (n = <span data-live="ptb_dev_n"></span>, <span data-live="ptb_dev_events"></span> preterm births, <span data-live="ptb_dev_incidence"></span>) comes from a district hospital antenatal clinic. <b>ptb_val</b> (n = <span data-live="ptb_val_n"></span>, <span data-live="ptb_val_events"></span> preterm births, <span data-live="ptb_val_incidence"></span>) comes from a tertiary referral hospital in a later period: a temporal and geographic validation with a different referral spectrum.</p>
<p>The full 14-term model fitted on <span data-live="ptb_cc_n"></span> complete cases (<span data-live="ptb_cc_events"></span> events) has apparent c = <span data-live="ptb_full_apparent_c"></span>. Bootstrap validation gives optimism <span data-live="ptb_full_optimism_c"></span> and corrected c = <span data-live="ptb_full_corrected_c"></span>, with an estimated shrinkage factor of <span data-live="ptb_full_shrinkage"></span>. Applied to ptb_val, the model gives c = <span data-live="ptb_val_c"></span>, calibration slope <span data-live="ptb_val_slope"></span> and calibration-in-the-large <span data-live="ptb_val_citl"></span>.</p></div>
<div data-widget="datasetCard" data-set="ptb_val"></div>
<p>Read the three external numbers against the internal ones. A positive calibration-in-the-large means more preterm births occurred than predicted. A slope further below 1 than the bootstrap shrinkage factor suggests that more than overfitting is at work: predictor effects may be truly weaker in the referral setting. Module 14 explains how to separate case-mix effects from coefficient differences.</p>
<div data-widget="analysisLab"></div>
<ul class="try">
<li>Open the Analysis Lab with dataset ptb_dev, select the 14 candidate terms with complete-case analysis, no selection and no shrinkage. Record the apparent and bootstrap-corrected c and slope, then run the external validation on ptb_val.</li>
<li>Repeat with backward selection at p &lt; 0.05. Compare the bootstrap optimism (selection replayed) with the optimism of the full model, and compare both with the external results.</li>
<li>Add uniform bootstrap shrinkage. Observe which external measure changes (slope) and which hardly changes (c).</li>
</ul>
<p class="src">Source: Ch. 17, §17.4</p>
`
    }
  ],
  keyPoints: [
    'Internal validity is reproducibility in the development setting; external validity is generalisability to plausibly related settings.',
    'Apparent performance is optimistic but stable; in the development data the calibration slope is always 1 and carries no information.',
    'Split-sample validation is unstable, inefficient and biased; it works only when samples are large enough not to need it.',
    'Cross-validation is more efficient than a single split but can understate the instability of variable selection.',
    'Bootstrap optimism correction is preferred, provided every modelling step, including selection, is replayed in each bootstrap sample.',
    'External validation can be temporal, geographic or fully independent; fully independent validations tend to be the least favourable.',
    'Common causes of poor external performance: small single-centre development, stepwise selection without shrinkage, coding and unit differences, wrong intercept, missing predictors.',
    'Validation assesses the modelling process; the final model is estimated on all available data.'
  ],
  quiz: [
    {
      q: 'A team fits a logistic model for neonatal sepsis and reports, in the same data, a calibration slope of 1.00 and calibration-in-the-large of 0.00. What do these values tell you about calibration in new newborns?',
      options: [
        'Calibration is excellent and no shrinkage is needed',
        'Nothing; maximum likelihood fitting forces these values in the development data',
        'The model is overfitted, because a slope of exactly 1 is suspicious',
        'Calibration is good, provided the c statistic exceeds 0.7'
      ],
      answer: 1,
      why: 'With maximum likelihood estimation the apparent calibration slope is 1 and the intercept 0 by construction, so they cannot reveal overfitting. The commonest error (option A) treats apparent calibration as evidence; only internal or external validation can estimate the slope in new patients. A slope of 1 is not itself a sign of overfitting, and the c statistic says nothing about calibration.'
    },
    {
      q: 'Bootstrap validation of a gestational diabetes model gives: apparent c 0.80; mean c of bootstrap models in their own bootstrap samples 0.82; mean c of the same bootstrap models in the original sample 0.77. What is the optimism-corrected c?',
      options: ['0.75', '0.77', '0.78', '0.82'],
      answer: 0,
      why: 'Optimism = 0.82 − 0.77 = 0.05; corrected c = apparent 0.80 − 0.05 = 0.75. Reporting 0.77 confuses the mean test performance with the corrected estimate: the test value comes from models built on bootstrap samples, while the correction is applied to the apparent performance of the original model.'
    },
    {
      q: 'Which statement about split-sample validation is correct?',
      options: [
        'It tests external validity because the test part was not used for fitting',
        'It is the preferred method when the sample is small',
        'It estimates the performance of a model built on only part of the data, with an imprecise estimate from the small test part',
        'It reflects the instability of variable selection better than the bootstrap'
      ],
      answer: 2,
      why: 'A random split tests internal validity only, uses part of the data for fitting (so it is biased for the full-sample model), and the small test part gives imprecise estimates. The misconception in option A is that "unseen data" equals external validation; a random split keeps both parts in the same setting. It is least suitable for small samples, and the bootstrap, not split-sample, best reflects selection instability.'
    },
    {
      q: 'An investigator screened 25 candidate predictors of postpartum haemorrhage univariately (p &lt; 0.20), then used backward selection, and finally bootstrapped the selected 5-predictor model as if it were prespecified. What is the main consequence?',
      options: [
        'The bootstrap optimism is overestimated because too few predictors are included',
        'No consequence, provided at least 200 bootstrap replicates were used',
        'The result is valid because bootstrapping always reflects model uncertainty',
        'The optimism is underestimated because the selection steps were not replayed'
      ],
      answer: 3,
      why: 'Optimism from selection is captured only when selection is repeated in every bootstrap sample. In one book example the optimism in c was 0.07 when all steps were replayed against 0.01 when the final model was treated as predefined. The misconception in option C is that the bootstrap is automatically honest; it reflects only the steps that are replayed. More replicates reduce Monte Carlo noise, not this bias.'
    },
    {
      q: 'A child pneumonia mortality model developed in a randomised trial is validated in an unselected district hospital population with milder and more varied illness. Which transportability aspect is mainly being tested?',
      options: ['Spectrum transportability', 'Methodological transportability', 'Historic transportability', 'Internal validity'],
      answer: 0,
      why: 'Applying a model from a trial population to a broader, less selected population with a different severity distribution tests spectrum transportability. Methodological transportability concerns different data collection methods, historic concerns time periods, and internal validity concerns the development setting itself.'
    },
    {
      q: 'In a leave-one-centre-out validation across eight maternity units, one small unit (35 women, 6 events) shows clear miscalibration while the other seven are well calibrated. What is the most defensible interpretation?',
      options: [
        'The model is invalid and should not be used anywhere',
        'The model is invalid in that unit and should be banned there',
        'Emphasise the general consistency, treat the single unit as a signal needing further validation there, and avoid over-interpreting a small sample',
        'Remove the unit from the analysis because it is an outlier'
      ],
      answer: 2,
      why: 'Geographic validation consists of many small subgroup analyses; differences will always occur with small numbers. The book advises emphasising general consistency, while a striking finding in one setting may justify further validation before use there. Option B over-interprets a result based on six events; deleting the unit (D) hides information.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Bootstrap optimism and calibration-in-the-large by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A preterm-birth model is developed on a district hospital cohort. Its apparent c statistic is 0.760 (apparent calibration slope 1). Five bootstrap replicates are shown below (in practice at least 100 to 200 would be used). For each replicate the full modelling strategy was repeated in the bootstrap sample.</p>
<table class="data">
<thead><tr><th>Replicate</th><th>c in bootstrap sample (c<sub>boot</sub>)</th><th>c in original sample (c<sub>test</sub>)</th><th>Calibration slope in original sample</th></tr></thead>
<tbody>
<tr><td>1</td><td>0.781</td><td>0.741</td><td>0.86</td></tr>
<tr><td>2</td><td>0.774</td><td>0.748</td><td>0.92</td></tr>
<tr><td>3</td><td>0.790</td><td>0.736</td><td>0.80</td></tr>
<tr><td>4</td><td>0.769</td><td>0.745</td><td>0.93</td></tr>
<tr><td>5</td><td>0.786</td><td>0.740</td><td>0.84</td></tr>
</tbody>
</table>
<p>The model is then applied to 1107 women at a referral hospital, of whom 185 have a preterm birth. The mean predicted risk in these women is 13.6%.</p>`,
      questions: [
        '<b>(a)</b> Calculate the optimism for each replicate, the mean optimism, and the optimism-corrected c statistic.',
        '<b>(b)</b> Estimate the optimism-corrected calibration slope. What does it imply for the coefficients?',
        '<b>(c)</b> Calculate the observed outcome frequency at the referral hospital, the ratio of observed to predicted odds, and its logarithm. Interpret the direction.',
        '<b>(d)</b> Which of (a)–(c) estimates internal validity and which external validity?'
      ],
      answer: `<p><b>(a)</b> Optimism = c<sub>boot</sub> − c<sub>test</sub>: 0.781 − 0.741 = 0.040; 0.774 − 0.748 = 0.026; 0.790 − 0.736 = 0.054; 0.769 − 0.745 = 0.024; 0.786 − 0.740 = 0.046. Mean optimism = (0.040 + 0.026 + 0.054 + 0.024 + 0.046)/5 = 0.190/5 = 0.038. Corrected c = 0.760 − 0.038 = <b>0.722</b>.</p>
<p><b>(b)</b> The apparent slope in each bootstrap sample is 1, so the optimism in the slope is 1 − (mean test slope). Mean test slope = (0.86 + 0.92 + 0.80 + 0.93 + 0.84)/5 = 4.35/5 = 0.87. Optimism = 0.13 and the corrected slope is <b>0.87</b>. Predictions will be too extreme in new women from the same setting; multiplying the coefficients by about 0.87 (and re-estimating the intercept) would be expected to improve calibration.</p>
<p><b>(c)</b> Observed frequency = 185/1107 = 0.167 (16.7%). Observed odds = 0.167/0.833 = 0.201; predicted odds = 0.136/0.864 = 0.157. Ratio = 0.201/0.157 = <b>1.27</b>; log ratio = <b>0.24</b>. More preterm births occurred than the model predicted: on average the model underestimates risk at the referral hospital (a calibration-in-the-large problem). The log ratio approximates the calibration-in-the-large intercept a, which is estimated formally by logistic regression with the linear predictor as offset.</p>
<p><b>(d)</b> (a) and (b) are internal validation (same setting, resampled). (c) is external validation (a different hospital and period). Internal validation cannot detect the underestimation in (c), because it arises from differences between settings.</p>`
    },
    {
      id: 't2',
      title: 'Internal versus external performance with the course data',
      level: 'Analyze',
      scenario: `<p>Use the validation lab and the Analysis Lab with the synthetic preterm-birth cohorts. The development data (ptb_dev) come from a district hospital; the validation data (ptb_val) come from a tertiary referral hospital in a later period.</p>`,
      questions: [
        '<b>(a)</b> In the validation lab, run 20 replications at development sizes 250 and 1200. Describe how apparent, split-sample, 10-fold cross-validation and bootstrap estimates of c relate to the true c, and how their spread differs.',
        '<b>(b)</b> In the Analysis Lab, fit the full 14-term model on ptb_dev (complete cases, no selection, no shrinkage). Report apparent c, bootstrap-corrected c and the shrinkage estimate, then the external c, calibration slope and calibration-in-the-large on ptb_val.',
        '<b>(c)</b> Does internal validation predict the external results? Explain which discrepancies are expected and why.'
      ],
      answer: `<p><b>(a)</b> Expected pattern: apparent c lies above the true c, clearly so at n = 250 and only slightly at n = 1200. Split-sample estimates are centred near or below the truth (the model is built on only 2/3 of the data) and scatter widely. Ten-fold cross-validation and bootstrap correction are centred close to the true c with smaller spread; the bootstrap is usually the most stable. All spreads shrink as n increases. The lesson: optimism and instability are small-sample problems, and resampling methods use the data more efficiently than a single split.</p>
<p><b>(b)</b> The lab reproduces the live course values: apparent c <span data-live="ptb_full_apparent_c"></span>, corrected c <span data-live="ptb_full_corrected_c"></span>, shrinkage <span data-live="ptb_full_shrinkage"></span>; on ptb_val c <span data-live="ptb_val_c"></span>, slope <span data-live="ptb_val_slope"></span>, calibration-in-the-large <span data-live="ptb_val_citl"></span>. (Small differences can arise from bootstrap randomness.)</p>
<p><b>(c)</b> Internal validation predicts the effect of overfitting in the development setting only. In the synthetic data-generating process, the referral hospital has (i) a higher baseline risk of preterm birth than explained by the measured predictors, which produces a positive calibration-in-the-large (underestimation), (ii) true predictor effects about 20% weaker, which pushes the external slope below the internal shrinkage estimate, and (iii) an older, higher-risk case-mix, which changes the spread of predicted risks. None of these can be detected from the development data. Internal validation is a minimum requirement; it does not replace external validation.</p>`
    },
    {
      id: 't3',
      title: 'Critique a preeclampsia model validation',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A single tertiary centre reports a model for preterm preeclampsia from 640 women with 41 events. Twenty-eight candidate predictors (clinical, ultrasound and biomarkers) were examined. Predictors with univariate p &lt; 0.10 entered a forward stepwise procedure; categories of parity were merged after inspecting the outcome rates; mean arterial pressure was dichotomised at the value giving the largest odds ratio. The data were split at random into 70% development and 30% "external validation". The first split gave a validation c of 0.68, so the authors re-split and report the second split (c 0.84). They conclude that the model is "externally validated and ready for use in district hospitals". The final coefficients are those from the 70% part.</p>`,
      questions: [
        '<b>(a)</b> List the problems with the validation design and reporting.',
        '<b>(b)</b> Which development choices make poor performance in district hospitals likely?',
        '<b>(c)</b> Propose a better validation plan using only the methods in this module.'
      ],
      answer: `<p><b>(a)</b> Validation problems:</p>
<ol>
<li>A random split is internal validation; calling it "external" is wrong. Both parts come from the same centre and period.</li>
<li>Re-splitting after an unfavourable result and reporting the better split is selective reporting; the reported c (0.84) is biased upwards.</li>
<li>The test part has only about 12 events (30% of 41), so any c statistic or calibration estimate from it is very imprecise.</li>
<li>The split validates a model built on 70% of the data, while the final model should be estimated on all data.</li>
<li>No calibration (calibration-in-the-large, slope) is reported, only c.</li>
</ol>
<p><b>(b)</b> Development choices likely to cause poor transport: very few events for 28 candidates; univariate pre-screening plus stepwise selection, which overfits and gives unstable selection and inflated coefficients; data-driven merging of categories and a data-derived cut-point for blood pressure, both further sources of optimism; no shrinkage; a single tertiary centre with a referral spectrum unlike district hospitals; and biomarkers or ultrasound measures whose methods may differ elsewhere (methodological transportability).</p>
<p><b>(c)</b> Better plan: fit the final model on all 640 women; estimate optimism by bootstrapping with every modelling step replayed in each sample (screening, selection, category merging, cut-point search), or, if some steps cannot be replayed, at least bootstrap the full model with all candidates; report corrected c and calibration slope and consider shrinkage. Then perform genuine external validation: temporal (later patients at the same centre) and, more importantly, geographic or fully independent validation in district hospitals, with predictor definitions and units checked and calibration-in-the-large and slope reported alongside c. Only consistent results across such settings support a claim of readiness for district use.</p>`
    }
  ]
});
