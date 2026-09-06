/* ═══════════════════════════════════════════════════════════════════════════
   annotate.js — labels and leader lines for the graphite figures.

   A drawing of a cell is only worth having if the reader can name what they
   are looking at. These are the annotations an engineer writes onto a plate:
   the part named, a thin line to the thing it names, and nothing else.

   ── Why the text is set, not "handwritten" ───────────────────────────────
   A synthetic handwriting font on top of procedurally drawn pencil reads as
   two different fakes arguing. Real technical drawings pair a drawn figure
   with SET type, so the labels use the site's own mono face at low contrast —
   drawn twice with a sub-pixel offset, which is what softens them enough to
   sit on the paper rather than float above it.

   Everything takes an alpha so a figure can fade a label in and out with the
   thing it points at; a label whose subject is dimmed must dim with it, or the
   annotation layer ends up shouting over the drawing.
   ═══════════════════════════════════════════════════════════════════════════ */

import { stroke } from './pencil.js';

const FACE = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

/** Canvas takes no letter-spacing, so wide-tracked labels are set per glyph. */
function tracked(g, text, x, y, track) {
  if (!track) { g.fillText(text, x, y); return; }
  let cx = x;
  for (const ch of text) {
    g.fillText(ch, cx, y);
    cx += g.measureText(ch).width + track;
  }
}
function trackedWidth(g, text, track) {
  let w = 0;
  for (const ch of text) w += g.measureText(ch).width + track;
  return w - (track || 0);
}

/**
 * A label.
 *
 * @param opt.align   'left' | 'right' | 'centre' — which end sits at x
 * @param opt.track   letter-spacing in draw units
 * @param opt.caps    render uppercase (for part names, not gene names)
 * @returns [x0, x1] the label's horizontal extent, so a caller can hang a
 *          leader line off the correct end without measuring it again.
 */
export function label(g, text, x, y, opt = {}) {
  const { size = 15, alpha = 0.62, colour = '#3A3733', align = 'left',
          track = 0, caps = false, weight = 400 } = opt;
  const s = caps ? text.toUpperCase() : text;

  g.save();
  g.font = `${weight} ${size}px ${FACE}`;
  g.textBaseline = 'middle';
  const w = trackedWidth(g, s, track);
  const x0 = align === 'right' ? x - w : align === 'centre' ? x - w / 2 : x;

  g.fillStyle = colour;
  // Two passes a fraction apart: the same trick as a pencil stroke's multiple
  // passes, and the reason the type sits down into the paper.
  g.globalAlpha = alpha * 0.72;
  tracked(g, s, x0, y, track);
  g.globalAlpha = alpha * 0.5;
  tracked(g, s, x0 + 0.35, y + 0.3, track);
  g.globalAlpha = 1;
  g.restore();
  return [x0, x0 + w];
}

/** A thin drawn line to the thing being named, with a small open arrowhead. */
export function leader(g, from, to, opt = {}) {
  const { alpha = 0.5, colour = '#3A3733', width = 0.9, arrow = 3.4,
          seed = 1, bend = 0 } = opt;
  if (alpha <= 0.01) return;

  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  // A slight bow keeps the leader from looking like a CAD line.
  const mid = [(from[0] + to[0]) / 2 - dy / len * bend,
               (from[1] + to[1]) / 2 + dx / len * bend];
  stroke(g, [from, mid, to], {
    passes: 2, width, alpha, wobble: 0.55, taper: 0.55, seed, colour,
  });

  if (arrow > 0) {
    const a = Math.atan2(dy, dx), sp = 0.42;
    for (const k of [-1, 1]) {
      stroke(g, [to, [to[0] - Math.cos(a + k * sp) * arrow,
                      to[1] - Math.sin(a + k * sp) * arrow]], {
        passes: 2, width, alpha, wobble: 0.3, taper: 0.4,
        seed: seed + (k > 0 ? 3 : 5), colour,
      });
    }
  }
}

/**
 * Label plus leader, laid out from the label's own side.
 *
 * `at` is where the text goes and `to` is what it points at. The leader starts
 * from whichever end of the text faces the subject, with a small gap, so the
 * line never collides with a glyph.
 */
export function callout(g, text, at, to, opt = {}) {
  const { alpha = 0.62, size = 15, colour = '#3A3733', track = 0, caps = false,
          gap = 7, seed = 1, bend = 0, arrow = 3.4, weight = 400 } = opt;
  if (alpha <= 0.01) return;

  const align = to[0] < at[0] ? 'left' : 'right';
  const [x0, x1] = label(g, text, at[0], at[1], {
    size, alpha, colour, align: align === 'left' ? 'left' : 'right', track, caps, weight,
  });

  const startX = to[0] < at[0] ? x0 - gap : x1 + gap;
  leader(g, [startX, at[1]], to, {
    alpha: alpha * 0.8, colour, seed, bend, arrow,
    width: Math.max(0.7, size * 0.055),
  });
}

/**
 * A colour key. Used where the drawing carries hue that would otherwise be
 * unexplained — a red mark and a green mark mean nothing without it.
 */
export function key(g, entries, x, y, opt = {}) {
  const { size = 14, alpha = 0.75, colour = '#3A3733', gap = 20, dash = 15 } = opt;
  if (alpha <= 0.01) return;
  entries.forEach(([text, hue], i) => {
    const yy = y + i * gap;
    stroke(g, [[x, yy], [x + dash, yy]], {
      passes: 3, width: size * 0.18, alpha, wobble: 0.4, taper: 0.3,
      seed: 900 + i * 17, colour: hue,
    });
    label(g, text, x + dash + 8, yy, { size, alpha: alpha * 0.85, colour });
  });
}
