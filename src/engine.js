/* Statistical engine: RNG, logistic regression, performance measures, bootstrap. Pure JS, no deps. */
var PM = (typeof PM !== 'undefined') ? PM : {};

/* ---------- RNG ---------- */
PM.rng = function (seed) {
  var s = (seed >>> 0) || 1;
  function u() {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  var spare = null;
  function n() {
    if (spare !== null) { var r = spare; spare = null; return r; }
    var a, b, q;
    do { a = 2 * u() - 1; b = 2 * u() - 1; q = a * a + b * b; } while (q >= 1 || q === 0);
    var m = Math.sqrt(-2 * Math.log(q) / q);
    spare = b * m; return a * m;
  }
  return {
    u: u, n: n,
    norm: function (mu, sd) { return mu + sd * n(); },
    bern: function (p) { return u() < p ? 1 : 0; },
    int: function (a, b) { return a + Math.floor(u() * (b - a + 1)); }
  };
};

/* ---------- basic helpers ---------- */
PM.plogis = function (x) { return 1 / (1 + Math.exp(-x)); };
PM.qlogis = function (p) { return Math.log(p / (1 - p)); };
PM.mean = function (a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : NaN; };
PM.sd = function (a) { var m = PM.mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); };
PM.quantile = function (arr, p) {
  var a = arr.slice().sort(function (x, y) { return x - y; });
  var h = (a.length - 1) * p, lo = Math.floor(h), hi = Math.ceil(h);
  return a[lo] + (h - lo) * (a[hi] - a[lo]);
};
PM.clip = function (x, lo, hi) { return Math.min(hi, Math.max(lo, x)); };
PM.round = function (x, d) { var f = Math.pow(10, d || 0); return Math.round(x * f) / f; };
PM.pnorm = function (z) { // Abramowitz-Stegun
  var t = 1 / (1 + 0.2316419 * Math.abs(z));
  var d = 0.3989423 * Math.exp(-z * z / 2);
  var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};
PM.pchisq1 = function (x) { return x <= 0 ? 1 : 2 * (1 - PM.pnorm(Math.sqrt(x))); };
/* chi-square upper tail for any df via regularised gamma */
PM.pchisq = function (x, k) {
  if (x <= 0) return 1;
  function gser(a, x) { var sum = 1 / a, del = sum, ap = a; for (var n = 0; n < 300; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-12) break; } return sum * Math.exp(-x + a * Math.log(x) - PM.lgamma(a)); }
  function gcf(a, x) { var b = x + 1 - a, c = 1 / 1e-30, d = 1 / b, h = d; for (var i = 1; i < 300; i++) { var an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30; c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; var del = d * c; h *= del; if (Math.abs(del - 1) < 1e-12) break; } return Math.exp(-x + a * Math.log(x) - PM.lgamma(a)) * h; }
  var a = k / 2, xx = x / 2;
  return xx < a + 1 ? 1 - gser(a, xx) : gcf(a, xx);
};
PM.lgamma = function (x) {
  var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  var y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t);
  var s = 1.000000000190015; for (var j = 0; j < 6; j++) s += c[j] / ++y;
  return -t + Math.log(2.5066282746310005 * s / x);
};

