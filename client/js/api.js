// client/js/api.js

import { updateDashboard } from "./dashboard.js";

// ===============================================================
// Dynamische API-URL – funktioniert lokal (localhost) & deployed (Vercel + Render)
// ===============================================================

const API_BASE_URL = (() => {
  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  // LOKALE ENTWICKLUNG → Express Backend auf Port 5001
  if (isLocalhost) {
    return "http://localhost:5001/api";
  }

  // DEPLOYED FRONTEND → immer dein Render-Backend nutzen
  return "https://forchampions.onrender.com/api";
})();

// ===============================================================
// Globale Variablen
// ===============================================================

let currentTournament = null;
let currentUser = null;

// ===============================================================
// Turnier erstellen
// ===============================================================
export async function createTournament(tournamentData) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tournamentData),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Fehler beim Erstellen des Turniers");
    }

    const tournament = await response.json();
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
    return tournament;
  } catch (error) {
    console.error("❌ Fehler beim Turnier-Erstellen:", error);
    throw error;
  }
}

// ===============================================================
// Turnier laden
// ===============================================================
export async function loadTournament(tournamentId) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Fehler beim Laden des Turniers");

    const tournament = await response.json();
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
    return tournament;
  } catch (error) {
    console.error("❌ Fehler beim Turnierladen:", error);
    throw error;
  }
}

// ===============================================================
// Alle Turniere des Users laden
// ===============================================================
export async function loadUserTournaments() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Fehler beim Laden der Turniere");

    return await response.json();
  } catch (error) {
    console.error("❌ Fehler beim Laden der Turnierliste:", error);
    return [];
  }
}

// ===============================================================
// Turnier löschen
// ===============================================================
export async function deleteTournament(tournamentId) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Fehler beim Löschen des Turniers");
    }

    // Lokalen Cache leeren
    currentTournament = null;
    window.tournamentData = null;
    localStorage.removeItem("currentTournamentId");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Turnier-Löschen:", error);
    throw error;
  }
}

// ===============================================================
// Match Ergebnis speichern
// ===============================================================
export async function saveMatchResult(tournamentId, matchData) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) throw new Error("Fehler beim Speichern des Matches");

    const tournament = await response.json();
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
    return tournament;
  } catch (error) {
    console.error("❌ Fehler beim Match-Speichern:", error);
    throw error;
  }
}

// ===============================================================
// Playoff-Match speichern
// ===============================================================
export async function savePlayoffMatchResult(tournamentId, matchData) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/playoffs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) throw new Error("Fehler beim Speichern des Playoff-Matches");

    const tournament = await response.json();
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
    return tournament;
  } catch (error) {
    console.error("❌ Fehler beim Playoff-Speichern:", error);
    throw error;
  }
}

// ===============================================================
// App initialisieren
// ===============================================================
export async function initializeApp() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    currentUser = user;

    try {
      const tournaments = await loadUserTournaments();

      if (tournaments.length > 0) {
        let id = localStorage.getItem("currentTournamentId");
        if (!id) id = tournaments[0]._id;

        currentTournament = await loadTournament(id);
      } else {
        currentTournament = null;
        window.tournamentData = null;
        localStorage.removeItem("currentTournamentId");
      }

      updateDashboard();
    } catch (error) {
      console.error("❌ Fehler beim Initialisieren:", error);
    }
  }
}

// ===============================================================
// Refresh
// ===============================================================
export async function refreshTournament() {
  const id = localStorage.getItem("currentTournamentId");
  if (!id) return null;
  return await loadTournament(id);
}

// Getter
export function getCurrentTournament() {
  return currentTournament;
}

export function getCurrentUser() {
  return currentUser;
}
