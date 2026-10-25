/* ===== Accounts, progress model and cloud sync =====
   Dependency-free client for Supabase Auth (GoTrue) and PostgREST. The publishable key is public by design;
   row-level security (supabase/pmc_schema.sql) restricts every table. */
var PMC = window.PMC_CONFIG || {};
PMC.url = PMC.url || 'https://odsrftvuceizketmcesy.supabase.co';
PMC.key = PMC.key || 'sb_publishable_x3BnqzNP3On0O1C-axPtSw_UbeFLnnw';
PMC.repo = PMC.repo || 'https://github.com/RamThiru83/prediction-models-course';

/* ---------- progress model (version 2) ---------- */
App.blank = function () { return { v: 2, quiz: {}, qt: {}, done: {}, dt: {}, first: {}, notes: {}, hl: {}, ans: {}, mc: [], seen: {}, t: 0 }; };
App.norm = function (o) {
  var b = App.blank(); if (!o || typeof o !== 'object') return b;
  Object.keys(b).forEach(function (k) { if (o[k] !== undefined && o[k] !== null && typeof o[k] === typeof b[k]) b[k] = o[k]; });
  b.v = 2; return b;
};
function keysOf() { var s = {}; Array.prototype.forEach.call(arguments, function (o) { Object.keys(o || {}).forEach(function (k) { s[k] = 1; }); }); return Object.keys(s); }
function cnt(a) { var c = 0; (a || []).forEach(function (x) { if (x !== undefined && x !== null) c++; }); return c; }
function lww(a, b) { var r = {}; keysOf(a, b).forEach(function (k) { var x = a[k], y = b[k]; r[k] = !x ? y : !y ? x : ((y.at || 0) > (x.at || 0) ? y : x); }); return r; }
App.merge = function (a, b) {
  a = App.norm(a); b = App.norm(b); var r = App.blank();
  keysOf(a.quiz, b.quiz).forEach(function (m) {
    var ta = a.qt[m] || 0, tb = b.qt[m] || 0, src = (tb > ta || (tb === ta && cnt(b.quiz[m]) > cnt(a.quiz[m]))) ? b : a;
    r.quiz[m] = (src.quiz[m] || []).slice(); r.qt[m] = Math.max(ta, tb);
  });
  keysOf(a.done, b.done, a.dt, b.dt).forEach(function (m) {
    var ta = a.dt[m] || 0, tb = b.dt[m] || 0, d = (ta || tb) ? (tb > ta ? !!b.done[m] : !!a.done[m]) : !!(a.done[m] || b.done[m]);
    if (d) r.done[m] = true; if (ta || tb) r.dt[m] = Math.max(ta, tb);
  });
  keysOf(a.first, b.first).forEach(function (m) { var o = {}, x = a.first[m] || {}, y = b.first[m] || {}; keysOf(x, y).forEach(function (i) { o[i] = x[i] !== undefined ? x[i] : y[i]; }); r.first[m] = o; });
  r.notes = lww(a.notes, b.notes); r.ans = lww(a.ans, b.ans);
  keysOf(a.hl, b.hl).forEach(function (m) {
    var byId = {}; (a.hl[m] || []).concat(b.hl[m] || []).forEach(function (h) { var o = byId[h.id]; if (!o || (h.at || 0) > (o.at || 0)) byId[h.id] = h; });
    r.hl[m] = Object.keys(byId).map(function (k) { return byId[k]; });
  });
  var seen = {}; a.mc.concat(b.mc).forEach(function (x) { seen[x.at] = x; }); r.mc = Object.keys(seen).sort().map(function (k) { return seen[k]; }).slice(-50);
  keysOf(a.seen, b.seen).forEach(function (m) { r.seen[m] = Math.max(a.seen[m] || 0, b.seen[m] || 0); });
  r.t = Math.max(a.t || 0, b.t || 0); return r;
};
App.prog = App.blank();
App.slot = null;
function slotKey(uid) { return uid ? 'pmcourse.v1.u.' + uid : 'pmcourse.v1'; }
function readSlot(uid) { try { var s = localStorage.getItem(slotKey(uid)); if (s) return App.norm(JSON.parse(s)); } catch (e) { } return App.blank(); }
function writeSlot(uid, p) { try { localStorage.setItem(slotKey(uid), JSON.stringify(p)); } catch (e) { } }
App.load = function () { App.prog = readSlot(App.slot); };
App.save = function () { App.prog.t = Date.now(); writeSlot(App.slot, App.prog); App.acct.queue(); };
App.now = function () { return Date.now(); };

