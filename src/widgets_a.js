/* ===== Widget batch A: primer, design and sample-size tools ===== */
(function () {
  var f = K.f, pct = K.pct, plogis = PM.plogis;

  K.widget('datasetCard', function (P, setId) {
    var s = PM.data.sets[setId], rows = PM.data.get(setId);
    var n = rows.length, ev = rows.reduce(function (a, r) { return a + r[s.outcome]; }, 0);
    P.draw = function () {
      var miss = s.cols.filter(function (c) { return c !== 'id'; }).map(function (c) { var m = rows.filter(function (r) { return r[c] === null; }).length; return [c, s.labels[c], m ? m + ' (' + pct(m / n) + ')' : '0']; });
      var head = '<p><b>' + s.title + '</b><br><span class="note">' + s.setting + ' (fictional setting; all records simulated). File: <code>' + s.file + '</code></span></p>' +
        K.stats([['Records', n], ['Outcome events', ev], ['Event rate', pct(ev / n)], ['Variables', s.cols.length - 1]]);
      var cb = K.tbl(['Variable', 'Meaning', 'Missing'], miss.map(function (r) { return ['<code>' + r[0] + '</code>', r[1], r[2]]; }), 'tbl-s');
      cb = cb.replace(/<th class="r">Meaning/, '<th>Meaning');
      var first = rows.slice(0, 8), tr = '<div class="scroll"><table class="data tbl-s"><thead><tr>' + s.cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
        first.map(function (r) { return '<tr>' + s.cols.map(function (c) { return '<td>' + (r[c] === null ? '–' : r[c]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      var mm = s.cols.filter(function (c) { return c !== 'id'; }).map(function (c) { return { c: c, m: rows.filter(function (r) { return r[c] === null; }).length }; }).sort(function (a, b) { return b.m - a.m; });
      P.notice('The outcome occurs in ' + ev + ' of ' + n + ' records (' + pct(ev / n) + '). ' + (mm.length && mm[0].m ? 'Missing values are most frequent in <code>' + mm[0].c + '</code> (' + pct(mm[0].m / n) + '), so a complete-case analysis would drop those records.' : 'No variable has missing values.'));
      P.out.innerHTML = head + '<h4>Codebook</h4>' + cb + '<h4>First 8 rows</h4>' + tr;
    };
    P.btn('Download CSV', function (b) { K.save(s.file, PM.data.toCSV(setId), b); P.notice('Saved ' + s.file + ': ' + n + ' records and ' + s.cols.length + ' columns, with missing values left blank for you to handle.'); }, true);
    P.btn('Download codebook', function (b) { K.save(s.file.replace('.csv', '_codebook.txt'), PM.data.codebook(setId), b); P.notice('Saved the codebook for ' + s.file + ': read the variable definitions and missing-value codes before fitting anything.'); });
    P.root.querySelector('.wg-h .btn').style.display = 'none';
  });

  K.widget('oddsConverter', function (P) {
    P.slider('p', 'Probability (%)', 0.1, 99.9, 0.1, 12, function (x) { return x.toFixed(1) + '%'; });
    P.number('odds', 'Or type odds (e.g. 0.25 for 1 to 4)', 0.25, 0.001, 1000, 0.01);
    P.draw = function () {
      var p = P.v.p / 100, o = p / (1 - p), po = P.v.odds / (1 + P.v.odds);
      P.notice('A probability of ' + pct(p, 1) + ' is odds of ' + f(o, 3) + ' and log-odds of ' + f(Math.log(o), 2) + '. ' + (p < 0.1 ? 'At this low risk the odds are almost the probability (ratio ' + f(o / p, 2) + '), which is why odds ratios approximate risk ratios for rare outcomes.' : p > 0.5 ? 'Above 50% the odds exceed 1 and climb steeply.' : 'The odds are now ' + f(o / p, 2) + ' times the probability, so the two are no longer interchangeable.') + ' Typed odds of ' + f(P.v.odds, 3) + ' equal ' + pct(po, 1) + '.');
      P.out.innerHTML = K.stats([['Probability', pct(p, 1)], ['Odds', f(o, 3)], ['1 in', f(1 / p, 1)], ['Log-odds (logit)', f(Math.log(o), 3)]]) +
        '<p class="note">Odds = p / (1 − p). Probability = odds / (1 + odds). Log-odds is the scale on which logistic regression coefficients add.</p>' +
        '<p>Typed odds <b class="num">' + f(P.v.odds, 3) + '</b> correspond to probability <b class="num">' + pct(po, 2) + '</b> (log-odds ' + f(Math.log(P.v.odds), 3) + ').</p>';
    };
  });

  K.widget('logisticCurve', function (P) {
    P.slider('a', 'Intercept α (log-odds when x = 0)', -7, 2, 0.1, -3.5, function (x) { return f(x, 1); });
    P.slider('b', 'Coefficient β (log-odds per unit of x)', -1, 1.5, 0.05, 0.4, function (x) { return f(x, 2); });
    P.check('bin', 'Binary predictor (x is 0 or 1)', false);
    P.draw = function () {
      var a = P.v.a, b = P.v.b, orr = Math.exp(b);
      if (P.v.bin) {
        var p0 = plogis(a), p1 = plogis(a + b);
        var rr = p1 / p0;
        P.notice(Math.abs(b) < 1e-9 ? 'With β = 0 the predictor carries no information: both groups have a risk of ' + pct(p0) + ' and the odds ratio is 1.' : 'The odds ratio is ' + f(orr, 2) + ' but the risk ratio is ' + f(rr, 2) + ' (baseline risk ' + pct(p0) + '). ' + (Math.abs(Math.log(orr)) - Math.abs(Math.log(rr)) > 0.03 ? 'The odds ratio exaggerates the risk ratio because the outcome is not rare; lower α to bring them together.' : 'They are close because the outcome is uncommon at this baseline.'));
        P.out.innerHTML = K.stats([['Risk if x = 0', pct(p0)], ['Risk if x = 1', pct(p1)], ['Odds ratio', f(orr, 2)], ['Risk ratio', f(p1 / p0, 2)], ['Risk difference', pct(p1 - p0)]]) +
          '<p class="note">With a binary predictor the model reproduces the two observed risks exactly. The odds ratio is exp(β); the risk ratio and difference depend on the baseline risk.</p>';
        return;
      }
      var pts = []; for (var x = 0; x <= 10.001; x += 0.1) pts.push({ x: x, y: plogis(a + b * x) });
      var pp = pts.map(function (q) { return q.y; }), hi = Math.max(0.05, Math.min(1, Math.max.apply(null, pp) * 1.1));
      var q0 = plogis(a), q5 = plogis(a + 5 * b), q10 = plogis(a + 10 * b), d1 = 100 * (q5 - q0), d2 = 100 * (q10 - q5);
      P.notice(Math.abs(b) < 1e-9 ? 'With β = 0 the curve is flat at ' + pct(q0) + ': x tells us nothing about risk.' : 'A constant odds ratio of ' + f(orr, 2) + ' per unit gives a ' + (d1 >= 0 ? 'rise' : 'fall') + ' of ' + f(Math.abs(d1), 1) + ' points from x = 0 to 5 but ' + f(Math.abs(d2), 1) + ' points from 5 to 10: the risk changes fastest where it is near 50%.');
      P.out.innerHTML = K.stats([['Odds ratio per unit', f(orr, 3)], ['Risk at x = 0', pct(plogis(a))], ['Risk at x = 5', pct(plogis(a + 5 * b))], ['Risk at x = 10', pct(plogis(a + 10 * b))]]) +
        Chart.plot({ w: 560, h: 300, xlim: [0, 10], ylim: [0, hi], xlabel: 'Predictor x', ylabel: 'Predicted risk', yfmt: function (v) { return (100 * v).toFixed(0) + '%' }, layers: [{ type: 'line', pts: pts, color: 'pred', dash: '6 4' }, { type: 'points', pts: [0, 5, 10].map(function (x) { return { x: x, y: plogis(a + b * x) }; }), color: 'pred', r: 4 }] }) +
        '<p class="note">The curve is S-shaped on the probability scale, but a straight line on the log-odds scale: log-odds = α + βx. Each extra unit of x multiplies the odds by exp(β).</p>';
    };
  });

  K.widget('bayes2x2', function (P) {
    P.slider('se', 'Sensitivity', 0.5, 0.995, 0.005, 0.85, function (x) { return pct(x, 1); });
    P.slider('sp', 'Specificity', 0.5, 0.995, 0.005, 0.9, function (x) { return pct(x, 1); });
    P.slider('pr', 'Prevalence (pre-test probability)', 0.005, 0.6, 0.005, 0.1, function (x) { return pct(x, 1); });
    P.draw = function () {
      var se = P.v.se, sp = P.v.sp, pr = P.v.pr, N = 1000, D = pr * N, H = N - D;
      var tp = se * D, fn = D - tp, tn = sp * H, fp = H - tn;
      var lrp = se / (1 - sp), lrm = (1 - se) / sp, prior = pr / (1 - pr), postP = prior * lrp, postN = prior * lrm;
      var ppv = postP / (1 + postP), npvc = postN / (1 + postN);
      var tbl = '<div class="tw"><table class="data"><thead><tr><th></th><th class="r">Disease</th><th class="r">No disease</th><th class="r">Total</th></tr></thead><tbody>' +
        '<tr><td>Test positive</td><td class="r">' + f(tp, 1) + '</td><td class="r">' + f(fp, 1) + '</td><td class="r">' + f(tp + fp, 1) + '</td></tr>' +
        '<tr><td>Test negative</td><td class="r">' + f(fn, 1) + '</td><td class="r">' + f(tn, 1) + '</td><td class="r">' + f(fn + tn, 1) + '</td></tr>' +
        '<tr><td>Total</td><td class="r">' + f(D, 0) + '</td><td class="r">' + f(H, 0) + '</td><td class="r">1000</td></tr></tbody></table></div>';
      P.notice('A prevalence of ' + pct(pr, 1) + ' becomes ' + pct(ppv) + ' after a positive test and ' + pct(npvc) + ' after a negative one. Of ' + f(tp + fp, 0) + ' positives per 1,000, ' + f(fp, 0) + ' are false' + (fp > tp ? ': false positives outnumber true ones because most people are disease free.' : '.'));
      P.out.innerHTML = tbl + K.stats([['LR+', f(lrp, 2)], ['LR−', f(lrm, 3)], ['Prior odds', f(prior, 3)], ['Risk after positive', pct(ppv)], ['Risk after negative', pct(npvc)]]) +
        '<p class="num">Posterior odds = prior odds × LR: positive ' + f(prior, 3) + ' × ' + f(lrp, 2) + ' = ' + f(postP, 3) + '; negative ' + f(prior, 3) + ' × ' + f(lrm, 3) + ' = ' + f(postN, 3) + '.</p>' +
        '<p>Equivalent logistic model for the test result x (1 = positive): intercept = log-odds of disease after a negative test = <b class="num">' + f(Math.log(postN), 3) + '</b>; coefficient = ln(LR+/LR−) = <b class="num">' + f(Math.log(lrp / lrm), 3) + '</b> (odds ratio ' + f(lrp / lrm, 1) + ').</p>';
    };
  });

  K.widget('samplingDemo', function (P) {
    P.slider('p', 'True risk', 0.02, 0.5, 0.01, 0.12, function (x) { return pct(x, 0); });
    P.slider('n', 'Sample size n', 50, 2000, 10, 200, function (x) { return String(x); });
    var last = null, R = PM.rng(99), wlast = 0, prevD = null;
    function note() { var sd = Math.sqrt(P.v.p * (1 - P.v.p) / P.v.n); P.notice('At a true risk of ' + pct(P.v.p, 0) + ' and n = ' + P.v.n + ', observed risk typically varies by about ' + f(100 * sd, 1) + ' percentage points (SD) from sample to sample. Four times the sample would halve that.'); }
    function drawSample() { var y = new Array(P.v.n), e = 0; for (var i = 0; i < P.v.n; i++) { y[i] = R.u() < P.v.p ? 1 : 0; e += y[i]; } return y; }
    function histOut(vals, label, extra) {
      var lo = Math.max(0, P.v.p - 0.25), hi = Math.min(1, P.v.p + 0.25), nb = 40, bins = Chart.hist(vals, lo, hi, nb), mx = Math.max.apply(null, bins.map(function (b) { return b.y; })) * 1.1;
      var q1 = PM.quantile(vals, 0.025), q2 = PM.quantile(vals, 0.975); wlast = 100 * (q2 - q1);
      return Chart.plot({ w: 560, h: 260, xlim: [lo, hi], ylim: [0, mx], xlabel: label, ylabel: 'Count', xfmt: function (v) { return (100 * v).toFixed(0) + '%'; }, layers: [{ type: 'bars', pts: bins, color: 'obs', bw: (560 - 66) / nb * 0.9 }, { type: 'vline', x: P.v.p, color: 'c' }, { type: 'vline', x: q1, color: 'b', dash: '3 3' }, { type: 'vline', x: q2, color: 'b', dash: '3 3' }] }) +
        '<p class="num">2.5th to 97.5th percentile: ' + pct(q1, 1) + ' to ' + pct(q2, 1) + ' (width ' + f(100 * (q2 - q1), 1) + ' percentage points). ' + (extra || '') + '</p>';
    }
    P.draw = function () { if (!P.out.innerHTML) { P.out.innerHTML = '<p class="note">Press a button. Draw 200 samples shows how much an observed risk varies between samples of the same size. One bootstrap resamples the latest sample with replacement 500 times.</p>'; note(); } };
    P.onchange = note;
    P.btn('Draw 200 samples', function () {
      var vals = []; for (var k = 0; k < 200; k++) { var y = drawSample(); if (k === 0) last = y; vals.push(PM.mean(y)); }
      P.out.innerHTML = histOut(vals, 'Observed risk in each of 200 samples (green line = true risk)') + '<p class="note">Smaller samples give wider spread: with n = ' + P.v.n + ' and true risk ' + pct(P.v.p, 0) + ', the standard deviation of observed risk is about ' + pct(Math.sqrt(P.v.p * (1 - P.v.p) / P.v.n), 1) + '.</p>';
      if (prevD && prevD.n !== P.v.n && prevD.p === P.v.p) P.notice('Moving n from ' + prevD.n + ' to ' + P.v.n + ' ' + (P.v.n > prevD.n ? 'narrowed' : 'widened') + ' the middle 95% of observed risk from ' + f(prevD.w, 1) + ' to ' + f(wlast, 1) + ' percentage points. Width scales with 1/√n, so halving it needs four times the sample.');
      else P.notice('At n = ' + P.v.n + ' the middle 95% of observed risks spans ' + f(wlast, 1) + ' percentage points around the true ' + pct(P.v.p, 0) + '. Change n and draw again to see the width scale with 1/√n.');
      prevD = { n: P.v.n, p: P.v.p, w: wlast };
    }, true);
    P.btn('One bootstrap', function () {
      if (!last || last.length !== P.v.n) last = drawSample();
      var n = last.length, vals = [], seenShare = 0;
      for (var b = 0; b < 500; b++) { var s = 0, seen = new Uint8Array(n); for (var i = 0; i < n; i++) { var j = Math.floor(R.u() * n); s += last[j]; seen[j] = 1; } vals.push(s / n); var c = 0; for (i = 0; i < n; i++) c += seen[i]; seenShare += c / n; }
      P.out.innerHTML = '<p class="num">Latest sample: observed risk ' + pct(PM.mean(last), 1) + ' (' + last.reduce(function (a, c) { return a + c; }, 0) + ' events of ' + n + ').</p>' + histOut(vals, 'Risk in each of 500 bootstrap resamples (green line = true risk)', 'Mean of resamples ' + pct(PM.mean(vals), 1) + '.') +
        '<p class="num">On average ' + pct(seenShare / 500, 1) + ' of the original subjects appear at least once in a resample (theory: 1 − (1 − 1/n)<sup>n</sup> ≈ 63.2%). The bootstrap spread imitates the sampling spread, centred on the observed sample.</p>';
      var ob = PM.mean(last), dv = 100 * (ob - P.v.p);
      P.notice('Resampling this one sample of ' + n + ' gives a middle 95% of ' + f(wlast, 1) + ' percentage points, centred on its observed risk of ' + pct(ob, 1) + ', not the true ' + pct(P.v.p, 0) + '. The sample' + '’s own error of ' + K.sgn(dv, 1) + ' points is carried into every resample.');
    });
    P.onreset = function () { last = null; prevD = null; P.out.innerHTML = ''; };
  });

  K.widget('epvCalculator', function (P) {
    P.number('ev', 'Number of events (the smaller outcome group)', 120, 1, 100000, 1);
    P.number('df', 'Candidate predictor parameters (df)', 15, 1, 500, 1);
    P.draw = function () {
      var ev = P.v.ev, df = P.v.df, epv = ev / df, band, kind;
      if (epv < 10) { band = 'Below 10: high risk of overfitting; the model is likely to be too optimistic.'; kind = 'bad'; }
      else if (epv < 20) { band = '10 to 20: the minimum often quoted; shrinkage is still advisable.'; kind = 'warn'; }
      else if (epv < 50) { band = '20 to 50: a prespecified model may not need shrinkage; data-driven selection is still unreliable.'; kind = 'good'; }
      else { band = '50 or more: reasonable for selecting predictors from the candidates with data-driven methods.'; kind = 'good'; }
      P.out.innerHTML = K.stats([['Events per variable', f(epv, 1)], ['Events needed for 10', Math.ceil(10 * df)], ['for 20', Math.ceil(20 * df)], ['for 50', Math.ceil(50 * df)]]) + K.verdict(band, kind) +
        '<p class="note">Count every candidate parameter, including those for non-linear terms, interactions and dummy variables, and any predictor you might drop during selection.</p>';
      P.notice(epv < 10 ? 'With ' + ev + ' events, each of the ' + df + ' coefficients rests on only ' + f(epv, 1) + ' events. Cutting the candidates to ' + Math.max(1, Math.floor(ev / 10)) + ' would reach the minimum of 10.' : epv < 20 ? 'This meets the usual minimum. Adding ' + Math.ceil(20 * df - ev) + ' more events, or dropping candidates, would reach 20.' : 'Enough events per coefficient for a pre-specified model. Choosing predictors from the data would still need ' + Math.ceil(50 * df) + ' events.');
    };
  });

  K.widget('regressionDilution', function (P) {
    P.slider('se', 'Observer sensitivity', 0.5, 1, 0.01, 0.8, function (x) { return pct(x, 0); });
    P.slider('sp', 'Observer specificity', 0.5, 1, 0.01, 0.8, function (x) { return pct(x, 0); });
    P.slider('or', 'True odds ratio', 1, 10, 0.1, 4, function (x) { return f(x, 1); });
    P.slider('pi', 'Prevalence of the true predictor', 0.1, 0.9, 0.01, 0.5, function (x) { return pct(x, 0); });
    P.slider('r0', 'Outcome risk when the true predictor is absent', 0.05, 0.6, 0.005, 0.333, function (x) { return pct(x, 1); });
    P.draw = function () {
      var se = P.v.se, sp = P.v.sp, pi = P.v.pi, r0 = P.v.r0, o1 = r0 / (1 - r0) * P.v.or, r1 = o1 / (1 + o1), N = 1000;
      var T = [[pi * N * r1, pi * N * (1 - r1)], [(1 - pi) * N * r0, (1 - pi) * N * (1 - r0)]]; // rows: T=1,T=0 ; cols: Y=1,Y=0
      var O = [[se * T[0][0] + (1 - sp) * T[1][0], se * T[0][1] + (1 - sp) * T[1][1]], [(1 - se) * T[0][0] + sp * T[1][0], (1 - se) * T[0][1] + sp * T[1][1]]];
      var orT = T[0][0] * T[1][1] / (T[0][1] * T[1][0]), orO = O[0][0] * O[1][1] / (O[0][1] * O[1][0]);
      var cT = (T[0][0] / (T[0][0] + T[1][0]) + T[1][1] / (T[0][1] + T[1][1])) / 2, cO = (O[0][0] / (O[0][0] + O[1][0]) + O[1][1] / (O[0][1] + O[1][1])) / 2;
      var p1 = pi * se + (1 - pi) * (1 - sp), pb = pi * se * se + (1 - pi) * (1 - sp) * (1 - sp), po = pb + (pi * (1 - se) * (1 - se) + (1 - pi) * sp * sp), pe = p1 * p1 + (1 - p1) * (1 - p1), kappa = (po - pe) / (1 - pe);
      function t(a) { return '<div class="tw"><table class="data"><thead><tr><th></th><th class="r">Outcome</th><th class="r">No outcome</th></tr></thead><tbody><tr><td>Predictor positive</td><td class="r">' + f(a[0][0], 0) + '</td><td class="r">' + f(a[0][1], 0) + '</td></tr><tr><td>Predictor negative</td><td class="r">' + f(a[1][0], 0) + '</td><td class="r">' + f(a[1][1], 0) + '</td></tr></tbody></table></div>'; }
      var lnT = Math.log(orT), lnO = Math.log(orO), att = Math.abs(lnT) < 1e-6 ? 0 : 1 - lnO / lnT;
      P.notice(Math.abs(lnT) < 1e-6 ? 'The true odds ratio is 1, so there is no association for misclassification to dilute; the observed odds ratio is ' + f(orO, 2) + '.' : att < 0.005 ? 'A perfect observer leaves the odds ratio at ' + f(orT, 2) + '. Lower sensitivity or specificity to see it shrink towards 1.' : 'Error in the observer turns a true odds ratio of ' + f(orT, 2) + ' into ' + f(orO, 2) + ', removing ' + pct(att, 0) + ' of the association on the log scale, while c falls from ' + f(cT, 3) + ' to ' + f(cO, 3) + '. Kappa is ' + f(kappa, 2) + '.');
      P.out.innerHTML = '<div class="grid2"><div><h4>True predictor (per 1000)</h4>' + t(T) + '</div><div><h4>Observed with error (per 1000)</h4>' + t(O) + '</div></div>' +
        K.stats([['True OR', f(orT, 2)], ['Observed OR', f(orO, 2)], ['c, true predictor', f(cT, 3)], ['c, observed', f(cO, 3)], ['Kappa, two observers', f(kappa, 2)]]) +
        '<p class="note">Misclassification that is unrelated to the outcome moves the observed odds ratio towards 1 (regression dilution) and lowers discrimination. Agreement between two observers is summarised by kappa. The outcome risk model is an assumption of this tool: risk when the predictor is absent, and the true odds ratio.</p>';
    };
  });

  K.widget('completeCaseLoss', function (P) {
    P.slider('k', 'Number of predictors k', 1, 30, 1, 5, function (x) { return String(x); });
    P.slider('m', 'Missing per predictor', 0, 0.3, 0.005, 0.1, function (x) { return pct(x, 1); });
    P.number('ev', 'Events in the full sample', 100, 1, 10000, 1);
    P.draw = function () {
      var k = P.v.k, m = P.v.m, ind = Math.pow(1 - m, k), none = Math.max(0, 1 - k * m), all = 1 - m;
      P.notice(m === 0 ? 'With no missing values every patient is kept and EPV stays at ' + f(P.v.ev / k, 1) + '.' : 'With ' + k + ' predictors each ' + pct(m, 1) + ' missing, independent gaps leave ' + pct(ind) + ' of patients complete: ' + f(P.v.ev * ind, 0) + ' of ' + P.v.ev + ' events and an EPV of ' + f(P.v.ev * ind / k, 1) + ', down from ' + f(P.v.ev / k, 1) + '. Small gaps compound across predictors.');
      P.out.innerHTML = K.tbl(['Assumption about missingness', 'Share complete', 'Events kept', 'EPV (k df)'], [
        ['Independent across predictors, (1 − m)<sup>k</sup>', pct(ind), f(P.v.ev * ind, 0), f(P.v.ev * ind / k, 1)],
        ['Each patient misses at most one value, 1 − k·m (lowest possible)', pct(none), f(P.v.ev * none, 0), f(P.v.ev * none / k, 1)],
        ['All missing values fall in the same patients, 1 − m (highest possible)', pct(all), f(P.v.ev * all, 0), f(P.v.ev * all / k, 1)]]) +
        '<p class="note">Events kept assume events are lost in proportion to patients. EPV before exclusions: ' + f(P.v.ev / k, 1) + '. Even small per-variable missingness removes many patients when k is large, which cuts EPV and power, and can bias results if missingness is related to the outcome.</p>';
    };
  });

  K.widget('interactionCount', function (P) {
    P.slider('k', 'Number of predictors k', 2, 30, 1, 8, function (x) { return String(x); });
    P.draw = function () {
      var k = P.v.k, pairs = k * (k - 1) / 2;
      P.notice(k + ' predictors give ' + pairs + ' pairs, so about ' + f(0.05 * pairs, 1) + ' interactions would look significant at α = 0.05 by chance alone' + (0.05 * pairs < 1 ? ' (fewer than one: the problem is small at this k).' : '.') + ' One more predictor adds ' + k + ' pairs: the count grows with the square of k.');
      P.out.innerHTML = K.stats([['Two-way interactions', pairs], ['Expected false positives at α = 0.05', f(0.05 * pairs, 2)], ['Extra df if all added', pairs], ['Total df with main effects', k + pairs]]) +
        '<p class="note">Testing every pair of predictors almost guarantees spurious "significant" interactions as k grows. Restrict candidates to a few pairs with a clinical rationale, specified in advance.</p>';
    };
  });

  K.widget('nbCalculator', function (P) {
    P.number('tp', 'True positives (TP)', 72, 0, 1e6, 1); P.number('fp', 'False positives (FP)', 158, 0, 1e6, 1);
    P.number('fn', 'False negatives (FN)', 48, 0, 1e6, 1); P.number('tn', 'True negatives (TN)', 722, 0, 1e6, 1);
    P.slider('t', 'Threshold probability', 0.02, 0.8, 0.01, 0.2, function (x) { return pct(x, 0); });
    P.draw = function () {
      var tp = P.v.tp, fp = P.v.fp, fn = P.v.fn, tn = P.v.tn, t = P.v.t, N = tp + fp + fn + tn, w = t / (1 - t), E = tp + fn, H = fp + tn;
      var nb = (tp - w * fp) / N, nball = (E - w * H) / N, wa = (tp + w * tn) / (E + w * H), waall = E / (E + w * H), wanone = w * H / (E + w * H);
      P.notice(!(N > 0 && E > 0 && H > 0) ? 'Enter at least one case and one non-case to compute net benefit.' : 'At a threshold of ' + pct(t, 0) + ' each false positive costs ' + f(w, 2) + ' of a true positive, so the ' + fp + ' false positives cancel ' + f(w * fp, 1) + ' of the ' + tp + ' true positives. Net benefit is ' + f(nb, 4) + ' for the model against ' + f(nball, 4) + ' for treat all.');
      P.out.innerHTML = K.stats([['Sensitivity', pct(tp / E)], ['Specificity', pct(tn / H)], ['Accuracy', pct((tp + tn) / N)], ['Odds w = t/(1−t)', f(w, 3)]]) +
        K.tbl(['Strategy', 'Net benefit', 'Weighted accuracy'], [['Model', f(nb, 4), pct(wa)], ['Treat all', f(nball, 4), pct(waall)], ['Treat none', '0.0000', pct(wanone)]]) +
        K.verdict('Model minus best default policy: net benefit ' + K.sgn(nb - Math.max(0, nball), 4) + ' (' + f(100 * (nb - Math.max(0, nball)), 2) + ' net true positives per 100 patients). ' + (nb > Math.max(0, nball) ? 'The model beats both default policies at this threshold.' : 'The model does not beat the best default policy at this threshold.'), nb > Math.max(0, nball) ? 'good' : 'bad') +
        '<p class="note">Net benefit = (TP − w × FP) / N. The threshold expresses how many false positives you would accept for one true positive: harm:benefit = w.</p>';
    };
  });

  K.widget('validationPower', function (P) {
    var T = { 50: [[50, 100, 0.67, 1.96, 0.40, 0.107, '0 ± 0.24', '± 0.24', '± 0.043'], [100, 200, 0.45, 1.57, 0.58, 0.077, '0 ± 0.16', '± 0.17', '± 0.030'], [250, 500, 0.31, 1.36, 0.75, 0.045, '0 ± 0.11', '± 0.10', '± 0.018'], [500, 1000, 0.22, 1.25, 0.83, 0.035, null, null, null], [1000, 2000, 0.17, 1.18, 0.88, 0.022, null, null, null]],
      10: [[50, 500, 0.45, 1.57, 0.63, 0.075], [100, 1000, 0.34, 1.40, 0.75, 0.052], [200, 2000, 0.25, 1.28, 0.83, 0.037]] }; /* odds ratios = exp(log-odds) */
    P.select('inc', 'Outcome incidence in the validation sample', [[50, '50%'], [10, '10%']], 50);
    P.select('row', 'Events / total validation sample', [[0, 'row 1'], [1, 'row 2'], [2, 'row 3'], [3, 'row 4'], [4, 'row 5']], 0);
    var sel = P.cbox.querySelectorAll('select')[1];
    function fill() { var rows = T[P.v.inc]; sel.innerHTML = rows.map(function (r, i) { return '<option value="' + i + '">' + r[0] + ' events / ' + r[1] + ' patients</option>'; }).join(''); if (P.v.row >= rows.length) P.v.row = 0; sel.value = P.v.row; }
    P.onchange = function () { fill(); P.draw(); };
    P.draw = function () {
      if (!sel.options.length) fill();
      var r = T[P.v.inc][P.v.row];
      var nx = T[P.v.inc][P.v.row + 1];
      P.notice('With ' + r[0] + ' events (incidence ' + P.v.inc + '%) only a slope below ' + f(r[4], 2) + ' or a calibration-in-the-large beyond ± ' + f(r[2], 2) + ' is detected with 80% power. ' + (nx ? 'At ' + nx[0] + ' events these become ' + f(nx[4], 2) + ' and ± ' + f(nx[2], 2) + ': a larger sample picks up smaller flaws.' : 'This is the largest sample in the table.'));
      P.out.innerHTML = K.stats([['Events / total', r[0] + ' / ' + r[1]], ['Smallest detectable CITL (log-odds)', '± ' + f(r[2], 2)], ['as odds ratio', f(r[3], 2)], ['Smallest detectable slope', '< ' + f(r[4], 2)], ['Smallest detectable fall in c', f(r[5], 3)]]) +
        '<p class="note">Values from the book’s simulation (80% power, 5% type I error; two-sided for calibration-in-the-large, one-sided for slope and c). Detectable difference = critical value (2.80 or 2.49) × standard error. A validation sample with 50 events can reveal only gross invalidity. Aim for at least 100 events and 100 non-events, and preferably 250 or more events.</p>';
    };
  });
})();
