# THE BEAUTY QUEUE — Sep 12, 2026

Fred: "create jobs on queue so i can leave the computer and let you work on all of the pages?
make it more beautiful. find out how from the scripture." And before that: "nothing structurally
wrong is the wrong way to see things. this is art. everything is possible in art. we just need
to make it beautiful." / "it is for the LORD after all."

## The job, per page (ONE plate at a time, never a fleet)
1. READ THE PAGE. Its poem + verse ref live in index.html (`<section class="page"` k); the plate's
   intent is the header of gen/plates/<name>.mjs. Look up the verse with the truth MCP
   (`scripture` lookup) and ask: what does the verse NAME that the picture lacks, and what light,
   depth or colour would make this page stop a child? Scripture rules the move, not taste.
2. LOOK before touching: headless Chrome 1440×900 at https://balthazar.sh/#k, and 1:1 crops.
3. ONE beauty move (or two if they are the same idea). Keep every ruling Fred has made on that
   plate (read the header comments — "Fred:" lines are law). Munch: living things curve, made
   things are straight. No pure black. Chiaroscuro: darken the surround to make light read.
   Hairline glass bevel is the engine's; free per-stroke sizes; manifold 0 on warm earth.
4. BUILD: `node gen/build.mjs <name>` then the frames that already exist on disk for that plate
   (`ls plates-vg/<name>-*-b*` — if -b1..-b6 exist: `for f in 1..6: BOIL_FRAME=$f BOIL_N=6`;
   if only -b1/-b3: `BOIL_FRAME=3 BOIL_N=6`; cover: 12 frames). ⚠ NEVER `pkill` Chrome while a
   build runs — the rasterizer IS headless Chrome. ⚠ never `import('./gen/build.mjs')`.
5. CHECK: composite the planes (+ Color 1.25 / Contrast 1.05) or render through the local page
   (python3 -m http.server 8899 in the repo) and LOOK at a crop. If it is not more beautiful,
   iterate before shipping. Traps met so far: halo darker than the sky = dark planet; mist bands
   = fog wall; strata edge-to-edge = wires; too-dark near ground = a pit; puddles must sit where
   the light actually is; a pale cuff is not paper.
6. DEPLOY: PV +1 in engine/scene.js AND version.json, `node gen/minify.mjs`,
   `python3 gen/stamp-index.py`, `npx wrangler deploy` (from the repo), md5-verify a few planes
   live. Only deploy when every plate on disk is consistent (no build mid-write).
7. RECORD: tick the page below with one line (what changed, what the verse said), and append to
   ~/.claude/projects/-Users-f/memory/beauty_pass_sep12.md.

## Order (least-stopping first, from the 33-shot sheet), status
- [x] lost (7) [Romans 6:23] — cold moon, night depth, tussocks (p=438)
- [x] turning (5) [Romans 5:12] — cool shadow, stones through it (p=438)
- [x] paid (12) [1 Corinthians 15:3] — rock hill lit from the cross, boulders (p=438)
- [x] looking (9) [Luke 19:10] — plain refined; pool softened + reflection (p=436/439)
- [x] road (10) [Luke 15:18] — wheat, ruts, ledges, wisps (p=437)
- [x] bridge (11) [John 14:6] — the Light redrawn in the engine: glow rim instead of a brown outline, a body with form (p=440)
- [x] ran (15) [Luke 15:20] + twoways (17) [Luke 15:24] — the same redrawn Light, crops approved (p=440)
- [x] made (3) [John 1:3] — corners deepened, the field seeded with stars (Gen 1:16 'he made the stars also') (p=440)
- [x] beginning (1) [John 1:1] — the first light shimmering, broken and faint, on the face of the deep (Gen 1:2) (p=440)
- [x] flame (2) [Genesis 1:3] — the SUN itself over the waters (far plane, above the swirl sheets) + its glitter path on the sea (p=440)
- [x] love (4) [1 John 4:8] — the far country takes the sun: lilac-rose, gold-olive, green-gold ranges — it was three grey cards (p=440)
- [x] garden (6) [Genesis 3:9] — reviewed at full size: the fire, the cypress, the stars, the child hiding — Fred's loved page; no move (a change here would be taste, not beauty)
- [x] string (8) [John 10:28] — the counted birds redrawn as gull-wings (p=437); the gale itself reviewed, no further move
- [x] grave (13) [1 Corinthians 15:4] — reviewed: moon, sealed stone, the child small — the night is a place; the black tree got its moonlit floor (p=436). No further move
- [x] risen (14) [Matthew 28:6] — reviewed: dawn over the same hill, the tomb blazing, the stone rolled clear — already beautiful; no move
- [x] gift (16) [Ephesians 2:8] — reviewed: the palace blazing, the path up the hill, the field lush — already beautiful; no move
- [x] washed (18) [Isaiah 1:18] — the doves' near-black pockets (two dark STAINS on the page about stains going) → a faint violet veil, third cut (p=440)
- [x] born (19) [2 Corinthians 5:17] — reviewed: the child lit from within in a new meadow, trees, sky — already beautiful; no move
- [x] seeds (20) [John 15:5] — reviewed: the flowering field under the turning sky — already beautiful; no move
- [x] bread (21) [John 6:35] — reviewed: the orchard, the apple in hand — already beautiful; no move
- [x] storm (22) [Matthew 7:25] — reviewed: the churn, the bent tree, the gold roots on the rock — already beautiful; no move
- [x] hands (23) [Ecclesiastes 4:12] — reviewed at full size: sky, trees, meadow, the trio — already beautiful; no move
- [x] family (24) [Acts 2:42] — reviewed: the camp, the fire, four faces, one Light — already beautiful; no move
- [x] prayer (25) [Jeremiah 33:3] — reviewed: the dark room, the lit child, the window — already beautiful; no move
- [x] light (26) [John 8:12] — reviewed: the heart in the glory, the name — already beautiful; no move
- [x] come (27) [Revelation 22:17] — reviewed: the open door, the world beyond, the water of life flowing out — already beautiful; no move
- [x] together (28) [1 Corinthians 3:9] — reviewed: two children on the road of light, the glory ahead — already beautiful; no move
- [x] candle (29) [Matthew 5:16] — the four moths were black ticks in the swirl → lit, dusty-mauve, gold on the flame side (p=440)
- [x] comes (30) [Revelation 22:12] — reviewed: the rent heaven, four faces lifted — already beautiful; no move
- [x] nonight (31) [Revelation 22:5] — reviewed: the city of light, the children arriving — already beautiful; no move
- [x] word (0/32) [John 1:4] — Fred's own rulings today (p=425–435): the spiral spirals, the thread is a ring through the Word with 16 wounds, the star is chromatic, the wheel turns slowly. Left exactly as he set it.

## Log

### Sep 12, 2026 — the queue is done (p=440)
Every page was read against its verse and looked at through the real render. Moves shipped
today across the pass: looking (plain, pool + reflection), road (wheat, ruts, ledges, wisps),
string (gull-wing birds), grave (the moonlit tree), turning (a cool shadow), lost (a cold moon,
night depth), paid (a rock hill lit from the cross), the Light Himself redrawn in the engine
(bridge, ran, twoways: glow rim, body with form), made (stars, dark corners), beginning (the
shimmer on the face of the deep), flame (the sun and its glitter path), love (the far country
takes the sun), washed (the doves' stains → a veil), candle (lit moths); plus eight cast cells
cleared of trapped paper. Sixteen pages were reviewed and left as they are — already beautiful.
Verified live by md5 at p=440. What the next pass should ask of each page is the same
question: what would make this stop a child.