/* ---------- linear algebra (small dense) ---------- */
PM.solveSPD = function (A, b) { // returns x for A x = b ; also inverse optionally via invert
  var n = b.length, M = A.map(function (r) { return r.slice(); }), x = b.slice();
  for (var i = 0; i < n; i++) {
    var piv = i; for (var r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[piv][i])) piv = r;
    if (Math.abs(M[piv][i]) < 1e-12) { M[piv][i] = 1e-12; }
    if (piv !== i) { var tmp = M[i]; M[i] = M[piv]; M[piv] = tmp; var tb = x[i]; x[i] = x[piv]; x[piv] = tb; }
    for (var r2 = i + 1; r2 < n; r2++) {
      var f = M[r2][i] / M[i][i]; if (f === 0) continue;
      for (var c = i; c < n; c++) M[r2][c] -= f * M[i][c];
      x[r2] -= f * x[i];
    }
  }
  for (var i2 = n - 1; i2 >= 0; i2--) {
    var s = x[i2]; for (var c2 = i2 + 1; c2 < n; c2++) s -= M[i2][c2] * x[c2];
    x[i2] = s / M[i2][i2];
  }
  return x;
};
PM.invert = function (A) {
  var n = A.length, inv = [];
  for (var j = 0; j < n; j++) { var e = new Array(n).fill(0); e[j] = 1; inv.push(PM.solveSPD(A, e)); }
  // inv[j] is column j
  var out = []; for (var i = 0; i < n; i++) { out.push([]); for (var k = 0; k < n; k++) out[i].push(inv[k][i]); }
  return out;
};

/* ---------- OLS ---------- */
PM.ols = function (X, y) {
  var n = X.length, p = X[0].length, XtX = [], Xty = new Array(p).fill(0), i, j, k;
  for (j = 0; j < p; j++) { XtX.push(new Array(p).fill(0)); }
  for (i = 0; i < n; i++) { var r = X[i]; for (j = 0; j < p; j++) { Xty[j] += r[j] * y[i]; for (k = j; k < p; k++) XtX[j][k] += r[j] * r[k]; } }
  for (j = 0; j < p; j++) for (k = 0; k < j; k++) XtX[j][k] = XtX[k][j];
  var beta = PM.solveSPD(XtX, Xty), rss = 0;
  for (i = 0; i < n; i++) { var f = 0; for (j = 0; j < p; j++) f += X[i][j] * beta[j]; rss += (y[i] - f) * (y[i] - f); }
  var s2 = rss / Math.max(1, n - p), inv = PM.invert(XtX);
  var cov = inv.map(function (r) { return r.map(function (v) { return v * s2; }); });
  return { beta: beta, cov: cov, se: cov.map(function (r, i) { return Math.sqrt(r[i]); }), sigma: Math.sqrt(s2), rss: rss, n: n, p: p };
};

