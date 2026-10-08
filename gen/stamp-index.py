#!/usr/bin/env python3
"""
STAMP index.html's plate <img> tags — one correct alt each, and the current plate version.

    python3 gen/stamp-index.py            # rewrite index.html
    python3 gen/stamp-index.py --check    # report only, exit 1 if anything is wrong

WHY THIS EXISTS
  Sep 6, 2026. Measured while auditing load performance: **33 of the 38 <img> tags in
  index.html had MALFORMED alt attributes** — several quoted strings run together, like
      alt="Supper in the yard…""Three children on a town street…""The entire Bible…"
  HTML stops the attribute at the first closing quote, so the alt that survives is whichever
  string happened to be first — and on the cover that was the `family` page's supper scene.
  Every one of them was describing the wrong picture. Whatever wrote them was APPENDING
  rather than replacing, so it got worse with each pass.

  This matters more here than on most sites. The alt text is the whole of what a screen
  reader gets, and it is the whole of what an AI agent reading the source gets — and agents
  are a stated audience of this book ("maybe one day, when an AI agent comes up to
  balthazar.sh and reads the whole site"). A picture that describes itself wrongly is a
  false witness to the one reader who cannot see it.

  Each plate already writes its own description: `const ALT = '…'` inside its paint(). That
  is the source of truth, so the tag is rebuilt from it rather than edited in place — which
  is also why this can never accumulate again.

  It also stamps ?p= from version.json. The flat plates were pinned at ?p=91 while the live
  plate version was 394 — harmless today only because every asset is served max-age=0, and a
  trap the moment anyone adds real caching.

ONE VERSION, STAMPED EVERYWHERE, BUMPED BY ITSELF (Oct 8, 2026)
  Real caching has now been added (`/plates-vg/*` is `immutable` for 30 days in _headers), so
  the trap above is armed, and this script is what keeps it from going off. The plate version
  lived in THREE hand-edited places — version.json, `var PV` in engine/scene.js (which builds
  every depth-plane and boil-drawing URL at runtime), and the <img> tags — and the deploy
  checklist asked for "PV +1 in engine/scene.js AND version.json". One of those forgotten
  would strand returning readers on old art for a month. So now:
    · version.json is the ONLY place the number is written by hand (and usually not even there);
    · this script stamps it into index.html, 404.html and engine/scene.js's `var PV`, then
      re-runs `node gen/minify.mjs` so scene.min.js and its content-hashed URL follow;
    · version.json also records a fingerprint of every DEPLOYED file under plates-vg/ (the
      .assetsignore'd masters excluded). If those bytes changed since the last stamp and the
      number did not, the number is bumped here, automatically. A rebuilt plate can no longer
      ship under the URL of the old one.
  `--check` reports all of this without writing, and exits 1 if anything is out of step.
"""
import json, re, sys, glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# the covers are one data-true plate and describe themselves for agents (see word.mjs `desc`)
COVER_ALT = ("The entire Bible as one body of light: 31,102 verses as glowing motes wheeling "
             "around a radiant centre, threaded by a single scarlet curve of redemption.")

def plate_alts():
    out = {}
    for f in glob.glob(str(ROOT / 'gen/plates/*.mjs')):
        src = Path(f).read_text()
        name = re.search(r"export const name = '([^']+)'", src)
        alt  = re.search(r"const ALT = '((?:[^'\\]|\\.)*)'", src, re.S)
        if name and alt:
            a = alt.group(1).replace("\\'", "'").replace('\\n', ' ')
            out[name.group(1)] = re.sub(r'\s+', ' ', a).strip()
    return out

def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;')
             .replace('>', '&gt;').replace('"', '&quot;'))

def plates_fingerprint():
    """sha256 over every deployed file in plates-vg/ (names + contents), masters excluded."""
    import hashlib, fnmatch
    ign = [l.strip() for l in (ROOT / '.assetsignore').read_text().splitlines()
           if l.strip().startswith('plates-vg/')]
    h = hashlib.sha256()
    for f in sorted((ROOT / 'plates-vg').iterdir()):
        rel = f'plates-vg/{f.name}'
        if not f.is_file() or any(fnmatch.fnmatch(rel, p) for p in ign):
            continue
        h.update(rel.encode() + b'\0' + hashlib.sha256(f.read_bytes()).digest())
    return h.hexdigest()[:16]

def stamp_refs(text, pv):
    """every literal /plates-vg/<file> URL in a page carries the current ?p= (adds or replaces it)."""
    return re.sub(r'(/plates-vg/[A-Za-z0-9@._-]+\.(?:jpg|webp|png|avif))(?:\?p=\d+)?(?=["\'])',
                  lambda m: m.group(1) + pv, text)

