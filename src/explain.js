/* ===== Narrated explainers, tap definitions, Try / Notice panels, Go deeper reading ===== */

/* ---------- narrated explainer ----------
   Module field:  explainers: [{ id, title, scenes: [{ svg: '<svg viewBox="0 0 560 300">...</svg>', say: 'narration', dur: seconds (optional) }] }]
   Placement:     <div data-explainer="id"></div> anywhere in essentials, a case's need or scenario.
   The player is rendered as static HTML (so instructors can edit the narration in edit mode); App.wireExplainers adds behaviour. */
App.exDur = function (s) { var w = String(s.say || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length; return s.dur || Math.max(4, Math.round(w / 2.4 + 1.5)); };
App.fmtT = function (t) { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); };
App.explainerHtml = function (m, id) {
  var ex = (m.explainers || []).filter(function (e) { return e.id === id; })[0];
  if (!ex) return '';
  var total = ex.scenes.reduce(function (a, s) { return a + App.exDur(s); }, 0);
  return '<div class="exp" data-exp="' + m.id + ':' + ex.id + '" tabindex="0" role="group" aria-label="Narrated explainer: ' + K.esc(ex.title) + '">' +
    '<div class="exh"><span class="exk">Narrated explainer</span><b>' + ex.title + '</b><span class="exlen">' + App.fmtT(total) + '</span></div>' +
    '<div class="exstage" aria-hidden="true"></div>' +
    '<p class="excap" aria-live="polite"></p>' +
    '<div class="exctl">' +
    '<button type="button" class="btn pri sm" data-x="play">Play with narration</button>' +
    '<button type="button" class="btn sm" data-x="prev" aria-label="Previous scene">‹</button><button type="button" class="btn sm" data-x="next" aria-label="Next scene">›</button>' +
    '<input type="range" min="0" max="' + total + '" step="0.1" value="0" aria-label="Position in the explainer">' +
    '<span class="ext">0:00 / ' + App.fmtT(total) + '</span>' +
    '<select aria-label="Speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select>' +
    '<button type="button" class="btn sm" data-x="mute" aria-pressed="false">Sound on</button>' +
    '<span class="exs">Scene 1 / ' + ex.scenes.length + '</span></div>' +
    '<details class="extr"><summary>Transcript · ' + ex.scenes.length + ' scenes</summary><ol class="ex-tr">' +
    ex.scenes.map(function (s) { return '<li>' + s.say + '</li>'; }).join('') + '</ol>' +
    '<p class="exkeys">Space plays or pauses; the left and right arrow keys skip 5 seconds; M turns the narration on or off. Narration is recorded with a Google Chirp voice; if the wording of a scene has been edited since, the voice of your device reads it instead.</p></details></div>';
};
App.fillExplainers = function (html, m) {
  if (!m.explainers || !m.explainers.length) return html;
  return html.replace(/<div data-explainer="([\w-]+)"><\/div>/g, function (a, id) { return App.explainerHtml(m, id); });
};
/* djb2 hash of the narration text with whitespace collapsed; build.js uses the same rule for the recorded clips */
App.narrHash = function (t) { t = String(t).replace(/\s+/g, ' ').trim(); var h = 5381; for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
App.NARR = App.NARR || {};
App.voice = null;
App.pickVoice = function () {
  if (!window.speechSynthesis) return null;
  var vs = speechSynthesis.getVoices(); if (!vs.length) return null;
  var pref = function (re) { return vs.filter(function (v) { return re.test(v.lang) ; }); };
  var gb = pref(/^en[-_]GB/i), inn = pref(/^en[-_]IN/i), en = pref(/^en/i);
  var good = function (list) { return list.filter(function (v) { return /natural|neural|premium|enhanced|google|daniel|serena|kate|sonia|libby|martha|arthur/i.test(v.name); })[0] || list[0]; };
  return good(gb) || good(inn) || good(en) || vs[0];
};
if (window.speechSynthesis) { try { speechSynthesis.onvoiceschanged = function () { App.voice = App.pickVoice(); }; } catch (e) { } }
App.wireExplainers = function (root, m) {
  Array.prototype.forEach.call(root.querySelectorAll('.exp'), function (el) {
    var id = el.getAttribute('data-exp').split(':')[1], ex = (m.explainers || []).filter(function (e) { return e.id === id; })[0]; if (!ex) return;
    var stage = el.querySelector('.exstage'), cap = el.querySelector('.excap'), rng = el.querySelector('input[type=range]'), tm = el.querySelector('.ext'), sc = el.querySelector('.exs'),
      spd = el.querySelector('select'), bPlay = el.querySelector('[data-x=play]'), bMute = el.querySelector('[data-x=mute]'), items = el.querySelectorAll('.ex-tr li');
    var txt0 = function (i) { return items[i] ? items[i].textContent.replace(/\s+/g, ' ').trim() : ''; };
    var durs = ex.scenes.map(function (sc, i) { var n = App.NARR && App.NARR[m.id + ':' + ex.id + ':' + i]; return (n && n.d && App.narrHash(txt0(i)) === n.h) ? Math.ceil(n.d + 0.8) : App.exDur(sc); }), starts = [], acc = 0; durs.forEach(function (d) { starts.push(acc); acc += d; }); var total = acc;
    rng.max = total; el.querySelector('.exlen').textContent = App.fmtT(total);
    var S = { t: 0, i: -1, playing: false, last: 0, sound: true, speaking: false, raf: 0, utt: null };
    try { S.sound = localStorage.getItem('pmc.exsound') !== '0'; } catch (e) { }
    var canSpeak = !!window.speechSynthesis;
    function sayText(i) { return items[i] ? items[i].textContent.replace(/\s+/g, ' ').trim() : String(ex.scenes[i].say).replace(/<[^>]+>/g, ''); }
    function capHtml(i) { return items[i] ? items[i].innerHTML : ex.scenes[i].say; }
    function stopSpeech() { if (audio) { try { audio.pause(); } catch (e) { } } if (canSpeak && S.speaking) { try { speechSynthesis.cancel(); } catch (e) { } } S.speaking = false; S.utt = null; }
    /* recorded narration (Google Chirp voice), used when its text still matches the scene's narration */
    var audio = null;
    function clip(i) { var n = App.NARR && App.NARR[m.id + ':' + ex.id + ':' + i]; if (!n) return null; return App.narrHash(sayText(i)) === n.h ? n.f : null; }
    function speak(i) {
      stopSpeech(); if (!S.sound || !S.playing) return;
      var f = clip(i);
      if (f) {
        audio = audio || new Audio(); audio.src = f; audio.playbackRate = parseFloat(spd.value); audio.preservesPitch = true;
        S.speaking = true; var me = audio.src;
        audio.onended = audio.onerror = function () { if (audio && audio.src === me) S.speaking = false; };
        var pr = audio.play(); if (pr && pr.catch) pr.catch(function () { S.speaking = false; });
        return;
      }
      if (!canSpeak) return;
      var u = new SpeechSynthesisUtterance(sayText(i)); App.voice = App.voice || App.pickVoice(); if (App.voice) { u.voice = App.voice; u.lang = App.voice.lang; } else u.lang = 'en-GB';
      u.rate = Math.min(1.6, 0.98 * parseFloat(spd.value)); S.speaking = true; S.utt = u;
      u.onend = u.onerror = function () { if (S.utt === u) { S.speaking = false; S.utt = null; } };
      try { speechSynthesis.speak(u); } catch (e) { S.speaking = false; }
    }
    function showScene(i, fromStart) {
      if (i === S.i && !fromStart) return; S.i = i;
      stage.innerHTML = ex.scenes[i].svg || ''; stage.style.setProperty('--spd', spd.value);
      cap.innerHTML = capHtml(i); sc.textContent = 'Scene ' + (i + 1) + ' / ' + ex.scenes.length;
      Array.prototype.forEach.call(items, function (li, k) { li.classList.toggle('on', k === i); });
      if (S.playing) speak(i);
    }
    function sceneAt(t) { for (var k = starts.length - 1; k >= 0; k--) if (t >= starts[k] - 1e-6) return k; return 0; }
    function ui() { rng.value = S.t.toFixed(1); tm.textContent = App.fmtT(S.t) + ' / ' + App.fmtT(total); bPlay.textContent = S.playing ? 'Pause' : (S.t > 0 && S.t < total ? 'Resume' : (S.t >= total ? 'Play again' : 'Play with narration')); el.classList.toggle('paused', !S.playing); }
    function tick(now) {
      if (!S.playing) return; var dt = Math.min(0.25, (now - S.last) / 1000); S.last = now;
      var end = starts[S.i] + durs[S.i];
      if (S.t + dt * parseFloat(spd.value) >= end && S.speaking) { S.t = end - 0.01; } /* wait for the narration to finish the scene */
      else S.t += dt * parseFloat(spd.value);
      if (S.t >= total) { S.t = total; S.playing = false; stopSpeech(); ui(); return; }
      var k = sceneAt(S.t); if (k !== S.i) showScene(k);
      ui(); S.raf = requestAnimationFrame(tick);
    }
    function play() { if (S.t >= total) { S.t = 0; S.i = -1; } S.playing = true; S.last = performance.now(); var k = sceneAt(S.t); if (k !== S.i) showScene(k); else speak(k); ui(); S.raf = requestAnimationFrame(tick); }
    function pause() { S.playing = false; cancelAnimationFrame(S.raf); stopSpeech(); ui(); }
    function seek(t) { var was = S.playing; pause(); S.t = Math.max(0, Math.min(total - 0.01, t)); var k = sceneAt(S.t); S.t = Math.max(S.t, starts[k]); showScene(k, true); ui(); if (was) play(); }
    bPlay.onclick = function () { S.playing ? pause() : play(); };
    el.querySelector('[data-x=prev]').onclick = function () { seek(starts[Math.max(0, S.i - 1)]); };
    el.querySelector('[data-x=next]').onclick = function () { if (S.i + 1 < starts.length) seek(starts[S.i + 1]); };
    rng.oninput = function () { seek(parseFloat(rng.value)); };
    spd.onchange = function () { stage.style.setProperty('--spd', spd.value); if (audio && S.speaking) audio.playbackRate = parseFloat(spd.value); else if (S.playing) speak(S.i); };
    function muteUi() { bMute.textContent = S.sound ? 'Sound on' : 'Sound off'; bMute.setAttribute('aria-pressed', String(!S.sound)); bMute.hidden = !canSpeak && !clip(0); }
    bMute.onclick = function () { S.sound = !S.sound; try { localStorage.setItem('pmc.exsound', S.sound ? '1' : '0'); } catch (e) { } if (!S.sound) stopSpeech(); else if (S.playing) speak(S.i); muteUi(); };
    el.addEventListener('keydown', function (e) {
      if (e.target.closest('select,input,summary,a,button,[contenteditable=true]') && e.target !== el) { if (!(e.target.type === 'range' && (e.key === ' '))) return; }
      if (e.key === ' ') { e.preventDefault(); S.playing ? pause() : play(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); seek(S.t + 5); } else if (e.key === 'ArrowLeft') { e.preventDefault(); seek(S.t - 5); }
      else if (e.key === 'm' || e.key === 'M') { bMute.click(); }
    });
    /* stop narration when the explainer is hidden (another step) or the page changes */
    el.__stop = pause;
    muteUi(); showScene(0, true); ui();
  });
};
App.stopExplainers = function () { Array.prototype.forEach.call(document.querySelectorAll('.exp'), function (el) { if (el.__stop) el.__stop(); }); if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { } };

/* ---------- tap definitions ----------
   Terms come from the glossary (first sentence) and from module.defs {term: plain definition}, which take priority.
   The first use of a term in each step of a module gets a dotted underline; tapping it shows the definition.
   Authors may also write <dfn data-def="...">term</dfn> directly. */
App.defs = null;
App.buildDefs = function () {
  var d = {}, g = App.refs.glossary;
  if (g) g.html.replace(/<p><b>([^<]+?)\.<\/b>\s*([\s\S]*?)<\/p>/g, function (a, term, def) {
    var t = term.replace(/\s*\([^)]*\)\s*/g, ' ').trim(); var first = def.replace(/<[^>]+>/g, '').split(/(?<=\.)\s/)[0];
    if (t.length > 2) d[t.toLowerCase()] = { term: t, def: first };
  });
  App.defs = d; return d;
};
App.linkDefs = function (root, m) {
  var base = App.defs || App.buildDefs(), map = {}, k;
  for (k in base) map[k] = base[k];
  if (m && m.defs) for (k in m.defs) map[k.toLowerCase()] = { term: k, def: m.defs[k] };
  var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; }); if (!keys.length) return;
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  var re = new RegExp('\\b(' + keys.map(esc).join('|') + ')(s|es)?\\b', 'i');
  var scopes = root.querySelectorAll('.step'); if (!scopes.length) scopes = [root];
  Array.prototype.forEach.call(scopes, function (scope) {
    var used = {};
    Array.prototype.forEach.call(scope.querySelectorAll('dfn[data-def]'), function (x) { used[x.textContent.toLowerCase()] = 1; });
    var w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentNode; if (!p || !p.closest) return NodeFilter.FILTER_REJECT;
      if (p.closest('h1,h2,h3,h4,summary,a,button,dfn,code,.formula,[data-widget],.wg,.q,.exp,.myans,.note-card,.stepbar,.stepnav,.meta,.goals,.eyebrow,.chead,table,label,.ans,.anssec,mark')) return NodeFilter.FILTER_REJECT;
      if (!p.closest('p,li')) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
    var nodes = [], n; while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var txt = node.nodeValue, mm = re.exec(txt); if (!mm) return;
      var key = mm[1].toLowerCase(); if (used[key]) { /* look for another term later in the same node */
        var rest = txt, off = 0, found = null;
        while ((mm = re.exec(rest))) { var kk = mm[1].toLowerCase(); if (!used[kk]) { found = { m: mm, off: off }; break; } off += mm.index + mm[0].length; rest = rest.slice(mm.index + mm[0].length); }
        if (!found) return; mm = found.m; mm.index += found.off; key = mm[1].toLowerCase();
      }
      used[key] = 1;
      var after = node.splitText(mm.index); after.splitText(mm[0].length);
      var dfn = document.createElement('dfn'); dfn.setAttribute('data-def', map[key].def); dfn.setAttribute('tabindex', '0'); dfn.setAttribute('role', 'button'); dfn.setAttribute('aria-expanded', 'false');
      after.parentNode.replaceChild(dfn, after); dfn.appendChild(after);
    });
  });
};
App.defPop = null;
document.addEventListener('click', function (e) {
  var d = e.target.closest && e.target.closest('dfn[data-def]');
  if (App.defPop && (!d || App.defPop.__for !== d)) { App.defPop.__for.setAttribute('aria-expanded', 'false'); App.defPop.remove(); App.defPop = null; if (!d) return; }
  if (!d || d.isContentEditable) return;
  if (App.defPop) { d.setAttribute('aria-expanded', 'false'); App.defPop.remove(); App.defPop = null; return; }
  var pop = document.createElement('span'); pop.className = 'defpop'; pop.setAttribute('role', 'note'); pop.innerHTML = '<b>' + K.esc(d.textContent) + '</b> ' + K.esc(d.getAttribute('data-def'));
  d.insertAdjacentElement('afterend', pop); pop.__for = d; App.defPop = pop; d.setAttribute('aria-expanded', 'true');
});
document.addEventListener('keydown', function (e) {
  var d = e.target.closest && e.target.closest('dfn[data-def]');
  if (d && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); d.click(); }
  if (e.key === 'Escape' && App.defPop) { App.defPop.__for.setAttribute('aria-expanded', 'false'); App.defPop.remove(); App.defPop = null; }
});

