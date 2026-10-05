/* ============================================================
   ManakAI — Testing & lab guidance.
   Required tests for the active product, plus recognised-lab
   guidance. No fabricated fees or timelines.
   ============================================================ */

const TestingPage = {
  render(main) {
    const product = Store.activeProduct;
    if (!product || !product.journey) {
      main.append(h('div', { class: 'container page-pad' }, EmptyState({
        title: 'No journey yet',
        text: 'Testing guidance appears once ManakAI has analysed your product and built your journey.',
        action: h('a', { href: '#/consult', class: 'btn btn-primary' }, icon('sparkle'), 'Start Your Journey'),
      })));
      return;
    }
    const tpl = PRODUCT_TEMPLATES[product.journey.templateId] || PRODUCT_TEMPLATES.generic;

    main.append(h('div', { class: 'container page-pad' },
      h('p', { class: 'eyebrow' }, 'Stage — Testing'),
      h('h1', { class: 'h1' }, 'Product Testing'),
      h('p', { class: 'lead', style: { fontSize: 'var(--type-lead)', marginTop: '0.6rem' } },
        'Required tests for ', h('strong', null, product.name), ', and guidance on finding a recognised laboratory.'),
      CompliancePath(product.journey),
      h('section', { style: { marginTop: '2rem' }, 'aria-label': 'Required tests' },
        h('h2', { class: 'h2' }, 'Required Tests'),
        h('p', { class: 't-sm muted', style: { margin: '0.5rem 0 1.25rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } },
          'Test names below are indicative of the areas the standard covers. The exact test parameters are defined in the standard text — available from BIS.'),
        h('div', { class: 'tasks' }, tpl.tests.map((t) => this.testCard(t)))),
      this.labsSection()));
  },

  testCard(t) {
    const statusLabel = t.status === 'done' ? 'Completed' : t.status === 'scheduled' ? 'Scheduled' : 'Not started';
    const badge = t.status === 'done' ? h('span', { class: 'badge badge-ok' }, icon('check-circle'), statusLabel)
      : t.status === 'scheduled' ? h('span', { class: 'badge badge-progress' }, icon('clock'), statusLabel)
      : h('span', { class: 'badge badge-neutral' }, icon('circle'), statusLabel);
    return h('article', { class: 'card test-card' },
      h('span', { class: 'test-icon' }, icon('flask')),
      h('div', null,
        h('h3', { class: 'h4' }, t.name),
        h('p', { class: 't-sm muted', style: { marginTop: '0.4rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } }, t.purpose)),
      h('div', null, badge));
  },

  labsSection() {
    return h('section', { style: { marginTop: '3rem' }, 'aria-label': 'Find a relevant lab' },
      h('h2', { class: 'h2' }, 'Find a Relevant Lab'),
      h('p', { class: 't-sm muted', style: { margin: '0.5rem 0 0.6rem', maxWidth: '52em', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } },
        'Testing must be carried out by a laboratory recognised by BIS. The entries below come from the BIS LIMS recognised-laboratory directory — always confirm the lab\u2019s current recognition and scope on BIS LIMS before submitting samples.'),
      h('div', { style: { margin: '0.75rem 0 1.25rem' } },
        h('a', { href: 'https://lims.bis.gov.in/home/search_is_number/', target: '_blank', rel: 'noopener', class: 'btn btn-secondary' }, icon('external'), 'Search BIS LIMS directory')),
      h('div', { class: 'grid-2' }, LABORATORIES.map((lab) => this.labCard(lab))));
  },

  labCard(lab) {
    return h('article', { class: 'card lab-card' + (lab.isDemo ? ' card-flat' : '') },
      h('div', { class: 'row-between' },
        h('h3', { class: 'h4' }, lab.name),
        lab.isDemo ? h('span', { class: 'pill-demo' }, icon('eye'), 'Illustrative') : null),
      h('div', { class: 'lab-row' }, icon('map'), lab.location),
      h('div', { class: 'lab-row' }, icon('flask'), lab.capability),
      h('div', { class: 'lab-row' }, icon('shield'), 'Recognised laboratory — verify current scope on BIS LIMS'),
      h('div', { class: 'row', style: { marginTop: '1rem' } },
        h('a', { href: lab.website, target: '_blank', rel: 'noopener', class: 'btn btn-secondary btn-sm' }, icon('external'), 'BIS LIMS entry'),
        SourceButton(lab.sourceRef, true)));
  },
};
