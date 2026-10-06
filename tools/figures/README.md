# Light-background construct figures

The Constructs page uses `s3-plasmid-maps-light.png` and `s2-sgrna-light.png`.
The original report WebP exports remain unchanged, including their use on the
Data page's supplementary section.

`light_report_views.py` embeds each original raster in a native SVG presentation
filter. It replaces the lowest 1/64 of sRGB luminance with white, then renders at
the original resolution and saves a lossless PNG. This preserves dark gray
labels, the sgRNA sequence, feature colors and figure geometry. Full-resolution
pixel comparisons found no changes outside the near-black background range.

With the optional Playwright package and Chromium installed:

```bash
.venv/bin/python tools/figures/light_report_views.py
```

Normal MkDocs/CI builds use the committed PNGs and do not require Playwright.
