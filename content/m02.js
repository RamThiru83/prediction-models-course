registerModule({
  id: 'm02',
  num: 2,
  part: 'Development',
  title: 'Study design, predictors, outcome and sample size',
  book: 'Ch. 3',
  minutes: 70,
  summary: 'How the design of a prediction study, the definition and reliability of predictors, the choice of outcome and the number of events determine whether a model can be trusted.',
  objectives: [
    'Choose a data source for a model',
    'Correct risks from a case-control sample',
    'Spot verification bias',
    'Judge a predictor by its odds ratio and how common it is',
    'See how measurement error weakens a predictor',
    'Count events per variable'
  ],
  format: 'cases',
  essentials: `
<ul>
<li>A model is only as good as the data it is built from. Clever statistics cannot rescue a badly designed study.</li>
<li>A <b>prognostic</b> study follows people forward in time: predictors are recorded first, the outcome is seen later. A <b>diagnostic</b> study looks at one moment: a test result (the <b>index test</b>) is compared with the best available answer (the <b>reference standard</b>).</li>
<li>The best source for a prognostic model is usually a <b>prospective cohort</b>, planned in advance. Old records, registries and trial data can be used, but each has known weak points.</li>
<li>If the reference standard is done only in people whose test was abnormal, the test looks better than it is. This is <b>verification bias</b>.</li>
<li>A strong predictor needs both a large effect (odds ratio) and to be common enough to change many people's risks. A predictor that is measured badly looks weaker than it really is.</li>
<li>The outcome must be defined and measured carefully, as carefully as in a trial.</li>
<li>Count the <b>events</b>, not the people. Divide the events by the number of things you plan to try in the model: this is <b>events per variable</b> (EPV). Below 10 is risky.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has written down its question: at the first antenatal (booking) visit, which women are likely to deliver before 37 weeks? In this module it plans the study: where the data will come from, a side question about urine infection, which predictors to record and how, and how many women it needs. You do not need the earlier modules for this story.',
  cases: [
    {
      id: 'c1',
      title: 'Where will the data come from?',
      aim: 'weigh the possible data sources, and correct the risks from a case-control sample.',
      minutes: 15,
      need: `
<p>The team has a few ways to get data. Each has a strong and a weak side.</p>
<ul>
<li><b>Old hospital records</b> (a retrospective cohort) are cheap and quick. But nobody planned what was written down. Some women are missing, predictors are defined differently by different staff, and gaps are common.</li>
<li><b>A new prospective cohort</b> means enrolling women at booking, recording predictors on a set form, and following them to the birth. The data are good, but it costs time and money.</li>
<li><b>A finished trial</b> has well-recorded data, but trials take only some women (they often leave out high-risk groups), so the model may not suit everyone.</li>
<li><b>A registry</b> covers a whole area and is large, but holds only a few details about each woman.</li>
</ul>
<p><b>Saving money with a case-control sample.</b> Suppose an expensive test cannot be done in every woman. You can do it in all the women who had the outcome (the <b>cases</b>) and in a random share of the others (the <b>controls</b>). The model's coefficients (the effects of the predictors) are still correct. But the sample has far more cases than real life, so every predicted risk comes out too high.</p>
<p>The fix is simple. If you kept a fraction f of the controls, the odds in the sample are 1 ÷ f times too high. So subtract ln(1 ÷ f) from the intercept. For example, keeping 5% of controls (f = 0.05) means subtracting ln(20) = 3.0.</p>`,
      scenario: `<p>Several offers of data reach the team. The hospital has records of 5,000 deliveries from 2019 to 2023. Six clinics are willing to enrol women at booking from next month. A research group can share data from a finished trial of iron tablets in pregnancy. The state runs a birth registry. Separately, the team is curious about a costly blood marker for very early birth (before 32 weeks).</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'A planned, prospective cohort is the best source for a prognostic model; with case-control sampling the effects are fine but the intercept must be corrected before giving risks.'
    },
    {
      id: 'c2',
      title: 'A side question: urine infection at booking',
      aim: 'see how a diagnostic study is designed, and how verification bias makes a test look too good.',
      minutes: 15,
      need: `
<p>A urine infection without symptoms (<b>bacteriuria</b>) raises the risk of preterm birth, and it can be treated. The team wants to know how well a cheap urine <b>dipstick</b> finds it. This is a diagnostic question: is the infection there now?</p>
<p>In a good diagnostic study:</p>
<ul>
<li>all women who could be tested are included, one after another (not hand-picked);</li>
<li>every woman gets both the dipstick (the index test) and a <b>urine culture</b> (the reference standard);</li>
<li>the person reading the culture does not know the dipstick result (<b>blinding</b>).</li>
</ul>
<p><b>Verification bias.</b> Culture costs money, so it is tempting to culture only dipstick-positive urine and to call every dipstick-negative woman "no infection". The infections missed by the dipstick are then never found. The test seems to miss nothing, so it looks much better than it is.</p>
<p><b>Selection bias.</b> Comparing clear-cut cases with healthy volunteers also makes a test look too good. Real women in the clinic include mild and borderline cases.</p>`,
      scenario: `<p>The laboratory offers two ways to study the dipstick. Plan A: test all women at booking with the dipstick, and culture only the positives. Plan B: take culture-positive women from laboratory files as cases, and healthy staff volunteers as controls.</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'Include all women who would be tested, give everyone the reference standard, and read it blind; otherwise the test looks better than it is.'
    },
    {
      id: 'c3',
      title: 'Which predictors, and how well are they measured?',
      aim: 'judge how much a predictor can help, and how measurement error weakens it.',
      minutes: 15,
      need: `
<p><b>How strong is a predictor?</b> Two things matter: how much it raises the risk (its <b>odds ratio</b>), and how many women have it. A predictor that only 1 in 100 women has can change the risk of only those few women, however large its odds ratio.</p>
<p>For a yes/no predictor, the c statistic (how well it separates women who deliver early from those who do not) is the average of its <b>sensitivity</b> (the share of women who delivered early who had it) and <b>specificity</b> (the share of the others who did not have it).</p>
<p><b>Start with cheap information.</b> First use what is easy to get (age, past pregnancies, history), then simple tests, and only then costly ones. A costly test must show that it adds something: compare the model with and without it.</p>
<p><b>Measurement error.</b> If a predictor is recorded wrongly some of the time, its link with the outcome looks weaker than it really is. This is called <b>regression dilution</b>. Two people scoring the same sign will not always agree; their agreement beyond chance is measured by <b>kappa</b> (1 = perfect, 0 = no better than chance):</p>
<div class="formula">kappa = (observed agreement − agreement expected by chance) ÷ (1 − agreement expected by chance)</div>
<p>For a model used in daily practice, measure each predictor the way it will be measured in practice.</p>`,
      scenario: `<p>The team has a long list of possible predictors. Some are common, such as anaemia; some are rare, such as a particular gene variant. One sign, "the woman looks pale", is judged by midwives by eye and they often disagree.</p>`,
      widgets: `<div data-widget="regressionDilution"></div>`,
      tasks: [4, 5],
      takeaway: 'A predictor helps through both its effect and how common it is; measuring it badly dilutes its effect, but does not by itself make it useless.'
    },
    {
      id: 'c4',
      title: 'The outcome and the number of women needed',
      aim: 'define the outcome carefully and work out whether there are enough events.',
      minutes: 15,
      need: `
<p><b>The outcome.</b> Decisions will be based on the predicted risk of the outcome, so the outcome must be measured with care. Preterm birth depends on knowing the gestational age. Dating by an early ultrasound scan is more accurate than a woman's memory of her last period, so the method of dating should be the same for everyone and written down in advance.</p>
<p>Combining several outcomes into one (a <b>composite</b>, such as "preterm birth or stillbirth") gives more events, but assumes the predictors act the same way on each part. Often they do not.</p>
<p><b>How many women?</b> For a yes/no outcome, the information is in the number of <b>events</b>. Count every coefficient you might try in the model (a predictor coded with two terms counts as two). Then:</p>
<div class="formula">events per variable (EPV) = number of events ÷ number of candidate coefficients</div>
<ul>
<li>EPV below 10: the model is likely to fit the noise (to be <b>overfitted</b>).</li>
<li>EPV 10 or more: the usual minimum.</li>
<li>EPV 20 or more: a model fixed in advance may need no correction for overfitting.</li>
<li>EPV 50 or more: needed to let the data choose the predictors reliably.</li>
</ul>
<p>Example: 2,000 women with 12% preterm births give 240 events. With 15 candidate coefficients, EPV = 240 ÷ 15 = 16.</p>`,
      scenario: `<p>A smaller satellite clinic wants a model of its own. Meanwhile, the research committee sends the team a published preterm birth model from another hospital to comment on.</p>`,
      widgets: `<div data-widget="epvCalculator"></div>`,
      tasks: [6, 7],
      takeaway: 'Measure the outcome as rigorously as in a trial, and count events, not women, before planning the analysis.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Prognostic and diagnostic designs',
      html: `
<p>The quality of a model depends largely on the design and quality of the data. A sophisticated analysis cannot rescue a poorly designed study.</p>
<p>A <b>prognostic</b> study is longitudinal: a cohort is defined by a shared characteristic (booking at a clinic), predictors are recorded at the start, and people are followed until the outcome occurs or follow-up ends. A <b>diagnostic</b> study is usually cross-sectional: people with a symptom or sign that raises suspicion undergo the index test and a reference standard over a short time. The statistical analysis is similar (typically logistic regression); the risks to validity differ. Prognostic studies worry about selection, the completeness and accuracy of predictors, and complete follow-up. Diagnostic studies worry about the reference standard and who received it.</p>
<p class="src">Source: Ch. 3, §3.1</p>`
    },
    {
      id: 'n2',
      title: 'Cohort designs and the case-control intercept',
      html: `
<table class="data">
<tr><th>Design</th><th>Strengths</th><th>Limitations</th></tr>
<tr><td>Retrospective cohort</td><td>Simple, cheap; records easily searched</td><td>Selection, predictor definitions and outcome not by protocol; often small</td></tr>
<tr><td>Prospective cohort</td><td>Defined selection; predictors recorded with quality checks; outcome at set times</td><td>Costly</td></tr>
<tr><td>Trial data</td><td>Defined selection; recording and outcome by protocol; multi-centre definitions</td><td>Strict inclusion criteria limit generalisability</td></tr>
<tr><td>Registry</td><td>Complete coverage; large; prospective</td><td>Few details; outcome often survival only; coding may follow reimbursement</td></tr>
<tr><td>Nested case-control</td><td>Efficient for rare outcomes; costly predictors measured in cases and a sample of controls</td><td>Choice of controls is critical; absolute risks need a corrected intercept</td></tr>
</table>
<p>Trial arms are usually combined for model development, since a treatment effect is generally small relative to other prognostic effects.</p>
<div class="callout warn"><b>Critical: absolute risks from a case-control sample</b>
<p>With all cases kept and a fraction f of controls, the sample odds exceed the population odds by 1 / f. Subtract ln(1 / f) from the intercept; the slope coefficients are unchanged. Book-style illustration: mortality 1%, 4% of survivors sampled, so sample odds are 25 times too high and the correction is ln 25 = 3.22 (for 10% of controls, ln 10 = 2.30).</p></div>
<p class="src">Source: Ch. 3, §3.2, Table 3.1</p>`
    },
    {
      id: 'n3',
      title: 'Diagnostic designs and verification bias',
      html: `
<p>Ideally all suspected patients, enrolled consecutively, receive the index tests and the reference standard, and the reference standard is read without knowledge of the index test, to avoid <b>information bias</b> (incorporation or diagnostic-review bias).</p>
<p><b>Verification bias:</b> when the reference standard is applied mainly to test-positive patients, test performance is biased, usually overestimated. Book example: CRP for appendicitis, with surgery and pathology for high CRP and clinical follow-up for low CRP; mild cases with low CRP resolve unseen, so CRP looks better than it is.</p>
<p><b>Case-control selection</b> in diagnosis (cases by the reference test, controls without disease) causes selection bias, especially with non-consecutive enrolment, severe cases against healthy controls, or retrospective data. A reported prevalence should be checked for representativeness: in the book's example, 20% renal artery stenosis among 635 angiography patients may overstate the prevalence in all suspected patients.</p>
<p class="src">Source: Ch. 3, §3.3</p>`
    },
    {
      id: 'n4',
      title: 'Predictors: strength, cost and reliability',
      html: `
<p><b>Strength</b> depends on the association and the distribution. At 10% incidence, a binary predictor with OR 2.0 and 50% prevalence gives c = 0.58; one with OR 2.5 and 1% prevalence gives c = 0.51. Continuous predictors need a wide range to be useful.</p>
<p><b>Domains:</b> demographics, type and severity of disease, history, comorbidity, physical function, subjective health. Differing definitions between studies threaten generalisability. Consider easy information first, then simple tests, then costly ones, and judge a costly test by its <b>incremental value</b>.</p>
<p><b>Reliability.</b> Observer variability is summarised by kappa = (p<sub>o</sub> − p<sub>e</sub>) / (1 − p<sub>e</sub>); pathologists' agreement on Barrett's oesophagus histology is only fair (kappa about 0.4). Biological variability (blood pressure) is reduced by repeated readings.</p>
<div class="callout eg"><b>Regression dilution (book simulation, recalculated)</b>
<p>True OR 4, prevalence 50%, incidence 50%, observer sensitivity and specificity 80%: observed OR 2.25, c falls from 0.67 to 0.60, and kappa between two observers is 0.36.</p></div>
<p>For a model used in practice, measure predictors as in practice: if decisions use the local pathology report, that report is the predictor.</p>
<p class="src">Source: Ch. 3, §3.4-3.5</p>`
    },
    {
      id: 'n5',
      title: 'The outcome',
      html: `
<table class="data">
<tr><th>Type</th><th>Examples</th><th>Characteristics</th></tr>
<tr><td>Fatal events</td><td>Mortality</td><td>Hard end point; may be too rare</td></tr>
<tr><td>Non-fatal events</td><td>Recurrence, cardiovascular events</td><td>Softer; more events</td></tr>
<tr><td>Patient-centred</td><td>Symptoms, function, quality of life</td><td>Subjective; often secondary</td></tr>
<tr><td>Wider burden</td><td>Absence from work</td><td>Economic interest</td></tr>
</table>
<p><b>Composite end points</b> add events but assume similar predictor effects on each component. Book example: in 949 patients with heart failure, c was 0.77 for 60-day mortality but 0.69 for death or rehospitalisation. Statistically, continuous outcomes carry more power than ordinal, and ordinal more than binary. Predictors may be pragmatic, but the outcome should be measured as rigorously as in a trial.</p>
<table class="data">
<tr><th>Biomarker phase</th><th>Objective</th><th>Design</th></tr>
<tr><td>1. Preclinical exploratory</td><td>Promising directions</td><td>Case-control (convenience)</td></tr>
<tr><td>2. Clinical assay</td><td>Detects established disease?</td><td>Case-control (population based)</td></tr>
<tr><td>3. Retrospective longitudinal</td><td>Detects disease before it is clinical?</td><td>Nested case-control in a cohort</td></tr>
<tr><td>4. Prospective screening</td><td>Disease detected; false referrals</td><td>Cross-sectional cohort</td></tr>
<tr><td>5. Disease control</td><td>Effect on burden of disease</td><td>Randomised trial</td></tr>
</table>
<p class="src">Source: Ch. 3, §3.6-3.7, Tables 3.5-3.6</p>`
    },
    {
      id: 'n6',
      title: 'Sample size and events per variable',
      html: `
<p><b>Power for one predictor</b> (80% power, 5% Type I error): OR 1.5 with 50% prevalence needs about 2,000 patients at 10% incidence, 1,000 at 20% and 800 at 50%; OR 1.2 at 50% incidence needs about 3,800.</p>
<p><b>Reliable predictions</b> depend on EPV = events / candidate predictor parameters.</p>
<table class="data">
<tr><th>EPV</th><th>Meaning</th></tr>
<tr><td>&lt; 10</td><td>Likely overfitted</td></tr>
<tr><td>&ge; 10</td><td>Minimum for good predictions</td></tr>
<tr><td>&ge; 20</td><td>A pre-specified model may not need shrinkage (Module 10)</td></tr>
<tr><td>&ge; 50</td><td>Reliable selection from candidates (Module 8)</td></tr>
</table>
<p>Validation of an existing model needs at least about 100 events (Module 14). <b>In the course story:</b> ptb_dev has 2,000 women and 240 preterm births; with 15 candidate parameters EPV = 16. EPV 10 would need 150 events (1,250 women), EPV 20 300 events and EPV 50 750 events.</p>
<div class="callout warn"><b>Critical: counting patients instead of events</b>
<p>10,000 women with an outcome of 0.5% give only 50 events, enough for about 5 candidate parameters.</p></div>
<p class="src">Source: Ch. 3, §3.8-3.9</p>`
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
      q: 'A dipstick for urine infection is studied by sending urine for culture only when the dipstick is positive; dipstick-negative women are recorded as having no infection. What is the likely effect on the estimated performance of the dipstick?',
      options: [
        'It is underestimated, because dipstick-negative women are under-represented.',
        'It is overestimated, because infections in dipstick-negative women are never found.',
        'It is unaffected, because the dipstick is done in everyone.',
        'It is unbiased for sensitivity but biased for specificity only.'
      ],
      answer: 1,
      why: 'Verification bias: the infections the dipstick misses are never cultured, so false negatives are not counted and the test looks better than it is (here sensitivity appears to be 100%). Doing the index test in everyone (third option) does not help when the reference standard depends on its result.'
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
      why: 'The strength of a predictor depends on the association and the distribution. A rare predictor changes the predicted risk of very few patients (c = 0.51 versus 0.58 at 10% incidence). Judging by the OR alone is the commonest misconception.'
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
      why: 'EPV = 60 / 12 = 5. Below 10, the model is likely to be overfitted and a simpler model may predict better. Dividing in the wrong direction or quoting the number of events alone ignores the number of candidates. An EPV of 20 would need 240 events for 12 parameters.'
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
      why: 'Misclassification unrelated to the outcome (regression dilution) weakens the association; the book simulation gives an observed OR of 2.25 and a c statistic falling from 0.67 to 0.60. Random error does not cancel out; it attenuates. The association is reduced, but not removed.'
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
      why: 'Controls were sampled at f = 0.10, so the sample odds are 10 times the population odds and the intercept is too high by ln 10 = 2.30: −0.40 − 2.30 = −2.70. The coefficients are valid without correction. Adding the correction (+1.90) gets the direction wrong, and dividing the intercept by 10 has no justification.'
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
      why: 'A composite increases the number of events, hence power, but requires predictors to relate similarly to each component. In the heart-failure example c fell from 0.77 for mortality to 0.69 for the composite. The first option states the opposite of the benefit.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Choose a data source',
      level: 'Analyze',
      scenario: `<p>Four sources could provide data for the booking-visit model: (i) hospital records of 5,000 deliveries, 2019 to 2023; (ii) a new prospective cohort in six clinics; (iii) data from a finished trial of iron tablets, which left out women with severe anaemia and women under 18; (iv) the state birth registry, which records the mother's age, number of previous births and gestational age at birth.</p>`,
      questions: [
        '<b>(a)</b> For each source, give one strength and one weakness for this model.',
        '<b>(b)</b> Which source would you choose, and why?',
        '<b>(c)</b> If time is short, how could the records be used without being misled?'
      ],
      answer: `<p><b>(a)</b> (i) <b>Records:</b> cheap, large and quick; but predictors were not recorded by protocol, many values will be missing, dating methods vary, and women who delivered elsewhere are lost. (ii) <b>Prospective cohort:</b> predictors and outcome defined in advance and recorded completely, with dating by a set method; but costly and slow. (iii) <b>Trial:</b> good-quality data recorded by protocol, often across centres; but the excluded groups (severe anaemia, teenagers) are among the women the model is meant for, so the model may not suit them. (iv) <b>Registry:</b> complete coverage and very large; but very few predictors (no haemoglobin, history or BMI), and gestational age may be recorded inconsistently.</p>
<p><b>(b)</b> The prospective cohort, because it is the only source in which the predictors known at booking and the outcome can be defined and measured as the model needs. The book prefers prospective cohorts with pre-specified selection and predictor definitions.</p>
<p><b>(c)</b> Use the records to explore and to plan (which predictors are routinely available, how often values are missing, the rough number of preterm births), but treat any model built from them as preliminary, report its limitations, and validate it in the prospective cohort.</p>`
    },
    {
      id: 't1',
      title: 'Correct the risks from a case-control sample',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). In a state cohort of 10,000 women, 150 (1.5%) deliver before 32 weeks. A costly blood marker is measured in all 150 cases and in a random 5% of the other 9,850 women. A logistic model fitted to this sample gives an intercept of −0.90 and a coefficient of 1.60 for a high marker level.</p>`,
      questions: [
        '<b>(a)</b> How many times higher are the odds of very early birth in the sample than in the whole cohort? Show the calculation.',
        '<b>(b)</b> Give the corrected intercept.',
        '<b>(c)</b> Calculate the risk for a woman with a normal and with a high marker level, first with the uncorrected and then with the corrected intercept.',
        '<b>(d)</b> Which numbers from the model do not need correcting?'
      ],
      answer: `<p><b>(a)</b> Cohort odds = 0.015 / 0.985 = 0.0152. Controls in the sample = 0.05 × 9,850 = 492.5, so sample odds = 150 / 492.5 = 0.305. The ratio is 0.305 / 0.0152 = 20, which equals 1 / f = 1 / 0.05.</p>
<p><b>(b)</b> Subtract ln 20 = 3.00: corrected intercept = −0.90 − 3.00 = −3.90.</p>
<p><b>(c)</b> Uncorrected: normal marker 1 / (1 + e<sup>0.90</sup>) = 28.9%; high marker lp = −0.90 + 1.60 = 0.70, risk 66.8%. Corrected: normal marker 1 / (1 + e<sup>3.90</sup>) = 2.0%; high marker lp = −3.90 + 1.60 = −2.30, risk 1 / (1 + e<sup>2.30</sup>) = 9.1%. Without the correction, every woman's risk would be grossly overstated.</p>
<p><b>(d)</b> The coefficient 1.60 and its odds ratio e<sup>1.60</sup> = 4.95. Case-control sampling affects only the intercept.</p>`
    },
    {
      id: 't2',
      title: 'How verification bias flatters a test',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). Of 1,000 women at booking, 80 (8%) truly have bacteriuria. The dipstick has a true sensitivity of 75% and a true specificity of 90%. Under Plan A, only dipstick-positive urine is cultured, and dipstick-negative women are recorded as "no infection".</p>`,
      questions: [
        '<b>(a)</b> Draw the true 2 × 2 table (dipstick result against true infection).',
        '<b>(b)</b> Draw the table that Plan A would record, and calculate the apparent sensitivity and specificity.',
        '<b>(c)</b> A colleague suggests culturing a random 10% of dipstick-negative urine as well. How could this sample be used to correct the table?'
      ],
      answer: `<p><b>(a)</b> Infection: 60 dipstick positive, 20 negative. No infection: 92 positive, 828 negative. Totals: 152 positive, 848 negative.</p>
<p><b>(b)</b> The 20 missed infections are recorded as "no infection". Recorded table: infection 60 positive, 0 negative; no infection 92 positive, 848 negative. Apparent sensitivity = 60 / 60 = 100%; apparent specificity = 848 / 940 = 90.2%. The dipstick seems to miss nothing, although it truly misses one infection in four.</p>
<p><b>(c)</b> About 85 of the 848 dipstick-negative women would be cultured, of whom about 2 would have bacteriuria. Each cultured negative woman stands for 10, so multiply by 10: about 20 infections and 828 without infection among the dipstick negatives. This restores the true table, apart from chance. The book's general point: apply the reference standard to everyone where possible, or at least to a random sample of test negatives.</p>`
    },
    {
      id: 't3',
      title: 'Redesign the dipstick study',
      level: 'Evaluate',
      scenario: `<p>Plan B takes 100 culture-positive women from the laboratory files as cases and 100 healthy staff volunteers as controls. The dipstick is read by a technician who already knows whether the urine grew bacteria.</p>`,
      questions: [
        '<b>(a)</b> Name the problems with Plan B and say which way each will push the results.',
        '<b>(b)</b> Can Plan B estimate how common bacteriuria is at booking? Why?',
        '<b>(c)</b> Describe a better design in three or four sentences.'
      ],
      answer: `<p><b>(a)</b> <b>Selection (spectrum) bias:</b> cases from laboratory files are often clear-cut infections, and healthy staff are not like women at booking; both make the dipstick look better. <b>Non-consecutive enrolment</b> adds to this. <b>Information bias:</b> a technician who knows the culture result may read borderline dipsticks to agree with it; this also inflates performance.</p>
<p><b>(b)</b> No. The 50% "prevalence" is set by the design (100 cases, 100 controls), not by the population, so risks after a positive or negative result cannot be read from it.</p>
<p><b>(c)</b> Enrol all women attending booking, one after another, over a set period. Do the dipstick and send urine for culture in every woman. The laboratory reading the culture does not see the dipstick result, and the dipstick is read before the culture result is known. Report the prevalence, and sensitivity and specificity with confidence intervals.</p>`
    },
    {
      id: 't4',
      title: 'A common predictor or a rare one?',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). Suppose 10% of women deliver early. Anaemia is present in 50% of women and has an odds ratio of 2.0: the risk is 7.0% without it and 13.0% with it. A gene variant is present in 1% of women and has an odds ratio of 2.5: the risk is 9.9% without it and 21.5% with it. Think of 1,000 women.</p>`,
      questions: [
        '<b>(a)</b> For each predictor, how many of the 100 women who deliver early have it? Calculate its sensitivity and specificity.',
        '<b>(b)</b> Calculate the c statistic of each predictor as (sensitivity + specificity) ÷ 2.',
        '<b>(c)</b> Which predictor is more useful in the model, and why?'
      ],
      answer: `<p><b>(a)</b> <b>Anaemia:</b> 500 women with it, 0.13 × 500 = 65 deliver early, so sensitivity = 65 / 100 = 65%. Of the 900 who do not deliver early, 500 − 65 = 435 have anaemia, so 465 do not: specificity = 465 / 900 = 52%. <b>Gene variant:</b> 10 women with it, about 2 deliver early (0.215 × 10), so sensitivity = 2%. Of the 900 others, about 8 have the variant: specificity = 892 / 900 = 99%.</p>
