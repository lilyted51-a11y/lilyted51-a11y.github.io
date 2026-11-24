#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Copia local (24-11-2026): añade FORMAS de SpriteCollab que faltaban, cada una en su categoría:

  power  formas de poder (Megas): un Pokémon más (Pokédex, gacha de su región), con los tipos y
         estadísticas de PokeAPI; es la que sale con el poder Megaevolución (systems/powers.js)
  look   formas que sólo cambian el dibujo (colores, dibujos, letras…): aspecto en el Vestidor
         (core/dress.js) y nada más: excl (ni gacha, ni Pokédex, ni huevos, ni enemigos), con los tipos
         y números de su especie

    python tools/add_forms.py            # descarga y añade lo de LIST que falte
    python tools/add_forms.py --dry      # sólo lo enseña

Número en el juego: especie + 1000·k (el primer k libre), como tools/fetch_forms_all.py.
Shiny: el de SpriteCollab (sprite/<dex>/<forma>/0001) si lo hay; si no, las de poder giran el tono 40°
(como las demás formas) y los aspectos se quedan sin shiny (con un shiny puesto se ve el aspecto normal).
Nombres: inglés «Especie Forma» (también es la clave en español) y chino tradicional de PokeAPI
(nombre de la especie + nombre oficial de la forma) en js/zh-tw.js.
Lo ya añadido (mismo «SpriteCollab NNNN/FFFF» en pokedex.js) se salta.
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
import fetch_form as ff         # noqa: E402
import hover_flags as hf        # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEX_JS = os.path.join(ROOT, 'js', 'data', 'pokedex.js')
ZH_JS = os.path.join(ROOT, 'js', 'zh-tw.js')
API = 'https://pokeapi.co/api/v2'
UA = 'Mozilla/5.0 PokeSurvivor-tools'
DRY = '--dry' in sys.argv

# (especie, forma de SpriteCollab, categoría, forma en PokeAPI)
LIST = [
    (254, '0001', 'power', 'sceptile-mega'), (358, '0001', 'power', 'chimecho-mega'), (701, '0001', 'power', 'hawlucha-mega'),
    (172, '0001', 'look', 'pichu-spiky-eared'),
] + [(201, f'{i:04d}', 'look', 'unown-' + c) for i, c in enumerate('bcdefghijklmnopqrstuvwxyz', 1)] + [
    (201, '0026', 'look', 'unown-exclamation'), (201, '0027', 'look', 'unown-question'),
    (421, '0001', 'look', 'cherrim-sunshine'), (422, '0001', 'look', 'shellos-east'), (423, '0001', 'look', 'gastrodon-east'),
    (550, '0001', 'look', 'basculin-blue-striped'), (550, '0002', 'look', 'basculin-white-striped'),
] + [(d, f'{i:04d}', 'look', f'{n}-{s}') for d, n in [(585, 'deerling'), (586, 'sawsbuck')]
     for i, s in enumerate(['summer', 'autumn', 'winter'], 1)] + [
    (649, f'{i:04d}', 'look', 'genesect-' + s) for i, s in enumerate(['douse', 'shock', 'burn', 'chill'], 1)] + [
    (666, f'{i:04d}', 'look', 'vivillon-' + s) for i, s in enumerate(
        ['icy-snow', 'polar', 'tundra', 'continental', 'garden', 'elegant', 'modern', 'marine', 'archipelago', 'high-plains',
         'sandstorm', 'river', 'monsoon', 'savanna', 'sun', 'ocean', 'jungle', 'fancy', 'poke-ball'], 1)] + [
    (d, f'{i:04d}', 'look', f'{n}-{c}') for d, n in [(669, 'flabebe'), (670, 'floette'), (671, 'florges')]
    for i, c in enumerate(['yellow', 'orange', 'blue', 'white'], 1)] + [
    (670, '0005', 'look', 'floette-eternal'), (676, '0008', 'look', 'furfrou-kabuki'),
    (710, '0001', 'look', 'pumpkaboo-small'), (710, '0002', 'look', 'pumpkaboo-large'), (710, '0003', 'look', 'pumpkaboo-super'),
    (711, '0003', 'look', 'gourgeist-super'), (716, '0001', 'look', 'xerneas-neutral'),
] + [(774, f'{i:04d}', 'look', 'minior-' + c) for i, c in enumerate(['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'], 1)] + [
    (778, '0001', 'look', 'mimikyu-busted'), (801, '0001', 'look', 'magearna-original'), (875, '0001', 'look', 'eiscue-noice'),
    (925, '0001', 'look', 'maushold-family-of-three'), (978, '0001', 'look', 'tatsugiri-stretchy'), (978, '0002', 'look', 'tatsugiri-droopy'),
]
# Palabras de relleno del nombre inglés de la forma («Polar Pattern» → «Polar»).
# Nombre chino entero cuando PokeAPI no trae el de la forma.
ZH_FULL = {'pichu-spiky-eared': '刺刺耳皮丘'}
TAIL = re.compile(r' (Form|Pattern|Drive|Flower|Core|Sea|Size|Color|Mode|Face|Trim)$')


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


