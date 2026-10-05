---
title: Notebook
summary: Condensed lab record from May to September 2026.
---

# Notebook

Condensed from the lab journal kept from 13 May 2026. From late July, shell
expression and purification and construction of the selection circuit were
carried out in parallel.

## May

Competent cells (DH10β and BL21 (DE3)) and buffer stocks were prepared and the
expression backbone was transformed. An early plating was done on kanamycin
although the plasmid carried ampicillin resistance, and no colonies grew.
Gibson assemblies of the first shell constructs were performed, and colonies were
picked and sent for sequencing.

## June

First large cultures, induced with 1 mM IPTG at 18 °C overnight.

The available Cytiva Ni-NTA protocol was written for pre-packed HiTrap columns,
so a protocol for columns packed in-house was assembled from it, a published
methods section and local practice. First SDS-PAGE gels showed protein of
approximately the expected mass.

## July

Size exclusion of the first purified material gave a shallow peak around 8 mL
and substantial material at 16, 18 and 20 mL. An assembled cage is expected to
elute near 8 mL. DLS of the pooled fractions did not show particles of the
expected size.

Fractions had been pooled from 16 mL onward, on the assumption that the early
peak was negligible. SEC and DLS both indicated a problem with cage assembly.
Hypotheses were listed and tested one at a time.

Changes: induction was reduced to 0.1 mM IPTG; a 100 kDa Amicon filter was
introduced to remove monomer and free reporter; aliquots were taken at every
purification step for gel analysis; clear-native PAGE was added to detect the
assembled species directly; anti-His immunoblotting was added to test whether the
tag was accessible.

Addgene bacterial stabs of the dCas9 and MutaT7 source plasmids arrived at the
end of the month and were streaked out.

## August

**Purification.** PEG precipitation and heat precipitation were run in parallel
on split aliquots. A280 measurements and gels at each step located most of the
protein in the pellet after lysis. SEC of heat-precipitated material showed no
peak at 8–10 mL. DLS of pooled fractions indicated a polydisperse, dilute sample;
some individual measurements suggested particles of the expected size, but the
pooled measurements did not.

**Circuit construction.** dCas9 was amplified from the Addgene plasmid. pSC101
was linearised by restriction digest and by PCR. Assembly of the selection
constructs (the guide truncation series and the non-targeting control) started
with Gibson assembly and continued with Golden Gate assembly using synthetic
fragments.

- Early Gibson reactions gave no colonies, while a re-transformation control grew,
  which located the problem in the assembly.
- The first `s002_20nt` clones sequenced as backbone plus an unrelated gBlock.
- `m004` and `m005` first sequenced as empty backbone and were later recovered
  and verified.
- MutaT7 competent cells transformed poorly, and the aliquot size was increased.

By the end of the month the shell expression constructs `f008`–`f011` were
sequence-confirmed. The `s002` guide series remained in assembly
([Table S2](supplementary.md#table-s2)).

## September

Remaining fragments were amplified by PCR and gel-extracted. Repeated gel
smearing was traced to reaction volume and run time. Kanamycin plates were
prepared at 50 and 200 µg/mL, and with nitrotetrazolium blue for a colorimetric
viability readout, for the selection screen.

The `s002` sequences are confirmed. Assembly of the mutation plasmid series
continues.

Nine constructs have been verified and a working expression protocol was
established. Cage assembly has not been confirmed and the selection has not been
run ([Results](../project/results.md)).

The stop-codon reversion assay confirmed MutaT7 activity, and the purification
data localised assembled QtEnc-His to the insoluble fraction. Both are described
in [Results](../project/results.md); raw traces and gels are in the
[supplementary figures](supplementary.md).
