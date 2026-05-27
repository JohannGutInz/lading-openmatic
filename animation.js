/* ═══════════════════════════════════════════════
   VIDEO SCROLL
═══════════════════════════════════════════════ */
(function () {
  const canvas    = document.getElementById('hero-canvas');
  const video     = document.getElementById('hero-video-bg');
  const container = document.getElementById('hero-scroll-container');
  let videoReady  = false;

  canvas.style.display = 'none';
  video.style.display  = 'block';
  video.style.opacity  = '0';
  video.style.transition = 'opacity 0.5s ease';

  let rafPending = false;
  let lastTime   = -1;

  function applyScroll() {
    rafPending = false;
    if (!videoReady || !isFinite(video.duration)) return;
    const max     = container.offsetHeight - window.innerHeight;
    const p       = Math.min(Math.max(window.scrollY / max, 0), 1);
    const target  = p * video.duration * 0.98; // evita seek al frame final exacto
    if (Math.abs(target - lastTime) < 0.01) return; // descarta seeks redundantes
    lastTime = target;
    video.currentTime = target;
  }

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(applyScroll);
  }

  video.addEventListener('loadedmetadata', () => {
    videoReady = true;
    video.currentTime = 0;
  });

  video.addEventListener('canplaythrough', () => {
    video.style.opacity = '1';
  }, { once: true });

  // Fallback: show video after 5s even if canplaythrough hasn't fired
  setTimeout(() => { video.style.opacity = '1'; }, 5000);

  video.load();

  window.addEventListener('scroll', onScroll, { passive: true });
  applyScroll();
})();

/* ═══════════════════════════════════════════════
   INTERSECTION OBSERVER — reveals + counters
═══════════════════════════════════════════════ */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  if (target === 0) { el.textContent = '0' + suffix; return; }
  const start = performance.now();
  (function step(now) {
    const t = Math.min((now - start) / 1500, 1);
    const e = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(e * target) + suffix;
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    if (e.target.dataset.count !== undefined) animateCount(e.target);
  });
}, { threshold: 0.15 });

// Stats section fades in as a whole first, then cards stagger in
const statsSection = document.getElementById('stats');
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    statsSection.classList.add('visible');
    document.querySelectorAll('.stat-card').forEach((el, i) => {
      el.style.transitionDelay = `${0.1 + i * 0.13}s`;
      el.classList.add('visible');
    });
    document.querySelectorAll('[data-count]').forEach(el => animateCount(el));
  });
}, { threshold: 0.05 }).observe(statsSection);

document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
document.querySelectorAll('.feature-card').forEach((el, i) => { el.style.transitionDelay = `${i * 0.11}s`; io.observe(el); });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
document.querySelectorAll('.step-card').forEach((el, i) => { el.style.transitionDelay = `${i * 0.14}s`; io.observe(el); });
document.querySelectorAll('.telem-item').forEach((el, i) => { el.style.transitionDelay = `${i * 0.11}s`; io.observe(el); });
const ctaH2 = document.querySelector('#cta h2'); if (ctaH2) io.observe(ctaH2);

/* Dash mock animation */
const dashMock = document.getElementById('dash-mock');
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    document.querySelectorAll('.vehicle-row').forEach((row, i) => {
      setTimeout(() => {
        row.classList.add('visible');
        const fill = row.dataset.fill;
        if (fill) setTimeout(() => { row.querySelector('.progress-fill').style.width = fill + '%'; }, 150);
      }, i * 180);
    });
  });
}, { threshold: 0.2 }).observe(dashMock);

/* ═══════════════════════════════════════════════
   NAVBAR scroll effect
═══════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.background =
    window.scrollY > 40 ? 'rgba(8,13,26,0.97)' : 'rgba(8,13,26,0.8)';
}, { passive: true });
