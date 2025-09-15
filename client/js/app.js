// --- UI + Core ---
import { setupTabNavigation } from "./ui-tabs.js";
import { initializeTournamentData, generateGroups } from "./groups.js";
import { updateTeamStats, removeMatchResults } from "./matches.js";
import { showAlert } from "./ui-alert.js";

// --- API ---
import { initializeApp } from "./api.js";

// --- Dashboard ---
import { updateDashboard } from "./dashboard.js";

// --- Turnier-Erstellung ---
import { initCreateModule } from "./create.js";

// --- Weitere Module ---
import { generateSchedule, generateMatchdays } from "./schedule.js";
import { generatePlayoffs } from "./playoffs.js";

// --- Globale Initialisierung ---
if (!window.tournamentData) {
  window.tournamentData = {
    name: "",
    teams: [],
    groups: [],
    matches: [],
    playoffSpots: 0,
    teamNames: [],
  };
}

// Globale Hooks (für onclick etc.)
window.initializeTournamentData = initializeTournamentData;
window.updateTeamStats = updateTeamStats;
window.removeMatchResults = removeMatchResults;
window.showAlert = showAlert;
window.updateDashboard = updateDashboard;
window.generateSchedule = generateSchedule;
window.generateMatchdays = generateMatchdays;
window.generateGroups = generateGroups;
window.generatePlayoffs = generatePlayoffs;

// --- App-Start ---
document.addEventListener("DOMContentLoaded", () => {
  setupTabNavigation();

  initializeApp().catch((err) => {
    console.error("Fehler beim Initialisieren:", err);
  });

  // Tabs → Module rendern
  const tabGroups = document.querySelector('[data-tab="groups"]');
  if (tabGroups) tabGroups.addEventListener("click", generateGroups);

  const tabSchedule = document.querySelector('[data-tab="schedule"]');
  if (tabSchedule) tabSchedule.addEventListener("click", generateSchedule);

  const tabPlayoffs = document.querySelector('[data-tab="playoffs"]');
  if (tabPlayoffs) tabPlayoffs.addEventListener("click", generatePlayoffs);

  const tabCreate = document.querySelector('[data-tab="create"]');
  if (tabCreate) {
    tabCreate.addEventListener("click", initCreateModule);
    tabCreate.click(); // Standardmäßig öffnen
  }
});
