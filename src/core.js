/* ===== registry ===== */
var App = { mods: [], byId: {}, refs: {}, widgets: {}, liveCache: {}, prog: { quiz: {}, done: {} } };
var K = {};
function registerModule(m) { App.mods.push(m); App.byId[m.id] = m; }
function registerRef(r) { App.refs[r.id] = r; }
App.order = ['p0', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'cap'];

/* ===== small helpers ===== */
K.f = function (x, d) { return (x === null || x === undefined || isNaN(x)) ? 'n/a' : Number(x).toFixed(d === undefined ? 2 : d); };
K.pct = function (x, d) { return (x === null || x === undefined || isNaN(x)) ? 'n/a' : (100 * x).toFixed(d === undefined ? 1 : d) + '%'; };
K.sgn = function (x, d) { return (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(d === undefined ? 2 : d); };
K.esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
K.stats = function (items) { return '<div class="stats">' + items.map(function (a) { return '<div class="stat"><small>' + a[0] + '</small><b>' + a[1] + '</b></div>'; }).join('') + '</div>'; };
K.tbl = function (head, rows, cls) {
  return '<div class="tw"><table class="data ' + (cls || '') + '"><thead><tr>' + head.map(function (h, i) { return '<th' + (i ? ' class="r"' : '') + '>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
    rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i ? ' class="r"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
};
K.verdict = function (txt, kind) { return '<div class="verdict ' + (kind || '') + '">' + txt + '</div>'; };
K.mean = PM.mean; K.sd = PM.sd;
K.hist = function (vals, lo, hi, nb) { return Chart.hist(vals, lo, hi, nb); };
K.save = function (filename, text, btn) {
  var done = function (msg) { if (btn) { var o = btn.textContent; btn.textContent = msg; setTimeout(function () { btn.textContent = o; }, 2200); } };
  try {
    if (window.claude && window.claude.use) {
      window.claude.use('downloads').then(function (d) {
        if (!d) { done('Downloads unavailable here'); return; }
        d.save({ filename: filename, data: text }).then(function () { done('Saved'); }, function (e) { done(e && e.code === 'declined' ? 'Cancelled' : 'Could not save'); });
      }, function () { done('Downloads unavailable here'); });
    } else { var bl = new Blob([text], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); done('Saved'); }
  } catch (e) { done('Downloads unavailable here'); }
};
K.copy = function (text, btn) {
  var ok = function () { var o = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = o; }, 1800); };
  try { navigator.clipboard.writeText(text).then(ok, function () { K.fallbackCopy(text); ok(); }); } catch (e) { K.fallbackCopy(text); ok(); }
};
K.fallbackCopy = function (text) { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) { } document.body.removeChild(t); };
/* time-sliced loop so the page stays responsive */
K.run = function (n, step, prog, done, token) {
  var i = 0;
  function tick() {
    var t0 = Date.now();
    while (i < n && Date.now() - t0 < 28) { step(i); i++; }
    if (prog) prog(i, n);
    if (token && token.stop) return;
    if (i < n) setTimeout(tick, 0); else if (done) done();
  }
  setTimeout(tick, 0);
};
/* 14-term full preterm model */
PM.ptbTerms = [{ col: 'age', kind: 'sq', name: 'age' }, { col: 'bmi' }, { col: 'hb' }, { col: 'primigravida', kind: 'bin' }, { col: 'prior_ptb', kind: 'bin' }, { col: 'short_interval', kind: 'bin' }, { col: 'chronic_htn', kind: 'bin' }, { col: 'tobacco', kind: 'bin' }, { col: 'bacteriuria', kind: 'bin' }, { col: 'ses_low', kind: 'bin' }, { col: 'anc_visits' }, { col: 'female_fetus', kind: 'bin' }, { col: 'conception_monsoon', kind: 'bin' }, { col: 'height_cm' }];
/* async bootstrap optimism (same algorithm as PM.bootOptimism) */
PM.bootAsync = function (rows, outcome, strategy, B, seed, onProg, done, token) {
  var rng = PM.rng(seed || 123), n = rows.length, y0 = PM.yOf(rows, outcome);
  var m0 = strategy(rows), lp0 = m0.lp(rows), app = PM.perf(y0, lp0);
  var opt = { c: [], slope: [], r2: [], brierScaled: [] }, b = 0, fails = 0, i;
  function step() {
    var t0 = Date.now();
    while (b < B && Date.now() - t0 < 30) {
      var samp = []; for (i = 0; i < n; i++) samp.push(rows[Math.floor(rng.u() * n)]);
      try {
        var mb = strategy(samp), lpb = mb.lp(samp), yb = PM.yOf(samp, outcome), pb = PM.perf(yb, lpb), pt = PM.perf(y0, mb.lp(rows));
        opt.c.push(pb.c - pt.c); opt.slope.push(pb.slope - pt.slope); opt.r2.push(pb.r2 - pt.r2); opt.brierScaled.push(pb.brierScaled - pt.brierScaled);
      } catch (e) { fails++; }
      b++;
    }
    if (onProg) onProg(b, B);
    if (token && token.stop) return;
    if (b < B) { setTimeout(step, 0); return; }
    var mo = { c: PM.mean(opt.c), slope: PM.mean(opt.slope), r2: PM.mean(opt.r2), brierScaled: PM.mean(opt.brierScaled) };
    done({ model: m0, apparent: app, optimism: mo, corrected: { c: app.c - mo.c, slope: app.slope - mo.slope, r2: app.r2 - mo.r2, brierScaled: app.brierScaled - mo.brierScaled }, shrinkage: 1 - mo.slope, B: B - fails });
  }
  setTimeout(step, 0);
};

/* ===== progress: see sync.js ===== */

