import { generateGroups } from "./groups.js";
import { generateSchedule } from "./schedule.js";
import { updateDashboard } from "./dashboard.js";
import { showAlert } from "./ui-alert.js";
import { createTournament } from "./api.js"; // ✅ API-Call einbinden

// 🔹 Globales Objekt initialisieren (falls noch nicht vorhanden)
if (!window.tournamentData) {
  window.tournamentData = {};
}

// --- Schritt 1: Turnierdaten eingeben ---
export function initCreateModule() {
  const root = document.getElementById("create-content");
  if (!root) return;

  root.innerHTML = `
    <div class="bg-primary rounded-lg shadow-lg border border-gray-800 max-w-2xl mx-auto">
      <div class="px-6 py-4 border-b border-gray-800">
        <h2 class="text-2xl font-bold text-white">Neues Turnier erstellen</h2>
      </div>
      <div class="p-6">
        <form id="tournament-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Turniername</label>
            <input type="text" id="tournament-name" class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="Mein Turnier" required>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Teams</label>
              <input type="number" id="team-count" min="2" class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="8" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Gruppen</label>
              <input type="number" id="group-count" min="1" class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="2" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Playoff-Plätze</label>
              <input type="number" id="playoff-spots" min="1" class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" placeholder="2" required>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full bg-accent text-white py-2.5 px-4 rounded-md">Weiter zu Teamnamen</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById("tournament-form").addEventListener("submit", (e) => {
    e.preventDefault();
    prepareTeamNameInput();
  });
}

// --- Schritt 2: Teamnamen + Shuffle ---
function prepareTeamNameInput() {
  const name = document.getElementById("tournament-name").value.trim();
  const teamCount = parseInt(document.getElementById("team-count").value, 10);
  const groupCount = parseInt(document.getElementById("group-count").value, 10);
  const playoffSpots = parseInt(
    document.getElementById("playoff-spots").value,
    10
  );

  if (!name || isNaN(teamCount) || isNaN(groupCount) || isNaN(playoffSpots)) {
    showAlert("Bitte alle Felder korrekt ausfüllen.", "error");
    return;
  }
  if (teamCount < groupCount) {
    showAlert("Es kann nicht mehr Gruppen als Teams geben.", "error");
    return;
  }
  const teamsPerGroup = Math.floor(teamCount / groupCount);
  if (playoffSpots > teamsPerGroup) {
    showAlert(
      `Maximal ${teamsPerGroup} Playoff-Plätze pro Gruppe möglich.`,
      "error"
    );
    return;
  }

  // 🔹 Daten im globalen Objekt zwischenspeichern
  window.tournamentData = {
    ...window.tournamentData,
    name,
    groupCount,
    playoffSpots,
    teamCount,
  };

  // UI für Teamnamen-Eingabe anzeigen
  const root = document.getElementById("create-content");
  root.innerHTML = `
    <div class="bg-primary rounded-lg shadow-lg border border-gray-800 max-w-2xl mx-auto">
      <div class="px-6 py-4 border-b border-gray-800">
        <h2 class="text-2xl font-bold text-white">Teamnamen eingeben</h2>
      </div>
      <div class="p-6">
        <form id="team-names-form" class="space-y-4">
          <div id="team-inputs" class="space-y-3"></div>
          <div class="flex justify-between gap-4 pt-2">
            <button type="button" id="shuffle-teams" class="flex-1 bg-gray-700 text-white py-2.5 px-4 rounded-md">🔀 Teams mischen</button>
            <button type="submit" class="flex-1 bg-accent text-white py-2.5 px-4 rounded-md">Turnier erstellen</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Eingabefelder erzeugen
  const inputs = document.getElementById("team-inputs");
  for (let i = 0; i < teamCount; i++) {
    const div = document.createElement("div");
    div.innerHTML = `
      <label class="block text-sm font-medium text-gray-300 mb-1">Team ${
        i + 1
      }</label>
      <input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white" value="Team ${
        i + 1
      }">
    `;
    inputs.appendChild(div);
  }

  // 🔀 Shuffle-Button Logik
  document.getElementById("shuffle-teams").addEventListener("click", () => {
    const inputElements = [...inputs.querySelectorAll("input")];
    const names = inputElements.map((i) => i.value.trim() || "Unnamed Team");

    // Fisher-Yates Shuffle
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }

    // Eingabefelder neu befüllen
    inputElements.forEach((input, idx) => {
      input.value = names[idx];
    });
  });

  // Turnier speichern
  document
    .getElementById("team-names-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const names = [...inputs.querySelectorAll("input")].map(
        (i) => i.value.trim() || "Unnamed Team"
      );

      window.tournamentData.teamNames = names;

      try {
        // 🔹 Turnier über API speichern
        const tournament = await createTournament({
          name: window.tournamentData.name,
          groupCount: window.tournamentData.groupCount,
          playoffSpots: window.tournamentData.playoffSpots,
          teams: names.map((n) => ({ name: n })),
        });

        // UI aktualisieren
        const titleEl = document.getElementById("tournament-title");
        if (titleEl) {
          titleEl.textContent = tournament.name;
          titleEl.classList.remove("hidden");
        }

        generateGroups();
        generateSchedule();
        updateDashboard();

        // Zum Gruppen-Tab wechseln
        const btn = document.querySelector('[data-tab="groups"]');
        if (btn) btn.click();

        showAlert("Turnier erfolgreich erstellt und gespeichert!", "success");
      } catch (err) {
        console.error("Fehler beim Erstellen:", err);
        showAlert("Fehler beim Erstellen des Turniers", "error");
      }
    });
}
