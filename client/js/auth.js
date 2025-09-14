class Auth {
  constructor() {
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user") || "null");
    this.apiBaseUrl = "/api"; // ✅ Korrigiert: Relativer Pfad
  }

  // Login-Funktion
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;

        // Speichern im localStorage
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));

        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: "Netzwerkfehler. Bitte Server-Status prüfen.",
      };
    }
  }

  // Registrierungs-Funktion
  async register(username, email, password, confirmPassword) {
    // Passwort-Matching Check
    if (password !== confirmPassword) {
      return {
        success: false,
        message: "Passwörter stimmen nicht überein",
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;

        // Speichern im localStorage
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));

        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: "Netzwerkfehler. Bitte Server-Status prüfen.",
      };
    }
  }

  // Logout-Funktion
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload(); // ✅ Korrigiert: Reload statt redirect
  }

  // Prüfen ob eingeloggt
  isLoggedIn() {
    return !!this.token; // ✅ Verbesserte Prüfung
  }

  // Token validität prüfen (neu)
  isValidToken() {
    if (!this.token) return false;

    try {
      const payload = JSON.parse(atob(this.token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Authentifizierte Requests
  async authFetch(url, options = {}) {
    if (!this.isLoggedIn() || !this.isValidToken()) {
      this.logout();
      throw new Error("Nicht authentifiziert");
    }

    if (!options.headers) {
      options.headers = {};
    }
    options.headers["Authorization"] = `Bearer ${this.token}`;

    const response = await fetch(url, options);

    // Token abgelaufen?
    if (response.status === 401) {
      this.logout();
      throw new Error("Sitzung abgelaufen");
    }

    return response;
  }
}

// Globale Auth-Instanz
const auth = new Auth();
