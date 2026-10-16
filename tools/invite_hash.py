"""Huella (SHA-256) de un código de invitación, para config/invite en Firestore.

    python tools/invite_hash.py MICODIGO

Pega la huella que sale en el campo `hashes` (array de strings) del documento
config/invite. Ver js/core/invite.js.
"""
import hashlib
import sys

if len(sys.argv) < 2:
    print('Uso: python tools/invite_hash.py CODIGO')
    sys.exit(1)
code = ' '.join(sys.argv[1:]).strip()
print(hashlib.sha256(code.encode('utf-8')).hexdigest())