def read(p):
    with io.open(p, encoding='utf-8') as f:
        return f.read().replace('\r\n', '\n')


def write(p, s):
    with io.open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(s)


def mul(v):
    return round(0.70 + v / 100 * 0.55, 2)


def rarity(bst):
    return 5 if bst >= 600 else 4 if bst >= 495 else 3 if bst >= 410 else 2 if bst >= 320 else 1


def main():
    src = read(DEX_JS)
    rows = {int(m.group(1)): json.loads(m.group(0)) for m in re.finditer(r'\{"dex":(\d+),.*?\}(?=,|\s*/\*|\s*$)', src, re.M)}
    done = set(re.findall(r'SpriteCollab (\d{4}/\d{4})', src))
    taken = set(rows) | {int(d) for d in os.listdir(fs.OUT_ASSETS) if d.isdigit()}
    zh = read(ZH_JS)
    tp = os.path.join(fs.CACHE, 'tracker.json')
    tracker = json.load(open(tp, encoding='utf-8')) if os.path.exists(tp) else None
    zh_name = dict(re.findall(r'^  "([^"]+)": "([^"]+)",$', zh, flags=re.M))
    dex_lines, meta_lines, zh_lines, credits = [], [], [], []
    for base, fid, kind, slug in LIST:
        tag = f'{base:04d}/{fid}'
        if tag in done:
            continue
        b = rows[base]
        form = get(f'{API}/pokemon-form/{slug}') or {}
        fnames = {n['language']['name']: n['name'] for n in form.get('form_names', [])}
        if kind == 'power':
            en = f'Mega {b["name"]}'
            zhn = f'Mega {zh_name.get(b["name"], b["name"])}'
        else:
            label = fnames.get('en') or slug.split('-', 1)[1].replace('-', ' ').title()
            if base == 201:
                label = {'exclamation': '!', 'question': '?'}.get(slug.split('-')[1], slug.split('-')[1].upper())
            en = f'{b["name"]} {TAIL.sub("", label)}'
            fz = fnames.get('zh-hant') or (label if base == 201 else None)
            if not fz and slug not in ZH_FULL:
                print(f'  ! {en}: sin nombre chino de la forma en PokeAPI, se salta'); continue
            zhn = ZH_FULL.get(slug) or f'{zh_name.get(b["name"], b["name"])} {fz}'
        k = 1
        while base + 1000 * k in taken:
            k += 1
        new = base + 1000 * k
        if DRY:
            print(new, kind, en, '/', zhn); taken.add(new); continue
        # ---- sprites ----
        url = f'{fs.BASE}/{tag}'
        xml = fs.fetch(f'{url}/AnimData.xml')
        if not xml:
            print(f'  ! {en}: no hay AnimData.xml en {tag}'); continue
        anims, shadow = fs.parse_animdata(xml.decode('utf-8', 'replace'))
        out = os.path.join(fs.OUT_ASSETS, str(new))
        normal = fs.download_set(url, out, anims)
        if not fs.REQUIRED & set(normal):
            print(f'  ! {en}: sin animaciones básicas'); continue
        meta = {'s': shadow, 'a': normal}
        sxml = fs.fetch(f'{url}/0001/AnimData.xml')
        shiny = {}
        if sxml:
            shiny = fs.download_set(f'{url}/0001', os.path.join(out, 's'), fs.parse_animdata(sxml.decode('utf-8', 'replace'))[0], normal)
            if shiny and fs.same_as_normal(out, shiny):
                import shutil
                shutil.rmtree(os.path.join(out, 's'), ignore_errors=True); shiny = {}
        if 'Idle' in shiny and 'Walk' in shiny:
            meta['sh'] = 1
            diff = {kk: v for kk, v in shiny.items() if normal.get(kk) != v}
            if diff: meta['sa'] = diff
            miss = [kk for kk in normal if kk not in shiny]
            if miss: meta['sm'] = miss
        elif kind == 'power':
            ff.hue_shiny(out, os.path.join(out, 's'), normal, 40)
            meta['sh'] = 1
        idle = meta['a'].get('Idle') or meta['a'].get('Walk')
        if idle and hf.gap_of(new, idle) >= hf.GAP:
            meta['hv'] = 1
        with open(os.path.join(fs.CACHE, f'{new}.json'), 'w', encoding='utf-8') as f:
            json.dump(meta, f, separators=(',', ':'))
        # ---- datos ----
        if kind == 'power':
            p = get(f'{API}/pokemon/{slug}')
            if not p:
                print(f'  ! {en}: PokeAPI no tiene {slug}'); continue
            st = {s['stat']['name']: s['base_stat'] for s in p['stats']}
            bst = sum(st.values())
            row = {'dex': new, 'name': en, 'types': [t['type']['name'] for t in sorted(p['types'], key=lambda t: t['slot'])],
                   'hp': round(70 + st['hp'] * 0.45), 'spd': round(78 + st['speed'] * 0.42),
                   'atk': max(mul(st['attack']), mul(st['special-attack'])), 'pa': mul(st['attack']), 'sa': mul(st['special-attack']),
                   'df': st['defense'], 'sd': st['special-defense'], 'rarity': rarity(bst), 'bst': bst, 'starter': False, 'gen': b['gen']}
        else:
            row = dict(b)
            row.pop('leg', None); row.pop('starter', None)
            row.update({'dex': new, 'name': en, 'starter': False, 'excl': True})
            row = {kk: row[kk] for kk in ['dex', 'name', 'types', 'hp', 'spd', 'atk', 'pa', 'sa', 'df', 'sd', 'rarity', 'bst', 'starter', 'gen', 'excl']}
        sc_name = tracker[f'{base:04d}']['subgroups'][fid]['name'] if tracker else slug
        dex_lines.append('  ' + json.dumps(row, ensure_ascii=False, separators=(',', ':'))
                         + f',   /* forma {sc_name} de {base} (SpriteCollab {tag}){", aspecto" if kind == "look" else ""} */')
        meta_lines.append(f'  {new}: {json.dumps(meta, separators=(",", ":"))},')
        if en not in zh_name:
            zh_lines.append(f'  {json.dumps(en, ensure_ascii=False)}: {json.dumps(zhn, ensure_ascii=False)},')
        credits.append((new, tag, bool(sxml)))
        taken.add(new)
        print(f'{new} {kind} {en} / {zhn} · {sorted(normal)} · shiny {"SpriteCollab" if shiny else ("tono" if meta.get("sh") else "no")}{" · flota" if meta.get("hv") else ""}')
    if DRY or not dex_lines:
        return
    # pokedex.js: al final de la lista (la última fila va sin coma)
    lines = src.rstrip('\n').split('\n')
    end = max(i for i, l in enumerate(lines) if l.startswith('];'))
    last = end - 1
    lines[last] = re.sub(r'^(  \{.*?\})(\s*/\*.*\*/)?$', lambda m: m.group(1) + ',' + (m.group(2) or ''), lines[last], count=1) \
        if not re.match(r'^  \{.*?\},', lines[last]) else lines[last]
    dex_lines[-1] = re.sub(r'\},(\s*/\*)', r'}\1', dex_lines[-1], count=1)
    lines[end:end] = ['  /* ---- copia local, 24-11-2026: formas nuevas de SpriteCollab (tools/add_forms.py) ---- */'] + dex_lines
    write(DEX_JS, '\n'.join(lines) + '\n')
    m = read(fs.OUT_META)
    m = m.replace('\n};', '\n' + '\n'.join(meta_lines) + '\n};', 1)
    write(fs.OUT_META, m)
    if zh_lines:
        z = read(ZH_JS)
        anchor = '  "Terastal Terapagos": "太晶太樂巴戈斯",'
        assert anchor in z
        write(ZH_JS, z.replace(anchor, anchor + '\n' + '\n'.join(zh_lines), 1))
    json.dump(credits, open(os.path.join(fs.CACHE, 'add_forms_credits.json'), 'w'))
    print(f'\n{len(dex_lines)} formas añadidas')


if __name__ == '__main__':
    main()
