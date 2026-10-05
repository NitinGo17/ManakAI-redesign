/* ============================================================
   ManakAI — My Products.
   Multiple products, one account. Switch, add, explore.
   ============================================================ */

const ProductsPage = {
  render(main) {
    main.append(h('div', { class: 'container page-pad' },
      h('p', { class: 'eyebrow' }, 'Your portfolio'),
      h('h1', { class: 'h1' }, 'My Products'),
      h('p', { class: 'lead', style: { fontSize: 'var(--type-lead)', marginTop: '0.6rem' } },
        'Each product has its own compliance journey. Switch between them any time — no extra accounts.'),
      h('div', { class: 'grid-3', style: { marginTop: '2rem' } }, Store.state.products.map((p) => this.tile(p))),
      h('div', { style: { marginTop: '1.75rem' } },
        h('button', { class: 'btn btn-primary btn-lg', onclick: () => this.addModal() }, icon('plus'), 'Add Product'))));
  },

  tile(p) {
    const pct = p.journey ? journeyProgress(p.journey) : 0;
    const stage = p.journey ? journeyStage(p.journey) : null;
    const stageLabel = stage ? ((STAGES.find((s) => s.id === stage) || {}).label) : 'Not started';
    const isActive = p.id === Store.state.activeProductId;
    return h('article', {
      class: 'card product-tile',
      style: isActive ? { borderColor: 'var(--accent)' } : null,
      'aria-label': p.name + ' — ' + pct + '% complete',
    },
      h('div', { class: 'row-between' },
        h('h2', { class: 'h4' }, p.name),
        p.isDemo ? h('span', { class: 'pill-demo' }, 'Demo') : (isActive ? h('span', { class: 'badge badge-progress' }, icon('circle'), 'Active') : null)),
      h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0' } },
        (PRODUCT_TEMPLATES[p.journey ? p.journey.templateId : 'generic'] || {}).category || 'General product'),
      progressBar(pct),
      h('div', { class: 'row-between' },
        h('span', { class: 't-sm', style: { fontWeight: '700', color: 'var(--accent)' } }, pct + '% complete'),
        h('span', { class: 't-xs muted-3', style: { textTransform: 'none', letterSpacing: '0' } }, stageLabel)),
      h('div', { class: 'row', style: { marginTop: '1rem', flexWrap: 'wrap' } },
        h('button', {
          class: 'btn ' + (isActive ? 'btn-primary' : 'btn-secondary') + ' btn-sm',
          onclick: () => { Store.switchProduct(p.id); toast('Now working on ' + p.name + '.'); Router.go('#/dashboard'); },
        }, isActive ? 'Open journey' : 'Switch to this product'),
        h('a', { href: '#/summary', class: 'btn btn-ghost btn-sm' }, 'Summary')));
  },

  addModal() {
    const nameInput = h('input', { class: 'input', placeholder: 'e.g. Stainless steel water bottle', 'aria-label': 'Product name' });
    const err = h('div', { class: 'field-error hidden' });
    openModal({
      title: 'Add a product',
      body: h('div', { class: 'stack' },
        h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } }, 'Give the product a working name — you\u2019ll describe it properly in the consultation that follows.'),
        h('label', { class: 'field', style: { marginTop: '0.25rem' } },
          h('span', { class: 'field-label' }, 'Product name'),
          nameInput),
        err),
      actions: [
        h('button', { class: 'btn btn-secondary', onclick: function () { this.closest('.overlay').querySelector('.btn-ghost').click(); } }, 'Cancel'),
        h('button', { class: 'btn btn-primary', onclick: function () {
          const name = nameInput.value.trim();
          if (name.length < 2) { err.textContent = 'Please enter a product name.'; err.classList.remove('hidden'); nameInput.focus(); return; }
          const tpl = matchTemplate(name);
          const product = Product('p' + Date.now(), name, tpl.id, Store.state.user.id);
          product.journey = null;
          Store.addProduct(product);
          this.closest('.overlay').querySelector('.btn-ghost').click();
          toast('Product added. Start the consultation to build its journey.');
          Router.go('#/consult');
        } }, 'Add & start consultation', icon('arrow-right'))],
    });
    setTimeout(() => nameInput.focus(), 60);
  },
};
