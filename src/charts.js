/* Minimal SVG chart helper. Colours come from CSS variables so both themes work. */
var Chart = {};
Chart.NS = 'http://www.w3.org/2000/svg';
Chart.nice = function (lo, hi, n) {
  n = n || 5; var span = hi - lo; if (span <= 0) { span = Math.abs(hi) || 1; lo -= span / 2; hi += span / 2; }
  var raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
  var step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  var a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, t = [];
  for (var v = a; v <= b + step / 2; v += step) t.push(Math.round(v / step) * step);
  return { lo: a, hi: b, ticks: t, step: step };
};
Chart.fmtTick = function (v, step) { var d = step >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(step))); return v.toFixed(d); };
/* roles of the course's visual code: obs = observed (solid), pred = model prediction (dashed), err = error (red) */
Chart.color = function (c) { return { a: 'var(--c1)', b: 'var(--c2)', c: 'var(--c3)', d: 'var(--c4)', ink: 'var(--ink)', muted: 'var(--muted)', obs: 'var(--obs)', pred: 'var(--pred)', err: 'var(--err)' }[c] || c || 'var(--c1)'; };
/* spec: {w,h,xlim:[lo,hi],ylim:[lo,hi],xlabel,ylabel,xticks,yticks,xfmt,yfmt,layers:[...],legend:[{label,color,dash}],title} */
Chart.plot = function (spec) {
  var W = spec.w || 560, H = spec.h || 340, m = { l: 52, r: 14, t: spec.title ? 26 : 12, b: 44 };
  var xl = spec.xlim, yl = spec.ylim;
  var xt = spec.xticks || Chart.nice(xl[0], xl[1], 6).ticks.filter(function (t) { return t >= xl[0] - 1e-9 && t <= xl[1] + 1e-9; });
  var yt = spec.yticks || Chart.nice(yl[0], yl[1], 5).ticks.filter(function (t) { return t >= yl[0] - 1e-9 && t <= yl[1] + 1e-9; });
  function X(v) { return m.l + (v - xl[0]) / (xl[1] - xl[0]) * (W - m.l - m.r); }
  function Y(v) { return H - m.b - (v - yl[0]) / (yl[1] - yl[0]) * (H - m.t - m.b); }
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + (spec.title || spec.ylabel || 'chart') + '" xmlns="' + Chart.NS + '" style="width:100%;height:auto;max-width:' + W + 'px;display:block">';
  s += '<rect x="' + m.l + '" y="' + m.t + '" width="' + (W - m.l - m.r) + '" height="' + (H - m.t - m.b) + '" fill="var(--plot)" />';
  yt.forEach(function (t) { s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" stroke="var(--line)" stroke-width="1"/>'; s += '<text x="' + (m.l - 7) + '" y="' + (Y(t) + 4) + '" text-anchor="end" class="ax">' + (spec.yfmt ? spec.yfmt(t) : Chart.fmtTick(t, yt.length > 1 ? Math.abs(yt[1] - yt[0]) : 1)) + '</text>'; });
  xt.forEach(function (t) { s += '<line x1="' + X(t) + '" x2="' + X(t) + '" y1="' + (H - m.b) + '" y2="' + (H - m.b + 4) + '" stroke="var(--muted)"/>'; s += '<text x="' + X(t) + '" y="' + (H - m.b + 17) + '" text-anchor="middle" class="ax">' + (spec.xfmt ? spec.xfmt(t) : Chart.fmtTick(t, xt.length > 1 ? Math.abs(xt[1] - xt[0]) : 1)) + '</text>'; });
  s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (H - m.b) + '" y2="' + (H - m.b) + '" stroke="var(--muted)"/><line x1="' + m.l + '" x2="' + m.l + '" y1="' + m.t + '" y2="' + (H - m.b) + '" stroke="var(--muted)"/>';
  (spec.layers || []).forEach(function (L) {
    var col = Chart.color(L.color), sw = L.width || 2, dash = L.dash ? ' stroke-dasharray="' + L.dash + '"' : '';
    if (L.type === 'line' && L.pts.length > 1) {
      var d = L.pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); }).join(' ');
      if (L.step) d = L.pts.map(function (p, i) { return (i ? 'L' + X(p.x).toFixed(1) + ' ' + Y(L.pts[i - 1].y).toFixed(1) + ' L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); }).join(' ');
      s += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '"' + dash + ' stroke-linejoin="round"/>';
    } else if (L.type === 'area' && L.pts.length > 1) {
      var d2 = L.pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); }).join(' ') + ' L' + X(L.pts[L.pts.length - 1].x).toFixed(1) + ' ' + Y(0) + ' L' + X(L.pts[0].x).toFixed(1) + ' ' + Y(0) + ' Z';
      s += '<path d="' + d2 + '" fill="' + col + '" fill-opacity="' + (L.opacity || 0.18) + '" stroke="none"/>';
    } else if (L.type === 'points') {
      L.pts.forEach(function (p) { s += '<circle cx="' + X(p.x).toFixed(1) + '" cy="' + Y(p.y).toFixed(1) + '" r="' + (L.r || 3.2) + '" fill="' + (L.hollow ? 'var(--surface)' : col) + '" stroke="' + col + '" stroke-width="' + (L.hollow ? 1.6 : 0) + '" fill-opacity="' + (L.alpha || 1) + '"/>'; });
    } else if (L.type === 'bars') {
      var bw = L.bw || ((W - m.l - m.r) / L.pts.length * 0.7);
      L.pts.forEach(function (p) { var y0 = Math.max(yl[0], 0), x0 = X(p.x) - bw / 2, y1 = Y(p.y), yb = Y(y0); s += '<rect x="' + x0.toFixed(1) + '" y="' + Math.min(y1, yb).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.abs(yb - y1).toFixed(1) + '" fill="' + col + '" fill-opacity="' + (L.opacity || 0.85) + '"/>'; });
    } else if (L.type === 'hline') {
      s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(L.y) + '" y2="' + Y(L.y) + '" stroke="' + col + '" stroke-width="' + (L.width || 1.3) + '"' + (L.dash ? dash : ' stroke-dasharray="4 3"') + '/>';
    } else if (L.type === 'vline') {
      s += '<line x1="' + X(L.x) + '" x2="' + X(L.x) + '" y1="' + m.t + '" y2="' + (H - m.b) + '" stroke="' + col + '" stroke-width="' + (L.width || 1.3) + '"' + (L.dash ? dash : ' stroke-dasharray="4 3"') + '/>';
    } else if (L.type === 'diag') {
      s += '<line x1="' + X(xl[0]) + '" y1="' + Y(yl[0]) + '" x2="' + X(xl[1]) + '" y2="' + Y(yl[1]) + '" stroke="' + col + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
    } else if (L.type === 'text') {
      s += '<text x="' + X(L.x) + '" y="' + Y(L.y) + '" text-anchor="' + (L.anchor || 'start') + '" class="ax" style="fill:' + col + '">' + L.text + '</text>';
    } else if (L.type === 'errbars') {
      L.pts.forEach(function (p) { s += '<line x1="' + X(p.x) + '" x2="' + X(p.x) + '" y1="' + Y(p.lo) + '" y2="' + Y(p.hi) + '" stroke="' + col + '" stroke-width="1.4"/>'; });
    } else if (L.type === 'rug') { // small ticks on bottom edge; pts of x values with class
      L.pts.forEach(function (v) { s += '<line x1="' + X(v) + '" x2="' + X(v) + '" y1="' + (H - m.b) + '" y2="' + (H - m.b - (L.len || 6)) + '" stroke="' + col + '" stroke-opacity="0.5"/>'; });
    }
  });
  if (spec.xlabel) s += '<text x="' + ((m.l + W - m.r) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" class="axl">' + spec.xlabel + '</text>';
  if (spec.ylabel) s += '<text transform="translate(13 ' + ((m.t + H - m.b) / 2) + ') rotate(-90)" text-anchor="middle" class="axl">' + spec.ylabel + '</text>';
  if (spec.title) s += '<text x="' + m.l + '" y="16" class="axt">' + spec.title + '</text>';
  if (spec.legend) { var lx = m.l + 8, ly = m.t + 14; spec.legend.forEach(function (g, i) { var yy = ly + i * 16; s += '<line x1="' + lx + '" x2="' + (lx + 18) + '" y1="' + (yy - 4) + '" y2="' + (yy - 4) + '" stroke="' + Chart.color(g.color) + '" stroke-width="2.4"' + (g.dash ? ' stroke-dasharray="' + g.dash + '"' : '') + '/><text x="' + (lx + 24) + '" y="' + yy + '" class="ax" style="fill:var(--ink)">' + g.label + '</text>'; }); }
  s += '</svg>';
  return s;
};
/* histogram bin helper */
Chart.hist = function (vals, lo, hi, nb) { var bins = new Array(nb).fill(0), w = (hi - lo) / nb; vals.forEach(function (v) { var k = Math.min(nb - 1, Math.max(0, Math.floor((v - lo) / w))); bins[k]++; }); return bins.map(function (c, i) { return { x: lo + (i + 0.5) * w, y: c, w: w }; }); };
/* horizontal bar list (HTML) for frequencies */
Chart.hbars = function (items, max, fmt) {
  var s = '<div class="hbars">';
  items.forEach(function (it) { var w = Math.max(0, Math.min(100, it.v / max * 100)); s += '<div class="hb"><span class="hbl">' + it.label + '</span><span class="hbt"><i style="width:' + w.toFixed(1) + '%"></i></span><span class="hbv">' + (fmt ? fmt(it.v) : it.v) + '</span></div>'; });
  return s + '</div>';
};
