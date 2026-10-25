registerModule({
  id: 'm06',
  num: 6,
  part: 'Development',
  title: 'Coding of predictors',
  book: 'Ch. 9',
  minutes: 65,
  summary: 'How categorical and continuous predictors should be coded before modelling: dummy variables, why dichotomising continuous predictors loses information, flexible non-linear functions, outliers and truncation, and how to express effects on an interpretable scale.',
  objectives: [
    'Code unordered and ordered categorical predictors with dummy variables and explain why the choice of reference category does not change predictions.',
    'Explain why dichotomising or heavily categorising a continuous predictor harms prediction, using the step-function argument and model chi-square comparisons.',
    'Define polynomial, fractional polynomial, restricted cubic spline and smoothing-spline (GAM) codings and state how many degrees of freedom each uses.',
    'Compare alternative codings of one predictor using likelihood-ratio chi-square minus twice the degrees of freedom.',
    'Detect outliers with the 3 × IQR rule, decide between correcting, setting to missing and truncating, and apply a truncation rule.',
    'Rescale a coefficient so that an odds ratio is expressed per decade, per standard deviation or per interquartile range.'
  ],
  sections: [
    {
      id: 's1',
      title: 'Coding is a modelling decision that comes before looking at the outcome',
      html: `
<p>Raw study data are rarely in the form a regression model needs. A haemoglobin value may be recorded to one decimal place, gestational age in weeks plus days, parity as a count, and a category such as place of delivery as free text. <b>Coding</b> is the work of turning these variables into the numeric columns that enter the model. Coding comes after data inspection (including a look at missing values) and before the choice of which predictors stay in the model. It is the second of the seven modelling steps in this course.</p>
<p>Two vocabulary points are needed throughout this module.</p>
<ul>
<li><b>Degrees of freedom (df)</b> of a coding: the number of regression coefficients the coding uses for that predictor. A binary variable uses 1 df. A straight-line term for age uses 1 df. A coding that lets age bend uses more.</li>
<li><b>Model chi-square (likelihood-ratio chi-square)</b>: twice the gain in log-likelihood when a predictor (or a set of terms) is added to a model, equivalently the drop in −2 log-likelihood. A larger value means the coding explains more of the outcome. A term that has no real association with the outcome adds on average about 1 to the chi-square per df by chance alone, so a fair comparison between codings needs to account for df. Section 4 gives the rule.</li>
</ul>
<div class="callout key"><b>Key idea</b><p>Every coding choice that is made while looking at the predictor-outcome relationship in the development data uses up some of the information in the data and makes the model look better in that sample than it will be in new patients. Choices made while still blind to the outcome relationship, or taken from earlier studies, do not have this cost.</p></div>
<p>The chapter's closing advice reflects the same logic: some decisions can be taken while still blinded to the relationship of the predictor with the outcome in the sample, which limits overfitting, and another general strategy is to use the codings that were used in other studies of the same problem.</p>
<p class="src">Source: Ch. 9, background and §9.6</p>
`
    },
    {
      id: 's2',
      title: 'Categorical predictors: dummy variables, reference categories and ordered categories',
      html: `
<h3>Unordered categories</h3>
<p>A categorical predictor with k levels is entered with k − 1 <b>dummy variables</b> (0/1 indicators), each comparing one level with a chosen <b>reference category</b>. In the GUSTO-I trial of myocardial infarction, smoking was recorded as never (1), past (2), current (3). Two dummies are created: past versus never and current versus never. Each coefficient is a log odds ratio against the reference level.</p>
<p>The reference category matters for interpretation but not for prediction. Statistical programs usually take the lowest or highest code as reference. If that category is small, the comparisons against it are imprecise and may look non-significant even though the variable has a real overall effect. Choosing a larger category as reference gives more stable individual coefficients. The predicted risks from the model are identical whichever reference is chosen.</p>
<h3>Combining categories</h3>
<p>Small categories can be merged. A cancer study with many sub-stages (T1a, T1b, T1c, T2a, and so on) might collapse them into T1 to T4, or pool rare levels into an "other" group. The warning is that merging guided by the outcome, for example joining the levels that happen to have similar risk in the sample, produces an optimistic model. Merging should be based on frequency tables or on similarity of meaning, while blind to the outcome, or on codings used in previous studies. If small categories are kept separate, shrinkage or penalised estimation (Module 10) is needed to obtain reliable coefficients.</p>
<h3>Ordered categories</h3>
<p>Ordered predictors are often reduced to two groups. Table 1 shows what that costs in GUSTO-I (n = 40,830). The model chi-square is the gain from adding the predictor to a model without it.</p>
<div class="callout book"><b>Book example: GUSTO-I, effect of coding categorical predictors on model chi-square</b>
<table class="data">
<tr><th>Predictor</th><th>Coding</th><th>df</th><th>Model χ²</th></tr>
<tr><td>Location of infarct</td><td>Anterior vs other</td><td>1</td><td>343</td></tr>
<tr><td></td><td>Anterior / inferior / other</td><td>2</td><td>361</td></tr>
<tr><td>Killip class (I to IV, left ventricular function)</td><td>Shock (class 3/4 vs 1/2)</td><td>1</td><td>861</td></tr>
<tr><td></td><td>Linear (scores 1 to 4)</td><td>1</td><td>1,388</td></tr>
<tr><td></td><td>Linear + square</td><td>2</td><td>1,388</td></tr>
<tr><td></td><td>Factor (three dummies)</td><td>3</td><td>1,389</td></tr>
<tr><td>Smoking</td><td>Never / past / current (two dummies)</td><td>2</td><td>483</td></tr>
<tr><td></td><td>Linear (1 to 3)</td><td>1</td><td>482</td></tr>
</table>
<p>Source: Ch. 9, Table 9.1. The infarct location data show that the third category, only 3% of patients, still adds information in a very large trial; in a small study the inferior and other groups might be pooled.</p></div>
<p>Three lessons follow from the table. First, collapsing the four Killip classes to shock versus no shock throws away most of the information (861 versus 1,388). Second, simply treating the ordered classes as a straight line recovers essentially all of what the full factor coding captures (1,388 versus 1,389) with 1 df instead of 3. Third, even for a weakly ordered variable such as smoking, the linear coding performed as well as the factor coding (482 versus 483) and used one parameter fewer. Linear coding of an ordinal predictor is therefore a reasonable starting point, after which a squared term can be added as a check on non-linearity. More advanced estimation methods that force the effect to be monotone (always rising or always falling) exist but are more flexible than a linear coding.</p>
<div class="callout mch"><b>Illustrative (synthetic): place of antenatal booking</b><p>A district cohort records place of first antenatal visit as sub-centre (62%), primary health centre (30%), private clinic (7%) and tertiary hospital (1%). Using the 1% tertiary group as the reference category would give a coefficient with a very wide interval for every comparison. Taking sub-centre as the reference gives stable comparisons, and the 1% group can be merged with private clinic on the grounds of similar service level, a decision made without looking at preterm-birth rates.</p></div>
<p class="src">Source: Ch. 9, §9.1 and Table 9.1</p>
`
    },
    {
      id: 's3',
      title: 'Continuous predictors: why dichotomising is a bad idea',
      html: `
<p>Splitting a continuous predictor into "high" and "low" is very common, mainly because it simplifies presentation. For prediction it has several concrete disadvantages.</p>
<h3>The step is unnatural</h3>
<p>A model with age dichotomised at 65 years assumes that a woman or man who turned 65 yesterday has a clearly higher risk than one who turns 65 tomorrow, and that all people below 65 share one risk and all above share another. A patient aged 40 is assumed to have the same risk as one aged 64, and a patient aged 90 the same as one aged 66. In the GUSTO-I analysis (Fig. 9.1 of the book) the dichotomised fit is two flat levels, and it agrees with the straight-line fit at only two points on the age axis, which are the only places where the dichotomy approximates the continuous model well.</p>
<p>The result also depends on who is in the sample. If the data contained no patients older than 70, the same step function would take a quite different shape, whereas the continuous model, which conditions on every age value, would stay much the same. A cut-point model is therefore less portable between populations.</p>
<h3>Information is lost</h3>
<div class="callout book"><b>Book example: GUSTO-I, age and ST elevation</b>
<table class="data">
<tr><th>Predictor</th><th>Coding</th><th>df</th><th>Model χ²</th></tr>
<tr><td>Age</td><td>≤65 vs &gt;65 years</td><td>1</td><td>1,463</td></tr>
<tr><td></td><td>≤60, 61 to 70, ≥71</td><td>2</td><td>1,775</td></tr>
<tr><td></td><td>Linear</td><td>1</td><td>2,099</td></tr>
<tr><td></td><td>Linear + square</td><td>2</td><td>2,112</td></tr>
<tr><td></td><td>Restricted cubic spline, 5 knots</td><td>4</td><td>2,122</td></tr>
<tr><td>ST elevation (number of leads, 0 to 11)</td><td>&gt;4 vs ≤4</td><td>1</td><td>259</td></tr>
<tr><td></td><td>Linear</td><td>1</td><td>281</td></tr>
<tr><td></td><td>Linear + square</td><td>2</td><td>306</td></tr>
<tr><td></td><td>Linear + square + cubic</td><td>3</td><td>339</td></tr>
<tr><td></td><td>Restricted cubic spline, 5 knots</td><td>4</td><td>350</td></tr>
<tr><td></td><td>Factor (one level per count)</td><td>11</td><td>367</td></tr>
</table>
<p>Source: Ch. 9, Table 9.2.</p></div>
<p>For age, the single cut at 65 captures 1,463 out of 2,099 (70%) of what a straight line captures; three categories recover 1,775, which the book reports as 85% of the information in age as a linear variable. Adding a square term or a spline adds little for age (2,112 and 2,122), so for this predictor the straight line is already a good description.</p>
<h3>Non-monotone relationships are lost completely</h3>
<p>ST elevation shows a more complex pattern. Thirty-day mortality in GUSTO-I was 7.1% with 0 elevated leads, fell to 4.7% with 3 leads, and then rose steadily to about 12% with 7 to 9 leads. The relationship is U-shaped. A split at more than 4 leads performs worst of all the codings (259), because risks within the "low" group fall and then rise, and risk within the "high" group climbs steeply, yet each group is assigned one constant risk.</p>
<div class="callout book"><b>Book example: GUSTO-I, mortality by number of leads with ST elevation</b>
<table class="data">
<tr><th>Leads</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr>
<tr><td>30-day mortality (%)</td><td>7.1</td><td>6.9</td><td>5.1</td><td>4.7</td><td>6.5</td><td>7.4</td><td>9.3</td><td>12</td><td>12</td><td>12</td></tr>
</table>
<p>Source: Ch. 9, Table 9.3 (counts of patients per category range from 333 to 12,744 for 0 to 9 leads; the 10 and 11-lead groups are tiny).</p></div>
<div class="callout warn"><b>Critical:</b><p>If the cut-point is chosen by looking for the split that best separates the outcome in the development data, the resulting model is biased in a specific direction: the apparent effect is exaggerated and will not reproduce in new patients. The book lists the search for an "optimal" cut-point among the data-driven choices that cause optimism (Chapter 5). Categories (for example quartiles) are acceptable as an exploratory step to look at a predictor-outcome relationship, or to illustrate an effect to readers, but should not be used in the final prediction model.</p></div>
<p>Even an intermediate approach, such as four or five categories, remains a step function. Jumps in predictions at the category borders are unnatural, and the borders themselves depend on the choice of cut-points and on the distribution of the predictor in the sample. Smooth relationships are biologically far more plausible.</p>
<p class="src">Source: Ch. 9, §9.2</p>
`
    },
    {
      id: 's4',
      title: 'Flexible functions for continuous predictors',
      html: `
<p>When a straight line is too restrictive, a continuous predictor X can be entered through a set of terms that together allow a curve. Each option below is a way of spending df to purchase flexibility.</p>
<h3>Polynomials and simple transformations</h3>
<p>The most common extension adds a square term (X and X²) or a cubic term (X, X², X³). The extension can be tested within nested models. Other transformations may be used instead of the linear term or in addition to it: inverse (1/X), square root (X<sup>0.5</sup>), logarithm and exponential. A transformation such as the logarithm is often a robust summary of a laboratory measurement, for example a hormone concentration. A polynomial of low order can only take a limited set of shapes, and its tails can behave erratically.</p>
<h3>Fractional polynomials</h3>
<p>A <b>fractional polynomial</b> (FP) builds a function from powers X<sup>p</sup> where p is chosen from the set {−2, −1, −0.5, 0, 0.5, 1, 2, 3}, with X<sup>0</sup> defined as log X. That gives 8 "FP1" functions of a single power (1 df for the coefficient, plus one more degree of freedom for searching the power). An "FP2" function combines two powers, X<sup>p1</sup> + X<sup>p2</sup>; if the two powers are equal it takes the form X<sup>p</sup> + X<sup>p</sup> log X. That gives 28 + 8 = 36 FP2 functions, using 4 df in all. For medical problems an FP2 is usually flexible enough. Limitations noted in the book: values in the tails of the predictor distribution can distort the fitted shape, FP functions are not invariant to a change of origin of the variable, and negative values cannot be handled without a shift. The width of confidence intervals is too narrow if the search for the powers is ignored.</p>
<h3>Restricted cubic splines</h3>
<p>A <b>spline</b> joins separate low-order polynomials end to end at points called <b>knots</b>. A cubic spline uses cubic pieces. A <b>restricted cubic spline</b> (RCS) adds the constraint that the curve is a straight line beyond the outer knots, which stabilises behaviour at the extremes of the predictor distribution where data are sparse. The number of parameters is the number of knots minus 1:</p>
<table class="data">
<tr><th>Knots</th><th>df</th><th>When to consider</th></tr>
<tr><td>3</td><td>2</td><td>Small datasets, or when there is no strong prior reason to expect non-linearity</td></tr>
<tr><td>4</td><td>3</td><td>Intermediate</td></tr>
<tr><td>5</td><td>4</td><td>Large datasets, especially if non-linearity is expected; sufficient to capture many non-linear patterns</td></tr>
</table>
<p>The exact knot positions are usually not critical, and are typically specified from the distribution of the predictor (that is, at chosen percentiles of the observed values). A model with an RCS using 2 df contains a wider family of functions than the same-df model with a square term, which is restricted to a parabola.</p>
<h3>Smoothing splines in generalised additive models</h3>
<p>A <b>generalised additive model</b> (GAM) fits a smooth function to each continuous predictor and controls wiggliness with a penalty in the likelihood. The penalty reduces the effective df actually spent. Without a penalty such splines overfit, and the extreme flexibility sometimes gives wiggly shapes that will not reproduce in new data. Penalisation is discussed in Module 10.</p>
<h3>Comparing codings fairly</h3>
<p>RCS functions with different numbers of knots are not nested, so it is not strictly correct to test down from a complex RCS to a simpler one in a stepwise way. Instead, the codings can be compared through the increase in likelihood-ratio chi-square after taking the extra df into account:</p>
<div class="formula">Adjusted fit = model χ² − 2 × df   (Akaike's Information Criterion, in chi-square form)</div>
<div class="callout eg"><b>Worked example (Book example data: ST elevation, Table 9.2)</b>
<table class="data">
<tr><th>Coding</th><th>Model χ²</th><th>df</th><th>χ² − 2 × df</th></tr>
<tr><td>&gt;4 vs ≤4</td><td>259</td><td>1</td><td>257</td></tr>
<tr><td>Linear</td><td>281</td><td>1</td><td>279</td></tr>
<tr><td>Linear + square</td><td>306</td><td>2</td><td>302</td></tr>
<tr><td>Linear + square + cubic</td><td>339</td><td>3</td><td>333</td></tr>
<tr><td>RCS, 5 knots</td><td>350</td><td>4</td><td>342</td></tr>
</table>
<p>The RCS has the highest adjusted fit among these five. The dichotomy has the lowest, 85 points below the RCS.</p></div>
<div data-widget="codingExplorer"></div>
<ul class="try">
<li>Choose "dichotomised" and move the cut slider. Observe that the fitted line is a step with two flat levels and that the LR χ² and AIC change with the cut. Notice how much the apparent fit depends on where you put the cut.</li>
<li>Choose "linear", then "quadratic". Compare the fitted curve with the observed risk in age groups and compare AIC.</li>
<li>Choose restricted cubic splines with 3, 4 and 5 knots and note how the df and AIC change. Reduce the random subsample size with the slider and watch the 5-knot curve become more erratic.</li>
</ul>
<p class="src">Source: Ch. 9, §9.3 and Table 9.4</p>
`
    },
    {
      id: 's5',
      title: 'Choosing how much flexibility to allow',
      html: `
<p>The book summarises the options for continuous predictors in a short table, which can be read as a ladder of increasing flexibility and decreasing robustness.</p>
<table class="data">
<tr><th>Option</th><th>Character</th><th>Book's recommendation</th></tr>
<tr><td>Dichotomisation</td><td>Simple, easy interpretation</td><td>Bad idea</td></tr>
<tr><td>More categories</td><td>Captures prognostic information but not smooth; unstable because of the cut-points</td><td>Primarily for illustration</td></tr>
<tr><td>Linear</td><td>Simple</td><td>Often reasonable as a start</td></tr>
<tr><td>Polynomials</td><td>Square or cubic terms; tails may be unstable</td><td>Reasonable as checks for non-linearity</td></tr>
<tr><td>Transformations (log, square root, inverse)</td><td>One parameter</td><td>May give robust summaries of non-linearity</td></tr>
<tr><td>Fractional polynomials</td><td>Flexible; tails may behave unstably</td><td>Flexible descriptions of non-linearity</td></tr>
<tr><td>Restricted cubic splines</td><td>Flexible with robust behaviour in the tails</td><td>Flexible descriptions of non-linearity</td></tr>
<tr><td>Splines in GAM</td><td>Highly flexible, smoothness set by penalty</td><td>Highly flexible descriptions of non-linearity</td></tr>
</table>
<p class="src">Adapted from Ch. 9, Table 9.4</p>
<h3>A parametric transformation as a middle course</h3>
<p>One useful compromise is to look for a simple parametric transformation that captures most of the non-linearity, and then test whether it is adequate by adding RCS terms based on the transformed variable. In a prostate cancer example, PSA values were linearly related to outcome after a log transformation, whereas the original model had used an RCS with 5 knots. Restricting a predictor to a transformation such as the logarithm can reduce the apparent fit slightly, but it limits optimism and increases the robustness of the model. The behaviour of predictions in the tails of the distribution deserves particular care.</p>
<h3>Fractional polynomials or splines?</h3>
<p>The book notes that empirical comparisons between FP and RCS functions are lacking. The main differences arise in the tails: if there is real curvature in the tails the FP will capture it and the RCS will not, and if such curvature is spurious the RCS will do better. With the same df both often perform similarly.</p>
<div class="callout book"><b>Book example: functional form of age in GUSTO-I</b><p>In a subsample of roughly 800 patients the chosen FP2 function for age, AGE<sup>−2</sup> + AGE<sup>3</sup>, used 4 df but its shape had no more than two bendings, which an RCS with 4 knots (3 df) can reproduce. No statistically significant non-linearity was found in the subsample. In the full data (n = 40,830) the optimal transformation was AGE<sup>2</sup>; for weight and height non-linearity was not significant. Source: Ch. 9, §9.3.4.</p></div>
<h3>Extrapolation</h3>
<p>Predicting beyond the observed range of a predictor is always dangerous, but the RCS has the safest behaviour because it extrapolates essentially linearly. In the GUSTO-I ST-elevation example the 5-knot RCS draws a straight line for 9 to 11 leads, whereas the cubic polynomial curves downwards at 10 leads, which would be implausible.</p>
<h3>Allocating degrees of freedom across predictors</h3>
<p>Two strategies are described. Harrell suggested fixing the number of df per continuous predictor from univariate analyses (for example using RCS functions) and then keeping that level of complexity in the multivariable model whatever the statistical significance of the higher-order terms. Another reasonable strategy is to fit a model with every continuous predictor given the same flexible coding, for example 5 df, and then reduce the df per predictor according to its partial R², giving more flexibility to stronger predictors and less to weaker ones, without testing non-linearity. Both approaches fix the complexity independently of whether the curve looks significantly non-linear, which limits the testing-then-estimating bias described in Module 4.</p>
<div class="callout warn"><b>Critical:</b><p>Giving every continuous predictor its maximum flexibility is not free. If the development sample has few outcome events, the additional df use up the events per variable (Module 2), and the model will overfit. The df you can afford to spend is set by the number of events, not by the number of patients.</p></div>
<p class="src">Source: Ch. 9, §9.3.4, §9.3.5, §9.6</p>
`
    },
    {
      id: 's6',
      title: 'Outliers and truncation',
      html: `
<p>An <b>outlier</b> is a value outside the typical range of a variable. A box plot shows the median, and a box covering the interquartile range (IQR, the 25th to 75th percentile). One conventional definition, attributed in the book to Tukey, treats values as outliers when they are at least 3 × IQR above the third quartile or at least 3 × IQR below the first quartile. For a practical purpose, any value that could have a large influence (leverage) on the regression coefficients is of concern.</p>
<div class="formula">Lower fence = Q1 − 3 × IQR        Upper fence = Q3 + 3 × IQR</div>
<h3>Step 1: is the value correct?</h3>
<p>Check the source record, such as the case report form or hospital chart, for a data-entry error. Correct it if possible.</p>
<h3>Step 2: is the value biologically plausible?</h3>
<p>This judgement depends on the clinical setting and needs expert opinion. A systolic blood pressure of 250 mmHg may be plausible in acute traumatic brain injury care but not in an ambulatory clinic. An implausible value is best treated as an error and set to <b>missing</b>, to be handled by the missing-data methods in Module 5.</p>
<h3>Step 3: for plausible values, reduce their leverage by truncation</h3>
<p><b>Truncation</b> moves values beyond chosen limits back to the limit:</p>
<div class="formula">If X &gt; X<sub>max</sub> then X = X<sub>max</sub>;   if X &lt; X<sub>min</sub> then X = X<sub>min</sub>;   otherwise X = X</div>
<p>The truncation points can be chosen by looking at the distribution (box plots or histograms), without reference to the outcome. As a practical rule the book suggests shifting about 0.5% to 1% of values at each end of the range.</p>
<div class="callout book"><b>Book example: glucose and outcome after traumatic brain injury</b><p>Among 4,831 admission glucose values, 3 were above an upper limit of 100 mmol/L for biologically possible values and were set to missing. In 2,096 patients from the Tirilazad trials who had both glucose and 6-month outcome, glucose was then truncated to the interval 3 to 20 mmol/L. After truncation, the relationship between glucose and outcome became slightly more linear. Source: Ch. 9, §9.4.1, Figs 9.4 and 9.5.</p></div>
<div class="callout mch"><b>Illustrative (synthetic): booking haemoglobin</b><p>In a cohort of 2,000 pregnant women, booking Hb has Q1 = 9.8 and Q3 = 11.6 g/dL, IQR = 1.8. The fences are 9.8 − 5.4 = 4.4 and 11.6 + 5.4 = 17.0 g/dL. A value of 19.5 is beyond the upper fence. The first action is to check the register entry (perhaps 9.5 was typed as 19.5). If the record is right but the value is physiologically implausible in pregnancy, set it to missing. A value of 4.2 g/dL, which is also beyond the lower fence, could be real in severe anaemia; it is plausible, so it is retained, and truncation (for example at 5 g/dL) may be used to limit its leverage.</p></div>
<p class="src">Source: Ch. 9, §9.4 and Table 9.5</p>
`
    },
    {
      id: 's7',
      title: 'Putting effects on an interpretable scale',
      html: `
<p>Coefficients and odds ratios (OR) depend on the units of the predictor. A binary predictor has no scaling problem: the OR compares the two groups. For a continuous predictor, the OR refers to a one-unit increase, and a one-unit increase may be too small (one year of age) or too large (1 mmol/L of a laboratory value) to be meaningful.</p>
<h3>Rescaling the unit</h3>
<p>The simplest approach is to divide the predictor by a convenient number before fitting, so that its coefficient refers to a larger step. Equivalently, multiply the estimated coefficient by that number. In GUSTO-I, the univariable logistic coefficient for age in years was 0.084, so the OR per year was e<sup>0.084</sup> = 1.088. Per decade, the coefficient becomes 10 × 0.084 = 0.84 and the OR is e<sup>0.84</sup> = 2.32, which equals 1.088<sup>10</sup>. Rescaling does not change the predictions or the p-value; it only changes the unit.</p>
<div class="formula">OR for a k-unit increase = exp(k × β) = (exp β)<sup>k</sup></div>
<h3>Comparing predictors with different units</h3>
<p>Two common devices make effects of different continuous predictors comparable:</p>
<ul>
<li><b>Standardise</b> by dividing by the standard deviation, so each coefficient refers to a one-SD increase.</li>
<li><b>Interquartile range</b> comparison: compare predictions at the 75th and 25th percentiles of the predictor; for a linear term this equals dividing by the IQR. Standardisation does not apply to categorical predictors, polynomials or other non-linear transformations.</li>
</ul>
<p>For non-linear codings, compare predicted outcomes at the 75th versus 25th percentile, although the interpretation of a parabola by a single OR is awkward. A graph of predicted probability against the predictor is generally the clearest way to display a non-linear effect.</p>
<h3>Dummy coding for illustration only</h3>
<p>A non-linear predictor can be illustrated by two dummies: one for values below the 25th percentile and one for values above the 75th, with the middle 50% as reference. This is helpful to explain the pattern to readers but loses information and depends on the distribution of the predictor in the sample, so it is not advised for making predictions.</p>
<div class="callout book"><b>Book example: systolic blood pressure and 6-month outcome after TBI</b><p>The relation was U-shaped: low pressure especially, but also high pressure, was associated with a poor Glasgow outcome score. It was modelled with an RCS of 3 knots (2 df). The 75th percentile was 141 mmHg and the 25th was 121 mmHg; the OR for predictions at these two points was 1.39 (95% CI 1.25 to 1.54). For illustration, categories below 120 and above 150 mmHg, with 120 to 150 as reference, gave ORs of 0.50 and 0.76 for a good outcome, meaning a poor outcome about twice as likely with low pressure and about 1.3 times as likely with high pressure. The categorised coding had an R² of 2.4% against 4.8% for the continuous coding. Source: Ch. 9, §9.5.1.</p></div>
<div class="callout eg"><b>Worked example: converting a coefficient</b>
<p>In a synthetic GDM model the coefficient for first-trimester BMI is 0.09 per kg/m². The OR per unit is e<sup>0.09</sup> = 1.094. For a 5-unit increase the coefficient is 5 × 0.09 = 0.45 and the OR is e<sup>0.45</sup> = 1.57. If the IQR of BMI is 6 units, the coefficient per IQR is 0.54 and the OR per IQR is e<sup>0.54</sup> = 1.72. The three ORs describe exactly the same model.</p></div>
<p class="src">Source: Ch. 9, §9.5 and Table 9.6</p>
`
    }
  ],
  keyPoints: [
    'The reference category of a dummy-coded predictor changes the coefficients but not the predictions; prefer a reasonably large reference group.',
    'Combine small categories on frequency or meaning while blind to the outcome, or use coding from earlier studies; otherwise the model will be optimistic.',
    'Treating an ordered predictor as linear often keeps nearly all the information (Killip class: χ² 1,388 linear vs 1,389 with three dummies) while dichotomising loses much (861).',
    'Dichotomising a continuous predictor creates unnatural steps, loses information (age at 65: χ² 1,463 vs 2,099 linear) and fails completely for U-shaped relationships.',
    'Restricted cubic splines (k knots, k − 1 df, linear in the tails) and fractional polynomials give flexible smooth fits; use 3 knots in small data, 4 or 5 in large data.',
    'Compare non-nested codings with model χ² − 2 × df; fix flexibility per predictor by prior reasoning or predictor strength, not by repeated significance testing.',
    'Check outliers for errors and plausibility; set implausible values to missing; truncate plausible extremes (about 0.5% to 1% at each end).',
    'Express effects per decade, per SD or per IQR with exp(k × β); rescaling changes the unit but not the predictions.'
  ],
  quiz: [
    {
      q: 'A categorical predictor with three levels is entered with two dummy variables. The analyst changes the reference category from the smallest to the largest group. Which statement is correct?',
      options: [
        'The predicted risks for each patient change, because the baseline risk is different.',
        'The model χ² for the predictor changes, because a different pair of comparisons is tested.',
        'The individual coefficients and their p-values change, but the predicted risks do not.',
        'Nothing changes, including the coefficients, because dummies are symmetric.'
      ],
      answer: 2,
      why: 'Changing the reference redefines which comparisons the coefficients express, so coefficients and their standard errors change. The fitted model is the same set of group risks, so predictions and the overall model χ² are unchanged. The first two options confuse a reparametrisation with a different model. A small reference group tends to give unstable, often non-significant, individual comparisons, which is why a larger reference is preferable.'
    },
    {
      q: 'In a synthetic GDM model the logistic coefficient for BMI is 0.09 per kg/m². What is the approximate OR for a woman whose BMI is 5 units higher than another woman, other predictors equal?',
      options: [
        '1.57',
        '5.47',
        '1.45',
        '1.09'
      ],
      answer: 0,
      why: 'The log odds rise by 5 × 0.09 = 0.45, so the OR is e^0.45 = 1.57. The value 1.09 is the OR for one unit. Multiplying the unit OR by 5 (5.47, from 1.094 × 5) is the commonest error: odds ratios multiply across steps, they do not add. The answer 1.45 results from adding 0.45 to 1 without exponentiating.'
    },
    {
      q: 'In GUSTO-I, the model χ² for Killip class was 861 when dichotomised as shock versus no shock, 1,388 when coded as a linear term, and 1,389 when coded with three dummy variables. What does this show?',
      options: [
        'The dummy coding is wasteful because it needs 3 df and has the lowest χ².',
        'Ordering of the classes should be ignored, because dummies are the most flexible.',
        'The dichotomy is preferable because it is easiest to interpret.',
        'A linear term retains almost all the information of the full factor coding with 1 df instead of 3, while the dichotomy discards much of it.'
      ],
      answer: 3,
      why: 'The linear and factor codings are nearly identical in fit (1,388 vs 1,389), so the 2 extra df of the factor coding buy nothing. The dichotomy loses a large part of the information. The first option reverses the ordering of the χ² values (the factor coding has the highest value, not the lowest). Interpretability is a presentation matter and does not compensate for the loss of predictive information.'
    },
    {
      q: 'Which description fits a restricted cubic spline with 4 knots?',
      options: [
        'A single cubic polynomial across the whole range, using 3 df.',
        'Cubic pieces joined at the knots, forced to be linear beyond the outer knots, using 3 df.',
        'Straight-line segments joined at the knots, using 4 df.',
        'Cubic pieces joined at the knots without any restriction in the tails, using 4 df.'
      ],
      answer: 1,
      why: 'A restricted cubic spline has cubic pieces between knots and is linear in the tails, and k knots use k − 1 df, so 4 knots use 3 df. Without the tail restriction the curve can behave erratically where data are sparse. A single global cubic is a polynomial, not a spline, and is also not the same as the 3-df spline.'
    },
    {
      q: 'In a cohort of pregnant women, a booking haemoglobin of 19.5 g/dL appears in the data. The Q1 to Q3 range is 9.8 to 11.6 g/dL. What is the recommended first step?',
      options: [
        'Delete the woman from the dataset, because outliers distort regression.',
        'Truncate all values to the 1st and 99th percentiles and proceed.',
        'Check the source record for a data-entry error and judge biological plausibility; set to missing if implausible.',
        'Apply a logarithmic transformation so the value no longer looks extreme.'
      ],
      answer: 2,
      why: 'The sequence is: verify correctness, judge plausibility, set implausible values to missing, and only then use truncation for plausible extremes to limit leverage. Deleting the woman wastes her other data. Truncating without checking can hide a data-entry error. A transformation changes the scale for the whole variable and is a separate decision about the shape of the relationship.'
    },
    {
      q: 'For ST elevation in GUSTO-I the model χ² values were: more than 4 leads vs 4 or fewer, 259 (1 df); linear, 281 (1 df); linear + square, 306 (2 df); restricted cubic spline with 5 knots, 350 (4 df). Which coding has the highest χ² − 2 × df?',
      options: [
        'The dichotomy, 257',
        'The restricted cubic spline, 342',
        'The linear term, 279',
        'Linear + square, 302'
      ],
      answer: 1,
      why: 'The adjusted values are 257, 279, 302 and 342, so the spline is best even after paying for its 4 df. The common mistake is to prefer the simplest coding automatically; the penalty of 2 per df is modest compared with the gain in fit for a U-shaped predictor.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Rescale a coefficient, compare codings, flag an outlier',
      level: 'Apply',
      scenario: `<p><b>Illustrative (synthetic).</b> A logistic model for gestational diabetes (GDM) in 1,500 women includes first-trimester BMI. The coefficient for BMI, entered as a linear term, is 0.09 per kg/m². The BMI quartiles are Q1 = 21.5 and Q3 = 27.5 kg/m². The analyst compared four codings of BMI, each added to a model without BMI.</p>
<table class="data">
<tr><th>Coding of BMI</th><th>df</th><th>Model χ²</th></tr>
<tr><td>BMI ≥ 25 vs &lt; 25</td><td>1</td><td>41</td></tr>
<tr><td>Linear</td><td>1</td><td>62</td></tr>
<tr><td>Linear + square</td><td>2</td><td>63</td></tr>
<tr><td>Restricted cubic spline, 4 knots</td><td>3</td><td>67</td></tr>
</table>`,
      questions: [
        '<b>(a)</b> Give the odds ratio for BMI per 1 kg/m², per 5 kg/m² and per interquartile range.',
        '<b>(b)</b> Compute model χ² − 2 × df for each coding and name the best coding.',
        '<b>(c)</b> Which coding would you use in a model with 90 GDM events and 14 candidate parameters in total? Give a reason from the chapter.',
        '<b>(d)</b> A record shows a BMI of 48. Using the 3 × IQR rule, is it an outlier? What do you do next?'
      ],
      answer: `<p><b>(a)</b> OR per unit = e<sup>0.09</sup> = 1.094. Per 5 units: 5 × 0.09 = 0.45, e<sup>0.45</sup> = 1.57. IQR = 27.5 − 21.5 = 6, so 6 × 0.09 = 0.54 and e<sup>0.54</sup> = 1.72. All three are the same model expressed in different units.</p>
<p><b>(b)</b> Dichotomy: 41 − 2 = 39. Linear: 62 − 2 = 60. Linear + square: 63 − 4 = 59. RCS 4 knots: 67 − 6 = 61. The spline is highest at 61, but it exceeds the linear coding by only 1, which is small. The dichotomy is far behind (21 points lower than linear).</p>
<p><b>(c)</b> The linear coding (1 df) is the defensible choice. With only 90 events and 14 candidate parameters, the events per variable are already low (90 / 14 = 6.4, below 10), so spending 2 further df for a gain of 1 in adjusted fit is not warranted. The chapter describes linear coding as a reasonable start, and states that restricting a predictor to a simple form may lower apparent fit slightly but limits optimism and increases robustness. The dichotomy should be avoided because it loses information.</p>
<p><b>(d)</b> Upper fence = Q3 + 3 × IQR = 27.5 + 18 = 45.5 kg/m², so 48 is beyond the fence and is an outlier. Next, check the booking record for a data-entry error (for example height or weight mis-typed). Then judge plausibility: a BMI of 48 is rare but possible in pregnancy, so if the record is correct the value is plausible and should be retained, with truncation (for example at the 99th percentile or a pre-set limit such as 45) used if one wants to limit its leverage. If the record is wrong and cannot be corrected, set it to missing.</p>`
    },
    {
      id: 't2',
      title: 'Compare codings of maternal age in the preterm-birth dataset',
      level: 'Analyze',
      scenario: `<p>Open the coding explorer on <b>ptb_dev</b> (synthetic; outcome <i>preterm</i>, <span data-live="ptb_dev_events"></span> events in <span data-live="ptb_dev_n"></span> women). Predictor: maternal age.</p>`,
      questions: [
        '<b>(a)</b> Fit the dichotomised, linear, quadratic and 3, 4 and 5-knot spline codings in turn. Record LR χ², df and AIC. Which codings fit best and which fit worst?',
        '<b>(b)</b> Describe the shape of the fitted risk curve under linear coding compared with the observed risk by age group, and explain what the linear model gets wrong.',
        '<b>(c)</b> Move the cut slider for the dichotomised coding between a young cut (about 20) and an older cut (about 35). Does the fit depend on the cut?',
        '<b>(d)</b> Reduce the random subsample to the smallest n and compare the 5-knot spline curve with the quadratic. What would you advise for a small study?'
      ],
      answer: `<p><b>Expected pattern.</b> In this synthetic dataset the true log-odds of preterm birth contains the term 0.015 × (age − 27)², a parabola with its lowest risk at 27 years. For example, relative to age 27 the log odds increase by 0.735 at age 20 (OR 2.09) and by 0.96 at age 35 (OR 2.61).</p>
<p><b>(a)</b> The linear coding gives a small χ² and a poor AIC, because a straight line cannot represent a risk that rises on both sides of the nadir. The dichotomised codings fit poorly for the same reason, and the AIC depends on the cut. The quadratic coding (2 df) matches the data-generating form exactly and should give a large gain in χ² and the best or near-best AIC. The 3, 4 and 5-knot splines give similar curves to the quadratic with more df, so the AIC is similar or slightly worse.</p>
<p><b>(b)</b> The linear model produces a monotone line (rising or falling slightly) through the middle of the U, overpredicting at the age where risk is lowest and underpredicting at the young and old ends, so the line misses the U-shape visible in the observed risks by age group. This is the same failure as the dichotomy of ST elevation in GUSTO-I.</p>
<p><b>(c)</b> Yes. A cut near the younger or older end puts a small, high-risk group against everyone else and yields a different χ² in each place, and neither cut captures both arms of the U. This illustrates that a data-chosen cut-point can look more impressive in one sample without being a reproducible feature of the relationship.</p>
<p><b>(d)</b> With few events, the 5-knot curve wiggles, especially in the tails, while the quadratic remains smooth. The lesson from the chapter is to use 3 knots (2 df) or a simple polynomial in small datasets, where the df the data can support is limited, and to reserve 4 or 5 knots for large datasets or for predictors believed to be strongly and non-linearly related to the outcome.</p>`
    },
    {
      id: 't3',
      title: 'Critique the predictor coding in a preterm-birth study',
      level: 'Evaluate',
      scenario: `<p><b>Illustrative (synthetic).</b> A study from a district hospital develops a model for preterm birth in 600 pregnant women (78 preterm). The methods state: "Maternal age was dichotomised at 35 years because this gave the smallest p-value among cut-points tried from 18 to 40. Haemoglobin was categorised as less than 11 g/dL or 11 g/dL and above. Body mass index was grouped into quartiles. Parity was grouped as 0, 1, 2, 3 and more than 3, and categories with similar preterm rates were merged. Antenatal visits were entered as 0, 1 to 3, 4 or more. One woman had recorded Hb of 19.5 g/dL and was deleted. Odds ratios for birth weight of the mother's previous baby are reported per gram."</p>`,
      questions: [
        '<b>(a)</b> Identify every coding problem and state which of the chapter\'s principles each violates.',
        '<b>(b)</b> Which problem would you flag as most serious for the validity of the final model?',
        '<b>(c)</b> Propose a better coding for each predictor.'
      ],
      answer: `<p><b>(a) Point-by-point.</b></p>
<ol>
<li><b>Age cut-point chosen from the p-value.</b> A data-driven cut-point exaggerates the apparent effect and will not reproduce in new patients. Age is also likely non-monotone (young and older mothers both at higher risk), so any single cut misses half of the pattern, as the ST-elevation U-shape does for a dichotomy. The step also treats 34 and 36 as very different and 20 and 34 as identical.</li>
<li><b>Hb dichotomised at 11 g/dL.</b> The cut is a plausible clinical threshold, but all women with Hb 6 and Hb 10.9 are assigned the same risk, and 11.0 and 15.0 the same. Information is lost; the chapter calls dichotomisation a bad idea for the final prediction model. Hb may also have an effect at the high end, which a single threshold cannot show.</li>
<li><b>BMI in quartiles.</b> Four categories still produce jumps at the borders, depend on the sample distribution and lose information (the book compares categorised and continuous coding of blood pressure: R² 2.4% versus 4.8%). Quartile dummies are suitable for illustration only.</li>
<li><b>Parity categories merged by similarity of outcome.</b> Merging guided by outcome rates uses the outcome relationship and makes the apparent fit optimistic. Merging should be blind to the outcome, based on frequencies and meaning.</li>
<li><b>Antenatal visits as three groups.</b> Another ordered predictor with loss of information; a linear term (with a square term as a check) usually retains almost all the information.</li>
<li><b>Hb of 19.5 deleted.</b> The correct sequence is to check the source record for an entry error, judge plausibility, and set to missing if implausible, so that the rest of the woman's data are retained and the missing-data methods can be applied. Deleting loses data without checking whether the value was a typing error.</li>
<li><b>Odds ratio per gram.</b> A one-gram step is meaningless, giving an OR indistinguishable from 1. Rescale to per 500 g or per IQR (or per SD).</li>
</ol>
<div class="callout warn"><b>(b) Critical:</b><p>The age cut-point chosen by the smallest p-value (and the merging of parity categories by outcome rates) is the most serious problem, because the choice uses the outcome relationship in the same data that will be used to assess the model. With 78 events the optimism cannot be quantified unless the whole search is repeated inside a bootstrap validation, and the stated effect will not be reproducible.</p></div>
<p><b>(c) Better coding.</b> Age: continuous with a quadratic or 3-knot spline (2 df), fixed in advance. Hb: continuous, linear to start, with a square term or log transform as a check; one could consider a 3-knot spline if the sample allows. BMI: continuous (linear, or 3 knots). Parity: merge sparse categories without reference to outcome (for example 0, 1, 2, 3 or more), or code linearly. Antenatal visits: linear count, possibly truncated at a sensible upper value. The implausible Hb: correct or set to missing and impute. Birth weight of the previous baby: per 500 g. With 78 events, the total df of all these terms should also be kept modest (see EPV, Module 2).</p>`
    }
  ]
});
