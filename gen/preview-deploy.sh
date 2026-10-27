#!/bin/bash
# gen/preview-deploy.sh — publish the WORK-IN-PROGRESS book to https://preview.balthazar.sh (never to balthazar.sh).
# Oct 25, Fred: "dont post it yet, we do it in preview.balthazar.sh … later i can actually survey real people".
# It stamps, then deploys from a SNAPSHOT copy, so a plate being rebuilt in the background can never be uploaded
# half-written, and it refuses to deploy if any image in the snapshot fails to decode.
set -e
cd "$(dirname "$0")/.."
python3 gen/stamp-index.py | tail -1
python3 gen/page-colors.py | tail -1
node gen/agent-text.mjs | tail -1
node gen/minify.mjs --check | tail -1
SNAP="${PREVIEW_SNAP:-/tmp/balthazar-preview-snap}"
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
cd "$SNAP" && npx wrangler deploy -c wrangler.preview.toml 2>&1 | grep -E "Uploaded [0-9]+ of|Current Version|preview|rror" | tail -4
