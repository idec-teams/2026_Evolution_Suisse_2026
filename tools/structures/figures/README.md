# Homepage molecular assets

The opening illustration uses real deposited coordinates from [PDB 5F9R](https://www.rcsb.org/structure/5F9R), rendered with UCSF ChimeraX. The PNGs are committed under `docs/img/molecules/`; building or visiting the wiki requires no molecular software or external requests.

- **Protein:** the Cas9 polypeptide, author chain **B** / mmCIF label chain **A**. This deposited protein is catalytically active Cas9; the illustration does not claim to be a model of the project's engineered dCas9 fusion.
- **RNA:** the 116-nucleotide guide, author chain **A** / mmCIF label chain **B**, shown separately in its deposited, protein-bound conformation.
- DNA, sulfate ions and other components are excluded. The page composition is schematic and does not preserve relative molecular sizes.

The two editable `.cxc` files use gentle lighting, restrained silhouettes and one soft color per cargo class: lavender for protein and ochre for RNA. They follow the `chimerax-figures` skill's chain-only workflow, with the wiki's color identities in place of the paper's palette. The scripts contain no export or exit commands.

To regenerate:

```bash
python tools/structures/render_delivery.py --chimerax /path/to/ChimeraX
```

This development script requires Pillow and a ChimeraX build with offscreen rendering. It downloads the original mmCIF into the gitignored structure cache when needed, inserts an orthographic camera and export commands into temporary copies, and crops each transparent PNG with a small margin. Omitting `--chimerax` uses `chimerax-render` if installed, otherwise `chimerax`.

Do not guess chain letters: the author IDs used by ChimeraX are reversed relative to the mmCIF label IDs used by the existing browser structure pipeline.
