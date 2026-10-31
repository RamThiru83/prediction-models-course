registerModule({
  id: 'm04',
  num: 4,
  part: 'Development',
  title: 'Overfitting and optimism',
  book: 'Ch. 5',
  minutes: 75,
  summary: 'Why a model always looks better in the data used to build it, the two causes of overfitting (model uncertainty and parameter uncertainty), shrinkage as the remedy, and how the bootstrap estimates and corrects optimism.',
  objectives: [
    'Tell apparent from true performance',
    'Explain regression to the mean and shrinkage',
    'Work out testimation bias after selection',
    'Separate model and parameter uncertainty',
    'Read a calibration slope below 1',
    'Correct optimism with the bootstrap'
  ],
  format: 'cases',
  reading: [
    { cite: "Steyerberg EW, Harrell FE Jr, Borsboom GJJM, et al. (2001). Internal validation of predictive models: efficiency of some procedures for logistic regression analysis. J Clin Epidemiol 54:774-781.", url: "https://doi.org/10.1016/s0895-4356(01)00341-9", note: "Shows that apparent performance is over-optimistic and that the bootstrap corrects this better than splitting the sample." },
    { cite: "Steyerberg EW, Bleeker SE, Moll HA, Grobbee DE, Moons KGM (2003). Internal and external validation of predictive models: a simulation study of bias and precision in small samples. J Clin Epidemiol 56:441-447.", url: "https://doi.org/10.1016/s0895-4356(03)00047-7", note: "Shows that the bootstrap only estimates optimism correctly if the predictor selection is repeated in every resample." },
    { cite: "Riley RD, Snell KIE, Martin GP, et al. (2021). Penalization and shrinkage methods produced unreliable clinical prediction models especially when sample size was small. J Clin Epidemiol 132:88-96.", url: "https://doi.org/10.1016/j.jclinepi.2020.12.005", note: "Warns that shrinkage is not a cure for small samples because the amount of shrinkage is itself uncertain." },
    { cite: "Babyak MA (2004). What you see may not be what you get: a brief, nontechnical introduction to overfitting in regression-type models. Psychosom Med 66:411-421.", url: "https://doi.org/10.1097/01.psy.0000127692.23278.a9", note: "A non-technical account of overfitting, and of how variable selection, pre-testing and dichotomising make it worse." },
    { cite: "Stock SJ, Horne M, Bruijn M, et al. (2021). Development and validation of a risk prediction model of preterm birth for women with preterm labour symptoms (the QUIDS study): a prospective cohort study and individual participant data meta-analysis. PLoS Med 18:e1003686.", url: "https://doi.org/10.1371/journal.pmed.1003686", note: "An open-access preterm birth model that reports optimism-adjusted performance, external validation, recalibration and net benefit." }
  ],
  essentials: `
<ul>
<li>A model is built on a sample, but it is meant for new women. It fits the chance quirks of its own sample as well as the real patterns. This is <b>overfitting</b>.</li>
<li>Performance in the development data is the <b>apparent performance</b>. Performance in new women from the same population is the <b>true performance</b>. The gap between them is the <b>optimism</b>: what you see may not be what you get.</li>
<li>Rates from small groups are too spread out. The lowest are too low and the highest too high, so they drift back next time (<b>regression to the mean</b>). Pulling estimates towards the average (<b>shrinkage</b>) gives better predictions.</li>
<li><b>Model uncertainty</b>: when the data choose the predictors, the cut-points or the coding, the kept effects are too large. Testing before estimating gives <b>testimation bias</b>.</li>
<li><b>Parameter uncertainty</b>: even a model fixed in advance gives predictions that are too extreme in new women. This shows as a <b>calibration slope</b> below 1.</li>
<li>Optimism is driven by the number of events compared with the number of things the model tries. Fewer events per variable means more optimism.</li>
<li>The <b>bootstrap</b> estimates the optimism: rebuild the model in many resamples, test each on the original data, and subtract the average gap. Every modelling step, including predictor selection, must be repeated in each resample.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has built a model that predicts, at the booking visit, which women will deliver before 37 weeks, and it looks very good in the team\'s own data. In this module a statistician asks how much of that is real. The team looks at chance in small numbers, at choosing predictors by p-values, at why predictions come out too extreme, and at how the bootstrap gives an honest estimate. You do not need the earlier modules for this story.',
  defs: {
    'overfitting': 'Fitting a model so closely to one sample that it captures chance patterns which will not appear in new people.',
    'apparent performance': 'How well a model performs in the same data that were used to build it.',
    'optimism': 'The amount by which apparent performance is better than performance in new people from the same population.',
    'regression to the mean': 'The tendency of extreme values, partly due to chance, to be less extreme when measured again.',
    'shrinkage': 'Pulling estimates towards the average (or coefficients towards zero) to make predictions less extreme and more accurate.',
    'testimation bias': 'The overestimation of an effect that was kept in a model only because it passed a significance test.',
    'model uncertainty': 'Uncertainty that comes from letting the data decide the structure of the model, such as which predictors are kept.',
    'parameter uncertainty': 'Uncertainty that comes from estimating each coefficient with error, even when the model is fixed in advance.',
    'calibration slope': 'The slope found when the model\'s linear predictor is fitted to outcomes in new data; below 1 means predictions are too extreme.',
    'bootstrap': 'Drawing many samples of the same size, with replacement, from the data you have, to imitate drawing new samples from the population.'
  },
  explainers: [
    {
      id: 'rtm',
      title: 'Why the best and worst centres drift back',
      scenes: [
        { svg: EX.svg((function () { var B = EX.box({ l: 70, t: 50, w: 440, h: 190, xlim: [0.5, 20.5], ylim: [0, 0.25], yticks: [0, 0.12, 0.24], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: '20 health centres, about 50 births each per quarter', ylabel: 'Preterm rate' }); return B.s + EX.text(70, 32, 'Every centre has the same true risk: 12%', { size: 'm', bold: true }) + EX.text(505, 143, 'true 12%', { size: 's', anchor: 'end', d: 0.6 }); })()),
          say: 'Twenty health centres each have about 50 births a quarter. Suppose every centre has exactly the same true risk of preterm birth, 12 per cent.' },
        { svg: EX.svg((function () { var a = [7, 6, 6, 1, 6, 11, 5, 2, 4, 10, 9, 6, 3, 3, 11, 3, 6, 5, 8, 3]; var B = EX.box({ l: 70, t: 50, w: 440, h: 190, xlim: [0.5, 20.5], ylim: [0, 0.25], yticks: [0, 0.12, 0.24], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: '20 health centres, about 50 births each per quarter', ylabel: 'Preterm rate' }); return B.s + EX.text(70, 32, 'Quarter 1: observed rates run from 2% to 22%', { size: 'm', bold: true }) + EX.pts(B, a.map(function (k, i) { return [i + 1, k / 50]; }), { role: 'obs', stagger: 0.08 }); })()),
          say: 'Yet the observed rates in the first quarter run from 2 per cent to 22 per cent. Nothing differs between the centres. The whole spread is chance.' },
        { svg: EX.svg((function () { var a = [7, 6, 6, 1, 6, 11, 5, 2, 4, 10, 9, 6, 3, 3, 11, 3, 6, 5, 8, 3], lo = [4, 8, 13], hi = [6, 10, 15]; var B = EX.box({ l: 70, t: 50, w: 440, h: 190, xlim: [0.5, 20.5], ylim: [0, 0.25], yticks: [0, 0.12, 0.24], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: '20 health centres, about 50 births each per quarter', ylabel: 'Preterm rate' }); return B.s + EX.text(70, 32, 'Best three average 4%; worst three average 21%', { size: 'm', bold: true }) + EX.pts(B, a.map(function (k, i) { return [i + 1, k / 50]; }), { role: 'line' }) + EX.pts(B, lo.concat(hi).map(function (c) { return [c, a[c - 1] / 50]; }), { role: 'obs', r: 6, d: 0.4, stagger: 0.15 }); })()),
          say: 'The district ranks the centres. The best three average 4 per cent and the worst three average 21 per cent. It is tempting to praise the first group and blame the second.' },
        { svg: EX.svg((function () { var a = [7, 6, 6, 1, 6, 11, 5, 2, 4, 10, 9, 6, 3, 3, 11, 3, 6, 5, 8, 3], b = [6, 9, 5, 8, 6, 4, 8, 4, 6, 5, 13, 5, 5, 6, 5, 7, 6, 5, 4, 4], ex = [4, 8, 13, 6, 10, 15]; var B = EX.box({ l: 70, t: 50, w: 440, h: 190, xlim: [0.5, 20.5], ylim: [0, 0.25], yticks: [0, 0.12, 0.24], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: '20 health centres, about 50 births each per quarter', ylabel: 'Preterm rate' }); return B.s + EX.text(70, 32, 'Quarter 2: best rise to 11%, worst fall to 9%', { size: 'm', bold: true }) + EX.pts(B, ex.map(function (c) { return [c, a[c - 1] / 50]; }), { role: 'pred', r: 5 }) + EX.pts(B, ex.map(function (c) { return [c, b[c - 1] / 50]; }), { role: 'obs', r: 5, d: 0.6, stagger: 0.1 }) + EX.gaps(B, ex.map(function (c) { return [c, a[c - 1] / 50, b[c - 1] / 50]; }), { d: 1.4 }); })()),
          say: 'Use the first quarter\'s rates as predictions for the next quarter. The best three rise to about 11 per cent and the worst three fall to about 9 per cent. The red lines are the errors of those predictions.' },
        { svg: EX.svg((function () { var a = [7, 6, 6, 1, 6, 11, 5, 2, 4, 10, 9, 6, 3, 3, 11, 3, 6, 5, 8, 3], m = 0.115, s = ''; var B = EX.box({ l: 70, t: 50, w: 440, h: 190, xlim: [0.5, 20.5], ylim: [0, 0.25], yticks: [0, 0.12, 0.24], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: '20 health centres, about 50 births each per quarter', ylabel: 'Preterm rate' }); s = B.s + EX.text(70, 32, 'Shrinkage: pull each rate towards the average', { size: 'm', bold: true }) + EX.pts(B, a.map(function (k, i) { return [i + 1, k / 50]; }), { role: 'obs' }); a.forEach(function (k, i) { var r = k / 50, sh = m + 0.3 * (r - m); s += EX.line([[B.X(i + 1), B.Y(r)], [B.X(i + 1), B.Y(sh)]], { role: 'pred', w: 1.5, d: 0.5 + 0.04 * i }); }); return s + EX.pts(B, a.map(function (k, i) { return [i + 1, m + 0.3 * (k / 50 - m)]; }), { role: 'pred', r: 3.5, d: 1.4 }); })()),
          say: 'This is regression to the mean. The cure is shrinkage: pull each centre\'s rate towards the overall average, more strongly when centres are small. The shrunken rates predict the next quarter better.' },
        { svg: EX.svg(EX.text(280, 110, 'A model is like a ranking of small centres', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 150, 'Its highest and lowest predictions are partly chance', { anchor: 'middle', d: 0.6 }) + EX.text(280, 176, 'In new women they move back towards the average', { anchor: 'middle', d: 1.2 }) + EX.text(280, 202, 'Fewer events: more chance, so more shrinkage needed', { anchor: 'middle', d: 1.8 })),
          say: 'A prediction model behaves the same way. Its highest and lowest predictions are partly chance, so in new women they move back towards the average. The fewer the events, the more this happens.' }
      ]
    },
    {
      id: 'bootstrap',
      title: 'How the bootstrap measures optimism',
      scenes: [
        { svg: EX.svg((function () { var s = EX.text(40, 40, 'The original sample (10 women stand for 1,500)', { size: 'm', bold: true }); for (var i = 0; i < 10; i++) { s += EX.dots(1, { x: 70 + i * 46, y: 110, r: 14, k: 1, hrole: 'obs', hd: 0.08 * i }) + EX.text(70 + i * 46, 145, String(i + 1), { size: 's', anchor: 'middle', d: 0.08 * i }); } return s + EX.text(40, 220, 'Model built here: apparent c statistic 0.792', { d: 1.2 }); })()),
          say: 'Start from the data we have. Here ten women stand for the team\'s 1,500. The model built on all of them has an apparent c statistic of 0.792.' },
        { svg: EX.svg((function () { var draw = [3, 7, 7, 1, 10, 4, 3, 9, 2, 7], seen = { 1: 1, 2: 1, 3: 1, 4: 1, 7: 1, 9: 1, 10: 1 }, s = EX.text(40, 40, 'A bootstrap sample: 10 draws, each put back', { size: 'm', bold: true }); for (var i = 0; i < 10; i++) { s += EX.dots(1, { x: 70 + i * 46, y: 90, r: 11, k: seen[i + 1] ? 1 : 0, hrole: 'obs' }) + EX.text(70 + i * 46, 120, String(i + 1), { size: 's', anchor: 'middle' }); } draw.forEach(function (w, j) { s += EX.dots(1, { x: 70 + j * 46, y: 190, r: 11, k: 1, hrole: 'obs', hd: 0.3 + 0.15 * j }) + EX.text(70 + j * 46, 220, String(w), { size: 's', anchor: 'middle', d: 0.3 + 0.15 * j }); }); return s + EX.text(40, 265, 'Woman 7 appears 3 times; women 5, 6 and 8 not at all', { d: 2 }); })()),
          say: 'Now draw ten women at random, putting each one back after it is drawn. Some women come up twice or more and some not at all. Here 7 of the 10 appear. On average about 63 per cent do.' },
        { svg: EX.svg((function () { var Y0 = 250, h = function (c) { return (c - 0.5) * 520; }; return EX.text(40, 40, 'Rebuild the model in the bootstrap sample', { size: 'm', bold: true }) + EX.rect(130, Y0 - h(0.811), 90, h(0.811), { role: 'obs', grow: true }) + EX.text(175, Y0 - h(0.811) - 8, '0.811', { anchor: 'middle', d: 0.6 }) + EX.text(175, 272, 'on its own sample', { size: 's', anchor: 'middle' }) + EX.rect(300, Y0 - h(0.771), 90, h(0.771), { role: 'obs', op: 0.55, grow: true, d: 1 }) + EX.text(345, Y0 - h(0.771) - 8, '0.771', { anchor: 'middle', d: 1.6 }) + EX.text(345, 272, 'on the original data', { size: 's', anchor: 'middle', d: 1 }) + EX.line([[405, Y0 - h(0.811)], [405, Y0 - h(0.771)]], { role: 'err', w: 4, d: 2.2 }) + EX.text(415, Y0 - h(0.79), 'optimism 0.040', { role: 'err', d: 2.4 }); })()),
          say: 'Rebuild the model in this bootstrap sample, repeating every step. It scores a c statistic of 0.811 on its own sample but only 0.771 on the original data. The gap, 0.040, is the optimism of this one repeat.' },
        { svg: EX.svg((function () { var g = [0.040, 0.027, 0.055, 0.026, 0.046], s = EX.text(40, 40, 'Repeat many times and average the gaps', { size: 'm', bold: true }); g.forEach(function (v, i) { s += EX.rect(90 + i * 80, 230 - v * 2600, 50, v * 2600, { role: 'err', grow: true, d: 0.3 * i }) + EX.text(115 + i * 80, 222 - v * 2600, v.toFixed(3), { size: 's', anchor: 'middle', d: 0.3 * i + 0.4 }); }); return s + EX.text(40, 270, 'Average optimism of these 5 repeats: 0.194 ÷ 5 = 0.039', { bold: true, d: 1.8 }); })()),
          say: 'Repeat this at least a hundred times. Here five repeats give gaps between 0.026 and 0.055. Their average, about 0.039, estimates the optimism of the original model.' },
        { svg: EX.svg((function () { var Y0 = 250, h = function (c) { return (c - 0.5) * 520; }; return EX.text(40, 40, 'Corrected c = apparent − average optimism', { size: 'm', bold: true }) + EX.rect(150, Y0 - h(0.792), 90, h(0.792), { role: 'obs', grow: true }) + EX.text(195, Y0 - h(0.792) - 8, '0.792', { anchor: 'middle', d: 0.5 }) + EX.text(195, 272, 'apparent', { size: 's', anchor: 'middle' }) + EX.rect(320, Y0 - h(0.753), 90, h(0.753), { role: 'pred', op: 0.5, grow: true, d: 1 }) + EX.text(365, Y0 - h(0.753) - 8, '0.753', { anchor: 'middle', d: 1.5 }) + EX.text(365, 272, 'expected in new women', { size: 's', anchor: 'middle', d: 1 }) + EX.line([[440, Y0 - h(0.792)], [440, Y0 - h(0.753)]], { role: 'err', w: 4, d: 2 }) + EX.text(452, Y0 - h(0.773), '0.039', { role: 'err', d: 2.2 }); })()),
          say: 'Subtract the average optimism from the apparent value. 0.792 minus 0.039 gives 0.753. This is the c statistic we expect in new women from the same hospital.' },
        { svg: EX.svg(EX.text(280, 110, 'Replay every step in every resample', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 150, 'Predictor selection, cut-point searches, coding choices', { anchor: 'middle', d: 0.6 }) + EX.text(280, 176, 'Skip them and the optimism is underestimated', { anchor: 'middle', d: 1.2 }) + EX.text(280, 202, 'In the book\'s example it was cut by half', { anchor: 'middle', d: 1.8 })),
          say: 'One rule matters most. If the data chose the predictors, the choosing must be repeated inside every bootstrap sample. Otherwise the optimism is underestimated. In the book\'s example, skipping this cut it by half.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'Ranking the health centres',
      aim: 'see why rates from small groups are too extreme, and why pulling them towards the average helps.',
      minutes: 15,
      need: `
<p>A model is built on a <b>sample</b> of women only because they stand for a larger <b>population</b>. It is useful if it predicts well for new women. The danger is that it describes its own sample too well, chance quirks included. This is <b>overfitting</b>.</p>
<p>Performance in the development data is the <b>apparent performance</b>. Performance in new women like them is the <b>true performance</b>. The difference is the <b>optimism</b>:</p>
<div class="formula">optimism = apparent performance − true performance</div>
<p><b>Chance in small numbers.</b> The simplest overfitting needs no regression at all. Suppose every health centre has a true preterm risk of 12%. A centre with 50 births a quarter expects 6 preterm births. But by chance about 5 centres in 100 will see 2 or fewer (4% or less), and about 7 in 100 will see 10 or more (20% or more). With 500 births the observed rate nearly always lies between 9% and 15%.</p>
<p>So the lowest observed rates are mostly too low and the highest mostly too high. Next time they move back towards the average. This is <b>regression to the mean</b>. Each centre's rate is a fair estimate on its own, but the set of rates is too spread out. Better predictions come from <b>shrinkage</b>: pull each rate towards the overall average, more strongly when centres are small and when true differences between centres are small.</p>
<div data-explainer="rtm"></div>`,
      scenario: `<p>The team's model gives a c statistic of 0.86 in the 600 women used to build it. Meanwhile, the district health office ranks its 20 primary health centres by their preterm birth rate. Each centre has about 50 births a quarter. The office plans to send a quality team to the "worst" centres.</p>`,
      widgets: `<div data-widget="samplingDemo" data-try="Keep the true risk at 12% and n at 200, press Draw 200 samples, then set n to 50 and watch the range of observed risk widen."></div>`,
      tasks: [0, 1],
      takeaway: 'Rates and predictions from small samples are too extreme; expect them to move back towards the average, and shrink them.'
    },
    {
      id: 'c2',
      title: 'Choosing predictors by p-value',
      aim: 'work out how selecting predictors by significance makes their effects look too large.',
      minutes: 15,
      need: `
<p>Most teams let the data decide the model: which predictors to keep, how to code them, where to cut them. They then report the final model as if it had been planned in advance. The uncertainty created by the search is ignored. This is <b>model uncertainty</b>.</p>
<p><b>Noise predictors.</b> Suppose 20 candidate predictors have no real link with preterm birth. At p &lt; 0.05, about 1 of them (20 × 0.05) will still be significant. Its estimated effect must be fairly large, or it would not have passed the test. So the model keeps a false effect of real size.</p>
<p><b>Real predictors.</b> A real coefficient varies from sample to sample around its true value. If we keep it only when it passes a test, we keep the samples where it came out large. Because we <b>test</b> before we <b>estimate</b>, this is called <b>testimation bias</b>.</p>
<div class="callout eg"><b>Worked example (book example): true coefficient 1, standard error 0.5</b>
<ol>
<li>To be significant at p &lt; 0.05 the estimate must be above 1.96 × 0.5 = 0.98.</li>
<li>The estimates follow a normal curve with mean 1 and standard deviation 0.5. The share above 0.98 is P(Z &gt; (0.98 − 1) ÷ 0.5) = P(Z &gt; −0.04) = 0.516. So 52 studies in 100 find it significant.</li>
<li>In those 52 studies the average estimate is 1.39. The bias is (1.39 − 1) ÷ 1 = +39%.</li>
</ol>
<p>Half the time the predictor is dropped. The other half its effect is overstated by about 40%. For a weaker predictor (true 0.5, standard error 0.5; our own calculation, not a book figure) only about 17 in 100 studies are significant, and their average is about 1.23, more than double the truth.</p></div>
<p>The bias is small when the effect is large compared with its standard error (big studies, strong predictors). It is absent in a <b>prespecified</b> model that keeps all candidates whatever their p-values. The same bias comes from searching for an "optimal" cut-point (such as the haemoglobin value that best splits preterm from term), keeping a square term only if significant, merging categories that look alike, or picking the coding whose plot looks best.</p>`,
      scenario: `<p>The team started with 20 candidate predictors and kept those with p &lt; 0.05. Tobacco use (smoked or smokeless) was kept, with a log odds ratio of 0.85. A colleague says it is the strongest new finding of the study.</p>`,
      widgets: `<div data-widget="testimationSim" data-try="Start at the defaults (true coefficient 1, standard error 0.5, p 0.05) and check the 52% and 1.39, then lower the standard error to 0.2 and watch the bias almost vanish."></div>`,
      tasks: [2, 3],
      takeaway: 'An effect kept because it passed a test is, on average, too large; the bias is worst for weak effects in small studies and absent in a prespecified model.'
    },
    {
      id: 'c3',
      title: 'Too extreme even when fixed in advance',
      aim: 'see why predictions are too extreme in new women and how this shows in the calibration slope and the c statistic.',
      minutes: 15,
      need: `
<p><b>Parameter uncertainty.</b> Suppose the team fixes the model in advance and never drops a predictor. Each coefficient is then estimated almost without bias. Yet the predictions are still too extreme. The linear predictor adds up many coefficients, and each carries some error. The women with the highest predictions are partly those whose errors happened to push upwards. The lowest are partly those pushed downwards. In new women, high predictions come out too high and low ones too low. This is regression to the mean again.</p>
<p><b>The calibration slope.</b> In new women, fit the outcome against the model's linear predictor (lp): logit(risk) = a + b × lp. The coefficient b is the <b>calibration slope</b>. It is exactly 1 in the development data.</p>
<ul>
<li>b = 1: the predictions have the right spread.</li>
<li>b &lt; 1: predictions are too extreme. This is the usual sign of overfitting.</li>
<li>b &gt; 1: predictions are too modest.</li>
</ul>
<p>Worked example: with a slope of 0.8, a woman whose lp is 2.0 above the average lp should really be 0.8 × 2.0 = 1.6 above it.</p>
<p><b>Shrinkage and the bias–variance trade-off.</b> Shrinking coefficients towards zero adds a little bias to each one but makes predictions less variable. Chosen well, the gain is bigger than the loss (this is linked to <b>Stein's paradox</b>). Methods come in Module 10.</p>
<p><b>Events, not women.</b> Optimism shows in every performance measure, such as the c statistic and R². Noise can always be fitted, so adding predictors always improves apparent performance, while true performance stops improving and then gets worse. For a yes/no outcome the risk depends mainly on the number of <b>events</b> per candidate coefficient (EPV). Below 10 the model is overfitted; above 10 the risk is smaller but not gone.</p>`,
      scenario: `<p>A neighbouring hospital built a preterm birth model with 12 candidate coefficients on 60 preterm births, and kept all of them. The team applies it to its own next year of bookings and groups women by tenths of predicted risk.</p>`,
      widgets: `<div data-widget="optimismSim" data-try="Set incidence to 12%, keep 3 true and 10 noise predictors, run 40 simulations at n = 300, then raise n to 2000 and watch the optimism shrink and the slope approach 1."></div>`,
      tasks: [4, 5],
      takeaway: 'Even a model fixed in advance gives too-extreme predictions in new women; the fewer the events per coefficient, the lower the calibration slope and the bigger the optimism.'
    },
    {
      id: 'c4',
      title: 'An honest estimate with the bootstrap',
      aim: 'estimate and correct optimism with the bootstrap, replaying every modelling step.',
      minutes: 15,
      need: `
<p>A <b>bootstrap</b> sample is drawn <b>with replacement</b> from the original data and has the <b>same size</b>. Some women appear once, some twice or more, some not at all. Repeating this many times imitates drawing new samples from the population.</p>
<p>The chance that one woman is never drawn in n draws is (1 − 1/n)<sup>n</sup>, close to 0.368 for any large n. So on average 63.2% of the women appear at least once in each bootstrap sample. With 1,000 women, about 632 different women appear.</p>
<p><b>Optimism correction, step by step.</b></p>
<ol>
<li>Build the model in the original data and note its <b>apparent</b> performance.</li>
<li>Draw a bootstrap sample.</li>
<li>Build a new model in it, <b>repeating every step</b> (selection, coding, cut-points). Note its performance in the bootstrap sample: the <b>bootstrap performance</b>.</li>
<li>Apply that model, unchanged, to the original data: the <b>test performance</b>.</li>
<li>Optimism of this repeat = bootstrap performance − test performance.</li>
<li>Repeat steps 2 to 5 at least 100 times and average the optimism.</li>
</ol>
<div class="formula">corrected performance = apparent performance − average optimism</div>
<p>Worked example: apparent c = 0.792; average bootstrap c = 0.810 and average test c = 0.771, so optimism = 0.039 and corrected c = 0.753. For the calibration slope the apparent and bootstrap values are 1, so the corrected slope is simply the average test slope. It estimates how much shrinkage is needed.</p>
<div data-explainer="bootstrap"></div>`,
      scenario: `<p>The team has 1,500 women with 180 preterm births and a model with 8 predictors chosen in advance. A second analyst has a 4-predictor model from backward stepwise selection. A journal also asks the team to review a published preterm model from another clinic.</p>`,
      widgets: `<div data-widget="samplingDemo" data-try="Set n to 100, press Draw 200 samples and then One bootstrap, and compare the share of women drawn at least once with 63.2%."></div>`,
      tasks: [6, 7],
      takeaway: 'Subtract the bootstrap estimate of optimism from the apparent performance, and replay every data-driven step in every resample, or the correction will still be optimistic.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Overfitting and optimism',
      html: `
<p>Overfitting means fitting a model with too many <b>degrees of freedom in the modelling process</b>. Degrees of freedom are spent not only on coefficients but on every data-driven decision: selecting predictors from candidates, coding, cut-point searches, non-linear terms and interactions. Optimism = apparent − true performance (the book writes the difference as true minus apparent; as written here it is positive).</p>
<table class="data">
<tr><th>Issue</th><th>Meaning</th></tr>
<tr><td colspan="2"><b>Causes</b></td></tr>
<tr><td>Model uncertainty</td><td>Model structure determined by the data under study</td></tr>
<tr><td>Parameter uncertainty</td><td>Coefficients estimated with error; predictions too extreme</td></tr>
<tr><td colspan="2"><b>Consequences</b></td></tr>
<tr><td>Testimation bias</td><td>Effects overestimated after selection by a test</td></tr>
<tr><td>Optimism</td><td>Performance in new patients worse than in development</td></tr>
</table>
<p class="src">Source: Ch. 5, §5.1, Table 5.1</p>`
    },
    {
      id: 'n2',
      title: 'Chance, heterogeneity and shrinkage',
      html: `
<p>With a true risk of 10% and n = 20, only 28.5% of samples show exactly 2 events; about 12% show 0 events and 13% show 4 or more (20% or higher). With n = 200, about 71% of samples lie between 8% and 12%.</p>
<div class="callout book"><b>Book example: oesophagectomy</b><p>Registry 30-day mortality was 221 of 2,031 (10.9%). Simulating 100 centres of 20 patients with 10% mortality everywhere, about 12% of centres report 0% and 13% report 20% or more, by chance alone.</p></div>
<p>If true rates differ, their spread is the <b>heterogeneity</b> τ (standard deviation of true rates). With τ = 2%, 95% of centres have true mortality between 6% and 14%; observed rates are still spread much more widely when centres are small. Shrink each estimate towards the mean, more strongly for small units and small τ. With 200 patients per centre the problem is much smaller. A quality programme tested only in the "worst" units will appear to work through regression to the mean alone.</p>
<p class="src">Source: Ch. 5, §5.1.1-5.1.4</p>`
    },
    {
      id: 'n3',
      title: 'Model uncertainty and testimation bias',
      html: `
<p>Testimation: if b is significant, use b; otherwise set b = 0. With true β = 1 and SE 0.5: |b| &gt; 0.98 is needed, P = 0.516, mean selected estimate 1.39 (+39%). With β = 0.5, SE 0.5 (our own calculation): about 17% significant, mean about 1.23. The bias is largest for weak effects relative to their SE, as is common in medical research, and is absent in a prespecified full model (which still has parameter uncertainty). Twenty noise candidates give on average one false positive at p &lt; 0.05, with a relatively large estimated effect. The same bias follows from optimal cut-points, testing transformations, merging categories, and informal looks at plots.</p>
<p class="src">Source: Ch. 5, §5.2.1-5.2.2, Fig. 5.5</p>`
    },
    {
      id: 'n4',
      title: 'Parameter uncertainty and performance measures',
      html: `
<p>Even unbiased coefficients give predictions that are too extreme: regression to the mean in the linear predictor. Shrinkage trades a little bias for less variance (Stein's paradox). In new patients the calibration slope b in logit(y) = a + b × lp is below 1 when predictions are too extreme and above 1 when too modest.</p>
<div class="callout book"><b>Book example: R² from pure noise</b><p>20 centres (19 dummies), true mortality 10% everywhere, true R² 0%: apparent Nagelkerke R² 9.4% with 20 patients per centre, 1.0% with 200 and 0.1% with 2,000. With τ = 2% (true R² about 1%) the apparent R² was 10.1% at 20 per centre.</p></div>
<p><b>Complexity.</b> In linear models fitted to samples of 50, apparent error kept falling as predictors were added (1 to 10), while error in new patients from the same (internal) or a slightly different (external) population stopped improving at about five predictors and then worsened.</p>
<p><b>Adjusted R².</b> R²<sub>adj</sub> = (1 − e<sup>−(LR − df)/n</sup>) / (1 − e<sup>−(−2 LL<sub>0</sub>)/n</sup>). In the noise simulations its average was 0, about half the values negative. It works only for a prespecified model with known df; it cannot count df spent invisibly on selection and coding.</p>
<p><b>EPV</b> = events / candidate predictor df. Below 10, overfitting is serious and a simpler model may do better (Ch. 3); above 10 optimism should still be estimated.</p>
<p class="src">Source: Ch. 5, §5.2.3-5.2.5, Table 5.2, Fig. 5.6; Ch. 3, §3.8.3</p>`
    },
    {
      id: 'n5',
      title: 'The bootstrap and optimism correction',
      html: `
<p>Book example: from ages 20, 25, 30, 32, 35, possible bootstrap samples are 20, 20, 30, 32, 35; 20, 25, 25, 30, 35; 25, 32, 35, 35, 35. A patient is included with probability 1 − (1 − 1/n)<sup>n</sup>, about 63.2% (63.25% for n = 429).</p>
<p><b>Confidence intervals:</b> normal approximation (estimate ± 1.96 × SD of bootstrap estimates); percentile (for example the 50th and 1,950th of 2,000 ordered estimates); bias-corrected (BCa) percentile. Use at least 2,000 replications for percentile methods.</p>
<p><b>Optimism</b> = mean (bootstrap − test performance), at least 100 replications. Testing on the original sample, which overlaps the bootstrap sample, is supported by theory and simulation. The .632 and .632+ variants test only on left-out patients (36.8%) and showed no clear advantage. Works for R², c and the calibration slope (corrected slope = mean test slope).</p>
<div class="callout book"><b>Book example: GUSTO-I subsample, 429 patients, Nagelkerke R²</b>
<table class="data"><tr><th>Strategy</th><th>Apparent</th><th>Bootstrap</th><th>Test</th><th>Optimism</th><th>Corrected</th></tr>
<tr><td>Full 8-predictor model</td><td>22.7%</td><td>24.7%</td><td>17.2%</td><td>7.6%</td><td>15.1%</td></tr>
<tr><td>Backward stepwise p &lt; 0.05 (3 predictors), selection replayed</td><td>17.6%</td><td>18.7%</td><td>12.7%</td><td>5.9%</td><td>11.7%</td></tr>
<tr><td>Same 3 predictors treated as prespecified</td><td>17.6%</td><td>18.2%</td><td>15.4%</td><td>2.9%</td><td>14.7%</td></tr></table>
<p>Ignoring selection halved the optimism; optimism from selection was as large as from parameter uncertainty. Honestly corrected, the full model beat stepwise selection. Small differences from simple subtraction are rounding.</p></div>
<div class="callout warn"><b>Critical: validate the process, not the final formula</b><p>Steps not replayed in every bootstrap sample are not counted, so the corrected value stays optimistic. Informal steps (looking at plots) cannot be replayed; the corrected estimate is then an upper bound. Compute the optimism of the full model first: large optimism warns against relying on the data alone. A full model does especially well against stepwise selection when several nearly significant predictors would be dropped; with a few dominant predictors the two give similar results.</p></div>
<p class="src">Source: Ch. 5, §5.3-5.3.5, Tables 5.3-5.4</p>`
    },
    {
      id: 'n6',
      title: 'The cost of data analysis',
      html: `
<p>The more a model is tuned to one data set, the less it may generalise. Ignoring a clear pattern (a strongly non-linear effect) also harms predictions; repeatedly adapting the model to every small violation makes it sample-specific.</p>
<div class="callout book"><b>Book example: generalised degrees of freedom (Ye)</b><p>A stepwise procedure ending with 5 predictors had 14.1 generalised df; a regression tree with 19 nodes had 76.</p></div>
<ul>
<li>With few events, accept more assumptions; power to detect violations is low, and adapting after a test adds testimation bias.</li>
<li>Prefer strategies that are not data hungry: a prespecified model with age and parity spends 2 df; testing non-linearity and an interaction spends more; trees and stepwise selection ask the data far more.</li>
<li>The bootstrap judges one predefined strategy best; when many strategies are compared, the winner may again be sample-specific.</li>
<li>Prespecify candidate predictors from subject knowledge so that noise variables are not considered.</li>
</ul>
<p>A c statistic reported only in the development data, after stepwise selection from many candidates in a small sample, is an upper limit. Science needs curiosity and scepticism: findings must pass stringent tests such as validation.</p>
<p class="src">Source: Ch. 5, §5.4-5.5</p>`
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
      q: 'The team\'s preterm birth model has an apparent c statistic of 0.82. Bootstrap validation (200 repeats, selection replayed) gives an average bootstrap c of 0.84 and an average test c of 0.77. What is the optimism-corrected c?',
      options: ['0.77', '0.80', '0.75', '0.84'],
      answer: 2,
      why: 'Optimism = 0.84 − 0.77 = 0.07, so corrected c = 0.82 − 0.07 = 0.75. Choosing 0.77 takes the average test c directly, which is a cruder bootstrap method; 0.80 subtracts the wrong difference (0.84 − 0.82); 0.84 is the bootstrap performance, which is even more optimistic than the apparent value.'
    },
    {
      q: 'Twenty candidate predictors in the preterm study are, in truth, unrelated to preterm birth. How many would you expect to be significant at p < 0.05, and what will their estimated effects look like?',
      options: ['About 1; its estimated effect will be fairly large', 'None; noise variables cannot reach significance', 'About 1; its estimated effect will be close to zero', 'About 5; their effects will average out to zero'],
      answer: 0,
      why: '20 × 0.05 = 1 expected false positive. To pass the test its estimate must be far from zero, so the kept effect is fairly large, even though the average of all its possible estimates is zero. The third option forgets that significance needs a large estimate; noise can and does reach significance by chance.'
    },
    {
      q: 'Which approach to the haemoglobin predictor gives little or no testimation bias?',
      options: ['Keeping haemoglobin only if p < 0.05 in a small sample', 'Adding a square term for haemoglobin and keeping it only if significant', 'A prespecified full model that keeps haemoglobin and all other candidates regardless of p-values', 'Choosing the haemoglobin cut-point that gives the largest chi-square'],
      answer: 2,
      why: 'Testimation bias comes from keeping effects that passed a test. A prespecified model selects nothing. The other three are all data-driven choices that favour estimates inflated by chance. A prespecified model still has parameter uncertainty, so its predictions can still be too extreme.'
    },
    {
      q: 'The team\'s model is applied to next year\'s bookings at the same hospital, and the calibration slope is 0.70. What does this mean?',
      options: ['Predictions are too modest; high risks should be higher', 'Predictions are too extreme; the model was probably overfitted', 'The average predicted risk is 30% too high', 'Discrimination is 30% lower than in development'],
      answer: 1,
      why: 'A slope below 1 means the spread of the linear predictor is too wide: high predictions are too high and low ones too low, the usual result of overfitting. The slope says nothing directly about the average level of risk (calibration-in-the-large), and it is not a percentage loss in the c statistic. The first option describes a slope above 1.'
    },
    {
      q: 'A bootstrap sample is drawn from the 1,000 women in a preterm cohort. About how many different women from the original data will appear in it at least once?',
      options: ['368', '500', '1,000', '632'],
      answer: 3,
      why: 'Each woman is missed with probability (1 − 1/1000)^1000, about 0.368, so about 63.2% (632) appear at least once. The bootstrap sample still has 1,000 records, because some women appear more than once. 368 is the number expected to be left out.'
    },
    {
      q: 'A team builds a preterm model by univariate screening, then backward stepwise selection, then bootstraps the final 4-predictor model as if it had been chosen in advance. What follows?',
      options: ['The optimism is underestimated, because the uncertainty from screening and selection is ignored', 'The optimism is overestimated, because the bootstrap counts the selection twice', 'The estimate is unbiased, because the final model is what will be used', 'The bootstrap cannot be applied to stepwise models at all'],
      answer: 0,
      why: 'Every data-driven step must be repeated in each bootstrap sample. In the book\'s GUSTO-I example, treating a stepwise model as prespecified gave an optimism of 2.9% instead of 5.9% in R². The third option is the common misconception: we validate the modelling process, not only the final formula. Stepwise selection can be replayed, so the last option is wrong.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Apparent, true and optimism',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). The team's model reports c = 0.86 in its own 600 women. Applied to the next 600 women at the same hospital, with the same outcome definition and the same measurements, it gives c = 0.74.</p>
<p>The district health office ranks its 20 centres by this quarter's preterm rate (about 50 births each) and plans to send a quality team to the ten "worst" centres, then measure them again next quarter.</p>`,
      questions: [
        '<b>(a)</b> Which number is the apparent performance, which estimates the true performance, and what is the optimism?',
        '<b>(b)</b> Why can the drop not be blamed on a change in the hospital?',
        '<b>(c)</b> If the quality team does nothing useful, what will the ten "worst" centres probably show next quarter? Why would a before-and-after comparison mislead?'
      ],
      answer: `<p><b>(a)</b> Apparent c = 0.86 (same data used to build the model). The 0.74 in new women from the same hospital estimates the true performance. Optimism = 0.86 − 0.74 = 0.12.</p>
<p><b>(b)</b> The hospital, the outcome definition and the measurements are unchanged. The drop is the price of having fitted chance patterns in the first 600 women: what you see may not be what you get.</p>
<p><b>(c)</b> Their rates will, on average, be lower next quarter, closer to the district average. Some of them were "worst" partly by chance, and chance does not repeat (regression to the mean). A before-and-after comparison in the worst centres only would make the quality team look effective even if it did nothing. A fair evaluation needs a comparison group, for example similar centres without the visit, and rates shrunk towards the average before ranking.</p>`
    },
    {
      id: 't1',
      title: 'How much do small centres vary by chance?',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). Suppose all 20 centres have the same true preterm risk of 12%, and each has 50 births a quarter. For a binomial count with n = 50 and risk 12%, the chance of 2 or fewer events is 0.051 and the chance of 10 or more is 0.071.</p>`,
      questions: [
        '<b>(a)</b> How many preterm births does each centre expect per quarter?',
        '<b>(b)</b> Of the 20 centres, about how many will show a rate of 4% or less, and how many 20% or more, purely by chance?',
        '<b>(c)</b> The standard deviation of an observed risk is √(p × (1 − p) ÷ n). Calculate it for n = 50 and n = 500.',
        '<b>(d)</b> Check with the sampling widget: true risk 12%, n = 50, press Draw 200 samples and read the 2.5th to 97.5th percentile range. Repeat with n = 500.'
      ],
      answer: `<p><b>(a)</b> 0.12 × 50 = 6 preterm births (12%).</p>
