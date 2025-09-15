class Auth {
  constructor() {
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user"));
    this.apiBaseUrl = "http://localhost:3000/api"; // Anpassen an deine Server-URL
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
      return { success: false, message: "Netzwerkfehler" };
    }
  }

  // Registrierungs-Funktion
  async register(username, email, password) {
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
      return { success: false, message: "Netzwerkfehler" };
    }
  }

  // Logout-Funktion
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
  }

  // Prüfen ob eingeloggt
  isLoggedIn() {
    return this.token !== null;
  }

  // Authentifizierte Requests
  async authFetch(url, options = {}) {
    if (!options.headers) {
      options.headers = {};
    }
    options.headers["Authorization"] = `Bearer ${this.token}`;

    const response = await fetch(url, options);
    return response;
  }
}

// Globale Auth-Instanz
const auth = new Auth();
