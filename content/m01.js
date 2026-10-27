registerModule({
  id: 'm01',
  num: 1,
  part: 'Development',
  title: 'Prediction in medicine and the seven-step roadmap',
  book: 'Ch. 1-2',
  minutes: 60,
  summary: 'Why and where prediction models are used, how a risk estimate turns into a decision, and the seven steps that structure the development and validation of a model.',
  objectives: [
    'Tell diagnostic from prognostic models',
    'Define a prediction problem first',
    'Turn a risk into a treatment decision',
    'Count events, not patients',
    'Name four research uses of models',
    'Put the seven modelling steps in order'
  ],
  format: 'cases',
  essentials: `
<ul>
<li>Prediction is first an <b>estimation</b> problem: the aim is accurate absolute risks for new patients. A new marker earns its place only if it improves on predictors that are already known and easy to measure.</li>
<li>A <b>diagnostic</b> model estimates whether a condition is present now (cross-sectional data); a <b>prognostic</b> model estimates a future outcome (a cohort followed over time).</li>
<li>A risk becomes a decision through a <b>threshold</b>: threshold = harm / (harm + benefit). For a treatment with a constant relative risk RR and an absolute harm H, treat if the risk r &gt; H / (1 − RR). The threshold is a clinical choice, not a statistical one.</li>
<li>The <b>effective sample size</b> is the number of events. The more of a model that must be learned from the data, the more events are needed.</li>
<li>Models also serve research: selecting and stratifying trial patients, adjusting trial analyses, propensity scores, and comparing hospitals after accounting for case-mix.</li>
<li>The <b>seven steps</b>: data inspection, coding of predictors, model specification, estimation, performance, validation, presentation. They are preceded by defining the problem, and only predictors known at the moment of prediction may be used.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. In this module the team plans its own model to predict preterm birth at the booking visit. You follow the project from defining the problem, to using the predicted risks for a treatment decision, to research uses, and finally to a review by the research committee. You do not need the primer for this story.',
  cases: [
    {
      id: 'c1',
      title: 'Extra antenatal visits for the women most at risk',
      aim: 'define a prediction problem and choose predictors that are known at the moment of prediction.',
      minutes: 12,
      need: `
<p>Before any analysis, define the problem in one or two sentences each: the research question, the intended application (who uses the risk, when, to decide what), the outcome, the predictors, the study design, the statistical model and the sample size.</p>
<p>A model can only use what is known at the moment of prediction. A predictor recorded later in pregnancy makes a booking-visit model unusable, however well it predicts in the data. A <b>prognostic</b> design follows women forward to the outcome; a <b>diagnostic</b> design measures predictors and the condition at the same time.</p>`,
      scenario: `<p>The team wants to offer extra antenatal contacts to the women most at risk of preterm birth, deciding at the booking visit. It has a synthetic cohort to work with: women recorded at booking and followed to delivery (ptb_dev).</p>`,
      widgets: `<div data-widget="datasetCard" data-set="ptb_dev"></div>`,
      tasks: [0, 1],
      takeaway: 'Fix the question, the moment of prediction and the outcome before touching the data; a predictor not known at that moment cannot be used.'
    },
    {
      id: 'c2',
      title: 'Who should get the preventive treatment?',
      aim: 'turn predicted risks into treatment decisions with a threshold.',
      minutes: 12,
      need: `
<p>The treatment threshold is the risk at which treating and not treating are equally good. If <b>harm</b> is the net loss from treating someone who would not have the outcome and <b>benefit</b> the net gain from treating someone who would, threshold = harm / (harm + benefit).</p>
<p>For a treatment that lowers risk by a constant relative amount (RR) and causes a constant absolute harm H, the benefit for a woman at risk r is (1 − RR) × r, so treat if r &gt; H / (1 − RR). Example: RR 0.5 and H 3% give a break-even risk of 0.03 / 0.5 = 6%. A woman at 10% gains 5% − 3% = 2%; a woman at 4% loses 1%.</p>`,
      scenario: `<p>The team's model will also guide a preventive treatment in pregnancy that lowers the risk of preterm birth but has side-effects of its own. The team must decide whom to treat.</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'A threshold comes from the balance of harms and benefits, not from statistics, and the model must be well calibrated near it.'
    },
    {
      id: 'c3',
      title: 'A trial and a comparison of clinics',
      aim: 'see how prediction models support research: adjusting a trial analysis and comparing clinics fairly.',
      minutes: 12,
      need: `
<p>In a randomised trial analysed with logistic regression, adjusting for strongly prognostic baseline covariates moves the treatment effect further from zero and increases its standard error, yet still increases power, because the estimate grows more than the standard error. With linear regression and balanced groups, the estimate is unchanged and the standard error falls.</p>
<p>Clinics and hospitals see different women, so raw outcome rates cannot be compared. A model gives each one an <b>expected</b> rate from its own case-mix, and observed can be compared with expected. Models can also select or stratify trial patients, and a <b>propensity score</b> can adjust for observed confounders without randomisation.</p>`,
      scenario: `<p>The team is planning a randomised trial of a preterm birth prevention programme, and the state asks it to help compare preterm birth rates between antenatal clinics.</p>`,
      widgets: '',
      tasks: [4, 5],
      takeaway: 'Prognostic adjustment makes trials more powerful, and case-mix models make comparisons between clinics fairer, but only for what the model measures.'
    },
    {
      id: 'c4',
      title: 'A model proposal under review',
      aim: 'check a modelling plan against the seven steps and spot problems that cannot be repaired later.',
      minutes: 14,
      need: `
<p>The seven steps, in order: (1) data inspection, including missing values; (2) coding of predictors; (3) model specification: which predictors, and whether effects are additive and linear; (4) estimation, limiting overfitting with shrinkage or penalisation; (5) performance: calibration, discrimination, clinical usefulness; (6) validation: internal (same population) and external (other settings); (7) presentation as a formula, score chart or nomogram.</p>
<p>Each choice tuned to the data makes performance look better than it will be in new patients, so the plan should be fixed in advance. Internal validity is a precondition for external validity.</p>`,
      scenario: `<p>The team's modelling plan goes to the research committee, together with a proposal from another group for a different preterm birth model. You are asked to review both.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'Pre-specify the steps, validate internally before externally, and treat predictors that are unavailable at the moment of prediction as a fatal flaw.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Why predict: estimation first',
      html: `
<p>Most medical actions aim to improve prognosis, and each is worthwhile only if its benefit to the individual outweighs its harms and costs. That judgement needs the individual's risk. A prediction model combines a few patient characteristics (typically 2 to 20 predictors) into that risk, so that clinicians and patients can weigh the options together.</p>
<p>The book treats prediction primarily as an <b>estimation</b> problem (what is this woman's risk of preterm birth?), not a testing problem (is haemoglobin associated with preterm birth?). In an aetiological study, adjustment for confounders is the central concern, and causal effects are expressed as risk differences, risk ratios or odds ratios. In a prediction study, a predictor is kept for what it adds to the risks. A new marker is useful only if it improves predictions over predictors already known and easy to measure, such as age, parity and obstetric history.</p>
<p>The course covers regression models with a modest number of candidate predictors (the book considers fewer than about 25) and assumes that clinical knowledge is available. Settings with thousands of candidate predictors (genomics, proteomics) are out of scope, and so is prediction modelling on medical images.</p>
<p class="src">Source: Ch. 1, §1.1-1.2</p>`
    },
    {
      id: 'n2',
      title: 'Where prediction models are used',
      html: `
<table class="data">
<tr><th>Use</th><th>What the model does</th><th>In the course story</th></tr>
<tr><td>Public health</td><td>Finds people at high risk for screening or prevention; calibration matters most</td><td>Extra antenatal contacts for the 20% at highest risk</td></tr>
<tr><td>Diagnostic work-up</td><td>Decides who needs a costly or invasive test, using one or two probability thresholds</td><td>Who needs a further assessment after booking</td></tr>
<tr><td>Treatment decisions</td><td>Matches the intensity of treatment to the risk, or supports watchful waiting</td><td>Who receives a preventive treatment</td></tr>
<tr><td>Research</td><td>Selects and stratifies trial patients, adjusts analyses, compares providers</td><td>A prevention trial; comparing clinics</td></tr>
</table>
<p>Book examples: the Gail model gives absolute risks of breast cancer for counselling about preventive tamoxifen; the Framingham functions support statin policies for people at high cardiovascular risk. When a treatment has a constant relative benefit, its absolute benefit grows with baseline risk, so treating higher-risk patients is also more cost-effective.</p>
<p class="src">Source: Ch. 2, §2.1-2.3</p>`
    },
    {
      id: 'n3',
      title: 'From a risk to a decision',
      html: `
<p>The <b>treatment threshold</b> is the risk at which treating and not treating are equally good. Below it, do not treat; above it, treat.</p>
<div class="formula">threshold = harm / (harm + benefit)        constant RR and absolute harm H: treat if r &gt; H / (1 − RR)</div>
<p>If missing a case is 100 times worse than treating someone unnecessarily, the threshold is 1 / 101, about 1% (the book's illustration). If both errors were equally bad it would be 50%, which is why a 50% cut-off is seldom right.</p>
<p><b>In the course story.</b> A preventive treatment halves the risk of preterm birth (RR 0.5) and has an absolute harm of 3%. The break-even risk is 0.03 / 0.5 = 6%. A woman at 10% gains 5% − 3% = 2% net, and 20 such women must be treated to prevent one preterm birth (1 / 0.05); a woman at 4% loses 1% net.</p>
<p>The threshold comes from the consequences of decisions and from patient values, not from statistics. Module 12 returns to it.</p>
<p class="src">Source: Ch. 2, §2.3.3, §2.3.5-2.3.6</p>`
    },
    {
      id: 'n4',
      title: 'Prediction models in research',
      html: `
<p><b>Trials.</b> One predicted risk can replace several separate inclusion criteria, and can summarise prognosis for stratified randomisation. Adjusting the treatment effect for strongly prognostic baseline covariates changes the analysis as follows:</p>
<table class="data">
<tr><th>Model</th><th>Effect estimate</th><th>Standard error</th><th>Power</th></tr>
<tr><td>Linear regression</td><td>Unchanged if groups are balanced</td><td>Falls</td><td>Rises</td></tr>
<tr><td>Logistic or Cox regression</td><td>Moves further from zero</td><td>Rises</td><td>Rises</td></tr>
</table>
<p>The gain grows with how strongly the covariates predict the outcome. Book examples: covariate sets with R² of 13%, 25%, 30% and 40% gave sample-size reductions of 12%, 19%, 25% and 30%.</p>
<p><b>Observational studies.</b> Without randomisation, regression adjusts for observed confounders. When the outcome is rare, a <b>propensity score</b> (the predicted probability of receiving the treatment, from the confounders) can be used for matching, stratification or adjustment. Neither handles unobserved confounders.</p>
<p><b>Comparing providers.</b> Clinics see different women, so raw rates mislead. A case-mix model gives each clinic an expected rate, and observed can be compared with expected.</p>
<p class="src">Source: Ch. 2, §2.4</p>`
    },
    {
      id: 'n5',
      title: 'Uncertainty and sample size',
      html: `
<p><b>Model uncertainty.</b> When the model is shaped by looking at the data (dropping weak predictors, adding non-linear terms, merging categories), the usual confidence intervals and p-values are too optimistic. The bootstrap can repeat the whole modelling process to show this.</p>
<p><b>Events, not patients.</b> The effective sample size is the number of events. Small samples make predictions unreliable, prevent checking of assumptions, and force reliance on prior knowledge. The more of the model that has to be learned from the data, the more events are needed:</p>
<table class="data">
<tr><th>Already known</th><th>What the data must supply</th><th>Sample size</th></tr>
<tr><td>Nothing</td><td>Predictors, their form and coefficients</td><td>Very large</td></tr>
<tr><td>Predictors</td><td>Form (transformations, interactions) and coefficients</td><td>Large</td></tr>
<tr><td>Predictors and form</td><td>Coefficients</td><td>Modest</td></tr>
<tr><td>The whole model</td><td>Validation and updating</td><td>Modest</td></tr>
</table>
<p>Module 2 gives rules of thumb for the number of events.</p>
<p class="src">Source: Ch. 1, §1.2.1-1.2.2, §1.3.4</p>`
    },
    {
      id: 'n6',
      title: 'Define the problem, then follow the seven steps',
      html: `
<p><b>Step 0: define the problem</b> in a sentence or two each, before looking at data.</p>
<table class="data">
<tr><th>Item</th><th>In the course story</th></tr>
<tr><td>Research question</td><td>Probability of preterm birth (before 37 weeks) in women booking at the clinic</td></tr>
<tr><td>Intended application</td><td>Midwives at booking decide who receives extra visits</td></tr>
<tr><td>Outcome</td><td>Gestational age at delivery by the best available dating</td></tr>
<tr><td>Predictors</td><td>Only those known at booking: age, BMI, haemoglobin, parity, history, hypertension, tobacco</td></tr>
<tr><td>Design and model</td><td>Prospective cohort; logistic regression</td></tr>
<tr><td>Sample size</td><td>Number of preterm births (Module 2)</td></tr>
</table>
<p>A predictor recorded after the moment of prediction (number of antenatal visits, mode of delivery) makes the model unusable, however well it predicts in the data.</p>
<table class="data">
<tr><th>Step</th><th>Question</th><th>Module</th></tr>
<tr><td>1. Data inspection</td><td>How are predictors distributed; how much is missing?</td><td>5</td></tr>
<tr><td>2. Coding</td><td>How should predictors enter the model?</td><td>6, 7</td></tr>
<tr><td>3. Specification</td><td>Which predictors; are effects additive and linear?</td><td>8, 9</td></tr>
<tr><td>4. Estimation</td><td>How to limit overfitting (shrinkage, penalisation)?</td><td>10</td></tr>
<tr><td>5. Performance</td><td>Calibration, discrimination, clinical usefulness</td><td>11, 12</td></tr>
<tr><td>6. Validation</td><td>Internal, then external</td><td>13, 14</td></tr>
<tr><td>7. Presentation</td><td>Formula, score chart, nomogram</td><td>15</td></tr>
</table>
<p><b>Internal validity</b> is reproducibility in the population the data came from, threatened by overfitting. <b>External validity</b> is performance in other settings. The first is a precondition for the second. Every decision tuned to the data makes performance look better than it will be, so keep the plan pre-specified.</p>
<p class="src">Source: Ch. 1, §1.3.2-1.3.3; Part II checklist</p>`
    }
  ],
  keyPoints: [
    'Prediction is primarily an estimation problem: the aim is accurate absolute risks for individual patients.',
    'Diagnostic models use cross-sectional data; prognostic models use cohorts followed over time.',
    'A treatment threshold is harm / (harm + benefit) for diagnosis, or H / (1 − RR) in absolute-risk terms for a constant relative effect.',
    'In randomised trials, covariate adjustment with logistic regression moves the effect away from zero, raises the standard error and increases power.',
    'The effective sample size is the number of events: 10,000 patients at 0.1% incidence give 10 events.',
    'The more of the model that must be learned from data (predictors, form, coefficients), the larger the sample needed.',
    'The seven steps are data inspection, coding, specification, estimation, performance, validation and presentation.',
    'Internal validity is reproducibility in the same population; external validity is transportability to other settings, and the first is a precondition for the second.'
  ],
  quiz: [
    {
      q: 'How does the book characterise the main task of a clinical prediction model?',
      options: [
        'Mainly a hypothesis-testing problem: identifying which predictors have p &lt; 0.05.',
        'Mainly a classification problem: sorting patients into high-risk and low-risk groups.',
        'Mainly an estimation problem: estimating the absolute risk of an outcome for an individual patient.',
        'Mainly a causal problem: identifying the factors that cause the outcome.'
      ],
      answer: 2,
      why: 'Prediction is primarily estimation of individual risk (and secondarily testing of predictor effects). The testing view leads to selecting predictors by p-value, which harms predictions. Classification into risk groups discards information and needs a threshold that depends on the decision. Causal interpretation of predictors is the aim of aetiological research, not of prediction.'
    },
    {
      q: 'A cohort of 8,000 women is followed for an outcome with incidence 0.25%. What is the effective sample size?',
      options: ['20 events', '8,000 women', '4,000 women', '2,000 women'],
      answer: 0,
      why: '0.25% of 8,000 = 20 events. The effective sample size is the number of events, not the number of patients. Quoting 8,000 is the commonest misconception: a large cohort with a rare outcome contains little information about that outcome.'
    },
    {
      q: 'Missing a case costs 50 times as much as treating one person unnecessarily (harm : benefit = 1 : 50). What is the treatment threshold probability?',
      options: ['50%', '5%', '0.5%', '2%'],
      answer: 3,
      why: 'Threshold = harm / (harm + benefit) = 1 / 51 = 1.96%, about 2%. The threshold odds are 1/50 = 0.02, which is close to but not the same as the probability. 50% would apply only if both errors were equally bad. 5% would correspond to 1 : 19 and 0.5% to 1 : 199.'
    },
    {
      q: 'In a randomised trial with a binary outcome, baseline prognostic covariates are included in a logistic regression, with the groups perfectly balanced on them. How do the estimated treatment effect (log odds ratio) and its standard error change, compared with the unadjusted analysis?',
      options: [
        'Both are unchanged, as randomisation has balanced the groups.',
        'The effect moves further from zero and the standard error increases, while power increases.',
        'The effect moves towards zero and the standard error decreases, while power decreases.',
        'The effect is unchanged and the standard error decreases, as in linear regression.'
      ],
      answer: 1,
      why: 'In logistic and Cox models adjustment changes the estimate even with perfect balance: the effect moves away from zero (a "stratification effect") and the SE rises, but the estimate rises by more, so the power is higher. The unchanged estimate with a decreasing SE describes linear regression for continuous outcomes. Assuming adjustment is irrelevant in a randomised trial overlooks the gain in precision from prognostic covariates.'
    },
    {
      q: 'A team has coded its predictors, chosen the predictors to include and estimated shrunken coefficients. Which step of the roadmap comes next?',
      options: [
        'Data inspection, including the handling of missing values.',
        'Model presentation as a score chart.',
        'Evaluation of model performance (calibration, discrimination, clinical usefulness).',
        'Coding of continuous predictors.'
      ],
      answer: 2,
      why: 'The order is data inspection, coding, specification, estimation, performance, validation, presentation. Performance follows estimation; validation of that performance follows, and presentation comes last. Data inspection and coding come before specification, so repeating them after estimation would mean the model had been fitted before the data were understood.'
    },
    {
      q: 'A preterm-birth model developed in a district hospital shows only small optimism on bootstrap validation. What can be concluded?',
      options: [
        'The model will perform equally well in a tertiary referral hospital.',
        'The model is free of overfitting and needs no further evaluation.',
        'Its performance is likely to be reproducible for similar women in the same setting, but generalisability to other settings is not shown.',
        'The model has established external validity, because the bootstrap used resampled data.'
      ],
      answer: 3,
      why: 'Bootstrap or other internal validation addresses internal validity (reproducibility in the underlying population). External validity needs data from a different setting, time or patient mix, where performance may differ for genuine reasons. Resampling the same data cannot test transportability, which is the misconception in the last option. Small optimism does not guarantee other settings are alike (first option).'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Define the prediction problem',
      level: 'Create',
      scenario: `<p>Write the district team's problem definition before any data are analysed.</p>`,
      questions: [
        '<b>(a)</b> In one sentence each, state the research question, the intended application, the outcome definition and the study design.',
        '<b>(b)</b> List five candidate predictors that would be known at the booking visit, and two that would tempt an analyst but are not known then.',
        '<b>(c)</b> Which statistical model fits this outcome, and what number from the data must you check before deciding how many predictors to consider?'
      ],
      answer: `<p><b>(a)</b> <b>Research question:</b> the probability of preterm birth (before 37 completed weeks) in women booking at the district antenatal clinic. <b>Intended application:</b> midwives at the booking visit use the predicted risk to decide who is offered extra antenatal contacts. <b>Outcome:</b> gestational age at delivery below 37 weeks, dated by the best available method (early ultrasound where possible), recorded at delivery. <b>Design:</b> a prospective cohort of women followed from booking to delivery, a prognostic design.</p>
<p><b>(b)</b> Known at booking: maternal age, BMI, haemoglobin, parity, previous preterm birth, chronic hypertension, tobacco use. Not known at booking: number of antenatal visits over the pregnancy, mode of delivery, birth weight.</p>
<p><b>(c)</b> Binary logistic regression. Check the number of preterm births (the events), because the number of events, not the number of women, limits how many predictors can be studied (Module 2).</p>`
    },
    {
      id: 't1',
      title: 'The design and the predictors',
      level: 'Analyze',
      scenario: `<p>Open the ptb_dev dataset card in Case 1 and read the summary and the codebook.</p>`,
      questions: [
        '<b>(a)</b> Is ptb_dev a prognostic or a diagnostic design? Justify your answer, and say what would make a preterm birth question diagnostic instead.',
        '<b>(b)</b> The model is meant for use at the first antenatal (booking) visit. Which ptb_dev columns would you not allow as predictors, and why?',
        '<b>(c)</b> From the ptb_dev card, take the number of preterm births and divide by 15, the number of parameters in the full 14-term model (age uses 2 parameters). Comment on what this tells you.',
        '<b>(d)</b> Which of the allowed predictors are obtained by asking or examining the woman, and which need a laboratory test? Why does this distinction matter for a prediction model?'
      ],
      answer: `<p><b>(a)</b> Prognostic: women are identified at booking and followed to delivery, and the outcome (delivery before 37 weeks) happens later. A question would be diagnostic if the predictors and the condition referred to the same moment, for example whether a woman who arrives with contractions is in established preterm labour at that visit, judged against a reference assessment made at the same time.</p>
<p><b>(b)</b> Number of antenatal visits (<b>anc_visits</b>) accumulates over pregnancy, so it is not known at booking; using it would leak information from after the time of prediction. The fetal sex column (<b>female_fetus</b>) is not routinely known at booking either. Variables recorded at or before booking (age, BMI, haemoglobin, parity, history, chronic hypertension, tobacco, SES, height, season of conception) are acceptable; bacteriuria depends on whether the urine culture is part of the booking visit in the intended workflow.</p>
<p><b>(c)</b> The cohort has <span data-live="ptb_dev_events"></span> preterm births. Dividing by 15 gives the events per candidate parameter (EPV), about 15 to 16 at an incidence near 12% in 2,000 women. That is above 10, the minimum rule of thumb taught in Module 2, but well below the 50 events per candidate that reliable data-driven selection needs (Module 8), so selecting predictors from all 15 parameters in this cohort would be unreliable.</p>
<p><b>(d)</b> Age, parity, obstetric history, chronic hypertension, tobacco use, height and BMI come from history and simple measurement; haemoglobin needs a blood test and bacteriuria a urine culture. A prediction model should use predictors that are readily available and affordable where it will be used, and a costlier test is best judged by its added value over the cheaper predictors (a model without it versus with it). This is developed in Module 2.</p>`
    },
    {
      id: 't2',
      title: 'Thresholds for a preventive treatment',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A preventive treatment during pregnancy lowers the risk of preterm birth by 30% in relative terms (RR = 0.7) in every risk group. It causes an absolute harm of 2% (an excess risk of a side-effect that is comparable in importance to a preterm birth). A booking-visit model gives predicted risks of preterm birth of 3%, 8% and 15% for three women.</p>`,
      questions: [
        '<b>(a)</b> Calculate the break-even (threshold) risk.',
        '<b>(b)</b> For each woman, calculate the absolute benefit, the net benefit (benefit minus harm) and the number needed to treat to prevent one event.',
        '<b>(c)</b> A clinician proposes treating everyone. Which of the three women would be harmed on balance?',
        '<b>(d)</b> A separate diagnostic decision: a test result is followed by a treatment for which missing a true case is judged 20 times worse than treating a non-case. Give the threshold probability.'
      ],
      answer: `<p><b>(a)</b> Threshold = H / (1 − RR) = 0.02 / 0.30 = 0.0667, about 6.7%.</p>
<p><b>(b)</b></p>
<table class="data">
<tr><th>Risk r</th><th>Benefit 0.3 × r</th><th>Net = benefit − 2%</th><th>NNT = 1 / benefit</th></tr>
<tr><td>3%</td><td>0.9%</td><td>−1.1%</td><td>111</td></tr>
<tr><td>8%</td><td>2.4%</td><td>+0.4%</td><td>42</td></tr>
<tr><td>15%</td><td>4.5%</td><td>+2.5%</td><td>22</td></tr>
</table>
<p><b>(c)</b> The woman at 3% has net −1.1%: she is harmed on balance. The woman at 8% gains only 0.4%, barely above break-even, which shows how sensitive the decision is to the accuracy of her estimated risk near the threshold.</p>
<p><b>(d)</b> Harm : benefit = 1 : 20, threshold probability = 1 / (1 + 20) = 4.8% (threshold odds 0.05).</p>
<p><b>Interpretation:</b> a model is useful for this decision only if it separates women above and below about 6.7%; a model whose risks are miscalibrated around that value can lead to wrong decisions even if it ranks women well.</p>`
    },
    {
      id: 't3',
      title: 'A capacity limit is not a threshold',
      level: 'Analyze',
      scenario: `<p>The programme can afford the preventive treatment for only the 20% of women with the highest predicted risk.</p>`,
      questions: [
        '<b>(a)</b> How does choosing "the top 20%" differ from choosing "everyone above the break-even risk"?',
        '<b>(b)</b> What happens if the risk at the 20% cut-off is below the break-even risk? And if it is above?',
        '<b>(c)</b> Which property of the model decides how many future events fall within the top 20%, and which decides whether its risks can be compared with the break-even value?'
      ],
      answer: `<p><b>(a)</b> The top 20% is a rule based on rank: it fixes how many women are treated, whatever their risks. The break-even rule is based on the size of each woman's risk compared with the balance of harm and benefit.</p>
<p><b>(b)</b> If the cut-off lies below the break-even risk, some treated women are harmed on balance. If it lies above, some women who would benefit go untreated because of capacity, which is a resource decision to state openly.</p>
<p><b>(c)</b> Discrimination (ranking) decides how many of the future events are concentrated among the top 20%. Calibration decides whether the predicted risks mean what they say, so that they can be compared with the break-even risk.</p>`
    },
    {
      id: 't4',
      title: 'Adjusting a trial for prognosis',
      level: 'Apply',
      scenario: `<p>The prevention trial will randomise 2,000 women and analyse preterm birth with logistic regression. The statistician proposes adjusting the treatment effect for previous preterm birth and cervical length, which are strongly prognostic; randomisation is expected to balance them between arms.</p>`,
      questions: [
        '<b>(a)</b> Compared with the unadjusted analysis, what happens to the estimated treatment odds ratio, its standard error and the power?',
        '<b>(b)</b> A colleague says the adjusted odds ratio must be wrong because it differs from the unadjusted one although the arms are balanced. How do you reply?',
        '<b>(c)</b> How would the answer to (a) differ if the outcome were birth weight analysed with linear regression?'
      ],
      answer: `<p><b>(a)</b> The adjusted odds ratio moves further from 1, its standard error increases, and power increases, because the estimate grows more than its standard error. The gain is larger when the covariates predict the outcome strongly; the book reports sample-size reductions of roughly 12% to 30% for covariate sets with R² of 13% to 40%.</p>
<p><b>(b)</b> In logistic regression the adjusted and unadjusted effects are not expected to agree even with perfect balance: the adjusted odds ratio describes the effect for women with the same values of the covariates. It is not biased by the adjustment; it answers a slightly different, more individual question.</p>
<p><b>(c)</b> With linear regression and balanced arms the estimated effect is the same with or without adjustment, while the standard error falls, so power also increases.</p>`
    },
    {
      id: 't5',
      title: 'Comparing clinics fairly',
      level: 'Apply',
      scenario: `<p>The preterm birth rate is 18.0% in the referral hospital's antenatal clinic and 10.0% in a rural clinic. Applied to each clinic's own women at booking, the team's model gives an expected rate of 20.0% for the referral clinic and 7.5% for the rural clinic.</p>`,
      questions: [
        '<b>(a)</b> Calculate the observed-to-expected ratio for each clinic and interpret it.',
        '<b>(b)</b> Give two reasons to be cautious before ranking the clinics on these ratios.'
      ],
      answer: `<p><b>(a)</b> Referral clinic: 18.0 / 20.0 = 0.90, fewer preterm births than expected for its women. Rural clinic: 10.0 / 7.5 = 1.33, more than expected. The raw rates suggested the opposite.</p>
<p><b>(b)</b> The model adjusts only for the characteristics it contains; unmeasured differences between the women remain. The expected rates are only as good as the model's calibration in each clinic. And with few preterm births in a small clinic, a ratio of 1.33 can arise by chance, because small samples swing (Primer, Case 3).</p>`
    },
    {
      id: 't6',
      title: 'Put the plan in order',
      level: 'Understand',
      scenario: `<p>A team lists its planned activities in no particular order: (i) test the model in a second state; (ii) decide how to handle missing haemoglobin values; (iii) estimate coefficients with shrinkage; (iv) present the model as a score chart; (v) decide whether age has a linear effect; (vi) decide whether to keep BMI continuous or group it; (vii) estimate the c statistic and a calibration plot; (viii) estimate optimism with the bootstrap.</p>`,
      questions: [
        '<b>(a)</b> Assign each activity to its step (1 to 7) and put them in order.',
        '<b>(b)</b> Why must (viii) come before (i)?'
      ],
      answer: `<p><b>(a)</b> Step 1, data inspection: (ii). Step 2, coding: (vi). Step 3, specification: (v). Step 4, estimation: (iii). Step 5, performance: (vii). Step 6, validation: (viii) internal, then (i) external. Step 7, presentation: (iv).</p>
<p><b>(b)</b> Internal validity is a precondition for external validity. If the model is overfitted in its own population, a fall in performance elsewhere cannot be separated from optimism that was present from the start.</p>`
    },
    {
      id: 't7',
      title: 'Critique another preterm birth model proposal',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). Another group proposes a model to identify, at the booking visit, women at high risk of preterm birth so that primary health centres can offer a prevention package. They use data from a completed randomised trial of a progesterone regimen in three tertiary hospitals, which excluded women with a multiple pregnancy or a previous preterm birth. Candidate predictors: maternal age, parity, haemoglobin, BMI, cervical length measured at 24 weeks, number of antenatal visits, mode of delivery and birth weight. Preterm birth is defined from the woman's recalled last menstrual period, recorded at delivery. The authors plan to report p-values for each predictor and a c statistic, to classify women as high risk when predicted risk exceeds 50%, and to deploy the model after this analysis.</p>`,
      questions: [
        '<b>(a)</b> Identify the problems in the match between intended use and data, point by point.',
        '<b>(b)</b> Comment on the outcome definition and on the number of events.',
        '<b>(c)</b> Comment on the analysis and reporting plan, including the threshold.',
        '<b>(d)</b> Which of the problems would you treat as fatal?'
      ],
      answer: `<ol>
<li><b>Predictors not known at the time of prediction (Critical).</b> The model is for use at booking, but cervical length at 24 weeks and the number of antenatal visits are only known later in pregnancy, and mode of delivery and birth weight only at or after the outcome itself. A model using them cannot be applied at the moment of decision.</li>
<li><b>Population mismatch.</b> Trial data come from tertiary hospitals with stringent exclusions; the intended users are primary health centres with a different case-mix. Excluding women with a previous preterm birth removes one of the strongest predictors, so the model cannot learn its effect and will not fit those women. The trial arm (progesterone) is also a treatment that may alter the outcome; combining arms assumes no subgroup effects, which should be checked or stated.</li>
<li><b>Outcome.</b> Gestational age from a recalled last menstrual period is imprecise, so births near 37 weeks are misclassified; the book asks that the outcome of a prediction model be measured with high accuracy even when the predictors are pragmatic, here the best available dating such as an early ultrasound. An outcome with random error weakens every association and calibration cannot be judged. The number of preterm births is not reported; the effective sample size is the number of events, and eight candidate predictors (more parameters if parity or mode of delivery are categorical) may be too many for the number available (Module 2).</li>
<li><b>Analysis plan.</b> Prediction is an estimation problem, so reporting p-values of predictors does not show that the model predicts well; absolute risks, calibration and discrimination are needed, along with a check for overfitting (internal validation).</li>
<li><b>Threshold.</b> A 50% cut-off implies false positives and false negatives are equally bad. For a prevention package with small harm and a serious outcome, the threshold should be much lower and should come from the harm : benefit trade-off, together with local capacity.</li>
<li><b>Validation before deployment.</b> No internal or external validation is planned. Deployment in a different setting needs external validation.</li>
</ol>
<p><b>(d)</b> Using predictors that are unavailable at booking invalidates the intended application and is fatal; the absence of any validation before deployment is critical as well. The other points weaken the model and can be repaired by redesign.</p>`
    }
  ]
});
