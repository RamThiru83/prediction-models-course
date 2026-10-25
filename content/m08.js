registerModule({
  id: 'm08',
  num: 8,
  part: 'Development',
  title: 'Selecting main effects',
  book: 'Ch. 11',
  minutes: 65,
  summary: 'Why reducing a model with significance tests is attractive and what it costs: instability of the selected set, biased coefficients, exaggerated p-values and worse predictions, with the alternatives of a pre-specified full model and modern methods.',
  objectives: [
    'State which arguments for a smaller model are valid and which are false (non-significance, collinearity, parsimony).',
    'Describe forward, backward and all-subsets selection and translate AIC and BIC stopping rules into p-values.',
    'Explain, with numbers, the four disadvantages of stepwise selection: unstable selection, biased coefficients, misspecified variability and worse predictions.',
    'Calculate the share of significant estimates and the mean selected estimate for a given true effect and standard error.',
    'Apply the guidance on events per variable for fitting versus selecting.',
    'Outline bootstrap selection, bagging, Bayesian model averaging and the Lasso as alternatives.'
  ],
  sections: [
    {
      id: 's1',
      title: 'Reduction before modelling versus while modelling, and collinearity',
      html: `
<p>Specifying the model is the hardest part of prediction modelling. Especially in smaller datasets it is nearly impossible to obtain a reliable answer to the question "which predictors are important and which are not". The previous module described how to cut down the candidate list without looking at the outcome. If that is done well, predictive modelling becomes an estimation problem rather than a testing problem. The ideal outcome is a limited list of candidates that can all be entered into a <b>full model</b>: a model containing the main effects of all candidate predictors. Checks of assumptions such as additivity (interactions) and linearity (non-linear terms) are then the next step (Module 9).</p>
<h3>Reasons to reduce the model while modelling</h3>
<ul>
<li><b>Practicality.</b> It may be impractical to collect or enter a large set of predictors, in particular if some will not be available in future patients or are costly to obtain.</li>
<li><b>Implausible or very small effects.</b> Some predictors may have negligible or biologically implausible effects. For example, when predicting valve fracture from production characteristics, it was unclear which characteristics were relevant at all.</li>
<li><b>Discovery.</b> In genetic and proteomic research, identifying which markers from a very large panel are predictive is itself the aim. Such analyses are exploratory and aimed more at biological knowledge than at prediction.</li>
</ul>
<h3>Collinearity</h3>
<p><b>Collinearity</b> means that predictors are strongly correlated with each other. Its effect is to make the coefficients of the correlated variables imprecise. The <b>variance inflation factor</b> (VIF) measures how much the variance of a coefficient is inflated by the correlation; the book mentions correlation above 0.8 or a VIF above 10 as the level where trouble starts. Is this a worry for prediction models?</p>
<ul>
<li>Correlation between predictors is the reason multivariable models are used at all, to estimate joint effects that a univariable analysis cannot show.</li>
<li>In practice most correlations are less than 0.5. In GUSTO-I the strongest was between height and weight (r = 0.5), and the rest were around 0.1 to 0.2.</li>
<li>Some correlation is created by the analyst, for example between age and age² (r above 0.9), yet their coefficients can be estimated quite reliably.</li>
</ul>
<p>When two predictors are strongly correlated, it may be wiser to combine them than to choose one. For diastolic (DBP) and systolic blood pressure (SBP), with r = 0.62 in one study, a mean pressure such as (2 × DBP + 1 × SBP) may be a better choice than either alone, although subject knowledge matters (systolic pressure is known to be more relevant for cardiovascular risk).</p>
<p class="src">Source: Ch. 11, §11.1.1 to §11.1.3</p>
`
    },
    {
      id: 's2',
      title: 'Arguments for smaller models: which hold and which do not',
      html: `
<h3>Parsimony</h3>
<p>The principle of parsimony (Occam's razor) says that simpler explanations are preferred to complex ones. For comparing two pre-specified theories it is a sensible principle. For prediction models derived by examining the data, the book argues for the opposite conclusion:</p>
<ul>
<li>A full model asks <b>one</b> question of the data: what are the regression coefficients?</li>
<li>A reduced model asks <b>two</b>: (a) which variables can be eliminated, and (b) what are the coefficients of the remaining predictors, given that the others were eliminated?</li>
</ul>
<p>A reduced model therefore answers two questions rather than one, which is arguably more complex. A smaller model is easier to use (a rule with few simple predictors is easy to remember), but this simplicity is conditional on having selected the right predictors from the candidates.</p>
<h3>Should non-significant predictors be removed?</h3>
<p>Some argue that a predictor that is not statistically significant should not be in the model, because its effect has not been proven. This mixes two concepts: hypothesis testing and estimation. Prediction is about estimation, so it is quite reasonable to keep a predictor with a p-value above 5%, especially if the dataset is small, the predictor is uncommon but strong (for example shock in GUSTO-I), or the predictor is known from previous research to be predictive. Non-significance does not mean there is evidence for a zero effect: absence of evidence is not evidence of absence. Finally, simulations with true noise variables in a model show only a limited decrease in predictive ability.</p>
<div class="callout key"><b>Summary of the arguments</b>
<table class="data">
<tr><th>Argument</th><th>Verdict</th></tr>
<tr><td>Larger models are less practical to work with</td><td>Valid</td></tr>
<tr><td>Some predictors have very small or implausible effects</td><td>Valid</td></tr>
<tr><td>"Statistically non-significant variables should be excluded"</td><td>False: for estimation, significance testing is not relevant, especially when subject knowledge supports the predictor</td></tr>
<tr><td>"Collinearity precludes reliable predictions"</td><td>False: collinearity makes individual coefficients unstable but reliable predictions can still be obtained</td></tr>
<tr><td>"Parsimony principle"</td><td>False when models are selected by studying patterns in the data; it may hold when pre-specified models are compared</td></tr>
</table></div>
<p class="src">Source: Ch. 11, §11.1.4 to §11.1.6</p>
`
    },
    {
      id: 's3',
      title: 'Stepwise selection: variants and stopping rules',
      html: `
<p>Stepwise methods are probably the most widely used selection approach in medical applications. They add or remove predictors using a significance criterion: the F test in linear regression, and the likelihood-ratio, Wald or score statistic in logistic and Cox regression.</p>
<ul>
<li><b>Forward selection</b> starts with no predictor and adds the most significant candidate that is not yet in, as long as it meets the criterion.</li>
<li><b>Backward selection</b> starts with the full model and removes the least significant predictor, then re-fits and repeats.</li>
<li><b>Combined</b> procedures iterate between the two.</li>
<li><b>All possible subsets</b> examines every combination of predictors to find the best fitting model. It can find combinations missed by forward or backward procedures but examines very many models, with multiple testing, and easily overfits.</li>
</ul>
<p>If stepwise selection is used, backward is generally preferred. The analyst is forced to look at the full model and to judge the effect of all candidates together, and correlated variables may remain in the model, whereas in a forward procedure none of them might enter.</p>
<h3>Stopping rules matter more than the variant</h3>
<p>The criterion for inclusion or exclusion is far more important than the variant. Common choices:</p>
<ul>
<li><b>Significance level</b>, usually p &lt; 0.05.</li>
<li><b>Akaike's Information Criterion (AIC)</b>: keep a predictor only if the increase in model χ² exceeds 2 × its df. This is the same as using a more liberal p-value, which depends on the df:</li>
</ul>
<table class="data">
<tr><th>df of the predictor</th><th>χ² must exceed</th><th>Equivalent p-value</th></tr>
<tr><td>1</td><td>2</td><td>0.157</td></tr>
<tr><td>2</td><td>4</td><td>0.135</td></tr>
<tr><td>3</td><td>6</td><td>0.112</td></tr>
<tr><td>4</td><td>8</td><td>0.092</td></tr>
<tr><td>5</td><td>10</td><td>0.075</td></tr>
</table>
<p class="src">Ch. 11, Table 11.1</p>
<ul>
<li><b>Bayesian Information Criterion (BIC)</b>: the model χ² must exceed log(n), the natural logarithm of the sample size. In survival data the effective sample size, such as the number of events, should be used for n. The corresponding p-value for 1 df becomes smaller as the sample grows:</li>
</ul>
<table class="data">
<tr><th>n</th><th>20</th><th>50</th><th>100</th><th>200</th><th>500</th><th>1,000</th><th>2,000</th></tr>
<tr><td>χ² must exceed log(n)</td><td>3.0</td><td>3.9</td><td>4.6</td><td>5.3</td><td>6.2</td><td>6.9</td><td>7.6</td></tr>
<tr><td>Equivalent p</td><td>0.083</td><td>0.048</td><td>0.032</td><td>0.021</td><td>0.013</td><td>0.009</td><td>0.006</td></tr>
</table>
<p class="src">Ch. 11, Table 11.2</p>
<div class="callout eg"><b>Worked example: where 0.157 comes from</b><p>A predictor with 1 df adds to the model χ² a value that, if the predictor has no true effect, follows a chi-square distribution with 1 df. The AIC rule keeps it if the value exceeds 2. The probability that a 1-df chi-square exceeds 2 is 0.157, so the rule is the same as testing at p &lt; 0.157. With 3 df the threshold is 6 and the chance a 3-df chi-square exceeds 6 is 0.112. BIC for n = 200 requires χ² above log(200) = 5.30, giving p = 0.021.</p></div>
<p>There is no particular reason to stick to a p-value of 0.05. The book notes that using AIC has been recommended, and that even higher p-values (0.20 or 0.50) have been found to give more power for selecting predictors with relatively weak effects and better predictions in small datasets that have an established set of candidate predictors. BIC leads to smaller models than AIC and in small effective sample sizes may produce "underfitting", in which too many predictors are removed.</p>
<p class="src">Source: Ch. 11, §11.2</p>
`
    },
    {
      id: 's4',
      title: 'Advantages of stepwise methods, and the first disadvantage: instability of selection',
      html: `
<h3>Advantages</h3>
<ul>
<li>It is straightforward to apply in modern statistical packages.</li>
<li>It is relatively <b>objective</b>: another analyst, given the same data and the same candidate list, would arrive at a very similar model. This allows the whole strategy to be replayed in each bootstrap sample to estimate the optimism due to selection (Module 4).</li>
<li>It usually achieves its aim of making the model smaller. In very large datasets such as GUSTO-I a stricter criterion (p &lt; 0.01) may be used because many predictors have very small p-values.</li>
<li>With multiply imputed data, selection should be based on the pooled results: obtain p-values for each predictor in a full model fitted to all imputed datasets, combine them, eliminate the least significant if its p exceeds the stopping criterion, re-fit and repeat.</li>
</ul>
<p>The practical caution is that in small datasets only few predictors may have small p-values, leading to a very small model. This argues for AIC or an even higher p-value as the criterion.</p>
<h3>Disadvantage 1: instability of the selection</h3>
<p>Stepwise selection considers a huge number of possible predictor sets, and several fit almost equally well. As a result, which predictors are chosen changes when a slightly different group of patients is used.</p>
<div class="callout book"><b>Book example: selection in small subsamples of GUSTO-I</b><p>Backward selection with p &lt; 0.05 in subsample 5 (n = 429) selected age over 65 (A65), hypotension (HYP) and shock (SHO). In the other 110 small subsamples where the 8-predictor model could be fitted, the percentage of the 111 subsamples in which each predictor was selected was: A65 80%, SHO 53%, HYP 47%, high-risk infarct location (HIG) 29%, heart rate above 80 (HRT) 23%, sex 22%, diabetes (DIA) 13%, time to relief of pain (TTR) 11%. This particular set of three was reproduced in only 7 of the 110 other subsamples. Source: Ch. 11, §11.4.1, Table 11.3.</p></div>
<p>Statements such as "the only independent predictors in this problem were age, hypotension and shock" are overinterpretations unless the sample is huge and the other predictors have much smaller effects. Even worse is to interpret the order of entry in a forward procedure, or the rank order of p-values in the selected model.</p>
<p>Instability depends on the sample size and on the number of candidates. The mean number of predictors selected out of 8 shows the pattern.</p>
<div class="callout book"><b>Book example: mean number of predictors selected out of 8 (± SD)</b>
<table class="data">
<tr><th>Samples</th><th>p &lt; 0.05</th><th>AIC</th><th>p &lt; 0.5</th></tr>
<tr><td>Small subsamples</td><td>2.8 ± 1.1</td><td>4.2 ± 1.1</td><td>6.3 ± 1.2</td></tr>
<tr><td>Large subsamples</td><td>4.8 ± 1.1</td><td>6.0 ± 1.0</td><td>7.0 ± 0.9</td></tr>
<tr><td>16 large regions (at least 2,000 patients, 178 events on average)</td><td>6.6 ± 1.0</td><td>7.1 ± 0.8</td><td>7.8 ± 0.4</td></tr>
</table>
<p>Source: Ch. 11, Table 11.4.</p></div>
<p>The more candidates there are, the more combinations are possible, so the crucial quantity is the ratio of candidate predictors to the effective sample size, which for a binary outcome is the number of events. An EPV of 10 is only a reasonable lower bound for a pre-specified model. For <b>reliable selection</b> among candidates the book states that an EPV of 50 is better. With 8 candidate predictors this means at least 400 events. The full GUSTO-I data (2,851 events in 40,830 patients) satisfy this easily, but that is exceptional. The instability can be studied in any dataset with bootstrap resampling, and when a few predictors are strong and the others weak this should be visible from the selection frequencies over the bootstrap samples.</p>
<div data-widget="stepwiseInstability"></div>
<ul class="try">
<li>Set the sample size to the smallest value and the rule to "backward p&lt;0.05". Press "Run 100 bootstraps" and note the selection frequency of each predictor, the spread of the number of predictors kept and the percentage of bootstraps that reproduce the original model.</li>
<li>Repeat with the largest sample size. Observe which predictors reach a high selection frequency and how the percentage of reproduced models changes.</li>
<li>Switch to "backward p&lt;0.5" and "full model" and compare the number of predictors kept.</li>
</ul>
<p class="src">Source: Ch. 11, §11.3 and §11.4.1</p>
`
    },
    {
      id: 's5',
      title: 'Disadvantage 2: biased coefficients (testimation bias)',
      html: `
<p>Module 4 introduced <b>testimation bias</b>: when a coefficient is first tested and then estimated, only estimates that are large enough to pass the test are retained, so the retained estimates are biased away from zero. In stepwise selected models this shows in the distribution of coefficients over subsamples. Many coefficients are exactly zero because the predictor was not selected. Between zero and the lowest selected value there is a gap, since small estimates were not significant and were set to zero. The gap is smaller with a higher p-value (AIC or 0.5) because fewer coefficients are set to zero. The problem is smaller in larger samples.</p>
<h3>How large is the bias, and when?</h3>
<p>A simulation study drew small random subsamples of GUSTO-I and measured the relative bias of coefficients in the selected models, in relation to the events per variable (EPV). The findings:</p>
<ul>
<li>With selection at p &lt; 0.05 the bias was substantial. At EPV = 10 the bias exceeded 50% for 3 predictors.</li>
<li>With selection at p &lt; 0.50 the bias was much smaller. In the full model without selection, the bias was small for reasonable sample sizes (EPV of 10 or more) and at EPV = 3 the absolute bias was below 20% for every predictor.</li>
<li>The bias is related to how often a predictor is selected. A strong predictor such as age is selected in nearly every subsample and has little bias. A weak predictor such as diabetes is selected in only a few subsamples, and when it is selected its coefficient is biased upward by more than 100% at low EPV.</li>
<li>Bias is greatest when the ratio of the true coefficient to its standard error is around 0.6, and falls for both weaker and stronger effects. The standard error shrinks as the sample size grows, so a given effect becomes less biased as the sample grows.</li>
</ul>
<div class="callout eg"><b>Worked example (Book example numbers): true coefficient 1, SE 0.5</b>
<p>If only estimates with p &lt; 0.05 are kept, the estimate must exceed 1.96 × 0.5 = 0.98 in absolute value. The estimates are distributed normally with mean 1 and standard deviation 0.5. P(estimate &gt; 0.98) = P(z &gt; (0.98 − 1) / 0.5) = P(z &gt; −0.04) = 0.516. The lower tail, P(estimate &lt; −0.98) = P(z &lt; −3.96), is negligible. So 52% of estimates are significant. Their average is 1.39, which is 39% above the true value of 1. The "selected" estimates overstate the effect, because the estimates below 0.98 that pull the average down have been discarded. Source: Ch. 5.</p></div>
<div class="callout mch"><b>Illustrative (synthetic): a modest effect of bacteriuria</b><p>Suppose that in reality asymptomatic bacteriuria has a log odds ratio of 0.5 (OR 1.65) for preterm birth, and the sample is so small that the standard error is also 0.5. The estimate will reach p &lt; 0.05 in only about 17% of studies, and when it does, the average reported log odds ratio will be about 1.23 (OR 3.4). Task 1 asks you to derive this.</p></div>
<div data-widget="testimationSim"></div>
<ul class="try">
<li>Keep the default (true coefficient 1, SE 0.5, threshold 0.05) and note the share significant and the percentage bias among significant estimates.</li>
<li>Keep the coefficient and reduce the standard error step by step (a larger sample). Watch the bias fall.</li>
<li>Raise the selection threshold from 0.05 to 0.5 and see how the bias changes. Then look at the plot of mean selected estimate against the ratio β/SE to see where the bias is greatest.</li>
</ul>
<p class="src">Source: Ch. 11, §11.4.2 and §11.4.3, Figs 11.2 to 11.5</p>
`
    },
    {
      id: 's6',
      title: 'Disadvantages 3 and 4: wrong variability, exaggerated p-values and worse predictions',
      html: `
<h3>Misspecified variability</h3>
<p>The standard errors a program prints for the final model assume the model was specified in advance. They ignore the uncertainty about which predictors were selected. Over repeated samples, the distribution of a coefficient can be viewed in two ways. The <b>unconditional</b> view counts a coefficient as zero when the predictor was not selected. The <b>conditional</b> view considers only the samples in which the predictor was selected.</p>
<div class="callout book"><b>Book example: standard errors of coefficients in p &lt; 0.05 selected models, GUSTO-I subsamples</b>
<table class="data">
<tr><th>Standard error</th><th>A65</th><th>Sex</th><th>DIA</th><th>HYP</th><th>HRT</th><th>HIG</th><th>SHO</th><th>TTR</th></tr>
<tr><td>Empirical, unconditional</td><td>0.87</td><td>0.55</td><td>0.53</td><td>0.98</td><td>0.55</td><td>0.77</td><td>1.51</td><td>0.46</td></tr>
<tr><td>Empirical, conditional</td><td>0.52</td><td>0.27</td><td>0.36</td><td>0.47</td><td>0.29</td><td>0.62</td><td>0.75</td><td>0.27</td></tr>
<tr><td>Printed (asymptotic), conditional</td><td>0.57</td><td>0.48</td><td>0.55</td><td>0.61</td><td>0.48</td><td>0.59</td><td>0.88</td><td>0.62</td></tr>
</table>
<p>Source: Ch. 11, Table 11.5. On average the printed standard errors are somewhat larger than the empirical conditional ones but smaller than the unconditional ones, which reflect the possibility that the coefficient was set to zero.</p></div>
<p>For this reason confidence intervals from a stepwise model are of doubtful meaning. The variability of predictions was also studied by bootstrapping, and predictions were far more variable than expected from estimates made as if the model had been pre-specified.</p>
<h3>Exaggerated p-values</h3>
<p>Combining testimation bias with understated variability exaggerates statistical significance. The p-value of a predictor in a stepwise-selected model is computed as if the model were pre-specified, and should generally not be trusted.</p>
<h3>Predictions of worse quality than a full model</h3>
<p>For the sample at hand, dropping weak predictors lowers apparent performance only a little, because they are weak by definition. The question that matters is performance in new patients, evaluated through internal validation (bootstrapping) or external validation. In both, models selected by stepwise methods usually perform worse than a full model without selection.</p>
<div class="callout book"><b>Book example: bootstrap validation of R² in GUSTO-I subsample 5 (n = 429)</b>
<table class="data">
<tr><th>Model</th><th>Apparent</th><th>Bootstrap</th><th>Test</th><th>Optimism</th><th>Optimism-corrected</th></tr>
<tr><td>Full model, 8 predictors</td><td>22.7</td><td>24.7</td><td>17.2</td><td>7.6</td><td>15.1</td></tr>
<tr><td>Stepwise, 3 predictors, p &lt; 0.05</td><td>17.6</td><td>18.7</td><td>12.7</td><td>5.9</td><td>11.7</td></tr>
</table>
<p>R² is Nagelkerke R² in percent. The optimism-corrected value is the apparent value minus the optimism, 22.7 − 7.6 = 15.1 and 17.6 − 5.9 = 11.7. The stepwise model replays the selection in every bootstrap sample. Source: Ch. 11, Table 11.6.</p></div>
<h3>Noise variables</h3>
<p>The argument for stepwise selection is that it removes noise variables, predictors with a true coefficient of zero. Derksen and Keselman found that stepwise selection produced models in which 30% to 70% of the selected predictors were pure noise, when candidates included a mix of noise and real predictors. How many noise variables are included depends on how many were among the candidates and on the correlation between candidates. Stepwise methods are therefore no guarantee for excluding noise variables. Restricting the candidates by subject knowledge reduces the chance that noise predictors are present at all.</p>
<div class="callout book"><b>Book example: adding 9 noise variables in GUSTO-I (test n = 20,318)</b>
<table class="data">
<tr><th></th><th>Model with 17 true predictors</th><th>Same, p &lt; 0.05 selection</th><th>8 true + 9 noise</th><th>Same, p &lt; 0.05 selection</th></tr>
<tr><td>Noise predictors in model</td><td>0</td><td>0</td><td>9</td><td>0.5</td></tr>
<tr><td>True predictors in model</td><td>17</td><td>5.9</td><td>8</td><td>4.8</td></tr>
<tr><td>c statistic in test data</td><td>0.784</td><td>0.762</td><td>0.753</td><td>0.746</td></tr>
</table>
<p>Source: Ch. 11, Table 11.7 (23 large subsamples of GUSTO-I; counts are means). Selection removed almost all the noise (only 0.5 of 9 kept) but also threw away true predictors (only 4.8 of 8 kept), and performed worse than the full model with the noise included.</p></div>
<p>The book draws the conclusion that omitting a true predictor may be far worse than including a noise variable. Ambler and colleagues found stepwise selection with AIC to be the best of the stopping rules in their simulations.</p>
<p class="src">Source: Ch. 11, §11.4.4 to §11.5</p>
`
    },
    {
      id: 's7',
      title: 'Univariable pre-selection and testing within domains',
      html: `
<p>Another common way to choose predictors is to examine each variable's univariable relation with the outcome first, and take forward into the multivariable model only those that meet a criterion such as p &lt; 0.05, p &lt; 0.1, p &lt; 0.2 or p &lt; 0.5. It seems to reduce overfitting and the problems of stepwise selection. The book shows it is just a variant of stepwise selection: in standard backward selection every candidate is considered at every step, whereas with univariable pre-selection only the candidates that passed the first screen are considered thereafter.</p>
<div class="callout key"><b>Hypothetical illustration (Tables 11.8 and 11.9)</b><p>Eight candidates, numbered 1 to 8. With univariable screening, predictors 6, 7 and 8 are lost at the first step. Backward selection then omits 5 and 4, leaving 1, 2, 3. With standard backward selection starting from all eight, predictor 6, which looked insignificant univariably, can remain in the final model with 1, 2 and 3, because the full model judges it together with all the other candidates.</p></div>
<h3>Practical pros and cons</h3>
<ul>
<li><b>Pro:</b> predictors for which no coefficient can be estimated by standard fitting algorithms (for example shock in the very small GUSTO-I subsamples) are eliminated early, and a model can be fitted with the remaining ones.</li>
<li><b>Pro:</b> in a large dataset with many predictors, the computational burden is lower when starting from a "reduced full model".</li>
<li><b>Con:</b> it does not remove any of the problems described in the previous section.</li>
<li><b>Informal screening</b> such as eyeballing relationships between continuous predictors and the outcome, or inspecting cross-tabulations, also uses the outcome relationship and therefore contributes to overfitting.</li>
</ul>
<h3>Testing within domains</h3>
<p>A variant tests the relevance of predictors within a cluster of related variables (a disease domain), for example blood pressure measurements and treatment of hypertension. This has some appeal, but the problems of stepwise selection apply. Some power can be gained by requiring that every domain stays in the final model even if no member is significant after pre-selection. Other approaches combine variables within a cluster (for example mean blood pressure), or pre-select using prior information from other studies.</p>
<p class="src">Source: Ch. 11, §11.6</p>
`
    },
    {
      id: 's8',
      title: 'Modern selection methods and what to do in practice',
      html: `
<p>A number of newer methods exist. They are computationally intensive and still seldom used in medical applications.</p>
<h3>Bootstrap selection</h3>
<p>Stepwise selection is repeated in many bootstrap samples, the candidates are ranked by their selection frequency, and the predictors selected in more than 50% of bootstrap samples are fitted in the original sample. The evidence for its advantages is unconvincing. The result will generally resemble the stepwise model in the original sample, since a predictor with a low p-value in the original data is chosen frequently in bootstrap samples.</p>
<h3>Bagging and boosting</h3>
<p>Bagging (bootstrap aggregating) builds many versions of a predictor from bootstrap resamples and averages the predictions. It can improve accuracy when small changes in the development data cause large changes in the constructed predictor. Boosting reweights the observations so that those that are difficult to classify count more.</p>
<h3>Bayesian model averaging (BMA)</h3>
<p>Researchers usually ignore the uncertainty of the model-selection step. BMA takes it into account. With p candidate predictors (ignoring interactions) there are up to 2<sup>p</sup> possible models. The averaged estimate is the sum of each model's estimate, weighted by the posterior probability of that model given the data:</p>
<div class="formula">E(β | D) = Σ over models  β<sub>model</sub> × Pr(model | D)</div>
<p>The number of models can be limited by "Occam's window", which discards models far less probable than the best one, for example more than 20 times less likely. In simulations with 25 noise variables and no true predictors, stepwise selection sometimes included two or more noise variables whereas BMA always found none. With two relatively strong predictors and 23 noise variables, stepwise selection included up to 5 noise variables besides the 2 true ones. In the Framingham coronary events data, 12 exploratory variables were available; Occam's window retained 6 of the 8,192 (2<sup>13</sup>) models considered, with 5 or 6 predictors and posterior probabilities between 3% and 65%. The best backward model at p &lt; 0.05 had eight variables, and BMA predicted somewhat better.</p>
<h3>Shrinkage to zero: Lasso</h3>
<p>The <b>Lasso</b> ("least absolute shrinkage and selection operator") maximises the likelihood subject to the sum of the absolute values of the coefficients being bounded by a constant. This shrinks coefficients, some exactly to zero, and so removes predictors. It showed promising results in simulation and when predicting 30-day mortality in GUSTO-I subsamples. Module 10 explains it in more detail.</p>
<div class="callout key"><b>The book's conclusions</b><p>Overfitting begins with considering too many candidate predictors. The standard techniques used by default in medical research, such as stepwise selection, do not solve this problem. The improvements to look for are: limiting the need for selection through subject knowledge, particularly in smaller datasets; better fitting algorithms such as the Lasso; bootstrapping; and Bayesian estimation. The uncertainty of model selection is an important source of overfitting, to be prevented by analysing larger datasets and limiting stepwise use. Faraway's phrase for the problems of data-driven modelling is "the cost of data analysis".</p></div>
<div class="callout mch"><b>Illustrative (synthetic): practical plan for a preterm-birth model</b><p>With 200 events: (1) restrict to about 10 candidates with an obstetrician and a literature review (Module 7); (2) code them in advance (Module 6); (3) fit the full model, check its performance by bootstrap and apply shrinkage (Module 10); (4) if a smaller model is needed for practical reasons, choose the stopping rule, say AIC, and bootstrap the whole selection process to see how much optimism it adds.</p></div>
<p class="src">Source: Ch. 11, §11.7 and §11.8</p>
`
    }
  ],
  keyPoints: [
    'A full model with a limited, knowledge-based candidate list asks one question of the data; a stepwise-reduced model asks two.',
    'Non-significance, collinearity and parsimony are false reasons for dropping predictors in a prediction model; practicality and implausible effects are valid ones.',
    'AIC corresponds to p &lt; 0.157 for 1 df, and BIC to a p-value that shrinks with n (0.021 at n = 200).',
    'Selection is unstable: in 111 GUSTO-I subsamples the specific 3-predictor model was reproduced only 7 times out of 110.',
    'About 50 events per candidate predictor are needed for reliable selection (400 events for 8 candidates); 10 per variable is only a lower bound for a pre-specified model.',
    'Coefficients selected by significance are biased away from zero, most for moderate effects with a true coefficient to SE ratio near 0.6.',
    'Standard errors and p-values of a stepwise model are computed as if the model were pre-specified and are too optimistic; validated performance is lower than for the full model (R² 11.7 vs 15.1).',
    'Omitting a true predictor can cost more than including a noise variable; alternatives are the full model, bootstrapping the whole selection, BMA and the Lasso.'
  ],
  quiz: [
    {
      q: 'Which of the following is a false argument for removing predictors from a prediction model?',
      options: [
        'A model with fewer predictors is easier for clinicians to use.',
        'Some predictors have very small or biologically implausible effects.',
        'Some predictors will not be available when the model is applied.',
        'Predictors that are not statistically significant provide no information and should be excluded.'
      ],
      answer: 3,
      why: 'Prediction is an estimation problem, and non-significance is not evidence of a zero effect, especially in small samples or for uncommon but strong predictors. The first three are the valid practical reasons given by the book. The false argument confuses hypothesis testing with estimation.'
    },
    {
      q: 'For a predictor with 1 df, backward elimination using AIC (keep if χ² exceeds 2 × df) is equivalent to a significance test at what level?',
      options: [
        'p below 0.05',
        'p below 0.157',
        'p below 0.50',
        'p below 0.01'
      ],
      answer: 1,
      why: 'The probability that a chi-square with 1 df exceeds 2 is 0.157. The usual 5% level corresponds to a threshold of 3.84, so AIC is more liberal. A level of 0.5 is a different, even more liberal choice, sometimes used in small datasets with established candidates, and BIC at large n would approach 0.01.'
    },
    {
      q: 'A team has 8 candidate predictors and wants the selection of predictors to be reliable. Using the book\'s guidance on events per variable, how many outcome events do they need at minimum?',
      options: [
        '80 events',
        '160 events',
        '400 events',
        '800 events'
      ],
      answer: 2,
      why: 'The book suggests an EPV of 50 for reliable selection among candidates, so 8 × 50 = 400 events. The 10 events per variable figure (80 events) is a lower bound for a pre-specified model, not for selection. 160 corresponds to 20 per variable, which is the level at which a pre-specified model may not need shrinkage.'
    },
    {
      q: 'True coefficient 1.0 and SE 0.5, with only estimates significant at p below 0.05 kept. Which result matches the book?',
      options: [
        'About half of estimates are significant and their mean is about 1.39, i.e. 39% too high.',
        'About 95% of estimates are significant and their mean is 1.0.',
        'About half of estimates are significant and their mean is 1.0 because selection is random.',
        'About 52% are significant and their mean is 0.7, an underestimate.'
      ],
      answer: 0,
      why: 'The significance cut-off is 0.98, which is just below the true value, so about 52% pass, and only the larger estimates are kept, so the mean among them is 1.39. The distractors assume selection does not change the average, or confuse the direction of bias, which is always away from zero for selected coefficients.'
    },
    {
      q: 'In bootstrap validation of GUSTO-I subsample 5, the optimism-corrected R² was 15.1% for the 8-predictor model and 11.7% for the stepwise model (p below 0.05, 3 predictors, selection replayed in the bootstrap). What does this show?',
      options: [
        'The stepwise model is better because its optimism (5.9) is smaller than that of the full model (7.6).',
        'The models are equivalent because the apparent R² values are similar.',
        'The full model predicts better, because the corrected R² is higher; the stepwise model has lower optimism only because it is smaller.',
        'The comparison is invalid because stepwise selection cannot be bootstrapped.'
      ],
      answer: 2,
      why: 'The corrected value is the quantity to compare, and the full model is ahead (15.1 vs 11.7). Lower optimism does not mean better, since the stepwise model started lower (17.6 vs 22.7). Stepwise selection can be bootstrapped, which is a stated advantage of its objectivity.'
    },
    {
      q: 'With 10 candidate predictors, how many models does an all-possible-subsets search consider, and how many if 4 predictors are pre-specified to stay in the model?',
      options: [
        '100 and 36',
        '1,024 and 64',
        '512 and 32',
        '10 and 6'
      ],
      answer: 1,
      why: 'Each predictor is either in or out, so 2^10 = 1,024 models are possible. With 4 forced in, only the other 6 vary, so 2^6 = 64. The multiple testing implied by examining many models is why all-subsets regression easily overfits.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'EPV, stopping rules, number of models and testimation bias',
      level: 'Apply',
      scenario: `<p><b>Illustrative (synthetic).</b> A district team has 1,800 deliveries with 198 preterm births. They have 12 candidate predictors, each with 1 df, and plan backward elimination. A colleague asks whether the sample supports this.</p>
<p>For part (e) assume a different situation: a predictor has a true log odds ratio of 0.5 (OR 1.65) for preterm birth and the sample is so small that the standard error is 0.5. Only estimates with p &lt; 0.05 (|estimate| above 1.96 × SE) are retained. You may use these standard normal values: Φ(0.96) = 0.8315, Φ(−2.96) = 0.0015, φ(0.96) = 0.2516, φ(−2.96) = 0.0050, where Φ is the cumulative distribution and φ the density. For estimates restricted to a region, the mean of the retained estimates is: true value + SE × [φ(a) − φ(b)] / P(retained), where a = (cut-off − true value) / SE, b = (−cut-off − true value) / SE, and P(retained) = [1 − Φ(a)] + Φ(b).</p>`,
      questions: [
        '<b>(a)</b> Compute the EPV of the full 12-predictor model.',
        '<b>(b)</b> How many events would the book suggest for reliable selection among 12 candidates? How many candidates can 198 events support at that standard?',
        '<b>(c)</b> What p-value corresponds to AIC for a 1-df predictor and for a 3-df predictor? What χ² does BIC require when n = 200, and what is the equivalent p?',
        '<b>(d)</b> How many models does all-possible-subsets regression consider with 12 candidates, and with 4 of them forced in?',
        '<b>(e)</b> Find the share of estimates retained and the mean retained estimate. Express the bias as a percentage of the true value, and compare it with the book result for a true coefficient of 1 and SE 0.5.'
      ],
      answer: `<p><b>(a)</b> EPV = 198 / 12 = 16.5. This is above the minimum of 10 for a pre-specified model, so fitting the full model is supported, and it is below the 20 at which shrinkage may become unnecessary.</p>
<p><b>(b)</b> 12 × 50 = 600 events for reliable selection. 198 / 50 = 3.96, so the data support selection among about 4 candidates at that standard. The selection among 12 would be unstable. The fully pre-specified model (or a model with a restricted candidate list agreed in advance) is better supported.</p>
<p><b>(c)</b> AIC 1 df: χ² must exceed 2, p = 0.157. AIC 3 df: χ² must exceed 6, p = 0.112. BIC with n = 200: log(200) = 5.30 and p = 0.021.</p>
<p><b>(d)</b> 2<sup>12</sup> = 4,096 models. With 4 forced in, 2<sup>8</sup> = 256 models.</p>
<p><b>(e)</b> Cut-off = 1.96 × 0.5 = 0.98. a = (0.98 − 0.5) / 0.5 = 0.96. b = (−0.98 − 0.5) / 0.5 = −2.96. P(retained) = (1 − 0.8315) + 0.0015 = 0.1700, so about 17% of estimates are retained. Mean retained = 0.5 + 0.5 × (0.2516 − 0.0050) / 0.1700 = 0.5 + 0.5 × 1.4506 = 1.225. The bias is 1.225 / 0.5 − 1 = 145%, which is an odds ratio of e<sup>1.225</sup> = 3.4 instead of 1.65. In the book's example (true 1, SE 0.5, ratio 2) the share retained is 52% and the bias +39%. Here the true effect is smaller relative to the SE (ratio 1), so fewer estimates pass, and those that do overstate the effect by much more. The estimates with the worst relative bias are those whose ratio is small to moderate (near 0.6), where the effect is hard to detect.</p>`
    },
    {
      id: 't2',
      title: 'Instability of selection and testimation in the course simulations',
      level: 'Analyze',
      scenario: `<p>Use the stepwise instability widget on <b>ptb_dev</b> (synthetic; 14 candidate terms; complete cases). In the data-generating process the strong predictors are prior preterm birth (log odds 1.5), chronic hypertension (0.9), bacteriuria (0.9), the age curve, short interval (0.7) and tobacco (0.6). Weaker effects are primigravida (0.35), Hb below 11, BMI below 20 and low SES (0.12). Four variables have no effect: antenatal visits, female fetus, conception in monsoon and height.</p>`,
      questions: [
        '<b>(a)</b> At the smallest sample size and the rule "backward p&lt;0.05", run 100 bootstraps. Which predictors have high selection frequency? Do any noise predictors appear? What fraction of bootstraps reproduce the original model?',
        '<b>(b)</b> Change the rule to "backward p&lt;0.5" and then to the full model. How do the number of predictors kept and the reproducibility change?',
        '<b>(c)</b> Raise the sample size to the largest value and repeat (a). What changes?',
        '<b>(d)</b> In the testimation simulator, set the true coefficient to 0.3 and the SE to 0.5 (ratio 0.6) and then to 1.5 with the same SE. Compare the share significant and the bias among significant estimates.'
      ],
      answer: `<p><b>(a)</b> At the smallest sample size and p &lt; 0.05, expect few predictors per bootstrap, with a pattern of the strongest predictors (prior preterm birth, chronic hypertension, bacteriuria, the age term) selected frequently, moderate ones (tobacco, short interval) in a fraction of bootstraps and weak ones (primigravida, Hb, BMI, SES) rarely. Noise predictors may appear occasionally, near the 5% rate for a variable with no effect (though the selection frequency may be higher because the bootstrap resamples the same data). The percentage of bootstraps that reproduce the original selected model will be small, a pattern parallel to the GUSTO-I subsamples where the specific set was reproduced in 7 of 110 samples.</p>
<p><b>(b)</b> With p &lt; 0.5 many more predictors are kept (including some noise variables), the spread in model size shrinks, and the full model keeps all 14. The fully pre-specified model is by definition always "reproduced", and adds noise terms with little loss, as in the book's noise-variable experiment.</p>
<p><b>(c)</b> With a large sample the selection frequencies of strong predictors approach 100%, noise predictors stay low, the number of predictors kept becomes more stable and a larger share of bootstraps reproduce the model, consistent with the book's finding that instability is less extreme in larger samples (about 6 to 7 predictors in large GUSTO-I regions). Weak true predictors (such as low SES with a coefficient of only 0.12) may still be selected inconsistently, because their effect is small compared with the SE even in a large sample.</p>
<p><b>(d)</b> With ratio 0.6 only about 9% of estimates are significant, but those that pass have a mean of about 1.08, more than three times the true 0.3, which is a very large percentage bias. With a ratio of 3 about 85% of estimates are significant and the mean among them is about 1.64, a bias of roughly 9%. These values follow from the same normal calculation as Task 1(e); the widget's simulated values will be close. The book states that bias is greatest around a ratio of about 0.6 and decreases for stronger effects, because strong predictors are selected nearly always and so selection does not truncate the distribution.</p>`
    },
    {
      id: 't3',
      title: 'Critique a stepwise model for neonatal sepsis',
      level: 'Evaluate',
      scenario: `<p><b>Illustrative (synthetic).</b> A newborn unit study includes 700 neonates, 92 with culture-positive sepsis. Twenty-five variables were collected. The report says: "Predictors with p &lt; 0.10 in univariable analysis (11 variables) entered a forward stepwise procedure (entry p &lt; 0.05); five remained: temperature, respiratory rate, lethargy, CRP and PROM &gt;18 h. The first variable to enter, CRP, was the strongest independent predictor, followed by lethargy. Birth weight and gestational age were correlated (r = 0.72) so gestational age was dropped. The final model gave odds ratios with 95% confidence intervals and p-values from the software. Internal validation used a random split: the model was developed in 350 neonates (46 events) and tested in the other 350, giving c = 0.88 in the development half and 0.79 in the test half. We conclude that the model performs well. No recalibration was needed."</p>`,
      questions: [
        '<b>(a)</b> List the problems with the selection approach and what the book says about each.',
        '<b>(b)</b> Compute the EPV at the start and at the split-sample stage.',
        '<b>(c)</b> What would you recommend instead?'
      ],
      answer: `<p><b>(a) Point-by-point.</b></p>
<ol>
<li><b>25 candidates with 92 events (EPV 3.7).</b> The list is too long for the number of events. Candidates should be limited beforehand using subject knowledge (Module 7), and reliable selection needs about 50 events per candidate.</li>
<li><b>Univariable pre-selection followed by forward stepwise.</b> Univariable screening is a variant of stepwise selection and adds to overfitting. The book prefers backward over forward selection, because correlated variables are judged together in the full model and a forward procedure may admit none of them.</li>
<li><b>Interpreting order of entry.</b> Statements such as "CRP was the strongest independent predictor, followed by lethargy" based on order of entry (or order of p-values) are overinterpretations, because the selection is unstable.</li>
<li><b>Dropping gestational age because of correlation 0.72.</b> Collinearity at this level does not preclude reliable predictions. Correlations of 0.5 are already among the strongest seen in the GUSTO-I data, and r above 0.8 is the level at which coefficients of the correlated variables become unreliable. Gestational age is a strong clinical predictor; combining or keeping both may be sounder.</li>
<li><b>Confidence intervals and p-values from the software.</b> These assume the model was pre-specified, ignore the selection, and are too optimistic. The coefficients are also biased away from zero by testimation.</li>
<li><b>Split-sample validation with 46 events.</b> It wastes half the data and is unstable. The book recommends the bootstrap, replaying the whole selection in each bootstrap sample. The drop in c from 0.88 to 0.79 is itself a sign of overfitting. The final model should be developed on all 700 patients.</li>
<li><b>"No recalibration needed."</b> Nothing in the report assesses calibration (slope, calibration-in-the-large); a lower c in the test half suggests the predictions are too extreme.</li>
</ol>
<div class="callout warn"><b>(b) Critical:</b><p>EPV at the start is 92 / 25 = 3.7, far under the minimum of 10 even before considering that selection was used. After the split the development half has 46 events and EPV of 46 / 25 = 1.8. A model developed in this way is likely to be seriously overfitted; apparent performance cannot be taken at face value, and the p-values and confidence intervals are not valid.</p></div>
<p><b>(c) Recommendation.</b> Pre-specify around 8 to 9 candidates based on clinical knowledge and literature (92 / 10 gives about 9 df), keep gestational age and birth weight if both are clinically relevant, combine similar signs where possible, fit the full model on all 700 neonates, and assess optimism by bootstrap. If a smaller model is required, use AIC or a more liberal rule and replay the entire procedure in the bootstrap. Consider shrinkage (Module 10) because EPV remains close to 10.</p>`
    }
  ]
});
