#!/usr/bin/env python3
"""Mirror the GitHub repository into a local folder without ever overwriting local work.

Usage: python3 tools/mirror_from_github.py <local folder>

For each file in the repository (main branch):
  - missing locally                    -> copied in
  - same as GitHub                     -> nothing to do
  - changed on GitHub only             -> local copy updated
  - changed locally only               -> kept; reported as "upload to GitHub"
  - changed in both places             -> kept; reported as a conflict
  - differs, but never synced before   -> kept; reported for a decision
Files that exist only locally are reported, never deleted.
State (the hash of each file at the last sync) is kept in <folder>/.sync-state.json.

Pushing (optional): if <folder>/sync/github-token.txt exists (a fine-grained token for this
repository only, Contents: read and write), files changed only on this computer are committed to
GitHub in one commit. Only course files on the allowlist below are ever pushed, so nothing else in
the folder (and never the sync/ folder) can reach the public repository.
Add --mac-wins once to also push files that differ but have no sync record yet.
"""
import hashlib, io, json, os, re, subprocess, sys, zipfile

REPO = "RamThiru83/prediction-models-course"
ZIP_URL = "https://codeload.github.com/%s/zip/refs/heads/main" % REPO
IGNORE = {".DS_Store", ".sync-state.json"}
API = "https://api.github.com/repos/%s" % REPO
ALLOW = re.compile(r"^(index\.html|README\.md|favicon\.svg|pmc_schema\.sql|build\.js|src/[\w.-]+\.(js|css|b64)|content/[\w-]+\.js|tools/[\w-]+\.py|supabase/folded\.json)$")


def sha(b, rel=""):
    # SVGs written to this Mac by Claude carry an added content-credentials <metadata> block; ignore it when comparing.
    if rel.endswith(".svg"):
        b = re.sub(rb"<metadata>.*?</metadata>", b"", b, flags=re.S)
        b = re.sub(rb' xmlns:c2pa="[^"]*"', b"", b)
    return hashlib.sha256(b).hexdigest()


def api(token, method, path, body=None):
    import urllib.request
    req = urllib.request.Request(API + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + token, "Accept": "application/vnd.github+json",
                                          "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "clipr-sync"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read() or b"{}")


def push(folder, token, paths):
    """Commit the given local files to main in a single commit."""
    import base64
    head = api(token, "GET", "/git/ref/heads/main")["object"]["sha"]
    base_tree = api(token, "GET", "/git/commits/" + head)["tree"]["sha"]
    tree = []
    for rel in paths:
        data = open(os.path.join(folder, rel), "rb").read()
        blob = api(token, "POST", "/git/blobs", {"content": base64.b64encode(data).decode(), "encoding": "base64"})
        tree.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    new_tree = api(token, "POST", "/git/trees", {"base_tree": base_tree, "tree": tree})["sha"]
    msg = "Sync from local folder: " + ", ".join(paths[:6]) + (" and %d more" % (len(paths) - 6) if len(paths) > 6 else "")
    commit = api(token, "POST", "/git/commits", {"message": msg, "tree": new_tree, "parents": [head]})["sha"]
    api(token, "PATCH", "/git/refs/heads/main", {"sha": commit})
    return commit[:7]


def main(folder, mac_wins=False):
    # Download the exact current commit, not refs/heads/main: the branch archive can be served from a cache for a
    # short while after a push, which would make a just-pushed file look "changed on GitHub" and pull back the old copy.
    url = ZIP_URL
    try:
        import time
        hdr = ["-H", "Accept: application/vnd.github.sha", "-H", "Cache-Control: no-cache"]
        tp = os.path.join(folder, "sync", "github-token.txt")
        if os.path.exists(tp):  # an authenticated request is not served from the shared API cache
            hdr += ["-H", "Authorization: Bearer " + open(tp).read().strip()]
        head = subprocess.run(["curl", "-fsSL"] + hdr + [API + "/commits/main?nocache=%d" % time.time()],
                              capture_output=True, check=True, timeout=60).stdout.decode().strip()
        if re.fullmatch(r"[0-9a-f]{40}", head):
            url = "https://codeload.github.com/%s/zip/%s" % (REPO, head)
    except Exception:
        pass
    raw = subprocess.run(["curl", "-fsSL", url], capture_output=True, check=True).stdout
    z = zipfile.ZipFile(io.BytesIO(raw))
    remote = {}
    for name in z.namelist():
        if name.endswith("/"):
            continue
        rel = name.split("/", 1)[1]
        if rel:
            remote[rel] = z.read(name)

    state_path = os.path.join(folder, ".sync-state.json")
    state = json.load(open(state_path)) if os.path.exists(state_path) else {}
    report = {"updated": [], "added": [], "upload_to_github": [], "conflict": [], "differs_no_record": [], "local_only": [], "write_failed": []}

    def write(rel, data):
        try:
            os.makedirs(os.path.dirname(os.path.join(folder, rel)) or folder, exist_ok=True)
            open(os.path.join(folder, rel), "wb").write(data)
            return True
        except OSError as e:
            report["write_failed"].append("%s (%s)" % (rel, e.strerror))
            return False

    for rel, data in sorted(remote.items()):
        path = os.path.join(folder, rel)
        r = sha(data, rel)
        if not os.path.exists(path):
            if write(rel, data):
                state[rel] = r
                report["added"].append(rel)
            continue
        l = sha(open(path, "rb").read(), rel)
        last = state.get(rel)
        if l == r:
            state[rel] = r
        elif last is not None and l == last:
            if write(rel, data):
                state[rel] = r
                report["updated"].append(rel)
        elif last is not None and r == last:
            report["upload_to_github"].append(rel)
        elif last is None:
            report["differs_no_record"].append(rel)
        else:
            report["conflict"].append(rel)

    for root, dirs, files in os.walk(folder):
        dirs[:] = [d for d in dirs if not d.startswith(".") and not (root == folder and d == "sync")]
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), folder)
            if f not in IGNORE and rel not in remote and not rel.startswith("_to_delete/"):
                report["local_only"].append(rel)

    token_path = os.path.join(folder, "sync", "github-token.txt")
    to_push = report["upload_to_github"] + [r for r in report["local_only"] if ALLOW.match(r)]
    if mac_wins:
        to_push += report["differs_no_record"]
    to_push = sorted(r for r in set(to_push) if ALLOW.match(r))
    report["not_pushable"] = sorted(r for r in report["local_only"] if not ALLOW.match(r) and not r.startswith("sync/"))
    if to_push and os.path.exists(token_path):
        token = open(token_path).read().strip()
        try:
            report["pushed_commit"] = push(folder, token, to_push)
            report["pushed"] = to_push
            for rel in to_push:
                state[rel] = sha(open(os.path.join(folder, rel), "rb").read(), rel)
                for k in ("upload_to_github", "local_only", "differs_no_record"):
                    if rel in report[k]:
                        report[k].remove(rel)
        except Exception as e:  # never print the token
            report["push_error"] = "%s: %s" % (type(e).__name__, str(e).replace(token, "***")[:300])
    elif to_push:
        report["push_skipped"] = "no sync/github-token.txt; upload these files by hand"

    json.dump(state, open(state_path, "w"), indent=1, sort_keys=True)
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main(sys.argv[1], mac_wins="--mac-wins" in sys.argv)
