# cast-library — every drawing of the kid, deployed or not

Fred's cut cells (`kid-<name>.webp`), kept here so none of them is ever lost, while the live
book ships only the cells a page actually draws. **This folder is not deployed**: it is listed in
`.assetsignore`, so `wrangler deploy` uploads nothing from it.

- The **used** cells are COPIES. The live ones are in `cast/`, where the engine loads them from
  (`kidImage()` in `engine/character.js`, `/cast/kid-<name>.webp?v=19`).
- The **library-only** cells were MOVED here from `cast/` on Oct 8, 2026. A full read-through with
  every `drawImage` instrumented drew none of them, and the engine's own `kidCellsFor()` names none
  of them for any page. They were still downloaded by the page-5 warm-up (2.25 MB for the first
  13), and the rest still shipped with every deploy.

**To bring one back:** copy it to `cast/`, add its name to `KID_CORE` in `engine/character.js`,
point a page at it (by mood in `kidCell()`, or outright with `cell: 'name'`), then run
`node gen/minify.mjs`. Until it is in `KID_CORE`, `kidImage()` refuses to fetch it, so a page that
asks for a library cell keeps its fallback figure instead of hitting a 404. `CELL_FACING` still
knows which way each library cell faces.

## Used by the live book (28, copies)

| cell | page(s) | sheet | bytes |
|---|---|---|---|
| `kid-afraid-crouch.webp` | 7 `garden` | 5-emotions | 141,976 |
| `kid-dizzy.webp` | 9 `string` | 7-dizzy | 173,196 |
| `kid-eating.webp` | 22 `bread` |  | 229,246 |
| `kid-glad.webp` | 20 `born` |  | 158,020 |
| `kid-greet-wave.webp` | 31 `comes` | 11-lookup-lead-light | 104,152 |
| `kid-joy.webp` | 15 `risen`, 19 `washed` | 3-joy-sleep-read-run | 131,322 |
| `kid-kneel-calm.webp` | 5 `love`, 26 `prayer` |  | 161,228 |
| `kid-kneel-cry.webp` | 13 `paid` | 5-emotions | 157,804 |
| `kid-lead-hand.webp` | 29 `together` | 11-lookup-lead-light | 83,210 |
| `kid-lifted.webp` | 18 `twoways` |  | 158,926 |
| `kid-light-give.webp` | 30 `candle` | 11-lookup-lead-light | 87,694 |
| `kid-light-take.webp` | 30 `candle`, 32 `nonight` | 11-lookup-lead-light | 87,378 |
| `kid-look-up.webp` | 31 `comes` | 11-lookup-lead-light | 91,012 |
| `kid-look-up-wide.webp` | 10 `looking`, 31 `comes` | 11-lookup-lead-light | 89,948 |
| `kid-reach-up.webp` | 4 `made` | 6-movement | 181,440 |
| `kid-run-open.webp` | 32 `nonight` | 11-lookup-lead-light | 92,238 |
| `kid-sit-back.webp` | 25 `family`, 32 `nonight` | 10-fireside | 80,166 |
| `kid-sit-laugh.webp` | 25 `family`, 32 `nonight` | 10-fireside | 125,722 |
| `kid-sit-offer.webp` | 25 `family` | 10-fireside | 145,752 |
| `kid-sit-take.webp` | 25 `family` | 10-fireside | 129,574 |
| `kid-sowing.webp` | 21 `seeds` |  | 256,694 |
| `kid-taken-hand.webp` | 29 `together`, 31 `comes` | 11-lookup-lead-light | 86,104 |
| `kid-teary.webp` | 14 `grave` | 2-kneel-carry-teary | 186,402 |
| `kid-teddy.webp` | 23 `storm` | 4-props | 123,880 |
| `kid-trio.webp` | 24 `hands` |  | 349,616 |
| `kid-walk.webp` | 6 `turning`, 12 `bridge` | 6-movement | 161,350 |
| `kid-walk-away.webp` | 11 `road` | 6-movement | 165,144 |
| `kid-walk-joy.webp` | 16 `ran` | 6-movement | 164,654 |

## Library only, not used or deployed (30, moved here)

