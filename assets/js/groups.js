// groups.js - Gruppenansicht des Turnier Managers

function initGroupsModule() {
  const groupsContent = document.getElementById("groups-content");
  groupsContent.innerHTML = `
      <div class="bg-primary rounded-lg shadow-lg border border-gray-800">
          <div class="px-6 py-4 border-b border-gray-800">
              <h2 class="text-2xl font-bold text-white">Gruppen</h2>
              <p id="groups-info" class="text-sm text-gray-400 mt-1">
                  ${tournamentData.name ? tournamentData.name + " - " : ""}
                  Erstellen Sie ein Turnier, um die Gruppen anzuzeigen
              </p>
          </div>
          <div id="groups-container" class="p-4"></div>
      </div>
  `;
}

function generateGroups() {
  const groupsContainer = document.getElementById("groups-container");
  const infoElement = document.getElementById("groups-info");

  if (!tournamentData.name) {
    groupsContainer.innerHTML = `
          <p class="text-gray-400 text-center py-8">
              Bitte erstellen Sie zuerst ein Turnier
          </p>
      `;
    return;
  }

  infoElement.textContent = `${tournamentData.name} - ${tournamentData.groupCount} Gruppen`;
  groupsContainer.innerHTML = "";

  tournamentData.groups.forEach((group, groupIndex) => {
    // Teams sortieren nach Punkten, dann Tordifferenz
    group.teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst);
    });

    const groupDiv = document.createElement("div");
    groupDiv.className =
      "mb-8 bg-primary-light rounded-lg overflow-hidden border border-gray-800";
    groupDiv.innerHTML = `
          <div class="px-6 py-3 bg-primary border-b border-gray-800">
              <h3 class="text-lg font-bold text-white flex items-center justify-between">
                  <span>${group.name}</span>
                  ${
                    tournamentData.playoffSpots > 0
                      ? `<span class="text-sm font-normal text-gray-400">
                      Top ${tournamentData.playoffSpots} qualifizieren sich
                    </span>`
                      : ""
                  }
              </h3>
          </div>
          <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-800">
                  <thead class="bg-primary">
                      <tr>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Spiele
                          </th>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Team
                          </th>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              S
                          </th>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              N
                          </th>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              U
                          </th>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Tore
                          </th>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              +/-
                          </th>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Pkt.
                          </th>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Form
                          </th>
                      </tr>
                  </thead>
                  <tbody class="bg-primary-light divide-y divide-gray-800">
                      ${group.teams
                        .map((team, index) => {
                          const isPlayoffSpot =
                            index < tournamentData.playoffSpots;
                          const gamesPlayed =
                            team.wins + team.losses + team.draws;
                          const goalDifference =
                            team.goalsFor - team.goalsAgainst;

                          return `
                          <tr class="${
                            isPlayoffSpot ? "bg-green-900 bg-opacity-30" : ""
                          } hover:bg-primary transition-colors">
                              <!-- Spiele -->
                              <td class="px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${
                                isPlayoffSpot
                                  ? "text-green-400"
                                  : "text-gray-300"
                              }">
                                  ${gamesPlayed}
                              </td>
                              
                              <!-- Team Name -->
                              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                  ${team.name}
                              </td>
                              
                              <!-- Siege -->
                              <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-300">
                                  ${team.wins}
                              </td>
                              
                              <!-- Niederlagen -->
                              <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-300">
                                  ${team.losses}
                              </td>
                              
                              <!-- Unentschieden -->
                              <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-300">
                                  ${team.draws}
                              </td>
                              
                              <!-- Tore -->
                              <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-300">
                                  ${team.goalsFor}:${team.goalsAgainst}
                              </td>
                              
                              <!-- Tordifferenz -->
                              <td class="px-4 py-3 whitespace-nowrap text-sm text-center font-medium ${
                                goalDifference > 0
                                  ? "text-green-400"
                                  : goalDifference < 0
                                  ? "text-red-400"
                                  : "text-gray-300"
                              }">
                                  ${
                                    goalDifference > 0 ? "+" : ""
                                  }${goalDifference}
                              </td>
                              
                              <!-- Punkte -->
                              <td class="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-white">
                                  ${team.points}
                              </td>
                              
                              <!-- Form -->
                              <td class="px-4 py-3 whitespace-nowrap">
                                  <div class="flex justify-center space-x-1">
                                      ${team.form
                                        .map((result) => {
                                          const colorClasses = {
                                            W: "bg-green-600 text-white",
                                            L: "bg-red-600 text-white",
                                            D: "bg-yellow-500 text-gray-900",
                                          };
                                          return `<span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                            colorClasses[result] ||
                                            "bg-gray-700"
                                          }">${result}</span>`;
                                        })
                                        .join("")}
                                      ${
                                        team.form.length === 0
                                          ? '<span class="text-gray-500 text-xs">-</span>'
                                          : ""
                                      }
                                  </div>
                              </td>
                          </tr>
                          `;
                        })
                        .join("")}
                  </tbody>
              </table>
          </div>
      `;
    groupsContainer.appendChild(groupDiv);
  });
}
