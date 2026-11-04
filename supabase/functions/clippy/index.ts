/**
 * Clippy (CliPr's study assistant) on the course's Claude API credit. Ported from EpiCompass's "kenny" function.
 *
 * The browser sends the conversation (the course material is in the system message, built by the app) with
 * the signed-in learner's Supabase session. This function checks the session, enforces each learner's daily
 * limit and the course's monthly budget (table pmc_clippy_usage, supabase/pmc_clippy.sql), calls the Claude API with
 * the key held in the secret ANTHROPIC_API_KEY, and streams the reply back as server-sent events:
 *   data: {"t":"text so far…"}   (one per chunk, cumulative)
 *   data: {"done":true,"model":"…","left":12}
 * Nothing the learner types, and nothing Clippy replies, is stored.
 *
 * Secrets (Supabase dashboard > Edge Functions > Secrets):
 *   ANTHROPIC_API_KEY          required; a key from the Claude Console organisation linked to the course's Claude API credit
 *   CLIPPY_MODEL                optional, the everyday model, default claude-haiku-5-5 (medium effort)
 *   CLIPPY_HELP_MODEL           optional, used when the app says the learner is struggling, default claude-sonnet-5-5
 *   CLIPPY_DAILY_LIMIT          optional fallback, questions per learner per day, default 150
 *   CLIPPY_MONTHLY_BUDGET_USD   optional fallback, stop using the course credit beyond this, default 50
 * The instructor's switch, daily limit and budget in table pmc_clippy_settings (Class dashboard, Clippy tab) take precedence.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_ORIGINS = ['https://ramthiru83.github.io', 'http://localhost:8000', 'http://127.0.0.1:8000'];
const MODEL = Deno.env.get('CLIPPY_MODEL') || 'claude-haiku-5-5';
const HELP_MODEL = Deno.env.get('CLIPPY_HELP_MODEL') || 'claude-sonnet-5-5';
const DAILY = Number(Deno.env.get('CLIPPY_DAILY_LIMIT') || 150);
const BUDGET = Number(Deno.env.get('CLIPPY_MONTHLY_BUDGET_USD') || 50);
// US$ per million tokens: input, output, cache read (cache writes cost 1.25 × input)
const PRICES: Record<string, [number, number, number]> = {
  'claude-haiku-5-5': [0.10, 0.50, 0.01],
  'claude-sonnet-5-5': [2, 10, 0.10],
};
const priceOf = (m: string) => PRICES[m] ?? [2, 10, 0.2]; // unknown model: count conservatively

const secretKey = (() => {
  try { const k = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}').default; if (k) return k as string; } catch { /* fall through */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
})();
const admin = createClient(Deno.env.get('SUPABASE_URL')!, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

function cors(req: Request): Record<string, string> {
  const o = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}
const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json' } });

type Msg = { role: 'user' | 'assistant'; content: string };

/** The instructor's central controls (pmc_clippy_settings); falls back to the secrets if the table is missing. */
async function settings(): Promise<{ on: boolean; daily: number; budget: number; cap: number }> {
  const { data } = await admin.from('pmc_clippy_settings').select('enabled, daily_limit, monthly_budget, shared_cap').eq('id', 1).maybeSingle();
  return data ? { on: !!data.enabled, daily: Number(data.daily_limit), budget: Number(data.monthly_budget), cap: Number(data.shared_cap) } : { on: true, daily: DAILY, budget: BUDGET, cap: 500 };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) });
  const origin = req.headers.get('Origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return json(req, 403, { error: 'forbidden' });
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  const cfg = await settings();
  // status: is the course credit switched on, and what is the daily limit?
  if (req.method === 'GET') return json(req, 200, { enabled: !!apiKey && cfg.on, daily: cfg.daily, model: MODEL, helpModel: HELP_MODEL });
  if (req.method !== 'POST') return json(req, 405, { error: 'method' });
  if (!apiKey || !cfg.on) return json(req, 503, { error: 'unavailable', message: 'Clippy on the course account is switched off at the moment.' });

  // who is asking?
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: u } = token ? await admin.auth.getUser(token) : { data: { user: null } };
  const uid = u?.user?.id;
  if (!uid) return json(req, 401, { error: 'auth', message: 'Please sign in to use Clippy on the course account.' });

  // what are they asking? (sizes are capped so the endpoint cannot be used for large jobs)
  let body: { system?: unknown; messages?: unknown; struggling?: unknown };
  try { body = await req.json(); } catch { return json(req, 400, { error: 'bad', message: 'Bad request.' }); }
  const system = typeof body.system === 'string' ? body.system : '';
  const messages = Array.isArray(body.messages) ? body.messages as Msg[] : [];
  const valid = system.startsWith('You are Clippy') && system.length <= 40000
    && messages.length >= 1 && messages.length <= 16
    && messages.every(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.length <= 6000)
    && messages[messages.length - 1].role === 'user';
  if (!valid) return json(req, 400, { error: 'bad', message: 'That request is too long or not in the expected form.' });
  // Haiku answers first; Sonnet takes over when the learner has not followed an earlier explanation
  const model = body.struggling === true ? HELP_MODEL : MODEL;
  const price = priceOf(model);

  // one question from today's allowance, within the monthly budget
  const { data: left, error: rErr } = await admin.rpc('pmc_clippy_reserve', { uid, daily_limit: cfg.daily, monthly_budget: cfg.budget, shared_cap: cfg.cap });
  if (rErr) return json(req, 500, { error: 'other', message: 'Clippy could not check your allowance. Please try again.' });
  if (left === -1) return json(req, 429, { error: 'quota', message: `You have used today’s ${cfg.daily} questions on the course account. They renew at midnight (India time). You can switch to your own OpenRouter account on the Account page.` });
  if (left === -2) return json(req, 503, { error: 'unavailable', message: 'This month’s course credit for Clippy has been used up. You can switch to your own OpenRouter account on the Account page.' });

  const settle = (cost: number, refund: boolean) => admin.rpc('pmc_clippy_settle', { uid, cost, refund });

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: 3000,
      stream: true,
      // medium effort: thinks enough to stay accurate without slowing the reply much
      output_config: { effort: 'medium' },
      // the course material is the same for every question on a card, so it is cached between questions
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages,
    }),
  }).catch(() => null);

  if (!upstream || !upstream.ok || !upstream.body) {
    await settle(0, true);
    const t = upstream ? await upstream.text().catch(() => '') : '';
    const s = upstream?.status ?? 0;
    console.error('anthropic', s, t.slice(0, 300));
    if (s === 429 || s === 529 || s >= 500 || s === 0) return json(req, 503, { error: 'busy', message: 'Clippy is busy just now. Please try again in a minute.' });
    if (/credit balance/i.test(t) || s === 401 || s === 403) return json(req, 503, { error: 'unavailable', message: 'Clippy on the course account is unavailable just now.' });
    return json(req, 502, { error: 'other', message: 'Clippy could not answer that. Please try again.' });
  }

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (o: unknown) => { try { ctrl.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`)); } catch { /* the learner closed the chat */ } };
      const reader = upstream.body!.getReader(); const dec = new TextDecoder();
      let buf = '', text = '', inTok = 0, outTok = 0, cacheW = 0, cacheR = 0, failed = false;
      try {
        for (;;) {
          const { done, value } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          let i: number;
          while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
            if (!line.startsWith('data:')) continue;
            let ev: any; try { ev = JSON.parse(line.slice(5)); } catch { continue; }
            if (ev.type === 'message_start') {
              const us = ev.message?.usage ?? {};
              inTok = us.input_tokens ?? 0; cacheW = us.cache_creation_input_tokens ?? 0; cacheR = us.cache_read_input_tokens ?? 0;
              outTok = us.output_tokens ?? 0;
            } else if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
              text += ev.delta.text; send({ t: text });
            } else if (ev.type === 'message_delta') {
              outTok = ev.usage?.output_tokens ?? outTok;
            } else if (ev.type === 'error') {
              failed = true; console.error('anthropic stream', JSON.stringify(ev.error).slice(0, 300));
              send({ error: 'busy', message: 'Clippy stopped part-way. Please try again.' });
            }
          }
        }
      } catch (e) { failed = true; console.error('stream', String(e)); }
      const cost = (inTok * price[0] + cacheW * price[0] * 1.25 + cacheR * price[2] + outTok * price[1]) / 1e6;
      await settle(cost, failed && !text);
      send({ done: true, model, left: failed && !text ? left + 1 : left });
      try { ctrl.close(); } catch { /* already closed */ }
    },
    cancel() { /* learner pressed Stop: the question still counts */ },
  });
  return new Response(stream, { headers: { ...cors(req), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } });
});
