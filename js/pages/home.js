/* ============================================================
   ManakAI — the landing page.
   KIMI's art direction: a full-bleed procedural hero that pins and
   recedes, editorial mastheads, spring reveals, and a dark surface
   for contrast. ManakAI's content throughout.
   ============================================================ */

function ctaFrame(label, href, onclick) {
  const frame = h('svg', {
    class: 'frame', viewBox: '0 0 220 50', preserveAspectRatio: 'none', 'aria-hidden': 'true',
    html: '<path d="M220 42L212.932 50H0V0H220V42Z" fill="var(--surface-dark)"/>'
      + '<path class="flood" d="M220 42L212.932 50H0V0H220V42Z" fill="var(--accent)"/>'
      + '<path d="M220 42L212.932 50H0V0H220V42Z" fill="none" stroke="var(--accent)" stroke-opacity="0.25"/>'
      + '<path d="M205 49.5H213L219.5 42V36M212 0.5H219.5V7M8 0.5H0.5V7M7.5 49.5H0.5V42.5" fill="none" stroke="var(--accent)"/>',
  });
  const arrow = h('svg', { class: 'arrow', viewBox: '0 0 13.7071 10.7071', 'aria-hidden': 'true', html: '<path d="M0 5.35355H13M8 10.3536L13 5.35355L8 0.353553" fill="none" stroke-width="1"/>' });
  return h('a', { class: 'btn-frame', href, onclick }, frame, label, arrow);
}

