---
title: Design
summary: The shell we chose, the cargo we target, and why QtEncapsulin.
---

# Design

## Choosing QtEncapsulin

The shell is QtEncapsulin (QtEnc), the encapsulin of *Quasibacillus
thermotolerans*: a 240-subunit, T=4 icosahedral compartment about 42 nm in
diameter and 7.7 MDa in mass, with one internal cargo-loading site per
subunit.[^qt] Its structure is deposited as
[6NJ8](https://www.rcsb.org/structure/6NJ8).

Four properties decided it.

**It is one of the largest encapsulins available.** A T=4 shell has room for a
dCas9 ribonucleoprotein; a T=1 cage of 60 subunits does not.

**It is permeable.** Cargo of 14–482 kDa enters pre-assembled shells in a single
mixing step, without disassembly, co-expression tuning or a triggering component.
For a selection that runs inside a living cell this matters: capture does not have
to coincide with assembly, so a shell has more than one moment in which to succeed.

**Its loading chemistry is minimal.** The CLP core motif is five residues,
`TVGSL`, and works fused to either terminus. It is unlikely to interfere with the
folding or function of the cargo protein — which for a nuclease as
conformationally busy as Cas9 is not a small consideration.

**It has an evolutionary track record.** QtEnc has already been carried through a
life–death directed-evolution campaign and survived 13-residue deletions in a
vertex-lining loop. The scaffold tolerates being broken.

[^qt]: Giessen *et al.*, *eLife* **8**, e46070 (2019),
    [doi:10.7554/eLife.46070](https://doi.org/10.7554/eLife.46070).

### What QtEncapsulin cannot do

It has no affinity for nucleic acids. Nothing in the native system binds RNA, and
no amount of pore engineering will change that — a wider hole does not create a
binding site. This is the gap the project has to engineer across before evolution
has anything to improve.

## Cargo-loading peptides

The thing we need captured is not a protein or an RNA but a complex of both:
dCas9 bound to its guide. We therefore gave the system a separate grip on each
half, chosen so that the two do not interfere.

=== "Protein handle — CLP"

    dCas9 is fused at its C-terminus to the cargo-loading peptide (IMEF in the
    construct names), using the established C-terminal fusion site. The CLP
    docks into the binding groove on the lumenal face of each of the 240
    protomers. This reuses QtEnc's own chemistry rather than importing a second
    foreign module, and the five-residue core is unlikely to disturb dCas9
    folding.

=== "RNA handle — λN·boxB"

    The sgRNA carries **boxB** hairpins, caught by the arginine-rich **λN⁺**
    peptide grafted onto the interior surface of the shell. In the scaffold, boxB
    replaces the validated MS2 stem-loop insertion sites, in both the stem-loop
    and the tetraloop ([Fig S2](../lab/supplementary.md#fig-s2)). The precedent is
    direct: Hilvert and co-workers gave a non-viral cage mRNA recognition by
    appending cationic peptides including λN⁺, and found them lining the lumenal
    edge of the shell openings. A lysine-to-arginine substitution in λN⁺ is known
    to raise boxB affinity roughly threefold, which gives a ready-made tuning
    knob if capture proves too weak.

<figure class="report wide" markdown>

[![AlphaFold 3 model and sequence map of the engineered QtEnc subunit](../img/report/fig1-structure.webp)](../img/report/fig1-structure.webp)

**Fig 1.** QtEnc (6NJ8) and the engineered subunit: λN⁺ on the lumenal face,
HisTag and targeting peptide (TP) on the outer face, each joined by a GS linker.
Full caption under [Results](results.md#31-engineering-qtencapsulin-for-proteinrna-co-encapsulation).

</figure>

### Outer-surface modifications

The first designs also carried a His-tag and a targeting peptide on the outside
of the shell, for purification and delivery. The His-tag-bearing shell
partitioned into the insoluble fraction ([Results](results.md#34-purification-and-validation-of-qtencapsulin-cages)),
and as it was not resolved whether the tag, the peptide or the combination was
responsible, the designs used for evolution carry no external modification.
Variants with the targeting peptide but no His-tag are built in parallel. This
makes tolerance of outer-surface fusions an evolvable target of its own: a shell
that displays a delivery peptide without losing solubility is a useful output.

The two handles are deliberately orthogonal, and the selection treats them as an
**OR gate**: capturing the guide, or capturing the nuclease, is individually
sufficient to break the complex and rescue the cell.

!!! note "Why an OR gate rather than an AND gate"

    Demanding simultaneous capture of both halves would be a more faithful test of
    co-encapsulation — and a much worse selection to start from. A shell that does
    neither well has no gradient to climb toward doing both. The OR gate rewards
    partial progress along either axis, which is what makes the landscape
    traversable from a wild-type starting point.

    The cost is that single-handle solutions can be enriched in place of genuine
    co-encapsulation. Distinguishing them is the job of the
    [co-encapsulation assays](../lab/protocols.md), not of the selection.

## Design constraints

**The shell must remain the only thing evolving.** Anything else in the circuit
that can mutate to restore resistance will, and faster. This constraint is what
produces the two-plasmid split described in
[Plasmids](../engineering/plasmids.md).

**Repression must be graded, not absolute.** A binary live/die circuit gives
selection no gradient. See [Mechanism](mechanism.md) for how guide truncation
buys a continuous knob instead.

**dCas9 must be present but not overexpressed.** Repression strength becomes
independent of dCas9 concentration only once the target is saturated, which
argues for high expression — but dCas9 overexpression is separately reported to
be toxic in *E. coli*. The working range sits above saturation and below toxicity.

**The shell has to assemble.** Selection can only act on capture once cages form
in the cell, so cage assembly is the first thing to confirm independently — by
electron microscopy as well as by chromatography. See the
[outlook](results.md#outlook).
