#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Copia local (24-11-2026): baja del juego oficial (pokesurvivor.com, con permiso del dueño) las hojas de sprites
de sus formas, megas y Gigamax, tal cual, a tools/cache/official/sprites/<id oficial>/<Anim>.png (y s/ el shiny).
Qué hojas hay lo dice su tabla de sprites (tools/cache/official/manifest.json, de tools/official_manifest.cjs):
las animaciones con «f» usan la hoja de otra y no se piden. Lo ya bajado no se vuelve a pedir.

    python tools/fetch_official_assets.py                 # todo lo que no es una especie base (id > 1025)
    python tools/fetch_official_assets.py 837 962 500483  # sólo esos ids oficiales
    python tools/fetch_official_assets.py --base          # además, las especies base que el oficial tiene
                                                          # mejor (más animaciones o con shiny y nosotros no)

Luego: node tools/official_import.cjs (las pasa al juego con nuestros números).
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'cache', 'official')
BASE = 'https://pokesurvivor.com'
UA = 'Mozilla/5.0'
PAUSE = 0.25
WORKERS = 4


def fetch(url):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
                return data if r.status == 200 and data[:8] == b'\x89PNG\r\n\x1a\n' else None
        except urllib.error.HTTPError:
            return None
        except Exception as e:  # red: reintentar
            print('   !', url, e, flush=True)
            time.sleep(2 + attempt * 3)
        finally:
            time.sleep(PAUSE)
    return None


def files_of(m):
    """[(ruta relativa)] de un Pokémon según su meta oficial."""
    out = []
    for name, a in m['a'].items():
        if a.get('f'):
            continue
        out.append(name + '.png')
        if m.get('sh') and name not in (m.get('sm') or []):
            out.append('s/' + name + '.png')
    return out


def ours_meta():
    """Nuestro sprites-meta.js → {dex: meta} (sólo lo que hace falta para comparar)."""
    import re
    txt = open(os.path.join(ROOT, 'js', 'data', 'sprites-meta.js'), encoding='utf-8').read()
    out = {}
    for m in re.finditer(r'^\s*(\d+):\s*(\{.*\}),?\s*$', txt, re.M):
        try:
            out[int(m.group(1))] = json.loads(m.group(2))
        except ValueError:
            pass
    return out


def main(argv):
    man = json.load(open(os.path.join(CACHE, 'manifest.json'), encoding='utf-8'))
    meta = {int(k): v for k, v in man['meta'].items()}
    nums = [int(a) for a in argv if a.isdigit()]
    ids = nums or [k for k in sorted(meta) if k > 1025]
    if '--base' in argv:
        ours = ours_meta()
        for d in range(1, 1026):
            o, m = ours.get(d), meta.get(d)
            if not m:
                continue
            n_off = len([a for a in m['a'].values() if not a.get('f')])
            n_our = len(o['a']) if o else 0
            if not o or n_off > n_our or (m.get('sh') and not o.get('sh')):
                ids.append(d)
    todo = [(i, f) for i in ids if i in meta for f in files_of(meta[i])
            if not os.path.exists(os.path.join(CACHE, 'sprites', str(i), f))]
    print(len(ids), 'Pokémon ·', len(todo), 'hojas por bajar', flush=True)
    from concurrent.futures import ThreadPoolExecutor
    cnt = {'got': 0, 'miss': 0, 'n': 0}

    def one(job):
        i, f = job
        data = fetch('%s/assets/pokemon/%d/%s' % (BASE, i, f))
        if data:
            p = os.path.join(CACHE, 'sprites', str(i), f)
            os.makedirs(os.path.dirname(p), exist_ok=True)
            open(p, 'wb').write(data)
            cnt['got'] += 1
        else:
            cnt['miss'] += 1
            print('   falta', i, f, flush=True)
        cnt['n'] += 1
        if cnt['n'] % 200 == 0:
            print('  %d/%d (%d bajadas, %d faltan)' % (cnt['n'], len(todo), cnt['got'], cnt['miss']), flush=True)

    with ThreadPoolExecutor(WORKERS) as ex:   # pocas a la vez: no cargar al servidor del oficial
        list(ex.map(one, todo))
    print('hecho:', cnt['got'], 'bajadas,', cnt['miss'], 'faltan', flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
