#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Copia local (24-11-2026): añade ESPECIES nuevas (dex 1-1025) a todo el juego sin
rehacer lo que ya hay. Para cuando SpriteCollab saca el sprite de una especie que
faltaba (o se consigue de otra fuente con tools/fetch_official_sprites.py).

    python tools/add_species.py 593 618 683 ...      # sprites de SpriteCollab + datos
    python tools/add_species.py --no-sprites 514 ... # los sprites ya están (tools/cache/<dex>.json)

Por cada número:
  - sprites (normal y shiny) en assets/pokemon/<dex>/ con tools/fetch_sprites.py (do_dex)
  - su línea en js/data/sprites-meta.js, en su sitio (ordenadas por número)
  - su fila en js/data/pokedex.js (la misma fórmula que tools/fetch_pokedex.py), en su sitio
  - habilidades en js/data/abilities.js (G.DEX_ABIL y, si es nueva, su nombre en G.ABIL)
  - MT en js/data/tms.js (las que aprende por MT en su juego más reciente, como el PR #236)
  - nombre en francés (lang-fr.js), chino simplificado (lang-zh-cn-names.js), chino tradicional
    (lang-zh-hant-names.js y js/zh-tw.js, con la clave en español y en inglés) e inglés si el
    nombre español es otro (lang-en.js: lo apunta al final, para copiarlo a mano a su bloque)

Lo que ya estaba se deja igual: volver a lanzarlo con el mismo número no duplica nada.
Después:  node tools/make_evolutions.js  ·  python tools/hover_flags.py  ·  python tools/fetch_credits.py
Datos: PokeAPI (https://pokeapi.co/).
"""
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_sprites as fs      # noqa: E402
import fetch_pokedex as fp      # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'js', 'data')
API = 'https://pokeapi.co/api/v2'
UA = 'Mozilla/5.0 PokeSurvivor-tools'     # PokeAPI devuelve 403 al User-Agent por defecto de Python


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
        except Exception:
            pass
        time.sleep(1 + i)
    return None


def read(path):
    with io.open(path, encoding='utf-8') as f:
        return f.read().replace('\r\n', '\n')


def write(path, text):
    with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def insert_sorted(lines, pat, dex, new_line):
    """Mete new_line en la primera tanda ordenada de líneas que casan con `pat` (grupo 1 = número),
    detrás de la de número menor más alto. Si ya está ese número en la tanda, la sustituye."""
    idx = [(i, int(m.group(1))) for i, l in enumerate(lines) for m in [re.match(pat, l)] if m]
    run = []
    for i, n in idx:                     # la primera tanda creciente (las especies; detrás van las formas)
        if run and n <= run[-1][1]:
            break
        run.append((i, n))
    for i, n in run:
        if n == dex:
            lines[i] = new_line
            return
    prev = [i for i, n in run if n < dex]
    at = (prev[-1] + 1) if prev else run[0][0]
    lines.insert(at, new_line)


# ---------------- sprites ----------------

def sprites(dex, download):
    cache = os.path.join(fs.CACHE, f'{dex}.json')
    if download:
        os.makedirs(fs.CACHE, exist_ok=True)
        _, meta = fs.do_dex((dex, True))
        if not meta:
            raise SystemExit(f'{dex}: SpriteCollab no tiene sus animaciones')
    else:
        if not os.path.exists(cache):
            raise SystemExit(f'{dex}: falta {cache} (¿tools/fetch_official_sprites.py?)')
        meta = json.load(open(cache, encoding='utf-8'))
    src = read(fs.OUT_META).split('\n')
    insert_sorted(src, r'^  (\d+): \{', dex, f'  {dex}: {json.dumps(meta, separators=(",", ":"))},')
    write(fs.OUT_META, '\n'.join(src))
    return meta


# ---------------- Pokédex ----------------

def pokedex_row(dex):
    r = fp.one(dex)
    if not r:
        raise SystemExit(f'{dex}: PokeAPI no responde')
    o = {'dex': r['dex'], 'name': r['name'], 'types': r['types'], 'hp': r['hp'], 'spd': r['spd'], 'atk': r['atk'],
         'pa': r['pa'], 'sa': r['sa'], 'df': r['df'], 'sd': r['sd'], 'rarity': r['rarity'], 'bst': r['bst'],
         'starter': r['starter'], 'gen': r['gen']}
    if r['leg']:
        o['leg'] = True
    return o


def pokedex(dex, row):
    path = os.path.join(DATA, 'pokedex.js')
    src = read(path).split('\n')
    insert_sorted(src, r'^  \{"dex":(\d+),', dex, '  ' + json.dumps(row, ensure_ascii=False, separators=(',', ':')) + ',')
    write(path, '\n'.join(src))


# ---------------- habilidades ----------------

LANGS = ['es', 'en', 'fr', 'it', 'zh-hans', 'zh-hant']


def abilities(dex, poke):
    path = os.path.join(DATA, 'abilities.js')
    src = read(path)
    slots = {a['slot']: a['ability']['name'] for a in poke['abilities']}
    trio = [slots.get(1, 0), slots.get(2, 0), slots.get(3, 0)]
    lines = src.split('\n')
    have = set(re.findall(r'^  "([a-z0-9-]+)":\[', src, re.M))
    for ab in [a for a in trio if a and a not in have]:
        d = get(f'{API}/ability/{ab}')
        nm = {n['language']['name']: n['name'] for n in (d or {}).get('names', [])}
        en = nm.get('en', ab.replace('-', ' ').title())
        row = [nm.get(l) or en for l in LANGS]
        new = f'  "{ab}":' + json.dumps(row, ensure_ascii=False, separators=(',', ':')) + ','
        # G.ABIL va por orden alfabético
        abil = [(i, m.group(1)) for i, l in enumerate(lines) for m in [re.match(r'^  "([a-z0-9-]+)":\[', l)] if m]
        after = [i for i, k in abil if k < ab]
        lines.insert((after[-1] + 1) if after else abil[0][0], new)
        print(f'  habilidad nueva: {ab} {row}')
    row = '  %d:[%s]' % (dex, ','.join(json.dumps(a) if a else '0' for a in trio))
    # G.DEX_ABIL: «  N:[...],» (la última sin coma)
    start = next(i for i, l in enumerate(lines) if l.startswith('G.DEX_ABIL'))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('};'))
    body = [l.rstrip(',') for l in lines[start + 1:end]]
    body = [l for l in body if not l.startswith(f'  {dex}:[')]
    nums = [int(re.match(r'^  (\d+):', l).group(1)) for l in body]
    at = sum(1 for n in nums if n < dex)
    body.insert(at, row)
    lines[start + 1:end] = [l + ',' for l in body[:-1]] + [body[-1]]
    write(path, '\n'.join(lines))
    return trio


# ---------------- MT ----------------

def tms(dex, poke):
    path = os.path.join(DATA, 'tms.js')
    src = read(path)
    keys = set(re.findall(r'^  "([a-z-]+)":\[', src, re.M))
    by = {}
    for m in poke['moves']:
        for vd in m['version_group_details']:
            if vd['move_learn_method']['name'] == 'machine':
                by.setdefault(vd['version_group']['name'], set()).add(m['move']['name'])
    # El juego más reciente en el que aprende algo por MT (Escarlata/Púrpura, si no Espada/Escudo...)
    order = ['scarlet-violet', 'sword-shield', 'brilliant-diamond-shining-pearl', 'ultra-sun-ultra-moon', 'sun-moon',
             'omega-ruby-alpha-sapphire', 'x-y']
    learn = set()
    for vg in order:
        if by.get(vg):
            learn = by[vg] & keys
            break

    def fix(m):
        lst = json.loads(m.group(2))
        if m.group(1) in learn and dex not in lst:
            lst = sorted(lst + [dex])
        return f'  "{m.group(1)}":{json.dumps(lst, separators=(",", ":"))}'
    src = re.sub(r'^  "([a-z-]+)":(\[[\d,]*\])', fix, src, flags=re.M)
    write(path, src)
    return sorted(learn)


# ---------------- nombres ----------------

def put_name(path, key, value, prev_keys, anchor=None):
    """Añade "key": "value" detrás del nombre de la especie anterior que haya en el fichero."""
    lines = read(path).split('\n')
    lo = 0
    if anchor:
        lo = next(i for i, l in enumerate(lines) if l.startswith(f'  "{anchor}":'))
    pos = {}
    for i in range(lo, len(lines)):
        m = re.match(r'^  "((?:[^"\\]|\\.)*)": ', lines[i])
        if m and m.group(1) not in pos:
            pos[m.group(1)] = i
    if key in pos:
        return False
    for k in reversed(prev_keys):
        if k in pos:
            lines.insert(pos[k] + 1, f'  {json.dumps(key, ensure_ascii=False)}: {json.dumps(value, ensure_ascii=False)},')
            write(path, '\n'.join(lines))
            return True
    raise SystemExit(f'{path}: no encuentro dónde poner {key}')


def names(dex, row, species):
    nm = {n['language']['name']: n['name'] for n in species['names']}
    es, en = row['name'], nm.get('en', row['name'])
    src = read(os.path.join(DATA, 'pokedex.js'))
    by = {}
    for d, n in re.findall(r'^  \{"dex":(\d+),"name":"([^"]+)"', src, re.M):
        if by and int(d) <= max(by):
            break                        # sólo la tanda de especies (1020 de las formas es Raticate de Alola)
        by[int(d)] = n
    prev = [by[d] for d in sorted(by) if d < dex]
    out = {}
    if nm.get('fr') and nm['fr'] != es:
        out['fr'] = put_name(os.path.join(DATA, 'lang-fr.js'), es, nm['fr'], prev, anchor='Bulbasaur')
    out['zh-cn'] = put_name(os.path.join(DATA, 'lang-zh-cn-names.js'), es, nm['zh-hans'], prev)
    out['zh-hant'] = put_name(os.path.join(DATA, 'lang-zh-hant-names.js'), es, nm['zh-hant'], prev)
    zh = os.path.join(ROOT, 'js', 'zh-tw.js')
    out['zh-tw'] = put_name(zh, es, nm['zh-hant'], prev, anchor='Bulbasaur')
    if en != es:
        put_name(zh, en, nm['zh-hant'], [es], anchor='Bulbasaur')
    return es, en, nm.get('fr'), nm.get('zh-hans'), nm.get('zh-hant'), out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    download = '--no-sprites' not in sys.argv
    en_lines = []
    for dex in sorted(int(a) for a in args):
        if not 1 <= dex <= 1025:
            raise SystemExit(f'{dex}: sólo especies (1-1025); las formas van con tools/fetch_form.py')
        meta = sprites(dex, download)
        poke, species = get(f'{API}/pokemon/{dex}'), get(f'{API}/pokemon-species/{dex}')
        if not poke or not species:
            raise SystemExit(f'{dex}: PokeAPI no responde')
        row = pokedex_row(dex)
        pokedex(dex, row)
        trio = abilities(dex, poke)
        mt = tms(dex, poke)
        es, en, fr, zs, zt, _ = names(dex, row, species)
        if en != es:
            en_lines.append(f'  {json.dumps(es, ensure_ascii=False)}: {json.dumps(en, ensure_ascii=False)},')
        print(f'{dex} {es} / {en} / {fr} / {zt} · {row["types"]} BST {row["bst"]} ★{row["rarity"]}'
              f'{" leg" if row.get("leg") else ""} · anims {sorted(meta["a"])} shiny {bool(meta.get("sh"))}'
              f' · habilidades {trio} · MT {len(mt)}')
    if en_lines:
        print('\nNombres en inglés distintos del español (van en js/data/lang-en.js):')
        print('\n'.join(en_lines))


if __name__ == '__main__':
    main()
