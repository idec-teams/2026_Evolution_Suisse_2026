---
title: Background
summary: Encapsulins, prior engineering work, and the gap this project addresses.
---

# Background

## Delivery of protein–RNA complexes

Protein–RNA complexes can combine a protein's catalytic activity with an RNA's
sequence-specific recognition. CRISPR–Cas9 is a clear example: the guide RNA
specifies a DNA target, while Cas9 cleaves it. Changing the guide sequence can
retarget the complex without redesigning the protein.[^jinek]

Delivery must preserve both components and bring them into the same cell and
intracellular compartment. Uptake across the cell membrane and escape from
endosomes are major barriers. Formulation conditions also matter: Wei and
co-workers found that acidic conditions used for conventional lipid nanoparticle
formulation destabilised Cas9 ribonucleoproteins, and developed a modified
formulation that retained activity and enabled tissue-specific editing in
mice.[^wei]

A shared carrier is one way to coordinate delivery, but protein and RNA do not
necessarily require separate vehicles. Wang and co-workers delivered Cas9–guide
RNA complexes using bioreducible lipid nanoparticles, and Wei and co-workers
extended lipid-based ribonucleoprotein delivery to systemic administration.
Protein nanocages offer an additional, genetically programmable platform for
combining protein and RNA cargo.[^wang][^wei][^copackaging]

## Encapsulins

Encapsulins are prokaryotic protein nanocompartments. Well-characterised
icosahedral examples include T=1 shells with 60 subunits, T=3 shells with
180 subunits, and T=4 shells with 240 subunits. Sutter and co-workers established
the structural basis of enzyme encapsulation in a T=1 cage; Giessen and
co-workers subsequently characterised the approximately 42 nm T=4 shell of
*Quasibacillus thermotolerans*, QtEncapsulin, as part of an iron-storage
system.[^sutter][^qt]

In the Family 1 encapsulins used here, a short **cargo-loading peptide (CLP)** on
the cargo binds a site on the shell's inner surface. This genetically encoded
recognition can be transferred to non-native proteins. Cassidy-Amstutz and
co-workers identified a minimal loading tag, while Altenburg, Rollins, Silver
and Giessen examined how targeting-peptide sequence, length and cargo properties
influence loading.[^clp][^targeting]

The shell exterior and interior can be engineered for different purposes.
Examples include simultaneous antigen display and protein loading for vaccine
research, and the Giessen lab's engineering of encapsulins for concurrent RNA
and protein packaging.[^vaccine][^copackaging]

### Permeability of QtEncapsulin

Established loading strategies include co-expression of cargo and shell, and
controlled disassembly followed by reassembly. These approaches have different
requirements rather than a universal need for harsh treatment: Jones,
Cristie-David, Andreas and Giessen engineered QtEncapsulin to undergo reversible
disassembly under mild, controllable conditions.[^clp][^disassembly]

Kwon, Andreas, Jones and Giessen demonstrated that pre-assembled QtEncapsulin
can instead internalise CLP-tagged proteins in a single mixing step. Their
experiments included cargoes from 14 to 482 kDa, much larger than the shell's
static pores. Their structural observations support local shell flexibility and
transient openings as a route for entry. This is a proposed loading mechanism,
not evidence that a large protein passes through an unchanged pore.[^permeability]

The same study developed a modified QtEnc-based nanocarrier with pH-responsive
cargo detachment and an endosomal-escape module, and demonstrated cytosolic
protein delivery in HeLa cells. These results establish prior delivery work by
the Giessen lab; our bacterial selection and proposed protein–RNA cargo design
address different experimental questions.[^permeability]

## Prior engineering of QtEncapsulin and related cages

**Rational pore engineering.** Kwon, Andreas and Giessen engineered the
encapsulin of *Myxococcus xanthus* to improve molecular transport and access of
substrates to encapsulated enzymes. This work concerns a related encapsulin,
rather than QtEncapsulin, and shows how pore design can improve nanoreactor
performance.[^pores]

**Concurrent RNA and protein packaging.** Kwon and Giessen modified encapsulin
shells with nucleic-acid-binding peptides while preserving native protein
loading. Their 2022 study demonstrated size-selective RNA packaging, packaging
of multiple functional RNAs, and concurrent RNA and protein encapsulation in
living cells. This work provides a direct precedent for our
protein–RNA co-packaging strategy.[^copackaging]

**Directed evolution of QtEncapsulin.** Siddiquee, Lie, Szyszka, Loustau,
Andreas, Giessen and Lau used a chloramphenicol selection in which encapsulation
protects tagged chloramphenicol acetyltransferase from degradation. Their
two-plasmid design pairs a variable shell gene with an invariant wild-type copy,
compensating for both metabolic burden and assembly fitness. This enables
selection of functional homomeric variants and variants that require mixed
assemblies with wild-type subunits. Their results also identify variants that
disrupt assembly at higher mutant-to-wild-type ratios, highlighting the need to
test shell variants in their intended genetic context.[^siddiquee]

