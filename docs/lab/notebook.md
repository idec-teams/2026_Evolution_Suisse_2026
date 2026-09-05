---
title: Notebook
summary: The running record of what happened, in order.
---

# Notebook

Condensed from the lab journal kept from 13 May 2026 onward. Two threads run in
parallel from late July: shell expression and purification, and construction of
the selection circuit.

## May — getting started

Competent cells (DH10β and BL21 (DE3)) prepared, buffer stocks made up, first
transformations of the expression backbone.

An early plating went onto kanamycin when the plasmid carried ampicillin
resistance; nothing grew, for the correct reason. Gibson assemblies of the first
shell constructs followed, and colonies were picked and sent for sequencing.

## June — first expression and the first purification

First large cultures. Induction at 1 mM IPTG, 18 °C overnight.

The Ni-NTA protocol had to be written from scratch: the available Cytiva protocol
assumed pre-packed HiTrap columns rather than columns packed in-house, so a
hybrid was assembled from that, the published methods section and local
practice.

First SDS-PAGE gels showed protein of about the right mass.

## July — the assembly problem emerges

Size exclusion on the first purified material gave four peaks — a very shallow
one around 8 mL and substantial material at 16, 18 and 20 mL. The shallow peak is
where an assembled cage should elute. DLS on the pooled fractions found nothing
of the expected size.

!!! result "The moment it became a debugging project"

    Fractions had been pooled from 16 mL onward, on the assumption that the
    shallow early peak was negligible. Both SEC and DLS pointed the same way:
    there was a problem assembling the cages.

    The response was a written list of hypotheses and a decision to test them one
    at a time rather than change several things at once.

Changes made in response: induction dropped to 0.1 mM IPTG; a 100 kDa Amicon
filter introduced to remove monomer and free reporter; aliquots taken at every
purification step for gel analysis; clear-native PAGE added to look for the
assembled species directly; anti-His immunoblotting added to test whether the tag
was accessible at all.

Addgene bacterial stabs for the dCas9 and MutaT7 source plasmids arrived at the
end of the month and were streaked out.

## August — two threads

**Purification.** PEG precipitation and heat precipitation run side by side on
split aliquots. Step-by-step A280 and gels located most of the protein in the
pellet after lysis. SEC on heat-precipitated material still showed no 8–10 mL
peak. DLS of the pooled fractions read as polydisperse and dilute; some
individual measurements suggested particles near the right size, but pooling all
measurements did not support it.

**Circuit construction.** dCas9 amplified out of the Addgene plasmid. pSC101
linearised both by restriction digest and by PCR. Seven selection constructs
assembled by Gibson — the full guide truncation series plus the non-targeting
control.

Not everything worked the first time:

- Early Gibson reactions produced no colonies, while a re-transformation control
  grew — which located the fault in the assembly rather than the cells or the
  heat shock.
- The first `s002_20nt` clones sequenced back as backbone plus an unrelated
  gBlock.
- `m004` and `m005` sequenced back as empty backbone.
- MutaT7 competent cells were made and found to transform poorly; aliquot size
  was increased in response.

By the end of the month the shell expression constructs `f008`–`f011` and the
`s002` guide series were sequence-confirmed.

## September — where it stands

PCR and gel extraction of the remaining fragments, with repeated gel smearing
traced to the reaction volume and run time rather than the products themselves.
Kanamycin plates prepared at 50 and 200 µg/mL, and with nitrotetrazolium blue for
a colorimetric viability readout, in preparation for the selection screen.

The `s002` sequences are confirmed. Assembly of the mutation plasmid series
continues.

!!! note "Honest summary"

    Nine constructs verified, a working expression protocol, a complete guide
    truncation series — and no confirmed cage assembly. The selection has not been
    run. See [Results](../project/results.md).
