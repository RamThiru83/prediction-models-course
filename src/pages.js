/* ===== Account, notes and answers pages; rail chip; ask-instructor button ===== */
var Ac = App.acct;
App.chipHtml = function () {
  if (!Ac.session || !Ac.profile) {
    return '<div class="acct"><a class="btn sm pri" href="#account">Sign in or join</a><small>' + (Ac.session ? 'Signing in…' : 'Without an account, progress stays in this browser.') + '</small></div>';
  }
  var p = Ac.profile, ins = p.role === 'instructor';
  return '<div class="acct"><b>' + K.esc(p.full_name) + '</b><small>' + (ins ? 'Instructor' : 'Learner') + (Ac.cohort ? ' · ' + K.esc(Ac.cohort) : '') + '</small>' +
    '<small class="sync" aria-live="polite">' + syncText() + '</small><span class="acts"><a href="#account">Account</a>' +
    (ins ? '<label class="edtog"><input type="checkbox" data-act="edit"' + (App.edit ? ' checked' : '') + '> Edit course text</label>' : '') + '</span></div>';
};
function syncText() { return Ac.sync === 'saving' ? 'Saving…' : Ac.sync === 'error' ? 'Not saved to your account yet (retrying on next change)' : Ac.sync === 'saved' ? 'Saved to your account' : ''; }
Ac.on(function () { var s = document.querySelector('.acct .sync'); if (s) s.textContent = syncText(); });
document.getElementById('rail').addEventListener('change', function (e) { var t = e.target; if (t && t.getAttribute && t.getAttribute('data-act') === 'edit') App.setEdit(t.checked); });

App.homeBanner = function () {
  var mods = App.mods_sorted(), done = mods.filter(function (m) { return App.prog.done[m.id]; }).length;
  if (!Ac.session) return '<div class="callout key"><b>Taking this as part of a class?</b><p><a href="#account">Sign in or join</a> with the join code from your instructor to save progress across devices and share notes and answers with them. You can also use the whole course without an account.</p></div>';
  var nfb = (Ac.fb || []).length;
  return '<div class="callout key"><b>Welcome back' + (Ac.profile ? ', ' + K.esc(Ac.profile.full_name.split(' ')[0]) : '') + '</b><p>' + done + ' of ' + mods.length + ' modules marked complete.' + (nfb ? ' You have ' + nfb + ' instructor comment' + (nfb > 1 ? 's' : '') + ' on your answers: see <a href="#notes">My notes and answers</a>.' : '') + '</p></div>';
};

/* ---------- ask your instructor ---------- */
App.askBtn = function () {
  var old = document.getElementById('askbtn'); if (old) old.remove();
  if (!Ac.session || !Ac.tutor || Ac.isInstructor()) return;
  var a = document.createElement('a'); a.id = 'askbtn'; a.className = 'btn pri'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Ask your instructor';
  var m = App.byId[App.cur], num = String(Ac.tutor).replace(/\D/g, '');
  a.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent('Hello, this is ' + (Ac.profile ? Ac.profile.full_name : '') + ' (Prediction Models Course).\nPage: ' + (m ? m.title : App.cur) + ' ' + location.href.split('#')[0] + '#' + App.cur + '\nMy question: ');
  document.body.appendChild(a);
};

