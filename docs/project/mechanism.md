---
title: Mechanism
template: mechanism.html
summary: How survival is coupled to encapsulation.
---

# Mechanism

In the proposed selection, cell growth depends on how much active repressor
is removed by encapsulin capture. The continuous evolution campaign has not yet
been run. Capturing either dCas9 or its sgRNA can restore resistance; this
selection does not by itself demonstrate co-encapsulation.

<!-- selection-story -->

## The circuit

A catalytically dead Cas9 (<abbr title="nuclease-deficient Cas9">dCas9</abbr>) is
directed by an sgRNA to the **kanamycin-resistance gene** on the selection
plasmid. It blocks transcription without cleaving DNA, so the cell cannot produce
enough resistance protein for the kanamycin in the medium.

## Position of the guide

CRISPRi knockdowns usually target promoters, which gives stronger repression.
Here, graded repression is required, and the two positions differ:[^vig]

| | Target in the promoter | Target inside the ORF |
| --- | --- | --- |
| Mechanism | RNA polymerase cannot bind an occupied promoter | RNA polymerase collides with the R-loop and can displace dCas9 |
| Escape route | diffusion only | processive read-through |
| Repression | near-absolute | partial |
| Depends on [dCas9]? | yes | **no**, once the target is saturated |
| Tunable by guide length? | weakly | **yes, continuously** |

Inside a gene body, the complementarity between guide and target sets the
probability that RNA polymerase displaces dCas9 during a transcription attempt,
while spontaneous unbinding is negligible. Expression is

\[
c = c_0\left[1 - P(\text{stop})\,P(\text{bound})\right]
\]

and once dCas9 saturates the site, $P(\text{bound}) \to 1$ and the residual
output equals the **passage probability**

\[
r = 1 - P(\text{stop})
\]

which depends only on the guide–target complementarity. Reported values range
from $r = 0.026 \pm 0.003$ at full complementarity to $0.056 \pm 0.001$ with six
mismatches.

[^vig]: Vigouroux, Oldewurtel, Cui, Bikard & van Teeffelen, *Molecular Systems
    Biology* **14**, e7899 (2018),
    [doi:10.15252/msb.20177899](https://doi.org/10.15252/msb.20177899). The
    displacement model, the mismatch titration and the noise measurements are
    from this work.

### Graded readout

Absolute repression gives a binary live/die outcome without a gradient for
selection. With partial repression, small improvements in sequestration give
small improvements in growth rate, and continuous culture accumulates these over
many generations.

### Noise

Repression at saturation is independent of dCas9 concentration, so cell-to-cell
variation in dCas9 level does not propagate to the output. The measured noise
plateau of about 0.3, similar to constitutive genes in wild-type *E. coli*, is
constant across the knockdown range. In an inducer-titrated circuit the noise
would be highest in the intermediate range in which this selection operates.

## Regulation

dCas9 and the sgRNA are under two orthogonal small-molecule-inducible regulators,
VanR<sup>AM</sup> and PhlF<sup>AM</sup>, which had the largest dynamic range and
the best orthogonality of the twelve tested.[^meyer] Guide complementarity and
inducer concentration are independent settings: the first sets the passage
probability, the second the amount of repressor. Both can be changed during
culture.

## Alternative readout: creT

The same principle can be applied to a toxin. In the archaeal creTA system, the
creA RNA represses creT, a small RNA toxin that sequesters rare codons. Placing
the protospacer of the sgRNA in the 5′ UTR of the repressor that controls creT
gives a positive selection in which encapsulation of dCas9 or the sgRNA relieves
toxin repression and permits growth ([Fig S1](../lab/data.md#fig-s1)).
Chen *et al.* used a creT-based selection to evolve Cas12a.[^chen] It is kept as
an alternative to the *kanR* circuit.

[^meyer]: Meyer *et al.*, *Nat. Chem. Biol.* **15**, 196 (2019).
[^chen]: Chen *et al.*, *Adv. Sci.* **12**, e17105 (2025).

## Sequestration restores expression

The 240 encapsulin subunits assemble into a T=4 icosahedral compartment of 42 nm,
about twice the span of the complex. Either component can be captured: dCas9
through a cargo-loading peptide, or the sgRNA through a boxB hairpin (see
[Design](design.md) for the OR gate).

<figure class="report wide" markdown>

[![KanR selection strategy](../img/report/fig2-kanr.webp)](../img/report/fig2-kanr.webp)

**Fig 4.** Weak encapsulation leaves free dCas9·sgRNA to repress KanR (**a**);
encapsulation removes it and KanR is expressed (**b**). Full caption under
[Results](results.md#32-an-encapsulation-coupled-selection).

</figure>

## The two stringency knobs

Selection stringency is set by the guide length and the kanamycin concentration.

**Guide length sets the baseline.** A truncation series (non-targeting, 10, 11,
14, 17 and 20 nt of complementarity) covers a range of passage probabilities. The
working guide is the one whose unrescued residual resistance lies just below the
survival threshold, so that a small improvement in capture determines growth.

**Kanamycin concentration is increased stepwise.** Raising it between passages
raises the resistance a cell must reach, and therefore the fraction of repressor
it must sequester. Finer adjustment is possible by replacing the guide with a
longer one, alone or together with a higher dose.

## Constructs

The circuit is split across two compatible plasmids: the <span class="chip">mutation
plasmid</span>, carrying the MutaT7 machinery and the mutable encapsulin cassette,
and the <span class="chip">selection plasmid</span>, carrying dCas9, the sgRNA and
the resistance gene. Maps are on the [Constructs](../lab/constructs.md) page.

=== "Mutation plasmid"

    Carries the MutaT7 T7 RNA polymerase–deaminase fusion and the QtEncapsulin
    open reading frame flanked by a T7 promoter and a T7 terminator. This
    cassette is the only hypermutated sequence in the cell.

=== "Selection plasmid"

    Carries dCas9, the sgRNA cassette and the kanamycin-resistance gene with its
    target site, on a pSC101 backbone outside the T7 transcription unit.

??? caution "Escape routes"

    Any mutation that reduces dCas9 or sgRNA expression restores resistance
    without improving encapsulation and is enriched equally. Both are therefore
    held on the non-mutable plasmid, outside the T7 transcription unit.[^escape]

    Loss of shell expression is the corresponding failure on the mutation
    plasmid. A population whose resistance has recovered while its encapsulin
    cassette carries a frameshift has escaped selection and has not evolved.

[^escape]: This placement protects against hypermutation but not against errors
    of the host polymerase. The selection plasmid is therefore re-sequenced
    periodically during passaging.
