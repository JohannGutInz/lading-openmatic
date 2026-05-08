/* ═══════════════════════════════════════════════
   APPLE VIDEO SCROLL
═══════════════════════════════════════════════ */
(function () {
  const canvas   = document.getElementById('hero-canvas');
  const ctx      = canvas.getContext('2d');
  const video    = document.getElementById('hero-video-bg');
  const container= document.getElementById('hero-scroll-container');
  let frames = [], videoReady = false, useCanvas = false;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function drawFrame(img) {
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.max(cw / iw, ch / ih);
    ctx.drawImage(img, (cw - iw * scale) / 2, (ch - ih * scale) / 2, iw * scale, ih * scale);
  }

  function onScroll() {
    const scrolled = window.scrollY;
    const max = container.offsetHeight - window.innerHeight;
    const p = Math.min(Math.max(scrolled / max, 0), 1);
    if (useCanvas && frames.length > 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFrame(frames[Math.round(p * (frames.length - 1))]);
    } else if (videoReady && isFinite(video.duration)) {
      video.currentTime = p * video.duration;
    }
  }

  const barEl = document.getElementById('loader-bar');
  const pctEl = document.getElementById('loader-pct');
  const lblEl = document.getElementById('loader-label');
  const ldrEl = document.getElementById('loader');

  function setProgress(pct, label) {
    barEl.style.width = pct + '%';
    pctEl.textContent = Math.round(pct) + '%';
    if (label) lblEl.textContent = label;
  }

  function reveal() {
    setProgress(100, 'Listo');
    setTimeout(() => {
      ldrEl.classList.add('done');
      document.body.classList.remove('loading');
      document.querySelectorAll('body > *:not(#loader)').forEach(el => { el.style.visibility = ''; });
    }, 380);
  }

  async function extractFrames() {
    return new Promise(resolve => {
      const v = document.createElement('video');
      v.src = 'assets/camion.mp4'; v.crossOrigin = 'anonymous'; v.muted = true; v.preload = 'auto';
      setProgress(5, 'Descargando video…');
      v.addEventListener('loadedmetadata', async () => {
        const dur = v.duration;
        if (!isFinite(dur) || dur === 0) { resolve(false); return; }
        const count = Math.min(120, Math.floor(dur * 24));
        const off = document.createElement('canvas');
        off.width = window.innerWidth; off.height = window.innerHeight;
        const offCtx = off.getContext('2d');
        const captured = [];
        for (let i = 0; i < count; i++) {
          const t = (i / (count - 1)) * dur;
          await new Promise(res => {
            v.currentTime = t;
            v.addEventListener('seeked', () => {
              offCtx.drawImage(v, 0, 0, off.width, off.height);
              const img = new Image(); img.src = off.toDataURL('image/jpeg', 0.75);
              captured.push(img);
              setProgress(10 + ((i + 1) / count) * 85, `Preparando frames… ${i + 1}/${count}`);
              res();
            }, { once: true });
          });
        }
        frames = captured; useCanvas = true;
        canvas.style.display = 'block';
        if (frames[0]) { ctx.drawImage(frames[0], 0, 0); }
        resolve(true);
      });
      v.addEventListener('error', () => resolve(false));
      v.load();
    });
  }

  function initFallback() {
    setProgress(30, 'Cargando video…');
    video.style.display = 'block'; canvas.style.display = 'none';
    video.addEventListener('loadedmetadata', () => { videoReady = true; video.currentTime = 0; });
    video.addEventListener('canplaythrough', reveal, { once: true });
    setTimeout(reveal, 8000);
    video.load();
  }

  (async function init() {
    resize();
    const ok = await extractFrames();
    if (!ok) initFallback(); else reveal();
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();
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

document.querySelectorAll('.stat-card').forEach((el, i) => { el.style.transitionDelay = `${i * 0.1}s`; io.observe(el); });
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
