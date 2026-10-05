/* Small, reversible drawing transitions. All diagrams are complete before JS
   and retain their labels and essential molecules throughout the transition. */
export function initOverview() {
  const figures = [...document.querySelectorAll('[data-overview-motion]')];
  if (!figures.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const paths = figures.flatMap(f => [...f.querySelectorAll('[data-overview-draw] path')]);
  paths.forEach(p => { p.style.setProperty('--path-length', p.getTotalLength()); });
  const observer = new IntersectionObserver(entries => {
    for (const e of entries) e.target.classList.toggle('is-in-view', e.isIntersecting);
  }, { threshold: 0.18 });
  const apply = () => {
    observer.disconnect();
    figures.forEach(f => {
      f.classList.toggle('has-drawing-motion', !reduce.matches);
      if (reduce.matches) f.classList.add('is-in-view');
      else observer.observe(f);
    });
  };
  apply();
  reduce.addEventListener('change', apply);
}
