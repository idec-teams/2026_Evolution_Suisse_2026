---
title: Evolution cycles
summary: How each round of continuous evolution is set up and run.
---

# Evolution cycles

!!! warning "Designed, not yet executed"

    No evolution cycle has been run. This page documents the protocol as designed,
    so that it can be criticised before it is expensive to change.

## MutaT7 induction

Both plasmids are co-transformed into the MutaT7 host strain and maintained under
dual selection. Inducing the T7 RNA polymerase–deaminase fusion starts
hypermutation of the T7-flanked encapsulin cassette, and of nothing else.

Two practical notes carried over from the build. The MutaT7 strain transforms
poorly compared with DH10β, so competent-cell aliquots are made at 200 µL rather
than 100 µL per transformation. And glucose is included in growth medium before
induction to suppress leaky expression.

## Selection stringency

One set-point, one ramp.

<figure class="scrollyfig wide" data-figure="act4-enrichment" markdown>

**Fig 1.** Round-over-round enrichment: the population distribution walking
toward higher encapsulation efficiency as the threshold rises.

</figure>

**Set-point — guide length.** The [truncation series](plasmids.md) spans a range
of passage probabilities. The working guide is chosen in a plate screen as the
one whose unrescued residual resistance sits just below the survival threshold,
so a modest gain in capture decides whether a cell grows.

**Ramp — kanamycin.** The dose is raised between passages, starting from
50 µg/mL, each step demanding a larger sequestered fraction. Where finer
adjustment is wanted the guide is exchanged for a longer one instead of, or
alongside, raising the dose.

Nitrotetrazolium blue plates are used as a colorimetric viability readout
alongside the kanamycin series.

## Passaging schedule

Continuous culture in a turbidostat (Pioreactor), so that selection acts on
growth rate every generation rather than in discrete plate-based rounds. At each
passage:

1. **Sample and archive.** Glycerol stock, so any passage can be returned to.
2. **Sequence the mutagenised cassette.** Follows which mutations are enriching,
   and at what point.
3. **Re-sequence the selection plasmid.** Catches escape — loss-of-function in
   dCas9, the sgRNA or their promoters — which would restore resistance without
   improving encapsulation.
4. **Decide the next stringency step** from the growth rate at the current dose.

## What counts as a result

An enriched allele is not a result until it is recloned into the expression
vector and characterised independently: assembly by SEC and DLS, capture by the
[co-encapsulation assays](../lab/protocols.md), and specificity by the
single-handle controls. The selection identifies candidates. It does not, on its
own, demonstrate that anything was encapsulated.
