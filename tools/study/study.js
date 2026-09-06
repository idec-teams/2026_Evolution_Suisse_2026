const DATA = __CAPSID__;
const capsid = createCapsid(DATA);

const MIX = { passes: 3, width: 1.6, alpha: 0.62, wobble: 0.75,
              hatchMax: 0.65, k: 0.76, far: 0.25, rim: 0 };
const base = o => Object.assign({}, STYLE, MIX, o);

const PLATES = [
  { key: 'A', name: 'Pentons inked',
    blurb: 'The lightest possible touch: the 12 five-fold clusters are drawn harder than the 30 hexamers. The icosahedron appears without anything being added to the drawing.',
    st: base({ pentonInk: 1.55 }),
    spec: [['penton ink', '1.55'], ['capsomer rings', 'off'], ['backbone', 'off']] },

  { key: 'B', name: 'Capsomer rings',
    blurb: 'Each pentamer and hexamer also gets its own outline, pentamers heavier. This is the clearest statement of the lattice &mdash; you can count the faces.',
    st: base({ pentonInk: 1.35, capRing: 0.5 }),
    spec: [['penton ink', '1.35'], ['capsomer rings', '0.50'], ['backbone', 'off']] },

  { key: 'C', name: 'Backbone detail',
    blurb: 'Less contour, more structure: the silhouette drops back and each near-side subunit shows its real C&alpha; path. Rewards looking closely; needs size to work.',
    st: base({ pentonInk: 1.5, outline: 0.45, trace: 0.8, hatchMax: 0, far: 0.10 }),
    spec: [['silhouette', '0.45'], ['backbone', '0.80'], ['hatch', 'off'], ['far side', '0.10']] },

  { key: 'D', name: 'Backbone &amp; construction lines',
    blurb: 'C, plus capsomer rings and the icosahedron itself ruled through the twelve pentamer centres as a light construction line &mdash; the way the frame would actually be laid out on paper.',
    st: base({ pentonInk: 1.5, outline: 0.42, trace: 0.7, hatchMax: 0, far: 0.10,
               capRing: 0.5, icosa: 0.7 }),
    spec: [['silhouette', '0.42'], ['backbone', '0.70'], ['capsomer rings', '0.50'],
           ['icosahedron', '0.70']] },
];

function ink() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--graphite').trim() || '#3A3733';
}
function paintOne(cv, st, yaw) {
  const d = Math.min(2, devicePixelRatio || 1);
  const W = cv.clientWidth, H = cv.clientHeight;
  if (!W || !H) return;
  if (cv.width !== Math.round(W * d)) { cv.width = Math.round(W * d); cv.height = Math.round(H * d); }
  const g = cv.getContext('2d');
  g.setTransform(d, 0, 0, d, 0, 0);
  g.clearRect(0, 0, W, H);
  g.lineCap = 'round'; g.lineJoin = 'round';
  st.colour = ink();
  capsid.draw(g, W, H, yaw, st);
  grain(g, W, H, { alpha: 0.05 });
}

const host = document.getElementById('plates');
for (const p of PLATES) {
  const fig = document.createElement('figure');
  fig.className = 'plate';
  fig.innerHTML =
    '<canvas aria-label="Encapsulin shell, ' + p.name.replace(/&amp;/g, 'and') + ' treatment"></canvas>' +
    '<h3><span class="key">' + p.key + '</span>' + p.name + '</h3>' +
    '<p>' + p.blurb + '</p>' +
    '<table class="spec"><tbody>' + p.spec.map(([l, v]) =>
      '<tr><th scope="row">' + l + '</th><td>' + v + '</td></tr>').join('') +
    '</tbody></table>';
  host.appendChild(fig);
  p.canvas = fig.querySelector('canvas');
}

/* ── Workbench ─────────────────────────────────────────────────────────── */
const bench = document.getElementById('bench');
const state = base({ spin: 30 });
const KNOBS = [
  ['pentonInk', 'Penton emphasis', 1, 2.5, .05],
  ['capRing', 'Capsomer rings', 0, 1, .05],
  ['icosa', 'Icosahedron lines', 0, 1, .02],
  ['trace', 'Backbone detail', 0, 1, .05],
  ['outline', 'Silhouette', 0, 1, .02],
  ['width', 'Line weight', .4, 2.4, .05],
  ['alpha', 'Darkness', .2, 1, .02],
  ['wobble', 'Wobble', 0, 1.6, .05],
  ['hatchMax', 'Hatch density', 0, 1, .05],
  ['k', 'Subunit size', .5, 1, .02],
  ['far', 'Far-side ghost', 0, .5, .01],
  ['passes', 'Passes', 1, 4, 1],
  ['spin', 'Seconds per turn', 8, 90, 1],
];
const ctlHost = document.getElementById('controls');
const readout = document.getElementById('readout');
const inputs = {};
for (const [k, label, min, max, step] of KNOBS) {
  const d = document.createElement('div');
  d.className = 'ctl';
  const id = 'k-' + k;
  d.innerHTML = '<label for="' + id + '">' + label + '</label><output id="o-' + k + '"></output>'
    + '<input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '">';
  ctlHost.appendChild(d);
  const inp = d.querySelector('input');
  inp.addEventListener('input', () => { state[k] = parseFloat(inp.value); sync(); });
  inputs[k] = inp;
}
function sync() {
  for (const [k] of KNOBS) {
    inputs[k].value = state[k];
    document.getElementById('o-' + k).textContent = state[k];
  }
  readout.textContent = '{\n' + KNOBS.filter(([k]) => k !== 'spin')
    .map(([k]) => '  ' + k + ': ' + state[k] + ',').join('\n') + '\n}';
}
document.getElementById('reset').addEventListener('click', () => {
  Object.assign(state, base({ spin: 30 })); sync();
});
sync();

/* ── Loop ──────────────────────────────────────────────────────────────── */
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
function paint(yaw, benchYaw) {
  for (const p of PLATES) paintOne(p.canvas, p.st, yaw);
  paintOne(bench, state, benchYaw);
}
let raf = null, t0 = performance.now();
function frame(now) {
  paint((now - t0) / 30000 * TAU, (now - t0) / (state.spin * 1000) * TAU);
  raf = requestAnimationFrame(frame);
}
function start() {
  if (reduce.matches) { if (raf) cancelAnimationFrame(raf); raf = null; paint(0.6, 0.6); }
  else if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(frame); }
}
start();
reduce.addEventListener('change', start);
addEventListener('resize', () => { if (reduce.matches) paint(.6, .6); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',
  () => { if (reduce.matches) paint(.6, .6); });
