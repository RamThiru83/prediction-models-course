registerModule({
  id: 'm08',
  num: 8,
  part: 'Development',
  title: 'Selecting main effects',
  book: 'Ch. 11',
  minutes: 70,
  summary: 'Why reducing a model with significance tests is attractive and what it costs: an unstable choice of predictors, coefficients that are too large, p-values that are too small and worse predictions, with the alternatives of a pre-specified full model and newer methods.',
  objectives: [
    'Sort valid from false reasons to drop predictors',
    'Turn AIC and BIC into p-values',
    'Trace a backward elimination by hand',
    'Show why selected predictors are unstable',
    'Calculate testimation bias for one predictor',
    'Judge a stepwise model by validated performance'
  ],
  format: 'cases',
  reading: [
    { cite: "Steyerberg EW, Eijkemans MJC, Habbema JDF (1999). Stepwise selection in small data sets: a simulation study of bias in logistic regression analysis. J Clin Epidemiol 52:935-942.", url: "https://doi.org/10.1016/s0895-4356(99)00103-1", note: "Demonstrates the overestimation of coefficients that survive stepwise selection, especially with few events per variable." },
    { cite: "Steyerberg EW, Eijkemans MJC, Harrell FE Jr, Habbema JDF (2001). Prognostic modeling with logistic regression analysis: in search of a sensible strategy in small data sets. Med Decis Making 21:45-56.", url: "https://doi.org/10.1177/0272989X0102100106", note: "Compares coding, stepwise selection and shrinkage in small samples and favours a well-coded full model with shrinkage." },
    { cite: "Heinze G, Wallisch C, Dunkler D (2018). Variable selection: a review and recommendations for the practicing statistician. Biom J 60:431-449.", url: "https://doi.org/10.1002/bimj.201700067", note: "An open-access review of selection methods and their effect on stability, bias and p-values, with pragmatic recommendations." },
    { cite: "Sun GW, Shook TL, Kay GL (1996). Inappropriate use of bivariable analysis to screen risk factors for use in multivariable analysis. J Clin Epidemiol 49:907-916.", url: "https://doi.org/10.1016/0895-4356(96)00025-x", note: "Explains why screening candidate predictors by univariable p-values wrongly discards variables." }
  ],
  essentials: `
<ul>
<li>The best start is a short list of candidate predictors chosen with subject knowledge. Then all of them go into one <b>full model</b>, and modelling becomes a matter of estimation, not testing.</li>
<li>Valid reasons to drop a predictor: it is hard or costly to collect, or its effect is tiny or implausible. False reasons: "it is not significant", "it is correlated with another predictor" and "simpler is always better".</li>
<li><b>Stepwise selection</b> adds or removes predictors one at a time by a significance rule. If it is used, backward is better than forward. The stopping rule matters more than the direction: AIC equals p &lt; 0.157 for one coefficient, and BIC gets stricter as the sample grows.</li>
<li>The predictors chosen change from sample to sample. In small data the "final model" is one of many that fit almost equally well.</li>
<li>Coefficients that survive a significance test are too large on average (<b>testimation bias</b>). The bias is worst for weak effects that are hard to detect.</li>
<li>The printed standard errors and p-values of a selected model ignore the selection, so they are too optimistic. In new women a selected model usually predicts worse than the full model.</li>
<li>Reliable selection needs about 50 events per candidate coefficient. With fewer, prefer the full model, and if you must select, use AIC and repeat the whole selection in every bootstrap sample.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth (before 37 weeks). The hospital and its data are fictional and synthetic. The team has a list of candidate predictors recorded at the booking visit. In this module it argues about whether to make the model smaller, tries stepwise selection, sees how unstable and flattering it is, and decides what to do instead. You do not need the earlier modules for this story.',
  defs: {
    'full model': 'A model that contains every candidate predictor chosen in advance, with no predictor removed by testing.',
    'stepwise selection': 'Building a model by adding or removing predictors one at a time according to a significance rule.',
    'backward elimination': 'Stepwise selection that starts with all candidates and removes the least significant one at each step.',
    'collinearity': 'Strong correlation between two or more predictors, which makes their separate coefficients imprecise.',
    'variance inflation factor': 'How many times larger the variance of a coefficient is because the predictor is correlated with the others.',
    'aic': 'Akaike\'s Information Criterion: keep a term if it adds more than 2 per degree of freedom to the model chi-square.',
    'bic': 'Bayesian Information Criterion: keep a term only if it adds more than the natural log of the sample size per degree of freedom.',
    'testimation bias': 'The overestimation of effects that are kept only because they passed a significance test.',
    'selection frequency': 'The share of bootstrap samples in which a predictor is chosen by the selection procedure.',
    'lasso': 'A fitting method that shrinks coefficients towards zero and sets some exactly to zero, so it selects and shrinks at once.'
  },
  explainers: [
    (function () {
      var B = EX.box({ l: 60, t: 56, w: 460, h: 150, xlim: [-1, 3], ylim: [0, 5], xticks: [-1, 0, 1, 2, 3], xlabel: 'Estimated log odds ratio in each study' });
      var Z = [];
      // 40 evenly spaced normal quantiles (deterministic stand-in for 40 studies)
      (function () { function qn(p) { var a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924], b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857], c = [-0.00778489400243029, -0.322396458041136, -2.40085797994012, -2.54973253934373, 4.37466414146497, 2.93816398269878], d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742], q, r; if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } if (p > 1 - 0.02425) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); } q = p - 0.5; r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); } for (var i = 0; i < 40; i++) Z.push(qn((i + 0.5) / 40)); })();
      function dots(beta, filter) {
        var kept = [], gone = [];
        Z.forEach(function (z, i) { var e = beta + 0.5 * z, row = 1.2 + (i % 5) * 0.75; if (!filter || Math.abs(e) > 0.98) kept.push([e, row]); else gone.push([e, row]); });
        return EX.pts(B, gone, { role: 'line', r: 4.5 }) + EX.pts(B, kept, { role: 'obs', r: 4.5, stagger: 0.02 });
      }
      function vbar(x, role, d) { return EX.rect(B.X(x) - 1, 50, 2, 160, { role: role, d: d }); }
      function meanMark(x, d) { return EX.line([[B.X(x), 50], [B.X(x), 210]], { role: 'pred', d: d }); }
      function gap(x0, x1, d) { return EX.line([[B.X(x0), 50], [B.X(x1), 50]], { role: 'err', w: 4, d: d }); }
      var cut = function (d) { return vbar(0.98, 'muted', d) + EX.text(B.X(0.98) - 5, 201, '0.98', { size: 's', anchor: 'end', d: d }); };
      return {
        id: 'testimation',
        title: 'Why a coefficient that passed a test is too large',
        scenes: [
          { svg: EX.svg(EX.text(30, 24, '40 small studies: true log odds ratio 1, SE 0.5', { bold: true }) + B.s + vbar(1, 'muted', 0.2) + EX.text(B.X(1) + 6, 68, 'true value 1', { size: 's', d: 0.3 }) + dots(1, false) + EX.text(30, 285, 'Illustrative (synthetic). Each dot is one study\'s estimate.', { size: 's', d: 1.2 })),
            say: 'Imagine forty small studies, each estimating the effect of bacteriuria on preterm birth. The true log odds ratio is 1. Chance moves each estimate up or down, so the dots spread from about 0 to 2.' },
          { svg: EX.svg(EX.text(30, 24, 'Keep only p < 0.05: estimate must exceed 1.96 × 0.5 = 0.98', { bold: true }) + B.s + vbar(1, 'muted') + cut(0.2) + dots(1, true) + EX.text(30, 285, '21 of 40 studies pass (in theory 52%)', { d: 1 })),
            say: 'Now keep only the estimates that reach p below 0.05. With a standard error of 0.5, an estimate must be larger than 0.98. Only about half of the studies pass: 52 per cent.' },
          { svg: EX.svg(EX.text(30, 24, 'The kept estimates average 1.39: 39% too high', { bold: true }) + B.s + vbar(1, 'muted') + cut(0) + dots(1, true) + meanMark(1.386, 0.4) + gap(1, 1.386, 1) + EX.text(B.X(1.386) + 8, 45, 'mean of kept 1.39', { size: 's', d: 0.6 }) + EX.text(30, 285, 'Mean of all 40 estimates: 1.00. Mean of the kept ones: 1.39.', { d: 1.2 })),
            say: 'The average of all forty estimates sits right on 1. The average of the kept ones is 1.39, which is 39 per cent too high. The small estimates that would pull it down were thrown away. The red bar is that error.' },
          { svg: EX.svg(EX.text(30, 24, 'A weaker effect: true 0.5, same SE 0.5', { bold: true }) + B.s + vbar(0.5, 'muted') + cut(0) + dots(0.5, true) + meanMark(1.225, 0.6) + gap(0.5, 1.225, 1.1) + EX.text(B.X(1.225) + 8, 45, 'mean of kept 1.23', { size: 's', d: 0.8 }) + EX.text(30, 285, '7 of 40 pass (in theory 17%): 145% too high', { d: 1.3 })),
            say: 'Now take a weaker effect, a log odds ratio of 0.5, with the same standard error. Only 17 per cent of studies pass the test. Those that pass report about 1.23 on average, more than double the truth.' },
          { svg: EX.svg(EX.text(30, 24, 'A strong effect: true 1.5, same SE 0.5', { bold: true }) + B.s + vbar(1.5, 'muted') + cut(0) + dots(1.5, true) + meanMark(1.637, 0.6) + gap(1.5, 1.637, 1.1) + EX.text(B.X(1.637) + 8, 45, 'mean of kept 1.64', { size: 's', d: 0.8 }) + EX.text(30, 285, '34 of 40 pass (in theory 85%): only 9% too high', { d: 1.3 })),
            say: 'With a strong effect of 1.5, 85 per cent of studies pass, and the kept estimates average 1.64, only 9 per cent too high. The filter hardly cuts anything away, so it hardly changes the average.' },
          { svg: EX.svg(EX.text(280, 110, 'Stepwise selection applies this filter to every predictor', { bold: true, anchor: 'middle' }) + EX.text(280, 146, 'Weak predictors stay in only when they happen to look strong', { anchor: 'middle', d: 0.6 }) + EX.text(280, 172, 'so their coefficients come out too large', { anchor: 'middle', d: 0.9 }) + EX.text(280, 208, 'Larger samples and a full model reduce the problem', { anchor: 'middle', d: 1.5 })),
            say: 'Stepwise selection applies this filter to every predictor. A weak predictor stays in only when it happens to look strong, so its coefficient comes out too large. Larger samples and a full model without testing reduce the problem.' }
        ]
      };
    })()
  ],
  cases: [
    {
      id: 'c1',
      title: 'Should the model be smaller?',
      aim: 'sort the valid reasons for dropping predictors from the false ones, and judge collinearity.',
      minutes: 15,
      need: `
<p>The previous module cut the candidate list down without looking at the outcome. If that is done well, the next step is simple: put all the candidates into one <b>full model</b> and estimate their coefficients. Checks of interactions and non-linear terms come later (Module 9).</p>
<p><b>Valid reasons to drop a predictor.</b> (1) It is impractical: costly, slow, or not available when the model will be used. (2) Its effect is tiny or biologically implausible. (3) In discovery research, such as choosing markers from a large gene panel, finding the predictive markers is itself the aim; that is exploration, not prediction.</p>
<p><b>False reasons.</b></p>
<ul>
<li>"It is not significant." Prediction is estimation, not hypothesis testing. A p-value above 0.05 is not evidence of no effect, especially in a small sample, for a rare but strong predictor, or for a predictor known from earlier studies.</li>
<li>"Parsimony." A full model asks the data one question: what are the coefficients? A reduced model asks two: which predictors can go, and what are the coefficients of the rest, given that the others went? That is more complex, not less.</li>
<li>"Collinearity." <b>Collinearity</b> means predictors are strongly correlated. It makes their separate coefficients imprecise, but the predictions can still be reliable.</li>
</ul>
<p>The <b>variance inflation factor</b> (VIF) shows how much correlation widens a coefficient's variance. For two predictors with correlation r, VIF = 1 ÷ (1 − r²). Example: booking height and weight correlate at about r = 0.5, so VIF = 1 ÷ (1 − 0.25) = 1.33, a 33% wider variance and no real problem. Trouble starts near r = 0.8 or a VIF above 10. When two measures are very close, combining them (for example a mean arterial pressure from systolic and diastolic readings) is often better than choosing one.</p>`,
      scenario: `<p>Illustrative (synthetic). At a team meeting, five people give reasons to make the booking-visit model smaller. The statistician also notices that systolic and diastolic blood pressure at booking are correlated, and that haemoglobin and haematocrit, both measured on the same blood sample, are almost the same measure.</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'Drop a predictor because it is impractical or implausible, not because it is non-significant or correlated with another.'
    },
    {
      id: 'c2',
      title: 'How stepwise selection works',
      aim: 'describe forward, backward and all-subsets selection, and translate AIC and BIC into p-values.',
      minutes: 15,
      need: `
<p><b>Stepwise selection</b> builds a model by testing. <b>Forward</b> selection starts with no predictors and adds the most significant one, step by step. <b>Backward elimination</b> starts with the full model and removes the least significant predictor, re-fits, and repeats. Combined methods switch between the two. <b>All possible subsets</b> fits every combination: with k candidates there are 2<sup>k</sup> models (10 candidates give 1,024), so it tests very many models and overfits easily.</p>
<p>If you use stepwise selection, prefer backward: you see the full model first, and correlated predictors are judged together. In a forward search, neither of two correlated predictors may ever enter.</p>
<p><b>The stopping rule matters more than the direction.</b> Each term adds an amount to the model chi-square (χ²). The rule says how large that amount must be.</p>
<ul>
<li><b>p &lt; 0.05:</b> for 1 degree of freedom (df), χ² must exceed 3.84.</li>
<li><b>AIC:</b> χ² must exceed 2 × df. For 1 df the chance that pure noise exceeds 2 is 0.157, so AIC equals p &lt; 0.157. For 2 df the threshold is 4 (p = 0.135), for 3 df it is 6 (p = 0.112).</li>
<li><b>BIC:</b> χ² must exceed df × ln(n). For n = 200, ln(200) = 5.30, which is p = 0.021 for 1 df. For n = 2,000, ln(2,000) = 7.60, which is p = 0.006. BIC gets stricter as the sample grows and can remove too much in small samples (underfitting).</li>
</ul>
<p>There is nothing special about 0.05. In small datasets with an agreed candidate list, AIC or even p &lt; 0.20 or 0.50 keeps weak true predictors more often and gives better predictions.</p>`,
      scenario: `<p>Illustrative (synthetic). The team has 2,000 women and 12 candidate predictors with 1 df each. A visiting statistician offers three programs: one runs forward selection, one backward elimination, one all-subsets regression. Each lets you choose p &lt; 0.05, AIC or BIC.</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'Backward elimination with a liberal rule such as AIC is the least harmful stepwise choice; the rule decides far more than the direction.'
    },
    {
      id: 'c3',
      title: 'An unstable choice and inflated coefficients',
      aim: 'see that the selected predictors change from sample to sample, and calculate how much selection inflates a coefficient.',
      minutes: 20,
      need: `
<p><b>Instability.</b> Many sets of predictors fit almost equally well, so a slightly different sample gives a different "final model". In the book's GUSTO-I example, backward selection at p &lt; 0.05 in one small subsample of 429 patients kept three predictors. That same set was found in only 7 of 110 other small subsamples. Statements such as "the only independent predictors were A, B and C", or reading meaning into the order in which predictors entered, overinterpret chance.</p>
<p>You can see this in your own data with the bootstrap: repeat the selection in many resamples and record each predictor's <b>selection frequency</b>. A stable model would reproduce itself in most resamples.</p>
<p><b>Testimation bias.</b> A coefficient that is first tested and then kept only if significant is too large on average. Worked example: true log odds ratio 1, standard error (SE) 0.5. Significance needs an estimate above 1.96 × 0.5 = 0.98. Estimates follow a normal curve with mean 1 and SD 0.5, so about 52 of every 100 studies pass. The 52 that pass average 1.39, not 1: 39% too high.</p>
<p>For the share that passes and their mean, with cut-off c = 1.96 × SE:</p>
<div class="formula">a = (c − β) ÷ SE,  b = (−c − β) ÷ SE<br>share kept = [1 − Φ(a)] + Φ(b)<br>mean kept = β + SE × [φ(a) − φ(b)] ÷ share kept</div>
<p>Here Φ is the area under the standard normal curve to the left of a value and φ is the height of the curve there. The bias is largest when β ÷ SE is around 0.6, and small once β ÷ SE is above about 3. A larger sample has a smaller SE, so the same effect is less biased.</p>
<div data-explainer="testimation"></div>`,
      scenario: `<p>Illustrative (synthetic). The team runs backward elimination at p &lt; 0.05 in its development data and gets a model with five predictors. A colleague repeats it in a second sample from the same clinics and gets a different five. The team also wonders how much the coefficient for bacteriuria (true log odds ratio 0.9 in these synthetic data) is inflated when it is kept only if significant.</p>`,
      widgets: `<div data-widget="testimationSim" data-try="Set the true coefficient to 0.9 and keep SE 0.5 and threshold 0.05, then lower the SE to 0.25 and watch the bias in the selected estimate shrink."></div>
<div data-widget="stepwiseInstability" data-try="Keep sample size 600 and the rule Backward, p &lt; 0.05, press Run 100 bootstraps, and note how rarely the original model is reproduced."></div>`,
      tasks: [4, 5],
      takeaway: 'Stepwise selection picks an unstable set of predictors and overstates the effects it keeps, most of all for weak predictors in small samples.'
    },
    {
      id: 'c4',
      title: 'What selection does to predictions, and what to do instead',
      aim: 'compare a selected model with the full model on validated performance, and plan a better strategy.',
      minutes: 20,
      need: `
<p><b>Wrong standard errors and p-values.</b> The software prints standard errors as if the final model had been chosen in advance. It ignores the selection. So the confidence intervals are too narrow and the p-values too small. Do not trust the p-value of a predictor in a stepwise model.</p>
<p><b>Worse predictions.</b> Dropping weak predictors lowers the apparent performance only a little. What matters is performance in new women, measured by bootstrap validation (repeating the whole selection in each resample) or in external data. There, selected models usually do worse than the full model. In the book's GUSTO-I subsample of 429 patients, the optimism-corrected Nagelkerke R² was 15.1% for the full 8-predictor model and 11.7% for the 3-predictor stepwise model.</p>
<p><b>Noise variables.</b> Selection is meant to remove predictors with no true effect. It does remove most of them, but it also throws away true predictors. Leaving out a true predictor can cost more than keeping a noise variable.</p>
<p><b>How many events?</b> Events per variable (EPV) = events ÷ candidate coefficients. An EPV of 10 is a lower limit for a model fixed in advance. For reliable selection the book suggests about 50. Example: 15 candidate coefficients need 15 × 50 = 750 events; at 12% preterm births that is 750 ÷ 0.12 = 6,250 women.</p>
<p><b>Better options.</b> Keep the candidate list short with subject knowledge and fit the full model. If a smaller model is needed for practical reasons, use AIC and bootstrap the whole selection. Newer methods include the <b>Lasso</b>, which shrinks coefficients and sets some to zero, and Bayesian model averaging (see the notes).</p>`,
      scenario: `<p>Illustrative (synthetic). The team takes a random 600 women with complete data from ptb_dev (73 preterm births) and compares the full 14-term model with a backward p &lt; 0.05 model, using 200 bootstrap samples. Meanwhile a regional journal sends it a stepwise preterm birth model to review.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'Judge a selected model by its validated performance against the full model; usually the full model with a short, knowledge-based candidate list predicts better.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Reasons to reduce a model, collinearity and parsimony',
      html: `
<p>Specifying the model is the hardest part of prediction modelling, and in small datasets "which predictors are important?" has no reliable answer. If the candidate list is limited beforehand, modelling becomes an estimation problem. Valid reasons to reduce while modelling: <b>practicality</b> (predictors unavailable or costly in future patients), <b>very small or implausible effects</b> (book example: production characteristics of heart valves when predicting valve fracture), and <b>discovery</b> in genetic or proteomic panels, which is exploratory.</p>
<p><b>Collinearity</b> makes coefficients of correlated predictors imprecise (correlation above 0.8 or VIF above 10 as a rough warning). But correlation is why multivariable models are used at all; most correlations are below 0.5 (book example: in GUSTO-I the strongest was height with weight, r = 0.5, the rest about 0.1 to 0.2); and age and age² correlate above 0.9 yet both coefficients are estimated reliably. Combining correlated predictors may beat choosing one: for diastolic and systolic pressure (r = 0.62 in one study), a mean such as (2 × DBP + SBP) ÷ 3 may be better, though subject knowledge (systolic pressure matters more for cardiovascular risk) also counts.</p>
<table class="data">
<tr><th>Argument for a smaller model</th><th>Verdict</th></tr>
<tr><td>Larger models are less practical</td><td>Valid</td></tr>
<tr><td>Some effects are very small or implausible</td><td>Valid</td></tr>
<tr><td>Non-significant variables should be excluded</td><td>False: significance is not relevant for estimation, especially with supporting subject knowledge</td></tr>
<tr><td>Collinearity precludes reliable predictions</td><td>False: coefficients are unstable, predictions need not be</td></tr>
<tr><td>Parsimony</td><td>False when models are selected from patterns in the data; may hold when comparing pre-specified models</td></tr>
</table>
<p>Simulations with true noise variables in a model show only a limited loss of predictive ability. Book example: shock in GUSTO-I is uncommon but strong, and may be non-significant in a small sample.</p>
<p class="src">Source: Ch. 11, §11.1</p>`
    },
    {
      id: 'n2',
      title: 'Stepwise variants and stopping rules',
      html: `
<p>Stepwise methods use the F test (linear regression) or the likelihood ratio, Wald or score statistic (logistic and Cox regression). Forward, backward and combined variants exist; all possible subsets can find combinations the others miss but examines very many models. Backward is preferred: the analyst sees the full model, and correlated variables may stay in.</p>
<table class="data">
<tr><th>AIC: df</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
<tr><td>χ² must exceed 2 × df</td><td>2</td><td>4</td><td>6</td><td>8</td><td>10</td></tr>
<tr><td>Equivalent p</td><td>0.157</td><td>0.135</td><td>0.112</td><td>0.092</td><td>0.075</td></tr>
</table>
<table class="data">
<tr><th>BIC (1 df): n</th><th>20</th><th>50</th><th>100</th><th>200</th><th>500</th><th>1,000</th><th>2,000</th></tr>
<tr><td>χ² must exceed ln(n)</td><td>3.0</td><td>3.9</td><td>4.6</td><td>5.3</td><td>6.2</td><td>6.9</td><td>7.6</td></tr>
<tr><td>Equivalent p</td><td>0.083</td><td>0.048</td><td>0.032</td><td>0.021</td><td>0.013</td><td>0.009</td><td>0.006</td></tr>
</table>
<p>In survival data the effective sample size (such as the number of events) is used for n. AIC has been recommended; higher p-values (0.20 or 0.50) gave more power for weak predictors and better predictions in small datasets with an established candidate set. BIC gives smaller models and may underfit in small samples.</p>
<p><b>Advantages</b> of stepwise methods: easy to run; relatively objective, so the whole strategy can be replayed in bootstrap samples; usually achieves a smaller model (in very large data such as GUSTO-I a stricter p &lt; 0.01 may be used). With multiple imputation, base each step on pooled p-values from the full model fitted to all imputed datasets. In small datasets few predictors reach small p-values, which argues for AIC or a higher p.</p>
<p class="src">Source: Ch. 11, §11.2-11.3, Tables 11.1-11.2</p>`
    },
    {
      id: 'n3',
      title: 'Instability of selection',
      html: `
<div class="callout book"><b>Book example: GUSTO-I small subsamples</b>
<p>Backward selection (p &lt; 0.05) in subsample 5 (n = 429) chose age over 65 (A65), hypotension (HYP) and shock (SHO). Over the 111 subsamples, selection percentages were: A65 80%, SHO 53%, HYP 47%, high-risk infarct location 29%, heart rate above 80 23%, sex 22%, diabetes 13%, time to relief of pain 11%. The set of three was reproduced in only 7 of the 110 other subsamples (Table 11.3).</p>
<table class="data">
<tr><th>Mean predictors kept of 8 (± SD)</th><th>p &lt; 0.05</th><th>AIC</th><th>p &lt; 0.5</th></tr>
<tr><td>Small subsamples</td><td>2.8 ± 1.1</td><td>4.2 ± 1.1</td><td>6.3 ± 1.2</td></tr>
<tr><td>Large subsamples</td><td>4.8 ± 1.1</td><td>6.0 ± 1.0</td><td>7.0 ± 0.9</td></tr>
<tr><td>16 large regions (≥ 2,000 patients, 178 events on average)</td><td>6.6 ± 1.0</td><td>7.1 ± 0.8</td><td>7.8 ± 0.4</td></tr>
</table><p>Table 11.4.</p></div>
<p>Interpreting the order of entry, or the ranking of p-values, is even worse than naming "the independent predictors". Instability depends on the ratio of candidates to events: EPV 10 is a lower bound for a pre-specified model; reliable selection needs EPV about 50 (400 events for 8 candidates). The full GUSTO-I data (2,851 events in 40,830 patients) meet this, which is exceptional. Bootstrap selection frequencies show the instability in any dataset.</p>
<p class="src">Source: Ch. 11, §11.4.1</p>`
    },
    {
      id: 'n4',
      title: 'Biased coefficients and wrong variability',
      html: `
<p>Over subsamples, many selected coefficients are exactly zero, with a gap between zero and the smallest selected value; the gap is smaller with AIC or p &lt; 0.5. In GUSTO-I simulations, selection at p &lt; 0.05 gave substantial bias: at EPV 10 it exceeded 50% for 3 predictors. With p &lt; 0.50 the bias was much smaller, and in the full model it was small at EPV 10 or more and below 20% for every predictor even at EPV 3. Strong predictors (age) were selected nearly always and had little bias; weak ones (diabetes), when selected, were biased upward by more than 100% at low EPV. Bias peaks at β ÷ SE about 0.6. Book example (Ch. 5): β = 1, SE 0.5 gives 52% significant and a mean selected estimate of 1.39.</p>
<table class="data">
<tr><th>SE, p &lt; 0.05 models</th><th>A65</th><th>Sex</th><th>DIA</th><th>HYP</th><th>HRT</th><th>HIG</th><th>SHO</th><th>TTR</th></tr>
<tr><td>Empirical, unconditional</td><td>0.87</td><td>0.55</td><td>0.53</td><td>0.98</td><td>0.55</td><td>0.77</td><td>1.51</td><td>0.46</td></tr>
<tr><td>Empirical, conditional</td><td>0.52</td><td>0.27</td><td>0.36</td><td>0.47</td><td>0.29</td><td>0.62</td><td>0.75</td><td>0.27</td></tr>
<tr><td>Printed, conditional</td><td>0.57</td><td>0.48</td><td>0.55</td><td>0.61</td><td>0.48</td><td>0.59</td><td>0.88</td><td>0.62</td></tr>
</table>
<p>Unconditional counts a coefficient as zero when not selected; conditional uses only samples where it was selected. Printed SEs are on average somewhat larger than the empirical conditional ones but smaller than the unconditional ones (Table 11.5). Bootstrapped predictions were far more variable than a pre-specified model suggests. Testimation bias plus understated variability exaggerates significance.</p>
<p class="src">Source: Ch. 11, §11.4.2-11.4.4</p>`
    },
    {
      id: 'n5',
      title: 'Predictive quality, noise variables and univariable screening',
      html: `
<table class="data">
<tr><th>Book example: R² (%), GUSTO-I subsample 5</th><th>Apparent</th><th>Bootstrap</th><th>Test</th><th>Optimism</th><th>Corrected</th></tr>
<tr><td>Full model, 8 predictors</td><td>22.7</td><td>24.7</td><td>17.2</td><td>7.6</td><td>15.1</td></tr>
<tr><td>Stepwise p &lt; 0.05, 3 predictors</td><td>17.6</td><td>18.7</td><td>12.7</td><td>5.9</td><td>11.7</td></tr>
</table>
<p>Table 11.6 (Nagelkerke R²; selection replayed in each bootstrap sample). Derksen and Keselman found 30% to 70% of stepwise-selected predictors were pure noise; the number depends on the noise candidates present and their correlation. Restricting candidates by subject knowledge reduces noise at the source.</p>
<table class="data">
<tr><th>Book example: GUSTO-I, test n = 20,318</th><th>17 true</th><th>17 true, p &lt; 0.05</th><th>8 true + 9 noise</th><th>Same, p &lt; 0.05</th></tr>
<tr><td>Noise in model</td><td>0</td><td>0</td><td>9</td><td>0.5</td></tr>
<tr><td>True in model</td><td>17</td><td>5.9</td><td>8</td><td>4.8</td></tr>
<tr><td>c in test data</td><td>0.784</td><td>0.762</td><td>0.753</td><td>0.746</td></tr>
</table>
<p>Table 11.7 (means over 23 large subsamples). Omitting a true predictor may be worse than including noise. Ambler and colleagues found stepwise with AIC the best stopping rule.</p>
<p><b>Univariable pre-selection</b> (p &lt; 0.05 to 0.5) is a variant of stepwise selection in which only screened candidates are considered later. In the book's hypothetical illustration (Tables 11.8-11.9), screening loses predictors 6 to 8 and backward selection leaves 1, 2, 3; standard backward selection from all eight can keep predictor 6 as well. Pros: it removes predictors that cannot be estimated (shock in tiny GUSTO-I subsamples) and lowers computation. Con: it fixes none of the problems. Informal screening (eyeballing plots or cross-tables against the outcome) also adds to overfitting. <b>Testing within domains</b> has appeal but the same problems; forcing each domain to stay, combining variables within a cluster, or using prior studies can help.</p>
<p class="src">Source: Ch. 11, §11.5-11.6</p>`
    },
    {
      id: 'n6',
      title: 'Modern selection methods and conclusions',
      html: `
<p><b>Bootstrap selection</b> keeps predictors chosen in more than 50% of bootstrap samples; evidence of benefit is unconvincing, and the result usually resembles the original stepwise model. <b>Bagging</b> averages predictions from models built in bootstrap resamples, which helps when small data changes cause large model changes; <b>boosting</b> up-weights observations that are hard to classify.</p>
<p><b>Bayesian model averaging</b> (BMA) accounts for model uncertainty. With p candidates there are up to 2<sup>p</sup> models; the averaged estimate is</p>
<div class="formula">E(β | D) = Σ over models β<sub>model</sub> × Pr(model | D)</div>
<p>"Occam's window" drops models far less probable than the best (for example over 20 times less likely). In simulations with 25 noise variables and no true predictors, stepwise sometimes kept two or more noise variables while BMA kept none; with 2 strong predictors and 23 noise variables, stepwise kept up to 5 noise variables. Book example: in the Framingham coronary data, Occam's window kept 6 of 8,192 models (5 or 6 predictors, posterior probabilities 3% to 65%); the best backward p &lt; 0.05 model had 8 variables, and BMA predicted somewhat better.</p>
<p>The <b>Lasso</b> maximises the likelihood with the sum of absolute coefficients bounded, shrinking some to exactly zero; it was promising in simulation and in GUSTO-I subsamples (Module 10).</p>
<p><b>Conclusions.</b> Overfitting begins with too many candidates, and stepwise selection does not solve it. Limit selection with subject knowledge, especially in small data; use better algorithms (Lasso), bootstrapping and Bayesian methods; analyse larger datasets. Faraway called these costs "the cost of data analysis".</p>
<p class="src">Source: Ch. 11, §11.7-11.8</p>`
    }
  ],
  keyPoints: [
    'A full model with a short, knowledge-based candidate list asks the data one question; a selected model asks two.',
    'Practicality and implausible effects are valid reasons to drop a predictor; non-significance, collinearity and parsimony are not.',
    'Prefer backward over forward selection; AIC equals p < 0.157 for 1 df, and BIC equals a p-value that falls with n (0.021 at n = 200, 0.006 at n = 2,000).',
    'Selection is unstable: in GUSTO-I the 3-predictor set from one subsample reappeared in only 7 of 110 others.',
    'Coefficients kept because they were significant are too large: for β = 1 and SE 0.5, 52% pass and they average 1.39.',
    'Printed standard errors and p-values of a selected model ignore the selection and are too optimistic.',
    'Validated performance of a stepwise model is usually below the full model (corrected R² 11.7% versus 15.1% in the book example).',
    'Reliable selection needs about 50 events per candidate; otherwise fit the full model, or use AIC and bootstrap the whole procedure.'
  ],
  quiz: [
    {
      q: 'In the team\'s model, previous preterm birth has p = 0.09 in the full model fitted to 400 women. It is a well-known strong predictor in earlier studies. What should the team do?',
      options: [
        'Remove it, because it is not significant at 5%.',
        'Keep it: prediction is estimation, and a p-value above 0.05 in a small sample is not evidence of no effect.',
        'Remove it and replace it with a predictor that is significant.',
        'Keep it only if its odds ratio is above 2.'
      ],
      answer: 1,
      why: 'Non-significance does not show a zero effect, especially in a small sample and for a predictor supported by earlier research. Removing it confuses hypothesis testing with estimation. Swapping in a "significant" predictor adds testimation bias, and an odds ratio rule has no basis in the book.'
    },
    {
      q: 'Backward elimination with AIC keeps a 1-df predictor if it adds more than 2 to the model chi-square. This is the same as testing at what level?',
      options: [
        'p < 0.05',
        'p < 0.157',
        'p < 0.50',
        'p < 0.01'
      ],
      answer: 1,
      why: 'The chance that a 1-df chi-square exceeds 2 is 0.157. The 5% level needs 3.84, so AIC is more liberal. p < 0.5 is a separate, even more liberal choice, and BIC in large samples approaches 0.01 or less.'
    },
    {
      q: 'The team has 8 candidate coefficients and wants the data to choose among them reliably. About how many preterm births does it need?',
      options: [
        '80',
        '160',
        '400',
        '800'
      ],
      answer: 2,
      why: 'The book suggests about 50 events per candidate for reliable selection: 8 × 50 = 400. Eighty (EPV 10) is a lower limit for a model fixed in advance, not for selection, and 160 (EPV 20) is the level at which a pre-specified model may need little shrinkage.'
    },
    {
      q: 'The true log odds ratio of bacteriuria is 0.9 and a small study has SE 0.5. If the coefficient is reported only when p < 0.05, what happens on average to the reported value?',
      options: [
        'It is correct on average, because chance errors cancel out.',
        'It is too small, because selection removes large estimates.',
        'It is too large (about 1.35), because only estimates above 0.98 are kept.',
        'It is too large only if the sample is very large.'
      ],
      answer: 2,
      why: 'Only estimates above 1.96 × 0.5 = 0.98 pass, about 44% of them, and they average about 1.35, 50% above 0.9. Errors cancel only if all estimates are kept. Selection removes small estimates, not large ones, and bias falls as the sample grows.'
    },
    {
      q: 'In a bootstrap comparison, the stepwise model had optimism in c of 0.044 and the full model 0.044, with optimism-corrected c 0.707 and 0.727. Which conclusion is right?',
      options: [
        'The two models are equal, because their optimism is the same.',
        'The stepwise model is better, because it is smaller.',
        'The full model is expected to predict better in new women, because its corrected c is higher.',
        'The comparison is invalid, because stepwise selection cannot be bootstrapped.'
      ],
      answer: 2,
      why: 'The optimism-corrected value is the one to compare, and the full model is ahead. Equal optimism does not mean equal performance, because the stepwise model started lower. Stepwise selection can and should be replayed in every bootstrap sample; that is an advantage of its objectivity.'
    },
    {
      q: 'With 10 candidate predictors, how many models does an all-possible-subsets search examine, and how many if 4 predictors are forced to stay in?',
      options: [
        '100 and 36',
        '1,024 and 64',
        '512 and 32',
        '10 and 6'
      ],
      answer: 1,
      why: 'Each predictor is in or out, so there are 2^10 = 1,024 models. With 4 forced in, only 6 vary: 2^6 = 64. Squaring the number (100) or counting the predictors (10) misses that every combination is a separate model, which is why all-subsets regression overfits so easily.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Sort the team\'s arguments',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). At the meeting the team hears five reasons to make the booking model smaller:</p>
<ol>
<li>"Cervical length needs a scan that most of our clinics do not have."</li>
<li>"Height had p = 0.31, so it adds nothing."</li>
<li>"BMI and weight are correlated, so the model cannot be trusted with both."</li>
<li>"Whether the woman conceived in the monsoon season has no plausible link with preterm birth in our setting."</li>
<li>"Occam's razor: the simplest model is always the best."</li>
</ol>`,
      questions: [
        '<b>(a)</b> Label each argument valid or false.',
        '<b>(b)</b> For each false argument, explain in one or two sentences why it fails.',
        '<b>(c)</b> In what situation can parsimony be a sound principle?'
      ],
      answer: `<p><b>(a)</b> 1 valid (practicality: not available where the model will be used). 2 false. 3 false. 4 valid (implausible effect, judged before seeing the outcome data). 5 false.</p>
<p><b>(b)</b> 2: a p-value of 0.31 is not evidence of a zero effect; prediction is about estimation, and keeping a weak predictor costs little. 3: collinearity makes the separate coefficients of BMI and weight imprecise, but the predictions from the model can still be reliable; if they measure almost the same thing, choose or combine on subject grounds, not by testing. 5: a reduced model chosen from the data asks two questions (which predictors, and their coefficients given the selection), so it is more complex, not simpler, and its coefficients are biased by the selection.</p>
<p><b>(c)</b> When two theories or models are specified in advance and compared, preferring the simpler one is reasonable. It fails when the "simple" model was found by searching the data.</p>`
    },
    {
      id: 't1',
      title: 'How much does collinearity matter?',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). In the booking data, height and weight correlate at r = 0.50, systolic and diastolic blood pressure at r = 0.62, and haemoglobin and haematocrit at r = 0.95. Variance inflation factor for two predictors: VIF = 1 ÷ (1 − r²).</p>`,
      questions: [
        '<b>(a)</b> Calculate the VIF for each pair.',
        '<b>(b)</b> Which pair, if any, passes the rough warning level of VIF 10?',
        '<b>(c)</b> One woman has blood pressure 130/80 mmHg. Calculate (2 × DBP + SBP) ÷ 3 and say why a single combined measure may be better than choosing one reading.',
        '<b>(d)</b> What would you do with haemoglobin and haematocrit?'
      ],
      answer: `<p><b>(a)</b> Height and weight: r² = 0.25, VIF = 1 ÷ 0.75 = 1.33. Blood pressure: r² = 0.3844, VIF = 1 ÷ 0.6156 = 1.62. Haemoglobin and haematocrit: r² = 0.9025, VIF = 1 ÷ 0.0975 = 10.3.</p>
<p><b>(b)</b> Only haemoglobin with haematocrit (10.3). A VIF of 1.33 or 1.62 widens the variance by 33% or 62%, which is no reason to drop anything.</p>
<p><b>(c)</b> (2 × 80 + 130) ÷ 3 = 290 ÷ 3 = 96.7 mmHg. A combined measure uses the information in both readings with one coefficient, avoids two imprecise coefficients, and avoids a data-driven choice between them. Subject knowledge may still favour one reading.</p>
<p><b>(d)</b> They measure almost the same thing. Choose one on practical grounds (haemoglobin is cheaper and routinely measured at booking), before looking at the outcome. The decision is about practicality and redundancy, not about which one is "significant".</p>`
    },
    {
      id: 't2',
      title: 'Stopping rules and the number of models',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The team has 2,000 women and 12 candidate predictors with 1 df each, plus one predictor (age) that would use 2 df if coded with a squared term.</p>`,
      questions: [
        '<b>(a)</b> What chi-square must a 1-df predictor add under p &lt; 0.05, AIC and BIC (n = 2,000)? Give the equivalent p-value for each.',
        '<b>(b)</b> Repeat (a) for the 2-df age term under AIC.',
        '<b>(c)</b> How many models would all-possible-subsets regression examine with the 12 one-df candidates? How many if 4 are forced in?',
        '<b>(d)</b> Which rule would you choose for this dataset, and why?'
      ],
      answer: `<p><b>(a)</b> p &lt; 0.05: χ² above 3.84 (p = 0.05). AIC: χ² above 2 × 1 = 2, p = 0.157. BIC: χ² above ln(2,000) = 7.60, p = 0.006.</p>
<p><b>(b)</b> AIC with 2 df: χ² above 2 × 2 = 4, which is p = 0.135 for a 2-df chi-square.</p>
<p><b>(c)</b> 2<sup>12</sup> = 4,096 models. With 4 forced in, 2<sup>8</sup> = 256 models. Every extra model is another chance to fit noise.</p>
<p><b>(d)</b> If selection is needed at all, AIC with backward elimination: it is more liberal than p &lt; 0.05, so weak true predictors are dropped less often, and Ambler and colleagues found it the best stopping rule. BIC at n = 2,000 is very strict (p = 0.006) and would remove true but modest predictors. Better still, fit the full model if the candidates were chosen with subject knowledge.</p>`
    },
    {
      id: 't3',
      title: 'Trace a backward elimination by hand',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). The full model in 2,000 women gives these Wald chi-squares. Assume, for simplicity, that they do not change when other terms are removed (in practice they do, which is why the model is re-fitted after each step).</p>
