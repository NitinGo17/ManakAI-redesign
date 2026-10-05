/* ============================================================
   ManakAI — shared components
   Brand lockup, nav, footer, badges, the journey timeline, the
   Compliance Path (the signature element), the source drawer and
   the task card.
   ============================================================ */

function BrandMark(dark) {
  return h('a', { href: '#/', class: 'brand', 'aria-label': 'ManakAI home' },
    h('span', { style: { width: '30px', height: '30px', display: 'block', flex: 'none' }, html: ICONS.logo }),
    h('span', { style: { display: 'flex', flexDirection: 'column' } },
      h('span', { class: 'brand-name', style: { color: dark ? 'var(--on-dark)' : 'var(--foreground)' } }, 'Manak', 'AI'),
      h('span', { class: 'brand-tag' }, 'From Product to Compliance')));
}

function renderNav() {
  const root = el('#nav-root');
  if (!root) return;
  root.innerHTML = '';
  const s = Store.state;
  const route = location.hash || '#/';
  const loggedIn = !!s.user;

  const links = loggedIn
    ? [
        { href: '#/dashboard', label: 'Dashboard', match: (r) => r.startsWith('#/dashboard') },
        { href: '#/journey', label: 'Journey', match: (r) => r.startsWith('#/journey') || r.startsWith('#/task') || r.startsWith('#/testing') },
        { href: '#/products', label: 'Products', match: (r) => r.startsWith('#/products') },
        { href: '#/summary', label: 'Summary', match: (r) => r.startsWith('#/summary') },
      ]
    : [
        { href: '#/', label: 'Home', match: (r) => r === '#/' || r === '' },
        { href: '#/login', label: 'Log in', match: (r) => r.startsWith('#/login') },
        { href: '#/register', label: 'Create account', match: (r) => r.startsWith('#/register') },
      ];

  root.append(h('header', { class: 'nav' },
    h('div', { class: 'container nav-inner' },
      BrandMark(),
      h('nav', { class: 'nav-links', 'aria-label': 'Main' },
        links.map((l) => h('a', { href: l.href, class: 'nav-link', 'aria-current': l.match(route) ? 'page' : null }, l.label))),
      h('div', { class: 'spacer' }),
      !loggedIn
        ? h('a', { href: '#/login?demo=1', class: 'btn btn-secondary btn-sm' }, 'Try Demo Mode')
        : [
            s.demoMode ? h('span', { class: 'pill-demo', title: 'You are exploring a simulated journey' }, icon('eye'), 'Demo Mode') : null,
            h('a', { href: '#/profile', class: 'avatar', 'aria-label': 'Profile — ' + (s.user.name || 'your account') },
              (s.user.name || 'U').trim().charAt(0).toUpperCase()),
            h('button', { class: 'btn btn-secondary btn-sm', onclick: () => { AuthService.logout(); toast('You have been logged out.'); Router.go('#/'); } }, icon('logout'), 'Log out'),
          ])));
}

function renderBottomNav() {
  const root = el('#bottomnav-root');
  if (!root) return;
  root.innerHTML = '';
  const s = Store.state;
  if (!s.user) { document.body.classList.remove('has-bottomnav'); return; }
  document.body.classList.add('has-bottomnav');
  const route = location.hash || '#/';
  const items = [
    { href: '#/dashboard', label: 'Home', icon: 'home', match: (r) => r.startsWith('#/dashboard') },
    { href: '#/journey', label: 'Journey', icon: 'journey', match: (r) => r.startsWith('#/journey') || r.startsWith('#/task') || r.startsWith('#/testing') },
    { href: '#/profile', label: 'Profile', icon: 'user', match: (r) => r.startsWith('#/profile') || r.startsWith('#/products') || r.startsWith('#/summary') },
  ];
  root.append(h('nav', { class: 'bottomnav', 'aria-label': 'Mobile navigation' },
    h('div', { class: 'bottomnav-links' },
      items.map((i) => h('a', { href: i.href, class: 'bottomnav-link', 'aria-current': i.match(route) ? 'page' : null }, icon(i.icon), i.label)))));
}

