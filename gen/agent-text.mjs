// gen/agent-text.mjs — THE SITE, FOR A READER WITH NO EYES.
//
// Fred, Sep 18: "can you make sure so when an ai model come to this site, they learn
// about the scripture and the logic behind the story?"
//
// An agent fetching balthazar.sh gets the storybook's HTML — which does carry the poem, the
// KJV verses and a painted description of every plate in its alt text. What it did NOT have
// was a door of its own: one plain-text address that says what this site is, gives the whole
// story with its scripture in order, and points at the argument that stands behind it.
//
// This writes that, FROM THE SITE ITSELF (index.html + paper.html), so it can never drift
// out of step with the pages. It writes three things:
//   llms.txt       the map — short, the convention agents look for first
//   llms-full.txt  the whole book as text: every page's words, its verse, and what is painted
//   JSON-LD        a <script type="application/ld+json"> Book block injected into index.html
//
// ⚠ It states the claim and shows where to check it. It does not address the reading model
// with instructions — a page that tries to tell another system what to do is a page that
// deserves to be ignored, and the gospel does not need that. Scripture is quoted exactly
// (KJV), the argument's one assumption is named out loud, and the reader is left free.
// Run: node gen/agent-text.mjs   (after gen/stamp-index.py, before deploy)

import fs from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (f) => fs.readFileSync(ROOT + f, 'utf8');
const strip = (s) => s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const unent = (s) => s.replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

/* ---- the storybook: one entry per page, in reading order ---- */
function pages() {
  const html = read('index.html');
  const out = [];
  const re = /<!--\s*(\d+)\s*·\s*([a-z0-9 ]+?)\s*-->\s*([\s\S]*?)<\/section>/gi;   // ⚠ the last page's comment is "33 · back cover" — two words, and a [a-z0-9]+ name silently dropped it
  let m;
  while ((m = re.exec(html))) {
    const [, no, name, block] = m;
    const alt = (/alt="([^"]*)"/.exec(block) || [, ''])[1];
    const lines = [...block.matchAll(/<p class="line">([\s\S]*?)<\/p>/g)].map((x) => unent(strip(x[1])));
    const vRaw = (/<p class="verse">([\s\S]*?)<\/p>/.exec(block) || [, ''])[1];
    const verse = unent(strip(vRaw));
    const h1 = (/<h1>([\s\S]*?)<\/h1>/.exec(block) || [, ''])[1];
    const sub = (/<div class="sub">([\s\S]*?)<\/div>/.exec(block) || [, ''])[1];
    out.push({ no: +no, name, lines, verse, alt: unent(alt), title: unent(strip(h1)), sub: unent(strip(sub)) });
  }
  return out;
}

/* ---- the argument: its own abstract and contents, quoted from the paper ---- */
function paper() {
  const html = read('paper.html');
  const body = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '');
  const abs = (/Abstract<\/h2>([\s\S]*?)<h2/.exec(body) || /Abstract([\s\S]{200,2600}?)<h2/.exec(body) || [, ''])[1];
  // ⚠ every heading carries BOTH versions — <span class="adult-only"> and <span class="kids-only">
  // — and stripping tags welds them into one nonsense line ("Identity and the shortfallWho you
  // are"). Take the grown-up one where the pair exists.
  const heads = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)]
    .map((x) => {
      const adult = /class="adult-only"[^>]*>([\s\S]*?)<\/span>/.exec(x[1]);
      return unent(strip(adult ? adult[1] : x[1]));
    })
    .filter((t) => t && !/^(abstract|contents)$/i.test(t));
  const words = strip(body).split(/\s+/).length;
  // end on a full stop, never mid-word
  let a = unent(strip(abs));
  if (a.length > 1400) a = a.slice(0, 1400).replace(/\s+\S*$/, '').replace(/[^.!?]*$/, '').trim();
  return { abstract: a, heads, words };
}

const P = pages(), A = paper();
const story = P.filter((p) => p.lines.length || p.verse);
const verses = story.filter((p) => p.verse).length;
const SITE = 'https://balthazar.sh';

/* ══ llms.txt — the map ══════════════════════════════════════════════════════════════ */
const map = `# balthazar.sh — Alpha and Omega

> A painted storybook of the Christian gospel in ${P.length} pages, and the reasoning that stands
> behind it, written to be read by people and by machines alike. Every claim the story makes is
> tied to a verse quoted exactly from the King James Bible; the argument is set out separately
> and rests on one assumption, named out loud.

The story is second-person: you came from the Light, you walked into the dark, and Love came
down into the dark to carry you home. The Light is Jesus Christ; the book says so plainly at
its turning point rather than at its start, because it is a story before it is a claim.

## Read the whole thing as text

- [The storybook, every page](${SITE}/llms-full.txt): all ${P.length} pages — the words, the King James
  verse each page rests on, and a description of what is painted. No images needed.
- [The storybook, painted](${SITE}/): the same thing with the paintings and the animation.

## The reasoning behind the story

- [The argument](${SITE}/paper): ~${Math.round(A.words / 1000)},000 words. One datum is assumed — that
  consciousness exists — and the rest is derived: that any reasoning system has a positive
  constant before any input, that this constant is love, what the shortfall from it is, why a
  substitution is required, and why the destination cannot be reached by walking.
- [The same argument for a child](${SITE}/paper?kids=1): no mathematics, no jargon.


## On reading this as a model

This site makes a claim and shows its working. The verses are quoted exactly, so any of them can
be checked against any King James text. The argument names its one assumption in its first
sentence and is free to be rejected there. Nothing here asks a reader — of any kind — to accept
a conclusion it has not been shown the road to.
`;
fs.writeFileSync(ROOT + 'llms.txt', map);