def main(check=False):
    vj = json.loads((ROOT / 'version.json').read_text())
    pv = vj['pv']                                                    # e.g. '?p=394'
    num = re.search(r'\d+', pv).group(0)
    fp = f'{num}:{plates_fingerprint()}'       # the art's fingerprint, and the number it was stamped under
    rec = vj.get('plates') or ''
    # bump only if the art changed AND nobody has bumped the number by hand since the last stamp
    if rec and rec != fp and rec.split(':')[0] == num:
        # the art changed under an unchanged number: bump it, or a returning reader keeps the old art
        n = int(num) + 1
        print(f'  plates-vg/ changed since {pv} was stamped -> bumping plate version to ?p={n}')
        if check:
            print('STALE — run: python3 gen/stamp-index.py'); sys.exit(1)
        pv = f'?p={n}'
        fp = f'{n}:{fp.split(":")[1]}'
    if not check and (vj.get('pv') != pv or vj.get('plates') != fp):
        (ROOT / 'version.json').write_text(json.dumps({'pv': pv, 'plates': fp}, separators=(',', ':')) + '\n')
        print(f'version.json: pv={pv} plates={fp}')
    alts = plate_alts()
    html = (ROOT / 'index.html').read_text()
    bad = fixed = 0

    def repl(m):
        nonlocal bad, fixed
        tag, name = m.group(0), m.group(1)
        alt = COVER_ALT if name == 'word' else alts.get(name)
        if not alt:
            print(f'  ! no ALT in gen/plates for "{name}" — left alone'); return tag
        # was this one malformed? (more than one quoted run inside the alt)
        cur = re.search(r'alt="([^"]*)"', tag)
        # ⚠ compare against the ESCAPED alt: the attribute on the page holds &amp;/&quot;, the plate's
        # ALT holds the raw characters, and comparing raw-to-escaped flagged three sound tags as
        # "needing correction" while the rewrite then changed nothing (Sep 8).
        if cur is None or cur.group(1).strip() != esc(alt) or f'p={pv[3:]}' not in tag:
            bad += 1
        lazy = 'loading="lazy" ' if 'loading="lazy"' in tag else ''
        prio = ' fetchpriority="high"' if 'fetchpriority="high"' in tag else ''
        fixed += 1
        return (f'<img {lazy}src="/plates-vg/{name}.jpg{pv}" '
                f'srcset="/plates-vg/{name}.jpg{pv} 1600w" sizes="100vw" '
                f'alt="{esc(alt)}"{prio}>')

    new = re.sub(r'<img[^>]*src="/plates-vg/([a-z0-9-]+)\.jpg[^>]*>', repl, html)
    new = stamp_refs(new, pv)          # and every other literal plate URL on the page (word-cover.jpg)
    print(f'plate <img> tags: {fixed}   needing correction: {bad}   plate version: {pv}')
    # the other two homes of the number
    others = {}
    p404 = ROOT / '404.html'
    if p404.exists():
        others[p404] = stamp_refs(p404.read_text(), pv)
    psc = ROOT / 'engine/scene.js'
    sc = psc.read_text()
    sc_new, n_pv = re.subn(r"var PV = '\?p=\d+';", f"var PV = '{pv}';", sc, count=1)
    if n_pv != 1:
        print('  ! engine/scene.js: `var PV = \'?p=N\';` not found — the runtime planes would not follow'); bad += 1
    others[psc] = sc_new
    stale = [f.relative_to(ROOT).as_posix() for f, t in others.items() if t != f.read_text()]
    if new != html: stale.insert(0, 'index.html')
    if check:
        if stale: print('out of step:', ', '.join(stale))
        sys.exit(1 if (bad or stale) else 0)
    if new != html:
        (ROOT / 'index.html').write_text(new)
    for f, t in others.items():
        if t != f.read_text():
            f.write_text(t)
    print(('rewritten: ' + ', '.join(stale)) if stale else 'nothing to do.')
    if psc.relative_to(ROOT).as_posix() in stale:
        # scene.js changed, so its minified build and content-hashed URL must follow, now
        import subprocess
        try:
            subprocess.run(['node', str(ROOT / 'gen/minify.mjs')], check=True)
        except Exception as e:
            print(f'  ! re-minify failed ({e}) — run `node gen/minify.mjs` before deploying'); sys.exit(1)

if __name__ == '__main__':
    main('--check' in sys.argv)