/* ---------- logistic regression (Newton-Raphson / IRLS, optional ridge, offset) ---------- */
/* X: array of rows (first col normally 1). opts: offset[], ridge (scalar or per-coef array; coef 0 never penalised), maxit */
PM.logit = function (X, y, opts) {
  opts = opts || {};
  var n = X.length, p = X[0].length, off = opts.offset, maxit = opts.maxit || 40;
  var lam = new Array(p).fill(0);
  if (opts.ridge) for (var q = 1; q < p; q++) lam[q] = Array.isArray(opts.ridge) ? opts.ridge[q] : opts.ridge;
  var beta = opts.start ? opts.start.slice() : new Array(p).fill(0);
  var ll = -Infinity, conv = false, it, i, j, k;
  var H, g, eta, pr, XtWX;
  function evalAt(b) {
    var l = 0, pen = 0, e, pp;
    for (i = 0; i < n; i++) { e = off ? off[i] : 0; var r = X[i]; for (j = 0; j < p; j++) e += r[j] * b[j]; if (e > 35) e = 35; if (e < -35) e = -35; l += y[i] ? -Math.log(1 + Math.exp(-e)) : -Math.log(1 + Math.exp(e)); }
    for (j = 1; j < p; j++) pen += 0.5 * lam[j] * b[j] * b[j];
    return { l: l, pl: l - pen };
  }
  var cur = evalAt(beta);
  for (it = 0; it < maxit; it++) {
    XtWX = []; for (j = 0; j < p; j++) XtWX.push(new Array(p).fill(0));
    g = new Array(p).fill(0);
    for (i = 0; i < n; i++) {
      var row = X[i], e = off ? off[i] : 0;
      for (j = 0; j < p; j++) e += row[j] * beta[j];
      if (e > 35) e = 35; if (e < -35) e = -35;
      var pi = 1 / (1 + Math.exp(-e)), w = pi * (1 - pi), res = y[i] - pi;
      for (j = 0; j < p; j++) { var rj = row[j]; if (rj === 0) continue; g[j] += rj * res; var wr = w * rj; for (k = j; k < p; k++) XtWX[j][k] += wr * row[k]; }
    }
    for (j = 0; j < p; j++) for (k = 0; k < j; k++) XtWX[j][k] = XtWX[k][j];
    for (j = 1; j < p; j++) g[j] -= lam[j] * beta[j];
    H = XtWX.map(function (r, a) { var rr = r.slice(); rr[a] += lam[a]; return rr; });
    var step = PM.solveSPD(H, g), t = 1, nb, nxt;
    for (var hs = 0; hs < 25; hs++) {
      nb = beta.map(function (b, a) { return b + t * step[a]; });
      nxt = evalAt(nb);
      if (nxt.pl >= cur.pl - 1e-10) break;
      t /= 2;
    }
    var mx = 0; for (j = 0; j < p; j++) mx = Math.max(mx, Math.abs(nb[j] - beta[j]));
    beta = nb; cur = nxt;
    if (mx < 1e-8) { conv = true; break; }
  }
  // final information
  XtWX = []; for (j = 0; j < p; j++) XtWX.push(new Array(p).fill(0));
  for (i = 0; i < n; i++) {
    var rw = X[i], ee = off ? off[i] : 0; for (j = 0; j < p; j++) ee += rw[j] * beta[j];
    var pq = PM.plogis(ee), ww = pq * (1 - pq);
    for (j = 0; j < p; j++) { var wr2 = ww * rw[j]; if (wr2 === 0) continue; for (k = j; k < p; k++) XtWX[j][k] += wr2 * rw[k]; }
  }
  for (j = 0; j < p; j++) for (k = 0; k < j; k++) XtWX[j][k] = XtWX[k][j];
  var Hf = XtWX.map(function (r, a) { var rr = r.slice(); rr[a] += lam[a]; return rr; });
  var cov = PM.invert(Hf);
  var se = cov.map(function (r, a) { return Math.sqrt(Math.max(0, r[a])); });
  // effective df for penalised fit: trace(I * cov)
  var edf = 0; for (j = 0; j < p; j++) for (k = 0; k < p; k++) edf += XtWX[j][k] * cov[k][j];
  return { beta: beta, se: se, cov: cov, ll: cur.l, pll: cur.pl, converged: conv, iter: it, n: n, p: p, edf: edf };
};
PM.lp = function (X, beta, offset) { return X.map(function (r, i) { var e = offset ? offset[i] : 0; for (var j = 0; j < r.length; j++) e += r[j] * beta[j]; return e; }); };
PM.nullLL = function (y) { var n = y.length, e = 0; for (var i = 0; i < n; i++) e += y[i]; var p = e / n; return e * Math.log(p) + (n - e) * Math.log(1 - p); };

