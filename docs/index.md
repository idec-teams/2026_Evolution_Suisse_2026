---
template: home.html
headline: Encapsulins
standfirst: >-
  A continuous directed-evolution campaign that makes a bacterium's survival
  depend on how well it packages its own cargo.
description: >-
  Evolution Suisse 2026 — continuous directed evolution of QtEncapsulin
  nanocompartments for programmable mRNA and protein encapsulation.
---

## Why couple survival to encapsulation

Directed evolution is only as good as its selection: a screen that measures the
wrong thing will optimise the wrong thing, however many rounds it runs.

Most encapsulation assays are *reporters* — they observe loading after the fact,
in a separate step, on a subset of variants. Our selection makes loading
**load-bearing**. A cell that fails to package the repressor does not merely
score poorly; it does not survive to the next generation.

<ul class="metrics wide">
  <li><b>240</b><span>subunits per T=4 shell</span></li>
  <li><b>42 nm</b><span>shell diameter</span></li>
  <li><b>6NJ8</b><span>QtEncapsulin structure</span></li>
  <li><b>1</b><span>locus under mutation</span></li>
</ul>

## Two handles on one complex

The thing being captured is a ribonucleoprotein: dCas9 bound to its guide RNA.
We gave the system a grip on each half. dCas9 carries the encapsulin's native
five-residue cargo-loading peptide; the sgRNA carries a boxB hairpin, caught by a
λN peptide grafted onto the inner surface of the shell.

Either grip is enough to break the complex and rescue the cell. That is
deliberate — it rewards a shell that gets better at protein capture, or at RNA
capture, rather than demanding both at once from a starting point that does
neither well.

## Where to go next

The [mechanism page](project/mechanism.md) walks through the selection circuit in
full, including why the guide targets the middle of the resistance gene rather
than its promoter. [Engineering](engineering/index.md) documents the plasmids and
constructs; the [lab section](lab/index.md) holds protocols and the running
notebook.

!!! note "Status"

    The selection circuit and the mutagenesis plasmids are built and sequence-verified.
    The continuous evolution campaign has **not yet been run**, and shell assembly is
    still being troubleshot — see [Results](project/results.md) for exactly where
    things stand, including what has not worked.
