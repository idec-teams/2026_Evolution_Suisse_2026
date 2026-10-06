/* MathJax configuration for pymdownx.arithmatex (generic mode).
   Must be evaluated before the MathJax bundle — see base.html.

   Output is SVG rather than CHTML so the bundle needs no webfont files and the
   site keeps zero external runtime dependencies. */
window.MathJax = {
  tex: {
    inlineMath:  [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
  },
  svg: { fontCache: "global", scale: 1.0 },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex",
  },
};
