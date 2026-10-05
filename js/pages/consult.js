/* ============================================================
   ManakAI — Guided compliance consultation.
   Not a chatbot screen: a structured consultation that becomes a
   product understanding, verified requirements, and a journey.
   ============================================================ */

const ConsultPage = {
  phase: 'consult', consult: null, stepIndex: 0, answers: {}, analysis: null, root: null,

  render(main) {
    this.phase = 'consult'; this.consult = null; this.stepIndex = 0; this.answers = {}; this.analysis = null;
    const product = Store.activeProduct;
    this.root = h('div', { class: 'consult-wrap container' });
    main.append(this.root);
    this.root.append(
      h('p', { class: 'eyebrow' }, 'Guided Compliance Consultation'),
      h('h1', { class: 'h1' }, 'Let\u2019s understand your product.'),
      h('p', { class: 'lead', style: { marginTop: '0.6rem' } },
        'Answer a few questions and ManakAI will build your compliance journey.',
        product ? ' We\u2019re focusing on: ' + product.name + '.' : ''),
      this.chatShell());
    this.openConsultation();
  },

  chatShell() {
    this.chatBody = h('div', { class: 'chat-body', 'aria-live': 'polite', 'aria-label': 'Consultation conversation' });
    this.chatInputRow = h('div', { class: 'chat-input-row' },
      h('input', { class: 'input', placeholder: 'Type your answer…', 'aria-label': 'Your answer', onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); this.submitInput(); } } }),
      h('button', { class: 'btn btn-primary', onclick: () => this.submitInput(), 'aria-label': 'Send answer' }, icon('arrow-right')));
    return h('div', { class: 'chat-area', style: { marginTop: '2rem' } },
      h('div', { class: 'chat-head' },
        h('span', { class: 'chat-badge' }, icon('sparkle')),
        h('div', null,
          h('div', { style: { fontWeight: '700' } }, 'ManakAI Consultation'),
          h('div', { class: 't-xs muted-3', style: { textTransform: 'none', letterSpacing: '0' } }, 'Structured guidance — the output becomes your checklist, not a transcript'))),
      this.chatBody,
      this.chatInputRow);
  },

  async openConsultation() {
    const product = Store.activeProduct;
    this.setInputEnabled(false);
    this.showTyping();
    try {
      const c = await AIService.startConsultation(product ? product.name : '', this.answers);
      this.consult = c;
      this.hideTyping();
      this.addAI(c.questions[0].prompt);
      this.stepIndex = 0;
      this.showChipsFor(c.questions[0]);
      this.setInputEnabled(true);
    } catch (err) { this.hideTyping(); this.addAIError(); }
  },

  addAI(text, chipsNode) {
    const node = h('div', { class: 'msg msg-ai' },
      h('span', { class: 'msg-avatar' }, icon('sparkle')),
      h('div', null,
        h('div', { class: 'msg-bubble' }, String(text).split('\n\n').map((p, i) => h('p', { style: i ? { marginTop: '8px' } : null }, p))),
        chipsNode || null));
    this.chatBody.append(node);
    this.scrollChat();
    return node;
  },
  addUser(text) {
    this.chatBody.append(h('div', { class: 'msg msg-user' },
      h('span', { class: 'msg-avatar' }, icon('user')),
      h('div', { class: 'msg-bubble' }, text)));
    this.scrollChat();
  },
  showTyping() {
    this.typingEl = h('div', { class: 'msg msg-ai' },
      h('span', { class: 'msg-avatar' }, icon('sparkle')),
      h('div', { class: 'msg-bubble typing', role: 'status', 'aria-label': 'ManakAI is typing' }, h('i'), h('i'), h('i')));
    this.chatBody.append(this.typingEl);
    this.scrollChat();
  },
  hideTyping() { if (this.typingEl) { this.typingEl.remove(); this.typingEl = null; } },

  addAIError() {
    const retry = h('button', { class: 'btn btn-secondary btn-sm', style: { marginTop: '10px' }, onclick: () => this.retryLast() }, 'Try again');
    const node = h('div', { class: 'msg msg-ai' },
      h('span', { class: 'msg-avatar' }, icon('sparkle')),
      h('div', { class: 'msg-bubble', style: { background: 'var(--unknown-bg)' } },
        h('p', null, Store.state.offline ? 'You appear to be offline — AI features need a connection.' : 'The AI service is unavailable right now.'),
        h('p', { class: 't-sm muted', style: { marginTop: '6px' } }, 'Nothing was lost — your consultation continues from the same point.'),
        retry));
    this.chatBody.append(node);
    this.scrollChat();
  },
  retryLast() { this.chatBody.querySelectorAll('.msg').forEach((m) => m.remove()); this.openConsultation(); },
  scrollChat() { requestAnimationFrame(() => { this.chatBody.scrollTop = this.chatBody.scrollHeight; }); },

  setInputEnabled(on) {
    const input = this.chatInputRow.querySelector('input');
    const btn = this.chatInputRow.querySelector('button');
    if (input && btn) { input.disabled = !on; btn.disabled = !on; }
    this.chipsEl && this.chipsEl.classList.toggle('hidden', !on);
    if (on && input) input.focus();
  },

  showChipsFor(question) {
    if (this.chipsEl) this.chipsEl.remove();
    this.chipsEl = null;
    if (!question || question.type !== 'chips') return;
    this.chipsEl = h('div', { class: 'chat-chips', 'aria-label': 'Quick answers' },
      question.options.map((opt) => h('button', { class: 'chip', onclick: () => this.answer(opt) }, opt)));
    this.chatBody.append(this.chipsEl);
    this.scrollChat();
  },
  submitInput() {
    const input = this.chatInputRow.querySelector('input');
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    this.answer(val);
  },

  async answer(value) {
    if (!this.consult || this.busy) return;
    this.busy = true;
    const q = this.consult.questions[this.stepIndex];
    this.addUser(value);
    this.answers[q.id] = value;
    if (this.chipsEl) { this.chipsEl.remove(); this.chipsEl = null; }
    this.setInputEnabled(false);
    this.showTyping();
    try {
      const res = await AIService.reply(this.consult, value, this.stepIndex);
      this.hideTyping();
      this.stepIndex++;
      if (this.stepIndex < this.consult.questions.length) {
        this.addAI(res.text);
        this.showChipsFor(this.consult.questions[this.stepIndex]);
        this.setInputEnabled(true);
      } else { this.addAI(res.text); this.offerAnalysis(); }
    } catch (err) { this.hideTyping(); this.addAIError(); }
    this.busy = false;
  },

  offerAnalysis() {
    const btn = h('button', { class: 'btn btn-primary', style: { marginTop: '10px' }, onclick: () => this.runAnalysis() }, icon('sparkle'), 'Analyse my product');
    this.addAI('When you\u2019re ready, I\u2019ll analyse your product and prepare your compliance journey.', btn);
    this.scrollChat();
  },

  async runAnalysis() {
    const product = Store.activeProduct;
    const desc = this.answers.product || (product ? product.name : 'your product');
    const context = { desc, use: this.answers.use || '', source: this.answers.context || 'Manufacturer' };

    const stageEls = ANALYSIS_STAGES.map((label) => h('div', { class: 'analysis-stage' },
      h('span', { class: 'analysis-stage-icon' }, icon('clock')),
      h('span', { class: 't-sm', style: { fontWeight: '500', textTransform: 'none', letterSpacing: '0' } }, label)));
    const panel = h('div', { class: 'card' },
      h('p', { class: 'eyebrow' }, 'Analysis in progress'),
      h('div', { style: { marginTop: '1rem' } }, stageEls));
    this.chatBody.append(h('div', { class: 'msg msg-ai' },
      h('span', { class: 'msg-avatar' }, icon('sparkle')),
      h('div', { class: 'msg-bubble', style: { background: 'transparent', padding: '0', maxWidth: '560px' } }, panel)));
    this.scrollChat();
    this.setInputEnabled(false);

    try {
      const analysis = await AIService.analyze(desc, context, (i) => {
        stageEls[i].classList.add('is-done');
        const ic = stageEls[i].querySelector('.analysis-stage-icon');
        ic.innerHTML = ''; ic.append(icon('check'));
        if (stageEls[i + 1]) stageEls[i + 1].classList.add('is-active');
        this.scrollChat();
      });
      this.analysis = analysis;
      stageEls[stageEls.length - 1].classList.add('is-done');
      setTimeout(() => {
        this.chatBody.append(h('div', { class: 'msg msg-ai' },
          h('span', { class: 'msg-avatar' }, icon('sparkle')),
          h('div', { class: 'msg-bubble' }, h('p', null, 'Analysis complete. Here is what I found for your product — check each source before acting.'))));
        this.renderAnalysisResults(analysis);
        this.scrollChat();
      }, 350);
    } catch (err) { this.addAIError(); this.setInputEnabled(true); }
  },

  renderAnalysisResults(a) {
    const results = h('div', { class: 'stack', style: { marginTop: '0.4rem', maxWidth: '760px' } });
    results.append(h('div', { class: 'req-card' },
      h('div', { class: 'req-head' },
        h('h3', { class: 'h4' }, 'Product Understanding'),
        h('span', { class: 'badge badge-progress' }, icon('sparkle'), 'Structured')),
      h('dl', { class: 'structured-card', style: { marginTop: '1rem' } },
        h('div', { class: 'structured-row' }, h('dt', null, 'Product'), h('dd', null, a.understanding.product)),
        h('div', { class: 'structured-row' }, h('dt', null, 'Use'), h('dd', null, a.understanding.use)),
        h('div', { class: 'structured-row' }, h('dt', null, 'Context'), h('dd', null, a.understanding.context)),
        h('div', { class: 'structured-row' }, h('dt', null, 'Category'), h('dd', null, a.category)))));

    results.append(h('h3', { class: 'h3', style: { marginTop: '0.5rem' } }, 'Potential Requirements'));
    results.append(h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } },
      'Each requirement shows how certain ManakAI is. Confirmed results cite the official source; anything else says exactly what to verify.'));
    a.requirements.forEach((rq) => results.append(this.requirementCard(rq)));

    results.append(h('div', { class: 'card card-copper-top text-center', style: { padding: '2rem' } },
      h('h3', { class: 'h3' }, 'Your compliance journey is ready.'),
      h('p', { class: 'muted', style: { marginTop: '0.5rem', textTransform: 'none', letterSpacing: '0' } },
        a.requirements.length + ' potential requirements mapped, across ' + STAGES.length + ' stages — from discovery to certification.'),
      h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '1.25rem' } },
        h('button', { class: 'btn btn-primary btn-lg', onclick: () => this.createChecklist(a) }, icon('check-circle'), 'Create My Checklist'))));

    this.chatBody.append(h('div', { class: 'msg msg-ai', style: { maxWidth: '100%' } },
      h('span', { class: 'msg-avatar' }, icon('sparkle')),
      h('div', { style: { flex: '1', minWidth: '0' } }, results)));
    this.scrollChat();
  },

  requirementCard(rq) {
    const v = VERIFICATION[rq.verification] || VERIFICATION.UNKNOWN;
    const src = SOURCES[rq.sourceRef];
    return h('article', { class: 'req-card' },
      h('div', { class: 'req-head' },
        h('h4', { class: 'h4' }, rq.title),
        verificationBadge(rq.verification)),
      rq.verification === 'UNKNOWN' ? null : h('p', { class: 't-sm muted', style: { marginTop: '0.5rem', textTransform: 'none', letterSpacing: '0' } }, h('strong', null, 'Applies: '), rq.applies),
      h('p', { class: 'req-why' }, h('strong', null, 'Why it may apply: '), rq.why),
      v.id === 'unknown' ? h('div', { class: 'verification-note', role: 'note' }, icon('help-circle'),
        'Applicability could not be conclusively determined from the available information.') : null,
      h('div', { class: 'req-meta' },
        SourceButton(rq.sourceRef, true),
        src ? h('span', { class: 't-xs muted-3', style: { textTransform: 'none', letterSpacing: '0' } }, 'Source: ' + src.orgShort + ' · Updated ' + fmtDate(src.updated)) : null));
  },

  createChecklist(a) {
    const product = Store.activeProduct;
    if (!product) { toast('Create a product first.', 'error'); return; }
    const journey = buildJourneyForTemplate(a.templateId);
    journey.productId = product.id;
    Store.setJourney(product.id, journey);
    Store.appendHistory(product.id, 'discovery', Message('ai', 'Consultation completed. Product analysed and requirements mapped.', null));
    toast('Your compliance checklist has been created.');
    Router.go('#/journey');
  },
};
