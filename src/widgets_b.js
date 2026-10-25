/* ===== Widget batch B: development simulators ===== */
(function () {
  var f = K.f, pct = K.pct, plogis = PM.plogis;
  K.qnorm = function (p) { var lo = -9, hi = 9; for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (PM.pnorm(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; };
  /* ridge fit with penalty lambda on standardised coefficients */
  K.ridgeModel = function (rows, terms, outcome, lambda) {
    var des = PM.makeDesign(rows, terms), X = des.X(rows), y = PM.yOf(rows, outcome), p = des.p, n = X.length;
    var lam = [0]; for (var j = 1; j < p; j++) { var m = 0, v = 0, i; for (i = 0; i < n; i++) m += X[i][j]; m /= n; for (i = 0; i < n; i++) v += (X[i][j] - m) * (X[i][j] - m); lam.push(lambda * v / n); }
    var fit = PM.logit(X, y, { ridge: lam });
    var mod = { design: des, fit: fit, beta: fit.beta.slice(), outcome: outcome, n: n, terms: terms, lambda: lambda };
    mod.lp = function (r) { return PM.lp(des.X(r), mod.beta); }; mod.chi2 = 2 * (fit.ll - PM.nullLL(y)); mod.dfModel = p - 1; return mod;
  };
  /* uniform shrinkage of an ML model: returns model-like with lp */
  K.uniformShrink = function (m, rows) {
    var y = PM.yOf(rows, m.outcome), s = PM.heuristicShrink(m.chi2, m.dfModel), lp = m.lp(rows), b0 = m.beta[0], xb = lp.map(function (e) { return s * (e - b0); });
    var fit = PM.logit(lp.map(function () { return [1]; }), y, { offset: xb }), a = fit.beta[0];
    var beta = m.beta.map(function (b, j) { return j === 0 ? a : s * b; });
    var mod = { s: s, beta: beta, outcome: m.outcome, design: m.design, chi2: m.chi2, dfModel: m.dfModel };
    mod.lp = function (r) { return PM.lp(m.design.X(r), beta); }; return mod;
  };

  K.widget('optimismSim', function (P) {
    P.slider('n', 'Development sample size n', 100, 2000, 50, 300, function (x) { return String(x); });
    P.slider('inc', 'Outcome incidence', 0.05, 0.5, 0.01, 0.15, function (x) { return pct(x, 0); });
    P.slider('k', 'True predictors (each β = 0.5)', 0, 5, 1, 3, function (x) { return String(x); });
    P.slider('q', 'Noise predictors (β = 0)', 0, 30, 1, 10, function (x) { return String(x); });
    var prog = P.progress();
    P.draw = function () { var ev = P.v.n * P.v.inc, d = P.v.k + P.v.q; P.out.innerHTML = '<p class="num">Expected events ' + f(ev, 0) + ' with ' + d + ' candidate predictors: EPV = ' + (d ? f(ev / d, 1) : 'n/a') + '. Press <b>Run 40 simulations</b>.</p>'; };
    P.btn('Run 40 simulations', function () {
      P.token.stop = true; P.token = { stop: false }; var tok = P.token;
      var n = P.v.n, inc = P.v.inc, k = P.v.k, q = P.v.q, p = k + q, R = PM.rng(Math.floor(Math.random() * 1e9)), NF = 6000;
      function genX(N) { var X = []; for (var i = 0; i < N; i++) { var r = [1]; for (var j = 0; j < p; j++) r.push(R.n()); X.push(r); } return X; }
      function trueLp(r) { var s = 0; for (var j = 1; j <= k; j++) s += 0.5 * r[j]; return s; }
      var Xf = genX(NF), tl = Xf.map(trueLp), lo = -12, hi = 6;
      for (var it = 0; it < 50; it++) { var mid = (lo + hi) / 2, m = 0; for (var i = 0; i < NF; i++) m += plogis(mid + tl[i]); m /= NF; if (m < inc) lo = mid; else hi = mid; }
      var a0 = (lo + hi) / 2, yf = tl.map(function (e) { return R.u() < plogis(a0 + e) ? 1 : 0; });
      var cTrue = PM.auc(yf, tl), res = [];
      K.run(40, function () {
        var X = genX(n), y = X.map(function (r) { return R.u() < plogis(a0 + trueLp(r)) ? 1 : 0; });
        var ev = y.reduce(function (a, b) { return a + b; }, 0); if (ev < 3 || ev > n - 3) return;
        var fit = PM.logit(X, y, { maxit: 30 }), lpA = PM.lp(X, fit.beta), lpF = PM.lp(Xf, fit.beta);
        res.push({ app: PM.auc(y, lpA), hon: PM.auc(yf, lpF), slope: PM.calib(yf, lpF).slope });
      }, function (a, b) { prog(a, b); }, function () {
        var ma = PM.mean(res.map(function (r) { return r.app; })), mh = PM.mean(res.map(function (r) { return r.hon; })), ms = PM.mean(res.map(function (r) { return r.slope; }));
        var d = p || 1, ev = n * inc;
        P.out.innerHTML = K.stats([['EPV', f(ev / d, 1)], ['Apparent c (mean)', f(ma, 3)], ['Honest c in fresh data', f(mh, 3)], ['Optimism in c', f(ma - mh, 3)], ['Calibration slope (fresh)', f(ms, 2)], ['c of the true model', f(cTrue, 3)]]) +
          Chart.plot({ w: 560, h: 300, xlim: [0.45, 1], ylim: [0.45, 1], xlabel: 'Apparent c (development sample)', ylabel: 'Honest c (fresh sample)', layers: [{ type: 'diag', color: 'muted' }, { type: 'hline', y: cTrue, color: 'c' }, { type: 'points', pts: res.map(function (r) { return { x: r.app, y: r.hon }; }), color: 'a', alpha: 0.6, r: 3 }] }) +
          '<p class="note">Each dot is one simulated development sample. Dots below the dashed diagonal show apparent performance exceeding honest performance. The horizontal line is the c of the true model in the fresh sample (the best any model could do). A mean slope below 1 means predictions are too extreme in new data.</p>';
      }, tok);
    }, true);
    P.onreset = function () { prog(0, 1); };
  });

  K.widget('testimationSim', function (P) {
    P.slider('b', 'True coefficient β', 0, 3, 0.05, 1, function (x) { return f(x, 2); });
    P.slider('se', 'Standard error of the estimate', 0.1, 2, 0.05, 0.5, function (x) { return f(x, 2); });
    P.slider('p', 'Selection threshold (p-value)', 0.01, 0.5, 0.01, 0.05, function (x) { return f(x, 2); });
    var Rz = PM.rng(4242), Z = []; for (var i = 0; i < 20000; i++) Z.push(Rz.n());
    P.draw = function () {
      var b = P.v.b, se = P.v.se, zc = K.qnorm(1 - P.v.p / 2), sel = [], i;
      for (i = 0; i < Z.length; i++) { var est = b + se * Z[i]; if (Math.abs(est / se) > zc) sel.push(est); }
      var mean = sel.length ? PM.mean(sel) : NaN, share = sel.length / Z.length;
      var pts = []; for (var r = 0.2; r <= 4.001; r += 0.1) { var s = 0, c = 0; for (i = 0; i < Z.length; i++) { var zz = r + Z[i]; if (Math.abs(zz) > zc) { s += zz; c++; } } if (c > 20) pts.push({ x: r, y: s / c / r }); }
      var rc = se > 0 ? b / se : 0;
      P.out.innerHTML = K.stats([['Ratio β / SE', f(rc, 2)], ['Share selected (power)', pct(share, 1)], ['Mean estimate when selected', f(mean, 3)], ['Bias in selected estimate', b > 0 ? K.sgn(100 * (mean - b) / b, 0) + '%' : 'n/a']]) +
        Chart.plot({ w: 560, h: 290, xlim: [0, 4], ylim: [0.8, Math.max(2.2, Math.min(5, Math.max.apply(null, pts.map(function (q) { return q.y; })) * 1.05))], xlabel: 'True ratio β / SE', ylabel: 'Mean selected estimate / true β', layers: [{ type: 'hline', y: 1, color: 'muted' }, { type: 'line', pts: pts, color: 'a' }, { type: 'vline', x: Math.min(4, rc), color: 'b' }] }) +
        '<p class="note">Only estimates that pass the significance filter are kept. When power is low the kept estimates are inflated (testimation bias), and the less power the larger the inflation. At a ratio above about 3 the bias becomes small. The vertical line marks the current setting.</p>';
    };
  });

  K.widget('missingDemo', function (P) {
    P.select('mech', 'Mechanism for X2 missing', [['mcar', 'MCAR (completely at random)'], ['mar_x1', 'MAR, depends on X1'], ['mar_y', 'MAR, depends on Y'], ['mnar', 'MNAR, depends on X2 itself']], 'mar_x1');
    P.slider('pm', 'Missing X2 (%)', 5, 60, 5, 30, function (x) { return x + '%'; });
    P.select('meth', 'Method', [['cc', 'Complete case'], ['mean', 'Mean imputation'], ['reg', 'Regression imputation without Y'], ['stoch', 'Stochastic imputation with Y'], ['mi', 'Multiple imputation, m = 5, with Y']], 'cc');
    var prog = P.progress();
    P.draw = function () { P.out.innerHTML = '<p class="note">Simulation: n = 500; Y = X1 + X2 + error; X1 and X2 are standard normal with correlation 0.5; true coefficients are 1 and 1. Press <b>Run 200 simulations</b>.</p>'; };
    P.onchange = function () { P.draw(); };
    function ols(X, y) { return PM.ols(X, y); }
    P.btn('Run 200 simulations', function () {
      P.token.stop = true; P.token = { stop: false }; var tok = P.token, R = PM.rng(Math.floor(Math.random() * 1e9)), n = 500, mech = P.v.mech, pm = P.v.pm / 100, meth = P.v.meth, out = [];
      K.run(200, function () {
        var x1 = [], x2 = [], y = [], i;
        for (i = 0; i < n; i++) { var a = R.n(), b = R.n(); x1.push(a); x2.push(0.5 * a + Math.sqrt(0.75) * b); y.push(a + x2[i] + R.n()); }
        var drv = mech === 'mar_x1' ? x1 : mech === 'mar_y' ? y : mech === 'mnar' ? x2 : null, mis = new Array(n).fill(false);
        if (!drv) { for (i = 0; i < n; i++) mis[i] = R.u() < pm; }
        else { var mu = PM.mean(drv), sd = PM.sd(drv), lo = -10, hi = 10; for (var it = 0; it < 40; it++) { var mid = (lo + hi) / 2, m = 0; for (i = 0; i < n; i++) m += plogis(mid + 1.5 * (drv[i] - mu) / sd); m /= n; if (m < pm) lo = mid; else hi = mid; } var a0 = (lo + hi) / 2; for (i = 0; i < n; i++) mis[i] = R.u() < plogis(a0 + 1.5 * (drv[i] - mu) / sd); }
        var obs = [], mi_ = []; for (i = 0; i < n; i++) (mis[i] ? mi_ : obs).push(i);
        if (obs.length < 20) return;
        var fitv;
        if (meth === 'cc') { fitv = ols(obs.map(function (i) { return [1, x1[i], x2[i]]; }), obs.map(function (i) { return y[i]; })); }
        else if (meth === 'mean') { var mx = PM.mean(obs.map(function (i) { return x2[i]; })); fitv = ols(x1.map(function (a, i) { return [1, a, mis[i] ? mx : x2[i]]; }), y); }
        else if (meth === 'reg') { var g = ols(obs.map(function (i) { return [1, x1[i]]; }), obs.map(function (i) { return x2[i]; })); fitv = ols(x1.map(function (a, i) { return [1, a, mis[i] ? g.beta[0] + g.beta[1] * a : x2[i]]; }), y); }
        else if (meth === 'stoch') { var g2 = ols(obs.map(function (i) { return [1, x1[i], y[i]]; }), obs.map(function (i) { return x2[i]; })); fitv = ols(x1.map(function (a, i) { return [1, a, mis[i] ? g2.beta[0] + g2.beta[1] * a + g2.beta[2] * y[i] + g2.sigma * R.n() : x2[i]]; }), y); }
        else {
          var fits = [];
          for (var mm = 0; mm < 5; mm++) {
            var bs = obs.map(function () { return obs[Math.floor(R.u() * obs.length)]; });
            var gm = ols(bs.map(function (i) { return [1, x1[i], y[i]]; }), bs.map(function (i) { return x2[i]; }));
            fits.push(ols(x1.map(function (a, i) { return [1, a, mis[i] ? gm.beta[0] + gm.beta[1] * a + gm.beta[2] * y[i] + gm.sigma * R.n() : x2[i]]; }), y));
          }
          fitv = PM.rubin(fits);
        }
        out.push({ b1: fitv.beta[1], b2: fitv.beta[2], s1: fitv.se[1], s2: fitv.se[2] });
      }, prog, function () {
        var m1 = PM.mean(out.map(function (o) { return o.b1; })), m2 = PM.mean(out.map(function (o) { return o.b2; }));
        var bins = Chart.hist(out.map(function (o) { return o.b2; }), 0, 1.6, 32), mx = Math.max.apply(null, bins.map(function (b) { return b.y; })) * 1.1;
        P.out.innerHTML = K.tbl(['', 'True', 'Mean estimate', 'Bias', 'Mean SE'], [['β for X1', '1.00', f(m1, 3), K.sgn(m1 - 1, 3), f(PM.mean(out.map(function (o) { return o.s1; })), 3)], ['β for X2', '1.00', f(m2, 3), K.sgn(m2 - 1, 3), f(PM.mean(out.map(function (o) { return o.s2; })), 3)]]) +
          Chart.plot({ w: 560, h: 240, xlim: [0, 1.6], ylim: [0, mx], xlabel: 'Estimate of β for X2 across simulations (vertical line = truth)', ylabel: 'Count', layers: [{ type: 'bars', pts: bins, color: 'a', bw: 12 }, { type: 'vline', x: 1, color: 'c' }] }) +
          '<p class="note">Compare mechanisms and methods: complete-case analysis is unbiased under MCAR and when missingness depends on a covariate in the model, but can be biased when it depends on Y or on X2 itself. Mean and regression imputation without Y distort estimates and understate uncertainty. Imputation that includes Y, repeated several times, is the approach that handles MAR.</p>';
      }, tok);
    }, true);
    P.onreset = function () { prog(0, 1); };
  });

  K.widget('codingExplorer', function (P) {
    var dev = PM.data.get('ptb_dev'), Rp = PM.rng(555), perm = dev.slice(); for (var i = perm.length - 1; i > 0; i--) { var j = Math.floor(Rp.u() * (i + 1)); var t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    P.select('code', 'Coding of maternal age', [['dich', 'Dichotomised'], ['lin', 'Linear'], ['sq', 'Quadratic'], ['r3', 'Restricted cubic spline, 3 knots'], ['r4', 'Restricted cubic spline, 4 knots'], ['r5', 'Restricted cubic spline, 5 knots']], 'lin');
    P.slider('cut', 'Cut-point for dichotomising (years)', 18, 40, 1, 30, function (x) { return String(x); });
    P.slider('n', 'Random subsample size', 200, 2000, 100, 2000, function (x) { return String(x); });
    P.draw = function () {
      var rows = perm.slice(0, P.v.n), c = P.v.code, term = c === 'dich' ? { col: 'age', kind: 'dich', cut: P.v.cut } : c === 'lin' ? { col: 'age' } : c === 'sq' ? { col: 'age', kind: 'sq' } : { col: 'age', kind: 'rcs', knots: +c[1] };
      var m = PM.fitModel(rows, [term], 'preterm'), grid = []; for (var a = 15; a <= 44; a++) grid.push({ age: a });
      var lp = m.lp(grid), pts = grid.map(function (g, i) { return { x: g.age, y: plogis(lp[i]) }; });
      var obs = []; for (var s = 15; s <= 42; s += 3) { var grp = rows.filter(function (r) { return r.age >= s && r.age < s + 3; }); if (grp.length >= 15) obs.push({ x: s + 1, y: PM.mean(grp.map(function (r) { return r.preterm; })), n: grp.length }); }
      var aic = -2 * m.fit.ll + 2 * m.design.p, ymax = Math.max(0.3, Math.max.apply(null, pts.map(function (p) { return p.y; })) * 1.1, Math.max.apply(null, obs.map(function (p) { return p.y; })) * 1.1);
      P.out.innerHTML = K.stats([['Subsample n / events', rows.length + ' / ' + m.events], ['LR χ²', f(m.chi2, 1)], ['Model df', m.dfModel], ['AIC', f(aic, 1)]]) +
        Chart.plot({ w: 560, h: 300, xlim: [15, 44], ylim: [0, ymax], xlabel: 'Maternal age (years)', ylabel: 'Risk of preterm birth', yfmt: function (v) { return (100 * v).toFixed(0) + '%'; }, layers: [{ type: 'line', pts: pts, color: 'a', step: c === 'dich' }, { type: 'points', pts: obs, color: 'b', r: 4, hollow: true }], legend: [{ label: 'Fitted risk', color: 'a' }, { label: 'Observed risk in 3-year groups', color: 'b' }] }) +
        '<p class="note">A lower AIC (or a higher χ² relative to df) means a better trade-off between fit and complexity. In these synthetic data the true relation of age to risk is U-shaped around 27 years, so a straight line and a single cut-point miss the pattern that a quadratic or spline term captures.</p>';
    };
  });

  K.widget('stepwiseInstability', function (P) {
    var dev = PM.data.get('ptb_dev'), cc = PM.complete(dev, ['bmi', 'hb']);
    var names = PM.ptbTerms.map(function (t) { return t.name || t.col; });
    P.slider('n', 'Sample size', 300, 1600, 100, 600, function (x) { return String(x); });
    P.select('rule', 'Selection rule', [['full', 'Full model (no selection)'], ['p05', 'Backward, p < 0.05'], ['aic', 'Backward, AIC-like (p ≈ 0.157)'], ['p50', 'Backward, p < 0.5']], 'p05');
    var prog = P.progress();
    P.draw = function () { P.out.innerHTML = '<p class="note">Uses complete cases from the preterm development data (14 candidate terms; <code>age</code> includes a squared term). Press <b>Run 100 bootstraps</b>: the selection is first made in a random sample of the chosen size, then repeated in 100 bootstrap resamples of it.</p>'; };
    P.onchange = function () { P.draw(); };
    function select(rows, rule) {
      if (rule === 'full') return PM.ptbTerms.slice();
      var r = rule === 'aic' ? PM.backward(rows, PM.ptbTerms, 'preterm', 'aic') : PM.backward(rows, PM.ptbTerms, 'preterm', 'p', rule === 'p05' ? 0.05 : 0.5);
      return r.terms;
    }
    P.btn('Run 100 bootstraps', function () {
      P.token.stop = true; P.token = { stop: false }; var tok = P.token, R = PM.rng(Math.floor(Math.random() * 1e9)), idx = cc.map(function (_, i) { return i; });
      for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(R.u() * (i + 1)), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      var rows = idx.slice(0, P.v.n).map(function (i) { return cc[i]; }), rule = P.v.rule, key = function (ts) { return ts.map(function (x) { return x.name || x.col; }).sort().join('|'); };
      var orig = select(rows, rule), okey = key(orig), freq = {}, counts = [], same = 0, ev = rows.reduce(function (a, r) { return a + r.preterm; }, 0);
      names.forEach(function (n) { freq[n] = 0; });
      K.run(100, function () {
        var samp = rows.map(function () { return rows[Math.floor(R.u() * rows.length)]; }), sel;
        try { sel = select(samp, rule); } catch (e) { return; }
        sel.forEach(function (x) { freq[x.name || x.col]++; }); counts.push(sel.length); if (key(sel) === okey) same++;
      }, prog, function () {
        var B = counts.length, items = names.map(function (n) { return { label: n, v: 100 * freq[n] / B }; });
        var bins = Chart.hist(counts, 0.5, 14.5, 14), mx = Math.max.apply(null, bins.map(function (b) { return b.y; })) * 1.15;
        P.out.innerHTML = '<p class="num">Sample: ' + rows.length + ' women, ' + ev + ' events. Original selection kept ' + orig.length + ' of 14 terms: ' + K.esc(orig.map(function (x) { return x.name || x.col; }).join(', ')) + '.</p>' +
          K.stats([['Bootstraps run', B], ['Reproduce the original model', pct(same / B, 0)], ['Terms kept: mean', f(PM.mean(counts), 1)]]) +
          '<h4>How often each predictor is selected (%)</h4>' + Chart.hbars(items, 100, function (v) { return v.toFixed(0); }) +
          '<h4>Number of terms kept per bootstrap</h4>' + Chart.plot({ w: 560, h: 200, xlim: [0, 15], ylim: [0, mx], xlabel: 'Number of terms selected', ylabel: 'Bootstraps', xticks: [0, 2, 4, 6, 8, 10, 12, 14], layers: [{ type: 'bars', pts: bins, color: 'a', bw: 22 }] }) +
          '<p class="note">True effects exist for age, bmi, hb, prior_ptb, short_interval, chronic_htn, bacteriuria, tobacco, primigravida and ses_low. The noise terms (anc_visits, female_fetus, conception_monsoon, height_cm) have no true effect: any selection frequency for them is spurious. A stable model would reproduce itself in most resamples.</p>';
      }, tok);
    }, true);
    P.onreset = function () { prog(0, 1); };
  });

  K.widget('shrinkageLab', function (P) {
    var dev = PM.data.get('ptb_dev'), cc = PM.complete(dev, ['bmi', 'hb']), fresh = null;
    P.slider('n', 'Development subsample size (complete cases)', 250, 1500, 50, 400, function (x) { return String(x); });
    P.slider('lam', 'Ridge penalty λ', 0, 60, 1, 10, function (x) { return String(x); });
    var prog = P.progress(), terms = PM.ptbTerms;
    function getFresh() { if (!fresh) fresh = PM.complete(PM.data.ptbGen(9000, 777001, 'dev'), ['bmi', 'hb']); return fresh; }
    function fitAll(rows, lam) { var ml = PM.fitModel(rows, terms, 'preterm'); return { ml: ml, sh: K.uniformShrink(ml, rows), rd: K.ridgeModel(rows, terms, 'preterm', lam) }; }
    P.draw = function () {
      var Rp = PM.rng(31), idx = cc.map(function (_, i) { return i; }); for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(Rp.u() * (i + 1)), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      var rows = idx.slice(0, P.v.n).map(function (i) { return cc[i]; }), M = fitAll(rows, P.v.lam), ev = rows.reduce(function (a, r) { return a + r.preterm; }, 0);
      var nm = M.ml.design.names, rws = nm.map(function (n, k) { return [n, f(M.ml.beta[k], 3), f(M.sh.beta[k], 3), f(M.rd.beta[k], 3)]; });
      P.cur = M;
      P.out.innerHTML = '<p class="num">Subsample of ' + rows.length + ' women with ' + ev + ' events; model has 15 df (EPV ' + f(ev / 15, 1) + '). Uniform shrinkage factor s = (χ² − df)/χ² = (' + f(M.ml.chi2, 1) + ' − 15)/' + f(M.ml.chi2, 1) + ' = <b>' + f(M.sh.s, 3) + '</b>.</p>' +
        '<div class="scroll">' + K.tbl(['Term', 'Standard ML', 'Uniform shrinkage', 'Ridge'], rws, 'tbl-s').replace(/<div class="tw">|<\/div>$/g, '') + '</div>' +
        '<p class="note">Press <b>Run 30 replications</b> to draw 30 new development samples of this size and test each fitted model in a large fresh sample from the same setting.</p><div id="shres"></div>';
    };
    P.onchange = function () { P.draw(); };
    P.btn('Run 30 replications', function () {
      P.token.stop = true; P.token = { stop: false }; var tok = P.token, FR = getFresh(), yF = PM.yOf(FR, 'preterm'), seed = Math.floor(Math.random() * 1e6), res = { ml: [], sh: [], rd: [] }, n = P.v.n, lam = P.v.lam, sS = [];
      K.run(30, function (r) {
        var raw = PM.data.ptbGen(Math.ceil(n / 0.78) + 80, seed + r, 'dev'), rows = PM.complete(raw, ['bmi', 'hb']).slice(0, n);
        try { var M = fitAll(rows, lam); sS.push(M.sh.s); ['ml', 'sh', 'rd'].forEach(function (k) { var lp = M[k].lp(FR), pf = PM.perf(yF, lp); res[k].push({ c: pf.c, b: pf.slope }); }); } catch (e) { }
      }, prog, function () {
        function mm(k, key) { return PM.mean(res[k].map(function (r) { return r[key]; })); }
        var el = P.out.querySelector('#shres'); if (!el) return;
        el.innerHTML = K.tbl(['Method', 'Mean calibration slope', 'Mean c (fresh data)'], [['Standard ML', f(mm('ml', 'b'), 2), f(mm('ml', 'c'), 3)], ['Uniform shrinkage', f(mm('sh', 'b'), 2), f(mm('sh', 'c'), 3)], ['Ridge (λ = ' + lam + ')', f(mm('rd', 'b'), 2), f(mm('rd', 'c'), 3)]]) +
          '<p class="note">Mean heuristic shrinkage factor over replications: ' + f(PM.mean(sS), 3) + '. A slope near 1 means predictions are neither too extreme nor too modest. Shrinkage matters most when events per variable are low; with large samples all three methods agree. Results vary from run to run.</p>';
      }, tok);
    }, true);
    P.onreset = function () { prog(0, 1); };
  });
})();