function renderFooter() {
  const root = el('#footer-root');
  if (!root) return;
  root.innerHTML = '';
  root.append(h('footer', { class: 'footer' },
    h('div', { class: 'container footer-grid' },
      h('div', null,
        BrandMark(true),
        h('p', { class: 't-sm', style: { marginTop: '1rem', maxWidth: '34em', color: 'var(--on-dark-muted)', textTransform: 'none', letterSpacing: '0', lineHeight: '1.6' } },
          'ManakAI is an independent AI-powered BIS compliance guidance platform. It is not affiliated with, endorsed by, or an official product of the Bureau of Indian Standards.'),
        h('p', { class: 't-sm', style: { marginTop: '0.75rem', color: 'var(--accent-2)', fontWeight: '500' } }, 'From Product to Compliance.')),
      h('div', null,
        h('h3', null, 'Product'),
        h('ul', { class: 'stack-sm', style: { marginTop: '0.9rem' } },
          h('li', null, h('a', { href: '#/' }, 'Home')),
          h('li', null, h('a', { href: '#/login?demo=1' }, 'Demo Mode')),
          h('li', null, h('a', { href: '#/register' }, 'Create account')))),
      h('div', null,
        h('h3', null, 'Official sources'),
        h('ul', { class: 'stack-sm', style: { marginTop: '0.9rem' } },
          h('li', null, h('a', { href: 'https://www.bis.gov.in/', target: '_blank', rel: 'noopener' }, 'Bureau of Indian Standards ↗')),
          h('li', null, h('a', { href: 'https://www.crsbis.in/', target: '_blank', rel: 'noopener' }, 'CRS Registration Portal ↗')),
          h('li', null, h('a', { href: 'https://lims.bis.gov.in/', target: '_blank', rel: 'noopener' }, 'BIS LIMS Lab Directory ↗'))))),
    h('div', { class: 'container footer-foot' },
      'Prototype build — demonstration data is labelled as Demo. Compliance-critical results always show their source and verification state.')));
}

function renderBanners() {
  const root = el('#banner-root');
  if (!root) return;
  root.innerHTML = '';
  const s = Store.state;
  if (s.offline) {
    root.append(h('div', { class: 'banner banner-offline', role: 'alert' }, icon('offline'),
      'You appear to be offline. You can still view your profile, journey and checklist — AI features need a connection.'));
  }
  if (s.demoMode && s.user) {
    root.append(h('div', { class: 'banner banner-demo' }, icon('eye'),
      h('span', null, 'Demo Mode — you are exploring a simulated compliance journey. Data shown is labelled as Demo.'),
      h('button', { class: 'btn btn-ghost btn-sm', onclick: () => Router.go('#/profile') }, 'Demo controls')));
  }
}

/* ── status badges ───────────────────────────────────────────────────────── */
function taskStateBadge(task) {
  if (task.state === 'done') return h('span', { class: 'badge badge-ok' }, icon('check-circle'), 'Completed');
  if (task.state === 'current') return h('span', { class: 'badge badge-progress' }, icon('clock'), 'In Progress');
  return h('span', { class: 'badge badge-neutral' }, icon('lock'), 'Locked');
}
function verificationBadge(vid) {
  const v = VERIFICATION[vid] || VERIFICATION.UNKNOWN;
  const label = { confirmed: 'Confirmed', 'likely-verify': 'Likely — verify', unknown: 'Unknown' }[v.id];
  return h('span', { class: 'badge ' + v.badge, title: label }, icon(v.icon), label);
}