/* ===== live values from the course datasets ===== */
App.live = {};
App.computeLive = function () {
  var D = PM.data, dev = D.get('ptb_dev'), val = D.get('ptb_val'), L = App.live;
  var ev = function (a) { return a.reduce(function (s, r) { return s + r.preterm; }, 0); };
  L.ptb_dev_n = String(dev.length); L.ptb_dev_events = String(ev(dev)); L.ptb_dev_incidence = K.pct(ev(dev) / dev.length);
  L.ptb_val_n = String(val.length); L.ptb_val_events = String(ev(val)); L.ptb_val_incidence = K.pct(ev(val) / val.length);
  L.ptb_hb_missing_pct = K.pct(dev.filter(function (r) { return r.hb === null; }).length / dev.length);
  L.ptb_bmi_missing_pct = K.pct(dev.filter(function (r) { return r.bmi === null; }).length / dev.length);
  var cc = PM.complete(dev, ['bmi', 'hb']); L.ptb_cc_n = String(cc.length); L.ptb_cc_events = String(ev(cc));
  var sep = D.get('sepsis'), gdm = D.get('gdm');
  L.sepsis_n = String(sep.length); L.sepsis_events = String(sep.filter(function (r) { return r.sepsis; }).length);
  L.gdm_n = String(gdm.length); var ge = gdm.filter(function (r) { return r.gdm; }).length; L.gdm_events = String(ge); L.gdm_incidence = K.pct(ge / gdm.length);
  var m = PM.fitModel(cc, PM.ptbTerms, 'preterm'); App.fullModel = m;
  var pa = PM.perf(PM.yOf(cc, 'preterm'), m.lp(cc)); L.ptb_full_apparent_c = K.f(pa.c, 3);
  var vv = PM.complete(val, ['bmi', 'hb']), pv = PM.perf(PM.yOf(vv, 'preterm'), m.lp(vv));
  L.ptb_val_c = K.f(pv.c, 3); L.ptb_val_slope = K.f(pv.slope, 2); L.ptb_val_citl = K.sgn(pv.citl, 2);
  App.fillLive();
  PM.bootAsync(cc, 'preterm', function (r) { return PM.fitModel(r, PM.ptbTerms, 'preterm'); }, 100, 7, null, function (bo) {
    L.ptb_full_corrected_c = K.f(bo.corrected.c, 3); L.ptb_full_optimism_c = K.f(bo.optimism.c, 3); L.ptb_full_shrinkage = K.f(bo.shrinkage, 2);
    App.fillLive();
  });
};
App.fillLive = function () { Array.prototype.forEach.call(document.querySelectorAll('[data-live]'), function (s) { var v = App.live[s.getAttribute('data-live')]; s.textContent = v === undefined ? '…' : v; }); };