<p><b>(b)</b> Anaemia c = (0.65 + 0.52) / 2 = 0.58. Gene variant c = (0.02 + 0.99) / 2 = 0.51, barely better than chance.</p>
<p><b>(c)</b> Anaemia, although its odds ratio is smaller. The variant changes the risk of only 1 woman in 100, so it hardly separates women who will and will not deliver early. Strength depends on both the association and the distribution of the predictor.</p>`
    },
    {
      id: 't5',
      title: 'How much does measurement error dilute a predictor?',
      level: 'Apply',
      scenario: `<p>Use the measurement error widget in this case. Suppose the true predictor has an odds ratio of 4 and is present in 50% of women. Two midwives score it independently, each with the sensitivity and specificity set in the widget.</p>`,
      questions: [
        '<b>(a)</b> With sensitivity and specificity both 80%, record the observed odds ratio, kappa, and the c statistic for the true and the observed predictor.',
        '<b>(b)</b> Raise both to 90%. Work out kappa by hand (observed agreement and chance agreement at 50% prevalence), then check it with the widget. What happens to the observed odds ratio?',
        '<b>(c)</b> Go back to 80% and 80%, and lower the prevalence of the true predictor to 20%. What happens to kappa, and why?',
        '<b>(d)</b> A colleague says "kappa is only 0.36, so we should drop this sign". Give a counter-argument.'
      ],
      answer: `<p><b>(a)</b> Observed OR = 2.25, kappa = 0.36, c = 0.67 for the true predictor and 0.60 for the observed one.</p>
