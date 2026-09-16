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
import { callout, label, key } from '../annotate.js';
import { clamp, lerp, norm, smoothstep, easeInOut, TAU, rng, palette,
         reducedMotion, el } from '../util.js';

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
/* Free capsomers, not free protomers. Encapsulins assemble from pentamers and
   hexamers, so those are what should be floating in the cytoplasm — and the
   larger, fewer pieces crowd the drawing far less than fourteen loose subunits
   did. Two pentamers and five hexamers, picked from the real capsomer set:
   indices 0-11 are the 5-folds, 12-41 the 6-folds. */
const FREE_CAPS = [3, 9, 15, 20, 25, 31, 37];
/* Hand-placed seats, for the same reason the labels are: they have to stay off
   the annotations and out of the disc the shell will occupy. Random seats
   parked one capsomer on top of the cassette label. */
const SEATS = [[420, 468], [700, 180], [556, 108], [128, 330],
               [872, 200], [726, 522], [372, 128]];
/* Ceiling on the fraction of subunits carrying a visible patch. Uncapped, every
   capsomer ends up more red than graphite, which reads as a stained drawing
   rather than as a handful of deamination events. */
const MUT_MAX = 0.26;

/* Type sizes in virtual units. Part names are tracked caps, the way a plate is
   lettered; gene and protein names are set normally so they stay legible as
   the symbols they are (kanR, dCas9) rather than being shouted. */
const T_PART = 15, T_GENE = 16, TRACK = 1.5;

const at = (c, a, k = 1) => [c.x + Math.cos(a) * c.r * k, c.y + Math.sin(a) * c.r * k];

/* The drawing doubles as the site's navigation into its own subsystems: click
   a plasmid, the enzyme or the shell and land on the page that documents it.
   Same four destinations system-map.js used to offer as a separate abstract
   diagram — now on the real figure instead of a second drawing of it. */
function hrefPrefix() {
  return (typeof base_url !== 'undefined' ? base_url : '.').replace(/\/?$/, '/');
}

/** One clickable region: a real, focusable <a> so it behaves like any other
    link (right-click, middle-click, screen readers) with no click handlers of
    our own. The hit circle needs `pointer-events: all` — see home.css — since
    it stays visually transparent until hovered and an invisible SVG shape is
    otherwise not a hit target. Returns the circle, so a caller can move a
    tracked hotspot's centre in paint(). */
