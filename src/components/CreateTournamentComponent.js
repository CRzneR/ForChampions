// /src/components/CreateTournamentComponent.js

import { Tournament } from "../models.js";
import { showAlert } from "../utils/helpers.js";

export class CreateTournamentComponent {
  constructor(tournamentService, onTournamentCreated) {
    this.tournamentService = tournamentService;
    this.onTournamentCreated = onTournamentCreated;
    this.currentStep = 1;
    this.tournamentData = {
      name: "",
      teamCount: 0,
      groupCount: 0,
      playoffSpots: 0,
      teamNames: [],
    };
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const createContent = document.getElementById("create-content");
    if (!createContent) return;

    if (this.currentStep === 1) {
      this.renderBasicInfoForm(createContent);
    } else {
      this.renderTeamNamesForm(createContent);
    }
  }

  renderBasicInfoForm(container) {
    container.innerHTML = `
      <div class="bg-[#21222D] rounded-lg shadow-lg border border-gray-800 max-w-2xl mx-auto">
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
                class="w-full bg-[#2D303D] border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#CA5818] focus:border-transparent" 
                placeholder="Mein Turnier" required>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label for="team-count" class="block text-sm font-medium text-gray-300 mb-1">
                  Anzahl der Teams
                </label>
                <input type="number" id="team-count" min="2" max="32"
                  class="w-full bg-[#2D303D] border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#CA5818] focus:border-transparent" 
                  placeholder="8" required>
              </div>
              
              <div>
                <label for="group-count" class="block text-sm font-medium text-gray-300 mb-1">
                  Anzahl der Gruppen
                </label>
                <input type="number" id="group-count" min="1" max="8"
                  class="w-full bg-[#2D303D] border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#CA5818] focus:border-transparent" 
                  placeholder="2" required>
              </div>
              
              <div>
                <label for="playoff-spots" class="block text-sm font-medium text-gray-300 mb-1">
                  Playoff-Plätze pro Gruppe
                </label>
                <input type="number" id="playoff-spots" min="1" max="4"
                  class="w-full bg-[#2D303D] border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#CA5818] focus:border-transparent" 
                  placeholder="2" required>
              </div>
            </div>
            
            <div class="pt-2">
              <button type="submit" 
                class="w-full bg-gradient-to-r from-[#CA5818] to-[#EF1475] hover:opacity-90 text-white py-2.5 px-4 rounded-md transition-colors">
                Weiter zu Teamnamen
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderTeamNamesForm(container) {
    let inputsHtml = "";
    for (let i = 0; i < this.tournamentData.teamCount; i++) {
      inputsHtml += `
        <div class="team-input mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Team ${i + 1} Name
          </label>
          <input type="text" value="Team ${i + 1}" 
            class="w-full bg-[#2D303D] border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#CA5818] focus:border-transparent" 
            data-team-index="${i}" required>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="bg-[#21222D] rounded-lg shadow-lg border border-gray-800 max-w-2xl mx-auto">
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
            <div id="team-inputs" class="max-h-96 overflow-y-auto pr-2">
              ${inputsHtml}
            </div>
            <div class="flex space-x-4 pt-4">
              <button type="button" id="back-button" 
                class="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2.5 px-4 rounded-md">
                Zurück
              </button>
              <button type="submit" 
                class="flex-1 bg-gradient-to-r from-[#CA5818] to-[#EF1475] hover:opacity-90 text-white py-2.5 px-4 rounded-md">
                Turnier erstellen
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.bindBasicInfoForm();
  }

  bindBasicInfoForm() {
    const form = document.getElementById("tournament-form");
    if (form) {
      form.addEventListener("submit", (e) => this.handleBasicInfoSubmit(e));
    }
  }

  bindTeamNamesForm() {
    const form = document.getElementById("team-names-form");
    const backButton = document.getElementById("back-button");
    const shuffleButton = document.getElementById("shuffle-teams");

    if (form) {
      form.addEventListener("submit", (e) => this.handleTeamNamesSubmit(e));
    }

    if (backButton) {
      backButton.addEventListener("click", () => this.goBack());
    }

    if (shuffleButton) {
      shuffleButton.addEventListener("click", () => this.shuffleTeams());
    }
  }

