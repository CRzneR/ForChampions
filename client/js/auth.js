class Auth {
  constructor() {
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user"));
    this.apiBaseUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3000/api/auth" // Dev
        : `${window.location.origin}/api/auth`; // Prod
  }

  // Login
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        this.token = data.token;
        this.user = data.user;

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        return { success: true, data };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: "Netzwerkfehler" };
    }
  }

  // Registrierung
  async register(username, email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        this.token = data.token;
        this.user = data.user;

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
        return { success: true, data };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: "Netzwerkfehler" };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
  }

  isLoggedIn() {
    return !!this.token;
  }
}

window.auth = new Auth();
export default window.auth;
