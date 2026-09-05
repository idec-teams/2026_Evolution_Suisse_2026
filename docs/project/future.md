---
title: Future work
summary: What we would do next with more time and more selective agents.
---

# Future work

## Getting assembly on its feet

Everything else is downstream of this. The immediate queue, in order of how
cheaply it discriminates:

1. **Direct C-terminal His tag, no linker.** The fastest test of the
   tag-occlusion hypothesis, and the construct that published work reports as
   assembling.
2. **Negative-stain electron microscopy on crude lysate.** Bypasses the
   purification entirely. If cages are present in the cell and being lost during
   handling, this sees them; SEC and DLS on purified material cannot distinguish
   "never assembled" from "assembled and lost".
3. **Untagged shell with a tagged cargo.** Pull on the cargo rather than the
   shell, so that assembly is not selected against by the affinity step.

## Broadening the cargo range

The λN·boxB handle is not specific to a guide RNA. Any transcript carrying a boxB
hairpin becomes a substrate, so a shell evolved for guide capture should transfer
directly to mRNA packaging — which is the delivery application that motivated the
project. The obvious test is to re-run the selection with the hairpin moved from
the sgRNA scaffold onto an unrelated transcript and ask whether the evolved shell
still captures it.

Whether that generalises is an empirical question with a real chance of
answering "no": evolution under a single selection tends to find the cheapest
solution, and the cheapest solution here may be specific to the geometry of the
dCas9 complex.

## Orthogonal selections

The OR gate that makes the landscape traversable also makes the output ambiguous.
Two follow-ups tighten it.

**An AND gate, later.** Once shells exist that capture either half, the handles
can be split across two selective agents so that both must be sequestered
simultaneously. Starting there would have been hopeless; arriving there from a
partially evolved population is plausible.

**A nuclease challenge.** Tetter and co-workers escalated stringency by shrinking
the nuclease and lengthening the exposure — benzonase, then RNase A, then RNase
T1, from one hour to four. That selects for *protection*, not merely binding,
which is a different and more demanding property than anything our current
circuit measures.

## Dealing with escape

The failure mode to plan for is enrichment of cells that restored resistance
without improving encapsulation. Two measures are already designed in — holding
dCas9 and the sgRNA off the mutagenised plasmid, and re-sequencing the selection
plasmid each passage. A third would help: a counter-selection that periodically
requires the repressor to be *functional*, catching populations that have
quietly lost it.

## Toward delivery

The end state is a shell that packages a ribonucleoprotein and delivers it to the
cytosol of a mammalian cell. The delivery half of that problem has been solved
separately for this scaffold, using a pH-sensitive intein to detach cargo in the
endosome and a fusogenic peptide to escape it. Nothing in that architecture
conflicts with what we are evolving — but it assumes a shell that assembles,
which returns to the top of this page.
