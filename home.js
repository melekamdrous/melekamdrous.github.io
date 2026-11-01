// Homepage interactions. Without JS the page is a complete static document.
(function () {
  var root = document.documentElement;
  var reduce = root.classList.contains('rm');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- horizontal process ---------- */
  var proc = document.querySelector('.process');
  var track = proc && proc.querySelector('.track');
  var dist = 0;
  function layoutProcess() {
    if (!proc) return;
    var wide = window.innerWidth > 800 && !reduce;
    proc.classList.toggle('pinned', wide);
    track.style.transform = '';
    if (!wide) return;
    dist = Math.max(0, track.scrollWidth - window.innerWidth);
    proc.style.setProperty('--dist', dist + 'px');
  }
  function processFrame() {
    if (!proc || !proc.classList.contains('pinned')) return;
    var r = proc.getBoundingClientRect();
    var span = proc.offsetHeight - window.innerHeight;
    var p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
    proc.style.setProperty('--pp', p.toFixed(4));
  }

  /* ---------- exploded view ---------- */
  var iso = document.querySelector('.iso');
  function isoFrame() {
    if (!iso || reduce) { if (iso) iso.style.setProperty('--g', 1); return; }
    var r = iso.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp((vh - r.top) / (vh * 0.9), 0, 1);
    iso.style.setProperty('--g', (p * p * (3 - 2 * p)).toFixed(3));
  }

  /* ---------- nav theme ---------- */
  var nav = document.querySelector('.hnav');
  var themed = document.querySelectorAll('[data-nav]');
  function navFrame() {
    var y = 32, theme = 'dark';
    themed.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) theme = s.dataset.nav;
    });
    nav.classList.toggle('dark', theme === 'dark');
  }

  /* ---------- hero parallax ---------- */
  var cat = document.querySelector('.hero-cat');
  if (cat && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 18;
      var y = (e.clientY / window.innerHeight - 0.5) * 12;
      cat.style.setProperty('--mx', x.toFixed(1) + 'px');
      cat.style.setProperty('--my', y.toFixed(1) + 'px');
    });
    hero.addEventListener('mouseleave', function () { cat.style.setProperty('--mx', '0px'); cat.style.setProperty('--my', '0px'); });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { processFrame(); isoFrame(); navFrame(); ticking = false; });
  }
  layoutProcess();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { layoutProcess(); onScroll(); });
  window.addEventListener('load', function () { layoutProcess(); onScroll(); });
  onScroll();

  /* ---------- reveals + counters ---------- */
  function countUp(el) {
    var end = +el.dataset.count, t0 = null;
    if (reduce) { el.textContent = end + (el.dataset.suffix || ''); return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / 900, 0, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (el.dataset.suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        if (t.classList.contains('counters')) { t.querySelectorAll('[data-count]').forEach(countUp); }
        else t.classList.add('in');
        io.unobserve(t);
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.reveal, .counters').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();
