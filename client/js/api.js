import { updateDashboard } from "./dashboard.js";

let currentTournament = null;
let currentUser = null;

const API_BASE_URL = window.location.origin;

// --- Auth Funktionen ---

export async function registerUser(username, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registrierung fehlgeschlagen");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  currentUser = data.user;
  return data;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login fehlgeschlagen");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  currentUser = data.user;
  return data;
}

// --- Turnier Funktionen ---

export async function createTournament(tournamentData) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/tournaments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tournamentData),
  });
  if (!response.ok) throw new Error("Fehler beim Erstellen des Turniers");
  const tournament = await response.json();
  currentTournament = tournament;
  localStorage.setItem("currentTournament", JSON.stringify(tournament));
  return tournament;
}

export async function loadTournament(tournamentId) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/api/tournaments/${tournamentId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) throw new Error("Fehler beim Laden des Turniers");
  const tournament = await response.json();
  currentTournament = tournament;
  localStorage.setItem("currentTournament", JSON.stringify(tournament));
  return tournament;
}

export async function loadUserTournaments() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/tournaments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Fehler beim Laden der Turniere");
  return await response.json();
}

export async function saveMatchResult(tournamentId, matchData) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/api/tournaments/${tournamentId}/matches`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(matchData),
    }
  );
  if (!response.ok) throw new Error("Fehler beim Speichern des Matches");
  const tournament = await response.json();
  currentTournament = tournament;
  localStorage.setItem("currentTournament", JSON.stringify(tournament));
  return tournament;
}

export async function savePlayoffMatchResult(tournamentId, matchData) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE_URL}/api/tournaments/${tournamentId}/playoffs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(matchData),
    }
  );
  if (!response.ok)
    throw new Error("Fehler beim Speichern des Playoff-Matches");
  const tournament = await response.json();
  currentTournament = tournament;
  localStorage.setItem("currentTournament", JSON.stringify(tournament));
  return tournament;
}

// --- Initialisierung ---

export async function initializeApp() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    currentUser = user;
    try {
      const tournaments = await loadUserTournaments();
      const savedTournament = localStorage.getItem("currentTournament");
      if (savedTournament) {
        currentTournament = JSON.parse(savedTournament);
        if (currentTournament._id) {
          currentTournament = await loadTournament(currentTournament._id);
        }
      }
      updateDashboard(); // <- kommt aus deiner UI-Logik
    } catch (error) {
      console.error("Fehler beim Initialisieren:", error);
    }
  }
}
