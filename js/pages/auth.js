/* ============================================================
   ManakAI — Authentication (login / register / demo entry).
   ============================================================ */

const AuthPage = {
  render(main, route) {
    const isRegister = route.startsWith('#/register');
    if (/[?&]demo=1/.test(route)) { main.append(this.demoSplash()); return; }
    main.append(
      h('div', { class: 'auth-wrap' },
        this.authSide(),
        h('div', { class: 'auth-form-col' },
          h('div', { class: 'auth-form' }, isRegister ? this.registerForm() : this.loginForm()))));
  },

  demoSplash() {
    return h('div', { class: 'container-narrow page-pad text-center' },
      h('div', { class: 'card', style: { padding: 'clamp(2rem, 5vw, 3rem)' } },
        h('span', { class: 'pill-demo', style: { padding: '0.45rem 0.7rem' } }, icon('eye'), 'Demo'),
        h('h1', { class: 'h2', style: { marginTop: '1.25rem' } }, 'Explore ManakAI in Demo Mode'),
        h('p', { class: 'lead', style: { fontSize: 'var(--type-lead)', margin: '1rem auto 0.5rem', textTransform: 'none', letterSpacing: '0' } },
          'You will be signed in as Ananya Sharma, guiding an LED Bulb through product testing at 42% progress — with two more products on the dashboard.'),
        h('p', { class: 't-sm muted', style: { margin: '0.75rem 0 1.75rem', textTransform: 'none', letterSpacing: '0' } },
          'Everything works: the journey, checklist, tasks, AI continuation, sources and summary. Simulated data is labelled as Demo.'),
        h('div', { class: 'stack' },
          h('button', { class: 'btn btn-primary btn-lg btn-block', onclick: () => this.enterDemo() }, icon('eye'), 'Enter Demo Mode'),
          h('button', { class: 'btn btn-secondary btn-block', onclick: () => Router.go('#/register') }, 'Create my own account instead'))));
  },

  enterDemo() {
    Store.loadDemo();
    toast('Demo Mode active — exploring the LED Bulb journey.');
    Router.go('#/dashboard');
  },

  authSide() {
    return h('div', { class: 'auth-side' },
      h('div', { class: 'grid-motif', 'aria-hidden': 'true', html: '<svg preserveAspectRatio="none"><rect width="100%" height="100%" fill="url(#gp-auth)"/><defs><pattern id="gp-auth" width="46" height="46" patternUnits="userSpaceOnUse"><path class="m-line" d="M46 0H0v46" fill="none"/><circle class="m-node" cx="23" cy="23" r="1.3"/></pattern></defs></svg>' }),
      h('div', { style: { position: 'relative', maxWidth: '28em' } },
        BrandMark(true),
        h('h2', { class: 'h2', style: { margin: '1.75rem 0 0.75rem' } }, 'From Product to Compliance.'),
        h('p', { class: 'lead', style: { fontSize: 'var(--type-lead)', textTransform: 'none', letterSpacing: '0', color: 'var(--on-dark-muted)' } },
          'Understand what BIS requirements apply to your product, build your compliance checklist, and complete your journey step by step.'),
        h('div', { class: 'auth-quote' }, '\u201CI used to lose track of what the regulations meant for my product. Now the checklist just tells me what\u2019s next.\u201D — a small manufacturer'),
        h('div', { class: 'row', style: { marginTop: '1.5rem', flexWrap: 'wrap' } },
          h('span', { class: 'tag-chip' }, icon('shield'), 'Sources on every result'),
          h('span', { class: 'tag-chip' }, icon('journey'), 'Journey, not chat'))));
  },

  loginForm() {
    const errBox = h('div', { class: 'field-error hidden', role: 'alert' });
    const btn = h('button', { class: 'btn btn-primary btn-block btn-lg', type: 'submit' }, 'Log in');
    const form = h('form', {
      novalidate: true,
      onsubmit: async (e) => {
        e.preventDefault();
        const email = form.querySelector('#login-email').value.trim();
        const password = form.querySelector('#login-password').value;
        let msg = null;
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) msg = 'Please enter a valid email address.';
        else if (!password) msg = 'Please enter your password.';
        if (msg) { errBox.textContent = msg; errBox.classList.remove('hidden'); return; }
        errBox.classList.add('hidden');
        btn.setAttribute('aria-disabled', 'true'); btn.textContent = 'Logging in…';
        const res = await AuthService.login(email, password);
        btn.removeAttribute('aria-disabled'); btn.textContent = 'Log in';
        if (!res.ok) { errBox.textContent = res.error; errBox.classList.remove('hidden'); form.querySelector('#login-password').focus(); return; }
        Store.establishSession(res.user, false);
        toast('Welcome back, ' + res.user.name.split(' ')[0] + '.');
        Router.go('#/onboarding-status');
      },
    },
      h('h1', { class: 'h2' }, 'Welcome back'),
      h('p', { class: 'muted', style: { margin: '0.5rem 0 1.5rem', textTransform: 'none', letterSpacing: '0' } }, 'Log in to continue your compliance journey.'),
      errBox,
      h('label', { class: 'field' },
        h('span', { class: 'field-label' }, 'Email'),
        h('input', { class: 'input', id: 'login-email', type: 'email', autocomplete: 'email', required: true, placeholder: 'you@company.in' })),
      h('label', { class: 'field' },
        h('span', { class: 'field-label' }, 'Password'),
        h('input', { class: 'input', id: 'login-password', type: 'password', autocomplete: 'current-password', required: true, placeholder: 'Your password' })),
      h('div', { class: 'row-between', style: { marginTop: '1rem' } },
        h('label', { class: 'checkbox-row' }, h('input', { type: 'checkbox', checked: true }), h('span', { class: 't-sm' }, 'Remember me')),
        h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => this.forgotModal() }, 'Forgot password?')),
      h('div', { style: { marginTop: '1.5rem' } }, btn),
      h('div', { class: 'auth-divider' }, 'or'),
      h('a', { href: '#/login?demo=1', class: 'btn btn-secondary btn-block' }, icon('eye'), 'Explore Demo Mode'),
      h('p', { class: 't-sm muted', style: { marginTop: '1.5rem', textAlign: 'center', textTransform: 'none', letterSpacing: '0' } },
        'New to ManakAI? ', h('a', { href: '#/register', style: { color: 'var(--accent)' } }, 'Create an account')));
    setTimeout(() => { const i = form.querySelector('input'); if (i) i.focus(); }, 60);
    return form;
  },

  forgotModal() {
    openModal({
      title: 'Reset your password',
      body: h('div', { class: 'stack' },
        h('p', { class: 't-sm muted', style: { textTransform: 'none', letterSpacing: '0', lineHeight: '1.5' } },
          'Enter the email you registered with. In the production build this sends a reset link; in this prototype it confirms the flow.'),
        h('input', { class: 'input', type: 'email', placeholder: 'you@company.in', 'aria-label': 'Email address' })),
      actions: [
        h('button', { class: 'btn btn-secondary', onclick: function () { this.closest('.overlay').querySelector('.btn-ghost').click(); } }, 'Cancel'),
        h('button', { class: 'btn btn-primary', onclick: function () {
          const inp = this.closest('.modal-wrap').querySelector('input');
          if (!inp.value || !/^\S+@\S+\.\S+$/.test(inp.value)) { inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
          this.closest('.overlay').querySelector('.btn-ghost').click();
          toast('If that email is registered, a reset link would be sent.');
        } }, 'Send reset link')],
    });
  },

  registerForm() {
    const errBox = h('div', { class: 'field-error hidden', role: 'alert' });
    const btn = h('button', { class: 'btn btn-primary btn-block btn-lg', type: 'submit' }, 'Create account');
    const form = h('form', {
      novalidate: true,
      onsubmit: async (e) => {
        e.preventDefault();
        const name = form.querySelector('#reg-name').value.trim();
        const email = form.querySelector('#reg-email').value.trim();
        const pw = form.querySelector('#reg-pw').value;
        const pw2 = form.querySelector('#reg-pw2').value;
        let msg = null;
        if (name.length < 2) msg = 'Please enter your name.';
        else if (!/^\S+@\S+\.\S+$/.test(email)) msg = 'Please enter a valid email address.';
        else if (pw.length < 8) msg = 'Please choose a password of at least 8 characters.';
        else if (pw !== pw2) msg = 'The two passwords don\u2019t match.';
        if (msg) { errBox.textContent = msg; errBox.classList.remove('hidden'); return; }
        errBox.classList.add('hidden');
        btn.setAttribute('aria-disabled', 'true'); btn.textContent = 'Creating your account…';
        const res = await AuthService.register(name, email, pw);
        btn.removeAttribute('aria-disabled'); btn.textContent = 'Create account';
        if (!res.ok) { errBox.textContent = res.error; errBox.classList.remove('hidden'); return; }
        Store.establishSession(res.user, false);
        toast('Account created. Let\u2019s set up your profile.');
        Router.go('#/onboarding');
      },
    },
      h('h1', { class: 'h2' }, 'Create your account'),
      h('p', { class: 'muted', style: { margin: '0.5rem 0 1.5rem', textTransform: 'none', letterSpacing: '0' } }, 'Start your compliance journey in minutes. We never ask for Aadhaar, PAN, or bank details.'),
      errBox,
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Name'),
        h('input', { class: 'input', id: 'reg-name', autocomplete: 'name', required: true, placeholder: 'Your name or business name' })),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Email'),
        h('input', { class: 'input', id: 'reg-email', type: 'email', autocomplete: 'email', required: true, placeholder: 'you@company.in' })),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Password'),
        h('input', { class: 'input', id: 'reg-pw', type: 'password', autocomplete: 'new-password', required: true, placeholder: 'At least 8 characters' }),
        h('span', { class: 'field-hint' }, 'At least 8 characters.')),
      h('label', { class: 'field' }, h('span', { class: 'field-label' }, 'Confirm password'),
        h('input', { class: 'input', id: 'reg-pw2', type: 'password', autocomplete: 'new-password', required: true, placeholder: 'Repeat your password' })),
      h('div', { style: { marginTop: '1.5rem' } }, btn),
      h('p', { class: 't-sm muted', style: { marginTop: '1.5rem', textAlign: 'center', textTransform: 'none', letterSpacing: '0' } },
        'Already have an account? ', h('a', { href: '#/login', style: { color: 'var(--accent)' } }, 'Log in')));
    setTimeout(() => { const i = form.querySelector('input'); if (i) i.focus(); }, 60);
    return form;
  },
};
