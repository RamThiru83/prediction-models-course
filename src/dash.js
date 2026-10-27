/* ===== Instructor class dashboard ===== */
(function () {
  var D = App.dash = { rows: [], cohorts: [], fb: [], wa: '', tab: 'class', sel: null, loaded: false };
  var esc = K.esc;
  function strip(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); }
  function csvCell(v) { v = v === null || v === undefined ? '' : String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function csv(rows) { return rows.map(function (r) { return r.map(csvCell).join(','); }).join('\n'); }
  function ago(t) { if (!t) return 'never'; var s = (Date.now() - new Date(t).getTime()) / 1000; if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' d ago'; }
  function stats(d) {
    d = App.norm(d); var o = { done: 0, ans: 0, ok: 0, f: 0, fn: 0, notes: 0, tasks: 0, perMod: {} };
    App.mods_sorted().forEach(function (m) {
      var a = d.quiz[m.id] || [], n = 0, c = 0; m.quiz.forEach(function (q, i) { if (a[i] !== undefined && a[i] !== null) { n++; if (a[i] === q.answer) c++; } });
      o.perMod[m.id] = { n: n, c: c, done: !!d.done[m.id] }; o.ans += n; o.ok += c; if (d.done[m.id]) o.done++;
      var f = d.first[m.id] || {}; Object.keys(f).forEach(function (i) { o.fn++; o.f += f[i] ? 1 : 0; });
    });
    o.notes = Object.keys(d.notes).filter(function (k) { return d.notes[k].t; }).length; o.tasks = Object.keys(d.ans).filter(function (k) { return d.ans[k].t; }).length; return o;
  }
  function load() {
    return Promise.all([
      SB.get('/rest/v1/pmc_progress?select=user_id,data,updated_at'), SB.get('/rest/v1/profiles?select=id,full_name,email,cohort_id,role,created_at'),
      SB.get('/rest/v1/cohorts?select=id,name,join_code,active&order=created_at'), SB.get('/rest/v1/pmc_feedback?select=id,learner,item,body,created_at&order=created_at.desc'),
      SB.get('/rest/v1/app_settings?key=eq.whatsapp&select=value'), App.loadRemote()
    ]).then(function (r) {
      var prof = {}; (r[1] || []).forEach(function (p) { prof[p.id] = p; });
      D.rows = (r[0] || []).filter(function (x) { return prof[x.user_id] && prof[x.user_id].role !== 'instructor'; }).map(function (x) { var p = prof[x.user_id]; return { id: x.user_id, name: p.full_name, email: p.email, cohort: p.cohort_id, upd: x.updated_at, data: App.norm(x.data), st: stats(x.data) }; })
        .sort(function (a, b) { return a.name.localeCompare(b.name); });
      D.cohorts = r[2] || []; D.fb = r[3] || []; D.wa = (r[4] && r[4][0] && r[4][0].value) || ''; D.loaded = true;
    });
  }
  var TABS = [['class', 'Class'], ['questions', 'Questions'], ['learner', 'Learners'], ['release', 'Release'], ['content', 'Course text'], ['setup', 'Setup']];
  App.pageDashboard = function () {
    var h = '<p class="eyebrow">Instructor</p><h1>Class dashboard</h1><div class="tabs" id="dtabs">' + TABS.map(function (t) { return '<button type="button" class="tab' + (t[0] === D.tab ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div id="dbody"><p>Loading…</p></div>' +
      '<p class="note">Learner data are for teaching only. Using them for research needs ethics approval and separate consent.</p>';
    return { html: h, after: function (root) {
      var body = root.querySelector('#dbody');
      function draw() { try { TAB[D.tab](body, draw); } catch (e) { body.innerHTML = '<p class="note">Could not draw this tab: ' + esc(e.message) + '</p>'; } }
      Array.prototype.forEach.call(root.querySelectorAll('.tab'), function (b) { b.onclick = function () { D.tab = b.getAttribute('data-t'); Array.prototype.forEach.call(root.querySelectorAll('.tab'), function (x) { x.classList.toggle('on', x === b); }); draw(); }; });
      load().then(draw, function (e) { body.innerHTML = '<p class="note">Could not load class data: ' + esc(e.message) + '</p>'; });
    } };
  };
  var TAB = {};
  TAB.class = function (body) {
    var mods = App.mods_sorted(), n = D.rows.length;
    var tot = D.rows.reduce(function (a, r) { a.ans += r.st.ans; a.ok += r.st.ok; a.f += r.st.f; a.fn += r.st.fn; a.done += r.st.done; return a; }, { ans: 0, ok: 0, f: 0, fn: 0, done: 0 });
    var h = K.stats([['Learners', n], ['Modules completed (mean)', n ? K.f(tot.done / n, 1) : 'n/a'], ['Quiz accuracy', tot.ans ? K.pct(tot.ok / tot.ans, 0) : 'n/a'], ['First-attempt accuracy', tot.fn ? K.pct(tot.f / tot.fn, 0) : 'n/a']]);
    if (!n) { body.innerHTML = h + '<p>No learners have started yet. Share the join code from the Setup tab.</p>'; return; }
    h += '<p><button type="button" class="btn" id="csv1">Download roster CSV</button> <button type="button" class="btn" id="csv2">Download question CSV</button></p>';
    h += K.tbl(['Learner', 'Last active', 'Done', 'Quiz answered', 'Correct', 'First attempt', 'Notes', 'Answers'], D.rows.map(function (r) {
      return ['<a href="#dashboard" data-l="' + r.id + '">' + esc(r.name) + '</a>', ago(r.upd), r.st.done + '/' + mods.length, r.st.ans, r.st.ans ? K.pct(r.st.ok / r.st.ans, 0) : 'n/a', r.st.fn ? K.pct(r.st.f / r.st.fn, 0) : 'n/a', r.st.notes, r.st.tasks];
    }));
    h += '<h3>Concept mastery grid</h3><p class="note">Share of answered quiz questions correct, by learner and module. Blank means not attempted.</p><div class="tw"><table class="data grid"><thead><tr><th>Learner</th>' + mods.map(function (m) { return '<th class="r" title="' + esc(m.title) + '">' + App.modLabel(m) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      D.rows.map(function (r) { return '<tr><td>' + esc(r.name) + '</td>' + mods.map(function (m) { var x = r.st.perMod[m.id]; if (!x || !x.n) return '<td class="r"></td>'; var p = x.c / x.n; return '<td class="r g ' + (p >= 0.8 ? 'hi' : p >= 0.5 ? 'mid' : 'lo') + '" title="' + x.c + ' of ' + x.n + '">' + Math.round(100 * p) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    body.innerHTML = h;
    Array.prototype.forEach.call(body.querySelectorAll('[data-l]'), function (a) { a.onclick = function (e) { e.preventDefault(); D.sel = a.getAttribute('data-l'); D.tab = 'learner'; document.querySelector('#dtabs [data-t="learner"]').click(); }; });
    body.querySelector('#csv1').onclick = function () {
      var rows = [['name', 'email', 'last_active', 'modules_done', 'quiz_answered', 'quiz_correct', 'first_attempt_correct', 'first_attempt_n', 'notes', 'answers'].concat(mods.map(function (m) { return m.id + '_pct'; }))];
      D.rows.forEach(function (r) { rows.push([r.name, r.email, r.upd, r.st.done, r.st.ans, r.st.ok, r.st.f, r.st.fn, r.st.notes, r.st.tasks].concat(mods.map(function (m) { var x = r.st.perMod[m.id]; return x && x.n ? Math.round(100 * x.c / x.n) : ''; }))); });
      K.download('class-roster.csv', csv(rows), 'text/csv');
    };
    body.querySelector('#csv2').onclick = function () { K.download('question-first-attempts.csv', csv([['module', 'question', 'learners', 'first_attempt_correct', 'text']].concat(qstats().map(function (q) { return [q.m.id, q.i + 1, q.n, q.ok, q.text]; }))), 'text/csv'); };
  };
  function qstats() {
    var out = []; App.mods_sorted().forEach(function (m) { m.quiz.forEach(function (q, i) { var n = 0, ok = 0; D.rows.forEach(function (r) { var v = (r.data.first[m.id] || {})[i]; if (v !== undefined) { n++; ok += v ? 1 : 0; } }); out.push({ m: m, i: i, n: n, ok: ok, text: strip(q.q) }); }); }); return out;
  }
  TAB.questions = function (body) {
    var q = qstats().filter(function (x) { return x.n > 0; }).sort(function (a, b) { return (1 - b.ok / b.n) - (1 - a.ok / a.n) || b.n - a.n; }).slice(0, 25);
    body.innerHTML = '<p class="lede">Questions most often missed at the first attempt. Small counts are unreliable: read the “Learners” column.</p>' + (q.length ? K.tbl(['Module', 'Question', 'Missed first time', 'Learners', 'Text'], q.map(function (x) { return ['<a href="#' + x.m.id + '">' + App.modLabel(x.m) + '</a>', x.i + 1, K.pct(1 - x.ok / x.n, 0), x.n, esc(x.text.slice(0, 160))]; })) : '<p>No quiz answers yet.</p>');
  };
  TAB.learner = function (body, redraw) {
    if (!D.rows.length) { body.innerHTML = '<p>No learners yet.</p>'; return; }
    var r = D.rows.filter(function (x) { return x.id === D.sel; })[0] || D.rows[0]; D.sel = r.id; var d = r.data, mods = App.mods_sorted();
    var h = '<p><label>Learner <select id="lsel">' + D.rows.map(function (x) { return '<option value="' + x.id + '"' + (x.id === r.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></label></p>' +
      '<p class="note">' + esc(r.email) + ' · last active ' + ago(r.upd) + '</p>' +
      K.tbl(['Module', 'Complete', 'Quiz', 'First attempt'], mods.map(function (m) { var x = r.st.perMod[m.id], f = d.first[m.id] || {}, fk = Object.keys(f), fc = fk.filter(function (i) { return f[i]; }).length; return [esc(m.title), x.done ? 'yes' : '', x.n ? x.c + '/' + x.n : '', fk.length ? fc + '/' + fk.length : '']; }));
    var items = Object.keys(d.ans).filter(function (k) { return d.ans[k].t; });
    h += '<h3>Written answers</h3>' + (items.length ? '' : '<p>None yet.</p>');
    items.forEach(function (k) {
      var p = k.split('|t'), m = App.byId[p[0]], i = +p[1], fbs = D.fb.filter(function (f) { return f.learner === r.id && f.item === k; });
      h += '<div class="task"><h4>' + esc(m ? m.title : p[0]) + ' · Task ' + (i + 1) + (m && m.tasks[i] ? ': ' + esc(m.tasks[i].title) : '') + '</h4><p class="ansview">' + esc(d.ans[k].t).replace(/\n/g, '<br>') + '</p>' +
        fbs.map(function (f) { return '<div class="fb"><b>Your feedback</b> <small>' + new Date(f.created_at).toLocaleDateString() + '</small><p>' + esc(f.body).replace(/\n/g, '<br>') + '</p><button type="button" class="btn sm ghost" data-delfb="' + f.id + '">Remove</button></div>'; }).join('') +
        '<div class="form"><label>Feedback to the learner<textarea rows="2" maxlength="4000" data-fb="' + esc(k) + '"></textarea></label><button type="button" class="btn sm" data-sendfb="' + esc(k) + '">Send feedback</button> <span class="msg"></span></div></div>';
    });
    var notes = Object.keys(d.notes).filter(function (k) { return d.notes[k].t; });
    h += '<h3>Notes</h3>' + (notes.length ? notes.map(function (k) { var n = d.notes[k], m = App.byId[k.split('|')[0]]; return '<div class="note-card"><div class="nq">' + esc(m ? m.title : '') + (n.q ? ': “' + esc(n.q.slice(0, 140)) + '”' : '') + '</div><p>' + esc(n.t).replace(/\n/g, '<br>') + '</p></div>'; }).join('') : '<p>None yet.</p>');
    h += '<h3>Reset password</h3><form class="form" id="rpf"><label>Temporary password for ' + esc(r.name) + ' (at least 8 characters)<input type="text" id="rpw" autocomplete="off" minlength="8"></label><button class="btn" type="submit">Set temporary password</button> <span class="msg" id="rpm"></span></form><p class="note">Tell the learner the temporary password directly, and ask them to change it under Account.</p>';
    body.innerHTML = h;
    body.querySelector('#lsel').onchange = function () { D.sel = this.value; redraw(); };
    Array.prototype.forEach.call(body.querySelectorAll('[data-sendfb]'), function (b) { b.onclick = function () {
      var k = b.getAttribute('data-sendfb'), ta = body.querySelector('textarea[data-fb="' + k + '"]'), t = ta.value.trim(), m = b.parentNode.querySelector('.msg'); if (!t) return; b.disabled = true;
      SB.insert('pmc_feedback', { learner: r.id, item: k, body: t }).then(function () { return SB.get('/rest/v1/pmc_feedback?select=id,learner,item,body,created_at&order=created_at.desc'); }).then(function (f) { D.fb = f || []; redraw(); }, function (e) { b.disabled = false; m.textContent = e.message; m.className = 'msg bad'; });
    }; });
    Array.prototype.forEach.call(body.querySelectorAll('[data-delfb]'), function (b) { b.onclick = function () { SB.del('pmc_feedback', 'id=eq.' + b.getAttribute('data-delfb')).then(function () { D.fb = D.fb.filter(function (f) { return String(f.id) !== b.getAttribute('data-delfb'); }); redraw(); }); }; });
    body.querySelector('#rpf').onsubmit = function (e) { e.preventDefault(); var m = body.querySelector('#rpm'), pw = body.querySelector('#rpw').value; if (pw.length < 8) { m.textContent = 'At least 8 characters.'; m.className = 'msg bad'; return; }
      SB.rpc('instructor_set_password', { target: r.id, new_password: pw }).then(function () { m.textContent = 'Temporary password set.'; m.className = 'msg ok'; body.querySelector('#rpw').value = ''; }, function (er) { m.textContent = er.message; m.className = 'msg bad'; }); };
  };
  TAB.release = function (body) {
    var mods = App.mods_sorted(), R = App.release || {};
    body.innerHTML = '<p class="lede">Control which modules learners can open. A hidden module, or one with a future opening date, shows as locked to learners. You always see everything.</p>' +
      K.tbl(['Module', 'Open to learners', 'Opens on (optional)'], mods.map(function (m) { var r = R[m.id] || {}; return [App.modLabel(m) + '. ' + esc(m.title), '<input type="checkbox" data-v="' + m.id + '"' + (r.hidden ? '' : ' checked') + ' aria-label="Open ' + esc(m.title) + '">', '<input type="date" data-o="' + m.id + '" value="' + esc(r.open_at || '') + '">']; })) +
      '<p><button type="button" class="btn pri" id="rsave">Save release settings</button> <span class="msg" id="rmsg"></span></p>';
    body.querySelector('#rsave').onclick = function () {
      var v = {}; mods.forEach(function (m) { var open = body.querySelector('[data-v="' + m.id + '"]').checked, date = body.querySelector('[data-o="' + m.id + '"]').value; if (!open || date) { v[m.id] = {}; if (!open) v[m.id].hidden = true; if (date) v[m.id].open_at = date; } });
      var msg = body.querySelector('#rmsg'); msg.textContent = 'Saving…';
      SB.upsert('pmc_settings', { key: 'release', value: v, updated_at: new Date().toISOString() }, 'key').then(function () { App.release = v; App.buildNav(); msg.textContent = 'Saved.'; msg.className = 'msg ok'; }, function (e) { msg.textContent = e.message; msg.className = 'msg bad'; });
    };
  };
  TAB.content = function (body, redraw) {
    var keys = Object.keys(App.over).sort();
    if (!keys.length) { body.innerHTML = '<p class="lede">No published text edits yet. Switch on “Edit course text” in the left rail, open any module or page and click any text to edit it.</p>'; return; }
    var cache = {}, live = {}; function blocksFor(id) { if (!cache[id]) { try { cache[id] = App.blocksOf(id); } catch (e) { cache[id] = []; } live[id] = App.resolveOver(id, cache[id]); } return cache[id]; }
    var pname = function (id) { return App.byId[id] ? App.byId[id].title : (App.refs[id] ? App.refs[id].title : ({ home: 'Home', about: 'About', howto: 'How to use CliPr', datasets: 'Datasets' })[id] || id); };
    body.innerHTML = '<p class="lede">Edits published to all learners. An edit marked <b>outdated</b> no longer matches the underlying text (the course was updated) and is ignored until reverted or re-edited.</p>' +
      K.tbl(['Where', 'Edited text', 'Status', ''], keys.map(function (k) { var p = k.split(':'); blocksFor(p[0]); var ok = !!live[p[0]][k]; return ['<a href="#' + p[0] + '">' + esc(pname(p[0])) + '</a> · block ' + p[1], esc(strip(App.over[k].html).slice(0, 140)), ok ? 'live' : 'outdated', '<button type="button" class="btn sm" data-rv="' + k + '">Revert</button>']; }));
    Array.prototype.forEach.call(body.querySelectorAll('[data-rv]'), function (b) { b.onclick = function () { b.disabled = true; SB.del('pmc_overrides', 'key=eq.' + encodeURIComponent(b.getAttribute('data-rv'))).then(App.loadRemote).then(redraw); }; });
  };
  TAB.setup = function (body, redraw) {
    var h = '<h3>Join codes</h3><p class="note">Cohorts are shared with EpiCompass (same account system). Learners sign up with a code on the Account page.</p>' +
      K.tbl(['Cohort', 'Join code', 'Active'], D.cohorts.map(function (c) { return [esc(c.name), '<code>' + esc(c.join_code) + '</code>', '<input type="checkbox" data-co="' + c.id + '"' + (c.active ? ' checked' : '') + ' aria-label="Active">']; })) +
      '<form class="form" id="cof"><label>New cohort name<input type="text" id="con" required></label><label>Join code<input type="text" id="coc" required minlength="4"></label><button class="btn" type="submit">Add cohort</button> <span class="msg" id="com"></span></form>' +
      '<h3>Ask-your-instructor contact</h3><form class="form" id="waf"><label>WhatsApp number with country code, digits only (shown only to signed-in learners; leave empty to hide the button)<input type="text" id="wan" inputmode="numeric" value="' + esc(D.wa) + '"></label><button class="btn" type="submit">Save</button> <span class="msg" id="wam"></span></form>';
    body.innerHTML = h;
    Array.prototype.forEach.call(body.querySelectorAll('[data-co]'), function (c) { c.onchange = function () { SB.patch('cohorts', 'id=eq.' + c.getAttribute('data-co'), { active: c.checked }); }; });
    body.querySelector('#cof').onsubmit = function (e) { e.preventDefault(); var m = body.querySelector('#com'); SB.insert('cohorts', { name: body.querySelector('#con').value.trim(), join_code: body.querySelector('#coc').value.trim(), active: true }).then(function () { return SB.get('/rest/v1/cohorts?select=id,name,join_code,active&order=created_at'); }).then(function (c) { D.cohorts = c || []; redraw(); }, function (er) { m.textContent = /duplicate|unique/i.test(er.message) ? 'That code is already in use.' : er.message; m.className = 'msg bad'; }); };
    body.querySelector('#waf').onsubmit = function (e) { e.preventDefault(); var v = body.querySelector('#wan').value.replace(/\D/g, ''), m = body.querySelector('#wam');
      (v ? SB.upsert('app_settings', { key: 'whatsapp', value: v, updated_at: new Date().toISOString() }, 'key') : SB.del('app_settings', 'key=eq.whatsapp')).then(function () { D.wa = v; m.textContent = 'Saved.'; m.className = 'msg ok'; }, function (er) { m.textContent = er.message; m.className = 'msg bad'; }); };
  };
})();
