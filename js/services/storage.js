/* ============================================================
   ManakAI — StorageService (js/services/storage.js)
   Local persistence layer. Swap this module for real API calls
   later — nothing else in the app touches localStorage directly.
   ============================================================ */

const StorageService = {
  KEY: 'manakai_state_v1',

  read() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  },

  write(state) {
    try {
      // Never persist passwords in a real deployment — mock only.
      const safe = JSON.parse(JSON.stringify(state));
      localStorage.setItem(this.KEY, JSON.stringify(safe));
    } catch (e) { /* quota / private mode — app still works in-memory */ }
  },

  clear() {
    try { localStorage.removeItem(this.KEY); } catch (e) {}
  },
};
