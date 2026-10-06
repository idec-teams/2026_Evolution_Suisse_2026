"""Render light-background views of the original report exports through SVG.

The raster payload is embedded byte-for-byte. An SVG presentation filter paints
only the near-black background white; labels, sequence and feature colors remain
in the source image. The filter renders at source resolution before a lossless
PNG export, so small display sizes cannot alter the background mask. Requires
the optional Playwright/Chromium tools; ordinary MkDocs builds use saved assets.
"""

import asyncio
import base64
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
FIGURES = (
    ("s3-plasmid-maps", 1364, 2472, "Plasmid maps"),
    ("s2-sgrna", 2400, 371, "Guide RNA sequence and insertion sites"),
)


async def main():
    from playwright.async_api import async_playwright

    # The first 1/64 of sRGB luminance is the flattened black background.
    # Explicit sRGB filtering keeps dark gray labels outside that interval.
    alpha_table = " ".join(["1"] + ["0"] * 63)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        page = await browser.new_page()
        for stem, width, height, title in FIGURES:
            source = ROOT / "docs" / "img" / "report" / f"{stem}.webp"
            payload = base64.b64encode(source.read_bytes()).decode("ascii")
            output = source.with_name(f"{stem}-light.png")
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <title>{title}</title>
  <defs>
    <filter id="light-paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.2126 0.7152 0.0722 0 0"/>
        <feComponentTransfer result="paper-mask">
            <feFuncA type="discrete" tableValues="{alpha_table}"/>
        </feComponentTransfer>
        <feFlood flood-color="white" result="paper"/>
        <feComposite in="paper" in2="paper-mask" operator="in" result="light-background"/>
        <feComposite in="light-background" in2="SourceGraphic" operator="over"/>
    </filter>
  </defs>
  <image width="{width}" height="{height}" href="data:image/webp;base64,{payload}" filter="url(#light-paper)"/>
</svg>
'''
            svg_uri = "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()
            png_uri = await page.evaluate('''async (src) => {
              const image = new Image();
              image.src = src;
              await image.decode();
              const canvas = document.createElement('canvas');
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              canvas.getContext('2d').drawImage(image, 0, 0);
              return canvas.toDataURL('image/png');
            }''', svg_uri)
            output.write_bytes(base64.b64decode(png_uri.split(",", 1)[1]))
            print(output.relative_to(ROOT))
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
