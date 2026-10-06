# Website handoff

Updated 2026-10-06, after the lab styling and supplementary material move into Data.
This is the current guide; it replaces the older graphite-only handoff.

The review in `Comments - mechanism page.pdf` has been applied to Mechanism,
its walkthrough, Design and the corresponding Results text. Mechanism leads
with the selection's purpose and gives experimental status in a separate
paragraph. ORF targeting, graded repression, equation variables and noise are
explained explicitly; the cited noise measurements belong to Vigouroux et al.,
not this untested selection. Design starts with QtEnc facts (240 subunits) and
the existing shell/subunit figure. Report captions use smaller text site-wide.
Automatic `(c)` → © and `(r)` → ® substitutions are disabled in MkDocs to
preserve scientific panel and variable labels. The legal footer uses an
explicit copyright entity and remains intact.

Repository: https://github.com/idec-teams/2026_Evolution_Suisse_2026

Live site: https://idec-teams.github.io/2026_Evolution_Suisse_2026/

Working checkout on this machine: `/home/olnagl/rfdproteina_dev/2026_Evolution_Suisse_2026`.
Development and publication use `main`. The latest implementation commit before
this handoff is `a654620`; its CI and GitHub Pages deployment both succeeded.
There was an earlier hosted-runner outage, but the latest deployment worked.

## Start here

Read [the authoring reference](docs/_authoring.md) for Markdown, tables, math,
figure markup and theme conventions. This is a bespoke MkDocs/Jinja theme,
with plain CSS and JavaScript ES modules. No npm or bundler is needed.

From the repository root:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/mkdocs serve -a 127.0.0.1:8000 --watch theme
```

Open `http://127.0.0.1:8000/2026_Evolution_Suisse_2026/`. Keep the project
subpath. `--watch theme` makes template, CSS and JavaScript edits reload.
A fresh clone builds using committed assets; it does not need ChimeraX.

The previous agent used `/tmp/evolution-wiki-tools/bin/python` and
`/tmp/evolution-wiki-tools/bin/mkdocs`. That temporary environment may disappear;
prefer the reproducible setup above. Do not assume a preview server is running.

## Where to edit

| Change | File or directory |
| --- | --- |
| Opening headline, standfirst, metadata | [docs/index.md](docs/index.md), YAML front matter |
| Homepage section copy, order, links and captions | [theme/home.html](theme/home.html) |
| Overview diagram geometry, cargo image placement, handles | [theme/partials/overview-figures.html](theme/partials/overview-figures.html) |
| Homepage spacing, diagram styling, Mechanism scroll layout | [theme/css/home.css](theme/css/home.css) |
| Shared colors, type and spacing tokens | [theme/css/tokens.css](theme/css/tokens.css) |
| Header, mobile drawer, shared page layout | [theme/css/layout.css](theme/css/layout.css), [theme/base.html](theme/base.html) |
| Project, lab and team page text | `docs/project/`, `docs/lab/`, `docs/team/` |
| Team roles and LinkedIn links | `docs/team/index.md`; `.person__role` and `.person__social` in `theme/css/content.css` |
| Navigation and site configuration | [mkdocs.yml](mkdocs.yml) |
| Mechanism walkthrough copy and still-view markup | [theme/partials/selection-story.html](theme/partials/selection-story.html) |
| Walkthrough insertion point | [docs/project/mechanism.md](docs/project/mechanism.md), `<!-- selection-story -->` marker; [theme/mechanism.html](theme/mechanism.html) inserts the partial |
| Walkthrough drawings, timing, labels and hotspots | [theme/js/figures/cell-scene.js](theme/js/figures/cell-scene.js) |
| Graphite encapsulin cutaway | [theme/js/figures/overview-shell.js](theme/js/figures/overview-shell.js) |
| PNG loading, molecular scale, DNA alignment and fusion-position dots | [theme/js/cargo-render.js](theme/js/cargo-render.js) |
| Molecular appearance and camera orientation | `tools/structures/figures/*.cxc`, then regenerate assets |
| Molecular provenance | [tools/structures/figures/README.md](tools/structures/figures/README.md), [docs/team/attributions.md](docs/team/attributions.md) |
| Search, navigation and table behavior | `theme/js/search.js`, `nav.js`, `tables.js` |