<table class="data">
<tr><th>Term</th><th>df</th><th>Wald χ²</th></tr>
<tr><td>Previous preterm birth</td><td>1</td><td>30.2</td></tr>
<tr><td>Maternal age (with squared term)</td><td>2</td><td>24.5</td></tr>
<tr><td>Chronic hypertension</td><td>1</td><td>13.8</td></tr>
<tr><td>Bacteriuria</td><td>1</td><td>7.1</td></tr>
<tr><td>Tobacco use</td><td>1</td><td>5.0</td></tr>
<tr><td>Short inter-pregnancy interval</td><td>1</td><td>3.2</td></tr>
<tr><td>First pregnancy</td><td>1</td><td>2.4</td></tr>
<tr><td>Low socio-economic status</td><td>1</td><td>1.1</td></tr>
<tr><td>Antenatal visits</td><td>1</td><td>0.7</td></tr>
<tr><td>Conceived in monsoon</td><td>1</td><td>0.3</td></tr>
</table>`,
      questions: [
        '<b>(a)</b> Which terms remain under p &lt; 0.05, AIC, BIC (n = 2,000) and p &lt; 0.5? (Thresholds for 2 df: 5.99, 4, 15.2 and 1.39.)',
        '<b>(b)</b> A short inter-pregnancy interval has a well-established effect on preterm birth. Under which rules is it lost, and what does that tell you?',
        '<b>(c)</b> Why must the model be re-fitted after each removal in real data?'
      ],
      answer: `<p><b>(a)</b> Thresholds for 1 df: 3.84 (p &lt; 0.05), 2 (AIC), 7.60 (BIC), 0.455 (p &lt; 0.5). For age (2 df): 5.99, 4, 2 × 7.60 = 15.2 and 1.39; age passes all four.</p>