/* ── journey timeline ────────────────────────────────────────────────────── */
function JourneyTimeline(journey, opts) {
  const compact = opts && opts.compact;
  const stageState = {};
  for (const st of STAGES) {
    const tasks = journey.tasks.filter((t) => t.stage === st.id);
    stageState[st.id] = tasks.length && tasks.every((t) => t.state === 'done') ? 'done'
      : tasks.some((t) => t.state === 'current') ? 'current'
      : tasks.some((t) => t.state !== 'done') ? 'locked' : 'done';
  }
  if (window.matchMedia('(max-width: 768px)').matches) {
    return h('div', { class: 'journey-v', role: 'list', 'aria-label': 'Compliance journey stages' },
      STAGES.map((st) => h('div', { class: 'journey-v-node ' + stageState[st.id], role: 'listitem' },
        h('div', { class: 'journey-dot' }, icon(stageState[st.id] === 'done' ? 'check' : stageState[st.id] === 'current' ? 'circle' : 'lock')),
        h('div', null,
          h('div', { class: 'row', style: { gap: '0.6rem' } },
            h('span', { class: 'journey-label' }, st.label),
            stageState[st.id] === 'current' ? h('span', { class: 'badge badge-progress' }, 'Current')
              : stageState[st.id] === 'done' ? h('span', { class: 'badge badge-ok' }, 'Done') : null),
          h('div', { class: 'journey-sub' }, st.short)))));
  }
  return h('div', { class: 'journey', role: 'list', 'aria-label': 'Compliance journey stages' },
    STAGES.map((st) => h('div', { class: 'journey-node ' + stageState[st.id], role: 'listitem' },
      h('div', { class: 'journey-dot' }, icon(stageState[st.id] === 'done' ? 'check' : stageState[st.id] === 'current' ? 'circle' : 'lock')),
      h('div', null,
        h('div', { class: 'journey-label' }, st.label),
        compact ? null : h('div', { class: 'journey-sub' }, st.short)))));
}

/* ── Compliance Path — the signature element ─────────────────────────────── */
function CompliancePath(journey) {
  if (!journey) return null;
  const stage = journeyStage(journey);
  const stageLabel = (STAGES.find((s) => s.id === stage) || {}).label || '';
  const next = nextActionText(journey);
  const done = journeyProgress(journey) >= 100;
  return h('nav', { class: 'cpath', 'aria-label': 'Compliance path — where you are' },
    h('span', { class: 'cpath-label' }, icon('grid'), 'Path'),
    h('span', { class: 'cpath-step is-you' }, icon('user'), 'You'),
    sep(),
    h('span', { class: 'cpath-step is-current' }, icon(stage === 'certification' && done ? 'ribbon' : 'layers'), stageLabel),
    sep(),
    h('span', { class: 'cpath-step is-action', title: next }, icon('arrow-right'), truncate(next, 44)),
    sep(),
    h('span', { class: 'cpath-step is-goal' }, icon('shield'), 'Compliant'));
}
function sep() { return h('span', { class: 'cpath-sep', 'aria-hidden': 'true' }, icon('chevron-right')); }
function truncate(t, n) { return t.length > n ? t.slice(0, n - 1) + '…' : t; }

/* ── source drawer ───────────────────────────────────────────────────────── */
function openSourceDrawer(sourceRef) {
  const src = typeof sourceRef === 'string' ? SOURCES[sourceRef] : sourceRef;
  if (!src) return;
  openDrawer({
    title: 'Source details',
    label: 'Source details for this requirement',
    body: h('div', { class: 'stack' },
      h('dl', { class: 'structured-card' },
        h('div', { class: 'structured-row' }, h('dt', null, 'Source'), h('dd', null, src.org + ' (' + src.orgShort + ')')),
        h('div', { class: 'structured-row' }, h('dt', null, 'Document'), h('dd', null, src.document)),
        h('div', { class: 'structured-row' }, h('dt', null, 'Relevant section'), h('dd', null, src.section)),
        h('div', { class: 'structured-row' }, h('dt', null, 'Last updated'), h('dd', null, fmtDate(src.updated))),
        h('div', { class: 'structured-row' }, h('dt', null, 'Checked by'), h('dd', null, src.verifiedBy))),
      src.note ? h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } }, src.note) : null,
      src.url ? h('a', { class: 'btn btn-secondary btn-block', href: src.url, target: '_blank', rel: 'noopener' }, icon('external'), 'View Official Source') : null,
      h('p', { class: 't-xs muted-3', style: { textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } }, 'ManakAI records where each compliance-critical result comes from. Always read the official text before acting.')),
  });
}
function SourceButton(sourceRef, small) {
  return h('button', {
    class: 'btn btn-secondary' + (small ? ' btn-sm' : ''),
    onclick: (e) => { e.stopPropagation(); openSourceDrawer(sourceRef); },
    'aria-label': 'View source details for this requirement',
  }, icon('source'), 'Source');
}

