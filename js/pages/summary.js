/* ============================================================
   ManakAI — Final compliance summary.
   ============================================================ */

const SummaryPage = {
  render(main) {
    const product = Store.activeProduct;
    if (!product || !product.journey) {
      main.append(h('div', { class: 'container page-pad' }, EmptyState({
        title: 'No journey yet',
        text: 'Your final summary appears once your compliance journey is underway.',
        action: h('a', { href: '#/consult', class: 'btn btn-primary' }, icon('sparkle'), 'Start Your Journey'),
      })));
      return;
    }
    const j = product.journey;
    const tpl = PRODUCT_TEMPLATES[j.templateId] || PRODUCT_TEMPLATES.generic;
    const pct = journeyProgress(j);
    const outstanding = j.tasks.filter((t) => t.state !== 'done');
    const usedSources = [...new Set(j.tasks.map((t) => t.sourceRef))].map((k) => SOURCES[k]).filter(Boolean);

    const checkItem = (label, done) => h('div', { class: 'summary-check ' + (done ? 'is-done' : 'is-open') },
      icon(done ? 'check-circle' : 'clock'),
      h('span', null, label, done ? h('span', { class: 'sr-only' }, ' (completed)') : h('span', { class: 't-xs', style: { opacity: '.8' } }, ' (in progress)')));

    const stageDone = (id) => j.tasks.filter((t) => t.stage === id).length > 0
      && j.tasks.filter((t) => t.stage === id).every((t) => t.state === 'done');

    const hero = h('div', { class: 'summary-hero' },
      h('div', { class: 'grid-motif', 'aria-hidden': 'true', html: '<svg preserveAspectRatio="none"><rect width="100%" height="100%" fill="url(#gp-sum)"/><defs><pattern id="gp-sum" width="46" height="46" patternUnits="userSpaceOnUse"><path class="m-line" d="M46 0H0v46" fill="none"/><circle class="m-node" cx="23" cy="23" r="1.3"/></pattern></defs></svg>' }),
      h('div', { style: { position: 'relative' } },
        h('p', { class: 'eyebrow eyebrow-copper' }, 'Compliance Journey'),
        h('h1', { class: 'h1', style: { margin: '0.6rem 0' } }, product.name),
        h('p', { style: { color: 'var(--on-dark-muted)', textTransform: 'none', letterSpacing: '0' } },
          pct + '% complete · ' + (outstanding.length === 0 ? 'All tasks done' : outstanding.length + ' task' + (outstanding.length === 1 ? '' : 's') + ' remaining')),
        h('div', { style: { margin: '1.5rem auto 0', maxWidth: '760px' } }, progressBar(pct)),
        h('div', { class: 'summary-checks', style: { margin: '1.5rem auto 0', maxWidth: '760px' } },
          checkItem('Product identified', true),
          checkItem('Applicable requirements reviewed', stageDone('discovery')),
          checkItem('Product requirements verified', stageDone('requirements')),
          checkItem('Testing completed', stageDone('testing')),
          checkItem('Documentation prepared', stageDone('documentation')),
          checkItem('Certification process', stageDone('certification')))));

    const dl = (rows) => h('dl', { class: 'structured-card' },
      rows.map((r) => h('div', { class: 'structured-row' }, h('dt', null, r[0]), h('dd', null, r[1]))));

    const summary = h('section', { class: 'card', style: { marginTop: '1.5rem' }, 'aria-label': 'Final summary' },
      h('h2', { class: 'h3' }, 'Final Summary'),
      h('div', { class: 'stack', style: { marginTop: '1rem' } },
        dl([
          ['Product', product.name + (product.isDemo ? ' (Demo data)' : '')],
          ['Industry', (Store.state.profile && Store.state.profile.industry) || '\u2014'],
          ['Applicable requirements', tpl.requirements.length + ' mapped — ' + tpl.requirements.filter((r) => r.verification === 'CONFIRMED').length + ' confirmed, ' + tpl.requirements.filter((r) => r.verification === 'LIKELY_VERIFY').length + ' likely, ' + tpl.requirements.filter((r) => r.verification === 'UNKNOWN').length + ' unknown'],
          ['Testing', tpl.tests.length + ' required tests identified'],
          ['Documents', j.tasks.find((t) => t.stage === 'documentation') ? j.tasks.find((t) => t.stage === 'documentation').need.join(', ') : '\u2014'],
          ['Certification status', stageDone('certification') ? 'Completed' : 'Pending — ' + outstanding.length + ' task' + (outstanding.length === 1 ? '' : 's') + ' outstanding'],
        ])),
      outstanding.length ? h('div', { class: 'verification-note', style: { marginTop: '1rem' } }, icon('alert-circle'),
        'Outstanding actions: ' + outstanding.map((t) => t.num + ' — ' + t.title).join(' · ')) : null,
      outstanding.length ? h('div', { style: { marginTop: '1rem' } },
        h('a', { href: '#/journey', class: 'btn btn-primary' }, 'Continue your journey', icon('arrow-right'))) : null);

    const sources = h('section', { class: 'card', style: { marginTop: '1.25rem' }, 'aria-label': 'Source references' },
      h('h2', { class: 'h3' }, 'Source references'),
      h('p', { class: 't-sm muted', style: { margin: '0.4rem 0 0.9rem', textTransform: 'none', letterSpacing: '0' } }, 'Every requirement in this journey traces to one of these official references.'),
      h('div', { class: 'stack' },
        usedSources.map((src) => h('div', { class: 'card-flat row-between', style: { gap: '0.75rem', flexWrap: 'wrap' } },
          h('div', null,
            h('p', { style: { fontWeight: '500', textTransform: 'none', letterSpacing: '0', lineHeight: '1.45' } }, src.document),
            h('p', { class: 't-xs muted-3', style: { textTransform: 'none', letterSpacing: '0' } }, src.org + ' · Updated ' + fmtDate(src.updated))),
          SourceButton(src.key, true)))));

    main.append(h('div', { class: 'container-narrow page-pad' }, hero, summary, sources,
      h('p', { class: 't-xs muted-3', style: { marginTop: '1.25rem', textAlign: 'center', textTransform: 'none', letterSpacing: '0' } },
        'ManakAI provides guidance, not certification. Registration decisions rest with the Bureau of Indian Standards.')));
  },
};
