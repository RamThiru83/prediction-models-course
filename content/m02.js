registerModule({
  id: 'm02',
  num: 2,
  part: 'Development',
  title: 'Study design, predictors, outcome and sample size',
  book: 'Ch. 3',
  minutes: 75,
  summary: 'How the design of a prediction study, the definition and reliability of predictors, the choice of outcome and the number of events determine whether a model can be trusted.',
  objectives: [
    'Distinguish prognostic cohort designs from diagnostic cross-sectional designs and name the main bias of each.',
    'Explain verification bias and correct the intercept of a model built on a case-control sample.',
    'Judge the strength of a binary predictor from its odds ratio and its prevalence.',
    'Calculate the observed odds ratio and kappa when a binary predictor is measured with error.',
    'Calculate events per variable and the number of events needed for a stated number of candidate predictors.',
    'Evaluate a proposed study design for predictor timing, outcome definition and sample size.'
  ],
  sections: [
    {
      id: 's1',
      title: 'Two kinds of study: prognostic and diagnostic',
      html: `
<p>The quality of a prediction model depends largely on the design and quality of the data. A sophisticated analysis cannot rescue a poorly designed study or poor data collection. The first design decision is whether the question is prognostic or diagnostic.</p>
<h3>Prognostic studies</h3>
<p>A prognostic study is longitudinal. A <b>cohort</b> is defined by a characteristic (for example, booking for antenatal care at a clinic, or being born in a hospital), the predictors are recorded at a starting point and the patients are followed over time until the outcome occurs or follow-up ends. The model estimates the probability of a future outcome.</p>
<h3>Diagnostic studies</h3>
<p>A diagnostic study is usually <b>cross-sectional</b>. The group is defined by a symptom or sign that raises suspicion of a target disease. Each patient undergoes the <b>index test</b> (the predictors, which may include history, examination and simple tests) and a <b>reference standard</b> that establishes whether the disease is truly present, over a short time span. The outcome is the underlying diagnosis.</p>
<div class="callout mch"><b>Illustrative (synthetic)</b>
<p>The course dataset <b>ptb_dev</b> is prognostic: women are enrolled at antenatal booking and the outcome, delivery before 37 weeks, is observed months later. The dataset <b>sepsis</b> is diagnostic: newborns with suspected infection are examined and tested at about one time, and the outcome is whether sepsis is present.</p></div>
<p>Both kinds of study "have a cohort" in that patients are selected by a shared characteristic, and the statistical analysis is similar (typically logistic regression). The difference lies in timing and in the risks to validity. Prognostic studies worry about how patients were selected, how complete and accurate the predictors were, and whether follow-up was complete. Diagnostic studies worry about the reference standard and about which patients actually received it.</p>
<p class="src">Source: Ch. 3, §3.1</p>`
    },
    {
      id: 's2',
      title: 'Cohort designs for prognosis',
      html: `
<p>Several designs can provide the cohort. Each has strengths and limitations, summarised below.</p>
<table class="data">
<tr><th>Design</th><th>Strengths</th><th>Limitations</th></tr>
<tr><td>Retrospective cohort (patients identified from records)</td><td>Simple, cheap; records are easily searched, especially electronic ones.</td><td>Selection of patients (missed or mis-recorded cases); predictor definitions and completeness not by protocol; outcome not assessed by protocol; single-centre samples are often small.</td></tr>
<tr><td>Prospective cohort</td><td>Well-defined patient selection, predictors recorded prospectively with quality checks, outcome assessed at pre-defined times.</td><td>Costly; if data come from a trial, strict inclusion and exclusion criteria limit generalisability.</td></tr>
<tr><td>Registry</td><td>Complete coverage of an area or insured population; large; prospective recording.</td><td>Level of detail is limited; outcome often limited to survival; coding may be biased by reimbursement.</td></tr>
<tr><td>Nested case-control</td><td>Efficient when the outcome is rare; detailed predictors measured only in cases and a sample of controls.</td><td>Selection of controls is critical; predictor assessment in retrospect; absolute risks need adjustment (below).</td></tr>
</table>
<h3>Randomised trial data</h3>
<p>Prediction models are frequently developed in data from trials. The benefits are well-defined selection, prospective recording of predictors, assessment of the outcome by protocol and usually decent sample size. Multi-centre trials also force common definitions across sites and increase generalisability, as opposed to single-centre studies that reflect one setting. The limitation is stringent inclusion and exclusion criteria. A debated question is whether to use only the control arm. Combining the treatment arms assumes there are no subgroup effects relevant to the prognostic model, which is generally reasonable because a treatment effect is usually small relative to the prognostic effects of other predictors.</p>
<h3>Nested case-control designs and the intercept</h3>
<p>If the outcome is rare (say 30-day mortality of 1%), it may be efficient to collect detailed predictors in all patients who died and in a random sample of survivors (controls), for example 4 controls per case. A logistic model fitted in such a sample gives valid <b>coefficients</b>, but the sample contains far more events than the population, so the predicted probabilities are wrong unless the average outcome incidence is adjusted for in the final calculation of risk.</p>
<div class="callout warn"><b>Critical: absolute risks from a case-control sample need a corrected intercept</b>
<p>Using the uncorrected model would overstate every patient's risk. The odds of the outcome in the sample exceed the population odds by a factor of 1 / f, where f is the fraction of controls sampled (all cases kept). The intercept is therefore too high by ln(1 / f), and the correction is to subtract it. The slope coefficients are unchanged.</p></div>
<div class="callout eg"><b>Worked example (general statistics, Illustrative)</b>
<p>All deaths are kept and 4% of survivors are sampled (f = 0.04). Population odds of death = 0.01 / 0.99 = 0.0101. Sample odds = 0.01 / (0.99 × 0.04) = 0.2525, which is 25 times larger. The intercept from the case-control model must be reduced by ln 25 = 3.22. If the sampling was 10% of controls the correction would be ln 10 = 2.30.</p></div>
<p>Registries need a note of caution as well. They give large samples and representativeness for a limited number of predictors and a survival outcome, but important predictors (such as performance status) may be absent, and when reimbursement depends on severity, comorbidity recorded in claims data may be biased upwards.</p>
<p class="src">Source: Ch. 3, §3.2, Table 3.1; the intercept correction follows from the sampling fractions</p>`
    },
    {
      id: 's3',
      title: 'Diagnostic designs and verification bias',
      html: `
<p>In an ideal diagnostic study, a well-defined group of suspected patients all receive the index tests and the reference standard, and the reference standard is interpreted without knowledge of the index-test results. This blinding prevents <b>information bias</b> (also called incorporation or diagnostic-review bias): if the person making the diagnosis knows the predictor values, the diagnosis will agree with the predictors more than it should. No reference standard is a perfect "gold" standard, but it should be the best available.</p>
<h3>Predictors that are not recorded in all patients</h3>
<p>A common problem is incomplete registration. Not all patients receive the entire diagnostic work-up, especially if they are judged to have a low probability of disease, and the reference standard may be applied selectively. This is frequent in routine-practice data, which is why prospective studies with a protocol are preferable.</p>
<h3>Verification bias</h3>
<p>If the reference standard is performed only in patients whose index tests are abnormal, patients who test negative are classified by follow-up or are not classified at all. This is <b>verification bias</b>. It biases estimates of the index test's sensitivity and specificity; in the example below, performance is overestimated.</p>
<div class="callout book"><b>Book example</b>
<p>C-reactive protein (CRP) was studied for diagnosing acute appendicitis. Surgery and pathology were the reference test for patients with a high CRP. Patients with a low CRP were not operated and were classified by clinical follow-up. Because low-grade infections may resolve spontaneously, cases with low CRP are missed by this verification strategy, and the performance of CRP is overestimated.</p></div>
<div class="callout mch"><b>Illustrative (synthetic)</b>
<p>In a newborn unit, blood cultures are taken in every newborn with a high CRP, but only in those with a low CRP who deteriorate. Cases of culture-positive sepsis with low CRP are then partly unrecorded, and a model built on this register makes CRP look more informative than it is.</p></div>
<h3>Case-control selection in diagnosis</h3>
<p>Selecting patients by their disease status (cases defined by the reference test, controls without disease) produces <b>selection bias</b>, the main limitation of diagnostic case-control studies. Empirical evidence shows that bias arises when non-consecutive patients are enrolled, when severe cases are compared with healthy controls (an unrepresentative spectrum), and when data are collected retrospectively. A diagnostic study that includes a prevalence figure should check whether the sample is representative: in the book's example of renal artery stenosis, a 20% prevalence in 635 angiography patients (128 cases) may be an overestimate because patients had angiography when stenosis was suspected.</p>
<div class="callout key"><b>Key idea</b><p>The prediction rule is meant for all patients with suspicion of the disease. The development sample should contain all of them, consecutively, with the reference standard applied independently of the index tests.</p></div>
<p class="src">Source: Ch. 3, §3.3</p>`
    },
    {
      id: 's4',
      title: 'Predictors: strength, categories, cost and reliability',
      html: `
<h3>Strength depends on association and distribution</h3>
<p>For a well-performing model, strong predictors are needed. The strength of a predictor is a function of its association with the outcome and of its distribution. A dichotomous predictor with an odds ratio of 2.0 and 50% prevalence is more relevant for prediction than one with an odds ratio of 2.5 and 1% prevalence, because the rare predictor changes the prediction for very few patients. Similarly, continuous predictors have to cover a wide range of values to be useful.</p>
<div class="callout eg"><b>Worked illustration (general statistics, Illustrative)</b>
<p>Take an outcome incidence of 10% and measure how well each binary predictor separates events from non-events with the c statistic. For a single binary predictor, c = (sensitivity + specificity) / 2.</p>
<ul>
<li>OR 2.0, prevalence 50%: risk 7.0% without and 13.0% with the predictor. Sensitivity 65%, specificity 52%, c = 0.58.</li>
<li>OR 2.5, prevalence 1%: risk 9.9% without and 21.5% with. Sensitivity 2%, specificity 99%, c = 0.51.</li>
</ul>
<p>The higher odds ratio of the rare predictor hardly separates patients at all.</p></div>
<p>Key predictors should be registered carefully, with clear definitions and preferably no missing values. This is usually best achieved in a prospective study with a protocol and pre-specified data collection forms.</p>
<h3>Categories of predictors</h3>
<ul>
<li>Demographics (age, sex, socio-economic status)</li>
<li>Type and severity of disease (presenting characteristics)</li>
<li>History (previous episodes, risk factors)</li>
<li>Comorbidity</li>
<li>Physical functional status</li>
<li>Subjective health status and quality of life</li>
</ul>
<p>Definitions vary between studies (socio-economic status can be based on income, occupation or an area-level indicator), and variation in definitions is a serious threat to generalisability. Another way to look at predictors is to separate the patient's <b>condition</b> (disease type, severity, history) from the patient's <b>constitution</b> (age, sex, genetic makeup). Prognosis can also be seen as determined by environment, host and disease.</p>
<h3>Cost and incremental value</h3>
<p>Information that is easy to obtain should be considered first: demographics and history, then simple diagnostic tests, then invasive or costly tests. A costly test such as a genetic marker should be judged by its <b>incremental value</b>: fit a model without the test and then one with it, and compare the quality of the predictions.</p>
<h3>Reliability: observer and biological variability</h3>
<p>Predictors should be well defined and reliably measured by any observer. <b>Observer variability</b> is measured by kappa, an agreement statistic corrected for chance. If p<sub>o</sub> is the observed proportion of agreement and p<sub>e</sub> the proportion expected by chance from the marginal totals:</p>
<div class="formula">kappa = (p<sub>o</sub> − p<sub>e</sub>) / (1 − p<sub>e</sub>)</div>
<p>A kappa of 1 is perfect agreement and 0 is chance level. In the book's example, agreement between pathologists on histology in Barrett's oesophagus (high-grade dysplasia versus adenocarcinoma) is only fair, with kappa about 0.4. <b>Biological variability</b> arises in measurements such as blood pressure, where a single reading is unreliable and several readings, spread over time, are preferred, with clearly defined conditions.</p>
<h3>Regression dilution bias</h3>
<p>Unreliable measurement of a predictor generally weakens (dilutes) its association with the outcome. This is called <b>regression dilution bias</b>. Repeating the measurement (the mean of three blood pressure readings) or using different observers (double reading of mammograms) can reduce it.</p>
<div class="callout eg"><b>Worked example (book simulation, recalculated)</b>
<p>A binary predictor with true odds ratio 4 is judged by an observer with sensitivity = specificity = 80%. Prevalence of the true predictor 50%; outcome incidence 50%, so the outcome risk is 1/3 when the true predictor is 0 and 2/3 when it is 1. Take 1000 patients: 500 with true predictor 1 and 500 with 0.</p>
<ol>
<li>Observer scores positive: 0.8 × 500 + 0.2 × 500 = 500 patients. Of these 0.8 × 500 × (2/3) + 0.2 × 500 × (1/3) = 266.7 + 33.3 = 300 have the outcome (60%).</li>
<li>Observer scores negative: 500 patients, with 200 outcomes (40%).</li>
<li>Observed OR = (0.60 / 0.40) / (0.40 / 0.60) = 1.5 / 0.667 = 2.25, against the true 4.</li>
<li>For a binary predictor c = (sensitivity + specificity) / 2 with respect to the outcome: true predictor 0.667, observer 0.60.</li>
<li>Agreement between two independent observers: p<sub>o</sub> = 0.8² + 0.2² = 0.68, p<sub>e</sub> = 0.5, kappa = (0.68 − 0.50) / 0.50 = 0.36.</li>
</ol>
<p>An observer who is right 80% of the time diluted the OR from 4 to 2.25 and the c from 0.67 to 0.60. Kappa alone (0.36) would look "fair to poor".</p></div>
<div data-widget="regressionDilution"></div>
<ul class="try">
<li>Keep the defaults (80%, 80%, true OR 4, prevalence 50%) and compare the expected observed 2 × 2 table, observed OR, kappa and c with the worked example.</li>
<li>Raise both observer sensitivity and specificity to 90% and note how kappa, the observed OR and the c statistic move towards the truth.</li>
<li>Lower the prevalence of the true predictor to 20% with 80% / 80% and observe what happens to kappa.</li>
</ul>
<h3>Choice of predictors in practice</h3>
<p>In aetiological research one wants the best possible measurement of the exposure. For a model that will be used in daily practice, one should use definitions and measurement procedures that match daily practice. For example, if surgical decisions are made on the local pathology report without expert review, the local report should be the predictor. Such measurement error is part of what the model must cope with. Practical models therefore use predictors that are readily available, not too costly, and measurable with reasonable precision.</p>
<p class="src">Source: Ch. 3, §3.4-3.5</p>`
    },
    {
      id: 's5',
      title: 'The outcome',
      html: `
<p>The outcome of a prediction model should be relevant, from a medical or a research point of view, and it should be measured accurately.</p>
<h3>Types of prognostic outcome</h3>
<table class="data">
<tr><th>Type</th><th>Examples</th><th>Characteristics</th></tr>
<tr><td>Fatal events</td><td>All-cause or cause-specific mortality</td><td>Hard end point, relevant in many diseases but sometimes too infrequent for reliable modelling.</td></tr>
<tr><td>Non-fatal events</td><td>Recurrence, cardiovascular events</td><td>Somewhat softer, reflects physicians' decisions, increases the number of events.</td></tr>
<tr><td>Patient-centred</td><td>Symptoms, functional status, quality of life</td><td>Subjective, focuses on the patient; often secondary.</td></tr>
<tr><td>Wider burden</td><td>Absence from work</td><td>Of interest from an economic perspective.</td></tr>
</table>
<h3>Survival end points</h3>
<p>When the cause of death is not reliably known, <b>relative survival</b> compares mortality in a group of patients with mortality in the general population, and the difference is attributed to the disease. It is popular in cancer research. In the book's example, 5-year relative survival for patients registered in SEER in 1990-1999 was 63%, varying with cancer site and stage.</p>
<h3>Composite end points</h3>
<p>A composite combines several events (for example death or hospitalisation). The advantage is more events, so a larger effective sample size and more power. The price is an assumption that predictors affect the components similarly, which is often untrue, and the resulting model may predict less well.</p>
<div class="callout book"><b>Book example</b>
<p>A model in 949 patients with decompensated heart failure had c = 0.77 for 60-day mortality but only 0.69 for the composite of death or rehospitalisation.</p></div>
<h3>Continuous, ordinal and binary outcomes</h3>
<p>Statistically, continuous outcomes give more power than ordinal outcomes, which give more than binary outcomes. In practice binary outcomes dominate, so logistic and Cox regression are the most common models.</p>
<h3>Diagnostic end points</h3>
<p>The outcome is the underlying disease, defined by a reference standard (a culture, an angiogram, a histological finding, an anatomical finding at surgery). Methods are still being developed for when no acceptable reference standard exists. A diagnosis can cover a spectrum from mild to severe disease, and newer detection technology may find disease that previously went unnoticed, so the clinical relevance of the additional detection should be established.</p>
<div class="callout mch"><b>Illustrative (synthetic)</b>
<p>Gestational age at delivery is used to define preterm birth. If gestational age is dated sometimes by ultrasound and sometimes by the last menstrual period, the same outcome label hides measurement differences. The outcome should be defined as carefully as in a trial.</p></div>
<h3>Rigour of the outcome versus pragmatism of the predictors</h3>
<p>Predictors may be pragmatic (as measured in practice), but the outcome should be measured with the same rigour as in an aetiological study or a randomised trial, because decisions will be based on predictions of that outcome.</p>
<h3>Phases of biomarker development</h3>
<p>A new marker passes through phases from exploratory to impact studies, and the design should fit the phase.</p>
<table class="data">
<tr><th>Phase</th><th>Objective</th><th>Study design</th></tr>
<tr><td>1. Preclinical exploratory</td><td>Identify promising directions</td><td>Case-control (convenience samples)</td></tr>
<tr><td>2. Clinical assay and validation</td><td>Does the assay detect established disease?</td><td>Case-control (population based)</td></tr>
<tr><td>3. Retrospective longitudinal</td><td>Does the marker detect disease before it becomes clinical?</td><td>Nested case-control in a cohort</td></tr>
<tr><td>4. Prospective screening</td><td>Extent and characteristics of disease detected; false referral rate</td><td>Cross-sectional population cohort</td></tr>
<tr><td>5. Disease control</td><td>Effect of screening on the burden of disease</td><td>Randomised trial</td></tr>
</table>
<p class="src">Source: Ch. 3, §3.6-3.7, Tables 3.5-3.6</p>`
    },
    {
      id: 's6',
      title: 'Sample size: power and events per variable',
      html: `
<p>Sample size questions come in two forms: how many patients are needed to detect the effect of a specific predictor, and how many are needed to obtain reliable predictions.</p>
<h3>Power to identify a predictor effect</h3>
<p>This is the classical sample-size calculation. The <b>Type I error</b> (declaring an effect when none exists) is usually set at 5%. The <b>Type II error</b> (missing a real effect) is often set at 20%, which is 80% <b>power</b>. For a binary predictor and a binary outcome, the required sample size depends on four things: the prevalence of the predictor, the incidence of the outcome, the size of the effect (OR) and the error rates. Smaller effects and values of incidence or prevalence nearer 0 or 100% need more patients.</p>
<table class="data">
<tr><th>Book results (80% power, 5% Type I error)</th><th>Required sample</th></tr>
<tr><td>OR 1.5, predictor prevalence 50%, outcome incidence 10%</td><td>about 2,000</td></tr>
<tr><td>OR 1.5, prevalence 50%, incidence 20%</td><td>about 1,000</td></tr>
<tr><td>OR 1.5, prevalence 50%, incidence 50%</td><td>about 800</td></tr>
<tr><td>OR 1.2, prevalence 50%, incidence 50%</td><td>about 3,800</td></tr>
<tr><td>n = 500 (250 events), OR 2: prevalence needed</td><td>16%</td></tr>
<tr><td>n = 500 (250 events), OR 3: prevalence needed</td><td>5.5%</td></tr>
<tr><td>n = 500 at 10% incidence, OR 3: prevalence needed</td><td>18%</td></tr>
</table>
<p>If there is no effect (OR = 1), a significant result is expected in 5% of studies by definition. The sample sizes show how demanding even a modest predictor effect is.</p>
<h3>Reliable predictions: events per variable</h3>
<p>Predictions are reliable only if the model is not overfitted, and overfitting depends on the number of events relative to the number of predictors considered. The rule of thumb is expressed as <b>events per variable (EPV)</b>:</p>
<div class="formula">EPV = number of events / number of candidate predictor parameters</div>
<p>"Candidate predictor parameters" counts every coefficient that was a candidate to enter the model; a predictor that needs two coefficients (for example age with a quadratic term) counts as two. The number of events is the effective sample size from Module 1. Rules of thumb from the book:</p>
<table class="data">
<tr><th>EPV</th><th>Meaning</th></tr>
<tr><td>&lt; 10</td><td>Model likely overfitted, may predict worse than a simpler model with fewer predictors.</td></tr>
<tr><td>&ge; 10</td><td>Minimum for obtaining good predictions.</td></tr>
<tr><td>&ge; 20</td><td>For a pre-specified model, shrinkage may not be required (Module 10).</td></tr>
<tr><td>&ge; 50 per candidate predictor</td><td>Reliable selection of predictors from a larger set of candidates (Module 8).</td></tr>
</table>
<p>For validating an existing model, at least 100 events may be needed (Module 14). Other values may apply to particular circumstances: regression can be performed technically with lower EPV, and an analysis that only adjusts the effect of one exposure for confounders may use EPV below 10.</p>
<div class="callout eg"><b>Worked example (Illustrative, synthetic): the preterm-birth cohort</b>
<p>The full ptb_dev model has 14 terms with 15 parameters (age uses two). With 2,000 women and an incidence of 12%, there are 240 events.</p>
<ol>
<li>EPV = 240 / 15 = 16: above the minimum of 10 and not yet at 20.</li>
<li>To reach EPV 10 with 15 parameters you need 150 events, which at 12% incidence means 150 / 0.12 = 1,250 women.</li>
<li>EPV 20 needs 300 events (2,500 women); EPV 50 needs 750 events (6,250 women).</li>
</ol>
<p>So the data are enough for fitting the full pre-specified model, but not enough to select reliably among the 15 candidates.</p></div>
<div class="callout mch"><b>Illustrative (synthetic)</b>
<p>The synthetic sepsis dataset has <span data-live="sepsis_n"></span> newborns and <span data-live="sepsis_events"></span> events, with 11 candidate predictor columns. Dividing the events by 11 gives an EPV below 10: this dataset is a convenient example for studying overfitting in small samples.</p></div>
<div data-widget="epvCalculator"></div>
<ul class="try">
<li>Enter 240 events and 15 candidate parameters. Which band is shown, and how many events would reach the next band?</li>
<li>Keep 240 events and raise the number of candidate parameters to 40. Note when the verdict changes.</li>
<li>Enter 48 events and 12 parameters, then reduce the parameters until the verdict reaches the minimum band.</li>
</ul>
<div class="callout warn"><b>Critical: counting patients instead of events</b>
<p>A cohort of 10,000 women sounds large, but an outcome with incidence 0.5% gives 50 events, enough for only about 5 candidate parameters at the minimum EPV of 10. Always compute EPV before analysing.</p></div>
<p class="src">Source: Ch. 3, §3.8, Figs 3.3-3.4</p>`
    },
    {
      id: 's7',
      title: 'A design checklist for a prediction study',
      html: `
<p>The book's concluding remarks on design translate into a checklist that can be applied to any proposal.</p>
<table class="data">
<tr><th>Question</th><th>Preferred answer</th></tr>
<tr><td>Prognostic study design</td><td>Prospective cohort where selection of patients and definition of predictors are pre-specified. Trial data are useful, but representativeness of the included patients for the target population is a limitation. Retrospective, registry and case-control designs are possible with their limitations.</td></tr>
<tr><td>Diagnostic study design</td><td>Cross-sectional; prospectively select all patients suspected of the disease; apply the reference standard to all, blind to the index tests.</td></tr>
<tr><td>Predictors</td><td>Defined pragmatically as in practice, covering the relevant domains, available when the prediction is needed, and measured reliably enough.</td></tr>
<tr><td>Outcome</td><td>Relevant and measured with high accuracy. Hard end points such as mortality are often preferred, but power considerations may motivate composite or other end points.</td></tr>
<tr><td>Sample size</td><td>Count events, compute EPV for the candidate parameters, and match the ambition (selection, non-linear effects, interactions) to the number of events.</td></tr>
</table>
<h3>How the design connects to later modules</h3>
<ul>
<li>Missing predictor data (Module 5) become less of a problem when predictors are recorded prospectively and with pre-specified forms.</li>
<li>The number of candidate predictors determines what a modelling strategy can afford (Modules 7-10).</li>
<li>An outcome with measurement error limits any performance you can show (Module 11).</li>
<li>A development sample from one hospital can only support conclusions about that hospital until external validation (Module 14).</li>
</ul>
<div class="callout key"><b>Key idea</b><p>Most of the problems in prediction models are fixed or created at the design stage: who was included, what was measured and when, how the outcome was defined and how many events occurred.</p></div>
<p class="src">Source: Ch. 3, §3.9</p>`
    }
  ],
  keyPoints: [
    'Prognostic studies are longitudinal cohorts; diagnostic studies are usually cross-sectional with an index test and a reference standard.',
    'Prospective cohorts are preferred for prognosis; retrospective, registry, trial and case-control data each have specific limitations.',
    'In a nested case-control design the coefficients are valid, but the intercept must be corrected (by ln of the control sampling ratio) before predicting absolute risks.',
    'Verification bias, when the reference standard is applied selectively, overestimates test performance.',
    'A predictor is strong through both its odds ratio and its prevalence; a rare predictor has little effect on predictions.',
    'Unreliable predictor measurement dilutes associations: a true OR of 4 fell to 2.25 with 80% sensitivity and specificity.',
    'Outcomes must be measured accurately; composite outcomes add events but assume similar predictor effects on components.',
    'EPV = events / candidate parameters; below 10 is risky, 20 or more may not need shrinkage, 50 is needed for reliable selection.'
  ],
  quiz: [
    {
      q: 'In a study of CRP for diagnosing appendicitis, patients with high CRP had surgery and pathology, while those with low CRP were not operated and were classified by follow-up. What is the likely effect on the estimated diagnostic performance of CRP?',
      options: [
        'It is underestimated, because low CRP patients are under-represented.',
        'It is overestimated, because low-CRP patients with disease are missed by the verification strategy.',
        'It is unaffected, because CRP is measured in everyone.',
        'It is unbiased for sensitivity but biased for specificity only.'
      ],
      answer: 1,
      why: 'Verification bias: disease in low-CRP patients may resolve unseen or be missed, so false negatives are not counted and performance is overestimated. Measuring the index test in everyone (third option) does not help if the reference standard is applied depending on the test result. The book describes the overestimation without separating sensitivity from specificity.'
    },
    {
      q: 'Which binary predictor contributes more to prediction when the outcome incidence is the same?',
      options: [
        'OR 2.5 with 1% prevalence, because the odds ratio is larger.',
        'Both contribute equally, because strength is determined by the odds ratio alone.',
        'Neither, as both ORs are below 3.',
        'OR 2.0 with 50% prevalence, because it changes the prediction for many more patients.'
      ],
      answer: 3,
      why: 'The strength of a predictor depends on the association and the distribution. A rare predictor changes the predicted risk of very few patients (c = 0.51 versus 0.58 in the worked illustration at 10% incidence). Judging by the OR alone is the commonest misconception.'
    },
    {
      q: 'A cohort has 60 events and 12 candidate predictor parameters. What is the EPV and what does it imply?',
      options: [
        'EPV = 5; below 10, with a risk of overfitting; use fewer candidates or more events.',
        'EPV = 12; adequate, because it exceeds 10.',
        'EPV = 60; adequate, because there are 60 events.',
        'EPV = 20; adequate because shrinkage is not needed.'
      ],
      answer: 0,
      why: 'EPV = 60 / 12 = 5. Below 10, the model is likely to be overfitted and a simpler model may predict better. Dividing in the wrong direction (12 / 60 = 0.2) or quoting the number of events alone ignores the number of candidates. An EPV of 20 would need 240 events for 12 parameters.'
    },
    {
      q: 'A predictor with true OR 4 is measured by an observer with sensitivity and specificity of 80%. What happens to its association with the outcome?',
      options: [
        'It is exaggerated, since misclassified patients add false associations.',
        'It is unchanged on average, because random error cancels out.',
        'It is diluted toward 1: the observed OR is about 2.25 and the c statistic falls.',
        'It is eliminated: the observed OR is 1.'
      ],
      answer: 2,
      why: 'Non-differential misclassification (regression dilution) weakens the association; the book simulation gives an observed OR of 2.25 and a c statistic falling from 0.67 to 0.60. Random error does not cancel out; it attenuates. The association is reduced, but not removed.'
    },
    {
      q: 'A nested case-control study kept all deaths and a random 10% of survivors. The fitted logistic model has intercept −0.40. What intercept is appropriate for predicting absolute risk in the whole population?',
      options: [
        '−0.40, since sampling does not affect the intercept.',
        '+1.90',
        '−0.04',
        '−2.70'
      ],
      answer: 3,
      why: 'Controls were sampled at f = 0.10, so the sample odds are 10 times the population odds and the intercept is too high by ln 10 = 2.30: −0.40 − 2.30 = −2.70. The coefficients are valid without correction. Using the uncorrected intercept would grossly overestimate risk. Adding the correction (+1.90) gets the direction wrong, and dividing the intercept by 10 has no justification.'
    },
    {
      q: 'What is the main price paid for using a composite end point in a prediction model?',
      options: [
        'The effective sample size is reduced.',
        'It assumes that the predictors act similarly on the component events, and prediction may be poorer than for the single hard end point.',
        'The model can no longer be fitted with logistic regression.',
        'Composite end points are always less reliable to measure than death.'
      ],
      answer: 1,
      why: 'A composite increases the number of events, hence power, but requires predictors to relate similarly to each component. In the heart-failure example c fell from 0.77 for mortality to 0.69 for the composite. The first option states the opposite of the benefit. Logistic or Cox regression handles composites without difficulty.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'How many events do we need?',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A research group plans a neonatal sepsis prediction model using records of 600 newborns from one unit. The incidence of sepsis is 8%. The group wants to examine 12 candidate predictor parameters. They also hope to use stepwise selection.</p>`,
      questions: [
        '<b>(a)</b> Calculate the number of events and the EPV.',
        '<b>(b)</b> How many candidate parameters could they afford at EPV 10?',
        '<b>(c)</b> How many events, and how many newborns at 8% incidence, would be needed for the 12 parameters at EPV 10, 20 and 50?',
        '<b>(d)</b> Confirm (a) and (c) with the EPV calculator and suggest two options for the group if more data cannot be obtained.'
      ],
      answer: `<p><b>(a)</b> Events = 0.08 × 600 = 48. EPV = 48 / 12 = 4.</p>
<p><b>(b)</b> At EPV 10 the maximum is 48 / 10 = 4.8, so about 4 candidate parameters.</p>
<p><b>(c)</b></p>
<table class="data">
<tr><th>Target EPV</th><th>Events = 12 × EPV</th><th>Newborns = events / 0.08</th></tr>
<tr><td>10</td><td>120</td><td>1,500</td></tr>
<tr><td>20</td><td>240</td><td>3,000</td></tr>
<tr><td>50</td><td>600</td><td>7,500</td></tr>
</table>
<p><b>(d)</b> The calculator should give EPV 4 (below 10, risk of overfitting) and the same event requirements. Options: (1) reduce the candidate parameters to about 4 using subject-matter knowledge before looking at the outcome (for example by combining related signs), (2) extend the data collection (another unit, a longer period) or pool data to reach 120 events. Stepwise selection from 12 candidates with 48 events (EPV 4) is not advisable because selection needs about 50 events per candidate. The overfitting that results is the subject of Module 4.</p>`
    },
    {
      id: 't2',
      title: 'How much does measurement error dilute a predictor?',
      level: 'Apply',
      scenario: `<p>Open the regression dilution widget in Section 4. A binary predictor (for example presence of a clinical sign scored by two independent observers) has true OR 4 and prevalence 50%.</p>`,
      questions: [
        '<b>(a)</b> With observer sensitivity and specificity both 80%, record the observed OR, kappa and c statistics for the true and the observed predictor.',
        '<b>(b)</b> Raise both to 90%. Predict by hand the kappa between the two observers (observed agreement and chance agreement, 50% prevalence), then check against the widget. What happens to the observed OR?',
        '<b>(c)</b> With 80%/80% reduce the prevalence of the true predictor to 20%. What happens to kappa? Why?',
        '<b>(d)</b> A colleague says "kappa of 0.36 shows poor agreement, so we should drop the sign". Give a counter-argument based on the book.'
      ],
      answer: `<p><b>(a)</b> Observed OR = 2.25, kappa = 0.36, c = 0.67 for the true predictor and 0.60 for the observed one (the book's simulation; hand derivation in the worked example in Section 4).</p>
<p><b>(b)</b> Agreement p<sub>o</sub> = 0.9² + 0.1² = 0.82; chance agreement p<sub>e</sub> = 0.5; kappa = (0.82 − 0.50) / 0.50 = 0.64. The observed OR rises towards 4; with the outcome set-up of the worked example (50% incidence, risks 1/3 and 2/3 by true status) it is about 2.98, and c is about 0.63 (true 0.67). The widget's own outcome assumptions may differ a little, so use it for direction rather than exact figures.</p>
<p><b>(c)</b> Kappa falls (to about 0.26): p<sub>o</sub> stays 0.68, but chance agreement rises to about 0.56 because both observers mostly say "negative" when the predictor is rare. Kappa penalises agreement that could occur by chance, so the same accuracy gives lower kappa for a rare sign.</p>
<p><b>(d)</b> The book shows that unreliable measurement dilutes but does not destroy a predictor: with 80% accuracy the OR is still 2.25 and c 0.60. It also says that, for a model used in practice, one should use predictors as they are measured in practice; therefore the variable should be judged by its performance with real-world measurement, and its reliability may be improved by repeated or double reading, or by a consensus procedure, rather than dropped.</p>`
    },
    {
      id: 't3',
      title: 'Critique a retrospective preterm-birth model',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A tertiary hospital team reviews 380 delivery records from 2014 to 2018 to build a preterm-birth model. There were 42 preterm births. They screened 38 candidate variables (continuous and categorical, giving about 38 parameters), kept 7 by stepwise selection at p &lt; 0.05, and report an apparent c statistic of 0.84. Cervical length was one of the selected predictors but was measured with transvaginal ultrasound in only 120 women, mostly those with a previous preterm birth or symptoms; for the others it was entered as "normal". Gestational age was taken as the "clinician's estimate" recorded in the discharge summary. The authors conclude that the model "can be used in all antenatal clinics".</p>`,
      questions: [
        '<b>(a)</b> Calculate the EPV and comment.',
        '<b>(b)</b> Identify the design problems affecting the predictors and the outcome.',
        '<b>(c)</b> Comment on the validation and the conclusion.',
        '<b>(d)</b> List the changes that would most improve the study, in order of priority.'
      ],
      answer: `<p><b>(a)</b> EPV = 42 / 38 = 1.1, far below 10 (the minimum), and far below the 50 events per candidate needed for reliable selection. <b>Critical:</b> with so few events per candidate parameter the model is severely overfitted, and stepwise selection from 38 candidates in 42 events will pick up noise.</p>
<p><b>(b)</b> Retrospective chart review: patient identification, predictor definitions and completeness are not by protocol. The cervical length was recorded selectively (120 of 380, 32%), by indication; recording "normal" for unmeasured women is a selective-measurement problem similar in spirit to verification bias: whether the measurement was made depended on suspected risk, and the entry misclassifies women who were not measured. A predictor that is mostly absent in low-risk women acts as a marker of the clinician's suspicion. The outcome, gestational age, relied on an unspecified "clinician's estimate" rather than a consistent dating method, which means error in the outcome label; the outcome should be measured as accurately as in a trial. Single tertiary hospital: women are a referral population, not representative of antenatal clinics.</p>
<p><b>(c)</b> Only the apparent c is shown. With EPV near 1 the apparent c of 0.84 is likely to be heavily inflated; the optimism should be estimated by bootstrapping the whole selection process (Module 13), and the model needs external validation before any claim about other clinics. "Can be used in all antenatal clinics" does not follow from development data in one hospital, which reflects only that hospital's setting.</p>
<p><b>(d)</b> Priority: (1) obtain more events (multi-centre or prospective data) and restrict candidates to a small set chosen with subject-matter knowledge before looking at the outcome, (2) use predictors available at booking, measured as in routine practice, with pre-specified definitions (cervical length only if routinely measured in all), (3) define gestational age by a consistent method, (4) report validation including bootstrap optimism and later external validation.</p>`
    }
  ]
});
