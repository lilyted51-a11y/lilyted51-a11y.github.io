# -*- coding: utf-8 -*-
"""Copia local: corrige las estadísticas de las formas alternativas (dex > 1025) con los
datos reales de PokeAPI. fetch_forms_all.py las añadió como exclusivas «un poco por encima»
de la especie (+100 de BST) cuando PokeAPI no respondió; ahora que están en el gacha de
todos, deben tener sus números de verdad y la rareza que les toca por BST.

Uso:  python tools/fix_form_stats.py            (escribe js/data/pokedex.js)
      python tools/fix_form_stats.py --dry      (sólo muestra los cambios)
"""
import json, os, re, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEX_JS = os.path.join(ROOT, 'js', 'data', 'pokedex.js')
API = 'https://pokeapi.co/api/v2/pokemon/'
DRY = '--dry' in sys.argv

# fname (SpriteCollab) -> sufijo de PokeAPI, leído del script que las añadió
src_all = open(os.path.join(ROOT, 'tools', 'fetch_forms_all.py'), encoding='utf-8').read()
FORMS = dict(re.findall(r"^    '([A-Za-z_]+)': \('([a-z0-9-]+)',", src_all, flags=re.M))
# casos en que el nombre de PokeAPI no es especie-sufijo
SPECIAL = {(128, 'Paldea'): 'tauros-paldea-combat-breed', (194, 'Paldea'): 'wooper-paldea',
           (888, 'Crowned_Sword'): 'zacian-crowned', (889, 'Crowned_Shield'): 'zamazenta-crowned'}


def fetch_json(url, tries=4):
    for i in range(tries):
        try:
            # PokeAPI devuelve 403 al User-Agent por defecto de Python
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 PokeSurvivor-tools'})
            with urllib.request.urlopen(req, timeout=15) as r:
                return json.loads(r.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(1.5 * (i + 1))
        except Exception:
            time.sleep(1.5 * (i + 1))
    return None


def rarity(bst):
    return 5 if bst >= 600 else 4 if bst >= 495 else 3 if bst >= 410 else 2 if bst >= 320 else 1


def main():
    src = open(DEX_JS, encoding='utf-8').read()
    lines = src.split('\n')
    pat = re.compile(r'^(\s*)(\{"dex":(\d+),.*?\}),\s*/\* forma ([A-Za-z_]+) de (\d+) \(SpriteCollab [^)]*\) \*/\s*$')
    species_slug, changed, failed = {}, [], []
    for i, line in enumerate(lines):
        m = pat.match(line)
        if not m:
            continue
        entry = json.loads(m.group(2))
        if entry.get('excl'):
            continue                      # Mega Rayquaza: sigue siendo exclusivo y fuerte
        fname, base = m.group(4), int(m.group(5))
        suffix = FORMS.get(fname)
        if not suffix:
            failed.append((entry['name'], 'sin sufijo')); continue
        # slug de la especie: a partir del nombre (sin pedirlo a la API); si no existe, se pregunta a la API
        slug = species_slug.get(base)
        if not slug:
            bname = re.search(r'"dex":%d,"name":"([^"]+)"' % base, src)
            slug = species_slug[base] = re.sub(r"[.'’:]", '', bname.group(1).lower()).replace(' ', '-') if bname else None
        name = SPECIAL.get((base, fname)) or (slug and f'{slug}-{suffix}')
        data = fetch_json(API + name + '/') if name else None
        if not data and slug and (base, fname) not in SPECIAL:
            sp = fetch_json(f'https://pokeapi.co/api/v2/pokemon-species/{base}/')
            if sp and sp.get('name') != slug:
                slug = species_slug[base] = sp['name']
                data = fetch_json(API + f'{slug}-{suffix}/')
        done = len(changed) + len(failed) + 1
        if done % 10 == 0:
            print('  …', done, 'formas consultadas', flush=True)
        if not data and fname in ('Crowned_Sword', 'Crowned_Shield') and slug:
            data = fetch_json(API + f'{slug}-crowned/')
        if not data:
            failed.append((entry['name'], name)); continue
        st = {s['stat']['name']: s['base_stat'] for s in data['stats']}
        types = [t['type']['name'] for t in sorted(data['types'], key=lambda t: t['slot'])]
        bst = sum(st.values())
        new = dict(entry)
        new.update({'types': types, 'hp': round(70 + st['hp'] * 0.45), 'spd': round(78 + st['speed'] * 0.42),
                    'atk': round(0.70 + max(st['attack'], st['special-attack']) / 100 * 0.55, 2),
                    'rarity': rarity(bst), 'bst': bst})
        if new != entry:
            changed.append((entry['name'], entry['bst'], bst, entry['rarity'], new['rarity'], entry['hp'], new['hp'], entry['atk'], new['atk']))
            lines[i] = m.group(1) + json.dumps(new, separators=(',', ':'), ensure_ascii=False) + line[m.end(2):]
        time.sleep(0.15)
    for c in changed:
        print('  %-28s bst %4d -> %4d  rareza %d -> %d  hp %3d -> %3d  atk %.2f -> %.2f' % c)
    print(f'cambiadas {len(changed)}; sin datos {len(failed)}: {failed}')
    if not DRY and changed:
        open(DEX_JS, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
        print('escrito', DEX_JS)


if __name__ == '__main__':
    main()
