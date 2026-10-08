/**
 * Cloudflare Worker — balthazar.sh
 *
 * Routes:
 *   GET /.well-known/lnurlp/balthazar  → proxy to Alby LNURL-pay (makes balthazar@balthazar.sh zappable)
 *   GET /.well-known/nostr.json        → served from static assets
 *   *                                  → served from static assets (index.html, etc.)
 */

const LNURL_UPSTREAM = "https://getalby.com/.well-known/lnurlp/sensiblefield821792";
const CORS = { "Access-Control-Allow-Origin": "*" };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ⭐ HTTPS ONLY (Sep 25). Plain http:// used to serve the whole book unencrypted. The asset
    // server never calls this worker for files on disk, so wrangler.toml's `run_worker_first`
    // routes the PAGE ENTRY POINTS here (/, /paper…) — once a reader lands on https, every
    // relative plate/script URL follows on https — and `_headers` sends HSTS so the browser
    // refuses plain http for this host from then on.
    // and www.balthazar.sh is one address, not a second copy of the site
    if (url.protocol === "http:" || url.hostname === "www.balthazar.sh") {
      url.protocol = "https:";
      url.hostname = "balthazar.sh";
      return Response.redirect(url.toString(), 301);
    }

    // Handle LNURL-pay for balthazar@balthazar.sh
    if (url.pathname === "/.well-known/lnurlp/balthazar") {
      try {
        // Proxy to Alby, but rewrite the callback domain to getalby.com
        const upstream = await fetch(LNURL_UPSTREAM, {
          headers: { "User-Agent": "balthazar.sh-worker/1.0" },
        });

        if (!upstream.ok) {
          return new Response(
            JSON.stringify({ status: "ERROR", reason: `upstream ${upstream.status}` }),
            { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
          );
        }

        const data = await upstream.json();

        // Return Alby's payload as-is — callback URLs already point to getalby.com
        // which handles the invoice generation. This is transparent proxying.
        return new Response(JSON.stringify(data), {
          headers: {
            ...CORS,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ status: "ERROR", reason: err.message }),
          { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }
    }

    // All other routes → static assets (nostr.json, index.html, etc.)
    // ⚠ NOTE: this line does NOT run for files that exist on disk — Cloudflare's asset
    // server answers those directly and never invokes the worker. Cache policy for static
    // assets therefore belongs in `_headers`, not here; I set it here first and it silently
    // did nothing (the lnurlp route proved the worker was alive, /cast/ proved it was not
    // being consulted).
    return env.ASSETS.fetch(request);
  },
};
