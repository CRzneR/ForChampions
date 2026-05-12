import { generateGroups } from "./groups.js";
import { generateSchedule } from "./schedule.js";
import { updateDashboard } from "./dashboard.js";
import { showAlert } from "./ui-alert.js";
import { createTournament } from "./api.js";

// 🔹 Globales Objekt initialisieren
if (!window.tournamentData) {
  window.tournamentData = {};
}

// ------------------------------------------------------------
//  STEP 1 – Turnierdaten Grundformular
// ------------------------------------------------------------
export function initCreateModule() {
  const root = document.getElementById("create-content");
  if (!root) return;

  root.innerHTML = `
    <div class="glass-panel soft-shadow rounded-xl border border-white/10 max-w-2xl mx-auto">
      <div class="px-6 py-4 border-b border-white/10">
        <h2 class="text-2xl font-bold text-gray-200">Neues Turnier erstellen</h2>
      </div>

      <div class="p-6">
        <form id="tournament-form" class="space-y-6">

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Turniername</label>
            <input 
              type="text"
              id="tournament-name" 
              class="w-full glass-panel border border-white/10 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-white/20" 
              placeholder="Mein Turnier" 
              required
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${createNumberInput("Teams", "team-count", 2, "8")}
            ${createNumberInput("Gruppen", "group-count", 1, "2")}
            ${createNumberInput("Playoff-Plätze", "playoff-spots", 1, "2")}
          </div>

          <div class="pt-2">
            <button 
              type="submit"
              class="w-full bg-green-600/60 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg soft-shadow transition"
            >
              Weiter zu Teamnamen
            </button>
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

// Kleine Hilfsfunktion für Nummerninputs
function createNumberInput(label, id, min, placeholder) {
  return `
  <div>
    <label class="block text-sm font-medium text-gray-300 mb-1">${label}</label>
    <input 
      type="number"
      id="${id}"
      min="${min}"
      class="w-full glass-panel border border-white/10 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-white/20"
      placeholder="${placeholder}"
      required
    >
  </div>`;
}

// ------------------------------------------------------------
//  STEP 2 – Teamnamen + Shuffle
// ------------------------------------------------------------
function prepareTeamNameInput() {
  const name = document.getElementById("tournament-name").value.trim();
  const teamCount = parseInt(document.getElementById("team-count").value, 10);
  const groupCount = parseInt(document.getElementById("group-count").value, 10);
  const playoffSpots = parseInt(document.getElementById("playoff-spots").value, 10);

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
    showAlert(`Maximal ${teamsPerGroup} Playoff-Plätze pro Gruppe möglich.`, "error");
    return;
  }

  // Speichern
  window.tournamentData = { ...window.tournamentData, name, groupCount, playoffSpots, teamCount };

  // UI ersetzen
  const root = document.getElementById("create-content");
  root.innerHTML = `
    <div class="glass-panel soft-shadow rounded-xl border border-white/10 max-w-2xl mx-auto">

      <div class="px-6 py-4 border-b border-white/10">
        <h2 class="text-2xl font-bold text-gray-200">Teamnamen eingeben</h2>
      </div>

      <div class="p-6">
        <form id="team-names-form" class="space-y-4">
          <div id="team-inputs" class="space-y-3"></div>

          <div class="flex justify-between gap-4 pt-2">
            <button type="button" id="shuffle-teams"
              class="flex-1 glass-panel text-gray-100 py-2.5 px-4 rounded-lg hover:bg-white/10 transition">
              🔀 Teams mischen
            </button>

            <button 
              type="submit"
              class="flex-1 bg-green-600/60 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg soft-shadow transition"
            >
              Turnier erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Team-Inputs erzeugen
  const inputs = document.getElementById("team-inputs");
  for (let i = 0; i < teamCount; i++) {
    inputs.innerHTML += `
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Team ${i + 1}</label>
        <input 
          type="text"
          class="w-full glass-panel border border-white/10 rounded-lg px-3 py-2 text-gray-100"
          value="Team ${i + 1}"
        >
      </div>
    `;
  }

  // Shuffle
  document.getElementById("shuffle-teams").addEventListener("click", () => {
    const inputElements = [...inputs.querySelectorAll("input")];
    const names = inputElements.map((i) => i.value.trim() || "Team");

    // Fisher-Yates
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }

    inputElements.forEach((input, idx) => (input.value = names[idx]));
  });

  // Turnier speichern
  document.getElementById("team-names-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const names = [...inputs.querySelectorAll("input")].map((i) => i.value.trim() || "Unbenannt");

    window.tournamentData.teamNames = names;

    try {
      const tournament = await createTournament({
        name: window.tournamentData.name,
        groupCount: window.tournamentData.groupCount,
        playoffSpots: window.tournamentData.playoffSpots,
        teams: names.map((n) => ({ name: n })),
      });

      const titleEl = document.getElementById("tournament-title");
      if (titleEl) {
        titleEl.textContent = tournament.name;
        titleEl.classList.remove("hidden");
      }

      generateGroups();
      generateSchedule();
      updateDashboard();

      const btn = document.querySelector('[data-tab="groups"]');
      if (btn) btn.click();

      showAlert("Turnier erfolgreich erstellt!", "success");
    } catch (err) {
      console.error(err);
      showAlert("Fehler beim Erstellen des Turniers", "error");
    }
  });
}
