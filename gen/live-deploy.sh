#!/bin/bash
# gen/live-deploy.sh — publish the book to https://balthazar.sh (the LIVE site).
# Oct 27, Fred: "ok time to put the new art as the default!" — the realism branch, surveyed on
# preview.balthazar.sh, became main. Same safety as gen/preview-deploy.sh: stamp, then deploy from a
# SNAPSHOT copy (a plate rebuilding in the background can never go up half-written), refuse on any
# image that fails to decode — and refuse outright unless main is checked out, so a work-in-progress
# branch can only ever reach the preview.
set -e
cd "$(dirname "$0")/.."
BR=$(git rev-parse --abbrev-ref HEAD)
if [ "$BR" != "main" ]; then echo "on '$BR', not main — live deploys only from main (use gen/preview-deploy.sh)"; exit 1; fi
python3 gen/stamp-index.py | tail -1
python3 gen/page-colors.py | tail -1
node gen/agent-text.mjs | tail -1
node gen/minify.mjs --check | tail -1
SNAP="${LIVE_SNAP:-/tmp/balthazar-live-snap}"
mkdir -p "$SNAP"
rsync -a --delete --exclude .git --exclude attic --exclude node_modules --exclude .wrangler ./ "$SNAP/"
python3 - "$SNAP" <<'E'
import sys, os
from PIL import Image
bad = []
for d in ('plates-vg', 'cast'):
    for f in os.listdir(os.path.join(sys.argv[1], d)):
        if f.lower().endswith(('.jpg', '.webp', '.png', '.avif')):
            try: Image.open(os.path.join(sys.argv[1], d, f)).load()
            except Exception as e: bad.append(f)
if bad: print('BROKEN IMAGES, not deploying:', bad[:20]); sys.exit(1)
print('snapshot images ok')
E
cd "$SNAP" && npx wrangler deploy 2>&1 | grep -E "Uploaded [0-9]+ of|Current Version|balthazar|rror" | tail -5
