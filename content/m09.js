registerModule({
  id: 'm09',
  num: 9,
  part: 'Development',
  title: 'Additivity and linearity',
  book: 'Ch. 12',
  minutes: 60,
  summary: 'How to examine the two main regression assumptions, additivity (interactions) and linearity (non-linear terms), without letting the search for better fit cause overfitting.',
  objectives: [
    'Explain the additivity assumption and why it depends on the scale (odds versus risk).',
    'Interpret an interaction term and distinguish quantitative from qualitative interactions.',
    'Calculate the number of two-way interactions among k predictors and the number expected to be significant by chance.',
    'Describe how an overall interaction test limits multiple testing, and apply smart coding of interactions.',
    'Compare restricted cubic splines, fractional polynomials and generalised additive models in multivariable models and their degrees of freedom.',
    'Judge whether extra flexibility is worthwhile using validated rather than apparent performance, and list the book\'s measures against overfitting.'
  ],
  sections: [
    {
      id: 's1',
      title: 'Additivity, scale and interaction terms',
      html: `
<p>Every model in this course has a <b>linear predictor</b> at its core:</p>
<div class="formula">lp = β<sub>1</sub> × x<sub>1</sub> + β<sub>2</sub> × x<sub>2</sub> + … + β<sub>i</sub> × x<sub>i</sub></div>
<p>The β's are <b>main effects</b>. Writing the model this way assumes <b>additivity</b>: the contributions of the predictors are added on the scale of the linear predictor. In logistic regression that scale is the log odds, so the odds ratios e<sup>β</sup> of different predictors are <b>multiplied</b> to obtain the odds of the outcome. In Cox regression, hazard ratios are multiplied in the same way. The assumption, then, is that effects are multiplicative on the odds (or hazard) scale.</p>
<h3>The scale matters</h3>
<p>Consider a treatment that reduces risk from 20% to 10% in a high-risk stratum, and from 10% to 5% in a lower-risk stratum. The relative risk is 0.5 in both. The odds ratios are also similar:</p>
<div class="callout eg"><b>Worked example (book numbers)</b>
<p>Odds at 20% = 0.20 / 0.80 = 0.250; odds at 10% = 0.10 / 0.90 = 0.111; odds at 5% = 0.05 / 0.95 = 0.0526. OR for 20% to 10% = 0.111 / 0.250 = 0.44. OR for 10% to 5% = 0.0526 / 0.111 = 0.47. On the odds scale the effect is nearly constant, so no interaction is needed. On the absolute scale the benefit is 10 percentage points in one stratum and 5 in the other, so the absolute benefit clearly depends on baseline risk.</p></div>
<p>Whether two predictors interact therefore depends on the scale on which the model is written. A model that is additive on the log-odds scale is not additive on the risk scale.</p>
<h3>Interaction terms</h3>
<p>An <b>interaction term</b> is the product of two predictors, x<sub>1</sub> × x<sub>2</sub>, added to the model with its own coefficient. This is a two-way (first-order) interaction. A product of three, x<sub>1</sub> × x<sub>2</sub> × x<sub>3</sub>, is a three-way (second-order) interaction; higher-order interactions are rarely considered. The meaning is that <b>the effect of one predictor depends on the value of another</b>. The effect of a predictor that takes part in an interaction cannot be read alone: you need the value of the other predictor.</p>
<ul>
<li>A <b>quantitative</b> interaction means the effect has the same direction in both groups but a different strength. A <b>qualitative</b> interaction means the effect reverses direction. For interpreting effects, qualitative interactions matter more; for predictive performance the distinction is less relevant.</li>
<li><b>Correlation is not interaction.</b> Some researchers look for interactions between correlated predictors. Correlation says nothing about how the predictors' effects on the outcome depend on each other, and two uncorrelated predictors can interact.</li>
</ul>
<div class="callout mch"><b>Illustrative (synthetic): bacteriuria and tobacco in preterm birth</b><p>Suppose the log odds of preterm birth is −2.0 + 0.8 × bacteriuria + 0.6 × tobacco − 0.5 × (bacteriuria × tobacco). The odds ratio for bacteriuria in non-users of tobacco is e<sup>0.8</sup> = 2.23. In tobacco users it is e<sup>0.8 − 0.5</sup> = e<sup>0.3</sup> = 1.35. The effect of bacteriuria depends on tobacco use. The interaction is quantitative, since both ORs exceed 1.</p></div>
<p class="src">Source: Ch. 12, §12.1</p>
`
    },
    {
      id: 's2',
      title: 'Which interactions deserve consideration',
      html: `
<p>As with main effects, prior knowledge should guide which interactions to study. Clinical insight about physiology is of limited help, because a model with main effects only assumes that predictors act multiplicatively on the odds or hazard scale, and it is difficult to reason why two predictors would not act additively on the log-odds scale. Interactions identified in earlier studies could be assessed. The book follows Harrell in listing types of interaction that often warrant consideration:</p>
<table class="data">
<tr><th>Interaction</th><th>Possible meaning</th></tr>
<tr><td>Severity of disease × treatment</td><td>Less benefit with less severe disease</td></tr>
<tr><td>Place × treatment</td><td>Benefit varies by treatment centre</td></tr>
<tr><td>Place × predictors</td><td>Predictor effects vary by centre or region</td></tr>
<tr><td>Calendar time × treatment</td><td>Learning curves for some treatments</td></tr>
<tr><td>Calendar time × predictors</td><td>Increasing or decreasing impact of predictors over the years</td></tr>
<tr><td>Age × predictors</td><td>Older subjects are less affected by risk factors, or more affected by certain disease types</td></tr>
<tr><td>Follow-up time × predictors</td><td>Non-proportional effects in survival, often a decreasing effect over time</td></tr>
<tr><td>Season × predictors</td><td>Seasonal effect of predictors</td></tr>
</table>
<p class="src">Ch. 12, Table 12.1</p>
<h3>Treatment interactions</h3>
<p>The benefit of a treatment may depend on severity: less relative benefit in less severe disease, or the reverse (in oncology, a surgical cure is possible only in patients without distant metastases). Even if the <i>relative</i> benefit is constant, the <i>absolute</i> benefit depends on baseline risk. An analysis of tPA treatment after myocardial infarction in GUSTO-I modelled the absolute benefit as a strong function of the patient's risk profile, assuming a constant relative effect. Treatment effects can also depend on the setting where the patient was treated, as with surgical mortality in oesophageal cancer, and on learning curves, modelled with treatment × calendar time.</p>
<p>In randomised trials, subgroup effects are often reported, for example whether treatment works better in older than younger patients. Such claims should be supported by an <b>interaction test</b> for the difference in effect, not by one p-value in older and another in younger patients. Even pre-specified subgroup analyses need cautious interpretation because of multiple testing, and are best seen as secondary analyses that motivate further study.</p>
<h3>Place and time</h3>
<p>Predictor definitions and effects may differ between centres and over time, which limits generalisability (Module 14). Studies of traumatic brain injury found predictor effects surprisingly consistent even when definitions varied across studies, and in GUSTO-I, where data collection was standardised, predictor × place interactions were small.</p>
<p>"Time" has several forms: calendar time, patient age and follow-up time. In survival analysis it is usual to assume proportional effects over follow-up (the Cox model). This assumption is equivalent to assuming no interaction between the predictors and follow-up time. It may fail, for example in breast cancer, where the effect of stage of disease was absent beyond 10 years.</p>
<div class="callout book"><b>Book example: 25 years of mechanical valve replacement (1,449 valves)</b><p>Early mortality (&lt;30 days) was 5%. Survival at 5, 10 and 15 years was 80%, 63% and 49%. A Poisson regression model was used to disentangle the effects of calendar time, age and follow-up time. There was a substantial drop in early and late mortality around the introduction of cardioplegia, but no strong interaction with calendar time. For several predictors the effects were non-proportional: older age, urgent operation, ascending aorta surgery, operation in an earlier calendar year, male sex and previous cardiac surgery were more important in the early years of follow-up, whereas concomitant bypass surgery and mitral valve surgery had more or less constant effects. Source: Ch. 12, §12.1.4.</p></div>
<p class="src">Source: Ch. 12, §12.1.1 to §12.1.4</p>
`
    },
    {
      id: 's3',
      title: 'Selecting interactions without drowning in multiple tests',
      html: `
<p>Typical prediction models have 5 to 10 predictors, and the number of possible two-way interactions grows with the square of that number. With k predictors there are k × (k − 1) / 2 two-way interactions. If each is tested at the 5% level and no true interactions exist, the expected number of "significant" interactions by chance is 0.05 times that number.</p>
<div class="formula">Number of two-way interactions = k × (k − 1) / 2</div>
<div class="callout eg"><b>Worked example</b>
<table class="data">
<tr><th>Predictors k</th><th>Two-way interactions</th><th>Expected false-positive at p &lt; 0.05</th></tr>
<tr><td>5</td><td>10</td><td>0.5</td></tr>
<tr><td>10</td><td>45</td><td>2.25</td></tr>
<tr><td>20</td><td>190</td><td>9.5</td></tr>
<tr><td>30</td><td>435</td><td>21.75</td></tr>
</table>
<p>Ten binary predictors allow 10 × 9 / 2 = 45 interactions and about 2 significant results are expected even if the truth is perfect additivity.</p></div>
<div data-widget="interactionCount"></div>
<ul class="try">
<li>Move the predictor slider to 14 and note the number of two-way interactions, the expected number of false positives at α = 0.05 and the extra df.</li>
<li>Move it to 5, 10, 20 and 30 and see how fast the numbers grow.</li>
</ul>
<h3>Two ways to limit the multiple-testing problem</h3>
<ol>
<li><b>Overall interaction test.</b> First test all interactions of one predictor (for example all interactions with age) together in one test with several df. If that test is not significant, stop; if it is, examine specific interactions. This limits multiple testing at the price of lower power for any single interaction.</li>
<li><b>A stringent p-value</b> for individual interaction tests, for example 0.01.</li>
</ol>
<div class="callout book"><b>Book example: age interactions in GUSTO-I subsample (n = 785, 52 deaths)</b><p>All interactions with age were fitted and tested together with a Wald test: p = 0.14, not significant. Yet one of them, age × tachycardia (heart rate above 80, HRT), had p = 0.03, not adjusted for the many tests. Someone looking only at individual tests would be tempted to include it. The estimated interaction was positive: the effect of age on mortality was stronger in patients with tachycardia, equivalently tachycardia appeared more harmful at higher ages. Source: Ch. 12, §12.2.1.</p></div>
<div class="callout warn"><b>Critical:</b><p>Searching for interactions in a small dataset and keeping the ones that look significant is a form of data dredging. The interactions that are found can easily be noise that will not reproduce, as the next section shows with real numbers. An overall test, or prior plausibility, should come first.</p></div>
<p class="src">Source: Ch. 12, §12.2 and Q12.1</p>
`
    },
    {
      id: 's4',
      title: 'Estimating interactions sensibly, and whether they improve prediction',
      html: `
<h3>Smart coding</h3>
<p>The standard way to include an interaction is the product term x<sub>1</sub> × x<sub>2</sub>, together with both main effects. The estimated pattern can be counterintuitive. In the age × tachycardia example, the fitted lines (log odds of death against age) cross at about 55 years: tachycardia looks protective below that age, which is implausible. The book suggests incorporating subject-specific knowledge to avoid keeping noise: code the interaction so that no tachycardia effect is allowed below age 55. This cut-point is itself data-driven, but the aim is to avoid a biologically implausible effect. The alternatives are:</p>
<ul>
<li>(a) main effects only (parallel lines);</li>
<li>(b) the simple interaction (lines that cross);</li>
<li>(c) separate age effects for patients aged under 55 (no tachycardia effect) and for those aged 55 and over, with and without tachycardia (three age slopes);</li>
<li>(d) one age effect plus an extra tachycardia × age effect only above 55 (two age slopes).</li>
</ul>
<p>Models (c) and (d) are barely different in fit but (d) uses fewer parameters. A smart coding also makes it easier to obtain standard errors and confidence intervals for predictors in interaction with others.</p>
<h3>Do interactions improve predictions?</h3>
<p>The models were developed in the subsample (n = 785) and tested in an independent part of GUSTO-I (n = 20,318) as shown in Table 1.</p>
<div class="callout book"><b>Book example: c statistic of models with and without an age × tachycardia interaction</b>
<table class="data">
<tr><th>Model</th><th>df</th><th>Apparent (n = 785)</th><th>Validation (n = 20,318)</th></tr>
<tr><td>Main effects only</td><td>8</td><td>0.828</td><td>0.805</td></tr>
<tr><td>Main effects + age × tachycardia</td><td>9</td><td>0.831</td><td>0.796</td></tr>
<tr><td>One age effect below 55, two age effects from 55</td><td>9</td><td>0.832</td><td>0.798</td></tr>
<tr><td>Tachycardia effect only for ages above 55</td><td>8</td><td>0.832</td><td>0.798</td></tr>
</table>
<p>Source: Ch. 12, Table 12.2. All predictors are dichotomised.</p></div>
<p>The apparent c rises with every interaction version, but in the new data the main-effects model is the best. The reason is in the validation data: the interaction between age and tachycardia is statistically significant there (p = 0.002, 1,428 deaths) but in the <b>opposite direction</b>: tachycardia has less effect at older ages. The positive interaction in the subsample was a chance finding. Including interactions in an unstructured way can damage predictive ability.</p>
<div class="callout key"><b>Summary points from the chapter</b>
<ul>
<li>An interaction term means the effect of a predictor depends on the value of another.</li>
<li>Which interactions to consider depends on context, though some types warrant particular consideration (Table above).</li>
<li>For interpretation, use smart coding and remove counterintuitive effects such as a predictor protective for some patients.</li>
<li>Model performance does not necessarily increase with an interaction term.</li>
<li>Pre-specifying some interaction terms may be preferable to exploratory selection.</li>
</ul></div>
<p class="src">Source: Ch. 12, §12.2.2 to §12.2.4</p>
`
    },
    {
      id: 's5',
      title: 'Non-linearity in multivariable models',
      html: `
<p>Module 6 described flexible functions for a single predictor. Here several continuous predictors are in the model together, and each flexible term consumes degrees of freedom. Three approaches are available (Table 1).</p>
<table class="data">
<tr><th>Approach</th><th>Characteristic</th><th>Multivariable strategy</th></tr>
<tr><td>Restricted cubic splines (RCS)</td><td>Cubic splines restricted to be linear in the tails</td><td>Keep the complexity defined a priori, or based on univariable or multivariable findings</td></tr>
<tr><td>Fractional polynomials (FP)</td><td>One or two power terms</td><td>Search iteratively for the best transformation of each predictor</td></tr>
<tr><td>Splines in a generalised additive model (GAM)</td><td>Smoothing controlled by a penalty (effective df)</td><td>Effective df set by the analyst, or by generalised cross-validation (GCV)</td></tr>
</table>
<p class="src">Ch. 12, Table 12.3</p>
<h3>Multivariable RCS</h3>
<p>With 3, 4 or 5 knots an RCS uses 2, 3 or 4 df. Five knots are enough to capture many patterns, but giving every continuous predictor 5 knots may be unwise because the total flexibility will cause overfitting. The strategy is to decide a priori how much flexibility each predictor may use. In small datasets one may use only linear terms or 3-knot splines (2 df), unless prior information suggests that a non-linear effect is needed. Alternatively different RCS complexities can be examined in univariable or multivariable analyses and a number of knots chosen per predictor. It may be reasonable to choose the complexity from each predictor's χ² statistic, with more flexibility for the stronger predictors.</p>
<h3>Multivariable fractional polynomials</h3>
<p>As defined in Module 6, FP1 functions have 1 power (2 df counting the search) and FP2 functions have two (4 df). The <b>mfp</b> procedure is a special backward-stepwise algorithm. It starts from a full model with all continuous predictors linear, and considers the predictors in order of decreasing significance. For each predictor, in turn:</p>
<ol>
<li>Search for the best of 44 candidate transformations (FP1 and FP2) and compare it with omitting the predictor: a 4-df test for "any effect".</li>
<li>If significant, compare the best FP2 with a straight line: a 3-df test for non-linearity.</li>
<li>Compare the best FP2 with the best FP1: a 2-df test for "simplification".</li>
</ol>
<p>The chosen form is retained and the cycle repeated over all predictors until the functions and the variables do not change. The procedure aims to preserve the overall type I error. The price is that it is slightly conservative when the relationship is really linear, since the overall effect is tested with 4 df.</p>
<h3>GAM</h3>
<p>In a GAM, smooth functions based on splines are penalised for lack of smoothness. The penalty reduces the effective df used by each predictor. The optimum smoothness can be chosen by a prediction-error criterion such as GCV, which selects statistically optimal transformations for several predictors at once, but at the cost of more effective df. Because the search for the amount of smoothing is not counted, p-values from GCV-optimised GAMs are only approximate. GAM splines can serve as a reference against which simpler parametric transformations (FP or RCS) are compared.</p>
<div data-widget="codingExplorer"></div>
<ul class="try">
<li>Reduce the random subsample to the smallest value and compare the 5-knot spline with the quadratic and 3-knot codings. Note how the 5-knot curve behaves at the age extremes.</li>
<li>Increase the subsample to the largest value and see whether the extra flexibility now pays off in AIC.</li>
</ul>
<p class="src">Source: Ch. 12, §12.3</p>
`
    },
    {
      id: 's6',
      title: 'Case study: non-linear terms in testicular cancer',
      html: `
<p>The book illustrates the options in a dataset of 544 patients treated with chemotherapy for testicular cancer. The outcome is benign tissue (necrosis) in the residual mass. There are six predictors: three binary (teratoma elements, elevated AFP, elevated HCG) and three continuous (pre-chemotherapy LDH, standardised by dividing by the local upper limit of normal as "LDHst"; the post-chemotherapy mass size; and the reduction in mass size during chemotherapy).</p>
<h3>Univariable shapes</h3>
<p>Earlier work used RCS curves to examine each predictor and then chose simple transformations by eye: logarithm for LDHst, square root for post-chemotherapy size and linear for reduction in size. The fractional polynomial procedure agreed in the main: LDH showed an effect (p = 0.02 for "any effect") but no significant non-linearity (p = 0.48). For post-chemotherapy size there was clear non-linearity (p = 0.0002), with no significant improvement of FP2 over FP1 (p = 0.46), the chosen FP1 being logarithmic rather than square root. For reduction in size a linear term was adequate (non-linearity p = 0.64).</p>
<h3>Multivariable models</h3>
<p>Table 12.5 of the book compares codings of the three continuous predictors; the 3 in "3 + 12" counts the binary predictors.</p>
<div class="callout book"><b>Book example: model χ² of alternative codings (testicular cancer, n = 544)</b>
<table class="data">
<tr><th>Strategy</th><th>df</th><th>Model χ²</th><th>χ² − 2 × df</th></tr>
<tr><td>All linear</td><td>3 + 3 = 6</td><td>205</td><td>193</td></tr>
<tr><td>FP2 for each, no selection</td><td>3 + 12 = 15</td><td>222</td><td>192</td></tr>
<tr><td>FP2 with selection at p &lt; 0.20 (1/reduction, log post-size, LDHst)</td><td>3 + 3 selected forms (search df not counted)</td><td>213</td><td>not computed</td></tr>
<tr><td>RCS, 4 knots for each</td><td>3 + 9 = 12</td><td>231</td><td>207</td></tr>
<tr><td>Visual approximation (log LDHst, linear reduction, square root post-size)</td><td>3 + 3 chosen forms (search df not counted)</td><td>212</td><td>not computed</td></tr>
<tr><td>GAM, 3 df each (pre-specified)</td><td>3 + 9 = 12</td><td>232</td><td>208</td></tr>
<tr><td>GAM, GCV-optimised</td><td>3 + (2.8 + 4.6 + 3.9) = 14.3</td><td>240</td><td>211.4</td></tr>
</table>
<p>Source: Ch. 12, Table 12.5. The last column is computed here to apply the χ² − 2 × df rule of Module 6 (apparent performance only).</p></div>
<ul>
<li>With linear terms only (6 df) the model χ² is 205, and Nagelkerke R² is 41.9% apparent and 40.3% internally validated.</li>
<li>The full FP2 model (15 df) reaches 222: a gain of 17 for 9 extra df, borderline significant (p = 0.049).</li>
<li>RCS with 4 knots each (12 df) reaches 231, a gain of 26 over linear for 6 extra df, which is statistically significant (p &lt; 0.001).</li>
<li>The visual approximation reached 212, and FP1 transformations 213: nearly as good with far fewer df.</li>
<li>GAM with pre-specified 3 df per predictor (232) is much the same as RCS (231). GCV-optimised GAM reaches the highest χ² (240) by spending more effective df.</li>
</ul>
<p>The more complex GAM shapes were doubtful. For post-chemotherapy size the multivariable function implied an implausible increase in log odds of necrosis with very large masses, and for reduction in size the curve was wiggly between 20% and 100%. The smooth functions may not be smooth enough from a pathophysiological point of view, and external validation could show whether the "optimal" transformations are merely overfitted.</p>
<p>All these χ² values are apparent performance. A rigorous internal validation that repeats every modelling step is needed to see whether any real gain remains after correction for optimism. If that is impossible, a fully independent validation set (split-sample or external) may be needed.</p>
<p class="src">Source: Ch. 12, §12.4</p>
`
    },
    {
      id: 's7',
      title: 'Concluding advice: a "wrong but useful" model',
      html: `
<p>Additivity and linearity can be seen as essential assumptions, and one might argue for assessing them thoroughly. When the aim is to estimate the effect of one predictor, this makes sense. When the aim is prediction, thorough assessment increases the risk of overfitting: we are tempted to extend the model with interaction and non-linear terms whenever the data suggest them, and may end up with a model that performs worse in future patients than a parsimonious model. The alternative is to accept a "wrong but useful" model that gives well-calibrated, discriminating predictions even if it violates some underlying assumptions.</p>
<p>In the book's examples, performance did not increase impressively with more flexible terms. Strong qualitative interactions or U-shaped non-linearity may be rare, so the increase in predictive performance from interactions and non-linear terms is often modest in medical examples.</p>
<h3>Recommendations</h3>
<table class="data">
<tr><th>Approach</th><th>Description</th></tr>
<tr><td>Limit the number of interaction and non-linear terms</td><td>Consider only interactions that are a priori plausible (Table 12.1 in the book), and non-linear terms only for predictors with a presumed strong and likely non-linear effect</td></tr>
<tr><td>Use overall testing</td><td>One overall test per interacting predictor (for example all age interactions) before looking at individual terms</td></tr>
<tr><td>Compare flexible with simple models</td><td>Compare the <i>validated</i> performance, for example by bootstrap, of the flexible model (interactions, non-linearities, or a neural network or GAM) with a simple additive linear model</td></tr>
<tr><td>Extra shrinkage</td><td>Apply stronger shrinkage (factor below 1) or more penalty in penalised ML to interaction and non-linear terms, to compensate for testimation bias</td></tr>
</table>
<p class="src">Ch. 12, Table 12.6</p>
<p>The reasoning behind the first measure is that interactions should be considered mainly in studies with relatively many events compared with the number of terms. In smaller datasets one may rely on the additivity assumption and say that the model estimates average (marginal) effects over subgroups, knowing that a relevant high-order interaction can never be excluded. Interaction terms also complicate model presentation, so they should be left out unless relevant to the specific prediction problem.</p>
<p>The search for interactions and non-linearities makes the effective df of the flexible model larger than the df in the final fitted model. FP procedures recognise this by testing FP1 with 2 df and FP2 with 4 df. GCV-optimised GAMs do not count it in their p-values.</p>
<h3>How other methods treat interactions</h3>
<ul>
<li>Naive Bayes estimation uses univariable effects and assumes additivity; interactions are not studied.</li>
<li>Tree models assume high-order interactions by default, and neural networks, with their flexibility, can fit specific patterns in a dataset. A tree can therefore be used to <i>explore</i> interactions; those that stand out can then be assessed for significance in a regression model.</li>
</ul>
<div class="callout key"><b>Key idea</b><p>A model with a higher apparent χ² is not automatically a better prediction model. Prefer extra terms only when they are plausible a priori and show an improvement in <i>validated</i> performance.</p></div>
<p class="src">Source: Ch. 12, §12.5</p>
`
    }
  ],
  keyPoints: [
    'Regression models are additive on the log-odds (or log-hazard) scale: effects are multiplicative on the odds scale, and the verdict on interaction depends on the scale.',
    'An interaction means the effect of one predictor depends on another; correlation between predictors is not interaction.',
    'With k predictors there are k(k − 1)/2 two-way interactions: 45 for 10 predictors, of which about 2 are significant at 5% by chance.',
    'Use an overall interaction test (or p &lt; 0.01) and a priori plausibility; subgroup claims in trials need an interaction test.',
    'In GUSTO-I the age × tachycardia interaction (p = 0.03 in n = 785, overall p = 0.14) improved apparent c but lowered validated c (0.805 to 0.796) and reversed direction in the validation data.',
    'For non-linearity, allocate flexibility a priori by predictor strength (RCS 3 to 5 knots = 2 to 4 df), or use mfp with 4-, 3- and 2-df tests, or a penalised GAM.',
    'Compare flexible and simple models on validated, not apparent, performance; the highest apparent χ² (240 for GCV-GAM) is not the best choice automatically.',
    'Limit terms, use overall tests and shrink interaction and non-linear terms more; aim for a "wrong but useful" model.'
  ],
  quiz: [
    {
      q: 'Treatment reduces risk from 20% to 10% in a high-risk stratum and from 10% to 5% in a low-risk stratum. Which statement is correct?',
      options: [
        'There is a strong interaction because the absolute reduction differs between strata.',
        'The odds ratios (0.44 and 0.47) are similar, so no interaction is needed on the odds scale, though the absolute benefit differs (10 vs 5 percentage points).',
        'The relative risk is 0.5 in one stratum and 0.25 in the other.',
        'Additivity can be judged without choosing a scale.'
      ],
      answer: 1,
      why: 'Odds ratios are 0.111/0.250 = 0.44 and 0.0526/0.111 = 0.47, nearly constant, while the relative risk is 0.5 in both. The absolute benefit depends on baseline risk even when the relative effect is constant. Whether an interaction exists depends on the scale on which additivity is assumed, so the first and fourth options are wrong.'
    },
    {
      q: 'A logistic model has log odds = −2.0 + 0.8 × B + 0.6 × T − 0.5 × (B × T), where B is bacteriuria and T is tobacco use (both 0/1). What is the odds ratio for bacteriuria among tobacco users?',
      options: [
        '2.23',
        '1.82',
        '0.61',
        '1.35'
      ],
      answer: 3,
      why: 'Among users (T = 1) the log odds change by 0.8 − 0.5 = 0.3 when B goes from 0 to 1, so OR = e^0.3 = 1.35. The value 2.23 (e^0.8) is the OR among non-users. The value 0.61 is e^−0.5, the ratio of the two ORs, not the OR itself.'
    },
    {
      q: 'A model has 10 binary candidate predictors. If every two-way interaction is tested at p below 0.05 and none truly exists, how many significant interactions are expected by chance?',
      options: [
        'About 0.5 (out of 10 tests)',
        'About 5 (out of 100 tests)',
        'About 2 (2.25 out of 45 tests)',
        'None, since the main effects are in the model'
      ],
      answer: 2,
      why: 'There are 10 × 9 / 2 = 45 two-way interactions and 5% of 45 is 2.25. Ten is the number of main effects, not of pairs, and 100 would count each pair twice and include squares. Having main effects in the model does not protect against false-positive interaction tests.'
    },
    {
      q: 'In the GUSTO-I subsample (n = 785), adding an age × tachycardia interaction raised the apparent c from 0.828 to 0.831. In the independent validation data (n = 20,318) c fell from 0.805 to 0.796. What is the best explanation?',
      options: [
        'The validation data were too large to be informative.',
        'The model with the interaction used too few df.',
        'Tachycardia is not related to mortality.',
        'The interaction was a chance finding in the small subsample; in the validation data it was significant in the opposite direction.'
      ],
      answer: 3,
      why: 'In the validation data the age × tachycardia interaction had p = 0.002 but was negative, whereas in the subsample it was positive. An interaction fitted to noise adds optimism and harms performance in new patients. The other options are not supported: a large validation set is the most informative, and the interaction model used one more df, not fewer.'
    },
    {
      q: 'In a multivariable model with several continuous predictors, which strategy does the book recommend for non-linear terms?',
      options: [
        'Give every continuous predictor 5 knots to make sure no non-linearity is missed.',
        'Decide a priori how much flexibility each predictor may use, for example more for predictors with larger χ², with 3 knots (2 df) in smaller datasets.',
        'Always choose the transformation with the highest apparent model χ².',
        'Use only dichotomised predictors to avoid assumptions.'
      ],
      answer: 1,
      why: 'Too much flexibility for each predictor leads to overfitting, so the complexity is set a priori, often from predictor strength. The highest apparent χ² rewards overfitting (the GCV-optimised GAM in the testicular cancer example reached 240 with more effective df). Dichotomising discards information (Module 6).'
    },
    {
      q: 'Three codings of continuous predictors were compared in a development sample: all linear (8 df, χ² = 120), 4-knot splines (14 df, χ² = 131) and a GCV-optimised GAM (19 effective df, χ² = 140). Which conclusion is justified?',
      options: [
        'After subtracting 2 × df the three are nearly equal (104, 103 and 102), so validated performance should decide whether extra flexibility is worthwhile.',
        'The GAM is best because its χ² is highest.',
        'The spline model is best because it is intermediate in complexity.',
        'The linear model must be rejected because the spline model is significantly better.'
      ],
      answer: 0,
      why: 'The χ² − 2 × df values are 120 − 16 = 104, 131 − 28 = 103 and 140 − 38 = 102, so the extra flexibility does not pay for itself in this comparison. The spline gain of 11 on 6 df has p = 0.088, not significant at 5%. The highest apparent χ² simply reflects the most effective df.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Interaction arithmetic: ORs, risks and chance findings',
      level: 'Apply',
      scenario: `<p><b>Illustrative (synthetic).</b> A model for preterm birth includes bacteriuria (B, 0/1) and tobacco use (T, 0/1). The log odds is −2.0 + 0.8 × B + 0.6 × T − 0.5 × B × T. For comparison, the additive model without the interaction term has the same intercept and main effects. Risk = 1 / (1 + e<sup>−lp</sup>). The team also considers 9 binary predictors in all and proposes to test every pairwise interaction.</p>`,
      questions: [
        '<b>(a)</b> Compute the predicted risk for the four combinations of B and T from the model with the interaction.',
        '<b>(b)</b> Give the odds ratio for bacteriuria among non-users and among users of tobacco, and the OR comparing both exposures with neither.',
        '<b>(c)</b> Compute the risk for B = 1 and T = 1 from the additive model. Compare the risk differences for bacteriuria in non-users and in users under the interaction model.',
        '<b>(d)</b> How many two-way interactions can be tested among 9 predictors, and how many are expected to be significant at 5% by chance? What strategy would limit the problem?'
      ],
      answer: `<p><b>(a)</b> lp for B = 0, T = 0: −2.0, risk = 1 / (1 + e<sup>2.0</sup>) = 0.119. B = 1, T = 0: −2.0 + 0.8 = −1.2, risk 0.232. B = 0, T = 1: −2.0 + 0.6 = −1.4, risk 0.198. B = 1, T = 1: −2.0 + 0.8 + 0.6 − 0.5 = −1.1, risk 0.250.</p>
<p><b>(b)</b> Among non-users: OR = e<sup>0.8</sup> = 2.23. Among users: OR = e<sup>0.8 − 0.5</sup> = e<sup>0.3</sup> = 1.35. Both exposures versus neither: e<sup>0.8 + 0.6 − 0.5</sup> = e<sup>0.9</sup> = 2.46. The ratio of the two ORs for bacteriuria is e<sup>−0.5</sup> = 0.61, which is the interaction on the odds-ratio scale (a quantitative interaction, since both ORs exceed 1).</p>
<p><b>(c)</b> Additive model, B = 1 and T = 1: lp = −2.0 + 0.8 + 0.6 = −0.6, risk = 0.354, versus 0.250 with the interaction. Under the interaction model the risk difference for bacteriuria is 0.232 − 0.119 = 0.112 in non-users and 0.250 − 0.198 = 0.052 in users. Note that even in the additive model the risk difference would not be the same in both strata (0.112 vs 0.157), because additivity on the log-odds scale is not additivity on the risk scale.</p>
<p><b>(d)</b> 9 × 8 / 2 = 36 interactions; 0.05 × 36 = 1.8 are expected to be significant by chance. To limit this: consider only a priori plausible interactions; use an overall test (all interactions of a given predictor together) before looking at individual terms; or use a stringent p-value such as 0.01 (expected 0.36 false positives for 36 tests). Any interaction retained should be compared by validated performance with the simple model and shrunk more than the main effects.</p>`
    },
    {
      id: 't2',
      title: 'Interaction count and flexibility in the preterm-birth data',
      level: 'Analyze',
      scenario: `<p>Use the interaction counter and the coding explorer. The synthetic dataset <b>ptb_dev</b> (<span data-live="ptb_dev_events"></span> events in <span data-live="ptb_dev_n"></span> women) has 14 candidate terms.</p>`,
      questions: [
        '<b>(a)</b> In the interaction counter set k to 14. Report the number of two-way interactions, the expected false positives at α = 0.05, and the extra df if all were added. Compare the extra df with the number of events.',
        '<b>(b)</b> In the coding explorer, compare quadratic, 3-knot and 5-knot spline codings of maternal age at the full sample and at the smallest subsample. Record AIC.',
        '<b>(c)</b> The true relation between age and the log odds in this dataset is a parabola. What do you expect the AIC ranking to be, and why does the 5-knot spline look worse at small n?',
        '<b>(d)</b> What does this suggest about using the most flexible coding for every predictor?'
      ],
      answer: `<p><b>(a)</b> For k = 14: 14 × 13 / 2 = 91 two-way interactions, with 0.05 × 91 = 4.55 expected false positives. Each product term costs at least 1 df, so adding all would add at least 91 df to the 15 df of the main-effects model (the age terms use 2 df each, so the true cost is higher). With roughly 240 events (an incidence of about 12%), the EPV would fall to about 240 / 106 = 2, far below 10. The true model has no interaction terms at all, so every interaction found would be noise.</p>
<p><b>(b) and (c)</b> The quadratic (2 df) matches the data-generating form, so it should have the best or near-best AIC at both sample sizes, because it fits the shape with the fewest parameters. The 3-knot spline (2 df) gives a similar curve and similar AIC. The 5-knot spline (4 df) is able to follow the parabola but spends 2 extra df for no gain, so its AIC is slightly worse in the full sample; at the smallest subsample the extra parameters fit random fluctuations, producing a wiggly curve especially in the tails where there are few women, and the AIC penalty and the instability are more visible.</p>
<p><b>(d)</b> Flexibility has a cost in df and in stability. Following the chapter, allocate flexibility a priori, give the strongest predictors the most, use 3 knots (2 df) in smaller datasets, and judge the benefit by validated performance, not apparent fit.</p>`
    },
    {
      id: 't3',
      title: 'Evaluate a flexible-model claim in a preterm-birth study',
      level: 'Evaluate',
      scenario: `<p><b>Illustrative (synthetic).</b> Researchers develop a model for preterm birth in 900 women (110 events) with 3 continuous predictors (age, BMI, Hb) and 5 binary predictors. They report apparent model χ² values: all predictors linear (8 df): 120; RCS with 4 knots for each continuous predictor (14 df): 131; GAM with GCV-optimised smoothing (19 effective df): 140. They write: "Because the GAM had the highest likelihood-ratio statistic, it was selected as the final model." In addition they tested all 28 pairwise interactions among the 8 predictors, found 3 with p &lt; 0.05, and added them to the model. They report that "the interaction terms were highly significant (all p &lt; 0.05) in the final model." No internal validation was performed.</p>`,
      questions: [
        '<b>(a)</b> Calculate χ² − 2 × df for the three models and the test of spline versus linear, using a chi-square of 11 on 6 df (p = 0.088) and of the GAM versus linear, χ² of 20 on 11 df (p = 0.045).',
        '<b>(b)</b> How many significant interactions would you expect by chance among 28 tests at 5%?',
        '<b>(c)</b> List the problems and recommended remedies, point by point.'
      ],
      answer: `<p><b>(a)</b> Linear: 120 − 2 × 8 = 104. Spline: 131 − 2 × 14 = 103. GAM: 140 − 2 × 19 = 102. The three are nearly identical once df are accounted for, and the highest value is for the simplest model. The spline-versus-linear test (χ² = 131 − 120 = 11 on 14 − 8 = 6 df, p = 0.088) is not significant at 5%. The GAM-versus-linear test (20 on 11 df) has p = 0.045, borderline, and the p-value is only approximate because the search for the smoothing parameter is ignored.</p>
<p><b>(b)</b> 28 × 0.05 = 1.4 expected false-positive interactions. Finding 3 is therefore not much more than expected by chance, and the pattern is consistent with chance alone.</p>
<p><b>(c) Point-by-point.</b></p>
<ol>
<li><b>Selecting the model with the highest apparent χ².</b> The GAM wins because it spends the most effective df, which rewards overfitting. The chapter advises comparing the <i>validated</i> performance of flexible and simple models (bootstrap), and shows an example in which GCV-GAM reached the highest χ² (240) while its shapes were implausible. Remedy: bootstrap-validated c, calibration slope and χ² − 2 × df.</li>
<li><b>No gain from non-linearity.</b> After the df penalty the flexible models are no better than the linear model, so the evidence favours the simpler model (a "wrong but useful" model).</li>
<li><b>Interactions chosen from 28 individual tests.</b> Three of 28 is about the number expected by chance (1.4). No overall test, no a priori plausibility and no correction for multiple testing were used. Remedy: overall interaction test per predictor, a stricter p-value such as 0.01, and restriction to plausible interactions (Table 12.1).</li>
<li><b>Interaction "highly significant" in the final model.</b> P-values for terms chosen because they looked significant are exaggerated (testimation bias). In the book's GUSTO-I example a p = 0.03 interaction in a small subsample reversed its direction in the validation data (p = 0.002, negative) and lowered validated c. Remedy: shrink such terms more or omit them.</li>
<li><b>No internal validation.</b> With 110 events, an EPV of 10 supports about 11 df, whereas the final model has 19 effective df plus 3 interactions = 22 df (EPV 5), so substantial overfitting is expected. Remedy: bootstrap the whole modelling process, including the search for interactions and the GCV smoothing, and report optimism-corrected performance.</li>
</ol>
<div class="callout warn"><b>Critical:</b><p>The final model combines the most flexible functions with data-dredged interactions, uses an EPV of about 5, and has not been validated. Its apparent performance is not a reliable estimate of what will be seen in new women.</p></div>`
    }
  ]
});
