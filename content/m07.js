registerModule({
  id: 'm07',
  num: 7,
  part: 'Development',
  title: 'Restricting and combining candidate predictors',
  book: 'Ch. 10',
  minutes: 65,
  summary: 'How to shorten the list of candidate predictors, and the degrees of freedom they use, without looking at the outcome: subject knowledge, missing values and distributions, combined scores, logical weights and effects averaged over subgroups.',
  objectives: [
    'Tell candidate from included predictors',
    'Shorten the list without using the outcome',
    'Decide on rare but strong predictors',
    'Build and test a summary score',
    'Use logical weights such as family history',
    'Choose one combined model over separate models'
  ],
  format: 'cases',
  reading: [
    { cite: "Steyerberg EW, Eijkemans MJC, Harrell FE Jr, Habbema JDF (2001). Prognostic modeling with logistic regression analysis: in search of a sensible strategy in small data sets. Med Decis Making 21:45-56.", url: "https://doi.org/10.1177/0272989X0102100106", note: "Compares coding, stepwise selection and shrinkage in small samples and favours a well-coded full model with shrinkage." },
    { cite: "Babyak MA (2004). What you see may not be what you get: a brief, nontechnical introduction to overfitting in regression-type models. Psychosom Med 66:411-421.", url: "https://doi.org/10.1097/01.psy.0000127692.23278.a9", note: "A non-technical account of overfitting, and of how variable selection, pre-testing and dichotomising make it worse." },
    { cite: "Courvoisier DS, Combescure C, Agoritsas T, Gayet-Ageron A, Perneger TV (2011). Performance of logistic regression modeling: beyond the number of events per variable, the role of data structure. J Clin Epidemiol 64:993-1000.", url: "https://doi.org/10.1016/j.jclinepi.2010.11.012", note: "Shows that correlated predictors and large effects can cause problems even with more than ten events per variable." },
    { cite: "Harrell FE Jr, Lee KL, Mark DB (1996). Multivariable prognostic models: issues in developing models, evaluating assumptions and adequacy, and measuring and reducing errors. Stat Med 15:361-387.", url: "https://doi.org/10.1002/(SICI)1097-0258(19960229)15:4<361::AID-SIM168>3.0.CO;2-4", note: "A foundational paper on regression modelling strategy for binary, ordinal and time-to-event outcomes, including overfitting and validation." }
  ],
  essentials: `
<ul>
<li>A <b>candidate predictor</b> is any variable or term you consider; an <b>included predictor</b> is one that stays in the final model. Usually there are far more candidates than the events can support.</li>
<li>Some ways of shortening the list use the link between each predictor and the outcome in the data (univariable screening, stepwise selection; Module 8). They add optimism. This module covers the ways that do not: they are free of overfitting.</li>
<li>Start with subject knowledge: a literature review and the views of clinicians. A list of about 5 to 20 candidates is often reasonable.</li>
<li>Drop candidates that are mostly missing, or will often be missing in practice, and those that are almost the same in every woman. Keep a rare predictor with a strong effect, by default.</li>
<li>Combine related variables into one <b>summary score</b>: "any of", a count, or a weighted sum. Several df become one. The equal-weights assumption of a count can be checked.</li>
<li>Weights can come from logic, not data. A family-history score counts first-degree relatives as 1 and second-degree relatives as 0.5.</li>
<li>A <b>main effect</b> is an average over subgroups. One combined model, with a main effect for the subgroup, usually predicts better than separate models with half the events each.</li>
<li>The price of every restriction is that a predictor, or a real difference between subgroups, may be left out. Subject knowledge must guide how far to go.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team\'s first wish list for the booking-visit model has 30 candidate terms, but the development cohort has only 234 preterm births. In this module it shortens and combines the list before fitting anything: by clinical knowledge, by looking at missing values and spread, by building summary scores, and by deciding whether first and later pregnancies need separate models. You do not need the earlier modules for this story.',
  defs: {
    'candidate predictor': 'Any variable or term that is considered for the model before the final choice is made.',
    'included predictor': 'A predictor that remains in the final model.',
    'effective sample size': 'For a yes/no outcome, the size of the smaller outcome group, usually the number of events.',
    'summary score': 'One predictor made by combining several related variables, such as a count of medical conditions.',
    'equal weights': 'The assumption that each part of a summary score raises the log odds by the same amount.',
    'main effect': 'The average effect of a predictor over all women, without allowing it to differ between subgroups.',
    'interaction': 'A difference in the effect of a predictor between subgroups, such as between first and later pregnancies.',
    'publication bias': 'The tendency for strong, significant results to be published more often than weak ones, which makes published effects look too large.',
    'principal component analysis': 'A method that rolls many related predictors into a few summary scores without using the outcome.'
  },
  explainers: [
    {
      id: 'shortlist',
      title: 'Shortening the list without looking at the outcome',
      scenes: [
        { svg: EX.svg((function () { var s = EX.text(40, 40, '30 candidate terms, 234 preterm births', { size: 'm', bold: true }); for (var i = 0; i < 30; i++) s += EX.rect(40 + i * 16, 90, 12, 120, { role: 'obs', op: 0.85, grow: true, d: 0.05 * i }); return s + EX.text(40, 250, '234 ÷ 30 = 7.8 events per term: below 10', { d: 1.8 }); })()),
          say: 'The team starts with 30 candidate terms for 234 preterm births. Shared out, that is fewer than 8 events for each term, below the usual minimum of 10.' },
        { svg: EX.svg((function () { var s = EX.text(40, 40, 'Subject knowledge: drop 8 terms with no plausible link', { size: 'm', bold: true }); for (var i = 0; i < 30; i++) s += EX.rect(40 + i * 16, 90, 12, 120, { role: i < 22 ? 'obs' : 'line', op: 0.85, d: i < 22 ? 0 : 0.6 }); return s + EX.text(40, 250, '234 ÷ 22 = 10.6 events per term', { d: 1.4 }); })()),
          say: 'First, a literature review and the clinicians. Eight terms have no plausible link with early birth, so they go. The 22 that remain have about 11 events each.' },
        { svg: EX.svg((function () { var s = EX.text(40, 40, 'Drop 4: mostly missing, or the same in almost everyone', { size: 'm', bold: true }); for (var i = 0; i < 22; i++) s += EX.rect(40 + i * 16, 90, 12, 120, { role: i < 18 ? 'obs' : 'line', op: 0.85, d: i < 18 ? 0 : 0.6 }); return s + EX.text(40, 250, '234 ÷ 18 = 13.0 events per term', { d: 1.4 }); })()),
          say: 'Next, look at each predictor on its own, without the outcome. Cervical length is missing in most women, and a few items are the same in almost everyone. Four more terms go, leaving 18.' },
        { svg: EX.svg((function () { var s = EX.text(40, 40, 'Combine related items: two scores replace 10 terms', { size: 'm', bold: true }); for (var i = 0; i < 8; i++) s += EX.rect(40 + i * 24, 90, 18, 120, { role: 'obs', op: 0.85 }); s += EX.rect(240, 90, 110, 120, { role: 'obs', op: 0.85, grow: true, d: 0.5 }) + EX.rect(370, 90, 110, 120, { role: 'obs', op: 0.85, grow: true, d: 0.9 }); s += EX.text(295, 228, 'count of 5 conditions', { size: 's', anchor: 'middle', d: 0.7 }) + EX.text(425, 228, 'history score', { size: 's', anchor: 'middle', d: 1.1 }); return s + EX.text(40, 262, '10 terms: 234 ÷ 10 = 23.4 events per term', { d: 1.6 }); })()),
          say: 'Then combine related items. Five medical conditions become one count, and five history items become one score. Ten terms remain, with more than 23 events each.' },
        { svg: EX.svg(EX.text(280, 110, 'From 7.8 to 23.4 events per term', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 150, 'No step looked at preterm births in the data', { anchor: 'middle', d: 0.6 }) + EX.text(280, 178, 'so no step added optimism', { anchor: 'middle', d: 1.1 }) + EX.text(280, 206, 'The risk: a real predictor may have been dropped', { anchor: 'middle', d: 1.6 })),
          say: 'The events per term have risen from about 8 to 23. None of these steps looked at which women delivered early, so none of them made the model look better than it is. The risk is that a real predictor was dropped.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'Thirty candidates for 234 events',
      aim: 'tell candidate from included predictors, and shorten the list with subject knowledge before looking at the outcome.',
      minutes: 15,
      need: `
<p>A <b>candidate predictor</b> is anything you consider for the model: each variable, and each extra term for a curve or a category. An <b>included predictor</b> is one that stays in the final model. For a yes/no outcome, the information is in the events, so the events are the <b>effective sample size</b>. Module 2 asked for at least 10 events per candidate term.</p>
<p><b>Worked example.</b> 234 preterm births and 30 candidate terms give 234 ÷ 30 = 7.8 events per term. To reach 10, the list must shrink to 23 terms (234 ÷ 10 = 23.4), or the team needs 300 events.</p>
<p>There are two kinds of way to shorten the list:</p>
<ul>
<li><b>Ways that ignore the outcome:</b> subject knowledge, the literature, missing values, how each predictor is spread, combining related variables, and averaging effects over subgroups. They cost nothing in optimism. They are the subject of this module.</li>
<li><b>Ways that use the outcome:</b> univariable screening ("keep p below 0.2") and stepwise selection. They shrink the model but add bias and optimism (Module 8).</li>
</ul>
<p><b>Subject knowledge first.</b> Review the literature and ask clinicians. A list of about 5 to 20 candidates is often reasonable. In a book example, a model built from 57 candidates with only 58 events looked fine in its own data but did poorly in new patients.</p>
<p><b>Using published reviews.</b> A meta-analysis can help, with three cautions. Studies often leave out effects that were not significant, so published effects are too large (<b>publication bias</b>). Two predictors that work against each other can each look useless on their own (suppression), though this is rare. And counting how often a predictor was "important" picks out key predictors, but a pooled estimate needs a formal meta-analysis.</p>
<div data-explainer="shortlist"></div>`,
      scenario: `<p>The team's wish list has 30 candidate terms. Age needs 2 terms for its curve. Then come BMI, Hb, height and past pregnancies. There are five medical conditions, family history, lifestyle and social items, and a scan measure. Some items are there only "because the register has them". The cohort, ptb_dev, has 234 preterm births.</p>`,
      widgets: `<div data-widget="epvCalculator" data-try="Enter 234 events and 30 parameters, then lower the parameters to 10 and watch the verdict change."></div>`,
      tasks: [0, 1],
      takeaway: 'Fit the candidate list to the number of events, and shorten it first with knowledge that does not come from the outcome in your data.'
    },
    {
      id: 'c2',
      title: 'Missing values, narrow spread and rare strong predictors',
      aim: 'decide which candidates to drop because of missing values or narrow spread, and what to do with a rare but strong predictor.',
      minutes: 15,
      need: `
<p>After subject knowledge, look at each predictor on its own: how often it is missing and how it is spread. This does not use the outcome.</p>
<p><b>Many missing values.</b> A candidate that is often missing can be dropped, especially when:</p>
<ul>
<li>it is an important predictor, so many readers would doubt imputed values for it; or</li>
<li>it will often be missing when the model is used in practice.</li>
</ul>
<p><b>Worked example.</b> If each of 10 predictors is missing in 5 women per 100, and the gaps fall in different women, only 0.95<sup>10</sup> = 60 per 100 women have every value. Complete-case analysis would keep about 140 of 234 events. Imputation (Module 5) avoids this loss for predictors you keep.</p>
<p><b>Narrow spread.</b> A predictor that is almost the same in every woman carries little information. It can be dropped, especially if it is not expected to matter. In a book example on stroke, 6 of 49 possible predictors were dropped for this reason.</p>
<p><b>Rare but strong.</b> The hard case is a predictor that few women have but that is known to be strongly linked to the outcome. In the book's GUSTO-I trial, shock occurred in only 2% of patients, but its odds ratio for death was 10.9. There are three options:</p>
<ol>
<li>Include it, because its effect is large. This is the book's default.</li>
<li>Leave it out, and warn that the model ignores it. (This is in effect what happens to every variable that is not in a model.)</li>
<li>Exclude women who have it, so that the model applies only to the others. This makes sense if the other predictors work differently in them (an interaction).</li>
</ol>`,
      scenario: `<p>In ptb_dev, booking Hb is missing for 307 of 2,000 women (15%). Cervical length by ultrasound was recorded for only 12% of women, mostly those referred with symptoms. Rhesus-negative blood group is recorded in 2% of women, and eclampsia in a previous pregnancy in 1.5%.</p>`,
      widgets: `<div data-widget="completeCaseLoss" data-try="Set 10 predictors, 5% missing each and 234 events, then raise the missing share to 15% and watch the events per variable fall."></div>`,
      tasks: [2, 3],
      takeaway: 'Drop candidates that are mostly missing or barely vary, but by default keep a rare predictor with a strong, known effect.'
    },
    {
      id: 'c3',
      title: 'Combining medical conditions into one score',
      aim: 'build a summary score from related variables, test its equal-weights assumption, and use logical weights.',
      minutes: 20,
      need: `
<p>Some variables measure one underlying idea. Combining them into one <b>summary score</b> replaces several df by one. There are three common forms:</p>
<ul>
<li><b>Any of:</b> 1 if at least one condition is present, otherwise 0.</li>
<li><b>Count (unweighted sum):</b> the number of conditions present, for example 0 to 5. If few women have high counts, cap it, for example 0, 1, 2, 3 or more, and enter it as a straight line.</li>
<li><b>Weighted sum:</b> an existing index such as the Charlson comorbidity index. Its weights came from other populations, so you need good reasons to use them in yours.</li>
</ul>
<p>A simple count is robust and often works well in new women. Very large datasets (say over 100,000 records) could afford a coefficient for each condition.</p>
<p><b>Worked example.</b> If the count has a coefficient of 0.50, each condition multiplies the odds by e<sup>0.50</sup> = 1.65. Two conditions: e<sup>2 × 0.50</sup> = 2.72.</p>
<p><b>Testing equal weights.</b> A count assumes every condition has the same effect. To check, add each condition in turn to a model that has the count. Its coefficient is its <b>deviation</b> from the common effect, and z = coefficient ÷ SE. For an overall test, add all but one of the conditions together (the last is fixed by the count) and compare the chi-square on that many df. A non-significant test is no proof of equal weights, because the test has little power for rare conditions.</p>
<p><b>Logical weights.</b> Weights can come from known relations instead of data. Second-degree relatives share half as many genes with a woman as first-degree relatives, so:</p>
<div class="formula">family-history score = first-degree relatives affected + 0.5 × second-degree relatives affected</div>
<p>The weights are fixed in advance, and the whole score uses one coefficient (1 df).</p>`,
      scenario: `<p>The team has five medical conditions on its list: chronic hypertension, diabetes before pregnancy, kidney disease, autoimmune disease and thyroid disease. Some are rare. It also wants to use a family history of preterm birth, recorded for mothers, sisters, grandmothers and aunts.</p>`,
      widgets: '',
      tasks: [4, 5],
      takeaway: 'A count or a logically weighted score turns several related variables into one df; test equal weights, but read a non-significant test with care.'
    },
    {
      id: 'c4',
      title: 'One model or two?',
      aim: 'see why a main effect averages over subgroups, and when one combined model beats separate models.',
      minutes: 15,
      need: `
<p>A <b>main effect</b> is an average of the effects in the subgroups. If a predictor truly works differently in two groups (an <b>interaction</b>), the main effect describes their average. This is reasonable when there is no strong interaction, and it is more stable, because every woman helps estimate the effect.</p>
<p><b>Separate models</b> for two groups are the same as assuming that every predictor interacts with the group. Each model fits its own pattern, but each has fewer events, so its predictions are less reliable.</p>
<p><b>Worked example.</b> With 234 events and a list of 10 terms, one model has 23.4 events per term. Split into two groups with about 117 events each, and each model has 11.7 per term.</p>
<p>The usual plan is to start with one model, with a main effect for the group (which handles a different baseline risk), and test a few interactions chosen for clinical reasons. The paradox: a small sample also has little power to find an interaction, so "no significant interaction" does not prove that effects are equal. Subject knowledge decides whether the groups are too different to model together.</p>
<p><b>Book example (Lynch syndrome mutation, 898 patients, 130 mutations).</b> Separate age effects and family-history dummies used 11 df (R² 19.4%, c 0.767). One common age effect and a family-history score used 5 df (R² 18.3%, c 0.757): 6 df saved, little lost. The final model had 10 df: c 0.81 in its own data and 0.80 in 1,016 new patients.</p>`,
      scenario: `<p>The team's obstetrician says that first pregnancies are "a different problem". She asks for two models. One would be for women in their first pregnancy. The other would be for women who have been pregnant before.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'Prefer one model with a main effect for the subgroup and a few planned interactions; separate models halve the events and assume every effect differs.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Why restrict candidates',
      html: `
<p>Small samples give low power and, if all candidates are fitted, overfitted, too extreme predictions (Module 4). Strategies that do not use the predictor-outcome relation (subject knowledge, literature, missingness, distribution, combining, averaging over subgroups) are free of this cost. Univariable screening and stepwise selection use it and cause bias and overfitting (Module 8). The aim is a limited list that can all enter one full model.</p>
<p>The chapter's recommendations: (1) match the number of candidates to the effective sample size (events for a binary outcome), restricting more in small samples; (2) exclude candidates with many missing values or narrow distributions; (3) combine related predictors into summary scores; (4) average effects across subgroups for stability. The risk is excluding a predictor, or a specific effect, that mattered.</p>
<p class="src">Source: Ch. 10, background, §10.5</p>`
    },
    {
      id: 'n2',
      title: 'Subject knowledge and meta-analysis',
      html: `
<p>Building a model without subject knowledge, and without a very large sample, is described as nearly impossible. About 5 to 20 candidates is often reasonable; even in genetics at most about 20 genes has been suggested, though simulations show many may be needed if each effect is small.</p>
<div class="callout book"><b>Book example: children with fever without a source</b><p>Models for serious bacterial infection were developed in 231 children (58 with the diagnosis) from 57 candidates, with univariable screening and stepwise selection (EPV about 1). External validation was poor; bootstrapping the whole process showed a large drop in performance, much of it due to too many candidates for the events.</p></div>
<p>Reviews of univariable effects help, with limits: <b>suppression</b> (negatively correlated predictors may show no univariable effect, though medical predictors are mostly positively correlated, so univariable effects usually exceed multivariable ones); counting "important" findings versus formal pooling (needed for prior estimates); and <b>publication bias</b>, which makes published effects too extreme.</p>
<div class="callout book"><b>Book example: testicular cancer</b><p>A review supplied the core predictors for residual-mass histology; fine-tuning covered transformations and the choice among three size variables (size before chemotherapy, size after, and the reduction: [size before − size after] ÷ size before).</p></div>
<p class="src">Source: Ch. 10, §10.1-10.1.4</p>`
    },
    {
      id: 'n3',
      title: 'Missingness and distribution',
      html: `
<p>Without relating predictors to the outcome, drop candidates with many missing values, especially if the predictor is important (so imputation would be doubted) or will often be missing in practice. Drop predictors with narrow distributions if not expected to be important (a stroke study dropped 6 of 49 on this ground).</p>
<p>Infrequent but strong predictors: GUSTO-I shock, 2% of patients, univariable OR 10.9. Options: include (the preferred default); omit and warn (what happens to any variable not in a model); or exclude such patients, defensible when they differ in the effects of other predictors (interaction).</p>
<p class="src">Source: Ch. 10, §10.1.5</p>`
    },
    {
      id: 'n4',
      title: 'Summary scores and the equal-weights test',
      html: `
<table class="data">
<tr><th>Concept (Table 10.1)</th><th>Combination</th><th>Range</th></tr>
<tr><td>Atherosclerosis (renal artery stenosis)</td><td>Any of: femoral or carotid bruit, angina, claudication, myocardial infarction, stroke, vascular surgery</td><td>0-1</td></tr>
<tr><td>Comorbidity (oesophagectomy mortality)</td><td>Count of pulmonary, cardiovascular, diabetes, liver, renal disease</td><td>0-5</td></tr>
<tr><td>Family history (mutation)</td><td>First-degree + 0.5 × second-degree relatives affected</td><td>0-3</td></tr>
</table>
<p>Groupings follow subject knowledge or statistical clustering. Sums can be truncated (0, 1, 2, ≥3) and entered linearly. Weighted indices (Charlson, ACE-27) need subject-matter support in a new setting. With more than about 100,000 records, condition-specific coefficients become possible; in smaller data a simple sum is robust.</p>
<div class="callout book"><b>Book example: comorbidity and 30-day mortality after oesophagectomy (2,041 SEER-Medicare patients, 221 deaths), Table 10.2</b>
<table class="data">
<tr><th>Model</th><th>Coefficient (SE)</th><th>p</th></tr>
<tr><td>Sum score</td><td>0.44 (0.13)</td><td>&lt;0.001</td></tr>
<tr><td>+ pulmonary</td><td>−0.22 (0.31)</td><td>0.48</td></tr>
<tr><td>+ cardiovascular</td><td>−0.13 (0.33)</td><td>0.69</td></tr>
<tr><td>+ diabetes</td><td>+0.32 (0.29)</td><td>0.27</td></tr>
<tr><td>+ liver</td><td>+1.31 (1.03)</td><td>0.20</td></tr>
<tr><td>+ renal</td><td>−1.09 (1.11)</td><td>0.33</td></tr>
<tr><td>Overall, 4 df</td><td>χ² 3.6</td><td>0.46</td></tr>
</table>
<p>Equal weights were kept. For 4 df, p = exp(−x/2)(1 + x/2) = exp(−1.8) × 2.8 = 0.46.</p></div>
<p class="src">Source: Ch. 10, §10.2-10.2.2, Tables 10.1-10.2</p>`
    },
    {
      id: 'n5',
      title: 'Logical weights, principal components and subgroups',
      html: `
<p><b>Logical weights:</b> genetic distance is 0.5 for second-degree and 0.25 for third-degree relatives, giving a family-history score used to predict mismatch-repair mutations (Lynch syndrome). It assumes similar numbers and ages of first- and second-degree relatives at risk.</p>
<p><b>Principal components</b> (Harrell) summarise all candidates without the outcome; evaluations are promising, but components are hard to interpret and every predictor must be known to predict. Few studies use it; it resembles clustering of genetic markers.</p>
<p><b>Averaging over subgroups:</b> a main effect averages subgroup effects and adds robustness. Book examples: for <i>Chlamydia trachomatis</i>, separate models for men and women equal assuming sex interactions with every predictor; a combined model with sex × predictor tests found only urogenital symptoms differed by sex. In elective valve replacement, acute-surgery patients were included with a main effect; no individual or overall interaction was found. Including extra patients helps if the bias from differing effects is smaller than the gain in precision, but limited samples have little power to detect interactions, so subject knowledge decides.</p>
<p class="src">Source: Ch. 10, §10.2.3-10.3</p>`
    },
    {
      id: 'n6',
      title: 'Case study: Lynch syndrome mutation model',
      html: `
<p>898 patients tested, 130 mutation carriers; predictors were colorectal cancer (CRC), adenoma, endometrial and other related cancers in the proband and in first- and second-degree relatives (probands with CRC 536, endometrial cancer 91, other related cancer 100, multiple cancers 118). Proband CRC age slopes were −0.40 and −0.32 per decade for one and two CRCs (difference p = 0.80); a square term (p = 0.50) or RCS (p = 0.76 with 3 knots, 0.94 with 4) did not help; a cut at age 50 was worse.</p>
<table class="data">
<tr><th>Coding (Table 10.3)</th><th>df</th><th>R²</th><th>c</th></tr>
<tr><td>CRC1 &lt;50 + CRC2 &lt;50</td><td>2</td><td>4.6%</td><td>0.602</td></tr>
<tr><td>Four dummies</td><td>4</td><td>6.9%</td><td>0.634</td></tr>
<tr><td>CRC1 + CRC2 + one linear age</td><td>3</td><td>7.6%</td><td>0.651</td></tr>
<tr><td>Separate age slopes</td><td>4</td><td>7.6%</td><td>0.649</td></tr>
</table>
<p>Adenoma and CRC age effects (−0.36 and −0.38) were forced into one (−0.37 per decade) by summing ages, with age set to 45 for patients without the diagnosis.</p>
<table class="data">
<tr><th>Model (Table 10.4)</th><th>df</th><th>R²</th><th>c</th></tr>
<tr><td>Proband CRC and adenoma ages separate</td><td>5</td><td>8.4%</td><td>0.662</td></tr>
<tr><td>One proband age effect</td><td>4</td><td>8.4%</td><td>0.662</td></tr>
<tr><td>Four age effects, family dummies</td><td>11</td><td>19.4%</td><td>0.767</td></tr>
<tr><td>One age effect, CRCfam score</td><td>5</td><td>18.3%</td><td>0.757</td></tr>
</table>
<p>Endometrial and other related cancers were coded the same way (proband indicator, relative indicator and family score, with age effects where relevant). Final model, 10 df: R² 24.9%, c 0.81 at development; 24.0% and 0.80 in 1,016 new patients.</p>
<p class="src">Source: Ch. 10, §10.4, Tables 10.3-10.4</p>`
    }
  ],
  keyPoints: [
    'Limit candidate predictors to what the number of events can support, using methods that ignore the outcome relation in the data.',
    'A list of about 5 to 20 candidates chosen with subject knowledge is reasonable; 57 candidates with 58 events led to poor validation.',
    'Drop candidates with many missing values or narrow distributions, but include an infrequent strong predictor (shock, 2%, OR 10.9) by default.',
    'Related variables can be combined into an any-of indicator, a count or a logically weighted sum, each costing 1 df.',
    'Test equal weights by adding components to the sum score; in the book example the overall test was χ² 3.6 on 4 df, p = 0.46, and the test has limited power.',
    'A main effect averages over subgroups; separate models assume every effect differs and halve the events, and low power cannot prove that effects are equal.',
    'A common age effect and a family-history score cut a model from 11 to 5 df with little loss (R² 19.4% to 18.3%).',
    'Every restriction risks excluding a predictor or effect that mattered, so subject knowledge must guide it.'
  ],
  quiz: [
    {
      q: 'Which way of shortening the preterm candidate list does not use the relation between predictors and preterm birth in the development data?',
      options: [
        'Keeping only predictors with a univariable p-value below 0.2.',
        'Choosing candidates from a literature review and the views of clinicians.',
        'Backward elimination from the full model.',
        'Merging parity groups that have similar preterm rates.'
      ],
      answer: 1,
      why: 'A literature review and expert opinion come from outside the data. Univariable screening, backward elimination and merging groups by their observed preterm rates all use the outcome in the same sample that is used to fit and judge the model, and so add optimism.'
    },
    {
      q: 'A count of five medical conditions has a coefficient of 0.50 per condition (synthetic). By how much are the odds of preterm birth multiplied for a woman with three conditions, compared with a woman with none?',
      options: [
        '1.50',
        '3.00',
        '1.65',
        '4.48'
      ],
      answer: 3,
      why: 'The log odds rise by 3 × 0.50 = 1.50, so the odds ratio is e^1.50 = 4.48. One condition gives e^0.50 = 1.65. The value 1.50 is the change in log odds, not yet exponentiated, and 3.00 simply counts the conditions.'
    },
    {
      q: 'Eclampsia in a previous pregnancy is recorded in 1.5% of women, and published studies show a strong link with preterm birth. What is the book\'s default?',
      options: [
        'Include it, accepting a wide confidence interval, because its effect is large.',
        'Leave it out, because a rare predictor cannot be estimated well.',
        'Exclude the women who have it, and restrict the model to the others.',
        'Include it only if it survives stepwise selection at p below 0.05.'
      ],
      answer: 0,
      why: 'The book prefers to include important predictors even when they are rare. Leaving it out is what happens to any variable not in the model, so the model would silently ignore it. Excluding the women is defensible only if the other predictors work differently in them. Stepwise selection is unstable for a rare predictor in a small sample.'
    },
    {
      q: 'The team adds each of the five conditions to a model containing the count. The overall test of four added conditions gives χ² = 6.0 on 4 df, p = 0.20. How should this be read?',
      options: [
        'The five conditions are proven to have equal effects.',
        'The count must be rejected, because the chi-square is not zero.',
        'There is no evidence against equal weights, so the count can be kept, but the test has little power for rare conditions.',
        'Each condition should get its own coefficient, because some deviations are not zero.'
      ],
      answer: 2,
      why: 'A non-significant test gives no evidence against the count, but it does not prove equality, since rare conditions have large standard errors. A chi-square is never exactly zero by chance. Estimating every weight would spend 4 more df on deviations that cannot be told apart from zero.'
    },
    {
      q: 'Using the family-history score (first-degree relatives + 0.5 × second-degree relatives with a preterm birth), what is the score for a woman whose mother and two aunts had preterm births?',
      options: [
        '1',
        '3',
        '2',
        '2.5'
      ],
      answer: 2,
      why: 'Her mother is a first-degree relative (1) and her aunts are second-degree relatives (2 × 0.5 = 1), so the score is 1 + 1 = 2. The value 3 counts every relative equally. The value 1 ignores the aunts. The value 2.5 would need two first-degree and one second-degree relative.'
    },
    {
      q: 'The team fits one model for all women, with a main effect for first pregnancy, and finds no significant interaction between first pregnancy and the other predictors. Which statement fits the book\'s reasoning?',
      options: [
        'Interaction tests are powerful, so this proves the effects are the same in first and later pregnancies.',
        'The combined model is reasonable, but "no significant interaction" is limited by sample size, so clinical knowledge must also guide the choice.',
        'Separate models are still better, because they make no assumptions.',
        'Women in their first pregnancy should be excluded, because their baseline risk is different.'
      ],
      answer: 1,
      why: 'A different baseline risk is handled by the main effect. Whether the other effects are the same is an assumption that a limited sample tests with little power, so subject knowledge is the main guide. Separate models are not assumption-free: they assume every predictor interacts with the group, and each has fewer events.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Does this step use the outcome?',
      level: 'Understand',
      scenario: `<p>A colleague lists eight steps she might use to shorten the preterm candidate list:</p>
<ol>
<li>Review the literature and ask three senior obstetricians.</li>
<li>Drop every predictor whose univariable p-value is above 0.2.</li>
<li>Drop cervical length, because it is missing for most women.</li>
<li>Merge parity groups whose preterm rates look similar.</li>
<li>Combine five medical conditions into a count.</li>
<li>Run backward elimination from the full model.</li>
<li>Drop a test result that is negative in 99.7% of women and not expected to matter.</li>
<li>Code age as in a published preterm model from another state.</li>
</ol>`,
      questions: [
        '<b>(a)</b> Sort the eight steps into those that ignore the outcome in the data and those that use it.',
        '<b>(b)</b> Why does the difference matter for the model\'s performance in new women?',
        '<b>(c)</b> Which of the outcome-blind steps still carries a risk, and what is it?'
      ],
      answer: `<p><b>(a)</b> Ignore the outcome: 1, 3, 5, 7 and 8. Use the outcome: 2, 4 and 6.</p>
<p><b>(b)</b> Steps that use the outcome pick and shape predictors partly by chance features of this sample, so the model looks better in these data than it will in new women (optimism), and its coefficients are biased. Steps that ignore the outcome cannot fit chance in the outcome, so they add no optimism, and they raise the events per term.</p>
<p><b>(c)</b> All of them: any restriction may drop a predictor, or a real difference in weights, that mattered. The count in step 5 assumes equal weights; dropping in steps 3 and 7 loses whatever those predictors carry. The choices must rest on sound subject knowledge.</p>`
    },
    {
      id: 't1',
      title: 'Events per term before and after shortening',
      level: 'Apply',
      scenario: `<p>Use the EPV calculator in this case. ptb_dev (synthetic) has <span data-live="ptb_dev_events"></span> preterm births. The wish list has 30 candidate terms; the shortened list, made without looking at the outcome, has 10.</p>`,
      questions: [
        '<b>(a)</b> Enter 234 events and 30 parameters. Record the events per variable, the events needed for 10, 20 and 50, and the verdict.',
        '<b>(b)</b> Change the parameters to 10 and record the same values.',
        '<b>(c)</b> The calculator suggests a number of candidates that would reach 10 events per term at 30 parameters. Check it by hand.',
        '<b>(d)</b> The team still wants stepwise selection from the 10 terms. What does the calculator say about that?'
      ],
      answer: `<p><b>(a)</b> 234 ÷ 30 = 7.8 events per variable. Events needed: 10 × 30 = 300; 20 × 30 = 600; 50 × 30 = 1,500. Verdict: below 10, high risk of overfitting.</p>
<p><b>(b)</b> 234 ÷ 10 = 23.4. Events needed: 100, 200 and 500. Verdict: 20 to 50, a prespecified model may not need shrinkage, but data-driven selection is still unreliable.</p>
<p><b>(c)</b> 234 ÷ 10 = 23.4, so at most 23 terms would give 10 events each (234 ÷ 23 = 10.2).</p>
<p><b>(d)</b> Reliable selection from candidates needs about 50 events per term: 500 events for 10 terms, more than twice what the team has. A prespecified model with all 10 terms is the safer plan.</p>`
    },
    {
      id: 't2',
      title: 'How missing values eat the events',
      level: 'Apply',
      scenario: `<p>Use the missing-data widget in this case. The shortened list has 10 predictors and ptb_dev has 234 preterm births.</p>`,
      questions: [
        '<b>(a)</b> Set 10 predictors, 5% missing per predictor and 234 events. Record the share of complete women, the events kept and the EPV for the "independent" row. Check the share by hand.',
        '<b>(b)</b> Raise the missing share to 15%. Record the same values.',
        '<b>(c)</b> What do the other two rows of the table tell you?',
        '<b>(d)</b> Booking Hb is missing for 15% of women but is an important predictor. Should it be dropped?'
      ],
      answer: `<p><b>(a)</b> Share complete = 0.95<sup>10</sup> = 0.599, about 59.9%. Events kept = 234 × 0.599 = 140. EPV = 140 ÷ 10 = 14.0, against 23.4 before any loss.</p>
<p><b>(b)</b> 0.85<sup>10</sup> = 0.197, so about 19.7% of women are complete, 46 events are kept, and the EPV is 4.6, well below 10.</p>
<p><b>(c)</b> They show the range. If each woman misses at most one value, the share complete is as low as 1 − 10 × 0.05 = 50% (at 15% it falls to 0). If all gaps fall in the same women, it is as high as 1 − 0.05 = 95% (EPV 22.2). Real data lie in between.</p>
<p><b>(d)</b> No. Hb is clinically important and is usually measured at booking in practice, so it will be available when the model is used. Keep it and impute its missing values (Module 5) rather than lose women by complete-case analysis. Dropping is for predictors that are mostly missing, especially if they will often be missing in practice.</p>`
    },
    {
      id: 't3',
      title: 'Which candidates go?',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). The team reviews five candidates in ptb_dev, without looking at preterm rates:</p>
<ul>
<li><b>Cervical length</b> by ultrasound: recorded for 12% of women, mostly those referred with symptoms; not done at routine booking.</li>
<li><b>Booking Hb:</b> missing for 15%.</li>
<li><b>Rhesus-negative</b> blood group: 2% of women; no expected link with preterm birth.</li>
<li><b>Eclampsia in a previous pregnancy:</b> 30 women (1.5%); published studies report a strong link with preterm birth.</li>
<li><b>Number of rooms in the home:</b> no missing values; the clinicians see no link beyond what low socio-economic status already captures.</li>
</ul>`,
      questions: [
        '<b>(a)</b> For each candidate, decide keep or drop, and give the reason from the chapter.',
        '<b>(b)</b> For previous eclampsia, describe the three options and their consequences.',
        '<b>(c)</b> How many candidate terms does this review remove?'
      ],
      answer: `<p><b>(a)</b> <b>Cervical length:</b> drop. It is missing for 88% of women and will usually be missing at a booking visit in practice, and imputing it for so many would not be believed. Measured mainly in symptomatic women, it also partly records the clinician's suspicion. <b>Hb:</b> keep and impute; it is important and available in practice. <b>Rhesus-negative:</b> drop; almost every woman has the same value and it is not expected to matter. <b>Previous eclampsia:</b> keep by default (see b). <b>Rooms in the home:</b> drop on subject knowledge; it adds nothing plausible beyond socio-economic status.</p>
<p><b>(b)</b> (1) <b>Include it:</b> the book's default; the coefficient rests on few women and has a wide interval, but the model accounts for a strong risk. (2) <b>Leave it out:</b> the model will give these women the risk of women without the history, so say so openly. (3) <b>Exclude the 30 women:</b> the model then applies only to women without the history, which must be stated; this is sensible only if the other predictors are thought to work differently in them.</p>
<p><b>(c)</b> Three: cervical length, Rhesus group and rooms in the home, each 1 df.</p>`
    },
    {
      id: 't4',
      title: 'Test the equal weights of a condition count',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). A count (0 to 5) of chronic hypertension, diabetes before pregnancy, kidney disease, autoimmune disease and thyroid disease has a coefficient of 0.50. Each condition is added in turn to a model with the count:</p>
<table class="data">
<tr><th>Condition added</th><th>Deviation coefficient</th><th>SE</th></tr>
<tr><td>Chronic hypertension</td><td>+0.40</td><td>0.25</td></tr>
<tr><td>Diabetes before pregnancy</td><td>−0.20</td><td>0.30</td></tr>
<tr><td>Kidney disease</td><td>+0.90</td><td>0.60</td></tr>
<tr><td>Autoimmune disease</td><td>−0.60</td><td>0.55</td></tr>
<tr><td>Thyroid disease</td><td>−0.10</td><td>0.20</td></tr>
</table>
<p>The overall test, with four conditions added together, gives χ² = 6.0 on 4 df. For 4 df the p-value is exp(−x/2) × (1 + x/2).</p>`,
      questions: [
        '<b>(a)</b> Give the odds ratio for two and for three conditions, each against none.',
        '<b>(b)</b> Calculate z for each deviation and the p-value of the overall test.',
        '<b>(c)</b> Should the team keep the equal-weights count? What caution applies?',
        '<b>(d)</b> How many df does the count save compared with five separate conditions?'
      ],
      answer: `<p><b>(a)</b> Two: 2 × 0.50 = 1.00, OR e<sup>1.00</sup> = 2.72. Three: 3 × 0.50 = 1.50, OR e<sup>1.50</sup> = 4.48. Each condition multiplies the odds by e<sup>0.50</sup> = 1.65.</p>
<p><b>(b)</b> z = coefficient ÷ SE: hypertension 0.40 / 0.25 = 1.60; diabetes −0.20 / 0.30 = −0.67; kidney 0.90 / 0.60 = 1.50; autoimmune −0.60 / 0.55 = −1.09; thyroid −0.10 / 0.20 = −0.50. None is beyond ±1.96. Overall: p = exp(−3.0) × (1 + 3.0) = 0.0498 × 4 = 0.20.</p>
<p><b>(c)</b> Yes, keep it: no deviation is significant and the overall p of 0.20 gives no evidence against equal weights, and the count is a robust 1-df predictor. The caution: the test has little power for rare conditions. Kidney disease has a large deviation (+0.90) with a large SE. The count is kept because there is no evidence that it harms prediction, not because equality is proven.</p>
<p><b>(d)</b> Five separate conditions use 5 df; the count uses 1, saving 4 df.</p>`
    },
    {
      id: 't5',
      title: 'A family-history score with logical weights',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). Family history of preterm birth is scored as (first-degree relatives affected) + 0.5 × (second-degree relatives affected). First-degree: mother, sisters. Second-degree: grandmothers, aunts. In the model the score has a coefficient of 0.40.</p>
<table class="data">
<tr><th>Woman</th><th>Affected relatives</th></tr>
<tr><td>A</td><td>Mother</td></tr>
<tr><td>B</td><td>Two aunts</td></tr>
<tr><td>C</td><td>Mother, one sister and one grandmother</td></tr>
<tr><td>D</td><td>None</td></tr>
<tr><td>E</td><td>One sister and two aunts</td></tr>
</table>`,
      questions: [
        '<b>(a)</b> Calculate each woman\'s score.',
        '<b>(b)</b> Which women get the same predicted effect? Give the odds ratio for A and for C against D.',
        '<b>(c)</b> How many df does the score use, compared with dummies for 0, 1 or 2 affected first-degree and 0, 1 or 2 second-degree relatives?',
        '<b>(d)</b> Where do the weights come from, and what does the score assume?'
      ],
      answer: `<p><b>(a)</b> A: 1 + 0 = 1. B: 0 + 0.5 × 2 = 1. C: 2 + 0.5 × 1 = 2.5. D: 0. E: 1 + 0.5 × 2 = 2.</p>
<p><b>(b)</b> A and B have the same score (1), so the model treats them alike; this is a deliberate simplification. A against D: e<sup>0.40</sup> = 1.49. C against D: e<sup>2.5 × 0.40</sup> = e<sup>1.00</sup> = 2.72.</p>
<p><b>(c)</b> One df. The dummies would use 2 + 2 = 4 df, so the score saves 3.</p>
<p><b>(d)</b> From a known relation, not from the data: second-degree relatives share half as many genes with the woman as first-degree relatives. The score assumes that the numbers at risk are similar, that is, that women have similar numbers of first- and second-degree relatives, of similar ages. Only the single coefficient is estimated from the data.</p>`
    },
    {
      id: 't6',
      title: 'Separate models for first and later pregnancies?',
      level: 'Analyse',
      scenario: `<p>ptb_dev (synthetic): 862 women in their first pregnancy (94 preterm) and 1,138 who have been pregnant before (140 preterm). The common list has 8 df: age (2 df), BMI, Hb, chronic hypertension, bacteriuria, tobacco and low socio-economic status. Previous preterm birth and a short gap since the last pregnancy apply only to women who have been pregnant before.</p>`,
      questions: [
        '<b>(a)</b> Calculate the events per term for: (i) a model for first pregnancies with 8 df; (ii) a model for later pregnancies with 10 df; (iii) one combined model with the 10 terms plus a main effect for first pregnancy.',
        '<b>(b)</b> Why can the first-pregnancy model not include previous preterm birth?',
        '<b>(c)</b> One combined model with all 8 interactions with first pregnancy would have how many df? How does it relate to the two separate models?',
        '<b>(d)</b> The team tests the 8 interactions together and finds p = 0.40. What can it conclude, and what would you recommend?'
      ],
      answer: `<p><b>(a)</b> (i) 94 ÷ 8 = 11.8. (ii) 140 ÷ 10 = 14.0. (iii) 10 + 1 = 11 df, 234 ÷ 11 = 21.3. The combined model has more events per term than either separate model: about 1.8 times the first-pregnancy model (21.3 ÷ 11.8) and 1.5 times the later-pregnancy model (21.3 ÷ 14.0).</p>
<p><b>(b)</b> In a first pregnancy there can be no previous preterm birth and no gap since a last pregnancy: these predictors are 0 for every woman, so they carry no information and cannot be estimated. The main effect for first pregnancy handles their different baseline risk in the combined model.</p>
<p><b>(c)</b> 11 + 8 = 19 df (234 ÷ 19 = 12.3). It is in effect the same as the two separate models: letting every common predictor interact with first pregnancy lets each group have its own effects, at the cost of 8 extra df.</p>
<p><b>(d)</b> There is no evidence that the effects differ, but with 94 and 140 events the test has little power, so this does not prove they are equal. Unless clinical knowledge says that a predictor works very differently in first pregnancies, use one combined model with a main effect for first pregnancy (11 df), adding at most one or two interactions chosen in advance for clinical reasons.</p>`
    },
    {
      id: 't7',
      title: 'Critique a candidate-predictor strategy',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A team at another district hospital develops a preterm model from 800 delivery records, with 96 preterm births. The data collector copied 60 variables, with continuous ones in several forms (for example Hb, Hb squared and Hb groups). The report says: "All 60 variables entered univariable analyses, and those with p below 0.2 entered a backward stepwise model. Twin pregnancy (1.4% of women), previous cervical surgery (0.9%) and uterine malformation (0.8%) were dropped because they were rare, although the literature reports strong links with preterm birth. A count of medical conditions was not used, because weighting conditions equally is arbitrary. The two hospital sites were analysed in separate models of 48 preterm births each."</p>`,
      questions: [
        '<b>(a)</b> List the problems with this strategy and, for each, say what the book recommends.',
        '<b>(b)</b> Calculate the events per variable of the original list, if each variable used 1 df, and after screening to 20.',
        '<b>(c)</b> Propose a revised strategy that does not use the outcome.'
      ],
      answer: `<ol>
<li><b>60 candidates for 96 events.</b> Far too many. Shorten the list with the literature and clinicians, to about 5 to 20 terms, matched to the events.</li>
<li><b>Univariable screening, then stepwise selection.</b> Both use the outcome in the same data, so the model is optimistic and its coefficients biased. The book's example (57 candidates, 58 events, screening and stepwise) validated poorly. If used at all, the whole process must be repeated in each bootstrap sample (Module 8).</li>
<li><b>Several forms of the same variable.</b> These multiply the df and the tests. Fix the coding in advance (Module 6).</li>
<li><b>Rare strong predictors dropped.</b> The default is to include them (GUSTO-I shock: 2%, OR 10.9). With few women each, one option is an "any of these three" indicator, which costs 1 df. If they are dropped, the report must say the model ignores them.</li>
<li><b>Summary score rejected as arbitrary.</b> A count is simple, robust and uses 1 df, and its equal weights can be tested by adding each condition to the count.</li>
<li><b>Separate models by site.</b> This assumes every predictor works differently at each site, and halves the events to 48 per model. Use one model with a main effect for site, and test only planned interactions.</li>
</ol>
<p><b>(b)</b> 96 ÷ 60 = 1.6 events per variable. After screening to 20: 96 ÷ 20 = 4.8, still far below 10.</p>
<div class="callout warn"><b>Critical</b><p>With about 1.6 events per candidate, and a model chosen by screening and stepwise selection without bootstrapping the whole process, the reported performance cannot be trusted. This is the situation that led to poor external validation in the book's example.</p></div>
<p><b>(c)</b> Prespecify about 10 terms from the literature and clinical review, for example age (2 df), BMI, Hb, previous preterm birth, bacteriuria, tobacco, low socio-economic status, a count of medical conditions, and one indicator for twin pregnancy, previous cervical surgery or uterine malformation (10 df). Fix each coding in advance. Fit one model for both sites with a main effect for site (11 df in all). With 96 events the EPV is 96 ÷ 11 = 8.7, still below 10, so drop one more term on clinical grounds or plan shrinkage (Module 10), and validate by bootstrap.</p>`
    }
  ]
});
