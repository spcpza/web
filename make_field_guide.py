#!/usr/bin/env python3
# "The Hidden Gospel" — an ILLUSTRATED field guide to the secrets of balthazar.sh.
# Each secret is shown on its plate with the spot circled, its reference in the
# ORIGINAL TONGUE (Koine Greek / Hebrew), the scripture, and what it means.
import os
from PIL import Image, ImageDraw, ImageFilter
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, PageBreak, KeepTogether, Image as RLImage, HRFlowable)
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PLATES = "/Users/f/Sites/balthazar-sh/plates-vg"
TMP = "/tmp/guide"; os.makedirs(TMP, exist_ok=True)
OUT = "/Users/f/The-Hidden-Gospel.pdf"

CREAM, INK, GOLD, GOLD_L, FAINT = (HexColor(0xf7f0db), HexColor(0x33271a),
        HexColor(0x9c6f1f), HexColor(0xb98a30), HexColor(0x7a6a4e))

UNI = None
for p in ["/Library/Fonts/Arial Unicode.ttf", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"]:
    if os.path.exists(p):
        try: pdfmetrics.registerFont(TTFont("Uni", p)); UNI = "Uni"; break
        except Exception: pass
def uni(s): return f'<font name="{UNI}">{s}</font>' if UNI else s

# ---- the secrets, in book order. markers in logical 800x500; (x, y, radius) ----
E = [
 dict(plate="word", mk=[(400,250,150)], title="The covers — the whole Bible as a galaxy",
   find="The first and last pages: every verse of Scripture set as a star. One scarlet thread runs through the whole.",
   ref="Genesis 3:15 → Revelation 22:13", lang="Hebrew → Greek",
   verse="“…it shall bruise thy head…” — “I am Alpha and Omega… the first and the last.”",
   mean="One scarlet thread of redemption runs from the first promise to the last word — the whole book is about Him."),
 dict(plate="flame", mk=[(723,56,40)], title="The candle — a number in the swirling sky",
   find="Upper-right, traced into the brushstrokes of the night (with three bright stars in a row).",
   ref=uni("Γʹ·ΙϚʹ"), lang="Koine Greek (3:16)",
   verse="“For God so loved the world, that he gave his only begotten Son…” — John 3:16",
   mean="The whole gospel in one verse, hidden where the Light first breaks the dark."),
 dict(plate="love", mk=[(402,466,34)], title="Love — a number cut in the field",
   find="In the dark earth below the two figures sharing bread.",
   ref=uni("Δʹ·Ηʹ"), lang="Koine Greek (4:8)",
   verse="“He that loveth not knoweth not God; for God is love.” — 1 John 4:8",
   mean="What the Light IS, named in John’s own Greek: God is love."),
 dict(plate="garden", mk=[(356,86,46),(346,482,34)], title="The garden — a cross in the stars, a question in the road",
   find="Seven stars resolve into a cross above the hiding child; and on the bright road, two Hebrew letters.",
   ref=uni("☧") + " &nbsp;+&nbsp; " + uni("ג·ט"), lang="Psalm 19:1 / Hebrew (Gen 3:9)",
   verse="“The heavens declare the glory of God…” — “…Where art thou?”",
   mean="The gospel is even written in the sky; and God’s first question to the hiding sinner is still asked of you."),
 dict(plate="string", mk=[(250,150,150)], title="The drift — count the flock",
   find="Birds ride the gale. Thirty-one are deep maroon; three are green. Count them.",
   ref=uni("לא·ג") + "  (31 : 3)", lang="Hebrew (Jeremiah 31:3)",
   verse="“…with lovingkindness have I drawn thee.” — Jeremiah 31:3",
   mean="Why the string never snaps: an everlasting love has drawn you."),
 dict(plate="road", mk=[(120,250,40),(430,300,40)], title="The road — alpha and omega stones",
   find="A stone scratched α where the road began (far back, left); Ω where it ends at the brink.",
   ref=uni("Α · Ω"), lang="Koine Greek (Rev 22:13)",
   verse="“I am Alpha and Omega, the beginning and the end…” — Revelation 22:13",
   mean="The same Light is the start and the finish of your whole journey home."),
 dict(plate="bridge", mk=[(236,305,34)], title="The bridge — a milestone at the way’s foot",
   find="A small grey stone at the near foot of the cross-bridge.",
   ref=uni("ΙΔʹ·Ϛʹ"), lang="Koine Greek (14:6)",
   verse="“I am the way, the truth, and the life…” — John 14:6",
   mean="The only way across to the Father — and the bridge was a cross."),
 dict(plate="paid", mk=[(165,462,34)], title="The cross — a number in the dark hill",
   find="Lower-left of Golgotha, where darkness covers the land at noon.",
   ref=uni("ΙΕʹ·Γʹ"), lang="Koine Greek (15:3)",
   verse="“…Christ died for our sins according to the scriptures…” — 1 Corinthians 15:3",
   mean="Why the sun goes black: He died for your sins, in your place."),
 dict(plate="risen", mk=[(150,96,40),(312,446,34)], title="He is risen — the fish, and a number on the hill",
   find="The ΙΧΘΥΣ fish scratched in the dawn (upper-left); a Greek number cut in the hill (lower-left). The stone is rolled clear.",
   ref=uni("ΙΧΘΥΣ") + "  +  " + uni("ΙΑʹ·ΚΕʹ"), lang="Greek (11:25)",
   verse="“I am the resurrection, and the life…” — John 11:25",
   mean="The fish spells ‘Jesus Christ, Son of God, Saviour’; the grave could not hold Him — nor you."),
 dict(plate="gift", mk=[(375,332,26),(438,186,24)], title="The gift — a mustard seed, and a scar",
   find="A single tiny seed in the child’s open palm; and a small dark mark in the giving wrist.",
   ref="a mustard seed &amp; a scar", lang="Matthew 17:20 / John 20:25",
   verse="“…If ye have faith as a grain of mustard seed…” — Matthew 17:20",
   mean="Faith only has to be this small; the wound that bought the gift is not hidden."),
 dict(plate="ran", mk=[(470,300,40)], title="He ran — the ring on his hand",
   find="A ring catching the light on the running father’s outstretched hand (and wheat bent into a crown).",
   ref="a ring", lang="Luke 15:22",
   verse="“…put a ring on his hand, and shoes on his feet…” — Luke 15:22",
   mean="The Father runs and restores you as a son — robe, ring, and shoes."),
 dict(plate="twoways", mk=[(401,240,30)], title="Carried home — the word on the door",
   find="Cut into the gold lintel above the glowing door of the Father’s house.",
   ref=uni("Ιʹ·Θʹ"), lang="Koine Greek (10:9)",
   verse="“I am the door: by me if any man enter in, he shall be saved…” — John 10:9",
   mean="He is the door; enter by Him, and you are saved."),
 dict(plate="seeds", mk=[(730,476,34)], title="The sowing — a number in the furrow",
   find="Lower-right of the field (with exactly seven gold seeds in the air).",
   ref=uni("Ϛʹ·Ζʹ"), lang="Koine Greek (6:7)",
   verse="“…whatsoever a man soweth, that shall he also reap.” — Galatians 6:7",
   mean="The sober kindness of the harvest: what you sow, you reap."),
 dict(plate="storm", mk=[(115,60,40)], title="The storm — a number in the churn",
   find="Upper-left of the gale (and the tree’s deepest root curls into a tiny anchor).",
   ref=uni("Εʹ·Γʹ"), lang="Koine Greek (5:3)",
   verse="“…tribulation worketh patience…” — Romans 5:3",
   mean="Even the storm has a purpose: it works patience in you."),
 dict(plate="prayer", mk=[(705,262,34)], title="Prayer — a number in the wall’s shadow",
   find="Far right, one shade above the dark (with three brighter knots on the rising thread: ask, seek, knock).",
   ref=uni("Ζʹ·Ζʹ"), lang="Koine Greek (7:7)",
   verse="“Ask, and it shall be given you; seek… knock…” — Matthew 7:7",
   mean="Ask, seek, knock — and it opens. He always answers."),
 dict(plate="window", mk=[(456,462,40)], title="The clean window — a number, written backwards",
   find="In the fogged glass, lower-right — mirror-reversed. Hold it to a mirror to read the old Greek number.",
   ref=uni("ΙΓʹ·ΙΒʹ"), lang="Koine Greek (13:12)",
   verse="“For now we see through a glass, darkly; but then face to face…” — 1 Corinthians 13:12",
   mean="Now we see dimly, as in a mirror; then, face to face. The cipher is the message."),
 dict(plate="light", mk=[(400,250,42),(400,437,44)], title="He is the Light — a heart, and His Name",
   find="A heart traced in the innermost ring; and, in the gold light below the core, His Name in Aramaic.",
   ref="a heart &nbsp;+&nbsp; " + uni("ישוע"), lang="1 John 4:8 / Aramaic (Matt 1:21)",
   verse="“…thou shalt call his name JESUS: for he shall save his people…” — Matthew 1:21",
   mean="The Name brushed in the light is Yeshua — ‘he shall save’; and the heart: God is love."),
 dict(plate="candle", mk=[(352,452,30),(462,452,30)], title="Go light the next one — the invitation, and the answer",
   find="Cut faint into the floor beneath the two children, where the one flame is passed on. The book's last secret.",
   ref=uni("Γʹ·Κʹ") + " &nbsp;+&nbsp; " + uni("Αʹ·ΙΒʹ"), lang="Koine Greek (Rev 3:20 · John 1:12)",
   verse="“Behold, I stand at the door, and knock…” — “…as many as received him, to them gave he power to become the sons of God.”",
   mean="The whole book finally turns to you: He knocks — open, and receive Him; and to you He gives power to become a child of the Light. Then go light the next one."),
]

# ---- generate the marked thumbnails ----
def mark(entry):
    src = os.path.join(PLATES, entry["plate"] + ".jpg")
    im = Image.open(src).convert("RGB")
    W, H = im.size                       # 1600x1000
    sx, sy = W / 800.0, H / 500.0
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for (lx, ly, r) in entry["mk"]:
        cx, cy, R = lx * sx, ly * sy, r * sx
        d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=(255, 214, 74, 255), width=max(4, int(R * 0.10)))
    ov = ov.filter(ImageFilter.GaussianBlur(0.6))
    im = Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB")
    im.thumbnail((900, 900))
    out = os.path.join(TMP, entry["plate"].replace("-", "_") + ".jpg")
    im.save(out, quality=86)
    return out, im.size

