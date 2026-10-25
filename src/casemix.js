/* Case-mix simulation after the book's Chapter 19 design: observed x (the model's linear predictor), missed z. */
PM.casemix = (function () {
  var N = 120000, D = null;
  var BX = { '0': 2.05, '0.33': 1.5, '0.5': 1.18 }, BZ = 1.5, SCN = {};
  function init() {
    if (D) return; var R = PM.rng(8128); D = { xa: [], xb: [], e: [], u: [], u2: [] };
    for (var i = 0; i < N; i++) { D.xa.push(R.n()); D.xb.push(R.n()); D.e.push(R.n()); D.u.push(R.u()); D.u2.push(R.u()); }
  }
  /* scenario table: sel(x,z,i) -> keep?; fx, fz multipliers; mul = [ma, mb] for the two halves of x; slope = factor on all true coefficients; cc = case-control ratio */
  SCN = {
    dev: {}, xsev: { selx: function (x, u) { return u < PM.plogis(2 * (x + 0.3)); } }, xless: { selx: function (x, u) { return u < PM.plogis(-1.8 * (x - 0.1)); } },
    xhet: { selx: function (x) { return Math.abs(x) > 0.72; } }, xhom: { selx: function (x) { return Math.abs(x) < 1.3; } },
    zsev: { selz: function (z) { return z > -0.35; } }, zless: { selz: function (z) { return z < 0.35; } },
    zhet: { selz: function (z) { return Math.abs(z) > 0.7; } }, zhom: { selz: function (z) { return Math.abs(z) < 1.0; } },
    cc21: { cc: 2 }, cc12: { cc: 0.5 }, ov8: { slope: 0.71 }, ov6: { slope: 0.5 }, c515: { mul: [0.5, 1.5] }, c2515: { mul: [0.25, 1.5] }
  };
  function run(name, r, thr) {
    init(); var S = SCN[name] || {}, rk = String(r), bx = BX[rk] !== undefined ? BX[rk] : 1.5, sl = S.slope || 1, ma = S.mul ? S.mul[0] : 1, mb = S.mul ? S.mul[1] : 1;
    var sr = Math.sqrt(1 - r * r), lp = [], pm = [], y = [], i, z, x;
    for (i = 0; i < N; i++) {
      x = (D.xa[i] + D.xb[i]) / Math.SQRT2; z = r * x + sr * D.e[i];
      if (S.selx && !S.selx(x, D.u2[i])) continue; if (S.selz && !S.selz(z, D.u2[i])) continue;
      var tl = sl * (bx * (ma * D.xa[i] + mb * D.xb[i]) / Math.SQRT2 + BZ * z), yy = D.u[i] < PM.plogis(tl) ? 1 : 0;
      if (S.cc === 2 && yy === 0 && D.u2[i] < 0.5) continue; if (S.cc === 0.5 && yy === 1 && D.u2[i] < 0.5) continue;
      lp.push(1.5 * x); y.push(yy);
    }
    var n = y.length, cal = PM.calib(y, lp), c = PM.auc(y, lp), p = lp.map(PM.plogis), t = thr || 0.3, w = t / (1 - t);
    var tp = 0, fp = 0, ev = 0; for (i = 0; i < n; i++) { ev += y[i]; if (p[i] >= t) { if (y[i]) tp++; else fp++; } }
    var nb = (tp - w * fp) / n, pr = ev / n, nbAll = pr - w * (1 - pr);
    return { n: n, inc: pr, citl: cal.citl, slope: cal.slope, c: c, nb: nb, nbAll: nbAll, gain: nb - nbAll, y: y, lp: lp };
  }
  return { run: run, SCN: SCN };
})();
if (typeof module !== 'undefined') module.exports = PM;