The homepage body is rendered by `home.html`, not Markdown paragraphs in
`docs/index.md`. It uses `headline` and `headline_accent` for the two-line H1:
“Powerful molecules / need better delivery.” Keep both front-matter keys.

## Current design and scientific boundaries

The homepage is a bird's-eye narrative: delivery barriers → why protein and RNA
can need each other → proposed encapsulin carrier → planned directed evolution
→ current experimental status and links. The opening encapsulin reveal and
long scroll animation were removed from the front page. The three-act animated
selection story now lives on Mechanism: Silence, Diversify, Encapsulate.

The look uses a cool paper background, open layouts without card boxes or
section dividers, graphite shell/cell drawings, and locally hosted IBM Plex Sans.
Protein is soft lavender (`#999BCC` in the render scripts), RNA soft ochre
(`#C9AB76`), and mutation marks use the site's mutation token. Rendered PNG
colors are baked in: changing CSS alone will not recolor them.

Keep the scientific distinction between the proposed system and demonstrated
results. Engineered shell construction, expression and MutaT7 activity have
been reported; successful assembly, co-encapsulation and the evolution campaign
are not established by these illustrations. Mammalian delivery is a longer-term
motivation; the proposed selection is bacterial. Capturing either repressor
component can restore growth, so growth alone does not prove co-encapsulation.

## Editing the homepage illustrations

The homepage now uses the original alpine/evolution banner artwork,
`docs/img/evolution-suisse-banner.png`, with three compact delivery illustrations
inside the opening copy: “Protect the cargo.”, “Reach the right cells.” and
“Release it inside.” The native SVG drawings live in
`theme/partials/delivery-promise.html`. They share a viewBox, rounded strokes,
consistent line weights and aligned numbered captions. The second step shows a
highlighted target cell among nearby cells; the third separates two shell halves
and shows cargo inside the cell. Cargo renders and the regular icosahedron macro
are shared with the overview figures. Their PDB credit remains beneath the row.

The masthead uses the user-supplied `EvolutionSuisse.png`, copied unchanged to
`docs/img/evolution-suisse.png`. CSS clips its white margins and blends it into
paper. The shared `--masthead-h` token keeps sticky layouts and mobile drawers
aligned. All homepage banner styling uses `page--banner`. On mobile, artwork
follows the opening copy to preserve readability.

`/banner-preview/` remains an unlisted mirror of the selected homepage design.
It reads the homepage front matter, is absent from navigation/search and carries
noindex. `tools/branding/exclude_preview.py` removes its entries after the built-in
search plugin writes the index. Artwork provenance and the generation prompt
are in `tools/branding/README.md`.

The user chose the original artwork. The alternative capsomer banner/logo is
preserved only under the gitignored `tools/branding/local-experiments/capsomer/`
directory, including source assets and prototype templates. It must not be
published without a later instruction. It is outside the MkDocs docs directory
and absent from production output.

This design passed strict builds and desktop/1024px/901px/390px/320px checks,
including reduced motion, no JavaScript, mobile navigation, nested-page search,
image loading and exclusion of the unpublished concept from the built site.

`overview-figures.html` defines `delivery`, `together`, `shell`, and `evolution`,
plus reusable `protein`, `rna`, and `cage` macros. Protein/RNA image
occurrences use the shared transparent Cas9/guide PNGs. Edit a shared macro to
change its appearance everywhere; adjust its call's `(x, y, scale)` to change
one placement. The original `delivery` diagram remains available as a macro;
the opening banner now uses the `delivery-promise.html` partial instead.

SVG coordinates are local to each `viewBox`; changing image dimensions can
require moving route arrows and loading-site leaders. Preserve titles,
descriptions, captions and mobile keys. The overview compositions are
illustrative and are not at a common molecular scale.

The shell diagram layers a canvas behind native SVG. `overview-shell.js` clips
an illustrative wedge out of the deposited QtEnc shell. The wedge is not a
physical opening. Native SVG remains visible without JavaScript; the schematic
shell remains if structure loading fails. `theme/js/overview.js` adds reversible
path drawing transitions, respecting reduced motion.

The `{% import ... as art with context %}` in `home.html` is necessary for
image paths using Jinja's `|url` filter. Keep asset URLs compatible with the
GitHub Pages project subpath.

