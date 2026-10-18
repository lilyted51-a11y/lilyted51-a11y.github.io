#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Copia local: añade de golpe las FORMAS alternativas con animaciones completas
en SpriteCollab (Megas, regionales, Origen, Therian, etc.) como Pokémon
exclusivos del administrador (excl: true). Tipos y estadísticas: PokeAPI.

    python tools/fetch_forms_all.py            # descarga + entradas + nombres zh
    python tools/fetch_forms_all.py --dry      # sólo lista lo que haría

Genera:
  - assets/pokemon/{dex}/ (y /s shiny generado girando el tono 40°)
  - js/data/sprites-meta.js (entrada por forma)
  - js/data/pokedex.js  (entradas excl: true, dex = base + 1000·k)
  - js/zh-tw.js         (nombre en chino tradicional)
"""
import io
import json
import os
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_sprites as fs      # noqa: E402
import fetch_form as ff         # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEX_JS = os.path.join(ROOT, 'js', 'data', 'pokedex.js')
ZH_JS = os.path.join(ROOT, 'js', 'zh-tw.js')
API = 'https://pokeapi.co/api/v2/pokemon/'
DRY = '--dry' in sys.argv

# Formas que cuentan como "forma" de verdad (cambian aspecto/tipos/estadísticas).
# nombre SpriteCollab -> (sufijo PokeAPI, nombre ES/EN, nombre ZH; {n} = especie)
FORMS = {
    'Mega': ('mega', 'Mega {n}', 'Mega {n}'),
    'Mega_X': ('mega-x', 'Mega {n} X', 'Mega {n} X'),
    'Mega_Y': ('mega-y', 'Mega {n} Y', 'Mega {n} Y'),
    'Alola': ('alola', 'Alolan {n}', '阿羅拉{n}'),
    'Galar': ('galar', 'Galarian {n}', '伽勒爾{n}'),
    'Hisui': ('hisui', 'Hisuian {n}', '洗翠{n}'),
    'Paldea': ('paldea', 'Paldean {n}', '帕底亞{n}'),
    'Paldea_Blaze': ('paldea-blaze-breed', 'Paldean {n} (Blaze)', '帕底亞{n}（火熾種）'),
    'Paldea_Aqua': ('paldea-aqua-breed', 'Paldean {n} (Aqua)', '帕底亞{n}（水瀾種）'),
    'Primal': ('primal', 'Primal {n}', '原始{n}'),
    'Origin': ('origin', 'Origin {n}', '{n} 起源型態'),
    'Therian': ('therian', 'Therian {n}', '{n} 靈獸型態'),
    'Attack': ('attack', '{n} Attack', '{n} 攻擊型態'),
    'Defense': ('defense', '{n} Defense', '{n} 防禦型態'),
    'Speed': ('speed', '{n} Speed', '{n} 速度型態'),
    'Sunny': ('sunny', '{n} Sunny', '{n} 晴天型態'),
    'Rainy': ('rainy', '{n} Rainy', '{n} 雨天型態'),
    'Snowy': ('snowy', '{n} Snowy', '{n} 雪天型態'),
    'Heat': ('heat', 'Heat {n}', '加熱{n}'),
    'Wash': ('wash', 'Wash {n}', '清洗{n}'),
    'Frost': ('frost', 'Frost {n}', '結冰{n}'),
    'Fan': ('fan', 'Fan {n}', '旋轉{n}'),
    'Mow': ('mow', 'Mow {n}', '切割{n}'),
    'Sky': ('sky', 'Sky {n}', '{n} 天空型態'),
    'Zen': ('zen', 'Zen {n}', '{n} 達摩模式'),
    'Pirouette': ('pirouette', '{n} Pirouette', '{n} 舞步形態'),
    'Blade': ('blade', '{n} Blade', '{n} 刀劍形態'),
    '10': ('10', '{n} 10%', '{n} 10%'),
    'Complete': ('complete', '{n} Complete', '{n} 完全體'),
    'Unbound': ('unbound', '{n} Unbound', '{n} 解放'),
    'Pom_Pom': ('pom-pom', '{n} Pom-Pom', '{n} 熱辣熱辣風格'),
    'Pa_U': ('pau', "{n} Pa'u", '{n} 呼拉呼拉風格'),
    'Sensu': ('sensu', '{n} Sensu', '{n} 輕盈輕盈風格'),
    'Midnight': ('midnight', '{n} Midnight', '{n} 黑夜型態'),
    'Dusk': ('dusk', '{n} Dusk', '{n} 黃昏型態'),
    'School': ('school', '{n} School', '{n} 魚群型態'),
    'Lowkey': ('low-key', '{n} Low Key', '{n} 低調型態'),
    'Eternamax': ('eternamax', '{n} Eternamax', '無極巨化{n}'),
    'Rapid_Strike': ('rapid-strike', '{n} Rapid Strike', '{n} 連擊流'),
    'Bloodmoon': ('bloodmoon', 'Bloodmoon {n}', '赫月{n}'),
    'Hero': ('hero', '{n} Hero', '{n} 全能型態'),
    'Wellspring_Mask': ('wellspring-mask', '{n} Wellspring', '{n} 水井面具'),
    'Hearthflame_Mask': ('hearthflame-mask', '{n} Hearthflame', '{n} 火灶面具'),
    'Cornerstone_Mask': ('cornerstone-mask', '{n} Cornerstone', '{n} 礎石面具'),
    'Terastal': ('terastal', 'Terastal {n}', '太晶{n}'),
    'Sand': ('sandy', '{n} Sandy', '{n} 砂土蓑衣'),
    'Trash': ('trash', '{n} Trash', '{n} 垃圾蓑衣'),
    'Ultra': ('ultra', 'Ultra {n}', '究極{n}'),
    'Crowned_Sword': ('crowned', '{n} Crowned Sword', '{n} 劍王型態'),
    'Crowned_Shield': ('crowned', '{n} Crowned Shield', '{n} 盾王型態'),
    'White': ('white', 'White {n}', '焰白{n}'),
    'Black': ('black', 'Black {n}', '暗黑{n}'),
}
# Sólo para estas especies cuentan estas formas (en otras son variantes de color/cutscene).
ONLY = {'Sand': {412, 413}, 'Trash': {412, 413}, 'White': {646}, 'Black': {646}, 'Attack': {386}, 'Defense': {386}, 'Speed': {386},
        'Sunny': {351}, 'Rainy': {351}, 'Snowy': {351}, 'Sky': {492}, 'Zen': {555}, 'Blade': {681}, '10': {718}, 'Complete': {718},
        'Hero': {964}, 'School': {746}, 'Dusk': {745}, 'Midnight': {745}}
REQ = {'Idle', 'Walk', 'Attack'}


def rarity(bst):
    return 5 if bst >= 580 else 4 if bst >= 495 else 3 if bst >= 410 else 2 if bst >= 320 else 1


def gen_of(dex):
    for g, hi in enumerate([151, 251, 386, 493, 649, 721, 809, 905, 1025], 1):
        if dex <= hi:
            return g
    return 9


def fetch_json(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 PokeSurvivor-tools'}), timeout=30) as r:
            return json.loads(r.read().decode('utf-8'))
    except Exception:
        return None


def main():
    tracker = json.load(open(os.path.join(fs.CACHE, 'tracker.json'), encoding='utf-8'))
    src = open(DEX_JS, encoding='utf-8').read()
    have = {int(m): True for m in re.findall(r'"dex":(\d+),', src)}
    names = dict((int(d), n) for d, n in re.findall(r'"dex":(\d+),"name":"([^"]+)"', src))
    zh_src = open(ZH_JS, encoding='utf-8').read()
    zh = dict(re.findall(r'^  "([^"]+)": "([^"]+)",$', zh_src, flags=re.M))

    jobs = []
    for dex in range(1, 1026):
        e = tracker.get(f'{dex:04d}')
        if not e or dex not in names:
            continue
        k = 0
        for fid, sg in sorted(e.get('subgroups', {}).items()):
            fname = sg.get('name', '')
            if fid == '0000' or fname not in FORMS or not REQ <= set(sg.get('sprite_files', {})):
                continue
            if fname in ONLY and dex not in ONLY[fname]:
                continue
            k += 1
            new_dex = dex + 1000 * k
            # ya añadido a mano (Mega Rayquaza, etc.): se salta por nombre de forma
            api_suffix, en_fmt, zh_fmt = FORMS[fname]
            en_name = en_fmt.replace('{n}', names[dex])
            if any(x == en_name for x in names.values()):
                continue
            while new_dex in have:
                new_dex += 1000
            have[new_dex] = True
            jobs.append((dex, fid, fname, new_dex, api_suffix, en_name, zh_fmt.replace('{n}', zh.get(names[dex], names[dex]))))

    print(f'{len(jobs)} formas')
    if DRY:
        for j in jobs:
            print(' ', j[3], j[5], '/', j[6])
        return

    species_slug = {}
    def api_for(job):
        dex, fid, fname, new_dex, suffix, en, zhn = job
        slug = species_slug.get(dex)
        if not slug:
            sp = fetch_json(f'https://pokeapi.co/api/v2/pokemon-species/{dex}/')
            slug = species_slug[dex] = (sp or {}).get('name', names[dex].lower())
        data = fetch_json(API + f'{slug}-{suffix}/')
        if not data and fname in ('Crowned_Sword', 'Crowned_Shield'):
            data = fetch_json(API + f'{slug}-crowned/')
        return job, data

    with ThreadPoolExecutor(max_workers=6) as ex:
        api_results = list(ex.map(api_for, jobs))

    def sprite_for(item):
        job, data = item
        dex, fid, fname, new_dex, *_ = job
        try:
            base = f'{fs.BASE}/{dex:04d}/{fid}'
            out_dir = os.path.join(fs.OUT_ASSETS, str(new_dex))
            xml = fs.fetch(f'{base}/AnimData.xml')
            if not xml:
                return job, data, None
            anims, shadow = fs.parse_animdata(xml.decode('utf-8', 'replace'))
            normal = fs.download_set(base, out_dir, anims)
            if not fs.REQUIRED & set(normal):
                return job, data, None
            meta = {'s': shadow, 'a': normal}
            ff.hue_shiny(out_dir, os.path.join(out_dir, 's'), normal, 40)
            meta['sh'] = 1
            with open(os.path.join(fs.CACHE, f'{new_dex}.json'), 'w', encoding='utf-8') as f:
                json.dump(meta, f, separators=(',', ':'))
            return job, data, meta
        except Exception as e:  # noqa: BLE001
            print('  fallo', new_dex, e)
            return job, data, None

    with ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(sprite_for, api_results))

    dex_lines, zh_lines, meta_lines, skipped = [], [], [], []
    for job, data, meta in results:
        dex, fid, fname, new_dex, suffix, en, zhn = job
        if not meta:
            skipped.append((new_dex, en, 'sprites')); continue
        if data:
            base_st = {s['stat']['name']: s['base_stat'] for s in data['stats']}
            types = [t['type']['name'] for t in sorted(data['types'], key=lambda t: t['slot'])]
            bst = sum(base_st.values())
            hp = round(70 + base_st['hp'] * 0.45); spd = round(78 + base_st['speed'] * 0.42)
            atk = round(0.70 + max(base_st['attack'], base_st['special-attack']) / 100 * 0.55, 2)
        else:
            # sin datos en PokeAPI: se hereda la especie, un poco por encima
            m = re.search(r'\{"dex":%d,"name":"[^"]+","types":(\[[^\]]+\]),"hp":(\d+),"spd":(\d+),"atk":([\d.]+),"rarity":\d,"bst":(\d+)' % dex, src)
            if not m:
                skipped.append((new_dex, en, 'stats')); continue
            types = json.loads(m.group(1)); hp = int(m.group(2)) + 8; spd = int(m.group(3)) + 4
            atk = round(float(m.group(4)) + 0.12, 2); bst = int(m.group(5)) + 100
        if 'fairy' not in types and len(types) == 0:
            skipped.append((new_dex, en, 'types')); continue
        dex_lines.append('  ' + json.dumps({'dex': new_dex, 'name': en, 'types': types, 'hp': hp, 'spd': spd, 'atk': atk,
                                              'rarity': max(4, rarity(bst)), 'bst': bst, 'starter': False, 'gen': gen_of(dex), 'excl': True},
                                             separators=(',', ':'), ensure_ascii=False) + f',   /* forma {fname} de {dex} (SpriteCollab {dex:04d}/{fid}) */')
        zh_lines.append(f'  "{en}": "{zhn}",')
        meta_lines.append(f'  {new_dex}: {json.dumps(meta, separators=(",", ":"))},')

    # pokedex.js: antes del cierre del array
    s = open(DEX_JS, encoding='utf-8').read()
    marker = '\n];'
    assert s.count(marker) >= 1
    i = s.rfind(marker)
    s = s[:i] + '\n  /* ---- copia local: formas exclusivas (tools/fetch_forms_all.py) ---- */\n' + '\n'.join(dex_lines) + s[i:]
    open(DEX_JS, 'w', encoding='utf-8', newline='\n').write(s)
    # sprites-meta.js
    m = open(fs.OUT_META, encoding='utf-8').read()
    m = m.replace('\n};', '\n' + '\n'.join(meta_lines) + '\n};', 1)
    open(fs.OUT_META, 'w', encoding='utf-8', newline='\n').write(m)
    # zh
    z = open(ZH_JS, encoding='utf-8').read()
    anchor = '  "Mega Rayquaza": "Mega 烈空坐",'
    assert anchor in z
    z = z.replace(anchor, anchor + '\n' + '\n'.join(zh_lines), 1)
    open(ZH_JS, 'w', encoding='utf-8', newline='\n').write(z)
    print(f'añadidas {len(dex_lines)} formas; saltadas {len(skipped)}: {skipped}')
    json.dump([j[3] for j, d, m in results if m], open(os.path.join(fs.CACHE, 'forms_added.json'), 'w'))


if __name__ == '__main__':
    main()