/* ---------- account page ---------- */
App.pageAccount = function () {
  var h = '<p class="eyebrow">Account</p><h1>' + (Ac.session ? 'Your account' : 'Sign in or join') + '</h1>';
  if (Ac.session && Ac.profile) {
    var p = Ac.profile;
    h += '<div class="card-plain"><p><b>' + K.esc(p.full_name) + '</b><br>' + K.esc(p.email) + '<br>' + (p.role === 'instructor' ? 'Instructor' : 'Learner') + (Ac.cohort ? ' · ' + K.esc(Ac.cohort) : '') + '</p><p class="note sync">' + syncText() + '</p>' +
      '<p><button type="button" class="btn" id="exp">Download my data</button> <button type="button" class="btn" id="so">Sign out</button></p></div>' +
      '<h3>Change password</h3><form id="pwf" class="form"><label>New password (at least 8 characters)<input type="password" id="npw" autocomplete="new-password" minlength="8" required></label><button class="btn" type="submit">Change password</button><p class="msg" id="pwm" role="status"></p></form>' +
      '<h3>What is stored</h3><p>Your name, email, module progress, quiz answers, notes, highlights and written answers are stored on a secure server so that they follow you across devices. Your instructor can read them. They are used for teaching only; using them for research would need ethics approval and your separate consent. To have your data removed, ask your instructor. If you forget your password, your instructor can set a temporary one.</p>';
    return { html: h, after: function (root) {
      root.querySelector('#exp').onclick = App.exportMine;
      root.querySelector('#so').onclick = function () { this.disabled = true; Ac.signOut().then(function () { location.hash = '#home'; }); };
      root.querySelector('#pwf').onsubmit = function (e) { e.preventDefault(); var m = root.querySelector('#pwm'); m.textContent = 'Changing…'; Ac.changePassword(root.querySelector('#npw').value).then(function (er) { m.textContent = er || 'Password changed.'; m.className = 'msg' + (er ? ' bad' : ' ok'); if (!er) root.querySelector('#npw').value = ''; }); };
    } };
  }
  if (Ac.session) h += '<p>Loading your profile…</p>';
  h += '<p class="lede">Accounts are for learners enrolled in a class. They save your progress across devices and let your instructor see your progress, notes and answers. The course works fully without one.</p>' +
    '<div class="tabs"><button type="button" class="tab on" data-t="in">Sign in</button><button type="button" class="tab" data-t="join">Join with a code</button></div>' +
    '<form id="inf" class="form"><label>Email<input type="email" id="e1" autocomplete="username" required></label><label>Password<input type="password" id="p1" autocomplete="current-password" required></label><button class="btn pri" type="submit">Sign in</button><p class="msg" id="m1" role="status"></p><p class="note">Forgotten your password? Ask your instructor for a temporary one.</p></form>' +
    '<form id="jnf" class="form" hidden><label>Join code from your instructor<input type="text" id="jc" autocomplete="off" autocapitalize="characters" required></label><p class="msg" id="jcm"></p><label>Full name<input type="text" id="fn" autocomplete="name" required></label><label>Email<input type="email" id="e2" autocomplete="email" required></label><label>Choose a password (at least 8 characters)<input type="password" id="p2" autocomplete="new-password" minlength="8" required></label>' +
    '<label class="chk"><input type="checkbox" id="cs"> <span>I understand that my name, email, progress, notes and written answers are stored on a secure server for teaching, that my instructor can read them, and that they are not used for research without separate ethics approval and my consent.</span></label><button class="btn pri" type="submit">Create account</button><p class="msg" id="m2" role="status"></p></form>';
  return { html: h, after: function (root) {
    var tabs = root.querySelectorAll('.tab'), fi = root.querySelector('#inf'), fj = root.querySelector('#jnf');
    Array.prototype.forEach.call(tabs, function (t) { t.onclick = function () { Array.prototype.forEach.call(tabs, function (x) { x.classList.toggle('on', x === t); }); var j = t.getAttribute('data-t') === 'join'; fi.hidden = j; fj.hidden = !j; }; });
    function msg(el, t, bad) { el.textContent = t || ''; el.className = 'msg' + (t ? (bad ? ' bad' : ' ok') : ''); }
    fi.onsubmit = function (e) { e.preventDefault(); var m = root.querySelector('#m1'), b = fi.querySelector('button'); b.disabled = true; msg(m, 'Signing in…'); Ac.signIn(root.querySelector('#e1').value, root.querySelector('#p1').value).then(function (er) { b.disabled = false; if (er) msg(m, er, true); }); };
    var jc = root.querySelector('#jc'), jm = root.querySelector('#jcm'), tmj;
    jc.addEventListener('input', function () { clearTimeout(tmj); tmj = setTimeout(function () { if (jc.value.trim().length < 3) return msg(jm, ''); Ac.checkCode(jc.value).then(function (n) { msg(jm, n ? 'Joining: ' + n : 'That code was not recognised.', !n); }); }, 400); });
    fj.onsubmit = function (e) { e.preventDefault(); var m = root.querySelector('#m2'), b = fj.querySelector('button.pri'); b.disabled = true; msg(m, 'Creating your account…');
      Ac.signUp({ joinCode: jc.value, fullName: root.querySelector('#fn').value, email: root.querySelector('#e2').value, password: root.querySelector('#p2').value, consent: root.querySelector('#cs').checked }).then(function (er) { b.disabled = false; if (er) msg(m, er, true); }); };
  } };
};

