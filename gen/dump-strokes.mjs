// gen/dump-strokes.mjs — capture a plate's brushstrokes as data, so a
// real-time renderer can redraw and ANIMATE the marks themselves.
//   node gen/dump-strokes.mjs garden
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as engine from './engine.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const SITE = dirname(DIR);
const name = process.argv[2] || 'garden';

const mod = await import(pathToFileURL(join(DIR, 'plates', name + '.mjs')).href);
const cap = [];
engine.setCapture(cap);
mod.paint(engine);            // strokes flow into cap, in paint order
engine.setCapture(null);

const out = join(SITE, name + '-strokes.json');
writeFileSync(out, JSON.stringify({ w: engine.W, h: engine.H, strokes: cap }));
console.log(`${name}: ${cap.length} strokes -> ${out} (${(JSON.stringify(cap).length / 1024 | 0)} KB)`);