<ul>
<li><b>p &lt; 0.05:</b> previous preterm birth, age, hypertension, bacteriuria (7.1), tobacco (5.0). Five terms, 6 df.</li>
<li><b>AIC:</b> the same plus short interval (3.2) and first pregnancy (2.4). Seven terms, 8 df.</li>
<li><b>BIC:</b> previous preterm birth, age (24.5 &gt; 15.2), hypertension (13.8). Bacteriuria (7.1 &lt; 7.60) goes. Three terms, 4 df.</li>
<li><b>p &lt; 0.5:</b> all except conceived in monsoon (0.3): nine terms, 10 df.</li>
</ul>
<p><b>(b)</b> It is lost under p &lt; 0.05 and BIC. A true predictor with a modest χ² in this sample is dropped by the stricter rules. The rule, not the biology, decided its fate; with a different sample it might have stayed. Prior knowledge is a good reason to keep it whatever its p-value.</p>
<p><b>(c)</b> Correlated predictors share information. When one is removed, part of its effect moves to the others, so their chi-squares change. A term that was weak may become strong, or the reverse, so the order of removal can change the final model.</p>`
    },
    {
      id: 't4',
      title: 'How much is the bacteriuria effect inflated?',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). In the synthetic data the true log odds ratio for bacteriuria is 0.9 (odds ratio 2.46). In a small study the SE is 0.5; in a larger one it is 0.25. The coefficient is reported only if p &lt; 0.05. Use: Φ(0.16) = 0.5636, φ(0.16) = 0.3939, Φ(−3.76) = 0.0001, φ(−3.76) = 0.0003, Φ(−1.64) = 0.0505, φ(−1.64) = 0.1040, and treat values beyond ±5 as zero.</p>`,
      questions: [
        '<b>(a)</b> For SE 0.5, find the cut-off, a and b, the share of studies that report the coefficient, and the mean reported value.',
        '<b>(b)</b> Express the bias as a percentage and as an odds ratio.',
        '<b>(c)</b> Repeat for SE 0.25.',
        '<b>(d)</b> Check both results in the testimation widget (true coefficient 0.9, threshold 0.05, SE 0.5 and then 0.25). Explain why the bias falls.'
      ],
      answer: `<p><b>(a)</b> Cut-off = 1.96 × 0.5 = 0.98. a = (0.98 − 0.9) ÷ 0.5 = 0.16; b = (−0.98 − 0.9) ÷ 0.5 = −3.76. Share = (1 − 0.5636) + 0.0001 = 0.4365, about 44%. Mean = 0.9 + 0.5 × (0.3939 − 0.0003) ÷ 0.4365 = 0.9 + 0.5 × 0.9017 = 0.9 + 0.451 = 1.35.</p>
<p><b>(b)</b> 1.35 ÷ 0.9 − 1 = 0.50, so 50% too high. As odds ratios: e<sup>1.35</sup> = 3.86 instead of e<sup>0.9</sup> = 2.46.</p>
<p><b>(c)</b> Cut-off = 1.96 × 0.25 = 0.49. a = (0.49 − 0.9) ÷ 0.25 = −1.64; b = (−0.49 − 0.9) ÷ 0.25 = −5.56, treated as zero. Share = 1 − 0.0505 = 0.9495, about 95%. Mean = 0.9 + 0.25 × 0.1040 ÷ 0.9495 = 0.9 + 0.25 × 0.1095 = 0.927. Bias 0.927 ÷ 0.9 − 1 = 3%.</p>
<p><b>(d)</b> The widget's simulated values are close (about 44% and 1.35; about 95% and 0.93). β ÷ SE rises from 1.8 to 3.6. When nearly all estimates pass, the filter removes almost nothing, so the average is hardly changed. A smaller SE (a larger sample) is the cure; the book notes the bias is largest near β ÷ SE of 0.6.</p>`
    },
    {
      id: 't5',
      title: 'Watch selection fall apart in the bootstrap',
      level: 'Analyse',
      scenario: `<p>Use the stepwise instability widget. It uses women with complete data in <b>ptb_dev</b> (1,548 women, 182 preterm births) and 14 candidate terms (15 coefficients, because age has a squared term). In the synthetic truth, previous preterm birth (log odds ratio 1.5), chronic hypertension (0.9), bacteriuria (0.9), short interval (0.7), tobacco (0.6), the age curve and low haemoglobin (0.45 per g/dL below 11) have real effects; first pregnancy (0.35), low BMI (0.12 per unit below 20) and low socio-economic status (0.12) have weak effects. Antenatal visits, the baby's sex, conception in the monsoon and height have no effect. Results vary a little between runs.</p>`,
      questions: [
        '<b>(a)</b> Keep sample size 600 and the rule "Backward, p &lt; 0.05". Press "Run 100 bootstraps". Record the number of events, the mean number of terms kept, the share of bootstraps that reproduce the original model, and the selection frequency of previous preterm birth and of the four noise terms.',
        '<b>(b)</b> Change the rule to "Backward, AIC-like (p ≈ 0.157)" and then "Backward, p &lt; 0.5", and repeat. What happens to the number of terms kept and to the noise terms?',
        '<b>(c)</b> Set the sample size to 1,600 (the widget uses all 1,548 women) and repeat (a). What changes and what does not?',
        '<b>(d)</b> Compute the EPV at 600 and at 1,548 women, and compare with the book\'s advice for reliable selection.'
      ],
      answer: `<p><b>(a)</b> About 65 to 80 events (600 × 182 ÷ 1,548 = 71 on average). In our runs the original model usually had 4 to 6 terms (occasionally only 2 or 3), and the bootstraps kept about 4 to 6 on average. Only 0% to 10% of bootstraps reproduced the original model. Even previous preterm birth, the strongest true predictor, was selected in anywhere from about 60% to almost all bootstraps depending on the sample. Noise terms were usually selected in about 5% to 35% of bootstraps, and sometimes in more than half, more than the nominal 5%, because each bootstrap resamples the same small sample and repeats its chance patterns.</p>
<p><b>(b)</b> With AIC about 7 or 8 terms are kept, and with p &lt; 0.5 about 11. True weak predictors are kept more often, but noise terms also appear more often (half the time or more at p &lt; 0.5). Reproducing the exact model stays rare. The full model keeps all 14 every time.</p>
<p><b>(c)</b> About 180 events. Strong predictors (previous preterm birth, hypertension, short interval, age, haemoglobin) are now chosen in 80% to 100% of bootstraps and noise terms in about 5% to 20%. About 7 terms are kept at p &lt; 0.05. But the exact model is still reproduced in under 10% of bootstraps: weak true predictors (low BMI, low SES, first pregnancy) come and go.</p>
<p><b>(d)</b> At 600 women: about 71 ÷ 15 = 4.7. At 1,548 women: 182 ÷ 15 = 12.1. Reliable selection needs about 50 events per candidate, so 15 × 50 = 750 events, four times what the whole complete-case dataset has. The data support fitting a full model (EPV above 10 at full size), not choosing among the candidates.</p>`
    },
    {
      id: 't6',
      title: 'Full model or stepwise model?',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic), computed in the course data. From ptb_dev, 600 women with complete data (73 preterm births) were drawn. Two strategies were compared with 200 bootstrap samples; in each sample the backward selection was repeated. Both models were also tested on 20,000 new synthetic women from the same setting.</p>
