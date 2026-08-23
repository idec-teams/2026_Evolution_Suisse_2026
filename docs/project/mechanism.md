---
title: Mechanism
summary: How survival is coupled to encapsulation, step by step.
---

# Mechanism

The selection makes one thing true: **a cell survives in proportion to how well
it packages a repressor into its own encapsulin shells.** Everything else is
plumbing in service of that statement.

## The circuit

Lorem ipsum dolor sit amet, consectetur adipiscing elit. A catalytically dead
Cas9 (<abbr title="nuclease-deficient Cas9">dCas9</abbr>) is directed by an
sgRNA to the promoter-proximal region of an antimicrobial-resistance gene. It
does not cleave; it obstructs.

<figure class="scrollyfig wide" data-figure="act2-silencing" markdown>

**Fig 1.** dCas9·sgRNA complexes diffusing, then clamping onto the operator of
the resistance locus. Output falls below the survival threshold (tick mark).

</figure>

Repression here is *kinetic*, not absolute. Elongating RNA polymerase stalls at
the R-loop but is not permanently blocked, so the locus is throttled rather than
switched off. That distinction is what makes the system evolvable: it produces a
graded readout rather than a binary one.

### Why a graded readout matters

If repression were absolute, every cell would either live or die and there would
be no gradient for selection to climb. With kinetic repression, marginal
improvements in sequestration produce marginal improvements in growth rate, and
continuous culture integrates those margins over many generations.

!!! note "Threshold, not switch"

    The selective agent sets the threshold. Raising its concentration between
    rounds raises the bar for how much repressor must be sequestered, which is
    the primary stringency knob available to us.

## Sequestration restores expression

Sixty encapsulin subunits assemble into a T=1 icosahedral compartment. Cargo
bearing a targeting peptide is captured during assembly.

<figure class="scrollyfig wide" data-figure="act3-rescue" markdown>

**Fig 2.** Shell assembly sweeping the repressor complexes out of the cytoplasm.
The operator clears, output recovers past the threshold, and the cell survives.

</figure>

Sequester the complex and the operator clears. Duis aute irure dolor in
reprehenderit in voluptate velit esse cillum dolore.

## A rough model of the coupling

Let $f$ be the fraction of repressor complexes encapsulated, $k$ the effective
repression strength of a free complex, and $R_0$ the unrepressed expression
level. Resistance output is then approximately

\[
R(f) = \frac{R_0}{1 + k\,(1 - f)}
\]

and the cell survives while $R(f) > R_\text{crit}$, where $R_\text{crit}$ is set
by the selective agent. Rearranging gives the minimum encapsulation efficiency
compatible with survival:

\[
f_\text{min} = 1 - \frac{1}{k}\left(\frac{R_0}{R_\text{crit}} - 1\right)
\]

Raising the agent concentration raises $R_\text{crit}$, which raises
$f_\text{min}$ — the stringency knob, in one line.

## Parameters

| Parameter | Symbol | Working value | Source |
| --- | --- | --- | --- |
| Unrepressed output | $R_0$ | 100 | normalised |
| Repression strength | $k$ | 12 | estimated |
| Survival threshold | $R_\text{crit}$ | 42 | titration |
| Shell stoichiometry | — | 60 | PDB 6NJ8 |
| Mutation rate (on-target) | $\mu$ | 10⁻⁵ /bp/gen | literature |

## Constructs involved

The circuit is split across two compatible plasmids — <span class="chip">pES-Mut</span>
carrying the MutaT7 machinery and the mutable encapsulin cassette, and
<span class="chip">pES-Sel</span> carrying dCas9, the sgRNA and the resistance
gene. See [Plasmids](../engineering/plasmids.md) for maps.

=== "pES-Mut"

    Sed ut perspiciatis unde omnis iste natus error sit voluptatem. Carries the
    T7 promoter, the encapsulin cassette under mutagenesis, and the MutaT7
    fusion under inducible control.

=== "pES-Sel"

    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit. Carries
    dCas9, the sgRNA cassette, and the resistance gene with its targeted
    operator.

??? caution "Escape routes to watch"

    Any mutation that reduces dCas9 or sgRNA expression restores resistance
    *without* improving encapsulation, and will be enriched just as strongly.
    Both are therefore held on the non-mutable plasmid, outside the T7
    transcription unit.[^escape]

[^escape]: Placing them outside the MutaT7 target region does not make them
    immune to host-polymerase errors, only to hypermutation. Periodic
    re-sequencing of `pES-Sel` is part of the passaging protocol.
