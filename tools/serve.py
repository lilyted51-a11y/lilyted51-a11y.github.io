"""Servidor local para jugar en este ordenador, SIN caché.

    python tools/serve.py [puerto] [--open]

Con `python -m http.server` el navegador se queda con copias viejas de los
archivos (no manda Cache-Control) y tras reconstruir sigue la versión anterior.
Aquí cada archivo se vuelve a pedir siempre.
"""
import functools
import http.server
import os
import sys
import webbrowser


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *args):
        pass


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    port = int(args[0]) if args else 8000
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    handler = functools.partial(NoCache, directory=root)
    url = f'http://localhost:{port}/'
    with http.server.ThreadingHTTPServer(('', port), handler) as srv:
        print(f'PokeSurvivor: {url}  (Ctrl+C para parar)')
        if '--open' in sys.argv:
            webbrowser.open(url)
        srv.serve_forever()


if __name__ == '__main__':
    main()