/* ---------- performance measures ---------- */
PM.auc = function (y, s) {
  var n = y.length, idx = [], i; for (i = 0; i < n; i++) idx.push(i);
  idx.sort(function (a, b) { return s[a] - s[b]; });
  var rank = new Array(n), k = 0;
  while (k < n) { var j = k; while (j + 1 < n && s[idx[j + 1]] === s[idx[k]]) j++; var r = (k + j) / 2 + 1; for (var m = k; m <= j; m++) rank[idx[m]] = r; k = j + 1; }
  var n1 = 0, sum = 0; for (i = 0; i < n; i++) if (y[i] === 1) { n1++; sum += rank[i]; }
  var n0 = n - n1; if (n1 === 0 || n0 === 0) return NaN;
  return (sum - n1 * (n1 + 1) / 2) / (n1 * n0);
};
PM.brier = function (y, p) { var s = 0; for (var i = 0; i < y.length; i++) s += (y[i] - p[i]) * (y[i] - p[i]); return s / y.length; };
PM.brierMax = function (y) { var m = PM.mean(y); return m * (1 - m) * (1 - m) + (1 - m) * m * m; }; // mean(p)(1-mean)^2 + (1-mean) mean^2 per book definition
PM.nagelkerke = function (ll0, ll1, n) { var lr = 2 * (ll1 - ll0); return (1 - Math.exp(-lr / n)) / (1 - Math.exp(2 * ll0 / n)); };
/* calibration slope b and intercept given lp ; CITL a (slope fixed =1 via offset) */
PM.calib = function (y, lp) {
  var X = lp.map(function (e) { return [1, e]; });
  var f = PM.logit(X, y);
  var X0 = lp.map(function () { return [1]; });
  var f0 = PM.logit(X0, y, { offset: lp });
  return { slope: f.beta[1], slopeSE: f.se[1], intercept: f.beta[0], citl: f0.beta[0], citlSE: f0.se[0] };
};
/* Full set of performance measures given predicted lp and outcome */
PM.perf = function (y, lp) {
  var p = lp.map(PM.plogis), n = y.length;
  var c = PM.calib(y, lp);
  var ll1 = 0; for (var i = 0; i < n; i++) ll1 += y[i] ? Math.log(Math.max(p[i], 1e-12)) : Math.log(Math.max(1 - p[i], 1e-12));
  // Nagelkerke R2 for predictions, using recalibrated predictions as book notes (R2 after recalibration)
  var X = lp.map(function (e) { return [1, e]; }), f = PM.logit(X, y);
  var ll0 = PM.nullLL(y);
  var r2 = Math.max(0, PM.nagelkerke(ll0, f.ll, n));
  var br = PM.brier(y, p), brmax = PM.brierMax(y);
  var m1 = 0, n1 = 0, m0 = 0, n0 = 0; for (i = 0; i < n; i++) { if (y[i]) { m1 += p[i]; n1++; } else { m0 += p[i]; n0++; } }
  return { n: n, events: n1, c: PM.auc(y, lp), slope: c.slope, citl: c.citl, intercept: c.intercept, r2: r2, brier: br, brierMax: brmax, brierScaled: 1 - br / brmax, discSlope: (n1 ? m1 / n1 : NaN) - (n0 ? m0 / n0 : NaN), meanPred: PM.mean(p), obs: n1 / n };
};
/* grouped calibration (quantile groups) + smooth */
PM.calibGroups = function (y, lp, g) {
  g = g || 10; var n = y.length, idx = []; for (var i = 0; i < n; i++) idx.push(i);
  idx.sort(function (a, b) { return lp[a] - lp[b]; });
  var out = [], per = n / g;
  for (var k = 0; k < g; k++) {
    var lo = Math.round(k * per), hi = Math.round((k + 1) * per), sp = 0, so = 0, m = 0;
    for (var j = lo; j < hi; j++) { sp += PM.plogis(lp[idx[j]]); so += y[idx[j]]; m++; }
    if (m) out.push({ pred: sp / m, obs: so / m, n: m, events: so });
  }
  return out;
};
PM.smoothCalib = function (y, p, grid) { // Gaussian kernel smoother of y on predicted probability
  var bw = 0.07, out = [];
  grid.forEach(function (g) { var sw = 0, sy = 0; for (var i = 0; i < y.length; i++) { var d = (p[i] - g) / bw; if (d > 4 || d < -4) continue; var w = Math.exp(-0.5 * d * d); sw += w; sy += w * y[i]; } if (sw > 3) out.push({ x: g, y: sy / sw }); });
  return out;
};
PM.rocCurve = function (y, s) {
  var n = y.length, idx = []; for (var i = 0; i < n; i++) idx.push(i);
  idx.sort(function (a, b) { return s[b] - s[a]; });
  var n1 = 0; for (i = 0; i < n; i++) n1 += y[i]; var n0 = n - n1, tp = 0, fp = 0, pts = [{ fpr: 0, tpr: 0, thr: Infinity }];
  for (var k = 0; k < n; k++) { if (y[idx[k]]) tp++; else fp++; if (k === n - 1 || s[idx[k + 1]] !== s[idx[k]]) pts.push({ fpr: fp / n0, tpr: tp / n1, thr: s[idx[k]] }); }
  return pts;
};
/* classification at probability cutoff */
PM.classify = function (y, p, cut) {
  var tp = 0, fp = 0, tn = 0, fn = 0;
  for (var i = 0; i < y.length; i++) { var pos = p[i] >= cut; if (pos && y[i]) tp++; else if (pos && !y[i]) fp++; else if (!pos && y[i]) fn++; else tn++; }
  return { tp: tp, fp: fp, tn: tn, fn: fn, sens: tp / Math.max(1, tp + fn), spec: tn / Math.max(1, tn + fp), n: y.length };
};
PM.netBenefit = function (y, p, thr) {
  var c = PM.classify(y, p, thr), n = y.length, w = thr / (1 - thr);
  return { model: (c.tp - w * c.fp) / n, all: (c.tp + c.fn - w * (c.fp + c.tn)) / n, none: 0 };
};
PM.decisionCurve = function (y, p, from, to, step) {
  var out = []; for (var t = from; t <= to + 1e-9; t += step) { var nb = PM.netBenefit(y, p, t); out.push({ t: t, model: nb.model, all: nb.all, none: 0 }); }
  return out;
};

