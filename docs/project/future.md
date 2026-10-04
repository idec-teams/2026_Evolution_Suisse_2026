---
title: Future work
summary: What we would do next with more time and more selective agents.
---

# Future work

## First campaign

Three steps lead into the first evolution cycle, in the order they can be tested.
The reasoning is under [Results](results.md#outlook).

**Confirm cage assembly.** Remove the His-tag and keep the targeting peptide.
Run DLS on wild-type cages as the reference for 42 nm, and confirm assembly by
negative-stain TEM or cryo-EM, which does not depend on elution volume or native
gel migration. Expressing monomers with and without the external moiety
separately and mixing them in defined ratios gives mosaic cages, a route to
tolerating external fusions.

**Complete the selection plasmids.** Leaky dCas9 and sgRNA expression is the
likely burden during assembly. Candidate fixes: chemical repression of the
promoters, a non-targeting guide as a proof of concept, and a tri-plasmid system
that separates the selection, mutagenesis and repressor components so that the
regulators are in place before the selection components. Removing the GATA/GAAA
overhang clash between junctions J4 and J5 would also help
([Table S2](../lab/supplementary.md#table-s2)).

**Quieten MutaT7.** Reversion in the stop-codon assay was similar with and
without induction. An inducible sgRNA directed at the T7 promoter region would
suppress mutagenesis outside the evolution windows.

Then the co-encapsulation assays can separate single-handle capture from true
co-encapsulation: dual-stained native PAGE, RNase challenge, and SEC co-elution
of a fluorescent cargo ([protocols](../lab/protocols.md#co-encapsulation-assays)).

## Planned campaign

Cultures carry both plasmids in the MutaT7 host under dual selection. Induction
starts hypermutation of the T7-flanked cassette and of nothing else. Glucose in
the growth medium before induction suppresses leaky expression, and the MutaT7
strain transforms poorly, so competent-cell aliquots are 200 µL rather than
100 µL. Selection stringency follows the two knobs in
[Mechanism](mechanism.md#the-two-stringency-knobs): guide length for the
set-point, kanamycin from 50 µg/mL upward as the ramp. Nitrotetrazolium blue
plates give a colorimetric viability readout alongside.

Culture is continuous, in a turbidostat (Pioreactor), so selection acts on growth
rate every generation. At each passage:

1. **Sample and archive** as a glycerol stock, so any passage can be returned to.
2. **Sequence the mutagenised cassette** to follow which mutations enrich and
   when.
3. **Re-sequence the selection plasmid** to catch escape: loss-of-function in
   dCas9, the sgRNA or their promoters restores resistance without improving
   encapsulation.
4. **Set the next stringency step** from the growth rate at the current dose.

An enriched allele is a candidate, not a result. It counts once it is re-cloned
into the expression vector and characterised independently: assembly by SEC, DLS
and EM, capture by the co-encapsulation assays, specificity by the single-handle
[controls](../lab/constructs.md#controls).

## Broadening the cargo range

The λN·boxB handle is not specific to a guide RNA. Any transcript carrying a boxB
hairpin becomes a substrate, so a shell evolved for guide capture should transfer
directly to mRNA packaging — which is the delivery application that motivated the
project. The obvious test is to re-run the selection with the hairpin moved from
the sgRNA scaffold onto an unrelated transcript and ask whether the evolved shell
still captures it.

Whether that generalises is an empirical question with a real chance of
answering "no": evolution under a single selection tends to find the cheapest
solution, and the cheapest solution here may be specific to the geometry of the
dCas9 complex.

## Orthogonal selections

The OR gate that makes the landscape traversable also makes the output ambiguous.
Two follow-ups tighten it.

**An AND gate, later.** Once shells exist that capture either half, the handles
can be split across two selective agents so that both must be sequestered
simultaneously. Starting there would have been hopeless; arriving there from a
partially evolved population is plausible.

**A nuclease challenge.** Tetter and co-workers escalated stringency by shrinking
the nuclease and lengthening the exposure — benzonase, then RNase A, then RNase
T1, from one hour to four. That selects for *protection*, not merely binding,
which is a different and more demanding property than anything our current
circuit measures.

## Dealing with escape

The failure mode to plan for is enrichment of cells that restored resistance
without improving encapsulation. Two measures are already designed in — holding
dCas9 and the sgRNA off the mutagenised plasmid, and re-sequencing the selection
plasmid each passage. A third would help: a counter-selection that periodically
requires the repressor to be *functional*, catching populations that have
quietly lost it.

## Toward delivery

The end state is a shell that packages a ribonucleoprotein and delivers it to the
cytosol of a mammalian cell. The delivery half of that problem has been solved
separately for this scaffold, using a pH-sensitive intein to detach cargo in the
endosome and a fusogenic peptide to escape it. Nothing in that architecture
conflicts with what we are evolving — but it assumes a shell that assembles
and loads, which the first campaign is designed to select for.
