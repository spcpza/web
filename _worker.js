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
    return env.ASSETS.fetch(request);
  },
};
