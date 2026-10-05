/* ============================================================
   ManakAI — Router. Hash routing with auth + onboarding guards,
   a 404, and the per-page motion wiring (text reveals, scroll
   gates, sticky stack).
   ============================================================ */

const Router = {
  routes: [
    { match: (r) => r === '#/' || r === '' || r === '#', page: () => HomePage, guard: null },
    { match: (r) => r.startsWith('#/login'), page: () => AuthPage, guard: 'guest' },
    { match: (r) => r.startsWith('#/register'), page: () => AuthPage, guard: 'guest' },
    { match: (r) => r.startsWith('#/onboarding'), page: () => OnboardingPage, guard: 'auth' },
    { match: (r) => r.startsWith('#/dashboard'), page: () => DashboardPage, guard: 'app' },
    { match: (r) => r.startsWith('#/consult'), page: () => ConsultPage, guard: 'app' },
    { match: (r) => r.startsWith('#/journey'), page: () => ChecklistPage, guard: 'app' },
    { match: (r) => r.startsWith('#/task/'), page: () => TaskPage, guard: 'app' },
    { match: (r) => r.startsWith('#/testing'), page: () => TestingPage, guard: 'app' },
    { match: (r) => r.startsWith('#/summary'), page: () => SummaryPage, guard: 'app' },
    { match: (r) => r.startsWith('#/products'), page: () => ProductsPage, guard: 'app' },
    { match: (r) => r.startsWith('#/profile'), page: () => ProfilePage, guard: 'auth' },
  ],

  current: '',

  go(hash) {
    if (location.hash === hash) this.handle();
    else location.hash = hash;
  },

  handle() {
    const route = location.hash || '#/';
    this.current = route;
    const s = Store.state;
    const def = this.routes.find((r) => r.match(route));

    if (def) {
      if (def.guard === 'guest' && s.user) { this.replace('#/dashboard'); return; }
      if (def.guard === 'auth' && !s.user) { this.replace('#/login'); return; }
      if (def.guard === 'app') {
        if (!s.user) { this.replace('#/login'); return; }
        if (!s.profile) { this.replace('#/onboarding'); return; }
      }
      if (route === '#/onboarding' && s.profile && s.profile.userType) { this.replace('#/dashboard'); return; }
    }

    el('#overlay-root').innerHTML = '';
    document.body.style.overflow = '';

    const main = el('#main');
    main.innerHTML = '';
    window.scrollTo(0, 0);

    if (!def) {
      main.append(h('div', { class: 'container-narrow page-pad text-center' },
        h('div', { class: 'empty-icon', style: { margin: '0 auto 1rem' } }, icon('search')),
        h('h1', { class: 'h2' }, 'Page not found'),
        h('p', { class: 'lead', style: { fontSize: 'var(--type-lead)', margin: '0.75rem auto 1.25rem', textTransform: 'none', letterSpacing: '0' } }, 'The page you\u2019re looking for doesn\u2019t exist.'),
        h('a', { href: '#/', class: 'btn btn-primary' }, 'Back to home')));
    } else {
      def.page().render(main, route);
    }

    renderNav();
    renderBottomNav();
    renderFooter();
    renderBanners();
    document.body.classList.toggle('is-home', route === '#/' || route === '' || route === '#');

    /* per-page motion */
    initReveals(main);
    wireRevealGates(main);
    wireRiseGates(main);
    initStickyStack();

    main.focus({ preventScroll: true });
  },

  replace(hash) {
    location.replace(hash);
    if (location.hash === hash) this.handle();
  },

  rerenderIfCurrent(routePrefix) {
    if ((location.hash || '#/').startsWith(routePrefix)) this.handle();
  },

  start() {
    window.addEventListener('hashchange', () => this.handle());
    this.handle();
  },
};