/* ---------- design matrices ---------- */
/* Term spec: {name, kind:'num'|'bin'|'rcs'|'sq', col:'age', knots:k} ; builder fitted on training data (knots from training percentiles) */
PM.rcsKnots = function (x, k) {
  var P = { 3: [0.10, 0.5, 0.90], 4: [0.05, 0.35, 0.65, 0.95], 5: [0.05, 0.275, 0.5, 0.725, 0.95] }[k];
  return P.map(function (q) { return PM.quantile(x, q); });
};
PM.rcsBasis = function (x, t) {
  var k = t.length, cols = [x], d = t[k - 1] - t[k - 2], nrm = Math.pow(t[k - 1] - t[0], 2);
  function pp(v) { return v > 0 ? v * v * v : 0; }
  for (var j = 0; j < k - 2; j++) {
    var v = (pp(x - t[j]) - pp(x - t[k - 2]) * (t[k - 1] - t[j]) / d + pp(x - t[k - 1]) * (t[k - 2] - t[j]) / d) / nrm;
    cols.push(v);
  }
  return cols;
};
/* build: rows (objects), terms -> {names, X(rows)->matrix, colsFor(term)} ; imputation not handled here */
PM.makeDesign = function (trainRows, terms) {
  var spec = terms.map(function (t) {
    var s = { name: t.name || t.col, kind: t.kind || 'num', col: t.col };
    var vals = trainRows.map(function (r) { return r[t.col]; }).filter(function (v) { return v !== null && v !== undefined && !isNaN(v); });
    if (s.kind === 'rcs') s.knots = PM.rcsKnots(vals, t.knots || 3);
    if (s.kind === 'num' || s.kind === 'sq' || s.kind === 'cent') { s.center = (t.center !== undefined) ? t.center : PM.mean(vals); }
    if (s.kind === 'dich') s.cut = t.cut;
    if (s.kind === 'rcs') s.center = 0;
    return s;
  });
  var names = ['Intercept'], groups = [[0]];
  spec.forEach(function (s) {
    var start = names.length, cnt = s.kind === 'rcs' ? s.knots.length - 1 : (s.kind === 'sq' ? 2 : 1);
    if (s.kind === 'rcs') { names.push(s.name); for (var j = 1; j < cnt; j++) names.push(s.name + ' (spline ' + j + ')'); }
    else if (s.kind === 'sq') { names.push(s.name); names.push(s.name + '²'); }
    else names.push(s.name);
    var g = []; for (var q = 0; q < cnt; q++) g.push(start + q); groups.push(g);
  });
  function X(rows) {
    return rows.map(function (r) {
      var row = [1];
      spec.forEach(function (s) {
        var v = r[s.col];
        if (s.kind === 'rcs') PM.rcsBasis(v, s.knots).forEach(function (c) { row.push(c); });
        else if (s.kind === 'sq') { var z = v - s.center; row.push(z); row.push(z * z); }
        else if (s.kind === 'dich') row.push(v >= s.cut ? 1 : 0);
        else if (s.kind === 'bin') row.push(v);
        else row.push(v - s.center);
      });
      return row;
    });
  }
  return { spec: spec, names: names, groups: groups, X: X, p: names.length };
};
PM.complete = function (rows, cols) { return rows.filter(function (r) { return cols.every(function (c) { var v = r[c]; return v !== null && v !== undefined && !isNaN(v); }); }); };
PM.yOf = function (rows, col) { return rows.map(function (r) { return r[col]; }); };