**Evolution of an RNA-packaging capsid.** Terasaka, Azuma and Hilvert engineered
and evolved lumazine-synthase cages to package their own RNA. Tetter and
co-workers subsequently evolved this platform under increasing nuclease
challenge, improving packaging and protection of full-length RNA and producing
a virus-like architecture. These cages are derived from a bacterial enzyme,
rather than an encapsulin shell.[^terasaka][^tetter]

## Open problems

**Cargo recognition.** Native Family 1 encapsulins use protein targeting
peptides; engineered RNA recognition and protein–RNA co-packaging have already
been demonstrated. Our question is whether QtEncapsulin can combine its native
protein-loading route with engineered λN–boxB RNA recognition for the selected
dCas9–guide RNA cargo. The design builds on the encapsulin work above and on the
characterised λN–boxB interaction.[^sutter][^copackaging][^boxb]

**Measurement.** Prior studies have measured purified cargo-loaded particles,
and Siddiquee and co-workers established a survival-based encapsulin selection.
Our proposed circuit uses a different readout: dCas9 and its guide repress a
kanamycin-resistance gene, and sequestration of either component should relieve
repression. CRISPR interference is established, but growth rescue alone would
not demonstrate that both components occupy the same cage. Independent assembly
and cargo-loading assays remain necessary.[^targeting][^siddiquee][^crispri]

**Throughput.** Continuous diversification can reduce repeated cycles of
library construction and transformation, but each platform needs a suitable
selection. PACE couples activity to phage propagation; OrthoRep uses an
orthogonal, error-prone replication system in yeast; T7-ORACLE uses an engineered
T7 replisome in *E. coli*. These are distinct approaches to sustaining mutation
and selection in vivo.[^pace][^orthorep][^oracle]

MutaT7, developed by Moore, Papa and Shoulders, fuses a cytidine deaminase to T7
RNA polymerase to favour mutations downstream of a T7 promoter. Terminator
arrays can delimit the targeted region, although targeting should not be
interpreted as complete absence of off-target mutations. We propose using this
system to diversify the shell cassette alongside our growth selection; the
continuous evolution campaign remains planned.[^mut]

The [design](design.md), [mechanism](mechanism.md), and
[results](results.md) pages distinguish our proposed circuit from the results
obtained so far. Full citations are collected below and on the
[references page](references.md).

