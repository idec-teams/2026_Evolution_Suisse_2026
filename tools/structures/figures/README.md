# Shared molecular assets

The homepage and Mechanism illustrations use real deposited coordinates from [PDB 5F9R](https://www.rcsb.org/structure/5F9R), rendered with UCSF ChimeraX. The PNGs are committed under `docs/img/molecules/`; building or visiting the wiki requires no molecular software or external requests.

- **Protein:** the Cas9 polypeptide, author chain **B** / mmCIF label chain **A**. This deposited protein is catalytically active Cas9; the illustration does not claim to be a model of the project's engineered dCas9 fusion.
- **RNA:** the 116-nucleotide guide, author chain **A** / mmCIF label chain **B**, shown separately in its deposited, protein-bound conformation.
- **Mechanism complexes:** `cas9-guide-complex` retains the deposited protein–guide arrangement; `t7-polymerase` uses protein author chain **D** and RNA chain **R** from [PDB 1MSW](https://www.rcsb.org/structure/1MSW), without modeling the deaminase fusion.
- DNA, sulfate ions and other components are excluded. Overview compositions are schematic and do not preserve relative molecular sizes; Mechanism shares a calibrated Angstrom scale.

The editable `.cxc` files use gentle lighting, restrained silhouettes and one soft color per cargo class: lavender for protein and ochre for RNA. They follow the `chimerax-figures` skill's chain-only workflow, with the wiki's color identities in place of the paper's palette. The scripts contain no export or exit commands.

To regenerate:

```bash
python tools/structures/render_delivery.py --chimerax /path/to/ChimeraX
```

This development script requires Pillow and a ChimeraX build with offscreen rendering. It downloads the original mmCIF into the gitignored structure cache when needed, inserts an orthographic camera and export commands into temporary copies, and crops each transparent PNG with a small margin. Complex PNGs have matching JSON camera projections, image-origin offsets and pixels-per-Angstrom scales. The canvas adapter uses these to align the existing DNA traces and fusion-position dots, while preserving true relative molecular sizes. Rendered molecules have a fixed view; shell geometry continues to rotate. Regenerate each PNG/JSON pair together. Omitting `--chimerax` uses `chimerax-render` if installed, otherwise `chimerax`.

Do not guess chain letters: the author IDs used by ChimeraX are reversed relative to the mmCIF label IDs used by the existing browser structure pipeline.

To render just one asset, append `--only cas9-guide-complex` or `--only t7-polymerase`.
