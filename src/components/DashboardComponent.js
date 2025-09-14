// /src/components/DashboardComponent.js

import { showAlert } from "../utils/helpers.js";

export class DashboardComponent {
  constructor(tournamentService) {
    this.tournamentService = tournamentService;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateDashboard();
  }

  bindEvents() {
    // Event-Listener für Tab-Wechsel
    const dashboardTab = document.querySelector('[data-tab="dashboard"]');
    if (dashboardTab) {
      dashboardTab.addEventListener("click", () => this.updateDashboard());
    }
  }

  updateDashboard() {
    this.updateTournamentInfo();
    this.generateDashboardGroups();
    this.generateCurrentMatches();
    this.generateTopTeams();
  }

  updateTournamentInfo() {
    const infoContent = document.getElementById("tournament-info-content");
    if (!infoContent) return;

    const tournament = this.tournamentService.currentTournament;

    if (!tournament || !tournament.name) {
      infoContent.innerHTML = `
                <p class="text-gray-400">Kein aktives Turnier</p>
                <button 
                    data-tab="create" 
                    class="mt-4 px-4 py-2 bg-gradient-to-r from-[#CA5818] to-[#EF1475] text-white rounded-md hover:opacity-90 transition"
                >
                    Turnier erstellen
                </button>
            `;

      // Event-Listener für den Button hinzufügen
      setTimeout(() => {
        const createButton = infoContent.querySelector('[data-tab="create"]');
        if (createButton) {
          createButton.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelector('[data-tab="create"]').click();
          });
        }
      }, 100);

