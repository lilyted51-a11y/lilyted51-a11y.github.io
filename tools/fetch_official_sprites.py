#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Copia local (24-11-2026): baja los sprites de las especies que SpriteCollab no tiene desde el
juego oficial (pokesurvivor.com, con permiso del dueño), y les hace su entrada de sprites-meta.

    python tools/fetch_official_sprites.py 514 516 ...      # bajar y medir
    python tools/fetch_official_sprites.py --faltan         # las especies 1-1025 sin sprite en el juego
    python tools/fetch_official_sprites.py --base URL ...   # otra raíz (pruebas: un servidor local)
    python tools/fetch_official_sprites.py --dry ...        # sólo dice qué hay, sin guardar nada
    python tools/fetch_official_sprites.py --local ...      # vuelve a medir lo ya bajado, sin red

Luego:  python tools/add_species.py --no-sprites <los mismos números>   (datos, nombres, MT, meta)
        node tools/make_evolutions.js

El oficial sirve las hojas con la misma forma que las nuestras: <raíz>/assets/pokemon/<dex>/<Anim>.png
y el shiny en .../<dex>/s/<Anim>.png, pero sin AnimData.xml. Lo que falta da 404 (una página HTML), así
que sólo vale una respuesta 200 que además sea un PNG. Se pide de una en una, con pausa (PAUSE).

Sin AnimData.xml, la geometría se mide en la hoja:
  - filas: 8 direcciones (o 4 o 1) si la altura se divide y ninguna fila sale vacía
  - ancho del fotograma: el menor múltiplo de 8 que divide el ancho con todos los fotogramas con dibujo
    y sin dibujo pegado a sus bordes izquierdo/derecho (si un corte cae dentro del Pokémon, toca el
    borde; con fotogramas buenos siempre queda margen transparente)
  - duraciones: las típicas de SpriteCollab para cada animación (DUR)
  - ancla al suelo: el centro del dibujo y su pie más bajo (en la fila de abajo, la 0), igual en
    todas las animaciones del Pokémon para que no salte al cambiar de una a otra