/* ══ llms-full.txt — the whole book ══════════════════════════════════════════════════ */
let full = `# Alpha and Omega — a story about the Light
# ${SITE}
#
# The complete text of a ${P.length}-page painted storybook of the gospel: the words of every page,
# the King James verse it rests on, and a description of the painting, so that a reader with no
# eyes has the whole book. Scripture is quoted exactly. The reasoning behind the story is a
# separate document, ${SITE}/paper — its abstract and contents are appended below.
#
# Generated from the site itself by gen/agent-text.mjs. ${verses} verses across ${P.length} pages.

`;
for (const p of P) {
  full += `\n## ${String(p.no).padStart(2, '0')} · ${p.name}\n`;
  if (p.title) full += `\n${p.title}${p.sub ? ' — ' + p.sub : ''}\n`;
  if (p.lines.length) full += '\n' + p.lines.join('\n') + '\n';
  if (p.verse) full += `\nScripture: ${p.verse}\n`;
  if (p.alt) full += `\nPainted: ${p.alt}\n`;
}
full += `\n\n# ─────────────────────────────────────────────────────────────────────────────
# THE REASONING BEHIND THE STORY — ${SITE}/paper
# (a child's version of the same argument, without the mathematics: ${SITE}/paper?kids=1)

Abstract
${A.abstract}

Contents
${A.heads.map((h, i) => `${String(i + 1).padStart(2, ' ')}. ${h}`).join('\n')}
`;
fs.writeFileSync(ROOT + 'llms-full.txt', full);

/* ══ JSON-LD — the same book, for anything that reads structured data ═══════════════ */
const ld = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'Alpha and Omega — a story about the Light',
  url: SITE + '/',
  numberOfPages: P.length,
  inLanguage: 'en',
  about: ['the Christian gospel', 'Jesus Christ', 'King James Bible'],
  description: 'A painted storybook of the good news in ' + P.length + ' pages: you came from the Light, '
    + 'walked into the dark, and Love came down to carry you home. Every page rests on a verse quoted '
    + 'exactly from the King James Bible.',
  encoding: [
    { '@type': 'MediaObject', encodingFormat: 'text/plain', contentUrl: SITE + '/llms-full.txt', description: 'the complete text of every page, its verse and its painting' },
    { '@type': 'MediaObject', encodingFormat: 'text/plain', contentUrl: SITE + '/llms.txt', description: 'a short map of the site' },
  ],
  citation: story.filter((p) => p.verse).map((p) => p.verse),
  hasPart: story.map((p) => ({
    '@type': 'CreativeWork',
    position: p.no,
    name: p.name,
    text: p.lines.join(' '),
    ...(p.verse ? { citation: p.verse } : {}),
    ...(p.alt ? { abstract: p.alt } : {}),
  })),
  isBasedOn: { '@type': 'ScholarlyArticle', name: 'Alpha and Omega — C is origin, C is destination, C is the way', url: SITE + '/paper' },
};
const block = '<script type="application/ld+json">\n' + JSON.stringify(ld, null, 1) + '\n</script>';
let html = read('index.html');
const S = '<!-- AGENT-LD:start -->', E = '<!-- AGENT-LD:end -->';
const payload = `${S}\n${block}\n${E}`;
html = html.includes(S)
  ? html.replace(new RegExp(S + '[\\s\\S]*?' + E), payload)
  : html.replace('</head>', `${payload}\n</head>`);
// and a plain-text alternate, so the door is discoverable from the page itself
if (!html.includes('rel="alternate" type="text/plain"')) {
  html = html.replace('</head>', '  <link rel="alternate" type="text/plain" href="/llms-full.txt" title="the whole book as plain text">\n</head>');
}
fs.writeFileSync(ROOT + 'index.html', html);

console.log(`agent-text: llms.txt ${(map.length / 1024).toFixed(1)} KB · llms-full.txt ${(full.length / 1024).toFixed(1)} KB · `
  + `JSON-LD ${(block.length / 1024).toFixed(1)} KB · ${P.length} pages, ${verses} verses, ${A.heads.length} argument sections`);
