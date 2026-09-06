/* ═══════════════════════════════════════════════════════════════════════════
   cell-scene.js — one cell, drawn once, read three times.

   The old story cut between four unrelated diagrams. This one draws a single
   MutaT7 cell — both plasmids, the polymerase, the repressor, loose capsid
   protomers — and then moves the reader's attention through it by taking ink
   away from everything that is not the current subject. Nothing enters or
   leaves; the drawing is continuous, so the reader keeps their bearings and
   can see that the three acts are happening in the same place.

     01 Silence      dCas9·sgRNA clamps onto kanR, inside the gene body
     02 Diversify    MutaT7 tracks the encapsulin cassette, leaving mutations
     03 Encapsulate  loose protomers close around the repressor

   ── Scale ────────────────────────────────────────────────────────────────
   The cell and the plasmids are schematic: a real 1 µm cell would leave the shell
   a few pixels across. What IS true is the relative scale of the molecules —
   the repressor, the polymerase and the capsid are all drawn from Angstrom
   coordinates against one shared conversion, so the shell really is about
   twice the repressor's span. The caption says so.

   ── Focus ────────────────────────────────────────────────────────────────
   Everything is a pure function of story progress p in [0,1]. `spot(p, act)`
   returns how lit each act's subject is, crossfading across act boundaries, and
   every draw call multiplies its alpha by it. Nothing is conditional on which
   act is "current", which is what keeps scrubbing backwards identical to
   scrolling forwards.
   ═══════════════════════════════════════════════════════════════════════════ */

import { STYLE, createCapsid, viewMatrix } from '../capsid.js';
import { createParts, REPRESSOR, POLYMERASE } from '../parts.js';
import { capsidData, complexData, mutaT7Data } from '../structures.js';
import { stroke, grain } from '../pencil.js';
import { clamp, lerp, norm, smoothstep, easeInOut, TAU, rng, palette,
         reducedMotion } from '../util.js';

/* Virtual drawing space; mapped onto whatever the stage gives us. */
const VW = 1000, VH = 620;
const DIM = 0.10;            // ink left on everything that is not the subject
const ACTS = 3;

/* Layout. Kept as data so the composition can be reasoned about in one place
   instead of being scattered through the drawing code. */
const CELL = { x: 500, y: 310, rx: 468, ry: 248 };
const MUT  = { x: 258, y: 282, r: 96, gene: [-2.55, -0.35] };  // cassette arc
const SEL  = { x: 778, y: 356, r: 84, gene: [0.35, 2.30] };    // kanR arc
const TARGET_ALONG = 0.42;   // where in the ORF the guide binds — not the promoter
const HUB  = [498, 300];     // open cytoplasm, where the shell closes

/* One conversion for every molecule in the scene. Because the repressor, the
   polymerase and the capsid all pass through this single number, their sizes
   relative to each other are the deposited ones: the shell really is about
   twice the repressor across. Only the cell and the plasmids are schematic. */
const ANGSTROM = 0.85;       // px per Angstrom in virtual space
const SHELL_R = 190;         // radius the capsid data is expressed against
const FREE_N = 14;

const at = (c, a, k = 1) => [c.x + Math.cos(a) * c.r * k, c.y + Math.sin(a) * c.r * k];