<p><b>(b)</b> 4% or less means 2 or fewer births: 20 × 0.051 = about 1 centre. 20% or more means 10 or more: 20 × 0.071 = about 1.4 centres. So one or two centres will look "excellent" and one or two "poor" although all are identical.</p>
<p><b>(c)</b> n = 50: √(0.12 × 0.88 ÷ 50) = √0.002112 = 0.046, or 4.6 percentage points. n = 500: √(0.12 × 0.88 ÷ 500) = √0.0002112 = 0.0145, or 1.5 points. Ten times the births gives about a third of the spread (√10 = 3.16).</p>
<p><b>(d)</b> With n = 50 the range is roughly 4% to 22%; with n = 500 roughly 9% to 15%. The exact limits vary slightly from run to run. Rankings of small centres mostly rank chance.</p>`
    },
    {
      id: 't2',
      title: 'How much is the tobacco effect inflated?',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). Suppose the true log odds ratio for tobacco use is 0.6, and in a study of the team's size it is estimated with a standard error of 0.3. Tobacco is kept only if p &lt; 0.05 (two-sided). For a normal curve, the share above z = −0.04 is 0.516, and the average z among those values is 0.773.</p>`,
      questions: [
        '<b>(a)</b> How large must the estimate be to pass the test?',
        '<b>(b)</b> In what share of studies will tobacco be kept?',
        '<b>(c)</b> What is the average estimate in the studies that keep it, and the percentage bias?',
        '<b>(d)</b> Compare your answer with the book\'s example (true 1, standard error 0.5). What do the two have in common?'
      ],
      answer: `<p><b>(a)</b> 1.96 × 0.3 = 0.588. (An estimate below −0.588 would also pass, but that is very unlikely when the truth is 0.6.)</p>
<p><b>(b)</b> z = (0.588 − 0.6) ÷ 0.3 = −0.04. The share above is 0.516, so about 52 studies in 100 keep tobacco.</p>
<p><b>(c)</b> Average kept estimate = 0.6 + 0.3 × 0.773 = 0.832. Bias = (0.832 − 0.6) ÷ 0.6 = +39%. The odds ratio looks like e<sup>0.83</sup> = 2.30 instead of e<sup>0.6</sup> = 1.82.</p>
<p><b>(d)</b> Both have a true effect twice its standard error (0.6 ÷ 0.3 = 1 ÷ 0.5 = 2), so both give 52% kept and +39% bias. Testimation bias depends on the ratio of effect to standard error, not on the effect alone.</p>`
    },
    {
      id: 't3',
      title: 'Explore testimation bias with the simulator',
      level: 'Analyse',
      scenario: `<p>Use the selection bias simulator in this case. It has three sliders: true coefficient β, standard error, and selection threshold (p-value). It reports the share selected, the mean estimate when selected and the bias.</p>`,
      questions: [
        '<b>(a)</b> Set β = 0.6 and p = 0.05. Record the share selected and the bias for standard errors 0.15, 0.3 and 0.6.',
        '<b>(b)</b> Set the standard error back to 0.3. Change the threshold to p = 0.20, then p = 0.50. What happens to the bias, and why?',
        '<b>(c)</b> On the plot, where is the bias largest? Why does it fall for large values of β ÷ SE?',
        '<b>(d)</b> The colleague in this case calls tobacco (log odds ratio 0.85) "the strongest new finding". Comment.'
      ],
      answer: `<p><b>(a)</b> Expected values (the simulator gives values close to these): SE 0.15 (β ÷ SE = 4): about 98% selected, mean about 0.61, bias about +1%. SE 0.3 (ratio 2): about 52%, mean about 0.83, bias about +39%. SE 0.6 (ratio 1): about 17%, mean about 1.47, bias about +145%.</p>
<p><b>(b)</b> At p = 0.20 about 76% are kept and the bias falls to about +20%; at p = 0.50 about 91% are kept and the bias is about +9%. A looser threshold drops fewer of the samples where the estimate came out low, so the kept estimates are less selected.</p>
<p><b>(c)</b> The bias is largest when β ÷ SE is small: only samples where chance pushed the estimate up pass the test. When β ÷ SE is above about 3, most samples pass (about 85% at a ratio of 3 and 98% at 4), so there is little selection and little bias.</p>
<p><b>(d)</b> Tobacco was kept because it passed p &lt; 0.05 among 20 candidates in a modest study, so its estimate is probably inflated, and it may even be a false positive. A large effect in a selected model is what testimation bias predicts. It should be reported with caution, and its value checked in a prespecified model or in new data.</p>`
    },
    {
      id: 't4',
      title: 'Simulate optimism and the calibration slope',
      level: 'Analyse',
      scenario: `<p>Use the optimism simulator in this case. Its sliders are development sample size n, outcome incidence, true predictors (each β = 0.5) and noise predictors (β = 0). Each run fits 40 models and tests them in a large fresh sample. Results vary a little from run to run.</p>`,
      questions: [
        '<b>(a)</b> Set incidence 12%, 3 true and 10 noise predictors. Run at n = 200, 500 and 2000. Tabulate EPV, apparent c, honest c and calibration slope. Describe the pattern.',
        '<b>(b)</b> At n = 300 and incidence 12%, compare 0 noise predictors with 30. What happens to apparent c, honest c and the slope?',
        '<b>(c)</b> Set 0 true and 10 noise predictors at n = 200. What is the honest c, and what is the apparent c?',
        '<b>(d)</b> Use your results to judge the claim "with EPV of 10 or more, overfitting is not a concern".'
      ],
      answer: `<p><b>(a)</b> Approximate results from the same set-up (13 candidates):</p>
<table class="data"><tr><th>n</th><th>Events</th><th>EPV</th><th>Apparent c</th><th>Honest c</th><th>Slope</th></tr>
<tr><td>200</td><td>24</td><td>24 ÷ 13 = 1.8</td><td>about 0.80</td><td>about 0.66</td><td>about 0.45</td></tr>
<tr><td>500</td><td>60</td><td>4.6</td><td>about 0.76</td><td>about 0.69</td><td>about 0.67</td></tr>
<tr><td>2000</td><td>240</td><td>18.5</td><td>about 0.73</td><td>about 0.71</td><td>about 0.9</td></tr></table>
<p>As events rise, apparent and honest c come together and the slope approaches 1. The honest c can never beat the true model (about 0.72).</p>
<p><b>(b)</b> With 0 noise (36 events, EPV 12): apparent about 0.73, honest about 0.71, slope about 0.9. With 30 noise (EPV about 1.1): apparent rises to about 0.85, honest falls to about 0.64, slope drops to about 0.3. Noise is always fitted in the development data and always costs in new data.</p>
<p><b>(c)</b> The honest c is about 0.50 (no real information), yet the apparent c is about 0.69. Pure noise can look like a useful model.</p>
<p><b>(d)</b> The claim goes too far. EPV 10 is a minimum below which overfitting is severe. Above it the optimism and the slope deficit are smaller but not zero (at EPV 12 the slope was still a little below 1). Testimation bias also depends on selection and on β ÷ SE. Optimism should be estimated, for example by the bootstrap, not assumed absent.</p>`
    },
    {
      id: 't5',
      title: 'Read a calibration slope',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). The neighbouring hospital's model (60 preterm births, 12 coefficients) is applied to the team's next year of bookings. In the lowest tenth of predicted risk it predicts 2%; 5% of those women deliver early. In the highest tenth it predicts 55%; 38% deliver early. On the log-odds scale: 2% is −3.89, 55% is 0.20, 5% is −2.94 and 38% is −0.49.</p>`,
      questions: [
        '<b>(a)</b> Calculate the EPV of the model.',
        '<b>(b)</b> Using the two groups, estimate the calibration slope as (difference in observed log-odds) ÷ (difference in predicted log-odds).',
        '<b>(c)</b> Explain in plain words what the slope means for women at high and low predicted risk.',
        '<b>(d)</b> Is the model useless? What would you suggest?'
      ],
      answer: `<p><b>(a)</b> EPV = 60 ÷ 12 = 5, below the minimum of 10.</p>