The shared-delivery comparison uses the native SVG `closed_cage` macro: an
orthographic regular icosahedron with all 12 vertices, 30 edges and 20 triangular
faces. Faint dashed rear edges sit behind the cargo; solid front edges sit above
it. The older `cage` macro remains the carrier cutaway's fallback. Homepage captions retain
structure credits but omit illustration caveats such as “not to scale” and
“illustrative cutaway,” as requested. Keep the proposed-system and experimental
status distinctions in the main copy. This update passed the strict build and
desktop, 390px and 320px visual checks, including reduced motion and no JavaScript.

All six student profiles now have small role lines and LinkedIn links. Oliver's
role is “Concept development, dry lab, wiki”; Noel's is “Wet lab, funding &
finances”; Luca's is “Concept development, Wet lab lead, dry lab”; Klara and
Max have “Wet lab, funding”; Nathania has “Wet lab” pending later elaboration. Oliver and
Noel's URLs were supplied by the user, Klara's was confirmed by the user, and
Luca, Max and Nathania's were found through their public LinkedIn profiles and
matching academic affiliations. Supervisors retain their existing descriptions.

The Background page now cites 21 primary sources beside the relevant claims,
with all sources also present in the main bibliography. It explicitly credits
Giessen and collaborators for QtEnc discovery, targeting-peptide studies,
reversible disassembly, RNA/protein co-packaging, pore engineering and delivery.
Kwon et al.'s 2024 pore-engineering study is on MxEnc, not QtEnc; its correct DOI
is `10.1021/acsnano.4c08186`. Kwon & Giessen's 2022 co-packaging paper is published
in ACS Synthetic Biology (`10.1021/acssynbio.2c00391`), and Kwon et al.'s 2026
delivery paper has a verified Nature Communications version
(`10.1038/s41467-026-76849-x`). Siddiquee et al. is cited as the preprint version
consulted. The former universal claims that encapsulins cannot load RNA and
protein/RNA delivery requires separate carriers were corrected. Our planned
selection is distinguished from demonstrated co-packaging in prior systems.

## Regenerating molecular renders

The Data page now contains the datasets plus all supplementary tables (S1–S2)
and figures (S1–S14). It replaces the standalone Supplementary navigation item.
Internal citations point to `lab/data/` with the existing table/figure anchors.
`lab/supplementary/` remains an unlisted redirect preserving URL fragments;
without JavaScript it presents a direct Data link. Redirect and banner-preview
pages are removed from site search by `tools/branding/exclude_preview.py`.

The Protocols page scopes all callout accents to the existing blue `--accent`
token via its `data-page="lab/protocols/"` selector in `theme/css/content.css`.
Callout titles and body text retain their wording; other pages keep their own
semantic colors.

Constructs and Data's Figures S2/S3 use light-background copies of the two original report figures:
`docs/img/report/s3-plasmid-maps-light.png` and `s2-sgrna-light.png`. Full-size
links also use these versions. The source WebP exports are unchanged. The native
SVG rendering script, `tools/figures/light_report_views.py`, replaces only the
near-black background at source resolution before lossless PNG export. See
`tools/figures/README.md`. Desktop/390px/320px checks passed, and pixel comparisons
verified no changes to labels, sequence or colored features outside the near-black
range. Normal builds need only the committed assets.

The shared assets are committed in `docs/img/molecules/`:

| Asset stem | Contents and use |
| --- | --- |
| `cas9-protein` | Cas9 ribbons; overview protein macro and opening |
| `guide-rna` | Guide backbone and ellipsoid bases; overview RNA macro and opening |
| `cas9-guide-complex` | Deposited protein–guide arrangement; animated repressor and reusable shell reveal |
| `t7-polymerase` | T7 polymerase and nascent RNA; Mechanism mutation act |

The complex assets have matching `.json` camera projections. These provide
pixels per Angstrom, the cropped image origin and projection matrix for the
DNA traces and fusion-position dots. Regenerate each PNG/JSON pair together;
do not independently crop or resize a complex PNG.

Editable scripts are under `tools/structures/figures/`. They use ribbons,
gentle lighting, restrained silhouettes and transparent exports. Sources:

- **5F9R:** ChimeraX author chain **B** is Cas9 and author chain **A** is guide
  RNA. The mmCIF label IDs used by the browser-data builders reverse those IDs.
  The guide is shown in its deposited, protein-bound conformation. This is
  active Cas9, used as a structural illustration of dCas9; engineered CLP and
  boxB additions are absent. The colored dots mark proposed attachment sites.