/* ---------- Go deeper ----------
   Module field: reading: [{ cite: 'Authors (year). Title. Journal', url: 'https://doi.org/...', note: 'why read it' }] */
App.readingHtml = function (m) {
  if (!m.reading || !m.reading.length) return '';
  return '<section class="sec deeper" id="' + m.id + '-deeper"><h2>Go deeper</h2><p>Optional reading. Each source was checked for this course; the note says what it adds.</p><ul class="readl">' +
    m.reading.map(function (r) { var host = ''; try { host = new URL(r.url).hostname.replace(/^www\./, ''); } catch (e) { } return '<li><a href="' + K.esc(r.url) + '" target="_blank" rel="noopener">' + r.cite + '</a> <span class="host">' + host + '</span><span class="rnote">' + (r.note || '') + '</span></li>'; }).join('') + '</ul></section>';
};

/* ---------- reading the charts ---------- */
App.CODE_HTML = '<div class="vcode" role="note"><b>How to read the charts</b><span class="vc"><i class="sw obs"></i>Solid: what was observed in the data</span><span class="vc"><i class="sw pred"></i>Dashed: what a model predicts</span><span class="vc"><i class="sw err"></i>Red: the gap between the two (error)</span></div>';

/* ---------- EX: small helpers for drawing explainer scenes (560 x 300 stage) ----------
   Colour roles: 'obs' observed (solid ink), 'pred' model (dashed violet), 'err' error (red), 'muted', 'line'.
   Every helper takes an optional delay d (seconds) so parts appear in sequence; the stage scales delays with speed. */