# ---- styles ----
def S(n, **k):
    b = dict(fontName="Times-Roman", fontSize=10, leading=13.5, textColor=INK); b.update(k); return ParagraphStyle(n, **b)
st_title = S("t", fontName="Times-Bold", fontSize=29, leading=33, textColor=GOLD, alignment=TA_CENTER)
st_sub   = S("s", fontName="Times-Italic", fontSize=12.5, leading=17, alignment=TA_CENTER)
st_epi   = S("e", fontName="Times-Italic", fontSize=11.5, leading=17, alignment=TA_CENTER)
st_epir  = S("er", fontName="Times-Bold", fontSize=10, textColor=GOLD, alignment=TA_CENTER)
st_h     = S("h", fontName="Times-Bold", fontSize=12.5, leading=15, textColor=INK, spaceBefore=2)
st_find  = S("f", fontName="Times-Italic", fontSize=9.3, leading=12.5, textColor=FAINT)
st_ref   = S("r", fontName="Times-Bold", fontSize=12, leading=15, textColor=GOLD)
st_verse = S("v", fontName="Times-Italic", fontSize=9.8, leading=13, leftIndent=10)
st_mean  = S("m", fontSize=9.8, leading=13)
st_close = S("c", fontName="Times-Italic", fontSize=13, textColor=GOLD, alignment=TA_CENTER)

