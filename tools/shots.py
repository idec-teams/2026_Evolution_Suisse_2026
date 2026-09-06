#!/usr/bin/env python3
"""Screenshot the figures at chosen story positions, for looking at your work.

    .venv/bin/python tools/shots.py hero
    .venv/bin/python tools/shots.py story 0.15 0.45 0.85
    .venv/bin/python tools/shots.py page project/mechanism/

Writes PNGs to tools/shots/ and prints any console error or page error. Expects
`mkdocs serve` to already be running (see HANDOFF.md).

── Three things that will waste your afternoon if you do not know them ──────

1. `wait_until='networkidle'` NEVER FIRES against `mkdocs serve`. The livereload
   websocket keeps the connection open, so goto() times out after 30 s. Use
   'load'.

2. `element.screenshot()` SCROLLS THE ELEMENT INTO VIEW before capturing. In a
   scroll-driven story that silently changes the very scroll position you are
   trying to photograph, and you get a frame from a different point in the
   animation than the one you asked for. Always compute a clip box and use
   `page.screenshot(clip=...)`.

3. Headless Chromium here needs libnspr4/libnss3, which are not installed
   system-wide. They live in ~/.local/pwlibs; this script puts them on
   LD_LIBRARY_PATH itself, so just run it.
"""
import asyncio
import os
import sys

LIBS = os.path.expanduser('~/.local/pwlibs/root/usr/lib/x86_64-linux-gnu')
if os.path.isdir(LIBS) and LIBS not in os.environ.get('LD_LIBRARY_PATH', ''):
    os.environ['LD_LIBRARY_PATH'] = LIBS + ':' + os.environ.get('LD_LIBRARY_PATH', '')

from playwright.async_api import async_playwright          # noqa: E402

BASE = os.environ.get('SITE', 'http://127.0.0.1:8000/2026_Evolution_Suisse_2026/')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shots')
VIEW = {'width': 1440, 'height': 900}

# Mirrors scrolly.js: which act is on stage, and how far through it we are.
PROGRESS = """() => {
  const s = document.querySelector('.scrolly');
  if (!s) return null;
  const focus = innerHeight *
    (parseFloat(getComputedStyle(s).getPropertyValue('--scrolly-focus')) || 0.42);
  const acts = [...s.querySelectorAll('[data-act]')];
  const tops = acts.map(a => a.getBoundingClientRect().top);
  const bottom = s.getBoundingClientRect().bottom;
  let i = 0;
  for (let k = 0; k < tops.length; k++) if (tops[k] <= focus) i = k;
  const start = tops[i], end = i + 1 < tops.length ? tops[i + 1] : bottom;
  const span = end - start;
  const t = span > 0 ? Math.min(1, Math.max(0, (focus - start) / span)) : 0;
  return { act: i + 1, t: +t.toFixed(3), p: +((i + t) / acts.length).toFixed(3) };
}"""

CLIP = """() => {
  const r = document.querySelector('.scrolly__viewport').getBoundingClientRect();
  return { x: Math.max(0, r.x), y: Math.max(0, r.y),
           width: Math.min(r.width, innerWidth),
           height: Math.min(r.height, innerHeight - Math.max(0, r.y)) };
}"""


async def run(mode, args):
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        page = await browser.new_page(viewport=VIEW, device_scale_factor=2)
        problems = []
        page.on('console', lambda m: problems.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: problems.append('PAGEERROR ' + str(e)))

        if mode == 'page':
            for url in args:
                await page.goto(BASE + url, wait_until='load')
                await page.wait_for_timeout(2500)
                name = (url.strip('/') or 'index').replace('/', '-')
                await page.screenshot(path=f'{OUT}/{name}.png', full_page=True)
                print(f'  {name}.png')

        elif mode == 'hero':
            await page.goto(BASE, wait_until='load')
            # Closed, mid-open, fully open. See HOLD_CLOSED / OPEN_OVER in
            # theme/js/figures/hero-capsid.js for where these numbers come from.
            for name, wait in [('hero-closed', 1500), ('hero-opening', 4800),
                               ('hero-open', 4000)]:
                await page.wait_for_timeout(wait)
                await page.screenshot(path=f'{OUT}/{name}.png',
                                      clip={'x': 0, 'y': 0, 'width': VIEW['width'],
                                            'height': 830})
                print(f'  {name}.png')

        elif mode == 'story':
            fractions = [float(a) for a in args] or [0.12, 0.30, 0.48, 0.66, 0.84]
            await page.goto(BASE, wait_until='load')
            await page.wait_for_timeout(1500)
            geom = await page.evaluate(
                "() => { const r = document.querySelector('.scrolly')"
                ".getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; }")
            for f in fractions:
                await page.evaluate(f"window.scrollTo(0, {geom['top'] + geom['h'] * f})")
                await page.wait_for_timeout(650)
                where = await page.evaluate(PROGRESS)
                clip = await page.evaluate(CLIP)
                name = f'story-{f:.2f}'
                await page.screenshot(path=f'{OUT}/{name}.png', clip=clip)
                print(f"  {name}.png   act {where['act']}  t={where['t']}  p={where['p']}")
        else:
            raise SystemExit(__doc__)

        await browser.close()
        print('console:', problems[:5] if problems else 'clean')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    asyncio.run(run(sys.argv[1], sys.argv[2:]))
