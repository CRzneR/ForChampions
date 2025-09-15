// app.js
import { setupTabNavigation } from "./ui-tabs.js";
import { initializeTournamentData } from "./groups.js";
import { updateTeamStats, removeMatchResults } from "./matches.js";
import { showAlert } from "./ui-alert.js";
import { initializeApp } from "./api.js"; // <--- API-Init

window.tournamentData = {};
window.initializeTournamentData = initializeTournamentData;
window.updateTeamStats = updateTeamStats;
window.removeMatchResults = removeMatchResults;
window.showAlert = showAlert;

document.addEventListener("DOMContentLoaded", () => {
  setupTabNavigation();
  initializeApp(); // <--- Backend-Init beim Laden
  document.querySelector('[data-tab="create"]').click();
});
