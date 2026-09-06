"""5F9R -> theme/data/complex.json — the real dCas9-sgRNA-DNA repressor complex.

Chain A is SpCas9, B the 116-nt single guide, C the target DNA strand and D the
non-target strand. We keep them as separate parts so a figure can draw, fade or
move any one of them independently — the acts need exactly that: the guide and
the protein travel together, the DNA stays with the resistance gene.

── Why Cas9 is split in two ─────────────────────────────────────────────────
Drawn as one outline, Cas9 is an amoeba. Drawn as its two lobes it is instantly
itself: the recognition lobe and the nuclease lobe clamped around a duplex.
Boundaries follow Nishimasu et al. (2014): REC is 94-718; everything else —
RuvC-I, the bridge helix, HNH, RuvC-III and the PAM-interacting domain — is NUC.

── Gaps are real ────────────────────────────────────────────────────────────
Disordered loops are absent from the model. Joining across them would draw a
straight bar through empty space, so traces are emitted as SEGMENTS and broken
wherever the chain skips a residue or jumps further than a peptide bond allows.

── The two grips ────────────────────────────────────────────────────────────
Neither grip is in the deposited structure: the cargo-loading peptide is a
fusion to Cas9's C-terminus and the boxB hairpin is appended to the guide's 3'
end, so 5F9R contains neither. What we CAN show truthfully is where each one
attaches. `clp_site` is the last 15 Ca of Cas9 and `boxb_site` the last 12
phosphates of the guide; the figures colour those and label them as attachment
sites, not as the peptide and the hairpin themselves.

Coordinates stay in Angstrom, centred on the complex, and are NOT normalised:
the capsid ships its own Angstrom radius, so both drawings share one scale and
the complex is the right size when it goes inside the shell.
"""
import json, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mmcif
from partkit import (CA_BREAK, P_BREAK, chain_atoms, farthest_point_sample,
                     pack, segments)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
Q = 10                      # x0.1 Angstrom resolution
REC = (94, 718)             # recognition lobe, Nishimasu 2014


def main():
    items, lo = mmcif.read(os.path.join(HERE, 'cache', '5F9R.cif'))
    a = lo['_atom_site']
    ca,  ca_seq  = chain_atoms(a, 'A', 'CA')   # Cas9
    rna, rna_seq = chain_atoms(a, 'B', 'P')    # sgRNA
    dnt, dnt_seq = chain_atoms(a, 'C', 'P')    # target strand
    dnn, dnn_seq = chain_atoms(a, 'D', 'P')    # non-target strand
    print(f'Cas9 {len(ca)} Ca | sgRNA {len(rna)} P | target DNA {len(dnt)} P | '
          f'non-target {len(dnn)} P')

    centre = np.concatenate([ca, rna, dnt, dnn]).mean(0)
    span = float(np.linalg.norm(np.concatenate([ca, rna, dnt, dnn]) - centre, axis=1).max())
    print(f'complex radius {span:.0f} A across its longest axis')

    rec_m = (ca_seq >= REC[0]) & (ca_seq <= REC[1])
    parts = {}

    def add(name, pts, seq, step, brk, shape_pts):
        p = pts - centre
        parts[name] = {
            'segments': segments(p, seq, step, brk),
            'shape': farthest_point_sample(p, shape_pts) if shape_pts
                     else np.zeros((0, 3)),
        }

    add('rec', ca[rec_m], ca_seq[rec_m], 5, CA_BREAK, 30)
    add('nuc', ca[~rec_m], ca_seq[~rec_m], 5, CA_BREAK, 30)
    add('sgrna', rna, rna_seq, 1, P_BREAK, 0)
    add('dna_target', dnt, dnt_seq, 1, P_BREAK, 0)
    add('dna_nontarget', dnn, dnn_seq, 1, P_BREAK, 0)

    # Attachment sites, as their own parts so a figure can colour them.
    add('clp_site',  ca[-15:],  ca_seq[-15:],  1, CA_BREAK, 0)
    add('boxb_site', rna[-12:], rna_seq[-12:], 1, P_BREAK, 0)

    # Attachment points the project actually uses: the cargo-loading peptide is
    # fused to the Cas9 C-terminus, and the boxB hairpin is appended to the
    # guide's 3' end. Shipping them means the figures can draw the two grips
    # where they really are instead of somewhere convenient.
    anchors = {
        'cas9_cterm': (ca[np.argmax(ca_seq)] - centre).tolist(),
        'cas9_nterm': (ca[np.argmin(ca_seq)] - centre).tolist(),
        'sgrna_3prime': (rna[np.argmax(rna_seq)] - centre).tolist(),
    }

    qi = lambda A: [int(round(v)) for v in np.asarray(A).ravel() * Q]
    out = {
        'source': '5F9R (S. pyogenes Cas9 + 116-nt sgRNA + target DNA)',
        'note': 'Angstrom x10, centred on the complex. Same scale as capsid.json.',
        'q': Q,
        'spanAngstrom': round(span, 1),
        'recResidues': list(REC),
        'parts': {k: pack(v, Q) for k, v in parts.items()},
        'anchors': {k: qi(v) for k, v in anchors.items()},
    }
    dst = os.path.join(ROOT, 'theme', 'data', 'complex.json')
    json.dump(out, open(dst, 'w'), separators=(',', ':'))
    print(f'wrote {dst}  {os.path.getsize(dst)/1024:.1f} KB')
    for k, v in parts.items():
        print(f'  {k:15s} {len(v["segments"])} segment(s), '
              f'{sum(len(s) for s in v["segments"])} pts')


if __name__ == '__main__':
    main()
