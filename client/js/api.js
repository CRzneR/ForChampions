// client/js/api.js

import { updateDashboard } from "./dashboard.js";

// Globale Variablen für den aktuellen Zustand
let currentTournament = null;
let currentUser = null;

// ✅ API-Basis-URL dynamisch – funktioniert lokal & bei Render
const API_BASE_URL = window.location.origin;

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
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
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
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
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

    const tournament = await response.json();
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
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
    currentTournament = tournament;
    window.tournamentData = tournament;
    localStorage.setItem("currentTournamentId", tournament._id);
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
        currentTournament = await loadTournament(tournamentId);
      } else {
        console.log("ℹ️ Keine Turniere gefunden.");
        localStorage.removeItem("currentTournamentId");
        currentTournament = null;
        window.tournamentData = null;
      }

      updateDashboard();
    } catch (error) {
      console.error("Fehler beim Initialisieren:", error);
    }
  }
}

// Getter
export function getCurrentTournament() {
  return currentTournament;
}

export function getCurrentUser() {
  return currentUser;
}
