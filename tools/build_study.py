"""Assemble the style-frame study page from the real theme modules.

The study is a decision aid, not a fork: it inlines util.js, pencil.js and
capsid.js verbatim (imports stripped, ES modules flattened) plus the built
capsid data, so what the team judges is exactly what the site will run. Keeping
a hand-copied duplicate here would drift within a day.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
SRC = os.path.join(HERE, 'study')


def flatten(path):
    """ES module -> plain script: drop imports, drop the `export` keyword."""
    s = open(path).read()
    s = re.sub(r'^\s*import\s.*?;\s*$', '', s, flags=re.M | re.S)
    s = re.sub(r'^export\s+(?=(const|let|var|function|class|default))', '', s, flags=re.M)
    s = re.sub(r'^export\s*\{[^}]*\};\s*$', '', s, flags=re.M)
    return s


def main():
    js = os.path.join(ROOT, 'theme', 'js')
    parts = [flatten(os.path.join(js, n)) for n in ('util.js', 'pencil.js', 'capsid.js')]
    data = open(os.path.join(ROOT, 'theme', 'data', 'capsid.json')).read()
    page = (open(os.path.join(SRC, 'head.html')).read()
            + open(os.path.join(SRC, 'body.html')).read()
            + '<script>\n'
            + '\n'.join(parts)
            + '\n' + open(os.path.join(SRC, 'study.js')).read().replace('__CAPSID__', data)
            + '\n</script>\n')
    for dst in sys.argv[1:] or [os.path.join(HERE, 'sandbox', 'study.html')]:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, 'w').write(page)
        print(f'{dst}  {os.path.getsize(dst)/1024:.0f} KB')


if __name__ == '__main__':
    main()