export default {
  id: 'cell-scene',
  needs: 'canvas',

  mount(ctx) {
    this.ctx = ctx;
    this.p = 0;
    // A standalone <figure data-figure="cell-scene" data-act-index="0"> shows
    // ONE act of the same drawing, animated by its own scroll-into-view. That
    // is how the mechanism page reuses this scene without a second module and
    // without the two ever falling out of step.
    const pin = ctx.root?.dataset?.actIndex;
    this.pinned = pin === undefined ? null : Number(pin);
    this.style = Object.assign({}, STYLE, { colour: palette().ink });

    // Loose protomers: fixed seats, so they do not jump when the act changes.
    const rand = rng(90210);
    this.free = Array.from({ length: FREE_N }, (_, i) => {
      const a = rand() * TAU, rr = 0.42 + rand() * 0.5;
      return {
        i: Math.floor(rand() * 240),
        x: CELL.x + Math.cos(a) * CELL.rx * rr * 0.86,
        y: CELL.y + Math.sin(a) * CELL.ry * rr * 0.86,
        yaw: rand() * TAU, tilt: (rand() - 0.5) * 1.2,
        spin: 0.4 + rand() * 0.8,
      };
    });
    // Mutation marks along the cassette, revealed as the polymerase passes.
    this.marks = Array.from({ length: 11 }, () => 0.06 + rand() * 0.88)
                      .sort((a, b) => a - b);

    Promise.all([capsidData(), complexData(), mutaT7Data()]).then(([cd, xd, md]) => {
      if (cd) this.shell = createCapsid(cd);
      if (xd) this.repressor = createParts(xd, REPRESSOR);
      if (md) this.polymerase = createParts(md, POLYMERASE);
      this.paint(this.p);
    });
  },

  render(t, ctx) {
    this.ctx = ctx || this.ctx;
    this.p = this.pinned === null ? t : (this.pinned + t) / ACTS;
    this.paint(this.p);
  },
  resize(ctx) { this.ctx = ctx; this.paint(this.p); },

  /** How lit act `k`'s subject is at story progress p. Overlapping ramps, so
      the handover reads as attention moving rather than a cut. */
  spot(p, k) {
    const c = (k + 0.5) / ACTS, w = 1 / ACTS;
    const d = Math.abs(p - c) / w;
    return DIM + (1 - DIM) * smoothstep(clamp(1 - (d - 0.42) / 0.5));
  },
  /** Progress within act k, 0..1. */
  local: (p, k) => clamp(p * ACTS - k),

  paint(p) {
    const { c2d: g, rect, canvas } = this.ctx;
    if (!g || !this.shell) return;
    const W = rect.width, H = rect.height;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height); g.restore();
    g.lineCap = 'round'; g.lineJoin = 'round';

    // Fit the virtual space into the stage, centred.
    const s = Math.min(W / VW, H / VH);
    g.save();
    g.translate((W - VW * s) / 2, (H - VH * s) / 2);
    g.scale(s, s);

    const st = this.style;
    const lit = [this.spot(p, 0), this.spot(p, 1), this.spot(p, 2)];
    const t1 = this.local(p, 0), t2 = this.local(p, 1), t3 = this.local(p, 2);

    // ── The cell ────────────────────────────────────────────────────────────
    // Never the subject, so it never brightens past a hairline; it is the room
    // the three acts happen in.
    this.envelope(g, st, 0.30);

    // ── Mutation plasmid + MutaT7 ───────────────────────────────────────────
    this.plasmid(g, st, MUT, lit[1], 'cassette', t2);
    if (this.polymerase) {
      // The polymerase tracks the cassette, 5' to 3', across act 02.
      const a = lerp(MUT.gene[0], MUT.gene[1], easeInOut(t2));
      const [px, py] = at(MUT, a, 1.0);
      this.polymerase.draw(g, viewMatrix(a + 1.9, 0.30), st, {
        scale: ANGSTROM, cx: px, cy: py, alpha: lit[1],
      });
    }

    // ── Selection plasmid + repressor ───────────────────────────────────────
    this.plasmid(g, st, SEL, lit[0], 'kanR', 1);
    const site = at(SEL, lerp(SEL.gene[0], SEL.gene[1], TARGET_ALONG), 1.0);

    // Where the repressor is, across the whole story: it arrives at the gene in
    // 01, sits there through 02, and is carried off it in 03. Sequestration IS
    // removal from the locus — assembling the shell on top of the gene would
    // draw the opposite of what the act says.
    const arrive = easeInOut(clamp(norm(t1, 0.04, 0.66)));
    const close  = easeInOut(clamp(norm(t3, 0.03, 0.42)));
    const enter  = [site[0] - 128, site[1] + 104];
    const rx = lerp(lerp(enter[0], site[0], arrive), HUB[0], close);
    const ry = lerp(lerp(enter[1], site[1], arrive), HUB[1], close);

    // ── Loose protomers ─────────────────────────────────────────────────────
    // Free in the cytoplasm through 01 and 02; in 03 they converge on the hub
    // and hand over to the assembling shell.
    for (const f of this.free) {
      const x = lerp(f.x, HUB[0], close), y = lerp(f.y, HUB[1], close);
      this.shell.drawFree(g, f.i, viewMatrix(f.yaw + close * f.spin * 2.4, f.tilt), st, {
        cx: x, cy: y, scale: SHELL_R * ANGSTROM,
        alpha: Math.max(lit[1], lit[2]) * (1 - smoothstep(clamp(norm(t3, 0.28, 0.52)))),
      });
    }

    // ── The shell, assembling ───────────────────────────────────────────────
    // Runs the hero's explode in reverse: 240 subunits arrive from outside and
    // settle onto their operator positions.
    //
    // Assembly finishes by t3 ~ 0.6, not at 1. The sticky stage releases before
    // the last panel's span ends, so an animation timed to t3 = 1 plays its
    // climax after the drawing has already scrolled off the top of the screen.
    if (t3 > 0.02) {
      const build = smoothstep(clamp(norm(t3, 0.12, 0.58)));
      this.shell.draw(g, VW, VH, t3 * 1.6, st, {
        scale: SHELL_R * ANGSTROM, cx: HUB[0], cy: HUB[1],
        explode: (1 - build) * 0.9, alpha: lit[2] * build,
      });
    }

    // The repressor: on the gene through 01 and 02, wrapped by the shell in 03.
    if (this.repressor) {
      this.repressor.draw(g, viewMatrix(0.7 + p * 1.2, 0.34), st, {
        scale: ANGSTROM, cx: rx, cy: ry,
        alpha: Math.max(lit[0], lit[2]),
        // The gene is the selection plasmid's, not the complex's: once the
        // shell has swept the repressor up, its own bound duplex would read as
        // the cell carrying a second copy of the locus around.
        parts: { dna_target: arrive * (1 - close), dna_nontarget: arrive * (1 - close) },
      });
    }

    g.restore();
    grain(g, W, H, { alpha: 0.045 });
  },

  /** The rod. Two lines, because one reads as a pill and two read as an envelope. */
  envelope(g, st, alpha) {
    for (const k of [1, 0.955]) {
      const pts = [];
      for (let i = 0; i <= 96; i++) {
        const a = i / 96 * TAU;
        // A capsule, not an ellipse: superellipse exponent flattens the sides.
        const c = Math.cos(a), sn = Math.sin(a);
        pts.push([CELL.x + Math.sign(c) * Math.pow(Math.abs(c), 0.62) * CELL.rx * k,
                  CELL.y + Math.sign(sn) * Math.pow(Math.abs(sn), 0.88) * CELL.ry * k]);
      }
      stroke(g, pts, { passes: 2, width: st.width * 0.8, alpha: alpha * (k === 1 ? 1 : 0.5),
                       wobble: 1.5, close: true, taper: 0.5,
                       seed: k === 1 ? 7001 : 7002, colour: st.colour });
    }
  },

  /**
   * A plasmid: a supercoiled loop with one gene picked out on it.
   * `progress` reveals mutation marks behind the polymerase on the cassette.
   */
  plasmid(g, st, c, alpha, kind, progress) {
    const rand = rng(kind === 'kanR' ? 3301 : 3302);
    const h = [rand(), rand(), rand()];
    const rAt = a => c.r * (1 + 0.055 * Math.sin(a * 3 + h[0] * TAU)
                              + 0.035 * Math.sin(a * 5 + h[1] * TAU));
    const loop = [];
    for (let i = 0; i <= 120; i++) {
      const a = i / 120 * TAU, rr = rAt(a);
      loop.push([c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr]);
    }
    stroke(g, loop, { passes: 2, width: st.width * 0.75, alpha: alpha * 0.62,
                      wobble: 0.9, close: true, taper: 0.5,
                      seed: kind === 'kanR' ? 811 : 812, colour: st.colour });

    // The gene itself, heavier — a plasmid map draws the feature, not the vector.
    const arc = [];
    for (let i = 0; i <= 48; i++) {
      const a = lerp(c.gene[0], c.gene[1], i / 48), rr = rAt(a);
      arc.push([c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr]);
    }
    stroke(g, arc, { passes: 3, width: st.width * 1.5, alpha: alpha * 0.95,
                     wobble: 0.5, taper: 0.35,
                     seed: kind === 'kanR' ? 813 : 814, colour: st.colour });

    if (kind !== 'cassette') return;
    // Deamination events, appearing only once the polymerase has passed them.
    for (const m of this.marks) {
      if (m > progress) continue;
      const a = lerp(c.gene[0], c.gene[1], m), rr = rAt(a);
      const nx = Math.cos(a), ny = Math.sin(a);
      stroke(g, [[c.x + nx * (rr - 11), c.y + ny * (rr - 11)],
                 [c.x + nx * (rr + 11), c.y + ny * (rr + 11)]],
             { passes: 2, width: st.width * 0.9, alpha: alpha * 0.85,
               wobble: 0.5, taper: 0.3, seed: Math.round(m * 9973), colour: st.colour });
    }
  },
};
