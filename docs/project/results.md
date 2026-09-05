---
title: Results
summary: What the selection produced across the campaign — including what did not work.
---

# Results

!!! warning "Read this first"

    The continuous evolution campaign has **not been run**. What follows is the
    state of the build: what is verified, what is still failing, and what is
    being done about it. We are reporting the negative results because they are
    the honest description of where a season's work actually got to, and because
    the troubleshooting is the part with transferable content.

## Where things stand

| Subsystem | Status |
| --- | --- |
| Shell expression (His-QtEnc) | **Working** — confirmed by SDS-PAGE and anti-His immunoblot |
| Shell assembly into 42 nm cages | **Not yet demonstrated** — see below |
| Selection plasmid, guide truncation series | **Built and sequence-verified** (non-targeting, 10, 11, 14, 17, 20 nt) |
| dCas9 cloned out of source plasmid | **Done** |
| Mutation plasmid series | **In assembly** |
| Selection plasmid screen | Not started |
| Continuous evolution | Not started |

## Expression works; assembly has not been shown

QtEncapsulin constructs express. A band of the expected monomer mass appears
after IPTG induction and is confirmed by anti-His immunoblotting.

Assembled shells are a different matter. Across repeated purifications, size
exclusion chromatography on Superose 6 gave only a shallow feature near the void
volume, with the bulk of the material eluting at 16–20 mL — consistent with
monomers and small oligomers, not with a 7.7 MDa cage. Dynamic light scattering
of the pooled fractions never yielded a population consistent with the expected
42 nm diameter; the samples read as polydisperse and dilute.

!!! result "The negative result, stated plainly"

    Between May and September we did not obtain evidence of assembled
    QtEncapsulin. Every SEC run and every DLS measurement is consistent with the
    protein being expressed and not assembling, or assembling and not surviving
    the purification.

## What we changed in response

Four hypotheses were separated and tested one at a time.

=== "Induction strength"

    Initial inductions used 1 mM IPTG. Published protocols for this shell use
    0.1 mM, and over-strong induction is a standard cause of inclusion-body
    formation. Induction was dropped to 0.1 mM, expression temperature to 18 °C,
    and 1 % glucose was added to the growth medium to suppress leaky expression
    before induction.

=== "Tag accessibility"

    The hexahistidine tag is joined to the shell protein through a GS linker. If
    the tag is occluded in the assembled cage, Ni-NTA would preferentially
    recover unassembled monomer and discard exactly the species we are looking
    for — which would explain a monomer-rich elution profile from a culture that
    is assembling normally. Constructs with a direct terminal His tag, which the
    supplementary material of published work reports as assembling successfully,
    were built to test this.

=== "Lysis and clarification"

    Sonication was producing foaming, and the clarification spin may have been
    pelleting intact cages along with debris. Spin speeds were varied and
    aliquots retained at every step so that the losses could be located on a gel
    rather than guessed at.

=== "Pre-enrichment route"

    Two routes were run on split aliquots of the same lysate: PEG-8000/NaCl
    precipitation, and heat precipitation exploiting the shell's thermostability.
    Aliquot-by-aliquot A280 and SDS-PAGE showed most material partitioning into
    the pellet after lysis, which is itself informative.

## Selection plasmid screen

The guide truncation series is built and sequence-confirmed. The screen that
identifies which guide places unrescued cells just below the kanamycin survival
threshold has not yet been run.

Kanamycin plates have been prepared at 50 and 200 µg/mL, and with nitrotetrazolium
blue as a colorimetric viability readout, in anticipation of it.

## Sequenced variants

None — the campaign has not run, so there are no evolved variants to report.

## What would change the picture

A single clean SEC trace with a peak at the void volume, corroborated by DLS and
negative-stain EM, unblocks everything downstream. The selection circuit does not
depend on the purification working — the shell only has to assemble *in vivo* for
the selection to function — but without an assembly assay we cannot tell an
evolved improvement from noise, and we cannot validate that the OR gate is
capturing what we think it is.
