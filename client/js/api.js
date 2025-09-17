// client/js/api.js

import { updateDashboard } from "./dashboard.js";

// Globale Variablen für den aktuellen Zustand
let currentTournament = null;
let currentUser = null;

// API-Basis-URL für Browser (kein process.env!)
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001" // Dev: dein Backend
    : window.location.origin; // Prod: gleiche Domain wie Frontend

// 🔹 Turnier erstellen
export async function createTournament(tournamentData) {
  try {
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
    setTournament(tournament);
    return tournament;
  } catch (error) {
    console.error("Fehler:", error);
    throw error;
  }
}

// 🔹 Bestimmtes Turnier laden
export async function loadTournament(tournamentId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/api/tournaments/${tournamentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Fehler beim Laden des Turniers");

    const tournament = await response.json();
    setTournament(tournament);
    return tournament;
  } catch (error) {
    console.error("Fehler:", error);
    throw error;
  }
}

// 🔹 Alle Turniere des Users laden
export async function loadUserTournaments() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/tournaments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Fehler beim Laden der Turniere");
    return await response.json();
  } catch (error) {
    console.error("Fehler:", error);
    return [];
  }
}

// 🔹 Match-Ergebnis speichern
export async function saveMatchResult(tournamentId, matchData) {
  try {
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

    // Server gibt Turnier zurück
    const tournament = await response.json();
    setTournament(tournament);
    return tournament;
  } catch (error) {
    console.error("Fehler:", error);
    throw error;
  }
}

// 🔹 Playoff-Match-Ergebnis speichern
export async function savePlayoffMatchResult(tournamentId, matchData) {
  try {
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
    setTournament(tournament);
    return tournament;
  } catch (error) {
    console.error("Fehler:", error);
    throw error;
  }
}

// 🔹 App-Initialisierung
export async function initializeApp() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    currentUser = user;

    try {
      const tournaments = await loadUserTournaments();
      if (tournaments.length > 0) {
        let tournamentId = localStorage.getItem("currentTournamentId");
        if (!tournamentId) tournamentId = tournaments[0]._id;

        await loadTournament(tournamentId); // frische Daten laden
      } else {
        console.log("ℹ️ Keine Turniere gefunden.");
        localStorage.removeItem("currentTournamentId");
        setTournament(null);
      }

      updateDashboard();
    } catch (error) {
      console.error("Fehler beim Initialisieren:", error);
    }
  }
}

// 🔹 Turnier frisch aus DB laden und global setzen
export async function refreshTournament() {
  if (!currentTournament?._id) return null;
  const updated = await loadTournament(currentTournament._id);
  updateDashboard();
  return updated;
}

// 🔹 Setter für Tournament (zentral)
function setTournament(tournament) {
  currentTournament = tournament;
  window.tournamentData = tournament;
  if (tournament?._id) {
    localStorage.setItem("currentTournamentId", tournament._id);
  }
}

// Getter
export function getCurrentTournament() {
  return currentTournament;
}

export function getCurrentUser() {
  return currentUser;
}
