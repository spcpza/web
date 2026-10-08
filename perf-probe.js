/* perf-probe.js — dev-only frame profiler. Inert unless the URL contains perf=1.
 * Wraps requestAnimationFrame to attribute per-callback self-time, and counts
 * hot Canvas2D calls (drawImage / getImageData / pattern fills) so the lag's
 * owner is named, not guessed. Prints PERFREPORT <json> to the console. */
(function () {
  if (location.search.indexOf('perf=1') < 0) return;
  var t0 = performance.now();
  var cbs = {};            // key -> {n, ms, max}
  var c2d = { drawImage: { n: 0, ms: 0 }, getImageData: { n: 0, ms: 0 }, fill: { n: 0, ms: 0 }, fillRect: { n: 0, ms: 0 }, filterSets: 0 };
  function key(fn) {
    var s = String(fn);
    for (var marks = ['__charFrames', 'panoSync', 'unify'], i = 0; i < marks.length; i++) if (s.indexOf(marks[i]) >= 0) return 'character.js#frame';
    if (s.indexOf('renderView') >= 0 || s.indexOf('scrollLeft / book.clientWidth') >= 0 || s.indexOf('disposeView') >= 0) return 'paint-live.js#frame';
    var h = 0; for (var j = 0; j < s.length && j < 400; j++) h = (h * 31 + s.charCodeAt(j)) | 0;
    return 'anon@' + (h >>> 0).toString(36) + ':' + s.slice(0, 48).replace(/\s+/g, ' ');
  }
  var RAF = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) {
    return RAF(function (ts) {
      var k = key(cb), a = performance.now();
      cb(ts);
      var d = performance.now() - a;
      var e = cbs[k] || (cbs[k] = { n: 0, ms: 0, max: 0 });
      e.n++; e.ms += d; if (d > e.max) e.max = d;
    });
  };
  var slowCalls = [];
  function wrap(proto, name) {
    var orig = proto[name];
    proto[name] = function () {
      var a = performance.now();
      var r = orig.apply(this, arguments);
      var d = performance.now() - a;
      c2d[name].n++; c2d[name].ms += d;
      if (d > 40 && slowCalls.length < 8) slowCalls.push({ fn: name, ms: Math.round(d), stack: String(new Error().stack).split('\n').slice(1, 4).join(' | ') });
      return r;
    };
  }
  wrap(CanvasRenderingContext2D.prototype, 'drawImage');
  wrap(CanvasRenderingContext2D.prototype, 'getImageData');
  wrap(CanvasRenderingContext2D.prototype, 'fill');
  wrap(CanvasRenderingContext2D.prototype, 'fillRect');
  try {
    var fdesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'filter');
    if (fdesc && fdesc.set) Object.defineProperty(CanvasRenderingContext2D.prototype, 'filter', {
      get: fdesc.get, set: function (v) { c2d.filterSets++; fdesc.set.call(this, v); }, configurable: true,
    });
  } catch (e) {}
  function report(tag) {
    var wall = performance.now() - t0;
    var glr = 'n/a';
    try {
      var gc = document.createElement('canvas'), gl = gc.getContext('webgl');
      var ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) glr = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    } catch (e) {}
    var canv = [];
    document.querySelectorAll('canvas').forEach(function (c) { if (c.width > 4) canv.push((c.className || 'gl') + ' ' + c.width + 'x' + c.height); });
    console.log('PERFREPORT ' + tag + ' ' + JSON.stringify({
      wallMs: Math.round(wall), dpr: devicePixelRatio, gl: glr, canvases: canv,
      rafCallbacks: cbs, canvas2d: c2d, slowCalls: slowCalls,
    }));
  }
  setTimeout(function () { report('T6'); }, 6000);
  setTimeout(function () { report('T12'); }, 12000);
})();
