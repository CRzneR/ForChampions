// /src/main.js - Haupt-Einstiegspunkt der Anwendung

import { TournamentApp } from "./src/app.js";
import { initCreateModule } from "./src/components/CreateTournamentComponent.js";
import { initDashboardModule } from "./src/components/DashboardComponent.js";
import { initGroupsModule } from "./src/components/GroupsComponent.js";
import { initScheduleModule } from "./src/components/ScheduleComponent.js";
import { initPlayoffsModule } from "./src/components/PlayoffsComponent.js";

// Globale Initialisierungsfunktionen für Module
window.initCreateModule = (tournamentService) => {
  initCreateModule(tournamentService);
};

window.initDashboardModule = (tournamentService) => {
  initDashboardModule(tournamentService);
};

window.initGroupsModule = (tournamentService) => {
  initGroupsModule(tournamentService);
};

window.initScheduleModule = (tournamentService) => {
  initScheduleModule(tournamentService);
};

window.initPlayoffsModule = (tournamentService) => {
  initPlayoffsModule(tournamentService);
};

// App initialisieren wenn DOM geladen
document.addEventListener("DOMContentLoaded", function () {
  try {
    window.app = new TournamentApp();

    // Lucide Icons initialisieren
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    console.log("✅ TournamentApp erfolgreich initialisiert");
  } catch (error) {
    console.error("❌ Fehler bei der App-Initialisierung:", error);

    // Fallback: Einfache Fehleranzeige
    const errorDiv = document.createElement("div");
    errorDiv.className =
      "fixed top-4 left-4 right-4 bg-red-600 text-white p-4 rounded-md z-50";
    errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>App konnte nicht geladen werden. Bitte Seite neu laden.</span>
            </div>
        `;
    document.body.appendChild(errorDiv);
  }
});

// Error Handling für globale Fehler
window.addEventListener("error", function (event) {
  console.error("Globaler Fehler:", event.error);
});

// Unhandled Promise Rejection Handling
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unbehandelte Promise-Ablehnung:", event.reason);
  event.preventDefault();
});
