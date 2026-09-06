"""Shared geometry helpers for turning a deposited structure into drawable parts.

A "part" is one chain, or one domain of a chain, reduced to two things:

  segments  a decimated, smoothed backbone path, BROKEN wherever the model is
            discontinuous. Disordered loops are missing from crystal structures;
            joining across them draws a straight bar through empty space.
  shape     farthest-point-sampled atoms whose projected convex hull is the
            silhouette. FPS keeps the extremities, which is what a silhouette
            needs; uniform sampling smooths the part into a blob.

Everything stays in Angstrom, centred on whatever the caller passes as the
origin, so parts from different PDB entries share one scale and can be drawn in
the same picture at their real relative sizes.
"""
import numpy as np

CA_BREAK, P_BREAK = 4.6, 8.5   # max plausible step between consecutive Ca / P


def farthest_point_sample(pts, k):
    if len(pts) == 0:
        return pts
    idx = [int(np.argmax(np.linalg.norm(pts - pts.mean(0), axis=1)))]
    d = np.linalg.norm(pts - pts[idx[0]], axis=1)
    while len(idx) < min(k, len(pts)):
        j = int(np.argmax(d))
        idx.append(j)
        d = np.minimum(d, np.linalg.norm(pts - pts[j], axis=1))
    return pts[idx]


def chaikin(p, rounds=2):
    for _ in range(rounds):
        if len(p) < 3:
            return p
        out = [p[0]]
        for a, b in zip(p[:-1], p[1:]):
            out.append(a * .75 + b * .25)
            out.append(a * .25 + b * .75)
        out.append(p[-1])
        p = np.array(out)
    return p


def segments(pts, seq, step, brk):
    """Decimate to every `step`th atom, then split at chain discontinuities."""
    if len(pts) < 3:
        return []
    keep = list(range(0, len(pts), step))
    if keep[-1] != len(pts) - 1:
        keep.append(len(pts) - 1)
    segs, cur = [], [keep[0]]
    for a, b in zip(keep[:-1], keep[1:]):
        broken = (seq[b] - seq[a] != b - a) or \
                 np.linalg.norm(pts[b] - pts[a]) > brk * (b - a)
        if broken:
            segs.append(cur); cur = [b]
        else:
            cur.append(b)
    segs.append(cur)
    return [chaikin(pts[s]) for s in segs if len(s) >= 3]


def chain_atoms(loop, chain, name):
    """Ordered (coords, residue numbers) for one atom name in one chain."""
    xyz = np.array([loop['Cartn_x'], loop['Cartn_y'], loop['Cartn_z']], float).T
    asym = np.array(loop['label_asym_id'])
    atom = np.array(loop['label_atom_id'])
    seq = np.array([int(v) if v.lstrip('-').isdigit() else -1
                    for v in loop['label_seq_id']])
    m = (asym == chain) & (atom == name) & (seq > 0)
    order = np.argsort(seq[m])
    return xyz[m][order], seq[m][order]


def pack(part, q=10):
    """Part dict -> the wire format the JS side unpacks."""
    qi = lambda A: [int(round(v)) for v in np.asarray(A).ravel() * q]
    return {'segments': [{'n': len(s), 'p': qi(s)} for s in part['segments']],
            'shape': qi(part['shape']), 'shapeN': len(part['shape'])}
