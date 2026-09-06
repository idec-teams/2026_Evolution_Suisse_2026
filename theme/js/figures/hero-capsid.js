/* ═══════════════════════════════════════════════════════════════════════════
   hero-capsid.js — the shell turns, then opens on what it is holding.

   The sequence runs on a clock, not on scroll. Scroll-linking was the first
   instinct and it is wrong here: the hero is 84vh tall and unpinned, so by the
   time a scroll-driven opening had finished it would be off the top of the
   screen and nobody would ever see what was inside. Pinning the hero to buy
   the runway would push the scroll story most of a screen further down to pay
   for one animation.

   So: the shell turns closed for a few seconds, opens over three, and stays
   open. The first painted frame is the intact shell — which is what a link
   preview and a skimming reader get — and the resting state is the informative
   one, a repressor sitting inside a compartment. The sequence re-arms when the
   hero scrolls back into view, so it can be watched again.

   The complex is drawn with the SAME view matrix as the shell, at the real
   Angstrom scale both structures ship in. An 89 A complex inside a 190 A shell
   is not a composition decision — it is roughly one repressor per compartment,
   which is the point the hero is making.
   ═══════════════════════════════════════════════════════════════════════════ */

import { STYLE, createCapsid, viewMatrix } from '../capsid.js';
import { createParts, REPRESSOR } from '../parts.js';
import { capsidData, complexData } from '../structures.js';
import { grain } from '../pencil.js';
import { key } from '../annotate.js';
import { clamp, lerp, TAU, easeInOut, smoothstep, reducedMotion, palette } from '../util.js';

const SECONDS_PER_TURN = 44;
const HOLD_CLOSED = 4.5;   // seconds of intact shell before it opens
const OPEN_OVER   = 3.2;   // seconds the opening takes
/** Radius the capsid data is expressed against; the complex shares the scale. */
const SHELL_R = 190;

export default {
  id: 'hero-capsid',
  needs: 'canvas',

  mount(ctx) {
    this.ctx = ctx;
    this.shell = null;
    this.complex = null;
    this.phase = 0;
    this.t0 = null;              // set on first paint, reset when re-armed
    const pal = palette();
    this.style = Object.assign({}, STYLE, { colour: pal.ink });
    this.hues = { clp: pal.mutate, boxb: pal.cargo };

    // Re-arm on re-entry so the sequence can be watched more than once, and so
    // it does not play to an empty room while the reader is further down.
    this.io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) this.t0 = null;
    }, { threshold: 0.55 });
    this.io.observe(ctx.frame);

    Promise.all([capsidData(), complexData()]).then(([cd, xd]) => {
      if (cd) this.shell = createCapsid(cd);
      if (xd) this.complex = createParts(xd, REPRESSOR);
      // Reduced motion gets the end state, not the start: a still frame of an
      // opened shell says what the figure is for; a still closed sphere does not.
      if (reducedMotion()) this.paint(0.55, 1);
      else this.start();
    });
  },

  start() {
    if (this.raf) return;
    let last = performance.now();
    const loop = now => {
      this.raf = requestAnimationFrame(loop);
      this.phase += (now - last) / (SECONDS_PER_TURN * 1000) * TAU;
      last = now;
      if (this.t0 === null) this.t0 = now;
      this.paint(this.phase, clamp(((now - this.t0) / 1000 - HOLD_CLOSED) / OPEN_OVER));
    };
    this.raf = requestAnimationFrame(loop);
  },

  paint(yaw, open) {
    const { c2d: g, rect } = this.ctx;
    if (!g || !this.shell) return;
    const W = rect.width, H = rect.height;
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    g.restore();
    g.lineCap = 'round';
    g.lineJoin = 'round';

    const st = this.style;

    // One camera, two structures. The scene scales up as the shell opens — the
    // shell and the complex share the scale throughout, so the size
    // relationship between them is never misstated; the frame just moves in.
    const S = Math.min(W, H) * 0.40 * lerp(1, 2.3, smoothstep(clamp(open)));

    // The shell opens and thins at once: subunits travelling outward also lose
    // their ink, so the drawing empties instead of turning into a scatter plot.
    // Subunits travel out along their own radial vectors and lose ink as they
    // go, so the drawing empties rather than becoming a scatter of debris. The
    // throw is capped at 0.55 — far enough to read as coming apart, near enough
    // that the outermost subunits stay inside the frame.
    const e = easeInOut(clamp(open));
    this.shell.draw(g, W, H, yaw, st, {
      scale: S, explode: e * 0.5, alpha: lerp(1, 0.28, smoothstep(clamp(open * 1.15))),
    });

    // The complex is drawn on as the shell clears, not cross-faded with it:
    // it should look like something that was always in there.
    if (this.complex) {
      const reveal = smoothstep(clamp((open - 0.14) / 0.6));
      this.complex.draw(g, viewMatrix(yaw, st.tilt), st, {
        scale: S / SHELL_R, cx: W / 2, cy: H / 2, alpha: reveal, hues: this.hues,
      });

      // The two grips are the only colour in the hero. A key rather than
      // leader lines: the complex is turning, so anything anchored to it would
      // swing around the frame, and neither grip is in the structure anyway —
      // what is marked is where each one attaches.
      key(g, [['CLP fusion site', this.hues.clp], ['boxB site', this.hues.boxb]],
          Math.max(14, W * 0.045), H - Math.max(38, H * 0.09),
          { size: Math.max(11, Math.min(13, W * 0.026)), alpha: reveal * 0.8,
            colour: st.colour, gap: 19, dash: 15 });
    }

    grain(g, W, H, { alpha: 0.04 });
  },

  // The standalone driver's visibility-derived t is not what this figure wants;
  // it owns its own clock. Redraw on demand for the static path only.
  render() { if (!this.raf && this.shell) this.paint(0.55, 1); },

  resize(ctx) { this.ctx = ctx; if (!this.raf) this.render(); },
  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.io?.disconnect();
  },
};