/* fit a model on rows with terms -> model object with predict() */
PM.fitModel = function (rows, terms, outcome, opts) {
  opts = opts || {};
  var des = PM.makeDesign(rows, terms), X = des.X(rows), y = PM.yOf(rows, outcome);
  var fit = PM.logit(X, y, { ridge: opts.ridge });
  var m = { design: des, fit: fit, beta: fit.beta.slice(), outcome: outcome, n: rows.length, events: y.reduce(function (a, b) { return a + b; }, 0), terms: terms };
  m.lp = function (newRows) { return PM.lp(des.X(newRows), m.beta); };
  m.chi2 = 2 * (fit.ll - PM.nullLL(y));
  m.dfModel = des.p - 1;
  return m;
};

/* bootstrap optimism correction (book Ch5/17): replay entire fitting strategy in each bootstrap sample.
   strategy(rows) -> model with .lp(rows). Returns apparent, mean optimism, corrected for c, slope(=shrink), r2, brier */
PM.bootOptimism = function (rows, outcome, strategy, B, seed, onProgress) {
  var rng = PM.rng(seed || 123), n = rows.length;
  var y0 = PM.yOf(rows, outcome);
  var m0 = strategy(rows), lp0 = m0.lp(rows), app = PM.perf(y0, lp0);
  var opt = { c: [], slope: [], r2: [], brierScaled: [] }, b, i, fails = 0;
  for (b = 0; b < B; b++) {
    var samp = []; for (i = 0; i < n; i++) samp.push(rows[Math.floor(rng.u() * n)]);
    try {
      var mb = strategy(samp), lpb = mb.lp(samp), yb = PM.yOf(samp, outcome);
      var pb = PM.perf(yb, lpb), lpt = mb.lp(rows), pt = PM.perf(y0, lpt);
      opt.c.push(pb.c - pt.c); opt.slope.push(pb.slope - pt.slope); opt.r2.push(pb.r2 - pt.r2); opt.brierScaled.push(pb.brierScaled - pt.brierScaled);
    } catch (e) { fails++; }
    if (onProgress) onProgress(b + 1, B);
  }
  var mo = { c: PM.mean(opt.c), slope: PM.mean(opt.slope), r2: PM.mean(opt.r2), brierScaled: PM.mean(opt.brierScaled) };
  return {
    model: m0, apparent: app, optimism: mo,
    corrected: { c: app.c - mo.c, slope: app.slope - mo.slope, r2: app.r2 - mo.r2, brierScaled: app.brierScaled - mo.brierScaled },
    shrinkage: 1 - mo.slope, B: B - fails
  };
};

/* uniform shrinkage heuristic: (model chi2 - df) / model chi2   [book Ch13] */
PM.heuristicShrink = function (chi2, df) { return Math.max(0, (chi2 - df) / chi2); };