def rule(c=GOLD_L, w=0.8, b=2, a=6): return HRFlowable(width="100%", thickness=w, color=c, spaceBefore=b, spaceAfter=a, lineCap="round")

def bg(canvas, doc):
    canvas.saveState(); w, h = A4
    canvas.setFillColor(CREAM); canvas.rect(0, 0, w, h, fill=1, stroke=0)
    canvas.setStrokeColor(GOLD_L); canvas.setLineWidth(1.3); canvas.rect(11*mm, 11*mm, w-22*mm, h-22*mm)
    canvas.setLineWidth(0.5); canvas.rect(13*mm, 13*mm, w-26*mm, h-26*mm)
    canvas.setFont("Times-Italic", 8.5); canvas.setFillColor(FAINT)
    canvas.drawCentredString(w/2, 15*mm, "balthazar.sh  ·  the Light")
    if doc.page > 1: canvas.drawRightString(w-17*mm, 15*mm, str(doc.page))
    canvas.restoreState()

IMG_W = 150*mm
def card(entry):
    path, (iw, ih) = mark(entry)
    img = RLImage(path, width=IMG_W, height=IMG_W*ih/iw)
    fl = [Paragraph(entry["title"], st_h),
          Paragraph(entry["find"], st_find),
          Spacer(1, 2), img, Spacer(1, 3),
          Paragraph(f'{entry["ref"]} &nbsp;&nbsp;<font size="8" color="#7a6a4e">{entry["lang"]}</font>', st_ref),
          Paragraph(entry["verse"], st_verse),
          Paragraph(f'<b>What it means:</b> {entry["mean"]}', st_mean),
          rule(GOLD_L, 0.6, 6, 10)]
    return KeepTogether(fl)

