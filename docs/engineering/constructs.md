---
title: Constructs
summary: Fusions, tags, and the peptides that route cargo into the shell.
---

# Constructs

## Shell fusions

The shell protein is expressed with a hexahistidine tag for purification and, in
the evolved version, a **λN⁺ peptide grafted onto its lumenal surface** as the
RNA-binding handle.

Two tag architectures are in play, because the first one may be the reason
purification has not recovered assembled cages:

| Architecture | Rationale | Status |
| --- | --- | --- |
| His tag via GS linker | Flexible linker, standard practice | Built; suspected of being occluded in the assembled cage |
| Direct terminal His tag | Reported in published supplementary work to assemble successfully | Built as the discriminating test |

See [Results](../project/results.md) for why this matters more than it should.

### Reporter constructs

Several expression constructs carry **mScarlet** (26.7 kDa) as a fluorescent
cargo reporter, so that co-elution of cargo with the shell peak can be followed
by eye during size exclusion. Approximate masses used for gel interpretation:

| Species | Mass |
| --- | --- |
| QtEncapsulin monomer | 32.2 kDa |
| QtEncapsulin + peptide fusion | 34.1 kDa |
| mScarlet | 26.7 kDa |
| Assembled T=4 shell | ~7.7 MDa |

## Cargo tags

**The protein handle.** dCas9 is fused to the native cargo-loading peptide, whose
core motif is the five residues `TVGSL`. Five residues is short enough that it is
unlikely to interfere with folding or function — a real consideration for a
protein that has to undergo large conformational changes to load its guide and
find its target.

**The RNA handle.** A **boxB** stem-loop is placed in the sgRNA scaffold, where
it is caught by the λN⁺ peptide on the shell interior. λN⁺ carries a known
lysine-to-arginine substitution that raises boxB affinity roughly threefold,
available as a tuning knob if capture proves too weak.

## Controls

The controls are what make the selection interpretable, and several of them are
already built.

**Non-targeting guide** (`s002_NT`). Defines unrepressed resistance output. Any
cell that survives at a kanamycin dose the non-targeting control cannot tolerate
is doing something other than what we think.

**Shell-free.** dCas9 and guide present, no encapsulin. Defines the floor —
maximal repression, no rescue possible.

**Handle-free shell.** Encapsulin without the λN graft and dCas9 without the CLP.
Distinguishes genuine handle-mediated capture from non-specific sequestration by
a large abundant protein.

**Single-handle constructs.** Shell with λN but dCas9 without CLP, and the
converse. These are the controls that resolve the ambiguity the
[OR gate](../project/design.md) introduces — they say which arm any observed
rescue is running through.
