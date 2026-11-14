#!/usr/bin/env python3
"""Underpaint the band above the frame on an OPAQUE depth plane (Nov 14, "more art on top").

The sky plane is rendered on a transparent ground when it carries a band (EXT): the strokes the engine painted
into the band thin out toward its top, and with nothing under them the jpeg would show white there. Under the band
goes the sky's OWN top rows, mirrored upward and blurred soft — so the gaps between the marks are the same air
as the marks. Below the band the plane sits on white exactly as it always did, so the old frame is unchanged.

  python3 gen/band-underpaint.py <png> <band_px>
"""
import sys
from PIL import Image, ImageFilter
src, band = sys.argv[1], int(sys.argv[2])
im = Image.open(src).convert('RGBA')
W, H = im.size
base = Image.new('RGBA', (W, H), (255, 255, 255, 255))
if band > 0:
    take = min(band, H - band)
    strip = im.crop((0, band, W, band + take)).transpose(Image.FLIP_TOP_BOTTOM)
    strip = Image.alpha_composite(Image.new('RGBA', strip.size, (255, 255, 255, 255)), strip)   # its own gaps are white today too
    strip = strip.filter(ImageFilter.GaussianBlur(14))
    under = strip.resize((W, band)) if take != band else strip
    base.paste(under, (0, 0))
out = Image.alpha_composite(base, im).convert('RGB')
out.save(src)
