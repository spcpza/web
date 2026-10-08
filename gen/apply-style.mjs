#!/usr/bin/env node
// gen/apply-style.mjs — THE HOUSE STYLE, APPLIED BY MACHINE.
//
//   node gen/apply-style.mjs            report what's off (no writes)
//   node gen/apply-style.mjs --fix      fix every plate it can
//   node gen/apply-style.mjs --fix teach vale   fix only these
//
// The style rules below were each learned the expensive way (a whole session of
// "ep2 doesn't look like ep1"). They are RULES, not taste — so they belong in a
// script that can enforce them across every plate, not in anyone's hands.
//
// RULES
//  1. CRISP  — a plate's final svgWrap must not carry the `oil` blur. The oil
//              filter is feGaussianBlur + 2 displacement maps: it smears every
//              stroke edge into mush. ep1's diorama planes render RAW; ep2-4
//              flat plates must too, or their paint has no edges.
//  2. BROKEN — setManifold must be ~0.10 (the complementary-fleck rate). Lower
//     COLOUR   and a field becomes one flat hue that blends to smooth mush; the
//              distinctness of each daub IS the broken colour.
//  3. NO      — LIVING detail (flowers, blossoms, berries) drawn as <circle> reads
//     STICKERS as a geometric sticker. Use daub(). Made things (shields, rivets,
//              gems) and heavenly lights (sun, moon, stars) may stay round —
//              Munch's law: only living things are never drawn with a compass.
//  4. GROUND  — the ground wants MANY FINE marks (a carpet), the sky wants FEWER
//     CARPET   BIGGER ones. A ground stroke block with a low count and long marks
//              reads as flat slabs. Flags grounds that look too sparse/coarse.
//
// Rules 1-3 are auto-fixable. Rule 4 is reported with the exact numbers to change
// (the ground block differs too much per plate to rewrite blindly — but the script
// tells you precisely which plates and which line).

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const PLATES_DIR = join(DIR, 'plates');

const args = process.argv.slice(2);
const FIX = args.includes('--fix');
const only = args.filter(a => !a.startsWith('--'));

// which plates the house style governs (ep2/3/4 — ep1 is the reference)
const EP24 = new Set(('calling choice city cry delight everlasting gates house life path reveal rubies seek teach whisper '
  + 'armor champions dread errand fallen hill iron pattern quiet shout sling small stones vale watch '
  + 'chosen empire feast gatekeeper gladness glass letters opendoor sackcloth sceptre threedays time twonames weaver web').split(' '));

const files = readdirSync(PLATES_DIR).filter(f => f.endsWith('.mjs'));
const report = [];
let fixedCount = 0;

