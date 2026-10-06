/* Shared, fixed orthographic ChimeraX views of deposited protein–RNA complexes.
   Projection metadata keeps DNA and fusion-site annotations aligned and keeps
   the image on the same Angstrom scale as the animated encapsulin shell. */
import { createParts, REPRESSOR, POLYMERASE } from './parts.js';

const cache = new Map();
export function cargoRender(name = 'cas9-guide-complex') {
  if (!cache.has(name)) {
    const root = (typeof base_url === 'string' ? base_url : '.').replace(/\/?$/, '/');
    const path = `${root}img/molecules/${name}`;
    const image = new Image();
    const ready = new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Cargo image unavailable'));
      image.src = `${path}.png`;
    });
    cache.set(name, Promise.all([ready, fetch(`${path}.json`).then(r => {
      if (!r.ok) throw new Error('Cargo projection unavailable');
      return r.json();
    })]).catch(error => {
      console.warn('[cargo-render]', error.message);
      return null;
    }));
  }
  return cache.get(name);
}

export function createCargo(data, rendered, preset = REPRESSOR) {
  const fallback = createParts(data, preset);
  if (!rendered) return fallback;
  const [image, meta] = rendered;
  return {
    draw(g, _matrix, style, opt = {}) {
      // The deposited DNA remains on the plasmid as the cargo is sequestered.
      const parts = { ...opt.parts, rec: 0, nuc: 0, sgrna: 0, clp_site: 0, boxb_site: 0, pol: 0, rna: 0 };
      fallback.draw(g, meta.matrix, style, { ...opt, parts });
      const scale = opt.scale ?? 1, alpha = opt.alpha ?? 1;
      const cx = opt.cx ?? 0, cy = opt.cy ?? 0;
      const pixels = scale / meta.pixelsPerAngstrom;
      g.save();
      g.globalAlpha *= alpha;
      g.drawImage(image, cx-meta.centerPixel[0]*pixels, cy-meta.centerPixel[1]*pixels,
        image.width*pixels, image.height*pixels);
      // Dots identify fusion positions, not modeled CLP/boxB structures.
      for (const [name, hue] of [['cas9_cterm', 'clp'], ['sgrna_3prime', 'boxb']]) {
        if (!data.anchors[name]) continue;
        const point = data.anchors[name].map(v => v / data.q);
        const m = meta.matrix;
        const x = cx+(m[0]*point[0]+m[1]*point[1]+m[2]*point[2])*scale;
        const y = cy+(m[3]*point[0]+m[4]*point[1]+m[5]*point[2])*scale;
        g.beginPath();
        g.arc(x, y, Math.max(2.5, 3*scale), 0, 2*Math.PI);
        g.fillStyle = opt.hues?.[hue] || style.colour;
        g.fill();
        g.strokeStyle = '#fff';
        g.lineWidth = 1;
        g.stroke();
      }
      g.restore();
    },
  };
}
