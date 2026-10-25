registerModule({
  id: 'm10',
  num: 10,
  part: 'Development',
  title: 'Estimation: shrinkage, penalisation and external information',
  book: 'Ch. 13-14',
  minutes: 75,
  summary: 'Why slightly biased regression coefficients give better predictions for new patients, and how uniform shrinkage, penalised maximum likelihood, the Lasso and external (literature) information achieve this.',
  objectives: [
    'Explain the bias-variance trade-off and why maximum likelihood coefficients give too extreme predictions in new patients',
    'Calculate a heuristic uniform shrinkage factor and apply it to regression coefficients, with re-estimation of the intercept',
    'Describe penalised maximum likelihood (ridge-type) estimation, effective degrees of freedom and the choice of the penalty by AIC',
    'Distinguish uniform shrinkage, penalised estimation and the Lasso by when and how they shrink',
    'Apply the adaptation method to combine a literature (univariate) coefficient with individual patient data',
    'Judge when shrinkage or external information is most needed, given sample size and number of candidate predictors'
  ],
  sections: [
    {
      id: 's1',
      title: 'Why biased coefficients can predict better',
      html: `
<p>Standard logistic regression estimates its coefficients by <b>maximum likelihood (ML)</b>: it chooses the intercept and coefficients that make the observed outcomes in the development sample most probable. For that sample the ML coefficients are optimal. For <i>future</i> patients they are not, because each coefficient carries sampling error, and the combination of coefficients that fits this sample best has partly fitted its noise.</p>
<p>The consequence is systematic. Patients who receive a very high predicted risk in the development data tend to have been helped there by chance; in new patients their observed risk is lower. Patients with very low predicted risk tend to show higher observed risk in new patients. Predictions are <b>too extreme</b>, and the remedy is to pull them towards the average. This is the same phenomenon as regression to the mean.</p>
<h3>The bias-variance trade-off</h3>
<p>The error of a prediction for a new patient has two parts: bias (systematic deviation of the estimate from the truth) and variance (how much the estimate would change in another sample of the same size). ML coefficients are approximately unbiased but can have large variance in small samples. If we deliberately shrink coefficients towards zero, we add a little bias but remove more variance, so the average squared prediction error for new patients falls. Finding the right amount of shrinkage is the core of modern estimation.</p>
<div class="callout key"><b>Key idea</b><p>A model can be improved for future patients by making its coefficients slightly smaller than the ML estimates. Shrinkage leaves the ranking of patients largely unchanged and mainly repairs calibration: it makes the spread of predictions match what will be seen in new patients.</p></div>
<h3>Three families of methods</h3>
<table class="data">
<thead><tr><th>Method</th><th>Label</th><th>What it does</th></tr></thead>
<tbody>
<tr><td>Uniform shrinkage</td><td>Shrinkage after estimation</td><td>Fit by ML, then multiply all coefficients by one factor s (0 to 1), from a heuristic formula or bootstrapping</td></tr>
<tr><td>Penalised maximum likelihood (PML)</td><td>Shrinkage during estimation</td><td>Maximise the log-likelihood minus a penalty on the size of the coefficients; optimal penalty chosen, for example, by AIC</td></tr>
<tr><td>Lasso</td><td>Shrinkage for selection</td><td>Penalise the sum of absolute coefficients; some coefficients become exactly zero, so the predictor drops out</td></tr>
</tbody></table>
<p>Neural networks face the same problem in a more extreme form. Because they are very flexible, they are usually not trained to maximum fit; training is stopped early, at the number of iterations where predictive ability in held-out data is best ("early stopping").</p>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A preterm-birth model is developed in a district hospital cohort with about 120 events. A woman with a previous preterm birth and bacteriuria receives an apparent risk of 31%. If the coefficients are overfitted, women like her will, on average, have a lower observed risk at the next hospital, and women with no risk factors a slightly higher one. Shrinkage anticipates this.</p></div>
<p class="src">Source: Ch. 13, §13.1-13.2; Table 13.1</p>
`
    },
    {
      id: 's2',
      title: 'Uniform shrinkage: the heuristic formula and the bootstrap',
      html: `
<p>The simplest approach multiplies every estimated coefficient b<sub>i</sub> by the same factor s, giving shrunk coefficients <span class="m">s × b<sub>i</sub></span>. Two ways of finding s are used.</p>
<h3>Heuristic formula (van Houwelingen and le Cessie)</h3>
<div class="formula">s = (model χ² − df) / model χ²</div>
<p><b>Model χ²</b> is the likelihood ratio statistic of the fitted model: the difference in −2 log-likelihood between the intercept-only model and the model with predictors. <b>df</b> is the number of degrees of freedom of the <i>candidate</i> predictors considered (a spline with 3 knots or a quadratic term counts 2 df; a categorical predictor with 4 levels counts 3 df).</p>
<p>The intuition: if none of the predictors had any true effect, the expected model χ² would equal its df. The part of the χ² above df is the "real" signal; s is the share of the total χ² that is signal. More df or a smaller model χ² (smaller sample, weaker predictors) means more shrinkage.</p>
<div class="callout book"><b>Book example</b><p>GUSTO-I sample of 785 patients with 52 deaths at 30 days. An 8-predictor model had model χ² 62.6: s = (62.6 − 8)/62.6 = 0.87. A 17-predictor model had χ² 73.5: s = (73.5 − 17)/73.5 = 0.77. A bootstrap with 200 replications gave the same values (0.87 and 0.77).</p></div>
<h3>Bootstrap shrinkage factor</h3>
<ol>
<li>Draw a bootstrap sample of the same size as the original sample, with replacement.</li>
<li>Repeat the full modelling procedure, including any predictor selection, and estimate the coefficients in the bootstrap sample.</li>
<li>Calculate the linear predictor for each patient in the <i>original</i> sample using the bootstrap coefficients.</li>
<li>Fit a logistic regression of the original outcomes on this linear predictor; its slope is one estimate of s.</li>
</ol>
<p>Repeat steps 1-4 many times (200 replications is common; 500 gives a fully stable estimate) and average the slopes. The factor typically lies between 0 and 1.</p>
<h3>After shrinking: re-estimate the intercept</h3>
<p>Multiplying the coefficients by s changes the average predicted risk. The intercept is therefore re-estimated, with the shrunk linear predictor (without intercept) entered as a fixed offset, so that the average predicted risk again equals the observed incidence in the development data.</p>
<h3>Shrinkage after predictor selection</h3>
<p>Stepwise selection keeps fewer predictors, which might suggest less need for shrinkage. The opposite worry applies: selected coefficients are overestimated ("testimation" bias). The book's advice is to use the number of <b>candidate</b> df in the heuristic formula, not the number of selected predictors, or to repeat the selection inside each bootstrap sample. Empirically, the required shrinkage is roughly similar for prespecified and selected models.</p>
<div class="callout warn"><b>Critical:</b><p>Computing s with the df of the selected predictors only (for example 9 retained out of 15 candidate df) understates the shrinkage needed and leaves the model too extreme. Use all candidate df, or bootstrap the whole selection process.</p></div>
<div class="callout eg"><b>Worked example (synthetic preterm-birth model)</b><p>A 14-term model (age quadratic, so 15 df) has model χ² = 95.<br>s = (95 − 15)/95 = 80/95 = 0.842.<br>Prior preterm birth: b = 1.62 (OR 5.05) becomes 0.842 × 1.62 = 1.36 (OR 3.91).<br>Bacteriuria: b = 0.98 (OR 2.66) becomes 0.83 (OR 2.28).<br>If the same data gave model χ² = 30, s = (30 − 15)/30 = 0.50: half of each coefficient would be removed, a sign that the data are barely adequate for 15 df.</p></div>
<p class="src">Source: Ch. 13, §13.2.1-13.2.2, §13.3.3; Ch. 14, §14.2.3</p>
`
    },
    {
      id: 's3',
      title: 'Penalised maximum likelihood',
      html: `
<p>Uniform shrinkage treats all coefficients alike. <b>Penalised maximum likelihood (PML)</b> shrinks during estimation, and can shrink some coefficients more than others. It generalises ridge regression from linear models. Instead of maximising log L, we maximise</p>
<div class="formula">PML = log L − ½ λ Σ (s<sub>i</sub> b<sub>i</sub>)²</div>
<p>Here λ (lambda) is the penalty factor, b<sub>i</sub> the coefficient of predictor i and s<sub>i</sub> a scaling factor that makes s<sub>i</sub>b<sub>i</sub> unit-free; the standard deviation of the predictor is convenient. Large coefficients cost more, so smaller values are preferred. With λ = 0 the ordinary ML estimates result. The intercept is not penalised.</p>
<h3>Why one penalty gives unequal shrinkage</h3>
<p>The penalty pulls each coefficient towards zero against the pull of the data. A predictor that is strongly and precisely related to the outcome (many informative patients) resists the penalty and is shrunk little; a weak or imprecisely estimated coefficient, for example of a rare predictor, is shrunk more. In the book's GUSTO-I example the reported effective shrinkage per coefficient ranged from 0.81 to 1.49 relative to ML: the coefficient for age over 65 years was reduced most, while those for shock and sex increased slightly.</p>
<h3>Choosing λ: effective degrees of freedom and penalised AIC</h3>
<p>Penalisation reduces how many degrees of freedom the model effectively uses. The <b>effective df</b> is computed as trace[I(b) cov(b)], where I(b) is the information matrix without penalty and cov(b) the covariance matrix with penalty; with no penalty it equals the number of coefficients, and it falls as λ rises. The optimal λ maximises</p>
<div class="formula">AIC<sub>penalised</sub> = model χ²<sub>penalised</sub> − 2 × df<sub>effective</sub></div>
<p>As λ increases the model χ² falls (poorer fit to the sample) but df<sub>effective</sub> falls too; the best balance is found by trial over a grid such as λ = 0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48. Larger λ values are needed for more complex models and larger data sets. Cross-validation or bootstrapping can replace AIC, at greater computing cost.</p>
<div class="callout book"><b>Book example</b><p>GUSTO-I sample (785 patients, 52 deaths). Optimal penalty 8 for the 8-predictor model (effective df 6.9) and 24 for the 17-predictor model (effective df 10.8). Penalised AIC was worse for the 17-predictor model at every penalty: with 52 events it was overfitted. A bootstrap search for the penalty giving a calibration slope of 1 suggested 7 and 12.</p></div>
<h3>Penalising complex terms more</h3>
<p>When many interaction terms are tested, a refinement is to penalise interaction terms more than main effects, for example twice the penalty, and nonlinear and nonlinear-interaction terms twice and four times the main-effect penalty. After stepwise selection, the penalty found optimal for the full model can be applied to the selected model.</p>
<div class="callout key"><b>Key idea</b><p>PML replaces "fit the sample as closely as possible" with "fit the sample well while paying for large coefficients". The price per unit of coefficient size (λ) is tuned so that the model is expected to predict best in new patients.</p></div>
<p class="src">Source: Ch. 13, §13.3; Table 13.2; Figs 13.1-13.2</p>
`
    },
    {
      id: 's4',
      title: 'The Lasso: shrinkage that also selects',
      html: `
<p>The <b>Lasso</b> (least absolute shrinkage and selection operator) estimates coefficients of standardised predictors by maximising the log-likelihood subject to a bound on the sum of absolute coefficients:</p>
<div class="formula">maximise log L subject to Σ |b<sub>i</sub>| ≤ t</div>
<p>A standardised shrinkage factor s = t / Σ|b<sub>0</sub>| (b<sub>0</sub> the ML coefficients) can be varied over a grid between 0 and 1. With a small bound, only the strongest predictors receive non-zero coefficients; as the bound grows, further predictors enter; at a large enough bound the ordinary ML model returns. Because the absolute-value penalty has a corner at zero, some coefficients become exactly zero and those predictors leave the model. The bound t is chosen by generalised cross-validation, AIC or the bootstrap.</p>
<div class="callout book"><b>Book example</b><p>In the GUSTO-I sample, the AIC-optimal Lasso kept 7 of 8 predictors (sex set to zero) and 14 of 17 predictors. Coefficients for the 8-predictor model, ML → uniform shrinkage → PML → Lasso: shock 1.12 / 0.97 / 1.17 / 1.09; age > 65 years 1.49 / 1.30 / 1.21 / 1.36; sex 0.07 / 0.06 / 0.11 / 0.00.</p></div>
<h3>What shrinkage does to the predictions</h3>
<p>All three methods give a less extreme distribution of the linear predictor than standard ML: the linear predictor is pulled towards its average. The highest risks come down and the lowest go up. The ordering of patients changes little with uniform shrinkage (not at all, in fact, since every coefficient is multiplied by the same s) and only somewhat with PML or the Lasso.</p>
<div class="callout eg"><b>Worked example: effect on two women (synthetic)</b><p>ML model: intercept −3.40, prior preterm birth 1.62, bacteriuria 0.98.<br>Woman A (both risk factors): lp = −3.40 + 1.62 + 0.98 = −0.80; risk = 1/(1 + e<sup>0.80</sup>) = 31.0%.<br>Woman B (neither): lp = −3.40; risk = 3.2%.<br>After uniform shrinkage s = 0.842 and re-estimation of the intercept (re-estimated value −3.05, given):<br>Woman A: lp = −3.05 + 0.842 × (1.62 + 0.98) = −0.861; risk = 29.7%.<br>Woman B: lp = −3.05; risk = 4.5%.<br>The high risk falls, the low risk rises, and A is still ranked above B.</p></div>
<div class="callout warn"><b>Pitfall</b><p>The Lasso's selection is data-driven and shares the instability of any selection procedure in small samples. Its choice of predictors, and of the bound, should be validated by repeating the whole procedure in bootstrap samples.</p></div>
<p class="src">Source: Ch. 13, §13.4; Table 13.2; Fig. 13.5</p>
`
    },
    {
      id: 's5',
      title: 'Does shrinkage work? Evidence and practice',
      html: `
<p>The book tested these methods by developing models in many small subsamples of the GUSTO-I trial and evaluating them in an independent test part of 20,318 patients. Two performance measures are used here (defined fully in the next module): the <b>c statistic</b>, the probability that a random patient who died received a higher prediction than a random survivor (discrimination), and the <b>calibration slope</b>, the slope of a logistic regression of the outcome on the model's linear predictor in new data. A slope of 1 is ideal; a slope below 1 means predictions are too extreme.</p>
<div class="callout book"><b>Book example (Table 13.3, 8-predictor model)</b>
<table class="data">
<thead><tr><th>Training data</th><th>Method</th><th>c</th><th>Slope</th></tr></thead>
<tbody>
<tr><td>Total training part (n = 20,512; 1,423 deaths)</td><td>Standard ML</td><td>0.789</td><td>0.944</td></tr>
<tr><td rowspan="4">61 small subsamples (n = 336; about 23 deaths)</td><td>Standard ML</td><td>0.75</td><td>0.66</td></tr>
<tr><td>Uniform shrinkage</td><td>0.75</td><td>1.01</td></tr>
<tr><td>Penalised ML</td><td>0.76</td><td>0.93</td></tr>
<tr><td>Lasso</td><td>0.75</td><td>0.83</td></tr>
<tr><td rowspan="4">23 large subsamples (n = 892; about 62 deaths)</td><td>Standard ML</td><td>0.78</td><td>0.86</td></tr>
<tr><td>Uniform shrinkage</td><td>0.78</td><td>0.97</td></tr>
<tr><td>Penalised ML</td><td>0.78</td><td>0.96</td></tr>
<tr><td>Lasso</td><td>0.78</td><td>1.01</td></tr>
</tbody></table>
<p>For the 17-predictor model in the large subsamples, the ML slope was 0.76, improved to 0.95 (uniform), 0.98 (PML) and 0.93 (Lasso).</p></div>
<p>Two lessons follow. First, shrinkage hardly changes discrimination (c moved by at most 0.01), because it barely alters the ranking of patients. Second, it largely repairs calibration: with 23 deaths per sample, ML predictions were far too extreme (slope 0.66), and shrinkage brought the slope close to 1. The benefit is greatest in small data sets and with many candidate predictors.</p>
<div class="callout key"><b>Key idea</b><p>Shrinkage is a calibration tool. Do not expect it to raise the c statistic; expect it to stop the model from promising more extreme risks than new patients will show.</p></div>
<h3>Explore it</h3>
<p>The lab below fits a fixed 14-term preterm-birth model (15 df) in complete-case subsamples of the synthetic district-hospital cohort and tests it in a large fresh sample from the same setting. In the full data, bootstrap validation suggests a shrinkage factor of about <span data-live="ptb_full_shrinkage"></span>, with <span data-live="ptb_cc_events"></span> events among complete cases.</p>
<div data-widget="shrinkageLab"></div>
<ul class="try">
<li>Set the subsample size to 250 and run 30 replications. Compare the mean calibration slope of standard ML with uniform shrinkage and ridge; note how close the three c statistics are.</li>
<li>Increase the subsample to 1500 and repeat. Observe that the ML slope moves towards 1 and the advantage of shrinkage becomes smaller.</li>
<li>At n = 250, raise the ridge λ slider step by step and watch the coefficients move towards zero; note the λ at which the mean slope is closest to 1.</li>
</ul>
<p class="src">Source: Ch. 13, §13.4.4-13.5; Table 13.3</p>
`
    },
    {
      id: 's6',
      title: 'Using external information: the adaptation method',
      html: `
<p>A small development data set can be supplemented with published evidence. Typically, many studies report the <b>univariate</b> (unadjusted) association of each predictor with the outcome, which can be pooled by meta-analysis, while <b>multivariable</b> coefficients require individual patient data, which we often have from one study only (our own). The adaptation method combines the two.</p>
<h3>Method 1</h3>
<div class="formula">b<sub>m|I+L</sub> = b<sub>u|L</sub> + (b<sub>m|I</sub> − b<sub>u|I</sub>)</div>
<p>b<sub>u|L</sub> is the univariate coefficient from the literature meta-analysis; b<sub>m|I</sub> and b<sub>u|I</sub> are the multivariable and univariate coefficients in the individual patient data. The bracket, the "adaptation factor", is how much adjustment for the other predictors changes the coefficient in our own data. We transfer that change to the precise literature estimate. The idea follows Greenland's proposal for meta-analysis. An approximate variance, ignoring covariances, is</p>
<div class="formula">var(b<sub>m|I+L</sub>) = var(b<sub>u|L</sub>) + var(b<sub>m|I</sub>) − var(b<sub>u|I</sub>)</div>
<h3>Method 2</h3>
<div class="formula">b<sub>m|I+L</sub> = b<sub>m|I</sub> + c × (b<sub>u|L</sub> − b<sub>u|I</sub>),  0 ≤ c ≤ 1</div>
<p>With c = 1 this equals method 1; with c = 0 the literature is ignored. The variance-minimising c depends on the correlation between the univariate and multivariable coefficients in the individual data (estimated by bootstrapping) and on the variances; it approaches 1 when the literature is large and the predictors are not strongly collinear.</p>
<div class="callout eg"><b>Worked example (synthetic, bacteriuria and preterm birth)</b><p>Meta-analysis of published cohorts: b<sub>u|L</sub> = 0.95 (SE 0.08).<br>Own cohort: univariate b<sub>u|I</sub> = 1.20 (SE 0.30); multivariable b<sub>m|I</sub> = 0.98 (SE 0.33).<br>Adaptation factor = 0.98 − 1.20 = −0.22.<br>Adapted coefficient = 0.95 − 0.22 = 0.73 (OR 2.08, against 2.66 from own data alone).<br>Variance = 0.08² + 0.33² − 0.30² = 0.0064 + 0.1089 − 0.0900 = 0.0253; SE = 0.159, about half the SE of 0.33 from own data alone.</p></div>
<div class="callout book"><b>Book example</b><p>Peri-operative mortality after elective abdominal aortic aneurysm surgery: own data 246 patients with 18 deaths; literature 15 series with 15,821 patients and 1,153 deaths. For age per decade: literature 0.79, own univariate 0.98, own multivariable 0.58, adapted 0.38. Scores were made from the adapted coefficients with additional shrinkage ((1 + 0.83)/2 ≈ 0.90), and the intercept was lowered by ln[odds(5%)/odds(7.6%)] = −0.44 to reflect lower current mortality. Apparent c was 0.83; optimism-corrected 0.80-0.81. In GUSTO-I simulations the adapted coefficients were much less variable than standard ML; calibration improved over ML but some shrinkage still had to be added.</p></div>
<div class="callout warn"><b>Pitfall</b><p>The method assumes that our data and the literature come from a common population, with similar correlations between predictors. Publication bias can inflate literature coefficients, and varying definitions of predictors (for example "anaemia" or "hypertension") can make pooling unrealistic.</p></div>
<p>A cruder alternative multiplies all literature univariate coefficients by one overall calibration factor estimated in the own data (a recalibrated "naive Bayes" approach). It ignores the specific correlations between predictors and, in the aneurysm example, gave clearly larger weights to the correlated cardiac comorbidities.</p>
<p class="src">Source: Ch. 14, §14.1-14.3.1; Tables 14.1-14.4</p>
`
    },
    {
      id: 's7',
      title: 'Bayesian estimation and the role of subject knowledge',
      html: `
<p>Bayesian estimation sets a <b>prior distribution</b> for each coefficient, which is combined with the data to give a posterior estimate. Two uses matter for prediction models.</p>
<h3>Priors centred on zero: shrinkage again</h3>
<p>If the prior for a coefficient is centred at zero, positive and negative effects are considered equally likely and large effects unlikely. The posterior estimate is pulled towards zero, much like uniform shrinkage or PML. The amount of shrinkage depends on two things: the width of the prior (narrower means more shrinkage) and the information in the data (many events and a common predictor mean little shrinkage).</p>
<h3>Informative priors</h3>
<p>A prior can also encode existing knowledge, for example "the odds ratio is probably about 2, and values below 0.5 or above 8 are very unlikely". Setting a sensible informative prior is the hardest step. Its source (expert judgement, literature review) should be documented and the prior should be wide enough. Priors can be expressed as "informationally equivalent" data, such as the knowledge of 100 patients with a given outcome, and Bayesian estimation can be done simply by <b>data augmentation</b>: adding records to the data set that represent the prior effects.</p>
<div class="callout book"><b>Book example</b><p>Greenland predicted neonatal death in a cohort of 2,992 births with only 17 deaths, using 14 predictors and priors assuming small to large effects. The Bayesian model predicted better than standard ML. A difficulty: priors must refer to multivariable effects, which are harder to elicit than univariate ones.</p></div>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A team modelling neonatal sepsis in a newborn unit has about 30 events and 11 candidate predictors. Options in increasing reliance on outside knowledge: (1) PML or uniform shrinkage on a prespecified model; (2) adapt their coefficients for maternal fever and prolonged rupture of membranes using a meta-analysis of univariate associations; (3) Bayesian estimation with documented priors. Each option makes the estimates less dependent on the noise in 30 events.</p></div>
<h3>Concluding view</h3>
<p>The common thread of Chapters 13 and 14 is that small data sets cannot carry a prediction model on their own. Subject knowledge enters through prespecification of predictors, through literature-based adaptation of coefficients, or through priors, and shrinkage protects against the remaining overfitting. Bayesian methods have not become mainstream in prediction modelling, and the main criticism remains the choice of prior.</p>
<p class="src">Source: Ch. 14, §14.3-14.4</p>
`
    }
  ],
  keyPoints: [
    'Maximum likelihood coefficients are optimal for the development sample but give too extreme predictions for new patients.',
    'Accepting slight bias in coefficients reduces variance and the prediction error in new patients (bias-variance trade-off).',
    'Heuristic uniform shrinkage: s = (model χ² − df)/model χ², with df of all candidate predictors; re-estimate the intercept afterwards.',
    'Penalised ML shrinks during estimation; one penalty gives unequal shrinkage; λ is chosen by penalised AIC using effective df.',
    'The Lasso penalises the sum of absolute coefficients and sets some exactly to zero, combining shrinkage with selection.',
    'Shrinkage barely changes the c statistic but brings the calibration slope close to 1, especially with few events and many candidates.',
    'The adaptation method transfers the univariate-to-multivariable change in own data onto a precise literature coefficient.',
    'Bayesian priors centred on zero act like shrinkage; informative priors need careful, documented justification.'
  ],
  quiz: [
    {
      q: 'A preterm-birth model with 20 candidate df has a model likelihood ratio χ² of 60. What is the heuristic uniform shrinkage factor?',
      options: ['0.33', '0.50', '0.67', '0.75'],
      answer: 2,
      why: 's = (60 − 20)/60 = 40/60 = 0.67. The commonest error is 20/60 = 0.33, which is the share removed, not the share kept; 0.75 would follow from mistakenly dividing by 80.'
    },
    {
      q: 'Developers keep 6 of 18 candidate predictors after backward selection. How should the heuristic shrinkage factor be computed?',
      options: ['With df = 18, the number of candidate predictor df', 'With df = 6, because only selected predictors are in the final model', 'No shrinkage is needed, because selection already removed the weak predictors', 'With df = 12, the number of predictors removed'],
      answer: 0,
      why: 'Selection makes the retained coefficients too large (testimation bias), so shrinkage must account for all candidates considered. Using df = 6 is the common misconception that fewer predictors means less overfitting; it ignores the search that produced them.'
    },
    {
      q: 'In the GUSTO-I subsample experiments, what was the main effect of uniform shrinkage on performance in independent test data?',
      options: ['It raised the c statistic by about 0.05', 'It moved the calibration slope from well below 1 to about 1, with c almost unchanged', 'It lowered both c and the calibration slope', 'It made the calibration slope exceed 1.3, meaning predictions became too moderate'],
      answer: 1,
      why: 'With about 23 deaths per sample, the ML slope was 0.66 and uniform shrinkage gave 1.01, while c stayed at 0.75. Expecting shrinkage to improve discrimination is the usual misconception: multiplying all coefficients by one factor does not change the ranking of patients.'
    },
    {
      q: 'Why does penalised maximum likelihood with a single penalty λ shrink some coefficients more than others?',
      options: ['Because λ is applied only to binary predictors', 'Because each predictor has its own λ chosen by AIC', 'Because the intercept absorbs most of the penalty', 'Because coefficients that are precisely estimated from informative data resist the penalty more than weak or imprecise ones'],
      answer: 3,
      why: 'The penalty competes with the log-likelihood; where the data carry much information about a coefficient, the likelihood dominates and shrinkage is small. A single λ is used for all (scaled) coefficients, so the "separate λ per predictor" option is wrong; the intercept is not penalised.'
    },
    {
      q: 'Literature univariate log OR for chronic hypertension and preterm birth is 1.00. In your own cohort the univariate log OR is 1.30 and the multivariable log OR is 0.90. What is the adapted coefficient (method 1)?',
      options: ['0.60', '0.90', '1.00', '1.40'],
      answer: 0,
      why: 'Adapted = 1.00 + (0.90 − 1.30) = 0.60. Choosing 1.40 adds the difference with the wrong sign; choosing 0.90 ignores the literature, which defeats the purpose of the method.'
    },
    {
      q: 'Which statement about the Lasso is correct?',
      options: ['It multiplies all coefficients by the same factor after ML estimation', 'It cannot be used for logistic regression', 'It constrains the sum of absolute standardised coefficients, so some coefficients become exactly zero', 'It always selects the same predictors as backward stepwise selection with p &lt; 0.05'],
      answer: 2,
      why: 'The absolute-value bound produces exact zeros, so the Lasso selects while it shrinks. Uniform shrinkage is the method that multiplies all coefficients by one factor; the Lasso applies to generalised linear models including logistic and Cox regression.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Shrinking a gestational diabetes model by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A gestational diabetes (GDM) model is developed in 400 women with 68 cases. Six candidate predictors were considered: age (linear), BMI (restricted cubic spline, 3 knots, so 2 df), family history of diabetes, previous GDM, fasting glucose (linear) and parity group (3 levels, 2 df). All were kept. The model likelihood ratio χ² is 54.0. ML coefficients include previous GDM 1.50 and family history 0.70; the ML intercept is −4.10. After shrinkage, the intercept re-estimated with the shrunk linear predictor as offset is −3.86.</p>`,
      questions: [
        '<b>(a)</b> How many df should enter the heuristic formula? Calculate the shrinkage factor s.',
        '<b>(b)</b> Calculate the shrunk coefficients and odds ratios for previous GDM and family history.',
        '<b>(c)</b> For a woman whose only risk factors are previous GDM and family history (other terms contribute zero to the linear predictor by centring), calculate the predicted risk before and after shrinkage.',
        '<b>(d)</b> A colleague says that, since all six predictors were kept, no shrinkage is necessary. Respond.'
      ],
      answer: `<p><b>(a)</b> df = 1 (age) + 2 (BMI spline) + 1 + 1 + 1 (glucose) + 2 (parity) = 8. s = (54.0 − 8)/54.0 = 46/54 = 0.852.</p>
<p><b>(b)</b> Previous GDM: 0.852 × 1.50 = 1.28 (OR from e<sup>1.50</sup> = 4.48 to e<sup>1.28</sup> = 3.59). Family history: 0.852 × 0.70 = 0.60 (OR from 2.01 to 1.82).</p>
<p><b>(c)</b> Before: lp = −4.10 + 1.50 + 0.70 = −1.90; risk = 1/(1 + e<sup>1.90</sup>) = 13.0%. After: lp = −3.86 + 0.852 × 2.20 = −3.86 + 1.874 = −1.986; risk = 12.1%. For a woman with no risk factors the risk rises from 1/(1 + e<sup>4.10</sup>) = 1.6% to 1/(1 + e<sup>3.86</sup>) = 2.1%. Predictions are pulled towards the average.</p>
<p><b>(d)</b> Overfitting depends on the information in the data relative to the df spent, not on whether predictors were dropped. With 68 events and 8 df (EPV 8.5), the χ² exceeds its df by a margin that implies about 15% of the apparent effects reflect noise. Keeping all predictors avoids selection bias but does not remove estimation error; shrinkage or penalisation is still indicated.</p>`
    },
    {
      id: 't2',
      title: 'Shrinkage Lab: when does shrinkage matter?',
      level: 'Analyze',
      scenario: `<p>Open the Shrinkage Lab in section 5. It fits the same 14-term (15 df) preterm-birth model in subsamples of the synthetic district-hospital cohort and tests each fitted model in a large fresh sample from the same setting. Recall the data-generating truth: four of the terms (antenatal visits, fetal sex, monsoon conception, height) have no true effect.</p>`,
      questions: [
        '<b>(a)</b> Run 30 replications at n = 250 and at n = 1500. Describe the mean calibration slope and c of standard ML, uniform shrinkage and ridge at each size.',
        '<b>(b)</b> Explain why the c statistics differ so little between methods while the slopes differ a lot.',
        '<b>(c)</b> At n = 250, what do you observe about the coefficients of the four noise terms as λ increases? Why is this desirable?',
        '<b>(d)</b> State one reason why the shrunk model may still perform poorly at the tertiary referral hospital (ptb_val).'
      ],
      answer: `<p><b>(a)</b> Expected pattern: at n = 250 (about 30 events, EPV about 2) the ML slope is clearly below 1, indicating too extreme predictions; uniform shrinkage and a well-chosen ridge penalty give mean slopes much closer to 1. At n = 1500 the ML slope is nearer 1 and the three methods converge. The c statistics are similar across methods at each size and higher at the larger size.</p>
<p><b>(b)</b> c depends only on the ranking of patients. Uniform shrinkage multiplies every coefficient by the same factor and leaves the ranking unchanged; ridge alters it only slightly. Calibration depends on the spread of predictions, which shrinkage directly reduces. This mirrors the book's GUSTO-I results (ML slope 0.66 versus 1.01 after uniform shrinkage, c 0.75 for both).</p>
<p><b>(c)</b> The noise coefficients, which are non-zero in each sample only by chance, are pulled towards zero along with the true effects. Their spurious contribution to the spread of predictions shrinks, which reduces false extremes in new women.</p>
<p><b>(d)</b> Shrinkage corrects for overfitting to the development setting only. At the referral hospital true effects are 20% weaker and the incidence and case-mix differ (synthetic design), so calibration-in-the-large and slope can still be off; this is a question of external validity, covered in later modules.</p>`
    },
    {
      id: 't3',
      title: 'Critique: a neonatal sepsis model from one unit',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A newborn unit developed a model for culture-proven early-onset sepsis from 260 neonates with 32 cases. The team screened 22 candidate variables univariately, kept 7 with p &lt; 0.10 and fitted standard ML logistic regression. They computed the heuristic shrinkage factor with df = 7 (model χ² 41), obtaining s = 0.83, and applied it without changing the intercept. They also replaced their own coefficient for maternal fever with the pooled univariate odds ratio from a meta-analysis of term-baby cohorts in high-income countries, describing this as "using external information".</p>`,
      questions: [
        '<b>(a)</b> Identify the errors in the shrinkage step and give the corrected heuristic factor.',
        '<b>(b)</b> What is wrong with how external information was used, and how should the adaptation method be applied?',
        '<b>(c)</b> Name two concerns about the meta-analysis itself as a source.',
        '<b>(d)</b> Suggest a better estimation strategy for this sample size.'
      ],
      answer: `<p><b>(a)</b> (1) The df should be the 22 candidate variables screened, not the 7 kept, because selection inflates the retained coefficients. Corrected s = (41 − 22)/41 = 0.46, indicating severe overfitting. (2) The intercept was not re-estimated after shrinking, so the mean predicted risk will no longer equal the observed incidence (32/260 = 12.3%). (3) Univariate screening at p &lt; 0.10 with 32 events is itself unstable.</p>
<p><b>(b)</b> A univariate literature coefficient was inserted into a multivariable model with no adjustment, so maternal fever would carry its unadjusted effect, double-counting information shared with correlated predictors (for example prolonged rupture of membranes). Method 1: adapted = literature univariate + (own multivariable − own univariate), with variance var(lit) + var(own mv) − var(own uni).</p>
<p><b>(c)</b> The literature population (term babies, high-income settings) may not be a common population with this unit, so predictor correlations may differ; definitions of maternal fever may vary between studies; publication bias may inflate pooled coefficients.</p>
<p><b>(d)</b> Prespecify a small set of predictors from subject knowledge rather than univariate screening; estimate with penalised ML (penalty by AIC) or apply uniform shrinkage with candidate df; consider literature adaptation for well-studied predictors; validate the whole process by bootstrapping and re-estimate the intercept.</p>`
    }
  ]
});
