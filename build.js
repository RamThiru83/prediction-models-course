const fs = require('fs'), path = require('path');
const dir = __dirname, src = p => fs.readFileSync(path.join(dir, p), 'utf8');
const order = ['p0', 'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'cap', 'ref_glossary', 'ref_formulas', 'ref_steps', 'ref_map'];
const js = ['src/charts.js', 'src/engine.js', 'src/data.js', 'src/casemix.js', 'src/core.js', 'src/sync.js', 'src/learn.js', 'src/pages.js', 'src/dash.js', 'src/widgets_a.js', 'src/widgets_b.js', 'src/widgets_c.js', 'src/analysislab.js']
  .map(src).map(t=>t.replace('__LOGO__',src('src/logo.b64').trim())).concat(order.map(n => src('content/' + n + '.js'))).join('\n;\n').replace(/<\/script/gi, '<\\/script');
const css = src('src/style.css');
const fonts = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap';
const body = `<title>CliPr</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2215%22 fill=%22%239A3029%22/%3E%3Cpath d=%22M10 48 H54%22 stroke=%22%23fff%22 stroke-opacity=%22.5%22 stroke-width=%224%22 stroke-linecap=%22round%22/%3E%3Cpath d=%22M10 18 L40 48%22 stroke=%22%23F2B84B%22 stroke-width=%225%22 stroke-linecap=%22round%22/%3E%3Cpath d=%22M10 18 C 24 9%2C 38 14%2C 45 30 C 48 38%2C 50 44%2C 54 48%22 fill=%22none%22 stroke=%22%23fff%22 stroke-width=%226.5%22 stroke-linecap=%22round%22/%3E%3Ccircle cx=%2210%22 cy=%2218%22 r=%224.5%22 fill=%22%23F08A24%22/%3E%3C/svg%3E">
<link rel="stylesheet" href="${fonts}">
<style>
${css}
</style>
<div class="topbar"><b>CliPr</b><button type="button" class="btn sm" id="menu" aria-label="Open contents">Contents</button></div>
<div class="shell">
<aside class="rail" id="rail" aria-label="Course contents"></aside>
<main class="main" id="page"></main>
</div>
<script>
${js}
;App.init();
</script>
`;
const site = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="description" content="CliPr: a self-contained course on developing and validating clinical prediction models, with maternal and child health examples. All data are synthetic."><style>:root{color-scheme:light dark}body{margin:0;font-size:14px}</style></head><body>' + body + '</body></html>';
const args = process.argv.slice(2);
if (args.includes('--check')) {
  // used by the GitHub workflow: does the published index.html match a fresh build of src/ and content/?
  const cur = fs.existsSync(path.join(dir, 'index.html')) ? fs.readFileSync(path.join(dir, 'index.html'), 'utf8') : '';
  if (cur !== site) { console.log('index.html differs from a fresh build'); process.exit(1); }
  console.log('index.html matches the source'); process.exit(0);
}
if (args.includes('--site')) {
  // repository layout: write the published page next to build.js
  fs.writeFileSync(path.join(dir, 'index.html'), site);
} else {
  fs.writeFileSync(path.join(dir, 'dist_fragment.html'), body);
fs.writeFileSync(path.join(dir, 'dist_test.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-size:14px}</style></head><body>' + body + '</body></html>');
fs.mkdirSync(path.join(dir,'site'),{recursive:true});
  fs.writeFileSync(path.join(dir, 'site', 'index.html'), site);
}
console.log('fragment bytes', body.length);
