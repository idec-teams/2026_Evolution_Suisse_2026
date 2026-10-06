# Evolution Suisse branding

The user supplied `EvolutionSuisse.png` at the repository root. The identical
copy in `docs/img/evolution-suisse.png` is the header asset. CSS clips the white
margins and blends the background into the site paper; the source is unchanged.

`docs/img/evolution-suisse-banner.png` is the selected homepage background,
generated on 2026-10-06 using the built-in imagegen tool
with the supplied logo as a reference. The original header logo remains in use
on both versions. This artwork is not a scientific figure.

The homepage combines the original banner with three native SVG delivery steps
inside the opening copy. The drawings use the existing cargo renders and
icosahedron macro, with a highlighted target cell for “Reach the right cells.”
The unlisted banner preview shares the homepage template and front matter. It
is absent from navigation and search, and carries `noindex, nofollow`.
The `exclude_preview.py` build hook removes preview entries after MkDocs' built-in
search plugin writes its index; that plugin does not support per-page exclusions.

The capsomer alternative remains local in the gitignored
`tools/branding/local-experiments/capsomer/` directory. It is not published.

## Final generation prompt

Use case: stylized-concept. Asset type: wide website hero background for Evolution Suisse, a directed evolution research team. Input image: reference logo, preserve its recognizable idea of evolution silhouettes meeting a Swiss alpine mountain and its restrained charcoal/red identity, but redesign the motif as elegant large-scale editorial artwork. Create a wide 3:2 landscape artwork, with a cool very light gray paper background (#EDEEF0). Keep the left 55% and upper third almost entirely empty, smooth pale paper for a dark headline and paragraphs to be overlaid in HTML. Place a beautiful angular Swiss alpine mountain on the far right, composed of graphite geometric facets, delicate contour lines and misty pale gray layers. Along the lower right foothills a small restrained progression of evolution silhouettes inspired by the source logo leads toward a standing scientist with one tiny red detail. Sophisticated scientific editorial aesthetic, clean sharp edges, subtle paper grain, quiet spacious composition, mountain substantial and legible without being too dark. No lettering, no wordmark, no text, no interface, no watermarks, no extra symbols. Background should fade softly to the exact cool paper color at the top, left and bottom edges for seamless integration with a website. This is decorative brand artwork, not a scientific diagram.
