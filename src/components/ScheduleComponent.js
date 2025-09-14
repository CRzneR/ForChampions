// /src/components/ScheduleComponent.js

import { showAlert } from "../utils/helpers.js";

export class ScheduleComponent {
  constructor(tournamentService) {
    this.tournamentService = tournamentService;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const scheduleContent = document.getElementById("schedule-content");
    if (!scheduleContent) return;

    scheduleContent.innerHTML = `
      <div class="bg-[#21222D] rounded-lg shadow-lg border border-gray-800">
        <div class="px-6 py-4 border-b border-gray-800">
          <h2 class="text-2xl font-bold text-white">Spielplan</h2>
          <p id="schedule-info" class="text-sm text-gray-400 mt-1">
            Erstellen Sie ein Turnier, um den Spielplan anzuzeigen
          </p>
        </div>
        <div id="schedule-container" class="p-4"></div>
      </div>
    `;

    this.generateSchedule();
  }

  bindEvents() {
    // Tab-Wechsel
    const scheduleTab = document.querySelector('[data-tab="schedule"]');
    if (scheduleTab) {
      scheduleTab.addEventListener("click", () => this.generateSchedule());
    }
  }

  generateSchedule() {
    const scheduleContainer = document.getElementById("schedule-container");
    const infoElement = document.getElementById("schedule-info");

    if (!scheduleContainer || !infoElement) return;

    const tournament = this.tournamentService.currentTournament;

    if (!tournament || !tournament.name) {
      scheduleContainer.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <p class="mb-4">Bitte erstellen Sie zuerst ein Turnier</p>
          <button 
            data-tab="create" 
            class="px-4 py-2 bg-gradient-to-r from-[#CA5818] to-[#EF1475] text-white rounded-md hover:opacity-90 transition"
          >
            Turnier erstellen
          </button>
        </div>
      `;

      setTimeout(() => {
        const createButton = scheduleContainer.querySelector(
          '[data-tab="create"]'
        );
        if (createButton) {
          createButton.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelector('[data-tab="create"]').click();
          });
        }
      }, 100);

      return;
    }

    // Safe init für Matches
    if (!Array.isArray(tournament.matches)) {
      tournament.matches = [];
    }

    infoElement.textContent = `${tournament.name} - Spielplan`;
    scheduleContainer.innerHTML = "";

    if (!tournament.groups || tournament.groups.length === 0) {
      scheduleContainer.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <p>Noch keine Gruppen vorhanden</p>
        </div>
      `;
      return;
    }

    tournament.groups.forEach((group, groupIndex) => {
      this.renderGroupSchedule(
        group,
        groupIndex,
        scheduleContainer,
        tournament
      );
    });
  }

  renderGroupSchedule(group, groupIndex, container, tournament) {
    const groupDiv = document.createElement("div");
    groupDiv.className =
      "mb-8 bg-[#2D303D] rounded-lg overflow-hidden border border-gray-800";

    groupDiv.innerHTML = `
      <div class="px-6 py-3 bg-[#21222D] border-b border-gray-800">
        <h3 class="text-lg font-bold text-white">${group.name}</h3>
      </div>
    `;

    if (!group.teams || group.teams.length === 0) {
      groupDiv.innerHTML += `
        <div class="px-6 py-4 text-gray-400">
          Keine Teams in dieser Gruppe
        </div>
      `;
      container.appendChild(groupDiv);
      return;
    }

    const matchdays = this.generateMatchdays(group.teams);

    matchdays.forEach((matchday, dayIndex) => {
      const matchdayDiv = document.createElement("div");
      matchdayDiv.className = "mb-6";
      matchdayDiv.innerHTML = `
        <div class="px-4 py-2 bg-[#21222D] border-b border-gray-700">
          <h4 class="font-medium text-white">Spieltag ${dayIndex + 1}</h4>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-800">
            <thead class="bg-[#21222D]">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Heim</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Gast</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ergebnis</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Aktion</th>
              </tr>
            </thead>
            <tbody class="bg-[#2D303D] divide-y divide-gray-800" 
              id="group-${groupIndex}-matchday-${dayIndex}">
            </tbody>
          </table>
        </div>
      `;

      const tbody = matchdayDiv.querySelector(
        `#group-${groupIndex}-matchday-${dayIndex}`
      );
      this.renderMatchdayMatches(
        matchday,
        groupIndex,
        dayIndex,
        tbody,
        tournament
      );

      groupDiv.appendChild(matchdayDiv);
    });

    container.appendChild(groupDiv);
  }

  renderMatchdayMatches(matchday, groupIndex, dayIndex, tbody, tournament) {
    const group = tournament.groups[groupIndex];

    matchday.forEach((match, matchIndex) => {
      const team1Index = group.teams.findIndex((t) => t.id === match.home.id);
      const team2Index = group.teams.findIndex((t) => t.id === match.away.id);

      const matchId = `group-${groupIndex}-matchday-${dayIndex}-match-${matchIndex}`;
      const existingMatch = tournament.matches.find((m) => m.id === matchId);
      const isSaved = !!existingMatch;

      const tr = document.createElement("tr");
      tr.className = "hover:bg-[#3B3D4A] transition-colors";

      tr.innerHTML = `
        <td class="px-4 py-3 text-sm font-medium text-white">${
          match.home.name
        }</td>
        <td class="px-4 py-3 text-sm font-medium text-white">${
          match.away.name
        }</td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-2">
            <input type="number" id="${matchId}-home"
              class="w-16 text-center bg-[#2D303D] border border-gray-600 rounded-md px-2 py-1 ${
                isSaved ? "bg-gray-700 text-gray-400" : "text-white"
              }"
              min="0" value="${existingMatch ? existingMatch.homeGoals : ""}" 
              ${isSaved ? "readonly" : ""}>
            <span class="text-gray-300">:</span>
            <input type="number" id="${matchId}-away"
              class="w-16 text-center bg-[#2D303D] border border-gray-600 rounded-md px-2 py-1 ${
                isSaved ? "bg-gray-700 text-gray-400" : "text-white"
              }"
              min="0" value="${existingMatch ? existingMatch.awayGoals : ""}" 
              ${isSaved ? "readonly" : ""}>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-2">
            <button
              id="${matchId}-save"
              class="px-3 py-1 bg-gradient-to-r from-[#CA5818] to-[#EF1475] hover:opacity-90 text-white rounded-md ${
                isSaved ? "opacity-50 cursor-not-allowed" : ""
              }"
              ${isSaved ? "disabled" : ""}>
              Speichern
            </button>
            ${
              isSaved
                ? `
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              `
                : ""
            }
          </div>
        </td>
      `;

      tbody.appendChild(tr);

      // Save-Button EventListener
      const saveBtn = tr.querySelector(`#${matchId}-save`);
      if (saveBtn && !isSaved) {
        saveBtn.addEventListener("click", () => {
          this.saveMatchResult(
            groupIndex,
            team1Index,
            team2Index,
            dayIndex,
            matchIndex
          );
        });
      }
    });
  }

  // ... (saveMatchResult, lockMatchUI, updateSchedule bleiben unverändert)
  // den Rest des Codes kannst du übernehmen
}

// Modul-Initialisierungsfunktion
export function initScheduleModule(tournamentService) {
  window.scheduleComponent = new ScheduleComponent(tournamentService);
  return window.scheduleComponent;
}