story = [Spacer(1, 55*mm), Paragraph("The Hidden Gospel", st_title), Spacer(1, 4),
   Paragraph("An illustrated field guide to the secrets hidden in the storybook of the Light", st_sub),
   Spacer(1, 18), rule(GOLD, 1.0, 0, 12),
   Paragraph('&ldquo;It is the glory of God to conceal a thing: but the honour of kings is to search out a matter.&rdquo;', st_epi),
   Paragraph("Proverbs 25:2", st_epir), rule(GOLD, 1.0, 12, 0), Spacer(1, 22),
   Paragraph("Every page hides a secret, and each one is a word of Scripture. Where a number is hidden, it is "
             "written in the language it was first penned &mdash; Koine Greek for the New Testament, Hebrew for "
             "the Old. On each plate below, the secret is circled. Keep looking: there may be more than this guide names.", st_epi),
   PageBreak()]
for e in E:
    story.append(card(e))
story += [Spacer(1, 8), rule(GOLD, 1.0, 0, 12),
   Paragraph('&ldquo;For nothing is secret, that shall not be made manifest&hellip;&rdquo; &mdash; Luke 8:17', st_epi),
   Spacer(1, 10),
   Paragraph('And the work itself is signed: <i>Immanuel</i> &mdash; &ldquo;God with us&rdquo; (Isaiah 7:14), in Hebrew '
             '&mdash; is hidden on every single page. That secret is left unmarked here, for you to find.', st_epi),
   Spacer(1, 8),
   Paragraph("Keep searching.", st_close)]

doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=18*mm,
                      title="The Hidden Gospel — Illustrated Field Guide", author="balthazar.sh")
frame = Frame(doc.leftMargin, doc.bottomMargin, A4[0]-40*mm, A4[1]-36*mm, id="m")
doc.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=bg)])
doc.build(story)
print("wrote", OUT, "| entries:", len(E), "| unicode:", UNI or "none")
