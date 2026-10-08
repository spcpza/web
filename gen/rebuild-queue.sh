#!/bin/bash
# generic rebuild queue: ./gen/rebuild-queue.sh plate plate ... — each plate + the frames it keeps on disk
cd /Users/f/Sites/balthazar-sh
# WATCHDOG (Sep 22): the headless-Chrome rasterizer can hang at 0% CPU on one frame — it cost a night once
# (bridge sky1-b1 sat idle 3h47m). Every build runs under a 40-minute limit; a hung one is killed and the
# queue moves on. The log line says KILLED so the frame can be rebuilt by hand afterwards.
build() {   # build <env…> — runs `env … node gen/build.mjs` with a time limit
  ( env "${@:1:$#-1}" node gen/build.mjs "${!#}" 2>&1 | grep -v "^skip" | tail -1 ) &
  local bp=$!; local n=0
  while kill -0 $bp 2>/dev/null; do sleep 10; n=$((n+10)); if [ $n -ge 2400 ]; then echo "   KILLED after 40 min: $*"; pkill -P $bp 2>/dev/null; kill $bp 2>/dev/null; pkill -f "vg-${!#}-" 2>/dev/null; break; fi; done
  wait $bp 2>/dev/null
}
PING="beginning made love turning lost looking ran light comes"
for p in "$@"; do
  echo "== $p $(date +%H:%M)"
  K=$(ls plates-vg/$p-*-b[0-9]*.* 2>/dev/null | sed -E 's/.*-b([0-9]+)\..*/\1/' | sort -n | uniq | tr '\n' ' ')
  MAXK=$(echo $K | tr ' ' '\n' | sort -n | tail -1)
  build X=1 $p
  if [ "$p" = "word" ]; then
    for f in $(seq 1 12); do build BOIL_FRAME=$f BOIL_N=12 word; done
    rm -f plates-vg/word-s?-b[2-9].* plates-vg/word-s?-b1[0-2].* plates-vg/word-bg-b*.* plates-vg/word-fg-b*.*
    node gen/export-live.mjs 2>&1 | tail -1
  elif [ -z "$K" ]; then echo "   (no frames)"
  elif [ "$MAXK" = "3" ] && echo " $PING " | grep -q " $p "; then build BOIL_FRAME=3 BOIL_N=6 $p
  elif [ "$MAXK" = "1" ]; then build BOIL_FRAME=1 BOIL_N=2 $p
  else for f in $(seq 1 $MAXK); do build BOIL_FRAME=$f BOIL_N=$MAXK $p; done
  fi
done
echo "QUEUE-DONE $(date +%H:%M)"
