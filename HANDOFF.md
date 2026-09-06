# Handoff — graphite figures

Everything on this branch is on `graphite-figures`, seven commits ahead of `main`,
nothing pushed. Read this before touching `theme/js/`.

The site's figures were rebuilt from stylised drawings into pencil renderings of
real deposited structures. The homepage and two subsystem pages are done. The
rest of the site is not. This file tells you how the machinery works, how to
make the tweaks that are most likely to be asked for, and what is left.

---

## 1. Run it

```bash
cd 2026_Evolution_Suisse_2026
.venv/bin/mkdocs serve -a 0.0.0.0:8000 --watch theme
```

Open **http://localhost:8000/2026_Evolution_Suisse_2026/** — note the subpath;
`site_url` in `mkdocs.yml` puts the site under the repo name and a bare
`localhost:8000` only redirects.

`--watch theme` is not optional for this work. Without it mkdocs watches only
`docs/` and `mkdocs.yml`, so your figure edits will not reload and you will
think your change did nothing.

To look at what you changed:

```bash
.venv/bin/python tools/shots.py hero
.venv/bin/python tools/shots.py story 0.15 0.45 0.85
.venv/bin/python tools/shots.py page project/mechanism/
```

PNGs land in `tools/shots/`. **Actually open them.** Every real mistake in this
work was invisible in the code and obvious in a screenshot.

### Rebuilding the structure data

Only needed if you change a `tools/structures/build_*.py`. The build env is
gitignored; recreate it with:

```bash
python3 -m venv tools/.venv-build && tools/.venv-build/bin/pip install numpy scipy
tools/.venv-build/bin/python tools/structures/build_capsid.py
tools/.venv-build/bin/python tools/structures/build_complex.py
tools/.venv-build/bin/python tools/structures/build_mutat7.py
```

The scripts re-download from RCSB into `tools/structures/cache/` if it is empty.
The JSON they write into `theme/data/` **is committed** — a clone builds the
site without any of this.

---

## 2. How it fits together

```
tools/structures/*.py     offline, dev-only. PDB -> theme/data/*.json
        |
theme/data/*.json         committed. 21 KB gzipped total.
        |
theme/js/structures.js    one cached fetch per file, shared by all figures
        |
theme/js/pencil.js        the graphite look: strokes, hatching, grain, hulls
theme/js/capsid.js        draws the shell / capsomers   (uses pencil)
theme/js/parts.js         draws repressor + polymerase  (uses pencil)
theme/js/annotate.js      labels, leader lines, colour keys (uses pencil)
        |
theme/js/figures/*.js     the actual figures on the page
        |
theme/js/figure.js        the mount/render(t)/resize/destroy contract
theme/js/scrolly.js       drives the homepage scroll story
```

### The one rule that makes everything work

**`render(t)` must be a pure function of `t`.** Calling `render(0.4)` twice must
produce the same picture, and reaching 0.4 by scrolling backwards from 0.9 must
look identical to reaching it forwards. No state between frames, no
`Math.random()` — use `rng(seed)` from `util.js`.

This is what gives you reverse-scrubbing, resize, and reduced-motion for free.
If you find yourself wanting to store "what happened last frame", you are about
to break the figure. Derive it from `t` instead.

### The structure files

| File | Source | Contains |
|---|---|---|
| `capsid.json` | 6NJ8 | 4 chain templates, 60 icosahedral operators, penton/hexon label per subunit, icosahedron edges |
| `complex.json` | 5F9R | Cas9 REC + NUC lobes, sgRNA, target duplex, `clp_site`, `boxb_site` |
| `mutat7.json` | 1MSW | T7 RNAP, template + non-template DNA, nascent RNA |

The capsid ships templates and operators rather than 240 baked subunits. The
browser folds the view rotation into each operator once per frame, so every
structural point after that costs one matrix-vector product. **Do not "simplify"
this into pre-transformed coordinates** — it would be ~8× larger and slower.

All three are in **Ångström on one shared scale**. That is why the shell is the
right size around the repressor. If you add a structure, keep it in Ångström and
centre it the same way.

---

## 3. Making the tweaks you are most likely to be asked for

### Label positions in the cell scene

All in `theme/js/figures/cell-scene.js`, in `annotate()` (around line 260-330).
Coordinates are in a **virtual 1000 × 620 space**, not pixels — the scene is
fitted into whatever size the stage gives it. Origin top-left.

Current calls, with their anchor points:

