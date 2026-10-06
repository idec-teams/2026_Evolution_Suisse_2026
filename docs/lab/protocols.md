---
title: Protocols
summary: Protocols as performed, with modifications to published versions.
---

# Protocols

Where a published protocol was modified, the modification and its reason are
given.

## Strains and media

*E. coli* DH10β for all cloning, BL21 (DE3) for expression of the shell variants,
and the MutaT7 host strain for propagating the mutation plasmid and for the
planned campaign. Cultures in 2×YT at 37 °C and 200 rpm unless stated.
Antibiotics at 100 µg/mL ampicillin, 50 µg/mL kanamycin (200 µg/mL for
high-stringency plates) and 25 µg/mL chloramphenicol. Glucose to 1 % (w/v) in
expression cultures suppresses leaky T7 expression before induction. LB with 1 %
agar plates carry the matching antibiotic for cloning and selection.

## Transformation and recovery

Chemically competent cells prepared by the calcium chloride method: overnight
culture diluted into 50 mL, grown to OD₆₀₀ 0.5–0.6, chilled on ice 30 min,
pelleted at 4000 × g, washed twice in ice-cold 100 mM CaCl₂ with a 30 min
incubation between washes, resuspended in 5 mL CaCl₂ with 80 % glycerol,
aliquoted and flash-frozen.

!!! tip "Practical notes"

    - Cells are kept cold at all times, including during transport to the
      centrifuge.
    - About 20–30 µL of cells are used per transformation. One aliquot covers
      about five transformations; larger volumes do not improve efficiency.
    - The MutaT7 strain transforms poorly, so aliquots of 200 µL are prepared
      instead of 100 µL.
    - For low-efficiency assemblies, the recovery culture is pelleted and
      resuspended in ~50 µL before plating, instead of plating 400 µL.

Transformation: thaw 10 min on ice, add 2–5 µL DNA, 30 min on ice, heat shock
42 °C for 30 s, 5 min on ice, recover in 400 µL SOC at 37 °C for 1 h, plate.

## Cloning

**Gibson assembly.** 10–20 µL reactions, 0.05 pmol per fragment, insert:backbone
molar ratios 1:1 to 3:1, 50 °C for 15–60 min.