  handleBasicInfoSubmit(e) {
    e.preventDefault();

    this.tournamentData = {
      name: document.getElementById("tournament-name").value.trim(),
      teamCount: parseInt(document.getElementById("team-count").value),
      groupCount: parseInt(document.getElementById("group-count").value),
      playoffSpots: parseInt(document.getElementById("playoff-spots").value),
      teamNames: [],
    };

    const errors = this.validateBasicInfo();
    if (errors.length > 0) {
      showAlert(errors.join("<br>"), "error");
      return;
    }

    this.currentStep = 2;
    this.render();
    this.bindTeamNamesForm();
  }

  handleTeamNamesSubmit(e) {
    e.preventDefault();

    const inputs = document.querySelectorAll(
      "#team-inputs input[data-team-index]"
    );
    this.tournamentData.teamNames = Array.from(inputs).map(
      (input) =>
        input.value.trim() || `Team ${parseInt(input.dataset.teamIndex) + 1}`
    );

    this.createTournament();
  }

  async createTournament() {
    try {
      const result = await this.tournamentService.createTournament(
        this.tournamentData
      );

      if (result.success) {
        showAlert("Turnier erfolgreich erstellt!", "success");

        document.getElementById("tournament-title").textContent =
          this.tournamentData.name;
        document.getElementById("tournament-title").classList.remove("hidden");

        if (this.onTournamentCreated) {
          this.onTournamentCreated(this.tournamentService.currentTournament);
        }

        document.querySelector('[data-tab="dashboard"]').click();
      }
    } catch (error) {
      showAlert(
        "Fehler beim Erstellen des Turniers: " + error.message,
        "error"
      );
    }
  }

  goBack() {
    this.currentStep = 1;
    this.render();
    this.bindBasicInfoForm();
  }

  shuffleTeams() {
    const inputs = Array.from(
      document.querySelectorAll("#team-inputs input[data-team-index]")
    );
    const values = inputs.map((input) => input.value);

    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    inputs.forEach((input, index) => {
      input.value = values[index];
    });
  }

  validateBasicInfo() {
    const errors = [];
    const data = this.tournamentData;

    if (!data.name) {
      errors.push("Bitte geben Sie einen Turniernamen ein");
    }

    if (isNaN(data.teamCount) || data.teamCount < 2 || data.teamCount > 32) {
      errors.push("Bitte geben Sie eine gültige Teamanzahl ein (2-32)");
    }

    if (isNaN(data.groupCount) || data.groupCount < 1 || data.groupCount > 8) {
      errors.push("Bitte geben Sie eine gültige Gruppenanzahl ein (1-8)");
    }

    if (
      isNaN(data.playoffSpots) ||
      data.playoffSpots < 1 ||
      data.playoffSpots > 4
    ) {
      errors.push("Bitte geben Sie gültige Playoff-Plätze ein (1-4)");
    }

    if (data.teamCount < data.groupCount) {
      errors.push("Es kann nicht mehr Gruppen als Teams geben");
    }

    const minTeamsPerGroup = Math.floor(data.teamCount / data.groupCount);
    if (data.playoffSpots > minTeamsPerGroup) {
      errors.push(
        `Maximal ${minTeamsPerGroup} Playoff-Plätze pro Gruppe möglich`
      );
    }

    if (data.playoffSpots * data.groupCount > data.teamCount) {
      errors.push(
        "Die Gesamtanzahl der Playoff-Plätze darf nicht größer sein als die Teamanzahl"
      );
    }

    return errors;
  }
}

// Initialisierung für main.js
export function initCreateModule(tournamentService) {
  const onTournamentCreated = (tournament) => {
    console.log("Turnier erstellt:", tournament);
  };

  const createComponent = new CreateTournamentComponent(
    tournamentService,
    onTournamentCreated
  );
  createComponent.init();

  const createTab = document.querySelector('[data-tab="create"]');
  if (createTab) {
    createTab.addEventListener("click", () => {
      createComponent.currentStep = 1;
      createComponent.render();
      createComponent.bindEvents();
    });
  }
}