- **1MSW:** author chain **D** is T7 polymerase and **R** is nascent RNA.
  The deaminase fusion is not modeled. DNA is excluded from the PNGs and drawn
  separately from the browser structure data.
- **6NJ8:** QtEncapsulin shell, rendered from committed browser geometry.

With Pillow and an offscreen-capable ChimeraX installation:

```bash
.venv/bin/pip install Pillow
.venv/bin/python tools/structures/render_delivery.py
.venv/bin/python tools/structures/render_delivery.py --only cas9-guide-complex
.venv/bin/python tools/structures/render_delivery.py --only t7-polymerase
```

Use `--chimerax /path/to/ChimeraX` when needed. On this machine the working
wrapper is `/home/olnagl/.local/bin/chimerax-render`; it invokes ChimeraX with
`--offscreen`. The script uses temporary export commands, downloads missing
mmCIF files into the gitignored cache and crops the transparent output. The
editable `.cxc` files themselves contain no save/exit commands.

The ChimeraX skill used for this work is outside this repository:
`/home/olnagl/paper/pipelines/.claude/skills/chimerax-figures/SKILL.md`.
Its guide is `/home/olnagl/paper/pipelines/paper/figure_making/chimerax/README.md`.
These paths are machine-specific. Representation and palette are already
established for this website; preserve them unless the user requests a change.

## Animation architecture and useful controls

`theme/js/figures/index.js` registers figure definitions. `figure.js` creates
an independent object per mount using `Object.create(definition)`. Preserve
that isolation: the walkthrough and its three reduced-motion still views must
not share mutable instance state.

`structures.js` caches `theme/data/*.json`; `cargo-render.js` caches each
complex PNG/JSON pair once per page. `capsid.js` and `pencil.js` draw graphite
shells. `parts.js` supplies aligned DNA traces and the molecular fallback when
render assets fail. `scrolly.js` drives Mechanism; it is not the homepage story.
`hero-capsid.js` remains registered for reuse, but is not mounted in the current
homepage. Its clock-driven behavior is separate from the scroll contract.

For scroll-driven figures, `render(t)` must be deterministic. The same progress
must produce the same picture when scrolling forward or backward. Use seeded
`rng()` from `util.js`; do not accumulate frame state or use `Math.random()`.

The cell scene uses virtual coordinates **1000 × 620**. `MUT`, `SEL`, `HUB`,
and `SEATS` define the two plasmids, capture position and loose capsomers.
Move labels in `annotate()`; move hotspot geometry in `mount()` and `paint()`.
Moving-enzyme and moving-repressor hotspots are layered after static hotspots
so they win overlaps. Check labels and click regions in all three acts.

Act activation comes from CSS `--scrolly-focus` (desktop `0.58`). Animation
ramps come from `norm(...)` calls in `paint()`: `walk`, `arrive`, `close`,
`arrival`, `mut`, and `build`. Finish the important capture/assembly actions
before the final sticky stage leaves the viewport, rather than at progress 1.

Mechanism preserves a shared molecular scale (`ANGSTROM = 0.85` virtual pixels
per Angstrom); cells and plasmids are schematic. Molecular PNGs have a fixed
orthographic view while shell geometry rotates. Do not imply the PNGs rotate
in three dimensions. Override graphite `STYLE` per figure for local changes;
changing the shared default changes every shell.

To rebuild browser geometry, first download `6NJ8.cif`, `5F9R.cif` and
`1MSW.cif` from RCSB into `tools/structures/cache/`. The builders expect that
cache to exist; they do not download it themselves. Then:

```bash
python3 -m venv tools/.venv-build
tools/.venv-build/bin/pip install numpy scipy
tools/.venv-build/bin/python tools/structures/build_capsid.py
tools/.venv-build/bin/python tools/structures/build_complex.py
tools/.venv-build/bin/python tools/structures/build_mutat7.py
```

Commit the generated `theme/data/*.json`. Preserve the shell's compact chain
plus symmetry-operator representation and the common coordinate units.
The capsid builder checks the 12 pentamers and 30 hexamers totaling 240 subunits.

## Verification and previews

For an ordinary change:

```bash
.venv/bin/mkdocs build --strict
git diff --check
```

