---
title: Background
summary: Encapsulins, what they already do, and the gap this project addresses.
---

# Background

## Why a delivery vehicle for protein–RNA complexes

Biomacromolecules — nucleic acids and protein biologics — reach targets that
small molecules cannot: about 80 % of the human proteome is considered
undruggable by small molecules for lack of a defined binding pocket.[^drug] They
are also easy to retarget, since the sequence is the design. Delivery is the
bottleneck: the molecules are large, highly charged and cleared quickly.
Lipid nanoparticles, synthetic polymers and viral vectors are limited by cargo
capacity, cytotoxicity or immunogenicity, and most are optimised for one cargo
class. Cationic lipid particles tuned for nucleic acids can hinder protein
loading, while protein-based vectors usually lack nucleic-acid binding.

Therapies that need a protein and a nucleic acid together — CRISPR–Cas9 above all
— gain from a single vehicle, which avoids mismatched biodistribution and uptake.
Protein nanocages (viral capsids, virus-like particles, ferritins, encapsulins)
offer biocompatibility and programmable lumenal and outer surfaces. The encapsulin
of *Quasibacillus thermotolerans* (QtEnc) is a T=4 shell of about 42 nm and 240
subunits with a large interior, and it loads cargo bearing a C-terminal
cargo-loading peptide natively. It has no nucleic-acid affinity, and a rational
graft is hard to get right: loading depends on shell dynamics, cargo geometry and
assembly fidelity in ways structure alone does not predict, and in a
homomultimeric cage each substitution is repeated 240-fold, so rational changes
often act as dominant negatives.

[^drug]: Dang *et al.*, *Nat. Rev. Cancer* **17**, 502 (2017); Nagaraj *et al.*,
    *RSC Pharmaceutics* **2**, 850 (2025). The complete list is on the
    [references page](references.md).

## Protein nanocompartments

Encapsulins are prokaryotic protein nanocompartments: shell proteins that
self-assemble into icosahedral cages roughly 20–45 nm across, with triangulation
numbers of T=1 (60 subunits), T=3 (180 subunits) or T=4 (240 subunits).[^enc]
They are the only known class of protein cage that arrives from nature already
solving the cargo problem — each shell protein carries an interior binding site
that recognises a short **cargo-loading peptide (CLP)** on its native cargo, so
loading is genetically encoded rather than chemically imposed.

That property has made them a popular engineering scaffold. Encapsulins have been
used for antigen display, drug delivery, microscopy and enzyme encapsulation,
largely because swapping the cargo is, in principle, a matter of appending five
residues to whatever protein you want inside.

[^enc]: Kwon, Andreas, Jones & Giessen, *A permeable protein nanocage enables
    facile cargo loading and cytosolic protein delivery*, bioRxiv (2026),
    [doi:10.64898/2026.04.06.716810](https://doi.org/10.64898/2026.04.06.716810).

### The permeability result that made this project plausible

Conventional wisdom held that loading a pre-assembled cage requires taking it
apart. Existing approaches relied on shell disassembly under harsh conditions
followed by reassembly, on co-expression strategies requiring careful
optimisation of expression ratios and timing, or on additional triggering
components to initiate assembly.

QtEncapsulin turns out not to need any of that. Despite pores measuring only
about 7.2 Å at their narrowest, cargo as large as 482 kDa is internalised simply
by mixing it with intact shells. The proposed mechanism is not a global
assembly–disassembly equilibrium but local, reversible opening of shell elements
that remain attached to the cage — a hinged lid rather than a demolition.

## Prior engineering efforts

Two lines of work bracket this project.

**Rational pore engineering.** The Giessen lab has widened QtEncapsulin's pores by
design, improving substrate access for encapsulated enzymes. This works, and it
establishes that the shell tolerates surgery around its symmetry axes — but it
optimises a property you can see in a structure.

**Directed evolution of the shell itself.** Siddiquee and co-workers evolved
QtEncapsulin for increased porosity using a chloramphenicol life–death selection,
and had to invent a new genetic architecture to do it. Their finding matters for
anyone evolving a cage: for multimeric proteins, the impact of a deleterious
mutation is amplified by the repeated extensive interactions between adjacent
subunits. A variant that would work perfectly well in a mixed shell is lost as a
dominant negative when it is the only version present. Their fix was to keep an
invariant wild-type copy on a second plasmid, so obligate heteromers could form
hybrid assemblies and still be selected.

**Evolving an RNA-packaging capsid from scratch.** Separately, Tetter and
co-workers took a bacterial enzyme that lacks affinity for nucleic acids and
converted it, by laboratory evolution under escalating nuclease challenge, into
an artificial nucleocapsid that packages and protects its own encoding mRNA. The
fraction of particles carrying a full-length genome rose from about 2 % to about
64 %.[^tetter] Packaging, in other words, is an evolvable trait — provided the
selection actually depends on it.

[^tetter]: Tetter *et al.*, *Science* **372**, 1220–1224 (2021),
    [doi:10.1126/science.abg2822](https://doi.org/10.1126/science.abg2822).

## Where the field falls short

Three gaps, and this project sits at their intersection.

**Cargo class.** Encapsulins load protein natively and RNA not at all. Lipid
nanoparticles do the reverse. Applications that need a protein and its cognate
RNA delivered together — ribonucleoprotein genome editors, above all — currently
require co-formulating two carriers with different biodistributions.

**Measurement.** Encapsulation is usually assayed downstream, on purified
material, one variant at a time. That is fine for characterising a design and
useless as a selection: it cannot be applied to a library, and it does not link a
variant's performance to its own survival.

**Throughput.** Classical directed evolution mutagenises *in vitro* and
transforms the library in, which limits both the depth of mutagenesis and the
number of campaigns that can be run in parallel. Continuous systems that
hypermutate a designated locus *in vivo* — PACE, OrthoRep, T7-ORACLE, MutaT7 —
remove that ceiling, but they still need a selection worth applying. MutaT7 fuses a T7 RNA polymerase to a cytidine deaminase, so mutations land only on DNA between a T7 promoter and terminator.[^mut]

[^mut]: Moore, Papa & Shoulders, *J. Am. Chem. Soc.* **140**, 11560 (2018).

We address the third by adopting MutaT7, and the second by building a circuit in
which encapsulation is the only cheap route to survival. The first is the point
of the exercise.
