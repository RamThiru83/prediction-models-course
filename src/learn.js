/* ===== Learner annotation (notes, highlights, answers), instructor inline editing, release control ===== */
App.over = {};       // published text overrides: { 'm05:12': {html, base_hash} }
App.release = {};    // { m05: {hidden: true, open_at: '2026-11-02'} }
App.edit = false;
try { App.edit = sessionStorage.getItem('pmc.edit') === '1'; } catch (e) { }

/* ---------- sanitiser: the only markup instructors can publish ---------- */
var OK_TAGS = { B: 1, I: 1, EM: 1, STRONG: 1, U: 1, SUB: 1, SUP: 1, BR: 1, SPAN: 1, CODE: 1, A: 1, SMALL: 1 };
K.clean = function (html) {
  var t = document.createElement('template'); t.innerHTML = html; var out = document.createElement('div');
  (function walk(src, dst) {
    Array.prototype.forEach.call(src.childNodes, function (n) {
      if (n.nodeType === 3) { dst.appendChild(document.createTextNode(n.nodeValue)); return; }
      if (n.nodeType !== 1) return;
      var tag = n.tagName;
      if (!OK_TAGS[tag]) { if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|SVG|MATH|TEMPLATE|NOSCRIPT|LINK|META)$/.test(tag)) return; walk(n, dst); return; }
      var e = document.createElement(tag.toLowerCase());
      if (tag === 'SPAN') { var c = n.getAttribute('class'); if (c === 'm' || c === 'num') e.setAttribute('class', c); var dl = n.getAttribute('data-live'); if (dl && /^[a-z0-9_]+$/i.test(dl)) e.setAttribute('data-live', dl); }
      if (tag === 'A') { var h = n.getAttribute('href') || ''; if (/^https?:\/\//i.test(h) || /^#[A-Za-z0-9_-]+$/.test(h)) { e.setAttribute('href', h); if (h.charAt(0) !== '#') { e.setAttribute('target', '_blank'); e.setAttribute('rel', 'noopener noreferrer'); } } }
      walk(n, e); dst.appendChild(e);
    });
  })(t.content, out);
  return out.innerHTML;
};

