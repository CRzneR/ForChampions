import { updateDashboard } from "./dashboard.js";

let currentTournament = null;
let currentUser = null;

// ✅ gleiche Domain wie Frontend & Backend
const API_BASE_URL = window.location.origin;

// --- Turnier erstellen ---
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
  window.tournamentData = tournament;
  localStorage.setItem("currentTournamentId", tournament._id);
  return tournament;
}

// --- Turnier laden ---
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
  window.tournamentData = tournament;
  localStorage.setItem("currentTournamentId", tournament._id);
  return tournament;
}

// --- Alle Turniere des Users laden ---
export async function loadUserTournaments() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/tournaments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Fehler beim Laden der Turniere");
  return await response.json();
}

// --- Match speichern ---
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
  window.tournamentData = tournament;
  return tournament;
}

// --- Playoff-Match speichern ---
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
  window.tournamentData = tournament;
  return tournament;
}

// --- App init ---
export async function initializeApp() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (token && user) {
    currentUser = user;
    const tournaments = await loadUserTournaments();
    if (tournaments.length > 0) {
      let tournamentId =
        localStorage.getItem("currentTournamentId") || tournaments[0]._id;
      await loadTournament(tournamentId);
    }
    updateDashboard();
  }
}

export function getCurrentTournament() {
  return currentTournament;
}
export function getCurrentUser() {
  return currentUser;
}
