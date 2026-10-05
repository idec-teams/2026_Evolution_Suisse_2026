---
title: Biosafety
summary: Organisms, risk assessment and containment.
---

# Biosafety

## Organisms and risk group

All work was carried out in laboratory strains of *Escherichia coli*:

| Strain | Type | Used for |
| --- | --- | --- |
| DH10β | K-12 derivative | Cloning and plasmid propagation |
| BL21 (DE3) | B strain | Recombinant protein expression |
| MutaT7 host strain | K-12 derivative | Hypermutation and the planned evolution campaign |

These are non-pathogenic laboratory strains that cannot colonise the human gut and
are handled as Risk Group 1 organisms. No pathogen, virulence factor or toxin
gene is present in the project, and none of the constructs is designed to survive
outside the laboratory.

## Specific aspects

### dCas9 is catalytically dead

The Cas9 used throughout is nuclease-deficient. It binds DNA and blocks
transcription but does not cut. Restoring nuclease activity would require
reversion of specific active-site substitutions and gives no advantage under the
selection.

### Hypermutation is restricted to one cassette

MutaT7 increases the mutation rate of a defined cassette by fusing a deaminase to
T7 RNA polymerase. Mutagenesis proceeds along the sequence downstream of a T7
promoter and stops at the terminator. The host genome is replicated by its
high-fidelity machinery and is not affected. The only sequence under mutation is
the gene of one structural protein from a soil bacterium. No general mutator
strain is produced.

### Antibiotic resistance as readout

The selection represses a kanamycin-resistance gene and rescues its expression.

- **No new resistance is created.** The kanamycin-resistance gene is a standard
  laboratory marker present in many cloning vectors. The selection modulates its
  expression and does not evolve the resistance protein or its spectrum. In
  contrast, the T7-ORACLE work cited for context evolved a β-lactamase towards
  clinically relevant substrates; the mutagenised locus here is a structural
  shell protein without resistance function.
- **Selection acts on the shell.** The marker is on the non-mutagenised plasmid.
  Mutations in the resistance gene would corrupt the selection and would be the
  only route to a new resistance phenotype.
- **Antibiotics** (ampicillin, kanamycin, chloramphenicol) are standard laboratory
  selection agents used at ordinary working concentrations and disposed of as
  contaminated waste.

!!! caution "Residual risk"

    Continuous culture under increasing kanamycin concentrations enriches for
    kanamycin survival by any mechanism, including generic tolerance such as
    efflux upregulation arising in the host genome outside the hypermutated
    cassette. This limits the experimental design as well as being a safety
    consideration. It is monitored by re-sequencing at each passage and by the
    non-targeting control, which shows cells that survive at doses that rescue
    cannot explain. Cultures with unexplained resistance are discarded.

## Containment

Standard microbiological practice for Risk Group 1 work applies: work is confined
to the laboratory, cultures are autoclaved before disposal, contaminated
plasticware and plates are handled as biological waste, benches are disinfected
and no organisms leave the facility. Strains are archived as glycerol stocks at
−80 °C.

PMSF, used as a protease inhibitor during lysis, is acutely toxic and is handled
with gloves.

## Risk assessment

Host institution, biosafety level, regulatory framework and reference numbers,
responsible biosafety officer, safety training and waste-handling procedures: to
be added.
