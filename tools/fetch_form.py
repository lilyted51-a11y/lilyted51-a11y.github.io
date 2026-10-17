#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Copia local: descarga una FORMA concreta de SpriteCollab (p. ej. la Mega) como
si fuera un Pokémon nuevo, y añade su entrada a js/data/sprites-meta.js.

    python tools/fetch_form.py 384 0001 1384 [--fake-shiny]

  384    dex de origen en SpriteCollab
  0001   forma (0000 normal, 0001 primera forma alternativa: Mega, etc.)
  1384   dex con el que se guarda en el juego (assets/pokemon/1384)
  --fake-shiny  si la forma no tiene shiny en SpriteCollab, se genera uno
                oscureciendo los verdes (estilo Mega Rayquaza shiny: negro y oro)
  --hue N       en vez de eso, girar el tono N grados (shiny genérico)
  --white       el color del cuerpo (el tono dominante) pasa a blanco/gris claro
                (estilo Mega Gengar shiny); el resto se conserva

Reutiliza las funciones de tools/fetch_sprites.py.
"""
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_sprites as fs  # noqa: E402
from PIL import Image  # noqa: E402


def hue_shiny(src_dir, dst_dir, anims, deg):
    """Gira el tono de los píxeles con color (los grises/negros/blancos se quedan)."""
    import colorsys
    os.makedirs(dst_dir, exist_ok=True)
    for a in anims:
        p = os.path.join(src_dir, a + '.png')
        if not os.path.exists(p):
            continue
        im = Image.open(p).convert('RGBA')
        px = im.load()
        w, h = im.size
        for y in range(h):
            for x in range(w):
                r, g, b, al = px[x, y]
                if al == 0:
                    continue
                hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                if ss < 0.18 or vv < 0.12:
                    continue
                hh = (hh + deg / 360.0) % 1.0
                nr, ng, nb = colorsys.hsv_to_rgb(hh, ss, vv)
                px[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), al)
        buf = io.BytesIO(); im.save(buf, 'PNG')
        fs.save_optimized(buf.getvalue(), os.path.join(dst_dir, a + '.png'))


def white_shiny(src_dir, dst_dir, anims):
    """El tono dominante (el cuerpo) → blanco grisáceo con el mismo sombreado; eyes, boca, etc. se quedan."""
    import colorsys
    from collections import Counter
    os.makedirs(dst_dir, exist_ok=True)
    # tono dominante entre los píxeles con color
    hist = Counter()
    for a in anims:
        pth = os.path.join(src_dir, a + '.png')
        if not os.path.exists(pth):
            continue
        im = Image.open(pth).convert('RGBA')
        for r, g, b, al in im.getdata():
            if al == 0: continue
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if ss >= 0.18 and vv >= 0.12: hist[int(hh * 36)] += 1
    dom = hist.most_common(1)[0][0] / 36.0
    for a in anims:
        pth = os.path.join(src_dir, a + '.png')
        if not os.path.exists(pth):
            continue
        im = Image.open(pth).convert('RGBA')
        px = im.load(); w, h = im.size
        for y in range(h):
            for x in range(w):
                r, g, b, al = px[x, y]
                if al == 0: continue
                hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                if ss < 0.18 or vv < 0.12: continue
                d = min(abs(hh - dom), 1 - abs(hh - dom))
                if d > 0.09: continue                       # otro color (ojos, boca): se queda
                # blanco con el mismo sombreado: claro → casi blanco, oscuro → gris
                v2 = 0.45 + vv * 0.55
                nr, ng, nb = colorsys.hsv_to_rgb(hh, 0.06, v2)
                px[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), al)
        buf = io.BytesIO(); im.save(buf, 'PNG')
        fs.save_optimized(buf.getvalue(), os.path.join(dst_dir, a + '.png'))


def fake_shiny(src_dir, dst_dir, anims):
    """Verdes → negro azabache (conservando luces), el resto igual."""
    os.makedirs(dst_dir, exist_ok=True)
    for a in anims:
        p = os.path.join(src_dir, a + '.png')
        if not os.path.exists(p):
            continue
        im = Image.open(p).convert('RGBA')
        px = im.load()
        w, h = im.size
        for y in range(h):
            for x in range(w):
                r, g, b, al = px[x, y]
                if al == 0:
                    continue
                mx, mn = max(r, g, b), min(r, g, b)
                sat = 0 if mx == 0 else (mx - mn) / mx
                # tono verde (el cuerpo): 70°–170° aprox., con algo de saturación
                hue = 0
                if mx != mn:
                    if mx == r: hue = (60 * ((g - b) / (mx - mn)) + 360) % 360
                    elif mx == g: hue = 60 * ((b - r) / (mx - mn)) + 120
                    else: hue = 60 * ((r - g) / (mx - mn)) + 240
                if sat > 0.18 and 70 <= hue <= 175:
                    lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255   # 0..1
                    v = int(14 + lum * 70)                         # negro con brillos grises
                    px[x, y] = (v, v, v + 6, al)
        buf = io.BytesIO(); im.save(buf, 'PNG')
        fs.save_optimized(buf.getvalue(), os.path.join(dst_dir, a + '.png'))


def main():
    if len(sys.argv) < 4:
        print(__doc__); sys.exit(1)
    src, form, dex = int(sys.argv[1]), sys.argv[2], int(sys.argv[3])
    fake = '--fake-shiny' in sys.argv
    hue = int(sys.argv[sys.argv.index('--hue') + 1]) if '--hue' in sys.argv else None
    white = '--white' in sys.argv
    base = f'{fs.BASE}/{src:04d}/{form}'
    out_dir = os.path.join(fs.OUT_ASSETS, str(dex))
    xml = fs.fetch(f'{base}/AnimData.xml')
    if not xml:
        print('No hay AnimData.xml en', base); sys.exit(1)
    anims, shadow = fs.parse_animdata(xml.decode('utf-8', 'replace'))
    normal = fs.download_set(base, out_dir, anims)
    if not fs.REQUIRED & set(normal):
        print('Faltan animaciones básicas'); sys.exit(1)
    meta = {'s': shadow, 'a': normal}

    sxml = fs.fetch(f'{base}/0000/0001/AnimData.xml')
    if sxml:
        sanims = fs.parse_animdata(sxml.decode('utf-8', 'replace'))[0]
        shiny = fs.download_set(f'{base}/0000/0001', os.path.join(out_dir, 's'), sanims, normal)
        if 'Idle' in shiny and 'Walk' in shiny:
            meta['sh'] = 1
            diff = {k: v for k, v in shiny.items() if normal.get(k) != v}
            if diff: meta['sa'] = diff
            miss = [k for k in normal if k not in shiny]
            if miss: meta['sm'] = miss
    elif white:
        white_shiny(out_dir, os.path.join(out_dir, 's'), normal)
        meta['sh'] = 1
        print('Shiny generado en blanco (no existe en SpriteCollab)')
    elif hue is not None:
        hue_shiny(out_dir, os.path.join(out_dir, 's'), normal, hue)
        meta['sh'] = 1
        print(f'Shiny generado girando el tono {hue} grados (no existe en SpriteCollab)')
    elif fake:
        fake_shiny(out_dir, os.path.join(out_dir, 's'), normal)
        meta['sh'] = 1
        print('Shiny generado (no existe en SpriteCollab)')

    os.makedirs(fs.CACHE, exist_ok=True)
    with open(os.path.join(fs.CACHE, f'{dex}.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, separators=(',', ':'))

    # Entrada en sprites-meta.js (se sustituye si ya estaba).
    line = f'  {dex}: {json.dumps(meta, separators=(",", ":"))},\n'
    s = open(fs.OUT_META, encoding='utf-8').read()
    s = re.sub(rf'^  {dex}: .*\n', '', s, flags=re.M)
    s = s.replace('\n};', '\n' + line + '};', 1)
    open(fs.OUT_META, 'w', encoding='utf-8', newline='\n').write(s)
    print(f'ok: {dex} <- {src:04d}/{form} · animaciones: {sorted(normal)} · shiny: {bool(meta.get("sh"))}')


if __name__ == '__main__':
    main()
