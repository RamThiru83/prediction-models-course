registerModule({
  id: 'm14',
  num: 14,
  part: 'Validation',
  title: 'Patterns of external validity',
  book: 'Ch. 19',
  minutes: 80,
  summary: 'Why a model performs differently in a new setting: the separate effects of case-mix (observed predictors, missed predictors, outcome sampling) and of regression coefficients on calibration, discrimination and net benefit, and how large a validation study must be.',
  objectives: [
    'Classify differences between development and validation populations into case-mix in observed predictors, missed predictors or outcomes, and differences in coefficients.',
    'Predict the effect of each type of difference on calibration-in-the-large, calibration slope, c statistic and net benefit.',
    'Explain why a model can be well calibrated yet clinically useless, and miscalibrated yet useful, in a new setting.',
    'Use reference and refitted performance to judge whether poorer external performance reflects case-mix or coefficients.',
    'Calculate minimum detectable miscalibration from standard errors and choose a validation sample size.',
    'Correct the intercept of a model estimated in a nested case-control sample.'
  ],
  sections: [
    {
      id: 's1',
      title: 'What determines external validity',
      html: `
<p>When a model is applied in a new setting, two things determine how well it performs: the <b>validity of its regression coefficients</b> in that setting, and the <b>case-mix</b> of the patients there. Internal validity is a minimum prerequisite: a model that is overfitted already in its own setting will not generalise.</p>
<h3>Case-mix</h3>
<p><b>Case-mix</b> means the distribution of patient characteristics. Three parts matter:</p>
<ul>
<li><b>Observed predictors X</b>: the predictors included in the model. Their distribution differs when, for example, a model from secondary care is applied in tertiary care, or a model from a randomised trial is applied to a less selected population.</li>
<li><b>Missed predictors Z</b>: characteristics that affect the outcome but are not in the model, whether observable or not. Their distribution can differ between settings, and by definition this cannot be ruled out in advance. Z may be independent of X or correlated with it.</li>
<li><b>Outcomes Y</b>: the design can change the outcome frequency directly, as in a case-control study that samples cases and controls in a ratio different from the population.</li>
</ul>
<h3>Coefficients</h3>
<ul>
<li><b>Coefficients smaller than expected</b>: an overfitted model, typically from a small development sample with many candidate predictors and no shrinkage, has coefficients that are too large on average. At validation the effect of the linear predictor appears smaller.</li>
<li><b>Coefficients truly different</b>: genuine differences between populations, from differing definitions of predictors or outcome, or different selection of patients.</li>
</ul>
<p>Even when the true coefficients are identical, coefficients re-estimated in a finite validation sample will differ from the development estimates by chance, some larger and some smaller. Comparing coefficients one by one between two small samples is therefore uninformative; it would be a coincidence if they agreed well.</p>
<table class="data">
<thead><tr><th>Difference</th><th>Characteristic</th><th>Typical situation</th></tr></thead>
<tbody>
<tr><td>Case-mix in X</td><td>More or less severe, or more or less heterogeneous, according to included predictors</td><td>Validation in a referral centre; wider or narrower inclusion criteria</td></tr>
<tr><td>Case-mix in Z</td><td>Different selection on characteristics outside the model</td><td>Validation in a different type of setting</td></tr>
<tr><td>Case-mix in Y</td><td>Retrospective sampling of cases and controls</td><td>Case-control design</td></tr>
<tr><td>Coefficients smaller</td><td>Overfitted model</td><td>Model from a small development sample</td></tr>
<tr><td>Coefficients different</td><td>Truly different population</td><td>Validation in a different setting</td></tr>
</tbody>
</table>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A preterm-birth model from a district hospital is applied in a tertiary referral hospital. Referral selects women with more prior preterm births and chronic hypertension (severity in X). The referral population may also have more cervical insufficiency or multiple pregnancies, which the model does not include (severity in Z). Effects of predictors may differ because of earlier intervention for high-risk women (coefficients).</p></div>
<p class="src">Source: Ch. 19, §19.1 (Table 19.1)</p>
`
    },
    {
      id: 's2',
      title: 'A simulation to separate the effects',
      html: `
<p>To see each effect in isolation, the book uses a large simulation (populations of 500,000) inspired by a testicular cancer case study: outcome incidence close to 50% and a decision threshold of 30%.</p>
<h3>Set-up</h3>
<ul>
<li>One observed predictor <span class="m">x</span> stands for the model's linear predictor; one missed predictor <span class="m">z</span> stands for everything not in the model. Both are standard normal.</li>
<li>The model used for prediction is lp = 1.5 × x. In the development population it has a c statistic of 0.81 and is perfectly calibrated.</li>
<li>Outcomes are generated from both x and z. Three versions differ in the correlation between x and z: r = 0, 0.33 and 0.5.</li>
</ul>
<table class="data">
<thead><tr><th>x–z correlation</th><th>True model (adjusted for z)</th><th>Model without z</th></tr></thead>
<tbody>
<tr><td>r = 0</td><td>2.05 × x + 1.5 × z</td><td>1.5 × x</td></tr>
<tr><td>r = 0.33</td><td>1.5 × x + 1.5 × z</td><td>1.5 × x</td></tr>
<tr><td>r = 0.5</td><td>1.18 × x + 1.5 × z</td><td>1.5 × x</td></tr>
</tbody>
</table>
<p>Why is the adjusted coefficient for x 2.05 when z is uncorrelated with x? In logistic (and Cox) regression, adjusting for a covariate that predicts the outcome makes other coefficients more extreme even if the covariate is uncorrelated with them: a <b>stratification effect</b> of non-linear models. When z is positively correlated with x, confounding pulls the adjusted coefficient down. At r = 0.33 the two effects balance exactly, so the adjusted and unadjusted coefficients for x are both 1.5.</p>
<h3>Performance measures</h3>
<ul>
<li><b>Calibration-in-the-large, a|b=1</b>: the intercept in a logistic model in the validation data with lp as offset (slope fixed at 1). Ideal 0. Positive values mean underestimation of risk.</li>
<li><b>Calibration slope, b</b>: the coefficient of lp in a logistic model with lp as the only covariate. Ideal 1.</li>
<li><b>c statistic</b> for discrimination.</li>
<li><b>Net benefit</b>, NB = (TP − w × FP)/N with w = threshold/(1 − threshold), compared with the best default strategy.</li>
</ul>
<div class="callout eg"><b>Worked example: the reference strategy</b><p>Incidence 50%, threshold 30%, so w = 0.3/0.7 = 3/7. "Treat all" in 100 patients gives 50 true positives and 50 false positives: NB = (50 − 3/7 × 50)/100 = (50 − 21.4)/100 = 0.286, that is 28.6 net true positives per 100 patients. A useful model must exceed this. In the development population the model's NB exceeds "treat all" by 0.055: 5.5 more true positives per 100 patients at the same number of false positives.</p></div>
<p>All scenarios below are compared against this development benchmark: a|b=1 = 0, b = 1, c = 0.81, NB gain 0.055.</p>
<p class="src">Source: Ch. 19, §19.2 (Table 19.2, Fig. 19.2)</p>
`
    },
    {
      id: 's3',
      title: 'Case-mix in the observed predictors',
      html: `
<p>Selecting patients on the basis of the observed predictor x is a form of missing-not-at-random selection with respect to x. Regression coefficients remain unbiased under such selection, so the model stays <b>well calibrated</b>: a|b=1 = 0 and b = 1 in all four scenarios. What changes is the spread of predicted risks, and with it discrimination and usefulness.</p>
<table class="data">
<thead><tr><th>Validation population (selection on x)</th><th>a|b=1</th><th>b</th><th>c</th><th>NB gain</th></tr></thead>
<tbody>
<tr><td>Development (reference)</td><td>0</td><td>1</td><td>0.81</td><td>0.055</td></tr>
<tr><td>More severe (higher x selected)</td><td>0</td><td>1</td><td>0.77</td><td>0.006</td></tr>
<tr><td>Less severe (lower x selected)</td><td>0</td><td>1</td><td>0.77</td><td>0.104</td></tr>
<tr><td>More heterogeneous (extreme x selected)</td><td>0</td><td>1</td><td>0.90</td><td>0.104</td></tr>
<tr><td>Less heterogeneous (central x selected)</td><td>0</td><td>1</td><td>0.75</td><td>0.030</td></tr>
</tbody>
</table>
<h3>Reading the table</h3>
<ul>
<li><b>Heterogeneity drives discrimination.</b> A more heterogeneous case-mix contains more patients with very low or very high predictions, so c rises (0.90). A homogeneous case-mix lowers c (0.75) with perfect calibration. A low c in a new setting therefore does not necessarily mean the model is wrong.</li>
<li><b>Severity drives usefulness through the threshold.</b> In the more severe population few patients have predictions below the 30% threshold, so the model rarely changes the default decision ("treat all") and NB gain falls to 0.006; with even more selective inclusion it would reach zero. In the less severe population many patients fall below the threshold and the model spares many of them unnecessary treatment: NB gain 0.104. The c statistic is the same (0.77) in both.</li>
<li>These patterns were the same whether z was uncorrelated or correlated with x.</li>
</ul>
<div class="callout key"><b>Key idea</b><p>Case-mix in the observed predictors leaves calibration intact but changes discrimination (through the heterogeneity of predictions) and clinical usefulness (through the distribution of predictions around the decision threshold).</p></div>
<div class="callout book"><b>Book example</b><p>A testicular cancer model lost clinical usefulness at external validation in a tertiary referral centre. Part of the explanation is selection: only patients suspected of residual tumour, for example with larger masses, were operated and thus had their histology verified. Applied to all patients, the model would have been judged more useful.</p></div>
<div class="callout warn"><b>Pitfall</b><p>Selection on X can lead to predictions for X values outside the range seen at development. If non-linearities or interactions were missed during development, calibration can then break down too.</p></div>
<p class="src">Source: Ch. 19, §19.3.1–19.3.3 (Table 19.3, Figs. 19.3–19.4); §19.9</p>
`
    },
    {
      id: 's4',
      title: 'Case-mix in missed predictors and in outcomes',
      html: `
<h3>More or less severe according to z</h3>
<p>If the validation population is more severe on characteristics <b>not in the model</b>, the main effect is systematic miscalibration. At r = 0.33, a|b=1 = 0.70 when more severe z patients are selected: approximately twice as many events as predicted (odds ratio exp(0.70) = 2.0). Selecting less severe z patients gives a|b=1 = −0.70. The slope stays around 1 and c around 0.81. With r = 0 the slope was 1.12, because selection reduces the stratification effect of z (unadjusted coefficient 1.12 × 1.5 = 1.68); with r = 0.5 it was 0.93.</p>
<p>The consequence for decisions is serious. In the more severe population the NB gain was 0.001 at r = 0.33 and became <b>negative</b> (−0.004) at r = 0.5. A negative gain means that using the model leads to worse decisions than simply treating everyone. Many patients predicted below 30% actually have risks above 30% and are wrongly denied treatment; this loss outweighs the reduction in false positives. In the less severe population the NB gain rose (0.109 at r = 0.33), despite the miscalibration.</p>
<div class="callout warn"><b>Critical:</b><p>A model that systematically underestimates risk in a new setting can do harm: its net benefit can fall below that of a default policy. A good c statistic offers no protection, because c is insensitive to calibration-in-the-large. Calibration-in-the-large must be checked at every external validation.</p></div>
<h3>More or less heterogeneous according to z</h3>
<p>Changing the spread of z affects the <b>calibration slope</b> but not calibration-in-the-large. Results depend on the x–z correlation: for a more heterogeneous z, slopes were 0.78, 1 and 1.18 at r = 0, 0.33 and 0.5. Discrimination and usefulness were better when the slope was higher.</p>
<h3>Outcome sampling: case-control designs</h3>
<p>If cases and controls are sampled in a ratio different from the population, only the intercept is affected. With 2 cases per control (from a 1:1 population) a|b=1 = 0.69 = log(2); with 1 case per 2 controls, −0.69. The slope stays 1 and c stays 0.81. Clinical usefulness is meaningful only after correcting the intercept back to the clinical population.</p>
<p>In a traditional case-control study the number of underlying controls is unknown, so the intercept cannot be corrected. In a <b>nested case-control</b> design cases and controls are sampled from a defined cohort, so the sampling fractions are known; the intercept is corrected, for example, by weighting controls by the inverse of their sampling fraction.</p>
<div class="callout eg"><b>Worked example: correcting a nested case-control intercept</b><p>A cohort of 3000 women has 360 preterm births. All 360 cases and 720 of the 2640 controls are analysed. The control sampling fraction is 720/2640 = 0.273, so the odds of the outcome in the analysed sample are 1/0.273 = 3.67 times the cohort odds. If all cases are included, the intercept from the case-control fit is too high by log(3.67) = 1.30. An intercept of −0.40 estimated in the sample becomes −0.40 − 1.30 = −1.70 for the cohort; the coefficients are kept.</p></div>
<p class="src">Source: Ch. 19, §19.3.4–19.4 (Figs. 19.5–19.7)</p>
`
    },
    {
      id: 's5',
      title: 'Differences in coefficients, and the overall pattern',
      html: `
<h3>Overfitting: slope of the linear predictor below 1</h3>
<p>A typical shrinkage factor found at internal validation is 0.8; more severe overfitting gives 0.6. If such a model is validated, the calibration slope is 0.8 or 0.6, c falls to 0.77 or 0.72 (from 0.81), and the NB gain falls to 0.037 or 0.014 (from 0.055). Calibration-in-the-large is unaffected.</p>
<h3>Truly different coefficients</h3>
<p>With ten predictors, half of them having 0.5 times and half 1.5 times their development effect in the validation setting, the slope was 0.84, c 0.78 and NB gain 0.040. With half having only 0.25 times their effect, the slope was 0.68, c 0.74 and NB gain 0.023. Different predictor effects can seriously reduce performance even when calibration-in-the-large is fine.</p>
<table class="data">
<thead><tr><th>Scenario</th><th>a|b=1</th><th>b</th><th>c</th><th>NB gain</th></tr></thead>
<tbody>
<tr><td>Development</td><td>0</td><td>1</td><td>0.81</td><td>0.055</td></tr>
<tr><td>More severe in z (r = 0.33)</td><td>0.70</td><td>1</td><td>0.81</td><td>0.001</td></tr>
<tr><td>Less severe in z (r = 0.33)</td><td>−0.70</td><td>1</td><td>0.81</td><td>0.109</td></tr>
<tr><td>More heterogeneous in z (r = 0.33)</td><td>0</td><td>1</td><td>0.83</td><td>0.062</td></tr>
<tr><td>Less heterogeneous in z (r = 0.33)</td><td>0</td><td>1</td><td>0.81</td><td>0.053</td></tr>
<tr><td>Case-control 2:1 / 1:2</td><td>±0.69</td><td>1</td><td>0.81</td><td>not applicable</td></tr>
<tr><td>Overfitted, slope 0.8 / 0.6</td><td>0</td><td>0.8 / 0.6</td><td>0.77 / 0.72</td><td>0.037 / 0.014</td></tr>
<tr><td>Effects × 0.5 or 1.5</td><td>0</td><td>0.84</td><td>0.78</td><td>0.040</td></tr>
<tr><td>Effects × 0.25 or 1.5</td><td>0</td><td>0.68</td><td>0.74</td><td>0.023</td></tr>
</tbody>
</table>
<h3>Summary of patterns</h3>
<ul>
<li><b>Calibration-in-the-large</b> is disturbed by a more or less severe case-mix in <i>missed</i> predictors and by case-control sampling. The case-control ratio is under the researcher's control; the distribution of missed predictors usually is not.</li>
<li><b>Calibration slope</b> is disturbed by overfitting, by truly different predictor effects, and by changes in the heterogeneity of missed predictors.</li>
<li><b>Discrimination</b> moves with the calibration slope, and falls with a more homogeneous case-mix in X. Poor discrimination can therefore come from poor coefficients, a homogeneous case-mix, or both.</li>
<li><b>Clinical usefulness</b> needs discrimination (a model without discrimination cannot be useful), but discrimination and calibration are not sufficient: usefulness also depends on where predictions fall relative to the threshold. Case-mix in X acts mainly through that distribution; case-mix in Z acts mainly through calibration-in-the-large.</li>
</ul>
<p>Combinations occur in practice. For example, when a model moves from a trial to a survey that is less heterogeneous in X and more severe in Z, with effects 0.5 or 1.5 times as large, the book's simulation gave a|b=1 0.69, slope 0.59, c 0.65 and a negative NB gain (−0.036).</p>
<div data-widget="caseMixLab"></div>
<ul class="try">
<li>Select "more severe x" and then "less severe x". Confirm that calibration stays on the identity line while c and the net benefit at the 30% threshold change.</li>
<li>Select "more severe z" and move the x–z correlation from 0 to 0.5. Watch calibration-in-the-large and the sign of the net benefit compared with treat all.</li>
<li>Compare "overfitted slope 0.8" with "coefficients ×0.5/×1.5": both lower the slope and c without shifting calibration-in-the-large.</li>
<li>Select "case-control 2:1" and note which single measure changes.</li>
</ul>
<p class="src">Source: Ch. 19, §19.5 (Tables 19.3–19.4, Figs. 19.8–19.9)</p>
`
    },
    {
      id: 's6',
      title: 'Reference values: case-mix or coefficients?',
      html: `
<p>Suppose the c statistic is lower at external validation. Is the validation population simply more homogeneous, or are the coefficients wrong there? Two additional numbers help.</p>
<h3>Reference performance</h3>
<p>The <b>reference value</b> is the performance expected in the validation sample <i>if the model were fully correct there</i>, given that sample's own case-mix in X. It is obtained by simulation:</p>
<ol>
<li>Calculate the model's predicted probability for each validation patient.</li>
<li>Generate a new outcome for each patient at random with that probability.</li>
<li>Calculate c (or R², Brier score) for the predictions against the simulated outcomes.</li>
<li>Repeat at least 100 times (for example 1000) and average.</li>
</ol>
<p>For calibration the reference values are simply 0 (calibration-in-the-large) and 1 (slope).</p>
<h3>Refitted performance</h3>
<p>Refitting the same predictors in the validation data gives coefficients that are optimal for that sample. Its (apparent) performance is an <b>upper bound</b>: what could be reached if the development coefficients had been exactly right. It depends on case-mix and on the strength of the predictors in the validation setting.</p>
<h3>Interpretation</h3>
<ol>
<li>Internal validation corrects for overfitting; case-mix is unchanged.</li>
<li>External validation tests the model where both case-mix and coefficients may differ.</li>
<li>Reference performance adjusts for the new case-mix while keeping the development coefficients.</li>
<li>Refitted performance adjusts for the new case-mix and uses optimal coefficients.</li>
</ol>
<p>If external c is clearly below the reference c, the shortfall is not due to case-mix in X; it points to coefficients that do not hold in the new setting.</p>
<div class="callout book"><b>Book example</b><p>Testicular cancer: apparent c 0.818, internally validated 0.812, external 0.785, reference 0.824, refitted 0.819. The reference c was similar to development, so the case-mix in X did not explain the drop; differences in coefficients did. Traumatic brain injury: apparent 0.767, internal 0.765, external 0.816, reference 0.804, refitted 0.819. The better external c was partly case-mix (reference higher than development) and partly stronger predictor effects (calibration slope 1.08).</p></div>
<h3>Comparing case-mix more informally</h3>
<p>Case-mix is usually compared informally, in a "Table 1" of patient characteristics. One formal proposal, the <b>M statistic</b>, groups predicted probabilities into bands (for example 0–25%, 26–50%, 51–75%, 76–90%, 91–95%, 96–100%), takes for each band the smaller of the development and validation fractions, and sums them. M ranges from 0 (no overlap) to 1 (identical case-mix). An arbitrary cut-off of 0.88 has been suggested, below which results should be interpreted cautiously.</p>
<div class="callout eg"><b>Worked example: M statistic</b><p>Development fractions in five risk bands: 0.40, 0.30, 0.15, 0.10, 0.05. Validation fractions: 0.25, 0.30, 0.20, 0.15, 0.10. Smaller of each pair: 0.25, 0.30, 0.15, 0.10, 0.05. M = 0.85, below 0.88: the validation population is shifted towards higher risk and comparisons with development performance need caution.</p></div>
<p class="src">Source: Ch. 19, §19.6 (Table 19.5); §19.9</p>
`
    },
    {
      id: 's7',
      title: 'Uncertainty and sample size in validation studies',
      html: `
<p>Real validation samples are finite, so every performance measure has a standard error (SE). The book simulated a model with ten normally distributed predictors (c = 0.81 in the population, 50% incidence) in development and validation samples of different sizes.</p>
<table class="data">
<thead><tr><th>Events/N development</th><th>Events/N validation</th><th>a|b=1</th><th>Slope b</th><th>c</th></tr></thead>
<tbody>
<tr><td>5000/10,000</td><td>5000/10,000</td><td>0 ± 0.03</td><td>1.00 ± 0.03</td><td>0.81 ± 0.004</td></tr>
<tr><td>50/100</td><td>5000/10,000</td><td>0 ± 0.28</td><td>0.64 ± 0.15</td><td>0.77 ± 0.017</td></tr>
<tr><td>5000/10,000</td><td>50/100</td><td>0 ± 0.24</td><td>1.06 ± 0.24</td><td>0.82 ± 0.043</td></tr>
<tr><td>5000/10,000</td><td>100/200</td><td>0 ± 0.16</td><td>1.03 ± 0.17</td><td>0.81 ± 0.030</td></tr>
<tr><td>5000/10,000</td><td>250/500</td><td>0 ± 0.11</td><td>1.01 ± 0.10</td><td>0.80 ± 0.018</td></tr>
</tbody>
</table>
<p>Small <i>development</i> samples give overfitted models (slope 0.64) with lower c, which a large validation sample measures precisely. Small <i>validation</i> samples give very uncertain estimates, and even slight upward bias in slope and c. The effective sample size is largely determined by the number of events, not the total number of patients.</p>
<h3>Power</h3>
<p>For a published model, a <b>one-sample test</b> is reasonable: the model is treated as fixed and its validation performance is compared with the ideal values. Calibration-in-the-large calls for a two-sided test (risk could be over- or underestimated); for the slope, only slope &lt; 1 matters (one-sided); for c, only a decrease from the reference value. With 5% type I error and 80% power the critical values are 1.96 + 0.84 = 2.80 (two-sided) and 1.645 + 0.84 ≈ 2.49 (one-sided). Minimum detectable difference = critical value × SE.</p>
<div class="callout eg"><b>Worked example: 50 events and 50 non-events</b><p>SE of calibration-in-the-large 0.24: 2.80 × 0.24 = 0.67, odds ratio exp(0.67) = 1.96, so only predictions about twice too high or too low can be detected. Slope SE 0.24: 1 − 2.49 × 0.24 = 0.40, so only slopes below 0.40 are detectable. c SE 0.043: 2.49 × 0.043 = 0.107.</p></div>
<table class="data">
<thead><tr><th>Incidence</th><th>Events/N validation</th><th>Detectable a|b=1 (OR)</th><th>Detectable slope</th><th>Detectable fall in c</th></tr></thead>
<tbody>
<tr><td>50%</td><td>50/100</td><td>±0.67 (1.96)</td><td>&lt; 0.40</td><td>0.107</td></tr>
<tr><td>50%</td><td>100/200</td><td>±0.45 (1.57)</td><td>&lt; 0.58</td><td>0.077</td></tr>
<tr><td>50%</td><td>250/500</td><td>±0.31 (1.36)</td><td>&lt; 0.75</td><td>0.045</td></tr>
<tr><td>50%</td><td>500/1000</td><td>±0.22 (1.25)</td><td>&lt; 0.83</td><td>0.035</td></tr>
<tr><td>50%</td><td>1000/2000</td><td>±0.17 (1.18)</td><td>&lt; 0.88</td><td>0.022</td></tr>
<tr><td>10%</td><td>50/500</td><td>±0.45 (1.61)</td><td>&lt; 0.63</td><td>0.075</td></tr>
<tr><td>10%</td><td>100/1000</td><td>±0.34 (1.44)</td><td>&lt; 0.75</td><td>0.052</td></tr>
<tr><td>10%</td><td>200/2000</td><td>±0.25 (1.29)</td><td>&lt; 0.83</td><td>0.037</td></tr>
</tbody>
</table>
<p>Clinically relevant invalidity might be predictions 1.5 times too high or low in odds (a|b=1 = ±ln 1.5), a slope below 0.8, or a fall in c of more than 0.05. When a model was truly invalid (slope 0.84, c falling from 0.821 to 0.778), power to detect the slope was 25% with 100 events, 50% with 250 and 78% with 500; for the fall in c it was 24%, 57% and 87%.</p>
<div class="callout key"><b>Key idea</b><p>An external validation sample needs at least 100 events and 100 non-events, and preferably more (for example 250 events, or 100 events with 900 non-events), to detect relevant miscalibration. A validation with 30 events can show only gross failure. If a temporal split of one data set is planned, a 2:1 development:validation ratio is a reasonable balance between overfitting at development and power at validation. Validity can also be framed as non-inferiority: the null hypothesis is that the model is invalid, and the study tests whether performance lies within acceptable limits.</p></div>
<div data-widget="validationPower"></div>
<ul class="try">
<li>Choose 50% incidence and step through 50, 100, 250 and 500 events. Note the detectable calibration-in-the-large odds ratio and slope at each step.</li>
<li>Switch to 10% incidence with 100 events. Compare the detectable slope with the 50% incidence result at 100 events, and note the total sample size required.</li>
</ul>
<p class="src">Source: Ch. 19, §19.7–19.9 (Tables 19.6–19.8)</p>
`
    }
  ],
  keyPoints: [
    'External performance depends on the validity of the coefficients and on case-mix in observed predictors, missed predictors and outcomes.',
    'Case-mix in observed predictors leaves calibration intact but changes c (heterogeneity) and net benefit (distribution of risks around the threshold).',
    'A more severe case-mix in missed predictors shifts calibration-in-the-large and can make net benefit worse than treating everyone.',
    'Case-control sampling shifts only the intercept, by the log of the sampling ratio; nested designs allow correction.',
    'Overfitting and truly different effects lower the calibration slope, c and net benefit.',
    'Reference performance (model assumed correct in the validation case-mix) and refitted performance separate case-mix effects from coefficient effects.',
    'Small validation samples give imprecise estimates; aim for at least 100 events and 100 non-events, preferably 250 or more events.',
    'Discrimination is necessary for clinical usefulness, but good calibration and discrimination together still do not guarantee it.'
  ],
  quiz: [
    {
      q: 'A well-developed neonatal sepsis model is applied in a unit admitting a much more homogeneous group of newborns (similar gestational age and birth weight). Calibration is perfect but c falls from 0.81 to 0.75. The most likely explanation is:',
      options: [
        'The coefficients are invalid in the new unit',
        'The model was overfitted at development',
        'The narrower case-mix in observed predictors reduces the spread of predicted risks',
        'More severe disease due to missed predictors'
      ],
      answer: 2,
      why: 'A less heterogeneous case-mix in X lowers c while calibration stays perfect (book simulation: c 0.75, a|b=1 = 0, b = 1). The common misconception (option A) reads any drop in c as invalid coefficients; overfitting would also lower the slope, and severity in missed predictors would shift calibration-in-the-large.'
    },
    {
      q: 'A model for preterm birth developed in a cohort is validated in a case-control sample with 2 cases per control from a population in which the model was correct and incidence was 50%. What is the expected calibration-in-the-large (a|b=1)?',
      options: ['0', '+0.69', '−0.69', '+2.0'],
      answer: 1,
      why: 'Doubling the case:control ratio doubles the odds of the outcome, so the intercept shifts by log(2) = 0.69, with slope and c unchanged. Option D confuses the odds ratio (2.0) with its logarithm; option C has the sign reversed (that would be 1 case per 2 controls).'
    },
    {
      q: 'At external validation a model for postpartum haemorrhage has c 0.80 and calibration slope 1.0, but calibration-in-the-large is +0.70 (risks underestimated). For a 30% treatment threshold, what may happen to net benefit compared with treating all women?',
      options: [
        'It must be positive because c is good',
        'It is unaffected, since net benefit depends only on discrimination',
        'It becomes undefined',
        'It can fall to zero or below, because many women predicted below 30% truly exceed it'
      ],
      answer: 3,
      why: 'In the book simulation a more severe case-mix in missed predictors (a|b=1 ≈ 0.70) reduced the net benefit gain to about zero and even below zero. The misconception in option A is that good discrimination protects decisions; c is insensitive to calibration-in-the-large, but decisions depend on absolute risks.'
    },
    {
      q: 'For a validation study with 50% incidence, the SE of calibration-in-the-large is 0.11. With 80% power and a two-sided 5% test, what is the smallest detectable miscalibration expressed as an odds ratio?',
      options: ['About 1.12', 'About 1.36', 'About 1.57', 'About 1.96'],
      answer: 1,
      why: 'Minimum detectable difference = 2.80 × 0.11 = 0.31; exp(0.31) = 1.36, the book value for 250 events and 250 non-events. Option A uses 1.0 × SE (no allowance for power or the critical value); options C and D correspond to 100 and 50 events.'
    },
    {
      q: 'Testicular cancer model (book example): external c 0.785, reference c 0.824, refitted c 0.819, development c 0.818. What explains the poorer external discrimination?',
      options: [
        'Differences in regression coefficients between the settings',
        'A more homogeneous case-mix in the validation centre',
        'Too small a validation sample, so the difference is certainly chance',
        'Overfitting that internal validation failed to detect'
      ],
      answer: 0,
      why: 'The reference c (0.824), which assumes the model is correct for the validation case-mix, is as high as at development, so case-mix in X does not explain the drop; the coefficients do not hold as well. Option B would show a reference c below development. Internal validation showed little optimism (0.812), against option D.'
    },
    {
      q: 'Which change between development and validation populations mainly affects the calibration slope while leaving calibration-in-the-large unchanged?',
      options: [
        'Case-control sampling with more cases',
        'More severe patients according to a missed predictor',
        'Truly weaker predictor effects in the validation setting',
        'More severe patients according to the observed predictors'
      ],
      answer: 2,
      why: 'Weaker or differing coefficients (and overfitting) lower the slope with a|b=1 near 0. Case-control sampling and severity in missed predictors shift calibration-in-the-large; severity in observed predictors leaves both calibration measures intact.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Sample size, intercept correction and case-mix overlap by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A team plans to validate a published preeclampsia model and has three questions. Use the critical values 2.80 (two-sided) and 2.49 (one-sided) for 5% type I error and 80% power.</p>
<ul>
<li>Pilot simulations give SEs at 100 events and 100 non-events of 0.16 for calibration-in-the-large and 0.17 for the slope; at 250 events and 250 non-events, 0.11 and 0.10.</li>
<li>A partner hospital offers data from a nested case-control study: a cohort of 3000 women with 360 cases of preeclampsia; all 360 cases and 720 of the 2640 controls were measured. Refitting the model's linear predictor in these data gave an intercept of −0.40.</li>
<li>Predicted-risk bands (five bands) contain 40%, 30%, 15%, 10% and 5% of development women and 25%, 30%, 20%, 15% and 10% of validation women.</li>
</ul>`,
      questions: [
        '<b>(a)</b> For each sample size, calculate the minimum detectable calibration-in-the-large (as log odds and odds ratio) and the minimum detectable slope.',
        '<b>(b)</b> The team wants to detect predictions 1.5 times too high or low in odds and a slope below 0.8. Which sample size suffices? Show the SE each target requires.',
        '<b>(c)</b> Correct the case-control intercept to the cohort.',
        '<b>(d)</b> Calculate the M statistic and interpret it.'
      ],
      answer: `<p><b>(a)</b> 100/100: calibration-in-the-large 2.80 × 0.16 = 0.448, OR = exp(0.448) = 1.57; slope 1 − 2.49 × 0.17 = 1 − 0.42 = 0.58. 250/250: 2.80 × 0.11 = 0.308, OR = 1.36; slope 1 − 2.49 × 0.10 = 0.75. (These agree with the book's power table.)</p>
<p><b>(b)</b> Target ln(1.5) = 0.405 requires SE ≤ 0.405/2.80 = 0.145; target slope 0.8 (difference 0.2) requires SE ≤ 0.2/2.49 = 0.080. At 100/100 the SEs (0.16, 0.17) are too large. At 250/250 the calibration-in-the-large SE (0.11) is sufficient and the detectable slope is 0.75, close to the 0.8 target. So at least 250 events and 250 non-events are needed, and somewhat more (the book table gives slope &lt; 0.83 at 500 events) to detect a slope of 0.8 with full 80% power.</p>
<p><b>(c)</b> Control sampling fraction = 720/2640 = 0.273. Because all cases were included, the sample odds are 1/0.273 = 3.67 times the cohort odds, so the intercept is too high by ln(3.67) = 1.30. Corrected intercept = −0.40 − 1.30 = <b>−1.70</b>. Check: incidence in the sample is 360/1080 = 33.3% versus 12.0% in the cohort, and odds(0.333)/odds(0.120) = 0.500/0.136 = 3.67. Slope and c are unaffected by the sampling.</p>
<p><b>(d)</b> Smaller fractions: 0.25, 0.30, 0.15, 0.10, 0.05; M = 0.85. Below the suggested 0.88, the validation women are shifted towards higher predicted risk. A different c or net benefit at validation may partly reflect case-mix, so reference values should be calculated before judging the coefficients.</p>`
    },
    {
      id: 't2',
      title: 'Explore the patterns in the case-mix lab',
      level: 'Understand',
      scenario: `<p>Open the case-mix lab, which reproduces the book's simulation with one observed predictor x and one missed predictor z (development: c 0.81, perfect calibration, decision threshold 30%).</p>`,
      questions: [
        '<b>(a)</b> Run the four scenarios that select on x (more severe, less severe, more heterogeneous, less heterogeneous). Which measures change and which do not?',
        '<b>(b)</b> Run "more severe z" at x–z correlations 0, 0.33 and 0.5. Describe calibration-in-the-large, slope and net benefit. Why can net benefit turn negative?',
        '<b>(c)</b> Run "overfitted slope 0.6" and "coefficients ×0.25/×1.5". What do they have in common with each other, and how do they differ from "case-control 2:1"?',
        '<b>(d)</b> From your runs, write one sentence each on what disturbs calibration-in-the-large, what disturbs the slope, and what determines clinical usefulness.'
      ],
      answer: `<p><b>(a)</b> Calibration stays perfect (a|b=1 ≈ 0, b ≈ 1) in all four. The c statistic falls for more or less severe selection and for a less heterogeneous population, and rises for a more heterogeneous one. Net benefit falls sharply for the more severe population (few predictions below 30%, so the model rarely changes the "treat all" decision) and rises for the less severe and more heterogeneous ones.</p>
<p><b>(b)</b> Calibration-in-the-large is about +0.7 (roughly twice the predicted odds of events). The slope is about 1, a little above 1 at r = 0 and a little below at r = 0.5, reflecting stratification versus confounding. Net benefit is close to that of treat all and can be below it: women predicted under 30% are sent to "no treatment" although many truly exceed 30%, and this harm outweighs the false positives avoided.</p>
<p><b>(c)</b> Both lower the slope below 1 and reduce c and net benefit, with calibration-in-the-large near 0. Case-control 2:1 shifts only calibration-in-the-large (+0.69) and leaves slope and c unchanged.</p>
<p><b>(d)</b> Calibration-in-the-large is disturbed by differences in missed predictors (severity) and by outcome-dependent sampling. The slope is disturbed by overfitting, truly different coefficients and changes in the heterogeneity of missed predictors. Clinical usefulness depends on discrimination, on calibration and on how predictions are distributed around the decision threshold, so case-mix alone can make a valid model more or less useful.</p>`
    },
    {
      id: 't3',
      title: 'Interpret the preterm-birth external validation',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). The full 14-term preterm-birth model from the district hospital cohort (ptb_dev) is validated in the referral hospital cohort (ptb_val), using complete cases (1107 women, 185 preterm births). One analysis of the synthetic data gave:</p>
<table class="data">
<thead><tr><th>Measure</th><th>Value</th></tr></thead>
<tbody>
<tr><td>Apparent c (development)</td><td>0.727</td></tr>
<tr><td>Bootstrap-corrected c; shrinkage factor (development)</td><td>0.705; 0.90</td></tr>
<tr><td>External c</td><td>0.710</td></tr>
<tr><td>External calibration-in-the-large (SE)</td><td>+0.29 (0.088)</td></tr>
<tr><td>External calibration slope (SE)</td><td>0.76 (0.082)</td></tr>
<tr><td>Reference c in the validation case-mix</td><td>0.763</td></tr>
<tr><td>Refitted c in the validation data</td><td>0.730</td></tr>
</tbody>
</table>
<p>The live course values for this validation are c <span data-live="ptb_val_c"></span>, slope <span data-live="ptb_val_slope"></span> and calibration-in-the-large <span data-live="ptb_val_citl"></span>.</p>`,
      questions: [
        '<b>(a)</b> Interpret calibration-in-the-large and the slope. Is the slope explained by overfitting alone?',
        '<b>(b)</b> Use the reference and refitted c to decide whether the external c reflects case-mix or coefficients.',
        '<b>(c)</b> Map the findings onto the types of difference in this module.',
        '<b>(d)</b> Is this validation sample large enough to detect the miscalibration found? Calculate the minimum detectable calibration-in-the-large and slope from the SEs given.'
      ],
      answer: `<p><b>(a)</b> Calibration-in-the-large +0.29: observed odds of preterm birth are about exp(0.29) = 1.34 times the predicted odds; the model underestimates risk at the referral hospital. The slope 0.76 is below the internal shrinkage factor (0.90): overfitting would explain a slope of about 0.9, so the remaining shortfall suggests that predictor effects are weaker in the referral setting.</p>
<p><b>(b)</b> The reference c (0.763) is higher than development c (0.727): the referral case-mix is more heterogeneous in the model's predictors, so a correct model should discriminate better there. The external c (0.710) is well below the reference, so the shortfall is not due to case-mix in X; it points to coefficients that do not hold. The refitted c (0.730) is also below the reference, confirming that the predictors are less predictive in this setting even with optimal coefficients.</p>
<p><b>(c)</b> In the synthetic data-generating process all three types of difference are present: case-mix in X (older women, more prior preterm birth and chronic hypertension: more heterogeneous predicted risks); a higher baseline risk not explained by the predictors (behaves like a more severe case-mix in missed predictors, producing positive calibration-in-the-large); and true predictor effects 20% weaker (coefficients different, lowering the slope and c), on top of mild overfitting.</p>
<p><b>(d)</b> Minimum detectable calibration-in-the-large = 2.80 × 0.088 = 0.25 (OR 1.28); minimum detectable slope = 1 − 2.49 × 0.082 = 0.80. The observed +0.29 and 0.76 both exceed these, so the study had reasonable power for them. With 185 events (more than 100 events and many more non-events) the sample meets the book's minimum, but smaller invalidity (for example an odds ratio of 1.2) could have gone undetected.</p>`
    }
  ]
});
