---
title: Plasmids
summary: Every construct in the system, with maps and sequences.
---

# Plasmids

Two plasmids, co-resident in a MutaT7 host strain. The division between them is
a containment decision, not a convenience.

## The mutagenesis plasmid

Carries two things: the **MutaT7 fusion** — a T7 RNA polymerase joined to a
nucleotide deaminase — and the **QtEncapsulin open reading frame flanked by a T7
promoter and a T7 terminator**.

Because the fusion tracks processively along whatever sits behind a T7 promoter
and stops at the terminator, that cassette is the only hypermutated sequence in
the cell. The host genome, replicated by its own high-fidelity machinery, is
unaffected.

<figure class="scrollyfig wide" data-figure="act1-hypermutation" markdown>

**Fig 1.** The deaminase fusion tracking along the T7-flanked encapsulin
cassette, and stopping at the terminator.

</figure>

Built on the <span class="chip">pDB004</span> / <span class="chip">pDB006</span>
backbones by Golden Gate assembly. Source plasmids for the MutaT7 machinery came
from Addgene as bacterial stabs.

## The selection plasmid

Carries **dCas9**, the **sgRNA cassette** and the **kanamycin-resistance gene**
containing the targeted site. Built on a <span class="chip">pSC101</span>
backbone by Gibson assembly, with dCas9 amplified out of an Addgene source
plasmid.

The guide is supplied as a truncation series so the selection set-point can be
chosen empirically:

| Construct | Complementarity | Purpose |
| --- | --- | --- |
| `s002_NT` | none | Non-targeting control — defines unrepressed output |
| `s002_10nt` | 10 nt | Weakest repression |
| `s002_11nt` | 11 nt | |
| `s002_14nt` | 14 nt | |
| `s002_17nt` | 17 nt | |
| `s002_20nt` | 20 nt | Full complementarity, strongest repression |

All six are sequence-confirmed. See [Mechanism](../project/mechanism.md) for why
complementarity, rather than an inducer, is the knob.

## Compatibility and copy number

The two plasmids carry different origins and different resistance markers so they
can be maintained together under dual selection. The kanamycin marker on the
selection plasmid is not a maintenance marker — it *is* the selection, which
means the plasmid's own retention and the phenotype being selected are the same
signal. Maintenance of the mutagenesis plasmid is enforced separately.

!!! caution "The escape argument, in one line"

    dCas9 and the sgRNA sit on the **non-mutable** plasmid because any mutation
    that reduced their expression would restore resistance without improving
    encapsulation — and would be enriched just as fast as a genuine improvement.

    This does not make them immune to host-polymerase error, only to
    hypermutation. Both plasmids are re-sequenced periodically during passaging.

## Provenance

Source plasmids obtained from Addgene: `pdCas9-bacteria` (dCas9), and
`pSC101-T7-T3RNAP` and the pDB series (MutaT7 machinery). Expression constructs
are built on `pET-Duet-1`. Full maps and sequences are maintained in Benchling;
see [Attributions](../team/attributions.md) for what came from where.
