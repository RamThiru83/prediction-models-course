registerModule({
  id: 'm13',
  num: 13,
  part: 'Validation',
  title: 'Internal and external validation',
  book: 'Ch. 17',
  minutes: 75,
  summary: 'How to obtain an honest estimate of how a prediction model will perform in new patients, first within the development setting (internal validation) and then in other settings (external validation).',
  objectives: [
    'Tell internal from external validity',
    'Explain why apparent performance is optimistic',
    'Compare split-sample, cross-validation and bootstrap',
    'Calculate bootstrap optimism-corrected performance',
    'Classify and diagnose an external validation',
    'Fit the final model on all data'
  ],
  format: 'cases',
  reading: [
    { cite: "Steyerberg EW, Harrell FE Jr, Borsboom GJ, et al. (2001). Internal validation of predictive models: efficiency of some procedures for logistic regression analysis. Journal of Clinical Epidemiology 54:774-781.", url: "https://doi.org/10.1016/s0895-4356(01)00341-9", note: "Compares split-sample, cross-validation and bootstrap validation and recommends the bootstrap." },
    { cite: "Steyerberg EW, Harrell FE Jr (2016). Prediction models need appropriate internal, internal-external, and external validation. Journal of Clinical Epidemiology 69:245-247.", url: "https://doi.org/10.1016/j.jclinepi.2015.04.005", note: "A short commentary that explains when each validation strategy is appropriate, including internal-external validation across centres." },
    { cite: "Smith GCS, Seaman SR, Wood AM, et al. (2014). Correcting for optimistic prediction in small data sets. American Journal of Epidemiology 180:318-324.", url: "https://doi.org/10.1093/aje/kwu140", note: "Compares optimism corrections for the c statistic and shows why sample splitting and leave-one-out cross-validation perform poorly." },
    { cite: "Collins GS, Dhiman P, Ma J, et al. (2024). Evaluation of clinical prediction models (part 1): from development to external validation. BMJ 384:e074819.", url: "https://doi.org/10.1136/bmj-2023-074819", note: "First of the 2024 BMJ series; sets out how performance is evaluated across development, internal validation and external validation." }
  ],
  essentials: `
<ul>
<li>A model is built for future women, not for the women in the data set. <b>Validation</b> asks how good the predictions are in women who did not help to build the model.</li>
<li><b>Internal validation</b> checks performance in new women from the same setting (reproducibility). <b>External validation</b> checks it in other, related settings: another period, another hospital, other investigators (generalisability).</li>
<li><b>Apparent performance</b>, measured in the development data, is too good (optimistic). In those data the calibration slope is always exactly 1, so it tells you nothing.</li>
<li>Splitting the data at random into a development part and a test part is wasteful and unstable. It works only when the sample is so large that you hardly need it.</li>
<li><b>Cross-validation</b> uses more of the data, but can hide how unstable variable selection is.</li>
<li>The <b>bootstrap</b> is preferred: refit the whole modelling process in many resamples, measure how much each model flatters itself, and subtract that <b>optimism</b>. Every step, including selection, must be replayed.</li>
<li>Models often do worse in other settings because of small single-centre development, overfitting, different definitions or units, missing predictors, or true differences between populations.</li>
<li>Validation tests the modelling process. The final model is fitted on all the data.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has fitted its booking-visit model for preterm birth before 37 weeks on 2,000 women (ptb_dev, 234 preterm births). In this module it asks how well the model will predict for the next women: first within its own hospital, by splitting and resampling its data, and then at a tertiary referral hospital in a later period (ptb_val). It also reviews a report that calls a random split "external validation". You do not need the earlier modules for this story.',
  defs: {
    'internal validation': 'Estimating how well a model will work in new people from the same setting, using only the development data.',
    'external validation': 'Testing a model in people from another period, place or study team than the ones it was built on.',
    'apparent performance': 'How well a model performs in the same data used to fit it; this is too optimistic.',
    'optimism': 'How much better a model looks in its own data than in new data from the same setting.',
    'split-sample validation': 'Dividing the data at random into a part for fitting the model and a part for testing it.',
    'cross-validation': 'Fitting the model on all but one part of the data and testing it on the part left out, in turn for every part.',
    'bootstrap sample': 'A sample of the same size as the data, drawn with replacement, so some people appear more than once and others not at all.',
    'calibration slope': 'The slope of observed against predicted log-odds in new data; below 1 means the predictions are too extreme.',
    'calibration-in-the-large': 'Whether the average predicted risk matches the observed rate; 0 is ideal, positive means risks are underestimated.',
    'transportability': 'Whether a model keeps working when moved to a different time, place, data collection method or patient spectrum.'
  },
  explainers: [
    {
      id: 'boot',
      title: 'How the bootstrap measures optimism',
      scenes: [
        { svg: EX.svg(EX.text(40, 40, 'The team\'s data: 2,000 women (each dot is 50 women)', { size: 'm', bold: true }) +
            EX.dots(40, { x: 70, y: 90, cols: 20, gap: 22, r: 7, stagger: 0.02 }) +
            EX.text(40, 180, 'Model fitted on these women and tested on the same women', { d: 1.0 }) +
            EX.text(40, 210, 'Apparent c statistic = 0.760', { bold: true, d: 1.6 }) +
            EX.text(40, 250, 'The model was tuned to these women, so 0.760 is too good.', { size: 's', d: 2.2 })),
          say: 'The team fits its model on 2,000 women and tests it on the same women. The c statistic is 0.760. But the coefficients were chosen to fit these women, so this apparent value is too good.' },
        { svg: EX.svg((function () {
            var cnt = [1, 0, 2, 1, 0, 1, 3, 0, 1, 2, 0, 1, 1, 0, 2, 1, 0, 1, 2, 0, 1, 0, 3, 1, 0, 2, 1, 1, 0, 2, 0, 1, 1, 0, 2, 3, 0, 1, 2, 0];
            var s = EX.text(40, 40, 'A bootstrap sample: draw 2,000 women with replacement', { size: 'm', bold: true });
            for (var i = 0; i < 40; i++) { var x = 40 + i * 12.5; s += EX.rect(x, 232, 10, 3, { role: 'muted', d: 0.2 }); for (var k = 0; k < cnt[i]; k++) s += EX.rect(x, 216 - k * 18, 10, 14, { role: 'obs', d: 0.5 + 0.03 * i + 0.2 * k }); }
            return s + EX.text(40, 262, 'Each column is one woman: some drawn twice or more, 14 of 40 not at all', { size: 's', d: 2.4 }) +
              EX.text(40, 282, 'On average about 63 in 100 women appear at least once', { size: 's', d: 2.8 });
          })()),
          say: 'Now draw a new sample of 2,000 women from the data, with replacement. Some women are drawn twice or three times. Others are not drawn at all. About 63 in every 100 women appear at least once.' },
        { svg: EX.svg(EX.text(40, 40, 'Repeat every modelling step in the bootstrap sample', { size: 'm', bold: true }) +
            EX.text(40, 80, 'Axis starts at 0.70', { size: 's' }) +
            EX.line([[200, 90], [200, 250]], { role: 'muted', draw: false }) + EX.text(200, 270, '0.70', { size: 's', anchor: 'middle' }) + EX.text(500, 270, '0.80', { size: 's', anchor: 'middle' }) +
            EX.text(40, 125, 'Apparent (original)', {}) + EX.rect(200, 110, 180, 22, { role: 'obs' }) + EX.text(388, 126, '0.760', { size: 's' }) +
            EX.text(40, 175, 'Bootstrap model on', { d: 0.6 }) + EX.text(40, 192, 'its own sample', { d: 0.6 }) + EX.rect(200, 162, 243, 22, { role: 'pred', grow: true, d: 0.8 }) + EX.text(451, 178, '0.781', { size: 's', d: 1.4 })),
          say: 'In this bootstrap sample the team repeats the whole strategy: the same coding, the same selection, the same fitting. The new model is tested on its own bootstrap sample and scores 0.781. It flatters itself, just as the original model did.' },
        { svg: EX.svg(EX.text(40, 40, 'Test the bootstrap model on the original 2,000 women', { size: 'm', bold: true }) +
            EX.line([[200, 90], [200, 250]], { role: 'muted', draw: false }) + EX.text(200, 270, '0.70', { size: 's', anchor: 'middle' }) + EX.text(500, 270, '0.80', { size: 's', anchor: 'middle' }) +
            EX.text(40, 125, 'On its own sample', {}) + EX.rect(200, 110, 243, 22, { role: 'pred' }) + EX.text(451, 126, '0.781', { size: 's' }) +
            EX.text(40, 175, 'On the original', { d: 0.5 }) + EX.rect(200, 162, 123, 22, { role: 'obs', grow: true, d: 0.6 }) + EX.text(220, 205, '0.741', { size: 's', d: 1.2 }) +
            EX.rect(323, 162, 120, 22, { role: 'err', grow: true, d: 1.6 }) + EX.text(330, 205, 'optimism 0.781 − 0.741 = 0.040', { size: 's', role: 'err', d: 2.0 })),
          say: 'Then apply that bootstrap model to the original women, who play the part of new women. Its c statistic falls to 0.741. The drop, 0.781 minus 0.741, is 0.040. That is the optimism for this one bootstrap sample.' },
        { svg: EX.svg((function () {
            var o = [0.040, 0.026, 0.054, 0.024, 0.046], s = EX.text(40, 40, 'Repeat 100 to 200 times and average the optimism', { size: 'm', bold: true });
            for (var i = 0; i < 5; i++) s += EX.text(40, 92 + i * 32, 'Sample ' + (i + 1), { d: 0.3 * i }) + EX.rect(160, 78 + i * 32, o[i] * 5000, 20, { role: 'err', grow: true, d: 0.3 * i + 0.1 }) + EX.text(170 + o[i] * 5000, 93 + i * 32, o[i].toFixed(3), { size: 's', d: 0.3 * i + 0.5 });
            return s + EX.text(40, 270, 'Mean optimism of these five = 0.190 ÷ 5 = 0.038', { bold: true, d: 2.0 });
          })()),
          say: 'Do this many times, usually 100 to 200. Each bootstrap sample gives its own optimism. Here five of them give 0.040, 0.026, 0.054, 0.024 and 0.046. Their average is 0.038.' },
        { svg: EX.svg(EX.text(40, 40, 'Subtract the mean optimism from the apparent value', { size: 'm', bold: true }) +
            EX.line([[200, 70], [200, 150]], { role: 'muted', draw: false }) + EX.text(200, 168, '0.70', { size: 's', anchor: 'middle' }) + EX.text(500, 168, '0.80', { size: 's', anchor: 'middle' }) +
            EX.text(40, 105, 'Apparent 0.760', {}) + EX.rect(200, 90, 66, 22, { role: 'obs' }) + EX.rect(266, 90, 114, 22, { role: 'err', d: 0.5 }) +
            EX.text(40, 140, 'Corrected 0.722', { bold: true, d: 1.0 }) + EX.rect(200, 125, 66, 22, { role: 'obs', grow: true, d: 1.1 }) +
            EX.text(40, 215, '0.760 − 0.038 = 0.722: the honest estimate for new women', { d: 1.8 }) +
            EX.text(40, 245, 'Replay every step, including selection, or optimism is understated', { size: 's', d: 2.4 })),
          say: 'Finally subtract the mean optimism from the apparent value: 0.760 minus 0.038 gives 0.722. That is the honest estimate for new women from this hospital. It only works if every modelling step, including selection, was repeated in each sample.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'How good will the model be for the next women?',
      aim: 'tell internal from external validity, see why apparent performance is optimistic, and judge a random split of the data.',
      minutes: 15,
      need: `
<p>The data used to build a model are only a means to learn about women who will be seen later. <b>Validation</b> asks how good the predictions are in women who did not contribute to the model.</p>
<p>Think of all pregnant women booking for antenatal care as a <b>superpopulation</b>. It is made of <b>settings</b>: this district hospital now, a referral hospital later, a clinic network elsewhere. The model is built on a sample from one setting.</p>
<ul>
<li><b>Internal validity</b> (reproducibility): does the model work for new women from the same setting? <b>Internal validation</b> estimates this from the development data alone.</li>
<li><b>External validity</b> (generalisability): does it work in other settings that are <i>plausibly related</i>, where it would be reasonable to use it? <b>External validation</b> needs new data from those settings. Which settings are plausibly related is a matter of clinical judgement, not statistics.</li>
</ul>
<p><b>Apparent performance</b> is measured in the same data used to fit the model. The coefficients were chosen to fit those women as well as possible, so it is <b>optimistic</b>. It is stable, because all the data are used. In the development data a model fitted by maximum likelihood always has a <b>calibration slope</b> of exactly 1 and <b>calibration-in-the-large</b> of 0, so these values carry no information.</p>
<p><b>Split-sample validation</b> divides the data at random, for example two-thirds to fit and one-third to test. <b>Worked example:</b> 2,000 women with 234 preterm births, split 2/3 : 1/3. The test third has about 667 women and 78 preterm births. With 78 events, a c statistic of 0.72 has a standard error of about 0.034, so its 95% interval runs from about 0.65 to 0.79. The model itself is fitted on only about 156 events instead of 234. Even the share of preterm births differs by chance: in a random half of the women (1,000 of the 2,000) it will usually lie anywhere between 10.3% and 13.1%, around the overall 11.7%. The book's verdict: a method "that works when we do not need it".</p>`,
      scenario: `<p>The team's statistician fitted the booking model on all 2,000 women and reports a c statistic of 0.76 and a calibration slope of 1.00 in the same data. A colleague suggests holding back a random third of the women "to validate it properly".</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'Apparent performance is optimistic and the apparent calibration slope is always 1; a random split tests internal validity only, and wastes data.'
    },
    {
      id: 'c2',
      title: 'Resampling: cross-validation and the bootstrap',
      aim: 'calculate optimism-corrected performance with the bootstrap, and compare it with cross-validation and a single split.',
      minutes: 20,
      need: `
<p><b>Cross-validation.</b> Divide the data at random into k equal parts (folds). Fit the model on k − 1 folds and test it on the fold left out. Repeat k times, so every woman is tested once. <b>Worked example:</b> the 2,000 women are split into 10 folds of 200. Round 1 fits on folds 2 to 10 (1,800 women) and tests on fold 1, and so on. Each fit uses 90% of the data, against 50% to 67% in a split sample. The result still depends on the random folds, so stable results may need the whole procedure repeated, for example 50 times. Leaving out one woman at a time is the <b>jack-knife</b>. Cross-validation can hide the instability of variable selection: each development set overlaps heavily with the full data, so nearly the same predictors are picked every time.</p>
<p><b>The bootstrap.</b> A <b>bootstrap sample</b> has the same size as the data but is drawn with replacement. Drawing from the data mimics drawing new samples from the population.</p>
<ol>
<li>Fit the model on the original data: apparent c (c<sub>app</sub>).</li>
<li>Draw a bootstrap sample and repeat <b>every</b> modelling step in it (coding, selection, shrinkage). Its c in the bootstrap sample is c<sub>boot</sub>.</li>
<li>Apply that model to the original data: c<sub>test</sub>. Optimism = c<sub>boot</sub> − c<sub>test</sub>.</li>
<li>Repeat 100 to 200 times (one study needed 500 to reach a plateau).</li>
</ol>
<div class="formula">corrected c = c<sub>app</sub> − mean(c<sub>boot</sub> − c<sub>test</sub>)</div>
<div data-explainer="boot"></div>
<p>The same works for R², the Brier score and the calibration slope. The apparent slope is 1, so the corrected slope is the mean slope of the bootstrap models in the original data, an estimate of the shrinkage needed. The bootstrap is stable, uses all the data for the final model, and reflects the extra optimism from selection, but only for steps that are replayed.</p>`,
      scenario: `<p>The statistician runs a bootstrap validation of the booking model, repeating the whole strategy in each sample. The team also wants to see, by simulation, how the four approaches compare when the true performance is known.</p>`,
      widgets: `<div data-widget="validationLab" data-try="Leave the development size at 500 and press Run 20 replications, then set the size to 250 and run again, watching the gap between the apparent estimates and the true c line."></div>`,
      tasks: [2, 3],
      takeaway: 'Bootstrap optimism correction is the preferred internal validation, provided every modelling step is repeated in every bootstrap sample.'
    },
    {
      id: 'c3',
      title: 'Testing the model in another hospital',
      aim: 'classify an external validation, calculate calibration-in-the-large, and diagnose why a model performs poorly elsewhere.',
      minutes: 20,
      need: `
<p>Internal validation always resamples the development data at random. External validation uses women who <b>differ in some respect</b>. Four aspects of <b>transportability</b> can be tested:</p>
<ul>
<li><b>Historic (temporal)</b>: a later period.</li>
<li><b>Geographic</b>: other hospitals or regions.</li>
<li><b>Methodological</b>: data collected differently, for example gestational age by last menstrual period instead of early ultrasound.</li>
<li><b>Spectrum</b>: women more or less ill on average, for example a model from a referral centre or a trial used in a general clinic.</li>
</ul>
<p>Who validates matters too. Good results from independent investigators in their own setting are more convincing than results from the developers. Fully independent validations often look less favourable. In multi-centre data, <b>leave-one-centre-out</b> validation is a geographic validation. Each centre is small, so look for general consistency, and treat one striking centre as a reason for more validation there, not as proof that the model fails.</p>
<p><b>Calibration-in-the-large</b> asks whether the average predicted risk matches the observed rate. <b>Worked example:</b> 1,000 new women, 150 preterm births (15%), mean predicted risk 12%. Observed odds = 0.15 ÷ 0.85 = 0.176; predicted odds = 0.12 ÷ 0.88 = 0.136. Ratio 1.29, log ratio 0.26: risks are underestimated. Formally the intercept a is estimated in logit(P(y = 1)) = a + offset(lp), and the slope b in logit(P(y = 1)) = a + b × lp.</p>
<p><b>Why models fail elsewhere.</b> Weak development (small, single centre, stepwise selection without shrinkage, so predictions are too extreme), different coding of predictors or outcome, different units, mistakes in applying a published formula (check units and the intercept), predictors not available at validation, and true differences in case-mix or predictor effects (Module 14).</p>`,
      scenario: `<p>Illustrative (synthetic). The booking model is sent to a tertiary referral hospital for use in a later period. Its first report shows many more preterm births than predicted, and a second hospital reports predicted risks close to zero for every woman.</p>`,
      widgets: '',
      tasks: [4, 5],
      takeaway: 'External validation tests transportability over time, place, methods and spectrum; check definitions, units and the intercept before blaming the model.'
    },
    {
      id: 'c4',
      title: 'What has been validated, and the final model',
      aim: 'see that validation tests the modelling process, compare internal and external results in the course data, and critique a validation report.',
      minutes: 20,
      need: `
<p>Every internal validation method validates the <b>modelling process</b>, not one fixed set of coefficients. The bootstrap asks: if we applied this whole strategy to a new sample from the same population, how well would the resulting model predict? So:</p>
<ul>
<li>After a split-sample validation, the final model is still <b>fitted on all the data</b>. If selection was used in the random part, it is repeated on the full data, even if the chosen predictors change.</li>
<li>Bootstrapping a stepwise model often shows that the final selected model appears in only a few bootstrap samples. That uncertainty belongs in the optimism.</li>
<li>Validating only the final selected model, as if it had been planned in advance, understates optimism. In one book study the optimism in c was 0.07 with all steps replayed, but 0.01 when the final model was treated as fixed.</li>
<li>Informal steps (merging categories after looking at outcome rates, choosing cut-points) cannot be replayed. At least bootstrap the full model with all candidate predictors.</li>
<li>With very many candidates relative to the sample, as in genetic marker studies, even the bootstrap may underestimate optimism.</li>
</ul>
<p>If external validation shows adequate performance, the development and validation data can be combined to fit the final model, with a setting-specific intercept if needed.</p>
<p><b>In the course data.</b> ptb_dev (n = <span data-live="ptb_dev_n"></span>, <span data-live="ptb_dev_events"></span> preterm births, <span data-live="ptb_dev_incidence"></span>) comes from a district hospital. ptb_val (n = <span data-live="ptb_val_n"></span>, <span data-live="ptb_val_events"></span> preterm births, <span data-live="ptb_val_incidence"></span>) comes from a referral hospital in a later period: a temporal and geographic validation with a different spectrum. The full model on <span data-live="ptb_cc_n"></span> complete cases has apparent c <span data-live="ptb_full_apparent_c"></span>, bootstrap optimism <span data-live="ptb_full_optimism_c"></span>, corrected c <span data-live="ptb_full_corrected_c"></span> and shrinkage factor <span data-live="ptb_full_shrinkage"></span>. On ptb_val: c <span data-live="ptb_val_c"></span>, slope <span data-live="ptb_val_slope"></span>, calibration-in-the-large <span data-live="ptb_val_citl"></span>.</p>`,
      scenario: `<p>The team runs its own internal and external validation in the Analysis Lab. Then the research committee forwards a report from a tertiary centre that claims its preterm birth model is "externally validated".</p>`,
      widgets: `<div data-widget="datasetCard" data-set="ptb_val"></div>
<div data-widget="analysisLab" data-try="Keep dataset ptb_dev, complete case, no selection and no shrinkage, press Run analysis, then compare the bootstrap-corrected c and slope with the external results on ptb_val."></div>`,
      tasks: [6, 7],
      takeaway: 'Validation tests the whole modelling process; internal validation cannot detect differences between settings, and the final model is fitted on all available data.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Internal and external validity',
      html: `
<p>Models are built for future patients; validation is an essential part of modelling. Internal validity (reproducibility) concerns patients from the same setting as the development sample; external validity (generalisability, transportability) concerns plausibly related settings within a superpopulation (Fig. 17.1). Settings differ in patient selection, time, and predictor and outcome definitions. The more often and the more diverse the settings in which a model is validated, the more confidence in its generalisability.</p>
<p>Measures validated: the c statistic; calibration-in-the-large (a in logit(P(y = 1)) = a + offset(lp), ideal 0); the calibration slope (b in logit(P(y = 1)) = a + b × lp, ideal 1; below 1 signals overfitting); Nagelkerke R², Brier score and net benefit. In the development data the maximum likelihood fit gives slope 1 and intercept 0 by construction.</p>
<p class="src">Source: Ch. 17, §17.1 (Fig. 17.1)</p>`
    },
    {
      id: 'n2',
      title: 'Apparent, split-sample and cross-validation',
      html: `
<table class="data">
<thead><tr><th>Method</th><th>Developed on</th><th>Tested on</th></tr></thead>
<tbody>
<tr><td>Apparent</td><td>Original sample, 100%</td><td>Same sample, 100%</td></tr>
<tr><td>Split-sample</td><td>Random 50-67%</td><td>Remaining 50-33%</td></tr>
<tr><td>Cross-validation</td><td>2 × 50% to 10 × 90%</td><td>Left-out parts (2 × 50% to 10 × 10%)</td></tr>
<tr><td>Jack-knife</td><td>N × (N − 1)</td><td>Each patient once</td></tr>
<tr><td>Bootstrap</td><td>Bootstrap samples of size N</td><td>Original sample, 100%</td></tr>
</tbody></table>
<p>Apparent validation is optimistic but stable; with large samples and few predictors the optimism is small. Split-sample validation suffers from chance imbalance (partly remedied by stratifying the split), variance in both fitting and testing, the temptation to re-split, and bias (it assesses a model built on part of the data). Simulations show it is reasonable only for large samples, where apparent performance is already a good guide.</p>
<div class="callout book"><b>Book example</b><p>GUSTO-I subsample of 429 patients: 30-day mortality 5.6% (24/429), but a random half could show 4% and the other 7%. Shock occurred in 1.6% (7/429), so a development half might contain no patient with shock.</p></div>
<p>k-fold cross-validation uses more data per fit but depends on the random folds; repeat it (for example 50 × 10-fold). It may not reflect uncertainty from automated selection.</p>
<div class="callout book"><b>Book example</b><p>GUSTO-I subsample of 785 patients (52 deaths): 10-fold cross-validation of backward stepwise selection suggested a stable choice of four predictors (shock, age over 65, high-risk infarction, tachycardia); bootstrapping showed much wider variability in the selected predictors.</p></div>
<p class="src">Source: Ch. 17, §17.2.1-17.2.3 (Table 17.1)</p>`
    },
    {
      id: 'n3',
      title: 'Bootstrap validation',
      html: `
<p>A bootstrap sample of size N is drawn with replacement; on average 63.2% of patients appear at least once. Procedure: apparent performance; develop the model in a bootstrap sample, repeating every modelling step; performance there and in the original sample; optimism = difference; repeat 100-200 times (one simulation plateaued at 500); corrected = apparent − mean optimism. The same applies to R², Brier score and the calibration slope, whose corrected value estimates the shrinkage factor.</p>
<p>Strengths: stable (fits and tests on size N), reflects selection when it is replayed, all data used for the final model. Limitation: only automated steps can be replayed. Approximation: bootstrap the full model with all candidates. For example, if 30 candidates were screened univariately at p &lt; 0.50 and reduced by backward selection at p &lt; 0.20, validate the full 30-predictor model, or replay the backward step while ignoring the screen.</p>
<div class="callout warn"><b>Critical</b><p>Treating the selected model as prespecified understates optimism: 0.07 with all steps replayed against 0.01 in one study.</p></div>
<p class="src">Source: Ch. 17, §17.2.4; Ch. 5, §5.3</p>`
    },
    {
      id: 'n4',
      title: 'Types of external validation',
      html: `
<p>Aspects of transportability: historic, geographic, methodological (for example comorbidity from claims data instead of charts) and spectrum (secondary to primary care; trial to unselected population). Temporal validation uses more recent patients, possibly the latest part of the data set aside; geographic validation uses other sites, for example leave-one-centre-out; fully independent validation is by other investigators at another site.</p>
<div class="callout book"><b>Book examples</b><p>Testicular cancer: 172 validation patients, 100 more recent from the development hospitals (temporal) and 72 from another hospital (geographic). Lynch syndrome: developed in 898 patients tested 2000-2003, validated in 1,016 tested 2003-2004; prevalence 15% against 14%, mean predicted 13%; an intercept increase of +0.25 (odds about 28% higher) corrected this; c stayed about 0.80; final model on all 1,914. Testicular cancer in six groups: c about 0.8 in all, significant miscalibration (Hosmer-Lemeshow) in one centre only. Three nomograms for indolent prostate cancer in 247 screened men: mean predicted 24%, 22% and 15% against 49% observed; areas under the ROC curve 0.61, 0.72, 0.76 against 0.64, 0.74, 0.79 at development; a new intercept, with coefficients kept close to the originals, solved the problem.</p></div>
<p>Geographic validation is more meaningful than random cross-validation, but centre samples are small: emphasise general consistency.</p>
<p class="src">Source: Ch. 17, §17.3 (Tables 17.2-17.6, Fig. 17.6)</p>`
    },
    {
      id: 'n5',
      title: 'Reasons for poor external performance',
      html: `
<p><b>Inadequate development:</b> small samples or a single centre (noted in a review of more than 25 models in traumatic brain injury); stepwise selection with many candidates and no shrinkage, giving coefficients that are too large and a calibration slope below 1.</p>
<p><b>Differences between settings:</b> coding of predictors and outcome; units (mg/dL against mmol/L, a transport problem for a jaundice rule in the 1980s); errors in applying a published model, especially from a nomogram with non-linear terms (check units and the intercept, contact the developers); predictors unavailable (a constant can be substituted, but performance suffers: a Dutch aneurysm surgery model did poorly in a UK trial missing two of its seven predictors, and better in a Rotterdam series missing one); true differences in case-mix and predictor effects (Module 14).</p>
<div class="callout warn"><b>Critical</b><p>A unit or coding mismatch (g/L entered for a coefficient per g/dL, a 0/1 predictor coded 1/2) invalidates every prediction. Reconstruct the linear predictor for a few typical women and check that risks are plausible before computing any validation statistic.</p></div>
<p class="src">Source: Ch. 17, §17.3.5</p>`
    },
    {
      id: 'n6',
      title: 'Validating the process; the final model',
      html: `
<p>Internal validation assesses the modelling process. After a split-sample validation the final model is estimated on the full sample, repeating any selection. Bootstrap validation of stepwise models often shows the selected model in only a few bootstrap samples. With very many candidates relative to the sample size, even the bootstrap may underestimate optimism. After adequate external validation, development and validation data may be combined (as for Lynch syndrome), assuming one population; otherwise include a setting-specific intercept or interaction terms.</p>
<p><b>In the course story:</b> in the synthetic data-generating process, the referral hospital has a higher baseline risk than the predictors explain, predictor effects about 20% weaker, and an older, higher-risk case-mix. None of these can be detected from ptb_dev alone.</p>
<p class="src">Source: Ch. 17, §17.4</p>`
    }
  ],
  keyPoints: [
    'Internal validity is reproducibility in the development setting; external validity is generalisability to plausibly related settings.',
    'Apparent performance is optimistic but stable; in the development data the calibration slope is always 1 and carries no information.',
    'Split-sample validation is unstable, inefficient and biased; it works only when samples are large enough not to need it.',
    'Cross-validation is more efficient than a single split but can understate the instability of variable selection.',
    'Bootstrap optimism correction is preferred, provided every modelling step, including selection, is replayed in each bootstrap sample.',
    'External validation can be temporal, geographic or fully independent; fully independent validations tend to be the least favourable.',
    'Poor external performance comes from small single-centre development, selection without shrinkage, coding and unit differences, a wrong intercept, missing predictors, or true differences.',
    'Validation assesses the modelling process; the final model is estimated on all available data.'
  ],
  quiz: [
    {
      q: 'The team fits its preterm birth model and reports, in the same 2,000 women, a calibration slope of 1.00 and calibration-in-the-large of 0.00. What do these values say about calibration in the next women?',
      options: [
        'Calibration is excellent and no shrinkage is needed',
        'Nothing: maximum likelihood fitting forces these values in the development data',
        'The model is overfitted, because a slope of exactly 1 is suspicious',
        'Calibration is good, provided the c statistic exceeds 0.7'
      ],
      answer: 1,
      why: 'With maximum likelihood the apparent slope is 1 and the intercept 0 by construction, so they cannot reveal overfitting. Treating them as evidence is the commonest error; only internal or external validation estimates the slope in new women. A slope of 1 is not a sign of overfitting either, and the c statistic says nothing about calibration.'
    },
    {
      q: 'Bootstrap validation of the booking model gives: apparent c 0.80; mean c of bootstrap models in their own samples 0.82; mean c of the same models in the original data 0.77. What is the optimism-corrected c?',
      options: ['0.75', '0.77', '0.78', '0.82'],
      answer: 0,
      why: 'Optimism = 0.82 − 0.77 = 0.05; corrected c = 0.80 − 0.05 = 0.75. Reporting 0.77 confuses the mean test performance of the bootstrap models with the corrected estimate; the correction is applied to the apparent performance of the original model. 0.82 is the most optimistic number of all.'
    },
    {
      q: 'Which statement about split-sample validation is correct?',
      options: [
        'It tests external validity because the test part was not used for fitting',
        'It is the preferred method when the sample is small',
        'It assesses a model built on only part of the data, with an imprecise estimate from the small test part',
        'It reflects the instability of variable selection better than the bootstrap'
      ],
      answer: 2,
      why: 'A random split keeps both parts in the same setting, so it tests internal validity only; "unseen data" is not the same as external validation. It is least suitable for small samples, and the bootstrap, not a single split, best reflects selection instability.'
    },
    {
      q: 'An investigator screened 25 candidate predictors of preterm birth univariately (p < 0.20), used backward selection, and then bootstrapped the selected 5-predictor model as if it had been planned in advance. What is the main consequence?',
      options: [
        'The optimism is overestimated because too few predictors are included',
        'No consequence, provided at least 200 bootstrap samples were used',
        'The result is valid because the bootstrap always reflects model uncertainty',
        'The optimism is underestimated because the selection steps were not replayed'
      ],
      answer: 3,
      why: 'Optimism from selection is captured only when selection is repeated in every bootstrap sample. In one book study the optimism in c was 0.07 with all steps replayed against 0.01 with the final model treated as fixed. The bootstrap is honest only about the steps it replays, and more replicates reduce random noise, not this bias.'
    },
    {
      q: 'A model for preterm birth was developed in a trial of women admitted with threatened preterm labour. It is then tested in all women booking at district clinics, who are on average at much lower risk. Which aspect of transportability is mainly being tested?',
      options: ['Spectrum', 'Methodological', 'Historic', 'Internal validity'],
      answer: 0,
      why: 'Moving from a selected, higher-risk trial population to a broader, less selected population tests spectrum transportability. Methodological transportability concerns how data are collected, historic concerns time, and internal validity concerns the development setting itself.'
    },
    {
      q: 'In a leave-one-centre-out validation of the preterm model across eight maternity units, one small unit (35 women, 6 preterm births) shows clear miscalibration while the other seven are well calibrated. What is the most defensible interpretation?',
      options: [
        'The model is invalid and should not be used anywhere',
        'The model is invalid in that unit and should be banned there',
        'Emphasise the general consistency, treat the one unit as a signal for further validation there, and avoid over-reading 6 events',
        'Remove the unit from the analysis because it is an outlier'
      ],
      answer: 2,
      why: 'Geographic validation is a set of small subgroup analyses, so some differences will always occur by chance. The book advises emphasising general consistency, while a striking result in one setting justifies further validation before use there. Banning the model on 6 events over-interprets; deleting the unit hides information.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Internal or external?',
      level: 'Understand',
      scenario: `<p>The team considers five ways to check its booking model, fitted on 2,000 women at the district hospital in 2022 to 2024: (i) compute the c statistic in the same 2,000 women; (ii) hold back a random third of the 2,000 women; (iii) bootstrap the whole modelling process; (iv) apply the model to women booking at the same hospital in 2025; (v) ask a team in another state to apply it to their own women.</p>`,
      questions: [
        '<b>(a)</b> Which are apparent, internal and external validation? For external ones, name the type.',
        '<b>(b)</b> Why is (i) optimistic? Why is it nevertheless stable?',
        '<b>(c)</b> The statistician reports a calibration slope of 1.00 in (i). What does it tell you?'
      ],
      answer: `<p><b>(a)</b> (i) apparent; (ii) internal (split sample); (iii) internal (bootstrap); (iv) external, temporal; (v) external, fully independent and geographic, and possibly methodological if their definitions differ.</p>
<p><b>(b)</b> The coefficients were chosen to fit these exact women as well as possible, including their chance features, so performance in the same women is too good. It is stable because all 2,000 women are used for both fitting and testing.</p>
<p><b>(c)</b> Nothing. A model fitted by maximum likelihood always has a slope of 1 and calibration-in-the-large of 0 in its own data. Only validation can show whether predictions will be too extreme in new women.</p>`
    },
    {
      id: 't1',
      title: 'What a random split costs',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). ptb_dev has 2,000 women and 234 preterm births. The model has 14 candidate predictors, which need 15 coefficients (age has a squared term). The colleague proposes a random 2/3 : 1/3 split.</p>`,
      questions: [
        '<b>(a)</b> About how many preterm births are in each part? Calculate the events per variable (EPV) for fitting on all the data and on the two-thirds part.',
        '<b>(b)</b> With 78 preterm births and 589 other women in the test part, the standard error of a c statistic of 0.72 is about 0.034. Give the approximate 95% interval and comment.',
        '<b>(c)</b> In a random half of the 2,000 women (1,000 women), the standard deviation of the observed preterm rate around 11.7% is about 0.72 percentage points. Between which values will the rate usually lie?',
        '<b>(d)</b> The first split gives a c statistic of 0.66. What should the team not do next, and what should it do instead?'
      ],
      answer: `<p><b>(a)</b> Two-thirds: about 2/3 × 234 = 156 events; one-third: about 78. EPV on all data = 234 ÷ 15 = 15.6; on the two-thirds part = 156 ÷ 15 = 10.4. The model is fitted on less information and is less stable.</p>
<p><b>(b)</b> 0.72 ± 1.96 × 0.034 = 0.72 ± 0.067, about 0.65 to 0.79. The test part cannot tell a weak model from a good one.</p>
<p><b>(c)</b> 11.7% ± 1.96 × 0.72 = 11.7% ± 1.4, so from about 10.3% to 13.1%, by chance alone.</p>
<p><b>(d)</b> It should not re-split until the result looks better; that is selective reporting and biases the estimate upwards. Instead, fit the model on all 2,000 women and estimate optimism with the bootstrap, then seek genuine external validation.</p>`
    },
    {
      id: 't2',
      title: 'Bootstrap optimism by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The booking model has an apparent c of 0.760 (apparent calibration slope 1). Five bootstrap samples are shown (in practice 100 to 200 would be used). The full strategy was repeated in each.</p>
<table class="data">
<thead><tr><th>Sample</th><th>c<sub>boot</sub></th><th>c<sub>test</sub></th><th>Slope in original data</th></tr></thead>
<tbody>
<tr><td>1</td><td>0.781</td><td>0.741</td><td>0.86</td></tr>
<tr><td>2</td><td>0.774</td><td>0.748</td><td>0.92</td></tr>
<tr><td>3</td><td>0.790</td><td>0.736</td><td>0.80</td></tr>
<tr><td>4</td><td>0.769</td><td>0.745</td><td>0.93</td></tr>
<tr><td>5</td><td>0.786</td><td>0.740</td><td>0.84</td></tr>
</tbody></table>`,
      questions: [
        '<b>(a)</b> Calculate the optimism for each sample, the mean optimism and the corrected c statistic.',
        '<b>(b)</b> Estimate the corrected calibration slope. What does it imply for the coefficients?',
        '<b>(c)</b> The analyst had chosen 6 of 14 predictors by stepwise selection but bootstrapped only the final 6-predictor model. Would the optimism be larger or smaller than it should be?'
      ],
      answer: `<p><b>(a)</b> 0.781 − 0.741 = 0.040; 0.774 − 0.748 = 0.026; 0.790 − 0.736 = 0.054; 0.769 − 0.745 = 0.024; 0.786 − 0.740 = 0.046. Mean = 0.190 ÷ 5 = 0.038. Corrected c = 0.760 − 0.038 = <b>0.722</b>.</p>
<p><b>(b)</b> The apparent slope is 1 in every bootstrap sample, so the corrected slope is the mean test slope: (0.86 + 0.92 + 0.80 + 0.93 + 0.84) ÷ 5 = 4.35 ÷ 5 = <b>0.87</b>. Predictions will be too extreme in new women; multiplying the coefficients by about 0.87 (and re-estimating the intercept) should improve calibration.</p>
<p><b>(c)</b> Smaller than it should be. Selection adds optimism, which is captured only if the selection is repeated in each bootstrap sample (book example: 0.07 with all steps replayed against 0.01 without).</p>`
    },
    {
      id: 't3',
      title: 'Validation Lab: four methods compared',
      level: 'Analyse',
      scenario: `<p>Use the Validation Lab in this case. Each replication draws a new development sample from the synthetic district hospital setting, fits the 14-term model and estimates c four ways; the true c is measured in a large fresh sample. The default development size is 500.</p>`,
      questions: [
        '<b>(a)</b> Set the development size to 250 and press <b>Run 20 replications</b>. Record the mean error against the true c and the SD for each method.',
        '<b>(b)</b> Set the size to 1200 and run again. What changes?',
        '<b>(c)</b> At 250, which method has the smallest spread around the true value, and why does the split sample scatter most?',
        '<b>(d)</b> What would you tell the colleague who wanted to hold back a third of the data?'
      ],
      answer: `<p>Exact values vary between runs, because each run uses new random samples.</p>
<p><b>(a)</b> Expected pattern at n = 250: the apparent c lies clearly above the true c (positive mean error). The split-sample estimates are centred near or below the truth, because the model is built on only two-thirds of the data, and have the largest SD. Cross-validation (often slightly below) and the bootstrap (often slightly above) are close to the true c, with smaller SD.</p>
<p><b>(b)</b> At n = 1200 the gap between apparent and true c shrinks, and the spread of every method falls. Optimism and instability are small-sample problems.</p>
<p><b>(c)</b> Among the honest methods the bootstrap usually has the smallest spread and the smallest typical error (the apparent c may vary as little, but it is centred well above the truth). The split sample fits on a smaller part and tests on about 84 women (about 10 preterm births), so both the model and its test are noisy.</p>
<p><b>(d)</b> A random split wastes data and gives an unstable estimate; with large samples it is unnecessary, with small ones it is unreliable. Fit on all the data, correct for optimism with the bootstrap, and spend effort on a genuine external validation.</p>`
    },
    {
      id: 't4',
      title: 'Calibration-in-the-large at the referral hospital',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The booking model is applied to 1,107 women at a referral hospital, of whom 185 deliver preterm. The mean predicted risk in these women is 13.6%. Internal validation had given a corrected c of 0.722 and a corrected slope of 0.87.</p>`,
      questions: [
        '<b>(a)</b> Calculate the observed preterm rate, the observed and predicted odds, their ratio and its logarithm. Interpret the direction.',
        '<b>(b)</b> If the intercept is raised by 0.24, what becomes of a predicted risk of 10%?',
        '<b>(c)</b> Which types of transportability does this hospital test?',
        '<b>(d)</b> Could the internal validation have warned of this problem? Why?'
      ],
      answer: `<p><b>(a)</b> Observed rate = 185 ÷ 1,107 = 16.7%. Observed odds = 0.167 ÷ 0.833 = 0.201; predicted odds = 0.136 ÷ 0.864 = 0.157. Ratio = 0.201 ÷ 0.157 = <b>1.27</b>; log ratio = <b>0.24</b>. More preterm births occurred than predicted: the model underestimates risk here. The log ratio approximates the calibration-in-the-large intercept a, which is estimated formally by logistic regression with the linear predictor as offset.</p>
<p><b>(b)</b> logit(0.10) = ln(0.10 ÷ 0.90) = −2.197. New value −2.197 + 0.24 = −1.957. Risk = 1 ÷ (1 + e<sup>1.957</sup>) = 12.4%.</p>
<p><b>(c)</b> Temporal (a later period), geographic (another hospital) and spectrum (a referral population with more high-risk women).</p>
<p><b>(d)</b> No. Internal validation resamples the development data and so measures only overfitting in the same setting. A different baseline risk at another hospital cannot be seen from the district hospital's data.</p>`
    },
    {
      id: 't5',
      title: 'Why does the model fail at the second hospital?',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). A second hospital applies the published booking model and reports predicted risks near zero for every woman. The model's linear predictor includes −0.35 (intercept) − 0.15 × haemoglobin (per g/dL), plus other terms that are 0 for a woman with no risk factors. On checking, you find:</p>
<ul>
<li>haemoglobin was entered in g/L (for example 110) rather than g/dL (11.0);</li>
<li>gestational age was dated from the last menstrual period, not by early ultrasound;</li>
<li>"previous preterm birth" was not recorded, so the hospital entered 0 for every woman;</li>
<li>the hospital serves a mostly urban, younger population than the district hospital.</li>
</ul>`,
      questions: [
        '<b>(a)</b> For a woman with haemoglobin 11 g/dL and no other risk factors, calculate the linear predictor and risk as intended, and as computed by the hospital.',
        '<b>(b)</b> Classify each of the four findings (unit error, methodological, missing predictor, spectrum or case-mix) and say what each does to the predictions.',
        '<b>(c)</b> What check should every validation team do before computing any statistic?'
      ],
      answer: `<p><b>(a)</b> Intended: lp = −0.35 − 0.15 × 11 = −2.00; risk = 1 ÷ (1 + e<sup>2.00</sup>) = 11.9%. As computed: lp = −0.35 − 0.15 × 110 = −16.85; risk = 1 ÷ (1 + e<sup>16.85</sup>) ≈ 0.000005%. <b>Critical:</b> the unit error alone makes every prediction meaningless.</p>
<p><b>(b)</b> Haemoglobin in g/L: unit error, invalidates all predictions. Dating by last period: methodological; misclassifies the outcome, which tends to weaken apparent associations and lowers c. Previous preterm birth set to 0: a missing predictor replaced by a constant; risks for women with a past preterm birth are underestimated and discrimination is lost (a mean value would be a better constant, but performance still suffers). Younger urban population: a true case-mix (spectrum) difference, which can change the spread of risks and the baseline rate.</p>
<p><b>(c)</b> Reconstruct the linear predictor for a few typical women, check units, coding and the intercept against the publication (and, if needed, with the developers), and confirm that the predicted risks are plausible.</p>`
    },
    {
      id: 't6',
      title: 'Internal against external in the Analysis Lab',
      level: 'Analyse',
      scenario: `<p>Use the Analysis Lab in this case. Its defaults are: dataset ptb_dev (validated on ptb_val), development size 2000, missing data complete case, selection none, shrinkage none, 100 bootstrap replications, with all 14 candidate predictors ticked.</p>`,
      questions: [
        '<b>(a)</b> Press <b>Run analysis</b> with the defaults. Record the apparent and bootstrap-corrected c, the shrinkage estimate, and the c, slope and calibration-in-the-large on ptb_val.',
        '<b>(b)</b> Set selection to <b>Backward, p &lt; 0.05</b> and run again. Compare the bootstrap optimism (selection replayed) with that of the full model.',
        '<b>(c)</b> Set selection back to none and shrinkage to <b>Uniform, bootstrap slope</b>. Which external measure changes, and which hardly changes?',
        '<b>(d)</b> Does internal validation predict the external results? Explain the gaps.'
      ],
      answer: `<p><b>(a)</b> The lab reproduces the course values: apparent c <span data-live="ptb_full_apparent_c"></span>, corrected c <span data-live="ptb_full_corrected_c"></span>, shrinkage <span data-live="ptb_full_shrinkage"></span>; on ptb_val c <span data-live="ptb_val_c"></span>, slope <span data-live="ptb_val_slope"></span>, calibration-in-the-large <span data-live="ptb_val_citl"></span>. Small differences can come from bootstrap randomness.</p>
<p><b>(b)</b> With selection replayed in every bootstrap sample, the optimism is usually similar to or larger than that of the full model, even though fewer predictors remain: selection adds instability, and the bootstrap counts it.</p>
<p><b>(c)</b> Uniform shrinkage pulls the predictions towards the average, so the external calibration slope moves closer to 1. The external c hardly changes, because multiplying all coefficients by one factor does not change the ranking of women.</p>
<p><b>(d)</b> Only partly. Internal validation predicts the effect of overfitting in the district hospital setting. In the synthetic data the referral hospital has a higher baseline risk than its predictors explain (positive calibration-in-the-large), predictor effects about 20% weaker (an external slope below the internal shrinkage factor), and an older, higher-risk case-mix. None of this can be seen in ptb_dev. Internal validation is a minimum, not a substitute for external validation.</p>`
    },
    {
      id: 't7',
      title: 'Critique a preterm birth validation report',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A single tertiary centre reports a model for preterm birth from 640 women with 41 preterm births. Twenty-eight candidate predictors (clinical, ultrasound and blood markers) were examined. Predictors with univariate p &lt; 0.10 entered forward stepwise selection; parity categories were merged after inspecting the outcome rates; cervical length was dichotomised at the value giving the largest odds ratio. The data were split at random into 70% development and 30% "external validation". The first split gave a validation c of 0.68, so the authors re-split and report the second split (c 0.84). They conclude that the model is "externally validated and ready for use in district hospitals". The final coefficients are those from the 70% part.</p>`,
      questions: [
        '<b>(a)</b> List the problems with the validation design and reporting.',
        '<b>(b)</b> Which development choices make poor performance in district hospitals likely?',
        '<b>(c)</b> Propose a better validation plan using only the methods in this module.'
      ],
      answer: `<p><b>(a)</b></p>
<ol>
<li>A random split is internal validation; calling it "external" is wrong. Both parts come from the same centre and period.</li>
<li><b>Critical:</b> re-splitting after a poor result and reporting the better split is selective reporting; the reported c of 0.84 is biased upwards.</li>
<li>The test part has only about 12 preterm births (30% of 41 = 12.3), so its c and any calibration estimate are very imprecise.</li>
<li>The split validates a model built on 70% of the data, while the final model should be fitted on all of it.</li>
<li>No calibration (calibration-in-the-large, slope) is reported, only c.</li>
</ol>
<p><b>(b)</b> Very few events for 28 candidates (41 ÷ 28 = 1.5 events per candidate); univariate screening plus stepwise selection, giving unstable selection and coefficients that are too large; data-driven merging of categories and a data-derived cut-point, both further sources of optimism; no shrinkage; a single tertiary centre with a referral spectrum unlike district hospitals; and ultrasound and blood marker methods that may differ elsewhere (methodological transportability).</p>
<p><b>(c)</b> Fit the final model on all 640 women. Estimate optimism with the bootstrap, replaying every step (screening, selection, category merging, cut-point search); if some steps cannot be replayed, at least bootstrap the full model with all candidates. Report corrected c and calibration slope, and consider shrinkage. Then do genuine external validation: temporal (later women at the same centre) and, above all, geographic or fully independent validation in district hospitals, with definitions and units checked and calibration-in-the-large and slope reported with c. Only consistent results across such settings support a claim of readiness for district use.</p>`
    }
  ]
});
