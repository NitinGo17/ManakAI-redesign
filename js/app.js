/* ============================================================
   ManakAI — bootstrap.
   ============================================================ */

(function boot() {
  /* runtime errors surface in the DOM (prototype QA aid) and console */
  window.addEventListener('error', (e) => {
    try {
      const log = document.getElementById('app-error-log');
      const entry = document.createElement('div');
      entry.textContent = 'JS_ERROR: ' + (e.message || 'unknown') + (e.filename ? ' @' + e.filename + ':' + e.lineno : '');
      log.append(entry);
    } catch (err) {}
    console.error(e.error || e.message);
  });
  window.addEventListener('unhandledrejection', (e) => {
    try {
      const log = document.getElementById('app-error-log');
      const entry = document.createElement('div');
      entry.textContent = 'JS_REJECTION: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason));
      log.append(entry);
    } catch (err) {}
  });

  Store.init();

  const setOffline = (offline) => { if (Store.state.offline !== offline) Store.set({ offline }); };
  window.addEventListener('online', () => setOffline(false));
  window.addEventListener('offline', () => setOffline(true));
  setOffline(navigator.onLine === false);

  /* login redirect decides onboarding vs dashboard */
  const originalReplace = Router.replace.bind(Router);
  Router.replace = function (hash) {
    if (hash === '#/onboarding-status') hash = (Store.state.profile && Store.state.profile.userType) ? '#/dashboard' : '#/onboarding';
    originalReplace(hash);
  };

  Store.subscribe(() => renderBanners());

  Router.start();
})();