Lo que no esté (Attack, Shoot, Hurt...) no se apunta: el juego usa Idle en su lugar (core/sprites.js,
animName). Se queda en tools/cache/<dex>.json (como fetch_sprites.py) para add_species.py.
"""
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_sprites as fs      # noqa: E402

BASE = 'https://pokesurvivor.com'
UA = 'Mozilla/5.0'
PAUSE = 0.35
ANIMS = ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint']
# Duración típica de cada fotograma (1/60 s): la primera, y la de los demás.
DUR = {'Idle': (30, 10), 'Walk': (8, 8), 'Attack': (4, 3), 'Shoot': (4, 3), 'Charge': (6, 6), 'Hurt': (4, 8), 'Faint': (6, 8)}


def fetch_png(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=40) as r:
            data = r.read()
            if r.status == 200 and data[:8] == b'\x89PNG\r\n\x1a\n':
                return data
    except urllib.error.HTTPError:
        pass
    except Exception as e:
        print('   !', url, e)
    finally:
        time.sleep(PAUSE)
    return None


def alpha_of(png):
    im = Image.open(io.BytesIO(png)).convert('RGBA')
    return im, im.getchannel('A').point(lambda a: 255 if a > 40 else 0)


def alike(a, W, fh):
    """Hojas cuyos fotogramas se tocan (sin columna transparente entre ellos): si al partir la fila 0 en
    k trozos iguales cada uno se parece al primero (mismo tamaño de dibujo y casi los mismos píxeles), son
    k fotogramas. → k, o 1."""
    for k in range(2, 9):
        if W % k:
            continue
        fw = W // k
        if fw < 12:
            break
        fr = [a.crop((x * fw, 0, (x + 1) * fw, fh)) for x in range(k)]
        bbs = [f.getbbox() for f in fr]
        if any(bb is None for bb in bbs):
            continue
        b0 = bbs[0]
        if any(abs((bb[2] - bb[0]) - (b0[2] - b0[0])) > 3 or abs((bb[3] - bb[1]) - (b0[3] - b0[1])) > 3 for bb in bbs):
            continue
        d0 = list(fr[0].getdata())
        on = sum(1 for v in d0 if v) or 1
        if all(sum(1 for u, v in zip(d0, f.getdata()) if u != v) / on < 0.45 for f in fr[1:]):
            return k
    return 1


def measure(png, hint=None):
    """→ (w, h, n, r) del fotograma, o None si no se puede cortar bien. hint: ancho del fotograma de Idle
    (si Idle es un solo fotograma, suele ser el mismo en las demás hojas)."""
    im, a = alpha_of(png)
    W, H = im.size
    dens_all = a.histogram()[255] / (W * H)
    for rows in (8, 4, 1):
        if H % rows:
            continue
        fh = H // rows
        if rows > 1 and any(a.crop((0, y * fh, W, (y + 1) * fh)).getbbox() is None for y in range(rows)):
            continue
        # Las hojas del oficial que no vienen de SpriteCollab tienen anchos sueltos (23, 37...): vale
        # cualquier divisor del ancho, empezando por el de Idle; el corte por columnas transparentes
        # descarta los que caen dentro del Pokémon.
        cands = [w for w in range(10, W) if W % w == 0] + [W]
        if hint and W % hint == 0 and hint in cands:
            cands.remove(hint); cands.insert(0, hint)
        for fw in cands:
            n = W // fw
            # en la fila 0, todos con dibujo (salvo huecos al final)
            filled = [a.crop((x * fw, 0, (x + 1) * fw, fh)).getbbox() is not None for x in range(n)]
            last = max(i for i, f in enumerate(filled) if f) + 1 if any(filled) else 0
            if not last or not all(filled[:last]):
                continue
            if n == 1:
                k = alike(a, W, fh)
                return (W // k, fh, k, rows) if k > 1 else (fw, fh, 1, rows)
            # los cortes entre fotogramas caen en columnas (casi) transparentes: un ataque puede rozar el
            # borde en alguna dirección, pero un corte por dentro del Pokémon atraviesa mucho dibujo.
            cut = sum(a.crop((xx, 0, xx + 1, H)).histogram()[255] for k in range(1, n) for xx in (k * fw - 1, k * fw))
            dens_cut = cut / (2 * (n - 1) * H)
            if dens_cut <= 0.3 * dens_all:
                return fw, fh, last, rows
    return None


def feet(png, fw, fh, n):
    """Ancla al suelo, como la de SpriteCollab: en medio del fotograma y 1,5 px por encima del pie más
    bajo del primer fotograma de la fila 0 (medido en 200 especies: la mediana de su ancla)."""
    _, a = alpha_of(png)
    bb = a.crop((0, 0, fw, fh)).getbbox()
    return fw / 2 - 0.5, (bb[3] - 1 - 1.5) if bb else round(fh * 0.78, 1)


def read_local(path):
    try:
        with open(path, 'rb') as f:
            return f.read()
    except OSError:
        return None


def one(dex, base, dry, local=False):
    out = os.path.join(fs.OUT_ASSETS, str(dex))
    got, shiny = {}, {}
    get = (lambda an, s='': read_local(os.path.join(out, s, an + '.png'))) if local else           (lambda an, s='': fetch_png(f'{base}/assets/pokemon/{dex}/{s + "/" if s else ""}{an}.png'))
    for an in ANIMS:
        png = get(an)
        if png:
            got[an] = png
    if 'Idle' not in got and 'Walk' not in got:
        print(f'{dex}: no hay hojas'); return None
    for an in got:
        png = get(an, 's')
        if png:
            shiny[an] = png
    meta = {'a': {}}
    widest = 0
    hint = None
    for an in ANIMS:
        if an not in got:
            continue
        m = measure(got[an], hint)
        if an == 'Idle' and m and m[2] == 1:
            hint = m[0]
        if not m:
            print(f'   {dex} {an}: no sé cortar la hoja ({Image.open(io.BytesIO(got[an])).size}), se deja fuera'); continue
        fw, fh, n, rows = m
        cx, cy = feet(got[an], fw, fh, n)
        d0, dn = DUR[an]
        meta['a'][an] = {'w': fw, 'h': fh, 'n': n, 'r': rows, 'd': [d0] + [dn] * (n - 1), 'ax': cx, 'ay': cy}
        _, a = alpha_of(got[an])
        bb = a.crop((0, 0, fw, fh)).getbbox()
        widest = max(widest, (bb[2] - bb[0]) if bb else 0)
    if not meta['a']:
        return None
    meta['s'] = 0 if widest < 16 else 1 if widest < 36 else 2
    meta = {'s': meta['s'], 'a': meta['a']}
    if 'Idle' in shiny or 'Walk' in shiny:
        meta['sh'] = 1
        miss = [k for k in meta['a'] if k not in shiny]
        if miss:
            meta['sm'] = miss
    print(f'{dex}: ' + ' · '.join(f'{k} {v["w"]}x{v["h"]}×{v["n"]}/{v["r"]}' for k, v in meta['a'].items())
          + f' · shiny {sorted(shiny) if shiny else "no"}')
    if dry:
        return meta
    os.makedirs(out, exist_ok=True)
    for an in ([] if local else meta['a']):
        fs.save_optimized(got[an], os.path.join(out, an + '.png'))
        if an in shiny:
            os.makedirs(os.path.join(out, 's'), exist_ok=True)
            fs.save_optimized(shiny[an], os.path.join(out, 's', an + '.png'))
    os.makedirs(fs.CACHE, exist_ok=True)
    with open(os.path.join(fs.CACHE, f'{dex}.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, separators=(',', ':'))
    return meta


def main():
    args = sys.argv[1:]
    base = BASE
    if '--base' in args:
        base = args[args.index('--base') + 1].rstrip('/')
    dry = '--dry' in args
    local = '--local' in args     # volver a medir las hojas ya bajadas (assets/pokemon/<dex>/), sin red
    nums = [int(a) for a in args if a.isdigit() and (not ('--base' in args) or a != args[args.index('--base') + 1])]
    if '--faltan' in args:
        src = open(os.path.join(fs.ROOT, 'js', 'data', 'pokedex.js'), encoding='utf-8').read()
        have = {int(d) for d in re.findall(r'"dex":(\d+),', src)}
        nums = [d for d in range(1, 1026) if d not in have]
        print(f'{len(nums)} especies sin sprite: {nums}')
    ok = [d for d in nums if one(d, base, dry, local)]
    print(f'\n{len(ok)} de {len(nums)} con sprites: {ok}')


if __name__ == '__main__':
    main()
