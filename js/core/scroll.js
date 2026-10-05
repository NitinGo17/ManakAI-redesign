/* ============================================================
   ManakAI — scroll: in-view gates, scrub triggers, the sticky
   stack recede, root font bands, and the loading veil.
   ============================================================ */

/* ── in-view gate ────────────────────────────────────────────────────────── */
function inView(el, cb, rootMargin, once) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { cb(true); if (once !== false) io.disconnect(); }
      else if (once === false) cb(false);
    }
  }, { rootMargin: rootMargin || '0% 0% -10% 0%' });
  io.observe(el);
  return io;
}

/* ── scroll triggers ─────────────────────────────────────────────────────── */
const Triggers = [];
const POSES = (bb, vh) => ({
  top_top: bb.top, center_top: bb.top + bb.height / 2, bottom_top: bb.bottom,
  top_bottom: bb.top - vh, center_bottom: bb.top + bb.height / 2 - vh, bottom_bottom: bb.bottom - vh,
  top_center: bb.top - vh / 2, center_center: bb.top + bb.height / 2 - vh / 2, bottom_center: bb.bottom - vh / 2,
});
function scrubTrigger(el, start, end, onProgress) {
  const t = { el, start, end, onProgress, progress: -1, visible: false, framesOut: 0 };
  const io = new IntersectionObserver((entries) => { for (const e of entries) t.visible = e.isIntersecting; });
  io.observe(el);
  Triggers.push(t);
  return t;
}
function runTriggers() {
  const vh = window.innerHeight;
  for (const t of Triggers) {
    if (!t.visible && t.framesOut > 10) continue;
    if (!t.visible) t.framesOut += 1; else t.framesOut = 0;
    const bb = t.el.getBoundingClientRect();
    const poses = POSES(bb, vh);
    const s = poses[t.start];
    const e = poses[t.end];
    const length = Math.abs(s - e) || 1;
    const p = Math.min(Math.max(0, 1 - (s + length) / length), 1);
    if (Math.abs(p - t.progress) > 0.0005) { t.progress = p; t.onProgress(p); }
  }
}
Ticker.subscribe(runTriggers, () => 10);

/* Wire every reveal inside a scope to play as it enters the viewport. */
function wireRevealGates(scope) {
  const root = scope || document;
  Reveals.forEach((r) => {
    if (!root.contains(r.el)) return;
    if (r.el.dataset.gated) return;
    r.el.dataset.gated = '1';
    if (r.mode === 'always') {
      inView(r.el, (on) => { if (on) r.play(); else r.reverse(); }, '0% 0% -10% 0%', false);
    } else {
      inView(r.el, () => r.play(), '0% 0% -10% 0%', true);
    }
  });
}

/* A plain rise for containers that hold child elements (which the text
   engine must not touch): a spring on opacity + translateY. */
function makeRise(el, delay) {
  el.style.opacity = '0';
  const o = Springs.make(0, SPRING.REVEAL);
  const y = Springs.make(18, SPRING.REVEAL);
  o.onFrame = (v) => { el.style.opacity = String(v); };
  y.onFrame = (v) => { el.style.transform = `translateY(${v / 16}rem)`; };
  let played = false;
  return { play() { if (played) return; played = true; Springs.to(o, 1, delay || 0, SPRING.REVEAL, 0.001); Springs.to(y, 0, delay || 0, SPRING.REVEAL, 0.001); } };
}
function wireRiseGates(scope) {
  const root = scope || document;
  root.querySelectorAll('[data-rise]').forEach((el) => {
    if (el.dataset.riseGated) return;
    el.dataset.riseGated = '1';
    const r = makeRise(el, Number(el.dataset.riseDelay || 0));
    if (el.dataset.gate === 'manual') { el._rise = r; return; }
    inView(el, () => r.play(), '0% 0% -10% 0%', true);
  });
}
function playRiseIn(scope) {
  scope.querySelectorAll('[data-rise]').forEach((el) => { if (el._rise) el._rise.play(); });
}

/* ── the sticky stack ────────────────────────────────────────────────────── */
const RECEDE_SCALE = 0.9;
const RECEDE_SHADE = 0.55;
function initStickyStack() {
  const phone = window.matchMedia('(max-width: 639px)');
  const pinned = [];
  document.querySelectorAll('[data-stack] .layer').forEach((layer, i, all) => {
    const next = all[i + 1];
    if (!next) return;
    pinned.push({ inner: layer.querySelector('.inner'), shade: layer.querySelector('.shade'), next });
  });
  if (!pinned.length) return;
  let queued = false;
  const apply = () => {
    queued = false;
    const view = window.innerHeight || 1;
    const shrink = phone.matches ? 0 : 1 - RECEDE_SCALE;
    for (const { inner, shade, next } of pinned) {
      const p = Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / view));
      inner.style.transform = p > 0 && shrink > 0 ? `scale(${1 - shrink * p})` : '';
      shade.style.opacity = String(RECEDE_SHADE * p);
      inner.style.visibility = p >= 1 ? 'hidden' : 'visible';
    }
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(apply); } }, { passive: true });
  window.addEventListener('resize', apply);
  apply();
}

/* ── the root font-size, above 1920 ──────────────────────────────────────── */
function setRootBands() {
  const w = window.innerWidth;
  document.documentElement.style.fontSize = w > 1920 ? `${(16 * w) / 1920}px` : '';
}
setRootBands();
window.addEventListener('resize', setRootBands);

/* ── the loading veil ────────────────────────────────────────────────────── */
function makeVeil() {
  const el = document.createElement('div');
  el.className = 'veil';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Loading ManakAI');
  el.innerHTML = `
    <span class="veil-mark" aria-hidden="true">${ICONS.logo}</span>
    <span class="veil-name" aria-hidden="true">ManakAI</span>
    <span class="veil-sub" aria-hidden="true">From Product to Compliance</span>
    <span class="meter"><span class="bar"></span></span>`;
  document.body.appendChild(el);
  const bar = el.querySelector('.bar');
  const progress = Springs.make(0, SPRING.PROGRESS_WAIT);
  Ticker.subscribe(() => { bar.style.transform = `scaleX(${progress.value})`; }, () => 0);
  Springs.to(progress, 0.7, 0, SPRING.PROGRESS_WAIT, 0.001);
  return {
    el,
    ready() {
      Springs.to(progress, 1, 0, SPRING.PROGRESS_READY, 0.001);
      const o = Springs.make(1, SPRING.VEIL);
      o.onFrame = (v) => { el.style.opacity = String(v); };
      setTimeout(() => Springs.to(o, 0, 0, SPRING.VEIL, 0.0005), 200);
      const started = performance.now();
      const poll = () => {
        const op = parseFloat(getComputedStyle(el).opacity || '0');
        if (op <= 0.004 || performance.now() - started > 3000) { el.remove(); return; }
        requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    },
  };
}
