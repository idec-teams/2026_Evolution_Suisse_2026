/* A structural shell behind a native SVG cutaway. SVG remains the fallback
   if structure loading fails; no clock, no blank first frame. */
import { STYLE, createCapsid } from '../capsid.js';
import { capsidData } from '../structures.js';

export default {
  id: 'overview-shell',
  needs: 'canvas',
  mount(ctx) {
    this.ctx = ctx;
    this.shell = null;
    capsidData().then(data => {
      if (!data) return;
      this.shell = createCapsid(data);
      this.paint();
      ctx.root.dataset.shellReady = '';
      ctx.root.querySelector('.shell-source').textContent = 'QtEncapsulin · PDB 6NJ8 · illustrative cutaway';
    });
  },
  paint() {
    const { c2d: g, rect, palette: pal } = this.ctx;
    if (!g || !this.shell) return;
    const W = rect.width, H = rect.height, sx = W / 600, sy = H / 460;
    g.clearRect(0, 0, W, H);
    g.save();
    // The removed wedge illustrates an interior view, not a physical opening.
    const cut = new Path2D();
    cut.rect(0, 0, W, H);
    cut.moveTo(270 * sx, 230 * sy);
    cut.lineTo(600 * sx, -180 * sy);
    cut.lineTo(600 * sx, 620 * sy);
    cut.closePath();
    g.clip(cut, 'evenodd');
    this.shell.draw(g, W, H, 0.55, { ...STYLE, colour: pal.ink, far: 0.22 }, {
      cx: 270 * sx, cy: 230 * sy, scale: 162 * sx,
    });
    g.restore();
  },
  render() { this.paint(); },
  resize(ctx) { this.ctx = ctx; this.paint(); },
};