| cell | notes | sheet | bytes |
|---|---|---|---|
| `kid-afraid.webp` | was in KID_CORE: warmed at page 5 but never drawn; still named by kidCell() for mood 'wary'; no page reaches that branch today | 5-emotions | 158,108 |
| `kid-back.webp` | was in KID_CORE: warmed at page 5 but never drawn | 1-turnaround | 85,228 |
| `kid-breaking.webp` | was in KID_CORE: warmed at page 5 but never drawn |  | 251,748 |
| `kid-carried.webp` | was in KID_CORE: warmed at page 5 but never drawn | 2-kneel-carry-teary | 185,808 |
| `kid-cell-1.webp` | early crayon-to-brush cuts (gen/crayon-to-brush.py); never referenced by the engine |  | 150,776 |
| `kid-cell-2.webp` | early crayon-to-brush cuts (gen/crayon-to-brush.py); never referenced by the engine |  | 135,432 |
| `kid-cell-3.webp` | early crayon-to-brush cuts (gen/crayon-to-brush.py); never referenced by the engine |  | 131,706 |
| `kid-cheering.webp` | was in KID_EXTRA: never fetched | 4-props | 112,416 |
| `kid-detail-1.webp` | early crayon-to-brush cuts (gen/crayon-to-brush.py); never referenced by the engine |  | 134,272 |
| `kid-detail-2.webp` | early crayon-to-brush cuts (gen/crayon-to-brush.py); never referenced by the engine |  | 121,878 |
| `kid-detail-3.webp` | early crayon-to-brush cuts (gen/crayon-to-brush.py); never referenced by the engine |  | 86,740 |
| `kid-detail-4.webp` | early crayon-to-brush cuts (gen/crayon-to-brush.py); never referenced by the engine |  | 120,204 |
| `kid-detail-5.webp` | early crayon-to-brush cuts (gen/crayon-to-brush.py); never referenced by the engine |  | 107,444 |
| `kid-front.webp` | was in KID_CORE: warmed at page 5 but never drawn; still named by kidCell() default (no mood, facing the reader); no page reaches that branch today | 1-turnaround | 192,372 |
| `kid-hands-up.webp` | was in KID_EXTRA: never fetched | 1-turnaround | 92,794 |
| `kid-hood-down.webp` | was in KID_EXTRA: never fetched | 1-turnaround | 93,612 |
| `kid-kneel-joy.webp` | was in KID_CORE: warmed at page 5 but never drawn; still named by kidCell() for a kneel + 'joy'; no page reaches that branch today | 5-emotions | 180,600 |
| `kid-kneeling.webp` | was in KID_CORE: warmed at page 5 but never drawn; still named by kidCell() for a kneel with no mood; no page reaches that branch today | 2-kneel-carry-teary | 194,002 |
| `kid-offer.webp` | was in KID_CORE: warmed at page 5 but never drawn |  | 168,190 |
| `kid-pizza.webp` | was in KID_EXTRA: never fetched | 4-props | 135,940 |
| `kid-reading.webp` | was in KID_CORE: warmed at page 5 but never drawn | 3-joy-sleep-read-run | 125,550 |
| `kid-running.webp` | was in KID_EXTRA: never fetched | 3-joy-sleep-read-run | 139,558 |
| `kid-side.webp` | was in KID_CORE: warmed at page 5 but never drawn; still named by kidCell() for a strong turn/gaze; no page reaches that branch today | 1-turnaround | 159,310 |
| `kid-side-far.webp` | was in KID_EXTRA: never fetched | 1-turnaround | 82,240 |
| `kid-sleeping.webp` | was in KID_EXTRA: never fetched | 3-joy-sleep-read-run | 98,206 |
| `kid-sulking.webp` | was in KID_EXTRA: never fetched | 4-props | 106,142 |
| `kid-surprised.webp` | was in KID_CORE: warmed at page 5 but never drawn; still named by kidCell() for mood 'wonder'; no page reaches that branch today | 1-turnaround | 188,220 |
| `kid-three-quarter.webp` | was in KID_CORE: warmed at page 5 but never drawn; still named by kidCell() for a slight turn/gaze; no page reaches that branch today | 1-turnaround | 185,162 |
| `kid-treat.webp` | was in KID_EXTRA: never fetched | 4-props | 132,682 |
| `kid-welcome.webp` | was in KID_CORE: warmed at page 5 but never drawn |  | 177,310 |

Page numbers are the book's own (1 = the cover). A blank sheet column means cast/README.md does not record the sheet. Usage measured on the live build p=466, Oct 8, 2026.
