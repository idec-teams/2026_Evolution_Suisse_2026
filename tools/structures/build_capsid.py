"""6NJ8 -> theme/data/capsid.json — the real QtEncapsulin T=4 shell.

── Data layout ───────────────────────────────────────────────────────────────
The deposited file holds ONE icosahedral asymmetric unit: 4 shell protomers and
3 bound targeting peptides. Every one of the 240 subunits is one of those same
4 chains under one of 60 rotations. So we ship the 4 chains once and the 60
operators once, and the browser reconstructs the shell — instead of shipping
240 baked copies of the same four things.

That is not only smaller. It also lets the renderer fold the view rotation into
each operator ONCE per frame (60 3x3 multiplies) and then transform every point
with a single matrix-vector product, which is what makes 240 subunits of real
backbone affordable at 60 fps.

Per chain we ship two things:
  trace  a decimated, smoothed Ca path — the fold itself, for detailed styles
  shape  farthest-point-sampled Ca positions whose projected convex hull is the
         subunit silhouette. FPS captures the extremities, which is what a
         silhouette needs; uniform sampling smooths the subunit into a blob.

── Capsomers ────────────────────────────────────────────────────────────────
A T=4 shell is 12 pentamers on the 5-fold axes plus 30 hexamers on the 2-fold
axes: 12x5 + 30x6 = 240. Both axis sets are recovered from the operator group
itself rather than hard-coded, so a subunit's penton/hexon identity is derived
from the deposited symmetry, not asserted. The icosahedral wireframe through
the 12 five-fold centres ships too, for use as construction lines.
"""
import json, os, sys
from collections import Counter
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mmcif

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SHAPE_PTS  = 28    # silhouette samples per subunit
TRACE_STEP = 6     # keep every Nth Ca for the detailed trace
Q = 1000           # quantisation (unit-sphere coords -> int); 1e-3 ~ 0.19 A


def farthest_point_sample(pts, k):
    idx = [int(np.argmax(np.linalg.norm(pts - pts.mean(0), axis=1)))]
    d = np.linalg.norm(pts - pts[idx[0]], axis=1)
    while len(idx) < k:
        j = int(np.argmax(d))
        idx.append(j)
        d = np.minimum(d, np.linalg.norm(pts - pts[j], axis=1))
    return pts[idx]


def chaikin3(p, rounds=1):
    for _ in range(rounds):
        out = [p[0]]
        for a, b in zip(p[:-1], p[1:]):
            out.append(a * 0.75 + b * 0.25)
            out.append(a * 0.25 + b * 0.75)
        out.append(p[-1])
        p = np.array(out)
    return p


def symmetry_axes(mats):
    """Recover the 5-fold and 2-fold axis directions from the rotation group.

    The naive order = round(360/angle) misfiles a 144 degree rotation as
    2-fold, so orders are taken from the angle directly: 72 and 144 are both
    5-fold, 120 is 3-fold, 180 is 2-fold.
    """
    got = {5: [], 3: [], 2: []}
    for M in mats:
        ang = np.degrees(np.arccos(np.clip((np.trace(M) - 1) / 2, -1, 1)))
        if ang < 1:
            continue
        order = 5 if (abs(ang - 72) < 2 or abs(ang - 144) < 2) else \
                3 if abs(ang - 120) < 2 else 2 if abs(ang - 180) < 2 else None
        if order is None:
            raise SystemExit(f'unexpected rotation angle {ang:.1f} deg')
        w, v = np.linalg.eig(M)
        ax = np.real(v[:, int(np.argmin(np.abs(w - 1)))])
        ax = ax / np.linalg.norm(ax)
        if ax[int(np.argmax(np.abs(ax)))] < 0:
            ax = -ax
        got[order].append(ax)

    def uniq(A, tol=1e-3):
        out = []
        for a in A:
            if not any(min(np.linalg.norm(a - b), np.linalg.norm(a + b)) < tol for b in out):
                out.append(a)
        return np.array(out)

    five, two = uniq(np.array(got[5])), uniq(np.array(got[2]))
    assert len(five) == 6 and len(two) == 15, (len(five), len(two))
    # An axis is a line; each gives two antipodal centres.
    verts = np.vstack([five, -five])                       # 12 pentamer centres
    edges = np.vstack([two, -two])                         # 30 hexamer centres
    return verts, edges


