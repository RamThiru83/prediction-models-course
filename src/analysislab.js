/* ===== Analysis Lab: an in-browser model development and validation workbench ===== */
(function () {
  var f = K.f, pct = K.pct, plogis = PM.plogis, esc = K.esc;
  var DEFAULT_CODE = { ptb_dev: { age: 'sq' }, sepsis: { temp_c: 'sq' }, gdm: {} };
  var CODES = [['lin', 'Linear'], ['sq', 'Quadratic'], ['rcs3', 'Spline, 3 knots'], ['rcs4', 'Spline, 4 knots'], ['rcs5', 'Spline, 5 knots'], ['dich', 'Dichotomise at cut']];
  var fmtP = function (v) { return (100 * v).toFixed(0) + '%'; };

  function info(ds) {
    var s = PM.data.sets[ds], rows = PM.data.get(ds), cols = s.cols.filter(function (c) { return c !== 'id' && c !== s.outcome; });
    return cols.map(function (c) {
      var vals = rows.map(function (r) { return r[c]; }).filter(function (v) { return v !== null; });
      var bin = vals.every(function (v) { return v === 0 || v === 1; });
      return { col: c, label: s.labels[c], bin: bin, median: PM.quantile(vals, 0.5), missing: rows.length - vals.length };
    });
  }
  function split(ds) {
    var rows = PM.data.get(ds);
    if (ds === 'ptb_dev') return { dev: rows, val: PM.data.get('ptb_val'), valName: 'ptb_val (referral hospital cohort)' };
    var k = Math.floor(rows.length * 0.7); return { dev: rows.slice(0, k), val: rows.slice(k), valName: 'held-out last 30% of the records' };
  }
  function termDf(t) { return t.kind === 'rcs' ? t.knots - 1 : (t.kind === 'sq' ? 2 : 1); }
  function hanley(c, n1, n0) { var q1 = c / (2 - c), q2 = 2 * c * c / (1 + c), v = (c * (1 - c) + (n1 - 1) * (q1 - c * c) + (n0 - 1) * (q2 - c * c)) / (n1 * n0); return Math.sqrt(Math.max(0, v)); }

  K.widget('analysisLab', function (P) {
    var cfg = document.createElement('div'); cfg.style.gridColumn = '1 / -1'; var seed = 99, last = null, runToken = null;
    P.select('ds', 'Dataset', [['ptb_dev', 'Preterm birth (validate on ptb_val)'], ['sepsis', 'Neonatal sepsis (validate on last 30%)'], ['gdm', 'Gestational diabetes (validate on last 30%)']], 'ptb_dev');
    P.slider('n', 'Development subsample size', 100, 2000, 50, 2000, function (x) { return String(x); });
    P.select('miss', 'Missing data', [['cc', 'Complete case'], ['si', 'Single stochastic imputation'], ['mi', 'Multiple imputation, m = 5']], 'cc');
    P.select('sel', 'Predictor selection', [['none', 'None (keep all chosen)'], ['p05', 'Backward, p < 0.05'], ['aic', 'Backward, AIC-like']], 'none');
    P.select('shr', 'Shrinkage', [['none', 'None'], ['boot', 'Uniform, bootstrap slope'], ['heur', 'Uniform, heuristic (χ² − df)/χ²'], ['ridge', 'Ridge penalty']], 'none');
    P.slider('lam', 'Ridge λ (if ridge)', 0, 60, 1, 10, function (x) { return String(x); });
    P.slider('B', 'Bootstrap replications', 50, 200, 50, 100, function (x) { return String(x); });
    P.slider('thr', 'Decision threshold', 0.02, 0.6, 0.01, 0.15, function (x) { return pct(x, 0); });
    P.cbox.appendChild(cfg);
    var prog = P.progress();
    var preds = {};
    function buildCfg() {
      var ds = P.v.ds, I = info(ds); preds = {};
      cfg.innerHTML = '<h4 style="margin-top:6px">Candidate predictors and coding</h4><div class="scroll" style="max-height:260px"><table class="data tbl-s"><thead><tr><th>Use</th><th>Predictor</th><th>Missing</th><th>Coding</th><th>Cut</th></tr></thead><tbody>' + I.map(function (p, i) {
        var dc = (DEFAULT_CODE[ds] || {})[p.col] || 'lin';
        preds[p.col] = { on: true, code: dc, cut: p.median, bin: p.bin, label: p.label };
        return '<tr><td><input type="checkbox" checked data-p="' + p.col + '" data-t="on" id="al_on_' + i + '" aria-label="Use ' + p.col + '"></td><td><label for="al_on_' + i + '"><code>' + p.col + '</code> <span style="color:var(--muted)">' + esc(p.label) + '</span></label></td><td class="r">' + (p.missing || '') + '</td><td>' +
          (p.bin ? '<span style="color:var(--muted)">binary</span>' : '<select data-p="' + p.col + '" data-t="code" aria-label="Coding of ' + p.col + '">' + CODES.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === dc ? ' selected' : '') + '>' + c[1] + '</option>'; }).join('') + '</select>') + '</td><td>' +
          (p.bin ? '' : '<input type="number" step="any" value="' + f(p.median, 1) + '" data-p="' + p.col + '" data-t="cut" style="width:76px" aria-label="Cut-point for ' + p.col + '">') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
      Array.prototype.forEach.call(cfg.querySelectorAll('[data-p]'), function (e) {
        e.addEventListener('change', function () { var p = preds[e.getAttribute('data-p')], t = e.getAttribute('data-t'); if (t === 'on') p.on = e.checked; else if (t === 'code') p.code = e.value; else p.cut = parseFloat(e.value); });
      });
    }
    buildCfg(); var curDs = P.v.ds;
    P.onchange = function () { if (P.v.ds !== curDs) { curDs = P.v.ds; buildCfg(); last = null; P.draw(); } };
    P.onreset = function () { curDs = P.v.ds; buildCfg(); seed = 99; last = null; };
    P.draw = function () {
      if (last) return;
      var sp = split(P.v.ds);
      P.out.innerHTML = '<p class="note">Choose a dataset, predictors, coding and strategy, then press <b>Run analysis</b>. The workbench fits a logistic regression, estimates optimism by bootstrap (replaying selection and shrinkage), and validates the final model on <b>' + esc(sp.valName) + '</b>. All data are synthetic. Time grows with sample size, selection and replications.</p>';
    };

    function makeTerms() {
      var t = []; Object.keys(preds).forEach(function (c) {
        var p = preds[c]; if (!p.on) return;
        if (p.bin) t.push({ col: c, kind: 'bin' });
        else if (p.code === 'lin') t.push({ col: c });
        else if (p.code === 'sq') t.push({ col: c, kind: 'sq' });
        else if (p.code === 'dich') t.push({ col: c, kind: 'dich', cut: p.cut, name: c + ' ≥ ' + p.cut });
        else t.push({ col: c, kind: 'rcs', knots: +p.code[3] });
      });
      return t;
    }
    function pipeline(rows, terms, S, outcome) {
      var tt = terms;
      if (S.sel !== 'none') tt = (S.sel === 'aic' ? PM.backward(rows, terms, outcome, 'aic') : PM.backward(rows, terms, outcome, 'p', 0.05)).terms;
      if (!tt.length) throw new Error('No predictors remain after selection.');
      var m = S.shr === 'ridge' ? K.ridgeModel(rows, tt, outcome, S.lam) : PM.fitModel(rows, tt, outcome);
      m.selTerms = tt;
      if (S.shr === 'heur') { var sh = K.uniformShrink(m, rows); sh.base = m; sh.selTerms = tt; sh.fit = m.fit; sh.n = m.n; sh.events = m.events; sh.design = m.design; return sh; }
      return m;
    }
    function shrinkBy(m, s, rows, outcome) {
      var y = PM.yOf(rows, outcome), lp = m.lp(rows), b0 = m.beta[0], xb = lp.map(function (e) { return s * (e - b0); }), a = PM.logit(lp.map(function () { return [1]; }), y, { offset: xb }).beta[0];
      var beta = m.beta.map(function (b, j) { return j === 0 ? a : s * b; }), r = { beta: beta, design: m.design, selTerms: m.selTerms, fit: m.fit, chi2: m.chi2, dfModel: m.dfModel, n: m.n, events: m.events, s: s, base: m };
      r.lp = function (rr) { return PM.lp(m.design.X(rr), beta); }; return r;
    }
    function charts(y, lp, thr, tag) {
      var p = lp.map(plogis), g = PM.calibGroups(y, lp, 10), grid = []; for (var q = 0.01; q <= 0.99; q += 0.01) grid.push(q);
      var sm = PM.smoothCalib(y, p, grid), mx = Math.min(1, Math.max(0.25, Math.max.apply(null, g.map(function (r) { return Math.max(r.pred, r.obs); })) * 1.15));
      var roc = PM.rocCurve(y, lp).map(function (r) { return { x: r.fpr, y: r.tpr }; });
      var dc = PM.decisionCurve(y, p, 0.01, 0.6, 0.01), ymax = Math.max(0.02, Math.max.apply(null, dc.map(function (d) { return d.model; })) * 1.2), ymin = -ymax * 0.6, nb = PM.netBenefit(y, p, thr);
      return '<div class="grid2"><div>' + Chart.plot({ w: 360, h: 300, xlim: [0, mx], ylim: [0, mx], title: 'Calibration', xlabel: 'Predicted', ylabel: 'Observed', xfmt: fmtP, yfmt: fmtP, layers: [{ type: 'diag', color: 'muted' }, { type: 'line', pts: sm.filter(function (z) { return z.x <= mx; }), color: 'a' }, { type: 'points', pts: g.map(function (r) { return { x: r.pred, y: r.obs }; }), color: 'b', r: 4 }] }) + '</div><div>' +
        Chart.plot({ w: 360, h: 300, xlim: [0, 1], ylim: [0, 1], title: 'ROC', xlabel: '1 − specificity', ylabel: 'Sensitivity', layers: [{ type: 'diag', color: 'muted' }, { type: 'line', pts: roc, color: 'a', width: 2 }] }) + '</div><div>' +
        Chart.plot({ w: 360, h: 300, xlim: [0, 0.6], ylim: [ymin, ymax], title: 'Decision curve', xlabel: 'Threshold', ylabel: 'Net benefit', xfmt: fmtP, layers: [{ type: 'hline', y: 0, color: 'muted', dash: '' }, { type: 'line', pts: dc.map(function (d) { return { x: d.t, y: d.all }; }), color: 'c' }, { type: 'line', pts: dc.map(function (d) { return { x: d.t, y: d.model }; }), color: 'a', width: 2.5 }, { type: 'vline', x: thr, color: 'b' }], legend: [{ label: 'Model', color: 'a' }, { label: 'Treat all', color: 'c' }] }) + '</div></div>';
    }

    function run() {
      if (runToken) runToken.stop = true; runToken = { stop: false }; var tok = runToken; P.token = tok;
      var S = { ds: P.v.ds, n: P.v.n, miss: P.v.miss, sel: P.v.sel, shr: P.v.shr, lam: P.v.lam, B: P.v.B, thr: P.v.thr }, spec = PM.data.sets[S.ds], outcome = spec.outcome, sp = split(S.ds), SUM = [];
      var terms = makeTerms(); if (!terms.length) { P.out.innerHTML = K.verdict('Select at least one predictor.', 'warn'); return; }
      var R = PM.rng(seed), idx = sp.dev.map(function (_, i) { return i; }); for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(R.u() * (i + 1)), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      var nUse = Math.min(S.n, sp.dev.length), raw = idx.slice(0, nUse).sort(function (a, b) { return a - b; }).map(function (k) { return sp.dev[k]; });
      var usedCols = terms.map(function (t) { return t.col; }), candDf = terms.reduce(function (a, t) { return a + termDf(t); }, 0);
      var missCols = info(S.ds).filter(function (p) { return p.missing > 0; }).map(function (p) { return p.col; }), analysis, imps = null, note = '';
      try {
        if (S.miss === 'cc') { analysis = PM.complete(raw, usedCols); note = 'Complete-case analysis: ' + analysis.length + ' of ' + raw.length + ' records have all chosen predictors.'; }
        else { var IR = PM.rng(seed + 5); if (S.miss === 'si') { analysis = PM.imputeOnce(raw, missCols, outcome, IR, false); note = missCols.length ? 'Missing values in ' + missCols.join(', ') + ' imputed once (stochastic regression including the outcome).' : 'None of the chosen predictors has missing values in this dataset, so there is nothing to impute.'; } else { imps = []; for (var m = 0; m < 5; m++) imps.push(PM.imputeOnce(raw, missCols, outcome, IR, true)); analysis = imps[0]; note = (missCols.length ? '' : 'None of the chosen predictors has missing values here, so the five imputed datasets are identical. ') + 'Five imputed datasets, coefficients pooled by Rubin’s rules. Selection and the bootstrap use the first imputed dataset only (a simplification).'; } }
        var ev = analysis.reduce(function (a, r) { return a + r[outcome]; }, 0);
        if (ev < 5 || analysis.length - ev < 5) throw new Error('Too few events or non-events to fit a model.');
        var base = { sel: S.sel, shr: S.shr === 'boot' ? 'none' : S.shr, lam: S.lam };
        var model = pipeline(analysis, terms, base, outcome);
        if (S.miss === 'mi') { // pool coefficients over the five imputed datasets using the design of the first
          var des = model.design, fits = imps.map(function (d) { var X = des.X(d), y = PM.yOf(d, outcome); return PM.logit(X, y, {}); }), pooled = PM.rubin(fits), beta = pooled.beta;
          var pm = { design: des, beta: beta, fit: { se: pooled.se }, selTerms: model.selTerms, chi2: model.chi2, dfModel: model.dfModel, n: model.n, events: model.events };
          pm.lp = function (rr) { return PM.lp(des.X(rr), beta); }; model = pm;
        }
        var y = PM.yOf(analysis, outcome), lp0 = model.lp(analysis), app = PM.perf(y, lp0), df = model.dfModel, chi2 = model.chi2;
        var selNames = model.selTerms.map(function (t) { return t.name || t.col; });
        var se = (model.fit && model.fit.se) ? model.fit.se : null, names = model.design.names;
        var ctab = names.map(function (nm, k) { var b = model.beta[k], isOR = (k > 0 && !/spline|²/.test(nm)); return [esc(nm), f(b, 3), se ? f(se[k], 3) : '', k === 0 ? '' : (isOR ? f(Math.exp(b), 2) : '–')]; });
        var epv = ev / candDf;
        var head = '<h3>Development</h3><p class="note">' + esc(note) + '</p>' + K.stats([['Records analysed', analysis.length], ['Events', ev], ['Candidate df', candDf], ['EPV (events / candidate df)', f(epv, 1)], ['Model χ² / df', f(chi2, 1) + ' / ' + df]]) +
          (epv < 10 ? K.verdict('Events per candidate parameter are below 10: expect substantial overfitting. Apparent performance will be optimistic.', 'bad') : '') +
          (S.sel !== 'none' ? '<p>Predictors kept after selection (' + selNames.length + ' of ' + terms.length + '): ' + esc(selNames.join(', ')) + '.</p>' : '') +
          '<div class="scroll">' + K.tbl(['Term', 'β', 'SE', 'Odds ratio'], ctab, 'tbl-s').replace(/<div class="tw">|<\/div>$/g, '') + '</div>' +
          '<h4>Apparent performance (same data)</h4>' + K.stats([['c statistic', f(app.c, 3)], ['Calibration slope', f(app.slope, 2)], ['Nagelkerke R²', f(app.r2, 3)], ['Brier', f(app.brier, 4)], ['Scaled Brier', f(app.brierScaled, 3)]]) + charts(y, lp0, S.thr, 'dev');
        SUM.push('Dataset ' + S.ds + ': ' + analysis.length + ' records analysed, ' + ev + ' events, candidate df ' + candDf + ', EPV ' + f(epv, 1) + '. ' + note);
        SUM.push('Strategy: missing data = ' + S.miss + '; selection = ' + S.sel + '; shrinkage = ' + S.shr + (S.shr === 'ridge' ? ' (lambda ' + S.lam + ')' : '') + '. Predictors kept: ' + selNames.join(', ') + '.');
        SUM.push('Apparent: c ' + f(app.c, 3) + ', calibration slope ' + f(app.slope, 2) + ', scaled Brier ' + f(app.brierScaled, 3) + '.');
        P.out.innerHTML = head + '<div id="alboot"><p class="note">Bootstrap optimism running…</p></div><div id="alval"></div>';
        last = true;
        var strat = function (rows) { return pipeline(rows, terms, base, outcome); };
        PM.bootAsync(analysis, outcome, strat, S.B, seed + 11, function (b, B) { prog(b, B); }, function (bo) {
          var shrinkS = 1;
          if (S.shr === 'boot') { shrinkS = Math.max(0, Math.min(1, 1 - bo.optimism.slope)); model = shrinkBy(model, shrinkS, analysis, outcome); }
          var bhtml = '<h3>Bootstrap optimism correction (B = ' + bo.B + ')</h3>' + K.tbl(['Measure', 'Apparent', 'Optimism', 'Corrected'], [['c statistic', f(bo.apparent.c, 3), f(bo.optimism.c, 3), f(bo.corrected.c, 3)], ['Calibration slope', f(bo.apparent.slope, 2), f(bo.optimism.slope, 3), f(bo.corrected.slope, 2)], ['Nagelkerke R²', f(bo.apparent.r2, 3), f(bo.optimism.r2, 3), f(bo.corrected.r2, 3)], ['Scaled Brier', f(bo.apparent.brierScaled, 3), f(bo.optimism.brierScaled, 3), f(bo.corrected.brierScaled, 3)]]) +
            '<p class="note">Each bootstrap sample replays the whole strategy (' + (S.sel !== 'none' ? 'selection, ' : '') + 'fitting' + (S.shr === 'ridge' ? ', ridge' : '') + (S.shr === 'heur' ? ', heuristic shrinkage' : '') + '). ' + (S.shr === 'boot' ? 'Shrinkage factor from the bootstrap slope: <b>' + f(shrinkS, 3) + '</b>; coefficients multiplied by it and the intercept re-estimated. Corrected figures are for the strategy before shrinkage; uniform shrinkage does not change c. ' : '') + (S.miss !== 'cc' ? 'Imputation was done once before the bootstrap and is not replayed. ' : '') + '</p>';
          SUM.push('Bootstrap-corrected (B ' + bo.B + '): c ' + f(bo.corrected.c, 3) + ', slope ' + f(bo.corrected.slope, 2) + ', scaled Brier ' + f(bo.corrected.brierScaled, 3) + (S.shr === 'boot' ? '; bootstrap shrinkage factor ' + f(shrinkS, 3) : '') + '.');
          var el = P.out.querySelector('#alboot'); if (!el) return; el.innerHTML = bhtml;
          // external validation
          var vrows = PM.complete(sp.val, usedCols), yv = PM.yOf(vrows, outcome), vh;
          if (vrows.length < 30 || yv.reduce(function (a, b) { return a + b; }, 0) < 5) vh = '<p class="note">Too few validation records for the chosen predictors.</p>';
          else {
            var lpv = model.lp(vrows), pv = PM.perf(yv, lpv), cal = PM.calib(yv, lpv), n1 = pv.events, n0 = vrows.length - n1, se_c = hanley(pv.c, n1, n0), nbv = PM.netBenefit(yv, lpv.map(plogis), S.thr);
            vh = '<h3>External validation on ' + esc(sp.valName) + '</h3><p class="num">' + vrows.length + ' records with complete data on the chosen predictors, ' + n1 + ' events (' + pct(n1 / vrows.length) + ').</p>' +
              K.stats([['Calibration-in-the-large', K.sgn(cal.citl, 2) + ' ± ' + f(1.96 * cal.citlSE, 2)], ['Calibration slope', f(cal.slope, 2) + ' ± ' + f(1.96 * cal.slopeSE, 2)], ['c statistic (95% CI)', f(pv.c, 3) + ' (' + f(pv.c - 1.96 * se_c, 3) + ' to ' + f(pv.c + 1.96 * se_c, 3) + ')'], ['Scaled Brier', f(pv.brierScaled, 3)]]) +
              K.verdict('Net benefit at ' + pct(S.thr, 0) + ': model ' + f(nbv.model, 4) + ', treat all ' + f(nbv.all, 4) + ', treat none 0. ' + (nbv.model > Math.max(0, nbv.all) ? 'The model beats both default policies here.' : 'The model does not beat the best default policy here.'), nbv.model > Math.max(0, nbv.all) ? 'good' : 'bad') + charts(yv, lpv, S.thr, 'val') +
              '<p class="note">' + (S.ds === 'ptb_dev' ? 'The validation cohort differs in case-mix and in the strength of predictor effects, so a calibration slope below 1 and a non-zero calibration-in-the-large are expected: this is what a transported model faces. ' : 'The held-out records come from the same synthetic setting, so this is an internal-external check rather than a test in a different population. ') + 'Validation uses records complete on the chosen predictors.</p>';
            SUM.push('External validation (' + sp.valName + ', n ' + vrows.length + ', events ' + n1 + '): calibration-in-the-large ' + K.sgn(cal.citl, 2) + ', slope ' + f(cal.slope, 2) + ', c ' + f(pv.c, 3) + ' (95% CI ' + f(pv.c - 1.96 * se_c, 3) + ' to ' + f(pv.c + 1.96 * se_c, 3) + '), net benefit at ' + pct(S.thr, 0) + ' = ' + f(nbv.model, 4) + ' vs treat all ' + f(nbv.all, 4) + '. Synthetic data.');
          }
          P.out.querySelector('#alval').innerHTML = vh + '<p><button type="button" class="btn" id="alcopy">Copy summary</button></p>';
          var cb = P.out.querySelector('#alcopy'); cb.onclick = function () { K.copy(SUM.join('\n'), cb); };
        }, tok);
      } catch (e) { P.out.innerHTML = K.verdict('The analysis could not be completed: ' + esc(e.message), 'bad'); }
    }
    P.btn('Run analysis', run, true);
    P.btn('New random subsample', function () { seed = Math.floor(Math.random() * 1e6); last = null; P.draw(); });
  });
})();
