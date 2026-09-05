/* ═══════════════════════════════════════════════════════════════════════════
   Act 3 — Encapsulate.

   240 encapsulin subunits assemble into a T=4 icosahedral compartment and
   sweep the dCas9·sgRNA complexes inside. The gene clears, transcription
   resumes, resistance returns, the cell survives.

   The shell is a real projection of the icosahedral vertex set generated at
   runtime, not a hand-traced path — which keeps the door open to swapping in
   true 6NJ8 coordinates later without touching the figure's interface.
   ═══════════════════════════════════════════════════════════════════════════ */

import { clamp, lerp, norm, easeOut, smoothstep, alpha, viewTransform, TAU } from '../util.js';
import { field, drawCell } from './act2-silencing.js';
import { placeComplex, drawComplex, SHELL } from './complexes.js';

const PHI = (1 + Math.sqrt(5)) / 2;

/** The 12 icosahedron vertices, normalised. A T=4 capsid has 240 subunits
    arranged with icosahedral symmetry about exactly these axes. */
function icosaVertices() {
  const v = [];
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    v.push([0, s1, s2 * PHI], [s1, s2 * PHI, 0], [s2 * PHI, 0, s1]);
  }
  const n = Math.hypot(0, 1, PHI);
  return v.map(([x, y, z]) => [x / n, y / n, z / n]);
}

/** 240 subunit positions: four 5-fold rings around each of the 12 vertices.
    QtEncapsulin is T=4 (240 subunits); keeping 5-fold symmetry about each
    vertex axis is what makes the projection read as icosahedral rather than as
    scattered points. Rings alternate phase so the lattice does not stripe. */
function subunitPositions() {
  const verts = icosaVertices();
  const out = [];
  // Tilts chosen so the outermost ring of one vertex cluster clears the
  // outermost ring of its neighbours: adjacent icosahedral vertices are 63.4°
  // apart, so each cluster must stay inside a ~31.7° cap. Min centre-to-centre
  // separation is 1.65 units at RADIUS 13, against a max disc diameter of 1.36.
  const RINGS = [0.20, 0.34, 0.46, 0.56];
  for (const [vx, vy, vz] of verts) {
    // Build a local frame around the vertex axis.
    const up = Math.abs(vz) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const ax = [up[1] * vz - up[2] * vy, up[2] * vx - up[0] * vz, up[0] * vy - up[1] * vx];
    const al = Math.hypot(...ax);
    const a = ax.map(c => c / al);
    const b = [vy * a[2] - vz * a[1], vz * a[0] - vx * a[2], vx * a[1] - vy * a[0]];
    RINGS.forEach((tilt, ring) => {
      for (let k = 0; k < 5; k++) {
        const th = ((k + (ring % 2) * 0.5) / 5) * TAU;
        out.push([
          vx + (a[0] * Math.cos(th) + b[0] * Math.sin(th)) * tilt,
          vy + (a[1] * Math.cos(th) + b[1] * Math.sin(th)) * tilt,
          vz + (a[2] * Math.cos(th) + b[2] * Math.sin(th)) * tilt,
        ]);
      }
    });
  }
  return out.map(p => { const n = Math.hypot(...p); return p.map(c => c / n); });
}

const SUBUNITS = subunitPositions();
/* 240 subunits tile a sphere of this radius without piling up. Four times the
   subunit count of a T=1 shell means roughly half the disc radius at the same
   sphere radius, which is where the 0.31/0.68 pair below comes from. Larger
   radii look sparse; larger discs merge into a blob. */
const RADIUS = 13;

export default {
  id: 'act3-rescue',
  needs: 'canvas',

  mount(ctx) {
    // Deterministic per-subunit arrival order and approach vector.
    this.units = SUBUNITS.map(([x, y, z], i) => ({
      x, y, z,
      arrive: (i % 20) / 20 * 0.55 + ((i * 7919) % 97) / 97 * 0.2,
      from: 2.4 + ((i * 104729) % 53) / 53 * 1.6,
    }));
  },

  render(t, ctx) {
    const g = ctx.c2d, pal = ctx.palette;
    viewTransform(g, ctx.rect);
    g.clearRect(0, 0, 100, 100);

    // 0.00–0.55  shell assembles from dispersed subunits
    // 0.20–0.75  complexes are swept inside
    // 0.60–1.00  operator clears, output recovers, cell brightens
    const assemble = smoothstep(norm(t, 0.02, 0.60));
    const capture  = norm(t, 0.18, 0.80);
    const recover  = smoothstep(norm(t, 0.58, 0.96));
    const output   = lerp(0.08, 1, recover);
    const spin     = t * 0.9;

    drawCell(g, pal, { viability: output > 0.42 ? 1 : 0, output, glow: recover });

    // Complexes: continue from where act 2 left them (bind = 1), then get captured.
    for (const p of field) {
      const pos = placeComplex(p, 9 + t * 4, 1, capture);
      drawComplex(g, p, pos, pal, alpha, lerp(1, 0.3, pos.captured));
    }

    // Shell subunits, painter-sorted back to front.
    const cosA = Math.cos(spin), sinA = Math.sin(spin);
    const drawn = this.units.map(u => {
      // rotate about Y, then a fixed tilt about X for a readable oblique view
      const rx = u.x * cosA + u.z * sinA;
      const rz = -u.x * sinA + u.z * cosA;
      const ry = u.y * 0.94 - rz * 0.34;
      const rz2 = u.y * 0.34 + rz * 0.94;
      // Radial approach: subunits fly in from outside to their lattice position.
      const a = easeOut(clamp((assemble - u.arrive) / 0.45));
      const r = lerp(RADIUS * u.from, RADIUS, a);
      return { x: SHELL.x + rx * r, y: SHELL.y + ry * r, z: rz2, a };
    }).sort((p, q) => p.z - q.z);

    for (const s of drawn) {
      if (s.a <= 0.001) continue;
      const depth = (s.z + 1) / 2;                 // 0 back, 1 front
      const rad = lerp(0.31, 0.68, depth * depth) * lerp(0.55, 1, s.a);
      g.globalAlpha = s.a * lerp(0.16, 1, depth * depth);
      g.fillStyle = pal.shell;
      g.beginPath();
      g.arc(s.x, s.y, rad, 0, TAU);
      g.fill();
    }
    g.globalAlpha = 1;

    // Shell outline once assembly is essentially complete.
    if (assemble > 0.75) {
      g.strokeStyle = alpha(pal.shell, (assemble - 0.75) * 1.4);
      g.lineWidth = 0.4;
      g.beginPath();
      g.arc(SHELL.x, SHELL.y, RADIUS, 0, TAU);
      g.stroke();
    }
  },

  resize() {},
};
