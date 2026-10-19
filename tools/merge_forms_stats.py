# -*- coding: utf-8 -*-
"""Copia local: rehace js/data/pokedex.js a partir de la Pokédex de upstream (con pa/sa/df/sd)
y le vuelve a añadir nuestras formas alternativas (dex > 1025) con esas mismas estadísticas.

  - Las formas con datos en PokeAPI: tipos, hp/spd/atk/pa/sa/df/sd, BST y rareza reales.
  - Sin datos (formas propias de SpriteCollab): las de la especie base, escaladas a su 'atk'.
  - Las exclusivas (excl, Mega Rayquaza) conservan su vida/velocidad/ataque y sólo reciben pa/sa/df/sd.

Uso:  python tools/merge_forms_stats.py <pokedex-de-upstream.js>
"""
import json, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEX_JS = os.path.join(ROOT, 'js', 'data', 'pokedex.js')
API = 'https://pokeapi.co/api/v2/pokemon/'

src_all = open(os.path.join(ROOT, 'tools', 'fetch_forms_all.py'), encoding='utf-8').read()
FORMS = dict(re.findall(r"^    '([A-Za-z_]+)': \('([a-z0-9-]+)',", src_all, flags=re.M))
SPECIAL = {(128, 'Paldea'): 'tauros-paldea-combat-breed', (194, 'Paldea'): 'wooper-paldea',
           (888, 'Crowned_Sword'): 'zacian-crowned', (889, 'Crowned_Shield'): 'zamazenta-crowned',
           (555, 'Galar'): 'darmanitan-galar-standard'}
# formas añadidas a mano (sin comentario «forma X de N»)
MANUAL = {1094: 'gengar-mega', 1382: 'kyogre-primal', 1383: 'groudon-primal', 1384: 'rayquaza-mega',
          1483: 'dialga-origin', 1484: 'palkia-origin', 1646: 'kyurem-white', 2646: 'kyurem-black',
          1800: 'necrozma-ultra', 1888: 'zacian-crowned', 1889: 'zamazenta-crowned'}


def get(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 PokeSurvivor-tools'})
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
        except Exception:
            pass
        time.sleep(1 + i)
    return None


def mul(v):
    return round(0.70 + v / 100 * 0.55, 2)


def rarity(bst):
    return 5 if bst >= 600 else 4 if bst >= 495 else 3 if bst >= 410 else 2 if bst >= 320 else 1


def slugify(name):
    return re.sub(r"[.'’:]", '', name.lower()).replace(' ', '-').replace('♀', '-f').replace('♂', '-m')


def main():
    up = open(sys.argv[1], encoding='utf-8').read().replace('\r\n', '\n')
    ours = open(DEX_JS, encoding='utf-8').read()
    up_rows = {int(m.group(1)): json.loads(m.group(2)) for m in re.finditer(r'^  (\{"dex":(\d+),.*?\})', up, re.M) for _ in [0]} if False else {}
    for m in re.finditer(r'^  (\{"dex":(\d+),.*?\}),?$', up, re.M):
        up_rows[int(m.group(2))] = json.loads(m.group(1))
    pat = re.compile(r'^  (\{"dex":(\d+),.*?\}),?(\s*/\*.*\*/)?\s*$', re.M)
    forms = []
    for m in pat.finditer(ours):
        d = int(m.group(2))
        if d in up_rows:
            continue                      # de upstream (las nuestras son las que upstream no tiene: 1020 incluido)
        e = json.loads(m.group(1)); cmt = (m.group(3) or '').strip()
        cm = re.search(r'forma ([A-Za-z_]+) de (\d+)', cmt)
        base = int(cm.group(2)) if cm else d % 1000
        fname = cm.group(1) if cm else None
        if d in MANUAL:
            api = MANUAL[d]
        elif (base, fname) in SPECIAL:
            api = SPECIAL[(base, fname)]
        elif fname in FORMS and base in up_rows:
            api = slugify(up_rows[base]['name']) + '-' + FORMS[fname]
        else:
            api = None
        forms.append((e, cmt, base, api))

    def fetch(item):
        e, cmt, base, api = item
        return item, (get(API + api + '/') if api else None)

    with ThreadPoolExecutor(max_workers=6) as ex:
        res = list(ex.map(fetch, forms))

    lines, derived = [], []
    for (e, cmt, base, api), data in res:
        b = up_rows.get(base)
        out = dict(e)
        if data:
            st = {s['stat']['name']: s['base_stat'] for s in data['stats']}
            stats = {'pa': mul(st['attack']), 'sa': mul(st['special-attack']), 'df': st['defense'], 'sd': st['special-defense']}
            if not e.get('excl'):
                bst = sum(st.values())
                out.update({'types': [t['type']['name'] for t in sorted(data['types'], key=lambda t: t['slot'])],
                            'hp': round(70 + st['hp'] * 0.45), 'spd': round(78 + st['speed'] * 0.42),
                            'atk': max(stats['pa'], stats['sa']), 'rarity': rarity(bst), 'bst': bst})
            else:
                # exclusiva: su ataque (reforzado) se reparte en físico/especial con la proporción real
                hi = max(stats['pa'], stats['sa'])
                stats['pa'] = round(stats['pa'] / hi * e['atk'], 2); stats['sa'] = round(stats['sa'] / hi * e['atk'], 2)
        else:
            derived.append(e['name'])
            k = e['atk'] / b['atk'] if b and b.get('atk') else 1
            stats = {'pa': round((b or {}).get('pa', e['atk']) * k, 2), 'sa': round((b or {}).get('sa', e['atk']) * k, 2),
                     'df': (b or {}).get('df', 75), 'sd': (b or {}).get('sd', 75)}
        # mismo orden de claves que upstream: pa/sa/df/sd detrás de atk
        row = {}
        for kk, v in out.items():
            if kk in ('pa', 'sa', 'df', 'sd'):
                continue
            row[kk] = v
            if kk == 'atk':
                row.update(stats)
        lines.append('  ' + json.dumps(row, ensure_ascii=False, separators=(',', ':')) + ',' + ('   ' + cmt if cmt else ''))

    i = up.rstrip().rfind('\n];')
    assert i > 0
    body = up[:i].rstrip()
    if not body.endswith(','):
        body += ','
    final = body + '\n  /* ---- copia local: formas alternativas (tools/fetch_forms_all.py, tools/merge_forms_stats.py) ---- */\n' + '\n'.join(lines).rstrip(',') + '\n];\n'
    final = final.replace(lines[-1] + '\n];', lines[-1].rstrip(',') + '\n];') if False else final
    # quitar la coma del último elemento aunque lleve comentario
    final = re.sub(r',(\s*/\*[^\n]*\*/)?\n\];\n$', r'\1\n];\n', final)
    open(DEX_JS, 'w', encoding='utf-8', newline='\n').write(final)
    print('formas:', len(lines), '| derivadas de la especie (sin datos en PokeAPI):', derived)


if __name__ == '__main__':
    main()
