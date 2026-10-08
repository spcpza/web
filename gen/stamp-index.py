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

def main(check=False):
    pv = json.loads((ROOT / 'version.json').read_text())['pv']      # e.g. '?p=394'
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
    print(f'plate <img> tags: {fixed}   needing correction: {bad}   plate version: {pv}')
    if check:
        sys.exit(1 if bad else 0)
    if new != html:
        (ROOT / 'index.html').write_text(new)
        print('index.html rewritten.')
    else:
        print('nothing to do.')

if __name__ == '__main__':
    main('--check' in sys.argv)
