// Print every explainer scene as JSON lines: {key, text, hash}. Text equals what the browser reads from the transcript.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const s = fs.readFileSync(path.join(root, 'src', 'explain.js'), 'utf8');
const c = {}; vm.runInNewContext(s.slice(s.indexOf('var EX = {')) + '\n;this.EX=EX;', c);
const dec = t => t.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
const norm = t => String(t).replace(/\s+/g, ' ').trim();
const hash = t => { t = norm(t); let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const order = ['p0', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'cap'];
for (const id of order) {
  const mods = {}; const ctx = { registerModule: m => { mods[m.id] = m; }, EX: c.EX, Math, String, Object, Array, JSON, Number };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'content', id + '.js'), 'utf8'), ctx);
  const m = mods[id];
  (m.explainers || []).forEach(e => e.scenes.forEach((sc, i) => { const text = norm(dec(sc.say)); console.log(JSON.stringify({ key: id + ':' + e.id + ':' + i, text, hash: hash(text) })); }));
}
