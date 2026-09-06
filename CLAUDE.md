# Evolution Suisse 2026 — iDEC wiki

MkDocs site with a bespoke theme. Pure Python build, **zero runtime
dependencies** — CI fails the build on any external script, stylesheet or CSS
`url()` (see `.github/workflows/ci.yml`).

```bash
.venv/bin/mkdocs serve -a 0.0.0.0:8000 --watch theme
```

Served at `/2026_Evolution_Suisse_2026/`, not at the root. `--watch theme` is
required or theme edits will not reload.

## Before working on figures

**Read `HANDOFF.md` first.** The figures are pencil renderings of real deposited
structures (6NJ8, 5F9R, 1MSW) built by `tools/structures/*.py` into
`theme/data/*.json`. `HANDOFF.md` covers the architecture, how to tweak labels,
timing and style, the traps that will otherwise cost you an afternoon, and what
work is outstanding.

The core rule: **every figure's `render(t)` is a pure function of `t`** — no
state between frames, no `Math.random()` (use `rng(seed)` from `util.js`). That
is what makes reverse-scrolling, resizing and reduced-motion work.

Look at your changes: `.venv/bin/python tools/shots.py story 0.15 0.45 0.85`
writes PNGs to `tools/shots/`.

## Writing

More technical, less sensational, fewer words. Keep every number, citation,
footnote and caveat. `docs/_authoring.md` is the figure and Markdown reference.