<p><b>(b)</b> Observed difference = −0.49 − (−2.94) = 2.45. Predicted difference = 0.20 − (−3.89) = 4.09. Slope ≈ 2.45 ÷ 4.09 = 0.60.</p>
<p><b>(c)</b> The predictions are too spread out. Women told they have a high risk have a lower risk than predicted (38% rather than 55%), and women told they have a low risk have a higher risk (5% rather than 2%). On the log-odds scale each woman's distance from the average should be multiplied by about 0.6.</p>
<p><b>(d)</b> Not useless: the ranking still separates women (38% against 5%). But the risks cannot be used as they stand. The coefficients could be shrunk (multiplied by about 0.6, with the intercept re-estimated), or the model recalibrated in local data (Modules 10 and 14). The overfitting was predictable from the EPV of 5.</p>`
    },
    {
      id: 't6',
      title: 'Calculate optimism-corrected performance',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The team's model has 8 predictors chosen in advance and is built in 1,500 women with 180 preterm births. Its apparent c statistic is 0.792. Five bootstrap repeats are shown (in practice at least 100 are needed).</p>
<table class="data"><tr><th>Repeat</th><th>c in bootstrap sample</th><th>c in original data (test)</th><th>Calibration slope in original data</th></tr>
<tr><td>1</td><td>0.811</td><td>0.771</td><td>0.84</td></tr>
<tr><td>2</td><td>0.806</td><td>0.779</td><td>0.90</td></tr>
<tr><td>3</td><td>0.819</td><td>0.764</td><td>0.79</td></tr>
<tr><td>4</td><td>0.801</td><td>0.775</td><td>0.88</td></tr>
<tr><td>5</td><td>0.814</td><td>0.768</td><td>0.84</td></tr></table>
<p>A second analyst kept 4 of the 8 predictors by backward stepwise selection (apparent c 0.781). Replaying the selection in each bootstrap sample gave an average bootstrap c of 0.806 and test c of 0.752. Bootstrapping only the final 4-predictor model, as if chosen in advance, gave 0.789 and 0.773.</p>`,
      questions: [
        '<b>(a)</b> Calculate the optimism of each repeat, the average optimism and the corrected c for the 8-predictor model.',
        '<b>(b)</b> Calculate the corrected calibration slope and say what it means.',
        '<b>(c)</b> Calculate the corrected c of the stepwise model both ways. Which is right, and which model would you prefer?',
        '<b>(d)</b> Why is the average bootstrap c (0.810) higher than the apparent c (0.792)?'
      ],
      answer: `<p><b>(a)</b> Optimism: 0.811 − 0.771 = 0.040; 0.806 − 0.779 = 0.027; 0.819 − 0.764 = 0.055; 0.801 − 0.775 = 0.026; 0.814 − 0.768 = 0.046. Sum 0.194; average 0.194 ÷ 5 = 0.0388. Corrected c = 0.792 − 0.039 = 0.753.</p>
<p><b>(b)</b> The apparent and bootstrap slopes are 1 by definition. Average test slope = (0.84 + 0.90 + 0.79 + 0.88 + 0.84) ÷ 5 = 4.25 ÷ 5 = 0.85. Optimism in slope = 1 − 0.85 = 0.15, so corrected slope = 0.85. In new women predictions will be somewhat too extreme; multiplying the coefficients by about 0.85 (and re-estimating the intercept) should correct this. This is the idea behind the shrinkage methods of Module 10. The EPV here is 180 ÷ 8 = 22.5, so the optimism is modest but not zero.</p>
<p><b>(c)</b> Selection replayed: optimism = 0.806 − 0.752 = 0.054; corrected c = 0.781 − 0.054 = 0.727. Treated as prespecified: optimism = 0.789 − 0.773 = 0.016; corrected c = 0.781 − 0.016 = 0.765. Only the first is honest, because the selection was driven by the data and must be repeated in every bootstrap sample. Honestly corrected, the full model (0.753) beats the stepwise model (0.727), the same pattern as the book's GUSTO-I example.</p>
<p><b>(d)</b> Some women appear several times in a bootstrap sample, so a model built there finds its own sample easier to predict. Its performance in its own sample is therefore higher. The book notes this is common in bootstrap validation.</p>`
    },
    {
      id: 't7',
      title: 'Critique a published preterm birth model',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). An abstract reports: "We developed a preterm birth tool in 520 women at a single antenatal clinic, of whom 64 delivered before 37 weeks. From 42 candidate variables we kept those with univariate p &lt; 0.10, then applied forward stepwise selection (p &lt; 0.05), giving six predictors, including an optimal haemoglobin cut-off of 9.7 g/dL chosen as the value that best separated preterm from term births. The model showed excellent performance (c = 0.88; Hosmer-Lemeshow p = 0.61). Internal validation by bootstrapping the final six-predictor model confirmed stability (optimism 0.01). The odds ratio for haemoglobin below 9.7 g/dL was 4.9, suggesting a strong new risk factor."</p>`,
      questions: [
        '<b>(a)</b> List the sources of overfitting and label each as model uncertainty or parameter uncertainty.',
        '<b>(b)</b> Why is the reported optimism of 0.01 not believable? How should the bootstrap have been done?',
        '<b>(c)</b> What would you expect for the c statistic, the calibration slope and the haemoglobin odds ratio in new women from the same clinic?',
        '<b>(d)</b> Suggest a sounder development strategy for these data.'
      ],
      answer: `<p><b>(a)</b> Model uncertainty: 42 candidates with only 64 events (EPV = 64 ÷ 42 = 1.5); univariate screening at p &lt; 0.10; forward stepwise selection; a searched "optimal" haemoglobin cut-point. Parameter uncertainty: six coefficients estimated from 64 events, which makes predictions too extreme even if the structure had been fixed. A single small clinic also limits how far the results travel.</p>
