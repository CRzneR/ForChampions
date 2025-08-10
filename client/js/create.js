// create.js - Turniererstellung

function initCreateModule() {
  const createContent = document.getElementById("create-content");
  createContent.innerHTML = `
      <div class="bg-primary rounded-lg shadow-lg border border-gray-800 max-w-2xl mx-auto">
          <div class="px-6 py-4 border-b border-gray-800">
              <h2 class="text-2xl font-bold text-white">Neues Turnier erstellen</h2>
          </div>
          <div class="p-6">
              <form class="space-y-6">
                  <div>
                      <label for="tournament-name" class="block text-sm font-medium text-gray-300 mb-1">
                          Turniername
                      </label>
                      <input type="text" id="tournament-name" 
                          class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
                          placeholder="Mein Turnier">
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                          <label for="team-count" class="block text-sm font-medium text-gray-300 mb-1">
                              Anzahl der Teams
                          </label>
                          <input type="number" id="team-count" min="2" 
                              class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
                              placeholder="8">
                      </div>
                      
                      <div>
                          <label for="group-count" class="block text-sm font-medium text-gray-300 mb-1">
                              Anzahl der Gruppen
                          </label>
                          <input type="number" id="group-count" min="1" 
                              class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
                              placeholder="2">
                      </div>
                      
                      <div>
                          <label for="playoff-spots" class="block text-sm font-medium text-gray-300 mb-1">
                              Playoff-Plätze pro Gruppe
                          </label>
                          <input type="number" id="playoff-spots" min="1" 
                              class="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-accent focus:border-transparent" 
                              placeholder="2">
                      </div>
                  </div>
                  
                  <div class="pt-2">
                      <button type="button" id="create-tournament" 
                          class="w-full bg-accent hover:bg-accent-hover text-white py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                          Turnier erstellen
                      </button>
                  </div>
              </form>
          </div>
      </div>
  `;

  const createTournamentBtn = document.getElementById("create-tournament");
  createTournamentBtn.addEventListener("click", function () {
    tournamentData.name = document
      .getElementById("tournament-name")
      .value.trim();
    tournamentData.teamCount = parseInt(
      document.getElementById("team-count").value
    );
    tournamentData.groupCount = parseInt(
      document.getElementById("group-count").value
    );
    tournamentData.playoffSpots = parseInt(
      document.getElementById("playoff-spots").value
    );

    // Validierung
    if (!tournamentData.name) {
      showAlert("Bitte geben Sie einen Turniernamen ein", "error");
      return;
    }

    if (isNaN(tournamentData.teamCount)) {
      showAlert("Bitte geben Sie eine gültige Teamanzahl ein", "error");
      return;
    }

    if (isNaN(tournamentData.groupCount)) {
      showAlert("Bitte geben Sie eine gültige Gruppenanzahl ein", "error");
      return;
    }

    if (isNaN(tournamentData.playoffSpots)) {
      showAlert("Bitte geben Sie gültige Playoff-Plätze ein", "error");
      return;
    }

    if (tournamentData.teamCount < tournamentData.groupCount) {
      showAlert("Es kann nicht mehr Gruppen als Teams geben", "error");
      return;
    }

    if (
      tournamentData.playoffSpots * tournamentData.groupCount >
      tournamentData.teamCount
    ) {
      showAlert("Zu viele Playoff-Plätze für die Teamanzahl", "error");
      return;
    }

    // Turniernamen in der Navbar anzeigen
    document.getElementById("tournament-title").textContent =
      tournamentData.name;
    document.getElementById("tournament-title").classList.remove("hidden");

    // Turnier initialisieren
    initializeTournamentData();
    generateGroups();
    generateSchedule();

    // Zum Gruppen-Tab wechseln
    document.getElementById("groups-tab").click();

    // Erfolgsmeldung
    showAlert("Turnier erfolgreich erstellt!");
  });
}
