// Initialisiert das Dashboard
function initDashboard() {
  const dashboardContent = document.getElementById("dashboard-content");

  // Zeige Turnierinfo an, falls vorhanden
  updateTournamentInfo();

  // Zeige Gruppenübersicht an
  generateDashboardGroups();

  // Zeige aktuelle Spiele an
  generateCurrentMatches();

  // Zeige Top Teams an
  generateTopTeams();
}

// Aktualisiert die Turnierinfo
function updateTournamentInfo() {
  const infoContent = document.getElementById("tournament-info-content");

  if (!tournamentData.name) {
    infoContent.innerHTML = `
        <p class="text-gray-400">Kein aktives Turnier</p>
        <button 
          data-tab="create" 
          class="mt-4 px-4 py-2 bg-gradient-to-r from-[#CA5818] to-[#EF1475] text-white rounded-md hover:opacity-90 transition"
        >
          Turnier erstellen
        </button>
      `;
    return;
  }

  infoContent.innerHTML = `
      <div class="space-y-2">
        <p><span class="font-medium text-white">Name:</span> ${
          tournamentData.name
        }</p>
        <p><span class="font-medium text-white">Teams:</span> ${
          tournamentData.teams ? tournamentData.teams.length : 0
        }</p>
        <p><span class="font-medium text-white">Gruppen:</span> ${
          tournamentData.groupCount || 0
        }</p>
        <p><span class="font-medium text-white">Playoff-Plätze:</span> ${
          tournamentData.playoffSpots || 0
        }</p>
        <p><span class="font-medium text-white">Status:</span> ${
          tournamentData.status || "In Vorbereitung"
        }</p>
      </div>
    `;
}