<p><b>(b)</b> <b>Critical:</b> bootstrapping only the final model treats it as prespecified and ignores the optimism from screening, stepwise selection and the cut-point search. In the book's example this halved the estimated optimism. Every step (screening, selection, cut-point search, fitting) should have been repeated in each of at least 100 bootstrap samples, and the average optimism subtracted from the apparent c. A non-significant Hosmer-Lemeshow test in the development data says little about calibration in new women.</p>
<p><b>(c)</b> The c statistic will be clearly lower than 0.88; the calibration slope will be below 1 (predictions too extreme); the odds ratio of 4.9 is inflated by both selection and the cut-point search, and will probably be smaller. The cut-point 9.7 g/dL will probably not be reproduced.</p>
<p><b>(d)</b> Choose a small set of candidates from subject knowledge and the literature (for example previous preterm birth, short inter-pregnancy interval, bacteriuria, chronic hypertension, tobacco, haemoglobin, BMI) so that the EPV is reasonable; keep haemoglobin continuous with a sensible, prespecified coding; fit a prespecified full model; estimate optimism with a bootstrap of the whole procedure and shrink the coefficients; report calibration as well as discrimination; and seek validation in other clinics. Claims about a "new risk factor" belong to aetiological research, not to an overfitted prediction model.</p>`
    }
  ]
});
