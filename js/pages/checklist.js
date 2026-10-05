/* ============================================================
   ManakAI — Checklist / Journey.
   The core product screen: task cards with states, per-stage
   conversation history, sources, and the Compliance Path.
   ============================================================ */

const ChecklistPage = {
  render(main) {
    const product = Store.activeProduct;
    if (!product) {
      main.append(h('div', { class: 'container page-pad' }, EmptyState({
        title: 'No product selected',
        text: 'Add a product to start a compliance journey.',
        action: h('a', { href: '#/products', class: 'btn btn-primary' }, icon('plus'), 'Add Product'),
      })));
      return;
    }
    if (!product.journey) {
      main.append(h('div', { class: 'container page-pad' }, EmptyState({
        title: 'No journey yet',
        text: 'Your compliance journey starts with understanding your product. Let ManakAI analyse it and build your checklist.',
        action: h('a', { href: '#/consult', class: 'btn btn-primary btn-lg' }, icon('sparkle'), 'Start Your Journey'),
      })));
      return;
    }
    const j = product.journey;
    const pct = journeyProgress(j);
    const currentTask = j.tasks.find((t) => t.state === 'current');

    main.append(h('div', { class: 'container page-pad' },
      this.header(product, pct, currentTask),
      CompliancePath(j),
      h('div', { style: { marginTop: '1.5rem' } }, JourneyTimeline(j)),
      h('div', { class: 'tasks', style: { marginTop: '2rem' } },
        j.tasks.map((t) => TaskCard(t, product, (task) => Router.go('#/task/' + task.id)))),
      this.stageHistory(product)));
  },

  header(product, pct, currentTask) {
    return h('div', null,
      h('div', { class: 'row-between', style: { flexWrap: 'wrap', alignItems: 'flex-end' } },
        h('div', null,
          h('p', { class: 'eyebrow' }, product.isDemo ? 'Demo journey' : 'Your journey'),
          h('h1', { class: 'h1' }, 'Your Compliance Journey'),
          h('p', { class: 'lead', style: { fontSize: 'var(--type-lead)', marginTop: '0.4rem' } },
            'Product: ', h('strong', { style: { color: 'var(--accent)' } }, product.name))),
        h('div', { class: 'row' },
          h('a', { href: '#/consult', class: 'btn btn-ghost' }, icon('chat'), 'Ask ManakAI'),
          h('a', { href: '#/products', class: 'btn btn-secondary' }, 'Switch product'))),
      h('div', { class: 'card', style: { marginTop: '1.25rem' } },
        h('div', { class: 'progress-row' },
          h('span', { style: { fontWeight: '700' } }, 'Overall progress'),
          h('span', { style: { fontWeight: '700', fontSize: 'var(--type-title)', color: 'var(--accent)' } }, pct + '%')),
        progressBar(pct),
        currentTask ? h('p', { class: 't-sm muted', style: { marginTop: '0.7rem', textTransform: 'none', letterSpacing: '0' } },
          'Current task: ', h('strong', null, currentTask.num + ' — ' + currentTask.title)) : null));
  },

  stageHistory(product) {
    const j = product.journey;
    const stagesWithHistory = STAGES.filter((st) => j.history[st.id] && j.history[st.id].length);
    return h('section', { class: 'card', style: { marginTop: '2rem' }, 'aria-label': 'Journey history' },
      h('h2', { class: 'h4' }, 'Journey history'),
      h('p', { class: 't-sm muted', style: { marginTop: '0.4rem', textTransform: 'none', letterSpacing: '0' } },
        'Each stage keeps its own contextual conversation — no endless transcript to scroll through.'),
      stagesWithHistory.length
        ? h('div', { class: 'stack', style: { marginTop: '1rem' } },
            stagesWithHistory.map((st) => h('details', { class: 'card-flat' },
              h('summary', { style: { cursor: 'pointer', fontWeight: '700', color: 'var(--accent)' } },
                st.label, ' — ', j.history[st.id].length + ' message' + (j.history[st.id].length === 1 ? '' : 's')),
              h('div', { class: 'stack', style: { marginTop: '0.75rem' } },
                j.history[st.id].map((m) => h('div', { class: 't-sm', style: {
                  padding: '0.7rem 0.85rem', background: m.role === 'ai' ? 'var(--surface)' : 'var(--accent-tint)',
                  border: '1px solid var(--border)', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5',
                } },
                  h('span', { style: { fontWeight: '700', display: 'block', marginBottom: '2px', color: m.role === 'ai' ? 'var(--accent)' : 'var(--foreground)' } }, m.role === 'ai' ? 'ManakAI' : 'You'),
                  m.text))))))
        : h('p', { class: 't-sm muted-3', style: { marginTop: '0.9rem', textTransform: 'none', letterSpacing: '0' } }, 'Conversations will appear here as you work through each stage.'));
  },
};
