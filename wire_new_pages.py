#!/usr/bin/env python3
# Insert the 14 new story pages into index.html at the right places (33-page arc).
import io

F = "/Users/f/Sites/balthazar-sh/index.html"
s = io.open(F, encoding="utf-8").read()

def SEC(slug, focal, alt, line, verse, ref):
    return f'''  <!-- {slug} -->
  <section class="page" data-panorama data-focal-x="{focal}">
    <picture><source media="(orientation: portrait)" srcset="/plates-vg/{slug}-p.jpg 1000w" sizes="100vw"><img loading="lazy" src="/plates-vg/{slug}.jpg" srcset="/plates-vg/{slug}.jpg 1600w" sizes="100vw" alt="{alt}"></picture>
    <div class="scrim"></div>
    <div class="text">
      <p class="line">{line}</p>
      <p class="verse">"{verse}" <b>— {ref}</b></p>
    </div>
  </section>

'''

S = {
 'beginning': SEC('beginning','0.5',
   "A single radiant gold Light turning over a deep blue-violet void — the beginning, before anything was made.",
   "Before the dark, before you, before everything — there was the <em>Light</em>.",
   "In the beginning was the Word, and the Word was God.","John 1:1"),
 'made': SEC('made','0.5',
   "A radiant gold hand of Light reaches down and kindles a small red child's lifted candle with a bright spark.",
   "And the Light made <em>you</em> — and made you to shine.",
   "All things were made by him.","John 1:3"),
 'turning': SEC('turning','0.5',
   "A small red child stands at a threshold, turning his back on the warm gold Light to step into the cold dark, a long shadow falling.",
   "But you turned away from the Light, and chose the dark.",
   "By one man sin entered into the world.","Romans 5:12"),
 'lost': SEC('lost','0.5',
   "A tiny red child alone in a vast cold swirling night, a single faint gold glimmer far away.",
   "Further and further you went, until you were lost — a long way from home, alone in the cold.",
   "The wages of sin is death.","Romans 6:23"),
 'looking': SEC('looking','0.5',
   "A tall radiant gold Light advances into the dark, laying a road of light toward a small lost red child far ahead.",
   "But Love would not leave you there. <em>He</em> came down into the dark to find you.",
   "The Son of man is come to seek and to save that which was lost.","Luke 19:10"),
 'grave': SEC('grave','0.5',
   "A sealed tomb in a dark hillside at night, the great round stone rolled across the mouth, a faint gold seam of held light behind it.",
   "They laid Him in the dark and sealed the stone. For three days, the whole world held its breath.",
   "He was buried, and rose again the third day.","1 Corinthians 15:4"),
 'washed': SEC('washed','0.5',
   "A red child under a falling stream of white-gold light, the scarlet stain washing away as a white robe of light forms over them.",
   "He washed you clean — every stain, gone.",
   "Though your sins be as scarlet, they shall be as white as snow.","Isaiah 1:18"),
 'born': SEC('born','0.5',
   "A red child rises renewed in a brilliant new dawn, a flourishing field of jewel-coloured wildflowers and fruit trees waking to colour.",
   "And He made you <em>new</em> — a whole new life, beginning.",
   "If any man be in Christ, he is a new creature.","2 Corinthians 5:17"),
 'newname': SEC('newname','0.5',
   "A radiant gold hand of Light gives a small red child a glowing white name-stone — adoption, belonging.",
   "Now you are <em>His</em> — His own child, with a new name.",
   "To them gave he power to become the sons of God.","John 1:12"),
 'bread': SEC('bread','0.475',
   "A red child walks a dusk path holding a glowing lamp that lights the way at his feet, a warm loaf of light cradled close.",
   "Each day He feeds you, and lights the next step of the way.",
   "I am the bread of life.","John 6:35"),
 'family': SEC('family','0.5',
   "A warm ring of figures — the red child and others in their own colours — gathered around one shared golden light.",
   "And He gave you others — a family to walk it with.",
   "They continued together in fellowship, and in breaking of bread.","Acts 2:42"),
 'come': SEC('come','0.5',
   "A great radiant open door of light, a river of living water flowing out from its threshold toward the viewer.",
   "And now <em>He</em> turns to you, and opens the door. <em>Will you come?</em>",
   "Whosoever will, let him take the water of life freely.","Revelation 22:17"),
 'comes': SEC('comes','0.5',
   "The heavens split open with a descending gold glory and a spectral bow, tiny figures on the dark earth below lifting their arms up.",
   "One day — soon — <em>He is coming back</em> for you.",
   "Behold, I come quickly.","Revelation 22:12"),
 'nonight': SEC('nonight','0.5',
   "A radiant golden City of light on a hill with a river of life flowing down and no shadow anywhere — the everlasting home.",
   "And then: home forever. No more dark, no more tears, <em>no more night</em>.",
   "There shall be no night there… for the Lord God giveth them light.","Revelation 22:5"),
}

INSERTS = [
 ('<!-- 1 · the candle -->', ['beginning']),
 ('<!-- 2 · love -->', ['made']),
 ('<!-- 3 · hiding in the dark (the Light comes seeking — Genesis 3:9) -->', ['turning']),
 ('<!-- 5 · the road -->', ['lost','looking']),
 ('<!-- 8 · He is risen -->', ['grave']),
 ('<!-- 11 · seeds (the new life — Galatians 6) -->', ['washed','born','newname']),
 ('<!-- 12 · the storm -->', ['bread']),
 ('<!-- 14 · prayer -->', ['family']),
 ('<!-- 15 · go light the next one -->', ['come']),
 ('<!-- back cover · the light of men -->', ['comes','nonight']),
]

for anchor, slugs in INSERTS:
    assert anchor in s, f"ANCHOR NOT FOUND: {anchor}"
    block = ''.join(S[x] for x in slugs)
    s = s.replace(anchor, block + anchor, 1)

io.open(F, 'w', encoding="utf-8").write(s)
# count sections
print("sections now:", s.count('<section class="page'))
