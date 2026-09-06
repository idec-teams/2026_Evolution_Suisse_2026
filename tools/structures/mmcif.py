"""Minimal mmCIF loop reader. No external deps beyond numpy at the call site.

Only what the structure pipeline needs: named loops returned as dict-of-columns,
and single `_cat.key value` items. Multi-line ;...; values are handled because
entity_poly sequences use them and would otherwise desync the tokeniser.
"""
import re, shlex


def _tokens(line):
    return shlex.split(line, posix=False)


def read(path):
    items, loops = {}, {}
    lines = open(path).read().splitlines()
    i, n = 0, len(lines)
    while i < n:
        L = lines[i]
        if L.startswith(';'):                       # stray text block
            i += 1
            while i < n and not lines[i].startswith(';'):
                i += 1
            i += 1
            continue
        if L.startswith('loop_'):
            i += 1
            names = []
            while i < n and lines[i].lstrip().startswith('_'):
                names.append(lines[i].strip())
                i += 1
            cat = names[0].split('.')[0]
            cols = [nm.split('.', 1)[1] for nm in names]
            rows = []
            while i < n:
                s = lines[i]
                if s.startswith(('#', 'loop_', 'data_')) or s.lstrip().startswith('_'):
                    break
                if s.startswith(';'):               # multi-line value
                    buf, i = [], i + 1
                    while i < n and not lines[i].startswith(';'):
                        buf.append(lines[i]); i += 1
                    i += 1
                    rows[-1].append('\n'.join(buf)) if rows and len(rows[-1]) < len(cols) \
                        else rows.append(['\n'.join(buf)])
                    continue
                if s.strip():
                    tk = _tokens(s)
                    if rows and len(rows[-1]) < len(cols):
                        rows[-1].extend(tk)
                    else:
                        rows.append(tk)
                i += 1
            good = [r for r in rows if len(r) == len(cols)]
            loops[cat] = {c: [r[k] for r in good] for k, c in enumerate(cols)}
            continue
        if L.startswith('_'):
            tk = _tokens(L)
            if len(tk) >= 2:
                items[tk[0]] = tk[1].strip("'\"")
            i += 1
            continue
        i += 1
    return items, loops
