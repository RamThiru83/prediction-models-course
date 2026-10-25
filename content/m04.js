registerModule({
  id: 'm04',
  num: 4,
  part: 'Development',
  title: 'Overfitting and optimism',
  book: 'Ch. 5',
  minutes: 75,
  summary: 'Why a model always looks better in the data used to build it, the two causes of overfitting (model uncertainty and parameter uncertainty), shrinkage as the remedy, and how the bootstrap estimates and corrects optimism.',
  objectives: [
    'Define overfitting, apparent performance, true performance and optimism.',
    'Explain why observed event rates from small units are too extreme as predictions and why shrinkage towards the mean improves them.',
    'Calculate the expected size of testimation bias for a predictor selected by a significance test.',
    'Distinguish model uncertainty from parameter uncertainty and relate each to its consequences.',
    'Carry out the steps of bootstrap optimism correction, including replaying predictor selection, and calculate an optimism-corrected c statistic.',
    'Evaluate a published model for signs that its reported performance is optimistic.'
  ],
  sections: [
    {
      id: 's1',
      title: 'What you see may not be what you get',
      html: `
<p>We develop a model on a <b>sample</b> of patients only because the sample represents an underlying <b>population</b>. The model is useful if it predicts well for <b>new</b> patients from that population. The danger is that the model describes the sample very well, including its chance peculiarities, while its predictions do not generalise. This is <b>overfitting</b>.</p>
<p>For prediction models, overfitting can be defined precisely as fitting a model with too many <b>degrees of freedom in the modelling process</b>. Degrees of freedom are used not only by estimating coefficients but also by every data-driven decision about the model's structure: selecting predictors from a larger list of candidates, choosing how to code them, searching for cut-points, and trying non-linear transformations or interactions.</p>
<div class="formula">Optimism = apparent performance − true performance</div>
<ul>
<li><b>Apparent performance</b>: performance measured in the same sample that was used to develop the model.</li>
<li><b>True performance</b>: performance in the underlying population, that is, in new patients like those in the sample.</li>
<li><b>Optimism</b>: the gap between the two. With overfitting, apparent performance is better than true performance; the book's phrase is "what you see may not be what you get". The book defines optimism as the difference between true and apparent performance; written as above it is a positive number: the amount by which the apparent result flatters the model.</li>
</ul>
<table class="data">
<thead><tr><th>Issue</th><th>What it means</th></tr></thead>
<tbody>
<tr><td colspan="2"><b>Causes of overfitting</b></td></tr>
<tr><td>Model uncertainty</td><td>The structure of the model is not prespecified but determined by the data under study (for example, which predictors are kept).</td></tr>
<tr><td>Parameter uncertainty</td><td>Even with a fixed structure, each coefficient is estimated with error, which makes predictions too extreme.</td></tr>
<tr><td colspan="2"><b>Consequences of overfitting</b></td></tr>
<tr><td>Testimation bias</td><td>Effects of predictors are overestimated because they were selected after passing a statistical test.</td></tr>
<tr><td>Optimism</td><td>Performance in new patients is worse than in the development sample.</td></tr>
</tbody></table>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A preterm-birth model developed in one district hospital reports c = 0.86 in its own 600 women. The same model, applied to the next 600 women at the same hospital, achieves c = 0.74. The hospital, the outcome definition and the measurement of predictors are unchanged: the drop is optimism, the price of having fitted chance patterns in the first sample.</p></div>
<p class="src">Source: Ch. 5, §5.1, Table 5.1</p>`
    },
    {
      id: 's2',
      title: 'Chance in small samples, regression to the mean and shrinkage',
      html: `
<p>The simplest example of overfitting involves no regression at all: predicting an outcome rate by unit (hospital, clinic, district) from the rate observed in that unit.</p>
<h3>Variability within one unit</h3>
<p>Suppose every patient has the same true risk of 10%. The number of events in a sample of n patients then follows a <b>binomial distribution</b>. With n = 20, the expected number of events is 2, but only about 28.5% of samples will show exactly 2 events (an observed rate of 10%). About 12% of samples will show 0 events (0%), and about 13% will show 4 or more (20% or higher). With n = 200, about 71% of samples give an observed rate between 8% and 12%.</p>
<div data-widget="samplingDemo"></div>
<ul class="try">
<li>Keep the true risk at 12%, set n = 20 and press "Draw 200 samples". Note how wide the 2.5–97.5 percentile range of observed risk is.</li>
<li>Increase n to 200 and then 1,000 and repeat. Observe how the range narrows as n increases.</li>
</ul>
<h3>Variability between units</h3>
<div class="callout book"><b>Book example: oesophagectomy mortality</b><p>For surgical resection of the oesophagus, 30-day mortality in a large registry was 221 of 2,031 patients (10.9%). Simulating 100 centres with 20 patients each and a true mortality of 10% everywhere, about 12% of centres would report 0% mortality and 13% would report 20% or more, purely by chance.</p></div>
<p>If true rates do differ between units, the spread of true rates is described by a <b>heterogeneity</b> parameter τ (tau), the standard deviation of the true rates. With τ = 2%, 95% of centres have true mortality between 6% and 14%. The observed rates are then spread more widely than the binomial alone would produce, but they are still spread far more widely than the true rates when each centre has few patients.</p>
<div class="callout key"><b>Key idea: shrinkage</b><p>Each centre's observed rate is an unbiased estimate of that centre's true rate, yet the set of observed rates is too extreme: the lowest observed rates are, on average, too low and the highest too high. This is <b>regression to the mean</b>. Better predictions are obtained by <b>shrinking</b> each unit's estimate towards the overall mean, more strongly when units are small and when true heterogeneity is small. With 200 patients per centre the problem is much reduced.</p></div>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A state ranks 100 primary health centres by their postpartum haemorrhage rate, each based on about 20 deliveries per quarter. The "worst" ten centres this quarter will, on average, look better next quarter without any intervention, and the "best" ten will look worse. A quality-improvement programme evaluated only in the worst centres would appear to work even if it did nothing.</p></div>
<p class="src">Source: Ch. 5, §5.1.1–5.1.4</p>`
    },
    {
      id: 's3',
      title: 'Model uncertainty and testimation bias',
      html: `
<p>Most analyses search for the model structure in the data and then report results as if the final model had been specified in advance. The uncertainty created by the search, <b>model uncertainty</b>, is ignored. Its main result is a form of selection bias: here "selection" means selection of predictors, not of patients.</p>
<h3>Noise predictors</h3>
<p>Suppose 20 candidate predictors are pure noise (true coefficients zero). At p &lt; 0.05, on average one of them will be statistically significant (20 × 0.05 = 1). Its estimated effect will necessarily be relatively large, positive or negative, otherwise it would not have been significant. If we keep it, the model contains a spurious effect of considerable size.</p>
<h3>True predictors: testimation bias</h3>
<p>For a true predictor, the estimate varies from sample to sample around the true value. If we include the predictor only when its estimate is large enough to pass a test, the estimates we keep are, on average, too large. Because we <b>test</b> before we <b>estimate</b>, this is called <b>testimation bias</b>. Formally: if b is significant, use b; otherwise set b = 0.</p>
<div class="callout eg"><b>Worked example: true coefficient 1, standard error 0.5 (book example)</b>
<ol>
<li>Two-sided significance at p &lt; 0.05 requires |b| &gt; 1.96 × 0.5 = 0.98.</li>
<li>The estimate b is approximately normal with mean 1 and SD 0.5. P(b &gt; 0.98) = P(Z &gt; (0.98 − 1)/0.5) = P(Z &gt; −0.04) = 0.516. P(b &lt; −0.98) is negligible. So about 52% of studies would find the predictor significant.</li>
<li>The mean of the estimates in those 52% of studies is 1.39 (the mean of a normal distribution truncated below at 0.98).</li>
<li>Bias = (1.39 − 1)/1 = +39%. Half the time the predictor is dropped altogether; the other half its effect is overestimated by about 40%.</li>
</ol>
<p>For a weaker predictor (true coefficient 0.5, SE 0.5) only about 17% of samples are significant and their mean estimate is about 1.23, more than double the truth.</p></div>
<div data-widget="testimationSim"></div>
<ul class="try">
<li>With the defaults (β = 1, SE = 0.5, p = 0.05), compare the share significant and the mean estimate among significant results with the book's 52% and 1.39.</li>
<li>Reduce the SE to 0.2 (a larger study). Note how the bias almost disappears because nearly every sample is significant.</li>
<li>Return to SE = 0.5 and change the selection threshold to p = 0.20 and then p = 0.50. Observe how a more liberal threshold reduces the bias.</li>
<li>Look at the plot of mean selected estimate against β/SE and identify where bias is largest.</li>
</ul>
<p>Testimation bias is small when effects are strong relative to their SE (large samples, strong predictors), and it is absent when the model is <b>prespecified</b> (the "full model": all candidate predictors kept regardless of significance).</p>
<h3>Other data-driven decisions that create the same bias</h3>
<ul>
<li>Choosing an "optimal" cut-point for a continuous predictor, such as the Hb value that best separates preterm and term births.</li>
<li>Testing transformations, for example adding a square term and keeping it only if significant.</li>
<li>Merging categories that appear to have similar outcomes.</li>
<li>Informal versions of all of these: looking at plots of outcome against several codings and picking the one that looks best.</li>
</ul>
<p class="src">Source: Ch. 5, §5.2.1–5.2.2, Fig. 5.5</p>`
    },
    {
      id: 's4',
      title: 'Parameter uncertainty: why even prespecified models overfit',
      html: `
<p>Suppose the model structure is fully prespecified. Standard estimation (least squares, maximum likelihood) gives nearly unbiased estimates of each coefficient. Surprisingly, the <b>predictions</b> are still too extreme when several predictors are combined.</p>
<p>The intuition: the linear predictor is a sum of coefficient × value terms, and every coefficient carries estimation error. Patients who end up with the highest linear predictors are disproportionately those for whom the errors happened to push upwards; the lowest are those pushed downwards. On average, low predictions are too low and high predictions are too high in new patients. This is again <b>regression to the mean</b>.</p>
<div class="callout key"><b>Key idea: shrinkage and the bias–variance trade-off</b><p>Shrinking coefficients towards zero introduces bias in each coefficient but reduces the variance of predictions. If shrinkage is chosen well, the gain in precision more than offsets the bias. That biased estimates can give better predictions is related to <b>Stein's paradox</b>. The bias–variance trade-off runs through all of prediction modelling; methods for shrinkage are covered in a later module.</p></div>
<h3>How overfitting shows in new patients: the calibration slope</h3>
<p>Take the model's linear predictor lp and, in new patients, fit <span class="m">logit(y) = a + b × lp</span>. The coefficient b is the <b>calibration slope</b>. In the development data it is 1 by construction. In new patients:</p>
<ul>
<li>b = 1: predictions have the right spread.</li>
<li>b &lt; 1: predictions are too extreme (high risks too high, low risks too low), the typical signature of overfitting.</li>
<li>b &gt; 1: predictions are too modest.</li>
</ul>
<p>A slope of 0.8, for example, means that the model's log-odds deviations from average should be multiplied by 0.8 to be correct on average.</p>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A model for low birthweight built on 60 events and 12 predictors predicts 2% for the lowest-risk tenth of women and 55% for the highest-risk tenth. In the next year's women, the observed rates in these groups are 5% and 38%. The ranking is still informative, but the predictions are too spread out: a calibration slope below 1.</p></div>
<p class="src">Source: Ch. 5, §5.2.3</p>`
    },
    {
      id: 's5',
      title: 'Seeing optimism in performance measures',
      html: `
<p>Overfitting shows in performance measures such as R² (explained variation) and the c statistic (the probability that a patient with the outcome has a higher predicted risk than one without). These measures are computed in the development data and so are optimistic.</p>
<div class="callout book"><b>Book example: R² from pure noise</b><p>A logistic model with 20 centres (19 dummy variables) was fitted when true mortality was 10% in every centre, so the true R² was 0%. The apparent Nagelkerke R² was 9.4% with 20 patients per centre, 1.0% with 200 and 0.1% with 2,000 per centre. With a true spread of mortality between 6% and 14% (τ = 2%), true R² was close to 1%, yet the apparent R² was 10.1% with 20 patients per centre.</p></div>
<h3>Model complexity versus performance</h3>
<p>In a simulation of linear models fitted to samples of 50 patients, the apparent error kept falling as predictors were added (1 to 10). Error in new patients from the same population (internal) and from a slightly different population (external) stopped improving at about five predictors and then worsened. Optimism grew from modest with one predictor to substantial with ten.</p>
<h3>A simple correction: adjusted R²</h3>
<p>The degrees of freedom spent can be subtracted from the LR statistic:</p>
<div class="formula">R²<sub>adj</sub> = (1 − e<sup>−(LR − df)/n</sup>) / (1 − e<sup>−(−2 LL<sub>0</sub>)/n</sup>)</div>
<p>In the pure-noise centre simulations the average adjusted R² was 0, with about half of the values negative, as it should be. The adjustment works only for a prespecified model whose df are known. It cannot account for df spent invisibly on selection and coding decisions; the bootstrap can.</p>
<h3>Events, not patients, determine the risk</h3>
<p>For a binary outcome, the information in the data is driven mainly by the number of events (the smaller outcome group). A common summary is <b>events per variable (EPV)</b>: events divided by the number of candidate predictor degrees of freedom. Models built with an EPV below 10 are overfitted and may perform worse than a simpler model (Ch. 3). Above 10 the risk is smaller but not absent, so optimism should still be estimated.</p>
<div data-widget="optimismSim"></div>
<ul class="try">
<li>Set n = 200, incidence 10%, 2 true predictors and 0 noise predictors; run 40 simulations. Compare the mean apparent c with the mean c in the large fresh sample, and note the calibration slope.</li>
<li>Add 20 noise predictors with the same n. Observe the change in EPV, the gap between apparent and honest c, and the calibration slope.</li>
<li>Keep 20 noise predictors and raise n to 2,000. Observe how the gap and the slope change.</li>
<li>Set true predictors to 0 and noise predictors to 10 at n = 200. The honest c should be near 0.5; note the apparent c.</li>
</ul>
<p class="src">Source: Ch. 5, §5.2.4–5.2.5, Table 5.2, Fig. 5.6; Ch. 3, §3.8.3 (EPV)</p>`
    },
    {
      id: 's6',
      title: 'The bootstrap',
      html: `
<p>The <b>bootstrap</b> estimates the sampling distribution of any statistic by resampling the data we have. A bootstrap sample is drawn <b>with replacement</b> from the original sample and has the <b>same size</b> as the original. Some patients appear once, some twice or more, and some not at all. Repeating this many times mimics drawing repeated samples from the population.</p>
<div class="callout eg"><b>Worked example (book example)</b><p>Original sample of five ages: 20, 25, 30, 32, 35. Possible bootstrap samples (sorted): 20, 20, 30, 32, 35; 20, 25, 25, 30, 35; 25, 32, 35, 35, 35. Each has five values drawn from the original five.</p></div>
<h3>The 63.2% rule</h3>
<p>The chance that a particular patient is never drawn in n draws is (1 − 1/n)<sup>n</sup>, which approaches e<sup>−1</sup> = 0.368 as n grows. So on average a patient appears at least once in a bootstrap sample with probability 1 − 0.368 = 63.2% (for n = 429, 63.25%). The remaining 36.8% are "left out" of that sample.</p>
<h3>Uses of the bootstrap</h3>
<ul>
<li><b>Standard errors and confidence intervals</b> for statistics without a simple formula (for example a median, or the difference between an adjusted and an unadjusted coefficient).</li>
<li>Three ways to form a 95% CI: <b>normal approximation</b> (estimate ± 1.96 × SD of the bootstrap estimates); <b>percentile</b> (the 2.5th and 97.5th percentiles, for example the 50th and 1,950th of 2,000 ordered estimates); and the <b>bias-corrected (BCa)</b> percentile method. At least 2,000 replications are advisable for the percentile-based methods.</li>
<li><b>Optimism correction</b> of model performance, the most important use in prediction research (next section).</li>
</ul>
<p>The sampling widget in section 2 also has a "One bootstrap" button. Try the following there.</p>
<ul>
<li>In that widget, draw samples at n = 100, then press "One bootstrap". Compare the spread of the bootstrap distribution of observed risk with the spread across the 200 real samples.</li>
<li>Read the share of original subjects appearing at least once and compare it with 63.2%.</li>
</ul>
<p class="src">Source: Ch. 5, §5.3–5.3.2, Table 5.3</p>`
    },
    {
      id: 's7',
      title: 'Bootstrap optimism correction, step by step',
      html: `
<p>A naive approach fits models in bootstrap samples and tests them in the original sample. A more accurate approach uses the bootstrap to estimate the <b>optimism</b> and subtracts it from the apparent performance.</p>
<div class="formula">Optimism = mean over B of (bootstrap performance − test performance)</div>
<div class="formula">Optimism-corrected performance = apparent performance − optimism</div>
<ol>
<li>Develop the model in the original sample; record its <b>apparent performance</b> in that sample.</li>
<li>Draw a bootstrap sample (Sample*) with replacement from the original sample.</li>
<li>Develop a model (Model*) in Sample*, <b>replaying every modelling step</b> done in the original sample, especially predictor selection, coding choices and shrinkage. Record the <b>bootstrap performance</b>: Model* evaluated in Sample*.</li>
<li>Apply Model* unchanged to the original sample: the <b>test performance</b>.</li>
<li>Optimism for this replicate = bootstrap performance − test performance.</li>
<li>Repeat steps 2–5 many times, at least 100, for a stable estimate.</li>
<li>Subtract the mean optimism from the apparent performance.</li>
</ol>
<p>Testing Model* on the original sample, which largely overlaps Sample*, may look invalid, but theoretical and empirical work supports the procedure. Variants called .632 and .632+ test only on patients left out of each bootstrap sample (on average 36.8%); they showed no clear advantage in empirical studies. The approach works for any measure: R², the c statistic and the calibration slope. For the slope, the apparent and bootstrap values are 1, so the corrected slope is 1 − (1 − mean test slope) = mean test slope, an estimate of the shrinkage needed.</p>
<div class="callout book"><b>Book example: GUSTO-I subsample, 429 patients (Nagelkerke R²)</b>
<table class="data"><thead><tr><th>Strategy</th><th>Apparent</th><th>Bootstrap</th><th>Test</th><th>Optimism</th><th>Corrected</th></tr></thead>
<tbody>
<tr><td>Full 8-predictor model</td><td>22.7%</td><td>24.7%</td><td>17.2%</td><td>7.6%</td><td>15.1%</td></tr>
<tr><td>Backward stepwise, p &lt; 0.05 (3 predictors), selection replayed</td><td>17.6%</td><td>18.7%</td><td>12.7%</td><td>5.9%</td><td>11.7%</td></tr>
<tr><td>Same 3-predictor model, falsely treated as prespecified</td><td>17.6%</td><td>18.2%</td><td>15.4%</td><td>2.9%</td><td>14.7%</td></tr>
</tbody></table>
<p>Treating the stepwise model as prespecified halved its estimated optimism; the optimism from selection was as large as that from parameter uncertainty. After honest correction the full model (15.1%) beat the stepwise model (11.7%). Optimism values are as reported; small differences from the column subtraction reflect rounding.</p></div>
<div class="callout warn"><b>Critical: validate the whole process, not the final formula</b><p>If selection, cut-point searches or other data-driven steps are not repeated inside every bootstrap sample, the bootstrap underestimates optimism and the "corrected" performance is still optimistic. Only a fully specified strategy can be replayed. Subtle steps (informal coding choices, looking at plots) usually cannot be replayed, so the corrected estimate is then an upper bound on what to expect.</p></div>
<p>Two further practical points. It is often useful to compute the optimism of the full model first; large optimism is a warning not to rely on the data at hand alone. And a full model performs especially well relative to stepwise selection when selection would drop several nearly significant predictors with some true value; if a few dominant predictors exist, both approaches give similar results.</p>
<p class="src">Source: Ch. 5, §5.3.3–5.3.5, Table 5.4</p>`
    },
    {
      id: 's8',
      title: 'The cost of data analysis',
      html: `
<p>Model development is a continuing balance between fitting the data better and generalising beyond them. The more we take from a specific data set, the less the model may generalise: the <b>cost of data analysis</b>. Yet ignoring a clear pattern, such as a strongly non-linear effect, also harms predictions. Checking assumptions is natural; repeatedly adapting the model to capture every small violation makes it specific to the sample.</p>
<div class="callout book"><b>Book example: generalised degrees of freedom</b><p>Ye proposed measuring the effective degrees of freedom of a whole modelling procedure by its overfitting. A stepwise procedure that ended with 5 predictors (apparent df 5) had 14.1 generalised df. A regression tree with 19 nodes (apparent df 19) had 76.</p></div>
<h3>Practical implications</h3>
<ul>
<li><b>Sample size.</b> With few events, accept more assumptions. Power to detect violations is low anyway, and adapting the model after a detected violation introduces testimation bias without necessarily improving predictions.</li>
<li><b>Robust strategies.</b> Some strategies are data hungry. A prespecified logistic model with age and parity spends 2 df; testing non-linearity of age and an age × parity interaction spends more; a tree searches cut-points and interactions by default; stepwise selection asks the data both which predictors to include and what their coefficients are.</li>
<li><b>Bootstrap validation</b> helps judge how much fine-tuning is justified, but when many alternative strategies are compared, the winner may again be specific to the sample. The bootstrap works best for estimating the optimism of a single, predefined strategy.</li>
<li><b>Prespecify candidate predictors</b> using subject knowledge (literature, expert opinion) so that pure noise variables are not considered.</li>
</ul>
<div class="callout warn"><b>Pitfall: reporting apparent performance alone</b><p>A paper that reports only the c statistic in the development data, after stepwise selection from many candidates in a small sample, gives no information about performance in new patients. Without internal validation that replays the selection, the reported value should be read as an upper limit.</p></div>
<p>Science needs both curiosity and scepticism: discoveries must be subjected to stringent tests, such as validation, to make sure chance has not fooled us.</p>
<p class="src">Source: Ch. 5, §5.4–5.5</p>`
    }
  ],
  keyPoints: [
    'Optimism is the amount by which apparent performance in the development data exceeds true performance in new patients.',
    'Overfitting arises from model uncertainty (data-driven structure) and parameter uncertainty (estimation error in coefficients).',
    'Observed rates in small units are too extreme as predictions; shrinkage towards the mean corrects this regression to the mean.',
    'Selecting predictors by significance inflates their effects: true β = 1 with SE 0.5 gives 52% significant and a mean selected estimate of 1.39 (+39%).',
    'Even prespecified models give too-extreme predictions; in new data this shows as a calibration slope below 1.',
    'A bootstrap sample has the same size as the original, drawn with replacement; each patient appears at least once with probability 63.2%.',
    'Bootstrap optimism correction = apparent − mean(bootstrap − test performance), with every modelling step replayed in each bootstrap sample.',
    'Falsely treating a selected model as prespecified underestimates optimism; the bootstrap works best for one predefined strategy.'
  ],
  quiz: [
    {
      q: 'A model has an apparent c statistic of 0.82. Bootstrap validation (200 replications, selection replayed) gives a mean bootstrap c of 0.84 and a mean test c of 0.77. What is the optimism-corrected c?',
      options: ['0.77', '0.80', '0.75', '0.84'],
      answer: 2,
      why: 'Optimism = 0.84 − 0.77 = 0.07; corrected c = 0.82 − 0.07 = 0.75. Choosing 0.77 uses the average test performance directly, which is the less accurate simple bootstrap; 0.80 subtracts the wrong difference (0.84 − 0.82).'
    },
    {
      q: 'Twenty candidate predictors in a preterm-birth study are, in truth, unrelated to the outcome. How many would you expect to be significant at p < 0.05, and what will their estimated effects look like?',
      options: ['About 1; its estimated effect will be relatively large', 'None; noise variables cannot reach significance', 'About 1; its estimated effect will be close to zero', 'About 5; their effects will average out to zero'],
      answer: 0,
      why: '20 × 0.05 = 1 expected false positive. To be significant, its estimate must be far from zero, so the selected effect is relatively extreme even though the average of all its possible estimates is zero. Option 3 forgets that significance requires a large estimate.'
    },
    {
      q: 'Which situation produces little or no testimation bias?',
      options: ['A weak predictor selected at p < 0.05 in a small sample', 'A predictor kept only when its square term is not significant', 'A prespecified full model in which all candidate predictors are retained regardless of p-values', 'A cut-point for haemoglobin chosen to maximise the chi-square statistic'],
      answer: 2,
      why: 'Testimation bias arises from selecting effects that passed a test; with a prespecified model there is no selection. Options 1, 2 and 4 all involve data-driven choices that favour chance-inflated estimates. Note that a prespecified model still has parameter uncertainty.'
    },
    {
      q: 'A model is validated in new patients from the same hospital and the calibration slope is 0.70. What does this indicate?',
      options: ['Predictions are too modest; high risks should be higher', 'Predictions are too extreme; the model was probably overfitted', 'The average predicted risk is 30% too high', 'Discrimination is 30% lower than in development'],
      answer: 1,
      why: 'A slope below 1 means the spread of the linear predictor is too large: high predictions are too high and low ones too low, the typical consequence of overfitting. The slope says nothing directly about the average level of risk (that is calibration-in-the-large) and is not a percentage loss in c. Option 1 describes a slope above 1.'
    },
    {
      q: 'In a bootstrap sample drawn from 1,000 women, about how many distinct women from the original sample will appear at least once?',
      options: ['368', '500', '1,000', '632'],
      answer: 3,
      why: 'Each woman is missed with probability (1 − 1/1000)^1000 ≈ e^−1 = 0.368, so about 63.2% (632) appear at least once; the sample still has 1,000 records because some women appear more than once. 368 is the number expected to be left out.'
    },
    {
      q: 'A team develops a neonatal model by univariate screening, then backward stepwise selection, then bootstraps the final 4-predictor model as if it had been specified in advance. What is the consequence?',
      options: ['The optimism is underestimated because model uncertainty from screening and selection is ignored', 'The optimism is overestimated because the bootstrap double-counts selection', 'The estimate is unbiased because the final model is what will be used', 'The bootstrap cannot be applied to stepwise models at all'],
      answer: 0,
      why: 'Every data-driven step must be replayed in each bootstrap sample. In the book example, treating a stepwise model as prespecified gave an optimism of 2.9% instead of 5.9% in R². Option 3 is the common misconception: we validate the modelling process, not just the final formula. Stepwise selection can be replayed, so option 4 is wrong.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Calculate optimism-corrected performance',
      level: 'Apply',
      scenario: `<p><b>Illustrative (synthetic).</b> A gestational diabetes model with 8 prespecified predictors is developed in 1,500 women (255 events). The apparent c statistic is 0.792. Five bootstrap replications are shown below (in practice at least 100 are needed).</p>
<table class="data"><thead><tr><th>Replication</th><th>c of Model* in Sample* (bootstrap)</th><th>c of Model* in original sample (test)</th><th>Calibration slope of Model* in original sample</th></tr></thead>
<tbody>
<tr><td>1</td><td>0.811</td><td>0.771</td><td>0.84</td></tr>
<tr><td>2</td><td>0.806</td><td>0.779</td><td>0.90</td></tr>
<tr><td>3</td><td>0.819</td><td>0.764</td><td>0.79</td></tr>
<tr><td>4</td><td>0.801</td><td>0.775</td><td>0.88</td></tr>
<tr><td>5</td><td>0.814</td><td>0.768</td><td>0.84</td></tr>
</tbody></table>
<p>A second analyst instead selected 4 of the 8 predictors by backward stepwise selection (apparent c 0.781). Replaying the selection in each bootstrap sample gave mean bootstrap c 0.806 and mean test c 0.752. Bootstrapping the final 4-predictor model as if prespecified gave 0.789 and 0.773.</p>`,
      questions: [
        '<b>(a)</b> Calculate the optimism in c for each replication, the mean optimism and the optimism-corrected c for the 8-predictor model.',
        '<b>(b)</b> Calculate the optimism-corrected calibration slope and interpret it.',
        '<b>(c)</b> Calculate the optimism-corrected c for the stepwise model under both bootstrap approaches. Which is correct, and which model would you prefer?',
        '<b>(d)</b> Why is the mean bootstrap c (0.810) higher than the apparent c (0.792)?'
      ],
      answer: `<p><b>(a)</b> Optimism per replication: 0.811 − 0.771 = 0.040; 0.806 − 0.779 = 0.027; 0.819 − 0.764 = 0.055; 0.801 − 0.775 = 0.026; 0.814 − 0.768 = 0.046. Mean optimism = 0.194 / 5 = 0.0388. Corrected c = 0.792 − 0.039 = 0.753.</p>
<p><b>(b)</b> The apparent slope and each bootstrap slope are 1 by definition. Mean test slope = (0.84 + 0.90 + 0.79 + 0.88 + 0.84) / 5 = 0.85. Optimism in slope = 1 − 0.85 = 0.15; corrected slope = 1 − 0.15 = 0.85. In new women from the same population, predictions are expected to be somewhat too extreme; multiplying the coefficients by about 0.85 (and re-estimating the intercept) would be expected to correct this. This is the logic behind the shrinkage methods of a later module.</p>
<p><b>(c)</b> Selection replayed: optimism = 0.806 − 0.752 = 0.054; corrected c = 0.781 − 0.054 = 0.727. Falsely prespecified: optimism = 0.789 − 0.773 = 0.016; corrected c = 0.781 − 0.016 = 0.765. Only the first is honest, because the selection was data-driven and must be repeated in every bootstrap sample. Honestly corrected, the full model (0.753) outperforms the stepwise model (0.727), the same pattern as the book's GUSTO-I example.</p>
<p><b>(d)</b> Some women appear several times in a bootstrap sample, so the model fitted there finds the outcomes of those duplicated women easier to predict; its apparent performance in its own sample is therefore higher. The book notes this pattern is common in bootstrap validation.</p>`
    },
    {
      id: 't2',
      title: 'Simulate overfitting and testimation',
      level: 'Analyze',
      scenario: `<p>Use the <b>optimismSim</b> and <b>testimationSim</b> widgets.</p>`,
      questions: [
        '<b>(a)</b> In optimismSim, fix 3 true predictors, incidence 10% and 10 noise predictors. Run 40 simulations at n = 200, 500 and 2,000. Tabulate EPV, mean apparent c, mean c in the fresh sample and mean calibration slope. Describe the pattern.',
        '<b>(b)</b> At n = 300 and incidence 10%, compare 0 noise predictors with 30 noise predictors. What does adding noise do to apparent c, honest c and the slope?',
        '<b>(c)</b> In testimationSim, keep SE = 0.5 and p = 0.05 and vary the true β from 0.25 to 2. Where is the percentage bias largest, and why does it fall at both extremes of β/SE?',
        '<b>(d)</b> Use your results to argue for or against the claim: "with EPV ≥ 10 overfitting is not a concern".'
      ],
      answer: `<p><b>(a)</b> Expected pattern: at n = 200 (about 20 events, EPV about 1.5 for 13 parameters) the apparent c is clearly higher than the honest c in the fresh sample and the calibration slope is well below 1. As n increases to 500 and 2,000, EPV rises, the apparent and honest c converge and the slope approaches 1. Overfitting is a small-sample problem relative to the number of parameters, and it is driven by events rather than total n.</p>
<p><b>(b)</b> Adding 30 noise predictors raises the apparent c (noise can always be fitted) while the honest c falls, so the gap (optimism) widens markedly; the calibration slope falls further below 1 because the extra coefficients add estimation error to the linear predictor. Noise predictors cost performance mainly through overfitting.</p>
<p><b>(c)</b> The percentage bias is largest for small β/SE (weak effects relative to their precision): only samples with chance-inflated estimates pass the test, so the mean selected estimate is far above the truth (for β = 0.5 more than double). For large β/SE almost every sample is significant, so there is little selection and little bias. The book notes that the bias is largest for relatively weak effects, as is common in medical research.</p>
<p><b>(d)</b> Against. EPV ≥ 10 is a minimum below which overfitting is severe; above it the optimism and slope deficit are smaller but not zero, as the simulations show at moderate EPV. Testimation bias also depends on β/SE and on whether selection is done. Optimism should therefore be estimated (for example by bootstrap) rather than assumed absent.</p>`
    },
    {
      id: 't3',
      title: 'Critique a published preterm-birth model',
      level: 'Evaluate',
      scenario: `<p><b>Illustrative (synthetic).</b> An abstract reports: "We developed a preterm-birth prediction tool in 520 women attending a single antenatal clinic, of whom 64 delivered before 37 weeks. From 42 candidate variables, we selected those with univariate p &lt; 0.10, then applied forward stepwise selection (p &lt; 0.05), yielding six predictors including an optimal Hb cut-off of 9.7 g/dL, chosen as the value that best separated preterm from term births. The model showed excellent performance (c = 0.88; Hosmer–Lemeshow p = 0.61). Internal validation by bootstrapping the final six-predictor model confirmed stability (optimism 0.01). The odds ratio for Hb &lt; 9.7 g/dL was 4.9, suggesting a strong new risk factor."</p>`,
      questions: [
        '<b>(a)</b> List the sources of overfitting in this study and classify each as model uncertainty or parameter uncertainty.',
        '<b>(b)</b> Explain why the reported optimism of 0.01 is not credible and how the bootstrap should have been done.',
        '<b>(c)</b> What would you expect to happen to the c statistic, the calibration slope and the Hb odds ratio in new women from the same clinic?',
        '<b>(d)</b> Suggest a more robust development strategy for these data.'
      ],
      answer: `<ol>
<li><b>(a) Sources.</b> Model uncertainty: 42 candidates with only 64 events (EPV about 1.5 per candidate); univariate screening at p &lt; 0.10; forward stepwise selection; a data-searched "optimal" Hb cut-point. Parameter uncertainty: six coefficients estimated from 64 events, which makes predictions too extreme even if the structure were fixed. A single small clinic adds the risk that findings do not transport.</li>
<li><b>(b) Bootstrap.</b> Bootstrapping only the final model treats it as prespecified and ignores the optimism created by screening, stepwise selection and the cut-point search. The book's example shows that this can halve the estimated optimism. Every step (univariate screening, stepwise selection, cut-point search, model fitting) should have been replayed in each bootstrap sample, at least 100 times, and the mean optimism subtracted from the apparent c. A non-significant Hosmer–Lemeshow test in development data says little about future calibration.</li>
<li><b>(c) Expectations.</b> The c statistic will be lower than 0.88, possibly substantially; the calibration slope will be below 1 (predictions too extreme); the Hb odds ratio of 4.9 is subject to testimation bias from both selection and cut-point optimisation and is likely to be smaller in new women. The cut-point itself (9.7 g/dL) will probably not reproduce.</li>
<li><b>(d) Strategy.</b> Restrict candidates on subject knowledge and literature to a small number (for example previous preterm birth, short inter-pregnancy interval, bacteriuria, chronic hypertension, tobacco, Hb, BMI) so that EPV is reasonable; keep Hb continuous with a prespecified, sensible coding; fit a prespecified full model; estimate optimism with a bootstrap of the whole procedure and consider shrinkage of the coefficients; report calibration as well as discrimination; seek validation in other clinics. Claims about a "new risk factor" belong to aetiological research, not to an overfitted prediction model.</li>
</ol>`
    }
  ]
});
