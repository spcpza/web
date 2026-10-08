#!/usr/bin/env node
/**
 * MINIFY THE ENGINES, AND VERSION THEM BY THEIR CONTENT.
 *
 *     node gen/minify.mjs            # build engine/*.min.js and stamp index.html
 *     node gen/minify.mjs --check    # verify index.html points at the current build (exit 1 if not)
 *
 * WHY
 *   Sep 6, 2026. `engine/character.js` and `engine/scene.js` are ~744 KB of source, ~247 KB
 *   over the wire after brotli, and they are on the critical path of every first visit.
 *   Most of that bulk is COMMENTS — and the comments in these files are the project's actual
 *   documentation: why a number is what it is, what Fred said, what broke last time. They
 *   must stay in the source, and they have no business being downloaded by a reader.
 *   So the sources keep every word, and the site serves a stripped build of them.
 *
 * ⚠⚠ AND THE VERSION IS A CONTENT HASH, NOT A NUMBER I REMEMBER TO BUMP.
 *   A hand-bumped `?v=` is the one thing that makes hard caching dangerous: forget it once
 *   and every returning reader is stranded on stale code. It also made a stale minified build
 *   possible — edit the source, forget to re-minify, and the site quietly serves yesterday's
 *   engine with today's version on it. Hashing the OUTPUT closes both: the URL cannot fail to
 *   change when the code changes, and it cannot change when the code has not. That is what
 *   then makes `/engine/*.min.js` safe to cache immutably for a year (see _headers).
 *
 * ⚠ Run this before every deploy. `--check` exits 1 if index.html is out of date, so it can
 *   be wired into a pre-deploy step rather than trusted to memory.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ENGINES = ['character', 'scene'];
const check = process.argv.includes('--check');

// a short banner survives minification, so the served file still says where it came from and
// that the real thing — comments and all — is a click away.
const banner = n => `/* balthazar.sh — engine/${n}.js, minified. The source, with every note`
  + ` explaining why each number is what it is, is at /engine/${n}.js */`;

let html = readFileSync(join(ROOT, 'index.html'), 'utf8');
let stale = false, before = 0, after = 0;

for (const n of ENGINES) {
  const src = join(ROOT, 'engine', `${n}.js`);
  const out = join(ROOT, 'engine', `${n}.min.js`);
  const raw = readFileSync(src);
  before += raw.length;

  // ⚠ NO name mangling and NO property mangling. These files reach into each other and into
  // the page through named globals and object literals (F.drawKid, window.__paintTick, the
  // CAST/SCENE tables); mangling would be a silent, page-specific breakage. Whitespace and
  // comments are 90% of the win and carry none of that risk.
  const min = execFileSync('npx', ['--yes', 'esbuild', src, '--minify-whitespace',
    '--minify-syntax', '--target=es2017', '--charset=utf8',
    `--banner:js=${banner(n)}`], { maxBuffer: 1 << 28 });
  after += min.length;

  const hash = createHash('sha256').update(min).digest('hex').slice(0, 10);
  const want = `/engine/${n}.min.js?v=${hash}`;
  const re = new RegExp(`/engine/${n}(?:\\.min)?\\.js\\?v=[0-9a-z]+`, 'g');
  const has = (html.match(re) || [])[0];
  if (has !== want) stale = true;

  if (!check) {
    if (!existsSync(out) || readFileSync(out).compare(min) !== 0) writeFileSync(out, min);
    html = html.replace(re, want);
  }
  console.log(`  ${n}.js  ${(raw.length / 1024).toFixed(0)} KB -> ${(min.length / 1024).toFixed(0)} KB  v=${hash}${has === want ? '' : '  (index.html updated)'}`);
}

if (check) {
  console.log(stale ? 'STALE — run: node gen/minify.mjs' : 'index.html is current.');
  process.exit(stale ? 1 : 0);
}
writeFileSync(join(ROOT, 'index.html'), html);
console.log(`  total ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB source served`);
