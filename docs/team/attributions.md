---
title: Attributions
summary: Who did what, and what we did not do ourselves.
---

# Attributions

## Work by the team

!!! note "To be completed"

    Per-person contribution statements. The lab journal records who ran which
    experiment day by day; this section should summarise that by contribution
    area rather than reproduce it.

## Reused material

Being explicit about what we did not build ourselves.

### Plasmids

| Source | Obtained as | Used for |
| --- | --- | --- |
| `pdCas9-bacteria` (Addgene) | Bacterial stab | Source of the dCas9 coding sequence, amplified out by PCR |
| `pSC101-T7-T3RNAP` (Addgene) | Bacterial stab | MutaT7 platform components |
| pDB series (Addgene) | Bacterial stab | Mutagenesis plasmid backbone |
| `pET-Duet-1` | Laboratory stock | Expression backbone for shell constructs |

### Published work this project is built on

The project is a recombination of four existing results, and it is worth being
plain that none of the underlying components are ours:

- **QtEncapsulin's structure and native cargo-loading chemistry** — Giessen
  *et al.*, *eLife* **8**, e46070 (2019).
- **Shell permeability and single-step cargo loading** — Kwon, Andreas, Jones &
  Giessen, bioRxiv (2026),
  [doi:10.64898/2026.04.06.716810](https://doi.org/10.64898/2026.04.06.716810).
- **Directed evolution of this shell, and the dominant-negative problem it
  raises** — Siddiquee *et al.*, bioRxiv (2026),
  [doi:10.64898/2026.01.12.698938](https://doi.org/10.64898/2026.01.12.698938).
- **The λN·boxB handle and evolution of an RNA-packaging capsid** — Tetter
  *et al.*, *Science* **372**, 1220–1224 (2021),
  [doi:10.1126/science.abg2822](https://doi.org/10.1126/science.abg2822).
- **Guide-truncation titration of dCas9 repression, and the kick-out model our
  selection depends on** — Vigouroux *et al.*, *Molecular Systems Biology* **14**,
  e7899 (2018),
  [doi:10.15252/msb.20177899](https://doi.org/10.15252/msb.20177899).
- **Continuous hypermutation for context and comparison** — Diercks *et al.*,
  *Science* **389**, 618–622 (2025),
  [doi:10.1126/science.adp9583](https://doi.org/10.1126/science.adp9583).

Our contribution is the combination: wiring encapsulation to survival through a
titratable CRISPRi circuit, and giving one shell two orthogonal handles on a
ribonucleoprotein.

### Protocols

Published protocols were used and modified where our equipment differed — most
substantially the Ni-NTA procedure, which was rebuilt as a hybrid of a
manufacturer protocol written for pre-packed columns, a published methods
section, and local practice for hand-packed columns. Modifications are documented
in [Protocols](../lab/protocols.md).

### Software and infrastructure

Plasmid design and sequence alignment in Benchling. This wiki is built with
MkDocs on a bespoke theme with no external runtime dependencies.

## Help from others

!!! note "To be completed"

    Acknowledgement of the host laboratory, the advisors who supplied training,
    bench space, equipment access and troubleshooting advice, and the sequencing
    facility. The journal records substantial day-to-day help that belongs here.