/* ---------- backend client ---------- */
var SB = App.sb = {};
var Acct = App.acct = { ready: false, session: null, profile: null, cohort: null, sync: 'idle', fb: [], tutor: null, lastSaved: 0, subs: [] };
Acct.set = function (patch) { Object.keys(patch).forEach(function (k) { Acct[k] = patch[k]; }); Acct.subs.forEach(function (f) { try { f(); } catch (e) { } }); };
Acct.on = function (f) { Acct.subs.push(f); };
Acct.isInstructor = function () { return !!(Acct.profile && Acct.profile.role === 'instructor'); };
function sessKey() { return 'pmc.session'; }
function saveSession(s) { try { if (s) localStorage.setItem(sessKey(), JSON.stringify(s)); else localStorage.removeItem(sessKey()); } catch (e) { } }
function mkSession(j) { return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at || (Math.floor(Date.now() / 1000) + (j.expires_in || 3600)), user: { id: j.user && j.user.id, email: j.user && j.user.email } }; }
var refreshing = null;
SB.refresh = function () {
  if (refreshing) return refreshing; var s = Acct.session; if (!s) return Promise.resolve(null);
  refreshing = fetch(PMC.url + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: PMC.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh_token }) })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (j) { Acct.session = mkSession(j); saveSession(Acct.session); return Acct.session.access_token; })
    .catch(function (st) { if (st === 400 || st === 401 || st === 403) { Acct.session = null; saveSession(null); Acct.set({ profile: null, cohort: null }); } return null; })
    .then(function (t) { refreshing = null; return t; });
  return refreshing;
};
SB.token = function () { var s = Acct.session; if (!s) return Promise.resolve(null); if (s.expires_at - Date.now() / 1000 > 60) return Promise.resolve(s.access_token); return SB.refresh(); };
SB.call = function (method, path, opt) {
  opt = opt || {};
  return SB.token().then(function (tok) {
    var h = { apikey: PMC.key, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (tok || PMC.key) };
    if (opt.prefer) h.Prefer = opt.prefer;
    var body = opt.body !== undefined ? JSON.stringify(opt.body) : undefined;
    return fetch(PMC.url + path, { method: method, headers: h, body: body, keepalive: !!(opt.keepalive && body && body.length < 60000) }).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { }
        if (!r.ok) { var er = new Error((j && (j.message || j.msg || j.error_description || j.error)) || ('HTTP ' + r.status)); er.status = r.status; throw er; }
        return j;
      });
    });
  });
};
SB.get = function (path) { return SB.call('GET', path); };
SB.upsert = function (table, row, conflict) { return SB.call('POST', '/rest/v1/' + table + '?on_conflict=' + conflict, { body: row, prefer: 'resolution=merge-duplicates,return=minimal' }); };
SB.insert = function (table, row) { return SB.call('POST', '/rest/v1/' + table, { body: row, prefer: 'return=minimal' }); };
SB.del = function (table, filter) { return SB.call('DELETE', '/rest/v1/' + table + '?' + filter); };
SB.patch = function (table, filter, row) { return SB.call('PATCH', '/rest/v1/' + table + '?' + filter, { body: row, prefer: 'return=minimal' }); };
SB.rpc = function (name, args) { return SB.call('POST', '/rest/v1/rpc/' + name, { body: args || {} }); };
SB.auth = function (path, body) {
  return fetch(PMC.url + '/auth/v1/' + path, { method: 'POST', headers: { apikey: PMC.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) {
    return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var er = new Error(j.msg || j.message || j.error_description || j.error || ('HTTP ' + r.status)); er.status = r.status; throw er; } return j; });
  });
};