| Line | Label | Position |
|---|---|---|
| ~275 | `Mutation plasmid` | centred at `(MUT.x, 166)` |
| ~277 | `Selection plasmid` | centred at `(SEL.x, 248)` |
| ~281 | `encapsulin cassette` | text at `[432, 196]` |
| ~284 | `kanR` | text at `[612, 466]` |
| ~290 | `MutaT7` | text at `[432, 252]`, arrow tracks the moving enzyme |
| ~297 | `dCas9·sgRNA` | text at `[rx - 150, ry - 92]`, both move |
| ~304 | `encapsulin pentamer/hexamer` | text at `[238, 470]` |
| ~312 | `240 subunits, T=4` | text at `[296, 502]` |
| ~323-327 | colour key, three rows | `(58, 548)`, `(58, 571)`, `(58, 594)` |

`callout(g, text, at, to, opt)` puts the text at `at` and an arrow into `to`. It
picks which side the leader leaves from automatically: if `to` is left of `at`,
the text runs rightwards and the line leaves from its left edge. So to flip a
label to the other side of its subject, move `at` across — you do not set an
alignment.

Things the layout must stay clear of, which is why these are hand-placed
literals and not computed:

- the two plasmid circles: `MUT` (x 162–354, y 186–378), `SEL` (x 694–862, y 272–440)
- the assembled shell in act 03: a disc of radius ~162 centred on `HUB` = `(498, 300)`
- `SEATS` — the seven capsomer positions, which are also hand-placed for this reason
- the frame: keep text inside x 40–960, y 90–600

**After moving any label, screenshot all three acts.** Two of them track moving
subjects, so a position that is clear in act 01 can collide in act 03.

### Act timing

Two separate things, and people confuse them.

**When an act starts** is CSS: `--scrolly-focus` in `theme/css/home.css` (line
~91 desktop, ~330 tablet, ~350 mobile). It is the fraction of viewport height
the story "reads from". **Larger = acts start earlier**, because a panel's top
crosses a lower line sooner as it scrolls up. Desktop is currently `0.58`, raised
from 0.42 because the animation felt behind the text.

**How fast things happen inside an act** is in `cell-scene.js` `paint()`:

| Line | Name | Ramp | What it drives |
|---|---|---|---|
| ~168 | `walk` | `norm(t2, 0.02, 0.68)` | MutaT7 along the cassette |
| ~187 | `arrive` | `norm(t1, 0.02, 0.40)` | repressor onto the gene |
| ~188 | `close` | `norm(t3, 0.03, 0.42)` | repressor off the gene to the hub |
| ~201 | `arrival` | `norm(t3, 0.06, 0.55)` | capsomers flying home |
| ~203 | `mut` | `norm(p, 0.37, 0.67)` | mutations accumulating (× `MUT_MAX`) |
| ~226 | `build` | `norm(t3, 0.12, 0.58)` | the other 35 capsomers filling in |

**Nothing may finish later than about t = 0.6 of its act.** The sticky stage
releases before the last panel's span ends, so an animation timed to t = 1 plays
its climax after the drawing has scrolled off the top of the screen. This
already caught me once.

### The graphite style

`STYLE` in `theme/js/capsid.js` (~line 52). Figures override individual keys and
never restate the object, so a change here reaches every drawing.

```js
passes: 3, width: 1.95, alpha: 1, wobble: 0.75,   // the line
hatchMax: 0, hatchGap: 2.4,                        // shading (off)
k: 0.76, far: 0.5, rim: 0,                         // subunit size, far side, contour
outline: 0.18,   // subunit silhouette — nearly off; the traces carry the drawing
trace: 1,        // real Ca backbone paths
pentonInk: 1,    // >1 draws the 12 five-folds harder than the 30 hexamers
capRing: 0,      // per-capsomer outlines
icosa: 1,        // construction cage through the pentamer centres
```

These values were chosen by the team from a style-frame comparison. **Do not
change `STYLE` to fix one figure** — override the key in that figure's own call
instead. The most likely legitimate request is *"too crowded in the cell
scene"*: lower `far` for that scene only (it is `0.5`, meaning a strong ghost of
the far hemisphere) by passing `far` in the scene's own style object, leaving the
hero alone.

To rebuild the comparison page after changing `pencil.js` or `capsid.js`:

```bash
tools/.venv-build/bin/python tools/build_study.py tools/sandbox/study.html
```

It inlines the real modules, so what you look at is what the site runs.

### Colour

