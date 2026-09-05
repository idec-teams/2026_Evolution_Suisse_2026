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

    dCas9 is fused to the native cargo-loading peptide, which docks into the
    binding groove present once on the lumenal face of each of the 240 protomers.
    This reuses QtEnc's own chemistry rather than importing a second foreign
    module, and it inherits whatever affinity and geometry evolution has already
    tuned in the native system.

=== "RNA handle — λN·boxB"

    The sgRNA scaffold carries a **boxB** stem-loop, caught by the arginine-rich
    **λN⁺** peptide grafted onto the interior surface of the shell. The precedent
    is direct: Hilvert and co-workers built an artificial nucleocapsid by
    circularly permuting a bacterial enzyme and appending λN⁺, and found the
    peptides lining the lumenal edge of the shell openings. A lysine-to-arginine
    substitution in λN⁺ is known to raise boxB affinity roughly threefold, which
    gives a ready-made tuning knob if capture proves too weak.

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

**The shell has to actually assemble.** This is the constraint currently
binding: see [Results](results.md).
