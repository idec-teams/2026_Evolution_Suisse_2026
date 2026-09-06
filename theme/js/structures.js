/* ═══════════════════════════════════════════════════════════════════════════
   structures.js — one fetch per structure, shared by every figure.

   The homepage draws the capsid in the hero and again in the scroll story, and
   the repressor in both. Each figure fetching its own copy would mean redundant
   requests and redundant copies of the unpacked geometry, so the promise is
   cached and handed to whoever asks.

   Paths go through the `base_url` global that base.html defines: MkDocs serves
   this site from a project subpath on GitHub Pages, and a root-relative URL
   would 404 there while working perfectly under `mkdocs serve`.
   ═══════════════════════════════════════════════════════════════════════════ */

const cache = new Map();

function load(name) {
  if (!cache.has(name)) {
    const root = (typeof base_url === 'string' ? base_url : '.').replace(/\/?$/, '/');
    cache.set(name, fetch(`${root}data/${name}.json`)
      .then(r => {
        if (!r.ok) throw new Error(`${name}.json: HTTP ${r.status}`);
        return r.json();
      })
      .catch(err => {
        // Fail soft: a figure that never resolves leaves its caption and an
        // empty frame, which is a far better page than a thrown boot error.
        console.warn('[structures]', err.message);
        return null;
      }));
  }
  return cache.get(name);
}

export const capsidData  = () => load('capsid');
export const complexData = () => load('complex');
export const mutaT7Data  = () => load('mutat7');