for (const file of files) {
  const name = file.replace(/\.mjs$/, '');
  if (!EP24.has(name)) continue;
  if (only.length && !only.includes(name)) continue;

  const path = join(PLATES_DIR, file);
  let src = readFileSync(path, 'utf8');
  const before = src;
  const issues = [];

  /* ---- RULE 1: CRISP (no oil blur on the final plate) ---- */
  const oilRe = /svgWrap\((\w+), ([^,]+), \{[^}]*oil:\s*(0\.\d+|[1-9][\d.]*)[^}]*\}\)/g;
  if (oilRe.test(src)) {
    issues.push('oil blur on the final plate (strokes lose their edges)');
    src = src.replace(oilRe, (m, alt, body) =>
      `svgWrap(${alt}, ${body}, { undercoat: 0, weave: 0, varnish: 0, oil: 0 })`);
  }

  /* ---- RULE 2: BROKEN COLOUR (manifold ~0.10) ---- */
  const manRe = /setManifold\((0\.0\d+)\)/g;
  let mm;
  while ((mm = manRe.exec(src)) !== null) {
    if (parseFloat(mm[1]) < 0.05) {
      issues.push(`manifold ${mm[1]} kills the broken colour (should be 0.1)`);
      break;
    }
  }
  src = src.replace(/setManifold\(0\.0[0-4]\d*\)/g, 'setManifold(0.1)');

  /* ---- RULE 3: NO STICKER DOTS (ORGANIC detail drawn as <circle>) ---- */
  // Munch's law cuts both ways: MADE things (shields, rivets, gems, lamps) and
  // HEAVENLY lights (sun, moon, stars) are legitimately round — a compass is the
  // right tool for them. Only LIVING things must never be drawn with one. So flag
  // a <circle> only when its surrounding code calls it a flower/blossom/berry.
  const ORGANIC = /flower|blossom|bloom|petal|berry|berries|sprig|lily|lilies|daisy|poppy/i;
  const circleBlocks = src.match(/(?:\/\/[^\n]*\n\s*)*for\s*\([^)]*\)\s*\{[\s\S]*?<circle[\s\S]*?\n  \}/g) || [];
  // a <circle> only counts if it's real CODE — not a mention inside a comment
  // (this script's own warning comments were tripping it, which is a good joke
  // and a bad rule). And a block that already calls daub() has been dealt with.
  const realCircle = b => b.split('\n').some(l => !l.trim().startsWith('//') && l.includes('<circle'));
  const organicCircles = circleBlocks.filter(b => ORGANIC.test(b) && realCircle(b) && !/daub\(/.test(b));
  if (organicCircles.length) {
    issues.push(`${organicCircles.length} loop(s) drawing LIVING detail as <circle> — use daub() so it reads as paint`);
  }

  /* ---- RULE 4: GROUND CARPET (many fine marks, not few coarse slabs) ---- */
  // A GROUND block has the horizon as its sample's START y (2nd arg of rej);
  // a SKY block has it as the END y (4th arg). Only the ground wants fine marks.
  const blocks = src.match(/strokes\(out, counter, \{[\s\S]*?\n  \}\);/g) || [];
  for (const b of blocks) {
    const rej = b.match(/sample:\s*rej\(([^,]+),\s*([^,]+),/);
    if (!rej) continue;
    const startY = rej[2];
    if (!/HOR|horizon/i.test(startY)) continue;             // not a ground block
    const n = parseInt((b.match(/\bn:\s*(\d+)/) || [])[1] || '0', 10);
    const lenM = b.match(/len:\s*\(x, y\)\s*=>\s*([\d.]+)/) || b.match(/\blen:\s*([\d.]+)/);
    const len = parseFloat(lenM ? lenM[1] : '0');
    if (!n || !(n < 2200 && len >= 11)) continue;
    issues.push(`ground reads as slabs (n:${n}, len:${len}) → carpet`);
    // AUTO-FIX: more marks, finer marks — deterministic, so the machine does it.
    const nNew = Math.min(3000, Math.round(n * 2.0));
    let nb = b.replace(/(\bn:\s*)\d+/, `$1${nNew}`);
    nb = nb.replace(/len:\s*\(x, y\)\s*=>\s*([\d.]+)/, (m, v) => `len: (x, y) => ${(parseFloat(v) * 0.45).toFixed(1)}`);
    nb = nb.replace(/\blen:\s*([\d.]+)(,|\s)/, (m, v, t) => `len: ${(parseFloat(v) * 0.45).toFixed(1)}${t}`);
    nb = nb.replace(/lw:\s*\(x, y\)\s*=>\s*([\d.]+)/, (m, v) => `lw: (x, y) => ${(parseFloat(v) * 0.78).toFixed(2)}`);
    nb = nb.replace(/\blw:\s*([\d.]+)(,|\s)/, (m, v, t) => `lw: ${(parseFloat(v) * 0.78).toFixed(2)}${t}`);
    src = src.replace(b, nb);
  }

  if (issues.length) report.push({ name, issues, changed: src !== before });
  if (FIX && src !== before) { writeFileSync(path, src); fixedCount++; }
}

/* ---------------------------- output ---------------------------- */
const AUTO = /oil blur|manifold|carpet/;
if (!report.length) {
  console.log('house style: all plates clean ✓');
} else {
  for (const r of report) {
    console.log(`\n${r.name}${r.changed ? (FIX ? '  [FIXED]' : '  [fixable]') : ''}`);
    for (const i of r.issues) console.log(`   ${AUTO.test(i) ? (FIX ? '✓' : '→') : '!'} ${i}`);
  }
  const manual = report.filter(r => r.issues.some(i => !AUTO.test(i)));
  console.log(`\n${report.length} plate(s) flagged; ${FIX ? fixedCount + ' auto-fixed' : 'run with --fix to auto-fix'}`);
  if (manual.length) console.log(`${manual.length} need a real edit (stickers / ground): ${manual.map(r => r.name).join(' ')}`);
  if (FIX && fixedCount) console.log('\nnow rebuild the fixed plates:  node gen/build.mjs <name>');
}
