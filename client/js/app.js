// --- UI + Core ---
import { setupTabNavigation } from "./ui-tabs.js";
import { showAlert } from "./ui-alert.js";
import { generateGroups } from "./groups.js";

// --- API ---
import { initializeApp, getCurrentTournament, getCurrentUser } from "./api.js";

// --- Dashboard ---
import { updateDashboard } from "./dashboard.js";

// --- Turnier-Erstellung ---
import { initCreateModule } from "./create.js";

// --- Weitere Module ---
import { generateSchedule } from "./schedule.js";
import { generatePlayoffs } from "./playoffs.js";

// --- Globale Initialisierung ---
if (!window.tournamentData) {
  window.tournamentData = {}; // wird von API gefüllt
}

// --- Globale Hooks (für onclick etc.) ---
window.showAlert = showAlert;
window.updateDashboard = updateDashboard;
window.generateSchedule = generateSchedule;
window.generateGroups = generateGroups;
window.generatePlayoffs = generatePlayoffs;

// Zugriff auf API-States
window.getCurrentTournament = getCurrentTournament;
window.getCurrentUser = getCurrentUser;

// --- App-Start ---
document.addEventListener("DOMContentLoaded", async () => {
  setupTabNavigation();

  try {
    // 🔹 Lädt immer frische Daten aus MongoDB (nicht nur LocalStorage!)
    await initializeApp();
  } catch (err) {
    console.error("Fehler beim Initialisieren:", err);
    showAlert("Fehler beim Laden der App", "error");
  }

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
