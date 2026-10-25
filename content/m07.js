registerModule({
  id: 'm07',
  num: 7,
  part: 'Development',
  title: 'Restricting and combining candidate predictors',
  book: 'Ch. 10',
  minutes: 55,
  summary: 'How to shrink the list of candidate predictors, and the degrees of freedom they use, before and without looking at the outcome: subject knowledge, distributions, combined scores, logical weights and averaged effects.',
  objectives: [
    'Distinguish candidate predictors from included predictors, and strategies that use the predictor-outcome relationship from those that do not.',
    'Apply subject knowledge, missingness and distribution to reduce a candidate list, and decide what to do with an infrequent but strong predictor.',
    'Construct a simple summary score (any-of indicator, count, logically weighted sum) and test the equal-weights assumption.',
    'Explain why a main effect averages over subgroups, and when a combined model for two groups is preferable to separate models.',
    'Calculate the degrees of freedom and events per variable of alternative codings of related predictors.',
    'Describe how a model with 5 or 10 df can capture most of the information of a model with 11 df.'
  ],
  sections: [
    {
      id: 's1',
      title: 'The problem: many candidates, few events',
      html: `
<p>In most clinical settings the analyst can list far more possible predictors than the data can support. A cohort of 800 women with 90 preterm births might record 40 variables, and each continuous variable may be coded with several terms. A small sample brings the problems described in Module 4: low power to test individual effects and, when the full set is fitted, too-extreme predictions (overfitting). This module deals with reducing the number of <b>candidate predictors</b> (all variables and terms that are considered for the model), as distinct from the <b>included predictors</b> (those that remain in the final model).</p>
<p>The book distinguishes two kinds of reduction.</p>
<ul>
<li><b>Strategies that do not use the predictor-outcome relationship in the data</b>: subject knowledge, review of the literature, the number of missing values, how a predictor is distributed, combining related variables, and averaging effects over subgroups. These are the subject of this module.</li>
<li><b>Strategies that do use the relationship</b>, such as univariable screening and stepwise selection. These are useful for shrinking the model but themselves produce bias and overfitting. They are discussed in Module 8.</li>
</ul>
<div class="callout key"><b>Key idea</b><p>Reduction that is blind to the outcome is free of overfitting. Each degree of freedom you remove without looking at the outcome is a degree of freedom you do not have to pay for with events. The goal is to arrive at a limited list of candidates that can all enter one full model.</p></div>
<p>The chapter's four recommendations, in order, are: (1) match the number of candidate predictors to the effective sample size, which is the number of events for a binary outcome; with a small sample, restrict the list more; (2) consider the distributions of the predictors, excluding those with many missing values or narrow distributions; (3) combine related predictors into summary scores; (4) average effects of predictors across subgroups to gain stability. The risk of all these restrictions is that a predictor, or a specific predictor effect, is excluded that mattered. The specific circumstances should guide how far to go.</p>
<p class="src">Source: Ch. 10, background and §10.5</p>
`
    },
    {
      id: 's2',
      title: 'Selecting candidates with subject knowledge',
      html: `
<p>Ideally candidate predictors are chosen before studying the relationship of any of them to the outcome. The first resource is subject knowledge: a literature review on the topic combined with consultation of clinicians and experts. Building a prognostic model without such knowledge, and without a very large sample, is described as nearly impossible. In many cases a list of about 5 to 20 candidate predictors is reasonable for developing an adequate model. Even in genetic research it has been suggested that at most about 20 genes should be included in a prediction model, although simulations show that many genes may be needed if the effect per gene is small.</p>
<div class="callout book"><b>Book example: too many candidates in children with fever</b><p>Models to identify serious bacterial infection in children presenting with fever without an obvious cause were developed in 231 children, of whom 58 had the diagnosis, from 57 candidate predictors. Univariable screening was followed by stepwise selection. The model seemed to perform reasonably, but external validation showed poor results. Bootstrapping the whole modelling process later showed a large decrease in performance, and much of the poor performance in new patients was attributable to the modelling strategy with too many candidates for the number of events. Source: Ch. 10, §10.1.2.</p></div>
<p>Here the events per variable (EPV), if each candidate used 1 df, was about 58/57, roughly 1. Module 2 defined EPV; for now note that a model should have at least 10 events per candidate degree of freedom, and the book gives 50 per candidate if selection from the list is to be reliable (Module 8).</p>
<h3>Using meta-analysis to choose candidates</h3>
<p>A systematic review or meta-analysis of published univariable effects may help to choose candidates, but it has limitations.</p>
<ul>
<li><b>Suppression.</b> When two predictors are negatively correlated, the univariable effect of each can be near zero while the multivariable effect is clear. A predictor that looks unimportant in published univariable results might be useful. This is relatively rare, because correlations between medical predictors are mostly positive, which makes univariable effects larger than multivariable effects.</li>
<li><b>Counting versus pooling.</b> Counting how often a predictor was found "important" may be enough to identify key predictors. A formal meta-analysis is needed if the pooled effect is to serve as a prior estimate for the model.</li>
<li><b>Publication bias.</b> Many studies do not report the effect of a predictor when it is not statistically significant, which pushes the published effects towards more extreme values. Restricting to studies that report all predictors considered reduces the bias but may leave very few studies.</li>
</ul>
<div class="callout book"><b>Book example: testicular cancer</b><p>For the histology of residual masses after chemotherapy, a review of the prognostic value of a core set of factors supplied the predictors used in the model. Some fine-tuning was done afterwards, namely the search for good transformations of continuous variables, and the choice among three variables related to mass size (pre-chemotherapy size, post-chemotherapy size, and reduction in size, calculated as [presize − postsize]/presize). Source: Ch. 10, §10.1.4.</p></div>
<p class="src">Source: Ch. 10, §10.1</p>
`
    },
    {
      id: 's3',
      title: 'Selecting on missingness and distribution',
      html: `
<p>After restricting the list by knowledge, the distributions of the remaining predictors can be examined. This is done without relating them to the outcome.</p>
<h3>Missing values</h3>
<p>A candidate with a large share of missing values can be eliminated, especially when two conditions hold:</p>
<ul>
<li>the predictor is relatively important in the problem, so that imputing its missing values would be doubted by many readers; or</li>
<li>the predictor will often be missing when the model is applied in practice.</li>
</ul>
<h3>Narrow distributions</h3>
<p>A predictor that has almost the same value in all patients carries little information, and it may be reasonable to drop it, especially if it is not expected to be important. In a stroke prediction study, 6 of 49 potential predictors were eliminated for this reason.</p>
<h3>Infrequent but strong predictors</h3>
<p>The decision is harder when a predictor has a very skewed distribution but is known to be strongly predictive. In GUSTO-I, shock occurred in only 2% of patients, but its univariable odds ratio for mortality was 10.9. The book lists three options:</p>
<ol>
<li>Include the variable, since its effect is large.</li>
<li>Omit it, because the effect cannot be estimated reliably, and warn that the model does not account for shock.</li>
<li>Exclude patients with shock, so that the model applies only to patients without shock.</li>
</ol>
<p>The default preferred in the book is option 1: include important variables even if infrequent. Option 2 is in fact what happens to every variable that is not in a model, because predictions can only use the variables that are in. Option 3 can be defensible when patients with shock are expected to differ in the prognostic relationships of the other predictors, that is, when there is an interaction between shock and other predictors.</p>
<div class="callout mch"><b>Illustrative (synthetic): eclampsia history in a preterm-birth cohort</b><p>In a cohort of 2,000 women, prior eclampsia is recorded in 30 women (1.5%), and a published meta-analysis gives a strong association with preterm birth. Following the default option, include the variable, accepting a wide confidence interval. Excluding the 30 women would restrict the model's applicability to women without a history of eclampsia, which is a decision that should be stated openly.</p></div>
<p class="src">Source: Ch. 10, §10.1.5</p>
`
    },
    {
      id: 's4',
      title: 'Combining similar variables into summary predictors',
      html: `
<p>Sometimes a group of variables measure the same underlying concept. Combining them into one summary predictor replaces several df by one. The grouping can follow subject knowledge or a statistical clustering of the predictors. For example, atherosclerosis is a systemic disease reflected in several symptoms, so the concept "atherosclerotic disease present" could be derived from the presence of any symptom.</p>
<div class="callout book"><b>Book example: simple summary variables built from combinations of predictors</b>
<table class="data">
<tr><th>Concept</th><th>Variables combined</th><th>Range</th></tr>
<tr><td>Atherosclerotic disease (renal artery stenosis prediction)</td><td>Any of: femoral or carotid bruit, angina pectoris, claudication, myocardial infarction, stroke, vascular surgery</td><td>0 to 1</td></tr>
<tr><td>Comorbidity (surgical mortality in oesophageal cancer)</td><td>Count of: chronic pulmonary disease, cardiovascular disease, diabetes, liver disease, renal disease</td><td>0 to 5</td></tr>
<tr><td>Family history (genetic mutation)</td><td>Number of affected first-degree relatives + 0.5 × number of affected second-degree relatives</td><td>0 to 3</td></tr>
</table>
<p>Source: Ch. 10, Table 10.1.</p></div>
<h3>Forms of combination</h3>
<ul>
<li><b>Any-of indicator</b>: 0/1 according to whether at least one component is present.</li>
<li><b>Unweighted sum (count)</b>: with six symptoms the count runs from 0 to 6. If few patients have high counts, the sum can be truncated, for example as 0, 1, 2 and 3 or more, and entered as a linear term at the start of modelling.</li>
<li><b>Weighted sum</b>: pre-defined scores such as the Charlson index or ACE-27 give different weights to different diseases. Because these weights were derived in specific populations, subject-matter knowledge must support that it is reasonable to apply them in another setting.</li>
</ul>
<p>The coding choice depends on sample size. In a very large dataset (for example more than 100,000 records) a detailed coding with a study-specific regression coefficient for each comorbidity is conceivable. In smaller data a simple sum is attractive. A simple unweighted sum can be quite robust and generalise well to new patients, which is why it was used for surgical mortality after oesophagectomy.</p>
<div class="callout mch"><b>Illustrative (synthetic): obstetric risk conditions</b><p>A preeclampsia model could combine chronic hypertension, pre-gestational diabetes, renal disease, autoimmune disease and multiple pregnancy into a count of 0 to 5. The five variables, with possibly small numbers each, become one linear predictor that uses 1 df.</p></div>
<p class="src">Source: Ch. 10, §10.2 and Table 10.1</p>
`
    },
    {
      id: 's5',
      title: 'Testing the equal-weights assumption',
      html: `
<p>A simple sum assumes that every component carries the same weight on the log-odds scale. This assumption can be checked. Start with a model that contains the sum score. Then add the components one at a time (each in a separate model). The coefficient of an added component measures the <b>deviation</b> of that condition from the common effect implied by the other conditions. The approach can be extended to a single <b>overall test</b>: compare the model with the sum score alone against the model with the sum score plus all but one of the components (the last component cannot be added, as the sum score already determines it). The difference in model χ² is tested on as many df as components added.</p>
<div class="callout book"><b>Book example: comorbidity sum score and 30-day mortality after oesophageal cancer surgery (2,041 SEER-Medicare patients, 221 deaths)</b>
<table class="data">
<tr><th>Model</th><th>Coefficient (± SE)</th><th>P-value</th></tr>
<tr><td>Comorbidity sum score</td><td>0.44 (± 0.13)</td><td>&lt;0.001</td></tr>
<tr><td>+ chronic pulmonary disease</td><td>−0.22 (± 0.31)</td><td>0.48</td></tr>
<tr><td>+ cardiovascular disease</td><td>−0.13 (± 0.33)</td><td>0.69</td></tr>
<tr><td>+ diabetes</td><td>+0.32 (± 0.29)</td><td>0.27</td></tr>
<tr><td>+ liver disease</td><td>+1.31 (± 1.03)</td><td>0.20</td></tr>
<tr><td>+ renal disease</td><td>−1.09 (± 1.11)</td><td>0.33</td></tr>
<tr><td>Overall test of deviations (4 df)</td><td>χ² = 3.6</td><td>0.46</td></tr>
</table>
<p>Source: Ch. 10, Table 10.2.</p></div>
<p>The deviations for liver disease and renal disease look large, and renal disease even has the opposite sign, but their standard errors are about as large as the estimates because few patients have these conditions. None is statistically significant, and the overall test did not reject equal weights, so the authors kept the simple assumption of a similar effect for all comorbidities.</p>
<div class="callout eg"><b>Worked example: the Wald z for each deviation</b>
<p>The z statistic is the coefficient divided by its standard error. For diabetes, z = 0.32 / 0.29 = 1.10; for liver disease 1.31 / 1.03 = 1.27; for renal disease −1.09 / 1.11 = −0.98; for chronic pulmonary disease −0.22 / 0.31 = −0.71; for cardiovascular disease −0.13 / 0.33 = −0.39. All absolute values are below 1.96, so none is individually significant at the 5% level, matching the p-values. Under a chi-square distribution with 4 df, a statistic of 3.6 has p = exp(−1.8) × (1 + 1.8) = 0.46 (for 4 df the tail probability is exp(−x/2) × (1 + x/2)).</p></div>
<div class="callout warn"><b>Note on interpretation</b><p>A non-significant deviation test is not proof that all weights are equal. In smaller samples the test has little power. The argument for the simple sum is that it is robust and uses 1 df, and the test finds no strong evidence that this simplification is harmful.</p></div>
<p class="src">Source: Ch. 10, §10.2.1 to §10.2.2</p>
`
    },
    {
      id: 's6',
      title: 'Logical weights and statistical combination',
      html: `
<h3>Weights from a logical relationship</h3>
<p>If weights are not equal, they can sometimes be set from a known relationship rather than estimated. For family history, the genetic distance between second-degree and first-degree relatives is 0.5, and between third-degree and first-degree relatives is 0.25. This relationship can define a family-history score:</p>
<div class="formula">Family history score = (number of affected first-degree relatives) + 0.5 × (number of affected second-degree relatives)</div>
<p>This coding was used in a model to predict the likelihood of a mutation in people suspected of Lynch syndrome. A person with one affected first-degree relative gets the same score (1) as a person with two affected second-degree relatives. An implicit assumption is that the numbers at risk are similar for first-degree and second-degree relatives, with similar numbers and similar age distributions. The weights are fixed in advance and cost no df; one coefficient, estimated from the data, applies to the whole score.</p>
<h3>Statistical combination: principal components</h3>
<p>Harrell proposed principal component analysis to summarise the information from all candidate predictors. It does not use the predictor-outcome relationship, and empirical evaluations have been promising. The drawbacks are theoretical and practical: the coefficients of the resulting components lose their interpretability, and all predictor values must be known in order to compute any prediction. The book notes that few modelling studies have used it, but the concept should be kept in mind. There is some similarity with clustering approaches used for genetic markers.</p>
<div class="callout eg"><b>Worked example: family history score</b>
<table class="data">
<tr><th>Woman</th><th>First-degree affected</th><th>Second-degree affected</th><th>Score</th></tr>
<tr><td>A</td><td>1</td><td>0</td><td>1 + 0 = 1</td></tr>
<tr><td>B</td><td>0</td><td>2</td><td>0 + 1 = 1</td></tr>
<tr><td>C</td><td>2</td><td>1</td><td>2 + 0.5 = 2.5</td></tr>
<tr><td>D</td><td>0</td><td>3</td><td>0 + 1.5 = 1.5</td></tr>
</table>
<p>Women A and B get the same score and hence the same prediction. The model cannot distinguish them, which is a deliberate simplification.</p></div>
<p class="src">Source: Ch. 10, §10.2.3 to §10.2.4</p>
`
    },
    {
      id: 's7',
      title: 'Averaging effects over subgroups',
      html: `
<p>A <b>main effect</b> in a regression model is an average over the underlying subgroup effects. If the true effect of a predictor differs between subgroups (an interaction), the main effect describes the average. This averaging is reasonable as long as no strong interaction exists, and it adds robustness because the effect is estimated from all patients. The same idea applies in randomised trials: the main question is the average treatment effect, and subgroup effects are usually secondary analyses.</p>
<h3>Example: one model or two?</h3>
<p>In predicting <i>Chlamydia trachomatis</i> infection, the traditional focus was on women. When data are available for both sexes there is a choice. A model for men fitted independently of the model for women is equivalent to assuming interactions between sex and every predictor. Each model fits its own pattern, but the predictions are less reliable because the sample size of each is smaller. The alternative is to begin with a combined model that assumes similar effects in men and women, and test the assumption with interaction terms of sex × predictor. In that study only the effect of urogenital symptoms clearly differed by sex.</p>
<h3>Example: should acute-surgery patients be included?</h3>
<p>A model for patients undergoing elective valve replacement was developed in a dataset that also contained patients having acute valve surgery, who are at higher risk. The authors included them, with a main effect for elective versus acute surgery. They found no evidence that predictor effects differed between the two groups, neither for any individual predictor nor in an overall test for interaction. The reasoning is that, provided the bias from differing effects is smaller than the gain in precision from a larger sample, including the extra patients helps.</p>
<p>There is a paradox here that the book points out: a limited sample size also limits the power to detect differing effects. A finding of "no interaction" in a small sample therefore does not prove that the effects are the same. The decision rests mainly on subject-matter knowledge of whether effects would be so different that the total group cannot be modelled together.</p>
<div class="callout mch"><b>Illustrative (synthetic): early-onset sepsis in term and late-preterm neonates</b><p>A team has 700 neonates (92 with sepsis) and wonders whether to build separate models for term and late-preterm babies. Separate models would each have fewer events, roughly 46 each if the groups were equal. A single model with a main effect for prematurity category, and a few pre-specified interactions if justified by clinical reasoning, uses the events more efficiently.</p></div>
<p class="src">Source: Ch. 10, §10.3</p>
`
    },
    {
      id: 's8',
      title: 'Case study: combining family-history predictors for a genetic mutation',
      html: `
<p>The book illustrates the principles with a model for the presence of a mutation in mismatch-repair genes (Lynch syndrome, hereditary nonpolyposis colorectal cancer, HNPCC). The development sample had 898 patients tested for mutations, 130 of whom carried one. Predictors concern cancers in the patient (the proband) and in first-degree and second-degree relatives: colorectal cancer (CRC), adenoma (a polyp that may precede CRC), endometrial cancer and other HNPCC-related cancers. The patient numbers with CRC were 536, with endometrial cancer 91, and with other related cancer 100; 118 had multiple cancers.</p>
<h3>Step 1: one age effect for related conditions</h3>
<p>A younger age at CRC diagnosis in the proband raises the likelihood of a mutation, and so does a second CRC. Dummy variables CRC1 and CRC2 indicate one or two CRCs. The age at diagnosis can be added as a linear term, either with a separate age slope for CRC1 and CRC2 (4 df) or with one common slope (3 df, the variable "CRCage"). The estimated slopes were −0.40 and −0.32 per decade, and the difference was far from significant (p = 0.80). Adding a square term (p = 0.50) or an RCS (non-linearity p = 0.76 with 3 knots and p = 0.94 with 4 knots) did not improve the fit. Dichotomising age at 50 performed worse.</p>
<div class="callout book"><b>Book example: alternative codings of CRC in the proband (898 patients, 130 mutations)</b>
<table class="data">
<tr><th>Model</th><th>df</th><th>R²</th><th>c statistic</th></tr>
<tr><td>CRC1 &lt;50 + CRC2 &lt;50</td><td>2</td><td>4.6%</td><td>0.602</td></tr>
<tr><td>Four dummies (1 or 2 CRCs, age &lt;50 or ≥50)</td><td>4</td><td>6.9%</td><td>0.634</td></tr>
<tr><td>CRC1 + CRC2 + single linear CRCage</td><td>3</td><td>7.6%</td><td>0.651</td></tr>
<tr><td>CRC1 + CRC2 + separate age slopes</td><td>4</td><td>7.6%</td><td>0.649</td></tr>
</table>
<p>Source: Ch. 10, Table 10.3. The single linear age effect (3 df) is preferred.</p></div>
<h3>Step 2: adenoma and CRC share one age effect</h3>
<p>Adenomas are precursors of CRC, so a diagnosis 10 years younger is expected, a priori, to have a similar effect for adenoma and CRC. The separate age coefficients were −0.38 (CRC) and −0.36 (adenoma). To force one coefficient the two ages are summed in one variable; for patients without the diagnosis the age is set to 45 years, close to the average age at CRC diagnosis, which does not affect the slope because the indicator variables absorb the difference. The common coefficient was −0.37 per decade.</p>
<h3>Step 3: family history</h3>
<p>The same logic applies to relatives, whose CRC and age at diagnosis also matter. The family-history count CRCfam = CRC1st + 0.5 × CRC2nd (Section 6) replaces separate dummies for 1 or 2 first-degree and 1 or 2 second-degree relatives. Four separate age effects, for proband CRC, adenoma, CRC in first-degree and in second-degree relatives, were replaced by one age effect through the sum of the four ages.</p>
<div class="callout book"><b>Book example: model with 11 df versus 5 df</b>
<table class="data">
<tr><th>Model</th><th>df</th><th>R²</th><th>c</th></tr>
<tr><td>Proband CRC and adenoma age separately, plus adenoma, CRC1, CRC2</td><td>5</td><td>8.4%</td><td>0.662</td></tr>
<tr><td>Same with one common proband age effect</td><td>4</td><td>8.4%</td><td>0.662</td></tr>
<tr><td>Four separate age effects, with family history dummies (CRC in first-degree 0, 1, 2; second-degree 0, 1, 2)</td><td>11</td><td>19.4%</td><td>0.767</td></tr>
<tr><td>One age effect, CRCfam score, adenoma, CRC1, CRC2</td><td>5</td><td>18.3%</td><td>0.757</td></tr>
</table>
<p>Source: Ch. 10, Table 10.4.</p></div>
<p>The 5-df model performs almost as well as the 11-df model, so 6 df were saved with little loss in apparent performance. Better stability and better generalisation to new patients are expected.</p>
<h3>The final model</h3>
<p>Endometrial cancer and other HNPCC cancers were treated in the same way (an indicator for the proband, an indicator and family score for relatives, plus age effects where relevant), giving a model with only 10 df. Its R² was 24.9% and c = 0.81 in the development data. In a validation set of 1,016 new patients from the same setting, R² was 24.0% and c = 0.80. The similarity of apparent and validation performance shows the benefit of parsimonious coding in relatively small datasets, where a complex model would produce unstable coefficient estimates.</p>
<p class="src">Source: Ch. 10, §10.4 and §10.5</p>
`
    }
  ],
  keyPoints: [
    'Candidate predictors should be limited to what the number of events can support, using methods that ignore the outcome relationship in the data.',
    'A list of about 5 to 20 candidates chosen with subject knowledge is reasonable; 57 candidates with 58 events led to poor validation.',
    'Drop candidates with many missing values or narrow distributions, but include an infrequent strong predictor (shock, 2% of patients, OR 10.9) by default.',
    'Related variables can be combined into an any-of indicator, a count, or a logically weighted sum, each costing 1 df.',
    'Test the equal-weights assumption by adding components to the sum score; in the book example the overall test was χ² 3.6 on 4 df, p = 0.46.',
    'A main effect averages over subgroup effects; combined models for two groups assume equal effects, which low power may be unable to refute.',
    'Forcing a single age effect and a weighted family-history score reduced a model from 11 df to 5 df with little loss (R² 19.4% to 18.3%).',
    'These restrictions can exclude a predictor or a specific effect that mattered, so the choice depends on the problem.'
  ],
  quiz: [
    {
      q: 'Which of the following strategies for reducing the candidate list does not use the predictor-outcome relationship in the development data?',
      options: [
        'Keeping only predictors with univariable p below 0.2.',
        'Choosing candidates from a literature review and expert consultation.',
        'Backward elimination from the full model.',
        'Merging categories that show similar outcome rates.'
      ],
      answer: 1,
      why: 'Literature review and expert opinion are external to the data. Univariable screening, backward elimination and merging categories on observed outcome rates all use the outcome relationship in the same sample used to fit and assess the model, and so create optimism.'
    },
    {
      q: 'A comorbidity sum score of five conditions has a coefficient of 0.50 per condition (synthetic). By how much are the odds of the outcome multiplied for a woman with three conditions, compared with a woman with none?',
      options: [
        '1.50',
        '3.00',
        '1.65',
        '4.48'
      ],
      answer: 3,
      why: 'The log odds increase by 3 × 0.50 = 1.50, so the odds ratio is e^1.50 = 4.48. One condition gives e^0.50 = 1.65 (the third option). The values 1.50 and 3.00 treat the coefficient as an odds ratio or multiply it by the count without exponentiating.'
    },
    {
      q: 'In a development dataset, a strongly predictive variable is present in only 2% of patients (univariable OR 10.9 in the book example). Which default does the book prefer?',
      options: [
        'Include it, accepting the imprecision, because the effect is substantial.',
        'Omit it, because a rare variable cannot be estimated reliably.',
        'Exclude all patients with the variable and restrict the model to the rest.',
        'Include it only if its p-value in a stepwise procedure is below 0.05.'
      ],
      answer: 0,
      why: 'The book prefers to include important variables even when infrequent. Omitting is what happens to any variable not in the model, and restricting the population is defensible only if patients with the variable differ in the other predictor effects. The last option brings in the instability of stepwise selection, which is a problem in small samples where the variable is rare.'
    },
    {
      q: 'In the equal-weights check for the comorbidity sum score, the overall test of the four added comorbidities gave χ² = 3.6 on 4 df, p = 0.46. How should this be read?',
      options: [
        'The five comorbidities have been proven to have exactly equal effects.',
        'The sum score must be rejected because χ² is not large.',
        'The weights should be estimated separately because the individual coefficients are not zero.',
        'There is no evidence of deviation from equal weights, so the simple sum was retained, though the test has limited power.'
      ],
      answer: 3,
      why: 'A non-significant overall test gives no evidence against the sum score. It does not prove equality, since some conditions (liver and renal disease) were rare and had wide standard errors. Estimating all weights separately would use 4 more df on the basis of deviations that are statistically indistinguishable from zero.'
    },
    {
      q: 'Using the family-history score (affected first-degree relatives + 0.5 × affected second-degree relatives), what is the score for a woman with one affected first-degree relative and two affected second-degree relatives?',
      options: [
        '1',
        '3',
        '2',
        '2.5'
      ],
      answer: 2,
      why: 'Score = 1 + 0.5 × 2 = 2. The value 3 counts every relative equally. The value 1 ignores the second-degree relatives. The value 2.5 would be obtained with two first-degree and one second-degree relative.'
    },
    {
      q: 'A researcher with an elective-surgery dataset also holds acute-surgery records and finds no significant predictor-by-surgery-type interaction. Which statement fits the book\'s reasoning?',
      options: [
        'Including the acute patients with a main effect is reasonable, but the absence of a significant interaction is limited by sample size, so subject-matter knowledge must guide the decision.',
        'Interaction tests are always powerful, so a non-significant result proves the effects are identical.',
        'Acute patients should always be excluded because they have a different risk.',
        'Separate models for the two groups are preferable because they avoid assumptions.'
      ],
      answer: 0,
      why: 'Higher baseline risk is handled by a main effect. Whether the predictor effects are the same is an assumption that a small sample cannot test with much power, so knowledge of the clinical problem is the main guide. Separate models are equivalent to assuming interactions of every predictor with group, with less precision in each.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Summary score, deviation test and degrees of freedom',
      level: 'Apply',
      scenario: `<p><b>Illustrative (synthetic).</b> A preeclampsia model uses a risk-condition count (0 to 5) made from chronic hypertension, pre-gestational diabetes, renal disease, autoimmune disease and obesity (BMI 30 or more). In the model the count has coefficient 0.50 (log odds per condition). To check equal weights, each condition is added in turn to a model containing the count:</p>
<table class="data">
<tr><th>Condition added</th><th>Deviation coefficient</th><th>SE</th></tr>
<tr><td>Chronic hypertension</td><td>+0.40</td><td>0.25</td></tr>
<tr><td>Pre-gestational diabetes</td><td>−0.20</td><td>0.30</td></tr>
<tr><td>Renal disease</td><td>+0.90</td><td>0.60</td></tr>
<tr><td>Autoimmune disease</td><td>−0.60</td><td>0.55</td></tr>
<tr><td>Obesity</td><td>−0.10</td><td>0.20</td></tr>
</table>
<p>The overall test of the four deviations (any four conditions added to the count) gave χ² = 6.0 on 4 df. For a chi-square with 4 df, the tail probability is exp(−x/2) × (1 + x/2).</p>`,
      questions: [
        '<b>(a)</b> What is the odds ratio for a woman with two conditions and for a woman with three, each compared with no conditions?',
        '<b>(b)</b> Calculate the z statistic for each deviation, and the p-value of the overall test.',
        '<b>(c)</b> Does the evidence support keeping an equal-weights sum? What caution applies?',
        '<b>(d)</b> A family-history model had 11 df with 150 events. A combined coding reduces it to 5 df. Give the events per variable for both.',
        '<b>(e)</b> Compute the family-history score for a woman with 2 affected first-degree and 2 affected second-degree relatives.'
      ],
      answer: `<p><b>(a)</b> Two conditions: log odds 2 × 0.50 = 1.00, OR = e<sup>1.00</sup> = 2.72. Three conditions: 3 × 0.50 = 1.50, OR = e<sup>1.50</sup> = 4.48. Each extra condition multiplies the odds by e<sup>0.50</sup> = 1.65.</p>
<p><b>(b)</b> z = coefficient / SE: hypertension 0.40 / 0.25 = 1.60; diabetes −0.20 / 0.30 = −0.67; renal 0.90 / 0.60 = 1.50; autoimmune −0.60 / 0.55 = −1.09; obesity −0.10 / 0.20 = −0.50. None has |z| above 1.96. Overall: p = exp(−3.0) × (1 + 3.0) = 0.0498 × 4 = 0.199.</p>
<p><b>(c)</b> No individual deviation is significant and the overall p of 0.20 gives no evidence against equal weights, so the sum score may be kept as a robust 1-df predictor. The caution is that the test has limited power, especially for rare conditions such as renal disease, whose deviation (+0.90) is large but imprecise. The simplification is supported by lack of evidence of harm and by its robustness, not by proof of equality.</p>
<p><b>(d)</b> EPV = events / df. For 11 df: 150 / 11 = 13.6. For 5 df: 150 / 5 = 30.0. The restricted model moves from a modest margin above 10 to a level where shrinkage may not be needed (the book gives EPV of 20 or more for a pre-specified model).</p>
<p><b>(e)</b> Score = 2 + 0.5 × 2 = 3.0, the top of the 0 to 3 range listed for this score in the book's Table 10.1.</p>`
    },
    {
      id: 't2',
      title: 'Count the df and EPV of a restricted preterm-birth model',
      level: 'Analyze',
      scenario: `<p>Open the EPV calculator and the Analysis Lab with <b>ptb_dev</b> (synthetic; <span data-live="ptb_dev_events"></span> events). Consider two designs:</p><ul><li><b>Design A:</b> all 14 candidate terms with age as a quadratic (15 df).</li><li><b>Design B:</b> a restricted list chosen from subject knowledge without looking at the outcome: age (quadratic), BMI, Hb, primigravida, prior preterm birth, chronic hypertension, bacteriuria, tobacco (9 df).</li></ul>`,
      questions: [
        '<b>(a)</b> Enter the number of events and the df of each design in the EPV calculator. Report the EPV and verdict band for both.',
        '<b>(b)</b> In the Analysis Lab, take a random subsample of 600 women, fit both designs with no selection and no shrinkage, and compare the apparent and bootstrap-corrected c statistics.',
        '<b>(c)</b> Which design has the larger optimism? Is the corrected performance of Design B necessarily worse than Design A?',
        '<b>(d)</b> What risk did the restriction take?'
      ],
      answer: `<p><b>(a)</b> EPV = events / df, so Design A's EPV is the events divided by 15 and Design B's is the events divided by 9. Design B always has an EPV that is 15/9 = 1.67 times higher. With an incidence of about 12% the full dataset has roughly 240 events, so A has an EPV of about 16 (between 10 and 20) and B about 27 (above 20); the widget shows the exact values for the dataset. At n = 600 the dataset has only about 70 events (incidence about 12%), so Design A has an EPV near 5 and falls in the "below 10, overfitting risk" band, whereas Design B has roughly 8, still below 10 but closer.</p>
<p><b>(b)</b> Design A shows a higher apparent c than its corrected c, and the gap (the optimism) is larger than for Design B, because it spends more df on the same events. Four of its terms (antenatal visits, fetal sex, conception season, height) are noise variables in this dataset: their true effects are zero, so they contribute only optimism.</p>
<p><b>(c)</b> Design A has the larger optimism. The corrected c of Design B is usually equal to or higher than that of Design A at this sample size, since Design B has dropped only the noise predictors and a weak true predictor (low SES, true coefficient 0.12), which cost very little. In a large sample the two corrected values would be close. The restriction in this example worked because it was made with subject knowledge, which happened to agree with the truth.</p>
<p><b>(d)</b> The risk is excluding a predictor that matters. Here SES is truly a weak predictor, so the loss is small, but a restriction that removes a strong predictor (for example, bacteriuria or prior preterm birth) would reduce corrected performance. The chapter notes that omitting a true predictor can be worse than including a noise predictor, so the restriction must be made on sound subject knowledge.</p>`
    },
    {
      id: 't3',
      title: 'Critique a candidate-predictor strategy in a low-birth-weight study',
      level: 'Evaluate',
      scenario: `<p><b>Illustrative (synthetic).</b> A team in a district hospital wants a model for low birth weight (LBW) using records of 800 deliveries, of which 96 had an LBW baby. The data collector abstracted 60 variables, with the continuous ones in several forms (for example Hb, Hb squared and Hb categories). The analysts report: "All 60 variables entered univariable analyses; those with p below 0.2 were entered into a backward stepwise model. Three conditions (eclampsia, in 1.4% of mothers, placental abruption, in 0.8%, and cardiac disease, in 0.9%) were dropped because they were rare, although the literature reports strong associations with LBW. Sums of antenatal complications were not used because the authors said weighting complications equally is arbitrary. Male and female neonates were analysed in separate models of 48 and 48 LBW cases."</p>`,
      questions: [
        '<b>(a)</b> List the strategy problems and state, for each, what the book recommends.',
        '<b>(b)</b> Compute the EPV of the original list if each of the 60 variables used 1 df.',
        '<b>(c)</b> Propose a revised candidate strategy that does not use the outcome relationship.'
      ],
      answer: `<p><b>(a) Point-by-point.</b></p>
<ol>
<li><b>60 candidates for 96 events.</b> Far too many for the sample. Candidates should be limited using subject knowledge and a literature review, with a typical list of about 5 to 20, in line with the effective sample size (the number of events).</li>
<li><b>Univariable screening followed by stepwise selection.</b> Both use the predictor-outcome relationship in the data, so the final model is optimistic and its coefficients biased. The book's fever example (231 children, 58 events, 57 candidates, univariable screening and stepwise) validated poorly. The whole process must be repeated in each bootstrap sample to estimate the optimism (Module 4, Module 8).</li>
<li><b>Multiple forms of the same variable.</b> These multiply the df and the number of tests. Coding should be decided in advance (Module 6).</li>
<li><b>Rare but strong predictors dropped.</b> The default preferred in the book is to include important variables even if infrequent (shock in 2% of GUSTO-I patients with OR 10.9). If they are omitted, the model should say so; excluding patients with these conditions is defensible only if their other predictor effects differ. With 0.8% to 1.4% prevalence the estimates will be imprecise, but a related option is to combine them in a "serious obstetric complication" indicator (any-of), which costs 1 df.</li>
<li><b>Rejecting summary scores as arbitrary.</b> An unweighted sum is simple, robust and 1 df, and the equal-weights assumption can be tested by adding components to the score (the comorbidity example). Subject-matter knowledge should support weighting.</li>
<li><b>Separate models by sex of the neonate.</b> This is the same as assuming sex interacts with every predictor, and halves the events per model (48 each). A combined model with a main effect for sex, and sex × predictor interaction tests, uses the data more efficiently (the chlamydia example), unless clinical knowledge says that effects differ greatly.</li>
</ol>
<p><b>(b)</b> EPV = 96 / 60 = 1.6, far below the minimum of 10. Even after screening to, say, 20 variables, the EPV would be 4.8.</p>
<div class="callout warn"><b>Critical:</b><p>With an EPV of about 1.6 before selection, and a final model chosen by univariable screening plus stepwise selection without bootstrapping the whole process, the reported performance cannot be trusted. This is the situation that produced poor external validation in the book's fever example.</p></div>
<p><b>(c) Revised strategy.</b> Prespecify 8 to 10 candidate terms from literature and clinical review (for example maternal age, BMI or weight, Hb, parity, prior LBW, hypertension in pregnancy, tobacco, antenatal visits and gestation-related markers available at the time of prediction), with continuous predictors given a fixed form such as linear or a 3-knot spline. Combine related complications into an indicator or count. Include the rare but strong conditions through one combined indicator. Use one model for both sexes with a main effect for neonatal sex. With 96 events and about 10 df, EPV is about 9.6, near the minimum, so check the sample against the 10-event rule and consider shrinkage (Module 10).</p>`
    }
  ]
});
