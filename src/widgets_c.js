/* ===== Widget batch C: performance, usefulness, validation ===== */
(function () {
  var f = K.f, pct = K.pct, plogis = PM.plogis, logit = PM.qlogis;
  function phi(x) { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI); }
  var fmtP = function (v) { return (100 * v).toFixed(0) + '%'; };

  K.widget('rocExplorer', function (P) {
    P.slider('c', 'c statistic (area under the ROC curve)', 0.5, 0.99, 0.01, 0.75, function (x) { return f(x, 2); });
    P.slider('inc', 'Outcome incidence', 0.01, 0.6, 0.01, 0.12, function (x) { return pct(x, 0); });
    P.slider('cut', 'Cutoff probability for a positive prediction', 0.01, 0.9, 0.01, 0.2, function (x) { return pct(x, 0); });
    P.draw = function () {
      var c = P.v.c, pi = P.v.inc, d = Math.SQRT2 * K.qnorm(Math.min(c, 0.9995)), pc = P.v.cut;
      var xs = [], i, dx = 0.025; for (var x = -6; x <= d + 6; x += dx) xs.push(x);
      var L0 = logit(pi), W0 = [], W1 = [], PR = [];
      xs.forEach(function (x) { W0.push(phi(x) * dx * (1 - pi)); W1.push(phi(x - d) * dx * pi); PR.push(plogis(L0 + d * x - d * d / 2)); });
      var n = xs.length, br = 0, m1 = 0, m0 = 0, ll1 = 0, s0 = 0, s1 = 0;
      for (i = 0; i < n; i++) { br += W1[i] * (1 - PR[i]) * (1 - PR[i]) + W0[i] * PR[i] * PR[i]; m1 += W1[i] * PR[i]; m0 += W0[i] * PR[i]; ll1 += W1[i] * Math.log(PR[i]) + W0[i] * Math.log(1 - PR[i]); s0 += W0[i]; s1 += W1[i]; }
      m1 /= s1; m0 /= s0; var ll0 = pi * Math.log(pi) + (1 - pi) * Math.log(1 - pi), r2 = (1 - Math.exp(-2 * (ll1 - ll0))) / (1 - Math.exp(2 * ll0)), bmax = pi * (1 - pi) * (1 - pi) + (1 - pi) * pi * pi;
      var xstar = (logit(pc) - L0 + d * d / 2) / d, tp = 0, fp = 0;
      for (i = 0; i < n; i++) if (xs[i] >= xstar) { tp += W1[i]; fp += W0[i]; }
      var sens = tp / s1, spec = 1 - fp / s0, ppv = tp / (tp + fp || 1), npv = (s0 - fp) / ((s0 - fp) + (s1 - tp) || 1);
      var roc = [], tpr = 1, fpr = 1, cs1 = 0, cs0 = 0; roc.push({ x: 1, y: 1 });
      for (i = 0; i < n; i++) { cs1 += W1[i]; cs0 += W0[i]; roc.push({ x: 1 - cs0 / s0, y: 1 - cs1 / s1 }); } roc.reverse();
      var nb = 40, h0 = new Array(nb).fill(0), h1 = new Array(nb).fill(0), pmax = 1;
      for (i = 0; i < n; i++) { var k = Math.min(nb - 1, Math.floor(PR[i] / pmax * nb)); h0[k] += W0[i] / s0; h1[k] += W1[i] / s1; }
      var mx = Math.max(Math.max.apply(null, h0), Math.max.apply(null, h1)) * 1.1;
      var p0 = h0.map(function (v, k) { return { x: (k + 0.5) / nb, y: v }; }), p1 = h1.map(function (v, k) { return { x: (k + 0.5) / nb, y: v }; });
      P.notice('At c = ' + f(c, 2) + ' and incidence ' + pct(pi, 0) + ', a cutoff of ' + pct(pc, 0) + ' gives sensitivity ' + pct(sens, 0) + ' and specificity ' + pct(spec, 0) + ', but a PPV of only ' + pct(ppv, 0) + ', ' + f(ppv / pi, 1) + ' times the incidence. Moving the cutoff slides along the ROC curve; c stays at ' + f(c, 2) + '.');
      P.out.innerHTML = K.stats([['c statistic', f(c, 2)], ['Sensitivity', pct(sens)], ['Specificity', pct(spec)], ['PPV', pct(ppv)], ['NPV', pct(npv)]]) +
        K.stats([['Nagelkerke R²', f(r2, 3)], ['Brier score', f(br, 4)], ['Scaled Brier', f(1 - br / bmax, 3)], ['Discrimination slope', f(m1 - m0, 3)]]) +
        '<div class="grid2"><div>' + Chart.plot({ w: 420, h: 280, xlim: [0, 1], ylim: [0, mx], title: 'Predicted risk by outcome', xlabel: 'Predicted risk', ylabel: 'Share of group', xfmt: fmtP, yfmt: function (v) { return (100 * v).toFixed(0) + '%'; }, layers: [{ type: 'line', pts: p0, color: 'a' }, { type: 'line', pts: p1, color: 'b' }, { type: 'vline', x: pc, color: 'muted' }], legend: [{ label: 'No outcome', color: 'a' }, { label: 'Outcome', color: 'b' }] }) + '</div><div>' +
        Chart.plot({ w: 420, h: 280, xlim: [0, 1], ylim: [0, 1], title: 'ROC curve', xlabel: '1 − specificity', ylabel: 'Sensitivity', layers: [{ type: 'diag', color: 'muted' }, { type: 'line', pts: roc, color: 'a' }, { type: 'points', pts: [{ x: 1 - spec, y: sens }], color: 'b', r: 5 }] }) + '</div></div>' +
        '<p class="note">The model here is perfectly calibrated, so its predicted risks follow from c and the incidence. Moving the cutoff trades sensitivity for specificity along the ROC curve without changing c. With a low incidence, even a good c gives a modest PPV. R² and scaled Brier stay low when incidence is low or c is modest.</p>';
    };
  });

  K.widget('calibrationLab', function (P) {
    P.slider('b', 'True calibration slope', 0.4, 1.4, 0.05, 0.8, function (x) { return f(x, 2); });
    P.slider('a', 'Intercept shift (logit scale)', -1.5, 1.5, 0.1, 0, function (x) { return K.sgn(x, 1); });
    P.slider('n', 'Sample size n', 200, 5000, 100, 1500, function (x) { return String(x); });
    P.slider('s', 'Spread of predictions (SD of logit)', 0.4, 2.5, 0.1, 1.2, function (x) { return f(x, 1); });
    var seed = 20;
    P.btn('Draw a new sample', function () { seed = Math.floor(Math.random() * 1e6); P.draw(); });
    P.draw = function () {
      var R = PM.rng(seed), n = P.v.n, lp = [], y = [], mu = -1.6, i;
      for (i = 0; i < n; i++) { var l = mu + P.v.s * R.n(); lp.push(l); y.push(R.u() < plogis(P.v.a + P.v.b * l) ? 1 : 0); }
      var pf = PM.perf(y, lp), p = lp.map(plogis), g = PM.calibGroups(y, lp, 10), grid = []; for (var q = 0.01; q <= 0.99; q += 0.01) grid.push(q);
      var sm = PM.smoothCalib(y, p, grid), mxp = Math.min(1, Math.max(0.3, Math.max.apply(null, p) * 1.05, Math.max.apply(null, g.map(function (r) { return r.obs; })) * 1.1));
      var bins = Chart.hist(p, 0, mxp, 40), bm = Math.max.apply(null, bins.map(function (b) { return b.y; })), hb = bins.map(function (b) { return { x: b.x, y: b.y / bm * 0.14 * mxp }; });
      var msgs = [];
      if (Math.abs(pf.citl) < 0.15) msgs.push('Calibration-in-the-large is close to 0: average predicted risk matches the observed event rate.'); else msgs.push(pf.citl > 0 ? 'Observed risk exceeds predicted risk on average: the model underestimates risk.' : 'Predicted risk exceeds observed risk on average: the model overestimates risk.');
      if (pf.slope < 0.9) msgs.push('The slope is below 1: predictions are too extreme (high risks too high, low risks too low), the usual signature of overfitting.'); else if (pf.slope > 1.1) msgs.push('The slope is above 1: predictions are too modest and could be spread further apart.'); else msgs.push('The slope is close to 1: the spread of predictions is about right.');
      var ok = Math.abs(pf.citl) < 0.15 && pf.slope > 0.9 && pf.slope < 1.1;
      var gm = g.reduce(function (a, r) { return Math.abs(r.obs - r.pred) > a.gap ? { gap: Math.abs(r.obs - r.pred), pred: r.pred, obs: r.obs } : a; }, { gap: -1 });
      P.notice('You set slope ' + f(P.v.b, 2) + ' and shift ' + K.sgn(P.v.a, 1) + '; this sample of ' + n + ' estimates ' + f(pf.slope, 2) + ' and ' + K.sgn(pf.citl, 2) + '. ' + (gm.gap < 0 ? '' : 'The largest decile gap is ' + f(100 * gm.gap, 1) + ' points at a predicted ' + pct(gm.pred, 0) + ' (' + (gm.obs < gm.pred ? 'overestimated' : 'underestimated') + '); draw a new sample to see how much is chance.'));
      P.out.innerHTML = K.stats([['Calibration-in-the-large', K.sgn(pf.citl, 2)], ['Calibration slope', f(pf.slope, 2)], ['c statistic', f(pf.c, 3)], ['Brier score', f(pf.brier, 4)], ['Events', pf.events]]) +
        Chart.plot({ w: 560, h: 330, xlim: [0, mxp], ylim: [0, mxp], xlabel: 'Predicted probability', ylabel: 'Observed proportion', xfmt: fmtP, yfmt: fmtP, layers: [{ type: 'bars', pts: hb, color: 'muted', opacity: 0.35, bw: 9 }, { type: 'diag', color: 'muted' }, { type: 'errbars', pts: g.map(function (r) { return { x: r.pred, lo: Math.min(r.pred, r.obs), hi: Math.max(r.pred, r.obs) }; }), color: 'err' }, { type: 'line', pts: sm.filter(function (q) { return q.x <= mxp; }), color: 'obs' }, { type: 'points', pts: g.map(function (r) { return { x: r.pred, y: r.obs }; }), color: 'obs', r: 4.5 }], legend: [{ label: 'Smoothed observed', color: 'obs' }, { label: 'Deciles of predicted risk', color: 'obs' }, { label: 'Gap from perfect calibration', color: 'err' }] }) +
        K.verdict(msgs.join(' '), ok ? 'good' : 'warn') + '<p class="note">Grey bars show the distribution of predictions. The dashed line is perfect calibration. In this tool the true relation is: observed log-odds = shift + slope × predicted log-odds, so the intercept shift and slope you set are the ideal values the estimates should recover (sampling error aside).</p>';
    };
  });

  K.widget('decisionCurveLab', function (P) {
    P.slider('c', 'c statistic of the ideal calibrated model', 0.6, 0.95, 0.01, 0.8, function (x) { return f(x, 2); });
    P.slider('inc', 'Outcome incidence (calibrated model)', 0.02, 0.5, 0.01, 0.12, function (x) { return pct(x, 0); });
    P.slider('shift', 'Calibration-in-the-large shift', -1.5, 1.5, 0.1, 0, function (x) { return K.sgn(x, 1); });
    P.slider('slope', 'Calibration slope', 0.4, 1.3, 0.05, 1, function (x) { return f(x, 2); });
    P.slider('t', 'Threshold probability', 0.01, 0.6, 0.01, 0.2, function (x) { return pct(x, 0); });
    P.check('hb', 'Set the threshold from harm and benefit instead', false);
    P.number('harm', 'Harm of unnecessary treatment (units)', 1, 0.01, 1000, 0.1); P.number('ben', 'Benefit of treating a true case (units)', 4, 0.01, 1000, 0.1);
    var G = 241, xs = [], wx = []; for (var i = 0; i < G; i++) { var x = -6 + 12 * i / (G - 1); xs.push(x); wx.push(phi(x) * 12 / (G - 1)); }
    var cache = {};
    function build(c, inc) {
      var key = c + '|' + inc; if (cache[key]) return cache[key];
      function solveA(b1) { var lo = -15, hi = 8; for (var it = 0; it < 40; it++) { var mid = (lo + hi) / 2, m = 0; for (var i = 0; i < G; i++) m += wx[i] * plogis(mid + b1 * xs[i]); if (m < inc) lo = mid; else hi = mid; } return (lo + hi) / 2; }
      function auc(b1, a) { var E1 = 0, E0 = 0, cum0 = 0, num = 0; for (var i = 0; i < G; i++) { var p = plogis(a + b1 * xs[i]), w1 = wx[i] * p, w0 = wx[i] * (1 - p); num += w1 * (cum0 + 0.5 * w0); cum0 += w0; E1 += w1; E0 += w0; } return num / (E1 * E0); }
      var lo = 0.02, hi = 8; for (var it = 0; it < 40; it++) { var mid = (lo + hi) / 2, a = solveA(mid); if (auc(mid, a) < c) lo = mid; else hi = mid; }
      var b1 = (lo + hi) / 2, a1 = solveA(b1); return (cache[key] = { b1: b1, a: a1 });
    }
    function nbAt(t, M, shift, slope) {
      var w = t / (1 - t), tl = logit(t), tp = 0, fp = 0, pi = 0;
      for (var i = 0; i < G; i++) { var g = M.a + M.b1 * xs[i], pt = plogis(shift + slope * g); pi += wx[i] * pt; if (g >= tl) { tp += wx[i] * pt; fp += wx[i] * (1 - pt); } }
      return { model: tp - w * fp, all: pi - w * (1 - pi), pi: pi, tp: tp, fp: fp };
    }
    P.draw = function () {
      var M = build(P.v.c, P.v.inc), t = P.v.hb ? P.v.harm / (P.v.harm + P.v.ben) : P.v.t; t = Math.min(0.9, Math.max(0.005, t));
      var cur = [], ref = [], all = [];
      for (var q = 0.01; q <= 0.6001; q += 0.01) { var a = nbAt(q, M, P.v.shift, P.v.slope), r = nbAt(q, M, 0, 1); cur.push({ x: q, y: a.model }); ref.push({ x: q, y: r.model }); all.push({ x: q, y: a.all }); }
      var at = nbAt(t, M, P.v.shift, P.v.slope), best = Math.max(0, at.all), gain = at.model - best;
      var ymax = Math.max(0.05, Math.max.apply(null, ref.map(function (p) { return p.y; })) * 1.15), ymin = -ymax * 0.5;
      var rf = nbAt(t, M, 0, 1).model, chg = 100 * (at.model - rf);
      P.notice(P.v.shift === 0 && P.v.slope === 1 ? 'The model is perfectly calibrated here, so the applied and ideal curves coincide. Add a shift or lower the slope to watch net benefit fall.' : 'A shift of ' + K.sgn(P.v.shift, 1) + ' and slope of ' + f(P.v.slope, 2) + ' change net benefit by ' + K.sgn(chg, 2) + ' net true positives per 100 at a ' + pct(t, 0) + ' threshold, relative to a perfectly calibrated model' + (gain <= 0 ? '; it now loses to ' + (at.all > 0 ? 'treat all' : 'treat none') + '.' : '.'));
      P.out.innerHTML = K.stats([['Threshold used', pct(t, 1)], ['True incidence', pct(at.pi, 1)], ['Net benefit (model)', f(at.model, 4)], ['Net benefit (treat all)', f(at.all, 4)], ['Net TP per 100 vs best default', K.sgn(100 * gain, 2)]]) +
        Chart.plot({ w: 560, h: 320, xlim: [0, 0.6], ylim: [ymin, ymax], xlabel: 'Threshold probability', ylabel: 'Net benefit', xfmt: fmtP, layers: [{ type: 'hline', y: 0, color: 'muted', dash: '' }, { type: 'line', pts: all, color: 'c' }, { type: 'line', pts: ref, color: 'muted', dash: '5 4', width: 1.6 }, { type: 'line', pts: cur, color: 'a', width: 2.6 }, { type: 'vline', x: t, color: 'b' }], legend: [{ label: 'Model as applied', color: 'a' }, { label: 'Perfectly calibrated model', color: 'muted', dash: '5 4' }, { label: 'Treat all', color: 'c' }, { label: 'Treat none (0)', color: 'muted' }] }) +
        K.verdict(gain > 0 ? 'At this threshold the model gives ' + f(100 * gain, 2) + ' more net true positives per 100 patients than the best default policy.' : 'At this threshold the model does not beat the best default policy (' + (at.all > 0 ? 'treat all' : 'treat none') + '). Using it would not improve decisions.', gain > 0 ? 'good' : 'bad') +
        '<p class="note">Net benefit = (TP − w × FP) / N with w = t / (1 − t) = harm / benefit. The grey dashed curve is the same model if it were perfectly calibrated. Miscalibration lowers net benefit, and a systematic shift can push it below treat all or treat none even when discrimination is unchanged.</p>';
    };
  });

  K.widget('validationLab', function (P) {
    var dev = PM.data.get('ptb_dev'), terms = PM.ptbTerms, fresh = null;
    P.slider('n', 'Development sample size (complete cases)', 250, 1200, 50, 500, function (x) { return String(x); });
    var prog = P.progress();
    var ccd = PM.complete(dev, ['bmi', 'hb']), incd = ccd.reduce(function (a, r) { return a + r.preterm; }, 0) / ccd.length;
    function getFresh() { if (!fresh) fresh = PM.complete(PM.data.ptbGen(9000, 888002, 'dev'), ['bmi', 'hb']); return fresh; }
    function cc(rows) { return PM.complete(rows, ['bmi', 'hb']); }
    P.draw = function () { var ev = P.v.n * incd; P.notice('A development sample of ' + P.v.n + ' complete cases holds about ' + f(ev, 0) + ' events for 15 df (EPV ' + f(ev / 15, 1) + '). ' + (ev / 15 < 10 ? 'Expect a large gap between apparent and true c.' : 'Optimism should be modest.') + ' Press Run to compare the four estimators against the true c.'); P.out.innerHTML = '<p class="note">Each replication draws a new development sample of the chosen size from the synthetic setting, fits the 14-term model, and estimates its c statistic four ways: apparent (same data), split sample (fit on two-thirds, test on one-third), 10-fold cross-validation, and bootstrap optimism correction (B = 100). The true c is measured on a large fresh sample from the same setting. 20 replications take about a minute at the default size.</p>'; };
    P.onchange = function () { P.draw(); };
    P.btn('Run 20 replications', function () {
      P.token.stop = true; P.token = { stop: false }; var tok = P.token, FR = getFresh(), yF = PM.yOf(FR, 'preterm'), n = P.v.n, seed = Math.floor(Math.random() * 1e6), res = [], r = 0;
      P.out.innerHTML = '<p class="note">Running…</p>';
      function one(done) {
        var R = PM.rng(seed + r * 17), raw = PM.data.ptbGen(Math.ceil(n / 0.78) + 80, seed + r, 'dev'), rows = cc(raw).slice(0, n), y = PM.yOf(rows, 'preterm'), m;
        try { m = PM.fitModel(rows, terms, 'preterm'); } catch (e) { r++; done(); return; }
        var app = PM.auc(y, m.lp(rows)), tru = PM.auc(yF, m.lp(FR));
        var idx = rows.map(function (_, i) { return i; }); for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(R.u() * (i + 1)), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
        var cut = Math.floor(2 * n / 3), tr = idx.slice(0, cut).map(function (i) { return rows[i]; }), te = idx.slice(cut).map(function (i) { return rows[i]; }), split = NaN;
        try { var ms = PM.fitModel(tr, terms, 'preterm'); split = PM.auc(PM.yOf(te, 'preterm'), ms.lp(te)); } catch (e) { }
        var oof = new Array(n), lpo = new Array(n), ok = true;
        for (var k = 0; k < 10; k++) { var te2 = [], tr2 = [], tix = []; idx.forEach(function (ii, q) { if (q % 10 === k) { te2.push(rows[ii]); tix.push(ii); } else tr2.push(rows[ii]); }); try { var mk = PM.fitModel(tr2, terms, 'preterm'), lk = mk.lp(te2); tix.forEach(function (ii, q) { lpo[ii] = lk[q]; }); } catch (e) { ok = false; } }
        var cv = ok ? PM.auc(y, lpo) : NaN;
        PM.bootAsync(rows, 'preterm', function (rr) { return PM.fitModel(rr, terms, 'preterm'); }, 100, seed + r, function (b, B) { prog((r + b / B) / 20, 1); }, function (bo) { res.push({ app: app, split: split, cv: cv, boot: bo.corrected.c, tru: tru }); r++; done(); }, tok);
      }
      function loop() { if (tok.stop) return; if (r >= 20) { finish(); return; } one(loop); }
      function finish() {
        prog(1, 1); var tmean = PM.mean(res.map(function (q) { return q.tru; }));
        var rows = [['Apparent (same data)', 'app'], ['Split sample, 2/3 : 1/3', 'split'], ['10-fold cross-validation', 'cv'], ['Bootstrap, optimism-corrected', 'boot']].map(function (m) { var v = res.map(function (q) { return q[m[1]]; }).filter(function (z) { return !isNaN(z); }); return [m[0], f(PM.mean(v), 3), f(PM.sd(v), 3), K.sgn(PM.mean(v) - tmean, 3)]; });
        var pts = []; ['app', 'split', 'cv', 'boot'].forEach(function (k, i) { res.forEach(function (q) { if (!isNaN(q[k])) pts.push({ x: i + 1 + (Math.random() - 0.5) * 0.3, y: q[k] }); }); });
        var all = pts.map(function (p) { return p.y; }), lo = Math.floor(Math.min.apply(null, all.concat([tmean])) * 20) / 20, hi = Math.ceil(Math.max.apply(null, all.concat([tmean])) * 20) / 20;
        var E = {}, SD = {}, EN = { app: 'Apparent', split: 'Split-sample', cv: 'Cross-validation', boot: 'Bootstrap' };
        ['app', 'split', 'cv', 'boot'].forEach(function (k) { var v = res.map(function (q) { return q[k]; }).filter(function (z) { return !isNaN(z); }); E[k] = PM.mean(v) - tmean; SD[k] = PM.sd(v); });
        var mk = ['app', 'split', 'cv', 'boot'].reduce(function (a, k) { return SD[k] > SD[a] ? k : a; }, 'app');
        P.notice(res.length ? 'Apparent c overshot the true c by ' + f(E.app, 3) + '; split-sample, cross-validation and bootstrap were off by ' + K.sgn(E.split, 3) + ', ' + K.sgn(E.cv, 3) + ' and ' + K.sgn(E.boot, 3) + '. ' + EN[mk] + ' estimates varied most (SD ' + f(SD[mk], 3) + ').' : 'No replication completed at this sample size.');
        P.out.innerHTML = '<p class="num">' + res.length + ' replications, development n = ' + n + '. Mean true c of the fitted models in the fresh sample: <b>' + f(tmean, 3) + '</b>.</p>' + K.tbl(['Method', 'Mean estimate of c', 'SD', 'Mean error vs true c'], rows) +
          Chart.plot({ w: 560, h: 280, xlim: [0.4, 4.6], ylim: [lo, hi], xticks: [1, 2, 3, 4], xfmt: function (v) { return ['', 'Apparent', 'Split', 'CV', 'Bootstrap'][v]; }, ylabel: 'Estimated c', layers: [{ type: 'hline', y: tmean, color: 'c' }, { type: 'points', pts: pts, color: 'a', alpha: 0.65, r: 3 }] }) +
          '<p class="note">The green line is the true c. The apparent estimate sits above it (optimism). Split-sample estimates are noisy because they use only part of the data twice over. Cross-validation and the bootstrap correct most of the optimism and use all the data; the bootstrap also replays any selection steps.</p>';
      }
      loop();
    }, true);
    P.onreset = function () { prog(0, 1); };
  });

  K.widget('caseMixLab', function (P) {
    var names = [['dev', 'Development setting'], ['xsev', 'More severe x'], ['xless', 'Less severe x'], ['xhet', 'More heterogeneous x'], ['xhom', 'Less heterogeneous x'], ['zsev', 'More severe z'], ['zless', 'Less severe z'], ['zhet', 'More heterogeneous z'], ['zhom', 'Less heterogeneous z'], ['cc21', 'Case-control 2:1 (cases:controls)'], ['cc12', 'Case-control 1:2'], ['ov8', 'Overfitted, calibration slope 0.8'], ['ov6', 'Overfitted, calibration slope 0.6'], ['c515', 'Coefficients × 0.5 / × 1.5'], ['c2515', 'Coefficients × 0.25 / × 1.5']];
    P.select('scn', 'Validation scenario', names, 'dev');
    P.select('r', 'Correlation between x and z', [[0, '0'], [0.33, '0.33'], [0.5, '0.5']], 0.33);
    var base = {};
    function tag(v) { return v; }
    P.draw = function () {
      P.out.innerHTML = '<p class="note">Computing…</p>';
      setTimeout(function () {
        var r = P.v.r, o = PM.casemix.run(P.v.scn, r), d = base[r] || (base[r] = PM.casemix.run('dev', r)), g = PM.calibGroups(o.y, o.lp, 10);
        var lo = 0, hi = 1, dc = o.c - d.c, ds_ = o.slope - d.slope, dci = o.citl - d.citl;
        P.notice(P.v.scn === 'dev' ? 'This is the development setting: slope ' + f(o.slope, 2) + ', c ' + f(o.c, 3) + ', net benefit gain ' + K.sgn(o.gain, 3) + '. Pick another scenario to see how the same model behaves elsewhere.' : 'Against development, c moves ' + K.sgn(dc, 3) + ', slope ' + K.sgn(ds_, 2) + ' and calibration-in-the-large ' + K.sgn(dci, 2) + '; the net benefit gain goes from ' + f(d.gain, 3) + ' to ' + f(o.gain, 3) + '.' + (Math.abs(dc) < 0.02 && (Math.abs(ds_) > 0.1 || Math.abs(dci) > 0.2) ? ' Discrimination barely changes while calibration does.' : ''));
        P.out.innerHTML = K.tbl(['', 'a|b=1 (CITL)', 'Slope b', 'c', 'NB gain over treat all'], [['Development', f(d.citl, 2), f(d.slope, 2), f(d.c, 3), f(d.gain, 3)], ['This scenario', K.sgn(o.citl, 2), f(o.slope, 2), f(o.c, 3), K.sgn(o.gain, 3)]]) +
          Chart.plot({ w: 460, h: 320, xlim: [0, 1], ylim: [0, 1], xlabel: 'Predicted probability', ylabel: 'Observed proportion', xfmt: fmtP, yfmt: fmtP, layers: [{ type: 'diag', color: 'muted' }, { type: 'errbars', pts: g.map(function (q) { return { x: q.pred, lo: Math.min(q.pred, q.obs), hi: Math.max(q.pred, q.obs) }; }), color: 'err' }, { type: 'line', pts: g.map(function (q) { return { x: q.pred, y: q.obs }; }), color: 'obs' }, { type: 'points', pts: g.map(function (q) { return { x: q.pred, y: q.obs }; }), color: 'obs', r: 4 }] }) +
          K.verdict('Net benefit at the 30% threshold: model ' + f(o.nb, 3) + ' vs treat all ' + f(o.nbAll, 3) + ' (gain ' + K.sgn(o.gain, 3) + ', i.e. ' + f(100 * o.gain, 1) + ' net true positives per 100). Outcome incidence in this population: ' + pct(o.inc, 0) + '.' + (o.gain < 0 ? ' The model does worse than treating everyone.' : ''), o.gain < 0 ? 'bad' : '') +
          '<p class="note">Re-simulated after the book’s Chapter 19 design: x is the model’s linear predictor, z a missed predictor, both standard normal. The model is lp = 1.5x. Scenario selections are approximations of the book’s, so values are close to, not identical with, the printed ones. Case-control scenarios keep all cases and half the controls (2:1) or all controls and half the cases (1:2), so net benefit there is meaningful only after correcting the intercept.</p>';
      }, 20);
    };
  });

  K.widget('scoreChartBuilder', function (P) {
    var dev = PM.data.get('ptb_dev'), rows = PM.complete(dev, ['bmi', 'hb']).map(function (r) {
      var o = Object.assign({}, r); o.age_lt20 = r.age < 20 ? 1 : 0; o.age_ge35 = r.age >= 35 ? 1 : 0; o.bmi_lt185 = r.bmi < 18.5 ? 1 : 0; o.bmi_ge25 = r.bmi >= 25 ? 1 : 0; o.hb_lt9 = r.hb < 9 ? 1 : 0; o.hb_9_11 = (r.hb >= 9 && r.hb < 11) ? 1 : 0; return o; });
    var bins = ['primigravida', 'prior_ptb', 'short_interval', 'chronic_htn', 'tobacco', 'bacteriuria'], BL = { primigravida: 'First pregnancy', prior_ptb: 'Previous preterm birth', short_interval: 'Interval < 6 months', chronic_htn: 'Chronic hypertension', tobacco: 'Tobacco use', bacteriuria: 'Bacteriuria at booking' };
    P.slider('mult', 'Points per 1.0 of log-odds', 1, 10, 0.5, 4, function (x) { return f(x, 1); });
    P.select('mode', 'Continuous predictors (age, BMI, Hb)', [['cont', 'Keep continuous (linear)'], ['cat', 'Categorise']], 'cat');
    var fits = {};
    function fit(mode) {
      if (fits[mode]) return fits[mode];
      var tb = bins.map(function (c) { return { col: c, kind: 'bin', name: BL[c] }; }), terms = mode === 'cont' ? [{ col: 'age', name: 'Age (per year)' }, { col: 'bmi', name: 'BMI (per kg/m²)' }, { col: 'hb', name: 'Hb (per g/dL)' }].concat(tb)
        : [{ col: 'age_lt20', kind: 'bin', name: 'Age < 20' }, { col: 'age_ge35', kind: 'bin', name: 'Age ≥ 35' }, { col: 'bmi_lt185', kind: 'bin', name: 'BMI < 18.5' }, { col: 'bmi_ge25', kind: 'bin', name: 'BMI ≥ 25' }, { col: 'hb_lt9', kind: 'bin', name: 'Hb < 9' }, { col: 'hb_9_11', kind: 'bin', name: 'Hb 9 to 10.9' }].concat(tb);
      return (fits[mode] = { m: PM.fitModel(rows, terms, 'preterm'), terms: terms });
    }
    var pat = { age: 24, bmi: 19, hb: 9.5, primigravida: 0, prior_ptb: 1, short_interval: 0, chronic_htn: 0, tobacco: 1, bacteriuria: 0 };
    P.draw = function () {
      var F = fit(P.v.mode), m = F.m, mult = P.v.mult, y = PM.yOf(rows, 'preterm');
      var pts = F.terms.map(function (t, j) { var b = m.beta[j + 1]; return { term: t, b: b, pt: mult * b }; });
      function score(r) { var s = 0; pts.forEach(function (p) { var v = r[p.term.col]; if (p.term.kind === 'bin') s += Math.round(p.pt) * v; else s += Math.round(p.pt * (v - m.design.spec[pts.indexOf(p)].center) * 10) / 10; }); return Math.round(s); }
      var sc = rows.map(score), cScore = PM.auc(y, sc), cFull = PM.auc(y, m.lp(rows));
      var cal = PM.logit(sc.map(function (s) { return [1, s]; }), y), pr = function (s) { return plogis(cal.beta[0] + cal.beta[1] * s); };
      var tbl = K.tbl(['Predictor', 'Coefficient', 'Points'], pts.map(function (p) { return [p.term.name, f(p.b, 3), p.term.kind === 'bin' ? String(Math.round(p.pt)) : f(p.pt, 2) + ' per unit']; }));
      var pr0 = pat, r0 = {};
      var form = '<h4>Patient form</h4><div class="wg-c" style="padding:0">' + ['age', 'bmi', 'hb'].map(function (k) { return '<div class="ctl"><label for="sc_' + k + '"><span>' + { age: 'Age (years)', bmi: 'BMI', hb: 'Hb (g/dL)' }[k] + '</span></label><input id="sc_' + k + '" data-k="' + k + '" type="number" step="0.1" value="' + pat[k] + '"></div>'; }).join('') + bins.map(function (k) { return '<div class="ctl chk"><input id="sc_' + k + '" data-k="' + k + '" type="checkbox"' + (pat[k] ? ' checked' : '') + '><label for="sc_' + k + '">' + BL[k] + '</label></div>'; }).join('') + '</div><div id="scres"></div>';
      P.out.innerHTML = K.stats([['c, points score', f(cScore, 3)], ['c, full regression model', f(cFull, 3)], ['Difference', K.sgn(cScore - cFull, 3)], ['Score range', Math.min.apply(null, sc) + ' to ' + Math.max.apply(null, sc)]]) + tbl + form +
        '<p class="note">Points = coefficient × points per log-odds, rounded. The total score is converted to risk with a logistic model fitted to the score in the development data. Compare the two modes: categorising age lets the score reflect the U-shaped risk, which a linear age term cannot. A coarser point scale (fewer points per log-odds) loses discrimination; a finer one adds little.</p>';
      function upd() {
        var r = {}; Array.prototype.forEach.call(P.out.querySelectorAll('[data-k]'), function (e) { r[e.getAttribute('data-k')] = e.type === 'checkbox' ? (e.checked ? 1 : 0) : parseFloat(e.value); pat[e.getAttribute('data-k')] = r[e.getAttribute('data-k')]; });
        r.age_lt20 = r.age < 20 ? 1 : 0; r.age_ge35 = r.age >= 35 ? 1 : 0; r.bmi_lt185 = r.bmi < 18.5 ? 1 : 0; r.bmi_ge25 = r.bmi >= 25 ? 1 : 0; r.hb_lt9 = r.hb < 9 ? 1 : 0; r.hb_9_11 = (r.hb >= 9 && r.hb < 11) ? 1 : 0;
        var lines = pts.map(function (p) { var v = r[p.term.col], q = p.term.kind === 'bin' ? Math.round(p.pt) * v : Math.round(p.pt * (v - m.design.spec[pts.indexOf(p)].center) * 10) / 10; return q; }), s = Math.round(lines.reduce(function (a, b) { return a + b; }, 0)), lpFull = m.lp([r])[0];
        P.notice(isNaN(s) ? 'Fill in age, BMI and Hb to score the patient.' : 'At ' + f(mult, 1) + ' points per log-odds with ' + (P.v.mode === 'cat' ? 'categorised' : 'linear') + ' age, BMI and Hb, the score’s c is ' + f(cScore, 3) + ', ' + f(Math.abs(cScore - cFull), 3) + (cScore < cFull ? ' below' : ' above') + ' the full model. This patient scores ' + s + ': ' + pct(pr(s), 1) + ' by the score against ' + pct(plogis(lpFull), 1) + ' by regression.');
        P.out.querySelector('#scres').innerHTML = K.stats([['Total score', s], ['Risk from score', pct(pr(s), 1)], ['Risk from regression model', pct(plogis(lpFull), 1)]]);
      }
      Array.prototype.forEach.call(P.out.querySelectorAll('[data-k]'), function (e) { e.addEventListener('input', upd); e.addEventListener('change', upd); }); upd();
    };
  });
})();
