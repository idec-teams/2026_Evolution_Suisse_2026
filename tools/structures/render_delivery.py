#!/usr/bin/env python3
"""Render the shared protein and RNA assets with ChimeraX and Pillow (development only).

    python tools/structures/render_delivery.py
    python tools/structures/render_delivery.py --chimerax /path/to/ChimeraX

The committed .cxc files remain editable, without save/exit commands. Temporary
copies supply an orthographic offscreen camera and transparent PNG export. Site
builds use the committed PNGs and never require ChimeraX or a network connection.
"""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
from urllib.request import urlretrieve

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SOURCE = HERE / 'cache' / '5F9R.cif'
OUT = ROOT / 'docs' / 'img' / 'molecules'
NAMES = ['cas9-protein', 'guide-rna', 'cas9-guide-complex', 't7-polymerase']
CAMERA = '''from chimerax.graphics import OrthographicCamera
view = session.main_view
camera = OrthographicCamera()
camera.position = view.camera.position
view.camera = camera
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chimerax', default=shutil.which('chimerax-render') or 'chimerax')
    parser.add_argument('--only', nargs='+', choices=NAMES, default=NAMES, help='Render only these assets')
    args = parser.parse_args()
    SOURCE.parent.mkdir(parents=True, exist_ok=True)
    if not SOURCE.exists():
        urlretrieve('https://files.rcsb.org/download/5F9R.cif', SOURCE)
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='delivery-render-') as temp:
        temp = Path(temp)
        camera = temp / 'camera.py'
        camera.write_text(CAMERA)
        for name in args.only:
            source_script = HERE / 'figures' / f'{name}.cxc'
            structure = HERE / 'cache' / ('1MSW.cif' if name == 't7-polymerase' else '5F9R.cif')
            if not structure.exists():
                urlretrieve(f'https://files.rcsb.org/download/{structure.name}', structure)
            commands = source_script.read_text().replace(f'open ../cache/{structure.name}', f'open "{structure}"')
            commands = commands.replace('view #1 orient', f'open "{camera}"\nview #1 orient')
            raw = temp / f'{name}.png'
            if name in ('cas9-guide-complex', 't7-polymerase'):
                metadata = temp / 'projection.py'
                metadata.write_text("""import json
# Match the browser complex's center, which also includes the DNA phosphates.
from chimerax.atomic import AtomicStructure
from chimerax.core.commands import run
run(session, 'open \"SOURCE\"')
full = session.models.list(type=AtomicStructure)[-1].atoms
mask = (full.names == 'CA') | (full.names == 'P')
center = full.scene_coords[mask].mean(axis=0)
run(session, 'close #2')
c = session.main_view.camera
inverse = c.position.inverse()
rotation = inverse.matrix[:, :3].copy()
rotation[1] *= -1
point = inverse * center
meta = {'fieldWidth': float(c.field_width), 'matrix': rotation.flatten().tolist(), 'centerPixel': [750 + point[0] * 1500/c.field_width, 600 - point[1] * 1500/c.field_width]}
with open('DEST', 'w') as f: json.dump(meta, f)
""".replace('SOURCE', str(structure)).replace('DEST', str(temp / 'projection.json')))
                commands += f'\nopen "{metadata}"\n'
            commands += f'\nlabel delete\nhide pseudobonds\nsave "{raw}" width 1500 height 1200 supersample 3 transparentBackground true\nexit\n'
            script = temp / f'{name}.cxc'
            script.write_text(commands)
            command = [args.chimerax, '--nogui', '--exit', str(script)]
            if Path(args.chimerax).name != 'chimerax-render':
                command.insert(1, '--offscreen')
            result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
            if result.returncode or not raw.exists():
                raise RuntimeError(f'ChimeraX failed to render {name}:\n{result.stdout}\n{result.stderr}')
            image = Image.open(raw).convert('RGBA')
            bounds = image.getchannel('A').getbbox()
            if bounds is None:
                raise RuntimeError(f'ChimeraX produced an empty {name} image')
            x0, y0, x1, y1 = bounds
            margin = 18
            crop = (max(0, x0-margin), max(0, y0-margin), min(image.width, x1+margin), min(image.height, y1+margin))
            image = image.crop(crop)
            if name in ('cas9-guide-complex', 't7-polymerase'):
                meta = json.loads((temp / 'projection.json').read_text())
                meta['pixelsPerAngstrom'] = 1500 / meta.pop('fieldWidth')
                meta['centerPixel'] = [meta['centerPixel'][0]-crop[0], meta['centerPixel'][1]-crop[1]]
                (OUT / f'{name}.json').write_text(json.dumps(meta, indent=2)+'\n')
            destination = OUT / f'{name}.png'
            image.save(destination, optimize=True)
            print(f'{destination.relative_to(ROOT)} — {image.width}×{image.height}')


if __name__ == '__main__':
    main()
