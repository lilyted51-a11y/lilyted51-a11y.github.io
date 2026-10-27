#!/usr/bin/env bash
# Igual que merge_up2 pero con los tres lados sin \r (los ficheros de upstream llevan finales de línea mezclados y
# cambian de una versión a otra: eso hacía que TODO el fichero saliera en conflicto).
set -u
THEIRS=upstream/main
EXCL='^(\.github/|infra/|tools/trailer/|js/ui/live-ui\.js|js/app\.min\.js|index\.html|en/index\.html|version\.json|sitemap\.xml|js/lang/|README\.md|docs/|guia/|en/(guide|items|legendaries|moves|news|shinies)/|legendarios/|movimientos/|novedades/|objetos/|shinies/|firestore\.rules|database\.rules\.json)'
T=$(mktemp -d)
norm() { git show "$1" | tr -d '\r'; }
git diff --name-status ce578531 $THEIRS | while IFS=$'\t' read -r st f; do
  [[ "$f" =~ $EXCL ]] && continue
  if ! git cat-file -e "HEAD:$f" 2>/dev/null; then mkdir -p "$(dirname "$f")"; git show "$THEIRS:$f" > "$f"; echo "A  $f"; continue; fi
  if [ "$st" = "D" ]; then echo "D? $f (upstream lo borra; se queda)"; continue; fi
  case "$f" in *.png|*.jpg|*.webp|*.ogg|*.mp3|*.woff2) git show "$THEIRS:$f" > "$f"; echo "B  $f"; continue;; esac
  norm "HEAD:$f" > "$T/ours"; oh=$(sha1sum < "$T/ours")
  best=""; bestn=999999; exact=""
  for c in $(git log --format=%H $THEIRS -- "$f"); do
    git cat-file -e "$c:$f" 2>/dev/null || continue
    norm "$c:$f" > "$T/cand"
    if [ "$(sha1sum < "$T/cand")" = "$oh" ]; then exact=$c; break; fi
    n=$(diff "$T/cand" "$T/ours" | grep -c '^[<>]')
    if [ "$n" -lt "$bestn" ]; then bestn=$n; best=$c; fi
  done
  if [ -n "$exact" ]; then norm "$THEIRS:$f" > "$f"; echo "M  $f (igual que upstream $(git log -1 --format=%h $exact): suyo tal cual)"; continue; fi
  norm "$best:$f" > "$T/base"; norm "$THEIRS:$f" > "$T/theirs"
  git merge-file -p -L nuestro -L base -L upstream "$T/ours" "$T/base" "$T/theirs" > "$T/out"; rc=$?
  cp "$T/out" "$f"
  if [ $rc -gt 0 ]; then echo "C  $f ($rc conflictos, $(awk '/^<<<<<<</{s=NR} /^>>>>>>>/{t+=NR-s} END{print t+0}' "$f") líneas; base $(git log -1 --format=%h $best), nuestro diff $bestn)"; else echo "m  $f (limpio; base $(git log -1 --format=%h $best), nuestro diff $bestn)"; fi
done
rm -rf "$T"
