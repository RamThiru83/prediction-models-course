registerRef({
  id: 'map',
  title: 'Course map',
  html: `
<p>The course covers the development and validation of prediction models, which is Chapters 1 to 19 of the source text. This table shows which module teaches which chapter, in plain language.</p>

<table class="data">
<thead><tr><th>Chapter</th><th>Topic in plain language</th><th>Module</th></tr></thead>
<tbody>
<tr><td>1</td><td>Why prediction models are built; the seven steps; why the number of events limits the model</td><td>1</td></tr>
<tr><td>2</td><td>Uses: public health, test ordering, treatment thresholds, intensity of treatment</td><td>1</td></tr>
<tr><td>3</td><td>Study design, outcome choice, predictor choice and reliability, sample size for predictor effects and events per variable</td><td>1 and 2</td></tr>
<tr><td>4</td><td>Statistical models: linear, logistic, Bayes' rule, naive Bayes, neural networks, trees, polytomous and survival models</td><td>3</td></tr>
<tr><td>5</td><td>Overfitting, optimism, testimation bias, parameter uncertainty, the bootstrap</td><td>4</td></tr>
<tr><td>6</td><td>Choosing between models; regression as a default; the seven-step checklist</td><td>3 and the seven-step checklist</td></tr>
<tr><td>7</td><td>Missing values: mechanisms, complete case analysis, imputation</td><td>5</td></tr>
<tr><td>8</td><td>Worked case on missing values in a large head-injury database</td><td>5 (brief illustration only)</td></tr>
<tr><td>9</td><td>Coding of predictors: dichotomisation, polynomials, splines, outliers, interpretation</td><td>6</td></tr>
<tr><td>10</td><td>Restricting candidate predictors before modelling; combining variables</td><td>7</td></tr>
<tr><td>11</td><td>Selection of main effects: stepwise methods, instability, bias, full-model alternative</td><td>8</td></tr>
<tr><td>12</td><td>Interactions and non-linearity in the multivariable model</td><td>9</td></tr>
<tr><td>13</td><td>Modern estimation: uniform shrinkage, penalised (ridge) regression, lasso</td><td>10</td></tr>
<tr><td>14</td><td>Combining data with external information</td><td>10</td></tr>
<tr><td>15</td><td>Performance: R², Brier, c statistic, calibration</td><td>11</td></tr>
<tr><td>16</td><td>Clinical usefulness: thresholds, net benefit, decision rules</td><td>12</td></tr>
<tr><td>17</td><td>Internal and external validation techniques</td><td>13</td></tr>
<tr><td>18</td><td>Presenting a model: formula, nomogram, score chart</td><td>15</td></tr>
<tr><td>19</td><td>Patterns of external validity: case-mix, coefficients, sample size for validation</td><td>14</td></tr>
</tbody></table>

<p>The Primer (Module 0) covers risk and odds, logistic regression basics, test accuracy and sampling, which the chapters assume. The Capstone applies Chapters 1 to 19 together.</p>

<div class="callout warn"><b>Outside this course</b><p>Chapters 20 and 21 (updating an existing model: recalibration of the intercept and slope, re-estimation of coefficients, extension with new predictors) and Chapters 22 to 24 (extended case studies) are not covered. This course teaches how to detect miscalibration and poor transportability, not how to repair a model by updating. Any statement here about updating is limited to noting that it exists.</p></div>
`
});
