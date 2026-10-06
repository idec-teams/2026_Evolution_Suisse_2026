---
title: Design
summary: The shell, the cargo handles and the design constraints of the selection.
---

# Design

## QtEncapsulin

The shell is QtEncapsulin (QtEnc), the encapsulin of *Quasibacillus
thermotolerans*. Its native structure is deposited as
[6NJ8](https://www.rcsb.org/structure/6NJ8).[^qt]

- **Subunits:** 240 per shell.
- **Symmetry:** T=4 icosahedral compartment.
- **Diameter:** approximately 42 nm.
- **Mass:** approximately 7.7 MDa.
- **Cargo-loading sites:** one on the inner face of each subunit.

<figure class="report wide" markdown>

[![AlphaFold 3 model and sequence map of the engineered QtEnc subunit](../img/report/fig1-structure.webp)](../img/report/fig1-structure.webp)

**Fig 1.** QtEnc (6NJ8) and the engineered subunit: λN⁺ on the lumenal face,
HisTag and targeting peptide (TP) on the outer face, each joined by a GS linker.
Full caption under [Results](results.md#31-engineering-qtencapsulin-for-proteinrna-co-encapsulation).

</figure>

We chose QtEnc for four reasons.

- **Size.** A T=4 shell can accommodate a dCas9 ribonucleoprotein, whereas a T=1
  cage of 60 subunits cannot.
- **Permeability.** Cargo of 14–482 kDa enters pre-assembled shells in a single
  mixing step, without disassembly, co-expression tuning or a triggering
  component. Capture therefore does not need to coincide with assembly.
- **Minimal loading chemistry.** The core motif of the CLP is five residues
  (`TVGSL`) and works at either terminus, so it is unlikely to interfere with
  folding of the cargo.
- **Tolerance to evolution.** QtEnc has been evolved in a life–death selection
  and tolerates 13-residue deletions in a vertex-lining loop.

[^qt]: Giessen *et al.*, *eLife* **8**, e46070 (2019),
    [doi:10.7554/eLife.46070](https://doi.org/10.7554/eLife.46070).

Wild-type QtEnc has no affinity for nucleic acids, and pore engineering does not
change this. An RNA-binding element therefore has to be introduced before
evolution can improve RNA loading.

## Cargo handles

The cargo is the complex of dCas9 and its sgRNA. Each component has its own handle.

=== "Protein handle: CLP"

    dCas9 is fused at its C-terminus to the cargo-loading peptide (IMEF in the
    construct names). The CLP docks into the binding groove on the lumenal face
    of each of the 240 protomers. This uses the native loading chemistry of QtEnc
    and the five-residue core is unlikely to disturb dCas9 folding.

=== "RNA handle: λN·boxB"

    The sgRNA carries **boxB** hairpins, which bind the arginine-rich **λN⁺**
    peptide grafted onto the interior surface of the shell. In the scaffold, boxB
    replaces the validated MS2 stem-loop insertion sites, in both the stem-loop
    and the tetraloop ([Fig S2](../lab/data.md#fig-s2)). Hilvert and
    co-workers gave a non-viral cage mRNA recognition by appending cationic
    peptides including λN⁺, which line the lumenal edge of the shell openings. A
    lysine-to-arginine substitution in λN⁺ raises boxB affinity about threefold
    and is available if capture is too weak.

### Outer-surface modifications

The first designs carried a His-tag and a targeting peptide on the outside of the
shell, for purification and delivery. The His-tag-bearing shell partitioned into
the insoluble fraction ([Results](results.md#34-purification-and-validation-of-qtencapsulin-cages)).
It was not resolved whether the tag, the peptide or the combination was
responsible, so the designs used for evolution carry no external modification.
Variants with the targeting peptide and no His-tag are built in parallel.
Tolerance of outer-surface fusions is therefore a further property that can be
selected.

### OR gate

The two handles are orthogonal, and the selection treats them as an OR gate:
capturing either the sgRNA or dCas9 breaks up the complex and rescues the cell.

!!! note "OR gate and AND gate"

    An AND gate, requiring capture of both components, would test co-encapsulation
    more directly, but a shell that captures neither component well would have no
    gradient towards capturing both. The OR gate rewards partial progress along
    either axis.

    As a consequence, variants that capture only one handle can be enriched
    instead of true co-encapsulation. These are distinguished by the
    [co-encapsulation assays](../lab/protocols.md), not by the selection.

## Design constraints

**Only the shell evolves.** Any other element of the circuit that can mutate to
restore resistance will do so faster than the shell. This requires the two-plasmid
split described in [Constructs](../lab/constructs.md).

**Repression is graded.** Targeting the resistance ORF rather than its promoter
reduces expression without switching it off completely.
[Mechanism](mechanism.md) describes how guide truncation tunes this response.

**dCas9 expression.** Repression becomes independent of dCas9 concentration once
the target is saturated, which favours high expression. dCas9 overexpression is
also reported to be toxic in *E. coli*, so the working range lies above
saturation and below toxicity.

**Shell assembly.** Selection can only act on capture once cages form in the
cell. Cage assembly is therefore confirmed independently, by electron microscopy
and chromatography (see the [outlook](results.md#outlook)).
