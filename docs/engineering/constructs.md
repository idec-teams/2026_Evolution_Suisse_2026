---
title: Constructs
summary: Fusions, tags, and the peptides that route cargo into the shell.
---

# Constructs

## Shell variants

The shell protein carries a **λN⁺ peptide on its lumenal surface** as the
RNA-binding handle, joined by a GS linker. The first designs also carried a
His-tag and a targeting peptide (TP) on the outer surface; these were dropped
for the evolution constructs after the His-tag-bearing shell proved insoluble
([Results](../project/results.md#34-purification-and-validation-of-qtencapsulin-cages)).
The variants that were built, all in pET-Duet-1:

| Construct | Shell | Second cassette | Status |
| --- | --- | --- | --- |
| `p_f008` | QtEnc, no His-tag or TP | — | Verified |
| `p_f009` | QtEnc + TP | — | Verified |
| `p_f010` | QtEnc (boxBr + λN) | mScarlet (FLAG + boxBr) | Verified |
| `p_f011` | QtEnc (boxBr + λN + TP) | mScarlet (FLAG + boxBr) | Verified |
| `p_f012`–`p_f017` | six combinations of boxBr, λN and TP | dCas9 (FLAG + IMEF + boxBr) | In assembly |

The full inventory is [Table S1](../lab/supplementary.md#table-s1).

<figure class="report wide" markdown>

[![sgRNA sequence with spacer and boxB insertion sites](../img/report/s2-sgrna.webp)](../img/report/s2-sgrna.webp)

**Fig 1.** KanR-targeting sgRNA with the spacer and the boxB insertion sites in
the scaffold.

</figure>

### Reporter constructs

Several constructs carry **mScarlet** (26.7 kDa) as a fluorescent cargo
reporter, so that co-elution of cargo with the shell peak can be followed by eye
during size exclusion. Approximate masses used for gel interpretation:

| Species | Mass |
| --- | --- |
| QtEncapsulin monomer | 32.2 kDa |
| QtEncapsulin + peptide fusion | 34.1 kDa |
| mScarlet | 26.7 kDa |
| Assembled T=4 shell | ~7.7 MDa |

## Cargo tags

**The protein handle.** dCas9 is fused to the cargo-loading peptide (IMEF) at its
C-terminus. The core motif is five residues, `TVGSL`, short enough that it is
unlikely to interfere with the folding or function of a protein that undergoes
large conformational changes to load its guide and find its target.

**The RNA handle.** **boxB** hairpins are inserted in the sgRNA scaffold, in the
stem-loop and the tetraloop where the MS2 insertions were validated, and are
caught by the λN⁺ peptide on the shell interior. λN⁺ carries a known
lysine-to-arginine substitution that raises boxB affinity roughly threefold,
available as a tuning knob if capture proves too weak.

## Controls

The controls are what make the selection interpretable.

**Non-targeting guide** (`s002_NT`). Defines unrepressed resistance output. Any
cell that survives at a kanamycin dose the non-targeting control cannot tolerate
is doing something other than what we think.

**Shell-free.** dCas9 and guide present, no encapsulin. Defines the floor —
maximal repression, no rescue possible.

**Handle-free shell.** Encapsulin without the λN graft and dCas9 without the CLP.
Distinguishes genuine handle-mediated capture from non-specific sequestration by
a large abundant protein.

**Single-handle constructs.** Shell with λN but dCas9 without CLP, and the
converse (`p_f014`–`p_f017` cover these combinations). These resolve the
ambiguity the [OR gate](../project/design.md) introduces — they say which arm any
observed rescue is running through.