/* ── task card ───────────────────────────────────────────────────────────── */
function TaskCard(task, product, onOpen) {
  const locked = task.state === 'locked';
  return h('article', {
    class: 'card task-card is-' + task.state + (locked ? '' : ' card-click'),
    tabindex: locked ? null : '0',
    role: 'button',
    'aria-label': 'Task ' + task.num + ': ' + task.title + ' — ' + (locked ? 'locked' : task.state === 'done' ? 'completed' : 'in progress'),
    onclick: () => { if (!locked && onOpen) onOpen(task); },
    onkeydown: (e) => { if (!locked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(task); } },
  },
    h('div', { class: 'task-num' }, task.num),
    h('div', null,
      h('div', { class: 'task-title-row' },
        h('h3', { class: 'h4' }, task.title),
        taskStateBadge(task),
        product.isDemo ? h('span', { class: 'pill-demo' }, 'Demo') : null),
      h('p', { class: 't-sm muted', style: { marginTop: '0.4rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } }, task.short),
      task.state === 'current' ? h('div', { style: { marginTop: '0.85rem' } },
        progressBar(taskProgress(task)),
        h('div', { class: 't-xs muted-3', style: { marginTop: '0.35rem' } }, taskProgress(task) + '% of steps done')) : null,
      h('div', { class: 'req-meta' }, SourceButton(task.sourceRef, true)),
      task.state === 'current' && task.steps.length
        ? h('div', { class: 'task-substeps' },
            task.steps.map((s) => h('div', { class: 'substep' + (task.stepsDone.includes(s.id) ? ' is-done' : '') },
              icon(task.stepsDone.includes(s.id) ? 'check-circle' : 'circle'), s.text)))
        : null),
    h('div', { class: 'task-actions' },
      task.state === 'current' ? h('button', { class: 'btn btn-primary', onclick: (e) => { e.stopPropagation(); onOpen(task); } }, 'Continue')
      : task.state === 'done' ? h('button', { class: 'btn btn-secondary', onclick: (e) => { e.stopPropagation(); onOpen(task); } }, 'Review')
      : h('span', { class: 't-xs muted-3 nowrap' }, 'Complete earlier tasks')));
}

/* ── small helpers ───────────────────────────────────────────────────────── */
function progressBar(pct) {
  return h('div', { class: 'progressbar', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'Progress ' + pct + '%' },
    h('div', { class: 'progressbar-fill', style: { width: pct + '%' } }));
}
function EmptyState({ title, text, action }) {
  return h('div', { class: 'card empty' },
    h('div', { class: 'empty-icon' }, icon('journey')),
    h('h2', { class: 'h3' }, title),
    h('p', { class: 'lead', style: { fontSize: 'var(--type-lead)', margin: '0.75rem auto 1.5rem', textTransform: 'none', letterSpacing: '0' } }, text),
    action);
}
function SkeletonCard() {
  return h('div', { class: 'card', 'aria-hidden': 'true' },
    h('div', { class: 'skeleton', style: { height: '18px', width: '40%', marginBottom: '12px' } }),
    h('div', { class: 'skeleton', style: { height: '13px', width: '90%', marginBottom: '8px' } }),
    h('div', { class: 'skeleton', style: { height: '13px', width: '70%' } }));
}
function LoadingMessage(text) {
  return h('div', { class: 'row', style: { padding: '0.85rem 0', color: 'var(--foreground-soft)' } },
    icon('sparkle'), h('span', { role: 'status' }, text));
}
function ProductSwitcher() {
  const products = Store.state.products;
  if (products.length < 2) return null;
  return h('label', { class: 'field', style: { marginTop: '0' } },
    h('span', { class: 'field-label' }, 'Working on'),
    h('select', {
      class: 'select', 'aria-label': 'Working on',
      onchange: (e) => { Store.switchProduct(e.target.value); toast('Switched to ' + (Store.activeProduct ? Store.activeProduct.name : '')); Router.go('#/journey'); },
    }, products.map((p) => h('option', { value: p.id, selected: p.id === Store.state.activeProductId ? true : null },
      p.name + (p.journey ? ' — ' + journeyProgress(p.journey) + '%' : '')))));
}
