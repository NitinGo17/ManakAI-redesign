/* ============================================================
   ManakAI — Task detail.
   Why it matters, what to do, what you may need, the source, and
   "Continue with ManakAI" — a contextual AI panel that knows the
   whole journey, not a fresh chatbot.
   ============================================================ */

const TaskPage = {
  render(main, route) {
    const taskId = route.split('/')[2];
    const product = Store.activeProduct;
    const journey = product && product.journey;
    const task = journey && journey.tasks.find((t) => t.id === taskId);

    if (!task) {
      main.append(h('div', { class: 'container page-pad' }, EmptyState({
        title: 'Task not found',
        text: 'This task doesn\u2019t exist for this product — it may belong to another journey.',
        action: h('a', { href: '#/journey', class: 'btn btn-primary' }, 'Return to checklist'),
      })));
      return;
    }
    const locked = task.state === 'locked';
    const pct = taskProgress(task);

    const hero = h('div', { class: 'task-hero' },
      h('div', { class: 'grid-motif', 'aria-hidden': 'true', html: '<svg preserveAspectRatio="none"><rect width="100%" height="100%" fill="url(#gp-task)"/><defs><pattern id="gp-task" width="46" height="46" patternUnits="userSpaceOnUse"><path class="m-line" d="M46 0H0v46" fill="none"/><circle class="m-node" cx="23" cy="23" r="1.3"/></pattern></defs></svg>' }),
      h('div', { style: { position: 'relative' } },
        h('a', { href: '#/journey', class: 't-sm', style: { color: 'var(--on-dark-muted)', display: 'inline-flex', gap: '6px', alignItems: 'center', marginBottom: '1.1rem', textTransform: 'none', letterSpacing: '0' } }, '\u2190 Back to checklist'),
        h('div', { class: 'row', style: { gap: '0.75rem', flexWrap: 'wrap' } },
          h('span', { class: 'eyebrow eyebrow-copper' }, 'Task ' + task.num),
          taskStateBadge(task),
          product.isDemo ? h('span', { class: 'pill-demo' }, 'Demo') : null),
        h('h1', { style: { margin: '0.75rem 0 0.4rem' } }, task.title),
        h('p', { style: { color: 'var(--on-dark-muted)', maxWidth: '44em', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } },
          locked ? 'Complete the earlier tasks in your journey to unlock this one.' : task.short),
        !locked ? h('div', { style: { marginTop: '1.1rem', maxWidth: '26rem' } }, progressBar(pct)) : null));

    const whyCard = h('section', { class: 'card', 'aria-label': 'Why this matters' },
      h('h2', { class: 'h4' }, 'Why this matters'),
      h('p', { class: 't-sm muted', style: { marginTop: '0.6rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.55' } }, task.why));

    const stepsCard = h('section', { class: 'card', 'aria-label': 'What you need to do' },
      h('h2', { class: 'h4' }, 'What you need to do'),
      h('p', { class: 't-sm muted', style: { marginTop: '0.4rem', textTransform: 'none', letterSpacing: '0' } }, 'Check off each step as you finish it.'),
      h('div', { style: { marginTop: '1rem' } },
        task.steps.map((s) => {
          const done = task.stepsDone.includes(s.id);
          return h('button', {
            class: 'checklist-item' + (done ? ' is-done' : ''),
            disabled: locked ? true : null,
            'aria-pressed': done ? 'true' : 'false',
            onclick: () => {
              Store.toggleStep(product.id, task.id, s.id);
              const t2 = Store.activeProduct.journey.tasks.find((t) => t.id === task.id);
              if (t2.steps.every((st) => t2.stepsDone.includes(st.id)) && t2.state !== 'done') toast('All steps complete — you can mark the task as done.');
              Router.rerenderIfCurrent('#/task/' + task.id);
            },
          },
            h('span', { class: 'box', 'aria-hidden': 'true' }),
            s.text,
            done ? h('span', { class: 'sr-only' }, ' (completed)') : null);
        })));

    const needCard = h('section', { class: 'card', 'aria-label': 'What you may need' },
      h('h2', { class: 'h4' }, 'What you may need'),
      h('ul', { class: 'stack-sm', style: { marginTop: '0.9rem' } },
        task.need.map((n) => h('li', { class: 'row', style: { gap: '0.55rem', alignItems: 'flex-start', fontSize: 'var(--type-body)', color: 'var(--foreground-soft)', textTransform: 'none', letterSpacing: '0' } },
          icon('file'), n))));

    const actionsCard = h('section', { class: 'card', 'aria-label': 'Task actions' },
      locked ? h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0' } }, 'This task unlocks when the previous task is completed.') : null,
      h('div', { class: 'stack' },
        locked ? null : h('button', { class: 'btn btn-dark btn-block', onclick: () => this.openAI(product, task) }, icon('chat'), 'Continue with ManakAI'),
        locked || task.state === 'done' ? null : h('button', { class: 'btn btn-primary btn-block', onclick: () => this.confirmComplete(product, task) }, icon('check-circle'), 'Mark as Completed'),
        task.state === 'done' ? h('div', { class: 'badge badge-ok', style: { justifyContent: 'center', padding: '0.6rem 1rem' } }, icon('check-circle'), 'Task completed') : null));

    const sourceCard = h('section', { class: 'card', 'aria-label': 'Source' },
      h('h2', { class: 'h4' }, 'Source'),
      (() => { const src = SOURCES[task.sourceRef]; return src ? h('div', { class: 'stack-sm', style: { marginTop: '0.75rem' } },
        h('p', { class: 't-sm', style: { fontWeight: '500', textTransform: 'none', letterSpacing: '0', lineHeight: '1.45' } }, src.document),
        h('p', { class: 't-xs muted', style: { textTransform: 'none', letterSpacing: '0' } }, src.org + ' · Updated ' + fmtDate(src.updated))) : null; })(),
      h('div', { style: { marginTop: '1rem' } }, SourceButton(task.sourceRef)),
      h('p', { class: 't-xs muted-3', style: { marginTop: '0.7rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } }, 'Read the official text before acting on any requirement.'));

    const pathCard = h('section', { class: 'card', 'aria-label': 'Where this task sits' },
      h('h2', { class: 'h4' }, 'In your journey'),
      CompliancePath(product.journey));

    main.append(h('div', { class: 'container page-pad' }, hero,
      h('div', { class: 'task-detail-grid' },
        h('div', { class: 'stack' }, whyCard, stepsCard, needCard),
        h('div', { class: 'task-side' }, actionsCard, sourceCard, pathCard))));
  },

  confirmComplete(product, task) {
    openModal({
      title: 'Have you completed this task?',
      body: h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } },
        'This marks Task ' + task.num + ' — ' + task.title + ' — as done, and unlocks the next task in your journey.'),
      actions: [
        h('button', { class: 'btn btn-secondary', onclick: function () { this.closest('.overlay').querySelector('.btn-ghost').click(); } }, 'Not Yet'),
        h('button', { class: 'btn btn-primary', onclick: function () {
          this.closest('.overlay').querySelector('.btn-ghost').click();
          TaskPage.completeTask(product, task);
        } }, 'Yes, Mark Complete')],
    });
  },

  completeTask(product, task) {
    Store.completeTask(product.id, task.id);
    Store.appendHistory(product.id, task.stage, Message('user', 'Marked Task ' + task.num + ' as complete.', null));
    const j = Store.activeProduct.journey;
    const next = j.tasks.find((t) => t.state === 'current');
    const nextStageLabel = next ? ((STAGES.find((s) => s.id === next.stage) || {}).label) : null;

    const body = h('div', { class: 'stack' },
      h('div', { class: 'empty', style: { padding: '1.25rem 0' } },
        h('div', { class: 'empty-icon', style: { background: 'var(--verified-bg)', color: 'var(--verified)' } }, icon('check-circle')),
        h('h2', { class: 'h3' }, 'Stage completed.'),
        h('p', { class: 'muted', style: { margin: '0.5rem 0 0', textTransform: 'none', letterSpacing: '0' } }, 'Your next step is ready.')),
      next ? h('div', { class: 'card-flat' },
        h('p', { class: 'eyebrow' }, 'Your Next Step'),
        h('p', { style: { fontWeight: '700', margin: '0.4rem 0', textTransform: 'none', letterSpacing: '0' } }, next.num + ' — ' + next.title),
        h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0' } }, next.actionLabel))
        : h('div', { class: 'card-flat' },
          h('p', { class: 'eyebrow' }, 'Journey complete'),
          h('p', { style: { fontWeight: '700', margin: '0.4rem 0', textTransform: 'none', letterSpacing: '0' } }, 'All tasks are done.'),
          h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0' } }, 'Review your final compliance summary.')));

    openModal({
      title: 'Task completed', body,
      actions: [
        h('button', { class: 'btn btn-secondary', onclick: function () { this.closest('.overlay').querySelector('.btn-ghost').click(); Router.go('#/journey'); } }, 'Return to Checklist'),
        next ? h('button', { class: 'btn btn-primary', onclick: function () {
          this.closest('.overlay').querySelector('.btn-ghost').click();
          if (next.stage === 'testing') Router.go('#/testing'); else Router.go('#/task/' + next.id);
        } }, 'Continue to ' + (nextStageLabel || 'Next Task'), icon('arrow-right'))
        : h('button', { class: 'btn btn-primary', onclick: function () {
          this.closest('.overlay').querySelector('.btn-ghost').click(); Router.go('#/summary');
        } }, 'View Final Summary', icon('arrow-right'))],
    });
    toast('Task ' + task.num + ' completed. Next task unlocked.');
  },

  openAI(product, task) {
    const body = h('div', { class: 'stack' });
    const chatBody = h('div', { class: 'chat-body', style: { maxHeight: '44vh', minHeight: '180px', border: '1px solid var(--border)', marginTop: '1rem' } });
    const input = h('input', { class: 'input', placeholder: 'Ask about this task…', 'aria-label': 'Ask about this task' });
    const sendBtn = h('button', { class: 'btn btn-primary', 'aria-label': 'Send message' }, icon('arrow-right'));

    const addMsg = (role, text) => {
      chatBody.append(h('div', { class: 'msg ' + (role === 'ai' ? 'msg-ai' : 'msg-user') },
        h('span', { class: 'msg-avatar' }, icon(role === 'ai' ? 'sparkle' : 'user')),
        h('div', { class: 'msg-bubble' }, String(text).split('\n\n').map((p, i) => h('p', { style: i ? { marginTop: '8px' } : null }, p)))));
      chatBody.scrollTop = chatBody.scrollHeight;
    };
    const setBusy = (b) => { input.disabled = b; sendBtn.disabled = b; };

    body.append(
      h('div', { class: 'badge badge-progress' }, icon('layers'), 'Continuing from Task ' + task.num),
      h('p', { class: 't-sm muted', style: { marginTop: '0.75rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } },
        'ManakAI knows your product (', product.name, '), your profile, the completed tasks, and this task\u2019s remaining steps — no need to repeat yourself.'),
      chatBody,
      h('div', { class: 'chat-input-row', style: { border: 0, padding: '1rem 0 0' } }, input, sendBtn));

    openDrawer({ title: 'ManakAI — ' + task.title, label: 'AI guidance for task ' + task.num, body });

    const send = async () => {
      const q = input.value.trim();
      if (!q) return;
      addMsg('user', q);
      input.value = '';
      setBusy(true);
      try {
        const a = await AIService.followUp(q, task, product);
        addMsg('ai', a);
        Store.appendHistory(product.id, task.stage, Message('user', q));
        Store.appendHistory(product.id, task.stage, Message('ai', a));
      } catch (e) {
        addMsg('ai', Store.state.offline
          ? 'You appear to be offline — AI features need a connection. Your checklist still works.'
          : 'The AI service is unavailable right now. Your task progress is safe — try again in a moment.');
      }
      setBusy(false);
      input.focus();
    };
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });

    setBusy(true);
    AIService.taskGuidance(task, product).then((txt) => { addMsg('ai', txt); setBusy(false); input.focus(); })
      .catch(() => { addMsg('ai', 'The AI service is unavailable right now. Your task progress is safe — try again in a moment.'); setBusy(false); });
  },
};