[^jinek]: M. Jinek, K. Chylinski, I. Fonfara, M. Hauer, J.A. Doudna & E. Charpentier, “A programmable dual-RNA-guided DNA endonuclease in adaptive bacterial immunity”. *Science* **337**, 816–821 (2012). [doi:10.1126/science.1225829](https://doi.org/10.1126/science.1225829).

[^wei]: T. Wei, Q. Cheng, Y.-L. Min, E.N. Olson & D.J. Siegwart, “Systemic nanoparticle delivery of CRISPR-Cas9 ribonucleoproteins for effective tissue specific genome editing”. *Nature Communications* **11**, 3232 (2020). [doi:10.1038/s41467-020-17029-3](https://doi.org/10.1038/s41467-020-17029-3).

[^wang]: M. Wang, J.A. Zuris, F. Meng, H. Rees, S. Sun, P. Deng *et al.*, “Efficient delivery of genome-editing proteins using bioreducible lipid nanoparticles”. *Proceedings of the National Academy of Sciences* **113**, 2868–2873 (2016). [doi:10.1073/pnas.1520244113](https://doi.org/10.1073/pnas.1520244113).

[^sutter]: M. Sutter, D. Boehringer, S. Gutmann, S. Günther, D. Prangishvili, M.J. Loessner *et al.*, “Structural basis of enzyme encapsulation into a bacterial nanocompartment”. *Nature Structural & Molecular Biology* **15**, 939–947 (2008). [doi:10.1038/nsmb.1473](https://doi.org/10.1038/nsmb.1473).

[^qt]: T.W. Giessen, B.J. Orlando, A.A. Verdegaal, M.G. Chambers, J. Gardener, D.C. Bell *et al.*, “Large protein organelles form a new iron sequestration system with high storage capacity”. *eLife* **8**, e46070 (2019). [doi:10.7554/eLife.46070](https://doi.org/10.7554/eLife.46070).

[^clp]: C. Cassidy-Amstutz, L. Oltrogge, C.C. Going, A. Lee, P. Teng, D. Quintanilla *et al.*, “Identification of a minimal peptide tag for in vivo and in vitro loading of encapsulin”. *Biochemistry* **55**, 3461–3468 (2016). [doi:10.1021/acs.biochem.6b00294](https://doi.org/10.1021/acs.biochem.6b00294).

[^targeting]: W.J. Altenburg, N. Rollins, P.A. Silver & T.W. Giessen, “Exploring targeting peptide-shell interactions in encapsulin nanocompartments”. *Scientific Reports* **11**, 4951 (2021). [doi:10.1038/s41598-021-84329-z](https://doi.org/10.1038/s41598-021-84329-z).

[^vaccine]: P. Lagoutte *et al.*, “Simultaneous surface display and cargo loading of encapsulin nanocompartments and their use for rational vaccine design”. *Vaccine* **36**, 3622–3628 (2018). [doi:10.1016/j.vaccine.2018.05.034](https://doi.org/10.1016/j.vaccine.2018.05.034).

[^disassembly]: J.A. Jones, A.S. Cristie-David, M.P. Andreas & T.W. Giessen, “Triggered reversible disassembly of an engineered protein nanocage”. *Angewandte Chemie International Edition* **60**, 25034–25041 (2021). [doi:10.1002/anie.202110318](https://doi.org/10.1002/anie.202110318).

[^permeability]: S. Kwon, M.P. Andreas, J.A. Jones & T.W. Giessen, “A permeable protein nanocage enables facile cargo loading and cytosolic protein delivery”. *Nature Communications* (2026), published 14 August 2026. [doi:10.1038/s41467-026-76849-x](https://doi.org/10.1038/s41467-026-76849-x). Earlier [bioRxiv version](https://doi.org/10.64898/2026.04.06.716810).

[^pores]: S. Kwon, M.P. Andreas & T.W. Giessen, “Pore engineering as a general strategy to improve protein-based enzyme nanoreactor performance”. *ACS Nano* **18**, 25740–25753 (2024). [doi:10.1021/acsnano.4c08186](https://doi.org/10.1021/acsnano.4c08186).

[^copackaging]: S. Kwon & T.W. Giessen, “Engineered protein nanocages for concurrent RNA and protein packaging in vivo”. *ACS Synthetic Biology* **11**, 3504–3515 (2022). [doi:10.1021/acssynbio.2c00391](https://doi.org/10.1021/acssynbio.2c00391).

[^siddiquee]: R. Siddiquee, F. Lie, T.N. Szyszka, A. Loustau, M.P. Andreas, T.W. Giessen & Y.H. Lau, “Directed evolution of multimeric proteins is enabled by dual-compensatory gene duplication”. *bioRxiv* (2026), preprint version consulted. [doi:10.64898/2026.01.12.698938](https://doi.org/10.64898/2026.01.12.698938).

[^terasaka]: N. Terasaka, Y. Azuma & D. Hilvert, “Laboratory evolution of virus-like nucleocapsids from nonviral protein cages”. *Proceedings of the National Academy of Sciences* **115**, 5432–5437 (2018). [doi:10.1073/pnas.1800527115](https://doi.org/10.1073/pnas.1800527115).

[^tetter]: S. Tetter, N. Terasaka, A. Steinauer, R.J. Bingham, S. Clark, A.J.P. Scott *et al.*, “Evolution of a virus-like architecture and packaging mechanism in a repurposed bacterial protein”. *Science* **372**, 1220–1224 (2021). [doi:10.1126/science.abg2822](https://doi.org/10.1126/science.abg2822).

[^boxb]: P. Legault, J. Li, J. Mogridge, L.E. Kay & J. Greenblatt, “NMR structure of the bacteriophage λ N peptide/boxB RNA complex: recognition of a GNRA fold by an arginine-rich motif”. *Cell* **93**, 289–299 (1998). [doi:10.1016/S0092-8674(00)81579-2](https://doi.org/10.1016/S0092-8674(00)81579-2).

[^crispri]: L.S. Qi, M.H. Larson, L.A. Gilbert, J.A. Doudna, J.S. Weissman, A.P. Arkin *et al.*, “Repurposing CRISPR as an RNA-guided platform for sequence-specific control of gene expression”. *Cell* **152**, 1173–1183 (2013). [doi:10.1016/j.cell.2013.02.022](https://doi.org/10.1016/j.cell.2013.02.022).

[^pace]: K.M. Esvelt, J.C. Carlson & D.R. Liu, “A system for the continuous directed evolution of biomolecules”. *Nature* **472**, 499–503 (2011). [doi:10.1038/nature09929](https://doi.org/10.1038/nature09929).

[^orthorep]: A. Ravikumar, G.A. Arzumanyan, M.K.A. Obadi, A.A. Javanpour & C.C. Liu, “Scalable, continuous evolution of genes at mutation rates above genomic error thresholds”. *Cell* **175**, 1946–1957.e13 (2018). [doi:10.1016/j.cell.2018.10.021](https://doi.org/10.1016/j.cell.2018.10.021).

[^oracle]: C.S. Diercks, P. Sondermann, C. Rong, T.G. Gillis, Y. Ban, C. Wang *et al.*, “An orthogonal T7 replisome for continuous hypermutation and accelerated evolution in E. coli”. *Science* **389**, 618–622 (2025). [doi:10.1126/science.adp9583](https://doi.org/10.1126/science.adp9583).

[^mut]: C.L. Moore, L.J. Papa & M.D. Shoulders, “A processive protein chimera introduces mutations across defined DNA regions in vivo”. *Journal of the American Chemical Society* **140**, 11560–11564 (2018). [doi:10.1021/jacs.8b04001](https://doi.org/10.1021/jacs.8b04001).
