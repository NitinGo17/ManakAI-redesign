/* ============================================================
   ManakAI — motion core
   One rAF ticker, react-spring's damped spring, and the small
   helpers every animated thing on the page is built from.
   Nothing on the page is a CSS keyframe.
   ============================================================ */

const Ticker = (() => {
  const subs = new Set();
  let raf = 0;
  const loop = (time) => {
    raf = requestAnimationFrame(loop);
    for (const s of Array.from(subs)) {
      if (!subs.has(s)) continue;
      if (time - s.last > s.framerate) { s.last = time; s.callback(time); }
    }
  };
  return {
    subscribe(callback, getFramerate) {
      const sub = { callback, last: 0 };
      Object.defineProperty(sub, 'framerate', { get: getFramerate || (() => 0) });
      subs.add(sub);
      if (subs.size === 1) raf = requestAnimationFrame(loop);
      return () => { subs.delete(sub); if (!subs.size) cancelAnimationFrame(raf); };
    },
  };
})();

/* Spring configs, by name. { tension, friction }, mass 1. */
const SPRING = {
  REVEAL: { tension: 90, friction: 26 },
  ROW: { tension: 170, friction: 24 },
  ITEM: { tension: 170, friction: 24 },
  FIGURE: { tension: 200, friction: 24 },
  TYPE: { tension: 210, friction: 24 },
  COPY: { tension: 110, friction: 26 },
  NAME: { tension: 190, friction: 24 },
  VEIL: { tension: 70, friction: 24 },
  CLEAR: { tension: 140, friction: 26 },
  PROGRESS_WAIT: { tension: 10, friction: 30 },
  PROGRESS_READY: { tension: 170, friction: 26 },
};

const Springs = (() => {
  const active = new Set();
  let last = 0;
  function make(value, config, onFrame) {
    const s = { value, velocity: 0, target: value, config, delay: 0, onFrame, epsilon: 0.01 };
    return s;
  }
  function to(s, target, delay, config, epsilon) {
    if (config) s.config = config;
    s.target = target; s.delay = delay || 0; s.epsilon = epsilon || 0.01;
    active.add(s);
  }
  function step() {
    const now = performance.now();
    const cap = Math.min(64, now - (last || now));
    last = now;
    for (const s of Array.from(active)) {
      if (s.delay > 0) { s.delay -= cap; continue; }
      let remaining = cap;
      while (remaining > 0) {
        const dt = Math.min(1, remaining); remaining -= dt;
        const accel = -s.config.tension * (s.value - s.target) - s.config.friction * s.velocity;
        s.velocity += accel * (dt / 1000);
        s.value += s.velocity * (dt / 1000);
      }
      if (Math.abs(s.velocity) < 0.01 && Math.abs(s.target - s.value) < s.epsilon) {
        s.value = s.target; s.velocity = 0; active.delete(s);
      }
      if (s.onFrame) s.onFrame(s.value);
    }
  }
  Ticker.subscribe(step, () => 0);
  return { make, to };
})();

/* A value-driven spring a reader can pull each frame. */
function drivenSpring(initial, config) {
  return { value: initial, velocity: 0, target: initial, config };
}
function driveStep(s, dtMs) {
  let remaining = dtMs;
  while (remaining > 0) {
    const dt = Math.min(1, remaining); remaining -= dt;
    const accel = -s.config.tension * (s.value - s.target) - s.config.friction * s.velocity;
    s.velocity += accel * (dt / 1000);
    s.value += s.velocity * (dt / 1000);
  }
}

/* ── helpers ─────────────────────────────────────────────────────────────── */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
