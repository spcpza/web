// gen/corpus.mjs — data preparation for plate word ("the light of men").
// Everything here is REAL data, nothing decorative:
//   - the 31,102 verses of the KJV in canonical order (66 books hardcoded)
//   - verse -> Strong's numbers (inverted from strongs.json 'ci')
//   - graph distance of every verse from John 1:1, BFS over the
//     verse->root->verse bipartite graph. Hebrew and Greek Strong's spaces
//     are disjoint, so the bridge between testaments is the dataset's own
//     English root concepts ('s2e'/'e2s' — the cross-language sinew):
//     two verses are 1 hop apart when their Strong's numbers resolve to a
//     shared root concept. High-degree hubs (concepts in > CAP verses,
//     e.g. "lord", "say") are excluded from BFS so distance measures
//     kinship through *specific* shared roots, not stopwords; a second,
//     looser pass (CAP2) grades the verses the strict pass cannot reach.
//   - sinew edge groups: every Strong's number with 2..MAXDEG verses,
//     ready for pair-sampling (verses sharing that exact root).
//
// loadCorpus() is cached; safe to call from paint() on every build.

import { readFileSync } from 'node:fs';

const KJV_PATH = '/Users/f/.bots/truth/kjv.json';
const STRONGS_PATH = '/Users/f/.bots/truth/strongs.json';

// the 66 books, canonical KJV order
export const BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua',
  'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job',
  'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah',
  'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai',
  'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];

// Strong's roots for light / word / life — these motes burn warm gold
export const LIGHT_ROOTS = ['H216', 'H217', 'G5457', 'G5338', 'G3056', 'G2222'];

const SOURCE = 'John 1:1';   // "In the beginning was the Word"
const CAP = 80;              // strict BFS: ignore root concepts in > 80 verses
const CAP2 = 300;            // graded second pass for the strict-unreachable
const MAXDEG = 300;          // sinew groups: Strong's numbers with 2..300 verses

let CACHE = null;

export function loadCorpus() {
  if (CACHE) return CACHE;
  const kjv = JSON.parse(readFileSync(KJV_PATH, 'utf8'));
  const strongs = JSON.parse(readFileSync(STRONGS_PATH, 'utf8'));
  const ci = strongs.ci;     // Strong's number -> [verse refs]
  const s2e = strongs.s2e;   // Strong's number -> [english root concepts]

  // ---- canonical order ----
  const bookIdx = new Map(BOOKS.map((b, i) => [b, i]));
  const refs = Object.keys(kjv);
  const parsed = refs.map(ref => {
    const m = ref.match(/^(.*) (\d+):(\d+)$/);
    return { ref, b: bookIdx.get(m[1]), c: +m[2], v: +m[3] };
  });
  parsed.sort((A, B) => A.b - B.b || A.c - B.c || A.v - B.v);

  const N = parsed.length;
  const idxOf = new Map();
  parsed.forEach((p, i) => idxOf.set(p.ref, i));

  // ---- verse -> concepts, concept -> verses (the bipartite graph) ----
  const v2c = new Map(), c2v = new Map();
  for (const [num, verseList] of Object.entries(ci)) {
    const concepts = s2e[num] || [];
    if (!concepts.length) continue;
    for (const ref of verseList) {
      let set = v2c.get(ref); if (!set) v2c.set(ref, set = new Set());
      for (const c of concepts) set.add(c);
    }
    for (const c of concepts) {
      let set = c2v.get(c); if (!set) c2v.set(c, set = new Set());
      for (const ref of verseList) set.add(ref);
    }
  }

  // ---- BFS from John 1:1 (verse -> concept -> verse = 1 hop) ----
  function bfs(cap) {
    const hop = new Map([[SOURCE, 0]]);
    let frontier = [SOURCE], h = 0;
    const used = new Set();
    while (frontier.length) {
      h++;
      const layerC = [];
      for (const v of frontier) {
        for (const c of (v2c.get(v) || [])) {
          if (!used.has(c) && c2v.get(c).size <= cap) { used.add(c); layerC.push(c); }
        }
      }
      const next = [];
      for (const c of layerC) for (const v of c2v.get(c)) {
        if (!hop.has(v)) { hop.set(v, h); next.push(v); }
      }
      frontier = next;
    }
    return hop;
  }
  const d80 = bfs(CAP), d300 = bfs(CAP2);

  // composite distance score: strict hops 0..6, then graded far field
  const MAXHOP = 8;
  const hopOf = ref => {
    const a = d80.get(ref);
    if (a !== undefined) return Math.min(a, 6);
    const b = d300.get(ref);
    if (b !== undefined) return Math.min(MAXHOP - 1, b + 4); // 6..7
    return MAXHOP;                                            // truly unreached
  };

  // ---- light roots ----
  const lightSet = new Set();
  for (const num of LIGHT_ROOTS) for (const ref of (ci[num] || [])) lightSet.add(ref);

  // ---- verse records, canonical order ----
  const verses = parsed.map((p, i) => ({
    ref: p.ref, idx: i,
    hop: hopOf(p.ref),
    light: lightSet.has(p.ref),
  }));
  const hist = {};
  for (const v of verses) hist[v.hop] = (hist[v.hop] || 0) + 1;

  // ---- sinew groups: Strong's number -> verse indices (deg 2..MAXDEG) ----
  // every edge drawn from these is two verses sharing that exact root
  const groups = [];
  for (const [num, verseList] of Object.entries(ci)) {
    if (verseList.length < 2 || verseList.length > MAXDEG) continue;
    const ids = verseList.map(r => idxOf.get(r)).filter(x => x !== undefined);
    if (ids.length >= 2) groups.push({ num, ids, light: LIGHT_ROOTS.includes(num) });
  }

  CACHE = { verses, N, idxOf, groups, hist, MAXHOP };
  return CACHE;
}
