#!/usr/bin/env python3
"""Render the two homepage cargo assets with ChimeraX and Pillow (development only).

    python tools/structures/render_delivery.py
    python tools/structures/render_delivery.py --chimerax /path/to/ChimeraX

The committed .cxc files remain editable, without save/exit commands. Temporary
copies supply an orthographic offscreen camera and transparent PNG export. Site
builds use the committed PNGs and never require ChimeraX or a network connection.
"""
import argparse
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
CAMERA = '''from chimerax.graphics import OrthographicCamera
view = session.main_view
camera = OrthographicCamera()
camera.position = view.camera.position
view.camera = camera
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chimerax', default=shutil.which('chimerax-render') or 'chimerax')
    args = parser.parse_args()
    SOURCE.parent.mkdir(parents=True, exist_ok=True)
    if not SOURCE.exists():
        urlretrieve('https://files.rcsb.org/download/5F9R.cif', SOURCE)
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='delivery-render-') as temp:
        temp = Path(temp)
        camera = temp / 'camera.py'
        camera.write_text(CAMERA)
        for name in ['cas9-protein', 'guide-rna']:
            source_script = HERE / 'figures' / f'{name}.cxc'
            commands = source_script.read_text().replace('open ../cache/5F9R.cif', f'open "{SOURCE}"')
            commands = commands.replace('view #1 orient', f'open "{camera}"\nview #1 orient')
            raw = temp / f'{name}.png'
            commands += f'\nsave "{raw}" width 1500 height 1200 supersample 3 transparentBackground true\nexit\n'
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
            image = image.crop((max(0, x0-margin), max(0, y0-margin), min(image.width, x1+margin), min(image.height, y1+margin)))
            destination = OUT / f'{name}.png'
            image.save(destination, optimize=True)
            print(f'{destination.relative_to(ROOT)} — {image.width}×{image.height}')


if __name__ == '__main__':
    main()
