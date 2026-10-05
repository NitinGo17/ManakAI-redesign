/* ============================================================
   ManakAI — AuthService (js/services/auth.js)
   Mock implementation over localStorage. The same call surface
   (`register / login / logout / session`) maps to a real auth
   backend later without touching the UI.
   ============================================================ */

const AuthService = {
  delay(ms) { return new Promise(r => setTimeout(r, ms)); },

  async register(name, email, password) {
    await this.delay(700);
    const users = this._users();
    if (users.some(u => u.email === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists. Try logging in instead.' };
    }
    const user = User('u' + Date.now(), name.trim(), email.toLowerCase(), password);
    users.push(user);
    this._saveUsers(users);
    return { ok: true, user };
  },

  async login(email, password) {
    await this.delay(650);
    const users = this._users();
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user || user.password !== password) {
      return { ok: false, error: 'That email and password combination didn\'t match. Please try again.' };
    }
    return { ok: true, user };
  },

  logout() {
    Store.clearSession();
  },

  _users() {
    try { return JSON.parse(localStorage.getItem('manakai_users') || '[]'); }
    catch (e) { return []; }
  },

  _saveUsers(users) {
    try { localStorage.setItem('manakai_users', JSON.stringify(users)); } catch (e) {}
  },
};