var EX = {
  W: 560, H: 300,
  e: function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); },
  st: function (d, t) { return ' style="--d:' + (d || 0) + 's' + (t ? ';--t:' + t + 's' : '') + '"'; },
  svg: function (inner) { return '<svg viewBox="0 0 560 300" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'; },
  /* text: size 'l' (20px), 'm' (15px, default), 's' (13px muted); anchor 'start'|'middle'|'end'; role colours the text */
  text: function (x, y, str, o) { o = o || {}; var sz = o.size === 'l' ? 20 : o.size === 's' ? 13 : 15, cls = 'ex-in' + (o.size === 's' ? ' ts' : '') + (o.bold ? ' tb' : '') + (o.role ? ' f' + o.role : '');
    return '<text x="' + x + '" y="' + y + '" font-size="' + sz + '" text-anchor="' + (o.anchor || 'start') + '" class="' + cls + '"' + EX.st(o.d) + '>' + EX.e(str) + '</text>'; },
  /* n dots in a grid; the first k (or the indices in o.mark) get the highlight role */
  dots: function (n, o) { o = o || {}; var cols = o.cols || 40, g = o.gap || 11, r = o.r || 3.6, x0 = o.x || 60, y0 = o.y || 60, k = o.k || 0, s = '';
    for (var i = 0; i < n; i++) { var hi = i < k; s += '<circle cx="' + (x0 + (i % cols) * g) + '" cy="' + (y0 + Math.floor(i / cols) * g) + '" r="' + r + '" class="ex-in ' + (hi ? 'f' + (o.hrole || 'err') : 'fline') + '"' + EX.st((hi ? (o.hd || 0) : (o.d || 0)) + (o.stagger ? i * o.stagger : 0)) + '/>'; }
    return s; },
  /* plain line or polyline: pts [[x,y],...] in stage pixels; role obs|pred|err; draw animates the stroke */
  line: function (pts, o) { o = o || {}; var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    return '<path d="' + d + '" fill="none" stroke-width="' + (o.w || 2.5) + '" stroke-linecap="round" stroke-linejoin="round" class="' + (o.role || 'obs') + ((o.draw === false || o.role === 'pred') ? ' ex-in' : ' ex-draw') + '"' + (o.role === 'pred' ? '' : ' pathLength="1"') + EX.st(o.d, o.t) + '/>'; },
  rect: function (x, y, w, h, o) { o = o || {}; return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.rx || 3) + '" class="' + (o.grow ? 'ex-grow ' : 'ex-in ') + 'f' + (o.role || 'obs') + '"' + (o.op ? ' fill-opacity="' + o.op + '"' : '') + EX.st(o.d, o.t) + '/>'; },
  /* a plotting box: returns {X, Y, s} where X(v), Y(v) map data to pixels and s is the axes markup */
  box: function (o) { o = o || {}; var l = o.l || 70, t = o.t || 30, w = o.w || 440, h = o.h || 210, xl = o.xlim || [0, 1], yl = o.ylim || [0, 1];
    var X = function (v) { return l + (v - xl[0]) / (xl[1] - xl[0]) * w; }, Y = function (v) { return t + h - (v - yl[0]) / (yl[1] - yl[0]) * h; };
    var s = '<g class="ex-in"' + EX.st(o.d) + '><line x1="' + l + '" y1="' + (t + h) + '" x2="' + (l + w) + '" y2="' + (t + h) + '" stroke="var(--muted)"/><line x1="' + l + '" y1="' + t + '" x2="' + l + '" y2="' + (t + h) + '" stroke="var(--muted)"/>';
    (o.xticks || []).forEach(function (v) { s += '<text x="' + X(v) + '" y="' + (t + h + 18) + '" text-anchor="middle" class="ts" font-size="13">' + EX.e(o.xfmt ? o.xfmt(v) : v) + '</text>'; });
    (o.yticks || []).forEach(function (v) { s += '<text x="' + (l - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end" class="ts" font-size="13">' + EX.e(o.yfmt ? o.yfmt(v) : v) + '</text><line x1="' + l + '" x2="' + (l + w) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--line)"/>'; });
    if (o.xlabel) s += '<text x="' + (l + w / 2) + '" y="' + (t + h + 38) + '" text-anchor="middle" class="ts" font-size="13">' + EX.e(o.xlabel) + '</text>';
    if (o.ylabel) s += '<text x="' + (l - 52) + '" y="' + (t + h / 2) + '" text-anchor="middle" class="ts" font-size="13" transform="rotate(-90 ' + (l - 52) + ' ' + (t + h / 2) + ')">' + EX.e(o.ylabel) + '</text>';
    return { X: X, Y: Y, s: s + '</g>' }; },
  /* a curve y = f(x) drawn in a box from EX.box */
  curve: function (B, f, x0, x1, o) { var pts = [], n = 60; for (var i = 0; i <= n; i++) { var x = x0 + (x1 - x0) * i / n; pts.push([B.X(x), B.Y(f(x))]); } return EX.line(pts, o); },
  pts: function (B, xy, o) { o = o || {}; return xy.map(function (p, i) { return '<circle cx="' + B.X(p[0]).toFixed(1) + '" cy="' + B.Y(p[1]).toFixed(1) + '" r="' + (o.r || 4) + '" class="ex-in f' + (o.role || 'obs') + '"' + EX.st((o.d || 0) + (o.stagger || 0) * i) + '/>'; }).join(''); },
  /* vertical error ticks between observed and predicted values at the same x */
  gaps: function (B, xyy, o) { o = o || {}; return xyy.map(function (p) { return '<line x1="' + B.X(p[0]) + '" x2="' + B.X(p[0]) + '" y1="' + B.Y(p[1]) + '" y2="' + B.Y(p[2]) + '" stroke-width="2" class="err ex-in"' + EX.st(o.d) + '/>'; }).join(''); }
};