/* backward elimination on Wald chi2 per term group; stop rule: 'p' with alpha, or 'aic' (chi2 > 2 df approx). groups = term indices into terms[] */
PM.backward = function (rows, terms, outcome, rule, alpha) {
  var cur = terms.slice(), model;
  while (true) {
    model = PM.fitModel(rows, cur, outcome);
    if (cur.length <= 1) break;
    var worst = -1, worstStat = Infinity, worstP = 0, worstDf = 1;
    for (var t = 0; t < cur.length; t++) {
      var g = model.design.groups[t + 1], b = g.map(function (j) { return model.beta[j]; });
      var V = g.map(function (a) { return g.map(function (c) { return model.fit.cov[a][c]; }); });
      var x = PM.solveSPD(V, b), w = 0; for (var q = 0; q < b.length; q++) w += b[q] * x[q];
      var pv = PM.pchisq(w, g.length), stat = (rule === 'aic') ? (w - 2 * g.length) : -pv; // lower = more droppable
      if (stat < worstStat) { worstStat = stat; worst = t; worstP = pv; worstDf = g.length; }
    }
    var drop = (rule === 'aic') ? (worstStat < 0) : (worstP > (alpha || 0.05));
    if (!drop) break;
    cur.splice(worst, 1);
  }
  return { model: model, terms: cur };
};

/* ---------- imputation (linear regression with residual noise; outcome included) ---------- */
PM.imputeOnce = function (rows, cols, outcome, rng, bootParams) {
  // Sequentially impute each column in cols using other (numeric) predictors + outcome; returns new rows
  var out = rows.map(function (r) { return Object.assign({}, r); });
  var predictors = Object.keys(rows[0]).filter(function (k) { return k !== 'id' && k !== outcome && cols.indexOf(k) < 0 && typeof rows[0][k] === 'number'; });
  // initial fill with means
  cols.forEach(function (c) { var vals = rows.map(function (r) { return r[c]; }).filter(function (v) { return v !== null && !isNaN(v); }); var m = PM.mean(vals); out.forEach(function (r) { if (r[c] === null || isNaN(r[c])) { r['__m_' + c] = 1; r[c] = m; } }); });
  for (var cyc = 0; cyc < 3; cyc++) {
    cols.forEach(function (c) {
      var obs = out.filter(function (r) { return !r['__m_' + c]; }), mis = out.filter(function (r) { return r['__m_' + c]; });
      if (!mis.length) return;
      var use = predictors.concat(cols.filter(function (k) { return k !== c; })).concat([outcome]);
      var samp = obs; if (bootParams) { samp = []; for (var i = 0; i < obs.length; i++) samp.push(obs[Math.floor(rng.u() * obs.length)]); }
      var Xo = samp.map(function (r) { return [1].concat(use.map(function (k) { return r[k]; })); });
      var fit = PM.ols(Xo, samp.map(function (r) { return r[c]; }));
      mis.forEach(function (r) { var mu = fit.beta[0]; use.forEach(function (k, j) { mu += fit.beta[j + 1] * r[k]; }); r[c] = mu + fit.sigma * rng.n(); });
    });
  }
  out.forEach(function (r) { Object.keys(r).forEach(function (k) { if (k.indexOf('__m_') === 0) delete r[k]; }); });
  return out;
};
/* Rubin pooling for logistic coefficients across m fits */
PM.rubin = function (fits) {
  var m = fits.length, p = fits[0].beta.length, beta = [], se = [];
  for (var j = 0; j < p; j++) {
    var bs = fits.map(function (f) { return f.beta[j]; }), mb = PM.mean(bs);
    var W = PM.mean(fits.map(function (f) { return f.se[j] * f.se[j]; }));
    var Bv = m > 1 ? bs.reduce(function (a, b) { return a + (b - mb) * (b - mb); }, 0) / (m - 1) : 0;
    beta.push(mb); se.push(Math.sqrt(W + (1 + 1 / m) * Bv));
  }
  return { beta: beta, se: se };
};

if (typeof module !== 'undefined') module.exports = PM;
