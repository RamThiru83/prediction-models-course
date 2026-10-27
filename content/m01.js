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
  story: 'Throughout the course you follow the maternity team of a district hospital. The hospital and its data are fictional and synthetic. It runs an antenatal clinic, where women book early in pregnancy, and a newborn unit, and it sends its sickest babies to a regional referral unit. In this module the team plans its own model to predict preterm birth at the booking visit. You follow the project from defining the problem, to using the predicted risks for a treatment decision, to research uses, and finally to a review by the research committee. You do not need the primer for this story.',
  cases: [
    {
      id: 'c1',
      title: 'Extra antenatal visits for the women most at risk',
      aim: 'define a prediction problem and choose predictors that are known at the moment of prediction.',
      minutes: 12,
      need: `
<p>Before any analysis, define the problem in one or two sentences each: the research question, the intended application (who uses the risk, when, to decide what), the outcome, the predictors, the study design, the statistical model and the sample size.</p>
<p>A model can only use what is known at the moment of prediction. A predictor recorded later in pregnancy makes a booking-visit model unusable, however well it predicts in the data. A <b>prognostic</b> design follows women forward to the outcome; a <b>diagnostic</b> design measures predictors and the condition at the same time.</p>`,
      scenario: `<p>The team wants to offer extra antenatal contacts to the women most at risk of preterm birth, deciding at the booking visit. It has two synthetic datasets to work with: an antenatal cohort (ptb_dev) and a newborn-unit dataset (sepsis).</p>`,
      widgets: `<div data-widget="datasetCard" data-set="ptb_dev"></div><div data-widget="datasetCard" data-set="sepsis"></div>`,
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
      scenario: `<p>The team's model will also guide a preventive treatment in pregnancy that lowers the risk of an adverse outcome but has side-effects of its own. The team must decide whom to treat.</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'A threshold comes from the balance of harms and benefits, not from statistics, and the model must be well calibrated near it.'
    },
    {
      id: 'c3',
      title: 'A trial and a hospital comparison',
      aim: 'see how prediction models support research: adjusting a trial analysis and comparing hospitals fairly.',
      minutes: 12,
      need: `
<p>In a randomised trial analysed with logistic regression, adjusting for strongly prognostic baseline covariates moves the treatment effect further from zero and increases its standard error, yet still increases power, because the estimate grows more than the standard error. With linear regression and balanced groups, the estimate is unchanged and the standard error falls.</p>
<p>Hospitals receive different patients, so raw outcome rates cannot be compared. A model gives each hospital an <b>expected</b> rate from its own case-mix, and observed can be compared with expected. Models can also select or stratify trial patients, and a <b>propensity score</b> can adjust for observed confounders without randomisation.</p>`,
      scenario: `<p>The team is planning a randomised trial of a preterm birth prevention programme, and the state asks it to help compare neonatal mortality between hospitals.</p>`,
      widgets: '',
      tasks: [4, 5],
      takeaway: 'Prognostic adjustment makes trials more powerful, and case-mix models make hospital comparisons fairer, but only for what the model measures.'
    },
    {
      id: 'c4',
      title: 'A model proposal under review',
      aim: 'check a modelling plan against the seven steps and spot problems that cannot be repaired later.',
      minutes: 14,
      need: `
<p>The seven steps, in order: (1) data inspection, including missing values; (2) coding of predictors; (3) model specification: which predictors, and whether effects are additive and linear; (4) estimation, limiting overfitting with shrinkage or penalisation; (5) performance: calibration, discrimination, clinical usefulness; (6) validation: internal (same population) and external (other settings); (7) presentation as a formula, score chart or nomogram.</p>
<p>Each choice tuned to the data makes performance look better than it will be in new patients, so the plan should be fixed in advance. Internal validity is a precondition for external validity.</p>`,
      scenario: `<p>The team's modelling plan goes to the research committee, together with a proposal from another group for a postpartum haemorrhage model. You are asked to review both.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'Pre-specify the steps, validate internally before externally, and treat predictors that are unavailable at the moment of prediction as fatal.'
    }
  ],
  sections: [
    {
      id: 's1',
      title: 'Why predict: prognosis and decisions',
      html: `
<p>Nearly every medical action is taken to improve prognosis. A screening programme tries to find disease earlier, a diagnostic test tries to identify a treatable condition, and a therapy tries to change the course of disease. Each is worthwhile only if the benefit to the individual exceeds the side-effects, harms and costs. Deciding this for an individual needs an estimate of that individual's risk.</p>
<h3>Decisions need probabilities</h3>
<p>Doctors have always made probability judgements, often informally. With explicit, evidence-based probabilities, the doctor and patient can weigh risks and benefits together ("shared decision-making"). A <b>clinical prediction model</b> supplies these probabilities. It combines a limited number of patient, disease or treatment characteristics (typically between 2 and 20 predictors) to estimate the probability of a diagnostic or prognostic outcome. Other names include prediction rule, prognostic model, risk score and nomogram.</p>
<h3>Estimation first, testing second</h3>
<p>Two kinds of question can be asked of the same data.</p>
<ul>
<li><b>Estimation:</b> what is the risk of preterm birth for this woman? How accurate is the estimate?</li>
<li><b>Hypothesis testing:</b> is maternal haemoglobin associated with preterm birth? Is the association still present after adjusting for age and parity?</li>
</ul>
<p>The book treats prediction primarily as an estimation problem. This changes how data are analysed. In an aetiological study, adjustment for confounders is the central concern, and causal effect estimates are made in terms of risk difference, risk ratio, odds ratio, etc. In a prediction study the aim is accurate absolute risks for new patients, so a predictor is kept for its contribution to those risks. Many papers announce a new "prognostic factor", but the prognostic value of a new marker has to be shown <b>in addition to</b> already known and easily measured predictors. For example, a new genetic marker needs to improve predictions over age, parity and history before it is called useful.</p>
<div class="callout key"><b>Key idea</b><p>A prediction model is judged by the quality of the risks it gives to patients not used to build it. The same data that show an association do not show that the model predicts well.</p></div>
<h3>Types of prediction model</h3>
<p>Statistical models for prediction fall into regression models, classification methods (for example classification trees) and neural networks. This course concentrates on regression models, the most widely used in medicine, assuming a modest number of candidate predictors (the book considers fewer than about 25) and that subject-matter knowledge from clinicians and earlier studies is available. Settings with thousands of candidate predictors (genomics, proteomics) are outside this scope. Prediction modelling on medical images is also out of scope.</p>
<p class="src">Source: Ch. 1, §1.1-1.2</p>`
    },
    {
      id: 's2',
      title: 'Where prediction models are used',
      html: `
<p>The book groups applications into public health, clinical practice and research. This section covers the first two; research uses are described later, in "Prediction models in research". The examples quoted from the book are labelled; the maternal and child health (MCH) examples are synthetic illustrations.</p>
<h3>Public health: targeting preventive interventions</h3>
<p>Models predict who will develop disease in the future, so that screening, prevention or chemoprophylaxis can be offered to people at relatively high risk. A key requirement is <b>calibration</b>: among 100 people given a 10% predicted risk, about 10 should have the outcome.</p>
<div class="callout book"><b>Book example</b>
<p>The Gail breast-cancer model was built from a case-control sample of 2,852 women who developed breast cancer and 3,146 controls from a cohort of 280,000 women screened over 5 years. Its predictors were age at menarche, age at first live birth, number of previous biopsies and number of first-degree relatives with breast cancer, and absolute risk estimates are used for counselling about preventive tamoxifen. The Framingham cardiovascular risk functions underpin policies such as statin treatment for those at high risk.</p></div>
<div class="callout mch"><b>Illustrative (synthetic)</b>
<p>A district health team wants to offer extra antenatal contacts to women at high risk of preterm birth. A model using booking-visit information (age, haemoglobin, previous preterm birth) would let the team rank women, and the programme can only cover the 20% at highest predicted risk.</p></div>
<h3>Clinical practice: diagnostic work-up</h3>
<p><b>Test ordering.</b> When the probability of disease is very low no further testing is needed; when it is moderate more tests may be useful; when it is high, treat. A model combining history and simple tests can focus the invasive or costly test (the reference standard) on patients with a sufficiently high probability.</p>
<div class="callout book"><b>Book example</b>
<p>A rule built on 477 hypertensive patients who underwent renal angiography uses age, sex, atherosclerotic vascular disease, recent onset of hypertension, smoking, body mass index, an abdominal bruit, serum creatinine and cholesterol to estimate the probability of renal artery stenosis, in order to select who needs the invasive angiography.</p></div>
<p><b>Starting treatment.</b> A treatment threshold (Section 3) turns the probability into an action. With one test still to perform, two thresholds apply: a lower one between "no treatment" and "do more testing", and a higher one between "more testing" and "treat". The book illustrates this with the Wells rule for deep venous thrombosis, in which a pretest probability category decides whether a D-dimer test alone or ultrasound plus D-dimer is required.</p>
<h3>Clinical practice: therapeutic decisions</h3>
<ul>
<li><b>Intensity of treatment:</b> more aggressive treatment only for patients whose risk is high enough that the expected benefit exceeds the harm (Section 3).</li>
<li><b>Delaying treatment:</b> favourable predictions can support watchful waiting, and reassure patients about their chances.</li>
<li><b>Surgical decision-making:</b> short-term surgical risk weighed against long-term risk without surgery, for example age- and valve-specific predictions used for replacement of a risky heart valve.</li>
<li><b>Cost-effectiveness:</b> if the relative benefit of a treatment is constant, the absolute benefit grows with baseline risk, so treating only higher-risk patients is more cost-effective.</li>
</ul>
<div class="callout book"><b>Book example</b>
<p>A model for spontaneous pregnancy within a year among subfertile couples uses the woman's age, duration of subfertility, primary or secondary infertility, sperm motility and referral status. Each predictor gives points that are summed. A couple with a 35-year-old woman (7 points), 2 years of subfertility (3 points), secondary infertility (0), normal motility (0) and second-line referral (0) scores 10, corresponding to a 42% chance of a pregnancy ending in a live birth within a year. Low chances (below about 20%) argue against waiting; favourable chances (above 40%) argue for waiting.</p></div>
<p class="src">Source: Ch. 2, §2.1-2.3</p>`
    },
    {
      id: 's3',
      title: 'From a risk to a decision: treatment thresholds',
      html: `
<p>A predicted risk is not yet a decision. To act we need a <b>threshold</b>: the probability above which treatment (or further testing) is preferred. The book defines the treatment threshold as the probability at which the expected benefit of treating equals the expected benefit of not treating. Below it, no treatment is preferred; above it, treatment.</p>
<h3>Diagnostic threshold</h3>
<p>The threshold depends on how bad a false-positive treatment (treating someone who does not have the disease) is compared with a false-negative decision (withholding treatment from someone who has it). Write <b>harm</b> for the net loss from treating a person without disease and <b>benefit</b> for the net gain from treating a person with disease.</p>
<div class="formula">threshold odds = harm / benefit        threshold probability = harm / (harm + benefit)</div>
<p>If a false-negative decision is 100 times worse than a false-positive, the harm : benefit ratio is 1 : 100 and the threshold is 1 / 101, about 1% (the book's illustration). If the two errors were equally bad, the threshold would be 50%.</p>
<h3>Prognostic threshold: intensity of treatment</h3>
<p>Suppose a treatment lowers the risk of a bad outcome by a constant <b>relative</b> amount (relative risk RR) in every patient, and causes a constant <b>absolute</b> harm H (for example an excess risk of a side-effect, as a probability). For a patient whose risk without treatment is r:</p>
<div class="formula">absolute benefit = (1 − RR) × r        treat if (1 − RR) × r &gt; H, i.e. r &gt; H / (1 − RR)</div>
<p>The benefit grows with the patient's risk while the harm stays constant, so there is a break-even risk. This is why risk prediction matters: the model finds the patients whose r is above the break-even point.</p>
<div class="callout eg"><b>Worked example (Illustrative, synthetic)</b>
<p>A preventive treatment given in pregnancy halves the risk of an adverse outcome (RR = 0.5) but carries an absolute harm of 3%.</p>
<ol>
<li>Break-even risk = 0.03 / (1 − 0.5) = 0.06, or 6%.</li>
<li>A woman at 4% risk: benefit = 0.5 × 0.04 = 2.0%, which is less than 3%, net = −1.0%. Do not treat.</li>
<li>A woman at 10% risk: benefit = 0.5 × 0.10 = 5.0%, net = +2.0%. Treat.</li>
<li>Number treated to prevent one event: 1 / 0.02 = 50 at 4% risk, but 1 / 0.05 = 20 at 10% risk.</li>
</ol>
<p>Treating everyone would help the high-risk women but harm those below 6%. A prediction model whose risks are accurate near 6% tells us who falls on which side.</p></div>
<div class="callout warn"><b>The threshold is a clinical choice</b>
<p>The threshold comes from the consequences of decisions and from patient values, not from statistics. A threshold of 50% (which classifies a patient as "positive" when the model gives more than 50%) assumes both errors are equally bad, which is seldom true. The book returns to this when discussing clinical usefulness (Module 12).</p></div>
<p class="src">Source: Ch. 2, §2.3.3, §2.3.5-2.3.6 (threshold concept and benefit-harm balance); the formulas follow from the definitions given</p>`
    },
    {
      id: 's4',
      title: 'Prediction models in research',
      html: `
<p>Prediction models also serve medical research. The book discusses four uses.</p>
<h3>Inclusion and stratification in a randomised trial</h3>
<p>Inclusion and exclusion criteria are usually applied separately (age below 65 and at least one reactive pupil, say). A prediction model can replace several criteria with one predicted risk, giving a more refined selection. <b>Stratification</b> (randomising within prognostic subgroups) keeps the arms balanced on the main prognostic factors, and a model can summarise many such factors.</p>
<div class="callout book"><b>Book example</b>
<p>In 7,143 patients with moderate or severe traumatic brain injury, 6-month mortality exceeded 50% for those aged 65 or over and for those with non-reacting pupils. A simple age-and-pupils logistic model could keep patients whose predicted mortality was below 50% (age limit 30 years without pupil reaction and 76 years with at least one reacting pupil), which is more efficient than a blanket cut at age 65.</p></div>
<h3>Covariate adjustment in a randomised trial</h3>
<p>Randomisation removes systematic confounding but baseline characteristics still predict outcome, and chance imbalance between arms can occur. Adjusting the treatment comparison for strongly prognostic covariates has advantages. The book contrasts two types of model:</p>
<table class="data">
<tr><th>Model</th><th>Effect estimate</th><th>Standard error</th><th>Power</th></tr>
<tr><td>Linear regression (continuous outcome)</td><td>Identical when the covariates are perfectly balanced</td><td>Decreases</td><td>Increases</td></tr>
<tr><td>Logistic or Cox regression</td><td>Further from zero (OR further from 1)</td><td>Increases</td><td>Increases</td></tr>
</table>
<p>In logistic regression the adjusted effect is not the same as the unadjusted effect even when the groups are balanced. The standard error also increases, but the estimate grows more than the SE, so the power to detect a treatment effect is larger. The gain in power depends on how strongly the covariates predict the outcome. For a continuous outcome the sample size can be multiplied by about 1 − r², where r is the correlation between covariate and outcome. For binary outcomes the book reports sample-size reductions slightly below 1 − R² (Nagelkerke R²).</p>
<table class="data">
<tr><th>Book example</th><th>R² of covariates</th><th>Reduction in sample size</th></tr>
<tr><td>Acute MI, 30-day mortality: age only</td><td>13%</td><td>12%</td></tr>
<tr><td>Acute MI: 17 predictors</td><td>25%</td><td>19%</td></tr>
<tr><td>TBI, 6-month mortality: 3 predictors</td><td>30%</td><td>25%</td></tr>
<tr><td>TBI: 7 predictors</td><td>40%</td><td>30%</td></tr>
</table>
<h3>Observational studies: confounding and propensity scores</h3>
<p>When treatments are compared without randomisation, patients with a certain characteristic may be more likely to receive a certain treatment (indication bias), and if that characteristic also affects outcome the comparison is confounded. Regression can adjust for the observed confounders. When the outcome is rare, a regression with many confounders is unreliable, and the <b>propensity score</b> offers an alternative: a logistic model predicts the probability of receiving the treatment from the confounders (without the outcome), and the score is used for matching, stratification or adjustment. It can only account for observed characteristics.</p>
<h3>Case-mix adjustment and provider profiling</h3>
<p>Hospitals receive different kinds of patients, so raw outcome rates cannot be compared fairly. A prediction model for the expected outcome given patient characteristics (case-mix) allows hospitals to be compared after accounting for patient severity. The book illustrates this with a claims-based model of 30-day mortality after acute MI.</p>
<div class="callout mch"><b>Illustrative (synthetic)</b>
<p>A state wants to compare institutional neonatal mortality across hospitals. A referral hospital receives more very low birth weight babies than a district hospital. A model with birth weight, gestational age and maternal factors gives each hospital an expected mortality from its own case-mix, and observed and expected mortality can be compared.</p></div>
<p class="src">Source: Ch. 2, §2.4</p>`
    },
    {
      id: 's5',
      title: 'Statistical modelling for prediction: uncertainty and sample size',
      html: `
<h3>Model uncertainty</h3>
<p>Standard statistical theory assumes the model was fixed before looking at the data. In practice we examine the data and adapt the model: we drop weak predictors, add nonlinear terms, and combine categories. The 95% confidence intervals, p-values and coefficients that result are then too optimistic, because they ignore that the structure was chosen from the data. The book calls this <b>model uncertainty</b>. The bootstrap (Primer, Section 5) can study it by repeating the whole modelling process in resampled data.</p>
<h3>Sample size: events, not patients</h3>
<p>The <b>effective sample size</b> is the number of events (for a binary outcome, the smaller group). With incidence 0.1%, a study of 10,000 patients has only 10 events, and these 10 determine what can be learned. Four consequences of small samples follow in the book:</p>
<ol>
<li>Model uncertainty can be large and predictions unreliable.</li>
<li>Large samples allow automatic procedures such as stepwise selection with p &lt; 0.05 and reliable checking of model assumptions. In practice samples are small: in a review of 31 prognostic models in traumatic brain injury, 22 were based on fewer than 500 patients.</li>
<li>Small samples force stronger assumptions (for example that a continuous predictor has a linear effect and that predictors do not interact), because there is no power to test them, so prior knowledge becomes more important.</li>
<li>The ambition of the question must match the sample. Asking "which predictors matter most?" is harder than asking "what are the predictions given this set of predictors?".</li>
</ol>
<table class="data">
<tr><th>Predictors known?</th><th>Functional form known?</th><th>Coefficients known?</th><th>Approach</th><th>Sample size needed</th></tr>
<tr><td>No</td><td>No</td><td>No</td><td>Development from scratch</td><td>Very large</td></tr>
<tr><td>Yes</td><td>No</td><td>No</td><td>Specify transformations or interactions</td><td>Large</td></tr>
<tr><td>Yes</td><td>Yes</td><td>No</td><td>Estimate regression coefficients</td><td>Modest</td></tr>
<tr><td>Yes</td><td>Yes</td><td>Yes</td><td>Validation and updating</td><td>Modest</td></tr>
</table>
<p>The more of the model that has to be learned from the data, the more data are needed. Module 2 gives rules of thumb for the number of events required.</p>
<div class="callout book"><b>Book example</b>
<p>The GUSTO-I trial in acute myocardial infarction (40,830 patients, 2,850 deaths within 30 days) is the book's main teaching dataset. With so many deaths overfitting is not a concern, but in small subsets of the data it is, which is why the book uses subsets to teach the concepts.</p></div>
<p class="src">Source: Ch. 1, §1.2.1-1.2.2, Table 1.1, §1.3.4</p>`
    },
    {
      id: 's6',
      title: 'The seven-step roadmap',
      html: `
<p>The core of the course follows a checklist of seven modelling steps, preceded by a general definition of the problem. The same sequence structures the whole course. Each step lists the question it answers and the module in this course that teaches it.</p>
<table class="data">
<tr><th>Step</th><th>Question answered</th><th>Module</th></tr>
<tr><td>0. Preliminaries</td><td>What is the research question, intended application, outcome, set of candidate predictors, study design, statistical model and sample size?</td><td>1, 2, 3</td></tr>
<tr><td>1. Data inspection</td><td>How are predictors defined and distributed? How much is missing, and how should missing values be handled?</td><td>5</td></tr>
<tr><td>2. Coding of predictors</td><td>How should categorical and continuous predictors enter the model? Are extreme values errors?</td><td>6, 7</td></tr>
<tr><td>3. Model specification</td><td>Which predictors to include? Are effects additive and linear?</td><td>8, 9</td></tr>
<tr><td>4. Model estimation</td><td>How are coefficients estimated so as to limit overfitting (shrinkage, penalisation)?</td><td>10</td></tr>
<tr><td>5. Model performance</td><td>How good are the predictions: calibration, discrimination, clinical usefulness?</td><td>11, 12</td></tr>
<tr><td>6. Model validation</td><td>Is the performance reproducible in the same population (internal) and in other settings (external)?</td><td>13, 14</td></tr>
<tr><td>7. Model presentation</td><td>In what form can the model be used in practice (formula, score chart, nomogram, decision rule)?</td><td>15</td></tr>
</table>
<h3>Two kinds of validity</h3>
<ul>
<li><b>Internal validity</b> is reproducibility within the population from which the development sample came. It is threatened by overfitting. Internal validation statistically tests whether specification and estimation problems have distorted the performance (see Module 13, for example the bootstrap).</li>
<li><b>External validity</b> (generalisability or transportability) concerns other settings: a different hospital, a more recent period, a different mix of patients. Performance may be lower there because the settings truly differ. External validity cannot be expected without internal validity (Module 14).</li>
</ul>
<h3>Why order matters</h3>
<p>Choices made early limit what is possible later. A predictor that is poorly measured at step 1 cannot be repaired at step 4. Coefficients cannot be trusted if predictors were selected using the outcome and no step accounted for it. Performance claims in step 5 are only credible if step 6 checks them in new data. Treat the roadmap as a way of keeping the entire process pre-specified, so that each decision can be justified, replayed and, in later modules, repeated inside a bootstrap loop.</p>
<div class="callout key"><b>Key idea</b><p>Overfitting is a central problem at every step. Each decision that is tuned to the data (dropping a predictor, choosing a cut-point, adding a transformation) makes performance in the data look better than it will be in new patients.</p></div>
<p class="src">Source: Ch. 1, §1.3.2-1.3.3; Part II checklist</p>`
    },
    {
      id: 's7',
      title: 'Defining the prediction problem before looking at data',
      html: `
<p>Step 0 deserves time because errors here cannot be corrected by statistics. The book's checklist begins with seven general items: the research question, the intended application, the outcome, the predictors, the study design, the statistical model and the sample size. Each is a question you should be able to answer in one or two sentences before analysing data.</p>
<table class="data">
<tr><th>Item</th><th>Ask yourself</th><th>MCH example (synthetic)</th></tr>
<tr><td>Research question</td><td>Which outcome, in whom, over what time?</td><td>Probability of preterm birth (&lt; 37 weeks) in women booking at an antenatal clinic.</td></tr>
<tr><td>Intended application</td><td>Who will use the prediction, at what moment, to decide what?</td><td>Midwives at booking, to decide who receives extra visits.</td></tr>
<tr><td>Outcome</td><td>How is it defined and measured, and by whom?</td><td>Gestational age at delivery by the best available dating method.</td></tr>
<tr><td>Predictors</td><td>Which are known at the moment of prediction, reliably measured and affordable?</td><td>Age, BMI, haemoglobin, parity, obstetric history, hypertension, tobacco use.</td></tr>
<tr><td>Study design</td><td>Cohort, trial data, registry, cross-sectional?</td><td>Prospective antenatal cohort in district hospital.</td></tr>
<tr><td>Statistical model</td><td>Binary logistic, survival, polytomous?</td><td>Logistic regression for the binary outcome.</td></tr>
<tr><td>Sample size</td><td>How many events and how many candidate predictors?</td><td>Module 2.</td></tr>
</table>
<h3>Look at the course datasets</h3>
<p>The course uses synthetic datasets. <b>ptb_dev</b> is a synthetic cohort of antenatal-clinic women with the outcome preterm birth; it is a prognostic design because the outcome is observed later in pregnancy. <b>sepsis</b> is a synthetic cross-sectional newborn-unit dataset with outcome neonatal sepsis; it is a diagnostic design.</p>
<div data-widget="datasetCard" data-set="ptb_dev"></div>
<ul class="try">
<li>Read the codebook. For each column, decide whether the information would be known at the first antenatal visit.</li>
<li>Note the number of women and the number of preterm births shown in the summary. These counts matter for Module 2.</li>
</ul>
<div data-widget="datasetCard" data-set="sepsis"></div>
<ul class="try">
<li>Compare the sepsis codebook with ptb_dev: which predictors are signs at the bedside and which require a laboratory test?</li>
</ul>
<div class="callout warn"><b>Critical: a model can only use what is known at the time of prediction</b>
<p>If the model is meant for use at booking, any predictor that is only recorded later (number of antenatal visits over the whole pregnancy, mode of delivery) makes the model unusable in practice, however well it predicts in the data.</p></div>
<p class="src">Source: Ch. 1, §1.3.2; Part II checklist</p>`
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
      title: 'Classify the datasets and the predictors',
      level: 'Analyze',
      scenario: `<p>Open the two dataset cards in Case 1 (ptb_dev and sepsis) and read the summaries and codebooks.</p>`,
      questions: [
        '<b>(a)</b> For each dataset state whether it is a prognostic or a diagnostic design and justify your answer.',
        '<b>(b)</b> Suppose a preterm-birth model is meant for use at the first antenatal (booking) visit. Which ptb_dev columns would you not allow as predictors, and why?',
        '<b>(c)</b> From the ptb_dev card, take the number of preterm births and divide by 15, the number of parameters in the full 14-term model (age uses 2 parameters). Comment on what this tells you.',
        '<b>(d)</b> In the sepsis codebook identify one predictor that is cheap and available at the bedside and one that requires a laboratory test. Why does this distinction matter for a prediction model?'
      ],
      answer: `<p><b>(a)</b> ptb_dev is prognostic: women are identified at booking and followed to delivery, where the outcome (delivery before 37 weeks) occurs later. sepsis is diagnostic: newborns are examined at one time and the presence of sepsis (assessed by the reference standard described in the codebook) refers to their current condition.</p>
<p><b>(b)</b> Number of antenatal visits (<b>anc_visits</b>) accumulates over pregnancy, so it is not known at booking; using it would leak information from after the time of prediction. The fetal sex column (<b>female_fetus</b>) is not routinely known at booking either. Variables recorded at or before booking (age, BMI, haemoglobin, parity, history, chronic hypertension, tobacco, SES, height, season of conception) are acceptable; bacteriuria depends on whether the urine culture is part of the booking visit in the intended workflow.</p>
<p><b>(c)</b> The cohort has <span data-live="ptb_dev_events"></span> preterm births. Dividing by 15 gives the events per candidate parameter (EPV), about 15 to 16 at an incidence near 12% in 2,000 women. That is above 10, the minimum rule of thumb taught in Module 2, but well below the 50 events per candidate that reliable data-driven selection needs (Module 8), so selecting predictors from all 15 parameters in this cohort would be unreliable.</p>
<p><b>(d)</b> Temperature, respiratory rate, poor feeding and lethargy are bedside signs; C-reactive protein needs a blood test. A prediction model should use predictors that are readily available and affordable where it will be used, and a costlier test is best judged by its incremental value over the cheaper predictors (a model without it versus with it). This is developed in Module 2.</p>`
    },
    {
      id: 't2',
      title: 'Thresholds for a preventive treatment',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A preventive treatment during pregnancy lowers the risk of an adverse outcome by 30% in relative terms (RR = 0.7) in every risk group. It causes an absolute harm of 2% (an excess risk of a side-effect that is comparable in importance to the outcome). A booking-visit model gives predicted risks of the adverse outcome of 3%, 8% and 15% for three women.</p>`,
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
      title: 'Comparing hospitals fairly',
      level: 'Apply',
      scenario: `<p>Neonatal mortality is 6.0% in a referral hospital and 2.0% in a district hospital. A case-mix model (birth weight, gestational age, maternal factors) gives an expected mortality of 7.0% for the referral hospital's babies and 1.5% for the district hospital's.</p>`,
      questions: [
        '<b>(a)</b> Calculate the observed-to-expected ratio for each hospital and interpret it.',
        '<b>(b)</b> Give two reasons to be cautious before ranking the hospitals on these ratios.'
      ],
      answer: `<p><b>(a)</b> Referral: 6.0 / 7.0 = 0.86, fewer deaths than expected for its case-mix. District: 2.0 / 1.5 = 1.33, more deaths than expected. The raw rates suggested the opposite.</p>
<p><b>(b)</b> The model adjusts only for the characteristics it contains; unmeasured differences in severity remain. The expected rates are only as good as the model's calibration in each hospital. And with few deaths in a small hospital, a ratio of 1.33 can arise by chance (Primer, Case 3).</p>`
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
      title: 'Critique a postpartum haemorrhage prediction proposal',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A group proposes a model to identify, at admission in labour, women at high risk of postpartum haemorrhage (PPH) so that primary health centres can give a prophylactic bundle. They use data from a completed randomised trial of an oxytocin regimen in three tertiary hospitals, which excluded women with multiple pregnancy and antepartum haemorrhage. Candidate predictors: maternal age, parity, haemoglobin, duration of labour, oxytocin augmentation, mode of delivery, birth weight, retained placenta. PPH is defined as visually estimated blood loss of 500 ml or more recorded by the birth attendant. The authors plan to report p-values for each predictor and a c statistic, to classify women as high risk when predicted risk exceeds 50%, and to deploy the model after this analysis.</p>`,
      questions: [
        '<b>(a)</b> Identify the problems in the match between intended use and data, point by point.',
        '<b>(b)</b> Comment on the outcome definition and on the number of events.',
        '<b>(c)</b> Comment on the analysis and reporting plan, including the threshold.',
        '<b>(d)</b> Which of the problems would you treat as fatal?'
      ],
      answer: `<ol>
<li><b>Predictors not known at the time of prediction (Critical).</b> The model is for use at admission, but duration of labour, mode of delivery, birth weight and retained placenta are only known later; oxytocin augmentation depends on events after admission. A model using them cannot be applied at the moment of decision.</li>
<li><b>Population mismatch.</b> Trial data come from tertiary hospitals with stringent exclusions, which limit generalisability; the intended users are primary health centres with a different case-mix. The trial arm (oxytocin regimen) is also a treatment that may alter the outcome; combining arms assumes no subgroup effects, which should be checked or stated.</li>
<li><b>Outcome.</b> A visual estimate of blood loss is an imprecise measurement, and the book asks that the outcome of a prediction model be measured with high accuracy even when the predictors are pragmatic. An outcome with random error weakens every association and calibration cannot be judged. The number of PPH events is not reported; the effective sample size is the number of events, and eight candidate predictors (more parameters if parity and mode of delivery are categorical) may be too many for the number available (Module 2).</li>
<li><b>Analysis plan.</b> Prediction is an estimation problem, so reporting p-values of predictors does not show that the model predicts well; absolute risks, calibration and discrimination are needed, along with a check for overfitting (internal validation).</li>
<li><b>Threshold.</b> A 50% cut-off implies false positives and false negatives are equally bad. For a prophylactic bundle with small harm and a serious outcome, the threshold should be much lower and should come from the harm : benefit trade-off, together with local capacity.</li>
<li><b>Validation before deployment.</b> No internal or external validation is planned. Deployment in a different setting needs external validation.</li>
</ol>
<p><b>(d)</b> Using predictors that are unavailable at admission invalidates the intended application and is fatal; the absence of any validation before deployment is critical as well. The other points weaken the model and can be repaired by redesign.</p>`
    }
  ]
});
