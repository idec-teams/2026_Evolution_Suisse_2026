---
title: Mechanism
summary: How survival is coupled to encapsulation, step by step.
---

# Mechanism

The selection makes one thing true: **a cell survives in proportion to how well
it packages a repressor into its own encapsulin shells.** Everything else is
plumbing in service of that statement.

## The circuit

A catalytically dead Cas9 (<abbr title="nuclease-deficient Cas9">dCas9</abbr>) is
directed by an sgRNA into the **kanamycin-resistance gene** on the selection
plasmid. It does not cleave; it obstructs. The cell is left unable to make enough
resistance protein for the kanamycin in the medium.

<figure class="scrollyfig wide" data-figure="act2-silencing" markdown>

**Fig 1.** dCas9·sgRNA complexes diffusing, then clamping onto the resistance
gene. Output falls below the survival threshold (tick mark).

</figure>

## Why the guide targets the gene body, not the promoter

This is the single most consequential decision in the circuit, and it is not the
obvious one — CRISPRi knockdowns conventionally target promoters, because that
represses harder.

Repressing harder is exactly what we do not want. The two placements fail
differently:[^vig]

| | Target in the promoter | Target inside the ORF |
| --- | --- | --- |
| What blocks what | RNA polymerase cannot bind an occupied promoter | RNA polymerase collides with the R-loop and eventually displaces dCas9 |
| Escape route | diffusion only | processive read-through |
| Repression | near-absolute | partial, "throttled" |
| Depends on [dCas9]? | yes | **no**, once the target is saturated |
| Tunable by guide length? | weakly | **yes, continuously** |

Inside a gene body, complementarity between guide and target sets the probability
that RNA polymerase kicks dCas9 off during a transcription attempt, while
spontaneous unbinding is negligible. Expression is then

\[
c = c_0\left[1 - P(\text{stop})\,P(\text{bound})\right]
\]

and once dCas9 saturates the site, $P(\text{bound}) \to 1$ and residual output
collapses to the **passage probability**

\[
r = 1 - P(\text{stop})
\]

which depends on guide–target complementarity and on nothing else. Reported
values run from $r = 0.026 \pm 0.003$ at full complementarity to
$0.056 \pm 0.001$ with six mismatches.

[^vig]: Vigouroux, Oldewurtel, Cui, Bikard & van Teeffelen, *Molecular Systems
    Biology* **14**, e7899 (2018),
    [doi:10.15252/msb.20177899](https://doi.org/10.15252/msb.20177899). The
    kick-out model, the mismatch titration and the noise measurements below are
    all theirs.

### Why a graded readout matters

If repression were absolute, every cell would either live or die and there would
be no gradient for selection to climb. With kinetic repression, marginal
improvements in sequestration produce marginal improvements in growth rate, and
continuous culture integrates those margins over many generations.

### A second, quieter benefit

Because repression at saturation does not depend on dCas9 concentration,
cell-to-cell fluctuations in dCas9 level stop propagating to the output. The
measured noise plateau — about 0.3, matching ordinary constitutive genes in
wild-type *E. coli* — stays flat across the whole knockdown range. An
inducer-titrated circuit would instead be noisiest precisely in the intermediate
regime where our selection operates.

The selection therefore reads encapsulation efficiency rather than expression
noise. That is worth more than it sounds: without it, the fittest thing to evolve
might simply be a quieter promoter.

## Sequestration restores expression

<figure class="scrollyfig wide" data-figure="act3-rescue" markdown>

**Fig 2.** Shell assembly sweeping the repressor complexes out of the cytoplasm.
The gene clears, output recovers past the threshold, and the cell survives.

</figure>

240 encapsulin subunits assemble into a T=4 icosahedral compartment. The complex
can be caught by either half — a cargo-loading peptide on dCas9, or a boxB
hairpin on the sgRNA — and capturing either one is enough. See
[Design](design.md) for why the OR gate was chosen over demanding both.

## The two stringency knobs

The circuit has one set-point and one ramp.

**Guide length sets the set-point.** A truncation series — non-targeting, 10, 11,
14, 17 and 20 nt of complementarity — spans a range of passage probabilities. The
working guide is the one whose *unrescued* residual resistance sits just below the
survival threshold, so that a modest improvement in capture is the difference
between growing and not.

**Kanamycin concentration is the ramp.** Raising it between passages raises the
resistance output a cell must reach, and therefore the fraction of repressor it
must sequester. Where a finer adjustment is wanted, the guide is swapped for a
longer one instead of, or alongside, raising the dose.

## Constructs involved

The circuit is split across two compatible plasmids — <span class="chip">mutation
plasmid</span> carrying the MutaT7 machinery and the mutable encapsulin cassette,
and <span class="chip">selection plasmid</span> carrying dCas9, the sgRNA and the
resistance gene. See [Plasmids](../engineering/plasmids.md) for maps.

=== "Mutation plasmid"

    Carries the MutaT7 T7 RNA polymerase–deaminase fusion and the QtEncapsulin
    open reading frame flanked by a T7 promoter and a T7 terminator. That cassette
    is the only hypermutated sequence in the cell.

=== "Selection plasmid"

    Carries dCas9, the sgRNA cassette and the kanamycin-resistance gene with its
    targeted site. Built on a pSC101 backbone, outside the T7 transcription unit.

??? caution "Escape routes to watch"

    Any mutation that reduces dCas9 or sgRNA expression restores resistance
    *without* improving encapsulation, and will be enriched just as strongly.
    Both are therefore held on the non-mutable plasmid, outside the T7
    transcription unit.[^escape]

    Loss of the shell's own expression is the mirror-image failure and is caught
    by the same monitoring: a population whose resistance has recovered while its
    encapsulin cassette has acquired a frameshift has escaped, not evolved.

[^escape]: Placing them outside the MutaT7 target region does not make them
    immune to host-polymerase errors, only to hypermutation. Periodic
    re-sequencing of the selection plasmid is part of the passaging protocol.
