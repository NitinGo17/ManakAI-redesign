/* ============================================================
   ManakAI — the text engine.
   A block of text splits into words or letters; each unit runs its
   own spring from *out to *in. A visually-hidden copy is kept for
   assistive technology and the animated spans are aria-hidden.
   ============================================================ */

const Reveals = [];

function buildReveal(el) {
  if (el.dataset.built) return null;
  el.dataset.built = '1';
  const text = el.textContent;
  const split = el.dataset.split || 'word';
  const stagger = Number(el.dataset.stagger || 0);
  const delay = Number(el.dataset.delay || 0);
  const config = SPRING[el.dataset.config || 'REVEAL'] || SPRING.REVEAL;
  const mode = el.dataset.mode || 'always';
  const gap = el.dataset.gap;
  const em = split === 'letter' ? '0.3em' : '0.35em';

  const units = split === 'letter' ? Array.from(text) : text.split(/(\s+)/).filter((p) => p.length);
  el.textContent = '';
  if (gap) el.style.columnGap = gap;

  const hidden = document.createElement('span');
  hidden.className = 'visually-hidden';
  hidden.textContent = text;
  el.parentNode.insertBefore(hidden, el.nextSibling);

  const states = [];
  units.forEach((u) => {
    if (/^\s+$/.test(u)) { el.appendChild(document.createTextNode(u)); return; }
    const span = document.createElement('span');
    span.className = 'u';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = u;
    el.appendChild(span);
    states.push({
      span,
      opacity: Springs.make(0, config),
      y: Springs.make(parseFloat(em), config),
      delay: delay + states.length * stagger,
      on: false,
    });
  });

  const play = () => {
    states.forEach((st) => {
      if (st.on) return;
      st.on = true;
      Springs.to(st.opacity, 1, st.delay, config, 0.001);
      Springs.to(st.y, 0, st.delay, config, 0.001);
    });
  };
  const reverse = () => {
    states.forEach((st) => {
      if (!st.on) return;
      st.on = false;
      Springs.to(st.opacity, 0, 0, config, 0.001);
      Springs.to(st.y, parseFloat(em), 0, config, 0.001);
    });
  };

  Ticker.subscribe(() => {
    for (const st of states) {
      st.span.style.opacity = String(st.opacity.value);
      st.span.style.transform = `translateY(${st.y.value}em)`;
    }
  }, () => 0);

  const entry = { el, play, reverse, mode };
  Reveals.push(entry);
  return entry;
}

function initReveals(root) {
  (root || document).querySelectorAll('[data-reveal]').forEach(buildReveal);
}

/* Play every reveal not already wired to a scroll gate (used by hero sections). */
function playRevealsIn(scope) {
  Reveals.forEach((r) => { if (scope.contains(r.el)) r.play(); });
}