<table class="data">
<tr><th>Strategy</th><th>Apparent c</th><th>Optimism</th><th>Apparent R² (%)</th><th>Optimism (%)</th><th>c in new women</th><th>R² in new women (%)</th></tr>
<tr><td>Full model, 14 terms (15 df)</td><td>0.7704</td><td>0.0437</td><td>23.07</td><td>7.54</td><td>0.702</td><td>11.4</td></tr>
<tr><td>Backward p &lt; 0.05, 5 terms (6 df)</td><td>0.7510</td><td>0.0442</td><td>18.33</td><td>7.20</td><td>0.684</td><td>9.9</td></tr>
</table>`,
      questions: [
        '<b>(a)</b> Calculate the optimism-corrected c and R² for each strategy.',
        '<b>(b)</b> A colleague says the stepwise model is "less overfitted" because its R² optimism is smaller. Is this the right comparison?',
        '<b>(c)</b> Compare with the book\'s GUSTO-I result (corrected R² 15.1% full, 11.7% stepwise). What is the common message?',
        '<b>(d)</b> Why are both models still weaker in new women than the bootstrap suggests?'
      ],
      answer: `<p><b>(a)</b> Full: c = 0.7704 − 0.0437 = 0.7267; R² = 23.07 − 7.54 = 15.53%. Stepwise: c = 0.7510 − 0.0442 = 0.7068; R² = 18.33 − 7.20 = 11.13%.</p>
