export class AuthService {
  constructor() {
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user") || "null");
    this.apiBaseUrl = "/api";
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setAuthData(data.token, data.user);
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: "Netzwerkfehler" };
    }
  }

  async register(username, email, password, confirmPassword) {
    if (password !== confirmPassword) {
      return { success: false, message: "Passwörter stimmen nicht überein" };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setAuthData(data.token, data.user);
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: "Netzwerkfehler" };
    }
  }

  setAuthData(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  }

  isLoggedIn() {
    return !!this.token;
  }

  async authFetch(url, options = {}) {
    if (!options.headers) options.headers = {};
    options.headers["Authorization"] = `Bearer ${this.token}`;
    return fetch(url, options);
  }
}
