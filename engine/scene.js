/* ep2/scene.js — RENDER ONCE, COMPOSITE FOREVER.
 *
 * The lab architecture (Fred: "lab feels good!!!") folded into the book:
 * every character and living object is rendered ONE time through the sprite
 * factory in character.js, then animated purely with CSS transforms, motion
 * paths and timers. No requestAnimationFrame loop; no per-frame drawing; the
 * main thread is idle between events. Interactivity is a class toggle.
 *
 *   · pilgrim/townsfolk: two frames (eyes open/shut); blink = timer swap;
 *     sway/bob = CSS keyframes; tap → hop + spark burst
 *   · the Radiant One: ONE frame (she never blinks — Ps 121:4), breath-slow sway
 *   · trees/bushes/crowns: one frame, CSS rotate about the trunk base
 *   · flowers: one frame, gentle nod
 *   · birds: 2-frame flap on a CSS motion path (offset-path), drifting forever
 *   · glows/wisps: pure CSS gradient divs (per-page spec below)
 *   · whale spout: one frame, scale/opacity breath cycle
 *
 * Only the current page's sprites run their animations (.on gate) — neighbours
 * hold still. prefers-reduced-motion: everything stands as a fine still. */
(function () {
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = (navigator.maxTouchPoints || 0) > 1 && Math.min(innerWidth, innerHeight) < 820;   // a hand-held screen: the covers run lighter here (see the frame loop)
  var book = document.getElementById('book');
  var F = window.__charFactory;
  if (!book || !F) return;
  var pages = [].slice.call(book.querySelectorAll('.page'));

  // ⚠ DECLARED UP HERE ON PURPOSE. `var WALK = {}` sitting next to buildWalk ran AFTER the
  // per-episode block that fills it, and re-initialised it to empty — so the walker was
  // built into a table nothing ever read and the page came up with an empty field. `var`
  // hoists the declaration; it does not hoist the assignment.
  var WALK = {};
  // ⚠ A HELD OBJECT MUST RENDER AFTER THE ACTOR, NOT BEFORE. `bread` (21): Fred
  // asked for an apple "on the hands of the kid" — painted into the plate, it
  // landed either fully hidden (the actor is a full opaque cutout drawn OVER
  // the plate) or, pushed low enough to clear his silhouette, reading as him
  // sitting on it ("now he is sitting on the apple"). The fix is the same one
  // the garden's cypress already uses (critters marked `front` append AFTER
  // `cast.actors`, so they occlude him): a tiny static SVG apple, appended
  // after the cast in buildLayer, positioned at his hands. x/y measured off
  // cast/kid-kneel-calm.webp mapped through his box (CAST1[21]: x486 y400
  // h74) — MUST stay in sync with `HAND` in gen/plates/bread.mjs, which uses
  // the same point to keep the ground apples clear of his hands.
  // ⚠ r IS NOT A PLATE-UNIT SIZE. Measured live: fit.s here is 1.6, but the
  // actor himself renders at an effective ~2.78 (the diorama gives actors an
  // extra depth-scale beyond fit.s) — so a held prop using plain fit.s comes
  // out visibly smaller than it looks next to him. r=11 measured against his
  // own rendered width to land at roughly two-hands size, not a plate value.
  // ⚠ NOW A LIST PER PAGE, WITH ITS OWN IMAGE. Was one hardcoded apple; twoways
  // (17) needs a second, different prop — the Father's hand, resting over the
  // carried child's shoulder so his BACK reads as covered by the Father's own
  // body (Fred: "make the kid in front of the father, so that the back of the
  // kid is covered by the body of the father"). Same reasoning as the apple:
  // he's a runtime sprite composited after the whole plate, so nothing baked
  // can ever sit in front of him — only another front-layer piece can.
  // {x,y}=plate centre, r=half-width (plate units, NOT fit.s — see the note
  // below on why), src=cast filename, aspect=height/width of that source
  // image, rot=optional degrees.
  var HELD = {
    // ⚠ THE LIGHT'S ARMS, DRAWN OVER THE CHILD. He is painted into the plate and the
    // child is a sprite composited after it, so the Light can never reach in front of him
    // from the plate — and a piggyback's arms cross the child. The shape is traced from
    // Fred's own drawing over a render; see gen/build-light-hands.mjs for the geometry,
    // the measured outline brown, and why the fade is baked into the asset rather than
    // set here.
    // ⚠ PAIRED WITH THE PLATE. gen/plates/twoways.mjs cuts his baked arms to a hidden
    // stub so this piece is the only visible arm. Turning this off means putting those
    // back to full length, and vice versa — otherwise he has two pairs, or none.
    17: [ { x: 342.5, y: 352, r: 36, xk: 1.14, src: 'light-hands.webp', aspect: 48 / 72 } ],
    // (bread/21's held apple is retired — Fred drew the child holding it, so the apple
    //  is part of cast/kid-eating.webp and no longer a prop composited over him.)
  };
  /* ---- per-page ambience: glows [x,y,r,kind], wisps [x,y] (plate coords) ---- */
  var AMBIENCE = {
    0: { glows: [[505, 195, 120, 'warm'], [272, 488, 26, 'cold'], [762, 404, 20, 'warm']], wisps: [[300, 348], [598, 356], [180, 396]] },   // + a waking house window (its burst hotspot already lives there)
    1: { glows: [[442, 330, 95, 'warm']] },
    3: { glows: [[282, 368, 56, 'cold'], [758, 210, 90, 'warm']], wisps: [[258, 404, 'green'], [278, 416, 'green']] },
    4: { glows: [[478, 220, 110, 'warm']] },
    5: { glows: [[252, 226, 120, 'warm']] },
    6: { glows: [[452, 288, 95, 'warm']] },
    7: { glows: [[690, 150, 120, 'warm'], [120, 420, 70, 'cold']] },
    8: { glows: [[596, 260, 110, 'warm']] },
    9: { glows: [[566, 352, 80, 'warm'], [428, 320, 80, 'warm']] },
    10: { glows: [[648, 280, 110, 'warm']] },
    11: { glows: [[540, 240, 110, 'warm']] },
    12: { glows: [[554, 338, 90, 'warm']] },
    13: { glows: [[552, 258, 130, 'warm']] },
    14: { glows: [[352, 236, 110, 'warm']] },
  };

  /* ---- ⚠ THE RADIAL WIPE — the hand-over as EMISSION, not as a fade ----
     Fred: "to make things smoother you work on the animation rather than adding more
     drawings, what other transition styles do you have?" This is the answer for a page
     whose subject IS light leaving a source. The new drawing is not faded in everywhere
     at once; it OPENS from the star outward, and the old one is erased by the very same
     travelling ring. The two masks are exact complements — the disc fades out across
     [r, r+f] while the complement fades in across the same band — so coverage sums to one
     at every radius: no half-transparent dip, no double image in the gaps, no moment when
     the plane shows two versions of one mark. Each drawing lives two slots (arriving,
     then being wiped away) and is blank for the rest of the turn.
     ⚠ MEASURED ON THE PHONE FIRST (/wipe-test): 60fps, worst frame 32ms — cost is not the
     objection. What the pilot DID show: Safari does not interpolate mask-image, it STEPS
     between the keyframes you author. So smoothness here is bought with stops, which are
     free, instead of with drawings, which are megabytes. */
  function wipeMask(a, b, inv) {
    var g = 'radial-gradient(circle at var(--wx,31%) var(--wy,30%),'
          + (inv ? 'transparent ' + a.toFixed(1) + '%,#000 ' + b.toFixed(1) + '%'
                 : '#000 ' + a.toFixed(1) + '%,transparent ' + b.toFixed(1) + '%') + ')';
    return '-webkit-mask-image:' + g + ';mask-image:' + g;
  }
  /* ---- ⚠ TRANSFORM IN-BETWEENING — motion BETWEEN the drawings, not only at the cut ----
     Drawings are poses; an in-between is what a real animation department draws to carry
     the eye from one pose to the next. We cannot draw one for free, but we can TURN the
     pose we already have: each drawing rides a wrapper that rotates slowly about the
     light while it is on screen, so the field is never actually still — it steps at the
     wipe and creeps in between.
     ⚠ THE AMPLITUDE IS CAPPED BY GEOMETRY, not by taste. A plane is a full-bleed image;
     rotating it opens triangles of nothing at the corners. The only cover is the 6%
     overscan (DIO_SCALE), and the up/down parallax already spends 11px of it, so the far
     corner may travel about 8px => ~0.75 degrees. That is roughly a QUARTER of the step
     between drawings, so this softens the cut, it does not replace it. Anything bigger
     would need every plane scaled up, which misregisters the painting against itself.
     ⚠ It must live on a WRAPPER: camApply writes `transform` on the plane itself every
     frame for the parallax, and a CSS animation on the same property would win the cascade
     and kill the tilt. Wrapper takes the turn, image keeps the camera. */
  function tweenKeyframes(n) {
    var out = '@keyframes dioTweenN' + n + '{', K = 8, j, u, a;
    for (j = 0; j <= K; j++) {
      u = (j / K) * (2 / n);                       // its two-slot life, as a fraction of the cycle
      a = 0.75 * Math.sin(Math.PI * 2 * u) / Math.sin(Math.PI * 2 * (2 / n));
      out += ((j / K) * 100).toFixed(2) + '%{rotate:' + a.toFixed(3) + 'deg}';
    }
    return out + '}.dio-tween{position:absolute;inset:0;pointer-events:none;'
         + 'animation-timing-function:linear;animation-iteration-count:infinite;}'
         + '.dio-tween-n' + n + '{animation-name:dioTweenN' + n + ';}';
  }
  function wipeKeyframes(n) {
    var slot = 100 / n, K = 16, f = 14, out = '@keyframes dioBoilW' + n + '{', j, q, r, t;
    for (j = 0; j <= K; j++) {                     // ARRIVING: a disc opening outward
      q = j / K; r = q * 100; t = q * slot;
      out += t.toFixed(2) + '%{' + wipeMask(r, r + f, false) + '}';
    }
    for (j = 1; j <= K; j++) {                     // DEPARTING: erased by the same ring
      q = j / K; r = q * 100; t = slot + q * slot;
      out += t.toFixed(2) + '%{' + wipeMask(r, r + f, true) + '}';
    }
    out += (2 * slot).toFixed(2) + '%,100%{' + wipeMask(100, 114, true) + '}}';
    return out + '.dio-boil-w' + n + '{animation-name:dioBoilW' + n + ';'
         + 'animation-timing-function:linear;animation-iteration-count:infinite;}';
  }

  /* ---- ⚠ A STALE TAB REPAINTS ITSELF ----
     Fred, for the third time today, in three different words: "on desktop i still see the
     old picture", "if i let the screen stay for a while, it also shows the old picture",
     "it is like the old and new image just change with each other". Every one of those is
     the same thing: a page whose HTML was fetched before the last deploy keeps asking for
     the OLD asset version, so it faithfully renders old art — and when a page boils, it
     cross-fades two OLD drawings, which looks exactly like new and old swapping.
     Nothing server-side can fix a document already in memory. So the page checks: it asks
     for version.json (never cached), and if the build it was born with is not the build
     that is live, it reloads itself, once. */
  (function () {
    try {
      if (sessionStorage.getItem('sc-reloaded') === PV) return;   // already refreshed for this build
      fetch('/version.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (v) {
        if (v && v.pv && v.pv !== PV) {
          // ⚠ MARK THE PAGE'S OWN PV, NEVER THE SERVER'S. Storing the server's value only
          // guards the case this was written for (server AHEAD of a stale tab). If PV here
          // is ever AHEAD of version.json — bump PV, forget version.json, deploy — the
          // stored value can never equal PV, so the page reloads, checks, reloads, forever.
          // That took the whole site down on Aug 12: "the page is not loading, just having a
          // seizure." Keyed on PV it reloads exactly ONCE either way.
          sessionStorage.setItem('sc-reloaded', PV);
          location.reload();
        }
      }).catch(function () {});
    } catch (e) {}
  })();

  // which sheet travels, how far (as a share of the frame), and how long one circuit takes.
  // ⚠ declared HERE, above the stylesheet, because the keyframes are generated from it.
  // ⚠ OFF, AND HONESTLY SO. Fred asked for the breath to be MOVEMENT rather than blinking,
  // and this was my attempt: park the boiling sheet on a wrapper that walks a slow circle, so
  // the CSS supplies travel while the drawings supply the repaint underneath. The wrapper is
  // built correctly — the on-screen diagnostic confirmed the class, the duration and the
  // plane — and it still produced NO measurable travel on the phone across three variants
  // (independent `translate`, `transform`, and literal per-page keyframes with no var/calc).
  // Worse, it DAMPED the boil: the sky's change per second fell from 6.4 to 3.2. Something in
  // how these plane elements are composited defeats a transform on an ancestor, and I could
  // not find it from here.
  // Left in place, disabled, because the diagnosis is worth more than the code: the next
  // attempt should put the travel IN THE DRAWINGS (paint each frame's strokes further along
  // the flow, which is what Fred meant by "draw the wind movements") rather than transforming
  // a finished sheet.
  var ORBIT = {};
  /* ⭐ SPIN — the covers' verse-motes TURN (Fred, Sep 8: "animate the dots (verses) as well!").
     page -> plane -> seconds per clockwise turn. Not baked: the mote shells are a disc of
     31,102 true positions, and a rigid turn of a disc is exactly what a compositor transform
     does for free, at 60fps, with no extra planes. ⚠ THE OLD TRAP (see the rigid-rotation
     note in the keyframes): a transform-origin is a point on the ELEMENT BOX, and under
     `object-fit: cover` that is not the point in the picture. So a spinning plane is NOT
     cropped by its own box: it sits in a `.dio-spin` host sized to the raster's full cover
     rectangle (spinFit), the picture fills it exactly, the Word is at 50%/51.6% of it, and
     the clipping is done by the static `.sc-dio` overflow — a straight crop edge never turns.
     All shells turn at ONE rate, clockwise with the canon, near the speed the sheets' paint
     flows inward: one wind, one wheel (RIM in word.mjs now holds every mote, so nothing on the
     wheel stands still except the Word). */
  var SPIN = {};
  function spinFit(host, box) {
    var W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
    var s = Math.max(W / 1600, H / 1000), dw = 1600 * s, dh = 1000 * s;
    host.style.left = ((W - dw) * 0.5).toFixed(1) + 'px'; host.style.top = ((H - dh) * CROP_Y).toFixed(1) + 'px';
    host.style.width = dw.toFixed(1) + 'px'; host.style.height = dh.toFixed(1) + 'px';
  }

  /* ---- style, injected once ---- */
  var css = ''
    // ⚠ the sprites travel WITH their scene. If the painting swells through a turn and the
    // characters standing in it do not, they read as stickers on the glass rather than people
    // in the place. `scale` is independent of `transform`, which camApply owns for the tilt.
    + '.sc-layer{position:absolute;inset:0;overflow:visible;pointer-events:none;will-change:transform;-webkit-backface-visibility:hidden;backface-visibility:hidden;'
    +   'scale:calc(1 + var(--spz,0) * 0.72);}'
    + '.sc-cutout{position:absolute;pointer-events:none;will-change:transform;-webkit-backface-visibility:hidden;backface-visibility:hidden;}'   // a figure CUT from the oil plate → a real object that still looks like the painting
    + '.sc-cutout canvas{position:absolute;inset:0;width:100%;height:100%;}'
    + '.sc{position:absolute;will-change:transform;}'
    + '.sc canvas{position:absolute;inset:0;width:100%;height:100%;}'
    + '.sc .shut{visibility:hidden}'
    + '.sc.blink .open{visibility:hidden}.sc.blink .shut{visibility:visible}'
    + '.sc .glad{visibility:hidden}'                                              // the Radiant's glad face — she smiles when you come to her
    + '.sc.smiling .open{visibility:hidden}.sc.smiling .glad{visibility:visible}'
    + '.sc-actor{pointer-events:none;transform-origin:50% 96%;}'   // Sep 25: figures no longer react to taps — a tap anywhere opens/closes the story card
    + '.on .sc-actor{animation:scBob 3.4s ease-in-out infinite alternate;}'
    // THROWN AROUND. The adrift child on `string` is a runtime sprite, not part of the
    // painted plane, so the whip in the picture cannot reach it — it needs its own
    // buffeting. Not a bob: a jerk, on a period that does not divide evenly into the
    // string's, so the two never fall into a rhythm and it keeps looking uncontrolled.
    + '@keyframes scBuffet{0%{transform:translate(0,0) rotate(0)}18%{transform:translate(5px,-4px) rotate(7deg)}'
    +   '34%{transform:translate(-4px,3px) rotate(-6deg)}52%{transform:translate(6px,2px) rotate(9deg)}'
    +   '68%{transform:translate(-6px,-3px) rotate(-8deg)}84%{transform:translate(3px,4px) rotate(4deg)}'
    +   '100%{transform:translate(0,0) rotate(0)}}'
    + '.on .sc-actor.buffet{animation:scBuffet 1.7s cubic-bezier(.3,0,.7,1) infinite;}'
    // ⚠ TETHERED, not buffeted. Fred: "make it so that the protagonist is tethered to
    // the string and the string is the one moving." A separate wobble on its own period
    // is exactly wrong — it reads as a child flapping NEXT TO a string. He is tied to
    // it, so he takes the string's motion: the same duration, the same hard step, the
    // same instant, and a throw equal to the whip's displacement where he hangs. The
    // string moves; he goes where it takes him.
    // (a tethered actor's keyframes are GENERATED per page from the whip's own formula —
    //  see the tether block in the actor builder; there is nothing fixed to declare here)
    // ⚠ THE SPIN LIVES ON THE FIGURE, THE RIDE LIVES ON THE BOX. Fred: "make the back
    // attached to the string, then rotate it so that the head is going 360." Two motions
    // at once, and both are `transform` — so they cannot share an element or the last
    // one wins. The box carries the stepped translation (where the whip's end IS); the
    // canvases inside carry the spin, turning about the KNOT ON HIS BACK, so the head
    // sweeps the full circle around the point where he is tied on.
    + '@keyframes scSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'
    // ⚠ THE WHIP, STEPPED — SIX HELD POSITIONS, NOT A GLIDE. Fred: "if you see the end of
    // the string, it moves left and right, can you make the kid also move left and right
    // FOLLOWING the string WHILE spinning?" The cord is a SIX-FRAME sheet on a 1.02s loop,
    // so the child rides the identical six offsets on the identical clock — held, not
    // interpolated, or he glides between positions the cord jumps between and drifts.
    // And this is TRANSLATION only: his spin stays on its own 2.4s clock, untouched.
    // Fred again: "the kid might be on a different time signature altogether... we cannot
    // force the kid to be 1 2 3 4 or the image will be choppy." Locked where they must
    // agree, free where they must not.
    + '@keyframes scWhip{'
    + '0%,16.6%{transform:translate(var(--w1x),var(--w1y))}'
    + '16.7%,33.2%{transform:translate(var(--w2x),var(--w2y))}'
    + '33.3%,49.9%{transform:translate(var(--w3x),var(--w3y))}'
    + '50%,66.5%{transform:translate(var(--w4x),var(--w4y))}'
    + '66.6%,83.2%{transform:translate(var(--w5x),var(--w5y))}'
    + '83.3%,100%{transform:translate(var(--w6x),var(--w6y))}}'
    + '.on .sc-actor.whip{animation:scWhip var(--wd) steps(1,end) infinite;}'
    + '.on .sc-actor.spin > canvas{animation:scSpin var(--sd) linear infinite;transform-origin:var(--so);}'
    // WINGED actors do not bob like someone standing — they HOVER: a deeper, slower
    // rise and fall with a little roll, so the wings read as holding them up.
    + '.sc-actor.winged{--tilt:0deg;}'
    // a winged figure with no instrument keeps the plain hover
    + '.on .sc-actor.winged:not(.harper):not(.herald):not(.perch){animation:scHover 4.6s ease-in-out infinite alternate;}'   // `perch`: an angel who SAT (Matt 28:2) does not bob in the air
    + '@keyframes scHover{from{transform:translateY(4px) rotate(calc(var(--tilt) - 1.6deg))}to{transform:translateY(-9px) rotate(calc(var(--tilt) + 1.6deg))}}'
    // THE HARPER — a slow, deep ROCK, the roll of someone playing. Wide sway, little rise.
    + '.on .sc-actor.harper{animation:scHarp 5.8s ease-in-out infinite alternate;}'
    + '@keyframes scHarp{from{transform:translateY(3px) rotate(calc(var(--tilt) - 3.4deg))}to{transform:translateY(-7px) rotate(calc(var(--tilt) + 3.4deg))}}'
    // THE HERALD — a BLAST: a quick lift and pitch on the sounding, then a long settle.
    // Not alternate, so the rise stays sharp and the fall stays slow.
    + '.on .sc-actor.herald{animation:scHerald 3.4s ease-in-out infinite;}'
    + '@keyframes scHerald{'
    +   '0%{transform:translateY(2px) rotate(calc(var(--tilt) - 0.7deg))}'
    +   '16%{transform:translateY(-12px) rotate(calc(var(--tilt) + 1.8deg))}'
    +   '30%{transform:translateY(-8px) rotate(calc(var(--tilt) + 0.5deg))}'
    +   '100%{transform:translateY(2px) rotate(calc(var(--tilt) - 0.7deg))}}'
    + '.on .sc-actor.folk{animation-duration:4.6s;}'
    + '.on .sc-radiant{animation:scBreath 6.4s ease-in-out infinite alternate;transform-origin:50% 92%;}'
    + '.sc-actor.hop{animation:scHop .55s cubic-bezier(.3,1.6,.4,1) 1,scBob 3.4s ease-in-out .55s infinite alternate!important;}'
    + '@keyframes scBob{from{transform:translateY(0) rotate(-.7deg)}to{transform:translateY(-3px) rotate(.7deg)}}'
    + '@keyframes scBreath{from{transform:rotate(-.35deg)}to{transform:rotate(.35deg)}}'
    + '@keyframes scHop{0%{transform:translateY(0)}40%{transform:translateY(-14px) rotate(1.3deg)}70%{transform:translateY(2px)}100%{transform:translateY(0)}}'
    + '.sc-sheet{position:absolute;inset:0;background-repeat:no-repeat;background-position:0 0;}'
    + '.on .sc-sheet{animation:scSheet 5.4s steps(' + 18 + ') infinite;}'
    + '.sc-sheet.tapwave{animation:scSheet 1.5s steps(' + 18 + ') 1!important;}'
    + '@keyframes scSheet{to{background-position-x:calc(var(--fw) * -' + 18 + ')}}'
    + '.sc-sway.poke,.sc-nod.poke{animation:scPoke .6s cubic-bezier(.3,1.4,.4,1) 1!important;}'
    + '@keyframes scPoke{0%{transform:rotate(0)}25%{transform:rotate(7deg)}55%{transform:rotate(-5deg)}80%{transform:rotate(2deg)}100%{transform:rotate(0)}}'
    + '.sc-glow.flare{animation:scFlare .7s ease-out 1!important;}'
    + '@keyframes scFlare{0%{transform:scale(1);opacity:.85}35%{transform:scale(1.5);opacity:1}100%{transform:scale(1);opacity:.85}}'
    + '.sc-glow.sputter{animation:scSputter .85s linear 1!important;}'
    + '@keyframes scSputter{0%{opacity:.5;transform:scale(1)}8%{opacity:.95;transform:scale(1.18)}16%{opacity:.22;transform:scale(.86)}26%{opacity:.8;transform:scale(1.1)}36%{opacity:.15;transform:scale(.8)}48%{opacity:.9;transform:scale(1.22)}58%{opacity:.3;transform:scale(.92)}70%{opacity:.7;transform:scale(1.08)}82%{opacity:.2;transform:scale(.88)}100%{opacity:.5;transform:scale(1)}}'
    // CONTACT SHADOWS — a soft dark ellipse under each living object seats it in
    // the painting (the Cuphead trick: bold cels marry soft paint through the
    // shadow that plants them). z-index:-1 inside the sprite's own stacking
    // context (will-change) → behind its canvas, above the plate.
    + '.sc-actor::before,.sc-sheep::before,.sc-sway::before,.sc-nod::before{content:"";position:absolute;z-index:-1;left:24%;right:24%;bottom:0%;height:4.5%;border-radius:50%;'
    + 'background:radial-gradient(ellipse,rgba(14,11,28,.2),rgba(14,11,28,0) 46%);pointer-events:none;}'
    + '.sc-radiant::before{display:none;}'   // the Light casts no shadow (1 John 1:5)
    // ---- THE SHADOW THAT WILL NOT HOLD STILL (Fred, Aug 2026) ----
    // "rather than reusing the gust of wind, you can use other ideas like make the
    //  shadow jitter." Right — one primitive repeated across a book is the bunnies
    //  again, one level up. This is a different KIND of life: not weather passing
    //  through a scene but something wrong INSIDE it. The contact shadow breathes
    //  unevenly and drifts a hair, on a period that divides into nothing else, so it
    //  never falls into step with the page and never settles.
    //  ⚠ It is the one motion that suits a page which has chosen STILLNESS: on `prayer`
    //  everything holds its breath and only the shadow betrays it.
    + '@keyframes scShiver{0%{transform:translate(0,0) scaleX(1);opacity:1}'
    +   '17%{transform:translate(1.5px,0) scaleX(1.06);opacity:.86}'
    +   '31%{transform:translate(-1px,.5px) scaleX(.95);opacity:1}'
    +   '52%{transform:translate(2px,0) scaleX(1.09);opacity:.78}'
    +   '68%{transform:translate(-1.5px,0) scaleX(.93);opacity:.95}'
    +   '85%{transform:translate(.5px,.5px) scaleX(1.04);opacity:.84}'
    +   '100%{transform:translate(0,0) scaleX(1);opacity:1}}'
    + '.on .sc-actor.shiver::before{animation:scShiver 2.7s cubic-bezier(.4,0,.6,1) infinite;}'
    + '.sc-sheep::before{left:10%;right:10%;height:12%;bottom:2%;}'
    + '.sc-sway::before{left:30%;right:30%;height:5%;bottom:0;}'
    + '.sc-nod::before{left:38%;right:38%;height:4%;bottom:0;}'
    // STAGE LIGHT — a follow-spot layer behind the sprites: dark pages get an
    // edge vignette in their own ambient (chiaroscuro), bright pages a faint warm
    // pool at the subject. Lives in the layer → pans with the camera.
    + '.sc-stage{position:absolute;left:-20%;top:-12%;width:140%;height:124%;pointer-events:none;}'
    + '.sc-sway{transform-origin:50% 100%;}'
    + '.on .sc-sway{animation:scSway ease-in-out infinite alternate;}'
    + '@keyframes scSway{from{transform:rotate(-1.1deg)}to{transform:rotate(1.1deg)}}'
    // LAMP POST — tap to toggle; glow/flame/pool fade in, flame flickers
    + '.sc-lamp{transform-origin:50% 96%;}'
    + '.sc-lamp .lampglow,.sc-lamp .lampflame,.sc-lamp .lamppool{position:absolute;pointer-events:none;opacity:0;transition:opacity .5s ease;}'
    + '.sc-lamp .lampglow{border-radius:50%;background:radial-gradient(circle,rgba(255,226,140,.9),rgba(255,208,120,.28) 40%,rgba(255,208,120,0) 72%);mix-blend-mode:screen;}'
    + '.sc-lamp .lampflame{border-radius:50% 50% 52% 52%;background:radial-gradient(circle at 50% 62%,#fff6d8,#ffcf6a 52%,rgba(255,170,70,0) 86%);}'
    + '.sc-lamp .lamppool{border-radius:50%;background:radial-gradient(ellipse,rgba(255,214,130,.5),rgba(255,214,130,0) 60%);}'
    + '.sc-lamp.lit .lampglow{opacity:1;animation:lampFlick 2.6s ease-in-out infinite;}'
    + '.sc-lamp.lit .lampflame{opacity:1;animation:lampFlick 1.6s ease-in-out infinite;}'
    + '.sc-lamp.lit .lamppool{opacity:1;}'
    + '@keyframes lampFlick{0%,100%{opacity:.9}42%{opacity:1}68%{opacity:.82}}'
    + '.sc-nod{transform-origin:50% 100%;}'
    + '.on .sc-nod{animation:scNod 3.8s ease-in-out infinite alternate;}'
    + '@keyframes scNod{from{transform:rotate(-3deg)}to{transform:rotate(3.5deg)}}'
    + '.sc-glow{border-radius:50%;}'
    + '.on .sc-glow.warm{animation:scWarm 4.2s ease-in-out infinite alternate;}'
    + '.on .sc-glow.cold{animation:scCold 5.6s ease-in-out infinite alternate;}'
    + '.sc-glow.warm{background:radial-gradient(circle,rgba(255,244,214,.7),rgba(246,212,137,.26) 45%,rgba(246,212,137,0) 70%);}'
    + '.sc-glow.cold{background:radial-gradient(circle,rgba(238,248,176,.8),rgba(154,184,96,.22) 45%,rgba(154,184,96,0) 70%);}'
    + '@keyframes scWarm{from{transform:scale(1);opacity:.8}to{transform:scale(1.12);opacity:1}}'
    + '@keyframes scCold{from{transform:scale(.8);opacity:.45}to{transform:scale(1.12);opacity:.85}}'
    + '.sc-wisp{width:10px;height:26px;border-radius:50%;background:rgba(120,116,180,.26);filter:blur(3px);opacity:0;}'
    + '.sc-wisp.green{background:rgba(150,176,110,.3);}'
    + '.on .sc-wisp{animation:scRise linear infinite;}'
    + '.sc-wisp.smoke{width:34px;height:64px;background:rgba(214,206,196,.28);filter:blur(9px);}'   // campfire smoke (family): paler, wider, climbs further
    + '.on .sc-wisp.smoke{animation-name:scSmoke;}'
    + '@keyframes scSmoke{0%{transform:translateY(0) translateX(0) scale(.5);opacity:0}14%{opacity:.5}100%{transform:translateY(-230px) translateX(34px) scale(2.6);opacity:0}}'
    + '@keyframes scRise{0%{transform:translateY(0) translateX(0) scale(.7);opacity:0}12%{opacity:.5}100%{transform:translateY(-80px) translateX(13px) scale(1.6);opacity:0}}'
    + '.sc-bird{offset-rotate:0deg;}'
    + '.on .sc-bird{animation:scFly linear infinite,scFlap .34s steps(2) infinite;}'
    + '@keyframes scFly{from{offset-distance:0%}to{offset-distance:100%}}'
    + '@keyframes scFlap{from{background-position:0 0}to{background-position:200% 0}}'
    // sheep: stand and graze, then a little hop (each on its own delay → out of sync); tap → a bigger hop
    + '.sc-sheep{pointer-events:none;transform-origin:50% 96%;}'
    + '.on .sc-sheep{animation:scSheepHop 3.8s ease-in-out infinite;}'
    + '@keyframes scSheepHop{0%,54%{transform:translateY(0) scaleY(1)}59%{transform:translateY(2px) scaleY(.92)}70%{transform:translateY(-12px) scaleY(1.08)}80%{transform:translateY(0) scaleY(.9)}87%{transform:translateY(-3px) scaleY(1.02)}94%,100%{transform:translateY(0) scaleY(1)}}'
    // water: little sun-glints that swell and fade on the surface — a shimmer
    + '.sc-glint{height:3px;border-radius:50%;background:rgba(236,246,255,.9);filter:blur(1px);opacity:0;pointer-events:none;}'
    + '.on .sc-glint{animation:scShimmer ease-in-out infinite;}'
    + '@keyframes scShimmer{0%,100%{opacity:0;transform:scaleX(.35)}45%{opacity:.72}50%{transform:scaleX(1.25)}56%{opacity:.5}}'
    // diorama LIFE: the Light breathes radiance (brightness pulse, keeps the base grade);
    // the distant flock wheels on the wind (a gentle group drift — distant birds read as
    // a moving mass, not individual flaps). Both are cheap GPU-only property animations.
    // The Light breathes by fading a SECOND COPY of its own plane in and out over
    // itself (see buildDiorama). It used to animate `filter` — which is not a
    // compositor-only property like transform/opacity: every frame the compositor
    // re-ran a full-screen saturate+contrast+brightness pass over the plane, for
    // as long as the page was open. Opacity costs nothing and the glow strengthens
    // the same way, because the copy lays the plane's own radiance over itself.
    + '@keyframes dioLight{0%,100%{opacity:0}50%{opacity:0.42}}'
    + '@keyframes dioBirds{0%{transform:translate(0,0)}25%{transform:translate(6px,-4px)}50%{transform:translate(11px,1px)}75%{transform:translate(5px,5px)}100%{transform:translate(0,0)}}'
    + '.dio-light{animation:dioLight 4.6s ease-in-out infinite;will-change:opacity;}'
    + '.dio-birds{animation:dioBirds 11s ease-in-out infinite;will-change:transform;}'
    // THE BOIL. Three drawings of the same plane, shown one at a time in a loop. The
    // keyframe is a hard cut, not a cross-fade: a dissolve would average two drawings
    // into a blur and lose the very thing that makes it read as hand-drawn.
    + '@keyframes dioBoil{from{opacity:0}to{opacity:1}}'
    // N>2 runs a CAROUSEL instead of a ping-pong: each drawing rises, has its moment and
    // gives way to the next, in order, all the way round — so the motion goes somewhere
    // instead of rocking. Linear, because a cyclone does not ease.
    // ⚠ ONE KEYFRAME PER RING SIZE. This was hardcoded at 17%/83% — correct for SIX
    // drawings (6 x 17% = 102% coverage) and catastrophic for any other count. When the
    // rings were capped at three to save memory, coverage fell to 51%: for half of every
    // cycle NO drawing was visible, and since the ring hides the base plane underneath,
    // the page went EMPTY. That is what "all the pages are blinking" was.
    // Each drawing must be visible for slightly MORE than 1/N of its own clock, so the
    // ring always overlaps itself and can never show a gap.
    + (function () {
        var out = '';
        for (var n = 2; n <= 8; n++) {
          var v = (100 / n) + 3;                       // its slice, plus an overlap
          out += '@keyframes dioBoilN' + n + '{0%{opacity:1}' + v.toFixed(2) + '%{opacity:0}'
               + (100 - 3).toFixed(2) + '%{opacity:0}100%{opacity:1}}'
               + '.dio-boil-n' + n + '{animation-name:dioBoilN' + n + ';animation-timing-function:linear;'
               + 'animation-iteration-count:infinite;animation-direction:normal;}';
        }
        return out;
      })()
    // ---- THE PAIRED RING (opt in per plane, BOIL_PAIR) ----
    // Fred: "instead of making 1 layer of grass appear at a time, can you activate 2 at a
    // time? so if you have 3 frames, do a&b, b&c, and c&a on rotation."
    // That is a third mode and it is the right one for grass, for two reasons the other two
    // could not give:
    //   · COVERAGE NEVER MOVES. Exactly two drawings are up at every instant, both at full
    //     opacity — so there is no dip to read as a pulse, which is what the cross-fade's
    //     0.75 crossover looked like on a sparse transparent plane.
    //   · EACH STEP CHANGES ONLY HALF THE PICTURE. Going a&b -> b&c keeps `b` on screen
    //     throughout; only one of the pair is exchanged. So the jump the eye can see is
    //     halved, which is what stops a stepped ring reading as a blink.
    // The grass is also drawn twice over, which on a meadow is simply a thicker sward — and
    // the two drawings are two different leans, so the doubling is itself the motion blur.
    // Same keyframe as the carousel with the window opened from one slice to two.
    + (function () {
        var out = '';
        for (var n = 3; n <= 8; n++) {
          // ⚠ IT HAS TO HOLD, NOT RAMP. Written as the carousel's shape with a wider window
          // (one stop at 1, the next at 0) the opacity just ramps linearly across two slices,
          // and the sample came back 1.00 / 0.53 / 0.06 / 0.00 — a long fade, not a pair.
          // The window must be flat: each drawing HOLDS at full for one slice, fades out
          // across the next, sits dark, then fades back in over the slice before its hold.
          // At any instant one is holding, one is arriving and one is leaving, and the two
          // that are moving sum to about one — so the plane always carries two drawings'
          // worth of grass and the handover has no step in it.
          var A = 100 / n, B = 200 / n, C = 100 - 100 / n;
          out += '@keyframes dioBoilD' + n + '{0%{opacity:1}' + A.toFixed(2) + '%{opacity:1}'
               + B.toFixed(2) + '%{opacity:0}' + C.toFixed(2) + '%{opacity:0}100%{opacity:1}}'
               + '.dio-boil-d' + n + '{animation-name:dioBoilD' + n + ';animation-timing-function:linear;'
               + 'animation-iteration-count:infinite;animation-direction:normal;}';
        }
        return out;
      })()
    // THE CROSS-FADED RING (opt in per page, BOIL_XFADE). The carousel above holds a
    // drawing up and then hands over quickly — right for a cyclone, where each drawing
    // should land as its own mark. A LIGHT does not hand over; it swells. So this
    // variant is a symmetric triangle: every drawing rises across one slice and falls
    // across the next, which means TWO drawings are on screen at once at all times and
    // the marks are read through each other. That blend is the point (Fred: "make the
    // animation somehow overlap with each other").
    // The cost is honest: at the crossover both are at half, so the plane's coverage
    // dips to ~0.75 and the rays breathe a little dimmer as they pass. On a radiating
    // light that dip IS the swell; on a storm it would look like a dropout, which is
    // why the storms keep the carousel.
    + (function () {
        var out = '';
        for (var n = 3; n <= 12; n++) {                // ⚠ 12 for the covers' stop-motion sheets
          var v = 100 / n;                             // one slice up, one slice down
          // ⚠ RAISED COSINE, NOT A LINEAR RAMP. A straight ramp changes fastest exactly
          // at the hand-over and dead slow at the ends, so the eye catches the corner and
          // the swell reads as a series of steps. Easing both ends (0.5+0.5cos) is the
          // standard cross-dissolve and it is what "smooth" means here.
          var st = '';
          for (var q = 1; q <= 3; q++) st += (v * q / 4).toFixed(2) + '%{opacity:' + (0.5 + 0.5 * Math.cos(Math.PI * q / 4)).toFixed(3) + '}';
          var st2 = '';
          for (var q2 = 1; q2 <= 3; q2++) st2 += (100 - v + v * q2 / 4).toFixed(2) + '%{opacity:' + (0.5 - 0.5 * Math.cos(Math.PI * q2 / 4)).toFixed(3) + '}';
          out += '@keyframes dioBoilX' + n + '{0%{opacity:1}' + st + v.toFixed(2) + '%{opacity:0}'
               + (100 - v).toFixed(2) + '%{opacity:0}' + st2 + '100%{opacity:1}}'
               + '.dio-boil-x' + n + '{animation-name:dioBoilX' + n + ';animation-timing-function:linear;'
               + 'animation-iteration-count:infinite;animation-direction:normal;}';
          // ⚠ THE STRAIGHT RAMP — for a BREATH, not a swell. Fred: "now it is just suuuper
          // slow, ie long time between each transition, but the transition is fast. breathing
          // is not like that. you should be able to see the changes and the transition is
          // long." Exactly the raised cosine's fault: cos is FLAT at both ends, so each
          // drawing sits at ~full for a couple of seconds, races through the middle, and sits
          // again — a hold and a dash, however slowly the whole thing is clocked.
          // A linear triangle has NO flat: every drawing is rising or falling at a constant
          // rate at every instant, so the picture is always visibly moving and the transition
          // occupies the entire slot. That is what breathing looks like.
          // (The eased version stays for the LIGHTS, where the flat top IS the swell.)
          out += '@keyframes dioBoilL' + n + '{0%{opacity:1}' + v.toFixed(2) + '%{opacity:0}'
               + (100 - v).toFixed(2) + '%{opacity:0}100%{opacity:1}}'
               + '.dio-boil-l' + n + '{animation-name:dioBoilL' + n + ';animation-timing-function:linear;'
               + 'animation-iteration-count:infinite;animation-direction:normal;}';
        }
        return out;
      })()
    + '.dio-boil-hard{animation-timing-function:step-end!important;}'
    // the page turn, as a camera move: each plane slides by its own depth factor, and the
    // whole scene eases back a little as it leaves (so it recedes rather than just exits)
    // ⚠ A PAGE TURN IS A CAMERA MOVE, NOT A SLIDE. Fred: "make the page turn feel like moving
    // through the scene." The rig already slid the planes sideways at different rates, which
    // is parallax — true, but it is what you see from a TRAIN WINDOW. Travelling INTO a place
    // is depth: the near things swell and pass you, the far things hardly change at all.
    // So the same scroll scalar now drives SCALE as well as offset, weighted by the same
    // per-plane depth: the foreground blooms ~16% through a turn while the backmost sky moves
    // under 2%. Leaving a page you push through its foreground; arriving at one, it settles
    // around you.
    // ⚠ It only ever scales UP. Scaling a plane DOWN would pull its edges inside the frame and
    // show the seam; up simply crops, which is free.
    // ⚠ And it rides `translate`/`scale` as independent properties — `transform` belongs to
    // camApply (the tilt), and two owners on one property kill each other.
    + '.sc-dio img{translate:calc(var(--sp,0px) * var(--pk,0.5)) 0;'
    +   'scale:calc(1 + var(--spz,0) * var(--pk,0.5));}'
    // the flat pages travel too, or the book would feel like two different objects
    + '.page > picture img{scale:calc(1 + var(--spz,0) * 0.42);}'
    // ⚠ AND IT MUST BE POSSIBLE TO TURN OFF. A camera pushing through a scene is exactly the
    // motion that makes some readers ill, and this book is for everyone. Under
    // prefers-reduced-motion the depth is held at rest — the pages still turn, they simply
    // stop travelling.
    + '@media (prefers-reduced-motion: reduce){.sc-dio img,.page > picture img,.sc-layer{scale:1 !important;}}'
    + '.sc-dio,.sc-dio-front,.sc-layer{transition:none;}'
    // ---- ⚠ CLOUDS MOVE SIDEWAYS (Fred: "make the background move as if clouds moving in
    // the sky") ----
    // A cross-faded breath makes a sky shimmer in place; clouds TRAVEL. The swirl sheets
    // are their own transparent planes, so they can simply drift — at different speeds and
    // in opposite directions, which is what makes a sky read as deep rather than as paper.
    // ⚠ It animates the `translate` PROPERTY, not `transform`: camApply writes transform on
    // every plane each frame for the tilt, and an animation on the same property wins the
    // cascade and would kill the parallax. `translate` composes with it instead.
    + '@keyframes dioCloud{0%{translate:0 0}50%{translate:var(--cd,26px) 0}100%{translate:0 0}}'
    + '.dio-cloud{animation:dioCloud var(--cs,90s) ease-in-out infinite;}'
    // ⚠ THE THREE-HAND SHIMMER — Fred's own design, and it is better than the carousel I
    // kept building: "i want all 3 to be visible... a 50%, b 50%, c 100%; then a 50%, b
    // 100%, c 50%; then a 100%, b 50%, c 50%." A carousel SWAPS one drawing for another and
    // the eye catches the change-over however well each frame is drawn. Three drawings
    // stacked, riding their opacities out of phase, never appear or disappear — the light
    // just takes weight from one hand to the next, and it sparkles wherever the three
    // disagree. It also costs nothing: one press, three cels, three CSS cycles.
    // ⚠ 60/60/100 (Fred's number, after 50 and 70). The two resting hands stay much more present, so
    // the light never thins as it hands over — what changes is which of the three is
    // carrying it, not how much light there is. Shallower difference, richer body, and the
    // sparkle reads as the paint breathing rather than as three layers being switched.
    + '@keyframes dioTri{0%{opacity:1}33.333%{opacity:.6}66.666%{opacity:.6}100%{opacity:1}}'
    + '.dio-tri{animation:dioTri var(--ts,3.6s) ease-in-out infinite;will-change:opacity;}'
    + wipeKeyframes(6) + wipeKeyframes(8) + tweenKeyframes(6) + tweenKeyframes(8)
    // ---- ⚠ THE BOIL HOLDS STILL WHILE YOU PAN ----
    // A two-drawing breath is ALWAYS showing a blend of two slightly offset copies of
    // the plane. Standing still that reads as softness — it is the whole effect. But
    // while the camera moves, those two copies slide across each other and the eye reads
    // the doubled edges as a flicker. It is not the drawings (every one measures the
    // same brightness); it is two of them being visible at once WHILE THE VIEW MOVES.
    // So during a pan the second drawing simply steps aside: the animation pauses and
    // the sibling goes transparent, leaving the crisp single base plane. The breath
    // resumes the moment the camera settles, and the transition is covered by the pan
    // itself. Motion on top of motion was the whole problem.
    + '.dio-boil,[class*="dio-boil-n"],[class*="dio-boil-x"]{transition:opacity .28s ease;}'
    // ⚠ NO transition on the linear ring — a .28s ease on top of a constant ramp puts the
    // little flat back exactly where it was just removed from.
    + '[class*="dio-boil-l"]{transition:none;}'
    // ⚠ A DISSOLVE IS A TWINKLE, NOT A TRAVEL. Fred: "can the breathe be movement instead of
    // blinking like this?" Right — cross-fading two drawings makes every mark fade out where
    // it was and in where it went, which the eye reads as blinking. Nothing on screen ever
    // MOVES. For movement the sheet has to travel, continuously, and the drawings have to do
    // their repainting underneath that travel.
    // So the boiling sheet now rides a wrapper that walks a slow circle for ever, while the
    // drawings cross-fade inside it. The two jobs are split cleanly: the CSS supplies motion
    // (smooth, free, never steps), the drawings supply life (every stroke genuinely repainted).
    // Neither is doing the other's job — which is the difference between this and sliding one
    // copy of a picture about, the thing that was rightly called lazy.
    // ⚠ LITERAL KEYFRAMES, GENERATED PER PAGE — no var() and no calc(). The version that used
    // `calc(var(--orx) * 0.707)` inside @keyframes measured a **0px shift at six percent
    // amplitude** on the phone: if that rule fails to parse, the class still names an
    // animation that does not exist and nothing moves, silently. Nothing here to misparse.
    + (function () {
        var out = '', K = 8;
        for (var pg in ORBIT) {
          for (var nm in ORBIT[pg]) {
            var o = ORBIT[pg][nm], rx = parseFloat(o[0]), ry = parseFloat(o[1]);
            var id = 'dioOrbit' + pg + nm.replace(/[^a-z0-9]/gi, '');
            out += '@keyframes ' + id + '{';
            for (var k = 0; k <= K; k++) {
              var a = 2 * Math.PI * k / K;
              out += (k / K * 100).toFixed(2) + '%{transform:translate('
                   + (Math.cos(a) * rx).toFixed(3) + '%,' + (Math.sin(a) * ry).toFixed(3) + '%)}';
            }
            out += '}.' + id + '{animation-name:' + id + ';}';
          }
        }
        return out;
      })()
    + '.dio-orbit{position:absolute;inset:0;pointer-events:none;will-change:transform;'
    +   'animation-timing-function:linear;animation-iteration-count:infinite;}'
    + '@media (prefers-reduced-motion:reduce){.dio-orbit{animation:none!important;}}'
    + '.dio-spin{position:absolute;pointer-events:none;will-change:transform;transform-origin:50% 51.6%;}'
    + '.sc-dio .dio-spin img{inset:0;width:100%;height:100%;object-fit:fill;object-position:50% 50%;}'
    // ⚠ A RIGID ROTATION WAS THE WRONG IN-BETWEEN, and it was broken as well as ugly. Fred:
    // "it is too jumpy, make it smooth...... this is ugly." Two faults, and the geometry one
    // is why it could never have worked: the plate rotates its sampling about the wheel's
    // centre IN THE IMAGE, while a CSS transform-origin is a point on the ELEMENT BOX — and
    // `object-fit: cover` means those are not the same point. The two rotations could not
    // cancel, so every handover snapped. Even correct, a swirling sky does not turn like a
    // stone wheel; it flows. The smooth in-between is a continuous BLEND, below.
    // ⚠ ONLY THE TWO-DRAWING BREATH PAUSES. That one blends a displaced sibling over the
    // ORIGINAL painting, so while the view moves you see every mark twice, a hair apart,
    // sliding — the twitch. A RING has no base under it: at any instant you are looking at
    // one drawing (or a dissolve between two DIFFERENT drawings, which is the animation
    // itself), and they parallax together, so there is nothing to double. Freezing it was
    // an over-wide fix, and it stopped the page dead in the hand — Fred: "it works when
    // its static, but when i tilt it it stopped."
    // ⚠ A PAN NO LONGER STOPS THE BREATH — IT HARDENS IT. Fred: "the animation only work
    // when i am super super still. if i pan even a bit, it defaults to the new picture."
    // Right: this rule paused the two-drawing breath and hid the sibling the moment the
    // camera moved, and a real gyro is never still, so on a phone the breath was almost
    // never running. The reason it existed was DOUBLING: a cross-fade shows a displaced
    // copy over the original, and while the view moves those two slide against each other
    // and read as a flicker. But a HARD CUT has no blend — at any instant exactly one
    // drawing is on screen, so there is nothing to double. So while panning the same
    // animation runs on `step-end`: the picture keeps breathing, in cuts, and goes back to
    // dissolving the moment the camera settles.
    + '.sc-panning .dio-boil{animation-timing-function:step-end!important;transition:none!important;}'
    // the base stays hidden under a running ring (handing it back now would be the third
    // copy) — the rule remains only for a ring whose drawings failed to load.
    + '.dio-boil-base{transition:opacity .28s ease;}'
    + '@keyframes scFrantic{0%{transform:translate(0,0)}20%{transform:translate(7px,-6px)}'
    +   '40%{transform:translate(-5px,4px)}60%{transform:translate(9px,3px)}'
    +   '80%{transform:translate(-7px,-4px)}100%{transform:translate(0,0)}}'
    + '.on .sc-frantic{animation:scFrantic 1.2s cubic-bezier(.35,0,.65,1) infinite;}'
    + '.dio-boil{animation-name:dioBoil;animation-timing-function:cubic-bezier(.45,0,.55,1);'
    +   'animation-iteration-count:infinite;animation-direction:alternate;}'
    // ⚠ THE STEP CYCLE. A walk read from behind is mostly the RISE AND FALL of the body
    // over each stride, plus the small roll of the shoulders — not travel across the
    // frame. Travel is wrong here anyway: he is already deep in the picture, and moving
    // him would slide him off his own road and out of his shadow. So he walks the way a
    // figure walks in a game — on the spot, at the pace of the page, and everything
    // around him (the road, the shadow, the footprints behind) says where that walk goes.
    + '@keyframes scWalk{0%{transform:translateY(0) rotate(-0.5deg)}'
    +   '25%{transform:translateY(-1.6px) rotate(0.2deg)}50%{transform:translateY(0) rotate(0.5deg)}'
    +   '75%{transform:translateY(-1.6px) rotate(-0.2deg)}100%{transform:translateY(0) rotate(-0.5deg)}}'
    + '.on .sc-walk{animation:scWalk 1.45s cubic-bezier(.42,0,.58,1) infinite;transform-origin:50% 92%;}'
    // ⚠ HE ACTUALLY WALKS THE CIRCLE. Fred, on `lost`: "the footprints are going in a
    // circle but it doesnt look like the hero is walking in circle... create a dark scene,
    // where the hero is pretty zoomed out just walking in a circle. we can animate the
    // background and the character (walking, maybe with footprints that disappear after
    // 1 second so the animation is smooth)."
    // The ring is an ELLIPSE, because a circle on the ground seen from here is one — that
    // is the whole reason it reads as ground and not as a hoop standing up in the air. He
    // rides it on `offset-path` (the same compositor trick the birds use, so it costs the
    // main thread nothing), and the wrapper scales with the phase: smallest at the far
    // side, biggest as he comes past us. Two sprites cross-fade at the turns — his BACK
    // going away round the top, his FRONT coming back along the bottom.
    + '.sc-orbit{position:absolute;offset-rotate:0deg;offset-anchor:50% 100%;will-change:offset-distance,transform;}'
    + '@keyframes scOrbit{from{offset-distance:0%}to{offset-distance:100%}}'
    + '@keyframes scOrbitZ{0%{transform:scale(.94)}25%{transform:scale(.80)}50%{transform:scale(.94)}75%{transform:scale(1.14)}100%{transform:scale(.94)}}'
    + '.on .sc-orbit{animation:scOrbit var(--osec) linear infinite,scOrbitZ var(--osec) ease-in-out infinite;}'
    + '.sc-orbit > canvas{position:absolute;left:0;top:0;width:100%;height:100%;}'
    // the far half of the ring is the half where we see his back
    + '@keyframes scFaceB{0%{opacity:1}44%{opacity:1}52%{opacity:0}94%{opacity:0}100%{opacity:1}}'
    + '@keyframes scFaceF{0%{opacity:0}44%{opacity:0}52%{opacity:1}94%{opacity:1}100%{opacity:0}}'
    + '.on .sc-orbit .ob{animation:scFaceB var(--osec) linear infinite,scWalk 1.45s cubic-bezier(.42,0,.58,1) infinite;}'
    + '.on .sc-orbit .of{animation:scFaceF var(--osec) linear infinite,scWalk 1.45s cubic-bezier(.42,0,.58,1) infinite;}'
    // ⚠ THE PRINTS MUST DIE. Fred asked for prints that vanish after about a second, and
    // that is not a detail — a print that stays turns the walk back into a drawn ring
    // within one lap, and the loop stops being seamless. They live 1.15s and go.
    + '@keyframes scPrint{0%{opacity:.55;transform:scale(1)}70%{opacity:.34}100%{opacity:0;transform:scale(.82)}}'
    + '.sc-print{position:absolute;border-radius:50%;background:#1b1540;animation:scPrint 1.15s ease-out forwards;pointer-events:none;}'
    + '@keyframes scCritter{from{transform:translateY(0) rotate(-3.5deg)}to{transform:translateY(-1.5px) rotate(3.5deg)}}'
    + '.sc-critter{transform-origin:50% 70%;}'
    + '.on .sc-critter{animation:scCritter ease-in-out infinite alternate;}'
    + '@keyframes scFloat{0%{transform:translate(0,0)}25%{transform:translate(7px,-9px)}50%{transform:translate(-5px,-15px)}75%{transform:translate(-9px,-6px)}100%{transform:translate(0,0)}}'
    + '@keyframes scBlink{0%,100%{opacity:.28}44%{opacity:1}56%{opacity:.85}}'
    + '.sc-fly{will-change:transform,opacity;}'
    + '.on .sc-fly{animation:scFloat 7s ease-in-out infinite,scBlink 2.6s ease-in-out infinite;}'
    + '@keyframes scSwim{0%{transform:translate(0,0) rotate(0)}33%{transform:translate(6px,-2px) rotate(-2.5deg)}66%{transform:translate(-4px,2px) rotate(2.5deg)}100%{transform:translate(0,0) rotate(0)}}'
    + '.on .sc-fish{animation:scSwim 4.6s ease-in-out infinite;}'
    // ---- ⚠ A FISH THAT ACTUALLY SWIMS (Fred: "make the fish actually swim") ----
    // scSwim alone is a 6px wiggle on the spot — a fish treading water for ever, which is
    // exactly the "you just make things blink" fault. A fish TRAVELS: out across its water
    // and back, and it TURNS at each end (scaleX flips) instead of sliding home backwards.
    // The body keeps its own wiggle, but on the canvas inside, because two animations on
    // one element's transform means the last one wins and the travel would eat the swim.
    + '@keyframes scSwimTo{0%{transform:translateX(0) scaleX(1)}'
    +   '6%{transform:translateX(0) scaleX(1)}'
    +   '44%{transform:translateX(var(--sd,60px)) scaleX(1)}'
    +   '50%{transform:translateX(var(--sd,60px)) scaleX(-1)}'
    +   '94%{transform:translateX(0) scaleX(-1)}'
    +   '100%{transform:translateX(0) scaleX(1)}}'
    + '.sc-swim{animation:scSwimTo var(--sdur,18s) ease-in-out infinite!important;}'
    + '.sc-swim canvas{animation:scSwim 3.2s ease-in-out infinite;}'
    + '.on .sc-flit{animation:scFloat 6s ease-in-out infinite;}'   // butterflies drift (no blink)
    // WINGS. A butterfly seen from above flaps by rotating its wings up and down —
    // which in this 2-D projection IS a horizontal foreshortening. The body is a thin
    // vertical line, so squeezing the whole sprite in x reads as the wings beating and
    // barely touches the body. It rides on the CANVAS while the drift rides on the
    // wrapper, so the two transforms compose instead of fighting; and scaleX is
    // compositor-only, which is what lets forty of them flap for free.
    + '.sc-wing{transform-origin:50% 50%;will-change:transform;}'
    + '.on .sc-wing{animation:scWingBeat .34s ease-in-out infinite alternate;}'
    + '@keyframes scWingBeat{from{transform:scaleX(1)}to{transform:scaleX(.34)}}'
    // the frame walk: steps(N) lands exactly on each drawn frame, never between two
    + '.sc-sheetfly{will-change:transform;}'
    + '.on .sc-sheetfly{animation:scSheetFly steps(var(--nf)) infinite;}'
    + '@keyframes scSheetFly{from{transform:translateX(0)}to{transform:translateX(calc(var(--fw) * -1 * var(--nf)))}}'   // ⚠ NOT scFlap — the flying birds already own that name (background-position); duplicate @keyframes names override silently
    // BEES BUZZ: a fast, erratic little circuit — never a smooth glide. The steps are
    // uneven on purpose; a bee's path is all sudden decisions.
    + '.on .sc-buzz{animation:scBuzz 3.6s ease-in-out infinite;}'
    + '@keyframes scBuzz{'
    +   '0%{transform:translate(0,0)}'
    +   '14%{transform:translate(7px,-5px)}'
    +   '27%{transform:translate(3px,-11px)}'
    +   '41%{transform:translate(-6px,-7px)}'
    +   '55%{transform:translate(-9px,2px)}'
    +   '68%{transform:translate(-2px,7px)}'
    +   '82%{transform:translate(6px,4px)}'
    +   '100%{transform:translate(0,0)}}'
    + '@media (prefers-reduced-motion:reduce){.sc,.sc-glow,.sc-wisp,.sc-bird,.sc-actor,.sc-sway,.sc-nod,.dio-light,.dio-birds,.dio-boil,.sc-critter,.sc-fly,.sc-fish,.fx{animation:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---- plate→page mapping (object-fit cover, crop biased downward) ---- */
  var CROP_Y = 0.72;   // MUST match `object-position` Y in index.html
  function fitOf(page) {
    var img = page.querySelector('picture img');
    if (!img || !img.complete || !img.naturalWidth) return null;
    var portrait = (img.currentSrc || img.src).indexOf('-p.jpg') !== -1;
    var idx = pages.indexOf(page);
    var cast = F.CAST[idx] || {};
    // ⚠ THE PORTRAIT WINDOW IS 312 AND CANNOT BE CHANGED HERE. Fred asked to zoom out
    // (the child rides close to the frame edge), and widening this looked like a
    // one-line fix — but `P_W = 312` is baked into gen/build.mjs: every -p.jpg IS a
    // 312-wide column, and this mapping is what aligns sprites to that painting.
    // Widening it at runtime stretches the mapping and slides every figure off its
    // scenery. A real zoom-out means: change P_W, rebuild all 33 plates, and recompute
    // every CAST1 fx0 (= focal.x - P_W/2). That is a deliberate pass, not a tweak.
    var vx0 = portrait ? (cast.fx0 || 244) : 0, vw = portrait ? 312 : 800;
    var iw = portrait ? 1000 : 1600, ih = portrait ? 1600 : 1000;
    var w = page.clientWidth, h = page.clientHeight;
    // ⚠ COVER, BUT THE CROP IS BIASED DOWNWARD. Fred: first "zoom out a little"
    // (figures were cut off the bottom), then "you zoomed out too much" — because
    // fit-height on a 2:1 screen letterboxes 192px of bar down each side.
    // The painting has slack at the TOP (sky) and none at the BOTTOM (that is where
    // everyone stands). So: keep cover, so the plate still fills the width and there
    // are no bars, and slide the crop down. Measured on 1866x926:
    //   cover centred  -> plate y  51..449   child@468 CUT
    //   cover @0.72    -> plate y  74..471   child@468 VISIBLE, no bars
    //   fit-height     -> plate y   0..500   but 192px bars each side
    // ⚠ CROP_Y must equal the CSS object-position Y in index.html, or every sprite
    // slides off its scenery. Change one, change the other.
    var s = Math.max(w / iw, h / ih);
    var dw = iw * s, dh = ih * s;
    return { x: function (px) { return (w - dw) / 2 + (px - vx0) / vw * dw; },
             y: function (py) { return (h - dh) * CROP_Y + py / 500 * dh; },
             s: (dw / vw) };   // plate-unit → css px
  }

  /* ---- per-page grade (bakes objects INTO the paint, killing neon-on-dark clash) ---- */
  var AMBIENT = {
    0: [22, 26, 60, 0.30], 1: [255, 240, 205, 0.08], 2: [20, 24, 56, 0.30],
    3: [16, 18, 44, 0.34], 4: [22, 26, 62, 0.24], 5: [18, 16, 48, 0.24],
    6: [255, 240, 210, 0.08], 7: [26, 26, 66, 0.30], 8: [22, 24, 62, 0.30],
    9: [46, 34, 78, 0.18], 10: [38, 30, 70, 0.26], 11: [255, 242, 200, 0.08],
    12: [16, 14, 44, 0.32], 13: [255, 238, 205, 0.10], 14: [255, 242, 205, 0.09],
  };
  /* ---- FROZEN TABLEAU pages: no idle motion; every element animates only on tap ---- */
  var PV = '?p=467';   // plate-asset version — STAMPED from version.json by gen/stamp-index.py (which bumps it when plates-vg/ changes); /plates-vg/* is cached immutable, so never hand-edit one copy
  /* ⭐ AVIF FOR THE COVER (Sep 25, "loads faster without sacrificing quality and beauty"). The cover's
     soft nebula sheets (word-n0..n2 + their frames) are 7.7 MB of every first visit as webp; the same
     pixels as AVIF q60 are 56% lighter with no visible change. Decode support is probed ONCE here with a
     1-pixel AVIF; until it answers (a few ms — long before the cover's painting has loaded and the
     planes are built) and wherever it fails, the webp is used. Every .avif request also falls back to
     its .webp on error, so a browser that lies about support still gets a picture. */
  var AVIF_OK = false;
  (function () { try { var t = new Image(); t.onload = function () { AVIF_OK = t.width === 1; };
    t.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAAGGbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAACxpbG9jAAAAAEQAAAIAAQAAAAEAAAHCAAAAFwACAAAAAQAAAa4AAAAUAAAAQmlpbmYAAAAAAAIAAAAaaW5mZQIAAAAAAQAAYXYwMUNvbG9yAAAAABppbmZlAgAAAAACAABhdjAxQWxwaGEAAAAAGmlyZWYAAAAAAAAADmF1eGwAAgABAAEAAADDaXBycAAAAJ1pcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAAAAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAAA5waXhpAAAAAAEIAAAADGF2MUOBABwAAAAAOGF1eEMAAAAAdXJuOm1wZWc6bXBlZ0I6Y2ljcDpzeXN0ZW1zOmF1eGlsaWFyeTphbHBoYQAAAAAeaXBtYQAAAAAAAAACAAEEAQKDBAACBAEFhgcAAAAzbWRhdBIACgQYAAYVMgoYACihAAIhHctgEgAKBRgABgQgMgwYAAooooQAALATS9g='; } catch (e) { } })();
  // ⚠ Sep 26: AVIF OFF — Fred: "we want the quality to still be top notch!". The full-quality webp is served;
  // the .avif files and the probe stay so this can be revisited only with his yes.
  function planeExt(base, name) { return '.webp'; }
  var FREEZE = { 4: 1 };   // cry — the trial "static movie scene"


  /* ---------- EPISODE THREE data (The Smallest Brother) ---------- */
  var __EPA = document.documentElement.getAttribute('data-ep');
  var EP = __EPA === '1' ? 1 : (/\/ep3\//.test(location.pathname) ? 3 : (/\/ep4\//.test(location.pathname) ? 4 : 2));
  if (EP === 3) {
    FREEZE = {};
    AMBIENCE = {
      0:  { glows: [[560, 218, 120, 'warm']] },
      1:  { glows: [[190, 90, 60, 'cold']] },
      2:  { glows: [[400, 120, 90, 'cold']] },
      3:  { glows: [[570, 96, 100, 'warm']] },
      4:  { glows: [[330, 392, 55, 'warm'], [620, 84, 40, 'cold']] },
      5:  { glows: [[200, 90, 95, 'warm']] },
      6:  { glows: [[400, 200, 80, 'warm']] },
      7:  { glows: [[660, 260, 110, 'warm']] },
      8:  { glows: [[230, 100, 95, 'warm']] },
      9:  { glows: [[610, 150, 110, 'warm']] },
      10: { glows: [[400, 150, 120, 'warm']] },
      11: { glows: [[300, 130, 95, 'warm']] },
      12: { glows: [[430, 120, 105, 'warm']] },
      13: { glows: [[400, 110, 120, 'warm']] },
      14: { glows: [[560, 130, 105, 'warm']] },
    };
    AMBIENT = {
      0: [30, 26, 60, 0.25], 1: [40, 42, 70, 0.28], 2: [40, 42, 70, 0.26],
      3: [255, 244, 210, 0.08], 4: [14, 16, 40, 0.34], 5: [255, 242, 205, 0.08],
      6: [50, 44, 72, 0.22], 7: [40, 32, 50, 0.24], 8: [255, 244, 215, 0.07],
      9: [50, 46, 80, 0.22], 10: [70, 70, 110, 0.16], 11: [55, 52, 92, 0.2],
      12: [90, 86, 130, 0.12], 13: [255, 238, 190, 0.08], 14: [255, 230, 180, 0.09],
    };
  }

  /* ---------- EPISODE FOUR data (The Hidden Name) ---------- */
  if (EP === 4) {
    FREEZE = {};
    AMBIENCE = {
      0:  { glows: [[236, 384, 55, 'warm'], [520, 128, 80, 'cold']] },
      1:  { glows: [[400, 210, 100, 'cold']] },
      2:  { glows: [[120, 190, 110, 'warm']] },
      3:  { glows: [[400, 148, 90, 'warm'], [400, 290, 60, 'warm']] },
      4:  { glows: [[268, 262, 55, 'warm'], [532, 262, 55, 'warm']] },
      5:  { glows: [[592, 232, 70, 'warm']] },
      6:  { glows: [[400, 196, 105, 'warm']] },
      7:  { glows: [[652, 148, 60, 'warm']] },
      8:  { glows: [[470, 96, 90, 'cold'], [236, 420, 50, 'warm']] },
      9:  { glows: [[236, 262, 60, 'warm'], [548, 264, 70, 'cold']] },
      10: { glows: [[668, 290, 100, 'warm'], [148, 220, 80, 'warm']] },
      11: { glows: [[300, 192, 70, 'warm'], [520, 192, 70, 'warm']] },
      12: { glows: [[430, 226, 95, 'cold']] },
      13: { glows: [[150, 210, 120, 'warm']] },
      14: { glows: [[400, 290, 100, 'warm']] },
    };
    AMBIENT = {
      0: [22, 26, 62, 0.28], 1: [26, 30, 68, 0.26], 2: [255, 226, 170, 0.09],
      3: [24, 28, 64, 0.26], 4: [20, 24, 56, 0.3], 5: [16, 16, 44, 0.3],
      6: [60, 34, 50, 0.22], 7: [50, 52, 64, 0.26], 8: [22, 26, 64, 0.26],
      9: [18, 18, 48, 0.3], 10: [30, 32, 66, 0.22], 11: [56, 38, 52, 0.2],
      12: [42, 52, 58, 0.24], 13: [255, 226, 170, 0.09], 14: [26, 28, 62, 0.26],
    };
  }


  var CUTOUTS = {};   // {pageIdx: [ {src, mask, ox,oy (feet=transform origin), hx,hy,r (tap disc), all in 800x500 plate coords} ]}

  /* ---------- EPISODE ONE data (Alpha and Omega) ---------- */
  if (EP === 1) {
    FREEZE = {};
    // the LIGHT as a living object: the running Father, cut from the oil plate by his own
    // silhouette layer, laid back exactly over himself — invisible at rest, but now he
    // breathes and blazes when you come to Him (Luke 15:20 "had compassion, and ran").
    CUTOUTS = {
      // grave (13): the sealed stone stays in the dark — a bright cut-out orb read as fake (Fred). The rolled-away rock lives on the risen page instead.
      15: [ { src: '/plates-vg/ran.jpg', mask: '/plates-vg/ran-dad.png', ox: 305, oy: 490, hx: 300, hy: 344, r: 60 } ]   // ran is now page 15 (gift moved after it); unused anyway — the diorama suppresses cutouts
    };
    // sprites unify via tooth/melt; a light per-page grade keeps the mask sitting in the oil
    AMBIENT = {
      5: [20, 22, 52, 0.22], 6: [16, 20, 44, 0.26], 7: [24, 26, 60, 0.24], 8: [30, 36, 70, 0.14],
      12: [14, 14, 34, 0.3], 22: [26, 30, 58, 0.2], 30: [40, 34, 66, 0.14],
    };
    // a warm glow at each page's light source (or over the pilgrim on bright pages)
    AMBIENCE = {
      0:  { glows: [[400, 258, 150, 'warm']] },
      1:  { glows: [[286, 168, 120, 'warm']] },
      2:  { glows: [[400, 210, 110, 'warm']] },
      3:  { glows: [[402, 320, 60, 'warm']] },
      4:  { glows: [[472, 128, 90, 'warm']] },
      5:  { glows: [[120, 210, 90, 'warm']] },
      6:  { glows: [[150, 200, 80, 'warm']] },
      // ⚠ RE-AIMED AT THE REDRAWN PLATE. This sat at (500,210) — empty sky in the new
      // painting — and on the phone it read as a second light brighter than home itself,
      // which is the one thing this page must not have. It is the far glimmer now.
      7:  { glows: [[292, 240, 84, 'warm']] },
      8:  { glows: [[138, 84, 90, 'warm']] },
      9:  { glows: [[150, 240, 95, 'warm']] },
      10: { glows: [[560, 300, 90, 'warm']] },
      11: { glows: [[384, 280, 90, 'warm']] },
      12: { glows: [[400, 210, 60, 'warm']] },
      // ⚠ SMALL AND TIGHT ON THE SEAM. At r=50 centred on the door this washed the whole
      // cut in lamp-light — the held light must be a THREAD escaping a shut stone, not a
      // lantern hanging in the doorway. Aimed at the join itself (the stone's left edge).
      13: { glows: [[388, 330, 22, 'warm']] },
      14: { glows: [[393, 320, 96, 'warm']] },   // risen: on the mouth itself — the tomb IS the light
      15: { glows: [[305, 360, 90, 'warm']] },   // ran (moved before gift) — glow on the Light
      16: { glows: [[400, 250, 80, 'warm']] },   // gift
      // ⚠ 17 twoways: NO GLOW. Fred: "the glow is from the sky, instead of animating with
      // different artworks you just make it glow. it is lazy." He is right, and he has
      // said it before — "rather than making the background that glows, why dont you
      // animate the amazing graphic you have made." A `.sc-glow.warm` is a CSS
      // radial-gradient div throbbing on a 4.2s loop forever; it is not paint, it did not
      // come out of the picture, and it sat over this page's sky pretending to be life.
      // This page now animates the way the book means it: six DRAWINGS of the meadow
      // plane, every mark redrawn a hair off (the boil). The light on this page is
      // painted into the plate where it belongs.
      // ⚠ 18 washed: NO GLOW. Fred's standing rule, given on twoways and applying here:
      // "dont be lazy, always draw to animate, not jst use stock animations like glow."
      // A .sc-glow.warm is a CSS radial-gradient throbbing on a loop — it is not paint and
      // it did not come out of the picture. This page's radiance now animates by being
      // DRAWN six times with the rays travelling outward (see gen/plates/washed.mjs).
      19: { glows: [[400, 230, 110, 'warm']] },
      20: { glows: [[330, 260, 90, 'warm']] },
      21: { glows: [[538, 398, 60, 'warm']] },   // re-centred on the given apple's glow (apple-tree rebuild)
      22: { glows: [[440, 400, 90, 'warm']] },
      23: { glows: [[400, 300, 100, 'warm']] },
      24: { glows: [[400, 300, 110, 'warm']], wisps: [[322, 334, 'smoke'], [332, 322, 'smoke'], [314, 328, 'smoke'], [326, 340, 'smoke']] },   // smoke off the bonfire (Fred, Sep 16: "animate the smoke as well")
      25: { glows: [[430, 300, 80, 'warm']] },
      26: { glows: [[400, 250, 150, 'warm']] },
      27: { glows: [[400, 250, 110, 'warm']] },
      28: { glows: [[520, 180, 90, 'warm']] },
      29: { glows: [[402, 300, 80, 'warm']] },
      30: { glows: [[400, 120, 130, 'warm']] },
      31: { glows: [[400, 200, 120, 'warm']] },
      32: { glows: [[400, 258, 150, 'warm']] },
    };
  }

  /* ---- MULTIPLANE DIORAMA (real depth) ----------------------------------
     The plate was drawn in separated layers and exported as transparent PNGs
     (sky / hills / birds / land / dad / kid …). Instead of one flat composite
     <img>, stack those planes and pan each at its OWN rate off the tilt camera:
     far planes crawl, the ground tracks the frame, near figures lead. That
     differential IS depth — the real version of what the shader only faked, and
     it keeps the actual oil paint (no re-render). Only pages whose layers exist
     as real PNGs opt in; everything else keeps the flat single-image pan. ---- */
    // pageIdx -> plate base name. Every LANDSCAPE page with real depth layers (radial
    // galaxy covers + bg/fg-only pages excluded). Layers de-baked so no pilgrim clone.
    var DIO = (EP === 1) ? {
      // the cover(0)/back(32) galaxy is a LEAN diorama now (8 planes = bg + 3 nebula
      // sheets + 3 mote shells + the Word, same weight as the heaviest story page) —
      // crisp + tiltable like every other page, WITHOUT the old 21-plane crash.
      0: 'word', 32: 'word',
      1: 'beginning', 2: 'flame', 3: 'made', 4: 'love', 5: 'turning', 6: 'garden', 7: 'lost',
      8: 'string', 9: 'looking', 10: 'road', 11: 'bridge', 12: 'paid', 13: 'grave', 14: 'risen',
      15: 'ran', 16: 'gift', 17: 'twoways', 18: 'washed', 19: 'born', 20: 'seeds', 21: 'bread',
      22: 'storm', 23: 'hands', 24: 'family', 25: 'prayer', 26: 'light', 27: 'come', 28: 'together',
      29: 'candle', 30: 'comes', 31: 'nonight',
    } : {};   // every story page renders from crisp layer planes now (the cover is redone separately)
    // planes whose figure is drawn by a RUNTIME actor instead — skip the baked copy
    // or you get a "shadow clone" (the layer's baked child + the CAST pilgrim = two).
    var DIO_SKIP = { 15: ['kid'] };               // the child is the site-wide runtime pilgrim (CAST1[15]), not the baked kid plane
    // per-page LIFE: which planes breathe radiance (a light source) or drift (birds/wind)
    var DIO_LIFE = {
      7:  { light: ['glim'] },
      9:  { light: ['shaft'] },                    // looking: the break in the storm swells and settles
      11: { light: ['mid'] },                     // bridge: the cross and the City share the `mid` plane — the light on the way over swells                     // lost: home, far off on the horizon, still burning — and breathing (the sky drifts via CLOUD_DRIFT)
      // ⚠ `dad` MOVED OUT OF `light`, and this is why his run never played: a plane listed
      // in DIO_LIFE is "lively", and the boil skips lively planes on purpose (the breath and
      // the boil both write animation-name, so one would erase the other). The Father was
      // breathing instead of running. He runs now — that IS his life on this page — and the
      // breathing light is the KINGDOM, which is what the page is running toward.
      15: { light: ['city'], drift: ['birds'] },   // ran: the Father's house shines; the flock wheels
      13: { light: ['seam'] },                    // grave: the held light breathes — it never goes out, and never flares
      14: { light: ['blaze'] },                    // risen: the light let out of the tomb swells and settles
      16: { light: ['hills'] },                    // gift: the open door (in the hills plane) breathes radiance
    };
    // UNDERGROUND CRITTERS — tappable life hidden in the earth cutaways (in 800x500
    // plate coords). Reveals the world below the soil as the roots hold (Matt 7:25).
    // ---- WHERE A CREATURE STANDS (Fred, Aug 2026) ----
    // The garden's rule, applied to the whole book: EVERY CREATURE BELONGS TO SOMETHING.
    // Fireflies gather at the fire; the bee and the ladybug are ON the tree; the snail
    // is at its foot. Nothing is scattered across a field just because the field had room.
    //
    // Audited page by page against each plate. What that turned up, over and over, was
    // creatures floating at head height in open air — butterflies swarming in a
    // rectangle of empty SKY, ladybugs (which crawl) hovering at y=300, and a rabbit on
    // `family` sitting ABOVE ITS OWN HORIZON, which is to say in the sky. They read as
    // stickers because they were stickers. Each one now sits on the thing that explains
    // it: a trunk, a flower bed, a blossom canopy, the foot of a tree, the shore.
    var CRITTERS = (EP === 1) ? {
      // ---- SIZES ARE NOW HONEST (Fred, Aug 2026) ----
      // A butterfly is TINY next to a child; a rabbit is a real armful; a bird sits
      // between them. Everything was drifting toward the same ~0.6 middling size, so
      // nothing had scale. butterfly 0.22-0.30 (and MANY, via {n,band} swarms),
      // ladybug 0.34, bee 0.4, firefly 0.5, bird 0.52, snail 0.6, rabbit 0.72.
      // ⚠ Swarm bands are authored ABOVE the poem (plate y < ~330) and INSIDE the
      // portrait window (fx0..fx0+312) — audited against CAST1 so nothing sits on a
      // figure, and re-audit after moving any actor.
      // ⚠ THE HELD CROSS. Fred: "make one overlay that stays there, at a higher opacity
      // (especially the cross in the middle)." The starburst's four long arms are drawn
      // TWICE — once STATIC at full length and strong opacity, then the breathing pass
      // over the top. The cross therefore never flickers however the loop turns; only
      // the reaching moves. On this page of all pages that is the right emphasis: the
      // shape at the heart of the first light is a cross, and it should hold still.
      // ⚠ AND THE RAYS ARE A RIG NOW, not a boiled plate (Fred, Aug 6: "i was thinking of
      // having a static image, and then we have transparent layer on top with other brush
      // strokes that animates. kind of like the fire we made"). The painting holds
      // perfectly still — no second drawing of it exists on this page any more — and the
      // light lives above it as lances of brushwork leaving the star. Box sized to the
      // THING (the lit region), centred on the same point as the starburst: 286,168.
      // ⚠ BOTH RIGS STAND ON THE PAINTED STAR (plate 250,150), and the painted star is
      // gone from the planes — de-baked, the way the garden's fire is. The inside of the
      // light moves; the deep and the long rays around it are a still painting. The
      // starburst used to sit at the page's focal point (286,168) instead, which is why
      // it never looked like the star was the thing burning.
      // ⚠ ON THE BURST'S OWN CENTRE, WHICH IS NOT THE SOURCE POINT. Fred: "the starburst
      // is not in the center of the graphics in the back." Measured rather than guessed:
      // the plate's rays are asymmetric (they lean down-right), so the gold's centre of
      // mass is (265,164) while the geometric source is (250,150). The eye centres on the
      // MASS. Both rigs are boxed on 265,164 now — and the residual 7-unit drift the live
      // DOM showed is gone with it.
      // SPARKLES in the deep around the light — never on the burst itself, each on its own
      // slow swell (drawCrossStars never blinks: at its dimmest a star is still there).
      // Placed inside the phone's window (plate x 156..444) and off the poem block.
      // and back onto the source itself: with the burst going all the way round, its
      // middle IS where the rays converge, so there is nothing left to chase.
      1: [ { type: 'stars', x: 108, y: 55, w: 380, h: 310, seed: 5,
             stars: [[292, 206, 8], [82, 222, 8], [97, 80, 9], [211, 60, 11], [319, 31, 10],
                     [272, 239, 9], [180, 243, 13], [78, 260, 6]] },
           // ⚠ Sep 23: the review rig lied, not the rig. `chrome --headless --window-size=W,H
           // --screenshot` lays the page out at a viewport 87px SHORTER than H (1440x813), so
           // fitOf() placed every sprite for 813, then the capture re-laid the CSS images at 900
           // and not the sprites: every runtime sprite read 35 plate units too high. On a real
           // screen these boxes sit on the plate's source (268,185). Shoot with gen/shot.mjs
           // (CDP, true viewport) — never with --window-size — when judging sprite placement.
           { type: 'firstlight', x: 118, y: 65, w: 300, h: 240, k: 12, r0: 16, r1: 132, seed: 3 },
           { type: 'starburst', x: 188, y: 105, w: 160, h: 160, r: 50, seed: 11, tilt: 0.18,
             hold: 0.62 } ],
      // ⚠ THIS PAGE MOVES THE OTHER WAY ROUND. Page 1 holds its painting still and hands
      // the light to a rig; here the PAINTING is the animation — the sea flows through six
      // drawings and the dawn sky breathes through two, the sun staying painted in it. The
      // only rig is sparkles in the sky, because a sunrise over water should shimmer.
      2: [ // ⚠ THE BACKGROUND IS THE POINT HERE (Fred: "so we can see the full background
           // in its full glory"), so nothing is parked in the middle of it. The two fish
           // and the four shore trees are DE-BAKED from the plate and rigged: the fish
           // swim their own stretch of water and turn at each end, the trees sway in the
           // page's wind, and the birds have moved off the open sea to the treetops where
           // birds actually belong.
           // ⚠ NO SKY-DRIFT SPRITE HERE. Fred, twice: "the wind scribble is also still
           // there." drawSkyDrift lays marks OVER the painted sky, and on a sky as
           // detailed as this dawn they read as scribbles on the art — the very fault the
           // boil was invented to avoid. The background moves the honest way instead: two
           // drawings of the sky plane itself, cross-faded (see BOIL_GLIMMER below).
           { type: 'stars', x: 180, y: 70, w: 440, h: 230, seed: 9,
             stars: [[46, 62, 9], [392, 48, 10], [118, 24, 7], [330, 132, 8], [66, 168, 8],
                     [402, 186, 9], [214, 20, 6]] },
           // ⚠ THE PHONE ONLY SHOWS PLATE x≈160..377 ON THIS DEVICE. Everything below is
           // placed against THAT window, not against the 800-wide plate — the painting's
           // own trees stand at x 92 and 716, which is why the shore looked empty on a
           // phone. The de-baked four are rigged where they were painted (so desktop
           // keeps its composition) and two more stand inside the window, on the same
           // flowering shore, so a reader on a phone sees a wooded coast.
           // ⚠ fruitTree's signature is (cx, baseY, HEIGHT, WIDTH) — 64x30 is a tall
           // narrow tree, not a wide low one. Sizes below match the painted ones exactly.
           // (the two great trees are PAINTED now, in their own near plane — see
           // flame.mjs. A framing tree that lives in the picture is glued to its ground by
           // construction and parallaxes with it, which no sprite placement can promise.)
           // birds AT THE TREES, and inside the window where they can be seen
           // ⚠ BIRDS BELONG ON THE WOOD (Fred: "put the birds on the tree"), not adrift over
           // open water — a bird in the middle of a sea with no perch is a sticker. These
           // sit in the two canopies, at the height the boughs actually reach.
           { type: 'bird', x: 214, y: 196, s: 0.42, col: 'blue', phase: 0.0 },
           { type: 'bird', x: 632, y: 168, s: 0.38, col: 'blue', phase: 1.3 },
           { type: 'bird', x: 690, y: 240, s: 0.32, col: 'blue', phase: 2.4 },
           // "He made the world, and filled it with light" — light lying on the great waters
           // (Gen 1:2). Horizontal lenses only, shorter and dimmer up the band because
           // that end is farther away.
           // ⚠ THE LITTLE FISH: the emoji's cheerful shape, painted in the plate's hand,
           // each swimming its own stretch of water and turning at the ends. They live in
           // the near water below the sea-line, where a fish can actually be.
           // THE GREAT WHALE (Gen 1:21), out by the light's track, cruising slowly — the
           // painted one was a dark arc nobody could name ("what is this supposed to be?").
           { type: 'whale', x: 372, y: 276, w: 150, h: 90, len: 78, facing: -1, seed: 7, swim: [96, 46] },
           // ⚠ UP INTO THE OPEN WATER. Fred: "i can still see that it is on the ground."
           // The sea runs from the sea-line (~y295) to where the land starts (~y378), and
           // anything sitting in its last thirty units reads as beached — the shore's own
           // colour is right behind it. They all moved up ~30 units, into water that has
           // water underneath it.
           // ⚠ TO SCALE, AND IN THE WATER. A 44-unit fish is two thirds of the whale (68) —
           // on an 800-wide plate that is a fish the size of a boat. These are 11-17 units,
           // and they sit between the sea-line (~y295) and the shore (~y375), which is the
           // only band where a fish can actually be. The far one is smallest, as distance
           // requires.
           // ⚠ SPREAD RIGHT ACROSS THE SEA, not clustered in the middle of one screen. The
           // sea is 800 units wide and a phone sees ~215 of them, so a shoal parked at the
           // centre is three fish in one window and an empty ocean everywhere else. Six of
           // them now, from x=132 to x=688, at different depths, sizes and speeds — the
           // higher (further) ones smaller, as distance requires.
           { type: 'fish2', x: 132, y: 312, w: 32, h: 24, len: 12, facing: 1, seed: 31, swim: [-48, 29] },
           { type: 'fish2', x: 246, y: 336, w: 40, h: 30, len: 15, facing: -1, seed: 5, swim: [64, 22] },
           { type: 'fish2', x: 352, y: 308, w: 30, h: 22, len: 11, facing: -1, seed: 21, swim: [42, 34] },
           { type: 'fish2', x: 470, y: 332, w: 42, h: 32, len: 16, facing: 1, seed: 12, swim: [-58, 26] },
           { type: 'fish2', x: 604, y: 316, w: 34, h: 26, len: 13, facing: -1, seed: 44, swim: [52, 31] },
           { type: 'fish2', x: 688, y: 340, w: 38, h: 28, len: 14, facing: 1, seed: 58, swim: [-44, 24] },
           { type: 'ripple', x: 60, y: 288, w: 700, h: 84, n: 30, seed: 23 },
           { type: 'butterfly', n: 19, s: 0.34, band: [250, 428, 560, 482] }],   // was over open WATER; now low over the shore meadow   // flame — the world made, TEEMING (Gen 1:20-22)
      // 3 (`made`) — Fred: "it does not really match the storyline". This is the
      // Michelangelo reach, the moment YOU are made: two fingertips across the dark.
      // Meadow butterflies and a songbird belonged to a different page. Removed.
      // ⚠ THE SPARK IS A RIG, like page 1's star (Fred: "make the starburst the same as
      // the one before"). It is de-baked from the plate, so the deep field, the two arms
      // and the child are a still painting and the LIFE BEING KINDLED is what moves:
      // the heart and its arms from `starburst`, the light leaving it from `firstlight`.
      // Its own graphics, not page 1's: the reach is close and small, so the lances are
      // short and quick, and instead of stars in a void this page gets MOTES rising out
      // of the gap — the first life going up from the touch.
      3: [ { type: 'firstlight', x: 250, y: 100, w: 300, h: 300, k: 14, r0: 12, r1: 118, seed: 17 },
           { type: 'starburst', x: 330, y: 180, w: 140, h: 140, r: 40, seed: 23, tilt: 0.55,
             hold: 0.30 },
           { type: 'stars', x: 190, y: 96, w: 420, h: 300, seed: 31,
             stars: [[52, 44, 8], [368, 62, 9], [128, 232, 7], [318, 244, 8],
                     [206, 26, 6], [92, 150, 7], [352, 150, 6]] }],
      4: [ { type: 'rabbit', x: 232, y: 462, s: 0.72, facing: 1, phase: 0.0 },   // was floating at the horizon; now sitting at the tree's foot     // love — clear of BOTH pilgrims (303,416 / 333,416) and above the poem
           // clear of both children (303/333, feet 416) and of the rabbit at 214,322
           { type: 'tree2', x: 180, y: 452, w: 26, h: 64, seed: 5, pal: 'night', lit: 0.30, phase: 1.1 },
           { type: 'tree',  x: 690, y: 446, w: 11, h: 66, seed: 2, big: false, pal: 'night', lit: 0.20, phase: 3.4 },
           { type: 'ladybug', x: 192, y: 412, s: 0.34, phase: 0.8 },   // was hanging in mid-air; now ON the tree at 180
           // shifted LEFT of the two children (303/333) — it was over their faces
           { type: 'butterfly', n: 16, s: 0.36, band: [170, 400, 296, 462] }],    // love — the meadow He made for you: DOWN in the flowers, not in the sky
      // THE FIRE. x MUST match COLX in gen/plates/garden.mjs (186) — the plate's whole
      // light field is computed from that point, so the flame has to stand exactly
      // where the light says it does. w=100 spans 136..236, and the portrait window is
      // 144..456, so its left edge sits just at the frame: that is deliberate, the
      // Light is walking IN from off-stage. h=216 matches COLBASE-COLTOP.
      // SKY · STARS · GRASS — the slowest rungs of the tempo ladder, wired at a frame
      // CAP (Fred's idea) so their sheets stay small: sky 2 frames, stars 3, grass 10.
      // At 24s per cycle a 2-frame sky reads as drift, not as a step.
      // Instrumented and confirmed on the simulator: sky 2460x450, stars 3690x375,
      // grass 12300x66, fire 6144x437 @16 frames, tree 3974x691 — every canvas
      // allocating at its requested size, nothing truncated.
      // ⚠ SKY / STARS / GRASS / the four-tree stand: ALL REMOVED. They broke the page,
      // and worst on DESKTOP — which shows the full 800-wide plate rather than the
      // 312 portrait crop, so full-width overlay sprites reveal their box edges as hard
      // rectangular seams across the painting, and the thin cypress profiles read as
      // flat-topped reeds at that scale. I had only ever been checking the phone.
      // What is kept is what Fred actually approved: THE FIRE, one animated cypress on
      // the right, and the fireflies.
      // Before any of this returns it needs: (1) verification on desktop AND phone,
      // (2) overlays that dissolve at every edge, (3) a cypress profile that tapers to
      // a point instead of ending on a blunt 0.3*w crown.
      6: [ // ⚠ THE ONE MOTION THIS PAGE MAY HAVE. `garden` refused the gust because "He came
           // looking. You hid." is a held breath — but the Light IS moving up that road
           // toward the child, and the plate draws it as a bright spine (roadSpine in
           // gen/plates/garden.mjs: 136+t*268, 500-t*42). A gleam travelling up it is not
           // weather crossing the scene; it is the page's own sentence.
           { type: 'spine', x: 116, y: 442, w: 308, h: 76, w0: 8, w1: 3, col: [255, 226, 150],
             pts: [[20,58],[74,50],[127,41],[181,33],[234,24],[288,16]] },
           { type: 'fire', x: 208, y: 452, w: 96, h: 168, k: 12, seed: 9 },   // ⚠ Sep 12: shrinking this to 74×122 for the perspective pass was reverted the same hour — Fred: "the fire didnt animate anymore". The child was made bigger instead (CAST1[6] h 100); the fire keeps the size it was tuned at
           // ⚠ SITED FOR BOTH VIEWS. The phone shows only plate x~156-444 at rest (a
           // 288-wide window on an 800-wide plate) while desktop shows all of it — so a
           // tree placed by eye on desktop can fall clean outside the phone frame, which
           // is what happened at x=520/690: correct on Fred's screen, invisible on mine.
           // 500 puts the near tree fully clear of the child (428, whose cloak reaches 448)
           // reachable on the phone; 660 brings the far one in off the plate edge.
           // BOTH cypresses are runtime now — the plate bakes neither (Fred: "animate
           // the new tree since it is not animated"). Spread apart on his direction:
           // the near one moved RIGHT off the child it was standing on, the far one
           // moved LEFT out of the frame edge. Different heights, widths, densities and
           // seeds — never a matched pair (the traffic-light lesson).
           { type: 'tree', x: 552, y: 486, w: 62, h: 440, seed: 5,  big: true,  lit: 0.30, phase: 0.0 },   // Oct 6: 4 child-heights at its depth (see garden.mjs KIDU) — a cypress towers   // Sep 26: 196 → 270 beside the resized fruit trees
           { type: 'tree2', x: 712, y: 440, w: 80, h: 230, seed: 11, pal: 'garden', lit: 0.34, phase: 4.1, grade: true, warm: 0.08 },   // Oct 6: the far tree the bee, ladybug and snail live on — mid-distance, lit   // Sep 26: bigger (proportion) — and lit, or at this size it is a flat dark blob   // Sep 26: 150 → 240 (proportion; see garden.mjs)
           // Fred's placing: the creatures belong TO something, not scattered on the
           // field. Fireflies gather at the FIRE (light draws them); the bee and the
           // ladybug are ON the far cypress (x 660, base 452, crown 292); the snail is at
           // its foot. Every creature now has a reason to be where it is.
           { type: 'bee', x: 700, y: 292, s: 0.4, facing: -1, phase: 0.0 },
           { type: 'ladybug', x: 728, y: 372, s: 0.34, phase: 1.3 },
           { type: 'snail', x: 688, y: 442, s: 0.6, facing: 1, phase: 0.6 },
           { type: 'firefly', x: 272, y: 386, s: 0.5,  phase: 0.0 },
           { type: 'firefly', x: 152, y: 402, s: 0.44, phase: 1.3 },
           { type: 'firefly', x: 244, y: 320, s: 0.48, phase: 2.2 },
           { type: 'firefly', x: 168, y: 338, s: 0.42, phase: 0.7 } ],
      // ⚠ NO BIRD SPRITES HERE. Fred: "delete the emoji birds, animate the birds on
      // the background." Quite right — this plate already has a flock, painted in its
      // own hand: 31 maroon and 3 green, which is Jeremiah 31:3. Cartoon birds pasted
      // over that were both redundant and a different draughtsman. The painted flock
      // now has its own depth plane and is thrown by the gale instead.
      8: [ // ⚠ THE CORD IS DRAWN HERE, NOT PAINTED INTO THE PLATE. It is the one thing on
           // this page that must END ON A MOVING BODY, so it is redrawn every frame with
           // its tip on the child's back — same hand, same control points the plate used.
           // Local coords are plate minus (176, 90); `amp` is the whip's throw at the tie,
           // the identical number the child rides, so tip and back move as one.
           // box widened for the snake: the wave pushes +/-16 units either side of the
           // cord's resting path, and a clipped cord would read as a cut string.
           { type: 'tether', x: 170, y: 80, w: 240, h: 390, seed: 3, wave: 15,
             // amp 0: his back does not move, so neither does the tip. Both ends of the cord
             // are pinned and only its middle bows — which is what a taut line does.
             // ⚠ AND IT ENDS EXACTLY ON THE AXIS. Fred: "there can be moments like this
             // where the string is not attached to the kid." `overlap` used to carry the
             // tip 12px PAST the tie so its end-cap would hide inside him — but he SPINS,
             // and on a turning body every point except the axis travels. A tip 12px off
             // the axis traces a 12px circle out from under him and shows on some frames.
             // The axis is the one point that never moves relative to him: end there.
             // tie is his rotation axis (CAST1[8] tether.tie = plate 336,130) in local
             // coords — plate minus (176, 90). The two must always be the same point.
             // ⚠ THE TIE IS SET FROM THE RENDER, NOT FROM ARITHMETIC. Deriving it from the
             // actor's box and transform-origin gave a point ~25 plate units left of where
             // he actually hangs, and the cord ended in mid-air (Fred: "there can be moments
             // like this where the string is not attached to the kid"). Measured off six
             // frames of his spin: he sits at plate ~(361,122), so the tie is that point in
             // local coords — plate minus (176, 90) — and the cord runs 18px on into him.
             // ⚠ THE CORD IS BEHIND HIM, SO LET IT RUN IN DEEP. Landing its tip exactly on
             // his rotation axis is ill-conditioned — the origin is pinned in plate space
             // while his box moves under it, so position and origin fight, and every number
             // I tried left a gap at some angle. But critters are added to the layer BEFORE
             // the cast, so the cord passes UNDER him: an end that runs well past the tie is
             // simply buried in his body, and cannot be uncovered by a few units of drift.
             // Robust where arithmetic was not.
             // ⚠ THE LOCAL→PLATE OFFSET IS MEASURED, NOT ASSUMED. Two renders pin it down:
             // tie 160 put the tip at plate 336, tie 175 put it at 350 — so the mapping is a
             // 1:1 translation and local = plate - (175, 75). (The old comment said (176,90)
             // and a later guess said (50,80); both were wrong in y or x, which is why no
             // value of `tie` ever met him.) His axis is (a.x, a.y - 0.45h) = (340, 131) —
             // the one point his spin does not move — so: local (165, 56).
             hand: [32, 340], tie: [165, 56], c1: [152, 334], c2: [198, 106], amp: 4, overlap: 14 } ],
      9: [ // gathered to the great cypress on the left, the way the garden's are to the fire
           { type: 'firefly', x: 214, y: 300, s: 0.5, phase: 0.0 },   // ⚠ one at the cypress (desktop only — the tree stands at x~186, outside the phone's 244..556)
           { type: 'firefly', x: 306, y: 348, s: 0.44, phase: 1.1 },   // the other two over the lit ridge, where a phone reader can see them
           { type: 'firefly', x: 344, y: 316, s: 0.5, phase: 2.0 } ],
      10: [ { type: 'rabbit', x: 268, y: 452, s: 0.72, facing: 1, phase: 0.0 },   // off the skyline, down at the tree's foot    // road — was y=360, behind the poem
           // the near field either side of the lit road; the child stands at 380,361
           // Sep 26 (proportion): a bush at y 440 is ~1.6× the child's depth-scale — 48 read as a toy; 80 is a bush.
           // (the 50-unit cypress beside the road was a sapling where a cypress would stand 300+ — removed)
           { type: 'tree2', x: 296, y: 440, w: 34, h: 80, seed: 7, pal: 'night', lit: 0.30, phase: 0.6 } ],
      // ⚠ NO BIRD HERE. Fred: "remove the bird emoji" — and it was this one, not the painted
      // doves I removed first: a round yellow cel-shaded bird perched in mid-air over a
      // canyon at night. Everything wrong with it at once — it is daytime-coloured on a
      // nocturne, it sits on nothing, and at that size a two-tone blob IS an emoji. The
      // painted doves went too: at their scale a pale two-stroke wing is also a glyph.
      // If this page wants a bird again it should be one that actually flies.
      // ⚠ NO BIRDS HERE EITHER. Fred said "remove the bird emoji" of the one on `road`, and
      // these are the same sprite on the next page — a round cel-shaded bird hanging in the
      // air over a canyon. Applying his call where it obviously applies rather than waiting
      // to be told twice. (The rule, for later: a bird in this book either flies a real
      // path or is not there.)
      11: [],
      13: [ { type: 'firefly', x: 320, y: 300, s: 0.5, phase: 0.0 }, { type: 'firefly', x: 520, y: 272, s: 0.44, phase: 1.4 } ],
      14: [ { type: 'butterfly', n: 14, s: 0.34, band: [240, 348, 540, 432] }],   // down among the resurrection flowers   // risen — the grave could not hold Him; the air comes alive
      15: [ { type: 'rabbit', x: 220, y: 408, s: 0.72, facing: 1, phase: 0.0 },   // in the orchard grass, not hovering over it    // ran — open field, clear of the Father (312,389) and above the poem
            { type: 'butterfly', n: 12, s: 0.34, band: [190, 330, 470, 412] }],   // down to the blossom and the flowers   // was one at 500 — outside the window (148..460)
      16: [ { type: 'butterfly', n: 22, s: 0.34, band: [280, 338, 540, 430] },   // down over the field's flowers
           // gaps in the baked avenue (65/149/279 and 539/632/735), off the path
           // ⚠ the two 12-frame tree SHEETS are gone from here (~6 MB); the whole avenue
           // sways as cheap one-frame sprites in SCENE1[16].trees instead.
            { type: 'bee', x: 356, y: 412, s: 0.4, facing: -1, phase: 0.5 },   // a bee belongs at flowers, not in open sky (Song 2:12)
            { type: 'ladybug', x: 336, y: 432, s: 0.34, phase: 1.1 } ],   // onto the trunk of the tree at 330
      // ⚠ THE TREES THAT MOVE. Fred: "make the trees sway and the sky move." The sky is the
      // boil (six drawings of sky1); the trees are these. They CANNOT be boiled — they live
      // in `mid` with the palace, and a boil doubles architecture (see BOIL_PLANES below for
      // the measurement). A sway sprite costs no depth plane at all.
      // ⚠ Each of these four is REMOVED from the painted tree list in gen/plates/twoways.mjs.
      // Paint one and sprite it in the same spot and it gets a still twin standing beside it.
      // Phases spread so the wood does not breathe in unison — the page's wind is
      // WIND[17] { period 8.0, gust 0.70, dir 1 }.
      17: [ { type: 'tree2', x: 100, y: 366, w: 50, h: 128, seed: 31, pal: 'garden', lit: 0.30, phase: 0.4, grade: true, warm: 0.12 },
            { type: 'tree2', x: 40, y: 344, w: 38, h: 96, seed: 43, pal: 'garden', lit: 0.30, phase: 1.2, grade: true, warm: 0.10 },
            { type: 'tree2', x: 640, y: 452, w: 70, h: 180, seed: 37, pal: 'garden', lit: 0.32, phase: 2.1, grade: true, warm: 0.14 },
            { type: 'tree2', x: 726, y: 386, w: 46, h: 120, seed: 41, pal: 'garden', lit: 0.30, phase: 3.6, grade: true, warm: 0.12 },
            { type: 'bird', x: 340, y: 250, s: 0.5, phase: 0.0 },
            { type: 'butterfly', n: 13, s: 0.34, band: [260, 330, 540, 424] }],   // off the palace, down onto the field   // twoways — carried home through the flowering meadow
      19: [ { type: 'bird', x: 320, y: 238, s: 0.5, phase: 0.6 },   // was buried in the canopy; lifted into open sky
            { type: 'bee', x: 488, y: 262, s: 0.4, facing: -1, phase: 1.3 },
            { type: 'butterfly', n: 24, s: 0.36, band: [280, 252, 540, 336] } ],   // born — all things NEW; held to the blossom, where the bee already is
      20: [ // the pond the child's planting grew around
           { type: 'ripple', x: 150, y: 396, w: 420, h: 62, n: 18, seed: 29,
             cols: [[255,246,214],[224,240,248],[255,232,186]] },
           { type: 'ladybug', x: 404, y: 432, s: 0.34, phase: 0.4 },   // down into the flowers at the pond
            { type: 'butterfly', n: 13, s: 0.34, band: [220, 332, 500, 428] }],   // out of the sky, onto the meadow   // seeds — whatever the child planted, grew
      // ⚠ REPOSITIONED for the apple-tree rebuild (gen/plates/bread.mjs): the path
      // and the old avenue this pair answered to are both gone, and the old x's
      // (384, 186..380) fell entirely outside the new portrait window (399..711,
      // fx0 moved 264→399) — both creatures were invisible on the phone. Ladybug
      // now on the apple tree's trunk; butterflies over the flowering meadow
      // around it, clear of the canopy (≈460..660) and the actor (486,400).
      21: [ { type: 'ladybug', x: 567, y: 412, s: 0.34, phase: 0.5 },
            { type: 'butterfly', n: 11, s: 0.34, band: [430, 380, 700, 470] }],   // bread — the calm field, now under the apple tree
      // ⚠ THE GUST. Torn leaves travelling with the page's own wind (dir -1, so they
      // run leftward across the frame), tumbling as they go. Held ABOVE the soil line —
      // the box stops at y=300, which is where this plate's earth begins — because
      // leaves blow over ground, not through it. Their travel envelope hides the loop's
      // wrap and the edge envelope keeps the box itself invisible.
      22: [ { type: 'leaves', x: 0, y: 40, w: 800, h: 260, n: 34, seed: 17,
             dir: 3.34, span: 980, scale: 1.15 } ],
      23: [ { type: 'bird', x: 500, y: 240, s: 0.52, phase: 0.0 },
            { type: 'butterfly', n: 8, s: 0.34, band: [300, 244, 560, 322] }],   // held to the treeline on the right   // hands — the sunny lane
      24: [ // ⚠ THE BONFIRE IS THE GARDEN'S. Fred: "if you make family as bonfire, refer
           // to garden. i like that fire." Same drawBonfire, same k, sized to this yard:
           // w96 h138 from y462 puts the tip at y~324, clear under the children's heads
           // (the tallest tops out at y312) — the keep-out zone still holds.
           { type: 'fire', x: 320, y: 452, w: 80, h: 126, k: 14, seed: 9 },   // ⚠ 80 wide: it must fit the gap the near pair leave   // ⚠ moved with the ring; kept short so it never reaches a face
           { type: 'rabbit', x: 358, y: 352, s: 0.62, facing: 1, phase: 0.0 },   // clear of every figure, at the foot of the tree behind them   // was in the SKY; now at the foot of the tree behind the family    // family — was at 320,392, on THREE figures and the poem; 172 fell outside the window
           // ⚠ THERE WAS A tree2 AT x405 y352 AND IT HAD TO GO. That "gap at 405" stopped
           // being a gap when the house got its open door there and the fire went in front
           // of it: the tree's crown sat in the lit doorway with the flame directly below,
           // so from any distance the house appeared to have a bush growing out of the
           // fire. I hunted it in the plate twice before ?inspect=1 named it a SPRITE.
           // The page has four trees already (painted at 100/460/712, runtime at 640).
           // ⚠ pal 'day' ON A NIGHT PAGE. This tree was the brightest green in the picture —
           // a sunlit crown standing forty feet from the fire in the dark, which is exactly
           // the two-lights fault the whole page was rebuilt to fix. I hunted it in the
           // PLATE before remembering it is a sprite.
           { type: 'tree',  x: 640, y: 440, w: 16, h: 88, seed: 13, big: false, pal: 'night', lit: 0.10, phase: 3.9 },
            // ⚠ AND SIXTEEN BUTTERFLIES AND A BIRD WERE STILL FLYING. They were right when
            // this was an afternoon meadow. What is out at night over a field is fireflies,
            // and they are also the only life that can share a page with "one Light" — they
            // are too small to argue with it, and they are going the same way.
            { type: 'firefly', x: 236, y: 322, s: 0.50, phase: 0.0 },
            { type: 'firefly', x: 546, y: 300, s: 0.44, phase: 1.4 },
            { type: 'firefly', x: 118, y: 356, s: 0.46, phase: 2.6 },
            { type: 'firefly', x: 676, y: 344, s: 0.42, phase: 3.7 },
            { type: 'firefly', x: 430, y: 296, s: 0.40, phase: 5.1 }],
      25: [ { type: 'firefly', x: 350, y: 300, s: 0.5, phase: 0.0 }, { type: 'firefly', x: 480, y: 262, s: 0.44, phase: 1.2 } ],
      // ⚠⚠ 26 `light` AND 27 `come` HAD NO RUNTIME LIFE AT ALL. Fred: "create more movement.
      // there are no characters on these pages so you can go ham." Both pages already carry a
      // four-drawing ring, but a ring is four pictures a second at best, and adding a second
      // boiled plane costs another 6.4 MB per drawing — `light` alone declares SEVEN planes
      // before anything moves. Runtime sprites are the other kind of drawn animation: real
      // marks, redrawn every frame, on their own managed budget (PAGE_BUDGET), and they
      // degrade by dropping frames instead of by killing the tab.
      // ⚠ NONE of this is a CSS glow. Fred's standing rule — "dont be lazy, always draw to
      // animate, not jst use stock animations like glow" — is why every one of these is a
      // painter: drawSunSpiral scatters leaning marks round a centre with a twist wave
      // travelling outward, which is this page's own subject drawn moving.
      // ⚠ TUNED DOWN TWICE, AND BOTH REASONS ARE ABOUT THE PAINTING UNDER IT.
      //   · drawSunSpiral's ramp ends in an olive grey, which is right over `come`'s gold
      //     rays and wrong over THIS page's rainbow rim — 420 marks reaching r1=244 read as
      //     straw thrown across the glory. The ring is now held inside the GOLD ZONE of the
      //     plate (r 74-186), where the sprite's colour is the picture's colour.
      //   · at r1=244 it also lay across יהושע at the foot of the frame. The Name is the
      //     one thing on this page nothing may be drawn over.
      // ⚠ AND THE `starburst` IS GONE. It put a clean white four-point star on the core —
      // which is a sparkle, and this page already has a core Fred painted. A sprite has to
      // add motion the picture wants, not an effect on top of it.
      26: [ { type: 'sunrays', x: 122, y: 22, w: 556, h: 456, r0: 74, r1: 186, n: 230,
              lean: 0.62, amp: 0.32, lam: 132, len: 30, lw: 3.0, seed: 9 },
            // glints out in the rainbow rim, where the plate's own painted sparkles are —
            // they hold their exact places and only kindle, which is the one kind of life
            // the rim can take without another wheel of gold being drawn across it.
            { type: 'stars', x: 110, y: 40, w: 580, h: 430, seed: 5,
              stars: [[140, 80, 9], [450, 70, 11], [530, 190, 8], [190, 300, 10],
                      [410, 320, 9], [70, 200, 8], [320, 50, 7], [500, 340, 10]] } ],
      27: [ // the same wheel, turning round the open door — r0 130 keeps every ray OUTSIDE
            // the door frame, which is a built thing and must not have light drawn across it.
            // ⚠ r1 pulled in from 286 to 172: at full reach this wheel threw gold strands
            // straight down across the river, which the painted beams had just been cut back
            // to avoid. The sprite has no way to mask an angle, so it keeps to the glory.
            { type: 'sunrays', x: 92, y: 22, w: 616, h: 466, r0: 126, r1: 172, n: 300,
              lean: 0.50, amp: 0.26, lam: 162, len: 26, lw: 3.0, seed: 17 },
            // lances of light thrown out of the doorway
            { type: 'firstlight', x: 252, y: 112, w: 296, h: 286, k: 14, r0: 22, r1: 128, seed: 23 },
            // and two doves crossing the glory (Rev 22:17 — the page is an invitation)
            { type: 'bird', x: 236, y: 118, s: 0.50, phase: 0.0 },
            { type: 'bird', x: 548, y: 92,  s: 0.44, phase: 1.6 },
            { type: 'bird', x: 150, y: 196, s: 0.42, phase: 2.9 },
            { type: 'bird', x: 660, y: 168, s: 0.46, phase: 4.3 },
            /* ⚠⚠ LIFE AT THE WATER OF LIFE. Fred: "make the scene alive." The page had light
               moving on it and nothing LIVING in it — and this is the one page in the book
               whose verse is an invitation to come and drink, with a river running out of the
               door and reeds on both banks (Rev 22:1-2, "on either side of the river"). A
               river with nothing in it is scenery; a river with fish in it is a place you
               could go. Every one of these is a PAINTER — none is a stock effect.
               ⚠ Sited inside the phone's window (plate x 244-556) so a reader on a phone gets
               the life, not just the desktop. */
            { type: 'fish2', x: 348, y: 452, w: 32, h: 24, len: 12, facing:  1, seed:  7, swim: [ 52, 26] },
            { type: 'fish2', x: 448, y: 478, w: 30, h: 22, len: 11, facing: -1, seed: 19, swim: [-44, 31] },
            { type: 'fish2', x: 392, y: 488, w: 36, h: 26, len: 13, facing:  1, seed: 33, swim: [ 40, 24] },
            { type: 'dragonfly', x: 322, y: 424, s: 0.40, phase: 0.4 },
            { type: 'dragonfly', x: 474, y: 442, s: 0.36, phase: 2.1 },
            /* ⚠ NO `grass` SPRITE FOR THE REEDS — and now I know why no page in the book uses
               that type. Dropped in at the banks it drew its canvas BOX as a hard grey
               rectangle over the water (the box-seam fault), and its blades came out as bare
               brown poles rather than reeds. The painted reed clumps are better; the water's
               life comes from the fish and the dragonflies instead. */
            // and the air over the land on either side of the way in
            { type: 'butterfly', n: 12, s: 0.34, band: [140, 318, 320, 428] },
            { type: 'butterfly', n: 12, s: 0.34, band: [492, 318, 672, 428] },
            // the water of life catching the door's light as it comes toward you
            { type: 'ripple', x: 262, y: 428, w: 288, h: 64, n: 18, seed: 29 },
            { type: 'stars', x: 150, y: 70, w: 520, h: 390, seed: 13,
              stars: [[100, 80, 9], [410, 80, 10], [50, 230, 8], [450, 230, 9],
                      [180, 50, 7], [330, 40, 8], [120, 350, 9], [390, 340, 8]] } ],
      28: [ /* ⚠ A FLOCK GOING THE SAME WAY. This page says "show them the way home", and one
               bird over a still night said nothing. Birds strung up the road toward the Light,
               smaller the nearer they get to it, are the page's own sentence drawn: others on
               the same road, going home. */
            { type: 'bird', x: 320, y: 262, s: 0.52, phase: 0.0 },
            { type: 'bird', x: 396, y: 236, s: 0.46, phase: 1.1 },
            { type: 'bird', x: 452, y: 214, s: 0.40, phase: 2.3 },
            { type: 'bird', x: 508, y: 196, s: 0.34, phase: 3.4 },
            { type: 'bird', x: 250, y: 296, s: 0.56, phase: 4.6 },
            { type: 'butterfly', n: 14, s: 0.34, band: [230, 250, 500, 340] },
            // fireflies rising off the lit road, close to where the two are walking
            { type: 'firefly', x: 296, y: 404, s: 0.50, phase: 0.0 },
            { type: 'firefly', x: 344, y: 372, s: 0.44, phase: 1.7 },
            { type: 'firefly', x: 238, y: 424, s: 0.46, phase: 3.1 } ],
      29: [ // ⚠ THE SUBJECT OF THIS PAGE IS THE LIGHT ITSELF ("One small light is enough
           // to see by", Matt 5:16) — so the light is what moves. A flame with no
           // woodpile, small, at the heart of the painted glow. The page's air is
           // nearly still on purpose: a candle in a gale is a lie.
           { type: 'fire', x: 400, y: 292, w: 26, h: 58, k: 8, seed: 4, logs: false },
           { type: 'firefly', x: 452, y: 246, s: 0.5, phase: 0.0 },               // candle — clear of the pilgrim (318,456 h168), which reaches y~288
            { type: 'firefly', x: 470, y: 268, s: 0.44, phase: 1.5 } ],
      31: [ { type: 'bird', x: 500, y: 250, s: 0.52, phase: 0.0 },
            { type: 'butterfly', n: 19, s: 0.34, band: [280, 330, 560, 424] }],   // down to the fruit trees along the bottom   // nonight — the City, and no more night

    } : {};
    // default far→near depth by layer NAME, so pages whose data-layers omit @depths
    // (e.g. "bg,far,mid,fg") still parallax instead of moving as one flat sheet.
    var DIO_DEPTH = {
      bg: 0, sky: 0, sky1: 0.1, sky2: 0.18, far: 0.34, hills: 0.34, birds: 0.42,
      mid: 0.5, land: 0.5, ground: 0.55, tc: 0.58, t3: 0.5, ta: 0.66, t2: 0.62,
      dad: 0.68, tb: 0.74, t1: 0.74, near: 0.82, kid: 0.86, fg: 0.9,
      front: 0.64,   // a FRONT plane (light rays over the figure) — renders above the sprite layer, gentle near-depth parallax

      // the WORD cover — nebula sheets (n) far, verse-mote shells (s) stepping OUTER→INNER
      // toward the radiant Word (fg, closest). Tilt → the Bible-galaxy opens in depth.
      // 3 nebula sheets recede (<0.30), 3 mote shells step OUTER→INNER toward the
      // Word (fg 0.9, closest) — a wide depth spread so the galaxy opens on tilt.
      n0: 0.08, n1: 0.16, n2: 0.24,
      s0: 0.42, s1: 0.56, s2: 0.70,
    };
    function dioPlanes(page) {                    // "sky@0,hills@0.34,dad@0.68" -> [{name,depth}]
      var s = page.dataset.layers; if (!s) return null;
      return s.split(',').map(function (t) {
        var a = t.split('@'), name = a[0].trim();
        var depth = a[1] != null ? parseFloat(a[1]) : (DIO_DEPTH[name] != null ? DIO_DEPTH[name] : 0.5);
        return { name: name, depth: depth };
      });
    }
    // Rate 1.0 == "tracks the frame like the flat pan". The GROUND WORLD — hills,
    // horizon, birds, the wheat the road is painted on — must all share rate 1.0, or
    // the road slides out from under the horizon it runs into and its hidden far end
    // gets exposed mid-field (Fred's "road got cut"). So: only the SKY recedes behind
    // (<1) and only the near FIGURES pop forward (>1); everything the road touches
    // moves as one connected world. Rate 1.0 also reaches the far house at full tilt.
    function dioRate(d) {
      if (d < 0.30) return 0.62 + d;          // sky sheets recede (sky 0.62 → 0.90)
      if (d <= 0.55) return 1.0;              // hills · birds · land = ONE world (road stays glued to the horizon)
      return 1.0 + (d - 0.55) * 1.45;         // near figures pop forward (dad ≈ 1.19, kid ≈ 1.45)
    }
    // ---- THE BOIL: the painting redrawn, and looped (Fred, Aug 2026) ----
    // "maybe you could draw several background frames and just loop it to make it look
    //  animated." This is that, and it is the opposite of the overlay I had been
    //  building: nothing is drawn ON the art. The plate's own depth planes are rendered
    //  N times by the stroke engine, each with every mark displaced a hair — the way a
    //  hand cannot lay a brush down twice in the same place — and the frames are stepped
    //  in a loop. Frame 0 IS the approved painting, so the loop always returns to it.
    //  Built with: BOIL_FRAME=1 BOIL_N=3 node gen/build.mjs <plate>
    // ⚠ TWO FRAMES, CROSS-FADED AND PING-PONGED — Fred's fix, Aug 5: "rather than using
    //   3 frames and you switch from frame 1->2->3, just use 2 frames, but instead of
    //   shifting from 1->2 abruptly, you just use transition effects, making the sequence
    //   1->2->1->2->... this will make the sky move with elegance. we keep the fire as is
    //   because fire is violent."
    //   It is better than the hard cut on both counts. Half the bytes — one extra drawing
    //   per plane instead of two. And the motion becomes a SWELL rather than a flip: the
    //   two drawings are built half a phase apart, so they are the opposite extremes of
    //   every mark's little orbit, and easing between them and back is that whole orbit,
    //   continuously. I had argued a cross-fade would blur two drawings together — true,
    //   and for a painted sky that momentary softening IS the elegance. The fire keeps
    //   its hard-cut sprite rig, because fire is violent.
    // page -> how many drawings exist (1 = no boil). ⚠ 0 and 32 are the two 4K COVERS,
    // left out deliberately: eight big planes doubled on a 3840px page is the exact
    // shape that has crashed iOS before. They want their own decision, not a default.
    // ⚠ EP 1 ONLY. Episodes 2-4 run through this same buildDiorama with overlapping page
    // indices, so without this guard every one of their planes would request a second
    // drawing that was never rendered — harmless (onerror hides it) but a 404 per plane.
    // ---- ⚠ THE PLATE BOIL IS OFF EVERYWHERE EXCEPT THE TWO STORMS ----
    // Fred, after tilting the pilot: "take the boil off everything except the two storms,
    // we work from the beginning." The reason is structural, not taste: a boil sibling is
    // a second copy of the WHOLE painting, offset by a hair, and parallax slides the two
    // against each other every time the phone moves. Every fix this week was a way of
    // hiding that at the moment it showed, and there was always another moment.
    // The garden — the page he loves — was never alive because of its plate breathing.
    // It is alive because of its fire, its trees, its creatures, the light running up its
    // road. Objects that belong to the scene. That is what a page gets from here.
    // The storms keep theirs: on those the whole air is meant to be violent.
    var BOIL = { 8: 2, 22: 2, 23: 2, 24: 2, 25: 2, 26: 2, 27: 2, 28: 2, 29: 2, 30: 2, 31: 2, 15: 2, 16: 6, 17: 6, 18: 6, 19: 6, 20: 6, 21: 6 };   // 29 `candle` · 30 `comes` · 31 `nonight`: the last three pages come alive — see BOIL_PLANES for which ONE plane moves on each and why   // 21 `bread`: the day-sky wheel, six drawings   // 20 `seeds`: the sun-vortex sheet turns, six drawings   // 19 `born`: the meadow, six drawings — the land alive where his light has reached   // 15 `ran` · 16 `gift` · 17 `twoways`: the SKY breathes on six (see BOIL_PLANES — never the plane with the palace in it)   // 15 `ran`: the Father's run cycle · 16 `gift`: the sky breathes on six · 17 `twoways`: sky AND the meadow's trees, six drawings
    // ⚠ EXCEPT A GLIMMER, WHICH IS NOT A BOIL. "make several art work to show the light
    // is glimmering." Twinkle changes only BRIGHTNESS — every mark holds its exact
    // position — so its two drawings cannot slide against each other and it is immune to
    // the tilt doubling by construction. It is the one thing safe to do to a whole plane.
    // ⚠ AND NOT EVEN A GLIMMER ON THE PLATE. Fred: "rather than making the background
    // that glows, why dont you animate the amazing graphic you have made." Right — page
    // 1's graphic is a piercing star, so the STAR moves and the painting stays a
    // painting. Nothing whole-plane at all outside the two storms now.
    // ⚠ THE LIGHT GRAPHIC SHIMMERS THROUGH FOUR COLOURS. This is the only whole-plane
    // effect left outside the storms, and it is safe for the reason twinkle was: the four
    // drawings are the SAME strokes in the SAME places, leaning to different colours.
    // Nothing can slide against anything, so a tilt cannot double it. Only `fg` — the
    // star, halo, spikes and sparks — not the deep behind it.
    // ⚠ SIX drawings, not four, and a long clock: smoothness IS more drawings, and a
    // calm emission is a slow one. 1.15s a step x 6 = a seven-second swell.
    BOIL[1] = 2;                       // two drawings = a breath, not a carousel
    BOIL[2] = 2;                       // flame: the dawn sky, and the great trees bending
    BOIL[3] = 2;                       // made: the deep field, slowest breath in the book
    BOIL[4] = 6;                       // love: the Sower's sky, actually turning
    // ⚠ `lost` breathes, and slowly. Fred: "we can animate the background and the
    // character". The air on a dead plain does not gust — it only stirs — so this is the
    // longest leg in the book after `made`, and it is the ground and sky BEHIND him, so
    // it never competes with the one thing the page is about (him, going round).
    // ⚠ OFF FOR NOW, AND SAID PLAINLY: with the two-drawing breath on, every other frame
    // on this page came up magnified and shifted — the sibling drawing is not taking the
    // plane's geometry here the way it does on 1 and 3, and I have not found why yet. A
    // page that flickers between two framings is worse than a still one, so the breath
    // waits until that is understood. The walk is the page's motion meanwhile.
    // ⚠ AND `road`'s WHEAT BREATHES. The boil is useless on a smooth dark field (see `lost`
    // below) but wheat is the opposite: a whole hillside of small high-contrast marks, where
    // a hair of displacement is visible on every one of them. That is wind over a field, and
    // it costs one extra drawing of one plane.
    // ⚠ SIX DRAWINGS OF A TURNING SKY. Fred: "actually DRAW few scenes and animate it that
    // way." The plate is handed the frame number at build time and draws THAT MOMENT — the
    // eddies further round their orbits, the turbulence advanced, the jewels moved with
    // them — so these are six different pictures of one sky, and the sixth runs back into
    // the first because every orbit is closed. The wheat keeps its own two-drawing breath.
    BOIL[10] = 6;
    // and the same for `bridge`: the dusk over the canyon turns because it is drawn six
    // times turning, not because one sheet is being pushed sideways
    BOIL[11] = 8;   // ⚠ EIGHT, not six: a travelling stream shows its steps at six
    // ⚠ `paid` IS THE SLOWEST PAGE IN THE BOOK. Six drawings, and the longest leg of any
    // page: nothing here sparkles, because it is Golgotha. What moves is the mourning sky
    // turning over heavily, the light draining down the cross, and the drops falling.
    BOIL[12] = 6;
    // ⚠ NO BOIL ON `lost`, and this one is measured, not felt: the sky changed 0.00% between
    // frames with it on. The boil displaces stroke GEOMETRY, and this plate's field is
    // smooth and dark, so neighbouring marks are the same colour and sliding them changes
    // nothing on screen. Its air drifts instead (CLOUD_DRIFT above) and its light breathes
    // (DIO_LIFE). A page gets the motion its paint can actually carry.
    // ⚠ NO BOIL HERE ANY MORE. Fred: "i dont really like this style. lets change it
    // somehow." The breath was the whole page moving very slightly, which on a page
    // about ONE person leaving says nothing and competes with him. The painting holds
    // perfectly still now and he walks — the rig-over-a-still-painting grammar, which
    // is the one Fred blessed on the fire.
    // ⚠ NO BOIL ON FLAME. Fred: "same issue. very lazy. you just make things blink." He is
    // right about what a whole-plane boil looks like on a page like this: a sea and a sky
    // that shimmer in place are not a sea and a sky that MOVE. This page's life is objects
    // now — fish that swim their stretch and turn, trees that sway, birds at the treetops,
    // a sky that drifts — which is the garden's grammar, the one that worked.
    // ⚠ ONE PLANE ONLY, AND IT IS THE DEEP. Fred, Aug 6: "make the background 2 frames
    // rotation now with an alternate art layer." The light is a rig, so the plane that
    // carries the light must stay still — but the DEEP behind it is not the light, it is
    // the face of the waters (Gen 1:2), and that may breathe. Two drawings, cross-faded
    // and ping-ponged: Fred's own design, the calm one, with the original painting kept
    // visible underneath as the bed so the page can never flash empty.
    // ⚠ A PAGE ONLY BREATHES IF BOTH HALVES ARE SET: the plane list here AND a BOIL[idx]
    // above. I set the lists for 2 and 3 but the BOIL lines never landed — two python
    // replaces that matched nothing and said nothing — so both pages have been serving a
    // still painting while I reported a breath. Assert your edits.
    var BOIL_GLIMMER = { 1: ['bg'], 2: ['sky', 'near'], 3: ['bg'], 4: ['sky1'], 7: ['bg'], 10: ['sky1', 'mid'], 11: ['sky1'], 12: ['drops'] };   // 11: the cross is three stacked hands now (TRI), not a carousel   // ⚠ only the DROPS use frames now — the light is three stacked hands (TRI)   // ⚠ NOT the sky: measured, a field that dark cannot show motion (0.06%)   // and the cross itself: light, drawn moving   // 10 = road: the two swirl sheets (six drawn frames) and the wheat   // (5 `turning` gave its breath up: that page's motion is his walk)
    // ⚠ THE COVERS BREATHE ONLY IN THEIR PAINT. The galaxy plate is 31,102 verse-motes
    // at data-true positions — every mote is a real verse in a real place — plus the
    // Word itself. Displacing those, even by a hair, is not a brushstroke wobbling; it
    // is scripture moving. So the nebula sheets and the deep ground boil, and the mote
    // shells (s0..) and the Word (fg) hold perfectly still. It also keeps this page's
    // extra weight down, which matters on the plate with an iOS crash history.
    if (EP === 1) { BOIL[0] = 2; BOIL[32] = 2; SPIN[0] = SPIN[32] = { s0: 180, s1: 180, s2: 180 }; }   // 2°/s, slowed with the paint (Sep 9: "like breathing")   // ONE rigid turn (4°/s): the scarlet thread is baked into s2 and must stay on its verses in s0/s1 — differential rotation would pull it off them (Fred: "why is it not moving with the other stars?")
    // ⚠ THE ONE WALKER IN THE BOOK. Plate coords: the ring he goes round, its period, and
    // how tall he stands. `sec` is deliberately long — a lost child does not jog round a
    // circle, and a slow lap is what makes the sight of him coming round AGAIN land.
    WALK = { 7: { x: 396, y: 366, rx: 96, ry: 30, sec: 26, h: 44 } };
    var BOIL_PLANES = {
                        /* ⭐ THE LAST THREE PAGES. One wind each, and each one taken from what
                           the page is actually about — never "animate the page", always
                           "what, on this page, is alive, and why".
                           ⚠ And never a plane with FIGURES or ARCHITECTURE in it: a boiled
                           figure is two figures, and a boiled building ghosts (the twoways
                           lesson, paid for on Fred's screen). Nor a MEADOW: soft coherent
                           paint may boil, but a field of small marks crawls like TV snow. */
                        29: ['mid'],   // ⚠ candle: the breath-HALO round the passed flame, and only that. `fg` holds the two children AND the flame itself; `bg`/n0-n3 are the night. The halo is the one thing on the page that is light rather than a thing, so it is the one thing that may breathe.
                        30: ['sky'],   // ⚠ comes: the GLORY at the torn rift — `sky` carries the burst and the parting cloud lips, which is the page's whole sentence. Not `mid` (the shaft and the bow are ruled forms and would ghost), never `fg` (the earth, the bough and four children).
                        31: ['sky'],   // ⚠ nonight: the wheel of glory. Never `far` (the City is architecture), never `mid` (the meadow AND the river share it, and a boiled meadow crawls), never `fg`.
                        28: ['bg'],   // ⚠ together: the night, the distant Light and the road. Not `mid` or `fg` — those carry the warm floor pool the pair stand in and the two travellers themselves, and a boiled figure is two figures.
                        26: ['bg', 'fg'],   // ⚠ fg joins so the HEART can glow — it is drawn radiating a little differently in each drawing. ⚠ light's fg BAND AMPLITUDE IS 0 (build.mjs) because this plane carries the NAME: the boil may vary the hand, never the story, so nothing here is displaced — only what the plate itself draws differs.    // ⚠ light: the BACKMOST plane, and only that one. This page declares SEVEN depth planes (bg + five ray sheets + fg) — about 45 MB before anything moves — so the engine's own rule applies with no room to argue: one plane, one extra image per drawing. `bg` is also the right one: it is the broad glory field, the largest area on the page, and it shows through the gaps in every ray sheet stacked over it.
                        27: ['bg', 'fg'],    // ⚠ come: the WALLPAPER and the river. Never `mid` — that plane holds the door.
                     // (the note below is why `mid` is excluded)   // ⚠ come: the RIVER. Never `mid` — that plane holds the DOOR, and the twoways lesson is that a boil doubles anything ruled or built into a ghost of itself. Water is the softest thing on the page and the one the verse is about.
                        25: ['mid'],   // ⚠ prayer: the LIGHT ONLY. `mid` is the wrap, the corona and the thread and nothing else — the room is `bg`, the bed is `far`, the child is `fg`, and all three are painted once. That separation is why the light can be the one moving thing on the page.
                        24: ['bg'],   // ⚠ family: the SKY ONLY. `bg` holds the air AND the meadow, and normally that would rule it out — a boiled field crawls. It is allowed here because family's boil amplitude is 0 (build.mjs BOIL_BAND_PAGE), so the ground is identical between drawings and the only thing that changes is the cloud the plate drew for that frame.
                        15: ['dad', 'sky1'],   // ⚠ ran: the Father's run cycle, and ONE sky sheet drawn twice so the background moves. Without this the default sends the boil to the backmost plane, so the sky ping-ponged and he stood still.
                        // ⚠⚠ twoways: THE SKY ONLY — NEVER `mid`. Two lessons, both paid for
                        // on Fred's screen. First I aimed the boil at sky1 AND mid: 2 planes x
                        // 6 drawings = 12 extra full depth planes, ~77 MB decoded, exactly the
                        // budget the note below was written about. Then, on one plane, `mid`
                        // still ghosted the whole page — Fred: "it becomes blue like this",
                        // with the palace gone and every swirl doubled.
                        // ⚠ THE REASON, MEASURED: the boil displaces every mark, and how that
                        // reads depends entirely on what is drawn there. Between two frames of
                        // this page — palace region (hard straight edges): 47.7% of pixels
                        // changed, mean delta 50. sky1 (soft organic swirls): 5.8%, delta 24.
                        // Soft paint absorbs displacement as a BREATH; architecture cross-fades
                        // into a DOUBLE IMAGE. `mid` holds the palace, so it can never boil.
                        // ⚠ So a plane is only boilable if nothing ruled or built is drawn in
                        // it. That is the test, on any page, before adding one to this table.
                        17: ['sky1'],
                        // ⚠ washed: the `bg` plane, which carries the whole radiating
                        // sunburst. Safe to boil for the same reason twoways' sky is and
                        // its `mid` was not — there is nothing ruled or built drawn in it,
                        // only light. The child lives in `fg` and is never displaced.
                        18: ['bg'],
                        // ⚠ born: `mid` — the land, grove and the light he casts on it. It
                        // passes the test above (nothing ruled or built is drawn there): the
                        // page has no architecture, and the two inscription glyphs were moved
                        // out into `fg` precisely so this plane could boil without doubling
                        // them. The child is a runtime sprite and is never displaced.
                        // ⚠ born: the SKY, and NOT `mid`. `mid` passes the "nothing ruled or
                        // built" test, and I boiled it — the land alive where his light had
                        // reached. Fred: "now it is having a seizure...."
                        // ⚠ THE TEST ABOVE IS NECESSARY BUT NOT SUFFICIENT, and this is the
                        // missing half: what matters is not how MUCH a plane changes but
                        // whether the change is COHERENT. Measured, born's meadow was
                        // comfortably inside the approved band — fine-detail crawl 18.0
                        // against twoways' sky1 at 14.6 — and still unwatchable, because
                        // washed and twoways displace large soft FORMS (a form breathes)
                        // while a meadow is thousands of independent high-contrast blades
                        // (they crawl, and crawl reads as static). Every boil in this book
                        // that works runs on soft paint: sky, cloud, light. A dense
                        // fine-detail plane must not boil however gently it is damped.
                        19: ['sky'],
                        // ⚠ seeds: `sky1` — one of the two transparent sun-vortex swirl
                        // SHEETS, stacked over an opaque sky ground painted in the same
                        // colours. That is exactly twoways' configuration and it is the
                        // safest boil in the book: soft coherent swirls (never fine detail
                        // — see born above), and because the sheet and the plane behind it
                        // look alike, the carousel's coverage dip at each hand-over reveals
                        // nothing, so it does NOT need BOIL_HARD. Copied deliberately
                        // rather than re-derived.
                        20: ['sky1'],
                        // ⚠ bread: `bg`, the opaque day-sky wheel. Soft coherent swirl —
                        // the only kind of paint that may boil (born, above: a plane of fine
                        // high-contrast detail crawls like static however gently it is
                        // damped). Opaque and backmost, so it must CUT, not fade.
                        21: ['bg'],
                        // ⚠⚠ storm HAD NO ENTRY HERE, AND THAT IS WHY ITS TREE NEVER MOVED.
                        // With no entry the rule below (`if (!_allow && di !== 0)`) sends the
                        // boil to the BACKMOST plane only — so every drawing went to `sky`
                        // and `mid`, which holds the bent tree and its canopy, was static at
                        // runtime no matter how many drawings were built for it. Verified in
                        // the live DOM: section 22 had siblings for storm-sky-b1..b6 and none
                        // for mid. (BOIL_PLANE_N[22] lists four planes, which reads as though
                        // four boil — it is ignored for any plane this gate excludes.)
                        // Two planes now, at HALF the ring each: the same six sibling images
                        // that were already being paid for, so the memory this page once died
                        // of is unchanged, while both the sky churns AND the tree bends.
                        22: ['sky', 'mid'],
                        // ⚠ hands: the SKY and the GRASS, and nothing else. `far` carries the
                        // treeline and the distant hills — a hill that breathes reads as the
                        // land itself wobbling — and `fg` is a thin verge mostly behind the
                        // poem, so both stay still. `mid` passes the "nothing ruled or built"
                        // test only because its one built thing, the road, is held still by
                        // the field (BOIL_FIELD_HANDS_GRASS in gen/build.mjs) rather than by
                        // being kept out of the plane.
                        23: ['cloud', 'grass'],
                        /* ⭐ THE COVER (Fred, Sep 8: "i want the scenes to animate without any
                           input"). The three brushwork SHEETS breathe (their second drawing is
                           now a real hair off — BOIL_BAND_PAGE.word in build.mjs, measured ~4 at
                           40px like prayer, not the 2.2 it was) and the mote shells s0–s2 TWINKLE
                           (brightness only, zero displacement — BOIL_BAND s*: 0 — every mote is
                           a verse in its true place). `bg` is out: its two drawings differ by 1%,
                           an invisible breath costing a 6.4 MB plane. ⚠ This key is the one that
                           counts — a duplicate near the top of this literal is silently beaten by
                           this later one, so edit HERE. */
                        0: ['n0', 'n1', 'n2', 's0', 's1', 's2'],
                        32: ['n0', 'n1', 'n2', 's0', 's1', 's2'] };
    var BOIL_SEC = 1.05;   // one leg of the swell; `alternate` doubles it to a ~2.1s breath
    // ⚠ A STORM IS NOT A BREATH. On `string` (8) and `storm` (22) the whole ladder
    // inverts: the sky becomes the FASTEST thing on the page instead of the slowest,
    // because that is what weather looks like from underneath. Fred: "it is a storm, so
    // make the background move faster, string erratic, protagonist getting thrown
    // around."
    // ⚠ born (19): THE SHIMMER AND THE SWELL WANT OPPOSITE THINGS. A boiled surface reads
    // as living paint at roughly a third of a second a drawing — much slower and you see
    // each drawing FLIP — but the light swelling out of the child wants to take seconds.
    // Same conflict as washed's doves, and the same resolution: set the page CLOCK for the
    // shimmer (0.20s a drawing → a 1.2s turn) and let the swell take one whole cycle per
    // turn, so the pulse of light rolls out of him about every two seconds while the
    // meadow underneath it shimmers at the rate paint wants.
    var BOIL_SEC_PAGE = { 19: 0.18, 8: 0.34, 22: 0.40,
      0: 1.50, 32: 1.50,   // the covers: twelve drawings at 1.5s = an 18s loop — Fred, Sep 9: "make the background move slower? like breathing. it is sad that we have worked so hard and they cannot see everything we did" (was 0.55s / 6.6s)
      // ⚠ these pages are NOT storms: the ring turns slowly. The per-band rates below
      // then give the two-drawing planes a much longer leg, so a shorter page clock never
      // turns a calm meadow's breath into a flutter.
      // ⚠ `made` (3) breathes slowest of all — one long 6.4s leg either way. (And the
      // comment goes on its OWN line: an inline // inside a table of literals swallows
      // the rest of the row, which is exactly what it just did to this one.)
      23: 1.15,
      24: 1.30,   // family: an evening at rest — a long, unhurried leg
      25: 0.60,   // prayer: the light pulses at about the rate of quiet breathing
      28: 0.72,   // together: a journey's tempo — unhurried, but going somewhere
      27: 0.58,   // come: the river runs a shade quicker than the glory turns
      29: 0.95,   // candle: a halo round a flame that has just been handed on — the rate of a held breath
      31: 1.10,   // nonight: no more night, and no hurry in it — the longest, calmest leg on the last page of the book
      1: 3.20, 2: 4.20, 3: 6.40, 4: 1.05, 5: 4.60, 7: 5.60, 10: 1.30, 11: 2.30, 12: 3.40, 9: 0.58, 15: 0.34, 26: 0.62, 30: 0.55 };   // ⚠ 26 was already here at 0.55 — set it in place, never add a second key (a duplicate is silently discarded)
    var BOIL_RATE_PAGE = {
      // bread's bg is a sky, not a glory: BOIL_RATE gives `bg` 2.8, which at the default
      // page clock is ~2.9s a drawing — a visible FLIP once the plane is cutting. Set to
      // washed's proven tempo instead (~0.53s a drawing, a ~3.2s turn).
      21: { bg: 0.5 },
      8:  { sky: 1.0, sky1: 0.8, sky2: 0.8, far: 0.75, mid: 0.7, fg: 0.5, birds: 0.42 },
      22: { sky: 1.0, sky1: 0.85, sky2: 0.85, far: 0.8, mid: 0.75, fg: 0.7 },
      // ⚠ the sky's clock is SLOW here — it is a calm page, and one lap of the cloud field
      // per turn is a real distance. 3.0 puts a full drift at ~14s, which reads as unhurried.
      23: { cloud: 2.4, grass: 0.8 },   // the clouds keep their own slower clock
      // family: 1.30 x 1.6 is ~2.1s a drawing, so one turn of the four-drawing ring takes
      // about eight seconds. A cloud bank that takes eight seconds to breathe is a cloud
      // bank; anything quicker is weather, and this page is not weather.
      24: { bg: 1.6 },
      // prayer: 0.60 x 2.0 is ~1.2s a drawing, so one full pulse out of the child takes
      // just under five seconds. Slower and you see each drawing; faster and it flickers.
      25: { mid: 2.0 },
      27: { bg: 2.6, fg: 2.0 },   // come: the land turns slower than the water runs
      28: { bg: 2.2 },   // together: the road runs at a walking pace
      29: { mid: 1.5 },  // candle: 0.95 x 1.5 ≈ 1.4s a drawing — the halo swells and settles, twice a breath
      30: { sky: 0.9 },  // comes: 0.55 x 0.9 ≈ 0.5s a drawing, so the four-drawing ring turns in ~2s. The heavens are being torn: this is the one sky in the book allowed to move like weather.
      31: { sky: 2.0 },  // nonight: 1.10 x 2.0 = 2.2s a drawing, a ~4.4s breath. Anything quicker and eternity looks nervous.
      1:  { bg: 1.0, mid: 1.0, fg: 1.0 },   // ⚠ fg was 3.2 — the star would have run at a third of the rays' speed and the swell would tear in two
      3:  { bg: 1.0, mid: 3.0, fg: 3.2 },
      4:  { sky: 1.0, sky1: 0.9, sky2: 0.9, far: 3.0, mid: 3.2, fg: 3.2 },
      5:  { bg: 1.0, fg: 3.2 },
      7:  { bg: 1.0, fg: 3.2 },
      9:  { bg: 1.0, mid: 3.0, fg: 3.2 },
      // ⚠ washed: LIGHT, so it moves at the speed of light and not of weather. Fred: "can
      // you make this page animate faster since it is light radiating?" BOIL_RATE gives
      // `bg` 2.8 because a bg is usually a sky or a deep — on this page bg IS the glory,
      // and at 2.8 the ring took 1.05 x 2.8 x 6 = 17.6s to turn: 2.94s a drawing, seven
      // times slower than the point where the eye reads motion at all (see the note by
      // BOIL_RATE: 0.42s a frame already reads as a FLIP). 0.26 turns the ring in ~1.6s at
      // ~0.27s a drawing — between that flip threshold and the ~6fps shimmer, which is
      // where radiance belongs.
      18: { bg: 0.52 },   // ⚠ HALF SPEED, and the glory compensates in the plate: it now runs TWO wave cycles per turn, so the light keeps its 1.64s tempo while the doves — one flap per turn — beat every 3.3s. Slowing the birds without slowing the light needs both halves; change one alone and the page speeds up or the birds do.
      // born's sky keeps the default rate (2.2); its tempo is set by BOIL_SEC_PAGE[19].
      // ⚠ ONE FAST THING, EVERYTHING ELSE SLOW. The page clock is set by the RUN (0.34s), so
      // every other plane needs a big multiplier or the whole landscape would strobe with him.
      // the run is the page clock (0.34s); the sky drifts at ~6s — one fast thing, one slow
      // ⚠ sky1 18 -> 5. The page clock is 0.34s (the Father's run), so 18 meant a step every
      // 6.1 SECONDS and 18s for a full turn — slow enough that nobody would ever catch it
      // moving. At 5 the sky steps every ~1.7s and wheels round in ~5s: calm, and visible.
      // ⚠ THE SLOT IS `BOIL_SEC * rate`, NOT `page period * rate` — 1.05 * 5 = 5.25s, so each
      // sky sat still for over five seconds before swapping. THAT is the slideshow. At 1.5 a
      // drawing holds ~1.6s and the ring rounds in ~4.7s, with the wheel turning throughout.
      // ⚠ THE SKY BREATHES AT ~4 BPM. Fred set the ceiling: "if the sky has a BPM it would be
      // like 5 BPM tops... although the real value would be like 0.3 bpm because god works
      // exponentially." Round = BOIL_SEC(1.05) * rate * drawings(3), so rate 4.76 -> a 15.0s
      // turn = 4 breaths a minute. A continuous dissolve can afford this: there is no dead
      // moment to hide, so the slower it goes the more it reads as weather rather than a loop.
      // round = 1.05 * rate * 6 drawings; rate 2.38 keeps the same 15.0s breath (4 BPM)
      15: { dad: 1, sky1: 2.38, land: 14, sky: 20, sky2: 18, hills: 22, city: 22, birds: 5 },
      // gift: round = 1.05 * 2.38 * 6 = 15.0s = 4 BPM, the same breath as `ran`
      16: { sky: 2.38 },
      2: { sky: 1.0, near: 1.6 },   // the sky breathes at the page clock; the trees lean slower still
      // ⚠ 26 ALREADY LIVED HERE. I added a second `26:` up beside 24 and 25 and it was
      // silently discarded — a duplicate key in an object literal is not an error, the last
      // one just wins, so the rate I thought I had set was never read. The glory's rate goes
      // in the entry that already exists.
      26: { bg: 2.0, n: 3.0, fg: 1.5 },   // the heart breathes quicker than the wallpaper turns   // bg 2.0: ~1.25s a drawing, five seconds to carry a mark a ninth of the way out
      30: { sky: 1.0, mid: 1.0, fg: 3.2 },
    };
    // A HARD CUT where the motion should be violent rather than elegant — the same
    // reason the fire never got a cross-fade. On `string` that is the fg plane: the
    // hand, the string and the child adrift on the end of it. It SNAPS between two
    // drawings instead of easing, which is what "erratic" means.
    // A YANK IS A SNAP, NOT A DISSOLVE. Anything the wind HAULS gets the hard cut; the
    // sky, which streams, keeps its cross-fade.
    // ⚠ THE RUN CUTS, IT DOES NOT EASE. Cross-fading two strides gives a four-legged ghost;
    // a hard cut at ~3 a second is what the eye reads as running. Same reason the fire never
    // got a cross-fade.
    // ⚠ AN OPAQUE PLANE IN A RING MUST CUT, NEVER FADE. Fred, on washed: "the glow is
    // still there, it flickers to dark." It was not a glow at all — the glow entry was
    // already gone. It was the ring itself.
    // The carousel keyframe ramps a drawing's opacity 1→0 over ~1/N of the cycle, and the
    // ring is built to overlap (6 x 19.67% = 118% coverage) so there is always something
    // showing. But coverage in TIME is not coverage in ALPHA: during each hand-over two
    // drawings sit at partial opacity, and stacked partial alphas do not sum to 1 — two at
    // 0.5 cover 75%, not 100%. On a transparent sheet the missing quarter reveals the
    // plane beneath and nobody sees it. On the BACKMOST OPAQUE plane it reveals the page
    // itself, and the picture flickers dark once per drawing.
    // step-end holds each drawing at full opacity for its whole slice and then cuts, so
    // the alpha is never partial. It is also what the boil is supposed to look like — the
    // note on the keyframe says so: "a hard cut, not a cross-fade: a dissolve would
    // average two drawings into a blur and lose the very thing that makes it read as
    // hand-drawn."
    var BOIL_HARD = { 8: ['birds'], 22: ['mid'], 15: ['dad'], 18: ['bg'], 19: ['sky'], 21: ['bg'] };
    // ⚠ 19 `born` — AND THIS REFINES THE RULE ABOVE. That note says the missing quarter is
    // invisible on a TRANSPARENT sheet because it only reveals the plane beneath. True when
    // the sheet and the plane beneath look alike (twoways' sky1 over its sky). born's `mid`
    // is the green LAND and the plane beneath it is the blue SKY — so every hand-over showed
    // a quarter of the sky straight through the meadow and Fred got the same blink twoways
    // once had. A transparent plane needs to CUT too whenever its content differs strongly
    // from whatever sits behind it; "transparent" was never the test, CONTRAST is.   // the flock and the bent tree SNAP; washed's bg is opaque, so it must
    // ⚠ MORE DRAWINGS WHERE THERE IS SOMEWHERE TO GO. Two drawings can only give you
    // there-and-back, which is a shimmer; a cyclone needs a sequence. The sky sheets on
    // the two storm pages run SIX and cross-fade through them in order, so the wave
    // sweeps around the eye. Everything else stays at two — extra drawings are bytes,
    // and only the air is turning.
    // which sheets drift, how far (px) and how slowly (s): two layers of cloud crossing
    // at different heights, in opposite directions.
    // ⚠ `lost` drifts its whole sky. On a smooth dark plain the boil is invisible (measured:
    // even a 55px flow at 6x band moved 4% of the pixels), so the air is moved the only way
    // that cannot be swallowed by low contrast — the sheet itself travels. Long and slow:
    // 30px over 150 seconds, which is a plain's worth of weather, not a breeze.
    // which planes are stacked hands of one thing: [which hand, seconds per full cycle]
    var TRI = { 11: { crossA: [0, 3.9], crossB: [1, 3.9], crossC: [2, 3.9] },   // bridge: the way's light
                // 13 `grave`: the three hands are baked into ONE plane now (memory), and that
                // plane breathes via DIO_LIFE instead of cycling three cels.
                12: { pourA: [0, 3.6], pourB: [1, 3.6], pourC: [2, 3.6],
                      // ⚠ AND THE DARK ITSELF SHIMMERS. Measured earlier, this sky cannot show
                      // motion by MOVING — 0.06% of it changed when I travelled its whole
                      // turbulence field, because it is too dark and too narrow in value. But the
                      // three-hand rig does not move anything: it redistributes weight between
                      // drawings, and coverage is something even a dark field can show. Two extra
                      // hands over the still opaque bed, half a turn apart, on the slowest cycle
                      // on the page — the darkness stirs without ever lightening.
                      bgB: [0, 7.2], bgC: [1.5, 7.2] } };
    // ⚠⚠ AND hands' CLOUD PLANE MUST NOT BE ONE OF THESE. Fred, with a screenshot of a hard
    // vertical seam at the left of the sky: "when the cloud move, the one that starts from
    // the edge is cut." That is not a drawing fault, it is what CLOUD_DRIFT physically is —
    // it TRANSLATES the plane's image, and a plane exactly as wide as the frame uncovers its
    // own boundary the moment it moves. The strip it uncovers has no clouds in it, so a
    // straight edge walks across the sky. A drift is only safe on a plane whose content runs
    // past the frame (a wide sky sheet), never on one painted to the plate's own width.
    //   hands' clouds move by being DRAWN in different places instead — small steps, so the
    // dissolve between them reads as travel rather than as a fade (see the plate).
    var CLOUD_DRIFT = { 2: { sky1: [34, 96], sky2: [-26, 132] },
                        7: { air: [66, 46, 'linear'] },
                        // ⚠ looking: WIGGLE, NOT TRAVEL. Fred, later: "redraw the cloud to be
                        // static and just wiggle it slowly instead of going left and right" — right;
                        // 96px and 128px of constant-speed linear sweep reads as the whole sky sheet
                        // physically SLIDING, not as weather breathing. Amplitude down to something
                        // that never leaves the frame's own texture (a wiggle, not a pan), and back
                        // to ease-in-out — which lingers at both ends of a SHORT throw instead of
                        // sweeping through it, so it reads as a slow breath, not a mechanical slide.
                        // The veil still moves a touch more than the air behind it (the same "what
                        // passes in front of the light" idea below), just at wiggle scale now.
                        9: { air: [7, 46], veil: [10, 33] },
                        // ⚠ `road` is ALIVE WITHOUT BEING REDRAWN. Fred: "i like the one before by
                        // far... i just wanted you to make the scene alive." Fair, and the lesson is
                        // mine: he asked for life and I rebuilt the picture. The painting is back
                        // exactly as it was; what moves is the sky it was already painted with —
                        // this page ships two independent swirl SHEETS as their own planes, so they
                        // can simply travel, at different speeds and opposite ways, and the sky
                        // turns over the hills.
                        // ⚠ `road` NO LONGER DRIFTS. Its sky is six drawn frames now (see
                        // BOIL_PLANE_N below) — a turning sky, not a picture slid sideways.

                        // ⚠ `bridge` NO LONGER DRIFTS EITHER — its dusk is six drawn frames now.
                        };    // the cloud travels; the night behind it does not.
    // ⚠ 74s, not 130: at the longer period the streaks moved ~3 screen px a second, which
    // measures as motion and reads as nothing. Slow enough to be weather, fast enough that
    // a reader who stops on this page sees it happen.
    var BOIL_PLANE_N = {
      /* ⭐ THE COVER, STOP MOTION (Fred, Sep 8: "make it seem like the spiral is actually
         spiraling... like a stop motion video"). The three brushwork sheets are EIGHT drawings
         of the paint flowing inward along the golden spiral (see word.mjs). Eight hard cuts
         first; then Fred: "make it very smooth, you dont need to make it that fast" — so
         TWELVE drawings, cross-faded linearly (BOIL_XFADE + BOIL_LINEAR), 0.55s each. The mote
         shells keep their two-drawing twinkle (BOIL[0] = 2) and TURN at runtime (SPIN — "animate
         the dots (verses) as well!"). 32 is the same plate, so the same ring. */
      0:  { n0: 12, n1: 12, n2: 12 },
      32: { n0: 12, n1: 12, n2: 12 },
      // ⚠ SIX for light now that the whole wallpaper is one plane (it used to declare seven
      // planes and could only afford to animate one of them — see the note in light.mjs).
      // come cycles BOTH its wallpaper and its river: the land is what Fred means by the
      // wallpaper, and it was the one thing on that page that never changed.
      // ⚠⚠ BOTH PLANES OF A PAGE MUST TAKE THE SAME NUMBER OF DRAWINGS. One build pass writes
      // every plane for one frame, and it is handed a single BOIL_N — so asking bg for six and
      // fg for four means fg's frames were rendered on a SIX-step clock and then played on a
      // four-step ring: its wave never closed, and the heart's corona changed 25%, 25%, 9%,
      // 11% between pairs instead of evenly. Same count, or the ring limps.
      26: { bg: 6, fg: 6 }, 27: { bg: 4, fg: 4 }, 28: { bg: 4 },
      /* ⚠ THE COUNT IS THE WEATHER, and it is also the memory budget (a boiled plane costs
         ~6.4 MB DECODED however small its file, and the hold window is ~132 MB across the
         pages held at once — these three are neighbours, so they are budgeted together).
         `comes` is the one page in the book where the sky genuinely CHURNS — the heavens are
         torn open — so it gets a real ring. `nonight` is eternal peace and `candle` is a
         quiet room, and both get the two-drawing cross-fade Fred designed and called elegant:
         on a slow clock that is a breath, and it is only on a fast clock that two drawings
         read as a twitch. Held together: ~121 MB. */
      29: { mid: 2 }, 30: { sky: 4 }, 31: { sky: 2 },
      25: { mid: 4 },   // prayer: four drawings of the light — Fred's a, b, c, d
      // ⚠ FOUR, NOT SIX. Six drawings of a full-size OPAQUE plane is ~38 MB decoded, and
      // page 23 next door is already carrying twelve boiled planes — held together they
      // would eat most of the 132 MB window (see the note on the hold budget). Four is
      // enough for a bank of cloud to breathe.
      24: { bg: 4 },
      // ⚠ ONE SHEET, NOT TWO. Boiling both cost 12 extra full planes (110 MB on `love`,
      // 128 on `road`, 152 on `bridge` — the last two over the ceiling and exactly where
      // Fred's phone died). A second boiling sheet doubles the memory to say the same
      // thing twice: the eye reads ONE moving sheet over a still one as a living sky just
      // as well, and with the linear cross-fade below it reads better.
      4:  { sky1: 6 },                            // love: the front swirl sheet turns
      10: { sky1: 6, mid: 2 },                    // road: the front sky sheet turns; the wheat breathes
      11: { sky1: 6 },                            // bridge: the dusk on one sheet at six (was two at eight = 152 MB)
      12: { drops: 6 },                           // paid: only the falling drops need frames
      // ⚠ ran: THREE drawings of the sky, and each one turns the whole wheel ~6°. Two was not
      // enough — a ping-pong between two states reads as a twitch; a ring of three reads as a
      // turn. The Father keeps his own two-drawing run cycle (BOIL[15]) at the page clock.
      15: { sky1: 6 },   // ⚠ six, not three — see ran.mjs: a 5s dissolve reads as a blend, a 2.5s one reads as movement
      16: { sky: 6 },    // gift: the opaque sky itself breathes (it is the backmost plane)
      8:  { sky: 6, sky1: 6, sky2: 6, birds: 6, mid: 6 },   // mid = the lashed grass; fg (the grip) and far stay calm at two
      // ⚠ FOUR, NOT THREE — a fielded plane needs an EVEN ring. Under a BOIL_FIELD the
      // displacement is dx = cos(2π·F/N), and at N=3 that gives cos(120°) = cos(240°) =
      // -0.5: drawings 1 and 2 land in the SAME place and 3 jumps, so a "three position"
      // swing is really two and a hitch. N=4 gives 0, -1, 0, +1 — centre, full left,
      // centre, full right: a real there-and-back through the middle.
      22: { sky: 4, mid: 4 },
      23: { cloud: 6, grass: 6 },   // ⚠ SIX — Fred: "use like 5 frames or something"; six keeps the even ring and puts each cloud step at ~32 units
      // the streaming skies and the light-breaks. Only the band that STREAMS (or must be
      // lit by the break) runs the full ring; everything else keeps its two-drawing breath.
      // ⚠ 1, 3, 26 and 30 are NOT here on purpose: their sky IS the light of the page,
      // and streaming a light source reads as flashing. They keep the two-drawing breath.
      // ⚠ NOTHING ELSE RINGS. Rings and flow are for weather; a calm page breathes with
      // two drawings, which is the effect Fred designed and liked. Five pages tried a
      // ring and all five read as flicker.

    };
    // ⚠ AND ITS PARTNER MUST STILL BE THE OPPOSITE EXTREME. A ping-pong works because
    // its two drawings are half a phase apart. On a page rendered in sixths, `-b1` is
    // only a sixth of the way round — pairing with it would shrink every 2-frame plane's
    // swing to a third of what it should be, and the whip on `string` would go limp.
    // Half of six is three, so on these pages a 2-frame plane partners with `-b3`.
    // pages whose ring should BLEND rather than hand over, one drawing read through the
    // next (see dioBoilX). Weather keeps the crisp carousel; light gets the dissolve.
    // ⚠ ROLLED OUT: every drawn SKY now blends continuously instead of swapping. Fred:
    // "do the same for other pages." These pages already had the drawings; they were
    // handing over hard, which is the slideshow. The blend costs nothing.
    // ⚠ hands: BLEND, NOT A CAROUSEL. Fred: "the grass animation is not that good... it
    // looks like its blinking." He is describing the carousel exactly: dioBoilN holds a
    // drawing for its slice and then SNAPS to the next, which is right for a cyclone (each
    // drawing lands as its own mark) and wrong for a breeze. On thin, sparse, high-contrast
    // blades a snap between two positions is not a sway — it is a blink.
    //   The blend was impossible before the plane split: fading the grass used to reveal
    // the SKY between the two positions and the whole field went pale. Now the grass sits
    // over solid ground in `mid`, so the crossover reads as two positions of the blades
    // seen through each other — motion blur, which is what a swaying blade actually looks
    // like — and the ~0.75 coverage dip lands on the ground, not on the sky.
    // ⚠ hands is NOT in the xfade list. With the wind DRAWN into the marks there is real
    // movement between drawings, so the carousel hands over on actual motion; the triangle
    // blend would add its ~0.75 coverage dip on top, and on a sparse transparent grass plane
    // that dip is visible as the whole layer pulsing — which is what "blinking and not
    // moving" was the second time.
    // ⚠ PER PLANE, not per page: `bg` is an OPAQUE sky and two of those stacked would
    // simply hide one behind the other — pairs only mean something on a plane you can see
    // through. The sky keeps the ordinary carousel (and its BOIL_HARD cut).
    // ⚠ AND THE SKY IS ON IT TOO, WHICH A CROSS-FADE COULD NEVER BE. The rule above
    // ("AN OPAQUE PLANE IN A RING MUST CUT, NEVER FADE") is about partial alpha: two
    // drawings at 0.5 cover 75%, and on the backmost opaque plane that missing quarter is
    // the dark page showing through. The paired ring never has that problem — one drawing
    // is HOLDING at exactly 1.0 at every instant (checked across the whole cycle: the
    // lowest maximum opacity anywhere is 1.000), so the plane is always completely covered.
    // It gets a soft handover instead of a flip, without ever going transparent.
    var BOIL_PAIR = { 23: ['grass', 'cloud'],
      /* ⚠⚠ comes' `sky` IS THE BACKMOST OPAQUE PLANE ON A FOUR-DRAWING RING, which is exactly
         the case the note above is about — and I walked straight into it. Measured: with the
         ring on, the page lost 18 points of mean luminance and the blaze at the rift went
         grey; with it off, 115.8, the same as before. `nonight` next door, on TWO drawings,
         measured 140.9 against 140.5 — untouched. That is the whole tell: the pair path keeps
         one drawing HOLDING at 1.0 at every instant, so the plane is never partly transparent,
         while the plain ring's two-at-0.5 leaves a quarter of the dark page showing through.
         The law was already written down here; I had to darken the last page of the book to
         read it. A glory should hand over softly rather than cut, so: pairs, not BOIL_HARD. */
      30: ['sky'],
      26: ['bg', 'fg'], 27: ['bg', 'fg'], 28: ['bg'],   // the same ring as 24 and 25 — two drawings up, one always holding

      // ⚠ prayer, in Fred's own words: "animate it a&b, b&c, c&d, d&a so it looks like a
      // radiating light". That IS the paired ring — two drawings up at all times, one of
      // them always holding at full. On a transparent plane of light over a dark room it is
      // also the only safe option: a plain cross-fade would catch the corona mid-dissolve
      // and read as a flicker, and a hard cut between pulses would read as a strobe.
      25: ['mid'],
      // ⚠ family's sky is PAIRED, not cut. A hard cut between drawings 2.9s apart reads as a
      // visible FLIP (the lesson `bread`'s bg taught), and a plain cross-fade on an opaque
      // plane was what went pale on hands. The paired ring is Fred's own design and answers
      // both: two drawings up at all times, total coverage exactly 2.00, one of them always
      // HOLDING at full — so an evening sky changes without ever being caught mid-dissolve.
      24: ['bg'] };
    var BOIL_XFADE = { 4: 1, 10: 1, 11: 1, 15: 1, 16: 1, 0: 1, 32: 1 };   // 0/32: the covers' stop-motion sheets dissolve between drawings (Fred: "very smooth")
    // ⚠ and blends at a CONSTANT RATE — no eased ends, so there is no moment that reads as a
    // hold. Only for slow, breathing fields; a light wants the eased swell instead.
    var BOIL_LINEAR = { 4: 1, 10: 1, 11: 1, 15: 1, 16: 1, 0: 1, 32: 1 };   // constant rate — no eased ends, no hold
    // which sheet travels, how far (as a share of the frame), and how long one circuit takes.
    // ⚠ ONLY transparent sheets — an opaque base would drag its own edge into view.
    // WIPE pages, and the point their light comes from (as a % of the plane box, which is
    // where a CSS mask is measured — the plate's source at 250,150 of 800x500 sits here).
    var BOIL_WIPE = {};
    // which plane turns, how far per drawing, and about what point (in plane %) — the
    // painting's own centre of rotation, not the middle of the frame.
    // ⚠ the degrees MUST equal the rotation baked between consecutive drawings in the plate
    // (ran.mjs: TURN = __FRAME * 0.19 rad = 10.9°), or the wheel jumps at every handover.
    // ⚠ the smooth in-between is BOIL_XFADE, not a transform. A symmetric triangle: every
    // drawing rises across one slice and falls across the next, so TWO are always on screen
    // and the marks are read THROUGH each other. There is no handover to jump at.
    var BOIL_XFADE_ON = { 15: 1 };   // ran: the sky dissolves rather than swaps
    // ⚠ A PAGE HERE ASKS FOR DRAWING **3**, NOT 1 — and a stale b3 is the ugliest bug in
    // this engine. `lost` came up flickering between its new painting and a five-day-old
    // one: I had rebuilt the plate and built `lost-bg-b1`, but this table sends page 7 to
    // `lost-bg-b3`, which was still the OLD picture. It does not look like a stale asset,
    // it looks like the geometry is broken — the two paintings had different compositions,
    // so half the frames came up "magnified and shifted" and I went hunting the camera.
    // ⚠ REBUILD THE FRAME THIS TABLE NAMES: `BOIL_FRAME=3 node gen/build.mjs <plate>` for
    // every page listed here, EVERY time its plate is repainted.
    var BOIL_PING_SRC = { 8: 3, 22: 3, 1: 3, 3: 3, 4: 3, 5: 3, 7: 3, 9: 3, 15: 3, 26: 3, 30: 3 };
    // AND EACH PLANE KEEPS ITS OWN TIME. Traditional animation shoots backgrounds on
    // fours and foreground on twos; the same idea gives the picture depth in the time
    // axis as well as the space one. The planes need not agree — each is its own set of
    // drawings — and the sky drifting at half the foreground's rate is most of what
    // makes it read as distance rather than as one flat surface wobbling.
    var BOIL_RATE = { sky: 2.2, sky1: 2.0, sky2: 2.0, far: 1.45, hills: 1.45,
                      mid: 1, land: 1, ground: 1, near: 0.9, front: 0.85, fg: 0.85,
                      // the cover: a star twinkles quicker than a nebula turns, and the
                      // three shells run at slightly different rates so the field never
                      // pulses as one sheet
                      s0: 0.5, s1: 0.62, s2: 0.74, n0: 2.4, n1: 2.1, n2: 1.9, bg: 2.8 };            // ~6fps. At 0.42s a frame you see it FLIP; at 12fps it
                                    // strobes. Six is where a painted surface shimmers.

    // ⚠ ?diag=1 — a readout on the glass, because a phone has no console. It reports how
    // many depth planes each page actually built and the first error thrown while
    // building, which is the only way to tell "the diorama is live" from "you have been
    // looking at the flat composite this whole time".
    var DIAG = /[?&]diag=1/.test(location.search);
    function diag(msg) {
      if (!DIAG) return;
      var d = document.getElementById('sc-diag');
      if (!d) {
        d = document.createElement('div'); d.id = 'sc-diag';
        d.style.cssText = 'position:fixed;left:6px;top:60px;z-index:99999;max-width:92vw;'
          + 'background:rgba(0,0,0,0.8);color:#8f8;font:11px monospace;padding:6px 8px;white-space:pre-wrap';
        document.body.appendChild(d);
      }
      d.textContent += msg + '\n';
    }
    function buildDiorama(page, idx, layer) {
      try { return buildDioramaInner(page, idx, layer); }
      catch (e) { diag('page ' + idx + ' DIORAMA THREW: ' + (e && e.message)); throw e; }
    }
    function buildDioramaInner(page, idx, layer) {
      var defs = dioPlanes(page), base = DIO[idx];
      if (!defs || !defs.length || !base) return null;
      var skip = DIO_SKIP[idx] || [];
      defs = defs.filter(function (d) { return skip.indexOf(d.name) === -1; });   // drop planes drawn by a runtime actor
      var dio = document.createElement('div');
      dio.className = 'sc-dio';
      dio.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';
      var planes = [], dioF = null, breathe = null, breatheRate = 1;   // breathe = the light plane that gets a pulsing copy
      var boilQ = [];   // this build's boil drawings, src held back until the page is the one being read (see loadBoil)
      defs.forEach(function (d, di) {
        var im = document.createElement('img');   // .page img CSS makes it absolute/cover/filtered
        im.decoding = 'async';
        // The transparent planes ship as WEBP — same pixels, ~57% fewer bytes than PNG.
        // (The cover alone was 4.7 MB of PNG, which is most of a cold first load.)
        // If a browser can't decode webp we fall back to the .png that still ships
        // beside it, and only if THAT fails does the plane quietly vanish.
        var ext = (di === 0 ? '.jpg' : planeExt(base, d.name));
        // PLATE VERSION. Planes are fetched by bare filename, so a REBUILT plate could
        // never invalidate its own cache — the art changed, the URL did not, and a
        // returning reader kept the old picture forever (and so did the simulator,
        // which is how this was found). Bump PV whenever a plate is rebuilt.
        im.src = '/plates-vg/' + base + '-' + d.name + ext + PV;
        im.onerror = function () {
          if (im.src.indexOf('.avif') !== -1) { im.src = im.src.replace('.avif', '.webp'); return; }   // AVIF refused → the webp
          if (di !== 0 && im.src.indexOf('.webp') !== -1) {        // one retry, as PNG
            im.src = '/plates-vg/' + base + '-' + d.name + '.png' + PV;
            return;
          }
          im.style.display = 'none';   // a missing plane just vanishes — the opaque base + present planes still render
        };
        var life = DIO_LIFE[idx] || {};
        // A LIGHT SOURCE breathes: stack an identical copy of the plane above it and
        // pulse the COPY's opacity. The plane underneath stays put, so the radiance
        // swells and settles without the compositor re-filtering a full-screen layer
        // every frame. Same picture, and the main thread never hears about it.
        if (!REDUCED && (life.light || []).indexOf(d.name) !== -1) { breathe = im; breatheRate = dioRate(d.depth); }
        if (!REDUCED && (life.drift || []).indexOf(d.name) !== -1) im.className = 'dio-birds';   // drifts (the flock wheels on the wind)
        var _orb = (ORBIT[idx] || {})[d.name];
        var _orbHost = null;
        if (_orb && !REDUCED) {
          // one wrapper for this plane; the base drawing and every sibling ride it together,
          // so they travel as one sheet and only their opacities differ
          _orbHost = document.createElement('div');
          _orbHost.className = 'dio-orbit dioOrbit' + idx + d.name.replace(/[^a-z0-9]/gi, '');
          _orbHost.style.animationDuration = _orb[2] + 's';
        }
        var _spin = (SPIN[idx] || {})[d.name];
        if (_spin && !_orbHost && !REDUCED) {
          _orbHost = document.createElement('div');   // the base drawing and its twinkle sibling turn together
          _orbHost.className = 'dio-spin';
        }
        if (d.name.indexOf('front') === 0) {   // a FRONT plane renders ABOVE the sprite layer — e.g. light rays that pass in front of the figure
          if (!dioF) { dioF = document.createElement('div'); dioF.className = 'sc-dio sc-dio-front'; dioF.style.cssText = dio.style.cssText; }
          (_orbHost || dioF).appendChild(im);
          if (_orbHost) dioF.appendChild(_orbHost);
        } else {
          (_orbHost || dio).appendChild(im);
          if (_orbHost) dio.appendChild(_orbHost);
        }
        if (_spin && _orbHost && _orbHost.className === 'dio-spin' && _orbHost.animate) {
          spinFit(_orbHost, dio);
          if (window.ResizeObserver) (function (h, b) { new ResizeObserver(function () { spinFit(h, b); }).observe(b); })(_orbHost, dio);
          var _sa = _orbHost.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: _spin * 1000, iterations: Infinity, easing: 'linear' });
          try { _sa.startTime = 0; } catch (e) { }   // phase-locked to the document clock, so the live sparkle overlay (index.html) turns with it
        }
        // ⚠ SCROLL-DRIVEN DEPTH (Fred: "can we do some video scrolling animation... instead
        // of just like a slide show?"). Yes — and this book is already built for it: every
        // page is a stack of depth planes, so a swipe can move them at DIFFERENT rates and
        // the turn becomes a camera travelling through the scene rather than one flat card
        // sliding off another. Each plane carries its own factor here; the scroll handler
        // sets one variable per page and the compositor does the rest.
        // ⚠ It rides the `translate` property, never `transform` — camApply owns transform
        // for the tilt, and an animation or write on the same property would kill it.
        im.style.setProperty('--pk', (0.10 + d.depth * 0.9).toFixed(3));
        planes.push({ img: im, rate: dioRate(d.depth), depth: d.depth, name: d.name });

        // ---- the other drawings of this same plane ----
        // Each extra frame is a sibling image stacked exactly on top, and CSS shows
        // exactly one of them at a time. They join `planes` so the parallax moves every
        // frame identically — a frame that lagged the pan would tear the picture.
        // ⚠ NOT ON A PLANE THAT ALREADY MOVES. A `drift` plane (the wheeling flock) and a
        // `light` plane (the breathing radiance) each run their own animation, and the
        // boil sets animation-name on the same element — so the sibling drawing would
        // lose that motion and sit still while its twin drifted away from it, showing
        // the flock twice. Those planes are already alive; they do not need a boil.
        var _lively = (life.drift || []).indexOf(d.name) !== -1 || (life.light || []).indexOf(d.name) !== -1;
        var _allow = BOIL_GLIMMER[idx] || BOIL_PLANES[idx];
        if (_allow && _allow.indexOf(d.name) === -1) _lively = true;   // not this plane
        // ---- ⚠ ONE PLANE PER PAGE, AND THIS IS WHY THE PHONE KEPT DYING ----
        // A boil sibling is not a little sprite sheet — it is ANOTHER FULL DEPTH PLANE,
        // 1600x1000, 6.4 MB decoded. Boiling every plane DOUBLED each page (38 -> 77 MB)
        // and the storm's six-drawing rings on four planes came to 160 MB. My page budget
        // never saw any of it: it only counted the sheets I build in canvas.
        // So the boil now lives on the BACKMOST plane only — the largest area on screen,
        // the one whose breathing reads as "the scene is alive" — and rings cap at three.
        // One plane, one extra image: 38 -> 45 MB, which is where this page was healthy.
        if (!_allow && di !== 0) _lively = true;
        // a plane named in TRI[idx] is one of a stacked set: same picture, different hand,
        // each carrying the cycle a third of a turn later than the last
        var _tri = (TRI[idx] || {})[d.name];
        if (_tri && !REDUCED) {
          im.classList.add('dio-tri');
          im.style.setProperty('--ts', (_tri[1] || 3.6) + 's');
          im.style.animationDelay = (-(_tri[0] / 3) * (_tri[1] || 3.6)).toFixed(2) + 's';
        }
        var _cl = (CLOUD_DRIFT[idx] || {})[d.name];
        if (_cl) {
          im.classList.add('dio-cloud');
          im.style.setProperty('--cd', _cl[0] + 'px');
          // ⚠ a third entry overrides the easing. The default ease-in-out is right for a
          // sky that SWELLS, but a drifting cloud that eases hangs almost still at both
          // ends of its travel — measured on `lost`: 0.02% of the sky changing across six
          // whole seconds. Weather moves at one speed. `linear` is that speed.
          if (_cl[2]) im.style.animationTimingFunction = _cl[2];
          im.style.setProperty('--cs', _cl[1] + 's');
        }
        var _pn = (BOIL_PLANE_N[idx] || {})[d.name];
        // rings go back to their full length now that each drawing costs a quarter:
        // six half-res drawings are 9.6 MB against three full-res ones at 19.2.
        var NB = _lively ? 1 : (_pn || BOIL[idx] || 1);
        /* ⚠ THE PHONE'S CEILING (Fred, Sep 16: "when i swipe to last page, it crashed"). The covers
           carry twelve half-res drawings per brushwork sheet (36 planes) plus the mote shells'
           two-drawing twinkle: ~128 MB decoded with the eight base planes — and on the swipe in
           from nonight the outgoing page is still on screen. On a phone the sheets run every
           OTHER drawing (six of the twelve, each held twice as long, so the loop keeps its pace)
           and the shells keep their painted twinkle still. ~80 MB, under the ceiling. */
        var STRIDE = 1;
        if (PHONE && (idx === 0 || idx === 32)) { if (NB >= 12) STRIDE = 2; else if (NB === 2) NB = 1; }
        var NBe = NB / STRIDE;
        if (DIAG) diag('boil p' + idx + ' ' + d.name + ' di' + di + ' allow=' + (_allow ? _allow.join('|') : '-') + ' lively=' + _lively + ' NB=' + NB);
        // ⚠ THE ORIGINAL PAINTING IS NOT A MEMBER OF THE CYCLE. Every drawing in the
        // boil is displaced; frame 0 alone is not, so on a 2-frame ping-pong it reads
        // fine as rest -> thrown, but in a CAROUSEL it is a point off the circle and the
        // rota hitches once per turn. So a carousel runs drawings 1..N — a true closed
        // ring — and the undisplaced base is hidden under them.
        var RING = NBe > 2;
        for (var _k = 0, bf = 1; _k < (RING ? NBe : NBe - 1); _k++, bf = 1 + _k * STRIDE) {
          var bi = document.createElement('img');
          bi.decoding = 'async';
          // ⚠ NEVER BLOCK FIRST PAINT WITH IT. The second drawing is invisible until the
          // dissolve begins, so fetching it alongside the painting would spend cold-load
          // budget on something nobody can see yet. The picture arrives first; the
          // breath starts a moment later, and no reader can tell.
          var _bfSrc = (NB === 2 && BOIL_PING_SRC[idx]) ? BOIL_PING_SRC[idx] : bf;
          // ⚠ AND NOT FOR A PAGE NOBODY IS ON (Oct 8, measured on an emulated iPhone). This used to
          // be `setTimeout(src, 700)` at BUILD time — and the look-ahead builds the next one or two
          // pages, so every swipe also downloaded the boil drawings of pages the reader had not
          // reached (32 MB of the 95 MB read went to pages not yet on screen, 9 MB of it boil). A
          // drawing is invisible until its dissolve begins, so it is the one thing a page can
          // safely be built without. The URL waits here; loadBoil() sets it once this page is
          // the CURRENT one and its planes have landed, at low priority. The painting you swipe
          // to is complete (base + every plane); only its breathing starts a moment later.
          bi.__boilSrc = '/plates-vg/' + base + '-' + d.name + '-b' + _bfSrc + ext + PV;
          boilQ.push(bi);
          (function (el, di2, nm, f) {
            el.onerror = function () {
              if (!el.getAttribute('src')) return;   // a held-back drawing (or one emptied by settle's free) is not a failure
              if (el.src.indexOf('.avif') !== -1) { el.src = el.src.replace('.avif', '.webp'); return; }   // AVIF refused → the webp
              if (di2 !== 0 && el.src.indexOf('.webp') !== -1) { el.src = '/plates-vg/' + base + '-' + nm + '-b' + f + '.png' + PV; return; }
              el.style.display = 'none';   // a missing frame drops out of the loop...
              im.style.opacity = '';       // ...and the base comes back, so the plane can never go blank
              if (el.__boilEnd) el.__boilEnd(false);
            };
            el.addEventListener('load', function () { if (el.__boilEnd && el.getAttribute('src')) el.__boilEnd(true); });
          })(bi, di, d.name, _bfSrc);
          var _wp = BOIL_WIPE[idx];
          var _pair = (BOIL_PAIR[idx] || []).indexOf(d.name) !== -1;
          bi.className = (NB > 2 ? ((_wp ? 'dio-boil-w' : _pair ? 'dio-boil-d' : (BOIL_XFADE[idx] && BOIL_LINEAR[idx]) ? 'dio-boil-l' : BOIL_XFADE[idx] ? 'dio-boil-x' : 'dio-boil-n') + NBe) : 'dio-boil');
          if (_wp) { bi.style.setProperty('--wx', _wp[0]); bi.style.setProperty('--wy', _wp[1]); }
          var _rp = BOIL_RATE_PAGE[idx] || {};
          var _br = _rp[d.name] != null ? _rp[d.name]
                  : (BOIL_RATE[d.name] != null ? BOIL_RATE[d.name] : 1);
          var _sec = (BOIL_SEC_PAGE[idx] != null ? BOIL_SEC_PAGE[idx] : BOIL_SEC) * STRIDE;   // a strided ring holds each drawing longer, so the loop keeps its pace
          if ((BOIL_HARD[idx] || []).indexOf(d.name) !== -1) bi.className += ' dio-boil-hard';
          // one leg of the ping-pong; `alternate` supplies the return, so a full there-
          // and-back is twice this. Each plane keeps its own period (see BOIL_RATE).
          // a ping-pong's `alternate` doubles its leg; a carousel's duration IS the round
          bi.style.animationDuration = (_sec * _br * (NBe > 2 ? NBe : 1)).toFixed(2) + 's';
          if (RING) bi.style.animationDelay = (-(_k / NBe) * _sec * _br * NBe).toFixed(3) + 's';
          var _host = (d.name.indexOf('front') === 0 ? (dioF || dio) : dio);
          if (_wp) {
            // the in-between: a wrapper that turns about the light while the drawing is up
            var tw = document.createElement('div');
            tw.className = 'dio-tween dio-tween-n' + NB;
            tw.style.transformOrigin = _wp[0] + ' ' + _wp[1];
            tw.style.animationDuration = bi.style.animationDuration;
            tw.style.animationDelay = bi.style.animationDelay;
            tw.appendChild(bi);
            _host.appendChild(tw);
          } else (_orbHost || _host).appendChild(bi);   // siblings travel on the same wrapper
          bi.style.setProperty('--pk', (0.10 + d.depth * 0.9).toFixed(3));   // a boil sibling travels with its own plane
          planes.push({ img: bi, rate: dioRate(d.depth), depth: d.depth, name: d.name + '#b' + bf });
        }
        // In a PING-PONG frame 0 stays put as the bed the other drawing dissolves over —
        // which is also why the painting can never flash empty. In a CAROUSEL it has to
        // take its turn like the rest, or the rota would always blend back through it.
        // ⚠ THE BASE HIDES UNDER A RING AGAIN — and this is a genuine trade-off I got
        // wrong in both directions. Leaving it visible as a "floor" means every ring
        // frame is a BLEND of the base and a displaced drawing, so every mark is doubled
        // a hair apart. Standing still you read that as softness; PANNING, the doubled
        // edges slide against each other and the whole page twitches. (Fred: "the pages
        // are twitching whenever i pan.")
        // Hiding it was only dangerous because the rota had a gap — and that gap was the
        // hardcoded keyframe, which is now generated per ring size with >100% coverage.
        // So: hidden by default, and RESTORED BY THE ERROR HANDLER if a drawing ever
        // fails to load. Safety without the ghost.
        // ⚠ AND A PAN NO LONGER HIDES ANYTHING. The old rule hid every boil sibling on
        // pan — which under a RING (base hidden too) left NOTHING on the plane and the
        // painting vanished the instant Fred touched the phone. The pan rule and the ring
        // rule were each right alone and blank together. Both are gone now: a pan only
        // hardens the ping-pong's cross-fade into a cut (see `.sc-panning .dio-boil`), so
        // no plane is ever emptied and the doubling still stays off a moving view.
        // ⚠ ...BUT ONLY ONCE THE RING HAS ARRIVED. Hiding the base at build time was safe while the
        // drawings followed 700 ms later on every page; now they wait for the reader, so a ring
        // plane whose base hid at once would be EMPTY on the page you swipe to. The base stays up
        // (the same painting, undisplaced) until every drawing of its ring has loaded, then fades
        // out under them on .dio-boil-base's own transition. If any drawing fails it stays up.
        if (RING) {
          im.classList.add('dio-boil-base');
          (function (base0, ring) {
            var left = ring.length, ok = true;
            ring.forEach(function (el) {
              el.__boilEnd = function (good) {
                el.__boilEnd = null;
                if (!good) ok = false;
                if (--left === 0 && ok) base0.style.opacity = '0';
              };
            });
          })(im, boilQ.slice(boilQ.length - (NBe | 0)));
        }
      });
      diag('page ' + idx + ': ' + planes.length + ' plane imgs built');
      // the BREATH COPY: same src (already in cache — no extra request), stacked
      // directly over its plane, parallaxing at the same rate so they never drift apart.
      if (breathe) {
        var bc = breathe.cloneNode(false);
        bc.className = 'dio-light';
        bc.style.opacity = '0';
        breathe.parentNode.insertBefore(bc, breathe.nextSibling);
        planes.push({ img: bc, rate: breatheRate });   // exactly its source plane's rate, or the two would drift apart on tilt
      }
      // HIDE the flat composite — it's the DULL compressed image (Fred: "still see old
      // images when swiping"). The crisp diorama IS the render now; the flat is kept only
      // for geometry (camMeasure reads its naturalWidth). Opaque base plane loads first.
      var pic = page.querySelector('picture');
      // THE COVER IS THE COLD FIRST PAINT, so it does not get to be blank. Its
      // diorama is ~2.4 MB of transparent planes; the flat composite is 171 KB and
      // already in flight at high priority. So on the cover ONLY, hold the flat up
      // as the placeholder and cross-fade to the diorama once every plane has
      // settled. Every other page hides the flat at once, as before — mid-swipe a
      // brief flash of the dull composite is worse than the plane arriving crisp.
      if (idx === 0 && pic) {
        dio.style.cssText += 'opacity:0;transition:opacity 0.45s ease;';
        var waiting = planes.length;
        var settled = function () {
          if (--waiting > 0) return;
          dio.style.opacity = '1';
          setTimeout(function () { pic.style.opacity = '0'; }, 460);   // after the fade, so no gap
          setTimeout(coverReady, 0);                                   // the cover is up — now the look-ahead may fetch (⚠ deferred: never re-enter the build we may still be inside)
        };
        planes.forEach(function (p) {
          if (p.img.complete) return settled();
          p.img.addEventListener('load', settled, { once: true });
          p.img.addEventListener('error', settled, { once: true });
        });
      } else if (pic) pic.style.opacity = '0';
      if (planes[0]) { planes[0].img.loading = 'eager'; planes[0].img.fetchPriority = 'high'; }
      page.insertBefore(dio, layer);   // below the sprite layer
      if (dioF) page.insertBefore(dioF, page.querySelector('.scrim') || null);   // ABOVE the sprite layer, below the poem/scrim
      page.__dio = planes;
      page.__boilQ = boilQ; page.__boilGo = false; page.__artDone = false;
      if (pages[currentIdx()] === page) setTimeout(function () { loadBoil(page); }, 0);   // built while being read (cold open, resize): start its breath
      seatActors(page, idx);   // ground the figures (actors may already be built)
      return planes;
    }
    // NOTE: do NOT preload every page's planes — with all 33 pages now dioramas that
    // is ~200 full-frame images held in memory at once → mobile crash. The neighbour
    // build (ensure(idx±1)) loads the adjacent pages' planes just-in-time, and settle()
    // tears down pages outside a small window so total plane memory stays bounded.

  /* The PAINTERLY post-process lived here and is gone (git 39a3e2d). It blotted noise
     over a finished vector drawing — a filter, not painting — and chewed the eyes,
     which a painter never would. The figure is PAINTED in character.js instead: marks
     that follow the cloth's fall, marks that run around the head, an edge made by
     strokes that cross it, and broken colour on every one. If an object ever reads as
     a sticker again, PAINT it — do not filter it. */

  /* ⭐⭐ THE KEY LIGHT — the reason the children looked pasted on.
     Fred: "this has potential, make it nicer!" Composition was the last fix; this is the
     next one, and it is the difference between a composite and a painting. Every plate in
     this book is built on ONE honest light, and the plates obey it down to the lit edge of
     every leaf — but the cast cells are finished cel artwork with FLAT, EVEN studio lighting,
     dropped onto that painting untouched. `applyGrade` only ever laid a uniform ambient wash
     (and only for pages 0-14, so on the last pages it did nothing at all): a tint has no
     DIRECTION, and direction is the whole of what makes a figure belong to a lit place.
     So each actor gets the page's own light, from the page's own source position:
       1 · a directional wash — warm toward the source, deep and cool away from it;
       2 · a RIM on the silhouette edge that faces the source, which is what physically
           happens to anything standing in front of a strong light and is the single
           strongest cue that the figure and the world share one sun.
     ⚠⚠ THIS IS NOT `paintIn`. That raked the plate's TOOTH across the whole sprite at a
     fixed angle and is the "filter" Fred kept pointing at on his own cells ("you see the
     hoodie? it looks like it has texture right? the new one does not have that") — it is
     still switched off for them and must stay off. Texture is ours; LIGHT is the scene's,
     and a drawing that ignores the scene's light is the thing that looks unfinished.
     Declared per page, so only pages that opt in are touched. */
  var KEYLIGHT = {
    // warm = the source's own colour · cool = the shadow it leaves · bounce = the light the
    // GROUND throws back up into the shadow side, which is the stop that stops a shadow
    // being a dead grey hole and is most of what reads as "painted" rather than "shaded".
    // ⚠⚠ AND IT MUST BE A WHISPER. Fred: "you added the light on the hoodie right, it makes
    // the blending bad, can you smoothen it again?" He is right twice over. These cells are
    // ALREADY shaded — Fred drew the form in — so anything I add is a second lighting on top
    // of a finished one, and past a very low strength it stops reading as light and starts
    // reading as a SCRIM laid over his drawing. The job here is only to seat him in the
    // page's key, not to model him; the modelling is already his. Roughly halved.
    30: { x: 560, y: 66,  warm: [255, 216, 148], cool: [40, 44, 82],  k: 0.30, rim: 0.30, rimCol: [255, 228, 168] },
    31: { x: 400, y: 132, warm: [255, 244, 206], cool: [58, 74, 54],  k: 0.22, rim: 0.22, rimCol: [255, 248, 216] },
  };
  function keyLight(g, a, box, idx) {
    var L = KEYLIGHT[idx]; if (!L) return;
    var cx = box.w / 2, cy = (box.h - 4) - a.h * 0.5;
    var vx = L.x - a.x, vy = L.y - (a.y - a.h * 0.5);
    var m = Math.sqrt(vx * vx + vy * vy) || 1; vx /= m; vy /= m;
    var R = Math.max(a.h * 0.60, 24);
    /* ⚠⚠ TWO SOFT WASHES, NOT ONE MULTI-STOP RAMP. A five-stop gradient across a figure can
       always show its stops — on a smooth cel the eye finds the turn and reads it as a BAND
       drawn across him, which is exactly what "the blending is bad" looks like. Two separate
       washes cannot band: warm coming in from the light side and gone by the middle, cool
       coming in from the far side and gone by the middle, each a simple fade to transparent.
       Where they meet, nothing is happening at all — which is what a soft terminator is. */
    var warm = g.createLinearGradient(cx + vx * R, cy + vy * R, cx - vx * R * 0.15, cy - vy * R * 0.15);
    warm.addColorStop(0, 'rgba(' + L.warm + ',' + L.k.toFixed(3) + ')');
    warm.addColorStop(0.5, 'rgba(' + L.warm + ',' + (L.k * 0.30).toFixed(3) + ')');
    warm.addColorStop(1, 'rgba(' + L.warm + ',0)');
    var cool = g.createLinearGradient(cx - vx * R, cy - vy * R, cx + vx * R * 0.15, cy + vy * R * 0.15);
    cool.addColorStop(0, 'rgba(' + L.cool + ',' + (L.k * 0.60).toFixed(3) + ')');
    cool.addColorStop(0.5, 'rgba(' + L.cool + ',' + (L.k * 0.16).toFixed(3) + ')');
    cool.addColorStop(1, 'rgba(' + L.cool + ',0)');
    g.save();
    g.globalCompositeOperation = 'source-atop';   // the figure's own alpha is the mask
    g.fillStyle = warm; g.fillRect(0, 0, box.w, box.h);
    g.fillStyle = cool; g.fillRect(0, 0, box.w, box.h);
    g.restore();
    /* THE RIM — the silhouette minus itself shifted AWAY from the light leaves a crescent on
       the lit side. ⚠⚠ BUT A BARE CRESCENT IS AN INK LINE, NOT LIGHT. First cut drew it hard
       and opaque and at a constant width all the way round the figure, and it read exactly as
       what it was: a cream outline traced round the hood and the arm, the one thing this book
       is careful never to do. Three things turn an outline into light:
         · it is BLURRED, because light on a soft edge has no edge of its own;
         · it FADES round the silhouette — full where the surface faces the source, gone by
           the time the form turns away — so it is masked by the same gradient as the wash;
         · it is warm and thin, not white and strong.
       `source-atop` keeps all of it inside the figure, so a blur can never halo outside him. */
    var W = g.canvas.width, H = g.canvas.height, SS = W / box.w;
    var t = document.createElement('canvas'); t.width = W; t.height = H;
    var tg = t.getContext('2d');
    tg.drawImage(g.canvas, 0, 0);
    tg.globalCompositeOperation = 'source-in';
    tg.fillStyle = 'rgb(' + L.rimCol + ')';
    tg.fillRect(0, 0, W, H);
    tg.globalCompositeOperation = 'destination-out';
    var d = Math.max(1.3, a.h * 0.024) * SS;
    tg.drawImage(g.canvas, -vx * d, -vy * d);
    tg.globalCompositeOperation = 'destination-in';       // fade it round the form
    var rgm = tg.createLinearGradient((cx + vx * R * 1.05) * SS, (cy + vy * R * 1.05) * SS,
                                      (cx - vx * R * 0.35) * SS, (cy - vy * R * 0.35) * SS);
    rgm.addColorStop(0, 'rgba(0,0,0,1)');
    rgm.addColorStop(0.42, 'rgba(0,0,0,0.34)');
    rgm.addColorStop(0.85, 'rgba(0,0,0,0)');
    tg.fillStyle = rgm; tg.fillRect(0, 0, W, H);
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);             // t is in device pixels, g is scaled
    g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = L.rim;
    try { g.filter = 'blur(' + (Math.max(1.6, a.h * 0.028) * SS).toFixed(2) + 'px)'; } catch (e) {}   // ⚠ wider than feels right: a rim you can locate is an outline
    g.drawImage(t, 0, 0);
    try { g.filter = 'none'; } catch (e) {}
    g.restore();
  }

  function applyGrade(g, w, h, idx) {
    var a = AMBIENT[idx]; if (!a) return;
    g.save();
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + a[3] + ')';
    g.fillRect(0, 0, w, h);
    g.restore();
  }

  // ── PAINTING HIM IN ────────────────────────────────────────────────────────
  //  Fred: "right now it looks like a sticker. make it look like it is drawn in."
  //  He is right, and the reason is that the plate and the figure are made of
  //  different stuff: the plates are impasto — thousands of visible directional
  //  marks with raised edges — while his cells are smooth cel shading with a
  //  clean vector alpha edge. Grading his colour was never going to fix a
  //  SURFACE mismatch. So give him the plate's surface:
  //
  //    1. a stroke field over him, the same rake and roughly the same mark size
  //       the plates carry, modulating value — so his flats stop being flat
  //    2. relief along the stroke gradient, which is what makes impasto read
  //    3. broken colour — neighbouring marks disagree slightly, as real daubs do
  //    4. and a RAGGED EDGE. A brush does not cut a clean line; that hard
  //       silhouette is most of what says "sticker" before you can name it.
  //
  //  Runs once per actor frame at build time, never per frame.
  function paintIn(g, w, h, seed, amt, amb) {
    // ⚠ TAKE THE SUPERSAMPLE FROM THE CANVAS, never assume it. Hard-coding 3 here
    // meant raising the frame's resolution would have made this read the wrong region.
    var SS = g.canvas.width / w, W = Math.round(w * SS), H = Math.round(h * SS);
    var img;
    try { img = g.getImageData(0, 0, W, H); } catch (e) { return; }
    var d = img.data, k = amt == null ? 1 : amt;
    var COS = Math.cos(-0.62), SIN = Math.sin(-0.62);   // the rake the plates use
    var SW = 15, SL = 50;                               // mark width / length, device px
    var AMB = amb || null;
    function hash(x, y, s) {
      var n = (x * 374761393 + y * 668265263 + s * 1013904223) | 0;
      n = (n ^ (n >>> 13)) * 1274126177 | 0;
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    }
    // ⚠ NOT A GRID. Flooring a rotated (u,v) gives rectangular cells, and the eye
    // reads that instantly as woven fabric — the first pass put a mesh over his
    // hoodie. Real marks sit in rows that each START somewhere else, vary in
    // length, and wander. Phase-jitter per row plus a slow warp fixes it.
    function strokeAt(x, y) {
      var u = (x * COS - y * SIN), v = (x * SIN + y * COS);
      u += Math.sin(v * 0.055) * 5;                       // marks wander, they are not ruled
      var row = Math.floor(v / SL);
      var ph = hash(0, row, seed + 3) * 53;               // each row begins elsewhere
      var col = Math.floor((u + ph) / SW);
      var len = 0.55 + hash(col, row, seed + 5) * 0.9;    // and they are not all one length
      return hash(col, row, seed) * len;
    }
    var A = new Uint8ClampedArray(W * H);
    for (var i = 0, p2 = 3; i < W * H; i++, p2 += 4) A[i] = d[p2];
    for (var y2 = 0; y2 < H; y2++) {
      for (var x2 = 0; x2 < W; x2++) {
        var i2 = y2 * W + x2, o = i2 * 4;
        var al = A[i2];
        if (!al) continue;
        // ⚠ LEAVE THE SHADOW ALONE. The ground shadow is drawn into this same canvas at
        // low alpha, and the edge-break below treats its soft boundary as if it were his
        // silhouette — biting a smooth pool into a ragged dark patch, which is half of the
        // "black square on the kid's feet". Only the figure itself gets broken up.
        if (al < 90) continue;
        // ── the edge, broken the way a loaded brush breaks it. A clean alpha cut is
        //    most of what says "sticker" before you can name it: the mark that laid
        //    the silhouette should die out over a few pixels, not stop dead.
        var e = 3, dist = 3;
        for (var q = 1; q <= 3; q++) {
          if ((x2 > q && A[i2 - q] < 190) || (x2 < W - q && A[i2 + q] < 190) ||
              (y2 > q && A[i2 - q * W] < 190) || (y2 < H - q && A[i2 + q * W] < 190)) { dist = q; break; }
        }
        if (dist < 3) {
          var r = strokeAt(x2 * 1.6, y2 * 1.6);
          var bite = (0.28 + 0.72 * r) * (1 - (dist - 1) / 3);
          // ⚠ HIS LINE IS THE POINT. Fred: "i can still see a bit of like fuzzy on the
          // character. can we make the lines more crisp?" At 0.85 over 6px this chewed
          // straight through his drawn contour and left a dotted, soft edge. Break the
          // silhouette just enough to read as a brush, never enough to lose the line.
          d[o + 3] = al * (1 - 0.30 * k * bite);
          if (d[o + 3] < 5) continue;
        }
        // ── the stroke field, and its relief — held back in the darks, where the
        //    plates are smooth too and texture would only read as noise
        var lum = (d[o] * 0.30 + d[o + 1] * 0.59 + d[o + 2] * 0.11);
        var tex = k * Math.min(1, Math.max(0.25, (lum - 26) / 110));
        var sN = strokeAt(x2, y2);
        var sX = strokeAt(x2 + 3, y2) - strokeAt(x2 - 3, y2);
        var sY = strokeAt(x2, y2 + 3) - strokeAt(x2, y2 - 3);
        var lift = (sN - 0.5) * 0.10 + (-sX * 0.6 - sY * 0.6) * 0.13;   // light upper-left
        var f = 1 + lift * tex;
        // ── broken colour: neighbouring marks disagree, as daubs do
        var j = (hash(Math.floor(x2 / SW), Math.floor(y2 / SL), seed + 31) - 0.5) * 11 * tex;
        d[o]     = d[o] * f + j;
        d[o + 1] = d[o + 1] * f + j * 0.35;
        d[o + 2] = d[o + 2] * f - j * 0.6;
        // ── THE PAGE'S AIR, BLED ACROSS HIS EDGE. A figure painted into a scene has
        //    the scene's light eating into its outline; a decal has a crisp border all
        //    the way round. Mixing the page's own ambient into the last few pixels is
        //    what finally stops him sitting ON the painting.
        if (AMB && dist < 3) {
          var bleed = (1 - (dist - 1) / 3) * 0.22 * k;
          d[o]     += (AMB[0] - d[o]) * bleed;
          d[o + 1] += (AMB[1] - d[o + 1]) * bleed;
          d[o + 2] += (AMB[2] - d[o + 2]) * bleed;
        }
      }
    }
    g.putImageData(img, 0, 0);
    // ── AND THE SAME BRUSH PASSES OVER HIM ────────────────────────────────
    //  The last thing that gives a figure away is an unbroken contour. In a
    //  painting the marks that laid the background do not stop politely at the
    //  edge — they run across it. These are those marks: the page's own ambient,
    //  on the page's own rake, clipped to him so they read as the background
    //  crossing in front. Few, faint, and never over the middle of his face.
    if (AMB) {
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);                // these are device pixels, like the loop above
      g.globalCompositeOperation = 'source-atop';
      var cx0 = W / 2, cy0 = H * 0.34;                 // roughly where his face is
      for (var m = 0; m < 16; m++) {
        var mx = hash(m, 1, seed + 91) * W;
        var my = hash(m, 2, seed + 91) * H;
        if (Math.hypot(mx - cx0, my - cy0) < W * 0.22) continue;   // leave the face alone
        var ln = SL * (0.8 + hash(m, 3, seed + 91) * 1.6);
        var wd = SW * (0.5 + hash(m, 4, seed + 91) * 0.7);
        var al2 = 0.09 + hash(m, 5, seed + 91) * 0.13;
        g.save();
        g.translate(mx, my);
        g.rotate(-0.62 + (hash(m, 6, seed + 91) - 0.5) * 0.5);
        var lg = g.createLinearGradient(-ln / 2, 0, ln / 2, 0);
        var col = AMB[0] + ',' + AMB[1] + ',' + AMB[2];
        lg.addColorStop(0, 'rgba(' + col + ',0)');
        lg.addColorStop(0.5, 'rgba(' + col + ',' + al2.toFixed(3) + ')');
        lg.addColorStop(1, 'rgba(' + col + ',0)');
        g.fillStyle = lg;
        g.beginPath(); g.ellipse(0, 0, ln / 2, wd / 2, 0, 0, 6.2832); g.fill();
        g.restore();
      }
      g.restore();
    }
  }

  /* ---- render-once helpers ---- */
  function frameCanvas(w, h, draw, ssOverride) {
    var SS = ssOverride || 3, c = document.createElement('canvas');
    c.width = w * SS; c.height = h * SS;
    var g = c.getContext('2d'); g.scale(SS, SS);
    // ⚠⚠ CRISP EDGES (Sep 26, Fred: "the edges of the character is very bad… make sure it is crisp!").
    // His cells are ~1000 px drawings shrunk to ~400 px here on a phone; a canvas shrinks with
    // imageSmoothingQuality 'low' by default, which SKIPS source pixels and leaves stair-stepped,
    // jagged outlines on hands and hood. 'high' filters the whole footprint — the line stays clean.
    g.imageSmoothingEnabled = true; try { g.imageSmoothingQuality = 'high'; } catch (e) { }
    draw(g);
    return c;
  }
  // ⭐ A SHEET IS A BLOB, NOT A DATA URL (Oct 8 — Fred: "lighten page 23"). `hands` builds one waving strip
  // 10175×592 px; toDataURL encoded it as PNG ON THE MAIN THREAD the moment the page opened and parked a
  // 5.6 MB base64 string in the element's style (it froze DevTools outright). toBlob encodes off the main
  // thread and the style holds a short blob: URL — the pixels are identical. The strip canvas is zeroed as
  // soon as it is encoded (iOS keeps a canvas's memory until GC), and the URL is revoked when the page's
  // layer is freed (freeSheets). A sheet whose layer died before its blob arrived revokes itself.
  function sheetBg(canvas, el, apply) {
    var done = function (url) { apply(url); canvas.width = canvas.height = 0; };
    if (!canvas.toBlob || !window.URL || !URL.createObjectURL) { done(canvas.toDataURL()); return; }
    canvas.toBlob(function (b) {
      if (!b) { done(canvas.toDataURL()); return; }
      var u = URL.createObjectURL(b);
      if (el.__dead) { URL.revokeObjectURL(u); canvas.width = canvas.height = 0; return; }
      el.__blobUrl = u; done(u);
    }, 'image/png');
  }
  function freeSheets(layer) {
    if (!layer) return;
    var ss = layer.querySelectorAll('.sc-sheet');
    for (var i = 0; i < ss.length; i++) { ss[i].__dead = true; if (ss[i].__blobUrl) { URL.revokeObjectURL(ss[i].__blobUrl); ss[i].__blobUrl = null; } }
  }
  function place(el, fit, px, py, pw, ph, anchorY) {
    el.style.left = (fit.x(px) - pw * fit.s / 2) + 'px';
    el.style.top = (fit.y(py) - ph * fit.s * (anchorY == null ? 1 : anchorY)) + 'px';
    el.style.width = (pw * fit.s) + 'px';
    el.style.height = (ph * fit.s) + 'px';
  }

  // Web Animations API: a FRESH animation object every tap — immune to class
  // state, reflow tricks, and rAF timing (the old class-toggle only fired ~twice).
  function waapi(el, kf, opts) { if (el && el.animate) try { el.animate(kf, opts); } catch (e) {} }
  // MOVE: a body animation that ADDS onto the idle bob/breath (composite:'add')
  // instead of replacing it — so a tap layers on top of the living idle and
  // dissolves back into it with NO snap (the old "glitch while pressed"). Every
  // move's keyframes start AND end at identity, so the added delta returns to 0.
  function mv(el, kf, opts) { opts = opts || {}; opts.composite = 'add'; opts.fill = 'none'; waapi(el, kf, opts); }
  function jump(el) { mv(el, [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-16px) rotate(1.5deg)', offset: 0.4 },
    { transform: 'translateY(3px)', offset: 0.72 },
    { transform: 'translateY(0)' } ], { duration: 560, easing: 'cubic-bezier(.3,1.6,.4,1)' }); }
  function jiggle(el) { mv(el, [
    { transform: 'rotate(0deg)' }, { transform: 'rotate(7deg)', offset: 0.25 },
    { transform: 'rotate(-5deg)', offset: 0.55 }, { transform: 'rotate(2deg)', offset: 0.8 }, { transform: 'rotate(0deg)' } ],
    { duration: 600, easing: 'ease-out' }); }
  function flareGlow(el) { waapi(el, [
    { transform: 'scale(1)', opacity: 0.85 }, { transform: 'scale(1.5)', opacity: 1, offset: 0.35 }, { transform: 'scale(1)', opacity: 0.85 } ],
    { duration: 720, easing: 'ease-out' }); }
  function sputterGlow(el) { waapi(el, [
    { opacity: 0.5, transform: 'scale(1)' }, { opacity: 0.95, transform: 'scale(1.18)', offset: 0.08 }, { opacity: 0.22, transform: 'scale(.86)', offset: 0.16 },
    { opacity: 0.8, transform: 'scale(1.1)', offset: 0.26 }, { opacity: 0.15, transform: 'scale(.8)', offset: 0.36 }, { opacity: 0.9, transform: 'scale(1.22)', offset: 0.48 },
    { opacity: 0.3, transform: 'scale(.92)', offset: 0.58 }, { opacity: 0.7, transform: 'scale(1.08)', offset: 0.7 }, { opacity: 0.2, transform: 'scale(.88)', offset: 0.82 }, { opacity: 0.5, transform: 'scale(1)' } ],
    { duration: 850, easing: 'linear' }); }
  // ONLY blink actors that actually have a shut frame — a tap used to add .blink
  // to back-turned figures (no shut frame) and hide their only sprite = the whole
  // character vanished for 150ms on tap (city/choice/path).

  /* ---- the CUPHEAD MENU — squash & stretch, anticipation, overshoot & settle.
     transform-origin sits at the feet (.sc-actor{50% 96%}) so squash reads as
     weight on the ground and stretch as a leap. Every move is one WAAPI object
     (replays on every tap). Cheap: only transform, all on the compositor. ---- */

  // the RADIANT (Wisdom) keeps her dignity — light and grace, never goofy, never blinks (Ps 121:4)


  // CAST hand tips are in PLATE coords; a sprite is its own little canvas, so the
  // hands must be remapped into local space (else they land off-canvas and the
  // figure renders as a hooded blob — the "blimp" bug). anchor: (a.x,a.y) plate → (box.w/2, box.h-4) local.
  // ARM LENGTH IS A PROPORTION, NOT A FREE COORDINATE. Cast entries give an absolute
  // plate point for each hand, and several were authored far out — candle's raised
  // arms measured 0.58 and 0.63 of body height, when a real arm is about 0.44 and a
  // stylised one is shorter. They read as sticks. Clamp the hand to a sane reach from
  // the SHOULDER (the rig puts shoulders ~0.25 down from the head-top), so the pose
  // and the direction are kept but the limb stays in proportion — everywhere at once,
  // instead of hand-editing every entry in the cast table.
  // NOT a human proportion (Fred: "use kirby or hollow knight as an example"). Both
  // references are the same idea — a dominant head/body mass with SHORT, STUBBY limbs.
  // A human 0.44 on this 2-head-tall build reads as a stick. But this rig has a
  // constraint the references do not: its HEAD is half the figure and its radius is
  // about 0.30*h, so an arm shorter than that never clears the head silhouette —
  // rendered at 0.26 the raised hand simply disappeared behind it. 0.34 is the
  // shortest reach that still reads as a raised arm; the stubbiness comes from the
  // THICKNESS instead (character.js: 0.036 -> 0.076 of h), which is what actually
  // makes a Kirby limb a limb rather than a wire.
  var ARM_MAX = 0.34;                       // shoulder → fingertip, as a fraction of h
  function localArm(a, arm, box) {
    if (!arm) return null;
    var hx = box.w / 2, hy = box.h - 4;                     // feet anchor, local
    var px = hx + (arm[0] - a.x), py = hy + (arm[1] - a.y);
    var shY = hy - a.h * 0.75;                              // shoulder height, local
    var vx = px - hx, vy = py - shY, d = Math.hypot(vx, vy);
    // No exceptions: the clamp holds for every actor. Where two figures had to join
    // hands and could not (their shoulders were further apart than two clamped arms
    // could span), the FIGURES were moved closer in the cast table rather than the
    // rule bent — Fred: "you can always just move the characters closer together so
    // the arms reach". Short arms then mean people stand near each other, which is
    // what holding a hand looks like anyway.
    var max = a.h * ARM_MAX;
    if (d > max && d > 0) { var k = max / d; px = hx + vx * k; py = shY + vy * k; }
    return [px, py];
  }
  function drawActorFrame(g, a, box, isR, lid, waveHand, smile, idx) {
    var p = {}; for (var k in a) p[k] = a[k];
    p.x = box.w / 2; p.y = box.h - 4;
    // ⚠ A FIGURE WITH NO SHADOW IS A STICKER. Fred: "can you make it so that the character
    // somehow blends with the background? right now it looks like it is drawn by 2 different
    // person." Half of that is this: he stood on the painting instead of in it. A soft pool
    // under his feet, wider than he is and squashed flat, puts him ON the ground.
    // ⚠ AND NOBODY WHO IS FLYING. The angels at the gate hover, and a ground shadow
    // squashed to 0.3 and then rotated with them (tilt ±33) reads as a hard grey slab
    // hanging under each one — Fred circled both: "the angels have some sort of opaque
    // black box on the feet". Wings mean no ground to cast onto.
    // ⚠ NOR ANYONE ON A STRING. Fred circled a dark smear under the child on the string
    // page: he hangs from a tether and SPINS, so his ground shadow rotated with him and
    // drew a black band across the plate. `tether`/`buffet` mean airborne exactly as
    // surely as `wings` does. If a figure is not standing on the floor, nothing of the
    // floor belongs to it.
    // ⚠ DISABLED. Fred, on page 11: "the shadow does not behave properly. can we just
    // disable it altogether?" Right call — this one soft radial ellipse has needed four
    // separate rescues in one session (box.w's 116-floor made it oversized on small
    // actors; the box-vs-a.h rescale still read wrong against bright ground on page 11)
    // and every ground it sits on is different enough that no single formula holds. The
    // figure already belongs to the page via paintIn's surface treatment (the plate's own
    // brushwork painted across him) — that was carrying the "grounded" read on its own
    // the whole time. `false &&` keeps the code for reference; nothing calls it now.
    if (false && !a.back && !a.noShadow && !a.wings && !a.tether && !a.buffet) {
      var sw = Math.min(box.w * 0.34, a.h * 0.62), sy = box.h - 6;
      var sg = g.createRadialGradient(box.w / 2, sy, 1, box.w / 2, sy, sw);
      sg.addColorStop(0, 'rgba(18,22,30,0.34)');
      sg.addColorStop(0.6, 'rgba(18,22,30,0.16)');
      sg.addColorStop(1, 'rgba(18,22,30,0)');
      g.save(); g.fillStyle = sg;
      g.beginPath(); g.ellipse(box.w / 2, sy, sw, sw * 0.3, 0, 0, 6.2832); g.fill(); g.restore();
    }
    p.armL = localArm(a, a.armL, box);
    p.armR = waveHand || localArm(a, a.armR, box);
    var anim = { breeze: 0, bobY: 0, swayX: 0, gazeX: (a.eye ? a.eye[0] * 0.35 : 0), gazeY: (a.eye ? a.eye[1] * 0.25 : 0), lid: lid || 0, smile: smile || false };
    // ⚠ THE PROTAGONIST IS FRED'S OWN ARTWORK. Every 'p' actor in the book is now the hooded
    // kid from his sheet (converted crayon→brush, see gen/crayon-to-brush.py). drawKid returns
    // false if its cell has not decoded yet — in which case the old pilgrim still draws, so a
    // page can never come up with nobody in it.
    // ⚠ THE PROTAGONIST IS FRED'S OWN CHARACTER, from his own sheet. Only him — angels,
    // folk and anyone with a palette of their own keep their painter, or the angels at the
    // gate turn into him. drawKid returns false until his art has decoded, and the original
    // pilgrim draws in that case, so a page can never come up with nobody in it.
    // the protagonist plain; the friends the same character in their own colours. Angels
    // keep their own painter — they have wings, and his sheet has none.
    if (!isR && F.drawKid && !a.wings) {
      p.kidPal = F.kidPalFor ? F.kidPalFor(a, (a.x || 0) + (a.h || 0)) : null;
      if (F.drawKid(g, p, anim)) { a.__isCell = 1; carrierHands(g, a, box); return; }
    }
    a.__isCell = 0;
    (isR ? F.drawRadiant : F.drawPilgrim)(g, p, anim);
  }
  var SHEET_K = 18;   // frames in a pilgrim's idle loop (rest · blink · wave)
  function waveTip(a, box, i) {   // the free hand's local tip on frame i, or null (rest)
    if (i < 9 || i > 14) return null;
    var side = a.armR ? 'L' : 'R';                   // wave with the hand that isn't holding a staff/another hand
    var sgn = side === 'R' ? 1 : -1;
    var u = (i - 9) / 5;                             // 0..1 across the wave
    var wag = Math.sin(u * Math.PI * 2.5) * box.w * 0.11;
    return { side: side, tip: [box.w / 2 + sgn * box.w * 0.31 + wag, (box.h - 4) - a.h * 1.18] };   // hand up around head-top, out to the side
  }
  // ── MASKED BY THE LIGHT, NOT GIVEN MORE ARMS ─────────────────────────────────
  //  Fred, first pass: "can you make it so that the light figure is in front of him
  //  but the light figure's hands are on top of the kid?" — fixed by drawing hands
  //  over him. Then: "twoways with the extra arms is scary, maybe make it so that
  //  the kid is carried by the light in front, so we can mask it to the reader."
  //
  //  Two separate paw-shapes, and then one arm-plus-hand, both still read as EXTRA
  //  limbs — because his own drawn "carried" pose already has both arms spread
  //  wide (see cast-library/kid-carried.webp: nothing gripped, nothing held, just open
  //  arms either side of his hood). Adding another limb next to an open arm never
  //  reads as "holding," it reads as a second arm. His art was never the problem.
  //
  //  So: no more fabricated hands. One soft, faceless mass of the Light's own gold,
  //  drawn OVER his outer (far) arm — not a hand, not fingers, nothing anatomical —
  //  sitting where a shoulder would be. It masks the open arm the way Fred asked:
  //  the reader's eye resolves "held against Him" instead of counting limbs.
  function carrierHands(g, a, box) {
    if (!a.carry) return;
    var GOLD = ['#8a6a22', '#c39a3c', '#efd07a', '#fdf0c2'];
    var hx = box.w / 2 + (a.carry[0][0] - a.x);       // plate → this actor's frame
    var hy = (box.h - 4) + (a.carry[0][1] - a.y);
    var R = a.h * 0.15;   // shoulder-sized, not a golden boulder eating the frame
    g.save();
    var gl = g.createRadialGradient(hx, hy, R * 0.15, hx, hy, R * 1.35);
    gl.addColorStop(0, GOLD[3]); gl.addColorStop(0.35, GOLD[2]);
    gl.addColorStop(0.72, GOLD[1]); gl.addColorStop(1, 'rgba(138,106,34,0)');
    g.fillStyle = gl;
    g.beginPath(); g.ellipse(hx, hy, R * 0.85, R * 1.35, -0.3, 0, 6.2832); g.fill();
    // a soft warm edge, so it reads as form (a shoulder) and not a lit patch of air
    g.strokeStyle = 'rgba(42,22,8,0.30)'; g.lineWidth = Math.max(1, R * 0.05);
    g.beginPath(); g.ellipse(hx, hy, R * 0.85, R * 1.35, -0.3, 0, 6.2832); g.stroke();
    g.restore();
  }

  /* ---- SEATING: paint the figure INTO its ground (Fred, Aug 2026) ----
     "characters and objects look like something on a top layer of the actual scene…
     cartoons hide these things by having bushes on the character's feet."
     The cartoon trick, done with the painting's own paint: small tufts drawn OVER the
     boot line, their colours SAMPLED from the page's ground plane at that exact spot —
     so on grass they are grass, on a dirt road they are dust and stubble, and they can
     never clash with a plate because they are made of it. Drawn after the actor in the
     same layer, so they overlap the feet; the layer moves as one, so they can't drift. */
  // ⚠ OFF BY DEFAULT. Seating was meant to bed a figure into its ground with a few
  // tufts sampled from the plate. It has now caused three visible defects in a row: the
  // green bar across the Father's chest on the carried page, and the black patch at the
  // feet that Fred has circled twice — because it samples a DEPTH PLANE, whose colour
  // under soft alpha is near-black, and paints that at his feet. The figure is already
  // bedded in by paintIn's surface treatment and a soft contact shadow. Turn it on with
  // ?seat=1 if it is ever worth reviving; it must not ship until it can prove itself on
  // all 33 pages, dark ones included.
  function seatActors(page, idx) {
    if (!/[?&]seat=1/.test(location.search)) return;
    if (page.__seated) return;
    var layer = page.__scLayer, planes = page.__dio, fit = page.__scFit;
    var cast = F.CAST[idx];
    if (!layer || !planes || !fit || !cast) return;
    // the ground = the deepest plane still inside the rate-1.0 ground world (no skies)
    // ⚠ pick the ground by NAME first, depth second. Taking simply "the deepest plane
    // <= 0.56" chose garden's `front` plane (the boulder, at 0.55) as its ground — a
    // near-transparent plane, so the sampler found no colour and every figure on that
    // page silently went unseated. The ground is the plane the scene's floor is
    // painted on, and it is always one of these names.
    var ground = null, GROUNDN = ['ground', 'land', 'mid'];
    for (var i = 0; i < planes.length; i++) {
      if (GROUNDN.indexOf(planes[i].name) !== -1) { ground = planes[i]; break; }
    }
    if (!ground) for (var i2 = 0; i2 < planes.length; i2++) {
      var pl = planes[i2];
      if (pl.depth >= 0.3 && pl.depth <= 0.56 && pl.name !== 'front'
          && (!ground || pl.depth > ground.depth)) ground = pl;
    }
    if (!ground) return;
    page.__seated = true;
    var run = function () {
      cast.actors.forEach(function (a, ai) {
        // ⚠ NOR ANYONE OFF THE GROUND. `noShadow` already means "his feet are not on the
        // floor" — the carried child on twoways. Seating him sampled the meadow far below
        // and drew its grass across the Father's chest: "the kid has a green line on his
        // feet". Feet in the air get no tufts.
        if (a.wings || a.noShadow || a.tether || a.buffet) return;   // a hoverer touches nothing
        var seed = (idx * 73 + ai * 131 + ((a.x | 0) * 7)) & 0x7fffffff;
        var rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
        var img = ground.img;
        if (!img.naturalWidth) return;
        // sample a strip of the ground around the feet, in plate space
        var kx = img.naturalWidth / 800, ky = img.naturalHeight / 500;
        var tc = document.createElement('canvas'); tc.width = 26; tc.height = 8;
        var tg = tc.getContext('2d', { willReadFrequently: true });
        try {
          tg.drawImage(img, (a.x - 30) * kx, (a.y - 5) * ky, 60 * kx, 14 * ky, 0, 0, 26, 8);
        } catch (e) { return; }
        // ⚠ AND REJECT WHAT IS NOT REALLY GROUND. A depth plane is a PNG, and the RGB
        // under its soft alpha is near-black — sample that and every tuft comes out black,
        // which is the "black square on the kid's feet" Fred keeps circling. Take only
        // pixels that are properly opaque AND carry real colour; if the strip cannot give
        // enough of them, this figure simply goes unseated. Better no grass than a smear.
        var d = tg.getImageData(0, 0, 26, 8).data, cols = [];
        for (var t = 0; t < 120 && cols.length < 12; t++) {
          var pi = ((rnd() * 26 * 8) | 0) * 4;
          if (d[pi + 3] < 200) continue;                       // was 60 — soft edges are not ground
          var _sum = d[pi] + d[pi + 1] + d[pi + 2];
          if (_sum < 105) continue;                            // near-black is the plane's matte, not paint
          cols.push([d[pi], d[pi + 1], d[pi + 2]]);
        }
        if (cols.length < 6) return;                           // no ground under these feet (interior edge etc)
        var h = a.h, wCss = Math.max(22, h * 0.92) * fit.s, hCss = Math.max(6, h * 0.17) * fit.s;
        var cv = document.createElement('canvas');
        var DPR = Math.min(2, window.devicePixelRatio || 1);
        cv.width = Math.round(wCss * DPR); cv.height = Math.round(hCss * DPR);
        cv.className = 'sc sc-seat';
        cv.style.cssText = 'position:absolute;pointer-events:none;'
          + 'left:' + (fit.x(a.x) - wCss / 2).toFixed(1) + 'px;'
          + 'top:' + (fit.y(a.y) - hCss * 0.82).toFixed(1) + 'px;'
          + 'width:' + wCss.toFixed(1) + 'px;height:' + hCss.toFixed(1) + 'px;';
        var g = cv.getContext('2d'); g.scale(DPR, DPR); g.lineCap = 'round';
        var baseY = hCss * 0.82;
        // low dabs of the ground itself lapping OVER the boot line — the strongest
        // seat: the ground visibly continues in front of the figure
        for (var b2 = 0; b2 < 3; b2++) {
          var c0 = cols[(rnd() * cols.length) | 0];
          g.strokeStyle = 'rgba(' + c0[0] + ',' + c0[1] + ',' + c0[2] + ',0.9)';
          g.lineWidth = Math.max(1.4, h * 0.034 * fit.s);
          var dx0 = wCss * (0.2 + rnd() * 0.6), dw = wCss * (0.12 + rnd() * 0.16);
          g.beginPath(); g.moveTo(dx0 - dw / 2, baseY + (rnd() - 0.5) * 2);
          g.quadraticCurveTo(dx0, baseY - 1.5, dx0 + dw / 2, baseY + (rnd() - 0.5) * 2); g.stroke();
        }
        // the tufts — clustered at the two feet, mostly darker than the lit ground,
        // a few lit tips (broken colour, so they read as paint, not decals)
        var nBlades = 6 + (rnd() * 3 | 0);
        for (var q = 0; q < nBlades; q++) {
          var foot = q % 2 ? 0.30 : 0.66;
          var bx = wCss * (foot + (rnd() - 0.5) * 0.24);
          var bl = hCss * (0.3 + rnd() * 0.45);
          var lean2 = (rnd() - 0.5) * 0.9 + (bx < wCss / 2 ? -0.18 : 0.18);
          var c1 = cols[(rnd() * cols.length) | 0];
          // ⚠ NOT DARKER THAN THE GROUND. Tufts pitched at 0.80-0.98 of the ground's own
          // value read as a stain under him rather than as grass in front of him — and on
          // a dark page that stain IS the black patch. Sit them either side of the
          // ground's value instead, so they read as blades catching and missing the light.
          var dk = 0.94 + rnd() * 0.14;
          if (rnd() < 0.3) dk = 1.18;
          g.strokeStyle = 'rgba(' + Math.min(255, c1[0] * dk | 0) + ',' + Math.min(255, c1[1] * dk | 0) + ',' + Math.min(255, c1[2] * dk | 0) + ',' + (0.6 + rnd() * 0.25).toFixed(2) + ')';
          g.lineWidth = Math.max(0.9, h * 0.022 * fit.s) * (0.7 + rnd() * 0.5);
          g.beginPath(); g.moveTo(bx, baseY + 1);
          g.quadraticCurveTo(bx + lean2 * bl * 0.35, baseY - bl * 0.6, bx + lean2 * bl, baseY - bl);
          g.stroke();
        }
        layer.appendChild(cv);                                 // after the actor -> paints over the boots
      });
    };
    if (ground.img.complete) run();
    else ground.img.addEventListener('load', run, { once: true });
  }

  /* ---- THE CIRCLE WALK (`lost`) ------------------------------------------------
     A page whose whole sentence is "he cannot get anywhere" cannot say it with a
     drawing — a painted ring of prints is a diagram of walking in circles. So he walks,
     really, round an ellipse on the ground, and the prints behind him fade inside a
     second so the trail never hardens into that diagram. Everything here is transform
     and opacity: it runs on the compositor and the main thread stays free. ---- */
  function buildWalk(w, fit, idx) {
    var wrap = document.createElement('div');
    wrap.className = 'sc sc-orbit';
    // ⚠ AND THE WALKER. Same race: `lost` is the one page whose figure is a walk rig,
    // and on a cold load it baked the fallback pilgrim into its two sprites.
    // ⚠ ASK ONLY FOR THE CELL THIS RIG ACTUALLY DRAWS. `kidCell` is pure, so the walker's
    // own spec answers it: walking + teary resolves to 'walk', and that is the whole of what
    // this page has to wait for. Waiting on all forty-one is what made the cast a 2 MB
    // blocking fetch on the cover — see kidReady in character.js.
    var _wc = (F && F.kidCell) ? [F.kidCell({ walk: 1, mood: 'teary' })] : null;
    if (F && F.onKidReady && F.kidReady && !F.kidReady(_wc)) {
      F.onKidReady(function () {
        if (!wrap.parentNode) return;
        try { wrap.parentNode.replaceChild(buildWalk(w, fit, idx), wrap); } catch (e) {}
      }, _wc);
    }
    var BW = w.h * 1.2, BH = w.h * 1.5;                       // sprite box, plate units
    var wpx = BW * fit.s, hpx = BH * fit.s;
    function face(back) {
      var c = frameCanvas(wpx, hpx, function (g) {
        // ⚠ THE SECOND ARGUMENT IS NOT OPTIONAL. drawPilgrim reads `anim.breeze` (and gaze
        // and lid) straight off it — call it with one argument and it throws, which takes
        // the whole page build down with it and leaves an empty field where the walker
        // should be. That is exactly what it did here.
        // ⚠ THIS IS THE PROTAGONIST TOO. This rig called drawPilgrim directly and was
        // never converted with the rest of the book, so `lost` — the one page whose
        // figure is a WALKER rather than a placed actor — still showed the retired red
        // character while every other page showed Fred's. The one code path I missed.
        // ⚠ HE MUST BE WALKING IN BOTH HALVES OF THE RING. This asked for `back:1` on the
        // far half, which resolves to `walk-away` — and Grok drew that as a STANDING back
        // view with no stride, so on the page that says "you WENT far into the dark" he
        // slid round the ellipse without taking a step. Same fault Fred caught on p5.
        // The orbit runs over the top first (travelling left→right) and returns along the
        // bottom (right→left), so the side cell, mirrored to the direction of travel, is
        // both truthful about the motion and the only cell that actually strides.
        var wp = { x: wpx / 2, y: hpx - 2, h: w.h * fit.s, facing: back ? 1 : -1,
                   walk: 1, stride: 0.85, lift: 0.55,
                   wind: back ? -0.4 : 0.4, mood: 'teary', eye: [back ? 1 : -1, 0.2] };
        var anim = { breeze: 0, bobY: 0, swayX: 0, gazeX: 0, gazeY: 0.1, lid: 0, smile: false };
        // ⚠ THE SECOND ARGUMENT IS NOT OPTIONAL. drawPilgrim reads `anim.breeze` (and gaze
        // and lid) straight off it — call it with one argument and it throws, which takes
        // the whole page build down with it and leaves an empty field where the walker
        // should be. That is exactly what it did here.
        var _wCell = !!(F.drawKid && F.drawKid(g, wp, anim));
        if (!_wCell) F.drawPilgrim(g, wp, anim);
        applyGrade(g, wpx, hpx, idx);
        // ⚠ same rule as the actors: the page's tooth is for figures this engine DRAWS.
        // Fred's own cell arrives with its own surface and must not be raked (see the
        // note at the actor paintIn). This walker is a cell too.
        if (!_wCell) paintIn(g, wpx, hpx, (idx * 977 + (back ? 3 : 11)) | 0, 1, AMBIENT[idx]);
      });
      c.className = back ? 'ob' : 'of';
      c.style.transformOrigin = '50% 92%';
      return c;
    }
    wrap.appendChild(face(true)); wrap.appendChild(face(false));
    wrap.style.width = wpx + 'px'; wrap.style.height = hpx + 'px';
    // the ellipse, in layer pixels. It STARTS at the left and runs over the top first,
    // so the first half is the far side (his back) and the second half comes back
    // toward the reader (his face) — which is what the two cross-fading sprites expect.
    var cx = fit.x(w.x), cy = fit.y(w.y), rx = w.rx * fit.s, ry = w.ry * fit.s;
    wrap.style.offsetPath = 'path("M ' + (cx - rx).toFixed(1) + ' ' + cy.toFixed(1)
      + ' A ' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 1 1 ' + (cx + rx).toFixed(1) + ' ' + cy.toFixed(1)
      + ' A ' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 1 1 ' + (cx - rx).toFixed(1) + ' ' + cy.toFixed(1) + '")';
    wrap.style.setProperty('--osec', w.sec + 's');
    wrap.style.left = '0px'; wrap.style.top = '0px';
    return wrap;
  }
  /* his prints: spawned at the foot position for the CURRENT phase of the same ellipse,
     on the same period, so they land where he actually is. They are placed by the layer,
     so they pan with the painting, and they remove themselves when their fade ends. */
  /* ⚠⚠ THEY NEVER DREW, AND THREW TWICE A SECOND INSTEAD (found Oct 8). This read
     `page.__scLayer` — but buildPage calls it BEFORE it assigns `page.__scLayer = layer`, so on the
     first build `layer` was undefined and every 430 ms tick died on `layer.classList`. And because
     `page.__prints` was then set, a rebuild never restarted it, so the timer outlived the page
     (settle frees and rebuilds `lost` as the reader passes) and kept throwing. Now the layer is
     handed in, and the timer belongs to that layer: when settle frees it, the timer stops itself,
     and the next build starts a fresh one. */
  function startPrints(page, w, fit, layer) {
    if (page.__prints) { clearInterval(page.__prints); page.__prints = 0; }
    if (!layer) return;
    var t0 = performance.now();
    var timer = page.__prints = setInterval(function () {
      if (!layer.isConnected) { clearInterval(timer); if (page.__prints === timer) page.__prints = 0; return; }
      if (!layer.classList.contains('on') || document.hidden) return;
      var ph = (((performance.now() - t0) / (w.sec * 1000)) % 1 + 1) % 1;
      var a = Math.PI + ph * Math.PI * 2;                       // matches the path: starts at the left, over the top
      var px = w.x + Math.cos(a) * w.rx, py = w.y + Math.sin(a) * w.ry;
      var near = (py - (w.y - w.ry)) / (2 * w.ry);              // 0 far, 1 near — prints shrink with distance
      var d = document.createElement('div');
      d.className = 'sc-print';
      var sz = (3.4 + near * 3.2) * fit.s;
      d.style.width = sz + 'px'; d.style.height = (sz * 0.46) + 'px';
      d.style.left = (fit.x(px) - sz / 2 + (Math.random() - 0.5) * sz * 0.7) + 'px';
      d.style.top = (fit.y(py) - sz * 0.23) + 'px';
      layer.appendChild(d);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1300);
    }, 430);
  }

  function buildActor(a, fit, paired, frozen, idx) {   // idx: the page (grade + freeze lookups)
    // ⚠ IF HIS ART IS NOT HERE YET, BUILD AGAIN WHEN IT IS. Actors are baked into sprite
    // sheets once; on a cold load that happens before the protagonist's drawings have
    // decoded, and the page keeps the fallback pilgrim for the whole visit.
    // ⚠ EVERY CHILD, NOT JUST HIM. This rebuild existed but only covered the
    // protagonist — so on a cold load his FRIENDS baked with the fallback pilgrim and
    // stayed that way for the whole visit: page 29's child came up as a cream-masked,
    // red-cloaked figure that reads as a panda, and `lost`'s walker as the retired red
    // character. It is a race, which is why it looked intermittent. Angels keep their
    // own painter (they have wings and his sheets have none), so they are the only
    // actors that must NOT wait.
    var isHim = a.t === 'p' && !a.wings;
    // ⚠ AND THIS ACTOR WAITS FOR ITS OWN CELL, not for the whole cast. One page's figure
    // has no business being gated on the drawings of thirty other pages.
    var _ac = (F && F.kidCell) ? [F.kidCell(a)] : null;
    if (isHim && F && F.onKidReady && F.kidReady && !F.kidReady(_ac)) {
      if (F.kidWarm) { try { F.kidWarm(_ac); } catch (e) {} }   // and it jumps the queue
      F.onKidReady(function () {
        var fresh = buildActor(a, fit, paired, frozen, idx);
        if (el && el.parentNode) el.parentNode.replaceChild(fresh, el);
      }, _ac);
    }
    var isR = a.t === 'r';
    // The HEIGHT already had headroom; the WIDTH did not — it was a flat 116 for every
    // pilgrim, while a pilgrim's painted width grows with h (measured: ink ≈ 0.90·h).
    // So from about h=128 up, the cloak was wider than its own canvas and got sliced
    // straight down both sides — the "characters cut on the left and right". Scale the
    // width with h the way the height already scales. The figure is drawn at box.w/2 and
    // placed by its centre, so widening the box moves nothing; it only stops the clip.
    // Width has THREE constraints, and missing any one clips the figure:
    //   · a floor, for small actors
    //   · the body: painted ink runs about 0.90*h wide
    //   · the ARMS: armL/armR are absolute plate coords and can reach far outside the
    //     body — on candle the blue figure's hand is 79px from its centre, needing a
    //     192-wide box where the body alone would have asked for 169. That hand was
    //     still being cut after the body fix.
    var reach = 0;
    if (a.armL) reach = Math.max(reach, Math.abs(a.armL[0] - a.x));
    if (a.armR) reach = Math.max(reach, Math.abs(a.armR[0] - a.x));
    // …and the same for HEIGHT. A raised hand mapped into box coords landed 4px from
    // the top edge on candle, so the hand itself was sliced off. Clear the highest
    // hand the clamp will allow, plus room for the hand and whatever it holds.
    var up = 0;
    if (a.armL) up = Math.max(up, a.y - a.armL[1]);
    if (a.armR) up = Math.max(up, a.y - a.armR[1]);
    up = Math.min(up, a.h * (0.75 + ARM_MAX));              // the clamp caps how high a hand can go
    var box = { w: Math.max(isR ? 150 : 116, a.h * (isR ? 1.05 : 0.98) + (isR ? 16 : 14), reach * 2 + 34),
                h: Math.max(isR ? (a.h * 1.6) : Math.max(128, a.h + 28), up + 44) };
    var el = document.createElement('div');
    el.className = 'sc sc-actor' + (isR ? ' sc-radiant' : '') + (a.folk ? ' folk' : '') + (a.wings ? ' winged' : '') + (a.perch ? ' perch' : '')
                 + (a.buffet ? ' buffet' : '') + (a.tether ? ' tether' : '') + (a.shiver ? ' shiver' : '')
                 + (a.walk ? ' sc-walk' : '');
    if (a.tether) {
      // ⚠ HE DOES NOT TRAVEL AT ALL. Fred: "the protagonist is still jumpy instead of
      // just rotating on 1 axis in the back." Every version of this so far moved him —
      // first a buffet, then a hard step through the whip's positions, then a glide
      // through them. All of it was wrong for the same reason: THE CORD IS TAUT AND
      // PINNED AT BOTH ENDS. A body on a tight line does not wander; it turns on the
      // knot. So the translation is gone entirely — no keyframes, and the default bob
      // is switched off too, because a bob is just a small jump. What is left is one
      // rotation about one axis, which is all he was ever supposed to have.
      el.style.animation = 'none';
      // he rides the cord's own throw: dx = cos(beat*2pi)*amp, dy = sin(...)*amp*0.8,
      // which is exactly what drawTether() offsets its tip by on each of its six frames
      var _amp = a.tether.amp;
      if (_amp) {
        el.classList.add('whip');
        el.style.setProperty('--wd', (a.tether.period || 1.02) + 's');
        for (var _f = 0; _f < 6; _f++) {
          var _ph = ((_f + 1) / 6) * Math.PI * 2;
          el.style.setProperty('--w' + (_f + 1) + 'x', (Math.cos(_ph) * _amp * fit.s).toFixed(2) + 'px');
          el.style.setProperty('--w' + (_f + 1) + 'y', (Math.sin(_ph) * _amp * 0.8 * fit.s).toFixed(2) + 'px');
        }
      }
      if (a.tether.spin) {
        el.classList.add('spin');
        el.style.setProperty('--sd', a.tether.spin + 's');
        // ⚠ THE AXIS IS THE KNOT, AND THE KNOT IS A PLACE IN THE PAINTING — not a
        // percentage I guessed. `tie` carries the plate's own TIE constant (the point
        // where the painted string is fastened to his back), and it is converted here
        // using the SAME box and anchor `place()` uses, so if the box formula ever
        // changes the axis follows it instead of quietly sliding off his shoulders.
        // ⚠ THE AXIS IS A FACT ABOUT THE DRAWING, NOT A PLATE COORDINATE. Giving it in
        // plate space made the origin pinned to the world while the box moved under it —
        // two numbers fighting, and no value of either ever landed. Take it from where
        // drawKid actually puts him instead: feet at (box.h - 4), height a.h, so the small
        // of his back is 0.45h above his feet and his centre is the box's midline.
        // That makes his axis exactly (a.x, a.y - 0.45 * a.h) in plate space — which is
        // the number the cord's tie must carry, and it can now be stated rather than
        // guessed. Fred: the cord and the spin are two independent clocks (a polyrhythm),
        // so the tie MUST sit on the one point his rotation does not move.
        var _so = a.tether.knot
          || ('50% ' + ((((box.h - 4) - a.h * 0.45) / box.h) * 100).toFixed(2) + '%');
        el.style.setProperty('--so', _so);
      }
    }
    if (a.harp) el.classList.add('harper');
    if (a.trumpet) el.classList.add('herald');
    if (a.harp || a.trumpet) el.style.animationDelay = (((a.x || 0) % 7) * 0.31).toFixed(2) + 's';
    // a.tilt leans the whole figure. transform-origin is at the feet, so this reads as
    // the body inclining — an angel leaning IN toward the gate, not a tipped sticker.
    if (a.tilt) el.style.setProperty('--tilt', a.tilt + 'deg');
    // WAVERS: a free-standing pilgrim who greets the reader (not paired with the
    // Light, not back-turned, not wary, not already reaching with both hands).
    var waver = !isR && !a.back && !a.folk && !paired && !a.staff && a.mood !== 'wary' && a.mood !== 'dizzy' && !(a.armL && a.armR) && (a.stride || 0) <= 0.62;
    if (waver) {
      el.classList.add('waver');
      // THE SHEET, WITH A GUTTER. Two separate things used to break these frames:
      //  1. the waving arm reaches box.w*0.31 from centre PLUS stroke width, so on the
      //     wide poses it drew past its cell and into the next frame's — a fragment of
      //     another pose, visible beside the character. The per-frame clip stops that.
      //  2. the sheet is drawn at SS x and scaled down to fw CSS px, and the resampler
      //     FILTERS ACROSS the frame boundary — pulling the neighbouring pose in as a
      //     sliver no clip can prevent. Only empty space between frames fixes that, so
      //     each cell is followed by a transparent GUTTER the filter can sample instead.
      // The step is the full stride (content + gutter); the element stays box.w wide,
      // so the window shows exactly one cell's content and never part of two.
      // NOTE: --fw must stay an exact float. Rounding it to whole pixels makes the step
      // differ from the window width, which walks the sheet out of registration and
      // shows TWO characters at once.
      var GUT = 6;                                   // gutter, plate px
      var stride = box.w + GUT;
      var sheet = document.createElement('canvas');
      var SS = 2; sheet.width = stride * SHEET_K * SS; sheet.height = box.h * SS;
      var g = sheet.getContext('2d'); g.scale(SS, SS); g.imageSmoothingEnabled = true; try { g.imageSmoothingQuality = 'high'; } catch (e) { }   // crisp edges — see frameCanvas
      var drawFrame = function (i) {
        // each frame is rendered on its OWN canvas, then blitted into its cell — which
        // guarantees a frame can never bleed into its neighbour.
        var fc = frameCanvas(box.w, box.h, function (fg) {
          drawActorFrame(fg, a, box, false, i === 5 ? 1 : 0, waveTip(a, box, i));
          keyLight(fg, a, box, idx);          // the page's own light, on the figure standing in it
        });
        // ONE seed for every frame of the loop. A per-frame seed re-randomises the
        // grain 18 times a cycle and the texture crawls — paint that boils. The figure
        // moves; the paint it is made of should stay where it was laid.
        // (no post-process: the figure is PAINTED in character.js now — see 'THE CLOTH, PAINTED')
        g.drawImage(fc, i * stride, 0, box.w, box.h);
        fc.width = fc.height = 0;             // copied — give its memory back now, not at the next GC (iOS)
      };
      var sh = document.createElement('div'); sh.className = 'sc-sheet';
      // ⭐ IN SLICES (Oct 8, "lighten page 23"). Eighteen frames of a big figure drawn in one go held the main thread
      // ~1.7 s on a slow phone (4× CPU) the moment `hands` opened — the swipe itself froze. Now a few frames per
      // ~12 ms slice, yielding between, so the painting arrives at once and the figure fills in a beat later.
      // Same frames, same pixels. A layer freed mid-build (sh.__dead) stops and gives the canvas back.
      var fi = 0;
      (function slice() {
        if (sh.__dead) { sheet.width = sheet.height = 0; return; }
        var t0 = performance.now();
        do { drawFrame(fi++); } while (fi < SHEET_K && performance.now() - t0 < 12);
        if (fi < SHEET_K) setTimeout(slice, 0);
        else sheetBg(sheet, sh, function (u) { sh.style.backgroundImage = 'url(' + u + ')'; });
      })();
      var strideCss = stride * fit.s;
      sh.style.setProperty('--fw', strideCss + 'px');
      sh.style.backgroundSize = (strideCss * SHEET_K) + 'px 100%';
      sh.addEventListener('animationend', function () { sh.classList.remove('tapwave'); });   // fast wave over → back to the slow idle loop
      el.appendChild(sh);
      el.__sheet = sh;
    } else {
      // ⚠ RASTERISE HIM AT THE RESOLUTION THE SCREEN ACTUALLY SHOWS. The frame is built
      // in PLATE units at SS px each, but it is displayed at fit.s CSS px per unit and
      // then again by the device pixel ratio. On a phone that is ~3.9 px per unit against
      // a frame drawn at 3 — so every actor was being upscaled ~30%, which is most of the
      // softness on his line. Ask for what the screen needs, capped so a big actor on a
      // crowded page cannot blow up the frame.
      var SSa = Math.max(3, Math.min(4.5, fit.s * (window.devicePixelRatio || 1)));
      var mk = function (lid, smile) {
        var fc = frameCanvas(box.w, box.h, function (g) {
          drawActorFrame(g, a, box, isR, lid, null, smile, idx);
          keyLight(g, a, box, idx);           // ⭐ the page's own light, with a direction — see KEYLIGHT
          applyGrade(g, box.w, box.h, idx);   // ⚠ and the page's own ambient, so he is lit by it
          // ⚠ and the page's own SURFACE. Grade alone left him a smooth decal on an
          // impasto painting — see paintIn(). Radiant figures keep their clean glow.
          // ⚠⚠ NOT ON FRED'S OWN CELLS. This is THE FILTER he kept pointing at: "the friends
          // of the protagonist seems to have some sort of filter", "you see the hoodie? it
          // looks like it has texture right? the new one does not have that." paintIn rakes
          // the page's own tooth across the WHOLE sprite at a fixed -0.62 rad, which is why
          // the streaks ran over cloth and bare knees alike at one angle, and why nothing I
          // did inside character.js could remove them — they are painted on afterwards, here.
          //   It was added so a smooth sprite would not sit ON the picture like a decal, and
          // for a figure this engine DRAWS that is still right. But his cells are finished
          // artwork: they arrive with their own surface, and raking ours over the top is
          // exactly the "filter" that made his friends disagree with the sprite he drew.
          // Painted figures keep it; his drawings are left alone.
          if (!isR && !a.__isCell) paintIn(g, box.w, box.h, ((a.x | 0) * 7 + (a.h | 0) * 13 + idx * 101) | 0, 1, AMBIENT[idx]);
        }, SSa);
        // (no post-process: the figure is PAINTED in character.js now — see 'THE CLOTH, PAINTED')
        return fc;
      };
      var open = mk(0, false); open.className = 'open'; el.appendChild(open);
      if (!isR && !a.back) { var shut = mk(1, false); shut.className = 'shut'; el.appendChild(shut); el.classList.add('blinkable'); }
      if (isR && !a.back) { var glad = mk(0, true); glad.className = 'glad'; el.appendChild(glad); el.__glad = true; }   // her smiling face, swapped in on tap
      // back-turned/Radiant actors have NO shut frame — must NOT be class-blinked
      // (that hid their only sprite → the whole figure flickered on the city page)
    }
    place(el, fit, a.x, a.y, box.w, box.h, (box.h - 4) / box.h);
    el.style.pointerEvents = 'none';        // the figure lives on its own; it is not a button
    return el;
  }

  function buildSway(spec, kind, fit, idx) {
    // trees / bushes / crowns / flowers — one frame, swaying about the root
    var w, h, el = document.createElement('div');
    el.className = 'sc ' + (kind === 'flower' ? 'sc-nod' : 'sc-sway');
    // boxes must hold the FULL drawing incl. outline ink — an undersized canvas
    // crops the side/top bumps flat ("the bush looks like a square thing").
    if (kind === 'tree') { w = spec.w * 2.6; h = spec.h * 1.35; }
    else if (kind === 'crown') { w = spec.cw * 2.2; h = spec.ch * 3.0; }
    else if (kind === 'flower') { w = 30; h = spec.h * 1.75; }
    else { w = spec.w * 2.6; h = spec.h * 1.6 + spec.w * 0.6 + 8; }
    var c = frameCanvas(w, h, function (g) {
      var p = {}; for (var k in spec) p[k] = spec[k];
      p.idx = idx;   // the page this thing grows on — its place in the snowflake chain
      if (kind === 'crown') { p.cx = w / 2; p.cy = h * 0.42; }
      else { p.x = w / 2; p.y = h - 2; }
      var t0 = 1.7;   // a pleasant frozen phase
      ({ tree: F.drawTree, bush: F.drawBush, crown: F.drawCrown, flower: F.drawFlower, spout: F.drawSpout })[kind](g, p, t0);
      applyGrade(g, w, h, idx);
    });
    // Foliage is left alone: it is already broken colour. (A stroke pass over a
    // fruit-laden canopy smeared the bright fruit across the whole tree — candy.)
    el.appendChild(c);
    el.style.pointerEvents = 'none';
    var ax = kind === 'crown' ? spec.cx : spec.x, ay = kind === 'crown' ? spec.cy : spec.y;
    place(el, fit, ax, ay, w, h, kind === 'crown' ? 0.42 : 1);
    el.style.animationDuration = (3.2 + ((spec.phase || 0) % 2)) + 's';
    el.style.animationDelay = (-(spec.phase || 0)) + 's';
    return el;
  }

  function buildBird(b, fit, idx) {
    var el = document.createElement('div');
    el.className = 'sc sc-bird';
    var s = 16 * (b.s || 1);
    // two flap frames side by side, as a background sprite sheet
    var sheet = frameCanvas(s * 2, s, function (g) {
      // two clear poses: wings UP then wings DOWN — a real flap
      F.drawBird(g, { x: s / 2, y: s * 0.56, s: (b.s || 1) * 0.85, col: b.col || '#2a2a55', v: 0, range: 0, flapAmt: 5.5 }, 0);
      F.drawBird(g, { x: s * 1.5, y: s * 0.46, s: (b.s || 1) * 0.85, col: b.col || '#2a2a55', v: 0, range: 0, flapAmt: -2.2 }, 0);
      applyGrade(g, s * 2, s, idx);
    });
    el.style.width = s * fit.s + 'px'; el.style.height = s * fit.s + 'px';
    el.style.background = 'url(' + sheet.toDataURL() + ') 0 0/200% 100%';
    var r = (b.range || 100) * fit.s;
    var cx = fit.x(b.x), cy = fit.y(b.y);
    el.style.offsetPath = 'path("M 0 0 C ' + (r * 0.6) + ' ' + (-r * 0.22) + ', ' + (r * 1.4) + ' ' + (r * 0.16) + ', ' + (r * 2) + ' 0 C ' + (r * 1.4) + ' ' + (r * 0.3) + ', ' + (r * 0.6) + ' ' + (-r * 0.1) + ', 0 0")';
    el.style.left = (cx - r) + 'px'; el.style.top = cy + 'px';
    el.style.animationDuration = (26 / (b.v || 0.08) / 10) + 's,0.34s';
    el.style.animationDelay = (-(b.phase || 0) * 3) + 's,0s';
    return el;
  }

  function buildSheep(sp, fit, idx) {
    var el = document.createElement('div'); el.className = 'sc sc-sheep';
    var s = sp.s || 1, W = 54 * s, H = 42 * s;
    var c = frameCanvas(W, H, function (g) {
      var p = {}; for (var k in sp) p[k] = sp[k];
      p.x = W / 2; p.y = H - 3;
      F.drawSheep(g, p);
      applyGrade(g, W, H, idx);
    });
    el.appendChild(c);
    el.style.touchAction = 'manipulation';
    el.style.pointerEvents = 'none';
    place(el, fit, sp.x, sp.y, W, H, (H - 3) / H);
    el.style.animationDelay = (-(sp.phase || 0)) + 's';
    return el;
  }
  var CRITTER_STYLE = {   // per-type: sprite class (+ grade / other drawing flags). The tap gestures were removed Sep 25.
    worm:    { cls: 'sc-critter' },
    mole:    { cls: 'sc-critter' },
    beetle:  { cls: 'sc-critter' },
    firefly: { cls: 'sc-fly', grade: false },
    fish:    { cls: 'sc-fish' },
    tadpole: { cls: 'sc-fish' },
    butterfly: { cls: 'sc-flit' },
    bee: { cls: 'sc-flit' },
    snail: { cls: 'sc-critter' },
    bird: { cls: 'sc-flit' },              // hops/flaps
    rabbit: { cls: 'sc-critter' },   // 'hop' → the default translateY jump gesture
    ladybug: { cls: 'sc-critter' },
    dragonfly: { cls: 'sc-flit' },
    fire: { cls: 'sc-fire', grade: false },   // the fire IS the light — the page grade must not touch it
    tree: { cls: 'sc-fire', grade: false },   // a tree does not drift; its life is all in the sway
    // ⚠ tree2 WAS MISSING HERE and fell through to `worm`, whose class is sc-critter — a
    // 7-degree wobble about the box CENTRE, running on every broadleaf in the book. That
    // is the twitch Fred saw, and the reason the trunks swung off their own ground: a
    // rotation about the centre moves the foot as much as the crown. A tree's life is the
    // sway that is DRAWN into its frames, where the foot is pinned by construction.
    tree2: { cls: 'sc-fire', grade: false },
    swimmer: { cls: 'sc-fish' },
    fish2: { cls: 'sc-fish' },
    whale: { cls: 'sc-fish' },
    sunrays: { cls: 'sc-fire', grade: false },
    sky: { cls: 'sc-fire', grade: false },
    stars: { cls: 'sc-fire', grade: false },
    grass: { cls: 'sc-fire', grade: false },
  };
  // A SWARM. Fred: "if you make the butterflies really tiny you can add like 50 of
  // them and the picture would be alive!" One entry with {n, band} expands into n
  // instances scattered through the band, each its own size, colour and phase — so a
  // page can hold forty butterflies without forty hand-written lines. Bands are
  // authored ABOVE the poem and inside the portrait window; nothing lands on a figure.
  function expandCritters(list, idx) {
    var out = [];
    (list || []).forEach(function (spec, si) {
      // ⚠ A SWARM IS {n, band} — BOTH. `n` means two different things in this table:
      // for a swarm it is HOW MANY INSTANCES to scatter; for a full-frame layer
      // (sky/stars/grass) it is HOW MANY MARKS that ONE sprite paints. Checking only
      // `n` made a sky with n:260 expand as a 260-instance swarm, dereference a `band`
      // it does not have, and throw — which killed the WHOLE critter list for the page,
      // fire and cypress and child included. A real bug regardless of the ambience
      // work; keep this check.
      if (!spec.n || !spec.band) { out.push(spec); return; }
      var b = spec.band, seed = ((idx + 1) * 7919 + si * 104729) & 0x7fffffff;
      var rn = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      var cols = spec.cols || ['gold', 'blue', 'green', null];
      for (var i = 0; i < spec.n; i++) {
        var u = rn(), v = rn();
        // bias upward: more of them high in the band, thinning toward the ground
        out.push({
          type: spec.type,
          x: b[0] + u * (b[2] - b[0]),
          y: b[1] + Math.pow(v, 0.7) * (b[3] - b[1]),
          s: spec.s * (0.68 + rn() * 0.7),
          col: cols[(rn() * cols.length) | 0],
          facing: rn() < 0.5 ? 1 : -1,
          phase: rn() * 3.2,
          quiet: true,                       // swarm members are scenery, not tap-toys
        });
      }
    });
    return out;
  }

  // ?boxes=1 outlines every runtime sprite's canvas box. Three "measured" fixes to the
  // tree's box have not stopped the crown being cut, which means the box may not be
  // what is cutting it — and I cannot see the desktop view to tell. With this on, one
  // screenshot settles it: if the crown stops INSIDE its outline the box is innocent
  // and something else clips it; if it stops AT the outline the box is still too small.
  var SHOWBOX = /[?&]boxes=1/.test(location.search);
  // ?pan=-1..1 pins the tilt. There is no gyro in the simulator, so without this the
  // only frame I can ever see is the resting one — anything the pan reveals (and
  // whether the sprites stay registered to the painting while it moves) was untestable.
  var FORCEPAN = /[?&]pan=(-?[0-9.]+)/.exec(location.search);
  // ⚠ THE OVERLAY MUST BE MADE OF THE PAINTING. Sample the plate itself over the
  // sprite's rect and hand the colours to the draw — the same trick seatActors uses to
  // find the ground under a figure's feet. Without this, one authored palette would
  // suit one plate and lie on the other thirty.
  var _plateImg = null;                                  // set per page before the critters build
  function samplePalette(img, rx, ry, rw, rh) {
    if (!img || !img.naturalWidth) return null;
    try {
      var kx = img.naturalWidth / 800, ky = img.naturalHeight / 500;
      var tc = document.createElement('canvas'); tc.width = 12; tc.height = 8;
      var tg = tc.getContext('2d', { willReadFrequently: true });
      tg.drawImage(img, rx * kx, ry * ky, rw * kx, rh * ky, 0, 0, 12, 8);
      var d = tg.getImageData(0, 0, 12, 8).data, out = [];
      for (var i = 0; i < 96; i += 7) {
        var pi = i * 4;
        if (d[pi + 3] > 60) out.push([d[pi], d[pi + 1], d[pi + 2]]);
      }
      return out.length >= 4 ? out : null;
    } catch (e) { return null; }                          // a tainted or unloaded image just falls back
  }

  // ---- ONE WIND PER PAGE (Fred, Aug 2026) ----
  // "in the garden page, all the animations are intentional. it shows the movement of
  //  fire, how wind interacts with the scene, etc." That is the whole difference, and
  //  it is structural, not decorative: in the garden everything answers the SAME air.
  //  Everywhere else each sprite carried its own random `phase`, so things moved but
  //  nothing agreed — which is exactly what reads as mindless.
  //
  //  So a page gets ONE wind, and every wind-driven thing derives its timing from it:
  //   · the same period, so the whole scene breathes together;
  //   · a delay set by WHERE the thing stands, so a gust TRAVELS across the page
  //     instead of striking everything at once;
  //   · the same direction, which the sky drifts along too — the clearest cue of all
  //     that one air is moving through one place.
  //
  //  And the wind suits the page, because weather is story: the storm is fast and hard,
  //  the candle and the grave are nearly still (a candle in a gale is a lie), the garden
  //  is quiet night air drawn toward the fire, the homecoming pages are alive with it.
  //  `dir` -1 blows left, +1 blows right.
  var WIND = {
    0:  { period: 30,  gust: 0.30, dir:  1 },  // cover — the galaxy turning
    1:  { period: 17,  gust: 0.55, dir:  1 },  // in the beginning — light still spreading outward
    2:  { period: 7.0, gust: 0.85, dir:  1 },  // he made the world — a bright open morning
    3:  { period: 14,  gust: 0.45, dir:  1 },  // made to shine — night, the beam falling
    4:  { period: 9.0, gust: 0.60, dir: -1 },  // what was He like — the great swirl turns left
    5:  { period: 11,  gust: 0.55, dir:  1 },  // but you turned away
    6:  { period: 7.5, gust: 0.55, dir: -1 },  // THE GARDEN — still night air, drawn to the fire
    7:  { period: 18,  gust: 0.30, dir: -1 },  // lost — the air goes dead down here
    8:  { period: 12,  gust: 0.40, dir: -1 },  // but you let go
    9:  { period: 8.5, gust: 0.75, dir:  1 },  // love came looking
    10: { period: 9.5, gust: 0.60, dir: -1 },  // now you wanted home — night, walking into it
    11: { period: 8.0, gust: 0.70, dir:  1 },  // the bridge
    12: { period: 20,  gust: 0.22, dir:  1 },  // it cost everything — Golgotha: the air stops
    13: { period: 22,  gust: 0.20, dir:  1 },  // three days — the grave is still
    14: { period: 6.5, gust: 0.95, dir:  1 },  // he is risen — the air moves again
    15: { period: 6.0, gust: 1.05, dir: -1 },  // he ran — the wind of running home
    16: { period: 7.0, gust: 0.80, dir:  1 },  // the way home stood open
    17: { period: 8.0, gust: 0.70, dir:  1 },  // carried home
    18: { period: 9.0, gust: 0.55, dir:  1 },  // washed white
    19: { period: 7.5, gust: 0.75, dir:  1 },  // born again — a soft dawn
    20: { period: 7.0, gust: 0.85, dir:  1 },  // seeds — wind is how a seed travels
    21: { period: 8.5, gust: 0.65, dir:  1 },  // he feeds you
    22: { period: 4.2, gust: 1.70, dir: -1 },  // STORMS STILL CAME — hard and fast, and it must be FELT
    23: { period: 9.0, gust: 0.55, dir:  1 },  // you were not alone
    24: { period: 7.8, gust: 0.80, dir:  1 },  // the family — an easy afternoon breeze
    25: { period: 19,  gust: 0.25, dir: -1 },  // when the dark came close — held breath
    26: { period: 10,  gust: 0.50, dir:  1 },  // he is the light
    27: { period: 8.0, gust: 0.65, dir:  1 },  // come
    28: { period: 9.5, gust: 0.60, dir:  1 },  // side by side
    29: { period: 21,  gust: 0.18, dir:  1 },  // go and shine — ⚠ still air: a candle needs it
    30: { period: 9.0, gust: 0.55, dir:  1 },  // he is coming
    31: { period: 8.5, gust: 0.60, dir:  1 },  // no more night
    32: { period: 30,  gust: 0.30, dir:  1 },  // back cover
  };
  function windOf(idx) { return WIND[idx] || { period: 7.2, gust: 0.70, dir: 1 }; }
  function windDriven(t) { return t === 'tree' || t === 'tree2' || t === 'grass' || t === 'sky'; }

  // ---- EVERY PAGE GETS A SKY (Fred, Aug 2026) ----
  // "you are just adding bunnies... if there are nothing to animate try animating the
  //  sky." The sky is the largest thing on nearly every plate and it was the one thing
  //  never moving. It is granted here rather than authored into 33 arrays, so no page
  //  can be forgotten — and because the colours are sampled from each plate at runtime,
  //  one rule fits a cobalt night and a peach dawn alike.
  //  · landscape pages: the band above the horizon.
  //  · ABSTRACT pages (a swirling field, no horizon, nothing else to animate) get a
  //    much taller box — on those plates the whole painting is sky, and this is the
  //    only life they will ever have.
  //  · ⚠ the two covers are left out on purpose: they are the 4K galaxy plates, and
  //    that page has a history of iOS memory crashes. Revisit deliberately, not by
  //    sweeping them into a default.
  var SKY_ABSTRACT = { 1: 1, 3: 1, 5: 1, 7: 1, 8: 1, 13: 1, 26: 1, 28: 1 };
  var SKY_OFF = { 0: 1, 32: 1 };
  function skySpec(idx) {
    if (SKY_OFF[idx]) return null;
    var tall = SKY_ABSTRACT[idx];
    var w = windOf(idx);
    return { type: 'sky', x: 0, y: 0, w: 800, h: tall ? 430 : 300,
             n: tall ? 190 : 150, seed: 13 + idx * 7, dir: w.dir, gust: w.gust };
  }

    // ---- WHAT IS IN THE AIR ON EACH PAGE (Fred, Aug 2026: "make all the other pages
    // alive as well. i give you creative freedom") ----
    // The gust primitive is not really "leaves" — it is DRIFTING MATTER, and what the
    // matter IS decides everything: colour, direction, size, how much. So each page gets
    // what its own sentence says is in its air. Nothing is sprinkled for decoration; if
    // a page's line does not imply anything moving through it, it gets nothing.
    //   dir: radians — 0 right, PI left, -PI/2 up, PI/2 down.
    var PETAL  = [[236,196,214],[246,214,226],[228,180,200],[250,236,240]];
    var BLOSSOM= [[248,222,196],[240,200,180],[252,238,220],[236,206,190]];
    var LEAF   = [[36,68,40],[52,92,48],[86,112,44],[124,116,52],[150,96,44]];
    var GOLD   = [[250,224,150],[255,240,200],[236,198,120]];
    var PALE   = [[236,244,255],[255,255,255],[214,228,246]];
    var ASH    = [[70,66,64],[96,92,88],[54,52,52]];
    var SEED   = [[240,238,222],[224,220,200],[252,250,240]];
    var TORN   = [[40,38,56],[62,58,78],[28,26,40]];
    // ⚠ EVERY BOX IS h<=300 ON PURPOSE. A full-width gust at the small-sprite
    // supersample costs 25 Mpx; even at the ambient SS 1.5 the tallest sheet that fits
    // under the 3.6 Mpx cap with six frames is h=333. Authored to fit, rather than left
    // for the guard to trim into a stutter.
    // ---- ⚠ ONLY WHERE MOVING MATTER IS THE PAGE'S OWN IDEA (Fred, Aug 2026) ----
    // "only put the gust on the pages that needed gust. be mindful." I had a primitive
    // and used it on 25 pages, which was the same mistake twice over: the repetition he
    // had already objected to, AND the crash — 13 MB of sheet on 25 pages.
    // Six survive, and each is a page whose own sentence IS the moving thing:
    //   5  turning — what you let go of, carried off behind you
    //   12 paid    — Golgotha: ash falling, and nothing else
    //   14 risen   — "the grave could not hold the Light": the air comes alive
    //   18 washed  — "white as snow", which is snow, which falls
    //   20 seeds   — seed on the wind, because that is HOW a seed travels
    //   29 candle  — embers off the flame the page is about
    // Blossom, petals and pollen on the pretty pages were decoration. They are gone.
    var GUST = {




      // ⚠ REMOVED (Fred: "the leaf storm thing is still there"). Thirty torn dark motes
      // streaming across the turning — it was the page's sentence made into weather, and
      // it is the thing he kept seeing after every plate edit, because it was never IN the
      // plate: a runtime gust cannot be removed by repainting. The page does not need
      // weather; it needs the hinge.
      // ⚠ NO AIR ON THIS PAGE. "He came looking. You hid." — a held breath. A child hiding in shame while the
      // Light walks the garden calling. Leaves tearing past make it weather; it is not
      // weather, it is Genesis 3:9. Fred caught this: "the gust of wind does not fit in
      // garden. please check the story before adding assets!"




      // "It cost the Light everything" — Golgotha: ash falling, and nothing else
      12: { y: 160, h: 300, n: 16, dir: 1.42, span: 700, scale: 0.7, cols: ASH },
      // ⚠ NO AIR ON THIS PAGE. "They laid Him in the dark, and waited." A sealed grave should be ABSOLUTELY
      // still — for three days nothing moves. Drifting dust is atmosphere; its absence
      // is the point.

      // "The grave could not hold the Light" — THE AIR COMES ALIVE, everything rising
      14: { y: 140, h: 300, n: 40, dir: -1.5, span: 980, scale: 1.0, cols: GOLD },



      // "Your stains washed white as snow" — white falling, and it is snow
      18: { y: 160, h: 300, n: 34, dir: 1.62, span: 900, scale: 0.8, cols: PALE },

      // "Whatever the child planted, grew" — seed on the wind, which is how a seed travels
      20: { y: 160, h: 300, n: 30, dir: 0.24, span: 940, scale: 0.85, cols: SEED },



      // ⚠ NO AIR ON THIS PAGE. "Sometimes the answer is 'I am here'." The dark has come close and a child is
      // praying. The stillness IS the answer being given.


      // ⚠ NO GUST HERE, DELIBERATELY. "Whosoever will — come" wants an invitation, not more of the same gold motes
      // that 28 and 31 already have. Cleared until it has its OWN idea.

      // ⚠ NO GUST HERE, DELIBERATELY. "He lets you help bring others home" — the same. Cleared rather than repeated.

      // "You are the light of the world now — go and shine" — embers off the flame, rising
      29: { y: 140, h: 300, n: 22, dir: -1.45, span: 820, scale: 0.7, cols: GOLD },


    };
    function gustSpec(idx) {
      var g = GUST[idx]; if (!g) return null;
      return { type: 'leaves', x: 0, y: g.y, w: 800, h: g.h, n: g.n, seed: 17 + idx * 5,
               dir: g.dir, span: g.span, scale: g.scale, cols: g.cols };
    }

  // 60 MB of SPRITE SHEETS per page. The garden's whole cast — fire, two trees, the
  // creatures, the road's gleam — is about 32 MB, so this refuses a runaway without ever
  // touching what the book actually uses. (Plane memory is handled structurally: the boil
  // runs on the backmost plane only.)
  var PAGE_BUDGET = 60e6, _pageBudget = 0;
  function AMBIENT_T(t) { return t === 'sky' || t === 'stars' || t === 'grass'; }
  function buildCritter(spec, fit, idx) {
    var _wind = windOf(idx);
    var draw = { fire: F.drawBonfire, tree: F.drawCypress, tree2: F.drawBroadleaf, tether: F.drawTether, leaves: F.drawLeafGust, ripple: F.drawRipple, spine: F.drawSpine, starburst: F.drawStarburst, firstlight: F.drawFirstLight, swimmer: F.drawSwimmer, fish2: F.drawCuteFish, whale: F.drawWhale, sunrays: F.drawSunSpiral, bough: F.drawBough, sky: F.drawSkyDrift, stars: F.drawCrossStars, grass: F.drawGrass, worm: F.drawWorm, mole: F.drawMole, beetle: F.drawBeetle, firefly: F.drawFirefly, fish: F.drawFish, tadpole: F.drawTadpole, butterfly: F.drawButterfly, bee: F.drawBee, snail: F.drawSnail, bird: F.drawBirdie, rabbit: F.drawRabbit, ladybug: F.drawLadybug, dragonfly: F.drawDragonfly }[spec.type];
    var st = CRITTER_STYLE[spec.type] || CRITTER_STYLE.worm;
    var el = document.createElement('div'); el.className = 'sc ' + st.cls;
    if (spec.type === 'tether' && spec.tie) { el.classList.add('sc-cord'); el.__tie = spec.tie; }
    if (!draw) return el;
    // ⚠ ONE box for every critter CUT THE RABBIT'S EARS OFF: they reach 23*s above
    // its centre and the drawn scale is s*1.35, so the ear tip landed 6px ABOVE the
    // canvas top (Fred saw it on `ran`). Tall creatures get a taller box and a lower
    // origin. Measure the drawing's real extent, don't assume one box fits all.
    var BOX = { rabbit: [64, 80, 0.68], bird: [66, 54, 0.56], snail: [70, 50, 0.54] };
    var bx2 = BOX[spec.type] || [64, 48, 0.52];
    var s = spec.s || 1, W = bx2[0] * s, H = bx2[1] * s;
    // A FIRE is authored in plate pixels (it has to match the light the plate was
    // painted with), not scaled off the generic critter box.
        if (spec.type === 'fire') { W = spec.w * 2.0; H = spec.h * 1.30; bx2 = [0, 0, 0.90]; }
    // ⚠ MEASURED box, not guessed. A cypress needs room for THREE things past its
    // trunk: the silhouette's widest point (~1.0*w), the sway (resting lean 0.16w plus
    // a full gust 0.30w) and HALF A STROKE beyond that (marks are centred on the edge,
    // so they hang over it). At 3.6*w the box gave +/-61 where w=34 needs +/-66 — every
    // tree was clipped down both flanks and across the crown. 4.6*w clears it.
    // ⚠ HEADROOM, measured. At 1.22h/0.90 the crown's longest stroke ended 2px from the
    // canvas top — which is a CUT once antialiasing and DPR rounding are counted, and
    // Fred saw exactly that. 1.60h/0.78 leaves 30px. A sprite box must never be a
    // marginal fit: the drawing has to sit comfortably inside it.
    // ⚠ DELIBERATELY OVERSIZED. Two measured "fixes" both still cut the crown, so stop
    // trimming to a calculation and give the drawing far more canvas than it can
    // possibly need: the tree occupies the lower ~45% of its box and has the whole
    // upper half spare. The canvas is transparent, so extra box costs nothing but a
    // little memory — a cut crown costs the picture.
    // Sized against the real drawing (see the w/h fix below): widest half-profile is
    // ~1.02*w, plus resting lean 0.16w and a full gust 0.30w -> 1.5w each side; 4.6w
    // leaves half the width spare. Vertically the tree stands at 0.78 of the box, so it
    // gets 0.92h of headroom for a crown 1.0h tall plus its ~0.15h of tips — a generous
    // margin, not a marginal fit.
    if (spec.type === 'tree') { W = spec.w * 4.6; H = spec.h * 1.70; bx2 = [0, 0, 0.78]; }
    // a broadleaf is nearly as wide as it is tall, so its `w` is already the crown's
    // reach — it needs less box multiple than the cypress, not more.
    if (spec.type === 'tree2') { W = spec.w * 3.6; H = spec.h * 1.70; bx2 = [0, 0, 0.80]; }
    // ⚠ A GIANT IS NOT A SAPLING SCALED UP — its BOX has to be re-reasoned. The 3.6x
    // width margin exists so a 30-unit crown has room to sway; on a 330-unit crown it
    // asks for a 1188x918 canvas per frame, which the area guard answers by cutting the
    // sheet down to two frames (or dropping it). A big crown sways a smaller FRACTION of
    // itself, so it needs far less margin: 1.28x and 1.16x, which keeps the sheet inside
    // the caps and the sway inside the box.
    if (spec.type === 'tree2' && spec.w >= 120) { W = spec.w * 1.28; H = spec.h * 1.16; bx2 = [0, 0, 0.88]; }
    // sky / stars / grass are authored as plain plate-space rectangles: the draw fills
    // the box from its own (0,0), so the box IS the region.
    if (spec.type === 'sky' || spec.type === 'stars' || spec.type === 'grass' || spec.type === 'tether' || spec.type === 'leaves' || spec.type === 'ripple' || spec.type === 'spine' || spec.type === 'starburst' || spec.type === 'firstlight' || spec.type === 'swimmer' || spec.type === 'fish2' || spec.type === 'whale' || spec.type === 'sunrays' || spec.type === 'bough') { W = spec.w; H = spec.h; bx2 = [0, 0, 0]; }
    // ---- A FRAME SHEET, NOT A TRANSFORM ----
    // Fred: "you can play with it by rotating the image but it does not solve
    // anything." Correct — so a butterfly is DRAWN N times from its rig, each frame a
    // genuinely different shape (the wings foreshorten as the dihedral swings), and
    // the sheet is stepped through. The silhouette changes; that is what reads as life.
    // Each individual also gets its OWN camera elevation and heading, so a swarm holds
    // butterflies seen from overhead, from the side, and every angle between — which
    // is the thing one drawing could never give us however it was rotated.
    // FRAMES + TEMPO per creature. Each animal has its OWN kind of life:
    //   butterfly — a continuous wing cycle, fast
    //   bird      — mostly STILL, then a tail flick and a glance (slow, many frames)
    //   rabbit    — stiller still: it listens, one ear swivels, it dips to nibble
    //   bee       — wings blurring, body banking into its turns (very fast)
    // Uniform steps() gives "hold, then twitch" for free when the quiet part of the
    // cycle occupies most of the frames — which is exactly how a real animal reads.
    // ⚠ A TYPE WITH NO ENTRY HERE IS DRAWN ONCE AND NEVER MOVES. `NF = FRAMES[type] || 0`
    // and everything downstream — TEMPO, the beat handed to the draw fn, the sheet itself —
    // is inside `if (NF)`. So a rig can be written, registered, given a tempo, placed on a
    // page and STILL be a still picture, with nothing anywhere reporting a problem.
    // `starburst` was in exactly that state: written to breathe, given a 3.4s tempo, and
    // silently frozen. That is a large part of why this page read as dead.
    var FRAMES = { starburst: 6, firstlight: 6, swimmer: 8, fish2: 8, whale: 6, sunrays: 8, bough: 5, tether: 6, leaves: 4, ripple: 5, spine: 6, butterfly: 6, bird: 10, rabbit: 10, bee: 4, fire: 16, tree: 12, tree2: 12, sky: 6, stars: 8, grass: 10 };   // stars can afford frames now: 11 glints, not 46 dots   // sky/stars run FEW frames on purpose — they are the slowest things on the page, so a step is nearly imperceptible
    // ---- THE TEMPO LADDER (Fred, Aug 2026) ----
    // "you can make the sky animate very slow, the fire fast, the trees slow, the
    //  grass slower, etc, etc"
    // This is the rule that makes a whole scene feel alive rather than busy: every
    // element moves at ITS OWN natural rate, and the spread between them is what the
    // eye reads as a living world. One shared rate would read as a machine.
    //   bee wings   0.17s   — a blur
    //   fire        1.05s   — flicker (16 frames -> 65ms each)
    //   butterfly   0.44s   — a wingbeat
    //   bird        2.6s    — stillness, then a flick
    //   rabbit      3.4s    — stiller: it listens, then one ear turns
    //   tree        7.5s    — a slow lean and recover
    //   grass      11s      — slower still (not built yet)
    //   sky        24s      — barely perceptible; you notice it only if you wait
    // ⚠ FIRE at 0.62s, not 1.05 (Fred: "make the fire faster"). A fire's tongues
    // collapse and leap; at 1.05s it was smouldering rather than burning.
    var TEMPO_PAGE = { 2: { tree2: [26, 0.0] }, 8: { bird: [0.34, 0.10] }, 22: { bird: [0.40, 0.12] } };
    var TEMPO  = { tether: [1.02, 0.0], leaves: [1.30, 0.0], ripple: [2.60, 0.0], spine: [4.20, 0.0], starburst: [3.40, 0.0], firstlight: [5.20, 0.0], swimmer: [2.30, 0.0], fish2: [1.05, 0.0], whale: [6.5, 0.0], sunrays: [9.0, 0.0], bough: [24, 0.0], butterfly: [0.44, 0.30], bird: [2.6, 1.4], rabbit: [3.4, 1.8], bee: [0.17, 0.06], fire: [0.62, 0.0], tree: [7.5, 0.0], tree2: [6.2, 0.0], grass: [11, 0.0], sky: [24, 0.0], stars: [9.0, 0.0] };
    var NF = FRAMES[spec.type] || 0;
    // a 26-second lean does not need twelve drawings; five is plenty, and five is what
    // keeps four giant crowns inside the page's memory budget
    if (spec.type === 'tree2' && spec.w >= 120) NF = 5;
    var c;
    if (NF) {
      var isFly = spec.type === 'butterfly';
      var vw = !isFly ? 1 : (spec.view == null ? (0.15 + ((spec.phase || 0) * 0.37 % 1) * 0.85) : spec.view);
      var hd = !isFly ? 0 : (spec.head == null ? (((spec.phase || 0) * 1.7 % 1) - 0.5) * 0.9 : spec.head);
      // ⚠ CANVAS LIMIT. A frame sheet is W*NF*SS pixels wide, and Safari refuses
      // anything past ~16384 — it hands back a broken canvas with no error, and every
      // sprite built after it dies too (this silently emptied the whole garden once:
      // 820 plate px x 12 frames x SS3 = 29,520). Full-width layers therefore drop to
      // SS 1.5, and if the sheet would STILL overflow, frames are traded away until it
      // fits. Better a slightly choppier sky than a blank page.
      // ---- THE SHEET BUDGET ----
      // Fred: "what if the sky only have like 2 frames instead of a lot of frames? so
      // we cap the frames to make it work with our constraint." Exactly right, and the
      // pairing that makes it affordable is DROPPING THE SUPERSAMPLE on the big painted
      // layers: fire and tree are brush-marks, not fine detail, so SS 3 -> 2 costs
      // almost nothing to look at and more than halves their memory (fire 30 -> 13 MB,
      // tree 26 -> 12 MB). That freed budget is what lets the ambience exist at all.
      // Page total is now ~37 MB, against the ~110 MB that made iOS purge the canvases
      // and silently kill every sprite built afterwards.
      //   fire/tree      SS 2   — big, painted, close-up
      //   sky/stars/grass SS 1.5 — full-frame and soft; nobody reads their edges
      //   everything else SS 3   — small sprites, worth the crispness
      var _pal = AMBIENT_T(spec.type) ? samplePalette(_plateImg, spec.x, spec.y, spec.w, spec.h) : null;
      var AMB = (spec.type === 'sky' || spec.type === 'stars' || spec.type === 'grass' || spec.type === 'tether' || spec.type === 'leaves' || spec.type === 'ripple' || spec.type === 'spine' || spec.type === 'starburst' || spec.type === 'firstlight' || spec.type === 'swimmer' || spec.type === 'fish2' || spec.type === 'whale' || spec.type === 'sunrays' || spec.type === 'bough');
      // ⚠ THE SOFT LAYERS DROP TO SS 1. Fred's phone started crashing and it was mine:
      // a full-width gust at SS 1.5 x 6 frames is 13 MB, ON 25 PAGES, and the road gleam
      // was 28.8 MB — over the canvas cap, so the guard was also silently cutting its
      // frames. Motes, ripples and a glow have NO fine detail to lose; supersampling them
      // buys nothing and costs 2.25x. Fire and trees keep SS 2 (they are brush-marks you
      // read up close); real creatures keep 3.
      var SOFT = spec.type === 'bough' || spec.type === 'sunrays' || (spec.type === 'tree2' && spec.w >= 120) || (spec.type === 'leaves' || spec.type === 'ripple' || spec.type === 'spine' || spec.type === 'firstlight'
                  || spec.type === 'sky' || spec.type === 'stars' || spec.type === 'grass');
      var SS_F = SOFT ? 1 : AMB ? 1.5 : (spec.type === 'fire' || spec.type === 'tree' || spec.type === 'tree2' || spec.type === 'swimmer' || spec.type === 'fish2' || spec.type === 'whale') ? 2 : 3;
      // two hard guards, either of which trades frames away rather than break:
      //   · width — Safari refuses a canvas past ~16384px and returns a broken one
      //   · area  — the memory ceiling that actually bit us
      var MAXW = 14000, MAXPX = 3.6e6;
      while (NF > 2 && (W * NF * SS_F > MAXW || (W * SS_F) * (H * SS_F) * NF > MAXPX)) NF--;
      // ---- ⚠ A HARD PER-PAGE BUDGET (Fred, Aug 2026: "the page keeps on crashing on my
      // phone now") ----
      // The per-sheet caps above only ever guarded ONE sheet. Nothing was counting the
      // page's TOTAL, so effects could be added one at a time — each individually legal —
      // until the page needed hundreds of megabytes of canvas and iOS killed it. That is
      // exactly how this crash happened, and it was mine.
      // Now the page carries a running total. A sheet that would break the ceiling loses
      // frames until it fits; if it cannot fit even at two, it is DROPPED and says so.
      // ⚠ It must never fail silently — a page quietly missing its fire is a bug you
      // cannot see, and "no silent caps" is already the rule for coverage.
      var _bytes = function (nf) { return (W * SS_F) * (H * SS_F) * nf * 4; };
      while (NF > 2 && _pageBudget + _bytes(NF) > PAGE_BUDGET) NF--;
      if (_pageBudget + _bytes(NF) > PAGE_BUDGET) {
        if (window.console) console.warn('[scene] page ' + idx + ': dropped ' + spec.type
          + ' — ' + (_bytes(NF) / 1e6).toFixed(1) + ' MB would exceed the '
          + (PAGE_BUDGET / 1e6).toFixed(0) + ' MB page budget');
        return el;
      }
      _pageBudget += _bytes(NF);
      c = frameCanvas(W * NF, H, function (g) {
        for (var fi = 0; fi < NF; fi++) {
          g.save(); g.translate(W * fi, 0);
          // ⚠ THE TREE WAS NEVER HANDED ITS OWN SIZE. This branch read `if (spec.type
          // === 'fire')`, with a dead inner test for sky/stars/grass — so a TREE fell
          // through to the critter call below, which passes `s`/`t` and no w/h.
          // drawCypress then fell back on its defaults (span 314, W 46) and drew a tree
          // 314 tall inside a box measured for h=184: the crown ran clean off the top of
          // its own canvas. THAT is the cut Fred kept photographing — not the taper, not
          // the box width, both of which I "fixed" three times against a tree whose real
          // height nothing in this file knew.
          if (spec.type === 'starburst') {
            draw(g, { w: spec.w, h: spec.h, r: spec.r, seed: spec.seed, col: spec.col,
                      tilt: spec.tilt, beat: fi / NF });
          } else if (spec.type === 'bough') {
            draw(g, { w: spec.w, h: spec.h, side: spec.side, seed: spec.seed, lit: spec.lit,
                      boughs: spec.boughs, sway: spec.sway, leaf: spec.leaf, rim: spec.rim,
                      beat: fi / NF });
          } else if (spec.type === 'sunrays') {
            draw(g, { w: spec.w, h: spec.h, r0: spec.r0, r1: spec.r1, n: spec.n, lean: spec.lean,
                      amp: spec.amp, lam: spec.lam, len: spec.len, lw: spec.lw, seed: spec.seed,
                      beat: fi / NF });
          } else if (spec.type === 'whale') {
            draw(g, { cx: spec.w / 2, cy: spec.h / 2, len: spec.len, facing: spec.facing,
                      seed: spec.seed, beat: fi / NF });
          } else if (spec.type === 'fish2') {
            draw(g, { cx: spec.w / 2, cy: spec.h / 2, len: spec.len, facing: spec.facing,
                      seed: spec.seed, col: spec.col, beat: fi / NF });
          } else if (spec.type === 'swimmer') {
            draw(g, { cx: spec.w / 2, cy: spec.h / 2, s: spec.sz, kind: spec.kind,
                      facing: spec.facing, seed: spec.seed, beat: fi / NF });
          } else if (spec.type === 'firstlight') {
            draw(g, { w: spec.w, h: spec.h, k: spec.k, r0: spec.r0, r1: spec.r1,
                      seed: spec.seed, beat: fi / NF });
          } else if (spec.type === 'ripple') {
            draw(g, { w: spec.w, h: spec.h, n: spec.n, seed: spec.seed, cols: spec.cols, beat: fi / NF });
          } else if (spec.type === 'spine') {
            draw(g, { pts: spec.pts, w0: spec.w0, w1: spec.w1, col: spec.col, beat: fi / NF });
          } else if (spec.type === 'leaves') {
            draw(g, { w: spec.w, h: spec.h, n: spec.n, seed: spec.seed, dir: spec.dir,
                      span: spec.span, scale: spec.scale, cols: spec.cols, beat: fi / NF });
          } else if (spec.type === 'tether') {
            // ⚠ `overlap` HAS TO BE PASSED. It was in the spec and never handed to the
            // sprite, so drawTether always used its 12px default no matter what page 8
            // asked for — an hour of tuning a number that was being thrown away.
            draw(g, { w: spec.w, h: spec.h, seed: spec.seed, hand: spec.hand, tie: spec.tie,
                      c1: spec.c1, c2: spec.c2, amp: spec.amp, overlap: spec.overlap,
                      beat: (fi + 1) / NF });
          } else if (spec.type === 'sky' || spec.type === 'stars' || spec.type === 'grass') {
            draw(g, { w: spec.w, h: spec.h, n: spec.n, seed: spec.seed, cols: _pal || spec.cols, gap: spec.gap, stars: spec.stars, gust: _wind.gust, dir: spec.dir, beat: fi / NF });
          } else if (spec.type === 'fire' || spec.type === 'tree' || spec.type === 'tree2') {
            draw(g, { x: W / 2, y: H * bx2[2], w: spec.w, h: spec.h, k: spec.k, seed: spec.seed, logs: spec.logs, big: spec.big, lit: spec.lit, pal: spec.pal, gust: _wind.gust, dir: _wind.dir, beat: fi / NF });
          } else {
            // ⚠ A BIRD FLIES WITH THE WIND. Nothing looks more like a sticker than a
            // bird beating upwind while every tree on the page leans the other way.
            var _fc = spec.facing != null ? spec.facing : (spec.type === 'bird' ? _wind.dir : 1);
            draw(g, { x: W / 2, y: H * bx2[2], s: s * 1.35, t: 1.2, facing: _fc, col: spec.col,
                      beat: fi / NF, view: vw, head: hd });
          }
          g.restore();
        }
        // ⚠ WHY A SPRITE DOES NOT BLEND. Fred: "can you make the moving trees kind blend in
        // more with the background?" CRITTER_STYLE gives `tree` and `tree2` grade:false —
        // they sit in the same style block as `fire`, which must not be graded because the
        // fire IS the light, and the trees appear to have inherited it (no comment ever
        // justified it for them). So they were the one sprite on the page deliberately
        // excluded from the page's own colour. Beside PAINTED trees that is exactly the
        // tell: same shapes, different air.
        // ⚠ Opt-in per sprite rather than flipped for the whole book: `tree`/`tree2` appear
        // on several pages (4, 6, 10, 16, 24) and some are night scenes where grade:false
        // may well be right. A spec can now ask for the page's air with `grade: true`.
        var _gr = (spec.grade != null) ? spec.grade : (st.grade !== false);
        if (_gr) applyGrade(g, W * NF, H, idx);
        // ⚠ AND GRADE ALONE IS A SMOOTH DECAL ON AN IMPASTO PAINTING — the actor sheet
        // learned this already and says so; the critter sheet never got it. The plates are
        // painted surfaces with a raked tooth, so a graded-but-smooth sprite still sits ON
        // the picture instead of IN it. Trees only: paintIn reads the whole sheet back, so
        // it costs real time, and a bee is too small for the tooth to read anyway.
        if (_gr && (spec.type === 'tree' || spec.type === 'tree2')) {
          paintIn(g, W * NF, H, ((spec.x | 0) * 7 + (spec.h | 0) * 13 + idx * 101) | 0, 1, AMBIENT[idx]);
        }
      }, SS_F);
      c.style.width = (W * NF * fit.s) + 'px';
      c.style.height = (H * fit.s) + 'px';
      c.style.position = 'absolute'; c.style.left = '0'; c.style.top = '0';
      c.classList.add('sc-sheetfly');
      // ⚠ the step must equal ONE FRAME's on-screen width, or the walk drifts out of
      // registration and you see two half-butterflies (the waver-sheet lesson).
      c.style.setProperty('--fw', (W * fit.s) + 'px');
      c.style.setProperty('--nf', NF);
      // ⚠ BIRDS IN A GALE ARE NOT BIRDS ON A THERMAL. Fred: "the birds should also be
      // frantic." On the storm pages their wingbeat drops to a fraction of the calm-page
      // tempo — a bird fighting wind beats constantly, it never sets and glides.
      var tp = (TEMPO_PAGE[idx] || {})[spec.type] || TEMPO[spec.type] || [0.6, 0.3];
      if (windDriven(spec.type)) {
        // ⚠ every wind-driven thing on this page runs at the SAME period. The variety
        // that used to come from a random phase now comes from POSITION (see the delay
        // below) — which is the difference between a scene and a pile of loops.
        // ⚠ CAP THE SKY. At 3.2x a still page's period the candle page changed once
        // every 17 seconds, which does not read as calm — it reads as broken. Still air
        // means the sky moves LITTLE (gust scales the travel), not that it moves rarely.
        // ⚠ AND CAP IT TIGHTER THAN IT LOOKS. A sky sheet is stepped, so a long cycle
        // is not "slower", it is a JUMP with a long wait before it. At 34s over 4 frames
        // the darkest pages lurched once every 8.5 seconds. 18s over 6 frames steps
        // every 3s, and since travel scales with gust, a still page still barely moves —
        // it just does so continuously. Stillness is small motion, not rare motion.
        var _sd = spec.type === 'sky' ? Math.min(_wind.period * 2.2, 18) : _wind.period;
        c.style.animationDuration = _sd.toFixed(3) + 's';
      } else {
        c.style.animationDuration = (tp[0] + ((spec.phase || 0) % 1) * tp[1]).toFixed(3) + 's';
      }
      el.style.overflow = 'hidden';
      el.style.position = 'absolute';
    } else {
      c = frameCanvas(W, H, function (g) { draw(g, { x: W / 2, y: H * bx2[2], s: s * 1.35, t: 1.2, facing: spec.facing || 1, col: spec.col }); if (st.grade !== false) applyGrade(g, W, H, idx); });
      // bee + dragonfly wings still BLUR by squeeze — at that speed the eye reads a
      // haze, not a shape, so a rig would be wasted there.
      if (spec.type === 'dragonfly') { c.classList.add('sc-wing'); c.style.animationDuration = '0.055s'; }
    }
    if (spec.frantic) {
      // blown off course as well as beating hard — a short jagged path, and each bird
      // on its own period so the flock never moves as one sheet
      el.classList.add('sc-frantic');
      el.style.animationDuration = (0.9 + ((spec.phase || 0) % 1) * 0.7).toFixed(2) + 's';
    }
    if (spec.type === 'bee') {
      el.classList.add('sc-buzz');
      el.style.animationDuration = (3.0 + ((spec.phase || 0) % 1) * 1.6).toFixed(2) + 's';
    }
    el.appendChild(c);
    // swarm members are SCENERY: no tap target, no listener. Forty tap-toys on one
    // page is noise, and forty listeners is waste. ⚠ must NOT return early here —
    // place() below is what positions the sprite; skipping it stacks them all at 0,0.
    el.style.pointerEvents = 'none';        // scenery, not a button
    // ⚠ the anchor must match where the creature is DRAWN inside its box. Critters are
    // drawn at the box centre, but a fire is drawn standing at bx2[2] (90% down), so
    // anchoring it at 0.5 dropped its base ~106px below the plate and it vanished.
    var _rect = (spec.type === 'sky' || spec.type === 'stars' || spec.type === 'grass' || spec.type === 'tether' || spec.type === 'leaves' || spec.type === 'ripple' || spec.type === 'spine' || spec.type === 'starburst' || spec.type === 'firstlight' || spec.type === 'swimmer' || spec.type === 'fish2' || spec.type === 'whale' || spec.type === 'sunrays' || spec.type === 'bough');
    if (SHOWBOX) { el.style.outline = '1px solid #0f0'; el.style.background = 'rgba(0,255,0,0.07)'; }
    // a swimmer gets a real journey: its distance is in PLATE units on the spec, scaled
    // here into the pixels this device is actually drawing at
    if (spec.swim) {
      el.classList.add('sc-swim');
      el.style.setProperty('--sd', (spec.swim[0] * fit.s).toFixed(1) + 'px');
      el.style.setProperty('--sdur', spec.swim[1] + 's');
    }
    place(el, fit, spec.x + (_rect ? W / 2 : 0), spec.y + (_rect ? H / 2 : 0), W, H,
          _rect ? 0.5 : ((spec.type === 'fire' || spec.type === 'tree' || spec.type === 'tree2') ? bx2[2] : 0.5));
    if (windDriven(spec.type)) {
      // THE GUST TRAVELS. A thing standing downwind answers later, by how far downwind
      // it stands — so the wind crosses the scene instead of striking it all at once.
      var _u = (_wind.dir > 0 ? (spec.x || 0) : 800 - (spec.x || 0)) / 800;
      el.style.animationDelay = (-_u * _wind.period * 0.45).toFixed(2) + 's';
    } else el.style.animationDelay = (-(spec.phase || 0)) + 's';
    if (st.cls === 'sc-critter') el.style.animationDuration = (2.4 + ((spec.phase || 0) % 2)) + 's';
    return el;
  }
  function buildWater(spec, fit, idx) {
    var frag = document.createDocumentFragment();
    var n = spec.n || 10;
    for (var i = 0; i < n; i++) {
      var gx = spec.x + (Math.random() - 0.5) * spec.w;
      var gy = spec.y + (Math.random() - 0.5) * (spec.h || 14);
      var wpx = (8 + Math.random() * 12) * fit.s;
      var d = document.createElement('div'); d.className = 'sc sc-glint';
      d.style.left = (fit.x(gx) - wpx / 2) + 'px'; d.style.top = fit.y(gy) + 'px'; d.style.width = wpx + 'px';
      d.style.animationDuration = (1.6 + Math.random() * 1.9).toFixed(2) + 's';
      d.style.animationDelay = (-Math.random() * 3.5).toFixed(2) + 's';
      frag.appendChild(d);
    }
    return frag;
  }

  // A LAMP POST you can turn on and off — a made thing (crisp), clearly
  // interactive: tap toggles the flame. spec = { x, y (base), h, lit? }.
  function buildLamp(spec, fit, idx) {
    var h = spec.h || 120, w = h * 0.5, boxH = h * 1.04;
    var by = spec.baseY != null ? spec.baseY : spec.y;
    var el = document.createElement('div'); el.className = 'sc sc-lamp' + (spec.lit ? ' lit' : '');
    var c = frameCanvas(w, boxH, function (g) {
      F.drawLamp(g, { x: w / 2, baseY: boxH - 2, h: h });
      applyGrade(g, w, boxH, idx);
    });
    el.appendChild(c);
    // the lantern glass centre inside the box (post rises to top+0.2h, glass ~0.075h above it)
    var glassY = boxH - 2 - h * 0.875;
    function child(cls, wpx, hpx, cxpx, cypx) {
      var d = document.createElement('div'); d.className = cls;
      d.style.left = (cxpx - wpx / 2) / w * 100 + '%'; d.style.top = (cypx - hpx / 2) / boxH * 100 + '%';
      d.style.width = wpx / w * 100 + '%'; d.style.height = hpx / boxH * 100 + '%';
      el.appendChild(d); return d;
    }
    child('lampglow', h * 0.95, h * 0.95, w / 2, glassY);
    child('lampflame', h * 0.12, h * 0.16, w / 2, glassY);
    child('lamppool', h * 0.7, h * 0.16, w / 2, boxH - 2);
    el.style.pointerEvents = 'none';
    place(el, fit, spec.x, by, w, boxH, 1);
    return el;
  }

  /* ---- a CUTOUT actor: a figure cut from the oil-baked plate by its own silhouette
         layer, then laid back exactly over itself. It IS the painting (same brushwork,
         same grade), so it's invisible at rest — but it's a real object now: it breathes,
         and it blazes with light when tapped. Motion stays gentle + growing (scale >= 1)
         so the cutout always covers its own baked rest silhouette — no ghost twin. ---- */
  function buildCutout(spec, fit, idx, layer) {
    var el = document.createElement('div'); el.className = 'sc sc-cutout';
    var x0 = fit.x(0), y0 = fit.y(0);
    el.style.left = x0 + 'px'; el.style.top = y0 + 'px';
    el.style.width = (fit.x(800) - x0) + 'px'; el.style.height = (fit.y(500) - y0) + 'px';
    el.style.transformOrigin = (spec.ox / 8).toFixed(1) + '% ' + (spec.oy / 5).toFixed(1) + '%';   // feet anchor, in %
    var canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1000;
    el.appendChild(canvas);
    var g = canvas.getContext('2d'), plate = new Image(), mask = new Image(), n = 0;
    function draw() {
      if (++n < 2) return;
      g.clearRect(0, 0, 1600, 1000);
      g.drawImage(plate, 0, 0, 1600, 1000);
      g.globalCompositeOperation = 'destination-in';                 // keep only where the figure's silhouette is
      g.drawImage(mask, 0, 0, 1600, 1000);
      g.globalCompositeOperation = 'source-over';
      // LIFT: a dark object (the sealed stone) sinks into the shadow when flat-baked.
      // Brighten it by MULTIPLYING rgb (keep alpha at 100%) so it reads as a SOLID lit
      // rock — NOT additive 'lighter', which made it glow and look translucent.
      if (spec.lift) {
        var id = g.getImageData(0, 0, 1600, 1000), pd = id.data, f = spec.lift, k;
        for (k = 0; k < pd.length; k += 4) {
          if (pd[k + 3] > 4) {                       // only the opaque object; leave the transparent surround
            pd[k] = Math.min(255, pd[k] * f); pd[k + 1] = Math.min(255, pd[k + 1] * f); pd[k + 2] = Math.min(255, pd[k + 2] * f);
          }
        }
        g.putImageData(id, 0, 0);
      }
    }
    plate.onload = draw; mask.onload = draw; plate.src = spec.src; mask.src = spec.mask;
    if (!REDUCED) el.animate(                                          // a slow living breath — always >= 1, so it never uncovers the baked rest pose
      [ { transform: 'scale(1)' }, { transform: 'scale(1.012)' }, { transform: 'scale(1)' } ],
      { duration: 5200, iterations: Infinity, easing: 'ease-in-out' });
    layer.appendChild(el);   // the visual is pointer-events:none — it never blocks taps or swipes
  }

  /* ---- build one page's whole scene, once ---- */
  function buildPage(idx) {
    var page = pages[idx], fit = fitOf(page);
    if (!fit) return false;
    var layer = document.createElement('div');
    layer.className = 'sc-layer';
    var scrim = page.querySelector('.scrim');
    page.insertBefore(layer, scrim || null);
    var dio = buildDiorama(page, idx, layer);   // real depth planes (opt-in pages only)
    // the STAGE LIGHT — first child, behind every sprite, centred on the page's
    // focal subject so the busy paint recedes around the characters.
    // NOT on ep1: this vignette muted the vibrant plates AND was the "grey overlay"
    // that swept in on tilt (it darkens everything away from the focal). Fred was
    // right — the port added it; ep1's paintings read best raw + vibrant.
    if (EP !== 1) (function () {
      var st = document.createElement('div'); st.className = 'sc-stage';
      var A = AMBIENT[idx] || [20, 22, 48, 0.3];
      var w = page.clientWidth, h = page.clientHeight;
      var sx = (fit.x(focalPlateX(idx)) + 0.20 * w).toFixed(0), sy = (0.56 * h).toFixed(0);
      var bright = (A[0] + A[1] + A[2]) / 3 > 180;
      // dark pages: deepen the corners with NEAR-BLACK NAVY, never the ambient
      // mid-tone — a violet-grey vignette over warm paint read as a "grey overlay"
      // (Fred, on the interiors). Shadow must read as shadow.
      st.style.background = bright
        ? 'radial-gradient(ellipse ' + (0.55 * w).toFixed(0) + 'px ' + (0.5 * h).toFixed(0) + 'px at ' + sx + 'px ' + sy + 'px, rgba(255,244,210,.10), rgba(255,244,210,0) 62%)'
        : 'radial-gradient(ellipse ' + (0.62 * w).toFixed(0) + 'px ' + (0.56 * h).toFixed(0) + 'px at ' + sx + 'px ' + sy + 'px, rgba(0,0,0,0) 54%, rgba(9,10,26,.22) 100%)';
      layer.appendChild(st);
    })();
    var amb = AMBIENCE[idx];
    if (amb && amb.glows) amb.glows.forEach(function (g2) {
      var d = document.createElement('div');
      d.className = 'sc sc-glow ' + g2[3];
      place(d, fit, g2[0], g2[1] + g2[2] / 2, g2[2], g2[2], 0.5);
      d.style.pointerEvents = 'none';
      var cold = g2[3] === 'cold';

      layer.appendChild(d);
    });
    if (amb && amb.wisps) amb.wisps.forEach(function (w2, i) {
      var d = document.createElement('div');
      d.className = 'sc sc-wisp' + (typeof w2[2] === 'string' ? ' ' + w2[2] : '');
      d.style.left = fit.x(w2[0]) + 'px'; d.style.top = fit.y(w2[1]) + 'px';
      d.style.animationDuration = (9 + i * 2.2) + 's';
      d.style.animationDelay = (-i * 3.4) + 's';
      layer.appendChild(d);
    });
    var sc = F.SCENE[idx];
    if (sc) {
      (sc.trees || []).forEach(function (t) { layer.appendChild(buildSway(t, 'tree', fit, idx)); });
      (sc.bushes || []).forEach(function (b) { layer.appendChild(buildSway(b, 'bush', fit, idx)); });
      (sc.crowns || []).forEach(function (c2) { layer.appendChild(buildSway(c2, 'crown', fit, idx)); });
      (sc.flowers || []).forEach(function (f2) { layer.appendChild(buildSway(f2, 'flower', fit, idx)); });
      (sc.birds || []).forEach(function (b2) { layer.appendChild(buildBird(b2, fit, idx)); });
      (sc.water || []).forEach(function (w3) { layer.appendChild(buildWater(w3, fit, idx)); });   // shimmer under everything
      (sc.sheep || []).forEach(function (sp) { layer.appendChild(buildSheep(sp, fit, idx)); });
      (sc.lamps || []).forEach(function (lp) { layer.appendChild(buildLamp(lp, fit, idx)); });
    }
    // ---- NO TAP LAYER (Fred, Aug 2026: "let's delete clickable actions. it is more
    // beautiful this way"). Now that the scene genuinely MOVES — fire, wind, wings,
    // ears, wandering bees — it no longer needs to invite poking. A page that asks to
    // be tapped is a toy; a page that is simply alive is a painting. (Sep 25: the whole tap-reaction
    // system — INTERACT hotspots, runFx, the pilgrim move menu — was removed; a tap now opens the story card.)
    _pageBudget = 0;                                      // a fresh budget for this page
    // ⚠ THE PLANES ARE NO LONGER CHARGED HERE, and that is deliberate. Charging them was
    // right in principle and wrong in practice: the planes are ~38 MB, so the budget was
    // spent before a single sprite asked for room, and the garden lost its fire and both
    // trees — content that had run happily for days and was never what crashed. The plane
    // cost is now controlled STRUCTURALLY instead, by boiling only the backmost plane, so
    // it cannot run away; this budget guards the SHEETS, which is what it can actually
    // trade off. A guard should refuse the thing that grows, not the thing that is fixed.
    _plateImg = page.querySelector('picture img');       // the composite plate — the colour source for any ambient overlay
    // ⚠ NO SKY OVERLAY. Fred, Aug 5: "this wind you are making is so trash. it is just
    // putting scribbles on top of my art..... i guess you dont get what i mean.... what
    // i mean was maybe you could draw several background frames and just loop it to make
    // it look animated." He is right and I had the whole idea backwards: a drifting
    // layer of marks laid OVER a painting is graffiti on it, however carefully the
    // colours are sampled. The painting itself must be redrawn, several times, and
    // looped — the way hand-drawn animation has always worked. skySpec is kept below
    // only so the removal is legible; nothing calls it.
    var _gust = gustSpec(idx);                            // what is in this page's air
    if (_gust) layer.appendChild(buildCritter(_gust, fit, idx));
    var _crs = expandCritters(CRITTERS[idx], idx);
    _crs.forEach(function (cr) { if (!cr.front) layer.appendChild(buildCritter(cr, fit, idx)); });   // tappable life + tiny swarms
    if (!dio) (CUTOUTS[idx] || []).forEach(function (co) { buildCutout(co, fit, idx, layer); });   // Light-as-object — but a diorama page draws its figures AS PLANES (no cutout, no double)
    var cast = F.CAST[idx];
    if (cast) {
      var paired = cast.actors.some(function (a) { return a.t === 'r'; });   // the Light is present
      cast.actors.forEach(function (a) { layer.appendChild(buildActor(a, fit, paired, FREEZE[idx], idx)); });
    }
    // THE GIVEN APPLE, THE FATHER'S HAND (and anything else `HELD`, later) —
    // appended AFTER the cast on purpose, so each sits IN FRONT of him rather
    // than under his own opaque sprite. See the note by `HELD`'s declaration.
    // ⚠ AN IMAGE, NOT AN INLINE SVG — Fred, of the first hand-authored SVG
    // prop: "why this one is totally different than the other apples? make it
    // similar so it is consistent." A flat SVG (solid fill, one smooth
    // highlight) was never going to match hand-painted brushwork. Every entry
    // here is pre-rendered by its own gen/build-held-*.mjs script using the
    // SAME painting code (apple: gen/plates/bread.mjs's own apple(); hand:
    // gen/characters.mjs's CAST.light palette), rasterized the same plain-SVG
    // way the multiplane FG layer these props sit next to is — no surface/
    // grade pass, see those scripts' own notes for why.
    (HELD[idx] || []).forEach(function (h) {
      var hImg = document.createElement('img');
      hImg.className = 'sc';
      hImg.alt = '';
      hImg.src = (window.__castBase || '/cast/') + h.src + '?v=2';   // v2: repainted in the Light's own white-gold (Sep 16) — the grey-mottled trace no longer matched the glazed figure
      /* ⚠ `xk` WIDENS WITHOUT DROPPING THE GRIP (Fred, Sep 18: the Light's hands round the carried
         child "should be a tiny bit wider"). Scaling `r` would take the height with it and the hands
         would slide down his legs; the height is held at the unwidened size, so only the reach grows. */
      var hW = h.r * 2 * fit.s, hH = hW * h.aspect;
      if (h.xk) hW *= h.xk;
      hImg.style.position = 'absolute';
      hImg.style.left = (fit.x(h.x) - hW / 2) + 'px';
      hImg.style.top = (fit.y(h.y) - hH / 2) + 'px';
      hImg.style.width = hW + 'px'; hImg.style.height = hH + 'px';
      hImg.style.pointerEvents = 'none';
      if (h.rot) hImg.style.transform = 'rotate(' + h.rot + 'deg)';
      // ⚠ op: a piece may be TRANSLUCENT. Fred, on the Light's hands lying over the
      // carried child: "not opaque, but transparent" — because he IS light, and light
      // does not block what is behind it, it shines through it. Left unset the piece
      // renders solid, which is right for a real object (bread's apple).
      if (h.op != null) hImg.style.opacity = h.op;
      layer.appendChild(hImg);
    });
    var _wk = WALK[idx];
    if (_wk && !REDUCED) {
      try { layer.appendChild(buildWalk(_wk, fit, idx)); startPrints(page, _wk, fit, layer); }
      catch (e) { diag('walk ' + idx + ' failed: ' + e.message); }   // a rig that fails loses its own motion, never the page
    }
    // critters marked FRONT go on AFTER the cast — the garden's cypress is the thing
    // the child hides behind (Gen 3:8), so it has to occlude him.
    _crs.forEach(function (cr) { if (cr.front) layer.appendChild(buildCritter(cr, fit, idx)); });
    page.__scLayer = layer;
    page.__scFit = fit;
    seatActors(page, idx);   // ground the figures (if the diorama beat us here)
    return true;
  }

  /* ---- lifecycle: build current+neighbours; only the current page animates ---- */
  var built = {}, blinkTimer = 0, blinkEl = null;
  /* ⚠⚠ THE LIVE BOOK THREW TWO UNCAUGHT ERRORS ON EVERY LOAD (found in the Sep 8 audit:
     `TypeError: Cannot read properties of undefined (reading 'querySelector')` at fitOf ←
     buildPage ← ensure ← settle ← coverReady). The cause was one division: before layout has
     settled — the 300 ms-after-load call, or any moment the scroller has no width yet —
     `book.clientWidth` is 0, and 0/0 is NaN. NaN then walks straight through `ensure`'s range
     guard, because `NaN < 0` and `NaN >= length` are BOTH false, so `pages[NaN]` is handed to
     buildPage as a page. Two fixes, one at each end: an index that cannot be NaN (fall back to
     the last good one), and a guard written so that only a real in-range number passes. */
  function currentIdx() {
    var w = book.clientWidth;
    if (!(w > 0)) return lastIdx || 0;
    var i = Math.round(book.scrollLeft / w);
    return Math.max(0, Math.min(pages.length - 1, i));
  }
  function ensure(idx) {
    if (!(idx >= 0 && idx < pages.length) || built[idx]) return;   // ⚠ written so NaN cannot pass
    if (DIAG) diag('ensure ' + idx + ' (built: ' + Object.keys(built).join(',') + ')');
    /* ⚠⚠ THE COVER BUILT TWICE ON EVERY LOAD (Sep 16, found chasing "swipe to last page, it
       crashed"). buildDiorama fires `settled()` SYNCHRONOUSLY when a plane is already cached
       (img.complete), settled() calls coverReady(), coverReady() calls settle(), settle() calls
       ensure(0) — and built[0] was not yet set because we were still inside the first
       buildPage. Two full sets of planes on the heaviest page in the book. So the flag is
       raised BEFORE the build (and lowered again only if the build declined). */
    built[idx] = true;
    if (buildPage(idx)) return;
    built[idx] = false;
    { var im = pages[idx] && pages[idx].querySelector('img'); if (im && !im.complete) im.addEventListener('load', function () { ensure(idx); }, { once: true }); }
  }
  function blinkLoop() {
    clearTimeout(blinkTimer);
    var page = pages[currentIdx()], layer = page && page.__scLayer;
    if (!layer || REDUCED) return;
    if (FREEZE[currentIdx()]) return;   // frozen tableau: no idle blinking either
    var actors = layer.querySelectorAll('.sc-actor.blinkable');   // only actors that HAVE a shut frame (not back-turned/wavers)
    if (!actors.length) return;
    blinkTimer = setTimeout(function () {
      var el = actors[(Math.random() * actors.length) | 0];
      el.classList.add('blink');
      setTimeout(function () { el.classList.remove('blink'); }, 130);
      blinkLoop();
    }, 2200 + Math.random() * 3800);
  }
  /* ---- tilt-to-explore camera: the phone shows the WIDE plate (far wider than
     the screen), centred on each page's focal point at rest; tilt then pans
     across the whole painting so the reader can reach the far edges — the trees,
     the city — that the portrait frame hides. Paint + actors move as one. ---- */
  function focalPlateX(idx) {
    var c = F.CAST && F.CAST[idx];
    return c && typeof c.fx0 === 'number' ? c.fx0 + 156 : 400;   // the old portrait window's centre = the intended subject
  }
  // A rAF CAMERA with CACHED geometry. The old lag came from reading
  // img.offsetWidth on every gyro event (a forced synchronous LAYOUT, 60×/sec =
  // thrash) and the jitter came from feeding the raw gyro straight through. Now:
  // geometry (maxPan/rest) is measured ONCE per page (camSet), the gyro only
  // writes a target number (no DOM), and a single rAF loop low-passes the input
  // AND eases the pan — decoupled from the sparse/jittery event rate. The loop
  // runs only while moving, then stops (main thread idle).
  var _wasPanning = false, _panQuiet = 99, _panTimer = 0;
  var camIdx = -1, camImg = null, camLayer = null, camMaxPan = 0, camRest = 0, camNxT = 0, camCur = 0, camRAF = 0, camOV = 0, camPlanes = null;
  /* ⚠ THE FIGURE STANDS ON WHATEVER PLANE THE GROUND IS PAINTED IN (Fred, Sep 16: "make kid
     tilt less, slightly sticky to ground" — turning, together; "kid should always be in
     center" — looking). The sprite layer used to assume the ground is a rate-1.0 plane, but on
     these pages the road or the plain is painted in `bg`/`ground`, which recedes at ~0.65, so
     the child slid across the very ground he stood on every time the phone tilted. Name the
     ground plane here and the sprites take ITS rate, horizontal and vertical. */
  var SPRITE_GROUND = { 5: 'bg', 9: 'ground', 24: 'bg', 28: 'bg', 25: 'far' };   // 25 prayer: he kneels AT THE BED, so the child and his aura take the bed plane's rate — Fred: "bed and aura should stick to the floor"
  var camGround = 1, camLive = null;   // camLive: the cover's sparkle canvas (canvas.live) — it must pan with the mote shells it lights (Fred, Sep 16: "stars dont move with motion")
  var camNyT = 0, camCurY = 0;                         // the VERTICAL look (up/down), -1..1 — the 2nd gyro axis, so the phone is a WINDOW you look through
  var DIO_SCALE = 1.06, DIO_VMAX = 11, DIO_EDGE = 6.5;   // DIO_EDGE mirrors the plane clamp, so camApply can follow the ground                 // planes zoom 6% (overscan headroom) so the up/down depth-parallax never reveals an edge (±11px, safe on short screens too)
  function camApply(dx) {                              // pure style writes, zero DOM reads/queries
    if (EP === 1 && camMaxPan <= 0) return;            // no-pan page (the 4K covers): never write object-position — animating it re-runs the CSS filter over 3840×2400 every frame → iOS memory crash
    if (EP === 1) {
      // EP1 pans a box-sized object-fit:cover <img> via object-position (kept an <img>
      // so iOS colour-manages it). cover always fills the box → no gap. 50% = centred.
      if (camPlanes) {                                 // DIORAMA: parallax as DEVIATION from rest → rest is the pristine aligned painting
        var ov = camOV > 0 ? camOV : 1;
        var base = (dx / ov) * 100;                    // the flat pan (all planes share this)
        if (camImg) camImg.style.objectPosition = Math.max(0, Math.min(100, 50 - base)).toFixed(2) + '% ' + (CROP_Y * 100) + '%';  // base plate tracks the ground so the plane takeover is seamless
        var dev = ((dx - camRest) / ov) * 100;         // how far we've tilted OFF the resting frame
        for (var i = 0; i < camPlanes.length; i++) {
          var pl = camPlanes[i];
          var Pp = 50 - base - dev * (pl.rate - 1);     // depth adds a shift only as you move away from rest
          // never pan into a plate's outer DIO_EDGE% — that raw margin is where the art
          // runs out (the road wasn't painted to the corner). The house sits at ~81%, so
          // this still reveals it; it just stops before the unfinished edge shows.
          var _Pc = Math.max(DIO_EDGE, Math.min(100 - DIO_EDGE, Pp));
          pl.img.style.objectPosition = _Pc.toFixed(2) + '% ' + (CROP_Y * 100) + '%';
          /* ⚠ A SPINNING PLANE IGNORES object-position (Sep 17, Fred: "i tilted so that the stars go
             away from the core"). The cover's mote shells live inside a `.dio-spin` host whose images
             are object-fit:fill — they exactly fill the host, so there is nothing for object-position
             to move, and the shells sat dead still while the core panned away from them. The HOST
             is moved instead, by the same distance a panned image would travel. It rides the
             `translate` property: the rotation animation owns `transform`, and translate composes
             ahead of it, so the wheel turns about its moved centre. */
          var _hp = pl.img.parentNode;
          if (_hp && _hp.className === 'dio-spin') _hp.style.translate = (ov * (50 - _Pc) / 100 * DIO_SCALE).toFixed(1) + 'px 0';
          // VERTICAL depth (the 2nd window axis): near planes rise/sink MORE than far
          // ones as you look up/down — motion parallax that makes the frame read as a
          // real 3-D scene behind glass. Rides inside the 6% overscan so no edge shows.
          var Yp = camCurY * (pl.rate - 1) * 24;
          Yp = Yp < -DIO_VMAX ? -DIO_VMAX : Yp > DIO_VMAX ? DIO_VMAX : Yp;
          pl.img.style.transform = 'scale(' + DIO_SCALE + ') translateY(' + Yp.toFixed(1) + 'px)';
        }
      } else if (camImg) {
        var P = camOV > 0 ? 50 - (dx / camOV) * 100 : 50;
        camImg.style.objectPosition = Math.max(0, Math.min(100, P)).toFixed(2) + '% ' + (CROP_Y * 100) + '%';
      }
    } else if (camImg) {
      // ep2-4: the -p slice is viewport-width; pan it on the 3D/GPU path.
      camImg.style.transform = 'translate3d(calc(-50% + ' + dx.toFixed(1) + 'px),0,0)';
    }
    // ⚠ THE FIGURE MUST NOT FLOAT OFF ITS OWN GROUND. This used to add
    // (camCurY * 9)px of vertical drift, treating the actor as "a near element" — but
    // a ground plane runs at rate 1.0, whose vertical shift is (rate-1)*24 = ZERO. So
    // on the up/down look the character slid up and down while the ground it stands on
    // stayed put, and its feet, its cast shadow and the dirt under it came apart.
    // A figure STANDING on the ground is at the ground's depth where its feet are: it
    // shares the ground's motion exactly. Horizontal still tracks the flat pan (dx),
    // which is also what a rate-1.0 plane does.
    // ⚠ AND IT MUST TRACK THE GROUND EXACTLY. Fred: "the fire and tree should stay when
    // panned, it does not make sense if we shift our perspective and somehow the fire
    // and tree move." Right — and they did, for two reasons. (a) Every plane's
    // objectPosition is CLAMPED to the DIO_EDGE margin, so at the ends of the pan the
    // painting stops while this layer kept going, and the fire slid across a frozen
    // scene. (b) The planes are drawn at DIO_SCALE (1.06), so a plane's content travels
    // 1.06x whatever the raw pan says, while the sprites travelled 1x — a steady 6%
    // drift the whole way across. Derive the layer's shift FROM the ground plane's own
    // applied position and both faults go: whatever the painting does, the sprites do.
    if (camLayer) {
      var lx = dx, ly = 0;
      if (EP === 1 && camPlanes && camOV > 0) {
        var _b = (dx / camOV) * 100, _dv = ((dx - camRest) / camOV) * 100;
        var _pp = Math.max(DIO_EDGE, Math.min(100 - DIO_EDGE, 50 - _b - _dv * (camGround - 1)));   // the ground plane's own position (rate 1.0 unless SPRITE_GROUND names another)
        lx = DIO_SCALE * (50 - _pp) / 100 * camOV;
        ly = camCurY * (camGround - 1) * 24;
        ly = ly < -DIO_VMAX ? -DIO_VMAX : ly > DIO_VMAX ? DIO_VMAX : ly;
      }
      camLayer.style.transform = 'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0)';
      if (camLive) camLive.style.transform = 'translate3d(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px,0)';
    }
  }
  function camMeasure(page, idx) {                     // the ONLY place we touch layout / the DOM tree
    camImg = page.querySelector('picture img'); camLayer = page.__scLayer; camLive = page.querySelector('canvas.live');
    camPlanes = page.__dio || null;                    // diorama pages drive planes instead of the single composite
    camGround = 1;
    var _gn = SPRITE_GROUND[idx];
    if (_gn && camPlanes) for (var gi = 0; gi < camPlanes.length; gi++) if (camPlanes[gi].name === _gn) { camGround = camPlanes[gi].rate; break; }
    if (!camImg) { camMaxPan = 0; camRest = 0; camOV = 0; return; }
    var w = page.clientWidth;
    // OVERSCAN margin so the pan can never reach the plate's true edge.
    var margin = Math.max(4, w * 0.055);
    if (EP === 1) {                                    // object-position model: overflow = cover-width − viewport
      var ratio = (camImg.naturalWidth && camImg.naturalHeight) ? camImg.naturalWidth / camImg.naturalHeight : 1.6;
      camOV = Math.max(0, page.clientHeight * ratio - w);
      // full tilt-pan — now the muting/darkening vignette (sc-stage) is gone, panning
      // just reveals the real vibrant painting (the far edges are colourful art, not a
      // grey wash), so the reader can reach the sides (e.g. the string-page child).
      camMaxPan = Math.max(0, camOV / 2 - margin);
    } else {
      camMaxPan = Math.max(0, (camImg.offsetWidth - w) / 2 - margin);
    }
    var fit = fitOf(page);
    camRest = fit ? Math.max(-camMaxPan, Math.min(camMaxPan, w / 2 - fit.x(focalPlateX(idx)))) : 0;
  }
  function camLoop() {
    camRAF = 0;
    // rest sits on the focal (camRest), but FULL tilt must reach either true edge —
    // ease the centre back to 0 as you tilt so an off-centre focal never eats the
    // travel on one side (why the far-right house was unreachable). EP1 only.
    var _nx = FORCEPAN ? Math.max(-1, Math.min(1, parseFloat(FORCEPAN[1]) || 0)) : camNxT;
    var tgt = (EP === 1)
      ? camRest * (1 - Math.abs(_nx)) - _nx * camMaxPan
      : camRest - _nx * camMaxPan;
    tgt = Math.max(-camMaxPan, Math.min(camMaxPan, tgt));
    camCur += (tgt - camCur) * 0.22;                  // ONE lerp: smooths gyro jitter AND eases the pan (responsive, not laggy)
    camCurY += (camNyT - camCurY) * 0.16;             // ease the up/down look too
    camApply(camCur);
    // ⚠ HYSTERESIS, or the cure becomes the disease. A real gyro never sits still: the
    // camera is always creeping by a fraction, so a bare threshold flips this state many
    // times a second — and each flip pops the second drawing in and out, which is a
    // WORSE jitter than the one it was meant to remove. It was fine on a simulator,
    // which has no gyro at all, and I only tested there.
    // So: panning latches ON immediately (hide the doubling the instant the view moves)
    // and only releases after the camera has been quiet for a beat.
    // ⚠ A PINNED CAMERA IS NOT A PAN. With ?pan= the view is held still on purpose, so
    // the latch must never engage — otherwise the debug flag I use to hold the frame
    // steady also PAUSES every ring, and I end up measuring a page I have just switched
    // off. That is exactly what happened twice: "the light does not shimmer" was my own
    // instrument suppressing it.
    var _moving = !FORCEPAN && (Math.abs(tgt - camCur) > 0.25 || Math.abs(camNyT - camCurY) > 0.004);
    if (_moving) { _panQuiet = 0; if (_panTimer) { clearTimeout(_panTimer); _panTimer = 0; } } else _panQuiet++;
    var _wantPan = _moving || _panQuiet < 26;            // ~0.4s of stillness before it lifts
    if (_wantPan !== _wasPanning) {
      _wasPanning = _wantPan;
      var _bk = document.getElementById('book');
      if (_bk) _bk.classList.toggle('sc-panning', _wantPan);
    }
    if (_moving) camRAF = requestAnimationFrame(camLoop);
    else {
      camCur = tgt; camCurY = camNyT; camApply(camCur);          // settled → stop the loop, main thread idle
      // ⚠ AND RELEASE THE LATCH ON A TIMER, NOT ON THE NEXT FRAME. This loop STOPS when
      // the camera settles — that is the whole point of it, so the phone can idle — so a
      // counter that ticks inside it never finishes counting. The class stayed on for
      // ever and the glimmer never ran once: the page went completely dead, which is how
      // the map found it. Anything that must happen AFTER the last frame cannot live in
      // the frame loop.
      if (_panTimer) clearTimeout(_panTimer);
      _panTimer = setTimeout(function () {
        _wasPanning = false; _panQuiet = 99;
        var b = document.getElementById('book');
        if (b) b.classList.remove('sc-panning');
      }, 420);
    }
  }
  function camKick() { if (!camRAF) camRAF = requestAnimationFrame(camLoop); }
  // The poem fades while you're MOVING the phone to look around, and returns a beat after
  // you HOLD STILL — at whatever angle you've settled on, not only back at centre. Detection
  // is jitter-robust: a heavily-smoothed look-position (filters hand-tremor) whose velocity
  // raises a "moving" flag; a settle timer brings the words back once you stop. The CSS
  // transition on .text/.scrim makes the hide/show itself glide.
  var sNx = 0, sNy = 0, lastSNx = 0, lastSNy = 0, lookVel = 0, stillTimer = 0, textHidden = false;
  function updateReadFade() {
    sNx = sNx * 0.86 + camNxT * 0.14; sNy = sNy * 0.86 + camNyT * 0.14;   // smoothed look (tremor filtered out)
    var d = Math.abs(sNx - lastSNx) + Math.abs(sNy - lastSNy);
    lastSNx = sNx; lastSNy = sNy;
    lookVel = lookVel * 0.72 + d * 0.28;
    if (lookVel > 0.009) {                                                // MOVING → get the poem out of the way
      if (!textHidden) { textHidden = true; document.documentElement.style.setProperty('--read-fade', '0'); }
      clearTimeout(stillTimer);
      stillTimer = setTimeout(function () { textHidden = false; document.documentElement.style.setProperty('--read-fade', '1'); }, 430);   // held still ~0.43s → words ease back
    }
  }
  function resetReadFade() {   // new page / arrival: show the poem, clear the motion state
    sNx = lastSNx = camNxT; sNy = lastSNy = camNyT; lookVel = 0; textHidden = false;
    clearTimeout(stillTimer); document.documentElement.style.setProperty('--read-fade', '1');
  }
  function panTo(nx, ny) { camNxT = Math.max(-1, Math.min(1, nx)); if (ny != null) camNyT = Math.max(-1, Math.min(1, ny)); updateReadFade(); camKick(); }   // gyro/pointer: set target only, no DOM read
  function restCenter() {                             // page change / build / resize: re-measure + snap to focal-centre
    var i = currentIdx(); var p = pages[i]; if (!p) return;
    var changed = (camIdx !== i);
    camIdx = i; camMeasure(p, i);
    if (changed) { camNxT = 0; camCur = camRest; camNyT = 0; camCurY = 0; resetReadFade(); }   // new page → recentre both axes + show the poem
    else camCur = Math.max(-camMaxPan, Math.min(camMaxPan, camCur));   // resize can shrink the range under us
    camApply(camCur);
    camKick();   // rotation/resize re-measures on the SAME page → ease to the new rest instead of sticking
  }

  // ══ THE PAGE INSPECTOR — `?inspect=1` ═════════════════════════════════════════════
  // Fred: "it is very hard to tell you what i want... maybe if i can see what is going on in
  // the back of a single page and then we name them as variables and then we talk that way?"
  // That is the right instinct and it is worth more than any single fix: most of the wasted
  // rounds in this project have been me repainting the wrong object because neither of us
  // had a NAME for the thing being pointed at. (Three rounds went on one tree because I did
  // not know it was a sprite and not paint.)
  //
  // Add ?inspect=1 to any URL. Every addressable part of the page is labelled where it sits:
  //   plane:<name>      a depth plane, with its parallax depth
  //   sprite:<type>#n   a runtime sprite — these are the things that MOVE
  //   actor:<kind>#n    a character
  // The panel lists them all, so a screenshot of it is a shared vocabulary: "make
  // sprite:tree2#0 bigger", "plane:land is too flat", and there is nothing left to guess.
  var INSPECT = /[?&]inspect=1/.test(location.search);
  function inspectPage(page, idx, fit) {
    if (page.querySelector('.sc-inspect')) return;
    var box = document.createElement('div');
    box.className = 'sc-inspect';
    box.style.cssText = 'position:absolute;inset:0;z-index:40;pointer-events:none;font:11px/1.25 ui-monospace,Menlo,monospace;';
    var names = [];
    function tag(px, py, label, colour) {
      names.push(label);
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;transform:translate(-50%,-50%);white-space:nowrap;'
        + 'background:' + colour + ';color:#0b0d18;padding:1px 5px;border-radius:3px;'
        + 'box-shadow:0 0 0 1px rgba(0,0,0,.5),0 1px 6px rgba(0,0,0,.5);font-weight:600;';
      d.style.left = px + 'px'; d.style.top = py + 'px';
      d.textContent = label;
      box.appendChild(d);
      var dot = document.createElement('div');
      dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;background:' + colour
        + ';transform:translate(-50%,-50%);box-shadow:0 0 0 1px #000;';
      dot.style.left = px + 'px'; dot.style.top = (py + 13) + 'px';
      box.appendChild(dot);
    }
    // 1 · the depth planes
    var defs = dioPlanes(page) || [];
    for (var i = 0; i < defs.length; i++) {
      tag(46 + (i % 2) * 96, 26 + i * 19, 'plane:' + defs[i].name + ' @' + defs[i].depth, '#9fe8ff');
    }
    // 2 · the runtime sprites — the things that MOVE
    var cr = (typeof CRITTERS !== 'undefined' && CRITTERS[idx]) || [];
    var count = {};
    for (var c = 0; c < cr.length; c++) {
      var sp = cr[c], ty = sp.type || '?';
      count[ty] = (count[ty] == null ? -1 : count[ty]) + 1;
      var lx = sp.x != null ? sp.x : (sp.band ? (sp.band[0] + sp.band[2]) / 2 : 400);
      var ly = sp.y != null ? sp.y : (sp.band ? (sp.band[1] + sp.band[3]) / 2 : 250);
      tag(fit.x(lx), fit.y(ly), 'sprite:' + ty + '#' + count[ty], '#ffd166');
    }
    // 3 · the characters
    var cast = (F.CAST[idx] || {}).actors || [];
    for (var a2 = 0; a2 < cast.length; a2++) {
      tag(fit.x(cast[a2].x), fit.y(cast[a2].y), 'actor:' + (cast[a2].t || 'p') + '#' + a2, '#c3f584');
    }
    // 4 · the list, so one screenshot carries the whole vocabulary
    var panel = document.createElement('div');
    panel.style.cssText = 'position:absolute;left:8px;bottom:8px;max-width:62%;max-height:44%;overflow:auto;'
      + 'background:rgba(8,10,20,.86);color:#dfe6ff;padding:7px 9px;border-radius:6px;pointer-events:auto;'
      + 'box-shadow:0 2px 14px rgba(0,0,0,.6);';
    panel.innerHTML = '<b>page ' + idx + ' &mdash; ' + (DIO[idx] || '?') + '</b><br>' + names.join('<br>');
    box.appendChild(panel);
    page.appendChild(box);
  }

  var lastIdx = 0;
  var COLD = true;                 // true until the cover is up (or you swipe) — see settle()
  function coverReady() {
    if (!COLD) return;
    COLD = false;
    settle();                      // now fetch the look-ahead, with the cover already painted
  }
  setTimeout(coverReady, 5000);    // backstop: a stalled plane must never strand the look-ahead
  addEventListener('load', function () { setTimeout(coverReady, 300); });   // covers WITHOUT a diorama never call coverReady() — don't make them wait for the backstop
  /* ---- ⚠ THE BOIL DRAWINGS LOAD FOR THE PAGE BEING READ, AND ONLY AFTER ITS PLANES (Oct 8) ----
     buildDiorama no longer gives a boil drawing its src; it parks the URL on the element. This
     sets them, for the CURRENT page only, once every plane of that page has loaded (so the
     picture is up first and the drawings never compete with it), at fetchPriority low. If the
     reader swipes on before that, nothing is fetched and the page simply starts again the next
     time it is current. The still image is identical — a ring's base plane stays visible until
     its drawings are in (see buildDiorama) — only the motion begins a moment later. */
  var _idle = window.requestIdleCallback
    ? function (f, ms) { window.requestIdleCallback(f, { timeout: ms || 3000 }); }
    : function (f) { setTimeout(f, 400); };
  function artDone(page) {
    if (page.__artDone) return;
    page.__artDone = true;
    var w = page.__artWait || []; page.__artWait = [];
    w.forEach(function (f) { _idle(f); });
  }
  // run `f` in idle time once this page's art (planes + boil drawings) has all landed
  function onPageArt(page, f) {
    if (page.__artDone) return _idle(f);
    (page.__artWait || (page.__artWait = [])).push(f);
  }
  /* ---- ⚠ THE BOIL DRAWINGS NO LONGER FIGHT THE PICTURE (Oct 9) ----
     Measured on Fast 3G with a 4x CPU (an emulated cheap Android): the cover's 8 planes were
     requested at 5.4 s, and its 18 boil drawings (4.8 MB) at 15.5 s — exactly the 10 s backstop
     below, which assumed a plane that had not landed in 10 s had STALLED. On 3G every cover plane
     is simply slow, so the drawings were released on top of them, and the cover's full picture
     arrived at 52 s instead of ~24 s. Three changes, none to what is drawn:
       1. The backstop measures PROGRESS, not time since the start: it fires only when no plane of
          the page has finished (loaded or failed) for BOIL_STALL_MS. A failed plane already counts
          as finished (its error event), so only a genuinely stuck one waits it out.
       2. The drawings go a few at a time (BOIL_INFLIGHT), and none starts while a neighbouring
          page's planes are still arriving — the next page the reader swipes to comes first.
       3. When the reader leaves the page, its drawings still in flight are CANCELLED at once (from
          the scroll handler — settle()'s own free can be held up by the next page's build), so
          they stop sharing the line with the page being swiped to. They start again if the reader
          comes back. A cancelled drawing has no src, so it is neither a failure nor a "loaded". */
  var BOIL_STALL_MS = 30000, BOIL_INFLIGHT = 3, _boilLive = null;
  function neighbourPlanesArriving(page) {
    var i = pages.indexOf(page);
    for (var j = i - 1; j <= i + 1; j += 2) {
      var p = pages[j], pl = p && p.__dio;
      if (!pl) continue;
      var q = p.__boilQ || [];
      for (var k = 0; k < pl.length; k++) {
        var im = pl[k].img;
        if (q.indexOf(im) === -1 && im.getAttribute('src') && !im.complete) return true;
      }
    }
    return false;
  }
  function pumpBoil(L) {
    if (_boilLive !== L || L.page.__boilQ !== L.q) return;
    if (pages[currentIdx()] !== L.page) return stopBoil(L);
    L.fl = L.fl.filter(function (el) { return el.getAttribute('src') && !el.complete; });
    if (!L.todo.length || L.fl.length >= BOIL_INFLIGHT) return;
    if (neighbourPlanesArriving(L.page)) { clearTimeout(L.t); L.t = setTimeout(function () { pumpBoil(L); }, 500); return; }
    var kick = function () { setTimeout(function () { pumpBoil(L); }, 0); };
    while (L.fl.length < BOIL_INFLIGHT && L.todo.length) {
      var el = L.todo.shift();
      if (el.getAttribute('src')) continue;
      el.addEventListener('load', kick, { once: true });
      el.addEventListener('error', kick, { once: true });
      try { el.fetchPriority = 'low'; } catch (e) { }                      // ⚠ before src, or it is already queued
      el.src = el.__boilSrc;
      L.fl.push(el);
    }
  }
  function stopBoil(L) {
    if (!L) return;
    clearTimeout(L.t);
    if (_boilLive === L) _boilLive = null;
    L.fl.forEach(function (el) { if (!el.complete) el.removeAttribute('src'); });   // cancel what is still downloading
    L.fl = [];
    if (L.page.__boilQ === L.q) L.page.__boilGo = false;   // the next visit starts the rest again
  }
  function loadBoil(page) {
    if (!page || page.__boilGo) return;
    var planes = page.__dio, q = page.__boilQ;
    if (!planes || !q) { if (built[pages.indexOf(page)] && !planes) artDone(page); return; }   // a page with no diorama has no boil to wait for
    page.__boilGo = true;
    var waits = planes.filter(function (p) { return q.indexOf(p.img) === -1; }).map(function (p) { return p.img; });
    var left = waits.length + 1, fired = false, stallT = 0;
    function planesUp() {
      if (--left > 0 || fired) { if (!fired) armStall(); return; }
      fired = true; clearTimeout(stallT);
      setTimeout(function () {
        if (page.__boilQ !== q) return;                                         // freed or rebuilt meanwhile
        if (pages[currentIdx()] !== page) { page.__boilGo = false; return; }    // reader moved on: wait until they come back
        var n = q.length;
        if (!n) return artDone(page);
        var todo = [];
        q.forEach(function (el) {
          var end = el.__boilEnd, counted = false;   // a ring's own counter (may be null), chained with the page's
          el.__boilEnd = function (good) {
            if (counted) return; counted = true;
            if (end) end(good);
            if (--n === 0 && page.__boilQ === q) artDone(page);
          };
          if (el.getAttribute('src')) return el.__boilEnd(true);                // already set on an earlier visit
          todo.push(el);
        });
        if (_boilLive) stopBoil(_boilLive);
        if (todo.length) pumpBoil(_boilLive = { page: page, q: q, todo: todo, fl: [], t: 0 });
      }, 120);   // let the planes paint first
    }
    // backstop: one STUCK plane must not keep the page still for ever — but a slow one is not stuck
    function armStall() {
      clearTimeout(stallT);
      stallT = setTimeout(function () { if (!fired && page.__boilQ === q) { left = 1; planesUp(); } }, BOIL_STALL_MS);
    }
    waits.forEach(function (im) {
      if (im.complete) return planesUp();
      im.addEventListener('load', planesUp, { once: true });
      im.addEventListener('error', planesUp, { once: true });
    });
    planesUp();
  }
  // ⚠ THE CAST WARM-UP WAITS ITS TURN (Oct 8). On the cover it waits for the first swipe or for
  // the cover's own art to finish and the browser to go idle, whichever comes first; from page 5
  // the bulk warm of every remaining cell (kidWarmAll) waits for the current page's art and idle
  // time instead of starting the moment the page settles. Each page still asks for ITS OWN cells
  // when it builds (buildActor), so no figure ever waits on this.
  var _castFirst = null, _castSwiped = false;
  function warmCast(idx) {
    if (!F || !F.kidWarmAhead) return;
    if (_castFirst === null) _castFirst = idx;
    if (idx !== _castFirst) _castSwiped = true;
    var page = pages[idx];
    if (!_castSwiped) {
      if (page && !page.__castQ) { page.__castQ = 1; onPageArt(page, function () { _castSwiped = true; warmCast(currentIdx()); }); }
      return;
    }
    try { F.kidWarmAhead(idx, !!F.kidWarmAll); } catch (e) { }   // the next pages' cells now; with kidWarmAll exported, NOT the bulk
    if (idx >= 4 && F.kidWarmAll && page && !page.__castAll) {
      page.__castAll = 1;
      onPageArt(page, function () { try { F.kidWarmAll(); } catch (e) { } });
    }
  }
  function settle() {
    var idx = currentIdx();
    warmCast(idx);   // his drawings for the next pages, before they are needed (deferred on the cover — see warmCast)
    if (DIAG) diag('settle ' + idx + ' cold=' + COLD + ' ' + (new Error().stack || '').split('\n').slice(2, 4).join(' | ').replace(/https?:[^ )]+/g, ''));
    var dir = idx >= lastIdx ? 1 : -1;   // swipe direction (default forward)
    lastIdx = idx;
    // ⚠ A MEMORY BUDGET, NOT A PAGE COUNT. Fred, Aug 13: "the web is crashing, usually after
    // bridge." Measured, that is exactly where it runs out — but the fix is not "hold fewer
    // pages", it is "stop counting the wrong thing". A depth plane is 1600x1000 RGBA =
    // **6.4 MB decoded** however small its file is, and the book's pages are wildly uneven:
    // `bridge` declares 10 planes (64 MB), `risen` 5 (32 MB). A fixed 4-page window held
    // ~205 MB around bridge, against a page that was healthy at 120-160 — so the tab died,
    // and it died in the same place every time because that neighbourhood is the heaviest
    // in the book (looking 8 + road 8 + bridge 10).
    //
    // So the window now measures itself. The current page is always held; each neighbour is
    // added, nearest-in-the-swipe-direction first, only while the running total stays under
    // the cap. On light pages that still keeps three (and the look-ahead is free); on the
    // heavy stretch it quietly holds two. Nothing is dropped that the reader can see, and
    // the ceiling holds no matter how many planes a future page declares — which is the
    // part that matters, because every page I rebuild adds planes.
    var HOLD_MB = 112, PLANE_MB = 6.1;   // ⚠ 132 -> 112: never even attempt to hold two of the heavy pages
    // ⚠ COUNT THE BOIL, NOT JUST THE LAYER LIST. Fred, after the first budget shipped: "still
    // crashed on my phone on the swipe from road to bridge." The budget was honest about the
    // planes a page DECLARES and blind to the ones the boil creates — and those two pages are
    // the worst in the book for it: BOIL[10] = 6 drawings, BOIL[11] = **8**. A drawing is a
    // whole extra 1600x1000 image.
    //
    // (The code here used to claim boil drawings were half-resolution — "six half-res drawings
    // are 9.6 MB against three full-res at 19.2". They are not: every -bN file on disk is
    // 1600x1000, 6.1 MB decoded, same as its parent. That stale comment is exactly why the
    // first budget looked sane on paper.)
    //
    // Real cost: road 8 layers + 6 drawings = 85 MB · bridge 8 + 8 = 98 MB. Together 183 MB,
    // and the old sum said 102 — so the window cheerfully held both and the tab died.
    function pageMB(i) {
      var p = pages[i];
      if (!p) return 0;
      if (p.__mb == null) {
        var L = p.getAttribute('data-layers');
        var n = L ? L.split(',').length : 0;
        // ⚠ EVERY PLANE COUNTS ITS OWN DRAWINGS. `BOIL_PLANE_N[i][name]` overrides `BOIL[i]`
        // per plane — on `ran` the Father runs on 2 while the sky wheels on 3 — so a single
        // page-wide number under-counts. That is the same mistake as counting `data-layers`
        // and ignoring the boil, one level down; it cost a crash once already.
        var pageNB = (typeof BOIL !== 'undefined' && BOIL[i]) || 1;
        var perPlane = (typeof BOIL_PLANE_N !== 'undefined' && BOIL_PLANE_N[i]) || {};
        var allow = (typeof BOIL_GLIMMER !== 'undefined' && BOIL_GLIMMER[i])
                 || (typeof BOIL_PLANES !== 'undefined' && BOIL_PLANES[i]);
        var names = allow || null;
        if (n) {
          if (names) {
            for (var q = 0; q < names.length; q++) {
              var nb = perPlane[names[q]] || pageNB;
              if (nb > 1) n += (nb > 2 ? nb : nb - 1);
            }
          } else if (pageNB > 1) {
            n += (pageNB > 2 ? pageNB : pageNB - 1);   // no list: the backmost plane alone
          }
          // ⚠ and a DIO_LIFE `light` plane is stacked TWICE — the runtime pulses a copy of it
          var life = (typeof DIO_LIFE !== 'undefined' && DIO_LIFE[i]) || {};
          n += (life.light || []).length;
        }
        p.__mb = n * PLANE_MB;
      }
      return p.__mb;
    }
    var keep = {}; keep[idx] = 1;
    var held = pageMB(idx);
    var order = dir > 0 ? [idx + 1, idx - 1, idx + 2] : [idx - 1, idx + 1, idx - 2];
    for (var oi = 0; oi < order.length; oi++) {
      var j = order[oi];
      if (j < 0 || j >= pages.length || keep[j]) continue;
      if (held + pageMB(j) > HOLD_MB) continue;      // no room for this one — try the next
      keep[j] = 1; held += pageMB(j);
    }
    // COLD START: nobody has swiped yet, so the look-ahead is pure speculation —
    // and it costs ~1 MB of planes racing the cover for the same bandwidth. On the
    // very first settle, build the cover ALONE; coverReady() lifts this the moment
    // the cover's own planes have landed (see buildDiorama), and so does the first
    // real swipe. Nothing is skipped — only reordered behind the page you can see.
    if (COLD) keep = { }, keep[idx] = 1;
    // ⚠ FREE FIRST, THEN BUILD. This is the bug that survived the budget: settle() used to
    // build the page you were arriving at and only afterwards tear down the one you left, so
    // for a moment BOTH existed. On the swipe road -> bridge that transient is 85 + 98 =
    // 183 MB — the budget was obeyed at rest and blown through in the turn, which is exactly
    // when Fred's phone died. Releasing before allocating makes the peak the same as the
    // steady state, and costs nothing: the outgoing page is already off-screen.
    pages.forEach(function (p, i) {
      if (built[i] && !keep[i]) {   // FREE every page the budget did not keep
        if (p.__scLayer) { freeSheets(p.__scLayer); p.__scLayer.remove(); p.__scLayer = null; }
        p.__seated = false;
        if (p.__dio) {
          var dd = p.querySelectorAll('.sc-dio');
          for (var k = 0; k < dd.length; k++) {
            var im = dd[k].querySelectorAll('img');
            for (var m = 0; m < im.length; m++) { im[m].src = ''; im[m].removeAttribute('srcset'); }   // drop the decoded bitmaps, not just the nodes
            dd[k].remove();
          }
          p.__dio = null;
          p.__boilQ = null; p.__boilGo = false; p.__artDone = false;
          var pic = p.querySelector('picture');
          if (pic) pic.style.opacity = (DIO[i] && i !== 0) ? '0' : '';
        }
        built[i] = false;
      }
    });
    ensure(idx);
    loadBoil(pages[idx]);   // the page being read gets its boil drawings once its planes are in
    if (!COLD) for (var kk in keep) if (+kk !== idx) ensure(+kk);
    pages.forEach(function (p, i) {
      if (p.__scLayer) p.__scLayer.classList.toggle('on', i === idx && !REDUCED && !FREEZE[i]);
    });
    if (INSPECT) pages.forEach(function (p2, i2) { if (built[i2]) { var f2 = fitOf(p2); if (f2) inspectPage(p2, i2, f2); } });
    restCenter();   // centre the wide plate on this page's focal point
    blinkLoop();
  }
  var sT = 0;
  // ---- ⚠ THE PAGE TURN IS A CAMERA MOVE, NOT A SLIDE ----
  // On every scroll frame each page in view gets `--sp`: how far it stands from the
  // middle of the screen, in pixels. Its planes each multiply that by their own depth
  // factor, so the far sky barely stirs while the near foreground sweeps across — the
  // scene opens up as you swipe into it and closes as you leave. One variable per page,
  // one rAF, no per-plane JS: the compositor does all of it.
  var _spRAF = 0;
  function scrollDepth() {
    _spRAF = 0;
    var w = book.clientWidth || innerWidth, sl = book.scrollLeft;
    var secs = book.children, first = Math.max(0, Math.floor(sl / w) - 1);
    for (var i = first; i < Math.min(secs.length, first + 3); i++) {
      var off = i * w - sl;                       // 0 when this page is centred
      var p = Math.max(-1, Math.min(1, off / w));
      // ease it so the motion is strongest mid-turn and settles to nothing at rest
      var e = p * (1 - Math.abs(p) * 0.35);
      secs[i].style.setProperty('--sp', (e * w * 0.34).toFixed(1) + 'px');
      // depth: nothing at rest, most as the page leaves the frame. Monotonic in |p| so a
      // half-swipe that falls back cannot pop — it just eases home.
      secs[i].style.setProperty('--spz', (Math.pow(Math.abs(p), 0.85) * 0.16).toFixed(4));
    }
  }
  book.addEventListener('scroll', function () {
    coverReady(); clearTimeout(sT); sT = setTimeout(settle, 110);
    if (_boilLive && pages[currentIdx()] !== _boilLive.page) stopBoil(_boilLive);   // leaving: its drawings stop downloading now
    if (!_spRAF) _spRAF = requestAnimationFrame(scrollDepth);
  }, { passive: true });
  scrollDepth();   // swiping means you want the next page NOW, cover or no cover
  var rT = 0;
  addEventListener('resize', function () {
    if (DIAG) diag('resize ' + innerWidth + 'x' + innerHeight);
    clearTimeout(rT);
    rT = setTimeout(function () {
      pages.forEach(function (p, i) {
        if (p.__scLayer) { freeSheets(p.__scLayer); p.__scLayer.remove(); p.__scLayer = null; }
        p.__seated = false; p.__boilQ = null; p.__boilGo = false; p.__artDone = false;
        if (p.__dio) { var dd = p.querySelectorAll('.sc-dio'); for (var k = 0; k < dd.length; k++) dd[k].remove(); p.__dio = null;
          var pic = p.querySelector('picture'); if (pic) pic.style.opacity = DIO[i] ? '0' : ''; }
      });
      built = {}; settle();
    }, 160);
  });

  /* ---- parallax / tilt-to-look: the background pans into its 6% overflow to
     reveal the cropped sides, the character layer floats a touch more (depth).
     Mouse drives it on desktop; phone TILT drives it — but iOS needs permission. ---- */
  if (!REDUCED) {
    // ⚠ NO HOVER PAN. Since June the mouse was the desktop stand-in for tilt: moving it
    // across the page panned the planes. Fred, Sep 8, on the cover: "why is it animating by
    // hover? dont change the philosophy. this is an interactive story book for kids" and
    // then "i want the scenes to animate without any input". A hover is not something a
    // child DOES — the book's motion is its own (the boil, the winds, the sprites) and its
    // interaction is deliberate (tap, tilt, swipe). So the pointer no longer drives the
    // camera; tilt still does on a phone, and a desktop reader sees the scene move by itself.

    var tilting = false, betaN = null;
    function onTilt(e) {
      if (e.gamma == null) return;
      tilting = true;
      // The phone is a WINDOW you look through. Horizontal = roll (gamma). Vertical =
      // pitch (beta), measured from the angle you're HOLDING it at (calibrated on the
      // first reading = "looking straight in"), so tipping the top toward/away peeks
      // up/down through the glass. Both feed the depth-parallax camera.
      if (betaN == null && e.beta != null) betaN = e.beta;
      var ny = (e.beta != null && betaN != null) ? (e.beta - betaN) / 24 : 0;
      panTo(-e.gamma / 22, ny);   // sign flipped on gamma: tilt LEFT reveals the LEFT edge
    }
    function startTilt() { addEventListener('deviceorientation', onTilt, true); }

    // iOS 13+ blocks deviceorientation until the reader grants motion access — and
    // that request MUST come from a real button tap. So show the same "tilt to
    // explore" pill episode one uses; its tap both grants permission and starts
    // the tilt. Android/desktop need no permission → start immediately, no pill.
    var DOE = window.DeviceOrientationEvent;
    var needsPerm = DOE && typeof DOE.requestPermission === 'function';
    if (!needsPerm) {
      if (DOE) startTilt();
    } else {
      var pill = document.createElement('button');
      pill.className = 'pano-hint'; pill.type = 'button'; pill.textContent = 'tilt to explore';
      pill.addEventListener('click', function () {
        var wantMotion = (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function')
          ? DeviceMotionEvent.requestPermission().catch(function () { return 'denied'; })
          : Promise.resolve('granted');
        Promise.all([DOE.requestPermission().catch(function () { return 'denied'; }), wantMotion])
          .then(function (rs) { if (rs[0] === 'granted') startTilt(); })
          .then(function () { pill.classList.add('gone'); });
      });
      if (matchMedia('(pointer:coarse)').matches) document.body.appendChild(pill);   // touch devices only
      // if tilt somehow starts anyway, retire the pill (and stop polling once done)
      var pillT = setInterval(function () {
        if (pill.classList.contains('gone')) { clearInterval(pillT); return; }
        if (tilting) { pill.classList.add('gone'); clearInterval(pillT); }
      }, 600);
    }
  }

  // iOS Safari ignores `touch-action:manipulation` and still double-tap-zooms
  // when a child plays with the characters. Cancel any touchend that lands
  // within 300ms of the previous one — that kills the synthetic double-tap zoom
  // while leaving single taps, swipes (touchmove), and pinch-zoom (2 fingers)
  // untouched. Guarded to single-finger taps so pinch is never blocked.
  var lastTap = 0;
  document.addEventListener('touchend', function (e) {
    if (e.touches && e.touches.length) return;          // still fingers down → not a tap
    var now = e.timeStamp || performance.now();
    if (now - lastTap <= 320) { e.preventDefault(); }   // the 2nd fast tap → no zoom
    lastTap = now;
  }, { passive: false });

  // Hide every diorama page's flat composite UP FRONT (it's the duller baked JPEG,
  // kept only so camMeasure can read its natural size). Now the crisp diorama is the
  // only thing ever seen; before a page's planes finish building it shows the book's
  // own dark background, never the old flat image (Fred: "swipe fast → see old pics").
  // …EXCEPT the cover (i === 0). It is the cold first paint: hiding it here left the
  // screen blank until ~2.4 MB of planes arrived, because the flat was already hidden
  // before buildDiorama's cross-fade could hold it up. The cover's flat now stays
  // visible and buildDiorama fades it out only once its planes have settled.
  pages.forEach(function (p, i) { if (DIO[i] && i !== 0) { var pic = p.querySelector('picture'); if (pic) pic.style.opacity = '0'; } });

  if (document.readyState === 'complete') settle();
  else addEventListener('load', settle);
})();
