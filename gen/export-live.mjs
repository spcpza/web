#!/usr/bin/env node
// gen/export-live.mjs — press the living layer from the same plate.
//
//   node gen/export-live.mjs        -> live-word.json (site root)
//
// Exports a compact sample of the word layout for the front/back cover
// overlay: the center, the full scarlet-thread polyline, and ~1,400 motes
// chosen to carry the painting's life — every waypoint verse, the warmest
// gold near the center, and a stratified sweep of the rest of the wheel.
// Every coordinate is the painting's own; the overlay invents nothing.
//
// Format (all coords 1-decimal, viewBox space 800x500):
//   { center: [x, y],
//     thread: [[x, y], ...],            // start = Genesis 3:15, end = Revelation 22:13
//     motes:  [[x, y, size, warm], ...] }  // warm in 0..1

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout } from './plates/word.mjs';

const SITE = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(SITE, 'live-word.json');
const TARGET = 1400;

const r1 = v => Math.round(v * 10) / 10;
const L = layout();

const picked = [];
const taken = new Set();
function take(i) {
  if (taken.has(i)) return;
  taken.add(i);
  const m = L.motes[i];
  picked.push([r1(m.x), r1(m.y), r1(m.size), r1(m.warm)]);
}

// 1. the thirteen waypoint motes — the wounds must always twinkle
const wpIdx = L.waypoints.map(w =>
  L.motes.findIndex(m => m.x === w.x && m.y === w.y));
for (const i of wpIdx) if (i >= 0) take(i);

// 2. ~400 warm motes nearest the center — the gold that breathes
const warmNear = L.motes
  .map((m, i) => ({ i, m }))
  .filter(o => o.m.light)
  .sort((a, b) => a.m.r - b.m.r);
for (let k = 0; k < Math.min(400, warmNear.length); k++) take(warmNear[k].i);

// 3. the rest stratified across the whole wheel (canon order = angle order)
const remaining = TARGET - picked.length;
const stride = L.motes.length / remaining;
for (let k = 0; k < remaining; k++) take(Math.min(L.motes.length - 1, Math.round(k * stride)));

const json = JSON.stringify({
  center: [r1(L.center.x), r1(L.center.y)],
  thread: L.thread.map(p => [r1(p[0]), r1(p[1])]),
  motes: picked,
});
writeFileSync(OUT, json);
console.log(`live-word.json: ${picked.length} motes, ${L.thread.length} thread points, ${(json.length / 1024).toFixed(1)} KB`);
