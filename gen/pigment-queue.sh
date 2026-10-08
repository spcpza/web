#!/bin/bash
# THE PIGMENT QUEUE (Sep 14, 2026). Fred: "now do the same manual gradient for the rest of the
# pages… yes i like it." Rebuilds every plate with PIGMENT=7 and the frames it already has.
cd /Users/f/Sites/balthazar-sh
export PIGMENT=7
ORDER="beginning flame made love turning garden lost string looking road bridge paid grave risen ran gift twoways washed born seeds bread storm hands family prayer light come together candle comes nonight word"
PING="beginning made love turning lost looking ran light comes"
for p in $ORDER; do
  echo "== $p $(date +%H:%M)"
  # which frames does this plate keep on disk?
  K=$(ls plates-vg/$p-*-b[0-9]*.* 2>/dev/null | sed -E 's/.*-b([0-9]+)\..*/\1/' | sort -n | uniq | tr '\n' ' ')
  MAXK=$(echo $K | tr ' ' '\n' | sort -n | tail -1)
  node gen/build.mjs $p 2>&1 | grep -v "^skip" | tail -1
  if [ "$p" = "word" ]; then
    for f in $(seq 1 12); do BOIL_FRAME=$f BOIL_N=12 node gen/build.mjs word 2>&1 | grep -v "^skip" | tail -1; done
    rm -f plates-vg/word-s?-b[2-9].* plates-vg/word-s?-b1[0-2].* plates-vg/word-bg-b*.* plates-vg/word-fg-b*.*
    node gen/export-live.mjs 2>&1 | tail -1
  elif [ -z "$K" ]; then
    echo "   (no frames)"
  elif [ "$MAXK" = "3" ] && echo " $PING " | grep -q " $p "; then
    BOIL_FRAME=3 BOIL_N=6 node gen/build.mjs $p 2>&1 | grep -v "^skip" | tail -1   # the 2-drawing ping uses drawing 3 of a six-step clock
  elif [ "$MAXK" = "1" ]; then
    BOIL_FRAME=1 BOIL_N=2 node gen/build.mjs $p 2>&1 | grep -v "^skip" | tail -1
  else
    for f in $(seq 1 $MAXK); do BOIL_FRAME=$f BOIL_N=$MAXK node gen/build.mjs $p 2>&1 | grep -v "^skip" | tail -1; done
  fi
done
echo "QUEUE-DONE $(date +%H:%M)"