Only three marks in the whole site are not graphite, and each takes the token of
the molecule it sits on. Set in `cell-scene.js` `mount()` and `hero-capsid.js`
`mount()`:

```js
clp:  pal.cas      // --enc-cas    CLP fusion site — it is on dCas9
boxb: pal.sgrna    // --enc-sgrna  boxB site — it is on the guide
mut:  pal.mutate   // --enc-mutate deamination events
```

Red belongs to mutation because `--enc-mutate` is literally that. If you are
asked to add another colour, take it from `theme/css/tokens.css` and make sure
no hue ends up meaning two things — the key has to stay unambiguous.

Neither grip is in 5F9R: the cargo-loading peptide is a fusion to Cas9's
C-terminus and boxB is appended to the guide's 3′ end. What is coloured is the
**attachment site**, and the labels say so. Do not relabel them "CLP" and "boxB"
as if the structure contained them.

### Hero timing

`theme/js/figures/hero-capsid.js`, lines 30-34: `SECONDS_PER_TURN = 44`,
`HOLD_CLOSED = 4.5`, `OPEN_OVER = 3.2`. The zoom is `lerp(1, 2.3, ...)` at
line ~97 and the throw is `explode: e * 0.5` at ~107.

The sequence runs on a clock, not on scroll. This was tried the other way and it
is wrong: the hero is 84vh and unpinned, so a scroll-driven opening finishes off
the top of the screen. If someone asks for it to be scroll-driven, they are
asking for a pinned hero, which pushes the scroll story most of a screen further
down. Say so before building it.

---

## 4. Traps

Every one of these cost me time.

- **`element.screenshot()` scrolls the element into view.** In a scroll-driven
  story it changes the position you are trying to photograph. Use a clip box.
  `tools/shots.py` already does.
- **`wait_until='networkidle'` never fires against `mkdocs serve`** — the
  livereload socket stays open. Use `'load'`.
- **`mkdocs serve` 404s on `/search/main.js`** from subpages. Pre-existing, path
  handling in serve only, absent from a real build. Ignore it; verify against
  `mkdocs build` output if unsure.
- **Rotation order matters for symmetry.** `order = round(360/angle)` misfiles a
  144° rotation as 2-fold, which silently corrupts the capsomer lattice.
  `build_capsid.py` tests the angle directly. The check that it is right: 12
  pentamers × 5 + 30 hexamers × 6 = 240, asserted in the script.
- **Jitter belongs to the structure, not the screen.** Each point carries a fixed
  3-D offset that is projected with it. Offsetting at draw time makes the capsid
  boil. If you add geometry, follow the same pattern (see `pencil.js` header).
- **Backbone traces are near-hemisphere only.** An encapsulin protomer's arms
  reach across its neighbours; 240 overlapping traces plus a far-side ghost is a
  hairball.
- **CI blocks external runtime dependencies.** `.github/workflows/ci.yml` fails
  the build on any `<script src=https://…>`, external stylesheet, or CSS `url()`
  outside a small allowlist. No CDNs, no webfonts from Google, no analytics.
  Everything ships with the site.

---

## 5. What is left

Roughly in the order I would do it.

### 5.1 `system-map.js` — the clickable subsystem diagram (highest priority)

`theme/js/figures/system-map.js`, shown below the scroll story on the homepage.
It is **the last thing on the page still drawn in the old colour vocabulary** —
copper, indigo, green and red fills against an otherwise entirely graphite page.
It looks like it belongs to a different site, because it does.

It is SVG, not canvas, and it must stay that way: each hotspot is a real `<a>`
wrapping its region, so it is focusable, announced, right-clickable and
middle-clickable with no JS. **Do not convert it to canvas** — you would lose all
of that and gain nothing. Destinations come from `data-hotspots` in
`theme/home.html`; the same links are also listed as plain text beside it, and
that list must stay.

What to do: keep the geometry (`REGIONS` at ~line 34, `VB` at ~line 28) and the
link structure exactly as they are, and restyle the four node glyphs to graphite.
`pencil.js` is canvas-only, so you cannot call `stroke()` here. Two options:

1. **Set SVG paths to match the pencil idiom** — 2-3 near-coincident paths per
   edge with slight offsets, `--ink` at ~0.6 alpha, no fills. Cheapest, and
   consistent enough at this size.
2. **Draw the four glyphs from the real structures** — a small capsid for
   `shell`, the repressor for `selection`, the polymerase for `mutat7` — by
   sampling the same JSON into SVG polylines at mount. More work, but it makes
   the map show the same objects as the rest of the page.

