registerModule({
  id: 'm03',
  num: 3,
  part: 'Development',
  title: 'Statistical models and choosing a model',
  book: 'Ch. 4 and 6',
  minutes: 75,
  summary: "The regression models used for continuous, binary, categorical, ordinal and survival outcomes, how they turn predictors into risks, how they relate to Bayes' rule, trees and neural networks, and why regression is the sensible default for clinical prediction.",
  objectives: [
    'Match each outcome type to its default regression model (linear, logistic, polytomous, proportional odds, Cox).',
    'Calculate a predicted probability from a logistic linear predictor and interpret exp(β) as an odds ratio.',
    "Compute the likelihood ratio statistic and Nagelkerke's R² from log-likelihoods.",
    "Convert sensitivity, specificity and prevalence into likelihood ratios, post-test probabilities and the equivalent logistic model, and explain why naive Bayes gives over-extreme predictions.",
    'Explain the disadvantages of classification trees as special cases of logistic regression.',
    'Evaluate a proposed choice of model using the principles of reasonable form, data efficiency, robustness and transparency.'
  ],
  sections: [
    {
      id: 's1',
      title: 'Models as tools, and the outcome decides the model',
      html: `
<p>A prediction model is a formula that converts a patient's characteristics (the <b>predictors</b>, x) into an expected value of an <b>outcome</b> (y). In prediction we use the model as a practical tool. It need not describe cause and effect: a predictor may simply be a marker of an unmeasured cause. We therefore speak of "predictors" and "outcomes" rather than "exposures" and "effects". The phrase often quoted in this context is that all models are wrong, but some are useful.</p>
<p>The first modelling choice is dictated by the type of outcome. For each outcome type there is a default regression model, and each default has simpler and more flexible relatives.</p>
<table class="data">
<thead><tr><th>Outcome type</th><th>MCH example</th><th>Default model</th><th>What the model predicts</th></tr></thead>
<tbody>
<tr><td>Continuous</td><td>Birthweight (g); length of NICU stay</td><td>Linear regression</td><td>Expected (mean) value</td></tr>
<tr><td>Binary</td><td>Preterm birth &lt;37 weeks (yes/no)</td><td>Logistic regression</td><td>Probability of the event</td></tr>
<tr><td>Unordered categorical</td><td>Cause of fever in a child: malaria, bacterial pneumonia, viral illness</td><td>Polytomous (multinomial) logistic regression</td><td>Probability of each category</td></tr>
<tr><td>Ordered categorical</td><td>Severity grade of an outcome on an ordered scale</td><td>Proportional odds logistic regression</td><td>Probability of each level or worse</td></tr>
<tr><td>Time to event, with censoring</td><td>Time to first pneumonia episode in infancy</td><td>Cox proportional hazards regression</td><td>Survival probability at a chosen time</td></tr>
</tbody></table>
<h3>Linear regression and explained variation</h3>
<p>The linear model is written <span class="m">y = a + Σ b<sub>i</sub> × x<sub>i</sub> + error</span>. The intercept a and coefficients b<sub>i</sub> are estimated by least squares. The <b>residual</b> is observed y minus predicted y (ŷ). The model assumes residuals that are normally distributed with a constant spread that does not depend on x (homoscedasticity). Skewed outcomes such as costs may be log-transformed to meet this assumption; care is then needed when back-transforming predicted means.</p>
<p>The total variability in y splits into an explained and an unexplained part:</p>
<div class="formula">TSS = MSS + RSS, where TSS = Σ(y − mean(y))², MSS = Σ(ŷ − mean(y))², RSS = Σ(y − ŷ)²</div>
<div class="formula">R² = MSS / TSS</div>
<p>R² is the proportion of the variance in y explained by the predictors. A useful way to picture it: when R² is high the predicted values ŷ are widely spread, almost as widely as the observed y; when R² is near zero all predictions cluster near the overall mean. Better prediction models produce a wider spread of predictions. This idea carries over to binary outcomes, where good models give predictions close to 0% and 100%.</p>
<div class="callout book"><b>Book example: RSV hospitalisation costs</b><p>In 3,458 infants and young children admitted with severe respiratory syncytial virus infection, mean costs were 3,110 euros. A linear model (predictors including gestational age, birthweight and age) had an adjusted R² of only 8%: poor for an individual child, yet the predicted mean costs for groups of children with the same characteristics were accurate and were used in decision analyses of prevention.</p></div>
<p>A <b>generalised additive model (GAM)</b> relaxes linearity by replacing each linear term with a smooth function: <span class="m">y = b<sub>0</sub> + Σ f<sub>i</sub>(x<sub>i</sub>) + error</span>, where f<sub>i</sub> may be a loess smoother (a locally weighted regression fitted around each data point). Flexibility has a price, discussed in the module on overfitting.</p>
<p class="src">Source: Ch. 4, §4.1; Ch. 6, §6.1</p>`
    },
    {
      id: 's2',
      title: 'Logistic regression: from predictors to probability',
      html: `
<p>For a binary outcome we model the probability P(y = 1). A straight line cannot be used directly, because it would produce probabilities below 0 or above 1. Logistic regression links a linear combination of predictors to the <b>log-odds</b> (logit) of the outcome:</p>
<div class="formula">logit(P) = log(P / (1 − P)) = a + b<sub>1</sub>x<sub>1</sub> + b<sub>2</sub>x<sub>2</sub> + … = lp</div>
<p>The right-hand side is the <b>linear predictor</b> (lp). To obtain a probability, back-transform:</p>
<div class="formula">P = e<sup>lp</sup> / (1 + e<sup>lp</sup>) = 1 / (1 + e<sup>−lp</sup>)</div>
<p>The quantity e<sup>lp</sup> is the odds. The logistic curve is S-shaped and bounded by 0 and 1. An lp of 0 corresponds to 50%; an lp of −4 to less than 2%; an lp of +4 to more than 98%.</p>
<h3>Interpreting coefficients</h3>
<ul>
<li><span class="m">b<sub>i</sub></span> is the change in log-odds for a one-unit increase in x<sub>i</sub>, holding the other predictors constant.</li>
<li><span class="m">e<sup>b<sub>i</sub></sup></span> is the <b>odds ratio (OR)</b> for that one-unit increase.</li>
<li>With one predictor the coefficient is a univariate (unadjusted) effect; with several it is an adjusted effect, conditional on the other predictors in the model.</li>
<li>The intercept a is the log-odds for a patient with all predictors equal to 0 (or at their reference values). Centring continuous predictors makes the intercept refer to a typical patient.</li>
</ul>
<p>Coefficients are usually estimated by maximum likelihood (next section). Penalised estimation, which deliberately shrinks coefficients, is an alternative for prediction and is covered in a later module.</p>
<div class="callout eg"><b>Worked example (Illustrative, synthetic): risk of preterm birth</b>
<p>Suppose a model for preterm birth has intercept −3.60 (a woman aged 27 with no risk factors, Hb ≥11 g/dL and BMI ≥20), coefficient 1.50 for previous preterm birth and 0.90 for asymptomatic bacteriuria.</p>
<ol>
<li>Baseline: lp = −3.60; P = 1 / (1 + e<sup>3.60</sup>) = 1 / (1 + 36.6) = 0.027, i.e. 2.7%.</li>
<li>OR for previous preterm birth = e<sup>1.50</sup> = 4.48; for bacteriuria = e<sup>0.90</sup> = 2.46.</li>
<li>A woman with both: lp = −3.60 + 1.50 + 0.90 = −1.20; P = 1 / (1 + e<sup>1.20</sup>) = 1 / (1 + 3.32) = 0.232, i.e. 23.2%.</li>
<li>If her Hb is 9 g/dL and the model contains 0.45 × max(0, 11 − Hb), add 0.45 × 2 = 0.90: lp = −0.30 and P = 42.6%.</li>
</ol>
<p>The ORs multiply the odds (baseline odds e<sup>−3.60</sup> = 0.0273; × 4.48 × 2.46 = 0.301 odds = 23.2%). They do not multiply the risk: 2.7% × 4.48 × 2.46 would give 29.3%, which is wrong.</p></div>
<div data-widget="logisticCurve"></div>
<ul class="try">
<li>Set α = −3.6 and β = 0 and confirm that the risk is about 2.7% at every x. Then raise β to 0.5 and read the OR per unit (e<sup>0.5</sup> ≈ 1.65).</li>
<li>Keep β = 0.5 and move α from −3.6 to −1. Observe that the OR per unit does not change, while the absolute risks at x = 0, 5 and 10 change considerably.</li>
<li>Switch on "binary predictor", set α = −3.6 and β = 1.5, and compare the two risks with the 2.7% and 11% you would calculate by hand.</li>
</ul>
<p class="src">Source: Ch. 4, §4.2</p>`
    },
    {
      id: 's3',
      title: 'Likelihood, the LR test and R² for logistic models',
      html: `
<p>The <b>likelihood</b> is the probability of the observed data given the model. For convenience we work with its natural logarithm, the log-likelihood (LL). For a binary outcome each patient contributes the log of the probability that the model gave to what actually happened:</p>
<div class="formula">LL = Σ [ y × log(p) + (1 − y) × log(1 − p) ]</div>
<p>If y = 1 we want p near 1, so log(p) is near 0; if y = 0 we want p near 0, so log(1 − p) is near 0. A perfect model has LL = 0; real models have a negative LL, and a better model has an LL closer to zero. Maximum likelihood estimation chooses the coefficients that make LL as large (least negative) as possible.</p>
<p>The reference is the <b>null model</b>, which gives every patient the average risk ȳ:</p>
<div class="formula">LL<sub>0</sub> = Σ [ y × log(ȳ) + (1 − y) × log(1 − ȳ) ]</div>
<p>The <b>likelihood ratio (LR) statistic</b> compares the fitted model (LL<sub>1</sub>) with the null model, and follows a χ² distribution with degrees of freedom (df) equal to the number of estimated coefficients:</p>
<div class="formula">LR = −2 × (LL<sub>0</sub> − LL<sub>1</sub>)</div>
<p>The same statistic compares any two <b>nested</b> models (one containing a subset of the other's predictors), for example a model with and without a block of obstetric history variables. Because the LR grows with the number of patients, it is not a scale-free measure of performance. Nagelkerke's R² rescales it to run from 0 to 100%:</p>
<div class="formula">R² = (1 − e<sup>−LR/n</sup>) / (1 − e<sup>−(−2 LL<sub>0</sub>)/n</sup>)</div>
<div class="callout eg"><b>Worked example (Illustrative, synthetic)</b>
<p>A neonatal model is fitted to n = 1,000 infants with 120 events. The model LR is 90 on 10 df.</p>
<ol>
<li>LL<sub>0</sub> = 120 × log(0.12) + 880 × log(0.88) = 120 × (−2.1203) + 880 × (−0.1278) = −366.92, so −2 LL<sub>0</sub> = 733.85.</li>
<li>Numerator: 1 − e<sup>−90/1000</sup> = 1 − 0.9139 = 0.0861.</li>
<li>Denominator: 1 − e<sup>−733.85/1000</sup> = 1 − 0.4801 = 0.5199.</li>
<li>R² = 0.0861 / 0.5199 = 0.166, i.e. 16.6%. The LR of 90 on 10 df is highly significant, yet the model explains a modest part of the outcome variation.</li>
</ol></div>
<h3>R² and the spread of predictions</h3>
<p>As for linear regression, a better logistic model has a wider spread of predicted risks. Discrimination is often summarised by the <b>c statistic</b>: the probability that a randomly chosen patient with the outcome has a higher predicted risk than a randomly chosen patient without it (0.5 = no better than chance, 1 = perfect). It equals the area under the ROC curve and is treated in detail in the performance module.</p>
<div class="callout book"><b>Book example: simulated models at 50% incidence</b><p>Six logistic models of decreasing strength gave Nagelkerke R² and c of 87% and 0.98, 42% and 0.83, 16% and 0.70, 9% and 0.64, 4% and 0.60, and 0% and 0.50. A c of 0.70, often called acceptable, corresponds to an R² of only about 16%.</p></div>
<p class="src">Source: Ch. 4, §4.2.1–4.2.2</p>`
    },
    {
      id: 's4',
      title: "Bayes' rule, likelihood ratios and naive Bayes",
      html: `
<p>Diagnosis is often framed with <b>Bayes' rule</b>: a prior probability of disease p(D) is updated with new information x (a sign, symptom or test) to give a posterior probability p(D | x). The information in x is summarised by the <b>diagnostic likelihood ratio</b>:</p>
<div class="formula">LR(x) = p(x | D) / p(x | no D)</div>
<div class="formula">Odds(D | x) = Odds(D) × LR(x), equivalently logit(D | x) = logit(D) + log LR(x)</div>
<p>For a positive/negative test, LR(+) = sensitivity / (1 − specificity) and LR(−) = (1 − sensitivity) / specificity. The logit form looks exactly like a logistic model with one binary predictor: the intercept plays the role of the prior log-odds (in the test-negative group), and the coefficient is the change in log-odds when the test is positive:</p>
<div class="formula">OR = LR(+) / LR(−); coefficient = log OR = log LR(+) − log LR(−)</div>
<div class="callout eg"><b>Worked example (Illustrative, synthetic): CRP for neonatal sepsis</b>
<p>A C-reactive protein cut-off has sensitivity 75% and specificity 85% for culture-proven sepsis; prevalence in the newborn unit is 14%. For 1,000 infants: 140 septic (105 test positive, 35 negative) and 860 not septic (129 positive, 731 negative).</p>
<ol>
<li>LR(+) = 0.75 / 0.15 = 5.0; LR(−) = 0.25 / 0.85 = 0.294.</li>
<li>Prior odds = 0.14 / 0.86 = 0.163. Positive test: 0.163 × 5.0 = 0.814, probability 0.814 / 1.814 = 44.9% (directly: 105/234). Negative test: 0.163 × 0.294 = 0.048, probability 4.6% (35/766).</li>
<li>Logistic model: intercept = log(35/731) = −3.039 (log-odds if negative); coefficient = log(105/129) − log(35/731) = 2.833; OR = e<sup>2.833</sup> = 17.0 = 5.0 / 0.294.</li>
</ol></div>
<div data-widget="bayes2x2"></div>
<ul class="try">
<li>Set sensitivity 80%, specificity 90%, prevalence 10%. Check that LR+ = 8, LR− ≈ 0.22, post-test probabilities ≈ 47% and 2.4%, and OR = 36.</li>
<li>Keep sensitivity and specificity fixed and move prevalence from 10% to 30%. Note which numbers change (post-test probabilities, the logistic intercept) and which stay constant (LRs, the coefficient).</li>
<li>Lower specificity to 60% and observe how LR+ and the coefficient fall.</li>
</ul>
<h3>Naive Bayes</h3>
<p>With several findings, one can apply Bayes' rule sequentially, using the posterior after x<sub>1</sub> as the prior for x<sub>2</sub>, and so on. This is <b>naive Bayes</b> (also nicknamed "idiot's Bayes"). It is equivalent to building a linear predictor from <b>univariate</b> logistic coefficients: <span class="m">lp<sub>u</sub> = b<sub>1,u</sub>x<sub>1</sub> + b<sub>2,u</sub>x<sub>2</sub> + …</span>. It is valid only if the findings are conditionally independent given disease status.</p>
<div class="callout warn"><b>Pitfall: correlated findings make naive Bayes over-confident</b><p>Signs usually correlate positively. In a woman with suspected preeclampsia, severe headache, visual disturbance and very high blood pressure tend to occur together, so the second sign adds less once the first is known. Naive Bayes counts the shared information repeatedly. Predictions become too extreme in both directions: too high for high-risk and too low for low-risk patients. This shows as a <b>calibration slope</b> below 1 when the outcome is regressed on lp<sub>u</sub>. A simple repair is to re-estimate one coefficient for the naive linear predictor: logit(y) = a + b<sub>cal</sub> × lp<sub>u</sub>.</p></div>
<p>A mathematically correct alternative is multivariable logistic regression, where the joint effects are estimated; if tests are uncorrelated the coefficients of log LR-coded tests would be close to 1. Naive Bayes has sometimes discriminated surprisingly well, and is used where robustness matters more than unbiased coefficients.</p>
<p class="src">Source: Ch. 4, §4.2.4–4.2.9</p>`
    },
    {
      id: 's5',
      title: 'More flexible alternatives: neural networks and trees',
      html: `
<h3>Neural networks</h3>
<p>A neural network is best viewed as a non-linear extension of logistic regression. In the common multilayer perceptron, input values (predictors) are multiplied by connection weights and passed to a <b>hidden layer</b> of nodes, whose outputs feed an output node (the predicted risk). Weights are adjusted repeatedly to reduce prediction error; to prevent overtraining, training is usually stopped early. A network <b>without</b> a hidden layer is equivalent to logistic regression. The hidden layer adds flexibility but makes it hard to impose prior knowledge (for example, that risk should rise monotonically with age) and makes the model hard to inspect.</p>
<h3>Classification and regression trees</h3>
<p>Recursive partitioning (CART) repeatedly splits patients into two subgroups at the cut-off of the predictor that best separates outcomes. Splitting continues until groups are small or no improvement remains. A new patient is "run down the tree" to a terminal node, whose observed risk is the prediction. Trees are easy to present and are said to resemble clinical reasoning.</p>
<div class="callout book"><b>Book example: a tree in 429 patients with myocardial infarction</b><p>In a GUSTO-I subsample of 429 patients (24 deaths by 30 days), a tree with age and Killip class was at first very complex, with many age splits and counter-intuitive branches such as zero mortality among some older patients. Cross-validation showed that a much smaller tree was optimal; the pruned tree had four terminal nodes: Killip class 3–4 (60% mortality); Killip 1–2 and age &lt;67.5 (2%); age ≥67.5 with Killip 1 (7%) or Killip 2 (30%).</p></div>
<p>A tree can be written as a logistic model, which exposes its assumptions. The tree above equals lp = a + b<sub>1</sub>[Killip&gt;2] + b<sub>2</sub>[Killip=1 × age&gt;67.5] + b<sub>3</sub>[Killip=2 × age&gt;67.5]: age is ignored entirely in Killip 3–4 and is dichotomised elsewhere. A logistic model would instead use age as a continuous main effect.</p>
<div class="callout warn"><b>Pitfall: why trees usually predict poorly in medical data</b><ul>
<li>All continuous predictors are categorised, which discards information.</li>
<li>Cut-points are chosen by searching over all possible values, which is known to be dangerous for prediction.</li>
<li>Interactions among all predictors are assumed (after the first split, each further split is an interaction), and main effects cannot be modelled.</li>
<li>A predictor enters one branch only when its effect there happens to be large, which produces testimation bias (selection of chance-inflated effects).</li>
<li>Branches quickly run out of patients, so power is limited.</li>
</ul></div>
<h3>Other methods and a summary table</h3>
<p>Multivariate adaptive regression splines (MARS) combine features of GAMs and trees, searching for additive structure and interactions. Support vector machines classify by constructing separating hyperplanes. Linear discriminant analysis is an older technique that assumes multivariate normality, which logistic regression does not require.</p>
<table class="data">
<thead><tr><th>Model</th><th>Interactions</th><th>Linearity</th><th>Selection</th><th>Estimation</th></tr></thead>
<tbody>
<tr><td>Linear logistic regression</td><td>Possible</td><td>Flexible</td><td>Flexible</td><td>Standard ML or penalisation</td></tr>
<tr><td>Naive Bayes</td><td>No</td><td>Often categories</td><td>Flexible</td><td>Univariate effects (+ calibration slope)</td></tr>
<tr><td>GAM</td><td>Possible</td><td>Highly flexible</td><td>Flexible</td><td>Non-parametric, close to penalised ML</td></tr>
<tr><td>Neural network</td><td>Assumed</td><td>Highly flexible</td><td>Flexible</td><td>Back-propagation, early stopping</td></tr>
<tr><td>Tree</td><td>Assumed</td><td>Categorisation</td><td>Assumed</td><td>Various splitting methods</td></tr>
</tbody></table>
<p>In short, GAMs, neural networks and MARS are extensions with logistic regression as a special case; naive Bayes is a simplification that ignores correlation between predictors; trees are special cases that categorise continuous variables and assume higher-order interactions.</p>
<p class="src">Source: Ch. 4, §4.2.10–4.2.16, Table 4.4</p>`
    },
    {
      id: 's6',
      title: 'Categorical, ordinal and survival outcomes',
      html: `
<h3>Unordered categories: polytomous logistic regression</h3>
<p>With j outcome categories, one is chosen as reference and j − 1 logistic submodels are fitted simultaneously, each with its own intercept and coefficients: <span class="m">logodds(y = j vs reference) = a<sub>j</sub> + Σ b<sub>i,j</sub>x<sub>i</sub> = lp<sub>j</sub></span>. With three categories (reference R, others A and B):</p>
<div class="formula">P(A) = e<sup>lp<sub>A</sub></sup> / (1 + e<sup>lp<sub>A</sub></sup> + e<sup>lp<sub>B</sub></sup>); P(B) = e<sup>lp<sub>B</sub></sup> / (1 + e<sup>lp<sub>A</sub></sup> + e<sup>lp<sub>B</sub></sup>); P(R) = 1 − P(A) − P(B)</div>
<div class="callout eg"><b>Worked example (Illustrative, synthetic): febrile child</b><p>Reference = viral illness. For one child lp<sub>malaria</sub> = −0.5 and lp<sub>pneumonia</sub> = 0.2. Then e<sup>−0.5</sup> = 0.607 and e<sup>0.2</sup> = 1.221; the denominator is 1 + 0.607 + 1.221 = 2.828. P(malaria) = 21.5%, P(pneumonia) = 43.2%, P(viral) = 35.4%; the three sum to 100%.</p></div>
<p>An alternative is a sequence of binary models (for example benign versus the rest, then the second category versus the third among the rest). In the book's case study of residual masses after chemotherapy for testicular cancer (1,094 patients: 39% benign, 49% mature teratoma, 12% cancer), both approaches estimated 14 parameters and performed very similarly.</p>
<h3>Ordered categories: proportional odds</h3>
<p>An ordinal outcome can be dichotomised at each cut-point, which gives several logistic models. The <b>proportional odds model</b> assumes one common set of coefficients for all cut-points, with a separate intercept per cut-point. It is parsimonious; the price is the assumption that any cut-point gives the same OR. The assumption can be checked by fitting the separate logistic models and looking for systematic trends in their ORs, graphically, or with a score test.</p>
<div class="callout book"><b>Book example: Glasgow Outcome Scale after head injury</b><p>In 2,159 trial patients, the OR for age per decade was 1.36, 1.47 and 1.45 for the three dichotomies of a four-level outcome scale, and 1.43 in the proportional odds model: a reasonable summary.</p></div>
<h3>Survival outcomes</h3>
<p>When follow-up is incomplete (censored), logistic and linear regression are inappropriate. The <b>Cox proportional hazards model</b> is the default:</p>
<div class="formula">λ(t | X) = λ<sub>0</sub>(t) × e<sup>lp</sup>; predicted survival S(t | X) = S<sub>0</sub>(t)<sup>e<sup>lp</sup></sup></div>
<p>λ<sub>0</sub>(t) is a non-parametric baseline hazard (usually at mean predictor values), and e<sup>b</sup> is a hazard ratio. Effects are assumed constant over follow-up (proportional hazards); this can be checked with interval-specific hazard ratios or an interaction with log(time).</p>
<div class="callout eg"><b>Worked example (Illustrative, synthetic): pneumonia in infancy</b><p>Baseline 2-year pneumonia-free survival S<sub>0</sub>(2) = 0.90 for an average infant. For an infant with centred lp = 0.7, the hazard ratio is e<sup>0.7</sup> = 2.01 and S(2) = 0.90<sup>2.01</sup> = 0.809, a 2-year risk of 19.1% (versus 10% on average).</p></div>
<p><b>Kaplan–Meier</b> analysis is the survival equivalent of a cross-table: it needs grouped predictors and is used for univariate description and for presenting predictions by risk group. <b>Parametric models</b> (exponential, Weibull, log-normal, log-logistic) smooth the baseline hazard; they are parsimonious, give more stable predictions near the end of follow-up and allow extrapolation, at the price of stronger assumptions.</p>
<div class="callout book"><b>Book example: nerve-function impairment after leprosy treatment</b><p>In 2,510 patients followed for 2 years, 166 developed impairment (Kaplan–Meier 7.0%). Two strong predictors (hazard ratios 7.5 and 8.1) defined groups with 0, 1 or 2 unfavourable characteristics and 2-year risks of 1.3%, 16% and 65%.</p></div>
<p class="src">Source: Ch. 4, §4.3–4.6</p>`
    },
    {
      id: 's7',
      title: 'Choosing between alternative models',
      html: `
<p>Because no model is true, the question is which model predicts best for new patients. Testing assumptions (linearity, additivity, proportional hazards) is useful only to the extent that adapting the model improves predictions; a statistically significant violation does not mean the model predicts poorly. In prediction we can measure quality directly, by comparing predictions with observed outcomes (calibration and discrimination).</p>
<h3>Principles for choosing a type of model</h3>
<ol>
<li><b>Reasonable mathematical form.</b> Predictions for binary or survival outcomes must lie between 0% and 100%.</li>
<li><b>Efficient use of data.</b> Regression picks up general patterns better than cross-tabulation, which quickly runs out of numbers. Survival data should be analysed with methods that use all follow-up.</li>
<li><b>Robustness over flexibility.</b> Very flexible approaches need large data sets, whereas medical prediction problems usually have relatively small ones.</li>
<li><b>Transparency.</b> Results should be presentable to the intended users; insight into predictor effects is an advantage.</li>
<li><b>Subject-matter knowledge and practicality</b>, including familiarity of analysts and readers with the method, and above all whether the model answers the research question.</li>
</ol>
<h3>Evidence: modelling the effect of age</h3>
<div class="callout book"><b>Book examples</b><ul>
<li>GUSTO-I (40,830 patients with myocardial infarction): the LR χ² for a linear age effect was 2,099; adding age² raised it to 2,112, a restricted cubic spline with 5 knots (4 df) to 2,122. A linear effect was quite reasonable.</li>
<li>Operative mortality in 1.2 million elderly Medicare patients across 14 procedures: one common age effect, OR 1.75 per decade, fitted well. Procedure-specific age effects (OR 1.44 for endarterectomy to 2.23 for cystectomy) raised the model χ² by 95 (0.6% of the total), R² from 5.62% to 5.66%, and left the c statistic unchanged at 0.683. A square term added 2 to χ².</li>
</ul></div>
<p>Such results can serve as prior knowledge when data are limited: assume a linear effect on the logit scale of roughly the reported size. The book also warns against concluding from a non-significant age effect in a small study that age is unrelated to outcome: absence of evidence is not evidence of absence.</p>
<h3>Evidence: head-to-head comparisons</h3>
<p>The quality of predictions from a method depends on (1) the method itself, (2) its implementation in software and (3) the skill of the user. Many published comparisons favoured a modern method only because the comparator logistic model was built with poor techniques.</p>
<div class="callout book"><b>Book examples</b><ul>
<li>StatLog project: logistic regression performed well across data sets; trees and neural networks had advantages only in larger data sets. In the medical diabetes data (768 patients, 8 predictors) error rates were 0.223 for logistic regression, 0.262 naive Bayes, 0.255 tree and 0.248 neural network.</li>
<li>GUSTO-I, independent test set of 13,610 patients: a logistic model with age and Killip class had c = 0.787; the full logistic model of Lee and colleagues had c around 0.82 and was not beaten. GAM and additive MARS were similar; MARS with all interactions 0.81; the tree was worst at 0.75; neural networks with several overfitting safeguards were no better.</li>
</ul></div>
<div class="callout key"><b>Key idea</b><p>Medical data usually have a low signal-to-noise ratio and modest numbers of events. Non-linear effects and interactions must be quite strong before flexible methods gain anything, and flexible methods spend more degrees of freedom and overfit more easily. Regression analysis (logistic for binary, Cox for survival outcomes) is therefore the appropriate default for clinical prediction models.</p></div>
<p class="src">Source: Ch. 6, §6.1–6.4</p>`
    }
  ],
  keyPoints: [
    'The outcome type sets the default model: linear, logistic, polytomous, proportional odds or Cox regression.',
    'Logistic regression models the log-odds as a linear predictor; P = 1/(1 + e^(−lp)); exp(β) is an odds ratio that multiplies odds, not risks.',
    "The LR statistic = −2(LL0 − LL1) tests a model or a block of predictors; Nagelkerke's R² rescales it to 0–100%.",
    "Bayes' rule in logit form is a one-predictor logistic model: intercept = prior log-odds (test negative), coefficient = log(LR+/LR−).",
    'Naive Bayes ignores correlation between findings and gives over-extreme predictions (calibration slope below 1).',
    'Trees categorise continuous predictors, search for cut-points and assume interactions; they are data hungry and usually predict worse than regression.',
    'Choose a model with a reasonable form, efficient use of data, robustness, transparency and subject knowledge in mind.',
    'Empirical comparisons support regression as the default for clinical prediction because medical data have low signal-to-noise ratios.'
  ],
  quiz: [
    {
      q: 'A logistic model for gestational diabetes has linear predictor lp = 0 for a particular woman. What is her predicted risk?',
      options: ['0%', '1%', '50%', 'It cannot be determined without the intercept'],
      answer: 2,
      why: 'P = 1/(1 + e^0) = 1/2 = 50%. The lp already includes the intercept, so no further information is needed. The commonest error is to read lp = 0 as zero risk, confusing the log-odds scale with the probability scale.'
    },
    {
      q: 'In a preterm-birth model the coefficient for tobacco use is 0.60 and the baseline risk (no risk factors) is 5%. What is the predicted risk for a tobacco user who is otherwise at baseline?',
      options: ['8.7%', '9.1%', '5.6%', '3.0%'],
      answer: 0,
      why: 'Baseline odds = 0.05/0.95 = 0.0526; × e^0.60 (1.822) = 0.0959 odds; risk = 0.0959/1.0959 = 8.7%. Multiplying the risk by the OR (5% × 1.82 = 9.1%) is the common mistake: ORs multiply odds, not risks. 5.6% adds 0.6 percentage points, which confuses the coefficient with a risk difference.'
    },
    {
      q: 'A rapid test has sensitivity 90% and specificity 80%. In a single-predictor logistic model for disease with the test as predictor, what is the odds ratio for a positive test?',
      options: ['4.5', '0.125', '7.2', '36'],
      answer: 3,
      why: 'LR+ = 0.9/0.2 = 4.5 and LR− = 0.1/0.8 = 0.125, so OR = LR+/LR− = 36 and the coefficient is log(36) = 3.58. Choosing 4.5 confuses the positive likelihood ratio with the odds ratio. The OR does not depend on prevalence; the intercept does.'
    },
    {
      q: 'A research team combines the univariate likelihood ratios of five correlated danger signs in sick newborns by multiplying them (naive Bayes). What is the expected problem?',
      options: ['Predictions too close to the average risk (calibration slope above 1)', 'Predictions too extreme, with a calibration slope below 1', 'Discrimination cannot exceed c = 0.5', 'Calibration-in-the-large is necessarily wrong, but the slope is correct'],
      answer: 1,
      why: 'Positively correlated signs carry overlapping information; naive Bayes counts it repeatedly, so high predictions are too high and low ones too low, giving a calibration slope below 1. A recalibration coefficient for the naive linear predictor can correct this. The first option describes the opposite pattern. Naive Bayes can still discriminate well, so option 3 is wrong.'
    },
    {
      q: 'Which statement about classification trees as prediction models is correct?',
      options: ['They estimate main effects first and add interactions only when supported by the data', 'They use continuous predictors fully and so lose no information', 'They assume interactions between predictors and categorise continuous predictors at searched cut-points', 'They are less data hungry than logistic regression because each split uses only one predictor'],
      answer: 2,
      why: 'Every split after the first is an interaction, main effects cannot be modelled, and continuous variables are dichotomised at data-searched cut-points; these steps waste information and inflate selected effects. Option 4 is a frequent misconception: branches run out of patients quickly, so trees are more data hungry.'
    },
    {
      q: 'In 1.2 million surgical patients, allowing a separate age effect for each of 14 procedures increased the model χ² by 95 and R² from 5.62% to 5.66%, with c unchanged at 0.683. What is the most appropriate conclusion?',
      options: ['A single age effect (about OR 1.75 per decade) is adequate for prediction', 'Procedure-specific age effects must be used because the χ² increase is highly significant', 'Age should be dropped because the c statistic did not change', 'The logistic model is invalid and a tree should be used'],
      answer: 0,
      why: 'With 1.2 million patients even trivial deviations are significant. The improvement was 0.6% of the total χ² and changed neither R² meaningfully nor c, so the simpler model predicts as well. Option 2 confuses statistical significance with predictive relevance; adaptation is worthwhile only if it improves predictions.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'From a 2×2 table to a logistic model',
      level: 'Apply',
      scenario: `<p><b>Illustrative (synthetic).</b> At booking, a random plasma glucose cut-off is evaluated against a reference diagnosis of gestational diabetes. In 1,000 women the prevalence is 17%; the cut-off has sensitivity 70% and specificity 90%.</p>`,
      questions: [
        '<b>(a)</b> Complete the 2×2 table (test +/−, GDM yes/no).',
        '<b>(b)</b> Calculate LR(+), LR(−) and the post-test probabilities after a positive and a negative result using prior odds × LR. Check them against the table.',
        '<b>(c)</b> Write the equivalent logistic model: give the intercept, the coefficient for a positive test and the OR.',
        '<b>(d)</b> In a clinic where prevalence is 5%, which of the quantities in (b) and (c) change, and what is the post-test probability after a positive test?'
      ],
      answer: `<p><b>(a)</b> GDM yes: 170 (119 test positive, 51 negative). GDM no: 830 (83 positive, 747 negative). Test positive total 202; test negative 798.</p>
<p><b>(b)</b> LR(+) = 0.70 / 0.10 = 7.0. LR(−) = 0.30 / 0.90 = 0.333. Prior odds = 0.17 / 0.83 = 0.205. Positive: 0.205 × 7.0 = 1.434 odds, probability 1.434 / 2.434 = 58.9% (table: 119/202 = 58.9%). Negative: 0.205 × 0.333 = 0.068 odds, probability 6.4% (51/798 = 6.4%).</p>
<p><b>(c)</b> Intercept = log-odds in test-negative women = log(51/747) = −2.684. Coefficient = log(119/83) − log(51/747) = 0.360 − (−2.684) = 3.045. OR = e<sup>3.045</sup> = 21.0 = LR(+)/LR(−) = 7.0/0.333. Check: lp for a positive test = −2.684 + 3.045 = 0.360, probability 1/(1 + e<sup>−0.360</sup>) = 58.9%.</p>
<p><b>(d)</b> Sensitivity, specificity, both LRs, the coefficient (3.045) and the OR (21) are unchanged. Prior odds become 0.05/0.95 = 0.0526, so the intercept becomes log(0.0526 × 0.333) = −4.043, and the post-test probability after a positive test is 0.0526 × 7 = 0.368 odds = 26.9% (after a negative test 1.7%). The same test is far less convincing in a low-prevalence clinic. In logistic terms, a change in setting shifts the intercept; this foreshadows calibration-in-the-large problems at external validation.</p>`
    },
    {
      id: 't2',
      title: 'Explore intercepts, coefficients and prevalence',
      level: 'Understand',
      scenario: `<p>Use the <b>logisticCurve</b> and <b>bayes2x2</b> widgets in this module.</p>`,
      questions: [
        '<b>(a)</b> In logisticCurve, fix β = 0.3 and compare α = −4 and α = −1. Describe what happens to the OR per unit and to the risks at x = 0, 5 and 10. Why does the same OR give very different absolute risk differences?',
        '<b>(b)</b> Set β = 0 and then β = 1.5. Describe the shape of the curve over x = 0 to 10 in each case and relate it to the statement that an lp of +4 corresponds to a risk above 98%.',
        '<b>(c)</b> In bayes2x2, set sensitivity 75%, specificity 85% and move prevalence from 5% to 40%. Record LR+, LR−, the logistic coefficient and the intercept at 5% and at 40%. Which quantities characterise the test, and which characterise the setting?'
      ],
      answer: `<p><b>(a)</b> The OR per unit stays e<sup>0.3</sup> = 1.35 whatever α is. With α = −4 the risks at x = 0, 5 and 10 are about 1.8%, 7.6% and 26.9%; with α = −1 they are about 26.9%, 62.2% and 88.1%. Moving from x = 0 to x = 5 adds about 6 percentage points in the first case and about 35 in the second, for the same OR. Because the logistic model is additive on the log-odds scale, an OR translates into a large absolute change only where the baseline risk is in the middle range. Predictions, not coefficients, are what patients and clinicians use.</p>
<p><b>(b)</b> With β = 0 the curve is flat at the baseline risk. With β = 1.5 it is a steep S-shape: once lp passes +4 (for example at α = −4, at x ≈ 5.3) the risk exceeds 98% and the curve flattens near 100%. Probabilities are bounded, which is why a model on the logit scale is a "reasonable mathematical form" for a binary outcome while a straight line on the probability scale is not.</p>
<p><b>(c)</b> LR+ = 5.0, LR− ≈ 0.29 and the coefficient log(17) ≈ 2.83 are the same at 5% and 40%: they describe the test. The intercept (prior log-odds in test-negative patients) rises from about log(0.0526 × 0.294) = −4.17 at 5% to about log(0.667 × 0.294) = −1.63 at 40%: it describes the setting. Post-test probabilities change with prevalence for the same reason. A model transported to a setting with a different baseline risk usually needs at least its intercept checked.</p>`
    },
    {
      id: 't3',
      title: 'Critique a proposed modelling plan',
      level: 'Evaluate',
      scenario: `<p><b>Illustrative (synthetic).</b> A team plans a model for early-onset neonatal sepsis in a newborn unit: 450 infants, 55 culture-positive cases, 25 candidate predictors (temperature, respiratory rate, CRP, birthweight, prolonged rupture of membranes, maternal fever and others). Their protocol states:</p>
<ol>
<li>"We will fit a classification tree because it mimics how neonatologists think and handles continuous variables automatically by finding optimal cut-offs."</li>
<li>"As a sensitivity analysis we will train a neural network with two hidden layers, since neural networks represent how the brain works and are more accurate."</li>
<li>"We will also combine the published univariate likelihood ratios of the 25 signs by multiplication (naive Bayes)."</li>
<li>"Logistic regression is not appropriate because the relationship of temperature with sepsis is U-shaped and the logistic model assumes linearity."</li>
<li>"The best method will be the one with the highest c statistic in our 450 infants."</li>
</ol>`,
      questions: [
        '<b>(a)</b> Comment on each statement in turn, using the principles of this module.',
        '<b>(b)</b> Propose a default modelling approach and say how you would compare it with any alternative.'
      ],
      answer: `<p><b>(a)</b></p>
<ol>
<li><b>Tree.</b> Resembling clinical reasoning does not make a tree a good predictor; systematic methods outperform human pattern recognition when a quantitative probability is needed. Searching for "optimal" cut-offs is dangerous for prediction, categorisation loses information, every split assumes an interaction, and with 55 events branches will run out of cases within two or three splits. Expect an unstable tree and poor performance in new infants.</li>
<li><b>Neural network.</b> A network is a non-linear extension of logistic regression, not a model of the brain. Two hidden layers with 25 inputs spend many parameters on 55 events, so overtraining is likely even with early stopping; prior knowledge (for example monotone CRP effects) cannot easily be imposed and the model is opaque. In large comparisons (GUSTO-I, StatLog) networks were no better than a well-built logistic model except in large data sets.</li>
<li><b>Naive Bayes.</b> The signs are correlated (lethargy, poor feeding and abnormal temperature co-occur), so multiplying univariate LRs counts the same information repeatedly. Predictions will be too extreme (calibration slope below 1). If used at all, the naive linear predictor needs a recalibration coefficient. Published LRs from other settings may also not apply here.</li>
<li><b>Linearity.</b> Logistic regression is linear in the coefficients, not necessarily in the predictor: a U-shaped temperature effect can be coded, for example as |temperature − 37| or with a spline or quadratic term. Non-linearity is a coding question, not a reason to abandon regression.</li>
<li><b>Choosing by apparent c.</b> The c in the development data is optimistic, and most optimistic for the most flexible method. Comparing apparent performance rewards overfitting. Performance must be judged on new patients or with internal validation that replays the whole modelling process (covered in later modules).</li>
</ol>
<p><b>(b)</b> Default: a logistic regression model with a limited, prespecified set of predictors chosen on clinical grounds (55 events cannot support 25 candidates), continuous predictors kept continuous with sensible coding, and attention to calibration as well as discrimination. Any alternative should be developed with equal care and compared on validated (not apparent) calibration and discrimination, with transparency for the intended users as an additional criterion.</p>`
    }
  ]
});
