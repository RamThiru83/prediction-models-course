/* Companion notes for Clippy, paraphrased from Steyerberg, Clinical Prediction Models (2009). Background for accuracy; not shown to learners. */
App.BOOKNOTES = {
"p0": [
{
"title": "What a clinical prediction model is",
"terms": [
"clinical prediction model",
"prognostic model",
"diagnostic model",
"risk score",
"prediction rule",
"nomogram",
"predictor (computer scientists: feature; also covariate)",
"outcome",
"event",
"absolute risk (predicted probability)",
"incidence",
"prevalence"
],
"core": "A clinical prediction model combines a small set of facts about a person (the predictors) into an estimate of the probability that an outcome is present now or will occur later. Risk scores, prediction rules and nomograms are all forms of the same thing. A prognostic model looks forward from a defined moment in a cohort followed over time, whereas a diagnostic model estimates whether a condition is present at the same moment as the predictors are measured, judged against a reference diagnosis. The book separates prediction from aetiology: a predictor earns its place by improving the estimated risk, not by being a cause. For that reason the book frames prediction mainly as estimating each patient's absolute risk accurately.",
"positions": [
"Prediction is primarily an estimation problem: the aim is an accurate absolute risk for an individual.",
"A predictor can be useful for prediction without being a cause of the outcome; confounding is the concern of aetiological research, not of prediction.",
"Prognostic models use cohort (longitudinal) data; diagnostic models use cross-sectional data with a reference standard.",
"In prediction work, incidence and prevalence both simply describe the overall risk in the population."
],
"misreadings": [
"Misreading: a good predictor must cause the outcome. Correction: a predictor may be a marker of something unmeasured; for prediction it only has to improve the estimated risks.",
"Misreading: a prediction model's main output is a high-risk or low-risk label. Correction: its output is a probability; labels need a threshold chosen for a specific decision.",
"Misreading: 'prognostic' and 'diagnostic' differ in the statistics used. Correction: both often use logistic regression; they differ in timing (future outcome versus present condition) and in study design.",
"Misreading: 'features' and 'predictors' are different things. Correction: they are the same; the course and the book prefer 'predictors'."
],
"reteach": "Think of the booking visit at the district hospital. The midwife knows a few things about a woman, such as her age, haemoglobin and whether she had a previous preterm birth. A prediction model is just a recipe that turns those few facts into one number: her chance of delivering before 37 weeks. If she arrived with contractions and the question were whether she is in labour right now, the recipe would be diagnostic instead of prognostic. Either way, the recipe is judged by whether the chances it gives are right, not by whether its ingredients cause preterm birth.",
"where": "Steyerberg (2009), Chapter 1, sections 1.1-1.2 (introduction: prediction and its aims); Chapter 2, section 2.1 (examples of applications)"
},
{
"title": "Risk, odds and log-odds",
"terms": [
"risk (probability)",
"odds",
"log-odds (logit)",
"odds ratio",
"risk ratio (relative risk)"
],
"core": "Odds compare the chance of an event with the chance of no event, so odds equal risk divided by one minus risk, and risk can be recovered as odds divided by one plus odds. For small risks odds and risk are nearly equal; as the risk grows they separate sharply, so that a risk of 80% corresponds to odds of 4. Regression for a yes/no outcome works on the logarithm of the odds, because the log-odds can take any value from minus to plus infinity. Working on this unbounded scale means a model can never produce a risk below 0% or above 100%.",
"positions": [
"Odds and risk can be used interchangeably only when the outcome is uncommon.",
"The log-odds scale is a reasonable mathematical form for a binary outcome because it keeps predicted risks between 0 and 1.",
"An odds ratio is not a risk ratio when the outcome is common."
],
"notation": "odds = p / (1 − p); p = odds / (1 + odds); log-odds = ln(odds); log-odds 0 ↔ risk 50%",
"misreadings": [
"Misreading: odds of 0.25 mean a 25% risk. Correction: odds of 0.25 mean one event for every four non-events, a risk of 20%.",
"Misreading: an odds ratio of 3 means three times the risk. Correction: it means three times the odds; the risk ratio is smaller, and the gap grows as the baseline risk rises.",
"Misreading: a log-odds of 0 means zero risk. Correction: a log-odds of 0 is odds of 1, a risk of 50%."
],
"reteach": "Picture 100 booking women with a 20% risk of preterm birth: 20 deliver early and 80 do not. The odds are simply 20 to 80, which is 0.25. For a rare outcome, say 2 in 100, the odds (2 to 98) are almost the same number as the risk, but for a common one, such as 80 in 100, the odds become 80 to 20, which is 4. The model works with the logarithm of these odds because that scale has no floor or ceiling, so whatever it adds up can always be turned back into a sensible risk.",
"where": "Steyerberg (2009), Chapter 4, section 4.2 (Binary outcomes)"
},
{
"title": "Logistic regression: from a score to a risk",
"terms": [
"logistic regression",
"linear predictor (lp, score)",
"intercept (α)",
"regression coefficient (β)",
"odds ratio, exp(β)",
"maximum likelihood"
],
"core": "Logistic regression adds the intercept and each coefficient multiplied by its predictor to form a linear predictor on the log-odds scale, and then converts it into a risk with the logistic (S-shaped) function. The intercept sets the overall level of risk, and each coefficient is the change in log-odds per unit of its predictor, so exponentiating a coefficient gives the odds ratio. Effects add on the log-odds scale and multiply on the odds scale, but they neither add nor multiply on the risk scale. For a continuous predictor the coefficient is the change per unit, assumed constant across the range unless the coding allows otherwise. Coefficients are those that make the observed data most likely (maximum likelihood), which is one reason a model fits its own data better than new data.",
"positions": [
"Effects add on the log-odds scale, not on the risk scale.",
"exp(β) is an odds ratio that multiplies the odds; the extra risk it brings depends on where a patient starts on the curve.",
"A coefficient of 0 means no effect; an lp of 0 means a risk of 50%.",
"Maximum likelihood estimates fit the development data as closely as possible, which contributes to optimism in new patients."
],
"notation": "lp = α + β1·x1 + β2·x2 + …; risk = 1 / (1 + e^(−lp)); OR = e^β",
"misreadings": [
"Misreading: the risk with two predictors is the baseline risk plus the two separate increases. Correction: the coefficients add on the log-odds scale, so the combined risk is usually larger than the sum of the separate risk increases.",
"Misreading: multiplying the baseline risk by the odds ratios gives the new risk. Correction: odds ratios multiply the odds; multiplying risks overstates them and can even exceed 100%.",
"Misreading: the same odds ratio gives every woman the same extra risk. Correction: the extra risk is largest where the curve is steepest, near the middle of the risk range.",
"Misreading: a continuous predictor's coefficient automatically captures a curved effect. Correction: a single coefficient assumes the same change per unit everywhere; curves need deliberate coding."
],
"reteach": "Use the colleague's model: score = −3.0 + 0.8 for chronic hypertension + 1.2 for a previous preterm birth. A woman with neither starts at −3.0, which the S-curve turns into about 4.7%. A previous preterm birth moves her score up by 1.2 to −1.8, about 14.2%. A woman who already has hypertension starts higher, at −2.2 (10%), and the same 1.2 step takes her to −1.0, about 26.9%. The step on the score is identical, but the gain in risk is bigger for her because she started on a steeper part of the curve.",
"where": "Steyerberg (2009), Chapter 4, section 4.2 (Binary outcomes)"
},
{
"title": "Sensitivity, specificity and predictive values",
"terms": [
"sensitivity (true positive rate)",
"specificity (true negative rate)",
"positive predictive value (PPV)",
"negative predictive value (NPV)",
"prevalence (prior probability)",
"likelihood ratio",
"posterior probability"
],
"core": "Sensitivity and specificity describe a test against the truth: the share of people with the condition who test positive, and the share without it who test negative. Predictive values answer the patient's question, namely the chance of having the condition after a positive or a negative result. Because predictive values combine the test's properties with how common the condition is, the same test gives a higher PPV and a lower NPV where the condition is common. Working with counts in an imagined group of 1,000 people is the clearest way to see this. In the book, this updating of a prior probability by a test result is expressed through Bayes' rule and diagnostic likelihood ratios.",
"positions": [
"Sensitivity and specificity belong to the test; predictive values also depend on prevalence in the setting.",
"When a condition is uncommon, most positive results are false positives.",
"Updating a prior probability with a test result is Bayes' rule, which in logit form resembles a logistic model with one predictor."
],
"notation": "PPV = TP / (TP + FP); NPV = TN / (TN + FN); posterior odds = prior odds × LR",
"misreadings": [
"Misreading: a test with 85% sensitivity means 85% of positives truly have the condition. Correction: that is the PPV, which depends on prevalence and can be far lower.",
"Misreading: predictive values carry over unchanged from a referral unit to a district unit. Correction: they change with prevalence; sensitivity and specificity largely do not.",
"Misreading: a negative test always means the woman can be sent home. Correction: whether the remaining risk is acceptable depends on the setting's prevalence and on how harmful a missed case is.",
"Nuance: the module note cites Ch. 4, §4.4 for this topic, but in the book §4.4 covers ordinal outcomes; the test-and-Bayes material is in §4.2.4-4.2.5."
],
"reteach": "Take 1,000 women with threatened preterm labour in the team's own unit, where 140 will deliver within 7 days. The bedside test catches 119 of those 140, but it also flags 258 of the 860 who will not deliver soon. So of the 377 positives only 119, about one in three, are real. In the referral unit, where 400 of 1,000 deliver within 7 days, the same test's positives are real about two times in three, because there are more true cases to find and fewer women to raise false alarms.",
"where": "Steyerberg (2009), Chapter 4, section 4.2.4 (Bayes rule)"
},
{
"title": "Sampling variation, the number of events and the bootstrap",
"terms": [
"sampling variation",
"standard error",
"number of events (effective sample size)",
"bootstrap",
"resampling with replacement",
"bootstrap sample"
],
"core": "Any figure calculated from a sample is an estimate that would differ in another sample, and small samples swing far more than large ones. For a yes/no outcome, the amount of information is governed mainly by the number of events (more precisely the smaller of the two outcome groups), not by the number of people; a large cohort with a very rare outcome contains few events. The bootstrap shows this uncertainty using only the data at hand: draw a new sample of the same size with replacement, repeat the analysis, and do this many times. The spread of the repeated results reflects how much the estimate would vary. Because sampling is with replacement, each bootstrap sample contains on average about 63% of the original individuals, some of them more than once.",
"positions": [
"For a binary outcome the effective sample size is the number of events.",
"A large cohort with a rare outcome may contain little information (the book's example: 10,000 patients at 0.1% incidence give 10 events).",
"The bootstrap draws samples of the same size with replacement; about 63.2% of individuals appear in each."
],
"notation": "share of individuals appearing in a bootstrap sample ≈ 1 − (1 − 1/n)^n ≈ 0.632",
"misreadings": [
"Misreading: more patients always means more information. Correction: what matters is the number of events; 800 women with 120 events carry more information than 5,000 women with 50.",
"Misreading: a bootstrap sample is a smaller random subset of the data. Correction: it is the same size as the original, drawn with replacement, so some individuals repeat and about 37% are left out.",
"Misreading: a clinic with an unusual rate in 50 deliveries must be different. Correction: small numbers produce wide swings by chance; check how much the figure would vary before acting."
],
"reteach": "Suppose the district rate is 12% and a new clinic reports 10 preterm births in its first 50 deliveries. With only 50 women, chance alone often produces anything from about 3% to 21%, so 20% is not surprising. To see this with the clinic's own data, write each woman's outcome on a card, draw 50 cards one at a time putting each back, and note the preterm share; repeat a few hundred times. The shares spread widely, which shows how little 50 deliveries can tell you.",
"where": "Steyerberg (2009), Chapter 1, section 1.2.2 (sample size and events); Chapter 5, section 5.3 (Bootstrap resampling)"
},
{
"title": "Apparent performance, optimism and overfitting",
"terms": [
"apparent performance",
"true performance (performance in new patients)",
"optimism",
"overfitting",
"internal validation",
"external validation"
],
"core": "A model always looks better in the data used to build it than in new patients, because its coefficients were chosen to fit that particular sample, chance quirks included. Performance in the development data is the apparent performance, and the shortfall in new patients from the same population is the optimism. A model with much optimism is overfitted, and in new patients its predictions tend to be too extreme: too high for those predicted high and too low for those predicted low. Optimism can be estimated within the development data (internal validation, for example with the bootstrap), and the model should then be tested in other patients, places or times (external validation).",
"positions": [
"Judge a model on patients it was not built on.",
"Overfitting typically shows as predictions that are too extreme in new patients.",
"Internal validation should come before external validation.",
"A drop in performance elsewhere can also reflect genuine differences between settings, not only overfitting."
],
"misreadings": [
"Misreading: a high c statistic in the development data shows the model works. Correction: apparent performance is optimistic; it must be checked in new data or corrected by internal validation.",
"Misreading: a fall in performance in a second hospital always means overfitting. Correction: case-mix, referral patterns or measurement may differ even for a well-built model.",
"Nuance: the book defines optimism as true minus apparent performance (a negative number), while the course writes apparent minus true so that optimism is positive; the idea is the same."
],
"reteach": "The team's model scored a c statistic of 0.82 on the women it was built from but 0.71 in the second hospital. Think of a student who memorises last year's exam paper: he scores well on that paper, partly because he learned its quirks, and less well on a new one. The 0.82 is the memorised paper; the gap to what happens with new women is the optimism. That is why the team should first estimate the gap in its own data with the bootstrap, and then try the model elsewhere.",
"where": "Steyerberg (2009), Chapter 5, section 5.1 (Overfitting and optimism)"
},
{
"title": "Discrimination and calibration",
"terms": [
"discrimination",
"c statistic (concordance statistic; area under the ROC curve, AUC)",
"calibration",
"calibration-in-the-large",
"calibration plot"
],
"core": "Two separate questions are asked of every model. Discrimination asks whether it ranks patients correctly; the c statistic is the share of all pairs of one patient with the outcome and one without in which the patient with the outcome received the higher predicted risk, so 0.5 is chance and 1 is perfect. Calibration asks whether the predicted risks are the right size: among patients given 20%, about 20 in 100 should have the outcome. Calibration-in-the-large compares the average predicted risk with the observed rate. A model can rank well while giving risks that are systematically too low or too high, so both must be checked.",
"positions": [
"Discrimination and calibration answer different questions; check both.",
"The c statistic needs no cut-off and says nothing about whether risks are the right size.",
"For decisions based on a risk threshold, calibration near that threshold matters."
],
"notation": "c = (number of event/non-event pairs where the event has the higher risk) / (number of event/non-event pairs)",
"misreadings": [
"Misreading: a c statistic of 0.75 means 75% of patients are classified correctly. Correction: it is the share of event/non-event pairs ranked correctly, with no cut-off involved.",
"Misreading: a model with good discrimination must be well calibrated. Correction: a model can rank women well and still give risks that are much too low.",
"Misreading: c measures the variation explained. Correction: that is the role of R²-type measures; c is about ranking only."
],
"reteach": "In the second hospital, five women had predicted risks of 0.30 and 0.15 (both delivered early) and 0.10, 0.20 and 0.05 (none did). Pair each early birth with each term birth: in 5 of the 6 pairs the woman who delivered early had the higher risk, so the model ranks well. But the average predicted risk was 16% while 40% actually delivered early, so the risks are far too small. Ranking and right-sized risks are two different report cards.",
"where": "Steyerberg (2009), Chapter 15, sections 15.1-15.4 (evaluation of model performance)"
}
],
"m01": [
{
"title": "Prediction as an estimation problem",
"terms": [
"estimation",
"absolute risk",
"individualised prognosis",
"aetiological (causal) research",
"hypothesis testing",
"incremental value of a marker"
],
"core": "Medical actions are justified when their benefit to the individual outweighs their harms and costs, and judging that requires the individual's risk. A prediction model combines a modest number of patient characteristics into that risk so that clinicians and patients can weigh options. The book treats this as primarily an estimation task (how likely is this woman to deliver preterm?) rather than a testing task (is a given factor associated with preterm birth?). Causal questions belong to aetiological research, where confounding is the main concern; in prediction a factor is kept for what it adds to the risk estimates. A new marker is worthwhile only if it improves predictions beyond characteristics that are already cheap and easy to obtain.",
"positions": [
"Prediction is primarily an estimation problem; testing of predictor effects is secondary.",
"Selecting predictors by p-value reflects a testing mindset that can harm predictions.",
"A new test or biomarker must show added value over simple, readily available predictors such as age and obstetric history.",
"The book's scope is regression models with a modest number of candidate predictors (fewer than about 25), not high-dimensional genomic or imaging data."
],
"misreadings": [
"Misreading: the goal is to find which predictors are statistically significant. Correction: the goal is accurate absolute risks; significance of individual predictors is a secondary question.",
"Misreading: a predictor that is strongly associated with the outcome will improve the model. Correction: it must add to what the existing predictors already capture.",
"Misreading: the model's coefficients tell us what causes preterm birth. Correction: causal interpretation needs aetiological design and confounding control; prediction does not provide it."
],
"reteach": "When a midwife sees a woman at booking, she is not running a hypothesis test about haemoglobin; she wants to know this woman's chance of delivering early. The team's model is a tool for getting that chance right. Whether haemoglobin causes preterm birth is a separate research question. And an expensive new blood marker is only worth adding if it makes the chances clearly more accurate than age, parity and history already do.",
"where": "Steyerberg (2009), Chapter 1, sections 1.1-1.2 (prediction in medicine; statistical modelling)"
},
{
"title": "Defining the prediction problem and the moment of prediction",
"terms": [
"research question",
"intended application",
"moment of prediction (time origin)",
"prognostic vs diagnostic",
"outcome definition",
"candidate predictors",
"information leakage"
],
"core": "Before any data are touched, the problem is written down: whom the model is for, when it will be used and for which decision, how the outcome is defined and measured, which predictors will be available at that moment, and what study design will supply the data. A prognostic model looks forward from a defined moment, such as the booking visit, to a later outcome, while a diagnostic model concerns a condition present at the same moment. Only information known at the moment of prediction can enter the model. A variable recorded later, however strongly it predicts in the data, makes the model unusable in practice.",
"positions": [
"Fix the question, the intended use, the moment of prediction and the outcome before analysing data.",
"Predictors not available at the moment of prediction cannot be used; including them is a fatal flaw.",
"The design should match the intended use: a cohort for prognosis, a cross-sectional study with a reference standard for diagnosis.",
"Check the number of events before deciding how many predictors to consider."
],
"misreadings": [
"Misreading: any variable that predicts the outcome well should be included. Correction: only variables known at the moment of prediction qualify; later ones, such as the number of antenatal visits or mode of delivery, leak future information.",
"Misreading: the problem definition can be refined after seeing the data. Correction: data-driven redefinition makes the model look better than it is; write the plan in advance.",
"Misreading: a prognostic model for booking can be built from any pregnancy data. Correction: the predictors must be measured at, or before, booking in the way they will be measured in practice."
],
"reteach": "The team's model will be used at the first antenatal visit, so imagine the midwife sitting with the woman at that visit. Anything on her screen at that moment (age, BMI, haemoglobin, history) can go into the model. The number of visits she will make over the pregnancy, or how she eventually delivers, is not yet known, so it cannot go in, however well it predicts in old records. Writing this down first keeps the team from building a model that cannot be used.",
"where": "Steyerberg (2009), Chapter 1, sections 1.3.2-1.3.3 (defining the problem and the modelling steps)"
},
{
"title": "Where prediction models are applied",
"terms": [
"public health targeting",
"screening",
"diagnostic work-up",
"therapeutic decision-making",
"watchful waiting",
"research applications",
"cost-effectiveness"
],
"core": "The book groups applications into public health (identifying people at high risk for prevention or screening), clinical practice (deciding who needs further, costly or invasive testing, and matching treatment intensity to risk) and research (selecting and stratifying trial participants, adjusting analyses and comparing providers). In public health uses, calibration of the absolute risk is especially important. When a treatment has a constant relative benefit, its absolute benefit grows with baseline risk, so focusing treatment on higher-risk people is also more cost-effective. The book names the Gail model for breast cancer and the Framingham functions for cardiovascular risk as examples.",
"positions": [
"Absolute benefit of a treatment with a constant relative effect increases with baseline risk.",
"For public health targeting, well-calibrated absolute risks matter most.",
"Diagnostic work-up decisions may use one or two probability thresholds.",
"Obtaining predictions is distinct from gaining insight into disease mechanisms; the book's primary aim is outcome prediction."
],
"misreadings": [
"Misreading: prediction models are only for individual bedside decisions. Correction: they also serve screening policy, trial design and provider comparison.",
"Misreading: a treatment that halves risk helps everyone equally. Correction: the absolute benefit is larger for those at higher baseline risk.",
"Misreading: good ranking is all that targeting needs. Correction: when the decision depends on the size of the risk, calibration matters as well."
],
"reteach": "The district could use the booking model in several ways. It could offer extra antenatal contacts to the women at highest predicted risk, a public health use. Midwives could use it to decide who is referred for a further assessment, a diagnostic work-up use. It could guide who receives a preventive treatment, and the team could use it to design a prevention trial or compare clinics fairly. A treatment that halves the risk prevents more births among women at 20% risk than among women at 4%, so targeting higher-risk women gives more benefit for the same effort.",
"where": "Steyerberg (2009), Chapter 2, sections 2.1-2.3 (applications in public health and clinical practice)"
},
{
"title": "From a predicted risk to a treatment decision: the threshold",
"terms": [
"treatment threshold (threshold probability, decision threshold)",
"harm",
"benefit",
"relative risk reduction",
"absolute benefit",
"number needed to treat (NNT)",
"net benefit"
],
"core": "A predicted risk becomes a decision through a threshold: the risk at which treating and not treating are equally good, with treatment favoured above it. The threshold follows from weighing the harm of treating someone who would not benefit against the benefit of treating someone who would; when the harm is small relative to the benefit, the threshold is low. For a treatment with a constant relative risk and a fixed absolute harm, the break-even risk is the harm divided by the absolute risk reduction per unit of risk. The threshold reflects consequences and patient values, not statistics; the model's task is to provide accurate risks, particularly near the threshold. A 50% cut-off is rarely appropriate because it implies that both kinds of error are equally bad.",
"positions": [
"The threshold comes from the balance of harms and benefits and from patient values, not from statistics.",
"A 50% cut-off implies false positives and false negatives are equally costly, which is seldom true.",
"The model must be well calibrated near the threshold for decisions to be right.",
"If missing a case is 100 times worse than an unnecessary treatment, the threshold is about 1% (the book's illustration)."
],
"notation": "threshold = harm / (harm + benefit); constant RR with absolute harm H: treat if r > H / (1 − RR); NNT = 1 / absolute risk reduction",
"misreadings": [
"Misreading: the best threshold is the one that maximises sensitivity plus specificity in the data. Correction: the threshold should reflect the clinical consequences of each kind of error.",
"Misreading: treating the top 20% by predicted risk is the same as treating everyone above the threshold. Correction: a capacity rule is based on rank; a threshold rule is based on the size of each woman's risk.",
"Misreading: threshold odds and threshold probability are the same. Correction: with harm : benefit = 1 : 50, the threshold odds are 0.02 but the probability is 1/51, about 1.96%.",
"Misreading: a model that ranks women well will give correct decisions. Correction: if its risks are miscalibrated near the threshold, women can be placed on the wrong side of it."
],
"reteach": "Imagine a preventive treatment that halves each woman's risk of preterm birth but causes a side-effect in 3 of every 100 women treated, and the team judges that side-effect about as bad as a preterm birth. For 100 women at 10% risk, treatment prevents 5 births and causes 3 side-effects, a net gain. For 100 women at 4%, it prevents only 2 but still causes 3, a net loss. The point where prevented births equal side-effects is a risk of 6%, so that is where treatment starts to pay; the model's job is to say accurately which side of 6% each woman is on.",
"where": "Steyerberg (2009), Chapter 2, section 2.3.3 (decision thresholds); Chapter 2, sections 2.3.5-2.3.6 (treatment decisions)"
},
{
"title": "Prediction models in research: trials, observational studies and provider comparisons",
"terms": [
"covariate adjustment",
"prognostic adjustment",
"stratified randomisation",
"statistical power",
"standard error",
"propensity score",
"case-mix adjustment",
"observed-to-expected ratio"
],
"core": "In randomised trials a predicted risk can replace several inclusion criteria, support stratified randomisation and serve as an adjustment variable. With linear regression and balanced arms, adjusting for strong prognostic covariates leaves the treatment effect unchanged and reduces its standard error. With logistic or Cox regression, adjustment moves the effect estimate further from zero and slightly increases its standard error, but the estimate grows more than the error, so power still increases; the gain rises with the strength of the covariates. In observational studies regression or propensity scores adjust for measured confounders but not for unmeasured ones. For comparing providers, a case-mix model supplies an expected number of events for each provider, and the observed number is compared with it.",
"positions": [
"Adjusting for strong prognostic covariates increases power in trials, even when arms are balanced.",
"In logistic and Cox models the adjusted effect is expected to differ from the unadjusted one even with perfect balance; this is not bias but a more conditional effect.",
"Book example: covariate sets with R² of 13% to 40% gave sample-size reductions of roughly 12% to 30%.",
"Neither regression adjustment nor propensity scores handle unobserved confounders.",
"Case-mix adjusted provider comparisons are only as good as the model's coverage and calibration."
],
"notation": "observed-to-expected ratio = observed events / expected events from the case-mix model",
"misreadings": [
"Misreading: randomisation makes covariate adjustment pointless. Correction: adjustment for strong prognostic factors sharpens the comparison and increases power.",
"Misreading: an adjusted odds ratio that differs from the crude one in a balanced trial must be biased. Correction: in logistic regression the two estimate different (population-averaged versus conditional) effects.",
"Misreading: adjustment in logistic regression reduces the standard error, as in linear regression. Correction: the standard error rises a little, but the effect estimate rises more, so power improves.",
"Misreading: an observed-to-expected ratio above 1 proves poor quality. Correction: unmeasured case-mix differences, poor calibration in that clinic and chance in small clinics can all explain it."
],
"reteach": "In the team's prevention trial, some women start at much higher risk than others, for example those with a previous preterm birth, and this adds noise to the comparison of the arms. Taking each woman's starting risk into account is like comparing like with like, so a real effect stands out more clearly and fewer women are needed. For comparing clinics, the model works out how many preterm births each clinic should expect given its own women; a referral clinic with 18% observed against 20% expected is doing better than its raw rate suggests.",
"where": "Steyerberg (2009), Chapter 2, section 2.4 (prediction models in research)"
},
{
"title": "Uncertainty and sample size: count events, not patients",
"terms": [
"effective sample size",
"number of events",
"model uncertainty",
"data-driven model building",
"prior knowledge",
"events per variable (introduced in Module 2)"
],
"core": "For a yes/no outcome the effective sample size is the number of events, so a large cohort with a rare outcome may hold little information. Small samples make predictions unreliable, prevent meaningful checks of assumptions and force greater reliance on prior knowledge. The more of the model that must be learned from the data (which predictors, their form, their coefficients), the larger the sample required; validating or updating an existing model needs fewer data than building one from nothing. When the model is shaped by looking at the data, for instance by dropping weak predictors or merging categories, the usual confidence intervals and p-values become too optimistic, and the bootstrap can repeat the whole process to show this.",
"positions": [
"The effective sample size is the number of events: 10,000 patients at 0.1% incidence give 10 events.",
"The more that is already known (predictors, form), the smaller the sample needed.",
"Data-driven model building makes standard errors and p-values too optimistic (model uncertainty).",
"With small samples, rely more on prior knowledge and accept more assumptions."
],
"misreadings": [
"Misreading: 8,000 women is a large sample. Correction: at 0.25% incidence it holds only 20 events, which is a small study for prediction.",
"Misreading: confidence intervals from the final model reflect all uncertainty. Correction: they ignore the uncertainty from choosing that model by looking at the data.",
"Misreading: the same sample size suffices for developing and for validating a model. Correction: developing from scratch requires more data than estimating coefficients for a known structure or validating an existing model."
],
"reteach": "Two cohorts are offered to the team: 5,000 women with 1% preterm birth, and 800 women with 15%. The first has 50 preterm births, the second 120. Because the information about preterm birth sits in the women who had it, the smaller cohort actually teaches the model more. And if the team lets the data decide which predictors to keep, the neat confidence intervals printed for the final model hide the extra uncertainty created by that search.",
"where": "Steyerberg (2009), Chapter 1, sections 1.2.1-1.2.2 (model uncertainty and sample size); Chapter 1, section 1.3.4 (sample size and prior knowledge)"
},
{
"title": "The seven modelling steps and internal versus external validity",
"terms": [
"data inspection",
"coding of predictors",
"model specification",
"model estimation (shrinkage, penalisation)",
"model performance",
"validation (internal, external)",
"model presentation",
"internal validity (reproducibility)",
"external validity (generalisability, transportability)"
],
"core": "After the problem is defined, the book's roadmap runs through seven steps in order: inspect the data (distributions, missing values), code the predictors, specify the model (which predictors, whether effects are additive and linear), estimate it while limiting overfitting, evaluate its performance (calibration, discrimination, clinical usefulness), validate it, and present it in a usable form. Internal validity means the model's performance is reproducible in the population the data came from, and is threatened mainly by overfitting. External validity means performance holds in other settings, times or patient groups. Internal validity is a precondition for external validity. Every choice tuned to the data makes the model look better than it will be, so the plan should be prespecified.",
"positions": [
"Steps: data inspection, coding, specification, estimation, performance, validation, presentation.",
"Internal validation should precede external validation; internal validity is a precondition for external validity.",
"Bootstrap or other internal validation cannot demonstrate transportability to other settings.",
"Prespecify the modelling plan, because data-driven choices add optimism."
],
"misreadings": [
"Misreading: a small bootstrap optimism shows the model will work in other hospitals. Correction: internal validation speaks only to reproducibility in the same population; other settings need external data.",
"Misreading: validation can be skipped if the apparent c statistic is high. Correction: apparent performance is optimistic; validation is a required step before use.",
"Misreading: the steps can be done in any order. Correction: for example, data inspection and coding come before specification and estimation, and performance is assessed before validation and presentation.",
"Misreading: resampled data provide external validation. Correction: resampling reuses the same population; external validation needs different patients, places or times."
],
"reteach": "Think of the team's project as a recipe card with seven lines: look at the data, decide how each ingredient goes in, choose the ingredients, cook (fit) carefully without over-seasoning to this batch, taste (measure performance), have others taste it, first from the same kitchen and then elsewhere, and finally write it up so others can use it. If the dish only tastes good to the cook, there is no point sending it to another kitchen. That is why the team estimates optimism in its own data before testing the model in another state.",
"where": "Steyerberg (2009), Chapter 1, sections 1.3.2-1.3.3 (the modelling steps; internal and external validity)"
}
],
"m02": [
{
"title": "Prognostic and diagnostic study designs",
"terms": [
"prognostic study (longitudinal, cohort)",
"diagnostic study (cross-sectional)",
"index test",
"reference standard (formerly 'gold standard')",
"follow-up",
"suspected patients"
],
"core": "The quality of a prediction model rests largely on the design and quality of its data, and sophisticated analysis cannot rescue a poor design. A prognostic study is longitudinal: a cohort defined by a shared starting point has predictors recorded at the outset and is followed until the outcome occurs or follow-up ends. A diagnostic study is usually cross-sectional: a cohort defined by suspicion of a disease undergoes the index tests and a reference standard at about the same time. Both are commonly analysed with logistic regression, but their threats to validity differ: selection, predictor completeness and complete follow-up for prognosis; the reference standard and who receives it for diagnosis.",
"positions": [
"A well-designed study matters more than sophisticated analysis.",
"A diagnostic cohort is defined by suspicion of the disease, not by having it.",
"No reference standard is perfect; the book notes that no method is truly 'gold'.",
"The statistics are similar for both designs; the validity concerns differ."
],
"misreadings": [
"Misreading: diagnostic and prognostic studies need different statistical models. Correction: both typically use logistic regression; the design and its biases differ.",
"Misreading: a diagnostic study should enrol people known to have the disease. Correction: it should enrol all people in whom the disease is suspected.",
"Misreading: the reference standard is always correct. Correction: it is the best available, not infallible."
],
"reteach": "The team's booking model is prognostic: women are enrolled at booking, their details recorded, and the team waits to see who delivers early. The side question about urine infection is diagnostic: at the same visit, the dipstick and a urine culture are done together, and the culture says whether infection is there now. Both questions can be answered with logistic regression, but the first worries most about losing women before delivery, while the second worries most about whether every woman got a proper culture.",
"where": "Steyerberg (2009), Chapter 3, section 3.1 (Study design)"
},
{
"title": "Choosing a data source for a prognostic model",
"terms": [
"retrospective cohort (historical records)",
"prospective cohort",
"randomised trial data",
"registry data",
"protocol-based data collection",
"generalisability (representativeness)"
],
"core": "Retrospective records are cheap and quick, but selection, predictor definitions and outcome assessment were not set by a protocol, so definitions vary and gaps are common. A prospective cohort has defined selection, predictors recorded on prespecified forms with quality checks and outcomes at set times, at a higher cost. Trial data are recorded by protocol, often with multi-centre definitions, but strict inclusion criteria limit how representative they are; arms are usually combined for model development because treatment effects are generally small relative to other prognostic effects. Registries offer complete coverage and large numbers but few details, and their coding may follow administrative purposes. The book regards a prospective cohort with prespecified selection and predictor definitions as the preferred source for prognosis.",
"positions": [
"Prognostic studies are ideally prospective cohorts with prespecified selection and predictor definitions.",
"Trial data are useful, but representativeness of the included patients is a limitation.",
"Key predictors should be recorded with clear definitions and preferably no missing values, best achieved prospectively.",
"Each design has strengths and limitations that should be stated."
],
"misreadings": [
"Misreading: the biggest dataset is the best source. Correction: a registry may be huge yet lack the predictors needed, and records may have inconsistent definitions.",
"Misreading: trial data are always ideal because they are high quality. Correction: exclusion criteria may remove the very patients the model is meant for.",
"Misreading: retrospective records can never be used. Correction: they can help explore and plan, but a model built from them should be treated as preliminary and validated."
],
"reteach": "The team has four offers. Old delivery records are quick but messy: nobody planned what was written down. A finished iron trial is tidy but left out women with severe anaemia and teenagers, who are among the women the model is for. The state registry is huge but records only a handful of details. Enrolling women at booking in six clinics with a set form costs time, but it is the only option where the team decides in advance exactly what is measured and how, which is why the book prefers it.",
"where": "Steyerberg (2009), Chapter 3, section 3.2 (Cohort studies for prognosis)"
},
{
"title": "Nested case-control sampling and the intercept correction",
"terms": [
"nested case-control design",
"cases",
"controls",
"control sampling fraction (f)",
"intercept correction",
"absolute risk"
],
"core": "When an outcome is rare or a predictor is costly, it can be efficient to measure detailed predictors in all cases and in a random sample of controls drawn from the same cohort. The regression coefficients estimated in such a sample remain valid, but because cases are over-represented the average risk, and therefore every predicted absolute risk, comes out too high. Before giving risks, the average incidence must be brought back to that of the cohort. With all cases kept and a fraction f of non-cases sampled, the sample odds are 1/f times the cohort odds, so subtracting ln(1/f) from the intercept restores the correct level while leaving the slopes unchanged. Choosing controls properly is critical, and predictor details are often assessed in retrospect.",
"positions": [
"Case-control sampling is efficient for rare outcomes.",
"Coefficients from a nested case-control sample can be used; the intercept (average incidence) must be adjusted before calculating probabilities.",
"If the outcome is well defined, such as death, selection bias from control sampling need not arise when controls are a random sample."
],
"notation": "corrected intercept = sample intercept − ln(1/f), where f = sampled controls / all non-cases in the cohort",
"misreadings": [
"Misreading: the case-control model can be used directly to give risks. Correction: without the intercept correction every predicted risk is overstated.",
"Misreading: the odds ratios also need correcting. Correction: only the intercept changes; the slope coefficients are valid.",
"Misreading: the correction is added to the intercept. Correction: the sample odds are too high, so ln(1/f) is subtracted.",
"Nuance: the book states only that the average incidence must be adjusted; the ln(1/f) formula is the standard way the course makes that adjustment explicit."
],
"reteach": "Suppose the team measures a costly blood marker in all 150 women who delivered before 32 weeks, but in only 5% of the 9,850 who did not. In that sample, very early birth looks about 20 times more common in odds terms than it really is, because the team kept every case but only one in twenty non-cases. The marker's effect is still estimated correctly, since cases and controls with and without a high marker were sampled fairly. The team simply lowers the model's starting value by ln 20, about 3, so the risks return to the real level.",
"where": "Steyerberg (2009), Chapter 3, section 3.2.7 (Nested case-control studies)"
},
{
"title": "Diagnostic designs, verification bias and case-control selection",
"terms": [
"consecutive enrolment",
"blinding of the reference standard",
"information bias (incorporation bias, diagnostic review bias)",
"verification bias (partial verification, work-up bias)",
"selection (spectrum) bias",
"diagnostic case-control design"
],
"core": "Ideally all patients suspected of the condition are enrolled consecutively, all receive the index tests and the reference standard, and the reference standard is interpreted without knowledge of the test results to avoid information bias. When the reference standard is applied selectively, mainly to test-positive patients, missed cases among test-negatives go undetected and test performance is usually overestimated; the book illustrates this with CRP for appendicitis, where mild cases with low CRP could resolve without being recognised. Selecting patients by the reference test itself, as in a diagnostic case-control design, introduces selection bias, especially with non-consecutive patients, severe cases against healthy controls, or retrospective data. A reported prevalence from a selectively tested group may also overstate the prevalence among all suspected patients.",
"positions": [
"Enrol all suspected patients consecutively and give everyone the reference standard.",
"Interpret the reference standard blind to the index test.",
"Selective verification usually makes a test look better than it is.",
"Prospective studies with a prespecified work-up protocol are preferable to routine practice data for diagnosis."
],
"misreadings": [
"Misreading: doing the index test in everyone removes verification bias. Correction: the bias arises when the reference standard depends on the index test result.",
"Misreading: comparing confirmed cases with healthy volunteers gives a fair estimate of accuracy. Correction: it exaggerates accuracy because borderline and mild cases are missing.",
"Misreading: the 50% prevalence in a 100-case, 100-control study reflects the clinic. Correction: it is fixed by the design and cannot give predictive values.",
"Misreading: verification bias only affects specificity. Correction: missed cases among test-negatives inflate the apparent sensitivity in particular."
],
"reteach": "If the laboratory cultures only dipstick-positive urine and calls every dipstick-negative woman 'no infection', the infections the dipstick misses are never found. On paper the dipstick then seems to miss nothing, though in truth it may miss one infection in four. Comparing laboratory-confirmed infections with healthy staff volunteers is flattering in a different way, because real booking women include mild and borderline cases. The fair design is to dipstick and culture every woman at booking, with the culture read without knowing the dipstick result.",
"where": "Steyerberg (2009), Chapter 3, section 3.3 (Studies for diagnosis); Chapter 3, section 3.3.3 (Case-control studies)"
},
{
"title": "Strength and choice of predictors",
"terms": [
"predictor strength",
"association (odds ratio)",
"predictor distribution (prevalence of a binary predictor)",
"range of a continuous predictor",
"domains of predictors",
"cost of predictors",
"incremental (added) value"
],
"core": "A predictor's usefulness depends on both the strength of its association with the outcome and its distribution in the population. A binary predictor that is rare can change the risk of only a few people however large its odds ratio, whereas a common predictor with a moderate odds ratio can separate many more; likewise a continuous predictor must cover a wide range to matter. Candidate predictors span domains such as demographics, type and severity of disease, history, comorbidity, physical function and subjective health. The book advises considering easily obtained information first, then simple tests, and only then costly or invasive ones, judging an expensive test by what it adds to the cheaper predictors.",
"positions": [
"Strength is a function of the association and the distribution of the predictor.",
"A binary predictor with OR 2.0 and 50% prevalence is more useful than one with OR 2.5 and 1% prevalence (the book's comparison).",
"Start with cheap information (history, demographics), then simple tests, then costly ones.",
"A costly test should be judged by its incremental value over existing predictors.",
"Differing predictor definitions between studies threaten generalisability."
],
"notation": "for a binary predictor: c = (sensitivity + specificity) / 2",
"misreadings": [
"Misreading: the predictor with the largest odds ratio is the most useful. Correction: a rare predictor barely changes the predictions for most people.",
"Misreading: a new biomarker that is significantly associated with the outcome should be added. Correction: it must improve predictions beyond the cheaper predictors already available.",
"Misreading: a narrow-range continuous predictor is as informative as a wide-range one with the same per-unit effect. Correction: little spread means little separation between people."
],
"reteach": "Anaemia affects half the booking women and roughly doubles the odds of preterm birth; a rare gene variant affects 1 woman in 100 and has a slightly larger odds ratio. Among 1,000 women, anaemia is present in about 65 of the 100 who deliver early, while the gene variant is present in about 2 of them. So anaemia separates women who will and will not deliver early far better, despite its smaller odds ratio. The team should also try history and simple measurements before paying for any costly marker.",
"where": "Steyerberg (2009), Chapter 3, section 3.4.1 (Strength of predictors); Chapter 3, section 3.4.3 (Costs of predictors)"
},
{
"title": "Reliability of predictors and regression dilution",
"terms": [
"observer variability (inter-observer agreement)",
"kappa statistic",
"biological variability",
"measurement error (misclassification)",
"regression dilution bias (attenuation)",
"pragmatic measurement"
],
"core": "Predictors are often measured imperfectly. Observer variability is summarised with kappa, which measures agreement beyond what chance would produce; agreement between pathologists on some histological diagnoses is only fair. Biological variability, as in blood pressure, can be reduced by repeated readings. Random measurement error weakens the observed association between a predictor and the outcome, which the book calls regression dilution bias, and lowers its discriminative ability; the association is attenuated, not removed. For a model to be used in daily practice, predictors should be measured as they will be in practice, so that the estimated effects match their use.",
"positions": [
"Random measurement error dilutes associations towards the null; it does not cancel out.",
"Book simulation (as recalculated in the module): a true OR of 4 with 80% observer sensitivity and specificity is observed as about 2.25, with c falling from 0.67 to 0.60.",
"Measure predictors in the way they will be measured where the model is used.",
"Repeated measurements can reduce biological variability."
],
"notation": "kappa = (p_observed − p_expected) / (1 − p_expected)",
"misreadings": [
"Misreading: random measurement error averages out and leaves the odds ratio unbiased. Correction: it attenuates the odds ratio towards 1.",
"Misreading: a predictor with low kappa should be dropped. Correction: a noisy predictor still carries information; improving definitions or training may be better than dropping it.",
"Misreading: a predictor should always be measured by the best research method. Correction: for a practical model, measure it as it will be measured in routine use.",
"Misreading: the same observer accuracy always gives the same kappa. Correction: kappa depends on prevalence; a rare sign gives a lower kappa for the same accuracy because chance agreement is higher."
],
"reteach": "Midwives judging 'the woman looks pale' by eye will sometimes call a pale woman normal and a normal woman pale. Those mistakes mix the two groups together, so the pale group looks less different from the others than it really is: a true doubling or more of the odds can appear as a much smaller effect. The sign is weakened, not worthless. Because the model will be used by these same midwives, the sign should be recorded the way they will actually judge it.",
"where": "Steyerberg (2009), Chapter 3, section 3.5.1 (Observer variability); Chapter 3, section 3.5.4 (Regression dilution bias)"
},
{
"title": "Defining the outcome and composite end points",
"terms": [
"outcome (end point)",
"hard end point",
"fatal and non-fatal events",
"patient-centred outcomes",
"composite end point",
"outcome measurement accuracy",
"continuous, ordinal and binary outcomes"
],
"core": "Because decisions are based on the predicted risk of the outcome, the outcome should be defined precisely and measured with high accuracy, as rigorously as in a trial, even when predictors are pragmatic. Outcomes range from hard end points such as mortality, which may be too rare, through softer non-fatal events, to patient-centred measures such as function or quality of life. Composite end points increase the number of events and hence power, but they assume predictors act similarly on each component, and prediction can be poorer than for a single hard end point; the book's heart failure example showed a lower c for death or rehospitalisation than for mortality alone. Statistically, continuous outcomes carry more power than ordinal ones, and ordinal more than binary.",
"positions": [
"The outcome of a prediction model should be measured with high accuracy.",
"Hard end points are often preferred, but power may motivate composite or other end points.",
"A composite end point assumes similar predictor effects on its components.",
"Continuous outcomes give more power than ordinal, and ordinal more than binary."
],
"misreadings": [
"Misreading: a composite end point always improves a model because it has more events. Correction: if predictors act differently on the components, prediction can get worse.",
"Misreading: outcome measurement can be as pragmatic as predictor measurement. Correction: predictors may be pragmatic, but the outcome should be measured rigorously.",
"Misreading: random error in the outcome only adds noise and causes no harm. Correction: it weakens associations and makes calibration hard to judge."
],
"reteach": "Preterm birth is only as accurate as the gestational age behind it. If some women are dated by an early scan and others by their memory of the last period, births near 37 weeks will be wrongly labelled, and every predictor will look weaker than it is. So the team fixes one dating method in advance. Adding stillbirth to make 'preterm birth or stillbirth' would give more events, but only helps if the same predictors drive both, which may not be true.",
"where": "Steyerberg (2009), Chapter 3, section 3.6 (Outcome); Chapter 3, section 3.6.4 (Composite end points)"
},
{
"title": "Sample size and events per variable",
"terms": [
"statistical power",
"events per variable (EPV; the book also writes EVP)",
"events per candidate predictor",
"candidate predictor parameters (degrees of freedom)",
"overfitting",
"shrinkage"
],
"core": "Power to detect a single predictor's effect depends on the odds ratio, the predictor's prevalence and the outcome incidence; modest odds ratios need thousands of patients. For reliable predictions the book uses rules of thumb expressed as events per variable: the number of events divided by the number of candidate predictor parameters considered, not just those kept. Below about 10 events per variable a model is likely overfitted and may predict worse than a simpler model with fewer predictors. About 20 may allow a prespecified model without shrinkage, about 50 per candidate is needed for reliable data-driven selection, and validation studies need at least about 100 events.",
"positions": [
"The minimum EPV for good predictions may be 10; below it models are overfitted.",
"For prespecified models, shrinkage may not be needed with EPV of at least 20.",
"Reliable selection from a larger set of candidates may need EPV as large as 50.",
"Validation studies may need at least 100 events.",
"Count every candidate parameter, including extra terms for categorical or non-linear predictors."
],
"notation": "EPV = number of events / number of candidate predictor parameters",
"misreadings": [
"Misreading: EPV uses the number of patients. Correction: it uses the number of events (strictly, the smaller outcome group).",
"Misreading: EPV is calculated with the predictors in the final model. Correction: it uses all candidate parameters considered during modelling.",
"Misreading: EPV of 10 guarantees no overfitting. Correction: it is a minimum; optimism should still be estimated.",
"Nuance: the book notes regressions can technically be run with lower EPV, and adjusting an exposure for confounding may be done with EPV below 10; the thresholds are for reliable prediction."
],
"reteach": "The satellite clinic has 600 women, and 8% delivered early: 48 preterm births. It wants to try 12 candidate terms, so each term has only 4 preterm births to learn from, far below the 10 the book treats as a minimum. To try 12 terms properly it would need about 120 preterm births, or 1,500 women at that rate, and many more if it wants the data to choose the predictors. Otherwise it should cut its list to about four terms chosen on clinical grounds, or pool its data with the district hospital.",
"where": "Steyerberg (2009), Chapter 3, section 3.8.1 (Statistical power to identify predictor effects); Chapter 3, section 3.8.3 (Statistical power for reliable predictions)"
}
],
"m03": [
{
"title": "The outcome type decides the regression model",
"terms": [
"linear regression (continuous outcome)",
"logistic regression (binary outcome)",
"polytomous (multinomial) logistic regression",
"proportional odds (ordinal) logistic regression",
"Cox proportional hazards regression",
"censoring",
"generalised additive model (GAM)",
"explained variation (R²)"
],
"core": "The scale of the outcome sets the default model: linear regression predicts the expected value of a continuous outcome, logistic regression the probability of a binary event, polytomous logistic regression the probability of each unordered category, proportional odds regression the probability of each level or worse for ordered categories, and Cox regression the survival probability at a chosen time for censored time-to-event data. In a prediction context these models are practical tools rather than causal theories; a predictor may simply mark an unmeasured cause. Linear regression is fitted by least squares under assumptions about the residuals, and a better model produces a wider spread of predictions; generalised additive models replace linear terms with smooth functions. Turning a continuous outcome into categories or a yes/no variable loses information and power.",
"positions": [
"In prediction, statistical models are practical tools: all models are wrong, but some are useful.",
"Predictor-outcome relations in a model need not be causal.",
"Continuous outcomes give more power than ordinal, and ordinal more than binary.",
"Time-to-event data with censoring need survival methods that use all follow-up.",
"Book example: predicted costs of RSV hospitalisation had a low R² yet group means were accurate enough for decision analysis."
],
"misreadings": [
"Misreading: logistic regression can be used for time to delivery by dropping transferred women. Correction: dropping or misclassifying censored women biases results; Cox regression uses their follow-up up to transfer.",
"Misreading: dichotomising an outcome makes the analysis simpler at no cost. Correction: it discards information and lowers power; it should be a deliberate choice tied to the decision.",
"Misreading: a model with a low R² is useless. Correction: it may still give accurate predictions for groups, depending on the purpose."
],
"reteach": "Look at what the hospital records at each birth. Birth weight in grams is a measured number, so linear regression predicts its average. Preterm yes or no uses logistic regression. Term, moderately preterm or very preterm has an order, so a proportional odds model fits; spontaneous labour, early rupture of membranes or planned early delivery has no order, so a polytomous model fits. Days from admission to delivery, when some women are transferred before delivering, call for Cox regression.",
"where": "Steyerberg (2009), Chapter 4, section 4.1 (Continuous outcomes); Chapter 6, section 6.1 (Prediction with statistical models)"
},
{
"title": "Logistic regression and reading coefficients",
"terms": [
"logit (log-odds)",
"linear predictor (lp)",
"intercept",
"regression coefficient",
"odds ratio",
"unadjusted vs adjusted coefficient",
"centring",
"maximum likelihood",
"penalised estimation"
],
"core": "Logistic regression models the log-odds of a binary outcome as a linear combination of predictors: the intercept plus each coefficient times its predictor gives the linear predictor, which the logistic function converts into a probability. Each coefficient is the change in log-odds per unit of its predictor with the others held constant, and its exponent is the odds ratio. With one predictor the coefficient is unadjusted; with several it is adjusted for the others. Centring continuous predictors makes the intercept refer to a typical patient. Coefficients are usually estimated by maximum likelihood, while penalised methods deliberately shrink them to reduce overfitting.",
"positions": [
"The log-odds scale is a reasonable form for binary outcomes because it bounds probabilities between 0 and 1.",
"Odds ratios multiply odds, not risks.",
"The same odds ratio gives very different changes in risk at different baseline risks.",
"Patients and clinicians use the predicted risks, not the coefficients."
],
"notation": "logit(P) = ln(P / (1 − P)) = a + Σ b_i·x_i = lp; P = 1 / (1 + e^(−lp)); OR_i = e^(b_i)",
"misreadings": [
"Misreading: logistic regression assumes a straight-line relation between a predictor and risk. Correction: it is linear in the coefficients on the log-odds scale; curved effects can be coded with squares or splines.",
"Misreading: multiplying the baseline risk by the odds ratios gives the new risk. Correction: multiply the baseline odds, then convert back to a risk.",
"Misreading: lp = 0 means zero risk. Correction: lp = 0 is a risk of 50%; the lp already includes the intercept.",
"Misreading: the intercept is the average risk. Correction: it is the log-odds for someone with all predictors at zero or reference values."
],
"reteach": "The pilot model starts at −3.60 for a woman with no previous preterm birth and no urine infection, which is a 2.7% risk. A previous preterm birth adds 1.50 and a urine infection adds 0.90, giving −1.20, which the curve turns into 23.2%. On the odds scale those two additions are multiplications by about 4.5 and 2.5. Multiplying the 2.7% risk itself by those numbers would give 29%, which is wrong, because the multiplying belongs to the odds, not the risk.",
"where": "Steyerberg (2009), Chapter 4, section 4.2 (Binary outcomes)"
},
{
"title": "Likelihood, the likelihood ratio test and Nagelkerke's R²",
"terms": [
"log-likelihood (LL)",
"null model (LL0)",
"likelihood ratio (LR) statistic",
"deviance",
"nested models",
"chi-square distribution",
"Nagelkerke's R²",
"c statistic"
],
"core": "The log-likelihood sums, over all patients, the log of the probability the model assigned to what actually happened; it is zero for a perfect model and negative otherwise, with values closer to zero indicating better fit. The null model gives everyone the average risk. Twice the difference in log-likelihood between a model and a simpler nested model is the likelihood ratio statistic, compared with a chi-square distribution with degrees of freedom equal to the extra coefficients. Because the LR statistic grows with sample size, Nagelkerke's R² rescales it to a 0 to 100% measure of explained variation on the log-likelihood scale. The book shows that commonly 'acceptable' c statistics correspond to modest R² values.",
"positions": [
"The LR test compares nested models or tests a block of predictors.",
"Nagelkerke's R² rescales the LR statistic so it does not simply grow with n.",
"Book simulation at 50% incidence: c of 0.70 goes with an R² of only about 16%.",
"Statistical significance of an added predictor is not the same as useful improvement in predictions."
],
"notation": "LL = Σ [y·ln(p) + (1 − y)·ln(1 − p)]; LR = −2 (LL0 − LL1); R²_Nagelkerke = (1 − e^(−LR/n)) / (1 − e^(2·LL0/n))",
"misreadings": [
"Misreading: a significant LR test means the added predictor should be kept in a clinical model. Correction: with large n, trivial gains are significant; judge gains in prediction for new patients and the predictor's availability and cost.",
"Misreading: a positive log-likelihood is possible for a good model. Correction: for a binary outcome the log-likelihood is at most zero.",
"Misreading: R² and c measure the same thing. Correction: R² reflects overall fit on the likelihood scale; c reflects ranking only."
],
"reteach": "Imagine scoring the team's model by how surprised it is at each birth: if it gave a woman 80% and she delivered early, little surprise; if it gave her 5%, a lot. The log-likelihood adds up those surprises, and a model that gives everyone the same 12% is the baseline. Adding cervical length raised the LR statistic from 180 to 196, a significant gain, but R² rose only from about 17% to 18%. Since cervical length needs a scan that may not be done at booking, significance alone does not settle whether to add it.",
"where": "Steyerberg (2009), Chapter 4, section 4.2.1 (R² in logistic regression analysis); Chapter 4, section 4.2.2 (Calculation of R² on the log-likelihood scale)"
},
{
"title": "Bayes' rule as a one-predictor logistic model",
"terms": [
"Bayes' rule (Bayes' theorem)",
"prior probability (pre-test probability)",
"posterior probability (post-test probability)",
"diagnostic likelihood ratio (LR+, LR−)",
"weight of evidence",
"odds ratio of a test"
],
"core": "Bayes' rule updates the prior odds of a disease by multiplying them by the diagnostic likelihood ratio of a finding, giving the posterior odds. Written on the log-odds scale, the posterior log-odds equal the prior log-odds plus the log of the likelihood ratio, which has the same form as a logistic model. For a test with positive and negative results, the odds ratio equals LR+ divided by LR−, so the logistic coefficient for the test is the log of that ratio, and the intercept is the log-odds when the test is negative. The odds ratio belongs to the test, whereas the intercept reflects the setting and changes with prevalence.",
"positions": [
"Bayes' rule in logit form is equivalent to a logistic model with one binary predictor.",
"OR = LR+ / LR−; coefficient = ln(LR+) − ln(LR−).",
"The intercept equals the log-odds after a negative test and depends on the prevalence in the setting.",
"Moving a model to a setting with a different prevalence shifts the intercept, which foreshadows calibration problems."
],
"notation": "posterior odds = prior odds × LR; LR+ = sens / (1 − spec); LR− = (1 − sens) / spec; OR = LR+ / LR−",
"misreadings": [
"Misreading: LR+ is the test's odds ratio. Correction: the odds ratio is LR+ divided by LR−.",
"Misreading: the odds ratio of a test changes when the condition becomes rarer. Correction: sensitivity, specificity, LRs and OR stay the same; only the intercept and the predictive values change.",
"Misreading: the intercept is the prior log-odds. Correction: in the one-predictor logistic model, the intercept is the log-odds for a negative test, not the prior before testing."
],
"reteach": "Of women admitted with early contractions, 17% deliver within 7 days; the bedside test has sensitivity 70% and specificity 90%. A positive result multiplies the odds by 7 and a negative result by one third, so the chance becomes about 59% after a positive test and about 6% after a negative one. Writing this as a logistic model, the starting value is the log-odds after a negative test and the test's coefficient is the log of 7 divided by one third. In a unit where only 5% deliver within 7 days, the test's coefficient stays the same and only the starting value drops.",
"where": "Steyerberg (2009), Chapter 4, section 4.2.4 (Bayes rule); Chapter 4, section 4.2.5 (Calculations with likelihood ratios)"
},
{
"title": "Naive Bayes and why multiplying linked findings misleads",
"terms": [
"naive Bayes ('idiot's Bayes')",
"conditional independence",
"sequential application of Bayes' rule",
"univariate coefficients",
"calibration slope",
"recalibration of the linear predictor"
],
"core": "Naive Bayes applies Bayes' rule finding after finding, using each finding's own likelihood ratio, which is equivalent to building a linear predictor from univariate logistic coefficients. It is valid only if the findings are independent once disease status is known. Clinical findings are usually positively correlated, so each additional finding adds less than its own likelihood ratio suggests, and naive Bayes counts the shared information more than once. Predictions become too extreme in both directions, which shows as a calibration slope below 1; a simple repair re-estimates one coefficient for the naive linear predictor, and a multivariable logistic model estimates the joint effects properly. The book notes that naive Bayes can still discriminate remarkably well.",
"positions": [
"Naive Bayes ignores correlation between predictors.",
"With positively correlated findings, naive Bayes gives too-extreme predictions (calibration slope below 1).",
"Recalibrating with logit(y) = a + b_cal × lp_naive offers a simple correction.",
"Multivariable logistic regression estimates the joint effects of correlated findings correctly.",
"Naive Bayes may still rank patients well despite poor calibration."
],
"notation": "lp_u = b1,u·x1 + b2,u·x2 + … (univariate coefficients); recalibration: logit(y) = a + b_cal·lp_u",
"misreadings": [
"Misreading: naive Bayes gives predictions that are too cautious. Correction: with positively correlated findings, it gives predictions that are too extreme.",
"Misreading: naive Bayes must have poor discrimination. Correction: it can discriminate well; its main problem is calibration.",
"Misreading: published likelihood ratios can always be multiplied together. Correction: only if findings are conditionally independent, which is rare."
],
"reteach": "A woman with early contractions has a short cervix, a positive swab test and frequent contractions. Multiplying their published likelihood ratios gives a chance of delivery within 7 days of about 73%. But a short cervix and a positive swab often go together, so once the first is known the second tells you less; a model fitted to the three together gives about 50%. Multiplying is like counting the same witness twice because she told the story to two people.",
"where": "Steyerberg (2009), Chapter 4, section 4.2.6 (Prediction with naive Bayes); Chapter 4, section 4.2.8 (Calibration and naive Bayes)"
},
{
"title": "Classification trees and neural networks",
"terms": [
"classification and regression tree (CART, recursive partitioning)",
"pruning",
"neural network (hidden layers)",
"back-propagation",
"early stopping (overtraining)",
"generalised non-linear models",
"data hunger"
],
"core": "A tree splits patients repeatedly at the cut-off of whichever predictor best separates outcomes. In doing so it categorises continuous predictors, searches for cut-points (which inflates the selected effects), assumes that each split interacts with those above it and cannot represent simple main effects, and quickly runs out of patients in its branches. The book's small GUSTO-I tree on age and Killip class illustrates how a pruned tree ignores age in one branch and dichotomises it elsewhere. A neural network without a hidden layer is a logistic regression; hidden layers add flexibility, but prior knowledge is hard to impose, the model is hard to inspect, and training must be stopped early to limit overtraining.",
"positions": [
"Trees categorise continuous predictors, search cut-points and assume interactions, so they usually predict poorly in medical data.",
"Trees are data hungry because branches run out of patients quickly.",
"A neural network is a flexible extension of logistic regression, not a model of the brain.",
"Flexible methods need large data sets; medical prediction problems often have relatively small ones."
],
"misreadings": [
"Misreading: trees are good because they mimic clinical reasoning. Correction: resemblance to reasoning does not make them accurate predictors.",
"Misreading: trees use less data because each split uses one predictor. Correction: each split halves the patients available, so trees need more data.",
"Misreading: 'optimal' cut-offs found by a tree are reproducible. Correction: searched cut-points are tuned to chance features of the sample.",
"Misreading: a neural network is more accurate because it is more complex. Correction: complexity costs degrees of freedom and invites overfitting unless data are plentiful."
],
"reteach": "Suppose a tree first splits the 450 women on previous preterm birth, then each branch on haemoglobin, then on age. After two or three splits some branches hold only a handful of the 55 women who delivered early, and the 'best' cut-offs are mostly chance. The tree also treats age as mattering only in some branches, which is rarely how biology works. A neural network with two hidden layers on 25 inputs spends far more parameters than 55 events can support.",
"where": "Steyerberg (2009), Chapter 4, section 4.2.11 (Classification and regression trees); Chapter 4, section 4.2.13 (Advantages and disadvantages of tree models); Chapter 4, section 4.2.10 (More flexible approaches to binary outcomes)"
},
{
"title": "Models for categorical, ordinal and survival outcomes",
"terms": [
"polytomous logistic regression (reference category, j − 1 submodels)",
"proportional odds model (one set of coefficients, one intercept per cut-point)",
"continuation ratio model",
"Cox proportional hazards model",
"baseline hazard and baseline survival",
"hazard ratio",
"proportional hazards assumption",
"Kaplan-Meier",
"parametric survival models (e.g. Weibull)"
],
"core": "A polytomous model fits one logistic submodel per non-reference category against a reference, each with its own linear predictor; in the book's testicular cancer example it performed very similarly to a sequence of binary models. The proportional odds model for ordered outcomes uses one set of coefficients and a separate intercept for each cut-point, assuming each predictor's odds ratio is the same whichever cut-point is used; in the book's Glasgow Outcome Scale example the separate odds ratios for age were close to the combined estimate. Cox regression multiplies a baseline hazard by the exponent of the linear predictor, so survival for a patient equals baseline survival raised to the power e^lp, and e^b is a hazard ratio assumed constant over follow-up. Kaplan-Meier curves describe survival by group, and parametric models smooth the baseline hazard.",
"positions": [
"Polytomous models and sequences of binary models can perform very similarly.",
"The proportional odds model assumes a common odds ratio across cut-points; this can be checked against separate binary models.",
"Cox regression assumes proportional hazards; hazard ratios are taken as constant over time.",
"Survival outcomes should be analysed with methods that use all available follow-up."
],
"notation": "polytomous: P(A) = e^(lp_A) / (1 + e^(lp_A) + e^(lp_B)); Cox: λ(t|X) = λ0(t)·e^lp, S(t|X) = S0(t)^(e^lp)",
"misreadings": [
"Misreading: a hazard ratio of 2 doubles the probability of the event by a given time. Correction: it doubles the hazard; survival is baseline survival raised to the power 2, so event probabilities do not simply double.",
"Misreading: ordered categories should be analysed with a polytomous model. Correction: a proportional odds model uses the order and is more efficient, provided the common odds ratio assumption is reasonable.",
"Misreading: in a polytomous model the category probabilities are calculated independently. Correction: they share a denominator and must sum to 100%."
],
"reteach": "For women admitted with early contractions, suppose 85% of an average woman have not delivered by day 7. A woman whose linear predictor is 0.7 has a hazard about twice as high, so her chance of still being undelivered is 0.85 raised to the power of about 2, roughly 72%, giving about a 28% chance of delivering within the week. For the type of preterm birth, the polytomous model gives each type its own score against term birth, and the three probabilities are shared out so that they add to 100%.",
"where": "Steyerberg (2009), Chapter 4, section 4.3.1 (Polytomous logistic regression); Chapter 4, section 4.4.1 (Proportional odds logistic regression); Chapter 4, section 4.5.1 (Cox proportional hazards regression)"
},
{
"title": "Choosing between models: regression as the default",
"terms": [
"model choice",
"testing model assumptions",
"reasonable mathematical form",
"efficient use of data",
"robustness vs flexibility",
"transparency",
"head-to-head comparisons",
"signal-to-noise ratio"
],
"core": "No model is true; a model only approximates underlying patterns, so the question is which predicts best for new patients. Testing assumptions such as linearity, additivity or proportional hazards is worthwhile only to the extent that adapting the model improves predictions, and a significant violation does not mean the model predicts poorly. The book suggests choosing a model with a reasonable mathematical form, efficient use of the data, robustness rather than flexibility, transparency for its audience, and guidance from subject knowledge and practicality. Head-to-head comparisons, including StatLog and GUSTO-I, found that a well-built logistic model was not beaten by trees, neural networks or naive Bayes, and that many apparent wins for modern methods came from a poorly built regression comparator. With low signal-to-noise ratios and modest event numbers in medical data, regression is the appropriate default.",
"positions": [
"Statistically significant violations of assumptions do not mean a model predicts poorly.",
"Prefer robustness over flexibility in capturing idiosyncrasies.",
"Book example: in GUSTO-I, linear age fitted almost as well as more flexible age terms; in 1.2 million Medicare patients procedure-specific age effects barely changed R² and left c unchanged.",
"Non-linear effects and interactions must be quite strong before flexible methods gain over simple regression.",
"Compare methods on validated, not apparent, performance."
],
"misreadings": [
"Misreading: the method with the highest c statistic in the development data is best. Correction: apparent c rewards overfitting, especially for flexible methods; compare on new data or with internal validation of the whole process.",
"Misreading: a significant chi-square for a more complex term proves it should be used. Correction: in very large data trivial deviations are significant; ask whether predictions improve meaningfully.",
"Misreading: machine-learning methods are generally more accurate than regression. Correction: the book's comparisons found no advantage of trees or networks over a well-built logistic model in typical medical data."
],
"reteach": "Another group proposes a tree and a neural network for 450 women with 55 preterm births, and plans to pick whichever has the highest c in those same women. That is like choosing a tailor by how well a suit fits the mannequin it was cut on. A logistic model with a few clinically chosen predictors, with a U-shaped age effect coded if needed, is the sensible starting point. Any alternative should be built with equal care and compared on how well it predicts for women it has not seen.",
"where": "Steyerberg (2009), Chapter 6, section 6.1.2 (Choosing a type of model); Chapter 6, section 6.3 (Head-to-head comparisons); Chapter 6, section 6.4 (Concluding remarks)"
}
],
"m04": [
{
"title": "Overfitting, apparent performance and optimism",
"terms": [
"overfitting",
"apparent performance",
"true performance (in new subjects from the same population)",
"optimism",
"degrees of freedom in the modelling process",
"sample and population"
],
"core": "A model is derived from a sample only because the sample represents a population, and its value lies in predictions for new subjects from that population. Overfitting occurs when the model captures idiosyncrasies of the sample that do not generalise; the book defines it more precisely as fitting with too many degrees of freedom in the modelling process, counting not only estimated coefficients but also every search for predictors, codings, cut-points and transformations. Performance measured in the development sample is the apparent performance, and performance in the underlying population is the true performance. Their difference is the optimism, summarised by the phrase that what you see may not be what you get. Overfitting arises from two causes, model uncertainty and parameter uncertainty, and has two consequences, testimation bias and optimism.",
"positions": [
"Degrees of freedom are spent on every data-driven modelling decision, not only on coefficients.",
"Apparent performance is optimistic relative to performance in new subjects.",
"Causes of overfitting: model uncertainty and parameter uncertainty; consequences: testimation bias and optimism."
],
"notation": "course: optimism = apparent − true performance (positive); book: optimism = true − apparent",
"misreadings": [
"Misreading: overfitting only happens when a model has many coefficients. Correction: searches for predictors, cut-points and codings also spend degrees of freedom and cause overfitting.",
"Misreading: a drop in performance at the same hospital means something changed there. Correction: with the same population and measurements, the drop is the optimism from fitting chance patterns.",
"Nuance: the book writes optimism as true minus apparent performance, while the course writes apparent minus true so the number is positive; both describe the same gap."
],
"reteach": "The team's model scored a c statistic of 0.86 in the 600 women used to build it and 0.74 in the next 600 women at the same hospital, with nothing else changed. The model had learned some patterns that were real and some that were just quirks of those first 600 women. The quirks do not repeat, so the score falls. The 0.12 gap is the optimism, the part of the first score that was never going to hold up.",
"where": "Steyerberg (2009), Chapter 5, section 5.1 (Overfitting and optimism)"
},
{
"title": "Chance in small units, regression to the mean and shrinkage",
"terms": [
"sampling variability",
"heterogeneity between centres (τ)",
"regression to the mean",
"shrinkage towards the mean",
"noise versus true differences"
],
"core": "Even when every centre has the same true risk, observed rates in small centres spread widely by chance, so the lowest observed rates tend to be too low and the highest too high. Used as predictions for the next period, these extreme rates move back towards the average: regression to the mean. Each centre's own rate may be a fair estimate on its own, but the set of rates is too dispersed. When true rates do differ, their spread (heterogeneity) is still much smaller than the spread of observed rates in small centres. Better predictions come from shrinking each estimate towards the overall mean, more strongly when centres are small and when true heterogeneity is small; with larger centres the problem diminishes.",
"positions": [
"Observed rates from small units are too extreme as predictions.",
"Shrink towards the mean, more for small units and small true heterogeneity.",
"Book example (oesophagectomy): simulated centres of 20 patients with 10% true mortality everywhere showed about 12% reporting 0% and 13% reporting 20% or more by chance.",
"A quality programme evaluated only in the 'worst' units will appear to work through regression to the mean alone.",
"A prediction model's highest and lowest predictions behave in the same way and need shrinkage."
],
"notation": "SD of an observed proportion = √(p(1 − p)/n)",
"misreadings": [
"Misreading: the centres with the worst rates have the worst care. Correction: with about 50 births per quarter, much of the ranking is chance.",
"Misreading: an improvement in the worst centres after an intervention proves it worked. Correction: they would be expected to improve anyway because of regression to the mean; a comparison group is needed.",
"Misreading: shrinkage throws away real information. Correction: it trades a little bias for much less variance, giving better predictions on average."
],
"reteach": "Picture the 20 health centres, each with about 50 births a quarter and the same true preterm risk of 12%. In one quarter their observed rates ran from 2% to 22%, purely by chance. The best three averaged about 4% and the worst three about 21%, but next quarter both groups drifted to around 9-11%. Pulling each centre's rate part of the way towards the district average would have predicted next quarter much better than taking each rate at face value.",
"where": "Steyerberg (2009), Chapter 5, section 5.1.3 (Variability between centres: noise vs. true heterogeneity); Chapter 5, section 5.1.4 (Predicting mortality by centre: shrinkage)"
},
{
"title": "Model uncertainty and testimation bias",
"terms": [
"model uncertainty",
"selection bias (of predictors)",
"testimation bias",
"noise variables",
"stepwise selection",
"prespecified model",
"optimal cut-point"
],
"core": "Model uncertainty arises when the structure of the model, such as which predictors are included, is decided from the data under study, and it is usually ignored by analyses that treat the final model as if prespecified. Among 20 pure noise candidates, about one will be significant at p < 0.05, and its estimated effect must be fairly large to have passed the test. A real predictor's estimate varies around its true value; keeping it only when it is significant keeps the samples where it came out large, so the retained effect is overestimated. Because estimation follows testing, the book calls this testimation bias. The bias is largest for weak effects relative to their standard error, vanishes with very large samples or a prespecified full model, and also follows from searching for optimal cut-points, testing transformations or merging categories.",
"positions": [
"Selecting predictors by significance overestimates the selected effects.",
"Book example: true coefficient 1, SE 0.5; about 52% of studies find it significant and their mean estimate is 1.39, a 39% overestimate.",
"The bias is large for relatively weak effects, as is common in medical research.",
"A prespecified model that keeps all candidates avoids testimation bias, though it still has parameter uncertainty.",
"In the book, 'selection bias' here refers to selection of predictors, not of subjects."
],
"notation": "testimation rule: if b is significant use b, else set b = 0; significance threshold |b| > 1.96 × SE",
"misreadings": [
"Misreading: noise variables cannot reach significance. Correction: at p < 0.05 about 1 in 20 will, with a fairly large estimate.",
"Misreading: a large effect in a stepwise-selected model is a strong new finding. Correction: large selected effects are exactly what testimation bias predicts; check in a prespecified model or new data.",
"Misreading: testimation bias depends on the size of the effect alone. Correction: it depends on the effect relative to its standard error.",
"Misreading: selection bias here means biased patient sampling. Correction: in this chapter it means bias from selecting predictors."
],
"reteach": "The team screened 20 candidates and kept those with p below 0.05, including tobacco use with a log odds ratio of 0.85. Imagine the same study repeated many times: in some runs tobacco's estimate comes out high by chance and passes the test, in others it comes out low and is dropped. Only the high runs are kept, so the effect the team reports is, on average, too large. Had the team decided in advance to keep tobacco whatever its p-value, this particular bias would not arise.",
"where": "Steyerberg (2009), Chapter 5, section 5.2.1 (Model uncertainty: testimation); Chapter 5, section 5.2.2 (Other biases)"
},
{
"title": "Parameter uncertainty, the calibration slope and shrinkage",
"terms": [
"parameter uncertainty",
"regression to the mean in the linear predictor",
"calibration slope",
"shrinkage of coefficients",
"bias-variance trade-off",
"Stein's paradox"
],
"core": "Even with a fully prespecified model, predictions are too extreme in new patients because each coefficient is estimated with uncertainty. Standard methods estimate each coefficient nearly without bias, but when coefficients are combined in a linear predictor, the patients with the highest predictions are partly those whose errors pushed upwards, and the lowest partly those pushed downwards; low predictions are on average too low and high ones too high. This is regression to the mean in the linear predictor. In new data, fitting the outcome on the linear predictor gives the calibration slope, which is 1 in the development data, below 1 when predictions are too extreme and above 1 when they are too modest. Shrinking coefficients towards zero introduces some bias but, done properly, the gain in precision of the predictions more than offsets it, an idea related to Stein's paradox.",
"positions": [
"A prespecified model still overfits through parameter uncertainty.",
"A calibration slope below 1 in new data is the usual sign of overfitting.",
"Biased, shrunken estimates can predict better than unbiased ones in multivariable settings (bias-variance trade-off).",
"Shrinkage methods are developed later in the book (Module 10 in the course)."
],
"notation": "in new data: logit(y) = a + b_slope × lp; b_slope = 1 ideal, < 1 too extreme, > 1 too modest",
"misreadings": [
"Misreading: if every coefficient is unbiased, the predictions are unbiased too. Correction: combining uncertain coefficients makes extreme predictions too extreme.",
"Misreading: a calibration slope of 0.7 means average risks are 30% too high. Correction: the slope concerns the spread of predictions, not their average level (calibration-in-the-large).",
"Misreading: a slope below 1 means the model is useless. Correction: it may still rank well; coefficients can be shrunk or the model recalibrated.",
"Misreading: shrinkage is only needed after stepwise selection. Correction: parameter uncertainty affects prespecified models too."
],
"reteach": "A neighbouring hospital built its model from only 60 preterm births and 12 coefficients. Applied to the team's women, its lowest tenth was predicted at 2% but 5% delivered early, and its highest tenth was predicted at 55% but 38% delivered early. The predictions are stretched too far in both directions, a calibration slope of about 0.6. Squeezing each woman's score towards the average by that factor would bring the predictions back in line.",
"where": "Steyerberg (2009), Chapter 5, section 5.2.3 (Overfitting by parameter uncertainty)"
},
{
"title": "Optimism in performance measures and events per variable",
"terms": [
"optimism in R² and c",
"Nagelkerke's R²",
"adjusted R²",
"model complexity",
"events per variable (EPV)",
"noise fitting"
],
"core": "Optimism shows up in every performance measure. In the book's simulation of 20 centres with identical true mortality, the apparent Nagelkerke R² for centre effects was clearly above zero with 20 patients per centre and almost vanished with 2,000 per centre, although the true R² was 0. Because noise can always be fitted, adding predictors always improves apparent performance, while performance in new patients stops improving and then deteriorates. An adjusted R² corrects for the degrees of freedom of a prespecified model but cannot count those spent invisibly on selection and coding. The amount of optimism is driven by the number of events relative to the number of candidate parameters: below about 10 events per variable overfitting is serious, and above 10 optimism is smaller but should still be estimated.",
"positions": [
"Apparent performance always improves as predictors are added; true performance does not.",
"Book example: R² of 9.4% from pure noise with 20 patients per centre, falling to 0.1% with 2,000 per centre.",
"Adjusted R² works only for a prespecified model with known degrees of freedom.",
"EPV below 10 implies serious overfitting; above 10 optimism should still be quantified."
],
"notation": "R²_adj = (1 − e^(−(LR − df)/n)) / (1 − e^(−(−2·LL0)/n)); EPV = events / candidate df",
"misreadings": [
"Misreading: with EPV of 10 or more, overfitting is not a concern. Correction: EPV 10 is a minimum; the calibration slope can still be below 1 and optimism should be estimated.",
"Misreading: a model built purely on noise will show no performance. Correction: its apparent performance can look useful even though true performance is nil.",
"Misreading: adjusted R² corrects for all overfitting. Correction: it cannot account for degrees of freedom spent on data-driven selection or coding."
],
"reteach": "Picture the team fitting 10 useless predictors alongside 3 real ones in 200 women with 24 preterm births. In those 200 women the model looks good, with an apparent c around 0.8, because the useless predictors happily fit chance. In fresh women the c drops to about two thirds and the predictions are badly stretched. With 2,000 women and 240 preterm births the apparent and honest scores come close together, because each term has many more events to learn from.",
"where": "Steyerberg (2009), Chapter 5, section 5.2.4 (Optimism in model performance); Chapter 5, section 5.2.5 (Optimism-corrected performance)"
},
{
"title": "Bootstrap resampling",
"terms": [
"bootstrap",
"bootstrap sample (same size, drawn with replacement)",
"resampling",
"bootstrap confidence intervals (normal approximation, percentile, bias-corrected)",
"replications"
],
"core": "A bootstrap sample is drawn with replacement from the original data and has the same size, so some individuals appear once, some several times and some not at all. Repeating this many times imitates drawing new samples from the underlying population, and the variation of an estimate across bootstrap samples reflects its sampling uncertainty. The chance that a given individual appears at least once is one minus (1 − 1/n) to the power n, close to 63.2% for any reasonably large sample. The bootstrap can provide confidence intervals for regression coefficients by several methods, and percentile methods need many replications, of the order of 2,000.",
"positions": [
"Bootstrap samples have the same size as the original and are drawn with replacement.",
"About 63.2% of individuals appear in each bootstrap sample.",
"Percentile-based confidence intervals need many replications (the course notes at least 2,000).",
"Book example: from ages 20, 25, 30, 32, 35, bootstrap samples can contain repeats and omissions."
],
"notation": "P(individual included) = 1 − (1 − 1/n)^n ≈ 0.632",
"misreadings": [
"Misreading: a bootstrap sample is a random 63% subset. Correction: it has all n records; about 63% of distinct individuals, some repeated.",
"Misreading: bootstrapping creates new information. Correction: it only reuses the existing data to show how much estimates would vary.",
"Misreading: about 632 records are in a bootstrap sample of 1,000. Correction: there are 1,000 records, representing about 632 different women."
],
"reteach": "Write each of the team's 1,500 women on a card in a hat. Draw a card, note it, put it back, and repeat 1,500 times. Some women are drawn twice or three times and about a third are never drawn, so the new pile is the same size but a slightly different mix. Doing this hundreds of times gives hundreds of plausible versions of the cohort, and seeing how a result changes across them shows how much it could have varied by chance.",
"where": "Steyerberg (2009), Chapter 5, section 5.3 (Bootstrap resampling); Chapter 5, section 5.3.2 (Bootstrapping for regression coefficients)"
},
{
"title": "Bootstrap optimism correction: validate the whole process",
"terms": [
"optimism-corrected performance",
"bootstrap performance",
"test performance",
"internal validation",
".632 and .632+ estimators",
"replaying model selection"
],
"core": "To estimate optimism, the model is rebuilt in each bootstrap sample, its performance in that sample (bootstrap performance) is compared with its performance when applied unchanged to the original data (test performance), and the average difference over at least 100 repeats is subtracted from the apparent performance. This works for R², the c statistic and the calibration slope; for the slope the corrected value is simply the average test slope, which indicates how much shrinkage is needed. Every data-driven step, such as screening, stepwise selection, cut-point searches and coding choices, must be repeated in each bootstrap sample. In the book's GUSTO-I subsample of 429 patients, treating a stepwise-selected model as prespecified roughly halved the estimated optimism, and honestly corrected, the full prespecified model outperformed the stepwise model. Informal steps such as looking at plots cannot be replayed, so the corrected estimate is then still an upper bound.",
"positions": [
"Corrected performance = apparent − mean(bootstrap − test).",
"Validate the modelling process, not only the final formula.",
"Optimism from predictor selection can be as large as that from parameter uncertainty.",
"A full prespecified model often beats stepwise selection after honest correction, especially when several nearly significant predictors would be dropped.",
"The bootstrap works best for one predefined strategy; comparing many strategies makes the winner sample-specific.",
"Average bootstrap performance often exceeds apparent performance because repeated individuals are easier to predict."
],
"notation": "optimism = mean over B samples of (performance_bootstrap − performance_test); corrected = apparent − optimism; B ≥ 100",
"misreadings": [
"Misreading: bootstrapping the final model is enough. Correction: if the data chose the predictors, the choosing must be repeated in each sample, or optimism is underestimated.",
"Misreading: the average test performance is the best corrected estimate. Correction: it is a cruder variant; the book prefers subtracting the estimated optimism from the apparent performance.",
"Misreading: testing on the original sample is invalid because it overlaps the bootstrap sample. Correction: theory and simulation support it; .632-type variants showed no clear advantage.",
"Misreading: smaller optimism after stepwise selection means a better model. Correction: what matters is the corrected performance, which was lower for the stepwise model in the book's example."
],
"reteach": "The team's 8-predictor model had an apparent c of 0.792. In each bootstrap sample the team rebuilt it and found it scored a bit higher on its own sample than when tried on the original 1,500 women; across repeats that gap averaged about 0.039, so the honest c is about 0.753. A second analyst used stepwise selection; when the selection was rerun in every bootstrap sample, his corrected c was 0.727, but if he had bootstrapped only his final four predictors he would have claimed 0.765. Skipping the selection step hides the cost of letting the data choose.",
"where": "Steyerberg (2009), Chapter 5, section 5.3.3 (Bootstrapping for optimism correction); Chapter 5, section 5.3.5 (Example: stepwise selection in 429 patients)"
},
{
"title": "The cost of data analysis",
"terms": [
"cost of data analysis",
"generalised degrees of freedom (Ye)",
"data-hungry strategies",
"robust strategies",
"prespecification of candidate predictors"
],
"core": "Model development is a constant balance between fitting the data better and generalising beyond them: the more a model is tuned to one data set, the less it may generalise. Ignoring clear features such as a strongly non-linear effect also harms predictions, but iteratively adapting the model to every small violation makes it specific to the sample. The book cites Ye's generalised degrees of freedom, which showed that a stepwise procedure ending with five predictors and a 19-node tree had used far more effective degrees of freedom than their apparent counts. Practical implications are to accept more assumptions when samples are small, prefer strategies that are not data hungry, use the bootstrap mainly to judge one predefined strategy, and prespecify candidate predictors from subject knowledge so that noise variables are not considered.",
"positions": [
"With small samples, accept more assumptions; power to detect violations is low and adapting after testing adds testimation bias.",
"Prespecified regression is less data hungry than testing many terms, stepwise selection or trees.",
"Book example (Ye): stepwise selection to 5 predictors had 14.1 generalised df; a 19-node tree had 76.",
"A development-data c statistic after stepwise selection from many candidates in a small sample is an upper limit.",
"Findings need stringent tests such as validation."
],
"misreadings": [
"Misreading: testing and fixing every assumption always improves a model. Correction: in small samples it spends degrees of freedom and may worsen predictions for new patients.",
"Misreading: a model's degrees of freedom equal its number of coefficients. Correction: selection and searching consume hidden degrees of freedom.",
"Misreading: the bootstrap can pick the best of many strategies safely. Correction: when many strategies are compared, the winner may again be sample-specific."
],
"reteach": "Every time the team looks at the data and adjusts the model (dropping a predictor, moving a cut-off, adding a curve), it pays a hidden fee in generalisability. With 64 preterm births, testing and patching every small imperfection makes the model fit the team's women ever more closely and new women less well. A shorter list of candidates chosen from clinical knowledge, kept in a prespecified model, pays far less of that fee.",
"where": "Steyerberg (2009), Chapter 5, section 5.4 (Cost of data analysis); Chapter 5, section 5.4.2 (Practical implications)"
}
],
"m05": [
{
"title": "Complete case analysis and what it costs",
"terms": [
"missing predictor values",
"complete case (CC) analysis (listwise deletion)",
"available case analysis (pairwise deletion)",
"incomplete records",
"inefficiency",
"events per variable after exclusion"
],
"core": "The chapter concerns missing values of predictors, where a true value exists but was not recorded. Most software silently performs a complete case analysis, dropping anyone missing any variable in the model, while an available case analysis uses different subsets of people for different analyses. Both discard what was recorded for incomplete individuals, causing three problems: loss of information and power (fewer events, more overfitting), difficult interpretation when analyses are based on different numbers of people, and possible bias in coefficients. A small share of missing values can remove a large share of people: in the book's hypothetical example, 10% of values missing across five predictors removed half the patients when no one missed more than one value.",
"positions": [
"Missing data lead to inefficiency, difficult interpretation and possible bias.",
"A small fraction of missing values can exclude a large fraction of patients.",
"When crude and adjusted analyses use different patients, a change in effect cannot be attributed to confounding alone.",
"Count both the people and the events retained before accepting a complete case analysis."
],
"notation": "share complete with k predictors each missing a fraction m: independent gaps (1 − m)^k; at most one gap per person 1 − k·m; all gaps in the same people 1 − m",
"misreadings": [
"Misreading: 10% missing values means 10% of patients are lost. Correction: with several incomplete predictors the share of incomplete patients can be several times larger.",
"Misreading: the software handles missing values sensibly by default. Correction: the default is usually complete case analysis, often without saying so.",
"Misreading: an odds ratio that changes after adjustment shows confounding. Correction: if the adjusted model used fewer patients, the change may reflect a different, selected group."
],
"reteach": "In the team's cohort, haemoglobin is missing for 15% of women and BMI for 8%, and everything else is complete. Fewer than 3% of all the needed values are missing, yet dropping every woman with any gap removes about one woman in five, along with her preterm births. Those women still have useful recorded information, such as age, history and outcome, which a complete case analysis throws away.",
"where": "Steyerberg (2009), Chapter 7, section 7.1.1 (Inefficiency of complete case analysis); Chapter 7, section 7.1.2 (Interpretation of analyses with missing data)"
},
{
"title": "Missing data mechanisms: MCAR, MAR and MNAR",
"terms": [
"missing completely at random (MCAR)",
"missing at random (MAR)",
"MAR on x",
"MAR on y",
"MAR by design",
"missing not at random (MNAR)",
"missingness"
],
"core": "Methods for missing values rest on assumptions about why values are missing. Under MCAR, missingness is unrelated to anything about the person, as with laboratory accidents or lost post, so incomplete records are a random subset; this strict assumption can be tested and is often rejected. Under MAR, missingness depends only on observed information, such as other predictors, time or place (MAR on x) or the outcome (MAR on y); deliberately not measuring a value in a recorded subgroup is MAR by design. Under MNAR, missingness depends on the unobserved value itself or on characteristics not available in the analysis. MAR cannot be tested, so MNAR always remains a possibility; MAR becomes more plausible the more of the reasons for missingness are recorded.",
"positions": [
"MCAR can be tested and is often rejected in medical data.",
"MAR cannot be tested; MNAR can never be ruled out.",
"If predictors are recorded before the outcome, any association between missingness and outcome must run through other characteristics: MAR on x if they are recorded, MNAR if not.",
"Explore patterns: missingness per predictor, co-occurrence, links with site and time, a logistic model for missingness, and outcome by missingness.",
"Use subject-matter knowledge to judge whether MNAR is plausible."
],
"misreadings": [
"Misreading: 'missing at random' means missing by pure chance. Correction: that is MCAR; MAR means missingness is explained by recorded information.",
"Misreading: MAR is harmless. Correction: under MAR the complete cases are not representative, and MAR on y biases complete case coefficients.",
"Misreading: a test can show the data are MAR. Correction: only MCAR can be tested; MAR is an untestable assumption.",
"Misreading: missingness linked to the outcome in a prospective cohort means the outcome caused it. Correction: predictors recorded before the birth cannot be missing because of it; the link must run through other characteristics."
],
"reteach": "Three stories about missing booking haemoglobin. If the analyser broke down for two weeks, the gaps are pure bad luck (MCAR). If results are missing more often in women with few antenatal visits, and visits are recorded, the gaps can be explained from the data (MAR). If results are missing because women with very low values were sent elsewhere and nobody wrote down why, the gaps depend on the missing value itself (MNAR), and nothing in the data can fully repair that.",
"where": "Steyerberg (2009), Chapter 7, section 7.1.3 (Missing data mechanisms); Chapter 7, section 7.7.1 (Patterns of missingness)"
},
{
"title": "What complete case analysis does to regression coefficients",
"terms": [
"bias under MAR on y",
"conditioning on predictors",
"selection on X",
"efficiency loss",
"narrower population"
],
"core": "The book illustrates the effects with a simple linear model in which the outcome depends equally on two independent predictors and values of the first predictor are deleted in different ways. Complete case estimates stayed unbiased when missingness was completely random, when it depended on the other predictor, and even when it depended on the missing predictor's own value, because regression coefficients are conditional on the predictors and selection on X does not distort them. Only when missingness depended on the outcome were both coefficients biased, including that of the complete predictor. A correlation between missingness and the outcome is therefore the serious case, although even unbiased complete case estimates are less precise and describe a narrower population.",
"positions": [
"Missingness related to the outcome (MAR on y) biases all coefficients in a complete case analysis, including those of complete predictors.",
"Book simulation: under MAR on y both coefficients were about 0.82 instead of 1.",
"Selection on predictor values need not bias coefficients, because regression conditions on X.",
"Unbiased is not enough: complete case analysis still wastes information.",
"In real data it is rarely certain that missingness is unrelated to the outcome."
],
"misreadings": [
"Misreading: MNAR always biases complete case estimates. Correction: in the book's simple example, missingness depending on the predictor's own value left the coefficients unbiased.",
"Misreading: only the coefficient of the incomplete predictor is affected. Correction: under MAR on y the complete predictor's coefficient was biased too.",
"Misreading: if coefficients are unbiased, complete case analysis is fine. Correction: precision is lost, overfitting grows and performance refers to a narrower group.",
"Nuance: the course simulator makes X2 the incomplete predictor and correlates X1 with X2, so its MAR-on-y bias (about 0.92) differs from the book's 0.82 for independent predictors; the pattern, both coefficients pulled towards zero, is the same."
],
"reteach": "In an old records study, files of women who delivered early were often sent with them to the referral hospital, so their booking haemoglobin is missing more often. Dropping those women removes preterm births selectively, so the women left show a weaker link between all the predictors and preterm birth, not just haemoglobin. By contrast, if haemoglobin is missing more often in women with few visits and visits are in the model, the coefficients stay about right; the team just loses precision.",
"where": "Steyerberg (2009), Chapter 7, section 7.2 (Regression coefficients under MCAR, MAR, and MNAR)"
},
{
"title": "Imputation methods: mean, conditional mean, stochastic and multiple",
"terms": [
"imputation",
"mean (or mode) imputation",
"conditional mean (regression) imputation (CM)",
"stochastic regression imputation (single imputation, SI)",
"multiple imputation (MI)",
"data augmentation (iterative imputation)",
"maximum likelihood methods"
],
"core": "Imputation fills each missing value with a plausible value so that standard methods can be applied to the completed data; maximum likelihood methods are an alternative, but the book concentrates on imputation. Mean imputation ignores relations with other variables and shrinks the spread, and is generally poor. Conditional mean imputation puts in the value predicted by a regression on the other predictors and can work well when the missing variable is highly predictable, as with haemoglobin from haematocrit and sex in the book's head-injury example. Stochastic single imputation adds a random element to the predicted value, and multiple imputation repeats such draws several times and pools the results. With several incomplete predictors, imputation proceeds iteratively until the imputed values stabilise.",
"positions": [
"Mean imputation is generally poor.",
"Conditional mean imputation can work well when the missing predictor is strongly predictable from other variables.",
"Stochastic single imputation and multiple imputation add random variation reflecting uncertainty about the missing values.",
"In the book's simulations with mixed mechanisms including MAR on y, stochastic SI and MI gave nearly unbiased coefficients while CC and conditional mean imputation did not."
],
"misreadings": [
"Misreading: imputation invents data and so is less honest than dropping people. Correction: it uses the recorded information on incomplete people and, under MAR, reduces bias and increases precision.",
"Misreading: the best single guess is the best imputation. Correction: a deterministic guess understates variability; for inference, random draws (and MI) are preferable.",
"Misreading: replacing a missing value with the mean is neutral. Correction: it distorts relations with other predictors and can badly bias coefficients."
],
"reteach": "For a woman with no booking haemoglobin, the team knows her visits, history and that she delivered early. Putting in the district average ignores all of that. A regression on her other details gives a sensible single guess, say 10.2, but treats it as if measured. Multiple imputation instead draws several plausible values, such as 9.6, 10.5 and 9.9, each completing one copy of the data, so the analysis carries the uncertainty about her true value.",
"where": "Steyerberg (2009), Chapter 7, section 7.3.1 (Imputation principle); Chapter 7, section 7.3.2 (Simple and more advanced single imputation methods)"
},
{
"title": "Multiple imputation and Rubin's rules",
"terms": [
"multiple imputation (M imputed data sets)",
"pooled estimate",
"within-imputation variance (W)",
"between-imputation variance (B)",
"Rubin's rules",
"number of imputations (M)"
],
"core": "In multiple imputation, M completed data sets are created with random imputations, each is analysed in the usual way, and the results are combined with Rubin's rules. The pooled coefficient is the mean of the M estimates. Its variance adds the average within-imputation variance to the between-imputation variance multiplied by (1 + 1/M), so that uncertainty about the missing values is counted. A single imputation ignores the between-imputation part and understates standard errors. M is usually 5 or 10, and relatively few imputations are needed for stable results.",
"positions": [
"Pooled estimate = mean of the M estimates.",
"Total variance = W + (1 + 1/M) × B.",
"Single imputation underestimates the uncertainty of effect estimates.",
"Five or ten imputations are usually sufficient."
],
"notation": "b̄ = (1/M) Σ b_m; W = mean of SE_m²; B = Σ (b_m − b̄)² / (M − 1); Var(b̄) = W + (1 + 1/M)·B",
"misreadings": [
"Misreading: the pooled standard error is the average of the M standard errors. Correction: it is the square root of W plus the inflated between-imputation variance.",
"Misreading: the (1 + 1/M) factor can be dropped. Correction: it accounts for using a finite number of imputations.",
"Misreading: more imputations always change the answer substantially. Correction: beyond 5 to 10 imputations the gain is usually small."
],
"reteach": "After multiple imputation, the team's coefficient for low haemoglobin came out at 0.42, 0.47, 0.44, 0.50 and 0.45 in the five completed data sets. The pooled value is simply their average, 0.456. Its uncertainty has two parts: the usual uncertainty within each analysis, and the extra spread between the five answers caused by not knowing the missing values. Adding both raised the standard error from about 0.080 to 0.087; a single imputation would have reported the smaller, overconfident number.",
"where": "Steyerberg (2009), Chapter 7, section 7.3.3 (Multiple imputation)"
},
{
"title": "Building the imputation model",
"terms": [
"imputation model",
"form (logistic, polytomous, linear)",
"auxiliary variables",
"including the outcome",
"truncation of imputed values",
"transformations in imputation (mice, aregImpute)"
],
"core": "The imputation model is an explicit attempt to model the MAR process, and it requires choices about its form and its content. Binary predictors are imputed with a logistic model, categorical ones with three or more levels with a polytomous model and continuous ones with linear regression, truncating implausible values. For multiple or stochastic imputation the model must contain all predictors of the prediction model, auxiliary variables related to the missing values or their missingness (such as calendar time or site), and the outcome. Leaving out the outcome dilutes the predictors' effects even under MCAR, roughly halving a coefficient when half the values are missing. For deterministic conditional mean imputation the rule is reversed: only the predictors should be used, because including the outcome would exaggerate the associations.",
"positions": [
"MI and stochastic SI imputation models need all predictors, auxiliary variables and the outcome.",
"Omitting the outcome from MI causes substantial dilution of predictor effects, even under MCAR.",
"Conditional mean single imputation should use the predictors only.",
"Including more variables makes MAR more plausible; noise variables do little harm unless computation fails.",
"Check imputed against observed distributions."
],
"misreadings": [
"Misreading: including the outcome in the imputation model is circular. Correction: for MI it is required; leaving it out weakens the link between imputed predictors and the outcome.",
"Misreading: the outcome should always be in the imputation model. Correction: not for deterministic conditional mean imputation, where it would exaggerate effects.",
"Misreading: imputation models can assume linear relations by default. Correction: some software does, so non-linear terms may need to be added; searching transformations helps with non-linearity but is inefficient when relations are linear.",
"Misreading: only variables in the prediction model can be used. Correction: auxiliary variables outside the model can and often should be included."
],
"reteach": "One analyst wants to leave preterm birth out of the imputation model 'to avoid circularity'. But then the filled-in haemoglobin values are drawn with no link to preterm birth, so the women with imputed values dilute the real association, and the haemoglobin effect is pulled towards zero. The imputation model for booking haemoglobin should include all the model's predictors, helpful extras such as clinic and number of visits, and preterm birth itself.",
"where": "Steyerberg (2009), Chapter 7, section 7.4 (Defining the imputation model); Chapter 7, section 7.4.2 (Imputation models for SI)"
},
{
"title": "Practical guidance: missing indicators, limits, SI versus MI, missing outcomes and reporting",
"terms": [
"missing indicator method",
"redefining a characteristic as absent",
"maximum fraction missing",
"predictor of primary interest",
"single vs multiple imputation",
"missing outcome",
"last observation carried forward",
"reporting of missing values"
],
"core": "A 'missing' category for an incompletely recorded predictor ignores correlations between predictors and can severely bias coefficients, so it should generally not be used; where meaningful, a characteristic not recorded in the chart may instead be defined as absent. There is no fixed limit on the fraction missing, but effects of predictors with more than half their values missing will generally be distrusted, while missingness by design is less worrying. A predictor of primary interest, such as treatment in a trial, should not be imputed; impute the confounders so that crude and adjusted analyses use the same patients. For deriving predictions, performance measures and a score chart, a good stochastic single imputation is often sufficient, while multiple imputation is preferable with small data sets (fewer than about 100 events) and for honest standard errors. Patients with a missing outcome are generally excluded, and reporting should give missingness per predictor, the numbers of patients and events in each analysis, the methods used and a comparison with complete case results.",
"positions": [
"Generally avoid the missing indicator method.",
"Predictors with more than 50% missing will generally be distrusted; there is no universal cut-off.",
"Never impute the predictor of primary interest.",
"SI is often sufficient for predictions; MI is preferable with fewer than about 100 events.",
"If a predictor will not be available in practice, develop the model for the setting of use rather than imputing it.",
"With bootstrap validation, validate the modelling process within imputed data."
],
"misreadings": [
"Misreading: a missing category keeps everyone in the analysis without harm. Correction: it can badly bias the coefficients.",
"Misreading: missing outcomes should be imputed as the commonest category. Correction: assigning outcomes invents data; exclude and describe patients with a missing outcome.",
"Misreading: multiple imputation is always necessary. Correction: for point predictions a good single stochastic imputation is often adequate; MI matters most for small data and for inference on effects.",
"Misreading: any predictor can be imputed whatever its missingness. Correction: with very high missingness or when it will not be available in practice, consider omitting it or building a model for the setting where it is measured."
],
"reteach": "Suppose cervical length was recorded for only 35% of women because only one of three hospitals scans. Imputing it for the other two hospitals would rest entirely on patterns from the first, and midwives there would not have the value when using the model. It is better to leave it out of the main model, or build a separate model for the scanning hospital. Meanwhile, a 'haemoglobin missing' category or calling unknown outcomes 'term' would quietly distort the results, and the write-up should say exactly how many women and preterm births each analysis used.",
"where": "Steyerberg (2009), Chapter 7, section 7.7 (Guidance to missing values in prediction research); Chapter 7, section 7.6 (Imputation of missing outcomes)"
},
{
"title": "Case study: missing values in a pooled head-injury database (IMPACT)",
"terms": [
"IMPACT traumatic brain injury database",
"missingness by study (predictor not recorded)",
"untestable motor score as a category",
"imputation with outcome, 10 imputations",
"complete case loss in multivariable models",
"SI versus MI comparison"
],
"core": "The book's Chapter 8 applies the guidance to a database pooled from several trials and surveys in traumatic brain injury. Missingness arose mainly because some studies did not record a predictor, and within studies it was close to MCAR. A motor score that could not be tested because of sedation was kept as its own category, since being untestable relates to severity, which differs from a generic missing indicator. Imputation used all predictors and the outcome with ten imputations and checks of imputed distributions. Complete case analysis of a larger multivariable model lost a far greater share of patients than the share of missing values, whereas single and multiple imputation gave largely similar coefficients, with slightly larger standard errors for MI; complete case estimates were sometimes clearly different and less precise.",
"positions": [
"Missingness by design or by study (predictor not recorded) is less worrying than selective missingness.",
"A category may be justified when 'not testable' is itself clinically meaningful, unlike a generic missing indicator.",
"In this case study SI and MI gave similar estimates; MI standard errors were only slightly larger.",
"The aim of imputation is to estimate parameters valid for the population of use, not the missing values themselves.",
"Imputation keeps recorded information and increases power at the price of the MAR assumption."
],
"misreadings": [
"Misreading: the untestable motor category contradicts the advice against missing indicators. Correction: 'untestable' is a clinical state related to severity, not merely an unrecorded value.",
"Misreading: the purpose of imputation is to recover each patient's true value. Correction: it is to obtain valid estimates for the population.",
"Misreading: SI and MI always give very different answers. Correction: in this large database they were largely similar; complete case results differed more."
],
"reteach": "Imagine the district pooling booking data from several clinics, where one clinic never measured haemoglobin and another never recorded BMI. Most gaps then reflect which clinic a woman attended, not her own characteristics, so filling them in using clinic and the other predictors is reasonable. Only when 'not done' is itself a clinical state, as with the head-injury motor score that could not be tested because of sedation, does a separate category make sense; an ordinary unrecorded value does not get one. Dropping every woman with any gap from a model with many predictors could remove most of the cohort, which is what the head-injury example showed.",
"where": "Steyerberg (2009), Chapter 8, section 8.2 (Missing values in the IMPACT study); Chapter 8, section 8.3 (Imputation of missing predictor values); Chapter 8, section 8.4 (Estimating adjusted effects)"
}
],
"m06": [
{
"title": "Dummy coding and the reference category",
"terms": [
"dummy variable",
"indicator variable",
"factor variable",
"reference category",
"baseline category",
"k − 1 dummies",
"degrees of freedom (df)",
"combining (merging) categories"
],
"core": "Raw study variables usually need to be turned into numeric terms before they can enter a regression model; the book calls this coding. An unordered categorical predictor with k categories is normally entered as a factor, that is, as k − 1 dummy (0/1) variables, each comparing one category with a reference category whose coefficient is fixed at zero. Changing the reference changes the coefficients and their p-values but leaves every predicted risk unchanged. A small reference group makes each comparison imprecise, so a factor that predicts well overall can show unstable, non-significant dummy coefficients. Small categories can be combined, or kept and estimated with penalisation or shrinkage.",
"positions": [
"The choice of reference category matters for interpretation, not for predictions; prefer a reasonably large reference group rather than the software default (often the lowest or highest code).",
"Combine small categories on grounds of frequency or meaning while blind to the outcome; combining categories because their outcome rates look similar causes overfitting and optimistic apparent performance.",
"A balance is needed between combining blind to the outcome and capturing real outcome differences between categories; coding taken from earlier studies is often helpful in smaller data sets.",
"Refined codings with a small extra category can add information in very large data (GUSTO-I: a three-group infarct location with only 3% in the other group beat a two-group coding, model χ² 361 against 343 for 1 extra df), but smaller studies may need to merge such groups.",
"Coding decisions should precede predictor selection and should not be driven by the predictor-outcome relation in the development data."
],
"notation": "k categories → k − 1 dummy variables → k − 1 df. Coefficient of a dummy = log odds ratio of that category against the reference.",
"misreadings": [
"Misreading: changing the reference category changes each woman's predicted risk. Correction: Only the coefficients (and their p-values) change; predictions and the overall model χ² for the factor stay the same.",
"Misreading: non-significant dummy coefficients show the factor is unimportant. Correction: With a small reference group every comparison is imprecise even when the factor as a whole predicts well; judge the factor by its overall contribution, and pick a larger reference.",
"Misreading: merging categories with similar outcome rates is a neutral tidy-up. Correction: It uses the outcome in the same data and makes the model look better than it is; merge by size or meaning instead.",
"Misreading: dummy coefficients compare each category with the average woman. Correction: Each compares one category with the reference category.",
"Misreading: the outcome may never inform how categories are coded. Correction: The book's default is to combine categories blind to the outcome (for example by frequency) or to borrow earlier studies' coding, but it acknowledges a balance with adequately capturing real outcome differences between categories; the course's simpler rule is the safe default, not an absolute ban."
],
"reteach": "Think of the district hospital team writing place of booking as a set of yes/no columns: one for PHC, one for private clinic, one for tertiary hospital, with the sub-centre as the starting point. Each coefficient then says how the odds of preterm birth at that place compare with the sub-centre. If the team instead starts from the tertiary hospital, where only 20 women booked, every comparison is made against a tiny group and looks shaky, yet each woman still gets exactly the same predicted risk. So pick a big, common group as the starting point, and if a group is too small, merge it with a similar kind of service without peeking at its preterm rate.",
"where": "Steyerberg (2009), Chapter 9, section 9.1 (categorical predictors)"
},
{
"title": "Coding ordered categorical predictors",
"terms": [
"ordered (ordinal) predictor",
"linear coding of an ordinal predictor",
"scores",
"factor coding",
"square term as a check",
"monotone effect"
],
"core": "Ordered predictors are often reduced to a few groups or even a yes/no split, which ignores their ordering and can throw away much predictive information. A simple alternative is to treat the ordered levels as scores and enter one linear term, with a square term added as a check for a bend. In GUSTO-I, Killip class coded as a straight line (1 df) explained almost as much as three dummies (3 df), while a two-group shock coding explained far less. For a less clearly ordered variable such as smoking (never, past, current), a linear coding performed like the factor coding while using 1 df instead of 2.",
"positions": [
"Ignoring the ordering of an ordered predictor can cause a substantial loss of predictive information.",
"A linear coding of an ordinal predictor is a reasonable starting point, possibly checked with a square term.",
"Dichotomising an ordered predictor (for example Killip 3/4 against 1/2) loses much of the information that a linear term keeps (model χ² 861 against 1,388).",
"Methods that force a monotone but non-linear effect exist and are more flexible than a line, but are more advanced."
],
"notation": "Book example, GUSTO-I Killip class: shock dichotomy 1 df, χ² 861; linear 1 df, χ² 1,388; linear + square 2 df, χ² 1,388; factor 3 df, χ² 1,389.",
"misreadings": [
"Misreading: dummies are always better for an ordered predictor because they make no assumptions. Correction: They spend extra df, and a single linear term often captures nearly all the information.",
"Misreading: a straight-line coding assumes the predictor is truly continuous, so it is wrong for categories. Correction: The book shows linear scoring of ordered categories is often reasonable for prediction; check with a square term.",
"Misreading: splitting an ordered predictor into two groups is a safe simplification. Correction: It ignores the order and can lose a large share of the information."
],
"reteach": "The team records previous miscarriages as 0, 1, 2, or 3 or more. Instead of three separate yes/no columns, it can give each woman her count and let the model fit one slope, so each extra miscarriage shifts the log odds by the same amount. If that one-slope version explains almost as much as the three-column version, the extra columns are not worth their cost in degrees of freedom. A yes/no split into any versus none would treat a woman with one miscarriage like a woman with three, and lose much of the signal.",
"where": "Steyerberg (2009), Chapter 9, section 9.1 (categorical predictors)"
},
{
"title": "Dichotomising continuous predictors",
"terms": [
"dichotomisation",
"dichotomising",
"cut-point",
"categorisation",
"step function",
"optimal cut-point",
"model χ²",
"information loss"
],
"core": "Cutting a continuous predictor into two groups is common because it is easy to present, but for prediction the book calls it a bad idea. A dichotomy assumes a sudden jump in risk at the cut and equal risk for everyone within each group, so it matches a smooth relation at only a couple of points. It throws away information: in GUSTO-I, age split at 65 years explained much less than age as a straight line, and three age groups recovered only part of the loss. When the relation is U-shaped, any single cut misses one end. Searching the data for the cut that gives the smallest p-value adds optimism, and even several categories remain a step function with arbitrary borders.",
"positions": [
"Dichotomisation of a continuous predictor is a bad idea for prediction models.",
"Using more categories reduces the loss but still gives a step function; categories are mainly for exploring the data or illustrating effects, not for the final model.",
"Data-driven searches for an optimal cut-point cause optimism and exaggerated effects that will not replicate.",
"With a U-shaped relation (ST elevation in GUSTO-I) a dichotomy is the worst of the codings considered.",
"The meaning of a dichotomised effect depends on the range of the sample, so it transports poorly to other settings."
],
"notation": "Book example, GUSTO-I age: ≤65 vs >65, 1 df, χ² 1,463; three groups, 2 df, χ² 1,775; linear, 1 df, χ² 2,099 (dichotomy keeps about 70%, three groups about 85%).",
"misreadings": [
"Misreading: a clinically accepted threshold (for example age 35) makes dichotomising acceptable. Correction: A familiar cut still creates a false jump and lumps very different patients together; keep the predictor continuous in the model and use the threshold only for presentation if needed.",
"Misreading: choosing the cut with the smallest p-value gives the best coding. Correction: It fits chance features of the sample, exaggerates the effect, and another sample would pick a different cut.",
"Misreading: quartiles or tertiles avoid the problems of a single cut. Correction: They lose less information but are still step functions with sample-dependent borders; the book reserves them for illustration.",
"Misreading: if a dichotomy is significant it has captured the effect. Correction: Significance says nothing about how much information was lost compared with a continuous coding."
],
"reteach": "Picture the team's chart of preterm risk by maternal age: high in teenagers, lowest in the late twenties, high again after 35. Cutting at 35 tells a 34-year-old she has the same risk as a 20-year-old, and a 35-year-old that her risk tripled overnight on her birthday. It also lumps teenagers in with women of 30, so their high risk disappears. Keeping age as a number and letting the curve bend follows the real pattern and uses all the information the team collected.",
"where": "Steyerberg (2009), Chapter 9, section 9.2 (continuous predictors)"
},
{
"title": "Flexible functions: polynomials, fractional polynomials and restricted cubic splines",
"terms": [
"polynomial (square, cubic term)",
"transformation (log, square root, inverse)",
"fractional polynomial (FP1, FP2)",
"restricted cubic spline (RCS)",
"natural spline",
"knot",
"linear tails",
"generalised additive model (GAM) smoothing spline"
],
"core": "When a straight line is too rigid, a continuous predictor can enter through a few terms that together form a curve. Polynomials (adding a square or cube) are simple and can be tested in nested models, but their tails can behave erratically. Simple transformations such as the log can give robust one-term summaries. Fractional polynomials choose one or two powers from a fixed set, with power 0 meaning the log; an FP2 uses 4 df when the search over powers is counted. Restricted cubic splines join cubic pieces at knots and are forced to be linear beyond the outer knots, which keeps the tails calm; k knots use k − 1 df, and knot positions set by percentiles are not critical.",
"positions": [
"Linear coding is often reasonable as a start; polynomials are reasonable as checks for non-linearity.",
"Fractional polynomials and restricted cubic splines give flexible descriptions; RCS is more robust in the tails.",
"Three knots suit small data or weak prior expectation of non-linearity, four knots are intermediate, and five knots suit large data.",
"Fractional polynomials have limits: tail values can distort the shape, they are not invariant to a shift of origin, negative values need shifting, and confidence intervals are too narrow if the power search is ignored.",
"GAM smoothing splines are highly flexible and need a penalty to avoid overfitting."
],
"notation": "FP powers: −2, −1, −0.5, 0 (log), 0.5, 1, 2, 3; 8 FP1 and 36 FP2 functions; FP2 counted as 4 df. RCS: df = knots − 1 (3 knots 2 df, 4 knots 3 df, 5 knots 4 df).",
"misreadings": [
"Misreading: a restricted cubic spline is a single cubic curve over the whole range. Correction: It is made of cubic pieces joined at knots and is constrained to be straight beyond the outer knots.",
"Misreading: more knots are always better because they fit more shapes. Correction: Each knot costs a df paid for with events; extra knots in small data mostly fit noise.",
"Misreading: an FP2 uses only 2 df because it has two terms. Correction: Counting the search over powers, the book treats FP2 as using 4 df.",
"Misreading: a quadratic and a 3-knot spline are the same thing. Correction: Both use 2 df, but a 2-df RCS covers more shapes than X + X² and has calmer tails."
],
"reteach": "Imagine the team bending a flexible ruler along the plotted preterm risks for haemoglobin. A square term lets the ruler curve once, but its ends can flick up or down wildly where few women sit. A restricted cubic spline pins the ruler at a few points (knots) along the haemoglobin scale and keeps it straight beyond the outermost pins, so the ends stay sensible. Each extra pin lets the curve bend more, but each one is paid for with preterm births, so a small clinic should use few pins.",
"where": "Steyerberg (2009), Chapter 9, section 9.3 (flexible functions for continuous predictors)"
},
{
"title": "Comparing codings and allocating flexibility in advance",
"terms": [
"model χ² minus 2 × df",
"Akaike information criterion (AIC)",
"nested and non-nested codings",
"allocating degrees of freedom",
"partial R²",
"testimation bias",
"extrapolation"
],
"core": "Every extra term adds about 1 to the model χ² by chance, so codings that use more df always look a little better. The book compares codings, including non-nested ones such as splines with different numbers of knots, by model χ² minus twice the df, which is the AIC on the χ² scale. For ST elevation in GUSTO-I the five-knot spline won on this criterion even after paying for its extra df. A middle course is to find a simple transformation that captures most of the non-linearity and then check it with spline terms. The amount of flexibility per predictor should be fixed in advance, for example from univariable findings or by giving each continuous predictor a set budget, rather than chosen by repeated significance testing, and the total must fit what the number of events can support.",
"positions": [
"Compare codings on model χ² − 2 × df rather than on χ² alone.",
"Splines with different knot numbers are not nested, so stepwise testing from 5 knots down to 3 is not strictly correct.",
"Harrell's approach fixes df per predictor in advance and keeps them regardless of significance; an alternative gives each continuous predictor a generous budget and reduces it by partial R²; both avoid testing-then-estimating bias.",
"A restricted form may lower apparent fit slightly but limits optimism.",
"Splines extrapolate linearly beyond the data, whereas polynomials can curve implausibly in the tails (the cubic for ST elevation curved down at 10 leads).",
"Empirical comparisons of FP and RCS are lacking; they differ mainly in the tails."
],
"notation": "Score = model χ² − 2 × df (higher is better). GUSTO-I ST elevation: dichotomy 259 − 2 = 257; linear 281 − 2 = 279; quadratic 306 − 4 = 302; cubic 339 − 6 = 333; 5-knot RCS 350 − 8 = 342.",
"misreadings": [
"Misreading: the coding with the highest model χ² is the best. Correction: More df always raise χ² somewhat by chance; subtract 2 × df before comparing.",
"Misreading: flexibility should be added wherever a test for non-linearity is significant. Correction: The book prefers fixing the df per predictor in advance; testing and then estimating adds bias and optimism.",
"Misreading: the affordable df depend on the number of patients. Correction: For a binary outcome they depend on the number of events (the smaller outcome group).",
"Misreading: a spline that fits the middle well can be trusted at the extremes. Correction: The tails are where data are sparse; RCS keeps them linear, polynomials may swing implausibly."
],
"reteach": "When the team tries several codings for maternal age, each one is like a player asking for a bigger budget. The model χ² is what each player delivers, and every extra term costs 2 points of rent. A straight line delivers almost nothing for age because risk is U-shaped, the quadratic delivers a lot for little rent, and extra spline knots add a bit more fit but not enough to cover their rent. The team should set each predictor's budget before fitting, and keep the total within what its 234 preterm births can pay for.",
"where": "Steyerberg (2009), Chapter 9, sections 9.3.4 to 9.3.5 and 9.6 (how much flexibility; allocating df)"
},
{
"title": "Outliers and truncation",
"terms": [
"outlier",
"extreme value",
"Tukey's rule (3 × IQR)",
"interquartile range (IQR)",
"biological plausibility",
"set to missing",
"truncation",
"winsorising",
"influential value"
],
"core": "An outlier is a value far outside the usual range; one rule, attributed to Tukey, flags values at least three interquartile ranges beyond the lower or upper quartile, and in practice any value with a large influence on the coefficients is a concern. The book's sequence is first to check the value against the source record, then to judge with clinical experts whether it is biologically possible in that setting. Values judged impossible are treated as errors and set to missing, to be handled by missing-data methods, rather than deleting the patient. Plausible but extreme values are truncated: values beyond a chosen limit are moved to that limit, with limits set from the distribution so that roughly 0.5% to 1% of values are shifted at each end. In the book's traumatic brain injury example, truncating glucose made its relation with outcome slightly more linear.",
"positions": [
"Verify extreme values against the source data before any statistical fix.",
"Plausibility depends on context: a very high systolic pressure may be possible in acute brain injury but not in an outpatient clinic.",
"Implausible values should be set to missing (and imputed), not used to drop the whole patient.",
"Truncate plausible extremes using limits chosen from the predictor's distribution, not from the outcome, moving about 0.5% to 1% at each end."
],
"notation": "Lower fence = Q1 − 3 × IQR; upper fence = Q3 + 3 × IQR. Truncation: if X > Xmax then X = Xmax; if X < Xmin then X = Xmin.",
"misreadings": [
"Misreading: outliers should be deleted because they distort regression. Correction: Deleting the patient wastes her other data; check, then set impossible values to missing, then truncate plausible extremes.",
"Misreading: truncation should come first. Correction: Truncating before checking can hide a typing error that could have been corrected.",
"Misreading: truncation limits should be chosen where the outcome relation changes. Correction: Choose them from the distribution of the predictor, blind to the outcome.",
"Misreading: any value beyond the Tukey fence is an error. Correction: The fence only flags values for checking; some flagged values are real and plausible."
],
"reteach": "The team's range check flags a booking haemoglobin of 19.5 g/dL, another of 4.3 and one of 0.0. First someone pulls the register: perhaps 19.5 was meant to be 9.5. Then a clinician asks whether each value could be real: 0.0 cannot, so it becomes missing; 4.3 could be real severe anaemia, so the woman stays in but her value is pulled in to a sensible limit chosen from the spread of haemoglobin values. No woman is thrown out of the data.",
"where": "Steyerberg (2009), Chapter 9, section 9.4 (outliers and truncation)"
},
{
"title": "Interpretable scales for continuous predictors",
"terms": [
"rescaling",
"odds ratio per k units",
"per standard deviation (standardised)",
"per interquartile range",
"75th versus 25th percentile",
"graph of predicted risk"
],
"core": "Binary predictors have no scaling problem, but a coefficient for a continuous predictor refers to a one-unit step, which may be clinically trivial. Effects can be rescaled to a meaningful step k by multiplying the coefficient by k before exponentiating; in GUSTO-I the age coefficient of 0.084 per year gave an odds ratio of about 1.09 per year and about 2.3 per decade. Another option is to report the effect per standard deviation, or to compare the 75th with the 25th percentile, which for a linear term equals expressing the effect per interquartile range. These standardisations do not apply directly to categorical, polynomial or other non-linear codings; for those, compare predictions at the two percentiles or show a graph. Rescaling changes the unit of reporting, not the predictions or p-values.",
"positions": [
"Report effects per a clinically useful step rather than per one small unit.",
"Comparing the 75th with the 25th percentile is a useful common scale for comparing predictors.",
"For non-linear codings, use predictions at chosen percentiles or a graph of risk against the predictor.",
"Dummies for values below the 25th and above the 75th percentile can illustrate a curve but lose information and should not be used for prediction (brain-injury blood pressure: R² about half that of the continuous coding)."
],
"notation": "OR for k units = exp(k × β) = (OR per unit)^k. GUSTO-I age: β = 0.084 per year, OR 1.088; per 10 years exp(0.84) = 2.32.",
"misreadings": [
"Misreading: the OR for 2 units is twice the OR for 1 unit. Correction: Odds ratios multiply across steps, so it is the square of the per-unit OR (exp(2β)).",
"Misreading: rescaling to per-decade changes the model's predictions or significance. Correction: Only the unit of the reported coefficient changes.",
"Misreading: an OR per IQR can be computed for any coding. Correction: For splines, polynomials or categories, compare predicted risks at the 75th and 25th percentiles instead.",
"Misreading: an odds ratio close to 1 per gram means birth weight is unimportant. Correction: The unit is tiny; rescale to a meaningful step such as 500 g."
],
"reteach": "Suppose the team's model says each 1 g/dL of haemoglobin multiplies the odds of preterm birth by about 0.81. Clinicians rarely think in single grams per decilitre, so the team can report the effect per 2 g/dL by squaring that number, giving about 0.66. Nothing about any woman's predicted risk changes; only the ruler used to describe the effect is longer. For age, which is curved, the team would instead show a graph of predicted risk by age.",
"where": "Steyerberg (2009), Chapter 9, section 9.5 (interpretable scales)"
}
],
"m07": [
{
"title": "Restricting candidate predictors without using the outcome",
"terms": [
"candidate predictor",
"included predictor",
"effective sample size",
"events per variable (EPV)",
"restriction blind to the outcome",
"full model",
"overfitting"
],
"core": "A candidate predictor is any variable or term considered for the model, while an included predictor is one that ends up in the final model; there are usually far more candidates than the data can support. For a binary outcome the effective sample size is the smaller outcome group, usually the number of events, so the candidate list should be matched to the events, with stronger restriction in small samples. Some ways of shortening the list use the predictor-outcome relation in the data, such as univariable screening and stepwise selection, and these add bias and optimism. Others ignore that relation: subject knowledge, the literature, missingness, distributions, combining related variables and averaging effects over subgroups. These outcome-blind strategies do not add overfitting, and their aim is a limited list that can all enter one full model.",
"positions": [
"Match the number of candidate predictors to the effective sample size, restricting more in small samples.",
"Strategies that do not look at the predictor-outcome relation in the development data are free of overfitting and should be used first.",
"Univariable screening and stepwise selection reduce the list at the price of bias and optimism (dealt with in the next chapter).",
"Every restriction carries the risk of excluding a predictor, or a specific effect, that mattered, so subject knowledge must guide it."
],
"notation": "EPV = events ÷ candidate df (count every term, including extra spline terms and dummy variables).",
"misreadings": [
"Misreading: candidate predictors are only the variables that end up in the model. Correction: Candidates are everything considered, and overfitting depends on how many were considered, not only on how many were kept.",
"Misreading: the effective sample size is the number of patients. Correction: For a binary outcome it is the smaller outcome group, usually the events.",
"Misreading: any way of shortening the list is equally safe. Correction: Outcome-blind methods add no optimism, but screening and stepwise selection use the outcome and do.",
"Misreading: outcome-blind restriction is risk-free. Correction: It may drop a predictor or effect that truly mattered."
],
"reteach": "The hospital team begins with 30 candidate terms but only 234 preterm births, fewer than 8 births to inform each term. It can shorten the list in two kinds of way. It can ask clinicians, read the literature and look at how complete and varied each item is, none of which looks at who delivered early. Or it can test which items are linked to preterm birth in its own data, which quietly tunes the model to chance patterns in these 2,000 women. The first kind is the safe place to start.",
"where": "Steyerberg (2009), Chapter 10 (background) and section 10.5 (concluding remarks)"
},
{
"title": "Subject knowledge and the literature",
"terms": [
"subject knowledge",
"expert opinion",
"literature review",
"meta-analysis",
"publication bias",
"suppression",
"univariable effects",
"prior estimates"
],
"core": "The book regards building a prediction model without subject knowledge, and without a very large sample, as close to impossible. A literature review and the views of clinicians usually give a list of about 5 to 20 candidates, which is often reasonable. Reviews of published univariable effects help but have limits: negatively correlated predictors may show no univariable effect (suppression), though medical predictors are mostly positively correlated; simply counting how often a predictor was found important is cruder than a formal pooled estimate; and publication bias makes published effects too extreme. In a book example of children with fever without a source, a model built from 57 candidates for 58 events with screening and stepwise selection validated poorly, largely because there were too many candidates for the events.",
"positions": [
"About 5 to 20 candidate predictors chosen with subject knowledge is often a reasonable list.",
"Literature reviews can supply the core predictors, with fine-tuning (transformations, choice among related measures) left to the data (testicular cancer example).",
"Publication bias makes pooled published effects too large, because non-significant effects are less often reported.",
"Counting how often a predictor was important identifies key predictors, but a formal meta-analysis is needed for pooled estimates usable as prior information."
],
"misreadings": [
"Misreading: a predictor with no univariable effect in published studies is useless. Correction: Suppression by a negatively correlated predictor can hide an effect, although this is uncommon for medical predictors.",
"Misreading: published effect sizes can be taken at face value. Correction: Publication bias tends to make them too extreme.",
"Misreading: collecting more candidates is always safer because nothing is missed. Correction: Too many candidates for the events (57 for 58 in the book's fever example) leads to poor performance in new patients.",
"Misreading: vote-counting how many studies found a predictor significant gives a pooled effect. Correction: It helps pick key predictors, but a pooled estimate needs formal meta-analysis."
],
"reteach": "Before touching the data, the team sits with senior obstetricians and reads the published preterm studies. Together they agree which items have a plausible link with early birth and drop those that do not, such as items included only because the register happens to hold them. When they borrow effect sizes from papers, they remember that strong results get published more readily, so published effects tend to be too large. A short, sensible list built this way protects the model before any fitting begins.",
"where": "Steyerberg (2009), Chapter 10, sections 10.1 to 10.1.4 (subject knowledge and the literature)"
},
{
"title": "Missing values, narrow distributions and rare but strong predictors",
"terms": [
"missingness",
"complete-case analysis",
"imputation",
"narrow distribution",
"low variability",
"infrequent (rare) predictor",
"strong predictor",
"interaction with a subgroup"
],
"core": "Without relating any predictor to the outcome, the analyst can look at how often each candidate is missing and how it is distributed. A candidate with many missing values can be dropped, especially if it is an important predictor, so that readers would doubt imputed values, or if it will often be missing when the model is used in practice. A candidate with a narrow distribution, almost the same in everyone, carries little information and can be dropped if it is not expected to matter; a stroke study dropped 6 of 49 candidates on this ground. A rare predictor with a strong known effect is the hard case: in GUSTO-I shock occurred in about 2% of patients but had a univariable odds ratio of about 11. The book lists three options and prefers to include such a predictor by default.",
"positions": [
"Exclude candidates with many missing values, especially important ones or ones that will often be unavailable in practice.",
"Exclude candidates with narrow distributions if they are not expected to be important.",
"Include an infrequent but strong predictor by default.",
"Omitting it and warning users is what in effect happens to every variable not in a model.",
"Excluding patients with the rare characteristic is defensible when the other predictors are thought to work differently in them (an interaction)."
],
"notation": "If each of k predictors is independently missing in a fraction m of patients, the share with complete data is (1 − m)^k; for example 0.95^10 ≈ 0.60.",
"misreadings": [
"Misreading: any predictor with missing values should be dropped. Correction: Important predictors that will be available in practice should be kept and their missing values imputed; dropping is for those mostly missing or often missing in practice.",
"Misreading: a rare predictor cannot be estimated, so it must be left out. Correction: The book's default is to include a rare predictor with a strong, known effect, accepting a wide confidence interval.",
"Misreading: leaving a rare predictor out is a neutral choice. Correction: The model then silently gives those patients the risk of patients without it, which should be stated openly.",
"Misreading: looking at missingness and distributions is a form of data dredging. Correction: These checks do not use the outcome and so add no optimism."
],
"reteach": "Cervical length was measured in only about one woman in eight in the team's register, mostly in those already sent with symptoms, and it will usually be missing at a routine booking visit, so it goes. Rhesus-negative status is almost the same in every woman and is not expected to matter, so it goes too. Eclampsia in a previous pregnancy is rare, but published studies show a strong link with preterm birth, so the team keeps it, accepting that its coefficient rests on few women. None of these choices looked at who actually delivered early.",
"where": "Steyerberg (2009), Chapter 10, section 10.1.5 (missing values and distribution of predictors)"
},
{
"title": "Summary scores and testing equal weights",
"terms": [
"summary score",
"sum score",
"any-of indicator",
"count (unweighted sum)",
"weighted sum (index)",
"Charlson comorbidity index",
"equal weights",
"deviation from the common effect",
"overall test"
],
"core": "Related variables that reflect one underlying concept can be combined into a single summary score, replacing several df with one. Common forms are an any-of indicator, an unweighted count of conditions present (which can be capped, for example at three or more, and entered as a straight line), and a weighted index such as the Charlson comorbidity index, whose weights come from other populations and need justification in a new setting. In smaller data a simple sum is robust; only very large data sets (of the order of 100,000 records) can afford a separate coefficient for each condition. The equal-weights assumption of a count can be checked by adding each component to a model that already has the count: its coefficient estimates its deviation from the common effect, and all but one component can be added together for an overall test. In the book's oesophagectomy example the overall test was not significant and the equal-weights count was kept.",
"positions": [
"Groupings into scores should follow subject knowledge or statistical clustering of the predictors, not their outcome relations.",
"A simple unweighted sum is robust in modest data sets.",
"Weighted indices developed elsewhere need subject-matter support before use in a new population.",
"A non-significant equal-weights test is no proof of equal weights, because the test has little power, especially for rare components."
],
"notation": "Odds ratio for n conditions against none = exp(n × β_count). Equal-weights test: add components (all but one) to the model with the count; χ² on that many df. Book example (oesophagectomy, 2,041 patients, 221 deaths): count β = 0.44; overall test χ² 3.6 on 4 df, p = 0.46.",
"misreadings": [
"Misreading: a count assumes nothing. Correction: It assumes every component shifts the log odds by the same amount; this can and should be checked.",
"Misreading: if the equal-weights test is not significant, the weights are proven equal. Correction: The test has limited power; the count is kept because there is no evidence it harms prediction.",
"Misreading: the test can add all five components to the count at once. Correction: One component is determined by the count and the others, so all but one are added.",
"Misreading: equal weights are arbitrary, so a score should not be used. Correction: The book regards a simple count as robust and often preferable to estimating every weight in modest data."
],
"reteach": "The team has five medical conditions on its list, some rare, such as kidney disease. Rather than five separate terms, it counts how many each woman has, so a woman with two conditions is assumed to carry twice the log-odds push of a woman with one. To check that assumption, the team adds each condition on top of the count and sees whether any stands out as pulling more or less than its share. If none clearly does, the count stays, while remembering that a rare condition gives the check little power.",
"where": "Steyerberg (2009), Chapter 10, sections 10.2 to 10.2.2 (summary scores and testing equal weights)"
},
{
"title": "Logical weights and principal components",
"terms": [
"logical weights",
"weights from external knowledge",
"genetic distance",
"family-history score",
"principal component analysis (PCA)",
"data reduction blind to the outcome"
],
"core": "Weights for a score can be fixed from known relations rather than estimated from the data. In the book's example for predicting mismatch-repair gene mutations (Lynch syndrome), relatives were weighted by genetic distance: first-degree relatives count fully, second-degree relatives half and third-degree relatives a quarter. The resulting family-history score uses a single coefficient. Such a score assumes broadly similar numbers and ages of relatives at risk in each degree. Principal component analysis, suggested by Harrell, rolls all candidates into a few components without using the outcome; evaluations look promising, but components are hard to interpret, every original predictor must still be measured, and few prediction studies use it.",
"positions": [
"Weights derived from logic or biology avoid spending df and avoid fitting chance in the outcome.",
"Only the single coefficient of a logically weighted score is estimated from the data.",
"A family-history score assumes similar numbers and ages of first- and second-degree relatives at risk.",
"Principal components summarise predictors without the outcome, but are hard to interpret and require all predictors to be known."
],
"notation": "Family-history score = (first-degree relatives affected) + 0.5 × (second-degree relatives affected) [+ 0.25 × third-degree].",
"misreadings": [
"Misreading: the 0.5 weight for second-degree relatives is estimated from the data. Correction: It is fixed in advance from genetic distance; only the overall score coefficient is estimated.",
"Misreading: a family-history score counts every affected relative equally. Correction: Relatives are weighted by closeness of relationship.",
"Misreading: principal components reduce the number of measurements needed. Correction: Every original predictor must still be measured to compute the components.",
"Misreading: because PCA ignores the outcome, its components are easy to interpret clinically. Correction: Interpretability is one of its main drawbacks."
],
"reteach": "The team wants to use family history of preterm birth without spending a degree of freedom on every type of relative. A mother or sister shares about twice as many genes with the woman as a grandmother or aunt, so the team counts each mother or sister as 1 and each grandmother or aunt as 0.5, and adds them up. A woman whose mother and two aunts had preterm births scores 2, the same as a woman with one sister and two aunts. The model then estimates just one coefficient for the whole score.",
"where": "Steyerberg (2009), Chapter 10, sections 10.2.3 to 10.3 (logical weighting and principal components)"
},
{
"title": "Averaging effects over subgroups: one model or separate models",
"terms": [
"main effect",
"average effect over subgroups",
"interaction",
"separate models",
"stratified models",
"combined model with a subgroup main effect",
"power to detect interaction"
],
"core": "A main effect is an average of the effects in subgroups, and using it adds robustness because every patient contributes to the estimate. Fitting separate models for two groups is equivalent to assuming that every predictor interacts with group, and each model then has fewer events. The usual alternative is one combined model with a main effect for the group, which handles a different baseline risk, plus tests of a few interactions chosen for clinical reasons. In the book's Chlamydia trachomatis example, separate models for men and women amounted to assuming sex interactions with every predictor, and a combined model found only urogenital symptoms differed by sex. Including extra patients helps if the bias from differing effects is smaller than the gain in precision, but limited samples have little power to detect interactions, so subject knowledge must decide.",
"positions": [
"Averaging effects over subgroups gives more stable estimates when there is no strong interaction.",
"Separate models assume all effects differ between subgroups and halve the information available for each.",
"Start with one model containing a main effect for the subgroup, and test only a few planned interactions.",
"A non-significant interaction test in a limited sample does not prove that effects are equal.",
"Book example: in elective heart-valve replacement, acute-surgery patients were included with a main effect, and no individual or overall interaction was found."
],
"notation": "Separate models for 2 groups ≡ one model with group × predictor terms for every predictor.",
"misreadings": [
"Misreading: separate models are assumption-free. Correction: They assume every predictor works differently in each group, and each model has fewer events.",
"Misreading: a different baseline risk requires a separate model. Correction: A main effect for the group handles a different baseline risk in a combined model.",
"Misreading: no significant interaction proves the subgroups can be pooled. Correction: Power is low in limited samples, so subject knowledge must also guide the choice.",
"Misreading: a main effect describes the effect in each subgroup. Correction: It is an average over subgroups and may differ from either if a real interaction exists."
],
"reteach": "The team's obstetrician says first pregnancies are a different problem and wants two models. Splitting the 234 preterm births into two groups leaves each model with roughly half the events, and assumes that every predictor, from haemoglobin to tobacco, works differently in first and later pregnancies. One combined model with a yes/no term for first pregnancy lets the baseline risk differ while every woman helps estimate the other effects. The team can still test one or two interactions that clinicians think are likely, but a non-significant test should not be read as proof that the effects are equal.",
"where": "Steyerberg (2009), Chapter 10, sections 10.2.3 to 10.3 (averaging effects over subgroups)"
},
{
"title": "Case study: reducing df in the Lynch syndrome mutation model",
"terms": [
"mismatch-repair mutation",
"Lynch syndrome",
"proband",
"common age effect",
"family-history score (CRCfam)",
"df reduction",
"R²",
"c statistic",
"external validation"
],
"core": "The book illustrates the chapter with a model for mismatch-repair mutations in 898 tested patients with 130 carriers, using cancers in the proband and in first- and second-degree relatives. Instead of separate age effects for each cancer type and dummies for each family pattern, the authors used one common linear age effect where slopes looked similar and a logically weighted family-history score. This cut one part of the model from 11 to 5 df with only a small fall in apparent R² and c. Age at diagnosis was kept continuous, since a cut at age 50 performed worse. The final 10-df model performed nearly as well in 1,016 new patients as at development.",
"positions": [
"Forcing similar effects to be equal (a common age slope) saves df with little loss of information.",
"Logically weighted family scores can replace many dummies.",
"Continuous age coding beat a dichotomy at 50 years.",
"Careful df reduction guided by subject knowledge can yield a model that holds up in external validation (c about 0.81 at development and 0.80 in new patients)."
],
"notation": "Book Table 10.4: four age effects plus family dummies, 11 df, R² 19.4%, c 0.767; one age effect plus CRCfam score, 5 df, R² 18.3%, c 0.757.",
"misreadings": [
"Misreading: reducing df always costs a lot of performance. Correction: In the Lynch example 6 df were saved for a small drop in R² (19.4% to 18.3%).",
"Misreading: the df reduction was chosen by significance testing. Correction: It rested mainly on subject knowledge and on similar slopes, combined with logical weights.",
"Misreading: good development performance is enough evidence. Correction: The book's case study was checked in a separate set of new patients."
],
"reteach": "The Lynch syndrome example in the book is like the team's family-history problem on a larger scale. Rather than give every cancer type its own age slope and every family pattern its own column, the authors used one shared age slope and one weighted family score. The model lost very little of its fit while using far fewer degrees of freedom, and then performed almost as well in a new group of patients. The team can follow the same logic for its medical conditions and family history items.",
"where": "Steyerberg (2009), Chapter 10, section 10.4 (case study: mutation prediction)"
}
],
"m08": [
{
"title": "Full model versus model reduction: valid and false reasons",
"terms": [
"full model",
"pre-specified model",
"model reduction",
"predictor selection",
"practicality",
"parsimony",
"estimation versus hypothesis testing"
],
"core": "Specifying the model is the hardest part of prediction modelling, and in small data the question of which predictors are important has no reliable answer. If the candidate list has been limited beforehand with subject knowledge, all candidates can enter one full model and modelling becomes an estimation problem rather than a testing problem. The book accepts some reasons for reducing a model: a predictor may be impractical (costly or unavailable when the model is used), its effect may be very small or biologically implausible, or the study may be exploratory discovery work in a large marker panel. It rejects non-significance, collinearity and parsimony as general reasons for dropping predictors. A reduced model asks the data two questions (which predictors, and their coefficients given the selection), which is more complex, not simpler.",
"positions": [
"Practicality and very small or implausible effects are valid reasons to drop a predictor.",
"Non-significance is not a valid reason: prediction is about estimation, and a p-value above 0.05 is not evidence of no effect, especially with subject knowledge supporting the predictor.",
"Parsimony is a false argument when the smaller model was found by searching the data; it may hold when comparing models specified in advance.",
"Simulations show that keeping true noise variables in a model causes only a limited loss of predictive ability.",
"A rare but strong predictor (shock in GUSTO-I) may be non-significant in a small sample yet clearly important."
],
"misreadings": [
"Misreading: non-significant predictors should be removed to avoid overfitting. Correction: Removing them by testing adds selection bias; a weak predictor kept in a pre-specified model costs little.",
"Misreading: a smaller model is always simpler and therefore better. Correction: A data-selected smaller model involves an extra, hidden question and biased coefficients.",
"Misreading: the full model means every variable in the database. Correction: It means all candidates on a short list chosen in advance with subject knowledge.",
"Misreading: discovery work and prediction modelling are the same. Correction: Finding predictive markers in a large panel is exploratory; the book treats it as a separate aim."
],
"reteach": "At the team meeting, one person wants to drop height because its p-value is 0.31, another wants to drop cervical length because most clinics have no scanner. Only the second argument is sound: a predictor nobody can measure at booking is useless in practice. A high p-value in 2,000 women does not show that height has no effect, and dropping it means the team has asked two questions of the data instead of one. If the shortlist was chosen carefully beforehand, the team simply fits all of it and estimates the coefficients.",
"where": "Steyerberg (2009), Chapter 11, section 11.1 (reasons to reduce a model)"
},
{
"title": "Collinearity and the variance inflation factor",
"terms": [
"collinearity",
"multicollinearity",
"correlated predictors",
"variance inflation factor (VIF)",
"combining correlated predictors",
"mean arterial pressure"
],
"core": "Collinearity means that predictors are strongly correlated, which makes their separate coefficients imprecise. The book stresses that correlation between predictors is the very reason multivariable models are used, and that unstable coefficients do not prevent reliable predictions. Most correlations among medical predictors are modest; in GUSTO-I the strongest was between height and weight at about 0.5, and age with its square correlate above 0.9 yet both coefficients are estimated reliably. As a rough warning, correlations above about 0.8 or a VIF above 10 deserve attention. When two measures capture almost the same thing, combining them (for example a mean of diastolic and systolic pressure) can be better than choosing one, though subject knowledge about which matters more also counts.",
"positions": [
"Collinearity is a false reason for model reduction: coefficients may be unstable but predictions need not be.",
"A correlation above about 0.8 or a VIF above 10 is a rough warning sign.",
"Combining highly correlated measures into one summary can beat choosing one of them.",
"Choices between nearly redundant measures should rest on subject knowledge and practicality, not on which is significant."
],
"notation": "VIF for two predictors with correlation r: VIF = 1 ÷ (1 − r²); r = 0.5 gives 1.33. Mean arterial pressure ≈ (2 × DBP + SBP) ÷ 3.",
"misreadings": [
"Misreading: correlated predictors make the model's predictions unreliable. Correction: They make the individual coefficients imprecise, while the combined prediction can remain stable.",
"Misreading: any correlation means one predictor must go. Correction: Modest correlations (around 0.5, VIF about 1.3) are no reason to drop anything.",
"Misreading: pick whichever of two correlated predictors is more significant. Correction: That is a data-driven choice; choose or combine on subject or practical grounds before looking at the outcome.",
"Misreading: collinearity and interaction are the same thing. Correction: Collinearity is correlation between predictors; interaction is a change in one predictor's effect depending on another."
],
"reteach": "In the team's booking data, height and weight go up together, as do systolic and diastolic blood pressure, while haemoglobin and haematocrit from the same blood sample are almost duplicates. Correlation like that makes it hard for the model to say how much credit each partner deserves, so their separate coefficients wobble. But the combined prediction for each woman can still be steady. Only the near-duplicates need action: the team keeps haemoglobin because it is cheap and routine, or combines the two blood pressure readings into one measure.",
"where": "Steyerberg (2009), Chapter 11, section 11.1 (collinearity)"
},
{
"title": "Stepwise selection and stopping rules (AIC, BIC)",
"terms": [
"stepwise selection",
"forward selection",
"backward elimination",
"all possible subsets",
"stopping rule",
"Akaike information criterion (AIC)",
"Bayesian information criterion (BIC)",
"likelihood ratio, Wald and score tests"
],
"core": "Stepwise methods build a model by testing: forward selection adds the most significant candidate at each step, backward elimination starts from the full model and removes the least significant one, and combined methods switch between the two. All possible subsets regression examines every combination, 2 to the power k models for k candidates, and can find combinations the others miss but tests very many models. The book prefers backward elimination if stepwise selection is used, because the analyst sees the full model and correlated predictors are judged together. The stopping rule matters more than the direction. AIC keeps a term if it adds more than twice its df to the model χ², equivalent to p < 0.157 for 1 df, while BIC requires more than ln(n) per df and so becomes stricter as the sample grows, risking underfitting in small samples.",
"positions": [
"Backward elimination is preferred over forward selection.",
"The 0.05 level has no special status; AIC, or even p < 0.20 or 0.50, gave more power for weak predictors and better predictions in small data with an established candidate set.",
"BIC gives smaller models and may underfit in small samples; in survival data the effective sample size (number of events) is used for n.",
"Stepwise methods are easy and relatively objective, so the whole strategy can be replayed in bootstrap samples.",
"With multiple imputation, base each selection step on pooled results from all imputed datasets."
],
"notation": "AIC: keep if Δχ² > 2 × df (p = 0.157, 0.135, 0.112 for 1, 2, 3 df). BIC: keep if Δχ² > df × ln(n) (1 df: n = 200 → 5.3, p = 0.021; n = 2,000 → 7.6, p = 0.006). All subsets: 2^k models.",
"misreadings": [
"Misreading: the direction (forward or backward) is the main choice. Correction: The stopping rule (p-level, AIC, BIC) has a far larger effect on what is kept.",
"Misreading: AIC is the same as testing at p < 0.05. Correction: For 1 df it corresponds to p < 0.157, a more liberal rule.",
"Misreading: BIC is always the safer choice. Correction: It becomes very strict in large n and can drop true but modest predictors, and may underfit small data.",
"Misreading: all possible subsets is the most thorough and therefore the best. Correction: Examining so many models makes overfitting easier."
],
"reteach": "Imagine the team's statistician running a model-building machine on its 12 booking-visit candidates. In backward mode the machine starts with all 12 and keeps throwing out the weakest until everything left passes a bar. The height of that bar is what really matters: at the AIC bar a term needs to add only 2 to the χ², at p < 0.05 it needs 3.84, and at the BIC bar for 2,000 women it needs about 7.6. A true but modest predictor like a short inter-pregnancy interval can survive the low bar and be thrown out by the high ones.",
"where": "Steyerberg (2009), Chapter 11, sections 11.2 to 11.3 (stepwise selection and stopping rules)"
},
{
"title": "Instability of selection",
"terms": [
"instability",
"model uncertainty",
"selection frequency",
"bootstrap inclusion frequency",
"independent predictors",
"order of entry"
],
"core": "Many sets of predictors fit almost equally well, so a slightly different sample gives a different final model. In GUSTO-I, backward selection at p < 0.05 in one small subsample of 429 patients kept three predictors, and exactly that set reappeared in only 7 of 110 other small subsamples. Stricter rules and smaller samples keep fewer predictors on average, and even large regional samples did not always keep all eight predictors. Statements such as 'the only independent predictors were A, B and C', and even more so interpretations of the order of entry or the ranking of p-values, overinterpret chance. Bootstrap selection frequencies show the instability in any dataset, and instability depends on the ratio of candidates to events.",
"positions": [
"Statements about which predictors are 'independent' after stepwise selection overinterpret an unstable process.",
"Interpreting the order of entry or the ranking of p-values is even worse.",
"An EPV of 10 is a lower bound for a pre-specified model; reliable selection needs an EPV of about 50 (for example 400 events for 8 candidates).",
"Repeating the selection in bootstrap samples and reporting selection frequencies reveals the instability.",
"The full GUSTO-I data, with thousands of events, are an exceptional case in which selection can be reliable."
],
"notation": "EPV = events ÷ candidate df; reliable selection needs EPV ≈ 50.",
"misreadings": [
"Misreading: the predictor that entered first is the strongest independent predictor. Correction: The order of entry reflects chance features of this sample and is not reproducible.",
"Misreading: a final stepwise model would be found again in a new sample from the same population. Correction: In GUSTO-I the same three-predictor set reappeared in only 7 of 110 subsamples.",
"Misreading: an EPV of 10 is enough for data-driven selection. Correction: 10 is a minimum for a pre-specified model; selection needs about 50.",
"Misreading: predictors selected in more than half of bootstrap samples are confirmed. Correction: Bootstrap selection frequencies show instability; using them as a selection rule has not been convincingly shown to help."
],
"reteach": "The team runs backward elimination in its development data and gets five predictors; a colleague runs it in another sample from the same clinics and gets a different five. Neither list is the truth: with a limited number of preterm births, several combinations of predictors fit almost equally well, and chance decides which one wins. Resampling the team's own data many times and repeating the selection shows how often each predictor is picked, and the exact final model turns out to be rare. That is why the team should not claim that its five predictors are the only independent ones.",
"where": "Steyerberg (2009), Chapter 11, section 11.4.1 (instability of selection)"
},
{
"title": "Testimation bias and misleading standard errors after selection",
"terms": [
"testimation bias",
"selection bias in coefficients",
"winner's curse",
"conditional and unconditional estimates",
"standard error after selection",
"overstated significance"
],
"core": "A coefficient that is kept only because it passed a significance test is too large on average, because the small estimates that would pull the average down were filtered out. The book's worked example has a true log odds ratio of 1 and a standard error of 0.5: about 52% of estimates pass the 5% test, and those that pass average about 1.39. The bias is largest for weak effects that are hard to detect, peaking when the true effect is about 0.6 standard errors, and becomes small when the effect is several standard errors from zero. In GUSTO-I simulations, selection at p < 0.05 gave substantial bias, much more for weak predictors than for strong ones, while the full model showed little bias. Standard errors printed by software after selection ignore the selection, so confidence intervals are too narrow and p-values too small; combined with testimation bias this exaggerates significance.",
"positions": [
"Coefficients of selected predictors are biased away from zero, most for weak predictors and small samples.",
"A more liberal rule (AIC or p < 0.50) reduces but does not remove the bias; a full pre-specified model has little bias.",
"Printed standard errors and p-values of a selected model should not be trusted, because they assume the model was fixed in advance.",
"Predictions from selected models are far more variable across samples than a pre-specified model suggests.",
"Larger samples (smaller standard errors) reduce testimation bias."
],
"notation": "Cut-off c = 1.96 × SE; a = (c − β)/SE, b = (−c − β)/SE; share kept = [1 − Φ(a)] + Φ(b); mean kept = β + SE × [φ(a) − φ(b)] ÷ share kept. Example: β = 1, SE = 0.5 → 52% kept, mean 1.39.",
"misreadings": [
"Misreading: chance errors cancel out, so selected coefficients are unbiased. Correction: They cancel only if all estimates are kept; filtering on significance removes the small ones.",
"Misreading: testimation bias is worst for strong predictors. Correction: Strong predictors almost always pass, so the filter hardly changes their average; weak ones are inflated most.",
"Misreading: the software's confidence intervals are valid once the final model is chosen. Correction: They ignore the selection step and are too narrow.",
"Misreading: a predictor that is highly significant in the final stepwise model is confirmed. Correction: It was chosen because it looked significant, so its p-value is biased."
],
"reteach": "Picture forty small hospitals like the team's, each estimating the effect of bacteriuria on preterm birth. Their estimates scatter around the true value, some too high and some too low. If only the hospitals with a significant result report it, the reports come mostly from those that happened to overestimate, so the published average is too high. Stepwise selection does the same filtering inside one model, so a weak predictor that survives tends to carry an inflated coefficient and an over-confident p-value.",
"where": "Steyerberg (2009), Chapter 11, sections 11.4.2 to 11.4.4 (bias and variability after selection); worked example from Chapter 5"
},
{
"title": "Predictive performance of selected models and noise variables",
"terms": [
"apparent performance",
"optimism",
"optimism-corrected (validated) performance",
"bootstrap validation of the whole procedure",
"noise variable",
"true predictor",
"Nagelkerke R²",
"c statistic"
],
"core": "Dropping weak predictors lowers apparent performance only slightly, but what matters is performance in new patients, estimated by bootstrap validation that replays the whole selection in each resample, or by external data. In the book's GUSTO-I subsample of 429 patients, the full eight-predictor model had higher optimism-corrected Nagelkerke R² than the three-predictor stepwise model (about 15% against about 12%). Stepwise selection removes most noise variables but also throws away true predictors; studies cited in the book found that a large share of stepwise-selected predictors can be pure noise, depending on how many noise candidates are present. From GUSTO-I simulations evaluated in large test data the book concludes that omitting a true predictor may be worse than including a noise variable, and it cites Ambler and colleagues as finding AIC the best stopping rule.",
"positions": [
"Judge a selected model by validated, not apparent, performance, with selection repeated in every bootstrap sample.",
"Selected models usually predict worse in new patients than the full model.",
"Omitting a true predictor may be worse than including a noise variable.",
"Restricting candidates by subject knowledge reduces noise variables at the source."
],
"notation": "Corrected performance = apparent − optimism. Book Table 11.6 (GUSTO-I subsample 5, Nagelkerke R²): full model 22.7 − 7.6 = 15.1%; stepwise p < 0.05 model 17.6 − 5.9 = 11.7%.",
"misreadings": [
"Misreading: a stepwise model with smaller optimism is less overfitted and therefore better. Correction: Compare corrected performance; the stepwise model starts lower and usually ends lower.",
"Misreading: stepwise selection reliably removes only noise variables. Correction: It also removes true predictors, and can keep noise ones.",
"Misreading: stepwise selection cannot be bootstrapped. Correction: Its objectivity is exactly what allows the whole procedure to be replayed in each bootstrap sample.",
"Misreading: keeping a noise variable is the worst possible error. Correction: The book concludes that omitting a true predictor may cost more."
],
"reteach": "The team compares two strategies in 600 women from its synthetic data: the full 14-term model and a backward-selected model of five terms. Both look good in the women they were fitted on, and both lose some performance when the bootstrap mimics new women. The stepwise model starts lower and loses almost as much, so it ends lower. The lesson is to compare what each model is expected to achieve in the next clinic's women, not how good it looks at home.",
"where": "Steyerberg (2009), Chapter 11, sections 11.5 to 11.6 (predictive quality, noise variables)"
},
{
"title": "Univariable screening and testing within domains",
"terms": [
"univariable (bivariable) screening",
"pre-selection",
"informal screening",
"testing within domains",
"forcing domains"
],
"core": "Univariable pre-selection keeps only candidates whose unadjusted association with the outcome reaches some p-value, typically between 0.05 and 0.5, before multivariable selection. The book treats it as a variant of stepwise selection in which only screened candidates are considered further, and in a hypothetical illustration it can lose predictors that standard backward selection from all candidates would keep. Its advantages are limited: it removes predictors that cannot be estimated in tiny samples and reduces computation, but it fixes none of the problems of stepwise selection. Informal screening, such as eyeballing plots or cross-tables of predictors against the outcome, also adds to overfitting. Testing within domains of related predictors has appeal but shares the same problems, though forcing each domain to stay, combining variables within a cluster, or using prior studies can help.",
"positions": [
"Univariable screening does not solve the problems of stepwise selection and can discard predictors that matter in a multivariable model.",
"Informal screening by looking at the outcome in the data also counts as data-driven selection.",
"Within-domain testing has the same problems; keeping domains, combining variables or using prior knowledge can reduce them."
],
"misreadings": [
"Misreading: screening at p < 0.2 is a cautious, conservative step. Correction: It is still outcome-driven selection and adds optimism.",
"Misreading: a predictor without a univariable association cannot matter in the multivariable model. Correction: Adjustment can reveal effects, and screening may discard them.",
"Misreading: only formal tests count as selection. Correction: Looking at plots or tables against the outcome before choosing predictors also adds overfitting.",
"Misreading: univariable screening followed by backward selection is safer than backward selection alone. Correction: In the book's illustration it lost predictors that backward selection from all candidates kept."
],
"reteach": "A manuscript the team reviews first keeps only variables with p < 0.10 one at a time, then runs stepwise selection on the survivors. That first step is simply another round of selection on the same preterm outcomes, so it adds to the optimism rather than removing it. It can also throw out a predictor whose effect only shows once others are accounted for. The team's own approach is to cut the list with clinical knowledge, not with p-values from its data.",
"where": "Steyerberg (2009), Chapter 11, sections 11.5 to 11.6 (univariable screening)"
},
{
"title": "Alternatives to stepwise selection and the book's conclusions",
"terms": [
"bootstrap selection",
"bagging",
"boosting",
"Bayesian model averaging (BMA)",
"Occam's window",
"Lasso",
"cost of data analysis",
"events per variable for selection"
],
"core": "Several newer methods address the weaknesses of stepwise selection. Keeping predictors chosen in most bootstrap samples has not convincingly been shown to help and tends to reproduce the original stepwise model. Bagging averages predictions from models built in bootstrap resamples, which helps when small changes in the data cause large changes in the model, and boosting up-weights hard-to-classify observations. Bayesian model averaging weights the estimates of many candidate models by their posterior probability, with Occam's window dropping models far less probable than the best; in simulations it kept fewer noise variables than stepwise selection and in the Framingham coronary data it predicted somewhat better. The Lasso shrinks coefficients and sets some exactly to zero. The book concludes that overfitting begins with too many candidates, that stepwise selection does not solve it, and that subject knowledge, larger data, better algorithms and bootstrapping should be used instead.",
"positions": [
"Limit selection with subject knowledge, especially in small data.",
"Reliable selection needs about 50 events per candidate; with fewer, prefer a pre-specified full model.",
"If selection is needed, use AIC with backward elimination and bootstrap the whole procedure.",
"Model-averaging and penalised methods (BMA, Lasso) are promising alternatives.",
"The book cites Faraway's phrase that these costs are 'the cost of data analysis'."
],
"notation": "BMA: E(β | D) = Σ over models β_model × Pr(model | D); with p candidates up to 2^p models. Events needed for reliable selection ≈ 50 × candidate df.",
"misreadings": [
"Misreading: bootstrap selection (keeping predictors selected in over half of resamples) fixes stepwise instability. Correction: The book finds the evidence of benefit unconvincing.",
"Misreading: the Lasso removes the need to validate. Correction: Its selection is data-driven too and should be validated by bootstrapping the whole procedure.",
"Misreading: with 10 events per candidate, data-driven selection is reliable. Correction: About 50 are suggested; 10 is the floor for a pre-specified model.",
"Misreading: Bayesian model averaging picks one best model. Correction: It averages over many plausible models, weighting each by its posterior probability."
],
"reteach": "The team realises that no algorithm can rescue a long list of candidates with too few preterm births. With 15 candidate coefficients, the book's rule of about 50 events each would need around 750 preterm births, far more than it has. So the team fixes a short list from clinical knowledge and fits it all. If it ever needs a smaller model for practical reasons, it will use a liberal rule such as AIC, or a method like the Lasso, and repeat the whole process in bootstrap samples to see what it really costs.",
"where": "Steyerberg (2009), Chapter 11, sections 11.7 to 11.8 (modern selection methods; concluding remarks)"
}
],
"m09": [
{
"title": "Additivity and the dependence of interaction on scale",
"terms": [
"additivity",
"main effects",
"linear predictor",
"log-odds scale",
"log-hazard scale",
"multiplicative effects",
"relative risk",
"risk difference (absolute benefit)"
],
"core": "A regression model combines predictors in a linear predictor, and writing it as a sum of main effects assumes additivity on the model's scale: the log odds for logistic regression and the log hazard for Cox regression. Additivity on the log scale means the effects are multiplicative on the odds or hazard. Whether an interaction exists therefore depends on the scale. In the book's example, a risk reduction from 20% to 10% in one stratum and from 10% to 5% in another has the same relative risk of 0.5 and nearly the same odds ratio (about 0.44 and 0.47), yet the absolute benefit is 10 against 5 percentage points. So a model that needs no interaction on the odds scale still implies different risk differences across baseline risks.",
"positions": [
"Additivity of main effects is assumed on the log-odds (logistic) or log-hazard (Cox) scale.",
"The presence or absence of interaction depends on the scale chosen.",
"A constant relative treatment effect implies an absolute benefit that depends on baseline risk (book example: tPA in GUSTO-I)."
],
"notation": "lp = a + β1x1 + β2x2 + …; logit(p) = lp; OR = exp(β). Book example: odds 0.25 → 0.111 (OR 0.44); 0.111 → 0.053 (OR 0.47).",
"misreadings": [
"Misreading: if the absolute benefit differs between groups, the model needs an interaction term. Correction: A constant odds ratio already produces larger absolute benefit where baseline risk is higher.",
"Misreading: additivity can be judged without choosing a scale. Correction: Effects that are additive on the log-odds scale are not additive on the risk scale.",
"Misreading: an additive logistic model gives the same risk difference for a predictor in every woman. Correction: Risk differences vary with the baseline risk even without interaction terms.",
"Misreading: odds ratios and relative risks always tell the same story. Correction: They coincide approximately only when risks are low."
],
"reteach": "In the team's progesterone example, treatment halves the risk both in women with a previous preterm birth (20 to 10 per 100) and in other women (10 to 5 per 100). On the relative scale the effect is the same in both groups, so the model needs no interaction. On the absolute scale, high-risk women gain twice as many prevented births, simply because they start higher. So the obstetrician who says progesterone works better in high-risk women is right in absolute terms but not in relative terms.",
"where": "Steyerberg (2009), Chapter 12, section 12.1 (additivity and interaction terms)"
},
{
"title": "Interaction terms: meaning and types",
"terms": [
"interaction term",
"product term",
"effect modification",
"two-way (first-order) interaction",
"three-way (second-order) interaction",
"quantitative interaction",
"qualitative interaction",
"correlation versus interaction"
],
"core": "An interaction term is the product of two predictors entered with its own coefficient, which lets the effect of one predictor depend on the value of the other. Once a predictor is in an interaction it no longer has a single effect, so its main-effect coefficient cannot be read on its own. A product of two predictors is a two-way (first-order) interaction; three-way terms are rarely considered. A quantitative interaction changes the size of an effect but not its direction, while a qualitative interaction reverses it; qualitative interactions matter more for interpreting effects than for predictive performance. Correlation between predictors says nothing about whether they interact.",
"positions": [
"A predictor involved in an interaction has no single effect; its effect must be described at values of the other predictor.",
"Qualitative interactions are more important for interpretation than for prediction.",
"Higher-order interactions are rarely considered in prediction modelling.",
"Correlated predictors need not interact, and uncorrelated predictors can interact."
],
"notation": "lp = a + b1x1 + b2x2 + b12(x1 × x2). For binary x2: OR for x1 = exp(b1) when x2 = 0, exp(b1 + b12) when x2 = 1.",
"misreadings": [
"Misreading: two predictors that are correlated interact. Correction: Correlation describes how predictors vary together; interaction describes whether one changes the other's effect on the outcome.",
"Misreading: in a model with an interaction, the main-effect coefficient is the overall effect of that predictor. Correction: It is the effect when the other predictor is zero.",
"Misreading: any interaction means the effect reverses between groups. Correction: Most are quantitative, changing only the size of the effect.",
"Misreading: a model with an interaction can drop the main effects and keep only the product. Correction: The usual coding keeps both main effects with the product term (unless a deliberate smart coding is chosen)."
],
"reteach": "Suppose the team's model includes bacteriuria, tobacco and their product. For a woman who does not use tobacco, bacteriuria multiplies the odds of preterm birth by one amount; for a tobacco user, the product term changes that amount. Both multipliers are still above 1, so bacteriuria is harmful in both groups, only less so in users: a quantitative interaction. The fact that tobacco users are often from low-income households is a separate matter of correlation and says nothing about interaction.",
"where": "Steyerberg (2009), Chapter 12, section 12.1 (interaction terms)"
},
{
"title": "Which interactions to consider, and subgroup claims",
"terms": [
"a priori plausibility",
"severity × treatment",
"place (centre) × predictors",
"calendar time × predictors",
"age × predictors",
"follow-up time × predictors",
"non-proportional hazards",
"subgroup analysis",
"interaction test"
],
"core": "Subject knowledge should guide which interactions to study, but it helps less than for main effects because it is hard to argue why two predictors would not add on the log-odds scale. Following Harrell, the book lists types that often deserve consideration, including severity or place by treatment, place or calendar time by predictors, age by predictors, follow-up time by predictors (non-proportional effects in survival) and season by predictors. A claim that a treatment works in one subgroup but not another needs a formal test of the difference in effect, and even pre-specified subgroup analyses are secondary findings. Empirically, predictor effects were often surprisingly consistent across settings, for example across traumatic brain injury studies and across regions in GUSTO-I.",
"positions": [
"Restrict attention to interactions that are plausible in advance.",
"Subgroup claims require an interaction test, not separate p-values per subgroup.",
"Even pre-specified subgroup analyses should be treated as secondary.",
"Proportional hazards means no interaction with follow-up time, an assumption that may fail (breast cancer stage had little effect beyond 10 years).",
"Book example: in mechanical heart valve data, several predictors mattered more early in follow-up, while calendar-time interactions were not strong."
],
"misreadings": [
"Misreading: a significant effect in one subgroup and a non-significant one in another shows the effects differ. Correction: It may reflect different power; a test of the interaction is needed.",
"Misreading: pre-specified subgroup findings are confirmatory. Correction: The book regards them as secondary.",
"Misreading: subject knowledge identifies interactions as reliably as main effects. Correction: It is much harder to justify a specific departure from additivity.",
"Misreading: predictor effects usually differ substantially between centres. Correction: The book's examples found such interactions small."
],
"reteach": "A trial report says progesterone works in women under 25 (p = 0.03) but not in older women (p = 0.40). The older group may simply have had fewer events, so less power, rather than a weaker effect. The right question is whether the treatment effect differs between the age groups, which needs a single test of the treatment by age interaction. If that test is not significant, the team should use the overall effect for all women and let each woman's baseline risk determine her absolute benefit.",
"where": "Steyerberg (2009), Chapter 12, sections 12.1.1 to 12.1.4 (interactions to consider)"
},
{
"title": "Multiple testing of interactions and the overall test",
"terms": [
"number of two-way interactions",
"multiple testing",
"false-positive interactions",
"overall (global) interaction test",
"stringent p-value (0.01)",
"Wald test"
],
"core": "The number of possible two-way interactions grows roughly with the square of the number of predictors: k predictors give k(k − 1)/2 pairs. With ten predictors there are 45 pairs, so about two would be significant at the 5% level by chance even if none were real. The book suggests limiting multiple testing either by an overall test of all interactions of one predictor together, looking at single terms only if that test is significant, or by using a stringent p-value such as 0.01 for single terms. In a GUSTO-I subsample of 785 patients with 52 deaths, the overall test of age interactions was not significant (p = 0.14), yet one single term, age by tachycardia, reached p = 0.03 and would have been kept if only single tests were used.",
"positions": [
"Test all interactions of a predictor jointly before examining single terms.",
"Alternatively, use a stringent significance level such as 0.01 for individual interactions.",
"Adding many interaction terms spends many df relative to the events available."
],
"notation": "Pairs = k(k − 1)/2; expected chance findings = α × pairs. k = 5 → 10 (0.5 at 5%); k = 10 → 45 (2.25); k = 20 → 190 (9.5); k = 30 → 435 (21.75).",
"misreadings": [
"Misreading: testing every pair is the thorough approach. Correction: It guarantees chance findings and spends many df.",
"Misreading: if one interaction is significant, the overall test can be ignored. Correction: When the overall test is not significant, single terms should not be examined.",
"Misreading: the number of pairs equals the number of predictors (or its square). Correction: It is k(k − 1)/2.",
"Misreading: main effects in the model protect against chance interactions. Correction: Each interaction test has its own false-positive risk."
],
"reteach": "A junior doctor on the team proposes testing every pair among the 14 candidate terms. That is 91 pairs, so about four or five would look significant at 5% even if none were real, and adding them all would cost far more degrees of freedom than 234 preterm births can support. Instead the team picks a few pairs that clinicians find plausible, tests all interactions of one predictor together first, and only then looks at single terms. A stricter bar such as p < 0.01 also cuts the expected false alarms to about one.",
"where": "Steyerberg (2009), Chapter 12, section 12.2 (selection of interactions)"
},
{
"title": "Smart coding of interactions and their effect on validated performance",
"terms": [
"smart coding",
"implausible crossing",
"piecewise effect",
"restricted interaction",
"apparent c",
"validated c",
"unstructured interactions"
],
"core": "The usual coding of an interaction, the product term with both main effects, can produce implausible patterns. In the book's GUSTO-I example the fitted lines of log odds against age with and without tachycardia crossed at about 55 years, implying that tachycardia was protective in younger patients. Smart coding uses subject knowledge to rule out such effects, for example by allowing no tachycardia effect below the crossing age and an effect only above it, which used fewer parameters than the product model while fitting as well. All interaction versions raised the apparent c in the 785-patient subsample, but in over 20,000 independent patients the main-effects model had the best c, and in the large data the interaction was significant in the opposite direction. Unstructured interactions found by testing can damage prediction.",
"positions": [
"Code interactions so that they cannot produce implausible effects, such as a risk factor that looks protective at some ages.",
"Smart codings can use fewer parameters than a simple product model and also ease the presentation of standard errors.",
"Judge an interaction by validated, not apparent, performance.",
"Pre-specifying a few interactions may be better than exploratory selection."
],
"notation": "Book Table 12.2 (GUSTO-I): main effects 8 df, apparent c 0.828, validated c 0.805; + age × tachycardia 9 df, 0.831, 0.796; separate age slopes below and from 55, 9 df, 0.832, 0.798; tachycardia effect only above 55, 8 df, 0.832, 0.798.",
"misreadings": [
"Misreading: an interaction that raises apparent c improves the model. Correction: Apparent c always rises with extra terms; in GUSTO-I validated c fell from 0.805 to 0.796.",
"Misreading: a significant interaction in a small sample will replicate. Correction: The book's example reversed direction in the large validation data.",
"Misreading: smart coding removes all optimism. Correction: The cut-point used in smart coding is itself chosen from the data; its aim is only to rule out implausible effects.",
"Misreading: crossing lines in an interaction model reveal a real protective effect. Correction: They are often a by-product of forcing a straight-line change through noisy data."
],
"reteach": "In 400 of the team's women, an age by chronic hypertension term reaches p = 0.04, and the fitted lines imply that hypertension protects women under about 21. No clinician believes that, which is a warning that the term is fitting noise. A smarter coding would let hypertension have no extra effect up to a certain age and a growing effect above it, so it can never look protective. Even then, the team keeps the term only if bootstrap or external validation shows better predictions than the plain main-effects model.",
"where": "Steyerberg (2009), Chapter 12, section 12.2 (coding and evaluating interactions)"
},
{
"title": "Non-linearity in multivariable models: RCS, fractional polynomials and GAMs",
"terms": [
"restricted cubic spline (RCS)",
"fractional polynomial (FP1, FP2)",
"multivariable fractional polynomial (mfp) algorithm",
"generalised additive model (GAM)",
"smoothing spline",
"effective degrees of freedom",
"generalised cross-validation (GCV)"
],
"core": "With several continuous predictors in one model, every curve uses degrees of freedom, so the flexibility of each must be chosen with care. For restricted cubic splines, three, four or five knots use two, three or four df; complexity can be set in advance per predictor, giving more to stronger predictors with larger χ². The multivariable fractional polynomial (mfp) procedure starts from linear terms, takes predictors in order of significance, and for each compares the best FP2 form against omission (4 df), against a line (3 df) and against FP1 (2 df), cycling until stable; it preserves the overall type I error and is slightly conservative when the truth is linear. Generalised additive models fit penalised smooth curves whose effective df can be fixed by the analyst or chosen by generalised cross-validation, which gives the best apparent fit but spends more effective df and gives p-values that ignore the smoothing search. GAM curves can serve as a reference for simpler FP or RCS forms.",
"positions": [
"Decide the flexibility of each continuous predictor in advance, giving more to strong predictors with a likely non-linear shape.",
"Five knots for every predictor overfits in smaller data; linear terms or three knots are often enough.",
"The mfp procedure counts the search in its df (FP1 2 df, FP2 4 df).",
"GCV-tuned GAMs spend more effective df than they appear to, and their p-values are approximate.",
"GAM plots are useful as a reference when choosing simpler transformations."
],
"notation": "RCS: df = knots − 1. mfp tests per predictor: FP2 vs omission 4 df; FP2 vs linear 3 df; FP2 vs FP1 2 df.",
"misreadings": [
"Misreading: give every continuous predictor maximum flexibility so no curve is missed. Correction: Each curve spends df paid for with events, and unneeded flexibility fits noise.",
"Misreading: an FP1 uses only 1 df. Correction: Counting the search over powers, the book treats FP1 as 2 df and FP2 as 4 df.",
"Misreading: GAM p-values from GCV smoothing are exact. Correction: They ignore the search for the smoothing parameter and are too optimistic.",
"Misreading: effective df of a penalised smooth must be whole numbers. Correction: They can be fractional, such as 2.8."
],
"reteach": "The team has three continuous predictors: maternal age, which is strongly U-shaped, haemoglobin, which may bend in severe anaemia, and height, which is weak. Rather than give each a five-knot spline, the team decides before fitting: a curve with 2 df for age, and simpler terms for the others unless there is a clear reason. Each extra bend is a cost paid in preterm births. A smooth GAM picture can help the team see the shape, but it should not be allowed to spend df freely.",
"where": "Steyerberg (2009), Chapter 12, section 12.3 (non-linearity in multivariable analysis)"
},
{
"title": "Comparing flexible and simple models: the testicular cancer case study",
"terms": [
"model χ² − 2 × df",
"apparent versus validated performance",
"all-linear model",
"visual approximation",
"implausible shapes",
"Nagelkerke R²"
],
"core": "The book's case study predicts benign tissue after chemotherapy for testicular cancer in 544 patients, with three binary and three continuous predictors. Univariable spline plots suggested a log transformation for LDH, a square root for post-chemotherapy mass size and a linear term for size reduction, and fractional polynomials largely agreed. Comparing strategies, all-linear coding used few df, unselected FP2 terms gained little for many extra df, four-knot splines and GAMs raised the model χ² most, and simple FP1 or visually chosen forms reached similar χ² with far fewer df. The GCV-tuned GAM had the highest χ² but doubtful shapes, such as risk rising again for very large masses and a wiggly curve for size reduction. All these were apparent results, and a validation repeating every modelling step is needed before preferring a flexible model.",
"positions": [
"A higher apparent model χ² does not make a model better; compare χ² − 2 × df as a rough guide and, finally, validated performance.",
"Simple transformations suggested by plots can capture most of the non-linearity with few df.",
"Flexible methods can produce biologically doubtful shapes in the tails or wiggles in the middle.",
"Validation must repeat every step of the modelling, including the choice of transformations."
],
"notation": "Book Table 12.5 (apparent): all linear 6 df, χ² 205; FP2 each 15 df, 222; RCS 4 knots 12 df, 231; GAM 3 df each 12 df, 232; GAM GCV 14.3 effective df, 240. Linear model Nagelkerke R² 41.9% apparent, 40.3% validated.",
"misreadings": [
"Misreading: the model with the highest likelihood-ratio statistic should be selected. Correction: More flexible models always fit their own data better; penalise for df and validate.",
"Misreading: a flexible model's curve is the true shape. Correction: GCV-GAM curves in the case study showed implausible shapes.",
"Misreading: comparisons in the case study show what each model achieves in new patients. Correction: They are apparent results; validation of the whole process is still needed."
],
"reteach": "A manuscript the team reviews picks a GAM because it has the highest likelihood-ratio statistic. After subtracting twice the degrees of freedom, a plain all-linear model scores about as well or better. The book's testicular cancer example shows the same: the most flexible model had the highest fit in its own data but produced shapes that clinicians would doubt. The team therefore asks every flexible model to prove itself in bootstrap or external validation before trusting it over a simpler one.",
"where": "Steyerberg (2009), Chapter 12, section 12.4 (case study: testicular cancer)"
},
{
"title": "Concluding advice: a 'wrong but useful' additive model",
"terms": [
"wrong but useful model",
"limit interaction and non-linear terms",
"overall testing",
"extra shrinkage for complex terms",
"effective df of a search",
"naive Bayes",
"classification trees",
"neural networks"
],
"core": "Thorough checking of additivity and linearity suits effect estimation, but for prediction it invites overfitting, and in medical examples the gains from interactions and non-linear terms are often modest because strong qualitative interactions and U-shapes are rare. The book recommends limiting interactions to those plausible in advance and non-linear terms to strong predictors likely to be non-linear, using an overall test per predictor before single terms, comparing flexible models with a simple additive linear model on validated performance, and applying extra shrinkage or penalties to interaction and non-linear terms. In smaller data it advises relying on additivity and interpreting effects as averages over subgroups. Searching for the best form makes the effective df larger than the fitted df.",
"positions": [
"In smaller data sets, rely on additivity and interpret effects as averages over subgroups.",
"Penalise or shrink interaction and non-linear terms more than main effects, to counter testimation bias.",
"Interactions complicate presentation of a model.",
"Trees assume high-order interactions and naive Bayes assumes additivity; a tree can be used to explore interactions to be tested in regression."
],
"misreadings": [
"Misreading: a model that ignores a real interaction or curve is useless. Correction: A simpler, slightly wrong additive model often predicts as well as a flexible one.",
"Misreading: checking assumptions thoroughly always improves a prediction model. Correction: Extensive searching adds optimism, and the search raises the effective df.",
"Misreading: interaction and non-linear terms deserve the same shrinkage as main effects. Correction: The book suggests stronger shrinkage for them.",
"Misreading: additivity is never justified. Correction: In small data, assuming additivity and reading effects as averages is the recommended default."
],
"reteach": "The team's main-effects model is surely not exactly right: some predictors may act a little differently in teenagers or in first pregnancies. But with 234 preterm births, chasing every possible twist would mostly fit noise. The book's advice is to accept a model that is slightly wrong but useful, add only the curves and interactions that are strong and expected, such as the U-shaped age effect, and shrink those extra terms harder. The test of any addition is whether predictions for new women get better.",
"where": "Steyerberg (2009), Chapter 12, section 12.5 (concluding remarks)"
}
],
"m10": [
{
"title": "Why maximum likelihood predictions are too extreme: the bias-variance trade-off",
"terms": [
"maximum likelihood (ML)",
"overfitting",
"too extreme predictions",
"regression to the mean",
"bias",
"variance",
"bias-variance trade-off",
"shrinkage",
"early stopping"
],
"core": "Standard regression coefficients estimated by maximum likelihood are optimal for the development sample, but they partly fit the noise in that sample. As a result predictions for new patients are too extreme: the highest predicted risks are too high and the lowest too low, a form of regression to the mean. Each coefficient is the true effect plus sampling error, and the patients with the most extreme predictions tend to be those whose risk factors received the luckiest estimates. Accepting a slight bias by shrinking coefficients towards zero lowers their variance, and the overall prediction error for new patients falls. Shrinkage largely keeps the ranking of patients and mainly improves calibration.",
"positions": [
"Maximum likelihood estimates are optimal for the sample at hand but not for predicting new patients.",
"Slightly biased, less variable coefficients give better predictions for new patients.",
"The book distinguishes shrinkage after estimation (uniform), shrinkage during estimation (penalised ML) and shrinkage for selection (Lasso).",
"Neural networks face the same problem more severely and are commonly trained with early stopping at the point where performance in held-out data is best."
],
"notation": "Recalibration in new data: logit(observed) = a + b × lp; calibration slope b < 1 indicates predictions that were too extreme.",
"misreadings": [
"Misreading: because ML estimates are (nearly) unbiased, the ML model must predict best. Correction: In small samples their variance is large; prediction error depends on both bias and variance.",
"Misreading: overfitting makes all predictions too high. Correction: It makes them too extreme in both directions, high risks too high and low risks too low.",
"Misreading: shrinkage is a correction for a wrong model. Correction: It corrects for chance in the estimates, even when the model form is correct.",
"Misreading: shrinkage mainly improves discrimination. Correction: It mainly improves calibration; the ranking of patients changes little."
],
"reteach": "When the team fitted its model to 800 women from one year, a woman with a previous preterm birth and bacteriuria was given a risk of 31%. In the next year's similar women, only about 24 in 100 delivered early, while women given about 3% had about 5%. Part of what the model learned was chance that belonged to the first 800 women, and it gave the extra luck to the most extreme predictions. Pulling all the effects a little towards zero gives up a touch of fit in the old women and gains much more accuracy in the new ones.",
"where": "Steyerberg (2009), Chapter 13, sections 13.1 to 13.2 (overfitting and the need for shrinkage)"
},
{
"title": "Uniform shrinkage: heuristic and bootstrap factors",
"terms": [
"uniform shrinkage",
"linear shrinkage",
"shrinkage factor",
"heuristic shrinkage factor (van Houwelingen and le Cessie)",
"bootstrap shrinkage factor",
"model χ² (likelihood ratio statistic)",
"re-estimating the intercept",
"offset"
],
"core": "Uniform shrinkage multiplies every regression coefficient by one factor between 0 and 1 after standard fitting. A quick estimate comes from the heuristic formula of van Houwelingen and le Cessie, which compares the model χ² with the df used: if no predictor had any true effect, the χ² would be about equal to its df, so the excess over the df is the signal. A bootstrap estimate repeats the whole modelling process in each bootstrap sample, computes the linear predictor in the original data with the bootstrap coefficients, and regresses the original outcomes on it; the average slope estimates the factor. Shrinking changes the average predicted risk, so the intercept must then be re-estimated with the shrunk linear predictor as an offset. In the book's GUSTO-I subsample of 785 patients with 52 deaths, an 8-predictor model needed less shrinkage than a 17-predictor model, and the bootstrap gave similar values.",
"positions": [
"Count the df of all candidate predictors considered, including extra terms for splines and categories.",
"After shrinking, re-estimate the intercept so that the mean prediction matches the observed incidence.",
"Around 200 bootstrap replications are common; more give fully stable estimates.",
"Shrinkage is most needed with few events and many candidate df."
],
"notation": "s = (model χ² − df) ÷ model χ²; b_shrunk = s × b_ML. GUSTO-I subsample: 8 predictors, χ² 62.6 → s = 0.87; 17 predictors, χ² 73.5 → s = 0.77. If model χ² ≤ df the formula gives s ≤ 0, a sign that the data carry no usable signal.",
"misreadings": [
"Misreading: s is the share removed. Correction: S is the share of each coefficient kept; (χ² − df)/χ², not df/χ².",
"Misreading: the intercept is shrunk along with the coefficients and left as is. Correction: The intercept is re-estimated after shrinkage, with the shrunk linear predictor as offset.",
"Misreading: uniform shrinkage changes which women are ranked highest. Correction: Multiplying every coefficient by the same factor keeps the order, so the c statistic is unchanged.",
"Misreading: if all predictors were kept, no shrinkage is needed. Correction: Overfitting depends on the information in the data relative to the df spent, not on whether predictors were dropped."
],
"reteach": "The team's model has 15 degrees of freedom and a model χ² of 95. If none of its predictors truly mattered, it would still expect a χ² of about 15 by chance, so roughly 80 of the 95 points are real signal. The ratio 80 over 95, about 0.84, is the shrinkage factor: every coefficient keeps about 84% of its size. Then the team refits only the intercept so that the average predicted risk again matches the share of women who actually delivered early.",
"where": "Steyerberg (2009), Chapter 13, sections 13.2.1 to 13.2.2 (uniform shrinkage)"
},
{
"title": "Shrinkage after predictor selection",
"terms": [
"candidate df",
"retained df",
"testimation bias",
"shrinkage after stepwise selection",
"bootstrap with selection repeated"
],
"core": "Coefficients that survive stepwise or univariable selection are overestimated because they were kept partly for looking large (testimation bias). The heuristic shrinkage formula must therefore use the df of all candidate predictors considered, not only those retained; using the retained df understates the shrinkage needed. Alternatively the bootstrap can be used with the selection repeated in each sample. The book notes that, empirically, the shrinkage required is roughly similar for pre-specified and selected models, so a smaller selected model does not escape the need for shrinkage. For penalised estimation, the penalty that is optimal for the full model can be applied to the selected model.",
"positions": [
"Use the candidate df, or bootstrap the whole procedure including selection, when estimating shrinkage after selection.",
"Fewer retained predictors do not mean less overfitting.",
"The shrinkage required is roughly similar for pre-specified and selected models."
],
"notation": "s = (model χ² − df_candidates) ÷ model χ².",
"misreadings": [
"Misreading: after selection only the retained predictors' df count. Correction: The search over all candidates produced them, so all candidate df count.",
"Misreading: selection removes the weak predictors, so the remaining coefficients need no shrinkage. Correction: Selection inflates the retained coefficients.",
"Misreading: the removed df (candidates minus retained) is the right number. Correction: The formula uses all candidate df."
],
"reteach": "A neighbouring hospital screened 22 candidate variables, kept 7 and used 7 in the shrinkage formula, getting a reassuring factor of 0.83. But the 7 survived a contest among 22, and survivors tend to have inflated coefficients. Using all 22 candidates, the same χ² of 41 gives a factor of about 0.46, showing that roughly half of each apparent effect is noise. The team tells them that the search, not just the final list, decides how much to shrink.",
"where": "Steyerberg (2009), Chapter 14, section 14.2.3 (shrinkage after selection); Chapter 13, section 13.2"
},
{
"title": "Penalised maximum likelihood (ridge-type) estimation",
"terms": [
"penalised maximum likelihood (PML)",
"penalisation",
"ridge regression",
"penalty parameter λ (lambda)",
"scaling factor",
"effective degrees of freedom",
"penalised AIC",
"differential penalties"
],
"core": "Penalised maximum likelihood shrinks during fitting: it maximises the log-likelihood minus a penalty proportional to the sum of squared, scaled coefficients, which generalises ridge regression. The intercept is not penalised, predictors are scaled (for example by their standard deviation) so that different units are treated alike, and a penalty of zero returns the ML estimates. Penalisation lowers the effective degrees of freedom of the model; the book chooses the penalty from a grid by maximising a penalised AIC, model χ² minus twice the effective df, although cross-validation or the bootstrap can be used. One penalty shrinks coefficients unequally: precisely estimated effects resist it, weak or imprecise ones are pulled further, and correlated coefficients can even grow slightly. In the GUSTO-I subsample the more complex 17-predictor model needed a larger penalty than the 8-predictor model.",
"positions": [
"Choose λ by penalised AIC over a grid of values, or by cross-validation or bootstrap.",
"Larger penalties suit more complex models.",
"One penalty gives unequal shrinkage across coefficients, unlike uniform shrinkage.",
"Interaction and non-linear terms can be penalised more heavily than main effects.",
"A bootstrap search for the penalty giving a calibration slope of 1 is an alternative way to tune it (GUSTO-I subsample: penalties of about 7 and 12)."
],
"notation": "PML = log L − ½ λ Σ (s_i b_i)²; effective df = trace[I(b) × cov(b)]; choose λ maximising AIC = model χ²_penalised − 2 × effective df. GUSTO-I subsample: optimal λ 8 (effective df 6.9) for 8 predictors, 24 (effective df 10.8) for 17 predictors.",
"misreadings": [
"Misreading: each predictor gets its own λ. Correction: One λ is applied to all scaled coefficients; unequal shrinkage arises because the likelihood holds more information about some coefficients.",
"Misreading: the intercept absorbs the penalty. Correction: The intercept is not penalised.",
"Misreading: penalisation always moves every coefficient towards zero. Correction: Correlated coefficients can increase slightly (in GUSTO-I, shock and sex increased a little).",
"Misreading: a larger λ is always safer. Correction: Excessive penalties make predictions too modest; λ must be tuned."
],
"reteach": "Imagine each of the team's coefficients being pulled towards zero by the same elastic band, while the women's data pull it back towards its fitted value. For previous preterm birth, the data pull hard because the effect is strong and well estimated, so it barely moves. For a weak term like fetal sex, the data pull gently, so the band wins and the coefficient shrinks a lot. The team tries several band strengths and picks the one where fit minus the cost of the effective degrees of freedom is best.",
"where": "Steyerberg (2009), Chapter 13, section 13.3 (penalised maximum likelihood)"
},
{
"title": "The Lasso: shrinkage with selection",
"terms": [
"Lasso (least absolute shrinkage and selection operator)",
"L1 penalty",
"sum of absolute coefficients",
"tuning parameter t",
"exact zeros",
"standardised predictors",
"generalised cross-validation"
],
"core": "The Lasso maximises the likelihood subject to a bound on the sum of the absolute values of the standardised coefficients. Because of the absolute-value constraint, a tight bound sets some coefficients exactly to zero, so the Lasso shrinks and selects at the same time. The bound is varied as a fraction of the sum of the absolute ML coefficients and chosen by generalised cross-validation, AIC or the bootstrap. In the GUSTO-I subsample the AIC-optimal Lasso kept 7 of 8 predictors, setting sex to zero. Its selection is still data-driven and shares the instability of any selection, so the whole Lasso procedure should be validated by bootstrapping.",
"positions": [
"The Lasso combines shrinkage with selection and was promising in simulations and in GUSTO-I subsamples.",
"It works for logistic and Cox models as well as linear regression.",
"Its selection is unstable like other data-driven selection and should be checked by bootstrapping the whole procedure."
],
"notation": "Maximise log L subject to Σ |b_i| ≤ t (standardised predictors); standardised bound t ÷ Σ |b_ML| between 0 and 1.",
"misreadings": [
"Misreading: the Lasso multiplies all coefficients by one factor. Correction: That is uniform shrinkage; the Lasso shrinks unequally and sets some to exactly zero.",
"Misreading: because the Lasso is penalised, its selected predictors are reliable. Correction: Its selection is data-driven and can be unstable.",
"Misreading: the Lasso is for linear regression only. Correction: It can be used with logistic and Cox regression.",
"Misreading: the Lasso keeps the same predictors as stepwise selection. Correction: Its choice differs and is made jointly with shrinkage."
],
"reteach": "Give the team's model a fixed total budget for the absolute sizes of all its coefficients. Strong predictors such as previous preterm birth claim most of the budget, and weak ones like fetal sex may get nothing at all, so they drop out. That is how the Lasso both shrinks and selects. But which weak terms get zero can change from one sample to the next, so the team still checks the whole procedure in bootstrap samples.",
"where": "Steyerberg (2009), Chapter 13, sections 13.4 to 13.5 (the Lasso)"
},
{
"title": "Evidence that shrinkage improves calibration, not discrimination",
"terms": [
"calibration slope",
"c statistic (concordance)",
"external test data",
"small and large subsamples",
"simulation study"
],
"core": "The book tested the methods by fitting models in small and larger subsamples of GUSTO-I and evaluating them in a large independent test part. In small subsamples with about 23 deaths, ML gave a calibration slope well below 1, meaning predictions were too extreme, while uniform shrinkage, penalised ML and the Lasso brought the slope much closer to 1. The c statistic barely changed, by at most about 0.01, because shrinkage hardly alters the ranking of patients; uniform shrinkage leaves it unchanged. With larger subsamples the ML slope was closer to 1 and the benefit of shrinkage smaller. The benefit is largest with small samples and many candidate predictors.",
"positions": [
"Shrinkage methods bring the calibration slope close to 1 while leaving discrimination nearly unchanged.",
"The gain from shrinkage is largest in small samples with many candidates.",
"Even fairly large development samples showed some overfitting with ML (slope below 1)."
],
"notation": "Book Table 13.3 (small subsamples, n = 336, about 23 deaths; 8 predictors): c / slope — ML 0.75 / 0.66; uniform 0.75 / 1.01; PML 0.76 / 0.93; Lasso 0.75 / 0.83. Large subsamples (n = 892): ML 0.78 / 0.86; uniform 0.78 / 0.97; PML 0.78 / 0.96; Lasso 0.78 / 1.01.",
"misreadings": [
"Misreading: shrinkage should raise the c statistic. Correction: It changes the order of patients little or not at all; its benefit is calibration.",
"Misreading: if c is unchanged, shrinkage did nothing useful. Correction: The calibration slope moved from about 0.66 to about 1 in the book's small samples.",
"Misreading: shrinkage is only needed in tiny data sets. Correction: Some overfitting appeared even in the larger subsamples, though less.",
"Misreading: shrinkage alone rescues any small data set. Correction: The book stresses that small data sets cannot carry a model alone, so subject knowledge and external information are also needed."
],
"reteach": "Think of the team's predictions as a spread of risks from low to high. Overfitting stretches that spread too wide, so the calibration slope in new women falls below 1. Shrinkage squeezes the spread back to the right width without reordering the women, so the team still picks out the same women as highest risk and the c statistic barely moves. The book found exactly this in GUSTO-I: in small samples the slope moved from about two thirds to about 1 while c stayed the same.",
"where": "Steyerberg (2009), Chapter 13, sections 13.4 to 13.5 (comparison of shrinkage methods)"
},
{
"title": "Using external information: the adaptation method",
"terms": [
"external information",
"literature data",
"univariate (unadjusted) coefficient",
"multivariable (adjusted) coefficient",
"adaptation method",
"adaptation factor",
"meta-analysis",
"common population assumption",
"recalibrated naive Bayes"
],
"core": "Published studies often report univariate effects of predictors, which can be pooled precisely in a meta-analysis, whereas multivariable effects need individual data that the team has only from its own cohort. The adaptation method transfers the change from univariate to multivariable seen in the own data onto the precise literature estimate: the adapted coefficient equals the literature univariate coefficient plus the difference between the own multivariable and own univariate coefficients. An approximate variance, ignoring covariances, is the literature variance plus the own multivariable variance minus the own univariate variance, which is usually much smaller than the own-data variance. A second version adds only a fraction of the literature-own univariate difference, with the optimal fraction approaching 1 when the literature is large and collinearity small. The method assumes the literature and own data come from a common population with similar correlations between predictors; publication bias and differing predictor definitions threaten it, and in simulations adapted coefficients were less variable but some shrinkage was still needed.",
"positions": [
"Combine precise literature univariate estimates with the adjustment observed in the own data.",
"Assume a common population with similar predictor correlations; check this.",
"Publication bias and differing definitions threaten the pooled literature estimate.",
"Some shrinkage may still be required after adaptation.",
"A cruder alternative, recalibrating all literature univariate coefficients by one factor, ignores correlations between predictors."
],
"notation": "Method 1: b_m|I+L = b_u|L + (b_m|I − b_u|I); var ≈ var(b_u|L) + var(b_m|I) − var(b_u|I). Method 2: b_m|I+L = b_m|I + c × (b_u|L − b_u|I), 0 ≤ c ≤ 1. Book example (aneurysm surgery, age per decade): 0.79 + (0.58 − 0.98) ≈ 0.38 to 0.39.",
"misreadings": [
"Misreading: a literature univariate coefficient can be substituted directly into the multivariable model. Correction: It ignores adjustment for correlated predictors and double-counts shared information; adapt it first.",
"Misreading: the adaptation factor is added with the opposite sign. Correction: Adapted = literature univariate + (own multivariable − own univariate).",
"Misreading: adaptation removes the need for any shrinkage. Correction: The book's simulations still required some shrinkage.",
"Misreading: any published meta-analysis is a valid source. Correction: The population, predictor definitions and publication bias must be considered."
],
"reteach": "A meta-analysis of many cohorts gives the team a precise unadjusted effect of bacteriuria, while its own data give a noisy unadjusted and adjusted effect. In its own women, adjusting for the other predictors shrinks the bacteriuria effect by a certain amount. The team applies that same downward adjustment to the precise published number, getting an adjusted effect that is far less noisy than its own estimate alone. This works only if the published women resemble the team's, with predictors related to each other in similar ways.",
"where": "Steyerberg (2009), Chapter 14, sections 14.1 to 14.3.1 (external information and the adaptation method)"
},
{
"title": "Bayesian estimation and subject knowledge",
"terms": [
"Bayesian estimation",
"prior distribution",
"informative prior",
"prior centred on zero",
"posterior",
"data augmentation",
"informationally equivalent data"
],
"core": "Bayesian estimation combines a prior distribution for each coefficient with the data. Priors centred on zero pull estimates towards zero and act much like uniform shrinkage or penalised ML; the shrinkage is greater with narrower priors and less informative data. Informative priors can encode existing subject knowledge, but their source should be documented and they should be wide enough, and they must refer to multivariable effects, which are harder to elicit than univariate ones. Priors can be written as informationally equivalent data and fitted with standard software by data augmentation, adding records that represent the prior. In the book's example, Greenland predicted neonatal death in a small data set with priors for small to large effects, and the Bayesian model predicted better than ML.",
"positions": [
"Small data sets cannot carry a model alone; subject knowledge should enter through pre-specified predictors, adaptation of literature coefficients or priors.",
"Priors centred on zero are a form of shrinkage.",
"Informative priors need careful, documented justification and adequate width.",
"Bayesian methods are not yet mainstream in prediction modelling, mainly because of criticism of prior choice.",
"Shrinkage is still needed to handle remaining overfitting."
],
"notation": "Posterior ∝ likelihood × prior; prior N(0, σ²) on a coefficient behaves like a penalty that grows as σ narrows.",
"misreadings": [
"Misreading: an expert's belief about the univariate odds ratio can be used directly as a prior. Correction: Priors must concern multivariable (adjusted) effects.",
"Misreading: Bayesian estimation needs special software. Correction: Priors can be fitted by data augmentation with standard regression software.",
"Misreading: informative priors remove the need for validation. Correction: The model still needs to be validated and protected against overfitting.",
"Misreading: a prior centred on zero claims the predictor has no effect. Correction: It expresses scepticism about large effects and acts as shrinkage."
],
"reteach": "The team's satellite clinic has only 30 preterm births for 11 candidate degrees of freedom, far too few to stand on their own. A senior obstetrician offers her beliefs about each effect, which could be written as a prior: a statement of what is plausible before seeing the data. A prior centred on zero simply makes the team sceptical of large effects, much like shrinkage, while an informative prior adds her knowledge, which then has to be justified and documented. In practice the prior can be added as a few extra pretend records, so ordinary software can fit it.",
"where": "Steyerberg (2009), Chapter 14, sections 14.3 to 14.4 (Bayesian estimation and concluding remarks)"
}
],
"m11": [
{
"title": "Aspects of performance and where they are measured",
"terms": [
"model performance",
"overall performance",
"discrimination",
"calibration",
"apparent performance",
"internal validation",
"external validation",
"validation plot"
],
"core": "The book separates three questions about predicted risks: how close the predictions are to the outcomes (overall performance), whether patients with the outcome receive higher predictions than those without (discrimination), and whether predicted risks agree with observed frequencies (calibration). Each measure can be computed in the development data (apparent), after correcting for optimism within the development data (internal validation, for example by bootstrapping), or in new patients (external validation). Apparent values are too favourable because the model was fitted to those patients. Clinical usefulness is a further, decision-based question that the book handles in the next chapter.",
"positions": [
"Report overall, discrimination and calibration measures together; each answers a different question.",
"Apparent performance is optimistic and should not be the headline result.",
"Internal validation by bootstrapping is the book's preferred way to correct for optimism.",
"Clinical usefulness (decision consequences) is distinct from these statistical measures."
],
"misreadings": [
"Misreading: a high c statistic alone shows a model performs well. Correction: c covers only discrimination; calibration and overall measures must be reported too.",
"Misreading: performance in the development data is a fair estimate for new patients. Correction: apparent performance is optimistic; it must be corrected (internal validation) or tested in new patients (external validation).",
"Misreading: internal and external validation answer the same question. Correction: internal validation estimates performance in new patients from the same setting; external validation tests other settings.",
"Misreading: calibration and discrimination are two names for accuracy. Correction: discrimination is about ranking, calibration about whether the absolute risks are right."
],
"reteach": "Think of the district team's booking model as a forecaster for each pregnant woman. You can ask three separate things of it: are its forecasts close to what happened, does it put the women who delivered early above those who did not, and when it says 20%, do about 20 in 100 such women deliver early. A forecaster can be good at one of these and poor at another. And it will always look its best in the very women it learned from, so the team also needs an honest estimate for the next women.",
"where": "Steyerberg (2009), Chapter 15, introduction and section 15.1 (overall performance measures)"
},
{
"title": "Brier score and scaled Brier score",
"terms": [
"Brier score",
"quadratic error score",
"mean squared error of predictions",
"Brier_max",
"scaled Brier score",
"overall performance"
],
"core": "The Brier score is the average squared difference between each patient's outcome (0 or 1) and the predicted probability; lower is better. A non-informative model that gives everyone the average risk scores the incidence times one minus the incidence, which is the worst sensible value (Brier_max). Because Brier_max depends on the incidence, raw Brier scores cannot be compared fairly between settings with different outcome frequencies. The scaled Brier score rescales the score against Brier_max so that it runs from 0% (no information) to 100% (perfect). The Brier score mixes calibration and discrimination and can be decomposed into parts for each.",
"positions": [
"Raw Brier scores should not be compared across settings with different incidence; use the scaled Brier score.",
"The scaled Brier score behaves much like a Pearson-type R², from 0 to 100%.",
"In the book's testicular cancer example the raw Brier score looked better at external validation only because the outcome was rarer there; the scaled Brier score fell.",
"Overall measures are useful for comparing models in the same data but hide whether calibration or discrimination is at fault."
],
"notation": "Brier = (1/n) × Σ (y − p)²; Brier_max = p̄ × (1 − p̄); scaled Brier = 1 − Brier / Brier_max",
"misreadings": [
"Misreading: a lower Brier score in hospital B than in hospital A means the model works better in B. Correction: if the outcome is rarer in B, Brier_max is lower there; compare scaled Brier scores.",
"Misreading: scaled Brier = Brier / Brier_max. Correction: it is 1 minus that ratio.",
"Misreading: the scaled Brier score cannot be negative. Correction: at external validation a badly miscalibrated model can do worse than giving everyone the local incidence, giving a negative value.",
"Misreading: Brier_max equals the incidence. Correction: it equals the incidence times one minus the incidence."
],
"reteach": "Give each woman at the booking clinic a number between 0 and 1, then score the model by how far that number was from what happened (1 if she delivered early, 0 if not), squared and averaged. A lazy model that tells every woman '12%' already gets a fairly low score when preterm birth is uncommon, simply because most women are near 0. So the team asks how much better the model does than that lazy forecast, and that share is the scaled Brier score. It lets the team compare its district hospital with a referral hospital where preterm birth is more common.",
"where": "Steyerberg (2009), Chapter 15, sections 15.1 and 15.4 (overall performance; Table 15.1)"
},
{
"title": "Nagelkerke R² and the log score",
"terms": [
"Nagelkerke R²",
"explained variation",
"log-likelihood",
"logarithmic scoring rule",
"likelihood ratio statistic",
"−2 log-likelihood"
],
"core": "Nagelkerke R² is built from the log-likelihood, which scores each patient by the log of the predicted probability of what actually happened. It compares the model's likelihood with that of a model with only an intercept and rescales the result to run from 0% to 100%. The log score punishes confident wrong predictions far more heavily than the Brier score does: a 1% prediction for a patient who has the event costs much more than a 50% prediction. R² values for long-term prognostic outcomes are typically modest. Like the Brier score, R² depends on the incidence and mixes calibration with discrimination.",
"positions": [
"R² is a useful overall summary but should not be the only measure.",
"Apparent R² is optimistic; the book shows it falling from development to internal to external validation in the testicular cancer example.",
"Modest R² values are normal for prognostic models.",
"At a given c statistic, R² is lower for a rarer outcome, so R² is not comparable across incidences."
],
"notation": "R²_Nagelkerke = [1 − exp(−LR/n)] / [1 − exp(−(−2 LL0)/n)], with LR = −2 (LL0 − LL1)",
"misreadings": [
"Misreading: R² for a logistic model means the share of variance in the outcome explained, as in linear regression. Correction: it is a likelihood-based analogue rescaled to 0 to 100%; values are much lower than in linear models and depend on incidence.",
"Misreading: a low R² means a model is useless. Correction: prognostic models typically have modest R²; usefulness depends on calibration, discrimination and the decision.",
"Misreading: the Brier score and log score penalise a confident wrong prediction equally. Correction: the log score penalises it much more severely."
],
"reteach": "Suppose the model told one woman her risk was only 1%, and she then delivered at 32 weeks. The Brier score charges almost the most it can for one woman, but the log score charges far more, because it asks how surprised the model should be. Nagelkerke R² adds up these surprises over all women, compares them with a model that knows only the overall preterm rate, and turns the improvement into a percentage. So a model that is often confidently wrong gets a poor R² even if it is mostly fine.",
"where": "Steyerberg (2009), Chapter 15, section 15.1 (explained variation); Chapter 4 for the likelihood"
},
{
"title": "ROC curve and c statistic",
"terms": [
"c statistic",
"concordance statistic",
"area under the ROC curve (AUC)",
"ROC curve",
"sensitivity",
"specificity",
"concordant pair",
"Somers' D",
"Harrell's c"
],
"core": "Discrimination asks whether patients with the outcome get higher predictions than those without. At any single cut-off of predicted risk one can compute sensitivity and specificity; the ROC curve plots sensitivity against one minus specificity over all cut-offs. The c statistic equals the area under this curve and can be read as the probability that, in a random pair of one patient with and one without the outcome, the patient with the outcome has the higher prediction (ties count one half). Because c uses only the ordering of predictions, it is insensitive to the incidence and unaffected by a uniform shift in predicted risks. Confidence intervals are best obtained by bootstrapping.",
"positions": [
"c is the most common discrimination measure and is insensitive to outcome incidence.",
"c says nothing about calibration: shifting all predictions on the log-odds scale leaves it unchanged.",
"The pairwise interpretation is somewhat artificial clinically, because patients do not arrive in pairs.",
"Standard tests comparing c values apply only to prespecified models; bootstrap intervals are preferred.",
"A 50% cut-off is rarely a sensible clinical choice for reading sensitivity and specificity.",
"c should not be the only criterion; it changes little when a new marker is added."
],
"notation": "c = (concordant pairs + 0.5 × tied pairs) / (N_events × N_non-events); c = D/2 + 0.5 (Somers' D)",
"misreadings": [
"Misreading: c is the proportion of patients correctly classified. Correction: it is the proportion of event/non-event pairs ranked correctly, over all cut-offs.",
"Misreading: a good c means the risks are right. Correction: c ignores calibration; a model with all risks doubled has the same c.",
"Misreading: c does not depend on the population at all. Correction: it is insensitive to incidence, but it does depend on how heterogeneous the case-mix is (a narrower case-mix gives a lower c; see Chapter 19).",
"Misreading: moving the cut-off changes the c statistic. Correction: changing the cut-off moves along the same ROC curve; c summarises all cut-offs."
],
"reteach": "Pick one woman from the team's data who delivered early and one who delivered at term, at random. Look at the two predicted risks: did the model give the higher one to the woman who delivered early? Do this for every possible such pair and count the share the model gets right; that share is the c statistic. A coin toss gets half the pairs right. If the model raised every woman's risk by the same amount on the log-odds scale, the winner of every pair would stay the same, which is why c tells you nothing about whether the risks themselves are correct.",
"where": "Steyerberg (2009), Chapter 15, sections 15.2.1-15.2.4 (sensitivity, specificity, ROC curve and c statistic)"
},
{
"title": "Discrimination slope and Lorenz curve",
"terms": [
"discrimination slope",
"box plot of predictions by outcome",
"Lorenz curve",
"concentration curve",
"Gini index"
],
"core": "The discrimination slope is the difference between the mean predicted risk in patients with the outcome and in those without, often shown as box plots of predictions by outcome. It is easy to explain but depends on the incidence. The Lorenz curve ranks patients by predicted risk and plots the share of outcomes missed against the share of patients classified as low risk; specific points on it (for example, how many outcomes are missed if a given share of patients is spared an intervention) are often more informative than the Gini summary. Its appearance also depends strongly on incidence: at the same c it looks impressive for a rare outcome and poor for a common one.",
"positions": [
"The discrimination slope is intuitive and visual, but not comparable across incidences.",
"Part of the fall in the testicular cancer model's discrimination slope at validation reflected the lower prevalence of the outcome there.",
"Specific points of a Lorenz curve can show the trade-off between patients spared and outcomes missed.",
"c is preferred for comparing settings because it does not depend on incidence."
],
"notation": "discrimination slope = mean(p | y = 1) − mean(p | y = 0); Gini index G = 2A, with A the area between the Lorenz curve and the diagonal",
"misreadings": [
"Misreading: a lower discrimination slope at validation proves weaker discrimination. Correction: it can fall simply because the outcome is rarer there.",
"Misreading: the discrimination slope and c statistic always move together. Correction: c ignores incidence and calibration; the discrimination slope uses the risks themselves.",
"Misreading: a Lorenz curve looking impressive means a strong model. Correction: for a rare outcome it can look impressive at a modest c."
],
"reteach": "Take all the women in the team's data who delivered early and average their predicted risks, then do the same for women who delivered at term. The gap between these two averages is the discrimination slope: a bigger gap means the model separates the groups more. But if preterm birth becomes rarer, the predicted risks of everyone fall and the gap shrinks, even with the same ranking. The Lorenz curve asks a practical version: if the team calls the lowest-risk half of women 'low risk', what share of the preterm births does it miss?",
"where": "Steyerberg (2009), Chapter 15, sections 15.2.5-15.2.6 (discrimination slope and Lorenz curve)"
},
{
"title": "Calibration plot, calibration-in-the-large and calibration slope",
"terms": [
"calibration",
"calibration plot",
"validation plot",
"calibration-in-the-large",
"a | b = 1",
"calibration intercept",
"calibration slope",
"b_overall",
"linear predictor",
"offset",
"recalibration model"
],
"core": "Calibration is agreement between predicted risks and observed outcome frequencies. A calibration plot puts predicted risk on the horizontal axis and observed risk (in groups or by a smooth curve) on the vertical axis, with the 45-degree line as ideal; adding the distribution of predictions makes it a validation plot. Two summary numbers come from regressing the outcome on the model's linear predictor in the validation data. With the linear predictor as an offset (slope fixed at 1), the intercept is calibration-in-the-large: positive means risks are too low on average, negative too high. With the slope estimated, the coefficient is the calibration slope: below 1 means predictions are too extreme, above 1 too modest.",
"positions": [
"In the development data, calibration-in-the-large is 0 and the slope 1 by construction; they are informative only in new patients.",
"At internal validation the calibration slope reflects overfitting and equals the shrinkage needed.",
"At external validation the slope reflects overfitting plus true differences in predictor effects.",
"Calibration deserves more attention than it usually receives.",
"Report the sizes of miscalibration with confidence intervals, together with a plot."
],
"notation": "calibration-in-the-large: logit(P(y = 1)) = a + offset(lp); calibration slope: logit(P(y = 1)) = a + b_overall × lp; quick odds-ratio version: odds(mean predicted) / odds(observed)",
"misreadings": [
"Misreading: a calibration slope below 1 means predictions are too modest. Correction: below 1 means too extreme (high risks too high, low risks too low).",
"Misreading: the calibration slope also tells you whether the average risk is right. Correction: the average is judged by calibration-in-the-large, estimated with the slope fixed at 1.",
"Misreading: a calibration slope of 1 in the development data shows good calibration. Correction: maximum likelihood forces it to 1 there; it carries no information.",
"Misreading: the log-odds of the mean predicted risk minus that of the observed rate is exactly calibration-in-the-large. Correction: it is an approximation; the formal estimate uses each patient's own linear predictor as an offset, and the two differ when predictions vary."
],
"reteach": "Gather 100 women to whom the model gave about 20% and count how many delivered early; if about 20 did, the model is calibrated at that level. At the referral hospital the team may find that every group delivers early more often than predicted: the whole line sits above the diagonal, so calibration-in-the-large is above zero. Or it may find the line flatter than the diagonal: women given high risks do better than predicted and women given low risks worse, so the slope is below 1. Both come from one regression of what happened on the model's log-odds.",
"where": "Steyerberg (2009), Chapter 15, sections 15.3.1-15.3.10 (calibration)"
},
{
"title": "Testing calibration and the Hosmer-Lemeshow test",
"terms": [
"recalibration test",
"calibration-in-the-large test",
"calibration slope test",
"Hosmer-Lemeshow test",
"goodness-of-fit test",
"Goeman-le Cessie test",
"Harrell's E"
],
"core": "Each part of the recalibration model can be tested: the intercept with the slope fixed at 1 (1 df), the slope against 1 (1 df), or both together (the recalibration test, 2 df). These tests target the two commonest problems, a shift in average risk and overfitted effects, and their parts are interpretable. The Hosmer-Lemeshow test groups patients, usually into tenths of predicted risk, and compares observed with expected events by a chi-squared test. The book criticises it: the grouping is arbitrary, its power is low, and at development a non-significant result is expected and has no scientific meaning. A p-value is not a measure of calibration; sizes of miscalibration should be reported.",
"positions": [
"Prefer the interpretable recalibration tests (intercept, slope, both) to the Hosmer-Lemeshow test.",
"The Hosmer-Lemeshow test has low power in small samples and detects trivial miscalibration in very large ones.",
"A non-significant Hosmer-Lemeshow test in the development data says nothing about calibration in new patients.",
"In the book's testicular cancer validation, Hosmer-Lemeshow was non-significant despite a calibration slope of 0.74.",
"For Cox models only the slope can be assessed this way, because the baseline hazard is re-estimated."
],
"notation": "Recalibration test: a = 0 and b_overall = 1 (2 df); Hosmer-Lemeshow: 8 df at development, 9 df at external validation (as stated in the module notes)",
"misreadings": [
"Misreading: Hosmer-Lemeshow p = 0.71 shows excellent calibration. Correction: a non-significant result may reflect low power, and in the development data it is expected by construction.",
"Misreading: a significant test means clinically important miscalibration. Correction: in very large samples trivial miscalibration becomes significant; judge the size.",
"Misreading: the Hosmer-Lemeshow test measures discrimination. Correction: it addresses calibration, but crudely.",
"Misreading: the df are 9 at development and 8 at validation. Correction: the module (following the book) gives 8 df at development and 9 at external validation."
],
"reteach": "A published validation of a preterm model in 300 women with 18 preterm births reports 'Hosmer-Lemeshow p = 0.48, so calibration is good'. With so few preterm births, the test would almost never sound an alarm, even if the model doubled everyone's odds. It is like a smoke alarm with a weak battery: silence does not prove there is no fire. The team should instead report how far off the average risk is and how far the slope is from 1, with confidence intervals and a plot.",
"where": "Steyerberg (2009), Chapter 15, sections 15.3.1-15.3.10 (calibration tests; Tables 15.7-15.8)"
},
{
"title": "How calibration, discrimination and overall measures relate",
"terms": [
"relation between performance measures",
"case-mix",
"homogeneous case-mix",
"overfitting",
"model updating"
],
"core": "Calibration-in-the-large is independent of discrimination: shifting all risks, as happens in a case-control sample, leaves c unchanged. The calibration slope is linked to discrimination: an overfitted model has a slope below 1 and also loses discrimination in new patients. A model can be perfectly calibrated yet discriminate poorly, if all its predictions lie close to the average. So a fall in c at validation may reflect overfitting (with poor calibration too) or simply a more homogeneous case-mix (with calibration possibly fine). Overall measures mix calibration and discrimination and so hide which is deficient.",
"positions": [
"At external validation, routinely report calibration-in-the-large, the calibration slope and the recalibration test, with c and a validation plot.",
"A model that discriminates well but is miscalibrated in a new setting can be updated for that setting.",
"Overall measures suit model comparison within the same data but do not diagnose the problem.",
"c should not be the sole criterion for judging or comparing models."
],
"misreadings": [
"Misreading: if c barely falls at validation, the model is fine there. Correction: calibration can be poor while c is stable; it must be checked separately.",
"Misreading: a lower c at validation always means the coefficients are wrong. Correction: a more homogeneous case-mix lowers c even for a correct model.",
"Misreading: good calibration implies good discrimination. Correction: a model giving everyone near-average risks can be well calibrated but useless at ranking.",
"Misreading: a falling R² or Brier score tells you whether calibration or discrimination failed. Correction: these overall measures combine both."
],
"reteach": "Imagine the team's model is moved to the referral hospital. If more women there deliver early for reasons the model does not capture, every woman's true risk rises but the order of women may stay the same, so c holds while the risks are too low. If instead the model was overfitted, its high risks are too high and low risks too low, and it also ranks new women a little less well. And if the new hospital's women are all quite alike, c falls even if every risk is right. Looking at c, calibration-in-the-large and the slope together tells these stories apart.",
"where": "Steyerberg (2009), Chapter 15, sections 15.3.11 and 15.4 (relations between measures; summary); Chapter 16, Table 16.5"
}
],
"m12": [
{
"title": "Decision threshold from harm and benefit",
"terms": [
"decision threshold",
"threshold probability",
"cut-off",
"threshold odds",
"w",
"harm",
"benefit",
"default policy",
"treat all",
"treat none",
"clinical usefulness"
],
"core": "A model gives a probability, but a clinician must make a yes or no decision, so a threshold is needed: act if the predicted risk is at or above it. The book calls a model clinically useful if decisions made with it are better than a default policy that ignores the model, such as treating everyone or no one. Benefit is the gain from treating a patient who has the outcome compared with not treating; harm is the loss from treating a patient who does not. The optimal threshold is the risk at which expected benefit and expected harm balance, so the threshold odds equal harm divided by benefit. A 50% cut-off implies that false positives and false negatives are equally bad, which is rarely the case in medicine.",
"positions": [
"The threshold follows from the consequences of decisions, not from statistics; choosing it is not in the hands of the modeller.",
"A 50% cut-off is seldom appropriate.",
"Experts can often give only an order of magnitude or a range for the threshold, sometimes as a grey zone between two thresholds.",
"Individual patients may weigh harms and benefits differently.",
"Book examples: bacterial meningitis calls for a low threshold; withdrawing treatment after severe traumatic brain injury calls for a threshold close to 100%."
],
"notation": "Benefit = c_FN − c_TP; harm = c_FP − c_TN; odds(p_t) = w = p_t / (1 − p_t) = harm / benefit; p_t = harm / (harm + benefit)",
"misreadings": [
"Misreading: the threshold should be chosen where the model performs best in the data. Correction: it comes from the harm to benefit ratio of the decision and should be fixed beforehand.",
"Misreading: harm : benefit 1 : 9 gives a threshold of 11%. Correction: 1/9 = 0.111 is the threshold odds; the threshold probability is 1/(1 + 9) = 10%.",
"Misreading: the 50% default in software is a neutral choice. Correction: it assumes an unnecessary treatment is as bad as a missed case.",
"Misreading: there is one correct threshold for all patients. Correction: thresholds are often uncertain and can vary by patient preferences."
],
"reteach": "The district team must decide which women to refer to the tertiary centre. If missing a woman who will deliver very early is four times as bad as one unnecessary trip, then the team should be willing to refer four women who will deliver at term for every one who will deliver early. That balance point is a risk of 1 in 5, or 20%. The number comes from what the team values, not from the model.",
"where": "Steyerberg (2009), Chapter 16, introduction and sections 16.1.1-16.1.2 (thresholds, harm and benefit)"
},
{
"title": "Accuracy and weighted accuracy",
"terms": [
"accuracy",
"error rate",
"classification accuracy",
"weighted accuracy",
"weighted error rate",
"true positive",
"false positive",
"false negative",
"true negative"
],
"core": "Once a threshold is set, every patient falls into one of four cells: true positive, false positive, false negative or true negative. Accuracy is the share classified correctly and the error rate its complement; both weight false positives and false negatives equally, which is the same as assuming a 50% threshold. For a rare outcome, calling everyone negative already gives high accuracy without any model. Weighted accuracy builds in the threshold odds, giving each correct negative classification a weight of w relative to a correct positive. A model is useful at a threshold only if its weighted accuracy beats the better of the two default policies.",
"positions": [
"Accuracy or error rates at an arbitrary cut-off should not be used to judge clinical usefulness.",
"In the book's testicular cancer example, accuracy was higher at validation than at development while the clinical gain was zero.",
"Weighted accuracy ranks strategies in the same way as net benefit at a given threshold.",
"Sensitivity and specificity at a threshold do not by themselves show whether the model beats the default policies."
],
"notation": "accuracy = (TP + TN) / N; error rate = (FN + FP) / N; weighted accuracy = (TP + w × TN) / (N_event + w × N_no event)",
"misreadings": [
"Misreading: 85% accuracy at 12% incidence is impressive. Correction: classifying everyone as low risk gives 88% accuracy with no model.",
"Misreading: the version with the highest accuracy is the best model. Correction: accuracy can favour a model that classifies almost everyone negative, against the agreed harm to benefit ratio.",
"Misreading: weighted accuracy is a different decision criterion from net benefit. Correction: at a given threshold it is an increasing function of net benefit and ranks options identically.",
"Misreading: accuracy contains the harm to benefit weight. Correction: it weighs both errors equally."
],
"reteach": "In 1,000 booking women, 120 deliver early. If the team refers nobody, it is 'right' about the 880 who deliver at term, which is 88% accuracy, yet it has helped no one. Accuracy treats one missed preterm birth as no worse than one unnecessary trip, which is not what the team believes. Weighted accuracy gives each correct 'do not refer' only a quarter of the credit of a correct referral, in line with the team's 1 to 4 judgement, so a model that finds preterm births can beat doing nothing.",
"where": "Steyerberg (2009), Chapter 16, sections 16.1.3-16.1.4 (accuracy and weighted accuracy; Table 16.4)"
},
{
"title": "Net benefit",
"terms": [
"net benefit",
"NB",
"net true positives",
"treat all",
"treat none",
"threshold odds",
"test harm"
],
"core": "Net benefit counts the true positives and subtracts the false positives weighted by the threshold odds, per patient. It is expressed in units of true positives: a net benefit of 0.03 means three net correct treatments per 100 patients after paying for the unnecessary ones at the exchange rate set by the threshold. Treat none always has a net benefit of 0. Treat all has a net benefit equal to the incidence minus w times one minus the incidence, which is 0 when the threshold equals the incidence and negative above it. If using the model requires a burdensome test in every patient, that harm per patient, also in units of true positives, is subtracted.",
"positions": [
"Always compare the model's net benefit with both default policies at the threshold used.",
"Net benefit must be computed from the classification counts at the threshold actually applied.",
"The weight is the threshold odds, not the threshold probability.",
"Book example: in the testicular cancer development data the model beat 'resect all'; at validation its gain was zero."
],
"notation": "NB = (TP − w × FP) / N, w = p_t / (1 − p_t); NB(treat all) = incidence − w × (1 − incidence); NB(treat none) = 0; with a test: NB = (TP − w × FP) / N − test harm",
"misreadings": [
"Misreading: the weight for a 25% threshold is 0.25. Correction: the weight is the odds, 0.25/0.75 = 1/3.",
"Misreading: a positive net benefit shows the model is useful. Correction: it must exceed the better of treat all and treat none.",
"Misreading: treat all always has positive net benefit. Correction: it is negative whenever the threshold is above the incidence.",
"Misreading: counts from one threshold can be reused with the weight of another. Correction: TP and FP change with the threshold and must be recounted."
],
"reteach": "At a 20% threshold, the team's model refers some women. Each referral of a woman who then delivers early earns one point. Each referral of a woman who delivers at term costs a quarter point, because the team decided four unnecessary referrals are worth one necessary one. Add the points and divide by the number of women: that is net benefit. Then check it against two simple policies: refer nobody, which always scores zero, and refer everybody.",
"where": "Steyerberg (2009), Chapter 16, section 16.1.5 (net benefit) and section 16.1.7 (testicular cancer example)"
},
{
"title": "Decision curves",
"terms": [
"decision curve",
"decision curve analysis",
"net benefit curve",
"range of thresholds",
"Vickers and Elkin"
],
"core": "Because the threshold is often uncertain, Vickers and Elkin proposed plotting net benefit against the threshold for the model, for treat all and for treat none. The reader identifies the range of thresholds clinicians would consider reasonable and checks whether the model's net benefit is highest across that range. Treat all starts at the incidence and crosses zero where the threshold equals the incidence. A well-calibrated model with no discrimination simply equals the better default policy, and for a well-calibrated model the largest gain over both defaults lies at a threshold equal to the incidence. Net benefit rises strongly with the c statistic, but for a rare outcome even a near-perfect model gains little per 100 patients.",
"positions": [
"Judge usefulness over a range of plausible thresholds, not at a single arbitrary cut-off.",
"A model can be recommended for a context only if it beats both defaults across that context's threshold range.",
"In the book's testicular cancer example the model was useful over a wide range at development but not at the 30% tumour threshold at validation.",
"At 50% incidence, treat all is negative for every threshold above 50%."
],
"misreadings": [
"Misreading: the decision curve picks the best threshold for you. Correction: the threshold is set by clinical reasoning; the curve shows performance across plausible values.",
"Misreading: a model curve above treat none is enough. Correction: it must also exceed treat all, which is better at low thresholds.",
"Misreading: a larger c always guarantees a meaningful gain. Correction: with a rare outcome the absolute gain stays small, and miscalibration can remove it.",
"Misreading: the model's gain is largest at high thresholds. Correction: for a calibrated model it is largest near threshold = incidence."
],
"reteach": "The obstetricians would refer at 14%, the midwives at 25%. Instead of arguing, the team computes net benefit at every threshold from 5% to 40% and draws three lines: the model, refer everyone and refer no one. If the model's line is on top across the whole 14% to 25% band, both groups can agree the model helps. If it dips below either line somewhere in that band, the model does not help there.",
"where": "Steyerberg (2009), Chapter 16, sections 16.1.5-16.1.8 (net benefit and decision curves; Table 16.3)"
},
{
"title": "What makes a model clinically useful",
"terms": [
"clinical usefulness",
"discrimination",
"calibration",
"distribution of predictions around the threshold",
"spread of predictions",
"miscalibration",
"negative net benefit"
],
"core": "The book identifies three requirements together. Some discrimination is needed for any gain. Calibration matters because a miscalibrated model can be worse than a default policy, whereas a well-calibrated model with weak discrimination gives a small but never negative gain. And predictions must fall on both sides of the threshold: if all patients are below (or above) it, the model changes no decision however good its c. Some argue discrimination is primary because miscalibration can be fixed, but at the moment a model is applied in a new setting its miscalibration there is not yet known. Good calibration and discrimination are necessary but not sufficient.",
"positions": [
"No minimum c statistic guarantees usefulness; labels such as 'c above 0.8 is good' do not show it.",
"The primary requirement depends on the application: ranking (discrimination) for targeting scarce resources, calibration for informing patients and decisions or for selecting high-risk patients for a trial.",
"Book example: at validation the testicular cancer model looked satisfactory on c and calibration, yet had zero net benefit gain at a 30% threshold.",
"Check calibration and update the model if needed before using it for decisions in a new setting."
],
"misreadings": [
"Misreading: a model with c = 0.82 must be useful. Correction: if all predictions lie on one side of the threshold it changes no decision.",
"Misreading: miscalibration only reduces usefulness a little. Correction: it can make net benefit lower than treat all or treat none, even below zero.",
"Misreading: discrimination alone determines net benefit. Correction: net benefit uses absolute risks, so calibration matters.",
"Misreading: good calibration and discrimination guarantee usefulness. Correction: the distribution of risks around the threshold also matters."
],
"reteach": "Picture a clinic where every woman's predicted preterm risk is below the 15% referral line. Even if the model ranks those women beautifully, it refers nobody, which is exactly what 'refer no one' does. Now picture a hospital where the model overestimates everyone: too many women cross the line, and the extra unnecessary referrals can outweigh the gains. Usefulness needs ranking, correct absolute risks and women on both sides of the line.",
"where": "Steyerberg (2009), Chapter 16, sections 16.2-16.2.2 (discrimination, calibration and usefulness; Table 16.5)"
},
{
"title": "From prediction model to decision rule, and impact analysis",
"terms": [
"decision rule",
"clinical prediction rule",
"impact analysis",
"impact study",
"levels of evidence (Reilly and Evans)",
"efficacy",
"effectiveness",
"adherence",
"verification bias"
],
"core": "A prediction model leaves the action to the clinician and allows patient-specific thresholds; a decision rule attaches an explicit action to the prediction, which may increase its impact. Evidence for rules builds in levels: derivation, narrow validation in one setting, broad validation in varied settings, then narrow and broad impact analysis. Validation shows what the rule could achieve with full adherence (efficacy); only an impact study, ideally randomised, often by centre, shows whether care actually improves (effectiveness), because clinicians may overrule or ignore the rule. Verification bias arises when the outcome is verified only in selected patients, which distorts sensitivity, specificity and usefulness measures for the unverified group.",
"positions": [
"Few decision rules have been tested for their effect on patient outcomes.",
"Rules help most when decisions are complex, stakes are high, or savings are possible without harming care.",
"Barriers to use include scepticism, doubts about clinical sense, confidence in one's own judgement, medicolegal fears and ease of use.",
"Cluster-randomised impact studies risk contamination.",
"Under verification bias, regression coefficients stay valid if the selection criterion is a model predictor."
],
"misreadings": [
"Misreading: a well-validated rule is proven to improve care. Correction: validation shows efficacy; only an impact analysis shows effectiveness.",
"Misreading: a prediction model and a decision rule are the same thing. Correction: a rule adds a threshold and an action, which require clinical judgement.",
"Misreading: a model developed and tested in one hospital is ready for all hospitals. Correction: that is derivation level; it needs broad validation and impact analysis.",
"Misreading: verified patients give unbiased sensitivity for everyone. Correction: when only selected patients are verified, these measures say nothing about the unverified group."
],
"reteach": "If the team prints 'refer if risk is 20% or more' on the antenatal card, it has turned its model into a rule. Showing that the rule would have referred the right women in last year's data tells the team what is possible if everyone follows it. Whether midwives actually follow it, and whether fewer babies are born early without specialist care, can only be shown by trying it, ideally by randomising some clinics to use the rule and others not.",
"where": "Steyerberg (2009), Chapter 16, sections 16.3-16.4 (decision rules and impact; Table 16.6); Chapter 15, section 15.2.9 for verification bias"
}
],
"m13": [
{
"title": "Internal and external validity",
"terms": [
"internal validity",
"reproducibility",
"external validity",
"generalisability",
"transportability",
"superpopulation",
"setting",
"validation"
],
"core": "Models are built for future patients, so validation asks how good the predictions are in patients who did not contribute to the model. The book pictures a superpopulation made up of related settings, from which the development sample comes from one. Internal validity (reproducibility) concerns new patients from the same setting and can be estimated from the development data alone. External validity (generalisability or transportability) concerns other, plausibly related settings and needs new data from them. Settings differ in patient selection, time period and definitions of predictors and outcome; which settings are plausibly related is a matter of clinical judgement.",
"positions": [
"Validation is an essential part of developing a prediction model, not an optional extra.",
"Internal validation is a minimum requirement; it cannot show how a model transports.",
"The more often and the more diverse the settings in which a model has been validated, the more confidence in its generalisability.",
"Measures to validate include c, calibration-in-the-large, the calibration slope, R², the Brier score and net benefit."
],
"misreadings": [
"Misreading: testing on any data not used for fitting is external validation. Correction: data from the same setting, split at random, tests internal validity only.",
"Misreading: internal validation can show whether the model will work in another hospital. Correction: it resamples the same setting and cannot detect differences between settings.",
"Misreading: generalisability is decided statistically. Correction: which settings are plausibly related is a clinical judgement."
],
"reteach": "The district team's 2,000 women are a means to an end: the model is for the women who will book next month and next year. 'Internal' asks whether it will work for the next women at this same district hospital. 'External' asks whether it will work for women at a referral hospital, in a later year, or measured by another team. The first can be estimated from the team's own data; the second needs data from those other places.",
"where": "Steyerberg (2009), Chapter 17, section 17.1 (internal and external validity; Fig. 17.1)"
},
{
"title": "Apparent performance and optimism",
"terms": [
"apparent performance",
"apparent validation",
"resubstitution",
"optimism",
"overfitting",
"maximum likelihood"
],
"core": "Apparent performance is measured in the same data used to fit the model. Because the coefficients were chosen to fit those patients as well as possible, including their chance features, it is optimistic. It is, however, stable, because all the data are used for fitting and testing. With large samples and few predictors the optimism is small. In the development data a model fitted by maximum likelihood always has calibration-in-the-large of 0 and a calibration slope of 1, so these apparent values carry no information about calibration in new patients.",
"positions": [
"Apparent performance should not be presented as validation.",
"Optimism shrinks with larger samples and fewer candidate predictors.",
"The apparent calibration slope of exactly 1 is a consequence of fitting, not evidence of good calibration."
],
"misreadings": [
"Misreading: a calibration slope of 1.00 in the development data shows no shrinkage is needed. Correction: it is 1 by construction; only validation estimates the slope in new patients.",
"Misreading: a slope of exactly 1 is a sign of overfitting. Correction: it is simply what maximum likelihood gives in its own data.",
"Misreading: apparent performance is unreliable because it is unstable. Correction: it is stable but biased upwards."
],
"reteach": "When the team tests its model on the same 2,000 women it was fitted to, it is like a student marking their own exam with the answer key they wrote. The score will look good, partly because the model has learned quirks of these particular women. And some checks, like the calibration slope, come out perfect automatically in these women. The team needs an estimate for women the model has not seen.",
"where": "Steyerberg (2009), Chapter 17, sections 17.2.1-17.2.3 (apparent, split-sample and cross-validation; Table 17.1); section 17.1 for calibration in the development data"
},
{
"title": "Split-sample validation",
"terms": [
"split-sample validation",
"data splitting",
"hold-out sample",
"training and test set",
"development and validation part",
"random split"
],
"core": "Split-sample validation divides the data at random, for example two-thirds for fitting and one-third for testing. The book judges it harshly: the model is fitted on fewer events, the test part is small so the estimate is imprecise, chance imbalances arise between the parts, and there is a temptation to re-split until results look better. It also assesses a model built on part of the data rather than the final model. Simulations show it is reasonable only when samples are so large that apparent performance is already a good guide, so it works when it is not needed.",
"positions": [
"A random split tests internal, not external, validity.",
"Splitting is inefficient and unstable; stratifying the split helps only partly.",
"After a split-sample validation the final model is still fitted on all the data.",
"Book example: in a GUSTO-I subsample of 429 patients, random halves could differ considerably in mortality, and a half could contain no patient with shock."
],
"misreadings": [
"Misreading: a random split is the gold-standard validation. Correction: it is wasteful and unstable; bootstrapping is preferred for internal validation.",
"Misreading: a split is best for small samples. Correction: it is least suitable for small samples.",
"Misreading: re-splitting after a poor result is acceptable. Correction: it is selective reporting and biases performance upwards.",
"Misreading: the coefficients from the development part should be published. Correction: the final model is refitted on all data."
],
"reteach": "If the team holds back a random third of its 2,000 women, only about 78 preterm births remain to test the model, and only about 156 to build it. The c statistic from 78 events could easily be anywhere from about 0.65 to 0.79 by chance. Another random split would give a different answer. So the team pays twice, with a weaker model and a fuzzy test, and still learns nothing about other hospitals.",
"where": "Steyerberg (2009), Chapter 17, sections 17.2.1-17.2.3 (apparent, split-sample and cross-validation; Table 17.1)"
},
{
"title": "Cross-validation",
"terms": [
"cross-validation",
"k-fold cross-validation",
"10-fold cross-validation",
"jack-knife",
"leave-one-out",
"repeated cross-validation"
],
"core": "Cross-validation divides the data into k parts, fits the model on k minus 1 parts and tests it on the part left out, repeating until every patient has been tested once. Each fit uses more of the data than a single split, for example 90% with ten folds. Results depend on the random folds, so the procedure may need to be repeated many times for stability. Leaving one patient out at a time is the jack-knife. Because each development set overlaps heavily with the full data, cross-validation may not reveal how unstable automated variable selection is.",
"positions": [
"Cross-validation is more efficient than a single split.",
"Repeat it (for example 50 times 10-fold) for stable results.",
"Book example: in a GUSTO-I subsample, 10-fold cross-validation suggested a stable choice of four predictors after backward selection, whereas bootstrapping showed much wider variability.",
"The bootstrap remains the book's preferred internal validation method."
],
"misreadings": [
"Misreading: cross-validation and the bootstrap are equivalent. Correction: cross-validation can understate selection instability; the bootstrap reflects it better when selection is replayed.",
"Misreading: one run of 10-fold cross-validation gives a definitive answer. Correction: results depend on the random folds and should be repeated.",
"Misreading: cross-validation tests external validity. Correction: all folds come from the same setting."
],
"reteach": "The team cuts its 2,000 women into ten groups of 200. It builds the model on nine groups and tests on the tenth, then rotates until every group has been the test group once. Each model is built on 1,800 women, so little information is wasted. But because each set of 1,800 is almost the same as the full data, the selected predictors look more stable than they really are.",
"where": "Steyerberg (2009), Chapter 17, sections 17.2.1-17.2.3 (apparent, split-sample and cross-validation; Table 17.1)"
},
{
"title": "Bootstrap validation and optimism correction",
"terms": [
"bootstrap validation",
"bootstrap sample",
"sampling with replacement",
"optimism correction",
"optimism-corrected performance",
"bias-corrected performance",
"shrinkage factor"
],
"core": "A bootstrap sample has the same size as the data but is drawn with replacement, so on average about 63% of patients appear at least once. The procedure is: record the apparent performance; in each bootstrap sample repeat every modelling step and measure performance in that sample and in the original data; the difference is the optimism; repeat 100 to 200 times and subtract the average optimism from the apparent performance. The same works for R², the Brier score and the calibration slope, whose corrected value estimates the shrinkage factor. The bootstrap is stable, uses all the data for the final model and captures the extra optimism from selection, but only for steps that are actually replayed.",
"positions": [
"Bootstrap optimism correction is the preferred internal validation.",
"Every data-driven step, including selection, must be replayed in each bootstrap sample.",
"Treating the selected model as prespecified understates optimism; one book study found 0.07 with all steps replayed against 0.01 without.",
"If informal steps cannot be replayed, at least bootstrap the full model with all candidate predictors.",
"100 to 200 replications are usual; one simulation needed 500 to reach a plateau."
],
"notation": "optimism = performance(bootstrap model in bootstrap sample) − performance(bootstrap model in original data); corrected = apparent − mean(optimism)",
"misreadings": [
"Misreading: the corrected c is the mean c of the bootstrap models in the original data. Correction: the mean optimism is subtracted from the apparent c of the original model.",
"Misreading: more bootstrap replications fix the bias from not replaying selection. Correction: more replications only reduce random noise.",
"Misreading: bootstrapping produces a new final model. Correction: it tests the strategy; the final model is fitted on all data.",
"Misreading: the bootstrap is always honest. Correction: only about steps that are replayed; with very many candidates relative to sample size it may still underestimate optimism."
],
"reteach": "The team draws 2,000 women at random from its own 2,000, allowing repeats, so some appear twice and others not at all. It rebuilds the model in this pretend sample using exactly the same recipe, then sees how much better the model looks in the pretend sample than back in the real women. That drop is how much a model built this way flatters itself. Doing this 100 or 200 times and averaging the drop tells the team how much to subtract from its own model's score.",
"where": "Steyerberg (2009), Chapter 17, section 17.2.4 (bootstrap validation); Chapter 5, section 5.3"
},
{
"title": "Types of external validation",
"terms": [
"external validation",
"temporal validation",
"historic transportability",
"geographic validation",
"methodological transportability",
"spectrum transportability",
"fully independent validation",
"leave-one-centre-out validation"
],
"core": "External validation uses patients who differ in some respect from the development sample. The book distinguishes four aspects of transportability: historic (a later period), geographic (other centres or regions), methodological (data collected differently) and spectrum (patients more or less ill on average, as when moving from a referral centre or trial to an unselected population). Temporal validation may use the most recent patients set aside from the same centre; geographic validation may use leave-one-centre-out analysis in multicentre data. Fully independent validation by other investigators at another site is the most convincing, and tends to look less favourable.",
"positions": [
"Geographic validation is more meaningful than random cross-validation.",
"In leave-one-centre-out validation, centre samples are small: emphasise general consistency and treat one striking centre as a reason for further validation there.",
"Independent validations are more convincing than validations by the developers.",
"Book example: the Lynch syndrome model was corrected with an intercept increase at temporal validation while its c stayed similar, and the final model was fitted on all data.",
"Book example: three prostate cancer nomograms underestimated indolent cancer badly in screened men; a new intercept solved much of the problem."
],
"misreadings": [
"Misreading: one poorly calibrated small centre proves the model invalid. Correction: chance differences are expected in small subgroups; look for general consistency.",
"Misreading: moving from a trial to a general clinic tests methodological transportability. Correction: that is mainly spectrum transportability.",
"Misreading: validation by the developers in a new period is fully independent. Correction: it is temporal validation; fully independent means other investigators at another site."
],
"reteach": "The team can test its model in four kinds of 'elsewhere': the same hospital next year, another hospital, a hospital that dates pregnancies differently, and a hospital that sees sicker women. Each tests a different way the world can change. The strongest evidence comes when another team, in its own hospital, tries the model and still finds it works.",
"where": "Steyerberg (2009), Chapter 17, section 17.3 (external validation; Tables 17.2-17.6)"
},
{
"title": "Reasons for poor external performance",
"terms": [
"poor external performance",
"unit error",
"coding differences",
"missing predictor at validation",
"case-mix differences",
"inadequate development"
],
"core": "Models often perform worse in other settings. Inadequate development is one cause: small or single-centre samples, and stepwise selection with many candidates and no shrinkage, give coefficients that are too large and a calibration slope below 1. Differences between settings are another: predictors or outcome coded differently, different measurement units, mistakes in applying a published formula (especially from a nomogram with non-linear terms), predictors unavailable at validation, and true differences in case-mix or predictor effects. Before computing any validation statistic, the linear predictor should be reconstructed for a few typical patients to check that risks are plausible.",
"positions": [
"A unit or coding mismatch invalidates every prediction.",
"Check units, coding and the intercept against the publication, and contact the developers if needed.",
"Substituting a constant for a missing predictor allows predictions but harms performance; the book gives an aneurysm surgery example.",
"True case-mix and effect differences are examined in Chapter 19."
],
"misreadings": [
"Misreading: near-zero predicted risks for everyone mean the model fails in this population. Correction: first check for a unit or coding error.",
"Misreading: a missing predictor can simply be set to 0 without consequence. Correction: risks for patients with that factor are underestimated and discrimination is lost.",
"Misreading: poor external results always mean the population is different. Correction: weak development and errors in applying the model are common causes."
],
"reteach": "A second hospital reports that the team's model gives every woman almost zero risk. The team checks and finds haemoglobin was entered as 110 instead of 11.0, so the haemoglobin term pushed every woman's log-odds far down. Nothing is wrong with the women or the model: the inputs were in the wrong units. Working out the risk for two or three typical women by hand would have caught this at once.",
"where": "Steyerberg (2009), Chapter 17, section 17.3.5 (reasons for poor external performance)"
},
{
"title": "What validation tests, and the final model",
"terms": [
"validation of the modelling process",
"modelling strategy",
"final model",
"combining development and validation data",
"setting-specific intercept"
],
"core": "Every internal validation method validates the modelling process rather than one fixed set of coefficients: it asks how well a model produced by this whole strategy would predict in new samples from the same population. Hence the final model is fitted on all available data, repeating any selection, even after a split-sample validation. Bootstrapping a stepwise model often shows the selected model appearing in only a few bootstrap samples, and that uncertainty belongs in the optimism. If external validation shows adequate performance, development and validation data can be combined to fit the final model, with a setting-specific intercept if needed.",
"positions": [
"Validate the strategy, replaying every step.",
"Informal steps (merging categories after looking at outcome rates, choosing cut-points) cannot be replayed and add unmeasured optimism.",
"With very many candidates relative to the sample, as in genetic marker studies, even the bootstrap may underestimate optimism.",
"Internal validation cannot detect differences between settings; external validation is still needed."
],
"misreadings": [
"Misreading: the model validated in the development part of a split is the model to publish. Correction: the final model is re-estimated on all the data.",
"Misreading: validation certifies one particular equation. Correction: internal validation tests the procedure that produced it.",
"Misreading: once externally validated, the validation data must be kept separate forever. Correction: after adequate external validation, the book allows combining data for the final model."
],
"reteach": "When the team bootstraps, it is not really testing the exact equation on its screen; it is testing its recipe: how it coded, chose and fitted predictors. A good recipe gives good models in new samples. That is why, after any validation, the team fits the final model on all 2,000 women using the same recipe. If the recipe included stepwise selection, the bootstrap will show how rarely the same set of predictors comes out, and that wobble is part of the honest optimism.",
"where": "Steyerberg (2009), Chapter 17, section 17.4 (validation of the modelling process; the final model)"
}
],
"m14": [
{
"title": "Two sources of different performance: case-mix and coefficients",
"terms": [
"patterns of external validity",
"case-mix",
"case-mix in X (observed predictors)",
"case-mix in Z (missed predictors)",
"case-mix in Y (outcome sampling)",
"validity of regression coefficients",
"simulation study"
],
"core": "When a model is moved to a new setting, its performance there depends on two things: whether its regression coefficients still hold, and the case-mix of the new patients. The book splits case-mix into three parts: the predictors in the model (X), predictors missed by the model (Z), and the outcome itself (Y), which can be over-sampled in a case-control design. Coefficients may look smaller because the model was overfitted, or may truly differ because of other definitions, selection or care. To isolate each effect, the book uses a large simulation with one score standing for the model's linear predictor and one for everything the model missed, judging calibration, discrimination and net benefit at a 30% threshold.",
"positions": [
"Internal validity is a minimum prerequisite: an overfitted model will not travel.",
"Differences in missed predictors can never be ruled out in advance.",
"Comparing coefficients one by one between two finite samples is uninformative, because chance makes some larger and some smaller even when true effects are equal.",
"Summary measures of the whole linear predictor (calibration-in-the-large, slope) are more informative than coefficient-by-coefficient comparison."
],
"notation": "Simulation: x and z standard normal; model lp = 1.5x (c about 0.81, incidence about 50%); net benefit judged at a 30% threshold, w = 3/7",
"misreadings": [
"Misreading: any drop in performance elsewhere means the model is wrong there. Correction: case-mix alone can change c and net benefit while the model remains correct.",
"Misreading: refitting in the new data and comparing coefficients shows which effects differ. Correction: in finite samples such comparisons are dominated by chance.",
"Misreading: case-mix means only the predictors in the model. Correction: it also covers missed predictors and outcome frequency in the sample."
],
"reteach": "A referral hospital wants the district team's model. Its women may differ in things the model knows about (more previous preterm births), in things the model does not know about (more twin pregnancies), or in how they were sampled (a study that chose extra preterm cases). Separately, the predictors may simply act differently there, for example because high-risk women are treated earlier. Each of these leaves its own fingerprint on calibration, c and net benefit, so naming the type of difference helps the team read the results.",
"where": "Steyerberg (2009), Chapter 19, sections 19.1-19.2 (types of difference; simulation set-up; Tables 19.1-19.2)"
},
{
"title": "Case-mix in the observed predictors",
"terms": [
"case-mix in X",
"selection on observed predictors",
"severity",
"heterogeneity",
"spread of predicted risks",
"distribution of predictions around the threshold"
],
"core": "If the new setting selects patients on predictors that are in the model, the coefficients stay unbiased, so calibration-in-the-large stays at 0 and the slope at 1. What changes is the spread of predicted risks. A more heterogeneous case-mix raises c, a less heterogeneous one lowers it. Severity relative to the threshold drives usefulness: in a more severe population few patients fall below the threshold, so the model rarely changes the decision to treat all and its net benefit gain approaches zero. In a less severe population many are spared treatment and the gain is larger.",
"positions": [
"A lower c elsewhere does not by itself mean the model is wrong; a narrower case-mix can explain it.",
"Net benefit depends on how many patients fall on each side of the threshold.",
"Book example: a testicular cancer model lost clinical usefulness at a tertiary referral centre, partly because only patients with larger masses were operated and verified.",
"Selection on X can produce predictions outside the development range, where missed non-linearities or interactions may then break calibration."
],
"misreadings": [
"Misreading: a narrower case-mix makes the model miscalibrated. Correction: selection on included predictors leaves calibration intact; it lowers c.",
"Misreading: two settings with the same c give the same net benefit. Correction: severity relative to the threshold can make the gain very different at the same c.",
"Misreading: a more severe case-mix improves discrimination. Correction: discrimination follows heterogeneity, not severity."
],
"reteach": "Suppose a clinic sees women who are all quite similar on the model's predictors: few teenagers, few with a previous preterm birth. The model's risks are still right for each woman, but they bunch together, so it is harder to tell women apart and c falls. In a referral hospital where most women have serious risk factors, nearly all are above the referral line anyway, so the model adds little to referring everyone. The model has not broken; the women are different.",
"where": "Steyerberg (2009), Chapter 19, sections 19.3.1-19.3.3 (case-mix in observed predictors; Table 19.3)"
},
{
"title": "Case-mix in missed predictors",
"terms": [
"case-mix in Z",
"missed predictor",
"omitted predictor",
"unmeasured predictor",
"calibration-in-the-large",
"stratification effect",
"non-collapsibility",
"confounding"
],
"core": "If the new patients are more severe on characteristics outside the model, the model underestimates their risk and calibration-in-the-large becomes positive; a less severe mix gives a negative value. In the book's simulation, the slope stayed about 1 and c about 0.81, but the net benefit gain over treat all fell to around zero, and below zero at a higher correlation between included and missed predictors. The slope moves somewhat with that correlation: in logistic models, adding a predictor of the outcome makes other coefficients larger even when it is unrelated to them (a stratification effect), while confounding pulls the other way. Greater or smaller heterogeneity in missed predictors changes the slope rather than calibration-in-the-large.",
"positions": [
"Underestimated risk can make a model harmful, with net benefit below a default policy.",
"c is insensitive to calibration-in-the-large, so calibration must be checked at every external validation.",
"Severity in missed predictors is usually outside the researcher's control.",
"Higher slopes from more heterogeneous missed predictors went with better discrimination and usefulness in the simulation."
],
"notation": "At r(x, z) = 0.33 in the simulation, a | b = 1 = ±0.70, so observed odds ≈ exp(0.70) = 2.0 times predicted for the more severe mix",
"misreadings": [
"Misreading: if c is good, net benefit cannot be negative. Correction: with underestimated risks, many patients truly above the threshold are left untreated and net benefit can fall below treat all.",
"Misreading: a missed predictor always lowers the calibration slope. Correction: severity in missed predictors mainly shifts calibration-in-the-large; heterogeneity in them moves the slope.",
"Misreading: the stratification effect is a form of confounding. Correction: it arises even when the added predictor is unrelated to the others, because odds ratios are non-collapsible; confounding acts in the opposite direction here."
],
"reteach": "A second referral hospital sees many more women with twin pregnancies and cervical insufficiency, neither of which is in the team's model. For any given predicted risk, more women there deliver early than the model says, so the whole calibration line lifts above the diagonal. The ranking of women may stay about as good, so c looks fine. But women predicted just under the referral line are actually above it, and leaving them unreferred can make the model worse than simply referring everyone.",
"where": "Steyerberg (2009), Chapter 19, sections 19.3.4-19.4 (case-mix in missed predictors and outcome sampling)"
},
{
"title": "Outcome sampling: case-control and nested case-control samples",
"terms": [
"case-mix in Y",
"outcome-based sampling",
"case-control design",
"nested case-control design",
"sampling fraction",
"intercept correction",
"weighting controls"
],
"core": "Sampling cases and controls in a ratio different from the source population changes only the intercept: the coefficients, the calibration slope and c are unaffected. In the book's simulation, two cases per control from a population with one case per control gave calibration-in-the-large of the log of 2, about 0.69. In a traditional case-control study the number of underlying non-cases is unknown, so absolute risks cannot be recovered. In a nested case-control design the sampling fraction is known, so the intercept can be corrected, for example by subtracting the log of the odds inflation or by weighting controls by the inverse of their sampling fraction.",
"positions": [
"Usefulness measures from a case-control sample are meaningful only after the intercept is corrected.",
"The miscalibration from outcome sampling is under the researcher's control.",
"Only nested designs allow absolute risks to be estimated."
],
"notation": "If all cases are kept and controls sampled with fraction f, sample odds = cohort odds / f; corrected intercept = sample intercept − ln(1/f); 2 cases per control from a 1:1 population gives a | b = 1 = ln 2 ≈ 0.69",
"misreadings": [
"Misreading: a case-control sample changes the coefficients. Correction: only the intercept shifts.",
"Misreading: adding extra cases from a register increases power without consequence. Correction: it is outcome-based sampling and shifts calibration-in-the-large upwards.",
"Misreading: the intercept can always be corrected. Correction: only if the sampling fraction is known, as in a nested design.",
"Misreading: a 2:1 case-control sample shifts the intercept by 2.0. Correction: it shifts by ln 2 ≈ 0.69; 2.0 is the odds ratio."
],
"reteach": "A university group measured an expensive marker in all 120 preterm births of a cohort and in only a quarter of the term births. In this sample the odds of preterm birth look four times higher than in the cohort, purely because of how women were chosen. The model's ranking and coefficients are untouched; only its starting level is too high. Because the group knows it kept one in four term births, it can lower the intercept by the log of 4 and recover cohort risks.",
"where": "Steyerberg (2009), Chapter 19, sections 19.3.4-19.4 (outcome sampling; Figs 19.5-19.7)"
},
{
"title": "Coefficient differences: overfitting and truly different effects",
"terms": [
"overfitting",
"shrinkage factor",
"calibration slope",
"different predictor effects",
"heterogeneity of effects",
"validity of coefficients"
],
"core": "An overfitted model has coefficients that are too large on average; validated, it shows a calibration slope below 1, together with lower c and lower net benefit. The book's simulation used typical shrinkage factors of 0.8, and 0.6 for severe overfitting. Truly different predictor effects in the new setting do much the same: when some effects were weaker and some stronger, the slope fell and c dropped, while calibration-in-the-large stayed near 0. Overall, calibration-in-the-large is disturbed by severity in missed predictors and by case-control sampling, the slope by overfitting, different effects and heterogeneity in missed predictors, and discrimination moves with the slope and with the heterogeneity of X.",
"positions": [
"Compare the external slope with the internally validated shrinkage factor: a shortfall beyond it suggests truly different effects.",
"Usefulness needs discrimination, but calibration and discrimination together are still not sufficient.",
"A combined scenario resembling a move from a trial to a survey (less heterogeneous X, more severe Z, different effects) gave poor calibration, lower c and negative net benefit gain in the simulation."
],
"misreadings": [
"Misreading: a slope below 1 at external validation always means overfitting. Correction: it can also reflect truly weaker or different effects in the new setting.",
"Misreading: different coefficients shift the average risk. Correction: in the simulation they mainly lowered the slope, with calibration-in-the-large near 0.",
"Misreading: overfitting affects calibration only. Correction: it also lowers c and net benefit in new patients."
],
"reteach": "If the district model was built from too many candidate predictors for its number of preterm births, its coefficients are too big, so in new women its high risks are too high and its low risks too low: a slope under 1. If the referral hospital treats hypertension early, hypertension may simply matter less there, which also flattens the slope. The team can separate these: internal validation said a slope of about 0.9 was due to overfitting, so a slope of 0.76 at the referral hospital points to weaker effects there as well.",
"where": "Steyerberg (2009), Chapter 19, section 19.5 (coefficients and the overall pattern; Table 19.4)"
},
{
"title": "Reference and refitted performance, and the M statistic",
"terms": [
"reference performance",
"reference c",
"expected performance if the model were correct",
"refitted performance",
"upper bound",
"M statistic",
"overlap in predicted risk",
"Table 1 comparison"
],
"core": "When c is lower in a new setting, the question is whether the case-mix is narrower or the coefficients do not hold. Reference performance answers this: take each new patient's predicted risk, simulate an outcome with that probability, compute c (or R² or Brier), and average over at least 100 repetitions; for calibration the reference values are simply 0 and 1. Refitted performance re-estimates the same predictors in the new data and gives an upper bound for that case-mix. If the external c is well below the reference c, case-mix does not explain the drop and the coefficients are at fault. A rough summary of overlap between settings is the M statistic: the sum over bands of predicted risk of the smaller of the two settings' fractions.",
"positions": [
"Book example: in testicular cancer the external c was below a reference c as high as at development, so the drop came from the coefficients.",
"Book example: in traumatic brain injury the better external c was partly case-mix (reference above development) and partly stronger effects.",
"An arbitrary M cut-off of 0.88 has been suggested; below it, interpret comparisons with care.",
"Otherwise, case-mix is compared informally in a descriptive table."
],
"notation": "M = Σ over bands min(fraction_setting1, fraction_setting2), 0 = no overlap, 1 = identical",
"misreadings": [
"Misreading: the reference c is the c at development. Correction: it is the c expected in the new case-mix if the model were exactly right there.",
"Misreading: refitted c shows what the published model achieves. Correction: it is an upper bound after re-estimation, not the performance of the fixed model.",
"Misreading: an M above 0.88 proves the model is valid. Correction: M only summarises overlap in predicted risk; it says nothing about coefficients."
],
"reteach": "The team's model has c 0.71 at the referral hospital, lower than at home. To check whether the referral women are just harder to tell apart, the team pretends the model is perfectly right there: it flips a weighted coin for each woman using her predicted risk and computes c on these made-up outcomes, many times. If that pretend c is higher than 0.71, the women are not the problem; the model's coefficients do not fit there as well.",
"where": "Steyerberg (2009), Chapter 19, section 19.6 (reference and refitted values; Table 19.5)"
},
{
"title": "Uncertainty and sample size for validation",
"terms": [
"validation sample size",
"number of events",
"effective sample size",
"standard error",
"detectable difference",
"power",
"one-sided test",
"non-inferiority framing"
],
"core": "Every validation measure has a standard error, and its size is set mainly by the number of events. Treating the published model as fixed, its performance is compared with ideal values; calibration-in-the-large can be wrong either way (two-sided), while for the slope and c only a fall matters (one-sided). The book's simulations show that with 50 events and 50 non-events only gross miscalibration is detectable. Detecting clinically relevant failure needs at least 100 events and 100 non-events, and preferably 250 or more events (or 100 events with many more non-events). Small validation samples also give slightly upward-biased slopes and c.",
"positions": [
"A validation with fewer than about 100 events can reveal only gross failure.",
"Plan validation studies for 100 to 250 or more events.",
"For splitting one data set by time, a 2:1 development to validation ratio is a fair balance.",
"Validity can be framed as non-inferiority, with the null hypothesis that the model is invalid.",
"In the book's simulations a truly invalid model was detected with low power at 100 events and reasonable power only at about 500."
],
"notation": "Smallest detectable difference ≈ (1.96 + 0.84) × SE = 2.80 × SE (two-sided, 80% power); ≈ (1.645 + 0.84) × SE ≈ 2.49 × SE (one-sided)",
"misreadings": [
"Misreading: a validation in 300 women is large. Correction: what matters is events; 300 women with 30 events is very small.",
"Misreading: a similar c in a small sample shows the model is valid. Correction: the confidence interval is wide and calibration has not been assessed.",
"Misreading: non-events add nothing. Correction: events carry most information, but extra non-events still add precision.",
"Misreading: a non-significant difference proves validity. Correction: with low power, absence of evidence of failure is not evidence of validity."
],
"reteach": "A small hospital tested the team's model in 300 women, of whom 30 delivered early, and found a similar c. With only 30 preterm births, the model would need to be wildly off, roughly doubling or halving the odds, before the study could notice. So 'we found no problem' means little. The referral hospital, expecting about 12% preterm births, would need to follow around 830 women to reach 100 preterm births, and more for 200.",
"where": "Steyerberg (2009), Chapter 19, sections 19.7-19.9 (uncertainty and sample size; Tables 19.6-19.8)"
}
],
"m15": [
{
"title": "Prediction model versus decision rule; why odds ratios are not enough",
"terms": [
"clinical prediction model",
"clinical decision rule",
"prediction rule",
"absolute risk",
"odds ratio table",
"intercept",
"baseline hazard",
"presentation format"
],
"core": "A table of odds ratios with confidence intervals does not allow an absolute risk to be calculated; that needs the intercept (for logistic or linear models) or the baseline hazard (for survival models). A clinical prediction model gives an absolute risk and leaves the action to the clinician and the patient. A clinical decision rule recommends an action and is made from a model by adding a threshold, which needs subject-matter input on harms and benefits. The book stresses that the two are not synonymous, and lists formats from the exact regression formula to tables and rules, which differ in accuracy, medium, display of uncertainty and ease of use.",
"positions": [
"A model that cannot give a risk for a new patient has not really been presented.",
"Decision rules may ease wide application (the book cites the Ottawa ankle, knee and head rules), but need clinical input on the threshold.",
"For a good model, predictions span a wide range of risk.",
"Formats trade exactness for ease of use."
],
"misreadings": [
"Misreading: multiplying the odds ratios that apply to a woman gives her risk. Correction: it gives her odds relative to a reference woman; without the intercept her absolute risk is unknown.",
"Misreading: the overall incidence can stand in for the intercept. Correction: only if every predictor was centred in a stated way, which is rarely the case.",
"Misreading: a decision rule is just a simpler prediction model. Correction: it adds a threshold and an action, a clinical choice beyond the statistics."
],
"reteach": "A neighbouring district found a paper listing odds ratios for previous preterm birth, hypertension and so on. Those numbers say how much each factor multiplies the odds, but not the odds of the starting woman, so the district cannot turn them into a woman's actual chance of delivering early. And when the programme officer asks for 'a simple rule for whom to refer', that is a further step: the team must first agree how bad an unnecessary referral is compared with a missed preterm birth.",
"where": "Steyerberg (2009), Chapter 18, section 18.1 (prediction models, decision rules and formats; Table 18.1)"
},
{
"title": "The regression formula: coding, units, centring and the intercept after shrinkage",
"terms": [
"regression formula",
"linear predictor",
"logistic transformation",
"coding",
"reference category",
"units",
"transformation",
"centring",
"re-estimating the intercept",
"shrinkage"
],
"core": "A formula is applied in two steps: add up the linear predictor (intercept plus each coefficient times the patient's value), then transform it into a probability with the logistic function. Coding must be explicit: what 1 means for binary predictors, the reference category for categorical ones, units and any transformation for continuous ones, and centring values if predictors were centred. If coefficients are shrunk after validation, the book prefers to re-estimate the intercept so that the mean predicted risk equals the observed frequency. Multiplying a centred linear predictor by the shrinkage factor keeps the average roughly right but can introduce systematic error when predictions span a wide range or shrinkage is strong.",
"positions": [
"The formula is the basis for spreadsheets, web calculators and electronic records.",
"Units must be stated and checked; a unit error can make every prediction meaningless.",
"After shrinking coefficients, re-estimate the intercept.",
"A Cox model additionally needs the baseline survival or hazard at stated times."
],
"notation": "lp = β0 + β1x1 + … + βkxk; p = 1 / (1 + exp(−lp))",
"misreadings": [
"Misreading: shrinkage changes only the coefficients, so the intercept can stay. Correction: shrinking changes the average linear predictor, so the intercept must be re-estimated to keep calibration-in-the-large correct.",
"Misreading: units do not matter if the coefficient is given. Correction: a coefficient per g/dL applied to g/L values gives absurd risks.",
"Misreading: the intercept is the average risk. Correction: it is the log-odds for a patient with every predictor at zero or at its reference (centring) value.",
"Misreading: the risk is the linear predictor. Correction: the linear predictor is on the log-odds scale and must be transformed."
],
"reteach": "To use the team's formula for a woman, start from the intercept and add the coefficient for each risk factor she has, plus the haemoglobin and BMI terms worked out from how far she is from the reference values. That total is on the log-odds scale; the logistic formula turns it into a chance between 0 and 1. If her haemoglobin is typed in g/L instead of g/dL, the haemoglobin term becomes huge and her risk falls to practically zero, which is why units sit beside the formula.",
"where": "Steyerberg (2009), Chapter 18, section 18.2.1 (regression formula)"
},
{
"title": "Uncertainty around predictions: confidence and prediction intervals",
"terms": [
"confidence interval for a prediction",
"prediction interval",
"standard error of the linear predictor",
"covariance matrix",
"random error",
"systematic error",
"miscalibration"
],
"core": "A confidence interval for a predicted risk concerns the average outcome for patients with given characteristics and narrows as the sample grows. A prediction interval concerns an individual value of a measured outcome and stays wide however large the sample. For a binary outcome, the predicted probability already expresses the individual's uncertainty. The standard error of the linear predictor comes from the covariance matrix of the coefficients; the interval is built on the log-odds scale and transformed, so it is asymmetric on the risk scale. Total uncertainty is random plus systematic error, and the interval shows only random error: it is valid only if the predictions are unbiased in the setting where they are used.",
"positions": [
"Miscalibration from different coding, missed predictors or truly different effects is not shown by the interval.",
"Narrow intervals from a large development sample should not be read as accuracy in a new setting.",
"For decisions the point estimate matters most; if no better estimate is available, following the model's estimate is the best one can do.",
"Each combination of predictor values has its own standard error, even at the same linear predictor.",
"After shrinkage the unshrunk covariance matrix can still be used."
],
"notation": "SE(lp) = √(xᵀ V x); for an intercept and one binary predictor present: var(lp) = var(a) + var(b) + 2 cov(a, b)",
"misreadings": [
"Misreading: a narrow interval means the risk is right for this hospital. Correction: it reflects random error only; miscalibration in a new setting is not included.",
"Misreading: the interval is symmetric around the risk. Correction: it is symmetric on the log-odds scale and becomes asymmetric after transformation.",
"Misreading: because a risk is uncertain, no number should be given. Correction: the point estimate is the best available guide; update the model if it is miscalibrated.",
"Misreading: a confidence interval and a prediction interval are the same. Correction: one is about the average, the other about an individual measured value."
],
"reteach": "The hospital screen shows a woman '35% (29% to 43%)'. That range says how much the 35% might wobble because the team had a limited number of women to learn from. It does not say whether the model's starting level is right at the referral hospital; if the model underestimates risk there, her true risk might be outside the range altogether. And for her personally, 35% already says she will either deliver early or not, with about 35 in 100 such women delivering early.",
"where": "Steyerberg (2009), Chapter 18, sections 18.2.2 and 18.3.1 (uncertainty around predictions)"
},
{
"title": "Nomograms",
"terms": [
"nomogram",
"points scale",
"total points",
"probability scale",
"graphical presentation",
"frequency format"
],
"core": "A nomogram draws the regression formula as scales: one axis per predictor, a points axis, a total points axis and a probability axis. Points are proportional to coefficient times value, rescaled so that the predictor with the widest range of effect spans the points axis; total points are linear in the linear predictor, and the probability axis applies the logistic transformation. Line lengths show the relative importance of predictors across their usual range, and nomograms can display interactions, non-linear terms and complex survival models. They look complex at first sight and reading errors accumulate with many predictors.",
"positions": [
"There is no clear evidence that clinicians prefer nomograms to score charts.",
"A model published only as a nomogram with non-linear terms is hard to validate; publish the full formula alongside.",
"A frequency format (for example 'of 100 people like you, about 28 would…') helps patients.",
"Book example: a testicular cancer nomogram from a penalised model capped each predictor at 10 points, accepting some loss of accuracy."
],
"misreadings": [
"Misreading: a nomogram replaces the formula. Correction: it is a picture of the formula; the formula must still be published.",
"Misreading: line length shows importance regardless of the values drawn. Correction: only if the values cover the predictor's actual distribution.",
"Misreading: nomograms are exact. Correction: reading and summing points introduces approximation."
],
"reteach": "A nomogram is the team's formula drawn as rulers. For each of a woman's characteristics you read off points on its ruler, add them, and then read the total down on a final ruler marked in risk. Long rulers mean characteristics that can change risk a lot. It is handy on paper, but someone trying to check the model in another hospital needs the formula itself, not a picture.",
"where": "Steyerberg (2009), Chapter 18, sections 18.2.3 and 18.3.2 (nomograms)"
},
{
"title": "Score charts",
"terms": [
"score chart",
"points score",
"risk score",
"common denominator",
"multiplier",
"score-to-risk conversion",
"interpolation",
"rounding"
],
"core": "A score chart gives rounded points for each predictor and a table to convert the total score into a risk. The book's steps are: round the coefficients of binary predictors using a common denominator (multiplying by 10 is simple; smaller multipliers often suffice); score continuous predictors from a sensible reference value that scores 0, with values for 1, 2 and so on points and interpolation between them; estimate the multiplier by fitting a logistic model with the total score as the only predictor, times any shrinkage factor; then estimate the intercept with the shrunk score as an offset. Points must be proportional to the regression coefficients.",
"positions": [
"Do not divide every coefficient by the smallest one; that rests all points on one uncertain estimate.",
"Never use odds ratios as points: a predictor with no effect would earn a point and weights would be distorted.",
"Rounding scores costs very little discrimination; in the book's testicular cancer example c was essentially unchanged.",
"The conversion from score to risk must be published."
],
"notation": "points ≈ coefficient / (log-odds per point); lp = intercept + multiplier × score",
"misreadings": [
"Misreading: points can be set equal to odds ratios. Correction: the model adds log-odds, so points must follow the coefficients; an odds ratio of 1 would wrongly earn a point.",
"Misreading: scoring the smallest predictor as 1 point is the natural scale. Correction: a common denominator across coefficients is better.",
"Misreading: rounding is the main cost of a score chart. Correction: rounding costs little; categorising continuous predictors costs more.",
"Misreading: grouping continuous predictors always loses discrimination compared with a linear term. Correction: the book's comparison assumed well-modelled continuous terms; in the course data a badly specified straight-line term cost more than grouping, and the best choice is a flexible continuous term."
],
"reteach": "The midwives want a card they can add up by hand. The team picks one point to stand for a fixed amount of log-odds, say 0.3, and divides each coefficient by it, so previous preterm birth (1.5) becomes 5 points and tobacco (0.6) becomes 2. A woman's points are added and a small table on the card turns the total into a risk. Rounding bacteriuria from 2.33 to 2 points makes her risk a little lower than the formula's, which is a small price for a card that works without a computer.",
"where": "Steyerberg (2009), Chapter 18, sections 18.2.4 and 18.3.3-18.3.4 (score charts; Tables 18.2, 18.4)"
},
{
"title": "Tables, decision rules and the cost of simplification",
"terms": [
"table of predictions",
"regression tree",
"score chart rule",
"risk groups",
"meta-model",
"simplification",
"loss of discrimination"
],
"core": "A table of predictions shows risks for combinations of predictor values and is very easy to use, with advice attachable to each cell, but continuous predictors must be grouped and risks are averaged within cells. In the book's testicular cancer example, c was essentially the same for the formula, nomogram and rounded score chart, lower with categorised predictors, and lowest for a simple table. Decision rules come as trees (easy but unstable with limited data), heavily rounded score rules (memorable but inaccurate, especially in calibration), risk groups (stable, but with cut-offs that follow the risk distribution rather than decision reasoning) and meta-models that copy a complex model's decisions. A rule needs its own validation.",
"positions": [
"Every simplification has a price in accuracy; grouping and tabulating cost more than rounding.",
"Book example: a CT rule after minor head injury had 100% sensitivity at development, lower on average in bootstrap validation, and reached 100% in only about half the bootstrap samples.",
"A meta-model inherits any shrinkage of the underlying model.",
"Choose the format to suit the audience; there is no convincing evidence that one format communicates better."
],
"misreadings": [
"Misreading: a rule with 100% sensitivity in its development data will be 100% sensitive in practice. Correction: that is an apparent result and optimistic.",
"Misreading: a table loses no information because it is based on the model. Correction: grouping continuous predictors and averaging within cells reduces discrimination.",
"Misreading: risk-group cut-offs reflect decisions. Correction: they often follow the spread of risk rather than harm-benefit reasoning."
],
"reteach": "Turning the team's model into a simple table, say rows for previous preterm birth and columns for haemoglobin groups, makes it easy for anyone to read off a risk. But every woman in a cell gets the same risk, even if her haemoglobin is at the top or bottom of the group, so the table ranks women less well than the formula. A rule like 'refer if 3 points or more' adds a threshold, which must be justified clinically and tested in new women before anyone trusts its sensitivity.",
"where": "Steyerberg (2009), Chapter 18, sections 18.2.5-18.2.6 and 18.3.5 (tables and decision rules; Tables 18.3, 18.5)"
},
{
"title": "Minimum reporting and choosing a format",
"terms": [
"minimum reporting",
"full formula",
"reproducibility of a model",
"format choice",
"audience",
"computerised presentation"
],
"core": "Whatever format is offered to users, the book asks that the full formula be published so that others can validate and update the model. This means the intercept (or baseline survival at stated times) and all coefficients after shrinkage with the intercept re-estimated; the coding, reference categories, units, transformations, centring values and spline knots; the outcome definition and time horizon; and, for a score chart, the points, interpolation rules, multiplier and intercept. The format for users should match the audience and its setting, and computerised presentation is likely to become more common.",
"positions": [
"Publish the full formula beside any nomogram, score chart or table.",
"Match the format to the user: a printed score chart for staff without computers, the formula in an electronic record for exact risks, the full formula with covariance matrix for researchers.",
"No format has been shown convincingly to communicate better than others.",
"A threshold attached to a score turns it into a decision rule, which needs clinical justification and validation."
],
"misreadings": [
"Misreading: publishing a nomogram or score chart is enough for others to validate the model. Correction: without the formula, units and knots it cannot be reconstructed reliably.",
"Misreading: the outcome definition is obvious and need not be stated. Correction: definition and time horizon (for preterm birth, gestational age dating) are part of the model.",
"Misreading: one format suits all users. Correction: choose per audience and publish the formula regardless."
],
"reteach": "The team's model has three audiences: midwives with a paper card, doctors with an electronic record and researchers who want to test it elsewhere. Each can get a different format, but behind all of them sits the same formula, with every coefficient, the intercept, the units and how each item was coded. If that formula is not published, nobody outside the hospital can check whether the card or the calculator gives the right risks.",
"where": "Steyerberg (2009), Chapter 18, sections 18.4-18.5 (choosing a format; reporting)"
}
],
"cap": [
{
"title": "Decision 1: frame the model and declare the threshold before analysis",
"terms": [
"problem definition",
"intended decision",
"outcome definition",
"predictors available at the moment of decision",
"type of model",
"decision threshold",
"threshold odds",
"seven steps",
"modelling strategy"
],
"core": "Before any analysis the book asks for a clear frame: the decision the prediction will inform, a rigorously defined outcome, predictors available at the moment the decision is made, the type of model (logistic regression for a binary outcome, giving an absolute risk) and the threshold at which action is taken. The threshold follows from the ratio of harm to benefit, with threshold odds equal to harm divided by benefit. Development then follows seven steps: inspect the data, code the predictors, specify the model, estimate it, evaluate performance, validate, and present. Steps 1 to 4 together form a modelling strategy, and steps 5 and 6 test that strategy rather than a single fitted equation.",
"positions": [
"The threshold belongs to the clinical problem, not to the modeller.",
"Choosing the threshold after seeing where the model does best is a form of data dredging; a range can be shown as a declared sensitivity analysis.",
"Predictors must be available when the decision is made (a booking-visit model cannot use information collected later).",
"A 50% threshold is rarely appropriate, because it treats false positives and false negatives as equally bad."
],
"notation": "p_t = harm / (harm + benefit); w = p_t / (1 − p_t) = harm / benefit (1 : 4 gives 20%, w = 0.25)",
"misreadings": [
"Misreading: the threshold can be fixed later where net benefit looks best. Correction: it must be declared beforehand from the harm to benefit judgement.",
"Misreading: any variable recorded in the data set can be a predictor. Correction: only information available at the decision point can be used; later information can still help an imputation model.",
"Misreading: the seven steps validate one final equation. Correction: steps 5 and 6 test the whole strategy defined by steps 1 to 4.",
"Misreading: a 1 : 4 harm to benefit ratio gives threshold odds of 0.20. Correction: the threshold probability is 20%; the odds are 0.25."
],
"reteach": "Before opening the data, the team writes one page. It says the team will decide at booking whether to refer a woman, that the outcome is delivery before 37 weeks dated in a fixed way, that only what is known at booking will be used, and that the model will be a logistic regression. It also says the team will refer at 20%, because one unnecessary referral is judged a quarter as bad as one missed preterm birth. Writing this first stops the team from quietly bending the plan later to make the results look good.",
"where": "Steyerberg (2009), Chapter 1, sections 1.3.2-1.3.3 and the checklist introducing Part II (seven steps); Chapter 2, sections 2.3.3 and 2.3.5-2.3.6 and Chapter 16, sections 16.1.1-16.1.2 (thresholds)"
},
{
"title": "Decision 2: count events per candidate degree of freedom",
"terms": [
"events per variable (EPV)",
"events per candidate parameter",
"degrees of freedom (df)",
"candidate predictors",
"effective sample size",
"overfitting"
],
"core": "For a binary outcome the information lies mainly in the number of events (or non-events, if fewer). EPV is the number of events divided by the degrees of freedom of all candidate predictors considered, before any selection: a linear or binary term uses 1 df, a quadratic 2, a restricted cubic spline with k knots k minus 1, and a categorical variable with k levels k minus 1. Below about 10, serious overfitting is expected; above 10, optimism should still be estimated and shrinkage is advisable; around 20 or more a prespecified model may need little shrinkage; reliable data-driven selection needs about 50.",
"positions": [
"EPV is judged against the candidates examined, not the terms that survive selection.",
"Complete case analysis lowers EPV by discarding events.",
"Spending df on flexible terms for every continuous predictor lowers EPV; budget flexibility for plausibly non-linear, strong effects.",
"A smaller data-driven model does not reduce overfitting if selection used the outcome."
],
"notation": "EPV = events / candidate df",
"misreadings": [
"Misreading: divide events by the number of predictors. Correction: divide by candidate degrees of freedom, including extra terms for quadratics and splines.",
"Misreading: after backward selection, EPV is events divided by the kept terms. Correction: selection used all candidates, so all candidate df count.",
"Misreading: EPV is based on the number of patients. Correction: it is based on events.",
"Misreading: EPV 15 is enough for stepwise selection. Correction: reliable selection needs about 50."
],
"reteach": "The team has 234 preterm births. Each thing the model might estimate, one per yes/no predictor and two for age coded with a curve, uses up some of those births as evidence. With 15 such slots, each has about 15 preterm births behind it, which is workable but thin enough that the coefficients will be a little too extreme. If the team instead let the data choose among predictors, it would need around 50 births per slot to choose reliably.",
"where": "Steyerberg (2009), Chapter 5, sections 5.2.3-5.2.5 (events per variable); Chapter 11, section 11.4.1 (EPV needed for selection)"
},
{
"title": "Decision 3: handle missing haemoglobin by multiple imputation",
"terms": [
"missing at random (MAR)",
"missing completely at random (MCAR)",
"complete case analysis",
"multiple imputation",
"imputation model",
"Rubin's rules",
"missing indicator method"
],
"core": "When missingness depends on other recorded variables, the data are missing at random; this is plausible but cannot be proved from the data. Complete case analysis discards patients and events and can be biased. Multiple imputation fills each missing value several times with plausible values drawn from an imputation model, analyses each completed data set and pools the results by Rubin's rules. The imputation model should contain the predictors, variables that explain the missingness, and the outcome; leaving the outcome out weakens the association between the imputed predictor and the outcome. A missing-indicator category is biased and should generally be avoided.",
"positions": [
"Include the outcome in the imputation model.",
"Variables that explain missingness (for example antenatal visits) belong in the imputation model even if they cannot be predictors.",
"Single imputation treats imputed values as known and gives standard errors that are too small.",
"Check that imputed values are physiologically plausible."
],
"misreadings": [
"Misreading: including the outcome in the imputation model is circular. Correction: leaving it out biases the predictor's association towards zero.",
"Misreading: if 85% of haemoglobin values are present, complete case loses only 15% of women. Correction: women missing any predictor are dropped, so the loss is larger.",
"Misreading: a 'missing' category is a safe compromise. Correction: the missing indicator method can severely bias coefficients.",
"Misreading: in the course Lab, imputation is replayed in every bootstrap sample. Correction: the Lab imputes once before the bootstrap as a simplification, so the optimism from imputation is not captured."
],
"reteach": "Haemoglobin is missing more often for women who came to few antenatal visits. If the team just drops those women, it loses about a fifth of its preterm births and keeps a group that is not typical. Instead it makes five educated guesses for each missing value, using the other variables and whether the woman delivered early, analyses each completed data set and combines the answers. The guesses vary from one set to the next, so the final result honestly reflects that the values were not observed.",
"where": "Steyerberg (2009), Chapter 7, sections 7.1.3-7.2 (mechanisms) and 7.4-7.8 (imputation model and practical guidance); Chapter 8"
},
{
"title": "Decision 4: keep continuous predictors continuous and choose their shape",
"terms": [
"coding of predictors",
"dichotomisation",
"cut-point",
"non-linearity",
"quadratic term",
"restricted cubic spline",
"knots",
"AIC",
"χ² − 2 × df"
],
"core": "The book advises keeping continuous predictors continuous. Dichotomising assumes a jump at the cut and equal risk within groups, discards information, and a cut-point chosen in the same data adds optimism. Subject knowledge should guide which predictors may need a non-linear shape (here a U-shaped age effect, rising risk with anaemia and at low BMI), with the data used only for the broad form. Alternative codings can be compared by the likelihood ratio chi-squared minus twice the df, an AIC-type criterion, because a more flexible function always fits the sample better and the question is whether the gain exceeds its cost.",
"positions": [
"Do not dichotomise continuous predictors, least of all at data-chosen cut-points.",
"Give flexibility only to predictors whose effects are likely to be non-linear and strong.",
"Compare codings with an AIC-type criterion rather than single p-values.",
"Each extra df spent on flexibility lowers EPV."
],
"notation": "compare codings by LR χ² − 2 × df; restricted cubic spline with k knots uses k − 1 df",
"misreadings": [
"Misreading: cutting age at 35 is safer and simpler. Correction: it ignores the shape (here missing the higher risk in young women) and loses information.",
"Misreading: the coding with the highest chi-squared is best. Correction: penalise by df; extra flexibility always raises chi-squared.",
"Misreading: a straight-line term is always a safe continuous coding. Correction: if the true effect is U-shaped, a linear term can miss it entirely."
],
"reteach": "The team suspects preterm risk is higher for very young and for older mothers, with a dip in between. Cutting age at 35 captures only the older end, and a straight line captures neither. A gentle curve such as a quadratic follows the U shape for the price of two coefficients. The team compares codings by how much each improves the fit, minus a penalty of two for every coefficient it costs.",
"where": "Steyerberg (2009), Chapter 9, sections 9.2-9.3 (dichotomising; flexible functions); Chapter 12, section 12.3 (non-linearity)"
},
{
"title": "Decision 5: prefer a prespecified model to data-driven selection",
"terms": [
"prespecified model",
"full model",
"restriction of candidates by subject knowledge",
"backward stepwise selection",
"stopping rule",
"selection instability",
"testimation bias"
],
"core": "A prespecified model keeps all candidates chosen in advance on subject knowledge. Stepwise selection by p-value is unstable (different samples select different predictors), biases the coefficients of kept predictors away from zero (testimation bias), may drop true weak predictors, and needs far more events than a prespecified model. Overfitting depends on the candidates examined, not on those kept, so a smaller selected model is not less overfitted. The book's default is the prespecified model, limited by subject knowledge before outcome analysis, unless a practical reason such as a costly measurement argues for a smaller one.",
"positions": [
"Restrict candidates by subject knowledge before looking at associations with the outcome.",
"If selection is used, a less strict stopping rule (AIC-like) underfits less than p < 0.05, but instability remains.",
"Any selection must be replayed in each bootstrap sample when estimating optimism.",
"Apparent performance cannot show whether selection did harm; compare strategies on corrected performance."
],
"misreadings": [
"Misreading: backward selection removes noise, so it reduces overfitting. Correction: it uses the outcome and adds instability and bias.",
"Misreading: similar apparent c values show the two strategies are equally good. Correction: only optimism-corrected performance compares strategies fairly.",
"Misreading: dropped predictors have no effect. Correction: at modest EPV selection often drops true weak predictors."
],
"reteach": "The registrar wants to offer all 14 variables and let the computer keep those with p below 0.05. The statistician points out that with 234 preterm births the computer's choice would change with a slightly different sample, and the predictors it keeps would look stronger than they really are. Choosing ten candidates on clinical grounds first, and keeping them all, gives a steadier model whose optimism can be measured honestly.",
"where": "Steyerberg (2009), Chapter 11, sections 11.4.1-11.4.4 (instability and biased coefficients) and 11.7-11.8 (conclusions); Chapter 10 (restricting candidates)"
},
{
"title": "Decision 6: estimate optimism of the whole strategy and shrink",
"terms": [
"bootstrap validation",
"optimism",
"optimism-corrected performance",
"uniform shrinkage",
"shrinkage factor",
"heuristic shrinkage (van Houwelingen and le Cessie)",
"bootstrap calibration slope",
"penalised maximum likelihood",
"ridge",
"re-estimating the intercept"
],
"core": "Apparent performance in the development data is optimistic. The bootstrap estimates by how much: refit the whole strategy in each bootstrap sample, compare its performance there with its performance in the original data, average the difference over at least 100 samples and subtract it from the apparent value. The corrected calibration slope estimates how much the coefficients should be shrunk. A heuristic factor is the model chi-squared minus the candidate df, divided by the model chi-squared. After uniform shrinkage the intercept is re-estimated so the average predicted risk equals the observed incidence; uniform shrinkage changes calibration but not the ranking of patients, so c is unchanged. Penalised estimation such as ridge is an alternative.",
"positions": [
"Optimism correction is valid only if every data-driven step is replayed in each bootstrap sample.",
"The heuristic shrinkage factor uses the candidate df and the chi-squared of the full candidate model.",
"Optimism falls as EPV rises.",
"Shrinkage changes calibration far more than discrimination."
],
"notation": "corrected = apparent − mean(performance_boot − performance_test); s = (model χ² − df) / model χ²; shrunk β = s × β, then re-estimate the intercept with the shrunk lp as offset",
"misreadings": [
"Misreading: bootstrapping the final selected model is enough. Correction: selection must be replayed, or optimism is understated.",
"Misreading: shrinkage should improve c. Correction: uniform shrinkage leaves the order of risks, and so c, unchanged; it improves calibration in new patients.",
"Misreading: the heuristic can use the df of the selected model. Correction: it must use the candidate df.",
"Misreading: after shrinking, the original intercept still applies. Correction: the intercept must be re-estimated to restore calibration-in-the-large."
],
"reteach": "The model scores c 0.74 in its own women, but it has learned some of their quirks. The team rebuilds the model with the same recipe in 100 resampled versions of its data and sees, on average, how much each version flatters itself; subtracting that gives an honest score. The same exercise says the coefficients are about 10% too large, so the team multiplies them all by about 0.9 and resets the starting level so the average predicted risk again matches the 11.7% observed.",
"where": "Steyerberg (2009), Chapter 17, section 17.2.4 (bootstrap validation); Chapter 5, section 5.3; Chapter 13, sections 13.2.1-13.2.2 (uniform shrinkage) and 13.3 (penalised estimation)"
},
{
"title": "Decision 7: validate the frozen model externally and read results by cause",
"terms": [
"external validation",
"frozen model",
"calibration-in-the-large",
"calibration slope",
"c statistic",
"transportability",
"optimism versus transportability",
"case-mix",
"model updating"
],
"core": "External validation applies the final model, with its shrunk coefficients and re-estimated intercept, to new patients without refitting anything, and reports calibration-in-the-large, the calibration slope, the c statistic with its interval and net benefit at the declared threshold. Each result is read by its likely cause: a higher incidence or a more severe case-mix on factors outside the model shifts calibration-in-the-large; development overfitting and weaker predictor effects both lower the slope, so the external slope is compared with the internally corrected one; c changes with the spread of the case-mix as well as with the strength of effects. Optimism and transportability are different gaps: shrinkage addresses the first, and only data from the new setting reveal the second.",
"positions": [
"Do not refit or recalibrate in the validation data and then report the result as external validation; those data have become development data.",
"A small optimism does not promise good performance elsewhere.",
"c is the least sensitive measure to a shift in average risk, so a stable c does not show good calibration.",
"If miscalibrated, update the model (for example its intercept) and validate again before use."
],
"misreadings": [
"Misreading: c barely changed, so the model is valid in the new hospital. Correction: calibration-in-the-large and the slope can show clear miscalibration with a stable c.",
"Misreading: a slope below 1 externally must mean the shrinkage was wrong. Correction: it may reflect truly weaker effects in the new setting.",
"Misreading: the internal validation should have predicted the external results. Correction: internal validation measures overfitting in the same setting only.",
"Misreading: refitting the model in the validation data and reporting its c is external validation. Correction: that is redevelopment, not validation."
],
"reteach": "The team sends its finished model, unchanged, to the tertiary hospital. There, the model predicts about 13% on average but about 17% of women deliver early, so it under-predicts; and its slope is a little below 1, partly from leftover overfitting and partly because the predictors act more weakly there. The c statistic hardly moves, which is why the team must look at calibration too. Shrinkage at home could fix only the first gap; the second can be seen only in tertiary data.",
"where": "Steyerberg (2009), Chapter 17, section 17.3 (external validation); Chapter 19, sections 19.3-19.5 (patterns of external validity); Chapter 15, section 15.3 (calibration)"
},
{
"title": "Decision 8: judge usefulness by net benefit at the declared threshold",
"terms": [
"net benefit",
"treat all",
"treat none",
"default policy",
"decision curve",
"accuracy",
"clinical usefulness"
],
"core": "Clinical usefulness is judged by net benefit at the threshold declared in the plan: true positives minus false positives weighted by the threshold odds, divided by the number of patients. The model must beat both default policies, treating no one (net benefit 0) and treating everyone (incidence minus w times one minus the incidence). A decision curve shows this over a range of thresholds. If calibration is poor, net benefit can fall below a default policy even when c looks acceptable. Plain accuracy is not a measure of usefulness, because for a rare outcome calling everyone low risk is already highly accurate.",
"positions": [
"Use the threshold declared before analysis, not one chosen from the results.",
"Compare the model with both treat all and treat none.",
"Small differences in net benefit between models in a modest validation sample may be within chance.",
"Usefulness in validation shows potential; impact on care requires an impact study."
],
"notation": "NB = (TP − w × FP) / N, w = p_t / (1 − p_t); NB(treat all) = incidence − (1 − incidence) × w; NB(treat none) = 0",
"misreadings": [
"Misreading: the weight at a 20% threshold is 0.20. Correction: it is the threshold odds, 0.25.",
"Misreading: 91% accuracy at 12% incidence shows a useful model. Correction: referring no one is already 88% accurate; use net benefit.",
"Misreading: positive net benefit means the model is ready for use. Correction: it must beat both defaults, be calibrated in the setting, and impact on care is a further question."
],
"reteach": "At the tertiary hospital, for every 100 women the team's model refers a group at 20% or more. Each referred woman who delivers early earns a point, each referred woman who does not costs a quarter point. If the total per 100 women is above zero and above what 'refer everyone' would score, the model does more good than harm at that threshold. But because the model under-predicts there, it refers fewer women than it should, so updating it would likely help.",
"where": "Steyerberg (2009), Chapter 16, sections 16.1.5-16.1.8 (net benefit and decision curves) and 16.2-16.2.2 (calibration and usefulness)"
}
]
};
