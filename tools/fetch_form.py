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
