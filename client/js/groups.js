// groups.js

// --- Daten-Logik ---
export function initializeTournamentData(tournamentData) {
  tournamentData.groups = [];
  tournamentData.matches = [];

  const teamsPerGroup = Math.floor(
    tournamentData.teamCount / tournamentData.groupCount
  );
  const remainingTeams = tournamentData.teamCount % tournamentData.groupCount;

  let nameIndex = 0;

  for (let i = 0; i < tournamentData.groupCount; i++) {
    const groupTeams = i < remainingTeams ? teamsPerGroup + 1 : teamsPerGroup;
    const group = {
      name: `Gruppe ${String.fromCharCode(65 + i)}`,
      teams: [],
    };

    for (let j = 0; j < groupTeams; j++) {
      group.teams.push({
        id: `team-${i}-${j}`,
        name: tournamentData.teamNames?.[nameIndex] || `Team ${nameIndex + 1}`,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: [],
      });
      nameIndex++;
    }

    tournamentData.groups.push(group);
  }
}

// --- UI-Initialisierung ---
export function initGroupsModule(tournamentData) {
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

// --- UI-Rendering ---
export function generateGroups(tournamentData) {
  const groupsContainer = document.getElementById("groups-container");
  const infoElement = document.getElementById("groups-info");

  if (!tournamentData.name) {
    groupsContainer.innerHTML = `<p class="text-gray-400 text-center py-8">Bitte erstellen Sie zuerst ein Turnier</p>`;
    return;
  }

  infoElement.textContent = `${tournamentData.name} - ${tournamentData.groupCount} Gruppen`;
  groupsContainer.innerHTML = "";

  tournamentData.groups.forEach((group, groupIndex) => {
    // Sortierung nach Punkten, dann Tordifferenz
    group.teams.sort(
      (a, b) =>
        b.points - a.points ||
        b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst)
    );

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
        ${renderGroupTable(group, tournamentData.playoffSpots)}
      </div>
    `;

    groupsContainer.appendChild(groupDiv);
  });
}

// --- Hilfsfunktion ---
function renderGroupTable(group, playoffSpots) {
  return `
    <table class="min-w-full divide-y divide-gray-800">
      <thead class="bg-primary">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Spiele</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Team</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">S</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">N</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">U</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tore</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">+/-</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Pkt.</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Form</th>
        </tr>
      </thead>
      <tbody class="bg-primary-light divide-y divide-gray-800">
        ${group.teams
          .map((team, idx) => renderTeamRow(team, idx, playoffSpots))
          .join("")}
      </tbody>
    </table>
  `;
}

function renderTeamRow(team, index, playoffSpots) {
  const isPlayoffSpot = index < playoffSpots;
  const gamesPlayed = (team.wins || 0) + (team.losses || 0) + (team.draws || 0);
  const goalDifference = (team.goalsFor || 0) - (team.goalsAgainst || 0);

  return `
    <tr class="${
      isPlayoffSpot ? "bg-green-900 bg-opacity-30" : ""
    } hover:bg-primary transition-colors">
      <td class="px-4 py-3 text-sm text-center font-medium ${
        isPlayoffSpot ? "text-green-400" : "text-gray-300"
      }">${gamesPlayed}</td>
      <td class="px-4 py-3 text-sm font-medium text-white">${team.name}</td>
      <td class="px-4 py-3 text-sm text-center text-gray-300">${
        team.wins || 0
      }</td>
      <td class="px-4 py-3 text-sm text-center text-gray-300">${
        team.losses || 0
      }</td>
      <td class="px-4 py-3 text-sm text-center text-gray-300">${
        team.draws || 0
      }</td>
      <td class="px-4 py-3 text-sm text-center text-gray-300">${
        team.goalsFor || 0
      }:${team.goalsAgainst || 0}</td>
      <td class="px-4 py-3 text-sm text-center font-medium ${
        goalDifference > 0
          ? "text-green-400"
          : goalDifference < 0
          ? "text-red-400"
          : "text-gray-300"
      }">${goalDifference > 0 ? "+" : ""}${goalDifference}</td>
      <td class="px-4 py-3 text-sm text-center font-bold text-white">${
        team.points || 0
      }</td>
      <td class="px-4 py-3">
        <div class="flex justify-center space-x-1">
          ${renderTeamForm(team.form)}
        </div>
      </td>
    </tr>
  `;
}

function renderTeamForm(form = []) {
  if (!form.length) return '<span class="text-gray-500 text-xs">-</span>';
  const colorClasses = {
    W: "bg-green-600 text-white",
    L: "bg-red-600 text-white",
    D: "bg-yellow-500 text-gray-900",
  };
  return form
    .map(
      (r) =>
        `<span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
          colorClasses[r] || "bg-gray-700"
        }">${r}</span>`
    )
    .join("");
}