For visual edits, open desktop and mobile screenshots, rather than relying
only on a successful build. Install the optional screenshot tools:

```bash
.venv/bin/pip install playwright
.venv/bin/playwright install chromium
.venv/bin/python tools/shots.py hero
.venv/bin/python tools/shots.py story 0.15 0.45 0.85
.venv/bin/python tools/shots.py page project/mechanism/
```

Run the preview server first. Screenshots go to gitignored `tools/shots/`.
Set `SITE` to override the helper's default URL. Chromium may need OS libraries;
the helper also supports the previous machine-local `~/.local/pwlibs` directory.

A static build is useful for checking production asset paths without live reload:

```bash
mkdir -p /tmp/evolution-preview
ln -sfn "$PWD/site" /tmp/evolution-preview/2026_Evolution_Suisse_2026
python3 -m http.server 8765 --bind 127.0.0.1 --directory /tmp/evolution-preview
```

Open `http://127.0.0.1:8765/2026_Evolution_Suisse_2026/` after building.

Check visual changes at desktop, 390px and 320px widths, with JavaScript
disabled on the homepage and `prefers-reduced-motion: reduce`. For Mechanism,
check all three acts, reverse scrolling, resizing and still views. Check search
on a nested page, mobile navigation/focus, local image/JSON responses and console
errors. Broken molecular assets should leave the existing structure fallback;
broken shell data should leave the homepage SVG shell.

The last implementation passed strict builds, CI's external dependency check,
these browser/layout checks, identical reverse-scroll frames, shared asset
request caching, and forced asset-failure checks. Ad hoc Playwright scripts
were under `/tmp/check_evolution.py`, `/tmp/check_cargo.py` and
`/tmp/review_evolution.py`; they are not committed tests and may disappear.

Common pitfalls:

- Use Playwright `wait_until='load'` against `mkdocs serve`; live reload can
  prevent `networkidle`. Static-server previews can use `networkidle`.
- `element.screenshot()` scrolls the target into view, changing animation
  progress. Use a viewport clip; `tools/shots.py` already does this.
- Search script paths were fixed in `base.html`. Preserve
  `{{ script|script_tag }}` for `config.extra_javascript` rather than applying
  a second `|url` transformation. Keep `base_url` defined before search starts.
  A nested-page search 404 is a regression to investigate, not something to ignore.
- Keep `site_url`, `theme.name: null`, `theme.static_templates: [404.html]`
  and the explicit search plugin in `mkdocs.yml`.
- Fonts, scripts, styles and images must be locally hosted. CI checks external
  runtime dependencies. Outbound citation links are fine.
- Published report figures in `docs/img/` are scientific records. The cargo
  redesign updated overview/animation illustrations, not those report images.

## Commit and deploy

The user requested logical commits and pushes to rebuild. Check authentication
with `gh auth status`; the working account during this session was OliverNagl.
Do not record tokens in documentation or commit generated `site/`, caches,
Python environments or screenshots.

```bash
git status --short
git add <explicit changed files>
git commit -m "Describe the concrete change"
git push origin main
gh run list --limit 5
```

A main push runs `.github/workflows/ci.yml`: strict build and dependency check,
then `mkdocs gh-deploy --force` publishes generated files to `gh-pages`.
GitHub subsequently runs **pages build and deployment**. Check both workflows
and verify the live page/new assets before reporting that the change is live.
Use `gh run view <id>` or `gh run watch <id> --exit-status` to inspect failures.
A hosted-runner acquisition error is infrastructure failure; inspect/retry the
failed run rather than changing site code without evidence.

Recent changes, oldest first:

| Commit | Change |
| --- | --- |
| `4c4172e` | Shared Plex typography, navigation and figure instance fixes |
| `d334247` | Bird's-eye homepage; walkthrough moved to Mechanism |
| `6bd3c9d` | Overview documentation and screenshot tooling |
| `665c185` | Isolated soft ChimeraX Cas9 and guide renders |
| `5b020a7` | Delivery graphic simplification and current headline |
| `773e707` | Calibrated protein–RNA complex assets and rendering pipeline |
| `a654620` | Shared renders across all overview/Mechanism figures, provenance and narrow-screen header fix |

All requested visual work was completed and deployed before this handoff.
Further layout, illustration or copy changes should follow the user's next
request; older speculative to-do lists are not outstanding commitments.