/* ---------- actions ---------- */
function friendly(m) {
  m = String(m || '');
  return /invalid login credentials/i.test(m) ? 'That email and password do not match. Check both, or ask your instructor to reset your password.'
    : /already registered|already exists/i.test(m) ? 'An account with this email already exists. Use “Sign in” instead.'
    : /join code/i.test(m) || /database error saving new user/i.test(m) ? 'That join code was not accepted. Check it with your instructor.'
    : /email not confirmed/i.test(m) ? 'Your email address has not been confirmed yet. Check your inbox, or ask your instructor.'
    : /password/i.test(m) && /6|8|characters|short|weak/i.test(m) ? 'Choose a password of at least 8 characters.'
    : /failed to fetch|networkerror|load failed/i.test(m) ? 'Could not reach the account service. Check your connection and try again.'
    : m;
}
Acct.checkCode = function (code) { return SB.rpc('check_join_code', { code: code }).then(function (n) { return n || null; }, function () { return null; }); };
Acct.signUp = function (a) {
  if (!a.fullName.trim()) return Promise.resolve('Enter your name.');
  if (!/^\S+@\S+\.\S+$/.test(a.email.trim())) return Promise.resolve('Enter a valid email address.');
  if (a.password.length < 8) return Promise.resolve('Choose a password of at least 8 characters.');
  if (!a.consent) return Promise.resolve('Please read the note on what is stored and tick the box to continue.');
  return Acct.checkCode(a.joinCode).then(function (name) {
    if (!name) return 'That join code was not accepted. Check it with your instructor.';
    return SB.auth('signup', { email: a.email.trim(), password: a.password, data: { full_name: a.fullName.trim(), join_code: a.joinCode.trim(), consent: 'true' } }).then(function (j) {
      if (j && j.access_token) return Acct.begin(mkSession(j)).then(function () { return null; });
      return Acct.signIn(a.email, a.password);
    }, function (e) { return friendly(e.message); });
  });
};
Acct.signIn = function (email, password) {
  return SB.auth('token?grant_type=password', { email: email.trim(), password: password }).then(function (j) { return Acct.begin(mkSession(j)).then(function () { return null; }); }, function (e) { return friendly(e.message); });
};
Acct.changePassword = function (pw) {
  if (pw.length < 8) return Promise.resolve('Choose a password of at least 8 characters.');
  return SB.token().then(function (tok) { return fetch(PMC.url + '/auth/v1/user', { method: 'PUT', headers: { apikey: PMC.key, 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify({ password: pw }) }); })
    .then(function (r) { return r.ok ? null : r.json().then(function (j) { return friendly(j.msg || j.message); }); }, function (e) { return friendly(e.message); });
};
Acct.signOut = function () {
  var tok = Acct.session && Acct.session.access_token;
  return Acct.push().then(function () {
    if (tok) fetch(PMC.url + '/auth/v1/logout', { method: 'POST', headers: { apikey: PMC.key, Authorization: 'Bearer ' + tok } }).catch(function () { });
    Acct.session = null; saveSession(null); App.slot = null; App.load();
    Acct.set({ profile: null, cohort: null, fb: [], tutor: null, sync: 'idle' }); App.afterAccount();
  });
};
var tm = null;
Acct.queue = function () { if (!Acct.session) return; clearTimeout(tm); Acct.set({ sync: 'saving' }); tm = setTimeout(function () { Acct.push(); }, 1500); };
Acct.push = function (keep) {
  clearTimeout(tm); tm = null; if (!Acct.session) return Promise.resolve();
  var uid = Acct.session.user.id;
  return SB.call('POST', '/rest/v1/pmc_progress?on_conflict=user_id', { body: { user_id: uid, data: App.prog, updated_at: new Date().toISOString() }, prefer: 'resolution=merge-duplicates,return=minimal', keepalive: keep })
    .then(function () { Acct.set({ sync: 'saved', lastSaved: Date.now() }); }, function () { Acct.set({ sync: 'error' }); });
};
Acct.pull = function () {
  if (!Acct.session) return Promise.resolve();
  return SB.get('/rest/v1/pmc_progress?user_id=eq.' + Acct.session.user.id + '&select=data').then(function (rows) {
    if (rows && rows[0]) { App.prog = App.merge(App.prog, rows[0].data); writeSlot(App.slot, App.prog); }
  }).catch(function () { });
};
Acct.loadFeedback = function () {
  if (!Acct.session) return Promise.resolve();
  return SB.get('/rest/v1/pmc_feedback?learner=eq.' + Acct.session.user.id + '&select=id,item,body,created_at&order=created_at.asc').then(function (r) { Acct.set({ fb: r || [] }); }, function () { });
};
/* Called after sign-in or on load with a stored session: fetch profile and cloud copy, merge with this device. */
Acct.begin = function (session) {
  Acct.session = session; saveSession(session); var uid = session.user.id;
  return Promise.all([
    SB.get('/rest/v1/profiles?id=eq.' + uid + '&select=id,full_name,email,cohort_id,role'),
    SB.get('/rest/v1/pmc_progress?user_id=eq.' + uid + '&select=data')
  ]).then(function (res) {
    var prof = res[0] && res[0][0], cloud = res[1] && res[1][0] && res[1][0].data;
    var guest = readSlot(null), local = readSlot(uid);
    App.slot = uid; var merged = App.merge(App.merge(local, cloud), guest);
    writeSlot(null, App.blank()); App.prog = merged; writeSlot(uid, merged);
    Acct.set({ profile: prof || null, cohort: null });
    if (prof && prof.cohort_id) SB.get('/rest/v1/cohorts?id=eq.' + prof.cohort_id + '&select=name').then(function (c) { Acct.set({ cohort: c && c[0] && c[0].name }); }, function () { });
    SB.rpc('tutor_contact').then(function (n) { Acct.set({ tutor: (typeof n === 'string' && n) ? n : null }); }, function () { });
    Acct.loadFeedback();
    return Acct.push();
  }).then(function () { App.afterAccount(); }, function (e) {
    if (e && (e.status === 401 || e.status === 403)) { Acct.session = null; saveSession(null); }
    Acct.set({ sync: 'error' }); App.afterAccount();
  });
};
Acct.init = function () {
  var s = null; try { s = JSON.parse(localStorage.getItem(sessKey()) || 'null'); } catch (e) { }
  if (!s || !s.refresh_token) { Acct.set({ ready: true }); return Promise.resolve(); }
  Acct.session = s;
  return SB.token().then(function (tok) { if (!tok) { Acct.set({ ready: true }); return; } return Acct.begin(Acct.session); }).then(function () { Acct.set({ ready: true }); });
};
document.addEventListener('visibilitychange', function () {
  if (!Acct.session) return;
  if (document.visibilityState === 'hidden') { if (tm) Acct.push(true); }
  else if (Date.now() - (Acct.lastSaved || 0) > 60000) { Acct.pull().then(function () { App.markNav(); }); }
});
App.exportMine = function () {
  var text = JSON.stringify({ exported: new Date().toISOString(), account: Acct.profile ? { name: Acct.profile.full_name, email: Acct.profile.email } : null, progress: App.prog }, null, 1);
  K.download('my-prediction-models-course-data.json', text, 'application/json');
};
K.download = function (filename, text, type) {
  var bl = new Blob([text], { type: (type || 'text/plain') + ';charset=utf-8' }), a = document.createElement('a');
  a.href = URL.createObjectURL(bl); a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
};
