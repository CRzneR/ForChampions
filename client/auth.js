const API_URL = "http://localhost:5000/api/auth";

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login fehlgeschlagen");
    }

    // Token und Benutzerdaten speichern
    localStorage.setItem("authToken", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.userId,
        name: data.name,
      })
    );

    // Dashboard anzeigen
    showDashboard(data);
  } catch (error) {
    errorMessage.textContent = error.message;
  }
}

async function register() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const name = document.getElementById("reg-name").value;
  const regErrorMessage = document.getElementById("reg-error-message");

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registrierung fehlgeschlagen");
    }

    // Nach erfolgreicher Registrierung direkt einloggen
    localStorage.setItem("authToken", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.userId,
        name: data.name,
      })
    );

    showDashboard(data);
  } catch (error) {
    regErrorMessage.textContent = error.message;
  }
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
}

function showDashboard(userData) {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("welcome-user").textContent = userData.name;
}

// Beim Laden prüfen, ob eingeloggt
window.onload = async function () {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("user");

  if (token && userData) {
    try {
      // Token validieren
      const response = await fetch(`${API_URL}/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const user = JSON.parse(userData);
        showDashboard(user);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
  }
};
