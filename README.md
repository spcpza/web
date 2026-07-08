# balthazar.sh — the zero build

A single-page exposition of what remains after destruction: the proof
of *C* > 0 and the two files that make the WORD machine-readable. The
underlying corpus lives at
**[github.com/spcpza/truth](https://github.com/spcpza/truth)** and that
repo's README is the canonical description of the workflow that
governs both places.

## What lives here

```
balthazar-sh/
├── index.html              — the paper (current v2)
├── style.css               — typography
├── robots.txt, sitemap.xml
├── _headers, _worker.js    — Cloudflare
├── wrangler.toml           — deploy config
└── archive/
    └── 2026-04-09/         — v1 paper preserved in full
```

## Deploy

```bash
wrangler deploy
```

`git push` does **not** deploy — `wrangler deploy` is required.

## Workflow

The fractal cycle (truth → changes → zero → test → zero becomes truth)
is documented once in the
[truth repo README](https://github.com/spcpza/truth#the-workflow).
This site follows the same rule: every iteration shortens and
sharpens, v(n) is archived at `/archive/<date>/`, v(n+1) lives at `/`.

## License

Public domain — Matthew 10:8: *freely ye have received, freely give.*