**Golden Gate.** PaqCI or BsaI-HFv2 with NEBridge Ligase Master Mix, 15–30 µL, as
a one-hour isothermal incubation at 37 °C or a cycled digestion–ligation
programme. For the selection plasmids, whole-plasmid sequencing of the reaction
mixture showed which junctions formed ([Table S2](data.md#table-s2)).

**PCR and verification.** Inserts and backbones by PCR with Q5 or Phusion,
20–30 s per kb extension, purified by agarose gel (0.5 % in TAE, 130 V, 25 min)
and column extraction. Constructs verified by Sanger sequencing of assembly
junctions and by whole-plasmid sequencing (Microsynth; NightSeq for direct
colony submission), alignments curated in Benchling.

**Linearisation.** pSC101 with EcoRI and BamHI; the MutaT7 backbone with PacI and
SacI. Digests were run for 2–3 hours; these enzymes have little star activity, so the
longer incubation reduces incomplete cutting without a cost.

!!! caution "Reading a linearisation gel"

    Supercoiled circular plasmid migrates faster than the same plasmid
    linearised. A strong upper band and a faint lower band therefore do not
    necessarily mean that the lower band is the cut product. The wrong band was
    excised once for this reason.

PCR-linearised backbones are DpnI-digested for 1 h at 37 °C to remove template.

## Expression

Primary culture 5 mL overnight, 37 °C, 200 rpm. Secondary culture 250 mL 2×YT
with antibiotic and **1 % glucose**, inoculated to OD₆₀₀ 0.05.

!!! protocol "Induction conditions"

    Induce at OD₆₀₀ 0.4–0.6 with **0.1 mM IPTG**, then move to **18 °C, 120 rpm,
    18 h**.

    Earlier runs used 1 mM IPTG. Published protocols for this shell use 0.1 mM,
    and strong induction commonly leads to inclusion bodies. Glucose suppresses
    leaky expression before induction; IPTG takes effect once the glucose is
    consumed.

Aliquots are taken immediately before and after induction, normalised to OD, for
later SDS-PAGE, so that protein loss can be located to a step.

## Purification

1. **Lysis.** Resuspend in 20 mM Tris-HCl pH 8.0, 150–500 mM NaCl. Chemical lysis
   with lysozyme and 1 mM PMSF, then sonication on ice (24 % amplitude, 2 s on /
   4 s off, 5 min total on-time).
2. **Clarify.** 10 000 × g, 15 min, 4 °C. The pellet is kept, as most of the protein
   was found in it.
3. **Pre-enrichment**, one of two routes run on split aliquots:
   - **PEG-8000/NaCl**: to 10 % PEG and 0.5 M NaCl, 40 min on ice, 8000 × g 10 min.
   - **Heat precipitation**, 65 °C for 15 min in a water bath, exploiting the
     shell's thermostability; keep the supernatant.

   Filter through 0.45 µm and 0.22 µm before further use.
4. **Ni-NTA** (where used). Gravity column, Ni-Sepharose 6 Fast Flow; 1 mL of a
   50 % resin slurry per 4 mL of sample, 1 h at 4 °C, two washes of 1 mL at
   20 mM imidazole pH 8, elution in 1 mL of 250 mM imidazole pH 8. For
   QtEnc-His this step discards the assembled species along with the insoluble
   fraction ([Results](../project/results.md#34-purification-and-validation-of-qtencapsulin-cages)),
   so pellet-derived material was taken forward without it.
5. **Buffer exchange.** Amicon 100 kDa cut-off, 4000 RCF, 4 °C. Pre-wash the
   filter three times with water and equilibrate in elution buffer first.
6. **SEC, two tiers.** A crude cut on HiPrep Sephacryl S-500 HR at 0.5 mL/min
   (1 mL fractions), then high-resolution SEC on Superose 6 10/300 GL at
   **0.3 mL/min**, reduced from the standard rate to keep system pressure below
   1.5 MPa. Buffer: 20 mM Tris, 200 mM NaCl, pH 8.0 with 0.02 % sodium azide,
   filtered through 0.45 µm and degassed 30 min. Fractions into 96-well plates
   and pooled by peak.

!!! caution "SEC notes"

    The fraction collector follows a snake pattern across the plate, so wells are
    counted up or down depending on the row letter.

    Sodium azide is added to the SEC buffer, as buffer without it became
    contaminated with fungi.

## Analysis

**SDS-PAGE.** Precast gels, 165 V, 25–40 min. 10–20 µg total protein per lane for
crude samples. Sample mixed with 4× loading buffer to 1×, 95 °C for 5 min.

**Native PAGE.** Blue Native and clear-native precast gels, no detergent in the
sample buffer, which preserves assembled shells. The gels are fragile and are
handled with water on the tray.

**Anti-His immunoblot.** Semi-dry transfer; with the **high molecular weight**
setting for native gels.

**DLS.** Prometheus Panta and cuvette formats, samples below 1 mg/mL in SEC
buffer. Protein concentration from A<sub>280</sub> with construct-specific
extinction coefficients.

## Stop-codon reversion assay

Tests MutaT7 mutagenesis with two reporters: `p_m004` (kanamycin-resistance
reporter) and `p_m008` (chloramphenicol-resistance reporter), each with an early
stop codon.

Pick random colonies from selective plates and resuspend in 60 µL 2×YT; three
independent colonies per experiment serve as biological replicates. Inoculate
15 µL into 5 mL 2×YT with 50 µg/mL ampicillin and one additive: 1 mM IPTG
(induced), repressing agent (glucose at 0.5 % for the kanamycin reporter, 1 %
2,4-diacetylphloroglucinol (DAPG) for the chloramphenicol reporter where the
selection plasmid is present, 1 % glucose where it is not), or none (basal). Grow
overnight, plate 50 µL on LB agar with 50 or 200 µg/mL kanamycin, or 25 µg/mL
chloramphenicol, and count colonies after 48 h at 37 °C
([Fig S13](data.md#fig-s13)).

## Continuous culture

Planned in a turbidostat (Pioreactor). The passaging and stringency schedule is
given under [planned campaign](../project/future.md#planned-campaign).

## Co-encapsulation assays

Planned for enriched shell alleles. Because the selection is satisfied by capture
of either the guide or the nuclease, these assays distinguish the two:

- **Native PAGE, dual-stained:** nucleic acid and protein in the same lane.
- **RNase challenge:** encapsulated RNA is protected and free RNA is degraded.
  Tetter and co-workers used this assay in their packaging selection. It tests
  protection and not only binding.
- **Native PAGE with a fluorescent cargo, and SEC co-elution** of cargo with the
  shell peak, for protein loading.
- The stop-codon reversion assay above tests MutaT7 function and does not measure
  sequestration.
