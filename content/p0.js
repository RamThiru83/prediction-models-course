registerModule({
  id: 'p0',
  num: 0,
  part: 'Primer',
  title: 'Primer: the ideas you need before starting',
  book: 'Ch. 1, 4, 5, 15 (background)',
  minutes: 55,
  summary: 'The few ideas the course assumes: risk and odds, how logistic regression turns patient facts into a risk, why results vary between samples, and the two questions asked of every model. Trust me, you will need them!',
  objectives: [
    'Convert between risk and odds',
    'Calculate a risk from a logistic model',
    'Work out PPV and NPV from counts',
    'Explain why small samples mislead',
    'Tell discrimination from calibration'
  ],
  format: 'cases',
  essentials: `
<ul>
<li>A <b>clinical prediction model</b> takes some information about a patient/person (the <b>predictors</b>; some computer scientists call them features) and returns the chance of an <b>outcome</b>. In this course the outcome is, for simplicity, yes or no; a patient with it is an <b>event</b>.</li>
<li><b>Odds</b> = risk / (1 − risk). Regression works with the logarithm of the odds, the <b>log-odds</b>.</li>
<li><b>Logistic regression:</b> add up a score, lp = α + β<sub>1</sub>x<sub>1</sub> + β<sub>2</sub>x<sub>2</sub> + ..., then risk = 1 / (1 + e<sup>−lp</sup>). exp(β) is the <b>odds ratio</b>, which is not a risk ratio when the outcome is common.</li>
<li><b>Sensitivity and specificity</b> describe a test. <b>Predictive values</b> (PPV, NPV) also depend on how common the condition is.</li>
<li>Every estimate varies from sample to sample. For a yes/no outcome, the <b>number of events</b> limits what a study can show.</li>
<li>Judge a model on patients it was not built on, with two questions: does it <b>rank</b> patients correctly (discrimination, the c statistic), and are its risks the <b>right size</b> (calibration)?</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. In this primer the team starts to use predicted risks of preterm birth: at the booking visit, for women who arrive with threatened preterm labour, in the district\'s own figures, and in a second hospital.',
  cases: [
    {
      id: 'c1',
      title: 'A risk at booking',
      aim: 'turn a risk into odds and back, and calculate a woman\'s risk from a logistic model.',
      minutes: 12,
      need: `
<p>Odds = risk / (1 − risk), and risk = odds / (1 + odds). A 20% risk is odds of 0.25: one event for every four non-events. For small risks the two are close; for large risks they are not (80% is odds 4).</p>
<p>A logistic model adds up a score, lp, then turns it into a risk with 1 / (1 + e<sup>−lp</sup>). A score of 0 is a risk of 50%. exp(coefficient) is the odds ratio: how much that predictor multiplies the odds.</p>`,
      scenario: `<p>The team's antenatal clinic wants each woman's risk of preterm birth at her booking visit. A colleague gives them a simple model: lp = −3.0 + 0.8 × chronic_htn + 1.2 × prior_ptb, with each predictor coded 1 if present and 0 if not.</p>`,
      widgets: `<div data-widget="oddsConverter"></div><div data-widget="logisticCurve"></div>`,
      tasks: [0, 1, 2],
      takeaway: 'A model adds effects on the log-odds scale. Its odds ratios are not risk ratios, and the extra risk from a predictor depends on where a woman starts.'
    },
    {
      id: 'c2',
      title: 'A bedside test for threatened preterm labour',
      aim: 'work out what a positive or negative test result means, using counts.',
      minutes: 10,
      need: `
<p><b>Sensitivity:</b> of those with the outcome, the share who test positive. <b>Specificity:</b> of those without it, the share who test negative. <b>PPV:</b> of those who test positive, the share who have the outcome; <b>NPV</b> is the same for negatives.</p>
<p>Work in counts. Out of 1000 women in whom 14% will deliver within 7 days: 140 will, and 85% of them (119) test positive; 860 will not, and 30% of them (258) also test positive. PPV = 119 / 377 = 32%.</p>`,
      scenario: `<p>Women who arrive at the labour ward with contractions before 37 weeks are checked with a bedside test that predicts delivery within 7 days (illustrative values: sensitivity 85%, specificity 70%). The team wants to know what a result means in its own unit, where 14% of the women tested deliver within 7 days, and in the regional referral unit it sends women to, where 40% do.</p>`,
      widgets: `<div data-widget="bayes2x2"></div>`,
      tasks: [3, 4],
      takeaway: 'Sensitivity and specificity belong to the test; what a result means for a woman also depends on how common the outcome is where the test is used.'
    },
    {
      id: 'c3',
      title: 'Is this clinic really different?',
      aim: 'judge whether a figure differs from chance, and see why the number of events matters.',
      minutes: 10,
      need: `
<p>A figure from a sample is an estimate; another sample would give a different one, and small samples swing more. With a true risk of 12%, samples of 50 women range from about 3% to 21%, and samples of 1000 from about 10% to 14%.</p>
<p>For a yes/no outcome, the information sits in the <b>number of events</b>, not the number of patients. The <b>bootstrap</b> imitates new samples by drawing patients from your own data with replacement: some appear twice, others not at all (about 63% of them appear).</p>`,
      scenario: `<p>The district manager compares the preterm birth rates of the team's clinics with the district rate of 12%, and is also offered two cohorts for building a better model.</p>`,
      widgets: `<div data-widget="samplingDemo"></div>`,
      tasks: [5, 6],
      takeaway: 'Small samples mislead; before reading meaning into a figure, ask how much it would vary by chance, and count the events.'
    },
    {
      id: 'c4',
      title: 'Does the model work?',
      aim: 'calculate a c statistic, check calibration, and explain why a model looks worse in new patients.',
      minutes: 10,
      need: `
<p>A model always looks better on the patients used to build it (<b>apparent</b> performance). The excess is <b>optimism</b>; a model with a lot of it is <b>overfitted</b>, and its risks tend to be too extreme in new patients: too high for high-risk patients, too low for low-risk ones.</p>
<p><b>c statistic:</b> take every pair of one event and one non-event; c is the share of pairs in which the event has the higher predicted risk. 0.5 is a coin toss, 1 is perfect. <b>Calibration</b> compares predicted with observed risk: if the model says 20%, about 20% should have the outcome.</p>`,
      scenario: `<p>Before using their booking model routinely, the team tries it on women in a second hospital.</p>`,
      widgets: '',
      tasks: [7, 8],
      takeaway: 'Judge a model on patients it was not built on, and ask both questions: does it rank patients correctly, and are its risks the right size?'
    }
  ],
  sections: [
    {
      id: 's1',
      title: 'What a clinical prediction model is',
      html: `
<p>A <b>clinical prediction model</b> takes some information about a patient/person and returns the chance that the patient has, or will develop, a particular outcome. Risk scores and nomograms are examples. The numbers in the formula were estimated from earlier patients.</p>
<ul>
<li><b>Outcome:</b> what is predicted, for example preterm birth or neonatal sepsis. In this course (for the sake of simplicity) it either happens (1) or does not (0). A patient/person with the outcome is called an <b>event</b>.</li>
<li><b>Predictors:</b> the facts used to predict, for example maternal age, haemoglobin or a previous preterm birth for predicting preterm birth. Some computer scientists may call them features. I would prefer to use predictors!</li>
<li><b>Incidence</b> is the proportion who develop the outcome over a stated follow-up period; <b>prevalence</b> is the proportion who have the condition now. In prediction work, both are simply "the overall risk in this population" and are often written as a percentage.</li>
<li><b>Absolute risk:</b> the predicted probability itself (for example, 18%).</li>
</ul>
<p>A <b>diagnostic</b> model estimates the chance that a condition is present now (does this newborn have sepsis?). A <b>prognostic</b> model estimates the chance of a future outcome (will this woman deliver preterm?).</p>
<p>An aetiological study asks whether an exposure causes an outcome and worries about confounding. A prediction study asks how well a set of predictors together estimates the outcome risk for a new patient. A predictor can be useful for prediction without being a cause. The book describes prediction as primarily an <b>estimation problem</b> (what is this patient's risk?). This course spends most of its time on estimation: getting each patient's risk right.</p>
<div class="callout key"><b>Key idea</b><p>A model is good if its risks are close to the truth for new patients, not just for the patients used to build it. The whole course is about achieving that.</p></div>
<p class="src">Source: Ch. 1, §1.1-1.2; Ch. 2, §2.1 Steyerberg's book</p>`
    },
    {
      id: 's2',
      title: 'Risk and odds',
      html: `
<p>Regression models for a yes/no outcome work with <b>odds</b> rather than risk, so you need to switch between the two.</p>
<div class="formula">odds = risk / (1 − risk)        risk = odds / (1 + odds)</div>
<div class="callout eg"><b>Worked example: a risk of 20%</b>
<p>Odds = 0.20 / 0.80 = 0.25, that is one event for every four non-events. Going back: 0.25 / 1.25 = 0.20.</p></div>
<p>For small risks, odds and risk are almost the same (a 5% risk has odds 0.053). For large risks they differ a lot (an 80% risk has odds 4).</p>
<p>Regression actually uses the logarithm of the odds, the <b>log-odds</b>, because it can take any value from minus to plus infinity. A risk of 50% has log-odds 0; lower risks have negative log-odds.</p>
<div data-widget="oddsConverter"></div>
<ul class="try">
<li>Set the risk to 20% and check that the odds are 0.25.</li>
<li>Compare risk and odds at 5% and then at 80%.</li>
</ul>
<p class="src">Source: Ch. 4, §4.2</p>`
    },
    {
      id: 's3',
      title: 'Logistic regression in one example',
      html: `
<p><b>Logistic regression</b> is the standard model for a yes/no outcome. It works in two steps.</p>
<ol>
<li>Add up a score, the <b>linear predictor</b> (lp): a starting value (the <b>intercept</b>) plus a <b>coefficient</b> for each predictor the patient has.</li>
<li>Turn the score into a risk:</li>
</ol>
<div class="formula">lp = α + β<sub>1</sub>x<sub>1</sub> + β<sub>2</sub>x<sub>2</sub> + ...        risk = 1 / (1 + e<sup>−lp</sup>)</div>
<p>A positive coefficient raises the risk and a negative one lowers it. exp(coefficient) is the <b>odds ratio</b> for that predictor: how much it multiplies the odds.</p>
<div class="callout eg"><b>Worked example (Illustrative, synthetic): previous preterm birth</b>
<p>A model for preterm birth is lp = −2.2 + 1.5 × prior_ptb, where prior_ptb is 1 if the woman had a previous preterm birth and 0 if not.</p>
<ol>
<li>No previous preterm birth: lp = −2.2, risk = 1 / (1 + e<sup>2.2</sup>) = about 10%.</li>
<li>Previous preterm birth: lp = −0.7, risk = 1 / (1 + e<sup>0.7</sup>) = about 33%.</li>
<li>The odds ratio is exp(1.5) = 4.5. The risk rises from 10% to 33%, which is 3.3 times, not 4.5 times.</li>
</ol></div>
<p>Software chooses the coefficients that fit the study data best. Because they are tuned to those patients, the model usually looks better on them than it will on new patients. This is the starting point of Module 4.</p>
<div data-widget="logisticCurve"></div>
<ul class="try">
<li>Set the intercept to −2.2, switch on "binary predictor" with β = 1.5, and check the two risks against the example.</li>
<li>Set β = 0 and see that the predictor no longer changes the risk.</li>
</ul>
<p class="src">Source: Ch. 4, §4.2</p>`
    },
    {
      id: 's4',
      title: 'Test results: sensitivity, specificity and predictive values',
      html: `
<p>When a model or test sorts patients into "positive" and "negative", four counts arise: true and false positives, true and false negatives.</p>
<ul>
<li><b>Sensitivity:</b> of the patients with the condition, the share who test positive.</li>
<li><b>Specificity:</b> of the patients without the condition, the share who test negative.</li>
<li><b>Positive predictive value (PPV):</b> of the patients who test positive, the share who have the condition. The <b>negative predictive value (NPV)</b> is the same for negatives.</li>
</ul>
<div class="callout mch"><b>Illustrative (synthetic): a bedside check for neonatal sepsis</b>
<p>Sensitivity 85%, specificity 70%, and 14% of newborns in the unit have sepsis. Out of 1000 newborns, 140 have sepsis and 860 do not.</p>
<ol>
<li>Test positive with sepsis: 85% of 140 = 119. Test positive without sepsis: 30% of 860 = 258.</li>
<li>PPV = 119 / (119 + 258) = 32%. Most positives are false alarms, because most newborns do not have sepsis.</li>
<li>Test negative without sepsis: 70% of 860 = 602; with sepsis: 21. NPV = 602 / 623 = 97%.</li>
</ol></div>
<p>Sensitivity and specificity describe the test. PPV and NPV also depend on how common the condition is, so they change from one setting to another.</p>
<div data-widget="bayes2x2"></div>
<ul class="try">
<li>Set 85%, 70% and 14% and check the counts and the risk after a positive result against the example.</li>
<li>Raise the prevalence to 40% and watch the risk after a positive result rise.</li>
</ul>
<p class="src">Source: Ch. 4, §4.4</p>`
    },
    {
      id: 's5',
      title: 'Why results vary between samples',
      html: `
<p>Any figure from a study is only an estimate. Another sample of patients would give a somewhat different figure. The smaller the sample, the bigger the swings.</p>
<div class="callout eg"><b>Illustrative (synthetic): the true preterm birth risk is 12%</b>
<table class="data">
<tr><th>Women in the sample</th><th>95% of samples show between</th></tr>
<tr><td>50</td><td>3% and 21%</td></tr>
<tr><td>100</td><td>6% and 18%</td></tr>
<tr><td>1000</td><td>10% and 14%</td></tr>
</table>
<p>A clinic with 100 deliveries can see anywhere from 6% to 18% preterm births by chance alone.</p></div>
<p>For a yes/no outcome, what matters most is the <b>number of events</b>, not the number of patients. A study of 10,000 patients with a 0.1% outcome has only 10 events, and that is what limits what it can show.</p>
<h3>The bootstrap</h3>
<p>The <b>bootstrap</b> imitates taking new samples from the data you already have. Draw patients at random from your own sample, putting each one back after it is drawn, until you have a new sample of the same size. Some patients appear twice, others not at all (about 63% of the original patients appear). Repeat this many times and see how much the result changes. Later modules use it to check how optimistic a model is.</p>
<div data-widget="samplingDemo"></div>
<ul class="try">
<li>With a true risk of 12% and n = 100, draw 200 samples and compare the spread with the table. Then try n = 1000.</li>
<li>Click "One bootstrap" and check that about 63% of the original patients appear.</li>
</ul>
<p class="src">Source: Ch. 1, §1.2.2; Ch. 5, §5.3</p>`
    },
    {
      id: 's6',
      title: 'The two questions asked of every model',
      html: `
<p>A model tested on the same patients used to build it looks better than it really is. This is its <b>apparent</b> performance; the excess over performance in new patients is the <b>optimism</b>, and a model with a lot of it is <b>overfitted</b>. Always judge a model on patients it was not built on.</p>
<h3>1. Does it rank patients correctly? (discrimination)</h3>
<p>The <b>c statistic</b> answers this. Take one patient with the outcome and one without: the c statistic is the chance that the model gives the higher risk to the patient with the outcome. 0.5 is no better than a coin toss; 1 is perfect.</p>
<div class="callout eg"><b>Worked example: seven women</b>
<p>Predicted risks of 3 women who delivered preterm: 0.40, 0.25, 0.60. Of 4 who did not: 0.10, 0.30, 0.20, 0.50. There are 3 × 4 = 12 pairs. The woman who delivered preterm has the higher risk in 9 of them (0.40 beats three, 0.25 beats two, 0.60 beats all four), so c = 9 / 12 = 0.75.</p></div>
<h3>2. Are the risks the right size? (calibration)</h3>
<p>If the model says 20% for a group of patients, about 20% of them should have the outcome. In the seven women the average predicted risk is 34% but 3 of 7 (43%) delivered preterm, so the model predicts too low. An overfitted model typically gives risks that are too extreme: too high for high-risk patients and too low for low-risk ones.</p>
<div class="callout key"><b>Key idea</b><p>A model can rank patients well and still give risks that are too high or too low, so both questions must be answered.</p></div>
<p class="src">Source: Ch. 5, §5.1; Ch. 15, §15.1-15.4</p>`
    },
    {
      id: 's7',
      title: 'Terms used in the course',
      html: `
<p>Return to this table when a later module uses a term without explaining it.</p>
<table class="data">
<tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Event</td><td>A patient with the outcome.</td></tr>
<tr><td>Linear predictor</td><td>The model's score for a patient before it is turned into a risk.</td></tr>
<tr><td>Odds ratio</td><td>How much a predictor multiplies the odds.</td></tr>
<tr><td>Bootstrap</td><td>Resampling your own data, with replacement, to mimic new samples.</td></tr>
<tr><td>Apparent performance</td><td>Performance in the patients used to build the model.</td></tr>
<tr><td>Optimism, overfitting</td><td>The model looks better in its own data than in new patients.</td></tr>
<tr><td>c statistic</td><td>The chance that a patient with the outcome gets a higher risk than one without.</td></tr>
<tr><td>Calibration</td><td>Agreement between predicted and observed risks.</td></tr>
<tr><td>Validation</td><td>Testing a model's performance: internally on the development data, externally in other patients, places or times.</td></tr>
</table>
<h3>Datasets used in the course</h3>
<p>All datasets are synthetic: they were generated by computer and contain no real women or newborns.</p>
<div data-widget="datasetCard" data-set="ptb_dev"></div>
<ul class="try">
<li>Read the codebook and find the outcome column and the predictors.</li>
<li>Check that <b>preterm</b> is coded 0 or 1.</li>
</ul>`
    }
  ],
  keyPoints: [
    'A prediction model turns facts about a patient into a predicted risk of a defined outcome.',
    'Odds = risk / (1 − risk); an odds ratio is not a risk ratio when the outcome is common.',
    'Logistic regression adds up a score (lp) and turns it into a risk: 1 / (1 + e^−lp).',
    'PPV and NPV depend on how common the condition is; sensitivity and specificity largely do not.',
    'Small samples give unstable estimates; the number of events matters most.',
    'A model looks better on its own data than on new patients; judge it on new data.',
    'Discrimination (ranking) and calibration (right-sized risks) are different questions; check both.'
  ],
  quiz: [
    {
      q: 'A woman has a predicted preterm-birth risk of 20%. What are her odds of preterm birth?',
      options: ['0.20', '0.25', '0.80', '4'],
      answer: 1,
      why: 'Odds = risk / (1 − risk) = 0.20 / 0.80 = 0.25. 0.20 is the risk itself. 0.80 is the chance of no event, and 4 is the odds of no event.'
    },
    {
      q: 'In a model for preterm birth, the odds ratio for a previous preterm birth is 4.5. What does this mean?',
      options: [
        'The risk of preterm birth is 4.5 times higher.',
        'The risk is 4.5 percentage points higher.',
        'The linear predictor equals 4.5 for these women.',
        'The odds of preterm birth are 4.5 times higher than in otherwise similar women without a previous preterm birth.'
      ],
      answer: 3,
      why: 'An odds ratio multiplies the odds. Reading it as a risk ratio is the commonest slip: in the worked example the risks are 10% and 33%, only 3.3 times higher. It is not a difference in percentage points, and the linear predictor changes by 1.5, not 4.5.'
    },
    {
      q: 'A model has linear predictor lp = −0.7 for a woman. What is her predicted risk?',
      options: ['33%', '50%', '67%', '0.5%'],
      answer: 0,
      why: 'Risk = 1 / (1 + e^0.7) = 1 / 3.01 = 0.33. A risk of 50% needs lp = 0. 67% comes from getting the sign wrong.'
    },
    {
      q: 'Of 1000 women, 50 have the condition. A test has sensitivity 90% and specificity 80%. What share of positive results are true positives?',
      options: ['90%', '80%', '19%', '5%'],
      answer: 2,
      why: 'True positives = 90% of 50 = 45. False positives = 20% of 950 = 190. PPV = 45 / (45 + 190) = 19%. 90% is the sensitivity, not the PPV. When a condition is uncommon, most positives are false alarms.'
    },
    {
      q: 'In a bootstrap sample drawn with replacement from 1000 patients, about what share of the original patients appear at least once?',
      options: ['37%', '63%', '50%', '100%'],
      answer: 1,
      why: 'About 63% appear and 37% are left out, because some patients are drawn more than once. 100% would only happen if patients were not put back after each draw.'
    },
    {
      q: 'A model has a c statistic of 0.75. Which statement is correct?',
      options: [
        '75% of patients are classified correctly.',
        'Predicted risks are on average 75% of the observed risks.',
        'The model explains 75% of the variation in the outcome.',
        'In 75% of pairs of one patient with and one without the outcome, the patient with the outcome has the higher predicted risk.'
      ],
      answer: 3,
      why: 'The c statistic is about ranking within pairs. It needs no cut-off, so it is not the share classified correctly, and it says nothing about whether the risks are the right size (calibration).'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Risk and odds',
      level: 'Apply',
      scenario: `<p>Use the odds converter above to check your answers.</p>`,
      questions: [
        '<b>(a)</b> Convert a preterm birth risk of 12% into odds.',
        '<b>(b)</b> A woman has odds of 0.25. What is her risk?',
        '<b>(c)</b> For a risk of 2% and a risk of 80%, compare the odds with the risk. When can odds and risk be used interchangeably?'
      ],
      answer: `<p><b>(a)</b> Odds = 0.12 / 0.88 = 0.136, about 3 events for every 22 non-events.</p>
<p><b>(b)</b> Risk = 0.25 / 1.25 = 0.20, that is 20%.</p>
<p><b>(c)</b> At 2% the odds are 0.020, almost the same as the risk. At 80% the odds are 4, very different from 0.8. Odds and risk are close only when the outcome is uncommon.</p>`
    },
    {
      id: 't1',
      title: 'From equation to risks',
      level: 'Apply',
      scenario: `<p>Use the model in the case: lp = −3.0 + 0.8 × chronic_htn + 1.2 × prior_ptb.</p>`,
      questions: [
        '<b>(a)</b> Calculate the predicted risk for a woman with neither predictor, with chronic hypertension only, with a previous preterm birth only, and with both.',
        '<b>(b)</b> Give the odds ratio for each predictor.',
        '<b>(c)</b> Is the risk for a woman with both predictors simply the sum of the two separate increases? Explain.'
      ],
      answer: `<p><b>(a)</b> Add up lp, then risk = 1 / (1 + e<sup>−lp</sup>):</p>
<table class="data">
<tr><th>Woman</th><th>lp</th><th>Risk</th></tr>
<tr><td>Neither</td><td>−3.0</td><td>4.7%</td></tr>
<tr><td>Hypertension only</td><td>−2.2</td><td>10.0%</td></tr>
<tr><td>Previous preterm only</td><td>−1.8</td><td>14.2%</td></tr>
<tr><td>Both</td><td>−1.0</td><td>26.9%</td></tr>
</table>
<p><b>(b)</b> Hypertension: exp(0.8) = 2.2. Previous preterm birth: exp(1.2) = 3.3.</p>
<p><b>(c)</b> No. The separate increases are 5.3 and 9.5 percentage points, which would add to 19.5%, but the risk with both is 26.9%. The coefficients add on the score (lp) scale, not on the risk scale, so the extra risk from one predictor depends on how high the risk already is.</p>`
    },
    {
      id: 't2',
      title: 'Odds ratio or risk ratio?',
      level: 'Analyze',
      scenario: `<p>A colleague reads the model and tells the midwives: "a previous preterm birth gives a woman 3.3 times the risk of preterm birth".</p>`,
      questions: [
        '<b>(a)</b> Using your risks from Task 2, calculate the ratio of risks for a previous preterm birth in women without hypertension and in women with hypertension.',
        '<b>(b)</b> Correct the colleague\'s sentence.'
      ],
      answer: `<p><b>(a)</b> Without hypertension: 14.2% / 4.7% = 3.0. With hypertension: 26.9% / 10.0% = 2.7.</p>
<p><b>(b)</b> "A previous preterm birth multiplies the <i>odds</i> of preterm birth by 3.3. In terms of risk, it is about 3 times for women without hypertension and less for women already at higher risk." The odds ratio is the same for every woman in this model; the risk ratio is not, and it moves further from the odds ratio as the risk rises.</p>`
    },
    {
      id: 't3',
      title: 'The same test in two settings',
      level: 'Apply',
      scenario: `<p>Use the bedside test in the case: sensitivity 85%, specificity 70%, for delivery within 7 days.</p>`,
      questions: [
        '<b>(a)</b> Before calculating, guess in which setting a positive result is more likely to be a true positive.',
        '<b>(b)</b> For 1000 women tested in each unit, calculate the PPV and NPV. Check your answers with the widget above.',
        '<b>(c)</b> In two sentences, explain why the same test means different things in the two settings.'
      ],
      answer: `<p><b>(a)</b> In the referral unit, where delivery within 7 days is more common.</p>
<p><b>(b)</b> The team's own unit (14%): 119 true and 258 false positives, PPV 32%; 602 true and 21 false negatives, NPV 97%. Referral unit (40%): 340 true positives (85% of 400) and 180 false positives (30% of 600), PPV 65%; 420 true negatives and 60 false negatives, NPV 87.5%.</p>
<p><b>(c)</b> Sensitivity and specificity are the same in both units, but how many women will deliver soon before testing differs. When the outcome is common, positives are more often real and negatives less reassuring.</p>`
    },
    {
      id: 't4',
      title: 'A negative test in the referral unit',
      level: 'Evaluate',
      scenario: `<p>In the referral unit, a woman at 31 weeks with contractions has a negative bedside test. A trainee proposes to send her home without antenatal corticosteroids.</p>`,
      questions: [
        '<b>(a)</b> Using Task 4, what is this woman\'s chance of delivering within 7 days after the negative result?',
        '<b>(b)</b> Missing a woman who will deliver within 7 days is judged far worse than giving corticosteroids that turn out not to be needed. Would you accept the trainee\'s proposal? Would your answer be the same in the team\'s own unit?'
      ],
      answer: `<p><b>(a)</b> 60 of the 480 women with a negative test deliver within 7 days: 12.5%, about one in eight.</p>
<p><b>(b)</b> No. When missing a case is much worse than unnecessary treatment, the risk at which treatment stops being worthwhile is low, and one in eight is far above it. In the team's own unit the risk after a negative test is 3.4%, so the decision is closer and depends on how much worse a missed case is judged to be. Module 1 turns this judgement into a treatment threshold.</p>`
    },
    {
      id: 't5',
      title: 'Is this clinic really different?',
      level: 'Analyze',
      scenario: `<p>(i) A new clinic reports 10 preterm births among its first 50 deliveries (20%), and the manager proposes a review. (ii) A larger hospital reports 16% among 400 deliveries. The district rate is 12%.</p>`,
      questions: [
        '<b>(a)</b> Use the sampling widget above (true risk 12%) to find the range that 95% of samples fall in for 50 and for 400 deliveries.',
        '<b>(b)</b> Is each observed figure compatible with chance alone? What would you advise?',
        '<b>(c)</b> How could a bootstrap show the manager the uncertainty around the 20% figure?'
      ],
      answer: `<p><b>(a)</b> With 50 deliveries, about 3% to 21%. With 400, about 9% to 15%.</p>
<p><b>(b)</b> The clinic's 20% is inside the chance range: a clinic with a true risk of 12% would see 10 or more preterm births among 50 deliveries about once in 14 times. A review on this basis is premature; wait for more deliveries. The hospital's 16% is outside its range, so it deserves a closer look (case-mix, referral pattern, how preterm birth was recorded) before drawing conclusions about quality.</p>
<p><b>(c)</b> Write the 50 outcomes on cards (10 marked preterm). Draw 50 cards one at a time, putting each back, and note the share of preterm. Repeat a few hundred times: the shares spread widely, and the range includes 12%.</p>`
    },
    {
      id: 't6',
      title: 'Events, not patients',
      level: 'Apply',
      scenario: `<p>Two cohorts are offered for building a model. Cohort A: 5,000 women, outcome in 1%. Cohort B: 800 women, outcome in 15%.</p>`,
      questions: [
        '<b>(a)</b> How many events does each cohort have?',
        '<b>(b)</b> Which cohort carries more information for building a prediction model, and why?'
      ],
      answer: `<p><b>(a)</b> A: 1% of 5,000 = 50 events. B: 15% of 800 = 120 events.</p>
<p><b>(b)</b> Cohort B, although it is six times smaller. For a yes/no outcome the information is carried mainly by the smaller of the two groups, here the events, so B's 120 events let it support more predictors and give steadier estimates than A's 50.</p>`
    },
    {
      id: 't7',
      title: 'Count the pairs',
      level: 'Apply',
      scenario: `<p>In the second hospital, five women are followed to delivery. Predicted risks for the two who delivered preterm: 0.30 and 0.15. For the three who did not: 0.10, 0.20 and 0.05.</p>`,
      questions: [
        '<b>(a)</b> Calculate the c statistic by counting pairs.',
        '<b>(b)</b> Compare the average predicted risk with the share who delivered preterm.',
        '<b>(c)</b> In one sentence, describe how this model performs on the two questions.'
      ],
      answer: `<p><b>(a)</b> There are 2 × 3 = 6 pairs. 0.30 is higher than all three non-events (3 pairs); 0.15 is higher than 0.10 and 0.05 but not 0.20 (2 pairs). c = 5 / 6 = 0.83.</p>
<p><b>(b)</b> Average predicted risk = (0.30 + 0.15 + 0.10 + 0.20 + 0.05) / 5 = 0.16; observed share = 2 / 5 = 0.40.</p>
<p><b>(c)</b> It ranks the women well but its risks are much too low, so it discriminates but is poorly calibrated. (Five women are far too few to judge a real model; the point is the reasoning.)</p>`
    },
    {
      id: 't8',
      title: 'From one hospital to another',
      level: 'Evaluate',
      scenario: `<p>The model had a c statistic of 0.82 in the hospital where it was built and 0.71 in the second hospital. In the second hospital, women given high risks had fewer preterm births than predicted, and women given low risks had more.</p>`,
      questions: [
        '<b>(a)</b> Name the pattern in the risks and the problem it usually points to.',
        '<b>(b)</b> Give a second, different reason why performance could fall in another hospital.',
        '<b>(c)</b> What should the team have done before trying the model elsewhere?'
      ],
      answer: `<p><b>(a)</b> The risks are too extreme: too high at the top, too low at the bottom. This is the usual sign of overfitting: the model learned features of its own sample that do not hold in new women, so its apparent performance (0.82) was optimistic.</p>
<p><b>(b)</b> The hospitals may simply differ: a different mix of women, a different referral pattern or a different way of recording gestational age can change performance even for a model that is not overfitted.</p>
<p><b>(c)</b> Estimate the optimism in the development data first (internal validation, for example with the bootstrap), and only then test the model in the new hospital (external validation). Modules 4, 13 and 14 cover this.</p>`
    }
  ]
});
