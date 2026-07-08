/* pano.js — MOBILE PANORAMA input (prototype on the "ran" page).
 *
 * A landscape painting can't fit a portrait phone — so don't crop it. The phone
 * becomes a WINDOW that moves across the full painting: tilt the phone and the
 * painting pans, exploring the whole landscape at your own pace (like an iOS
 * panorama). The actual rendering + panning lives in paint-live.js, so the
 * LIVING filter (light effects) pans with you; this file only feeds the tilt
 * signal and handles the one-time "tilt to explore" enable (iOS permission).
 *
 * window.__panoTilt  — left/right tilt in degrees, or null until a sensor reports
 *                      (paint-live reads it; null ⇒ gentle auto-drift fallback). */
(function () {
  'use strict';
  var book = document.getElementById('book');
  if (!book || !book.querySelector('.page[data-panorama]')) return;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;  // paint-live (and the pano) don't run here
  function isPortrait() { return window.innerHeight >= window.innerWidth; }

  window.__panoTilt = null;   // left/right tilt (gamma) → horizontal pan
  window.__panoTiltY = null;  // forward/back tilt (beta) → dolly / vertical
  // GAME-GRADE INPUT: deviceorientation gives the ABSOLUTE tilt but some browsers
  // throttle it; the raw GYROSCOPE (devicemotion.rotationRate) runs at full rate.
  // So: integrate the gyro as a short-lived PREDICTION on top of the latest
  // absolute fix — the prediction resets at every orientation event, so a wrong
  // sign or drift is bounded by one event interval. Full rate, near-zero latency.
  var baseG = null, baseB = null, accG = 0, accB = 0, lastM = 0;
  function publish() {
    if (baseG !== null) window.__panoTilt = baseG + accG;
    if (baseB !== null) window.__panoTiltY = baseB + accB;
  }
  function onOrient(e) {
    if (!e) return;
    if (e.gamma !== null && e.gamma !== undefined) { baseG = e.gamma; accG = 0; }
    if (e.beta !== null && e.beta !== undefined) { baseB = e.beta; accB = 0; }
    publish();
  }
  function onMotion(e) {
    var rr = e && e.rotationRate; if (!rr) return;
    var now = performance.now();
    var dt = lastM ? Math.min(0.05, (now - lastM) / 1000) : 0; lastM = now;
    if (!dt || baseG === null) return;
    if (rr.gamma !== null && rr.gamma !== undefined) accG += rr.gamma * dt;   // rotation about the device y-axis
    if (rr.beta !== null && rr.beta !== undefined) accB += rr.beta * dt;      // rotation about the device x-axis
    publish();
  }
  function startTilt() {
    window.addEventListener('deviceorientation', onOrient, true);
    if (window.DeviceMotionEvent) window.addEventListener('devicemotion', onMotion, true);
  }
  function needsPermission() {
    return typeof DeviceOrientationEvent !== 'undefined'
      && typeof DeviceOrientationEvent.requestPermission === 'function';
  }

  // the "tilt to explore" pill — on iOS this tap also grants motion permission
  var hint = document.createElement('button');
  hint.className = 'pano-hint'; hint.type = 'button'; hint.textContent = 'tilt to explore';
  hint.addEventListener('click', function () {
    if (needsPermission()) {
      var wantMotion = (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function')
        ? DeviceMotionEvent.requestPermission().catch(function () { return 'denied'; })
        : Promise.resolve('granted');
      Promise.all([DeviceOrientationEvent.requestPermission().catch(function () { return 'denied'; }), wantMotion])
        .then(function (rs) { if (rs[0] === 'granted') startTilt(); })
        .then(function () { hint.classList.add('gone'); });
    } else { startTilt(); hint.classList.add('gone'); }
  });
  function currentIsPano() {
    var idx = Math.round(book.scrollLeft / book.clientWidth);
    var pg = book.querySelectorAll('.page')[idx];
    return !!(pg && pg.hasAttribute('data-panorama'));
  }
  function placeHint() {
    var want = !reduce && isPortrait() && coarse && !hint.classList.contains('gone') && currentIsPano();
    if (want && !hint.parentNode) document.body.appendChild(hint);
    else if (!want && hint.parentNode) hint.parentNode.removeChild(hint);
  }

  // Where the browser allows motion WITHOUT a tap (Android, desktop), start the
  // sensor immediately so the painting is pannable by tilt by default — no button.
  // (iOS forbids motion until a tap, so there the pill shows and the painting
  // auto-pans until tapped.) paint-live blends in a gentle auto-pan whenever the
  // phone is held still, so it stays legible for readers who never tilt.
  if (!needsPermission() && window.DeviceOrientationEvent) startTilt();
  setInterval(function () { if (window.__panoTilt !== null && hint.parentNode) hint.classList.add('gone'); }, 500);

  // ZOOM GESTURES REMOVED (Fred, Jul 7: "remove the zoom-in for now, just keep
  // the art — let's make the art better first"). The camera vocabulary (dolly/
  // arc/rise) stays in paint-live for the destination-scene build; only the
  // gentle idle breathing animates depth now. __pinchZ stays 0.
  window.__pinchZ = 0; window.__pinchT = 0;

  book.addEventListener('scroll', placeHint, { passive: true });
  window.addEventListener('resize', placeHint);
  window.addEventListener('orientationchange', function () { setTimeout(placeHint, 220); });
  placeHint();
})();