/* ---------- my notes and answers ---------- */
App.pageNotes = function () {
  var P = App.prog, h = '<p class="eyebrow">Your work</p><h1>My notes and answers</h1><p class="lede">Everything you have written or highlighted, by module. Edit anything here; changes are saved automatically.' + (Ac.session ? ' Your instructor can read these.' : ' They are stored in this browser. <a href="#account">Sign in</a> to keep them across devices.') + '</p>';
  var any = false, mods = App.mods_sorted();
  mods.forEach(function (m) {
    var notes = Object.keys(P.notes).filter(function (k) { return k.indexOf(m.id + '|b') === 0 && P.notes[k].t; });
    var hls = (P.hl[m.id] || []).filter(function (x) { return !x.d && !x.stale; });
    var ans = Object.keys(P.ans).filter(function (k) { return k.indexOf(m.id + '|t') === 0 && P.ans[k].t; });
    if (!notes.length && !hls.length && !ans.length) return; any = true;
    h += '<section class="sec mynotes" data-m="' + m.id + '"><h2><a href="#' + m.id + '">' + K.esc(m.title) + '</a></h2>';
    ans.forEach(function (k) { var i = +k.split('|t')[1], t = m.tasks[i]; h += '<div class="myans" data-ak="' + k + '"><label>Task ' + (i + 1) + (t ? '. ' + K.esc(t.title) : '') + ' <span class="sv"></span></label><textarea rows="4" maxlength="20000">' + K.esc(P.ans[k].t) + '</textarea><div class="fbs"></div></div>'; });
    notes.forEach(function (k) { var n = P.notes[k]; h += '<div class="note-card" data-nk="' + k + '">' + (n.q ? '<div class="nq">“' + K.esc(n.q.slice(0, 140)) + '”</div>' : '') + '<textarea rows="2" maxlength="4000">' + K.esc(n.t) + '</textarea><div class="nf"><span class="sv"></span><button type="button" class="btn sm" data-del>Delete note</button></div></div>'; });
    if (hls.length) h += '<h4>Highlights</h4><ul class="hllist">' + hls.map(function (x) { return '<li data-h="' + x.id + '"><mark class="hl">' + K.esc(x.q) + '</mark> <button type="button" class="btn sm ghost" data-rmh>Remove</button></li>'; }).join('') + '</ul>';
    h += '</section>';
  });
  if (!any) h += '<div class="callout key"><b>Nothing here yet</b><p>Select any text in a module and choose <i>Highlight</i> or <i>Note</i>, use <i>Note on this section</i>, or write your answer in the box under a case task. They will appear here.</p></div>';
  else h += '<p><button type="button" class="btn" id="mdx">Download as Markdown</button> <button type="button" class="btn" id="cpx">Copy as text</button></p>';
  return { html: h, after: function (root) {
    function md() {
      var o = ['# My notes and answers', '', 'Prediction Models Course · exported ' + new Date().toLocaleDateString(), ''];
      mods.forEach(function (m) {
        var lines = [];
        Object.keys(P.ans).filter(function (k) { return k.indexOf(m.id + '|t') === 0 && P.ans[k].t; }).forEach(function (k) { var i = +k.split('|t')[1]; lines.push('**Task ' + (i + 1) + (m.tasks[i] ? ': ' + m.tasks[i].title : '') + '**', '', P.ans[k].t, ''); });
        Object.keys(P.notes).filter(function (k) { return k.indexOf(m.id + '|b') === 0 && P.notes[k].t; }).forEach(function (k) { var n = P.notes[k]; lines.push((n.q ? '> ' + n.q.slice(0, 200) + '\n\n' : '') + n.t, ''); });
        (P.hl[m.id] || []).filter(function (x) { return !x.d && !x.stale; }).forEach(function (x) { lines.push('- Highlight: ' + x.q); });
        if (lines.length) o.push('## ' + m.title, '', lines.join('\n'), '');
      });
      return o.join('\n');
    }
    var d = root.querySelector('#mdx'); if (d) d.onclick = function () { K.download('my-notes-and-answers.md', md(), 'text/markdown'); };
    var c = root.querySelector('#cpx'); if (c) c.onclick = function () { K.copy(md(), c); };
    Array.prototype.forEach.call(root.querySelectorAll('.myans'), function (d) {
      var key = d.getAttribute('data-ak'), ta = d.querySelector('textarea'), sv = d.querySelector('.sv'), tm; App.showFeedback(d.querySelector('.fbs'), key);
      ta.addEventListener('input', function () { sv.textContent = 'Saving…'; clearTimeout(tm); tm = setTimeout(function () { P.ans[key] = { t: ta.value, at: Date.now() }; App.save(); sv.textContent = 'Saved'; }, 700); });
    });
    Array.prototype.forEach.call(root.querySelectorAll('.note-card'), function (c) {
      var key = c.getAttribute('data-nk'), ta = c.querySelector('textarea'), sv = c.querySelector('.sv'), tm;
      ta.addEventListener('input', function () { sv.textContent = 'Saving…'; clearTimeout(tm); tm = setTimeout(function () { var n = P.notes[key] || {}; n.t = ta.value; n.at = Date.now(); P.notes[key] = n; App.save(); sv.textContent = 'Saved'; }, 600); });
      c.querySelector('[data-del]').onclick = function () { var n = P.notes[key]; if (n) { n.t = ''; n.at = Date.now(); App.save(); } App.route(true); };
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-rmh]'), function (b) { b.onclick = function () { var li = b.closest('li'), id = li.getAttribute('data-h'), m = b.closest('.mynotes').getAttribute('data-m'); (P.hl[m] || []).forEach(function (x) { if (x.id === id) { x.d = 1; x.at = Date.now(); } }); App.save(); App.route(true); }; });
  } };
};

/* ---------- how to use ---------- */
App.pageHowto = function () {
  var ins = App.acct.isInstructor();
  var h = '<h1>How to use CliPr</h1><p class="lead">A short guide to working through the course, keeping your own notes, and, for instructors, running a class.</p>';
  h += '<h2>Working through the course</h2><ol class="steps">' +
    '<li><b>Choose a starting point.</b> The primer covers odds, regression, test accuracy and sampling variability; skip it if you are comfortable with these. Modules 1 to 10 cover development, modules 11 to 15 validation and use, and the capstone brings everything together on a preterm birth model.</li>' +
    '<li><b>Read the module, then play with it.</b> Each module explains the idea, shows the formula and a worked example, and has simulators that let you change sample size, missing data, selection or shrinkage and see the effect.</li>' +
    '<li><b>Answer the quiz before the explanations.</b> Pick an answer; the explanation appears straight after. Your first attempt is recorded separately from later ones, so you can see what you knew before the feedback.</li>' +
    '<li><b>Try the three case tasks.</b> Write your own answer in the box under each task, then compare it with the worked answer at the end of the module.</li>' +
    '<li><b>Mark the module complete</b> when you are done, then use the Mastery check, a mixed quiz drawn from every unlocked module, to find the modules to revisit.</li></ol>';
  h += '<h2>Tools for study</h2><ul>' +
    '<li><b>Datasets</b> holds synthetic preterm birth, neonatal sepsis and gestational diabetes data with codebooks, as CSV downloads. They describe no real person.</li>' +
    '<li><b>Glossary, formula sheet, seven-step checklist and chapter map</b> are at the foot of the contents list.</li>' +
    '<li>The course runs in any modern browser, in light or dark mode, on a phone or a computer.</li></ul>';
  h += '<h2>Your account and your own notes</h2><p>The course works without an account, and then your progress stays in this browser only. If you are taking it as part of a class, open <a href="#account">Account</a>, choose Join with a code, and enter the code from your instructor. Your progress, notes and answers then follow you across devices, and your instructor can see them. Anything you did as a guest is merged into your account.</p>' +
    '<ul><li><b>Highlight.</b> Select any text in a module; a small bar offers Highlight, Note, and Remove highlight.</li>' +
    '<li><b>Note on a section.</b> Use the "Note on this section" link under a heading. Notes can be edited or deleted at any time.</li>' +
    '<li><b>Task answers.</b> Your written answers save automatically as you type. If your instructor replies, the feedback appears under your answer.</li>' +
    '<li><b>My notes and answers</b> collects all of it in one place, with options to copy it or download it as a Markdown file.</li>' +
    '<li><b>Ask your instructor</b> opens a WhatsApp message to your instructor, if one has been set up for your class.</li></ul>';
  h += '<p>The small status line under your name shows whether your work has been saved to your account. If it says a save is pending, it will retry on your next change.</p>';
  if (ins) {
    h += '<h2>For instructors</h2><ul>' +
      '<li><b>Class dashboard</b> has six tabs. Class shows the roster, the concept mastery grid and CSV downloads. Questions lists the questions learners miss most on their first attempt. Learners opens one learner: their modules, written answers (where you can leave feedback), notes, and a temporary password if they are locked out.</li>' +
      '<li><b>Release</b> hides a module or sets the date it opens. Hidden or not-yet-open modules are also left out of learners’ mastery check.</li>' +
      '<li><b>Edit course text.</b> Tick the box in the contents panel, click into any paragraph, list item or heading, change it, and Save. The edit is published to every learner at once. Revert this page restores the original. Edits to text that was later changed in a new version of the course are flagged as outdated under Course text.</li>' +
      '<li><b>Setup</b> is where join codes are created or switched off, and where the WhatsApp number for Ask your instructor is set.</li></ul>' +
      '<p>Learner data are for teaching only. Using them for research needs ethics approval and separate consent.</p>';
  }
  h += '<h2>About the data</h2><p>All datasets and patients in the course are synthetic. Accounts store your name, email, progress, notes and written answers on a secure server so that you and your instructor can see them. They are not used for research without separate ethics approval and your consent.</p>';
  return { html: h };
};
