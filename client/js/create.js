// create.js - Turniererstellung mit Eingabe der Teamnamen

function initCreateModule() {
  const createContent = document.getElementById("create-content");
  createContent.innerHTML = `
      <div class="bg-primary rounded-lg shadow-lg border border-gray-800 max-w-2xl mx-auto">
          <div class="px-6 py-4 border-b border-gray-800">
              <h2 class="text-2xl font-bold text-white">Neues Turnier erstellen</h2>
          </div>
          <div class="p-6">
              <form id="tournament-form" class="space-y-6">
                  <div>
                      <label for="tournament-name" class="block text-sm font-medium text-gray-300 mb-1">
                          Turniername
                      </label>
                      <input type="text" id="tournament-name" 
                          class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
                          placeholder="Mein Turnier" required>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                          <label for="team-count" class="block text-sm font-medium text-gray-300 mb-1">
                              Anzahl der Teams
                          </label>
                          <input type="number" id="team-count" min="2" 
                              class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
                              placeholder="8" required>
                      </div>
                      
                      <div>
                          <label for="group-count" class="block text-sm font-medium text-gray-300 mb-1">
                              Anzahl der Gruppen
                          </label>
                          <input type="number" id="group-count" min="1" 
                              class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
                              placeholder="2" required>
                      </div>
                      
                      <div>
                          <label for="playoff-spots" class="block text-sm font-medium text-gray-300 mb-1">
                              Playoff-Plätze pro Gruppe
                          </label>
                          <input type="number" id="playoff-spots" min="1" 
                              class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
                              placeholder="2" required>
                      </div>
                  </div>
                  
                  <div class="pt-2">
                      <button type="submit" id="create-tournament" 
                          class="w-full bg-accent hover:bg-accent-hover text-white py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                          Weiter zu Teamnamen
                      </button>
                  </div>
              </form>
          </div>
      </div>
  `;

  document
    .getElementById("tournament-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      prepareTeamNameInput();
    });
}

function prepareTeamNameInput() {
  // Grunddaten einlesen
  tournamentData.name = document.getElementById("tournament-name").value.trim();
  tournamentData.teamCount = parseInt(
    document.getElementById("team-count").value
  );
  tournamentData.groupCount = parseInt(
    document.getElementById("group-count").value
  );
  tournamentData.playoffSpots = parseInt(
    document.getElementById("playoff-spots").value
  );

  const validationErrors = validateTournamentData();
  if (validationErrors.length > 0) {
    showAlert(validationErrors.join("<br>"), "error");
    return;
  }

  // Formular für Teamnamen anzeigen
  const createContent = document.getElementById("create-content");
  let inputsHtml = "";
  for (let i = 0; i < tournamentData.teamCount; i++) {
    inputsHtml += `
      <div class="team-input">
        <label class="block text-sm font-medium text-gray-300 mb-1">
          Team ${i + 1} Name
        </label>
        <input type="text" value="Team ${i + 1}" 
          class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
          required>
      </div>
    `;
  }

  createContent.innerHTML = `
    <div class="bg-primary rounded-lg shadow-lg border border-gray-800 max-w-2xl mx-auto">
      <div class="px-6 py-4 border-b border-gray-800">
        <h2 class="text-2xl font-bold text-white">Teamnamen eingeben</h2>
        <p class="text-sm text-gray-400">Bitte geben Sie die Namen aller Teams ein.</p>
      </div>
      <div class="p-6">
        <form id="team-names-form" class="space-y-4">
          <div class="mb-4">
            <button type="button" id="shuffle-teams" 
              class="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2.5 px-4 rounded-md mb-4">
              Teams mischen
            </button>
          </div>
          <div id="team-inputs">
            ${inputsHtml}
          </div>
          <div class="pt-2">
            <button type="submit" class="w-full bg-accent hover:bg-accent-hover text-white py-2.5 px-4 rounded-md">
              Turnier erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Button Event: Inhalte der Inputs mischen
  document.getElementById("shuffle-teams").addEventListener("click", () => {
    const inputs = Array.from(document.querySelectorAll("#team-inputs input"));
    // Fisher-Yates Shuffle auf Inhalte
    for (let i = inputs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = inputs[i].value;
      inputs[i].value = inputs[j].value;
      inputs[j].value = temp;
    }
  });

  // Formular Event: Turnier erstellen
  document
    .getElementById("team-names-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      tournamentData.teamNames = [];
      const inputs = Array.from(
        document.querySelectorAll("#team-inputs input")
      );
      inputs.forEach((input) =>
        tournamentData.teamNames.push(input.value.trim() || "Unnamed Team")
      );
      createTournament();
    });
}

function createTournament() {
  // Turniernamen in der Navbar anzeigen
  document.getElementById("tournament-title").textContent = tournamentData.name;
  document.getElementById("tournament-title").classList.remove("hidden");

  // Turnierdaten zurücksetzen
  tournamentData.groups = [];
  tournamentData.matches = [];

  // Gruppen erstellen mit den eingegebenen Namen
  initializeTournamentData();

  // Alle Module aktualisieren
  generateGroups();
  generateSchedule();
  updateDashboard();

  // Zum Gruppen-Tab wechseln
  document.getElementById("groups-tab").click();

  // Erfolgsmeldung
  showAlert("Turnier erfolgreich erstellt!", "success");
}

function validateTournamentData() {
  const errors = [];

  if (!tournamentData.name) {
    errors.push("Bitte geben Sie einen Turniernamen ein");
  }

  if (isNaN(tournamentData.teamCount) || tournamentData.teamCount < 2) {
    errors.push("Bitte geben Sie eine gültige Teamanzahl ein (mindestens 2)");
  }

  if (isNaN(tournamentData.groupCount) || tournamentData.groupCount < 1) {
    errors.push(
      "Bitte geben Sie eine gültige Gruppenanzahl ein (mindestens 1)"
    );
  }

  if (isNaN(tournamentData.playoffSpots) || tournamentData.playoffSpots < 1) {
    errors.push("Bitte geben Sie gültige Playoff-Plätze ein (mindestens 1)");
  }

  if (tournamentData.teamCount < tournamentData.groupCount) {
    errors.push("Es kann nicht mehr Gruppen als Teams geben");
  }

  const teamsPerGroup = Math.floor(
    tournamentData.teamCount / tournamentData.groupCount
  );
  if (tournamentData.playoffSpots > teamsPerGroup) {
    errors.push(`Maximal ${teamsPerGroup} Playoff-Plätze pro Gruppe möglich`);
  }

  return errors;
}

window.createTournament = createTournament;
