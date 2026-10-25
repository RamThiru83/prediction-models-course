registerRef({
  id: 'glossary',
  title: 'Glossary',
  html: `<p>Terms are listed alphabetically. Each definition stands alone.</p>
<p><b>Absolute risk.</b> The predicted probability that a particular patient has or will develop the outcome, expressed on a 0 to 100% scale, as opposed to a relative measure such as an odds ratio.</p>
<p><b>Apparent performance.</b> Performance of a model measured in the same data used to develop it. It is optimistic because the model has been fitted to the idiosyncrasies of that sample.</p>
<p><b>Backward elimination.</b> A stepwise method that starts with all candidate predictors in the model and removes the least significant one at a time until all remaining predictors meet a stopping rule.</p>
<p><b>Bayes' theorem (odds form).</b> Posterior odds of the outcome equal prior odds multiplied by the likelihood ratio of the observed predictor or test result. The logistic model is the same idea written on the log-odds scale.</p>
<p><b>Bias-variance trade-off.</b> A simpler or shrunken model has slightly biased coefficients but more stable predictions, while an unrestricted model is unbiased but its predictions vary more between samples. Better predictions often come from accepting some bias.</p>
<p><b>Bootstrap.</b> Resampling method that draws samples of the same size as the original, with replacement, to mimic repeated sampling from the population. In prediction research it is used to estimate optimism and confidence intervals.</p>
<p><b>Brier score.</b> The mean squared difference between predicted probability and the observed outcome (0 or 1). Lower is better; 0 is perfect.</p>
<p><b>c statistic.</b> The probability that a randomly chosen patient with the outcome has a higher predicted risk than a randomly chosen patient without it. It equals the area under the ROC curve; 0.5 is chance and 1.0 is perfect discrimination.</p>
<p><b>Calibration.</b> Agreement between predicted risks and observed outcome frequencies. Among patients with a predicted risk of 20%, about 20% should have the outcome.</p>
<p><b>Calibration plot.</b> Graph of predicted risk (x axis) against observed outcome frequency (y axis), usually with a smoothed curve and grouped points, compared with the 45-degree identity line.</p>
<p><b>Calibration slope.</b> The coefficient b of the linear predictor when the outcome is regressed on it, logit(y) = a + b × lp. A slope below 1 means predictions are too extreme (typical of overfitting); the ideal is 1.</p>
<p><b>Calibration-in-the-large.</b> Comparison of the mean predicted risk with the observed incidence. It is estimated as the intercept of a logistic model with the linear predictor entered as an offset; the ideal value is 0.</p>
<p><b>Candidate predictor.</b> A variable considered for inclusion in the model. The number of candidates, not the number finally retained, determines the risk of overfitting.</p>
<p><b>Case-mix.</b> The distribution of patient characteristics, both observed and unobserved, in a population. Differences in case-mix between development and validation settings change discrimination and often calibration.</p>
<p><b>Complete case analysis.</b> Analysis restricted to patients with no missing values on any variable in the model. It discards information and, under some missingness mechanisms, biases coefficients.</p>
<p><b>Confidence interval.</b> A range computed from the data that, over repeated sampling, contains the true parameter a stated proportion of times (usually 95%). It describes uncertainty about a parameter, not variation between individuals.</p>
<p><b>Cross-validation.</b> Internal validation method that repeatedly develops the model on part of the data and tests it on the remainder, for example 10-fold, where each tenth is tested in turn.</p>
<p><b>Decision curve.</b> Plot of net benefit of a model across a range of threshold probabilities, compared with the default policies of treating everyone and treating no one.</p>
<p><b>Decision rule.</b> A recommendation to act (for example refer or treat) when predicted risk or a score passes a threshold. It differs from a prediction model, which provides the risk itself.</p>
<p><b>Development sample.</b> The dataset in which a prediction model is built. Also called training or derivation sample.</p>
<p><b>Discrimination.</b> Ability of a model to separate patients who have the outcome from those who do not, typically measured by the c statistic.</p>
<p><b>Discrimination slope.</b> Mean predicted risk in patients with the outcome minus mean predicted risk in patients without it. It depends on outcome incidence.</p>
<p><b>Effective sample size.</b> For a binary outcome, the number of events or non-events, whichever is smaller. A cohort of 10,000 with 0.1% incidence has an effective sample size of about 10.</p>
<p><b>Events per variable (EPV).</b> Number of outcome events divided by the number of candidate predictor parameters (degrees of freedom). It is a rough guide to overfitting risk.</p>
<p><b>External validation.</b> Evaluation of a fixed model in patients not used for development, from a different time, place or investigators, to assess generalisability.</p>
<p><b>Heuristic shrinkage factor.</b> A closed-form estimate of the uniform shrinkage factor, s = (model χ² − df) / model χ², where df is the number of candidate predictor parameters.</p>
<p><b>Hosmer-Lemeshow test.</b> Goodness-of-fit test that compares observed and expected events in groups (commonly deciles) of predicted risk. It has low power and gives no indication of the direction or size of miscalibration.</p>
<p><b>Imputation.</b> Filling in missing values with plausible values estimated from the observed data. Single imputation fills each gap once; multiple imputation creates several completed datasets.</p>
<p><b>Interaction.</b> A situation in which the effect of one predictor depends on the value of another. In a logistic model it is represented by a product term.</p>
<p><b>Internal validation.</b> Estimation of how well a model would perform in new patients from the same population, using only the development data (for example bootstrap or cross-validation).</p>
<p><b>Internal validity.</b> Reproducibility of a model's performance in the population from which the development sample came; threatened mainly by overfitting.</p>
<p><b>Lasso.</b> Penalised regression that constrains the sum of absolute coefficient values. It shrinks coefficients and sets some exactly to zero, so it also selects predictors.</p>
<p><b>Likelihood ratio (diagnostic).</b> How much more likely a test result is in patients with the disease than in those without. LR+ = sensitivity / (1 − specificity); LR− = (1 − sensitivity) / specificity.</p>
<p><b>Likelihood ratio test.</b> Comparison of two nested models by twice the difference in their log-likelihoods, referred to a χ² distribution with degrees of freedom equal to the number of extra parameters.</p>
<p><b>Linear predictor.</b> The weighted sum of predictors, lp = α + β₁x₁ + β₂x₂ + …, which a logistic model converts to a probability.</p>
<p><b>Logistic regression.</b> Regression model for a binary outcome in which the log-odds of the outcome is a linear function of the predictors.</p>
<p><b>Logit.</b> The natural logarithm of the odds, logit(p) = ln[p / (1 − p)]. It maps probabilities of 0 to 1 onto the whole real line.</p>
<p><b>Missing at random (MAR).</b> Missingness that depends on observed variables (predictors or outcome) but not on the unobserved value itself, given those observed variables. It cannot be tested from the data.</p>
<p><b>Missing completely at random (MCAR).</b> Missingness unrelated to any observed or unobserved variable, for example a lost laboratory sample. Complete case analysis is then unbiased though inefficient.</p>
<p><b>Missing not at random (MNAR).</b> Missingness that depends on the unobserved value itself, even after accounting for observed data. It can never be excluded from the data alone.</p>
<p><b>Multiple imputation.</b> Creating several completed datasets with random draws from the predicted distribution of the missing values, analysing each, and pooling results so that standard errors reflect imputation uncertainty.</p>
<p><b>Net benefit.</b> Clinical value of using a model at a threshold, NB = (TP − w × FP) / N, where w = pt / (1 − pt). It places true positives and false positives on the same scale.</p>
<p><b>Nomogram.</b> A graphical device in which each predictor value is converted to points, the points are summed, and the total is read off as a predicted risk.</p>
<p><b>Odds.</b> The ratio of the probability of an event to the probability of no event, p / (1 − p). A risk of 20% is odds of 0.25, or 1 to 4.</p>
<p><b>Odds ratio.</b> The ratio of two odds. In logistic regression exp(β) is the factor by which the odds change per unit increase of the predictor.</p>
<p><b>Offset.</b> A term in a regression whose coefficient is fixed at 1 rather than estimated. It is used to estimate calibration-in-the-large with the original linear predictor held fixed.</p>
<p><b>Optimism.</b> The amount by which apparent performance exceeds performance in new patients from the same population.</p>
<p><b>Overfitting.</b> A model that fits the development sample, including its random noise, so closely that predictions in new patients are too extreme and performance is worse than apparent.</p>
<p><b>Penalised estimation.</b> Fitting a model by maximising the log-likelihood minus a penalty on coefficient size (ridge penalises squared coefficients), which shrinks coefficients during estimation.</p>
<p><b>Polytomous outcome.</b> An outcome with more than two unordered categories, modelled by several logistic submodels each with its own intercept and coefficients.</p>
<p><b>Prediction model.</b> A multivariable model that combines several predictors to give an individual's probability of a diagnostic or prognostic outcome.</p>
<p><b>Prespecified model.</b> A model whose predictors and functional forms are fixed before looking at the relation with the outcome. It avoids the bias that comes from data-driven selection.</p>
<p><b>Regression dilution.</b> Weakening of an estimated coefficient and of discrimination when a predictor is measured with random error.</p>
<p><b>Restricted cubic spline.</b> A smooth flexible curve built from cubic polynomials between knots that is constrained to be linear beyond the outer knots. Three knots use 2 df, five knots use 4 df.</p>
<p><b>Ridge regression.</b> Penalised regression that shrinks all coefficients towards zero by penalising the sum of their squares; no coefficient is set exactly to zero.</p>
<p><b>ROC curve.</b> Plot of sensitivity against 1 − specificity across all possible cutoffs of predicted risk.</p>
<p><b>Scaled Brier score.</b> 1 − Brier / Brier_max, where Brier_max is the Brier score of a non-informative model that predicts the mean incidence for everyone. It allows comparison across settings with different incidence.</p>
<p><b>Sensitivity and specificity.</b> Sensitivity is the proportion of patients with the outcome who are classified positive; specificity is the proportion without it classified negative.</p>
<p><b>Shrinkage.</b> Pulling coefficients towards zero (or predictions towards the average) to correct for overfitting. Uniform shrinkage multiplies all coefficients by one factor s between 0 and 1.</p>
<p><b>Split-sample validation.</b> Internal validation in which the data are divided once into a development part and a test part. It is inefficient and unstable compared with bootstrapping.</p>
<p><b>Stepwise selection.</b> Automated adding or removal of predictors according to a stopping rule such as p &lt; 0.05 or AIC. It produces unstable models and biased coefficients.</p>
<p><b>Testimation bias.</b> Bias in coefficients arising because predictors are selected for being significant and then estimated in the same data, so retained effects are overestimated.</p>
<p><b>Threshold probability.</b> The risk at which a clinician or patient is indifferent between acting and not acting. It equals harm / (harm + benefit).</p>
<p><b>Transportability.</b> The extent to which a model's performance holds in a different time, place, method of measurement or spectrum of patients.</p>
<p><b>Verification bias.</b> Distortion of performance estimates when only some patients receive the reference standard or outcome assessment, and selection depends on predictor values.</p>`
});
