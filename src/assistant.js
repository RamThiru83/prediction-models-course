/* ===== Clippy, the study assistant =====
   Ported from the EpiCompass study assistant (Kenny). A floating button opens a chat about the page; the selection
   toolbar (src/learn.js) adds "Explain this", "Give an example", … for a selected passage.
   Signed-in learners use Clippy on the course's Claude API credit: questions go to the Supabase Edge Function "clippy"
   (supabase/functions/clippy), which holds the Anthropic key, applies the daily limit and the monthly budget, and
   streams the reply (Claude Haiku first, Claude Sonnet when the learner is struggling). Nothing typed or replied is stored.
   The learner's own OpenRouter account is the backup: the key is obtained with OpenRouter's OAuth (PKCE) flow and kept
   in this browser only, and those requests go straight from the browser to OpenRouter.
   With the learner's consent, only WHERE they asked (module, step, button, selected course passage) is recorded. */
(function () {
  var API = 'https://openrouter.ai/api/v1';
  var K_KEY = 'pmc.or.key', K_PLAN = 'pmc.or.plan', K_PKCE = 'pmc.or.pkce';

  /* ---------- models (as EpiCompass models.ts) ----------
     In order of preference. OpenRouter tries each in turn if one is busy or withdrawn, so a learner never has to choose
     a model. Edit these lists when OpenRouter's catalogue changes (free models come and go every few weeks):
     https://openrouter.ai/models?max_price=0 . Chosen by a blinded comparison of ten course requests (November 2026). */
  var FREE_MODELS = [
    'nvidia/nemotron-3-ultra-550b-a55b:free', // best in the blinded EpiCompass trial, Nov 2026 (overall 4.74/5, 10 of 10 answered)
    'google/gemma-4-31b-it:free',             // strong benchmarks; often rate-limited upstream (0 of 10 in the trial)
    'google/gemma-4-26b-a4b-it:free',
    'dots-studio/dots-3-note-preview:free'    // last resort: 4.23/5, 9 of 10; once gave a Practise answer away
  ];
  /* for learners who add a little credit (about US$0.00005 a question); falls back to the free models */
  var LOW_COST_MODELS = ['qwen/qwen3.5-9b'];
  var PLAN_LABEL = { 'free': 'Free models (NVIDIA Nemotron, Google Gemma)', 'low-cost': 'Low-cost model (Qwen3.5 9B)' };
  var PLAN_TEXT = {
    'free': 'No payment needed. A free OpenRouter account allows <b>50 questions a day</b> (1,000 a day once the account has ever bought US$10 of credit). The free models are run by providers that may keep questions for a while, so do not type personal information.',
    'low-cost': 'Needs a little credit on your OpenRouter account. A question costs about US$0.00005, so US$1 lasts many thousands of questions. Questions to Qwen go only to providers that do not store them. If Qwen is unavailable or your credit runs out, Clippy switches to the free models for that question.'
  };
  var HISTORY = 8; // turns of conversation sent back to the model

  var ls = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- OpenRouter connection (as EpiCompass openrouter.ts) ---------- */
  function chosenPlan() { var v = ls.get(K_PLAN); return v === 'low-cost' || v === 'free' ? v : null; }
  var OR = { key: ls.get(K_KEY), plan: chosenPlan() || 'free', connecting: false, error: null };
  var subs = [];
  function setOR(p) { Object.keys(p).forEach(function (k) { OR[k] = p[k]; }); subs.forEach(function (f) { try { f(); } catch (e) { if (window.console) console.error(e); } }); }
  function setPlan(plan) { ls.set(K_PLAN, plan); setOR({ plan: plan }); }
  function disconnect() { ls.set(K_KEY, null); if (S) { S.info = null; S.model = ''; } setOR({ key: null, error: null }); }
  /* a 401 only disconnects the key it was sent with (a key pasted meanwhile is kept) */
  function expired(key) { if (OR.key !== key) return; disconnect(); setOR({ error: 'Your OpenRouter connection has expired or was removed. Please connect again.' }); }
  /* fallback for learners who already have a key: paste it instead of connecting */
  function pasteKey(key) {
    var k = String(key || '').trim();
    if (!/^sk-or-/.test(k)) return 'That does not look like an OpenRouter key (it should start with sk-or-).';
    ls.set(K_KEY, k); setOR({ key: k, error: null }); keyInfo(); return null;
  }
  function b64url(b) { var u = new Uint8Array(b), s = '', i; for (i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function randomString(n) { return b64url(crypto.getRandomValues(new Uint8Array(n || 48))); }
  function callbackUrl() { return location.origin + location.pathname; }

  /* Step 1: send the learner to OpenRouter to sign in (or sign up) and approve CliPr. CliPr uses #hash routes, which
     OpenRouter does not return, so the hash is saved and restored by finishConnect. */
  function connect() {
    var verifier = randomString(), state = randomString(16);
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)).then(function (d) {
      var challenge = b64url(d);
      try { sessionStorage.setItem(K_PKCE, JSON.stringify({ verifier: verifier, state: state, back: location.hash || '#home' })); } catch (e) { /* ignore */ }
      var q = new URLSearchParams({ callback_url: callbackUrl(), code_challenge: challenge, code_challenge_method: 'S256', state: state, key_label: 'CliPr – Clippy study assistant' });
      location.assign('https://openrouter.ai/auth?' + q);
    }, function () { setOR({ error: 'This browser cannot start the secure connection. Paste a key instead (see Account).' }); });
  }
  /* Step 2, on return: exchange the one-time code for the learner's key. Returns the hash to go back to. */
  function finishConnect() {
    var q = new URLSearchParams(location.search), code = q.get('code');
    if (!code) return Promise.resolve(null);
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(K_PKCE) || 'null'); sessionStorage.removeItem(K_PKCE); } catch (e) { /* ignore */ }
    if (saved && (typeof saved !== 'object' || typeof saved.verifier !== 'string' || typeof saved.state !== 'string')) saved = null;
    // only an in-app #route is restored; the ?code= (and anything else in the query) leaves the address bar and history
    var back = saved && typeof saved.back === 'string' && /^#[A-Za-z0-9_\-]{0,40}$/.test(saved.back) ? saved.back : '#home';
    if (saved) saved.back = back;
    try { history.replaceState(null, '', location.pathname + (saved ? back : (/^#[A-Za-z0-9_\-]{0,40}$/.test(location.hash) ? location.hash : ''))); } catch (e) { /* ignore */ }
    if (!saved || (q.get('state') && q.get('state') !== saved.state)) { setOR({ error: 'The connection could not be verified. Please try connecting again.' }); return Promise.resolve(saved ? saved.back : null); }
    setOR({ connecting: true, error: null });
    return fetch(API + '/auth/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code, code_verifier: saved.verifier, code_challenge_method: 'S256' }) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || !j.key) throw new Error((j && j.error && j.error.message) || ('OpenRouter returned ' + r.status));
          ls.set(K_KEY, j.key); setOR({ key: j.key, connecting: false }); keyInfo();
        });
      })
      .catch(function (e) { setOR({ connecting: false, error: 'Connecting to OpenRouter failed: ' + e.message + '. Please try again.' }); })
      .then(function () { return saved.back; });
  }
  /* free-question allowance and credit, for the quota line in the chat */
  function keyInfo() {
    var key = OR.key; if (!key) return Promise.resolve(null);
    return fetch(API + '/key', { headers: { Authorization: 'Bearer ' + key } }).then(function (r) {
      if (r.status === 401) { expired(key); return null; }
      if (OR.key !== key) return null;
      return r.json().then(function (j) {
        var d = j && j.data; if (!d) return null;
        // no choice made in settings: an account that has bought credit uses Qwen; one that has not uses the free models
        if (!chosenPlan()) { var auto = d.is_free_tier ? 'free' : 'low-cost'; if (auto !== OR.plan) setOR({ plan: auto }); }
        var f = d.free_model_daily_requests || {};
        return { freeTier: !!d.is_free_tier, freeLeft: f.remaining != null ? f.remaining : null, freeLimit: f.limit != null ? f.limit : null, creditLeft: d.limit_remaining != null ? d.limit_remaining : null };
      });
    }).catch(function () { return null; });
  }
  function AErr(msg, kind) { var e = new Error(msg); e.kind = kind; e.assistant = true; return e; }

  /* Stream a reply. onText receives the reply so far. If a model returns nothing (some free models spend their whole
     allowance "thinking"), it is retried once with the remaining models. */
  function chat(messages, onText, signal) {
    if (!OR.key) return Promise.reject(AErr('Not connected', 'auth'));
    if (OR.plan === 'low-cost') {
      // Qwen on its own, so the "no data storage" filter can apply; any failure falls back to the free models
      return once(LOW_COST_MODELS, messages, onText, signal).then(function (r) { return r.text.trim() ? r : null; }, function (e) {
        if (e.assistant && e.kind === 'auth') throw e; if (e.name === 'AbortError') throw e; return null;
      }).then(function (r) { if (r) return r; onText(''); return freeChain(messages, onText, signal); });
    }
    return freeChain(messages, onText, signal);
  }
  function freeChain(messages, onText, signal) {
    // OpenRouter accepts at most 3 models per request; a second try uses the ones not tried yet
    var first = FREE_MODELS.slice(0, 3), second = FREE_MODELS.slice(3);
    return once(first, messages, onText, signal).then(function (r) {
      if (r.text.trim()) return r;
      var retry = first.filter(function (m) { return m !== r.model && m !== r.model + ':free'; }).concat(second).slice(0, 3);
      return retry.length ? once(retry, messages, onText, signal) : r;
    }, function (e) {
      if (e.assistant && e.kind === 'busy' && second.length) return once(second, messages, onText, signal);
      throw e;
    });
  }
  function once(models, messages, onText, signal) {
    var paidOnly = models.every(function (m) { return !/:free$/.test(m); });
    var body = {
      models: models, messages: messages, stream: true, temperature: 0.3, max_tokens: 3000,
      // "Thinking" can use up the whole allowance and leave no answer. Qwen3.5 thinks at length even on low effort, so it
      // is switched off there; for the free models it is kept short and out of the reply.
      reasoning: paidOnly ? { enabled: false } : { effort: 'low', exclude: true }
    };
    // paid models can avoid providers that store prompts; the free ones are only offered by such providers
    if (paidOnly) body.provider = { data_collection: 'deny' };
    var key = OR.key;
    return fetch(API + '/chat/completions', {
      method: 'POST', signal: signal,
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', 'HTTP-Referer': callbackUrl(), 'X-OpenRouter-Title': 'CliPr', 'X-Title': 'CliPr' },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok || !r.body) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          var m = (j && j.error && j.error.message) || '', raw = JSON.stringify((j && j.error && j.error.metadata) || {});
          if (r.status === 401) { expired(key); throw AErr('Your OpenRouter connection has expired or was removed. Please connect again.', 'auth'); }
          if (r.status === 429 && /upstream|provider/i.test(m + raw)) throw AErr('The free AI models are busy just now. Please try again in a minute.', 'busy');
          if (r.status === 429) throw AErr('You have reached OpenRouter’s limit for free questions for now (20 a minute, and 50 a day on a free account). Try again later, or tomorrow.', 'quota');
          if (r.status === 402) throw AErr('Your OpenRouter account needs credit for this model. Switch to the free models on the Account page, or add credit at openrouter.ai.', 'credit');
          if (r.status >= 500) throw AErr('The AI models are busy just now. Please try again in a minute.', 'busy');
          throw AErr(m || 'OpenRouter returned an error (' + r.status + ').', 'other');
        });
      }
      var reader = r.body.getReader(), dec = new TextDecoder(), buf = '', text = '', model = '', cut = false, stop = false;
      function line(ln) {
        ln = ln.trim(); if (ln.indexOf('data:') !== 0) return;
        var data = ln.slice(5).trim(); if (data === '[DONE]') { stop = true; return; }
        var j; try { j = JSON.parse(data); } catch (e) { return; }
        if (!j || typeof j !== 'object') return;
        if (typeof j.model === 'string') model = j.model.slice(0, 80);
        var c = j.choices && j.choices[0];
        if (j.error || (c && c.finish_reason === 'error')) { if (!text) throw AErr('The AI model stopped with an error. Please try again in a minute.', 'busy'); cut = true; stop = true; return; }
        var d = c && c.delta && c.delta.content; if (typeof d === 'string' && d) { text += d; onText(text); }
        if (c && c.finish_reason === 'length') cut = true;
      }
      function release() { try { reader.cancel().catch(function () { /* already closed or aborted */ }); } catch (e) { /* ignore */ } }
      function pump() {
        return reader.read().then(function (x) {
          if (!x.done) buf += dec.decode(x.value, { stream: true }); else buf += dec.decode();
          var i;
          while (!stop && (i = buf.indexOf('\n')) >= 0) { var ln = buf.slice(0, i); buf = buf.slice(i + 1); line(ln); }
          if (x.done && !stop && buf) { line(buf); buf = ''; }
          if (x.done || stop) { if (!x.done) release(); return { text: text, model: model, cut: cut }; }
          return pump();
        });
      }
      return pump().catch(function (e) { release(); throw e; });
    });
  }

  /* ---------- the course account (as EpiCompass course.ts) ---------- */
  var FN = (PMC.url || '') + '/functions/v1/clippy', K_SRC = 'pmc.clippy.source';
  var CR = { checked: false, enabled: false, daily: null, left: null, source: ls.get(K_SRC) === 'openrouter' ? 'openrouter' : 'course' };
  function setSource(v) { CR.source = v === 'openrouter' ? 'openrouter' : 'course'; ls.set(K_SRC, CR.source); S.model = ''; setOR({}); }
  function signedIn() { return !!(Ac.session && Ac.session.access_token); }
  /* Clippy uses the course account when it is switched on, the learner is signed in and has not chosen OpenRouter
     (or has chosen OpenRouter but has not connected it). */
  function useCourse() { return CR.enabled && signedIn() && (CR.source === 'course' || !OR.key); }
  function ready() { return useCourse() || !!OR.key; }
  function checkCourse() {
    if (!PMC.url || !PMC.key) { CR.checked = true; return Promise.resolve(); }
    return fetch(FN, { headers: { apikey: PMC.key } }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (j) {
      CR.checked = true; CR.enabled = !!(j && j.enabled); CR.daily = (j && j.daily) || null; setOR({}); if (CR.enabled) courseLeft();
    });
  }
  function courseLeft() {
    if (!CR.daily || !signedIn()) { CR.left = null; return Promise.resolve(null); }
    return SB.rpc('pmc_clippy_left', { daily_limit: CR.daily }).then(function (n) { CR.left = typeof n === 'number' ? n : null; renderFoot(); return CR.left; }, function () { return null; });
  }
  /* Has the learner not followed an earlier explanation? True when Clippy has already answered in this conversation
     and the new message says so, or repeats a question or a quick action on the same passage. */
  var CONFUSED = /\b(don'?t|do not|didn'?t|did not|still( don'?t| not)?|can'?t|cannot)\b.{0,25}\b(get|understand|follow|see|clear)|\bconfus|\bnot clear|\bunclear|\blost\b|\bsimpler|\bexplain (it )?(again|differently|another way)|\banother way|\bwhat do you mean|\bi'?m not sure|\bhuh\b|\bsorry\??$/i;
  function isStruggling(history) {
    var users = history.filter(function (t) { return t.role === 'user'; });
    if (!history.some(function (t) { return t.role === 'assistant'; }) || users.length < 2) return false;
    var last = users[users.length - 1], prev = users[users.length - 2];
    if (CONFUSED.test(last.label || last.content)) return true;
    if (last.excerpt && last.excerpt === prev.excerpt && last.label === prev.label) return true;
    var norm = function (t) { return String(t.label || '').trim().toLowerCase(); };
    return norm(last) !== '' && norm(last) === norm(prev);
  }
  function courseChat(messages, struggling, onText, signal) {
    return SB.token().then(function (tok) {
      if (!tok) throw AErr('Please sign in to use Clippy on the course account.', 'auth');
      var system = messages[0].role === 'system' ? messages[0].content : '';
      var rest = messages.filter(function (m) { return m.role !== 'system'; }).map(function (m) { return { role: m.role, content: String(m.content).slice(0, 6000) }; });
      while (rest.length && rest[0].role !== 'user') rest.shift(); // the conversation must start with the learner
      return fetch(FN, { method: 'POST', signal: signal, headers: { Authorization: 'Bearer ' + tok, apikey: PMC.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ system: system, messages: rest, struggling: !!struggling }) });
    }).then(function (r) {
      if (!r.ok || !r.body) return r.json().catch(function () { return {}; }).then(function (j) {
        if (j.error === 'unavailable') { CR.enabled = false; setOR({}); }
        if (j.error === 'quota') CR.left = 0;
        throw AErr(j.message || 'Clippy could not answer (error ' + r.status + '). Please try again.', j.error === 'auth' ? 'course-auth' : j.error || 'other');
      });
      var reader = r.body.getReader(), dec = new TextDecoder(), buf = '', text = '', model = '', left = null;
      function pump() {
        return reader.read().then(function (x) {
          if (x.done) return { text: text, model: model, left: left };
          buf += dec.decode(x.value, { stream: true });
          var i;
          while ((i = buf.indexOf('\n\n')) >= 0) {
            var line = buf.slice(0, i).trim(); buf = buf.slice(i + 2);
            if (line.indexOf('data:') !== 0) continue;
            var j; try { j = JSON.parse(line.slice(5)); } catch (e) { continue; }
            if (typeof j.t === 'string') { text = j.t; onText(text); }
            if (j.error && !text) throw AErr(j.message || 'Clippy stopped part-way. Please try again.', 'busy');
            if (j.done) { model = j.model || ''; left = typeof j.left === 'number' ? j.left : null; }
          }
          return pump();
        });
      }
      return pump().then(function (res) { if (res.left !== null) CR.left = res.left; return res; }, function (e) { try { reader.cancel().catch(function () { /* closed */ }); } catch (x) { /* ignore */ } throw e; });
    });
  }
  function modelName(m) { return /haiku/i.test(m) ? 'Claude Haiku' : /sonnet/i.test(m) ? 'Claude Sonnet' : /opus/i.test(m) ? 'Claude Opus' : String(m || '').replace(/:free$/, ''); }

  /* ---------- instructions and course material (as EpiCompass prompt.ts) ---------- */
  var ACTIONS = [['explain', 'Explain this'], ['example', 'Give an example'], ['why', 'Why does it matter?'], ['quiz', 'Quiz me on this']];
  var ACTION_LABEL = {}; ACTIONS.forEach(function (a) { ACTION_LABEL[a[0]] = a[1]; });
  var RULES = 'You are Clippy, the study assistant in CliPr, a self-paced course on developing and validating clinical prediction models for MSc and PhD clinical researchers in India. The course follows E. W. Steyerberg, "Clinical Prediction Models: A Practical Approach to Development, Validation, and Updating" (2009), chapters 1 to 19. The course instructor is Dr Ramachandran Thiruvengadam. Throughout the course the learner follows a fictional district hospital maternity team that develops and validates a model for preterm birth, using synthetic data.\n\n' +
    'How to answer:\n' +
    '- Base your answer on the COURSE MATERIAL below. If it does not cover the question, say so in one line, then answer briefly from standard clinical prediction modelling and say that this goes beyond the module.\n' +
    '- The BOOK NOTES summarise how the course textbook treats this module\'s concepts. Use them silently to make sure every definition, term, formula and claim you give agrees with the book. Do not recite the notes, quote the book, or claim to quote it, and do not mention the book in a first explanation unless asked.\n' +
    '- Explain from the module first. If the learner then says they still do not understand, asks the same thing again, or answers wrongly, explain it a different way using "Another way to explain it" in the notes, and point them to the chapter and section given in "Where to read in the book". Never give page numbers.\n' +
    '- If the module and the book notes differ, follow the book notes, say briefly that the textbook puts it slightly differently, and suggest the learner mention it to the instructor.\n' +
    '- Be accurate. If you are not sure, say so plainly and suggest the learner use "Ask your instructor". Never invent references, studies, statistics or quotations.\n' +
    '- The hospital, the team, the patients and the datasets in the course are fictional and synthetic. Make examples hypothetical and say so ("Imagine a district hospital where…"). Do not state facts about real programmes, studies, institutions or people unless the course material states them.\n' +
    '- Be brief: at most about 180 words unless the learner asks for more. Use short paragraphs or a short list. Use British spelling.\n' +
    '- Teach rather than tell: where it helps, end with one short question that makes the learner think.\n' +
    '- Do not carry out numerical calculations beyond what the module itself shows. Explain the formula and what goes into it, and let the learner calculate.\n' +
    '- For a case task, give a hint or the next step, never the final worked answer (the module has worked answers for that).\n' +
    '- Never answer or discuss the module\'s Quiz questions or the Mastery check questions.\n' +
    '- Write formulas in plain text (for example: logit(p) = b0 + b1 × age), not LaTeX. Use **bold** sparingly; do not use tables or HTML.\n' +
    '- Stay on prediction models, research methods and this course. Politely decline anything else (essays, assignments for other courses, unrelated topics).\n' +
    '- Do not ask for or repeat personal information about the learner or anyone else.';
  function clip(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n) + ' …' : s; }
  function htmlText(h) { var d = document.createElement('template'); d.innerHTML = String(h || '').replace(/<\/(p|li|h\d|div)>/gi, '$&\n'); return d.content.textContent.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim(); }
  function modName(m) { return m.num === 0 ? 'Primer' : typeof m.num === 'number' ? 'Module ' + m.num : String(m.num); }
  function systemPrompt(vis, notes) {
    var m = S.mod;
    if (!m) return RULES + '\n\nCOURSE MATERIAL (the page the learner is on):\n' + (vis ? clip(vis, 5000) : '(This page holds the learner\'s own account, notes or class records, so its content is not shared. Answer from standard clinical prediction modelling and this course.)');
    if (App.lockInfo && App.lockInfo(m)) return RULES + '\n\nCOURSE MATERIAL\n' + modName(m) + ': ' + m.title + '. This module is not open to the learner yet, so its content is not shared. Suggest they come back when it opens.';
    var st = S.stepLabel || 'module';
    return RULES + '\n\nCOURSE MATERIAL\n' + modName(m) + ': ' + m.title + '. The learner is on the ' + st + ' step.\n\n' +
      'The module\'s essentials:\n' + clip(htmlText(m.essentials), 3000) + '\n\n' +
      'What the learner can see now (' + st + ' step):\n' + clip(vis, 5000) + (notes || '');
  }
  function actionPrompt(action, excerpt) {
    var q = '"' + clip(String(excerpt).trim(), 1200) + '"';
    switch (action) {
      case 'explain': return 'Explain this passage in plain words, then state its key idea in one sentence:\n' + q;
      case 'example': return 'Give one short, concrete, hypothetical example set in clinical or public-health practice in India that illustrates this passage. Say that it is hypothetical, and that any numbers are made up:\n' + q;
      case 'why': return 'Why does the idea in this passage matter for someone developing or validating a clinical prediction model? Give two or three points:\n' + q;
      case 'quiz': return 'Ask me one question that tests whether I have understood this passage. Wait for my answer before giving feedback, and do not reuse the module\'s Quiz questions:\n' + q;
    }
    return q;
  }
  function questionPrompt(question, excerpt) { return excerpt ? 'About this passage: "' + clip(excerpt.trim(), 1200) + '"\n\n' + question.trim() : question.trim(); }
  /* Book notes for the module (App.BOOKNOTES, from content/booknotes.js when present). The re-teaching material and the
     reading pointer are included only once Clippy has already answered in this conversation, so a first explanation
     comes from the module. */
  function bookNotes(modId, followUp) {
    var all = App.BOOKNOTES, list = all && modId && all[modId];
    if (!list || !list.length) return '';
    var arr = function (x) { return Array.isArray(x) ? x : (x ? [String(x)] : []); };
    var parts = [];
    list.forEach(function (n) {
      if (!n || typeof n !== 'object') return;
      var lines = ['## ' + (n.title || modId), 'Key terms: ' + arr(n.terms).join(' | '), 'The book\'s account: ' + (n.core || ''), 'The book\'s emphases: ' + arr(n.positions).join(' | ')];
      if (n.notation) lines.push('Notation: ' + n.notation);
      lines.push('Common misreadings and corrections: ' + arr(n.misreadings).join(' | '));
      if (followUp) lines.push('Another way to explain it: ' + (n.reteach || ''), 'Where to read in the book: ' + (n.where || ''));
      parts.push(lines.join('\n'));
    });
    return parts.length ? '\n\nBOOK NOTES (paraphrased from Steyerberg, Clinical Prediction Models, 2009; background for accuracy)\n' + parts.join('\n\n') : '';
  }

  /* ---------- opt-in insights (as EpiCompass insights.ts) ---------- */
  var C = { uid: null, avail: false, at: null };
  var Ac = App.acct;
  function loadConsent() {
    var uid = Ac.session && Ac.profile ? Ac.session.user.id : null;
    if (uid === C.uid) return; C.uid = uid; C.avail = false; C.at = null;
    if (!uid) { redrawSettings(); return; }
    SB.get('/rest/v1/profiles?id=eq.' + uid + '&select=pmc_insights_consent_at').then(function (r) {
      if (C.uid !== uid) return; C.avail = true; C.at = (r && r[0] && r[0].pmc_insights_consent_at) || null; redrawSettings();
    }, function () { /* column not created yet: the consent row stays hidden */ });
  }
  function insightsOn() { return !!(Ac.session && Ac.session.user && Ac.session.user.id === C.uid && C.avail && C.at); }
  function setConsent(on) {
    return SB.rpc('pmc_set_insights_consent', { on_: on }).then(function (t) { C.at = t || null; return null; }, function (e) {
      if (e.status === 404 || /function|does not exist|schema cache/i.test(e.message)) { C.avail = false; return null; }
      return 'Could not save: ' + e.message;
    });
  }
  function logAsk(action, excerpt) {
    if (!insightsOn()) return;
    try {
      SB.insert('pmc_assistant_asks', { module_id: String(S.mod ? S.mod.id : 'page:' + App.cur).slice(0, 40), step: S.step ? String(S.step).slice(0, 40) : null, action: action, excerpt: excerpt ? String(excerpt).trim().slice(0, 400) : null })
        .then(function () { /* best effort */ }, function () { /* best effort */ });
    } catch (e) { /* best effort */ }
  }

  /* ---------- page context (as EpiCompass context.ts) ---------- */
  var S = { open: false, turns: [], busy: false, excerpt: null, info: null, model: '', abort: null, gen: 0, page: null, mod: null, step: null, stepLabel: null };
  function newConversation() { S.gen++; if (S.abort) S.abort.abort(); S.abort = null; S.busy = false; S.turns = []; S.excerpt = null; }
  function setPage(id) { if (S.page !== id) { S.page = id; newConversation(); } }
  App.onStep = function (m, s) {
    setPage(m.id); S.mod = m; S.step = s.key; S.stepLabel = s.title ? s.label + ' (' + htmlText(s.title) + ')' : s.label;
    if (offReason() && S.abort) S.abort.abort();
    render();
  };
  function route() {
    var id = App.cur; setPage(id);
    if (!App.byId[id]) { S.mod = null; S.step = null; S.stepLabel = null; }
    else if (S.mod !== App.byId[id]) { S.mod = App.byId[id]; S.step = null; S.stepLabel = null; }
    if (offReason() && S.abort) S.abort.abort();
    document.body.classList.toggle('cl-ask', !!document.getElementById('askbtn'));
    render();
  }
  function offReason() { return App.cur === 'mastery' ? 'mastery' : (S.mod && S.step === 'quiz') ? 'quiz' : null; }
  /* Only course pages are sent as context, never the Account, My notes and answers or dashboard pages. Within a page,
     the learner's own answers and notes, instructor feedback and any quiz are left out. */
  var CTX_SKIP = '.myans, .note-card, .fbs, .fb, .secbar, .edbar, .q, #quizbox, .quizsec, .whysrc, .acctbox, form, input, textarea, select, button, script, style, noscript, template, .clpanel, .seltb';
  function coursePage(id) { return !!(App.byId[id] || (App.refs && App.refs[id]) || (App.EDIT_PAGES && App.EDIT_PAGES[id])); }
  function visibleText() {
    if (!coursePage(App.cur)) return '';
    var el = document.querySelector('#page .step:not([hidden])') || document.querySelector('#page .col');
    if (!el) return '';
    var out = [];
    (function walk(n) {
      if (n.nodeType === 3) { out.push(n.nodeValue.replace(/\s+/g, ' ')); return; }
      if (n.nodeType !== 1 || n.matches(CTX_SKIP)) return;
      var cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (n.tagName === 'BR') { out.push('\n'); return; }
      var block = !/^inline/.test(cs.display), kids = n.childNodes;
      if (n.tagName === 'DETAILS' && !n.open) kids = Array.prototype.filter.call(kids, function (k) { return k.tagName === 'SUMMARY'; });
      if (block) out.push('\n'); Array.prototype.forEach.call(kids, walk); if (block) out.push('\n');
    })(el);
    return out.join('').replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  /* text the learner has selected, if Clippy may be offered for it (used by the selection toolbar) */
  function selText(sel) {
    if (!sel || sel.isCollapsed || !sel.rangeCount || offReason()) return null;
    var text = sel.toString().trim(); if (text.length < 3 || text.length > 2000) return null;
    var BAD = '.clpanel, input, textarea, select, .q, .opt, .myans, .note-card, .fbs, .fb, .edbar, [contenteditable="true"]';
    var ends = [sel.anchorNode, sel.focusNode].map(function (n) { return n && (n.nodeType === 1 ? n : n.parentElement); });
    if (ends.some(function (n) { return !n || !n.closest('#page .col') || n.closest(BAD); })) return null;
    // a selection that runs across a quiz question, an answer box, a note or feedback keeps only the course text
    var r = sel.getRangeAt(0), col = ends[0].closest('#page .col');
    if (Array.prototype.some.call(col.querySelectorAll(BAD), function (e) { return r.intersectsNode(e); })) {
      var f = r.cloneContents(); Array.prototype.forEach.call(f.querySelectorAll(BAD + ', [hidden]'), function (e) { e.remove(); });
      text = (f.textContent || '').replace(/\s+/g, ' ').trim(); if (text.length < 3) return null;
    }
    return text;
  }

  /* ---------- safe, minimal Markdown: paragraphs, lists, bold, inline code; everything else escaped ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function inline(t) {
    var codes = [];
    t = esc(t).replace(/`([^`\n]+)`/g, function (_, c) { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    t = t.replace(/\*\*([^*\n][^\n]*?)\*\*/g, '<b>$1</b>');
    t = t.replace(/(^|[\s(])\*([^*\s][^*\n]*?)\*(?=[\s).,;:!?]|$)/g, '$1<i>$2</i>');
    return t.replace(/\u0000(\d+)\u0000/g, function (_, i) { return '<code>' + codes[+i] + '</code>'; });
  }
  function md(src) {
    var lines = String(src || '').replace(/[\r\u0000]/g, '').split('\n'), out = [], para = [], list = null;
    function flushP() { if (para.length) { out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; } }
    function flushL() { if (list) { out.push('<' + list.t + '>' + list.items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</' + list.t + '>'); list = null; } }
    lines.forEach(function (ln) {
      var u = /^\s*[-*•]\s+(.*)$/.exec(ln), o = /^\s*\d+[.)]\s+(.*)$/.exec(ln), h = /^\s*#{1,6}\s+(.*)$/.exec(ln);
      if (!ln.trim()) { flushP(); flushL(); return; }
      if (u || o) { flushP(); var t = u ? 'ul' : 'ol'; if (list && list.t !== t) flushL(); if (!list) list = { t: t, items: [] }; list.items.push((u || o)[1]); return; }
      if (list && /^\s{2,}\S/.test(ln)) { list.items[list.items.length - 1] += ' ' + ln.trim(); return; }
      flushL();
      if (h) { flushP(); out.push('<p><b>' + inline(h[1].replace(/\*\*/g, '')) + '</b></p>'); return; }
      para.push(ln.trim());
    });
    flushP(); flushL(); return out.join('');
  }

  /* ---------- the panel (as EpiCompass Assistant.tsx) ---------- */
  var SPARK = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M9 1.8c.5 3.7 1.9 5.6 5.8 6.4-3.9.8-5.3 2.7-5.8 6.4-.5-3.7-1.9-5.6-5.8-6.4 3.9-.8 5.3-2.7 5.8-6.4z" fill="currentColor"/><circle cx="15.6" cy="15.2" r="1.9" fill="currentColor" opacity=".75"/></svg>';
  var fab = null, panel = null, mode = null;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function build() {
    if (fab) return;
    fab = el('button', 'clfab', SPARK + '<span><b>Ask Clippy</b><span class="clfab-sub"> · your study assistant</span></span>');
    fab.type = 'button'; fab.setAttribute('aria-haspopup', 'dialog'); fab.setAttribute('aria-label', 'Ask Clippy, your study assistant');
    fab.addEventListener('click', function () { open(); });
    panel = el('div', 'clpanel');
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'cl-h'); panel.hidden = true;
    panel.innerHTML = '<div class="cl-head"><div><h2 id="cl-h">' + SPARK + 'Clippy</h2><span class="cl-hint">Your study assistant · AI, can make mistakes · the course text is the authority</span></div>' +
      '<button type="button" class="btn sm cl-close" aria-label="Close (Esc)">Close</button></div><div class="cl-body"></div><div class="cl-foot"><span class="cl-quota"></span><span class="cl-ask"></span></div>';
    panel.querySelector('.cl-close').onclick = close;
    document.body.appendChild(fab); document.body.appendChild(panel);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.open) close(); });
  }
  function open(d) {
    build(); S.open = true; render();
    if (d && d.excerpt && d.action && !S.busy) runAction(d.action, d.excerpt);
    else if (d && d.excerpt) { S.excerpt = d.excerpt; render(); }
    requestAnimationFrame(function () { var t = panel.querySelector('textarea') || panel.querySelector('.cl-body .btn') || panel.querySelector('.cl-close'); if (t) t.focus(); });
    refreshInfo();
  }
  function close() { S.open = false; if (S.abort) S.abort.abort(); render(); requestAnimationFrame(function () { if (fab) fab.focus(); }); }
  function refreshInfo() { if (useCourse()) { courseLeft(); return; } if (OR.key) keyInfo().then(function (i) { S.info = i; renderFoot(); }); }

  function render() {
    if (!fab) return;
    fab.hidden = S.open; panel.hidden = !S.open;
    if (!S.open) { mode = null; return; }
    var m = !ready() ? 'setup' + (CR.enabled ? ':signin' : '') : offReason() ? 'off:' + offReason() : 'chat';
    var body = panel.querySelector('.cl-body');
    if (m !== mode) {
      mode = m;
      if (m === 'setup:signin') {
        body.innerHTML = '<div class="cl-setup"><p>Clippy, your study assistant, answers questions about the page you are on. <b>Sign in to CliPr</b> and Clippy is ready: it runs on the course account, so there is nothing to set up or pay.</p>' +
          '<div class="cl-actions"><a href="#account" class="btn pri" data-c="signin">Sign in</a></div>' +
          '<p class="cl-hint">Prefer not to sign in? You can <button type="button" class="cl-link" data-c="connect">connect your own OpenRouter account</button> instead.</p><p class="cl-err" role="alert" hidden></p></div>';
        body.querySelector('[data-c="signin"]').onclick = function () { close(); };
        body.querySelector('[data-c="connect"]').onclick = function () { connect(); };
      } else if (m === 'setup') {
        body.innerHTML = '<div class="cl-setup"><p>Clippy, your study assistant, answers questions about the page you are on, using an AI model on <b>your own OpenRouter account</b>. A free account is enough: it gives 50 questions a day.</p>' +
          '<ol><li>Press <b>Connect OpenRouter</b>. Sign in, or create a free account, and approve CliPr.</li><li>You come straight back here, ready to ask.</li></ol>' +
          '<p class="cl-err" role="alert" hidden></p><div class="cl-actions"><button type="button" class="btn pri" data-c="connect">Connect OpenRouter</button><a href="#account" class="cl-link" data-c="more">More about Clippy</a></div>' +
          '<p class="cl-hint">Your key stays in this browser. CliPr never sees it or your conversations.</p></div>';
        body.querySelector('[data-c="connect"]').onclick = function () { connect(); };
        body.querySelector('[data-c="more"]').onclick = function (e) { e.preventDefault(); close(); if (location.hash !== '#account') location.hash = '#account'; setTimeout(function () { var h = document.getElementById('h-assistant'); if (h) h.scrollIntoView({ block: 'start' }); }, 300); };
      } else if (m === 'off:quiz') {
        body.innerHTML = '<div class="cl-setup"><p>Clippy is switched off during the <b>Quiz</b>, so that your answers show what you know. Clippy is back on the other steps.</p></div>';
      } else if (m === 'off:mastery') {
        body.innerHTML = '<div class="cl-setup"><p>Clippy is switched off during the <b>Mastery check</b>, so that your answers show what you know. Clippy is back on the other pages.</p></div>';
      } else {
        body.innerHTML = '<div class="cl-list" aria-live="polite"></div><form class="cl-form"><div class="cl-chip" hidden><span></span><button type="button" aria-label="Remove passage">×</button></div>' +
          '<textarea rows="2" placeholder="Your question…" aria-label="Your question to Clippy"></textarea><div class="cl-actions"><button class="btn pri" type="submit" data-c="ask">Ask</button><button type="button" class="btn" data-c="stop" hidden>Stop</button><button type="button" class="cl-link" data-c="new" hidden>New conversation</button></div></form>';
        var f = body.querySelector('form'), ta = f.querySelector('textarea');
        f.onsubmit = function (e) { e.preventDefault(); submit(); };
        ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } });
        ta.addEventListener('input', renderForm);
        f.querySelector('[data-c="stop"]').onclick = function () { if (S.abort) S.abort.abort(); };
        f.querySelector('[data-c="new"]').onclick = function () { newConversation(); renderList(); renderForm(); ta.focus(); };
        f.querySelector('.cl-chip button').onclick = function () { S.excerpt = null; renderForm(); ta.focus(); };
      }
    }
    if (m === 'setup') { var er = body.querySelector('.cl-err'); er.hidden = !OR.error; er.textContent = OR.error || ''; var cb = body.querySelector('[data-c="connect"]'); cb.disabled = OR.connecting; cb.textContent = OR.connecting ? 'Connecting…' : 'Connect OpenRouter'; }
    if (m === 'setup:signin') { var er2 = body.querySelector('.cl-err'); er2.hidden = !OR.error; er2.textContent = OR.error || ''; }
    if (m === 'chat') { renderList(); renderForm(); }
    renderFoot();
  }
  function turnHtml(t) {
    if (t.role === 'user') return '<div class="cl-msg me">' + (t.excerpt ? '<blockquote>' + esc(t.excerpt.length > 220 ? t.excerpt.slice(0, 220) + '…' : t.excerpt) + '</blockquote>' : '') + '<p>' + esc(t.label || t.content) + '</p></div>';
    return '<div class="cl-msg ai' + (t.error ? ' err' : '') + '">' + (t.content ? (t.error ? '<p>' + esc(t.content) + '</p>' : '<div class="cl-prose">' + md(t.content) + '</div>') : '<p class="cl-wait">Thinking…</p>') + '</div>';
  }
  function renderList() {
    var list = panel && panel.querySelector('.cl-list'); if (!list) return;
    if (!S.turns.length) {
      list.innerHTML = '<div class="cl-empty"><p>Hello, I’m Clippy. Ask me anything about ' + (S.mod ? '“' + esc(htmlText(S.mod.title)) + '”' : 'this page') + '. Or select a passage on the page and choose <b>Explain this</b>, <b>Give an example</b>, <b>Why does it matter?</b> or <b>Quiz me on this</b>.</p></div>';
    } else list.innerHTML = S.turns.map(turnHtml).join('');
    list.scrollTop = list.scrollHeight;
  }
  function renderLast() {
    var list = panel && panel.querySelector('.cl-list'); if (!list || !S.turns.length) return;
    var last = list.lastElementChild, t = S.turns[S.turns.length - 1];
    if (!last || !last.classList.contains('ai')) { renderList(); return; }
    var nearEnd = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    last.outerHTML = turnHtml(t);
    if (nearEnd) list.scrollTop = list.scrollHeight;
  }
  function renderForm() {
    var f = panel && panel.querySelector('.cl-form'); if (!f) return;
    var ta = f.querySelector('textarea'), chip = f.querySelector('.cl-chip');
    chip.hidden = !S.excerpt; if (S.excerpt) chip.querySelector('span').textContent = 'About: “' + (S.excerpt.length > 90 ? S.excerpt.slice(0, 90) + '…' : S.excerpt) + '”';
    f.querySelector('[data-c="ask"]').hidden = S.busy; f.querySelector('[data-c="ask"]').disabled = !ta.value.trim();
    f.querySelector('[data-c="stop"]').hidden = !S.busy;
    f.querySelector('[data-c="new"]').hidden = S.busy || !S.turns.length;
  }
  function renderFoot() {
    if (!panel || panel.hidden) return;
    var q = panel.querySelector('.cl-quota'), a = panel.querySelector('.cl-ask'), i = S.info, quota = null;
    if (OR.key && i) quota = OR.plan === 'free' ? (i.freeLeft !== null && i.freeLimit !== null ? i.freeLeft + ' of ' + i.freeLimit + ' free questions left today' : null) : (i.creditLeft !== null ? 'Credit left on this key: US$' + Number(i.creditLeft).toFixed(2) : null);
    if (useCourse()) q.textContent = 'Course account' + (CR.left !== null ? ' · ' + CR.left + ' question' + (CR.left === 1 ? '' : 's') + ' left today' : '') + (S.model ? ' · ' + modelName(S.model) : '');
    else q.textContent = OR.key ? (quota || PLAN_LABEL[OR.plan]) + (S.model ? ' · ' + modelName(S.model) : '') : '';
    var href = App.askHref ? App.askHref() : null;
    a.innerHTML = href ? '<a class="cl-link" target="_blank" rel="noopener noreferrer">Ask your instructor</a>' : '';
    if (href) a.firstChild.href = href;
  }

  function send(user, action) {
    if (S.busy || !ready() || offReason()) return;
    var gen = S.gen, history = S.turns.concat([user]).filter(function (t) { return !t.error; });
    S.turns = S.turns.concat([user, { role: 'assistant', content: '' }]); S.busy = true; renderList(); renderForm();
    logAsk(action, user.excerpt);
    var followUp = history.some(function (t) { return t.role === 'assistant'; }), notes = '';
    try { notes = bookNotes(S.mod && S.mod.id, followUp); } catch (e) { /* answer from the module alone */ }
    var msgs = [{ role: 'system', content: systemPrompt(visibleText(), notes) }].concat(history.slice(-HISTORY).map(function (t) { return { role: t.role, content: t.content }; }));
    var ac = new AbortController(); S.abort = ac;
    function setLast(t) { if (gen !== S.gen) return; S.turns[S.turns.length - 1] = t; renderLast(); }
    var onText = function (text) { setLast({ role: 'assistant', content: text }); };
    // on the course account; if its daily questions or credit are used up and OpenRouter is connected, OpenRouter answers
    (useCourse() ? courseChat(msgs, isStruggling(history), onText, ac.signal).catch(function (e) {
      if (e && e.assistant && (e.kind === 'quota' || e.kind === 'unavailable') && OR.key && gen === S.gen) { onText(''); return chat(msgs, onText, ac.signal); }
      throw e;
    }) : chat(msgs, onText, ac.signal)).then(function (r) {
      if (gen !== S.gen) return; S.model = r.model;
      if (!r.text.trim()) setLast({ role: 'assistant', content: 'No answer came back. Please try again.', error: true });
      else if (r.cut) setLast({ role: 'assistant', content: r.text + '\n\n(The answer was cut off. Ask again, or ask for a shorter answer.)' });
    }, function (e) {
      if (gen !== S.gen) return;
      if (e && e.name === 'AbortError') { var last = S.turns[S.turns.length - 1]; if (!(last && last.content)) S.turns = S.turns.slice(0, -2); }
      else setLast({ role: 'assistant', content: e && e.assistant ? e.message : 'Could not reach Clippy. Check your internet connection and try again.', error: true });
      if (window.console && !(e && (e.assistant || e.name === 'AbortError'))) console.warn('Clippy:', e);
    }).then(function () {
      if (gen !== S.gen) return; S.busy = false; S.abort = null; if (mode === 'chat') { renderList(); renderForm(); } else render(); refreshInfo();
    });
  }
  function runAction(action, text) { send({ role: 'user', content: actionPrompt(action, text), excerpt: text, label: ACTION_LABEL[action] }, action); }
  function submit() {
    var ta = panel.querySelector('.cl-form textarea'), q = ta.value; if (!q.trim() || S.busy) return;
    var ex = S.excerpt || undefined; ta.value = ''; S.excerpt = null;
    send({ role: 'user', content: questionPrompt(q, ex), excerpt: ex, label: q.trim() }, 'question');
  }

  /* ---------- settings on the Account page (as EpiCompass Settings.tsx) ---------- */
  var setEl = null, setMsg = null;
  function redrawSettings() { if (setEl && document.body.contains(setEl)) drawSettings(); }
  function drawSettings() {
    var e = setEl, h = '<h3 id="h-assistant">Clippy, your study assistant</h3><p class="cl-note">An AI tutor for the page you are on.</p>';
    if (CR.enabled) {
      h += '<div class="card-plain"><div role="radiogroup" aria-labelledby="h-assistant" class="cl-plans">' +
        '<label class="cl-plan' + (CR.source === 'course' ? ' on' : '') + '"><input type="radio" name="cl-src" value="course"' + (CR.source === 'course' ? ' checked' : '') + '><span><b>Course account</b> (recommended)<br><span class="cl-note">Runs on the course’s Claude account: Claude Haiku answers, and Claude Sonnet takes over when you say an answer did not help. Nothing to set up or pay. Up to <b>' + (CR.daily || 150) + ' questions a day</b>, renewed at midnight (India time). ' + (signedIn() ? (CR.left !== null ? 'You have ' + CR.left + ' left today.' : '') : 'You need to be signed in.') + ' Your questions and Clippy’s answers are not stored; CliPr records only how many questions you asked each day.</span></span></label>' +
        '<label class="cl-plan' + (CR.source === 'openrouter' ? ' on' : '') + '"><input type="radio" name="cl-src" value="openrouter"' + (CR.source === 'openrouter' ? ' checked' : '') + '><span><b>My own OpenRouter account</b><br><span class="cl-note">A backup, for when the course account’s daily questions are used up or it is switched off, or if you prefer not to sign in. Set it up below.</span></span></label></div></div>' +
        '<h3 id="h-or">Your own OpenRouter account (backup)</h3>';
    }
    h += '<div class="card-plain cl-set">';
    if (OR.key) h += '<p><b>OpenRouter connected</b> on this device' + (useCourse() ? ', ready as a backup' : '') + '. Open Clippy with the <b>Ask Clippy</b> button, or select a passage in any module.</p><p><button type="button" class="btn pri" data-s="open">Ask Clippy</button> <button type="button" class="btn" data-s="disc">Disconnect</button></p>';
    else h += '<ol><li>Press <b>Connect OpenRouter</b>. On OpenRouter, sign in or create a free account (Google or email), then approve CliPr.</li><li>You return here with Clippy ready. No payment or card details are needed for the free models.</li><li>On each new device or browser, connect once more.</li></ol>' +
      (OR.error ? '<p class="msg bad" role="alert"></p>' : '') +
      '<p><button type="button" class="btn pri" data-s="conn"' + (OR.connecting ? ' disabled' : '') + '>' + (OR.connecting ? 'Connecting…' : 'Connect OpenRouter') + '</button></p>' +
      '<details class="cl-more"><summary>I already have an OpenRouter key</summary><form class="cl-paste"><input type="password" autocomplete="off" placeholder="sk-or-…" aria-label="OpenRouter key"><button class="btn" type="submit">Use this key</button></form><p class="cl-note cl-pm"></p></details>';
    h += '<p class="cl-note">Your key is kept in this browser only, and is removed when you sign out of CliPr. Your questions go straight from this browser to OpenRouter; CliPr never sees the key or the conversation. Clippy can make mistakes: the course text is the authority, and your instructor is a WhatsApp message away.</p></div>';
    h += '<h3 id="h-model">' + (CR.enabled ? 'OpenRouter model' : 'AI model') + '</h3><p class="cl-note">Chosen automatically: if your OpenRouter account has credit, Qwen3.5 9B; otherwise the free models. Pick one below to override. A backup takes over if a model is busy.</p><div class="card-plain"><div role="radiogroup" aria-labelledby="h-model" class="cl-plans">' +
      ['free', 'low-cost'].map(function (p) { return '<label class="cl-plan' + (OR.plan === p ? ' on' : '') + '"><input type="radio" name="cl-plan" value="' + p + '"' + (OR.plan === p ? ' checked' : '') + '><span><b>' + PLAN_LABEL[p] + '</b>' + (p === 'free' ? ' (recommended)' : '') + '<br><span class="cl-note">' + PLAN_TEXT[p] + '</span></span></label>'; }).join('') + '</div></div>';
    if (Ac.session && Ac.profile && C.avail) h += '<h3 id="h-insights">Help your instructor improve the course</h3><p class="cl-note">Optional, and you can change your mind at any time.</p><div class="card-plain"><label class="cl-toggle"><input type="checkbox" data-s="consent"' + (C.at ? ' checked' : '') + '><span>Share which modules and passages I ask Clippy about, so that Dr Ram can see where the course text is unclear.</span></label>' +
      '<p class="cl-note">Only the module, the step, the button you pressed and the passage of course text you selected are recorded. Your instructor sees totals for each module and passage, not who asked. What you type and Clippy’s answers are never recorded. Unticking deletes everything recorded so far. This is used only to improve the course, not for research or marks.</p>' + (setMsg ? '<p class="msg bad" role="status"></p>' : '') + '</div>';
    e.innerHTML = h;
    var er = e.querySelector('.cl-set .msg.bad'); if (er) er.textContent = OR.error;
    var cm = e.querySelector('[data-s="consent"]'); if (cm && setMsg) cm.closest('.card-plain').querySelector('.msg').textContent = setMsg;
    var q = function (s) { return e.querySelector(s); };
    if (q('[data-s="open"]')) q('[data-s="open"]').onclick = function () { open(); };
    if (q('[data-s="disc"]')) q('[data-s="disc"]').onclick = disconnect;
    if (q('[data-s="conn"]')) q('[data-s="conn"]').onclick = function () { connect(); };
    var pf = q('.cl-paste'); if (pf) pf.onsubmit = function (ev) { ev.preventDefault(); var inp = pf.querySelector('input'), err = pasteKey(inp.value); if (err) { q('.cl-pm').textContent = err; } else inp.value = ''; };
    Array.prototype.forEach.call(e.querySelectorAll('input[name="cl-plan"]'), function (r) { r.onchange = function () { setPlan(r.value); }; });
    Array.prototype.forEach.call(e.querySelectorAll('input[name="cl-src"]'), function (r) { r.onchange = function () { setSource(r.value); }; });
    if (cm) cm.onchange = function () { cm.disabled = true; setConsent(cm.checked).then(function (err) { setMsg = err; drawSettings(); }); };
  }
  function settings(container) { if (!container) return; setEl = container; setMsg = null; drawSettings(); }

  /* ---------- instructor dashboard tab (as EpiCompass InsightsView.tsx): totals only, never who asked ---------- */
  var DAYS = 90, ins = { rows: null, err: null, consented: null, cohort: 'all' };
  function stepName(m, k) {
    if (!k) return null; var base = { ess: 'Essentials', quiz: 'Quiz', answers: 'Answers', notes: 'Notes' };
    if (Object.prototype.hasOwnProperty.call(base, k)) return base[k];
    var ci = m && m.cases ? m.cases.map(function (c) { return c.id; }).indexOf(k) : -1; return ci >= 0 ? 'Case ' + (ci + 1) : k;
  }
  /* the instructor's central controls for Clippy on the course account (table pmc_clippy_settings) */
  var ctl = { s: null, sum: null, err: null, msg: null, msgOk: false };
  function money(x) { return 'US$' + Number(x || 0).toFixed(2); }
  function ctlHtml() {
    var h = '<h2>Clippy on the course account</h2>';
    if (ctl.err) return h + '<p class="cl-note">' + (/pmc_clippy|does not exist|schema cache|HTTP 404/i.test(ctl.err) ? 'Not set up yet: the database tables for this have not been created (supabase/pmc_clippy.sql).' : 'Could not load: ' + esc(ctl.err)) + '</p>';
    if (!ctl.s) return h + '<p class="cl-note">Loading…</p>';
    var c = ctl.s, u = ctl.sum;
    h += '<p class="cl-note">Signed-in learners use Clippy on the course’s Claude API credit (Claude Haiku, with Claude Sonnet when a learner is struggling). Learners can still use their own OpenRouter account. The credit is shared with Kenny in EpiCompass.</p>';
    if (u) h += '<p>This month: <b>' + u.questions + '</b> question' + (u.questions == 1 ? '' : 's') + ' from <b>' + u.learners + '</b> learner' + (u.learners == 1 ? '' : 's') + ', costing <b>' + money(u.cost_usd) + '</b> of Clippy’s ' + money(c.monthly_budget) + '. Kenny has used ' + money(u.kenny_cost_usd) + '; together ' + money(Number(u.cost_usd) + Number(u.kenny_cost_usd)) + ' of the shared ' + money(c.shared_cap) + '.</p>';
    h += '<form class="form" id="clctl"><label class="cl-toggle"><input type="checkbox" id="clon"' + (c.enabled ? ' checked' : '') + '><span>Clippy on the course account is <b>' + (c.enabled ? 'on' : 'off') + '</b> for all learners</span></label>' +
      '<label>Questions per learner per day<input type="number" id="cldl" min="1" max="1000" step="1" value="' + esc(c.daily_limit) + '"></label>' +
      '<label>Clippy’s monthly budget (US$)<input type="number" id="clmb" min="0" max="500" step="1" value="' + esc(c.monthly_budget) + '"></label>' +
      '<label>Shared cap for Clippy and Kenny together (US$ a month)<input type="number" id="clsc" min="0" max="500" step="1" value="' + esc(c.shared_cap) + '"></label>' +
      '<button class="btn" type="submit">Save</button> <span class="msg' + (ctl.msg ? (ctl.msgOk ? ' ok' : ' bad') : '') + '" id="clcm">' + esc(ctl.msg || '') + '</span></form>';
    return h;
  }
  function loadCtl() {
    return Promise.all([SB.get('/rest/v1/pmc_clippy_settings?id=eq.1&select=enabled,daily_limit,monthly_budget,shared_cap'), SB.rpc('pmc_clippy_month_summary').catch(function () { return null; })]).then(function (r) {
      ctl.s = (r[0] && r[0][0]) || null; ctl.sum = (r[1] && r[1][0]) || null; ctl.err = ctl.s ? null : 'pmc_clippy_settings is empty';
    }, function (e) { ctl.err = (e && e.message) || 'error'; });
  }
  function wireCtl(body, draw) {
    var f = body.querySelector('#clctl'); if (!f) return;
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var row = { enabled: f.querySelector('#clon').checked, daily_limit: Math.round(+f.querySelector('#cldl').value), monthly_budget: +f.querySelector('#clmb').value, shared_cap: +f.querySelector('#clsc').value };
      if (!(row.daily_limit >= 1 && row.daily_limit <= 1000) || !(row.monthly_budget >= 0 && row.monthly_budget <= 500) || !(row.shared_cap >= 0 && row.shared_cap <= 500)) { ctl.msg = 'Daily limit 1 to 1,000; budgets US$0 to 500.'; ctl.msgOk = false; draw(); return; }
      SB.patch('pmc_clippy_settings', 'id=eq.1', row).then(function () { ctl.msg = 'Saved. It applies to the next question each learner asks.'; ctl.msgOk = true; return loadCtl(); }, function (e) { ctl.msg = 'Could not save: ' + e.message; ctl.msgOk = false; }).then(function () { if (document.body.contains(body)) draw(); });
    };
  }
  App.clippyInsights = function (body, cohorts) {
    function draw() {
      // rows are written by learners: plain maps without prototypes, so ids like "__proto__" are just text
      var list = (ins.rows || []).filter(function (r) { return r && (ins.cohort === 'all' || r.cohort_id === ins.cohort); }), byMod = Object.create(null);
      list.forEach(function (r) {
        var e = byMod[r.module_id] = byMod[r.module_id] || { asks: 0, learners: Object.create(null), steps: Object.create(null), passages: Object.create(null) };
        if (typeof r.excerpt !== 'string') r.excerpt = null; if (r.step != null) r.step = String(r.step);
        e.asks++; e.learners[r.user_id] = 1;
        if (r.step) e.steps[r.step] = (e.steps[r.step] || 0) + 1;
        if (r.excerpt) { var k = r.excerpt.replace(/\s+/g, ' ').trim().slice(0, 160); e.passages[k] = (e.passages[k] || 0) + 1; }
      });
      var rows = Object.keys(byMod).map(function (id) { var e = byMod[id]; e.id = id; e.n = Object.keys(e.learners).length; return e; }).sort(function (a, b) { return b.n - a.n || b.asks - a.asks; });
      var n = ins.consented, h = '<h2>Where learners ask Clippy for help</h2>' +
        (cohorts && cohorts.length > 1 ? '<p><label>Cohort <select id="clcoh"><option value="all">All cohorts</option>' + cohorts.map(function (c) { return '<option value="' + esc(c.id) + '"' + (ins.cohort === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></label></p>' : '') +
        '<p class="cl-note">Last ' + DAYS + ' days, from the ' + (n === null || n === undefined ? '' : n + ' ') + 'learner' + (n === 1 ? '' : 's') + ' who have agreed to share this. Totals only: you do not see who asked, what they typed or what Clippy replied.</p>';
      if (ins.err) h += '<p class="cl-note">' + (/pmc_assistant_asks|does not exist|schema cache|HTTP 404/i.test(ins.err) ? 'Not switched on yet: the database table for this has not been created.' : 'Could not load: ' + esc(ins.err)) + '</p>';
      else if (ins.rows === null) h += '<p class="cl-note">Loading…</p>';
      else if (!rows.length) h += '<p class="cl-note">Nothing yet.</p>';
      else h += K.tbl(['Module', 'Learners', 'Requests', 'Passages asked about most'], rows.slice(0, 30).map(function (e) {
        var m = Object.prototype.hasOwnProperty.call(App.byId, e.id) ? App.byId[e.id] : null, steps = Object.keys(e.steps).sort(function (a, b) { return e.steps[b] - e.steps[a]; }).map(function (s) { return esc(stepName(m, s)) + ' ' + e.steps[s]; }).join(', ');
        var top = Object.keys(e.passages).sort(function (a, b) { return e.passages[b] - e.passages[a]; }).slice(0, 3);
        return [(m ? '<a href="#' + esc(e.id) + '">' + App.modLabel(m) + ' · ' + m.title + '</a>' : esc(e.id)) + (steps ? '<div class="cl-note">' + steps + '</div>' : ''), e.n, e.asks,
          top.length ? '<ul class="cl-top">' + top.map(function (p) { return '<li>“' + esc(p) + (p.length >= 160 ? '…' : '') + '” <span class="cl-note">×' + e.passages[p] + '</span></li>'; }).join('') + '</ul>' : '<span class="cl-note">Typed questions only</span>'];
      }), 'cl-asks');
      body.innerHTML = ctlHtml() + h;
      wireCtl(body, draw);
      var sel = body.querySelector('#clcoh'); if (sel) sel.onchange = function () { ins.cohort = sel.value; draw(); };
    }
    ins.rows = null; ins.err = null; ctl.msg = null; draw();
    loadCtl().then(function () { if (document.body.contains(body)) draw(); });
    var since = new Date(Date.now() - DAYS * 864e5).toISOString();
    SB.rpc('pmc_insights_consent_count').then(function (c) { ins.consented = typeof c === 'number' ? c : null; }, function () { ins.consented = null; }).then(function () {
      return SB.get('/rest/v1/pmc_assistant_asks?select=module_id,step,action,excerpt,cohort_id,user_id,created_at&created_at=gte.' + encodeURIComponent(since) + '&limit=5000');
    }).then(function (r) { ins.rows = r || []; }, function (e) { ins.err = (e && e.message) || 'error'; }).then(function () { if (document.body.contains(body)) draw(); });
  };

  /* ---------- wiring ---------- */
  subs.push(function () { render(); redrawSettings(); });
  var lastUid = null;
  Ac.on(function () {
    loadConsent(); document.body.classList.toggle('cl-ask', !!document.getElementById('askbtn'));
    var uid = signedIn() ? Ac.session.user.id : null; if (uid !== lastUid) { lastUid = uid; CR.left = null; if (CR.enabled) courseLeft(); render(); redrawSettings(); }
    renderFoot();
  });
  App.clippy = {
    ACTIONS: ACTIONS, selText: selText, open: open, route: route, settings: settings, disconnect: disconnect, setSource: setSource, isStruggling: isStruggling, _cr: CR,
    init: function () {
      build();
      finishConnect(); // restores the saved #hash synchronously, before the first route
      if (OR.key) keyInfo(); // settle the automatic plan as soon as the app loads with a connected key
      checkCourse();
    },
    /* for tests */
    _state: S, _or: OR, _md: md, _bookNotes: bookNotes, _systemPrompt: systemPrompt
  };
})();