// Zeigt die nächsten anstehenden Spiele an
function generateCurrentMatches() {
  const container = document.getElementById("current-matches-content");

  if (!tournamentData.name || !tournamentData.groups) {
    container.innerHTML = `
        <p class="text-gray-400 text-center py-4">
          Keine anstehenden Spiele
        </p>
      `;
    return;
  }

  // Finde alle ungespielten Spiele
  const upcomingMatches = [];
  tournamentData.groups.forEach((group, groupIndex) => {
    const matchdays = generateMatchdays(group.teams);

    matchdays.forEach((matchday, dayIndex) => {
      matchday.forEach((match, matchIndex) => {
        const matchId = `group-${groupIndex}-matchday-${dayIndex}-match-${matchIndex}`;
        const isPlayed = tournamentData.matches.some((m) => m.id === matchId);

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
  upcomingMatches.sort((a, b) => a.dayIndex - b.dayIndex);

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
          <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-accent transition-colors">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-gray-400">${match.groupName} - Spieltag ${match.matchday}</span>
              <button 
                onclick="navigateToMatch('${match.groupIndex}', ${match.dayIndex}, ${match.matchIndex})"
                class="text-xs text-accent hover:underline"
              >
                Zum Spiel
              </button>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium text-white">${match.match.home.name}</span>
              <span class="mx-2 text-gray-300">vs</span>
              <span class="font-medium text-white">${match.match.away.name}</span>
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
            class="text-sm text-accent hover:underline"
          >
            + ${upcomingMatches.length - 5} weitere anzeigen
          </button>
        </div>
      `
          : ""
      }
    `;
}

// Zeigt die Top Teams (Playoff-Plätze) an
function generateTopTeams() {
  const container = document.getElementById("top-teams-content");

  if (
    !tournamentData.name ||
    !tournamentData.groups ||
    tournamentData.playoffSpots <= 0
  ) {
    container.innerHTML = `
        <p class="text-gray-400 text-center py-4">
          ${
            tournamentData.playoffSpots <= 0
              ? "Keine Playoff-Plätze definiert"
              : "Kein aktives Turnier"
          }
        </p>
      `;
    return;
  }

  // Sammle alle Teams von allen Gruppen
  let allTeams = [];
  tournamentData.groups.forEach((group) => {
    // Teams sortieren
    const sortedTeams = [...group.teams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
    });

    // Nur Teams auf Playoff-Plätzen nehmen
    const playoffTeams = sortedTeams.slice(0, tournamentData.playoffSpots);
    allTeams = [...allTeams, ...playoffTeams];
  });

  // Sortiere alle Playoff-Teams nach Punkten
  allTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
  });

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
          <thead class="bg-primary">
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
              <tr class="hover:bg-primary transition-colors">
                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">
                  ${team.name}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-green-400">
                  ${team.wins}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-red-400">
                  ${team.losses}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-center text-yellow-400">
                  ${team.draws}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                  ${team.goalsFor}:${team.goalsAgainst}
                  <span class="text-xs ml-1 ${
                    team.goalsFor - team.goalsAgainst > 0
                      ? "text-green-400"
                      : team.goalsFor - team.goalsAgainst < 0
                      ? "text-red-400"
                      : "text-gray-400"
                  }">
                    (${team.goalsFor - team.goalsAgainst > 0 ? "+" : ""}${
                  team.goalsFor - team.goalsAgainst
                })
                  </span>
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm font-bold text-center text-white">
                  ${team.points}
                </td>
                <td class="px-3 py-2 whitespace-nowrap">
                  <div class="flex space-x-1">
                    ${team.form
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
            class="text-sm text-accent hover:underline"
          >
            Alle ${allTeams.length} Playoff-Teams anzeigen
          </button>
        </div>
      `
          : ""
      }
    `;
}

// Generiert die kompakte Gruppenansicht für das Dashboard
function generateDashboardGroups() {
  const container = document.getElementById("dashboard-groups-container");
  const infoElement = document.getElementById("dashboard-groups-info");

  if (!tournamentData.name || !tournamentData.groups) {
    container.innerHTML = `
        <div class="col-span-full text-center py-8 text-gray-400">
          Kein aktives Turnier oder keine Gruppen vorhanden
        </div>
      `;
    infoElement.textContent = "Kein aktives Turnier";
    return;
  }

  infoElement.textContent = `${tournamentData.name} - Aktuelle Gruppenstände`;
  container.innerHTML = "";

  tournamentData.groups.forEach((group) => {
    // Teams sortieren
    group.teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
    });

    const groupElement = document.createElement("div");
    groupElement.className =
      "bg-primary-light rounded-lg border border-gray-800 overflow-hidden";
    groupElement.innerHTML = `
        <div class="px-4 py-2 bg-primary border-b border-gray-800">
          <h3 class="font-bold text-white">${group.name}</h3>
        </div>
        <div class="divide-y divide-gray-800">
          ${group.teams
            .map((team, index) => {
              const isPlayoffSpot = index < tournamentData.playoffSpots;
              return `
            <div class="px-3 py-2 flex items-center justify-between ${
              isPlayoffSpot ? "bg-green-900 bg-opacity-20" : ""
            }">
              <span class="text-sm font-medium ${
                isPlayoffSpot ? "text-green-400" : "text-white"
              }">${team.name}</span>
              <div class="flex items-center space-x-2">
                <div class="flex space-x-1">
                  ${team.form
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
                  isPlayoffSpot ? "text-green-400" : "text-gray-300"
                }">${team.points}</span>
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

// Navigiert zum entsprechenden Spiel im Spielplan
window.navigateToMatch = function (groupIndex, dayIndex, matchIndex) {
  // Wechsel zum Spielplan-Tab
  document.querySelector('[data-tab="schedule"]').click();

  // Scroll zum entsprechenden Spiel (wird nach dem Rendern ausgeführt)
  setTimeout(() => {
    const matchId = `group-${groupIndex}-matchday-${dayIndex}-match-${matchIndex}`;
    const matchElement = document.getElementById(`${matchId}-home`);
    if (matchElement) {
      matchElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Visuelle Hervorhebung
      matchElement.closest("tr").classList.add("bg-accent", "bg-opacity-20");
      setTimeout(() => {
        matchElement
          .closest("tr")
          .classList.remove("bg-accent", "bg-opacity-20");
      }, 2000);
    }
  }, 500);
};

// Wird aufgerufen, wenn sich Turnierdaten ändern
function updateDashboard() {
  updateTournamentInfo();
  generateDashboardGroups();
  generateCurrentMatches();
  generateTopTeams();
}

// Event Listener für Tab-Wechsel
document.addEventListener("DOMContentLoaded", () => {
  const dashboardTab = document.querySelector('[data-tab="dashboard"]');
  dashboardTab.addEventListener("click", initDashboard);
});