function hotspot(svg, { cx, cy, r, href, label }) {
  const a = el('a', { class: 'hotspot', href: hrefPrefix() + href.replace(/^\//, ''),
                      'aria-label': label });
  const hit = el('circle', { class: 'hotspot__hit', cx, cy, r });
  a.appendChild(hit);
  svg.appendChild(a);
  return hit;
}

export default {
  id: 'cell-scene',
  needs: 'canvas svg',
  viewBox: `0 0 ${VW} ${VH}`,

  mount(ctx) {
    this.ctx = ctx;
    this.p = 0;
    // A standalone <figure data-figure="cell-scene" data-act-index="0"> shows
    // ONE act of the same drawing, animated by its own scroll-into-view. That
    // is how the mechanism page reuses this scene without a second module and
    // without the two ever falling out of step.
    const pin = ctx.root?.dataset?.actIndex;
    this.pinned = pin === undefined ? null : Number(pin);
    const pal = palette();
    this.style = Object.assign({}, STYLE, { colour: pal.ink });
    /* The only colour in the drawing, and each mark takes the token of the
       thing it sits on: the CLP fusion site is on dCas9, the boxB site is on
       the guide, and a mutation is a mutation. Red had to go to mutations —
       --enc-mutate is literally that — so the two grips moved to their own
       molecules' hues rather than leaving one red mark meaning two things. */
    this.hues = { clp: pal.cas, boxb: pal.sgrna, mut: pal.mutate };

    const rand = rng(90210);
    this.free = FREE_CAPS.map((cap, i) => ({
      cap, x: SEATS[i][0], y: SEATS[i][1],
      yaw: rand() * TAU, tilt: (rand() - 0.5) * 1.1,
    }));
    this.freeSet = new Set(FREE_CAPS);
    // One protomer is named on behalf of all of them. Picked here, from the
    // fixed seats, so the leader always lands on the same piece.
    const NEAR = [408, 470];
    this.named = this.free.reduce((best, f, i) =>
      Math.hypot(f.x - NEAR[0], f.y - NEAR[1]) <
      Math.hypot(this.free[best].x - NEAR[0], this.free[best].y - NEAR[1]) ? i : best, 0);

    // Mutation marks along the cassette, revealed as the polymerase passes.
    this.marks = Array.from({ length: 11 }, () => 0.06 + rand() * 0.88)
                      .sort((a, b) => a - b);

    // ── Hotspots ─────────────────────────────────────────────────────────
    // Two are static: the plasmid loops and the hub the shell assembles
    // around never move. Two track a moving subject — drawn last, so they
    // sit on top of the static regions and win any overlap, the same way the
    // enzyme itself overdraws the plasmid it is sitting on. this.hsMutaT7 and
    // this.hsSelection are re-centred every paint().
    if (ctx.svg) {
      hotspot(ctx.svg, { cx: MUT.x, cy: MUT.y, r: MUT.r + 24,
                         href: 'engineering/plasmids/', label: 'Plasmid architecture' });
      hotspot(ctx.svg, { cx: SEL.x, cy: SEL.y, r: SEL.r + 24,
                         href: 'engineering/plasmids/', label: 'Plasmid architecture' });
      hotspot(ctx.svg, { cx: HUB[0], cy: HUB[1], r: SHELL_R * ANGSTROM + 24,
                         href: 'project/design/', label: 'Encapsulin shell design' });
      this.hsMutaT7 = hotspot(ctx.svg, { cx: MUT.x, cy: MUT.y, r: 42,
                         href: 'engineering/cycles/', label: 'MutaT7 evolution platform' });
      this.hsSelection = hotspot(ctx.svg, { cx: SEL.x, cy: SEL.y, r: 46,
                         href: 'project/mechanism/', label: 'Selection circuit' });
    }

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
    const walk = easeInOut(clamp(norm(t2, 0.02, 0.68)));
    this.plasmid(g, st, MUT, lit[1], 'cassette', walk);
    // Computed unconditionally — this.hsMutaT7 tracks it even before the
    // structure has loaded and the enzyme itself has anything to draw.
    const walkAngle = lerp(MUT.gene[0], MUT.gene[1], walk);
    const [px, py] = at(MUT, walkAngle, 1.0);
    if (this.polymerase) {
      // The polymerase tracks the cassette, 5' to 3', across act 02.
      this.polymerase.draw(g, viewMatrix(walkAngle + 1.9, 0.30), st, {
        scale: ANGSTROM, cx: px, cy: py, alpha: lit[1],
      });
    }
    this.hsMutaT7?.setAttribute('cx', px);
    this.hsMutaT7?.setAttribute('cy', py);

    // ── Selection plasmid + repressor ───────────────────────────────────────
    this.plasmid(g, st, SEL, lit[0], 'kanR', 1);
    const site = at(SEL, lerp(SEL.gene[0], SEL.gene[1], TARGET_ALONG), 1.0);

    // Where the repressor is, across the whole story: it arrives at the gene in
    // 01, sits there through 02, and is carried off it in 03. Sequestration IS
    // removal from the locus — assembling the shell on top of the gene would
    // draw the opposite of what the act says.
    const arrive = easeInOut(clamp(norm(t1, 0.02, 0.40)));
    const close  = easeInOut(clamp(norm(t3, 0.03, 0.42)));
    const enter  = [site[0] - 128, site[1] + 104];
    const rx = lerp(lerp(enter[0], site[0], arrive), HUB[0], close);
    const ry = lerp(lerp(enter[1], site[1], arrive), HUB[1], close);
    this.hsSelection?.setAttribute('cx', rx);
    this.hsSelection?.setAttribute('cy', ry);

    // ── Free capsomers ──────────────────────────────────────────────────────
    // These are the same seven capsomers throughout. In 02 they pick up
    // mutations from the cassette that encodes them; in 03 they fly to their
    // own places in the shell — the exact places, because a capsomer landed at
    // capsomerScreen() with the shell's yaw and tilt IS what the shell would
    // have drawn there.
    const shellYaw = t3 * 1.6;
    const S = SHELL_R * ANGSTROM;
    // Arrival and build finish well before t3 = 1: the sticky stage releases
    // before the panel's scroll span ends, so the reader needs the completed
    // shell sitting still, in front of them, while they read the act's last
    // line — not still assembling as the drawing scrolls away.
    const arrival = easeInOut(clamp(norm(t3, 0.06, 0.42)));
    // Mutations accumulate across 02 and stay: an evolved shell carries them.
    const mut = MUT_MAX * clamp(norm(p, 1 / ACTS + 0.04, 2 / ACTS));

    for (const f of this.free) {
      const [tx, ty] = this.shell.capsomerScreen(f.cap, shellYaw, st.tilt, S, HUB[0], HUB[1]);
      this.shell.drawCapsomer(g,
        f.cap,
        lerp(f.yaw, shellYaw, arrival),
        lerp(f.tilt, st.tilt, arrival),
        st, {
          cx: lerp(f.x, tx, arrival), cy: lerp(f.y, ty, arrival),
          scale: S,
          // Graded transparent throughout, not solid-then-fading: the same
          // 0.9 ceiling applies here and to the rest of the shell below, so a
          // capsomer never pops in weight the moment it lands in place.
          alpha: Math.max(lit[1], lit[2]) * 0.9,
          mut, mutHue: this.hues.mut,
        });
    }

    // ── The rest of the shell ───────────────────────────────────────────────
    // Runs the hero's explode in reverse: the remaining 35 capsomers arrive
    // from outside and settle onto their operator positions.
    //
    // Assembly finishes by t3 ~ 0.6, not at 1. The sticky stage releases before
    // the last panel's span ends, so an animation timed to t3 = 1 plays its
    // climax after the drawing has already scrolled off the top of the screen.
    if (t3 > 0.02) {
      const build = smoothstep(clamp(norm(t3, 0.12, 0.46)));
      // Everything except the seven the reader has been watching: those are
      // flying in under their own steam, and drawing them twice would double
      // their ink at the moment they land.
      this.shell.draw(g, VW, VH, shellYaw, st, {
        scale: S, cx: HUB[0], cy: HUB[1], skipCaps: this.freeSet,
        explode: (1 - build) * 0.9, alpha: lit[2] * build * 0.9,
        mut, mutHue: this.hues.mut,
      });
    }

    // The repressor: on the gene through 01 and 02, wrapped by the shell in 03.
    if (this.repressor) {
      this.repressor.draw(g, viewMatrix(0.7 + p * 1.2, 0.34), st, {
        scale: ANGSTROM, cx: rx, cy: ry, hues: this.hues,
        alpha: Math.max(lit[0], lit[2]),
        // The gene is the selection plasmid's, not the complex's: once the
        // shell has swept the repressor up, its own bound duplex would read as
        // the cell carrying a second copy of the locus around.
        parts: { dna_target: arrive * (1 - close), dna_nontarget: arrive * (1 - close) },
      });
    }

    this.annotate(g, st, { lit, site, rx, ry, close, walk });

    g.restore();
    grain(g, W, H, { alpha: 0.045 });
  },

  /**
   * Names for the parts. Drawn last so nothing overdraws them, and every label
   * fades with the thing it names — an annotation that stays lit while its
   * subject is dimmed is just clutter with an arrow on it.
   */
  annotate(g, st, { lit, site, rx, ry, close, walk }) {
    const ink = st.colour;
    const part = a => ({ size: T_PART, track: TRACK, caps: true,
                         alpha: a * 0.85, colour: ink });
    const gene = a => ({ size: T_GENE, alpha: a * 0.95, colour: ink });

    /* Positions are hand-placed against the layout constants at the top of this
       file rather than derived, because the only thing that matters about a
       label is that it does not sit on top of something else. Automatic
       placement would need collision handling for six labels, two of which
       track moving subjects; six literals are cheaper and more predictable. */

    // The two plasmids are the fixed landmarks. They never go fully dark, or
    // the reader loses the map between acts.
    const base = 0.42;
    label(g, 'Mutation plasmid', MUT.x, 166,
          { ...part(Math.max(base, lit[1])), align: 'centre' });
    label(g, 'Selection plasmid', SEL.x, 248,
          { ...part(Math.max(base, lit[0])), align: 'centre' });

    // Features, pointing at the heavy arc that is the gene.
    callout(g, 'encapsulin cassette', [432, 196],
            at(MUT, lerp(MUT.gene[0], MUT.gene[1], 0.85), 1.06),
            { ...gene(lit[1]), seed: 121, bend: 5 });
    callout(g, 'kanR', [612, 466],
            at(SEL, lerp(SEL.gene[0], SEL.gene[1], 0.80), 1.06),
            { ...gene(lit[0]), seed: 133, bend: -5 });

    // MutaT7 travels the cassette, so its leader tracks it rather than pointing
    // at a spot it has already left.
    callout(g, 'MutaT7', [432, 252],
            at(MUT, lerp(MUT.gene[0], MUT.gene[1], walk), 1.0),
            { ...gene(lit[1]), seed: 145, bend: 6 });

    // The repressor travels too, but its label sits fixed outside the cell,
    // below the envelope, with the leader crossing in to the moving subject —
    // a label parked over the membrane it names read as sitting on top of the
    // cell rather than pointing into it. Bottom-right, not top-left: from up
    // there the leader had to cross almost the entire drawing to reach the
    // site. Its label retires as the shell closes: by then the shell's own
    // label names the same object, and two arrows into one knot of lines is
    // worse than none.
    callout(g, 'dCas9·sgRNA', [880, 540], [rx - 30, ry - 30],
            { ...gene(lit[0] * (1 - close * 0.92)), seed: 157, bend: 14 });

    const f = this.free[this.named];
    const fs = this.shell.capsomerScreen(f.cap, this.local(this.p, 2) * 1.6, st.tilt,
                                         SHELL_R * ANGSTROM, HUB[0], HUB[1]);
    const fa = easeInOut(clamp(norm(this.local(this.p, 2), 0.06, 0.55)));
    callout(g, this.shell.isPenton(f.cap) ? 'encapsulin pentamer' : 'encapsulin hexamer',
            [238, 470],
            [lerp(f.x, fs[0], fa) - 26, lerp(f.y, fs[1], fa) - 12],
            { ...gene(Math.max(lit[1], lit[2]) * (1 - fa * 0.9)), seed: 169, bend: -5 });

    // The shell, named only once there is a shell.
    const built = clamp(norm(this.local(this.p, 2), 0.30, 0.55));
    if (built > 0.02) {
      callout(g, '240 subunits, T=4', [296, 502],
              [HUB[0] - SHELL_R * ANGSTROM * 0.74, HUB[1] + SHELL_R * ANGSTROM * 0.68],
              { ...gene(lit[2] * built), seed: 181, bend: 4 });
    }

    // The two engineered grips are the only colour in the drawing; the key is
    // what stops them reading as decoration.
    // One key, three marks. Each entry fades with the act it belongs to, so the
    // key says only what the current drawing is actually showing.
    const keyOpt = a => ({ size: T_GENE * 0.84, alpha: a * 0.8, colour: ink,
                           gap: 23, dash: 17 });
    key(g, [['CLP fusion site (dCas9 C-term)', this.hues.clp]], 58, 548,
        keyOpt(Math.max(lit[0], lit[2])));
    key(g, [['boxB site (sgRNA 3′)', this.hues.boxb]], 58, 571,
        keyOpt(Math.max(lit[0], lit[2])));
    key(g, [['deamination events', this.hues.mut]], 58, 594,
        keyOpt(Math.max(lit[1], lit[2])));
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
