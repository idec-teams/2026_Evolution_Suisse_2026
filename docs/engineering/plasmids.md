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

<figure class="scrollyfig wide" data-figure="cell-scene" data-act-index="1" markdown>

**Fig 1.** The deaminase fusion tracking along the T7-flanked encapsulin
cassette, and stopping at the terminator.

</figure>

Built on the <span class="chip">pDB004</span> / <span class="chip">pDB006</span>
backbones. The shell variants `p_m005` (no tag), `p_m006` (targeting peptide)
and `p_m007` (targeting peptide and His-tag) are cloned and sequence-verified,
as are the stop-codon reporters used to validate MutaT7
([Table S1](../lab/supplementary.md#table-s1)). Source plasmids for the MutaT7
machinery came from Addgene as bacterial stabs.

## The selection plasmid

Carries **dCas9**, the **sgRNA cassette** and the **kanamycin-resistance gene**
containing the targeted site, with a tetracycline-resistance cassette (TcR) for
assembly. Built on a <span class="chip">pSC101</span> backbone by Golden Gate
assembly from five parts, with dCas9 amplified out of an Addgene source plasmid.
dCas9 and the sgRNA are expressed from promoters controlled by the
VanR<sup>AM</sup> and PhlF<sup>AM</sup> regulators, so repressor level is a
second tunable axis.

The guide is supplied as a truncation series so the selection set-point can be
chosen empirically:

| Construct | Complementarity | Purpose |
| --- | --- | --- |
| `p_s002_NT_TcR` | none | Non-targeting control — defines unrepressed output |
| `p_s002_10nt_TcR` | 10 nt | Weakest repression |
| `p_s002_11nt_TcR` | 11 nt | |
| `p_s002_14nt_TcR` | 14 nt | |
| `p_s002_17nt_TcR` | 17 nt | |
| `p_s002_20nt_TcR` | 20 nt | Full complementarity, strongest repression |

All six are in assembly. Four of the five Golden Gate junctions are formed in two
independent reactions and the fifth, joining the TcR cassette to the backbone,
is the open step ([Table S2](../lab/supplementary.md#table-s2)): the backbone
ligated to `s001` through an overhang pair that differs at one position
(GATA/GAAA). Leaky expression of dCas9 and the guide, unrepressed without the
regulators, is the more likely reason no transformants were recovered, and the
tri-plasmid layout in the [outlook](../project/results.md#outlook) addresses it.
See [Mechanism](../project/mechanism.md) for why complementarity, rather than an
inducer, is the knob.

<figure class="report narrow" markdown>

[![Plasmid maps](../img/report/s3-plasmid-maps.webp)](../img/report/s3-plasmid-maps.webp)

**Fig 2.** Maps of the control shell plasmid `p_f008` (**a**), the engineered
shell plasmid `p_f011` (**b**), the mutation plasmid `p_m005` (**c**) and the
selection plasmid `s_002_TcR_creT_v2` (**d**).

</figure>

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
`pSC101-T7-T3RNAP` and the pDB series (MutaT7 machinery). Synthetic fragments
were ordered from Twist Bioscience. Expression constructs
are built on `pET-Duet-1`. Full maps and sequences are maintained in Benchling;
see [Attributions](../team/attributions.md) for what came from where.
