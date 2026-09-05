---
title: Biosafety
summary: Containment, risk assessment, and the rules we worked under.
---

# Biosafety

## Organisms and risk group

All work was carried out in laboratory strains of *Escherichia coli*:

| Strain | Type | Used for |
| --- | --- | --- |
| DH10β | K-12 derivative | Cloning and plasmid propagation |
| BL21 (DE3) | B strain | Recombinant protein expression |
| MutaT7 host strain | K-12 derivative | Hypermutation and the planned evolution campaign |

These are standard, non-pathogenic, well-characterised laboratory strains,
attenuated by long domestication and unable to colonise the human gut. They are
handled as Risk Group 1 organisms.

No pathogen, no virulence factor and no toxin gene is present anywhere in the
project. Nothing constructed here is designed to survive outside a laboratory
incubator.

## The three things worth arguing about

A generic risk statement would miss what is actually distinctive about this
project. Three features deserve specific justification.

### 1. dCas9 is catalytically dead

The Cas9 used throughout is nuclease-deficient. It binds DNA and obstructs
transcription; it does not cut. The genome-editing hazard normally associated
with Cas9 is absent by construction, not by containment.

This is a design property, not a precaution that could lapse — a mutation
restoring nuclease activity would require reverting specific active-site
substitutions, and would confer no advantage under our selection.

### 2. Hypermutation is targeted, not global

MutaT7 raises the mutation rate of a defined cassette by fusing a deaminase to T7
RNA polymerase. Mutagenesis tracks along sequence behind a T7 promoter and stops
at the terminator. The host genome is replicated by its own high-fidelity
machinery and is not affected.

This matters for safety as well as for the experiment. We are not producing a
general mutator strain, which would accumulate uncontrolled changes including
potentially in stress-response and resistance pathways. The hypermutated sequence
is one structural protein gene from a soil bacterium, and it is the only sequence
under mutation in the cell.

### 3. Antibiotic resistance is the readout — and this needs stating carefully

The selection works by repressing a kanamycin-resistance gene and rescuing it.
This deserves an explicit argument rather than a reassurance.

- **No new resistance is created.** The kanamycin-resistance gene is a standard
  laboratory marker, already ubiquitous in cloning vectors worldwide. The
  selection modulates its *expression*; it does not evolve the resistance protein
  or broaden its spectrum. This is the opposite of the T7-ORACLE work we cite for
  context, which evolved a β-lactamase toward clinically relevant substrates —
  our mutagenised locus is a structural shell protein with no resistance function.
- **The evolutionary pressure is on the shell, not the marker.** The marker sits
  on the non-mutagenised plasmid, deliberately, for reasons that are
  simultaneously experimental and precautionary: mutations in the resistance gene
  would corrupt the selection *and* would be the only route by which this project
  could generate a novel resistance phenotype.
- **Antibiotics used are standard laboratory selection agents** — ampicillin,
  kanamycin, chloramphenicol — at ordinary working concentrations, disposed of as
  contaminated waste.

!!! caution "The honest residual risk"

    Continuous culture under a rising antibiotic dose is, by construction, an
    enrichment for kanamycin survival. The intended solution is better
    encapsulation, but the population is free to find any solution — including
    generic tolerance mechanisms such as efflux upregulation, arising in the host
    genome outside the hypermutated cassette.

    This is a real limitation of the experimental design as much as a safety
    consideration. It is monitored by re-sequencing at each passage and by the
    non-targeting control, which reveals cells surviving at doses no amount of
    rescue should permit. Cultures showing unexplained resistance are discarded
    rather than carried forward.

## Containment practice

Standard microbiological practice for Risk Group 1 work: work confined to the
laboratory, cultures autoclaved before disposal, contaminated plasticware and
plates treated as biological waste, benches disinfected, no organisms removed
from the facility. Strains are archived as glycerol stocks at −80 °C.

Chemical hazards were handled alongside the biological ones. PMSF, used as a
protease inhibitor during lysis, is acutely toxic and is handled with gloves,
with attention to its persistence in the solutions it is added to.

## Risk assessment

!!! note "To be completed by the team"

    The institution-specific content cannot be reconstructed from the project
    files and should not be approximated. This section needs:

    - the host institution and laboratory, and its biosafety level;
    - the national and institutional regulatory framework the work was notified
      under, with reference numbers;
    - the name of the responsible biosafety officer and supervising researcher;
    - dates of safety training completed by team members;
    - the local waste-handling and spill procedures as actually specified.

    The organism, construct and hazard analysis above is complete and does not
    depend on these.
