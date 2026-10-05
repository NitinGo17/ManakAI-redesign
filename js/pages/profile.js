/* ============================================================
   ManakAI — Profile & prototype demo controls.
   ============================================================ */

const ProfilePage = {
  render(main) {
    const s = Store.state;
    const p = s.profile || {};

    main.append(h('div', { class: 'container page-pad' },
      h('p', { class: 'eyebrow' }, 'Your account'),
      h('h1', { class: 'h1' }, 'Profile'),
      h('div', { class: 'profile-grid', style: { marginTop: '2rem' } },
        h('section', { class: 'card', 'aria-label': 'Profile details' },
          h('h2', { class: 'h4' }, 'Your details'),
          h('div', { class: 'row', style: { gap: '1rem', marginTop: '1rem' } },
            h('span', { class: 'avatar avatar-copper', style: { width: '3.25rem', height: '3.25rem', fontSize: 'var(--type-title)' } },
              (s.user ? s.user.name : 'U').trim().charAt(0).toUpperCase()),
            h('div', null,
              h('p', { style: { fontWeight: '700', textTransform: 'none', letterSpacing: '0' } }, s.user ? s.user.name : '\u2014'),
              h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0' } }, s.user ? s.user.email : '\u2014'))),
          h('form', {
            class: 'stack', style: { marginTop: '1.5rem' },
            onsubmit: (e) => {
              e.preventDefault();
              Store.saveProfile({ industry: document.getElementById('prof-industry').value, stage: document.getElementById('prof-stage').value });
              toast('Profile updated.');
            },
          },
            h('label', { class: 'field', style: { marginTop: 0 } },
              h('span', { class: 'field-label' }, 'Industry'),
              h('select', { class: 'select', id: 'prof-industry' },
                h('option', { value: '' }, 'Select an industry…'),
                OnboardingPage.INDUSTRIES.map((i) => h('option', { value: i, selected: p.industry === i ? true : null }, i)))),
            h('label', { class: 'field' },
              h('span', { class: 'field-label' }, 'Current compliance stage'),
              h('select', { class: 'select', id: 'prof-stage' },
                h('option', { value: '' }, 'Select…'),
                OnboardingPage.STAGE_OPTS.map((o) => h('option', { value: o.id, selected: p.stage === o.id ? true : null }, o.label)))),
            h('div', null, h('button', { class: 'btn btn-primary', type: 'submit' }, 'Save changes')))),
        h('div', { class: 'stack' },
          this.demoControls(),
          h('section', { class: 'card', 'aria-label': 'About ManakAI' },
            h('h2', { class: 'h4' }, 'About ManakAI'),
            h('p', { class: 't-sm muted', style: { marginTop: '0.75rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.55' } },
              'ManakAI is an independent AI-powered BIS compliance guidance platform. It is not affiliated with, endorsed by, or an official product of the Bureau of Indian Standards.'),
            h('p', { class: 't-sm muted', style: { marginTop: '0.75rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.55' } },
              'ManakAI provides guidance, not certification, and never claims government approval or guaranteed compliance. Every compliance-critical result shows its source and verification state.'),
            h('button', { class: 'btn btn-danger', style: { marginTop: '1.25rem' }, onclick: () => {
              openModal({
                title: 'Log out of ManakAI?',
                body: h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } }, 'Your journey and profile stay saved on this device. In production they live in your account.'),
                actions: [
                  h('button', { class: 'btn btn-secondary', onclick: function () { this.closest('.overlay').querySelector('.btn-ghost').click(); } }, 'Stay logged in'),
                  h('button', { class: 'btn btn-danger', onclick: function () { this.closest('.overlay').querySelector('.btn-ghost').click(); AuthService.logout(); toast('You have been logged out.'); Router.go('#/'); } }, 'Log out')],
              });
            } }, icon('logout'), 'Log out'))))));
  },

  demoControls() {
    const s = Store.state;
    return h('section', { class: 'card demo-controls', 'aria-label': 'Prototype demo controls' },
      h('div', { class: 'row-between' },
        h('h2', { class: 'h4' }, 'Prototype demo controls'),
        h('span', { class: 'pill-demo' }, icon('eye'), 'SIH evaluation')),
      h('p', { class: 't-sm muted', style: { marginTop: '0.5rem', textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } },
        'Trigger product states live during a demo — the UI has real handling for each of these.'),
      h('div', { class: 'stack', style: { marginTop: '1rem' } },
        h('button', { class: 'btn btn-secondary btn-block', onclick: () => { Store.loadDemo(); toast('Demo Mode loaded — LED Bulb journey at 42%.'); Router.go('#/dashboard'); } },
          icon('eye'), s.demoMode ? 'Reload the demo journey' : 'Load Demo Mode (LED Bulb, 42%)'),
        h('button', { class: 'btn btn-secondary btn-block', 'aria-pressed': s.aiUnavailable ? 'true' : 'false', onclick: () => { Store.set({ aiUnavailable: !s.aiUnavailable }); toast(s.aiUnavailable ? 'AI unavailable simulated ON — try Ask ManakAI.' : 'AI service restored.'); } },
          icon('alert-circle'), s.aiUnavailable ? 'AI unavailable: ON' : 'Simulate AI unavailable'),
        h('button', { class: 'btn btn-secondary btn-block', 'aria-pressed': s.offline ? 'true' : 'false', onclick: () => { Store.set({ offline: !s.offline }); toast(s.offline ? 'Offline simulated ON — AI is disabled, checklist still works.' : 'Back online.'); } },
          icon('offline'), s.offline ? 'Offline: ON' : 'Simulate offline'),
        h('button', { class: 'btn btn-danger btn-block', onclick: () => {
          openModal({
            title: 'Reset all prototype data?',
            body: h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } }, 'This clears your account, profile and journeys from this device and returns you to the homepage.'),
            actions: [
              h('button', { class: 'btn btn-secondary', onclick: function () { this.closest('.overlay').querySelector('.btn-ghost').click(); } }, 'Cancel'),
              h('button', { class: 'btn btn-danger', onclick: function () { this.closest('.overlay').querySelector('.btn-ghost').click(); Store.resetAll(); toast('All prototype data cleared.'); Router.go('#/'); } }, 'Reset everything')],
          });
        } }, icon('alert-circle'), 'Reset all prototype data')));
  },
};
