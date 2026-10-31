#!/usr/bin/env python3
"""Record every explainer scene with a Google Cloud Text-to-Speech voice.

Usage: GCP_TTS_KEY=... python3 tools/tts.py <voice name, e.g. en-GB-Chirp3-HD-Achernar> [--rate 1.0] [--only m02]
Reads the scenes from tools/scenes.js, writes narration/<module>-<explainer>-<n>-<hash>.mp3 and narration/manifest.json.
Clips whose text has not changed are reused, so re-running after an edit only records the changed scenes.
The key is read from the environment and is never written to disk.
"""
import base64, json, os, subprocess, sys, time, urllib.request

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
voice = args[0]
rate = float(args[args.index('--rate') + 1]) if '--rate' in args else 1.0
only = args[args.index('--only') + 1] if '--only' in args else None
key = os.environ['GCP_TTS_KEY']
lang = '-'.join(voice.split('-')[:2])
outdir = os.path.join(root, 'narration'); os.makedirs(outdir, exist_ok=True)
man_path = os.path.join(outdir, 'manifest.json')
old = json.load(open(man_path)) if os.path.exists(man_path) else {}
scenes = [json.loads(l) for l in subprocess.run(['node', os.path.join(root, 'tools', 'scenes.js')], capture_output=True, text=True, check=True).stdout.splitlines() if l.strip()]
man, made, kept = {}, 0, 0
for sc in scenes:
    k = sc['key']; mod, ex, i = k.split(':')
    fname = 'narration/%s-%s-%s-%s.mp3' % (mod, ex, i, sc['hash'])
    if os.path.exists(os.path.join(root, fname)) and old.get(k, {}).get('v') == voice:
        man[k] = dict(old[k]); kept += 1; continue
    if only and mod != only:
        if k in old: man[k] = old[k]
        continue
    body = json.dumps({'input': {'text': sc['text']}, 'voice': {'languageCode': lang, 'name': voice},
                       'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': rate}}).encode()
    req = urllib.request.Request('https://texttospeech.googleapis.com/v1/text:synthesize', data=body, method='POST',
                                 headers={'Content-Type': 'application/json', 'X-Goog-Api-Key': key})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                audio = base64.b64decode(json.loads(r.read())['audioContent'])
            break
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300].replace(key, '***')
            if e.code in (429, 500, 503) and attempt < 3: time.sleep(4 * (attempt + 1)); continue
            sys.exit('TTS error %s for %s: %s' % (e.code, k, msg))
    open(os.path.join(root, fname), 'wb').write(audio)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(root, fname)], capture_output=True, text=True).stdout or 0)
    man[k] = {'f': fname, 'h': sc['hash'], 'v': voice, 'd': round(dur, 2)}; made += 1
    print('recorded', k, len(audio), 'bytes', flush=True)
json.dump(man, open(man_path, 'w'), indent=0, sort_keys=True)
print('done: %d recorded, %d reused, %d scenes in manifest' % (made, kept, len(man)))