I would do (1) first and see whether it is enough. Either way `.systemmap__figure`'s
`aspect-ratio` in `home.css` must keep matching `VB`.

### 5.2 An enrichment figure

`docs/engineering/cycles.md` used to carry a population-distribution plot
(round-over-round enrichment). Its module was deleted with the old act set and
the figure block was removed; **the prose is unchanged and now runs without an
illustration**. Rebuild it in graphite if the team wants it — it is a chart, not
a structure, so it wants `pencil.js` strokes over a plain axis rather than
anything from `theme/data/`. Read `dataviz` guidance before drawing axes.

### 5.3 Figures for pages that have none

Only three pages carry figures. These have no illustration at all and are the
obvious candidates, in order of how much a drawing would help:

| Page | Words | What a figure would show |
|---|---|---|
| `docs/project/design.md` | 717 | the OR gate — two grips on one complex, either sufficient |
| `docs/engineering/constructs.md` | 439 | cassette architecture, T7 promoter → ORF → terminator |
| `docs/project/results.md` | 708 | whatever the data supports; check with the team first |
| `docs/project/background.md` | 711 | encapsulin size series (T=1/T=3/T=4) at true relative scale |

Two cheap wins first: `cell-scene` already supports `data-act-index="0|1|2"`, so
any page discussing one act can reuse the existing drawing with one line of
Markdown. And a `design.md` figure could be the repressor from `complex.json`
with both grips called out — `parts.js` and `annotate.js` already do all of it.

Figure syntax and the three rules that make it work are in `docs/_authoring.md`.

### 5.4 Tone pass on the rest of the site

Done: `docs/index.md`, the three homepage panels in `theme/home.html`,
`docs/project/mechanism.md` (~1,150 words).

Not done: ~8,300 words. Largest first — `protocols.md` 884, `biosafety.md` 792,
`design.md` 717, `background.md` 711, `results.md` 708, `notebook.md` 652,
`future.md` 503, `plasmids.md` 454, `constructs.md` 439, `attributions.md` 413,
`cycles.md` 382, `data.md` 308, `human-practices.md` 211, plus the short index
pages.

The brief is *more technical, less sensational, fewer words*. Concretely, cut:

- aphoristic openers — "Directed evolution is only as good as its selection"
- self-congratulating section titles — "A second, quieter benefit"
- lines that tell the reader how to feel about a fact — "That is worth more than
  it sounds", "This is the single most consequential decision"
- dramatised consequences — "does not merely score poorly; it does not survive"
- rhetorical closers — "and the survivors are the library"

Keep every number, citation, footnote, table and caveat. The two rewritten pages
lost about 7% of their words and no content; that is the right ratio. Compare
`git show 379a9e1` for the register the team approved.

---

## 6. Conventions to honour

- **Comments explain why, not what.** The existing headers document decisions
  that were made against an obvious alternative — why jitter is structural, why
  the hero is clock-driven, why traces are near-side only. Match that: if you
  reverse one of those decisions, replace the comment with your reasoning, and if
  you add a non-obvious one, write it down.
- **Zero runtime dependencies.** See the CI note above.
- **Reduced motion is a real path, not a fallback.** Every figure must render a
  meaningful still frame under `prefers-reduced-motion: reduce` — the end state,
  not a blank canvas. Test it: `tools/shots.py` does not, but Playwright takes
  `reduced_motion='reduce'` on the context.
- **Fail soft.** An unknown `data-figure` id logs a warning and leaves the
  caption; a missing JSON file leaves an empty frame. Keep it that way — a figure
  must never be able to break the page it is on.
- **Molecular sizes are to scale relative to each other; the cell and plasmids
  are not.** The captions say so. If you add a molecule, put it through the same
  `ANGSTROM` constant. If you add a schematic element, do not imply it is scaled.

## 7. Commits on this branch

The figure work, oldest first:

```
1eafe70  Add structure pipeline: real coordinates for every molecule on the site
247dc52  Add the graphite renderer
2fa929f  Replace the homepage figures with one continuous pencil drawing
379a9e1  Tighten the front page and mechanism prose
3d22921  Annotate the drawings, and start the acts earlier
c27cfc5  Assemble the shell from the capsomers the reader has been watching
```

...plus the commit that added this file. Each of the six stands on its own: the
pipeline verifies without the renderers, the renderers work without the figures,
and the prose commit touches no code.