const HomePage = {
  render(main) {
    main.append(
      h('div', { 'data-stack': '' },
        this.heroLayer(),
        this.engineLayer()),
      this.whySection(),
      this.howSection(),
      this.transformSection(),
      this.compareSection(),
      this.trustSection(),
      this.finalCTA());
  },

  /* ── the hero (pinned) ─────────────────────────────────────────────────── */
  heroLayer() {
    const nodes = [
      { n: '01', t: 'Product', s: 'What you make or import' },
      { n: '02', t: 'AI Understanding', s: 'A guided consultation' },
      { n: '03', t: 'Requirements', s: 'What may apply' },
      { n: '04', t: 'Checklist', s: 'Your journey remembers' },
      { n: '05', t: 'Testing', s: 'Lab guidance' },
      { n: '06', t: 'Compliance', s: 'Registration done right' },
    ];
    const canvas = h('canvas', { 'aria-hidden': 'true' });
    const scene = h('div', { class: 'scene' }, canvas);

    const content = h('div', { class: 'hero-content' },
      h('div', { class: 'hero-masthead' },
        BrandMark(),
        h('nav', { class: 'nav-links', 'aria-label': 'Main' },
          h('a', { class: 'nav-link', href: '#/' }, 'Home'),
          h('a', { class: 'nav-link', href: '#/login' }, 'Log in'),
          h('a', { class: 'nav-link', href: '#/register' }, 'Create account')),
        h('a', { class: 'btn btn-secondary btn-sm', href: '#/login?demo=1' }, 'Try Demo Mode')),
      h('div', { class: 'hero-mid' },
        h('p', { class: 'eyebrow', 'data-reveal': '', 'data-split': 'word', 'data-gate': 'manual', 'data-delay': '0' }, 'AI-powered BIS compliance guidance'),
        h('h1', { class: 'h-display', 'data-reveal': '', 'data-split': 'letter', 'data-stagger': '34', 'data-config': 'TYPE', 'data-gate': 'manual', 'data-delay': '120' }, 'ManakAI'),
        h('p', { class: 'brandline', 'data-rise': '', 'data-gate': 'manual', 'data-rise-delay': '320' }, 'From Product to ', h('strong', null, 'Compliance'), '.'),
        h('p', { class: 'hero-lead', 'data-reveal': '', 'data-split': 'word', 'data-stagger': '18', 'data-config': 'COPY', 'data-gate': 'manual', 'data-delay': '430' },
          'Understand what BIS requirements apply to your product, build your compliance checklist, and complete your journey step by step.'),
        h('div', { class: 'hero-ctas', 'data-rise': '', 'data-gate': 'manual', 'data-rise-delay': '620' },
          ctaFrame('Start Your Journey', Store.state.user ? '#/dashboard' : '#/register'),
          h('a', { class: 'btn btn-secondary btn-lg', href: '#how-it-works' }, 'See How It Works')),
        h('p', { class: 'hero-note', 'data-rise': '', 'data-gate': 'manual', 'data-rise-delay': '760' },
          icon('shield'), 'Guidance, not guarantees — every result shows its source and how certain it is.')),
      h('div', { class: 'engine-rail', 'aria-label': 'The compliance journey engine' },
        nodes.map((x) => h('div', { class: 'engine-node' },
          h('div', { class: 'n' }, x.n),
          h('div', { class: 't' }, x.t),
          h('div', { class: 's' }, x.s)))));

    const hero = h('section', { class: 'hero' }, scene, h('div', { class: 'ramp', 'aria-hidden': 'true' }), content);

    /* the loader veil lifts when the scene has drawn its first frame */
    const veil = makeVeil();
    requestAnimationFrame(() => {
      const sceneApi = initHeroScene(canvas);
      const entrance = () => {
        veil.ready();
        playRevealsIn(hero);
        playRiseIn(hero);
      };
      if (sceneApi) sceneApi.onReady(entrance);
      else setTimeout(entrance, 120);
    });

    return h('div', { class: 'layer', 'data-layer': '0' },
      h('div', { class: 'inner' }, hero),
      h('div', { class: 'shade' }));
  },

  /* ── the engine (pinned, dark) ─────────────────────────────────────────── */
  engineLayer() {
    const steps = [
      { n: '01', t: 'Understand', d: 'A guided consultation turns your product description into structured product context — no regulatory vocabulary needed.' },
      { n: '02', t: 'Verify', d: 'Every requirement carries a verification state and an official source. You always know what is confirmed and what needs checking.' },
      { n: '03', t: 'Plan', d: 'Your requirements become a personalised checklist with clear tasks, steps and what you may need for each one.' },
      { n: '04', t: 'Complete', d: 'Work task by task with lab and documentation guidance, until your certification journey is done.' },
    ];
    return h('div', { class: 'layer', 'data-layer': '1' },
      h('div', { class: 'inner' },
        h('section', { class: 'sheet-section sheet-dark', id: 'how-it-works', style: { minHeight: '100lvh', display: 'flex', alignItems: 'center' } },
          h('div', { class: 'container' },
            h('div', { class: 'sheet-head' },
              h('p', { class: 'eyebrow', 'data-reveal': '', 'data-split': 'word', 'data-stagger': '0' }, 'The compliance journey engine'),
              h('h2', { 'data-reveal': '', 'data-split': 'word', 'data-stagger': '90' }, 'The AI explains. The checklist remembers.'),
              h('p', { class: 'lead', 'data-reveal': '', 'data-split': 'word', 'data-stagger': '14', 'data-config': 'COPY', 'data-delay': '220' },
                'You should never have to remember what the AI told you. ManakAI turns conversations into a structured journey that persists and guides you to the finish.')),
            h('div', { class: 'engine-steps' },
              steps.map((s, i) => h('div', { class: 'engine-step', 'data-rise': '', 'data-rise-delay': String(i * 70) },
                h('div', { class: 'num' }, s.n),
                h('h3', null, s.t),
                h('p', null, s.d))))))));
  },

  whySection() {
    const items = [
      { n: '01', icon: 'sparkle', t: 'Understand', d: 'A guided consultation turns your product description into structured product context — no regulatory vocabulary needed.' },
      { n: '02', icon: 'shield', t: 'Verify', d: 'Every requirement carries a verification state and an official source. You always know what is confirmed and what needs checking.' },
      { n: '03', icon: 'journey', t: 'Plan', d: 'Your requirements become a personalised checklist with clear tasks, steps and what you may need for each one.' },
      { n: '04', icon: 'ribbon', t: 'Complete', d: 'Work task by task with lab and documentation guidance, until your certification journey is done.' },
    ];
    return h('section', { class: 'sheet-section' },
      h('div', { class: 'container' },
        h('div', { class: 'sheet-head' },
          h('p', { class: 'eyebrow', 'data-reveal': '', 'data-split': 'word' }, 'Why ManakAI'),
          h('h2', { 'data-reveal': '', 'data-split': 'word', 'data-stagger': '90' }, 'More than a chatbot.'),
          h('p', { class: 'lead', 'data-reveal': '', 'data-split': 'word', 'data-stagger': '14', 'data-config': 'COPY', 'data-delay': '220' },
            'Information about BIS, or the requirements that apply to you? ManakAI answers with your product, your requirements, your checklist — and a next action.')),
        h('div', { class: 'why-grid' },
          items.map((it, i) => h('div', { class: 'why-card', 'data-rise': '', 'data-rise-delay': String(i * 70) },
            h('div', { class: 'num' }, it.n),
            h('span', { class: 'icon' }, icon(it.icon)),
            h('h3', null, it.t),
            h('p', null, it.d))))));
  },

  howSection() {
    const steps = [
      { t: 'Describe your product', d: 'A short conversation — what it is, what it is for, where it is made.' },
      { t: 'Get structured analysis', d: 'Potential requirements with applicability, reasoning, and sources.' },
      { t: 'Your journey is built', d: 'Requirements become a checklist with stages, tasks and next actions.' },
      { t: 'Work task by task', d: 'Steps, lab guidance, documents — with the AI continuing in context.' },
      { t: 'Reach compliance', d: 'Certification completed with a traceable record of every result.' },
    ];
    return h('section', { class: 'sheet-section', id: 'how-it-works-flow', style: { background: 'var(--surface)' } },
      h('div', { class: 'container' },
        h('div', { class: 'sheet-head' },
          h('p', { class: 'eyebrow', 'data-reveal': '', 'data-split': 'word' }, 'How it works'),
          h('h2', { 'data-reveal': '', 'data-split': 'word', 'data-stagger': '90' }, 'Five steps from product to certification.')),
        h('div', { class: 'hiw' },
          steps.map((s, i) => h('div', { class: 'hiw-step', 'data-rise': '', 'data-rise-delay': String(i * 60) },
            h('div', { class: 'idx' }, String(i + 1).padStart(2, '0')),
            h('div', null, h('h3', null, s.t), h('p', null, s.d)))))));
  },

  transformSection() {
    const built = [
      'Product understanding — self-ballasted LED lamp, residential use, manufactured in India',
      'Requirement — BIS CRS registration, Confirmed, BIS product list',
      'Requirement — safety testing to IS 16102 (Part 1), Confirmed',
      'Requirement — performance & marking, Likely — verify',
      'Checklist — 5 tasks across 5 stages, each with sources',
    ];
    return h('section', { class: 'sheet-section' },
      h('div', { class: 'container' },
        h('div', { class: 'sheet-head' },
          h('p', { class: 'eyebrow', 'data-reveal': '', 'data-split': 'word' }, 'Product to compliance'),
          h('h2', { 'data-reveal': '', 'data-split': 'word', 'data-stagger': '90' }, 'One line in. A structured journey out.')),
        h('div', { class: 'transform' },
          h('div', { class: 'panel' },
            h('span', { class: 'eyebrow eyebrow-copper' }, 'You say'),
            h('p', { class: 'quote' }, '\u201CI manufacture LED bulbs for residential use.\u201D')),
          h('div', { class: 'arrow', 'aria-hidden': 'true' }, icon('arrow-right')),
          h('div', { class: 'panel accent' },
            h('span', { class: 'eyebrow' }, 'ManakAI builds'),
            h('div', { class: 'built' },
              built.map((t, i) => h('div', { class: 'tag-chip', 'data-rise': '', 'data-rise-delay': String(i * 50) }, icon('check'), t)))))));
  },

  compareSection() {
    return h('section', { class: 'sheet-section', style: { background: 'var(--surface-muted)' } },
      h('div', { class: 'container' },
        h('div', { class: 'sheet-head' },
          h('p', { class: 'eyebrow', 'data-reveal': '', 'data-split': 'word' }, 'More than a chatbot'),
          h('h2', { 'data-reveal': '', 'data-split': 'word', 'data-stagger': '90' }, 'A transcript, or a journey?')),
        h('div', { class: 'compare' },
          h('div', { class: 'compare-col' },
            h('h3', null, 'A normal AI chat'),
            h('p', { class: 't-sm muted', style: { marginTop: '0.5rem', textTransform: 'none', letterSpacing: '0' } }, 'Answers live in a transcript you have to scroll back through.'),
            h('div', { class: 'chat-bubble' }, '\u201CHere is some general information about BIS certification and the kinds of products that may require registration\u2026\u201D'),
            h('p', { class: 't-sm muted-3', style: { marginTop: '0.9rem', textTransform: 'none', letterSpacing: '0' } }, 'No tasks. No memory of your product. No sources. No next step.')),
          h('div', { class: 'compare-col manakai' },
            h('h3', null, 'ManakAI'),
            h('p', { class: 't-sm muted', style: { marginTop: '0.5rem', textTransform: 'none', letterSpacing: '0' } }, 'Your product, your requirements, your checklist — and a next action.'),
            h('div', { class: 'chat-bubble' }, '\u201CHere is what applies to your product\u2026\u201D'),
            h('dl', { class: 'structured-card', style: { marginTop: '1rem' } },
              h('div', { class: 'structured-row' }, h('dt', null, 'Requirement'), h('dd', null, 'BIS registration under CRS (Confirmed)')),
              h('div', { class: 'structured-row' }, h('dt', null, 'Reason'), h('dd', null, 'LED lamps appear in the CRS product list')),
              h('div', { class: 'structured-row' }, h('dt', null, 'Task'), h('dd', null, 'Safety testing to IS 16102 (Part 1)')),
              h('div', { class: 'structured-row' }, h('dt', null, 'Source'), h('dd', null, 'BIS — CRS Scheme II product list')),
              h('div', { class: 'structured-row' }, h('dt', null, 'Next action'), h('dd', null, 'Verify product requirements'))),
            h('a', { class: 'btn btn-primary', style: { marginTop: '1rem' }, href: Store.state.user ? '#/journey' : '#/login?demo=1' }, 'See it on the demo journey', icon('arrow-right'))))));
  },

  trustSection() {
    const items = [
      { icon: 'source', t: 'Source traceability', d: 'Every compliance-critical result carries its source, document, section and last-updated date — visible in a source panel, never hidden behind the AI.' },
      { icon: 'eye', t: 'Verification states', d: 'Confirmed, Likely — verify, or Unknown. You always see how certain a result is before you act on it.' },
      { icon: 'external', t: 'Official references', d: 'Links to the official BIS portals — the CRS portal, the standards catalogue, and the recognised-lab directory.' },
      { icon: 'clock', t: 'Last updated', d: 'Standards change. Each source record shows when it was last checked, so you know how fresh the information is.' },
    ];
    return h('section', { class: 'sheet-section', style: { background: 'var(--surface)' } },
      h('div', { class: 'container' },
        h('div', { class: 'sheet-head' },
          h('p', { class: 'eyebrow', 'data-reveal': '', 'data-split': 'word' }, 'Trust layer'),
          h('h2', { 'data-reveal': '', 'data-split': 'word', 'data-stagger': '90' }, 'Trust is earned with sources, not adjectives.'),
          h('p', { class: 'lead', 'data-reveal': '', 'data-split': 'word', 'data-stagger': '14', 'data-config': 'COPY', 'data-delay': '220' },
            'ManakAI will never claim \u201Cgovernment approved\u201D or \u201Cguaranteed compliance\u201D. When something cannot be determined, it says exactly that.')),
        h('div', { class: 'trust-grid' },
          items.map((it) => h('div', { class: 'trust-item', 'data-reveal': '', 'data-split': 'word', 'data-stagger': '20', 'data-config': 'COPY' },
            h('span', { class: 'icon' }, icon(it.icon)),
            h('h3', null, it.t),
            h('p', null, it.d))))));
  },

  finalCTA() {
    return h('section', { class: 'sheet-section', style: { paddingBlock: '0' } },
      h('div', { class: 'container' },
        h('div', { class: 'cta-band' },
          h('div', { class: 'grid-motif', 'aria-hidden': 'true', html: '<svg preserveAspectRatio="none"><rect width="100%" height="100%" fill="url(#gp-cta)"/><defs><pattern id="gp-cta" width="46" height="46" patternUnits="userSpaceOnUse"><path class="m-line" d="M46 0H0v46" fill="none"/><circle class="m-node" cx="23" cy="23" r="1.3"/></pattern></defs></svg>' }),
          h('div', { style: { position: 'relative' } },
            h('h2', { 'data-reveal': '', 'data-split': 'word', 'data-stagger': '90' }, 'Start your compliance journey.'),
            h('p', { 'data-reveal': '', 'data-split': 'word', 'data-stagger': '14', 'data-config': 'COPY', 'data-delay': '220' },
              'Create an account and see what applies to your product — or explore the full demo journey in minutes.'),
            h('div', { class: 'row' },
              h('a', { class: 'btn btn-primary btn-lg', href: Store.state.user ? '#/dashboard' : '#/register' }, Store.state.user ? 'Go to your dashboard' : 'Create free account', icon('arrow-right')),
              h('a', { class: 'btn btn-secondary btn-lg', href: '#/login?demo=1', style: { color: 'var(--on-dark)', borderColor: 'var(--on-dark)' } }, 'Explore Demo Mode'))))));
  },
};
