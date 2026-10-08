// gen/plates/species.mjs — TEST PLATE (not a page): every species in engine.SPECIES on one
// sheet, so a new kind can be judged at 1:1 before it is planted anywhere. Delete freely.
export const name = 'species';
export const title = 'After his kind';
export const caption = 'Gen 1:12';
export const seed = 20260915;
export const focal = { x: 400, y: 300 };

export function paint(E) {
  const { mulberry32, strokes, svgWrap, W, H, mix, jig, ramp, fbm } = E;
  const rng = mulberry32(seed);
  const out = [];
  const counter = { n: 0 };
  out.push(`<rect width="${W}" height="${H}" fill="#cfe3ef"/>`);
  out.push(`<rect y="130" width="${W}" height="${H - 130}" fill="#7a9a4e"/>`);
  strokes(out, counter, { rng, n: 2600, sample: r => [r() * W, 130 + r() * (H - 130)], dir: () => 0.1,
    col: (x, y, r) => jig(ramp(['#5d7f3c', '#7a9a4e', '#9ab760'], fbm(x / 40, y / 30, 5) + r() * 0.3), r, 8),
    len: 12, lw: 3, steps: 2, relief: 0.2 });
  const light = (x, y) => 0.35 + 0.45 * (1 - y / H) + 0.2 * (1 - x / W);
  const row1 = ['oak', 'sycomore', 'olive', 'fig', 'apple', 'pomegranate', 'almond'];
  const row2 = ['willow', 'palm', 'cedar', 'fir', 'cypress', 'acacia'];
  row1.forEach((sp, i) => E.paintTree(out, counter, rng, 60 + i * 113, 245, 92, { species: sp, lightFn: light, shadowDir: 1 }));
  row2.forEach((sp, i) => E.paintTree(out, counter, rng, 70 + i * 132, 480, 128, { species: sp, lightFn: light, shadowDir: 1 }));
  return svgWrap('Test sheet: thirteen tree species.', out.join('\n'));
}