<p><b>(b)</b> No. The question is how well each model predicts in new women, which is the corrected value. The stepwise model starts lower and loses almost as much, so it ends lower (0.707 against 0.727 for c). In new women the same order appears: c 0.684 against 0.702.</p>
<p><b>(c)</b> In both, the full model's corrected R² is higher (15.5% against 11.1% here; 15.1% against 11.7% in the book). Dropping weak predictors removes real information, and the selection adds its own optimism.</p>
<p><b>(d)</b> With only 73 events (EPV about 5 for the full model), every estimate is noisy. The bootstrap estimates the average optimism, but one particular small sample can be worse than average. This is why EPV matters before any modelling, and why shrinkage (Module 10) helps.</p>`
    },
    {
      id: 't7',
      title: 'Review a stepwise preterm birth model',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A manuscript reports 700 women from one hospital, 84 with preterm birth. Twenty-five variables were collected. "Variables with p &lt; 0.10 in univariable analysis (11) entered a forward stepwise procedure (entry p &lt; 0.05). Five remained: previous preterm birth, bacteriuria, chronic hypertension, tobacco use and low haemoglobin. Previous preterm birth entered first and was therefore the strongest independent predictor. BMI was dropped because it correlated with weight (r = 0.72). We report odds ratios with 95% confidence intervals and p-values from the software. The model was developed in a random half (350 women, 42 events) and tested in the other half: c = 0.86 and 0.77. The model performs well and no recalibration is needed."</p>`,
      questions: [
        '<b>(a)</b> Calculate the EPV at the start and in the development half.',
        '<b>(b)</b> List the problems with the selection and the reporting, and what the book says about each.',
        '<b>(c)</b> Propose a better analysis plan.'
      ],
      answer: `<div class="callout warn"><b>(a) Critical</b><p>EPV = 84 ÷ 25 = 3.4 at the start, and 42 ÷ 25 = 1.7 in the development half, far below 10 even before any selection. The model is likely to be seriously overfitted.</p></div>
<p><b>(b)</b></p>
<ol>
<li><b>Too many candidates.</b> 25 variables for 84 events. Candidates should be cut with subject knowledge first; reliable selection would need about 50 events per candidate.</li>
<li><b>Univariable screening, then forward selection.</b> Screening is just a variant of stepwise selection and does not remove its problems. Backward is preferred to forward, because correlated predictors are judged together.</li>
<li><b>"Entered first, therefore strongest".</b> The order of entry and the ranking of p-values are overinterpretations of an unstable process.</li>
<li><b>Dropping BMI for r = 0.72.</b> This level of correlation does not prevent reliable predictions. If BMI and weight are redundant, choose one on subject grounds before looking at the outcome.</li>
<li><b>Software confidence intervals and p-values.</b> They assume a pre-specified model, ignore the selection and are too optimistic; the kept odds ratios are also inflated by testimation bias.</li>
<li><b>Split-sample validation.</b> It wastes half of a small dataset and is itself unstable with 42 events. The fall from 0.86 to 0.77 is a sign of overfitting, not of good performance.</li>
<li><b>"No recalibration needed".</b> Calibration was not assessed at all; overfitting usually gives predictions that are too extreme.</li>
</ol>
<p><b>(c)</b> Agree about 8 candidate coefficients in advance from the literature and clinical knowledge (84 ÷ 10 = 8.4), choose one of BMI or weight, fit the full model in all 700 women, and assess optimism with 200 or more bootstrap samples. If a smaller model is required for practical reasons, use backward elimination with AIC and replay it in every bootstrap sample. Report calibration (slope and calibration-in-the-large) and apply shrinkage (Module 10). Plan external validation in another hospital.</p>`
    }
  ]
});
