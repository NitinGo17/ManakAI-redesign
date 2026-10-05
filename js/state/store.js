/* ============================================================
   ManakAI — Store (js/state/store.js)
   Single source of truth for app state + domain actions.
   Pages render from state; actions mutate; persistence is automatic.
   ============================================================ */

const Store = {
  state: {
    user: null,           // User
    profile: null,        // Profile
    products: [],         // Product[]
    activeProductId: null,
    demoMode: false,
    offline: false,
    aiUnavailable: false,
  },

  listeners: [],
  _saveTimer: null,

  init() {
    const saved = StorageService.read();
    if (saved) {
      // Rehydrate (drop transient flags)
      this.state = { ...saved, offline: false, aiUnavailable: saved.aiUnavailable || false };
    }
  },

  get activeProduct() {
    return this.state.products.find(p => p.id === this.state.activeProductId) || this.state.products[0] || null;
  },

  set(patch, opts) {
    Object.assign(this.state, patch);
    this.emit();
    if (!(opts && opts.silent)) this.persist();
  },

  emit() {
    this.listeners.forEach(fn => { try { fn(this.state); } catch (e) { console.error(e); } });
  },

  subscribe(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(f => f !== fn); };
  },

  persist() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => StorageService.write(this.state), 120);
  },

  /* ---------- session ---------- */
  establishSession(user, demoMode) {
    // Restore a previously archived journey for this account (logout keeps work).
    const archived = this.state.archived || {};
    const saved = archived[user.email];
    this.set({
      user, demoMode: !!demoMode,
      profile: saved ? saved.profile : null,
      products: saved ? saved.products : [],
      activeProductId: saved ? saved.activeProductId : null,
    });
  },

  clearSession() {
    // Archive the current workspace keyed by account email, then log out.
    const user = this.state.user;
    if (user && !this.state.demoMode) {
      const archived = { ...(this.state.archived || {}) };
      archived[user.email] = {
        profile: this.state.profile,
        products: this.state.products,
        activeProductId: this.state.activeProductId,
      };
      this.set({ archived, user: null, profile: null, products: [], activeProductId: null, demoMode: false });
    } else {
      this.set({ user: null, profile: null, products: [], activeProductId: null, demoMode: false });
    }
  },

  /* ---------- profile ---------- */
  saveProfile(patch) {
    if (!this.state.profile) return;
    this.set({ profile: { ...this.state.profile, ...patch, updatedAt: new Date().toISOString() } });
  },

  /* ---------- products ---------- */
  addProduct(product) {
    this.set({ products: [...this.state.products, product], activeProductId: product.id });
    return product;
  },

  switchProduct(productId) {
    this.set({ activeProductId: productId });
  },

  removeProduct(productId) {
    const products = this.state.products.filter(p => p.id !== productId);
    const activeProductId = this.state.activeProductId === productId
      ? (products[0] ? products[0].id : null) : this.state.activeProductId;
    this.set({ products, activeProductId });
  },

  /* ---------- journeys & tasks ---------- */
  _mutateJourney(productId, fn) {
    const products = this.state.products.map(p => {
      if (p.id !== productId) return p;
      const journey = JSON.parse(JSON.stringify(p.journey));
      fn(journey);
      normalizeJourney(journey);
      return { ...p, journey };
    });
    this.set({ products });
  },

  setJourney(productId, journey) {
    this._mutateJourney(productId, j => Object.assign(j, journey));
  },

  toggleStep(productId, taskId, stepId) {
    this._mutateJourney(productId, j => {
      const t = j.tasks.find(t => t.id === taskId);
      if (!t) return;
      if (t.state === 'locked') return;
      if (t.stepsDone.includes(stepId)) t.stepsDone = t.stepsDone.filter(s => s !== stepId);
      else t.stepsDone.push(stepId);
      // Steps completing does NOT auto-complete the task — the user
      // explicitly confirms via "Mark as Completed" (auditable action).
    });
  },

  completeTask(productId, taskId) {
    this._mutateJourney(productId, j => {
      const t = j.tasks.find(t => t.id === taskId);
      if (!t) return;
      t.stepsDone = t.steps.map(s => s.id);
      t.state = 'done';
    });
  },

  appendHistory(productId, stage, message) {
    this._mutateJourney(productId, j => {
      if (!j.history[stage]) j.history[stage] = [];
      j.history[stage].push(message);
    });
  },

  /* ---------- demo ---------- */
  loadDemo() {
    const demo = buildDemoState();
    this.set({
      user: demo.user, profile: demo.profile, products: demo.products,
      activeProductId: demo.activeProductId, demoMode: true,
    });
  },

  resetAll() {
    StorageService.clear();
    try { localStorage.removeItem('manakai_users'); } catch (e) {}
    this.state = { user: null, profile: null, products: [], activeProductId: null, demoMode: false, offline: false, aiUnavailable: false };
    this.emit();
  },
};