def main():
    items, lo = mmcif.read(os.path.join(HERE, 'cache', '6NJ8.cif'))
    a = lo['_atom_site']
    xyz = np.array([a['Cartn_x'], a['Cartn_y'], a['Cartn_z']], float).T
    ent, asym, atom = (np.array(a[k]) for k in
                       ('label_entity_id', 'label_asym_id', 'label_atom_id'))
    ca = atom == 'CA'
    shell_chains = sorted(set(asym[(ent == '1') & ca]))
    pep_chains   = sorted(set(asym[(ent == '2') & ca]))

    op = lo['_pdbx_struct_oper_list']
    mats, vecs = [], []
    for i, oid in enumerate(op['id']):
        if not oid.isdigit():
            continue
        mats.append([[float(op[f'matrix[{r}][{c}]'][i]) for c in (1, 2, 3)] for r in (1, 2, 3)])
        vecs.append([float(op[f'vector[{r}]'][i]) for r in (1, 2, 3)])
    mats, vecs = np.array(mats), np.array(vecs)
    assert len(mats) == 60

    # Shell centre and scale, from the whole assembly.
    asu = np.concatenate([xyz[ca & (asym == c)] for c in shell_chains])
    allp = np.concatenate([asu @ M.T + v for M, v in zip(mats, vecs)])
    centre = allp.mean(0)
    radius = float(np.linalg.norm(allp - centre, axis=1).mean())

    verts, edges = symmetry_axes(mats)
    caps = np.vstack([verts, edges])                        # 42 capsomer centres
    kind = np.array([0] * 12 + [1] * 30)                    # 0 penton, 1 hexon

    # Chain templates, in the deposited frame (the operator maps them into place).
    chains = []
    for c in shell_chains:
        p = xyz[ca & (asym == c)]
        chains.append({
            'trace': chaikin3(p[::TRACE_STEP], 2),
            'shape': farthest_point_sample(p, SHAPE_PTS),
        })

    # One subunit per (operator, chain). Classify by its centroid direction.
    subunits, tally = [], Counter()
    for oi, (M, v) in enumerate(zip(mats, vecs)):
        for ci, c in enumerate(shell_chains):
            cen = (xyz[ca & (asym == c)] @ M.T + v - centre).mean(0)
            u = cen / np.linalg.norm(cen)
            cap = int(np.argmax(caps @ u))
            tally[cap] += 1
            subunits.append({'op': oi, 'ch': ci, 'cap': cap, 'k': int(kind[cap])})

    counts = Counter(tally[i] for i in range(42))
    print(f'capsomers: {counts[5]} pentamers x5 + {counts[6]} hexamers x6 '
          f'= {counts[5]*5 + counts[6]*6} subunits')
    assert counts[5] == 12 and counts[6] == 30, dict(counts)
    print(f'mean Ca radius {radius:.1f} A  (shell ~{2*radius/10:.0f} nm across)')

    # Icosahedral wireframe through the 12 pentamer centres: the 30 shortest
    # vertex pairs are exactly the icosahedron's edges.
    d = verts @ verts.T
    pairs = sorted(((i, j) for i in range(12) for j in range(i + 1, 12)),
                   key=lambda p: -d[p])[:30]

    qi = lambda A: [int(round(x)) for x in np.asarray(A).ravel() * Q]
    out = {
        'source': '6NJ8 (Quasibacillus thermotolerans encapsulin, T=4)',
        'note': ('Chain templates in deposited Angstrom coords; apply op M,w then '
                 'divide by radius for unit-sphere. Ints are x1e3 except chains, '
                 'which are x1e1 Angstrom.'),
        'radiusAngstrom': round(radius, 1),
        'q': Q,
        'chainQ': 10,
        'chains': [{'trace': [int(round(x)) for x in c['trace'].ravel() * 10],
                    'shape': [int(round(x)) for x in c['shape'].ravel() * 10],
                    'traceN': len(c['trace']), 'shapeN': len(c['shape'])}
                   for c in chains],
        # w folds the centre subtraction into the operator: p' = M.p + w, /radius.
        'ops': [{'m': qi(M), 'w': qi((v - centre))} for M, v in zip(mats, vecs)],
        'subunits': [[s['op'], s['ch'], s['cap'], s['k']] for s in subunits],
        'caps': [qi(c) for c in caps],
        'capKind': kind.tolist(),
        'icosaEdges': [[int(i), int(j)] for i, j in pairs],
        'peptide': [[int(round(x)) for x in ((xyz[ca & (asym == c)] - centre)).ravel() * 10]
                    for c in pep_chains],
    }
    dst = os.path.join(ROOT, 'theme', 'data', 'capsid.json')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    json.dump(out, open(dst, 'w'), separators=(',', ':'))
    print(f'wrote {dst}  {os.path.getsize(dst)/1024:.1f} KB')


if __name__ == '__main__':
    main()
