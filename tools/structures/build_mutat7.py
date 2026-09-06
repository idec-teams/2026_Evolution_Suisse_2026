"""1MSW -> theme/data/mutat7.json — T7 RNA polymerase, caught transcribing.

MutaT7 is a deaminase fused to T7 RNA polymerase, so the polymerase half is a
real, solved structure and there is no reason to draw a cartoon blob for it.
1MSW is better still: it is an ELONGATION complex, with template and non-template
DNA threaded through the enzyme and the nascent RNA already emerging. Drawn as
one picture that reads immediately as "transcribing", which is exactly the act.

The deaminase has no counterpart here — MutaT7 is a fusion, not a deposited
structure — so the figure that uses this file draws it as a lobe at the
polymerase's N-terminus rather than inventing coordinates for it.
"""
import json, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mmcif
from partkit import (CA_BREAK, P_BREAK, chain_atoms, farthest_point_sample,
                     pack, segments)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
Q = 10


def main():
    items, lo = mmcif.read(os.path.join(HERE, 'cache', '1MSW.cif'))
    a = lo['_atom_site']
    pol, pol_seq = chain_atoms(a, 'D', 'CA')      # T7 RNAP
    tem, tem_seq = chain_atoms(a, 'A', 'P')       # template DNA
    non, non_seq = chain_atoms(a, 'B', 'P')       # non-template DNA
    rna, rna_seq = chain_atoms(a, 'C', 'P')       # nascent transcript
    print(f'T7 RNAP {len(pol)} Ca | template {len(tem)} P | '
          f'non-template {len(non)} P | RNA {len(rna)} P')

    centre = np.concatenate([pol, tem, non, rna]).mean(0)
    span = float(np.linalg.norm(np.concatenate([pol, tem, non, rna]) - centre,
                                axis=1).max())
    print(f'complex radius {span:.0f} A')

    def part(pts, seq, step, brk, shape_pts):
        p = pts - centre
        return {'segments': segments(p, seq, step, brk),
                'shape': farthest_point_sample(p, shape_pts) if shape_pts
                         else np.zeros((0, 3))}

    parts = {
        'pol':          part(pol, pol_seq, 5, CA_BREAK, 30),
        'dna_template': part(tem, tem_seq, 1, P_BREAK, 0),
        'dna_nontemplate': part(non, non_seq, 1, P_BREAK, 0),
        'rna':          part(rna, rna_seq, 1, P_BREAK, 0),
    }

    out = {
        'source': '1MSW (T7 RNA polymerase elongation complex)',
        'note': 'Angstrom x10, centred. Same scale as capsid.json and complex.json.',
        'q': Q,
        'spanAngstrom': round(span, 1),
        'parts': {k: pack(v, Q) for k, v in parts.items()},
        'anchors': {'pol_nterm': [int(round(v)) for v in
                                  (pol[np.argmin(pol_seq)] - centre) * Q]},
    }
    dst = os.path.join(ROOT, 'theme', 'data', 'mutat7.json')
    json.dump(out, open(dst, 'w'), separators=(',', ':'))
    print(f'wrote {dst}  {os.path.getsize(dst)/1024:.1f} KB')


if __name__ == '__main__':
    main()
