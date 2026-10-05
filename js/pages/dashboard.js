/* ============================================================
   ManakAI — Dashboard.
   First viewport answers: what product, where am I, what's done,
   what's next.
   ============================================================ */

const DashboardPage = {
  render(main) {
    const s = Store.state;
    const product = Store.activeProduct;
    const name = s.user ? s.user.name.split(' ')[0] : 'there';
    main.append(h('div', { class: 'container page-pad' },
      h('div', { class: 'row-between', style: { flexWrap: 'wrap' } },
        h('div', null,
          h('h1', { class: 'h2' }, greeting() + ', ' + name + '.'),
          h('p', { class: 'lead', style: { fontSize: 'var(--type-lead)', margin: '0.4rem 0 0', textTransform: 'none', letterSpacing: '0' } }, 'Let\u2019s continue your compliance journey.')),
        ProductSwitcher()),
      product && product.journey ? this.withProduct(product) : this.noProduct()));
  },

  noProduct() {
    return h('div', { class: 'dash-grid', style: { marginTop: '1.5rem' } },
      h('div', { class: 'dash-main' },
        EmptyState({
          title: 'No journey yet',
          text: 'Your compliance journey starts with understanding your product. Tell ManakAI what you\u2019re making, and we\u2019ll map the requirements, build your checklist and guide you step by step.',
          action: h('a', { href: '#/consult', class: 'btn btn-primary btn-lg' }, icon('sparkle'), 'Start Your Journey'),
        })),
      h('aside', { class: 'dash-side' }, this.sideCards()));
  },

  withProduct(product) {
    const j = product.journey;
    const pct = journeyProgress(j);
    const stage = journeyStage(j);
    const stageLabel = (STAGES.find((x) => x.id === stage) || {}).label;
    const currentTask = j.tasks.find((t) => t.state === 'current');
    const doneCount = j.tasks.filter((t) => t.state === 'done').length;
    const category = (PRODUCT_TEMPLATES[j.templateId] || {}).category || 'General product';

    const motif = h('div', { class: 'grid-motif', 'aria-hidden': 'true', html: '<svg preserveAspectRatio="none"><rect width="100%" height="100%" fill="url(#gp-dash)"/><defs><pattern id="gp-dash" width="46" height="46" patternUnits="userSpaceOnUse"><path class="m-line" d="M46 0H0v46" fill="none"/><circle class="m-node" cx="23" cy="23" r="1.3"/></pattern></defs></svg>' });

    const stats = h('div', { class: 'stat-row' },
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, 'Progress'), h('div', { class: 'h3' }, pct + '%')),
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, 'Current stage'), h('div', { class: 'h3' }, stageLabel)),
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, 'Tasks done'), h('div', { class: 'h3' }, doneCount + ' of ' + j.tasks.length)),
      h('div', { class: 'stat' }, h('div', { class: 'stat-label' }, 'Industry'), h('div', { class: 'h3' }, (Store.state.profile && Store.state.profile.industry) || '\u2014')));

    const nextAction = h('div', { class: 'next-action', style: { marginTop: '1.5rem' } },
      h('div', { class: 'stat-label' }, 'Next action'),
      h('p', { style: { fontWeight: '500', margin: '0.25rem 0 0', textTransform: 'none', letterSpacing: '0' } }, nextActionText(j)),
      h('div', { class: 'row', style: { marginTop: '1rem', flexWrap: 'wrap' } },
        h('a', { href: currentTask ? '#/task/' + currentTask.id : '#/journey', class: 'btn btn-primary' }, 'Continue Journey', icon('arrow-right')),
        h('a', { href: '#/journey', class: 'btn btn-secondary' }, 'View Checklist')));

    const hero = h('div', { class: 'product-card-hero', style: { marginTop: '1.5rem' } }, motif,
      h('div', { style: { position: 'relative' } },
        h('div', { class: 'row' },
          h('p', { class: 'stat-label', style: { margin: 0 } }, 'Your product'),
          product.isDemo ? h('span', { class: 'pill-demo' }, icon('eye'), 'Demo data') : null),
        h('h2', { style: { margin: '0.6rem 0 0.25rem' } }, product.name),
        h('p', { class: 't-sm', style: { color: 'var(--on-dark-muted)', textTransform: 'none', letterSpacing: '0' } }, category),
        stats,
        h('div', { style: { marginTop: '1.25rem' } }, progressBar(pct)),
        nextAction));

    const timeline = h('section', { 'aria-label': 'Journey stages', class: 'card' },
      h('h2', { class: 'h4', style: { marginBottom: '1.1rem' } }, 'Your compliance journey'),
      JourneyTimeline(j));

    const productLink = (p) => h('a', { href: '#/products', class: 'row-between card-flat', style: { marginTop: '0.5rem', padding: '0.75rem 0.9rem' } },
      h('span', { class: 't-sm', style: { fontWeight: '500', textTransform: 'none', letterSpacing: '0' } },
        p.name, p.isDemo ? h('span', { class: 'pill-demo', style: { marginLeft: '0.4rem' } }, 'Demo') : null),
      h('span', { class: 't-sm', style: { fontWeight: '700', color: 'var(--accent)' } }, p.journey ? journeyProgress(p.journey) + '%' : '\u2014'));

    const productsCard = h('div', { class: 'card' },
      h('h2', { class: 'h4' }, 'My Products'),
      h('p', { class: 't-sm muted', style: { margin: '0.4rem 0 0.9rem', textTransform: 'none', letterSpacing: '0' } },
        Store.state.products.length + ' product' + (Store.state.products.length === 1 ? '' : 's') + ' in progress'),
      Store.state.products.map(productLink),
      h('a', { href: '#/products', class: 'btn btn-secondary btn-block', style: { marginTop: '1rem' } }, icon('plus'), 'Add Product'));

    return h('div', { class: 'dash-grid', style: { marginTop: '1.5rem' } },
      h('div', { class: 'dash-main', style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
        hero, CompliancePath(j), timeline),
      h('aside', { class: 'dash-side', style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
        this.sideCards(), productsCard));
  },

  sideCards() {
    const product = Store.activeProduct;
    const quick = [
      { icon: 'chat', t: 'Ask ManakAI', d: 'Continue your consultation in context', href: product && product.journey ? '#/journey' : '#/consult' },
      { icon: 'flask', t: 'Testing guidance', d: 'Required tests and recognised labs', href: '#/testing' },
      { icon: 'file', t: 'Final summary', d: 'Everything you\u2019ve completed so far', href: '#/summary' },
    ];
    return h('div', { class: 'card' },
      h('h2', { class: 'h4' }, 'Quick actions'),
      h('div', { class: 'stack', style: { marginTop: '1rem' } },
        quick.map((q) => h('a', { href: q.href, class: 'quick-card card-flat' },
          icon(q.icon),
          h('span', null,
            h('span', { style: { display: 'block', fontWeight: '700' } }, q.t),
            h('span', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0' } }, q.d))))));
  },
};
