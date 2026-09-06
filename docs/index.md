---
template: home.html
headline: Encapsulins
standfirst: >-
  Continuous directed evolution of a protein nanocompartment, with survival
  coupled to how well the cell packages dCas9 and its guide RNA.
description: >-
  Evolution Suisse 2026 — continuous directed evolution of QtEncapsulin
  nanocompartments for programmable mRNA and protein encapsulation.
---

## Why couple survival to encapsulation

Most encapsulation assays are reporters: they measure loading after the fact, in
a separate step, on a subset of variants. This selection makes loading
load-bearing. A variant that fails to package the repressor does not grow.

<ul class="metrics wide">
  <li><b>240</b><span>subunits per T=4 shell</span></li>
  <li><b>42 nm</b><span>shell diameter</span></li>
  <li><b>6NJ8</b><span>QtEncapsulin structure</span></li>
  <li><b>1</b><span>locus under mutation</span></li>
</ul>

## Two handles on one complex

The cargo is a ribonucleoprotein — dCas9 bound to its guide — and each half
carries its own grip. dCas9 is fused to the encapsulin's native five-residue
cargo-loading peptide. The sgRNA carries a boxB hairpin, bound by a λN peptide
grafted onto the shell's inner surface.

Either grip alone is enough to sequester the complex and rescue the cell. The OR
gate rewards improvement in protein capture *or* in RNA capture, rather than
demanding both from a starting point that does neither well.

## Where to go next

The [mechanism page](project/mechanism.md) covers the selection circuit,
including why the guide targets the middle of the resistance gene rather than its
promoter. [Engineering](engineering/index.md) documents the plasmids and
constructs; the [lab section](lab/index.md) holds protocols and the notebook.

!!! note "Status"

    The selection circuit and the mutagenesis plasmids are built and
    sequence-verified. The evolution campaign has **not yet been run**, and shell
    assembly is still being troubleshot — see [Results](project/results.md) for
    where things stand, including what has not worked.
