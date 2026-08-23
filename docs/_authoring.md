---
title: Authoring guide
---

# Authoring guide

Everything on this page is copy-paste. This page is deliberately kept out of the
navigation (`not_in_nav` in `mkdocs.yml`) — it is for the team, not for judges.

## Running the site locally

```bash
pip install -r requirements.txt
mkdocs serve          # http://127.0.0.1:8000, live-reloads on save
mkdocs build --strict # what CI runs — fails on broken links
```

`mkdocs serve` watches `theme/` as well as `docs/`, so editing CSS or JS
reloads the page just like editing Markdown.

## Where things live

| You want to change | Edit |
| --- | --- |
| Page text | `docs/**/*.md` |
| Which pages exist, and their order | the `nav:` block in `mkdocs.yml` |
| Colours, fonts, spacing | `theme/css/tokens.css` — and nothing else |
| A figure's behaviour | `theme/js/figures/<name>.js` |
| Page layout | `theme/main.html`, `landing.html`, `home.html` |

Use `--edge` (not `--rule-strong`) for the border of anything clickable:
`--rule-strong` is a decorative hairline at 1.9:1, below the 3:1 that WCAG
requires for a control's boundary.

**Never put a raw colour value anywhere but `tokens.css`.** Figures read the
palette from those custom properties at runtime, so changing a token updates
the diagrams too. Hard-coding a hex breaks that link silently.

## Front matter

Every page may declare:

```yaml
---
title: Plasmids              # overrides the nav title
summary: One line.           # shown on the parent section's cards
description: For <meta>.     # falls back to the site description
template: landing.html       # only for section index pages
---
```

## Figures

Drop a figure into any page like this:

```markdown
<figure class="scrollyfig wide" data-figure="act3-rescue" markdown>

**Fig 1.** Caption text, with **markdown**, [links](../index.md) and footnotes.

</figure>
```

Three rules, and they are the only ways this goes wrong:

1. **Blank line after the opening tag and before the closing tag.** Without
   them, the caption is treated as raw HTML and stops rendering as Markdown.
2. **Do not indent the block.**
3. `data-figure` must match a registered id (see below). A typo fails soft —
   you get the caption with no drawing, and nothing else on the page breaks.

Add `wide` for a figure that overflows the text column, or `full` for
edge-to-edge. Omit both to keep it inside the measure. The drawing area is 4:3
by default — override it with `data-ratio="16/9"`.

Registered figures: `hero-shell`, `system-map`, `act1-hypermutation`,
`act2-silencing`, `act3-rescue`, `act4-enrichment`.

### Writing a new figure

Create `theme/js/figures/my-figure.js`:

```javascript
import { norm, easeOut, el } from '../util.js';

export default {
  id: 'my-figure',
  needs: 'svg',                  // 'svg', 'canvas', or 'svg canvas'
  viewBox: '0 0 100 100',

  mount(ctx)  { /* build nodes once; ctx.svg / ctx.c2d are ready */ },
  render(t, ctx) { /* t is 0..1 — set attributes from it */ },
  resize(ctx) { /* optional */ },
  destroy()   { /* optional */ },
};
```

`ctx` gives you:

| | |
| --- | --- |
| `ctx.root` | the element you annotated — read your own `data-*` attributes here |
| `ctx.frame` | the sized drawing surface |
| `ctx.svg` | an `<svg>` in the frame, if `needs` includes `'svg'` |
| `ctx.canvas`, `ctx.c2d` | a DPR-corrected 2D context, if `needs` includes `'canvas'` |
| `ctx.rect` | the frame's current size |
| `ctx.palette` | the `--enc-*` colours, read from `tokens.css` |

For canvas figures, call `viewTransform(ctx.c2d, ctx.rect)` first and then draw
in a 0–100 coordinate box; it handles device pixel ratio and centring. One unit
is roughly 7 px on a desktop stage, so keep stroke widths under ~1.5.

Then add it to `theme/js/figures/index.js`. That is the whole registration step.

`render(t)` **must be pure**: calling `render(0.4)` must always look the same,
whether you arrived from 0.1 or from 0.9. Never call `Math.random()` — use the
seeded `rng()` from `util.js`. This is what makes reverse-scrolling, resizing
and the reduced-motion static render work without any extra code.

## Components

```markdown
!!! note "Optional title"
    Admonition. Types: note, tip, protocol, warning, caution, result, example.

??? caution "Collapsed by default"
    Same types, but foldable.

=== "Tab one"
    Content.
=== "Tab two"
    Content.

<span class="chip">pES-Mut</span>   plasmid / construct token

<ul class="metrics wide">
  <li><b>60</b><span>subunits per shell</span></li>
</ul>
```

Tables are wrapped in a scroll container and made sortable automatically — just
write normal Markdown tables.

Maths uses `$inline$` and `\[display\]`. MathJax is self-hosted and only loads
on pages that actually contain maths.

## Things not to do

- Don't add a CDN `<script>` or `<link>`. The site currently has **zero**
  external runtime dependencies, which means it renders offline and cannot be
  broken mid-judging by someone else's outage. Vendor the file into
  `theme/js/vendor/` instead.
- Don't remove the `{% for script in extra_javascript %}` loop from
  `base.html` — MkDocs' search plugin injects itself through it.
- Don't add a `plugins:` entry without keeping `- search` in the list;
  declaring the key replaces the default and search disappears silently.