/* ---------- editable blocks ---------- */
var BSEL = '.lede,.sec p,.sec li,.sec h2,.sec h3,.sec summary,.task h3,.task p,.callout p,.callout li,.qt,.opt > span:last-child,.kp li';
function hash(s) { var h = 5381, i; for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function textOf(el) { var c = el.cloneNode(true); Array.prototype.forEach.call(c.querySelectorAll('[data-live]'), function (n) { n.textContent = ''; }); return c.textContent.replace(/\s+/g, ' ').trim(); }
App.blocks = function (root) {
  var out = [];
  Array.prototype.forEach.call(root.querySelectorAll(BSEL), function (el) {
    if (el.closest('[data-widget],.wg,.why,.foot,.pager,#qscore,.myans,.note-card,.secbar,.edbar')) return;
    var b = el.closest('button'); if (b && !b.classList.contains('opt')) return;
    if (el.querySelector(BSEL)) return;
    el.setAttribute('data-bi', out.length); el.__orig = el.innerHTML; el.__hash = hash(textOf(el)); out.push(el);
  });
  return out;
};
/* blocks of a module computed off-screen (dashboard uses it to flag stale edits) */
App.blocksOf = function (m) { var d = document.createElement('div'); d.innerHTML = App.pageModule(m).html; return App.blocks(d); };

/* ---------- text offsets that ignore live values ---------- */
function tnodes(block) {
  var w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentNode.closest('[data-live]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), a = [], n;
  while ((n = w.nextNode())) a.push(n); return a;
}
function btext(block) { return tnodes(block).map(function (n) { return n.nodeValue; }).join(''); }
function clen(range) { var f = range.cloneContents(); Array.prototype.forEach.call(f.querySelectorAll('[data-live]'), function (n) { n.remove(); }); return f.textContent.length; }
function blockOf(node) { var el = node && (node.nodeType === 1 ? node : node.parentNode); return el && el.closest ? el.closest('[data-bi]') : null; }
function selOffsets(sel) {
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  var r = sel.getRangeAt(0), b = blockOf(r.startContainer), b2 = blockOf(r.endContainer);
  if (!b || b !== b2 || b.closest('.q,.edbar') || b.isContentEditable) return null;
  var pre = document.createRange(); pre.selectNodeContents(b); pre.setEnd(r.startContainer, r.startOffset);
  var s = clen(pre), e = s + clen(r), t = btext(b);
  if (e <= s) return null; var q = t.slice(s, e); if (!q.trim()) return null;
  return { block: b, bi: +b.getAttribute('data-bi'), s: s, e: e, q: q, range: r };
}
function markRange(block, s, e, id) {
  var pos = 0;
  tnodes(block).forEach(function (n) {
    var len = n.nodeValue.length, a = Math.max(s, pos), b = Math.min(e, pos + len);
    if (a < b) { var r = document.createRange(); r.setStart(n, a - pos); r.setEnd(n, b - pos); var m = document.createElement('mark'); m.className = 'hl'; m.setAttribute('data-h', id); r.surroundContents(m); }
    pos += len;
  });
}
function unmark(root, id) {
  Array.prototype.forEach.call(root.querySelectorAll('mark.hl[data-h="' + id + '"]'), function (m) { var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); });
}
function uid8() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ---------- decorate a module page ---------- */
App.decorate = function (root, m) {
  var col = root.querySelector('.col'); if (!col) return;
  var blocks = App.blocks(col), P = App.prog, canEdit = App.edit && App.acct.isInstructor();
  App.curBlocks = blocks;
  blocks.forEach(function (el, i) {
    var o = App.over[m.id + ':' + i];
    if (o && o.base_hash === el.__hash) { el.innerHTML = K.clean(o.html); el.classList.add('edited'); el.__over = true; }
  });
  P.seen = P.seen || {}; if (Date.now() - (P.seen[m.id] || 0) > 600000) { P.seen[m.id] = Date.now(); App.save(); }
  if (canEdit) { App.decorateEdit(col, m, blocks); return; }
  /* highlights */
  (P.hl[m.id] || []).forEach(function (h) {
    if (h.d) return; var el = blocks[h.b]; if (!el) return;
    if (btext(el).slice(h.s, h.e) !== h.q) { h.stale = true; return; }
    try { markRange(el, h.s, h.e, h.id); } catch (e) { }
  });
  /* section note buttons */
  Array.prototype.forEach.call(col.querySelectorAll('.sec > h2'), function (h2) {
    var bar = document.createElement('div'); bar.className = 'secbar'; bar.innerHTML = '<button type="button" class="btn sm ghost" data-secnote>＋ Note on this section</button>'; h2.insertAdjacentElement('afterend', bar);
    bar.querySelector('button').onclick = function () { addNote(m, blocks, +h2.getAttribute('data-bi'), textOf(h2)); };
  });
  /* existing notes */
  Object.keys(P.notes).forEach(function (k) {
    var p = k.split('|'); if (p[0] !== m.id || !P.notes[k].t) return; var bi = +p[1].slice(1); if (blocks[bi]) showNote(m, blocks, bi);
  });
  /* answers */
  Array.prototype.forEach.call(col.querySelectorAll('.task'), function (t, i) { addAnswer(t, m, i); });
};
function noteAnchor(el) { if (el.tagName === 'LI') { var l = el.closest('ul,ol'); while (l && l.parentElement && l.parentElement.closest('ul,ol') && l.parentElement.closest('.sec') === l.closest('.sec') && l.parentElement.closest('li')) l = l.parentElement.closest('ul,ol'); return l || el; } return el; }
function showNote(m, blocks, bi, focus) {
  var key = m.id + '|b' + bi, P = App.prog, el = blocks[bi]; if (!el) return;
  var card = document.querySelector('.note-card[data-nk="' + key + '"]');
  if (!card) {
    card = document.createElement('div'); card.className = 'note-card'; card.setAttribute('data-nk', key);
    card.innerHTML = '<div class="nq"></div><textarea rows="2" maxlength="4000" placeholder="Your note (saved automatically; your instructor can read it)" aria-label="Your note"></textarea><div class="nf"><span class="sv"></span><button type="button" class="btn sm">Delete note</button></div>';
    noteAnchor(el).insertAdjacentElement('afterend', card);
    var ta = card.querySelector('textarea'), sv = card.querySelector('.sv'), tm;
    function fit() { ta.style.height = 'auto'; ta.style.height = Math.min(320, ta.scrollHeight + 2) + 'px'; }
    ta.addEventListener('input', function () { fit(); sv.textContent = 'Saving…'; clearTimeout(tm); tm = setTimeout(function () { var n = P.notes[key] || { q: (P.notes[key] && P.notes[key].q) || '' }; n.t = ta.value; n.at = Date.now(); P.notes[key] = n; App.save(); sv.textContent = 'Saved'; }, 600); });
    card.querySelector('.btn').onclick = function () { var n = P.notes[key]; if (n) { n.t = ''; n.at = Date.now(); App.save(); } card.remove(); };
    card.__fit = fit;
  }
  var n = P.notes[key]; card.querySelector('.nq').textContent = n && n.q ? '“' + n.q.slice(0, 140) + (n.q.length > 140 ? '…' : '') + '”' : '';
  var t = card.querySelector('textarea'); if (n && n.t && t.value !== n.t) t.value = n.t; card.__fit();
  if (focus) t.focus();
}
function addNote(m, blocks, bi, quote) {
  var key = m.id + '|b' + bi, P = App.prog; if (!P.notes[key] || !P.notes[key].t) P.notes[key] = { t: '', q: (quote || '').slice(0, 300), at: Date.now() };
  showNote(m, blocks, bi, true);
}
function addAnswer(task, m, i) {
  var key = m.id + '|t' + i, P = App.prog, a = P.ans[key];
  var d = document.createElement('div'); d.className = 'myans'; d.setAttribute('data-ak', key);
  d.innerHTML = '<label>Your answer <span class="sv"></span></label><textarea rows="5" maxlength="20000" placeholder="Write your working and answer here before opening the worked answer. It is saved automatically, you can edit it any time, and your instructor can read it."></textarea><div class="fbs"></div>';
  task.appendChild(d); var ta = d.querySelector('textarea'), sv = d.querySelector('.sv'), tm; ta.value = (a && a.t) || '';
  function fit() { ta.style.height = 'auto'; ta.style.height = Math.max(110, Math.min(420, ta.scrollHeight + 2)) + 'px'; } fit();
  ta.addEventListener('input', function () { fit(); sv.textContent = 'Saving…'; clearTimeout(tm); tm = setTimeout(function () { P.ans[key] = { t: ta.value, at: Date.now() }; App.save(); sv.textContent = App.acct.session ? 'Saved to your account' : 'Saved in this browser'; }, 700); });
  App.showFeedback(d.querySelector('.fbs'), key);
}
App.showFeedback = function (el, key) {
  var items = (App.acct.fb || []).filter(function (f) { return f.item === key; });
  el.innerHTML = items.map(function (f) { return '<div class="fb"><b>Instructor feedback</b> <small>' + new Date(f.created_at).toLocaleDateString() + '</small><p>' + K.esc(f.body).replace(/\n/g, '<br>') + '</p></div>'; }).join('');
};

/* ---------- selection toolbar ---------- */
(function () {
  var tb = null, cur = null;
  function hide() { if (tb) tb.hidden = true; cur = null; }
  function ensure() {
    if (tb) return tb; tb = document.createElement('div'); tb.className = 'seltb'; tb.hidden = true;
    tb.innerHTML = '<button type="button" data-a="hl">Highlight</button><button type="button" data-a="note">Note</button><button type="button" data-a="rm">Remove highlight</button>';
    tb.addEventListener('mousedown', function (e) { e.preventDefault(); }); tb.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
    tb.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || !cur) return; act(b.getAttribute('data-a')); });
    document.body.appendChild(tb); return tb;
  }
  function act(a) {
    var m = App.byId[App.cur], P = App.prog, o = cur; if (!m || !o) return; var root = document.getElementById('page');
    if (a === 'hl') {
      var id = 'h' + uid8(), item = { id: id, b: o.bi, s: o.s, e: o.e, q: o.q, at: Date.now() };
      (P.hl[m.id] = P.hl[m.id] || []).push(item); App.save(); window.getSelection().removeAllRanges(); markRange(o.block, o.s, o.e, id);
    } else if (a === 'note') { window.getSelection().removeAllRanges(); addNote(m, App.curBlocks, o.bi, o.q); }
    else if (a === 'rm') {
      var ids = {}; Array.prototype.forEach.call(root.querySelectorAll('mark.hl'), function (mk) { if (o.range.intersectsNode(mk)) ids[mk.getAttribute('data-h')] = 1; });
      (P.hl[m.id] || []).forEach(function (h) { if (ids[h.id]) { h.d = 1; h.at = Date.now(); } }); Object.keys(ids).forEach(function (id) { unmark(root, id); }); App.save(); window.getSelection().removeAllRanges();
    }
    hide();
  }
  function update() {
    if (!App.byId[App.cur] || (App.edit && App.acct.isInstructor())) return hide();
    var o = selOffsets(window.getSelection()); if (!o) return hide(); cur = o;
    var r = o.range.getBoundingClientRect(), t = ensure(), root = document.getElementById('page'), over = false;
    Array.prototype.forEach.call(root.querySelectorAll('mark.hl'), function (mk) { if (o.range.intersectsNode(mk)) over = true; });
    t.querySelector('[data-a="rm"]').hidden = !over; t.hidden = false;
    var w = t.offsetWidth, x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8), y = r.top - t.offsetHeight - 8; if (y < 8) y = r.bottom + 8;
    t.style.left = x + 'px'; t.style.top = y + 'px';
  }
  var dt; document.addEventListener('selectionchange', function () { clearTimeout(dt); dt = setTimeout(update, 120); });
  window.addEventListener('scroll', function () { if (tb && !tb.hidden) update(); }, { passive: true });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
})();