/* ===== widget panel framework ===== */
K.titles = { datasetCard: 'Dataset', oddsConverter: 'Odds converter', logisticCurve: 'Logistic curve', bayes2x2: 'Test result to risk', samplingDemo: 'Sampling and bootstrap', epvCalculator: 'Events per variable', regressionDilution: 'Measurement error', completeCaseLoss: 'Complete-case loss', optimismSim: 'Optimism simulator', testimationSim: 'Selection bias simulator', missingDemo: 'Missing data simulator', codingExplorer: 'Coding explorer', stepwiseInstability: 'Stepwise instability', interactionCount: 'Interaction counter', shrinkageLab: 'Shrinkage lab', rocExplorer: 'Discrimination explorer', calibrationLab: 'Calibration lab', decisionCurveLab: 'Decision curve lab', nbCalculator: 'Net benefit calculator', validationLab: 'Validation lab', caseMixLab: 'Case-mix lab', validationPower: 'Validation sample size', scoreChartBuilder: 'Score chart builder', analysisLab: 'Analysis Lab' };
K.widget = function (name, fn) { App.widgets[name] = fn; };
K.uid = 0;
K.panel = function (root, title) {
  root.classList.add('wg'); root.innerHTML = '<div class="wg-h"><b></b><button class="btn sm" type="button">Reset</button></div><div class="wg-c"></div><div class="wg-b" hidden></div><div class="wg-o"></div>';
  root.querySelector('b').textContent = title;
  var P = { root: root, v: {}, defs: {}, ui: {}, out: root.querySelector('.wg-o'), cbox: root.querySelector('.wg-c'), bbox: root.querySelector('.wg-b'), token: { stop: false } };
  var pend = false;
  P.draw = function () { };
  P.onchange = function () { P.draw(); };
  P.touch = function () { if (pend) return; pend = true; requestAnimationFrame(function () { pend = false; P.onchange(); }); };
  function ctl(cls, key, label, html) { var d = document.createElement('div'); d.className = 'ctl ' + cls; var id = 'w' + (++K.uid); d.innerHTML = html.replace(/#ID#/g, id).replace('#LABEL#', label); P.cbox.appendChild(d); return d; }
  P.slider = function (key, label, min, max, step, def, fmt) {
    P.v[key] = def; P.defs[key] = def; fmt = fmt || function (x) { return String(x); };
    var d = ctl('', key, label, '<label for="#ID#"><span>#LABEL#</span><output></output></label><input id="#ID#" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + def + '">');
    var inp = d.querySelector('input'), o = d.querySelector('output'); o.textContent = fmt(def);
    inp.addEventListener('input', function () { P.v[key] = parseFloat(inp.value); o.textContent = fmt(P.v[key]); P.touch(); });
    P.ui[key] = function (v) { inp.value = v; o.textContent = fmt(v); }; return P;
  };
  P.select = function (key, label, opts, def) {
    P.v[key] = def; P.defs[key] = def;
    var d = ctl('', key, label, '<label for="#ID#"><span>#LABEL#</span></label><select id="#ID#">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(def) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>');
    var s = d.querySelector('select'); s.addEventListener('change', function () { var raw = s.value; P.v[key] = (raw !== '' && !isNaN(raw) && String(parseFloat(raw)) === raw) ? parseFloat(raw) : raw; P.touch(); });
    P.ui[key] = function (v) { s.value = v; }; return P;
  };
  P.number = function (key, label, def, min, max, step) {
    P.v[key] = def; P.defs[key] = def;
    var d = ctl('', key, label, '<label for="#ID#"><span>#LABEL#</span></label><input id="#ID#" type="number" min="' + min + '" max="' + max + '" step="' + (step || 1) + '" value="' + def + '">');
    var inp = d.querySelector('input'); inp.addEventListener('input', function () { var x = parseFloat(inp.value); if (!isNaN(x)) { P.v[key] = x; P.touch(); } });
    P.ui[key] = function (v) { inp.value = v; }; return P;
  };
  P.check = function (key, label, def) {
    P.v[key] = !!def; P.defs[key] = !!def;
    var d = ctl('chk', key, label, '<input id="#ID#" type="checkbox"' + (def ? ' checked' : '') + '><label for="#ID#">#LABEL#</label>');
    var inp = d.querySelector('input'); inp.addEventListener('change', function () { P.v[key] = inp.checked; P.touch(); });
    P.ui[key] = function (v) { inp.checked = !!v; }; return P;
  };
  P.btn = function (label, fn, primary) {
    P.bbox.hidden = false; var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (primary ? ' pri' : ''); b.textContent = label;
    b.addEventListener('click', function () { fn(b); }); P.bbox.appendChild(b); return b;
  };
  P.progress = function () { P.bbox.hidden = false; var w = document.createElement('div'); w.className = 'prog'; w.style.flex = '1 1 120px'; w.style.maxWidth = '260px'; w.innerHTML = '<i></i>'; P.bbox.appendChild(w); var i = w.firstChild; return function (a, b) { i.style.width = (100 * a / b).toFixed(0) + '%'; }; };
  P.reset = function () { P.token.stop = true; P.token = { stop: false }; Object.keys(P.defs).forEach(function (k) { P.v[k] = P.defs[k]; if (P.ui[k]) P.ui[k](P.defs[k]); }); if (P.onreset) P.onreset(); P.draw(); };
  root.querySelector('.wg-h .btn').addEventListener('click', P.reset);
  if (!P.cbox.children.length) { } return P;
};
K.mount = function (root) {
  var name = root.getAttribute('data-widget'), fn = App.widgets[name];
  if (!fn) { root.textContent = 'This interactive element is not available: ' + name; return; }
  var P = K.panel(root, K.titles[name] || name);
  try { fn(P, root.getAttribute('data-set')); P.draw(); if (!P.cbox.children.length) P.cbox.style.display = 'none'; } catch (e) { P.out.innerHTML = '<p class="note">This interactive element hit an error: ' + K.esc(e.message) + '</p>'; if (window.console) console.error(name, e); }
};

/* ===== quiz ===== */
App.quizHtml = function (mod) {
  var saved = App.prog.quiz[mod.id] || [];
  return mod.quiz.map(function (q, i) {
    var a = saved[i];
    return '<div class="q" data-m="' + mod.id + '" data-i="' + i + '"><div class="qt">' + (i + 1) + '. ' + q.q + '</div>' + q.options.map(function (o, j) {
      var cls = (a === undefined || a === null) ? '' : (j === q.answer ? ' right' : (j === a ? ' wrong' : ''));
      return '<button type="button" class="opt' + cls + '" data-j="' + j + '"><span class="k">' + 'ABCD'[j] + '</span><span>' + o + '</span></button>';
    }).join('') + ((a !== undefined && a !== null) ? '<div class="why"><b>' + (a === q.answer ? 'Correct. ' : 'Not quite. ') + '</b>' + q.why + '</div>' : '') + '</div>';
  }).join('') + '<p class="num" id="qscore"></p>';
};
App.quizScore = function (mod) { var s = App.prog.quiz[mod.id] || [], c = 0, d = 0; mod.quiz.forEach(function (q, i) { if (s[i] !== undefined && s[i] !== null) { d++; if (s[i] === q.answer) c++; } }); return { c: c, d: d, n: mod.quiz.length }; };
App.wireQuiz = function (root, mod) {
  var sc = root.querySelector('#qscore');
  function upd() { var s = App.quizScore(mod); sc.innerHTML = 'Answered ' + s.d + ' of ' + s.n + ', correct ' + s.c + '. ' + (s.d ? '<button type="button" class="btn sm" id="qreset">Reset quiz</button>' : ''); var r = sc.querySelector('#qreset'); if (r) r.onclick = function () { App.prog.quiz[mod.id] = []; App.prog.qt[mod.id] = Date.now(); App.save(); App.route(true); }; }
  upd();
  Array.prototype.forEach.call(root.querySelectorAll('.q'), function (qd) {
    qd.addEventListener('click', function (ev) {
      var b = ev.target.closest('.opt'); if (!b) return;
      var i = +qd.getAttribute('data-i'), q = mod.quiz[i], arr = App.prog.quiz[mod.id] = App.prog.quiz[mod.id] || [];
      if (arr[i] !== undefined && arr[i] !== null) return;
      var j = +b.getAttribute('data-j'); arr[i] = j; var P = App.prog; P.first[mod.id] = P.first[mod.id] || {}; if (P.first[mod.id][i] === undefined) P.first[mod.id][i] = (j === q.answer) ? 1 : 0; P.qt[mod.id] = Date.now(); App.save();
      Array.prototype.forEach.call(qd.querySelectorAll('.opt'), function (o, k) { if (k === q.answer) o.classList.add('right'); else if (k === j) o.classList.add('wrong'); });
      var w = document.createElement('div'); w.className = 'why'; w.innerHTML = '<b>' + (j === q.answer ? 'Correct. ' : 'Not quite. ') + '</b>' + q.why; qd.appendChild(w); upd(); App.markNav();
    });
  });
};

/* ===== pages ===== */
App.mods_sorted = function () { return App.order.map(function (id) { return App.byId[id]; }).filter(Boolean); };
App.MARK = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#9A3029"/><path d="M10 48 H54" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/><path d="M10 18 L40 48" stroke="#F2B84B" stroke-width="5" stroke-linecap="round"/><path d="M10 18 C 24 9, 38 14, 45 30 C 48 38, 50 44, 54 48" fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round"/><circle cx="10" cy="18" r="4.5" fill="#F08A24"/></svg>';
App.LOGO = '<a class="inst-logo" href="https://thsti.res.in" target="_blank" rel="noopener"><img alt="BRIC-THSTI" src="data:image/png;base64,__LOGO__"></a>';
App.modLabel = function (m) { return m.num === 0 ? 'P' : (typeof m.num === 'number' ? String(m.num) : 'C'); };
App.buildNav = function () {
  var h = '<a class="brand" href="#home">' + App.MARK + '<span class="tx"><b>CliPr</b><span>Clinical prediction models</span></span></a><p class="themerow"><button type="button" class="btn sm themebtn"></button></p>' + App.chipHtml() + '<nav class="nav">';
  h += '<a href="#home" data-p="home"><span class="n"></span><span>Start here</span><span></span></a>';
  h += '<a href="#howto" data-p="howto"><span class="n"></span><span>How to use this course</span><span></span></a>';
  var parts = {}, order = [];
  App.mods_sorted().forEach(function (m) { if (!parts[m.part]) { parts[m.part] = []; order.push(m.part); } parts[m.part].push(m); });
  order.forEach(function (p) {
    h += '<div class="navgrp">' + p + '</div>';
    parts[p].forEach(function (m) { var lk = App.lockInfo(m); h += '<a href="#' + m.id + '" data-p="' + m.id + '"' + (lk ? ' class="lk" title="' + lk + '"' : '') + '><span class="n">' + App.modLabel(m) + '</span><span>' + m.title + '</span><span class="dn" data-d="' + m.id + '">' + (lk ? '' : '') + '</span></a>'; });
  });
  h += '<div class="navgrp">Tools and reference</div>';
  h += '<a href="#datasets" data-p="datasets"><span class="n"></span><span>Datasets</span><span></span></a>';
  h += '<a href="#mastery" data-p="mastery"><span class="n"></span><span>Mastery check</span><span></span></a>';
  h += '<a href="#notes" data-p="notes"><span class="n"></span><span>My notes and answers</span><span></span></a>';
  if (App.acct.isInstructor()) h += '<a href="#dashboard" data-p="dashboard"><span class="n"></span><span>Class dashboard</span><span></span></a>';
  [['glossary', 'Glossary'], ['formulas', 'Formula sheet'], ['steps', 'Seven-step checklist'], ['map', 'Chapter map']].forEach(function (r) { if (App.refs[r[0]]) h += '<a href="#' + r[0] + '" data-p="' + r[0] + '"><span class="n"></span><span>' + r[1] + '</span><span></span></a>'; });
  h += '<a href="#about" data-p="about"><span class="n"></span><span>About this course</span><span></span></a></nav>';
  document.getElementById('rail').innerHTML = h + App.LOGO;
  App.theme.label();
};
App.markNav = function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-d]'), function (s) { var id = s.getAttribute('data-d'); s.textContent = App.lockInfo(App.byId[id]) ? 'locked' : (App.prog.done[id] ? '✓' : ''); });
  Array.prototype.forEach.call(document.querySelectorAll('#rail a[data-p]'), function (a) { if (a.getAttribute('data-p') === App.cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
};
App.pageHome = function () {
  var mods = App.mods_sorted(), done = mods.filter(function (m) { return App.prog.done[m.id]; }).length;
  var h = '<p class="eyebrow">Self-study course for clinical researchers</p><h1>Developing and validating clinical prediction models</h1>' +
    '<p class="lede">How to build a model that estimates an individual patient’s risk, show whether it works, and judge whether it is useful, taught with maternal and child health examples and data you can analyse in the browser.</p>' +
    '<div class="callout key"><b>How the course works</b><p>Each module teaches one stage of model development or validation from first principles: the idea, the formula, a worked example, and the pitfalls. Interactive simulators let you see the effect of sample size, missing data, selection and shrinkage rather than take it on trust. Each module ends with a quiz, three case tasks, and worked answers placed at the end so that you attempt the tasks first.</p></div>' +
    '<p>The method follows the framework in E. W. Steyerberg, <i>Clinical Prediction Models</i> (2009), chapters 1 to 19 (development and validation). The course is self-contained: no other text is needed. Model updating and the book’s case studies are outside its scope.</p>' +
    '<p>All datasets are <b>synthetic</b>. They describe no real person and were generated from known rules, so you can check what an analysis should recover.</p>';
  h += '<div class="prog" aria-hidden="true"><i style="width:' + (100 * done / mods.length).toFixed(0) + '%"></i></div><p class="num" style="color:var(--muted);font-size:14px">' + done + ' of ' + mods.length + ' modules marked complete (stored in this browser only).</p>';
  h += '<h3>Start where you are</h3><div class="home-grid">';
  h += App.homeBanner();
  var p0 = App.byId.p0, m01 = App.byId.m01;
  if (p0) h += '<a class="card" href="#p0"><small>Optional primer</small><b>' + p0.title + '</b><span>Odds, regression, test accuracy and sampling variability, for those who want a refresher first.</span></a>';
  if (m01) h += '<a class="card" href="#m01"><small>Main course</small><b>Module 1: ' + m01.title + '</b><span>The overall roadmap. Start here if you are comfortable with regression.</span></a>';
  h += '<a class="card" href="#datasets"><small>Practice material</small><b>Synthetic datasets</b><span>Preterm birth, neonatal sepsis and gestational diabetes data, with codebooks and CSV download.</span></a>';
  h += '<a class="card" href="#mastery"><small>Self-test</small><b>Mastery check</b><span>A mixed quiz drawn from every module, with a list of modules to revisit.</span></a></div>';
  [['Development', 'Development: building the model'], ['Validation', 'Validation and use']].forEach(function (g) {
    h += '<h3>' + g[1] + '</h3><div class="home-grid">';
    mods.filter(function (m) { return m.part === g[0]; }).forEach(function (m) { h += '<a class="card" href="#' + m.id + '"><small>Module ' + App.modLabel(m) + ' · ' + m.book + ' · ~' + m.minutes + ' min' + (App.lockInfo(m) ? ' · locked' : (App.prog.done[m.id] ? ' · done' : '')) + '</small><b>' + m.title + '</b><span>' + m.summary + '</span></a>'; });
    h += '</div>';
  });
  var cap = App.byId.cap; if (cap) h += '<h3>Capstone</h3><div class="home-grid"><a class="card" href="#cap"><small>Guided project</small><b>' + cap.title + '</b><span>' + cap.summary + '</span></a></div>';
  return { html: h };
};
App.pageAbout = function () {
  return { html: '<p class="eyebrow">About</p><h1>About this course</h1>' +
    '<h3>Purpose and audience</h3><p>The course is for MSc and PhD clinical researchers who will develop, validate or critically appraise a prediction model. It assumes you know basic epidemiology and what a regression model is. The primer covers the rest.</p>' +
    '<h3>Source and scope</h3><p>The principles taught here are those of E. W. Steyerberg, <i>Clinical Prediction Models: A Practical Approach to Development, Validation, and Updating</i> (Springer, 2009), chapters 1 to 19. Updating a model for a new setting (chapters 20 and 21) and the book’s case studies (chapters 22 to 24) are not covered. Exercises and tasks draw on wider experience, but the methodological principles stay within the book. Numbers quoted from the book’s own examples are labelled <b>Book example</b>. Maternal and child health illustrations are labelled <b>Illustrative (synthetic)</b>.</p>' +
    '<h3>Synthetic data</h3><p>Every dataset is simulated in your browser from stated rules. No participant data are used anywhere. The generating rules are revealed in the answers so that you can see how well an analysis recovers the truth. Because the data are simulated, effect sizes and performance figures show how methods behave and must not be read as clinical findings.</p>' +
    '<h3>Interactive elements</h3><p>Simulators run in your browser. Results vary with the random seed and, in some tools, differ slightly between runs. Heavier tools run in short steps with a progress bar. Without an account, your quiz answers, notes and module completion marks stay in this browser. With an account (join code from your instructor) they follow you across devices, and your instructor can see your progress, notes and answers.</p>' +
    '<h3>Limits</h3><p>The course teaches methods for logistic-regression-based prediction of binary outcomes. Survival models and other outcome types are mentioned only where the source treats them. Model development for real clinical use needs a protocol, appropriate data governance and ethics review, which this course does not replace.</p>' };
};
App.pageDatasets = function () {
  var h = '<p class="eyebrow">Practice material</p><h1>Synthetic datasets</h1><p class="lede">Four simulated maternal and child health datasets. Download the CSV and codebook to analyse in any software, or use the Analysis Lab in the course. All values are simulated; blank cells are missing values.</p>';
  ['ptb_dev', 'ptb_val', 'sepsis', 'gdm'].forEach(function (id) { h += '<div data-widget="datasetCard" data-set="' + id + '"></div>'; });
  return { html: h };
};
App.pageRef = function (id) { var r = App.refs[id]; return { html: '<p class="eyebrow">Reference</p><h1>' + r.title + '</h1>' + (id === 'glossary' ? '<input class="search" id="gsearch" type="search" placeholder="Search terms" aria-label="Search glossary">' : '') + '<div class="' + (id === 'glossary' ? 'gl' : '') + '" id="refbody">' + r.html + '</div>', after: function (root) {
  var s = root.querySelector('#gsearch'); if (!s) return;
  s.addEventListener('input', function () { var q = s.value.toLowerCase(); Array.prototype.forEach.call(root.querySelectorAll('#refbody > p'), function (p) { p.hidden = q && p.textContent.toLowerCase().indexOf(q) < 0; }); });
} }; };
/* ===== case-led module shown as steps: Essentials, Case 1..n, Check yourself, Worked answers, Full notes ===== */
App.pageCaseModule = function (m, prev, next) {
  var ncase = m.cases.length, P = App.prog;
  var taskHtml = function (t, i) { return '<div class="task" data-ti="' + i + '" id="' + m.id + '-task-' + i + '"><h3>Task ' + (i + 1) + '. ' + t.title + ' <span class="lvl">' + t.level + '</span></h3>' + t.scenario + t.questions.map(function (q) { return '<p>' + q + '</p>'; }).join('') +
    '<p class="tolink"><a href="#" data-goto="' + m.id + '-ans-' + i + '">Check your answer</a> (opens the worked answer)</p></div>'; };
  var steps = [{ key: 'ess', label: 'Essentials', sub: '5 min', cls: 'learn' }];
  m.cases.forEach(function (c, k) { steps.push({ key: c.id, label: 'Case ' + (k + 1), sub: c.tasks.length + ' tasks', cls: 'practise', title: c.title, tasks: c.tasks }); });
  steps.push({ key: 'quiz', label: 'Quiz', sub: m.quiz.length + ' questions', cls: 'check' });
  steps.push({ key: 'answers', label: 'Answers', sub: 'worked', cls: 'answers' });
  var hasNotes = m.sections && m.sections.length;
  if (hasNotes) steps.push({ key: 'notes', label: 'Notes', sub: 'optional', cls: 'notes' });
  var stepTitle = function (s) { return s.title ? s.label + '. ' + s.title : ({ Quiz: 'Check yourself', Answers: 'Worked answers', Notes: 'Full notes' }[s.label] || s.label); };
  var h = '<p class="eyebrow">' + m.part + (m.num === 0 ? '' : ' · ' + (typeof m.num === 'number' ? 'Module ' + m.num : m.num)) + '</p><h1>' + m.title + '</h1>';
  h += '<nav class="stepbar" aria-label="Steps in this module">' + steps.map(function (s, i) {
    return '<button type="button" class="stp ' + s.cls + '" data-step="' + i + '" aria-controls="' + m.id + '-st-' + s.key + '"><span class="stl">' + s.label + '</span><span class="sts">' + s.sub + '</span><span class="tick" aria-hidden="true"></span></button>'; }).join('') + '</nav>';
  var nav = function (i) {
    var a = steps[i - 1], b = steps[i + 1];
    return '<div class="stepnav">' + (a ? '<button type="button" class="btn" data-step="' + (i - 1) + '">← ' + stepTitle(a) + '</button>' : '<span></span>') +
      (b ? '<button type="button" class="btn pri" data-step="' + (i + 1) + '">Next: ' + stepTitle(b) + ' →</button>' : '<span></span>') + '</div>';
  };
  var storyBox = function (open) { return m.story ? '<details class="story"' + (open ? ' open' : '') + '><summary>The story in this module</summary><p>' + m.story + '</p></details>' : ''; };
  steps.forEach(function (s, i) {
    var body = '';
    if (s.key === 'ess') {
      body = '<p class="lede">' + m.summary + '</p><div class="meta"><span><b>Source</b> ' + m.book + '</span><span><b>Study time</b> about ' + m.minutes + ' minutes</span></div>' +
        '<div class="goals"><b>After this module you can</b><ul>' + m.objectives.map(function (o) { return '<li>' + o + '</li>'; }).join('') + '</ul></div>' +
        '<p class="flowhint">Work through the steps in the bar above, one at a time. Start with the essentials, then do each case: read what you need and the situation, try the simulator, and write your answer to each task before checking the worked answer. Finish with the quiz.</p>' +
        '<section class="sec essentials" id="' + m.id + '-ess"><h2>The essentials</h2>' + m.essentials + '</section>' + storyBox(true);
    } else if (s.tasks) {
      var c = m.cases[i - 1];
      body = storyBox(i === 1) + '<section class="sec case" id="' + m.id + '-' + c.id + '"><div class="ccard"><div class="chead">' +
        '<span class="cnum">Case ' + i + ' of ' + ncase + '</span><h2 class="ctitle">' + c.title + '</h2>' +
        '<span class="caim">In this case you will ' + c.aim + '</span><span class="cfoot">' + c.tasks.length + ' tasks · about ' + (c.minutes || 10) + ' min</span></div><div class="cbody">' +
        '<div class="need"><b>What you need</b>' + c.need + '</div>' +
        '<div class="situation"><b>The situation</b>' + c.scenario + '</div>' + (c.widgets || '') +
        '<div class="turn"><b class="turnh">Your turn</b>' + c.tasks.map(function (n) { return taskHtml(m.tasks[n], n); }).join('') + '</div>' +
        '<div class="takeaway"><b>Take-away</b><p>' + c.takeaway + '</p></div></div></div></section>';
    } else if (s.key === 'quiz') {
      body = '<section class="sec quizsec" id="' + m.id + '-quiz"><h2>Check yourself</h2><p>Answer each question to see the explanation. Wrong answers are explained too.</p><div id="quizbox">' + App.quizHtml(m) + '</div></section>';
    } else if (s.key === 'answers') {
      body = '<section class="sec anssec" id="' + m.id + '-answers"><h2>Worked answers</h2><p>Open an answer only after you have written your own.</p>' +
        m.tasks.map(function (t, k) { return '<details class="ans" id="' + m.id + '-ans-' + k + '"><summary>Task ' + (k + 1) + '. ' + t.title + '</summary><div>' + t.answer + '<p class="tolink"><a href="#" data-goto="' + m.id + '-task-' + k + '">Back to Task ' + (k + 1) + '</a></p></div></details>'; }).join('') + '</section>' +
        '<div class="callout key"><b>Finished?</b><p><button type="button" class="btn pri" id="markdone">' + (P.done[m.id] ? 'Marked complete (click to undo)' : 'Mark this module complete') + '</button></p></div>';
    } else if (s.key === 'notes') {
      var strip = function (x) { return x.replace(/<div data-widget="[^"]*"[^>]*><\/div>/g, '<p class="muted">The simulator for this part is in the cases.</p>').replace(/<ul class="try">[\s\S]*?<\/ul>/g, ''); };
      body = '<p class="flowhint">The full text of the module, for reference. You do not need it to complete the cases.</p>' + m.sections.map(function (x) { return '<section class="sec" id="' + m.id + '-' + x.id + '"><h2>' + x.title + '</h2>' + strip(x.html) + '</section>'; }).join('');
    }
    h += '<div class="step" id="' + m.id + '-st-' + s.key + '" data-si="' + i + '"' + (i ? ' hidden' : '') + '>' + body + nav(i) + '</div>';
  });
  h += '<div class="pager"><span>' + (prev ? '<a class="btn" href="#' + prev.id + '">← ' + prev.title + '</a>' : '') + '</span><span>' + (next ? '<a class="btn" href="#' + next.id + '">' + next.title + ' →</a>' : '') + '</span></div>';
  return { html: h, after: function (root) {
    App.wireQuiz(root.querySelector('#quizbox'), m);
    var key = 'pmc.step.' + m.id, cur = 0;
    var bar = root.querySelectorAll('.stp'), panes = root.querySelectorAll('.step');
    function show(i, scroll) {
      i = Math.max(0, Math.min(steps.length - 1, i)); cur = i;
      Array.prototype.forEach.call(panes, function (p, k) { p.hidden = k !== i; });
      Array.prototype.forEach.call(bar, function (b, k) { b.classList.toggle('on', k === i); if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      try { localStorage.setItem(key, String(i)); if (i > 0) localStorage.setItem('pmc.ess.' + m.id, '1'); } catch (e) {}
      marks && marks();
      if (scroll !== false) root.querySelector('.stepbar').scrollIntoView({ block: 'start' });
    }
    function marks() {
      steps.forEach(function (s, i) {
        var done = false;
        if (s.tasks) done = s.tasks.every(function (n) { var ta = root.querySelector('#' + m.id + '-task-' + n + ' textarea'), a = P.ans[m.id + '|t' + n]; return ta ? !!ta.value.trim() : !!(a && a.t && a.t.trim()); });
        else if (s.key === 'quiz') { var q = P.quiz[m.id] || []; done = m.quiz.every(function (_, k) { return q[k] !== undefined && q[k] !== null; }); }
        else if (s.key === 'ess') { try { done = localStorage.getItem('pmc.ess.' + m.id) === '1'; } catch (e) { done = cur > 0; } }
        bar[i].classList.toggle('done', done); bar[i].setAttribute('aria-label', s.label + (done ? ', done' : ''));
      });
    }
    root.addEventListener('click', function (e) {
      var st = e.target.closest('[data-step]');
      if (st) { e.preventDefault(); show(+st.getAttribute('data-step')); return; }
      var g = e.target.closest('[data-goto]'); if (!g) return;
      e.preventDefault();
      var el = document.getElementById(g.getAttribute('data-goto')); if (!el) return;
      var pane = el.closest('.step'); if (pane) show(+pane.getAttribute('data-si'), false);
      if (el.tagName === 'DETAILS') el.open = true;
      el.scrollIntoView({ block: 'start' });
    });
    root.addEventListener('input', function () { setTimeout(marks, 50); });
    root.addEventListener('click', function () { setTimeout(marks, 50); });
    var saved = 0; try { saved = +localStorage.getItem(key) || 0; } catch (e) {}
    show(saved, false); marks();
    var b = root.querySelector('#markdone'); b.onclick = function () { if (P.done[m.id]) delete P.done[m.id]; else P.done[m.id] = true; P.dt[m.id] = Date.now(); App.save(); App.markNav(); b.textContent = P.done[m.id] ? 'Marked complete (click to undo)' : 'Mark this module complete'; };
  } };
};

App.pageModule = function (m) {
  var all = App.mods_sorted(), idx = all.indexOf(m), prev = all[idx - 1], next = all[idx + 1];
  var lk = App.lockInfo(m); if (lk && !App.blocking) return { html: '<p class="eyebrow">' + m.part + '</p><h1>' + m.title + '</h1><div class="callout warn"><b>Not available yet</b><p>' + lk + ' Your instructor releases modules in sequence.</p></div><div class="pager"><span><a class="btn" href="#home">← Course home</a></span><span></span></div>' };
  if (m.format === 'cases') return App.pageCaseModule(m, prev, next);
  var h = '<p class="eyebrow">' + m.part + (m.num === 0 ? '' : ' · ' + (typeof m.num === 'number' ? 'Module ' + m.num : m.num)) + '</p><h1>' + m.title + '</h1><p class="lede">' + m.summary + '</p>' +
    '<div class="meta"><span><b>Source</b> ' + m.book + '</span><span><b>Study time</b> about ' + m.minutes + ' minutes</span></div>' +
    (m.format === 'cases' ? '<div class="goals"><b>After this module you can</b><ul>' + m.objectives.map(function (o) { return '<li>' + o + '</li>'; }).join('') + '</ul></div>'
      : '<div class="callout key"><b>After this module you can</b><ul>' + m.objectives.map(function (o) { return '<li>' + o + '</li>'; }).join('') + '</ul></div>');
  var taskHtml = function (t, i) { return '<div class="task" data-ti="' + i + '" id="' + m.id + '-task-' + i + '"><h3>Task ' + (i + 1) + '. ' + t.title + ' <span class="lvl">' + t.level + '</span></h3>' + t.scenario + t.questions.map(function (q) { return '<p>' + q + '</p>'; }).join('') +
    (m.format === 'cases' ? '<p class="tolink"><a href="#" data-goto="' + m.id + '-ans-' + i + '">Check your answer</a> (worked answers are at the end of the page)</p>' : '') + '</div>'; };
  if (m.format === 'cases') {
    /* case-led layout. Colour code: learn (essentials, what you need), practise (tasks), check (quiz), answers. */
    var ncase = m.cases.length, ntask = m.tasks.length, cmin = m.cases.reduce(function (a, c) { return a + (c.minutes || 10); }, 0);
    h += '<div class="flow" role="navigation" aria-label="How to work through this module">' +
      '<button type="button" class="fl learn" data-goto="' + m.id + '-ess"><b>The essentials</b><span>5 min</span></button>' +
      '<button type="button" class="fl practise" data-goto="' + m.id + '-cases"><b>' + ncase + ' cases, ' + ntask + ' tasks</b><span>about ' + cmin + ' min</span></button>' +
      '<button type="button" class="fl check" data-goto="' + m.id + '-quiz"><b>Check yourself</b><span>' + m.quiz.length + ' questions</span></button>' +
      '<button type="button" class="fl answers" data-goto="' + m.id + '-answers"><b>Worked answers</b><span>compare yours</span></button></div>' +
      '<p class="flowhint">Read the essentials, then work through the cases in order. In each case, read what you need, then the situation, try the simulator, and write your answer to each task in its box before checking the worked answer.</p>';
    h += '<section class="sec essentials" id="' + m.id + '-ess"><h2>The essentials</h2>' + m.essentials + '</section>';
    if (m.story) h += '<div class="story" id="' + m.id + '-cases"><b>The story in this module</b><p>' + m.story + '</p></div>';
    m.cases.forEach(function (c, k) {
      h += '<section class="sec case" id="' + m.id + '-' + c.id + '"><details class="ccard"' + (k === 0 ? ' open' : '') + '><summary>' +
        '<span class="cnum">Case ' + (k + 1) + ' of ' + ncase + '</span><span class="ctitle">' + c.title + '</span>' +
        '<span class="caim">In this case you will ' + c.aim + '</span><span class="cfoot">' + c.tasks.length + ' tasks · about ' + (c.minutes || 10) + ' min</span></summary><div class="cbody">' +
        '<div class="need"><b>What you need</b>' + c.need + '</div>' +
        '<div class="situation"><b>The situation</b>' + c.scenario + '</div>' + (c.widgets || '') +
        '<div class="turn"><b class="turnh">Your turn</b>' + c.tasks.map(function (n) { return taskHtml(m.tasks[n], n); }).join('') + '</div>' +
        '<div class="takeaway"><b>Take-away</b><p>' + c.takeaway + '</p></div>' +
        (k < ncase - 1 ? '<p class="nextc"><button type="button" class="btn" data-next="' + m.id + '-' + m.cases[k + 1].id + '">Next: Case ' + (k + 2) + '. ' + m.cases[k + 1].title + '</button></p>' : '') +
        '</div></details></section>';
    });
    h += '<section class="sec quizsec" id="' + m.id + '-quiz"><h2>Check yourself</h2><p>Answer each question to see the explanation. Wrong answers are explained too.</p><div id="quizbox">' + App.quizHtml(m) + '</div></section>';
  } else {
  m.sections.forEach(function (s) { h += '<section class="sec" id="' + m.id + '-' + s.id + '"><h2>' + s.title + '</h2>' + s.html + '</section>'; });
  h += '<section class="sec"><h2>Key points</h2><ul class="kp">' + m.keyPoints.map(function (k) { return '<li>' + k + '</li>'; }).join('') + '</ul></section>';
  h += '<section class="sec"><h2>Check your understanding</h2><p>Answer each question to see the explanation. Wrong answers are explained too.</p><div id="quizbox">' + App.quizHtml(m) + '</div></section>';
  h += '<section class="sec"><h2>Case tasks</h2><p>Attempt each task before opening the worked answers at the end of this page.</p>';
  m.tasks.forEach(function (t, i) { h += taskHtml(t, i); });
  h += '</section>';
  }
  h += '<section class="sec' + (m.format === 'cases' ? ' anssec" id="' + m.id + '-answers' : '') + '"><h2>Worked answers</h2>' + (m.format === 'cases' ? '<p>Open an answer only after you have written your own.</p>' : '');
  m.tasks.forEach(function (t, i) { h += '<details class="ans" id="' + m.id + '-ans-' + i + '"><summary>Task ' + (i + 1) + '. ' + t.title + '</summary><div>' + t.answer + (m.format === 'cases' ? '<p class="tolink"><a href="#" data-goto="' + m.id + '-task-' + i + '">Back to Task ' + (i + 1) + '</a></p>' : '') + '</div></details>'; });
  h += '</section>';
  if (m.format === 'cases' && m.sections && m.sections.length) {
    var strip = function (x) { return x.replace(/<div data-widget="[^"]*"[^>]*><\/div>/g, '<p class="muted">The simulator for this part is in the cases above.</p>').replace(/<ul class="try">[\s\S]*?<\/ul>/g, ''); };
    h += '<details class="fullnotes"><summary>Full notes for this module (optional reading)</summary>';
    m.sections.forEach(function (s) { h += '<section class="sec" id="' + m.id + '-' + s.id + '"><h2>' + s.title + '</h2>' + strip(s.html) + '</section>'; });
    h += '</details>';
  }
  h += '<div class="callout key"><b>Finished?</b><p><button type="button" class="btn pri" id="markdone">' + (App.prog.done[m.id] ? 'Marked complete (click to undo)' : 'Mark this module complete') + '</button></p></div>';
  h += '<div class="pager"><span>' + (prev ? '<a class="btn" href="#' + prev.id + '">← ' + prev.title + '</a>' : '') + '</span><span>' + (next ? '<a class="btn" href="#' + next.id + '">' + next.title + ' →</a>' : '') + '</span></div>';
  return { html: h, after: function (root) {
    App.wireQuiz(root.querySelector('#quizbox'), m);
    root.addEventListener('click', function (e) {
      var g = e.target.closest('[data-goto],[data-next]'); if (!g) return;
      e.preventDefault();
      var el = document.getElementById(g.getAttribute('data-goto') || g.getAttribute('data-next')); if (!el) return;
      var d = el.tagName === 'DETAILS' ? el : el.querySelector('details.ccard') || el.closest('details');
      if (d) d.open = true; var host = el.closest('details.ccard'); if (host) host.open = true;
      if (g.hasAttribute('data-next')) { var cur = g.closest('details.ccard'); if (cur) cur.open = false; }
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    var b = root.querySelector('#markdone'); b.onclick = function () { if (App.prog.done[m.id]) delete App.prog.done[m.id]; else App.prog.done[m.id] = true; App.prog.dt[m.id] = Date.now(); App.save(); App.markNav(); b.textContent = App.prog.done[m.id] ? 'Marked complete (click to undo)' : 'Mark this module complete'; };
  } };
};

/* ===== mastery check ===== */
App.mastery = null;
App.pageMastery = function () {
  var total = 0; App.mods_sorted().forEach(function (m) { if (!App.lockInfo(m)) total += m.quiz.length; });
  var h = '<p class="eyebrow">Self-test</p><h1>Mastery check</h1><p class="lede">A mixed set of questions drawn at random from every module, with explanations after each answer. The summary at the end lists the modules to revisit.</p>';
  h += '<div class="callout key"><b>Choose a length</b><p>' + [10, 20, 40].map(function (n) { return '<button type="button" class="btn" data-n="' + n + '">' + n + ' questions</button> '; }).join('') + '</p><p>' + total + ' questions are in the pool.</p></div><div id="mbody"></div>';
  return { html: h, after: function (root) {
    var body = root.querySelector('#mbody');
    function start(n) {
      var pool = []; App.mods_sorted().forEach(function (m) { if (App.lockInfo(m)) return; m.quiz.forEach(function (q, i) { pool.push({ m: m, q: q }); }); });
      for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      App.mastery = { items: pool.slice(0, n), i: 0, ans: [] }; show();
    }
    function show() {
      var S = App.mastery; if (!S) return;
      if (S.i >= S.items.length) {
        var c = 0, byMod = {}; S.items.forEach(function (it, k) { var ok = S.ans[k] === it.q.answer; if (ok) c++; byMod[it.m.id] = byMod[it.m.id] || { t: 0, ok: 0, m: it.m }; byMod[it.m.id].t++; if (ok) byMod[it.m.id].ok++; });
        var rows = Object.keys(byMod).map(function (k) { var o = byMod[k]; return [o.m.title, o.ok + ' of ' + o.t, o.ok === o.t ? 'Secure' : '<a href="#' + o.m.id + '">Revisit</a>']; });
        App.prog.mc.push({ at: Date.now(), n: S.items.length, c: c }); App.prog.mc = App.prog.mc.slice(-50); App.save();
        body.innerHTML = '<h3>Result: ' + c + ' of ' + S.items.length + ' (' + Math.round(100 * c / S.items.length) + '%)</h3>' + K.tbl(['Module', 'Correct', 'Next step'], rows) + '<p><button type="button" class="btn pri" id="again">Start again</button></p>';
        body.querySelector('#again').onclick = function () { App.mastery = null; body.innerHTML = ''; };
        return;
      }
      var it = S.items[S.i], q = it.q;
      body.innerHTML = '<p class="num" style="color:var(--muted)">Question ' + (S.i + 1) + ' of ' + S.items.length + ' · ' + it.m.title + '</p><div class="q"><div class="qt">' + q.q + '</div>' + q.options.map(function (o, j) { return '<button type="button" class="opt" data-j="' + j + '"><span class="k">' + 'ABCD'[j] + '</span><span>' + o + '</span></button>'; }).join('') + '<div id="mfb"></div></div>';
      var qd = body.querySelector('.q'), answered = false;
      qd.addEventListener('click', function (ev) {
        var b = ev.target.closest('.opt'); if (!b || answered) return; answered = true; var j = +b.getAttribute('data-j'); S.ans[S.i] = j;
        Array.prototype.forEach.call(qd.querySelectorAll('.opt'), function (o, k) { if (k === q.answer) o.classList.add('right'); else if (k === j) o.classList.add('wrong'); });
        qd.querySelector('#mfb').innerHTML = '<div class="why"><b>' + (j === q.answer ? 'Correct. ' : 'Not quite. ') + '</b>' + q.why + '</div><p style="margin-top:10px"><button type="button" class="btn pri" id="nx">' + (S.i + 1 === S.items.length ? 'See result' : 'Next question') + '</button></p>';
        qd.querySelector('#nx').onclick = function () { S.i++; show(); };
      });
    }
    Array.prototype.forEach.call(root.querySelectorAll('[data-n]'), function (b) { b.onclick = function () { start(+b.getAttribute('data-n')); }; });
    if (App.mastery) show();
  } };
};

/* ===== router ===== */
App.cur = 'home';
App.route = function (keepScroll) {
  var id = (location.hash || '#home').slice(1) || 'home', page;
  if (id === 'home') page = App.pageHome(); else if (id === 'about') page = App.pageAbout(); else if (id === 'howto') page = App.pageHowto(); else if (id === 'datasets') page = App.pageDatasets(); else if (id === 'mastery') page = App.pageMastery(); else if (id === 'account') page = App.pageAccount(); else if (id === 'notes') page = App.pageNotes(); else if (id === 'dashboard' && App.acct.isInstructor()) page = App.pageDashboard();
  else if (App.byId[id]) page = App.pageModule(App.byId[id]); else if (App.refs[id]) page = App.pageRef(id); else { id = 'home'; page = App.pageHome(); }
  App.cur = id;
  var root = document.getElementById('page');
  root.innerHTML = '<div class="col">' + page.html + '<div class="foot">All data in this course are synthetic. Methods follow Steyerberg, Clinical Prediction Models (2009), chapters 1 to 19. For teaching; not for clinical use.</div></div>';
  App.clearEdbar(); if (App.byId[id] && !App.lockInfo(App.byId[id])) App.decorate(root, App.byId[id]);
  Array.prototype.forEach.call(root.querySelectorAll('[data-widget]'), K.mount);
  App.fillLive(); if (page.after) page.after(root);
  App.markNav(); App.askBtn();
  document.getElementById('rail').classList.remove('open');
  if (!keepScroll) window.scrollTo(0, 0);
};
App.afterAccount = function () { App.buildNav(); App.route(true); };
/* ===== light / dark theme toggle (remembered in this browser; default follows the device) ===== */
App.theme = {
  stored: function () { try { var t = localStorage.getItem('pmc.theme'); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; } },
  current: function () { return document.documentElement.getAttribute('data-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); },
  apply: function (t) { if (t) document.documentElement.setAttribute('data-theme', t); App.theme.label(); },
  label: function () { var next = App.theme.current() === 'dark' ? 'light' : 'dark';
    Array.prototype.forEach.call(document.querySelectorAll('.themebtn'), function (b) { b.textContent = next === 'dark' ? 'Dark theme' : 'Light theme'; b.setAttribute('aria-label', 'Switch to ' + next + ' theme'); b.setAttribute('aria-pressed', String(next === 'light')); }); },
  toggle: function () { var t = App.theme.current() === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('pmc.theme', t); } catch (e) {} App.theme.apply(t); }
};
App.init = function () {
  App.theme.apply(App.theme.stored());
  document.addEventListener('click', function (e) { if (e.target.closest('.themebtn')) App.theme.toggle(); });
  App.load(); App.buildNav();
  document.getElementById('menu').addEventListener('click', function () { document.getElementById('rail').classList.toggle('open'); });
  window.addEventListener('hashchange', function () { App.route(); });
  var first = false; function go() { if (first) return; first = true; App.buildNav(); App.route(); }
  setTimeout(go, 1400);
  Promise.all([App.acct.init(), App.loadRemote()]).then(function () { if (!first) go(); else { App.buildNav(); App.route(true); } }, go);
  setTimeout(App.computeLive, 60);
};
