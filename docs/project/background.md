---
title: Background
summary: Encapsulins, prior engineering work, and the gap this project addresses.
---

# Background

## Delivery of protein–RNA complexes

Biomacromolecules, such as nucleic acids and protein biologics, reach targets
that small molecules cannot: about 80 % of the human proteome is considered
undruggable by small molecules because it lacks a defined binding pocket.[^drug]
They can also be retargeted by changing the sequence. Their delivery is limited by
size, high charge density and rapid clearance. Lipid nanoparticles, synthetic
polymers and viral vectors are restricted by cargo capacity, cytotoxicity or
immunogenicity, and most are optimised for one cargo class. Cationic lipid
nanoparticles optimised for nucleic acids can hinder protein loading, whereas
protein-based vectors usually lack nucleic-acid binding.

Therapies that require a protein and a nucleic acid, such as CRISPR–Cas9, benefit
from a single vehicle, which avoids mismatched biodistribution and cellular
uptake. Protein nanocages (viral capsids, virus-like particles, ferritins,
encapsulins) are biocompatible and have programmable lumenal and outer surfaces.

[^drug]: Dang *et al.*, *Nat. Rev. Cancer* **17**, 502 (2017); Nagaraj *et al.*,
    *RSC Pharmaceutics* **2**, 850 (2025). The complete list is on the
    [references page](references.md).

## Encapsulins

Encapsulins are prokaryotic protein nanocompartments. Their shell proteins
self-assemble into icosahedral cages of roughly 20–45 nm with triangulation
numbers T=1 (60 subunits), T=3 (180 subunits) or T=4 (240 subunits).[^enc]
Each shell protein has an interior binding site for a short **cargo-loading
peptide (CLP)** on the native cargo, so cargo loading is genetically encoded.
Encapsulins have been used for antigen display, drug delivery, microscopy and
enzyme encapsulation.

[^enc]: Kwon, Andreas, Jones & Giessen, *A permeable protein nanocage enables
    facile cargo loading and cytosolic protein delivery*, bioRxiv (2026),
    [doi:10.64898/2026.04.06.716810](https://doi.org/10.64898/2026.04.06.716810).

### Permeability of QtEncapsulin

Loading of pre-assembled cages was generally thought to require disassembly.
Established approaches use shell disassembly under harsh conditions followed by
reassembly, co-expression strategies that require optimised expression ratios and
timing, or additional components that trigger assembly.

QtEncapsulin does not require these steps. Although its pores are only about
7.2 Å wide at the narrowest point, cargo of up to 482 kDa is internalised by
mixing it with intact shells. The proposed mechanism is local, reversible opening
of shell elements that remain attached to the cage, rather than a global
assembly–disassembly equilibrium.

## Prior engineering of QtEncapsulin and related cages

**Rational pore engineering.** The Giessen lab widened the pores of QtEncapsulin
by design, which improved substrate access for encapsulated enzymes. The shell
tolerates modification around its symmetry axes.

**Directed evolution of the shell.** Siddiquee and co-workers evolved QtEncapsulin
for increased porosity using a chloramphenicol life–death selection with a
dedicated genetic architecture. In multimeric proteins, the effect of a
deleterious mutation is amplified by the extensive interactions between adjacent
subunits, so a variant that functions in a mixed shell is lost as a dominant
negative when it is the only version present. They kept an invariant wild-type
copy on a second plasmid, so that hybrid assemblies could form and be selected.

**Evolution of an RNA-packaging capsid.** Tetter and co-workers evolved a
bacterial enzyme without nucleic-acid affinity into an artificial nucleocapsid
that packages and protects its own mRNA, using laboratory evolution under
escalating nuclease challenge. The fraction of particles carrying a full-length
genome rose from about 2 % to about 64 %.[^tetter]

[^tetter]: Tetter *et al.*, *Science* **372**, 1220–1224 (2021),
    [doi:10.1126/science.abg2822](https://doi.org/10.1126/science.abg2822).

## Open problems

**Cargo class.** Encapsulins load protein natively and do not load RNA. Lipid
nanoparticles show the reverse preference. Delivering a protein together with its
cognate RNA, as for ribonucleoprotein genome editors, currently requires
co-formulating two carriers with different biodistributions.

**Measurement.** Encapsulation is usually assayed on purified material, one
variant at a time. This cannot be applied to a library and does not link the
performance of a variant to the survival of its host.

**Throughput.** Classical directed evolution mutagenises *in vitro* and
transforms the library into cells, which limits mutagenesis depth and the number
of parallel campaigns. Continuous systems that hypermutate a defined locus
*in vivo* (PACE, OrthoRep, T7-ORACLE, MutaT7) remove this limit but require a
selection. MutaT7 fuses a T7 RNA polymerase to a cytidine deaminase, so mutations
are restricted to DNA between a T7 promoter and terminator.[^mut]

[^mut]: Moore, Papa & Shoulders, *J. Am. Chem. Soc.* **140**, 11560 (2018).

This project uses MutaT7 for mutagenesis, and a selection in which encapsulation
of dCas9 or its sgRNA is required for resistance to kanamycin.
