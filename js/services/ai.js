/* ============================================================
   ManakAI — AIService (js/services/ai.js)
   Single AI abstraction used by the entire UI.
   Today: MockAIService (scripted consultation engine).
   Later: RealAIService with the same interface — the UI will not
   change. The mock reasons over the product templates in demoData
   instead of hardcoding responses inside components.
   ============================================================ */

const ANALYSIS_STAGES = [
  'Understanding product…',
  'Checking relevant requirements…',
  'Evaluating applicability…',
  'Preparing compliance tasks…',
  'Building your journey…',
];

const MockAIService = {

  /** Simulated network conditions for the prototype demo. */
  _failNext: false,

  _delay(ms) { return new Promise(r => setTimeout(r, ms)); },

  async _gate() {
    if (Store.state.offline) throw { code: 'offline' };
    if (Store.state.aiUnavailable || this._failNext) {
      this._failNext = false;
      await this._delay(500);
      throw { code: 'ai-unavailable' };
    }
  },

  /** Start a guided consultation for a product. Returns the opening
      question flow definition. */
  async startConsultation(productName, context) {
    await this._gate();
    await this._delay(600);
    const known = matchTemplate(productName || '');
    return {
      known: known.id !== 'generic',
      productGuess: known.id === 'generic' ? null : known.productType,
      questions: [
        { id: 'product', type: 'text', prompt: productName
            ? `Let's start with what you told me: you're working on "${productName}". In one line, how would you describe it — what is it, and what does it do?`
            : 'What product are you manufacturing or bringing to market?' },
        { id: 'use', type: 'chips', prompt: 'What is the primary intended use?',
          options: ['Residential use', 'Commercial use', 'Industrial use', 'Public / outdoor use'] },
        { id: 'context', type: 'chips', prompt: 'Where will the product be made or sourced?',
          options: ['Manufactured in India', 'Imported', 'Both'] },
      ],
    };
  },

  /** Respond to a consultation answer. Returns the next exchange. */
  async reply(consult, answer, stepIndex) {
    await this._gate();
    await this._delay(750 + Math.random() * 500);
    const q = consult.questions[stepIndex];
    if (!q) return { done: true, text: 'I have enough information to begin mapping your compliance journey.' };
    const a = (answer || '').trim();

    if (q.id === 'product') {
      const known = matchTemplate(a);
      if (known.id !== 'generic') {
        return { text: `Got it — that sounds like a ${known.productType.toLowerCase()}. That's a category ManakAI knows well. Next question:` };
      }
      return { text: 'Thank you. I\'ll analyse the product details after a few more questions. Next:' };
    }
    if (q.id === 'use') {
      return { text: `Understood — ${a.toLowerCase()}. That affects which requirements are likely to apply. Next:` };
    }
    if (q.id === 'context') {
      const importNote = a === 'Imported'
        ? 'Since you import, the registration will be held by the manufacturer, and you may act as the authorised Indian representative — I\'ll keep that in mind.'
        : 'Since you manufacture in India, the registration will be in your factory\'s name — I\'ll keep that in mind.';
      return { text: importNote + ' I now have enough information to begin mapping your compliance journey.' };
    }
    return { text: 'Noted.' };
  },

  /** Progressive analysis. onStage(stageIndex) fires as each completes. */
  async analyze(productName, context, onStage) {
    await this._gate();
    for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
      await this._delay(650);
      onStage(i);
    }
    const tpl = matchTemplate(productName + ' ' + (context && context.use || ''));
    return {
      understanding: {
        product: context && context.desc ? context.desc : productName,
        use: context && context.use ? context.use : 'General use',
        context: context && context.source ? context.source : 'Manufacturer',
      },
      templateId: tpl.id,
      category: tpl.category,
      productType: tpl.productType,
      requirements: tpl.requirements,
    };
  },

  /** Contextual guidance inside a task ("Continue with ManakAI"). */
  async taskGuidance(task, product, stageHistory) {
    await this._gate();
    await this._delay(700);
    const src = SOURCES[task.sourceRef];
    const lines = [
      `Continuing from Task ${task.num} — ${task.title}. I already know your product (${product.name}) and where you are in the journey, so let's pick up exactly here.`,
      task.steps.some(s => !task.stepsDone.includes(s.id))
        ? `The remaining step${task.steps.filter(s => !task.stepsDone.includes(s.id)).length > 1 ? 's are' : ' is'}: ${task.steps.filter(s => !task.stepsDone.includes(s.id)).map(s => s.text.toLowerCase()).join('; ')}.`
        : 'All steps in this task look complete — you can mark it as done whenever you\'re ready.',
    ];
    if (src) lines.push(`The official reference behind this task is "${src.document}". You can open the full source details from the source button in this task.`);
    return lines.join('\n\n');
  },

  /** Free-form follow-up inside the task panel. */
  async followUp(question, task, product) {
    await this._gate();
    await this._delay(650 + Math.random() * 450);
    const q = question.toLowerCase();
    if (q.includes('fee') || q.includes('cost')) {
      return 'Government fee amounts change over time and I won\'t guess them here — the current fee schedule is published with the scheme on the official BIS portal. I\'ve kept this answer cautious deliberately: wrong fee figures cause real planning mistakes. The source button on the task links you to the official page.';
    }
    if (q.includes('lab') || q.includes('test')) {
      return 'Testing must be done at a laboratory recognised by BIS — I have a lab guidance section in the Testing stage with the recognised-lab directory and what to check before submitting samples. You can open it from your journey page.';
    }
    if (q.includes('time') || q.includes('long') || q.includes('deadline')) {
      return 'Timelines depend on lab queues and how complete your documentation is, so I can\'t promise a number. What I can say from the process structure: testing and document preparation are the two stages where most of the calendar time goes.';
    }
    if (q.includes('why') && q.includes('matter')) {
      return task.why;
    }
    const src = SOURCES[task.sourceRef];
    return `Here is how I'd approach that for ${product.name}: keep this task's remaining steps in front of you — ${task.steps.filter(s => !task.stepsDone.includes(s.id)).map(s => s.text.toLowerCase()).join('; ') || 'everything is done'}. If you want the official basis, the source for this task is "${src ? src.document : 'ManakAI guidance'}", which you can open any time.`;
  },
};

/* The interface the UI programs against. Today it is the mock; the
   RealAIService will implement the exact same members. */
const AIService = MockAIService;