      return;
    }

    infoContent.innerHTML = `
            <div class="space-y-2">
                <p><span class="font-medium text-white">Name:</span> ${
                  tournament.name
                }</p>
                <p><span class="font-medium text-white">Teams:</span> ${
                  tournament.teamCount
                }</p>
                <p><span class="font-medium text-white">Gruppen:</span> ${
                  tournament.groupCount
                }</p>
                <p><span class="font-medium text-white">Playoff-Plätze:</span> ${
                  tournament.playoffSpots
                }</p>
                <p><span class="font-medium text-white">Status:</span> ${this.getTournamentStatus(
                  tournament
                )}</p>
            </div>
        `;
  }

  getTournamentStatus(tournament) {
    if (!tournament.groups || tournament.groups.length === 0) {
      return "In Vorbereitung";
    }

    const totalMatches = this.calculateTotalMatches(tournament);
    const playedMatches = tournament.matches ? tournament.matches.length : 0;

    if (playedMatches === 0) return "Noch nicht gestartet";
    if (playedMatches < totalMatches) return "Laufend";
    return "Abgeschlossen";
  }

  calculateTotalMatches(tournament) {
    if (!tournament.groups) return 0;

    let totalMatches = 0;
    tournament.groups.forEach((group) => {
      if (group.teams && group.teams.length > 0) {
        // Jede Gruppe spielt Jeder gegen Jeden
        const teams = group.teams.length;
        totalMatches += (teams * (teams - 1)) / 2;
      }
    });

    return totalMatches;
  }

  generateCurrentMatches() {
    const container = document.getElementById("current-matches-content");
    if (!container) return;

    const tournament = this.tournamentService.currentTournament;

    if (!tournament || !tournament.groups) {
      container.innerHTML = `
                <p class="text-gray-400 text-center py-4">
                    Keine anstehenden Spiele
                </p>
            `;
      return;
    }

    // Finde alle ungespielten Spiele
    const upcomingMatches = this.getUpcomingMatches(tournament);

    // Begrenze auf die nächsten 5 Spiele
    const nextMatches = upcomingMatches.slice(0, 5);

    if (nextMatches.length === 0) {
      container.innerHTML = `
                <p class="text-gray-400 text-center py-4">
                    Keine anstehenden Spiele
                </p>
            `;
      return;
    }

    container.innerHTML = `
            <div class="space-y-3">
                ${nextMatches
                  .map(
                    (match) => `
                    <div class="bg-[#2D303D] rounded-lg p-3 border border-gray-700 hover:border-[#CA5818] transition-colors">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-xs text-gray-400">${match.groupName} - Spieltag ${match.matchday}</span>
                            <button 
                                onclick="window.dashboardComponent.navigateToMatch('${match.groupIndex}', ${match.dayIndex}, ${match.matchIndex})"
                                class="text-xs text-[#CA5818] hover:underline"
                            >
                                Zum Spiel
                            </button>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-medium text-white text-sm">${match.match.home.name}</span>
                            <span class="mx-2 text-gray-300">vs</span>
                            <span class="font-medium text-white text-sm">${match.match.away.name}</span>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            ${
              upcomingMatches.length > 5
                ? `
                <div class="mt-3 text-center">
                    <button 
                        data-tab="schedule" 
                        class="text-sm text-[#CA5818] hover:underline"
                    >
                        + ${upcomingMatches.length - 5} weitere anzeigen
                    </button>
                </div>
            `
                : ""
            }
        `;

    // Event-Listener für den "weitere anzeigen" Button
    setTimeout(() => {
      const showMoreButton = container.querySelector('[data-tab="schedule"]');
      if (showMoreButton) {
        showMoreButton.addEventListener("click", (e) => {
          e.preventDefault();
          document.querySelector('[data-tab="schedule"]').click();
        });
      }
    }, 100);
  }

  getUpcomingMatches(tournament) {
    const upcomingMatches = [];

    tournament.groups.forEach((group, groupIndex) => {
      const matchdays = this.generateMatchdays(group.teams);

      matchdays.forEach((matchday, dayIndex) => {
        matchday.forEach((match, matchIndex) => {
          const matchId = `group-${groupIndex}-matchday-${dayIndex}-match-${matchIndex}`;
          const isPlayed =
            tournament.matches &&
            tournament.matches.some((m) => m.id === matchId);

          if (!isPlayed) {
            upcomingMatches.push({
              groupIndex,
              dayIndex,
              matchIndex,
              match,
              matchday: dayIndex + 1,
              groupName: group.name,
            });
          }
        });
      });
    });

    // Sortiere nach Spieltag
    return upcomingMatches.sort((a, b) => a.dayIndex - b.dayIndex);
  }

  generateMatchdays(teams) {
    if (!teams || teams.length < 2) return [];

    const matchdays = [];
    const teamCount = teams.length;

    // Round Robin Algorithmus für Jeder gegen Jeden
    for (let round = 0; round < teamCount - 1; round++) {
      const matchday = [];
      for (let i = 0; i < teamCount / 2; i++) {
        const home = i;
        const away = teamCount - 1 - i;

        if (home !== away) {
          matchday.push({
            home: teams[home],
            away: teams[away],
            played: false,
            homeGoals: 0,
            awayGoals: 0,
          });
        }
      }
      matchdays.push(matchday);

      // Teams rotieren für nächsten Spieltag
      teams.splice(1, 0, teams.pop());
    }

    return matchdays;
  }

  generateTopTeams() {
    const container = document.getElementById("top-teams-content");
    if (!container) return;

    const tournament = this.tournamentService.currentTournament;

    if (!tournament || !tournament.groups || tournament.playoffSpots <= 0) {
      container.innerHTML = `
                <p class="text-gray-400 text-center py-4">
                    ${
                      tournament && tournament.playoffSpots <= 0
                        ? "Keine Playoff-Plätze definiert"
                        : "Kein aktives Turnier"
                    }
                </p>
            `;
      return;
    }

    // Sammle alle Teams von allen Gruppen
    const allTeams = this.getPlayoffTeams(tournament);

    if (allTeams.length === 0) {
      container.innerHTML = `
                <p class="text-gray-400 text-center py-4">
                    Keine Teams auf Playoff-Plätzen
                </p>
            `;
      return;
    }

    container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-800">
                    <thead class="bg-[#2D303D]">
                        <tr>
                            <th class="px-3 py-2 text-left text-xs text-gray-300">Team</th>
                            <th class="px-3 py-2 text-left text-xs text-gray-300">S</th>
                            <th class="px-3 py-2 text-left text-xs text-gray-300">N</th>
                            <th class="px-3 py-2 text-left text-xs text-gray-300">U</th>
                            <th class="px-3 py-2 text-left text-xs text-gray-300">Tore</th>
                            <th class="px-3 py-2 text-left text-xs text-gray-300">Pkt.</th>
                            <th class="px-3 py-2 text-left text-xs text-gray-300">Form</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800">
                        ${allTeams
                          .map(
                            (team) => `
                            <tr class="hover:bg-[#2D303D] transition-colors">
                                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">
                                    ${team.name}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-green-400">
                                    ${team.wins || 0}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-red-400">
                                    ${team.losses || 0}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-yellow-400">
                                    ${team.draws || 0}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                                    ${team.goalsFor || 0}:${
                              team.goalsAgainst || 0
                            }
                                    <span class="text-xs ml-1 ${
                                      team.goalsFor - team.goalsAgainst > 0
                                        ? "text-green-400"
                                        : team.goalsFor - team.goalsAgainst < 0
                                        ? "text-red-400"
                                        : "text-gray-400"
                                    }">
                                        (${
                                          team.goalsFor - team.goalsAgainst > 0
                                            ? "+"
                                            : ""
                                        }${team.goalsFor - team.goalsAgainst})
                                    </span>
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap text-sm font-bold text-center text-white">
                                    ${team.points || 0}
                                </td>
                                <td class="px-3 py-2 whitespace-nowrap">
                                    <div class="flex space-x-1">
                                        ${(team.form || [])
                                          .map((result) => {
                                            const colors = {
                                              W: "bg-green-600 text-white",
                                              L: "bg-red-600 text-white",
                                              D: "bg-yellow-500 text-gray-900",
                                            };
                                            return `<span class="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                                              colors[result] || "bg-gray-600"
                                            }">${result}</span>`;
                                          })
                                          .join("")}
                                    </div>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
            
            ${
              allTeams.length > 5
                ? `
                <div class="mt-3 text-center">
                    <button 
                        data-tab="groups" 
                        class="text-sm text-[#CA5818] hover:underline"
                    >
                        Alle ${allTeams.length} Playoff-Teams anzeigen
                    </button>
                </div>
            `
                : ""
            }
        `;

    // Event-Listener für den Button
    setTimeout(() => {
      const showAllButton = container.querySelector('[data-tab="groups"]');
      if (showAllButton) {
        showAllButton.addEventListener("click", (e) => {
          e.preventDefault();
          document.querySelector('[data-tab="groups"]').click();
        });
      }
    }, 100);
  }

  getPlayoffTeams(tournament) {
    let allTeams = [];

    tournament.groups.forEach((group) => {
      if (group.teams && group.teams.length > 0) {
        // Teams sortieren
        const sortedTeams = [...group.teams].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
        });

        // Nur Teams auf Playoff-Plätzen nehmen
        const playoffTeams = sortedTeams.slice(0, tournament.playoffSpots);
        allTeams = [...allTeams, ...playoffTeams];
      }
    });

    // Sortiere alle Playoff-Teams nach Punkten
    return allTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
    });
  }

  generateDashboardGroups() {
    const container = document.getElementById("dashboard-groups-container");
    const infoElement = document.getElementById("dashboard-groups-info");

    if (!container || !infoElement) return;

    const tournament = this.tournamentService.currentTournament;

    if (!tournament || !tournament.groups) {
      container.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-400">
                    Kein aktives Turnier oder keine Gruppen vorhanden
                </div>
            `;
      infoElement.textContent = "Kein aktives Turnier";
      return;
    }

    infoElement.textContent = `${tournament.name} - Aktuelle Gruppenstände`;
    container.innerHTML = "";

    tournament.groups.forEach((group) => {
      if (!group.teams) return;

      // Teams sortieren
      const sortedTeams = [...group.teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
      });

      const groupElement = document.createElement("div");
      groupElement.className =
        "bg-[#2D303D] rounded-lg border border-gray-800 overflow-hidden";
      groupElement.innerHTML = `
                <div class="px-4 py-2 bg-[#21222D] border-b border-gray-800">
                    <h3 class="font-bold text-white">${group.name}</h3>
                </div>
                <div class="divide-y divide-gray-800">
                    ${sortedTeams
                      .map((team, index) => {
                        const isPlayoffSpot = index < tournament.playoffSpots;
                        return `
                            <div class="px-3 py-2 flex items-center justify-between ${
                              isPlayoffSpot ? "bg-green-900 bg-opacity-20" : ""
                            }">
                                <span class="text-sm font-medium ${
                                  isPlayoffSpot
                                    ? "text-green-400"
                                    : "text-white"
                                }">${team.name}</span>
                                <div class="flex items-center space-x-2">
                                    <div class="flex space-x-1">
                                        ${(team.form || [])
                                          .slice(0, 3)
                                          .map((result) => {
                                            const colors = {
                                              W: "bg-green-600",
                                              L: "bg-red-600",
                                              D: "bg-yellow-500",
                                            };
                                            return `<span class="w-4 h-4 rounded-full ${
                                              colors[result] || "bg-gray-600"
                                            }"></span>`;
                                          })
                                          .join("")}
                                    </div>
                                    <span class="text-xs font-bold ${
                                      isPlayoffSpot
                                        ? "text-green-400"
                                        : "text-gray-300"
                                    }">${team.points || 0}</span>
                                </div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            `;
      container.appendChild(groupElement);
    });
  }

  navigateToMatch(groupIndex, dayIndex, matchIndex) {
    // Wechsel zum Spielplan-Tab
    document.querySelector('[data-tab="schedule"]').click();

    // Scroll zum entsprechenden Spiel (wird nach dem Rendern ausgeführt)
    setTimeout(() => {
      const matchId = `group-${groupIndex}-matchday-${dayIndex}-match-${matchIndex}`;
      const matchElement = document.getElementById(`${matchId}-home`);
      if (matchElement) {
        matchElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // Visuelle Hervorhebung
        const row = matchElement.closest("tr");
        if (row) {
          row.classList.add("bg-[#CA5818]", "bg-opacity-20");
          setTimeout(() => {
            row.classList.remove("bg-[#CA5818]", "bg-opacity-20");
          }, 2000);
        }
      }
    }, 500);
  }
}

// Modul-Initialisierungsfunktion
export function initDashboardModule(tournamentService) {
  window.dashboardComponent = new DashboardComponent(tournamentService);
  return window.dashboardComponent;
}
