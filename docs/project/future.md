---
title: Future work
summary: Next experiments and planned continuous-evolution campaign.
---

# Future work

## First steps

Three steps precede the first evolution cycle. The reasoning is given under
[Results](results.md#outlook).

**Confirm cage assembly.** The His-tag is removed and the targeting peptide is
kept. DLS on wild-type cages provides the reference for 42 nm. Assembly is
confirmed by negative-stain TEM or cryo-EM, which does not depend on elution
volume or native-gel migration. Expressing monomers with and without the external
moiety separately and mixing them in defined ratios gives mosaic cages, a route
to tolerating external fusions.

**Complete the selection plasmids.** Leaky dCas9 and sgRNA expression is the
likely burden during assembly. Options are chemical repression of the promoters,
a non-targeting guide as a proof of concept, and a tri-plasmid system that
separates the selection, mutagenesis and repressor components so that the
regulators are present before the selection components. Removing the GATA/GAAA
overhang clash between junctions J4 and J5 is also required
([Table S2](../lab/supplementary.md#table-s2)).

**Reduce leaky MutaT7 activity.** Reversion in the stop-codon assay was similar
with and without induction. An inducible sgRNA directed at the T7 promoter region
would suppress mutagenesis outside the evolution windows.

The co-encapsulation assays then separate single-handle capture from true
co-encapsulation: dual-stained native PAGE, RNase challenge and SEC co-elution of
a fluorescent cargo ([protocols](../lab/protocols.md#co-encapsulation-assays)).

## Planned campaign

Cultures carry both plasmids in the MutaT7 host under dual selection. Induction
starts hypermutation of the T7-flanked cassette only. Glucose in the growth medium
before induction suppresses leaky expression. The MutaT7 strain transforms
poorly, so competent-cell aliquots are 200 µL instead of 100 µL. Selection
stringency follows the two settings described in
[Mechanism](mechanism.md#the-two-stringency-knobs): guide length for the baseline
and kanamycin, from 50 µg/mL upward, for the stepwise increase. Nitrotetrazolium
blue plates provide a colorimetric viability readout.

Culture is continuous in a turbidostat (Pioreactor), so selection acts on growth
rate in every generation. At each passage:

1. **Sample and archive** as a glycerol stock, so that any passage can be
   recovered.
2. **Sequence the mutagenised cassette** to follow which mutations are enriched
   and when.
3. **Re-sequence the selection plasmid** to detect escape: loss of function in
   dCas9, the sgRNA or their promoters restores resistance without improving
   encapsulation.
4. **Set the next stringency step** from the growth rate at the current dose.

An enriched allele is a candidate. It is confirmed after re-cloning into the
expression vector and independent characterisation: assembly by SEC, DLS and EM,
capture by the co-encapsulation assays, and specificity by the single-handle
[controls](../lab/constructs.md#controls).

## Broader cargo range

The λN·boxB handle is not specific to a guide RNA. Any transcript carrying a boxB
hairpin can be captured, so a shell evolved for guide capture could be tested for
mRNA packaging. The selection can be repeated with the hairpin moved from the
sgRNA scaffold to an unrelated transcript, to test whether the evolved shell still
captures it. Evolution under a single selection can find a solution specific to
the geometry of the dCas9 complex, so transfer to other transcripts is not
guaranteed.

## Additional selections

The OR gate makes the output ambiguous as to which handle is used. Two additions
address this.

**AND gate.** Once shells exist that capture either component, the handles can
be split across two selective agents so that both must be sequestered
simultaneously.

**Nuclease challenge.** Tetter and co-workers increased stringency by shortening
the nuclease and lengthening the exposure: benzonase, then RNase A, then RNase T1,
from one to four hours. This selects for protection of the cargo, which is a
stricter property than the binding measured by the current circuit.

## Escape

Enrichment of cells that restored resistance without improving encapsulation is
the main failure mode. Two measures are already included: dCas9 and the sgRNA are
kept off the mutagenised plasmid, and the selection plasmid is re-sequenced at
each passage. A counter-selection that periodically requires a functional
repressor would also detect populations that have lost it.

## Delivery

The aim is a shell that packages a ribonucleoprotein and delivers it to the
cytosol of a mammalian cell. For this scaffold, cargo release in the endosome
using a pH-sensitive intein and endosomal escape using a fusogenic peptide have
been demonstrated separately. This is compatible with the shell evolved here,
provided that the shell assembles and loads cargo.