/* ---------- instructor inline editing ---------- */
App.decorateEdit = function (col, m, blocks) {
  var dirty = {}, bar = document.createElement('div'); bar.className = 'edbar';
  bar.innerHTML = '<span class="ed-t"><b>Editing course text.</b> Click any paragraph, list item, heading, quiz question or option. Changes publish to all learners when you save.</span><span class="ed-c"></span><button type="button" class="btn pri sm" data-s disabled>Save changes</button><button type="button" class="btn sm" data-d disabled>Discard</button><button type="button" class="btn sm" data-r>Revert this page to original</button><button type="button" class="btn sm" data-x>Exit editing</button>';
  document.body.appendChild(bar); App.edbar = bar;
  function upd() { var n = Object.keys(dirty).length; bar.querySelector('.ed-c').textContent = n ? n + ' unsaved' : ''; bar.querySelector('[data-s]').disabled = !n; bar.querySelector('[data-d]').disabled = !n; }
  Array.prototype.forEach.call(col.querySelectorAll('.q button.opt'), function (b) {
    var d = document.createElement('div'); d.className = b.className; while (b.firstChild) d.appendChild(b.firstChild); b.parentNode.replaceChild(d, b);
  });
  blocks.forEach(function (el, i) {
    el.contentEditable = 'true'; el.classList.add('ed'); el.spellcheck = true;
    el.addEventListener('input', function () { dirty[i] = 1; upd(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
    el.addEventListener('paste', function (e) { e.preventDefault(); var t = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s+/g, ' '); document.execCommand('insertText', false, t); });
  });
  function serial(el) { var c = el.cloneNode(true); Array.prototype.forEach.call(c.querySelectorAll('[data-live]'), function (n) { n.textContent = ''; }); return K.clean(c.innerHTML); }
  function origClean(el) { var d = document.createElement('div'); d.innerHTML = el.__orig; Array.prototype.forEach.call(d.querySelectorAll('[data-live]'), function (n) { n.textContent = ''; }); return K.clean(d.innerHTML); }
  bar.querySelector('[data-x]').onclick = function () { App.setEdit(false); };
  bar.querySelector('[data-d]').onclick = function () { App.route(true); };
  bar.querySelector('[data-s]').onclick = function () {
    var btn = this; btn.disabled = true; btn.textContent = 'Saving…'; var jobs = [];
    Object.keys(dirty).forEach(function (i) {
      var el = blocks[i], key = m.id + ':' + i, html = serial(el);
      if (html === origClean(el)) { if (App.over[key]) jobs.push(SB.del('pmc_overrides', 'key=eq.' + encodeURIComponent(key))); }
      else if (!html.replace(/<[^>]*>/g, '').trim()) { /* refuse to publish an empty block */ }
      else jobs.push(SB.upsert('pmc_overrides', { key: key, html: html.slice(0, 19000), base_hash: el.__hash, updated_at: new Date().toISOString() }, 'key'));
    });
    Promise.all(jobs).then(function () { return App.loadRemote(); }).then(function () { App.route(true); }, function (e) { bar.querySelector('.ed-c').textContent = 'Could not save: ' + e.message; btn.disabled = false; btn.textContent = 'Save changes'; });
  };
  bar.querySelector('[data-r]').onclick = function () {
    var keys = Object.keys(App.over).filter(function (k) { return k.indexOf(m.id + ':') === 0; }); if (!keys.length) return;
    Promise.all(keys.map(function (k) { return SB.del('pmc_overrides', 'key=eq.' + encodeURIComponent(k)); })).then(function () { return App.loadRemote(); }).then(function () { App.route(true); });
  };
  upd();
};
App.setEdit = function (on) { App.edit = !!on; try { sessionStorage.setItem('pmc.edit', on ? '1' : '0'); } catch (e) { } App.afterAccount(); };
App.clearEdbar = function () { if (App.edbar) { App.edbar.remove(); App.edbar = null; } };

/* ---------- remote course configuration ---------- */
App.loadRemote = function () {
  return Promise.all([
    SB.get('/rest/v1/pmc_overrides?select=key,html,base_hash,updated_at'),
    SB.get('/rest/v1/pmc_settings?key=eq.release&select=value')
  ]).then(function (r) {
    var o = {}; (r[0] || []).forEach(function (x) { o[x.key] = x; }); App.over = o;
    App.release = (r[1] && r[1][0] && r[1][0].value) || {};
  }, function () { });
};
App.lockInfo = function (m) {
  if (App.acct.isInstructor()) return null;
  var r = App.release[m.id]; if (!r) return null;
  if (r.hidden) return 'This module is not open yet.';
  if (r.open_at && r.open_at > new Date().toISOString().slice(0, 10)) return 'This module opens on ' + new Date(r.open_at + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
  return null;
};
