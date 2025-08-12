// create.js - Turniererstellung mit erweiterten Validierungen

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
                          Turnier erstellen
                      </button>
                  </div>
              </form>
          </div>
      </div>
  `;

  const tournamentForm = document.getElementById("tournament-form");
  tournamentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    createTournament();
  });
}

function createTournament() {
  // Werte auslesen
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

  // Erweiterte Validierung
  const validationErrors = validateTournamentData();
  if (validationErrors.length > 0) {
    showAlert(validationErrors.join("<br>"), "error");
    return;
  }

  // Turnier initialisieren
  initializeTournament();
}

function validateTournamentData() {
  const errors = [];

  // Pflichtfelder prüfen
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

  // Logische Validierungen
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

function initializeTournament() {
  // Turniernamen in der Navbar anzeigen
  document.getElementById("tournament-title").textContent = tournamentData.name;
  document.getElementById("tournament-title").classList.remove("hidden");

  // Turnierdaten zurücksetzen
  tournamentData.groups = [];
  tournamentData.matches = [];

  // Gruppen erstellen
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

// Globale Funktion verfügbar machen
window.createTournament = createTournament;