<p><b>(b)</b> Observed agreement p<sub>o</sub> = 0.9² + 0.1² = 0.82; chance agreement p<sub>e</sub> = 0.5; kappa = (0.82 − 0.50) / 0.50 = 0.64. The observed OR rises towards 4, to about 2.98, and c to about 0.63.</p>
<p><b>(c)</b> Kappa falls to about 0.26. Observed agreement stays at 0.68, but chance agreement rises to about 0.56, because both midwives mostly say "absent" when the sign is rare. Kappa discounts agreement that could happen by chance, so the same accuracy gives a lower kappa for a rare sign.</p>
<p><b>(d)</b> Measurement error dilutes a predictor but does not destroy it: at 80% accuracy the OR is still 2.25 and c 0.60. For a model used in practice, the sign should be judged by how it performs as measured in practice. Its reliability may be improved by clear definitions, training, or a second reading, rather than by dropping it.</p>`
    },
    {
      id: 't6',
      title: 'How many events does the satellite clinic need?',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The satellite clinic has records of 600 women, and 8% delivered early. It wants to try 12 candidate coefficients, and hopes to let stepwise selection pick the final predictors.</p>`,
      questions: [
        '<b>(a)</b> Calculate the number of events and the EPV.',
        '<b>(b)</b> How many candidate coefficients could it afford at EPV 10?',
        '<b>(c)</b> How many events, and how many women at 8%, would it need for 12 coefficients at EPV 10, 20 and 50?',
        '<b>(d)</b> Check (a) and (c) with the EPV calculator, and suggest two options if more data cannot be found.'
      ],
      answer: `<p><b>(a)</b> Events = 0.08 × 600 = 48. EPV = 48 / 12 = 4.</p>
<p><b>(b)</b> 48 / 10 = 4.8, so about 4 candidate coefficients.</p>
<p><b>(c)</b></p>
<table class="data">
<tr><th>Target EPV</th><th>Events = 12 × EPV</th><th>Women = events / 0.08</th></tr>
<tr><td>10</td><td>120</td><td>1,500</td></tr>
<tr><td>20</td><td>240</td><td>3,000</td></tr>
<tr><td>50</td><td>600</td><td>7,500</td></tr>
</table>
<p><b>(d)</b> The calculator shows EPV 4, below 10, with a high risk of overfitting. Options: (1) cut the candidates to about 4, chosen on clinical grounds before looking at the outcome; (2) join with the district hospital's data, or collect for longer, to reach at least 120 events. Stepwise selection with EPV 4 is not advisable: selection needs about 50 events per candidate.</p>`
    },
    {
      id: 't7',
      title: 'Critique a published preterm birth model',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A tertiary hospital team reviewed 380 delivery records from 2014 to 2018; 42 women delivered early.</p>
<p>They screened 38 candidate variables (about 38 coefficients), kept 7 by stepwise selection at p &lt; 0.05, and report a c statistic of 0.84 in the same data.</p>
<p>Cervical length was one of the 7 predictors. It had been measured by ultrasound in only 120 women, mostly those with a previous preterm birth or symptoms; for everyone else it was entered as "normal".</p>
<p>Gestational age was the "clinician's estimate" in the discharge summary. The authors conclude that the model "can be used in all antenatal clinics".</p>`,
      questions: [
        '<b>(a)</b> Calculate the EPV and comment.',
        '<b>(b)</b> Name the design problems with the predictors and the outcome.',
        '<b>(c)</b> Comment on the validation and the conclusion.',
        '<b>(d)</b> List the changes that would most improve the study, in order of priority.'
      ],
      answer: `<p><b>(a)</b> EPV = 42 / 38 = 1.1, far below the minimum of 10 and far below the 50 per candidate needed for selection. <b>Critical:</b> the model is severely overfitted, and stepwise selection from 38 candidates with 42 events will pick up noise.</p>
<p><b>(b)</b> Retrospective records: selection, predictor definitions and completeness were not by protocol. Cervical length was measured selectively, by indication (120 of 380); entering "normal" for unmeasured women misclassifies them, and the variable partly records the clinician's suspicion, a problem similar to verification bias. The outcome relied on an unspecified "clinician's estimate" rather than one dating method, so the outcome label contains error. A single tertiary hospital sees a referral population, not typical antenatal clinic women.</p>
<p><b>(c)</b> Only the apparent c is reported. With EPV near 1 it is likely to be heavily inflated; the optimism should be estimated by bootstrapping the whole selection process (Module 13), and external validation is needed before any claim about other clinics. The conclusion does not follow from data from one hospital.</p>
<p><b>(d)</b> (1) More events (multi-centre or prospective data) and a small set of candidates chosen on clinical grounds; (2) predictors available at booking, defined in advance and measured as in routine practice (cervical length only if measured in all women); (3) one consistent dating method for gestational age; (4) internal validation with the bootstrap, then external validation.</p>`
    }
  ]
});
