// client/js/auth.js

class Auth {
  constructor() {
    this.apiBase = "/api";
    this.currentUser = null;
    this.checkAuthState();
  }

  async checkAuthState() {
    try {
      const response = await fetch(`${this.apiBase}/user`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.currentUser = data.user;
          this.onAuthStateChange(true, data.user);
          return true;
        }
      }

      this.currentUser = null;
      this.onAuthStateChange(false, null);
      return false;
    } catch (error) {
      console.error("Auth check failed:", error);
      this.currentUser = null;
      this.onAuthStateChange(false, null);
      return false;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBase}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        this.currentUser = data.user;
        this.onAuthStateChange(true, data.user);
      }

      return data;
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Login fehlgeschlagen" };
    }
  }

  async register(username, email, password) {
    try {
      const response = await fetch(`${this.apiBase}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      return await response.json();
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, message: "Registrierung fehlgeschlagen" };
    }
  }

  async logout() {
    try {
      const response = await fetch(`${this.apiBase}/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        this.currentUser = null;
        this.onAuthStateChange(false, null);
      }

      return data;
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, message: "Logout fehlgeschlagen" };
    }
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  onAuthStateChange(authenticated, user) {
    // Diese Methode kann von anderen Teilen der App überschrieben werden
    console.log("Auth state changed:", authenticated, user);

    // Event auslösen, damit andere Teile der App reagieren können
    const event = new CustomEvent("authStateChange", {
      detail: { authenticated, user },
    });
    window.dispatchEvent(event);
  }
}

// Globale Auth-Instanz erstellen
window.auth = new Auth();
