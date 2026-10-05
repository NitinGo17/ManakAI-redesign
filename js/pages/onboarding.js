/* ============================================================
   ManakAI — Profile onboarding.
   Five questions, one at a time, each with a "Why are we asking
   this?" disclosure.
   ============================================================ */

const OnboardingPage = {
  data: {},
  step: 0,

  INDUSTRIES: ['Lighting & electricals', 'Kitchenware & homeware', 'Electronics & appliances', 'Toys & childcare products', 'Textiles & apparel', 'Packaging & printing', 'Machinery & industrial', 'Building materials', 'Food & agriculture', 'Other'],

  STEPS: [
    { key: 'userType', title: 'Who are you?', sub: 'This shapes the language and steps we use.', why: 'A manufacturer registers in the factory\u2019s name, while an importer works through the foreign manufacturer\u2019s registration. Knowing your role lets ManakAI guide the right path from the first step.' },
    { key: 'industry', title: 'What industry are you in?', sub: 'We use this to shortlist relevant standards families.', why: 'Indian Standards are organised by product families and technical committees. Your industry helps ManakAI search the right families first — you can always refine later.' },
    { key: 'product', title: 'What product are you working on?', sub: 'One product per journey — you can add more later.', why: 'Every compliance journey is product-specific: the standard, tests and documents depend on the exact product. Naming it lets ManakAI start its analysis.' },
    { key: 'context', title: 'Manufacturing / Import context', sub: 'Where is the product made or sourced from?', why: 'Manufacturing location decides who must hold the registration and whether an Authorised Indian Representative is needed. This changes the checklist.' },
    { key: 'stage', title: 'Current compliance stage', sub: 'So we start the journey where you actually are.', why: 'If you have already tested your product, there is no point starting from product discovery. Your answer sets the starting point of your journey.' },
  ],

  USER_TYPES: [
    { id: 'msme', label: 'MSME', icon: 'home' },
    { id: 'startup', label: 'Startup', icon: 'zap' },
    { id: 'manufacturer', label: 'Manufacturer', icon: 'products' },
    { id: 'importer', label: 'Importer', icon: 'map' },
    { id: 'entrepreneur', label: 'Entrepreneur', icon: 'sparkle' },
    { id: 'other', label: 'Other', icon: 'user' },
  ],
  CONTEXTS: ['Manufactured in India', 'Imported', 'Both'],
  STAGE_OPTS: [
    { id: 'exploring', label: 'Exploring', hint: 'Just understanding requirements' },
    { id: 'product-development', label: 'Product development', hint: 'Designing or prototyping' },
    { id: 'testing', label: 'Testing', hint: 'Preparing or undergoing tests' },
    { id: 'certification', label: 'Certification', hint: 'Application in progress' },
    { id: 'certified', label: 'Already certified', hint: 'Managing an existing registration' },
  ],

  render(main) {
    this.data = { userType: '', industry: '', productName: '', productCategory: '', context: '', stage: '' };
    this.step = 0;
    this.root = h('div', { class: 'onb-wrap container' });
    main.append(this.root);
    this.draw();
  },

  draw() {
    const r = this.root;
    r.innerHTML = '';
    const stepDef = this.STEPS[this.step];
    const isLast = this.step === this.STEPS.length - 1;
    r.append(
      h('div', { class: 'row-between' },
        h('p', { class: 'eyebrow' }, 'Profile setup — Step ' + (this.step + 1) + ' of ' + this.STEPS.length),
        h('button', { class: 'btn btn-ghost btn-sm', onclick: () => { AuthService.logout(); Router.go('#/'); } }, 'Log out & finish later')),
      h('h1', { class: 'h2', style: { marginTop: '0.75rem' } }, stepDef.title),
      h('p', { class: 'muted', style: { marginTop: '0.4rem', textTransform: 'none', letterSpacing: '0' } }, stepDef.sub),
      h('div', { class: 'onb-progress', 'aria-hidden': 'true' }, this.STEPS.map((_, i) => h('span', { class: i < this.step ? 'done' : i === this.step ? 'current' : '' }))),
      h('div', { 'aria-live': 'polite' }, this.stepBody(stepDef)),
      h('details', { class: 'why-asking' },
        h('summary', null, icon('info'), 'Why are we asking this?'),
        h('p', null, stepDef.why)),
      h('div', { class: 'row-between', style: { marginTop: '2rem' } },
        this.step === 0 ? h('span') : h('button', { class: 'btn btn-secondary', onclick: () => { this.step--; this.draw(); } }, 'Back'),
        h('button', { class: 'btn btn-primary', disabled: !this.canContinue(), onclick: () => this.next() }, isLast ? 'Create my journey' : 'Continue', icon('arrow-right'))));
  },

  canContinue() {
    const d = this.data;
    switch (this.STEPS[this.step].key) {
      case 'userType': return !!d.userType;
      case 'industry': return !!d.industry;
      case 'product': return d.productName.trim().length >= 2;
      case 'context': return !!d.context;
      case 'stage': return !!d.stage;
    }
    return false;
  },

  next() {
    if (this.step < this.STEPS.length - 1) { this.step++; this.draw(); return; }
    this.finish();
  },

  finish() {
    Store.set({ profile: { ...Profile(Store.state.user.id), ...this.data, updatedAt: new Date().toISOString() } });
    const tpl = matchTemplate(this.data.productName + ' ' + this.data.industry);
    const product = Product('p' + Date.now(), this.data.productName, tpl.id, Store.state.user.id);
    product.journey = buildJourneyForTemplate(tpl.id);
    product.journey.productId = product.id;
    Store.set({ products: [product], activeProductId: product.id });
    toast('Profile complete. Your journey has been created.');
    Router.go('#/consult');
  },

  stepBody(stepDef) {
    const wrap = h('div', { style: { marginTop: '1.75rem' } });
    switch (stepDef.key) {
      case 'userType':
        wrap.append(h('div', { class: 'choice-grid', role: 'group', 'aria-label': stepDef.title },
          this.USER_TYPES.map((t) => h('button', {
            class: 'choice', 'aria-pressed': this.data.userType === t.id ? 'true' : 'false',
            onclick: () => { this.data.userType = t.id; this.draw(); },
          }, icon(t.icon), t.label))));
        break;
      case 'industry':
        wrap.append(h('label', { class: 'field', style: { marginTop: 0 } },
          h('span', { class: 'field-label' }, 'Your industry'),
          h('select', { class: 'select', onchange: (e) => { this.data.industry = e.target.value; this.draw(); } },
            h('option', { value: '' }, 'Select an industry…'),
            this.INDUSTRIES.map((i) => h('option', { value: i, selected: this.data.industry === i ? true : null }, i)))));
        break;
      case 'product':
        wrap.append(
          h('label', { class: 'field', style: { marginTop: 0 } },
            h('span', { class: 'field-label' }, 'Product name'),
            h('input', { class: 'input', placeholder: 'e.g. LED bulb, steel water bottle, power adapter', value: this.data.productName, oninput: (e) => { this.data.productName = e.target.value; this.refreshBtn(); } })),
          h('p', { class: 'field-hint', style: { marginTop: '0.5rem' } }, 'Don\u2019t worry about technical terms — \u201CLED bulbs for home lighting\u201D is enough.'));
        break;
      case 'context':
        wrap.append(h('div', { class: 'choice-grid', role: 'group', 'aria-label': stepDef.title },
          this.CONTEXTS.map((c) => h('button', {
            class: 'choice', 'aria-pressed': this.data.context === c ? 'true' : 'false',
            onclick: () => { this.data.context = c; this.draw(); },
          }, c))));
        break;
      case 'stage':
        wrap.append(h('div', { class: 'stack' },
          this.STAGE_OPTS.map((s) => h('button', {
            class: 'choice', style: { flexDirection: 'row', justifyContent: 'flex-start', textAlign: 'left', minHeight: '4rem' },
            'aria-pressed': this.data.stage === s.id ? 'true' : 'false',
            onclick: () => { this.data.stage = s.id; this.draw(); },
          }, icon('check-circle'), h('span', null, h('span', { style: { display: 'block' } }, s.label), h('span', { class: 't-xs muted-3', style: { textTransform: 'none', letterSpacing: '0' } }, s.hint))))));
        break;
    }
    return wrap;
  },

  refreshBtn() {
    const btn = this.root.querySelector('.btn-primary:not(.btn-sm)');
    if (btn) btn.disabled = !this.canContinue();
  },
};
